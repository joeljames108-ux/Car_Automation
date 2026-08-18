// ===================================================================
// PLATFORM & CHASSIS CONSTANTS — Modularized Platform Data Tables
// ===================================================================

import type {
  PlatformType, ChassisType, DriveType, EnginePosition,
  SuspensionType, BrakeType, TransmissionType, TireCompound,
} from "../types";

export const PLATFORMS: Record<PlatformType, {
  label: string;
  weightBase: number;
  dragBase: number;
  liftBase: number;
  frontalAreaBase: number;
  costFactor: number;
  wheelbaseBase: number;   // mm
  trackWidthBase: number;  // mm
}> = {
  budget_economy: { label: "Budget / Economy", weightBase: 950, dragBase: 0.32, liftBase: 0.08, frontalAreaBase: 1.9, costFactor: 0.18, wheelbaseBase: 2400, trackWidthBase: 1450 },
  lower_mid: { label: "Lower Mid-Range", weightBase: 1100, dragBase: 0.30, liftBase: 0.05, frontalAreaBase: 1.95, costFactor: 0.28, wheelbaseBase: 2550, trackWidthBase: 1480 },
  upper_mid: { label: "Upper Mid-Range", weightBase: 1300, dragBase: 0.28, liftBase: 0.03, frontalAreaBase: 2.1, costFactor: 0.42, wheelbaseBase: 2700, trackWidthBase: 1540 },
  premium: { label: "Premium Tier", weightBase: 1500, dragBase: 0.27, liftBase: 0.02, frontalAreaBase: 2.2, costFactor: 0.65, wheelbaseBase: 2850, trackWidthBase: 1580 },
  luxury: { label: "Luxury Tier", weightBase: 1850, dragBase: 0.26, liftBase: 0.0, frontalAreaBase: 2.3, costFactor: 1.1, wheelbaseBase: 3000, trackWidthBase: 1620 },
  ultra_luxury: { label: "Ultra Luxury", weightBase: 2250, dragBase: 0.28, liftBase: 0.0, frontalAreaBase: 2.4, costFactor: 2.2, wheelbaseBase: 3300, trackWidthBase: 1660 },
  exotic: { label: "Exotic GT / Sports", weightBase: 1420, dragBase: 0.31, liftBase: -0.05, frontalAreaBase: 2.05, costFactor: 1.8, wheelbaseBase: 2680, trackWidthBase: 1610 },
  supercar: { label: "Supercar", weightBase: 1380, dragBase: 0.33, liftBase: -0.15, frontalAreaBase: 2.0, costFactor: 2.8, wheelbaseBase: 2650, trackWidthBase: 1640 },
  hypercar: { label: "Hypercar", weightBase: 1250, dragBase: 0.32, liftBase: -0.3, frontalAreaBase: 1.95, costFactor: 5.2, wheelbaseBase: 2700, trackWidthBase: 1650 },
  commercial_fleet: { label: "Commercial / Heavy Fleet", weightBase: 1950, dragBase: 0.42, liftBase: 0.1, frontalAreaBase: 2.8, costFactor: 0.45, wheelbaseBase: 3100, trackWidthBase: 1680 },
  motorsport: { label: "Pure Racing Chassis", weightBase: 1050, dragBase: 0.36, liftBase: -0.5, frontalAreaBase: 1.85, costFactor: 3.5, wheelbaseBase: 2600, trackWidthBase: 1620 },
  economy_hatch: { label: "Economy Hatchback", weightBase: 950, dragBase: 0.32, liftBase: 0.08, frontalAreaBase: 1.9, costFactor: 0.20, wheelbaseBase: 2420, trackWidthBase: 1450 },
  economy_compact: { label: "Economy Compact Sedan", weightBase: 1050, dragBase: 0.30, liftBase: 0.05, frontalAreaBase: 1.95, costFactor: 0.25, wheelbaseBase: 2520, trackWidthBase: 1470 },
  compact_family: { label: "Compact Family Car", weightBase: 1120, dragBase: 0.29, liftBase: 0.04, frontalAreaBase: 2.0, costFactor: 0.32, wheelbaseBase: 2650, trackWidthBase: 1520 },
  midsize_sedan: { label: "Midsize Family Sedan", weightBase: 1280, dragBase: 0.28, liftBase: 0.03, frontalAreaBase: 2.15, costFactor: 0.40, wheelbaseBase: 2780, trackWidthBase: 1560 },
  street_sport: { label: "Street Sport", weightBase: 1350, dragBase: 0.34, liftBase: 0.05, frontalAreaBase: 2.1, costFactor: 1.0, wheelbaseBase: 2600, trackWidthBase: 1550 },
  gt: { label: "GT Race Car", weightBase: 1250, dragBase: 0.35, liftBase: -0.3, frontalAreaBase: 2.0, costFactor: 3.0, wheelbaseBase: 2600, trackWidthBase: 1620 },
  prototype: { label: "LMP Prototype", weightBase: 950, dragBase: 0.30, liftBase: -0.5, frontalAreaBase: 1.8, costFactor: 8.0, wheelbaseBase: 2800, trackWidthBase: 1500 },
  rally: { label: "Rally Car", weightBase: 1200, dragBase: 0.38, liftBase: 0.1, frontalAreaBase: 2.0, costFactor: 2.0, wheelbaseBase: 2550, trackWidthBase: 1580 },
};

