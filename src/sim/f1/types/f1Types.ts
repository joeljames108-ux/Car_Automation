// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — CORE TYPE DEFINITIONS & SCHEMAS
// ============================================================================
// Complete specification interfaces for all 12 F1 sub-assembly studios.
// ============================================================================

import type {
  CarbonFiberGrade, ResinMatrixType, CoreMaterialType, MetallicAlloyGrade,
  F1PowerUnitMode, CombustionPrechamberTech, MguKDeploymentStrategy, MguHControlMode,
  F1GearboxCasingType, AeroPackageLevel, FrontWingConcept, SidepodPhilosophy,
  DiffuserStrakeLayout, F1SuspensionLayout, AntiRollBarType, BrakeDiscHolePattern,
  F1TireCompound, F1SessionType, F1WeatherType, F1FlagStatus,
} from "./f1Enums";

// ---------- 1. Monocoque & Survival Cell ----------
export interface F1MonocoqueSpec {
  survivalCellLengthMm: number;        // 1700 - 2100 mm (FIA minimum cockpit envelope)
  cockpitOpeningWidthMm: number;       // 520 - 600 mm (FIA template minimum 520mm)
  monocoqueTorsionalRigidityKNmDeg: number; // 40 - 68 kNm/deg
  carbonFiberGrade: CarbonFiberGrade;
  resinMatrix: ResinMatrixType;
  coreMaterial: CoreMaterialType;
  monocoqueWallThicknessMm: number;    // 2.5 - 6.0 mm (varies by crash zone)
  skinPlyCount: number;                // 14 - 36 plies
  haloMaterial: "TITANIUM_GRADE_5_DMLS" | "TITANIUM_FORGED_EXTRUDED";
  haloFairingAeroRamp: boolean;        // Micro-vortex fairing on halo tube
  sideImpactStructureLayers: number;   // 2 - 4 crush tubes per side
  frontNoseCrashAttenuatorVolumeDm3: number; // 18 - 32 dm3
  rearCrashAttenuatorLengthMm: number; // 250 - 400 mm
  plankMaterial: "JABROC_BEECHWOOD" | "TITANIUM_SKID_INSERTS";
  ballastTungstenKg: number;           // 0 - 45 kg
  ballastPositionXPercent: number;     // 40% - 55% from front axle
  totalMonocoqueMassKg: number;
}

// ---------- 2. Power Unit (1.6L V6 Turbo Hybrid) ----------
export interface F1PowerUnitSpec {
  iceBoreMm: number;                   // Fixed at 80.0 mm by FIA regulations
  iceStrokeMm: number;                 // Fixed at 53.0 mm (1.6 Liters)
  compressionRatio: number;            // 11.5:1 - 18.0:1
  prechamberTechnology: CombustionPrechamberTech;
  fuelRailPressureBar: number;         // 350 - 500 bar (FIA max 500 bar)
  crankshaftMassKg: number;            // 8.5 - 12.0 kg
  crankshaftMaterial: MetallicAlloyGrade;
  pistonCrownCoating: "DLC_DIAMOND_LIKE" | "CERAMIC_THERMAL_BARRIER" | "GRAPHENE_NANO";
  connectingRodMaterial: "TITANIUM_6AL_4V" | "POWDER_FORGED_AERMET";
  turboCompressorInducerDiaMm: number; // 48 - 72 mm
  turboTurbineExducerDiaMm: number;    // 52 - 76 mm
  turboMaxRpm: number;                 // Up to 125,000 RPM (FIA limit)
  wastegatePortCount: 1 | 2;
  mguKPowerKw: number;                 // Up to 120 kW (FIA regulatory ceiling)
  mguKMaxTorqueNm: number;             // 150 - 240 Nm
  mguKDeployment: MguKDeploymentStrategy;
  mguHMaxHarvestKw: number;            // 60 - 110 kW (unlimited MJ/lap)
  mguHControl: MguHControlMode;
  energyStoreCapacityMj: number;       // 4.0 MJ usable (FIA limit)
  energyStoreVoltage: number;          // 800 - 1000 V
  energyStoreChemistry: "NMC_811_HIGH_POWER" | "SOLID_STATE_CERAMIC" | "LFP_NANOSCALE";
  energyStoreCellCount: number;        // 192 - 288 cylindrical/pouch cells
  energyStoreCoolingFlowLMin: number;  // 15 - 35 L/min dielectric fluid
  exhaustHeaderLengthMm: number;       // 420 - 680 mm
  exhaustCollectorType: "MERGE_COLLECTOR_3_INTO_1" | "PYRAMID_HIGH_VELOCITY";
  exhaustMaterial: "INCONEL_625" | "INCONEL_718" | "TITANIUM_SPECIAL";
  coolingWaterRadiatorAreaM2: number;  // 0.35 - 0.70 m²
  coolingOilRadiatorAreaM2: number;    // 0.18 - 0.38 m²
  intercoolerType: "AIR_TO_AIR_SIDEPOD" | "WATER_TO_AIR_CHEST";
  totalPowerUnitMassKg: number;        // Min 150 kg (FIA regulation)
}

