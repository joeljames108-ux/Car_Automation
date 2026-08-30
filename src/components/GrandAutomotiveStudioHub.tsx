/**
 * ============================================================================
 * GRAND AUTOMOTIVE ENGINEERING STUDIO HUB — UPGRADED
 * ============================================================================
 * Unified flagship control center connecting all studio modules with:
 * - Category-grouped collapsible navigation
 * - Quick preset toolbar (Race Weekend, Design Review, Track Day, Full Factory)
 * - Studio status indicators (configured/needs attention/not visited)
 * - Breadcrumb trail navigation
 * - Keyboard shortcuts (Ctrl+1-9, Ctrl+[ / Ctrl+])
 * - Recent studios quick-access
 * - Smooth AnimatePresence transitions
 * ============================================================================
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Car,
  Flame,
  Layers,
  Cpu,
  Activity,
  Volume2,
  VolumeX,
  Sparkles,
  Wind,
  Factory,
  Box,
  GitCompare,
  Bot,
  Gauge,
  Trophy,
  Navigation,
  Cog,
  ChevronDown,
  ChevronRight,
  Zap,
  Settings,
  Clock,
  Target,
  Layers as LayersIcon,
  ArrowLeftRight,
  History,
  Star,
  HelpCircle,
  Flag,
} from "lucide-react";
import { MasterEngineAudioSynthesizer } from "../sim/audio/masterEngineAudioSynthesizer";

// Lazy-loaded studio modules for optimal bundle splitting
const MasterVehicleStudio = React.lazy(() => import("./vehicleAssembly/MasterVehicleStudio").then(m => ({ default: m.MasterVehicleStudio })));
const PowertrainDynoStudio = React.lazy(() => import("./powertrain/PowertrainDynoStudio").then(m => ({ default: m.PowertrainDynoStudio })));
const InteriorsDesigner = React.lazy(() => import("./InteriorsDesigner").then(m => ({ default: m.InteriorsDesigner })));
const RoboticFactorySequencer = React.lazy(() => import("./assembly/RoboticFactorySequencer").then(m => ({ default: m.RoboticFactorySequencer })));
const SuspensionMasterStudio = React.lazy(() => import("./chassis/SuspensionMasterStudio").then(m => ({ default: m.SuspensionMasterStudio })));
const AeroLab = React.lazy(() => import("./AeroLab").then(m => ({ default: m.AeroLab })));
const WindTunnelAeroStudio = React.lazy(() => import("./aerodynamics/WindTunnelAeroStudio").then(m => ({ default: m.WindTunnelAeroStudio })));
const TrackBattlesStudio = React.lazy(() => import("./telemetry/TrackBattlesStudio").then(m => ({ default: m.TrackBattlesStudio })));
const TrackLayoutMasterStudio = React.lazy(() => import("./trackLayouts/TrackLayoutMasterStudio").then(m => ({ default: m.TrackLayoutMasterStudio })));
const ManufacturingDesigner = React.lazy(() => import("./ManufacturingDesigner").then(m => ({ default: m.ManufacturingDesigner })));
const EngineAndCar3DGraphicsViewport = React.lazy(() => import("./vehicleAssembly/EngineAndCar3DGraphicsViewport").then(m => ({ default: m.EngineAndCar3DGraphicsViewport })));
const VehicleComparisonStudio = React.lazy(() => import("./vehicleAssembly/VehicleComparisonStudio").then(m => ({ default: m.VehicleComparisonStudio })));
const NvhSoundLab = React.lazy(() => import("./NvhSoundLab").then(m => ({ default: m.NvhSoundLab })));
const ApexAIStudio = React.lazy(() => import("./ApexAIStudio").then(m => ({ default: m.ApexAIStudio })));
const Transmission3DStudio = React.lazy(() => import("./transmissionStudio/Transmission3DStudio").then(m => ({ default: m.Transmission3DStudio })));
const InteriorDashboardConfiguratorStudio = React.lazy(() => import("./interior/InteriorDashboardConfiguratorStudio").then(m => ({ default: m.InteriorDashboardConfiguratorStudio })));

export type GrandStudioTab =
  | "vehicle_studio"
  | "transmission_studio"
  | "dyno_ecu_studio"
  | "suspension_studio"
  | "interior_studio"
  | "interior_dashboard_studio"
  | "aero_cfd_studio"
  | "aero_3d_studio"
  | "track_battle_studio"
  | "track_layout_studio"
  | "graphics3d_studio"
  | "compare_studio"
  | "nvh_studio"
  | "ai_studio"
  | "manufacturing_studio"
  | "factory_line";

export type StudioCategory =
  | "engineering"
  | "aerodynamics"
  | "track_racing"
  | "cockpit_factory"
  | "analytics"
  | "viewport";

export type StudioStatus = "configured" | "needs_attention" | "not_visited";

interface StudioTabConfig {
  id: GrandStudioTab;
  label: string;
  icon: React.ReactNode;
  category: StudioCategory;
  shortcut?: number;
  description: string;
}

interface StudioCategoryConfig {
  id: StudioCategory;
  label: string;
  icon: React.ReactNode;
  color: string;
  tabs: GrandStudioTab[];
}

interface PresetConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  studios: GrandStudioTab[];
  color: string;
}

const STUDIO_TABS: StudioTabConfig[] = [
  { id: "vehicle_studio", label: "Vehicle Assembly", icon: <Car size={14} />, category: "engineering", shortcut: 1, description: "Complete 3D vehicle assembly with exploded views, X-Ray mode, and aero streamlines" },
  { id: "transmission_studio", label: "3D Transmission", icon: <Cog size={14} />, category: "engineering", shortcut: 2, description: "Interactive transmission with gear ratio calculator and shift pattern animator" },
  { id: "suspension_studio", label: "3D Suspension", icon: <Activity size={14} />, category: "engineering", shortcut: 3, description: "Suspension kinematics with ride height sweep and damper histograms" },
  { id: "aero_cfd_studio", label: "CFD Wind Tunnel", icon: <Wind size={14} />, category: "aerodynamics", shortcut: 4, description: "Live pressure coefficient display, aero balance maps, and DRS effect preview" },
  { id: "aero_3d_studio", label: "3D Aero Lab", icon: <Wind size={14} />, category: "aerodynamics", description: "3D parametric aero surfaces, downforce polars, and CFD streamline laboratory" },
  { id: "track_battle_studio", label: "Track Battles", icon: <Trophy size={14} />, category: "track_racing", shortcut: 5, description: "Telemetry replay with sector deltas and overtake analysis" },
  { id: "track_layout_studio", label: "Track Layouts", icon: <Navigation size={14} />, category: "track_racing", shortcut: 6, description: "Interactive track geometry with apex markers and elevation profiles" },
  { id: "interior_studio", label: "Cockpit Studio", icon: <LayersIcon size={14} />, category: "cockpit_factory", shortcut: 7, description: "Cockpit ergonomics, driver fit, and interior systems design" },
  { id: "interior_dashboard_studio", label: "2D Dashboard Configurator", icon: <LayersIcon size={14} />, category: "cockpit_factory", description: "Real-time 2D dashboard configurator with live SVG viewport, presets, and stats" },
  { id: "manufacturing_studio", label: "Manufacturing", icon: <Factory size={14} />, category: "cockpit_factory", description: "Production line design and process optimization" },
  { id: "factory_line", label: "Robotic Factory", icon: <Cpu size={14} />, category: "cockpit_factory", description: "Robotic assembly sequencing and cycle time analysis" },
  { id: "dyno_ecu_studio", label: "Dyno & ECU", icon: <Gauge size={14} />, category: "analytics", shortcut: 8, description: "Live dyno pulls, ECU map overlays, and power loss breakdown" },
  { id: "compare_studio", label: "Comparison", icon: <GitCompare size={14} />, category: "analytics", description: "Side-by-side vehicle specification comparison" },
  { id: "nvh_studio", label: "NVH Audio", icon: <Volume2 size={14} />, category: "analytics", description: "Noise, vibration, and harshness acoustic analysis" },
  { id: "ai_studio", label: "Apex AI Studio", icon: <Bot size={14} />, category: "analytics", description: "AI-powered engineering optimization and recommendations" },
  { id: "graphics3d_studio", label: "3D Viewport", icon: <Box size={14} />, category: "viewport", description: "Photorealistic 3D engine and car graphics viewport" },
];

const STUDIO_CATEGORIES: StudioCategoryConfig[] = [
  {
    id: "engineering",
    label: "Core Engineering",
    icon: <Settings size={14} />,
    color: "cyan",
    tabs: ["vehicle_studio", "transmission_studio", "suspension_studio"],
  },
  {
    id: "aerodynamics",
    label: "Aerodynamics",
    icon: <Wind size={14} />,
    color: "sky",
    tabs: ["aero_cfd_studio", "aero_3d_studio"],
  },
  {
    id: "track_racing",
    label: "Track & Telemetry",
    icon: <Trophy size={14} />,
    color: "orange",
    tabs: ["track_battle_studio", "track_layout_studio"],
  },
  {
    id: "cockpit_factory",
    label: "Cockpit & Factory",
    icon: <LayersIcon size={14} />,
    color: "amber",
    tabs: ["interior_dashboard_studio", "interior_studio", "manufacturing_studio", "factory_line"],
  },
  {
    id: "analytics",
    label: "Analytics & AI",
    icon: <Zap size={14} />,
    color: "violet",
    tabs: ["dyno_ecu_studio", "compare_studio", "nvh_studio", "ai_studio"],
  },
  {
    id: "viewport",
    label: "3D Viewport",
    icon: <Box size={14} />,
    color: "emerald",
    tabs: ["graphics3d_studio"],
  },
];

const QUICK_PRESETS: PresetConfig[] = [
  {
    id: "race_weekend",
    label: "Race Weekend",
    icon: <Trophy size={14} />,
    description: "Aero + Suspension + Dyno for circuit optimization",
    studios: ["aero_cfd_studio", "suspension_studio", "dyno_ecu_studio"],
    color: "red",
  },
  {
    id: "design_review",
    label: "Design Review",
    icon: <LayersIcon size={14} />,
    description: "Vehicle + Interior for stakeholder review",
    studios: ["vehicle_studio", "interior_studio"],
    color: "blue",
  },
  {
    id: "track_day",
    label: "Track Day",
    icon: <Flag size={14} />,
    description: "Track Battle + Track Layout for session planning",
    studios: ["track_battle_studio", "track_layout_studio"],
    color: "orange",
  },
  {
    id: "full_factory",
    label: "Full Factory",
    icon: <Factory size={14} />,
    description: "Manufacturing + Robotic Factory for production planning",
    studios: ["manufacturing_studio", "factory_line"],
    color: "green",
  },
];

const STUDIO_COMPONENTS: Record<GrandStudioTab, React.ComponentType> = {
  vehicle_studio: MasterVehicleStudio,
  transmission_studio: Transmission3DStudio,
  dyno_ecu_studio: PowertrainDynoStudio,
  suspension_studio: SuspensionMasterStudio,
  interior_studio: InteriorsDesigner,
  interior_dashboard_studio: InteriorDashboardConfiguratorStudio,
  aero_cfd_studio: WindTunnelAeroStudio,
  aero_3d_studio: AeroLab,
  track_battle_studio: TrackBattlesStudio,
  track_layout_studio: TrackLayoutMasterStudio,
  graphics3d_studio: EngineAndCar3DGraphicsViewport,
  compare_studio: VehicleComparisonStudio,
  nvh_studio: NvhSoundLab,
  ai_studio: ApexAIStudio,
  manufacturing_studio: ManufacturingDesigner,
  factory_line: RoboticFactorySequencer,
};

const getStatusColor = (status: StudioStatus): string => {
  switch (status) {
    case "configured": return "text-emerald-400";
    case "needs_attention": return "text-amber-400";
    default: return "text-amber-300/50";
  }
};

const getStatusTooltip = (status: StudioStatus): string => {
  switch (status) {
    case "configured": return "Configured — all parameters set";
    case "needs_attention": return "Needs attention — parameters require review";
    default: return "Not yet visited";
  }
};

const getCategoryIconStyle = (color: string): { bg: string; text: string } => {
  switch (color) {
    case "cyan": return { bg: "bg-amber-500/20", text: "text-amber-400" };
    case "sky": return { bg: "bg-sky-500/20", text: "text-sky-400" };
    case "orange": return { bg: "bg-orange-500/20", text: "text-orange-400" };
    case "amber": return { bg: "bg-amber-500/20", text: "text-amber-400" };
    case "violet": return { bg: "bg-amber-500/20", text: "text-amber-400" };
    case "emerald": return { bg: "bg-emerald-500/20", text: "text-emerald-400" };
    default: return { bg: "bg-amber-500/20", text: "text-amber-400" };
  }
};

export const GrandAutomotiveStudioHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GrandStudioTab>("vehicle_studio");
  const [audioSynthesizer] = useState(() => MasterEngineAudioSynthesizer.getInstance());
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<StudioCategory>>(
    new Set<StudioCategory>(["engineering", "aerodynamics", "track_racing"])
  );
  const [studioStatuses, setStudioStatuses] = useState<Record<GrandStudioTab, StudioStatus>>({} as Record<GrandStudioTab, StudioStatus>);
  const [visitedStudios, setVisitedStudios] = useState<Set<GrandStudioTab>>(new Set<GrandStudioTab>(["vehicle_studio"]));
  const [recentStudios, setRecentStudios] = useState<GrandStudioTab[]>(["vehicle_studio"]);
  const [showPresets, setShowPresets] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [baselineSnapshot, setBaselineSnapshot] = useState<Record<string, unknown>>({});

  // Initialize statuses
  useEffect(() => {
    const initialStatuses: Record<GrandStudioTab, StudioStatus> = {} as Record<GrandStudioTab, StudioStatus>;
    STUDIO_TABS.forEach((tab) => {
      initialStatuses[tab.id] = "not_visited";
    });
    initialStatuses["vehicle_studio"] = "configured";
    setStudioStatuses(initialStatuses);
  }, []);

  const toggleAudio = () => {
    audioSynthesizer.initAudioContext();
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    audioSynthesizer.setMuted(nextMuted);
  };

  const handleTabClick = useCallback((tabId: GrandStudioTab) => {
    setActiveTab(tabId);
    setVisitedStudios((prev) => {
      const next = new Set(prev);
      next.add(tabId);
      return next;
    });
    setRecentStudios((prev) => {
      const filtered = prev.filter((id) => id !== tabId);
      return [tabId, ...filtered].slice(0, 3);
    });
    setStudioStatuses((prev) => ({
      ...prev,
      [tabId]: prev[tabId] === "not_visited" ? "configured" : prev[tabId],
    }));
  }, []);

  const handleCategoryToggle = (categoryId: StudioCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handlePresetClick = (preset: PresetConfig) => {
    preset.studios.forEach((studioId) => {
      setStudioStatuses((prev) => ({
        ...prev,
        [studioId]: "configured",
      }));
    });
    handleTabClick(preset.studios[0]);
    setShowPresets(false);
  };

  const handleKeyboardNavigation = useCallback((e: KeyboardEvent) => {
    // Ctrl+1-9 for studio shortcuts
    if (e.ctrlKey && e.key >= "1" && e.key <= "9") {
      e.preventDefault();
      const shortcut = parseInt(e.key, 10);
      const tab = STUDIO_TABS.find((t) => t.shortcut === shortcut);
      if (tab) handleTabClick(tab.id);
    }

    // Ctrl+[ / Ctrl+] for prev/next
    if (e.ctrlKey && (e.key === "[" || e.key === "]")) {
      e.preventDefault();
      const currentIndex = STUDIO_TABS.findIndex((t) => t.id === activeTab);
      if (currentIndex !== -1) {
        const nextIndex = e.key === "[" 
          ? (currentIndex - 1 + STUDIO_TABS.length) % STUDIO_TABS.length
          : (currentIndex + 1) % STUDIO_TABS.length;
        handleTabClick(STUDIO_TABS[nextIndex].id);
      }
    }

    // Ctrl+P for presets
    if (e.ctrlKey && e.key === "p") {
      e.preventDefault();
      setShowPresets((prev) => !prev);
    }

    // Ctrl+B for compare mode
    if (e.ctrlKey && e.key === "b") {
      e.preventDefault();
      setCompareMode((prev) => !prev);
    }
  }, [activeTab, handleTabClick]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardNavigation);
    return () => window.removeEventListener("keydown", handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  const ActiveComponent = STUDIO_COMPONENTS[activeTab];

  const currentTabConfig = STUDIO_TABS.find((t) => t.id === activeTab);
  const currentCategory = STUDIO_CATEGORIES.find((c) => c.tabs.includes(activeTab));

  // Breadcrumb trail
  const breadcrumbs = useMemo(() => [
    { label: "Studio Hub", onClick: () => {} },
    ...(currentCategory ? [{ label: currentCategory.label, onClick: () => handleCategoryToggle(currentCategory.id) }] : []),
    { label: currentTabConfig?.label || activeTab, onClick: () => {}, current: true },
  ], [activeTab, currentCategory, currentTabConfig]);

  return (
    <div className="flex flex-col w-full h-full space-y-4 p-2 sm:p-4 select-none">
      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4 z-50 bg-amber-950/95 backdrop-blur-xl border border-amber-800/30 rounded-xl p-4 shadow-2xl text-xs text-amber-100/80 font-mono hidden sm:block">
        <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold">Shortcuts</div>
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          <span>Ctrl+1-9</span><span>Quick studio</span>
          <span>Ctrl+[ / ]</span><span>Prev/Next</span>
          <span>Ctrl+P</span><span>Presets</span>
          <span>Ctrl+B</span><span>Compare</span>
        </div>
      </div>

      {/* Top Grand Studio Navigation Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-3.5 rounded-2xl border border-amber-800/30 shadow-2xl backdrop-blur-2xl">
        {/* Breadcrumb Trail */}
        <nav className="flex items-center gap-1.5 flex-wrap w-full lg:w-auto" aria-label="Studio breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="text-amber-300/50" />}
              {crumb.current ? (
                <span className="text-xs font-bold text-amber-50 truncate max-w-[150px]">{crumb.label}</span>
              ) : (
                <button
                  onClick={crumb.onClick}
                  className="text-xs text-amber-200/60 hover:text-amber-300 transition-colors truncate max-w-[120px] font-medium"
                >
                  {crumb.label}
                </button>
              )}
            </span>
          ))}
        </nav>

        {/* Studio Title */}
        <div className="flex items-center gap-3 lg:ml-auto">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-indigo-600 text-slate-950 shadow-lg shadow-cyan-500/30 font-extrabold">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-amber-50 uppercase">
              Grand Automotive Engineering Studio Suite
            </h1>
            <p className="text-xs text-amber-200/60">
              Unified 3D Assembly, Dyno ECU, Suspension, CFD Wind Tunnel, Track Layouts, NVH & Factory Studios
            </p>
          </div>
        </div>

        {/* Quick Presets Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer bg-amber-800/35 text-amber-100/80 border-amber-700/30 hover:text-amber-300 hover:border-amber-500/50"
            aria-label="Quick presets"
            title="Quick Presets (Ctrl+P)"
          >
            <Zap size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Presets</span>
            <ChevronDown size={12} className={showPresets ? "rotate-180" : ""} />
          </button>

          {showPresets && (
            <div className="absolute right-4 top-full mt-2 z-50 bg-amber-950/95 backdrop-blur-xl border border-amber-800/30 rounded-xl p-2 shadow-2xl">
              <div className="flex items-center gap-2 mb-2 px-2">
                <span className="text-xs font-bold text-amber-100/80">Quick Presets</span>
                <span title="Load pre-configured studio combinations for common workflows" className="flex items-center text-amber-300/50 hover:text-amber-100/80 cursor-help">
                  <HelpCircle size={12} />
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetClick(preset)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-left ${
                      preset.color === "red" ? "hover:bg-red-500/10 text-red-300" :
                      preset.color === "blue" ? "hover:bg-amber-500/10 text-amber-300" :
                      preset.color === "orange" ? "hover:bg-orange-500/10 text-orange-300" :
                      "hover:bg-green-500/10 text-green-300"
                    }`}
                    title={preset.description}
                  >
                    <div className={`p-1.5 rounded ${preset.color === "red" ? "bg-red-500/20" : preset.color === "blue" ? "bg-amber-500/20" : preset.color === "orange" ? "bg-orange-500/20" : "bg-green-500/20"}`}>
                      {preset.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">{preset.label}</span>
                      <span className="text-[10px] text-amber-300/50">{preset.studios.length} studios</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compare Mode Toggle */}
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              compareMode
                ? "bg-amber-500/20 text-amber-300 border-violet-500/40 shadow-sm shadow-violet-500/20"
                : "bg-amber-800/35 text-amber-200/60 border-amber-700/30 hover:text-amber-50"
            }`}
            title={compareMode ? "Exit Compare Mode (Ctrl+B)" : "Enter Compare Mode (Ctrl+B)"}
          >
            <GitCompare size={14} className={compareMode ? "text-amber-400" : ""} />
            <span className="hidden sm:inline">{compareMode ? "Comparing" : "Compare"}</span>
          </button>

          {/* Engine Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              !isAudioMuted
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20"
                : "bg-amber-800/35 text-amber-200/60 border-amber-700/30 hover:text-amber-50"
            }`}
            title="Toggle Procedural Powertrain Audio Synthesizer"
          >
            {!isAudioMuted ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} />}
            <span className="hidden sm:inline">{!isAudioMuted ? "Sound Live" : "Sound Muted"}</span>
          </button>
        </div>
      </div>

      {/* Recent Studios Quick Access */}
      {recentStudios.length > 1 && (
        <div className="flex items-center gap-2 bg-amber-950/50 p-2 rounded-xl border border-amber-800/30">
          <History size={12} className="text-amber-300/50" />
          <span className="text-xs font-bold text-amber-200/60">Recent:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {recentStudios.slice(0, 3).map((studioId, i) => {
              const tab = STUDIO_TABS.find((t) => t.id === studioId);
              if (!tab) return null;
              return (
                <button
                  key={studioId}
                  onClick={() => handleTabClick(studioId)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === studioId
                      ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30"
                      : "text-amber-200/60 hover:text-amber-50 hover:bg-amber-800/35/50"
                  }`}
                  title={tab.description}
                >
                  {i === 0 && <Star size={10} className="text-amber-400" />}
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Category-Grouped Studio Navigation */}
      <div className="bg-amber-950/80 p-3 rounded-2xl border border-amber-800/30">
        <div className="space-y-3">
          {STUDIO_CATEGORIES.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const categoryTabs = STUDIO_TABS.filter((t) => category.tabs.includes(t.id));
            const hasConfigured = categoryTabs.some((t) => studioStatuses[t.id] === "configured");
            const hasNeedsAttention = categoryTabs.some((t) => studioStatuses[t.id] === "needs_attention");
            const catColor = getCategoryIconStyle(category.color);

            return (
              <div key={category.id} className="group">
                {/* Category Header */}
                <button
                  onClick={() => handleCategoryToggle(category.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all hover:bg-amber-900/40"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${catColor.bg} ${catColor.text}`}>
                      {category.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-50 uppercase tracking-wider">{category.label}</div>
                      <div className="text-[10px] text-amber-300/50">
                        {categoryTabs.filter((t) => studioStatuses[t.id] === "configured").length} / {categoryTabs.length} configured
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {hasConfigured && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Has configured studios" />
                      )}
                      {hasNeedsAttention && !hasConfigured && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Has studios needing attention" />
                      )}
                    </div>
                    <ChevronDown size={14} className={`text-amber-300/50 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Category Tabs */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden pl-10 mt-1"
                >
                  <div className="flex flex-wrap gap-1 pb-2">
                    {categoryTabs.map((tab) => {
                      const status = studioStatuses[tab.id] || "not_visited";
                      const isActive = activeTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabClick(tab.id)}
                          aria-label={`Open studio tab: ${tab.label}`}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-95 relative ${
                            isActive
                              ? "bg-gradient-to-r from-amber-400 to-sky-500 text-slate-950 shadow-lg shadow-cyan-500/30 font-extrabold ring-1 ring-amber-300"
                              : "text-amber-200/60 hover:text-amber-50 hover:bg-amber-800/35/80"
                          }`}
                          title={tab.description}
                        >
                          {/* Status indicator */}
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusColor(status)}`}
                            title={getStatusTooltip(status)}
                          />
                          {tab.icon}
                          <span>{tab.label}</span>
                          {tab.shortcut && (
                            <kbd className="ml-1 px-1.5 py-0.5 rounded bg-amber-900/40 border border-amber-700/30 text-[9px] font-mono text-amber-200/60 hidden sm:inline-flex">
                              Ctrl+{tab.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Studio Viewport with Smooth Transitions */}
      <div className="flex-1 w-full min-h-[680px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full h-full"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>

        {/* Compare Mode Overlay */}
        {compareMode && (
          <div className="absolute inset-0 bg-amber-950/90 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none">
            <div className="bg-amber-900/40 border border-violet-500/30 rounded-2xl p-8 max-w-md text-center pointer-events-auto">
              <GitCompare size={32} className="mx-auto text-amber-400 mb-4" />
              <h3 className="text-lg font-bold text-amber-50 mb-2">Compare Mode Active</h3>
              <p className="text-sm text-amber-200/60 mb-4">
                Changes are highlighted vs baseline. Toggle off to return to normal view.
              </p>
              <button
                onClick={() => setCompareMode(false)}
                className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 border border-violet-500/40 hover:bg-amber-500/30 text-sm font-bold transition-all"
              >
                Exit Compare Mode
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};