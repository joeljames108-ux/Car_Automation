/**
 * ============================================================================
 * INTERACTIVE DASHBOARD STUDIO — MODULAR COCKPIT CONFIGURATOR
 * ============================================================================
 * Implements the complete master directive and wireframe:
 * - Top Window: "WINDOW FOR DIAGRAM" outlined with prominent red accent border,
 *   housing the interactive Three.js 3D cockpit diagram (`dashboard_interactive_master.glb`),
 *   calibrated to the driver eye-level perspective from Image 4.
 * - Bottom Row: 3 Equal-Width Configuration Cards:
 *   1. "ALL OPTIONS RELATED TO STEERING" (7 Wheels, Grip materials, Stripe, Paddles, Mode Dial)
 *   2. "DASHBOARD CONFIGURATIONS" (Upper Pad, 11 Trims, 8 Screens, 5 Clusters, HUD, Ambient Neon)
 *   3. "OTHER CONFIGURATIONS" (7 Shifters, Seats, Belts, Stitching, Tint, Themes, Cost/Weight/Scores)
 *
 * Fully reactive in-memory Three.js updates without GLB reloads.
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
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
  Undo2,
  Redo2,
  Shuffle,
  Eye,
  FileCode2,
  Zap,
  DollarSign,
  Scale,
  Award,
  Maximize2,
  Armchair,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  SlidersHorizontal,
  Cpu,
  Plane,
  X,
  ChevronDown,
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
  type DriverHeight,
  type SeatStyle,
  type SeatBeltColor,
  type StitchingColor,
  type WindshieldTint,
  type HUDMode,
  type LightingMode,
  COCKPIT_THEME_PRESETS,
} from "../../state/interiorDashboardConfigStore";
import { InteractiveDashboardCanvasViewport } from "./InteractiveDashboardCanvasViewport";
import { InteriorMetricsPanel } from "./InteriorMetricsPanel";
import { InteriorConfigControls } from "./InteriorConfigControls";
import { CockpitElectronicsAvionicsSuite } from "./CockpitElectronicsAvionicsSuite";
import { useDesign } from "../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";

export interface InteractiveDashboardStudioProps {
  initialWorkspaceMode?: "hardware" | "avionics" | "split";
}

export const InteractiveDashboardStudio: React.FC<InteractiveDashboardStudioProps> = ({
  initialWorkspaceMode = "hardware",
}) => {
  const { updateInterior, updateInfotainment, design } = useDesign();
  const [workspaceMode, setWorkspaceMode] = useState<"hardware" | "avionics" | "split">(
    initialWorkspaceMode || "hardware"
  );

  useEffect(() => {
    if (initialWorkspaceMode) {
      setWorkspaceMode(initialWorkspaceMode);
    }
  }, [initialWorkspaceMode]);

  const [saveToast, setSaveToast] = useState(false);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [showLeftOverview, setShowLeftOverview] = useState(false);
  const [showRightControls, setShowRightControls] = useState(false);

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
  const hudMode = useInteriorDashboardConfigStore((s) => s.hudMode);
  const ambientLightColor = useInteriorDashboardConfigStore((s) => s.ambientLightColor);

  const shifterStyle = useInteriorDashboardConfigStore((s) => s.shifterStyle);
  const seatStyle = useInteriorDashboardConfigStore((s) => s.seatStyle);
  const seatBeltColor = useInteriorDashboardConfigStore((s) => s.seatBeltColor);
  const stitchingColor = useInteriorDashboardConfigStore((s) => s.stitchingColor);
  const windshieldTint = useInteriorDashboardConfigStore((s) => s.windshieldTint);
  const lightingMode = useInteriorDashboardConfigStore((s) => s.lightingMode);
  const nightMode = useInteriorDashboardConfigStore((s) => s.nightMode);

  const cameraPose = useInteriorDashboardConfigStore((s) => s.cameraPose);
  const driverHeight = useInteriorDashboardConfigStore((s) => s.driverHeight);
  const activePanel = useInteriorDashboardConfigStore((s) => s.activePanel);
  const explodedProgress = useInteriorDashboardConfigStore((s) => s.explodedProgress);
  const engineering = useInteriorDashboardConfigStore((s) => s.engineering);

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
  const setHudMode = useInteriorDashboardConfigStore((s) => s.setHudMode);
  const setAmbientLightColor = useInteriorDashboardConfigStore((s) => s.setAmbientLightColor);

  const setShifterStyle = useInteriorDashboardConfigStore((s) => s.setShifterStyle);
  const setSeatStyle = useInteriorDashboardConfigStore((s) => s.setSeatStyle);
  const setSeatBeltColor = useInteriorDashboardConfigStore((s) => s.setSeatBeltColor);
  const setStitchingColor = useInteriorDashboardConfigStore((s) => s.setStitchingColor);
  const setWindshieldTint = useInteriorDashboardConfigStore((s) => s.setWindshieldTint);
  const setLightingMode = useInteriorDashboardConfigStore((s) => s.setLightingMode);
  const setNightMode = useInteriorDashboardConfigStore((s) => s.setNightMode);

  const setCameraPose = useInteriorDashboardConfigStore((s) => s.setCameraPose);
  const setDriverHeight = useInteriorDashboardConfigStore((s) => s.setDriverHeight);
  const setActivePanel = useInteriorDashboardConfigStore((s) => s.setActivePanel);
  const setExplodedProgress = useInteriorDashboardConfigStore((s) => s.setExplodedProgress);

  const applyThemePreset = useInteriorDashboardConfigStore((s) => s.applyThemePreset);
  const resetConfig = useInteriorDashboardConfigStore((s) => s.reset);
  const undo = useInteriorDashboardConfigStore((s) => s.undo);
  const redo = useInteriorDashboardConfigStore((s) => s.redo);
  const randomize = useInteriorDashboardConfigStore((s) => s.randomize);
  const exportConfigJson = useInteriorDashboardConfigStore((s) => s.exportConfigJson);
  const importConfigJson = useInteriorDashboardConfigStore((s) => s.importConfigJson);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      switch (e.key) {
        case "1": setCameraPose("dashboard_center"); break;
        case "2": setCameraPose("driver"); break;
        case "3": setCameraPose("full_cockpit"); break;
        case "4": setCameraPose("steering"); break;
        case "5": setCameraPose("infotainment"); break;
        case "6": setCameraPose("console"); break;
        case "n":
        case "N": setNightMode(!nightMode); break;
        case "e":
        case "E": setExplodedProgress(explodedProgress > 0 ? 0 : 0.8); break;
        case "r":
        case "R": resetConfig(); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nightMode, explodedProgress, undo, redo, resetConfig]);

  // Sync to Vehicle State
  const handleApplyConfig = () => {
    playHMITabSound();
    updateInterior({
      steeringWheel: steeringWheelStyle === "yoke" ? "gt_wheel" : "sport",
      dashboardMaterial: dashboardTrimMaterial === "carbon" ? "carbon_fiber" : dashboardTrimMaterial === "walnut" ? "wood" : "aluminum",
      interiorColor: upperDashPadColor,
      ambientLighting: ambientLightColor !== "none" ? 1 : 0,
      infotainmentSize: 12,
    });
    if (hudMode !== "off" && design.infotainment.hudType === "none") {
      updateInfotainment({ hudType: hudMode === "performance" ? "ar" : "color" });
    }
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2600);
  };

  return (
    <div className="w-full flex flex-col gap-4 p-3 md:p-5 rounded-2xl bg-slate-950 text-slate-100 font-sans select-none border border-slate-800 shadow-2xl">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP SECTION: "WINDOW FOR DIAGRAM" (Exact Wireframe Box)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full rounded-2xl border-2 border-red-500/90 shadow-[0_0_30px_rgba(239,68,68,0.22)] bg-slate-900/90 overflow-hidden flex flex-col">
        {/* Top Wireframe Diagram Header */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-red-950/40 border-b border-red-500/40 backdrop-blur-md gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-[0.22em] text-red-400">
              WINDOW FOR DIAGRAM • GRAPHIC OF DASHBOARD
            </span>
          </div>

          {/* Active 3D Component State Breadcrumbs */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-cyan-300">
              WHEEL: {steeringWheelStyle.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-amber-300">
              TRIM: {dashboardTrimMaterial.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-emerald-300">
              SHIFTER: {shifterStyle.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-purple-300">
              COST: +${engineering.totalPriceDelta.toLocaleString()}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-blue-300">
              MASS: {engineering.totalWeightDelta > 0 ? `+${engineering.totalWeightDelta}` : engineering.totalWeightDelta} kg
            </span>
          </div>

          {/* Quick Controls Toolbar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Camera Views */}
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 flex-wrap">
              {(
                [
                  { id: "dashboard_center", label: "Studio Front (Default)", icon: Eye },
                  { id: "driver", label: "Driver POV", icon: Camera },
                  { id: "driver_close", label: "Close POV", icon: Eye },
                  { id: "seats", label: "Seats Focus", icon: Armchair },
                  { id: "steering", label: "Steering", icon: Compass },
                  { id: "cluster", label: "Cluster", icon: Gauge },
                  { id: "infotainment", label: "Display", icon: Activity },
                  { id: "console", label: "Console", icon: CircleDot },
                  { id: "doors", label: "Doors", icon: Sliders },
                  { id: "full_cockpit", label: "Cockpit", icon: Layers },
                  { id: "orbit_360", label: "360°", icon: Maximize2 },
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
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      active ? "bg-red-600 text-white shadow-sm ring-1 ring-red-400" : "text-slate-300 hover:bg-slate-700/60"
                    }`}
                  >
                    <Icon size={12} />
                    <span>{cam.id === "dashboard_center" ? "Studio Front" : cam.label.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Driver Eye Height */}
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-[10px] font-bold">
              {(["low", "normal", "tall"] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    playHMIClickSound();
                    setDriverHeight(h);
                  }}
                  className={`px-2 py-1 rounded-md uppercase cursor-pointer ${
                    driverHeight === h ? "bg-slate-700 text-cyan-300" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>

            {/* Day / Night Toggle */}
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

            {/* Quick Floating HUD / Options Controls */}
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  playHMIClickSound();
                  setShowLeftOverview((prev) => !prev);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  showLeftOverview ? "bg-red-600 text-white shadow-sm ring-1 ring-red-400" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Toggle Floating Interior Overview (HUD Overlay)"
              >
                <BarChart3 size={12} />
                <span>OVERVIEW HUD</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playHMIClickSound();
                  setShowRightControls((prev) => !prev);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  showRightControls ? "bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Toggle Floating Configuration Steppers (HUD Overlay)"
              >
                <SlidersHorizontal size={12} />
                <span>STEPPERS HUD</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playHMIClickSound();
                  const el = document.getElementById("interior-options-deck");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-amber-300 hover:text-amber-200 hover:bg-slate-700/60 transition-all cursor-pointer border-l border-slate-700 ml-0.5"
                title="Jump down to full Options Workbench"
              >
                <ChevronDown size={12} />
                <span>OPTIONS ↓</span>
              </button>
            </div>

            {/* Undo / Redo */}
            <button onClick={undo} title="Undo (Ctrl+Z)" className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 hover:bg-slate-700">
              <Undo2 size={13} />
            </button>
            <button onClick={redo} title="Redo (Ctrl+Y)" className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 hover:bg-slate-700">
              <Redo2 size={13} />
            </button>
            <button onClick={randomize} title="Randomize Cockpit" className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 hover:bg-slate-700">
              <Shuffle size={13} />
            </button>
            <button onClick={() => { setJsonText(exportConfigJson()); setJsonModalOpen(true); }} title="Export / Import JSON" className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 hover:bg-slate-700">
              <FileCode2 size={13} />
            </button>
          </div>
        </div>

        {/* Exploded View Bar */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-slate-950/70 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Layers size={13} className="text-red-400" />
            <span className="font-bold uppercase tracking-wider text-[11px]">Exploded / CAD Inspection View:</span>
          </div>
          <div className="flex items-center gap-3 w-64">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={explodedProgress}
              onChange={(e) => setExplodedProgress(parseFloat(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
            <span className="font-mono text-cyan-300 w-12 text-right">{Math.round(explodedProgress * 100)}%</span>
          </div>
        </div>

        {/* Full-Width 3D Cockpit Diagram & Viewport Workspace (100% Unobstructed Width) */}
        <div className="relative w-full h-[600px] md:h-[660px] overflow-hidden select-none bg-slate-950 flex flex-col">
          {/* 3D GLB Viewport Canvas spanning entire width */}
          <div className="relative w-full h-full overflow-hidden flex flex-col">
            <InteractiveDashboardCanvasViewport />

            {/* Toast Notification when Applied */}
            {saveToast && (
              <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/90 text-white font-bold text-xs backdrop-blur-md shadow-2xl animate-fade-in border border-emerald-400">
                <CheckCircle2 size={16} />
                <span>Cockpit Configuration Synced with Vehicle!</span>
              </div>
            )}

            {/* Optional Floating HUD Overlay Drawer: Interior Overview (Metrics) */}
            {showLeftOverview && (
              <div className="absolute top-0 bottom-0 left-0 z-30 w-[310px] max-w-[85vw] h-full shadow-2xl bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/80 flex flex-col animate-fade-in">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80 border-b border-slate-700">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400">
                    <BarChart3 size={14} />
                    <span>INTERIOR OVERVIEW (HUD)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLeftOverview(false)}
                    className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Close Floating Overview"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <InteriorMetricsPanel theme="dark" className="border-none shadow-none" />
                </div>
              </div>
            )}

            {/* Optional Floating HUD Overlay Drawer: Interior Configuration (Steppers) */}
            {showRightControls && (
              <div className="absolute top-0 bottom-0 right-0 z-30 w-[340px] max-w-[90vw] h-full shadow-2xl bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/80 flex flex-col animate-fade-in">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80 border-b border-slate-700">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
                    <SlidersHorizontal size={14} />
                    <span>INTERIOR CONFIGURATION (HUD)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRightControls(false)}
                    className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Close Floating Configuration"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <InteriorConfigControls theme="dark" className="border-none shadow-none" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* COCKPIT CONFIGURATION & ERGONOMICS OVERVIEW (DEDICATED DECK)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div id="interior-options-deck" className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        {/* Left Card: Interior Configuration Steppers */}
        <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <SlidersHorizontal size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-100 font-mono">
                  INTERIOR CONFIGURATION
                </h3>
                <p className="text-[11px] text-slate-400">Dashboard, instruments, center display, steering & upholstery</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              STEPPERS
            </span>
          </div>
          <div className="max-h-[580px] overflow-y-auto rounded-xl border border-slate-800/60 bg-slate-950/60">
            <InteriorConfigControls theme="dark" className="border-none shadow-none" />
          </div>
        </div>

        {/* Right Card: Interior Metrics & Ergonomics Overview */}
        <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <BarChart3 size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-100 font-mono">
                  INTERIOR OVERVIEW & ERGONOMICS
                </h3>
                <p className="text-[11px] text-slate-400">Live comfort, noise, quality, reliability & market appeal telemetry</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
              TELEMETRY
            </span>
          </div>
          <div className="max-h-[580px] overflow-y-auto rounded-xl border border-slate-800/60 bg-slate-950/60">
            <InteriorMetricsPanel theme="dark" className="border-none shadow-none" />
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* WORKSPACE MODE SELECTOR: HARDWARE vs ELECTRONICS & AVIONICS   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400">
            <Sparkles size={15} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">
              DASHBOARD WORKBENCH
            </span>
          </div>
          <span className="hidden sm:inline text-xs text-slate-400">
            {workspaceMode === "hardware"
              ? "Physical cockpit layout: Steering wheels, dash trims, screens, console shifters & seating."
              : workspaceMode === "avionics"
              ? "Electronics & Avionics: Glass cockpit displays, DO-178C compute, HUD, ADAS autonomy, and power telemetry."
              : "Dual Workbench: Simultaneous cockpit hardware ergonomics and aerospace avionics tuning."}
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              playHMITabSound();
              setWorkspaceMode("hardware");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              workspaceMode === "hardware"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30 ring-1 ring-red-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Compass size={13} />
            <span>🏎️ COCKPIT HARDWARE</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playHMITabSound();
              setWorkspaceMode("avionics");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              workspaceMode === "avionics"
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Cpu size={13} />
            <span>⚡ ELECTRONICS & AVIONICS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playHMITabSound();
              setWorkspaceMode("split");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              workspaceMode === "split"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-1 ring-amber-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Layers size={13} />
            <span>🔀 DUAL SPLIT</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* COCKPIT HARDWARE CONFIGURATION CARDS                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {(workspaceMode === "hardware" || workspaceMode === "split") && (
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
                <p className="text-[10px] text-slate-400">7 Wheel shapes, grip materials, stripe & paddles</p>
              </div>
            </div>
          </div>

          {/* 1. 7 Wheel Styles */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              1. Steering Wheel Architecture
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "sport", label: "Sport 3-Spoke", desc: "Contoured Nappa, aluminum" },
                  { id: "gt_3spoke", label: "GT 3-Spoke", desc: "Flat-bottom, perforated" },
                  { id: "yoke", label: "GT3 Track Yoke", desc: "Open-top racing yoke" },
                  { id: "formula", label: "Formula Carbon", desc: "Motorsport shift LEDs" },
                  { id: "luxury_2spoke", label: "Luxury 2-Spoke", desc: "Walnut swept arch" },
                  { id: "classic_4spoke", label: "Classic 4-Spoke", desc: "Stainless steel vintage" },
                  { id: "performance_4spoke", label: "Performance 4-Spoke", desc: "Forged split carbon" },
                ] as const
              ).map((w) => (
                <button
                  key={w.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setSteeringWheelStyle(w.id);
                  }}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    steeringWheelStyle === w.id
                      ? "bg-red-600/20 border-red-500 text-white shadow-sm ring-1 ring-red-500"
                      : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/60"
                  }`}
                >
                  <div className="text-[11px] font-black">{w.label}</div>
                  <div className="text-[9px] text-slate-400 leading-tight">{w.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Grip Material */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              2. Grip Upholstery Material
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "leather", label: "Nappa Leather" },
                  { id: "alcantara", label: "Alcantara" },
                  { id: "perforated", label: "Perforated" },
                  { id: "carbon", label: "Carbon Weave" },
                  { id: "wood", label: "Walnut Wood" },
                  { id: "suede", label: "Motorsport Suede" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setSteeringGripMaterial(m.id);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
                    steeringGripMaterial === m.id
                      ? "bg-red-600/20 border-red-500 text-red-300"
                      : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. 12 O'Clock Racing Stripe */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              3. 12 O'Clock Racing Center Stripe
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["none", "red", "yellow", "blue", "white", "green"] as const).map((col) => (
                <button
                  key={col}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setSteeringStripe(col);
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                    steeringStripe === col
                      ? "bg-slate-700 border-red-500 text-white ring-1 ring-red-400"
                      : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50"
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Paddle Shifters */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              4. Paddle Shifters
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "none", label: "None" },
                  { id: "billet", label: "Billet Aluminum" },
                  { id: "carbon", label: "3K Carbon" },
                  { id: "forged_carbon", label: "Forged Carbon" },
                  { id: "red", label: "Anodized Red" },
                  { id: "extended", label: "GT3 Extended" },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setPaddleShifters(p.id);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    paddleShifters === p.id
                      ? "bg-red-600/20 border-red-500 text-red-300"
                      : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Drive Mode Dial */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              5. Steering Drive Mode Rotary Dial
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["comfort", "eco", "sport", "sport_plus", "track", "custom"] as const).map((dm) => (
                <button
                  key={dm}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setDriveMode(dm);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                    driveMode === dm
                      ? "bg-red-600/20 border-red-500 text-red-300"
                      : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  {dm.replace("_", "+")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================== */}
        {/* CARD 2: DASHBOARD CONFIGURATIONS                            */}
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
              <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                <Sliders size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-100">
                  DASHBOARD CONFIGURATIONS
                </h3>
                <p className="text-[10px] text-slate-400">Pad leather, 11 trims, 8 screens, clusters & HUD</p>
              </div>
            </div>
          </div>

          {/* 1. Upper Dash Pad Color */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              1. Upper Dashboard Pad Nappa Leather
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { name: "Obsidian Black", hex: "#17181c" },
                { name: "Charcoal Grey", hex: "#26282e" },
                { name: "Cognac Tan", hex: "#9a5b32" },
                { name: "Crimson Burgundy", hex: "#7f1d1d" },
                { name: "Dark Navy", hex: "#1e293b" },
                { name: "Cream Beige", hex: "#d4c5a9" },
              ].map((sw) => (
                <button
                  key={sw.hex}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setUpperDashPadColor(sw.hex);
                  }}
                  title={sw.name}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    upperDashPadColor === sw.hex ? "scale-110 border-red-500 shadow-md" : "border-slate-600 hover:scale-105"
                  }`}
                  style={{ backgroundColor: sw.hex }}
                />
              ))}
            </div>
          </div>

          {/* 2. Main Dashboard Decorative Trim */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              2. Main Decorative Trim Spear
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "walnut", label: "American Walnut", desc: "Open-pore bookmatched" },
                  { id: "dark_walnut", label: "Dark Walnut", desc: "Stained deep espresso" },
                  { id: "carbon", label: "3K Twill Carbon", desc: "High-gloss clearcoat" },
                  { id: "forged_carbon", label: "Forged Carbon", desc: "Matte motorsport composite" },
                  { id: "titanium", label: "Brushed Titanium", desc: "Aerospace satin grade" },
                  { id: "aluminum", label: "Satin Aluminum", desc: "Machined jewel finish" },
                  { id: "piano_black", label: "Piano Black", desc: "Mirror lacquer gloss" },
                  { id: "bronze", label: "Anodized Bronze", desc: "Warm metallic luxury" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setDashboardTrimMaterial(t.id);
                  }}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    dashboardTrimMaterial === t.id
                      ? "bg-red-600/20 border-red-500 text-white shadow-sm ring-1 ring-red-500"
                      : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/60"
                  }`}
                >
                  <div className="text-[11px] font-black">{t.label}</div>
                  <div className="text-[9px] text-slate-400 leading-tight">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Infotainment Display Mode (8 Modes) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              3. Infotainment 12.3-inch Display Mode
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { id: "navigation", label: "Nav", icon: NavIcon },
                  { id: "telemetry", label: "Telemetry", icon: Activity },
                  { id: "media", label: "Media", icon: Radio },
                  { id: "climate", label: "HVAC", icon: Thermometer },
                  { id: "vehicle", label: "Health", icon: Zap },
                  { id: "camera", label: "Camera", icon: Camera },
                  { id: "performance", label: "Chrono", icon: Gauge },
                  { id: "settings", label: "Settings", icon: Sliders },
                ] as const
              ).map((im) => {
                const Icon = im.icon;
                return (
                  <button
                    key={im.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      playHMIClickSound();
                      setInfotainmentMode(im.id);
                    }}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      infotainmentMode === im.id
                        ? "bg-red-600/20 border-red-500 text-red-300 ring-1 ring-red-400"
                        : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    <Icon size={14} />
                    <span className="text-[9px] font-bold">{im.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Instrument Cluster Style & HUD */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              4. Driver Instrument Cluster & HUD
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "digital", label: "Digital ADAS" },
                  { id: "analog", label: "Analog Dials" },
                  { id: "performance", label: "Performance" },
                  { id: "track", label: "F1 Track" },
                  { id: "minimal", label: "Minimalist" },
                ] as const
              ).map((cs) => (
                <button
                  key={cs.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setClusterStyle(cs.id);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
                    clusterStyle === cs.id
                      ? "bg-red-600/20 border-red-500 text-red-300"
                      : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  {cs.label}
                </button>
              ))}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playHMIClickSound();
                  setHudMode(hudMode === "off" ? "performance" : "off");
                }}
                className={`px-2 py-1.5 rounded-lg text-center text-[10px] font-bold border transition-all cursor-pointer ${
                  hudMode !== "off"
                    ? "bg-cyan-600/20 border-cyan-400 text-cyan-300"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50"
                }`}
              >
                HUD: {hudMode !== "off" ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* 5. Multi-Zone Ambient Neon Lightguide */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              5. Multi-Zone Ambient Neon Lightguides
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { name: "Cyan Neon", hex: "#06b6d4" },
                { name: "Crimson Red", hex: "#ef4444" },
                { name: "Amber Gold", hex: "#f59e0b" },
                { name: "Electric Blue", hex: "#3b82f6" },
                { name: "Violet Purple", hex: "#a855f7" },
                { name: "Emerald Green", hex: "#10b981" },
                { name: "Ice White", hex: "#ffffff" },
              ].map((sw) => (
                <button
                  key={sw.hex}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setAmbientLightColor(sw.hex);
                  }}
                  title={sw.name}
                  className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                    ambientLightColor === sw.hex ? "scale-125 border-white shadow-lg" : "border-slate-700 hover:scale-110"
                  }`}
                  style={{ backgroundColor: sw.hex }}
                />
              ))}
            </div>
          </div>

          {/* 6. Dashboard Perspective & Camera View */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                6. Perspective & Camera View
              </label>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-400">
                {cameraPose === "dashboard_center" ? "STUDIO FRONT (DEFAULT)" : cameraPose.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "dashboard_center", label: "Studio Front (Default)", desc: "Symmetrical front dashboard view", icon: Eye },
                { id: "driver", label: "Driver POV", desc: "Left-hand driver perspective", icon: Camera },
                { id: "infotainment", label: "Display Focus", desc: "Close-up of 12.3\" center screen", icon: Activity },
                { id: "cluster", label: "Cluster Focus", desc: "Driver instrument binnacle", icon: Gauge },
              ].map((v) => {
                const Icon = v.icon;
                const active = cameraPose === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      playHMIClickSound();
                      setCameraPose(v.id as CameraPose);
                    }}
                    className={`flex items-start gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? "bg-red-600/25 border-red-500 text-white ring-1 ring-red-400 shadow-sm"
                        : "bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    <div className={`p-1 rounded-lg ${active ? "bg-red-500/30 text-red-300" : "bg-slate-700/50 text-slate-400"}`}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black flex items-center gap-1">
                        {v.label}
                        {v.id === "dashboard_center" && (
                          <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            DEF
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-400 leading-tight">{v.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================== */}
        {/* CARD 3: CONSOLE, SEATS & COCKPIT CONFIGURE                  */}
        {/* =========================================================== */}
        <div
          onClick={() => setActivePanel("other")}
          className={`flex flex-col gap-4 p-4 rounded-2xl transition-all duration-200 cursor-pointer ${
            activePanel === "other" || activePanel === "console" || activePanel === "seats" || activePanel === "doors"
              ? "bg-slate-900/95 border-2 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.18)]"
              : "bg-slate-900/60 border border-slate-800 hover:border-slate-700"
          }`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wider uppercase text-slate-100">
                  CONSOLE, SEATS & COCKPIT CONFIGURE
                </h3>
                <p className="text-[10px] text-slate-400">7 Shifters, bucket seats, stitching, tint & presets</p>
              </div>
            </div>
          </div>

          {/* 1. 7 Shifter Mechanisms */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActivePanel("console");
              setCameraPose("console");
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              activePanel === "console" || cameraPose === "console"
                ? "bg-slate-800/90 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] ring-1 ring-red-500/80"
                : "bg-slate-800/40 border-slate-700/70 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <CircleDot size={13} className="text-red-400" />
                1. Center Console Shifter Mechanism
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playHMIClickSound();
                  setActivePanel("console");
                  setCameraPose("console");
                }}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-600/30 text-red-300 border border-red-500/50 hover:bg-red-600/50 cursor-pointer"
              >
                FOCUS CONSOLE
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "auto", label: "Auto Lever", desc: "Perforated leather grip" },
                  { id: "manual_gated", label: "Gated Manual", desc: "Open chrome slotted gate" },
                  { id: "manual_h", label: "H-Pattern Boot", desc: "Leather boot 6-speed" },
                  { id: "toggle", label: "Electronic Toggle", desc: "Satin aluminum rocker" },
                  { id: "rotary", label: "Rotary Controller", desc: "Knurled aluminum dial" },
                  { id: "crystal", label: "Crystal Glass", desc: "Faceted diamond jewel" },
                  { id: "performance", label: "Sequential Lever", desc: "Motorsport carbon stalk" },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setShifterStyle(s.id);
                    setActivePanel("console");
                    setCameraPose("console");
                  }}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    shifterStyle === s.id
                      ? "bg-red-600/20 border-red-500 text-white shadow-sm ring-1 ring-red-500"
                      : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/60"
                  }`}
                >
                  <div className="text-[11px] font-black">{s.label}</div>
                  <div className="text-[9px] text-slate-400 leading-tight">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Seats & French Stitching */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActivePanel("seats");
              setCameraPose("seats");
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              activePanel === "seats" || cameraPose === "seats"
                ? "bg-slate-800/90 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] ring-1 ring-red-500/80"
                : "bg-slate-800/40 border-slate-700/70 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Armchair size={13} className="text-red-400" />
                2. Seating Architecture & French Stitching
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playHMIClickSound();
                  setActivePanel("seats");
                  setCameraPose("seats");
                }}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-600/30 text-red-300 border border-red-500/50 hover:bg-red-600/50 cursor-pointer"
              >
                FOCUS SEAT CAM
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["sport", "bucket", "luxury", "racing", "standard"] as const).map((st) => (
                <button
                  key={st}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMIClickSound();
                    setSeatStyle(st);
                    setActivePanel("seats");
                    setCameraPose("seats");
                  }}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                    seatStyle === st
                      ? "bg-red-600/20 border-red-500 text-red-300 ring-1 ring-red-400"
                      : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Theme Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              3. Factory Interior Theme Presets
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {COCKPIT_THEME_PRESETS.map((t) => (
                <button
                  key={t.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    playHMITabSound();
                    applyThemePreset(t.id);
                  }}
                  className="p-2 rounded-xl text-left bg-slate-800/60 border border-slate-700/80 hover:border-red-500/80 transition-all cursor-pointer"
                >
                  <div className="text-[11px] font-black text-slate-100">{t.name}</div>
                  <div className="text-[9px] text-slate-400 truncate">{t.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Engineering Impact Radar & Live Metrics */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase text-slate-200">
              <span className="flex items-center gap-1.5 text-red-400">
                <Award size={13} /> Cockpit Engineering Consequences
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {engineering.totalPowerConsumptionW} W DRAW
              </span>
            </div>

            {/* Score Progress Bars */}
            <div className="space-y-1.5 text-[10px]">
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>LUXURY INDEX</span>
                  <span className="font-mono text-amber-300">{engineering.luxuryScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${engineering.luxuryScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>SPORT & DYNAMICS</span>
                  <span className="font-mono text-red-400">{engineering.sportScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${engineering.sportScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>TECHNOLOGY & AVIONICS</span>
                  <span className="font-mono text-cyan-400">{engineering.technologyScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${engineering.technologyScore}%` }} />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApplyConfig();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
              >
                <Save size={13} />
                <span>SYNC TO VEHICLE</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playHMIClickSound();
                  resetConfig();
                }}
                title="Reset to Defaults (R)"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ELECTRONICS & AVIATION AVIONICS SUITE                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {(workspaceMode === "avionics" || workspaceMode === "split") && (
        <CockpitElectronicsAvionicsSuite
          onSyncToVehicle={handleApplyConfig}
          onSelectCameraPose={setCameraPose}
        />
      )}

      {/* JSON Import/Export Modal */}
      {jsonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-lg shadow-2xl flex flex-col gap-3">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <FileCode2 size={16} className="text-red-400" />
              Cockpit Configuration JSON (Export / Import)
            </h3>
            <textarea
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setJsonModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const success = importConfigJson(jsonText);
                  if (success) {
                    setJsonModalOpen(false);
                    playHMITabSound();
                  } else {
                    alert("Invalid JSON configuration format!");
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-500"
              >
                Apply JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
