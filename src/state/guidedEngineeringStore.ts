// ============================================================================
// GUIDED ENGINEERING WORKFLOW STORE
// ============================================================================
// Enforces the "Build From Zero" philosophy:
// ENGINE → VEHICLE → AERODYNAMICS → INTERIOR → FINAL BUILD
// Tracks stage lifecycle (unconfigured, configuring, configured, invalidated),
// manages dependency invalidation, and enforces stage access gating.
// ============================================================================

import { create } from "zustand";
import { AccessManager } from "../sim/accessManager";

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
  | "safety"
  | "simulation"
  | "manufacturing"
  | "final_build";

export interface StageGateResult {
  allowed: boolean;
  reason?: string;
  requiredStage?: WorkflowStage;
  devBypassed?: boolean;
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
  safety: {
    id: "safety",
    stageNumber: 5,
    label: "SAFETY CENTER",
    buildStoryTitle: "Occupant & Crash Safety",
    buildStorySubtitle: "Active Dynamics, Passive Cage & Crash Rigidity",
    shortTitle: "Safety & Homologation",
    tagline: "Crash Structure, Crumple Zones & Euro-NCAP Testing",
    appStageId: "safety",
  },
  simulation: {
    id: "simulation",
    stageNumber: 6,
    label: "SIM & TESTING",
    buildStoryTitle: "Dynamic Validation",
    buildStorySubtitle: "Virtual Homologation & Benchmark Analytics",
    shortTitle: "Simulation & Telemetry",
    tagline: "Dyno Pulls, Track Laps & Performance Certification",
    appStageId: "simulation",
  },
  manufacturing: {
    id: "manufacturing",
    stageNumber: 7,
    label: "MANUFACTURE",
    buildStoryTitle: "Series Production",
    buildStorySubtitle: "In-House Plant & Contract Outsourcing",
    shortTitle: "Production & Assembly",
    tagline: "Assembly Lines, Shift Scheduling & Supply Logistics",
    appStageId: "manufacturing",
  },
  final_build: {
    id: "final_build",
    stageNumber: 8,
    label: "FINAL BUILD",
    buildStoryTitle: "Complete Machine",
    buildStorySubtitle: "Homologated Assembly, Telemetry & Validation",
    shortTitle: "Assembly & Telemetry",
    tagline: "Complete 3D Car, BOM & Virtual Homologation",
    appStageId: "simulation",
  },
};

interface GuidedEngineeringState {
  // Stage Statuses
  engineStatus: ConfigurationStatus;
  transmissionStatus: ConfigurationStatus;
  vehicleStatus: ConfigurationStatus;
  aeroStatus: ConfigurationStatus;
  interiorStatus: ConfigurationStatus;
  safetyStatus: ConfigurationStatus;
  simulationStatus: ConfigurationStatus;
  manufacturingStatus: ConfigurationStatus;
  finalBuildStatus: ConfigurationStatus;

  // Active Stage
  activeWorkflowStage: WorkflowStage;

  // Powertrain Architecture Selection Status
  isPowertrainSelecting: boolean;

  // Navigation & Permission Checks
  canEnterStage: (targetStage: WorkflowStage) => StageGateResult;

  // Actions
  setActiveWorkflowStage: (stage: WorkflowStage) => void;
  setStageStatus: (stage: WorkflowStage, status: ConfigurationStatus) => void;
  setTransmissionStatus: (status: ConfigurationStatus) => void;
  markTransmissionComplete: () => void;
  setPowertrainSelecting: (selecting: boolean) => void;
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
  transmissionStatus: "unconfigured",
  vehicleStatus: "unconfigured",
  aeroStatus: "unconfigured",
  interiorStatus: "unconfigured",
  safetyStatus: "unconfigured",
  simulationStatus: "unconfigured",
  manufacturingStatus: "unconfigured",
  finalBuildStatus: "unconfigured",

  activeWorkflowStage: "engine",
  isPowertrainSelecting: true,

  canEnterStage: (targetStage: WorkflowStage): StageGateResult => {
    const s = get();
    return AccessManager.canAccessStage(targetStage, {
      engineStatus: s.engineStatus,
      transmissionStatus: s.transmissionStatus,
      vehicleStatus: s.vehicleStatus,
      aeroStatus: s.aeroStatus,
      interiorStatus: s.interiorStatus,
      safetyStatus: s.safetyStatus,
      simulationStatus: s.simulationStatus,
      manufacturingStatus: s.manufacturingStatus,
      finalBuildStatus: s.finalBuildStatus,
    });
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
      case "safety":
        set({ safetyStatus: status });
        break;
      case "simulation":
        set({ simulationStatus: status });
        break;
      case "manufacturing":
        set({ manufacturingStatus: status });
        break;
      case "final_build":
        set({ finalBuildStatus: status });
        break;
    }
  },

  setTransmissionStatus: (status: ConfigurationStatus) => {
    set({ transmissionStatus: status });
  },

  markTransmissionComplete: () => {
    set({ transmissionStatus: "configured" });
  },

  setPowertrainSelecting: (selecting: boolean) => {
    set({ isPowertrainSelecting: selecting });
  },

  markStageComplete: (stage: WorkflowStage) => {
    switch (stage) {
      case "engine":
        set({ engineStatus: "configured", isPowertrainSelecting: false });
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
      case "safety":
        set({ safetyStatus: "configured" });
        break;
      case "simulation":
        set({ simulationStatus: "configured" });
        break;
      case "manufacturing":
        set({ manufacturingStatus: "configured" });
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
      transmissionStatus: "unconfigured",
      vehicleStatus: "unconfigured",
      aeroStatus: "unconfigured",
      interiorStatus: "unconfigured",
      safetyStatus: "unconfigured",
      simulationStatus: "unconfigured",
      manufacturingStatus: "unconfigured",
      finalBuildStatus: "unconfigured",
      activeWorkflowStage: "engine",
      isPowertrainSelecting: true,
    });
  },

  loadPresetAllStagesComplete: () => {
    set({
      engineStatus: "configured",
      transmissionStatus: "configured",
      vehicleStatus: "configured",
      aeroStatus: "configured",
      interiorStatus: "configured",
      safetyStatus: "configured",
      simulationStatus: "configured",
      manufacturingStatus: "configured",
      finalBuildStatus: "configured",
      isPowertrainSelecting: false,
    });
  },
}));

if (typeof window !== "undefined") {
  (window as any).__guidedStore = useGuidedEngineeringStore;
}
