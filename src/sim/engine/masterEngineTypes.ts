/**
 * ============================================================================
 * MODULAR ENGINE STUDIO — MASTER ENGINE TYPES & TAXONOMY
 * ============================================================================
 * Defines the single-source-of-truth schema for the modular engine studio:
 * - 14 Subassemblies (Short block, heads, valvetrain, turbo, exhaust, intake, etc.)
 * - 3D Mounting point sockets and exploded offsets
 * - Kinematic slider-crank mathematical parameters
 * - Dyno torque & horsepower curve telemetry ($0-12,000$ RPM)
 * - Multi-physics engine compatibility & safety validation
 * - Bill of Materials (BOM) cost and manufacturing complexity
 * ============================================================================
 */

export type EngineArchitectureFamily =
  | "inline"
  | "v_engine"
  | "boxer"
  | "w_engine"
  | "rotary_wankel";

export type BlockMaterial =
  | "cast_iron"
  | "hypereutectic_aluminum"
  | "billet_6061_t6"
  | "compacted_graphite_iron"
  | "magnesium_alloy";

export type CylinderSleeveType =
  | "cast_in_ductile_iron"
  | "nikasil_electroplate"
  | "plasma_transferred_wire_arc"
  | "darton_modular_sleeves";

export type CrankshaftMaterial =
  | "cast_nodular_iron"
  | "forged_4340_steel"
  | "billet_en40b_nitrided"
  | "titanium_billet_f1";

export type CrankshaftPlaneType =
  | "cross_plane_90"
  | "flat_plane_180";

export type ConnectingRodStyle =
  | "i_beam_forged"
  | "h_beam_billet_4340"
  | "x_beam_ultra_light"
  | "titanium_forged_competition";

export type PistonMaterialClass =
  | "hypereutectic_cast"
  | "4032_forged_high_silicon"
  | "2618_forged_low_silicon_race"
  | "billet_f1_slipper_skirt"
  | "ceramic_thermal_barrier_coated";

export type PistonCrownProfile =
  | "flat_top"
  | "dished_low_compression"
  | "domed_high_compression"
  | "valve_relief_pocketed";

export type CylinderHeadValvetrain =
  | "ohv_pushrod_2v"
  | "sohc_2v"
  | "sohc_4v"
  | "dohc_4v_roller_rocker"
  | "dohc_5v"
  | "desmodromic_mechanical"
  | "pneumatic_f1_valvetrain";

export type ValveMaterial =
  | "martensitic_stainless_steel"
  | "sodium_filled_hollow_stem"
  | "titanium_aluminide"
  | "inconel_751_exhaust";

export type ValveSpringType =
  | "single_ovate_beehive"
  | "dual_titanium_springs_pac"
  | "pneumatic_nitrogen_chamber";

export type IntakeManifoldStyle =
  | "single_plenum_cast"
  | "dual_plenum_ram_air"
  | "individual_throttle_bodies_itb"
  | "variable_geometry_resonance_runners";

export type FuelInjectionSystem =
  | "port_fuel_injection_pfi"
  | "gasoline_direct_injection_gdi"
  | "dual_port_and_direct_dsi"
  | "mechanical_constant_flow_racing";

export type IgnitionSystemType =
  | "distributor_inductive"
  | "wasted_spark_pack"
  | "coil_on_plug_cop"
  | "twin_spark_dual_plug"
  | "capacitive_discharge_plasma";

export type ForcedInductionType =
  | "naturally_aspirated"
  | "single_twin_scroll_turbo"
  | "twin_turbo_parallel"
  | "twin_turbo_sequential"
  | "hot_v_twin_turbo"
  | "quad_turbo_staged"
  | "roots_twin_screw_supercharger"
  | "centrifugal_supercharger";

export type ExhaustHeaderStyle =
  | "cast_iron_log"
  | "shorty_tuned_tubular"
  | "equal_length_long_tube"
  | "inconel_pie_cut_hot_v"
  | "titanium_f1_bundle";

export type LubricationSystemType =
  | "wet_sump_baffled"
  | "dry_sump_3_stage"
  | "dry_sump_5_stage_integrated";

export type CoolingSystemType =
  | "mechanical_impeller"
  | "electric_high_flow_pwm"
  | "dual_stage_motorsport";

// ============================================================================
// 1. SUBASSEMBLY STATE INTERFACES
// ============================================================================

export interface ArchitectureSubsystemState {
  family: EngineArchitectureFamily;
  cylinderCount: 3 | 4 | 6 | 8 | 10 | 12 | 16;
  bankAngleDeg: number;       // 0 for inline, 60, 65, 72, 90 for V, 180 for boxer
  firingOrder: string;
  deckHeightMm: number;        // 200 to 250 mm
  boreSpacingMm: number;       // 88 to 115 mm
}

