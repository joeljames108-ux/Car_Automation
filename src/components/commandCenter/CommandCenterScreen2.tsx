// ============================================================================
// COMMAND CENTER — CONTENT STATE 02 (RELIABILITY, REVIEWS, AI & CHASSIS)
// ============================================================================
// Second cinematic content state featuring the exact 2x2 multi-card layout:
// 1. Chassis & Structural Rigidity
// 2. Reliability & Safety Architecture
// 3. Customer Satisfaction & Reviews
// 4. Apex AI Recommendations & Next Steps
// ============================================================================

import React from "react";
import {
  Layers,
  CircleDot,
  ShieldCheck,
  Star,
  Bot,
  Check,
  AlertTriangle,
  Cog,
  Car,
  Sofa,
  Gauge,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Section, StatTile } from "../ui/Controls";
import { CHASSIS_TYPES } from "../../sim/constants";
import type { SimResult, VehicleDesign } from "../../sim/types";

export interface Recommendation {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  category: string;
  title: string;
  detail: string;
  metric: string;
  target: string;
}

export interface CommandCenterScreen2Props {
  design: VehicleDesign;
  sim: SimResult;
  scores: any;
  summary: any;
  recommendations: Recommendation[];
  onSelectStage?: (stage: string) => void;
}

function SystemBar({
  label,
  value,
  good,
  invert,
  icon,
}: {
  label: string;
  value: number;
  good: number;
  invert?: boolean;
  icon?: React.ReactNode;
}) {
  const isGood = invert ? value <= good : value >= good;
  const isWarn = invert ? value > good * 1.3 : value < good * 0.7;
  const color = isGood ? "bg-emerald-500" : isWarn ? "bg-rose-500" : "bg-amber-500";
  const pct = Math.max(0, Math.min(100, value * 100));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
          {icon}
          {label}
        </span>
        <span className="font-mono text-xs text-slate-200">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-base-800 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%`, boxShadow: `0 0 8px currentColor` }}
        />
      </div>
    </div>
  );
}

function ScoreTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-base-900/80 border border-white/5 rounded-xl p-3 text-center">
      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mb-0.5">{label}</div>
      <div className="text-xl font-bold font-mono text-cyan-300">{value.toFixed(1)}</div>
    </div>
  );
}

function RecommendationRow({ rec }: { rec: Recommendation }) {
  const priorityColors = {
    critical: "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]",
    high: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    medium: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    low: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  };

  return (
    <div className="p-3 rounded-xl bg-base-950/70 border border-white/5 hover:border-cyan-500/30 transition-all flex items-start gap-3">
      <span
        className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider border ${priorityColors[rec.priority]}`}
      >
        {rec.priority}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-xs font-bold text-slate-200">{rec.title}</span>
          <span className="text-[10px] font-mono text-slate-400">
            {rec.metric} → <span className="text-emerald-400">{rec.target}</span>
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">{rec.detail}</p>
      </div>
    </div>
  );
}

