// ===================================================================
// APEX ENGINE BUILDER — ICE COMPLETION GATE (PHASE 8)
// 12-Component Validation Gate, ECU Calibration & Hybrid Upgrade Choice
// ===================================================================

import React from "react";
import {
  CheckCircle2,
  Zap,
  Flame,
  ArrowRight,
  Sparkles,
  Award,
  Sliders,
  Activity,
  Gauge,
  Scale,
  DollarSign,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { SectionCard } from "../SectionCard";
import { Select, Slider, Toggle } from "../../ui/Controls";
import { EngineConfig, SimResult } from "../../../sim/types";
import { ENGINE_LAYOUTS } from "../../../sim/constants";

interface ICECompletionGateProps {
  engineConfig: EngineConfig;
  sim: SimResult;
  currentTotalStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  updateEngine: (updates: Partial<EngineConfig>) => void;
  onEnableHybrid: () => void;
  onSkipHybrid: () => void;
  onReset: () => void;
  className?: string;
}

export function ICECompletionGate({
  engineConfig,
  sim,
  currentTotalStats,
  updateEngine,
  onEnableHybrid,
  onSkipHybrid,
  onReset,
  className = "",
}: ICECompletionGateProps) {
  const layoutLabel = ENGINE_LAYOUTS[engineConfig.layout]?.label || engineConfig.layout;

  return (
    <div
      className={`space-y-6 p-6 md:p-8 rounded-3xl bg-gradient-to-b from-slate-950/40 via-slate-900/30 to-slate-950/40 border border-white/10 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] select-none ${className}`}
    >
      {/* ── CELEBRATION HEADER BANNER ── */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-extrabold tracking-widest uppercase shadow-[0_0_20px_rgba(52,211,153,0.3)]">
          <Award size={15} className="text-emerald-400" />
          <span>ICE MECHANICAL ASSEMBLY COMPLETED</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold font-mono text-slate-100">
          {layoutLabel} Powertrain Fully Assembled
        </h2>
        <p className="text-xs md:text-sm text-slate-400 font-mono leading-relaxed">
          All 15 powertrain subsystems (including Radiator & Fans, Sequential Transmission, and Carbon Engine Cover)
          have been precisely mounted, torqued to OEM/Race specification, and pass cold-cranking QC diagnostic checks.
        </p>
      </div>

      {/* ── CUMULATIVE SPECS TILES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-2xl bg-base-950/80 border border-cyan-500/30 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Power Output</span>
          <span className="text-lg md:text-xl font-extrabold font-mono text-cyan-300">
            {currentTotalStats.hp} hp
          </span>
          <span className="text-[10px] font-mono text-cyan-400/80 block mt-0.5">
            @ {sim.peakPowerRpm || 6500} RPM
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-base-950/80 border border-purple-500/30 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Peak Torque</span>
          <span className="text-lg md:text-xl font-extrabold font-mono text-purple-300">
            {currentTotalStats.torque} Nm
          </span>
          <span className="text-[10px] font-mono text-purple-400/80 block mt-0.5">
            @ {sim.peakTorqueRpm || 4800} RPM
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-base-950/80 border border-slate-800 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Engine Mass</span>
          <span className="text-lg md:text-xl font-extrabold font-mono text-slate-100">
            {currentTotalStats.weight} kg
          </span>
          <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">Dry Weight</span>
        </div>

        <div className="p-3 rounded-2xl bg-base-950/80 border border-emerald-500/30 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Reliability</span>
          <span className="text-lg md:text-xl font-extrabold font-mono text-emerald-300">
            {currentTotalStats.reliability}%
          </span>
          <span className="text-[10px] font-mono text-emerald-400/80 block mt-0.5">Track Grade</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-base-950/80 border border-amber-500/30 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Hardware Cost</span>
          <span className="text-lg md:text-xl font-extrabold font-mono text-amber-300">
            ${(currentTotalStats.cost / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] font-mono text-amber-400/80 block mt-0.5">BOM Total</span>
        </div>
      </div>

      {/* ── ECU & CALIBRATION TUNING MODULE ── */}
      <SectionCard
        title="ECU Calibration & Rev Limiter"
        subtitle="Fuel mapping, ignition tables & engine redline limits"
        icon={<Sliders size={16} />}
        accent="cyan"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Select
              label="ECU Calibration Map Profile"
              value={engineConfig.ecuMapMode || "balanced"}
              options={[
                { value: "economy", label: "🍃 Eco Lean-Burn (-0.8 L/100km)" },
                { value: "balanced", label: "⚖️ Balanced Daily Driver" },
                { value: "sport", label: "🏎️ Sport Dynamics (+0.5 L/100km)" },
                { value: "race", label: "🏁 Track Competition (+1.2 L/100km)" },
              ]}
              onChange={(v) => updateEngine({ ecuMapMode: v as EngineConfig["ecuMapMode"] })}
            />

            <Toggle
              label="Automatic Stop-Start System (-0.6 L/100km)"
              value={engineConfig.hasStartStop ?? false}
              onChange={(v) => updateEngine({ hasStartStop: v })}
            />
          </div>

          <div className="space-y-3">
            <Slider
              label="Engine Redline"
              value={engineConfig.redline || 7500}
              min={3500}
              max={18000}
              step={100}
              unit="rpm"
              onChange={(v) => updateEngine({ redline: v })}
            />
            <Slider
              label="Hard RPM Fuel-Cut Limiter"
              value={engineConfig.rpmLimiter || 7800}
              min={4000}
              max={20000}
              step={100}
              unit="rpm"
              onChange={(v) => updateEngine({ rpmLimiter: v })}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── NEXT STEP BRANCHING: HYBRID UPGRADE VS COMPLETE ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Branch A: Upgrade to Hybrid */}
        <div
          onClick={onEnableHybrid}
          className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-base-900/90 to-base-950/90 border border-purple-500/40 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(192,132,252,0.3)] transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
                <Zap size={18} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold font-mono text-purple-200">
                  Add 800V Hybrid Assist
                </h4>
                <p className="text-[10px] text-purple-300/80 font-mono">
                  Axial-Flux Motor + SiC Inverter (+241 hp, +380 Nm)
                </p>
              </div>
            </div>
            <ArrowRight size={16} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-mono font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(192,132,252,0.4)] flex items-center justify-center gap-2"
          >
            <span>Proceed to Hybrid Stage</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Branch B: Skip Directly to Finish */}
        <div
          onClick={onSkipHybrid}
          className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-base-900/90 to-base-950/90 border border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all cursor-pointer space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <Flame size={18} />
              </div>
              <div>
                <h4 className="text-sm font-extrabold font-mono text-cyan-200">
                  Keep Pure ICE Powertrain
                </h4>
                <p className="text-[10px] text-cyan-300/80 font-mono">
                  Complete build without hybrid e-motor battery pack
                </p>
              </div>
            </div>
            <ArrowRight size={16} className="text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <button
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center justify-center gap-2"
          >
            <span>Skip to Summary & Dyno</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
