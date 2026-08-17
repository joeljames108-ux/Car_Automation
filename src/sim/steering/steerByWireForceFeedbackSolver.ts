// ============================================================================
// PHASE 69 — STEER-BY-WIRE (SbW) FORCE FEEDBACK & VIRTUAL RACK SOLVER
// ============================================================================
// Decoupled dual-channel fail-operational Handwheel Actuator (HWA) haptics,
// non-linear pneumatic trail rack force synthesis, Dahl friction hysteresis,
// variable speed-dependent steering ratio (8.5:1 to 16.5:1), and virtual soft end-stops.
// ============================================================================

export type SbwRedundancyChannelState = 'DUAL_CHANNEL_ACTIVE' | 'PRIMARY_ONLY_FALLBACK' | 'SECONDARY_ONLY_FALLBACK' | 'SAFE_STOP_DEGRADED';

export interface SbwHapticComponentBreakdown {
  aligningTorqueFeedbackNm: number;
  nonLinearCenteringSpringNm: number;
  coulombDahlFrictionHysteresisNm: number;
  viscousDampingTorqueNm: number;
  virtualEndStopTorqueNm: number;
  totalSynthesizedTorqueNm: number;
}

export interface SteerByWireState {
  handwheelAngleDeg: number;
  handwheelAngularVelocityDegSec: number;
  roadWheelAngleDeg: number;
  variableSteeringRatio: number;
  handwheelFeedbackTorqueNm: number;
  hapticComponents: SbwHapticComponentBreakdown;
  virtualRackForceKn: number;
  aligningTorqueSynthesizedNm: number;
  rwaTrackingLatencyMs: number;
  rwaPositionTrackingErrorDeg: number;
  redundancyState: SbwRedundancyChannelState;
  isFailOperationalRedundant: boolean;
  channelAHealthPct: number;
  channelBHealthPct: number;
  powerConsumptionWatts: number;
}

export class SteerByWireForceFeedbackSolver {
  private static readonly MAX_HANDWHEEL_LOCK_DEG = 360.0; // +/- 1 turn full lock
  private static readonly MAX_ERGONOMIC_FEEDBACK_NM = 6.5;

  /**
   * Calculates Dahl friction hysteresis for realistic steering center feel.
   */
  public static calculateDahlFriction(
    omegaH: number,
    frictionLimitNm: number = 0.45,
    stiffness: number = 0.12
  ): number {
    if (Math.abs(omegaH) < 0.1) return 0.0;
    const sgn = Math.sign(omegaH);
    return sgn * frictionLimitNm * (1.0 - Math.exp(-Math.abs(omegaH) / (frictionLimitNm / stiffness)));
  }

