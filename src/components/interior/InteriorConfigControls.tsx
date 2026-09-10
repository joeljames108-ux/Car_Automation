/**
 * ============================================================================
 * INTERIOR CONFIG CONTROLS — RIGHT SIDEBAR
 * ============================================================================
 * 10 stepper selectors with < ▸ Value ▸ > navigation + interactive info modal,
 * color palette swatches + custom hex color wheel, and RESET functionality.
 * ============================================================================
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  useInteriorDashboardConfigStore,
  CONFIG_OPTIONS,
  INTERIOR_COLOR_SWATCHES,
  getSelectedOptionLabel,
  type FeatureKey,
} from "../../state/interiorDashboardConfigStore";
import { X, Info, Sparkles, RotateCcw, Palette, Layers } from "lucide-react";
import { MaterialTexturePreview, MATERIAL_LABELS, MATERIAL_WEIGHTS, type MaterialTextureType } from "./MaterialTexturePreview";
import AnimatedStepperValue from "./AnimatedStepperValue";

const FEATURE_ORDER: FeatureKey[] = [
  "dashboardLayout",
  "instrumentCluster",
  "centerDisplay",
  "steeringWheel",
  "seatType",
  "seatMaterial",
  "interiorTrim",
  "ambientLighting",
  "infotainmentSystem",
  "climateControl",
];

const FEATURE_EXPLANATIONS: Record<
  FeatureKey,
  { title: string; desc: string; proTip: string }
> = {
  dashboardLayout: {
    title: "Dashboard Architectural Layout",
    desc: "Governs primary cockpit packaging volume, driver sightlines, and cowl geometry.",
    proTip: "Driver Focused reduces driver reach distance to secondary controls by 18%.",
  },
  instrumentCluster: {
    title: "Driver Instrument Cluster Binnacle",
    desc: "Controls gauge telemetry presentation (Analog dials vs Virtual OLED screen vs Windshield HUD).",
    proTip: "Holographic HUD reduces driver glance time away from road to under 0.25 seconds.",
  },
  centerDisplay: {
    title: "Central Infotainment Touchscreen",
    desc: "Determines central display diagonal size, HMI graphics, and navigation telematics.",
    proTip: "12-inch widescreen maximizes split-screen telemetry and lap timer view.",
  },
  steeringWheel: {
    title: "Steering Wheel Typology & Grips",
    desc: "Sets rim geometry, spoke count, paddle shifters, and tactile thumb controls.",
    proTip: "Formula Yoke maximizes forward cluster visibility and reduces mass by 1.8 kg.",
  },
  seatType: {
    title: "Driver & Passenger Seating Ergonomics",
    desc: "Configures bolster depth, lumbar adjustability, and lateral G-force support.",
    proTip: "Racing Buckets lock the driver into the chassis for precise vehicle yaw feedback.",
  },
  seatMaterial: {
    title: "Upholstery & Contact Materials",
    desc: "Sets tactile feel, thermal conductivity, breathability, and weight.",
    proTip: "Alcantara provides 35% higher friction coefficient than smooth leather.",
  },
  interiorTrim: {
    title: "Fascia Inlay & Structural Accents",
    desc: "Decorative dash spears and console trims (Carbon Fiber, Walnut, Aluminum, Piano Black).",
    proTip: "Dry Carbon trim reduces dashboard subassembly weight by 3.2 kg.",
  },
  ambientLighting: {
    title: "Multi-Zone Fiber-Optic Ambient Illumination",
    desc: "Multi-channel LED piping illuminating the dash contour, footwells, and center console.",
    proTip: "Ambient illumination enhances nighttime cockpit depth perception.",
  },
  infotainmentSystem: {
    title: "Digital Audio & Telematics OS",
    desc: "Processing unit for GPS navigation, Apex AI telemetry, and wireless smartphone integration.",
    proTip: "Apex AI Studio runs live vehicle diagnostics and predictive lap time optimizer.",
  },
  climateControl: {
    title: "HVAC & Thermal Management System",
    desc: "Cabin heating, ventilation, air conditioning compressor, and multi-zone climate sensors.",
    proTip: "Dual-Zone climate maintains independent driver and passenger thermal comfort.",
  },
};

export interface InteriorConfigControlsProps {
  theme?: 'dark' | 'amber';
  className?: string;
}

export const InteriorConfigControls: React.FC<InteriorConfigControlsProps> = ({ theme = 'amber', className }) => {
  const isDark = theme === 'dark';
  const [selectedInfoKey, setSelectedInfoKey] = useState<FeatureKey | null>(null);
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  const selections = useInteriorDashboardConfigStore((s) => s.selections);
  const interiorColor = useInteriorDashboardConfigStore((s) => s.interiorColor);
  const cycleOption = useInteriorDashboardConfigStore((s) => s.cycleOption);
  const setColor = useInteriorDashboardConfigStore((s) => s.setColor);
  const reset = useInteriorDashboardConfigStore((s) => s.reset);

  // Map seatMaterial and interiorTrim selections to texture types
  const seatMaterialLabel = getSelectedOptionLabel("seatMaterial", selections).toLowerCase();
  const trimLabel = getSelectedOptionLabel("interiorTrim", selections).toLowerCase();

  const getSeatMaterialType = (): MaterialTextureType => {
    if (seatMaterialLabel.includes("alcantara")) return "alcantara";
    if (seatMaterialLabel.includes("cloth")) return "cloth";
    return "leather";
  };

  const getTrimMaterialType = (): MaterialTextureType => {
    if (trimLabel.includes("carbon")) return "carbon";
    if (trimLabel.includes("wood")) return "wood";
    if (trimLabel.includes("aluminum")) return "aluminum";
    return "piano_black";
  };

  const seatMatType = getSeatMaterialType();
  const trimMatType = getTrimMaterialType();

  // Animation tracking
  const [stepperDirs, setStepperDirs] = useState<Record<string, number>>({});
  const [stepperCnts, setStepperCnts] = useState<Record<string, number>>({});

  const handleCycle = useCallback((key: FeatureKey, dir: 1 | -1) => {
    cycleOption(key, dir);
    var nd = Object.assign({}, stepperDirs); nd[key] = dir; setStepperDirs(nd);
    var nc = Object.assign({}, stepperCnts); nc[key] = (nc[key] || 0) + 1; setStepperCnts(nc);
  }, [cycleOption, stepperDirs, stepperCnts]);

  return (
    <div
      className={`idash-panel-right backdrop-blur-2xl p-3.5 flex flex-col gap-2.5 overflow-y-auto w-full h-full min-w-0 select-none ${
        className
          ? className
          : isDark
          ? "bg-slate-900/90 border-l border-slate-800 text-slate-100 shadow-2xl"
          : "bg-amber-50/80 border-l border-white/10 text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between pb-1 border-b ${isDark ? "border-slate-800" : "border-white/10"}`}>
        <span className={`text-[12px] font-black tracking-widest uppercase flex items-center gap-1.5 ${isDark ? "text-cyan-400" : "text-amber-700"}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-cyan-400" : "bg-amber-400"} animate-pulse`} />
          INTERIOR CONFIGURATION
        </span>
        <button
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer border ${
            isDark
              ? "bg-slate-800/80 hover:bg-red-900/40 text-slate-300 hover:text-red-300 border-slate-700 hover:border-red-500/40"
              : "bg-amber-100/60 hover:bg-red-100/40 text-amber-800 hover:text-amber-900 border-amber-700/30 hover:border-red-400/30"
          }`}
          onClick={reset}
          type="button"
          title="Reset to Baseline Factory Defaults"
        >
          <RotateCcw size={12} />
          <span>RESET</span>
        </button>
      </div>

      {/* 10 Stepper Rows */}
      <div className="flex flex-col gap-2">
        {FEATURE_ORDER.map((key) => {
          const config = CONFIG_OPTIONS[key];
          const currentLabel = getSelectedOptionLabel(key, selections);
          return (
            <div
              key={key}
              className={`flex items-center justify-between p-2 rounded-xl transition-all shadow-sm group border ${
                isDark
                  ? "bg-slate-800/60 hover:bg-slate-800/90 border-slate-700/60 hover:border-cyan-500/30"
                  : "bg-amber-100/60 hover:bg-amber-100/50 border-white/[0.06] hover:border-amber-400/20"
              }`}
            >
              <span className={`text-[12px] font-bold tracking-tight flex-1 pr-2 truncate ${isDark ? "text-slate-200" : "text-amber-900"}`}>
                {config.label}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  className={`w-7 h-7 rounded-lg font-extrabold text-base flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer border ${
                    isDark
                      ? "bg-slate-700/80 hover:bg-cyan-600 active:bg-cyan-700 border-slate-600 hover:border-cyan-400 text-slate-200 hover:text-white"
                      : "bg-amber-200/50 hover:bg-amber-300/70 active:bg-amber-400/40 border-amber-300/40 hover:border-amber-400/50 text-amber-800"
                  }`}
                  onClick={() => handleCycle(key, -1)}
                  aria-label={`Previous ${config.label}`}
                  type="button"
                >
                  ‹
                </button>
                <AnimatedStepperValue value={currentLabel} direction={stepperDirs[key] || 1} animKey={String(stepperCnts[key] || 0)} theme={theme} />
                <button
                  className={`w-7 h-7 rounded-lg font-extrabold text-base flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer border ${
                    isDark
                      ? "bg-slate-700/80 hover:bg-cyan-600 active:bg-cyan-700 border-slate-600 hover:border-cyan-400 text-slate-200 hover:text-white"
                      : "bg-amber-200/50 hover:bg-amber-300/70 active:bg-amber-400/40 border-amber-300/40 hover:border-amber-400/50 text-amber-800"
                  }`}
                  onClick={() => handleCycle(key, 1)}
                  aria-label={`Next ${config.label}`}
                  type="button"
                >
                  ›
                </button>
                <button
                  className={`w-6 h-6 rounded-lg transition-all flex items-center justify-center cursor-pointer text-xs ${
                    isDark
                      ? "text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50"
                      : "text-amber-600 hover:text-amber-800 hover:bg-amber-100/40"
                  }`}
                  onClick={() => setSelectedInfoKey(key)}
                  aria-label={`Info about ${config.label}`}
                  type="button"
                  title="View engineering rationale"
                >
                  <Info size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Palette */}
      <div className={`mt-2 pt-2 border-t flex flex-col gap-2 ${isDark ? "border-slate-800" : "border-white/10"}`}>
        <div className="flex items-center justify-between">
          <span className={`text-[12px] font-black tracking-widest uppercase ${isDark ? "text-cyan-400" : "text-amber-700"}`}>
            CABIN UPHOLSTERY COLOR
          </span>
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all border ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-cyan-400/40"
                : "bg-amber-100/40 hover:bg-amber-100/50 text-amber-700 border-white/[0.08] hover:border-amber-400/30"
            }`}
          >
            <Palette size={11} />
            <span>{showCustomPicker ? "Presets" : "+ Custom"}</span>
          </button>
        </div>

        {showCustomPicker ? (
          <div className={`flex items-center gap-3 p-2.5 rounded-xl border animate-in fade-in duration-150 ${
            isDark ? "bg-slate-800/80 border-cyan-500/30" : "bg-amber-100/60 border-amber-400/30"
          }`}>
            <input
              type="color"
              value={interiorColor}
              onChange={(e) => setColor(e.target.value)}
              className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0 outline-none p-0"
              title="Pick Bespoke Hex Color"
            />
            <div className="flex flex-col">
              <span className={`text-xs font-mono font-bold ${isDark ? "text-cyan-300" : "text-amber-900"}`}>{interiorColor.toUpperCase()}</span>
              <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-amber-600"}`}>Custom PBR Leather Finish</span>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {INTERIOR_COLOR_SWATCHES.map((swatch) => {
              const isSelected = interiorColor.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <button
                  key={swatch.hex}
                  type="button"
                  className={`w-8 h-8 rounded-xl cursor-pointer transition-all duration-200 border-2 shadow-sm ${
                    isSelected
                      ? isDark
                        ? "border-white ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 scale-110 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                        : "border-white ring-2 ring-amber-400/60 ring-offset-2 ring-offset-amber-100 scale-110 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                      : isDark
                      ? "border-slate-700 hover:border-cyan-400/40 hover:scale-105"
                      : "border-white/[0.08] hover:border-amber-400/30 hover:scale-105"
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                  onClick={() => setColor(swatch.hex)}
                  title={swatch.name}
                  aria-label={`Select ${swatch.name} color`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Info Popover Modal */}
      {selectedInfoKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className={`rounded-2xl p-5 max-w-sm w-full shadow-[0_0_40px_rgba(0,0,0,0.5)] space-y-3.5 border ${
            isDark ? "bg-slate-900/95 border-cyan-500/40" : "bg-amber-50/95 border-amber-300/50"
          }`}>
            <div className={`flex items-start justify-between pb-2 border-b ${isDark ? "border-slate-700" : "border-amber-800/30"}`}>
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isDark ? "bg-cyan-500/20 text-cyan-400" : "bg-amber-500/20 text-amber-300"}`}>
                  <Info size={16} />
                </div>
                <h3 className={`font-bold text-sm ${isDark ? "text-slate-100" : "text-amber-900"}`}>
                  {FEATURE_EXPLANATIONS[selectedInfoKey].title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInfoKey(null)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-amber-600 hover:text-amber-900 hover:bg-amber-200/60"
                }`}
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-amber-800"}`}>
              {FEATURE_EXPLANATIONS[selectedInfoKey].desc}
            </p>

            <div className={`rounded-xl p-3 flex items-start gap-2.5 shadow-inner border ${
              isDark ? "bg-slate-800/80 border-slate-700/60" : "bg-amber-100/60 border-amber-300/40"
            }`}>
              <Sparkles size={15} className={`shrink-0 mt-0.5 ${isDark ? "text-cyan-400" : "text-amber-400"}`} />
              <p className={`text-[11px] leading-snug ${isDark ? "text-slate-300" : "text-amber-800"}`}>
                <strong className={`font-bold ${isDark ? "text-cyan-300" : "text-amber-700"}`}>ProTip: </strong>
                {FEATURE_EXPLANATIONS[selectedInfoKey].proTip}
              </p>
            </div>

            <div className="text-right pt-1">
              <button
                onClick={() => setSelectedInfoKey(null)}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                  isDark
                    ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20"
                    : "bg-amber-500 hover:bg-amber-400 text-amber-900 shadow-amber-500/20"
                }`}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
