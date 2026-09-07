/**
 * ============================================================================
 * INTERACTIVE DASHBOARD STUDIO — MODULAR CONFIGURATION SYSTEM
 * ============================================================================
 * Implements the exact architectural wireframe from the reference diagram:
 * - Top Window: "WINDOW FOR DIAGRAM" outlined with prominent red accent border,
 *   housing the interactive Three.js 3D cockpit diagram (`dashboard_interactive_master.glb`),
 *   calibrated to the driver eye-level perspective from Image 4.
 * - Bottom Row: 3 Equal-Width Configuration Cards:
 *   1. "ALL OPTIONS RELATED TO STEERING"
 *   2. "DASH BOARD CONFIGURATIONS"
 *   3. "OTHER CONFIGURATIONS"
 *
 * Selecting any option in the 3 cards immediately transforms the 3D GLB model
 * in real-time (mesh swapping, dynamic Canvas screen drawing, PBR shaders).
 * ============================================================================
 */

import React, { useState } from "react";
import {
  Compass,
  Sliders,
  Sparkles,
  Sun,
  Moon,
  Camera,
  CheckCircle2,
  RotateCcw,
  Save,
  Palette,
  Layers,
  Activity,
  Radio,
  Navigation as NavIcon,
  Thermometer,
  Gauge,
  CircleDot,
} from "lucide-react";
import {
  useInteriorDashboardConfigStore,
  type SteeringWheelStyle,
  type SteeringGripMaterial,
  type SteeringStripeStyle,
  type PaddleShifterStyle,
  type DriveModeType,
  type DashboardTrimType,
  type InfotainmentMode,
  type ClusterStyle,
  type ShifterStyle,
  type CameraPose,
} from "../../state/interiorDashboardConfigStore";
import { InteractiveDashboardCanvasViewport } from "./InteractiveDashboardCanvasViewport";
import { useDesign } from "../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";

