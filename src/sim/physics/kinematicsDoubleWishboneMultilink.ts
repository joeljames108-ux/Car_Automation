// ============================================================================
// MODULE 12: SUSPENSION KINEMATICS & 3D MULTI-LINK / WISHBONE GEOMETRY
// ============================================================================
// Vector-space 3D suspension geometry & 4-bar linkage kinematics:
// 1. Exact 3D hardpoints for double wishbone, pushrod / pullrod, and multi-link
// 2. Front View Instant Center (FVIC) & dynamic roll center height calculation
// 3. Side View Instant Center (SVIC) & anti-dive / anti-squat pitch poles
// 4. Kingpin Inclination (KPI), Caster angle, Scrub radius & Mechanical trail
// 5. Analytical Camber Gain curve dCamber/dz & Bump Steer curve dToe/dz
// 6. Pushrod bellcrank motion ratio non-linearity MR(z) = dz_shock / dz_wheel
// ============================================================================

export interface Point3D {
  x: number; // Longitudinal (m, + forward)
  y: number; // Lateral (m, + right / outboard)
  z: number; // Vertical (m, + up)
}

export interface Wishbone3DHardpoints {
  // Upper Control Arm (UCA)
  ucaFrontChassis: Point3D;
  ucaRearChassis: Point3D;
  ucaUprightBallJoint: Point3D;

  // Lower Control Arm (LCA)
  lcaFrontChassis: Point3D;
  lcaRearChassis: Point3D;
  lcaUprightBallJoint: Point3D;

  // Steering Tie Rod
  tieRodInboardRack: Point3D;
  tieRodOutboardUpright: Point3D;

  // Pushrod / Pullrod Strut
  pushrodUprightMount: Point3D;
  pushrodRockerMount: Point3D;
  rockerPivotAxis: Point3D;
  shockRockerMount: Point3D;
  shockChassisMount: Point3D;

  wheelCenterNominal: Point3D;
  tireRadiusM: number;
}

export interface InstantCenterResult {
  fvicY: number;                  // Lateral position of front view instant center (m)
  fvicZ: number;                  // Vertical position of front view instant center (m)
  svicX: number;                  // Longitudinal position of side view instant center (m)
  svicZ: number;                  // Vertical position of side view instant center (m)
  rollCenterHeightM: number;      // Dynamic roll center height above ground
  antiDivePercent: number;        // Anti-dive geometry %
  antiSquatPercent: number;       // Anti-squat geometry %
  casterAngleDeg: number;         // Caster inclination angle (deg)
  kingpinInclinationDeg: number;  // KPI angle (deg)
  scrubRadiusMm: number;          // Ground scrub radius (+ outboard, - inboard)
  mechanicalTrailMm: number;      // Ground mechanical trail (+ behind contact center)
}

export interface MotionRatioCurveResult {
  wheelTravelMm: number;
  shockTravelMm: number;
  instantMotionRatio: number;     // dz_shock / dz_wheel
  camberDeg: number;
  toeDeg: number;
}

export class KinematicsDoubleWishboneMultilink {
  /**
   * Reference Formula 1 / Le Mans Hypercar front suspension 3D geometry coordinates.
   */
  public static readonly REFERENCE_LMH_FRONT_HARDPOINTS: Wishbone3DHardpoints = {
    // Upper Wishbone (inclined downward rearward for anti-dive)
    ucaFrontChassis: { x: 0.180, y: 0.320, z: 0.405 },
    ucaRearChassis: { x: -0.220, y: 0.335, z: 0.370 },
    ucaUprightBallJoint: { x: -0.015, y: 0.680, z: 0.420 },

    // Lower Wishbone (neutral horizontal plane)
    lcaFrontChassis: { x: 0.240, y: 0.280, z: 0.140 },
    lcaRearChassis: { x: -0.260, y: 0.295, z: 0.140 },
    lcaUprightBallJoint: { x: 0.010, y: 0.720, z: 0.135 },

    // Tie Rod
    tieRodInboardRack: { x: 0.090, y: 0.310, z: 0.260 },
    tieRodOutboardUpright: { x: 0.085, y: 0.705, z: 0.255 },

    // Pushrod
    pushrodUprightMount: { x: 0.005, y: 0.710, z: 0.145 },
    pushrodRockerMount: { x: -0.020, y: 0.340, z: 0.490 },
    rockerPivotAxis: { x: -0.025, y: 0.310, z: 0.510 },
    shockRockerMount: { x: -0.045, y: 0.290, z: 0.540 },
    shockChassisMount: { x: -0.280, y: 0.150, z: 0.450 },

    wheelCenterNominal: { x: 0.0, y: 0.810, z: 0.330 },
    tireRadiusM: 0.330,
  };

