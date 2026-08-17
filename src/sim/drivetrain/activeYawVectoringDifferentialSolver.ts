// ============================================================================
// PHASE 102 — MOTORSPORT ACTIVE YAW VECTORING & e-LSD CLUTCH SOLVER
// ============================================================================
// Solves motorsport electro-hydraulic limited slip differential (e-LSD) lockup
// torque, twin-motor planetary cross-axle torque biasing, and closed-loop
// Direct Yaw Moment Control (DYC) with state-feedback vehicle sideslip regulator.
//
// Reference Vehicle Dynamics & Control Theory:
//   - Direct Yaw Moment: M_z = ( (T_outer - T_inner) / (2 * R_tire) ) * Track_width
//   - Target Yaw Rate (Bicycle Model): r_target = (v_x / (L * (1 + K_us * v_x²))) * δ_wheel
//   - Vehicle Sideslip Dynamic Equation: β_dot = (F_yf + F_yr) / (m * v_x) - r
//   - e-LSD Multi-Plate Clutch Torque: T_clutch = 2/3 * μ_clutch * F_normal * N_plates * ((R_o³ - R_i³) / (R_o² - R_i²))
//   - Proportional-Integral DYC Law: M_z_cmd = K_p_yaw * (r_target - r_actual) + K_d_yaw * (r_dot) + K_beta * (β_target - β_actual)
// ============================================================================

export type YawControlMode = 'AGILITY_TURN_IN' | 'NEUTRAL_STABILITY_APEX' | 'POWER_OVERSTEER_DRIFT_LIMIT' | 'TRACTION_CORNER_EXIT';

export interface ActiveDifferentialState {
  controlMode: YawControlMode;
  inputDriveTorqueNm: number;
  leftWheelTorqueNm: number;
  rightWheelTorqueNm: number;
  crossAxleTorqueBiasNm: number;
  directYawMomentNm: number;
  clutchClampingPressureBar: number;
  clutchLockupPercentage: number;
  targetYawRateRadPerSec: number;
  actualYawRateRadPerSec: number;
  yawRateTrackingErrorPct: number;
  vehicleSideslipAngleDeg: number;
  isDriftAngleControlled: boolean;
  tireLateralGAvailable: number;
  understeerMitigationGain: number;
}

export interface ActiveDifferentialSolverParams {
  inputShaftTorqueNm?: number;
  steeringWheelAngleDeg?: number;
  vehicleSpeedKmh?: number;
  measuredYawRateDegPerSec?: number;
  vehicleSideslipDeg?: number;
  targetAgilityBias?: number; // -1.0 (max stability) to +1.0 (max rotation)
}

export class ActiveYawVectoringDifferentialSolver {
  // ── Vehicle Kinematic & Friction Geometry Constants ───────────────────────
  private static readonly TRACK_WIDTH_M = 1.68;
  private static readonly WHEEL_BASE_M = 2.75;
  private static readonly TIRE_ROLLING_RADIUS_M = 0.335;
  private static readonly UNDERSTEER_GRADIENT_KUS = 0.0018; // rad/(m/s^2)
  private static readonly CLUTCH_PLATE_COUNT = 8;
  private static readonly CLUTCH_FRICTION_COEFF = 0.135;
  private static readonly MAX_CLUTCH_PRESSURE_BAR = 35.0; // 35 bar electro-hydraulic actuator
  private static readonly MAX_YAW_MOMENT_NM = 3200.0;

