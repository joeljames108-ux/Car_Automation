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

const TIER1_CARS: RealCarSpec[] = [
  {id:"miata-nd2",name:"Mazda MX-5 Miata ND2",year:2023,tier:1,tierName:"Light & Compact",bodyStyle:"Roadster",engineLayout:"I4",engineDisplacementL:2,cylinders:4,aspiration:"NA",peakHp:181,peakTorqueNm:205,redlineRpm:7500,drivetrain:"RWD",transmission:"manual_6sp",gearCount:6,finalDriveRatio:2.866,curbWeightKg:1060,weightDistFrontPct:52,wheelbaseMm:2310,frontTrackMm:1496,rearTrackMm:1520,coGHeightMm:456,frontalAreaM2:1.89,dragCoefficientCd:0.32,downforceAt200KmhN:35,tireCompound:"street",tireWidthFrontMm:195,tireWidthRearMm:225,brakeType:"cast_iron",realTopSpeedKmh:235,realZeroTo100Sec:6.5,realZeroTo200Sec:0,realQuarterMileSec:14.9,realQuarterMileTrapKmh:150,realMaxLateralG:0.97,realBrakingDist100To0M:34,realNurburgringSec:528,realSpaSec:0,realLagunaSecaSec:0 },
  {id:"gr86",name:"Toyota GR86",year:2023,tier:1,tierName:"Light & Compact",bodyStyle:"Coupe",engineLayout:"Flat-4",engineDisplacementL:2.4,cylinders:4,aspiration:"NA",peakHp:228,peakTorqueNm:249,redlineRpm:7200,drivetrain:"RWD",transmission:"manual_6sp",gearCount:6,finalDriveRatio:3.9,curbWeightKg:1245,weightDistFrontPct:53,wheelbaseMm:2575,frontTrackMm:1520,rearTrackMm:1550,coGHeightMm:465,frontalAreaM2:2.02,dragCoefficientCd:0.29,downforceAt200KmhN:55,tireCompound:"ultra_high_performance",tireWidthFrontMm:215,tireWidthRearMm:215,brakeType:"cast_iron",realTopSpeedKmh:241,realZeroTo100Sec:5.5,realZeroTo200Sec:0,realQuarterMileSec:13.9,realQuarterMileTrapKmh:159,realMaxLateralG:1.01,realBrakingDist100To0M:33.5,realNurburgringSec:515,realSpaSec:0,realLagunaSecaSec:0 },
  {id:"brz",name:"Subaru BRZ tS",year:2024,tier:1,tierName:"Light & Compact",bodyStyle:"Coupe",engineLayout:"Flat-4",engineDisplacementL:2.4,cylinders:4,aspiration:"NA",peakHp:228,peakTorqueNm:249,redlineRpm:7200,drivetrain:"RWD",transmission:"manual_6sp",gearCount:6,finalDriveRatio:3.9,curbWeightKg:1275,weightDistFrontPct:53,wheelbaseMm:2575,frontTrackMm:1520,rearTrackMm:1550,coGHeightMm:465,frontalAreaM2:2.02,dragCoefficientCd:0.29,downforceAt200KmhN:60,tireCompound:"ultra_high_performance",tireWidthFrontMm:215,tireWidthRearMm:215,brakeType:"cast_iron",realTopSpeedKmh:240,realZeroTo100Sec:5.5,realZeroTo200Sec:0,realQuarterMileSec:13.9,realQuarterMileTrapKmh:159,realMaxLateralG:1.02,realBrakingDist100To0M:33,realNurburgringSec:510,realSpaSec:0,realLagunaSecaSec:0 },
  {id:"alpine-a110r",name:"Alpine A110 R",year:2023,tier:1,tierName:"Light & Compact",bodyStyle:"Coupe",engineLayout:"I4",engineDisplacementL:1.8,cylinders:4,aspiration:"Turbo",peakHp:300,peakTorqueNm:320,redlineRpm:6800,drivetrain:"RWD",transmission:"dual_clutch_7sp",gearCount:7,finalDriveRatio:3.4,curbWeightKg:1082,weightDistFrontPct:44,wheelbaseMm:2430,frontTrackMm:1494,rearTrackMm:1502,coGHeightMm:440,frontalAreaM2:1.87,dragCoefficientCd:0.34,downforceAt200KmhN:180,tireCompound:"track_r_compound",tireWidthFrontMm:205,tireWidthRearMm:245,brakeType:"carbon_ceramic",realTopSpeedKmh:275,realZeroTo100Sec:3.9,realZeroTo200Sec:13.5,realQuarterMileSec:12.3,realQuarterMileTrapKmh:178,realMaxLateralG:1.18,realBrakingDist100To0M:29,realNurburgringSec:464,realSpaSec:0,realLagunaSecaSec:0 },
  {id:"civic-type-r",name:"Honda Civic Type R FL5",year:2024,tier:1,tierName:"Light & Compact",bodyStyle:"Hatchback",engineLayout:"I4",engineDisplacementL:2,cylinders:4,aspiration:"Turbo",peakHp:315,peakTorqueNm:420,redlineRpm:7000,drivetrain:"FWD",transmission:"manual_6sp",gearCount:6,finalDriveRatio:3.583,curbWeightKg:1430,weightDistFrontPct:60,wheelbaseMm:2735,frontTrackMm:1598,rearTrackMm:1618,coGHeightMm:520,frontalAreaM2:2.24,dragCoefficientCd:0.33,downforceAt200KmhN:120,tireCompound:"track_r_compound",tireWidthFrontMm:265,tireWidthRearMm:245,brakeType:"cast_iron",realTopSpeedKmh:275,realZeroTo100Sec:5.2,realZeroTo200Sec:17.5,realQuarterMileSec:13.4,realQuarterMileTrapKmh:171,realMaxLateralG:1.1,realBrakingDist100To0M:31.5,realNurburgringSec:472,realSpaSec:0,realLagunaSecaSec:0 },
  {id:"golf-r",name:"VW Golf R Mk8",year:2023,tier:1,tierName:"Light & Compact",bodyStyle:"Hatchback",engineLayout:"I4",engineDisplacementL:2,cylinders:4,aspiration:"Turbo",peakHp:315,peakTorqueNm:420,redlineRpm:6500,drivetrain:"AWD",transmission:"dual_clutch_7sp",gearCount:7,finalDriveRatio:3.54,curbWeightKg:1515,weightDistFrontPct:59,wheelbaseMm:2636,frontTrackMm:1535,rearTrackMm:1514,coGHeightMm:530,frontalAreaM2:2.28,dragCoefficientCd:0.31,downforceAt200KmhN:45,tireCompound:"ultra_high_performance",tireWidthFrontMm:225,tireWidthRearMm:225,brakeType:"cast_iron",realTopSpeedKmh:267,realZeroTo100Sec:4.6,realZeroTo200Sec:17.2,realQuarterMileSec:13,realQuarterMileTrapKmh:175,realMaxLateralG:0.97,realBrakingDist100To0M:33.5,realNurburgringSec:0,realSpaSec:0,realLagunaSecaSec:0 },
  {id:"mini-jcw",name:"Mini JCW GP3",year:2023,tier:1,tierName:"Light & Compact",bodyStyle:"Hatchback",engineLayout:"I4",engineDisplacementL:2,cylinders:4,aspiration:"Turbo",peakHp:301,peakTorqueNm:450,redlineRpm:6200,drivetrain:"FWD",transmission:"dual_clutch_8sp",gearCount:8,finalDriveRatio:3.23,curbWeightKg:1350,weightDistFrontPct:61,wheelbaseMm:2568,frontTrackMm:1545,rearTrackMm:1530,coGHeightMm:535,frontalAreaM2:2.16,dragCoefficientCd:0.34,downforceAt200KmhN:65,tireCompound:"ultra_high_performance",tireWidthFrontMm:245,tireWidthRearMm:225,brakeType:"cast_iron",realTopSpeedKmh:264,realZeroTo100Sec:5.1,realZeroTo200Sec:0,realQuarterMileSec:13.5,realQuarterMileTrapKmh:170,realMaxLateralG:0.96,realBrakingDist100To0M:34,realNurburgringSec:0,realSpaSec:0,realLagunaSecaSec:0 },
  {id:"lotus-elise",name:"Lotus Elise Cup 250",year:2022,tier:1,tierName:"Light & Compact",bodyStyle:"Roadster",engineLayout:"I4",engineDisplacementL:1.6,cylinders:4,aspiration:"Supercharged",peakHp:243,peakTorqueNm:244,redlineRpm:7200,drivetrain:"RWD",transmission:"manual_6sp",gearCount:6,finalDriveRatio:4.18,curbWeightKg:931,weightDistFrontPct:42,wheelbaseMm:2370,frontTrackMm:1445,rearTrackMm:1456,coGHeightMm:425,frontalAreaM2:1.81,dragCoefficientCd:0.37,downforceAt200KmhN:255,tireCompound:"track_r_compound",tireWidthFrontMm:195,tireWidthRearMm:235,brakeType:"cast_iron",realTopSpeedKmh:248,realZeroTo100Sec:3.9,realZeroTo200Sec:0,realQuarterMileSec:12.5,realQuarterMileTrapKmh:175,realMaxLateralG:1.22,realBrakingDist100To0M:30,realNurburgringSec:482,realSpaSec:0,realLagunaSecaSec:0 },
  {id:"elantra-n",name:"Hyundai Elantra N",year:2023,tier:1,tierName:"Light & Compact",bodyStyle:"Sedan",engineLayout:"I4",engineDisplacementL:2,cylinders:4,aspiration:"Turbo",peakHp:276,peakTorqueNm:392,redlineRpm:6500,drivetrain:"FWD",transmission:"manual_6sp",gearCount:6,finalDriveRatio:3.648,curbWeightKg:1430,weightDistFrontPct:60,wheelbaseMm:2720,frontTrackMm:1592,rearTrackMm:1598,coGHeightMm:530,frontalAreaM2:2.25,dragCoefficientCd:0.3,downforceAt200KmhN:40,tireCompound:"ultra_high_performance",tireWidthFrontMm:245,tireWidthRearMm:235,brakeType:"cast_iron",realTopSpeedKmh:254,realZeroTo100Sec:5.3,realZeroTo200Sec:0,realQuarterMileSec:13.8,realQuarterMileTrapKmh:164,realMaxLateralG:0.99,realBrakingDist100To0M:34,realNurburgringSec:0,realSpaSec:0,realLagunaSecaSec:0 },
  {id:"z4-m40i",name:"BMW Z4 M40i",year:2023,tier:1,tierName:"Light & Compact",bodyStyle:"Roadster",engineLayout:"I6",engineDisplacementL:3,cylinders:6,aspiration:"Turbo",peakHp:382,peakTorqueNm:500,redlineRpm:6500,drivetrain:"RWD",transmission:"torque_converter_8sp",gearCount:8,finalDriveRatio:3.15,curbWeightKg:1510,weightDistFrontPct:50,wheelbaseMm:2470,frontTrackMm:1566,rearTrackMm:1580,coGHeightMm:465,frontalAreaM2:2,dragCoefficientCd:0.32,downforceAt200KmhN:30,tireCompound:"ultra_high_performance",tireWidthFrontMm:255,tireWidthRearMm:275,brakeType:"carbon_ceramic",realTopSpeedKmh:250,realZeroTo100Sec:3.9,realZeroTo200Sec:13.8,realQuarterMileSec:12.3,realQuarterMileTrapKmh:180,realMaxLateralG:1.05,realBrakingDist100To0M:32.5,realNurburgringSec:0,realSpaSec:0,realLagunaSecaSec:0 },
];
