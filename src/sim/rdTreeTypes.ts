// ===================================================================
// AUTOMOTIVE R&D DEEP MASTERY ECOSYSTEM — TYPES & SCHEMAS
// 12 Divisions, 95 Subsystems, 6-Tier Mastery, and Company DNA
// ===================================================================

// ─────────────────────────────────────────────────────────────────
// 1. THE 12 MASTER ENGINEERING DIVISIONS
// ─────────────────────────────────────────────────────────────────
export type MasterDivisionId =
  | "powertrain"
  | "vehicle_dynamics"
  | "vehicle_design"
  | "aerodynamics"
  | "safety"
  | "electronics_software"
  | "electrification"
  | "manufacturing"
  | "industrial_supply"
  | "motorsport"
  | "reliability_service"
  | "environment_efficiency"
  // Legacy division IDs for backward compatibility across data sets
  | "vehicle_technology"
  | "engineering_science"
  | "industrial"
  | "environment";

// ─────────────────────────────────────────────────────────────────
// 2. THE 95 MAJOR SUBSYSTEM ENGINEERING BRANCHES
// ─────────────────────────────────────────────────────────────────
export type SubsystemBranchId =
  // 1. Powertrain (8 branches)
  | "ice_engine"
  | "electric_powertrain"
  | "hybrid_powertrain"
  | "transmission_systems"
  | "differential_drivetrain"
  | "fuel_energy_systems"
  | "engine_electronics"
  | "thermal_powertrain"

  // 2. Vehicle Dynamics (6 branches)
  | "chassis_dynamics"
  | "suspension_dynamics"
  | "steering_systems"
  | "brake_systems"
  | "tyres_wheels_dynamics"
  | "vehicle_dynamics_control"

  // 3. Vehicle Structure & Design (8 branches)
  | "body_structure"
  | "exterior_bodywork"
  | "lightweight_engineering"
  | "materials_engineering"
  | "nvh_acoustics"
  | "interior_cabin"
  | "ergonomics_hmi"
  | "comfort_systems"

  // 4. Aerodynamics (7 branches)
  | "vehicle_aerodynamics"
  | "underbody_aerodynamics"
  | "racing_aerodynamics"
  | "active_aerodynamics"
  | "cfd_simulation"
  | "wind_tunnel_tech"
  | "thermal_aerodynamics"

  // 5. Safety (8 branches)
  | "passive_safety"
  | "crash_structures"
  | "restraint_systems"
  | "airbags_pyrotechnics"
  | "active_safety"
  | "adas_systems"
  | "driver_monitoring"
  | "autonomous_safety"

  // 6. Electronics & Software (9 branches)
  | "electrical_architecture"
  | "sensor_technology"
  | "ecu_hardware"
  | "vehicle_networks"
  | "embedded_software"
  | "infotainment_systems"
  | "telematics_connectivity"
  | "ai_intelligent_systems"
  | "autonomous_driving"

  // 7. Electrification (8 branches)
  | "battery_chemistry"
  | "battery_packs"
  | "electric_motors"
  | "inverter_technology"
  | "power_electronics"
  | "charging_systems"
  | "regenerative_systems"
  | "high_voltage_architecture"

  // 8. Manufacturing (10 branches)
  | "casting_manufacturing"
  | "forging_manufacturing"
  | "machining_cnc"
  | "stamping_presses"
  | "welding_joining"
  | "composite_manufacturing"
  | "robotics_automation"
  | "automation_systems"
  | "quality_control"
  | "factory_systems"

  // 9. Industrial / Corporate Engineering (8 branches)
  | "production_engineering"
  | "supply_chain_engineering"
  | "supplier_technology"
  | "logistics_freight"
  | "rail_freight_systems"
  | "warehousing_distribution"
  | "modular_platforms"
  | "manufacturing_standardization"

  // 10. Motorsport (11 branches)
  | "race_engines"
  | "race_transmission"
  | "race_chassis"
  | "race_suspension"
  | "race_brakes"
  | "race_tyres"
  | "race_aero"
  | "telemetry_acquisition"
  | "endurance_technology"
  | "pit_equipment"
  | "driver_systems"

  // 11. Reliability & Service (6 branches)
  | "durability_engineering"
  | "corrosion_resistance"
  | "maintenance_engineering"
  | "serviceability_design"
  | "diagnostic_systems"
  | "predictive_maintenance"

  // 12. Environment / Efficiency (6 branches)
  | "fuel_efficiency"
  | "emissions_reduction"
  | "energy_recovery"
  | "sustainable_materials"
  | "recycling_technology"
  | "sustainable_manufacturing";

