import { useState, useCallback, useMemo } from "react";
import {
  VehicleComponentId,
  VehicleAssemblyComponentMeta,
  getVehicleAssemblyComponents,
} from "../sim/vehicleAssemblyTypes";
import { AssemblyPhase, MaterialGrade } from "../sim/assemblyTypes";
import { VehicleConfig, EnginePosition, DriveType, VehicleDesign, SimResult } from "../sim/types";
import { simulate } from "../sim/engine";
import { defaultDesign } from "../sim/constants";

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

export function useVehicleAssemblyStore(
  vehicleConfig?: Partial<VehicleConfig>,
  canonicalDesign?: VehicleDesign,
  canonicalSim?: SimResult
) {
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

  // Derive canonical simulation baseline from VehicleDesign -> simulate(design) -> SimResult
  const canonicalSimResult = useMemo((): SimResult => {
    if (canonicalSim) return canonicalSim;
    const base = canonicalDesign || defaultDesign();
    return simulate(base);
  }, [canonicalSim, canonicalDesign]);

  // Compute live cumulative stats for vehicle strictly derived from canonical SimResult
  const currentStats = useMemo(() => {
    return computeAssembledVehicleStats({
      installedComponents,
      componentsList,
      selectedVariants,
      canonicalSimResult,
    });
  }, [installedComponents, componentsList, selectedVariants, canonicalSimResult]);

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

/**
 * Pure function to compute assembled vehicle metrics derived strictly from canonical SimResult.
 * Ensures 100% convergence with VehicleDesign -> simulate(design) -> SimResult.
 */
export function computeAssembledVehicleStats({
  installedComponents,
  componentsList,
  selectedVariants,
  canonicalSimResult,
}: {
  installedComponents: VehicleComponentId[];
  componentsList: VehicleAssemblyComponentMeta[];
  selectedVariants: Record<string, MaterialGrade>;
  canonicalSimResult: SimResult;
}) {
  const hasEngineInstalled = installedComponents.includes("engine_bay");
  const canonicalHp = canonicalSimResult.peakPower ?? 320;
  const canonicalTorque = canonicalSimResult.peakTorque ?? 380;
  const canonicalWeight = canonicalSimResult.weight ?? 1450;
  const canonicalReliability = canonicalSimResult.reliability ?? 85;
  const canonicalCost = canonicalSimResult.totalCost ?? 25000;

  const totalCount = Math.max(1, componentsList.length);
  const installedFraction = installedComponents.length / totalCount;

  let totalWeightMult = 0;
  let totalCostMult = 0;
  let reliabilityDelta = 0;

  installedComponents.forEach((id) => {
    const meta = componentsList.find((c) => c.id === id);
    if (meta) {
      const variantId = selectedVariants[id] || "cast";
      const variantObj = meta.variants.find((v) => v.id === variantId) || meta.variants[0];
      if (variantObj) {
        totalWeightMult += variantObj.weightMultiplier;
        totalCostMult += variantObj.costMultiplier;
        reliabilityDelta += variantObj.reliabilityDelta;
      } else {
        totalWeightMult += 1;
        totalCostMult += 1;
      }
    }
  });

  const count = Math.max(1, installedComponents.length);
  const avgWeightMult = totalWeightMult / count;
  const avgCostMult = totalCostMult / count;

  const hp = hasEngineInstalled ? Math.round(canonicalHp) : 0;
  const torque = hasEngineInstalled ? Math.round(canonicalTorque) : 0;
  const weight = Math.round(canonicalWeight * installedFraction * avgWeightMult);
  const reliability = Math.min(100, Math.max(10, Math.round(canonicalReliability + (reliabilityDelta / count))));
  const cost = Math.round(canonicalCost * installedFraction * avgCostMult);

  return {
    hp: Math.max(0, hp),
    torque: Math.max(0, torque),
    weight: Math.max(0, weight),
    reliability,
    cost: Math.max(0, cost),
  };
}

