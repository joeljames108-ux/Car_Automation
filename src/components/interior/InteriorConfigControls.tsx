/**
 * ============================================================================
 * INTERIOR CONFIG CONTROLS — VISUAL CARD & TILE STUDIO
 * ============================================================================
 * Transforms the 10 interior options into the rich, elegant visual card & tile
 * grid style of Photo 2:
 * 1. Steering Wheel Architecture & Controls
 * 2. Dashboard Layout & Upper Pad Leather Swatches
 * 3. Driver Instrument Cluster Binnacle
 * 4. Central Infotainment Display
 * 5. Decorative Trim Spear Inlays
 * 6. Multi-Zone Ambient Illumination
 * 7. Seating Architecture & Ergonomics
 * 8. Seat Upholstery Materials
 * 9. Digital Infotainment & Telematics Suite
 * 10. Climate Control & Thermal Management
 * ============================================================================
 */

import React, { useState } from "react";
import {
  useInteriorDashboardConfigStore,
  CONFIG_OPTIONS,
  INTERIOR_COLOR_SWATCHES,
  type FeatureKey,
} from "../../state/interiorDashboardConfigStore";
import {
  X,
  Info,
  Sparkles,
  RotateCcw,
  Palette,
  Compass,
  SlidersHorizontal,
  Sofa,
  Check,
} from "lucide-react";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";

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

/** Rich engineering & aesthetic subtitles matching Photo 2's detailed typography */
const OPTION_SUBTITLES: Record<FeatureKey, string[]> = {
  dashboardLayout: [
    "Vintage dual-cowl architecture • 22 kg",
    "Angled center stack & cowl • 18 kg",
    "Horizontal cantilever spar • 14 kg",
  ],
  instrumentCluster: [
    "Dual chronometer needle gauges • 4 kg",
    "Center TFT with analog bezel • 3 kg",
    "High-contrast reconfigurable OLED • 2 kg",
  ],
  centerDisplay: [
    "Classic DIN radio receiver • 2 kg",
    "Capacitive touch telematics • 3 kg",
    "Curved ultra-wide display • 4 kg",
  ],
  steeringWheel: [
    "Stainless 3-spoke vintage wood • 3 kg",
    "Contoured Nappa & flat-bottom • 3 kg",
    "Open-top GT3 motorsport yoke • 2 kg",
  ],
  seatType: [
    "Plush dual-density foam • 30 kg",
    "Deep lateral thigh & torso support • 24 kg",
    "Autoclaved monocoque shell • 14 kg",
  ],
  seatMaterial: [
    "High-durability ballistic textile • 4 kg",
    "Ventilated semi-aniline hide • 6 kg",
    "Motorsport suede & matte carbon • 3 kg",
  ],
  interiorTrim: [
    "Satin impact-resistant composite • 3 kg",
    "CNC machined aerospace aluminum • 3 kg",
    "3K twill high-gloss lacquer • 1 kg",
    "Natural open-pore architectural wood • 4 kg",
  ],
  ambientLighting: [
    "Warm halogen filament bulbs • 1 kg",
    "Dynamic 64-color fiber-optic piping • 2 kg",
  ],
  infotainmentSystem: [
    "4-speaker AM/FM audio package • 4 kg",
    "Cloud GPS & live traffic routing • 5 kg",
    "Apex AI neural voice & telemetry • 6 kg",
  ],
  climateControl: [
    "Rotary 3-dial mechanical heater/AC • 3 kg",
    "Digital climate with independent zones • 5 kg",
    "Multi-sensor air purification & 4-zone HVAC • 7 kg",
  ],
};

export interface InteriorConfigControlsProps {
  theme?: "dark" | "amber";
  className?: string;
}

