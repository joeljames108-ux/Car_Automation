// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — REACTIVE ZUSTAND CONSTRUCTOR STORE
// ============================================================================
// Complete state management for F1 car engineering, undo/redo history stacks,
// cost cap expenditures, live technical evaluations, and 3D studio controls.
// ============================================================================

import { create } from "zustand";
import type { F1CarDesign, F1MonocoqueSpec, F1PowerUnitSpec, F1AeroSpec, F1SuspensionSpec, F1GearboxSpec, F1BrakeSpec, F1CockpitAndElectronicsSpec, F1LiverySpec } from "../types/f1Types";
import type { F1WorkshopStepId } from "./f1BuildStateMachine";
import { DEFAULT_F1_CAR } from "../chassis/defaultF1Car";
import { F1PhysicsEngine } from "../physics/f1PhysicsEngine";
import { F1ProgressTracker, type F1SubsystemCompletionStatus } from "./f1ProgressTracker";

export interface F1ConstructorStoreState {
  // ── Active Car Design ──
  car: F1CarDesign;
  activeStep: F1WorkshopStepId;
  completionMap: Record<F1WorkshopStepId, F1SubsystemCompletionStatus>;
  
  // ── History Stack (Undo/Redo) ──
  undoStack: F1CarDesign[];
  redoStack: F1CarDesign[];
  
  // ── 3D Viewport Controls ──
  cameraPreset: "ORBIT_HERO" | "AERO_TUNNEL" | "COCKPIT_POV" | "FRONT_WING_MACRO" | "REAR_DIFFUSER_MACRO" | "ENGINE_CUTAWAY";
  explodedViewAmount: number; // 0.0 to 1.0
  wireframeMode: boolean;
  showAeroStreamlines: boolean;
  showPressureHeatmap: boolean;
  isEngineRevving: boolean;
  engineRpm: number;

  // ── Financials & Cost Cap ──
  budgetCapMaxUsd: number;
  totalBudgetSpentUsd: number;

  // ── Actions ──
  setActiveStep: (step: F1WorkshopStepId) => void;
  updateMonocoque: (patch: Partial<F1MonocoqueSpec>) => void;
  updatePowerUnit: (patch: Partial<F1PowerUnitSpec>) => void;
  updateAero: (patch: Partial<F1AeroSpec>) => void;
  updateSuspension: (patch: Partial<F1SuspensionSpec>) => void;
  updateGearbox: (patch: Partial<F1GearboxSpec>) => void;
  updateBrakes: (patch: Partial<F1BrakeSpec>) => void;
  updateCockpit: (patch: Partial<F1CockpitAndElectronicsSpec>) => void;
  updateLivery: (patch: Partial<F1LiverySpec>) => void;
  resetToFactoryBaseline: () => void;
  loadCarDesign: (design: F1CarDesign) => void;
  undo: () => void;
  redo: () => void;
  setCameraPreset: (preset: F1ConstructorStoreState["cameraPreset"]) => void;
  setExplodedViewAmount: (val: number) => void;
  toggleWireframe: () => void;
  toggleAeroStreamlines: () => void;
  togglePressureHeatmap: () => void;
  setEngineRpm: (rpm: number) => void;
  setIsEngineRevving: (revving: boolean) => void;
}

