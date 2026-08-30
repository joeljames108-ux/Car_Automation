// ============================================================================
// PHASE 23 — POWERTRAIN DYNO & TELEMETRY HUD DASHBOARD COMPONENT
// ============================================================================
// High-contrast interactive dynamometer power/torque curve visualizer,
// circuit lap simulator selector, and real-time telemetry gauges.
// ============================================================================

import React, { useState } from 'react';
import {
  Zap,
  Activity,
  Timer,
  Trophy,
  Flame,
  Gauge,
  Sliders,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  HighResDynamometerSimulator,
  DynoSimulationResult,
} from '../../sim/engine/highResDynamometerSimulator';
import {
  CircuitLapTimeSimulator,
  LapSimulationResult,
} from '../../sim/track/circuitLapTimeSimulator';

export const PowertrainDynoDashboard: React.FC = () => {
  const [displacement, setDisplacement] = useState<number>(4.0);
  const [cylinderCount, setCylinderCount] = useState<number>(8);
  const [isTurbocharged, setIsTurbocharged] = useState<boolean>(true);
  const [boostBar, setBoostBar] = useState<number>(1.5);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('SPA_FRANCORCHAMPS');

  // Run Dyno Simulation
  const dyno: DynoSimulationResult = HighResDynamometerSimulator.runDynoSweep({
    engineDisplacementLiters: displacement,
    cylinderCount,
    boreMm: 86.0,
    strokeMm: 86.0,
    compressionRatio: isTurbocharged ? 10.0 : 12.5,
    idleRpm: 850,
    redlineRpm: 8500,
    isTurbocharged,
    maxBoostBar: boostBar,
    fuelOctaneRating: 98,
  });

  // Run Track Lap Simulation
  const selectedTrack = CircuitLapTimeSimulator.PRESET_TRACKS[selectedTrackId] || CircuitLapTimeSimulator.PRESET_TRACKS.SPA_FRANCORCHAMPS;
  const lap: LapSimulationResult = CircuitLapTimeSimulator.simulateLap(
    selectedTrack,
    1180,
    dyno.peakPowerBhp,
    1.60,
    4200
  );

  // SVG Dyno Chart Dimensions
  const chartW = 540;
  const chartH = 260;
  const maxRpm = 8500;
  const maxTorque = Math.max(800, dyno.peakTorqueNm * 1.15);
  const maxPower = Math.max(800, dyno.peakPowerBhp * 1.15);

  const torquePoints = dyno.curve
    .map((pt) => {
      const x = ((pt.rpm - 850) / (maxRpm - 850)) * chartW;
      const y = chartH - (pt.torqueNm / maxTorque) * chartH;
      return `${x},${y}`;
    })
    .join(' ');

  const powerPoints = dyno.curve
    .map((pt) => {
      const x = ((pt.rpm - 850) / (maxRpm - 850)) * chartW;
      const y = chartH - (pt.powerBhp / maxPower) * chartH;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col h-full bg-slate-900/80 text-gray-100 font-sans border border-[#1b2333] rounded-2xl overflow-hidden shadow-2xl">
      {/* Dyno Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/80 border-b border-[#1b2333]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-100">
              High-Precision Engine Dynamometer & Apex Track Lap Simulator
            </h3>
            <span className="text-[11px] text-gray-400 font-mono">
              BMEP Thermodynamic Cycle & Point-Mass Curvature Integration
            </span>
          </div>
        </div>

        {/* Peak Performance Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-red-500/30">
            <Flame className="w-4 h-4 text-red-400" />
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block uppercase">Peak Power</span>
              <span className="font-mono font-bold text-red-400 text-xs">
                {dyno.peakPowerBhp} BHP <span className="text-gray-400 text-[10px]">@{dyno.peakPowerRpm}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-amber-500/30">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block uppercase">Peak Torque</span>
              <span className="font-mono font-bold text-amber-400 text-xs">
                {dyno.peakTorqueNm} Nm <span className="text-gray-400 text-[10px]">@{dyno.peakTorqueRpm}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Dyno Curves & Telemetry */}
        <div className="flex-1 p-5 flex flex-col space-y-4 overflow-y-auto">
          {/* Dyno Graph Card */}
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-[#1b2333] shadow-inner flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Torque (Nm) & Power (BHP) Dyno Sweep
              </span>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-amber-400 font-mono">
                  <span className="w-3 h-0.5 bg-amber-400 inline-block" /> Torque (Nm)
                </span>
                <span className="flex items-center gap-1.5 text-red-400 font-mono">
                  <span className="w-3 h-0.5 bg-red-400 inline-block" /> Power (BHP)
                </span>
              </div>
            </div>

            {/* SVG Dyno Graph */}
            <div className="relative h-64 w-full bg-slate-900/80 rounded-xl border border-[#161c28] p-2 flex items-center justify-center">
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible">
                {/* Horizontal Gridlines */}
                {[0.25, 0.5, 0.75, 1.0].map((frac, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={chartH * (1 - frac)}
                    x2={chartW}
                    y2={chartH * (1 - frac)}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1"
                    strokeDasharray="4, 4"
                  />
                ))}

                {/* Torque Curve */}
                <polyline
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="3.0"
                  points={torquePoints}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Power Curve */}
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3.0"
                  points={powerPoints}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Circuit Lap Simulator Card */}
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-[#1b2333] flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <Timer className="w-4 h-4 text-emerald-400" />
                Live Circuit Lap Time Telemetry ({selectedTrack.name})
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                LAP TIME: {lap.lapTimeString}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-[#1e2638]">
                <span className="text-gray-400 block text-[10px] uppercase">Top Speed</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{lap.topSpeedKmh} km/h</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-[#1e2638]">
                <span className="text-gray-400 block text-[10px] uppercase">Avg Lap Speed</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{lap.avgSpeedKmh} km/h</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-[#1e2638]">
                <span className="text-gray-400 block text-[10px] uppercase">Circuit Length</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{(selectedTrack.totalLengthM / 1000).toFixed(2)} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Engine Parameter Controls */}
        <div className="w-80 bg-slate-900/80 border-l border-[#1b2333] p-4 flex flex-col space-y-4 overflow-y-auto">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            Powertrain Configuration
          </h4>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Displacement:</span>
                <span className="font-mono text-amber-400 font-bold">{displacement.toFixed(1)}L</span>
              </div>
              <input
                type="range"
                min="1.6"
                max="7.0"
                step="0.1"
                value={displacement}
                onChange={(e) => setDisplacement(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-400 mb-1">
                <span>Cylinder Count:</span>
                <span className="font-mono text-amber-400 font-bold">{cylinderCount} Cylinders</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mt-1">
                {[4, 6, 8, 12].map((cyl) => (
                  <button
                    key={cyl}
                    onClick={() => setCylinderCount(cyl)}
                    className={`py-1 rounded-lg font-mono text-xs transition-all ${
                      cylinderCount === cyl
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-slate-900/80 text-gray-400 hover:bg-[#1e2738]'
                    }`}
                  >
                    V{cyl}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-800">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={isTurbocharged}
                  onChange={(e) => setIsTurbocharged(e.target.checked)}
                  className="accent-amber-400"
                />
                <span className="text-gray-300 font-semibold">Turbocharger Induction</span>
              </label>

              {isTurbocharged && (
                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Max Boost Pressure:</span>
                    <span className="font-mono text-amber-400 font-bold">{boostBar.toFixed(2)} bar</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.05"
                    value={boostBar}
                    onChange={(e) => setBoostBar(parseFloat(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Track Selector */}
            <div className="pt-2 border-t border-gray-800">
              <span className="text-gray-400 block mb-1.5 uppercase text-[10px]">Grand Prix Circuit Preset</span>
              <div className="space-y-1">
                {Object.values(CircuitLapTimeSimulator.PRESET_TRACKS).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrackId(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                      selectedTrackId === t.id
                        ? 'bg-amber-500/10 border border-amber-500/40 text-amber-300'
                        : 'bg-slate-900/80 hover:bg-slate-900/80 text-gray-400'
                    }`}
                  >
                    <span>{t.name}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
