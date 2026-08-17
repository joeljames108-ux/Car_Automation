// ============================================================================
// PHASE 36 — ACTIVE eLSD & TORQUE VECTORING CONTROLLER
// ============================================================================
// Multi-plate electro-hydraulic clutch pack and twin-motor torque vectoring
// solver computing direct yaw moment Mz and left/right torque split.
// ============================================================================

export type DifferentialMode = 'OPEN' | 'ROAD_AUTO' | 'SPORT_DYNAMIC' | 'TRACK_RACE' | 'FULL_SPOOL_100';

export interface TorqueVectoringState {
  mode: DifferentialMode;
  engineInputTorqueNm: number;
  torqueLeftNm: number;
  torqueRightNm: number;
  torqueDeltaNm: number; // Positive = biased to Right wheel
  clutchLockingTorqueNm: number;
  clutchLockPct: number;
  directYawMomentNm: number;
  isYawInterventionActive: boolean;
}

export class ActiveDifferentialTorqueVectoring {
  private static readonly MAX_CLUTCH_LOCK_TORQUE_NM = 2500;
  private static readonly REAR_TRACK_WIDTH_M = 1.62;

  /**
   * Evaluates real-time active differential locking and torque vectoring split.
   */
  public static evaluateDifferentialTick(params: {
    mode?: DifferentialMode;
    inputTorqueNm: number;
    vehicleSpeedKmh: number;
    steeringWheelAngleDeg: number;
    actualYawRateDegPerSec: number;
    desiredYawRateDegPerSec: number;
    leftWheelSlipRatio: number;
    rightWheelSlipRatio: number;
  }): TorqueVectoringState {
    const mode = params.mode || 'SPORT_DYNAMIC';
    const inputT = Math.max(0, params.inputTorqueNm);

    // 1. Base 50/50 open split
    let tLeft = inputT / 2;
    let tRight = inputT / 2;
    let lockTorque = 0;

    if (mode === 'FULL_SPOOL_100') {
      lockTorque = this.MAX_CLUTCH_LOCK_TORQUE_NM;
    } else if (mode === 'OPEN') {
      lockTorque = 0;
    } else {
      // 2. Closed-loop Yaw Control & Slip Limitation
      const yawError = params.desiredYawRateDegPerSec - params.actualYawRateDegPerSec;
      const slipDelta = params.leftWheelSlipRatio - params.rightWheelSlipRatio;

      // Aggressiveness tuning scalar based on mode
      const modeGain = mode === 'TRACK_RACE' ? 1.45 : (mode === 'SPORT_DYNAMIC' ? 1.0 : 0.65);

      // Torque Bias calculation (Delta T): Biasing power to outside wheel in cornering
      let torqueBiasNm = yawError * 45.0 * modeGain;

      // Limit torque bias to available input torque
      const maxBias = inputT * 0.45; // Max 90/10 split
      torqueBiasNm = Math.max(-maxBias, Math.min(maxBias, torqueBiasNm));

      tLeft -= torqueBiasNm / 2;
      tRight += torqueBiasNm / 2;

      // Clutch Lockup: Triggered by wheel slip differential
      const slipLockDemand = Math.abs(slipDelta) * 3500 * modeGain;
      lockTorque = Math.min(this.MAX_CLUTCH_LOCK_TORQUE_NM, slipLockDemand + Math.abs(torqueBiasNm) * 0.8);
    }

    const tDelta = tRight - tLeft;
    const lockPct = (lockTorque / this.MAX_CLUTCH_LOCK_TORQUE_NM) * 100;

    // Direct Yaw Moment generated around vehicle vertical Z axis:
    // Mz = (T_right - T_left) / (2 * r_tire) * (Track / 2)
    const tireRadiusM = 0.33; // 330mm tire radius
    const directYawMomentNm = (tDelta / (2 * tireRadiusM)) * (this.REAR_TRACK_WIDTH_M / 2);

    return {
      mode,
      engineInputTorqueNm: Math.round(inputT),
      torqueLeftNm: Math.round(tLeft),
      torqueRightNm: Math.round(tRight),
      torqueDeltaNm: Math.round(tDelta),
      clutchLockingTorqueNm: Math.round(lockTorque),
      clutchLockPct: Math.round(lockPct * 10) / 10,
      directYawMomentNm: Math.round(directYawMomentNm),
      isYawInterventionActive: Math.abs(tDelta) > 50,
    };
  }
}
