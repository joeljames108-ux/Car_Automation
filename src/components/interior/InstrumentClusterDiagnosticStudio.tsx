/**
 * ============================================================================
 * "UNDERSTANDING YOUR DASHBOARD" — INSTRUMENT CLUSTER & WARNING LIGHTS STUDIO
 * ============================================================================
 * Implements the exact layout from the reference graphic:
 * - Top Window: "WINDOW FOR DIAGRAM • UNDERSTANDING YOUR DASHBOARD"
 *   housing the 3D Instrument Cluster GLB with animated needles and 24 telltales.
 * - Bottom Matrix: "COMMON DASHBOARD WARNING LIGHTS (may vary by make and model)"
 *   categorized into Green/Blue Informational, Amber/Yellow Caution, and Red Critical.
 * ============================================================================
 */

import React, { useState } from "react";
import {
  Gauge,
  AlertTriangle,
  Zap,
  Activity,
  ShieldAlert,
  Flame,
  Wrench,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Sparkles,
  Info,
  Radio,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  useInstrumentClusterStore,
  TELLTALE_DEFINITIONS,
  type TelltaleDefinition,
  type ClusterTheme,
} from "../../state/instrumentClusterStore";
import { InstrumentClusterCanvasViewport } from "./InstrumentClusterCanvasViewport";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";

