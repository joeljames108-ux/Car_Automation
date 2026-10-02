// ===================================================================
// AUTOMOTIVE R&D DEEP MASTERY STORE — ZUSTAND STATE MANAGEMENT
// Capacity, Research Teams, Multi-Year Projects, and Emergent DNA
// ===================================================================
import { create } from "zustand";
import {
  RDDepartmentId,
  MasterDivisionId,
  RDEra,
  RDTechNode,
  SubsystemBranchId,
  MasteryRank,
  CompanyDNAProfile,
  ResearchTeam,
  TestingFacilityType,
} from "../sim/rdTreeTypes";
import {
  TECH_NODE_BY_ID,
  RD_TECH_NODES,
  DEPARTMENT_BY_ID,
  BRANCH_BY_ID,
  SUBSYSTEM_BRANCHES,
} from "../sim/rdTreeData";
import {
  canResearchNode,
  calculateBranchMastery,
  calculateCompanyDNA,
} from "../sim/rdTreeEngine";
import { useDeveloperModeStore } from "./developerModeStore";
import { useSimulationClockStore } from "./simulationClockStore";
import { clockListeners } from "./gameClockEngine";

export interface ActiveResearch {
  nodeId: string;
  name: string;
  departmentId: RDDepartmentId;
  branchId: SubsystemBranchId;
  progressMonths: number;
  totalMonths: number;
  assignedScientists: number;
  cost: number;
  assignedTeamId: string | null;
}

export interface RDTreeState {
  // Navigation State
  activeDivisionId: MasterDivisionId;
  activeDepartmentId: RDDepartmentId;
  activeBranchId: SubsystemBranchId | null;
  inspectingNodeId: string | null;
  searchQuery: string;
  eraFilter: RDEra | "all";
  viewMode: "departments" | "subsystems" | "tree";

  // Unlocked Technologies Set (Array for serialization)
  unlockedTechs: string[];

  // Ongoing Research Project
  activeProject: ActiveResearch | null;

  // Organizational Capacity & Teams
  totalEngineers: number;
  deployedEngineers: number;
  researchTeams: ResearchTeam[];
  testingFacilities: TestingFacilityType[];

  // Institutional Memory & Accumulated Hours per Branch
  branchHours: Record<string, number>;
  branchMastery: Record<string, MasteryRank>;
  companyDNA: CompanyDNAProfile;

  // Navigation Actions
  setActiveDivision: (divId: MasterDivisionId) => void;
  setActiveDepartment: (depId: RDDepartmentId) => void;
  setActiveBranch: (branchId: SubsystemBranchId | null) => void;
  inspectNode: (nodeId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setEraFilter: (era: RDEra | "all") => void;
  setViewMode: (mode: "departments" | "subsystems" | "tree") => void;

  // Research Management
  startResearch: (nodeId: string, scientists?: number, teamId?: string) => boolean;
  cancelResearch: () => void;
  advanceResearchMonths: (monthsCount?: number) => void;

  // Team Management
  createResearchTeam: (name: string, branchId: SubsystemBranchId, engineers: number) => void;

  // Direct Unlocks & Dev Overrides
  unlockNode: (nodeId: string) => void;
  unlockAll: () => void;
  resetToBaseline: () => void;
  recalculateDNA: () => void;
}

const BASELINE_1970_TECHS = [
  "eng_arch_baseline",
  "eng_blk_cast_iron",
  "eng_head_ohv",
  "eng_ind_carb_single",
  "trans_3spd_manual",
  "chas_ladder_frame",
  "susp_solid_axle",
  "aero_drag_reduction",
  "mat_mild_steel",
  "elec_wiring_12v",
  "bat_lead_acid",
  "safe_seatbelts_2pt",
  "therm_radiators",
  "mfg_manual_line",
];

const DEFAULT_RESEARCH_TEAMS: ResearchTeam[] = [
  {
    id: "team_combustion",
    name: "Combustion Dynamics Team",
    assignedBranchId: "ice_engine",
    engineersCount: 15,
    specializationBonus: 0.15,
    experienceMonths: 24,
    activeProjectId: null,
  },
  {
    id: "team_chassis",
    name: "Chassis & Spaceframe Team",
    assignedBranchId: "chassis_dynamics",
    engineersCount: 12,
    specializationBonus: 0.10,
    experienceMonths: 18,
    activeProjectId: null,
  },
  {
    id: "team_safety",
    name: "Crashworthiness & Safety Team",
    assignedBranchId: "passive_safety",
    engineersCount: 10,
    specializationBonus: 0.12,
    experienceMonths: 12,
    activeProjectId: null,
  },
  {
    id: "team_mfg",
    name: "Manufacturing Tooling Team",
    assignedBranchId: "casting_manufacturing",
    engineersCount: 8,
    specializationBonus: 0.08,
    experienceMonths: 10,
    activeProjectId: null,
  },
];

const DEFAULT_TESTING_FACILITIES: TestingFacilityType[] = [
  "dyno_cell",
  "wind_tunnel",
  "crash_barrier",
  "test_track",
  "shaker_rig",
  "climate_chamber",
  "hil_simulation_rig",
];

const STORAGE_KEY = "apex_rd_tree_unlocked_v3";
const HOURS_STORAGE_KEY = "apex_rd_branch_hours_v3";

function loadSavedTechs(): string[] {
  try {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set([...BASELINE_1970_TECHS, ...parsed]));
        }
      }
    }
  } catch {
    // ignore
  }
  return [...BASELINE_1970_TECHS];
}

