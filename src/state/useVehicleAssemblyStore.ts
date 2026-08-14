import { useState, useCallback, useMemo } from "react";
import {
  VehicleComponentId,
  VehicleAssemblyComponentMeta,
  getVehicleAssemblyComponents,
} from "../sim/vehicleAssemblyTypes";
import { AssemblyPhase, MaterialGrade } from "../sim/assemblyTypes";
import { VehicleConfig, EnginePosition, DriveType } from "../sim/types";

export interface VehicleAssemblyState {
  installedComponents: VehicleComponentId[];
  activeComponentId: VehicleComponentId | null;
  phase: AssemblyPhase;
  isExplodedView: boolean;
  isAutoAssembling: boolean;
  hoveredComponentId: VehicleComponentId | null;
  history: VehicleComponentId[];
  selectedVariants: Record<string, MaterialGrade>;
  enginePosition: EnginePosition;
  driveType: DriveType;
}

export function useVehicleAssemblyStore(vehicleConfig?: Partial<VehicleConfig>) {
  const [installedComponents, setInstalledComponents] = useState<VehicleComponentId[]>([]);
  const [activeComponentId, setActiveComponentId] = useState<VehicleComponentId | null>(null);
  const [phase, setPhase] = useState<AssemblyPhase>("idle");
  const [isExplodedView, setIsExplodedView] = useState<boolean>(true);
  const [isAutoAssembling, setIsAutoAssembling] = useState<boolean>(false);
  const [hoveredComponentId, setHoveredComponentId] = useState<VehicleComponentId | null>(null);
  const [history, setHistory] = useState<VehicleComponentId[]>([]);
  const [enginePosition, setEnginePosition] = useState<EnginePosition>(
    vehicleConfig?.enginePosition || "front"
  );
  const [driveType, setDriveType] = useState<DriveType>(
    vehicleConfig?.driveType || "rwd"
  );

  const [selectedVariants, setSelectedVariants] = useState<Record<string, MaterialGrade>>({
    chassis_frame: "forged",
    engine_bay: "cast",
    transmission: "forged",
    exhaust_system: "forged",
    suspension_front: "forged",
    suspension_rear: "forged",
    brakes: "forged",
    wheels_tires: "forged",
    aero_package: "forged",
    electronics_ecu: "billet",
  });

  const setSelectedVariant = useCallback((componentId: VehicleComponentId, variant: MaterialGrade) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [componentId]: variant,
    }));
  }, []);

  const componentsList = useMemo(() => {
    return getVehicleAssemblyComponents(vehicleConfig);
  }, [vehicleConfig]);

  const canInstall = useCallback(
    (componentId: VehicleComponentId): boolean => {
      if (installedComponents.includes(componentId)) return false;
      const meta = componentsList.find((c) => c.id === componentId);
      if (!meta) return false;
      return meta.dependencies.every((dep) => installedComponents.includes(dep));
    },
    [installedComponents, componentsList]
  );

  const progressPercentage = useMemo(() => {
    if (componentsList.length === 0) return 0;
    return Math.round((installedComponents.length / componentsList.length) * 100);
  }, [installedComponents, componentsList]);

  // Compute live cumulative stats for vehicle
  const currentStats = useMemo(() => {
    let hp = 450; // Base engine power
    let torque = 520;
    let weight = 0; // Cumulative curb weight kg
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
  }, [installedComponents, componentsList, selectedVariants]);

  const startInstall = useCallback(
    (componentId: VehicleComponentId) => {
      if (!canInstall(componentId)) return;
      setActiveComponentId(componentId);
      setPhase("picking");
    },
    [canInstall]
  );

  const advancePhase = useCallback((nextPhase: AssemblyPhase) => {
    setPhase(nextPhase);
  }, []);

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

  const resetAssembly = useCallback(() => {
    setInstalledComponents([]);
    setActiveComponentId(null);
    setPhase("idle");
    setIsAutoAssembling(false);
    setHistory([]);
  }, []);

  const toggleExplodedView = useCallback(() => {
    setIsExplodedView((prev) => !prev);
  }, []);

  const nextRecommendedComponent = useMemo((): VehicleAssemblyComponentMeta | null => {
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
    enginePosition,
    setEnginePosition,
    driveType,
    setDriveType,
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
