// ============================================================================
// PHASE 59 — REFRIGERANT HEAT PUMP & CABIN HVAC THERMAL CYCLE SOLVER
// ============================================================================
// Thermodynamic vapor-compression cycle with low-GWP R-1234yf refrigerant.
// 4-way reversing valve for dual-mode cooling/heating, scroll compressor
// isentropic & volumetric efficiency maps, multi-source heat scavenging
// (ambient air, battery chiller, e-motor coolant), and COP calculation.
// ============================================================================

export type HeatPumpOperatingMode =
  | 'CABIN_HEATING_BATTERY_SCAVENGE'
  | 'CABIN_HEATING_HEAT_PUMP'
  | 'CABIN_COOLING_AC'
  | 'BATTERY_PRECONDITIONING_FAST_CHARGE'
  | 'DEHUMIDIFICATION_CABIN_WARM'
  | 'MAX_RANGE_ECO_DEFROST';

export type RefrigerantType = 'R1234yf_LOW_GWP' | 'R1234YF' | 'R134A' | 'R744_CO2' | 'R290_PROPANE';

export interface RefrigerantStatePoint {
  pointIndex: number;
  locationDescription: string;
  pressureBar: number;
  temperatureC: number;
  enthalpyKjPerKg: number;
  vaporQualityPct: number;
}

export interface RefrigerantHeatPumpCycleState {
  operatingMode: HeatPumpOperatingMode;
  ambientTempC: number;
  ambientAirTempC: number; // Backward compatibility alias
  cabinTargetTempC: number;
  cabinActualTempC: number;
  cabinSupplyAirTempC: number; // Backward compatibility alias
  compressorSpeedRpm: number;
  evaporatingPressureBar: number;
  condensingPressureBar: number;
  pressureRatio: number;
  evaporatingTempC: number;
  condensingTempC: number;
  superheatKelvin: number;
  subcoolingKelvin: number;
  compressorWorkSpecificKjPerKg: number;
  compressorPowerConsumptionKw: number;
  compressorPowerConsumptionWatts: number; // Backward compatibility alias
  heatingCapacityKw: number;
  heatingThermalCapacityKw: number; // Backward compatibility alias
  coolingCapacityKw: number;
  coefficientOfPerformanceCop: number;
  batteryWasteHeatScavengedKw: number;
  powertrainWasteHeatScavengedKw: number; // Backward compatibility alias
  cabinThermalEquilibriumTimeMin: number;
  cycleStatePoints: RefrigerantStatePoint[];
}

export class RefrigerantHeatPumpCycleSolver {
  private static readonly R1234YF_CRITICAL_PRESSURE_BAR = 33.82;
  private static readonly R1234YF_CRITICAL_TEMP_C = 94.7;

  /**
   * Alias for backward compatibility with existing tests and UI components.
   */
  public static solveHeatPumpCycle(params: {
    refrigerant?: string;
    mode: HeatPumpOperatingMode | string;
    ambientTempC: number;
    cabinTargetTempC?: number;
    compressorSpeedRpm?: number;
  }): RefrigerantHeatPumpCycleState {
    const validMode: HeatPumpOperatingMode = (params.mode === 'CABIN_HEATING_HEAT_PUMP'
      ? 'CABIN_HEATING_BATTERY_SCAVENGE'
      : params.mode) as HeatPumpOperatingMode;
    return this.evaluateHeatPumpCycle({
      mode: validMode,
      ambientTempC: params.ambientTempC,
      cabinTargetTempC: params.cabinTargetTempC,
      compressorSpeedRpm: params.compressorSpeedRpm,
    });
  }

  /**
   * Evaluates R-1234yf thermodynamic saturation temperature from pressure (Antoine-Clapeyron relation).
   */
  public static calculateSaturationTempC(pressureBar: number): number {
    const p = Math.max(1.0, Math.min(30.0, pressureBar));
    return -29.5 + 41.5 * Math.log10(p) + 8.2 * Math.pow(Math.log10(p), 2);
  }

