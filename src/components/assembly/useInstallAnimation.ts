import { useEffect, useRef } from "react";
import { ComponentId, AssemblyPhase } from "../../sim/assemblyTypes";
import { COMPONENT_ANIMATION_PRESETS, ASSEMBLY_PHASE_ORDER } from "./animations";

interface UseInstallAnimationProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  onAdvancePhase: (nextPhase: AssemblyPhase) => void;
  onCompleteInstall: () => void;
  onPlaySound?: (soundType: "heavy" | "click" | "slide" | "spool" | "metallic") => void;
}

export function useInstallAnimation({
  activeComponentId,
  phase,
  onAdvancePhase,
  onCompleteInstall,
  onPlaySound,
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

    const config = COMPONENT_ANIMATION_PRESETS[activeComponentId];
    if (!config) return;

    const currentIndex = ASSEMBLY_PHASE_ORDER.indexOf(phase);
    if (currentIndex === -1) return;

    const currentPhaseDuration = config.timings[phase as keyof typeof config.timings] || 300;

    // Trigger sound effect on lock phase
    if (phase === "locking" && onPlaySound) {
      if (activeComponentId === "turbocharger") onPlaySound("spool");
      else if (activeComponentId === "block" || activeComponentId === "cylinder_head" || activeComponentId === "crankshaft") onPlaySound("heavy");
      else if (activeComponentId === "pistons" || activeComponentId === "rods") onPlaySound("slide");
      else if (activeComponentId === "camshaft") onPlaySound("metallic");
      else onPlaySound("click");
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
  }, [activeComponentId, phase, onAdvancePhase, onCompleteInstall, onPlaySound]);

  return {
    clearTimer,
  };
}
