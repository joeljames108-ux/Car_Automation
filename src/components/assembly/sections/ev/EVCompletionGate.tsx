// ===================================================================
// APEX ENGINE BUILDER — EV COMPLETION GATE (PHASE 11)
// 12-Component EV Verification Gate, Battery Health & Summary Action
// ===================================================================

import React from "react";
import {
  CheckCircle2,
  Zap,
  Battery,
  ArrowRight,
  Sparkles,
  Award,
  Activity,
  Gauge,
  Scale,
  DollarSign,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { EngineConfig, SimResult } from "../../../../sim/types";
import { EV_MOTOR_TYPES } from "../../../../sim/constants";

interface EVCompletionGateProps {
  engineConfig: EngineConfig;
  sim: SimResult;
  currentTotalStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  onProceedToSummary: () => void;
  onReset: () => void;
  className?: string;
}

export function EVCompletionGate({
  engineConfig,
  sim,
  currentTotalStats,
  onProceedToSummary,
  onReset,
  className = "",
}: EVCompletionGateProps) {
  const motorLabel =
    EV_MOTOR_TYPES[engineConfig.evMotorType || "pmsm_axial"]?.label || "Electric HyperDrive";

  return (
    <div
      className={`space-y-6 p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#0e071c]/95 via-[#130b26]/90 to-[#060a14]/95 border border-amber-500/40 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] select-none ${className}`}
    >
      {/* ── CELEBRATION HEADER BANNER ── */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-extrabold tracking-widest uppercase shadow-[0_0_20px_rgba(192,132,252,0.3)]">
          <Award size={15} className="text-amber-400" />
          <span>EV POWERTRAIN ASSEMBLY COMPLETED</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold font-mono text-slate-100">
          800V {motorLabel} Fully Assembled
        </h2>
        <p className="text-xs md:text-sm text-slate-400 font-mono leading-relaxed">
          All 12 high-voltage electrical, thermal, electrochemical and drivetrain subsystems have been
          mounted, high-potential dielectric tested, and pass ASIL-D safety validation checks.
        </p>
      </div>

      {/* ── CUMULATIVE SPECS TILES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-2xl bg-base-950/80 border border-amber-500/30 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Total Motor Power</span>
          <span className="text-lg md:text-xl font-extrabold font-mono text-amber-300">
            {currentTotalStats.hp} hp
          </span>
          <span className="text-[10px] font-mono text-amber-400/80 block mt-0.5">
            {Math.round(currentTotalStats.hp / 1.341)} kW Output
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-base-950/80 border border-emerald-500/30 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Instant Torque</span>
          <span className="text-lg md:text-xl font-extrabold font-mono text-emerald-300">
            {currentTotalStats.torque} Nm
          </span>
          <span className="text-[10px] font-mono text-emerald-400/80 block mt-0.5">
            0 RPM Instantaneous
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-base-950/80 border border-amber-500/30 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Battery Capacity</span>
          <span className="text-lg md:text-xl font-extrabold font-mono text-amber-300">
            {engineConfig.batteryCapacity || 90} kWh
          </span>
          <span className="text-[10px] font-mono text-amber-400/80 block mt-0.5">
            ~{sim.electricRange || 550} km Range
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-base-950/80 border border-slate-800 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Powertrain Mass</span>
          <span className="text-lg md:text-xl font-extrabold font-mono text-slate-100">
            {currentTotalStats.weight} kg
          </span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Pack + Motors</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-base-950/80 border border-amber-500/30 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Total Hardware Cost</span>
          <span className="text-lg md:text-xl font-extrabold font-mono text-amber-300">
            ${(currentTotalStats.cost / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] font-mono text-amber-400/80 block mt-0.5">BOM Total</span>
        </div>
      </div>

      {/* ── ACTION TRIGGER ── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onProceedToSummary}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 hover:from-amber-400 hover:to-amber-400 text-black font-mono font-extrabold text-xs md:text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(192,132,252,0.5)] flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
        >
          <Sparkles size={16} className="animate-spin" />
          <span>View Final EV Dyno & Telemetry Certification</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
