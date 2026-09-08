// ============================================================================
// HYPERCAR CONSTRUCTOR — SEQUENTIAL WORKFLOW STORE
// ============================================================================
// Enforces the "Build From Zero" philosophy for the Hypercar WEC Studio:
// POWER_UNIT → MONOCOQUE → AERO → COCKPIT → FINAL BUILD
// ============================================================================

import { create } from "zustand";

export type HypercarWorkflowStatus =
  | "unconfigured"
  | "configuring"
  | "configured"
  | "invalidated";

export type HypercarWorkflowStage =
  | "power_unit"
  | "monocoque"
  | "aero"
  | "cockpit"
  | "final_build";

export interface HypercarStageGateResult {
  allowed: boolean;
  reason?: string;
  requiredStage?: HypercarWorkflowStage;
}

export const HYPERCAR_WORKFLOW_STAGES: Record<HypercarWorkflowStage, {
  id: HypercarWorkflowStage;
  number: number;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
}> = {
  power_unit: {
    id: "power_unit",
    number: 1,
    label: "HYBRID POWERTRAIN",
    shortLabel: "Powertrain",
    description: "V8/V6 Hybrid ICE, MGU-K/H, Energy Store, Cooling & ERS",
    icon: "⚡",
  },
  monocoque: {
    id: "monocoque",
    number: 2,
    label: "MONOCOQUE",
    shortLabel: "Chassis",
    description: "Central Monocoque, Crash Structures, Suspension & Running Gear",
    icon: "🏗️",
  },
  aero: {
    id: "aero",
    number: 3,
    label: "AERODYNAMICS",
    shortLabel: "Aero",
    description: "Front Splitter, Floor, Diffuser, Rear Wing & Active Aero",
    icon: "💨",
  },
  cockpit: {
    id: "cockpit",
    number: 4,
    label: "COCKPIT",
    shortLabel: "Cockpit",
    description: "Driver Display, Steering, Safety Systems & Interior",
    icon: "🏎️",
  },
  final_build: {
    id: "final_build",
    number: 5,
    label: "24H RACE BUILD",
    shortLabel: "Final",
    description: "WEC Homologation, Garage Setup, Tire Strategy & Endurance Race",
    icon: "🏆",
  },
};

interface HypercarWorkflowState {
  powerUnitStatus: HypercarWorkflowStatus;
  monocoqueStatus: HypercarWorkflowStatus;
  aeroStatus: HypercarWorkflowStatus;
  cockpitStatus: HypercarWorkflowStatus;
  finalBuildStatus: HypercarWorkflowStatus;

  activeConstructionStage: HypercarWorkflowStage;

  canEnterStage: (target: HypercarWorkflowStage) => HypercarStageGateResult;
  setActiveConstructionStage: (stage: HypercarWorkflowStage) => void;
  markStageComplete: (stage: HypercarWorkflowStage) => void;
  setStageStatus: (stage: HypercarWorkflowStage, status: HypercarWorkflowStatus) => void;

  notifyPowerUnitModified: () => void;
  notifyMonocoqueModified: () => void;
  notifyAeroModified: () => void;
  notifyCockpitModified: () => void;

  resetAll: () => void;
}

