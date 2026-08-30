/**
 * ============================================================================
 * APEX ENGINEER — 720° CRANK ANGLE & P-V COMBUSTION CYCLE STUDIO
 * ============================================================================
 * High-precision 1D thermodynamic combustion cycle analyzer.
 * Features:
 * - Interactive P-V (Pressure vs Volume) Cylinder Indicator Loop Diagram
 * - 720° Crank Angle Pressure & Wiebe Heat Release Rate Curves
 * - Real-Time Crank Angle Scrubber Slider (0° to 720°)
 * - Mean Effective Pressure Breakdown (IMEP, BMEP, FMEP, PMEP)
 * - Pmax Location ATDC & Thermodynamic Efficiency Cards
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import {
  Activity,
  Flame,
  Zap,
  Gauge,
  Thermometer,
  RotateCw,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Info,
} from "lucide-react";
import { MasterEngineState } from "../../sim/engine/masterEngineTypes";
import {
  AdvancedEngineTelemetrySolver,
  ThermodynamicCycleMetrics,
} from "../../sim/engine/advancedEngineTelemetrySolver";
import { LineChart } from "../ui/LineChart";

interface CombustionCyclePVStudioProps {
  state: MasterEngineState;
  rpm?: number;
  throttle?: number;
}

export const CombustionCyclePVStudio: React.FC<CombustionCyclePVStudioProps> = ({
  state,
  rpm = 6500,
  throttle = 1.0,
}) => {
  const [scrubAngleDeg, setScrubAngleDeg] = useState<number>(360); // 360° is TDC Compression

  // Compute thermodynamics
  const thermo: ThermodynamicCycleMetrics = useMemo(() => {
    return AdvancedEngineTelemetrySolver.solveThermodynamics(state, rpm, throttle);
  }, [state, rpm, throttle]);

  // Active scrubbed point
  const scrubPoint = useMemo(() => {
    const pts = thermo.crankAnglePoints;
    let closest = pts[0];
    let minDiff = 999;
    pts.forEach((p) => {
      const diff = Math.abs(p.crankAngleDeg - scrubAngleDeg);
      if (diff < minDiff) {
        minDiff = diff;
        closest = p;
      }
    });
    return closest;
  }, [thermo.crankAnglePoints, scrubAngleDeg]);

  // Chart 1: Cylinder Pressure vs Crank Angle (0° - 720°)
  const pressureChartSeries = useMemo(() => [
    {
      data: thermo.crankAnglePoints.map((p) => ({ x: p.crankAngleDeg, y: p.pressureBar })),
      color: "#fbbf24",
      fill: true,
      label: "Cylinder Pressure",
      unit: " bar",
    },
    {
      data: thermo.crankAnglePoints.map((p) => ({ x: p.crankAngleDeg, y: p.heatReleaseRateJDeg * 2 })),
      color: "#f59e0b",
      fill: false,
      label: "Heat Release Rate ×2",
      unit: " J/deg",
    },
  ], [thermo.crankAnglePoints]);

  // Chart 2: P-V Diagram (Pressure vs Volume)
  const pvLoopSeries = useMemo(() => [
    {
      data: thermo.crankAnglePoints.map((p) => ({ x: p.volumeCc, y: p.pressureBar })),
      color: "#e879a0",
      fill: true,
      label: "P-V Indicator Loop",
      unit: " bar",
    },
  ], [thermo.crankAnglePoints]);

  // Determine stroke phase name from crank angle
  const getStrokePhaseName = (angle: number) => {
    if (angle < 180) return "1. Intake Stroke (0° - 180°)";
    if (angle < 360) return "2. Compression Stroke (180° - 360°)";
    if (angle < 540) return "3. Combustion & Expansion Power Stroke (360° - 540°)";
    return "4. Exhaust Blowdown & Scavenging Stroke (540° - 720°)";
  };

  return (
    <div className="flex flex-col h-full w-full bg-amber-950/90 backdrop-blur-2xl p-4 rounded-2xl border border-amber-800/30 shadow-2xl space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-900/40 p-3 rounded-xl border border-amber-800/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-slate-950 font-bold shadow-lg shadow-orange-500/20">
            <Flame size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-50">1D 720° P-V Combustion Cycle Studio</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                WIEBE BURN MODEL
              </span>
            </div>
            <p className="text-xs text-amber-200/60">
              Thermodynamic mean effective pressure & peak pressure location ATDC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-amber-100/80 bg-amber-950/80 px-3 py-1.5 rounded-xl border border-amber-800/30">
          <Activity size={13} className="text-amber-400" />
          <span>{rpm} RPM</span>
          <span className="text-amber-400">•</span>
          <span>{(throttle * 100).toFixed(0)}% WOT</span>
        </div>
      </div>

      {/* TOP STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        <div className="p-3 bg-amber-900/40 rounded-xl border border-amber-800/30 space-y-1">
          <span className="text-[10px] font-mono text-amber-200/60 uppercase tracking-wider block">Indicated MEP (IMEP)</span>
          <span className="text-base font-mono font-bold text-amber-300">{thermo.imepBar} bar</span>
        </div>
        <div className="p-3 bg-amber-900/40 rounded-xl border border-amber-800/30 space-y-1">
          <span className="text-[10px] font-mono text-amber-200/60 uppercase tracking-wider block">Brake MEP (BMEP)</span>
          <span className="text-base font-mono font-bold text-emerald-300">{thermo.bmepBar} bar</span>
        </div>
        <div className="p-3 bg-amber-900/40 rounded-xl border border-amber-800/30 space-y-1">
          <span className="text-[10px] font-mono text-amber-200/60 uppercase tracking-wider block">Friction MEP (FMEP)</span>
          <span className="text-base font-mono font-bold text-rose-300">{thermo.fmepBar} bar</span>
        </div>
        <div className="p-3 bg-amber-900/40 rounded-xl border border-amber-800/30 space-y-1">
          <span className="text-[10px] font-mono text-amber-200/60 uppercase tracking-wider block">Pmax Peak Pressure</span>
          <span className="text-base font-mono font-bold text-amber-300">{thermo.pMaxBar} bar</span>
        </div>
        <div className="p-3 bg-amber-900/40 rounded-xl border border-amber-800/30 space-y-1">
          <span className="text-[10px] font-mono text-amber-200/60 uppercase tracking-wider block">Pmax Location</span>
          <span className="text-base font-mono font-bold text-amber-300">{thermo.pMaxCrankAngleDeg - 360}° ATDC</span>
        </div>
        <div className="p-3 bg-amber-900/40 rounded-xl border border-amber-800/30 space-y-1">
          <span className="text-[10px] font-mono text-amber-200/60 uppercase tracking-wider block">Thermal Efficiency</span>
          <span className="text-base font-mono font-bold text-amber-300">{(thermo.indicatedThermalEfficiency * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* 2 DUAL CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* CHART 1: Pressure & Heat Release vs Crank Angle */}
        <div className="p-3 bg-amber-900/40 rounded-xl border border-amber-800/30 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-amber-50 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              Cylinder Pressure & Wiebe Heat Release (0° - 720°)
            </span>
            <span className="text-[10px] font-mono text-amber-200/60">Spark: {state.tuning?.ignitionTimingAdvanceDeg || 24}° BTDC</span>
          </div>
          <div className="flex-1 min-h-[220px]">
            <LineChart series={pressureChartSeries} xLabel="Crank Angle (°)" yLabel="bar / J/deg" height={220} />
          </div>
        </div>

        {/* CHART 2: P-V Indicator Diagram */}
        <div className="p-3 bg-amber-900/40 rounded-xl border border-amber-800/30 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-amber-50 uppercase tracking-wider flex items-center gap-1.5">
              <RotateCw size={14} className="text-rose-400" />
              P-V Cylinder Indicator Diagram (Work Loop)
            </span>
            <span className="text-[10px] font-mono text-amber-200/60">Pumping Loss: {thermo.pmepBar} bar</span>
          </div>
          <div className="flex-1 min-h-[220px]">
            <LineChart series={pvLoopSeries} xLabel="Cylinder Volume (cc)" yLabel="Pressure (bar)" height={220} />
          </div>
        </div>
      </div>

      {/* CRANK ANGLE SCRUBBER & LIVE TELEMETRY DECK */}
      <div className="p-3 bg-amber-900/40 rounded-xl border border-amber-800/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-50 uppercase tracking-wider">
              Scrub Crank Position:
            </span>
            <span className="text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/30">
              {scrubAngleDeg}° / 720°
            </span>
          </div>
          <span className="text-xs font-mono text-amber-300 font-bold">
            {getStrokePhaseName(scrubAngleDeg)}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={720}
          step={4}
          value={scrubAngleDeg}
          onChange={(e) => setScrubAngleDeg(Number(e.target.value))}
          className="w-full h-2 bg-amber-800/35 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />

        {/* Live Scrubbed Point Values */}
        {scrubPoint && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-amber-800/30 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-amber-950/80 border border-slate-850">
              <span className="text-amber-200/60 text-[10px]">Volume:</span>
              <span className="text-amber-300 font-bold">{scrubPoint.volumeCc} cc</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-amber-950/80 border border-slate-850">
              <span className="text-amber-200/60 text-[10px]">Pressure:</span>
              <span className="text-amber-300 font-bold">{scrubPoint.pressureBar} bar</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-amber-950/80 border border-slate-850">
              <span className="text-amber-200/60 text-[10px]">Temperature:</span>
              <span className="text-rose-300 font-bold">{scrubPoint.temperatureK} K</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-amber-950/80 border border-slate-850">
              <span className="text-amber-200/60 text-[10px]">Mass Burned:</span>
              <span className="text-emerald-300 font-bold">{(scrubPoint.massFractionBurned * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-amber-950/80 border border-slate-850 col-span-2 sm:col-span-1">
              <span className="text-amber-200/60 text-[10px]">Heat Release:</span>
              <span className="text-amber-300 font-bold">{scrubPoint.heatReleaseRateJDeg} J/deg</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
