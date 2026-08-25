/**
 * ============================================================================
 * MASTER VEHICLE STATE & MODULAR 3D ARCHITECTURE TAXONOMY
 * ============================================================================
 * Defines the unified, single-source-of-truth VehicleState schema connecting
 * Configurator UI, procedural 3D glTF subassemblies, multi-physics solvers,
 * cost/BOM estimation, packaging compatibility, and lap simulation telemetry.
 */

import { VehicleBodyType } from "../../exterior3d/types/vehicleConstructionTypes";
import { ChassisType } from "../types";
import { MasterInteriorConfiguration, InteriorErgonomicsTelemetry } from "../../exterior3d/types/interiorStudioTypes";

export type VehicleDrivetrainArchitecture =
  | "front_engine_fwd"
  | "front_engine_rwd"
  | "front_mid_engine_rwd"
  | "mid_engine_rwd"
  | "mid_engine_awd"
  | "rear_engine_rwd"
  | "rear_engine_awd"
  | "all_wheel_drive_dual_motor";

// ============================================================================
// 1. COMPONENT HIERARCHY & CATEGORIES
// ============================================================================

export type VehicleSubsystemCategory =
  | "chassis"
  | "powertrain"
  | "transmission"
  | "suspension"
  | "wheels_tires"
  | "brakes"
  | "aero"
  | "cooling"
  | "body_panels"
  | "interior"
  | "electronics"
  | "safety";

export type ComponentMountPoint =
  // Chassis hardpoints
  | "CHASSIS_FRONT_SUBFRAME"
  | "CHASSIS_REAR_SUBFRAME"
  | "CHASSIS_ENGINE_BAY"
  | "CHASSIS_TRANSMISSION_TUNNEL"
  | "CHASSIS_CABIN_FLOOR"
  | "CHASSIS_ROOF_STRUCTURE"
  | "CHASSIS_FRONT_SUSP_L"
  | "CHASSIS_FRONT_SUSP_R"
  | "CHASSIS_REAR_SUSP_L"
  | "CHASSIS_REAR_SUSP_R"
  | "CHASSIS_FRONT_BUMPER"
  | "CHASSIS_REAR_BUMPER"
  // Powertrain sub-mounts
  | "ENGINE_BLOCK_CRANK"
  | "ENGINE_BLOCK_PISTON_L"
  | "ENGINE_BLOCK_PISTON_R"
  | "ENGINE_BLOCK_HEAD_L"
  | "ENGINE_BLOCK_HEAD_R"
  | "ENGINE_HEAD_INTAKE"
  | "ENGINE_HEAD_EXHAUST"
  | "ENGINE_EXHAUST_TURBO_L"
  | "ENGINE_EXHAUST_TURBO_R"
  | "ENGINE_FLYWHEEL_OUTPUT"
  // Aero mounts
  | "AERO_FRONT_SPLITTER_SOCKET"
  | "AERO_CANARDS_FRONT_L"
  | "AERO_CANARDS_FRONT_R"
  | "AERO_UNDERBODY_DIFFUSER"
  | "AERO_REAR_WING_DECK"
  | "AERO_SIDE_SKIRT_L"
  | "AERO_SIDE_SKIRT_R"
  // Interior mounts
  | "INTERIOR_DASHBOARD_CROSSBAR"
  | "INTERIOR_STEERING_COLUMN"
  | "INTERIOR_SEAT_RAILS_DRIVER"
  | "INTERIOR_SEAT_RAILS_PASSENGER"
  | "INTERIOR_CENTER_CONSOLE_TUNNEL"
  | "INTERIOR_DOOR_CARD_L"
  | "INTERIOR_DOOR_CARD_R"
  | "INTERIOR_PEDAL_BOX_FLOOR"
  | "INTERIOR_ROLLCAGE_HARDPOINTS";

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface AttachmentSocket {
  id: ComponentMountPoint;
  parentComponentId: string;
  localPosition: Vector3D; // mm relative to parent origin
  localRotation: Vector3D; // Euler angles in degrees
  compatibleCategories: VehicleSubsystemCategory[];
  isOccupied: boolean;
  attachedComponentId?: string;
  maxLoadKn?: number;
}

export interface ModularComponentSpec {
  id: string;
  name: string;
  category: VehicleSubsystemCategory;
  mountPointRequired: ComponentMountPoint;
  providedSockets: AttachmentSocket[];
  massKg: number;
  centerOfMassOffsetMm: Vector3D;
  costUSD: number;
  dimensionsMm: Vector3D;
  structuralRigidityBonusKNmPerDeg?: number;
  dragModifierCd?: number;
  downforceModifierNAt100Mph?: number;
  coolingCapacityWatts?: number;
  powerOutputBonusKw?: number;
  thermalLoadWatts?: number;
  electricalLoadWatts?: number;
  description: string;
}

