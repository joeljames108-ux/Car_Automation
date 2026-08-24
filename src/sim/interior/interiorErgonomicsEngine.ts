// ===================================================================
// SAE J941 H-POINT & 95th PERCENTILE DRIVER ERGONOMICS ENGINE
// ===================================================================
// Calculates SAE J941 Eyellipse Eyepoint coordinates, H-Point hip pivot,
// A-Pillar obscuration blindspot angles, SAE J287 Hand Reach Envelopes,
// Legroom/Headroom clearances, and Overall Ergonomic Rating (0-100).
// ===================================================================

export interface SaeHPointKinematics {
  hPointXMm: number; // Longitudinal distance from accelerator heel point (AHP)
  hPointYMm: number; // Lateral offset from vehicle centerline
  hPointZMm: number; // Vertical height above floor pan
  torsoAngleDeg: number; // Recline angle (nominal 25°)
  eyepointXMm: number; // SAE J941 95th percentile male eyepoint X
  eyepointZMm: number; // SAE J941 95th percentile male eyepoint Z
}

export interface DriverVisibilityEnvelope {
  leftAPillarBlindSpotDeg: number; // A-Pillar obstruction angle (e.g. 5.2°)
  rightAPillarBlindSpotDeg: number;
  forwardDownwardAngleDeg: number; // Downward view angle over hood (e.g. 8.5°)
  rearviewMirrorFovDeg: number;
  isNhtsaBackUpCameraCompliant: boolean;
  visibilityRatingPct: number; // 0 - 100
}

export interface CabinSpaceClearances {
  headroomFrontMm: number; // Min 980mm recommended
  legroomFrontMm: number; // Min 1050mm recommended
  shoulderRoomFrontMm: number; // Min 1400mm recommended
  elbowRoomFrontMm: number;
  steeringWheelReachDistanceMm: number;
  touchscreenReachDistanceMm: number;
  saeJ287ReachIndexPct: number; // % of 5th percentile females able to reach controls
}

export interface OverallErgonomicsResult {
  hPointKinematics: SaeHPointKinematics;
  visibility: DriverVisibilityEnvelope;
  clearances: CabinSpaceClearances;
  driverFatigueIndexPct: number; // 0 - 100 (Lower = Better long trip comfort)
  overallErgonomicsScore: number; // 0 - 100
  ergonomicGrade: "WORLD_CLASS_EXECUTIVE" | "SPORTS_ERGONOMIC" | "ACCEPTABLE" | "CRAMPED_DEFICIENT";
}

export class InteriorErgonomicsEngine {
  /**
   * Calculates SAE J941 H-Point Hip Pivot and Eyellipse Eyepoint coordinates.
   */
  public static calculateHPoint(params: {
    seatTrackForeAftMm: number; // 0 to 240mm travel
    seatHeightAdjMm: number; // 0 to 60mm vertical
    torsoAngleDeg: number; // 18° to 35°
  }): SaeHPointKinematics {
    const { seatTrackForeAftMm, seatHeightAdjMm, torsoAngleDeg } = params;

    // Nominal H-Point from Accelerator Heel Point (AHP)
    const baseHPointX = 780 + seatTrackForeAftMm;
    const baseHPointZ = 280 + seatHeightAdjMm;

    // Eyepoint location: ~630mm vertically above H-Point along torso angle
    const torsoRad = (torsoAngleDeg * Math.PI) / 180;
    const eyepointX = baseHPointX - 630 * Math.sin(torsoRad);
    const eyepointZ = baseHPointZ + 630 * Math.cos(torsoRad);

    return {
      hPointXMm: Number(baseHPointX.toFixed(1)),
      hPointYMm: 380.0, // Left seat offset 380mm from center
      hPointZMm: Number(baseHPointZ.toFixed(1)),
      torsoAngleDeg,
      eyepointXMm: Number(eyepointX.toFixed(1)),
      eyepointZMm: Number(eyepointZ.toFixed(1)),
    };
  }

