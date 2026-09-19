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

import React, { useState, useEffect, useMemo } from "react";
import {
  Compass,
  Sliders,
  Sparkles,
  Car,
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
  EyeOff,
  FileCode2,
  Zap,
  DollarSign,
  Scale,
  Award,
  Maximize2,
  Armchair,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Cpu,
  Plane,
  X,
  ChevronDown,
  Users,
  Wrench,
  Shield,
  Check,
  ArrowRight,
  Tv,
  DoorClosed,
  Disc,
} from "lucide-react";
import {
  useModularVehicleBuilderStore,
  MODULAR_CAR_PARTS,
} from "../../state/modularVehicleBuilderStore";
import {
  calculateVanInteriorVolume,
  BODY_TYPE_REGISTRY,
} from "../../sim/modularVehicle/vehicleFamilyArchitecture";
import type {
  VanSeatConfig,
  VehicleBodyTypeId,
} from "../../sim/modularVehicle/types";
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
  type ActiveConfigPanel,
  COCKPIT_THEME_PRESETS,
} from "../../state/interiorDashboardConfigStore";
import { InteractiveDashboardCanvasViewport } from "./InteractiveDashboardCanvasViewport";
import { CockpitElectronicsAvionicsSuite } from "./CockpitElectronicsAvionicsSuite";
import { InteriorControlDeck } from "./InteriorControlDeck";
import { useDesign } from "../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";

