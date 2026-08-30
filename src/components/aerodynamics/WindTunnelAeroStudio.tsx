/**
 * ============================================================================
 * WIND TUNNEL & CFD AERODYNAMICS STUDIO
 * ============================================================================
 * High-fidelity 3D aerodynamics simulation workbench featuring:
 * - Live dynamic pressure & flowfield streamline particles
 * - Active DRS & Airbrake deployment controls
 * - Venturi ground effect suction solver
 * - Aero balance (Front % vs Rear %) distribution meter
 * - Porpoising limit cycle risk monitor
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import {
  Wind,
  Gauge,
  Activity,
  Zap,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  ArrowUpRight,
  BarChart2,
  ChevronRight,
} from "lucide-react";
import {
  WindTunnelCfdPhysicsEngine,
  WindTunnelState,
} from "../../sim/aerodynamics/windTunnelCfdPhysicsEngine";

const DEFAULT_STATE: WindTunnelState = {
  airSpeedKmh: 240,
  airDensity: 1.225,
  temperatureC: 20,
  frontWingAngleDeg: 12,
  rearWingAngleDeg: 18,
  drsActive: false,
  rideHeightFrontMm: 35,
  rideHeightRearMm: 45,
  diffuserRampDeg: 14,
  sidepodVenturiWidthMm: 450,
  activeAirbrake: false,
};

export const WindTunnelAeroStudio: React.FC = () => {
  const [state, setState] = useState<WindTunnelState>(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState<"flowfield" | "pressure" | "balance">("flowfield");

  const results = useMemo(() => WindTunnelCfdPhysicsEngine.solve(state), [state]);

  const handleReset = () => setState(DEFAULT_STATE);

  const applyPreset = (preset: "monaco" | "lemans" | "drs_sprint" | "ground_effect") => {
    switch (preset) {
      case "monaco":
        setState((prev) => ({
          ...prev,
          frontWingAngleDeg: 22,
          rearWingAngleDeg: 30,
          drsActive: false,
          diffuserRampDeg: 20,
          rideHeightFrontMm: 30,
          rideHeightRearMm: 38,
          activeAirbrake: false,
        }));
        break;
      case "lemans":
        setState((prev) => ({
          ...prev,
          frontWingAngleDeg: 4,
          rearWingAngleDeg: 6,
          drsActive: false,
          diffuserRampDeg: 8,
          rideHeightFrontMm: 45,
          rideHeightRearMm: 55,
          activeAirbrake: false,
        }));
        break;
      case "drs_sprint":
        setState((prev) => ({
          ...prev,
          airSpeedKmh: 330,
          frontWingAngleDeg: 8,
          rearWingAngleDeg: 24,
          drsActive: true,
          activeAirbrake: false,
        }));
        break;
      case "ground_effect":
        setState((prev) => ({
          ...prev,
          airSpeedKmh: 280,
          rideHeightFrontMm: 15,
          rideHeightRearMm: 22,
          diffuserRampDeg: 22,
          activeAirbrake: false,
        }));
        break;
    }
  };

  return (
    <div className="flex flex-col w-full h-full space-y-4 p-2 sm:p-4 select-none bg-slate-950 text-slate-100 min-h-[720px] rounded-2xl border border-slate-800 shadow-2xl">
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-slate-950 shadow-md shadow-sky-500/30">
            <Wind size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-100 uppercase">
                Aero Lab & CFD Wind Tunnel Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-amber-300 font-mono text-[10px] font-extrabold border border-sky-500/30">
                ACTIVE CFD 3D
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time Navier-Stokes boundary pressure solver, Venturi suction, DRS actuation & aeroelastic stability
            </p>
          </div>
        </div>

        {/* Quick Test Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Presets:</span>
          <button
            onClick={() => applyPreset("monaco")}
            className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-amber-300 text-xs font-bold border border-slate-700 transition-all"
          >
            Monaco High Downforce
          </button>
          <button
            onClick={() => applyPreset("lemans")}
            className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-emerald-300 text-xs font-bold border border-slate-700 transition-all"
          >
            Le Mans Low Drag
          </button>
          <button
            onClick={() => applyPreset("drs_sprint")}
            className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-amber-300 text-xs font-bold border border-slate-700 transition-all"
          >
            DRS High Speed Sprint
          </button>
          <button
            onClick={() => applyPreset("ground_effect")}
            className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-amber-300 text-xs font-bold border border-slate-700 transition-all"
          >
            Extreme Venturi Ground Effect
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
            title="Reset Defaults"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main Grid: Controls + Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Control Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-300">
              <Sliders size={14} className="text-amber-400" />
              <span>Tunnel & Geometry Controls</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-sky-500/20">
              {state.airSpeedKmh} KM/H
            </span>
          </div>

          {/* Airspeed Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Wind Tunnel Airspeed</span>
              <span className="font-mono text-amber-400">{state.airSpeedKmh} km/h ({(state.airSpeedKmh / 3.6).toFixed(1)} m/s)</span>
            </div>
            <input
              type="range"
              min="0"
              max="400"
              step="5"
              value={state.airSpeedKmh}
              onChange={(e) => setState({ ...state, airSpeedKmh: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          {/* Front & Rear Wing Angles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">Front Wing Pitch</span>
                <span className="font-mono text-amber-400">{state.frontWingAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="-5"
                max="25"
                step="1"
                value={state.frontWingAngleDeg}
                onChange={(e) => setState({ ...state, frontWingAngleDeg: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">Rear Wing Pitch</span>
                <span className="font-mono text-amber-400">{state.rearWingAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="-5"
                max="35"
                step="1"
                value={state.rearWingAngleDeg}
                onChange={(e) => setState({ ...state, rearWingAngleDeg: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
            </div>
          </div>

          {/* Ride Height Front & Rear */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">Front Ride Height</span>
                <span className="font-mono text-emerald-400">{state.rideHeightFrontMm} mm</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="2"
                value={state.rideHeightFrontMm}
                onChange={(e) => setState({ ...state, rideHeightFrontMm: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">Rear Ride Height</span>
                <span className="font-mono text-emerald-400">{state.rideHeightRearMm} mm</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="2"
                value={state.rideHeightRearMm}
                onChange={(e) => setState({ ...state, rideHeightRearMm: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </div>

          {/* Diffuser Ramp & Sidepod Venturi Width */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">Diffuser Ramp Angle</span>
                <span className="font-mono text-amber-400">{state.diffuserRampDeg}°</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={state.diffuserRampDeg}
                onChange={(e) => setState({ ...state, diffuserRampDeg: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-slate-300">Venturi Width</span>
                <span className="font-mono text-amber-400">{state.sidepodVenturiWidthMm} mm</span>
              </div>
              <input
                type="range"
                min="200"
                max="800"
                step="25"
                value={state.sidepodVenturiWidthMm}
                onChange={(e) => setState({ ...state, sidepodVenturiWidthMm: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>
          </div>

          {/* Actuators & Toggles */}
          <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => setState({ ...state, drsActive: !state.drsActive })}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                state.drsActive
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-purple-500/20"
                  : "bg-slate-850 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Zap size={14} className={state.drsActive ? "text-amber-400" : ""} />
                <span>DRS Wing Slot</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900">
                {state.drsActive ? "OPEN" : "CLOSED"}
              </span>
            </button>

            <button
              onClick={() => setState({ ...state, activeAirbrake: !state.activeAirbrake })}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                state.activeAirbrake
                  ? "bg-red-500/20 text-red-300 border-red-500/40 shadow-sm shadow-red-500/20"
                  : "bg-slate-850 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Shield size={14} className={state.activeAirbrake ? "text-red-400" : ""} />
                <span>Active Airbrake</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900">
                {state.activeAirbrake ? "DEPLOYED" : "STOWED"}
              </span>
            </button>
          </div>

          {/* Porpoising Warning Panel */}
          {results.porpoisingRiskScore > 20 && (
            <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              results.porpoisingRiskScore > 60
                ? "bg-red-500/15 border-red-500/40 text-red-300 animate-pulse"
                : "bg-amber-500/15 border-amber-500/40 text-amber-300"
            }`}>
              <AlertTriangle size={20} className="shrink-0" />
              <div>
                <div className="text-xs font-extrabold uppercase">
                  {results.porpoisingRiskScore > 60 ? "Severe Porpoising Warning!" : "Aeroelastic Instability Risk"}
                </div>
                <div className="text-[11px] opacity-90">
                  Risk Level: {results.porpoisingRiskScore}/100. Raise ride height or soften diffuser ramp to prevent floor stalling.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Flowfield & Telemetry Viewport (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Sub-view Navigation Pills */}
          <div className="flex items-center justify-between bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("flowfield")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "flowfield"
                    ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Wind size={13} />
                <span>Dynamic Streamlines</span>
              </button>
              <button
                onClick={() => setActiveTab("pressure")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "pressure"
                    ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BarChart2 size={13} />
                <span>Pressure Profiles</span>
              </button>
              <button
                onClick={() => setActiveTab("balance")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "balance"
                    ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Activity size={13} />
                <span>Aero Balance & COP</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono pr-2">
              <span className="text-slate-400">q = <strong className="text-amber-300">{results.dynamicPressurePa} Pa</strong></span>
              <span className="text-slate-400">L/D = <strong className="text-emerald-400">{results.liftToDragRatio}</strong></span>
            </div>
          </div>

          {/* 3D Flowfield SVG Viewport */}
          <div className="relative w-full h-[380px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Background Grid Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
              <defs>
                <pattern id="cfd-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fbbf24" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cfd-grid)" />
            </svg>

            {activeTab === "flowfield" && (
              <svg className="w-full h-full" viewBox="-400 -200 800 400">
                {/* Ground plane */}
                <line x1="-380" y1="140" x2="380" y2="140" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />

                {/* Car Body Silhouette */}
                <path
                  d="M -220 120 L -180 115 L -100 80 L 20 70 L 140 85 L 180 100 L 220 120 L 220 135 L -220 135 Z"
                  fill="#1a1008"
                  stroke="#fbbf24"
                  strokeWidth="2"
                />

                {/* Front Wing SVG */}
                <g transform={`translate(-220, 125) rotate(${-state.frontWingAngleDeg})`}>
                  <rect x="-25" y="-6" width="30" height="8" rx="2" fill="#fbbf24" opacity="0.9" />
                  <line x1="-25" y1="0" x2="5" y2="0" stroke="#000" strokeWidth="1" />
                </g>

                {/* Rear Wing & DRS SVG */}
                <g transform={`translate(190, 80) rotate(${-state.rearWingAngleDeg})`}>
                  <rect x="-15" y="-12" width="40" height="10" rx="2" fill="#fbbf24" opacity="0.9" />
                  {state.drsActive && (
                    <line x1="-15" y1="-18" x2="25" y2="-18" stroke="#f59e0b" strokeWidth="3" strokeDasharray="2 2" />
                  )}
                </g>

                {/* Active Airbrake SVG */}
                {state.activeAirbrake && (
                  <line x1="120" y1="80" x2="150" y2="30" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
                )}

                {/* Venturi Underbody Tunnel Path */}
                <path
                  d="M -180 135 Q 0 100 180 135"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeDasharray="3 3"
                />

                {/* Flowfield Particles & Vector Arrows */}
                {results.particles.map((p) => {
                  const dx = (p.startX + (Date.now() * 0.05 * p.speedFactor)) % 760 - 380;
                  const dy = p.startY + Math.sin(dx * 0.02) * 8;
                  return (
                    <g key={p.id} transform={`translate(${dx}, ${dy})`}>
                      <circle r="3" fill={p.color} opacity="0.85" />
                      <line x1="0" y1="0" x2={12 * p.speedFactor} y2="0" stroke={p.color} strokeWidth="1.5" opacity="0.6" />
                    </g>
                  );
                })}
              </svg>
            )}

            {activeTab === "pressure" && (
              <div className="w-full h-full p-4 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-400 uppercase flex items-center justify-between">
                  <span>Surface Pressure Coefficient (Cp) Distribution</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Upper vs Underbody Vacuum</span>
                </div>
                <div className="flex-1 flex items-end gap-2 pt-4">
                  {results.pressureDistribution.map((pt, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-amber-500/40 rounded-t"
                        style={{ height: `${Math.max(10, Math.min(120, pt.cpUpper * 80))}px` }}
                        title={`Station ${pt.stationX}mm: Cp Upper = ${pt.cpUpper}`}
                      />
                      <div
                        className="w-full bg-amber-500/60 rounded-b"
                        style={{ height: `${Math.max(10, Math.min(120, Math.abs(pt.cpLower) * 60))}px` }}
                        title={`Station ${pt.stationX}mm: Cp Lower = ${pt.cpLower}`}
                      />
                      <span className="text-[9px] font-mono text-slate-500">{pt.stationX}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-6 text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                    <span>Upper Surface Cp</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500" />
                    <span>Underbody Venturi Vacuum (Suction)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "balance" && (
              <div className="w-full h-full p-6 flex flex-col justify-center space-y-6">
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">
                    Aerodynamic Balance & Center of Pressure (COP)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Optimal range: 42% - 48% Front for neutral cornering balance
                  </p>
                </div>

                {/* Dual Progress Bar for Balance */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-amber-400">FRONT: {results.frontAeroBalancePct}% ({results.frontDownforceN} N)</span>
                    <span className="text-amber-400">REAR: {results.rearAeroBalancePct}% ({results.rearDownforceN} N)</span>
                  </div>
                  <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex border border-slate-700">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-sky-400 transition-all duration-300"
                      style={{ width: `${results.frontAeroBalancePct}%` }}
                    />
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-300"
                      style={{ width: `${results.rearAeroBalancePct}%` }}
                    />
                  </div>
                </div>

                {/* Additional metrics */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Downforce</div>
                    <div className="text-base font-mono font-extrabold text-amber-400">{results.totalDownforceN} N</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Aero Drag</div>
                    <div className="text-base font-mono font-extrabold text-red-400">{results.totalDragN} N</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Drag Power Penalty</div>
                    <div className="text-base font-mono font-extrabold text-amber-400">{results.aerodynamicHorsepowerLossHp} HP</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cl (Lift Coeff.)</span>
              <span className="text-base font-mono font-extrabold text-amber-400">{results.clTotal}</span>
              <span className="text-[10px] text-slate-500">Downforce multiplier</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Cd (Drag Coeff.)</span>
              <span className="text-base font-mono font-extrabold text-amber-400">{results.cdTotal}</span>
              <span className="text-[10px] text-slate-500">Air resistance factor</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Venturi Suction</span>
              <span className="text-base font-mono font-extrabold text-amber-400">-{results.venturiSuctionPressureKPa} kPa</span>
              <span className="text-[10px] text-slate-500">Floor vacuum pressure</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Aeroacoustics</span>
              <span className="text-base font-mono font-extrabold text-emerald-400">{results.vortexSheddingFreqHz} Hz</span>
              <span className="text-[10px] text-slate-500">Vortex frequency</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
