// ===================================================================
// ANALYTICS PANEL — Charts, driver comparison, team overview
// ===================================================================
import { useMemo, memo } from "react";
import { TrendingUp, Users, BarChart3 } from "lucide-react";
import { useCompany } from "../../state/CompanyContext";
import { LineChart } from "../ui/LineChart";
import { DonutChart } from "../ui/Charts";
import { FACILITY_COLORS } from "./TeamCard";
import type { MotorsportTeam } from "../../sim/types";

const RadarChart = memo(function RadarChart({ stats, size = 120 }: { stats: { label: string; value: number; color: string }[]; size?: number }) {
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
    const labelDist = r + 12;
    return { x: cx + labelDist * Math.cos(angle), y: cy + labelDist * Math.sin(angle) };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {/* Background web */}
      <polygon points={bgPoints.map(p => `${p.x},${p.y}`).join(" ")}
        fill="none" stroke="#1e293b" strokeWidth="0.5" />
      {[0.25, 0.5, 0.75].map(scale => (
        <polygon key={scale}
          points={stats.map((_, i) => {
            const a = (Math.PI * 2 * i) / n - Math.PI / 2;
            return `${cx + r * scale * Math.cos(a)},${cy + r * scale * Math.sin(a)}`;
          }).join(" ")}
          fill="none" stroke="#0f172a" strokeWidth="0.5" />
      ))}
      {/* Axis lines */}
      {bgPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1e293b" strokeWidth="0.5" />
      ))}
      {/* Data polygon */}
      <polygon points={points.map(p => `${p.x},${p.y}`).join(" ")}
        fill="rgba(34,211,238,0.12)" stroke="#fbbf24" strokeWidth="1.5" />
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
});

export const AnalyticsPanel = memo(function AnalyticsPanel({ selectedTeam }: { selectedTeam: MotorsportTeam | null }) {
  const { company } = useCompany();

  const pointsSeries = useMemo(() => {
    if (!selectedTeam || selectedTeam.seasonResults.length === 0) return [];
    return [{
      data: selectedTeam.seasonResults.map(r => ({ x: r.season, y: r.points })),
      color: "#fbbf24",
      fill: true,
    }];
  }, [selectedTeam]);

  const posSeries = useMemo(() => {
    if (!selectedTeam || selectedTeam.seasonResults.length === 0) return [];
    return [{
      data: selectedTeam.seasonResults.map(r => ({ x: r.season, y: r.position })),
      color: "#f59e0b",
      fill: false,
    }];
  }, [selectedTeam]);

  if (company.motorsport.teams.length === 0) {
    return (
      <div className="glass-panel p-10 text-center">
        <BarChart3 size={36} className="mx-auto text-amber-500 mb-3" />
        <p className="text-amber-300/50 text-sm">No data yet. Create teams and simulate seasons.</p>
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="glass-panel p-10 text-center">
        <BarChart3 size={36} className="mx-auto text-amber-500 mb-3" />
        <p className="text-amber-300/50 text-sm">Select a team to view analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Points Progression */}
      {pointsSeries.length > 0 && (
        <div className="glass-panel p-4">
          <h3 className="text-xs font-semibold text-amber-100/80 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-accent-400" /> Points Progression
          </h3>
          <LineChart series={pointsSeries} height={160} xLabel="Season" yLabel="Points" />
        </div>
      )}

      {/* Position History */}
      {posSeries.length > 0 && selectedTeam.seasonResults.length > 1 && (
        <div className="glass-panel p-4">
          <h3 className="text-xs font-semibold text-amber-100/80 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BarChart3 size={12} className="text-amber-400" /> Championship Position
          </h3>
          <LineChart series={posSeries} height={120} xLabel="Season" yLabel="Position" yMin={1} />
        </div>
      )}

      {/* Driver Comparison */}
      {selectedTeam.drivers.length > 0 && (
        <div className="glass-panel p-4">
          <h3 className="text-xs font-semibold text-amber-100/80 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Users size={12} className="text-accent-400" /> Driver Comparison
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedTeam.drivers.map(d => {
              const devLogs = selectedTeam.driverDevLogs.filter(l => l.driverId === d.id);
              const latestDev = devLogs[devLogs.length - 1];
              const radarStats = [
                { label: "SKL", value: d.skill, color: "#fbbf24" },
                { label: "CON", value: d.consistency, color: "#22c55e" },
                { label: "WET", value: d.wetSkill, color: "#d97706" },
                { label: "AGG", value: d.aggression, color: "#eab308" },
                { label: "EXP", value: d.experience, color: "#f59e0b" },
              ];
              return (
                <div key={d.id} className="bg-base-850/50 rounded-xl p-4 border border-base-800/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-amber-50">{d.name}</div>
                      <div className="text-[10px] text-amber-300/50">{d.nationality} · ${(d.salary / 1e6).toFixed(1)}M</div>
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
                    <div className="mt-2 pt-2 border-t border-base-800 text-[10px] text-amber-300/50 text-center italic">
                      "{latestDev.seasonHighlight}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Overview & Budget Breakdown */}
      <div className="glass-panel p-4 space-y-4">
        <h3 className="text-xs font-semibold text-amber-100/80 uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 size={12} className="text-amber-400" /> Team Financial & Operational Overview
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: "Budget", value: `$${(selectedTeam.budget / 1e6).toFixed(0)}M`, color: "text-accent-300" },
            { label: "Facility", value: selectedTeam.facilityLevel, color: FACILITY_COLORS[selectedTeam.facilityLevel], capitalize: true },
            { label: "Tech Pool", value: String(selectedTeam.techTransferPool), color: "text-amber-400" },
            { label: "Penalty Pts", value: String(selectedTeam.penaltyPoints), color: selectedTeam.penaltyPoints > 5 ? "text-danger-400" : "text-amber-100/80" },
            { label: "Sponsors", value: String(selectedTeam.sponsors.length), color: "text-ok-400" },
          ].map(s => (
            <div key={s.label} className="bg-base-850/50 rounded-lg p-3 text-center border border-base-800/50">
              <div className="text-[10px] text-amber-300/50 mb-1">{s.label}</div>
              <div className={`font-mono text-sm font-bold ${s.color} ${'capitalize' in s ? 'capitalize' : ''}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Sponsor & Financial Allocation Donut Chart */}
        <div className="bg-base-850/40 p-4 rounded-xl border border-base-800">
          <div className="text-xs font-bold text-amber-50 mb-3">Sponsor Revenue & Financial Allocation Breakdown</div>
          <DonutChart
            segments={[
              { label: "Base Budget", value: Math.round(selectedTeam.budget / 1e6), color: "#fbbf24" },
              ...selectedTeam.sponsors.map((sp, idx) => ({
                label: `${sp.name} (${sp.tier})`,
                value: Math.round(sp.revenue / 1e6),
                color: idx === 0 ? "#fbbf24" : idx === 1 ? "#f59e0b" : "#22c55e"
              }))
            ]}
            totalLabel="FINANCES ($M)"
          />
        </div>
      </div>
    </div>
  );
});

