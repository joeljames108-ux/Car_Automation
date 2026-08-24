/**
 * ============================================================================
 * ASSEMBLY HISTORY, UNDO/REDO & VERSION STORE
 * ============================================================================
 * Manages full undo/redo stacks, timeline scrubbing/rewind, and immutable
 * design freeze snapshots (e.g. GT3 V1.0 vs V1.1).
 */

import { useState, useCallback } from "react";
import { InstalledSubsystemsState, AssemblyStageId } from "../components/vehicleAssembly/scene/ModularAssemblySceneGraph";

export interface VersionSnapshot {
  id: string;
  name: string;
  timestamp: number;
  stageReached: AssemblyStageId;
  totalMassKg: number;
  healthScore: number;
  frozen: boolean;
  state: InstalledSubsystemsState;
}

export interface AssemblyHistoryManager {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => InstalledSubsystemsState | null;
  redo: () => InstalledSubsystemsState | null;
  pushState: (newState: InstalledSubsystemsState) => void;
  resetVehicle: () => InstalledSubsystemsState;
  versions: VersionSnapshot[];
  saveVersion: (name: string, healthScore: number, massKg: number, freeze?: boolean) => VersionSnapshot;
  loadVersion: (versionId: string) => InstalledSubsystemsState | null;
  isCurrentFrozen: boolean;
  toggleFreezeCurrent: () => void;
}

export function useAssemblyHistory(
  initialState: InstalledSubsystemsState,
  onStateRevert?: (revertedState: InstalledSubsystemsState) => void
): AssemblyHistoryManager {
  const [past, setPast] = useState<InstalledSubsystemsState[]>([]);
  const [present, setPresent] = useState<InstalledSubsystemsState>(initialState);
  const [future, setFuture] = useState<InstalledSubsystemsState[]>([]);
  const [versions, setVersions] = useState<VersionSnapshot[]>([
    {
      id: "v1_baseline",
      name: "GT3 Competition V1.0 (Baseline)",
      timestamp: Date.now(),
      stageReached: "complete",
      totalMassKg: 1185,
      healthScore: 96,
      frozen: true,
      state: JSON.parse(JSON.stringify(initialState)),
    },
  ]);
  const [isCurrentFrozen, setIsCurrentFrozen] = useState<boolean>(false);

  const pushState = useCallback((newState: InstalledSubsystemsState) => {
    setPast((prev) => [...prev.slice(-30), present]);
    setPresent(newState);
    setFuture([]);
  }, [present]);

  const undo = useCallback((): InstalledSubsystemsState | null => {
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture((prev) => [present, ...prev]);
    setPresent(previous);
    setPast(newPast);

    if (onStateRevert) onStateRevert(previous);
    return previous;
  }, [past, present, onStateRevert]);

  const redo = useCallback((): InstalledSubsystemsState | null => {
    if (future.length === 0) return null;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast((prev) => [...prev, present]);
    setPresent(next);
    setFuture(newFuture);

    if (onStateRevert) onStateRevert(next);
    return next;
  }, [future, present, onStateRevert]);

  const resetVehicle = useCallback((): InstalledSubsystemsState => {
    const cleanState: InstalledSubsystemsState = {
      ...present,
      installedStages: new Set<AssemblyStageId>(["chassis"]),
    };
    pushState(cleanState);
    return cleanState;
  }, [present, pushState]);

  const saveVersion = useCallback(
    (name: string, healthScore: number, massKg: number, freeze = false): VersionSnapshot => {
      const newVersion: VersionSnapshot = {
        id: `ver_${Date.now()}`,
        name,
        timestamp: Date.now(),
        stageReached: "complete",
        totalMassKg: massKg,
        healthScore,
        frozen: freeze,
        state: JSON.parse(JSON.stringify(present)),
      };
      setVersions((prev) => [newVersion, ...prev]);
      if (freeze) setIsCurrentFrozen(true);
      return newVersion;
    },
    [present]
  );

  const loadVersion = useCallback(
    (versionId: string): InstalledSubsystemsState | null => {
      const found = versions.find((v) => v.id === versionId);
      if (!found) return null;
      const loadedState = JSON.parse(JSON.stringify(found.state));
      pushState(loadedState);
      setIsCurrentFrozen(found.frozen);
      if (onStateRevert) onStateRevert(loadedState);
      return loadedState;
    },
    [versions, pushState, onStateRevert]
  );

  const toggleFreezeCurrent = useCallback(() => {
    setIsCurrentFrozen((prev) => !prev);
  }, []);

  return {
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undo,
    redo,
    pushState,
    resetVehicle,
    versions,
    saveVersion,
    loadVersion,
    isCurrentFrozen,
    toggleFreezeCurrent,
  };
}
