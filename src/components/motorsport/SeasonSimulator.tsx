// ===================================================================
// SEASON SIMULATOR — Simulate championship with animated results
// ===================================================================
import { useState, memo } from "react";
import { Play, Zap, Gauge, TrendingUp, Shield, AlertTriangle, Trophy, Medal } from "lucide-react";
import { useCompany } from "../../state/CompanyContext";
import { useDesign } from "../../state/DesignContext";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "./TeamCard";

function SeasonSimulatorComponent() {
  const { company, simulateMotorsportSeason } = useCompany();
  const { sim } = useDesign();
  const [showResultsModal, setShowResultsModal] = useState(false);

  function handleSimulate() {
    playHMIClickSound();
    simulateMotorsportSeason(sim.peakPower, sim.weight, sim.downforce / 100, sim.reliability);
    setShowResultsModal(true);
  }

  return (
    <div className="space-y-4">
      {/* Pre-race stats */}
      <div className="glass-panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ background: "radial-gradient(ellipse at center, rgba(34,211,238,0.2), transparent 70%)" }} />

        <div className="relative">
          <h3 className="text-sm font-semibold text-amber-50 mb-1">Simulate Championship Season {company.motorsport.currentSeason}</h3>
          <p className="text-xs text-amber-300/50 mb-4">Your vehicle's current performance will determine race outcomes.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Power", value: Math.round(sim.peakPower), unit: "hp", icon: <Zap size={14} />, color: "text-accent-400" },
              { label: "Weight", value: Math.round(sim.weight), unit: "kg", icon: <Gauge size={14} />, color: "text-amber-200/60" },
              { label: "Downforce", value: sim.downforce.toFixed(0), unit: "kg", icon: <TrendingUp size={14} />, color: "text-amber-400" },
              { label: "Reliability", value: `${Math.round(sim.reliability * 100)}`, unit: "%", icon: <Shield size={14} />, color: "text-ok-400" },
            ].map(s => (
              <div key={s.label} className="glass-panel p-3 text-center">
                <div className={`flex items-center justify-center mb-1 ${s.color}`}>{s.icon}</div>
                <div className="font-mono text-lg font-bold text-amber-50">{s.value}<span className="text-xs text-amber-300/50 ml-0.5">{s.unit}</span></div>
                <div className="text-[9px] text-amber-400 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {company.motorsport.teams.filter(t => t.status === "competing").length === 0 ? (
            <div className="text-center py-6">
              <AlertTriangle size={24} className="mx-auto text-warn-400 mb-2" />
              <p className="text-sm text-amber-300/50">No teams ready to compete.</p>
              <p className="text-xs text-amber-400 mt-1">Hire at least 1 driver for a team to start racing.</p>
            </div>
          ) : (
            <button onClick={handleSimulate}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-accent-500/20 to-amber-500/20 border border-accent-500/40 text-accent-300 hover:from-accent-500/30 hover:to-amber-500/30 transition-all text-sm font-semibold group">
              <Play size={16} className="group-hover:scale-110 transition-transform" />
              Simulate Season {company.motorsport.currentSeason}
            </button>
          )}
        </div>
      </div>

      {/* Season results */}
      {company.motorsport.teams.map(t => {
        const last = t.seasonResults[t.seasonResults.length - 1];
        if (!last) return null;
        return (
          <div key={t.id} className="glass-panel p-5 relative overflow-hidden animate-fade-in-up">
            {/* Livery accent */}
            <div className="absolute top-0 left-0 w-full h-1 rounded-t-xl" style={{ backgroundColor: t.liveryColor }} />

            <div className="flex items-center justify-between mb-4 mt-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-amber-50">{t.name}</h3>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[t.category]}`}>
                  {CATEGORY_LABELS[t.category]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {last.position === 1 && <Trophy size={16} className="text-yellow-400" />}
                <span className={`text-lg font-bold font-mono ${last.position === 1 ? "podium-gold" : last.position === 2 ? "podium-silver" : last.position === 3 ? "podium-bronze" : "text-amber-100/80"
                  }`}>P{last.position}</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-6 gap-2 mb-4 text-center">
              {[
                { label: "Points", value: last.points, color: "text-amber-50" },
                { label: "Wins", value: last.wins, color: "text-ok-400" },
                { label: "Podiums", value: last.podiums, color: "text-accent-300" },
                { label: "FL", value: last.fastestLaps, color: "text-amber-400" },
                { label: "Poles", value: last.polePositions, color: "text-amber-400" },
                { label: "DNFs", value: last.dnfs, color: "text-danger-400" },
              ].map(s => (
                <div key={s.label} className="bg-base-850/50 rounded-lg p-2">
                  <div className={`font-mono text-sm font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-amber-400 text-[9px]">{s.label}</div>
                </div>
              ))}
            </div>

            {last.penaltyPoints > 0 && (
              <div className="text-[10px] text-warn-400 mb-3 flex items-center gap-1">
                <AlertTriangle size={10} /> {last.penaltyPoints} penalty points accumulated
              </div>
            )}

            {/* Race results strip with Sector Splits */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {last.raceResults.map(r => (
                <div key={r.round} className={`text-[10px] px-2.5 py-1.5 rounded-lg font-mono transition-all flex flex-col gap-0.5 ${r.position === 1 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                    r.position <= 3 ? "bg-accent-500/15 text-accent-300 border border-accent-500/25" :
                      r.position === 0 ? "bg-danger-500/15 text-danger-400 border border-danger-500/25" :
                        "bg-base-850/50 text-amber-200/60 border border-base-800"
                  }`}>
                  <div className="flex items-center justify-between gap-1 font-bold">
                    <span>R{r.round}: {r.position === 0 ? "DNF" : `P${r.position}`}</span>
                    <span>{r.fastestLap && "⚡"}{r.polePosition && "🏁"}</span>
                  </div>
                  {r.sector1Sec && (
                    <div className="text-[8px] text-amber-300/50 font-mono">
                      S1: {r.sector1Sec}s · S2: {r.sector2Sec}s · S3: {r.sector3Sec}s
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Official World Championship Declaration Banner */}
            {last.position === 1 ? (
              <div className="mb-4 bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-yellow-500/20 border-2 border-yellow-500/40 rounded-xl p-4 text-center shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-pulse">
                <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-widest mb-1">
                  <Trophy size={18} className="text-yellow-400 fill-yellow-400" />
                  OFFICIAL WORLD CHAMPIONSHIP DECLARATION
                  <Trophy size={18} className="text-yellow-400 fill-yellow-400" />
                </div>
                <h2 className="text-lg font-black text-amber-50 tracking-tight">
                  🏆 {t.name} IS DECLARED {CATEGORY_LABELS[t.category].toUpperCase()} WORLD CHAMPIONS!
                </h2>
                <p className="text-xs text-yellow-300/80 mt-1">
                  Secured P1 in Constructors & Drivers Championship with <strong className="font-mono text-yellow-300">{last.points} Championship Points</strong> & <strong className="font-mono text-yellow-300">{last.wins} Grand Prix Victories</strong>.
                </p>
              </div>
            ) : last.position <= 3 ? (
              <div className="mb-4 bg-accent-500/10 border border-accent-500/30 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-accent-300 font-bold text-xs uppercase tracking-wider">
                  <Medal size={16} className="text-accent-400" />
                  WORLD CHAMPIONSHIP PODIUM FINISH — P{last.position}
                </div>
                <p className="text-xs text-amber-100/80 mt-0.5">
                  Finished on the World Championship Podium with <strong className="font-mono text-accent-300">{last.points} PTS</strong> ({last.wins} Wins, {last.podiums} Podiums).
                </p>
              </div>
            ) : null}

            {/* Official Points System Guide Badge */}
            <div className="bg-base-900/60 p-2.5 rounded-lg border border-base-800 mb-4 flex items-center justify-between text-[10px] font-mono text-amber-200/60">
              <span className="font-bold text-amber-100/80">FIA WORLD CHAMPIONSHIP POINTS SYSTEM:</span>
              <span className="text-yellow-400 font-bold">1st: 25pts</span>
              <span className="text-amber-100/80 font-bold">2nd: 18pts</span>
              <span className="text-amber-600 font-bold">3rd: 15pts</span>
              <span>4th: 12pts</span>
              <span>5th: 10pts</span>
              <span>6th: 8pts</span>
              <span>7th: 6pts</span>
              <span>8th: 4pts</span>
              <span>9th: 2pts</span>
              <span>10th: 1pt</span>
              <span className="text-amber-400 font-bold">+1 Fast Lap</span>
            </div>

            {/* Championship Standings */}
            {last.standings.length > 0 && (
              <div className="border-t border-base-800/50 pt-3">
                <div className="text-[10px] text-amber-300/50 uppercase tracking-wider mb-2 font-semibold">Official World Constructors & Drivers Standings</div>
                <div className="space-y-1">
                  {last.standings.slice(0, 8).map(s => (
                    <div key={s.teamId} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all border ${s.position === 1
                        ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-300 font-bold shadow-[0_0_12px_rgba(234,179,8,0.1)]"
                        : s.isPlayer
                          ? "bg-accent-500/10 border-accent-500/30 text-accent-300 font-semibold"
                          : "bg-base-850/40 border-base-800/60 text-amber-200/60"
                      }`}>
                      <span className={`w-6 font-mono font-bold ${s.position === 1 ? "text-yellow-400" : s.position === 2 ? "text-amber-50" : s.position === 3 ? "text-amber-500" : "text-amber-300/50"
                        }`}>
                        {s.position === 1 ? "👑 P1" : `P${s.position}`}
                      </span>
                      <span className={`flex-1 ${s.isPlayer ? "text-accent-300 font-bold" : "text-amber-100/80"}`}>
                        {s.teamName} {s.isPlayer && "(YOUR TEAM)"}
                      </span>
                      <span className="font-mono text-amber-50 font-bold w-16 text-right">{s.points} PTS</span>
                      <span className="text-[10px] text-ok-400 font-mono w-10 text-right font-bold">{s.wins} W</span>
                      <span className="text-[10px] text-accent-400 font-mono w-10 text-right">{s.podiums} Pod</span>
                      {s.gapToLeader > 0 ? (
                        <span className="text-[10px] text-amber-300/50 font-mono w-14 text-right">-{s.gapToLeader} pts</span>
                      ) : (
                        <span className="text-[10px] text-yellow-400 font-mono font-bold w-14 text-right">CHAMPION</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ===================== END OF SEASON MODAL OVERLAY ===================== */}
      {showResultsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-amber-900/50 border-2 border-yellow-500/40 rounded-2xl max-w-3xl w-full p-6 shadow-[0_0_60px_rgba(234,179,8,0.25)] flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="text-center border-b border-white/10 pb-4">
              <div className="flex items-center justify-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-widest mb-1">
                <Trophy size={20} className="text-yellow-400 fill-yellow-400 animate-bounce" />
                END OF SEASON CEREMONY RECAP
                <Trophy size={20} className="text-yellow-400 fill-yellow-400 animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-amber-50 tracking-tight">
                Motorsport Season {company.motorsport.currentSeason - 1} Completed
              </h2>
              <p className="text-xs text-amber-200/60 mt-1">
                Official World Constructors Championship results & technical awards declared.
              </p>
            </div>

            {/* Showcase Cards for Player Teams */}
            <div className="space-y-3">
              {company.motorsport.teams.map(t => {
                const res = t.seasonResults[t.seasonResults.length - 1];
                if (!res) return null;
                const isChamp = res.position === 1;

                return (
                  <div key={t.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    isChamp ? "bg-yellow-500/15 border-yellow-500/50 text-yellow-200" : "bg-base-850 border-base-800"
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-amber-50">{t.name}</h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[t.category]}`}>
                          {CATEGORY_LABELS[t.category]}
                        </span>
                      </div>
                      <div className="text-xs text-amber-200/60 mt-1 flex items-center gap-3 font-mono">
                        <span>Rank: <strong className={isChamp ? "text-yellow-400 text-sm font-black" : "text-amber-50"}>P{res.position}</strong></span>
                        <span>Points: <strong className="text-amber-50">{res.points} PTS</strong></span>
                        <span>Wins: <strong className="text-ok-400">{res.wins}</strong></span>
                        <span>Podiums: <strong className="text-accent-300">{res.podiums}</strong></span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono text-amber-300 font-bold">+{res.techPointsEarned} R&D Tech Points</div>
                      <div className="text-[10px] text-amber-300/50 font-mono mt-0.5">Budget Balance: ${(t.budget / 1e6).toFixed(1)}M</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                playHMIClickSound();
                setShowResultsModal(false);
              }}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-yellow-500/30 via-amber-500/20 to-yellow-500/30 border border-yellow-500/50 text-yellow-300 hover:from-yellow-500/40 hover:to-yellow-500/40 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)] cursor-pointer"
            >
              Continue to Season {company.motorsport.currentSeason} ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const SeasonSimulator = memo(SeasonSimulatorComponent);

