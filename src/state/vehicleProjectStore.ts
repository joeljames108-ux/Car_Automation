// ==============================================================================
// VEHICLE PROJECT STORE — ZUSTAND STATE MANAGEMENT
// Master state for active vehicle engineering projects (e.g. Project Genesis)
// Distinct from pure calendar time in GameClock.
// ==============================================================================

import { create } from "zustand";
import { clockListeners } from "./gameClockEngine";

export interface ActiveProject {
  id: string;
  name: string;
  category: string;
  description: string;
  targetPowerHp: number;
  weightReductionKg: number;
  dragCoefficient: number;
  targetUnitCostEur: number;
  progress: {
    design: number;
    engineering: number;
    testing: number;
    production: number;
  };
}

export const INITIAL_VEHICLE_PROJECT: ActiveProject = {
  id: "proj_first_car",
  name: "PROJECT GENESIS",
  category: "Grand Tourer / Prototype",
  description: "Your company's very first vehicle. Design a competitive GT car from scratch to establish your brand.",
  targetPowerHp: 280,
  weightReductionKg: -80,
  dragCoefficient: 0.38,
  targetUnitCostEur: 12000,
  progress: { design: 0, engineering: 0, testing: 0, production: 0 },
};

export interface VehicleProjectState {
  activeProject: ActiveProject;
  setActiveProject: (project: ActiveProject) => void;
  updateProjectProgress: (patch: Partial<ActiveProject["progress"]>) => void;
  resetProject: () => void;
}

export const useVehicleProjectStore = create<VehicleProjectState>((set) => ({
  activeProject: { ...INITIAL_VEHICLE_PROJECT },

  setActiveProject: (project) => set({ activeProject: project }),

  updateProjectProgress: (patch) => {
    set((state) => ({
      activeProject: {
        ...state.activeProject,
        progress: { ...state.activeProject.progress, ...patch },
      },
    }));
  },

  resetProject: () => set({ activeProject: { ...INITIAL_VEHICLE_PROJECT } }),
}));

// Automatically advance project progress when game days tick
clockListeners.subscribe("day", "vehicleProjectProgressDayTick", (payload) => {
  const days = payload.elapsedDays || 1;
  const current = useVehicleProjectStore.getState().activeProject;
  if (!current) return;
  useVehicleProjectStore.getState().updateProjectProgress({
    design: Math.min(100, current.progress.design + days * 0.4),
    engineering: Math.min(100, current.progress.engineering + days * 0.3),
    testing: Math.min(100, current.progress.testing + days * 0.2),
    production: Math.min(100, current.progress.production + days * 0.15),
  });
});
