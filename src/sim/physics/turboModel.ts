// ===================================================================
// ADVANCED TURBOCHARGER COMPRESSOR MAP & SPOOL MODEL
// ===================================================================
// Phase 3: Turbocharger compressor efficiency maps, surge/choke boundaries,
// turbine expansion ratio, and shaft spool dynamics.

export interface TurboParams {
  compressorAR: number; // e.g. 0.60
  turbineAR: number; // e.g. 0.82
  turbineWheelDiaMm: number; // e.g. 60mm
  targetBoostBar: number; // Max requested boost pressure in bar
  intercoolerType: string;
  wastegateType: string;
  antiLag: boolean;
}

export interface TurboState {
  spoolFraction: number; // 0.0 to 1.0
  actualBoostBar: number; // Bar gauge pressure
  compressorEfficiency: number; // 0.50 to 0.78
  isSurging: boolean;
  isChoked: boolean;
  shaftRpm: number;
}

/**
 * Evaluates compressor efficiency and boost buildup based on airflow & RPM
 */
export function calculateTurboState(
  rpm: number,
  redline: number,
  engineDisplacementCc: number,
  params: TurboParams,
  previousSpool: number = 0.0,
  dtSeconds: number = 0.05
): TurboState {
  const { compressorAR, turbineAR, turbineWheelDiaMm, targetBoostBar, antiLag } = params;

  if (targetBoostBar <= 0) {
    return {
      spoolFraction: 0,
      actualBoostBar: 0,
      compressorEfficiency: 0.70,
      isSurging: false,
      isChoked: false,
      shaftRpm: 0,
    };
  }

  // 1. Spool threshold RPM based on turbine size & A/R
  // Larger turbine wheel & higher A/R = higher RPM needed for spool
  const baseSpoolRpm = 1800 + (turbineWheelDiaMm - 45) * 45 + (turbineAR - 0.5) * 2000;
  const spoolRpm = antiLag ? Math.max(1200, baseSpoolRpm * 0.5) : baseSpoolRpm;

  // 2. Shaft inertia time constant
  // Larger wheel inertia slows acceleration
  const inertiaFactor = Math.pow(turbineWheelDiaMm / 50, 2);
  const spoolRate = (0.8 / Math.max(0.2, inertiaFactor)) * (1.2 - compressorAR * 0.3);

  // Target spool at current RPM
  let targetSpool = 0;
  if (rpm >= spoolRpm) {
    targetSpool = Math.min(1.0, (rpm - spoolRpm) / (redline * 0.35 - spoolRpm * 0.5));
  } else if (antiLag) {
    targetSpool = 0.4;
  }

  // Spool integration
  const spoolDelta = (targetSpool - previousSpool) * Math.min(1.0, dtSeconds * 10 * spoolRate);
  const spoolFraction = Math.max(0, Math.min(1.0, previousSpool + spoolDelta));

  const actualBoostBar = targetBoostBar * Math.pow(spoolFraction, 1.4);

  // 3. Airflow calculation (kg/s)
  const pr = 1 + actualBoostBar; // Pressure ratio
  const dispL = engineDisplacementCc / 1000;
  const engineAirflowKgS = (dispL * (rpm / 60) * 0.5 * 1.225 * pr) / 1000;

  // 4. Compressor map efficiency islands (peak efficiency ~ 0.76 at mid PR and mid flow)
  const idealPR = 1.8 + compressorAR * 0.4;
  const prDiff = Math.abs(pr - idealPR);
  const compressorEfficiency = Math.max(0.50, 0.76 - prDiff * 0.12 - Math.pow(spoolFraction - 0.8, 2) * 0.15);

  // Surge / Choke limits
  const surgeLimitFlow = (pr - 1) * 0.05 * (compressorAR / 0.6);
  const isSurging = pr > 1.2 && engineAirflowKgS < surgeLimitFlow;
  const isChoked = pr > 1.1 && engineAirflowKgS > 0.45 * (1.2 / Math.max(0.3, compressorAR));

  const maxShaftRpm = 180000 / (turbineWheelDiaMm / 50);
  const shaftRpm = Math.round(maxShaftRpm * spoolFraction);

  return {
    spoolFraction: Math.round(spoolFraction * 100) / 100,
    actualBoostBar: Math.round(actualBoostBar * 100) / 100,
    compressorEfficiency: Math.round(compressorEfficiency * 100) / 100,
    isSurging,
    isChoked,
    shaftRpm,
  };
}
