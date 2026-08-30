/**
 * ============================================================================
 * MODULAR ENGINE STUDIO — ENGINE COMPARISON STUDIO (ENGINE A vs ENGINE B)
 * ============================================================================
 * Side-by-side multi-physics benchmarking of two engines:
 * - Superimposed Power & Torque Dyno Curves (Engine A vs Engine B)
 * - Delta readouts: Power, Torque, Weight, Redline, Specific Output, Cost
 * - Instant Archetype preset benchmarking
 * ============================================================================
 */

import React, { useState } from "react";
import {
  Scale,
  Zap,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { MasterEngineState } from "../../sim/engine/masterEngineTypes";
import { MasterEngineStateEngine } from "../../sim/engine/masterEngineStateEngine";

interface ModularEngineComparisonStudioProps {
  currentEngine: MasterEngineState;
  stateEngine: MasterEngineStateEngine;
}

export const ModularEngineComparisonStudio: React.FC<ModularEngineComparisonStudioProps> = ({
  currentEngine,
  stateEngine,
}) => {
  const [selectedPresetB, setSelectedPresetB] = useState<string>("v12_naturally_aspirated");

  // Generate Comparison Engine B
  const engineBState = (() => {
    if (selectedPresetB === "inline_6_turbo") return stateEngine.createPresetI6Turbo();
    if (selectedPresetB === "v12_naturally_aspirated") return stateEngine.createPresetV12NA();
    if (selectedPresetB === "boxer_6_racing") return stateEngine.createPresetBoxer6NA();
    if (selectedPresetB === "w16_quad_turbo") return stateEngine.createPresetW16QuadTurbo();
    return stateEngine.createPresetV8TwinTurbo();
  })();

  const delta = stateEngine.compareWith(engineBState);

  const perfA = currentEngine.performance;
  const perfB = engineBState.performance;

  // Dyno SVG Geometry
  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const graphW = width - padding.left - padding.right;
  const graphH = height - padding.top - padding.bottom;

  const maxHp = Math.max(
    100,
    Math.ceil(Math.max(perfA?.peakHorsepowerHp || 800, perfB?.peakHorsepowerHp || 800) / 100) * 100
  );
  const maxRpm = Math.max(perfA?.redlineRpm || 9000, perfB?.redlineRpm || 9000);

  const curveAPoints = (delta.powerCurveA || [])
    .map((p) => {
      const x = padding.left + (p.rpm / maxRpm) * graphW;
      const y = padding.top + graphH - (p.horsepowerHp / maxHp) * graphH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const curveBPoints = (delta.powerCurveB || [])
    .map((p) => {
      const x = padding.left + (p.rpm / maxRpm) * graphW;
      const y = padding.top + graphH - (p.horsepowerHp / maxHp) * graphH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col h-full bg-amber-900/40 backdrop-blur-xl border border-amber-800/30 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4 text-xs text-amber-100/80">
      {/* Header & Engine B Preset Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-amber-800/30 gap-2">
        <div>
          <h3 className="text-sm font-bold text-amber-50 flex items-center gap-2">
            <Scale size={16} className="text-amber-400" />
            Side-by-Side Engine Benchmark (A vs B)
          </h3>
          <p className="text-[11px] text-amber-200/60">
            Comparing <span className="text-amber-300 font-bold">{currentEngine.name}</span> against Engine B
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-amber-200/60 uppercase font-semibold">Engine B:</span>
          <select
            value={selectedPresetB}
            onChange={(e) => setSelectedPresetB(e.target.value)}
            className="bg-amber-800/35 border border-amber-700/30 rounded-lg px-2.5 py-1.5 text-xs text-rose-300 font-semibold"
          >
            <option value="v12_naturally_aspirated">6.5L V12 Screamer (NA)</option>
            <option value="inline_6_turbo">3.0L Straight-6 Turbo</option>
            <option value="boxer_6_racing">4.0L Flat-6 GT3 (NA)</option>
            <option value="v8_twin_turbo">4.0L V8 Twin-Turbo</option>
            <option value="w16_quad_turbo">8.0L W16 Quad-Turbo</option>
          </select>
        </div>
      </div>

      {/* Superimposed Dyno Curves */}
      <div className="relative bg-amber-950/80 rounded-xl border border-amber-800/30 p-2 overflow-hidden shadow-inner">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1.0].map((r, i) => {
            const y = padding.top + graphH * (1 - r);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {Math.round(maxHp * r)} HP
                </text>
              </g>
            );
          })}

          {/* Engine A Curve (Cyan) */}
          <polyline
            fill="none"
            stroke="#00f0ff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={curveAPoints}
          />

          {/* Engine B Curve (Coral/Rose) */}
          <polyline
            fill="none"
            stroke="#f43f5e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5 3"
            points={curveBPoints}
          />
        </svg>

        {/* Legend */}
        <div className="absolute top-3 right-5 flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-amber-400" />
            <span className="text-amber-300 font-bold">Engine A ({perfA?.peakHorsepowerHp} HP)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-rose-500" />
            <span className="text-rose-400 font-bold">Engine B ({perfB?.peakHorsepowerHp} HP)</span>
          </div>
        </div>
      </div>

      {/* Delta Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-800/30 space-y-1">
          <span className="text-[10px] text-amber-200/60 uppercase font-semibold">Horsepower Difference</span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-mono font-bold text-amber-50">
              {perfA?.peakHorsepowerHp} vs {perfB?.peakHorsepowerHp} HP
            </span>
            <span
              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                delta.powerDiffHp >= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {delta.powerDiffHp >= 0 ? `+${delta.powerDiffHp}` : delta.powerDiffHp} HP
            </span>
          </div>
        </div>

        <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-800/30 space-y-1">
          <span className="text-[10px] text-amber-200/60 uppercase font-semibold">Brake Torque</span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-mono font-bold text-amber-50">
              {perfA?.peakTorqueNm} vs {perfB?.peakTorqueNm} Nm
            </span>
            <span
              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                delta.torqueDiffNm >= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {delta.torqueDiffNm >= 0 ? `+${delta.torqueDiffNm}` : delta.torqueDiffNm} Nm
            </span>
          </div>
        </div>

        <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-800/30 space-y-1">
          <span className="text-[10px] text-amber-200/60 uppercase font-semibold">Engine Total Weight</span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-mono font-bold text-amber-50">
              {perfA?.engineTotalMassKg} vs {perfB?.engineTotalMassKg} kg
            </span>
            <span
              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                delta.massDiffKg <= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {delta.massDiffKg >= 0 ? `+${delta.massDiffKg}` : delta.massDiffKg} kg
            </span>
          </div>
        </div>

        <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-800/30 space-y-1">
          <span className="text-[10px] text-amber-200/60 uppercase font-semibold">Specific Output</span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-mono font-bold text-amber-50">
              {perfA?.specificOutputHpPerLiter} vs {perfB?.specificOutputHpPerLiter} HP/L
            </span>
            <span className="text-xs font-mono font-bold text-amber-300">
              {delta.specificOutputDiffHpPerL >= 0 ? `+${delta.specificOutputDiffHpPerL}` : delta.specificOutputDiffHpPerL} HP/L
            </span>
          </div>
        </div>

        <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-800/30 space-y-1">
          <span className="text-[10px] text-amber-200/60 uppercase font-semibold">Redline RPM Limit</span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-mono font-bold text-amber-50">
              {perfA?.redlineRpm} vs {perfB?.redlineRpm} RPM
            </span>
            <span className="text-xs font-mono font-bold text-amber-300">
              {delta.redlineDiffRpm >= 0 ? `+${delta.redlineDiffRpm}` : delta.redlineDiffRpm} RPM
            </span>
          </div>
        </div>

        <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-800/30 space-y-1">
          <span className="text-[10px] text-amber-200/60 uppercase font-semibold">Manufacturing BOM Cost</span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-mono font-bold text-amber-50">
              ${currentEngine.costAndBOM?.totalEngineBOMCostUSD?.toLocaleString()} vs ${engineBState.costAndBOM?.totalEngineBOMCostUSD?.toLocaleString()}
            </span>
            <span
              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                delta.costDiffUSD <= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {delta.costDiffUSD >= 0 ? `+$${delta.costDiffUSD.toLocaleString()}` : `-$${Math.abs(delta.costDiffUSD).toLocaleString()}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
