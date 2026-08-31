/**
 * ============================================================================
 * INTERIOR CONFIG CONTROLS — RIGHT SIDEBAR
 * ============================================================================
 * 10 stepper selectors with < ▸ Value ▸ > navigation + interactive info modal,
 * color palette swatches + custom hex color wheel, and RESET functionality.
 * ============================================================================
 */

import React, { useState } from "react";
import {
  useInteriorDashboardConfigStore,
  CONFIG_OPTIONS,
  INTERIOR_COLOR_SWATCHES,
  getSelectedOptionLabel,
  type FeatureKey,
} from "../../state/interiorDashboardConfigStore";
import { X, Info, Sparkles, RotateCcw, Palette } from "lucide-react";

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

export const InteriorConfigControls: React.FC = () => {
  const [selectedInfoKey, setSelectedInfoKey] = useState<FeatureKey | null>(null);
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  const selections = useInteriorDashboardConfigStore((s) => s.selections);
  const interiorColor = useInteriorDashboardConfigStore((s) => s.interiorColor);
  const cycleOption = useInteriorDashboardConfigStore((s) => s.cycleOption);
  const setColor = useInteriorDashboardConfigStore((s) => s.setColor);
  const reset = useInteriorDashboardConfigStore((s) => s.reset);

  return (
    <div className="idash-panel-right bg-[#0d121f] text-slate-100 border-l border-amber-800/30 p-4 flex flex-col gap-3 overflow-y-auto w-[340px] flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-amber-800/30/80">
        <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          INTERIOR CONFIGURATION
        </span>
        <button
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-900/40 hover:bg-red-600/80 text-amber-100 hover:text-amber-50 border border-amber-700/30 hover:border-red-500 text-[11px] font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
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
              className="flex items-center justify-between p-2 rounded-xl bg-amber-950/80/90 hover:bg-amber-900/40/90 border border-amber-800/30 hover:border-cyan-500/50 transition-all shadow-sm group"
            >
              <span className="text-xs font-bold text-white tracking-tight flex-1 pr-2 truncate">
                {config.label}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  className="w-7 h-7 rounded-lg bg-amber-900/40 hover:bg-blue-600 active:bg-blue-700 border border-amber-700/30 hover:border-cyan-400 text-white font-extrabold text-base flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer"
                  onClick={() => cycleOption(key, -1)}
                  aria-label={`Previous ${config.label}`}
                  type="button"
                >
                  ‹
                </button>
                <span className="text-xs font-mono font-bold text-cyan-300 min-w-[105px] max-w-[110px] text-center px-1 truncate drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]">
                  {currentLabel}
                </span>
                <button
                  className="w-7 h-7 rounded-lg bg-amber-900/40 hover:bg-blue-600 active:bg-blue-700 border border-amber-700/30 hover:border-cyan-400 text-white font-extrabold text-base flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer"
                  onClick={() => cycleOption(key, 1)}
                  aria-label={`Next ${config.label}`}
                  type="button"
                >
                  ›
                </button>
                <button
                  className="w-6 h-6 rounded-lg text-amber-300/70 hover:text-cyan-300 hover:bg-amber-900/40 transition-all flex items-center justify-center cursor-pointer text-xs"
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
      <div className="mt-2 pt-2 border-t border-amber-800/30/80 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
            CABIN UPHOLSTERY COLOR
          </span>
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600/50 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 cursor-pointer transition-all"
          >
            <Palette size={11} />
            <span>{showCustomPicker ? "Presets" : "+ Custom"}</span>
          </button>
        </div>

        {showCustomPicker ? (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-950/80 border border-cyan-500/40 animate-in fade-in duration-150">
            <input
              type="color"
              value={interiorColor}
              onChange={(e) => setColor(e.target.value)}
              className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0 outline-none p-0"
              title="Pick Bespoke Hex Color"
            />
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-white">{interiorColor.toUpperCase()}</span>
              <span className="text-[10px] text-amber-300/70">Custom PBR Leather Finish</span>
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
                      ? "border-white ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-110 shadow-[0_0_12px_rgba(0,229,255,0.6)]"
                      : "border-amber-700/30/60 hover:border-slate-400 hover:scale-105"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-amber-950/80 border border-cyan-500/40 rounded-2xl p-5 max-w-sm w-full shadow-[0_0_40px_rgba(0,0,0,0.9)] space-y-3.5">
            <div className="flex items-start justify-between border-b border-amber-800/30 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-cyan-400">
                  <Info size={16} />
                </div>
                <h3 className="font-bold text-white text-sm">
                  {FEATURE_EXPLANATIONS[selectedInfoKey].title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInfoKey(null)}
                className="text-amber-300/70 hover:text-amber-50 p-1 rounded-lg hover:bg-amber-900/40 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-amber-100 leading-relaxed">
              {FEATURE_EXPLANATIONS[selectedInfoKey].desc}
            </p>

            <div className="bg-blue-950/50 border border-blue-800/60 rounded-xl p-3 flex items-start gap-2.5 shadow-inner">
              <Sparkles size={15} className="text-cyan-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-100 leading-snug">
                <strong className="text-cyan-300">Engineering ProTip: </strong>
                {FEATURE_EXPLANATIONS[selectedInfoKey].proTip}
              </p>
            </div>

            <div className="text-right pt-1">
              <button
                onClick={() => setSelectedInfoKey(null)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 cursor-pointer"
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
