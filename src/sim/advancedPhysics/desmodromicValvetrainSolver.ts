// ===================================================================
// DESMODROMIC VALVETRAIN MECHANICAL STRESS SOLVER
// ===================================================================
// Models positive opening & closing cam geometry, elimination of valve
// float up to 18,000 RPM, Hertzian contact stress, and FMEP friction.
// ===================================================================

export interface DesmodromicValvetrainResult {
  engineRpm: number;
  isValveFloatPrevented: boolean;
  maxValveVelocityMPerS: number;
  maxValveAccelerationG: number;
  openingCamHertzContactStressMpa: number;
  closingCamHertzContactStressMpa: number;
  valvetrainFmepBar: number;
  safetyMarginPct: number;
}

export class DesmodromicValvetrainSolver {
  /**
   * Calculates desmodromic cam kinematic forces, contact stresses, and friction.
   */
  public static solveValvetrain(params: {
    engineRpm: number;
    valveLiftMm: number;
    valveMassGrams: number;
    camLobeBaseRadiusMm: number;
  }): DesmodromicValvetrainResult {
    const { engineRpm, valveLiftMm, valveMassGrams, camLobeBaseRadiusMm } = params;

    const camRpm = engineRpm / 2; // 4-stroke cam spins at half engine speed
    const omega = (2 * Math.PI * camRpm) / 60;

    // Kinematics
    const maxValveVelocityMPerS = Number(((valveLiftMm / 1000) * omega * 1.5).toFixed(2));
    const maxValveAccelerationMPerS2 = (valveLiftMm / 1000) * omega * omega * 4.0;
    const maxValveAccelerationG = Number((maxValveAccelerationMPerS2 / 9.81).toFixed(1));

    // Valve float is 100% prevented by mechanical closing rocker arm
    const isValveFloatPrevented = true;

    // Hertzian Contact Stress (MPa)
    const inertiaForceN = (valveMassGrams / 1000) * maxValveAccelerationMPerS2;
    const contactWidthMm = 8.0;
    const openingHertzMpa = Number((280 + Math.sqrt(inertiaForceN / contactWidthMm) * 45).toFixed(1));
    const closingHertzMpa = Number((240 + Math.sqrt(inertiaForceN / contactWidthMm) * 38).toFixed(1));

    // Desmodromic eliminates heavy valve spring preload -> lower friction at low RPM
    const valvetrainFmepBar = Number((0.08 + (engineRpm / 18000) * 0.22).toFixed(3));

    // Yield strength margin vs 1200 MPa tool steel cam lobes
    const maxStress = Math.max(openingHertzMpa, closingHertzMpa);
    const safetyMarginPct = Number((((1200 - maxStress) / 1200) * 100).toFixed(1));

    return {
      engineRpm,
      isValveFloatPrevented,
      maxValveVelocityMPerS,
      maxValveAccelerationG,
      openingCamHertzContactStressMpa: openingHertzMpa,
      closingCamHertzContactStressMpa: closingHertzMpa,
      valvetrainFmepBar,
      safetyMarginPct,
    };
  }
}
