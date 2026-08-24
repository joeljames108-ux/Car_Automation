// ===================================================================
// EXTERIOR VEHICLE ASSEMBLY STORE (ZUSTAND)
// ===================================================================
// Comprehensive reactive state store powering progressive exterior
// vehicle assembly, 2D/3D synchronization, material swaps, and paint booth.
// ===================================================================

import { create } from "zustand";
import type {
  ExteriorComponentId,
  ExteriorAssemblyPhase,
  ExteriorAssemblyComponentMeta,
} from "../sim/exteriorAssemblyTypes";
import { EXTERIOR_ASSEMBLY_REGISTRY, getExteriorAssemblyComponents } from "../sim/exteriorAssemblyTypes";
import type { MaterialGrade } from "../sim/assemblyTypes";
import type {
  ExteriorEngineeringConfig,
  PaintSystemConfig,
  AeroSurfaceConfig,
  LightingConfig,
  GlassConfig,
  ExteriorWheelConfig,
  ExteriorTireConfig,
  ExteriorBrakeVisualConfig,
} from "../sim/types/exterior";
import {
  createDefaultExteriorConfig,
  createDefaultPaintConfig,
  createDefaultAeroConfig,
  createDefaultLightingConfig,
  createDefaultGlassConfig,
  createDefaultWheelConfig,
  createDefaultTireConfig,
  createDefaultBrakeVisualConfig,
} from "../sim/constants/exteriorConstants";
import { EXTERIOR_PRESET_LIBRARY } from "./exteriorAssemblyPresets";

export interface ExteriorAssemblySnapshot {
  installedComponents: ExteriorComponentId[];
  selectedVariants: Record<ExteriorComponentId, MaterialGrade>;
  exteriorConfig: ExteriorEngineeringConfig;
  paintConfig: PaintSystemConfig;
  aeroConfig: AeroSurfaceConfig;
  lightingConfig: LightingConfig;
  glassConfig: GlassConfig;
  wheelConfig: ExteriorWheelConfig;
  tireConfig: ExteriorTireConfig;
  brakeConfig: ExteriorBrakeVisualConfig;
}

export interface ExteriorAssemblyState {
  // ── 1. Progressive Assembly State ──
  installedComponents: ExteriorComponentId[];
  activeComponentId: ExteriorComponentId | null;
  phase: ExteriorAssemblyPhase;
  hoveredComponentId: ExteriorComponentId | null;
  selectedComponentId: ExteriorComponentId | null;
  isExplodedView: boolean;
  explodedAmount: number; // 0.0 to 1.0 continuous slider
  viewMode: "2d" | "3d_webgl";
  isAssemblyComplete: boolean;

  // ── 2. Component Material Grade Variants ──
  selectedVariants: Record<ExteriorComponentId, MaterialGrade>;

  // ── 3. Engineering & Styling Specifications ──
  exteriorConfig: ExteriorEngineeringConfig;
  paintConfig: PaintSystemConfig;
  aeroConfig: AeroSurfaceConfig;
  lightingConfig: LightingConfig;
  glassConfig: GlassConfig;
  wheelConfig: ExteriorWheelConfig;
  tireConfig: ExteriorTireConfig;
  brakeConfig: ExteriorBrakeVisualConfig;

  // ── 4. Undo / Redo History Stack ──
  undoStack: ExteriorAssemblySnapshot[];
  redoStack: ExteriorAssemblySnapshot[];

  // ── 5. Store Actions ──
  startInstall: (componentId: ExteriorComponentId) => void;
  advancePhase: (nextPhase: ExteriorAssemblyPhase) => void;
  completeInstall: () => void;
  skipAnimation: () => void;
  selectComponent: (componentId: ExteriorComponentId | null) => void;
  setHoveredComponentId: (componentId: ExteriorComponentId | null) => void;
  setExplodedView: (isExploded: boolean) => void;
  setExplodedAmount: (amount: number) => void;
  setViewMode: (mode: "2d" | "3d_webgl") => void;

  replaceVariant: (componentId: ExteriorComponentId, grade: MaterialGrade) => void;
  updateExteriorConfig: (partial: Partial<ExteriorEngineeringConfig>) => void;
  updatePaintConfig: (partial: Partial<PaintSystemConfig>) => void;
  updateAeroConfig: (partial: Partial<AeroSurfaceConfig>) => void;
  updateLightingConfig: (partial: Partial<LightingConfig>) => void;
  updateGlassConfig: (partial: Partial<GlassConfig>) => void;
  updateWheelConfig: (partial: Partial<ExteriorWheelConfig>) => void;
  updateTireConfig: (partial: Partial<ExteriorTireConfig>) => void;
  updateBrakeConfig: (partial: Partial<ExteriorBrakeVisualConfig>) => void;

