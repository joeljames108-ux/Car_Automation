// ============================================================================
// HYPERCAR MODULAR VEHICLE ASSEMBLY — REACTIVE STATE STORE
// ============================================================================

import { create } from "zustand";
import { HYPERCAR_SOCKET_ANCHORS, type HypercarSocketId } from "../modular/hypercarSockets";
import { HypercarComponentRegistry, type HypercarComponentDefinition } from "../modular/hypercarComponentRegistry";
import { HypercarAttachmentGraph, type HypercarAssemblyInstalledMap, type HypercarAggregatedMetrics } from "../modular/hypercarAttachmentGraph";

export type HypercarSystemIsolationMode =
  | "ALL"
  | "BODYWORK"
  | "AERO"
  | "HYBRID_POWERTRAIN"
  | "COOLING"
  | "CHASSIS"
  | "SUSPENSION"
  | "WHEELS";

export interface HypercarAssemblyStoreState {
  installedMap: HypercarAssemblyInstalledMap;
  metrics: HypercarAggregatedMetrics;
  selectedSocketId: HypercarSocketId | null;
  activeComponentPreviewId: string | null;

  // Snap Animation
  snappingSocketId: HypercarSocketId | null;
  snappingComponentId: string | null;
  snapAnimationProgress: number;

  // Viewport Modes
  systemIsolationMode: HypercarSystemIsolationMode;
  xrayMode: boolean;
  showAttachmentHotspots: boolean;
  explodedViewAmount: number;

  // Homologation Status
  isHomologated: boolean;
  homologatedTimestamp: number | null;
  homologationPassportId: string | null;

  // Undo/Redo
  undoStack: HypercarAssemblyInstalledMap[];
  redoStack: HypercarAssemblyInstalledMap[];

  // Actions
  selectSocket: (socketId: HypercarSocketId | null) => void;
  setPreviewComponent: (componentId: string | null) => void;
  installComponent: (componentId: string) => { success: boolean; reason?: string };
  uninstallComponent: (socketId: HypercarSocketId) => void;
  resetToBareChassis: () => void;
  autoAssembleFactoryBaseline: () => void;
  setSystemIsolationMode: (mode: HypercarSystemIsolationMode) => void;
  toggleXrayMode: () => void;
  toggleAttachmentHotspots: () => void;
  setExplodedViewAmount: (amount: number) => void;
  homologateVehicle: (passportId: string) => boolean;
  undo: () => void;
  redo: () => void;
}

export const createInitialHypercarMap = (bare = false): HypercarAssemblyInstalledMap => {
  const map: HypercarAssemblyInstalledMap = {};
  const allSockets = Object.keys(HYPERCAR_SOCKET_ANCHORS) as HypercarSocketId[];

  if (bare) {
    map["SOCKET_CENTRAL_MONOCOQUE"] = "HYPERCAR_CHASSIS_T800_ENCLOSED";
    allSockets.forEach((s) => {
      if (s !== "SOCKET_CENTRAL_MONOCOQUE") map[s] = null;
    });
  } else {
    allSockets.forEach((socketId) => {
      const standardComp = HypercarComponentRegistry.getComponentsForSocket(socketId).find((c) => c.isFactoryStandard);
      map[socketId] = standardComp ? standardComp.id : null;
    });
  }

  return map;
};

