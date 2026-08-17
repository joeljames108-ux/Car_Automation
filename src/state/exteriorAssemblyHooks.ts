// ===================================================================
// EXTERIOR VEHICLE ASSEMBLY HOOKS & UTILITY SUBSYSTEMS
// ===================================================================
// React hooks for automated assembly phase transitions, audio sync,
// shut-line gap tolerance auditing, and structural rigidity aggregation.
// ===================================================================

import { useEffect, useRef, useMemo } from "react";
import { useExteriorAssemblyStore } from "./useExteriorAssemblyStore";
import type {
  ExteriorComponentId,
  ExteriorAssemblyPhase,
  ExteriorAssemblyComponentMeta,
} from "../sim/exteriorAssemblyTypes";
import { EXTERIOR_ASSEMBLY_REGISTRY } from "../sim/exteriorAssemblyTypes";
import { SHUT_LINE_SPECIFICATION_STANDARDS, type ShutLineToleranceRule } from "../sim/constants/exteriorConstants";
import { playAssemblySound } from "../components/assembly/sounds";

// ===================================================================
// 1. PHASE-AWARE EXTERIOR INSTALLATION ANIMATION HOOK
// ===================================================================

export interface UseExteriorInstallAnimationProps {
  activeComponentId: ExteriorComponentId | null;
  phase: ExteriorAssemblyPhase;
  onAdvancePhase: (phase: ExteriorAssemblyPhase) => void;
  onCompleteInstall: () => void;
  onPlaySound?: (soundType: "metallic" | "click" | "heavy" | "slide" | "spool" | "pneumatic") => void;
}

export function useExteriorInstallAnimation({
  activeComponentId,
  phase,
  onAdvancePhase,
  onCompleteInstall,
  onPlaySound = playAssemblySound,
}: UseExteriorInstallAnimationProps): void {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!activeComponentId || phase === "idle" || phase === "complete") {
      return;
    }

    const comp = EXTERIOR_ASSEMBLY_REGISTRY.find((c) => c.id === activeComponentId);
    const duration = comp ? comp.estimatedDuration : 1200;

    // Transition times scaled from total duration
    const phaseDelays: Record<ExteriorAssemblyPhase, number> = {
      idle: 0,
      picking: Math.round(duration * 0.15),
      traveling: Math.round(duration * 0.20),
      panel_aligning: Math.round(duration * 0.25),
      spot_welding: Math.round(duration * 0.20),
      riveting: Math.round(duration * 0.18),
      bonding: Math.round(duration * 0.22),
      bolting: Math.round(duration * 0.18),
      painting: Math.round(duration * 0.25),
      curing: Math.round(duration * 0.15),
      confirming: Math.round(duration * 0.15),
      complete: 0,
    };

    // Sequential phase transition pipeline
    const nextPhaseMap: Record<ExteriorAssemblyPhase, ExteriorAssemblyPhase> = {
      idle: "picking",
      picking: "traveling",
      traveling: "panel_aligning",
      panel_aligning:
        comp?.soundType === "weld_spark"
          ? "spot_welding"
          : comp?.soundType === "slide"
          ? "bonding"
          : "bolting",
      spot_welding: "confirming",
      riveting: "confirming",
      bonding: "curing",
      bolting: "confirming",
      painting: "curing",
      curing: "confirming",
      confirming: "complete",
      complete: "idle",
    };

    const currentDelay = phaseDelays[phase] || 250;

    // Trigger phase audio feedback
    if (phase === "picking") onPlaySound("slide");
    if (phase === "traveling") onPlaySound("spool");
    if (phase === "panel_aligning") onPlaySound("pneumatic");
    if (phase === "spot_welding") onPlaySound("metallic");
    if (phase === "bolting") onPlaySound("click");
    if (phase === "confirming") onPlaySound("heavy");

    timerRef.current = setTimeout(() => {
      const next = nextPhaseMap[phase];
      if (next === "complete") {
        onCompleteInstall();
      } else {
        onAdvancePhase(next);
      }
    }, currentDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeComponentId, phase, onAdvancePhase, onCompleteInstall, onPlaySound]);
}

// ===================================================================
// 2. SHUT-LINE GAP & FLUSHNESS VALIDATION AUDIT HOOK
// ===================================================================

export interface ShutLineAuditResult {
  rule: ShutLineToleranceRule;
  measuredGapMm: number;
  gapStatus: "nominal" | "warning" | "error";
  measuredFlushMm: number;
  flushStatus: "nominal" | "warning" | "error";
}

export function usePanelGapAudit(): ShutLineAuditResult[] {
  const exteriorConfig = useExteriorAssemblyStore((s) => s.exteriorConfig);
  const installedComponents = useExteriorAssemblyStore((s) => s.installedComponents);

  return useMemo(() => {
    return Object.entries(SHUT_LINE_SPECIFICATION_STANDARDS).map(([key, rule]) => {
      // Simulate minor manufacturing variations based on target gap and rigidity
      const baseGap = exteriorConfig.targetPanelGap || 3.5;
      const baseFlush = exteriorConfig.targetFlushness || 0.0;

      const gapDiff = Math.abs(baseGap - rule.nominalGapMm);
      const gapStatus =
        gapDiff <= rule.tolerancePlusMm
          ? "nominal"
          : gapDiff <= rule.tolerancePlusMm * 1.5
          ? "warning"
          : "error";

      const flushDiff = Math.abs(baseFlush - rule.nominalFlushMm);
      const flushStatus =
        flushDiff <= rule.flushToleranceMm
          ? "nominal"
          : flushDiff <= rule.flushToleranceMm * 1.5
          ? "warning"
          : "error";

      return {
        rule,
        measuredGapMm: Math.round(baseGap * 10) / 10,
        gapStatus,
        measuredFlushMm: Math.round(baseFlush * 10) / 10,
        flushStatus,
      };
    });
  }, [exteriorConfig.targetPanelGap, exteriorConfig.targetFlushness, installedComponents]);
}

// ===================================================================
// 3. COMPONENT CATEGORY PROGRESSION HOOK
// ===================================================================

export interface CategoryProgress {
  category: string;
  total: number;
  installed: number;
  percentage: number;
  isComplete: boolean;
  components: ExteriorAssemblyComponentMeta[];
}

export function useExteriorCategoryProgress(): CategoryProgress[] {
  const installedComponents = useExteriorAssemblyStore((s) => s.installedComponents);

  return useMemo(() => {
    const categories: Record<string, ExteriorAssemblyComponentMeta[]> = {};

    EXTERIOR_ASSEMBLY_REGISTRY.forEach((comp) => {
      if (!categories[comp.category]) {
        categories[comp.category] = [];
      }
      categories[comp.category].push(comp);
    });

    return Object.entries(categories).map(([category, components]) => {
      const total = components.length;
      const installed = components.filter((c) => installedComponents.includes(c.id)).length;
      const percentage = Math.round((installed / total) * 100);

      return {
        category,
        total,
        installed,
        percentage,
        isComplete: installed >= total,
        components,
      };
    });
  }, [installedComponents]);
}
