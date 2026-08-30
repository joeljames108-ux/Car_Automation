import React from "react";
import {
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Clock,
  Car,
  Activity,
} from "lucide-react";
import {
  VehicleComponentId,
  VehicleAssemblyComponentMeta,
  getVehicleAssemblyComponents,
} from "../../sim/vehicleAssemblyTypes";
import { TorqueClearanceReadout } from "../assembly/assemblyUIHelpers";
import { VehicleConfig } from "../../sim/types";

interface VehicleAssemblyProgressPanelProps {
  installedComponents: VehicleComponentId[];
  activeComponentId: VehicleComponentId | null;
  progressPercentage: number;
  currentStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  nextRecommendedComponent: VehicleAssemblyComponentMeta | null;
  isAutoAssembling: boolean;
  onStartInstall: (id: VehicleComponentId) => void;
  onResetAssembly: () => void;
  onToggleAutoAssemble: () => void;
  vehicleConfig?: Partial<VehicleConfig>;
  className?: string;
}

export const VehicleAssemblyProgressPanel: React.FC<VehicleAssemblyProgressPanelProps> = ({
  installedComponents,
  activeComponentId,
  progressPercentage,
  currentStats,
  nextRecommendedComponent,
  isAutoAssembling,
  onStartInstall,
  onResetAssembly,
  onToggleAutoAssemble,
  vehicleConfig,
  className = "",
}) => {
  const components = getVehicleAssemblyComponents(vehicleConfig);

  return (
    <div className={`flex flex-col h-full bg-white/80 dark:bg-base-900/90 border border-slate-200 dark:border-amber-800/30 rounded-3xl p-4 backdrop-blur-xl shadow-xl ${className}`}>
      {/* Top Header & Reset Button */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
          <Activity size={14} /> VEHICLE BUILD DASHBOARD
        </span>

        <button
          onClick={onResetAssembly}
          className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all flex items-center gap-1"
        >
          <RotateCcw size={10} /> RESET BUILD
        </button>
      </div>

      {/* Key Performance Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 p-3 rounded-2xl bg-slate-100/80 dark:bg-amber-950/60 border border-slate-200 dark:border-amber-800/30 text-xs font-mono">
          <div className="bg-amber-900/40 p-2 rounded-xl border border-amber-800/30">
            <span className="text-[9px] text-amber-200/60 block font-bold">TOTAL CURB WEIGHT</span>
            <span className="text-amber-300 font-extrabold text-sm">{currentStats.weight} kg</span>
          </div>

          <div className="bg-amber-900/40 p-2 rounded-xl border border-amber-800/30">
            <span className="text-[9px] text-amber-200/60 block font-bold">POWER-TO-WEIGHT</span>
            <span className="text-pink-300 font-extrabold text-sm">
              {(currentStats.hp / Math.max(0.5, currentStats.weight / 1000)).toFixed(0)} HP/T
            </span>
          </div>

          <div className="bg-amber-900/40 p-2 rounded-xl border border-amber-800/30">
            <span className="text-[9px] text-amber-200/60 block font-bold">DURABILITY RATING</span>
            <span className="text-emerald-300 font-extrabold text-sm">{currentStats.reliability}%</span>
          </div>

          <div className="bg-amber-900/40 p-2 rounded-xl border border-amber-800/30">
            <span className="text-[9px] text-amber-200/60 block font-bold">BUILD COST</span>
            <span className="text-amber-300 font-extrabold text-sm">${currentStats.cost.toLocaleString()}</span>
          </div>
        </div>

      {/* Recommended Next Subsystem Spec Card */}
      {nextRecommendedComponent && (
        <TorqueClearanceReadout meta={nextRecommendedComponent as any} variant="full" className="mb-3" />
      )}

      {/* Vertical Timeline Build Checklist */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <span className="text-[9px] font-mono font-bold text-amber-200/60 uppercase tracking-widest block mb-1">
          PRODUCTION LINE TIMELINE CHECKLIST
        </span>

        {components.map((comp, idx) => {
          const isInstalled = installedComponents.includes(comp.id);
          const isActive = activeComponentId === comp.id;

          return (
            <div
              key={comp.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                isInstalled
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                  : isActive
                  ? "bg-amber-950/40 border-amber-400 text-amber-300 animate-pulse"
                  : "bg-amber-900/40 border-amber-800/30 text-amber-200/60"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-mono font-bold text-amber-300/50 w-4">
                  0{idx + 1}
                </span>
                {isInstalled ? (
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                ) : isActive ? (
                  <Clock size={14} className="text-amber-400 animate-spin shrink-0" />
                ) : (
                  <Circle size={14} className="text-amber-400 shrink-0" />
                )}
                <span className="text-xs font-bold truncate">{comp.name}</span>
              </div>

              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-md bg-amber-900/50 border border-amber-800/30 text-amber-200/60 shrink-0">
                {isInstalled ? "DONE" : isActive ? "IN PROGRESS" : "WAITING"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Auto Assembly Sequence Trigger */}
      <button
        onClick={onToggleAutoAssemble}
        className={`w-full mt-3 py-2.5 rounded-2xl font-mono text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
          isAutoAssembling
            ? "bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse"
            : "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        }`}
      >
        <Play size={13} className={isAutoAssembling ? "animate-spin" : ""} />
        <span>{isAutoAssembling ? "PAUSE AUTO ASSEMBLY" : "AUTO BUILD ALL SUBSYSTEMS"}</span>
      </button>
    </div>
  );
};