  /**
   * Solves active cross-axle torque distribution, clutch lockup, and Direct Yaw Moment.
   */
  public static solveActiveYawVectoring(params: ActiveDifferentialSolverParams = {}): ActiveDifferentialState {
    const tDriveNm = Math.max(0.0, Math.min(2500.0, params.inputShaftTorqueNm ?? 850.0));
    const steerDeg = Math.max(-45.0, Math.min(45.0, params.steeringWheelAngleDeg ?? 14.5));
    const vKmh = Math.max(10.0, Math.min(360.0, params.vehicleSpeedKmh ?? 165.0));
    const vMs = (vKmh * 1000.0) / 3600.0;
    const measuredYawDegS = params.measuredYawRateDegPerSec ?? 18.2;
    const rActual = measuredYawDegS * (Math.PI / 180.0);
    const betaDeg = params.vehicleSideslipDeg ?? 2.8;
    const agilityBias = Math.max(-1.0, Math.min(1.0, params.targetAgilityBias ?? 0.35));

    // ────────────────────────────────────────────────────────────────────────
    // 1. Desired Reference Yaw Rate via 2-DOF Bicycle Dynamics
    // ────────────────────────────────────────────────────────────────────────
    const roadWheelSteerRad = (steerDeg / 14.2) * (Math.PI / 180.0); // 14.2:1 steering ratio
    const rTargetSteadyState = (vMs / (this.WHEEL_BASE_M * (1.0 + this.UNDERSTEER_GRADIENT_KUS * Math.pow(vMs, 2)))) * roadWheelSteerRad;

    // Yaw error
    const yawError = rTargetSteadyState - rActual;
    const yawErrorPct = Math.abs(rTargetSteadyState) > 0.01 ? (Math.abs(yawError) / Math.abs(rTargetSteadyState)) * 100.0 : 0.0;

    // ────────────────────────────────────────────────────────────────────────
    // 2. Direct Yaw Moment Feedback Control Law
    // ────────────────────────────────────────────────────────────────────────
    const kP = 4800.0; // N·m per (rad/s)
    const kBeta = -1200.0; // Counter-torque on high sideslip
    let rawMz = (kP * yawError) + (kBeta * (betaDeg * Math.PI / 180.0)) + (agilityBias * 650.0);
    const mZCmd = Math.max(-this.MAX_YAW_MOMENT_NM, Math.min(this.MAX_YAW_MOMENT_NM, rawMz));

    // ────────────────────────────────────────────────────────────────────────
    // 3. Torque Distribution across Left and Right Wheels
    // ────────────────────────────────────────────────────────────────────────
    // M_z = ( (T_right - T_left) / (2 * R_wheel) ) * Track
    // => Delta_T = (2 * R_wheel * M_z) / Track
    const deltaTorqueNm = (2.0 * this.TIRE_ROLLING_RADIUS_M * mZCmd) / this.TRACK_WIDTH_M;

    let tLeft = (tDriveNm / 2.0) - (deltaTorqueNm / 2.0);
    let tRight = (tDriveNm / 2.0) + (deltaTorqueNm / 2.0);

    // Prevent negative torque in purely driven scenario
    if (tLeft < 0) {
      tRight += -tLeft;
      tLeft = 0;
    }
    if (tRight < 0) {
      tLeft += -tRight;
      tRight = 0;
    }

    // ────────────────────────────────────────────────────────────────────────
    // 4. Electro-Hydraulic e-LSD Clutch Lockup Dynamics
    // ────────────────────────────────────────────────────────────────────────
    const torqueBiasAbs = Math.abs(tRight - tLeft);
    const clutchLockRatio = Math.min(1.0, torqueBiasAbs / 1400.0);
    const clutchPressure = clutchLockRatio * this.MAX_CLUTCH_PRESSURE_BAR;

    // Determine Control Regime
    let mode: YawControlMode = 'NEUTRAL_STABILITY_APEX';
    if (Math.abs(steerDeg) > 8.0 && vKmh < 120.0) {
      mode = 'AGILITY_TURN_IN';
    } else if (betaDeg > 4.5) {
      mode = 'POWER_OVERSTEER_DRIFT_LIMIT';
    } else if (tDriveNm > 1200.0) {
      mode = 'TRACTION_CORNER_EXIT';
    }

    return {
      controlMode: mode,
      inputDriveTorqueNm: tDriveNm,
      leftWheelTorqueNm: Math.round(tLeft * 10) / 10,
      rightWheelTorqueNm: Math.round(tRight * 10) / 10,
      crossAxleTorqueBiasNm: Math.round(torqueBiasAbs * 10) / 10,
      directYawMomentNm: Math.round(mZCmd * 10) / 10,
      clutchClampingPressureBar: Math.round(clutchPressure * 10) / 10,
      clutchLockupPercentage: Math.round(clutchLockRatio * 1000) / 10,
      targetYawRateRadPerSec: Math.round(rTargetSteadyState * 1000) / 1000,
      actualYawRateRadPerSec: Math.round(rActual * 1000) / 1000,
      yawRateTrackingErrorPct: Math.round(yawErrorPct * 10) / 10,
      vehicleSideslipAngleDeg: betaDeg,
      isDriftAngleControlled: betaDeg <= 6.5,
      tireLateralGAvailable: Math.round((Math.abs(rActual) * vMs / 9.81) * 100) / 100,
      understeerMitigationGain: Math.round((1.0 + Math.abs(mZCmd) / 1500.0) * 100) / 100,
    };
  }
}
