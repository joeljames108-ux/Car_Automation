// ===================================================================
// R&D SYSTEM — STATIC DATA
// ===================================================================
import type {
  BuildingId, BuildingState, Engineer, ResearchBudget, SkunkworksProject,
  TechTreeId, TechnologyId, RDState,
} from "./rdTypes";

// ---------- Buildings ----------

export interface BuildingDef {
  id: BuildingId;
  name: string;
  icon: string;     // lucide name reference (rendered in component)
  description: string;
  tree: TechTreeId;
}

export const BUILDINGS: BuildingDef[] = [
  { id: "engine_lab",          name: "Engine Research Lab",        icon: "Cog",            description: "Combustion, forced induction, valvetrain R&D", tree: "engine" },
  { id: "aero_center",         name: "Aerodynamics Center",        icon: "Wind",           description: "Wind tunnel + CFD development",               tree: "aerodynamics" },
  { id: "materials_lab",       name: "Materials Science Lab",      icon: "Layers",         description: "Lightweight & high-strength materials",       tree: "materials" },
  { id: "electronics_lab",     name: "Electronics Lab",            icon: "CircuitBoard",   description: "ECUs, sensors, driver assists",               tree: "electronics" },
  { id: "battery_lab",         name: "Battery & EV Lab",           icon: "BatteryCharging",description: "Cell chemistry, pack architecture",           tree: "battery" },
  { id: "manufacturing_center",name: "Manufacturing Innovation",   icon: "Factory",        description: "Production process improvement",              tree: "manufacturing" },
  { id: "safety_center",       name: "Safety Research Center",     icon: "ShieldCheck",    description: "Crash, structural, active safety",            tree: "safety" },
  { id: "ai_software_lab",     name: "AI & Software Lab",          icon: "BrainCircuit",   description: "AI systems, OTA, autonomous tech",             tree: "ai" },
  { id: "nvh_lab",             name: "NVH Lab",                    icon: "Volume2",        description: "Noise, vibration, harshness",                 tree: "manufacturing" },
  { id: "testing_center",      name: "Testing & Validation",       icon: "FlaskConical",   description: "Prototyping + prediction accuracy",           tree: "safety" },
];

export const BUILDING_BASE_COST = 8_000_000; // per level
export const BUILDING_BASE_MONTHS = 6;       // per level

export function buildingUpgradeCost(currentLevel: number): number {
  return Math.round(BUILDING_BASE_COST * Math.pow(1.6, currentLevel));
}
export function buildingUpgradeMonths(currentLevel: number): number {
  return Math.max(2, Math.round(BUILDING_BASE_MONTHS * Math.pow(1.15, currentLevel)));
}

export function initialBuildings(): Record<BuildingId, BuildingState> {
  const out = {} as Record<BuildingId, BuildingState>;
  for (const b of BUILDINGS) {
    out[b.id] = {
      id: b.id, level: 1,
      upgradeCost: buildingUpgradeCost(1),
      upgradeMonths: buildingUpgradeMonths(1),
      upgradeMonthsLeft: 0,
    };
  }
  return out;
}

// ---------- Technology Trees ----------

export interface TechDef {
  id: TechnologyId;
  tree: TechTreeId;
  name: string;
  description: string;
  cost: number;            // research project cost $
  months: number;          // research project duration
  scientists: number;      // min scientists required
  buildingLevel: number;   // min building level required
  failureRisk: number;     // 0-1
  requires: TechnologyId[];// prerequisite techs
  ekCost: number;          // engineering knowledge required to unlock
  // Effect applied to sim when unlocked (described for UI; engine applies)
  effect: { stat: string; magnitude: number; label: string }[];
}

