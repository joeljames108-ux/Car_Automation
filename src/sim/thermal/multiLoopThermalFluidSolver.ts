// ============================================================================
// PHASE 51 — MULTI-LOOP THERMAL FLUID & HEAT EXCHANGER SOLVER
// ============================================================================
// Decoupled 3-loop automotive thermal network: High-Temp ICE (95°C),
// Medium-Temp Inverter/Motor (55°C), and Low-Temp Chilled Battery (25°C).
// ============================================================================

export interface ThermalCoolingLoopState {
  loopName: string;
  inletTempC: number;
  outletTempC: number;
  flowRateLpm: number;
  heatLoadKw: number;
  pumpPowerWatts: number;
  radiatorHeatRejectionKw: number;
}

export interface MultiLoopThermalSystemState {
  highTempIceLoop: ThermalCoolingLoopState;
  midTempEInverterLoop: ThermalCoolingLoopState;
  lowTempBatteryChillerLoop: ThermalCoolingLoopState;
  ambientAirTempC: number;
  chillerCopEfficiency: number;
  totalThermalHeatRejectedKw: number;
  totalAuxiliaryCoolingPowerWatts: number;
}

export class MultiLoopThermalFluidSolver {
  /**
   * Solves multi-loop thermal equilibrium across all powertrain subsystems.
   */
  public static solveMultiLoopThermals(params: {
    ambientAirTempC?: number;
    iceHeatLoadKw?: number;
    inverterMotorHeatLoadKw?: number;
    batteryHeatLoadKw?: number;
    vehicleSpeedKmh: number;
  }): MultiLoopThermalSystemState {
    const tAmb = params.ambientAirTempC || 30.0;
    const qIce = params.iceHeatLoadKw || 45.0; // 45 kW ICE block rejection
    const qInvMotor = params.inverterMotorHeatLoadKw || 12.0; // 12 kW Inverter/Motor rejection
    const qBatt = params.batteryHeatLoadKw || 6.5; // 6.5 kW Battery fast charge rejection
    const vSpeed = params.vehicleSpeedKmh;

    // Front Grille Airflow: Q_radiator = U * A * LMTD * (1 + 0.015 * v)
    const airSpeedFactor = 1.0 + Math.min(2.5, vSpeed / 80);

    // 1. High-Temp ICE Loop (85°C to 100°C)
    const htFlowLpm = 35.0;
    const htInlet = 88.0;
    const htOutlet = htInlet + (qIce * 60) / (htFlowLpm * 1.05 * 3.4);
    const htPumpWatts = Math.pow(htFlowLpm / 10, 2.2) * 28;

    // 2. Mid-Temp Inverter/Motor Loop (45°C to 65°C)
    const mtFlowLpm = 22.0;
    const mtInlet = tAmb + 15.0; // 45°C
    const mtOutlet = mtInlet + (qInvMotor * 60) / (mtFlowLpm * 1.05 * 3.4);
    const mtPumpWatts = Math.pow(mtFlowLpm / 10, 2.2) * 22;

    // 3. Low-Temp Battery Chiller Loop (20°C to 30°C) - Uses AC Refrigerant Chiller
    const ltFlowLpm = 18.0;
    const targetBattTemp = 25.0;
    const ltOutlet = targetBattTemp + 3.5;
    const chillerCop = 3.8; // Heat Pump Coefficient of Performance
    const chillerCompressorWatts = (qBatt / chillerCop) * 1000;
    const ltPumpWatts = Math.pow(ltFlowLpm / 10, 2.2) * 18;

    const totalHeat = qIce + qInvMotor + qBatt;
    const totalAuxPower = htPumpWatts + mtPumpWatts + ltPumpWatts + chillerCompressorWatts;

    return {
      highTempIceLoop: {
        loopName: 'High-Temperature ICE Coolant Loop',
        inletTempC: Math.round(htInlet * 10) / 10,
        outletTempC: Math.round(htOutlet * 10) / 10,
        flowRateLpm: htFlowLpm,
        heatLoadKw: qIce,
        pumpPowerWatts: Math.round(htPumpWatts),
        radiatorHeatRejectionKw: Math.round(qIce * airSpeedFactor * 0.95 * 10) / 10,
      },
      midTempEInverterLoop: {
        loopName: 'Medium-Temperature Inverter/Motor Loop',
        inletTempC: Math.round(mtInlet * 10) / 10,
        outletTempC: Math.round(mtOutlet * 10) / 10,
        flowRateLpm: mtFlowLpm,
        heatLoadKw: qInvMotor,
        pumpPowerWatts: Math.round(mtPumpWatts),
        radiatorHeatRejectionKw: Math.round(qInvMotor * airSpeedFactor * 0.92 * 10) / 10,
      },
      lowTempBatteryChillerLoop: {
        loopName: 'Low-Temperature Battery Pack Chiller Loop',
        inletTempC: targetBattTemp,
        outletTempC: Math.round(ltOutlet * 10) / 10,
        flowRateLpm: ltFlowLpm,
        heatLoadKw: qBatt,
        pumpPowerWatts: Math.round(ltPumpWatts + chillerCompressorWatts),
        radiatorHeatRejectionKw: Math.round(qBatt * 10) / 10,
      },
      ambientAirTempC: tAmb,
      chillerCopEfficiency: chillerCop,
      totalThermalHeatRejectedKw: Math.round(totalHeat * 10) / 10,
      totalAuxiliaryCoolingPowerWatts: Math.round(totalAuxPower),
    };
  }
}
