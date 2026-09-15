// ============================================================================
// VEHICLE ARCHITECTURE SYSTEM — CORE TYPE DEFINITIONS
// ============================================================================
// Defines the fundamental architectural contracts for vehicle categories:
// Sedan, Hatchback, Crossover, SUV (and future expansion types).
// Governs dimensions, packaging envelopes, hardpoints, and GLB asset packages.
// ============================================================================

export type CoreVehicleCategory =
  | "sedan"
  | "hatchback"
  | "crossover"
  | "suv"
  | "bus";

export type FutureVehicleCategory =
  // Extensible future categories:
  | "coupe"
  | "sports_car"
  | "supercar"
  | "hypercar"
  | "gt"
  | "wagon"
  | "pickup"
  | "van"
  | "race_car"
  | "gt3"
  | "prototype";

// 7 Canonical Eras for Vehicle Architecture Selection (1970s -> Future)
export type VehicleEraId =
  | "1970s"
  | "1980s"
  | "1990s"
  | "2000s"
  | "2010s"
  | "2020s"
  | "future";

// 24 Canonical Vehicle Architectures
export type VehicleArchitectureId =
  | "sedan"
  | "hatchback"
  | "coupe"
  | "convertible"
  | "roadster"
  | "sports_car"
  | "supercar"
  | "hypercar"
  | "grand_tourer"
  | "muscle_car"
  | "luxury_car"
  | "limousine"
  | "shooting_brake"
  | "wagon"
  | "crossover"
  | "suv"
  | "offroad_4x4"
  | "pickup_truck"
  | "heavy_truck"
  | "van"
  | "mpv"
  | "bus"
  | "race_formula"
  | "gt3_racing";

export type VehicleCategory = CoreVehicleCategory | FutureVehicleCategory | VehicleArchitectureId;

export interface VehicleEraMetadata {
  id: VehicleEraId;
  label: string;
  yearRange: string;
  description: string;
  badge: string;
}

export interface VehicleArchitectureMetadataDefinition {
  id: VehicleArchitectureId;
  name: string;
  categoryGroup: "passenger" | "performance" | "utility" | "commercial" | "motorsport";
  tagline: string;
  description: string;
  fallbackGlbPath: string;
}

export interface VehicleDesignDna {
  silhouette: string;
  keyFeatures: string[];
  stylingLanguage: string;
  aerodynamics: string;
}

export interface VehicleArchitectureEraEntry {
  architectureId: VehicleArchitectureId;
  eraId: VehicleEraId;
  referenceVehicle: string;
  designDna: VehicleDesignDna;
  defaultDimensions: {
    wheelbaseMm: number;
    frontTrackMm: number;
    rearTrackMm: number;
    overallLengthMm: number;
    overallWidthMm: number;
    overallHeightMm: number;
    groundClearanceMm: number;
  };
  aerodynamics: {
    cd: number;
    frontalAreaM2: number;
  };
  glbPath: string;
  fallbackGlbPath: string;
  isGlbAvailable: boolean;
  bodyOnly: true;
}

export type BodyArchitectureClass =
  | "3_box_executive"
  | "2_box_compact"
  | "2_box_elevated"
  | "2_box_heavy_duty"
  | "heavy_duty_transit_bus"
  | "monocoque_fastback"
  | "spaceframe_prototype";

export interface BoundingBoxDimensions {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  centerOffsetMm: { x: number; y: number; z: number }; // Relative to chassis origin (x=fwd/aft, y=lat, z=vert)
}

export interface HardpointCoordinate {
  id: string;
  name: string;
  positionMm: { x: number; y: number; z: number };
  mirroredId?: string;
  type: "wheel_center" | "suspension_pickup" | "subframe_mount" | "body_hinge" | "cowl_reference" | "powertrain_mount";
}

export interface VehicleArchitectureAssets {
  chassisAsset: string;
  bodyFrameworkAsset: string;
  floorAsset: string;
  wheelArchAsset: string;
  hardpointAsset: string;
  envelopeAsset: string;
}

export interface VehicleArchitectureMetadata {
  platformType: string;
  chassisVersion: string;
  bodyFrameworkVersion: string;
  designVersion: string;
  targetAeroCd: number;
  targetTorsionalRigidityKNmDeg: number;
  nominalCurbWeightKg: number;
}

export interface VehicleArchitectureConfig {
  id: VehicleCategory;
  name: string;
  category: VehicleCategory;
  tagline: string;
  description: string;
  architectureClass: BodyArchitectureClass;
  assets: VehicleArchitectureAssets;

  // Proportions & Physical Dimensions (mm)
  wheelbaseMm: number;
  trackFrontMm: number;
  trackRearMm: number;
  rideHeightMm: number;
  overallLengthMm: number;
  overallWidthMm: number;
  overallHeightMm: number;
  frontOverhangMm: number;
  rearOverhangMm: number;
  hoodHeightMm: number;
  beltlineHeightMm: number;
  roofLengthMm: number;
  roofHeightMm: number;
  wheelDiameterInches: number;
  tireWidthMm: number;
  cabPositionRatio: number; // 0.0 (cab-forward) to 1.0 (cab-rearward)
  greenhouseLengthMm: number;

