// ===================================================================
// ENGINE FRICTION & PUMPING LOSS MODEL — Chen-Flynn & Petroff Physics
// ===================================================================
// Phase 2: Calculates speed-dependent mechanical friction (FMEP) and
// pumping losses (PMEP) to derive true Brake Mean Effective Pressure (BMEP).

export interface FrictionInput {
  rpm: number;
  redline: number;
  boreMm: number;
  strokeMm: number;
  cylinderCount: number;
  valvetrainType: string;
  peakCylinderPressureBar: number;
  boostPressureBar: number;
  isThrottled: boolean;
  throttlePosition: number; // 0.0 to 1.0
}

export interface FrictionResult {
  fmep: number; // Friction Mean Effective Pressure (bar)
  pmep: number; // Pumping Mean Effective Pressure (bar)
  totalLossMep: number; // FMEP + PMEP (bar)
  bmep: number; // Net Brake Mean Effective Pressure (bar) after subtracting losses from IMEP
  parasiticKw: number; // Accessory parasitic loss in kW
}

/**
 * Calculates FMEP using Chen-Flynn Correlation:
 * FMEP = C1 + C2 * P_max + C3 * V_mean_piston + C4 * (V_mean_piston)^2
 */
export function calculateFMEP(input: FrictionInput): number {
  const { rpm, strokeMm, peakCylinderPressureBar, valvetrainType } = input;

  // Mean piston speed in m/s: V_p = 2 * (stroke / 1000) * (rpm / 60)
  const meanPistonSpeed = 2 * (strokeMm / 1000) * (rpm / 60);

  // Valvetrain multiplier (OHV vs SOHC vs DOHC friction differences)
  let valvetrainFactor = 1.0;
  if (valvetrainType.includes("ohv")) valvetrainFactor = 0.85; // pushrod has fewer cams
  else if (valvetrainType.includes("dohc")) valvetrainFactor = 1.15; // dual cams, more friction

  // Chen-Flynn Empirical Constants (Bar)
  const c1 = 0.35 * valvetrainFactor; // Base mechanical friction
  const c2 = 0.005; // Pressure-dependent friction (ring/bearing load)
  const c3 = 0.08; // Hydrodynamic speed friction (linear)
  const c4 = 0.0012; // Hydrodynamic speed friction (quadratic)

  const fmep = c1 + c2 * peakCylinderPressureBar + c3 * meanPistonSpeed + c4 * (meanPistonSpeed * meanPistonSpeed);
  return Math.max(0.2, fmep);
}

/**
 * Calculates Pumping Losses (PMEP)
 */
export function calculatePMEP(input: FrictionInput): number {
  const { rpm, redline, boostPressureBar, isThrottled, throttlePosition } = input;

  if (boostPressureBar > 0) {
    // Under boost: positive intake manifold pressure reduces pumping loop loss or creates mild pumping gain
    const boostGain = boostPressureBar * 0.15;
    return Math.max(-0.2, 0.1 - boostGain);
  }

  // Throttled NA engine: vacuum in intake manifold creates pumping work loss
  const throttleVacuum = isThrottled ? (1.0 - Math.min(1.0, throttlePosition)) * 0.7 : 0.05;
  const speedRatio = rpm / Math.max(1, redline);
  const pmep = 0.15 + throttleVacuum + speedRatio * 0.25;

  return Math.max(0.05, pmep);
}

/**
 * Combines IMEP, FMEP, PMEP to yield BMEP
 */
export function calculateBMEP(imepGross: number, input: FrictionInput): FrictionResult {
  const fmep = calculateFMEP(input);
  const pmep = calculatePMEP(input);
  const totalLossMep = fmep + pmep;
  const bmep = Math.max(0, imepGross - totalLossMep);

  // Parasitic accessory losses (alternator, water pump, oil pump) in kW
  const meanPistonSpeed = 2 * (input.strokeMm / 1000) * (input.rpm / 60);
  const parasiticKw = 0.5 + 0.0008 * input.cylinderCount * input.rpm + 0.05 * (meanPistonSpeed * meanPistonSpeed);

  return {
    fmep: Math.round(fmep * 100) / 100,
    pmep: Math.round(pmep * 100) / 100,
    totalLossMep: Math.round(totalLossMep * 100) / 100,
    bmep: Math.round(bmep * 100) / 100,
    parasiticKw: Math.round(parasiticKw * 10) / 10,
  };
}
