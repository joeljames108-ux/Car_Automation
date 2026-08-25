import React, { useState, useEffect } from "react";
import {
  Cog, Car, Activity, Flag, BarChart3, Save, FolderOpen, RotateCcw,
  Sofa, Factory, FlaskConical, Ruler, Paintbrush, Wind, Newspaper,
  Monitor, Microscope, LayoutDashboard, Trophy, Warehouse, GitCompare,
  TrendingUp, ShieldCheck, DollarSign, Cpu, GitBranch,
  LayoutGrid, Bell, SlidersHorizontal, Box, Truck, Volume2, Gauge, Navigation
} from "lucide-react";
import { EngineeringLog } from "./components/EngineeringLog";
import { DesignProvider, useDesign } from "./state/DesignContext";
import { RDProvider } from "./state/RDContext";
import { CompanyProvider, useCompany } from "./state/CompanyContext";
import { StatRail } from "./components/StatRail";
import { SaveLoadDialog } from "./components/SaveLoadDialog";
import { CommandPalette } from "./components/CommandPalette";
import { ToastProvider } from "./components/ToastSystem";
import { ThermalAlertMonitor } from "./components/ThermalAlertMonitor";
import { AgentNotificationCenter } from "./components/agents/AgentNotificationCenter";
import { AgentOrchestrator } from "./sim/agents/agentFramework";
import { registerAllDomainAgents } from "./sim/agents/registerDefaultAgents";
import { StageSwitcher, type Stage } from "./components/StageSwitcher";
import { Search, Command as CmdIcon, Bot, Wrench } from "lucide-react";
import { VisionGlassHeader } from "./components/ui/VisionGlassHeader";
import { VisionGlassDock } from "./components/ui/VisionGlassDock";
import { VisionGlassToolbar } from "./components/ui/VisionGlassToolbar";
import { UI1Layout } from "./components/ui/UI1Layout";


import { Sparkles as SparklesIcon } from "lucide-react";


export type WorkspaceCategory = "engineering" | "studios" | "simulation" | "world";

interface StageItem {
  id: Stage;
  label: string;
  icon: React.ReactNode;
  category: WorkspaceCategory;
}

const STAGES: StageItem[] = [
  // --- Engineering Studio ---
  { id: "command", label: "Command Center", icon: <LayoutDashboard size={14} />, category: "engineering" },
  { id: "engine", label: "Engine", icon: <Cog size={14} />, category: "engineering" },
  { id: "vehicle", label: "Vehicle Studio", icon: <Car size={14} />, category: "engineering" },
  { id: "interior", label: "Interior", icon: <Sofa size={14} />, category: "engineering" },
  { id: "manufacturing", label: "Manufacturing", icon: <Factory size={14} />, category: "engineering" },
  { id: "infotainment", label: "Electronics", icon: <Monitor size={14} />, category: "engineering" },
  { id: "safety", label: "Safety Center", icon: <ShieldCheck size={14} />, category: "engineering" },

  // --- Design Studios Hub ---
  { id: "studio", label: "Grand Studio Hub", icon: <SparklesIcon size={14} />, category: "studios" },
  { id: "transmission3d", label: "3D Transmission Studio", icon: <Cog size={14} />, category: "studios" },
  { id: "track_layout", label: "Track Layouts Studio", icon: <Navigation size={14} />, category: "studios" },
  { id: "f1_constructor", label: "🏎️ F1 Constructor Studio", icon: <Flag size={14} />, category: "studios" },
  { id: "hypercar_constructor", label: "🏆 Hypercar WEC Studio", icon: <Trophy size={14} />, category: "studios" },
  { id: "graphics3d", label: "3D Viewport Studio", icon: <Box size={14} />, category: "studios" },
  { id: "suspension3d", label: "3D Suspension Studio", icon: <Activity size={14} />, category: "studios" },
  { id: "ai", label: "Apex AI Studio", icon: <Bot size={14} />, category: "studios" },

  // --- Simulation & Testing ---
  { id: "simulation", label: "Simulation", icon: <Activity size={14} />, category: "simulation" },
  { id: "nvh", label: "NVH Audio Lab", icon: <Volume2 size={14} />, category: "simulation" },
  { id: "testing", label: "Testing Lab", icon: <FlaskConical size={14} />, category: "simulation" },
  { id: "race", label: "Race Track", icon: <Flag size={14} />, category: "simulation" },
  { id: "stats", label: "Telemetry Stats", icon: <BarChart3 size={14} />, category: "simulation" },

  // --- World & Racing ---
  { id: "garage", label: "Garage", icon: <Warehouse size={14} />, category: "world" },
  { id: "supplyChain", label: "Supply Chain", icon: <Truck size={14} />, category: "world" },
  { id: "compare", label: "Compare", icon: <GitCompare size={14} />, category: "world" },
  { id: "economy", label: "Economy", icon: <TrendingUp size={14} />, category: "world" },
  { id: "motorsport", label: "Motorsport", icon: <Trophy size={14} />, category: "world" },
  { id: "twin", label: "Digital Twin", icon: <Cpu size={14} />, category: "world" },
  { id: "sales", label: "Sales", icon: <DollarSign size={14} />, category: "world" },
  { id: "press", label: "Press Reviews", icon: <Newspaper size={14} />, category: "world" },
  { id: "competitors", label: "Rivals", icon: <GitBranch size={14} />, category: "world" },
];

