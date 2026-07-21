// ===================================================================
// CHASSIS ENGINEERING CONSTANTS — Data tables for Phase 1 subsystems
// ===================================================================

import type {
  VehicleArchitecture, CrashStructureLevel, RackType, PowerAssistType,
  BrakeRotorMaterial, BrakePadCompound, WheelMaterial, TireConstruction,
} from "../types/chassis";

// ---------- Vehicle Architecture ----------

export const VEHICLE_ARCHITECTURES: Record<VehicleArchitecture, {
  label: string;
  description: string;
  weightLimit: number;       // kg base weight ceiling
  dragBase: number;          // base Cd
  cgHeightBase: number;      // mm base CG height
  passengerSpace: number;    // 0-1
  coolingBase: number;       // 0-1 cooling efficiency
  safetyBase: number;        // 0-1 structural safety
  marketSegment: string;
  wheelbaseRange: [number, number]; // [min, max] mm
  trackWidthRange: [number, number];
}> = {
  sedan:       { label: "Sedan",         description: "Four-door, three-box — balanced and practical",        weightLimit: 1800, dragBase: 0.30, cgHeightBase: 500, passengerSpace: 0.8,  coolingBase: 0.6, safetyBase: 0.8,  marketSegment: "mainstream",  wheelbaseRange: [2650, 3000], trackWidthRange: [1480, 1560] },
  hatchback:   { label: "Hatchback",     description: "Compact, cut-off tail — agile and light",              weightLimit: 1500, dragBase: 0.32, cgHeightBase: 510, passengerSpace: 0.7,  coolingBase: 0.55, safetyBase: 0.75, marketSegment: "economy",     wheelbaseRange: [2450, 2700], trackWidthRange: [1440, 1520] },
  coupe:       { label: "Coupé",         description: "Two-door, sloping roofline — sporty and sleek",        weightLimit: 1700, dragBase: 0.29, cgHeightBase: 470, passengerSpace: 0.5,  coolingBase: 0.65, safetyBase: 0.75, marketSegment: "sport",       wheelbaseRange: [2550, 2850], trackWidthRange: [1500, 1600] },
  convertible: { label: "Convertible",   description: "Folding top — open-air driving pleasure",              weightLimit: 1750, dragBase: 0.34, cgHeightBase: 480, passengerSpace: 0.4,  coolingBase: 0.6, safetyBase: 0.65, marketSegment: "luxury",      wheelbaseRange: [2450, 2750], trackWidthRange: [1480, 1580] },
  wagon:       { label: "Wagon / Estate", description: "Extended roof, long load floor — versatile",          weightLimit: 1900, dragBase: 0.31, cgHeightBase: 520, passengerSpace: 0.9,  coolingBase: 0.6, safetyBase: 0.8,  marketSegment: "mainstream",  wheelbaseRange: [2700, 3050], trackWidthRange: [1480, 1570] },
  suv:         { label: "SUV",           description: "Tall, high ground clearance — commanding presence",    weightLimit: 2500, dragBase: 0.38, cgHeightBase: 650, passengerSpace: 0.95, coolingBase: 0.7, safetyBase: 0.85, marketSegment: "mainstream",  wheelbaseRange: [2700, 3100], trackWidthRange: [1560, 1660] },
  crossover:   { label: "Crossover",     description: "Raised hatchback stance — practical and modern",       weightLimit: 2000, dragBase: 0.35, cgHeightBase: 580, passengerSpace: 0.85, coolingBase: 0.6, safetyBase: 0.8,  marketSegment: "mainstream",  wheelbaseRange: [2600, 2900], trackWidthRange: [1520, 1600] },
  pickup:      { label: "Pickup Truck",  description: "Cab plus open cargo bed — work and play",              weightLimit: 2800, dragBase: 0.42, cgHeightBase: 700, passengerSpace: 0.6,  coolingBase: 0.75, safetyBase: 0.7,  marketSegment: "utility",     wheelbaseRange: [2900, 3500], trackWidthRange: [1580, 1700] },
  roadster:    { label: "Roadster",      description: "Open two-seater — lightweight and pure",               weightLimit: 1400, dragBase: 0.33, cgHeightBase: 440, passengerSpace: 0.2,  coolingBase: 0.55, safetyBase: 0.6,  marketSegment: "sport",       wheelbaseRange: [2300, 2600], trackWidthRange: [1460, 1560] },
  van:         { label: "Van",           description: "Box-shaped, maximum cargo volume",                     weightLimit: 3000, dragBase: 0.45, cgHeightBase: 750, passengerSpace: 1.0,  coolingBase: 0.65, safetyBase: 0.7,  marketSegment: "utility",     wheelbaseRange: [2900, 3600], trackWidthRange: [1550, 1650] },
  hypercar:    { label: "Hypercar",      description: "Ultra-high performance — the ultimate machine",        weightLimit: 1600, dragBase: 0.32, cgHeightBase: 380, passengerSpace: 0.2,  coolingBase: 0.85, safetyBase: 0.9,  marketSegment: "ultra_luxury", wheelbaseRange: [2600, 2800], trackWidthRange: [1600, 1700] },
  formula:     { label: "Formula Car",   description: "Open-wheel, single-seat — pure downforce",             weightLimit: 900,  dragBase: 0.85, cgHeightBase: 300, passengerSpace: 0.0,  coolingBase: 0.95, safetyBase: 0.95, marketSegment: "motorsport",  wheelbaseRange: [3000, 3600], trackWidthRange: [1700, 2000] },
  rally:       { label: "Rally Car",     description: "Ruggedized for off-road stages and jumps",             weightLimit: 1300, dragBase: 0.38, cgHeightBase: 520, passengerSpace: 0.2,  coolingBase: 0.8, safetyBase: 0.9,  marketSegment: "motorsport",  wheelbaseRange: [2500, 2650], trackWidthRange: [1550, 1620] },
  gt:          { label: "GT Race Car",   description: "Closed-cockpit endurance racer — speed and durability", weightLimit: 1350, dragBase: 0.35, cgHeightBase: 420, passengerSpace: 0.1,  coolingBase: 0.9, safetyBase: 0.9,  marketSegment: "motorsport",  wheelbaseRange: [2600, 2750], trackWidthRange: [1600, 1680] },
  lmp:         { label: "Le Mans Prototype", description: "Closed-cockpit prototype — extreme downforce",     weightLimit: 1000, dragBase: 0.30, cgHeightBase: 320, passengerSpace: 0.0,  coolingBase: 0.95, safetyBase: 0.95, marketSegment: "motorsport",  wheelbaseRange: [2800, 3100], trackWidthRange: [1500, 1600] },
};