// ============================================================================
// 2. UNIFIED MASTER VEHICLE STATE SCHEMA
// ============================================================================

export interface ChassisSubsystemState {
  chassisId: string;
  bodyType: VehicleBodyType;
  architecture: VehicleDrivetrainArchitecture;
  chassisType: ChassisType;
  wheelbaseMm: number;        // e.g. 2400 to 3300 mm
  frontTrackMm: number;       // e.g. 1450 to 1750 mm
  rearTrackMm: number;        // e.g. 1450 to 1750 mm
  frontOverhangMm: number;    // e.g. 600 to 1100 mm
  rearOverhangMm: number;     // e.g. 500 to 1000 mm
  groundClearanceMm: number;  // e.g. 60 to 220 mm
  materialGrade: "mild_steel" | "chromoly" | "extruded_aluminum" | "carbon_composite" | "titanium_matrix";
  torsionalRigidityKNmPerDeg: number;
  massKg: number;
  /**
   * Optional measured front weight distribution override (percent, 0-100).
   * When present it takes precedence over the architecture-based heuristic so
   * benchmark vehicles reproduce their real static weight distribution.
   */
  weightDistributionFrontPct?: number;
  /** Optional measured centre-of-gravity height override (mm). */
  coGHeightMm?: number;
}

export interface PowertrainSubsystemState {
  engineType: "v6" | "v8" | "v10" | "v12" | "i4" | "i6" | "boxer4" | "boxer6" | "rotary" | "electric_dual_motor";
  displacementL: number;
  cylinderCount: number;
  aspiration: "naturally_aspirated" | "single_turbo" | "twin_turbo" | "supercharged" | "quad_turbo";
  boostBar: number;
  boreMm: number;
  strokeMm: number;
  compressionRatio: number;
  redlineRpm: number;
  peakPowerHp: number;
  peakTorqueNm: number;
  fuelType: "pump_93" | "race_100" | "e85_flex" | "methanol" | "hydrogen_ice" | "ev_800v";
  thermalDissipationKw: number;
  massKg: number;
  mountedPistons: boolean;
  mountedCylinderHeads: boolean;
  mountedTurbos: boolean;
  mountedIntake: boolean;
  /** Hybrid-electric assistance flag (affects power-delivery solver). */
  isHybrid?: boolean;
}

export interface TransmissionSubsystemState {
  transmissionType: "manual_6sp" | "sequential_6sp" | "dual_clutch_8sp" | "torque_converter_8sp" | "ev_direct_drive";
  gearCount: number;
  gearRatios: number[];
  finalDriveRatio: number;
  shiftTimeMs: number;
  differentialType: "open" | "mechanical_lsd" | "electronic_torque_vectoring" | "spool_locked";
  diffPreloadNm: number;
  maxTorqueRatingNm: number;
  massKg: number;
}

export interface SuspensionSubsystemState {
  frontType: "double_wishbone" | "macpherson" | "pushrod" | "multilink";
  rearType: "double_wishbone" | "multilink" | "pushrod" | "trailing_arm";
  frontSpringRateNmm: number;
  rearSpringRateNmm: number;
  frontDamperCompressionNsM: number;
  rearDamperCompressionNsM: number;
  frontDamperReboundNsM: number;
  rearDamperReboundNsM: number;
  frontAntiRollBarStiffnessNmDeg: number;
  rearAntiRollBarStiffnessNmDeg: number;
  camberFrontDeg: number;
  camberRearDeg: number;
  toeFrontDeg: number;
  toeRearDeg: number;
  rideHeightFrontMm: number;
  rideHeightRearMm: number;
  activeAeroRideHeightCompensation: boolean;
  massKg: number;
}

export interface WheelsAndBrakesSubsystemState {
  wheelDiameterFrontInch: number;
  wheelDiameterRearInch: number;
  wheelWidthFrontMm: number;
  wheelWidthRearMm: number;
  tireCompound: "street_comfort" | "ultra_high_performance" | "track_r_compound" | "racing_slick" | "wet_intermediate";
  tirePressureFrontPsi: number;
  tirePressureRearPsi: number;
  brakeDiscType: "cast_iron_vented" | "carbon_ceramic_matrix" | "carbon_carbon_race";
  frontDiscDiameterMm: number;
  rearDiscDiameterMm: number;
  frontCaliperPistonCount: 4 | 6 | 8 | 10;
  rearCaliperPistonCount: 2 | 4 | 6;
  brakeBiasFrontPercent: number; // e.g. 58%
  absEnabled: boolean;
  massKg: number;
}

