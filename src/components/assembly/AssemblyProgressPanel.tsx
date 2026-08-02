import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  Sparkles,
  Eye,
  Check,
  Zap,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Clock,
  Award,
} from "lucide-react";
import {
  ComponentId,
  AssemblyComponentMeta,
  getAssemblyComponents,
} from "../../sim/assemblyTypes";
import { EngineConfig } from "../../sim/types";
import { ProgressBar } from "../ui/Controls";
import { AnimatedCounter } from "../ui/AnimatedCounter";
import { EngineAudioVisualizer } from "./EngineAudioVisualizer";

interface AssemblyProgressPanelProps {
  installedComponents: ComponentId[];
  activeComponentId: ComponentId | null;
  progressPercentage: number;
  currentStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  isExplodedView: boolean;
  nextRecommendedComponent: AssemblyComponentMeta | null;
  isAssemblyComplete: boolean;
  onStartInstall: (id: ComponentId) => void;
  onResetAssembly: () => void;
  onToggleExplodedView: () => void;
  engineConfig?: Partial<EngineConfig>;
  className?: string;
}

export function AssemblyProgressPanel({
  installedComponents,
  activeComponentId,
  progressPercentage,
  currentStats,
  isExplodedView,
  nextRecommendedComponent,
  isAssemblyComplete,
  onStartInstall,
  onResetAssembly,
  onToggleExplodedView,
  engineConfig,
  className = "",
}: AssemblyProgressPanelProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer counter for elapsed assembly time
  useEffect(() => {
    if (installedComponents.length === 0 || isAssemblyComplete) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [installedComponents.length, isAssemblyComplete]);

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  // Calculate precision Quality Rating percentage
  const qualityScore = Math.min(100, Math.round(75 + (installedComponents.length / 12) * 20 + (currentStats.reliability > 100 ? 5 : 0)));

  const assemblyComponents = useMemo(() => getAssemblyComponents(engineConfig), [engineConfig]);

  return (
    <div className={`flex flex-col bg-[#0b0f19]/90 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl shadow-2xl h-full select-none ${className}`}>
      {/* Top Header & Progress Bar */}
      <div className="pb-3 border-b border-slate-800/80 mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-cyan-400" />
            Assembly Dashboard
          </h3>
          <span className="text-xs font-mono font-bold text-cyan-300">
            {progressPercentage}%
          </span>
        </div>

        {/* Smooth Fill Progress Bar */}
        <ProgressBar value={progressPercentage} max={100} color="bg-cyan-400" />

        {/* Speed Metrics & Quality Bar */}
        <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-cyan-400" /> Time: {formatTime(elapsedSeconds)}
          </span>
          <span className="flex items-center gap-1 text-emerald-300 font-bold">
            <Award size={11} className="text-emerald-400" /> Quality: {qualityScore}%
          </span>
        </div>
      </div>

      {/* Next Recommended Component Action Banner */}
      {nextRecommendedComponent && !isAssemblyComplete && (
        <div className="p-2.5 mb-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-sky-950/30 to-base-850 border border-cyan-500/30 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                NEXT RECOMMENDED STEP
              </span>
              <span className="text-xs font-bold text-slate-100">
                {nextRecommendedComponent.name}
              </span>
            </div>
            <button
              onClick={() => onStartInstall(nextRecommendedComponent.id)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500 text-black text-[10px] font-mono font-bold hover:bg-cyan-400 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Install <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Completion Celebration Badge */}
      {isAssemblyComplete && (
        <div className="p-3 mb-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 shadow-lg text-center space-y-1 animate-scale-reveal">
          <div className="inline-flex p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
            <Check size={18} />
          </div>
          <h4 className="text-xs font-bold text-emerald-300">Assembly 100% Complete!</h4>
          <p className="text-[10px] text-slate-300 font-mono">Factory Quality Rating: {qualityScore}%</p>
        </div>
      )}

      {/* Live Cumulative Stat Counters Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-base-850 border border-base-750 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <TrendingUp size={11} className="text-cyan-400" /> Peak Power
          </span>
          <div className="text-sm font-mono font-bold text-cyan-300 mt-0.5">
            <AnimatedCounter value={currentStats.hp} suffix=" HP" />
          </div>
        </div>

        <div className="bg-base-850 border border-base-750 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Zap size={11} className="text-pink-400" /> Peak Torque
          </span>
          <div className="text-sm font-mono font-bold text-pink-300 mt-0.5">
            <AnimatedCounter value={currentStats.torque} suffix=" Nm" />
          </div>
        </div>

        <div className="bg-base-850 border border-base-750 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <ShieldCheck size={11} className="text-emerald-400" /> Durability
          </span>
          <div className="text-sm font-mono font-bold text-emerald-300 mt-0.5">
            <AnimatedCounter value={currentStats.reliability} suffix="%" />
          </div>
        </div>

        <div className="bg-base-850 border border-base-750 rounded-xl p-2.5">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <DollarSign size={11} className="text-amber-400" /> Total Cost
          </span>
          <div className="text-sm font-mono font-bold text-amber-300 mt-0.5">
            <AnimatedCounter value={currentStats.cost} prefix="$" />
          </div>
        </div>
      </div>

      {/* Vertical Timeline Build Checklist */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 mb-3 scrollbar-thin scrollbar-thumb-base-750">
        <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
          Vertical Build Timeline ({installedComponents.length}/{assemblyComponents.length})
        </h4>
        <div className="relative pl-3 space-y-2 border-l border-base-750 ml-1.5">
          {assemblyComponents.map((comp) => {
            const isDone = installedComponents.includes(comp.id);
            const isCurrent = activeComponentId === comp.id;

            return (
              <div
                key={comp.id}
                className={`relative flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-all ${
                  isDone
                    ? "bg-emerald-950/20 text-emerald-300 border border-emerald-500/20"
                    : isCurrent
                    ? "bg-cyan-950/40 text-cyan-200 border border-cyan-400/50 animate-pulse"
                    : "bg-base-850/50 text-slate-400 border border-base-800"
                }`}
              >
                {/* Timeline Connector Dot */}
                <div
                  className={`absolute -left-[19px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border ${
                    isDone
                      ? "bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                      : isCurrent
                      ? "bg-cyan-400 border-cyan-300 animate-ping"
                      : "bg-base-800 border-base-700"
                  }`}
                />

                <div className="flex items-center gap-2 truncate">
                  {isDone ? (
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Play size={13} className="text-cyan-400 shrink-0" />
                  ) : (
                    <Circle size={13} className="text-slate-600 shrink-0" />
                  )}
                  <span className="truncate">{comp.name}</span>
                </div>
                <span className="text-[9px] text-slate-500 uppercase shrink-0">{comp.category}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assembly Control Action Buttons */}
      <div className="pt-2 border-t border-base-800 flex items-center justify-between gap-2 mt-auto">
        <button
          onClick={onToggleExplodedView}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition-all border ${
            isExplodedView
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
              : "bg-base-800 text-slate-300 border-base-750 hover:bg-base-750"
          }`}
        >
          <Eye size={13} /> {isExplodedView ? "Exploded" : "Condensed"}
        </button>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 rounded-xl bg-base-800 text-rose-400 border border-base-750 hover:bg-rose-500/10 transition-colors"
            title="Reset Assembly"
          >
            <RotateCcw size={14} />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onResetAssembly();
                setShowResetConfirm(false);
                setElapsedSeconds(0);
              }}
              className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-mono font-bold hover:bg-rose-600 transition-all"
            >
              Reset All
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-2 py-1 rounded-lg bg-base-800 text-slate-400 text-[10px] font-mono hover:bg-base-750"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