// ---------- Crash Structures ----------

export const CRASH_STRUCTURES: Record<CrashStructureLevel, {
  label: string;
  safetyFactor: number;      // 0-1 (contributes to crash safety)
  weightPenalty: number;     // kg added
  costFactor: number;
}> = {
  basic:      { label: "Basic",        safetyFactor: 0.5,  weightPenalty: 0,   costFactor: 1.0 },
  reinforced: { label: "Reinforced",   safetyFactor: 0.7,  weightPenalty: 25,  costFactor: 1.4 },
  advanced:   { label: "Advanced",     safetyFactor: 0.85, weightPenalty: 40,  costFactor: 2.2 },
  motorsport: { label: "Motorsport",   safetyFactor: 0.95, weightPenalty: 15,  costFactor: 4.0 },
};

// ---------- Steering Systems ----------

export const RACK_TYPES: Record<RackType, {
  label: string;
  feelFactor: number;        // 0-1 (steering feel quality)
  weightDelta: number;       // kg vs baseline
  costFactor: number;
  precisionFactor: number;   // 0-1
}> = {
  rack_pinion:        { label: "Rack & Pinion",       feelFactor: 0.8,  weightDelta: 0,   costFactor: 1.0, precisionFactor: 0.85 },
  recirculating_ball: { label: "Recirculating Ball",   feelFactor: 0.5,  weightDelta: 5,   costFactor: 0.7, precisionFactor: 0.6 },
  electric_rack:      { label: "Electric Power Rack",  feelFactor: 0.7,  weightDelta: -3,  costFactor: 1.6, precisionFactor: 0.9 },
};

export const POWER_ASSIST_TYPES: Record<PowerAssistType, {
  label: string;
  effortReduction: number;   // 0-1 (how much lighter the steering becomes)
  feelPenalty: number;       // 0-1 (less feel = higher)
  weightDelta: number;       // kg
  costFactor: number;
  powerDraw: number;         // W parasitic
}> = {
  none:                { label: "Unassisted",          effortReduction: 0,    feelPenalty: 0,    weightDelta: 0,   costFactor: 1.0, powerDraw: 0 },
  hydraulic:           { label: "Hydraulic",           effortReduction: 0.6,  feelPenalty: 0.15, weightDelta: 8,   costFactor: 1.3, powerDraw: 150 },
  electric:            { label: "Electric (EPAS)",     effortReduction: 0.7,  feelPenalty: 0.25, weightDelta: 3,   costFactor: 1.8, powerDraw: 80 },
  electro_hydraulic:   { label: "Electro-Hydraulic",   effortReduction: 0.65, feelPenalty: 0.1,  weightDelta: 6,   costFactor: 2.2, powerDraw: 120 },
};

