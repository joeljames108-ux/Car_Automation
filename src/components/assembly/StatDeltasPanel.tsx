// ===================================================================
// APEX ENGINE BUILDER — STAT DELTAS & IMPACT PREVIEW PANEL
// Live Engineering Delta Metrics & Real-Time Performance Feedback
// ===================================================================

import React from "react";
import {
  Zap,
  Scale,
  DollarSign,
  Activity,
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
  bore?: number;
  stroke?: number;
  rodLength?: number;
  adviceText?: string;
  className?: string;
}

export function StatDeltasPanel({
  componentMeta,
  selectedVariant,
  currentTotalStats,
  className = "",
}: StatDeltasPanelProps) {
  if (!componentMeta) {
    return (
      <div className={`p-4 rounded-xl bg-white/80 border border-[#dfd6c8] text-center ${className}`}>
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
        <label className="text-[11px] font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Activity size={13} className="text-emerald-600" />
          <span>Engineering Impact & Deltas</span>
        </label>
        <span className="text-[10px] font-mono text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold shadow-2xs">
          LIVE COMPUTED
        </span>
      </div>

      {/* ── 2x2 STAT TILES GRID ── */}
      <div className="grid grid-cols-2 gap-2">
        {/* Horsepower Delta */}
        <div className="p-2.5 rounded-xl bg-white/90 border border-[#dfd6c8] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
            <span className="flex items-center gap-1">
              <Zap size={11} className="text-amber-600" /> Power Delta
            </span>
            <span className="text-slate-500 font-bold">Total: {currentTotalStats.hp}hp</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm md:text-base font-extrabold font-mono text-amber-800">
              +{deltaHp} hp
            </span>
            <span className="text-[10px] font-mono text-amber-700 font-bold">
              {variant.hpMultiplier > 1 ? `(${variant.hpMultiplier}x grade)` : "base"}
            </span>
          </div>
        </div>

        {/* Torque Delta */}
        <div className="p-2.5 rounded-xl bg-white/90 border border-[#dfd6c8] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
            <span className="flex items-center gap-1">
              <Activity size={11} className="text-amber-600" /> Torque Delta
            </span>
            <span className="text-slate-500 font-bold">Total: {currentTotalStats.torque}Nm</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm md:text-base font-extrabold font-mono text-amber-800">
              +{deltaTorque} Nm
            </span>
            <span className="text-[10px] font-mono text-amber-700 font-bold">
              {variant.hpMultiplier > 1 ? `(${variant.hpMultiplier}x grade)` : "base"}
            </span>
          </div>
        </div>

        {/* Weight Delta */}
        <div className="p-2.5 rounded-xl bg-white/90 border border-[#dfd6c8] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
            <span className="flex items-center gap-1">
              <Scale size={11} className="text-emerald-600" /> Component Mass
            </span>
            <span className="text-slate-500 font-bold">{currentTotalStats.weight}kg</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm md:text-base font-extrabold font-mono text-emerald-800">
              +{deltaWeight} kg
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-bold">
              {Math.round(variant.weightMultiplier * 100)}% mass
            </span>
          </div>
        </div>

        {/* Cost Delta */}
        <div className="p-2.5 rounded-xl bg-white/90 border border-[#dfd6c8] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
            <span className="flex items-center gap-1">
              <DollarSign size={11} className="text-amber-600" /> Hardware Cost
            </span>
            <span className="text-slate-500 font-bold">${(currentTotalStats.cost / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm md:text-base font-extrabold font-mono text-amber-800">
              +${deltaCost.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-amber-700 font-bold">
              {variant.costMultiplier}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
