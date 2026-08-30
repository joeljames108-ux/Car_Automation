/**
 * ============================================================================
 * STAGE 11: EXTERIOR DETAILS — QUAD TITANIUM EXHAUST (HEAT-TINT) & TOW HOOKS
 * ============================================================================
 * Mount the quad titanium exhaust with heat-tint blue gradient tips, plus FIA
 * tow hooks front and rear, wing mirrors and final trim fasteners.
 */

import React from "react";
import { Flame, CheckCircle2, Anchor } from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface FinalExteriorAssemblyStageProps {
  exhaustType: InstalledSubsystemsState["exhaustType"];
  onUpdateExhaustType: (type: InstalledSubsystemsState["exhaustType"]) => void;
  heatTintIntensity: number;
  onUpdateHeatTint: (pct: number) => void;
  towHooksFront: boolean;
  towHooksRear: boolean;
  onUpdateTowHooks: (patch: { towHooksFront?: boolean; towHooksRear?: boolean }) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

export const FinalExteriorAssemblyStage: React.FC<FinalExteriorAssemblyStageProps> = ({
  exhaustType,
  onUpdateExhaustType,
  heatTintIntensity,
  onUpdateHeatTint,
  towHooksFront,
  towHooksRear,
  onUpdateTowHooks,
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
      desc: "Mandrel-bent ultra-thin titanium quad tailpipes with flame-treated tips and vacuum-valve bypass.",
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

  const tint = heatTintIntensity ?? 70;

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
              Titanium exhaust with heat-tint gradient, FIA tow hooks, aero mirrors & trim fasteners.
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
              onClick={() => onUpdateExhaustType(ex.id)}
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
                <div>Sound: <strong className="text-amber-300">{ex.soundProfile}</strong></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Heat-Tint Gradient Control */}
      <div className={`p-3.5 rounded-2xl bg-base-900/60 border border-base-800 space-y-2.5 ${exhaustType !== "quad_titanium" && exhaustType !== "f1_side_exit" ? "opacity-50" : ""}`}>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Flame size={13} className="text-amber-400" /> TITANIUM HEAT-TINT BLUE GRADIENT
          </label>
          <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">{tint}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={tint}
          onChange={(e) => onUpdateHeatTint(parseInt(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer"
        />
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
          <span>0% Raw Brushed Ti</span>
          <div className="flex-1 mx-3 h-1.5 rounded-full bg-gradient-to-r from-slate-400 via-yellow-600 to-indigo-700" />
          <span>100% Full Blue Burn</span>
        </div>
        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-base-800/60">
          Flame-treatment pass at ~800°C grows the oxide layer — straw → bronze → violet → electric blue. Live 3D preview updates tip materials instantly.
        </p>
      </div>

      {/* Tow Hooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(
          [
            { key: "towHooksFront" as const, label: "FRONT TOW HOOK", value: towHooksFront, pos: "Center grille cutout — red anodized loop" },
            { key: "towHooksRear" as const, label: "REAR TOW HOOK", value: towHooksRear, pos: "Diffuser strake gap — FIA 8857 compliant" },
          ]
        ).map((h) => (
          <button
            key={h.key}
            onClick={() => onUpdateTowHooks({ [h.key]: !h.value })}
            className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
              h.value
                ? "bg-red-500/15 border-red-500/50 ring-1 ring-red-500/40"
                : "bg-base-900/60 border-base-800 hover:border-base-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Anchor size={13} className="text-red-400" /> {h.label}
              </span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                h.value ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-base-800 border-base-700 text-slate-500"
              }`}>
                {h.value ? "✓ FITTED" : "OFF"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{h.pos}. Required for circuit recovery within 90 seconds.</p>
          </button>
        ))}
      </div>

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-INSTALL DETAILS" : "INSTALL DETAILS & PROCEED TO AERODYNAMICS"}
        </button>
      </div>
    </div>
  );
};