export const DRIVE_TYPES: Record<DriveType, {
  label: string;
  shortLabel: string;
  efficiency: number;
  weightDelta: number;
  costDelta: number;
  launchTractionMultiplier: number;
  cornerExitTraction: number;
  understeerBias: number;
  description: string;
}> = {
  fwd: {
    label: "Front-Wheel Drive (FWD)",
    shortLabel: "FWD",
    efficiency: 0.89,
    weightDelta: -30,
    costDelta: -600,
    launchTractionMultiplier: 0.82,
    cornerExitTraction: 0.88,
    understeerBias: 0.45,
    description: "Engine powers front wheels. Lightest and most cost-effective layout, but limited by front weight transfer during launch and power understeer.",
  },
  rwd: {
    label: "Rear-Wheel Drive (RWD)",
    shortLabel: "RWD",
    efficiency: 0.85,
    weightDelta: 0,
    costDelta: 0,
    launchTractionMultiplier: 1.05,
    cornerExitTraction: 1.02,
    understeerBias: -0.20,
    description: "Engine powers rear wheels. Uncorrupted steering feel, excellent weight transfer on launch, and natural power-oversteer characteristics.",
  },
  awd: {
    label: "All-Wheel Drive (AWD)",
    shortLabel: "AWD",
    efficiency: 0.81,
    weightDelta: 75,
    costDelta: 2200,
    launchTractionMultiplier: 1.45,
    cornerExitTraction: 1.25,
    understeerBias: 0.10,
    description: "Power distributed to all 4 wheels. Unbeatable launch and bad-weather traction at the expense of added weight, cost, and mechanical drag.",
  },
};

export const ENGINE_POSITIONS: Record<EnginePosition, {
  label: string;
  shortLabel: string;
  weightDistFront: number;
  polarInertiaFactor: number;
  costDelta: number;
  weightDelta: number;
  brakingBiasOptimal: number;
  description: string;
}> = {
  front: {
    label: "Front-Mounted Engine",
    shortLabel: "Front-Engine",
    weightDistFront: 0.58,
    polarInertiaFactor: 1.12,
    costDelta: 0,
    weightDelta: 0,
    brakingBiasOptimal: 0.64,
    description: "Engine mounted over or ahead of front axle. Predictable understeer-biased handling, large cabin space, but nose-heavy under hard braking.",
  },
  mid: {
    label: "Mid-Engine Layout",
    shortLabel: "Mid-Engine",
    weightDistFront: 0.44,
    polarInertiaFactor: 0.88,
    costDelta: 1500,
    weightDelta: 15,
    brakingBiasOptimal: 0.56,
    description: "Engine mounted between axles behind cabin. Centralized mass provides ultra-fast turn-in, near-ideal 44/56 weight balance, and high cornering speeds.",
  },
  rear: {
    label: "Rear Engine Layout",
    shortLabel: "Rear-Engine",
    weightDistFront: 0.38,
    polarInertiaFactor: 1.25,
    costDelta: 1200,
    weightDelta: 25,
    brakingBiasOptimal: 0.52,
    description: "Engine mounted behind rear axle. Tremendous rear acceleration traction and light steering, but high pendulum effect risking lift-off oversteer.",
  },
};

export const CHASSIS_TYPES: Record<ChassisType, {
  label: string;
  weightFactor: number;
  rigidityFactor: number;
  safetyFactor: number;
  costFactor: number;
}> = {
  steel_ladder: { label: "Steel Ladder Frame", weightFactor: 1.45, rigidityFactor: 0.55, safetyFactor: 0.65, costFactor: 0.35 },
  pressed_steel: { label: "Pressed Steel Spaceframe", weightFactor: 1.35, rigidityFactor: 0.60, safetyFactor: 0.68, costFactor: 0.40 },
  tube_frame: { label: "Tube Frame", weightFactor: 1.1, rigidityFactor: 0.7, safetyFactor: 0.75, costFactor: 0.8 },
  monocoque: { label: "Aluminum Monocoque", weightFactor: 1.0, rigidityFactor: 0.8, safetyFactor: 0.85, costFactor: 1.2 },
  carbon_tub: { label: "Carbon Fiber Tub", weightFactor: 0.6, rigidityFactor: 1.0, safetyFactor: 0.95, costFactor: 3.5 },
  aluminum_spaceframe: { label: "Al Spaceframe", weightFactor: 0.85, rigidityFactor: 0.85, safetyFactor: 0.8, costFactor: 1.8 },
  steel_unibody: { label: "Steel Unibody", weightFactor: 1.3, rigidityFactor: 0.65, safetyFactor: 0.7, costFactor: 0.5 },
};

