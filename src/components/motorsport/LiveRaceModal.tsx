// ===================================================================
// LIVE RACE MODAL — Telemetry Loop, Leaderboard, Diagrams & Radio Feed
// ===================================================================
import { memo } from "react";
import { Radio, Trophy, Play, SkipForward, CheckCircle } from "lucide-react";
import { CircuitDiagram, TelemetryGraph, SectorTimesBarChart, CarSilhouetteDiagram } from "../ui/Charts";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import type { SimResult } from "../../sim/types";

export interface LiveRaceState {
  round: number;
  totalRounds: number;
  trackName: string;
  lap: number;
  totalLaps: number;
  isPlaying: boolean;
  standings: { rank: number; name: string; gap: string; pts: number; isPlayer: boolean; pitStops: number }[];
  feed: { time: string; text: string; type: "overtake" | "pit" | "crash" | "fastest" | "info" }[];
}

interface LiveRaceModalProps {
  isOpen: boolean;
  state: LiveRaceState | null;
  sim: SimResult;
  onStepLap: () => void;
  onFinishRace: () => void;
  onClose: () => void;
}

export const LiveRaceModal = memo(function LiveRaceModal({ isOpen, state, sim, onStepLap, onFinishRace, onClose }: LiveRaceModalProps) {
  if (!isOpen || !state) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-4xl w-full p-6 shadow-[0_0_50px_rgba(34,211,238,0.2)] flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Radio size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">LIVE TELEMETRY FEED</span>
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">RACE ACTIVE</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100">Round {state.round}/{state.totalRounds} — {state.trackName}</h2>
            </div>
          </div>
          <button
            onClick={() => {
              playHMIClickSound();
              onFinishRace();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-all shadow-[0_0_12px_rgba(34,211,238,0.2)] cursor-pointer"
          >
            Skip to Final Results ➔
          </button>
        </div>

        {/* Lap Counter & Control Bar */}
        <div className="bg-base-950/80 rounded-xl p-4 border border-white/5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Current Lap</div>
              <div className="font-mono text-2xl font-black text-cyan-300">{state.lap} <span className="text-xs text-slate-500 font-normal">/ {state.totalLaps}</span></div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Track Conditions</div>
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">Dry · 24°C Surface</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playHMIClickSound();
                onStepLap();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-base-850 border border-base-700 text-slate-300 hover:bg-base-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <SkipForward size={14} /> Next Lap
            </button>
            <button
              onClick={() => {
                playHMIClickSound();
                onFinishRace();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle size={14} /> Complete Simulation
            </button>
          </div>
        </div>

        {/* Split Screen: Live Leaderboard + Radio Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Live Standings */}
          <div className="bg-base-950/60 rounded-xl p-4 border border-white/5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Trophy size={14} className="text-yellow-400" /> Live Race Leaderboard
            </h3>
            <div className="space-y-1.5">
              {state.standings.map((s) => (
                <div
                  key={s.rank}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono border transition-all ${
                    s.isPlayer
                      ? "bg-cyan-500/15 border-cyan-400/40 text-cyan-200 font-bold shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                      : "bg-base-850/50 border-base-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 text-center font-bold ${s.rank === 1 ? "text-yellow-400" : s.rank <= 3 ? "text-slate-200" : "text-slate-500"}`}>P{s.rank}</span>
                    <span>{s.name}</span>
                    {s.isPlayer && <span className="text-[9px] bg-cyan-400/20 text-cyan-300 px-1 rounded">YOU</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">{s.gap}</span>
                    <span className="text-slate-500 text-[10px]">{s.pitStops} PIT</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Race Radio & Event Ticker */}
          <div className="bg-base-950/60 rounded-xl p-4 border border-white/5 flex flex-col">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Radio size={14} className="text-cyan-400" /> Pit Wall Commentary Ticker
            </h3>
            <div className="space-y-2 flex-1 overflow-y-auto max-h-60 pr-1">
              {state.feed.map((f, i) => (
                <div key={i} className="text-xs bg-base-850/60 rounded-lg p-2.5 border border-base-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{f.time}</span>
                    <span className="text-[9px] text-slate-500 font-mono uppercase">{f.type}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Diagrams & Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CircuitDiagram
            trackName={state.trackName}
            country="International"
            lengthKm={5.79}
            turns={11}
          />
          <TelemetryGraph
            telemetryPoints={[
              { distancePercent: 0, speedKmh: 310, gear: 8, throttlePct: 100, brakePct: 0 },
              { distancePercent: 15, speedKmh: 110, gear: 3, throttlePct: 0, brakePct: 100 },
              { distancePercent: 30, speedKmh: 195, gear: 5, throttlePct: 80, brakePct: 0 },
              { distancePercent: 45, speedKmh: 285, gear: 7, throttlePct: 100, brakePct: 0 },
              { distancePercent: 60, speedKmh: 140, gear: 4, throttlePct: 10, brakePct: 90 },
              { distancePercent: 75, speedKmh: 240, gear: 6, throttlePct: 95, brakePct: 0 },
              { distancePercent: 90, speedKmh: 330, gear: 8, throttlePct: 100, brakePct: 0 },
              { distancePercent: 100, speedKmh: 315, gear: 8, throttlePct: 100, brakePct: 0 },
            ]}
          />
          <SectorTimesBarChart
            s1={24.312}
            s2={32.840}
            s3={22.105}
            bestS1={24.100}
            bestS2={32.400}
            bestS3={21.800}
          />
          <CarSilhouetteDiagram
            powerHp={sim.peakPower}
            downforceKg={sim.downforce}
            weightKg={sim.weight}
            aeroBalancePct={53}
          />
        </div>
      </div>
    </div>
  );
});

