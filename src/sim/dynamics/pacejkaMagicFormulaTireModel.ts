// ============================================================================
// PHASE 17 — PACEJKA MAGIC FORMULA TIRE MODEL & MULTI-BODY CHASSIS DYNAMICS
// ============================================================================
// Non-linear Pacejka '96 Magic Formula tire friction model and 6-DOF
// vehicle chassis dynamic equations of motion for cornering, roll, and pitch.
// ============================================================================

export interface PacejkaTireParameters {
  B: number; // Stiffness factor
  C: number; // Shape factor (~1.30 for lateral)
  D: number; // Peak friction coefficient (~1.25 to 1.60 for semi-slicks)
  E: number; // Curvature factor (~-0.15)
  nominalVerticalLoadN: number; // e.g. 4000 N
  camberStiffnessNPerDeg: number; // e.g. 80 N/deg
}

export interface TireSlipState {
  slipAngleRad: number; // Lateral slip angle alpha
  slipRatioPct: number; // Longitudinal slip ratio kappa (-100% to +100%)
  camberAngleDeg: number;
  verticalLoadN: number; // Fz
  tireCoreTempC: number;
}

export interface SolvedTireForces {
  lateralForceFyN: number;
  longitudinalForceFxN: number;
  aligningTorqueMzNm: number;
  peakGripUtilizedPct: number;
  tireThermalGripFactor: number;
}

export class PacejkaMagicFormulaTireModel {
  /**
   * Evaluates non-linear lateral force Fy using Pacejka Magic Formula.
   */
  public static solveLateralForce(params: PacejkaTireParameters, state: TireSlipState): SolvedTireForces {
    const Fz = Math.max(100, state.verticalLoadN);
    const alphaDeg = (state.slipAngleRad * 180) / Math.PI;

    // 1. Tire Thermal Grip Curve (Optimal window: 75°C to 105°C)
    let thermalFactor = 1.0;
    if (state.tireCoreTempC < 60) {
      thermalFactor = 0.78 + (state.tireCoreTempC / 60) * 0.22; // Cold tire penalty
    } else if (state.tireCoreTempC > 115) {
      thermalFactor = Math.max(0.70, 1.0 - (state.tireCoreTempC - 115) * 0.012); // Overheating dropoff
    }

    // 2. Load Sensitivity (Coefficient of friction drops as Fz increases)
    const loadFactor = Math.pow(params.nominalVerticalLoadN / Fz, 0.15);
    const peakD = params.D * loadFactor * thermalFactor * Fz;

    // 3. Magic Formula Evaluation: y(x) = D * sin( C * atan( Bx - E(Bx - atan(Bx)) ) )
    const Bx = params.B * alphaDeg;
    const inner = Bx - params.E * (Bx - Math.atan(Bx));
    const rawFy = peakD * Math.sin(params.C * Math.atan(inner));

    // Camber Thrust contribution
    const camberThrustN = params.camberStiffnessNPerDeg * state.camberAngleDeg;
    const totalFy = rawFy + camberThrustN;

    // 4. Combined Slip Coupling (Friction Ellipse)
    const kappaNorm = Math.min(1.0, Math.abs(state.slipRatioPct) / 100);
    const ellipseFactor = Math.sqrt(Math.max(0, 1.0 - kappaNorm * kappaNorm));
    const combinedFy = totalFy * ellipseFactor;

    // 5. Longitudinal Force (Braking / Traction)
    const peakFx = params.D * 1.08 * loadFactor * thermalFactor * Fz;
    const BxLong = 10.0 * (state.slipRatioPct / 100);
    const innerLong = BxLong - (-0.2) * (BxLong - Math.atan(BxLong));
    const rawFx = peakFx * Math.sin(1.65 * Math.atan(innerLong));

    // 6. Pneumatic Trail & Self-Aligning Torque
    const pneumaticTrailM = 0.035 * Math.cos(state.slipAngleRad);
    const aligningTorqueMz = -combinedFy * pneumaticTrailM;

    const totalFrictionN = Math.sqrt(combinedFy * combinedFy + rawFx * rawFx);
    const gripUtilizedPct = Math.min(100, (totalFrictionN / peakD) * 100);

    return {
      lateralForceFyN: Math.round(combinedFy),
      longitudinalForceFxN: Math.round(rawFx),
      aligningTorqueMzNm: Math.round(aligningTorqueMz * 10) / 10,
      peakGripUtilizedPct: Math.round(gripUtilizedPct * 10) / 10,
      tireThermalGripFactor: Math.round(thermalFactor * 100) / 100,
    };
  }
}