export interface EngineBlockSubsystemState {
  material: BlockMaterial;
  sleeveType: CylinderSleeveType;
  boreMm: number;              // 75 to 102 mm
  strokeMm: number;            // 65 to 105 mm
  mainBearingBoreMm: number;
  cylinderWallThicknessMm: number;
  girdleReinforcementInstalled: boolean;
  crossBoltedMainCaps: boolean;
  massKg: number;
  costUSD: number;
}

export interface CrankshaftSubsystemState {
  material: CrankshaftMaterial;
  planeType: CrankshaftPlaneType;
  strokeMm: number;
  mainJournalDiaMm: number;
  rodJournalDiaMm: number;
  knifeEdgedCounterweights: boolean;
  harmonicDamperInstalled: boolean;
  flywheelFlangeBolts: 6 | 8 | 10;
  massKg: number;
  costUSD: number;
}

export interface ConnectingRodsSubsystemState {
  style: ConnectingRodStyle;
  rodLengthMm: number;         // 130 to 170 mm
  wristPinDiameterMm: number;  // 20 to 24 mm
  rodBoltGrade: "arp_8740" | "arp_2000" | "arp_custom_age_625";
  bushingMaterial: "silicon_bronze" | "beryllium_copper";
  massKgTotal: number;
  costUSD: number;
}

export interface PistonsSubsystemState {
  materialClass: PistonMaterialClass;
  crownProfile: PistonCrownProfile;
  compressionHeightMm: number;
  domeVolumeCc: number;        // -25cc (dish) to +15cc (dome)
  ringPackage: "standard_ductile_iron" | "plasma_moly_file_fit" | "total_seal_gapless";
  skirtCoating: "moly_graphite" | "tungsten_disulfide" | "none";
  wristPinMaterial: "case_hardened_steel" | "tool_steel_h13" | "dlc_coated_titanium";
  massKgTotal: number;
  costUSD: number;
}

export interface CylinderHeadsSubsystemState {
  valvetrain: CylinderHeadValvetrain;
  material: "a356_cast_aluminum" | "billet_6061_t6" | "beryllium_copper_combustion_face";
  combustionChamberVolumeCc: number; // 38 to 65 cc
  intakePortVolumeCc: number;
  exhaustPortVolumeCc: number;
  intakeValvesPerCylinder: 1 | 2 | 3;
  exhaustValvesPerCylinder: 1 | 2;
  intakeValveDiameterMm: number;
  exhaustValveDiameterMm: number;
  portFinish: "as_cast" | "cnc_ported_stage3" | "hand_polished_mirror";
  massKgTotal: number;
  costUSD: number;
}

export interface CamshaftsSubsystemState {
  intakeDurationAdvDeg: number;  // 240 to 330 deg
  exhaustDurationAdvDeg: number; // 240 to 330 deg
  intakeLiftMm: number;          // 8.5 to 16.0 mm
  exhaustLiftMm: number;         // 8.5 to 16.0 mm
  lobeSeparationAngleDeg: number;// 104 to 118 deg
  variableValveTimingIntake: boolean;
  variableValveTimingExhaust: boolean;
  vvtAdvanceRangeDeg: number;    // up to 50 deg
  massKg: number;
  costUSD: number;
}

export interface ValvesAndSpringsSubsystemState {
  intakeValveMaterial: ValveMaterial;
  exhaustValveMaterial: ValveMaterial;
  springType: ValveSpringType;
  seatPressureLbs: number;       // 80 to 220 lbs
  openPressureLbs: number;       // 220 to 550 lbs
  retainerMaterial: "chromoly_steel" | "titanium_grade_5" | "billet_aluminum";
  massKgTotal: number;
  costUSD: number;
}

export interface AirIntakeSubsystemState {
  style: IntakeManifoldStyle;
  plenumVolumeLiters: number;
  runnerLengthMm: number;        // 120 to 380 mm
  runnerDiameterMm: number;
  throttleBodyDiameterMm: number;// 65 to 105 mm (or per-cylinder for ITB)
  airFilterType: "cotton_gauze_high_flow" | "synthetic_dry_element" | "velocity_stack_mesh";
  manifoldMaterial: "cast_aluminum" | "prepreg_carbon_fiber" | "billet_aluminum";
  massKg: number;
  costUSD: number;
}

