// ============================================================================
// MODULE 2: 6-DOF MULTIBODY CHASSIS DYNAMICS & K&C SUSPENSION ENGINE
// ============================================================================
// Full vehicle multi-body kinematics and compliance solver:
// 1. 6-DOF Sprung mass equations of motion (Surge, Sway, Heave, Roll, Pitch, Yaw)
// 2. 4-Corner independent unsprung quarter-car dynamics (2-DOF per corner)
// 3. Dynamic roll center height migration & geometric jacking forces
// 4. Kinematic pitch centers: Anti-dive (front) and anti-squat/anti-lift (rear)
// 5. Exact 4-wheel dynamic load transfer (Elastic + Geometric decomposition)
// 6. Elastokinematic compliance steer & camber change under lateral/braking loads
// 7. Progressive hydraulic bump-stop / packer contact mechanics
// ============================================================================

export interface ChassisDimensions {
  sprungMassKg: number;
  unsprungMassFrontKg: number; // per wheel (e.g. 38 kg)
  unsprungMassRearKg: number;  // per wheel (e.g. 42 kg)
  wheelbaseM: number;          // L
  frontTrackM: number;          // tf
  rearTrackM: number;           // tr
  cgHeightM: number;            // h_cg
  weightDistributionFront: number; // 0 to 1 (e.g. 0.46)
  ixxRollInertiaKgm2: number;
  iyyPitchInertiaKgm2: number;
  izzYawInertiaKgm2: number;
}

export interface SuspensionKinematicsConfig {
  frontSpringRateNpm: number;     // N/m (e.g. 140,000)
  rearSpringRateNpm: number;      // N/m (e.g. 160,000)
  frontArbStiffnessNmRad: number; // Anti-roll bar stiffness (Nm/rad)
  rearArbStiffnessNmRad: number;  // Anti-roll bar stiffness (Nm/rad)
  frontRideHeightNominalM: number;// e.g. 0.035 m (35 mm)
  rearRideHeightNominalM: number; // e.g. 0.045 m (45 mm)
  staticCamberFrontDeg: number;   // e.g. -3.2 deg
  staticCamberRearDeg: number;    // e.g. -2.1 deg
  staticToeFrontDeg: number;      // e.g. +0.1 deg (toe out)
  staticToeRearDeg: number;       // e.g. -0.2 deg (toe in)

  // K&C (Kinematics & Compliance) Parameters
  antiDivePercentFront: number;   // e.g. 28%
  antiSquatPercentRear: number;   // e.g. 35%
  rollCenterHeightFrontStaticM: number; // e.g. 0.045 m
  rollCenterHeightRearStaticM: number;  // e.g. 0.085 m
  camberGainDegPerM: number;      // Camber recovery per meter of bump travel (e.g. 35 deg/m)
  rollCamberGainDegPerDeg: number;// e.g. 0.72 deg camber change per deg chassis roll
  lateralComplianceSteerDegPerKN: number; // Deg toe change per kN lateral load (e.g. 0.08)
  longitudinalComplianceSteerDegPerKN: number; // Deg toe change under braking (e.g. 0.04)
  bumpStopGapM: number;           // Free travel before bump stop engagement (e.g. 0.025 m)
  bumpStopStiffnessNpm: number;   // Non-linear bump stop rate (e.g. 450,000 N/m)
}

export interface ChassisMotionState {
  xPosM: number;
  yPosM: number;
  zHeaveM: number;           // Chassis CG vertical displacement
  vxMs: number;
  vyMs: number;
  vzMs: number;
  rollAngleRad: number;      // phi
  pitchAngleRad: number;     // theta
  yawAngleRad: number;       // psi
  rollRateRads: number;      // p
  pitchRateRads: number;     // q
  yawRateRads: number;       // r
  axG: number;
  ayG: number;
  azG: number;

  // 4 Corner suspension stroke (m, positive in bump)
  strokeFlM: number;
  strokeFrM: number;
  strokeRlM: number;
  strokeRrM: number;

  // Dynamic ride heights (m)
  rideHeightFrontLeftM: number;
  rideHeightFrontRightM: number;
  rideHeightRearLeftM: number;
  rideHeightRearRightM: number;
}