export const TECHNOLOGIES: TechDef[] = [
  // ===== ENGINE =====
  { id: "eng_combustion", tree: "engine", name: "Advanced Combustion Chamber", description: "Optimized chamber geometry for efficient burn", cost: 30_000_000, months: 14, scientists: 15, buildingLevel: 2, failureRisk: 0.08, requires: [], ekCost: 50, effect: [{ stat: "efficiency", magnitude: 0.03, label: "+3% thermal efficiency" }] },
  { id: "eng_vvt", tree: "engine", name: "Variable Valve Timing", description: "Cam phasing adapts to RPM for broader power band", cost: 45_000_000, months: 16, scientists: 20, buildingLevel: 3, failureRisk: 0.1, requires: ["eng_combustion"], ekCost: 80, effect: [{ stat: "power", magnitude: 0.05, label: "+5% power" }, { stat: "efficiency", magnitude: 0.02, label: "+2% efficiency" }] },
  { id: "eng_vcr", tree: "engine", name: "Variable Compression Ratio", description: "Compression adjusts to load for efficiency + power", cost: 70_000_000, months: 22, scientists: 28, buildingLevel: 5, failureRisk: 0.18, requires: ["eng_vvt"], ekCost: 140, effect: [{ stat: "efficiency", magnitude: 0.06, label: "+6% efficiency" }, { stat: "power", magnitude: 0.04, label: "+4% power" }] },
  { id: "eng_direct_injection", tree: "engine", name: "Direct Injection", description: "Fuel injected directly into cylinder", cost: 35_000_000, months: 12, scientists: 14, buildingLevel: 2, failureRisk: 0.06, requires: ["eng_combustion"], ekCost: 60, effect: [{ stat: "efficiency", magnitude: 0.04, label: "+4% efficiency" }, { stat: "power", magnitude: 0.03, label: "+3% power" }] },
  { id: "eng_plasma_ignition", tree: "engine", name: "Plasma Ignition", description: "Plasma-assisted combustion for lean burn", cost: 85_000_000, months: 24, scientists: 30, buildingLevel: 6, failureRisk: 0.22, requires: ["eng_direct_injection", "eng_vvt"], ekCost: 200, effect: [{ stat: "efficiency", magnitude: 0.08, label: "+8% efficiency" }] },
  { id: "eng_lightweight_pistons", tree: "engine", name: "Lightweight Pistons", description: "Forged aluminum reduces reciprocating mass", cost: 25_000_000, months: 10, scientists: 12, buildingLevel: 2, failureRisk: 0.05, requires: [], ekCost: 40, effect: [{ stat: "weight", magnitude: 0.04, label: "-4% engine weight" }, { stat: "reliability", magnitude: 0.02, label: "+2% reliability" }] },
  { id: "eng_titanium_valves", tree: "engine", name: "Titanium Valves", description: "Ti valves allow higher redline", cost: 40_000_000, months: 14, scientists: 16, buildingLevel: 4, failureRisk: 0.12, requires: ["eng_lightweight_pistons"], ekCost: 90, effect: [{ stat: "power", magnitude: 0.06, label: "+6% power (higher redline)" }] },
  { id: "eng_dry_sump", tree: "engine", name: "Dry Sump Lubrication", description: "External oil pump for low CG + high-G oiling", cost: 28_000_000, months: 11, scientists: 12, buildingLevel: 3, failureRisk: 0.07, requires: [], ekCost: 55, effect: [{ stat: "reliability", magnitude: 0.03, label: "+3% reliability" }, { stat: "weight", magnitude: 0.01, label: "Lower CG" }] },
  { id: "eng_advanced_turbo", tree: "engine", name: "Advanced Turbochargers", description: "Twin-scroll + electric assist compressors", cost: 60_000_000, months: 20, scientists: 25, buildingLevel: 5, failureRisk: 0.16, requires: ["eng_direct_injection"], ekCost: 130, effect: [{ stat: "power", magnitude: 0.12, label: "+12% power" }, { stat: "lag", magnitude: -0.3, label: "-30% turbo lag" }] },
  { id: "eng_ceramic_bearings", tree: "engine", name: "Ceramic Bearings", description: "Silicon-nitride bearings reduce friction", cost: 32_000_000, months: 13, scientists: 14, buildingLevel: 4, failureRisk: 0.1, requires: ["eng_lightweight_pistons"], ekCost: 75, effect: [{ stat: "efficiency", magnitude: 0.02, label: "+2% efficiency" }, { stat: "reliability", magnitude: 0.02, label: "+2% reliability" }] },
  { id: "eng_water_injection", tree: "engine", name: "Water Injection", description: "Cools intake charge for higher boost", cost: 38_000_000, months: 15, scientists: 16, buildingLevel: 4, failureRisk: 0.12, requires: ["eng_advanced_turbo"], ekCost: 85, effect: [{ stat: "power", magnitude: 0.08, label: "+8% power" }] },
  { id: "eng_freevalve", tree: "engine", name: "Free-Valve Technology", description: "Pneumatic camless valvetrain — full electronic control", cost: 120_000_000, months: 30, scientists: 35, buildingLevel: 8, failureRisk: 0.28, requires: ["eng_vvt", "eng_titanium_valves", "eng_plasma_ignition"], ekCost: 320, effect: [{ stat: "power", magnitude: 0.15, label: "+15% power" }, { stat: "efficiency", magnitude: 0.1, label: "+10% efficiency" }] },

  // ===== MATERIALS =====
  { id: "mat_mild_steel", tree: "materials", name: "Mild Steel (Baseline)", description: "Starting material — already available", cost: 0, months: 0, scientists: 0, buildingLevel: 1, failureRisk: 0, requires: [], ekCost: 0, effect: [] },
  { id: "mat_hss", tree: "materials", name: "High-Strength Steel", description: "Stronger than mild steel, similar weight", cost: 18_000_000, months: 9, scientists: 10, buildingLevel: 2, failureRisk: 0.05, requires: [], ekCost: 35, effect: [{ stat: "weight", magnitude: 0.03, label: "-3% weight" }, { stat: "safety", magnitude: 0.02, label: "+2% safety" }] },
  { id: "mat_aluminum", tree: "materials", name: "Aluminum", description: "Lightweight, corrosion-resistant", cost: 30_000_000, months: 12, scientists: 14, buildingLevel: 3, failureRisk: 0.06, requires: ["mat_hss"], ekCost: 65, effect: [{ stat: "weight", magnitude: 0.12, label: "-12% weight" }] },
  { id: "mat_magnesium", tree: "materials", name: "Magnesium", description: "Ultra-light, expensive, corrosion-prone", cost: 55_000_000, months: 18, scientists: 22, buildingLevel: 5, failureRisk: 0.14, requires: ["mat_aluminum"], ekCost: 120, effect: [{ stat: "weight", magnitude: 0.22, label: "-22% weight" }, { stat: "cost", magnitude: 0.05, label: "+5% mfg cost" }] },
  { id: "mat_titanium", tree: "materials", name: "Titanium", description: "High strength-to-weight, premium cost", cost: 75_000_000, months: 22, scientists: 26, buildingLevel: 6, failureRisk: 0.16, requires: ["mat_aluminum"], ekCost: 170, effect: [{ stat: "weight", magnitude: 0.18, label: "-18% weight" }, { stat: "safety", magnitude: 0.04, label: "+4% safety" }, { stat: "cost", magnitude: 0.12, label: "+12% mfg cost" }] },
  { id: "mat_carbon_fiber", tree: "materials", name: "Carbon Fiber", description: "Aerospace-grade composite monocoque", cost: 90_000_000, months: 24, scientists: 30, buildingLevel: 7, failureRisk: 0.18, requires: ["mat_aluminum"], ekCost: 220, effect: [{ stat: "weight", magnitude: 0.35, label: "-35% weight" }, { stat: "safety", magnitude: 0.05, label: "+5% safety" }, { stat: "cost", magnitude: 0.2, label: "+20% mfg cost" }] },
  { id: "mat_graphene", tree: "materials", name: "Graphene Composites", description: "Next-gen carbon lattice — extraordinary strength", cost: 150_000_000, months: 32, scientists: 38, buildingLevel: 9, failureRisk: 0.3, requires: ["mat_carbon_fiber", "mat_titanium"], ekCost: 400, effect: [{ stat: "weight", magnitude: 0.45, label: "-45% weight" }, { stat: "safety", magnitude: 0.08, label: "+8% safety" }] },
  { id: "mat_ceramic_comp", tree: "materials", name: "Ceramic Composites", description: "Heat-resistant ceramic matrix for brakes + exhaust", cost: 65_000_000, months: 20, scientists: 24, buildingLevel: 6, failureRisk: 0.15, requires: ["mat_carbon_fiber"], ekCost: 160, effect: [{ stat: "weight", magnitude: 0.08, label: "-8% weight" }, { stat: "reliability", magnitude: 0.03, label: "+3% reliability" }] },
  { id: "mat_3d_print", tree: "materials", name: "3D-Printed Metals", description: "Additive manufacturing for complex geometries", cost: 50_000_000, months: 16, scientists: 20, buildingLevel: 5, failureRisk: 0.12, requires: ["mat_titanium"], ekCost: 110, effect: [{ stat: "weight", magnitude: 0.1, label: "-10% weight" }, { stat: "cost", magnitude: -0.05, label: "-5% mfg cost (complex parts)" }] },

  // ===== AERODYNAMICS =====
  { id: "aero_active_wing", tree: "aerodynamics", name: "Active Rear Wing", description: "Adjustable rear wing angle for drag vs downforce", cost: 35_000_000, months: 14, scientists: 16, buildingLevel: 3, failureRisk: 0.08, requires: [], ekCost: 70, effect: [{ stat: "downforce", magnitude: 0.2, label: "+20% downforce" }, { stat: "drag", magnitude: -0.05, label: "-5% drag (DRS mode)" }] },
  { id: "aero_active_splitter", tree: "aerodynamics", name: "Active Front Splitter", description: "Variable front downforce", cost: 40_000_000, months: 15, scientists: 18, buildingLevel: 4, failureRisk: 0.1, requires: ["aero_active_wing"], ekCost: 90, effect: [{ stat: "downforce", magnitude: 0.15, label: "+15% front downforce" }] },
  { id: "aero_ground_effect", tree: "aerodynamics", name: "Ground Effect", description: "Venturi underbody for massive downforce", cost: 80_000_000, months: 24, scientists: 28, buildingLevel: 6, failureRisk: 0.2, requires: ["aero_active_splitter"], ekCost: 200, effect: [{ stat: "downforce", magnitude: 0.4, label: "+40% downforce" }, { stat: "drag", magnitude: -0.03, label: "-3% drag" }] },
  { id: "aero_grille_shutters", tree: "aerodynamics", name: "Active Grille Shutters", description: "Close grille for aero when cooling allows", cost: 15_000_000, months: 8, scientists: 8, buildingLevel: 2, failureRisk: 0.04, requires: [], ekCost: 30, effect: [{ stat: "drag", magnitude: -0.04, label: "-4% drag" }] },
  { id: "aero_underbody_tunnels", tree: "aerodynamics", name: "Underbody Tunnels", description: "Channel airflow under car for downforce", cost: 55_000_000, months: 18, scientists: 22, buildingLevel: 5, failureRisk: 0.14, requires: ["aero_ground_effect"], ekCost: 140, effect: [{ stat: "downforce", magnitude: 0.25, label: "+25% downforce" }] },
  { id: "aero_active_suspension", tree: "aerodynamics", name: "Active Suspension", description: "Ride height adjusts for aero + handling", cost: 70_000_000, months: 22, scientists: 26, buildingLevel: 6, failureRisk: 0.18, requires: ["aero_ground_effect"], ekCost: 180, effect: [{ stat: "downforce", magnitude: 0.1, label: "+10% downforce (stable platform)" }] },
  { id: "aero_drs", tree: "aerodynamics", name: "DRS", description: "Drag Reduction System — opens wing on straights", cost: 45_000_000, months: 16, scientists: 18, buildingLevel: 4, failureRisk: 0.1, requires: ["aero_active_wing"], ekCost: 100, effect: [{ stat: "drag", magnitude: -0.12, label: "-12% drag (straight)" }] },
  { id: "aero_adaptive_ride", tree: "aerodynamics", name: "Adaptive Ride Height", description: "GPS + speed-based ride height mapping", cost: 50_000_000, months: 18, scientists: 20, buildingLevel: 5, failureRisk: 0.12, requires: ["aero_active_suspension"], ekCost: 120, effect: [{ stat: "drag", magnitude: -0.05, label: "-5% drag" }, { stat: "downforce", magnitude: 0.08, label: "+8% downforce" }] },

  // ===== ELECTRONICS =====
  { id: "elec_digital_cluster", tree: "electronics", name: "Digital Cluster", description: "Replaces analog gauges with configurable display", cost: 20_000_000, months: 10, scientists: 12, buildingLevel: 2, failureRisk: 0.05, requires: [], ekCost: 40, effect: [{ stat: "techScore", magnitude: 0.1, label: "+10% tech score" }] },
  { id: "elec_hud", tree: "electronics", name: "Head-Up Display", description: "Projects info onto windshield", cost: 28_000_000, months: 12, scientists: 14, buildingLevel: 3, failureRisk: 0.07, requires: ["elec_digital_cluster"], ekCost: 65, effect: [{ stat: "techScore", magnitude: 0.08, label: "+8% tech score" }] },
  { id: "elec_ai_assistant", tree: "electronics", name: "AI Assistant", description: "On-board AI voice assistant", cost: 45_000_000, months: 16, scientists: 20, buildingLevel: 4, failureRisk: 0.1, requires: ["elec_digital_cluster"], ekCost: 100, effect: [{ stat: "techScore", magnitude: 0.15, label: "+15% tech score" }] },
  { id: "elec_autonomous", tree: "electronics", name: "Autonomous Driving", description: "Level 3+ self-driving capability", cost: 110_000_000, months: 30, scientists: 35, buildingLevel: 7, failureRisk: 0.25, requires: ["elec_ai_assistant", "elec_hud"], ekCost: 300, effect: [{ stat: "techScore", magnitude: 0.3, label: "+30% tech score" }, { stat: "safety", magnitude: 0.1, label: "+10% safety" }] },
  { id: "elec_gesture", tree: "electronics", name: "Gesture Control", description: "Hand-gesture infotainment input", cost: 35_000_000, months: 14, scientists: 16, buildingLevel: 4, failureRisk: 0.1, requires: ["elec_digital_cluster"], ekCost: 80, effect: [{ stat: "techScore", magnitude: 0.08, label: "+8% tech score" }] },
  { id: "elec_ota", tree: "electronics", name: "OTA Updates", description: "Over-the-air firmware updates", cost: 30_000_000, months: 12, scientists: 16, buildingLevel: 3, failureRisk: 0.08, requires: [], ekCost: 60, effect: [{ stat: "techScore", magnitude: 0.1, label: "+10% tech score" }, { stat: "reliability", magnitude: 0.02, label: "+2% reliability" }] },
  { id: "elec_wireless_charge", tree: "electronics", name: "Wireless Charging", description: "Inductive charging pad", cost: 22_000_000, months: 10, scientists: 10, buildingLevel: 2, failureRisk: 0.05, requires: [], ekCost: 45, effect: [{ stat: "techScore", magnitude: 0.05, label: "+5% tech score" }] },
  { id: "elec_ai_diagnostics", tree: "electronics", name: "AI Diagnostics", description: "AI predicts failures before they happen", cost: 55_000_000, months: 18, scientists: 22, buildingLevel: 5, failureRisk: 0.12, requires: ["elec_ota", "elec_ai_assistant"], ekCost: 130, effect: [{ stat: "reliability", magnitude: 0.05, label: "+5% reliability" }, { stat: "techScore", magnitude: 0.1, label: "+10% tech score" }] },
  { id: "elec_smart_suspension", tree: "electronics", name: "Smart Suspension", description: "AI-optimized adaptive damping", cost: 60_000_000, months: 20, scientists: 24, buildingLevel: 5, failureRisk: 0.14, requires: ["elec_ai_diagnostics"], ekCost: 150, effect: [{ stat: "safety", magnitude: 0.04, label: "+4% safety" }, { stat: "techScore", magnitude: 0.08, label: "+8% tech score" }] },

  // ===== MANUFACTURING =====
  { id: "mfg_robotic_welding", tree: "manufacturing", name: "Robotic Welding", description: "Automated welding for consistency", cost: 25_000_000, months: 10, scientists: 10, buildingLevel: 2, failureRisk: 0.05, requires: [], ekCost: 45, effect: [{ stat: "cost", magnitude: -0.04, label: "-4% mfg cost" }, { stat: "defect", magnitude: -0.1, label: "-10% defect rate" }] },
  { id: "mfg_laser_cutting", tree: "manufacturing", name: "Laser Cutting", description: "Precision laser cutting for body panels", cost: 22_000_000, months: 9, scientists: 10, buildingLevel: 2, failureRisk: 0.05, requires: [], ekCost: 40, effect: [{ stat: "cost", magnitude: -0.03, label: "-3% mfg cost" }, { stat: "assembly", magnitude: -0.05, label: "-5% assembly time" }] },
  { id: "mfg_ai_inspection", tree: "manufacturing", name: "AI Inspection", description: "Computer-vision quality inspection", cost: 35_000_000, months: 14, scientists: 16, buildingLevel: 4, failureRisk: 0.08, requires: ["mfg_robotic_welding"], ekCost: 85, effect: [{ stat: "defect", magnitude: -0.25, label: "-25% defect rate" }] },
  { id: "mfg_auto_paint", tree: "manufacturing", name: "Automated Paint Shop", description: "Robotic painting for perfect finish", cost: 30_000_000, months: 12, scientists: 12, buildingLevel: 3, failureRisk: 0.06, requires: [], ekCost: 60, effect: [{ stat: "cost", magnitude: -0.03, label: "-3% mfg cost" }, { stat: "assembly", magnitude: -0.04, label: "-4% assembly time" }] },
  { id: "mfg_digital_twin", tree: "manufacturing", name: "Digital Twin Factory", description: "Virtual factory simulation for optimization", cost: 65_000_000, months: 20, scientists: 24, buildingLevel: 6, failureRisk: 0.14, requires: ["mfg_ai_inspection"], ekCost: 160, effect: [{ stat: "cost", magnitude: -0.08, label: "-8% mfg cost" }, { stat: "assembly", magnitude: -0.12, label: "-12% assembly time" }] },
  { id: "mfg_predictive_maint", tree: "manufacturing", name: "Predictive Maintenance", description: "AI predicts equipment failures in factory", cost: 40_000_000, months: 14, scientists: 18, buildingLevel: 4, failureRisk: 0.1, requires: ["mfg_ai_inspection"], ekCost: 95, effect: [{ stat: "cost", magnitude: -0.04, label: "-4% mfg cost (downtime)" }] },
  { id: "mfg_modular", tree: "manufacturing", name: "Modular Production", description: "Flexible platform for multiple models", cost: 55_000_000, months: 18, scientists: 22, buildingLevel: 5, failureRisk: 0.12, requires: ["mfg_robotic_welding"], ekCost: 130, effect: [{ stat: "cost", magnitude: -0.06, label: "-6% mfg cost" }, { stat: "assembly", magnitude: -0.08, label: "-8% assembly time" }] },
  { id: "mfg_jit", tree: "manufacturing", name: "Just-in-Time Manufacturing", description: "Lean inventory reduces holding costs", cost: 32_000_000, months: 12, scientists: 14, buildingLevel: 3, failureRisk: 0.08, requires: ["mfg_modular"], ekCost: 75, effect: [{ stat: "cost", magnitude: -0.05, label: "-5% mfg cost" }] },

  // ===== BATTERY =====
  { id: "bat_lfp", tree: "battery", name: "LFP Chemistry", description: "Lithium iron phosphate — safe, long-life", cost: 40_000_000, months: 16, scientists: 18, buildingLevel: 3, failureRisk: 0.08, requires: [], ekCost: 80, effect: [{ stat: "energyDensity", magnitude: 0.1, label: "+10% energy density" }, { stat: "reliability", magnitude: 0.03, label: "+3% reliability" }] },
  { id: "bat_nmc", tree: "battery", name: "NMC Chemistry", description: "Nickel manganese cobalt — high energy", cost: 55_000_000, months: 18, scientists: 22, buildingLevel: 4, failureRisk: 0.1, requires: ["bat_lfp"], ekCost: 110, effect: [{ stat: "energyDensity", magnitude: 0.25, label: "+25% energy density" }] },
  { id: "bat_solid_state", tree: "battery", name: "Solid-State", description: "Solid electrolyte — safer, denser, faster", cost: 130_000_000, months: 30, scientists: 35, buildingLevel: 8, failureRisk: 0.28, requires: ["bat_nmc"], ekCost: 350, effect: [{ stat: "energyDensity", magnitude: 0.5, label: "+50% energy density" }, { stat: "chargingSpeed", magnitude: 0.4, label: "+40% charging speed" }, { stat: "reliability", magnitude: 0.05, label: "+5% reliability" }] },
  { id: "bat_sodium", tree: "battery", name: "Sodium-Ion", description: "Low-cost sodium chemistry", cost: 45_000_000, months: 16, scientists: 18, buildingLevel: 4, failureRisk: 0.1, requires: ["bat_lfp"], ekCost: 90, effect: [{ stat: "energyDensity", magnitude: 0.08, label: "+8% energy density" }, { stat: "cost", magnitude: -0.1, label: "-10% battery cost" }] },
  { id: "bat_graphene", tree: "battery", name: "Graphene Battery", description: "Graphene-enhanced — ultra-fast charging", cost: 160_000_000, months: 34, scientists: 38, buildingLevel: 9, failureRisk: 0.32, requires: ["bat_solid_state"], ekCost: 420, effect: [{ stat: "energyDensity", magnitude: 0.6, label: "+60% energy density" }, { stat: "chargingSpeed", magnitude: 0.7, label: "+70% charging speed" }] },

  // ===== SAFETY =====
  { id: "saf_advanced_crumple", tree: "safety", name: "Advanced Crumple Zones", description: "Engineered impact absorption geometry", cost: 30_000_000, months: 12, scientists: 14, buildingLevel: 3, failureRisk: 0.06, requires: [], ekCost: 60, effect: [{ stat: "safety", magnitude: 0.06, label: "+6% safety" }] },
  { id: "saf_side_impact", tree: "safety", name: "Side Impact Beams", description: "Reinforced door structures", cost: 22_000_000, months: 10, scientists: 10, buildingLevel: 2, failureRisk: 0.05, requires: [], ekCost: 40, effect: [{ stat: "safety", magnitude: 0.04, label: "+4% safety" }] },
  { id: "saf_active_safety", tree: "safety", name: "Active Safety Suite", description: "AEB, lane keep, blind spot", cost: 50_000_000, months: 18, scientists: 22, buildingLevel: 5, failureRisk: 0.12, requires: ["saf_advanced_crumple", "elec_ota"], ekCost: 120, effect: [{ stat: "safety", magnitude: 0.12, label: "+12% safety" }] },
  { id: "saf_airbag_matrix", tree: "safety", name: "Airbag Matrix", description: "Multi-stage airbags all around", cost: 35_000_000, months: 14, scientists: 16, buildingLevel: 4, failureRisk: 0.08, requires: ["saf_side_impact"], ekCost: 80, effect: [{ stat: "safety", magnitude: 0.08, label: "+8% safety" }] },
  { id: "saf_predictive_crash", tree: "safety", name: "Predictive Crash Systems", description: "AI pre-crash preparation", cost: 70_000_000, months: 22, scientists: 26, buildingLevel: 6, failureRisk: 0.16, requires: ["saf_active_safety", "elec_ai_diagnostics"], ekCost: 180, effect: [{ stat: "safety", magnitude: 0.15, label: "+15% safety" }] },

  // ===== AI =====
  { id: "ai_engine_tuning", tree: "ai", name: "AI Engine Tuning", description: "AI optimizes engine maps in real time", cost: 50_000_000, months: 18, scientists: 22, buildingLevel: 5, failureRisk: 0.12, requires: ["elec_ota"], ekCost: 120, effect: [{ stat: "power", magnitude: 0.04, label: "+4% power" }, { stat: "efficiency", magnitude: 0.03, label: "+3% efficiency" }] },
  { id: "ai_suspension_opt", tree: "ai", name: "AI Suspension Optimization", description: "AI continuously tunes damping", cost: 55_000_000, months: 20, scientists: 24, buildingLevel: 5, failureRisk: 0.13, requires: ["elec_smart_suspension"], ekCost: 140, effect: [{ stat: "safety", magnitude: 0.04, label: "+4% safety" }, { stat: "weight", magnitude: 0.02, label: "Better handling" }] },
  { id: "ai_production_planning", tree: "ai", name: "AI Production Planning", description: "AI optimizes factory scheduling", cost: 60_000_000, months: 20, scientists: 24, buildingLevel: 6, failureRisk: 0.14, requires: ["mfg_digital_twin"], ekCost: 150, effect: [{ stat: "cost", magnitude: -0.06, label: "-6% mfg cost" }, { stat: "assembly", magnitude: -0.1, label: "-10% assembly time" }] },
  { id: "ai_quality_inspection", tree: "ai", name: "AI Quality Inspection", description: "Deep-learning defect detection", cost: 45_000_000, months: 16, scientists: 20, buildingLevel: 5, failureRisk: 0.1, requires: ["mfg_ai_inspection"], ekCost: 110, effect: [{ stat: "defect", magnitude: -0.3, label: "-30% defect rate" }] },
  { id: "ai_driving_coach", tree: "ai", name: "AI Driving Coach", description: "On-board AI teaches performance driving", cost: 40_000_000, months: 16, scientists: 18, buildingLevel: 4, failureRisk: 0.1, requires: ["elec_ai_assistant"], ekCost: 100, effect: [{ stat: "techScore", magnitude: 0.1, label: "+10% tech score" }] },
];

