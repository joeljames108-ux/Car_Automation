// ===================================================================
// HISTORY TIMELINE — Vertical timeline layout for season history
// ===================================================================
import { useState } from "react";
import { Clock, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "./TeamCard";
import type { MotorsportTeam } from "../../sim/types";

export function HistoryTimeline({ selectedTeam }: { selectedTeam: MotorsportTeam | null }) {
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

  if (!selectedTeam || selectedTeam.seasonResults.length === 0) {
    return (
      <div className="glass-panel p-10 text-center">
        <Clock size={36} className="mx-auto text-slate-700 mb-3" />
        <p className="text-slate-500 text-sm">
          {!selectedTeam ? "Select a team to view history." : "No season history yet. Simulate a season first."}
        </p>
      </div>
    );
  }

  const results = [...selectedTeam.seasonResults].reverse();

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-accent-500/30 via-purple-500/20 to-transparent" />

      <div className="space-y-4 pl-12">
        {results.map(season => {
          const isChamp = season.position === 1;
          const isExpanded = expandedSeason === season.season;

          return (
            <div key={season.season} className="relative animate-fade-in-up" style={{ animationDelay: `${(results.length - results.indexOf(season)) * 50}ms` }}>
              {/* Timeline dot */}
              <div className={`absolute -left-12 top-3 w-4 h-4 rounded-full border-2 ${
                isChamp ? "bg-yellow-500 border-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.4)]" :
                season.position <= 3 ? "bg-accent-500 border-accent-400" :
                "bg-base-800 border-base-700"
              }`} />

              <div className={`glass-panel p-4 cursor-pointer card-hover ${isChamp ? "border-yellow-500/30 shadow-[0_0_20px_-6px_rgba(234,179,8,0.15)]" : ""}`}
                onClick={() => setExpandedSeason(isExpanded ? null : season.season)}>

                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      {isChamp && <Trophy size={16} className="text-yellow-400" />}
                      <span className="text-sm font-bold text-slate-100">Season {season.season}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[season.category]}`}>
                      {CATEGORY_LABELS[season.category]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold font-mono ${
                      season.position === 1 ? "podium-gold" :
                      season.position === 2 ? "podium-silver" :
                      season.position === 3 ? "podium-bronze" :
                      "text-slate-300"
                    }`}>P{season.position}</span>
                    {isExpanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                  </div>
                </div>

                {/* Summary stats */}
                <div className="flex gap-4 mt-2 text-[10px]">
                  <span className="text-slate-400">{season.points}<span className="text-slate-600 ml-0.5">pts</span></span>
                  <span className="text-ok-400">{season.wins}<span className="text-slate-600 ml-0.5">W</span></span>
                  <span className="text-accent-300">{season.podiums}<span className="text-slate-600 ml-0.5">P</span></span>
                  <span className="text-purple-400">{season.fastestLaps}<span className="text-slate-600 ml-0.5">FL</span></span>
                  {season.dnfs > 0 && <span className="text-danger-400">{season.dnfs}<span className="text-slate-600 ml-0.5">DNF</span></span>}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-base-800/50 animate-fade-in-up">
                    {/* Race-by-race results */}
                    <div className="mb-4">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-semibold">Race Results</div>
                      <div className="flex flex-wrap gap-1">
                        {season.raceResults.map(r => (
                          <div key={r.round} className={`text-[10px] px-2.5 py-1.5 rounded-lg font-mono ${
                            r.position === 1 ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25" :
                            r.position <= 3 ? "bg-accent-500/10 text-accent-300 border border-accent-500/20" :
                            r.position === 0 ? "bg-danger-500/10 text-danger-400 border border-danger-500/20" :
                            "bg-base-850/50 text-slate-500 border border-base-800"
                          }`}>
                            R{r.round}: {r.position === 0 ? "DNF" : `P${r.position}`}
                            {r.fastestLap && " ⚡"}
                            {r.polePosition && " 🏁"}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Championship Standings */}
                    {season.standings.length > 0 && (
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-semibold">Final Standings</div>
                        <div className="space-y-1">
                          {season.standings.slice(0, 6).map(s => (
                            <div key={s.teamId} className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded ${
                              s.isPlayer ? "bg-accent-500/10 text-accent-300" : "text-slate-400"
                            }`}>
                              <span className={`w-5 font-mono font-bold ${
                                s.position === 1 ? "text-yellow-400" : s.position === 2 ? "text-slate-300" : s.position === 3 ? "text-amber-600" : "text-slate-600"
                              }`}>{s.position}</span>
                              <span className="flex-1">{s.teamName}</span>
                              <span className="font-mono text-slate-300">{s.points}pts</span>
                              <span className="text-[10px] text-slate-600">{s.wins}W</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extra stats */}
                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      <div className="bg-base-850/50 rounded-lg p-2">
                        <div className="text-xs font-mono font-bold text-slate-300">{season.techPointsEarned}</div>
                        <div className="text-[9px] text-slate-600">Tech Earned</div>
                      </div>
                      <div className="bg-base-850/50 rounded-lg p-2">
                        <div className="text-xs font-mono font-bold text-slate-300">{season.polePositions}</div>
                        <div className="text-[9px] text-slate-600">Pole Pos</div>
                      </div>
                      <div className="bg-base-850/50 rounded-lg p-2">
                        <div className={`text-xs font-mono font-bold ${season.penaltyPoints > 0 ? "text-warn-400" : "text-slate-300"}`}>{season.penaltyPoints}</div>
                        <div className="text-[9px] text-slate-600">Penalties</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
