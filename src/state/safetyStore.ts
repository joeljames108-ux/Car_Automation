// ==============================================================================
// SAFETY STORE — ZUSTAND STATE MANAGEMENT (DOMAIN EXTRACTION)
// Independent domain store for vehicle crash structure design, NCAP ratings,
// safety equipment configuration, and crashworthiness simulation.
// ==============================================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SafetyConfig, SafetySimResult } from "../sim/types";

// Safe storage fallback for SSR/Vitest environments
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

// ---------- Safety Scoring Weights ----------

const CRUMPLE_SCORES: Record<string, number> = { none: 0, basic: 40, progressive: 65, advanced: 85, adaptive: 95 };
const AIRBAG_SCORES: Record<string, number> = { none: 0, front: 30, front_side: 55, full_curtain: 75, full_360: 90, external: 98 };
const CAGE_SCORES: Record<string, number> = { none: 0, reinforced_pillars: 35, safety_cell: 60, carbon_monocoque: 85, full_cage: 95 };
const BELT_SCORES: Record<string, number> = { three_point: 40, pretensioner: 55, load_limiter: 70, active_belt: 85, four_point: 95 };
const PED_SCORES: Record<string, number> = { none: 0, active_hood: 50, bumper_airbag: 75, full_pedestrian: 95 };

/**
 * Pure simulation function computing NCAP crashworthiness, ratings, safety weight, and cost.
 */
export function simulateSafety(config: SafetyConfig): SafetySimResult {
  const frontCrumple = CRUMPLE_SCORES[config.frontCrumple] || 0;
  const rearCrumple = CRUMPLE_SCORES[config.rearCrumple] || 0;
  const sideCrumple = CRUMPLE_SCORES[config.sideCrumple] || 0;
  const airbag = AIRBAG_SCORES[config.airbagType] || 0;
  const cage = CAGE_SCORES[config.safetyCage] || 0;
  const belt = BELT_SCORES[config.seatbeltType] || 0;
  const ped = PED_SCORES[config.pedestrianSafety] || 0;

  const airbagCountBonus = Math.min(config.airbagCount / 12, 1) * 15;
  const doorBeamBonus = config.doorBeams ? 8 : 0;
  const rolloverBonus = config.rolloverProtection ? 10 : 0;
  const steeringBonus = config.energyAbsorbingSteeringColumn ? 5 : 0;
  const fireBonus = config.fireSuppressionSystem ? 5 : 0;
  const batteryBonus = config.postCrashBatteryDisconnect ? 4 : 0;
  const childAnchors = Math.min(config.childSafetyAnchors / 4, 1) * 100;

  const frontalScore = Math.min((frontCrumple * 0.5 + airbag * 0.25 + cage * 0.15 + belt * 0.1 + airbagCountBonus + steeringBonus), 100);
  const sideScore = Math.min((sideCrumple * 0.4 + airbag * 0.3 + cage * 0.2 + doorBeamBonus + airbagCountBonus), 100);
  const rearScore = Math.min((rearCrumple * 0.5 + cage * 0.2 + belt * 0.2 + fireBonus + batteryBonus) + 10, 100);
  const rolloverScore = Math.min((cage * 0.5 + rolloverBonus * 3 + belt * 0.2), 100);
  const pedestrianScore = Math.min(ped + steeringBonus, 100);

  const overallScore = Math.round(frontalScore * 0.3 + sideScore * 0.25 + rearScore * 0.15 + rolloverScore * 0.15 + pedestrianScore * 0.15);
  const ncapStars = overallScore >= 90 ? 5 : overallScore >= 75 ? 4 : overallScore >= 55 ? 3 : overallScore >= 35 ? 2 : 1;

  // Weight: more safety = more weight
  const baseWeight = 15;
  const crumpleWeight = (frontCrumple + rearCrumple + sideCrumple) / 100 * 30;
  const airbagWeight = config.airbagCount * 1.5;
  const cageWeight = cage / 100 * 45;
  const miscWeight = (config.doorBeams ? 8 : 0) + (config.rolloverProtection ? 12 : 0) + (config.fireSuppressionSystem ? 5 : 0);
  const safetyWeight = Math.round(baseWeight + crumpleWeight + airbagWeight + cageWeight + miscWeight);

  // Cost
  const safetyCost = Math.round(overallScore * 80 + config.airbagCount * 150 + cageWeight * 50 + miscWeight * 30);

  return {
    frontalCrashScore: Math.round(frontalScore),
    sideCrashScore: Math.round(sideScore),
    rearCrashScore: Math.round(rearScore),
    rolloverScore: Math.round(rolloverScore),
    pedestrianScore: Math.round(pedestrianScore),
    childSafetyScore: Math.round(childAnchors),
    overallScore,
    ncapStars,
    safetyWeight,
    safetyCost,
    activeFeatureBonus: 0,
  };
}

/**
 * Returns default production automotive safety configuration.
 */
export function defaultSafetyConfig(): SafetyConfig {
  return {
    frontCrumple: "progressive",
    rearCrumple: "basic",
    sideCrumple: "basic",
    airbagType: "front_side",
    airbagCount: 6,
    safetyCage: "safety_cell",
    seatbeltType: "pretensioner",
    pedestrianSafety: "active_hood",
    childSafetyAnchors: 2,
    rolloverProtection: true,
    doorBeams: true,
    energyAbsorbingSteeringColumn: true,
    collapsiblePedals: true,
    fireSuppressionSystem: false,
    eCallSystem: true,
    postCrashBatteryDisconnect: false,
  };
}

export interface SafetyStoreState {
  safetyConfig: SafetyConfig;
  safetySim: SafetySimResult;

  // Actions
  updateSafety: (patch: Partial<SafetyConfig>) => void;
  setSafetyConfig: (config: SafetyConfig) => void;
  resetSafety: () => void;
}

export const useSafetyStore = create<SafetyStoreState>()(
  persist(
    (set, get) => {
      const initialConfig = defaultSafetyConfig();
      const initialSim = simulateSafety(initialConfig);

      return {
        safetyConfig: initialConfig,
        safetySim: initialSim,

        updateSafety: (patch: Partial<SafetyConfig>) => {
          const nextConfig = { ...get().safetyConfig, ...patch };
          const nextSim = simulateSafety(nextConfig);
          set({ safetyConfig: nextConfig, safetySim: nextSim });
        },

        setSafetyConfig: (config: SafetyConfig) => {
          const nextSim = simulateSafety(config);
          set({ safetyConfig: config, safetySim: nextSim });
        },

        resetSafety: () => {
          const config = defaultSafetyConfig();
          const sim = simulateSafety(config);
          set({ safetyConfig: config, safetySim: sim });
        },
      };
    },
    {
      name: "apex_safety_store",
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ safetyConfig: state.safetyConfig }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.safetySim = simulateSafety(state.safetyConfig);
        }
      },
    }
  )
);
