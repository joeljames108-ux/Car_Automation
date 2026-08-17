// ============================================================================
// PHASE 59 — REFRIGERANT HEAT PUMP & CABIN HVAC THERMAL SOLVER
// ============================================================================
// Thermodynamic P-h vapor compression cycle for R1234yf & CO2 (R744),
// 4-way reversing valve, motor/inverter waste heat recovery, and COP optimization.
// ============================================================================

export type RefrigerantType = 'R1234yf_LOW_GWP' | 'R744_CO2_NATURAL';
export type HeatPumpOperatingMode = 'CABIN_COOLING_AC' | 'CABIN_HEATING_HEAT_PUMP' | 'BATTERY_CHILLING_EXTREME' | 'DEICING_DEFROST';

export interface HeatPumpCycleState {
  refrigerant: RefrigerantType;
  mode: HeatPumpOperatingMode;
  ambientAirTempC: number;
  evaporatingPressureBar: number;
  condensingPressureBar: number;
  compressorMassFlowKgS: number;
  compressorPowerConsumptionWatts: number;
  heatingThermalCapacityKw: number;
  coolingThermalCapacityKw: number;
  coefficientOfPerformanceCop: number;
  powertrainWasteHeatScavengedKw: number;
  cabinSupplyAirTempC: number;
}

export class RefrigerantHeatPumpCycleSolver {
  /**
   * Solves thermodynamic P-h refrigeration and heat pump equilibrium.
   */
  public static solveHeatPumpCycle(params: {
    refrigerant?: RefrigerantType;
    mode?: HeatPumpOperatingMode;
    ambientTempC?: number;
    targetCabinTempC?: number;
    availablePowertrainWasteHeatKw?: number;
    compressorSpeedRpm?: number;
  }): HeatPumpCycleState {
    const ref = params.refrigerant || 'R1234yf_LOW_GWP';
    const mode = params.mode || 'CABIN_HEATING_HEAT_PUMP';
    const tAmb = params.ambientTempC ?? -5.0; // Freezing winter condition
    const tTarget = params.targetCabinTempC || 21.5;
    const qWaste = params.availablePowertrainWasteHeatKw || 4.5;
    const rpm = params.compressorSpeedRpm || 4200;

    // 1. Thermodynamic Cycle Properties for R1234yf vs R744 (CO2 Transcritical)
    const isCo2 = ref === 'R744_CO2_NATURAL';

    // Evaporating & Condensing Pressures
    const pEvapBar = isCo2 ? 35.0 : Math.max(2.1, 3.2 + (tAmb / 40));
    const pCondBar = isCo2 ? 92.0 : (mode === 'CABIN_HEATING_HEAT_PUMP' ? 16.5 : 12.0);

    // 2. Enthalpies at 4 Cardinal Cycle Nodes (kJ/kg)
    // h1: Evaporator outlet (vapor)
    // h2: Compressor discharge (superheated vapor)
    // h3: Condenser outlet (subcooled liquid)
    // h4: Expansion valve outlet (liquid/vapor mixture, h4 = h3)
    const h1 = isCo2 ? 425 : 365;
    const isentropicEfficiency = 0.72;
    const deltaHIsentropic = isCo2 ? 65 : 45;
    const deltaHActual = deltaHIsentropic / isentropicEfficiency;
    const h2 = h1 + deltaHActual;
    const h3 = isCo2 ? 240 : 220;
    const h4 = h3; // Isenthalpic expansion

    // 3. Compressor Displacement & Mass Flow: m_dot = V_disp * rpm * rho_suc * eta_vol
    const displacementCc = 32.0; // 32cc electric scroll compressor
    const rhoSuctionKgM3 = isCo2 ? 65.0 : 18.5;
    const etaVol = 0.85;
    const massFlowKgS = (displacementCc * 1e-6 * (rpm / 60) * rhoSuctionKgM3 * etaVol);

    // 4. Power & Thermal Capacities
    // W_comp = m_dot * (h2 - h1)
    const wCompKw = massFlowKgS * (h2 - h1);
    const wCompWatts = wCompKw * 1000;

    // Q_cond (Heating) = m_dot * (h2 - h3) + scavenged waste heat
    let qHeatKw = massFlowKgS * (h2 - h3);
    if (mode === 'CABIN_HEATING_HEAT_PUMP') {
      qHeatKw += qWaste * 0.75; // 75% waste heat recovery from inverter/motor
    }

    // Q_evap (Cooling) = m_dot * (h1 - h4)
    const qCoolKw = massFlowKgS * (h1 - h4);

    // 5. Coefficient of Performance (COP)
    const cop = mode === 'CABIN_HEATING_HEAT_PUMP' ? qHeatKw / Math.max(0.1, wCompKw) : qCoolKw / Math.max(0.1, wCompKw);

    // 6. Cabin Supply Air Temperature
    const cabinSupplyTemp = mode === 'CABIN_HEATING_HEAT_PUMP' ? Math.min(48.0, tAmb + (qHeatKw * 4.5)) : Math.max(4.0, tAmb - (qCoolKw * 3.8));

    return {
      refrigerant: ref,
      mode,
      ambientAirTempC: tAmb,
      evaporatingPressureBar: Math.round(pEvapBar * 10) / 10,
      condensingPressureBar: Math.round(pCondBar * 10) / 10,
      compressorMassFlowKgS: Math.round(massFlowKgS * 1000) / 1000,
      compressorPowerConsumptionWatts: Math.round(wCompWatts),
      heatingThermalCapacityKw: Math.round(qHeatKw * 10) / 10,
      coolingThermalCapacityKw: Math.round(qCoolKw * 10) / 10,
      coefficientOfPerformanceCop: Math.round(cop * 100) / 100,
      powertrainWasteHeatScavengedKw: mode === 'CABIN_HEATING_HEAT_PUMP' ? Math.round(qWaste * 0.75 * 10) / 10 : 0,
      cabinSupplyAirTempC: Math.round(cabinSupplyTemp * 10) / 10,
    };
  }
}
