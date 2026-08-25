// ===================================================================
// APEX ENGINE BUILDER — STICKY 3D ENGINE DIAGRAM (PURE 3D WEBGL)
// ===================================================================

import React, { useState, useMemo, useCallback } from "react";
import { ModularEngine3DViewport } from "../../engine3d/ModularEngine3DViewport";
import { Engine3DToolbar } from "../../engine3d/ui/Engine3DToolbar";
import {
  Sparkles,
  Zap,
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  SkipForward,
  Box,
} from "lucide-react";
import {
  ComponentId,
  AssemblyPhase,
  MaterialGrade,
  PowertrainMode,
  getAssemblyComponents,
} from "../../sim/assemblyTypes";
import { playAssemblySound, toggleAssemblyMute } from "./sounds";
import { EngineConfig } from "../../sim/types";
import { StageInfo } from "../../state/useEngineBuilderFlow";

interface StickyEngineDiagramProps {
  powertrainMode: PowertrainMode;
  currentStage: string;
  currentStageMeta: {
    title: string;
    short: string;
    subtitle: string;
    advice: string;
  };
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  hoveredComponentId: ComponentId | null;
  isExplodedView: boolean;
  isAssemblyComplete: boolean;
  engineConfig: EngineConfig;
  selectedVariants: Record<string, MaterialGrade>;
  flowProgressPercentage: number;
  onAdvancePhase: (nextPhase: AssemblyPhase) => void;
  onCompleteInstall: () => void;
  onSkipAnimation: () => void;
  onHoverComponent?: (id: ComponentId | null) => void;
  onSelectComponent?: (id: ComponentId | null) => void;
  onOpenLightbox?: () => void;
  className?: string;
}

function StickyEngineDiagramComponent({
  powertrainMode,
  currentStage,
  currentStageMeta,
  installedComponents,
  activeComponentId,
  phase,
  hoveredComponentId,
  isExplodedView,
  isAssemblyComplete,
  engineConfig,
  selectedVariants,
  flowProgressPercentage,
  onAdvancePhase,
  onCompleteInstall,
  onSkipAnimation,
  onHoverComponent,
  onSelectComponent,
  onOpenLightbox,
  className = "",
}: StickyEngineDiagramProps) {
  const [isMuted, setIsMuted] = useState(false);

  const activeMeta = useMemo(() => {
    return activeComponentId
      ? getAssemblyComponents().find((c) => c.id === activeComponentId)
      : null;
  }, [activeComponentId]);

  const handleToggleMute = useCallback(() => {
    const nextMute = toggleAssemblyMute();
    setIsMuted(nextMute);
  }, []);

  return (
    <div
      className={`relative w-full rounded-3xl bg-slate-900/90 dark:bg-base-950/90 border border-slate-700/60 dark:border-base-800/80 backdrop-blur-xl p-4 shadow-2xl flex flex-col gap-3.5 transition-all ${className}`}
    >
      {/* ── TOP COMPACT HEADER HUD (Stage, Title, 3D WebGL Badge) ── */}
      <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
        {/* Left: Current Active Stage Pill */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Box size={16} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-black text-cyan-400 uppercase tracking-widest truncate">
                STAGE {currentStage.toUpperCase()}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                3D GLB
              </span>
            </div>
            <h3 className="text-xs font-mono font-bold text-slate-200 truncate">
              {currentStageMeta.title}
            </h3>
          </div>
        </div>

        {/* Right: Sound & Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeComponentId && (
            <button
              onClick={onSkipAnimation}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-base-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 text-[11px] font-mono font-bold transition-all cursor-pointer"
            >
              <SkipForward size={11} /> Skip
            </button>
          )}

          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-lg bg-base-950/80 border border-white/10 text-slate-400 hover:text-cyan-300 transition-all cursor-pointer"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── CENTRAL STAGE WORKSTATION: 3D GLB REAL-TIME VIEWPORT ── */}
      <div className="relative w-full h-[400px] md:h-[460px] rounded-2xl bg-slate-950/40 border border-white/5 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-inner">
        <ModularEngine3DViewport
          className="w-full h-full"
          engineConfig={engineConfig}
          installedComponents2D={installedComponents}
          selectedVariants2D={selectedVariants}
          isExploded2D={isExplodedView}
          onSelectComponent2D={onSelectComponent}
        />

        {/* Floating Active Installation Badge */}
        {activeComponentId && activeMeta && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-base-950/90 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.3)] text-xs font-mono">
            <Sparkles size={13} className="text-cyan-400 animate-spin" />
            <span className="font-extrabold text-slate-100">{activeMeta.name}</span>
            <span className="text-slate-500">·</span>
            <span className="text-cyan-400 font-extrabold uppercase">{phase}</span>
          </div>
        )}
      </div>

      {/* ── 3D VIEWPORT CONTROLS HUD (Camera, Lighting, Wireframe, Exploded View) ── */}
      <Engine3DToolbar />

      {/* ── BOTTOM STAGE ADVICE FOOTER ── */}
      <div className="flex items-center justify-between gap-3 pt-1 text-[11px] font-mono text-slate-400 border-t border-white/5">
        <span className="text-slate-400 truncate">
          {currentStageMeta.advice || "Assemble precision engineered components to complete this stage."}
        </span>
        <span className="text-cyan-400 font-bold shrink-0">
          {Math.round(flowProgressPercentage)}% Complete
        </span>
      </div>
    </div>
  );
}

export const StickyEngineDiagram = React.memo(StickyEngineDiagramComponent);