  /**
   * Solves thermodynamic vapor-compression cycle, compressor electrical power, and heating/cooling COP.
   */
  public static evaluateHeatPumpCycle(params: {
    mode: HeatPumpOperatingMode;
    ambientTempC: number;
    cabinTargetTempC?: number;
    cabinActualTempC?: number;
    compressorSpeedRpm?: number;
    batteryWasteHeatAvailableKw?: number;
    powertrainWasteHeatAvailableKw?: number;
  }): RefrigerantHeatPumpCycleState {
    const mode = params.mode;
    const tAmbC = params.ambientTempC;
    const tTargetC = params.cabinTargetTempC ?? 21.5;
    const tActualC = params.cabinActualTempC ?? (mode.includes('HEATING') ? 4.0 : 32.0);
    const rpmComp = params.compressorSpeedRpm ?? 3600.0;
    const qBatteryKw = params.batteryWasteHeatAvailableKw ?? 1.85;
    const qPowertrainKw = params.powertrainWasteHeatAvailableKw ?? 2.4;

    let pEvapBar = 3.2;
    let pCondBar = 14.8;
    let superheatK = 5.0;
    let subcoolingK = 4.0;

    if (mode === 'CABIN_HEATING_BATTERY_SCAVENGE' || mode === 'CABIN_HEATING_HEAT_PUMP' || mode === 'MAX_RANGE_ECO_DEFROST') {
      pEvapBar = Math.max(2.2, 3.2 + (tAmbC + 10.0) * 0.06);
      pCondBar = 15.2;
    } else if (mode === 'CABIN_COOLING_AC') {
      pEvapBar = 3.6;
      pCondBar = Math.max(12.0, 11.5 + (tAmbC - 25.0) * 0.45);
    } else if (mode === 'BATTERY_PRECONDITIONING_FAST_CHARGE') {
      pEvapBar = 2.8;
      pCondBar = 16.5;
    }

    const tEvapC = this.calculateSaturationTempC(pEvapBar);
    const tCondC = this.calculateSaturationTempC(pCondBar);
    const pressureRatio = pCondBar / pEvapBar;

    const h1 = 370.0 + 0.85 * (tEvapC + superheatK);

    const etaIsentropic = Math.max(0.62, 0.82 - (pressureRatio - 2.5) * 0.035);
    const deltaHIsentropic = 38.5 * Math.pow(pressureRatio, 0.28);
    const deltaHReal = deltaHIsentropic / etaIsentropic;
    const h2 = h1 + deltaHReal;
    const tDischargeC = tCondC + 18.0 + (deltaHReal - deltaHIsentropic) * 0.75;

    const h3 = 210.0 + 1.25 * (tCondC - subcoolingK);
    const h4 = h3;
    const vaporQualityPct = Math.min(100, Math.max(0, ((h4 - 200.0) / (365.0 - 200.0)) * 100));

    const compDisplacementCc = 34.0;
    const etaVolumetric = Math.max(0.70, 0.94 - 0.045 * pressureRatio);
    const densitySuctionKgM3 = pEvapBar * 4.2;
    const massFlowKgSec = (compDisplacementCc * 1e-6 * (rpmComp / 60) * etaVolumetric) * densitySuctionKgM3;

    const wCompSpecificKjPerKg = h2 - h1;
    const pCompElectricalKw = (massFlowKgSec * wCompSpecificKjPerKg) / 0.92;

    const qCondenserKw = massFlowKgSec * (h2 - h3);
    const qEvaporatorKw = massFlowKgSec * (h1 - h4);

    const totalScavengedKw = (mode.includes('HEATING') ? qBatteryKw * 0.75 + qPowertrainKw * 0.65 : 0.0);
    const actualHeatingCapacityKw = qCondenserKw + totalScavengedKw;
    const actualCoolingCapacityKw = qEvaporatorKw;

    const copHeating = actualHeatingCapacityKw / Math.max(0.2, pCompElectricalKw);
    const copCooling = actualCoolingCapacityKw / Math.max(0.2, pCompElectricalKw);
    const activeCop = mode.includes('HEATING') ? Math.max(2.1, copHeating) : copCooling;

    const deltaTCabin = Math.abs(tTargetC - tActualC);
    const cabinAirThermalMassKjPerK = 18.5;
    const timeToEquilibriumMin = (deltaTCabin * cabinAirThermalMassKjPerK) / (Math.max(1.5, mode.includes('HEATING') ? actualHeatingCapacityKw : actualCoolingCapacityKw) * 60);

    const supplyAirTempC = mode.includes('HEATING') ? 38.5 : 12.0;

    const statePoints: RefrigerantStatePoint[] = [
      {
        pointIndex: 1,
        locationDescription: 'Compressor Suction Port (Superheated Vapor)',
        pressureBar: Math.round(pEvapBar * 10) / 10,
        temperatureC: Math.round((tEvapC + superheatK) * 10) / 10,
        enthalpyKjPerKg: Math.round(h1 * 10) / 10,
        vaporQualityPct: 100,
      },
      {
        pointIndex: 2,
        locationDescription: 'Compressor Discharge Port (Superheated High Pressure)',
        pressureBar: Math.round(pCondBar * 10) / 10,
        temperatureC: Math.round(tDischargeC * 10) / 10,
        enthalpyKjPerKg: Math.round(h2 * 10) / 10,
        vaporQualityPct: 100,
      },
      {
        pointIndex: 3,
        locationDescription: 'Condenser Outlet (Subcooled Liquid)',
        pressureBar: Math.round(pCondBar * 10) / 10,
        temperatureC: Math.round((tCondC - subcoolingK) * 10) / 10,
        enthalpyKjPerKg: Math.round(h3 * 10) / 10,
        vaporQualityPct: 0,
      },
      {
        pointIndex: 4,
        locationDescription: 'TXV Expansion Valve Outlet (Two-Phase Liquid/Vapor Mixture)',
        pressureBar: Math.round(pEvapBar * 10) / 10,
        temperatureC: Math.round(tEvapC * 10) / 10,
        enthalpyKjPerKg: Math.round(h4 * 10) / 10,
        vaporQualityPct: Math.round(vaporQualityPct * 10) / 10,
      },
    ];

    return {
      operatingMode: mode,
      ambientTempC: tAmbC,
      ambientAirTempC: tAmbC,
      cabinTargetTempC: tTargetC,
      cabinActualTempC: tActualC,
      cabinSupplyAirTempC: supplyAirTempC,
      compressorSpeedRpm: rpmComp,
      evaporatingPressureBar: Math.round(pEvapBar * 10) / 10,
      condensingPressureBar: Math.round(pCondBar * 10) / 10,
      pressureRatio: Math.round(pressureRatio * 100) / 100,
      evaporatingTempC: Math.round(tEvapC * 10) / 10,
      condensingTempC: Math.round(tCondC * 10) / 10,
      superheatKelvin: superheatK,
      subcoolingKelvin: subcoolingK,
      compressorWorkSpecificKjPerKg: Math.round(wCompSpecificKjPerKg * 10) / 10,
      compressorPowerConsumptionKw: Math.round(pCompElectricalKw * 100) / 100,
      compressorPowerConsumptionWatts: Math.round(pCompElectricalKw * 1000),
      heatingCapacityKw: Math.round(actualHeatingCapacityKw * 10) / 10,
      heatingThermalCapacityKw: Math.round(actualHeatingCapacityKw * 10) / 10,
      coolingCapacityKw: Math.round(actualCoolingCapacityKw * 10) / 10,
      coefficientOfPerformanceCop: Math.round(activeCop * 100) / 100,
      batteryWasteHeatScavengedKw: Math.round(totalScavengedKw * 10) / 10,
      powertrainWasteHeatScavengedKw: Math.round(totalScavengedKw * 10) / 10,
      cabinThermalEquilibriumTimeMin: Math.round(timeToEquilibriumMin * 10) / 10,
      cycleStatePoints: statePoints,
    };
  }
}
