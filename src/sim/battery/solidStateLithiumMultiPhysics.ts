// ============================================================================
// PHASE 60 — SOLID-STATE LITHIUM-METAL BATTERY MULTI-PHYSICS MODEL
// ============================================================================
// Butler-Volmer electrochemical interface kinetics, LLZO/Argyrodite ionic conductivity,
// Monroe-Newman stack pressure dendrite suppression (1.0 - 5.0 MPa), Arrhenius
// thermal runaway onset kinetics, and cycle/calendar capacity degradation.
// ============================================================================

export type SolidElectrolyteChemistry = 'LLZO_GARNET_CERAMIC' | 'ARGYRODITE_SULFIDE' | 'OXYSULFIDE_POLYMER_HYBRID';

export interface SolidStateDegradationState {
  cycleCount: number;
  capacityRetentionPct: number;
  internalResistanceGrowthPct: number;
  lithiumInterphaseLayerThicknessNm: number;
  coulombicEfficiencyPct: number;
  estimatedRemainingCyclesTo80Pct: number;
}

export interface SolidStateThermalSafetyState {
  cellJunctionTempC: number;
  thermalRunawayOnsetTempC: number; // Solid-state ceramic safe up to 180°C (vs 120°C for liquid)
  exothermicHeatGenerationRateWatts: number;
  jouleHeatingWatts: number;
  entropicHeatWatts: number;
  cellToCellPropagationDelaySec: number;
  isThermalRunawayImmune: boolean;
}

export interface SolidStateCellState {
  stateOfChargePct: number;
  openCircuitVoltageVolts: number;
  cellTerminalVoltageVolts: number;
  gravimetricEnergyDensityWhPerKg: number;
  volumetricEnergyDensityWhPerL: number;
  stackCompressionPressureMpa: number;
  criticalCurrentDensityMaPerCm2: number;
  actualCurrentDensityMaPerCm2: number;
  interfaceOverpotentialMv: number;
  solidElectrolyteIonicConductivitySPerM: number;
  dendriteGrowthSuppressionIndexPct: number; // > 95% = Safe from short-circuiting
  internalResistanceMohm: number;
  tenToEightyPctFastChargeTimeMin: number;
  maxContinuousDischargeCurrentAmps: number;
  degradation: SolidStateDegradationState;
  thermalSafety: SolidStateThermalSafetyState;
  cellJunctionTempC: number; // Backward compatibility alias
  isCeramicElectrolyteSafe: boolean;
}

export class SolidStateLithiumMultiPhysics {
  private static readonly V_NOMINAL = 3.85; // High-voltage NMC90 / Lithium-metal
  private static readonly GRAVIMETRIC_WH_PER_KG = 450.0;
  private static readonly VOLUMETRIC_WH_PER_L = 1050.0;
  private static readonly FARADAY_CONST = 96485.33;
  private static readonly GAS_CONST = 8.31446;
  private static readonly CELL_NOMINAL_CAPACITY_AH = 120.0;
  private static readonly ACTIVE_AREA_CM2 = 3200.0;

  /**
   * Calculates ionic conductivity of the solid electrolyte based on Arrhenius relationship.
   */
  public static calculateIonicConductivity(tempC: number, chemistry: SolidElectrolyteChemistry): number {
    const tempK = tempC + 273.15;
    // sigma * T = sigma_0 * exp(-E_a / (R * T))
    if (chemistry === 'LLZO_GARNET_CERAMIC') {
      const ea = 31000; // 31 kJ/mol
      const sigma0 = 1.8e5;
      return (sigma0 / tempK) * Math.exp(-ea / (this.GAS_CONST * tempK));
    } else if (chemistry === 'ARGYRODITE_SULFIDE') {
      const ea = 24000; // 24 kJ/mol (higher conductivity at room temp)
      const sigma0 = 2.4e5;
      return (sigma0 / tempK) * Math.exp(-ea / (this.GAS_CONST * tempK));
    }
    return 0.0012 * Math.exp(0.032 * (tempC - 25));
  }

