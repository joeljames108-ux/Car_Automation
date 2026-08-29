// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — VIRTUAL WIND TUNNEL & CFD LAB STUDIO
// ============================================================================

import React, { useState, useMemo, memo } from "react";
import { Gauge, Wind, Activity, Zap, Play, RotateCw } from "lucide-react";
import { useF1ConstructorStore } from "../../../sim/f1/state/f1ConstructorStore";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export const WindTunnelStudio: React.FC = memo(function WindTunnelStudio() {
  const { car } = useF1ConstructorStore();
  const aero = car.aero;

  const [windSpeedKmh, setWindSpeedKmh] = useState(180); // FIA max 180 km/h in 60% tunnel
  const [tunnelRunning, setTunnelRunning] = useState(false);
  const [smokeStreams, setSmokeStreams] = useState(true);

  const { liftToDragRatio, dynamicDownforce, dynamicDrag } = useMemo(() => {
    const speedRatioSq = Math.pow(windSpeedKmh / 250, 2);
    return {
      liftToDragRatio: Number((aero.totalDownforceAt250KmhKg / aero.totalDragAt250KmhKg).toFixed(2)),
      dynamicDownforce: Math.round(aero.totalDownforceAt250KmhKg * speedRatioSq),
      dynamicDrag: Math.round(aero.totalDragAt250KmhKg * speedRatioSq),
    };
  }, [aero, windSpeedKmh]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Studio Header */}
      <div className="glass-panel p-6 border-amber-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="text-amber-400" size={24} />
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">
              60% Scale Rolling Road Wind Tunnel & CFD Rig
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            FIA Aerodynamic Testing Restrictions (ATR) compliant facility. Test boundary layer flow separation, vortex burst locations, floor ground proximity, and lift-to-drag efficiency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-amber-400">
              {liftToDragRatio} <span className="text-xs text-slate-400 font-normal">L/D</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Aero Efficiency Index</div>
          </div>
        </div>
      </div>

      {/* Wind Tunnel Telemetry Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Tunnel Wind Speed</div>
          <div className="font-mono text-2xl font-bold text-slate-200">{windSpeedKmh} <span className="text-xs text-slate-400">km/h</span></div>
          <div className="text-[11px] text-amber-400 mt-1">FIA 180 km/h ATR Cap</div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Measured Downforce</div>
          <div className="font-mono text-2xl font-bold text-amber-300">{dynamicDownforce} <span className="text-xs text-slate-400">kg</span></div>
          <div className="text-[11px] text-slate-400 mt-1">{aero.frontAeroBalancePercent}% Front Bias</div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Measured Drag</div>
          <div className="font-mono text-2xl font-bold text-amber-400">{dynamicDrag} <span className="text-xs text-slate-400">kg</span></div>
          <div className="text-[11px] text-slate-400 mt-1">CdA ~ 1.18 m²</div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Porpoising Risk Index</div>
          <div className="font-mono text-2xl font-bold text-ok-400">
            {aero.floorVenturiThroatHeightMm < 13 ? "HIGH (84%)" : "LOW (12%)"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{aero.floorVenturiThroatHeightMm}mm Throat Clearance</div>
        </div>
      </div>

      {/* Interactive Tunnel Controls */}
      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Tunnel Wind Velocity Sweep</span>
            <div className="text-xs text-slate-400">Slide to test aero load scaling across speed envelopes.</div>
          </div>
          <input
            type="range"
            min="60"
            max="350"
            step="5"
            value={windSpeedKmh}
            onChange={(e) => setWindSpeedKmh(parseInt(e.target.value))}
            className="w-full sm:w-64 accent-amber-400 cursor-pointer"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => {
              playHMIClickSound();
              setTunnelRunning(!tunnelRunning);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tunnelRunning
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-cyan-500/30"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
          >
            <Play size={14} className={tunnelRunning ? "animate-pulse" : ""} />
            <span>{tunnelRunning ? "Tunnel Active (Running)" : "Start Wind Tunnel Run"}</span>
          </button>

          <button
            onClick={() => {
              playHMIClickSound();
              setSmokeStreams(!smokeStreams);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              smokeStreams
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            {smokeStreams ? "Smoke Wakes Visible" : "Toggle Smoke Wakes"}
          </button>
        </div>
      </div>
    </div>
  );
});
