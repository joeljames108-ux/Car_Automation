import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ComponentId,
  PowertrainMode,
  BuildStageId,
  ICE_STAGE_SEQUENCE,
  EV_STAGE_SEQUENCE,
  HYBRID_STAGE_SEQUENCE,
  STAGE_METADATA_MAP_ICE,
  STAGE_METADATA_MAP_EV,
  AssemblyComponentMeta,
  getAssemblyComponents,
  MaterialGrade,
} from "../sim/assemblyTypes";
import { EngineConfig, SimResult } from "../sim/types";
import { useAssemblyStore } from "./useAssemblyStore";

export interface UseEngineBuilderFlowProps {
  engineConfig: EngineConfig;
  sim: SimResult;
  updateEngine: (updates: Partial<EngineConfig>) => void;
  updateVehicle?: (updates: any) => void;
  onShowCompletionModal?: () => void;
}

export interface StageInfo {
  id: BuildStageId;
  title: string;
  shortName: string;
  subtitle: string;
  advice: string;
  isComponent: boolean;
  componentMeta?: AssemblyComponentMeta;
  isInstalled: boolean;
  isUnlocked: boolean;
  isActive: boolean;
  isCurrent: boolean;
  index: number;
  totalStages: number;
}

export function useEngineBuilderFlow({
  engineConfig,
  sim,
  updateEngine,
  updateVehicle,
  onShowCompletionModal,
}: UseEngineBuilderFlowProps) {
  // Underlying physics & robotic assembly state
  const assembly = useAssemblyStore(engineConfig);

  // Initial powertrain detection
  const initialMode: PowertrainMode =
    engineConfig.layout === "electric" ? "electric" : "ice";

  const [powertrainMode, setPowertrainMode] = useState<PowertrainMode>(initialMode);
  const [currentStage, setCurrentStage] = useState<BuildStageId>(
    // If layout is fresh or user hasn't started, start at powertrain_select or block
    assembly.installedComponents.length === 0 ? "powertrain_select" : "block"
  );
  const [skippedHybrid, setSkippedHybrid] = useState<boolean>(false);
  const [showHybridStage, setShowHybridStage] = useState<boolean>(
    engineConfig.hybridArchitecture !== "none" || engineConfig.layout === "hybrid"
  );

  // Synchronize powertrain mode if engineConfig.layout changes externally (e.g. from preset)
  useEffect(() => {
    if (engineConfig.layout === "electric" && powertrainMode !== "electric") {
      setPowertrainMode("electric");
    } else if (engineConfig.layout !== "electric" && powertrainMode === "electric") {
      setPowertrainMode("ice");
    }
  }, [engineConfig.layout]);

  // Determine stage sequence based on mode
  const baseStageSequence = useMemo(() => {
    return powertrainMode === "electric" ? EV_STAGE_SEQUENCE : ICE_STAGE_SEQUENCE;
  }, [powertrainMode]);

  // All component stages in order
  const allComponentStages = useMemo(() => {
    if (powertrainMode === "electric") {
      return EV_STAGE_SEQUENCE;
    }
    if (showHybridStage && !skippedHybrid) {
      return [...ICE_STAGE_SEQUENCE, ...HYBRID_STAGE_SEQUENCE];
    }
    return ICE_STAGE_SEQUENCE;
  }, [powertrainMode, showHybridStage, skippedHybrid]);

  // All components metadata list for currently active powertrain mode
  const componentsMetaList = useMemo(() => {
    return getAssemblyComponents({
      ...engineConfig,
      layout: powertrainMode === "electric" ? "electric" : engineConfig.layout,
      hybridArchitecture: showHybridStage && !skippedHybrid ? "phev" : "none",
    });
  }, [engineConfig, powertrainMode, showHybridStage, skippedHybrid]);

  // Check if a stage is unlocked (dependencies met or first stage)
  const isStageUnlocked = useCallback(
    (stageId: BuildStageId): boolean => {
      if (stageId === "powertrain_select") return true;
      if (stageId === "finish") {
        // Unlocked when all required components are installed
        const required =
          powertrainMode === "electric"
            ? EV_STAGE_SEQUENCE
            : showHybridStage && !skippedHybrid
            ? [...ICE_STAGE_SEQUENCE, ...HYBRID_STAGE_SEQUENCE]
            : ICE_STAGE_SEQUENCE;
        return required.every((id) => assembly.installedComponents.includes(id));
      }
      if (stageId === "hybrid_optional") {
        return ICE_STAGE_SEQUENCE.every((id) => assembly.installedComponents.includes(id));
      }

      const compId = stageId as ComponentId;
      // If already installed, always unlocked
      if (assembly.installedComponents.includes(compId)) return true;

      // Find position in sequence
      const idx = baseStageSequence.indexOf(compId);
      if (idx === 0) return true; // First component (block) is always unlocked
      if (idx > 0) {
        // Can access if previous component is installed
        const prevId = baseStageSequence[idx - 1];
        return assembly.installedComponents.includes(prevId);
      }

      // If it's a hybrid component
      if (HYBRID_STAGE_SEQUENCE.includes(compId)) {
        const iceDone = ICE_STAGE_SEQUENCE.every((id) => assembly.installedComponents.includes(id));
        if (!iceDone) return false;
        if (compId === "hybrid_motor") return true;
        if (compId === "inverter_ecu") return assembly.installedComponents.includes("hybrid_motor");
      }

      return false;
    },
    [powertrainMode, showHybridStage, skippedHybrid, baseStageSequence, assembly.installedComponents]
  );

  // Current active index in component stages
  const currentComponentIndex = useMemo(() => {
    if (currentStage === "powertrain_select") return -1;
    if (currentStage === "finish" || currentStage === "hybrid_optional") {
      return allComponentStages.length;
    }
    return allComponentStages.indexOf(currentStage as ComponentId);
  }, [currentStage, allComponentStages]);

  // Build complete rich StageInfo array for navigation pills
  const stagesList = useMemo((): StageInfo[] => {
    const list: StageInfo[] = [];

    allComponentStages.forEach((stageId, idx) => {
      const isEV = powertrainMode === "electric";
      const metaMap = isEV ? STAGE_METADATA_MAP_EV : STAGE_METADATA_MAP_ICE;
      const metaInfo = metaMap[stageId] || {
        title: stageId,
        short: stageId,
        subtitle: "",
        advice: "",
      };
      const compMeta = componentsMetaList.find((c) => c.id === stageId);
      const isInstalled = assembly.installedComponents.includes(stageId);
      const isUnlocked = isStageUnlocked(stageId);
      const isCurrent = currentStage === stageId;

      list.push({
        id: stageId,
        title: metaInfo.title,
        shortName: metaInfo.short,
        subtitle: metaInfo.subtitle,
        advice: compMeta?.tooltipAdvice || metaInfo.advice,
        isComponent: true,
        componentMeta: compMeta,
        isInstalled,
        isUnlocked,
        isActive: isInstalled || isCurrent,
        isCurrent,
        index: idx,
        totalStages: allComponentStages.length,
      });
    });

    return list;
  }, [allComponentStages, powertrainMode, componentsMetaList, assembly.installedComponents, isStageUnlocked, currentStage]);

  // Overall progression percentage
  const flowProgressPercentage = useMemo(() => {
    if (allComponentStages.length === 0) return 0;
    const installedCount = allComponentStages.filter((id) =>
      assembly.installedComponents.includes(id)
    ).length;
    return Math.round((installedCount / allComponentStages.length) * 100);
  }, [allComponentStages, assembly.installedComponents]);

  // Next & previous stage resolvers
  const nextStageId = useMemo((): BuildStageId | null => {
    if (currentStage === "powertrain_select") {
      return baseStageSequence[0];
    }
    if (currentStage === "finish") return null;
    if (currentStage === "hybrid_optional") {
      return "hybrid_motor";
    }

    const idx = allComponentStages.indexOf(currentStage as ComponentId);
    if (idx >= 0 && idx < allComponentStages.length - 1) {
      return allComponentStages[idx + 1];
    }

    // At the end of ICE components
    if (powertrainMode === "ice" && idx === ICE_STAGE_SEQUENCE.length - 1) {
      if (!showHybridStage && !skippedHybrid) {
        return "hybrid_optional";
      }
    }

    // At the end of all components
    return "finish";
  }, [currentStage, baseStageSequence, allComponentStages, powertrainMode, showHybridStage, skippedHybrid]);

  const prevStageId = useMemo((): BuildStageId | null => {
    if (currentStage === "powertrain_select") return null;
    if (currentStage === baseStageSequence[0]) return "powertrain_select";
    if (currentStage === "finish") {
      return allComponentStages[allComponentStages.length - 1];
    }
    if (currentStage === "hybrid_optional") {
      return ICE_STAGE_SEQUENCE[ICE_STAGE_SEQUENCE.length - 1];
    }

    const idx = allComponentStages.indexOf(currentStage as ComponentId);
    if (idx > 0) {
      return allComponentStages[idx - 1];
    }
    return "powertrain_select";
  }, [currentStage, baseStageSequence, allComponentStages]);

  // Action: Switch powertrain mode (ICE vs Electric)
  const selectPowertrain = useCallback(
    (mode: PowertrainMode) => {
      setPowertrainMode(mode);
      assembly.resetAssembly();
      setSkippedHybrid(false);

      if (mode === "electric") {
        updateEngine({
          layout: "electric",
          hybridArchitecture: "none",
          evMotorType: engineConfig.evMotorType || "pmsm_axial",
          evMotorPower: engineConfig.evMotorPower || 350,
          batteryCapacity: engineConfig.batteryCapacity || 90,
          batteryChemistry: engineConfig.batteryChemistry || "solid_state",
          powerElectronicsType: "silicon_carbide_sic",
        });
        setCurrentStage(EV_STAGE_SEQUENCE[0]);
      } else {
        updateEngine({
          layout: engineConfig.layout === "electric" ? "v8" : engineConfig.layout,
          hybridArchitecture: "none",
          bore: engineConfig.bore || 86,
          stroke: engineConfig.stroke || 86,
          compressionRatio: engineConfig.compressionRatio || 10.5,
        });
        setCurrentStage(ICE_STAGE_SEQUENCE[0]);
      }
    },
    [assembly, updateEngine, engineConfig]
  );

  // Action: Navigate to a specific stage
  const navigateToStage = useCallback(
    (stageId: BuildStageId) => {
      if (stageId === currentStage) return;
      if (!isStageUnlocked(stageId)) return;
      setCurrentStage(stageId);
    },
    [currentStage, isStageUnlocked]
  );

  // Action: Install current component stage
  const installCurrentStage = useCallback(() => {
    if (currentStage === "powertrain_select") {
      setCurrentStage(baseStageSequence[0]);
      return;
    }
    if (currentStage === "hybrid_optional") {
      setShowHybridStage(true);
      setCurrentStage("hybrid_motor");
      return;
    }
    if (currentStage === "finish") {
      onShowCompletionModal?.();
      return;
    }

    const compId = currentStage as ComponentId;
    if (assembly.canInstall(compId) || !assembly.installedComponents.includes(compId)) {
      assembly.startInstall(compId);
    }
  }, [currentStage, baseStageSequence, assembly, onShowCompletionModal]);

  // Hook into assembly install completion to auto-advance to next stage
  const handleInstallComplete = useCallback(() => {
    const completedId = assembly.activeComponentId;
    assembly.completeInstall();

    // Auto-update engine config defaults when specific components are installed
    if (completedId === "pistons") updateEngine({ pistons: "forged" });
    if (completedId === "crankshaft") updateEngine({ crank: "forged_steel" });
    if (completedId === "cylinder_head") updateEngine({ valvetrain: "dohc_vvl" });
    if (completedId === "turbocharger" && powertrainMode === "ice") {
      updateEngine({ intake: "turbo_single", boostPressure: 1.4 });
    }
    if (completedId === "hybrid_motor") {
      updateEngine({ hybridArchitecture: "phev", hybridMotorPower: 180, batteryCapacity: 16 });
    }

    // Check if we just completed the last component
    const updatedInstalled = [
      ...assembly.installedComponents,
      ...(completedId ? [completedId] : []),
    ];

    if (powertrainMode === "ice") {
      const allIceDone = ICE_STAGE_SEQUENCE.every((id) => updatedInstalled.includes(id));
      if (allIceDone && !showHybridStage && !skippedHybrid) {
        // Move to hybrid optional prompt stage
        setCurrentStage("hybrid_optional");
        return;
      }
    }

    const allDone = allComponentStages.every((id) => updatedInstalled.includes(id));
    if (allDone) {
      setCurrentStage("finish");
      onShowCompletionModal?.();
    } else if (nextStageId) {
      setCurrentStage(nextStageId);
    }
  }, [
    assembly,
    updateEngine,
    powertrainMode,
    showHybridStage,
    skippedHybrid,
    allComponentStages,
    nextStageId,
    onShowCompletionModal,
  ]);

  // Action: Skip Hybrid stage
  const skipHybrid = useCallback(() => {
    setSkippedHybrid(true);
    setShowHybridStage(false);
    updateEngine({ hybridArchitecture: "none", hasMguH: false });
    setCurrentStage("finish");
  }, [updateEngine]);

  // Action: Enable Hybrid stage
  const enableHybrid = useCallback(() => {
    setShowHybridStage(true);
    setSkippedHybrid(false);
    updateEngine({ hybridArchitecture: "phev", hybridMotorPower: 180, batteryCapacity: 16 });
    setCurrentStage("hybrid_motor");
  }, [updateEngine]);

  // Action: Reset entire build flow back to powertrain selection
  const resetFlow = useCallback(() => {
    assembly.resetAssembly();
    setSkippedHybrid(false);
    setShowHybridStage(false);
    setCurrentStage("powertrain_select");
  }, [assembly]);

  // Current active stage metadata
  const currentStageMeta = useMemo(() => {
    const isEV = powertrainMode === "electric";
    const metaMap = isEV ? STAGE_METADATA_MAP_EV : STAGE_METADATA_MAP_ICE;
    if (currentStage === "powertrain_select") {
      return {
        title: "Select Powertrain Architecture",
        short: "Architecture",
        subtitle: "Choose between Internal Combustion Engine (ICE) or Full Electric Powertrain (EV)",
        advice: "ICE offers high RPM acoustics & forced induction tuning; EV delivers instant peak torque & high efficiency.",
      };
    }
    if (currentStage === "hybrid_optional") {
      return {
        title: "Optional Hybrid E-Motor & Energy Recovery",
        short: "Hybrid Upgrade",
        subtitle: "Add an 800V axial-flux motor assist and energy recovery system or proceed directly to summary",
        advice: "Hybrid boost supplies instantaneous low-end torque while the turbocharger spools up.",
      };
    }
    if (currentStage === "finish") {
      return {
        title: "Engine Assembly Complete",
        short: "Finish",
        subtitle: "Comprehensive powertrain dyno diagnostics, bill of materials, and engineering certification",
        advice: "All components have been installed, torqued to specification, and bench-tested.",
      };
    }

    const compId = currentStage as ComponentId;
    return (
      metaMap[compId] || {
        title: compId,
        short: compId,
        subtitle: "",
        advice: "",
      }
    );
  }, [currentStage, powertrainMode]);

  return {
    // State
    powertrainMode,
    currentStage,
    currentStageMeta,
    currentComponentIndex,
    stagesList,
    flowProgressPercentage,
    skippedHybrid,
    showHybridStage,
    nextStageId,
    prevStageId,
    isCurrentStageInstalled:
      typeof currentStage === "string" &&
      assembly.installedComponents.includes(currentStage as ComponentId),
    isCurrentStageInstalling:
      assembly.activeComponentId !== null &&
      assembly.activeComponentId === currentStage,

    // Methods
    selectPowertrain,
    navigateToStage,
    installCurrentStage,
    handleInstallComplete,
    skipHybrid,
    enableHybrid,
    resetFlow,
    isStageUnlocked,

    // Underlying Assembly Store
    assembly,
  };
}

export type EngineBuilderFlowInstance = ReturnType<typeof useEngineBuilderFlow>;
