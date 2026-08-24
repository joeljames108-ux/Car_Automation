// ============================================================================
// REAL-WORLD SPORTS CAR 100 — BENCHMARK DATASET
// ============================================================================
// 100 verified real-world sports cars across 10 performance tiers.
// Specs sourced from manufacturer data, Car & Driver, Motortrend, and Nürburgring
// lap time databases (Bridge-to-Gantry, Sport Auto, Nürburgring100).
// ============================================================================

export type EngineLayout =
  | "I4" | "I6" | "V6" | "V8" | "V10" | "V12"
  | "Flat-4" | "Flat-6" | "Rotary"
  | "Electric_Dual_Motor" | "Electric_Tri_Motor"
  | "Hybrid_V6_Turbo" | "Hybrid_V8";

export type AspirationType =
  | "NA" | "Turbo" | "Twin_Turbo" | "Supercharged" | "Quad_Turbo";

export type TireCompound =
  | "street" | "ultra_high_performance" | "track_r_compound" | "racing_slick";

export type TransmissionType =
  | "manual_6sp" | "manual_7sp" | "manual_5sp"
  | "sequential_6sp" | "sequential_7sp"
  | "dual_clutch_7sp" | "dual_clutch_8sp" | "dual_clutch_6sp"
  | "torque_converter_8sp" | "torque_converter_10sp"
  | "ev_direct_drive" | "single_speed";

export type BrakeType =
  | "cast_iron" | "carbon_ceramic" | "carbon_race";

export type DrivetrainLayout =
  | "FWD" | "RWD" | "AWD" | "Mid_AWD";

export type BodyStyle =
  | "Roadster" | "Coupe" | "Sedan" | "Hatchback"
  | "GT" | "Hypercar" | "Prototype" | "SUV";

export interface RealCarSpec {
  id: string;
  name: string;
  year: number;
  tier: number;
  tierName: string;
  bodyStyle: BodyStyle;

  // Engine
  engineLayout: EngineLayout;
  engineDisplacementL: number;
  cylinders: number;
  aspiration: AspirationType;
  peakHp: number;
  peakTorqueNm: number;
  redlineRpm: number;

  // Drivetrain
  drivetrain: DrivetrainLayout;
  transmission: TransmissionType;
  gearCount: number;
  finalDriveRatio: number;

  // Dimensions & Mass
  curbWeightKg: number;
  weightDistFrontPct: number;
  wheelbaseMm: number;
  frontTrackMm: number;
  rearTrackMm: number;
  coGHeightMm: number;
  frontalAreaM2: number;

  // Aerodynamics
  dragCoefficientCd: number;
  downforceAt200KmhN: number;

  // Tires & Brakes
  tireCompound: TireCompound;
  tireWidthFrontMm: number;
  tireWidthRearMm: number;
  brakeType: BrakeType;

  // Verified Real-World Performance
  realTopSpeedKmh: number;
  realZeroTo100Sec: number;
  realZeroTo200Sec: number;       // 0 if not measured
  realQuarterMileSec: number;
  realQuarterMileTrapKmh: number;
  realMaxLateralG: number;
  realBrakingDist100To0M: number;

  // Verified Real-World Track Lap Times (seconds, 0 if not recorded)
  realNurburgringSec: number;
  realSpaSec: number;
  realLagunaSecaSec: number;
}

