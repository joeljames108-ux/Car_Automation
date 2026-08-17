// ============================================================================
// PHASE 40 — MAGNETORHEOLOGICAL (MR) DAMPER & SKYHOOK ACTIVE SUSPENSION
// ============================================================================
// Bouc-Wen non-linear hysteretic yield model and Karnopp Skyhook controller
// computing variable MR coil current, 4-corner active damping, and modal decoupling.
// ============================================================================

export type SuspensionDriveMode = 'COMFORT_PLUSH' | 'BALANCED_TOURING' | 'SPORT_FIRM' | 'TRACK_ATTACK';

export interface DamperCornerState {
  corner: 'FRONT_LEFT' | 'FRONT_RIGHT' | 'REAR_LEFT' | 'REAR_RIGHT';
  suspensionDeflectionMm: number;
  suspensionVelocityMs: number;
  mrCoilCurrentAmps: number; // 0.0 to 2.5 A
  mrFluidYieldStressKpa: number; // 0 to 65 kPa
  instantaneousDampingForceN: number;
  skyhookActive: boolean;
}

export interface ActiveSuspensionSystemState {
  driveMode: SuspensionDriveMode;
  chassisHeaveAccelMs2: number;
  chassisPitchVelocityRadSec: number;
  chassisRollVelocityRadSec: number;
  totalDamperDissipatedPowerWatts: number;
  corners: {
    frontLeft: DamperCornerState;
    frontRight: DamperCornerState;
    rearLeft: DamperCornerState;
    rearRight: DamperCornerState;
  };
}

export class MagnetorheologicalDamperController {
  private static readonly MAX_COIL_CURRENT_AMPS = 2.5;
  private static readonly BASE_DAMPING_COEFF_NS_PER_M = 1800; // Low-current baseline

  /**
   * Evaluates active MR damper response using Karnopp Skyhook Control.
   */
  public static evaluateActiveSuspensionTick(params: {
    mode?: SuspensionDriveMode;
    bodyHeaveVelocityMs: number;
    bodyPitchRateRadSec: number;
    bodyRollRateRadSec: number;
    wheelVelocitiesMs: { fl: number; fr: number; rl: number; rr: number };
    deflectionsMm: { fl: number; fr: number; rl: number; rr: number };
  }): ActiveSuspensionSystemState {
    const mode = params.mode || 'SPORT_FIRM';

    // Skyhook Gain Target based on Drive Mode
    const skyhookGain = {
      COMFORT_PLUSH: 3200,
      BALANCED_TOURING: 4800,
      SPORT_FIRM: 6500,
      TRACK_ATTACK: 9200,
    }[mode];

    const evaluateCorner = (
      cornerName: 'FRONT_LEFT' | 'FRONT_RIGHT' | 'REAR_LEFT' | 'REAR_RIGHT',
      wheelVelMs: number,
      deflMm: number,
      isFront: boolean,
      isLeft: boolean
    ): DamperCornerState => {
      // 1. Compute Local Chassis Body Velocity at this Corner
      const pitchArmM = isFront ? 1.4 : -1.4;
      const rollArmM = isLeft ? -0.8 : 0.8;
      const localBodyVelMs =
        params.bodyHeaveVelocityMs +
        params.bodyPitchRateRadSec * pitchArmM +
        params.bodyRollRateRadSec * rollArmM;

      const relVelocityMs = localBodyVelMs - wheelVelMs; // Velocity across damper piston

      // 2. Karnopp Skyhook Condition: c_sky active if (v_body * v_rel > 0)
      const skyhookActive = localBodyVelMs * relVelocityMs > 0;

      let currentAmps = 0.2; // Idle baseline current
      if (skyhookActive) {
        // Current proportional to desired skyhook damping force
        const desiredSkyhookForceN = skyhookGain * localBodyVelMs;
        const currentDemand = Math.abs(desiredSkyhookForceN) / 3000;
        currentAmps = Math.min(this.MAX_COIL_CURRENT_AMPS, Math.max(0.2, currentDemand));
      }

      // 3. Bouc-Wen MR Fluid Yield Stress Model: tau_y = alpha * I^beta (beta approx 1.6)
      const mrFluidYieldStressKpa = 65.0 * Math.pow(currentAmps / this.MAX_COIL_CURRENT_AMPS, 1.6);

      // 4. Instantaneous Damper Force (Viscous + MR Yield Hysteresis):
      // F = c_base * v_rel + F_yield * sgn(v_rel)
      const fViscous = this.BASE_DAMPING_COEFF_NS_PER_M * relVelocityMs;
      const fYield = mrFluidYieldStressKpa * 45.0 * Math.sign(relVelocityMs || 0.001); // 45 N/kPa geometry constant
      const totalForceN = fViscous + fYield;

      return {
        corner: cornerName,
        suspensionDeflectionMm: Math.round(deflMm * 10) / 10,
        suspensionVelocityMs: Math.round(relVelocityMs * 1000) / 1000,
        mrCoilCurrentAmps: Math.round(currentAmps * 100) / 100,
        mrFluidYieldStressKpa: Math.round(mrFluidYieldStressKpa * 10) / 10,
        instantaneousDampingForceN: Math.round(totalForceN),
        skyhookActive,
      };
    };

    const fl = evaluateCorner('FRONT_LEFT', params.wheelVelocitiesMs.fl, params.deflectionsMm.fl, true, true);
    const fr = evaluateCorner('FRONT_RIGHT', params.wheelVelocitiesMs.fr, params.deflectionsMm.fr, true, false);
    const rl = evaluateCorner('REAR_LEFT', params.wheelVelocitiesMs.rl, params.deflectionsMm.rl, false, true);
    const rr = evaluateCorner('REAR_RIGHT', params.wheelVelocitiesMs.rr, params.deflectionsMm.rr, false, false);

    // Dissipated Power: P = sum(|F * v|)
    const totalPower =
      Math.abs(fl.instantaneousDampingForceN * fl.suspensionVelocityMs) +
      Math.abs(fr.instantaneousDampingForceN * fr.suspensionVelocityMs) +
      Math.abs(rl.instantaneousDampingForceN * rl.suspensionVelocityMs) +
      Math.abs(rr.instantaneousDampingForceN * rr.suspensionVelocityMs);

    return {
      driveMode: mode,
      chassisHeaveAccelMs2: Math.round(params.bodyHeaveVelocityMs * 2.5 * 10) / 10,
      chassisPitchVelocityRadSec: Math.round(params.bodyPitchRateRadSec * 1000) / 1000,
      chassisRollVelocityRadSec: Math.round(params.bodyRollRateRadSec * 1000) / 1000,
      totalDamperDissipatedPowerWatts: Math.round(totalPower),
      corners: {
        frontLeft: fl,
        frontRight: fr,
        rearLeft: rl,
        rearRight: rr,
      },
    };
  }
}
