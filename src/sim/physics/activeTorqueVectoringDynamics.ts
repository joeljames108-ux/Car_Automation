// ============================================================================
// MODULE 17: ACTIVE TORQUE VECTORING & DIRECT YAW MOMENT CONTROL (TV-DYC)
// ============================================================================
// State-feedback closed-loop active yaw torque vectoring system.
// Calculates target yaw rate from 2-DOF dynamic bicycle model with understeer
// gradient compensation, resolves required direct yaw moment Delta_Mz,
// allocates asymmetric left/right wheel torques, and regulates wheel slip
// via sliding-mode traction control and Brake-By-Wire regen blending.
// ============================================================================

export interface TorqueVectoringVehicleState {
  speedMs: number;
  steeringWheelAngleRad: number;
  actualYawRateRadS: number;
  actualYawAccelRadS2: number;
  lateralAccelMs2: number;
  wheelbaseM: number;
  frontTrackWidthM: number;
  rearTrackWidthM: number;
  tireRadiusM: number;
  steerRatio: number;
  totalDriveTorqueNm: number;
  totalBrakeTorqueNm: number;
  wheelSlipRatioFL: number;
  wheelSlipRatioFR: number;
  wheelSlipRatioRL: number;
  wheelSlipRatioRR: number;
  tireGripCoeff: number;
}

export interface TorqueVectoringParameters {
  understeerGradientRadPerG: number; // e.g. 0.02 rad/g
  kpYawMoment: number;               // Proportional gain (N*m / (rad/s))
  kdYawMoment: number;               // Derivative gain (N*m / (rad/s^2))
  kiYawMoment: number;               // Integral gain (N*m / rad)
  maxYawMomentNm: number;            // Peak allowable vectoring moment (e.g. 2400 N*m)
  targetSlipRatio: number;           // Optimal traction slip (0.11)
  maxRegenTorqueNm: number;          // MGU-K peak regenerative torque (e.g. 950 N*m)
  frontBrakeBias: number;            // 0.58 front
}

export interface ActiveTorqueVectoringResult {
  targetYawRateRadS: number;
  yawRateErrorRadS: number;
  directYawMomentDemandNm: number;
  frontLeftWheelTorqueNm: number;
  frontRightWheelTorqueNm: number;
  rearLeftWheelTorqueNm: number;
  rearRightWheelTorqueNm: number;
  tractionControlActive: boolean;
  tractionControlTorqueCutNm: number;
  regenBrakeTorqueNm: number;
  frictionRearBrakeTorqueNm: number;
  frictionFrontBrakeTorqueNm: number;
  vehicleHandlingState: 'NEUTRAL' | 'UNDERSTEER_CORRECTION' | 'OVERSTEER_CORRECTION';
}

export class ActiveTorqueVectoringDynamics {
  private static accumulatedYawError: number = 0.0;

  public static resetIntegrator(): void {
    this.accumulatedYawError = 0.0;
  }

