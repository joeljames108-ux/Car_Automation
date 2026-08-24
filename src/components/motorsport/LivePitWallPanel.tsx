// ===================================================================
// LIVE PIT WALL & RACE TELEMETRY COMMAND CENTER
// ===================================================================
// Vision Glass pit wall dashboard with real-time driver radio telemetry,
// tire pyrometry, pit stop strategy execution, and 3D track viewport.
// ===================================================================

import React, { useState } from "react";
import { TrackRacing3DViewport } from "../racing/TrackRacing3DViewport";
import { Radio, Flame, ShieldAlert, Zap, Trophy, Play, Pause, RefreshCw } from "lucide-react";

export const LivePitWallPanel: React.FC = () => {
  const [activeStrategy, setActiveStrategy] = useState<"UNDERCUT_PUSH" | "OVERCUT_EXTEND" | "CONSERVE_TIRES">("UNDERCUT_PUSH");
  const [selectedTireCompound, setSelectedTireCompound] = useState<"SOFT_SLICK" | "MEDIUM_SLICK" | "HARD_SLICK" | "WET_INTERMEDIATE">("SOFT_SLICK");
  const [pitWindowLap, setPitWindowLap] = useState<number>(12);

  const radioMessages = [
    { lap: 8, sender: "RACE ENGINEER", msg: "Box this lap for soft slicks. Undercut window is open!", type: "URGENT" },
    { lap: 7, sender: "DRIVER 1", msg: "Front-left tire surface temp reaching 108°C. Degradation increasing.", type: "WARNING" },
    { lap: 5, sender: "RACE ENGINEER", msg: "Gap to leader P1 is +2.4s. Push hard in Sector 2!", type: "INFO" },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Interactive 3D Track Viewport */}
      <TrackRacing3DViewport />

      {/* Pit Wall Controls & Strategy Matrix */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-2xl">
        {/* Strategy Selector */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>PIT STOP STRATEGY MODE</span>
          </h3>
          <div className="space-y-2">
            {[
              { id: "UNDERCUT_PUSH", label: "Undercut Push (Box Early)", desc: "Pits 2 laps early on soft slicks to gain track position." },
              { id: "OVERCUT_EXTEND", label: "Overcut Extend (Clean Air)", desc: "Extends stint in clean air for fresh rubber advantage." },
              { id: "CONSERVE_TIRES", label: "Tire Saver (1-Stop)", desc: "Manages tire thermals to eliminate extra pit stop." },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setActiveStrategy(st.id as any)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  activeStrategy === st.id
                    ? "bg-amber-500/20 border-amber-500/50 text-white shadow-lg shadow-amber-500/10"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="text-xs font-bold">{st.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{st.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Next Stint Tire Compound */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center space-x-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>NEXT STINT TIRE COMPOUND</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "SOFT_SLICK", label: "Soft Slick (C5)", color: "border-red-500/50 text-red-400" },
              { id: "MEDIUM_SLICK", label: "Medium (C3)", color: "border-yellow-500/50 text-yellow-400" },
              { id: "HARD_SLICK", label: "Hard Slick (C1)", color: "border-slate-400 text-slate-200" },
              { id: "WET_INTERMEDIATE", label: "Inter Wet", color: "border-emerald-500/50 text-emerald-400" },
            ].map((tc) => (
              <button
                key={tc.id}
                onClick={() => setSelectedTireCompound(tc.id as any)}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  selectedTireCompound === tc.id ? `bg-slate-900 shadow-lg ${tc.color}` : "bg-slate-950 border-slate-800 text-slate-500"
                }`}
              >
                {tc.label}
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="text-slate-400">Target Pit Window: <strong className="text-amber-400">Lap {pitWindowLap}</strong></div>
            <div className="text-[10px] text-slate-500 mt-1">Expected Pit Stop Stationary Time: 2.35s</div>
          </div>
        </div>

        {/* Live Driver Radio Feed */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>LIVE DRIVER RADIO FEED</span>
          </h3>
          <div className="space-y-2">
            {radioMessages.map((m, idx) => (
              <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span className="font-bold text-cyan-400">{m.sender}</span>
                  <span>LAP {m.lap}</span>
                </div>
                <div className="text-slate-200 mt-1 text-[11px] font-mono">{m.msg}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
