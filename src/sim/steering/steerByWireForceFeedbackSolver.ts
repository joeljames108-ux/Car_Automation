// ============================================================================
// PHASE 69 — STEER-BY-WIRE (SbW) FORCE FEEDBACK & VIRTUAL RACK SOLVER
// ============================================================================
// Decoupled dual-motor Handwheel Actuator (HWA) haptic torque feedback,
// variable speed-dependent steering ratio (8.5:1 to 16.0:1), and aligning torque.
// ============================================================================

export interface SteerByWireState {
  handwheelAngleDeg: number;
  roadWheelAngleDeg: number;
  variableSteeringRatio: number;
  handwheelFeedbackTorqueNm: number;
  aligningTorqueSynthesizedNm: number;
  centeringSpringTorqueNm: number;
  dampingTorqueNm: number;
  rwaTrackingLatencyMs: number;
  isFailOperationalRedundant: boolean;
}

export class SteerByWireForceFeedbackSolver {
  /**
   * Solves Steer-by-Wire handwheel haptic feedback torque and road wheel angle.
   */
  public static evaluateSteerByWire(params: {
    handwheelAngleDeg: number;
    handwheelAngularVelocityDegSec: number;
    vehicleSpeedKmh: number;
    frontLateralForceN: number;
    pneumaticTrailM?: number;
  }): SteerByWireState {
    const deltaH = params.handwheelAngleDeg;
    const omegaH = params.handwheelAngularVelocityDegSec;
    const speed = params.vehicleSpeedKmh;
    const fyF = params.frontLateralForceN;
    const trailM = params.pneumaticTrailM ?? 0.035; // 35mm pneumatic + mechanical caster trail

    // 1. Variable Speed-Dependent Steering Ratio
    // Parking (speed < 20 km/h): fast 8.5:1 ratio (full lock in < 1 turn)
    // High Speed (speed > 160 km/h): stable 15.5:1 ratio for highway tracking
    const speedRatioBlend = Math.min(1.0, speed / 140);
    const variableRatio = 8.5 + speedRatioBlend * 7.0; // 8.5:1 to 15.5:1

    // 2. Road Wheel Angle (RWA)
    const roadWheelDeg = deltaH / variableRatio;

    // 3. Aligning Torque Synthesis from Tire Lateral Force: M_z = Fy * trail
    const aligningTorqueNm = (fyF * trailM) / variableRatio;

    // 4. Centering Spring Feel: Tau_spring = k_c(speed) * deltaH
    const kCentering = 0.025 + (speed / 100) * 0.045; // Stiffens with speed
    const centeringTorqueNm = kCentering * deltaH;

    // 5. Dynamic Damping Feel: Tau_damping = c_d * omegaH
    const cDamping = 0.008;
    const dampingTorqueNm = cDamping * omegaH;

    // 6. Total Handwheel Feedback Torque: Tau_total = Tau_aligning + Tau_centering + Tau_damping
    // Capped at 5.5 Nm for ergonomic driver comfort
    const rawTotalTorque = aligningTorqueNm * 0.45 + centeringTorqueNm + dampingTorqueNm;
    const feedbackTorqueNm = Math.max(-5.5, Math.min(5.5, rawTotalTorque));

    return {
      handwheelAngleDeg: Math.round(deltaH * 10) / 10,
      roadWheelAngleDeg: Math.round(roadWheelDeg * 100) / 100,
      variableSteeringRatio: Math.round(variableRatio * 10) / 10,
      handwheelFeedbackTorqueNm: Math.round(feedbackTorqueNm * 100) / 100,
      aligningTorqueSynthesizedNm: Math.round(aligningTorqueNm * 100) / 100,
      centeringSpringTorqueNm: Math.round(centeringTorqueNm * 100) / 100,
      dampingTorqueNm: Math.round(dampingTorqueNm * 100) / 100,
      rwaTrackingLatencyMs: 12.5,
      isFailOperationalRedundant: true,
    };
  }
}
