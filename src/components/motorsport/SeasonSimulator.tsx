// ===================================================================
// SEASON SIMULATOR — Simulate championship with animated results
// ===================================================================
import { useState } from "react";
import { Play, Zap, Gauge, TrendingUp, Shield, AlertTriangle, Trophy, Medal } from "lucide-react";
import { useCompany } from "../../state/CompanyContext";
import { useDesign } from "../../state/DesignContext";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "./TeamCard";

export function SeasonSimulator() {
  const { company, simulateMotorsportSeason } = useCompany();
  const { sim } = useDesign();
  const [showResults, setShowResults] = useState(false);

  function handleSimulate() {
    simulateMotorsportSeason(sim.peakPower, sim.weight, sim.downforce / 100, sim.reliability);
    setShowResults(true);
  }

  return (
    <div className="space-y-4">
      {/* Pre-race stats */}
      <div className="glass-panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ background: "radial-gradient(ellipse at center, rgba(34,211,238,0.2), transparent 70%)" }} />

        <div className="relative">
          <h3 className="text-sm font-semibold text-slate-100 mb-1">Simulate Championship Season {company.motorsport.currentSeason}</h3>
          <p className="text-xs text-slate-500 mb-4">Your vehicle's current performance will determine race outcomes.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Power", value: Math.round(sim.peakPower), unit: "hp", icon: <Zap size={14} />, color: "text-accent-400" },
              { label: "Weight", value: Math.round(sim.weight), unit: "kg", icon: <Gauge size={14} />, color: "text-slate-400" },
              { label: "Downforce", value: sim.downforce.toFixed(0), unit: "kg", icon: <TrendingUp size={14} />, color: "text-blue-400" },
              { label: "Reliability", value: `${Math.round(sim.reliability * 100)}`, unit: "%", icon: <Shield size={14} />, color: "text-ok-400" },
            ].map(s => (
              <div key={s.label} className="glass-panel p-3 text-center">
                <div className={`flex items-center justify-center mb-1 ${s.color}`}>{s.icon}</div>
                <div className="font-mono text-lg font-bold text-slate-200">{s.value}<span className="text-xs text-slate-500 ml-0.5">{s.unit}</span></div>
                <div className="text-[9px] text-slate-600 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          {company.motorsport.teams.filter(t => t.status === "competing").length === 0 ? (
            <div className="text-center py-6">
              <AlertTriangle size={24} className="mx-auto text-warn-400 mb-2" />
              <p className="text-sm text-slate-500">No teams ready to compete.</p>
              <p className="text-xs text-slate-600 mt-1">Hire at least 1 driver for a team to start racing.</p>
            </div>
          ) : (
            <button onClick={handleSimulate}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-accent-500/20 to-blue-500/20 border border-accent-500/40 text-accent-300 hover:from-accent-500/30 hover:to-blue-500/30 transition-all text-sm font-semibold group">
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
                <h3 className="text-sm font-semibold text-slate-100">{t.name}</h3>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[t.category]}`}>
                  {CATEGORY_LABELS[t.category]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {last.position === 1 && <Trophy size={16} className="text-yellow-400" />}
                <span className={`text-lg font-bold font-mono ${
                  last.position === 1 ? "podium-gold" : last.position === 2 ? "podium-silver" : last.position === 3 ? "podium-bronze" : "text-slate-300"
                }`}>P{last.position}</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-6 gap-2 mb-4 text-center">
              {[
                { label: "Points", value: last.points, color: "text-slate-200" },
                { label: "Wins", value: last.wins, color: "text-ok-400" },
                { label: "Podiums", value: last.podiums, color: "text-accent-300" },
                { label: "FL", value: last.fastestLaps, color: "text-purple-400" },
                { label: "Poles", value: last.polePositions, color: "text-blue-400" },
                { label: "DNFs", value: last.dnfs, color: "text-danger-400" },
              ].map(s => (
                <div key={s.label} className="bg-base-850/50 rounded-lg p-2">
                  <div className={`font-mono text-sm font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-slate-600 text-[9px]">{s.label}</div>
                </div>
              ))}
            </div>

            {last.penaltyPoints > 0 && (
              <div className="text-[10px] text-warn-400 mb-3 flex items-center gap-1">
                <AlertTriangle size={10} /> {last.penaltyPoints} penalty points accumulated
              </div>
            )}

            {/* Race results strip */}
            <div className="flex flex-wrap gap-1 mb-4">
              {last.raceResults.map(r => (
                <div key={r.round} className={`text-[10px] px-2.5 py-1.5 rounded-lg font-mono transition-all ${
                  r.position === 1 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                  r.position <= 3 ? "bg-accent-500/15 text-accent-300 border border-accent-500/25" :
                  r.position === 0 ? "bg-danger-500/15 text-danger-400 border border-danger-500/25" :
                  "bg-base-850/50 text-slate-500 border border-base-800"
                }`}>
                  R{r.round}: {r.position === 0 ? "DNF" : `P${r.position}`}
                  {r.fastestLap && " ⚡"}
                  {r.polePosition && " 🏁"}
                </div>
              ))}
            </div>

            {/* Championship Standings */}
            {last.standings.length > 0 && (
              <div className="border-t border-base-800/50 pt-3">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-semibold">Championship Standings</div>
                <div className="space-y-1">
                  {last.standings.slice(0, 8).map(s => (
                    <div key={s.teamId} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all ${
                      s.isPlayer ? "bg-accent-500/10 border border-accent-500/20" : "hover:bg-base-850/30"
                    }`}>
                      <span className={`w-6 font-mono font-bold ${
                        s.position === 1 ? "text-yellow-400" : s.position === 2 ? "text-slate-300" : s.position === 3 ? "text-amber-600" : "text-slate-500"
                      }`}>{s.position}.</span>
                      <span className={`flex-1 ${s.isPlayer ? "text-accent-300 font-semibold" : "text-slate-400"}`}>{s.teamName}</span>
                      <span className="font-mono text-slate-300 w-14 text-right">{s.points}pts</span>
                      <span className="text-[10px] text-slate-600 w-8 text-right">{s.wins}W</span>
                      {s.gapToLeader > 0 && <span className="text-[10px] text-slate-600 w-10 text-right">-{s.gapToLeader}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
