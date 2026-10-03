// ============================================================================
// GUIDED ENGINEERING PIPELINE STORE (Engineering Configuration Pipeline)
// ============================================================================
// Enforces the "Build From Zero" engineering configuration pipeline:
// ENGINE → VEHICLE → AERODYNAMICS → INTERIOR → SAFETY → SIMULATION → MANUFACTURING → FINAL BUILD
// Answers: "What am I technically configuring in the studio?"
// Distinct from VehicleDevelopmentLifecycle ("Where is this vehicle in its product lifecycle?")
// ============================================================================

import { create } from "zustand";
import { AccessManager } from "../sim/accessManager";

export type ConfigurationStatus =
  | "unconfigured"
  | "configuring"
  | "configured"
  | "invalidated";

/**
 * EngineeringPipelineStage — Technical vehicle configuration stages in the CAD/assembly studio.
 * Answers: "What am I technically configuring right now?"
 */
export type EngineeringPipelineStage =
  | "engine"
  | "vehicle"
  | "aero"
  | "interior"
  | "safety"
  | "simulation"
  | "manufacturing"
  | "final_build";

/** @deprecated Use EngineeringPipelineStage to distinguish from VehicleDevelopmentLifecycleStage */
export type WorkflowStage = EngineeringPipelineStage;

/**
 * CAR_CREATION_STAGES — the canonical list of App Stage IDs where
 * engineering-specific UI chrome (Live Stats Rail, workflow breadcrumbs,
 * sidebar collapse controls) should be visible.
 *
 * These map to the sequential "Build From Zero" pipeline stages where
 * the user is actively designing/configuring a vehicle.
 */
export const CAR_CREATION_STAGES = [
  "engine",
  "transmission3d",
  "vehicle",
  "aero_studio",
  "interior",
  "safety",
  "simulation",
  "testing",
  "manufacturing",
  "factory",
] as const;

const CAR_CREATION_STAGES_SET = new Set<string>(CAR_CREATION_STAGES);

/** Returns true if `stage` is an active car-creation pipeline stage. */
export function isCarCreationStageId(stage: string): boolean {
  return CAR_CREATION_STAGES_SET.has(stage);
}

export interface StageGateResult {
  allowed: boolean;
  reason?: string;
  requiredStage?: EngineeringPipelineStage;
  devBypassed?: boolean;
}

export interface EngineeringPipelineStageMeta {
  id: EngineeringPipelineStage;
  stageNumber: number;
  label: string;
  buildStoryTitle: string;
  buildStorySubtitle: string;
  shortTitle: string;
  tagline: string;
  appStageId: string; // Corresponding id in App.tsx STAGES
}

/** @deprecated Use EngineeringPipelineStageMeta */
export type WorkflowStageMeta = EngineeringPipelineStageMeta;

export const ENGINEERING_PIPELINE_STAGES_META: Record<EngineeringPipelineStage, EngineeringPipelineStageMeta> = {
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

/** @deprecated Use ENGINEERING_PIPELINE_STAGES_META to distinguish from VehicleDevelopmentLifecycle */
export const WORKFLOW_STAGES_META = ENGINEERING_PIPELINE_STAGES_META;

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

  // Active Engineering Pipeline Stage
  activePipelineStage: EngineeringPipelineStage;
  /** @deprecated Use activePipelineStage to distinguish from VehicleDevelopmentLifecycle */
  activeWorkflowStage: EngineeringPipelineStage;

  // Powertrain Architecture Selection Status
  isPowertrainSelecting: boolean;

  // Navigation & Permission Checks
  canEnterStage: (targetStage: EngineeringPipelineStage) => StageGateResult;

  // Actions
  setActivePipelineStage: (stage: EngineeringPipelineStage) => void;
  /** @deprecated Use setActivePipelineStage */
  setActiveWorkflowStage: (stage: EngineeringPipelineStage) => void;
  setStageStatus: (stage: EngineeringPipelineStage, status: ConfigurationStatus) => void;
  setTransmissionStatus: (status: ConfigurationStatus) => void;
  markTransmissionComplete: () => void;
  setPowertrainSelecting: (selecting: boolean) => void;
  markStageComplete: (stage: EngineeringPipelineStage) => void;

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

  activePipelineStage: "engine",
  activeWorkflowStage: "engine",
  isPowertrainSelecting: true,

  canEnterStage: (targetStage: EngineeringPipelineStage): StageGateResult => {
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

  setActivePipelineStage: (stage: EngineeringPipelineStage) => {
    const check = get().canEnterStage(stage);
    if (check.allowed) {
      set({ activePipelineStage: stage, activeWorkflowStage: stage });
    }
  },

  setActiveWorkflowStage: (stage: EngineeringPipelineStage) => {
    get().setActivePipelineStage(stage);
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
        set({ engineStatus: "configured", transmissionStatus: "configured", isPowertrainSelecting: false });
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
      activePipelineStage: "engine",
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
