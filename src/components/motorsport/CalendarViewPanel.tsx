// ===================================================================
// CALENDAR VIEW PANEL — Official Championship Calendar & Circuits
// ===================================================================
import { useState, memo } from "react";
import { Calendar, Flag, CheckCircle, Navigation, MapPin } from "lucide-react";
import { getSeasonCalendar } from "../../sim/motorsportEngine";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "./TeamCard";
import { TRACKS } from "../../sim/constants";
import type { MotorsportCategory } from "../../sim/types";

export const CalendarViewPanel = memo(function CalendarViewPanel() {
  const [selectedCategory, setSelectedCategory] = useState<MotorsportCategory>("gt");
  const calendar = getSeasonCalendar(selectedCategory);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-panel p-5 border-cyan-500/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">GLOBAL TOUR</span>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">
                {calendar.rounds} ROUNDS
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-1">
              <Calendar size={20} className="text-cyan-400" /> Season Championship Calendar
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Official grand prix schedule, circuit characteristics, pace types & elevation profiles.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400">Category:</span>
            <div className="flex gap-1 flex-wrap">
              {(Object.keys(CATEGORY_LABELS) as MotorsportCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    playHMIClickSound();
                    setSelectedCategory(cat);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    selectedCategory === cat ? CATEGORY_COLORS[cat] : "bg-base-850 border-base-800 text-slate-400 hover:border-base-700"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Circuit Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {calendar.tracks.map((trackId, idx) => {
            const track = TRACKS[trackId];
            if (!track) return null;
            const roundNum = idx + 1;

            return (
              <div
                key={trackId}
                className="bg-base-950/80 rounded-xl p-4 border border-white/5 hover:border-cyan-400/40 transition-all card-hover flex flex-col justify-between relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 font-mono font-black text-4xl text-slate-400 pointer-events-none group-hover:opacity-20 transition-opacity">
                  R{roundNum}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                      ROUND {roundNum}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <MapPin size={12} className="text-cyan-400" /> {track.country}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 mb-1">{track.name}</h4>
                  <p className="text-[11px] text-slate-400 mb-3">{track.length} km · {track.highSpeed ? "High Speed Circuit" : "Technical Circuit"}</p>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono bg-base-900/80 rounded-lg p-2 mb-3 border border-base-800">
                    <div>
                      <div className="text-slate-500 font-sans text-[9px]">Length</div>
                      <div className="text-slate-200 font-bold">{track.length} km</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-sans text-[9px]">Pace Type</div>
                      <div className="text-slate-200 font-bold">{track.highSpeed ? "Speed" : "Tech"}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-sans text-[9px]">Elevation</div>
                      <div className="text-slate-200 font-bold">{track.altitudeChange || 15}m</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  <span className="text-slate-500 font-mono text-[10px]">EVENT SCRUTINY:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle size={12} /> CONFIRMED
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