export interface InteriorSubTabItem {
  id: ActiveConfigPanel;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const INTERIOR_SUB_TABS: InteriorSubTabItem[] = [
  { id: "overview", label: "Cockpit Overview", icon: <Car size={14} />, badge: "Themes & Chassis" },
  { id: "steering", label: "Steering Wheel", icon: <Disc size={14} />, badge: "Wheel & Controls" },
  { id: "cluster", label: "Instrument Cluster", icon: <Gauge size={14} />, badge: "Driver Binnacle" },
  { id: "infotainment", label: "Center Display", icon: <Tv size={14} />, badge: "12.3\" Screen" },
  { id: "console", label: "Center Console", icon: <Sliders size={14} />, badge: "Transmission & HVAC" },
  { id: "dashboard", label: "Dashboard Trim", icon: <SlidersHorizontal size={14} />, badge: "Trim & Materials" },
  { id: "seats", label: "Seats & Seating", icon: <Armchair size={14} />, badge: "Upholstery & Belts" },
  { id: "rear_cabin", label: "Rear Cabin", icon: <Users size={14} />, badge: "5 / 7 / 8 Seater" },
  { id: "doors", label: "Doors & Ambient", icon: <DoorClosed size={14} />, badge: "Lighting & Glass" },
  { id: "summary", label: "Interior Summary", icon: <Award size={14} />, badge: "Ergonomics & Stats" },
];

export interface InteractiveDashboardStudioProps {
  initialWorkspaceMode?: "hardware" | "avionics" | "split";
  onSelectStage?: (stage: string) => void;
}

export const InteractiveDashboardStudio: React.FC<InteractiveDashboardStudioProps> = ({
  initialWorkspaceMode = "hardware",
  onSelectStage,
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

  // Modular Vehicle Architecture & Interior CAD state
  const vanSeatConfig = useModularVehicleBuilderStore((s) => s.vanSeatConfig);
  const setVanSeatConfig = useModularVehicleBuilderStore((s) => s.setVanSeatConfig);
  const chassisArch = useModularVehicleBuilderStore((s) => s.chassisArch);
  const setChassisArch = useModularVehicleBuilderStore((s) => s.setChassisArch);
  const materialGrade = useModularVehicleBuilderStore((s) => s.materialGrade);
  const setMaterialGrade = useModularVehicleBuilderStore((s) => s.setMaterialGrade);
  const selectedModel = useModularVehicleBuilderStore((s) => s.selectedModel);
  const togglePartVisibility = useModularVehicleBuilderStore((s) => s.togglePartVisibility);
  const isPartVisible = useModularVehicleBuilderStore((s) => s.isPartVisible);

  const vanVolume = useMemo(() => calculateVanInteriorVolume(vanSeatConfig), [vanSeatConfig]);
  const activeModelSpec = BODY_TYPE_REGISTRY[selectedModel as VehicleBodyTypeId] || BODY_TYPE_REGISTRY["sedan"];
  const interiorParts = useMemo(() => MODULAR_CAR_PARTS.filter((p) => p.category === "interior"), []);
  const totalInteriorMass = useMemo(() => interiorParts.reduce((acc, p) => acc + p.massKg, 0), [interiorParts]);

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
      {/* SUB-TAB NAVIGATION HEADER (Matching Aero Studio Architecture) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
        {INTERIOR_SUB_TABS.map((tab) => {
          const isActive = activePanel === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playHMITabSound();
                setActivePanel(tab.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-amber-500/20 to-amber-600/15 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/30 font-bold"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? "bg-amber-950/80 text-amber-200 border border-amber-500/30" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP SECTION: "WINDOW FOR DIAGRAM" (Exact Wireframe Box)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)] bg-slate-900/90 overflow-hidden flex flex-col">
        {/* Top Wireframe Diagram Header */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-amber-950/30 border-b border-amber-500/30 backdrop-blur-md gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-[0.22em] text-amber-400">
              DASHBOARD DIAGRAM • GRAPHIC OF DASHBOARD
            </span>
          </div>

          {/* Active 3D Component State Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-cyan-300 font-bold shadow-sm">
              WHEEL: {steeringWheelStyle.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-amber-300 font-bold shadow-sm">
              TRIM: {dashboardTrimMaterial.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-emerald-300 font-bold shadow-sm">
              SHIFTER: {shifterStyle.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-purple-300 font-bold shadow-sm">
              COST: +${engineering.totalPriceDelta.toLocaleString()}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-blue-300 font-bold shadow-sm">
              MASS: {engineering.totalWeightDelta > 0 ? `+${engineering.totalWeightDelta}` : engineering.totalWeightDelta} kg
            </span>
          </div>

          {/* Quick Controls Toolbar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Camera Views */}
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 flex-wrap">
              {(
                [
                  { id: "studio_sport", label: "Studio Sport", icon: Eye },
                  { id: "driver", label: "Driver POV", icon: Camera },
                  { id: "driver_close", label: "Close POV", icon: Eye },
                  { id: "seats", label: "Seats Focus", icon: Armchair },
                  { id: "rear_cabin", label: "Rear Cabin", icon: Users },
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
                      active ? "bg-amber-500/25 text-amber-300 shadow-sm ring-1 ring-amber-500/40" : "text-slate-300 hover:bg-slate-700/60"
                    }`}
                  >
                    <Icon size={12} />
                    <span>{cam.id === "studio_sport" ? "Studio Sport" : cam.label.split(" ")[0]}</span>
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

            {/* Direct Navigation to Options Deck */}
            <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => {
                  playHMIClickSound();
                  const el = document.getElementById("interior-options-deck");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold text-amber-300 hover:text-amber-200 hover:bg-slate-700/60 transition-all cursor-pointer"
                title="Jump directly down to Cockpit Options Deck"
              >
                <SlidersHorizontal size={12} />
                <span>OPTIONS DECK ↓</span>
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
            <Layers size={13} className="text-amber-400" />
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
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-cyan-300 w-12 text-right">{Math.round(explodedProgress * 100)}%</span>
          </div>
        </div>

        {/* Full-Width 3D Cockpit Diagram & Viewport Workspace (100% Unobstructed Width) */}
        <div className="relative w-full h-[600px] md:h-[660px] overflow-hidden select-none bg-slate-950 flex flex-col">
          {/* 3D GLB Viewport Canvas spanning entire width */}
          <div className="relative w-full h-full overflow-hidden flex flex-col">
            <InteractiveDashboardCanvasViewport />

            {/* ── FLOATING BOTTOM OPTIONS DOCK (Synchronized with Sub-Tabs) ── */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-[96vw] overflow-x-auto p-1 scrollbar-none">
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-100/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700/80 backdrop-blur-xl shadow-2xl select-none">
                {/* 1. Subassembly Focus Dropdown */}
                <div className="relative flex items-center">
                  <select
                    value={activePanel}
                    onChange={(e) => {
                      playHMIClickSound();
                      setActivePanel(e.target.value as ActiveConfigPanel);
                    }}
                    className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[11px] font-bold pl-2.5 pr-7 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer appearance-none shadow-sm"
                  >
                    <option value="overview">Focus [Cockpit Overview]</option>
                    <option value="steering">Focus [Steering Wheel]</option>
                    <option value="cluster">Focus [Instrument Cluster]</option>
                    <option value="infotainment">Focus [Center Display]</option>
                    <option value="console">Focus [Center Console]</option>
                    <option value="dashboard">Focus [Dashboard Trim]</option>
                    <option value="seats">Focus [Seats & Seating]</option>
                    <option value="rear_cabin">Focus [Rear Cabin & Rows]</option>
                    <option value="doors">Focus [Doors & Ambient]</option>
                    <option value="summary">Focus [Interior Summary]</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-400" />
                </div>

                {/* 2. Driver Height Pill Toggle */}
                <div className="flex items-center bg-slate-200/90 dark:bg-slate-800/90 rounded-xl p-0.5 border border-slate-300 dark:border-slate-700 text-[10px] font-bold">
                  {(["low", "normal", "tall"] as const).map((h) => (
                    <button
                      key={h}
                      onClick={() => {
                        playHMIClickSound();
                        setDriverHeight(h);
                      }}
                      className={`px-2 py-1 rounded-lg uppercase transition-all cursor-pointer ${
                        driverHeight === h
                          ? "bg-slate-800 dark:bg-slate-700 text-amber-400 shadow-sm font-black"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>

                {/* Vertical Divider */}
                <div className="h-7 w-px bg-slate-300 dark:bg-slate-700 mx-0.5 hidden sm:block" />

                {/* 3. Ten Quick Subassembly Focus Action Cards */}
                <div className="flex items-center gap-1">
                  {(
                    [
                      { id: "overview", label: "Overview", icon: Car },
                      { id: "steering", label: "Wheel", icon: Disc },
                      { id: "cluster", label: "Cluster", icon: Gauge },
                      { id: "infotainment", label: "Display", icon: Tv },
                      { id: "console", label: "Console", icon: Sliders },
                      { id: "dashboard", label: "Dash", icon: SlidersHorizontal },
                      { id: "seats", label: "Seats", icon: Armchair },
                      { id: "rear_cabin", label: "Rear", icon: Users },
                      { id: "doors", label: "Doors", icon: DoorClosed },
                      { id: "summary", label: "Summary", icon: Award },
                    ] as const
                  ).map((card) => {
                    const Icon = card.icon;
                    const active = activePanel === card.id;
                    return (
                      <button
                        key={card.id}
                        onClick={() => {
                          playHMIClickSound();
                          setActivePanel(card.id as ActiveConfigPanel);
                        }}
                        title={card.label}
                        className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl border transition-all cursor-pointer min-w-[42px] ${
                          active
                            ? "bg-amber-500/20 text-amber-300 border-amber-400 ring-2 ring-amber-400/80 shadow-sm font-black"
                            : "bg-white/80 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-300/80 dark:border-slate-700/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
                        }`}
                      >
                        <Icon size={14} className={active ? "text-amber-400" : "text-slate-500 dark:text-slate-400"} />
                        <span className="text-[9px] mt-0.5 leading-tight">{card.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Toast Notification when Applied */}
            {saveToast && (
              <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/90 text-white font-bold text-xs backdrop-blur-md shadow-2xl animate-fade-in border border-emerald-400">
                <CheckCircle2 size={16} />
                <span>Cockpit Configuration Synced with Vehicle!</span>
              </div>
            )}


          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* WORKSPACE MODE SELECTOR: HARDWARE vs ELECTRONICS & AVIONICS   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-400">
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
                ? "bg-amber-500/25 text-amber-300 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500/40"
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
                ? "bg-cyan-500/25 text-cyan-300 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-500/40"
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
      {/* SECTION-DRIVEN CONTROL DECK (Directly Beneath 3D GLB Viewport)*/}
      {/* ───────────────────────────────────────────────────────────── */}
      {(workspaceMode === "hardware" || workspaceMode === "split") && (
        <div id="interior-options-deck" className="w-full">
          <InteriorControlDeck
            onSelectStage={onSelectStage}
            onApplyConfig={handleApplyConfig}
          />
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
              <FileCode2 size={16} className="text-amber-400" />
              Cockpit Configuration JSON (Export / Import)
            </h3>
            <textarea
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-amber-500"
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
                className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
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
