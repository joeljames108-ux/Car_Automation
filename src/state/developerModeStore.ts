import { create } from "zustand";

export interface DevOverrides {
  /** Bypass sequential step requirements in guided engineering (Engine -> Vehicle -> Aero -> Interior -> Final) */
  ignoreWorkflowGating: boolean;
  /** Unlock all engine architectures (V12, W16, Turbo, Hybrid, EV) regardless of era/R&D */
  ignoreEngineLocks: boolean;
  /** Unlock all vehicle architectures, wheelbases, carbon monocoque, and body types */
  ignoreVehicleLocks: boolean;
  /** Unlock all aerodynamic elements (active DRS, Venturi tunnels, multi-element wings) */
  ignoreAeroLocks: boolean;
  /** Unlock all interior trims, OLED displays, AR HUDs, and racing buckets */
  ignoreInteriorLocks: boolean;
  /** Unlock all R&D tech nodes regardless of research progression or building tiers */
  ignoreResearchRequirements: boolean;
  /** Unlock all motorsport tracks, series, driver categories, and team spots */
  ignoreMotorsportRequirements: boolean;
  /** Unlock all factory lines, tooling slots, and robot automation tiers */
  ignoreFacilityLocks: boolean;
  /** Infinite financial capital and raw materials */
  infiniteBudget: boolean;
  /** Instant factory tooling, production line speeds, and R&D project completion */
  instantBuild: boolean;
}

export type TestScenarioId =
  | "START_1970"
  | "ALL_CONTENT_TEST"
  | "1985_ERA_TEST"
  | "MOTORSPORT_TEST"
  | "FACTORY_TEST";

export interface TestScenario {
  id: TestScenarioId;
  name: string;
  year: number;
  description: string;
  badge: string;
  overrides: DevOverrides;
  cash?: number;
  materialsTonnes?: number;
}

export const TEST_SCENARIOS: Record<TestScenarioId, TestScenario> = {
  START_1970: {
    id: "START_1970",
    name: "1970 Career Start (Player Baseline)",
    year: 1970,
    badge: "PLAYER MODE",
    description: "Standard player career launch. Authentic sequential gating, 1970 era restrictions, $2.5M capital.",
    overrides: {
      ignoreWorkflowGating: false,
      ignoreEngineLocks: false,
      ignoreVehicleLocks: false,
      ignoreAeroLocks: false,
      ignoreInteriorLocks: false,
      ignoreResearchRequirements: false,
      ignoreMotorsportRequirements: false,
      ignoreFacilityLocks: false,
      infiniteBudget: false,
      instantBuild: false,
    },
    cash: 2_500_000,
    materialsTonnes: 500,
  },
  ALL_CONTENT_TEST: {
    id: "ALL_CONTENT_TEST",
    name: "All Content Test Sandbox",
    year: 1970,
    badge: "FULL UNLOCK",
    description: "All engines, vehicle platforms, aero, and interiors unlocked. Unlimited resources, zero gating restrictions.",
    overrides: {
      ignoreWorkflowGating: true,
      ignoreEngineLocks: true,
      ignoreVehicleLocks: true,
      ignoreAeroLocks: true,
      ignoreInteriorLocks: true,
      ignoreResearchRequirements: true,
      ignoreMotorsportRequirements: true,
      ignoreFacilityLocks: true,
      infiniteBudget: true,
      instantBuild: true,
    },
    cash: 500_000_000,
    materialsTonnes: 100_000,
  },
  "1985_ERA_TEST": {
    id: "1985_ERA_TEST",
    name: "1985 Turbo & Wedge Era",
    year: 1985,
    badge: "ERA SIMULATION",
    description: "Jump to 1985. Turbocharged engines, pop-up headlights, early electronic ECUs, and Group B homologation.",
    overrides: {
      ignoreWorkflowGating: true,
      ignoreEngineLocks: true,
      ignoreVehicleLocks: true,
      ignoreAeroLocks: false,
      ignoreInteriorLocks: false,
      ignoreResearchRequirements: true,
      ignoreMotorsportRequirements: true,
      ignoreFacilityLocks: false,
      infiniteBudget: false,
      instantBuild: false,
    },
    cash: 45_000_000,
    materialsTonnes: 5_000,
  },
  MOTORSPORT_TEST: {
    id: "MOTORSPORT_TEST",
    name: "Motorsport & Grand Prix Proving",
    year: 1980,
    badge: "RACING TEST",
    description: "Full motorsport grid unlocked. High-downforce aero, racing slick tires, V10/V12 race engines, all circuits.",
    overrides: {
      ignoreWorkflowGating: true,
      ignoreEngineLocks: true,
      ignoreVehicleLocks: true,
      ignoreAeroLocks: true,
      ignoreInteriorLocks: true,
      ignoreResearchRequirements: true,
      ignoreMotorsportRequirements: true,
      ignoreFacilityLocks: false,
      infiniteBudget: true,
      instantBuild: false,
    },
    cash: 120_000_000,
    materialsTonnes: 10_000,
  },
  FACTORY_TEST: {
    id: "FACTORY_TEST",
    name: "Gigafactory & Automated Line Test",
    year: 1970,
    badge: "PRODUCTION",
    description: "Max tier factory tooling, robotic automation lines, infinite raw materials, and instant stamping throughput.",
    overrides: {
      ignoreWorkflowGating: true,
      ignoreEngineLocks: false,
      ignoreVehicleLocks: false,
      ignoreAeroLocks: false,
      ignoreInteriorLocks: false,
      ignoreResearchRequirements: false,
      ignoreMotorsportRequirements: false,
      ignoreFacilityLocks: true,
      infiniteBudget: true,
      instantBuild: true,
    },
    cash: 250_000_000,
    materialsTonnes: 500_000,
  },
};

