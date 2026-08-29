import type {
  EngineLayout, CrankMaterial, PistonType, ValvetrainType, IntakeType, FuelSystemType,
  PlatformType, ChassisType, SuspensionType, TransmissionType, BrakeType, TireCompound, EnginePosition, DriveType,
  TrackId, DriverSkill, WeatherType, InteriorConfig, TrackInfo,
  EngineConfig, AeroConfig, VehicleConfig, VehicleDesign,
  FrameMaterial, ManufacturingProcess, FactoryTier, AutomationLevel, QcLevel, ManufacturingConfig,
  BodyType, RimDesign, RimFinish, PaintFinish, HeadlightType, TaillightType,
  BodyKit, SpoilerType, RoofScoopType, ExteriorConfig,
  FrontBumperShape, UnderbodyFloorType, WheelAeroType, MirrorAeroType, CfdQuality, AeroMode,
  AeroResearchConfig,
  InfoDisplayConfig, InfoDisplayTech, InfoOsTier, InfoVoiceLevel, InfoAssistantPersonality,
  InfoNavTier, InfoConnectivityTier, InfotainmentConfig,
} from "./types";
import {
  defaultChassisEngineering, defaultSuspensionGeometry, defaultSteering,
  defaultBrakes, defaultTires, defaultWheels,
} from "./constants/chassisConstants";

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ---------- Engine constants (Modularized) ----------
export * from "./constants/engineConstants";

// ── 21 COMPREHENSIVE HYBRID & EV SUBSYSTEMS DICTIONARIES ──
export const POWER_ELECTRONICS_TYPES = {
  standard_igbt: { label: "Standard Silicon IGBT Inverter (400V)", efficiency: 0.92, heatLossKw: 4.2, costFactor: 1.0 },
  silicon_carbide_sic: { label: "Silicon Carbide (SiC) Inverter (800V)", efficiency: 0.98, heatLossKw: 1.1, costFactor: 2.2 },
  gallium_nitride_gan: { label: "Gallium Nitride (GaN) Electronics (900V)", efficiency: 0.99, heatLossKw: 0.6, costFactor: 3.5 },
} as const;

export const HYBRID_TRANSMISSION_TYPES = {
  ecvt: { label: "eCVT Power-Split Device", efficiency: 0.93, costFactor: 1.2 },
  power_split_planetary: { label: "Planetary Gear Set Power Split", efficiency: 0.94, costFactor: 1.3 },
  dct_hybrid: { label: "Dual-Clutch Hybrid Transmission", efficiency: 0.96, costFactor: 1.8 },
  amt_hybrid: { label: "Automated Manual Hybrid Transmission", efficiency: 0.91, costFactor: 1.1 },
  single_speed_reduction: { label: "Single-Speed Direct Reduction Gear", efficiency: 0.98, costFactor: 0.8 },
  multispeed_hybrid: { label: "Multi-Speed Hybrid Transmission", efficiency: 0.97, costFactor: 2.4 },
} as const;

export const REGEN_BRAKING_TYPES = {
  brake_by_wire: { label: "Brake-by-Wire Electro-Hydraulic", regenEfficiency: 0.88, pedalFeel: "Linear" },
  brake_blending: { label: "Active Brake Blending Controller", regenEfficiency: 0.82, pedalFeel: "Smooth" },
  one_pedal_driving: { label: "One-Pedal Drive with Hold", regenEfficiency: 0.95, pedalFeel: "Aggressive" },
  predictive_regen: { label: "GPS & Traffic Predictive Regeneration", regenEfficiency: 0.98, pedalFeel: "Smart" },
} as const;

export const THERMAL_MANAGEMENT_TYPES = {
  liquid_chiller: { label: "Active Liquid Cooling Chiller", thermalStability: 0.95, weightKg: 18 },
  refrigerant_direct: { label: "Direct Refrigerant Submerged Cooling", thermalStability: 0.99, weightKg: 12 },
  air_cooling: { label: "Forced Air Cooling", thermalStability: 0.70, weightKg: 6 },
  heat_pump_waste_heat: { label: "Heat Pump + Waste Heat Recovery", thermalStability: 0.96, weightKg: 14 },
} as const;

export const CHARGING_TECH_TYPES = {
  nacs: { label: "NACS (Tesla Universal Standard 350kW)", fastChargeMinutes: 15 },
  ccs2: { label: "CCS Type 2 Combined Charging (300kW)", fastChargeMinutes: 18 },
  chademo: { label: "CHAdeMO DC Fast Charging (150kW)", fastChargeMinutes: 30 },
  wireless_dynamic: { label: "Wireless Inductive Dynamic Road Charging", fastChargeMinutes: 20 },
  v2g_v2h_v2l: { label: "V2G / V2H / V2L Bidirectional Power Station", fastChargeMinutes: 12 },
} as const;

export const SPORTS_HYBRID_TECH_TYPES = {
  electric_torque_fill: { label: "Electric Torque Fill (Eliminates Turbo Lag)", torqueBoostNm: 220 },
  e_turbo: { label: "eTurbo Exhaust Heat Recovery & Spool Assist", boostBarAdded: 0.6 },
  e_axle_vectoring: { label: "Twin eAxle Motor Torque Vectoring", corneringGDelta: 0.25 },
  launch_control_boost: { label: "Launch Control Max Discharging Punch", zeroToSixtySecDelta: -0.35 },
} as const;

export const HYBRID_DEPLOY_MODES: Record<string, {
  label: string;
  deployRate: number;     // fraction of available energy per lap
  regenRate: number;      // fraction of recoverable energy captured
  description: string;
}> = {
  qualifying: { label: "Qualifying", deployRate: 1.0, regenRate: 0.5, description: "Full deployment, minimal regen" },
  race: { label: "Race", deployRate: 0.6, regenRate: 0.8, description: "Balanced deploy and recover" },
  save: { label: "Save", deployRate: 0.3, regenRate: 0.95, description: "Conserve battery, max regen" },
  attack: { label: "Attack", deployRate: 0.85, regenRate: 0.7, description: "Aggressive deploy for overtakes" },
  endurance: { label: "Endurance", deployRate: 0.4, regenRate: 0.9, description: "Sustainable for long stints" },
  hotlap: { label: "Hot Lap", deployRate: 0.95, regenRate: 0.6, description: "Near-max deployment for fast laps" },
};

export const MGU_H_MODES: Record<string, {
  label: string;
  recoveryFactor: number; // 0-1
  turboAssist: number;    // 0-1
  description: string;
}> = {
  off: { label: "Off", recoveryFactor: 0, turboAssist: 0, description: "MGU-H disabled" },
  charge: { label: "Charge", recoveryFactor: 0.9, turboAssist: 0.2, description: "Max energy recovery from exhaust heat" },
  deploy: { label: "Deploy", recoveryFactor: 0.3, turboAssist: 0.8, description: "Spool turbo, reduce lag" },
  auto: { label: "Auto", recoveryFactor: 0.6, turboAssist: 0.5, description: "ECU-managed balance" },
};

// ---------- Exterior styling constants (Modularized) ----------
export * from "./constants/exteriorConstants";

// ---------- Vehicle & Platform & Chassis constants (Modularized) ----------
export * from "./constants/platformConstants";

// ---------- Interior ----------

export const SEAT_TYPES: Record<string, {
  label: string;
  weight: number;
  cost: number;
  support: number;     // 0-1 lateral support
  comfort: number;     // 0-1
  safety: number;      // 0-1
}> = {
  bench_seat: { label: "Front Bench Seat", weight: 22, cost: 150, support: 0.2, comfort: 0.65, safety: 0.5 },
  standard: { label: "Standard Bucket", weight: 18, cost: 300, support: 0.3, comfort: 0.8, safety: 0.6 },
  sport: { label: "Sport", weight: 15, cost: 800, support: 0.6, comfort: 0.7, safety: 0.7 },
  bucket: { label: "Bucket", weight: 12, cost: 1500, support: 0.8, comfort: 0.5, safety: 0.8 },
  carbon_bucket: { label: "Carbon Bucket", weight: 7, cost: 4500, support: 0.9, comfort: 0.4, safety: 0.9 },
  racing_shell: { label: "Racing Shell", weight: 5, cost: 8000, support: 1.0, comfort: 0.2, safety: 1.0 },
};