// ---------- 3. Aerodynamics Suite ----------
export interface F1AeroSpec {
  packagePreset: AeroPackageLevel;
  frontWingConcept: FrontWingConcept;
  frontWingSpanMm: number;             // 1800 - 2000 mm (FIA max 2000mm)
  frontWingElementsCount: 3 | 4;       // 3 or 4 elements
  frontWingFlapAngleDeg: number;       // 8° - 32° (driver/crew adjustable)
  frontWingEndplateOutwashSlot: boolean;
  frontWingGurneyFlapHeightMm: number; // 0 - 10 mm
  sidepodPhilosophy: SidepodPhilosophy;
  sidepodUndercutDepthMm: number;      // 120 - 340 mm
  sidepodCoolingLouverCount: number;   // 0 - 24 slots
  floorVenturiInletHeightMm: number;   // 45 - 110 mm
  floorVenturiThroatHeightMm: number;  // 10 - 28 mm
  floorFencesCountPerSide: number;     // 1 - 4 fences (FIA max 4 per side)
  floorEdgeWingStrakeAngleDeg: number; // 4° - 18°
  diffuserExpansionAngleDeg: number;   // 12° - 26°
  diffuserExitHeightMm: number;        // 150 - 220 mm
  diffuserStrakeLayout: DiffuserStrakeLayout;
  rearWingBeamWingProfile: "SINGLE_ELEMENT" | "DOUBLE_CASCADE";
  rearWingMainPlaneAngleDeg: number;   // 14° - 36°
  rearWingDrsActuatorSpeedMs: number;  // 120 - 250 ms open time
  rearWingDrsFlapGapOpenMm: number;    // Fixed at 85 mm (FIA maximum legal opening)
  sharkFinSpillPlateSize: "MINIMAL_STUB" | "FULL_LENGTH_SAIL";
  totalDownforceAt250KmhKg: number;    // 1100 - 2400 kg
  totalDragAt250KmhKg: number;         // 320 - 680 kg
  frontAeroBalancePercent: number;     // 41% - 49%
}

// ---------- 4. Suspension & Steering Rig ----------
export interface F1SuspensionSpec {
  frontLayout: F1SuspensionLayout;
  rearLayout: F1SuspensionLayout;
  frontWishboneMaterial: CarbonFiberGrade;
  rearWishboneMaterial: CarbonFiberGrade;
  frontRideHeightStaticMm: number;     // 20 - 45 mm
  rearRideHeightStaticMm: number;      // 45 - 90 mm
  frontWheelRateNmm: number;           // 140 - 320 N/mm
  rearWheelRateNmm: number;            // 180 - 380 N/mm
  frontTorsionBarDiameterMm: number;   // 16 - 28 mm
  rearTorsionBarDiameterMm: number;    // 18 - 32 mm
  frontAntiRollBarStiffness: number;   // 1 - 10 (indexed rotary blade)
  rearAntiRollBarStiffness: number;    // 1 - 10
  antiRollBarType: AntiRollBarType;
  frontHeaveSpringRateNmm: number;     // 300 - 900 N/mm (aero platform stabilization)
  rearHeaveSpringRateNmm: number;      // 400 - 1100 N/mm
  frontCamberDeg: number;              // -4.2° to -2.0°
  rearCamberDeg: number;               // -2.8° to -1.0°
  frontToeDeg: number;                 // -0.50° to +0.20°
  rearToeDeg: number;                  // +0.10° to +0.60° (toe-in)
  casterAngleDeg: number;              // 4.5° - 9.0°
  kingpinAngleDeg: number;             // 8.0° - 14.0°
  ackermannGeometryPercent: number;    // 25% - 85%
  steeringRackRatio: number;           // 12.0:1 - 16.5:1
  powerSteeringAssistanceLevel: number;// 1 - 5 (hydraulic valve curve)
}

// ---------- 5. Gearbox & Drivetrain ----------
export interface F1GearboxSpec {
  forwardGearsCount: 8;                // Fixed at 8 forward gears by FIA
  casingType: F1GearboxCasingType;
  gearboxWeightKg: number;             // 40 - 52 kg
  shiftTimeMs: number;                 // 10 - 25 ms (seamless shift technology)
  differentialPreloadNm: number;       // 40 - 220 Nm
  differentialLockOnPowerPercent: number; // 40% - 95%
  differentialLockOffPowerPercent: number;// 25% - 75%
  differentialMidCornerUnlockPercent: number; // 20% - 60%
  finalDriveRatio: number;             // 3.20 - 4.10
  gearRatios: [number, number, number, number, number, number, number, number];
  driveshaftMaterial: "HOLLOW_AERMET_STEEL" | "CARBON_FIBER_OVERWRAPPED_TI";
  tripodJointLubricant: "NANO_MOLY_SYNTHETIC" | "HIGH_TEMP_PERFLUOROPOLY";
}