const DEFAULT_OVERRIDES: DevOverrides = {
  ignoreWorkflowGating: true, // Default to true in development so studio navigation works out-of-the-box
  ignoreEngineLocks: false,
  ignoreVehicleLocks: false,
  ignoreAeroLocks: false,
  ignoreInteriorLocks: false,
  ignoreResearchRequirements: false,
  ignoreMotorsportRequirements: false,
  ignoreFacilityLocks: false,
  infiniteBudget: false,
  instantBuild: false,
};

const STORAGE_KEY = "apex_developer_mode_v1";

function loadSavedSettings(): { devMode: boolean; overrides: DevOverrides } {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        devMode: Boolean(parsed.devMode ?? true),
        overrides: { ...DEFAULT_OVERRIDES, ...(parsed.overrides || {}) },
      };
    }
  } catch {
    // Ignore storage parse errors
  }
  return {
    devMode: true, // Enabled by default during development
    overrides: { ...DEFAULT_OVERRIDES },
  };
}

function persistSettings(devMode: boolean, overrides: DevOverrides) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ devMode, overrides }));
    }
  } catch {
    // Ignore storage write errors
  }
}

export interface DeveloperModeState {
  /** Master toggle for developer mode */
  devMode: boolean;
  /** Developer control modal open status */
  modalOpen: boolean;
  /** Active panel tab in developer control modal */
  activeTab: "overrides" | "timemachine" | "scenarios" | "spawner" | "asset_gallery" | "state_inspector";
  /** Granular overrides for subsystems */
  overrides: DevOverrides;
  /** Active scenario if one was applied */
  activeScenario: TestScenarioId | null;

  // Actions
  setDevMode: (enabled: boolean) => void;
  toggleDevMode: () => void;
  setModalOpen: (open: boolean) => void;
  toggleModal: () => void;
  setActiveTab: (tab: DeveloperModeState["activeTab"]) => void;
  setOverride: (key: keyof DevOverrides, value: boolean) => void;
  unlockAll: () => void;
  resetToPlayerMode: () => void;
  applyScenario: (scenarioId: TestScenarioId) => void;
}

const initialData = loadSavedSettings();

export const useDeveloperModeStore = create<DeveloperModeState>((set, get) => ({
  devMode: initialData.devMode,
  modalOpen: false,
  activeTab: "overrides",
  overrides: initialData.overrides,
  activeScenario: initialData.overrides.ignoreWorkflowGating ? "ALL_CONTENT_TEST" : "START_1970",

  setDevMode: (enabled: boolean) => {
    set({ devMode: enabled });
    persistSettings(enabled, get().overrides);
  },

  toggleDevMode: () => {
    const next = !get().devMode;
    set({ devMode: next });
    persistSettings(next, get().overrides);
  },

  setModalOpen: (open: boolean) => set({ modalOpen: open }),

  toggleModal: () => set((state) => ({ modalOpen: !state.modalOpen })),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setOverride: (key: keyof DevOverrides, value: boolean) => {
    const current = get();
    const updatedOverrides = { ...current.overrides, [key]: value };
    set({ overrides: updatedOverrides, activeScenario: null });
    persistSettings(current.devMode, updatedOverrides);
  },

  unlockAll: () => {
    const allUnlocked: DevOverrides = {
      ignoreWorkflowGating: true,
      ignoreEngineLocks: true,
      ignoreVehicleLocks: true,
      ignoreAeroLocks: true,
      ignoreInteriorLocks: true,
      ignoreResearchRequirements: true,
      ignoreMotorsportRequirements: true,
      ignoreFacilityLocks: true,
      infiniteBudget: true,
      instantBuild: true,
    };
    set({ devMode: true, overrides: allUnlocked, activeScenario: "ALL_CONTENT_TEST" });
    persistSettings(true, allUnlocked);
  },

  resetToPlayerMode: () => {
    const playerOverrides: DevOverrides = {
      ignoreWorkflowGating: false,
      ignoreEngineLocks: false,
      ignoreVehicleLocks: false,
      ignoreAeroLocks: false,
      ignoreInteriorLocks: false,
      ignoreResearchRequirements: false,
      ignoreMotorsportRequirements: false,
      ignoreFacilityLocks: false,
      infiniteBudget: false,
      instantBuild: false,
    };
    set({ devMode: false, overrides: playerOverrides, activeScenario: "START_1970" });
    persistSettings(false, playerOverrides);
  },

  applyScenario: (scenarioId: TestScenarioId) => {
    const scenario = TEST_SCENARIOS[scenarioId];
    if (!scenario) return;

    const isPlayerMode = scenarioId === "START_1970";
    set({
      devMode: !isPlayerMode,
      overrides: { ...scenario.overrides },
      activeScenario: scenarioId,
    });
    persistSettings(!isPlayerMode, scenario.overrides);
  },
}));