export const SEAT_MATERIALS: Record<string, {
  label: string;
  weightFactor: number;
  costFactor: number;
  gripFactor: number;
  comfortFactor: number;
}> = {
  vinyl: { label: "Vinyl / Durable Plastic", weightFactor: 1.05, costFactor: 0.6, gripFactor: 0.5, comfortFactor: 0.5 },
  cloth: { label: "Cloth", weightFactor: 1.0, costFactor: 1.0, gripFactor: 0.7, comfortFactor: 0.8 },
  alcantara: { label: "Alcantara", weightFactor: 0.9, costFactor: 2.5, gripFactor: 0.95, comfortFactor: 0.7 },
  leather: { label: "Leather", weightFactor: 1.1, costFactor: 2.0, gripFactor: 0.6, comfortFactor: 0.9 },
  carbon_leather: { label: "Carbon-Leather", weightFactor: 0.95, costFactor: 3.0, gripFactor: 0.8, comfortFactor: 0.85 },
  suede: { label: "Suede", weightFactor: 0.95, costFactor: 1.8, gripFactor: 0.9, comfortFactor: 0.75 },
};

export const DASHBOARD_MATERIALS: Record<string, {
  label: string;
  weight: number;
  cost: number;
  luxuryFactor: number;
  weightFactor: number;
}> = {
  hollow_plastic: { label: "Hollow Molded Plastic", weight: 6, cost: 50, luxuryFactor: 0.1, weightFactor: 0.8 },
  plastic: { label: "Standard Molded Plastic", weight: 8, cost: 100, luxuryFactor: 0.2, weightFactor: 1.0 },
  soft_touch: { label: "Soft-Touch", weight: 9, cost: 300, luxuryFactor: 0.5, weightFactor: 1.1 },
  carbon_fiber: { label: "Carbon Fiber", weight: 3, cost: 2000, luxuryFactor: 0.8, weightFactor: 0.4 },
  alcantara: { label: "Alcantara", weight: 4, cost: 1500, luxuryFactor: 0.85, weightFactor: 0.5 },
  wood: { label: "Wood Veneer", weight: 10, cost: 800, luxuryFactor: 0.9, weightFactor: 1.2 },
  aluminum: { label: "Brushed Aluminum", weight: 5, cost: 1000, luxuryFactor: 0.7, weightFactor: 0.6 },
};

export const STEERING_WHEEL_TYPES: Record<string, {
  label: string;
  weight: number;
  cost: number;
  gripFactor: number;
  adjustability: number;
}> = {
  standard: { label: "Standard Round", weight: 2.5, cost: 150, gripFactor: 0.6, adjustability: 0.5 },
  sport: { label: "Sport (Thick)", weight: 2.2, cost: 400, gripFactor: 0.75, adjustability: 0.6 },
  flat_bottom: { label: "Flat Bottom", weight: 2.0, cost: 600, gripFactor: 0.8, adjustability: 0.7 },
  carbon: { label: "Carbon Race", weight: 1.2, cost: 2500, gripFactor: 0.9, adjustability: 0.9 },
  gt_wheel: { label: "GT Wheel", weight: 1.5, cost: 3500, gripFactor: 0.95, adjustability: 1.0 },
};

export const STEERING_MATERIALS: Record<string, {
  label: string;
  costFactor: number;
  gripFactor: number;
}> = {
  plastic: { label: "Plastic", costFactor: 1.0, gripFactor: 0.5 },
  leather: { label: "Leather", costFactor: 2.0, gripFactor: 0.7 },
  alcantara: { label: "Alcantara", costFactor: 2.8, gripFactor: 0.95 },
  carbon: { label: "Carbon", costFactor: 4.0, gripFactor: 0.85 },
};

export const PEDAL_SETS: Record<string, {
  label: string;
  weight: number;
  cost: number;
  feelFactor: number;
}> = {
  standard: { label: "Standard", weight: 2.0, cost: 80, feelFactor: 0.5 },
  sport: { label: "Sport", weight: 2.5, cost: 250, feelFactor: 0.7 },
  aluminum: { label: "Aluminum", weight: 1.5, cost: 500, feelFactor: 0.85 },
  carbon: { label: "Carbon", weight: 0.8, cost: 1200, feelFactor: 1.0 },
};

export const SHIFT_KNOBS: Record<string, {
  label: string;
  weight: number;
  cost: number;
  feelFactor: number;
}> = {
  standard: { label: "Standard", weight: 0.3, cost: 30, feelFactor: 0.5 },
  leather: { label: "Leather", weight: 0.4, cost: 80, feelFactor: 0.7 },
  aluminum: { label: "Aluminum", weight: 0.5, cost: 150, feelFactor: 0.85 },
  carbon: { label: "Carbon", weight: 0.2, cost: 400, feelFactor: 0.9 },
  titanium: { label: "Titanium", weight: 0.6, cost: 600, feelFactor: 1.0 },
};

export const ROLL_CAGES: Record<string, {
  label: string;
  weight: number;
  cost: number;
  rigidityFactor: number;
  safetyFactor: number;
}> = {
  none: { label: "None", weight: 0, cost: 0, rigidityFactor: 1.0, safetyFactor: 0.5 },
  half: { label: "Half Cage", weight: 15, cost: 800, rigidityFactor: 1.1, safetyFactor: 0.7 },
  full: { label: "Full Cage", weight: 30, cost: 2000, rigidityFactor: 1.25, safetyFactor: 0.85 },
  welded: { label: "Welded Cage", weight: 35, cost: 3500, rigidityFactor: 1.35, safetyFactor: 0.9 },
  chrome_moly: { label: "Chrome-Moly", weight: 22, cost: 6000, rigidityFactor: 1.5, safetyFactor: 0.95 },
};

// ---------- Driver & Weather ----------

export const DRIVER_SKILLS: Record<DriverSkill, {
  label: string;
  paceFactor: number;
  consistencyFactor: number;
  mistakeRisk: number;
  tireManagement: number;
  fuelManagement: number;
  wetPerformance: number;
}> = {
  rookie: { label: "Rookie", paceFactor: 0.78, consistencyFactor: 0.6, mistakeRisk: 0.15, tireManagement: 0.5, fuelManagement: 0.5, wetPerformance: 0.6 },
  amateur: { label: "Amateur", paceFactor: 0.86, consistencyFactor: 0.75, mistakeRisk: 0.08, tireManagement: 0.65, fuelManagement: 0.65, wetPerformance: 0.75 },
  pro: { label: "Professional", paceFactor: 0.93, consistencyFactor: 0.88, mistakeRisk: 0.04, tireManagement: 0.8, fuelManagement: 0.8, wetPerformance: 0.88 },
  expert: { label: "Expert", paceFactor: 0.97, consistencyFactor: 0.94, mistakeRisk: 0.02, tireManagement: 0.9, fuelManagement: 0.9, wetPerformance: 0.95 },
  legend: { label: "Legend", paceFactor: 1.0, consistencyFactor: 0.98, mistakeRisk: 0.008, tireManagement: 0.98, fuelManagement: 0.95, wetPerformance: 1.0 },
};

export const WEATHER_TYPES: Record<WeatherType, {
  label: string;
  gripFactor: number;
  visibilityFactor: number;
  tireWearMul: number;
  fuelConsumptionMul: number;
  coolingBonus: number;
  downforceLoss: number;
  trackTempDelta: number; // adjustment from ambient
}> = {
  dry: { label: "Dry", gripFactor: 1.0, visibilityFactor: 1.0, tireWearMul: 1.0, fuelConsumptionMul: 1.0, coolingBonus: 0, downforceLoss: 0, trackTempDelta: 15 },
  cloudy: { label: "Cloudy", gripFactor: 0.98, visibilityFactor: 0.95, tireWearMul: 0.95, fuelConsumptionMul: 0.98, coolingBonus: 0.05, downforceLoss: 0, trackTempDelta: 8 },
  light_rain: { label: "Light Rain", gripFactor: 0.78, visibilityFactor: 0.8, tireWearMul: 0.7, fuelConsumptionMul: 0.95, coolingBonus: 0.15, downforceLoss: 0.15, trackTempDelta: -5 },
  heavy_rain: { label: "Heavy Rain", gripFactor: 0.55, visibilityFactor: 0.55, tireWearMul: 0.5, fuelConsumptionMul: 0.9, coolingBonus: 0.25, downforceLoss: 0.35, trackTempDelta: -10 },
  changing: { label: "Changing", gripFactor: 0.85, visibilityFactor: 0.85, tireWearMul: 0.85, fuelConsumptionMul: 0.97, coolingBonus: 0.1, downforceLoss: 0.1, trackTempDelta: 5 },
};

// ---------- Tracks ----------