export const useF1ConstructorStore = create<F1ConstructorStoreState>((set, get) => {
  const initialCar = F1PhysicsEngine.evaluateCar(DEFAULT_F1_CAR);

  const applyCarUpdate = (updatedCar: F1CarDesign) => {
    const currentCar = get().car;
    const evaluated = F1PhysicsEngine.evaluateCar(updatedCar);
    const completionMap = F1ProgressTracker.calculateSubsystemProgress(evaluated);

    set({
      car: evaluated,
      completionMap,
      undoStack: [...get().undoStack.slice(-25), currentCar],
      redoStack: [],
      totalBudgetSpentUsd: evaluated.computedEstCostMillionUsd * 1_000_000,
    });
  };

  return {
    car: initialCar,
    activeStep: "overview",
    completionMap: F1ProgressTracker.calculateSubsystemProgress(initialCar),
    undoStack: [],
    redoStack: [],
    cameraPreset: "ORBIT_HERO",
    explodedViewAmount: 0.0,
    wireframeMode: false,
    showAeroStreamlines: false,
    showPressureHeatmap: false,
    isEngineRevving: false,
    engineRpm: 4500,
    budgetCapMaxUsd: 140_000_000,
    totalBudgetSpentUsd: initialCar.computedEstCostMillionUsd * 1_000_000,

    setActiveStep: (step) => set({ activeStep: step }),

    updateMonocoque: (patch) => {
      const updated: F1CarDesign = {
        ...get().car,
        monocoque: { ...get().car.monocoque, ...patch },
      };
      applyCarUpdate(updated);
    },

    updatePowerUnit: (patch) => {
      const updated: F1CarDesign = {
        ...get().car,
        powerUnit: { ...get().car.powerUnit, ...patch },
      };
      applyCarUpdate(updated);
    },

    updateAero: (patch) => {
      const updated: F1CarDesign = {
        ...get().car,
        aero: { ...get().car.aero, ...patch },
      };
      applyCarUpdate(updated);
    },

    updateSuspension: (patch) => {
      const updated: F1CarDesign = {
        ...get().car,
        suspension: { ...get().car.suspension, ...patch },
      };
      applyCarUpdate(updated);
    },

    updateGearbox: (patch) => {
      const updated: F1CarDesign = {
        ...get().car,
        gearbox: { ...get().car.gearbox, ...patch },
      };
      applyCarUpdate(updated);
    },

    updateBrakes: (patch) => {
      const updated: F1CarDesign = {
        ...get().car,
        brakes: { ...get().car.brakes, ...patch },
      };
      applyCarUpdate(updated);
    },

    updateCockpit: (patch) => {
      const updated: F1CarDesign = {
        ...get().car,
        cockpit: { ...get().car.cockpit, ...patch },
      };
      applyCarUpdate(updated);
    },

    updateLivery: (patch) => {
      const updated: F1CarDesign = {
        ...get().car,
        livery: { ...get().car.livery, ...patch },
      };
      applyCarUpdate(updated);
    },

    resetToFactoryBaseline: () => {
      applyCarUpdate(DEFAULT_F1_CAR);
    },

    loadCarDesign: (design) => {
      applyCarUpdate(design);
    },

    undo: () => {
      const { undoStack, car, redoStack } = get();
      if (undoStack.length === 0) return;
      const previous = undoStack[undoStack.length - 1];
      const newUndo = undoStack.slice(0, -1);
      const evaluated = F1PhysicsEngine.evaluateCar(previous);
      set({
        car: evaluated,
        completionMap: F1ProgressTracker.calculateSubsystemProgress(evaluated),
        undoStack: newUndo,
        redoStack: [car, ...redoStack],
        totalBudgetSpentUsd: evaluated.computedEstCostMillionUsd * 1_000_000,
      });
    },

    redo: () => {
      const { redoStack, car, undoStack } = get();
      if (redoStack.length === 0) return;
      const next = redoStack[0];
      const newRedo = redoStack.slice(1);
      const evaluated = F1PhysicsEngine.evaluateCar(next);
      set({
        car: evaluated,
        completionMap: F1ProgressTracker.calculateSubsystemProgress(evaluated),
        undoStack: [...undoStack, car],
        redoStack: newRedo,
        totalBudgetSpentUsd: evaluated.computedEstCostMillionUsd * 1_000_000,
      });
    },

    setCameraPreset: (preset) => set({ cameraPreset: preset }),
    setExplodedViewAmount: (val) => set({ explodedViewAmount: Math.max(0, Math.min(1, val)) }),
    toggleWireframe: () => set((s) => ({ wireframeMode: !s.wireframeMode })),
    toggleAeroStreamlines: () => set((s) => ({ showAeroStreamlines: !s.showAeroStreamlines })),
    togglePressureHeatmap: () => set((s) => ({ showPressureHeatmap: !s.showPressureHeatmap })),
    setEngineRpm: (rpm) => set({ engineRpm: Math.max(1000, Math.min(15000, rpm)) }),
    setIsEngineRevving: (revving) => set({ isEngineRevving: revving }),
  };
});