export interface AeroSubsystemState {
  frontSplitterLengthMm: number; // e.g. 0 to 220 mm
  frontCanardsCount: number;      // 0, 2, 4
  frontWingAngleDeg: number;     // e.g. 0 to 18 deg
  underbodyFlatFloor: boolean;
  underbodyVenturiTunnels: boolean;
  rearDiffuserAngleDeg: number;  // e.g. 0 to 24 deg
  rearDiffuserStrakeCount: number; // 2, 4, 6
  rearWingSpanMm: number;        // e.g. 1200 to 1850 mm
  rearWingChordMm: number;       // e.g. 200 to 450 mm
  rearWingAngleDeg: number;      // e.g. 0 to 30 deg
  rearGurneyFlapHeightMm: number;// 0 to 15 mm
  activeDrsEnabled: boolean;
  activeDrsOpenWingAngleDeg: number; // e.g. 2 deg
  sidepodsCoolingAirflowLps: number;
  // Computed output metrics
  totalDownforceNAt100Mph: number;
  totalDragNAt100Mph: number;
  aeroBalanceFrontPercent: number; // e.g. 42%
  liftToDragRatio: number;        // e.g. 3.4
  topSpeedDragAreaCdA: number;
  /** When true, totalDownforceNAt100Mph & topSpeedDragAreaCdA are measured
   * declarations that take precedence over the parametric wing solver. */
  declaredAeroOverride?: boolean;
  massKg: number;
}

export interface BodyPanelsSubsystemState {
  material: "steel_stamping" | "aluminum_sheet" | "fiberglass" | "prepreg_carbon_fiber" | "forged_carbon";
  hoodStyle: "flat_vented" | "cowl_induction" | "gt_twin_duct" | "transparent_engine_cover";
  roofStyle: "solid_coupe" | "panoramic_glass" | "targa_removable" | "speedster_cowl";
  fenderWidthFrontBonusMm: number;
  fenderWidthRearBonusMm: number;
  sideSkirtGroundSeal: boolean;
  paintColorHex: string;
  paintFinish: "gloss" | "satin" | "matte" | "chameleon_iridescent" | "exposed_carbon";
  liveryDecals: string[];
  massKg: number;
}

export interface CoolingAndThermalSubsystemState {
  radiatorCoreAreaCm2: number;
  radiatorThicknessMm: number;
  oilCoolerInstalled: boolean;
  intercoolerType: "air_to_air" | "water_to_air_charge_cooler";
  brakeCoolingDucts: boolean;
  transmissionCoolerInstalled: boolean;
  heatDissipationTotalKw: number;
  massKg: number;
}

export interface ElectronicsAndAdasSubsystemState {
  tractionControlLevel: number; // 0 to 10
  launchControlInstalled: boolean;
  driveModes: ("ECO" | "COMFORT" | "SPORT" | "CORSA" | "DRIFT" | "QUALIFYING")[];
  activeDriveMode: "ECO" | "COMFORT" | "SPORT" | "CORSA" | "DRIFT" | "QUALIFYING";
  telemetryLoggingFrequencyHz: number;
  activeAerodynamicsController: boolean;
  brakeByWire: boolean;
  steerByWire: boolean;
  massKg: number;
  /** Optional manufacturer electronic V-max governor (km/h). Undefined = drag-limited. */
  topSpeedLimiterKmh?: number;
}

export interface SafetySubsystemState {
  rollCageType: "none" | "4_point_harness_bar" | "6_point_fia_bolt_in" | "full_welded_gt3_spaceframe";
  fireSuppressionInstalled: boolean;
  harnessType: "3_point_street_belt" | "schroth_enduro_pro" | "sabelt_6_point_f1";
  fuelCellSafetyBladder: boolean;
  crashStructureRating: "basic" | "reinforced" | "advanced" | "motorsport_fia";
  massKg: number;
}

// Master Unified State
export interface MasterVehicleState {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  author: string;
  
  // 12 Subsystems
  chassis: ChassisSubsystemState;
  powertrain: PowertrainSubsystemState;
  transmission: TransmissionSubsystemState;
  suspension: SuspensionSubsystemState;
  wheelsBrakes: WheelsAndBrakesSubsystemState;
  aero: AeroSubsystemState;
  bodyPanels: BodyPanelsSubsystemState;
  cooling: CoolingAndThermalSubsystemState;
  interior: MasterInteriorConfiguration;
  electronics: ElectronicsAndAdasSubsystemState;
  safety: SafetySubsystemState;