  installAllComponents: () => void;
  resetAssembly: () => void;
  loadPreset: (presetId: string) => void;
  undo: () => void;
  redo: () => void;

  // ── 6. Computed Selectors & Queries ──
  getBuildProgress: () => number; // 0 to 100%
  getNextAvailableComponent: () => ExteriorAssemblyComponentMeta | null;
  isComponentInstallable: (componentId: ExteriorComponentId) => boolean;
  getTotalExteriorWeight: () => number; // kg
  getTotalExteriorCost: () => number;   // $
  getTotalAeroDragCd: () => number;     // Delta Cd
  getTotalAeroDownforceKg: () => number;// kg @ 200 km/h
  getTotalTorsionalRigidityKNm: () => number; // kNm/deg
}

// Initial Default Variant Map
const INITIAL_VARIANT_MAP: Record<ExteriorComponentId, MaterialGrade> = EXTERIOR_ASSEMBLY_REGISTRY.reduce(
  (acc, comp) => {
    acc[comp.id] = (comp.id === "chassis_frame" ? "billet" : "forged") as MaterialGrade;
    return acc;
  },
  {} as Record<ExteriorComponentId, MaterialGrade>
);

export const useExteriorAssemblyStore = create<ExteriorAssemblyState>((set, get) => ({
  // ── 1. Initial State ──
  installedComponents: ["chassis_frame"],
  activeComponentId: null,
  phase: "idle",
  hoveredComponentId: null,
  selectedComponentId: "chassis_frame",
  isExplodedView: false,
  explodedAmount: 0.0,
  viewMode: "2d",
  isAssemblyComplete: false,

  selectedVariants: { ...INITIAL_VARIANT_MAP },

  exteriorConfig: createDefaultExteriorConfig(),
  paintConfig: createDefaultPaintConfig(),
  aeroConfig: createDefaultAeroConfig(),
  lightingConfig: createDefaultLightingConfig(),
  glassConfig: createDefaultGlassConfig(),
  wheelConfig: createDefaultWheelConfig(),
  tireConfig: createDefaultTireConfig(),
  brakeConfig: createDefaultBrakeVisualConfig(),

  undoStack: [],
  redoStack: [],

  // ── 2. Assembly Workflow Actions ──
  startInstall: (componentId: ExteriorComponentId) => {
    const { installedComponents, isComponentInstallable } = get();
    if (installedComponents.includes(componentId) || !isComponentInstallable(componentId)) {
      return;
    }

    set({
      activeComponentId: componentId,
      phase: "picking",
      selectedComponentId: componentId,
    });
  },

  advancePhase: (nextPhase: ExteriorAssemblyPhase) => {
    set({ phase: nextPhase });
  },

  completeInstall: () => {
    const { activeComponentId, installedComponents, undoStack } = get();
    if (!activeComponentId) return;

    // Snapshot state for undo
    const snapshot: ExteriorAssemblySnapshot = {
      installedComponents: [...installedComponents],
      selectedVariants: { ...get().selectedVariants },
      exteriorConfig: { ...get().exteriorConfig },
      paintConfig: { ...get().paintConfig },
      aeroConfig: { ...get().aeroConfig },
      lightingConfig: { ...get().lightingConfig },
      glassConfig: { ...get().glassConfig },
      wheelConfig: { ...get().wheelConfig },
      tireConfig: { ...get().tireConfig },
      brakeConfig: { ...get().brakeConfig },
    };

    const nextInstalled = [...new Set([...installedComponents, activeComponentId])];
    const allTotal = EXTERIOR_ASSEMBLY_REGISTRY.length;
    const isComplete = nextInstalled.length >= allTotal;

    set({
      installedComponents: nextInstalled,
      activeComponentId: null,
      phase: "idle",
      selectedComponentId: activeComponentId,
      isAssemblyComplete: isComplete,
      undoStack: [...undoStack.slice(-20), snapshot],
      redoStack: [],
    });
  },

  skipAnimation: () => {
    const { activeComponentId } = get();
    if (activeComponentId) {
      get().completeInstall();
    }
  },

  selectComponent: (componentId: ExteriorComponentId | null) => {
    set({ selectedComponentId: componentId });
  },

  setHoveredComponentId: (componentId: ExteriorComponentId | null) => {
    set({ hoveredComponentId: componentId });
  },

  setExplodedView: (isExploded: boolean) => {
    set({
      isExplodedView: isExploded,
      explodedAmount: isExploded ? 1.0 : 0.0,
    });
  },

  setExplodedAmount: (amount: number) => {
    set({
      explodedAmount: Math.max(0.0, Math.min(1.0, amount)),
      isExplodedView: amount > 0.05,
    });
  },

  setViewMode: (mode: "2d" | "3d_webgl") => {
    set({ viewMode: mode });
  },

  // ── 3. Configuration & Material Variant Actions ──
  replaceVariant: (componentId: ExteriorComponentId, grade: MaterialGrade) => {
    set((state) => ({
      selectedVariants: {
        ...state.selectedVariants,
        [componentId]: grade,
      },
    }));
  },

  updateExteriorConfig: (partial: Partial<ExteriorEngineeringConfig>) => {
    set((state) => ({
      exteriorConfig: { ...state.exteriorConfig, ...partial },
    }));
  },

  updatePaintConfig: (partial: Partial<PaintSystemConfig>) => {
    set((state) => ({
      paintConfig: { ...state.paintConfig, ...partial },
    }));
  },

  updateAeroConfig: (partial: Partial<AeroSurfaceConfig>) => {
    set((state) => ({
      aeroConfig: { ...state.aeroConfig, ...partial },
    }));
  },

  updateLightingConfig: (partial: Partial<LightingConfig>) => {
    set((state) => ({
      lightingConfig: { ...state.lightingConfig, ...partial },
    }));
  },

  updateGlassConfig: (partial: Partial<GlassConfig>) => {
    set((state) => ({
      glassConfig: { ...state.glassConfig, ...partial },
    }));
  },

  updateWheelConfig: (partial: Partial<ExteriorWheelConfig>) => {
    set((state) => ({
      wheelConfig: { ...state.wheelConfig, ...partial },
    }));
  },

  updateTireConfig: (partial: Partial<ExteriorTireConfig>) => {
    set((state) => ({
      tireConfig: { ...state.tireConfig, ...partial },
    }));
  },

  updateBrakeConfig: (partial: Partial<ExteriorBrakeVisualConfig>) => {
    set((state) => ({
      brakeConfig: { ...state.brakeConfig, ...partial },
    }));
  },

  installAllComponents: () => {
    const allIds = EXTERIOR_ASSEMBLY_REGISTRY.map((c) => c.id);
    set({
      installedComponents: allIds,
      activeComponentId: null,
      phase: "idle",
      isAssemblyComplete: true,
    });
  },

  resetAssembly: () => {
    set({
      installedComponents: ["chassis_frame"],
      activeComponentId: null,
      phase: "idle",
      selectedComponentId: "chassis_frame",
      isAssemblyComplete: false,
      isExplodedView: false,
      explodedAmount: 0.0,
      undoStack: [],
      redoStack: [],
    });
  },

  loadPreset: (presetId: string) => {
    const preset = EXTERIOR_PRESET_LIBRARY.find((p) => p.id === presetId);
    if (!preset) return;

    set({
      installedComponents: EXTERIOR_ASSEMBLY_REGISTRY.map((c) => c.id),
      selectedVariants: { ...preset.variants },
      exteriorConfig: { ...preset.exteriorConfig },
      paintConfig: { ...preset.paintConfig },
      aeroConfig: { ...preset.aeroConfig },
      lightingConfig: { ...preset.lightingConfig },
      glassConfig: { ...preset.glassConfig },
      wheelConfig: { ...preset.wheelConfig },
      tireConfig: { ...preset.tireConfig },
      brakeConfig: { ...preset.brakeConfig },
      isAssemblyComplete: true,
      activeComponentId: null,
      phase: "idle",
    });
  },

  undo: () => {
    const { undoStack, redoStack } = get();
    if (undoStack.length === 0) return;

    const previousSnapshot = undoStack[undoStack.length - 1];
    const currentSnapshot: ExteriorAssemblySnapshot = {
      installedComponents: [...get().installedComponents],
      selectedVariants: { ...get().selectedVariants },
      exteriorConfig: { ...get().exteriorConfig },
      paintConfig: { ...get().paintConfig },
      aeroConfig: { ...get().aeroConfig },
      lightingConfig: { ...get().lightingConfig },
      glassConfig: { ...get().glassConfig },
      wheelConfig: { ...get().wheelConfig },
      tireConfig: { ...get().tireConfig },
      brakeConfig: { ...get().brakeConfig },
    };

    set({
      ...previousSnapshot,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, currentSnapshot],
      activeComponentId: null,
      phase: "idle",
    });
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    if (redoStack.length === 0) return;

    const nextSnapshot = redoStack[redoStack.length - 1];
    const currentSnapshot: ExteriorAssemblySnapshot = {
      installedComponents: [...get().installedComponents],
      selectedVariants: { ...get().selectedVariants },
      exteriorConfig: { ...get().exteriorConfig },
      paintConfig: { ...get().paintConfig },
      aeroConfig: { ...get().aeroConfig },
      lightingConfig: { ...get().lightingConfig },
      glassConfig: { ...get().glassConfig },
      wheelConfig: { ...get().wheelConfig },
      tireConfig: { ...get().tireConfig },
      brakeConfig: { ...get().brakeConfig },
    };

    set({
      ...nextSnapshot,
      undoStack: [...undoStack, currentSnapshot],
      redoStack: redoStack.slice(0, -1),
      activeComponentId: null,
      phase: "idle",
    });
  },

  // ── 4. Computed Metrics & Selectors ──
  getBuildProgress: () => {
    const { installedComponents } = get();
    const total = EXTERIOR_ASSEMBLY_REGISTRY.length;
    return Math.round((installedComponents.length / total) * 100);
  },

  getNextAvailableComponent: () => {
    const { installedComponents, isComponentInstallable } = get();
    for (const comp of EXTERIOR_ASSEMBLY_REGISTRY) {
      if (!installedComponents.includes(comp.id) && isComponentInstallable(comp.id)) {
        return comp;
      }
    }
    return null;
  },

  isComponentInstallable: (componentId: ExteriorComponentId) => {
    const { installedComponents } = get();
    const comp = EXTERIOR_ASSEMBLY_REGISTRY.find((c) => c.id === componentId);
    if (!comp) return false;
    if (comp.dependencies.length === 0) return true;
    return comp.dependencies.every((dep) => installedComponents.includes(dep));
  },

  getTotalExteriorWeight: () => {
    const { installedComponents, selectedVariants } = get();
    return installedComponents.reduce((acc, id) => {
      const comp = EXTERIOR_ASSEMBLY_REGISTRY.find((c) => c.id === id);
      if (!comp) return acc;
      const variantGrade = selectedVariants[id] || "forged";
      const variantMeta = comp.variants.find((v) => v.id === variantGrade);
      const mult = variantMeta ? variantMeta.weightMultiplier : 1.0;
      return acc + comp.statDeltas.weight * mult;
    }, 0);
  },

  getTotalExteriorCost: () => {
    const { installedComponents, selectedVariants } = get();
    return installedComponents.reduce((acc, id) => {
      const comp = EXTERIOR_ASSEMBLY_REGISTRY.find((c) => c.id === id);
      if (!comp) return acc;
      const variantGrade = selectedVariants[id] || "forged";
      const variantMeta = comp.variants.find((v) => v.id === variantGrade);
      const mult = variantMeta ? variantMeta.costMultiplier : 1.0;
      return acc + comp.statDeltas.cost * mult;
    }, 0);
  },

  getTotalAeroDragCd: () => {
    const { installedComponents } = get();
    return installedComponents.reduce((acc, id) => {
      const comp = EXTERIOR_ASSEMBLY_REGISTRY.find((c) => c.id === id);
      return acc + (comp ? comp.statDeltas.dragCd : 0);
    }, 0.32); // Baseline sports car Cd
  },

  getTotalAeroDownforceKg: () => {
    const { installedComponents } = get();
    return installedComponents.reduce((acc, id) => {
      const comp = EXTERIOR_ASSEMBLY_REGISTRY.find((c) => c.id === id);
      return acc + (comp ? comp.statDeltas.downforceKg : 0);
    }, 0);
  },

  getTotalTorsionalRigidityKNm: () => {
    const { installedComponents, selectedVariants } = get();
    const baseTub = 28.5;
    const addedRigidity = installedComponents.reduce((acc, id) => {
      const comp = EXTERIOR_ASSEMBLY_REGISTRY.find((c) => c.id === id);
      return acc + (comp ? comp.statDeltas.rigidity : 0);
    }, 0);
    return Math.round((baseTub + addedRigidity) * 10) / 10;
  },
}));
