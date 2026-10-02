import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Cog, Car, Activity, Flag, BarChart3, Save, FolderOpen, RotateCcw,
  Sofa, Factory, Ruler, Wind, Newspaper,
  Monitor, Microscope, Trophy, GitCompare,
  TrendingUp, ShieldCheck, DollarSign, Cpu, GitBranch,
  Bell, SlidersHorizontal, Box, Volume2, Gauge, Navigation, Home, ChevronRight
} from "lucide-react";
import { DesignProvider, useDesign } from "./state/DesignContext";
import { RDProvider } from "./state/RDContext";
import { CompanyProvider, useCompany } from "./state/CompanyContext";
import { ToastProvider } from "./components/ToastSystem";
import { StageSwitcher, type Stage } from "./components/StageSwitcher";
import { scheduleIdleWork } from "./utils/performanceOptimizer";

// Deferred imports — only loaded when their UI sections are visible
const EngineeringLog = React.lazy(() => import("./components/EngineeringLog").then(m => ({ default: m.EngineeringLog })));
const StatRail = React.lazy(() => import("./components/StatRail").then(m => ({ default: m.StatRail })));
const ThermalAlertMonitor = React.lazy(() => import("./components/ThermalAlertMonitor").then(m => ({ default: m.ThermalAlertMonitor })));

import { Search, Command as CmdIcon, Wrench, RefreshCw, PanelRightOpen, ChevronLeft } from "lucide-react";
import { useGuidedEngineeringStore } from "./state/guidedEngineeringStore";
import { StageLoadingSkeleton } from "./components/ui/StageLoadingSkeleton";

const SaveLoadDialog = React.lazy(() => import("./components/SaveLoadDialog").then(m => ({ default: m.SaveLoadDialog })));
const CommandPalette = React.lazy(() => import("./components/CommandPalette").then(m => ({ default: m.CommandPalette })));
const DeveloperControlModal = React.lazy(() => import("./components/dev/DeveloperControlModal").then(m => ({ default: m.DeveloperControlModal })));
import { DevModeBanner } from "./components/dev/DevModeBanner";
import { DevConsole } from "./components/dev/DevConsole";
import { useDeveloperModeStore } from "./state/developerModeStore";
import { useDevConsoleStore } from "./state/devConsoleStore";
import { useSimulationClockStore } from "./state/simulationClockStore";
import { useLiveStatsRailStore } from "./state/liveStatsRailStore";


export type WorkspaceCategory = "engineering" | "studios" | "simulation" | "world";

interface StageItem {
  id: Stage;
  label: string;
  icon: React.ReactNode;
  category: WorkspaceCategory;
}

const STAGES: StageItem[] = [
  // --- Main Menu Hub & Overview ---
  { id: "main_menu", label: "Main Menu", icon: <Home size={14} />, category: "engineering" },
  { id: "create_vehicle_hub", label: "Creation Hub", icon: <Car size={14} />, category: "engineering" },

  // --- Engineering Sequential Workflow (8 Divisions) ---
  { id: "engine", label: "1. Engine", icon: <Cog size={14} />, category: "engineering" },
  { id: "vehicle", label: "2. Vehicle Studio", icon: <Car size={14} />, category: "engineering" },
  { id: "aero_studio", label: "3. Aero Studio", icon: <Wind size={14} />, category: "engineering" },
  { id: "interior", label: "4. Interior", icon: <Sofa size={14} />, category: "engineering" },
  { id: "safety", label: "5. Safety Center", icon: <ShieldCheck size={14} />, category: "engineering" },
  { id: "simulation", label: "6. Sim & Testing", icon: <Activity size={14} />, category: "engineering" },
  { id: "manufacturing", label: "7. Manufacture", icon: <Factory size={14} />, category: "engineering" },
  { id: "factory", label: "8. Factory Floor", icon: <Factory size={14} />, category: "engineering" },

  // --- Design Studios Hub ---
  { id: "transmission3d", label: "3D Transmission Studio", icon: <Cog size={14} />, category: "studios" },
  { id: "track_layout", label: "Track Layouts Studio", icon: <Navigation size={14} />, category: "studios" },
  { id: "f1_constructor", label: "🏎️ F1 Constructor Studio", icon: <Flag size={14} />, category: "studios" },
  { id: "hypercar_constructor", label: "🏆 Hypercar WEC Studio", icon: <Trophy size={14} />, category: "studios" },
  { id: "suspension3d", label: "3D Suspension Studio", icon: <Activity size={14} />, category: "studios" },

  // --- Simulation & Testing ---
  { id: "simulation", label: "Simulation", icon: <Activity size={14} />, category: "simulation" },
  { id: "nvh", label: "NVH Audio Lab", icon: <Volume2 size={14} />, category: "simulation" },
  { id: "race", label: "Race Track", icon: <Flag size={14} />, category: "simulation" },
  { id: "stats", label: "Telemetry Stats", icon: <BarChart3 size={14} />, category: "simulation" },

  // --- World & Racing ---
  { id: "reputation", label: "Reputation", icon: <Trophy size={14} />, category: "world" },
  { id: "compare", label: "Compare", icon: <GitCompare size={14} />, category: "world" },
  { id: "economy", label: "Economy", icon: <TrendingUp size={14} />, category: "world" },
  { id: "twin", label: "Digital Twin", icon: <Cpu size={14} />, category: "world" },
  { id: "sales", label: "Sales", icon: <DollarSign size={14} />, category: "world" },
  { id: "press", label: "Press Reviews", icon: <Newspaper size={14} />, category: "world" },
  { id: "competitors", label: "Rivals", icon: <GitBranch size={14} />, category: "world" },
];