  /**
   * Evaluates active torque vectoring, yaw moment control, TC, and BBW regen blending.
   */
  public static evaluate(
    state: TorqueVectoringVehicleState,
    params: TorqueVectoringParameters,
    dtSeconds: number = 0.01
  ): ActiveTorqueVectoringResult {
    const vx = Math.max(1.0, state.speedMs);
    const roadSteerAngle = state.steeringWheelAngleRad / state.steerRatio;

    // ------------------------------------------------------------------------
    // 1. TARGET YAW RATE FROM 2-DOF BICYCLE MODEL WITH UNDERSTEER GRADIENT
    // ------------------------------------------------------------------------
    // Understeer gradient K_us converted to rad/(m/s^2):
    const Kus = params.understeerGradientRadPerG / 9.80665;
    // Steady-state linear target yaw rate:
    const rTargetRaw = (vx * roadSteerAngle) / (state.wheelbaseM + Kus * vx * vx);

    // Friction limit saturation: target yaw rate cannot exceed available tire-road friction
    const rLimit = (state.tireGripCoeff * 9.80665) / vx;
    const targetYawRate = Math.min(rLimit, Math.max(-rLimit, rTargetRaw));

    // ------------------------------------------------------------------------
    // 2. STATE-FEEDBACK CLOSED-LOOP YAW MOMENT CALCULATION (DYC)
    // ------------------------------------------------------------------------
    const yawError = targetYawRate - state.actualYawRateRadS;
    this.accumulatedYawError += yawError * dtSeconds;
    // Anti-windup clamping
    this.accumulatedYawError = Math.min(0.25, Math.max(-0.25, this.accumulatedYawError));

    const yawAccelError = -state.actualYawAccelRadS2; // Derivative of error assuming target changes smoothly

    let directYawMoment =
      params.kpYawMoment * yawError +
      params.kdYawMoment * yawAccelError +
      params.kiYawMoment * this.accumulatedYawError;

    // Limit yaw moment to maximum allowable drivetrain authority
    directYawMoment = Math.min(params.maxYawMomentNm, Math.max(-params.maxYawMomentNm, directYawMoment));

    let handlingState: 'NEUTRAL' | 'UNDERSTEER_CORRECTION' | 'OVERSTEER_CORRECTION' = 'NEUTRAL';
    if (Math.abs(yawError) > 0.035) {
      // If road steer is positive (turning left) and yaw rate is less than target -> Understeer
      if ((roadSteerAngle > 0 && yawError > 0) || (roadSteerAngle < 0 && yawError < 0)) {
        handlingState = 'UNDERSTEER_CORRECTION';
      } else {
        handlingState = 'OVERSTEER_CORRECTION';
      }
    }

    // ------------------------------------------------------------------------
    // 3. TRACTION CONTROL (TC) SLIDING-MODE SLIP RATIO REGULATOR
    // ------------------------------------------------------------------------
    const drivenSlipMax = Math.max(state.wheelSlipRatioRL, state.wheelSlipRatioRR);
    let tcCutNm = 0.0;
    let tcActive = false;

    if (drivenSlipMax > params.targetSlipRatio + 0.02 && state.totalDriveTorqueNm > 50.0) {
      tcActive = true;
      const excessSlip = drivenSlipMax - params.targetSlipRatio;
      // Sliding mode proportional cut
      tcCutNm = Math.min(state.totalDriveTorqueNm * 0.85, excessSlip * 4500.0);
    }

    const netDriveTorque = Math.max(0, state.totalDriveTorqueNm - tcCutNm);

    // ------------------------------------------------------------------------
    // 4. ASYMMETRIC REAR-AXLE TORQUE ALLOCATION
    // ------------------------------------------------------------------------
    // Delta_Torque on rear axle to produce Delta_Mz:
    // Delta_Mz = (Delta_F_x) * (trackWidth / 2) = (Delta_T / r_tire) * (trackWidth / 2)
    // => Delta_T = (2 * Delta_Mz * r_tire) / trackWidth
    const deltaRearTorque = (2.0 * directYawMoment * state.tireRadiusM) / state.rearTrackWidthM;

    // Base torque split (50/50 nominal)
    const baseRearTorquePerWheel = netDriveTorque * 0.5;

    let rearLeftTorque = baseRearTorquePerWheel - deltaRearTorque * 0.5;
    let rearRightTorque = baseRearTorquePerWheel + deltaRearTorque * 0.5;

    // Prevent negative torque during pure acceleration unless vehicle is electric with bi-directional inverters
    if (state.totalDriveTorqueNm > 0) {
      if (rearLeftTorque < 0) {
        rearRightTorque += Math.abs(rearLeftTorque);
        rearLeftTorque = 0;
      } else if (rearRightTorque < 0) {
        rearLeftTorque += Math.abs(rearRightTorque);
        rearRightTorque = 0;
      }
    }

    // ------------------------------------------------------------------------
    // 5. BRAKE-BY-WIRE (BBW) REGEN & FRICTION SPLIT
    // ------------------------------------------------------------------------
    const totalBrake = state.totalBrakeTorqueNm;
    const demandedFrontBrake = totalBrake * params.frontBrakeBias;
    const demandedRearBrake = totalBrake * (1.0 - params.frontBrakeBias);

    // MGU-K regenerative braking limit
    const regenBrakeTorque = Math.min(demandedRearBrake, params.maxRegenTorqueNm);
    const frictionRearBrake = Math.max(0, demandedRearBrake - regenBrakeTorque);
    const frictionFrontBrake = demandedFrontBrake;

    return {
      targetYawRateRadS: Number(targetYawRate.toFixed(4)),
      yawRateErrorRadS: Number(yawError.toFixed(4)),
      directYawMomentDemandNm: Number(directYawMoment.toFixed(1)),
      frontLeftWheelTorqueNm: 0, // Rear-wheel drive baseline
      frontRightWheelTorqueNm: 0,
      rearLeftWheelTorqueNm: Number(rearLeftTorque.toFixed(1)),
      rearRightWheelTorqueNm: Number(rearRightTorque.toFixed(1)),
      tractionControlActive: tcActive,
      tractionControlTorqueCutNm: Number(tcCutNm.toFixed(1)),
      regenBrakeTorqueNm: Number(regenBrakeTorque.toFixed(1)),
      frictionRearBrakeTorqueNm: Number(frictionRearBrake.toFixed(1)),
      frictionFrontBrakeTorqueNm: Number(frictionFrontBrake.toFixed(1)),
      vehicleHandlingState: handlingState,
    };
  }
}
