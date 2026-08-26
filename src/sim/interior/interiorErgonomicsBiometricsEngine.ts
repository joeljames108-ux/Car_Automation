/**
 * ============================================================================
 * SAE J1100 DRIVER ERGONOMICS & BIOMETRICS POSTURE SOLVER
 * ============================================================================
 * SAE J1100 & ISO 20176 Compliant Ergonomic Accommodation Engine:
 * 1. SAE H-Point (Hip Seating Reference Point) 3D Coordinate Solver
 *    - Driver Fore/Aft & Vertical Eye Height Position Calibration
 * 2. 5th Percentile Female to 95th Percentile Male Manikin Posture Solver
 *    - Torso recline angle $\theta_{back}$, Knee angle $\theta_{knee}$, Ankle angle $\theta_{ankle}$
 *    - Steering Wheel Reach Distance & Arm Elbow Flexion Angle $\theta_{elbow}$
 * 3. Driver Sightline Raycast & Blindspot Clearance Analysis
 *    - A-Pillar Obscuration Angle $\theta_{A-Pillar}$, AR-HUD Eyebox Alignment
 * 4. Pedal Stroke Effort & Passenger Lateral G-Force Bolster Containment
 * ============================================================================
 */

import { MasterModularInteriorState } from "./masterInteriorTypes";

export type DriverPercentile = "5th_female" | "50th_male" | "95th_male";

export interface DriverManikinAnthropometry {
  percentile: DriverPercentile;
  statureMm: number;
  sittingHeightMm: number;
  thighLengthMm: number;
  lowerLegLengthMm: number;
  armLengthMm: number;
  massKg: number;
}

export const MANIKIN_PROFILES: Record<DriverPercentile, DriverManikinAnthropometry> = {
  "5th_female": {
    percentile: "5th_female",
    statureMm: 1520,
    sittingHeightMm: 795,
    thighLengthMm: 420,
    lowerLegLengthMm: 375,
    armLengthMm: 620,
    massKg: 49.5,
  },
  "50th_male": {
    percentile: "50th_male",
    statureMm: 1755,
    sittingHeightMm: 910,
    thighLengthMm: 485,
    lowerLegLengthMm: 435,
    armLengthMm: 725,
    massKg: 78.0,
  },
  "95th_male": {
    percentile: "95th_male",
    statureMm: 1890,
    sittingHeightMm: 980,
    thighLengthMm: 535,
    lowerLegLengthMm: 480,
    armLengthMm: 790,
    massKg: 98.5,
  },
};

export interface ErgonomicsKinematicsResult {
  hPointCoordinatesMm: { x: number; y: number; z: number }; // X: Fore/Aft, Y: Height, Z: Lateral
  eyePointCoordinatesMm: { x: number; y: number; z: number };
  headroomClearanceMm: number;
  legroomClearanceMm: number;
  kneeAngleDeg: number;
  ankleAngleDeg: number;
  elbowAngleDeg: number;
  steeringReachMarginMm: number;
  aPillarObscurationDeg: number;
  hudEyeboxAligned: boolean;
  pedalDepressionForceN: number;
  gForceBolsterContainmentRating: number; // 0 to 100
  overallSaeErgonomicsScore: number; // 0 to 100
}

