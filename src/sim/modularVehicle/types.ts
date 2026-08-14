// ===================================================================
// MODULAR VEHICLE ASSEMBLY SYSTEM — CORE TYPES & DATA MODELS
// ===================================================================
// The chassis provides the master coordinate system.
// Every SVG component is a real, attachable module.
// Mounting & anchor points determine physical alignment.
// Component engineering data influences vehicle physics & lap-time.
// ===================================================================

export type {
  EngineConfig,
  EngineSim,
  ChassisType,
  SuspensionType,
  BrakeType,
  TransmissionType,
  DriveType,
  EnginePosition,
} from "../types";

// ---------- Geometry & Coordinate System ----------

/** 2D Point in millimeters (mm) or SVG canvas pixels (px) */
export interface Coordinate2D {
  x: number; // mm in chassis-local space (X = 0 at rear axle centre, +X = forward)
  y: number; // mm in chassis-local space (Y = 0 at vehicle centreline, +Y = left)
}

/** 3D Point in chassis-local millimeter coordinates */
export interface Coordinate3D extends Coordinate2D {
  z: number; // mm in chassis-local space (Z = 0 at ground plane, +Z = up)
}

/** 2D Transformation matrix parameters for SVG positioning */
export interface Transform2D {
  translateX: number; // mm or px
  translateY: number; // mm or px
  rotation: number;   // degrees clockwise from vehicle forward axis
  scaleX: number;
  scaleY: number;
  mirrorX: boolean;   // flip horizontally across vehicle centreline (for L/R component pairs)
}

/** Bounding box of an SVG component in component-local coordinates (mm) */
export interface BoundingBox2D {
  x: number;      // top-left X relative to component origin
  y: number;      // top-left Y relative to component origin
  width: number;  // mm
  height: number; // mm
}

// ---------- Anchor & Mounting Point Infrastructure ----------

export type AnchorCategory =
  | "engine_mount"
  | "transmission_mount"
  | "driveshaft"
  | "suspension_upper"
  | "suspension_lower"
  | "suspension_spring"
  | "steering_rack"
  | "steering_column"
  | "steering_knuckle"
  | "brake_caliper"
  | "wheel_hub"
  | "wheel_bearing"
  | "cooling_primary"
  | "cooling_secondary"
  | "cooling_fan"
  | "exhaust_manifold"
  | "exhaust_midpipe"
  | "exhaust_tailpipe"
  | "intake_airbox"
  | "intake_manifold"
  | "intake_throttle"
  | "battery_mount"
  | "ecu_mount"
  | "inverter_mount"
  | "aero_front"
  | "aero_rear"
  | "aero_side"
  | "aero_underbody"
  | "generic";

export type AnchorCompatibilityTag = string; // e.g. "front_axle", "rear_axle", "engine_bay"

/** Anchor point on the MASTER CHASSIS where components attach */
export interface AnchorPoint {
  id: string;                              // e.g. "FRONT_SUSPENSION_LEFT_UPPER"
  position: Coordinate2D;                  // in chassis-local mm
  rotation: number;                        // degrees
  category: AnchorCategory;
  compatibilityTags: AnchorCompatibilityTag[];
  mirroredPairId?: string;                 // e.g. "FRONT_SUSPENSION_RIGHT_UPPER"
  zOrder: number;                          // SVG rendering layer priority
}

/** Mounting point defined on a COMPONENT that snaps to a chassis AnchorPoint */
export interface MountingPoint {
  id: string;                              // e.g. "wishbone_pivot_upper"
  localPosition: Coordinate2D;             // in component-local mm
  rotation: number;                        // degrees
  category: AnchorCategory;
  compatibilityTags: AnchorCompatibilityTag[];
  mirroredPairId?: string;
}

// ---------- Subsystems ----------

export type VehicleSubsystem =
  | "chassis"
  | "suspension"
  | "powertrain"
  | "transmission"
  | "drivetrain"
  | "brakes"
  | "wheels"
  | "steering"
  | "cooling"
  | "exhaust"
  | "intake"
  | "electrical"
  | "battery"
  | "aerodynamics";

// ---------- Component Engineering Metadata ----------

export interface ComponentEngineeringData {
  mass: number;                  // kg
  centreOfMass?: Coordinate3D;   // relative to component local origin (mm)
  cost: number;                  // USD

  // Powertrain & Engine
  power?: number;                // kW
  torque?: number;               // Nm
  powerCurve?: { rpm: number; power: number; torque: number }[];

  // Suspension & Chassis dynamics
  springRate?: number;           // N/mm
  dampingCoefficient?: number;   // Ns/mm
  rollCentreHeight?: number;     // mm
  unsprungMass?: number;         // kg
  camberGain?: number;           // deg/mm travel
  maxTravel?: number;            // mm
  torsionalRigidity?: number;    // kNm/deg

  // Brakes
  brakingForce?: number;         // N
  thermalCapacity?: number;      // kJ/K
  frictionCoefficient?: number;

