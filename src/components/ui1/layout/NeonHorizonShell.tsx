import React, { useState, useEffect, useRef } from "react";
import {
  Cog,
  Car,
  Activity,
  Flag,
  BarChart3,
  Paintbrush,
  Wind,
  Sofa,
  Factory,
  Monitor,
  ShieldCheck,
  Sparkles as SparklesIcon,
  Bot,
  Wrench,
  Trophy,
  Box,
  Layers,
  Flame,
  Volume2,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { useCompany } from "../../../state/CompanyContext";
import { StageSwitcher, type Stage } from "../../StageSwitcher";
import { ThermalAlertMonitor } from "../../ThermalAlertMonitor";
import { AgentNotificationCenter } from "../../agents/AgentNotificationCenter";
import { AgentOrchestrator } from "../../../sim/agents/agentFramework";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { CyberpunkCityBackground } from "../background/CyberpunkCityBackground";
import { NeonHorizonHeader } from "./NeonHorizonHeader";
import { NeonHorizonSubNav } from "./NeonHorizonSubNav";
import { NeonHorizonSidebar } from "./NeonHorizonSidebar";
import { NeonHorizonStatRail } from "./NeonHorizonStatRail";
import { NeonHorizonContentViewport } from "./NeonHorizonContentViewport";
import { NeonHorizonDock } from "./NeonHorizonDock";
import { NeonHorizonHeroHUD } from "../hud/NeonHorizonHeroHUD";
import { ApexAIFloatingButton } from "../hud/ApexAIFloatingButton";
import { CFDVisualizationToggle } from "../hud/CFDVisualizationToggle";
import { StageLoadingSkeleton } from "../../ui/StageLoadingSkeleton";
import { SPATIAL_SECTORS } from "../spatial/MasterSpatialNavGlobe";
import { Globe, Orbit, Compass, LayoutGrid } from "lucide-react";
import type { WorkspaceCategory } from "../../ui/UI1Layout";

// ── Lazy-loaded Stage Components for Peak Load Performance & Fast Chunking ──
const NeonCommandCenter = React.lazy(() => import("../stages/NeonCommandCenter").then(m => ({ default: m.NeonCommandCenter })));
const NeonAeroLab = React.lazy(() => import("../stages/NeonAeroLab").then(m => ({ default: m.NeonAeroLab })));
const NeonEngineStudio = React.lazy(() => import("../stages/NeonEngineStudio").then(m => ({ default: m.NeonEngineStudio })));
const NeonTrackBattle = React.lazy(() => import("../stages/NeonTrackBattle").then(m => ({ default: m.NeonTrackBattle })));
const NeonChassisStudio = React.lazy(() => import("../stages/NeonChassisStudio").then(m => ({ default: m.NeonChassisStudio })));
const NeonExteriorStudio = React.lazy(() => import("../stages/NeonExteriorStudio").then(m => ({ default: m.NeonExteriorStudio })));
const NeonInteriorStudio = React.lazy(() => import("../stages/NeonInteriorStudio").then(m => ({ default: m.NeonInteriorStudio })));
const NeonAIArchitectStudio = React.lazy(() => import("../stages/NeonAIArchitectStudio").then(m => ({ default: m.NeonAIArchitectStudio })));
const NeonFactoryFloor = React.lazy(() => import("../stages/NeonFactoryFloor").then(m => ({ default: m.NeonFactoryFloor })));
const NeonTransmissionStudio = React.lazy(() => import("../stages/NeonTransmissionStudio").then(m => ({ default: m.NeonTransmissionStudio })));
const NeonConstructorStudio = React.lazy(() => import("../stages/NeonConstructorStudio").then(m => ({ default: m.NeonConstructorStudio })));
const NeonNvhLab = React.lazy(() => import("../stages/NeonNvhLab").then(m => ({ default: m.NeonNvhLab })));
const NeonSafetyLab = React.lazy(() => import("../stages/NeonSafetyLab").then(m => ({ default: m.NeonSafetyLab })));
const NeonDynoEcuStudio = React.lazy(() => import("../stages/NeonDynoEcuStudio").then(m => ({ default: m.NeonDynoEcuStudio })));
const NeonCompetitorRadar = React.lazy(() => import("../stages/NeonCompetitorRadar").then(m => ({ default: m.NeonCompetitorRadar })));
const NeonEvBatteryStudio = React.lazy(() => import("../stages/NeonEvBatteryStudio").then(m => ({ default: m.NeonEvBatteryStudio })));
const NeonSensorLab = React.lazy(() => import("../stages/NeonSensorLab").then(m => ({ default: m.NeonSensorLab })));
const NeonDigitalTwinStudio = React.lazy(() => import("../stages/NeonDigitalTwinStudio").then(m => ({ default: m.NeonDigitalTwinStudio })));
const NeonPressReviewsStudio = React.lazy(() => import("../stages/NeonPressReviewsStudio").then(m => ({ default: m.NeonPressReviewsStudio })));
const NeonEconomyStudio = React.lazy(() => import("../stages/NeonEconomyStudio").then(m => ({ default: m.NeonEconomyStudio })));
const Neon3DGraphicsStudio = React.lazy(() => import("../stages/Neon3DGraphicsStudio").then(m => ({ default: m.Neon3DGraphicsStudio })));
const NeonMotorsportStudio = React.lazy(() => import("../stages/NeonMotorsportStudio").then(m => ({ default: m.NeonMotorsportStudio })));
const NeonRDCenterStudio = React.lazy(() => import("../stages/NeonRDCenterStudio").then(m => ({ default: m.NeonRDCenterStudio })));
const NeonGarageStudio = React.lazy(() => import("../stages/NeonGarageStudio").then(m => ({ default: m.NeonGarageStudio })));
const NeonComparisonStudio = React.lazy(() => import("../stages/NeonComparisonStudio").then(m => ({ default: m.NeonComparisonStudio })));
const NeonSimulationStudio = React.lazy(() => import("../stages/NeonSimulationStudio").then(m => ({ default: m.NeonSimulationStudio })));
const NeonAudioStudio = React.lazy(() => import("../stages/NeonAudioStudio").then(m => ({ default: m.NeonAudioStudio })));
const NeonLeaderboardStudio = React.lazy(() => import("../stages/NeonLeaderboardStudio").then(m => ({ default: m.NeonLeaderboardStudio })));
const NeonWindTunnelPro = React.lazy(() => import("../stages/NeonWindTunnelPro").then(m => ({ default: m.NeonWindTunnelPro })));
const NeonHomologationStudio = React.lazy(() => import("../stages/NeonHomologationStudio").then(m => ({ default: m.NeonHomologationStudio })));
const NeonEnduranceStudio = React.lazy(() => import("../stages/NeonEnduranceStudio").then(m => ({ default: m.NeonEnduranceStudio })));
const NeonAutonomousStudio = React.lazy(() => import("../stages/NeonAutonomousStudio").then(m => ({ default: m.NeonAutonomousStudio })));
const NeonImmersionCoolingStudio = React.lazy(() => import("../stages/NeonImmersionCoolingStudio").then(m => ({ default: m.NeonImmersionCoolingStudio })));
const NeonTireDynamicsStudio = React.lazy(() => import("../stages/NeonTireDynamicsStudio").then(m => ({ default: m.NeonTireDynamicsStudio })));
const NeonBrakeLabStudio = React.lazy(() => import("../stages/NeonBrakeLabStudio").then(m => ({ default: m.NeonBrakeLabStudio })));
const NeonFourWheelSteerStudio = React.lazy(() => import("../stages/NeonFourWheelSteerStudio").then(m => ({ default: m.NeonFourWheelSteerStudio })));
const NeonActiveSuspensionStudio = React.lazy(() => import("../stages/NeonActiveSuspensionStudio").then(m => ({ default: m.NeonActiveSuspensionStudio })));
const NeonTorqueVectoringStudio = React.lazy(() => import("../stages/NeonTorqueVectoringStudio").then(m => ({ default: m.NeonTorqueVectoringStudio })));
const NeonVariableCompressionStudio = React.lazy(() => import("../stages/NeonVariableCompressionStudio").then(m => ({ default: m.NeonVariableCompressionStudio })));
const NeonPorpoisingLabStudio = React.lazy(() => import("../stages/NeonPorpoisingLabStudio").then(m => ({ default: m.NeonPorpoisingLabStudio })));
const NeonUltraCapacitorStudio = React.lazy(() => import("../stages/NeonUltraCapacitorStudio").then(m => ({ default: m.NeonUltraCapacitorStudio })));
const NeonDiffuserStudio = React.lazy(() => import("../stages/NeonDiffuserStudio").then(m => ({ default: m.NeonDiffuserStudio })));
const NeonCarbonAutoclaveStudio = React.lazy(() => import("../stages/NeonCarbonAutoclaveStudio").then(m => ({ default: m.NeonCarbonAutoclaveStudio })));
const NeonPlasmaActuatorStudio = React.lazy(() => import("../stages/NeonPlasmaActuatorStudio").then(m => ({ default: m.NeonPlasmaActuatorStudio })));
const NeonSicInverterStudio = React.lazy(() => import("../stages/NeonSicInverterStudio").then(m => ({ default: m.NeonSicInverterStudio })));
const NeonMagneRideStudio = React.lazy(() => import("../stages/NeonMagneRideStudio").then(m => ({ default: m.NeonMagneRideStudio })));
const NeonSDuctStudio = React.lazy(() => import("../stages/NeonSDuctStudio").then(m => ({ default: m.NeonSDuctStudio })));
const NeonVortexGeneratorStudio = React.lazy(() => import("../stages/NeonVortexGeneratorStudio").then(m => ({ default: m.NeonVortexGeneratorStudio })));
const NeonFlywheelKersStudio = React.lazy(() => import("../stages/NeonFlywheelKersStudio").then(m => ({ default: m.NeonFlywheelKersStudio })));
const NeonSplitterSkirtStudio = React.lazy(() => import("../stages/NeonSplitterSkirtStudio").then(m => ({ default: m.NeonSplitterSkirtStudio })));
const NeonMorphingAeroStudio = React.lazy(() => import("../stages/NeonMorphingAeroStudio").then(m => ({ default: m.NeonMorphingAeroStudio })));
const NeonFenderLouverStudio = React.lazy(() => import("../stages/NeonFenderLouverStudio").then(m => ({ default: m.NeonFenderLouverStudio })));
const NeonVgtTurboStudio = React.lazy(() => import("../stages/NeonVgtTurboStudio").then(m => ({ default: m.NeonVgtTurboStudio })));
const NeonBlownWingStudio = React.lazy(() => import("../stages/NeonBlownWingStudio").then(m => ({ default: m.NeonBlownWingStudio })));
const NeonSkidSparkStudio = React.lazy(() => import("../stages/NeonSkidSparkStudio").then(m => ({ default: m.NeonSkidSparkStudio })));
const NeonBoundaryLayerSuctionStudio = React.lazy(() => import("../stages/NeonBoundaryLayerSuctionStudio").then(m => ({ default: m.NeonBoundaryLayerSuctionStudio })));
const NeonThermalPcmStudio = React.lazy(() => import("../stages/NeonThermalPcmStudio").then(m => ({ default: m.NeonThermalPcmStudio })));
const NeonGrandStudioHub = React.lazy(() => import("../stages/NeonGrandStudioHub").then(m => ({ default: m.NeonGrandStudioHub })));
const NeonHiggsfieldStudio = React.lazy(() => import("../stages/NeonHiggsfieldStudio").then(m => ({ default: m.NeonHiggsfieldStudio })));

// ── Lazy-loaded Spatial Nav & Overlay Components ──
const MasterSpatialNavGlobe = React.lazy(() => import("../spatial/MasterSpatialNavGlobe").then(m => ({ default: m.MasterSpatialNavGlobe })));
const SpatialConstellationMap = React.lazy(() => import("../spatial/SpatialConstellationMap").then(m => ({ default: m.SpatialConstellationMap })));
const SectorEntryAnimationLayer = React.lazy(() => import("../spatial/SectorEntryAnimationLayer").then(m => ({ default: m.SectorEntryAnimationLayer })));
const CinematicGlobeBootSequence = React.lazy(() => import("../spatial/CinematicGlobeBootSequence").then(m => ({ default: m.CinematicGlobeBootSequence })));
const CinematicBlueprintXRayOverlay = React.lazy(() => import("../spatial/CinematicBlueprintXRayOverlay").then(m => ({ default: m.CinematicBlueprintXRayOverlay })));
const CinematicEngineeringHUD = React.lazy(() => import("../spatial/CinematicEngineeringHUD").then(m => ({ default: m.CinematicEngineeringHUD })));
const NeonHorizonCommandPalette = React.lazy(() => import("../interactive/NeonHorizonCommandPalette").then(m => ({ default: m.NeonHorizonCommandPalette })));
const NeonHorizonSaveDialog = React.lazy(() => import("../interactive/NeonHorizonSaveDialog").then(m => ({ default: m.NeonHorizonSaveDialog })));
const NeonHorizonOrbitalStageNavigator = React.lazy(() => import("./NeonHorizonOrbitalStageNavigator").then(m => ({ default: m.NeonHorizonOrbitalStageNavigator })));
const SaveLoadDialog = React.lazy(() => import("../../SaveLoadDialog").then(m => ({ default: m.SaveLoadDialog })));
const CommandPalette = React.lazy(() => import("../../CommandPalette").then(m => ({ default: m.CommandPalette })));

interface StageItem {
  id: Stage;
  label: string;
  icon: React.ReactNode;
  category: WorkspaceCategory;
}

const STAGES: StageItem[] = [
  // --- Engineering Studio ---
  { id: "command", label: "Command Center", icon: <Layers size={14} />, category: "engineering" },
  { id: "engine", label: "Engine", icon: <Cog size={14} />, category: "engineering" },
  { id: "vehicle", label: "Vehicle Studio", icon: <Car size={14} />, category: "engineering" },
  { id: "interior", label: "Interior", icon: <Sofa size={14} />, category: "engineering" },
  { id: "manufacturing", label: "Manufacturing", icon: <Factory size={14} />, category: "engineering" },
  { id: "infotainment", label: "Electronics", icon: <Monitor size={14} />, category: "engineering" },
  { id: "safety", label: "Safety Center", icon: <ShieldCheck size={14} />, category: "engineering" },

  // --- Design Studios Hub ---
  { id: "studio", label: "Grand Studio Hub", icon: <SparklesIcon size={14} />, category: "studios" },
  { id: "graphics3d", label: "3D Viewport Studio", icon: <Box size={14} />, category: "studios" },
  { id: "suspension3d", label: "3D Suspension Studio", icon: <Activity size={14} />, category: "studios" },
  { id: "transmission3d", label: "3D Transmission Studio", icon: <Cog size={14} />, category: "studios" },
  { id: "ai", label: "Apex AI Studio", icon: <Bot size={14} />, category: "studios" },
  { id: "higgsfield", label: "Higgsfield AI Suite", icon: <SparklesIcon size={14} />, category: "studios" },
  { id: "nvh", label: "NVH Audio Studio", icon: <Volume2 size={14} />, category: "studios" },

  // --- Simulation & Testing ---
  { id: "simulation", label: "Simulation", icon: <Activity size={14} />, category: "simulation" },
  { id: "testing", label: "Testing Lab", icon: <Flame size={14} />, category: "simulation" },
  { id: "race", label: "Race Track", icon: <Flag size={14} />, category: "simulation" },
  { id: "stats", label: "Telemetry Stats", icon: <BarChart3 size={14} />, category: "simulation" },

  // --- World & Racing ---
  { id: "garage", label: "Garage", icon: <Car size={14} />, category: "world" },
  { id: "motorsport", label: "Motorsport", icon: <Trophy size={14} />, category: "world" },
];

const WORKSPACE_CATEGORIES: { id: WorkspaceCategory; label: string; icon: React.ReactNode }[] = [
  { id: "engineering", label: "Engineering Studio", icon: <Wrench size={14} /> },
  { id: "studios", label: "Design Studios", icon: <SparklesIcon size={14} /> },
  { id: "simulation", label: "Sim & Testing", icon: <Activity size={14} /> },
  { id: "world", label: "World & Racing", icon: <Trophy size={14} /> },
];

export function NeonHorizonShell() {
  const [stage, setStage] = useState<Stage>("command");
  const [activeCategory, setActiveCategory] = useState<WorkspaceCategory>("engineering");
  const [sceneMode, setSceneMode] = useState<"track" | "wind_tunnel" | "lab" | "rd" | "showroom">("track");
  const [cfdEnabled, setCfdEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [dialog, setDialog] = useState<{ open: boolean; mode: "save" | "load" }>({ open: false, mode: "save" });
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [orbitalNavOpen, setOrbitalNavOpen] = useState(false);
  const [spatialNavExpanded, setSpatialNavExpanded] = useState(false);
  const [heroHudVisible, setHeroHudVisible] = useState(true);
  const [bootIntroOpen, setBootIntroOpen] = useState(false);
  const [blueprintOpen, setBlueprintOpen] = useState(false);
  const [isEngineeringMode, setIsEngineeringMode] = useState(false);

  const { design, sim, updateEngine, resetDesign, units, setUnits, uiTheme, setUiTheme } = useDesign();
  const { company, advanceAllSystems } = useCompany();

  const activeCategoryStages = STAGES.filter((s) => s.category === activeCategory);

  const handleStageSelect = (st: Stage) => {
    if (soundEnabled) playHMIClickSound();
    setStage(st);
  };

  const handleCategorySelect = (cat: WorkspaceCategory) => {
    if (soundEnabled) playHMITabSound();
    setActiveCategory(cat);
    const first = STAGES.find((s) => s.category === cat);
    if (first && !STAGES.filter((s) => s.category === cat).some((s) => s.id === stage)) {
      setStage(first.id);
    }
  };

  // Sync category when stage changes
  useEffect(() => {
    const item = STAGES.find((s) => s.id === stage);
    if (item && item.category !== activeCategory) {
      setActiveCategory(item.category);
    }
  }, [stage]);

  // Idle Stage Warming for smooth zero-lag tab transitions
  useEffect(() => {
    const prefetch = () => {
      import("../stages/NeonCommandCenter");
      import("../stages/NeonAeroLab");
      import("../stages/NeonEngineStudio");
      import("../stages/NeonChassisStudio");
      import("../spatial/MasterSpatialNavGlobe");
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as any).requestIdleCallback(prefetch, { timeout: 2500 });
    } else {
      const timer = setTimeout(prefetch, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-sky-400/20 selection:text-sky-200 overflow-x-hidden">
      {/* 1. Multi-Layer Cyberpunk Metropolis Parallax Background */}
      <CyberpunkCityBackground
        scene={sceneMode === "wind_tunnel" || stage === "aero" ? 2 : 1}
        particlesEnabled={particlesEnabled}
        gridEnabled={particlesEnabled}
        parallaxIntensity={1.2}
      />

      {/* 2. Top Navigation Bar */}
      <NeonHorizonHeader
        categories={WORKSPACE_CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
        month={company.economy.month}
        revenue={company.totalRevenue}
        onAdvanceMonth={advanceAllSystems}
        units={units}
        onSetUnits={setUnits}
        onOpenSearch={() => setCmdPaletteOpen(true)}
        onSave={() => setDialog({ open: true, mode: "save" })}
        onLoad={() => setDialog({ open: true, mode: "load" })}
        onReset={resetDesign}
        uiTheme={uiTheme}
        onSetUiTheme={setUiTheme}
      />

      {/* 3. Sub-Header Stage Tab Ribbon */}
      <NeonHorizonSubNav
        stages={activeCategoryStages}
        activeStage={stage}
        onSelectStage={handleStageSelect}
        onOpenOrbitalNav={() => setOrbitalNavOpen(true)}
        onReplayBoot={() => setBootIntroOpen(true)}
      />

      {/* 4. Main Futuristic Viewport Body */}
      <main className="flex-1 max-w-full px-6 py-4 pb-36 flex flex-col gap-5 relative z-10">
        {/* Dynamic Sector Entry Animation Layer */}
        {(() => {
          const activeSectorDef = SPATIAL_SECTORS.find((s) => s.id === stage) ?? SPATIAL_SECTORS[0];
          return <SectorEntryAnimationLayer stage={stage} accentHue={activeSectorDef.hue} />;
        })()}

        {/* Master 3D Spatial Planetary Navigation Console */}
        {(() => {
          const activeSectorDef = SPATIAL_SECTORS.find((s) => s.id === stage) ?? SPATIAL_SECTORS[0];
          const activeSectorHue = activeSectorDef.hue;

          return (
            <div className="relative rounded-3xl bg-slate-950/80 border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] p-4 backdrop-blur-2xl transition-all duration-500 overflow-hidden">
              {/* Header Bar with Mode Toggle */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-white/10 select-none">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300"
                    style={{
                      background: `hsl(${activeSectorHue} 95% 60% / 0.25)`,
                      color: `hsl(${activeSectorHue} 95% 80%)`,
                      border: `1px solid hsl(${activeSectorHue} 90% 70% / 0.5)`,
                    }}
                  >
                    {activeSectorDef.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white tracking-wide">3D SPATIAL NAVIGATION HUB</span>
                      <span
                        className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase"
                        style={{
                          background: `hsl(${activeSectorHue} 90% 60% / 0.18)`,
                          color: `hsl(${activeSectorHue} 95% 80%)`,
                          border: `1px solid hsl(${activeSectorHue} 90% 70% / 0.35)`,
                        }}
                      >
                        {activeSectorDef.cardinal}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">{activeSectorDef.description}</p>
                  </div>
                </div>

                {/* View Mode Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSpatialNavExpanded(!spatialNavExpanded)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${
                      spatialNavExpanded
                        ? "bg-sky-500/20 text-sky-300 border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                        : "bg-white/5 text-slate-300 hover:text-white border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <Orbit size={13} className={spatialNavExpanded ? "animate-spin text-sky-400" : "text-slate-400"} />
                    <span>{spatialNavExpanded ? "COLLAPSE SPHERE" : "EXPLORE 3D PLANETARY SPHERE"}</span>
                  </button>
                </div>
              </div>

              {/* Expanded View: Full 3D Sphere & Constellation Radar */}
              {spatialNavExpanded ? (
                <div className="grid lg:grid-cols-[1fr_320px] gap-4 mt-4 animate-nh-materialize items-center">
                  <MasterSpatialNavGlobe
                    activeStage={stage}
                    onSelectStage={handleStageSelect}
                    isCompact={false}
                  />
                  <div className="flex flex-col gap-3">
                    <SpatialConstellationMap
                      activeStage={stage}
                      onSelectStage={handleStageSelect}
                      compact={false}
                    />
                  </div>
                </div>
              ) : (
                /* Compact Spatial Ribbon: Quick Constellation Navigation */
                <div className="flex items-center justify-between gap-3 mt-3 overflow-x-auto scrollbar-none py-1">
                  <div className="flex items-center gap-2">
                    {SPATIAL_SECTORS.map((sec) => {
                      const isCurrent = stage === sec.id;
                      const nHue = sec.hue;
                      return (
                        <button
                          key={`quick-sec-${sec.id}`}
                          onClick={() => handleStageSelect(sec.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                            isCurrent
                              ? "text-white shadow-lg scale-105"
                              : "text-slate-400 hover:text-slate-200 border-white/8 hover:bg-white/5"
                          }`}
                          style={
                            isCurrent
                              ? {
                                  borderColor: `hsl(${nHue} 90% 70% / 0.7)`,
                                  background: `hsl(${nHue} 90% 60% / 0.18)`,
                                  boxShadow: `0 0 16px hsl(${nHue} 90% 60% / 0.25)`,
                                }
                              : undefined
                          }
                        >
                          <span style={{ color: isCurrent ? `hsl(${nHue} 95% 80%)` : undefined }}>{sec.icon}</span>
                          <span>{sec.label}</span>
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="hidden xl:flex items-center gap-1.5 text-sky-400/70 font-mono text-[10px] uppercase font-bold shrink-0">
                    <Compass size={11} className="animate-spin" />
                    <span>SPATIAL MAPPING ACTIVE</span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Cinematic Engineering Operating System HUD */}
        <CinematicEngineeringHUD
          enginePowerHp={sim.peakPower}
          engineTorqueNm={sim.peakTorque}
          isEngineeringMode={isEngineeringMode}
          onToggleEngineeringMode={() => setIsEngineeringMode(!isEngineeringMode)}
          onOpenBlueprint={() => setBlueprintOpen(true)}
        />

        {/* Hero 3D HUD (Rendered when in command or vehicle view) */}
        {(stage === "command" || stage === "vehicle" || stage === "aero") && (
          <div className="animate-nh-materialize">
            <NeonHorizonHeroHUD
              peakPower={sim.peakPower}
              peakTorque={sim.peakTorque}
              weight={sim.weight}
              dragCoeff={sim.dragCoeff}
              topSpeed={sim.topSpeed}
              downforce={sim.downforce}
              onSelectSubsystem={handleStageSelect}
            />
          </div>
        )}

        {/* Middle Stage Workspace Layout */}
        <div className="flex gap-5">
          {/* Left Quick Navigation Sidebar */}
          <NeonHorizonSidebar
            activeStage={stage}
            onSelectStage={handleStageSelect}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            particlesEnabled={particlesEnabled}
            onToggleParticles={() => setParticlesEnabled(!particlesEnabled)}
          />

          {/* Center Stage Viewport */}
          <NeonHorizonContentViewport activeStage={stage} onSelectStage={handleStageSelect}>
            <React.Suspense fallback={<StageLoadingSkeleton stageName={stage} />}>
              {stage === "command" ? (
                <NeonCommandCenter onSelectStage={(st) => handleStageSelect(st as Stage)} />
              ) : stage === "aero" ? (
                <NeonAeroLab />
              ) : stage === "wind_tunnel" ? (
                <NeonWindTunnelPro />
              ) : stage === "engine" ? (
                <NeonEngineStudio />
              ) : stage === "dyno_ecu" ? (
                <NeonDynoEcuStudio />
              ) : stage === "track_battle" || stage === "race" || stage === "track_layout" ? (
                <NeonTrackBattle />
              ) : stage === "vehicle" || stage === "suspension3d" ? (
                <NeonChassisStudio />
              ) : stage === "exterior" ? (
                <NeonExteriorStudio />
              ) : stage === "interior" || stage === "infotainment" ? (
                <NeonInteriorStudio />
              ) : stage === "ai" ? (
                <NeonAIArchitectStudio />
              ) : stage === "higgsfield" ? (
                <NeonHiggsfieldStudio />
              ) : stage === "manufacturing" || stage === "supplyChain" ? (
                <NeonFactoryFloor />
              ) : stage === "transmission3d" ? (
                <NeonTransmissionStudio />
              ) : stage === "f1_constructor" || stage === "hypercar_constructor" ? (
                <NeonConstructorStudio />
              ) : stage === "nvh" || stage === "audio" || stage === "acoustics" || stage === "sound" ? (
                <NeonAudioStudio />
              ) : stage === "safety" ? (
                <NeonSafetyLab />
              ) : stage === "competitors" || stage === "sales" ? (
                <NeonCompetitorRadar />
              ) : stage === "compare" ? (
                <NeonComparisonStudio />
              ) : stage === "garage" ? (
                <NeonGarageStudio />
              ) : stage === "homologation" ? (
                <NeonHomologationStudio />
              ) : stage === "endurance" ? (
                <NeonEnduranceStudio />
              ) : stage === "autonomous" ? (
                <NeonAutonomousStudio />
              ) : stage === "immersion" ? (
                <NeonImmersionCoolingStudio />
              ) : stage === "tires" ? (
                <NeonTireDynamicsStudio />
              ) : stage === "brakes" ? (
                <NeonBrakeLabStudio />
              ) : stage === "4ws" ? (
                <NeonFourWheelSteerStudio />
              ) : stage === "active_suspension" ? (
                <NeonActiveSuspensionStudio />
              ) : stage === "torque_vectoring" ? (
                <NeonTorqueVectoringStudio />
              ) : stage === "variable_compression" ? (
                <NeonVariableCompressionStudio />
              ) : stage === "porpoising" ? (
                <NeonPorpoisingLabStudio />
              ) : stage === "ultracapacitor" ? (
                <NeonUltraCapacitorStudio />
              ) : stage === "diffuser" ? (
                <NeonDiffuserStudio />
              ) : stage === "autoclave" ? (
                <NeonCarbonAutoclaveStudio />
              ) : stage === "plasma" ? (
                <NeonPlasmaActuatorStudio />
              ) : stage === "sic_inverter" ? (
                <NeonSicInverterStudio />
              ) : stage === "magneride" ? (
                <NeonMagneRideStudio />
              ) : stage === "sduct" ? (
                <NeonSDuctStudio />
              ) : stage === "vortex" ? (
                <NeonVortexGeneratorStudio />
              ) : stage === "flywheel" ? (
                <NeonFlywheelKersStudio />
              ) : stage === "splitter_skirt" ? (
                <NeonSplitterSkirtStudio />
              ) : stage === "morphing_aero" ? (
                <NeonMorphingAeroStudio />
              ) : stage === "fender_louvers" ? (
                <NeonFenderLouverStudio />
              ) : stage === "vgt_turbo" ? (
                <NeonVgtTurboStudio />
              ) : stage === "blown_wing" ? (
                <NeonBlownWingStudio />
              ) : stage === "skid_spark" ? (
                <NeonSkidSparkStudio />
              ) : stage === "boundary_suction" ? (
                <NeonBoundaryLayerSuctionStudio />
              ) : stage === "thermal_pcm" ? (
                <NeonThermalPcmStudio />
              ) : stage === "leaderboard" || stage === "records" ? (
                <NeonLeaderboardStudio />
              ) : stage === "simulation" || stage === "testing" || stage === "stats" ? (
                <NeonSimulationStudio />
              ) : stage === "battery" ? (
                <NeonEvBatteryStudio />
              ) : stage === "sensors" ? (
                <NeonSensorLab />
              ) : stage === "twin" ? (
                <NeonDigitalTwinStudio />
              ) : stage === "press" ? (
                <NeonPressReviewsStudio />
              ) : stage === "economy" ? (
                <NeonEconomyStudio />
              ) : stage === "studio" || stage === "grand_studio" ? (
                <NeonGrandStudioHub />
              ) : stage === "graphics3d" ? (
                <Neon3DGraphicsStudio />
              ) : stage === "motorsport" ? (
                <NeonMotorsportStudio />
              ) : stage === "rd" ? (
                <NeonRDCenterStudio />
              ) : (
                <StageSwitcher stage={stage} onSelectStage={(st) => handleStageSelect(st as Stage)} />
              )}
            </React.Suspense>
          </NeonHorizonContentViewport>

          {/* Right Dual-Column Stat Rail */}
          <NeonHorizonStatRail sim={sim} design={design} />
        </div>
      </main>

      {/* 5. Bottom Floating Controls Bar */}
      <div className="fixed bottom-4 inset-x-0 z-40 max-w-7xl mx-auto px-6 pointer-events-none">
        <div className="pointer-events-auto flex justify-center">
          <CFDVisualizationToggle enabled={cfdEnabled} onChange={setCfdEnabled} />
        </div>
      </div>

      {/* 6. Vision Glass Interactive Dock Bar */}
      <NeonHorizonDock
        activeStage={stage}
        onSelectStage={handleStageSelect}
        sceneMode={sceneMode}
        onSelectSceneMode={setSceneMode}
      />

      {/* 7. Floating Apex AI Assistant Pill Button */}
      <ApexAIFloatingButton onOpenStudio={() => handleStageSelect("ai")} />

      {/* 8. Overlays & Dialogs */}
      <React.Suspense fallback={null}>
        {bootIntroOpen && (
          <CinematicGlobeBootSequence onComplete={() => setBootIntroOpen(false)} />
        )}

        <CinematicBlueprintXRayOverlay
          isOpen={blueprintOpen}
          onClose={() => setBlueprintOpen(false)}
        />

        <NeonHorizonOrbitalStageNavigator
          isOpen={orbitalNavOpen}
          onClose={() => setOrbitalNavOpen(false)}
          stages={STAGES}
          activeStage={stage}
          activeCategory={activeCategory}
          onSelectStage={(st) => {
            handleStageSelect(st);
            setOrbitalNavOpen(false);
          }}
          onSelectCategory={handleCategorySelect}
        />
        <NeonHorizonSaveDialog
          open={dialog.open}
          mode={dialog.mode}
          onClose={() => setDialog({ open: false, mode: dialog.mode })}
        />
        <NeonHorizonCommandPalette
          isOpen={cmdPaletteOpen}
          onClose={() => setCmdPaletteOpen(false)}
          onSelectStage={(s) => handleStageSelect(s as Stage)}
        />
      </React.Suspense>
      <ThermalAlertMonitor />
      <AgentNotificationCenter
        findings={AgentOrchestrator.getInstance().getAggregateFindings()}
        onApplyRecommendation={(rec: any) => updateEngine(rec.changes)}
      />
    </div>
  );
}
