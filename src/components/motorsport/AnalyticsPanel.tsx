// ===================================================================
// ANALYTICS PANEL — Charts, driver comparison, team overview
// ===================================================================
import { useMemo } from "react";
import { TrendingUp, Users, BarChart3 } from "lucide-react";
import { useCompany } from "../../state/CompanyContext";
import { LineChart } from "../ui/LineChart";
import { FACILITY_COLORS } from "./TeamCard";
import type { MotorsportTeam } from "../../sim/types";

function RadarChart({ stats, size = 120 }: { stats: { label: string; value: number; color: string }[]; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 20;
  const n = stats.length;
  const points = stats.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = (s.value / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  });
  const bgPoints = stats.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const labelPoints = stats.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + (r + 14) * Math.cos(angle), y: cy + (r + 14) * Math.sin(angle) };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(scale => (
        <polygon key={scale}
          points={bgPoints.map(p => `${cx + (p.x - cx) * scale},${cy + (p.y - cy) * scale}`).join(" ")}
          fill="none" stroke="#1e293b" strokeWidth="0.5" />
      ))}
      {/* Axes */}
      {bgPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1e293b" strokeWidth="0.5" />
      ))}
      {/* Data polygon */}
      <polygon points={points.map(p => `${p.x},${p.y}`).join(" ")}
        fill="rgba(34,211,238,0.12)" stroke="#22d3ee" strokeWidth="1.5" />
      {/* Data dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={stats[i].color} />
      ))}
      {/* Labels */}
      {labelPoints.map((p, i) => (
        <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
          fill="#94a3b8" fontSize="8" fontFamily="monospace">
          {stats[i].label}
        </text>
      ))}
    </svg>
  );
}

export function AnalyticsPanel({ selectedTeam }: { selectedTeam: MotorsportTeam | null }) {
  const { company } = useCompany();

  const pointsSeries = useMemo(() => {
    if (!selectedTeam || selectedTeam.seasonResults.length === 0) return [];
    return [{
      data: selectedTeam.seasonResults.map(r => ({ x: r.season, y: r.points })),
      color: "#22d3ee",
      fill: true,
    }];
  }, [selectedTeam]);

  const posSeries = useMemo(() => {
    if (!selectedTeam || selectedTeam.seasonResults.length === 0) return [];
    return [{
      data: selectedTeam.seasonResults.map(r => ({ x: r.season, y: r.position })),
      color: "#a855f7",
      fill: false,
    }];
  }, [selectedTeam]);

  if (company.motorsport.teams.length === 0) {
    return (
      <div className="glass-panel p-10 text-center">
        <BarChart3 size={36} className="mx-auto text-slate-700 mb-3" />
        <p className="text-slate-500 text-sm">No data yet. Create teams and simulate seasons.</p>
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="glass-panel p-10 text-center">
        <BarChart3 size={36} className="mx-auto text-slate-700 mb-3" />
        <p className="text-slate-500 text-sm">Select a team to view analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Points Progression */}
      {pointsSeries.length > 0 && (
        <div className="glass-panel p-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-accent-400" /> Points Progression
          </h3>
          <LineChart series={pointsSeries} height={160} xLabel="Season" yLabel="Points" />
        </div>
      )}

      {/* Position History */}
      {posSeries.length > 0 && selectedTeam.seasonResults.length > 1 && (
        <div className="glass-panel p-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BarChart3 size={12} className="text-purple-400" /> Championship Position
          </h3>
          <LineChart series={posSeries} height={120} xLabel="Season" yLabel="Position" yMin={1} />
        </div>
      )}

      {/* Driver Comparison */}
      {selectedTeam.drivers.length > 0 && (
        <div className="glass-panel p-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Users size={12} className="text-accent-400" /> Driver Comparison
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedTeam.drivers.map(d => {
              const devLogs = selectedTeam.driverDevLogs.filter(l => l.driverId === d.id);
              const latestDev = devLogs[devLogs.length - 1];
              const radarStats = [
                { label: "SKL", value: d.skill, color: "#22d3ee" },
                { label: "CON", value: d.consistency, color: "#22c55e" },
                { label: "WET", value: d.wetSkill, color: "#3b82f6" },
                { label: "AGG", value: d.aggression, color: "#eab308" },
                { label: "EXP", value: d.experience, color: "#a855f7" },
              ];
              return (
                <div key={d.id} className="bg-base-850/50 rounded-xl p-4 border border-base-800/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-200">{d.name}</div>
                      <div className="text-[10px] text-slate-500">{d.nationality} · ${(d.salary / 1e6).toFixed(1)}M</div>
                    </div>
                    {latestDev && (
                      <div className="text-right">
                        <div className={`text-xs font-medium ${latestDev.formRating > 70 ? "text-ok-400" : latestDev.formRating > 40 ? "text-warn-400" : "text-danger-400"}`}>
                          Form: {Math.round(latestDev.formRating)}
                        </div>
                        <div className={`text-[10px] ${latestDev.morale > 70 ? "text-ok-400" : "text-warn-400"}`}>
                          Morale: {Math.round(latestDev.morale)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <RadarChart stats={radarStats} size={140} />
                  </div>
                  {latestDev && (
                    <div className="mt-2 pt-2 border-t border-base-800 text-[10px] text-slate-500 text-center italic">
                      "{latestDev.seasonHighlight}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Overview */}
      <div className="glass-panel p-4">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <BarChart3 size={12} className="text-blue-400" /> Team Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: "Budget", value: `$${(selectedTeam.budget / 1e6).toFixed(0)}M`, color: "text-accent-300" },
            { label: "Facility", value: selectedTeam.facilityLevel, color: FACILITY_COLORS[selectedTeam.facilityLevel], capitalize: true },
            { label: "Tech Pool", value: String(selectedTeam.techTransferPool), color: "text-purple-400" },
            { label: "Penalty Pts", value: String(selectedTeam.penaltyPoints), color: selectedTeam.penaltyPoints > 5 ? "text-danger-400" : "text-slate-300" },
            { label: "Sponsors", value: String(selectedTeam.sponsors.length), color: "text-ok-400" },
          ].map(s => (
            <div key={s.label} className="bg-base-850/50 rounded-lg p-3 text-center border border-base-800/50">
              <div className="text-[10px] text-slate-500 mb-1">{s.label}</div>
              <div className={`font-mono text-sm font-bold ${s.color} ${'capitalize' in s ? 'capitalize' : ''}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
