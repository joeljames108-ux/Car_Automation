import { useState, useCallback, useMemo } from "react";
import {
  ComponentId,
  AssemblyPhase,
  ENGINE_ASSEMBLY_COMPONENTS,
  AssemblyComponentMeta,
} from "../sim/assemblyTypes";

export interface AssemblyState {
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  isExplodedView: boolean;
  isAutoAssembling: boolean;
  hoveredComponentId: ComponentId | null;
  history: ComponentId[];
}

export function useAssemblyStore() {
  const [installedComponents, setInstalledComponents] = useState<ComponentId[]>([]);
  const [activeComponentId, setActiveComponentId] = useState<ComponentId | null>(null);
  const [phase, setPhase] = useState<AssemblyPhase>("idle");
  const [isExplodedView, setIsExplodedView] = useState<boolean>(true);
  const [isAutoAssembling, setIsAutoAssembling] = useState<boolean>(false);
  const [hoveredComponentId, setHoveredComponentId] = useState<ComponentId | null>(null);
  const [history, setHistory] = useState<ComponentId[]>([]);

  // Check if a component can be installed based on its dependencies
  const canInstall = useCallback(
    (componentId: ComponentId): boolean => {
      if (installedComponents.includes(componentId)) return false;
      const meta = ENGINE_ASSEMBLY_COMPONENTS.find((c) => c.id === componentId);
      if (!meta) return false;
      return meta.dependencies.every((dep) => installedComponents.includes(dep));
    },
    [installedComponents]
  );

  // Calculate completion percentage
  const progressPercentage = useMemo(() => {
    return Math.round((installedComponents.length / ENGINE_ASSEMBLY_COMPONENTS.length) * 100);
  }, [installedComponents]);

  // Calculate live cumulative stat totals from installed components
  const currentStats = useMemo(() => {
    let hp = 100; // Base bare engine block HP
    let torque = 120; // Base Nm
    let weight = 0; // kg
    let reliability = 100; // %
    let cost = 0; // $

    installedComponents.forEach((id) => {
      const meta = ENGINE_ASSEMBLY_COMPONENTS.find((c) => c.id === id);
      if (meta) {
        hp += meta.statDeltas.hp;
        torque += meta.statDeltas.torque;
        weight += meta.statDeltas.weight;
        reliability += meta.statDeltas.reliability;
        cost += meta.statDeltas.cost;
      }
    });

    return {
      hp: Math.max(0, hp),
      torque: Math.max(0, torque),
      weight: Math.max(0, weight),
      reliability: Math.min(100, Math.max(0, reliability)),
      cost: Math.max(0, cost),
    };
  }, [installedComponents]);

  // Start installation sequence for a component
  const startInstall = useCallback(
    (componentId: ComponentId) => {
      if (!canInstall(componentId)) return;
      setActiveComponentId(componentId);
      setPhase("picking");
    },
    [canInstall]
  );

  // Advance animation phase
  const advancePhase = useCallback((nextPhase: AssemblyPhase) => {
    setPhase(nextPhase);
  }, []);

  // Complete installation of active component
  const completeInstall = useCallback(() => {
    if (!activeComponentId) return;
    setInstalledComponents((prev) => {
      if (prev.includes(activeComponentId)) return prev;
      return [...prev, activeComponentId];
    });
    setHistory((prev) => [...prev, activeComponentId]);
    setActiveComponentId(null);
    setPhase("idle");
  }, [activeComponentId]);

  // Skip current animation instantly
  const skipCurrentAnimation = useCallback(() => {
    if (!activeComponentId) return;
    setInstalledComponents((prev) => {
      if (prev.includes(activeComponentId)) return prev;
      return [...prev, activeComponentId];
    });
    setHistory((prev) => [...prev, activeComponentId]);
    setActiveComponentId(null);
    setPhase("idle");
  }, [activeComponentId]);

  // Reset entire assembly to empty block
  const resetAssembly = useCallback(() => {
    setInstalledComponents([]);
    setActiveComponentId(null);
    setPhase("idle");
    setIsAutoAssembling(false);
    setHistory([]);
  }, []);

  // Toggle exploded view vs condensed view
  const toggleExplodedView = useCallback(() => {
    setIsExplodedView((prev) => !prev);
  }, []);

  // Next recommended component to install
  const nextRecommendedComponent = useMemo((): AssemblyComponentMeta | null => {
    return (
      ENGINE_ASSEMBLY_COMPONENTS.find((c) => !installedComponents.includes(c.id) && canInstall(c.id)) || null
    );
  }, [installedComponents, canInstall]);

  const isAssemblyComplete = installedComponents.length === ENGINE_ASSEMBLY_COMPONENTS.length;

  return {
    installedComponents,
    activeComponentId,
    phase,
    isExplodedView,
    isAutoAssembling,
    hoveredComponentId,
    history,
    progressPercentage,
    currentStats,
    canInstall,
    startInstall,
    advancePhase,
    completeInstall,
    skipCurrentAnimation,
    resetAssembly,
    toggleExplodedView,
    setHoveredComponentId,
    setIsAutoAssembling,
    nextRecommendedComponent,
    isAssemblyComplete,
  };
}