export const TRACKS: Record<TrackId, TrackInfo> = {
  monza: {
    id: "monza", name: "Monza", country: "Italy", length: 5.793, highSpeed: true, altitudeChange: 15, segments: [
      { type: "straight", length: 1100, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 80, arc: 180 },
      { type: "straight", length: 500, arc: 0 }, { type: "corner", length: 45, arc: 75 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 60, arc: 120 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 500, arc: 0 }, { type: "corner", length: 45, arc: 80 },
    ]
  },
  spa: {
    id: "spa", name: "Spa-Francorchamps", country: "Belgium", length: 7.004, highSpeed: true, altitudeChange: 100, segments: [
      { type: "straight", length: 500, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 60, arc: 180 },
      { type: "straight", length: 800, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 600, arc: 0 }, { type: "corner", length: 45, arc: 75 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 60, arc: 120 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 80, arc: 180 },
      { type: "straight", length: 500, arc: 0 }, { type: "corner", length: 45, arc: 80 },
    ]
  },
  silverstone: {
    id: "silverstone", name: "Silverstone", country: "UK", length: 5.891, highSpeed: true, altitudeChange: 20, segments: [
      { type: "straight", length: 600, arc: 0 }, { type: "corner", length: 60, arc: 120 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 45, arc: 80 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 500, arc: 0 }, { type: "corner", length: 45, arc: 75 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 55, arc: 110 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 60, arc: 180 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 40, arc: 70 },
    ]
  },
  suzuka: {
    id: "suzuka", name: "Suzuka", country: "Japan", length: 5.807, highSpeed: false, altitudeChange: 40, segments: [
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 45, arc: 90 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 60, arc: 180 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 80, arc: 180 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 45, arc: 80 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 55, arc: 120 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 60, arc: 180 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 40, arc: 75 },
    ]
  },
  nurburgring: {
    id: "nurburgring", name: "Nürburgring GP", country: "Germany", length: 5.148, highSpeed: false, altitudeChange: 50, segments: [
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 60, arc: 180 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 45, arc: 75 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 55, arc: 120 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 60, arc: 180 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 45, arc: 80 },
    ]
  },
  lemans: {
    id: "lemans", name: "Le Mans", country: "France", length: 13.626, highSpeed: true, altitudeChange: 30, segments: [
      { type: "straight", length: 2000, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 60, arc: 180 },
      { type: "straight", length: 800, arc: 0 }, { type: "corner", length: 45, arc: 75 },
      { type: "straight", length: 600, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 700, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 500, arc: 0 }, { type: "corner", length: 55, arc: 120 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 50, arc: 90 },
    ]
  },
  laguna: {
    id: "laguna", name: "Laguna Seca", country: "USA", length: 3.602, highSpeed: false, altitudeChange: 55, segments: [
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 45, arc: 90 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 60, arc: 180 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 45, arc: 80 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 55, arc: 120 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 40, arc: 75 },
    ]
  },
  interlagos: {
    id: "interlagos", name: "Interlagos", country: "Brazil", length: 4.309, highSpeed: false, altitudeChange: 60, segments: [
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 45, arc: 90 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 60, arc: 180 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 45, arc: 80 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 55, arc: 120 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 40, arc: 75 },
    ]
  },
  monaco: {
    id: "monaco", name: "Monaco", country: "Monaco", length: 3.337, highSpeed: false, altitudeChange: 40, segments: [
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 30, arc: 90 },
      { type: "straight", length: 100, arc: 0 }, { type: "corner", length: 40, arc: 180 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 35, arc: 90 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 45, arc: 180 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 30, arc: 75 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 50, arc: 180 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 35, arc: 90 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 30, arc: 80 },
    ]
  },
  bathurst: {
    id: "bathurst", name: "Bathurst", country: "Australia", length: 6.213, highSpeed: true, altitudeChange: 170, segments: [
      { type: "straight", length: 600, arc: 0 }, { type: "corner", length: 45, arc: 90 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 50, arc: 120 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 60, arc: 180 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 600, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 500, arc: 0 }, { type: "corner", length: 45, arc: 80 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 60, arc: 90 },
    ]
  },
  imola: {
    id: "imola", name: "Imola", country: "Italy", length: 4.909, highSpeed: false, altitudeChange: 35, segments: [
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 100, arc: 0 }, { type: "corner", length: 80, arc: 180 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 45, arc: 75 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 60, arc: 110 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 90, arc: 170 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 50, arc: 80 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 70, arc: 130 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 45, arc: 90 },
    ]
  },
  redbullring: {
    id: "redbullring", name: "Red Bull Ring", country: "Austria", length: 4.318, highSpeed: true, altitudeChange: 65, segments: [
      { type: "straight", length: 600, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 40, arc: 60 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 60, arc: 90 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 45, arc: 75 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 50, arc: 90 },
    ]
  },
  hungaroring: {
    id: "hungaroring", name: "Hungaroring", country: "Hungary", length: 4.381, highSpeed: false, altitudeChange: 25, segments: [
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 40, arc: 80 },
      { type: "straight", length: 80, arc: 0 }, { type: "corner", length: 50, arc: 180 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 35, arc: 90 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 45, arc: 130 },
      { type: "straight", length: 100, arc: 0 }, { type: "corner", length: 40, arc: 80 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 60, arc: 180 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 35, arc: 70 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 50, arc: 120 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 40, arc: 90 },
    ]
  },
  zandvoort: {
    id: "zandvoort", name: "Zandvoort", country: "Netherlands", length: 4.259, highSpeed: false, altitudeChange: 30, segments: [
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 45, arc: 90 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 50, arc: 120 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 60, arc: 180 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 80, arc: 200 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 35, arc: 80 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 50, arc: 170 },
    ]
  },
  americas: {
    id: "americas", name: "Circuit of the Americas", country: "USA", length: 5.513, highSpeed: true, altitudeChange: 50, segments: [
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 45, arc: 90 },
      { type: "straight", length: 100, arc: 0 }, { type: "corner", length: 50, arc: 130 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 50, arc: 80 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 60, arc: 120 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 80, arc: 180 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 45, arc: 75 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 50, arc: 90 },
    ]
  },
  miami: {
    id: "miami", name: "Miami International", country: "USA", length: 5.412, highSpeed: true, altitudeChange: 5, segments: [
      { type: "straight", length: 500, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 60, arc: 130 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 45, arc: 75 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 40, arc: 80 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 80, arc: 180 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 45, arc: 70 },
    ]
  },
  vegas: {
    id: "vegas", name: "Las Vegas Strip", country: "USA", length: 6.12, highSpeed: true, altitudeChange: 0, segments: [
      { type: "straight", length: 1800, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 600, arc: 0 }, { type: "corner", length: 60, arc: 120 },
      { type: "straight", length: 800, arc: 0 }, { type: "corner", length: 45, arc: 80 },
      { type: "straight", length: 500, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 40, arc: 75 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 50, arc: 90 },
    ]
  },
  fuji: {
    id: "fuji", name: "Fuji Speedway", country: "Japan", length: 4.563, highSpeed: true, altitudeChange: 40, segments: [
      { type: "straight", length: 1500, arc: 0 }, { type: "corner", length: 60, arc: 90 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 80, arc: 180 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 45, arc: 75 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 50, arc: 100 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 70, arc: 160 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 40, arc: 80 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 50, arc: 90 },
    ]
  },
  sebring: {
    id: "sebring", name: "Sebring", country: "USA", length: 6.019, highSpeed: false, altitudeChange: 10, segments: [
      { type: "straight", length: 500, arc: 0 }, { type: "corner", length: 45, arc: 90 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 60, arc: 130 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 50, arc: 100 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 80, arc: 180 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 45, arc: 75 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 55, arc: 120 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 40, arc: 85 },
    ]
  },
  watkins: {
    id: "watkins", name: "Watkins Glen", country: "USA", length: 5.472, highSpeed: true, altitudeChange: 45, segments: [
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 80, arc: 180 },
      { type: "straight", length: 600, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 60, arc: 120 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 45, arc: 80 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 50, arc: 100 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 40, arc: 75 },
    ]
  },
  roadatlanta: {
    id: "roadatlanta", name: "Road Atlanta", country: "USA", length: 4.088, highSpeed: false, altitudeChange: 100, segments: [
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 45, arc: 90 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 60, arc: 130 },
      { type: "straight", length: 250, arc: 0 }, { type: "corner", length: 70, arc: 180 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 40, arc: 75 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 80, arc: 170 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 200, arc: 0 }, { type: "corner", length: 60, arc: 180 },
      { type: "straight", length: 150, arc: 0 }, { type: "corner", length: 40, arc: 80 },
    ]
  },
  dragstrip: {
    id: "dragstrip", name: "Drag Strip", country: "USA", length: 0.402, highSpeed: true, altitudeChange: 0, segments: [
      { type: "straight", length: 402, arc: 0 },
    ]
  },
  nordschleife: {
    id: "nordschleife", name: "Nordschleife", country: "Germany", length: 20.832, highSpeed: true, altitudeChange: 300, segments: [
      { type: "straight", length: 500, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 800, arc: 0 }, { type: "corner", length: 60, arc: 120 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 80, arc: 180 },
      { type: "straight", length: 600, arc: 0 }, { type: "corner", length: 45, arc: 80 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 70, arc: 170 },
      { type: "straight", length: 500, arc: 0 }, { type: "corner", length: 40, arc: 75 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 60, arc: 150 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 700, arc: 0 }, { type: "corner", length: 45, arc: 80 },
      { type: "straight", length: 400, arc: 0 }, { type: "corner", length: 80, arc: 180 },
      { type: "straight", length: 600, arc: 0 }, { type: "corner", length: 40, arc: 70 },
      { type: "straight", length: 350, arc: 0 }, { type: "corner", length: 60, arc: 130 },
      { type: "straight", length: 500, arc: 0 }, { type: "corner", length: 50, arc: 90 },
      { type: "straight", length: 300, arc: 0 }, { type: "corner", length: 70, arc: 170 },
      { type: "straight", length: 450, arc: 0 }, { type: "corner", length: 45, arc: 85 },
    ]
  },
};

