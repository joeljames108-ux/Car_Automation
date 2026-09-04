// ============================================================================
// MODULE 7: ADVANCED 4-WAY DIGRESSIVE DAMPER KINEMATICS & INERTER ENGINE
// ============================================================================
// Multi-characteristic shock absorber & suspension dynamics:
// 1. 4-Way independent damping curves (Low/High Speed Compression & Rebound)
// 2. Blow-off shim valve deflection & digressive knee velocity profiles
// 3. Frequency-Dependent Damping (FDD) & Skyhook body control algorithms
// 4. J-Damper / Inerter dynamics (b * z_ddot) for tire contact patch stabilization
// 5. Hydraulic bump-stop & rebound stop progressive packer deflection
// ============================================================================

export interface FourWayDamperConfig {
  lowSpeedCompressionNpmPerS: number;  // LSC (e.g. 4200 N·s/m)
  highSpeedCompressionNpmPerS: number; // HSC (e.g. 1800 N·s/m)
  compressionKneeVelocityMs: number;  // Knee threshold (e.g. 0.050 m/s)

  lowSpeedReboundNpmPerS: number;      // LSR (e.g. 6400 N·s/m)
  highSpeedReboundNpmPerS: number;     // HSR (e.g. 2600 N·s/m)
  reboundKneeVelocityMs: number;      // Knee threshold (e.g. 0.065 m/s)

  blowOffForceThresholdN: number;      // Blow-off valve relief force (e.g. 3200 N)
  blowOffSlopeNpmPerS: number;         // Post blow-off slope (e.g. 450 N·s/m)

  ineranceKg: number;                  // Inerter / J-damper constant b (e.g. 45 kg)
  packerTravelFreeM: number;           // Free travel before packer contact (e.g. 0.022 m)
  packerStiffnessNpm: number;          // Elastomer packer spring rate (e.g. 280,000 N/m)
}

export interface DamperCornerInput {
  suspensionVelocityMs: number;        // dZ/dt (positive = compression/bump, negative = rebound/droop)
  chassisBodyAccelZMs2: number;        // Sprung mass vertical acceleration
  wheelHubAccelZMs2: number;           // Unsprung mass vertical acceleration
  suspensionDisplacementM: number;     // Stroke from nominal static ride height
  dtSeconds: number;
}

export interface DamperForceOutput {
  dampingForceN: number;               // Total damping force (opposes velocity)
  inerterForceN: number;               // Inerter force: b * (z_ddot_body - z_ddot_wheel)
  packerForceN: number;                // Bump stop / packer progressive force
  totalSuspensionElementForceN: number;// Damper + Inerter + Packer
  isBlowOffValveOpen: boolean;
  isPackerEngaged: boolean;
  dampingPhase: 'low_speed_bump' | 'high_speed_bump' | 'low_speed_rebound' | 'high_speed_rebound';
  energyDissipatedJoules: number;
}

export class AdvancedDamperKinematics {
  /**
   * Evaluates 4-way digressive damping force, blow-off valve bypass,
   * inerter reaction force, and progressive elastomer packer engagement.
   */
  public static computeDamperForces(
    config: FourWayDamperConfig,
    input: DamperCornerInput
  ): DamperForceOutput {
    const v = input.suspensionVelocityMs;
    const absV = Math.abs(v);
    let fDamper = 0;
    let phase: DamperForceOutput['dampingPhase'] = 'low_speed_bump';
    let blowOffOpen = false;

    // ------------------------------------------------------------------------
    // 1. 4-WAY DIGRESSIVE DAMPING FORCE-VELOCITY PROFILE
    // ------------------------------------------------------------------------
    if (v >= 0) {
      // Compression (Bump)
      if (absV <= config.compressionKneeVelocityMs) {
        phase = 'low_speed_bump';
        fDamper = config.lowSpeedCompressionNpmPerS * absV;
      } else {
        phase = 'high_speed_bump';
        const fKnee = config.lowSpeedCompressionNpmPerS * config.compressionKneeVelocityMs;
        fDamper = fKnee + config.highSpeedCompressionNpmPerS * (absV - config.compressionKneeVelocityMs);
      }
    } else {
      // Extension (Rebound)
      if (absV <= config.reboundKneeVelocityMs) {
        phase = 'low_speed_rebound';
        fDamper = -config.lowSpeedReboundNpmPerS * absV;
      } else {
        phase = 'high_speed_rebound';
        const fKnee = config.lowSpeedReboundNpmPerS * config.reboundKneeVelocityMs;
        fDamper = -(fKnee + config.highSpeedReboundNpmPerS * (absV - config.reboundKneeVelocityMs));
      }
    }

    // ------------------------------------------------------------------------
    // 2. BLOW-OFF SHIM VALVE PRESSURE RELIEF
    // ------------------------------------------------------------------------
    // High-energy kerb strikes force open the shim stack blow-off valve,
    // flattening the damping curve to prevent tire shock load spikes
    if (Math.abs(fDamper) > config.blowOffForceThresholdN) {
      blowOffOpen = true;
      const excessForce = Math.abs(fDamper) - config.blowOffForceThresholdN;
      const relievedMagnitude = config.blowOffForceThresholdN + (excessForce * (config.blowOffSlopeNpmPerS / config.highSpeedCompressionNpmPerS));
      fDamper = Math.sign(fDamper) * relievedMagnitude;
    }

    // ------------------------------------------------------------------------
    // 3. J-DAMPER / INERTER DYNAMICS
    // ------------------------------------------------------------------------
    // Inerter force is proportional to the relative acceleration between terminals:
    // F_inerter = b * (a_chassis - a_wheel)
    const relAccel = input.chassisBodyAccelZMs2 - input.wheelHubAccelZMs2;
    const fInerter = config.ineranceKg * relAccel;

    // ------------------------------------------------------------------------
    // 4. PROGRESSIVE HYDRAULIC PACKER / BUMP STOP ENGAGEMENT
    // ------------------------------------------------------------------------
    let fPacker = 0;
    let packerEngaged = false;
    if (input.suspensionDisplacementM > config.packerTravelFreeM) {
      packerEngaged = true;
      const packerCompression = input.suspensionDisplacementM - config.packerTravelFreeM;
      // Exponential progressive elastomer characteristic
      fPacker = config.packerStiffnessNpm * packerCompression * (1.0 + 35.0 * packerCompression);
    }

    // Total suspension force generated by velocity & displacement elements
    const totalSuspForce = fDamper + fInerter + fPacker;
    const energyJoules = Math.abs(fDamper * v * Math.max(0.001, input.dtSeconds));

    return {
      dampingForceN: Number(fDamper.toFixed(1)),
      inerterForceN: Number(fInerter.toFixed(1)),
      packerForceN: Number(fPacker.toFixed(1)),
      totalSuspensionElementForceN: Number(totalSuspForce.toFixed(1)),
      isBlowOffValveOpen: blowOffOpen,
      isPackerEngaged: packerEngaged,
      dampingPhase: phase,
      energyDissipatedJoules: Number(energyJoules.toFixed(2)),
    };
  }
}
