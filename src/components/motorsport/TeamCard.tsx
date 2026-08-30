// ===================================================================
// TEAM CARD — Individual team display with glassmorphism + animations
// ===================================================================
import React, { memo } from "react";
import { Trophy } from "lucide-react";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import type { MotorsportTeam, MotorsportCategory, FacilityLevel } from "../../sim/types";

const CATEGORY_LABELS: Record<MotorsportCategory, string> = {
  gt: "GT Series", formula: "Formula", hypercar: "Hypercar WEC",
  touring: "Touring Car", rally: "Rally", endurance: "Endurance",
};

const CATEGORY_COLORS: Record<MotorsportCategory, string> = {
  gt: "text-accent-300 bg-accent-500/15 border-accent-500/30",
  formula: "text-ok-400 bg-ok-500/15 border-ok-500/30",
  hypercar: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  touring: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  rally: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  endurance: "text-orange-400 bg-orange-500/15 border-orange-500/30",
};

const CATEGORY_GRADIENTS: Record<MotorsportCategory, string> = {
  gt: "from-amber-500/10 to-transparent",
  formula: "from-emerald-500/10 to-transparent",
  hypercar: "from-amber-500/10 to-transparent",
  touring: "from-amber-500/10 to-transparent",
  rally: "from-amber-500/10 to-transparent",
  endurance: "from-orange-500/10 to-transparent",
};

const STATUS_COLORS: Record<string, string> = {
  inactive: "text-slate-500", developing: "text-warn-400",
  competing: "text-ok-400", champion: "text-yellow-400",
};

const FACILITY_COLORS: Record<FacilityLevel, string> = {
  basic: "text-slate-500", standard: "text-amber-400",
  advanced: "text-amber-400", elite: "text-yellow-400",
};

const MoraleBar = memo(function MoraleBar({ value }: { value: number }) {
  const color = value > 75 ? "bg-ok-400" : value > 45 ? "bg-warn-400" : "bg-danger-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-base-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-mono text-slate-400 w-8 text-right">{value}%</span>
    </div>
  );
});

const SkillRadar = memo(function SkillRadar({ driver }: { driver: { skill: number; consistency: number; wetSkill: number; aggression: number; experience: number } }) {
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
      <polygon points={points} fill="rgba(34,211,238,0.15)" stroke="#fbbf24" strokeWidth="1" />
    </svg>
  );
});

export { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_GRADIENTS, STATUS_COLORS, FACILITY_COLORS };

function TeamCardComponent({ team, onSelect, isSelected }: {
  team: MotorsportTeam; onSelect: () => void; isSelected: boolean;
}) {
  const lastSeason = team.seasonResults[team.seasonResults.length - 1];
  const sponsorRevenue = team.sponsors.reduce((s, sp) => s + sp.revenue, 0);

  return (
    <div
      onClick={() => {
        playHMIClickSound();
        onSelect();
      }}
      className={`p-4 rounded-2xl bg-slate-900/90 border cursor-pointer card-hover relative overflow-hidden text-white transition-all shadow-lg ${
        isSelected
          ? "border-amber-400 shadow-[0_0_25px_rgba(34,211,238,0.25)] bg-slate-900"
          : "border-white/10 hover:border-white/25 hover:bg-slate-850"
      }`}
    >
      {/* Category gradient accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[team.category]} pointer-events-none opacity-40`} />

      {/* Livery stripe */}
      <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl shadow-sm" style={{ backgroundColor: team.liveryColor }} />

      <div className="relative">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="ml-2">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[team.category]}`}>
                {CATEGORY_LABELS[team.category]}
              </span>
              <span className={`text-[10px] font-bold capitalize ${FACILITY_COLORS[team.facilityLevel]}`}>
                ★ {team.facilityLevel}
              </span>
            </div>
            <h3 className="font-extrabold text-white text-sm tracking-wide">{team.name}</h3>
            <div className={`text-[10px] font-bold capitalize mt-0.5 ${STATUS_COLORS[team.status]}`}>
              ● {team.status}
            </div>
          </div>
          {team.championships > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-yellow-500/20 border border-yellow-400/40 shadow-sm">
              <Trophy size={14} className="text-yellow-400" />
              <span className="text-sm font-black text-yellow-300 font-mono">{team.championships}</span>
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-3 text-center ml-2">
          {[
            { label: "Wins", value: team.wins, color: "text-emerald-400" },
            { label: "Podiums", value: team.podiums, color: "text-amber-300" },
            { label: "FL", value: team.fastestLaps, color: "text-amber-400" },
            { label: "Dev", value: team.developmentPoints, color: "text-slate-200" },
          ].map(s => (
            <div key={s.label} className="bg-black/60 rounded-xl p-2 border border-white/5">
              <div className={`text-sm font-black font-mono ${s.color}`}>{s.value}</div>
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Morale */}
        <div className="mb-2 ml-2">
          <div className="text-[10px] text-slate-300 font-bold mb-1">Team Morale</div>
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

export const TeamCard = memo(TeamCardComponent);