// ---------- Manufacturing ----------

export const FRAME_MATERIALS: Record<FrameMaterial, {
  label: string;
  weightFactor: number;
  strengthFactor: number;
  costPerKg: number;
  recyclability: number;
  corrosionResist: number;
}> = {
  steel: { label: "Steel", weightFactor: 1.0, strengthFactor: 0.7, costPerKg: 1.2, recyclability: 0.9, corrosionResist: 0.3 },
  aluminum: { label: "Aluminum", weightFactor: 0.6, strengthFactor: 0.8, costPerKg: 4.0, recyclability: 0.95, corrosionResist: 0.8 },
  carbon_fiber: { label: "Carbon Fiber", weightFactor: 0.4, strengthFactor: 1.0, costPerKg: 25.0, recyclability: 0.2, corrosionResist: 1.0 },
  titanium: { label: "Titanium", weightFactor: 0.55, strengthFactor: 0.95, costPerKg: 45.0, recyclability: 0.85, corrosionResist: 1.0 },
  magnesium: { label: "Magnesium", weightFactor: 0.35, strengthFactor: 0.65, costPerKg: 12.0, recyclability: 0.8, corrosionResist: 0.4 },
  composites: { label: "Composites", weightFactor: 0.45, strengthFactor: 0.9, costPerKg: 18.0, recyclability: 0.3, corrosionResist: 0.95 },
};

export const MANUFACTURING_PROCESSES: Record<ManufacturingProcess, {
  label: string;
  laborHours: number;
  automationFactor: number;
  defectRate: number;
  costFactor: number;
  description: string;
}> = {
  hand_built: { label: "Hand-Built", laborHours: 240, automationFactor: 0.1, defectRate: 3.2, costFactor: 2.5, description: "Skilled craftsmen, lowest volume" },
  semi_automated: { label: "Semi-Automated", laborHours: 80, automationFactor: 0.5, defectRate: 1.5, costFactor: 1.5, description: "Mix of manual and robotic stations" },
  automated: { label: "Automated", laborHours: 28, automationFactor: 0.8, defectRate: 0.8, costFactor: 1.0, description: "Robotic assembly, high consistency" },
  mass_production: { label: "Mass Production", laborHours: 18, automationFactor: 0.9, defectRate: 1.2, costFactor: 0.7, description: "High volume, optimized line" },
  "3d_printed": { label: "3D Printed", laborHours: 45, automationFactor: 0.95, defectRate: 0.5, costFactor: 1.8, description: "Additive manufacturing, low volume" },
};

export const FACTORY_TIERS: Record<FactoryTier, {
  label: string;
  capacity: number;
  setupCost: number;
  overheadRate: number;
  description: string;
}> = {
  boutique: { label: "Boutique", capacity: 50, setupCost: 500000, overheadRate: 8.0, description: "<100 units/year" },
  small_batch: { label: "Small Batch", capacity: 500, setupCost: 2000000, overheadRate: 5.0, description: "100-500 units/year" },
  mid_volume: { label: "Mid Volume", capacity: 5000, setupCost: 15000000, overheadRate: 3.0, description: "500-5,000 units/year" },
  high_volume: { label: "High Volume", capacity: 50000, setupCost: 80000000, overheadRate: 1.8, description: "5,000-50,000 units/year" },
  mega: { label: "Mega Plant", capacity: 500000, setupCost: 400000000, overheadRate: 1.0, description: ">50,000 units/year" },
};

export const AUTOMATION_LEVELS: Record<AutomationLevel, {
  label: string;
  robotCount: number;
  efficiency: number;
  capexPerStation: number;
  errorReduction: number;
}> = {
  manual: { label: "Manual", robotCount: 0, efficiency: 0.6, capexPerStation: 50000, errorReduction: 0 },
  assisted: { label: "Assisted", robotCount: 10, efficiency: 0.75, capexPerStation: 200000, errorReduction: 0.3 },
  automated: { label: "Automated", robotCount: 50, efficiency: 0.9, capexPerStation: 500000, errorReduction: 0.6 },
  lights_out: { label: "Lights-Out", robotCount: 200, efficiency: 0.97, capexPerStation: 1200000, errorReduction: 0.85 },
};

export const QC_LEVELS: Record<QcLevel, {
  label: string;
  inspectionTime: number;
  defectCatchRate: number;
  costFactor: number;
  description: string;
}> = {
  basic: { label: "Basic", inspectionTime: 1.0, defectCatchRate: 0.7, costFactor: 0.5, description: "Visual checks, sampling" },
  standard: { label: "Standard", inspectionTime: 2.5, defectCatchRate: 0.88, costFactor: 1.0, description: "Dimensional + functional testing" },
  premium: { label: "Premium", inspectionTime: 5.0, defectCatchRate: 0.96, costFactor: 2.0, description: "NDT, stress testing, traceability" },
  aerospace: { label: "Aerospace", inspectionTime: 12.0, defectCatchRate: 0.995, costFactor: 4.5, description: "Full traceability, X-ray, ultrasonic" },
};

export const ASSEMBLY_LINES: Record<string, { label: string; efficiency: number; flexibility: number; description: string }> = {
  cell: { label: "Cell", efficiency: 0.7, flexibility: 1.0, description: "Small teams build complete units" },
  flow: { label: "Flow", efficiency: 0.95, flexibility: 0.3, description: "Linear assembly, high throughput" },
  flexible: { label: "Flexible", efficiency: 0.85, flexibility: 0.9, description: "Reconfigurable stations" },
  lean: { label: "Lean", efficiency: 0.92, flexibility: 0.7, description: "Just-in-time, minimal waste" },
};

// ---------- Defaults ----------

export function defaultEngine(): EngineConfig {
  return {
    layout: "v12",
    bore: 92, stroke: 80, rodLength: 150, compressionRatio: 12.2,
    crank: "forged_steel", pistons: "forged", valvetrain: "dohc_vvl",
    camDuration: 285, camLift: 12, camTiming: 0, valveAngle: 21, valveSize: 38,
    intake: "na", turboSize: 0, boostPressure: 0, wastegateSize: 0, intercoolerEff: 0,
    turboHousing: "cast_iron", compressorAR: 0.6, turbineAR: 0.8, turbineWheelDia: 55,
    intercoolerType: "none", wastegateType: "none", bovType: "none",
    antiLag: false, boostController: "none",
    fuelSystem: "direct", afr: 12.8, ignitionTiming: 32,
    rpmLimiter: 9200, redline: 9200,
    coolingRadiator: 0.8, coolingOilCooler: 0.7, coolingWaterPump: 0.8, coolingFanSpeed: 0.7,
    exhaustPrimaryLength: 850, exhaustCollectorDia: 75, exhaustCat: false, exhaustValved: true,
    hasStartStop: false, ecuMapMode: "sport",
    hasMguH: false, mguHMode: "off",
    hybridArchitecture: "phev", hybridCoupling: "parallel",
    hybridFrontMotorEnabled: false, hybridFrontMotorType: "pmac", hybridFrontMotorPower: 0,
    hybridRearMotorEnabled: false, hybridRearMotorType: "pmac", hybridRearMotorPower: 0,
    batteryCapacity: 16, batteryChemistry: "solid_state",
    deployMode: "qualifying", regenLevel: 0.8, motorLayout: "rear", evMotorPower: 0, evMotorType: "pmac",
    motorPlacement: "p2", hybridMotorPower: 180,
    powerElectronicsType: "silicon_carbide_sic",
    voltageArchitecture: 800,
    hybridTransmission: "dct_hybrid",
    regenBrakingTech: "brake_by_wire",
    thermalManagement: "liquid_chiller",
    chargingTech: "nacs",
    engineStrategy: "auto_start_stop",
    sensorSuite: "ai_telemetry_pro",
    emissionsTech: "three_way_cat",
    safetySystems: "pyro_fuse_orange_lines",
    futureTech: "solid_state_structural",
    sportsHybridTech: "electric_torque_fill",
  };
}

