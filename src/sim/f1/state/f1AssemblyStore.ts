// ============================================================================
// F1 MODULAR VEHICLE ASSEMBLY — REACTIVE ASSEMBLY STORE
// ============================================================================

import { create } from "zustand";
import { F1_SOCKET_ANCHORS, type F1SocketId } from "../modular/f1Sockets";
import { F1ComponentRegistry, type F1ComponentDefinition } from "../modular/f1ComponentRegistry";
import { F1AttachmentGraph, type F1AssemblyInstalledMap, type F1AggregatedVehicleMetrics } from "../modular/f1AttachmentGraph";

export type F1SystemIsolationMode = "ALL" | "AERO" | "POWERTRAIN" | "SUSPENSION" | "CHASSIS" | "WHEELS";

export interface F1AssemblyStoreState {
  // ── Assembly State ──
  installedMap: F1AssemblyInstalledMap;
  metrics: F1AggregatedVehicleMetrics;
  selectedSocketId: F1SocketId | null;
  activeComponentPreviewId: string | null;
  
  // ── Snap Animation State ──
  snappingSocketId: F1SocketId | null;
  snappingComponentId: string | null;
  snapAnimationProgress: number; // 0 to 1

  // ── Viewport Diagnostic Modes ──
  systemIsolationMode: F1SystemIsolationMode;
  xrayMode: boolean;
  showAttachmentHotspots: boolean;
  explodedViewAmount: number; // 0.0 to 1.0

  // ── Homologation Status ──
  isHomologated: boolean;
  homologatedTimestamp: number | null;
  homologationPassportId: string | null;

  // ── History Stack ──
  undoStack: F1AssemblyInstalledMap[];
  redoStack: F1AssemblyInstalledMap[];

  // ── Actions ──
  selectSocket: (socketId: F1SocketId | null) => void;
  setPreviewComponent: (componentId: string | null) => void;
  installComponent: (componentId: string) => { success: boolean; reason?: string };
  uninstallComponent: (socketId: F1SocketId) => void;
  resetToBareChassis: () => void;
  autoAssembleFactoryBaseline: () => void;
  setSystemIsolationMode: (mode: F1SystemIsolationMode) => void;
  toggleXrayMode: () => void;
  toggleAttachmentHotspots: () => void;
  setExplodedViewAmount: (amount: number) => void;
  homologateVehicle: (passportId: string) => boolean;
  undo: () => void;
  redo: () => void;
}

export const createInitialInstalledMap = (bare = false): F1AssemblyInstalledMap => {
  const map: F1AssemblyInstalledMap = {};
  const allSockets = Object.keys(F1_SOCKET_ANCHORS) as F1SocketId[];

  if (bare) {
    // Only install the baseline survival cell, leaving all other sockets empty for construction
    map["SOCKET_SURVIVAL_CELL"] = "CHASSIS_MONOCOQUE_T800";
    allSockets.forEach((s) => {
      if (s !== "SOCKET_SURVIVAL_CELL") map[s] = null;
    });
  } else {
    // Populate all factory standard components
    allSockets.forEach((socketId) => {
      const standardComp = F1ComponentRegistry.getComponentsForSocket(socketId).find((c) => c.isFactoryStandard);
      map[socketId] = standardComp ? standardComp.id : null;
    });
  }

  return map;
};

export const useF1AssemblyStore = create<F1AssemblyStoreState>((set, get) => {
  // Start with bare chassis if player is entering construction studio
  const initialMap = createInitialInstalledMap(false);
  const initialMetrics = F1AttachmentGraph.evaluateAssembly(initialMap);

  return {
    installedMap: initialMap,
    metrics: initialMetrics,
    selectedSocketId: "SOCKET_FRONT_WING",
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
    homologationPassportId: "FIA-APX-2026-001",
    undoStack: [],
    redoStack: [],

    selectSocket: (socketId) => set({ selectedSocketId: socketId, activeComponentPreviewId: null }),

    setPreviewComponent: (componentId) => set({ activeComponentPreviewId: componentId }),

    installComponent: (componentId) => {
      const comp = F1ComponentRegistry.getComponent(componentId);
      if (!comp) return { success: false, reason: "Component definition not found." };

      const check = F1AttachmentGraph.canInstallComponent(comp, get().installedMap);
      if (!check.canInstall) {
        return { success: false, reason: check.reason };
      }

      const currentMap = get().installedMap;
      const updatedMap: F1AssemblyInstalledMap = {
        ...currentMap,
        [comp.targetSocketId]: comp.id,
      };

      const updatedMetrics = F1AttachmentGraph.evaluateAssembly(updatedMap);

      set({
        installedMap: updatedMap,
        metrics: updatedMetrics,
        activeComponentPreviewId: null,
        isHomologated: false, // Modifications invalidate previous homologation passport
        undoStack: [...get().undoStack.slice(-20), currentMap],
        redoStack: [],
        snappingSocketId: comp.targetSocketId,
        snappingComponentId: comp.id,
        snapAnimationProgress: 0.0,
      });

      // Animate snap progression smoothly
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

      const updatedMap: F1AssemblyInstalledMap = {
        ...currentMap,
        [socketId]: null,
      };

      // Also recursively uninstall dependent child sockets if parent is removed
      const allSockets = Object.keys(F1_SOCKET_ANCHORS) as F1SocketId[];
      for (const s of allSockets) {
        if (F1_SOCKET_ANCHORS[s].parentSocketId === socketId) {
          updatedMap[s] = null;
        }
      }

      const updatedMetrics = F1AttachmentGraph.evaluateAssembly(updatedMap);

      set({
        installedMap: updatedMap,
        metrics: updatedMetrics,
        isHomologated: false,
        undoStack: [...get().undoStack.slice(-20), currentMap],
        redoStack: [],
      });
    },

    resetToBareChassis: () => {
      const bareMap = createInitialInstalledMap(true);
      const metrics = F1AttachmentGraph.evaluateAssembly(bareMap);
      set({
        installedMap: bareMap,
        metrics,
        isHomologated: false,
        undoStack: [...get().undoStack.slice(-20), get().installedMap],
        redoStack: [],
      });
    },

    autoAssembleFactoryBaseline: () => {
      const fullMap = createInitialInstalledMap(false);
      const metrics = F1AttachmentGraph.evaluateAssembly(fullMap);
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
      const metrics = F1AttachmentGraph.evaluateAssembly(previous);
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
      const metrics = F1AttachmentGraph.evaluateAssembly(next);
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