export const useHypercarWorkflowStore = create<HypercarWorkflowState>((set, get) => ({
  powerUnitStatus: "unconfigured",
  monocoqueStatus: "unconfigured",
  aeroStatus: "unconfigured",
  cockpitStatus: "unconfigured",
  finalBuildStatus: "unconfigured",

  activeConstructionStage: "power_unit",

  canEnterStage: (target: HypercarWorkflowStage): HypercarStageGateResult => {
    const s = get();
    switch (target) {
      case "power_unit":
        return { allowed: true };
      case "monocoque": {
        const ok = s.powerUnitStatus === "configured" || s.powerUnitStatus === "invalidated";
        return ok
          ? { allowed: true }
          : { allowed: false, reason: "Complete HYBRID POWERTRAIN configuration first.", requiredStage: "power_unit" };
      }
      case "aero": {
        const ok = s.monocoqueStatus === "configured" || s.monocoqueStatus === "invalidated";
        return ok
          ? { allowed: true }
          : { allowed: false, reason: "Complete MONOCOQUE configuration first.", requiredStage: "monocoque" };
      }
      case "cockpit": {
        const ok = s.aeroStatus === "configured" || s.aeroStatus === "invalidated";
        return ok
          ? { allowed: true }
          : { allowed: false, reason: "Complete AERODYNAMICS configuration first.", requiredStage: "aero" };
      }
      case "final_build": {
        const ok = s.cockpitStatus === "configured" || s.cockpitStatus === "invalidated";
        return ok
          ? { allowed: true }
          : { allowed: false, reason: "Complete COCKPIT configuration first.", requiredStage: "cockpit" };
      }
      default:
        return { allowed: true };
    }
  },

  setActiveConstructionStage: (stage) => {
    const check = get().canEnterStage(stage);
    if (check.allowed) {
      set({ activeConstructionStage: stage });
    }
  },

  markStageComplete: (stage) => {
    const update: Partial<HypercarWorkflowState> = {};
    switch (stage) {
      case "power_unit": update.powerUnitStatus = "configured"; break;
      case "monocoque": update.monocoqueStatus = "configured"; break;
      case "aero": update.aeroStatus = "configured"; break;
      case "cockpit": update.cockpitStatus = "configured"; break;
      case "final_build": update.finalBuildStatus = "configured"; break;
    }
    set(update);
  },

  setStageStatus: (stage, status) => {
    const update: Partial<HypercarWorkflowState> = {};
    switch (stage) {
      case "power_unit": update.powerUnitStatus = status; break;
      case "monocoque": update.monocoqueStatus = status; break;
      case "aero": update.aeroStatus = status; break;
      case "cockpit": update.cockpitStatus = status; break;
      case "final_build": update.finalBuildStatus = status; break;
    }
    set(update);
  },

  notifyPowerUnitModified: () => {
    const { monocoqueStatus, aeroStatus, cockpitStatus, finalBuildStatus } = get();
    const update: Partial<HypercarWorkflowState> = {};
    if (monocoqueStatus === "configured") update.monocoqueStatus = "invalidated";
    if (aeroStatus === "configured") update.aeroStatus = "invalidated";
    if (cockpitStatus === "configured") update.cockpitStatus = "invalidated";
    if (finalBuildStatus === "configured") update.finalBuildStatus = "invalidated";
    if (Object.keys(update).length > 0) set(update);
  },

  notifyMonocoqueModified: () => {
    const { aeroStatus, cockpitStatus, finalBuildStatus } = get();
    const update: Partial<HypercarWorkflowState> = {};
    if (aeroStatus === "configured") update.aeroStatus = "invalidated";
    if (cockpitStatus === "configured") update.cockpitStatus = "invalidated";
    if (finalBuildStatus === "configured") update.finalBuildStatus = "invalidated";
    if (Object.keys(update).length > 0) set(update);
  },

  notifyAeroModified: () => {
    const { cockpitStatus, finalBuildStatus } = get();
    const update: Partial<HypercarWorkflowState> = {};
    if (cockpitStatus === "configured") update.cockpitStatus = "invalidated";
    if (finalBuildStatus === "configured") update.finalBuildStatus = "invalidated";
    if (Object.keys(update).length > 0) set(update);
  },

  notifyCockpitModified: () => {
    const { finalBuildStatus } = get();
    if (finalBuildStatus === "configured") set({ finalBuildStatus: "invalidated" });
  },

  resetAll: () => {
    set({
      powerUnitStatus: "unconfigured",
      monocoqueStatus: "unconfigured",
      aeroStatus: "unconfigured",
      cockpitStatus: "unconfigured",
      finalBuildStatus: "unconfigured",
      activeConstructionStage: "power_unit",
    });
  },
}));