export interface WheelLoadDistribution {
  flLoadN: number;
  frLoadN: number;
  rlLoadN: number;
  rrLoadN: number;
  totalVerticalLoadN: number;
  frontAxleLoadN: number;
  rearAxleLoadN: number;
  leftSideLoadN: number;
  rightSideLoadN: number;
  crossWeightPercent: number; // Diagonal weight percentage: (FL + RR) / Total
  elasticWeightTransferN: number;
  geometricWeightTransferN: number;
  geometricLongTransferN: number;
  elasticLongTransferN: number;
  bumpStopForceFlN: number;
  bumpStopForceFrN: number;
  bumpStopForceRlN: number;
  bumpStopForceRrN: number;
  hasGroundedChassis: boolean;
}

export interface DynamicWheelAngles {
  camberFlDeg: number;
  camberFrDeg: number;
  camberRlDeg: number;
  camberRrDeg: number;
  toeFlDeg: number;
  toeFrDeg: number;
  toeRlDeg: number;
  toeRrDeg: number;
  instantRollCenterHeightFrontM: number;
  instantRollCenterHeightRearM: number;
}

export class MultibodyChassisDynamics {
  public static readonly GRAVITY = 9.80665;

  /**
   * Initializes baseline steady-state chassis motion state.
   */
  public static createChassisState(
    kinematics: SuspensionKinematicsConfig
  ): ChassisMotionState {
    return {
      xPosM: 0,
      yPosM: 0,
      zHeaveM: 0,
      vxMs: 0,
      vyMs: 0,
      vzMs: 0,
      rollAngleRad: 0,
      pitchAngleRad: 0,
      yawAngleRad: 0,
      rollRateRads: 0,
      pitchRateRads: 0,
      yawRateRads: 0,
      axG: 0,
      ayG: 0,
      azG: 1.0,
      strokeFlM: 0,
      strokeFrM: 0,
      strokeRlM: 0,
      strokeRrM: 0,
      rideHeightFrontLeftM: kinematics.frontRideHeightNominalM,
      rideHeightFrontRightM: kinematics.frontRideHeightNominalM,
      rideHeightRearLeftM: kinematics.rearRideHeightNominalM,
      rideHeightRearRightM: kinematics.rearRideHeightNominalM,
    };
  }

