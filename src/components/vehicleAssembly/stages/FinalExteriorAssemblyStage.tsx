/**
 * ============================================================================
 * STAGE 11: FINAL EXTERIOR DETAILS & EXHAUST STAGE
 * ============================================================================
 */

import React from "react";
import { Flame, CheckCircle2, Shield, Sparkles } from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface FinalExteriorAssemblyStageProps {
  exhaustType: InstalledSubsystemsState["exhaustType"];
  onUpdateExteriorDetails: (type: InstalledSubsystemsState["exhaustType"]) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

export const FinalExteriorAssemblyStage: React.FC<FinalExteriorAssemblyStageProps> = ({
  exhaustType,
  onUpdateExteriorDetails,
  isInstalled,
  onInstall,
}) => {
  const exhausts: {
    id: InstalledSubsystemsState["exhaustType"];
    label: string;
    material: string;
    soundProfile: string;
    desc: string;
  }[] = [
    {
      id: "quad_titanium",
      label: "Quad Inconel / Titanium Exhaust",
      material: "Grade 5 Titanium",
      soundProfile: "Crisp High-Pitch Screamer",
      desc: "Mandrel-bent ultra-thin titanium quad tailpipes with blue flame-treated tips and valve bypass.",
    },
    {
      id: "center_dual",
      label: "Center-Exit Dual Blown Exhaust",
      material: "Inconel 625 Superalloy",
      soundProfile: "Deep Throaty Bass",
      desc: "Central diffuser-exit dual pipes that energize the rear low-pressure wake for downforce.",
    },
    {
      id: "f1_side_exit",
      label: "F1 Side-Exit Louvered Exhaust",
      material: "Ceramic Coated Titanium",
      soundProfile: "Raw Open Header Bark",
      desc: "Short-path side sills exit dumping exhaust pulses ahead of the rear tires for minimum backpressure.",
    },
  ];

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Flame size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              STAGE 11: FINAL EXTERIOR DETAILS & EXHAUST
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Mount aerodynamic wing mirrors, titanium exhaust tips, and final body trim fasteners.
            </p>
          </div>
        </div>
        {isInstalled && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <CheckCircle2 size={14} /> EXTERIOR DETAILS INSTALLED
          </span>
        )}
      </div>

      {/* Exhaust Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {exhausts.map((ex) => {
          const isSelected = exhaustType === ex.id;
          return (
            <button
              key={ex.id}
              onClick={() => onUpdateExteriorDetails(ex.id)}
              className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                isSelected
                  ? "bg-amber-500/20 border-amber-500/60 shadow-md ring-1 ring-amber-500/40"
                  : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
              }`}
            >
              <div className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 mb-1">{ex.label}</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5">{ex.desc}</p>
              <div className="space-y-0.5 text-[10px] font-mono text-slate-400 border-t border-base-800/60 pt-2">
                <div>Material: <strong className="text-amber-400">{ex.material}</strong></div>
                <div>Sound: <strong className="text-cyan-300">{ex.soundProfile}</strong></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-INSTALL DETAILS" : "FINALIZE ASSEMBLY & COMPLETE VEHICLE"}
        </button>
      </div>
    </div>
  );
};