export const InstrumentClusterDiagnosticStudio: React.FC = () => {
  const [activeDtcSelector, setActiveDtcSelector] = useState("none");
  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>("abs");

  // Store Selectors
  const warningLights = useInstrumentClusterStore((s) => s.warningLights);
  const focusedLightId = useInstrumentClusterStore((s) => s.focusedLightId);
  const isBulbCheckRunning = useInstrumentClusterStore((s) => s.isBulbCheckRunning);
  const activeDtcCode = useInstrumentClusterStore((s) => s.activeDtcCode);
  const hazardBlinkerActive = useInstrumentClusterStore((s) => s.hazardBlinkerActive);
  const theme = useInstrumentClusterStore((s) => s.theme);

  const speedMph = useInstrumentClusterStore((s) => s.speedMph);
  const engineRpm = useInstrumentClusterStore((s) => s.engineRpm);
  const fuelLevelPct = useInstrumentClusterStore((s) => s.fuelLevelPct);
  const coolantTempC = useInstrumentClusterStore((s) => s.coolantTempC);
  const batteryVolts = useInstrumentClusterStore((s) => s.batteryVolts);
  const oilPressurePsi = useInstrumentClusterStore((s) => s.oilPressurePsi);

  // Store Setters
  const toggleWarningLight = useInstrumentClusterStore((s) => s.toggleWarningLight);
  const setWarningLight = useInstrumentClusterStore((s) => s.setWarningLight);
  const setAllWarningLights = useInstrumentClusterStore((s) => s.setAllWarningLights);
  const setFocusedLightId = useInstrumentClusterStore((s) => s.setFocusedLightId);
  const setTheme = useInstrumentClusterStore((s) => s.setTheme);

  const setSpeedMph = useInstrumentClusterStore((s) => s.setSpeedMph);
  const setEngineRpm = useInstrumentClusterStore((s) => s.setEngineRpm);
  const setFuelLevelPct = useInstrumentClusterStore((s) => s.setFuelLevelPct);
  const setCoolantTempC = useInstrumentClusterStore((s) => s.setCoolantTempC);
  const setBatteryVolts = useInstrumentClusterStore((s) => s.setBatteryVolts);
  const setOilPressurePsi = useInstrumentClusterStore((s) => s.setOilPressurePsi);

  const injectDtcFault = useInstrumentClusterStore((s) => s.injectDtcFault);
  const clearDtcFaults = useInstrumentClusterStore((s) => s.clearDtcFaults);
  const runIgnitionBulbCheck = useInstrumentClusterStore((s) => s.runIgnitionBulbCheck);
  const toggleHazardBlinkers = useInstrumentClusterStore((s) => s.toggleHazardBlinkers);
  const resetAll = useInstrumentClusterStore((s) => s.resetAll);

  // Group telltales by category
  const greenBlueLights = TELLTALE_DEFINITIONS.filter((t) => t.category === "green_blue");
  const amberLights = TELLTALE_DEFINITIONS.filter((t) => t.category === "amber");
  const redLights = TELLTALE_DEFINITIONS.filter((t) => t.category === "red");

  const handleDtcSelect = (code: string) => {
    playHMITabSound();
    setActiveDtcSelector(code);
    if (code === "none") {
      clearDtcFaults();
    } else {
      injectDtcFault(code);
    }
  };

  const handleLightClick = (t: TelltaleDefinition) => {
    playHMIClickSound();
    setFocusedLightId(t.id);
    setExpandedDetailsId(expandedDetailsId === t.id ? null : t.id);
  };

  const focusedDef = TELLTALE_DEFINITIONS.find((t) => t.id === focusedLightId);

  return (
    <div className="w-full flex flex-col gap-4 p-3 md:p-5 rounded-2xl bg-slate-950 text-slate-100 font-sans select-none border border-slate-800 shadow-2xl">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP SECTION: "WINDOW FOR DIAGRAM" (Exact Wireframe Box)    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full rounded-2xl border-2 border-red-500/90 shadow-[0_0_30px_rgba(239,68,68,0.22)] bg-slate-900/90 overflow-hidden flex flex-col">
        {/* Header matching wireframe specification */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-red-950/40 border-b border-red-500/40 backdrop-blur-md gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-[0.25em] text-red-400">
              WINDOW FOR DIAGRAM • UNDERSTANDING YOUR DASHBOARD
            </span>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playHMITabSound();
                runIgnitionBulbCheck();
              }}
              disabled={isBulbCheckRunning}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-lg ${
                isBulbCheckRunning
                  ? "bg-amber-500 text-slate-950 animate-pulse"
                  : "bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950"
              }`}
            >
              <Zap size={13} />
              <span>{isBulbCheckRunning ? "RUNNING BULB CHECK..." : "⚡ TEST BULB CHECK"}</span>
            </button>

            <button
              onClick={() => {
                playHMIClickSound();
                toggleHazardBlinkers();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                hazardBlinkerActive
                  ? "bg-red-600 text-white animate-pulse ring-2 ring-red-400"
                  : "bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700"
              }`}
            >
              <AlertTriangle size={13} />
              <span>HAZARD</span>
            </button>

            <button
              onClick={() => {
                playHMIClickSound();
                resetAll();
                setActiveDtcSelector("none");
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>RESET</span>
            </button>
          </div>
        </div>

        {/* Live 3D Viewport of Instrument Cluster GLB */}
        <InstrumentClusterCanvasViewport />

        {/* Diagnostic Status Strip */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-xs font-mono text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">DTC OBD-II STATUS:</span>
            {activeDtcCode ? (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold animate-pulse">
                ACTIVE FAULT: {activeDtcCode}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                ✓ ALL VEHICLE SYSTEMS NORMAL (0 FAULTS)
              </span>
            )}
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">ILLUMINATION:</span>
            {(["ice_blue", "amber_classic", "crimson_sport", "arctic_white", "neon_cyber"] as ClusterTheme[]).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => {
                    playHMIClickSound();
                    setTheme(t);
                  }}
                  className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                    theme === t ? "scale-125 ring-2 ring-white" : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor:
                      t === "ice_blue"
                        ? "#38bdf8"
                        : t === "amber_classic"
                        ? "#f59e0b"
                        : t === "crimson_sport"
                        ? "#ef4444"
                        : t === "arctic_white"
                        ? "#f8fafc"
                        : "#a855f7",
                  }}
                  title={t}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. LIVE DYNAMOMETER & TELEMETRY CONTROL BAR                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        {/* Speed Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">VEHICLE SPEED</span>
            <span className="text-cyan-400 font-bold">{Math.round(speedMph)} MPH</span>
          </div>
          <input
            type="range"
            min={0}
            max={160}
            value={speedMph}
            onChange={(e) => setSpeedMph(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* RPM Rev Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">ENGINE TACHOMETER</span>
            <span className="text-emerald-400 font-bold">{Math.round(engineRpm)} RPM</span>
          </div>
          <input
            type="range"
            min={0}
            max={8000}
            step={50}
            value={engineRpm}
            onChange={(e) => setEngineRpm(Number(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* Fuel Level */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">FUEL TANK LEVEL</span>
            <span className="text-amber-400 font-bold">{Math.round(fuelLevelPct)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={fuelLevelPct}
            onChange={(e) => setFuelLevelPct(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* DTC Fault Injector */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">INJECT DIAGNOSTIC FAULT</span>
            <span className="text-red-400 font-bold">{activeDtcSelector.toUpperCase()}</span>
          </div>
          <select
            value={activeDtcSelector}
            onChange={(e) => handleDtcSelect(e.target.value)}
            className="w-full px-2 py-1 text-xs font-mono rounded bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer focus:ring-1 focus:ring-cyan-400"
          >
            <option value="none">No Faults (Normal Running)</option>
            <option value="P0300">P0300 — Misfire (Check Engine)</option>
            <option value="C0035">C0035 — Wheel Speed (ABS / TCS)</option>
            <option value="B0001">B0001 — Airbag Squib Circuit</option>
            <option value="P0524">P0524 — Low Oil Pressure (Critical)</option>
            <option value="P0217">P0217 — Coolant Overheat (130°C)</option>
            <option value="P0562">P0562 — Low System Voltage (Alternator)</option>
            <option value="C0750">C0750 — Low Tire Pressure (TPMS)</option>
          </select>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. BOTTOM MATRIX: "COMMON DASHBOARD WARNING LIGHTS"           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-400" />
            COMMON DASHBOARD WARNING LIGHTS{" "}
            <span className="text-[11px] font-normal text-slate-400 lowercase">
              (may vary by make and model)
            </span>
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => {
                playHMIClickSound();
                setAllWarningLights(true);
              }}
              className="px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
            >
              ALL ON
            </button>
            <button
              onClick={() => {
                playHMIClickSound();
                setAllWarningLights(false);
              }}
              className="px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
            >
              ALL OFF
            </button>
          </div>
        </div>

        {/* 3 Equal-Width Column Grid Matching Wireframe Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ── CARD 1: GREEN / BLUE OPERATIONAL INDICATORS ─────────────── */}
          <div className="flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-4 py-2.5 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  OPERATIONAL INDICATORS
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80">NORMAL ACTIVE</span>
            </div>

            <div className="flex flex-col divide-y divide-slate-800/60 p-2">
              {greenBlueLights.map((t) => {
                const isActive = !!warningLights[t.id];
                const isSelected = focusedLightId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleLightClick(t)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800/90 ring-1 ring-emerald-400"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{t.iconSymbol}</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{t.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {isActive ? "ACTIVE & ILLUMINATED" : "STANDBY"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playHMIClickSound();
                          toggleWarningLight(t.id);
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {isActive ? "ON" : "OFF"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── CARD 2: YELLOW / AMBER CAUTION & FAULT WARNINGS ──────────── */}
          <div className="flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-4 py-2.5 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  SYSTEM & CAUTION WARNINGS
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400/80">SERVICE / ADVISORY</span>
            </div>

            <div className="flex flex-col divide-y divide-slate-800/60 p-2 max-h-[480px] overflow-y-auto">
              {amberLights.map((t) => {
                const isActive = !!warningLights[t.id];
                const isSelected = focusedLightId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleLightClick(t)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800/90 ring-1 ring-amber-400"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{t.iconSymbol}</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{t.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {isActive ? "FAULT DETECTED" : "NORMAL"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playHMIClickSound();
                          toggleWarningLight(t.id);
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {isActive ? "ON" : "OFF"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── CARD 3: RED CRITICAL SAFETY & EMERGENCY ALERTS ───────────── */}
          <div className="flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-4 py-2.5 bg-red-950/40 border-b border-red-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-xs font-black uppercase tracking-wider text-red-300">
                  CRITICAL SAFETY ALERTS
                </span>
              </div>
              <span className="text-[10px] font-mono text-red-400/80">IMMEDIATE ACTION</span>
            </div>

            <div className="flex flex-col divide-y divide-slate-800/60 p-2 max-h-[480px] overflow-y-auto">
              {redLights.map((t) => {
                const isActive = !!warningLights[t.id];
                const isSelected = focusedLightId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleLightClick(t)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800/90 ring-1 ring-red-400"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{t.iconSymbol}</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{t.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {isActive ? "CRITICAL ALERT" : "NORMAL"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playHMIClickSound();
                          toggleWarningLight(t.id);
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-red-500 text-white shadow-md shadow-red-500/40 animate-pulse"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {isActive ? "ON" : "OFF"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. SELECTED INDICATOR DEEP-DIVE DIAGNOSTIC PANEL              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {focusedDef && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{focusedDef.iconSymbol}</span>
              <div className="flex flex-col">
                <span
                  className="text-sm font-black uppercase tracking-wider"
                  style={{ color: focusedDef.colorHex }}
                >
                  {focusedDef.name}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  CATEGORY: {focusedDef.category.toUpperCase().replace("_", " & ")} • MESH ID:{" "}
                  {focusedDef.meshNodeName}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playHMIClickSound();
                toggleWarningLight(focusedDef.id);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                warningLights[focusedDef.id]
                  ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {warningLights[focusedDef.id] ? "ILLUMINATED (ACTIVE)" : "EXTINGUISHED (OFF)"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                <Info size={12} /> TECHNICAL DESCRIPTION
              </span>
              <p className="text-slate-200 leading-relaxed">{focusedDef.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                <Activity size={12} /> VEHICLE SYSTEM ACTION
              </span>
              <p className="text-slate-200 leading-relaxed">{focusedDef.systemAction}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                <Wrench size={12} /> RECOMMENDED SERVICE PROCEDURE
              </span>
              <p className="text-slate-200 leading-relaxed">{focusedDef.recommendedFix}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
