/**
 * ============================================================================
 * STAGE 8: GLASS & CANOPY STAGE
 * ============================================================================
 */

import React from "react";
import { Sparkles, CheckCircle2, Shield, Eye } from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface GlassAssemblyStageProps {
  glassType: InstalledSubsystemsState["glassType"];
  onUpdateGlass: (type: InstalledSubsystemsState["glassType"]) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

export const GlassAssemblyStage: React.FC<GlassAssemblyStageProps> = ({
  glassType,
  onUpdateGlass,
  isInstalled,
  onInstall,
}) => {
  const glassOptions: {
    id: InstalledSubsystemsState["glassType"];
    label: string;
    weight: string;
    safety: string;
    desc: string;
  }[] = [
    {
      id: "laminated_clear",
      label: "Laminated Acoustic Windshield",
      weight: "18.5 kg total",
      safety: "ECE R43 / DOT",
      desc: "Dual-layer tempered glass with acoustic PVB interlayer for reduced cabin wind noise.",
    },
    {
      id: "race_polycarbonate",
      label: "Polycarbonate Race Lexan (Hardcoated)",
      weight: "8.2 kg total (-55% Mass)",
      safety: "FIA Homologated",
      desc: "Motorsport scratch-resistant hardcoated polycarbonate windshield and flush quarter glass.",
    },
    {
      id: "privacy_tint",
      label: "Privacy Tinted Lightweight Glass",
      weight: "16.2 kg total",
      safety: "ECE R43 Compliant",
      desc: "Infrared-reflecting solar control glass with 20% rear tint and UV barrier coating.",
    },
  ];

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              STAGE 8: WINDSHIELD & CANOPY GLASS
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Install the aerodynamic windshield, roof canopy glass, and flush side windows.
            </p>
          </div>
        </div>
        {isInstalled && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <CheckCircle2 size={14} /> GLASS INSTALLED
          </span>
        )}
      </div>

      {/* Glass Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {glassOptions.map((g) => {
          const isSelected = glassType === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onUpdateGlass(g.id)}
              className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                isSelected
                  ? "bg-cyan-500/20 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/40"
                  : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
              }`}
            >
              <div className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 mb-1">{g.label}</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">{g.desc}</p>
              <div className="space-y-0.5 text-[10px] font-mono text-slate-400 border-t border-base-800/60 pt-2">
                <div>Weight: <strong className="text-amber-400">{g.weight}</strong></div>
                <div>Spec: <strong className="text-emerald-400">{g.safety}</strong></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-INSTALL GLASS" : "INSTALL GLASS & PROCEED TO INTERIOR"}
        </button>
      </div>
    </div>
  );
};