  // Aerodynamics
  dragCoefficient?: number;      // Cd contribution
  downforceCoefficient?: number; // Cl contribution
  aeroBalance?: number;          // 0 to 1 (0 = full rear, 1 = full front)

  // Steering
  steeringRatio?: number;
  maxSteeringAngle?: number;     // degrees

  // Thermal
  heatOutput?: number;           // kW
  coolingCapacity?: number;      // kW

  // Drivetrain & Transmission
  gearRatios?: number[];
  finalDriveRatio?: number;
  efficiency?: number;           // 0 to 1

  // Electrical & Battery
  voltage?: number;              // V
  capacity?: number;             // kWh

  // Wheels & Tyres
  gripCoefficient?: number;
  rollingResistance?: number;
}

// ---------- Component Installation States ----------

export type InstallationState =
  | "available"
  | "preview"
  | "installing"
  | "installed"
  | "error"
  | "incompatible";

// ---------- Modular Component Specification ----------

export interface ModularComponent {
  id: string;                              // unique component ID
  name: string;                            // human-readable title
  subsystem: VehicleSubsystem;
  variantId: string;                       // e.g. "double_wishbone", "macpherson"
  variantLabel: string;                    // e.g. "Double Wishbone (Track Spec)"

  // Visual SVG Metadata
  svgGroupId: string;                      // DOM element ID or group name
  svgAssetPath?: string;                   // optional path to external SVG
  boundingBox: BoundingBox2D;
  localOrigin: Coordinate2D;              // origin in local component space (mm)
  defaultScale: number;                    // baseline scale factor

  // Anchor & Attachment Coordinates
  mountingPoints: MountingPoint[];

  // Physical & Performance Engineering Parameters
  engineeringData: ComponentEngineeringData;

  // Compatibility & Rules
  compatibleWith: string[];                // IDs of compatible components
  incompatibleWith: string[];              // IDs of conflicting components
  dependencies: string[];                  // Component IDs required to be installed first
  requiredAnchorCategories: AnchorCategory[]; // Chassis anchor categories required

  // Assembly Metadata
  installLayer: number;                    // SVG z-index ordering
  isLeftRightPair: boolean;                // requires mirrored pair on opposite side
  mirrorAxis?: "x" | "y";
  animationDurationMs: number;
  description: string;
}

// ---------- Installed Component Instance ----------

export interface AnchorBinding {
  chassisAnchorId: string;
  componentMountId: string;
}

export interface InstalledModularComponent {
  instanceId: string;                      // unique instance ID
  componentId: string;                     // reference to ModularComponent.id
  anchorBindings: AnchorBinding[];         // mapping between chassis anchor & component mount
  resolvedTransform: Transform2D;          // calculated deterministic transform
  installationState: InstallationState;
  installedAt: number;                     // timestamp
  side?: "left" | "right" | "centre";
}

// ---------- Master Chassis Assembly ----------

export interface ModularChassis {
  id: string;
  name: string;
  chassisType: ChassisType;

  // Master Coordinate System Dimensions (mm)
  wheelbaseMm: number;                     // distance from rear axle centre (X=0) to front axle centre
  trackWidthFrontMm: number;
  trackWidthRearMm: number;
  frontOverhangMm: number;
  rearOverhangMm: number;

  // Derived Dimensions
  totalLengthMm: number;
  totalWidthMm: number;

  // Anchors on Chassis
  anchors: AnchorPoint[];

  // Baseline Chassis Engineering Properties
  engineeringData: ComponentEngineeringData;

  // SVG Render Metadata
  svgGroupId: string;
  svgViewBox: { x: number; y: number; width: number; height: number };
}

// ---------- Aggregate Engineering Statistics ----------

export interface AggregateVehicleStats {
  totalMass: number;                       // kg
  frontAxleMass: number;                   // kg
  rearAxleMass: number;                    // kg
  weightDistribution: number;              // 0 to 1 (front mass ratio)
  centreOfMass: Coordinate3D;              // mm from rear axle centre
  totalPower: number;                      // kW
  totalTorque: number;                     // Nm
  totalDownforce: number;                  // N
  totalDrag: number;                       // Cd * A
  aeroBalance: number;                     // 0 to 1 (front ratio)
  totalBrakingForce: number;               // N
  totalCoolingCapacity: number;            // kW
  totalHeatOutput: number;                 // kW
  thermalBalance: number;                  // cooling / heat ratio
  totalCost: number;                       // USD
  torsionalRigidity: number;              // kNm/deg
}

// ---------- System Validation ----------

export type ValidationSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export interface ValidationResult {
  id: string;
  severity: ValidationSeverity;
  subsystem: VehicleSubsystem;
  componentId?: string;
  message: string;
  details: string;
  autoFixAvailable: boolean;
}

// ---------- Master Vehicle Assembly State ----------

export interface ModularVehicleAssembly {
  id: string;
  name: string;
  chassis: ModularChassis;
  installedComponents: Map<string, InstalledModularComponent>;
  enginePosition: EnginePosition;
  driveType: DriveType;
  aggregateStats: AggregateVehicleStats;
  validationResults: ValidationResult[];
  isComplete: boolean;
}
