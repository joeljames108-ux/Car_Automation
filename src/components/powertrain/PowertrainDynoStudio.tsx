/**
 * ============================================================================
 * POWERTRAIN DYNO & ECU REMAPPING STUDIO
 * ============================================================================
 * High-fidelity Dyno & ECU Calibration Workbench featuring:
 * - Real-time Dyno Power & Torque curve graph visualizer
 * - Multi-stage ECU Remapping (Ignition Timing, Turbo Boost, AFR Target)
 * - Anti-Knock Margin & Exhaust Gas Temperature (EGT) Pyrometry
 * - Fuel flow L/h & Specific Output HP/L calculations
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import {
  Flame,
  Zap,
  Activity,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Gauge,
  Droplet,
  Cpu,
  BarChart2,
  TrendingUp,
} from "lucide-react";
import {
  PowertrainDynoEcuEngine,
  EcuMapState,
  FuelType,
} from "../../sim/powertrain/powertrainDynoEcuEngine";

const DEFAULT_ECU_STATE: EcuMapState = {
  engineName: "4.0L V8 Twin-Turbo Spec-R",
  displacementL: 4.0,
  cylinderCount: 8,
  fuelType: "octane98",
  boostBar: 1.4,
  ignitionTimingBtdcDeg: 22,
  targetAfr: 11.8,
  camDurationDeg: 275,
  revLimitRpm: 8250,
  hasWaterMethanolInjection: false,
};

export const PowertrainDynoStudio: React.FC = () => {
  const [ecuState, setEcuState] = useState<EcuMapState>(DEFAULT_ECU_STATE);
  const [activeGraphTab, setActiveGraphTab] = useState<"power_torque" | "bmep_ve" | "egt_knock">("power_torque");

  const results = useMemo(() => PowertrainDynoEcuEngine.solve(ecuState), [ecuState]);

  const handleReset = () => setEcuState(DEFAULT_ECU_STATE);

  const applyTunePreset = (preset: "stock" | "stage1" | "stage3_e85" | "track_endurance") => {
    switch (preset) {
      case "stock":
        setEcuState((prev) => ({
          ...prev,
          boostBar: 0.8,
          ignitionTimingBtdcDeg: 18,
          targetAfr: 12.4,
          fuelType: "octane91",
          revLimitRpm: 7500,
          hasWaterMethanolInjection: false,
        }));
        break;
      case "stage1":
        setEcuState((prev) => ({
          ...prev,
          boostBar: 1.5,
          ignitionTimingBtdcDeg: 23,
          targetAfr: 11.8,
          fuelType: "octane98",
          revLimitRpm: 8000,
          hasWaterMethanolInjection: false,
        }));
        break;
      case "stage3_e85":
        setEcuState((prev) => ({
          ...prev,
          boostBar: 2.6,
          ignitionTimingBtdcDeg: 29,
          targetAfr: 11.2,
          fuelType: "e85",
          revLimitRpm: 8800,
          hasWaterMethanolInjection: true,
        }));
        break;
      case "track_endurance":
        setEcuState((prev) => ({
          ...prev,
          boostBar: 1.2,
          ignitionTimingBtdcDeg: 20,
          targetAfr: 11.5,
          fuelType: "race105",
          revLimitRpm: 7800,
          hasWaterMethanolInjection: true,
        }));
        break;
    }
  };

  return (
    <div className="flex flex-col w-full h-full space-y-4 p-2 sm:p-4 select-none bg-slate-950 text-slate-100 min-h-[720px] rounded-2xl border border-slate-800 shadow-2xl">
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-red-600 text-slate-950 shadow-md shadow-amber-500/30">
            <Flame size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-100 uppercase">
                Master Powertrain Dyno & ECU Remapping Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-extrabold border border-amber-500/30">
                REAL-TIME DYNO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Virtual dyno sweep solver, ECU fuel/ignition calibration, knock margin pyrometry & BMEP analysis
            </p>
          </div>
        </div>

        {/* Quick Tune Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Tune Presets:</span>
          <button
            onClick={() => applyTunePreset("stock")}
            className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 transition-all"
          >
            Factory OEM
          </button>
          <button
            onClick={() => applyTunePreset("stage1")}
            className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-amber-300 text-xs font-bold border border-slate-700 transition-all"
          >
            Stage 1 Reflash
          </button>
          <button
            onClick={() => applyTunePreset("stage3_e85")}
            className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-amber-300 text-xs font-bold border border-slate-700 transition-all"
          >
            Stage 3 E85 Beast
          </button>
          <button
            onClick={() => applyTunePreset("track_endurance")}
            className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-emerald-300 text-xs font-bold border border-slate-700 transition-all"
          >
            Track Endurance
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
            title="Reset Tune"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left ECU Tuning Controls (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-300">
              <Cpu size={14} className="text-amber-400" />
              <span>ECU Calibration Controls</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {ecuState.engineName}
            </span>
          </div>

          {/* Fuel Type Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Fuel Grade & Octane Rating</label>
            <select
              value={ecuState.fuelType}
              onChange={(e) => setEcuState({ ...ecuState, fuelType: e.target.value as FuelType })}
              className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 rounded-lg p-2 focus:outline-none focus:border-amber-500"
            >
              <option value="octane91">91 Octane (Pump Premium - 91 AKI)</option>
              <option value="octane98">98 Octane (Super High Octane - 98 RON)</option>
              <option value="race105">105 Octane (Race Fuel - 105 RON)</option>
              <option value="e85">E85 Bio-Ethanol (85% Ethanol - 112 RON)</option>
            </select>
          </div>

          {/* Engine Displacement & Turbo Boost */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">Displacement</span>
                <span className="font-mono text-amber-400">{ecuState.displacementL} L</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.2"
                value={ecuState.displacementL}
                onChange={(e) => setEcuState({ ...ecuState, displacementL: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">Turbo Boost</span>
                <span className="font-mono text-amber-400">{ecuState.boostBar} bar</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.5"
                step="0.1"
                value={ecuState.boostBar}
                onChange={(e) => setEcuState({ ...ecuState, boostBar: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>

          {/* Ignition Timing Advance & Target AFR */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">Ignition Timing</span>
                <span className="font-mono text-amber-400">{ecuState.ignitionTimingBtdcDeg}° BTDC</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="1"
                value={ecuState.ignitionTimingBtdcDeg}
                onChange={(e) => setEcuState({ ...ecuState, ignitionTimingBtdcDeg: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">Target AFR</span>
                <span className="font-mono text-emerald-400">{ecuState.targetAfr}:1</span>
              </div>
              <input
                type="range"
                min="10.0"
                max="15.0"
                step="0.1"
                value={ecuState.targetAfr}
                onChange={(e) => setEcuState({ ...ecuState, targetAfr: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </div>

          {/* Cam Duration & Rev Limiter */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">Cam Duration</span>
                <span className="font-mono text-amber-400">{ecuState.camDurationDeg}°</span>
              </div>
              <input
                type="range"
                min="240"
                max="320"
                step="5"
                value={ecuState.camDurationDeg}
                onChange={(e) => setEcuState({ ...ecuState, camDurationDeg: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">Rev Limiter</span>
                <span className="font-mono text-red-400">{ecuState.revLimitRpm} RPM</span>
              </div>
              <input
                type="range"
                min="6000"
                max="10500"
                step="250"
                value={ecuState.revLimitRpm}
                onChange={(e) => setEcuState({ ...ecuState, revLimitRpm: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
              />
            </div>
          </div>

          {/* Water Methanol Injection Toggle */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setEcuState({ ...ecuState, hasWaterMethanolInjection: !ecuState.hasWaterMethanolInjection })}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                ecuState.hasWaterMethanolInjection
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-cyan-500/20"
                  : "bg-slate-850 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Droplet size={14} className={ecuState.hasWaterMethanolInjection ? "text-amber-400" : ""} />
                <span>Water-Methanol Injection (WMI)</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900">
                {ecuState.hasWaterMethanolInjection ? "ENABLED (+8 OCTANE)" : "DISABLED"}
              </span>
            </button>
          </div>

          {/* Danger Warning Banners */}
          {results.hasKnockDanger && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 flex items-center gap-2.5 animate-pulse">
              <AlertTriangle size={18} className="shrink-0 text-red-400" />
              <div className="text-xs">
                <strong className="block uppercase font-bold">CATASTROPIC KNOCK RISK!</strong>
                Retard ignition timing or increase fuel octane to avoid engine destruction.
              </div>
            </div>
          )}

          {results.hasOverheatDanger && (
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-2.5">
              <Flame size={18} className="shrink-0 text-amber-400" />
              <div className="text-xs">
                <strong className="block uppercase font-bold">EGT Overheat Warning ({results.maxEgtC}°C)</strong>
                Richen AFR or reduce boost to protect exhaust valves and turbocharger.
              </div>
            </div>
          )}
        </div>

        {/* Right Dyno Graph Viewport (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Sub-graph Navigation Pills */}
          <div className="flex items-center justify-between bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveGraphTab("power_torque")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeGraphTab === "power_torque"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <TrendingUp size={13} />
                <span>Power & Torque Sweep</span>
              </button>
              <button
                onClick={() => setActiveGraphTab("bmep_ve")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeGraphTab === "bmep_ve"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BarChart2 size={13} />
                <span>BMEP & VE Efficiency</span>
              </button>
              <button
                onClick={() => setActiveGraphTab("egt_knock")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeGraphTab === "egt_knock"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Activity size={13} />
                <span>EGT & Knock Pyrometry</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono pr-2">
              <span className="text-slate-400">Peak: <strong className="text-amber-400">{results.peakPowerHp} HP</strong> @ {results.peakPowerRpm} RPM</span>
            </div>
          </div>

          {/* SVG Dyno Graph Viewport */}
          <div className="relative w-full h-[380px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center p-4">
            <svg className="w-full h-full" viewBox="0 0 600 300">
              {/* Background Dyno Grid */}
              <defs>
                <pattern id="dyno-grid" width="60" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 30" fill="none" stroke="#334155" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dyno-grid)" opacity="0.3" />

              {/* Axes Labels */}
              <text x="15" y="20" fill="#94a3b8" fontSize="10" fontFamily="monospace">HP / Nm</text>
              <text x="540" y="290" fill="#94a3b8" fontSize="10" fontFamily="monospace">RPM</text>

              {/* Curves Rendering */}
              {activeGraphTab === "power_torque" && (
                <>
                  {/* Horsepower Polyline (Red/Amber) */}
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    points={results.dynoCurve
                      .map((d, i) => {
                        const x = 40 + (i / (results.dynoCurve.length - 1)) * 520;
                        const y = 270 - (d.horsepowerHp / (results.peakPowerHp * 1.15)) * 240;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />

                  {/* Torque Polyline (Cyan) */}
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    points={results.dynoCurve
                      .map((d, i) => {
                        const x = 40 + (i / (results.dynoCurve.length - 1)) * 520;
                        const y = 270 - (d.torqueNm / (results.peakTorqueNm * 1.15)) * 240;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />
                </>
              )}

              {activeGraphTab === "bmep_ve" && (
                <>
                  {/* BMEP Polyline (Purple) */}
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    points={results.dynoCurve
                      .map((d, i) => {
                        const x = 40 + (i / (results.dynoCurve.length - 1)) * 520;
                        const y = 270 - (d.bmepBar / (results.maxBmepBar * 1.2)) * 240;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />
                </>
              )}

              {activeGraphTab === "egt_knock" && (
                <>
                  {/* EGT Polyline (Red) */}
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    points={results.dynoCurve
                      .map((d, i) => {
                        const x = 40 + (i / (results.dynoCurve.length - 1)) * 520;
                        const y = 270 - (d.egtC / 1100) * 240;
                        return `${x},${y}`;
                      })
                      .join(" ")}
                  />
                </>
              )}
            </svg>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Peak Horsepower</span>
              <span className="text-base font-mono font-extrabold text-amber-400">{results.peakPowerHp} HP</span>
              <span className="text-[10px] text-slate-500">@ {results.peakPowerRpm} RPM</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Peak Torque</span>
              <span className="text-base font-mono font-extrabold text-amber-400">{results.peakTorqueNm} Nm</span>
              <span className="text-[10px] text-slate-500">@ {results.peakTorqueRpm} RPM</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Specific Output</span>
              <span className="text-base font-mono font-extrabold text-amber-400">{results.specificOutputHpPerL} HP/L</span>
              <span className="text-[10px] text-slate-500">Power density ratio</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Fuel Flow Rate</span>
              <span className="text-base font-mono font-extrabold text-emerald-400">{results.fuelFlowLitersPerHour} L/h</span>
              <span className="text-[10px] text-slate-500">WOT consumption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