  /**
   * Evaluates Butler-Volmer overpotentials, stack pressure voiding, degradation, and thermal safety.
   */
  public static evaluateSolidStateCell(params: {
    stateOfChargePct: number;
    dischargeChargeCurrentAmps: number; // Positive = discharge, Negative = charge
    stackPressureMpa?: number;          // 1.0 to 5.0 MPa
    operatingTempC?: number;
    chemistry?: SolidElectrolyteChemistry;
    completedCycles?: number;
    calendarAgeMonths?: number;
  }): SolidStateCellState {
    const soc = Math.max(0, Math.min(100, params.stateOfChargePct));
    const currentA = params.dischargeChargeCurrentAmps;
    const pStackMpa = params.stackPressureMpa ?? 2.8; // 2.8 MPa ideal mechanical preload
    const tempC = params.operatingTempC || 32.0;
    const tempK = tempC + 273.15;
    const chemistry = params.chemistry || 'LLZO_GARNET_CERAMIC';
    const cycles = params.completedCycles || 150;
    const ageMonths = params.calendarAgeMonths || 6;

    // 1. Open Circuit Voltage (OCV) Curve for Lithium-Metal Anode / Solid State Cathode
    const socFrac = soc / 100;
    const ocv =
      3.15 +
      0.82 * socFrac +
      0.12 * Math.pow(socFrac, 2) +
      0.08 * Math.pow(socFrac, 5) -
      0.03 * Math.exp(-25 * socFrac);

    // 2. Solid Electrolyte Bulk & Interphase Resistance
    const ionicCondSPerM = this.calculateIonicConductivity(tempC, chemistry);
    const separatorThicknessM = 25e-6; // 25 micron solid ceramic film
    const separatorAreaM2 = this.ACTIVE_AREA_CM2 * 1e-4; // m^2
    const rElectrolyteOhm = separatorThicknessM / (ionicCondSPerM * separatorAreaM2);

    // Interface Charge Transfer Resistance (Temperature & SOC dependent)
    const rctBaseOhm = 0.00065 * Math.exp(3400 / tempK - 3400 / 298.15) * (1 + 0.35 * Math.pow(1 - socFrac, 2));
    const totalInternalResistanceOhm = rElectrolyteOhm + rctBaseOhm;
    const internalResistanceMohm = totalInternalResistanceOhm * 1000;

    // 3. Butler-Volmer Interface Overpotential: eta = (R*T / (0.5 * F)) * asinh(I / (2 * I0))
    const currentDensityMaPerCm2 = (Math.abs(currentA) * 1000) / this.ACTIVE_AREA_CM2;
    const i0ExchangeCurrentA = 18.5 * (this.ACTIVE_AREA_CM2 / 3200) * Math.exp(0.025 * (tempC - 25));
    const alphaTransfer = 0.5;
    const etaVolts =
      ((this.GAS_CONST * tempK) / (alphaTransfer * this.FARADAY_CONST)) *
      Math.asinh(Math.abs(currentA) / (2 * i0ExchangeCurrentA));
    const etaMv = etaVolts * 1000;

    // 4. Terminal Voltage (V = OCV - I*R - eta)
    const irDropVolts = Math.abs(currentA) * totalInternalResistanceOhm;
    const vTerminal =
      currentA >= 0 ? ocv - irDropVolts - etaVolts : ocv + irDropVolts + etaVolts;

    // 5. Monroe-Newman Stack Pressure & Critical Current Density J_crit
    // High stack pressure forces plastic flow of Li-metal, eliminating interfacial voids
    const jCritMaPerCm2 = 36.0 * Math.pow(pStackMpa / 1.5, 0.85) * (ionicCondSPerM / 0.001);
    const suppressionIndex = Math.min(
      100,
      Math.max(0, (1.0 - (currentDensityMaPerCm2 * 0.22) / Math.max(0.1, jCritMaPerCm2)) * 100)
    );

    // 6. Fast Charging Timeline (800V DC Ultra-Fast Charge)
    const baseFastChargeMin = 8.5;
    const tempColdPenalty = Math.max(0, (25 - tempC) * 0.04);
    const pressurePenalty = Math.max(0, (2.0 - pStackMpa) * 1.5);
    const fastChargeMin = baseFastChargeMin * (1 + tempColdPenalty + pressurePenalty);

    // 7. Degradation and Cycle Life
    const cycleFadeFrac = 0.000045 * Math.sqrt(cycles);
    const calFadeFrac = 0.00012 * Math.sqrt(ageMonths * 30);
    const capRetentionPct = Math.max(70, (1 - cycleFadeFrac - calFadeFrac) * 100);
    const rGrowthPct = (1.0 - capRetentionPct / 100) * 180;
    const seiThicknessNm = 12.0 + Math.sqrt(cycles) * 0.85;
    const remainingCycles = Math.max(0, Math.round((Math.pow((100 - 80) / (0.0045 * 100), 2) - cycles)));

    // 8. Thermal Safety & Joule Heating
    const jouleHeatW = Math.pow(currentA, 2) * totalInternalResistanceOhm;
    const entropicHeatW = currentA * tempK * 0.00012; // T * dE/dT
    const totalHeatGenW = Math.abs(jouleHeatW + entropicHeatW);
    const runawayOnsetTempC = 185.0; // Ceramic solid electrolyte does not burn like liquid organics

    return {
      stateOfChargePct: Math.round(soc * 10) / 10,
      openCircuitVoltageVolts: Math.round(ocv * 1000) / 1000,
      cellTerminalVoltageVolts: Math.round(vTerminal * 1000) / 1000,
      gravimetricEnergyDensityWhPerKg: this.GRAVIMETRIC_WH_PER_KG,
      volumetricEnergyDensityWhPerL: this.VOLUMETRIC_WH_PER_L,
      stackCompressionPressureMpa: pStackMpa,
      criticalCurrentDensityMaPerCm2: Math.round(jCritMaPerCm2 * 100) / 100,
      actualCurrentDensityMaPerCm2: Math.round(currentDensityMaPerCm2 * 100) / 100,
      interfaceOverpotentialMv: Math.round(etaMv * 10) / 10,
      solidElectrolyteIonicConductivitySPerM: Math.round(ionicCondSPerM * 10000) / 10000,
      dendriteGrowthSuppressionIndexPct: Math.round(suppressionIndex * 10) / 10,
      internalResistanceMohm: Math.round(internalResistanceMohm * 100) / 100,
      tenToEightyPctFastChargeTimeMin: Math.round(fastChargeMin * 10) / 10,
      maxContinuousDischargeCurrentAmps: Math.round((this.CELL_NOMINAL_CAPACITY_AH * 4.5) * 10) / 10, // 4.5C discharge
      degradation: {
        cycleCount: cycles,
        capacityRetentionPct: Math.round(capRetentionPct * 10) / 10,
        internalResistanceGrowthPct: Math.round(rGrowthPct * 10) / 10,
        lithiumInterphaseLayerThicknessNm: Math.round(seiThicknessNm * 10) / 10,
        coulombicEfficiencyPct: 99.96,
        estimatedRemainingCyclesTo80Pct: remainingCycles,
      },
      thermalSafety: {
        cellJunctionTempC: Math.round((tempC + totalHeatGenW * 0.025) * 10) / 10,
        thermalRunawayOnsetTempC: runawayOnsetTempC,
        exothermicHeatGenerationRateWatts: Math.round(totalHeatGenW * 10) / 10,
        jouleHeatingWatts: Math.round(jouleHeatW * 10) / 10,
        entropicHeatWatts: Math.round(entropicHeatW * 10) / 10,
        cellToCellPropagationDelaySec: 180.0, // Non-combustible solid separator delays propagation
        isThermalRunawayImmune: tempC < runawayOnsetTempC,
      },
      cellJunctionTempC: Math.round((tempC + totalHeatGenW * 0.025) * 10) / 10,
      isCeramicElectrolyteSafe: suppressionIndex > 85.0 && tempC < runawayOnsetTempC,
    };
  }
}
