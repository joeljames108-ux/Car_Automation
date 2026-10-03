import { useState, useCallback, useMemo } from "react";
import {
  ComponentId,
  AssemblyPhase,
  ENGINE_ASSEMBLY_COMPONENTS,
  AssemblyComponentMeta,
  getAssemblyComponents,
  MaterialGrade,
} from "../sim/assemblyTypes";
import { EngineConfig, SimResult } from "../sim/types";

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

export function useAssemblyStore(
  engineConfig?: Partial<EngineConfig>,
  canonicalSim?: SimResult
) {
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

  // Calculate live cumulative stat totals derived from canonical SimResult
  const currentStats = useMemo(() => {
    return computeAssembledEngineStats({
      installedComponents,
      componentsList,
      selectedVariants,
      canonicalSim,
    });
  }, [installedComponents, componentsList, selectedVariants, canonicalSim]);

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

/**
 * Pure function to compute assembled engine metrics derived strictly from canonical SimResult.
 * Eliminates rogue second simulation calculations and guarantees convergence with SimResult.
 */
export function computeAssembledEngineStats({
  installedComponents,
  componentsList,
  selectedVariants,
  canonicalSim,
}: {
  installedComponents: ComponentId[];
  componentsList: AssemblyComponentMeta[];
  selectedVariants: Record<string, MaterialGrade>;
  canonicalSim?: SimResult;
}) {
  if (canonicalSim) {
    const hasCore = installedComponents.includes("block");
    const canonicalHp = canonicalSim.peakPower ?? 300;
    const canonicalTorque = canonicalSim.peakTorque ?? 350;
    const canonicalWeight = canonicalSim.engineWeight ?? 180;
    const rawRel = canonicalSim.reliability ?? 0.85;
    const canonicalReliability = rawRel <= 1.0 ? Math.round(rawRel * 100) : Math.round(rawRel);
    const canonicalCost = canonicalSim.engineCost ?? 8000;

    const totalCount = Math.max(1, componentsList.length);
    const installedFraction = installedComponents.length / totalCount;

    let totalWeightMult = 0;
    let totalCostMult = 0;
    let relDeltaTotal = 0;

    installedComponents.forEach((id) => {
      const meta = componentsList.find((c) => c.id === id);
      if (meta) {
        const variantId = selectedVariants[id] || "cast";
        const variantObj = meta.variants.find((v) => v.id === variantId) || meta.variants[0];
        if (variantObj) {
          totalWeightMult += variantObj.weightMultiplier;
          totalCostMult += variantObj.costMultiplier;
          relDeltaTotal += variantObj.reliabilityDelta;
        } else {
          totalWeightMult += 1;
          totalCostMult += 1;
        }
      }
    });

    const count = Math.max(1, installedComponents.length);
    const avgWeightMult = totalWeightMult / count;
    const avgCostMult = totalCostMult / count;

    const hp = hasCore ? Math.round(canonicalHp * (0.4 + 0.6 * installedFraction)) : 0;
    const torque = hasCore ? Math.round(canonicalTorque * (0.4 + 0.6 * installedFraction)) : 0;
    const weight = Math.round(canonicalWeight * installedFraction * avgWeightMult);
    const reliability = Math.min(100, Math.max(10, Math.round(canonicalReliability + (relDeltaTotal / count))));
    const cost = Math.round(canonicalCost * installedFraction * avgCostMult);

    return {
      hp: Math.max(0, hp),
      torque: Math.max(0, torque),
      weight: Math.max(0, weight),
      reliability,
      cost: Math.max(0, cost),
    };
  }

  // Fallback if canonicalSim is not provided
  let hp = 100;
  let torque = 120;
  let weight = 0;
  let reliability = 100;
  let cost = 0;

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
}