  /**
   * Evaluates Steer-by-Wire handwheel haptic feedback torque, rack forces, and road wheel angles.
   */
  public static evaluateSteerByWire(params: {
    handwheelAngleDeg: number;
    handwheelAngularVelocityDegSec: number;
    vehicleSpeedKmh: number;
    frontLateralForceN: number;
    pneumaticTrailM?: number;
    mechanicalCasterTrailM?: number;
    pinionRadiusMm?: number;
    channelAFaultSimulated?: boolean;
    channelBFaultSimulated?: boolean;
  }): SteerByWireState {
    const deltaH = params.handwheelAngleDeg;
    const omegaH = params.handwheelAngularVelocityDegSec;
    const speed = params.vehicleSpeedKmh;
    const fyF = params.frontLateralForceN;
    const pTrailM = params.pneumaticTrailM ?? 0.032; // 32mm pneumatic trail
    const cTrailM = params.mechanicalCasterTrailM ?? 0.018; // 18mm mechanical caster
    const rPinionM = (params.pinionRadiusMm || 38.0) / 1000;

    // 1. Dual-Channel Fail-Operational Redundancy Health Check
    const faultA = params.channelAFaultSimulated ?? false;
    const faultB = params.channelBFaultSimulated ?? false;

    let redundancy: SbwRedundancyChannelState = 'DUAL_CHANNEL_ACTIVE';
    let healthA = faultA ? 0 : 100;
    let healthB = faultB ? 0 : 100;

    if (faultA && faultB) {
      redundancy = 'SAFE_STOP_DEGRADED';
    } else if (faultA) {
      redundancy = 'SECONDARY_ONLY_FALLBACK';
    } else if (faultB) {
      redundancy = 'PRIMARY_ONLY_FALLBACK';
    }

    // 2. Variable Speed-Dependent Steering Ratio Curve
    // Parking (< 15 km/h): fast 8.5:1 (direct, low hand effort)
    // City (15 - 80 km/h): progressive 11.5:1
    // Highway (> 120 km/h): stable 15.5:1 - 16.5:1
    const speedRatioBlend = Math.min(1.0, Math.pow(speed / 140, 1.25));
    const variableRatio = 8.5 + speedRatioBlend * 7.5; // 8.5:1 up to 16.0:1

    // 3. Road Wheel Angle (RWA) Command
    const roadWheelDeg = deltaH / variableRatio;

    // 4. Virtual Rack Force Synthesis: F_rack = 2 * (Fy * (pTrail + cTrail)) / r_pinion
    const totalTrailM = pTrailM + cTrailM;
    const aligningTorqueTireNm = fyF * totalTrailM;
    const rackForceN = (aligningTorqueTireNm * 2.0) / Math.max(0.01, rPinionM);
    const virtualRackForceKn = rackForceN / 1000;

    // 5. Handwheel Feedback Torque Components
    // A. Reflected Aligning Torque from Rack
    const rawAligningNm = (aligningTorqueTireNm / variableRatio) * 0.48;

    // B. Non-Linear Centering Spring (k1 * delta + k3 * delta^3)
    const k1 = 0.018 + (speed / 120) * 0.038;
    const k3 = 0.000008;
    const centeringSpringNm = k1 * deltaH + k3 * Math.pow(deltaH, 3);

    // C. Dahl Coulomb Friction Hysteresis
    const frictionLimit = 0.35 + (speed / 150) * 0.20;
    const dahlFrictionNm = this.calculateDahlFriction(omegaH, frictionLimit);

    // D. Speed-Sensitive Viscous Damping
    const cDamping = 0.006 + (speed / 200) * 0.012;
    const viscousDampingNm = cDamping * omegaH;

    // E. Virtual Soft End-Stops (Progressive spring wall when approaching +/- 360 deg lock)
    let virtualEndStopNm = 0;
    if (Math.abs(deltaH) > this.MAX_HANDWHEEL_LOCK_DEG) {
      const overDeg = Math.abs(deltaH) - this.MAX_HANDWHEEL_LOCK_DEG;
      virtualEndStopNm = Math.sign(deltaH) * (overDeg * 0.45 + Math.sign(omegaH) * 1.2);
    }

    // F. Total Handwheel Actuator Feedback Torque
    const rawTotalTorque =
      rawAligningNm + centeringSpringNm + dahlFrictionNm + viscousDampingNm + virtualEndStopNm;
    const cappedFeedbackTorque = Math.max(-this.MAX_ERGONOMIC_FEEDBACK_NM, Math.min(this.MAX_ERGONOMIC_FEEDBACK_NM, rawTotalTorque));

    // 6. RWA Latency and Power Consumption
    const rwaLatencyMs = redundancy === 'DUAL_CHANNEL_ACTIVE' ? 10.5 : 14.8;
    const trackingErrorDeg = 0.08 + (Math.abs(omegaH) / 100) * 0.04;
    const powerW = 45 + (Math.abs(cappedFeedbackTorque) / this.MAX_ERGONOMIC_FEEDBACK_NM) * 280;

    return {
      handwheelAngleDeg: Math.round(deltaH * 10) / 10,
      handwheelAngularVelocityDegSec: Math.round(omegaH * 10) / 10,
      roadWheelAngleDeg: Math.round(roadWheelDeg * 100) / 100,
      variableSteeringRatio: Math.round(variableRatio * 10) / 10,
      handwheelFeedbackTorqueNm: Math.round(cappedFeedbackTorque * 100) / 100,
      hapticComponents: {
        aligningTorqueFeedbackNm: Math.round(rawAligningNm * 100) / 100,
        nonLinearCenteringSpringNm: Math.round(centeringSpringNm * 100) / 100,
        coulombDahlFrictionHysteresisNm: Math.round(dahlFrictionNm * 100) / 100,
        viscousDampingTorqueNm: Math.round(viscousDampingNm * 100) / 100,
        virtualEndStopTorqueNm: Math.round(virtualEndStopNm * 100) / 100,
        totalSynthesizedTorqueNm: Math.round(rawTotalTorque * 100) / 100,
      },
      virtualRackForceKn: Math.round(virtualRackForceKn * 100) / 100,
      aligningTorqueSynthesizedNm: Math.round(aligningTorqueTireNm * 100) / 100,
      rwaTrackingLatencyMs: rwaLatencyMs,
      rwaPositionTrackingErrorDeg: Math.round(trackingErrorDeg * 100) / 100,
      redundancyState: redundancy,
      isFailOperationalRedundant: redundancy !== 'SAFE_STOP_DEGRADED',
      channelAHealthPct: healthA,
      channelBHealthPct: healthB,
      powerConsumptionWatts: Math.round(powerW),
    };
  }
}
