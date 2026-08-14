// ===================================================================
// VEHICLE ASSEMBLY SYSTEM — TYPES & SUBSYSTEM METADATA
// ===================================================================

import { VehicleConfig, EnginePosition, DriveType } from "./types";
import { MaterialGrade, ComponentVariant } from "./assemblyTypes";

export type VehicleComponentId =
  | "chassis_frame"
  | "engine_bay"
  | "transmission"
  | "exhaust_system"
  | "suspension_front"
  | "suspension_rear"
  | "brakes"
  | "wheels_tires"
  | "aero_package"
  | "electronics_ecu";

export interface VehicleAssemblyComponentMeta {
  id: VehicleComponentId;
  name: string;
  category: "Structure" | "Powertrain" | "Suspension & Handling" | "Exterior & Aero" | "Electronics";
  description: string;
  dependencies: VehicleComponentId[];
  explodedOffset: { x: number; y: number }; // Exploded view displacement in SVG px
  slotPosition: { x: number; y: number };    // Target installed position in SVG px
  estimatedDuration: number;               // Base animation duration in ms
  soundType: "heavy" | "click" | "slide" | "spool" | "metallic" | "pneumatic";
  variants: ComponentVariant[];
  statDeltas: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  tooltipAdvice: string;
  torqueSpec?: {
    fastenerName: string;
    snugNm: number;
    finalAngleDeg: number;
    boltCount: number;
  };
  clearanceSpec?: {
    label: string;
    targetMm: number;
    minMm: number;
    maxMm: number;
  };
}

const DEFAULT_CHASSIS_VARIANTS: ComponentVariant[] = [
  { id: "cast", label: "Steel Unibody (Standard)", hpMultiplier: 1.0, weightMultiplier: 1.30, costMultiplier: 0.5, reliabilityDelta: 0 },
  { id: "forged", label: "Aluminum Spaceframe (Sport)", hpMultiplier: 1.0, weightMultiplier: 0.85, costMultiplier: 1.8, reliabilityDelta: 10 },
  { id: "billet", label: "Carbon Fiber Monocoque (Race)", hpMultiplier: 1.0, weightMultiplier: 0.60, costMultiplier: 3.5, reliabilityDelta: 15 },
  { id: "titanium", label: "Titanium Spec-R Tub (Hypercar)", hpMultiplier: 1.0, weightMultiplier: 0.50, costMultiplier: 5.0, reliabilityDelta: 20 },
];

const DEFAULT_SUSPENSION_VARIANTS: ComponentVariant[] = [
  { id: "cast", label: "MacPherson Strut (Street)", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 0.6, reliabilityDelta: 0 },
  { id: "forged", label: "Double Wishbone (Track)", hpMultiplier: 1.0, weightMultiplier: 0.88, costMultiplier: 1.5, reliabilityDelta: 8 },
  { id: "billet", label: "Multilink Active (Sport)", hpMultiplier: 1.0, weightMultiplier: 0.82, costMultiplier: 2.2, reliabilityDelta: 12 },
  { id: "titanium", label: "Pushrod Racing Spec (F1/GT3)", hpMultiplier: 1.0, weightMultiplier: 0.60, costMultiplier: 4.0, reliabilityDelta: 18 },
];

const DEFAULT_BRAKE_VARIANTS: ComponentVariant[] = [
  { id: "cast", label: "Cast Iron 330mm (OEM)", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 0.5, reliabilityDelta: 0 },
  { id: "forged", label: "Slotted Steel 380mm (Sport)", hpMultiplier: 1.0, weightMultiplier: 0.90, costMultiplier: 1.4, reliabilityDelta: 5 },
  { id: "billet", label: "Carbon Ceramic 400mm (Track)", hpMultiplier: 1.0, weightMultiplier: 0.65, costMultiplier: 3.5, reliabilityDelta: 15 },
  { id: "titanium", label: "Carbon-Carbon 420mm (F1)", hpMultiplier: 1.0, weightMultiplier: 0.50, costMultiplier: 5.0, reliabilityDelta: 20 },
];

const DEFAULT_TRANSMISSION_VARIANTS: ComponentVariant[] = [
  { id: "cast", label: "6-Speed Manual (Classic)", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 0.8, reliabilityDelta: 0 },
  { id: "forged", label: "7-Speed Dual-Clutch (DCT)", hpMultiplier: 1.15, weightMultiplier: 1.10, costMultiplier: 2.2, reliabilityDelta: 10 },
  { id: "billet", label: "8-Speed Sequential (GT3)", hpMultiplier: 1.25, weightMultiplier: 0.85, costMultiplier: 3.2, reliabilityDelta: 15 },
  { id: "titanium", label: "9-Speed Seamless Shift (Hypercar)", hpMultiplier: 1.35, weightMultiplier: 0.75, costMultiplier: 4.5, reliabilityDelta: 22 },
];

