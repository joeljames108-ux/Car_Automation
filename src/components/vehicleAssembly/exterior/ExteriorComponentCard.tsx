// ===================================================================
// EXTERIOR COMPONENT INSTALLATION CARD
// ===================================================================
// Interactive card for installing individual exterior subsystems,
// swapping material grades, inspecting fasteners, and checking tolerances.
// ===================================================================

import React from "react";
import { Check, Plus, Wrench, Shield, ArrowUpRight, DollarSign, Scale } from "lucide-react";
import type { ExteriorAssemblyComponentMeta } from "../../../sim/exteriorAssemblyTypes";
import type { MaterialGrade } from "../../../sim/assemblyTypes";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";

interface ExteriorComponentCardProps {
  component: ExteriorAssemblyComponentMeta;
  isInstalled: boolean;
  isActive: boolean;
  isSelected: boolean;
  selectedGrade: MaterialGrade;
  isInstallable: boolean;
  onInstall: () => void;
  onSelect: () => void;
  onGradeChange: (grade: MaterialGrade) => void;
}

export const ExteriorComponentCard: React.FC<ExteriorComponentCardProps> = ({
  component,
  isInstalled,
  isActive,
  isSelected,
  selectedGrade,
  isInstallable,
  onInstall,
  onSelect,
  onGradeChange,
}) => {
  const currentVariant = component.variants.find((v) => v.id === selectedGrade) || component.variants[0];
  const effectiveWeight = Math.round(component.statDeltas.weight * (currentVariant?.weightMultiplier || 1.0));
  const effectiveCost = Math.round(component.statDeltas.cost * (currentVariant?.costMultiplier || 1.0));

  return (
    <div
      onClick={onSelect}
      className={`group relative p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
        isSelected
          ? "bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          : isInstalled
          ? "bg-slate-900/60 border-emerald-500/30 hover:border-emerald-400/60"
          : isInstallable
          ? "bg-slate-900/80 border-slate-700 hover:border-cyan-500/60 hover:bg-slate-850"
          : "bg-slate-950/40 border-slate-850 opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Component Info & Subcategory */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
              {component.subcategory}
            </span>
            {isInstalled && (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                <Check size={11} /> INSTALLED
              </span>
            )}
          </div>
          <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
            {component.name}
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
            {component.description}
          </p>
        </div>

        {/* Right: Install Action Button */}
        <div>
          {isInstalled ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
              <Check size={16} />
            </div>
          ) : isActive ? (
            <div className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-mono font-bold text-xs animate-spin">
              ⚡
            </div>
          ) : isInstallable ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInstall();
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1 shadow-md hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all"
            >
              <Plus size={13} />
              <span>INSTALL</span>
            </button>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-mono">
              🔒
            </div>
          )}
        </div>
      </div>

      {/* Material Grade Selector & Stat Delta Summary */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
        {/* Material Grade Selection Dropdown */}
        <select
          value={selectedGrade}
          onChange={(e) => {
            e.stopPropagation();
            onGradeChange(e.target.value as MaterialGrade);
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-950 border border-white/10 rounded-lg px-2 py-0.5 text-[11px] font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
        >
          {component.variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>

        {/* Weight and Cost Badges */}
        <div className="flex items-center gap-2.5 text-[11px] font-mono">
          <span className="text-slate-400 flex items-center gap-0.5">
            <Scale size={11} className="text-slate-500" />
            <strong className="text-slate-200">{effectiveWeight}kg</strong>
          </span>
          <span className="text-slate-400 flex items-center gap-0.5">
            <DollarSign size={11} className="text-slate-500" />
            <strong className="text-slate-200">${effectiveCost.toLocaleString()}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