export const InteriorConfigControls: React.FC<InteriorConfigControlsProps> = ({
  theme = "amber",
  className,
}) => {
  const isDark = theme === "dark";
  const [selectedInfoKey, setSelectedInfoKey] = useState<FeatureKey | null>(null);
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"all" | "steering" | "dashboard" | "seats">("all");

  const selections = useInteriorDashboardConfigStore((s) => s.selections);
  const interiorColor = useInteriorDashboardConfigStore((s) => s.interiorColor);
  const setOption = useInteriorDashboardConfigStore((s) => s.setOption);
  const setColor = useInteriorDashboardConfigStore((s) => s.setColor);
  const reset = useInteriorDashboardConfigStore((s) => s.reset);
  const steeringStripe = useInteriorDashboardConfigStore((s) => s.steeringStripe);
  const setSteeringStripe = useInteriorDashboardConfigStore((s) => s.setSteeringStripe);

  const handleSelect = (key: FeatureKey, idx: number) => {
    playHMIClickSound();
    setOption(key, idx);
  };

  const handleReset = () => {
    playHMIClickSound();
    reset();
  };

  /** Helper to render a feature section in Photo 2's card/tile grid style */
  const renderFeatureSection = (
    key: FeatureKey,
    sectionNum: number,
    headingTitle: string,
    cols: string = "grid-cols-2"
  ) => {
    const config = CONFIG_OPTIONS[key];
    const currentIdx = selections[key] ?? 0;
    const subtitles = OPTION_SUBTITLES[key] || [];

    return (
      <div key={key} className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? "text-slate-300" : "text-stone-700"
            }`}
          >
            <span>
              {sectionNum}. {headingTitle}
            </span>
          </label>
          <button
            type="button"
            onClick={() => setSelectedInfoKey(key)}
            className={`p-1 rounded-md transition-colors cursor-pointer text-xs ${
              isDark
                ? "text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                : "text-stone-400 hover:text-stone-800 hover:bg-stone-200/60"
            }`}
            title={`Engineering details for ${config.label}`}
            aria-label={`Info about ${config.label}`}
          >
            <Info size={13} />
          </button>
        </div>

        <div className={`grid ${cols} gap-1.5`}>
          {config.options.map((opt, idx) => {
            const isSelected = currentIdx === idx;
            const subtitle = subtitles[idx] || "";
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(key, idx)}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? isDark
                      ? "bg-red-600/20 border-red-500 text-white shadow-sm ring-1 ring-red-500"
                      : "bg-red-50/90 border-red-400 text-stone-900 shadow-sm ring-1 ring-red-400"
                    : isDark
                    ? "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/60 hover:border-slate-600"
                    : "bg-white/80 border-stone-200/90 text-stone-800 hover:bg-white hover:border-stone-400 hover:shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="text-[11px] font-black tracking-tight leading-snug">
                    {opt.label}
                  </div>
                  {isSelected && (
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                        isDark
                          ? "bg-red-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      <Check size={9} strokeWidth={3} />
                    </div>
                  )}
                </div>
                {subtitle && (
                  <div
                    className={`text-[9px] leading-tight mt-0.5 ${
                      isSelected
                        ? isDark
                          ? "text-red-300"
                          : "text-red-700/80 font-medium"
                        : isDark
                        ? "text-slate-400"
                        : "text-stone-500"
                    }`}
                  >
                    {subtitle}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`w-full flex flex-col gap-4 select-none ${
        className
          ? className
          : isDark
          ? "bg-slate-900/95 text-slate-100 p-4 rounded-2xl border border-slate-800 shadow-2xl"
          : "bg-[#fffbf2]/90 text-stone-900 p-4 rounded-2xl border border-stone-200 shadow-sm backdrop-blur-md"
      }`}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* MASTER HEADER BAR: TITLE, FILTER TABS & RESET                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 pb-3 border-b ${
          isDark ? "border-slate-800" : "border-stone-200"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isDark ? "bg-red-500" : "bg-red-500"
            } animate-pulse`}
          />
          <div>
            <h2
              className={`text-xs font-black tracking-widest uppercase font-mono ${
                isDark ? "text-slate-100" : "text-stone-900"
              }`}
            >
              INTERIOR CONFIGURATION
            </h2>
            <p
              className={`text-[10px] ${
                isDark ? "text-slate-400" : "text-stone-500"
              }`}
            >
              Visual 1-click architecture tiles • Real-time CAD and physics sync
            </p>
          </div>
        </div>

        {/* Quick Filter Navigation Tabs */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border ${
            isDark
              ? "bg-slate-800/80 border-slate-700/80"
              : "bg-stone-100/90 border-stone-200"
          }`}
        >
          {(
            [
              { id: "all", label: "ALL (10)" },
              { id: "steering", label: "STEERING" },
              { id: "dashboard", label: "DASHBOARD" },
              { id: "seats", label: "SEATS & CABIN" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                playHMIClickSound();
                setActiveTab(t.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                activeTab === t.id
                  ? isDark
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-red-500 text-white shadow-xs"
                  : isDark
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          type="button"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer border ${
            isDark
              ? "bg-slate-800/90 hover:bg-red-950/40 text-slate-300 hover:text-red-300 border-slate-700 hover:border-red-500/40"
              : "bg-white hover:bg-red-50 text-stone-700 hover:text-red-700 border-stone-300 hover:border-red-400"
          }`}
          title="Reset all 10 options to factory baseline defaults"
        >
          <RotateCcw size={12} />
          <span>RESET</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3-COLUMN VISUAL CARDS (PHOTO 2 STYLE)                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
        {/* =========================================================== */}
        {/* CARD 1: ALL OPTIONS RELATED TO STEERING                     */}
        {/* =========================================================== */}
        {(activeTab === "all" || activeTab === "steering") && (
          <div
            className={`flex flex-col gap-4 p-4 rounded-2xl border transition-all ${
              isDark
                ? "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                : "bg-white/90 border-stone-200/90 shadow-sm hover:border-stone-300"
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between pb-2 border-b ${
                isDark ? "border-slate-800" : "border-stone-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    isDark
                      ? "bg-red-500/20 text-red-400"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  <Compass size={16} />
                </div>
                <div>
                  <h3
                    className={`text-xs font-black tracking-wider uppercase ${
                      isDark ? "text-slate-100" : "text-stone-900"
                    }`}
                  >
                    ALL OPTIONS RELATED TO STEERING
                  </h3>
                  <p
                    className={`text-[10px] ${
                      isDark ? "text-slate-400" : "text-stone-500"
                    }`}
                  >
                    3 Wheel shapes, tactile rim materials & racing stripe
                  </p>
                </div>
              </div>
            </div>

            {/* 1. Steering Wheel Architecture */}
            {renderFeatureSection(
              "steeringWheel",
              1,
              "STEERING WHEEL ARCHITECTURE",
              "grid-cols-1 sm:grid-cols-2"
            )}

            {/* 2. 12 O'Clock Racing Center Stripe */}
            <div className="space-y-1.5 pt-1">
              <label
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? "text-slate-300" : "text-stone-700"
                }`}
              >
                2. 12 O'Clock Racing Center Stripe
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["none", "red", "yellow", "blue", "white", "green"] as const).map(
                  (col) => {
                    const isStripeActive = steeringStripe === col;
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => {
                          playHMIClickSound();
                          setSteeringStripe(col);
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                          isStripeActive
                            ? isDark
                              ? "bg-slate-700 border-red-500 text-white ring-1 ring-red-400"
                              : "bg-red-50 border-red-400 text-red-700 ring-1 ring-red-400 font-black"
                            : isDark
                            ? "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50"
                            : "bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200/70"
                        }`}
                      >
                        {col}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================== */}
        {/* CARD 2: DASHBOARD CONFIGURATIONS                            */}
        {/* =========================================================== */}
        {(activeTab === "all" || activeTab === "dashboard") && (
          <div
            className={`flex flex-col gap-4 p-4 rounded-2xl border transition-all ${
              isDark
                ? "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                : "bg-white/90 border-stone-200/90 shadow-sm hover:border-stone-300"
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between pb-2 border-b ${
                isDark ? "border-slate-800" : "border-stone-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    isDark
                      ? "bg-red-500/20 text-red-400"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  <SlidersHorizontal size={16} />
                </div>
                <div>
                  <h3
                    className={`text-xs font-black tracking-wider uppercase ${
                      isDark ? "text-slate-100" : "text-stone-900"
                    }`}
                  >
                    DASHBOARD CONFIGURATIONS
                  </h3>
                  <p
                    className={`text-[10px] ${
                      isDark ? "text-slate-400" : "text-stone-500"
                    }`}
                  >
                    Pad leather, 4 trims, binnacles, layout & ambient illumination
                  </p>
                </div>
              </div>
            </div>

            {/* 1. Upper Dashboard Pad Nappa Leather Swatches */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? "text-slate-300" : "text-stone-700"
                  }`}
                >
                  1. Upper Dashboard Pad Nappa Leather
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomPicker(!showCustomPicker)}
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all border ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                      : "bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200"
                  }`}
                >
                  <Palette size={11} />
                  <span>{showCustomPicker ? "Presets" : "+ Custom"}</span>
                </button>
              </div>

              {showCustomPicker ? (
                <div
                  className={`flex items-center gap-3 p-2 rounded-xl border animate-in fade-in duration-150 ${
                    isDark
                      ? "bg-slate-800/80 border-red-500/30"
                      : "bg-stone-50 border-red-200"
                  }`}
                >
                  <input
                    type="color"
                    value={interiorColor}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 outline-none p-0"
                    title="Pick Bespoke Hex Color"
                  />
                  <div className="flex flex-col">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isDark ? "text-red-400" : "text-stone-900"
                      }`}
                    >
                      {interiorColor.toUpperCase()}
                    </span>
                    <span
                      className={`text-[9px] ${
                        isDark ? "text-slate-400" : "text-stone-500"
                      }`}
                    >
                      Custom PBR Leather Finish
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  {INTERIOR_COLOR_SWATCHES.map((swatch) => {
                    const isSelected =
                      interiorColor.toLowerCase() === swatch.hex.toLowerCase();
                    return (
                      <button
                        key={swatch.hex}
                        type="button"
                        className={`w-7 h-7 rounded-full cursor-pointer transition-all duration-200 border-2 shadow-sm ${
                          isSelected
                            ? isDark
                              ? "border-white ring-2 ring-red-500 ring-offset-2 ring-offset-slate-900 scale-110 shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                              : "border-white ring-2 ring-red-500 ring-offset-2 ring-offset-white scale-110 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                            : isDark
                            ? "border-slate-700 hover:border-red-400/50 hover:scale-105"
                            : "border-stone-300 hover:border-red-400 hover:scale-105"
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                        onClick={() => {
                          playHMIClickSound();
                          setColor(swatch.hex);
                        }}
                        title={swatch.name}
                        aria-label={`Select ${swatch.name} color`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Main Decorative Trim Spear */}
            {renderFeatureSection(
              "interiorTrim",
              2,
              "MAIN DECORATIVE TRIM SPEAR",
              "grid-cols-1 sm:grid-cols-2"
            )}

            {/* 3. Dashboard Architectural Layout */}
            {renderFeatureSection(
              "dashboardLayout",
              3,
              "DASHBOARD ARCHITECTURAL LAYOUT",
              "grid-cols-1 sm:grid-cols-3"
            )}

            {/* 4. Driver Instrument Cluster Binnacle */}
            {renderFeatureSection(
              "instrumentCluster",
              4,
              "DRIVER INSTRUMENT CLUSTER & HUD",
              "grid-cols-1 sm:grid-cols-3"
            )}

            {/* 5. Multi-Zone Ambient Illumination */}
            {renderFeatureSection(
              "ambientLighting",
              5,
              "MULTI-ZONE FIBER-OPTIC AMBIENT LIGHTING",
              "grid-cols-1 sm:grid-cols-2"
            )}
          </div>
        )}

        {/* =========================================================== */}
        {/* CARD 3: CONSOLE, SEATS & COCKPIT CONFIGURE                  */}
        {/* =========================================================== */}
        {(activeTab === "all" || activeTab === "seats") && (
          <div
            className={`flex flex-col gap-4 p-4 rounded-2xl border transition-all ${
              isDark
                ? "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                : "bg-white/90 border-stone-200/90 shadow-sm hover:border-stone-300"
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between pb-2 border-b ${
                isDark ? "border-slate-800" : "border-stone-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    isDark
                      ? "bg-red-500/20 text-red-400"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  <Sofa size={16} />
                </div>
                <div>
                  <h3
                    className={`text-xs font-black tracking-wider uppercase ${
                      isDark ? "text-slate-100" : "text-stone-900"
                    }`}
                  >
                    CONSOLE, SEATS & COCKPIT CONFIGURE
                  </h3>
                  <p
                    className={`text-[10px] ${
                      isDark ? "text-slate-400" : "text-stone-500"
                    }`}
                  >
                    Ergonomic seats, upholstery hide, center screen, audio & HVAC
                  </p>
                </div>
              </div>
            </div>

            {/* 1. Seating Architecture & Bolstering */}
            {renderFeatureSection(
              "seatType",
              1,
              "SEATING ARCHITECTURE & BOLSTERING",
              "grid-cols-1 sm:grid-cols-3"
            )}

            {/* 2. Seat Upholstery & Contact Materials */}
            {renderFeatureSection(
              "seatMaterial",
              2,
              "SEAT UPHOLSTERY & CONTACT MATERIALS",
              "grid-cols-1 sm:grid-cols-3"
            )}

            {/* 3. Central Display & Touchscreen */}
            {renderFeatureSection(
              "centerDisplay",
              3,
              "CENTRAL DISPLAY & TOUCHSCREEN",
              "grid-cols-1 sm:grid-cols-3"
            )}

            {/* 4. Digital Infotainment & Telematics */}
            {renderFeatureSection(
              "infotainmentSystem",
              4,
              "DIGITAL INFOTAINMENT & TELEMATICS",
              "grid-cols-1 sm:grid-cols-3"
            )}

            {/* 5. Climate Control & Thermal HVAC */}
            {renderFeatureSection(
              "climateControl",
              5,
              "CLIMATE CONTROL & THERMAL HVAC",
              "grid-cols-1 sm:grid-cols-3"
            )}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ENGINEERING RATIONALE & PRO-TIP POPOVER MODAL                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedInfoKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div
            className={`rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-3.5 border ${
              isDark
                ? "bg-slate-900/95 border-red-500/40"
                : "bg-white border-stone-300 shadow-xl"
            }`}
          >
            <div
              className={`flex items-start justify-between pb-2 border-b ${
                isDark ? "border-slate-800" : "border-stone-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg ${
                    isDark
                      ? "bg-red-500/20 text-red-400"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  <Info size={16} />
                </div>
                <h3
                  className={`font-bold text-sm ${
                    isDark ? "text-slate-100" : "text-stone-900"
                  }`}
                >
                  {FEATURE_EXPLANATIONS[selectedInfoKey]?.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInfoKey(null)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-stone-400 hover:text-stone-800 hover:bg-stone-100"
                }`}
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            <p
              className={`text-xs leading-relaxed ${
                isDark ? "text-slate-300" : "text-stone-700"
              }`}
            >
              {FEATURE_EXPLANATIONS[selectedInfoKey]?.desc}
            </p>

            <div
              className={`rounded-xl p-3 flex items-start gap-2.5 shadow-inner border ${
                isDark
                  ? "bg-slate-800/80 border-slate-700/60"
                  : "bg-red-50/60 border-red-200/60"
              }`}
            >
              <Sparkles
                size={15}
                className={`shrink-0 mt-0.5 ${
                  isDark ? "text-red-400" : "text-red-500"
                }`}
              />
              <p
                className={`text-[11px] leading-snug ${
                  isDark ? "text-slate-300" : "text-stone-700"
                }`}
              >
                <strong
                  className={`font-bold ${
                    isDark ? "text-red-400" : "text-red-600"
                  }`}
                >
                  ProTip:{" "}
                </strong>
                {FEATURE_EXPLANATIONS[selectedInfoKey]?.proTip}
              </p>
            </div>

            <div className="text-right pt-1">
              <button
                onClick={() => setSelectedInfoKey(null)}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                  isDark
                    ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/20"
                    : "bg-red-600 hover:bg-red-500 text-white shadow-red-500/20"
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
