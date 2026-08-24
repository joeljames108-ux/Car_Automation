// ===================================================================
// ACTIVE YAW VECTORING & e-LSD CLUTCH SOLVER
// ===================================================================
// Solves cross-axle torque biasing, Direct Yaw Moment (DYM),
// multi-plate clutch clamping pressure, and vehicle sideslip angle.
// ===================================================================

export interface YawVectoringResult {
  clutchClampingPressureBar: number;
  leftWheelTorqueNm: number;
  rightWheelTorqueNm: number;
  directYawMomentNm: number; // DYM vector torque
  vehicleSideslipDeg: number; // Beta angle
  transientTurnInGainPct: number;
  understeerCorrectionActive: boolean;
}

export class ActiveYawVectoringSolver {
  /**
   * Calculates active cross-axle torque vectoring split during cornering.
   */
  public static solveTorqueBiasing(params: {
    totalAxleTorqueNm: number;
    steeringAngleDeg: number;
    vehicleSpeedKmH: number;
    lateralG: number;
    yawRateDegPerSec: number;
    trackWidthM: number;
  }): YawVectoringResult {
    const { totalAxleTorqueNm, steeringAngleDeg, vehicleSpeedKmH, lateralG, yawRateDegPerSec, trackWidthM } = params;

    // Target yaw rate based on speed & steering angle
    const targetYawRateDegPerSec = (vehicleSpeedKmH / 3.6) * (steeringAngleDeg / 15);
    const yawRateError = targetYawRateDegPerSec - yawRateDegPerSec;

    const understeerCorrectionActive = yawRateError > 1.5;

    // Electro-hydraulic clutch pressure: 0 to 45 bar
    let clutchClampingPressureBar = Math.min(45, Math.max(0, Math.abs(yawRateError) * 4.5 + lateralG * 10));
    clutchClampingPressureBar = Number(clutchClampingPressureBar.toFixed(1));

    // Maximum cross-axle bias torque (up to 1800 Nm shift)
    const biasTorqueCapNm = (clutchClampingPressureBar / 45) * 1800;

    let leftWheelTorqueNm = totalAxleTorqueNm * 0.5;
    let rightWheelTorqueNm = totalAxleTorqueNm * 0.5;

    if (steeringAngleDeg > 0) {
      // Turning Right: Overdrive outer (left) wheel
      leftWheelTorqueNm += biasTorqueCapNm * 0.5;
      rightWheelTorqueNm -= biasTorqueCapNm * 0.5;
    } else if (steeringAngleDeg < 0) {
      // Turning Left: Overdrive outer (right) wheel
      leftWheelTorqueNm -= biasTorqueCapNm * 0.5;
      rightWheelTorqueNm += biasTorqueCapNm * 0.5;
    }

    // Direct Yaw Moment = (F_right - F_left) * (trackWidth / 2)
    const torqueDelta = rightWheelTorqueNm - leftWheelTorqueNm;
    const directYawMomentNm = Number((torqueDelta * (trackWidthM / 2)).toFixed(1));

    const vehicleSideslipDeg = Number((lateralG * 1.8 - (directYawMomentNm / 2000)).toFixed(2));
    const transientTurnInGainPct = Number((15.0 + (biasTorqueCapNm / 1800) * 35.0).toFixed(1));

    return {
      clutchClampingPressureBar,
      leftWheelTorqueNm: Number(leftWheelTorqueNm.toFixed(1)),
      rightWheelTorqueNm: Number(rightWheelTorqueNm.toFixed(1)),
      directYawMomentNm,
      vehicleSideslipDeg,
      transientTurnInGainPct,
      understeerCorrectionActive,
    };
  }
}
