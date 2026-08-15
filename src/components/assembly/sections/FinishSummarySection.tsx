// ===================================================================
// APEX ENGINE BUILDER — STAGE 14: FINISH / SUMMARY SECTION (PHASE 13)
// Bill of Materials (BOM), Dyno Certification, Component Manifest & Export
// ===================================================================

import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Zap,
  Flame,
  Layers,
  Activity,
  DollarSign,
  Scale,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { SectionCard } from "../SectionCard";
import {
  ComponentId,
  MaterialGrade,
  PowertrainMode,
  getAssemblyComponents,
} from "../../../sim/assemblyTypes";
import { EngineConfig, SimResult } from "../../../sim/types";
import { ENGINE_LAYOUTS, EV_MOTOR_TYPES } from "../../../sim/constants";

interface FinishSummarySectionProps {
  powertrainMode: PowertrainMode;
  engineConfig: EngineConfig;
  sim: SimResult;
  installedComponents: ComponentId[];
  selectedVariants: Record<string, MaterialGrade>;
  currentTotalStats: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  onShowCompletionModal: () => void;
  onResetFlow: () => void;
  className?: string;
}

const GRADE_BADGES: Record<MaterialGrade, { label: string; color: string }> = {
  cast: { label: "OEM CAST", color: "bg-slate-800 text-slate-300 border-slate-700" },
  forged: { label: "RACE FORGED", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
  billet: { label: "CNC BILLET", color: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  titanium: { label: "TITANIUM SPEC-R", color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  ceramic: { label: "CERAMIC MATRIX", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
};

export function FinishSummarySection({
  powertrainMode,
  engineConfig,
  sim,
  installedComponents,
  selectedVariants,
  currentTotalStats,
  onShowCompletionModal,
  onResetFlow,
  className = "",
}: FinishSummarySectionProps) {
  const [copied, setCopied] = useState(false);

  const isEV = powertrainMode === "electric";
  const layoutLabel = isEV
    ? EV_MOTOR_TYPES[engineConfig.evMotorType || "pmsm_axial"]?.label || "Electric HyperDrive"
    : `${ENGINE_LAYOUTS[engineConfig.layout]?.label || engineConfig.layout} Internal Combustion`;

  const allComponentsMeta = getAssemblyComponents(engineConfig);

  const handleCopySummary = () => {
    const summaryText = `APEX POWERTRAIN BUILD SHEET:
Platform: ${layoutLabel}
Peak Power: ${currentTotalStats.hp} HP
Peak Torque: ${currentTotalStats.torque} Nm
Powertrain Weight: ${currentTotalStats.weight} kg
Reliability Rating: ${currentTotalStats.reliability}%
Total BOM Cost: $${currentTotalStats.cost.toLocaleString()}
Components Installed: ${installedComponents.length}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className={`space-y-6 p-6 md:p-8 rounded-3xl bg-gradient-to-b from-slate-950/40 via-slate-900/30 to-slate-950/40 border border-white/10 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] select-none ${className}`}
    >
      {/* ── TOP CERTIFICATION HEADER ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-purple-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-[0_0_25px_rgba(52,211,153,0.3)] shrink-0">
            <Award size={28} className="text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-widest">
                CERTIFIED BENCH-TESTED
              </span>
              <span className="text-xs font-mono text-slate-400">
                {installedComponents.length} Components Mounted
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold font-mono text-slate-100 mt-0.5">
              {layoutLabel}
            </h2>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-base-950/80 hover:bg-base-900 text-slate-300 border border-slate-700 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Spec Sheet"}</span>
          </button>

          <button
            type="button"
            onClick={onShowCompletionModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-mono font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(52,211,153,0.4)] cursor-pointer active:scale-95"
          >
            <Sparkles size={14} />
            <span>Celebration Certificate</span>
          </button>

          <button
            type="button"
            onClick={onResetFlow}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-base-950/80 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-500/40 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
            title="Reset Assembly"
          >
            <RotateCcw size={14} />
            <span>Reset & Rebuild</span>
          </button>
        </div>
      </div>

      {/* ── CUMULATIVE SPECS 5-TILE ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-base-950/80 border border-cyan-500/30 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Certified Output</span>
          <span className="text-xl md:text-2xl font-extrabold font-mono text-cyan-300">
            {currentTotalStats.hp} hp
          </span>
          <span className="text-[10px] font-mono text-cyan-400/80 block mt-0.5">
            {isEV ? `${Math.round(currentTotalStats.hp / 1.341)} kW` : `@ ${sim.peakPowerRpm || 6500} RPM`}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-base-950/80 border border-purple-500/30 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Peak Torque</span>
          <span className="text-xl md:text-2xl font-extrabold font-mono text-purple-300">
            {currentTotalStats.torque} Nm
          </span>
          <span className="text-[10px] font-mono text-purple-400/80 block mt-0.5">
            {isEV ? "0 RPM Instantaneous" : `@ ${sim.peakTorqueRpm || 4800} RPM`}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-base-950/80 border border-slate-800 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Powertrain Mass</span>
          <span className="text-xl md:text-2xl font-extrabold font-mono text-slate-100">
            {currentTotalStats.weight} kg
          </span>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Dry Weight</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-base-950/80 border border-emerald-500/30 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Durability Score</span>
          <span className="text-xl md:text-2xl font-extrabold font-mono text-emerald-300">
            {currentTotalStats.reliability}%
          </span>
          <span className="text-[10px] font-mono text-emerald-400/80 block mt-0.5">Track Grade</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-base-950/80 border border-amber-500/30 text-center">
          <span className="block text-[10px] font-mono text-slate-400 uppercase">Total BOM Cost</span>
          <span className="text-xl md:text-2xl font-extrabold font-mono text-amber-300">
            ${currentTotalStats.cost.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-amber-400/80 block mt-0.5">Hardware Total</span>
        </div>
      </div>

      {/* ── BILL OF MATERIALS (BOM) & COMPONENT MANIFEST TABLE ── */}
      <SectionCard
        title="Bill of Materials & Component Manifest"
        subtitle="Complete breakdown of all installed mechanical subsystems & metallurgy"
        icon={<FileSpreadsheet size={16} />}
        accent="cyan"
      >
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Subsystem Component</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Metallurgy / Grade</th>
                <th className="py-2.5 px-3 text-right">Power Delta</th>
                <th className="py-2.5 px-3 text-right">Weight</th>
                <th className="py-2.5 px-3 text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              {installedComponents.map((compId, idx) => {
                const meta = allComponentsMeta.find((c) => c.id === compId);
                if (!meta) return null;
                const variantId = selectedVariants[compId] || "cast";
                const variant =
                  meta.variants.find((v) => v.id === variantId) || meta.variants[0];
                const badge = GRADE_BADGES[variantId] || GRADE_BADGES.cast;

                const hpGain = Math.round(meta.statDeltas.hp * (variant?.hpMultiplier || 1));
                const mass = Math.round(meta.statDeltas.weight * (variant?.weightMultiplier || 1));
                const cost = Math.round(meta.statDeltas.cost * (variant?.costMultiplier || 1));

                return (
                  <tr key={compId} className="hover:bg-base-900/60 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 font-bold">#{idx + 1}</td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      <span>{meta.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{meta.category}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-extrabold border ${badge.color}`}
                      >
                        {variant?.label || badge.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">
                      {hpGain > 0 ? `+${hpGain} hp` : "–"}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 font-bold">
                      +{mass} kg
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-300 font-bold">
                      ${cost.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