const DEFAULT_WHEEL_VARIANTS: ComponentVariant[] = [
  { id: "cast", label: "Cast Alloy 18\" (Street)", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 0.6, reliabilityDelta: 0 },
  { id: "forged", label: "Forged Monoblock 19\" (Sport)", hpMultiplier: 1.0, weightMultiplier: 0.82, costMultiplier: 1.8, reliabilityDelta: 10 },
  { id: "billet", label: "Magnesium Racing 19\" (Track)", hpMultiplier: 1.0, weightMultiplier: 0.68, costMultiplier: 3.2, reliabilityDelta: 14 },
  { id: "titanium", label: "Carbon Centerlock 20\" (Hypercar)", hpMultiplier: 1.0, weightMultiplier: 0.55, costMultiplier: 4.8, reliabilityDelta: 18 },
];

const DEFAULT_AERO_VARIANTS: ComponentVariant[] = [
  { id: "cast", label: "Base Body Aerodynamics", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 0.5, reliabilityDelta: 0 },
  { id: "forged", label: "Sport Aero (Front Splitter & Lip)", hpMultiplier: 1.0, weightMultiplier: 1.05, costMultiplier: 1.4, reliabilityDelta: 5 },
  { id: "billet", label: "Track Aero (GT Wing & Diffuser)", hpMultiplier: 1.0, weightMultiplier: 1.12, costMultiplier: 2.5, reliabilityDelta: 10 },
  { id: "titanium", label: "Ground Effect & Active DRS (Hypercar)", hpMultiplier: 1.0, weightMultiplier: 1.18, costMultiplier: 4.5, reliabilityDelta: 15 },
];