export const TECH_BY_ID: Record<TechnologyId, TechDef> = Object.fromEntries(
  TECHNOLOGIES.map((t) => [t.id, t])
);

export const TREE_LABELS: Record<TechTreeId, string> = {
  engine: "Engine R&D",
  materials: "Materials Research",
  aerodynamics: "Aerodynamics",
  electronics: "Electronics",
  manufacturing: "Manufacturing",
  battery: "Battery & EV",
  safety: "Safety Research",
  ai: "AI Research",
};

export const TREE_TO_BUILDING: Record<TechTreeId, BuildingId> = {
  engine: "engine_lab",
  materials: "materials_lab",
  aerodynamics: "aero_center",
  electronics: "electronics_lab",
  manufacturing: "manufacturing_center",
  battery: "battery_lab",
  safety: "safety_center",
  ai: "ai_software_lab",
};

// ---------- Engineers ----------

export const ENGINEER_POOL: Omit<Engineer, "id" | "hired">[] = [
  { name: "Dr. Luca Romano",   role: "chief_engine",           specialty: "engine",          experience: 78, creativity: 85, productivity: 80, salary: 45000 },
  { name: "Sarah Chen",         role: "aero_expert",            specialty: "aerodynamics",    experience: 65, creativity: 72, productivity: 78, salary: 38000 },
  { name: "Dr. Yuki Tanaka",    role: "battery_scientist",      specialty: "battery",         experience: 88, creativity: 90, productivity: 75, salary: 52000 },
  { name: "Marcus Reinhardt",   role: "materials_scientist",    specialty: "materials",       experience: 70, creativity: 78, productivity: 82, salary: 42000 },
  { name: "Priya Kapoor",       role: "software_engineer",      specialty: "ai",              experience: 62, creativity: 88, productivity: 85, salary: 40000 },
  { name: "Klaus Bauer",        role: "manufacturing_engineer", specialty: "manufacturing",   experience: 75, creativity: 65, productivity: 88, salary: 36000 },
  { name: "Marco Silva",        role: "test_driver",            specialty: "safety",          experience: 58, creativity: 60, productivity: 72, salary: 28000 },
  { name: "Elena Volkov",       role: "data_analyst",           specialty: "electronics",     experience: 68, creativity: 70, productivity: 90, salary: 34000 },
  { name: "James O'Brien",      role: "chief_engine",           specialty: "engine",          experience: 90, creativity: 75, productivity: 85, salary: 60000 },
  { name: "Dr. Amara Okafor",   role: "battery_scientist",      specialty: "battery",         experience: 72, creativity: 82, productivity: 80, salary: 46000 },
  { name: "Tom Hartley",        role: "aero_expert",            specialty: "aerodynamics",    experience: 80, creativity: 85, productivity: 82, salary: 44000 },
  { name: "Lisa Nakamura",      role: "software_engineer",      specialty: "ai",              experience: 85, creativity: 92, productivity: 88, salary: 55000 },
];

