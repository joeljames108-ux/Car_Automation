import { useState } from "react";
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
} from "lucide-react";
import {
  ENGINE_ASSEMBLY_COMPONENTS,
  ComponentId,
  AssemblyComponentMeta,
} from "../../sim/assemblyTypes";
import { ProgressBar } from "../ui/Controls";
import { AnimatedCounter } from "../ui/AnimatedCounter";

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
  className = "",
}: AssemblyProgressPanelProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className={`flex flex-col bg-base-900/90 border border-base-800 rounded-2xl p-4 backdrop-blur-xl shadow-2xl h-full select-none ${className}`}>
      {/* Top Header & Progress Bar */}
      <div className="pb-3 border-b border-base-800 mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-cyan-400" />
            Assembly Progress
          </h3>
          <span className="text-xs font-mono font-bold text-cyan-300">
            {progressPercentage}%
          </span>
        </div>

        {/* Smooth Fill Progress Bar */}
        <ProgressBar value={progressPercentage} max={100} color="bg-cyan-400" />
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
          <h4 className="text-xs font-bold text-emerald-300">Engine Assembly 100% Complete!</h4>
          <p className="text-[10px] text-slate-300 font-mono">All 12 precision parts installed & torque verified.</p>
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

      {/* Assembly Checklist */}
      <div className="flex-1 overflow-y-auto pr-1 mb-3 scrollbar-thin scrollbar-thumb-base-750">
        <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
          Engine Build Checklist ({installedComponents.length}/{ENGINE_ASSEMBLY_COMPONENTS.length})
        </h4>
        <div className="space-y-1.5">
          {ENGINE_ASSEMBLY_COMPONENTS.map((comp) => {
            const isDone = installedComponents.includes(comp.id);
            const isCurrent = activeComponentId === comp.id;

            return (
              <div
                key={comp.id}
                className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-all ${
                  isDone
                    ? "bg-emerald-950/20 text-emerald-300 border border-emerald-500/20"
                    : isCurrent
                    ? "bg-cyan-950/40 text-cyan-200 border border-cyan-400/50 animate-pulse"
                    : "bg-base-850/50 text-slate-400 border border-base-800"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {isDone ? (
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Play size={13} className="text-cyan-400 shrink-0 animate-bounce" />
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

      {/* Bottom Controls Bar */}
      <div className="pt-3 border-t border-base-800 flex items-center justify-between gap-2">
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
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 text-[11px] font-mono transition-all"
          >
            <RotateCcw size={13} /> Reset
          </button>
        ) : (
          <div className="flex items-center gap-1 animate-scale-reveal">
            <button
              onClick={() => {
                onResetAssembly();
                setShowResetConfirm(false);
              }}
              className="py-1 px-2.5 rounded-lg bg-rose-600 text-white text-[10px] font-mono font-bold hover:bg-rose-500"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="py-1 px-2 rounded-lg bg-base-750 text-slate-300 text-[10px] font-mono"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