  /**
   * Computes A-Pillar Obscuration Angles and Forward Downward Vision.
   */
  public static evaluateVisibility(params: {
    aPillarWidthMm: number;
    aPillarDistanceMm: number;
    hoodHeightMm: number;
    eyepoint: SaeHPointKinematics;
  }): DriverVisibilityEnvelope {
    const { aPillarWidthMm, aPillarDistanceMm, hoodHeightMm, eyepoint } = params;

    // Obscuration angle arctan(width / distance)
    const leftAPillarBlindSpotDeg = Number(((Math.atan(aPillarWidthMm / aPillarDistanceMm) * 180) / Math.PI).toFixed(1));
    const rightAPillarBlindSpotDeg = Number((leftAPillarBlindSpotDeg * 1.15).toFixed(1)); // Right pillar is farther

    // Downward vision over hood
    const hoodDistance = 1450; // mm from eyepoint to hood edge
    const forwardDownwardAngleDeg = Number(((Math.atan((eyepoint.eyepointZMm - hoodHeightMm) / hoodDistance) * 180) / Math.PI).toFixed(1));

    const rearviewMirrorFovDeg = 24.5;
    const visibilityRatingPct = Number(Math.min(99, Math.max(40, 95 - leftAPillarBlindSpotDeg * 4 + forwardDownwardAngleDeg * 2)).toFixed(1));

    return {
      leftAPillarBlindSpotDeg,
      rightAPillarBlindSpotDeg,
      forwardDownwardAngleDeg,
      rearviewMirrorFovDeg,
      isNhtsaBackUpCameraCompliant: true,
      visibilityRatingPct,
    };
  }

  /**
   * Evaluates Cabin Clearances and SAE J287 Driver Hand Reach Index.
   */
  public static evaluateClearances(params: {
    roofHeightMm: number;
    wheelbaseMm: number;
    cabinWidthMm: number;
    eyepoint: SaeHPointKinematics;
  }): CabinSpaceClearances {
    const { roofHeightMm, cabinWidthMm, eyepoint } = params;

    const headroomFrontMm = Number((roofHeightMm - eyepoint.eyepointZMm).toFixed(1));
    const legroomFrontMm = Number((eyepoint.hPointXMm + 280).toFixed(1));
    const shoulderRoomFrontMm = Number((cabinWidthMm - 160).toFixed(1));
    const elbowRoomFrontMm = Number((cabinWidthMm - 120).toFixed(1));

    const steeringWheelReachDistanceMm = 450.0;
    const touchscreenReachDistanceMm = 580.0;

    // SAE J287 Reach Index (% of 5th percentile females able to operate controls without leaning)
    const reachIndexPct = Number(Math.min(99, Math.max(50, 100 - (touchscreenReachDistanceMm - 500) * 0.4)).toFixed(1));

    return {
      headroomFrontMm,
      legroomFrontMm,
      shoulderRoomFrontMm,
      elbowRoomFrontMm,
      steeringWheelReachDistanceMm,
      touchscreenReachDistanceMm,
      saeJ287ReachIndexPct: reachIndexPct,
    };
  }

  /**
   * Executes full Ergonomics Audit.
   */
  public static evaluateErgonomics(params: {
    roofHeightMm: number;
    wheelbaseMm: number;
    cabinWidthMm: number;
    hoodHeightMm: number;
    aPillarWidthMm: number;
    seatTrackForeAftMm: number;
    seatHeightAdjMm: number;
    torsoAngleDeg: number;
  }): OverallErgonomicsResult {
    const hPointKinematics = this.calculateHPoint({
      seatTrackForeAftMm: params.seatTrackForeAftMm,
      seatHeightAdjMm: params.seatHeightAdjMm,
      torsoAngleDeg: params.torsoAngleDeg,
    });

    const visibility = this.evaluateVisibility({
      aPillarWidthMm: params.aPillarWidthMm,
      aPillarDistanceMm: 720,
      hoodHeightMm: params.hoodHeightMm,
      eyepoint: hPointKinematics,
    });

    const clearances = this.evaluateClearances({
      roofHeightMm: params.roofHeightMm,
      wheelbaseMm: params.wheelbaseMm,
      cabinWidthMm: params.cabinWidthMm,
      eyepoint: hPointKinematics,
    });

    // Driver Fatigue Index (Lower = Better)
    const driverFatigueIndexPct = Number(Math.max(10, 100 - (clearances.saeJ287ReachIndexPct * 0.5 + visibility.visibilityRatingPct * 0.5)).toFixed(1));

    // Overall Score
    const overallErgonomicsScore = Number(((visibility.visibilityRatingPct * 0.4 + clearances.saeJ287ReachIndexPct * 0.4 + (100 - driverFatigueIndexPct) * 0.2)).toFixed(1));

    let ergonomicGrade: "WORLD_CLASS_EXECUTIVE" | "SPORTS_ERGONOMIC" | "ACCEPTABLE" | "CRAMPED_DEFICIENT" = "SPORTS_ERGONOMIC";
    if (overallErgonomicsScore >= 90) ergonomicGrade = "WORLD_CLASS_EXECUTIVE";
    else if (overallErgonomicsScore < 65) ergonomicGrade = "CRAMPED_DEFICIENT";

    return {
      hPointKinematics,
      visibility,
      clearances,
      driverFatigueIndexPct,
      overallErgonomicsScore,
      ergonomicGrade,
    };
  }
}
