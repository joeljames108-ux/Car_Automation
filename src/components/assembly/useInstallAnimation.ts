import { useEffect, useRef } from "react";
import { ComponentId, AssemblyPhase, getAssemblyComponents } from "../../sim/assemblyTypes";
import { COMPONENT_ANIMATION_PRESETS, ASSEMBLY_PHASE_ORDER } from "./animations";
import { getComponentSoundType } from "./assemblyUIHelpers";
import { EngineConfig } from "../../sim/types";

interface UseInstallAnimationProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  onAdvancePhase: (nextPhase: AssemblyPhase) => void;
  onCompleteInstall: () => void;
  onPlaySound?: (soundType: "heavy" | "click" | "slide" | "spool" | "metallic" | "pneumatic") => void;
  engineConfig?: Partial<EngineConfig>;
}

export function useInstallAnimation({
  activeComponentId,
  phase,
  onAdvancePhase,
  onCompleteInstall,
  onPlaySound,
  engineConfig,
}: UseInstallAnimationProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!activeComponentId || phase === "idle" || phase === "complete") {
      clearTimer();
      return;
    }

    const config = (COMPONENT_ANIMATION_PRESETS as Record<string, any>)[activeComponentId] || {
      id: activeComponentId,
      timings: { picking: 300, traveling: 450, aligning: 300, inserting: 400, locking: 250, confirming: 350 },
      totalDuration: 2050,
      rotationDegrees: 0,
      vibrateOnInsert: true,
      flashOnLock: true,
      repeatCount: 1,
      springStiffness: 150,
      springDamping: 12,
      springMass: 2.0,
      arcControlPoints: { x: 0, y: -40 },
    };

    const currentIndex = ASSEMBLY_PHASE_ORDER.indexOf(phase);
    if (currentIndex === -1) return;

    const currentPhaseDuration = config.timings[phase as keyof typeof config.timings] || 300;

    // Trigger sound effect on lock phase directly from component metadata
    if (phase === "locking" && onPlaySound) {
      const components = getAssemblyComponents(engineConfig);
      const meta = components.find((c) => c.id === activeComponentId);
      const soundType = getComponentSoundType(meta);
      onPlaySound(soundType);
    }

    timeoutRef.current = setTimeout(() => {
      if (currentIndex < ASSEMBLY_PHASE_ORDER.length - 1) {
        onAdvancePhase(ASSEMBLY_PHASE_ORDER[currentIndex + 1]);
      } else {
        onCompleteInstall();
      }
    }, currentPhaseDuration);

    return () => {
      clearTimer();
    };
  }, [activeComponentId, phase, onAdvancePhase, onCompleteInstall, onPlaySound, engineConfig]);

  return {
    clearTimer,
  };
}
