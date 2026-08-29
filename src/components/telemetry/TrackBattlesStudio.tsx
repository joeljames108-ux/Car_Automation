/**
 * ============================================================================
 * TRACK BATTLES & TELEMETRY REPLAY STUDIO
 * ============================================================================
 * High-fidelity Head-to-Head Track Battle & Telemetry Analysis Workbench:
 * - 2D G-G Friction Circle Diagram (Lateral vs Longitudinal G)
 * - Real-time Velocity & Distance Overlay Trace
 * - Sector-by-Sector Time Split Analysis
 * - Track Circuit Telemetry Playback Engine
 * ============================================================================
 */

import React, { useState, useMemo, memo } from "react";
import {
  Trophy,
  Flag,
  Activity,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  BarChart2,
  TrendingUp,
  Award,
  Zap,
  MapPin,
  Clock,
} from "lucide-react";
import {
  TrackBattlesTelemetryEngine,
  CIRCUITS_CATALOG,
  CircuitId,
  VehicleTelemetrySpecs,
} from "../../sim/telemetry/trackBattlesTelemetryEngine";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";

const CAR_A_DEFAULT: VehicleTelemetrySpecs = {
  name: "Apex Spec-R Hypercar (Current Build)",
  horsepowerHp: 850,
  massKg: 1250,
  downforceNAt200: 6500,
  cdDrag: 0.33,
  tireGripCoeff: 1.55,
};

const CAR_B_DEFAULT: VehicleTelemetrySpecs = {
  name: "Benchmark GT3 Competition Rival",
  horsepowerHp: 620,
  massKg: 1280,
  downforceNAt200: 5200,
  cdDrag: 0.38,
  tireGripCoeff: 1.42,
};