export const SUSPENSION_TYPES: Record<SuspensionType, {
  label: string;
  gripFactor: number;
  weightFactor: number;
  costFactor: number;
  adjustability: number;
}> = {
  torsion_beam: { label: "Torsion Beam Rear Axle", gripFactor: 0.78, weightFactor: 0.65, costFactor: 0.35, adjustability: 0.2 },
  leaf_spring: { label: "Leaf Spring Rear Axle", gripFactor: 0.72, weightFactor: 0.70, costFactor: 0.28, adjustability: 0.1 },
  macpherson: { label: "MacPherson", gripFactor: 0.82, weightFactor: 0.8, costFactor: 0.6, adjustability: 0.4 },
  double_wishbone: { label: "Double Wishbone", gripFactor: 0.92, weightFactor: 1.0, costFactor: 1.0, adjustability: 0.8 },
  multilink: { label: "Multilink", gripFactor: 0.95, weightFactor: 1.1, costFactor: 1.3, adjustability: 0.9 },
  torsion_bar: { label: "Torsion Bar", gripFactor: 0.85, weightFactor: 0.7, costFactor: 0.7, adjustability: 0.5 },
  pushrod: { label: "Pushrod", gripFactor: 0.98, weightFactor: 0.6, costFactor: 2.5, adjustability: 1.0 },
  pullrod: { label: "Pullrod", gripFactor: 0.97, weightFactor: 0.55, costFactor: 2.8, adjustability: 1.0 },
};

export const BRAKE_TYPES: Record<BrakeType, {
  label: string;
  stoppingPower: number; // multiplier
  fadeResistance: number;// 0-1 (higher resists track fade)
  weightFactor: number;  // vs standard
  costFactor: number;
  description: string;
}> = {
  drum: { label: "Drum Brakes", stoppingPower: 0.75, fadeResistance: 0.3, weightFactor: 0.85, costFactor: 0.2, description: "Enclosed drum & shoe system — ultra low cost, high heat fade" },
  solid_disc: { label: "Solid Steel Discs", stoppingPower: 0.88, fadeResistance: 0.4, weightFactor: 0.90, costFactor: 0.35, description: "Non-vented solid steel discs — affordable city commuter braking" },
  cast_iron: { label: "Cast Iron Discs", stoppingPower: 1.0, fadeResistance: 0.5, weightFactor: 1.0, costFactor: 0.5, description: "Standard heavy iron discs — budget friendly, prone to fade" },
  slotted_steel: { label: "Slotted Steel Discs", stoppingPower: 1.15, fadeResistance: 0.7, weightFactor: 0.95, costFactor: 0.9, description: "Slotted grooves clear gas & debris — strong street/track balance" },
  carbon_ceramic: { label: "Carbon Ceramic Discs", stoppingPower: 1.35, fadeResistance: 0.95, weightFactor: 0.65, costFactor: 3.5, description: "Ultra-lightweight ceramic composite — virtually immune to heat fade" },
  carbon_carbon: { label: "Carbon-Carbon (F1/WEC)", stoppingPower: 1.50, fadeResistance: 0.99, weightFactor: 0.50, costFactor: 5.0, description: "Pure racing carbon — extreme stopping power at peak track temps (>400°C)" },
  regenerative_hybrid: { label: "Regen Brake-by-Wire", stoppingPower: 1.25, fadeResistance: 0.85, weightFactor: 0.80, costFactor: 2.8, description: "Harvests kinetic braking energy to recharge hybrid battery" },
};

