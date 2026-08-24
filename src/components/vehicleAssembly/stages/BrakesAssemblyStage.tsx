/**
 * ============================================================================
 * STAGE 5: BRAKING HARDWARE & CALIPERS STAGE
 * ============================================================================
 */

import React from "react";
import { Disc, CheckCircle2, Shield, Palette } from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface BrakesAssemblyStageProps {
  brakeType: InstalledSubsystemsState["brakeType"];
  caliperColor: string;
  onUpdateBrakes: (patch: { brakeType?: InstalledSubsystemsState["brakeType"]; caliperColor?: string }) => void;
  isInstalled: boolean;
  onInstall: () => void;
}

export const BrakesAssemblyStage: React.FC<BrakesAssemblyStageProps> = ({
  brakeType,
  caliperColor,
  onUpdateBrakes,
  isInstalled,
  onInstall,
}) => {
  const brakeOptions: {
    id: InstalledSubsystemsState["brakeType"];
    label: string;
    rotorSize: string;
    caliper: string;
    fadeLimit: string;
    desc: string;
  }[] = [
    {
      id: "carbon_ceramic",
      label: "Carbon-Ceramic Matrix (CCM)",
      rotorSize: "410mm Front / 390mm Rear",
      caliper: "8-Piston Monobloc",
      fadeLimit: "1,050°C",
      desc: "Carbon-silicon carbide discs with titanium-backed pads for zero thermal fade.",
    },
    {
      id: "slotted_steel",
      label: "Slotted Racing Cast Iron",
      rotorSize: "380mm Front / 355mm Rear",
      caliper: "6-Piston Motorsport",
      fadeLimit: "800°C",
      desc: "Curved directional vane iron discs with gas evacuation slots and high initial bite.",
    },
    {
      id: "drilled_sport",
      label: "Cross-Drilled Sport Steel",
      rotorSize: "355mm Front / 340mm Rear",
      caliper: "4-Piston Performance",
      fadeLimit: "680°C",
      desc: "Cross-drilled lightweight steel rotors for heat dissipation and wet weather water clearing.",
    },
  ];

  const caliperColors = [
    { hex: "#ef4444", name: "Brembo Racing Red" },
    { hex: "#eab308", name: "Apex Acid Yellow" },
    { hex: "#06b6d4", name: "Cyan Mist" },
    { hex: "#10b981", name: "British Green" },
    { hex: "#f97316", name: "McLaren Orange" },
    { hex: "#0f172a", name: "Stealth Black" },
    { hex: "#cbd5e1", name: "Silver Anodized" },
    { hex: "#d946ef", name: "Neon Magenta" },
  ];

  return (
    <div className="panel p-4 rounded-3xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-base-800/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
            <Disc size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              STAGE 5: BRAKING HARDWARE & CALIPER FINISH
            </h3>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Mount brake rotors and multi-piston monobloc calipers onto the 4-corner uprights.
            </p>
          </div>
        </div>
        {isInstalled && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            <CheckCircle2 size={14} /> BRAKES INSTALLED
          </span>
        )}
      </div>

      {/* Brake Rotor Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {brakeOptions.map((b) => {
          const isSelected = brakeType === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onUpdateBrakes({ brakeType: b.id })}
              className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                isSelected
                  ? "bg-red-500/20 border-red-500/60 shadow-md ring-1 ring-red-500/40"
                  : "bg-base-900/60 border-base-800 hover:border-base-700 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs font-mono text-slate-900 dark:text-slate-100">{b.label}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5">{b.desc}</p>
              <div className="space-y-1 text-[10px] font-mono text-slate-400 border-t border-base-800/60 pt-2">
                <div>Rotors: <strong className="text-slate-200">{b.rotorSize}</strong></div>
                <div>Caliper: <strong className="text-amber-400">{b.caliper}</strong></div>
                <div>Fade Temp: <strong className="text-emerald-400">{b.fadeLimit}</strong></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Caliper Color Palette */}
      <div className="p-3.5 rounded-2xl bg-base-900/60 border border-base-800 space-y-2">
        <label className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 block flex items-center gap-1.5">
          <Palette size={13} className="text-red-400" /> MONOBLOC CALIPER FINISH
        </label>
        <div className="flex items-center gap-2.5 flex-wrap">
          {caliperColors.map((c) => (
            <button
              key={c.hex}
              onClick={() => onUpdateBrakes({ caliperColor: c.hex })}
              className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 shadow-lg cursor-pointer flex items-center justify-center ${
                caliperColor === c.hex ? "border-white scale-110 ring-2 ring-red-500/80" : "border-transparent"
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Install Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onInstall}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <CheckCircle2 size={16} />
          {isInstalled ? "RE-INSTALL BRAKES" : "INSTALL BRAKES & PROCEED TO WHEELS"}
        </button>
      </div>
    </div>
  );
};
