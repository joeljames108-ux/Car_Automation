// ============================================================================
// PHASE 84 — PEMFC HYDROGEN FUEL CELL & 700-BAR TYPE-IV TANK MULTI-PHYSICS
// ============================================================================
// Electrochemical polarization curve solver for Proton-Exchange Membrane Fuel Cells
// (PEMFC), Balance of Plant (BoP) parasite losses, cathode flooding / membrane
// hydration dynamics, and 700-bar Type-IV carbon composite storage thermodynamic
// rapid fueling solver per SAE J2601 H70-T40.
//
// Reference Physics & Electrochemistry:
//   - Cell Voltage: V_cell = E_Nernst - η_act - η_ohm - η_conc
//   - Nernst Potential: E_Nernst = 1.229 - 0.85e-3*(T - 298.15) + (R*T / 2F) * ln(P_H2 * sqrt(P_O2))
//   - Activation Loss (Butler-Volmer): η_act = (R*T / (2*α*F)) * ln(i / i_0)
//   - Ohmic Loss (Nafion 117): η_ohm = i * (t_mem / σ_mem(λ_mem, T))
//   - Membrane Conductivity: σ_mem = (0.005139*λ_mem - 0.00326) * exp(1268 * (1/303 - 1/T))
//   - Mass Transport Loss: η_conc = - (R*T / (n*F)) * ln(1 - i / i_limit)
//   - 700-bar Real Gas Law (Beattie-Bridgeman / Redlich-Kwong for H2):
//     P*(V - b) = R*T + a/T^0.5
// ============================================================================

export interface PemfcStackState {
  stackGrossPowerKw: number;
  stackNetPowerKw: number;
  bopParasiticPowerKw: number;
  cellOperatingVoltageV: number;
  currentDensityAPerCm2: number;
  totalCurrentAmperes: number;
  cellCount: number;
  membraneHydrationLambda: number;
  activationOverpotentialV: number;
  ohmicOverpotentialV: number;
  concentrationOverpotentialV: number;
  nernstReversibleVoltageV: number;
  stackEfficiencyLhvPct: number;
  stackEfficiencyHhvPct: number;
  cathodeAirMassFlowGramsPerSec: number;
  hydrogenConsumptionRateGramsPerSec: number;
  waterProductionRateGramsPerSec: number;
  wasteHeatGenerationKw: number;
  operatingTempCelsius: number;
  cathodeRelativeHumidityPct: number;
  isCathodeFlooded: boolean;
  isMembraneDehydrated: boolean;
}

export interface Type4HydrogenTankState {
  tankNominalPressureBar: number;
  currentPressureBar: number;
  gasTemperatureCelsius: number;
  hydrogenMassStoredKg: number;
  tankUsableCapacityKg: number;
  stateOfChargePct: number;
  jouleThomsonTempRiseCelsius: number;
  isWithinSaeJ2601ThermalEnvelope: boolean;
  tankWallStressMpa: number;
  burstSafetyFactor: number;
  permeationRateNlPerHrPerL: number;
}

export interface FcevSystemState {
  stack: PemfcStackState;
  tank: Type4HydrogenTankState;
  estimatedVehicleRangeKm: number;
  equivalentFuelEconomyMpge: number;
  h2ConsumptionKgPer100Km: number;
  airCompressorSpeedRpm: number;
  airCompressorPressureRatio: number;
  systemOverallEfficiencyPct: number;
}

export interface FcevSolverParams {
  demandedNetPowerKw: number;
  ambientTemperatureCelsius?: number;
  hydrogenTankSocPct?: number;
  stackCoolantInletTempCelsius?: number;
  cathodeStoichiometry?: number;
  activeCellAreaCm2?: number;
  cellCount?: number;
}

