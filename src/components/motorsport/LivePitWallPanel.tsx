// ===================================================================
// LIVE PIT WALL & RACE TELEMETRY COMMAND CENTER
// ===================================================================
// Vision Glass pit wall dashboard with real-time driver radio telemetry,
// tire pyrometry, 4-corner thermals, pit stop strategy execution,
// dynamic DRS status, and 3D track viewport.
// ===================================================================

import React, { useState, useEffect, memo } from "react";
import { TrackRacing3DViewport } from "../racing/TrackRacing3DViewport";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";
import {
  Radio,
  Flame,
  Zap,
  Gauge,
  Activity,
  Wind,
  Disc,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface TireTelemetry {
  tempC: number;
  pressureBar: number;
  wearPct: number;
}

const LivePitWallPanelComponent: React.FC = () => {
  const [activeStrategy, setActiveStrategy] = useState<
    "UNDERCUT_PUSH" | "OVERCUT_EXTEND" | "CONSERVE_TIRES"
  >("UNDERCUT_PUSH");
  const [selectedTireCompound, setSelectedTireCompound] = useState<
    "SOFT_SLICK" | "MEDIUM_SLICK" | "HARD_SLICK" | "WET_INTERMEDIATE"
  >("SOFT_SLICK");
  const [pitWindowLap, setPitWindowLap] = useState<number>(14);
  const [drsEnabled, setDrsEnabled] = useState<boolean>(true);

  // Dynamic Live Telemetry State
  const [speedKmh, setSpeedKmh] = useState(288);
  const [gear, setGear] = useState(7);
  const [rpm, setRpm] = useState(11850);
  const [ersDeployPct, setErsDeployPct] = useState(78);
  const [gapToLeaderSec, setGapToLeaderSec] = useState(1.42);

  // 4-Corner Tire Pyrometry
  const [tires, setTires] = useState<{
    fl: TireTelemetry;
    fr: TireTelemetry;
    rl: TireTelemetry;
    rr: TireTelemetry;
  }>({
    fl: { tempC: 104, pressureBar: 1.55, wearPct: 18 },
    fr: { tempC: 108, pressureBar: 1.58, wearPct: 22 },
    rl: { tempC: 98, pressureBar: 1.48, wearPct: 14 },
    rr: { tempC: 101, pressureBar: 1.50, wearPct: 16 },
  });

  // Simulated live telemetry fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return;
      const now = Date.now();
      const nextSpeed = Math.round(270 + Math.sin(now / 400) * 35);
      const nextRpm = Math.round(11200 + Math.sin(now / 300) * 1200);
      const nextGear = nextSpeed > 260 ? 7 : nextSpeed > 210 ? 6 : 5;
      const nextErs = Math.max(15, Math.min(100, Math.round(75 + Math.sin(now / 1500) * 20)));
      const nextGap = Number((1.42 + Math.sin(now / 2000) * 0.35).toFixed(3));

      setSpeedKmh(nextSpeed);
      setRpm(nextRpm);
      setGear(nextGear);
      setErsDeployPct(nextErs);
      setGapToLeaderSec(nextGap);

      setTires(prev => ({
        fl: { ...prev.fl, tempC: Math.round(102 + Math.sin(now / 1200) * 4) },
        fr: { ...prev.fr, tempC: Math.round(106 + Math.cos(now / 1100) * 5) },
        rl: { ...prev.rl, tempC: Math.round(97 + Math.sin(now / 1400) * 3) },
        rr: { ...prev.rr, tempC: Math.round(100 + Math.cos(now / 1300) * 3) },
      }));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const getTireTempColor = (c: number) => {
    if (c < 85) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    if (c <= 105) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    return "text-rose-400 border-rose-500/40 bg-rose-500/10 animate-pulse";
  };

  const radioMessages = [
    { lap: 12, sender: "RACE ENGINEER", msg: "Box this lap for soft slicks! Undercut window is open (+1.8s delta).", type: "URGENT" },
    { lap: 11, sender: "DRIVER 1", msg: "Front-right surface temp reaching 108°C. Mild understeer into Turn 4.", type: "WARNING" },
    { lap: 9, sender: "RACE ENGINEER", msg: "Gap to leader P1 is +1.42s. DRS zone is active down the back straight.", type: "INFO" },
  ];

  return (
    <div className="space-y-6 text-slate-100 animate-fade-in">
      {/* 3D Track Viewport Component */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-base-950">
        <TrackRacing3DViewport />
        
        {/* Live HUD Floating Overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-3 bg-base-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-500/30 text-xs font-mono shadow-xl pointer-events-none">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>LIVE PIT WALL TELEMETRY</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">P1 LEADER GAP: {gapToLeaderSec}s</span>
          <span className="text-slate-600">|</span>
          <span className={`font-bold ${drsEnabled ? "text-amber-400" : "text-slate-500"}`}>
            DRS: {drsEnabled ? "ACTIVE (ZONE 2)" : "CLOSED"}
          </span>
        </div>
      </div>

      {/* Live Telemetry Data Stream Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border-white/5 bg-slate-900/60">
          <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Gauge size={13} className="text-amber-400" /> Ground Speed
          </div>
          <div className="text-xl font-mono font-black text-amber-300 mt-1">
            {speedKmh} <span className="text-xs text-slate-500 font-normal">km/h</span>
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">Top: 324 km/h</div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border-white/5 bg-slate-900/60">
          <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Activity size={13} className="text-emerald-400" /> Gear & Engine RPM
          </div>
          <div className="text-xl font-mono font-black text-emerald-300 mt-1">
            G{gear} <span className="text-xs text-slate-500 font-normal">@{rpm} RPM</span>
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">Rev Limit: 12,500</div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border-white/5 bg-slate-900/60">
          <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Zap size={13} className="text-amber-400" /> Hybrid ERS Battery
          </div>
          <div className="text-xl font-mono font-black text-amber-300 mt-1">
            {ersDeployPct}% <span className="text-xs text-slate-500 font-normal">SOC</span>
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">Harvest: +160 kW</div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border-white/5 bg-slate-900/60">
          <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Clock size={13} className="text-amber-400" /> Pit Stop Target
          </div>
          <div className="text-xl font-mono font-black text-amber-300 mt-1">
            LAP {pitWindowLap}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">Stationary: ~2.35s</div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border-white/5 bg-slate-900/60 col-span-2 sm:col-span-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5">
            <Wind size={13} className="text-amber-400" /> Aero Balance
          </div>
          <div className="text-xl font-mono font-black text-amber-300 mt-1">
            44.2% <span className="text-xs text-slate-500 font-normal">Front</span>
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">Downforce: 1,420 kg</div>
        </div>
      </div>

      {/* Main Pit Wall Strategy & Pyrometry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Pit Strategy & Compound (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border-white/10 bg-slate-900/70 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>PIT STOP STRATEGY EXECUTION</span>
            </h3>

            <div className="space-y-2">
              {[
                {
                  id: "UNDERCUT_PUSH",
                  label: "Undercut Push (Box Early)",
                  desc: "Pits 2 laps early on soft slicks to jump the leader in pit lane.",
                  delta: "-1.85s Expected Gain",
                },
                {
                  id: "OVERCUT_EXTEND",
                  label: "Overcut Extend (Clean Air)",
                  desc: "Extends stint in clean air for fresh rubber delta at race finish.",
                  delta: "-0.95s Tire Delta",
                },
                {
                  id: "CONSERVE_TIRES",
                  label: "Tire Saver (1-Stop Optimum)",
                  desc: "Manages carcass thermals to eliminate 2nd pit stop entirely.",
                  delta: "+22.5s Net Strategy Save",
                },
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => {
                    playHMITabSound();
                    setActiveStrategy(st.id as any);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    activeStrategy === st.id
                      ? "bg-amber-500/20 border-amber-500/60 text-white shadow-lg shadow-amber-500/10"
                      : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{st.label}</span>
                    <span className="text-[10px] font-mono text-amber-300 font-semibold">{st.delta}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{st.desc}</div>
                </button>
              ))}
            </div>

            {/* Tire Compound Switcher */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Flame size={12} className="text-rose-400" /> Next Stint Fitted Compound
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "SOFT_SLICK", label: "Soft Slick (C5)", color: "border-red-500/60 text-red-300 bg-red-500/10" },
                  { id: "MEDIUM_SLICK", label: "Medium (C3)", color: "border-yellow-500/60 text-yellow-300 bg-yellow-500/10" },
                  { id: "HARD_SLICK", label: "Hard Slick (C1)", color: "border-slate-400/60 text-slate-200 bg-slate-400/10" },
                  { id: "WET_INTERMEDIATE", label: "Inter Wet", color: "border-emerald-500/60 text-emerald-300 bg-emerald-500/10" },
                ].map(tc => (
                  <button
                    key={tc.id}
                    onClick={() => {
                      playHMIClickSound();
                      setSelectedTireCompound(tc.id as any);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      selectedTireCompound === tc.id ? tc.color : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: 4-Corner Pyrometry & Live Radio (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 4-Corner Tire Pyrometry HUD */}
          <div className="glass-panel p-5 rounded-2xl border-white/10 bg-slate-900/70 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Disc className="w-4 h-4 text-amber-400" />
                <span>4-CORNER LIVE TIRE PYROMETRY & THERMALS</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                Optimum Window: 95°C – 105°C
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Front Left */}
              <div className={`p-3 rounded-xl border ${getTireTempColor(tires.fl.tempC)} transition-all`}>
                <div className="flex justify-between text-[11px] font-mono font-bold">
                  <span>FRONT LEFT (FL)</span>
                  <span>{tires.fl.tempC}°C</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>Press: {tires.fl.pressureBar} bar</span>
                  <span>Wear: {tires.fl.wearPct}%</span>
                </div>
              </div>

              {/* Front Right */}
              <div className={`p-3 rounded-xl border ${getTireTempColor(tires.fr.tempC)} transition-all`}>
                <div className="flex justify-between text-[11px] font-mono font-bold">
                  <span>FRONT RIGHT (FR)</span>
                  <span>{tires.fr.tempC}°C</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>Press: {tires.fr.pressureBar} bar</span>
                  <span>Wear: {tires.fr.wearPct}%</span>
                </div>
              </div>

              {/* Rear Left */}
              <div className={`p-3 rounded-xl border ${getTireTempColor(tires.rl.tempC)} transition-all`}>
                <div className="flex justify-between text-[11px] font-mono font-bold">
                  <span>REAR LEFT (RL)</span>
                  <span>{tires.rl.tempC}°C</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>Press: {tires.rl.pressureBar} bar</span>
                  <span>Wear: {tires.rl.wearPct}%</span>
                </div>
              </div>

              {/* Rear Right */}
              <div className={`p-3 rounded-xl border ${getTireTempColor(tires.rr.tempC)} transition-all`}>
                <div className="flex justify-between text-[11px] font-mono font-bold">
                  <span>REAR RIGHT (RR)</span>
                  <span>{tires.rr.tempC}°C</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>Press: {tires.rr.pressureBar} bar</span>
                  <span>Wear: {tires.rr.wearPct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Driver Radio Feed */}
          <div className="glass-panel p-5 rounded-2xl border-white/10 bg-slate-900/70 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>LIVE DRIVER RADIO TELEMETRY FEED</span>
            </h3>

            <div className="space-y-2">
              {radioMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs ${
                    m.type === "URGENT"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                      : m.type === "WARNING"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      : "bg-slate-950/70 border-white/5 text-slate-300"
                  }`}
                >
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="font-bold text-amber-400">{m.sender}</span>
                    <span className="text-slate-400">LAP {m.lap}</span>
                  </div>
                  <div className="font-mono text-[11px] leading-relaxed">{m.msg}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LivePitWallPanel = memo(LivePitWallPanelComponent);