// ---------- Brake Engineering ----------

export const BRAKE_ROTOR_MATERIALS: Record<BrakeRotorMaterial, {
  label: string;
  frictionCoeff: number;     // base μ
  fadeResistance: number;    // 0-1 (higher = resists fade better)
  maxTemp: number;           // °C before failure
  weightFactor: number;      // relative to cast iron
  costFactor: number;
  wearRate: number;          // 0-1 (higher = faster wear)
}> = {
  cast_iron:       { label: "Cast Iron",       frictionCoeff: 0.35, fadeResistance: 0.5,  maxTemp: 600,  weightFactor: 1.0,  costFactor: 1.0, wearRate: 0.5 },
  steel:           { label: "Steel",           frictionCoeff: 0.32, fadeResistance: 0.55, maxTemp: 650,  weightFactor: 0.95, costFactor: 1.3, wearRate: 0.6 },
  carbon_ceramic:  { label: "Carbon Ceramic",  frictionCoeff: 0.42, fadeResistance: 0.95, maxTemp: 1200, weightFactor: 0.45, costFactor: 8.0, wearRate: 0.2 },
  tungsten_carbide:{ label: "Tungsten Carbide",frictionCoeff: 0.38, fadeResistance: 0.8,  maxTemp: 900,  weightFactor: 0.7,  costFactor: 4.5, wearRate: 0.35 },
};

export const BRAKE_PAD_COMPOUNDS: Record<BrakePadCompound, {
  label: string;
  biteFactor: number;        // initial bite (0-1)
  fadeFactor: number;        // fade resistance multiplier
  wearRate: number;          // 0-1 (higher = faster wear)
  noiseLevel: number;        // 0-1 (higher = noisier)
  dustLevel: number;         // 0-1 (higher = more dust)
  coldPerformance: number;   // 0-1 (performance when cold)
  costFactor: number;
}> = {
  street:    { label: "Street",    biteFactor: 0.6,  fadeFactor: 0.5,  wearRate: 0.3,  noiseLevel: 0.1, dustLevel: 0.2,  coldPerformance: 0.9, costFactor: 1.0 },
  sport:     { label: "Sport",     biteFactor: 0.75, fadeFactor: 0.7,  wearRate: 0.5,  noiseLevel: 0.3, dustLevel: 0.4,  coldPerformance: 0.7, costFactor: 2.0 },
  race:      { label: "Race",      biteFactor: 0.9,  fadeFactor: 0.9,  wearRate: 0.8,  noiseLevel: 0.7, dustLevel: 0.7,  coldPerformance: 0.3, costFactor: 4.0 },
  endurance: { label: "Endurance", biteFactor: 0.8,  fadeFactor: 0.85, wearRate: 0.4,  noiseLevel: 0.5, dustLevel: 0.5,  coldPerformance: 0.5, costFactor: 3.5 },
};

export const CALIPER_PISTONS: { value: number; label: string; forceFactor: number; weight: number; cost: number }[] = [
  { value: 1, label: "1-Piston (Sliding)",    forceFactor: 0.6,  weight: 2.0,  cost: 120 },
  { value: 2, label: "2-Piston (Fixed)",       forceFactor: 0.75, weight: 3.0,  cost: 350 },
  { value: 4, label: "4-Piston (Monoblock)",   forceFactor: 0.9,  weight: 4.5,  cost: 800 },
  { value: 6, label: "6-Piston (Performance)", forceFactor: 1.0,  weight: 6.0,  cost: 1800 },
  { value: 8, label: "8-Piston (Racing)",      forceFactor: 1.05, weight: 7.5,  cost: 3500 },
];

// ---------- Wheel Materials ----------

