import { useState, useCallback, useMemo } from "react";
import {
  ComponentId,
  AssemblyPhase,
  ENGINE_ASSEMBLY_COMPONENTS,
  AssemblyComponentMeta,
  getAssemblyComponents,
  MaterialGrade,
} from "../sim/assemblyTypes";
import { EngineConfig } from "../sim/types";

export interface AssemblyState {
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  isExplodedView: boolean;
  isAutoAssembling: boolean;
  hoveredComponentId: ComponentId | null;
  history: ComponentId[];
  selectedVariants: Record<string, MaterialGrade>;
}

export function useAssemblyStore(engineConfig?: Partial<EngineConfig>) {
  const [installedComponents, setInstalledComponents] = useState<ComponentId[]>([]);
  const [activeComponentId, setActiveComponentId] = useState<ComponentId | null>(null);
  const [phase, setPhase] = useState<AssemblyPhase>("idle");
  const [isExplodedView, setIsExplodedView] = useState<boolean>(true);
  const [isAutoAssembling, setIsAutoAssembling] = useState<boolean>(false);
  const [hoveredComponentId, setHoveredComponentId] = useState<ComponentId | null>(null);
  const [history, setHistory] = useState<ComponentId[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, MaterialGrade>>({
    block: "cast",
    crankshaft: "forged",
    pistons: "forged",
    rods: "forged",
    camshaft: "forged",
    head_gasket: "forged",
    cylinder_head: "billet",
    valves: "titanium",
    intake_manifold: "billet",
    exhaust_headers: "forged",
    turbocharger: "titanium",
    oil_pan: "cast",
    hybrid_motor: "forged",
    inverter_ecu: "billet",
  });

  const setSelectedVariant = useCallback((componentId: ComponentId, variant: MaterialGrade) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [componentId]: variant,
    }));
  }, []);

  // Dynamically resolve component list based on ICE vs EV vs Hybrid configuration
  const componentsList = useMemo(() => {
    return getAssemblyComponents(engineConfig);
  }, [engineConfig]);

  // Check if a component can be installed based on its dependencies
  const canInstall = useCallback(
    (componentId: ComponentId): boolean => {
      if (installedComponents.includes(componentId)) return false;
      const meta = componentsList.find((c) => c.id === componentId);
      if (!meta) return false;
      return meta.dependencies.every((dep) => installedComponents.includes(dep));
    },
    [installedComponents, componentsList]
  );

  // Calculate completion percentage
  const progressPercentage = useMemo(() => {
    if (componentsList.length === 0) return 0;
    return Math.round((installedComponents.length / componentsList.length) * 100);
  }, [installedComponents, componentsList]);

  // Calculate live cumulative stat totals from installed components & material variants
  const currentStats = useMemo(() => {
    let hp = 100; // Base bare engine block HP
    let torque = 120; // Base Nm
    let weight = 0; // kg
    let reliability = 100; // %
    let cost = 0; // $

    installedComponents.forEach((id) => {
      const meta = componentsList.find((c) => c.id === id);
      if (meta) {
        const variantId = selectedVariants[id] || "cast";
        const variantObj = meta.variants.find((v) => v.id === variantId) || meta.variants[0];
        const hpMult = variantObj ? variantObj.hpMultiplier : 1;
        const weightMult = variantObj ? variantObj.weightMultiplier : 1;
        const costMult = variantObj ? variantObj.costMultiplier : 1;
        const relDelta = variantObj ? variantObj.reliabilityDelta : 0;

        hp += Math.round(meta.statDeltas.hp * hpMult);
        torque += Math.round(meta.statDeltas.torque * hpMult);
        weight += Math.round(meta.statDeltas.weight * weightMult);
        reliability += relDelta;
        cost += Math.round(meta.statDeltas.cost * costMult);
      }
    });

    return {
      hp: Math.max(0, hp),
      torque: Math.max(0, torque),
      weight: Math.max(0, weight),
      reliability: Math.min(100, Math.max(0, reliability)),
      cost: Math.max(0, cost),
    };
  }, [installedComponents, componentsList, selectedVariants]);

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
      componentsList.find((c) => !installedComponents.includes(c.id) && canInstall(c.id)) || null
    );
  }, [installedComponents, canInstall, componentsList]);

  const isAssemblyComplete = installedComponents.length === componentsList.length;

  return {
    installedComponents,
    activeComponentId,
    phase,
    isExplodedView,
    isAutoAssembling,
    hoveredComponentId,
    history,
    selectedVariants,
    setSelectedVariant,
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