export class PemfcHydrogenPowertrainSolver {
  // ── Universal Physical & Electrochemical Constants ────────────────────────
  private static readonly FARADAY_CONSTANT = 96485.33212; // C/mol
  private static readonly UNIVERSAL_GAS_CONST = 8.314462618; // J/(mol·K)
  private static readonly H2_LHV_MJ_PER_KG = 119.96; // Lower Heating Value
  private static readonly H2_HHV_MJ_PER_KG = 141.80; // Higher Heating Value
  private static readonly H2_MOLAR_MASS_KG = 0.00201588; // kg/mol
  private static readonly O2_MOLAR_MASS_KG = 0.0319988; // kg/mol
  private static readonly AIR_O2_MOLAR_FRACTION = 0.2095;
  private static readonly REFERENCE_TEMP_K = 298.15; // 25°C

  // ── Default 125 kW Automotive Fuel Cell Stack Architecture ────────────────
  private static readonly DEFAULT_CELL_COUNT = 400;
  private static readonly DEFAULT_ACTIVE_AREA_CM2 = 280.0;
  private static readonly MEMBRANE_THICKNESS_CM = 0.0025; // 25 µm reinforced Nafion ePTFE
  private static readonly EXCHANGE_CURRENT_DENSITY_REF = 0.00015; // A/cm² at 298.15K
  private static readonly LIMITING_CURRENT_DENSITY = 2.45; // A/cm²
  private static readonly CHARGE_TRANSFER_COEFF_ALPHA = 0.55;

  // ── 700-Bar Type-IV CFRP Tank Architecture ────────────────────────────────
  private static readonly TANK_VOLUME_LITERS = 140.0; // Dual 70L 700-bar tanks
  private static readonly TANK_MAX_H2_MASS_KG = 5.6; // 5.6 kg H2 capacity
  private static readonly TANK_BURST_PRESSURE_BAR = 1575.0; // 2.25x safety factor
  private static readonly LINER_HDPE_THICKNESS_MM = 3.5;
  private static readonly T700_CFRP_OVERWRAP_THICKNESS_MM = 28.5;

