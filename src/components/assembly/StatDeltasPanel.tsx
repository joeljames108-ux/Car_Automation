// ===================================================================
// APEX ENGINE BUILDER — STAT DELTAS & IMPACT PREVIEW PANEL (PHASE 21)
// Live Engineering Delta Metrics, Torque Specs & Clearance Gauges
// ===================================================================

import React from "react";
import {
  TrendingUp,
  Zap,
  Gauge,
  Scale,
  ShieldCheck,
  DollarSign,
  Wrench,
  Activity,
  Sparkles,
  Info,
} from "lucide-react";
import { AssemblyComponentMeta, MaterialGrade } from "../../sim/assemblyTypes";

interface StatDeltasPanelProps {
  componentMeta?: AssemblyComponentMeta;
  selectedVariant: MaterialGrade;
  currentTotalStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  adviceText?: string;
  className?: string;
}

export function StatDeltasPanel({
  componentMeta,
  selectedVariant,
  currentTotalStats,
  adviceText,
  className = "",
}: StatDeltasPanelProps) {
  if (!componentMeta) {
    return (
      <div className={`p-4 rounded-xl bg-base-950/70 border border-slate-800 text-center ${className}`}>
        <p className="text-xs font-mono text-slate-500">No component metadata available.</p>
      </div>
    );
  }

  // Calculate dynamic deltas factoring in selected material variant
  const variant =
    componentMeta.variants.find((v) => v.id === selectedVariant) || componentMeta.variants[0];
  const hpMult = variant ? variant.hpMultiplier : 1;
  const weightMult = variant ? variant.weightMultiplier : 1;
  const costMult = variant ? variant.costMultiplier : 1;
  const relDelta = variant ? variant.reliabilityDelta : 0;

  const deltaHp = Math.round(componentMeta.statDeltas.hp * hpMult);
  const deltaTorque = Math.round(componentMeta.statDeltas.torque * hpMult);
  const deltaWeight = Math.round(componentMeta.statDeltas.weight * weightMult);
  const deltaReliability = componentMeta.statDeltas.reliability + relDelta;
  const deltaCost = Math.round(componentMeta.statDeltas.cost * costMult);

  return (
    <div className={`space-y-3.5 select-none ${className}`}>
      {/* ── SECTION HEADER ── */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Activity size={13} className="text-emerald-400" />
          <span>Engineering Impact & Deltas</span>
        </label>
        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          LIVE COMPUTED
        </span>
      </div>

      {/* ── 2x2 STAT TILES GRID ── */}
      <div className="grid grid-cols-2 gap-2">
        {/* Horsepower Delta */}
        <div className="p-2.5 rounded-xl bg-base-950/80 border border-cyan-500/20 backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Zap size={11} className="text-cyan-400" /> Power Delta
            </span>
            <span className="text-slate-500">Total: {currentTotalStats.hp}hp</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm md:text-base font-extrabold font-mono text-cyan-300">
              +{deltaHp} hp
            </span>
            <span className="text-[10px] font-mono text-cyan-400/80 font-bold">
              {variant.hpMultiplier > 1 ? `(${variant.hpMultiplier}x grade)` : "base"}
            </span>
          </div>
        </div>

        {/* Torque Delta */}
        <div className="p-2.5 rounded-xl bg-base-950/80 border border-purple-500/20 backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <TrendingUp size={11} className="text-purple-400" /> Torque Delta
            </span>
            <span className="text-slate-500">Total: {currentTotalStats.torque}Nm</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm md:text-base font-extrabold font-mono text-purple-300">
              +{deltaTorque} Nm
            </span>
            <span className="text-[10px] font-mono text-purple-400/80 font-bold">
              {variant.hpMultiplier > 1 ? `(${variant.hpMultiplier}x)` : "base"}
            </span>
          </div>
        </div>

        {/* Weight Delta */}
        <div className="p-2.5 rounded-xl bg-base-950/80 border border-slate-800 backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Scale size={11} className="text-slate-400" /> Component Mass
            </span>
            <span className="text-slate-500">{currentTotalStats.weight}kg</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm md:text-base font-extrabold font-mono text-slate-200">
              +{deltaWeight} kg
            </span>
            <span
              className={`text-[10px] font-mono font-bold ${
                variant.weightMultiplier < 1 ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              {(variant.weightMultiplier * 100).toFixed(0)}% mass
            </span>
          </div>
        </div>

        {/* Cost Delta */}
        <div className="p-2.5 rounded-xl bg-base-950/80 border border-emerald-500/20 backdrop-blur-md space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <DollarSign size={11} className="text-emerald-400" /> Hardware Cost
            </span>
            <span className="text-slate-500">${(currentTotalStats.cost / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm md:text-base font-extrabold font-mono text-emerald-300">
              +${deltaCost.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80 font-bold">
              {variant.costMultiplier}x
            </span>
          </div>
        </div>
      </div>

      {/* ── TORQUE SPEC READOUT (IF PRESENT) ── */}
      {componentMeta.torqueSpec && (
        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
              <Wrench size={11} /> Fastener Torque Specification
            </span>
            <span className="text-[10px] font-mono text-cyan-400/80">
              {componentMeta.torqueSpec.boltCount} Bolts
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">{componentMeta.torqueSpec.fastenerName}</span>
            <span className="font-extrabold text-cyan-200">
              {componentMeta.torqueSpec.snugNm} Nm + {componentMeta.torqueSpec.finalAngleDeg}°
            </span>
          </div>
        </div>
      )}

      {/* ── CLEARANCE SPEC READOUT (IF PRESENT) ── */}
      {componentMeta.clearanceSpec && (
        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1">
              <Gauge size={11} /> Precision Bearing Clearance
            </span>
            <span className="text-[10px] font-mono text-purple-400/80">
              Target: {componentMeta.clearanceSpec.targetMm} mm
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">{componentMeta.clearanceSpec.label}</span>
            <span className="font-extrabold text-purple-200">
              {componentMeta.clearanceSpec.minMm} – {componentMeta.clearanceSpec.maxMm} mm
            </span>
          </div>
        </div>
      )}

      {/* ── ADVICE & INSIGHT BANNER ── */}
      <div className="p-3 rounded-xl bg-base-950/90 border border-slate-800 space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400 font-extrabold uppercase tracking-wider">
          <Info size={12} /> Engineering Advisory
        </div>
        <p className="text-[11px] font-mono text-slate-300 leading-relaxed">
          {adviceText || componentMeta.tooltipAdvice}
        </p>
      </div>
    </div>
  );
}