export const VEHICLE_ASSEMBLY_COMPONENTS: VehicleAssemblyComponentMeta[] = [
  {
    id: "chassis_frame",
    name: "Vehicle Chassis & Structural Tub",
    category: "Structure",
    description: "The primary load-bearing structural backbone housing safety crash zones, cockpit, and mounting hardpoints.",
    dependencies: [],
    explodedOffset: { x: 0, y: -80 },
    slotPosition: { x: 450, y: 220 },
    estimatedDuration: 1400,
    soundType: "heavy",
    variants: DEFAULT_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 650, reliability: 100, cost: 8500 },
    tooltipAdvice: "Steel Unibody = Low cost & easy repair. Carbon Tub = 40% Weight reduction & maximum torsional rigidity.",
    torqueSpec: { fastenerName: "Subframe ARP Structural Bolts", snugNm: 120, finalAngleDeg: 90, boltCount: 16 },
    clearanceSpec: { label: "Torsional Alignment Tolerance", targetMm: 0.05, minMm: 0.01, maxMm: 0.10 },
  },
  {
    id: "engine_bay",
    name: "Engine Placement & Subframe",
    category: "Powertrain",
    description: "Engine block assembly mounted to subframe rails at Front, Mid, or Rear chassis location.",
    dependencies: ["chassis_frame"],
    explodedOffset: { x: -100, y: -60 },
    slotPosition: { x: 240, y: 220 }, // Dynamic position based on enginePosition
    estimatedDuration: 1600,
    soundType: "heavy",
    variants: [
      { id: "cast", label: "Front Engine Placement (Nose Heavy)", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 1.0, reliabilityDelta: 0 },
      { id: "forged", label: "Mid Engine Placement (50/50 Balance)", hpMultiplier: 1.05, weightMultiplier: 0.95, costMultiplier: 1.6, reliabilityDelta: 8 },
      { id: "billet", label: "Rear Engine Placement (Rear Heavy Traction)", hpMultiplier: 1.08, weightMultiplier: 0.92, costMultiplier: 2.0, reliabilityDelta: 10 },
      { id: "titanium", label: "Mid-Ship Transverse Spec-R", hpMultiplier: 1.15, weightMultiplier: 0.85, costMultiplier: 3.5, reliabilityDelta: 15 },
    ],
    statDeltas: { hp: 150, torque: 180, weight: 220, reliability: 15, cost: 12000 },
    tooltipAdvice: "Front Engine = Predictable understeer. Mid Engine = Ideal polar inertia & turn-in agility. Rear Engine = Maximum launch traction.",
    torqueSpec: { fastenerName: "Hydro-Mount Engine Cradle Bolts", snugNm: 95, finalAngleDeg: 45, boltCount: 8 },
    clearanceSpec: { label: "Cradle Isolation Clearance", targetMm: 1.5, minMm: 1.0, maxMm: 2.0 },
  },
  {
    id: "transmission",
    name: "Transmission & Drivetrain Layout",
    category: "Powertrain",
    description: "Gearbox unit and driveshaft layout powering Front (FWD), Rear (RWD), or All (AWD) wheels.",
    dependencies: ["engine_bay"],
    explodedOffset: { x: 0, y: 80 },
    slotPosition: { x: 340, y: 260 },
    estimatedDuration: 1300,
    soundType: "metallic",
    variants: DEFAULT_TRANSMISSION_VARIANTS,
    statDeltas: { hp: 0, torque: 40, weight: 95, reliability: 10, cost: 5500 },
    tooltipAdvice: "FWD = High efficiency & light. RWD = Pure cornering balance & drift control. AWD = Superior all-weather launch traction.",
    torqueSpec: { fastenerName: "Bellhousing ARP Fasteners", snugNm: 85, finalAngleDeg: 60, boltCount: 10 },
    clearanceSpec: { label: "Input Shaft Backlash", targetMm: 0.12, minMm: 0.08, maxMm: 0.18 },
  },
  {
    id: "exhaust_system",
    name: "Exhaust System & Catalytic Converters",
    category: "Powertrain",
    description: "Mandrel-bent stainless or titanium exhaust piping, X-pipe, and high-flow mufflers.",
    dependencies: ["engine_bay"],
    explodedOffset: { x: 120, y: 60 },
    slotPosition: { x: 480, y: 310 },
    estimatedDuration: 1100,
    soundType: "spool",
    variants: [
      { id: "cast", label: "OEM Stainless Steel Dual Exit", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 1.0, reliabilityDelta: 0 },
      { id: "forged", label: "Inconel Heat-Resistant Track Pipe", hpMultiplier: 1.10, weightMultiplier: 0.75, costMultiplier: 2.0, reliabilityDelta: 10 },
      { id: "billet", label: "Titanium Straight Pipe (Valved)", hpMultiplier: 1.18, weightMultiplier: 0.50, costMultiplier: 3.2, reliabilityDelta: 12 },
      { id: "titanium", label: "Iconic F1 Inconel Spec-R", hpMultiplier: 1.25, weightMultiplier: 0.40, costMultiplier: 4.8, reliabilityDelta: 18 },
    ],
    statDeltas: { hp: 35, torque: 25, weight: 28, reliability: 5, cost: 2200 },
    tooltipAdvice: "Titanium saves up to 60% exhaust weight and delivers a high-pitched F1 acoustic note.",
    torqueSpec: { fastenerName: "Exhaust Manifold Flange Studs", snugNm: 45, finalAngleDeg: 30, boltCount: 12 },
    clearanceSpec: { label: "Heat Shield Thermal Clearance", targetMm: 12.0, minMm: 8.0, maxMm: 16.0 },
  },
  {
    id: "suspension_front",
    name: "Front Suspension Geometry",
    category: "Suspension & Handling",
    description: "Front wishbones, dampers, coilover springs, and anti-roll sway bar assembly.",
    dependencies: ["chassis_frame"],
    explodedOffset: { x: -140, y: -40 },
    slotPosition: { x: 230, y: 280 },
    estimatedDuration: 1250,
    soundType: "pneumatic",
    variants: DEFAULT_SUSPENSION_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 45, reliability: 8, cost: 3800 },
    tooltipAdvice: "Double wishbone geometry maintains ideal tire camber contact patch during heavy cornering roll.",
    torqueSpec: { fastenerName: "Control Arm Ball Joint Nuts", snugNm: 110, finalAngleDeg: 60, boltCount: 6 },
    clearanceSpec: { label: "Front Toe Alignment Clearance", targetMm: 0.5, minMm: 0.0, maxMm: 1.0 },
  },
  {
    id: "suspension_rear",
    name: "Rear Suspension Geometry",
    category: "Suspension & Handling",
    description: "Rear multilink/pushrod suspension, subframe tie rods, and adaptive dampers.",
    dependencies: ["chassis_frame"],
    explodedOffset: { x: 140, y: 40 },
    slotPosition: { x: 680, y: 280 },
    estimatedDuration: 1250,
    soundType: "pneumatic",
    variants: DEFAULT_SUSPENSION_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 48, reliability: 8, cost: 4200 },
    tooltipAdvice: "Multilink rear suspension enables precise toe control under aggressive throttle acceleration.",
    torqueSpec: { fastenerName: "Rear Subframe Lateral Arm Bolts", snugNm: 115, finalAngleDeg: 60, boltCount: 8 },
    clearanceSpec: { label: "Rear Camber Eccentric Bolt Range", targetMm: 2.0, minMm: 0.5, maxMm: 3.5 },
  },
  {
    id: "brakes",
    name: "High Performance Brake System",
    category: "Suspension & Handling",
    description: "Multi-piston monobloc brake calipers, vented rotors, and braided stainless lines.",
    dependencies: ["suspension_front", "suspension_rear"],
    explodedOffset: { x: 0, y: -100 },
    slotPosition: { x: 455, y: 280 },
    estimatedDuration: 1150,
    soundType: "click",
    variants: DEFAULT_BRAKE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 32, reliability: 12, cost: 4800 },
    tooltipAdvice: "Carbon Ceramic brakes eliminate brake fade under repeated 200km/h → 0 track deceleration.",
    torqueSpec: { fastenerName: "Caliper Mounting Radial Bolts", snugNm: 135, finalAngleDeg: 0, boltCount: 8 },
    clearanceSpec: { label: "Brake Pad Runout Clearance", targetMm: 0.08, minMm: 0.04, maxMm: 0.12 },
  },
  {
    id: "wheels_tires",
    name: "Wheels & Motorsport Tires",
    category: "Suspension & Handling",
    description: "Lightweight forged/carbon wheel rims wrapped in sticky high-grip compound tires.",
    dependencies: ["brakes"],
    explodedOffset: { x: -160, y: 80 },
    slotPosition: { x: 455, y: 280 },
    estimatedDuration: 1050,
    soundType: "pneumatic",
    variants: DEFAULT_WHEEL_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 68, reliability: 10, cost: 3600 },
    tooltipAdvice: "Reducing unsprung wheel mass improves damper response speed and turn-in sharpness.",
    torqueSpec: { fastenerName: "Centerlock Wheel Nut / Lug Bolts", snugNm: 550, finalAngleDeg: 0, boltCount: 4 },
    clearanceSpec: { label: "Fender Well Clearance", targetMm: 15.0, minMm: 10.0, maxMm: 25.0 },
  },
  {
    id: "aero_package",
    name: "Aerodynamic Body Package",
    category: "Exterior & Aero",
    description: "Carbon fiber front splitter, underbody Venturi floor, rear wing, and active DRS.",
    dependencies: ["chassis_frame"],
    explodedOffset: { x: 160, y: -80 },
    slotPosition: { x: 750, y: 160 },
    estimatedDuration: 1350,
    soundType: "slide",
    variants: DEFAULT_AERO_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 22, reliability: 5, cost: 6500 },
    tooltipAdvice: "High downforce increases cornering G-force at high speeds, but adds aerodynamic drag.",
    torqueSpec: { fastenerName: "Wing Pylon Chassis Mount Bolts", snugNm: 55, finalAngleDeg: 45, boltCount: 6 },
    clearanceSpec: { label: "Splitter Ground Clearance", targetMm: 65.0, minMm: 45.0, maxMm: 90.0 },
  },
  {
    id: "electronics_ecu",
    name: "Motorsport ECU & Telemetry Wiring",
    category: "Electronics",
    description: "Central engine control unit, ABS/TCS module, CAN-bus harness, and digital dashboard.",
    dependencies: ["engine_bay"],
    explodedOffset: { x: 60, y: -100 },
    slotPosition: { x: 380, y: 200 },
    estimatedDuration: 1000,
    soundType: "click",
    variants: [
      { id: "cast", label: "OEM Factory ECU (Standard)", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 1.0, reliabilityDelta: 0 },
      { id: "forged", label: "Sport Tuned ECU + Launch Control", hpMultiplier: 1.08, weightMultiplier: 0.95, costMultiplier: 1.8, reliabilityDelta: 5 },
      { id: "billet", label: "Motorsport Standalone ECU + Traction Map", hpMultiplier: 1.15, weightMultiplier: 0.85, costMultiplier: 3.0, reliabilityDelta: 12 },
      { id: "titanium", label: "Telemetry Suite + Active Torque Vectoring", hpMultiplier: 1.22, weightMultiplier: 0.70, costMultiplier: 4.8, reliabilityDelta: 18 },
    ],
    statDeltas: { hp: 20, torque: 25, weight: 12, reliability: 15, cost: 4200 },
    tooltipAdvice: "Standalone motorsport ECU enables multi-stage launch control and dynamic traction management.",
    torqueSpec: { fastenerName: "ECU Housing M6 Fasteners", snugNm: 15, finalAngleDeg: 0, boltCount: 4 },
    clearanceSpec: { label: "Wiring Harness Strain Relief", targetMm: 5.0, minMm: 2.0, maxMm: 8.0 },
  },
];

export function getVehicleAssemblyComponents(vehicleConfig?: Partial<VehicleConfig>): VehicleAssemblyComponentMeta[] {
  // All 10 vehicle subsystems are returned
  return VEHICLE_ASSEMBLY_COMPONENTS;
}