export const WHEEL_MATERIALS: Record<WheelMaterial, {
  label: string;
  weightPerInchSq: number;   // kg per (diameter_inch × width_inch) — approximate scale
  costFactor: number;
  strengthFactor: number;    // 0-1
  description: string;
}> = {
  steel:        { label: "Steel",          weightPerInchSq: 0.12, costFactor: 0.5, strengthFactor: 0.7,  description: "Heavy, cheap, durable" },
  cast_alloy:   { label: "Cast Alloy",     weightPerInchSq: 0.09, costFactor: 1.0, strengthFactor: 0.75, description: "Standard alloy — balanced" },
  forged_alloy: { label: "Forged Alloy",   weightPerInchSq: 0.07, costFactor: 2.5, strengthFactor: 0.9,  description: "Lightweight, strong" },
  magnesium:    { label: "Magnesium",      weightPerInchSq: 0.055, costFactor: 4.0, strengthFactor: 0.8, description: "Ultra-light, corrosion risk" },
  carbon_fiber: { label: "Carbon Fiber",   weightPerInchSq: 0.04, costFactor: 8.0, strengthFactor: 0.95, description: "Extreme weight savings" },
};

// ---------- Tire Construction ----------

export const TIRE_CONSTRUCTIONS: Record<TireConstruction, {
  label: string;
  gripFactor: number;        // multiplier on compound grip
  sidewallFlex: number;      // 0-1 (higher = more flex)
  comfortFactor: number;     // 0-1
  costFactor: number;
  description: string;
}> = {
  radial: { label: "Radial",  gripFactor: 1.0,  sidewallFlex: 0.5,  comfortFactor: 0.8, costFactor: 1.0, description: "Modern standard — flexible sidewall, excellent grip" },
  bias:   { label: "Bias-Ply", gripFactor: 0.85, sidewallFlex: 0.3,  comfortFactor: 0.5, costFactor: 0.6, description: "Stiffer sidewall — vintage or off-road" },
};

// ---------- Default Configs ----------

export function defaultChassisEngineering(): import("../types/chassis").ChassisEngineeringConfig {
  return {
    architecture: "coupe",
    chassisType: "carbon_tub",
    wheelbase: 2650,
    trackWidthFront: 1580,
    trackWidthRear: 1600,
    frontOverhang: 900,
    rearOverhang: 700,
    cgHeight: 450,
    weightDistribution: 0.48,
    chassisRigidity: 28,
    crashStructure: "advanced",
  };
}

export function defaultSuspensionGeometry(): import("../types/chassis").SuspensionGeometryConfig {
  return {
    typeFront: "double_wishbone",
    typeRear: "double_wishbone",
    camberFront: -2.0,
    casterFront: 6.0,
    toeFront: 0,
    camberRear: -2.5,
    toeRear: 0.1,
    rollCenterFront: 50,
    rollCenterRear: 80,
    antiDive: 25,
    antiSquat: 20,
    springRateFront: 120,
    springRateRear: 140,
    damperFront: 0.5,
    damperRear: 0.5,
    antiRollBarFront: 0.5,
    antiRollBarRear: 0.5,
    rideHeight: 120,
  };
}

export function defaultSteering(): import("../types/chassis").SteeringConfig {
  return {
    steeringRatio: 14,
    rackType: "rack_pinion",
    powerAssist: "electric",
    rearWheelSteering: false,
    rearSteerAngle: 0,
    variableRatio: false,
  };
}

export function defaultBrakes(): import("../types/chassis").BrakeConfig {
  return {
    frontRotorDiameter: 380,
    frontRotorThickness: 32,
    frontRotorMaterial: "cast_iron",
    frontCaliperPistons: 4,
    rearRotorDiameter: 340,
    rearRotorThickness: 24,
    rearRotorMaterial: "cast_iron",
    rearCaliperPistons: 2,
    padCompound: "sport",
    brakeDucts: false,
    brakeBias: 0.6,
  };
}

export function defaultTires(): import("../types/chassis").TireEngineeringConfig {
  return {
    frontWidth: 245,
    frontAspectRatio: 35,
    frontDiameter: 19,
    frontCompound: "medium",
    frontPressure: 2.2,
    rearWidth: 305,
    rearAspectRatio: 30,
    rearDiameter: 20,
    rearCompound: "medium",
    rearPressure: 2.0,
    construction: "radial",
  };
}

export function defaultWheels(): import("../types/chassis").WheelEngineeringConfig {
  return {
    frontMaterial: "forged_alloy",
    frontDiameter: 19,
    frontWidth: 9.5,
    frontOffset: 35,
    rearMaterial: "forged_alloy",
    rearDiameter: 20,
    rearWidth: 11,
    rearOffset: 40,
  };
}