export interface FuelSystemSubsystemState {
  injectionType: FuelInjectionSystem;
  injectorFlowCcPerMin: number;  // 350 to 2200 cc/min
  fuelRailPressureBar: number;   // 3.0 to 350.0 bar
  fuelPumpFlowLph: number;       // 255 to 1000 lph
  fuelTypeOctane: "pump_91" | "pump_93" | "e85_flex" | "race_100_unleaded" | "methanol_m1";
  hasFlexFuelSensor: boolean;
  massKg: number;
  costUSD: number;
}

export interface IgnitionSubsystemState {
  type: IgnitionSystemType;
  sparkPlugHeatRange: 5 | 6 | 7 | 8 | 9 | 10;
  sparkPlugGapMm: number;        // 0.6 to 1.1 mm
  coilEnergyMillijoules: number; // 45 to 180 mJ
  hasIonSenseKnockDetection: boolean;
  massKg: number;
  costUSD: number;
}

export type TurboHousingFinish =
  | "billet_polished"
  | "titanium_blued"
  | "inconel_bronze"
  | "ceramic_white"
  | "stealth_black"
  | "gold_anodized"
  | "rosso_corsa";

export type CompressorWheelColor =
  | "billet_gold"
  | "billet_emerald"
  | "billet_cobalt"
  | "billet_crimson"
  | "polished_silver";

export type WastegateCapColor =
  | "anodized_purple"
  | "anodized_blue"
  | "anodized_gold"
  | "anodized_red"
  | "stealth_black";

export type SiliconeCouplerColor =
  | "blue_silicone"
  | "red_silicone"
  | "stealth_black_viton";

export interface ForcedInductionSubsystemState {
  type: ForcedInductionType;
  turboCount: 0 | 1 | 2 | 4;
  compressorInducerMm: number;   // 45 to 110 mm
  turbineExducerMm: number;      // 48 to 115 mm
  aRatio: number;                // 0.50 to 1.45
  wastegateType: "internal_pneumatic" | "external_dual_44mm_electronic";
  blowOffValveType: "recirculating_diverter" | "vent_to_atmosphere_50mm";
  intercoolerType: "air_to_air_bar_plate" | "water_to_air_charge_cooler" | "cryogenic_co2_spray";
  targetBoostPressureBar: number;// 0.0 to 4.0 bar
  superchargerType?: "twin_screw_roots" | "centrifugal_planetary";
  superchargerDisplacementLiters?: number; // 1.8 to 4.5 Liters
  superchargerPulleyRatio?: number;        // 1.8 to 3.4
  turboHousingFinish?: TurboHousingFinish;
  compressorWheelColor?: CompressorWheelColor;
  wastegateCapColor?: WastegateCapColor;
  couplerColor?: SiliconeCouplerColor;
  massKg: number;
  costUSD: number;
}

export interface ExhaustSubsystemState {
  headerStyle: ExhaustHeaderStyle;
  primaryTubeDiameterMm: number; // 38 to 54 mm
  primaryTubeLengthMm: number;   // 450 to 950 mm
  collectorMergeAngleDeg: number;// 12 to 25 deg
  downpipeDiameterMm: number;    // 63 to 102 mm
  catalyticConverter: "oem_600_cell" | "high_flow_200_cell" | "decat_straight_pipe";
  mufflerStyle: "chambered_touring" | "straight_through_resonated" | "titanium_valved_race";
  massKg: number;
  costUSD: number;
}

export interface LubricationSubsystemState {
  systemType: LubricationSystemType;
  oilPanCapacityLiters: number;
  oilViscosityGrade: "0w20" | "5w30" | "10w60" | "15w50_race";
  oilCoolerInstalled: boolean;
  oilCoolerAreaSqCm: number;
  crankcaseScavengeStages: 0 | 2 | 3 | 4;
  massKg: number;
  costUSD: number;
}

export interface EngineTuningSubsystemState {
  revLimiterRpm: number;         // 6000 to 12500 rpm
  idleRpm: number;               // 700 to 1400 rpm
  ignitionTimingAdvanceDeg: number; // 10 to 44 deg BTDC at peak power
  airFuelRatioTargetWOT: number; // 11.2 to 13.5 lambda (0.76 to 0.92)
  vvtIntakeAdvanceMapDeg: number;// 0 to 45 deg
  launchControlRpm: number;
  tractionControlTorqueReductionPercent: number;
}

// ============================================================================
// 2. COMPUTED MULTI-PHYSICS OUTPUTS & DYNO TELEMETRY
// ============================================================================

export interface DynoDataPoint {
  rpm: number;
  horsepowerHp: number;
  torqueNm: number;
  boostBar: number;
  volumetricEfficiencyPercent: number;
  bsfcGramsPerKwh: number;
  exhaustGasTempC: number;
  combustionPressureBar: number;
}

