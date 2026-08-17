// ============================================================================
// PHASE 19 — HIGH-RESOLUTION ENGINE DYNAMOMETER & DYNO SWEEP SIMULATOR
// ============================================================================
// Internal combustion engine thermodynamic dyno simulation modeling BMEP,
// FMEP friction losses, volumetric efficiency, turbo boost maps, and BSFC.
// ============================================================================

export interface EngineDynoParameters {
  engineDisplacementLiters: number; // e.g. 4.0L
  cylinderCount: number; // e.g. 8
  boreMm: number; // e.g. 86.0 mm
  strokeMm: number; // e.g. 86.0 mm
  compressionRatio: number; // e.g. 10.5:1
  idleRpm: number; // e.g. 850 RPM
  redlineRpm: number; // e.g. 8500 RPM
  isTurbocharged: boolean;
  maxBoostBar: number; // e.g. 1.6 bar
  fuelOctaneRating: number; // e.g. 98 RON
}

export interface DynoDataPoint {
  rpm: number;
  torqueNm: number;
  powerBhp: number;
  powerKw: number;
  bmepBar: number; // Brake Mean Effective Pressure
  fmepBar: number; // Friction Mean Effective Pressure
  volumetricEfficiencyPct: number;
  boostPressureBar: number;
  bsfcGPerKwh: number; // Brake Specific Fuel Consumption
  exhaustGasTempC: number;
  airFuelRatio: number;
}

export interface DynoSimulationResult {
  engineParams: EngineDynoParameters;
  peakTorqueNm: number;
  peakTorqueRpm: number;
  peakPowerBhp: number;
  peakPowerRpm: number;
  curve: DynoDataPoint[];
}

export class HighResDynamometerSimulator {
  /**
   * Executes a full RPM sweep dyno run from idle to redline.
   */
  public static runDynoSweep(
    params: EngineDynoParameters,
    rpmStep: number = 250
  ): DynoSimulationResult {
    const curve: DynoDataPoint[] = [];
    let peakTorqueNm = 0;
    let peakTorqueRpm = 0;
    let peakPowerBhp = 0;
    let peakPowerRpm = 0;

    const vDisplacementM3 = params.engineDisplacementLiters * 0.001;

    for (let rpm = params.idleRpm; rpm <= params.redlineRpm; rpm += rpmStep) {
      // 1. Volumetric Efficiency (VE) Curve
      // Peaks around 65% of redline (tuned intake runner resonance)
      const tunedRpm = params.redlineRpm * 0.65;
      const rpmRatio = (rpm - tunedRpm) / tunedRpm;
      let veBase = 0.96 - 0.55 * Math.pow(rpmRatio, 2);
      veBase = Math.max(0.65, Math.min(1.08, veBase));

      // 2. Turbocharger Boost Pressure Curve
      let boostBar = 0.0;
      if (params.isTurbocharged) {
        // Boost builds with exhaust energy above 2500 RPM
        const spoolFactor = Math.max(0.0, Math.min(1.0, (rpm - 2200) / 1800));
        boostBar = params.maxBoostBar * spoolFactor;
      }

      // Total manifold absolute pressure (MAP) in bar
      const mapBar = 1.0 + boostBar;
      const effectiveVE = veBase * mapBar;

      // 3. Friction Mean Effective Pressure (Chen-Flynn FMEP correlation)
      // FMEP = a + b * P_max + c * MeanPistonSpeed + d * MeanPistonSpeed^2
      const meanPistonSpeedMs = (2 * (params.strokeMm / 1000) * rpm) / 60;
      const fmepBar = 0.35 + 0.08 * meanPistonSpeedMs + 0.006 * Math.pow(meanPistonSpeedMs, 2);

      // 4. Indicated & Brake Mean Effective Pressure
      // IMEP is driven by fuel energy density, compression ratio, and VE
      const imepBar = effectiveVE * (12.5 + (params.compressionRatio - 9.0) * 0.75);
      const bmepBar = Math.max(0, imepBar - fmepBar);

      // 5. Brake Torque: T = (BMEP * V_d) / (4 * pi) for 4-stroke
      const bmepPa = bmepBar * 100000;
      const torqueNm = (bmepPa * vDisplacementM3) / (4 * Math.PI);

      // 6. Power: Power (kW) = (Torque * RPM) / 9549, BHP = (Torque * RPM) / 5252
      const powerKw = (torqueNm * rpm) / 9549;
      const powerBhp = (torqueNm * rpm) / 5252;

      // 7. BSFC & Thermal metrics
      const bsfcGPerKwh = 210 + 45 * Math.pow((rpm - 3500) / 4000, 2);
      const afr = params.isTurbocharged && boostBar > 0.5 ? 11.8 : 12.8;
      const egtC = 620 + (powerKw / (params.engineDisplacementLiters * 100)) * 220;

      if (torqueNm > peakTorqueNm) {
        peakTorqueNm = torqueNm;
        peakTorqueRpm = rpm;
      }

      if (powerBhp > peakPowerBhp) {
        peakPowerBhp = powerBhp;
        peakPowerRpm = rpm;
      }

      curve.push({
        rpm,
        torqueNm: Math.round(torqueNm * 10) / 10,
        powerBhp: Math.round(powerBhp * 10) / 10,
        powerKw: Math.round(powerKw * 10) / 10,
        bmepBar: Math.round(bmepBar * 100) / 100,
        fmepBar: Math.round(fmepBar * 100) / 100,
        volumetricEfficiencyPct: Math.round(effectiveVE * 100),
        boostPressureBar: Math.round(boostBar * 100) / 100,
        bsfcGPerKwh: Math.round(bsfcGPerKwh),
        exhaustGasTempC: Math.round(egtC),
        airFuelRatio: Math.round(afr * 10) / 10,
      });
    }

    return {
      engineParams: params,
      peakTorqueNm: Math.round(peakTorqueNm),
      peakTorqueRpm,
      peakPowerBhp: Math.round(peakPowerBhp),
      peakPowerRpm,
      curve,
    };
  }
}
