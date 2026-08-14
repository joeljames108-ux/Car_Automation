import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Trophy,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Car,
  Activity,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { VehicleSVG } from "./VehicleSVG";
import { playAssemblySound } from "../assembly/sounds";
import { VehicleConfig, EnginePosition, DriveType } from "../../sim/types";
import { StatDeltaBadges } from "../assembly/assemblyUIHelpers";

interface VehicleCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  stats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  enginePosition?: EnginePosition;
  driveType?: DriveType;
  vehicleConfig?: Partial<VehicleConfig>;
}

export const VehicleCompletionModal: React.FC<VehicleCompletionModalProps> = ({
  isOpen,
  onClose,
  onReset,
  stats,
  enginePosition = "front",
  driveType = "rwd",
  vehicleConfig,
}) => {
  useEffect(() => {
    if (isOpen) {
      playAssemblySound("completion");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const installedAll = [
    "chassis_frame",
    "engine_bay",
    "transmission",
    "exhaust_system",
    "suspension_front",
    "suspension_rear",
    "brakes",
    "wheels_tires",
    "aero_package",
    "electronics_ecu",
  ] as any;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl animate-stage-transition-enter select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(6,182,212,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-4xl bg-[#0b0f19] border border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_80px_rgba(6,182,212,0.25)] text-left space-y-6 overflow-hidden">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Trophy size={24} className="animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={12} /> VEHICLE BUILD COMPLETE
              </span>
              <h2 className="text-xl font-extrabold text-slate-100 tracking-tight mt-0.5">
                COMPLETED CHASSIS & POWERTRAIN ASSEMBLY
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-mono font-bold transition-all"
            >
              <RotateCcw size={12} /> REBUILD
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-mono text-xs font-extrabold hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
            >
              <span>CONTINUE TO TUNING</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Blueprint Display Viewport */}
        <div className="h-72 w-full rounded-2xl bg-[#030712] border border-cyan-500/30 overflow-hidden flex items-center justify-center p-2 relative">
          <VehicleSVG
            installedComponents={installedAll}
            activeComponentId={null}
            phase="idle"
            hoveredComponentId={null}
            isExplodedView={false}
            enginePosition={enginePosition}
            driveType={driveType}
            vehicleConfig={vehicleConfig}
          />
        </div>

        {/* Final Performance Stat Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">TOTAL CURB WEIGHT</span>
            <span className="text-cyan-300 font-extrabold text-lg mt-0.5 block">{stats.weight} kg</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">POWER-TO-WEIGHT</span>
            <span className="text-pink-300 font-extrabold text-lg mt-0.5 block">
              {(stats.hp / Math.max(0.5, stats.weight / 1000)).toFixed(0)} HP/T
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">DURABILITY SCORE</span>
            <span className="text-emerald-300 font-extrabold text-lg mt-0.5 block">{stats.reliability}%</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">TOTAL SUBSYSTEM COST</span>
            <span className="text-amber-300 font-extrabold text-lg mt-0.5 block">${stats.cost.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