export interface MasterEnginePerformanceMetrics {
  displacementLiters: number;
  boreToStrokeRatio: number;
  staticCompressionRatio: number;
  effectiveDynamicCompressionRatio: number;
  peakHorsepowerHp: number;
  peakHorsepowerRpm: number;
  peakTorqueNm: number;
  peakTorqueRpm: number;
  redlineRpm: number;
  specificOutputHpPerLiter: number;
  volumetricEfficiencyPeakPercent: number;
  meanPistonSpeedAtRedlineMps: number;
  brakeThermalEfficiencyPercent: number;
  turboSpoolThresholdRpm: number;
  turboLagIndexSec: number;
  throttleResponseIndexMs: number;
  engineTotalMassKg: number;
  dynoCurve: DynoDataPoint[];
}

export interface MasterEngineCostAndBOM {
  shortBlockCostUSD: number;
  cylinderHeadsCostUSD: number;
  valvetrainCostUSD: number;
  forcedInductionCostUSD: number;
  fuelAndIgnitionCostUSD: number;
  exhaustCostUSD: number;
  lubricationCoolingCostUSD: number;
  precisionMachiningCostUSD: number;
  assemblyLaborHours: number;
  assemblyLaborCostUSD: number;
  totalEngineBOMCostUSD: number;
  suggestedMSRPUSD: number;
  drivetrainCostUSD: number;
  totalPowertrainBOMCostUSD: number;
}

export type EngineCompatibilitySeverity = "critical_hazard" | "performance_warning" | "advisory_note";

export interface EngineCompatibilityViolation {
  id: string;
  severity: EngineCompatibilitySeverity;
  affectedComponents: string[];
  title: string;
  description: string;
  recommendedRemedy: string;
}

export interface EngineCompatibilityReport {
  isMechanicallySafe: boolean;
  criticalHazardsCount: number;
  warningsCount: number;
  violations: EngineCompatibilityViolation[];
  valveFloatRpm: number;
  maxSafeCrankTorqueNm: number;
  detonationThresholdOctane: number;
}

// ============================================================================
// 3. MASTER UNIFIED ENGINE STATE SCHEMA
// ============================================================================

export interface MasterEngineState {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  author: string;

  // 14 Core Subassemblies + Cosmetics
  architecture: ArchitectureSubsystemState;
  block: EngineBlockSubsystemState;
  crankshaft: CrankshaftSubsystemState;
  connectingRods: ConnectingRodsSubsystemState;
  pistons: PistonsSubsystemState;
  cylinderHeads: CylinderHeadsSubsystemState;
  camshafts: CamshaftsSubsystemState;
  valvesAndSprings: ValvesAndSpringsSubsystemState;
  intake: AirIntakeSubsystemState;
  fuelSystem: FuelSystemSubsystemState;
  ignition: IgnitionSubsystemState;
  turboSystem: ForcedInductionSubsystemState;
  exhaust: ExhaustSubsystemState;
  lubrication: LubricationSubsystemState;
  tuning: EngineTuningSubsystemState;
  cosmetics?: EngineCosmeticsSubsystemState;

  // 15th Subsystem: Drivetrain (Transmission + Differential + Clutch)
  drivetrain: DrivetrainSubsystemState;

  // Computed Multi-Physics Telemetry
  performance: MasterEnginePerformanceMetrics;
  costAndBOM: MasterEngineCostAndBOM;
  compatibility: EngineCompatibilityReport;
  drivetrainPerformance?: MasterDrivetrainPerformanceMetrics;
}

// ============================================================================
// 4. ENGINE COSMETICS & COVER CUSTOMIZATION TAXONOMY
// ============================================================================

export type EngineCoverModel =
  | "hypercar_quartz"
  | "gt3_endurance"
  | "billet_skeleton"
  | "heritage_wrinkle"
  | "stealth_vortex"
  | "exposed_itb"
  | "inline_twin_cam_turbo"
  | "boxer_twin_plenum_flat"
  | "w16_quad_turbo_hypersport"
  | "rotary_apex_trochoid"
  | "supercharged_v8_shaker"
  | "f1_pneumatic_carbon_plenum";

export type EngineCoverColor =
  | "dry_carbon"
  | "forged_carbon_gold"
  | "rosso_corsa"
  | "apex_blue"
  | "giallo_yellow"
  | "british_racing_green"
  | "stealth_black"
  | "billet_silver"
  | "gold_leaf";

export type EngineCoverBezelColor =
  | "billet_gold"
  | "titanium_blue"
  | "crimson_red"
  | "cobalt_blue"
  | "stealth_black"
  | "polished_chrome";