export const InteractiveDashboardStudio: React.FC = () => {
  const { updateInterior } = useDesign();
  const [saveToast, setSaveToast] = useState(false);

  // Store Selectors
  const steeringWheelStyle = useInteriorDashboardConfigStore((s) => s.steeringWheelStyle);
  const steeringGripMaterial = useInteriorDashboardConfigStore((s) => s.steeringGripMaterial);
  const steeringColor = useInteriorDashboardConfigStore((s) => s.steeringColor);
  const steeringStripe = useInteriorDashboardConfigStore((s) => s.steeringStripe);
  const paddleShifters = useInteriorDashboardConfigStore((s) => s.paddleShifters);
  const driveMode = useInteriorDashboardConfigStore((s) => s.driveMode);

  const upperDashPadColor = useInteriorDashboardConfigStore((s) => s.upperDashPadColor);
  const dashboardTrimMaterial = useInteriorDashboardConfigStore((s) => s.dashboardTrimMaterial);
  const infotainmentMode = useInteriorDashboardConfigStore((s) => s.infotainmentMode);
  const clusterStyle = useInteriorDashboardConfigStore((s) => s.clusterStyle);
  const ambientLightColor = useInteriorDashboardConfigStore((s) => s.ambientLightColor);

  const shifterStyle = useInteriorDashboardConfigStore((s) => s.shifterStyle);
  const stitchingColor = useInteriorDashboardConfigStore((s) => s.stitchingColor);
  const windshieldTint = useInteriorDashboardConfigStore((s) => s.windshieldTint);
  const nightMode = useInteriorDashboardConfigStore((s) => s.nightMode);
  const cameraPose = useInteriorDashboardConfigStore((s) => s.cameraPose);
  const activePanel = useInteriorDashboardConfigStore((s) => s.activePanel);

  // Store Setters
  const setSteeringWheelStyle = useInteriorDashboardConfigStore((s) => s.setSteeringWheelStyle);
  const setSteeringGripMaterial = useInteriorDashboardConfigStore((s) => s.setSteeringGripMaterial);
  const setSteeringColor = useInteriorDashboardConfigStore((s) => s.setSteeringColor);
  const setSteeringStripe = useInteriorDashboardConfigStore((s) => s.setSteeringStripe);
  const setPaddleShifters = useInteriorDashboardConfigStore((s) => s.setPaddleShifters);
  const setDriveMode = useInteriorDashboardConfigStore((s) => s.setDriveMode);

  const setUpperDashPadColor = useInteriorDashboardConfigStore((s) => s.setUpperDashPadColor);
  const setDashboardTrimMaterial = useInteriorDashboardConfigStore((s) => s.setDashboardTrimMaterial);
  const setInfotainmentMode = useInteriorDashboardConfigStore((s) => s.setInfotainmentMode);
  const setClusterStyle = useInteriorDashboardConfigStore((s) => s.setClusterStyle);
  const setAmbientLightColor = useInteriorDashboardConfigStore((s) => s.setAmbientLightColor);

  const setShifterStyle = useInteriorDashboardConfigStore((s) => s.setShifterStyle);
  const setStitchingColor = useInteriorDashboardConfigStore((s) => s.setStitchingColor);
  const setWindshieldTint = useInteriorDashboardConfigStore((s) => s.setWindshieldTint);
  const setNightMode = useInteriorDashboardConfigStore((s) => s.setNightMode);
  const setCameraPose = useInteriorDashboardConfigStore((s) => s.setCameraPose);
  const setActivePanel = useInteriorDashboardConfigStore((s) => s.setActivePanel);
  const resetConfig = useInteriorDashboardConfigStore((s) => s.reset);

  // Apply to vehicle assembly
  const handleApplyConfig = () => {
    playHMITabSound();
    updateInterior({
      steeringWheel: steeringWheelStyle === "yoke" ? "gt_wheel" : "sport",
      dashboardMaterial:
        dashboardTrimMaterial === "carbon"
          ? "carbon_fiber"
          : dashboardTrimMaterial === "walnut"
          ? "wood"
          : "aluminum",
      interiorColor: upperDashPadColor,
      ambientLighting: ambientLightColor !== "none" ? 1 : 0,
      infotainmentSize: 12,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2600);
  };

  const handleReset = () => {
    playHMIClickSound();
    resetConfig();
  };

  return (
    <div className="w-full flex flex-col gap-4 p-3 md:p-5 rounded-2xl bg-slate-950 text-slate-100 font-sans select-none border border-slate-800 shadow-2xl">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP SECTION: "WINDOW FOR DIAGRAM" (Exact Wireframe Box)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full rounded-2xl border-2 border-red-500/90 shadow-[0_0_30px_rgba(239,68,68,0.22)] bg-slate-900/90 overflow-hidden flex flex-col">
        {/* Top Wireframe Diagram Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-red-950/40 border-b border-red-500/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-[0.25em] text-red-400">
              WINDOW FOR DIAGRAM • GRAPHIC OF DASHBOARD
            </span>
          </div>

          {/* Active 3D Component State Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-cyan-300">
              STEERING: {steeringWheelStyle.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-blue-300">
              PAD: {upperDashPadColor}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-amber-300">
              SCREEN: {infotainmentMode.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-emerald-300">
              SHIFTER: {shifterStyle.toUpperCase()}
            </span>
          </div>

          {/* Quick Camera & View Controls */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
              {(
                [
                  { id: "driver", label: "Driver POV (Image 4)", icon: Camera },
                  { id: "center", label: "Infotainment", icon: Activity },
                  { id: "steering", label: "Steering", icon: Compass },
                  { id: "wide", label: "Wide Cockpit", icon: Layers },
                ] as const
              ).map((cam) => {
                const Icon = cam.icon;
                const active = cameraPose === cam.id;
                return (
                  <button
                    key={cam.id}
                    onClick={() => {
                      playHMIClickSound();
                      setCameraPose(cam.id as CameraPose);
                    }}
                    title={cam.label}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      active
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-700/60"
                    }`}
                  >
                    <Icon size={12} />
                    <span className="hidden sm:inline">{cam.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Night / Day Mode */}
            <button
              onClick={() => {
                playHMIClickSound();
                setNightMode(!nightMode);
              }}
              title={nightMode ? "Switch to Day Lighting" : "Switch to Night Lighting"}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                nightMode
                  ? "bg-indigo-900/60 border-indigo-400 text-indigo-300"
                  : "bg-amber-900/40 border-amber-500/50 text-amber-300 hover:bg-amber-800/50"
              }`}
            >
              {nightMode ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>
        </div>

        {/* 3D GLB Viewport Canvas */}
        <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px]">
          <InteractiveDashboardCanvasViewport />

          {/* Toast Notification when Applied */}
          {saveToast && (
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/90 text-white font-bold text-xs backdrop-blur-md shadow-2xl animate-fade-in border border-emerald-400">
              <CheckCircle2 size={16} />
              <span>Cockpit Configuration Synced with Vehicle!</span>
            </div>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* BOTTOM SECTION: 3 EQUAL-WIDTH CONFIGURATION CARDS             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* =========================================================== */}
        {/* CARD 1: ALL OPTIONS RELATED TO STEERING                     */}
        {/* =========================================================== */}
        <div
          onClick={() => setActivePanel("steering")}
          className={`flex flex-col gap-4 p-4 rounded-2xl transition-all duration-200 cursor-pointer ${
            activePanel === "steering"
              ? "bg-slate-900/95 border-2 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.18)]"
              : "bg-slate-900/60 border border-slate-800 hover:border-slate-700"
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                <Compass size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-100">
                  ALL OPTIONS RELATED TO STEERING
                </h3>
                <p className="text-[10px] text-slate-400">Wheel shape, grip materials & controls</p>
              </div>
            </div>
            {activePanel === "steering" && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                ACTIVE FOCUS
              </span>
            )}
          </div>

          {/* 1.1 Steering Wheel Typology */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Wheel Typology
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "sport", label: "Sport 3-Spoke", desc: "Classic Round" },
                  { id: "yoke", label: "GT3 Track Yoke", desc: "Open Top" },
                  { id: "formula", label: "Formula Carbon", desc: "Single Seater" },
                  { id: "classic", label: "Classic Wood", desc: "Thin Rim" },
                ] as const
              ).map((opt) => {
                const isSelected = steeringWheelStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      playHMIClickSound();
                      setSteeringWheelStyle(opt.id as SteeringWheelStyle);
                    }}
                    className={`flex flex-col items-start p-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-red-600/30 border border-red-500 text-white shadow-sm"
                        : "bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{opt.label}</span>
                    <span className="text-[10px] text-slate-400">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1.2 Grip Material */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Grip Material
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "leather", label: "Nappa Leather" },
                  { id: "alcantara", label: "Alcantara Suede" },
                  { id: "carbon", label: "3K Carbon Fiber" },
                  { id: "wood", label: "Polished Walnut" },
                ] as const
              ).map((mat) => {
                const isSelected = steeringGripMaterial === mat.id;
                return (
                  <button
                    key={mat.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      playHMIClickSound();
                      setSteeringGripMaterial(mat.id as SteeringGripMaterial);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      isSelected
                        ? "bg-slate-700 border border-cyan-400 text-cyan-300"
                        : "bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    {mat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1.3 Leather Color Swatches */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                Grip Color
              </label>
              <span className="text-[10px] font-mono text-slate-400">{steeringColor}</span>
            </div>
            <div className="flex items-center gap-2">
              {(
                [
                  { name: "Obsidian Black", hex: "#1a1a1e" },
                  { name: "Cognac Tan", hex: "#9a5b32" },
                  { name: "Rosso Racing", hex: "#dc2626" },
                  { name: "Navy Blue", hex: "#1e3a8a" },
                  { name: "Chalk White", hex: "#e2e8f0" },
                ] as const
              ).map((swatch) => (
                <button
                  key={swatch.hex}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setSteeringColor(swatch.hex);
                  }}
                  title={swatch.name}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                    steeringColor === swatch.hex
                      ? "scale-110 border-white ring-2 ring-red-500"
                      : "border-slate-600 hover:scale-105"
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              ))}
              <input
                type="color"
                value={steeringColor}
                onChange={(e) => setSteeringColor(e.target.value)}
                className="w-7 h-7 rounded-full bg-transparent cursor-pointer border border-slate-600"
                title="Custom Color"
              />
            </div>
          </div>

          {/* 1.4 Center Stripe & Paddle Shifters */}
          <div className="grid grid-cols-2 gap-2">
            {/* 12 o'clock stripe */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">12H Stripe</label>
              <select
                value={steeringStripe}
                onChange={(e) => {
                  playHMIClickSound();
                  setSteeringStripe(e.target.value as SteeringStripeStyle);
                }}
                className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 cursor-pointer focus:outline-none focus:border-red-500"
              >
                <option value="none">None</option>
                <option value="red">Racing Red</option>
                <option value="yellow">Yellow</option>
                <option value="blue">Cyan Blue</option>
              </select>
            </div>

            {/* Paddle Shifters */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Paddles</label>
              <select
                value={paddleShifters}
                onChange={(e) => {
                  playHMIClickSound();
                  setPaddleShifters(e.target.value as PaddleShifterStyle);
                }}
                className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 cursor-pointer focus:outline-none focus:border-red-500"
              >
                <option value="billet">Billet Alloy</option>
                <option value="carbon">Carbon Fiber</option>
                <option value="red">Anodized Red</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          {/* 1.5 Drive Mode Selector on Wheel */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Steering Drive Mode Dial
            </label>
            <div className="grid grid-cols-4 gap-1">
              {(
                [
                  { id: "comfort", label: "COMFORT", color: "text-blue-400" },
                  { id: "sport", label: "SPORT", color: "text-amber-400" },
                  { id: "track", label: "TRACK", color: "text-red-400" },
                  { id: "wet", label: "WET", color: "text-cyan-400" },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setDriveMode(mode.id as DriveModeType);
                  }}
                  className={`py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    driveMode === mode.id
                      ? "bg-slate-700 border border-slate-500 " + mode.color
                      : "bg-slate-800/40 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================== */}
        {/* CARD 2: DASH BOARD CONFIGURATIONS                           */}
        {/* =========================================================== */}
        <div
          onClick={() => setActivePanel("dashboard")}
          className={`flex flex-col gap-4 p-4 rounded-2xl transition-all duration-200 cursor-pointer ${
            activePanel === "dashboard"
              ? "bg-slate-900/95 border-2 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.18)]"
              : "bg-slate-900/60 border border-slate-800 hover:border-slate-700"
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Sliders size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-100">
                  DASH BOARD CONFIGURATIONS
                </h3>
                <p className="text-[10px] text-slate-400">Upper deck, decorative trims & displays</p>
              </div>
            </div>
            {activePanel === "dashboard" && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                ACTIVE FOCUS
              </span>
            )}
          </div>

          {/* 2.1 Upper Dashboard Deck Pad Color (Image 4 Aegean Blue Accent!) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <span>Upper Dash Pad Color</span>
                <span className="text-[9px] font-mono text-blue-400">(Image 4 Two-Tone)</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">{upperDashPadColor}</span>
            </div>
            <div className="flex items-center gap-2">
              {(
                [
                  { name: "Aegean Blue (Image 4)", hex: "#1d4ed8" },
                  { name: "Cognac Saddle", hex: "#9a5b32" },
                  { name: "Onyx Stealth", hex: "#18181b" },
                  { name: "Crimson Red", hex: "#b91c1c" },
                  { name: "Titanium Slate", hex: "#475569" },
                  { name: "Oyster Light", hex: "#e2e8f0" },
                ] as const
              ).map((swatch) => (
                <button
                  key={swatch.hex}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setUpperDashPadColor(swatch.hex);
                  }}
                  title={swatch.name}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                    upperDashPadColor === swatch.hex
                      ? "scale-110 border-white ring-2 ring-blue-500"
                      : "border-slate-600 hover:scale-105"
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              ))}
              <input
                type="color"
                value={upperDashPadColor}
                onChange={(e) => setUpperDashPadColor(e.target.value)}
                className="w-7 h-7 rounded-full bg-transparent cursor-pointer border border-slate-600"
                title="Custom Color"
              />
            </div>
          </div>

          {/* 2.2 Decorative Trim Spear */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Decorative Dash Trim
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "walnut", label: "Walnut Wood" },
                  { id: "carbon", label: "2x2 Twill Carbon" },
                  { id: "aluminum", label: "Brushed Titanium" },
                  { id: "piano_black", label: "Piano Black" },
                  { id: "forged_carbon", label: "Forged Carbon" },
                ] as const
              ).map((trim) => {
                const isSelected = dashboardTrimMaterial === trim.id;
                return (
                  <button
                    key={trim.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      playHMIClickSound();
                      setDashboardTrimMaterial(trim.id as DashboardTrimType);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      isSelected
                        ? "bg-slate-700 border border-blue-400 text-blue-300"
                        : "bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    {trim.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2.3 Infotainment Live Screen Canvas Mode */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
              <span>Center Infotainment App</span>
              <span className="text-[9px] font-mono text-cyan-400">Live 3D Canvas</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "navigation", label: "GPS Navigation", icon: NavIcon },
                  { id: "telemetry", label: "Race Telemetry", icon: Gauge },
                  { id: "media", label: "Audio Media", icon: Radio },
                  { id: "climate", label: "Dual HVAC", icon: Thermometer },
                ] as const
              ).map((mode) => {
                const Icon = mode.icon;
                const isSelected = infotainmentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      playHMIClickSound();
                      setInfotainmentMode(mode.id as InfotainmentMode);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600/30 border border-blue-500 text-cyan-300 shadow-sm"
                        : "bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <Icon size={13} />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2.4 Instrument Cluster Style */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Instrument Cluster Display
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "digital", label: "Digital Virtual Cockpit" },
                  { id: "analog", label: "Twin Analog Gauges" },
                ] as const
              ).map((cl) => {
                const isSelected = clusterStyle === cl.id;
                return (
                  <button
                    key={cl.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      playHMIClickSound();
                      setClusterStyle(cl.id as ClusterStyle);
                    }}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-700 border border-cyan-400 text-cyan-300"
                        : "bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    {cl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2.5 Ambient Light Neon Guide */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Ambient Light Glow
            </label>
            <div className="flex items-center gap-2">
              {(
                [
                  { name: "Cyber Cyan", hex: "#06b6d4" },
                  { name: "Amber Sunset", hex: "#f59e0b" },
                  { name: "Ultraviolet", hex: "#8b5cf6" },
                  { name: "Emerald Green", hex: "#10b981" },
                  { name: "Off", hex: "none" },
                ] as const
              ).map((amb) => (
                <button
                  key={amb.hex}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setAmbientLightColor(amb.hex);
                  }}
                  title={amb.name}
                  className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                    ambientLightColor === amb.hex
                      ? "scale-110 border-white ring-2 ring-cyan-400"
                      : "border-slate-600 hover:scale-105"
                  }`}
                  style={{ backgroundColor: amb.hex === "none" ? "#1e293b" : amb.hex }}
                >
                  {amb.hex === "none" && <span className="text-[9px] text-slate-400">OFF</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================== */}
        {/* CARD 3: OTHER CONFIGURATIONS                                */}
        {/* =========================================================== */}
        <div
          onClick={() => setActivePanel("other")}
          className={`flex flex-col gap-4 p-4 rounded-2xl transition-all duration-200 cursor-pointer ${
            activePanel === "other"
              ? "bg-slate-900/95 border-2 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.18)]"
              : "bg-slate-900/60 border border-slate-800 hover:border-slate-700"
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-100">
                  OTHER CONFIGURATIONS
                </h3>
                <p className="text-[10px] text-slate-400">Shifter lever, glazing & vehicle integration</p>
              </div>
            </div>
            {activePanel === "other" && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE FOCUS
              </span>
            )}
          </div>

          {/* 3.1 Center Console Shifter Typology (matching Image 4 automatic lever!) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
              <span>Transmission Shifter</span>
              <span className="text-[9px] font-mono text-emerald-400">Console Swap</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "auto", label: "Automatic", desc: "Image 4 Lever" },
                  { id: "manual", label: "6-Spd Gated", desc: "Open Gate" },
                  { id: "toggle", label: "E-Toggle", desc: "Flush Rocker" },
                ] as const
              ).map((sh) => {
                const isSelected = shifterStyle === sh.id;
                return (
                  <button
                    key={sh.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      playHMIClickSound();
                      setShifterStyle(sh.id as ShifterStyle);
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600/30 border border-emerald-500 text-white shadow-sm"
                        : "bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight">{sh.label}</span>
                    <span className="text-[9px] text-slate-400">{sh.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3.2 Contrast Stitching Color */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                Contrast Stitching
              </label>
              <span className="text-[10px] font-mono text-slate-400">{stitchingColor}</span>
            </div>
            <div className="flex items-center gap-2">
              {(
                [
                  { name: "Gold Ochre", hex: "#f59e0b" },
                  { name: "Racing Red", hex: "#ef4444" },
                  { name: "Apex Cyan", hex: "#06b6d4" },
                  { name: "Platinum Grey", hex: "#cbd5e1" },
                ] as const
              ).map((st) => (
                <button
                  key={st.hex}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setStitchingColor(st.hex);
                  }}
                  title={st.name}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                    stitchingColor === st.hex
                      ? "scale-110 border-white ring-2 ring-emerald-500"
                      : "border-slate-600 hover:scale-105"
                  }`}
                  style={{ backgroundColor: st.hex }}
                />
              ))}
            </div>
          </div>

          {/* 3.3 Windshield Glazing Tint */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              Windshield Tint
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "clear", label: "Clear Optical" },
                  { id: "smoke", label: "Smoke 35%" },
                  { id: "polarized", label: "Polarized Blue" },
                ] as const
              ).map((tint) => {
                const isSelected = windshieldTint === tint.id;
                return (
                  <button
                    key={tint.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      playHMIClickSound();
                      setWindshieldTint(tint.id as any);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all text-center cursor-pointer ${
                      isSelected
                        ? "bg-slate-700 border border-emerald-400 text-emerald-300"
                        : "bg-slate-800/40 border border-slate-700/50 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {tint.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3.4 Action Buttons: Apply & Sync / Reset */}
          <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-slate-800">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleApplyConfig();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:from-red-500 hover:to-amber-500 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Save size={14} />
              <span>Apply to Master Vehicle</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 text-[11px] font-medium transition-all cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset to Factory Specs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