export function defaultAero(): AeroConfig {
  return {
    bodyShape: 0.6, bodyWidth: 1900, roofHeight: 1150, rideHeight: 120,
    splitterLength: 200, splitterAngle: 5, wingWidth: 1600, wingAngle: 10,
    wingHeight: 200, diffuserAngle: 12, underbody: "flat_floor",
    grilleOpening: 0.3, coolingVents: 0.2, canards: false, drs: false, sidePods: false,
  };
}

// ---------- Aero Research Center ----------

export const FRONT_BUMPER_SHAPES: Record<FrontBumperShape, { label: string; dragDelta: number; downforceDelta: number; costFactor: number }> = {
  standard: { label: "Standard", dragDelta: 0.00, downforceDelta: 0.00, costFactor: 1.0 },
  aggressive: { label: "Aggressive", dragDelta: 0.01, downforceDelta: -0.02, costFactor: 1.3 },
  splitter_integrated: { label: "Splitter Integrated", dragDelta: -0.01, downforceDelta: -0.04, costFactor: 1.6 },
  gt3: { label: "GT3", dragDelta: -0.02, downforceDelta: -0.08, costFactor: 2.2 },
  rally: { label: "Rally", dragDelta: 0.03, downforceDelta: 0.02, costFactor: 1.4 },
};

export const SIDEPOD_INLET_POSITIONS = [
  { value: "low", label: "Low" },
  { value: "mid", label: "Mid" },
  { value: "high", label: "High" },
] as const;

export const UNDERBODY_FLOOR_TYPES: Record<UnderbodyFloorType, { label: string; dragDelta: number; downforceFactor: number; stabilityFactor: number; complexity: number }> = {
  flat: { label: "Flat Floor", dragDelta: 0.00, downforceFactor: 0.2, stabilityFactor: 0.6, complexity: 0.1 },
  partial_flat: { label: "Partial Flat Floor", dragDelta: -0.01, downforceFactor: 0.4, stabilityFactor: 0.7, complexity: 0.3 },
  venturi_tunnels: { label: "Venturi Tunnels", dragDelta: -0.03, downforceFactor: 1.4, stabilityFactor: 0.9, complexity: 0.7 },
  ground_effect_tunnels: { label: "Ground Effect Tunnels", dragDelta: -0.04, downforceFactor: 1.8, stabilityFactor: 1.0, complexity: 0.95 },
};

export const WHEEL_AERO_TYPES: Record<WheelAeroType, { label: string; dragDelta: number; brakeCoolingFactor: number; turbulenceFactor: number }> = {
  open: { label: "Open Spokes", dragDelta: 0.000, brakeCoolingFactor: 1.0, turbulenceFactor: 1.0 },
  aero_discs: { label: "Aero Discs", dragDelta: -0.006, brakeCoolingFactor: 0.6, turbulenceFactor: 0.4 },
  covers: { label: "Full Covers", dragDelta: -0.010, brakeCoolingFactor: 0.4, turbulenceFactor: 0.2 },
  arch_vents: { label: "Arch Vents", dragDelta: -0.002, brakeCoolingFactor: 1.2, turbulenceFactor: 0.8 },
  deflectors: { label: "Tire Deflectors", dragDelta: -0.004, brakeCoolingFactor: 1.1, turbulenceFactor: 0.7 },
};

export const MIRROR_AERO_TYPES: Record<MirrorAeroType, { label: string; dragDelta: number; visibilityFactor: number; costFactor: number }> = {
  traditional: { label: "Traditional", dragDelta: 0.006, visibilityFactor: 1.0, costFactor: 1.0 },
  slim: { label: "Slim", dragDelta: 0.003, visibilityFactor: 0.9, costFactor: 1.4 },
  camera: { label: "Camera", dragDelta: 0.001, visibilityFactor: 1.1, costFactor: 2.2 },
  hidden_camera: { label: "Hidden Camera", dragDelta: 0.000, visibilityFactor: 1.0, costFactor: 2.8 },
};

export const CFD_QUALITIES: Record<CfdQuality, { label: string; accuracyFactor: number; timeFactor: number; costFactor: number }> = {
  basic: { label: "Basic", accuracyFactor: 0.6, timeFactor: 0.2, costFactor: 0.3 },
  medium: { label: "Medium", accuracyFactor: 0.75, timeFactor: 0.5, costFactor: 0.6 },
  high: { label: "High", accuracyFactor: 0.88, timeFactor: 1.0, costFactor: 1.0 },
  ultra: { label: "Ultra", accuracyFactor: 0.95, timeFactor: 2.0, costFactor: 1.8 },
  research: { label: "Research Grade", accuracyFactor: 0.99, timeFactor: 4.0, costFactor: 3.5 },
};

export const AERO_MODES: Record<AeroMode, { label: string; dragReduction: number; downforceFactor: number; topSpeedBoost: number }> = {
  eco: { label: "Eco", dragReduction: 0.15, downforceFactor: 0.5, topSpeedBoost: 0.05 },
  comfort: { label: "Comfort", dragReduction: 0.08, downforceFactor: 0.7, topSpeedBoost: 0.02 },
  sport: { label: "Sport", dragReduction: 0.0, downforceFactor: 1.0, topSpeedBoost: 0.0 },
  track: { label: "Track", dragReduction: -0.05, downforceFactor: 1.2, topSpeedBoost: -0.03 },
  auto: { label: "Auto", dragReduction: 0.03, downforceFactor: 1.0, topSpeedBoost: 0.0 },
};

export const ENDPLATE_DESIGNS = [
  { value: "none", label: "None" },
  { value: "standard", label: "Standard" },
  { value: "slotted", label: "Slotted" },
  { value: "curved", label: "Curved" },
] as const;

export const OIL_COOLER_PLACEMENTS = [
  { value: "front", label: "Front" },
  { value: "side", label: "Side" },
  { value: "rear", label: "Rear" },
] as const;

export function defaultAeroResearch(): AeroResearchConfig {
  return {
    front: {
      bumperShape: "standard",
      airDam: 0.3,
      splitterExtension: 0,
      splitterAngle: 5,
      divePlanes: 0,
      airCurtains: false,
      brakeDucts: 0.3,
      hoodVents: 0.1,
      activeGrilleShutters: false,
    },
    sidepod: {
      width: 0.5,
      height: 0.5,
      inletSize: 0.4,
      inletPosition: "mid",
      undercut: 0.3,
      outletSize: 0.4,
      cokeBottleTaper: 0.3,
      curvature: 0.5,
      floor: false,
    },
    diffuser: {
      length: 300,
      angle: 12,
      exitHeight: 80,
      exitWidth: 1400,
      tunnelWidth: 200,
      tunnelDepth: 60,
      channels: 4,
      strakes: 3,
      strakeAngle: 5,
      kickupAngle: 8,
      gurneyFlap: false,
    },
    underbody: {
      floorType: "partial_flat",
      skidBlocks: false,
      floorEdgeWings: false,
      floorFences: 0,
      coolingChannels: 0,
    },
    active: {
      enabled: false,
      activeSplitter: false,
      adaptiveWing: false,
      deployableSpoiler: false,
      activeGrille: false,
      movableDiffuser: false,
      airBrake: false,
      rideHeightAdj: false,
      drs: false,
      drsOpeningAngle: 30,
      mode: "sport",
    },
    rearWing: {
      elements: 1,
      span: 1600,
      chord: 220,
      endplateDesign: "standard",
      angleOfAttack: 10,
      swanNeckMount: false,
      gurneyFlap: false,
      beamWing: false,
    },
    cooling: {
      radiatorSize: 0.5,
      oilCoolerPlacement: "front",
      brakeDucts: 0.3,
      batteryCooling: 0.3,
      engineBayExtraction: 0.2,
      hoodVents: 0.1,
      fenderVents: 0.1,
      heatShields: 0.3,
    },
    wheel: {
      wheelAero: "open",
      spokePattern: 0.5,
      archVents: 0.1,
      tireDeflectors: false,
      mudguards: false,
    },
    mirror: "traditional",
    windTunnel: {
      windSpeed: 200,
      yawAngle: 0,
      pitch: 0,
      rideHeight: 120,
      crosswind: 0,
      rollingRoad: true,
    },
    cfd: { quality: "medium" },
  };
}

