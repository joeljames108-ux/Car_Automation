// ===================================================================
// TEAM CARD — Individual team display with glassmorphism + animations
// ===================================================================
import { Trophy, Star, Users } from "lucide-react";
import type { MotorsportTeam, MotorsportCategory, FacilityLevel } from "../../sim/types";

const CATEGORY_LABELS: Record<MotorsportCategory, string> = {
  gt: "GT Series", formula: "Formula", hypercar: "Hypercar WEC",
  touring: "Touring Car", rally: "Rally", endurance: "Endurance",
};

const CATEGORY_COLORS: Record<MotorsportCategory, string> = {
  gt: "text-accent-300 bg-accent-500/15 border-accent-500/30",
  formula: "text-ok-400 bg-ok-500/15 border-ok-500/30",
  hypercar: "text-purple-400 bg-purple-500/15 border-purple-500/30",
  touring: "text-blue-400 bg-blue-500/15 border-blue-500/30",
  rally: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  endurance: "text-orange-400 bg-orange-500/15 border-orange-500/30",
};

const CATEGORY_GRADIENTS: Record<MotorsportCategory, string> = {
  gt: "from-cyan-500/10 to-transparent",
  formula: "from-emerald-500/10 to-transparent",
  hypercar: "from-purple-500/10 to-transparent",
  touring: "from-blue-500/10 to-transparent",
  rally: "from-amber-500/10 to-transparent",
  endurance: "from-orange-500/10 to-transparent",
};

const STATUS_COLORS: Record<string, string> = {
  inactive: "text-slate-500", developing: "text-warn-400",
  competing: "text-ok-400", champion: "text-yellow-400",
};

const FACILITY_COLORS: Record<FacilityLevel, string> = {
  basic: "text-slate-500", standard: "text-blue-400",
  advanced: "text-purple-400", elite: "text-yellow-400",
};

function MoraleBar({ value }: { value: number }) {
  const color = value > 75 ? "bg-ok-400" : value > 45 ? "bg-warn-400" : "bg-danger-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-base-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{value}%</span>
    </div>
  );
}

function SkillRadar({ driver }: { driver: { skill: number; consistency: number; wetSkill: number; aggression: number; experience: number } }) {
  const stats = [driver.skill, driver.consistency, driver.wetSkill, driver.aggression, driver.experience];
  const cx = 24, cy = 24, r = 18;
  const points = stats.map((v, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const dist = (v / 100) * r;
    return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
  }).join(" ");
  const bgPoints = [0, 1, 2, 3, 4].map(i => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0">
      <polygon points={bgPoints} fill="none" stroke="#1e293b" strokeWidth="0.5" />
      <polygon points={points} fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="1" />
    </svg>
  );
}

export { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_GRADIENTS, STATUS_COLORS, FACILITY_COLORS };

export function TeamCard({ team, onSelect, isSelected }: {
  team: MotorsportTeam; onSelect: () => void; isSelected: boolean;
}) {
  const lastSeason = team.seasonResults[team.seasonResults.length - 1];
  const sponsorRevenue = team.sponsors.reduce((s, sp) => s + sp.revenue, 0);

  return (
    <div
      onClick={onSelect}
      className={`glass-panel p-4 cursor-pointer card-hover relative overflow-hidden ${isSelected ? "border-accent-500/50 shadow-[0_0_20px_-4px_rgba(34,211,238,0.15)]" : ""}`}
    >
      {/* Category gradient accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[team.category]} pointer-events-none opacity-50`} />

      {/* Livery stripe */}
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl" style={{ backgroundColor: team.liveryColor }} />

      <div className="relative">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="ml-2">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[team.category]}`}>
                {CATEGORY_LABELS[team.category]}
              </span>
              <span className={`text-[10px] font-medium capitalize ${FACILITY_COLORS[team.facilityLevel]}`}>
                ★ {team.facilityLevel}
              </span>
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">{team.name}</h3>
            <div className={`text-[10px] font-medium capitalize mt-0.5 ${STATUS_COLORS[team.status]}`}>
              ● {team.status}
            </div>
          </div>
          {team.championships > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-sm font-bold podium-gold">{team.championships}</span>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-1.5 mb-3 text-center ml-2">
          {[
            { label: "Wins", value: team.wins, color: "text-ok-400" },
            { label: "Podiums", value: team.podiums, color: "text-accent-300" },
            { label: "FL", value: team.fastestLaps, color: "text-purple-400" },
            { label: "Dev", value: team.developmentPoints, color: "text-slate-300" },
          ].map(s => (
            <div key={s.label} className="bg-base-850/50 rounded-lg p-1.5">
              <div className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[9px] text-slate-600">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Morale */}
        <div className="mb-2 ml-2">
          <div className="text-[10px] text-slate-500 mb-1">Team Morale</div>
          <MoraleBar value={team.teamMorale} />
        </div>

        {/* Drivers */}
        {team.drivers.length > 0 && (
          <div className="space-y-1.5 ml-2">
            {team.drivers.map(d => {
              const latestDev = team.driverDevLogs.filter(l => l.driverId === d.id).slice(-1)[0];
              return (
                <div key={d.id} className="flex items-center gap-2 bg-base-850/50 rounded-lg px-2 py-1.5">
                  <SkillRadar driver={d} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-200 font-medium truncate">{d.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{d.nationality}</span>
                      <span className="text-accent-300 font-mono">{d.skill}/100</span>
                      {latestDev && latestDev.skillAfter > latestDev.skillBefore && (
                        <span className="text-ok-400">▲{latestDev.skillAfter - latestDev.skillBefore}</span>
                      )}
                    </div>
                  </div>
                  {d.contractEndSeason > 0 && (
                    <span className="text-[9px] text-slate-600 font-mono">S{d.contractEndSeason}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Sponsors */}
        {team.sponsors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 ml-2">
            {team.sponsors.map(s => (
              <span key={s.id} className="text-sm" title={`${s.name} (${s.tier}) — $${(s.revenue / 1e6).toFixed(1)}M/season`}>
                {s.logoEmoji}
              </span>
            ))}
            <span className="text-[10px] text-ok-400 font-mono ml-auto">+${(sponsorRevenue / 1e6).toFixed(1)}M</span>
          </div>
        )}

        {/* Last season summary */}
        {lastSeason && (
          <div className="mt-2 ml-2 text-[10px] text-slate-600 border-t border-base-800/50 pt-2">
            Last season: <span className={lastSeason.position === 1 ? "podium-gold font-semibold" : lastSeason.position <= 3 ? "text-accent-300" : ""}>P{lastSeason.position}</span> · {lastSeason.points}pts · {lastSeason.wins}W {lastSeason.podiums}P {lastSeason.fastestLaps}FL {lastSeason.dnfs}DNF
          </div>
        )}
      </div>
    </div>
  );
}
