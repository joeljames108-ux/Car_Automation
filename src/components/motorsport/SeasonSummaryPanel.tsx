// ===================================================================
// SEASON SUMMARY PANEL — Official Championship Results Showcase
// ===================================================================
import { memo } from "react";
import { Trophy, Award, Medal, Flag, Zap, TrendingUp } from "lucide-react";
import { useCompany } from "../../state/CompanyContext";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "./TeamCard";

export const SeasonSummaryPanel = memo(function SeasonSummaryPanel() {
  const { company } = useCompany();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="glass-panel p-5 border-yellow-500/25 relative overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-yellow-400 font-bold uppercase tracking-widest">OFFICIAL SEASON RECAP</span>
              <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full">
                COMPLETED
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-100 flex items-center gap-2 mt-1">
              <Trophy size={20} className="text-yellow-400" /> Motorsport Season {Math.max(1, company.motorsport.currentSeason - 1)} Summary
            </h3>
          </div>
        </div>

        {company.motorsport.teams.length === 0 ? (
          <div className="text-center py-8 bg-base-950/60 rounded-xl border border-white/5">
            <Trophy size={32} className="mx-auto text-slate-700 mb-2" />
            <p className="text-xs text-slate-500">No completed seasons on record yet.</p>
            <p className="text-[10px] text-slate-600 mt-1">Create teams and simulate seasons to build your motorsport legacy.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {company.motorsport.teams.map(t => {
              const lastRes = t.seasonResults[t.seasonResults.length - 1];
              if (!lastRes) return null;
              const isChamp = lastRes.position === 1;

              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-xl border space-y-3 transition-all ${
                    isChamp
                      ? "bg-gradient-to-r from-yellow-500/15 via-amber-500/5 to-yellow-500/15 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.15)]"
                      : "bg-base-950/70 border-white/5 hover:border-cyan-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-100">{t.name}</h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[t.category]}`}>
                        {CATEGORY_LABELS[t.category]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono font-bold text-sm">
                      {isChamp && (
                        <span className="text-yellow-400 font-bold text-xs bg-yellow-500/20 px-2.5 py-0.5 rounded-full border border-yellow-500/40 flex items-center gap-1">
                          👑 WORLD CHAMPION
                        </span>
                      )}
                      <span className={isChamp ? "text-yellow-400 text-base font-black" : "text-slate-300"}>P{lastRes.position}</span>
                    </div>
                  </div>

                  {/* Performance Summary Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                    <div className="bg-base-900/60 p-2.5 rounded-lg border border-base-800">
                      <div className="text-sm font-mono font-bold text-slate-100">{lastRes.points} PTS</div>
                      <div className="text-[9px] text-slate-500 uppercase">Season Points</div>
                    </div>
                    <div className="bg-base-900/60 p-2.5 rounded-lg border border-base-800">
                      <div className="text-sm font-mono font-bold text-emerald-400">{lastRes.wins} Wins</div>
                      <div className="text-[9px] text-slate-500 uppercase">Victories</div>
                    </div>
                    <div className="bg-base-900/60 p-2.5 rounded-lg border border-base-800">
                      <div className="text-sm font-mono font-bold text-cyan-300">{lastRes.podiums} Podiums</div>
                      <div className="text-[9px] text-slate-500 uppercase">Podiums</div>
                    </div>
                    <div className="bg-base-900/60 p-2.5 rounded-lg border border-base-800">
                      <div className="text-sm font-mono font-bold text-purple-400">{lastRes.fastestLaps} FL</div>
                      <div className="text-[9px] text-slate-500 uppercase">Fastest Laps</div>
                    </div>
                    <div className="bg-base-900/60 p-2.5 rounded-lg border border-base-800">
                      <div className="text-sm font-mono font-bold text-blue-400">{lastRes.polePositions} Poles</div>
                      <div className="text-[9px] text-slate-500 uppercase">Poles</div>
                    </div>
                    <div className="bg-base-900/60 p-2.5 rounded-lg border border-base-800">
                      <div className="text-sm font-mono font-bold text-emerald-400">+{lastRes.techPointsEarned} R&D</div>
                      <div className="text-[9px] text-slate-500 uppercase">Tech Points</div>
                    </div>
                  </div>

                  {/* Financial & Morale Outcome */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono bg-base-900/40 p-2.5 rounded-lg border border-base-800/80 text-slate-400 gap-2">
                    <span>Balance: <strong className="text-emerald-400">${(t.budget / 1e6).toFixed(1)}M</strong></span>
                    <span>Morale: <strong className="text-cyan-300">{t.teamMorale}%</strong></span>
                    <span>Roster: <strong className="text-slate-200">{t.drivers.length}/2 Drivers Active</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

