// ===================================================================
// SAFETY CENTER — Crash structure design + NCAP simulation
// ===================================================================
import { useState } from "react";
import {
  ShieldCheck, AlertTriangle, Star, CheckCircle2, Circle,
  Weight, DollarSign, Zap,
} from "lucide-react";
import { useCompany } from "../state/CompanyContext";
import { Select, Toggle, Slider } from "./ui/Controls";
import type {
  CrumpleZoneType, AirbagType, SafetyCageType, SeatbeltType, PedestrianSafetyType,
} from "../sim/types";

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? "text-yellow-400" : "text-base-700"}>
          <Star size={20} fill={i < value ? "currentColor" : "none"} />
        </span>
      ))}
    </div>
  );
}

function ScoreBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = pct >= 80 ? "bg-ok-500" : pct >= 60 ? "bg-accent-500" : pct >= 40 ? "bg-warn-500" : "bg-danger-500";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className={`text-xs font-mono font-semibold ${pct >= 80 ? "text-ok-400" : pct >= 60 ? "text-accent-300" : pct >= 40 ? "text-warn-400" : "text-danger-400"}`}>
          {Math.round(value)}/{max}
        </span>
      </div>
      <div className="h-2 bg-base-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const CRUMPLE_OPTIONS: { value: CrumpleZoneType; label: string }[] = [
  { value: "none",        label: "None" },
  { value: "basic",       label: "Basic" },
  { value: "progressive", label: "Progressive" },
  { value: "advanced",    label: "Advanced" },
  { value: "adaptive",    label: "Adaptive" },
];

const AIRBAG_OPTIONS: { value: AirbagType; label: string }[] = [
  { value: "none",         label: "None" },
  { value: "front",        label: "Front" },
  { value: "front_side",   label: "Front + Side" },
  { value: "full_curtain", label: "Full Curtain" },
  { value: "full_360",     label: "360° Full" },
  { value: "external",     label: "External" },
];

const CAGE_OPTIONS: { value: SafetyCageType; label: string }[] = [
  { value: "none",                 label: "None" },
  { value: "reinforced_pillars",   label: "Reinforced" },
  { value: "safety_cell",          label: "Safety Cell" },
  { value: "carbon_monocoque",     label: "Carbon Mono" },
  { value: "full_cage",            label: "Full Cage" },
];

const BELT_OPTIONS: { value: SeatbeltType; label: string }[] = [
  { value: "three_point",   label: "3-Point" },
  { value: "pretensioner",  label: "Pretensioner" },
  { value: "load_limiter",  label: "Load Limiter" },
  { value: "active_belt",   label: "Active Belt" },
  { value: "four_point",    label: "4-Point Harness" },
];

const PED_OPTIONS: { value: PedestrianSafetyType; label: string }[] = [
  { value: "none",             label: "None" },
  { value: "active_hood",      label: "Active Hood" },
  { value: "bumper_airbag",    label: "Bumper Airbag" },
  { value: "full_pedestrian",  label: "Full System" },
];

const REGION_STANDARDS: { region: string; label: string; threshold: number }[] = [
  { region: "EU (Euro NCAP)",   label: "EU Euro NCAP",  threshold: 75 },
  { region: "US (NHTSA)",       label: "US NHTSA",      threshold: 70 },
  { region: "Australia (ANCAP)",label: "AUS ANCAP",     threshold: 75 },
  { region: "China (C-NCAP)",   label: "China C-NCAP",  threshold: 65 },
];

