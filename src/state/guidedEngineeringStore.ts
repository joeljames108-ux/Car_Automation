// ============================================================================
// GUIDED ENGINEERING WORKFLOW STORE
// ============================================================================
// Enforces the "Build From Zero" philosophy:
// ENGINE → VEHICLE → AERODYNAMICS → INTERIOR → FINAL BUILD
// Tracks stage lifecycle (unconfigured, configuring, configured, invalidated),
// manages dependency invalidation, and enforces stage access gating.
// ============================================================================

import { create } from "zustand";

export type ConfigurationStatus =
  | "unconfigured"
  | "configuring"
  | "configured"
  | "invalidated";

export type WorkflowStage =
  | "engine"
  | "vehicle"
  | "aero"
  | "interior"
  | "final_build";

export interface StageGateResult {
  allowed: boolean;
  reason?: string;
  requiredStage?: WorkflowStage;
}

export interface WorkflowStageMeta {
  id: WorkflowStage;
  stageNumber: number;
  label: string;
  buildStoryTitle: string;
  buildStorySubtitle: string;
  shortTitle: string;
  tagline: string;
  appStageId: string; // Corresponding id in App.tsx STAGES
}

export const WORKFLOW_STAGES_META: Record<WorkflowStage, WorkflowStageMeta> = {
  engine: {
    id: "engine",
    stageNumber: 1,
    label: "ENGINE",
    buildStoryTitle: "Power Unit",
    buildStorySubtitle: "Combustion Architecture & Thermal Induction",
    shortTitle: "Powertrain & Block",
    tagline: "Architecture, Valvetrain & Aspiration",
    appStageId: "engine",
  },
  vehicle: {
    id: "vehicle",
    stageNumber: 2,
    label: "VEHICLE",
    buildStoryTitle: "Vehicle Architecture",
    buildStorySubtitle: "Spaceframe, Kinematics & Wheel Packaging",
    shortTitle: "Chassis & Platform",
    tagline: "Body Architecture, Suspension & Running Gear",
    appStageId: "vehicle",
  },
  aero: {
    id: "aero",
    stageNumber: 3,
    label: "AERODYNAMICS",
    buildStoryTitle: "Air Management",
    buildStorySubtitle: "Vortices, Ground Effects & Active Dynamics",
    shortTitle: "Aero & Surfaces",
    tagline: "Splitters, Diffusers, Wings & Downforce",
    appStageId: "aero_studio",
  },
  interior: {
    id: "interior",
    stageNumber: 4,
    label: "INTERIOR",
    buildStoryTitle: "Driver Environment",
    buildStorySubtitle: "Cockpit Ergonomics, Avionics & Materials",
    shortTitle: "Cockpit & Avionics",
    tagline: "Dashboard, Displays, Seats & Electronics",
    appStageId: "interior",
  },
  final_build: {
    id: "final_build",
    stageNumber: 5,
    label: "FINAL BUILD",
    buildStoryTitle: "Complete Machine",
    buildStorySubtitle: "Homologated Assembly, Telemetry & Validation",
    shortTitle: "Assembly & Telemetry",
    tagline: "Complete 3D Car, BOM & Virtual Homologation",
    appStageId: "final_build",
  },
};

interface GuidedEngineeringState {
  // Stage Statuses
  engineStatus: ConfigurationStatus;
  vehicleStatus: ConfigurationStatus;
  aeroStatus: ConfigurationStatus;
  interiorStatus: ConfigurationStatus;
  finalBuildStatus: ConfigurationStatus;

  // Active Stage
  activeWorkflowStage: WorkflowStage;

  // Navigation & Permission Checks
  canEnterStage: (targetStage: WorkflowStage) => StageGateResult;

  // Actions
  setActiveWorkflowStage: (stage: WorkflowStage) => void;
  setStageStatus: (stage: WorkflowStage, status: ConfigurationStatus) => void;
  markStageComplete: (stage: WorkflowStage) => void;

  // Invalidation Triggers (when user edits an earlier stage)
  notifyEngineModified: () => void;
  notifyVehicleModified: () => void;
  notifyAeroModified: () => void;

  // Reset / Presets
  resetAllStages: () => void;
  loadPresetAllStagesComplete: () => void;
}

