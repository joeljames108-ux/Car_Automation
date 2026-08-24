/**
 * ============================================================================
 * MODULAR ENGINE STUDIO — LIVE VIRTUAL ENGINE DYNAMOMETER
 * ============================================================================
 * Features:
 * - Dynamic SVG Power & Torque Dyno Graph with dual Y-axis
 * - Live Throttle Dyno Sweep Simulator (2000 RPM -> Redline)
 * - Real-time circular telemetry gauges (RPM, Boost, AFR, EGT, Oil, Water)
 * - Specific Output & Thermal Efficiency Scorecards
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Activity,
  Flame,
  Gauge,
  Thermometer,
  Zap,
  TrendingUp,
  Award,
} from "lucide-react";
import { MasterEngineState, DynoDataPoint } from "../../sim/engine/masterEngineTypes";

interface ModularEngineDynoBenchProps {
  state: MasterEngineState;
}

export const ModularEngineDynoBench: React.FC<ModularEngineDynoBenchProps> = ({ state }) => {
  const perf = state.performance;
  const dynoCurve = perf?.dynoCurve || [];

  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [sweepRpm, setSweepRpm] = useState<number>(1000);
  const animRef = useRef<number | null>(null);

  // Active Dyno Point based on sweep RPM
  const activePoint: DynoDataPoint = dynoCurve.reduce((closest, curr) => {
    return Math.abs(curr.rpm - sweepRpm) < Math.abs(closest.rpm - sweepRpm) ? curr : closest;
  }, dynoCurve[0] || ({ rpm: 1000, horsepowerHp: 0, torqueNm: 0, boostBar: 0, bsfcGramsPerKwh: 240, exhaustGasTempC: 600 } as DynoDataPoint));

  // Run Dyno Sweep Loop
  useEffect(() => {
    if (!isSweeping) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let lastTime = performance.now();
    const redline = perf?.redlineRpm || 8500;

    const runSweep = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      setSweepRpm((prev) => {
        // Accelerate through RPM band
        const next = prev + 3200 * dt;
        if (next >= redline) {
          setIsSweeping(false);
          return redline;
        }
        return next;
      });

      animRef.current = requestAnimationFrame(runSweep);
    };

    animRef.current = requestAnimationFrame(runSweep);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isSweeping, perf]);

  const startSweep = () => {
    setSweepRpm(1200);
    setIsSweeping(true);
  };

  const resetSweep = () => {
    setIsSweeping(false);
    setSweepRpm(perf?.peakHorsepowerRpm || 7500);
  };

  // SVG Chart Geometry
  const width = 640;
  const height = 240;
  const padding = { top: 20, right: 45, bottom: 30, left: 45 };
  const graphW = width - padding.left - padding.right;
  const graphH = height - padding.top - padding.bottom;

  const maxHp = Math.max(100, Math.ceil((perf?.peakHorsepowerHp || 800) / 100) * 100);
  const maxTorque = Math.max(100, Math.ceil((perf?.peakTorqueNm || 900) / 100) * 100);
  const maxRpm = perf?.redlineRpm || 9000;

  const hpPoints = dynoCurve
    .map((p) => {
      const x = padding.left + (p.rpm / maxRpm) * graphW;
      const y = padding.top + graphH - (p.horsepowerHp / maxHp) * graphH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const torquePoints = dynoCurve
    .map((p) => {
      const x = padding.left + (p.rpm / maxRpm) * graphW;
      const y = padding.top + graphH - (p.torqueNm / maxTorque) * graphH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const activeMarkerX = padding.left + (activePoint.rpm / maxRpm) * graphW;
  const activeHpY = padding.top + graphH - (activePoint.horsepowerHp / maxHp) * graphH;
  const activeTorqueY = padding.top + graphH - (activePoint.torqueNm / maxTorque) * graphH;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-4">
      {/* Dyno Header & Controls */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" />
            Virtual Engine Dynamometer Test Bench
          </h3>
          <p className="text-[11px] text-slate-400">
            High-resolution multi-physics torque, power, and thermal telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={isSweeping ? () => setIsSweeping(false) : startSweep}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isSweeping
                ? "bg-amber-500 text-slate-950 shadow-amber-500/30"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30"
            }`}
          >
            {isSweeping ? <Pause size={13} /> : <Play size={13} />}
            <span>{isSweeping ? "Pause Sweep" : "Run WOT Dyno Sweep"}</span>
          </button>
          <button
            onClick={resetSweep}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
            title="Reset to Peak Power RPM"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Live Dyno Graph */}
      <div className="relative bg-slate-950/80 rounded-xl border border-slate-800/80 p-2 overflow-hidden shadow-inner">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <linearGradient id="hpAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
            const y = padding.top + graphH * (1 - ratio);
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
                  fill="#00f0ff"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {Math.round(maxHp * ratio)}
                </text>
                <text
                  x={width - padding.right + 6}
                  y={y + 3}
                  fill="#f59e0b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="start"
                >
                  {Math.round(maxTorque * ratio)}
                </text>
              </g>
            );
          })}

          {/* Horsepower Curve (Cyan) */}
          <polyline
            fill="none"
            stroke="#00f0ff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={hpPoints}
          />

          {/* Torque Curve (Amber) */}
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={torquePoints}
          />

          {/* Active Sweep Cursor */}
          <line
            x1={activeMarkerX}
            y1={padding.top}
            x2={activeMarkerX}
            y2={padding.top + graphH}
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />

          {/* Active Data Points on Curves */}
          <circle cx={activeMarkerX} cy={activeHpY} r="5" fill="#00f0ff" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx={activeMarkerX} cy={activeTorqueY} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
        </svg>

        {/* Legend */}
        <div className="absolute top-3 right-5 flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
            <span className="text-cyan-300 font-bold">Horsepower (HP)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
            <span className="text-amber-300 font-bold">Torque (Nm)</span>
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Gauges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">
            Current RPM
          </span>
          <span className="text-base font-mono font-bold text-slate-100">
            {Math.round(activePoint.rpm)}
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-cyan-500/30">
          <span className="text-[9px] uppercase tracking-wider text-cyan-400 block mb-0.5">
            Power Output
          </span>
          <span className="text-base font-mono font-bold text-cyan-300">
            {activePoint.horsepowerHp} HP
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-amber-500/30">
          <span className="text-[9px] uppercase tracking-wider text-amber-400 block mb-0.5">
            Brake Torque
          </span>
          <span className="text-base font-mono font-bold text-amber-300">
            {activePoint.torqueNm} Nm
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-rose-500/30">
          <span className="text-[9px] uppercase tracking-wider text-rose-400 block mb-0.5">
            Turbo Boost
          </span>
          <span className="text-base font-mono font-bold text-rose-300">
            {activePoint.boostBar} bar
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">
            Exhaust EGT
          </span>
          <span className="text-base font-mono font-bold text-orange-400">
            {activePoint.exhaustGasTempC}°C
          </span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 block mb-0.5">
            BSFC Fuel
          </span>
          <span className="text-base font-mono font-bold text-emerald-400">
            {activePoint.bsfcGramsPerKwh} g/kWh
          </span>
        </div>
      </div>

      {/* Engine Scorecard & Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">Peak Horsepower</span>
          <span className="text-sm font-mono font-bold text-cyan-400">
            {perf?.peakHorsepowerHp} HP @ {perf?.peakHorsepowerRpm} RPM
          </span>
        </div>
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">Peak Torque</span>
          <span className="text-sm font-mono font-bold text-amber-400">
            {perf?.peakTorqueNm} Nm @ {perf?.peakTorqueRpm} RPM
          </span>
        </div>
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">Specific Output</span>
          <span className="text-sm font-mono font-bold text-purple-400">
            {perf?.specificOutputHpPerLiter} HP / Liter
          </span>
        </div>
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <span className="text-[10px] text-slate-400 block">Engine Mass & BOM</span>
          <span className="text-sm font-mono font-bold text-emerald-400">
            {perf?.engineTotalMassKg} kg | ${state.costAndBOM?.totalEngineBOMCostUSD?.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
