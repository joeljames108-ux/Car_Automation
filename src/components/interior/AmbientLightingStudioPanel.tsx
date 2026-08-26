/**
 * ============================================================================
 * AMBIENT LIGHTING STUDIO PANEL
 * ============================================================================
 * Deep interior lighting studio configurator:
 * - 6 Configurable Lighting Zones (Dashboard strip, Door strips, Footwell, Center console, Starlight roof, Seat back buckets)
 * - Color Picker, Brightness & Intensity Controls
 * - Curated Theme Palettes (Cyberpunk Cyan, Amber Gold, Monochrome White, Scuderia Crimson, Ice Blue, GT3 Minimal)
 * - Live real-time WebGL ambient lighting feedback
 * ============================================================================
 */

import React from "react";
import { Sun, Sparkles, Palette, Check, Activity } from "lucide-react";
import { MasterModularInteriorState, AmbientLightingTheme } from "../../sim/interior/masterInteriorTypes";
import { MasterInteriorStateEngine } from "../../sim/interior/masterInteriorStateEngine";

interface AmbientLightingStudioPanelProps {
  state: MasterModularInteriorState;
}

export const AMBIENT_LIGHT_PRESETS: { name: string; primaryHex: string; secondaryHex: string; theme: AmbientLightingTheme }[] = [
  { name: "Cyberpunk Neon Cyan", primaryHex: "#00f0ff", secondaryHex: "#3b82f6", theme: "cyberpunk_cyan" },
  { name: "Golden Hour Amber", primaryHex: "#f59e0b", secondaryHex: "#d97706", theme: "amber_gold_lounge" },
  { name: "Titanium Pure White", primaryHex: "#f8fafc", secondaryHex: "#94a3b8", theme: "monochrome_white" },
  { name: "Scuderia Crimson Red", primaryHex: "#ef4444", secondaryHex: "#991b1b", theme: "scuderia_crimson" },
  { name: "Ice Blue Calm", primaryHex: "#38bdf8", secondaryHex: "#0284c7", theme: "ice_blue_calm" },
  { name: "GT3 Minimal Red", primaryHex: "#dc2626", secondaryHex: "#7f1d1d", theme: "gt_track_minimal_red" },
];

export const AMBIENT_ANIMATION_MODES = [
  { id: "cyberpunk_cyan", label: "Cyberpunk Cyan Pulse", icon: "✨" },
  { id: "amber_gold_lounge", label: "Amber Gold Warm Lounge", icon: "🫁" },
  { id: "scuderia_crimson", label: "Scuderia Crimson Sport", icon: "💓" },
  { id: "ice_blue_calm", label: "Ice Blue Ambient Calm", icon: "🌈" },
  { id: "monochrome_white", label: "Monochrome Pure Studio", icon: "🏎" },
  { id: "gt_track_minimal_red", label: "GT Track Night Minimal", icon: "🎶" },
];

export const AmbientLightingStudioPanel: React.FC<AmbientLightingStudioPanelProps> = ({ state }) => {
  const engine = MasterInteriorStateEngine.getInstance();
  const lighting = state.lighting;

  return (
    <div className="space-y-4 font-mono text-xs text-amber-950">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-100/80 border border-amber-300/70 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-400/20 text-amber-800">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
              <span>64-COLOR AMBIENT LIGHTING STUDIO</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-800 border border-emerald-500/40">
                ACTIVE
              </span>
            </div>
            <div className="text-[10px] text-amber-700">
              Brightness: {lighting.brightnessPercent}% • Color: {lighting.colorHex}
            </div>
          </div>
        </div>
      </div>

      {/* Preset Swatches */}
      <div>
        <label className="font-extrabold text-amber-900 mb-2 flex items-center gap-1.5">
          <Palette size={13} className="text-amber-600" />
          <span>CURATED LIGHTING THEME PALETTES</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AMBIENT_LIGHT_PRESETS.map((preset) => {
            const isSelected = lighting.colorHex.toLowerCase() === preset.primaryHex.toLowerCase();
            return (
              <button
                key={preset.name}
                onClick={() =>
                  engine.updateLighting({
                    colorHex: preset.primaryHex,
                    theme: preset.theme,
                  })
                }
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-200/80 border-amber-500 shadow-md font-bold"
                    : "bg-white/60 border-amber-200/80 hover:bg-amber-100/50"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-white/60 shadow-sm flex items-center justify-center shrink-0"
                  style={{ background: `linear-gradient(135deg, ${preset.primaryHex}, ${preset.secondaryHex})` }}
                >
                  {isSelected && <Check size={10} className="text-white drop-shadow" />}
                </div>
                <div className="truncate">
                  <div className="text-[11px] truncate">{preset.name}</div>
                  <div className="text-[9px] text-amber-700 font-mono">{preset.primaryHex}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Animation Modes */}
      <div>
        <label className="font-extrabold text-amber-900 mb-2 flex items-center gap-1.5">
          <Activity size={13} className="text-amber-600" />
          <span>LIGHTING THEME MODES</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AMBIENT_ANIMATION_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => engine.updateLighting({ theme: mode.id as AmbientLightingTheme })}
              className={`p-2 rounded-xl text-left border font-bold text-[11px] transition-all cursor-pointer ${
                state.lighting.theme === mode.id
                  ? "bg-amber-500 text-white border-amber-600 shadow-md"
                  : "bg-white/60 border-amber-200/80 text-amber-900 hover:bg-amber-100/50"
              }`}
            >
              <span>{mode.icon}</span> <span className="truncate">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brightness Intensity Slider */}
      <div className="p-3 rounded-2xl bg-white/60 border border-amber-200/80 space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-amber-900">
          <span className="flex items-center gap-1.5">
            <Sun size={14} className="text-amber-600" />
            <span>GLOBAL INTENSITY & BRIGHTNESS</span>
          </span>
          <span className="text-amber-700 font-mono">{lighting.brightnessPercent}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={lighting.brightnessPercent}
          onChange={(e) => engine.updateLighting({ brightnessPercent: parseInt(e.target.value) })}
          className="w-full h-1.5 rounded-lg accent-amber-500 cursor-pointer"
        />
      </div>

      {/* Illuminated Zones Toggles */}
      <div>
        <label className="font-extrabold text-amber-900 mb-2 block">ACTIVE ILLUMINATED ZONES</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
          {[
            { key: "dashboardStrip", label: "Dashboard Strip", emoji: "📐" },
            { key: "doorStrips", label: "Door Light Strips", emoji: "🚪" },
            { key: "footwells", label: "Footwell Mood", emoji: "👟" },
            { key: "centerConsole", label: "Center Console", emoji: "🕹️" },
            { key: "starlightRoofHeadliner", label: "Starlight Roof", emoji: "✨" },
            { key: "seatBackBuckets", label: "Seat Back Buckets", emoji: "💺" },
          ].map((zone) => {
            const isEnabled = (lighting.illuminatedZones as any)[zone.key] ?? true;
            return (
              <button
                key={zone.key}
                onClick={() =>
                  engine.updateLighting({
                    illuminatedZones: {
                      ...lighting.illuminatedZones,
                      [zone.key]: !isEnabled,
                    },
                  })
                }
                className={`p-2 rounded-xl text-center border font-bold transition-all cursor-pointer ${
                  isEnabled
                    ? "bg-amber-200/80 border-amber-400 text-amber-900 shadow-sm"
                    : "bg-white/40 border-amber-200/60 text-amber-600"
                }`}
              >
                <span>{zone.emoji}</span> <span>{zone.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
