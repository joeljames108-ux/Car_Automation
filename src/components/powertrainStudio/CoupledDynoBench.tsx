/**
 * ============================================================================
 * COUPLED DYNO BENCH — ENGINE + TRANSMISSION COMBINED VISUALIZATION
 * ============================================================================
 * Dual-axis chart showing engine crank HP/TQ alongside per-gear wheel HP/TQ,
 * optimal shift-point markers, acceleration timeline, and drivetrain loss
 * waterfall. This is the signature feature of the Unified Powertrain Studio.
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import {
  Activity,
  Gauge,
  TrendingUp,
  Zap,
  Timer,
  ChevronRight,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";
import type {
  MasterEngineState,
  WheelTorqueDataPoint,
  MasterDrivetrainPerformanceMetrics,
} from "../../sim/engine/masterEngineTypes";

interface CoupledDynoBenchProps {
  state: MasterEngineState;
}

// Gear color palette (neon automotive)
const GEAR_COLORS = [
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

export const CoupledDynoBench: React.FC<CoupledDynoBenchProps> = ({ state }) => {
  const [activeView, setActiveView] = useState<"curves" | "accel" | "losses">("curves");
  const [visibleGears, setVisibleGears] = useState<Set<number>>(() => new Set([1, 2, 3, 4]));

  const dp = state.drivetrainPerformance;
  const dynoCurve = state.performance.dynoCurve ?? [];
  const maxHp = state.performance.peakHorsepowerHp;
  const maxTq = state.performance.peakTorqueNm;

  const toggleGear = (g: number) => {
    setVisibleGears((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  // SVG chart dimensions
  const W = 760;
  const H = 340;
  const PAD = { top: 20, right: 60, bottom: 40, left: 65 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  // Build crank curve path
  const rpmMin = dynoCurve[0]?.rpm ?? 1000;
  const rpmMax = dynoCurve[dynoCurve.length - 1]?.rpm ?? 9000;
  const rpmRange = rpmMax - rpmMin || 1;

  const xOf = (rpm: number) => PAD.left + ((rpm - rpmMin) / rpmRange) * plotW;
  const yHp = (hp: number) => PAD.top + plotH - (hp / (maxHp * 1.15)) * plotH;
  const yTq = (tq: number) => PAD.top + plotH - (tq / (maxTq * 1.3)) * plotH;

  const crankHpPath = dynoCurve
    .map((pt, i) => `${i === 0 ? "M" : "L"}${xOf(pt.rpm).toFixed(1)},${yHp(pt.horsepowerHp).toFixed(1)}`)
    .join(" ");
  const crankTqPath = dynoCurve
    .map((pt, i) => `${i === 0 ? "M" : "L"}${xOf(pt.rpm).toFixed(1)},${yTq(pt.torqueNm).toFixed(1)}`)
    .join(" ");

  // Find peak wheel TQ for Y-scale
  const maxWheelTq = dp?.peakWheelTorqueNm ?? maxTq * 4;
  const yWtq = (tq: number) => PAD.top + plotH - (tq / (maxWheelTq * 1.15)) * plotH;

  // Build gear-specific wheel torque paths
  const gearPaths: Record<number, string> = {};
  if (dp?.wheelTorqueCurvesByGear) {
    for (const [gearStr, curve] of Object.entries(dp.wheelTorqueCurvesByGear)) {
      const gear = Number(gearStr);
      if (!visibleGears.has(gear)) continue;
      gearPaths[gear] = (curve as WheelTorqueDataPoint[])
        .map((pt, i) => `${i === 0 ? "M" : "L"}${xOf(pt.rpm).toFixed(1)},${yWtq(pt.wheelTorqueNm).toFixed(1)}`)
        .join(" ");
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Header + View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950">
            <Activity size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100">Coupled Powertrain Dyno</span>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ENGINE → WHEELS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Crank HP/TQ + Per-Gear Wheel Torque • Shift Points • Acceleration
            </p>
          </div>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: "curves" as const, label: "Dyno Curves", icon: <TrendingUp size={13} /> },
            { id: "accel" as const, label: "Acceleration", icon: <Timer size={13} /> },
            { id: "losses" as const, label: "Loss Waterfall", icon: <Layers size={13} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeView === tab.id
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DYNO CURVES VIEW */}
      {activeView === "curves" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Chart */}
          <div className="lg:col-span-9 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 backdrop-blur-xl">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
              {/* Grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                <line
                  key={f}
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={PAD.top + plotH * (1 - f)}
                  y2={PAD.top + plotH * (1 - f)}
                  stroke="#1e293b"
                  strokeWidth={0.8}
                />
              ))}
              {/* RPM axis labels */}
              {[rpmMin, rpmMin + rpmRange * 0.25, rpmMin + rpmRange * 0.5, rpmMin + rpmRange * 0.75, rpmMax].map(
                (rpm) => (
                  <text
                    key={rpm}
                    x={xOf(rpm)}
                    y={H - 8}
                    fill="#94a3b8"
                    fontSize={9}
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {Math.round(rpm)}
                  </text>
                )
              )}
              <text x={W / 2} y={H} fill="#64748b" fontSize={9} fontFamily="monospace" textAnchor="middle">
                Engine RPM
              </text>

              {/* Crank Torque (dashed orange) */}
              <path d={crankTqPath} fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="6 3" opacity={0.7} />
              {/* Crank HP (solid white) */}
              <path d={crankHpPath} fill="none" stroke="#f8fafc" strokeWidth={2.5} opacity={0.9} />

              {/* Per-gear wheel torque curves */}
              {Object.entries(gearPaths).map(([gearStr, path]) => {
                const gear = Number(gearStr);
                return (
                  <path
                    key={gear}
                    d={path}
                    fill="none"
                    stroke={GEAR_COLORS[gear - 1] ?? "#fff"}
                    strokeWidth={1.8}
                    opacity={0.85}
                  />
                );
              })}

              {/* Shift point markers */}
              {dp?.optimalShiftPointsRpm.map((rpm, i) => (
                <g key={`shift-${i}`}>
                  <line
                    x1={xOf(rpm)}
                    x2={xOf(rpm)}
                    y1={PAD.top}
                    y2={PAD.top + plotH}
                    stroke="#22d3ee"
                    strokeWidth={1.2}
                    strokeDasharray="4 2"
                    opacity={0.5}
                  />
                  <text
                    x={xOf(rpm)}
                    y={PAD.top - 4}
                    fill="#22d3ee"
                    fontSize={8}
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    ↑{Math.round(rpm)}
                  </text>
                </g>
              ))}

              {/* Legend */}
              <text x={PAD.left + 6} y={PAD.top + 12} fill="#f8fafc" fontSize={8} fontFamily="monospace" fontWeight="bold">
                ── Crank HP
              </text>
              <text x={PAD.left + 6} y={PAD.top + 24} fill="#f59e0b" fontSize={8} fontFamily="monospace" fontWeight="bold">
                - - Crank TQ (Nm)
              </text>
            </svg>
          </div>

          {/* Gear Toggle + Quick Stats */}
          <div className="lg:col-span-3 space-y-3">
            {/* Gear visibility toggles */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Visible Gears</div>
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: state.drivetrain?.activeGearCount ?? 7 }, (_, i) => i + 1).map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleGear(g)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      visibleGears.has(g)
                        ? "border-cyan-400/50 text-cyan-200"
                        : "border-slate-700 text-slate-500"
                    }`}
                    style={{
                      backgroundColor: visibleGears.has(g)
                        ? `${GEAR_COLORS[g - 1]}22`
                        : "transparent",
                    }}
                  >
                    G{g}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-2">
              {[
                { label: "Peak WHP", value: `${dp?.peakWheelHorsepowerHp ?? "—"} HP`, color: "text-cyan-300" },
                { label: "Peak Wheel TQ", value: `${dp?.peakWheelTorqueNm ?? "—"} Nm`, color: "text-amber-300" },
                { label: "0–60 mph", value: `${dp?.estimatedZeroTo60Sec ?? "—"} sec`, color: "text-emerald-300" },
                { label: "0–100 mph", value: `${dp?.estimatedZeroTo100Sec ?? "—"} sec`, color: "text-violet-300" },
                { label: "¼ Mile", value: `${dp?.estimatedQuarterMileSec ?? "—"}s @ ${dp?.estimatedQuarterMileSpeedMph ?? "—"} mph`, color: "text-orange-300" },
                { label: "HP/kg", value: `${dp?.powerToWeightHpPerKg ?? "—"}`, color: "text-pink-300" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</span>
                  <span className={`text-sm font-extrabold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACCELERATION VIEW */}
      {activeView === "accel" && (
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-xl space-y-6">
          <div className="text-sm font-bold text-slate-200 uppercase tracking-wider">Estimated Acceleration Performance</div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "0 → 60 mph", value: dp?.estimatedZeroTo60Sec ?? 99, unit: "sec", gradient: "from-cyan-500 to-blue-600" },
              { label: "0 → 100 mph", value: dp?.estimatedZeroTo100Sec ?? 99, unit: "sec", gradient: "from-emerald-500 to-teal-600" },
              { label: "¼ Mile Time", value: dp?.estimatedQuarterMileSec ?? 99, unit: "sec", gradient: "from-amber-500 to-orange-600" },
              { label: "¼ Mile Trap", value: dp?.estimatedQuarterMileSpeedMph ?? 0, unit: "mph", gradient: "from-violet-500 to-purple-600" },
            ].map((card) => (
              <div key={card.label} className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`} />
                <div className="relative">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">{card.label}</div>
                  <div className="text-3xl font-black text-slate-100 mt-2">{card.value}</div>
                  <div className="text-xs font-bold text-slate-500 mt-1">{card.unit}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Shift Point Schedule */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase">Optimal Shift Schedule</div>
            <div className="flex flex-wrap gap-2">
              {dp?.optimalShiftPointsRpm.map((rpm, i) => (
                <div key={i} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                  <span className="text-xs font-bold" style={{ color: GEAR_COLORS[i] }}>G{i + 1}</span>
                  <ChevronRight size={10} className="text-slate-500" />
                  <span className="text-xs font-bold" style={{ color: GEAR_COLORS[i + 1] }}>G{i + 2}</span>
                  <span className="text-xs font-mono text-cyan-300 ml-1">@ {rpm} RPM</span>
                </div>
              )) ?? <span className="text-xs text-slate-500">No shift data available</span>}
            </div>
          </div>

          {/* Powertrain Mass Budget */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Engine Mass</div>
              <div className="text-lg font-extrabold text-slate-200 mt-1">{state.performance.engineTotalMassKg} kg</div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Drivetrain Mass</div>
              <div className="text-lg font-extrabold text-slate-200 mt-1">{state.drivetrain?.massKg ?? 0} kg</div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Powertrain</div>
              <div className="text-lg font-extrabold text-cyan-300 mt-1">{dp?.totalPowertrainMassKg ?? "—"} kg</div>
            </div>
          </div>
        </div>
      )}

      {/* LOSS WATERFALL VIEW */}
      {activeView === "losses" && (
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6 backdrop-blur-xl space-y-4">
          <div className="text-sm font-bold text-slate-200 uppercase tracking-wider">Drivetrain Loss Waterfall</div>
          <p className="text-xs text-slate-400">Power loss breakdown from crankshaft to contact patch</p>

          {(() => {
            const crankHp = state.performance.peakHorsepowerHp;
            const eff = (state.drivetrain?.mechanicalEfficiencyPercent ?? 97) / 100;
            const clutchLoss = crankHp * 0.005; // ~0.5% clutch slip
            const gearLoss = crankHp * (1 - eff) * 0.7; // gear mesh + bearing
            const diffLoss = crankHp * (1 - eff) * 0.3; // differential
            const wheelHp = crankHp - clutchLoss - gearLoss - diffLoss;

            const stages = [
              { label: "Crank Output", hp: crankHp, color: "#f8fafc" },
              { label: "Clutch Slip Loss", hp: -clutchLoss, color: "#ef4444" },
              { label: "Gearbox Mesh & Bearing", hp: -gearLoss, color: "#f59e0b" },
              { label: "Differential", hp: -diffLoss, color: "#a855f7" },
              { label: "At Wheels", hp: wheelHp, color: "#06b6d4" },
            ];

            return (
              <div className="space-y-2">
                {stages.map((s, i) => {
                  const pct = Math.abs(s.hp) / crankHp * 100;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 w-40 text-right">{s.label}</span>
                      <div className="flex-1 h-6 bg-slate-800 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full rounded-lg transition-all duration-500"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: s.color,
                            opacity: s.hp < 0 ? 0.6 : 0.9,
                          }}
                        />
                        <span className="absolute right-2 top-0.5 text-[10px] font-mono font-bold text-slate-300">
                          {s.hp > 0 ? "" : "−"}{Math.abs(Math.round(s.hp))} HP ({pct.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
            <Gauge size={14} className="text-cyan-400" />
            <span className="text-xs font-bold text-slate-300">
              Total Drivetrain Efficiency: {state.drivetrain?.mechanicalEfficiencyPercent ?? 97}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