  // Packaging Envelopes
  engineBayEnvelope: BoundingBoxDimensions;
  cabinEnvelope: BoundingBoxDimensions;
  cargoEnvelope: BoundingBoxDimensions;

  // Mechanical Hardpoints
  wheelCenters: {
    frontLeft: { x: number; y: number; z: number };
    frontRight: { x: number; y: number; z: number };
    rearLeft: { x: number; y: number; z: number };
    rearRight: { x: number; y: number; z: number };
  };
  hardpoints: Record<string, HardpointCoordinate>;

  // Compatible Design Studio Exterior Components
  compatibleExteriorComponents: {
    hoodStyles: string[];
    frontFenders: string[];
    rearFenders: string[];
    roofStyles: string[];
    doorConfigurations: string[];
    rearClosureType: "trunk_decklid" | "rear_hatch" | "crossover_tailgate" | "heavy_duty_liftgate";
    bumperStyles: string[];
    wheelArchLiners: string[];
  };

  metadata: VehicleArchitectureMetadata;
}

export interface AssetValidationIssue {
  type: "missing_file" | "mesh_error" | "missing_semantic_node" | "misaligned_wheel_center" | "scale_error" | "origin_error";
  message: string;
  assetPath?: string;
  expected?: string | number;
  actual?: string | number;
  severity: "error" | "warning";
}

export interface ArchitectureValidationResult {
  isValid: boolean;
  vehicleCategory: VehicleCategory;
  timestamp: string;
  checkedAssetsCount: number;
  passedAssetsCount: number;
  issues: AssetValidationIssue[];
  validatedNodes: string[];
  summary: string;
}

/**
 * Central Vehicle Configuration Object
 * Single source of truth for the vehicle platform, chassis, body framework,
 * hardpoints, dimensions, and Design Studio exterior components.
 */
export interface CentralVehicleConfiguration {
  vehicleType: VehicleCategory;
  chassisAsset: string;
  bodyFrameworkAsset: string;
  floorAsset: string;
  wheelArchAsset: string;
  hardpointAsset: string;
  envelopeAsset: string;
  wheelbase: number;
  trackWidth: number;
  rideHeight: number;
  overallLength: number;
  overallWidth: number;
  overallHeight: number;
  frontOverhang: number;
  rearOverhang: number;
  wheelDiameter: number;
  tireWidth: number;
  cabPosition: number;
  hoodHeight: number;
  roofHeight: number;
  greenhouseLength: number;
  engineBayEnvelope: BoundingBoxDimensions;
  cabinEnvelope: BoundingBoxDimensions;
  cargoEnvelope: BoundingBoxDimensions;
  wheelCenters: {
    frontLeft: { x: number; y: number; z: number };
    frontRight: { x: number; y: number; z: number };
    rearLeft: { x: number; y: number; z: number };
    rearRight: { x: number; y: number; z: number };
  };
  hardpoints: Record<string, HardpointCoordinate>;
  compatibleExteriorComponents: VehicleArchitectureConfig["compatibleExteriorComponents"];
  metadata: VehicleArchitectureMetadata;
}

export function createCentralVehicleConfiguration(arch: VehicleArchitectureConfig): CentralVehicleConfiguration {
  return {
    vehicleType: arch.category,
    chassisAsset: arch.assets.chassisAsset,
    bodyFrameworkAsset: arch.assets.bodyFrameworkAsset,
    floorAsset: arch.assets.floorAsset,
    wheelArchAsset: arch.assets.wheelArchAsset,
    hardpointAsset: arch.assets.hardpointAsset,
    envelopeAsset: arch.assets.envelopeAsset,
    wheelbase: arch.wheelbaseMm,
    trackWidth: (arch.trackFrontMm + arch.trackRearMm) / 2.0,
    rideHeight: arch.rideHeightMm,
    overallLength: arch.overallLengthMm,
    overallWidth: arch.overallWidthMm,
    overallHeight: arch.overallHeightMm,
    frontOverhang: arch.frontOverhangMm,
    rearOverhang: arch.rearOverhangMm,
    wheelDiameter: arch.wheelDiameterInches,
    tireWidth: arch.tireWidthMm,
    cabPosition: arch.cabPositionRatio,
    hoodHeight: arch.hoodHeightMm,
    roofHeight: arch.roofHeightMm,
    greenhouseLength: arch.greenhouseLengthMm,
    engineBayEnvelope: arch.engineBayEnvelope,
    cabinEnvelope: arch.cabinEnvelope,
    cargoEnvelope: arch.cargoEnvelope,
    wheelCenters: arch.wheelCenters,
    hardpoints: arch.hardpoints,
    compatibleExteriorComponents: arch.compatibleExteriorComponents,
    metadata: arch.metadata,
  };
}