export const TrackBattlesStudio: React.FC = memo(function TrackBattlesStudio() {
  const [circuitId, setCircuitId] = useState<CircuitId>("nurburgring");
  const [carA, setCarA] = useState<VehicleTelemetrySpecs>(CAR_A_DEFAULT);
  const [carB, setCarB] = useState<VehicleTelemetrySpecs>(CAR_B_DEFAULT);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackFrameIdx, setPlaybackFrameIdx] = useState<number>(0);

  const results = useMemo(
    () => TrackBattlesTelemetryEngine.solveBattle(circuitId, carA, carB),
    [circuitId, carA, carB]
  );

  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlaybackFrameIdx((prev) => {
        if (prev >= results.telemetryFrames.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, results.telemetryFrames.length]);

  const activeFrame = results.telemetryFrames[playbackFrameIdx] || results.telemetryFrames[0];

  return (
    <div className="flex flex-col w-full h-full space-y-4 p-2 sm:p-4 select-none bg-slate-950 text-slate-100 min-h-[720px] rounded-2xl border border-slate-800 shadow-2xl">
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/30">
            <Trophy size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-100 uppercase">
                Track Battles & Telemetry Replay Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-extrabold border border-emerald-500/30">
                LAP SIMULATOR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-sector lap time delta solver, G-G friction circle diagrams & real-time telemetry playback
            </p>
          </div>
        </div>

        {/* Circuit Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Circuit:</span>
          {(Object.keys(CIRCUITS_CATALOG) as CircuitId[]).map((cId) => {
            const c = CIRCUITS_CATALOG[cId];
            return (
              <button
                key={cId}
                onClick={() => {
                  playHMIClickSound();
                  setCircuitId(cId);
                  setPlaybackFrameIdx(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  circuitId === cId
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30 font-extrabold"
                    : "bg-slate-850 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Battle Winner Callout Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Award size={24} />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-slate-400">Battle Winner</div>
            <div className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <span>{results.winner === "A" ? carA.name : carB.name}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {Math.abs(results.timeDeltaSec)}s FASTER
              </span>
            </div>
          </div>
        </div>

        {/* Lap Times Summary */}
        <div className="flex items-center gap-6 font-mono">
          <div className="text-right">
            <div className="text-[10px] text-amber-400 uppercase font-bold">{carA.name}</div>
            <div className="text-base font-extrabold text-amber-300">{results.lapTimeFormattedA}</div>
          </div>
          <div className="text-slate-600 font-bold text-lg">VS</div>
          <div>
            <div className="text-[10px] text-amber-400 uppercase font-bold">{carB.name}</div>
            <div className="text-base font-extrabold text-amber-300">{results.lapTimeFormattedB}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls + Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Car Specs Tuning (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-slate-300">
              <Sliders size={14} className="text-emerald-400" />
              <span>Vehicle Setup (Car A vs Car B)</span>
            </div>
          </div>

          {/* Car A Horsepower */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-amber-400">Car A Horsepower</span>
              <span className="font-mono text-amber-400">{carA.horsepowerHp} HP</span>
            </div>
            <input
              type="range"
              min="300"
              max="1500"
              step="25"
              value={carA.horsepowerHp}
              onChange={(e) => setCarA({ ...carA, horsepowerHp: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Car A Downforce */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-amber-400">Car A Downforce (@200km/h)</span>
              <span className="font-mono text-amber-400">{carA.downforceNAt200} N</span>
            </div>
            <input
              type="range"
              min="1000"
              max="12000"
              step="250"
              value={carA.downforceNAt200}
              onChange={(e) => setCarA({ ...carA, downforceNAt200: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Car B Horsepower */}
          <div className="space-y-1 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-amber-400">Car B Horsepower</span>
              <span className="font-mono text-amber-400">{carB.horsepowerHp} HP</span>
            </div>
            <input
              type="range"
              min="300"
              max="1500"
              step="25"
              value={carB.horsepowerHp}
              onChange={(e) => setCarB({ ...carB, horsepowerHp: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* Car B Downforce */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-amber-400">Car B Downforce (@200km/h)</span>
              <span className="font-mono text-amber-400">{carB.downforceNAt200} N</span>
            </div>
            <input
              type="range"
              min="1000"
              max="12000"
              step="250"
              value={carB.downforceNAt200}
              onChange={(e) => setCarB({ ...carB, downforceNAt200: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {/* Sector Splits Breakdown */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Sector Time Splits</span>
            {results.sectors.map((sec, idx) => (
              <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono flex items-center justify-between">
                <span className="text-slate-400 font-sans">{sec.name}</span>
                <span className={sec.deltaSec >= 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                  {sec.deltaSec >= 0 ? `-${sec.deltaSec}s` : `+${Math.abs(sec.deltaSec)}s`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Telemetry Viewport & Friction Circle (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* G-G Friction Circle Diagram SVG */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400">Friction Circle (G-G Diagram)</span>
              <svg width="220" height="220" viewBox="-110 -110 220 220">
                {/* Concentric G circles */}
                <circle r="90" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                <circle r="60" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                <circle r="30" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

                <line x1="-100" y1="0" x2="100" y2="0" stroke="#475569" strokeWidth="1" />
                <line x1="0" y1="-100" x2="0" y2="100" stroke="#475569" strokeWidth="1" />

                {/* Car A Friction Envelope Dot */}
                <circle
                  cx={activeFrame.lateralGA * 45}
                  cy={-activeFrame.longitudinalGA * 45}
                  r="8"
                  fill="#f59e0b"
                  opacity="0.8"
                />

                {/* Car B Friction Envelope Dot */}
                <circle
                  cx={activeFrame.lateralGB * 45}
                  cy={-activeFrame.longitudinalGB * 45}
                  r="8"
                  fill="#fbbf24"
                  opacity="0.8"
                />
              </svg>
              <div className="flex justify-between w-full text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                <span className="text-amber-400">Car A: {activeFrame.lateralGA}G Lat / {activeFrame.longitudinalGA}G Long</span>
                <span className="text-amber-400">Car B: {activeFrame.lateralGB}G Lat / {activeFrame.longitudinalGB}G Long</span>
              </div>
            </div>

            {/* Live Playback Telemetry Gauge */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase text-slate-400">Telemetry Replay Feed</span>
                <span className="text-xs font-mono text-emerald-400 font-bold">{activeFrame.distanceMeters}m</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Car A Speed</span>
                  <span className="text-amber-400 font-bold">{activeFrame.speedKmhA} km/h</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all" style={{ width: `${(activeFrame.speedKmhA / results.topSpeedKmhA) * 100}%` }} />
                </div>

                <div className="flex justify-between text-xs font-mono pt-2">
                  <span className="text-slate-400">Car B Speed</span>
                  <span className="text-amber-400 font-bold">{activeFrame.speedKmhB} km/h</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all" style={{ width: `${(activeFrame.speedKmhB / results.topSpeedKmhB) * 100}%` }} />
                </div>
              </div>

              {/* Playback Controls & Scrubber */}
              <div className="pt-2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playHMIClickSound();
                        setIsPlaying(!isPlaying);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                      <span>{isPlaying ? "PAUSE" : "PLAY"}</span>
                    </button>
                    <button
                      onClick={() => {
                        playHMIClickSound();
                        setIsPlaying(false);
                        setPlaybackFrameIdx(0);
                      }}
                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all cursor-pointer"
                      title="Reset to Lap Start"
                    >
                      <RotateCcw size={13} />
                    </button>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Frame: <strong className="text-white">{playbackFrameIdx + 1}</strong> / {results.telemetryFrames.length}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={results.telemetryFrames.length - 1}
                  value={playbackFrameIdx}
                  onChange={(e) => setPlaybackFrameIdx(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TrackBattlesStudio;
