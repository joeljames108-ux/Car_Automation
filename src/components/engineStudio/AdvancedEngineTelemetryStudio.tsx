/**
 * ============================================================================
 * APEX ENGINEER — MASTER ADVANCED ENGINE TELEMETRY & NVH STUDIO
 * ============================================================================
 * Unified multi-deck telemetry, ECU tuning, thermodynamics & NVH suite.
 * Tabs:
 * 1. 16x16 3D ECU Map Editor
 * 2. 720° P-V Combustion Thermodynamics
 * 3. 100-Point Thermal Distribution
 * 4. Hydrodynamic Journal Bearings
 * 5. NVH & Acoustic Spectrum
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import {
  Activity,
  Flame,
  Zap,
  Gauge,
  Cpu,
  Thermometer,
  Volume2,
  Sliders,
  Layers,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Sparkles,
} from "lucide-react";
import { MasterEngineState } from "../../sim/engine/masterEngineTypes";
import { MasterEngineStateEngine } from "../../sim/engine/masterEngineStateEngine";
import {
  AdvancedEngineTelemetrySolver,
  MasterAdvancedTelemetryReport,
} from "../../sim/engine/advancedEngineTelemetrySolver";
import { EngineAcousticsNVHSolver, NVHAcousticsReport } from "../../sim/engine/engineAcousticsNVHSolver";
import { ECU3DMapEditor } from "./ECU3DMapEditor";
import { CombustionCyclePVStudio } from "./CombustionCyclePVStudio";

interface AdvancedEngineTelemetryStudioProps {
  state?: MasterEngineState;
  engine?: MasterEngineStateEngine;
}

type TelemetryStudioDeck =
  | "ecu_maps"
  | "pv_combustion"
  | "thermal_nodes"
  | "journal_bearings"
  | "nvh_acoustics";

export const AdvancedEngineTelemetryStudio: React.FC<AdvancedEngineTelemetryStudioProps> = ({
  state: externalState,
  engine,
}) => {
  const localEngine = useMemo(() => engine || MasterEngineStateEngine.getInstance(), [engine]);
  const state = externalState || localEngine.getState();

  const [activeDeck, setActiveDeck] = useState<TelemetryStudioDeck>("ecu_maps");
  const [testRpm, setTestRpm] = useState<number>(6200);
  const [testThrottle, setTestThrottle] = useState<number>(1.0);

  // Compute master telemetry physics report
  const report: MasterAdvancedTelemetryReport = useMemo(() => {
    return AdvancedEngineTelemetrySolver.solve(state, testRpm, testThrottle);
  }, [state, testRpm, testThrottle]);

  // Compute NVH Acoustics report
  const nvh: NVHAcousticsReport = useMemo(() => {
    return EngineAcousticsNVHSolver.solve(state, testRpm, testThrottle);
  }, [state, testRpm, testThrottle]);

  return (
    <div className="flex flex-col h-full w-full space-y-4 p-2 sm:p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
      {/* ================================================================= */}
      {/* STUDIO DECK HEADER & CONTROLS */}
      {/* ================================================================= */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-500/25">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Advanced Engine Telemetry & NVH Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-violet-500/30">
                12-CHANNEL REAL-TIME
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ECU 3D Calibration • P-V Combustion • 100-Node Thermal • Hydrodynamics • 1/3-Octave Acoustic Spectrum
            </p>
          </div>
        </div>

        {/* Test Condition Scrubbers (RPM & Throttle) */}
        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">RPM:</span>
            <input
              type="range"
              min={1000}
              max={9500}
              step={100}
              value={testRpm}
              onChange={(e) => setTestRpm(Number(e.target.value))}
              className="w-24 h-1.5 bg-slate-800 rounded appearance-none accent-amber-400 cursor-pointer"
            />
            <span className="text-amber-300 font-bold w-14 text-right">{testRpm}</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className="text-slate-400">WOT:</span>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={testThrottle}
              onChange={(e) => setTestThrottle(Number(e.target.value))}
              className="w-20 h-1.5 bg-slate-800 rounded appearance-none accent-emerald-400 cursor-pointer"
            />
            <span className="text-emerald-300 font-bold w-10 text-right">{(testThrottle * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* STUDIO DECK NAVIGATION TABS */}
      {/* ================================================================= */}
      <div className="flex bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 gap-1.5 overflow-x-auto">
        {[
          { id: "ecu_maps" as const, label: "3D ECU Map Editor", icon: <Cpu size={14} /> },
          { id: "pv_combustion" as const, label: "720° P-V Combustion", icon: <Flame size={14} /> },
          { id: "thermal_nodes" as const, label: "100-Point Thermal Map", icon: <Thermometer size={14} /> },
          { id: "journal_bearings" as const, label: "Journal Hydrodynamics", icon: <Layers size={14} /> },
          { id: "nvh_acoustics" as const, label: "NVH Acoustic Spectrum", icon: <Volume2 size={14} /> },
        ].map((deck) => (
          <button
            key={deck.id}
            onClick={() => setActiveDeck(deck.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeDeck === deck.id
                ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-bold shadow-md shadow-violet-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
          >
            {deck.icon}
            <span>{deck.label}</span>
          </button>
        ))}
      </div>

      {/* ================================================================= */}
      {/* ACTIVE STUDIO DECK CONTENT */}
      {/* ================================================================= */}
      <div className="flex-1 w-full min-h-[580px]">
        {/* 1. 3D ECU MAP EDITOR */}
        {activeDeck === "ecu_maps" && (
          <ECU3DMapEditor state={state} currentRpm={testRpm} currentMapKPa={Math.round(101.3 + (testThrottle * 80))} />
        )}

        {/* 2. P-V COMBUSTION STUDIO */}
        {activeDeck === "pv_combustion" && (
          <CombustionCyclePVStudio state={state} rpm={testRpm} throttle={testThrottle} />
        )}

        {/* 3. 100-POINT THERMAL MAP */}
        {activeDeck === "thermal_nodes" && (
          <div className="flex flex-col h-full w-full bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <Thermometer size={18} className="text-rose-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">100-Node Finite Thermal Distribution</h3>
                  <p className="text-xs text-slate-400">Continuous heat flux & peak component limit monitoring</p>
                </div>
              </div>
              <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-300">
                Overall Thermal Stress: {report.thermal.overallThermalStressIndex}%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {report.thermal.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    node.status === "critical"
                      ? "bg-rose-950/40 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                      : node.status === "warning"
                      ? "bg-amber-950/30 border-amber-500/40"
                      : "bg-slate-900/60 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200">{node.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{node.category}</span>
                  </div>

                  <div className="flex items-baseline justify-between font-mono my-2">
                    <span className={`text-lg font-extrabold ${
                      node.status === "critical" ? "text-rose-400" : node.status === "warning" ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {node.tempC}°C
                    </span>
                    <span className="text-[11px] text-slate-400">Limit: {node.maxLimitC}°C</span>
                  </div>

                  {/* Temp Bar */}
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${
                        node.status === "critical" ? "bg-rose-500" : node.status === "warning" ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, (node.tempC / node.maxLimitC) * 100)}%` }}
                    />
                  </div>

                  <div className="text-[10.5px] font-mono text-slate-400 flex justify-between">
                    <span>Heat Flux:</span>
                    <span className="text-amber-300 font-bold">{(node.heatFluxW / 1000).toFixed(1)} kW</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. HYDRODYNAMIC JOURNAL BEARINGS */}
        {activeDeck === "journal_bearings" && (
          <div className="flex flex-col h-full w-full bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-4 font-mono">
            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <Layers size={18} className="text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans">Hydrodynamic Journal Bearing Lubrication</h3>
                  <p className="text-xs text-slate-400 font-sans">Sommerfeld number calculation & oil film thickness</p>
                </div>
              </div>
              <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                Safety Margin: {report.bearings.hydrodynamicSafetyMargin}x
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs text-slate-400 font-sans block font-bold">Main Bearing Oil Film</span>
                <div className="text-3xl font-extrabold text-amber-300">
                  {report.bearings.mainBearingMinFilmThicknessMicron} µm
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Minimum hydrodynamic oil film thickness at {testRpm} RPM under peak pressure.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs text-slate-400 font-sans block font-bold">Rod Bearing Oil Film</span>
                <div className="text-3xl font-extrabold text-emerald-300">
                  {report.bearings.rodBearingMinFilmThicknessMicron} µm
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Reciprocating big-end rod journal oil film clearance.
                </p>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                <span className="text-xs text-slate-400 font-sans block font-bold">Sommerfeld Number (S)</span>
                <div className="text-3xl font-extrabold text-amber-300">
                  {report.bearings.sommerfeldNumber}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Dimensionless lubrication parameter balancing speed, load & viscosity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-400 block">Peak Pressure</span>
                <span className="text-sm font-bold text-slate-200">{report.bearings.peakBearingPressureMPa} MPa</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-400 block">Oil Viscosity</span>
                <span className="text-sm font-bold text-amber-300">{report.bearings.oilViscosityCentistokes} cSt</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-400 block">Bearing Wear Rate</span>
                <span className="text-sm font-bold text-emerald-300">{report.bearings.bearingWearRateMicronPerHour} µm/hr</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-400 block">Hydrodynamic Status</span>
                <span className="text-sm font-bold text-emerald-400">OPTIMAL FLUID FILM</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. NVH & ACOUSTIC SPECTRUM */}
        {activeDeck === "nvh_acoustics" && (
          <div className="flex flex-col h-full w-full bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-4 font-mono">
            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <Volume2 size={18} className="text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans">Computational Acoustic Spectrum & NVH</h3>
                  <p className="text-xs text-slate-400 font-sans">1/3 Octave band SPL decibel frequencies & cabin sound quality</p>
                </div>
              </div>
              <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-950/60 border border-violet-500/40 text-amber-300">
                Engine Sound Quality: {nvh.soundQualityScore} / 100
              </div>
            </div>

            {/* Drone Risk Warning Banner if active */}
            {nvh.exhaustResonance.isCabinDroneRisk && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl flex items-center gap-3 text-xs text-rose-300 font-sans">
                <AlertTriangle size={16} className="text-rose-400 flex-shrink-0" />
                <div>
                  <span className="font-bold">Cabin Exhaust Drone Risk Detected:</span> Fundamental exhaust pulse ({nvh.exhaustResonance.fundamentalExhaustPulseFreqHz} Hz) aligns with Helmholtz pipe resonance ({nvh.exhaustResonance.helmholtzResonatorFreqHz} Hz) in range {nvh.exhaustResonance.droneRpmRange[0]}-{nvh.exhaustResonance.droneRpmRange[1]} RPM.
                </div>
              </div>
            )}

            {/* Frequency Spectrum Bar Chart */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 font-sans block">1/3 Octave Frequency Spectrum (20 Hz - 16 kHz)</span>
              <div className="flex items-end gap-1.5 h-36 pt-4 px-2 bg-slate-950 rounded-lg border border-slate-850 overflow-x-auto">
                {nvh.octaveBands.map((band) => {
                  const heightPct = Math.min(100, Math.max(10, (band.soundPressureLevelDb / 120) * 100));
                  return (
                    <div key={band.centerFreqHz} className="flex-1 flex flex-col items-center gap-1 group min-w-[20px]">
                      <div className="w-full bg-slate-800 rounded-t overflow-hidden h-28 flex items-end">
                        <div
                          className="w-full bg-gradient-to-t from-violet-600 via-purple-500 to-amber-400 group-hover:brightness-125 transition-all"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-[8px] text-slate-500 rotate-45 transform origin-left">{band.centerFreqHz}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Noise Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-400 block font-sans">Engine Bay SPL</span>
                <span className="text-lg font-extrabold text-amber-300">{nvh.overallDbA} dBA</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-400 block font-sans">Cabin Noise (WOT)</span>
                <span className="text-lg font-extrabold text-amber-300">{nvh.mechanicalNoise.cabinNoiseAtWOTDbA} dBA</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-400 block font-sans">Loudness</span>
                <span className="text-lg font-extrabold text-amber-300">{nvh.loudnessSones} Sones</span>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-400 block font-sans">Exhaust Firing Pulse</span>
                <span className="text-lg font-extrabold text-emerald-300">{nvh.exhaustResonance.fundamentalExhaustPulseFreqHz} Hz</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
