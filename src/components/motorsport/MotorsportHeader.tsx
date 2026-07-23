// ===================================================================
// MOTORSPORT HEADER — Animated header with key stats
// ===================================================================
import { Trophy, Flag, Zap, Timer } from "lucide-react";
import { useCompany } from "../../state/CompanyContext";

export function MotorsportHeader() {
  const { company } = useCompany();
  const teams = company.motorsport.teams;
  const totalWins = teams.reduce((s, t) => s + t.wins, 0);
  const totalTitles = teams.reduce((s, t) => s + t.championships, 0);
  const totalFL = teams.reduce((s, t) => s + t.fastestLaps, 0);
  const totalPodiums = teams.reduce((s, t) => s + t.podiums, 0);

  return (
    <div className="glass-panel p-6 relative overflow-hidden checkered-bg">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: "radial-gradient(ellipse at top right, rgba(251,191,36,0.3), transparent 50%), radial-gradient(ellipse at bottom left, rgba(34,211,238,0.15), transparent 50%)" }} />

      <div className="relative flex flex-col md:flex-row md:items-center gap-4">
        {/* Icon + Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/25 to-amber-600/20 border border-yellow-500/30 animate-pulse-glow">
            <Trophy size={28} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text">Motorsport Division</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Season {company.motorsport.currentSeason} · {teams.length} {teams.length === 1 ? "team" : "teams"} active
            </p>
          </div>
        </div>

        <div className="flex-1" />

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Teams", value: teams.length, icon: <Flag size={14} />, color: "text-accent-300" },
            { label: "Wins", value: totalWins, icon: <Trophy size={14} />, color: "text-ok-400" },
            { label: "Titles", value: totalTitles, icon: <Zap size={14} />, color: "text-yellow-400" },
            { label: "Podiums", value: totalPodiums, icon: <Timer size={14} />, color: "text-purple-400" },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center animate-count-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`flex items-center justify-center gap-1 mb-1 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] text-slate-600 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