export function SafetyCenter() {
  const { safetyConfig, safetySim, updateSafety } = useCompany();
  const [activeTab, setActiveTab] = useState<"design" | "ncap">("design");

  const tabs = [
    { id: "design" as const, label: "Safety Design" },
    { id: "ncap"   as const, label: "NCAP Results" },
  ];

  return (
    <div className="space-y-4 stagger">
      {/* Header */}
      <div className="panel p-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{ background: "radial-gradient(ellipse at top right, rgba(34,211,238,0.3), transparent 60%)" }} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-500/20 border border-accent-500/30">
              <ShieldCheck size={24} className="text-accent-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Safety Engineering Center</h2>
              <p className="text-xs text-slate-500">Design crash structure, passive safety, and NCAP compliance</p>
            </div>
          </div>
          <div className="flex-1" />
          {/* Live KPIs */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">NCAP Stars</div>
              <div className="flex justify-end mt-1">
                <StarRating value={safetySim.ncapStars} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Overall Score</div>
              <div className={`text-2xl font-bold font-mono ${safetySim.overallScore >= 80 ? "text-ok-400" : safetySim.overallScore >= 60 ? "text-accent-300" : safetySim.overallScore >= 40 ? "text-warn-400" : "text-danger-400"}`}>
                {safetySim.overallScore}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="panel p-3 text-center">
          <Weight size={14} className="mx-auto text-slate-400 mb-1" />
          <div className="font-mono text-sm text-slate-200">{safetySim.safetyWeight}<span className="text-[10px] text-slate-600 ml-0.5">kg</span></div>
          <div className="text-[10px] text-slate-600">Added Weight</div>
        </div>
        <div className="panel p-3 text-center">
          <DollarSign size={14} className="mx-auto text-ok-400 mb-1" />
          <div className="font-mono text-sm text-slate-200">${safetyConfig ? safetySim.safetyCost.toLocaleString() : 0}</div>
          <div className="text-[10px] text-slate-600">Safety Cost</div>
        </div>
        <div className="panel p-3 text-center">
          <ShieldCheck size={14} className="mx-auto text-accent-400 mb-1" />
          <div className="font-mono text-sm text-slate-200">{safetySim.ncapStars}★</div>
          <div className="text-[10px] text-slate-600">NCAP Stars</div>
        </div>
        <div className="panel p-3 text-center">
          <Zap size={14} className="mx-auto text-purple-400 mb-1" />
          <div className="font-mono text-sm text-slate-200">+{Math.round(safetySim.activeFeatureBonus * 100)}%</div>
          <div className="text-[10px] text-slate-600">ADAS Bonus</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-base-850 rounded-lg p-1 border border-base-800">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === t.id ? "bg-accent-500/20 text-accent-300" : "text-slate-400 hover:text-slate-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "design" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Crumple Zones */}
          <div className="panel p-4 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-accent-400" /> Crumple Zones
            </h3>
            <Select label="Front Crumple Zone" value={safetyConfig.frontCrumple}
              options={CRUMPLE_OPTIONS} onChange={v => updateSafety({ frontCrumple: v })} />
            <Select label="Rear Crumple Zone" value={safetyConfig.rearCrumple}
              options={CRUMPLE_OPTIONS} onChange={v => updateSafety({ rearCrumple: v })} />
            <Select label="Side Crumple Zone" value={safetyConfig.sideCrumple}
              options={CRUMPLE_OPTIONS} onChange={v => updateSafety({ sideCrumple: v })} />
          </div>

          {/* Airbags */}
          <div className="panel p-4 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-warn-400" /> Airbag System
            </h3>
            <Select label="Airbag Type" value={safetyConfig.airbagType}
              options={AIRBAG_OPTIONS} onChange={v => updateSafety({ airbagType: v })} />
            <Slider label="Airbag Count" value={safetyConfig.airbagCount} min={2} max={12} step={2}
              onChange={v => updateSafety({ airbagCount: v })}
              format={v => `${v} bags`} hint="More airbags = better coverage + more cost and weight" />
          </div>

          {/* Structural safety */}
          <div className="panel p-4 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Structural Safety</h3>
            <Select label="Safety Cage" value={safetyConfig.safetyCage}
              options={CAGE_OPTIONS} onChange={v => updateSafety({ safetyCage: v })} />
            <Select label="Seatbelt System" value={safetyConfig.seatbeltType}
              options={BELT_OPTIONS} onChange={v => updateSafety({ seatbeltType: v })} />
            <Select label="Pedestrian Safety" value={safetyConfig.pedestrianSafety}
              options={PED_OPTIONS} onChange={v => updateSafety({ pedestrianSafety: v })} />
            <Slider label="Child Safety Anchors" value={safetyConfig.childSafetyAnchors} min={0} max={4}
              onChange={v => updateSafety({ childSafetyAnchors: v })} format={v => `${v} anchors`} />
          </div>

          {/* Safety features toggles */}
          <div className="panel p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Safety Features</h3>
            <Toggle label="Rollover Protection"
              value={safetyConfig.rolloverProtection} onChange={v => updateSafety({ rolloverProtection: v })} />
            <Toggle label="Door Side Impact Beams"
              value={safetyConfig.doorBeams} onChange={v => updateSafety({ doorBeams: v })} />
            <Toggle label="Energy-Absorbing Steering Column"
              value={safetyConfig.energyAbsorbingSteeringColumn} onChange={v => updateSafety({ energyAbsorbingSteeringColumn: v })} />
            <Toggle label="Collapsible Pedals"
              value={safetyConfig.collapsiblePedals} onChange={v => updateSafety({ collapsiblePedals: v })} />
            <Toggle label="Fire Suppression System"
              value={safetyConfig.fireSuppressionSystem} onChange={v => updateSafety({ fireSuppressionSystem: v })} />
            <Toggle label="eCall Emergency System"
              value={safetyConfig.eCallSystem} onChange={v => updateSafety({ eCallSystem: v })} />
            <Toggle label="Post-Crash Battery Disconnect"
              value={safetyConfig.postCrashBatteryDisconnect} onChange={v => updateSafety({ postCrashBatteryDisconnect: v })} />
          </div>
        </div>
      )}

      {activeTab === "ncap" && (
        <div className="space-y-4">
          {/* Stars */}
          <div className="panel p-6 text-center">
            <div className="text-sm text-slate-400 mb-3 uppercase tracking-wider font-mono">NCAP Star Rating</div>
            <div className="flex justify-center mb-3">
              <StarRating value={safetySim.ncapStars} />
            </div>
            <div className={`text-5xl font-bold font-mono mb-2 ${safetySim.overallScore >= 80 ? "text-ok-400" : safetySim.overallScore >= 60 ? "text-accent-300" : safetySim.overallScore >= 40 ? "text-warn-400" : "text-danger-400"}`}>
              {safetySim.overallScore}
            </div>
            <div className="text-sm text-slate-500">Overall Safety Score</div>
          </div>

          {/* Category breakdown */}
          <div className="panel p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Category Breakdown</h3>
            <ScoreBar label="Frontal Crash Protection" value={safetySim.frontalCrashScore} />
            <ScoreBar label="Side Impact Protection" value={safetySim.sideCrashScore} />
            <ScoreBar label="Rear Impact Protection" value={safetySim.rearCrashScore} />
            <ScoreBar label="Rollover Protection" value={safetySim.rolloverScore} />
            <ScoreBar label="Pedestrian Safety" value={safetySim.pedestrianScore} />
            <ScoreBar label="Child Occupant Safety" value={safetySim.childSafetyScore} />
          </div>

          {/* SVG Radar */}
          <div className="panel p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 text-center">Safety Profile Radar</h3>
            {(() => {
              const scores = [
                { label: "Frontal", val: safetySim.frontalCrashScore },
                { label: "Side", val: safetySim.sideCrashScore },
                { label: "Rear", val: safetySim.rearCrashScore },
                { label: "Rollover", val: safetySim.rolloverScore },
                { label: "Pedestrian", val: safetySim.pedestrianScore },
                { label: "Child", val: safetySim.childSafetyScore },
              ];
              const cx = 120; const cy = 120; const r = 90; const n = scores.length;
              function pt(val: number, i: number) {
                const a = (i / n) * 2 * Math.PI - Math.PI / 2;
                const v = (val / 100) * r;
                return { x: cx + v * Math.cos(a), y: cy + v * Math.sin(a) };
              }
              function gridPts(lev: number) {
                return Array.from({ length: n }, (_, i) => {
                  const a = (i / n) * 2 * Math.PI - Math.PI / 2;
                  return `${cx + lev * r * Math.cos(a)},${cy + lev * r * Math.sin(a)}`;
                }).join(" ");
              }
              const filled = scores.map((s, i) => { const p = pt(s.val, i); return `${p.x},${p.y}`; }).join(" ");
              return (
                <svg viewBox="0 0 240 240" className="w-full max-w-[240px] mx-auto">
                  {[0.25, 0.5, 0.75, 1.0].map(l => <polygon key={l} points={gridPts(l)} fill="none" stroke="#1e293b" strokeWidth="1" />)}
                  {scores.map((_, i) => { const p = pt(1, i); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1e293b" strokeWidth="1.5" />; })}
                  <polygon points={filled} fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="2" />
                  {scores.map((s, i) => {
                    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
                    const lx = cx + (r + 16) * Math.cos(angle);
                    const ly = cy + (r + 16) * Math.sin(angle);
                    return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#94a3b8">{s.label}</text>;
                  })}
                </svg>
              );
            })()}
          </div>

          {/* Regional compliance */}
          <div className="panel p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Regional Compliance</h3>
            <div className="space-y-2">
              {REGION_STANDARDS.map(rs => {
                const passes = safetySim.overallScore >= rs.threshold;
                return (
                  <div key={rs.region} className="flex items-center gap-3 py-1.5">
                    {passes
                      ? <CheckCircle2 size={14} className="text-ok-400 shrink-0" />
                      : <Circle size={14} className="text-danger-400 shrink-0" />}
                    <span className="text-xs text-slate-300 flex-1">{rs.label}</span>
                    <span className="text-[10px] text-slate-500">Threshold: {rs.threshold}</span>
                    <span className={`text-xs font-semibold ${passes ? "text-ok-400" : "text-danger-400"}`}>
                      {passes ? "PASS" : "FAIL"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
