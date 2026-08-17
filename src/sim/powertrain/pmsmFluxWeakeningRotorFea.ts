// ============================================================================
// PHASE 54 — PMSM FLUX WEAKENING & HIGH-SPEED ROTOR CENTRIFUGAL STRESS FEA
// ============================================================================
// d-q axis vector control (MTPA vs MTPV Flux Weakening), carbon sleeve containment
// hoop stress at 22,000 RPM, and high Constant-Power Speed Ratio (CPSR).
// ============================================================================

export interface PmsmOperatingPoint {
  rotorSpeedRpm: number;
  torqueNm: number;
  powerKw: number;
  idCurrentAmps: number; // Negative for flux weakening
  iqCurrentAmps: number;
  inverterVoltageDemandVolts: number;
  isFluxWeakeningActive: boolean;
  powerFactor: number;
  rotorMaxHoopStressMpa: number;
  carbonSleeveSafetyFactor: number;
}

export class PmsmFluxWeakeningRotorFea {
  private static readonly MAX_DC_VOLTAGE = 800;
  private static readonly MAX_CURRENT_RMS = 450;
  private static readonly STATOR_RESISTANCE_OHM = 0.015;
  private static readonly LD_INDUCTANCE_UH = 180;
  private static readonly LQ_INDUCTANCE_UH = 340; // Saliency ratio Lq/Ld ~ 1.88
  private static readonly PM_FLUX_WEBER = 0.082;
  private static readonly POLE_PAIRS = 4;
  private static readonly ROTOR_RADIUS_MM = 78;
  private static readonly CARBON_SLEEVE_STRENGTH_MPA = 1850; // T1000 Carbon Prepreg

  /**
   * Calculates d-q vector current trajectory, flux weakening, and rotor centrifugal hoop stress.
   */
  public static evaluateMotorOperatingPoint(params: {
    rotorSpeedRpm: number;
    demandedTorqueNm: number;
  }): PmsmOperatingPoint {
    const rpm = params.rotorSpeedRpm;
    const demandedT = params.demandedTorqueNm;
    const omegaE = (rpm * (2 * Math.PI) / 60) * this.POLE_PAIRS;

    // Maximum available phase voltage (SVPWM linear limit: V_max = V_dc / sqrt(3))
    const vMax = this.MAX_DC_VOLTAGE / Math.sqrt(3);

    // 1. Base MTPA (Maximum Torque Per Ampere) Trajectory
    // T = 1.5 * p * [Psi_pm * iq + (Ld - Lq) * id * iq]
    let iq = Math.min(this.MAX_CURRENT_RMS * 1.414, (demandedT / (1.5 * this.POLE_PAIRS * this.PM_FLUX_WEBER)));
    let id = 0;

    // Saliency reluctance torque id calculation (approximate MTPA)
    if (demandedT > 100) {
      id = -iq * 0.35; // Slight negative id for reluctance boost
    }

    // 2. Voltage Constraint Check: V_d^2 + V_q^2 <= V_max^2
    // V_d = Rs * id - omegaE * Lq * iq
    // V_q = Rs * iq + omegaE * (Ld * id + Psi_pm)
    const ldH = this.LD_INDUCTANCE_UH * 1e-6;
    const lqH = this.LQ_INDUCTANCE_UH * 1e-6;

    let vd = this.STATOR_RESISTANCE_OHM * id - omegaE * lqH * iq;
    let vq = this.STATOR_RESISTANCE_OHM * iq + omegaE * (ldH * id + this.PM_FLUX_WEBER);
    let vMag = Math.sqrt(vd * vd + vq * vq);

    let isFluxWeakening = false;

    // 3. Flux Weakening (MTPV) Loop if Voltage Exceeds V_max
    if (vMag > vMax) {
      isFluxWeakening = true;
      // Demagnetizing d-axis current: id = -(Psi_pm - sqrt((V_max / omegaE)^2 - (Lq * iq)^2)) / Ld
      const maxLqIq = Math.min(vMax * 0.95, omegaE * lqH * iq);
      const fluxRemaining = Math.sqrt(Math.max(0, Math.pow(vMax / omegaE, 2) - Math.pow(maxLqIq / omegaE, 2)));
      id = -Math.min(this.MAX_CURRENT_RMS * 1.414, (this.PM_FLUX_WEBER - fluxRemaining) / ldH);

      // Recompute constrained iq
      const maxIqAllowed = Math.sqrt(Math.max(0, Math.pow(this.MAX_CURRENT_RMS * 1.414, 2) - Math.pow(id, 2)));
      iq = Math.min(iq, maxIqAllowed);

      vd = this.STATOR_RESISTANCE_OHM * id - omegaE * lqH * iq;
      vq = this.STATOR_RESISTANCE_OHM * iq + omegaE * (ldH * id + this.PM_FLUX_WEBER);
      vMag = Math.min(vMax, Math.sqrt(vd * vd + vq * vq));
    }

    // 4. Actual Delivered Torque & Power
    const actualTorque = 1.5 * this.POLE_PAIRS * (this.PM_FLUX_WEBER * iq + (ldH - lqH) * id * iq);
    const powerKw = (actualTorque * (rpm * (2 * Math.PI) / 60)) / 1000;

    // 5. Centrifugal Rotor Hoop Stress on Carbon Sleeve
    // sigma_theta = rho * omega^2 * r^2
    const omegaMech = (rpm * (2 * Math.PI)) / 60;
    const rM = this.ROTOR_RADIUS_MM / 1000;
    const rhoRotor = 7600; // kg/m^3 magnet & iron stack density
    const hoopStressPa = rhoRotor * Math.pow(omegaMech, 2) * Math.pow(rM, 2) * 0.42; // Retention factor
    const hoopStressMpa = hoopStressPa / 1e6;
    const safetyFactor = this.CARBON_SLEEVE_STRENGTH_MPA / Math.max(1, hoopStressMpa);

    return {
      rotorSpeedRpm: rpm,
      torqueNm: Math.round(actualTorque * 10) / 10,
      powerKw: Math.round(powerKw * 10) / 10,
      idCurrentAmps: Math.round(id * 10) / 10,
      iqCurrentAmps: Math.round(iq * 10) / 10,
      inverterVoltageDemandVolts: Math.round(vMag * 10) / 10,
      isFluxWeakeningActive: isFluxWeakening,
      powerFactor: Math.round(Math.cos(Math.atan2(vd, vq)) * 100) / 100,
      rotorMaxHoopStressMpa: Math.round(hoopStressMpa * 10) / 10,
      carbonSleeveSafetyFactor: Math.round(safetyFactor * 100) / 100,
    };
  }
}
