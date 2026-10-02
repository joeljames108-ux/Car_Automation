/**
 * ═══════════════════════════════════════════════════════════════════════
 * ACTIVE PRODUCTION STORE (GLOBAL VEHICLE MANUFACTURING RUNS)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Tracks live vehicle manufacturing batches (in-house & contract) across
 * simulation time. Automatically advances produced units and decrements
 * days remaining via daily clock listener events.
 */

import { create } from "zustand";
import { clockListeners } from "./gameClockEngine";

export interface ActiveProductionRun {
  id: string;
  vehicleName: string;
  type: "in_house" | "contract";
  partnerName?: string;
  factoryTier?: string;
  totalUnits: number;
  producedUnits: number;
  daysTotal: number;
  daysRemaining: number;
  dailyRate: number; // units produced per simulation day
  unitCostUSD: number;
  totalCostUSD: number;
  shiftCount: number;
  status: "IN_PRODUCTION" | "COMPLETED" | "PAUSED";
  startDateStr: string;
  targetCompletionDateStr: string;
}

interface ActiveProductionState {
  activeRuns: ActiveProductionRun[];
  completedRuns: ActiveProductionRun[];

  // Actions
  startProductionRun: (
    params: Omit<ActiveProductionRun, "id" | "producedUnits" | "status">
  ) => ActiveProductionRun;
  cancelProductionRun: (id: string) => void;
  pauseProductionRun: (id: string) => void;
  resumeProductionRun: (id: string) => void;
  tickProduction: (days: number) => void;
  clearAllRuns: () => void;
}

const STORAGE_KEY = "car_automation_active_production_v1";

const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // ignore
      }
    }
  },
};

function loadSavedRuns(): { activeRuns: ActiveProductionRun[]; completedRuns: ActiveProductionRun[] } {
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.activeRuns)) {
        return {
          activeRuns: parsed.activeRuns,
          completedRuns: Array.isArray(parsed.completedRuns) ? parsed.completedRuns : [],
        };
      }
    }
  } catch (err) {
    console.warn("Failed to parse saved active production runs:", err);
  }
  return { activeRuns: [], completedRuns: [] };
}

function persistRuns(activeRuns: ActiveProductionRun[], completedRuns: ActiveProductionRun[]) {
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify({ activeRuns, completedRuns }));
  } catch {
    // ignore
  }
}

const initialSaved = loadSavedRuns();

export const useActiveProductionStore = create<ActiveProductionState>((set, get) => ({
  activeRuns: initialSaved.activeRuns,
  completedRuns: initialSaved.completedRuns,

  startProductionRun: (params) => {
    const newRun: ActiveProductionRun = {
      ...params,
      id: `prod_run_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      producedUnits: 0,
      status: "IN_PRODUCTION",
    };

    set((state) => {
      const nextActive = [newRun, ...state.activeRuns];
      persistRuns(nextActive, state.completedRuns);
      return { activeRuns: nextActive };
    });

    return newRun;
  },

  cancelProductionRun: (id) => {
    set((state) => {
      const nextActive = state.activeRuns.filter((r) => r.id !== id);
      persistRuns(nextActive, state.completedRuns);
      return { activeRuns: nextActive };
    });
  },

  pauseProductionRun: (id) => {
    set((state) => {
      const nextActive = state.activeRuns.map((r) =>
        r.id === id ? { ...r, status: "PAUSED" as const } : r
      );
      persistRuns(nextActive, state.completedRuns);
      return { activeRuns: nextActive };
    });
  },

  resumeProductionRun: (id) => {
    set((state) => {
      const nextActive = state.activeRuns.map((r) =>
        r.id === id ? { ...r, status: "IN_PRODUCTION" as const } : r
      );
      persistRuns(nextActive, state.completedRuns);
      return { activeRuns: nextActive };
    });
  },

  tickProduction: (days: number) => {
    if (days <= 0) return;

    set((state) => {
      if (state.activeRuns.length === 0) return state;

      const newlyCompleted: ActiveProductionRun[] = [];
      const updatedActive: ActiveProductionRun[] = [];

      for (const run of state.activeRuns) {
        if (run.status !== "IN_PRODUCTION") {
          updatedActive.push(run);
          continue;
        }

        const nextRemaining = Math.max(0, run.daysRemaining - days);
        const daysElapsed = run.daysTotal - nextRemaining;
        const nextProduced = Math.min(
          run.totalUnits,
          Math.round((daysElapsed / run.daysTotal) * run.totalUnits)
        );

        if (nextRemaining <= 0 || nextProduced >= run.totalUnits) {
          newlyCompleted.push({
            ...run,
            daysRemaining: 0,
            producedUnits: run.totalUnits,
            status: "COMPLETED",
          });
        } else {
          updatedActive.push({
            ...run,
            daysRemaining: nextRemaining,
            producedUnits: nextProduced,
          });
        }
      }

      const nextCompleted = [...newlyCompleted, ...state.completedRuns].slice(0, 50);
      persistRuns(updatedActive, nextCompleted);

      return {
        activeRuns: updatedActive,
        completedRuns: nextCompleted,
      };
    });
  },

  clearAllRuns: () => {
    persistRuns([], []);
    set({ activeRuns: [], completedRuns: [] });
  },
}));

// Automatic subscription to daily simulation clock
clockListeners.subscribe("day", "activeProductionDailyTick", (payload) => {
  const elapsedDays = payload.elapsedDays || 1;
  useActiveProductionStore.getState().tickProduction(elapsedDays);
});