export function initialEngineers(): Engineer[] {
  return ENGINEER_POOL.map((e, i) => ({ ...e, id: `eng_${i}`, hired: i < 4 })); // start with 4 hired
}

// ---------- Skunkworks ----------

export const SKUNKWORKS_TEMPLATES: Omit<SkunkworksProject, "id" | "status" | "monthsElapsed" | "monthsLeft" | "startedAtMonth" | "scientistsAssigned">[] = [
  {
    name: "Project Phoenix — Rotary VCE",
    description: "A revolutionary rotary variable-compression engine architecture.",
    category: "engine",
    cost: 200_000_000, monthsTotal: 48, failureRisk: 0.35,
    resultDescription: "+25% power, +15% efficiency, exclusive powertrain",
  },
  {
    name: "Project Carbon — Ultralight Monocoque",
    description: "An ultra-light carbon-fiber chassis weighing 40% less than current.",
    category: "chassis",
    cost: 150_000_000, monthsTotal: 36, failureRisk: 0.25,
    resultDescription: "-40% chassis weight, +10% safety",
  },
  {
    name: "Project Quantum — Next-Gen Battery",
    description: "A next-generation solid-state battery with 2x energy density.",
    category: "battery",
    cost: 250_000_000, monthsTotal: 54, failureRisk: 0.4,
    resultDescription: "+100% energy density, +80% charging speed",
  },
  {
    name: "Project Hydra — Active Suspension",
    description: "Fully active hydraulic suspension with predictive road scanning.",
    category: "suspension",
    cost: 120_000_000, monthsTotal: 30, failureRisk: 0.22,
    resultDescription: "+15% handling, +8% safety, adaptive ride",
  },
  {
    name: "Project Flow — Micro-Factory",
    description: "A new manufacturing process that cuts assembly time by 30%.",
    category: "manufacturing",
    cost: 180_000_000, monthsTotal: 42, failureRisk: 0.28,
    resultDescription: "-30% assembly time, -12% mfg cost",
  },
];