export const useHypercarAssemblyStore = create<HypercarAssemblyStoreState>((set, get) => {
  const initialMap = createInitialHypercarMap(false);
  const initialMetrics = HypercarAttachmentGraph.evaluateAssembly(initialMap);

  return {
    installedMap: initialMap,
    metrics: initialMetrics,
    selectedSocketId: "SOCKET_FRONT_SPLITTER",
    activeComponentPreviewId: null,
    snappingSocketId: null,
    snappingComponentId: null,
    snapAnimationProgress: 1.0,
    systemIsolationMode: "ALL",
    xrayMode: false,
    showAttachmentHotspots: true,
    explodedViewAmount: 0.0,
    isHomologated: true,
    homologatedTimestamp: Date.now(),
    homologationPassportId: "FIA-WEC-APX-LMH-001",
    undoStack: [],
    redoStack: [],

    selectSocket: (socketId) => set({ selectedSocketId: socketId, activeComponentPreviewId: null }),
    setPreviewComponent: (componentId) => set({ activeComponentPreviewId: componentId }),

    installComponent: (componentId) => {
      const comp = HypercarComponentRegistry.getComponent(componentId);
      if (!comp) return { success: false, reason: "Component definition not found." };

      const check = HypercarAttachmentGraph.canInstallComponent(comp, get().installedMap);
      if (!check.canInstall) return { success: false, reason: check.reason };

      const currentMap = get().installedMap;
      const updatedMap: HypercarAssemblyInstalledMap = {
        ...currentMap,
        [comp.targetSocketId]: comp.id,
      };

      const updatedMetrics = HypercarAttachmentGraph.evaluateAssembly(updatedMap);

      set({
        installedMap: updatedMap,
        metrics: updatedMetrics,
        activeComponentPreviewId: null,
        isHomologated: false,
        undoStack: [...get().undoStack.slice(-20), currentMap],
        redoStack: [],
        snappingSocketId: comp.targetSocketId,
        snappingComponentId: comp.id,
        snapAnimationProgress: 0.0,
      });

      let prog = 0;
      const interval = setInterval(() => {
        prog += 0.2;
        if (prog >= 1.0) {
          clearInterval(interval);
          set({ snapAnimationProgress: 1.0, snappingSocketId: null, snappingComponentId: null });
        } else {
          set({ snapAnimationProgress: prog });
        }
      }, 30);

      return { success: true };
    },

    uninstallComponent: (socketId) => {
      const currentMap = get().installedMap;
      if (!currentMap[socketId]) return;

      const updatedMap: HypercarAssemblyInstalledMap = {
        ...currentMap,
        [socketId]: null,
      };

      const allSockets = Object.keys(HYPERCAR_SOCKET_ANCHORS) as HypercarSocketId[];
      for (const s of allSockets) {
        if (HYPERCAR_SOCKET_ANCHORS[s].parentSocketId === socketId) {
          updatedMap[s] = null;
        }
      }

      const updatedMetrics = HypercarAttachmentGraph.evaluateAssembly(updatedMap);

      set({
        installedMap: updatedMap,
        metrics: updatedMetrics,
        isHomologated: false,
        undoStack: [...get().undoStack.slice(-20), currentMap],
        redoStack: [],
      });
    },

    resetToBareChassis: () => {
      const bareMap = createInitialHypercarMap(true);
      const metrics = HypercarAttachmentGraph.evaluateAssembly(bareMap);
      set({
        installedMap: bareMap,
        metrics,
        isHomologated: false,
        undoStack: [...get().undoStack.slice(-20), get().installedMap],
        redoStack: [],
      });
    },

    autoAssembleFactoryBaseline: () => {
      const fullMap = createInitialHypercarMap(false);
      const metrics = HypercarAttachmentGraph.evaluateAssembly(fullMap);
      set({
        installedMap: fullMap,
        metrics,
        isHomologated: metrics.isCompleteAndLegal,
        undoStack: [...get().undoStack.slice(-20), get().installedMap],
        redoStack: [],
      });
    },

    setSystemIsolationMode: (mode) => set({ systemIsolationMode: mode }),
    toggleXrayMode: () => set((s) => ({ xrayMode: !s.xrayMode })),
    toggleAttachmentHotspots: () => set((s) => ({ showAttachmentHotspots: !s.showAttachmentHotspots })),
    setExplodedViewAmount: (amount) => set({ explodedViewAmount: Math.max(0, Math.min(1, amount)) }),

    homologateVehicle: (passportId) => {
      const { metrics } = get();
      if (!metrics.isCompleteAndLegal) return false;

      set({
        isHomologated: true,
        homologatedTimestamp: Date.now(),
        homologationPassportId: passportId,
      });
      return true;
    },

    undo: () => {
      const { undoStack, installedMap, redoStack } = get();
      if (undoStack.length === 0) return;
      const previous = undoStack[undoStack.length - 1];
      const newUndo = undoStack.slice(0, -1);
      const metrics = HypercarAttachmentGraph.evaluateAssembly(previous);
      set({
        installedMap: previous,
        metrics,
        isHomologated: false,
        undoStack: newUndo,
        redoStack: [installedMap, ...redoStack],
      });
    },

    redo: () => {
      const { redoStack, installedMap, undoStack } = get();
      if (redoStack.length === 0) return;
      const next = redoStack[0];
      const newRedo = redoStack.slice(1);
      const metrics = HypercarAttachmentGraph.evaluateAssembly(next);
      set({
        installedMap: next,
        metrics,
        isHomologated: false,
        undoStack: [...undoStack, installedMap],
        redoStack: newRedo,
      });
    },
  };
});