export const CommandCenterScreen2: React.FC<CommandCenterScreen2Props> = ({
  design,
  sim,
  scores,
  summary,
  recommendations,
  onSelectStage,
}) => {
  const chassis = CHASSIS_TYPES[design.vehicle.chassis];

  return (
    <div className="space-y-4">
      {/* ── 2x2 CINEMATIC SECONDARY ANALYTICS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1 (Top-Left): Chassis & Structural Rigidity */}
        <div className="cinematic-stagger-1">
          <Section title="CHASSIS & STRUCTURAL RIGIDITY" icon={<Layers size={16} />}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-3">
              <StatTile label="Chassis Type" value={chassis?.label || design.vehicle.chassis} />
              <StatTile label="Center of Gravity" value={sim.cgHeight} unit="mm" />
              <StatTile label="Aero Load Mass" value={sim.aeroWeight} unit="kg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-base-900/80 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mb-2">
                  Torsional Rigidity
                </div>
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#1e293b" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke={chassis?.rigidityFactor > 0.85 ? "#10b981" : "#f59e0b"}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="94.2"
                      strokeDashoffset={94.2 * (1 - (chassis?.rigidityFactor || 0.8))}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-sm font-bold text-slate-100">
                      {((chassis?.rigidityFactor || 0.8) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-base-900/80 border border-white/5 rounded-xl p-3 flex flex-col justify-center">
                <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mb-2">
                  Weight Balance F/R
                </div>
                <div className="flex h-6 rounded-lg overflow-hidden border border-white/10">
                  <div
                    className="flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all duration-500"
                    style={{
                      width: `${sim.weightDistFront * 100}%`,
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    }}
                  >
                    {(sim.weightDistFront * 100).toFixed(0)}%
                  </div>
                  <div
                    className="flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all duration-500"
                    style={{
                      width: `${(1 - sim.weightDistFront) * 100}%`,
                      background: "linear-gradient(135deg, #22d3ee, #0891b2)",
                    }}
                  >
                    {(100 - sim.weightDistFront * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-slate-500 font-mono">
                  <span>Front</span>
                  <span>Rear</span>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Card 2 (Top-Right): Reliability & Safety Architecture */}
        <div className="cinematic-stagger-2">
          <Section title="RELIABILITY & SAFETY ARCHITECTURE" icon={<ShieldCheck size={16} />}>
            <div className="space-y-3">
              <SystemBar label="Powertrain Reliability" value={sim.reliability} good={0.8} icon={<ShieldCheck size={12} />} />
              <SystemBar label="Chassis Drivability" value={sim.drivability} good={0.7} icon={<Gauge size={12} />} />
              <SystemBar
                label="Crash Impact Safety"
                value={sim.testing.crashTest.overall / 100}
                good={0.8}
                icon={<ShieldCheck size={12} />}
              />
              <div className="grid grid-cols-3 gap-2 pt-1">
                <StatTile
                  label="Frontal Score"
                  value={`${sim.testing.crashTest.frontalScore.toFixed(0)}`}
                  unit="/100"
                  accent={sim.testing.crashTest.frontalScore > 80 ? "ok" : "warn"}
                />
                <StatTile
                  label="Side Score"
                  value={`${sim.testing.crashTest.sideScore.toFixed(0)}`}
                  unit="/100"
                  accent={sim.testing.crashTest.sideScore > 80 ? "ok" : "warn"}
                />
                <StatTile label="EuroNCAP" value={sim.testing.crashTest.starRating} unit="★" accent="ok" />
              </div>
            </div>
          </Section>
        </div>

        {/* Card 3 (Bottom-Left): Customer Satisfaction & Reviews */}
        <div className="cinematic-stagger-3">
          <Section title="CUSTOMER SATISFACTION & REVIEWS" icon={<Star size={16} />}>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-base-900/80 border border-white/5">
                <div className="text-3xl font-bold text-cyan-300 font-mono">
                  {summary?.overall?.toFixed(1) || "8.8"}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-400 font-mono">Overall Market Rating</div>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={
                          s <= Math.round((summary?.overall || 8.8) / 2)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-700"
                        }
                      />
                    ))}
                  </div>
                </div>
                {summary?.editorsChoice && (
                  <span className="text-[10px] font-bold font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 rounded-lg">
                    EDITOR'S CHOICE
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <ScoreTile label="Performance" value={summary?.performance || 9.2} />
                <ScoreTile label="Comfort" value={summary?.comfort || 8.4} />
                <ScoreTile label="Technology" value={summary?.technology || 9.0} />
                <ScoreTile label="Value" value={summary?.value || 8.6} />
              </div>
            </div>
          </Section>
        </div>

        {/* Card 4 (Bottom-Right): Apex AI Recommendations */}
        <div className="cinematic-stagger-4">
          <Section title="APEX AI RECOMMENDATIONS & NEXT STEPS" icon={<Bot size={16} />}>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {recommendations.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-emerald-400 py-3 font-mono">
                  <Check size={16} /> All vehicle subsystems nominal — optimal balance achieved.
                </div>
              ) : (
                recommendations.map((r) => <RecommendationRow key={r.id} rec={r} />)
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommandCenterScreen2);