function loadSavedBranchHours(): Record<string, number> {
  try {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(HOURS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch {
    // ignore
  }
  // Initialize baseline hours for starting 1970 branches
  return {
    ice_engine: 2500,
    chassis_dynamics: 1800,
    passive_safety: 1200,
    casting_manufacturing: 1500,
  };
}

function persistTechs(techs: string[]) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(techs));
    }
  } catch {
    // ignore
  }
}

function persistBranchHours(hours: Record<string, number>) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(HOURS_STORAGE_KEY, JSON.stringify(hours));
    }
  } catch {
    // ignore
  }
}

const initialTechs = loadSavedTechs();
const initialBranchHours = loadSavedBranchHours();
const initialDNA = calculateCompanyDNA(new Set(initialTechs), initialBranchHours);

export const useRDTreeStore = create<RDTreeState>((set, get) => ({
  activeDivisionId: "powertrain",
  activeDepartmentId: "engine",
  activeBranchId: "ice_engine",
  inspectingNodeId: null,
  searchQuery: "",
  eraFilter: "all",
  viewMode: "departments",

  unlockedTechs: initialTechs,
  activeProject: null,

  totalEngineers: 85,
  deployedEngineers: 45,
  researchTeams: DEFAULT_RESEARCH_TEAMS,
  testingFacilities: DEFAULT_TESTING_FACILITIES,

  branchHours: initialBranchHours,
  branchMastery: {},
  companyDNA: initialDNA,

  setActiveDivision: (divId: MasterDivisionId) => {
    set({ activeDivisionId: divId });
  },

  setActiveDepartment: (depId: RDDepartmentId) => {
    const dep = DEPARTMENT_BY_ID[depId];
    set({
      activeDepartmentId: depId,
      activeDivisionId: dep ? dep.divisionId : get().activeDivisionId,
      viewMode: "tree",
    });
  },

  setActiveBranch: (branchId: SubsystemBranchId | null) => {
    set({ activeBranchId: branchId });
  },

  inspectNode: (nodeId: string | null) => {
    set({ inspectingNodeId: nodeId });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setEraFilter: (era: RDEra | "all") => {
    set({ eraFilter: era });
  },

  setViewMode: (mode: "departments" | "subsystems" | "tree") => {
    set({ viewMode: mode });
  },

  startResearch: (nodeId: string, scientists?: number, teamId?: string) => {
    const node = TECH_NODE_BY_ID[nodeId];
    if (!node) return false;

    const state = get();
    if (state.unlockedTechs.includes(nodeId)) return false;

    // Check developer mode overrides
    const devMode = useDeveloperModeStore.getState();
    const isDevBypassed = devMode.overrides.ignoreResearchRequirements;

    const clockState = useSimulationClockStore.getState();
    const currentYear = (clockState && typeof clockState.year === "number") ? clockState.year : 1970;
    const check = canResearchNode(
      nodeId,
      new Set(state.unlockedTechs),
      currentYear,
      100_000_000,
      1000,
      { engine_lab: 3, materials_lab: 3, safety_center: 3, aero_center: 3, electronics_lab: 3, manufacturing_center: 3 },
      isDevBypassed
    );

    if (!check.ok && !isDevBypassed) {
      return false;
    }

    // Determine mapped branch
    let mappedBranch: SubsystemBranchId = "ice_engine";
    if (node.departmentId === "chassis") mappedBranch = "chassis_dynamics";
    else if (node.departmentId === "suspension") mappedBranch = "suspension_dynamics";
    else if (node.departmentId === "braking") mappedBranch = "brake_systems";
    else if (node.departmentId === "tyres_wheels") mappedBranch = "tyres_wheels_dynamics";
    else if (node.departmentId === "aero") mappedBranch = "vehicle_aerodynamics";
    else if (node.departmentId === "safety") mappedBranch = "passive_safety";
    else if (node.departmentId === "electronics") mappedBranch = "electrical_architecture";
    else if (node.departmentId === "materials_science") mappedBranch = "materials_engineering";
    else if (node.departmentId === "manufacturing_tech") mappedBranch = "casting_manufacturing";
    else if (node.departmentId === "motorsport_tech") mappedBranch = "race_engines";

    const assignedCount = scientists ?? node.scientists ?? 10;

    const activeProject: ActiveResearch = {
      nodeId,
      name: node.name,
      departmentId: node.departmentId,
      branchId: mappedBranch,
      progressMonths: 0,
      totalMonths: Math.max(1, node.months),
      assignedScientists: assignedCount,
      cost: node.cost,
      assignedTeamId: teamId ?? null,
    };

    set({ activeProject });
    return true;
  },

  cancelResearch: () => {
    set({ activeProject: null });
  },

  advanceResearchMonths: (monthsCount: number = 1) => {
    const state = get();
    const project = state.activeProject;
    if (!project) return;

    const newProgress = project.progressMonths + monthsCount;

    // Accumulate engineering hours (160 hrs per scientist per month)
    const hoursInvested = monthsCount * project.assignedScientists * 160;
    const currentBranchHours = state.branchHours[project.branchId] || 0;
    const updatedBranchHours = {
      ...state.branchHours,
      [project.branchId]: currentBranchHours + hoursInvested,
    };

    if (newProgress >= project.totalMonths) {
      // Completed research!
      const newUnlocked = Array.from(new Set([...state.unlockedTechs, project.nodeId]));
      persistTechs(newUnlocked);
      persistBranchHours(updatedBranchHours);

      const newDNA = calculateCompanyDNA(new Set(newUnlocked), updatedBranchHours);

      set({
        unlockedTechs: newUnlocked,
        activeProject: null,
        branchHours: updatedBranchHours,
        companyDNA: newDNA,
      });
    } else {
      persistBranchHours(updatedBranchHours);
      set({
        activeProject: {
          ...project,
          progressMonths: newProgress,
        },
        branchHours: updatedBranchHours,
      });
    }
  },

  createResearchTeam: (name: string, branchId: SubsystemBranchId, engineers: number) => {
    const newTeam: ResearchTeam = {
      id: `team_${Date.now()}`,
      name,
      assignedBranchId: branchId,
      engineersCount: engineers,
      specializationBonus: 0.10,
      experienceMonths: 0,
      activeProjectId: null,
    };

    set({
      researchTeams: [...get().researchTeams, newTeam],
      deployedEngineers: get().deployedEngineers + engineers,
    });
  },

  unlockNode: (nodeId: string) => {
    const state = get();
    if (state.unlockedTechs.includes(nodeId)) return;
    const newUnlocked = [...state.unlockedTechs, nodeId];
    persistTechs(newUnlocked);
    const newDNA = calculateCompanyDNA(new Set(newUnlocked), state.branchHours);
    set({
      unlockedTechs: newUnlocked,
      companyDNA: newDNA,
    });
  },

  unlockAll: () => {
    const allIds = RD_TECH_NODES.map((n) => n.id);
    persistTechs(allIds);
    const newDNA = calculateCompanyDNA(new Set(allIds), get().branchHours);
    set({
      unlockedTechs: allIds,
      companyDNA: newDNA,
    });
  },

  resetToBaseline: () => {
    persistTechs(BASELINE_1970_TECHS);
    const resetHours = {
      ice_engine: 2500,
      chassis_dynamics: 1800,
      passive_safety: 1200,
      casting_manufacturing: 1500,
    };
    persistBranchHours(resetHours);
    const resetDNA = calculateCompanyDNA(new Set(BASELINE_1970_TECHS), resetHours);
    set({
      unlockedTechs: [...BASELINE_1970_TECHS],
      activeProject: null,
      branchHours: resetHours,
      companyDNA: resetDNA,
    });
  },

  recalculateDNA: () => {
    const state = get();
    const dna = calculateCompanyDNA(new Set(state.unlockedTechs), state.branchHours);
    set({ companyDNA: dna });
  },
}));

// Subscribe to daily game clock ticks for continuous research progression (time runs always)
clockListeners.subscribe("day", "rdTreeStoreDailyProgress", (payload) => {
  const elapsedDays = payload.elapsedDays || 1;
  useRDTreeStore.getState().advanceResearchMonths(elapsedDays / 30.4);
});