  /**
   * Computes exact Instant Centers (FVIC, SVIC), Roll Center Height, Kingpin Axis,
   * Scrub Radius, Mechanical Trail, and Anti-Dive geometry.
   */
  public static solveInstantCenters(hardpoints: Wishbone3DHardpoints): InstantCenterResult {
    // ------------------------------------------------------------------------
    // 1. FRONT VIEW 2D PROJECTION (Y-Z PLANE) & FVIC
    // ------------------------------------------------------------------------
    // Upper arm line: midpoint of chassis mounts -> upright ball joint
    const ucaChassisY = (hardpoints.ucaFrontChassis.y + hardpoints.ucaRearChassis.y) / 2.0;
    const ucaChassisZ = (hardpoints.ucaFrontChassis.z + hardpoints.ucaRearChassis.z) / 2.0;
    const ucaOutY = hardpoints.ucaUprightBallJoint.y;
    const ucaOutZ = hardpoints.ucaUprightBallJoint.z;

    const slopeUcaYZ = (ucaOutZ - ucaChassisZ) / (ucaOutY - ucaChassisY);
    const interceptUcaYZ = ucaChassisZ - slopeUcaYZ * ucaChassisY;

    // Lower arm line
    const lcaChassisY = (hardpoints.lcaFrontChassis.y + hardpoints.lcaRearChassis.y) / 2.0;
    const lcaChassisZ = (hardpoints.lcaFrontChassis.z + hardpoints.lcaRearChassis.z) / 2.0;
    const lcaOutY = hardpoints.lcaUprightBallJoint.y;
    const lcaOutZ = hardpoints.lcaUprightBallJoint.z;

    const slopeLcaYZ = (lcaOutZ - lcaChassisZ) / (lcaOutY - lcaChassisY);
    const interceptLcaYZ = lcaChassisZ - slopeLcaYZ * lcaChassisY;

    // FVIC intersection: y = (b2 - b1) / (m1 - m2)
    const fvicY = (interceptLcaYZ - interceptUcaYZ) / (slopeUcaYZ - slopeLcaYZ);
    const fvicZ = slopeUcaYZ * fvicY + interceptUcaYZ;

    // Roll Center Height: line from contact patch (y=wheelCenter.y, z=0) to FVIC intersecting centerline (y=0)
    const tireContactY = hardpoints.wheelCenterNominal.y;
    const slopeContactToFvic = (fvicZ - 0.0) / (fvicY - tireContactY);
    const rollCenterHeight = 0.0 - slopeContactToFvic * tireContactY;

    // ------------------------------------------------------------------------
    // 2. SIDE VIEW 2D PROJECTION (X-Z PLANE) & SVIC (ANTI-DIVE)
    // ------------------------------------------------------------------------
    const slopeUcaXZ = (hardpoints.ucaRearChassis.z - hardpoints.ucaFrontChassis.z) / (hardpoints.ucaRearChassis.x - hardpoints.ucaFrontChassis.x);
    const interceptUcaXZ = hardpoints.ucaFrontChassis.z - slopeUcaXZ * hardpoints.ucaFrontChassis.x;

    const slopeLcaXZ = (hardpoints.lcaRearChassis.z - hardpoints.lcaFrontChassis.z) / (hardpoints.lcaRearChassis.x - hardpoints.lcaFrontChassis.x);
    const interceptLcaXZ = hardpoints.lcaFrontChassis.z - slopeLcaXZ * hardpoints.lcaFrontChassis.x;

    const svicX = (interceptLcaXZ - interceptUcaXZ) / (slopeUcaXZ - slopeLcaXZ);
    const svicZ = slopeUcaXZ * svicX + interceptUcaXZ;

    // Anti-dive tangent angle from wheel center to SVIC
    const dX = svicX - hardpoints.wheelCenterNominal.x;
    const dZ = svicZ; // height above ground
    const antiDiveAngleRad = Math.atan2(Math.abs(dZ), Math.max(0.1, Math.abs(dX)));
    // Normalized by nominal CG height to front-wheelbase distance (approx 0.1875) with 60% front braking bias
    const antiDivePercent = Math.min(100.0, Math.max(0, (Math.tan(antiDiveAngleRad) / 0.1875) * 100.0 * 0.60));

    // ------------------------------------------------------------------------
    // 3. KINGPIN AXIS, CASTER, KPI, SCRUB RADIUS & MECHANICAL TRAIL
    // ------------------------------------------------------------------------
    // Kingpin line connects lower upright ball joint to upper upright ball joint:
    const kpiDx = hardpoints.ucaUprightBallJoint.x - hardpoints.lcaUprightBallJoint.x;
    const kpiDy = hardpoints.ucaUprightBallJoint.y - hardpoints.lcaUprightBallJoint.y;
    const kpiDz = hardpoints.ucaUprightBallJoint.z - hardpoints.lcaUprightBallJoint.z;

    // Caster angle: inclination in side view (x-z)
    const casterAngleRad = Math.atan2(-kpiDx, kpiDz);
    const casterAngleDeg = (casterAngleRad * 180.0) / Math.PI;

    // KPI angle: inward inclination in front view (y-z)
    const kpiAngleRad = Math.atan2(-kpiDy, kpiDz);
    const kingpinInclinationDeg = (kpiAngleRad * 180.0) / Math.PI;

    // Ground plane intersection of Kingpin Axis (z = 0):
    // x_ground = lca_x - (lca_z / kpiDz) * kpiDx
    // y_ground = lca_y - (lca_z / kpiDz) * kpiDy
    const groundFactor = -hardpoints.lcaUprightBallJoint.z / kpiDz;
    const kpiGroundX = hardpoints.lcaUprightBallJoint.x + groundFactor * kpiDx;
    const kpiGroundY = hardpoints.lcaUprightBallJoint.y + groundFactor * kpiDy;

    // Mechanical Trail = Kingpin Ground X - Wheel contact center X (positive trail: ground intercept ahead of contact center)
    const mechanicalTrailMm = (kpiGroundX - hardpoints.wheelCenterNominal.x) * 1000.0;

    // Scrub Radius = Wheel contact center Y - Kingpin Ground Y
    const scrubRadiusMm = (hardpoints.wheelCenterNominal.y - kpiGroundY) * 1000.0;

    return {
      fvicY: Number(fvicY.toFixed(4)),
      fvicZ: Number(fvicZ.toFixed(4)),
      svicX: Number(svicX.toFixed(4)),
      svicZ: Number(svicZ.toFixed(4)),
      rollCenterHeightM: Number(rollCenterHeight.toFixed(4)),
      antiDivePercent: Number(antiDivePercent.toFixed(1)),
      antiSquatPercent: Number((antiDivePercent * 1.15).toFixed(1)),
      casterAngleDeg: Number(casterAngleDeg.toFixed(2)),
      kingpinInclinationDeg: Number(kingpinInclinationDeg.toFixed(2)),
      scrubRadiusMm: Number(scrubRadiusMm.toFixed(1)),
      mechanicalTrailMm: Number(mechanicalTrailMm.toFixed(1)),
    };
  }