// Backward compatibility alias: RDDepartmentId maps directly to SubsystemBranchId and legacy 22 IDs
export type RDDepartmentId =
  | SubsystemBranchId
  | "engine"
  | "transmission"
  | "battery_ev"
  | "chassis"
  | "suspension"
  | "tyres_wheels"
  | "braking"
  | "bodywork"
  | "aero"
  | "interior"
  | "lighting_vision"
  | "safety"
  | "electronics"
  | "software_control"
  | "thermal_management"
  | "materials_science"
  | "manufacturing_tech"
  | "testing_dev"
  | "service_reliability"
  | "motorsport_tech"
  | "production_supply"
  | "environment_efficiency";

// ─────────────────────────────────────────────────────────────────
// 3. MASTERY LEVELS (0 to 6)
// ─────────────────────────────────────────────────────────────────
export type MasteryRank = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface MasteryTierInfo {
  rank: MasteryRank;
  name: string;
  tagline: string;
  description: string;
  statMultiplier: number;
  failureRateModifier: number;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

export const MASTERY_TIERS: Record<MasteryRank, MasteryTierInfo> = {
  0: {
    rank: 0,
    name: "Unknown",
    tagline: "No Internal Expertise",
    description: "Company lacks basic technological literacy in this domain; must rely on primitive third-party components.",
    statMultiplier: 0.70,
    failureRateModifier: +0.25,
    badgeBg: "bg-slate-100",
    badgeBorder: "border-slate-300",
    badgeText: "text-slate-500",
  },
  1: {
    rank: 1,
    name: "Basic",
    tagline: "Prototype Comprehension",
    description: "Basic functional implementation. Can produce working vehicles meeting minimum homologation standards.",
    statMultiplier: 1.00,
    failureRateModifier: 0.00,
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-200",
    badgeText: "text-blue-700",
  },
  2: {
    rank: 2,
    name: "Competent",
    tagline: "Standard Industrial Quality",
    description: "Reliable manufacturing matching contemporary automotive industry averages.",
    statMultiplier: 1.15,
    failureRateModifier: -0.05,
    badgeBg: "bg-emerald-50",
    badgeBorder: "border-emerald-200",
    badgeText: "text-emerald-700",
  },
  3: {
    rank: 3,
    name: "Advanced",
    tagline: "Competitive Advantage",
    description: "Noticeably outperforms market rivals in thermal efficiency, durability, or handling dynamics.",
    statMultiplier: 1.35,
    failureRateModifier: -0.10,
    badgeBg: "bg-cyan-50",
    badgeBorder: "border-cyan-200",
    badgeText: "text-cyan-700",
  },
  4: {
    rank: 4,
    name: "Expert",
    tagline: "Trademark Engineering",
    description: "Company becomes widely recognized for this capability; commands strong consumer brand loyalty.",
    statMultiplier: 1.60,
    failureRateModifier: -0.15,
    badgeBg: "bg-amber-50",
    badgeBorder: "border-amber-200",
    badgeText: "text-amber-700",
  },
  5: {
    rank: 5,
    name: "World-Class",
    tagline: "Benchmark Standard",
    description: "Industry gold reference (e.g. Porsche flat-6, Mercedes safety cell, Toyota TPS). Competitors benchmark your designs.",
    statMultiplier: 1.90,
    failureRateModifier: -0.20,
    badgeBg: "bg-purple-50",
    badgeBorder: "border-purple-200",
    badgeText: "text-purple-700",
  },
  6: {
    rank: 6,
    name: "Frontier",
    tagline: "Signature Breakthrough",
    description: "Patented, state-of-the-art technological dominance. Pushing the absolute frontier of automotive science.",
    statMultiplier: 2.30,
    failureRateModifier: -0.25,
    badgeBg: "bg-rose-50",
    badgeBorder: "border-rose-300",
    badgeText: "text-rose-700",
  },
};

// ─────────────────────────────────────────────────────────────────
// 4. TESTING REQUIREMENTS & PHYSICAL FACILITIES
// ─────────────────────────────────────────────────────────────────
export type TestingFacilityType =
  | "dyno_cell"
  | "wind_tunnel"
  | "crash_barrier"
  | "test_track"
  | "hil_simulation_rig"
  | "shaker_rig"
  | "climate_chamber"
  | "none";

export interface TestingRequirement {
  type: TestingFacilityType;
  label: string;
  minimumLevel: number;
  testRunsRequired: number;
}

// ─────────────────────────────────────────────────────────────────
// 5. MULTI-GENERATIONAL TECHNOLOGY FAMILIES & NODES
// ─────────────────────────────────────────────────────────────────
export type RDEra =
  | "classic_1970"
  | "turbo_wedge_1980"
  | "electronic_1990"
  | "hybrid_2000"
  | "modern_2015"
  | "hyper_2026";

export interface RDTechEffect {
  stat: string;
  magnitude: number;
  label: string;
}

export interface RDStudioUnlock {
  studio:
    | "engine"
    | "vehicle"
    | "aero"
    | "interior"
    | "safety"
    | "manufacturing"
    | "simulation"
    | "dyno"
    | "motorsport"
    | "braking"
    | "suspension"
    | "chassis"
    | "transmission"
    | "general";
  featureKey: string;
  label: string;
}

export interface RDTechNode {
  id: string;
  name: string;
  departmentId: RDDepartmentId;
  divisionId: MasterDivisionId;
  subsection: string;
  generation?: number; // e.g. 1 for Gen I, 2 for Gen II, up to 5
  masteryTarget?: MasteryRank; // Target mastery tier (1..6)
  yearAvailable: number;
  era: RDEra;
  cost: number; // Research funding ($)
  months: number; // Development duration (in-game calendar months)
  scientists: number; // Engineering manpower headcount needed
  buildingId: string; // Laboratory / research facility required
  buildingLevel: number; // Facility tier required
  ekCost: number; // Engineering Knowledge points
  testingRequirement?: TestingRequirement;
  description: string;
  requires: string[]; // Prerequisite node IDs (both intra- and cross-disciplinary)
  effects: RDTechEffect[];
  unlocks: RDStudioUnlock[];
  failureRisk: number; // Base development failure/rework risk
}

// ─────────────────────────────────────────────────────────────────
// 6. 95 SUBSYSTEM BRANCH METADATA & PROGRESS
// ─────────────────────────────────────────────────────────────────
export interface SubsystemBranchMeta {
  id: SubsystemBranchId;
  divisionId: MasterDivisionId;
  name: string;
  shortName: string;
  tagline: string;
  icon: string;
  primaryFacility: string;
  requiredTestingType: TestingFacilityType;
  subsections: string[];
}

export interface BranchMasteryState {
  branchId: SubsystemBranchId;
  currentMastery: MasteryRank;
  masteryXp: number;
  xpToNextTier: number;
  totalEngineeringHours: number;
  completedGenerations: number;
  activeProjectNodeId: string | null;
}

// ─────────────────────────────────────────────────────────────────
// 7. COMPANY DNA & TELEMETRY
// ─────────────────────────────────────────────────────────────────
export type CompanyArchetype =
  | "specialist"
  | "focused_multi_discipline"
  | "industrial_generalist"
  | "balanced_emerging";

export interface CompanySpecializationMetric {
  branchId: SubsystemBranchId;
  branchName: string;
  divisionId: MasterDivisionId;
  mastery: MasteryRank;
  rdInvestmentSharePercent: number;
  totalHours: number;
}

export interface CompanyDNAProfile {
  breadthScorePercent: number; // % of 95 branches with >= Level 1
  depthScorePercent: number; // Mean mastery across explored branches normalized to 100%
  archetype: CompanyArchetype;
  archetypeTitle: string;
  archetypeDescription: string;
  topSpecializations: CompanySpecializationMetric[];
  totalEngineeringHoursInvested: number;
  totalFrontierPatents: number;
}

// ─────────────────────────────────────────────────────────────────
// 8. RESEARCH TEAMS & ORGANIZATIONAL CAPACITY
// ─────────────────────────────────────────────────────────────────
export interface ResearchTeam {
  id: string;
  name: string;
  assignedBranchId: SubsystemBranchId;
  engineersCount: number;
  specializationBonus: number; // e.g. +15% research speed in assigned branch
  experienceMonths: number;
  activeProjectId: string | null;
}

export interface RDCapacityOverview {
  totalEngineers: number;
  deployedEngineers: number;
  availableEngineers: number;
  annualResearchHoursCapacity: number;
  allocatedHours: number;
  researchCampusesCount: number;
  activeTeamsCount: number;
}

// ─────────────────────────────────────────────────────────────────
// 9. METADATA WRAPPERS FOR DIVISIONS & DEPARTMENTS
// ─────────────────────────────────────────────────────────────────
export interface RDDepartmentMeta {
  id: RDDepartmentId;
  name: string;
  divisionId: MasterDivisionId;
  icon: string;
  tagline: string;
  description: string;
  subsections: string[];
  primaryColor: string;
  badgeBg: string;
  badgeText: string;
  buildingId: string;
}

export interface MasterDivisionMeta {
  id: MasterDivisionId;
  name: string;
  subtitle: string;
  icon: string;
  description: string;
  departments: RDDepartmentId[];
  branches: SubsystemBranchId[];
  color: string;
  badgeBg: string;
  badgeBorder: string;
}
