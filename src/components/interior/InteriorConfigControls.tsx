/**
 * ============================================================================
 * INTERIOR CONFIG CONTROLS — RIGHT SIDEBAR
 * ============================================================================
 * 10 stepper selectors with < ▸ Value ▸ > navigation + interactive info modal,
 * color palette swatches, and RESET functionality.
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
import { X, Info, Sparkles, CheckCircle2 } from "lucide-react";

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

  const selections = useInteriorDashboardConfigStore((s) => s.selections);
  const interiorColor = useInteriorDashboardConfigStore((s) => s.interiorColor);
  const cycleOption = useInteriorDashboardConfigStore((s) => s.cycleOption);
  const setColor = useInteriorDashboardConfigStore((s) => s.setColor);
  const reset = useInteriorDashboardConfigStore((s) => s.reset);

  return (
    <div className="idash-panel-right">
      {/* Header */}
      <div className="idash-config-header">
        <span className="idash-section-title">INTERIOR CONFIGURATION</span>
        <button className="idash-reset-btn" onClick={reset} type="button">
          ⟲ RESET
        </button>
      </div>

      {/* 10 Stepper Rows */}
      <div className="idash-controls-list">
        {FEATURE_ORDER.map((key) => {
          const config = CONFIG_OPTIONS[key];
          const currentLabel = getSelectedOptionLabel(key, selections);
          return (
            <div key={key} className="idash-control-row">
              <span className="idash-control-label">{config.label}</span>
              <div className="idash-stepper">
                <button
                  className="idash-step-btn"
                  onClick={() => cycleOption(key, -1)}
                  aria-label={`Previous ${config.label}`}
                  type="button"
                >
                  ‹
                </button>
                <span className="idash-step-value">{currentLabel}</span>
                <button
                  className="idash-step-btn"
                  onClick={() => cycleOption(key, 1)}
                  aria-label={`Next ${config.label}`}
                  type="button"
                >
                  ›
                </button>
                <button
                  className="idash-info-btn"
                  onClick={() => setSelectedInfoKey(key)}
                  aria-label={`Info about ${config.label}`}
                  type="button"
                  title="View engineering rationale"
                >
                  ⓘ
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Palette */}
      <div className="idash-color-section">
        <div className="flex items-center justify-between mb-2">
          <div className="idash-section-title" style={{ margin: 0 }}>
            INTERIOR COLOR
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
            {interiorColor}
          </span>
        </div>
        <div className="idash-color-swatches flex items-center flex-wrap gap-2">
          {INTERIOR_COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch.hex}
              type="button"
              className={`idash-swatch ${interiorColor.toLowerCase() === swatch.hex.toLowerCase() ? "active" : ""}`}
              style={{ backgroundColor: swatch.hex }}
              onClick={() => setColor(swatch.hex)}
              title={swatch.name}
              aria-label={`Select ${swatch.name} color`}
            />
          ))}

          {/* Bespoke Custom Color Picker */}
          <label
            className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 cursor-pointer transition-all ${
              !INTERIOR_COLOR_SWATCHES.some(
                (s) => s.hex.toLowerCase() === interiorColor.toLowerCase()
              )
                ? "border-cyan-400 scale-110 shadow-lg shadow-cyan-500/40"
                : "border-amber-700/30 hover:border-amber-500/30"
            }`}
            style={{
              background:
                "conic-gradient(from 180deg at 50% 50%, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
            }}
            title="Custom Hex Color Picker"
          >
            <input
              type="color"
              value={interiorColor}
              onChange={(e) => setColor(e.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              aria-label="Custom color picker"
            />
            <span className="text-[10px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] pointer-events-none">
              +
            </span>
          </label>
        </div>
      </div>

      {/* Info Popover Modal */}
      {selectedInfoKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-amber-900/50 border border-amber-700/30 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-3.5">
            <div className="flex items-start justify-between">
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
                className="text-amber-200/60 hover:text-white p-1 rounded-lg hover:bg-amber-800/35 transition-colors"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-amber-100/80 leading-relaxed">
              {FEATURE_EXPLANATIONS[selectedInfoKey].desc}
            </p>

            <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles size={15} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-200/90 leading-snug">
                <strong className="text-amber-300">Engineering ProTip: </strong>
                {FEATURE_EXPLANATIONS[selectedInfoKey].proTip}
              </p>
            </div>

            <div className="text-right pt-1">
              <button
                onClick={() => setSelectedInfoKey(null)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
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