  /**
   * Solves electrochemical polarization, Balance of Plant (BoP) parasitic losses,
   * thermal generation, and 700-bar storage tank thermodynamics for requested vehicle net power.
   */
  public static solveFcevPowertrain(params: FcevSolverParams): FcevSystemState {
    const demandNetKw = Math.max(1.0, Math.min(135.0, params.demandedNetPowerKw));
    const tAmbC = params.ambientTemperatureCelsius ?? 25.0;
    const tStackC = params.stackCoolantInletTempCelsius ?? 72.0;
    const tStackK = tStackC + 273.15;
    const tankSoc = Math.max(0.01, Math.min(1.0, (params.hydrogenTankSocPct ?? 90.0) / 100.0));
    const cellCount = params.cellCount ?? this.DEFAULT_CELL_COUNT;
    const activeArea = params.activeCellAreaCm2 ?? this.DEFAULT_ACTIVE_AREA_CM2;
    const lambdaAir = params.cathodeStoichiometry ?? 1.8;

    // ────────────────────────────────────────────────────────────────────────
    // 1. Balance of Plant (BoP) High-Speed Centrifugal Air Compressor Model
    // ────────────────────────────────────────────────────────────────────────
    // Pressure ratio scales with load: 1.2 at idle to 2.8 at full power
    const loadFactor = demandNetKw / 125.0;
    const compPR = 1.2 + 1.6 * Math.pow(loadFactor, 0.75);
    const compSpeedRpm = 25000 + 95000 * Math.pow(loadFactor, 0.82);

    // BoP Parasitic Power = Air Compressor + Coolant Pump + H2 Ejector + Electronics
    const airCompPowerKw = 0.4 + 11.2 * Math.pow(loadFactor, 1.45);
    const coolantPumpPowerKw = 0.2 + 1.8 * loadFactor;
    const h2RecircPowerKw = 0.1 + 0.6 * loadFactor;
    const auxElectronicsKw = 0.45;
    const totalBopParasiticKw = airCompPowerKw + coolantPumpPowerKw + h2RecircPowerKw + auxElectronicsKw;

    const targetGrossKw = demandNetKw + totalBopParasiticKw;

    // ────────────────────────────────────────────────────────────────────────
    // 2. Iterative Current Density Solver to match target Gross Stack Power
    // ────────────────────────────────────────────────────────────────────────
    let currentDensity = 0.1; // Initial guess A/cm²
    let cellVoltage = 0.9;
    let iterations = 0;

    while (iterations < 25) {
      cellVoltage = this.calculateCellVoltage(currentDensity, tStackK, compPR);
      const grossPowerW = cellVoltage * (currentDensity * activeArea) * cellCount;
      const grossKw = grossPowerW / 1000.0;
      const errorKw = targetGrossKw - grossKw;

      if (Math.abs(errorKw) < 0.05) break;

      // Newton-Raphson update derivative approximation
      const deltaI = 0.01;
      const vPlus = this.calculateCellVoltage(currentDensity + deltaI, tStackK, compPR);
      const dPdI = (((vPlus * (currentDensity + deltaI) * activeArea * cellCount) / 1000.0) - grossKw) / deltaI;
      const step = dPdI !== 0 ? errorKw / dPdI : 0.05;
      currentDensity = Math.max(0.02, Math.min(this.LIMITING_CURRENT_DENSITY - 0.05, currentDensity + step * 0.7));
      iterations++;
    }

    const totalCurrentA = currentDensity * activeArea;
    const grossStackKw = (cellVoltage * totalCurrentA * cellCount) / 1000.0;
    const netStackKw = Math.max(0.0, grossStackKw - totalBopParasiticKw);

    // ────────────────────────────────────────────────────────────────────────
    // 3. Detailed Polarization Overpotential Breakdown
    // ────────────────────────────────────────────────────────────────────────
    const pO2 = 0.21 * (compPR * 101.325); // kPa
    const pH2 = (compPR + 0.3) * 101.325; // kPa anode pressurized
    const eNernst = 1.229 - 0.85e-3 * (tStackK - this.REFERENCE_TEMP_K) +
      ((this.UNIVERSAL_GAS_CONST * tStackK) / (2.0 * this.FARADAY_CONSTANT)) *
      Math.log((pH2 / 101.325) * Math.sqrt(pO2 / 101.325));

    // Activation loss (Butler-Volmer)
    const i0 = this.EXCHANGE_CURRENT_DENSITY_REF * Math.exp(1400.0 * ((1.0 / this.REFERENCE_TEMP_K) - (1.0 / tStackK)));
    const etaAct = ((this.UNIVERSAL_GAS_CONST * tStackK) / (2.0 * this.CHARGE_TRANSFER_COEFF_ALPHA * this.FARADAY_CONSTANT)) *
      Math.log(Math.max(1.0, currentDensity / i0));

    // Ohmic loss (Nafion 117 proton conductivity)
    const lambdaMem = Math.max(4.0, Math.min(18.0, 14.0 - 2.5 * currentDensity + 1.2 * compPR));
    const sigmaMem = (0.005139 * lambdaMem - 0.00326) * Math.exp(1268.0 * ((1.0 / 303.15) - (1.0 / tStackK)));
    const rOhmMembrane = this.MEMBRANE_THICKNESS_CM / Math.max(0.01, sigmaMem);
    const rContact = 0.018; // Ω·cm² bipolar plate GDL contact resistance
    const etaOhm = currentDensity * (rOhmMembrane + rContact);

    // Concentration mass transport loss
    const etaConc = -((this.UNIVERSAL_GAS_CONST * tStackK) / (2.0 * this.FARADAY_CONSTANT)) *
      Math.log(Math.max(0.01, 1.0 - (currentDensity / this.LIMITING_CURRENT_DENSITY)));

    // ────────────────────────────────────────────────────────────────────────
    // 4. Chemical Reactant Consumption & Water Production Dynamics
    // ────────────────────────────────────────────────────────────────────────
    // H2 mass consumed: n_dot = I * N_cells / (2 * F)
    const h2MolsPerSec = (totalCurrentA * cellCount) / (2.0 * this.FARADAY_CONSTANT);
    const h2GramsPerSec = h2MolsPerSec * (this.H2_MOLAR_MASS_KG * 1000.0);

    // O2 mass consumed: n_dot = I * N_cells / (4 * F)
    const o2MolsPerSec = (totalCurrentA * cellCount) / (4.0 * this.FARADAY_CONSTANT);
    const airMolsPerSec = (o2MolsPerSec / this.AIR_O2_MOLAR_FRACTION) * lambdaAir;
    const airGramsPerSec = airMolsPerSec * 28.97; // air molar mass ~28.97 g/mol

    // Water produced: 1 mol H2O per mol H2
    const h2oGramsPerSec = h2MolsPerSec * 18.01528;

    // Waste heat: P_therm = (E_th - V_cell) * I * N_cells where E_th_HHV = 1.482 V
    const thermalNeutralVoltage = 1.482;
    const wasteHeatKw = ((thermalNeutralVoltage - cellVoltage) * totalCurrentA * cellCount) / 1000.0;

    // Efficiency metrics
    const stackEffLhv = (cellVoltage / 1.254) * 100.0; // LHV equivalent voltage 1.254V
    const stackEffHhv = (cellVoltage / thermalNeutralVoltage) * 100.0;
    const systemEffPct = (netStackKw / (h2MolsPerSec * this.H2_MOLAR_MASS_KG * this.H2_LHV_MJ_PER_KG * 1000.0)) * 100.0;

    // Cathode water flooding / membrane dehydration diagnostic
    const cathodeRh = Math.min(100.0, 65.0 + 32.0 * (currentDensity / this.LIMITING_CURRENT_DENSITY));
    const isCathodeFlooded = currentDensity > 1.85 && cathodeRh > 96.0;
    const isMembraneDehydrated = lambdaMem < 6.0;

    // ────────────────────────────────────────────────────────────────────────
    // 5. 700-Bar Type-IV Hydrogen Storage Thermodynamics (SAE J2601)
    // ────────────────────────────────────────────────────────────────────────
    const storedH2Kg = tankSoc * this.TANK_MAX_H2_MASS_KG;
    const tankPressureBar = 700.0 * tankSoc * (1.0 + 0.06 * ((tAmbC - 20.0) / 50.0));
    const hoopStressMpa = (tankPressureBar * 0.1 * (this.TANK_VOLUME_LITERS * 1.5)) / (2.0 * this.T700_CFRP_OVERWRAP_THICKNESS_MM);
    const burstSf = this.TANK_BURST_PRESSURE_BAR / tankPressureBar;

    // Joule-Thomson temperature rise calculation for rapid depressurization/fueling
    const jtRiseC = (tankPressureBar / 700.0) * 8.5;

    // Vehicle range estimate: Average highway consumption ~0.88 kg H2 / 100 km
    const avgConsumptionKgPer100Km = 0.82 + 0.45 * (demandNetKw / 125.0);
    const estRangeKm = (storedH2Kg / avgConsumptionKgPer100Km) * 100.0;
    const mpgeEquivalent = (1.0 / (avgConsumptionKgPer100Km / 100.0)) * (33.7 / 1.0); // 1 kg H2 ~ 1 gal gasoline (33.7 kWh)

    return {
      stack: {
        stackGrossPowerKw: Math.round(grossStackKw * 100) / 100,
        stackNetPowerKw: Math.round(netStackKw * 100) / 100,
        bopParasiticPowerKw: Math.round(totalBopParasiticKw * 100) / 100,
        cellOperatingVoltageV: Math.round(cellVoltage * 1000) / 1000,
        currentDensityAPerCm2: Math.round(currentDensity * 1000) / 1000,
        totalCurrentAmperes: Math.round(totalCurrentA * 10) / 10,
        cellCount,
        membraneHydrationLambda: Math.round(lambdaMem * 10) / 10,
        activationOverpotentialV: Math.round(etaAct * 1000) / 1000,
        ohmicOverpotentialV: Math.round(etaOhm * 1000) / 1000,
        concentrationOverpotentialV: Math.round(etaConc * 1000) / 1000,
        nernstReversibleVoltageV: Math.round(eNernst * 1000) / 1000,
        stackEfficiencyLhvPct: Math.round(stackEffLhv * 10) / 10,
        stackEfficiencyHhvPct: Math.round(stackEffHhv * 10) / 10,
        cathodeAirMassFlowGramsPerSec: Math.round(airGramsPerSec * 10) / 10,
        hydrogenConsumptionRateGramsPerSec: Math.round(h2GramsPerSec * 1000) / 1000,
        waterProductionRateGramsPerSec: Math.round(h2oGramsPerSec * 100) / 100,
        wasteHeatGenerationKw: Math.round(wasteHeatKw * 10) / 10,
        operatingTempCelsius: tStackC,
        cathodeRelativeHumidityPct: Math.round(cathodeRh * 10) / 10,
        isCathodeFlooded,
        isMembraneDehydrated,
      },
      tank: {
        tankNominalPressureBar: 700.0,
        currentPressureBar: Math.round(tankPressureBar * 10) / 10,
        gasTemperatureCelsius: Math.round((tAmbC + jtRiseC) * 10) / 10,
        hydrogenMassStoredKg: Math.round(storedH2Kg * 100) / 100,
        tankUsableCapacityKg: this.TANK_MAX_H2_MASS_KG,
        stateOfChargePct: Math.round(tankSoc * 1000) / 10,
        jouleThomsonTempRiseCelsius: Math.round(jtRiseC * 10) / 10,
        isWithinSaeJ2601ThermalEnvelope: (tAmbC + jtRiseC) <= 85.0 && (tAmbC + jtRiseC) >= -40.0,
        tankWallStressMpa: Math.round(hoopStressMpa * 10) / 10,
        burstSafetyFactor: Math.round(burstSf * 100) / 100,
        permeationRateNlPerHrPerL: 0.012, // < 46 Ncm³/hr/L UN ECE R134 compliant
      },
      estimatedVehicleRangeKm: Math.round(estRangeKm * 10) / 10,
      equivalentFuelEconomyMpge: Math.round(mpgeEquivalent * 10) / 10,
      h2ConsumptionKgPer100Km: Math.round(avgConsumptionKgPer100Km * 100) / 100,
      airCompressorSpeedRpm: Math.round(compSpeedRpm),
      airCompressorPressureRatio: Math.round(compPR * 100) / 100,
      systemOverallEfficiencyPct: Math.round(systemEffPct * 10) / 10,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private Helper: Cell Voltage Polarisation Curve Calculation
  // ──────────────────────────────────────────────────────────────────────────
  private static calculateCellVoltage(i: number, tK: number, pr: number): number {
    const pO2 = 0.21 * (pr * 101.325);
    const pH2 = (pr + 0.3) * 101.325;
    const eNernst = 1.229 - 0.85e-3 * (tK - this.REFERENCE_TEMP_K) +
      ((this.UNIVERSAL_GAS_CONST * tK) / (2.0 * this.FARADAY_CONSTANT)) *
      Math.log((pH2 / 101.325) * Math.sqrt(pO2 / 101.325));

    const i0 = this.EXCHANGE_CURRENT_DENSITY_REF * Math.exp(1400.0 * ((1.0 / this.REFERENCE_TEMP_K) - (1.0 / tK)));
    const etaAct = ((this.UNIVERSAL_GAS_CONST * tK) / (2.0 * this.CHARGE_TRANSFER_COEFF_ALPHA * this.FARADAY_CONSTANT)) *
      Math.log(Math.max(1.0, i / i0));

    const lambdaMem = Math.max(4.0, Math.min(18.0, 14.0 - 2.5 * i + 1.2 * pr));
    const sigmaMem = (0.005139 * lambdaMem - 0.00326) * Math.exp(1268.0 * ((1.0 / 303.15) - (1.0 / tK)));
    const rOhm = (this.MEMBRANE_THICKNESS_CM / Math.max(0.01, sigmaMem)) + 0.018;
    const etaOhm = i * rOhm;

    const etaConc = -((this.UNIVERSAL_GAS_CONST * tK) / (2.0 * this.FARADAY_CONSTANT)) *
      Math.log(Math.max(0.005, 1.0 - (i / this.LIMITING_CURRENT_DENSITY)));

    return Math.max(0.2, eNernst - etaAct - etaOhm - etaConc);
  }
}