export interface VehicleDynamicTelemetry {
  lateralAccelG: number;
  longitudinalAccelG: number;
  yawRateDegPerSec: number;
  chassisRollAngleDeg: number;
  chassisPitchAngleDeg: number;
  wheelLoadsN: { fl: number; fr: number; rl: number; rr: number };
}

export class MultiBodyChassisDynamicsSimulator {
  /**
   * Solves steady-state 6-DOF chassis attitude and 4-wheel dynamic load transfer.
   */
  public static solveChassisAttitude(
    totalMassKg: number,
    frontWeightPct: number,
    wheelbaseM: number,
    trackWidthM: number,
    cgHeightM: number,
    latAccelG: number,
    longAccelG: number,
    rollStiffnessNmPerDeg: number = 2800
  ): VehicleDynamicTelemetry {
    const totalWeightN = totalMassKg * 9.81;
    const staticFrontN = totalWeightN * (frontWeightPct / 100);
    const staticRearN = totalWeightN * (1 - frontWeightPct / 100);

    // Longitudinal Load Transfer: Delta Fz_long = (m * ax * h_cg) / wheelbase
    const longLoadTransferN = (totalMassKg * (longAccelG * 9.81) * cgHeightM) / wheelbaseM;
    const dynamicFrontN = staticFrontN - longLoadTransferN;
    const dynamicRearN = staticRearN + longLoadTransferN;

    // Lateral Load Transfer: Delta Fz_lat = (m * ay * h_cg) / track
    const frontLatTransferN = (dynamicFrontN * (latAccelG * 9.81) * (cgHeightM / trackWidthM)) / 9.81;
    const rearLatTransferN = (dynamicRearN * (latAccelG * 9.81) * (cgHeightM / trackWidthM)) / 9.81;

    const fl = Math.max(0, dynamicFrontN / 2 - frontLatTransferN);
    const fr = Math.max(0, dynamicFrontN / 2 + frontLatTransferN);
    const rl = Math.max(0, dynamicRearN / 2 - rearLatTransferN);
    const rr = Math.max(0, dynamicRearN / 2 + rearLatTransferN);

    // Chassis Roll Angle: phi = (m * ay * h_roll) / K_roll (K_roll in Nm/deg)
    const rollAngleDeg = (totalMassKg * (latAccelG * 9.81) * (cgHeightM - 0.08)) / rollStiffnessNmPerDeg;

    // Chassis Pitch Angle: theta = (m * ax * h_cg) / K_pitch (K_pitch in Nm/deg)
    const pitchStiffnessNmPerDeg = 4500;
    const pitchAngleDeg = (totalMassKg * (longAccelG * 9.81) * cgHeightM) / pitchStiffnessNmPerDeg;

    // Yaw Rate: r = (ay * g) / V
    const speedMs = 35.0; // 126 km/h
    const yawRateRad = (latAccelG * 9.81) / speedMs;
    const yawRateDegPerSec = (yawRateRad * 180) / Math.PI;

    return {
      lateralAccelG: Math.round(latAccelG * 100) / 100,
      longitudinalAccelG: Math.round(longAccelG * 100) / 100,
      yawRateDegPerSec: Math.round(yawRateDegPerSec * 10) / 10,
      chassisRollAngleDeg: Math.round(rollAngleDeg * 100) / 100,
      chassisPitchAngleDeg: Math.round(pitchAngleDeg * 100) / 100,
      wheelLoadsN: {
        fl: Math.round(fl),
        fr: Math.round(fr),
        rl: Math.round(rl),
        rr: Math.round(rr),
      },
    };
  }
}