// ---------- Budget ----------

export function defaultBudget(): ResearchBudget {
  return { engine: 25, materials: 10, aerodynamics: 15, electronics: 10, manufacturing: 15, battery: 10, safety: 10, ai: 5 };
}

export const BUDGET_TREES: TechTreeId[] = ["engine", "materials", "aerodynamics", "electronics", "manufacturing", "battery", "safety", "ai"];

// ---------- Initial RD State ----------

export const STARTING_CASH = 500_000_000;
export const STARTING_EK = 100;
export const MONTHLY_INCOME = 12_000_000; // baseline company revenue

export function initialTechnologies(): RDState["technologies"] {
  const out: RDState["technologies"] = {};
  for (const t of TECHNOLOGIES) {
    out[t.id] = { tree: t.tree, unlocked: t.id === "mat_mild_steel", researchProgress: 0, patented: false };
  }
  return out;
}

export function initialRDState(): RDState {
  return {
    month: 0,
    cash: STARTING_CASH,
    engineeringKnowledge: STARTING_EK,
    innovationScore: 15,
    brandValue: 20,
    buildings: initialBuildings(),
    technologies: initialTechnologies(),
    projects: [],
    skunkworks: [],
    patents: [],
    engineers: initialEngineers(),
    budget: defaultBudget(),
    monthlyRevenue: MONTHLY_INCOME,
    log: [{ month: 0, text: "R&D division established. Welcome, Director.", kind: "info" }],
    lastUpdated: new Date().toISOString(),
  };
}
