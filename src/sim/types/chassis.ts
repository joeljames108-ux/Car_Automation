// ===================================================================
// CHASSIS ENGINEERING TYPES — Deep subsystem configs for Phase 1
// ===================================================================

import type { SuspensionType, TireCompound, ChassisType } from "../types";

// ---------- Vehicle Architecture ----------

export type VehicleArchitecture =
  | "sedan" | "hatchback" | "coupe" | "convertible" | "wagon"
  | "suv" | "crossover" | "pickup" | "roadster" | "van"
  | "hypercar" | "formula" | "rally" | "gt" | "lmp";

// ---------- Chassis Engineering ----------

export type CrashStructureLevel = "basic" | "reinforced" | "advanced" | "motorsport";

export interface ChassisEngineeringConfig {
  architecture: VehicleArchitecture;
  chassisType: ChassisType;
  wheelbase: number;           // mm (2200-3200)
  trackWidthFront: number;     // mm (1400-1700)
  trackWidthRear: number;      // mm (1400-1700)
  frontOverhang: number;       // mm (600-1200)
  rearOverhang: number;        // mm (400-1000)
  cgHeight: number;            // mm (350-700)
  weightDistribution: number;  // 0-1 (front ratio, e.g. 0.5 = 50/50)
  chassisRigidity: number;     // kNm/deg (8-50)
  crashStructure: CrashStructureLevel;
}

// ---------- Suspension Geometry ----------

export interface SuspensionGeometryConfig {
  // Types
  typeFront: SuspensionType;
  typeRear: SuspensionType;
  // Front geometry
  camberFront: number;         // degrees (-5 to 0)
  casterFront: number;         // degrees (2 to 12)
  toeFront: number;            // degrees (-2 to 2, negative = toe-out)
  // Rear geometry
  camberRear: number;          // degrees (-5 to 0)
  toeRear: number;             // degrees (-1 to 1, positive = toe-in)
  // Geometry
  rollCenterFront: number;     // mm above ground (0-200)
  rollCenterRear: number;      // mm above ground (0-200)
  antiDive: number;            // % (0-60)
  antiSquat: number;           // % (0-60)
  // Spring & Damper
  springRateFront: number;     // N/mm (40-300)
  springRateRear: number;      // N/mm (40-300)
  damperFront: number;         // 0-1
  damperRear: number;          // 0-1
  antiRollBarFront: number;    // 0-1
  antiRollBarRear: number;     // 0-1
  rideHeight: number;          // mm (40-250)
}

// ---------- Steering Engineering ----------

export type RackType = "rack_pinion" | "recirculating_ball" | "electric_rack";
export type PowerAssistType = "none" | "hydraulic" | "electric" | "electro_hydraulic";

export interface SteeringConfig {
  steeringRatio: number;       // 10-20 (lower = more direct)
  rackType: RackType;
  powerAssist: PowerAssistType;
  rearWheelSteering: boolean;
  rearSteerAngle: number;      // degrees (0-5)
  variableRatio: boolean;
}

// ---------- Brake Engineering ----------

export type BrakeRotorMaterial = "cast_iron" | "steel" | "carbon_ceramic" | "tungsten_carbide";
export type BrakePadCompound = "street" | "sport" | "race" | "endurance";

export interface BrakeConfig {
  // Front brakes
  frontRotorDiameter: number;  // mm (280-420)
  frontRotorThickness: number; // mm (20-38)
  frontRotorMaterial: BrakeRotorMaterial;
  frontCaliperPistons: number; // 1, 2, 4, 6, 8
  // Rear brakes
  rearRotorDiameter: number;   // mm (260-400)
  rearRotorThickness: number;  // mm (16-32)
  rearRotorMaterial: BrakeRotorMaterial;
  rearCaliperPistons: number;  // 1, 2, 4, 6
  // Pads & setup
  padCompound: BrakePadCompound;
  brakeDucts: boolean;
  brakeBias: number;           // 0.3-0.8 (front ratio)
}

// ---------- Tire Engineering ----------

export type TireConstruction = "radial" | "bias";

export interface TireEngineeringConfig {
  // Front tires
  frontWidth: number;          // mm (185-355)
  frontAspectRatio: number;    // % (25-65)
  frontDiameter: number;       // inches (15-22)
  frontCompound: TireCompound;
  frontPressure: number;       // bar (1.5-3.5)
  // Rear tires
  rearWidth: number;           // mm (195-365)
  rearAspectRatio: number;     // % (25-65)
  rearDiameter: number;        // inches (15-22)
  rearCompound: TireCompound;
  rearPressure: number;        // bar (1.5-3.5)
  // Construction
  construction: TireConstruction;
}

// ---------- Wheel Engineering ----------

export type WheelMaterial = "steel" | "cast_alloy" | "forged_alloy" | "magnesium" | "carbon_fiber";

export interface WheelEngineeringConfig {
  // Front wheels
  frontMaterial: WheelMaterial;
  frontDiameter: number;       // inches (15-22)
  frontWidth: number;          // inches (7-13)
  frontOffset: number;         // mm (-20 to +60)
  // Rear wheels
  rearMaterial: WheelMaterial;
  rearDiameter: number;        // inches (15-22)
  rearWidth: number;           // inches (7-13)
  rearOffset: number;          // mm (-20 to +60)
}

// ---------- Simulation outputs ----------

export interface ChassisSimResult {
  // Chassis
  chassisWeight: number;       // kg from chassis structure alone
  torsionalRigidity: number;   // kNm/deg
  totalLength: number;         // mm
  turningCircle: number;       // m
  // Suspension
  rollStiffness: number;       // Nm/deg
  naturalFreqFront: number;    // Hz
  naturalFreqRear: number;     // Hz
  // Steering
  steeringEffort: number;      // 0-1 (lower = lighter)
  lockToLock: number;          // turns
  steeringFeel: number;        // 0-1 (higher = better)
  // Brakes
  brakingForce: number;        // N total
  brakeTemp100: number;        // °C after 100-0 stop
  brakeFadeResistance: number; // 0-1
  brakePedalFeel: number;      // 0-1
  stoppingDist60: number;      // m
  stoppingDist100: number;     // m
  // Tires
  contactPatchFront: number;   // cm²
  contactPatchRear: number;    // cm²
  tireGripFront: number;       // 0-1 normalized
  tireGripRear: number;        // 0-1
  aquaplaningSpeed: number;    // km/h
  tireWearRate: number;        // 0-1 (higher = faster wear)
  rollingResistance: number;   // N
  // Wheels
  unsprungMassFront: number;   // kg per corner
  unsprungMassRear: number;    // kg per corner
  rotationalInertia: number;   // kg·m²
  // Aggregate scores
  handlingScore: number;       // 0-100
  comfortScore: number;        // 0-100
  chassisCost: number;         // $
}