const WORKSPACE_CATEGORIES: { id: WorkspaceCategory; label: string; icon: React.ReactNode }[] = [
  { id: "engineering", label: "Engineering", icon: <Wrench size={14} /> },
  { id: "studios", label: "Studios Suite", icon: <SparklesIcon size={14} /> },
  { id: "simulation", label: "Sim & Testing", icon: <Activity size={14} /> },
  { id: "world", label: "World & Racing", icon: <Trophy size={14} /> },
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
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
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
          <button onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: 24, padding: "8px 24px", background: "#007AFF", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppInner() {
  const [stage, setStage] = useState<Stage>("command");
  const [activeCategory, setActiveCategory] = useState<WorkspaceCategory>("engineering");
  const [dialog, setDialog] = useState<{ open: boolean; mode: "save" | "load" }>({ open: false, mode: "save" });
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const { design, sim, carConcept, updateEngine, resetDesign, units, setUnits, uiTheme, setUiTheme } = useDesign();
  const { company, advanceAllSystems } = useCompany();
  const [booted, setBooted] = useState(false);

  // Phase 1 Scroll Animation Physics (120Hz / 60fps rAF lerp engine)
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const bgRef = React.useRef<HTMLDivElement>(null);
  const lightRef = React.useRef<HTMLDivElement>(null);
  const progressFillRef = React.useRef<HTMLDivElement>(null);

  const scrollPhysics = React.useRef({
    currentScroll: 0,
    targetScroll: 0,
    animating: false,
  });

  useEffect(() => {
    if (uiTheme !== "theme4") return;

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
  }, [uiTheme, stage]);

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
      }
    }
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  const designRef = React.useRef(design);
  designRef.current = design;
  const simRef = React.useRef(sim);
  simRef.current = sim;
  const carConceptRef = React.useRef(carConcept);
  carConceptRef.current = carConcept;

  // Initialize Autonomous AI Engineering Division (All 25 Domain Agents)
  useEffect(() => {
    const orchestrator = AgentOrchestrator.getInstance();
    registerAllDomainAgents(orchestrator);

    orchestrator.start(
      () => ({ engine: designRef.current.engine, vehicle: designRef.current.vehicle, carConcept: carConceptRef.current }),
      () => simRef.current
    );

    return () => {
      orchestrator.stop();
    };
  }, []);

  const activeCategoryStages = STAGES.filter(s => s.category === activeCategory);

  // ===== UI 1: Kinetic Horizon — Dedicated Separate UI/UX =====
  if (uiTheme === "theme1") {
    return (
      <VisionGlassErrorBoundary>
        <UI1Layout />
      </VisionGlassErrorBoundary>
    );
  }

  const isVisionGlass = uiTheme === "theme4";

  // ===== UI 4: Vision Glass — Completely separate UI/UX =====
  if (isVisionGlass) {
    return (
      <VisionGlassErrorBoundary>
        <div
          className="theme4"
          style={{
            position: "fixed", inset: 0,
            background: "#111118",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
            overflow: "hidden",
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
              background: "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(255, 215, 130, 0.22), transparent 70%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(255, 190, 90, 0.15), transparent 65%)",
              willChange: "transform",
            }}
          />
          {/* ===== Left Vertical Toolbar (Phase 7 Component) ===== */}
          <VisionGlassToolbar
            actions={[
              { id: "command", icon: <LayoutGrid size={17} />, label: "Dashboard", onClick: () => setStage("command"), isActive: stage === "command" },
              { id: "studio", icon: <SparklesIcon size={17} />, label: "Studio Hub", onClick: () => setStage("studio"), isActive: stage === "studio" },
              { id: "search", icon: <Search size={17} />, label: "Search (Ctrl+K)", onClick: () => setCmdPaletteOpen(true) },
              { id: "simulation", icon: <Activity size={17} />, label: "Analytics", onClick: () => setStage("simulation"), isActive: stage === "simulation" },
              { id: "ai", icon: <Bot size={17} />, label: "Apex AI Studio", onClick: () => setStage("ai"), isActive: stage === "ai" },
              { id: "safety", icon: <Bell size={17} />, label: "Safety & Alerts", onClick: () => setStage("safety"), isActive: stage === "safety" },
              { id: "vehicle", icon: <SlidersHorizontal size={17} />, label: "Vehicle Controls", onClick: () => setStage("vehicle"), isActive: stage === "vehicle" },
            ]}
          />

          {/* ===== Floating Liquid Glass Window ===== */}
          <div style={{
            position: "relative", zIndex: 10,
            width: "min(96vw, 1440px)",
            marginTop: 16, marginBottom: 16,
            borderRadius: 28,
            background: "rgba(255, 252, 245, 0.52)",
            backdropFilter: "blur(60px) saturate(220%)",
            WebkitBackdropFilter: "blur(60px) saturate(220%)",
            border: "1.5px solid rgba(255, 220, 180, 0.40)",
            boxShadow: "0 24px 80px rgba(0, 0, 0, 0.12), 0 6px 24px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.90), 0 0 24px rgba(200, 180, 255, 0.08)",
            display: "flex", flexDirection: "column",
            height: "calc(100vh - 32px)",
            overflow: "hidden",
            animation: "vg-prismatic-border 8s ease-in-out infinite",
          }}>

            {/* ── HEADER BAR (Phase 3 Component) ── */}
            <VisionGlassHeader
              month={company.economy.month}
              totalRevenue={company.totalRevenue}
              units={units}
              onSetUnits={setUnits}
              onSave={() => setDialog({ open: true, mode: "save" })}
              onLoad={() => setDialog({ open: true, mode: "load" })}
              onReset={resetDesign}
              onSearch={() => setCmdPaletteOpen(true)}
              onAdvanceMonth={advanceAllSystems}
              onSetUiTheme={setUiTheme}
            />

            {/* ── SPATIAL GLASS SCROLL PROGRESS INDICATOR BAR (Phase 1) ── */}
            <div className="vision-scroll-indicator-bar">
              <div
                ref={progressFillRef}
                className="vision-scroll-indicator-fill"
                style={{ width: "0%" }}
              />
            </div>

            {/* ── SCROLLABLE CONTENT WITH MOMENTUM (Phase 1) ── */}
            <div
              ref={scrollRef}
              className="vision-glass-content vision-scroll-momentum"
              style={{
                flex: 1, overflowY: "auto", overflowX: "hidden",
                padding: "16px 20px 140px 20px",
              }}
            >
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <StageSwitcher stage={stage} onSelectStage={(st) => setStage(st as Stage)} />
                </div>

                {/* Right Sidebar — Live Stats (Top) + Engineering Log (Bottom) */}
                <div className="hidden xl:flex flex-col gap-4" style={{ width: 300, flexShrink: 0 }}>
                  <div style={{ position: "sticky", top: 8, display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* Live Stat Rail (Top) */}
                    <div className="stat-rail-container">
                      <StatRail />
                    </div>
                    {/* Engineering Log Panel (Bottom) */}
                    <EngineeringLog />
                  </div>
                </div>
              </div>
            </div>

            {/* ── BOTTOM DOCK (Phase 4 Component) ── */}
            <VisionGlassDock
              stages={STAGES}
              categories={WORKSPACE_CATEGORIES}
              activeCategory={activeCategory}
              activeStage={stage}
              onSelectCategory={(id) => setActiveCategory(id as WorkspaceCategory)}
              onSelectStage={(id) => setStage(id as Stage)}
            />
          </div>

          {/* Overlays */}
          <SaveLoadDialog open={dialog.open} mode={dialog.mode} onClose={() => setDialog({ open: false, mode: dialog.mode })} />
          <CommandPalette isOpen={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} onSelectStage={(s) => setStage(s as Stage)} />
          <ThermalAlertMonitor />
        </div>
      </VisionGlassErrorBoundary>
    );
  }

  // ===== Themes 1, 2, 3: Original Layout =====
  return (
    <VisionGlassErrorBoundary>
      <div className={`min-h-screen bg-base-950 flex flex-col grid-bg transition-opacity duration-700 ${booted ? "opacity-100" : "opacity-0"} ${uiTheme}`}>
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0b0f19]/80 backdrop-blur-xl sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.5)] inner-light">
        <div className="max-w-full px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-cyan-400 animate-pulse-glow rounded-lg drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <div>
              <span className="text-sm font-extrabold tracking-wider gradient-text block leading-none">APEX ENGINEER</span>
              <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Design Studio</span>
            </div>
          </div>

          {/* Workspace Category Switcher Pills */}
          <div className="flex items-center gap-1.5 bg-base-900/90 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-inner">
            {WORKSPACE_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    const firstInCat = STAGES.find(s => s.category === cat.id);
                    if (firstInCat && !STAGES.filter(s => s.category === cat.id).some(s => s.id === stage)) {
                      setStage(firstInCat.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ripple-effect haptic-press ${isActive
                    ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] aurora-glow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Control Bar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCmdPaletteOpen(true)}
              className="flex items-center gap-2 bg-base-850/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all hidden md:flex"
              title="Open Command Palette (Ctrl+K)"
            >
              <Search size={13} className="text-cyan-400" />
              <span className="text-[11px]">Search...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-0.5">
                <CmdIcon size={9} /> K
              </kbd>
            </button>

            <div className="hidden lg:flex items-center gap-2 bg-base-850/80 border border-base-800 rounded-lg px-2.5 py-1 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-mono">MO.</span>
                <span className="font-mono font-bold text-accent-300">{company.economy.month}</span>
              </div>
              <div className="h-3 w-px bg-base-700" />
              <div className="flex items-center gap-1">
                <span className="text-ok-400 font-mono font-bold">
                  ${(company.totalRevenue / (company.totalRevenue >= 1e6 ? 1e6 : 1e3)).toFixed(1)}{company.totalRevenue >= 1e6 ? "M" : "k"}
                </span>
              </div>
              <button
                onClick={advanceAllSystems}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent-500/20 text-accent-300 hover:bg-accent-500/30 text-[10px] font-semibold transition-all"
                title="Advance month"
              >
                +1 Mo
              </button>
            </div>

            <div className="flex items-center gap-0.5 bg-base-850 rounded-lg p-0.5 border border-base-800">
              <button onClick={() => setUnits("metric")} className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${units === "metric" ? "bg-accent-500/20 text-accent-300 font-bold" : "text-slate-500 hover:text-slate-300"}`}>
                <Ruler size={11} className="inline mr-1" />Metric
              </button>
              <button onClick={() => setUnits("imperial")} className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${units === "imperial" ? "bg-accent-500/20 text-accent-300 font-bold" : "text-slate-500 hover:text-slate-300"}`}>
                Imperial
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => setDialog({ open: true, mode: "save" })} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-base-800 transition-all" title="Save Design">
                <Save size={14} />
              </button>
              <button onClick={() => setDialog({ open: true, mode: "load" })} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-base-800 transition-all" title="Load Design">
                <FolderOpen size={14} />
              </button>
              <button onClick={resetDesign} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-base-800 transition-all" title="Reset to Defaults">
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-Navigation Bar */}
      <nav className="border-b border-white/5 bg-[#0b0f19]/60 backdrop-blur-md sticky top-14 z-30 shadow-md">
        <div className="max-w-full px-6 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {activeCategoryStages.map((s) => {
            const isCurrent = stage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStage(s.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ripple-effect haptic-press ${isCurrent
                  ? "bg-gradient-to-r from-cyan-500/30 to-sky-500/20 text-cyan-100 border border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.25)] neon-underline font-bold"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
                  }`}
              >
                <span className={isCurrent ? "text-cyan-300" : "text-slate-500"}>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 max-w-full w-full px-6 py-4 pb-44 flex gap-4">
        <div className="flex-1 min-w-0">
          <StageSwitcher stage={stage} onSelectStage={(st) => setStage(st as Stage)} />
        </div>
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20 stat-rail-container">
            <StatRail />
          </div>
        </div>
      </div>

      <SaveLoadDialog
        open={dialog.open}
        mode={dialog.mode}
        onClose={() => setDialog({ open: false, mode: dialog.mode })}
      />

      <CommandPalette
        isOpen={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        onSelectStage={(s) => setStage(s as Stage)}
      />

      <ThermalAlertMonitor />
      <AgentNotificationCenter
        findings={AgentOrchestrator.getInstance().getAggregateFindings()}
        onApplyRecommendation={(rec: any) => updateEngine(rec.changes)}
      />

      {uiTheme === "theme2" && <div className="cosmic-sparkle" />}

      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />
      <div className="light-leak" />
    </div>
    </VisionGlassErrorBoundary>
  );
}

export default function App() {
  return (
    <DesignProvider>
      <RDProvider>
        <CompanyProvider>
          <ToastProvider>
            <AppInner />
          </ToastProvider>
        </CompanyProvider>
      </RDProvider>
    </DesignProvider>
  );
}

