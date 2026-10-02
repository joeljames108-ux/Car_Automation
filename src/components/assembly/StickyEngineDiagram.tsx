import React, { useState, useMemo, useCallback } from "react";
import { ModularEngine3DViewport } from "../../engine3d/ModularEngine3DViewport";
import { useEngine3DStore } from "../../engine3d/store/useEngine3DStore";
import { ViewportErrorBoundary } from "../ui/ViewportPerformance";
import {
  Sparkles,
  Zap,
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  SkipForward,
  Box,
  RotateCw,
  CircleDot,
  Wrench,
  ShieldCheck,
  Cpu,
  Sliders,
  Wind,
  Droplets,
  Cog,
  Shield,
  Award,
  Layers,
} from "lucide-react";
import {
  ComponentId,
  AssemblyPhase,
  MaterialGrade,
  PowertrainMode,
  BuildStageId,
  getAssemblyComponents,
} from "../../sim/assemblyTypes";
import { playAssemblySound, toggleAssemblyMute } from "./sounds";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";
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
  stagesList?: StageInfo[];
  onNavigateToStage?: (stageId: BuildStageId) => void;
  onToggleExplodedView?: () => void;
  onAdvancePhase: (nextPhase: AssemblyPhase) => void;
  onCompleteInstall: () => void;
  onSkipAnimation: () => void;
  onHoverComponent?: (id: ComponentId | null) => void;
  onSelectComponent?: (id: ComponentId | null) => void;
  onOpenLightbox?: () => void;
  className?: string;
}