export type ExhaustFinish =
  | "titanium_blued"
  | "inconel_gold"
  | "ceramic_white"
  | "stealth_black"
  | "polished_stainless"
  | "dyno_glow";

export type ValveCoverColor =
  | "rosso_red"
  | "monaco_blue"
  | "acid_yellow"
  | "satin_carbon"
  | "titanium_gray"
  | "gold_anodized";

export type AnodizingTheme =
  | "anodized_gold"
  | "cobalt_blue"
  | "crimson_red"
  | "stealth_black"
  | "burnt_titanium";

export interface EngineCosmeticsSubsystemState {
  coverModel: EngineCoverModel;
  coverColor: EngineCoverColor;
  coverBezelColor: EngineCoverBezelColor;
  coverStripeStyle: "none" | "dual_racing" | "italian_tricolore" | "ghost_matte" | "gold_pinstripe";
  coverStripeColor: string;
  badgeEmblemText: string;
  badgeFinish: "gold" | "chrome" | "carbon" | "titanium_blue" | "crimson";
  exhaustFinish: ExhaustFinish;
  valveCoverColor: ValveCoverColor;
  anodizingTheme: AnodizingTheme;
  showEngineCover: boolean;
  wireColor: "orange_hv" | "neon_blue" | "racing_red" | "stealth_black";
}

// ============================================================================
// 5. DRIVETRAIN SUBSYSTEM (TRANSMISSION + DIFFERENTIAL + CLUTCH)
// ============================================================================

export type TransmissionArchitectureType =
  | "dct_7"
  | "manual_6"
  | "seq_7"
  | "single_speed"
  | "cvt";

export type DifferentialType =
  | "open"
  | "viscous"
  | "mechanical_ramp"
  | "e_lsd";

export type ClutchMaterialType =
  | "organic"
  | "sintered_metallic"
  | "carbon_multi_plate";

export type BellhousingMaterial =
  | "cast_aluminum"
  | "magnesium_alloy"
  | "carbon_fiber_composite";

export type GearsetMetallurgy =
  | "case_hardened_9310"
  | "aerospace_m50_nil"
  | "powder_metal_sintered"
  | "straight_cut_dog_ring";

export interface GearRatioSet {
  gear1: number;
  gear2: number;
  gear3: number;
  gear4: number;
  gear5: number;
  gear6: number;
  gear7: number;
  gear8: number;
  finalDrive: number;
}

export interface DrivetrainSubsystemState {
  architecture: TransmissionArchitectureType;
  gearRatios: GearRatioSet;
  activeGearCount: 1 | 4 | 5 | 6 | 7 | 8;
  lsdType: DifferentialType;
  clutchType: ClutchMaterialType;
  clutchDiameterMm: number;              // 180 to 280 mm
  flywheelMassKg: number;                // 3.5 to 12.0 kg
  bellhousingMaterial: BellhousingMaterial;
  gearsetMetallurgy: GearsetMetallurgy;
  shiftTimingMs: number;                 // 8 to 250 ms
  maxInputTorqueNm: number;              // 400 to 2200 Nm
  mechanicalEfficiencyPercent: number;   // 88 to 99 %
  massKg: number;
  costUSD: number;
}

// ============================================================================
// 6. COMPUTED DRIVETRAIN PERFORMANCE METRICS
// ============================================================================

export interface WheelTorqueDataPoint {
  rpm: number;
  wheelTorqueNm: number;
  wheelHorsepowerHp: number;
}

export interface MasterDrivetrainPerformanceMetrics {
  wheelTorqueCurvesByGear: Record<number, WheelTorqueDataPoint[]>;
  optimalShiftPointsRpm: number[];         // RPM to upshift for each gear
  peakWheelTorqueNm: number;
  peakWheelHorsepowerHp: number;
  estimatedZeroTo60Sec: number;
  estimatedZeroTo100Sec: number;
  estimatedQuarterMileSec: number;
  estimatedQuarterMileSpeedMph: number;
  totalPowertrainMassKg: number;
  powerToWeightHpPerKg: number;
}

// ============================================================================
// 7. ENGINE COMPARISON A/B DELTA
// ============================================================================

export interface EngineComparisonDelta {
  engineA: { id: string; name: string };
  engineB: { id: string; name: string };
  displacementDiffL: number;
  powerDiffHp: number;
  torqueDiffNm: number;
  redlineDiffRpm: number;
  massDiffKg: number;
  costDiffUSD: number;
  specificOutputDiffHpPerL: number;
  thermalEfficiencyDiffPercent: number;
  powerCurveA: DynoDataPoint[];
  powerCurveB: DynoDataPoint[];
}