// ============================================================================
// TIER 1 — LIGHT & COMPACT SPORTS CARS
// ============================================================================
const TIER1_CARS: RealCarSpec[] = [
  {
    id: "miata-nd2", name: "Mazda MX-5 Miata ND2", year: 2023, tier: 1, tierName: "Light & Compact", bodyStyle: "Roadster",
    engineLayout: "I4", engineDisplacementL: 2.0, cylinders: 4, aspiration: "NA", peakHp: 181, peakTorqueNm: 205, redlineRpm: 7500,
    drivetrain: "RWD", transmission: "manual_6sp", gearCount: 6, finalDriveRatio: 2.866,
    curbWeightKg: 1060, weightDistFrontPct: 52, wheelbaseMm: 2310, frontTrackMm: 1496, rearTrackMm: 1520, coGHeightMm: 456, frontalAreaM2: 1.89,
    dragCoefficientCd: 0.32, downforceAt200KmhN: 35, tireCompound: "street", tireWidthFrontMm: 195, tireWidthRearMm: 225, brakeType: "cast_iron",
    realTopSpeedKmh: 235, realZeroTo100Sec: 6.5, realZeroTo200Sec: 0, realQuarterMileSec: 14.9, realQuarterMileTrapKmh: 150, realMaxLateralG: 0.97, realBrakingDist100To0M: 34.0,
    realNurburgringSec: 528, realSpaSec: 0, realLagunaSecaSec: 0,
  },
  {
    id: "gr86", name: "Toyota GR86", year: 2023, tier: 1, tierName: "Light & Compact", bodyStyle: "Coupe",
    engineLayout: "Flat-4", engineDisplacementL: 2.4, cylinders: 4, aspiration: "NA", peakHp: 228, peakTorqueNm: 249, redlineRpm: 7200,
    drivetrain: "RWD", transmission: "manual_6sp", gearCount: 6, finalDriveRatio: 3.90,
    curbWeightKg: 1245, weightDistFrontPct: 53, wheelbaseMm: 2575, frontTrackMm: 1520, rearTrackMm: 1550, coGHeightMm: 465, frontalAreaM2: 2.02,
    dragCoefficientCd: 0.29, downforceAt200KmhN: 55, tireCompound: "ultra_high_performance", tireWidthFrontMm: 215, tireWidthRearMm: 215, brakeType: "cast_iron",
    realTopSpeedKmh: 241, realZeroTo100Sec: 5.5, realZeroTo200Sec: 0, realQuarterMileSec: 13.9, realQuarterMileTrapKmh: 159, realMaxLateralG: 1.01, realBrakingDist100To0M: 33.5,
    realNurburgringSec: 515, realSpaSec: 0, realLagunaSecaSec: 0,
  },
  {
    id: "brz", name: "Subaru BRZ tS", year: 2024, tier: 1, tierName: "Light & Compact", bodyStyle: "Coupe",
    engineLayout: "Flat-4", engineDisplacementL: 2.4, cylinders: 4, aspiration: "NA", peakHp: 228, peakTorqueNm: 249, redlineRpm: 7200,
    drivetrain: "RWD", transmission: "manual_6sp", gearCount: 6, finalDriveRatio: 3.90,
    curbWeightKg: 1275, weightDistFrontPct: 53, wheelbaseMm: 2575, frontTrackMm: 1520, rearTrackMm: 1550, coGHeightMm: 465, frontalAreaM2: 2.02,
    dragCoefficientCd: 0.29, downforceAt200KmhN: 60, tireCompound: "ultra_high_performance", tireWidthFrontMm: 215, tireWidthRearMm: 215, brakeType: "cast_iron",
    realTopSpeedKmh: 240, realZeroTo100Sec: 5.5, realZeroTo200Sec: 0, realQuarterMileSec: 13.9, realQuarterMileTrapKmh: 159, realMaxLateralG: 1.02, realBrakingDist100To0M: 33.0,
    realNurburgringSec: 510, realSpaSec: 0, realLagunaSecaSec: 0,
  },
  {
    id: "alpine-a110r", name: "Alpine A110 R", year: 2023, tier: 1, tierName: "Light & Compact", bodyStyle: "Coupe",
    engineLayout: "I4", engineDisplacementL: 1.8, cylinders: 4, aspiration: "Turbo", peakHp: 300, peakTorqueNm: 320, redlineRpm: 6800,
    drivetrain: "RWD", transmission: "dual_clutch_7sp", gearCount: 7, finalDriveRatio: 3.40,
    curbWeightKg: 1082, weightDistFrontPct: 44, wheelbaseMm: 2430, frontTrackMm: 1494, rearTrackMm: 1502, coGHeightMm: 440, frontalAreaM2: 1.87,
    dragCoefficientCd: 0.34, downforceAt200KmhN: 180, tireCompound: "track_r_compound", tireWidthFrontMm: 205, tireWidthRearMm: 245, brakeType: "carbon_ceramic",
    realTopSpeedKmh: 275, realZeroTo100Sec: 3.9, realZeroTo200Sec: 13.5, realQuarterMileSec: 12.3, realQuarterMileTrapKmh: 178, realMaxLateralG: 1.18, realBrakingDist100To0M: 29.0,
    realNurburgringSec: 464, realSpaSec: 0, realLagunaSecaSec: 0,
  },
  {
    id: "civic-type-r-fl5", name: "Honda Civic Type R FL5", year: 2024, tier: 1, tierName: "Light & Compact", bodyStyle: "Hatchback",
    engineLayout: "I4", engineDisplacementL: 2.0, cylinders: 4, aspiration: "Turbo", peakHp: 315, peakTorqueNm: 420, redlineRpm: 7000,
    drivetrain: "FWD", transmission: "manual_6sp", gearCount: 6, finalDriveRatio: 3.583,
    curbWeightKg: 1430, weightDistFrontPct: 60, wheelbaseMm: 2735, frontTrackMm: 1598, rearTrackMm: 1618, coGHeightMm: 520, frontalAreaM2: 2.24,
    dragCoefficientCd: 0.33, downforceAt200KmhN: 120, tireCompound: "track_r_compound", tireWidthFrontMm: 265, tireWidthRearMm: 245, brakeType: "cast_iron",
    realTopSpeedKmh: 275, realZeroTo100Sec: 5.2, realZeroTo200Sec: 17.5, realQuarterMileSec: 13.4, realQuarterMileTrapKmh: 171, realMaxLateralG: 1.10, realBrakingDist100To0M: 31.5,
    realNurburgringSec: 472, realSpaSec: 0, realLagunaSecaSec: 0,
  },
  {
    id: "golf-r-mk8", name: "Volkswagen Golf R Mk8", year: 2023, tier: 1, tierName: "Light & Compact", bodyStyle: "Hatchback",
    engineLayout: "I4", engineDisplacementL: 2.0, cylinders: 4, aspiration: "Turbo", peakHp: 315, peakTorqueNm: 420, redlineRpm: 6500,
    drivetrain: "AWD", transmission: "dual_clutch_7sp", gearCount: 7, finalDriveRatio: 3.54,
    curbWeightKg: 1515, weightDistFrontPct: 59, wheelbaseMm: 2636, frontTrackMm: 1535, rearTrackMm: 1514, coGHeightMm: 530, frontalAreaM2: 2.28,
    dragCoefficientCd: 0.31, downforceAt200KmhN: 45, tireCompound: "ultra_high_performance", tireWidthFrontMm: 225, tireWidt