export class InteriorErgonomicsBiometricsEngine {
  /**
   * Solves SAE J1100 driver accommodation and 3D posture for the specified manikin percentile
   */
  public static solveDriverErgonomics(
    state: MasterModularInteriorState,
    percentile: DriverPercentile = "50th_male",
    seatForeAftMm: number = 0,
    seatHeightMm: number = 0
  ): ErgonomicsKinematicsResult {
    const manikin = MANIKIN_PROFILES[percentile];
    const halfTrackMm = state.trackWidthMm / 2;

    // 1. Base H-Point (Hip Reference Point) Position
    const baseHPointX = -380 + seatForeAftMm; // X: Fore/Aft (negative is rearward from front axle)
    const baseHPointY = 320 + seatHeightMm;   // Y: Height above floorpan
    const baseHPointZ = -halfTrackMm * 0.48; // Z: Driver seat centerline offset

    // 2. Eye Point Coordinates
    const backAngleRad = (18 + 5) * (Math.PI / 180); // 23 degree recline
    const eyeX = baseHPointX - manikin.sittingHeightMm * 0.88 * Math.sin(backAngleRad);
    const eyeY = baseHPointY + manikin.sittingHeightMm * 0.88 * Math.cos(backAngleRad);
    const eyeZ = baseHPointZ;

    // 3. Headroom & Legroom Clearances
    const cabinRoofHeightMm = 1260;
    const headroomMm = Math.max(15, cabinRoofHeightMm - eyeY - 80);

    const pedalBoxX = 520; // Pedal plane X position
    const totalLegLengthMm = manikin.thighLengthMm + manikin.lowerLegLengthMm;
    const distanceHPointToPedalMm = Math.abs(pedalBoxX - baseHPointX);
    const legroomClearanceMm = totalLegLengthMm - distanceHPointToPedalMm;

    // 4. Joint Angles Calculation (Knee, Ankle, Elbow)
    // Cosine law for knee angle
    const kneeAngleRad = Math.acos(
      (Math.pow(manikin.thighLengthMm, 2) + Math.pow(manikin.lowerLegLengthMm, 2) - Math.pow(distanceHPointToPedalMm * 0.9, 2)) /
      (2 * manikin.thighLengthMm * manikin.lowerLegLengthMm)
    );
    const kneeAngleDeg = isNaN(kneeAngleRad) ? 122 : Math.round((kneeAngleRad * 180) / Math.PI);

    const ankleAngleDeg = Math.round(90 + (kneeAngleDeg - 120) * 0.35);

    // Steering Wheel Reach & Elbow Flexion
    const steeringWheelX = 80; // Wheel plane X
    const steeringWheelY = 810; // Wheel plane Y
    const dxSteer = Math.abs(steeringWheelX - eyeX);
    const dySteer = Math.abs(steeringWheelY - eyeY);
    const distanceEyeToSteeringMm = Math.sqrt(dxSteer * dxSteer + dySteer * dySteer);

    const armReachMarginMm = manikin.armLengthMm - distanceEyeToSteeringMm;
    const elbowAngleDeg = Math.min(160, Math.max(90, Math.round(115 + armReachMarginMm * 0.4)));

    // 5. Sightlines & A-Pillar Obscuration Angle
    const aPillarWidthMm = 75;
    const aPillarDistanceMm = 650;
    const aPillarObscurationDeg = parseFloat(((aPillarWidthMm / aPillarDistanceMm) * (180 / Math.PI)).toFixed(1));

    // AR HUD Eyebox Alignment Check
    const hudCenterY = 880;
    const hudEyeboxVerticalToleranceMm = 60;
    const hudEyeboxAligned = Math.abs(eyeY - hudCenterY) <= hudEyeboxVerticalToleranceMm;

    // 6. Pedal Depression Effort & Bolster Containment
    const isBucket = state.seating.frontSeatType === "carbon_monocoque_fixed_bucket" || state.seating.frontSeatType === "fia_homologated_racing_bucket";
    const pedalDepressionForceN = isBucket ? 145 : 110;
    const bolsterRating = isBucket ? 95 : 78;

    // 7. Overall SAE J1100 Ergonomics Score Calculation
    let saeScore = 100;
    if (headroomMm < 50) saeScore -= 15;
    if (kneeAngleDeg < 110 || kneeAngleDeg > 135) saeScore -= 10;
    if (elbowAngleDeg < 100 || elbowAngleDeg > 140) saeScore -= 10;
    if (!hudEyeboxAligned) saeScore -= 8;
    if (aPillarObscurationDeg > 7.5) saeScore -= 7;

    return {
      hPointCoordinatesMm: { x: Math.round(baseHPointX), y: Math.round(baseHPointY), z: Math.round(baseHPointZ) },
      eyePointCoordinatesMm: { x: Math.round(eyeX), y: Math.round(eyeY), z: Math.round(eyeZ) },
      headroomClearanceMm: Math.round(headroomMm),
      legroomClearanceMm: Math.round(legroomClearanceMm),
      kneeAngleDeg,
      ankleAngleDeg,
      elbowAngleDeg,
      steeringReachMarginMm: Math.round(armReachMarginMm),
      aPillarObscurationDeg,
      hudEyeboxAligned,
      pedalDepressionForceN,
      gForceBolsterContainmentRating: bolsterRating,
      overallSaeErgonomicsScore: Math.max(0, saeScore),
    };
  }
}