const getEngineStageIcon = (stageId: string) => {
  switch (stageId) {
    case "powertrain_select":
      return Layers;
    case "block":
      return Box;
    case "crankshaft":
      return RotateCw;
    case "pistons":
      return CircleDot;
    case "rods":
      return Wrench;
    case "head_gasket":
      return ShieldCheck;
    case "cylinder_head":
      return Cpu;
    case "camshaft":
      return Sliders;
    case "valves":
      return Flame;
    case "intake_manifold":
      return Wind;
    case "exhaust_headers":
      return Flame;
    case "turbocharger":
      return Zap;
    case "oil_pan":
      return Droplets;
    case "radiator":
      return Wind;
    case "transmission":
      return Cog;
    case "engine_cover":
      return Shield;
    case "ice_summary":
    case "ev_summary":
      return Award;
    // EV Stages
    case "battery_tray":
      return Box;
    case "cell_modules":
      return Layers;
    case "bms":
      return Cpu;
    case "busbars":
      return Zap;
    case "cooling":
      return Wind;
    case "inverter":
      return Cpu;
    case "rotor":
      return RotateCw;
    case "stator":
      return CircleDot;
    case "gearbox":
      return Cog;
    case "pdu":
      return Zap;
    case "regen":
      return Sparkles;
    default:
      return Cog;
  }
};

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
  stagesList,
  onNavigateToStage,
  onToggleExplodedView,
  onAdvancePhase,
  onCompleteInstall,
  onSkipAnimation,
  onHoverComponent,
  onSelectComponent,
  onOpenLightbox,
  className = "",
}: StickyEngineDiagramProps) {
  const [isMuted, setIsMuted] = useState(false);

  // 3D Viewport Store controls
  const showWireframe = useEngine3DStore((s) => s.showWireframe);
  const toggleWireframe = useEngine3DStore((s) => s.toggleWireframe);
  const storeExplodedAmount = useEngine3DStore((s) => s.explodedAmount);
  const setExplodedAmount = useEngine3DStore((s) => s.setExplodedAmount);

  const handleToggleExplode = useCallback(() => {
    if (onToggleExplodedView) {
      onToggleExplodedView();
    } else {
      setExplodedAmount(storeExplodedAmount > 0 ? 0 : 0.6);
    }
  }, [onToggleExplodedView, setExplodedAmount, storeExplodedAmount]);

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
      className={`relative w-full rounded-2xl bg-[#faf8f4]/95 border border-[#dfd6c8] backdrop-blur-xl p-2 sm:p-2.5 shadow-md flex flex-col gap-2 transition-all select-none ${className}`}
    >
      {/* ── TOP COMPACT HEADER HUD (Stage, Title, Sound & Controls) ── */}
      <div className="flex items-center justify-between gap-2.5 border-b border-slate-200/80 pb-1.5">
        {/* Left: Current Active Stage Pill */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 shrink-0">
            <Box size={14} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-black text-amber-800 uppercase tracking-widest truncate">
                STAGE {currentStage.toUpperCase()}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                3D GLB
              </span>
              <span className="text-[9px] font-mono text-emerald-700 font-bold hidden sm:inline">
                {Math.round(flowProgressPercentage)}% Complete
              </span>
            </div>
            <h3 className="text-xs font-mono font-extrabold text-slate-900 truncate">
              {currentStageMeta.title}
            </h3>
          </div>
        </div>

        {/* Right: Action & Sound Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeComponentId && (
            <button
              onClick={onSkipAnimation}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-amber-500/50 text-amber-800 hover:bg-amber-50 text-[10px] font-mono font-bold shadow-2xs transition-all cursor-pointer"
            >
              <SkipForward size={10} /> Skip
            </button>
          )}

          <button
            onClick={handleToggleMute}
            className="p-1 rounded-lg bg-white border border-slate-300 text-slate-600 hover:text-amber-800 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        </div>
      </div>

      {/* ── CENTRAL STAGE WORKSTATION: 3D GLB REAL-TIME VIEWPORT ── */}
      <div className="relative w-full h-[260px] sm:h-[285px] md:h-[310px] rounded-xl bg-gradient-to-b from-[#f8f5ee] to-[#ece6db] border border-[#d8cfbe] overflow-hidden flex items-center justify-center shadow-inner">
        <ViewportErrorBoundary fallbackLabel="Engine Assembly 3D Viewport">
          <ModularEngine3DViewport
            className="w-full h-full"
            engineConfig={engineConfig}
            installedComponents2D={installedComponents}
            selectedVariants2D={selectedVariants}
            isExploded2D={isExplodedView || storeExplodedAmount > 0}
            onSelectComponent2D={onSelectComponent}
            showRuntimeHUD={false}
          />
        </ViewportErrorBoundary>

        {/* Floating Active Installation Badge */}
        {activeComponentId && activeMeta && (
          <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 border border-amber-500/50 backdrop-blur-md shadow-sm text-[11px] font-mono">
            <Sparkles size={11} className="text-amber-600 animate-spin" />
            <span className="font-extrabold text-slate-900">{activeMeta.name}</span>
            <span className="text-slate-400">·</span>
            <span className="text-amber-700 font-extrabold uppercase">{phase}</span>
          </div>
        )}

        {/* ── FLOATING BOTTOM OPTIONS DOCK (Diagnostic & Stages) ── */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 max-w-[98vw] overflow-x-auto p-0.5 scrollbar-none pointer-events-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/95 text-slate-900 border border-slate-300/80 backdrop-blur-xl shadow-lg select-none">
            {/* Quick Diagnostic Toggles */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  playHMIClickSound();
                  toggleWireframe();
                }}
                title="Toggle Wireframe"
                className={`px-1.5 py-0.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                  showWireframe
                    ? "bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-400 shadow-2xs"
                    : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-300/80 dark:border-slate-700 hover:bg-slate-200/70"
                }`}
              >
                Wire
              </button>
              <button
                type="button"
                onClick={() => {
                  playHMIClickSound();
                  handleToggleExplode();
                }}
                title="Toggle Exploded Assembly"
                className={`px-1.5 py-0.5 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                  isExplodedView || storeExplodedAmount > 0
                    ? "bg-cyan-500/25 text-cyan-800 dark:text-cyan-300 border-cyan-400 shadow-2xs"
                    : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-300/80 dark:border-slate-700 hover:bg-slate-200/70"
                }`}
              >
                Explode
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-0.5 hidden sm:block" />

            {/* 3. Subassembly Option Action Cards */}
            <div className="flex items-center gap-1">
              {/* Architecture Option */}
              <button
                type="button"
                onClick={() => {
                  playHMITabSound();
                  onNavigateToStage?.("powertrain_select");
                }}
                title="Architecture & Layout"
                className={`flex flex-col items-center justify-center px-1.5 py-0.5 rounded-lg border transition-all cursor-pointer min-w-[38px] ${
                  currentStage === "powertrain_select"
                    ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-400 ring-1 ring-amber-400/80 shadow-2xs font-black"
                    : "bg-white/80 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-slate-700/80 hover:bg-slate-200/70"
                }`}
              >
                <Layers
                  size={12}
                  className={currentStage === "powertrain_select" ? "text-amber-500" : "text-slate-500 dark:text-slate-400"}
                />
                <span className="text-[8px] mt-0.5 leading-tight">Arch</span>
              </button>

              {/* Dynamic Subassembly Stage Pills */}
              {stagesList?.map((stage) => {
                const active = currentStage === stage.id;
                const Icon = getEngineStageIcon(stage.id);
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      playHMITabSound();
                      onNavigateToStage?.(stage.id);
                    }}
                    title={stage.title}
                    className={`flex flex-col items-center justify-center px-1.5 py-0.5 rounded-lg border transition-all cursor-pointer min-w-[38px] ${
                      active
                        ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-400 ring-1 ring-amber-400/80 shadow-2xs font-black"
                        : stage.isInstalled
                        ? "bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-100/70"
                        : "bg-white/80 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-slate-700/80 hover:bg-slate-200/70"
                    }`}
                  >
                    <div className="relative">
                      <Icon
                        size={12}
                        className={
                          active
                            ? "text-amber-500"
                            : stage.isInstalled
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-500 dark:text-slate-400"
                        }
                      />
                      {stage.isInstalled && (
                        <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <span className="text-[8px] mt-0.5 leading-tight truncate max-w-[44px]">
                      {stage.shortName || stage.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const StickyEngineDiagram = React.memo(StickyEngineDiagramComponent);