  /**
   * Evaluates exact 4-wheel dynamic load distribution under coupled 3D accelerations,
   * aero downforces, suspension spring/ARB rates, and anti-dive/anti-squat link geometry.
   */
  public static computeWheelLoads(
    dimensions: ChassisDimensions,
    kinematics: SuspensionKinematicsConfig,
    axG: number,
    ayG: number,
    downforceFrontN: number = 0,
    downforceRearN: number = 0
  ): { loads: WheelLoadDistribution; angles: DynamicWheelAngles; state: ChassisMotionState } {
    const totalMass = dimensions.sprungMassKg + 2 * dimensions.unsprungMassFrontKg + 2 * dimensions.unsprungMassRearKg;
    const staticTotalWeight = totalMass * MultibodyChassisDynamics.GRAVITY;

    const aDist = dimensions.wheelbaseM * (1.0 - dimensions.weightDistributionFront); // CG to front axle
    const bDist = dimensions.wheelbaseM * dimensions.weightDistributionFront;          // CG to rear axle

    // Static normal load per axle
    const staticFrontAxleWeight = staticTotalWeight * dimensions.weightDistributionFront;
    const staticRearAxleWeight = staticTotalWeight * (1.0 - dimensions.weightDistributionFront);

    // ------------------------------------------------------------------------
    // 1. LONGITUDINAL LOAD TRANSFER (Delta Fz_long)
    // ------------------------------------------------------------------------
    // Total longitudinal weight transfer: dFz_long = (m * ax * g * h_cg) / L
    const deltaFzLongTotal = (totalMass * axG * MultibodyChassisDynamics.GRAVITY * dimensions.cgHeightM) / dimensions.wheelbaseM;

    // Split into anti-geometry (transmitted through links) and elastic (pitch springs)
    const antiPitchFraction = axG < 0
      ? kinematics.antiDivePercentFront / 100.0  // Braking
      : kinematics.antiSquatPercentRear / 100.0; // Acceleration

    const geometricLongTransfer = deltaFzLongTotal * antiPitchFraction;
    const elasticLongTransfer = deltaFzLongTotal * (1.0 - antiPitchFraction);

    // Front/rear axle total dynamic normal loads (including downforce)
    const dynamicFrontAxleLoad = Math.max(50, staticFrontAxleWeight - deltaFzLongTotal + downforceFrontN);
    const dynamicRearAxleLoad = Math.max(50, staticRearAxleWeight + deltaFzLongTotal + downforceRearN);

    // ------------------------------------------------------------------------
    // 2. CHASSIS ROLL & PITCH EQUILIBRIUM
    // ------------------------------------------------------------------------
    // Roll stiffness front & rear (Nm/rad)
    // K_roll = (1/2) * K_spring * track^2 + K_arb
    const kRollSpringFront = 0.5 * kinematics.frontSpringRateNpm * Math.pow(dimensions.frontTrackM, 2);
    const kRollSpringRear = 0.5 * kinematics.rearSpringRateNpm * Math.pow(dimensions.rearTrackM, 2);
    const totalRollStiffnessFront = kRollSpringFront + kinematics.frontArbStiffnessNmRad;
    const totalRollStiffnessRear = kRollSpringRear + kinematics.rearArbStiffnessNmRad;
    const totalRollStiffness = totalRollStiffnessFront + totalRollStiffnessRear;

    // Roll moment: M_roll = m_sprung * ay * g * (h_cg - h_roll_axis)
    const hRollAxis = (kinematics.rollCenterHeightFrontStaticM * bDist + kinematics.rollCenterHeightRearStaticM * aDist) / dimensions.wheelbaseM;
    const rollMomentArm = Math.max(0.05, dimensions.cgHeightM - hRollAxis);
    const rollMoment = dimensions.sprungMassKg * ayG * MultibodyChassisDynamics.GRAVITY * rollMomentArm;

    // Steady-state roll angle: phi = M_roll / (K_roll - m_sprung * g * arm)
    const rollDivergenceFactor = totalRollStiffness - dimensions.sprungMassKg * MultibodyChassisDynamics.GRAVITY * rollMomentArm;
    const rollAngleRad = rollMoment / Math.max(1000, rollDivergenceFactor);

    // Pitch moment: M_pitch = elasticLongTransfer * wheelbase
    const pitchStiffnessFront = kinematics.frontSpringRateNpm * Math.pow(aDist, 2) * 2;
    const pitchStiffnessRear = kinematics.rearSpringRateNpm * Math.pow(bDist, 2) * 2;
    const totalPitchStiffness = pitchStiffnessFront + pitchStiffnessRear;
    const pitchMoment = elasticLongTransfer * dimensions.wheelbaseM;
    const pitchAngleRad = pitchMoment / Math.max(5000, totalPitchStiffness);

    // ------------------------------------------------------------------------
    // 3. LATERAL LOAD TRANSFER (Delta Fz_lat front & rear)
    // ------------------------------------------------------------------------
    // Front elastic lateral transfer
    const deltaFzLatElasticFront = (totalRollStiffnessFront * rollAngleRad) / dimensions.frontTrackM;
    // Front geometric lateral transfer (through instantaneous roll center)
    const deltaFzLatGeometricFront = (staticFrontAxleWeight * ayG * kinematics.rollCenterHeightFrontStaticM) / dimensions.frontTrackM;
    const deltaFzLatFrontTotal = deltaFzLatElasticFront + deltaFzLatGeometricFront;

    // Rear elastic lateral transfer
    const deltaFzLatElasticRear = (totalRollStiffnessRear * rollAngleRad) / dimensions.rearTrackM;
    // Rear geometric lateral transfer
    const deltaFzLatGeometricRear = (staticRearAxleWeight * ayG * kinematics.rollCenterHeightRearStaticM) / dimensions.rearTrackM;
    const deltaFzLatRearTotal = deltaFzLatElasticRear + deltaFzLatGeometricRear;

    // ------------------------------------------------------------------------
    // 4. CORNER SUSPENSION DEFLECTION & BUMP STOPS
    // ------------------------------------------------------------------------
    // Vertical travel at each corner: heave + pitch * distance +/- roll * (track / 2)
    const heaveFront = (downforceFrontN - deltaFzLongTotal) / (2 * kinematics.frontSpringRateNpm);
    const heaveRear = (downforceRearN + deltaFzLongTotal) / (2 * kinematics.rearSpringRateNpm);

    const strokeFl = heaveFront + (rollAngleRad * dimensions.frontTrackM * 0.5);
    const strokeFr = heaveFront - (rollAngleRad * dimensions.frontTrackM * 0.5);
    const strokeRl = heaveRear + (rollAngleRad * dimensions.rearTrackM * 0.5);
    const strokeRr = heaveRear - (rollAngleRad * dimensions.rearTrackM * 0.5);

    // Progressive non-linear bump stop forces
    const computeBumpStopForce = (stroke: number): number => {
      if (stroke <= kinematics.bumpStopGapM) return 0;
      const compression = stroke - kinematics.bumpStopGapM;
      return kinematics.bumpStopStiffnessNpm * compression * (1.0 + 40.0 * compression);
    };

    const bumpFl = computeBumpStopForce(strokeFl);
    const bumpFr = computeBumpStopForce(strokeFr);
    const bumpRl = computeBumpStopForce(strokeRl);
    const bumpRr = computeBumpStopForce(strokeRr);

    // Dynamic ride heights
    const rhFl = Math.max(0.001, kinematics.frontRideHeightNominalM - strokeFl);
    const rhFr = Math.max(0.001, kinematics.frontRideHeightNominalM - strokeFr);
    const rhRl = Math.max(0.001, kinematics.rearRideHeightNominalM - strokeRl);
    const rhRr = Math.max(0.001, kinematics.rearRideHeightNominalM - strokeRr);
    const hasGrounded = rhFl <= 0.005 || rhFr <= 0.005 || rhRl <= 0.005 || rhRr <= 0.005;

    // ------------------------------------------------------------------------
    // 5. FINAL 4 WHEEL VERTICAL LOADS
    // ------------------------------------------------------------------------
    const flLoad = Math.max(10, (dynamicFrontAxleLoad / 2.0) - deltaFzLatFrontTotal + bumpFl);
    const frLoad = Math.max(10, (dynamicFrontAxleLoad / 2.0) + deltaFzLatFrontTotal + bumpFr);
    const rlLoad = Math.max(10, (dynamicRearAxleLoad / 2.0) - deltaFzLatRearTotal + bumpRl);
    const rrLoad = Math.max(10, (dynamicRearAxleLoad / 2.0) + deltaFzLatRearTotal + bumpRr);

    const totalDynamicLoad = flLoad + frLoad + rlLoad + rrLoad;
    const crossWeight = ((flLoad + rrLoad) / totalDynamicLoad) * 100.0;

    // ------------------------------------------------------------------------
    // 6. DYNAMIC WHEEL ALIGNMENT (CAMBER & TOE WITH COMPLIANCE)
    // ------------------------------------------------------------------------
    const rollDeg = rollAngleRad * (180.0 / Math.PI);

    // Dynamic camber = static + bump camber gain - roll recovery
    const camberFl = kinematics.staticCamberFrontDeg + strokeFl * kinematics.camberGainDegPerM - rollDeg * kinematics.rollCamberGainDegPerDeg;
    const camberFr = kinematics.staticCamberFrontDeg + strokeFr * kinematics.camberGainDegPerM + rollDeg * kinematics.rollCamberGainDegPerDeg;
    const camberRl = kinematics.staticCamberRearDeg + strokeRl * kinematics.camberGainDegPerM - rollDeg * kinematics.rollCamberGainDegPerDeg;
    const camberRr = kinematics.staticCamberRearDeg + strokeRr * kinematics.camberGainDegPerM + rollDeg * kinematics.rollCamberGainDegPerDeg;

    // Elastokinematic compliance steer
    const lateralForceAxleFront = totalMass * ayG * MultibodyChassisDynamics.GRAVITY * dimensions.weightDistributionFront;
    const complianceSteerFrontDeg = (lateralForceAxleFront / 2000.0) * kinematics.lateralComplianceSteerDegPerKN;

    const toeFl = kinematics.staticToeFrontDeg + complianceSteerFrontDeg;
    const toeFr = kinematics.staticToeFrontDeg - complianceSteerFrontDeg;
    const toeRl = kinematics.staticToeRearDeg + (complianceSteerFrontDeg * 0.4);
    const toeRr = kinematics.staticToeRearDeg - (complianceSteerFrontDeg * 0.4);

    // Instant roll center migration with stroke
    const instantRcFront = kinematics.rollCenterHeightFrontStaticM - (strokeFl + strokeFr) * 0.35;
    const instantRcRear = kinematics.rollCenterHeightRearStaticM - (strokeRl + strokeRr) * 0.42;

    const state: ChassisMotionState = {
      xPosM: 0,
      yPosM: 0,
      zHeaveM: (heaveFront + heaveRear) / 2.0,
      vxMs: 0,
      vyMs: 0,
      vzMs: 0,
      rollAngleRad,
      pitchAngleRad,
      yawAngleRad: 0,
      rollRateRads: 0,
      pitchRateRads: 0,
      yawRateRads: 0,
      axG,
      ayG,
      azG: totalDynamicLoad / staticTotalWeight,
      strokeFlM: strokeFl,
      strokeFrM: strokeFr,
      strokeRlM: strokeRl,
      strokeRrM: strokeRr,
      rideHeightFrontLeftM: rhFl,
      rideHeightFrontRightM: rhFr,
      rideHeightRearLeftM: rhRl,
      rideHeightRearRightM: rhRr,
    };

    return {
      loads: {
        flLoadN: Number(flLoad.toFixed(1)),
        frLoadN: Number(frLoad.toFixed(1)),
        rlLoadN: Number(rlLoad.toFixed(1)),
        rrLoadN: Number(rrLoad.toFixed(1)),
        totalVerticalLoadN: Number(totalDynamicLoad.toFixed(1)),
        frontAxleLoadN: Number((flLoad + frLoad).toFixed(1)),
        rearAxleLoadN: Number((rlLoad + rrLoad).toFixed(1)),
        leftSideLoadN: Number((flLoad + rlLoad).toFixed(1)),
        rightSideLoadN: Number((frLoad + rrLoad).toFixed(1)),
        crossWeightPercent: Number(crossWeight.toFixed(2)),
        elasticWeightTransferN: deltaFzLatElasticFront + deltaFzLatElasticRear,
        geometricWeightTransferN: Math.abs(geometricLongTransfer) + deltaFzLatGeometricFront + deltaFzLatGeometricRear,
        geometricLongTransferN: Number(geometricLongTransfer.toFixed(1)),
        elasticLongTransferN: Number(elasticLongTransfer.toFixed(1)),
        bumpStopForceFlN: bumpFl,
        bumpStopForceFrN: bumpFr,
        bumpStopForceRlN: bumpRl,
        bumpStopForceRrN: bumpRr,
        hasGroundedChassis: hasGrounded,
      },
      angles: {
        camberFlDeg: Number(camberFl.toFixed(2)),
        camberFrDeg: Number(camberFr.toFixed(2)),
        camberRlDeg: Number(camberRl.toFixed(2)),
        camberRrDeg: Number(camberRr.toFixed(2)),
        toeFlDeg: Number(toeFl.toFixed(2)),
        toeFrDeg: Number(toeFr.toFixed(2)),
        toeRlDeg: Number(toeRl.toFixed(2)),
        toeRrDeg: Number(toeRr.toFixed(2)),
        instantRollCenterHeightFrontM: Number(instantRcFront.toFixed(4)),
        instantRollCenterHeightRearM: Number(instantRcRear.toFixed(4)),
      },
      state,
    };
  }
}