export function defaultInterior(): InteriorConfig {
  return {
    seatType: "sport", seatMaterial: "leather", seatCount: 2,
    dashboardMaterial: "soft_touch", infotainmentSize: 8, hasNav: true,
    hasPremiumAudio: false, audioSpeakers: 6, climateControl: true,
    ambientLighting: 0.2, soundDeadening: 0.3,
    steeringWheel: "flat_bottom", steeringMaterial: "leather",
    pedalSet: "sport", shiftKnob: "leather",
    rollCage: "none", fireExtinguisher: false, racingHarness: false,
    harnessPoints: 4, windowNet: false,
    interiorWeight: 0, interiorColor: "#1a1a2e", accentColor: "#fbbf24",
    trimFinish: "matte",
  };
}

export function defaultExterior(): ExteriorConfig {
  return {
    bodyType: "coupe",
    paintColor: "#e11d48",
    paintFinish: "metallic",
    rimDesign: "y_spoke",
    rimFinish: "gloss_black",
    rimDiameter: 19,
    rimWidth: 10.5,
    headlightType: "led",
    taillightType: "led_bar",
    bodyKit: "oem_plus",
    spoilerType: "ducktail",
    roofScoop: "none",
    hoodScoop: false,
    sideSkirts: false,
    frontLipExtension: 0.3,
    fenderVents: false,
    splitter: false,
    towHook: false,
    mirrorType: "carbon",
    badgeColor: "#e11d48",
  };
}

export function defaultVehicle(): VehicleConfig {
  return {
    platform: "hypercar", driveType: "awd", enginePosition: "mid", chassis: "carbon_tub",
    exterior: defaultExterior(),
    aero: defaultAero(),
    aeroResearch: defaultAeroResearch(),
    suspensionFront: "double_wishbone", suspensionRear: "double_wishbone",
    springRateF: 120, springRateR: 140, damperF: 0.5, damperR: 0.5,
    rideHeight: 120, camberF: -2, camberR: -2.5, toeF: 0, toeR: 0.1,
    antiRollBarF: 0.5, antiRollBarR: 0.5,
    brakeType: "cast_iron", brakePistonCount: 4,
    brakeDiscSize: 380, brakePadCompound: 0.6, brakeBias: 0.6,
    wheelDiameter: 19, wheelWidth: 10.5, tireCompound: "medium", tirePressure: 2.2,
    transmission: "dct_7", gearCount: 7, finalDrive: 3.5,
    diffType: "lsd", diffPreload: 0.5,
    electronics: { abs: true, tractionControl: 0.5, stabilityControl: 0.3, launchControl: true, ecuMap: "sport", dataLogging: true, telemetryLevel: 0.5 },
    interior: defaultInterior(),
    ballast: 0, ballastPositionX: 0, ballastPositionY: 0, ballastPositionZ: 0,
    // Phase 1: deep chassis engineering
    chassisEng: defaultChassisEngineering(),
    suspensionGeo: defaultSuspensionGeometry(),
    steeringEng: defaultSteering(),
    brakesEng: defaultBrakes(),
    tiresEng: defaultTires(),
    wheelsEng: defaultWheels(),
  };
}

export function defaultManufacturing(): ManufacturingConfig {
  return {
    frameMaterial: "steel",
    bodyMaterial: "aluminum",
    process: "semi_automated",
    factoryTier: "small_batch",
    automation: "assisted",
    assemblyLine: "flexible",
    qcLevel: "standard",
    productionVolume: 200,
    shiftCount: 2,
  };
}

// ---------- Infotainment & AI ----------

export const INFO_DISPLAY_CONFIGS: Record<InfoDisplayConfig, {
  label: string;
  cost: number;
  weight: number;
  power: number;
  heat: number;
  premium: number;
}> = {
  none: { label: "No Infotainment", cost: 0, weight: 0, power: 0, heat: 0, premium: 0 },
  lcd_5: { label: '5" LCD', cost: 120, weight: 1.2, power: 8, heat: 0.1, premium: 0.1 },
  touch_7: { label: '7" Touchscreen', cost: 280, weight: 1.5, power: 12, heat: 0.15, premium: 0.2 },
  hd_8: { label: '8" HD Display', cost: 450, weight: 1.8, power: 15, heat: 0.2, premium: 0.3 },
  fhd_10: { label: '10" Full HD', cost: 900, weight: 2.2, power: 20, heat: 0.25, premium: 0.45 },
  cockpit_12_3: { label: '12.3" Digital Cockpit', cost: 1600, weight: 2.8, power: 28, heat: 0.3, premium: 0.6 },
  oled_15: { label: '15" OLED', cost: 2800, weight: 3.2, power: 32, heat: 0.35, premium: 0.75 },
  oled_17_curved: { label: '17" Curved OLED', cost: 4200, weight: 3.8, power: 38, heat: 0.4, premium: 0.85 },
  dual: { label: "Dual Screens", cost: 5200, weight: 5.5, power: 55, heat: 0.5, premium: 0.9 },
  triple: { label: "Triple Screens", cost: 7800, weight: 8.0, power: 80, heat: 0.6, premium: 0.95 },
  passenger: { label: "Passenger Display", cost: 1400, weight: 2.5, power: 22, heat: 0.25, premium: 0.7 },
  rear: { label: "Rear Entertainment", cost: 2200, weight: 4.5, power: 45, heat: 0.35, premium: 0.8 },
};

export const INFO_DISPLAY_TECH: Record<InfoDisplayTech, {
  label: string;
  costFactor: number;
  heatFactor: number;
  premium: number;
}> = {
  tft: { label: "TFT LCD", costFactor: 1.0, heatFactor: 1.0, premium: 0.2 },
  ips: { label: "IPS LCD", costFactor: 1.3, heatFactor: 0.9, premium: 0.4 },
  oled: { label: "OLED", costFactor: 1.8, heatFactor: 0.7, premium: 0.7 },
  amoled: { label: "AMOLED", costFactor: 2.2, heatFactor: 0.6, premium: 0.85 },
  mini_led: { label: "Mini-LED", costFactor: 2.0, heatFactor: 0.75, premium: 0.75 },
  micro_led: { label: "MicroLED", costFactor: 3.5, heatFactor: 0.5, premium: 1.0 },
  flexible_oled: { label: "Flexible OLED", costFactor: 3.0, heatFactor: 0.6, premium: 0.95 },
};

export const INFO_OS_TIERS: Record<InfoOsTier, {
  label: string;
  hwCost: number;
  swCost: number;     // per-unit amortized dev cost
  bootTime: number;   // seconds
  reliability: number;
  tech: number;
  description: string;
}> = {
  none: { label: "None", hwCost: 0, swCost: 0, bootTime: 0, reliability: 1.0, tech: 0, description: "No infotainment OS" },
  embedded: { label: "Proprietary Embedded", hwCost: 80, swCost: 150, bootTime: 12, reliability: 0.95, tech: 0.25, description: "Basic embedded firmware" },
  android_auto: { label: "Android Automotive", hwCost: 320, swCost: 800, bootTime: 6, reliability: 0.88, tech: 0.6, description: "Google-backed, app ecosystem" },
  linux: { label: "Linux Automotive", hwCost: 480, swCost: 1400, bootTime: 5, reliability: 0.82, tech: 0.7, description: "Open, highly customizable" },
  qnx: { label: "QNX", hwCost: 600, swCost: 2000, bootTime: 3, reliability: 0.96, tech: 0.75, description: "Mission-critical RTOS" },
  custom_ai: { label: "Custom AI OS", hwCost: 1200, swCost: 4500, bootTime: 2, reliability: 0.78, tech: 0.95, description: "Bespoke AI-native platform" },
};

export const INFO_VOICE_LEVELS: Record<InfoVoiceLevel, {
  label: string;
  swCost: number;
  accuracy: number;
  tech: number;
  description: string;
}> = {
  0: { label: "None", swCost: 0, accuracy: 0, tech: 0, description: "No voice control" },
  1: { label: "L1 Basic", swCost: 120, accuracy: 0.6, tech: 0.2, description: "Radio, volume, calls" },
  2: { label: "L2 Navigation", swCost: 300, accuracy: 0.7, tech: 0.35, description: "Nav, climate, music" },
  3: { label: "L3 Natural Lang.", swCost: 700, accuracy: 0.8, tech: 0.5, description: "Natural conversation" },
  4: { label: "L4 Offline AI", swCost: 1200, accuracy: 0.85, tech: 0.65, description: "On-device AI, no cloud needed" },
  5: { label: "L5 Cloud AI", swCost: 1800, accuracy: 0.9, tech: 0.75, description: "Cloud-powered deep inference" },
  6: { label: "L6 Multimodal", swCost: 2800, accuracy: 0.93, tech: 0.85, description: "Voice + gesture + gaze" },
  7: { label: "L7 Copilot", swCost: 4200, accuracy: 0.97, tech: 0.95, description: "Full automotive AI copilot" },
};