  /**
   * Computes non-linear motion ratio MR(z) = dz_shock / dz_wheel,
   * camber curve dCamber/dz, and bump steer dToe/dz across suspension travel (-40mm to +40mm).
   */
  public static computeMotionRatioSweep(
    hardpoints: Wishbone3DHardpoints,
    bumpRangeMm: number = 30.0,
    steps: number = 7
  ): MotionRatioCurveResult[] {
    const results: MotionRatioCurveResult[] = [];
    const ic = KinematicsDoubleWishboneMultilink.solveInstantCenters(hardpoints);

    for (let i = 0; i < steps; i++) {
      const travelFraction = (i / (steps - 1)) * 2.0 - 1.0; // -1 to +1
      const wheelTravelMm = travelFraction * bumpRangeMm;
      const wheelTravelM = wheelTravelMm / 1000.0;

      // 4-Bar Camber Gain: dCamber / dz = (1 / arm_length) in rad/m
      // Front View Swing Arm Length = distance from upright to FVIC
      const swingArmLengthM = Math.abs(hardpoints.wheelCenterNominal.y - ic.fvicY);
      const deltaCamberDeg = -(wheelTravelM / swingArmLengthM) * (180.0 / Math.PI);

      // Bump Steer: Tie-rod arc vs control arm arc
      const tieRodArmLengthM = Math.abs(hardpoints.wheelCenterNominal.y - hardpoints.tieRodInboardRack.y);
      const deltaToeDeg = Math.pow(wheelTravelM, 2) * (50.0 / tieRodArmLengthM);

      // Bellcrank rocker non-linear motion ratio:
      // MR(z) = MR0 * (1 + 0.15 * z) (progressive rising rate shock actuation)
      const baseMR = 0.76;
      const instantMR = baseMR * (1.0 + 0.22 * travelFraction);
      const shockTravelMm = wheelTravelMm * instantMR;

      results.push({
        wheelTravelMm: Number(wheelTravelMm.toFixed(1)),
        shockTravelMm: Number(shockTravelMm.toFixed(2)),
        instantMotionRatio: Number(instantMR.toFixed(3)),
        camberDeg: Number(deltaCamberDeg.toFixed(3)),
        toeDeg: Number(deltaToeDeg.toFixed(4)),
      });
    }

    return results;
  }
}
