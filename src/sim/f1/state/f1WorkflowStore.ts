// ============================================================================
// F1 CONSTRUCTOR — SEQUENTIAL WORKFLOW STORE
// ============================================================================
// Enforces the "Build From Zero" philosophy for the F1 Constructor Studio:
// POWER_UNIT → CHASSIS → AERO → COCKPIT → FINAL BUILD
// ============================================================================

import { create } from "zustand";

export type F1WorkflowStatus =
  | "unconfigured"
  | "configuring"
  | "configured"
  | "invalidated";

export type F1WorkflowStage =
  | "power_unit"
  | "chassis"
  | "aero"
  | "cockpit"
  | "final_build";

export interface F1StageGateResult {
  allowed: boolean;
  reason?: string;
  requiredStage?: F1WorkflowStage;
}

export const F1_WORKFLOW_STAGES: Record<F1WorkflowStage, {
  id: F1WorkflowStage;
  number: number;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
}> = {
  power_unit: {
    id: "power_unit",
    number: 1,
    label: "POWER UNIT",
    shortLabel: "Engine",
    description: "1.6L V6 Turbo Hybrid ICE, MGU-K/H, Energy Store & Fuel System",
    icon: "🔥",
  },
  chassis: {
    id: "chassis",
    number: 2,
    label: "CHASSIS",
    shortLabel: "Chassis",
    description: "Carbon Monocoque Survival Cell, Nose Cone, Halo & Structural Elements",
    icon: "🏗️",
  },
  aero: {
    id: "aero",
    number: 3,
    label: "AERODYNAMICS",
    shortLabel: "Aero",
    description: "Front Wing, Floor, Sidepods, Diffuser, Rear Wing & DRS",
    icon: "💨",
  },
  cockpit: {
    id: "cockpit",
    number: 4,
    label: "COCKPIT",
    shortLabel: "Cockpit",
    description: "Steering Wheel, Pedals, Display, Seat & Driver Controls",
    icon: "🏎️",
  },
  final_build: {
    id: "final_build",
    number: 5,
    label: "FINAL BUILD",
    shortLabel: "Final",
    description: "Homologation, Telemetry, Garage Setup & Race Weekend",
    icon: "🏆",
  },
};

interface F1WorkflowState {
  // Stage statuses
  powerUnitStatus: F1WorkflowStatus;
  chassisStatus: F1WorkflowStatus;
  aeroStatus: F1WorkflowStatus;
  cockpitStatus: F1WorkflowStatus;
  finalBuildStatus: F1WorkflowStatus;

  // Active construction stage (within the CAD assembly view)
  activeConstructionStage: F1WorkflowStage;

  // Navigation
  canEnterStage: (target: F1WorkflowStage) => F1StageGateResult;
  setActiveConstructionStage: (stage: F1WorkflowStage) => void;
  markStageComplete: (stage: F1WorkflowStage) => void;
  setStageStatus: (stage: F1WorkflowStage, status: F1WorkflowStatus) => void;

  // Invalidation
  notifyPowerUnitModified: () => void;
  notifyChassisModified: () => void;
  notifyAeroModified: () => void;
  notifyCockpitModified: () => void;

  // Reset
  resetAll: () => void;
}

export const useF1WorkflowStore = create<F1WorkflowState>((set, get) => ({
  powerUnitStatus: "unconfigured",
  chassisStatus: "unconfigured",
  aeroStatus: "unconfigured",
  cockpitStatus: "unconfigured",
  finalBuildStatus: "unconfigured",

  activeConstructionStage: "power_unit",

  canEnterStage: (target: F1WorkflowStage): F1StageGateResult => {
    const s = get();
    switch (target) {
      case "power_unit":
        return { allowed: true };
      case "chassis": {
        const ok = s.powerUnitStatus === "configured" || s.powerUnitStatus === "invalidated";
        return ok
          ? { allowed: true }
          : { allowed: false, reason: "Complete POWER UNIT configuration first.", requiredStage: "power_unit" };
      }
      case "aero": {
        const chassisOk = s.chassisStatus === "configured" || s.chassisStatus === "invalidated";
        if (!chassisOk) return { allowed: false, reason: "Complete CHASSIS configuration first.", requiredStage: "chassis" };
        return { allowed: true };
      }
      case "cockpit": {
        const aeroOk = s.aeroStatus === "configured" || s.aeroStatus === "invalidated";
        if (!aeroOk) return { allowed: false, reason: "Complete AERODYNAMICS configuration first.", requiredStage: "aero" };
        return { allowed: true };
      }
      case "final_build": {
        const cockpitOk = s.cockpitStatus === "configured" || s.cockpitStatus === "invalidated";
        if (!cockpitOk) return { allowed: false, reason: "Complete COCKPIT configuration first.", requiredStage: "cockpit" };
        return { allowed: true };
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
    const update: Partial<F1WorkflowState> = {};
    switch (stage) {
      case "power_unit": update.powerUnitStatus = "configured"; break;
      case "chassis": update.chassisStatus = "configured"; break;
      case "aero": update.aeroStatus = "configured"; break;
      case "cockpit": update.cockpitStatus = "configured"; break;
      case "final_build": update.finalBuildStatus = "configured"; break;
    }
    set(update);
  },

  setStageStatus: (stage, status) => {
    const update: Partial<F1WorkflowState> = {};
    switch (stage) {
      case "power_unit": update.powerUnitStatus = status; break;
      case "chassis": update.chassisStatus = status; break;
      case "aero": update.aeroStatus = status; break;
      case "cockpit": update.cockpitStatus = status; break;
      case "final_build": update.finalBuildStatus = status; break;
    }
    set(update);
  },

  notifyPowerUnitModified: () => {
    const { chassisStatus, aeroStatus, cockpitStatus, finalBuildStatus } = get();
    const update: Partial<F1WorkflowState> = {};
    if (chassisStatus === "configured") update.chassisStatus = "invalidated";
    if (aeroStatus === "configured") update.aeroStatus = "invalidated";
    if (cockpitStatus === "configured") update.cockpitStatus = "invalidated";
    if (finalBuildStatus === "configured") update.finalBuildStatus = "invalidated";
    if (Object.keys(update).length > 0) set(update);
  },

  notifyChassisModified: () => {
    const { aeroStatus, cockpitStatus, finalBuildStatus } = get();
    const update: Partial<F1WorkflowState> = {};
    if (aeroStatus === "configured") update.aeroStatus = "invalidated";
    if (cockpitStatus === "configured") update.cockpitStatus = "invalidated";
    if (finalBuildStatus === "configured") update.finalBuildStatus = "invalidated";
    if (Object.keys(update).length > 0) set(update);
  },

  notifyAeroModified: () => {
    const { cockpitStatus, finalBuildStatus } = get();
    const update: Partial<F1WorkflowState> = {};
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
      chassisStatus: "unconfigured",
      aeroStatus: "unconfigured",
      cockpitStatus: "unconfigured",
      finalBuildStatus: "unconfigured",
      activeConstructionStage: "power_unit",
    });
  },
}));