export const INFO_NAV_TIERS: Record<InfoNavTier, {
  label: string;
  swCost: number;
  tech: number;
  features: string[];
}> = {
  none: { label: "None", swCost: 0, tech: 0, features: [] },
  offline: { label: "Offline Maps", swCost: 200, tech: 0.3, features: ["Offline maps", "Basic routing"] },
  premium: { label: "Premium Nav", swCost: 900, tech: 0.7, features: ["Live traffic", "Satellite", "3D buildings", "Lane guidance", "Charging stations", "Fuel prices", "Speed cameras", "Parking", "Route learning"] },
};

export const INFO_CONNECTIVITY_TIERS: Record<InfoConnectivityTier, {
  label: string;
  hwCost: number;
  swCost: number;
  subscription: number; // annual per-unit
  cyberRisk: number;
  tech: number;
}> = {
  none: { label: "None", hwCost: 0, swCost: 0, subscription: 0, cyberRisk: 0, tech: 0 },
  wifi_4g: { label: "Wi-Fi + 4G LTE", hwCost: 450, swCost: 300, subscription: 120, cyberRisk: 0.3, tech: 0.4 },
  wifi_5g: { label: "Wi-Fi + 5G", hwCost: 900, swCost: 500, subscription: 240, cyberRisk: 0.45, tech: 0.65 },
  satellite: { label: "Satellite Internet", hwCost: 2400, swCost: 900, subscription: 600, cyberRisk: 0.55, tech: 0.85 },
};

export const INFO_ASSISTANT_PERSONALITIES: Record<InfoAssistantPersonality, { label: string; description: string }> = {
  professional: { label: "Professional", description: "Formal, efficient, concise" },
  friendly: { label: "Friendly", description: "Warm, conversational, upbeat" },
  luxury_concierge: { label: "Luxury Concierge", description: "Refined, anticipatory, white-glove" },
  sporty_coach: { label: "Sporty Coach", description: "Energetic, performance-focused" },
  family_helper: { label: "Family Helper", description: "Patient, safety-first, practical" },
  minimalist: { label: "Minimalist", description: "Sparse, only speaks when needed" },
  humorous: { label: "Humorous", description: "Witty, light-hearted personality" },
};

export const INFO_MUSIC_OPTIONS: { value: string; label: string; swCost: number }[] = [
  { value: "amfm", label: "AM/FM Radio", swCost: 0 },
  { value: "bluetooth", label: "Bluetooth", swCost: 50 },
  { value: "spotify", label: "Spotify", swCost: 200 },
  { value: "apple", label: "Apple Music", swCost: 200 },
  { value: "youtube", label: "YouTube Music", swCost: 200 },
  { value: "amazon", label: "Amazon Music", swCost: 200 },
];

export const INFO_VIDEO_OPTIONS: { value: string; label: string; swCost: number }[] = [
  { value: "netflix", label: "Netflix", swCost: 400 },
  { value: "youtube", label: "YouTube", swCost: 300 },
  { value: "disney", label: "Disney+", swCost: 400 },
  { value: "prime", label: "Prime Video", swCost: 400 },
];

export const INFO_GAMING_OPTIONS: { value: string; label: string; swCost: number }[] = [
  { value: "cloud", label: "Cloud Gaming", swCost: 600 },
  { value: "builtin", label: "Built-in Games", swCost: 400 },
  { value: "passenger", label: "Passenger Gaming", swCost: 500 },
];

// Feature toggle metadata: cost / weight / power / heat / tech / reliability penalty / cyber risk
export const INFO_FEATURE_COSTS = {
  // OS features
  otaUpdates: { hwCost: 40, swCost: 300, power: 2, tech: 0.05, cyber: 0.05 },
  appStore: { hwCost: 0, swCost: 600, power: 0, tech: 0.1, cyber: 0.08 },
  multiUser: { hwCost: 0, swCost: 250, power: 0, tech: 0.05, cyber: 0.03 },
  cloudBackup: { hwCost: 0, swCost: 200, power: 1, tech: 0.05, cyber: 0.1 },
  splitScreen: { hwCost: 60, swCost: 350, power: 4, tech: 0.08, cyber: 0 },
  // AI personal assistant
  driverRecognition: { hwCost: 120, swCost: 400, power: 3, tech: 0.08, cyber: 0.06 },
  faceRecognition: { hwCost: 180, swCost: 600, power: 4, tech: 0.1, cyber: 0.08 },
  voiceRecognition: { hwCost: 60, swCost: 300, power: 2, tech: 0.06, cyber: 0.02 },
  moodDetection: { hwCost: 220, swCost: 800, power: 5, tech: 0.12, cyber: 0.05 },
  calendarSync: { hwCost: 0, swCost: 200, power: 1, tech: 0.05, cyber: 0.06 },
  emailSummary: { hwCost: 0, swCost: 350, power: 1, tech: 0.06, cyber: 0.08 },
  smartReminders: { hwCost: 0, swCost: 250, power: 1, tech: 0.05, cyber: 0.04 },
  predictiveNav: { hwCost: 0, swCost: 500, power: 2, tech: 0.1, cyber: 0.05 },
  drivingCoach: { hwCost: 0, swCost: 450, power: 2, tech: 0.08, cyber: 0.02 },
  vehicleDiagnostics: { hwCost: 80, swCost: 600, power: 2, tech: 0.1, cyber: 0.06 },
  serviceAdvisor: { hwCost: 0, swCost: 400, power: 1, tech: 0.08, cyber: 0.05 },
  chargingPlanner: { hwCost: 0, swCost: 350, power: 1, tech: 0.07, cyber: 0.03 },
  fuelStopPlanner: { hwCost: 0, swCost: 250, power: 1, tech: 0.05, cyber: 0.03 },
  smartParking: { hwCost: 100, swCost: 450, power: 3, tech: 0.09, cyber: 0.07 },
  // Smart cabin
  smartCabin: { hwCost: 300, swCost: 900, power: 6, tech: 0.15, cyber: 0.04 },
  // Smartphone integration
  androidAuto: { hwCost: 0, swCost: 150, power: 1, tech: 0.04, cyber: 0.03 },
  carPlay: { hwCost: 0, swCost: 150, power: 1, tech: 0.04, cyber: 0.03 },
  wirelessCarPlay: { hwCost: 90, swCost: 200, power: 2, tech: 0.06, cyber: 0.04 },
  wirelessAndroidAuto: { hwCost: 90, swCost: 200, power: 2, tech: 0.06, cyber: 0.04 },
  nfcPairing: { hwCost: 60, swCost: 120, power: 1, tech: 0.04, cyber: 0.03 },
  phoneKey: { hwCost: 180, swCost: 500, power: 2, tech: 0.1, cyber: 0.12 },
  smartwatchControl: { hwCost: 0, swCost: 300, power: 1, tech: 0.06, cyber: 0.05 },
  // AI driving coach / predictive maintenance / perf advisor
  drivingCoachReport: { hwCost: 0, swCost: 400, power: 2, tech: 0.08, cyber: 0.03 },
  predictiveMaintenance: { hwCost: 120, swCost: 700, power: 3, tech: 0.12, cyber: 0.05 },
  performanceAdvisor: { hwCost: 0, swCost: 650, power: 2, tech: 0.1, cyber: 0.04 },
  // V2X / cloud
  v2v: { hwCost: 400, swCost: 500, power: 5, tech: 0.12, cyber: 0.15 },
  v2i: { hwCost: 350, swCost: 450, power: 4, tech: 0.1, cyber: 0.12 },
  cloudSync: { hwCost: 0, swCost: 350, power: 2, tech: 0.08, cyber: 0.1 },
  // Interior experience
  dynamicLighting: { hwCost: 120, swCost: 200, power: 4, tech: 0.06, cyber: 0.02 },
  musicSyncLighting: { hwCost: 80, swCost: 250, power: 3, tech: 0.06, cyber: 0.01 },
  welcomeShow: { hwCost: 60, swCost: 180, power: 2, tech: 0.05, cyber: 0.01 },
  goodbyeAnimation: { hwCost: 40, swCost: 120, power: 1, tech: 0.04, cyber: 0.01 },
  personalizedStartup: { hwCost: 0, swCost: 220, power: 1, tech: 0.05, cyber: 0.03 },
} as const;

