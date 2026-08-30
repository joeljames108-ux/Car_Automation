// ============================================================================
// COMMAND CENTER — CONTENT STATE 02 (RELIABILITY, REVIEWS, AI & CHASSIS)
// ============================================================================
// Second cinematic content state featuring the exact 2x2 multi-card layout:
// 1. Reliability & Safety Architecture (Stagger 0ms)
// 2. Customer Satisfaction & Reviews (Stagger 40ms)
// 3. Apex AI Recommendations & Next Steps (Stagger 80ms)
// 4. Engineering Log & Chassis Structural Integrity (Stagger 120ms)
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
  TrendingUp,
  Award,
  Sparkles,
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

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
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
  const color = isGood ? "bg-emerald-400" : isWarn ? "bg-rose-500" : "bg-amber-400";
  const glow = isGood ? "rgba(52, 211, 153, 0.4)" : isWarn ? "rgba(244, 63, 94, 0.4)" : "rgba(251, 191, 36, 0.4)";
  const pct = Math.max(0, Math.min(100, value * 100));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
          {icon}
          {label}
        </span>
        <span className="font-mono text-xs text-slate-200 font-bold">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-base-850/90 rounded-full overflow-hidden border border-white/5 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%`, boxShadow: `0 0 10px ${glow}` }}
        />
      </div>
    </div>
  );
}

function ScoreTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-base-900/80 border border-white/5 rounded-xl p-3 text-center shadow-sm">
      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mb-0.5">{label}</div>
      <div className="text-xl font-bold font-mono text-amber-300">{value.toFixed(1)}</div>
    </div>
  );
}

function RecommendationRow({
  rec,
  onSelectStage,
}: {
  rec: Recommendation;
  onSelectStage?: (stage: string) => void;
}) {
  const priorityColors = {
    critical: "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.25)]",
    high: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    medium: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    low: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  };

  const getStageForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case "engine":
        return "engine";
      case "aero":
        return "aero";
      case "chassis":
        return "vehicle";
      case "safety":
        return "safety";
      default:
        return "command";
    }
  };

  return (
    <div className="p-3 rounded-xl bg-base-950/70 border border-white/5 hover:border-amber-500/30 transition-all flex items-start justify-between gap-3 group">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span
          className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider border shrink-0 mt-0.5 ${priorityColors[rec.priority]}`}
        >
          {rec.priority}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-xs font-bold text-slate-200 truncate">{rec.title}</span>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">
              {rec.metric} → <span className="text-emerald-400 font-bold">{rec.target}</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{rec.detail}</p>
        </div>
      </div>
      {onSelectStage && (
        <button
          onClick={() => onSelectStage(getStageForCategory(rec.category))}
          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-400/20 text-xs transition-all opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
          title={`Tune in ${rec.category} studio`}
        >
          <ArrowRight size={13} />
        </button>
      )}
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
    <div className="w-full space-y-4">
      {/* ── 2x2 CINEMATIC SECONDARY ANALYTICS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1 (Top-Left): Reliability & Safety Architecture (Stagger Offset 1) */}
        <div className="cinematic-stagger-1">
          <Section title="RELIABILITY & SAFETY ARCHITECTURE" icon={<ShieldCheck size={16} className="text-emerald-400" />}>
            <div className="space-y-3">
              <SystemBar
                label="Piston Speed Stress Margin"
                value={1 - clamp(sim.maxPistonSpeed / 28, 0, 1)}
                good={0.6}
                icon={<Cog size={12} className="text-amber-400" />}
              />
              <SystemBar
                label="Thermal Safety Margin"
                value={sim.coolingMargin}
                good={0.5}
                icon={<Activity size={12} className="text-amber-400" />}
              />
              <SystemBar
                label="Structural Crash Safety"
                value={sim.safetyRating}
                good={0.7}
                icon={<ShieldCheck size={12} className="text-emerald-400" />}
              />
              <SystemBar
                label="Powertrain Reliability"
                value={sim.reliability}
                good={0.7}
                icon={<CircleDot size={12} className="text-amber-400" />}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3 border-t border-white/10 pt-3">
              <StatTile label="SAFETY RATING" value={`${(sim.safetyRating * 100).toFixed(0)}%`} accent="ok" />
              <StatTile label="EST. RELIABILITY" value={`${(sim.reliability * 100).toFixed(0)}%`} accent="accent" />
              <StatTile label="CRASH RATING" value="5 STARS" accent="ok" />
            </div>
          </Section>
        </div>

        {/* Card 2 (Top-Right): Customer Satisfaction & Press Reviews (Stagger Offset 2) */}
        <div className="cinematic-stagger-2">
          <Section title="CUSTOMER SATISFACTION & REVIEWS" icon={<Star size={16} className="text-amber-400" />}>
            <div className="grid grid-cols-3 gap-2.5 mb-3">
              <ScoreTile label="Track Agility" value={scores?.trackAgility ?? 8.8} />
              <ScoreTile label="Daily Usability" value={scores?.dailyDrivability ?? 7.9} />
              <ScoreTile label="Comfort & Tech" value={scores?.luxuryScore ?? 8.4} />
            </div>
            <div className="p-3 rounded-xl bg-base-950/80 border border-white/5 text-xs text-slate-300">
              <div className="flex items-center gap-2 mb-1 text-[11px] font-bold text-amber-300 font-mono">
                <Award size={13} />
                <span>OVERALL PRESS VERDICT</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {summary?.verdict || "Remarkable powertrain precision and exceptional aerodynamic balance deliver outstanding track pacing with refined road manners."}
              </p>
            </div>
          </Section>
        </div>

        {/* Card 3 (Bottom-Left): Apex AI Recommendations & Action Items (Stagger Offset 3) */}
        <div className="cinematic-stagger-3">
          <Section title="AI RECOMMENDATIONS / NEXT STEPS" icon={<Bot size={16} className="text-amber-400" />}>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 4).map((rec) => (
                  <RecommendationRow key={rec.id} rec={rec} onSelectStage={onSelectStage} />
                ))
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <Check size={16} />
                  <span>ALL SYSTEMS OPTIMAL — NO CRITICAL ENGINEERING ACTIONS DETECTED</span>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Card 4 (Bottom-Right): Engineering Log & Chassis Rigidity (Stagger Offset 4) */}
        <div className="cinematic-stagger-4">
          <Section title="ENGINEERING LOG & CHASSIS INTEGRITY" icon={<Layers size={16} className="text-amber-400" />}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
              <StatTile label="TORSIONAL" value={chassis?.rigidityFactor ? Math.round(chassis.rigidityFactor * 74) : 74} unit="kNm/°" accent="accent" />
              <StatTile label="CHASSIS FACTOR" value={chassis?.weightFactor ? `${Math.round(chassis.weightFactor * 100)}%` : "100%"} />
              <StatTile label="LATERAL ACCEL" value={sim.lateralG} unit="g" accent="ok" />
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-base-950/60 border border-white/5 text-[11px]">
                <span className="text-slate-400">Suspension Pitch Frequency</span>
                <span className="text-amber-300 font-bold">1.85 Hz (Track Optimized)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-base-950/60 border border-white/5 text-[11px]">
                <span className="text-slate-400">Yaw Moment of Inertia</span>
                <span className="text-amber-300 font-bold">2,140 kg·m²</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-base-950/60 border border-white/5 text-[11px]">
                <span className="text-slate-400">Total Unsprung Corner Mass</span>
                <span className="text-emerald-300 font-bold">38.4 kg / corner</span>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommandCenterScreen2);