// Error Boundary to catch runtime crashes
class VisionGlassErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };

  constructor(props: { children: React.ReactNode }) {
    super(props);
  }
  static getDerivedStateFromError(error: Error) {
    if (error?.message?.includes("suspended while responding to synchronous input")) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (error?.message?.includes("suspended while responding to synchronous input")) {
      return;
    }
    console.error("Vision Glass Error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: "fixed", inset: 0, background: "#1a1a2e",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          color: "#fff", fontFamily: "monospace", padding: 40,
        }}>
          <h1 style={{ color: "#ff6b6b", fontSize: 24, marginBottom: 16 }}>⚠️ Vision Glass Error</h1>
          <pre style={{ color: "#ffd93d", fontSize: 14, maxWidth: "80vw", overflow: "auto", whiteSpace: "pre-wrap" }}>
            {this.state.error?.message}
          </pre>
          <pre style={{ color: "#94a3b8", fontSize: 11, marginTop: 12, maxWidth: "80vw", overflow: "auto", whiteSpace: "pre-wrap" }}>
            {this.state.error?.stack}
          </pre>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button
              onClick={() => {
                if (
                  this.state.error?.message?.includes("Failed to fetch dynamically imported module") ||
                  this.state.error?.message?.includes("Importing a module script failed")
                ) {
                  window.location.reload();
                } else {
                  this.setState({ hasError: false, error: null });
                }
              }}
              style={{ padding: "8px 24px", background: "#007AFF", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: "8px 24px", background: "#334155", color: "#fff", border: "1px solid #475569", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppInner() {
  const [stage, setStage] = useState<Stage>("main_menu");
  const [activeCategory, setActiveCategory] = useState<WorkspaceCategory>("engineering");
  const [dialog, setDialog] = useState<{ open: boolean; mode: "save" | "load" }>({ open: false, mode: "save" });
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [focusMode, setFocusMode] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem("apex-engineer:focus-mode") === "true";
    } catch {
      return false;
    }
  });
  const { design, sim, carConcept, updateEngine, resetDesign, units, setUnits, uiTheme, setUiTheme } = useDesign();
  const { company, advanceAllSystems } = useCompany();
  const { isCollapsedToRight, setIsCollapsedToRight, toggleCollapseToRight } = useLiveStatsRailStore();
  const isPowertrainSelecting = useGuidedEngineeringStore((s) => s.isPowertrainSelecting);
  const isSelectingPowertrain = stage === "engine" && isPowertrainSelecting;
  const [booted, setBooted] = useState(false);

  // Stable Memoized Handlers for UI Performance
  const handleSave = useCallback(() => setDialog({ open: true, mode: "save" }), []);
  const handleLoad = useCallback(() => setDialog({ open: true, mode: "load" }), []);
  const handleCloseDialog = useCallback(() => setDialog((prev) => ({ open: false, mode: prev.mode })), []);
  const handleSearch = useCallback(() => setCmdPaletteOpen(true), []);
  const handleCloseCmdPalette = useCallback(() => setCmdPaletteOpen(false), []);
  const handleToggleFocusMode = useCallback(() => {
    setFocusMode((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem("apex-engineer:focus-mode", String(next));
      } catch {
        // Focus mode still works for this session when storage is unavailable.
      }
      return next;
    });
    setCmdPaletteOpen(false);
  }, []);
  const isMainMenuOrSubPage = useCallback((s: Stage) => {
    return [
      "main_menu",
      "create_vehicle_hub",
      "powertrain_studio_select",
      "operations",
      "project_overview",
      "hq",
      "calendar",
      "contracts",
      "settings",
      "reputation",
      "garage",
      "motorsport",
      "rd",
    ].includes(s);
  }, []);

  const handleSelectStage = useCallback((st: string) => {
    const selectedStage = STAGES.find((item) => item.id === st);
    if (selectedStage) {
      setActiveCategory(selectedStage.category);
    } else if (st === "garage" || st === "motorsport" || st === "supplyChain") {
      setActiveCategory("world");
    } else if (["operations", "project_overview", "hq", "calendar", "contracts", "settings", "reputation"].includes(st)) {
      setActiveCategory("world");
    }
    React.startTransition(() => {
      setStage(st as Stage);
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__selectStage = handleSelectStage;
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // F8: Global Developer Mode Toggle
      if (e.key === "F8") {
        e.preventDefault();
        useDeveloperModeStore.getState().toggleDevMode();
        return;
      }

      // F9: Global Developer Console Toggle
      if (e.key === "F9") {
        e.preventDefault();
        useDevConsoleStore.getState().toggle();
        return;
      }

      // Ctrl+Shift+D or Cmd+Shift+D or ` (backtick) when not typing in an input
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        useDeveloperModeStore.getState().toggleModal();
      } else if (e.key === "`" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        useDeveloperModeStore.getState().toggleModal();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleSelectStage]);

  // Phase 1 Scroll Animation Physics (120Hz / 60fps rAF lerp engine)
  const scrollRef = React.useRef<HTMLElement>(null);
  const bgRef = React.useRef<HTMLDivElement>(null);
  const lightRef = React.useRef<HTMLDivElement>(null);
  const progressFillRef = React.useRef<HTMLDivElement>(null);

  const scrollPhysics = React.useRef({
    currentScroll: 0,
    targetScroll: 0,
    animating: false,
  });

  useEffect(() => {
    let rafId: number;

    const renderFrame = () => {
      const state = scrollPhysics.current;
      // High-precision lerp for 120Hz silk smooth motion
      state.currentScroll += (state.targetScroll - state.currentScroll) * 0.16;
      const diff = Math.abs(state.targetScroll - state.currentScroll);

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${(state.currentScroll * -0.05).toFixed(2)}px, 0)`;
      }
      if (lightRef.current) {
        lightRef.current.style.transform = `translate3d(0, ${(state.currentScroll * -0.10).toFixed(2)}px, 0)`;
      }

      if (diff > 0.05) {
        rafId = requestAnimationFrame(renderFrame);
      } else {
        state.animating = false;
      }
    };

    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const totalHeight = el.scrollHeight - el.clientHeight;
      const currentScroll = el.scrollTop;
      scrollPhysics.current.targetScroll = currentScroll;

      if (totalHeight > 0 && progressFillRef.current) {
        const prog = Math.min(1, Math.max(0, currentScroll / totalHeight));
        progressFillRef.current.style.width = `${(prog * 100).toFixed(2)}%`;
      }

      if (!scrollPhysics.current.animating) {
        scrollPhysics.current.animating = true;
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [stage]);

  useEffect(() => { const t = setTimeout(() => setBooted(true), 60); return () => clearTimeout(t); }, []);

  // Sync category when stage changes (e.g. from CommandPalette)
  useEffect(() => {
    const currentStageItem = STAGES.find(s => s.id === stage);
    if (currentStageItem && currentStageItem.category !== activeCategory) {
      setActiveCategory(currentStageItem.category);
    }
  }, [stage]);

  // Global Ctrl+K / Cmd+K key listener
  useEffect(() => {
    function handleGlobalKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdPaletteOpen((prev: boolean) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        handleToggleFocusMode();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "]") {
        e.preventDefault();
        toggleCollapseToRight();
      }
    }
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, [handleToggleFocusMode, toggleCollapseToRight]);

  const designRef = React.useRef(design);
  designRef.current = design;
  const simRef = React.useRef(sim);
  simRef.current = sim;
  const carConceptRef = React.useRef(carConcept);
  carConceptRef.current = carConcept;



  return (
    <VisionGlassErrorBoundary>
        <div
          className={`theme4 vision-glass-app${focusMode ? " vision-focus-mode" : ""}`}
          style={{
            position: "fixed", inset: 0,
            background: "#111118",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
            display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start",
            overflow: "hidden",
            width: "100%", height: "100vh",
            opacity: booted ? 1 : 0, transition: "opacity 0.7s ease",
          }}
        >
          {/* === Golden Warm Bokeh background image for Vision Glass === */}
          <div
            ref={bgRef}
            className="vision-parallax-layer"
            style={{
              position: "absolute", inset: 0, zIndex: 0,
              backgroundImage: "url('/bokeh-bg.png')",
              backgroundSize: "cover", backgroundPosition: "center",
              filter: "brightness(0.9) saturate(1.25) contrast(1.05)",
              willChange: "transform",
            }}
          />
          {/* Luminous warm golden ambient light leaks overlay */}
          <div
            ref={lightRef}
            className="vision-parallax-layer"
            style={{
              position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
              background: "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(255, 215, 130, 0.30), transparent 70%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(255, 190, 90, 0.22), transparent 65%)",
              willChange: "transform",
            }}
          />
          <a className="skip-link" href="#vision-workspace">Skip to workspace</a>

          {/* ===== Edge-to-Edge Full Screen Glass Workspace ===== */}
          <div className="vision-glass-window" style={{
            position: "relative", zIndex: 10,
            width: "100%",
            maxWidth: "100%",
            marginTop: 0, marginBottom: 0,
            borderRadius: 0,
            background: isMainMenuOrSubPage(stage) ? "transparent" : "rgba(255, 255, 255, 0.45)",
            backdropFilter: isMainMenuOrSubPage(stage) ? "none" : "blur(60px) saturate(210%)",
            WebkitBackdropFilter: isMainMenuOrSubPage(stage) ? "none" : "blur(60px) saturate(210%)",
            border: "none",
            boxShadow: "none",
            display: "flex", flexDirection: "column",
            height: "100vh",
            overflow: "hidden",
          }}>


            {/* ── SCROLLABLE CONTENT WITH MOMENTUM (Phase 1) ── */}
            <main
              ref={scrollRef}
              id="vision-workspace"
              tabIndex={-1}
              aria-label="Active engineering workspace"
              className="vision-glass-content vision-scroll-momentum"
              style={{
                flex: 1,
                overflowY: (isSelectingPowertrain || stage === "main_menu" || stage === "create_vehicle_hub" || stage === "powertrain_studio_select") ? "hidden" : "auto",
                overflowX: "hidden",
                padding: isMainMenuOrSubPage(stage)
                  ? "0px"
                  : (isSelectingPowertrain
                    ? "12px 20px"
                    : "16px 24px 24px 24px"),
              }}
            >
              <div className="sr-only" aria-live="polite">
                {STAGES.find((item) => item.id === stage)?.label ?? (stage === "garage" ? "Garage" : stage === "motorsport" ? "Motorsport" : stage === "supplyChain" ? "Supply Chain" : stage)} workspace opened.
              </div>
              <div className="sr-only" aria-live="polite">
                {focusMode ? "Focus workspace mode enabled. Navigation chrome hidden." : "Focus workspace mode disabled."}
              </div>
              <div style={{ display: "flex", gap: isCollapsedToRight || isSelectingPowertrain ? 0 : 16, transition: "gap 280ms cubic-bezier(0.4, 0, 0.2, 1)", height: isMainMenuOrSubPage(stage) ? "100%" : "auto", flex: 1 }}>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: isMainMenuOrSubPage(stage) ? 0 : 16, height: isMainMenuOrSubPage(stage) ? "100%" : "auto" }}>
                  <StageSwitcher stage={stage} onSelectStage={handleSelectStage} />
                </div>

                {/* Right Sidebar — hidden for F1/Hypercar/MainMenu/SubPages/PowertrainSelect (they have their own full-width layout) */}
                {!focusMode && stage !== "f1_constructor" && stage !== "hypercar_constructor" && !isMainMenuOrSubPage(stage) && !isSelectingPowertrain && (
                  <aside
                    aria-label="Live Telemetry and Stats Sidebar"
                    className="hidden xl:flex flex-col gap-4"
                    style={{
                      width: isCollapsedToRight ? 0 : 300,
                      minWidth: isCollapsedToRight ? 0 : 300,
                      opacity: isCollapsedToRight ? 0 : 1,
                      transform: isCollapsedToRight ? "translateX(24px)" : "translateX(0)",
                      overflow: isCollapsedToRight ? "hidden" : "visible",
                      pointerEvents: isCollapsedToRight ? "none" : "auto",
                      flexShrink: 0,
                      visibility: isCollapsedToRight ? "hidden" : "visible",
                      transition: "width 280ms cubic-bezier(0.4, 0, 0.2, 1), min-width 280ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease, transform 280ms cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div style={{ width: 300, position: "sticky", top: 8, display: "flex", flexDirection: "column", gap: 12 }}>
                      {/* Live Stat Rail (Top) */}
                      <div className="stat-rail-container">
                        <StatRail />
                      </div>
                      {/* Engineering Log Panel (Bottom) */}
                      <EngineeringLog />
                    </div>
                  </aside>
                )}
              </div>

              {/* Floating Docked Pull-Tab on Right Edge when sidebar is collapsed to the right */}
              {!focusMode && stage !== "f1_constructor" && stage !== "hypercar_constructor" && !isMainMenuOrSubPage(stage) && !isSelectingPowertrain && isCollapsedToRight && (
                <button
                  type="button"
                  onClick={() => setIsCollapsedToRight(false)}
                  title="Expand Live Stats (Ctrl+])"
                  aria-label="Expand Live Stats Sidebar"
                  className="fixed right-0 top-36 z-40 flex flex-col items-center gap-2 py-3 px-2 rounded-l-2xl bg-[#faf7f2]/95 hover:bg-white text-slate-800 border-l-2 border-y-2 border-[#dfd6c8] hover:border-amber-400 shadow-xl backdrop-blur-md cursor-pointer transition-all duration-200 hover:-translate-x-1 group select-none animate-fadeIn"
                  style={{
                    boxShadow: "-4px 6px 20px -2px rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <PanelRightOpen size={16} className="text-amber-600 group-hover:scale-110 transition-transform shrink-0" />
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span
                      className="text-[9px] font-mono font-black text-slate-700 group-hover:text-amber-900 uppercase tracking-widest"
                      style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                    >
                      LIVE STATS
                    </span>
                  </div>
                  <ChevronLeft size={13} className="text-slate-400 group-hover:text-amber-600 group-hover:-translate-x-0.5 transition-all" />
                </button>
              )}
            </main>
          </div>

          {/* Overlays */}
          <React.Suspense fallback={null}>
            <SaveLoadDialog open={dialog.open} mode={dialog.mode} onClose={handleCloseDialog} />
            <CommandPalette
              isOpen={cmdPaletteOpen}
              onClose={handleCloseCmdPalette}
              onSelectStage={handleSelectStage}
              focusMode={focusMode}
              onToggleFocusMode={handleToggleFocusMode}
            />
            <DeveloperControlModal onSelectStage={handleSelectStage} />
            <DevModeBanner />
            <DevConsole />
          </React.Suspense>
          <ThermalAlertMonitor />
        </div>
      </VisionGlassErrorBoundary>
    );
}

/**
 * Continuous Global Simulation Clock Ticker — Time always runs across all views
 */
function GlobalSimulationTicker() {
  const { isPlaying, speed, advanceDays, advanceHours } = useSimulationClockStore();

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 1000;
    const timer = setInterval(() => {
      if (speed >= 25) {
        advanceDays(speed >= 50 ? 7 : 1);
      } else {
        advanceHours(speed);
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, speed, advanceDays, advanceHours]);

  return null;
}

export default function App() {
  return (
    <DesignProvider>
      <RDProvider>
        <CompanyProvider>
          <ToastProvider>
            <GlobalSimulationTicker />
            <AppInner />
          </ToastProvider>
        </CompanyProvider>
      </RDProvider>
    </DesignProvider>
  );
}

