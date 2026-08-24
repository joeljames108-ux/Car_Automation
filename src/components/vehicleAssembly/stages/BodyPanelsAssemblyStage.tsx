/**
 * ============================================================================
 * STAGE 7: BODY PANELS & PAINT BOOTH STAGE
 * ============================================================================
 */

import React from "react";
import { Car, CheckCircle2, Palette, Layers, Sparkles } from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";
import { PaintFinish } from "../../../sim/types";

interface BodyPanelsAssemblyStageProps {
  bodyKit: InstalledSubsystemsState["bodyKit"];
  paintColor: string;
  paintFinish: PaintFinish;
  onUpdateBody: (patch: {
    bodyKit?: InstalledSubsystemsState["bodyKit"];
    paintColor?: string;
    paintFinish?: PaintFinish;
  }) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

const BODY_KITS: { id: InstalledSubsystemsState["bodyKit"]; label: string; desc: string; dragDelta: string }[] = [
  { id: "gt3_aero", label: "GT3 Competition Widebody", desc: "Flared carbon fiber fenders with front louvers and side air extraction ducts.", dragDelta: "+0.015 Cd (High Downforce)" },
  { id: "carbon_widebody", label: "Exposed Carbon Monocoque Shell", desc: "100% dry carbon prepreg body panels with high gloss resin clearcoat.", dragDelta: "-0.010 Cd (Lightweight)" },
  { id: "sculpted_supercar", label: "Sculpted Supercar Streamline", desc: "Smooth organic curves with integrated door air channels to rear radiators.", dragDelta: "-0.022 Cd (Low Drag)" },
  { id: "oem_sport", label: "OEM Aluminum Sport Package", desc: "Superformed aluminum bodywork with clean aerodynamic shutlines.", dragDelta: "0.000 Cd (Balanced)" },
];

const PAINT_SWATCHES = [
  "#e11d48", "#dc2626", "#ea580c", "#f59e0b", "#facc15", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#2563eb",
  "#1e40af", "#7c3aed", "#a855f7", "#ec4899", "#f43f5e", "#0f172a",
  "#1e293b", "#475569", "#94a3b8", "#e2e8f0", "#f8fafc", "#92400e",
];

const FINISHES: { id: PaintFinish; label: string }[] = [
  { id: "gloss", label: "High Gloss Clearcoat" },
  { id: "satin", label: "Satin Sheen" },
  { id: "matte", label: "Stealth Matte" },
  { id: "metallic", label: "Metallic Flake" },
  { id: "pearl", label: "Chameleon Pearl" },
  { id: "colorshift", label: "Colorshift Iridescent" },
];

export const BodyPanelsAssemblyStage: React.FC<BodyPanelsAssemblyStageProps> = ({
  bodyKit,
  paintColor,
  paintFinish,
  onUpdateBody,
  isInstalled,
  onInstall,
}) => {
  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/30">
            <Car size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              STAGE 7: BODY STRUCTURE, WIDEBODY & PAINT
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Attach the outer bodywork, hood, fenders, bumpers, and configure the paint booth finish.
            </p>
          </div>
        </div>
        {isInstalled && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <CheckCircle2 size={14} /> BODYWORK INSTALLED
          </span>
        )}
      </div>

      {/* Body Kit Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {BODY_KITS.map((k) => {
          const isSelected = bodyKit === k.id;
          return (
            <button
              key={k.id}
              onClick={() => onUpdateBody({ bodyKit: k.id })}
              className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                isSelected
                  ? "bg-pink-500/20 border-pink-500/60 shadow-md ring-1 ring-pink-500/40"
                  : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">{k.label}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">{k.desc}</p>
              <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-300 font-semibold">{k.dragDelta}</div>
            </button>
          );
        })}
      </div>

      {/* Paint Swatches & Finish */}
      <div className="p-3.5 rounded-2xl bg-base-900/60 border border-base-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Palette size={13} className="text-pink-400" /> PAINT BOOTH COLOR SWATCHES
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={paintColor}
              onChange={(e) => onUpdateBody({ paintColor: e.target.value })}
              className="h-6 w-8 bg-transparent border border-base-800 rounded cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">{paintColor}</span>
          </div>
        </div>

        <div className="grid grid-cols-8 md:grid-cols-12 gap-1.5">
          {PAINT_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => onUpdateBody({ paintColor: c })}
              className={`h-7 rounded-lg border-2 transition-transform hover:scale-110 cursor-pointer ${
                paintColor === c ? "border-white scale-110 ring-2 ring-pink-500" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>

        {/* Finish Selector */}
        <div className="flex items-center gap-2 pt-2 border-t border-base-800/60 overflow-x-auto no-scrollbar">
          {FINISHES.map((f) => (
            <button
              key={f.id}
              onClick={() => onUpdateBody({ paintFinish: f.id })}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer whitespace-nowrap ${
                paintFinish === f.id
                  ? "bg-pink-500/20 border-pink-500/60 text-pink-600 dark:text-pink-300 shadow-sm"
                  : "bg-base-850/60 border-base-800 text-slate-500 hover:text-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-pink-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-INSTALL BODY PANELS" : "INSTALL BODY PANELS & PROCEED TO GLASS"}
        </button>
      </div>
    </div>
  );
};
