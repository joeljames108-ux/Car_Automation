// ===================================================================
// TRI-ROTOR WANKEL ROTARY ENGINE KINEMATICS SOLVER
// ===================================================================
// Models 3-rotor epitrochoid chamber volumes, 120° eccentric phasing,
// apex seal blow-by gas leakage, and 9000 RPM BHP output curves.
// ===================================================================

export interface TriRotorWankelResult {
  engineRpm: number;
  totalDisplacementCc: number; // e.g. 1968cc (3 x 654cc)
  brakeHorsepowerBhp: number;
  brakeTorqueNm: number;
  chamberPeakPressureBar: number;
  apexSealCentrifugalForceN: number;
  apexSealBlowByLossPct: number;
  bmepBar: number;
}

export class TriRotorWankelSolver {
  /**
   * Calculates 3-rotor Wankel rotary engine thermodynamic power output and seal dynamics.
   */
  public static solveTriRotor(params: {
    engineRpm: number;
    generatingRadiusR: number; // Radius R (mm) e.g. 105mm
    eccentricityE: number; // Eccentricity e (mm) e.g. 15mm
    rotorWidthB: number; // Rotor width B (mm) e.g. 80mm
    boostPressureBar: number;
  }): TriRotorWankelResult {
    const { engineRpm, generatingRadiusR, eccentricityE, rotorWidthB, boostPressureBar } = params;

    // Single chamber displacement: Vk = 3 * sqrt(3) * R * e * B / 1000
    const singleChamberCc = Math.round((3 * Math.sqrt(3) * generatingRadiusR * eccentricityE * rotorWidthB) / 1000);
    const totalDisplacementCc = singleChamberCc * 3; // 3 rotors

    // Chamber peak combustion pressure
    const chamberPeakPressureBar = Number((45 + boostPressureBar * 28).toFixed(1));

    // BMEP calculation
    const bmepBar = Number((8.5 + boostPressureBar * 7.2).toFixed(1));

    // Torque Nm = (BMEP * Displacement) / (2 * PI)
    const brakeTorqueNm = Number(((bmepBar * 100000 * (totalDisplacementCc / 1e6)) / (2 * Math.PI)).toFixed(1));
    const brakeHorsepowerBhp = Number(((brakeTorqueNm * engineRpm) / 7127).toFixed(1));

    // Apex Seal Centrifugal Force: F = m * r * omega^2
    const apexSealMassKg = 0.012; // 12 grams
    const eccentricOmega = (2 * Math.PI * engineRpm) / 60;
    const apexSealCentrifugalForceN = Number((apexSealMassKg * (eccentricityE / 1000) * Math.pow(eccentricOmega, 2)).toFixed(1));

    // Apex seal blow-by loss decreases at high RPM due to shorter time per stroke
    const apexSealBlowByLossPct = Number(Math.max(1.5, 8.0 - (engineRpm / 9000) * 5.5).toFixed(1));

    return {
      engineRpm,
      totalDisplacementCc,
      brakeHorsepowerBhp,
      brakeTorqueNm,
      chamberPeakPressureBar,
      apexSealCentrifugalForceN,
      apexSealBlowByLossPct,
      bmepBar,
    };
  }
}
