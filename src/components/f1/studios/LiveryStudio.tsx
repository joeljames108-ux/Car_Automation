// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — LIVERY & TITLE SPONSOR STUDIO
// ============================================================================

import React, { memo } from "react";
import { Palette, Sparkles, DollarSign, Award, Sliders } from "lucide-react";
import { useF1ConstructorStore } from "../../../sim/f1/state/f1ConstructorStore";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export const LiveryStudio: React.FC = memo(function LiveryStudio() {
  const { car, updateLivery } = useF1ConstructorStore();
  const l = car.livery;

  const PRESET_PALETTES = [
    { name: "Apex Horizon (Cyan / Gold)", primary: "#0F172A", secondary: "#06B6D4", tertiary: "#F59E0B" },
    { name: "Scuderia Heritage (Rosso / White)", primary: "#DC2626", secondary: "#FFFFFF", tertiary: "#111827" },
    { name: "Silver Arrow (Silver / Teal)", primary: "#E2E8F0", secondary: "#0D9488", tertiary: "#000000" },
    { name: "Papaya Stealth (Orange / Carbon)", primary: "#F97316", secondary: "#18181B", tertiary: "#06B6D4" },
    { name: "British Racing Green (Emerald / Yellow)", primary: "#065F46", secondary: "#FACC15", tertiary: "#064E3B" },
    { name: "Night Ops (Matte Black / Acid Lime)", primary: "#09090B", secondary: "#84CC16", tertiary: "#3F3F46" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Studio Header */}
      <div className="glass-panel p-6 border-pink-500/20 bg-gradient-to-r from-amber-900/60 via-slate-900/90 to-pink-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Palette className="text-pink-400" size={24} />
            <h2 className="text-xl font-bold text-amber-50 tracking-wide">
              Livery Studio, Paint Finishes & Title Sponsors
            </h2>
          </div>
          <p className="text-xs text-amber-200/60 max-w-2xl">
            Customize team aesthetic branding: lightweight matte/gloss finishes, driver competition numbers, and premier title sponsor placement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-pink-400">
              #{l.carNumber}
            </div>
            <div className="text-[10px] text-amber-200/60 uppercase tracking-wider">{l.titleSponsorName}</div>
          </div>
        </div>
      </div>

      {/* Preset Palettes */}
      <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30 space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-amber-100/80 flex items-center justify-between">
          <span>Factory Livery Schemes</span>
          <span className="text-[10px] text-pink-400 font-mono">1-Click Presets</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {PRESET_PALETTES.map((palette) => (
            <button
              key={palette.name}
              onClick={() => {
                playHMIClickSound();
                updateLivery({
                  primaryColorHex: palette.primary,
                  secondaryColorHex: palette.secondary,
                  tertiaryColorHex: palette.tertiary,
                });
              }}
              className="p-2 rounded-xl bg-amber-800/35/80 border border-amber-700/30 hover:border-pink-500/50 transition-all text-left group cursor-pointer"
            >
              <div className="flex h-4 rounded-md overflow-hidden mb-1.5 border border-amber-700/30">
                <div className="w-1/2 h-full" style={{ backgroundColor: palette.primary }} />
                <div className="w-1/4 h-full" style={{ backgroundColor: palette.secondary }} />
                <div className="w-1/4 h-full" style={{ backgroundColor: palette.tertiary }} />
              </div>
              <div className="text-[10px] font-semibold text-amber-100/80 truncate group-hover:text-pink-300">
                {palette.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Pickers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Primary Base Color */}
        <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-100/80 flex items-center justify-between">
            <span>Primary Body Color</span>
            <span className="font-mono text-xs text-amber-200/60">{l.primaryColorHex}</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={l.primaryColorHex}
              onChange={(e) => updateLivery({ primaryColorHex: e.target.value })}
              className="w-12 h-10 rounded-lg bg-transparent cursor-pointer border border-amber-700/30"
            />
            <input
              type="text"
              value={l.primaryColorHex}
              onChange={(e) => updateLivery({ primaryColorHex: e.target.value })}
              className="flex-1 bg-amber-800/35 border border-amber-700/30 rounded-lg px-3 py-2 text-xs text-amber-50 font-mono focus:outline-none focus:border-pink-500"
            />
          </div>
          <p className="text-[11px] text-amber-300/50">Applies to the main survival cell, nose cone, and sidepod upper surfaces.</p>
        </div>

        {/* 2. Secondary Accent Color */}
        <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-100/80 flex items-center justify-between">
            <span>Secondary Aero Accent</span>
            <span className="font-mono text-xs text-amber-200/60">{l.secondaryColorHex}</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={l.secondaryColorHex}
              onChange={(e) => updateLivery({ secondaryColorHex: e.target.value })}
              className="w-12 h-10 rounded-lg bg-transparent cursor-pointer border border-amber-700/30"
            />
            <input
              type="text"
              value={l.secondaryColorHex}
              onChange={(e) => updateLivery({ secondaryColorHex: e.target.value })}
              className="flex-1 bg-amber-800/35 border border-amber-700/30 rounded-lg px-3 py-2 text-xs text-amber-50 font-mono focus:outline-none focus:border-pink-500"
            />
          </div>
          <p className="text-[11px] text-amber-300/50">Applies to front/rear wing endplates, DRS flap, and shark fin stripe.</p>
        </div>

        {/* 3. Paint Finish */}
        <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-amber-100/80 flex items-center justify-between">
            <span>Paint Finish Type</span>
            <span className="text-[10px] text-pink-400 font-mono">Weight Saving</span>
          </label>
          <select
            value={l.finishType}
            onChange={(e) => updateLivery({ finishType: e.target.value as any })}
            className="w-full bg-amber-800/35 border border-amber-700/30 rounded-lg px-3 py-2 text-xs text-amber-50 focus:outline-none focus:border-pink-500"
          >
            <option value="MATTE_LIGHTWEIGHT">Matte Lightweight (-1.2 kg paint weight)</option>
            <option value="GLOSS_CLEARCOAT">High Gloss Mirror Clearcoat</option>
            <option value="SATIN_PEARLESCENT">Satin Pearlescent Metallic</option>
            <option value="EXPOSED_CARBON_TINT">Exposed Carbon Fiber Tint (Extreme Weight Save)</option>
          </select>
          <p className="text-[11px] text-amber-300/50">
            Matte and exposed carbon finishes save up to 1.5 kg of clearcoat weight across the bodywork.
          </p>
        </div>

        {/* 4. Competition Car Number */}
        <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-amber-100/80 uppercase tracking-wider">Driver Competition Number</span>
            <span className="font-mono text-pink-400 font-bold">#{l.carNumber}</span>
          </div>
          <input
            type="number"
            min="1"
            max="99"
            value={l.carNumber}
            onChange={(e) => updateLivery({ carNumber: Math.max(1, Math.min(99, parseInt(e.target.value) || 1)) })}
            className="w-full bg-amber-800/35 border border-amber-700/30 rounded-lg px-3 py-2 text-xs text-amber-50 font-mono focus:outline-none focus:border-pink-500"
          />
          <p className="text-[11px] text-amber-300/50">Number #1 is reserved for the defending World Drivers' Champion.</p>
        </div>

        {/* 5. Title Sponsor Name */}
        <div className="bg-amber-900/40 p-4 rounded-xl border border-amber-800/30 space-y-2">
          <span className="text-xs font-bold text-amber-100/80 uppercase tracking-wider">Title Sponsor Name</span>
          <input
            type="text"
            value={l.titleSponsorName}
            onChange={(e) => updateLivery({ titleSponsorName: e.target.value })}
            className="w-full bg-amber-800/35 border border-amber-700/30 rounded-lg px-3 py-2 text-xs text-amber-50 font-semibold focus:outline-none focus:border-pink-500"
          />
          <p className="text-[11px] text-amber-300/50">Displayed on the sidepods and rear wing mainplane.</p>
        </div>
      </div>
    </div>
  );
});