// ---------- 6. Brake System & Hydraulics ----------
export interface F1BrakeSpec {
  frontDiscDiameterMm: number;         // 278 mm (FIA standard)
  frontDiscThicknessMm: number;        // 28 - 32 mm
  frontDiscHoleCount: BrakeDiscHolePattern;
  rearDiscDiameterMm: number;          // 280 mm
  rearDiscThicknessMm: number;         // 28 - 32 mm
  rearDiscHoleCount: BrakeDiscHolePattern;
  caliperFrontPistons: 6;              // Monobloc 6-piston aluminum-lithium
  caliperRearPistons: 4;               // Monobloc 4-piston aluminum-lithium
  brakePadCompound: "CARBONE_INDUSTRIE_CCR" | "BREMBO_HIGH_FRICTION_CERAMIC";
  frontBrakeDuctInletAreaCm2: number;  // 45 - 130 cm² (drag vs cooling trade-off)
  rearBrakeDuctInletAreaCm2: number;   // 35 - 110 cm²
  brakeBiasDefaultFrontPercent: number;// 52.0% - 62.0%
  brakeByWireReactionTimeMs: number;   // 4 - 12 ms
  brakeFluidType: "DOT_5_1_RACING" | "SILICONE_ESTER_350C";
}

// ---------- 7. Cockpit, Steering Wheel & Electronics ----------
export interface F1CockpitAndElectronicsSpec {
  steeringWheelDisplayType: "4_3_INCH_OLED_PDU" | "5_0_INCH_HIGH_NIT_TFT";
  rotarySwitchCount: number;           // 4 - 8 rotary selectors
  thumbWheelCount: number;             // 2 - 6 thumb dials
  pushbuttonCount: number;             // 12 - 20 tactile sealed switches
  clutchPaddleCount: 1 | 2;            // Single paddle or dual independent clutch
  driverSeatCustomFoamScan: boolean;   // 3D ergonomic driver body scan mold
  hansDeviceTetherAngleDeg: number;    // 30° - 45°
  fireExtinguisherGas: "NOVEC_1230" | "FE_36_ECO_CLEAN";
  telemetrySampleRateHz: 100 | 250 | 500 | 1000;
  telemetryChannelsCount: number;      // 150 - 450 active sensor channels
  ecuModel: "TAG_320_STANDARD_FIA";
  rainLightModel: "FIA_STANDARD_4_LED_FLASH";
}

// ---------- 8. Livery, Sponsors & Aesthetics ----------
export interface F1LiverySpec {
  primaryColorHex: string;             // Base body color
  secondaryColorHex: string;           // Accent color
  tertiaryColorHex: string;            // Pinstriping / wing details
  finishType: "GLOSS_CLEARCOAT" | "MATTE_LIGHTWEIGHT" | "SATIN_PEARLESCENT" | "EXPOSED_CARBON_TINT";
  carNumber: number;                   // 1 - 99
  carNumberFont: "MODERN_RACING_BOLD" | "CLASSIC_SERIF_HERITAGE" | "AERODYNAMIC_SLANTED";
  nationalFlagCode: string;            // ISO 2-letter country code
  titleSponsorName: string;
  titleSponsorLogoEmoji: string;
  titleSponsorColor: string;
  technicalPartners: string[];
}

// ---------- 9. Master F1 Vehicle Design Object ----------
export interface F1CarDesign {
  id: string;
  name: string;
  seasonYear: number;
  monocoque: F1MonocoqueSpec;
  powerUnit: F1PowerUnitSpec;
  aero: F1AeroSpec;
  suspension: F1SuspensionSpec;
  gearbox: F1GearboxSpec;
  brakes: F1BrakeSpec;
  cockpit: F1CockpitAndElectronicsSpec;
  livery: F1LiverySpec;
  // Computed Performance Metrics
  computedTotalMassKg: number;
  computedFrontWeightDistPercent: number;
  computedTotalPeakHp: number;
  computedIcePeakHp: number;
  computedErsPeakHp: number;
  computedTopSpeedKmh: number;
  computedZeroToHundredSec: number;
  computedZeroToTwoHundredSec: number;
  computedMaxCorneringGLat: number;
  computedMaxBrakingGLong: number;
  computedFiaHomologationScore: number; // 0 - 100 (100 = 100% compliant)
  computedEstCostMillionUsd: number;
}
