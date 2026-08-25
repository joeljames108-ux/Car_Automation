// ===================================================================
// APEX ENGINE BUILDER — STAT DELTAS & IMPACT PREVIEW PANEL
// Live Engineering Delta Metrics, Interactive 2D Cylinder SVG & AI Diagnostics
// ===================================================================

import React from "react";
import {
  Zap,
  Scale,
  DollarSign,
  Activity,
  Sparkles,
  Info,
  Layers,
  Flame,
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
  bore = 86,
  stroke = 86,
  rodLength = 140,
  adviceText,
  className = "",
}: StatDeltasPanelProps) {
  if (!componentMeta) {
    return (
      <div className={`p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-center ${className}`}>
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

  // 2D Cylinder Cross-Section dimensions
  const svgWidth = 260;
  const svgHeight = 120;
  const boreScale = Math.min(1.3, Math.max(0.7, bore / 86));
  const strokeScale = Math.min(1.3, Math.max(0.7, stroke / 86));
  const cylWidth = 70 * boreScale;
  const cylHeight = 85 * strokeScale;
  const pistonWidth = cylWidth - 6;
  const pistonHeight = 18;
  const cx = svgWidth / 2;
  const topY = 16;
  const bdcY = topY + cylHeight - pistonHeight - 8;

  return (
    <div className={`space-y-3.5 select-none ${className}`}>
      {/* ── SECTION HEADER ── */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Activity size={13} className="text-emerald-400" />
          <span>Engineering Impact & Deltas</span>
        </label>
        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(52,211,153,0.2)]">
          LIVE COMPUTED
        </span>
      </div>

      {/* ── 2x2 STAT TILES GRID ── */}
      <div className="grid grid-cols-2 gap-2">
        {/* Horsepower Delta */}
        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-md space-y-1 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
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
        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-purple-500/30 backdrop-blur-md space-y-1 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Activity size={11} className="text-purple-400" /> Torque Delta
            </span>
            <span className="text-slate-500">Total: {currentTotalStats.torque}Nm</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm md:text-base font-extrabold font-mono text-purple-300">
              +{deltaTorque} Nm
            </span>
            <span className="text-[10px] font-mono text-purple-400/80 font-bold">
              {variant.hpMultiplier > 1 ? `(${variant.hpMultiplier}x grade)` : "base"}
            </span>
          </div>
        </div>

        {/* Weight Delta */}
        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 backdrop-blur-md space-y-1 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Scale size={11} className="text-emerald-400" /> Component Mass
            </span>
            <span className="text-slate-500">{currentTotalStats.weight}kg</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm md:text-base font-extrabold font-mono text-emerald-300">
              +{deltaWeight} kg
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80 font-bold">
              {Math.round(variant.weightMultiplier * 100)}% mass
            </span>
          </div>
        </div>

        {/* Cost Delta */}
        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/30 backdrop-blur-md space-y-1 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <DollarSign size={11} className="text-amber-400" /> Hardware Cost
            </span>
            <span className="text-slate-500">${(currentTotalStats.cost / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm md:text-base font-extrabold font-mono text-amber-300">
              +${deltaCost.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-amber-400/80 font-bold">
              {variant.costMultiplier}x
            </span>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE 2D CYLINDER CROSS-SECTION SCHEMATIC ── */}
      <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Layers size={11} className="text-cyan-400" /> Live Bore/Stroke Cutaway
          </span>
          <span className="text-[9px] font-mono text-slate-500">
            {bore}mm Bore × {stroke}mm Stroke
          </span>
        </div>

        <div className="flex items-center justify-center bg-black/50 rounded-lg p-2 border border-slate-900">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible">
            {/* Grid background lines */}
            <line x1="10" y1="20" x2={svgWidth - 10} y2="20" stroke="#1e293b" strokeDasharray="2 2" />
            <line x1="10" y1="60" x2={svgWidth - 10} y2="60" stroke="#1e293b" strokeDasharray="2 2" />
            <line x1="10" y1="100" x2={svgWidth - 10} y2="100" stroke="#1e293b" strokeDasharray="2 2" />

            {/* Cylinder Liner Outer Wall */}
            <rect
              x={cx - cylWidth / 2 - 4}
              y={topY}
              width={cylWidth + 8}
              height={cylHeight}
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              rx="2"
            />

            {/* Combustion Chamber Combustion Gas Glow */}
            <rect
              x={cx - cylWidth / 2}
              y={topY}
              width={cylWidth}
              height={bdcY - topY}
              fill="url(#combustionGradient)"
              opacity="0.25"
            />

            {/* Piston Body */}
            <rect
              x={cx - pistonWidth / 2}
              y={bdcY}
              width={pistonWidth}
              height={pistonHeight}
              fill="#38bdf8"
              stroke="#0284c7"
              strokeWidth="1.5"
              rx="2"
            />

            {/* Compression Rings */}
            <line x1={cx - pistonWidth / 2} y1={bdcY + 4} x2={cx + pistonWidth / 2} y2={bdcY + 4} stroke="#0f172a" strokeWidth="1" />
            <line x1={cx - pistonWidth / 2} y1={bdcY + 8} x2={cx + pistonWidth / 2} y2={bdcY + 8} stroke="#0f172a" strokeWidth="1" />

            {/* Connecting Rod */}
            <line
              x1={cx}
              y1={bdcY + pistonHeight / 2}
              x2={cx}
              y2={bdcY + pistonHeight + 24}
              stroke="#94a3b8"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Crankshaft Journal Pin */}
            <circle
              cx={cx}
              y2={bdcY + pistonHeight + 24}
              cy={bdcY + pistonHeight + 24}
              r="5"
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="1.5"
            />

            {/* Dimension Callout: Bore */}
            <line x1={cx - cylWidth / 2} y1="10" x2={cx + cylWidth / 2} y2="10" stroke="#38bdf8" strokeWidth="1" />
            <text x={cx} y="8" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle">
              Ø{bore}mm Bore
            </text>

            {/* Dimension Callout: Stroke */}
            <line x1={cx + cylWidth / 2 + 12} y1={topY} x2={cx + cylWidth / 2 + 12} y2={topY + cylHeight} stroke="#a855f7" strokeWidth="1" />
            <text
              x={cx + cylWidth / 2 + 16}
              y={topY + cylHeight / 2}
              fill="#a855f7"
              fontSize="8"
              fontFamily="monospace"
              dominantBaseline="middle"
            >
              {stroke}mm
            </text>

            {/* Gradient definitions */}
            <defs>
              <linearGradient id="combustionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* ── ENGINEERING ADVISORY & TUNER NOTES ── */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono space-y-1.5">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[10px] uppercase tracking-wider">
          <Info size={12} />
          <span>Engineering Advisory</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          {adviceText ||
            "Gray Iron = Max Durability & Low Cost (~$1.0x). Aluminum = 45% Weight Saving (~$1.4x). CGI = Double Fatigue Strength & Heavy Boost (~$1.9x). Titanium = Formula-1 Spec."}
        </p>
      </div>
    </div>
  );
}
