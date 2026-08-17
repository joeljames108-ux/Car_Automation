// ============================================================================
// PHASE 49 — ACTIVE 4-WHEEL STEERING (4WS) & CRAB-WALK KINEMATICS
// ============================================================================
// Multi-mode 4WS kinematic solver: counter-phase low-speed agility, in-phase
// high-speed stability (zero side-slip beta), crab-walk, and rear Ackermann geometry.
// ============================================================================

export type FourWheelSteeringMode = 'AUTO_SPEED_ADAPTIVE' | 'CRAB_WALK_DIAGONAL' | 'REDUCED_TURNING_RADIUS' | 'HIGH_SPEED_STABILITY';

export interface FourWheelSteeringState {
  mode: FourWheelSteeringMode;
  vehicleSpeedKmh: number;
  frontSteerAngleDeg: number;
  rearSteerAngleDeg: number;
  rearSteerPhase: 'COUNTER_PHASE' | 'IN_PHASE' | 'NEUTRAL' | 'CRAB_WALK';
  effectiveTurningRadiusM: number;
  turningRadiusReductionPct: number;
  sideSlipAngleBetaDeg: number;
  rearWheels: {
    leftAngleDeg: number;
    rightAngleDeg: number;
    isAckermannCorrected: boolean;
  };
}

export class ActiveFourWheelSteeringKinematics {
  private static readonly MAX_REAR_STEER_ANGLE_DEG = 8.5; // High-angle rear steering actuator
  private static readonly WHEELBASE_M = 2.82;
  private static readonly TRACK_WIDTH_M = 1.62;

  /**
   * Calculates 4WS wheel angles, turning radius, and sideslip angle beta.
   */
  public static evaluate4WSKinematics(params: {
    mode?: FourWheelSteeringMode;
    vehicleSpeedKmh: number;
    frontSteerAngleDeg: number;
  }): FourWheelSteeringState {
    const mode = params.mode || 'AUTO_SPEED_ADAPTIVE';
    const speed = params.vehicleSpeedKmh;
    const deltaF = params.frontSteerAngleDeg;

    let deltaR = 0;
    let phase: 'COUNTER_PHASE' | 'IN_PHASE' | 'NEUTRAL' | 'CRAB_WALK' = 'NEUTRAL';

    // 1. Mode Specific Rear Steering Control Logic
    if (mode === 'CRAB_WALK_DIAGONAL') {
      // Direct 1:1 in-phase steering for diagonal vehicle glide
      deltaR = Math.min(this.MAX_REAR_STEER_ANGLE_DEG, deltaF);
      phase = 'CRAB_WALK';
    } else if (mode === 'REDUCED_TURNING_RADIUS' || (mode === 'AUTO_SPEED_ADAPTIVE' && speed < 50)) {
      // Counter-phase steering (opposite to front) for ultra-tight turning circle
      const speedScale = Math.max(0.3, 1.0 - speed / 65);
      deltaR = -Math.min(this.MAX_REAR_STEER_ANGLE_DEG, deltaF * 0.42 * speedScale);
      phase = 'COUNTER_PHASE';
    } else if (mode === 'HIGH_SPEED_STABILITY' || (mode === 'AUTO_SPEED_ADAPTIVE' && speed >= 50)) {
      // In-phase steering (same direction as front) to cancel vehicle body sideslip beta
      const speedScale = Math.min(1.0, (speed - 45) / 60);
      deltaR = Math.min(this.MAX_REAR_STEER_ANGLE_DEG * 0.5, deltaF * 0.22 * speedScale);
      phase = 'IN_PHASE';
    }

    // 2. Turning Radius Calculation: R = L / (tan(delta_f) - tan(delta_r))
    const deltaFRad = (deltaF * Math.PI) / 180;
    const deltaRRad = (deltaR * Math.PI) / 180;

    const baseRadiusM = Math.abs(deltaF) > 0.5 ? this.WHEELBASE_M / Math.tan(Math.abs(deltaFRad)) : 999;
    const effectiveRadiusM =
      Math.abs(deltaFRad - deltaRRad) > 0.005
        ? this.WHEELBASE_M / Math.abs(Math.tan(deltaFRad) - Math.tan(deltaRRad))
        : 999;

    const reductionPct = baseRadiusM < 900 ? Math.max(0, ((baseRadiusM - effectiveRadiusM) / baseRadiusM) * 100) : 0;

    // 3. Chassis Sideslip Angle Beta: beta = arctan((b*tan(delta_f) - a*tan(delta_r)) / L)
    const a = this.WHEELBASE_M * 0.48; // Front axle to CoM
    const b = this.WHEELBASE_M * 0.52; // Rear axle to CoM
    const betaRad = Math.atan((b * Math.tan(deltaFRad) - a * Math.tan(deltaRRad)) / this.WHEELBASE_M);
    const betaDeg = (betaRad * 180) / Math.PI;

    // 4. Dynamic Rear Ackermann Correction: cot(delta_inner) - cot(delta_outer) = Track / Wheelbase
    const isTurningLeft = deltaR > 0;
    const cotCenter = 1 / Math.tan(Math.max(0.001, Math.abs(deltaRRad)));
    const cotInner = cotCenter - this.TRACK_WIDTH_M / (2 * this.WHEELBASE_M);
    const cotOuter = cotCenter + this.TRACK_WIDTH_M / (2 * this.WHEELBASE_M);

    const rearInnerDeg = (Math.atan(1 / Math.max(0.001, cotInner)) * 180) / Math.PI;
    const rearOuterDeg = (Math.atan(1 / Math.max(0.001, cotOuter)) * 180) / Math.PI;

    const rearLeftDeg = isTurningLeft ? rearInnerDeg : -rearOuterDeg;
    const rearRightDeg = isTurningLeft ? rearOuterDeg : -rearInnerDeg;

    return {
      mode,
      vehicleSpeedKmh: speed,
      frontSteerAngleDeg: Math.round(deltaF * 10) / 10,
      rearSteerAngleDeg: Math.round(deltaR * 10) / 10,
      rearSteerPhase: phase,
      effectiveTurningRadiusM: Math.round(effectiveRadiusM * 10) / 10,
      turningRadiusReductionPct: Math.round(reductionPct * 10) / 10,
      sideSlipAngleBetaDeg: Math.round(betaDeg * 100) / 100,
      rearWheels: {
        leftAngleDeg: Math.round(rearLeftDeg * 10) / 10,
        rightAngleDeg: Math.round(rearRightDeg * 10) / 10,
        isAckermannCorrected: true,
      },
    };
  }
}