export const TRANSMISSION_TYPES: Record<TransmissionType, {
  label: string;
  shiftTime: number;     // seconds
  efficiency: number;    // 0-1
  weightFactor: number;
  costFactor: number;
  gearCount: number;
  description: string;
}> = {
  manual_5: { label: "5-Speed Manual", shiftTime: 0.50, efficiency: 0.92, weightFactor: 1.00, costFactor: 0.6, gearCount: 5, description: "Classic H-pattern manual — cheap, engaging, high shift delay" },
  manual_6: { label: "6-Speed Manual", shiftTime: 0.40, efficiency: 0.93, weightFactor: 1.05, costFactor: 0.8, gearCount: 6, description: "Standard 6-speed manual — versatile gear spread" },
  manual_7: { label: "7-Speed Manual", shiftTime: 0.38, efficiency: 0.94, weightFactor: 1.10, costFactor: 1.2, gearCount: 7, description: "High-gear manual with highway overdrive ratio" },
  seq_6: { label: "6-Speed Sequential", shiftTime: 0.08, efficiency: 0.95, weightFactor: 0.90, costFactor: 2.0, gearCount: 6, description: "Dog-engagement racing box — lightning fast push/pull shifts" },
  seq_7: { label: "7-Speed Sequential", shiftTime: 0.06, efficiency: 0.96, weightFactor: 0.85, costFactor: 2.5, gearCount: 7, description: "Ultra-lightweight GT3/WEC racing transmission" },
  seq_8: { label: "8-Speed Sequential", shiftTime: 0.05, efficiency: 0.97, weightFactor: 0.82, costFactor: 3.2, gearCount: 8, description: "Top-tier Formula 1 specification sequential box" },
  dct_7: { label: "7-Speed Dual-Clutch", shiftTime: 0.05, efficiency: 0.97, weightFactor: 1.10, costFactor: 2.2, gearCount: 7, description: "Pre-selected dual clutch — seamless power delivery" },
  dct_8: { label: "8-Speed Dual-Clutch", shiftTime: 0.04, efficiency: 0.98, weightFactor: 1.15, costFactor: 2.8, gearCount: 8, description: "Supercar-grade 8-speed dual clutch — near zero torque disruption" },
  dct_9: { label: "9-Speed Speedshift DCT", shiftTime: 0.03, efficiency: 0.985, weightFactor: 1.20, costFactor: 3.6, gearCount: 9, description: "Hypercar 9-speed transmission for max acceleration & top speed" },
  dog_leg: { label: "Dog-Leg 5-Speed Race", shiftTime: 0.25, efficiency: 0.96, weightFactor: 0.92, costFactor: 1.5, gearCount: 5, description: "1st gear down-and-left for faster 2nd-3rd cornering shifts" },
  cvt: { label: "CVT (Stepless)", shiftTime: 0.00, efficiency: 0.90, weightFactor: 1.00, costFactor: 1.5, gearCount: 1, description: "Continuously variable ratios — keeps engine at peak power RPM" },
  single_speed: { label: "Single Speed Direct", shiftTime: 0.00, efficiency: 0.97, weightFactor: 0.60, costFactor: 1.0, gearCount: 1, description: "Direct drive motor reduction gear for electric vehicles" },
};

export const TIRE_COMPOUNDS: Record<TireCompound, {
  label: string;
  gripFactor: number;
  wearFactor: number;
  tempRange: [number, number]; // optimal temp range °C
  peakTemp: number;
  tempSensitivity: number; // 0-1, higher = narrower window
  wetGripFactor: number;
  rollingResistance: number;
  costFactor: number;
}> = {
  hard: { label: "Hard", gripFactor: 0.88, wearFactor: 0.5, tempRange: [90, 120], peakTemp: 105, tempSensitivity: 0.6, wetGripFactor: 0.8, rollingResistance: 0.9, costFactor: 0.8 },
  medium: { label: "Medium", gripFactor: 0.93, wearFactor: 0.7, tempRange: [85, 115], peakTemp: 100, tempSensitivity: 0.7, wetGripFactor: 0.75, rollingResistance: 1.0, costFactor: 1.0 },
  soft: { label: "Soft", gripFactor: 0.97, wearFactor: 1.0, tempRange: [80, 110], peakTemp: 95, tempSensitivity: 0.8, wetGripFactor: 0.7, rollingResistance: 1.1, costFactor: 1.3 },
  supersoft: { label: "Supersoft", gripFactor: 1.0, wearFactor: 1.5, tempRange: [75, 105], peakTemp: 90, tempSensitivity: 0.9, wetGripFactor: 0.65, rollingResistance: 1.2, costFactor: 1.6 },
  slick: { label: "Slick", gripFactor: 1.05, wearFactor: 1.3, tempRange: [80, 110], peakTemp: 95, tempSensitivity: 0.85, wetGripFactor: 0.3, rollingResistance: 1.0, costFactor: 2.0 },
  wet: { label: "Wet", gripFactor: 0.75, wearFactor: 0.3, tempRange: [40, 80], peakTemp: 60, tempSensitivity: 0.5, wetGripFactor: 1.0, rollingResistance: 1.3, costFactor: 1.8 },
  intermediate: { label: "Intermediate", gripFactor: 0.85, wearFactor: 0.5, tempRange: [55, 90], peakTemp: 72, tempSensitivity: 0.6, wetGripFactor: 0.9, rollingResistance: 1.1, costFactor: 1.5 },
};
