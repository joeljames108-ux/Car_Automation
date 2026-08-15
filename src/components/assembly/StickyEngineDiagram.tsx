// ===================================================================
// APEX ENGINE BUILDER — STICKY 3D ENGINE DIAGRAM (PHASE 15)
// Progressive Assembly Visualizer with Camera Tracking & Stage HUD
// ===================================================================

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Camera,
  Sparkles,
  Zap,
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  SkipForward,
  Layers,
} from "lucide-react";
import {
  ComponentId,
  AssemblyPhase,
  MaterialGrade,
  PowertrainMode,
  getAssemblyComponents,
} from "../../sim/assemblyTypes";
import { EngineSVG } from "./EngineSVG";
import { ParticleEffects } from "./ParticleEffects";
import { useInstallAnimation } from "./useInstallAnimation";
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
  onOpenLightbox?: () => void;
  className?: string;
}

export function StickyEngineDiagram({
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
  onOpenLightbox,
  className = "",
}: StickyEngineDiagramProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [viewMode, setViewMode] = useState<"3d_iso" | "2d">("3d_iso");
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
  const hoverRafRef = useRef<number | null>(null);

  // Monitor visibility to pause animations
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current);
    };
  }, []);

  // Throttled hover handler
  const handleHoverThrottled = useCallback(
    (id: ComponentId | null) => {
      if (!onHoverComponent) return;
      if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current);
      hoverRafRef.current = requestAnimationFrame(() => {
        onHoverComponent(id);
      });
    },
    [onHoverComponent]
  );

  // Install animation controller
  useInstallAnimation({
    activeComponentId: isTabVisible ? activeComponentId : null,
    phase,
    onAdvancePhase,
    onCompleteInstall: () => {
      onCompleteInstall();
      playAssemblySound("click");
    },
    onPlaySound: (type) => playAssemblySound(type),
    engineConfig,
  });

  const isEV = powertrainMode === "electric";
  const componentsList = useMemo(() => getAssemblyComponents(engineConfig), [engineConfig]);
  const activeMeta = useMemo(
    () => componentsList.find((c) => c.id === activeComponentId),
    [componentsList, activeComponentId]
  );

  // Camera viewport dynamic zoom/pan offset
  const cameraTransform = useMemo(() => {
    if (!activeComponentId || phase === "idle") {
      return "scale(1) translate(0px, 0px)";
    }
    if (!activeMeta) return "scale(1) translate(0px, 0px)";

    const slot = activeMeta.slotPosition;
    const panX = (250 - slot.x) * 0.5;
    const panY = (225 - slot.y) * 0.5;
    return `scale(1.18) translate(${panX}px, ${panY}px)`;
  }, [activeComponentId, phase, activeMeta]);

  return (
    <div
      className={`relative w-full rounded-3xl bg-gradient-to-b from-slate-900/40 via-slate-950/30 to-slate-900/40 border border-white/10 hover:border-cyan-500/30 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] p-3 md:p-4 overflow-hidden select-none transition-all ${className}`}
    >
      {/* ── TOP HUD HEADER: ACTIVE STAGE TITLE & CAMERA CONTROLS ── */}
      <div className="flex items-center justify-between gap-2 mb-2 px-1 text-xs font-mono">
        {/* Left: Active Stage Name & Breadcrumb */}
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-xl border flex items-center justify-center ${
              isEV
                ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
            }`}
          >
            {isEV ? <Zap size={14} className="animate-pulse" /> : <Flame size={14} className="animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-100 text-xs md:text-sm">
                {currentStageMeta.title}
              </span>
              {activeComponentId && (
                <span className="px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9.5px] font-extrabold uppercase animate-pulse">
                  {phase}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate max-w-md">
              {currentStageMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Camera / View Mode / Lightbox Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode((prev) => (prev === "3d_iso" ? "2d" : "3d_iso"))}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all border cursor-pointer ${
              viewMode === "3d_iso"
                ? "bg-cyan-500/20 text-cyan-200 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                : "bg-base-950/80 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Camera size={12} />
            <span className="hidden sm:inline">{viewMode === "3d_iso" ? "3D Iso" : "2D Ortho"}</span>
          </button>

          {onOpenLightbox && (
            <button
              type="button"
              onClick={onOpenLightbox}
              className="p-1.5 rounded-xl bg-base-950/80 hover:bg-base-900 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-all cursor-pointer"
              title="Enlarge Schematic Blueprint"
            >
              <Maximize2 size={13} />
            </button>
          )}

          {activeComponentId && (
            <button
              type="button"
              onClick={onSkipAnimation}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-extrabold cursor-pointer active:scale-95 transition-all"
            >
              <SkipForward size={11} />
              <span>Skip</span>
            </button>
          )}
        </div>
      </div>

      {/* ── CENTRAL SVG STAGE WORKSTATION (TRANSLUCENT) ── */}
      <div className="relative w-full h-[340px] md:h-[380px] rounded-2xl bg-slate-950/20 border border-white/5 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-inner">
        {/* Ambient Lighting Cones */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.06),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(147,51,234,0.05),transparent_65%)] pointer-events-none" />

        {/* Particle Overlay */}
        <ParticleEffects
          activeComponentId={activeComponentId}
          phase={phase}
          slotPosition={activeMeta ? activeMeta.slotPosition : { x: 250, y: 225 }}
        />

        {/* 3D SVG Workstation Canvas */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
          style={{ transform: cameraTransform }}
        >
          <EngineSVG
            installedComponents={installedComponents}
            activeComponentId={activeComponentId}
            phase={phase}
            hoveredComponentId={hoveredComponentId}
            isExplodedView={isExplodedView}
            isAssemblyComplete={isAssemblyComplete}
            engineConfig={engineConfig}
            selectedVariants={selectedVariants}
            viewMode={viewMode}
            onHoverComponent={handleHoverThrottled}
          />
        </div>

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
    </div>
  );
}