export const INFO_AI_SAFETY_COSTS = {
  fatigueMonitor: { hwCost: 180, swCost: 400, power: 3, tech: 0.1, cyber: 0.04 },
  eyeTracking: { hwCost: 260, swCost: 550, power: 4, tech: 0.12, cyber: 0.05 },
  cabinCamera: { hwCost: 140, swCost: 300, power: 3, tech: 0.08, cyber: 0.08 },
  childDetection: { hwCost: 90, swCost: 250, power: 2, tech: 0.07, cyber: 0.04 },
  petDetection: { hwCost: 90, swCost: 200, power: 2, tech: 0.06, cyber: 0.04 },
  emergencyAssist: { hwCost: 200, swCost: 450, power: 3, tech: 0.1, cyber: 0.06 },
  autoAccidentCall: { hwCost: 160, swCost: 350, power: 2, tech: 0.08, cyber: 0.05 },
  healthEmergency: { hwCost: 320, swCost: 600, power: 4, tech: 0.12, cyber: 0.08 },
} as const;

export const INFO_REMOTE_APP_COSTS = {
  lockUnlock: { hwCost: 80, swCost: 180, power: 1, tech: 0.05, cyber: 0.08 },
  startEngine: { hwCost: 60, swCost: 200, power: 1, tech: 0.05, cyber: 0.1 },
  climateControl: { hwCost: 40, swCost: 160, power: 1, tech: 0.04, cyber: 0.06 },
  locateVehicle: { hwCost: 60, swCost: 150, power: 1, tech: 0.04, cyber: 0.05 },
  openTrunk: { hwCost: 40, swCost: 100, power: 1, tech: 0.03, cyber: 0.06 },
  windowControl: { hwCost: 60, swCost: 150, power: 1, tech: 0.04, cyber: 0.07 },
  chargeScheduling: { hwCost: 0, swCost: 200, power: 1, tech: 0.05, cyber: 0.04 },
  otaUpdates: { hwCost: 0, swCost: 250, power: 1, tech: 0.05, cyber: 0.09 },
  digitalKeySharing: { hwCost: 120, swCost: 300, power: 1, tech: 0.08, cyber: 0.12 },
} as const;

export const INFO_AI_SECURITY_COSTS = {
  faceUnlock: { hwCost: 180, swCost: 500, power: 3, tech: 0.1, cyber: -0.08 },
  fingerprint: { hwCost: 120, swCost: 300, power: 2, tech: 0.07, cyber: -0.06 },
  voiceAuth: { hwCost: 60, swCost: 250, power: 1, tech: 0.06, cyber: -0.04 },
  pin: { hwCost: 20, swCost: 80, power: 1, tech: 0.02, cyber: -0.03 },
  phoneKeyAuth: { hwCost: 100, swCost: 280, power: 1, tech: 0.07, cyber: -0.05 },
  theftDetection: { hwCost: 150, swCost: 400, power: 2, tech: 0.09, cyber: -0.1 },
  remoteImmobilizer: { hwCost: 180, swCost: 450, power: 2, tech: 0.1, cyber: -0.12 },
  geofencing: { hwCost: 0, swCost: 300, power: 1, tech: 0.07, cyber: -0.06 },
} as const;

export const INFO_PRODUCTIVITY_COSTS = {
  videoConferencing: { hwCost: 220, swCost: 600, power: 8, tech: 0.12, cyber: 0.1 },
  calendarIntegration: { hwCost: 0, swCost: 200, power: 1, tech: 0.05, cyber: 0.05 },
  emailAssistant: { hwCost: 0, swCost: 350, power: 1, tech: 0.06, cyber: 0.08 },
  voiceNotes: { hwCost: 40, swCost: 150, power: 1, tech: 0.04, cyber: 0.02 },
  documentViewer: { hwCost: 0, swCost: 200, power: 1, tech: 0.04, cyber: 0.03 },
  aiMeetingSummaries: { hwCost: 0, swCost: 500, power: 2, tech: 0.1, cyber: 0.06 },
} as const;

export function defaultInfotainment(): InfotainmentConfig {
  return {
    clusterLevel: 2,
    displayConfig: "touch_7",
    displayTech: "ips",
    osTier: "android_auto",
    otaUpdates: true, appStore: false, multiUser: false, cloudBackup: false, splitScreen: false,
    voiceLevel: 2,
    aiChatbot: false,
    connectivityTier: "advanced",
    connExtras: { bluetooth: true, wifi: true, wirelessCharging: false, nfc: false, usbC: true, hdmi: false },
    connectivity: "wifi_4g",
    v2v: false, v2i: false, cloudSync: false,
    audioTier: "mid",
    climateTier: "dual",
    climateExtras: { rearAc: false, airPurifier: false, fragrance: false, humidityControl: false, ionizer: false },
    seatTier: "mid",
    seatFeatures: { heated: false, ventilated: false, massage: false, memory: false, reclining: false, legRest: false, zeroGravity: false },
    lightingTier: "white",
    ambientLightColors: 1,
    adasLevel: 1,
    parking: { rearSensors: true, frontSensors: false, reverseCamera: true, camera360: false, autoParking: false, remoteParking: false, smartphoneParking: false },
    keyType: "remote",
    hudType: "none",
    dashMaterial: "soft_touch",
    roofType: "metal",
    convenience: { rainSensing: false, autoHeadlights: true, autoDimming: false, powerTailgate: false, handsFreeTailgate: false, softClose: false, vacuumDoors: false, poweredFrunk: false, digitalRearView: false },
    luxuryPackage: { refrigerator: false, champagneCooler: false, coffeeMaker: false, foldOutTables: false, rearEntertainment: false, individualTablets: false, wirelessHeadphones: false, businessConference: false },
    aiFeatures: { voiceAssistant: false, aiRoutePlanning: false, moodDetection: false, faceRecognition: false, healthMonitoring: false, fatigueDetection: false, gestureControl: false, cabinPersonalization: false },
    safetyElectronics: { abs: true, ebd: true, esc: true, tractionControl: true, blindSpot: false, collisionWarning: false, aeb: false, crossTraffic: false, nightVision: false, thermalCamera: false, driverMonitoring: false },
    aiPersonal: {
      driverRecognition: false, faceRecognition: false, voiceRecognition: true,
      moodDetection: false, calendarSync: false, emailSummary: false, smartReminders: false,
      predictiveNav: false, drivingCoach: false, vehicleDiagnostics: false,
      serviceAdvisor: false, chargingPlanner: false, fuelStopPlanner: false, smartParking: false,
    },
    smartCabin: false,
    navTier: "offline",
    musicStreaming: ["amfm", "bluetooth"],
    videoStreaming: [],
    gaming: [],
    androidAuto: true, carPlay: true, wirelessCarPlay: false, wirelessAndroidAuto: false,
    nfcPairing: false, phoneKey: false, smartwatchControl: false,
    aiSafety: {
      fatigueMonitor: false, eyeTracking: false, cabinCamera: false,
      childDetection: false, petDetection: false, emergencyAssist: true,
      autoAccidentCall: false, healthEmergency: false,
    },
    drivingCoach: false,
    predictiveMaintenance: false,
    remoteApp: {
      lockUnlock: true, startEngine: false, climateControl: false, locateVehicle: true,
      openTrunk: false, windowControl: false, chargeScheduling: false,
      otaUpdates: false, digitalKeySharing: false,
    },
    aiSecurity: {
      faceUnlock: false, fingerprint: false, voiceAuth: false, pin: true,
      phoneKeyAuth: false, theftDetection: false, remoteImmobilizer: false, geofencing: false,
    },
    dynamicLighting: false, musicSyncLighting: false, welcomeShow: false,
    goodbyeAnimation: false, personalizedStartup: false,
    productivity: {
      videoConferencing: false, calendarIntegration: false, emailAssistant: false,
      voiceNotes: false, documentViewer: false, aiMeetingSummaries: false,
    },
    performanceAdvisor: false,
    assistantPersonality: "professional",
  };
}

export function defaultDesign(): VehicleDesign {
  return {
    name: "Apex Valkyrie V12 Hybrid 1000",
    description: "6.4L 9,200 RPM V12 Combustion Engine + 180kW Solid-State Hybrid Drive (1,000 HP Total Output)",
    engine: defaultEngine(),
    vehicle: defaultVehicle(),
    manufacturing: defaultManufacturing(),
    infotainment: defaultInfotainment(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export { clamp };