  // Real-Time Computed Multi-Physics Telemetry
  metrics: UnifiedVehiclePerformanceMetrics;
  ergonomics: InteriorErgonomicsTelemetry;
  costAndBOM: UnifiedVehicleCostAndBOM;
  compatibility: PackagingCompatibilityReport;
}

// ============================================================================
// 3. COMPUTED METRICS, DELTAS & TELEMETRY
// ============================================================================

export interface UnifiedVehiclePerformanceMetrics {
  totalCurbMassKg: number;
  weightDistributionFrontPercent: number; // e.g. 48.5%
  weightDistributionRearPercent: number;  // e.g. 51.5%
  centerOfGravityHeightMm: number;        // e.g. 420 mm
  cornerWeightsKg: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  powerToWeightRatioHpPerTonne: number;
  peakHorsepowerHp: number;
  peakTorqueNm: number;
  topSpeedKmh: number;
  zeroToHundredKmhSec: number;
  zeroToTwoHundredKmhSec: number;
  quarterMileTimeSec: number;
  quarterMileTrapSpeedKmh: number;
  brakingDistance100To0M: number;
  maxLateralAccelerationG: number;
  slalomSpeedKmh: number;
  
  // Aerodynamic Forces at 160 km/h (100 mph) and 250 km/h
  downforceAt160KmhN: number;
  dragAt160KmhN: number;
  downforceAt250KmhN: number;
  dragAt250KmhN: number;
  aerodynamicEfficiencyLOverD: number;

  // Track Performance
  nurburgringNordschleifeLapSec: number;
  spaFrancorchampsLapSec: number;
  silverstoneGPLapSec: number;
  lagunaSecaLapSec: number;
  
  // Thermal & Mechanical Stability
  engineCoolingMarginPercent: number; // positive = adequate cooling
  brakeFadeResistancePercent: number;
  fuelEconomyLitersPer100Km: number;
}

export interface PhysicsStateDelta {
  parameterName: string;
  previousValue: number | string;
  newValue: number | string;
  deltaMassKg: number;
  deltaPowerHp: number;
  deltaTorqueNm: number;
  deltaZeroToHundredSec: number;
  deltaTopSpeedKmh: number;
  deltaDownforceN: number;
  deltaDragN: number;
  deltaLateralG: number;
  deltaLapTimeSec: number;
  deltaCostUSD: number;
  timestamp: number;
}

export interface UnifiedVehicleCostAndBOM {
  chassisCapExUSD: number;
  powertrainCapExUSD: number;
  transmissionCapExUSD: number;
  suspensionWheelsUSD: number;
  aeroPackageUSD: number;
  bodyShellUSD: number;
  interiorCabinUSD: number;
  electronicsSafetyUSD: number;
  assemblyLaborHours: number;
  assemblyLaborUSD: number;
  totalManufacturingCostUSD: number;
  suggestedMSRPUSD: number;
}

// ============================================================================
// 4. PACKAGING & COMPATIBILITY ENGINE TYPES
// ============================================================================

export interface PackagingRuleViolation {
  id: string;
  severity: "critical_error" | "warning_advisory" | "efficiency_penalty";
  affectedSubsystems: VehicleSubsystemCategory[];
  title: string;
  explanation: string;
  consequence: string;
  remedySuggestion: string;
  suggestedPatch?: Partial<MasterVehicleState>;
}

export interface PackagingCompatibilityReport {
  isPhysicallyFeasible: boolean;
  totalViolations: number;
  criticalErrorsCount: number;
  warningsCount: number;
  engineBayClearanceMm: { x: number; y: number; z: number };
  wheelArchClearanceMm: { front: number; rear: number };
  coolingAdequacyScorePercent: number;
  transmissionTorqueSafetyFactor: number;
  electricalLoadBalanceWatts: number;
  violations: PackagingRuleViolation[];
}

// ============================================================================
// 5. VEHICLE SNAPSHOT & COMPARISON A/B
// ============================================================================

export interface VehicleComparisonDelta {
  carA: { id: string; name: string };
  carB: { id: string; name: string };
  massDiffKg: number;
  powerDiffHp: number;
  torqueDiffNm: number;
  zeroToHundredDiffSec: number;
  topSpeedDiffKmh: number;
  downforceDiffN: number;
  dragDiffN: number;
  lateralGDiff: number;
  lapTimeDiffSec: number;
  costDiffUSD: number;
  sectorDeltas: {
    sector1DiffSec: number;
    sector2DiffSec: number;
    sector3DiffSec: number;
  };
}