export const useGuidedEngineeringStore = create<GuidedEngineeringState>((set, get) => ({
  // All stages start completely UNCONFIGURED by default
  engineStatus: "unconfigured",
  vehicleStatus: "unconfigured",
  aeroStatus: "unconfigured",
  interiorStatus: "unconfigured",
  finalBuildStatus: "unconfigured",

  activeWorkflowStage: "engine",

  canEnterStage: (targetStage: WorkflowStage): StageGateResult => {
    const s = get();

    switch (targetStage) {
      case "engine":
        // Engine is always accessible
        return { allowed: true };

      case "vehicle": {
        const isEngineSatisfied =
          s.engineStatus === "configured" || s.engineStatus === "invalidated";
        if (!isEngineSatisfied) {
          return {
            allowed: false,
            reason: "Complete ENGINE configuration first.",
            requiredStage: "engine",
          };
        }
        return { allowed: true };
      }

      case "aero": {
        // Vehicle check
        const vehicleGate = s.canEnterStage("vehicle");
        if (!vehicleGate.allowed) return vehicleGate;

        const isVehicleSatisfied =
          s.vehicleStatus === "configured" || s.vehicleStatus === "invalidated";
        if (!isVehicleSatisfied) {
          return {
            allowed: false,
            reason: "Complete VEHICLE configuration first.",
            requiredStage: "vehicle",
          };
        }
        return { allowed: true };
      }

      case "interior": {
        // Aero check
        const aeroGate = s.canEnterStage("aero");
        if (!aeroGate.allowed) return aeroGate;

        const isAeroSatisfied =
          s.aeroStatus === "configured" || s.aeroStatus === "invalidated";
        if (!isAeroSatisfied) {
          return {
            allowed: false,
            reason: "Complete AERODYNAMICS configuration first.",
            requiredStage: "aero",
          };
        }
        return { allowed: true };
      }

      case "final_build": {
        // Interior check
        const interiorGate = s.canEnterStage("interior");
        if (!interiorGate.allowed) return interiorGate;

        const isInteriorSatisfied =
          s.interiorStatus === "configured" || s.interiorStatus === "invalidated";
        if (!isInteriorSatisfied) {
          return {
            allowed: false,
            reason: "Complete INTERIOR configuration first.",
            requiredStage: "interior",
          };
        }
        return { allowed: true };
      }

      default:
        return { allowed: true };
    }
  },

  setActiveWorkflowStage: (stage: WorkflowStage) => {
    const check = get().canEnterStage(stage);
    if (check.allowed) {
      set({ activeWorkflowStage: stage });
    }
  },

  setStageStatus: (stage: WorkflowStage, status: ConfigurationStatus) => {
    switch (stage) {
      case "engine":
        set({ engineStatus: status });
        break;
      case "vehicle":
        set({ vehicleStatus: status });
        break;
      case "aero":
        set({ aeroStatus: status });
        break;
      case "interior":
        set({ interiorStatus: status });
        break;
      case "final_build":
        set({ finalBuildStatus: status });
        break;
    }
  },

  markStageComplete: (stage: WorkflowStage) => {
    switch (stage) {
      case "engine":
        set({ engineStatus: "configured" });
        break;
      case "vehicle":
        set({ vehicleStatus: "configured" });
        break;
      case "aero":
        set({ aeroStatus: "configured" });
        break;
      case "interior":
        set({ interiorStatus: "configured" });
        break;
      case "final_build":
        set({ finalBuildStatus: "configured" });
        break;
    }
  },

  notifyEngineModified: () => {
    const { vehicleStatus, aeroStatus, finalBuildStatus } = get();
    const updates: Partial<GuidedEngineeringState> = {};
    if (vehicleStatus === "configured") {
      updates.vehicleStatus = "invalidated";
    }
    if (aeroStatus === "configured") {
      updates.aeroStatus = "invalidated";
    }
    if (finalBuildStatus === "configured") {
      updates.finalBuildStatus = "invalidated";
    }
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },

  notifyVehicleModified: () => {
    const { aeroStatus, finalBuildStatus } = get();
    const updates: Partial<GuidedEngineeringState> = {};
    if (aeroStatus === "configured") {
      updates.aeroStatus = "invalidated";
    }
    if (finalBuildStatus === "configured") {
      updates.finalBuildStatus = "invalidated";
    }
    if (Object.keys(updates).length > 0) {
      set(updates);
    }
  },

  notifyAeroModified: () => {
    const { finalBuildStatus } = get();
    if (finalBuildStatus === "configured") {
      set({ finalBuildStatus: "invalidated" });
    }
  },

  resetAllStages: () => {
    set({
      engineStatus: "unconfigured",
      vehicleStatus: "unconfigured",
      aeroStatus: "unconfigured",
      interiorStatus: "unconfigured",
      finalBuildStatus: "unconfigured",
      activeWorkflowStage: "engine",
    });
  },

  loadPresetAllStagesComplete: () => {
    set({
      engineStatus: "configured",
      vehicleStatus: "configured",
      aeroStatus: "configured",
      interiorStatus: "configured",
      finalBuildStatus: "configured",
    });
  },
}));
