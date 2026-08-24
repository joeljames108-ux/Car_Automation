// ============================================================================
// REAL-WORLD SPORTS CAR 100 — BENCHMARK DATASET
// ============================================================================
// 100 verified real-world sports cars across 10 performance tiers.
// Specs: manufacturer data, Car & Driver, Motortrend, Nurburgring databases.
// ============================================================================

export type EngineLayout =
  | "I4" | "I5" | "I6" | "V4" | "V6" | "V8" | "V10" | "V12" | "W12"
  | "Flat-4" | "Flat-6" | "Rotary"
  | "Electric_Dual_Motor" | "Electric_Tri_Motor"
  | "Hybrid_V6_Turbo" | "Hybrid_V8" | "Hybrid_V12";

export type AspirationType =
  | "NA" | "Turbo" | "Twin_Turbo" | "Supercharged" | "Quad_Turbo";

export type TireCompound =
  | "street" | "ultra_high_performance" | "track_r_compound" | "racing_slick";

export type TransmissionType =
  | "manual_4sp" | "manual_5sp" | "manual_6sp" | "manual_7sp"
  | "sequential_6sp" | "sequential_7sp"
  | "dual_clutch_6sp" | "dual_clutch_7sp" | "dual_clutch_8sp"
  | "torque_converter_8sp" | "torque_converter_10sp"
  | "pdk" | "ev_direct_drive" | "single_speed";

export type BrakeType = "cast_iron" | "carbon_ceramic" | "carbon_race";
export type DrivetrainLayout = "FWD" | "RWD" | "AWD" | "Mid_AWD";
export type BodyStyle = "Roadster" | "Coupe" | "Sedan" | "Hatchback" | "GT" | "Hypercar" | "Prototype";

export interface RealCarSpec {
  id: string; name: string; year: number; tier: number; tierName: string; bodyStyle: BodyStyle;
  engineLayout: EngineLayout; engineDisplacementL: number; cylinders: number; aspiration: AspirationType;
  peakHp: number; peakTorqueNm: number; redlineRpm: number;
  drivetrain: DrivetrainLayout; transmission: TransmissionType; gearCount: number; finalDriveRatio: number;
  curbWeightKg: number; weightDistFrontPct: number; wheelbaseMm: number;
  frontTrackMm: number; rearTrackMm: number; coGHeightMm: number; frontalAreaM2: number;
  dragCoefficientCd: number; downforceAt200KmhN: number;
  tireCompound: TireCompound; tireWidthFrontMm: number; tireWidthRearMm: number; brakeType: BrakeType;
  realTopSpeedKmh: number; realZeroTo100Sec: number; realZeroTo200Sec: number;
  realQuarterMileSec: number; realQuarterMileTrapKmh: number;
  realMaxLateralG: number; realBrakingDist100To0M: number;
  realNurburgringSec: number; realSpaSec: number; realLagunaSecaSec: number;
}
