// ===================================================================
// R&D SYSTEM — TYPES
// ===================================================================

export type BuildingId =
  | "engine_lab" | "aero_center" | "materials_lab" | "electronics_lab"
  | "battery_lab" | "manufacturing_center" | "safety_center"
  | "ai_software_lab" | "nvh_lab" | "testing_center";

export type TechTreeId =
  | "engine" | "materials" | "aerodynamics" | "electronics"
  | "manufacturing" | "battery" | "safety" | "ai";

export type TechnologyId = string; // free-form keys defined in rdData

export type ResearchPhase =
  | "concept" | "simulation" | "prototype" | "bench_testing"
  | "vehicle_testing" | "production_ready";

export type ProjectStatus = "idle" | "active" | "paused" | "complete" | "failed";

export interface ResearchProject {
  id: string;
  techId: TechnologyId;
  tree: TechTreeId;
  name: string;
  description: string;
  cost: number;          // total R&D cost in $
  monthsTotal: number;   // total project duration
  monthsElapsed: number;
  scientistsAssigned: number;
  status: ProjectStatus;
  phase: ResearchPhase;
  failureRisk: number;   // 0-1 base chance of failure
  startedAtMonth: number;
  completedAtMonth: number | null;
  resultBonus?: number;  // achieved effect magnitude
}

export interface BuildingState {
  id: BuildingId;
  level: number;         // 1-10
  upgradeCost: number;
  upgradeMonths: number;
  upgradeMonthsLeft: number; // 0 = not upgrading
}

export interface Engineer {
  id: string;
  name: string;
  role: EngineerRole;
  specialty: TechTreeId;
  experience: number;    // 0-100
  creativity: number;    // 0-100
  productivity: number;  // 0-100
  salary: number;        // $ per month
  hired: boolean;
}

export type EngineerRole =
  | "chief_engine" | "aero_expert" | "battery_scientist" | "materials_scientist"
  | "software_engineer" | "manufacturing_engineer" | "test_driver" | "data_analyst";

export interface ResearchBudget {
  engine: number; materials: number; aerodynamics: number; electronics: number;
  manufacturing: number; battery: number; safety: number; ai: number;
}
// Budget values are percentages that should sum to 100.

export interface Patent {
  id: string;
  techId: TechnologyId;
  techName: string;
  filedAtMonth: number;
  yearsActive: number;
  royaltyPerMonth: number;
  brandValue: number; // adds to innovation score
}

export interface SkunkworksProject {
  id: string;
  name: string;
  description: string;
  category: "engine" | "chassis" | "battery" | "suspension" | "manufacturing";
  cost: number;
  monthsTotal: number;
  monthsElapsed: number;
  monthsLeft: number;
  scientistsAssigned: number;
  status: "concept" | "active" | "paused" | "breakthrough" | "failed";
  failureRisk: number;   // 0-1, higher than normal research
  startedAtMonth: number;
  resultDescription: string;
}

export interface RDState {
  month: number;                      // in-game months elapsed
  cash: number;                       // company treasury $
  engineeringKnowledge: number;       // EK currency
  innovationScore: number;            // 0-100
  brandValue: number;                 // affects pricing & engineer attraction

  buildings: Record<BuildingId, BuildingState>;
  technologies: Record<TechnologyId, {
    tree: TechTreeId;
    unlocked: boolean;
    researchProgress: number; // 0-1 (legacy direct-unlock track)
    patented: boolean;
  }>;
  projects: ResearchProject[];
  skunkworks: SkunkworksProject[];
  patents: Patent[];
  engineers: Engineer[];       // full roster (hired flag toggles employment)
  budget: ResearchBudget;
  monthlyRevenue: number;      // derived from patents + brand
  log: LogEntry[];
  lastUpdated: string;
}

export interface LogEntry {
  month: number;
  text: string;
  kind: "info" | "success" | "warn" | "danger";
}

// Bonuses applied to the vehicle simulation derived from R&D state
export interface RDBonuses {
  // engine
  powerMultiplier: number;       // 1.0 = no change
  efficiencyMultiplier: number;
  reliabilityBonus: number;      // 0-1 added
  weightReductionPct: number;    // fraction (0.05 = 5%)
  // aero
  downforceBonus: number;        // fraction
  dragReduction: number;         // fraction
  // manufacturing
  costReductionPct: number;      // fraction
  assemblyTimeReductionPct: number;
  defectRateReduction: number;
  // electronics / ai
  techScoreBonus: number;        // 0-1 added
  // battery
  energyDensityMultiplier: number;
  chargingSpeedMultiplier: number;
  // safety
  safetyBonus: number;           // 0-1 added
  // nvh
  nvhReduction: number;          // 0-1
  // testing
  predictionAccuracy: number;    // 0-1
  // meta
  innovationScore: number;
  brandValue: number;
  unlockedTechs: TechnologyId[];
}
