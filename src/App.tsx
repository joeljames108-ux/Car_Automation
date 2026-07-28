import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cog, Car, Activity, Flag, BarChart3, Save, FolderOpen, RotateCcw,
  Sofa, Factory, FlaskConical, Ruler, Paintbrush, Wind, Newspaper,
  Monitor, Microscope, LayoutDashboard, Trophy, Warehouse, GitCompare,
  TrendingUp, ShieldCheck, DollarSign, Cpu, GitBranch,
} from "lucide-react";
import { DesignProvider, useDesign } from "./state/DesignContext";
import { RDProvider } from "./state/RDContext";
import { CompanyProvider, useCompany } from "./state/CompanyContext";
import { EngineDesigner } from "./components/EngineDesigner";
import { VehicleDesigner } from "./components/VehicleDesigner";
import { ExteriorDesigner } from "./components/ExteriorDesigner";
import { AeroLab } from "./components/AeroLab";
import { InteriorsDesigner } from "./components/InteriorsDesigner";
import { ManufacturingDesigner } from "./components/ManufacturingDesigner";
import { InfotainmentDesigner } from "./components/InfotainmentDesigner";
import { SimulationDashboard } from "./components/SimulationDashboard";
import { RaceSimulator } from "./components/RaceSimulator";
import { DetailedStats } from "./components/DetailedStats";
import { TestingLab } from "./components/TestingLab";
import { StatRail } from "./components/StatRail";
import { SaveLoadDialog } from "./components/SaveLoadDialog";
import { AIAssistant } from "./components/AIAssistant";
import { PressReviews } from "./components/PressReviews";
import { RDCenter } from "./components/RDCenter";
import { CommandCenter } from "./components/CommandCenter";
import { Competitors } from "./components/Competitors";
import { VehicleGarage } from "./components/VehicleGarage";
import { EngineeringComparison } from "./components/EngineeringComparison";
import { DynamicEconomy } from "./components/DynamicEconomy";
import { MotorsportDivision } from "./components/MotorsportDivision";
import { DigitalTwin } from "./components/DigitalTwin";
import { SafetyCenter } from "./components/SafetyCenter";
import { SalesLaunch } from "./components/SalesLaunch";

import { CommandPalette } from "./components/CommandPalette";
import { ToastProvider } from "./components/ToastSystem";
import { Search, Command as CmdIcon } from "lucide-react";

import { Wrench } from "lucide-react";

type Stage =
  | "command" | "engine" | "vehicle" | "exterior" | "aero" | "interior"
  | "manufacturing" | "infotainment" | "rd" | "simulation" | "testing"
  | "race" | "stats" | "press" | "competitors"
  | "garage" | "compare" | "economy" | "motorsport" | "twin" | "safety" | "sales";

export type WorkspaceCategory = "engineering" | "simulation" | "world";

interface StageItem {
  id: Stage;
  label: string;
  icon: React.ReactNode;
  category: WorkspaceCategory;
}

const STAGES: StageItem[] = [
  // --- Engineering Studio ---
  { id: "command",       label: "Command Center", icon: <LayoutDashboard size={14} />, category: "engineering" },
  { id: "engine",        label: "Engine",         icon: <Cog size={14} />,             category: "engineering" },
  { id: "vehicle",       label: "Vehicle",        icon: <Car size={14} />,             category: "engineering" },
  { id: "exterior",      label: "Exterior",       icon: <Paintbrush size={14} />,      category: "engineering" },
  { id: "aero",          label: "Aero Lab",       icon: <Wind size={14} />,            category: "engineering" },
  { id: "interior",      label: "Interior",       icon: <Sofa size={14} />,            category: "engineering" },
  { id: "manufacturing", label: "Manufacturing",  icon: <Factory size={14} />,         category: "engineering" },
  { id: "infotainment",  label: "Electronics",    icon: <Monitor size={14} />,         category: "engineering" },
  { id: "safety",        label: "Safety Center",  icon: <ShieldCheck size={14} />,     category: "engineering" },

  // --- Simulation & Testing ---
  { id: "simulation",    label: "Simulation",     icon: <Activity size={14} />,        category: "simulation" },
  { id: "testing",       label: "Testing Lab",    icon: <FlaskConical size={14} />,    category: "simulation" },
  { id: "race",          label: "Race Track",     icon: <Flag size={14} />,            category: "simulation" },
  { id: "stats",         label: "Telemetry Stats",icon: <BarChart3 size={14} />,       category: "simulation" },

  // --- World & Racing ---
  { id: "garage",        label: "Garage",         icon: <Warehouse size={14} />,       category: "world" },
  { id: "compare",       label: "Compare",        icon: <GitCompare size={14} />,      category: "world" },
  { id: "economy",       label: "Economy",        icon: <TrendingUp size={14} />,      category: "world" },
  { id: "motorsport",    label: "Motorsport",     icon: <Trophy size={14} />,          category: "world" },
  { id: "twin",          label: "Digital Twin",   icon: <Cpu size={14} />,             category: "world" },
  { id: "sales",         label: "Sales",          icon: <DollarSign size={14} />,      category: "world" },
  { id: "press",         label: "Press Reviews",  icon: <Newspaper size={14} />,       category: "world" },
  { id: "competitors",   label: "Rivals",         icon: <GitBranch size={14} />,       category: "world" },
];

const WORKSPACE_CATEGORIES: { id: WorkspaceCategory; label: string; icon: React.ReactNode }[] = [
  { id: "engineering", label: "Engineering Studio", icon: <Wrench size={14} /> },
  { id: "simulation",  label: "Sim & Testing",      icon: <Activity size={14} /> },
  { id: "world",       label: "World & Racing",     icon: <Trophy size={14} /> },
];

function AppInner() {
  const [stage, setStage] = useState<Stage>("command");
  const [activeCategory, setActiveCategory] = useState<WorkspaceCategory>("engineering");
  const [dialog, setDialog] = useState<{ open: boolean; mode: "save" | "load" }>({ open: false, mode: "save" });
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const { resetDesign, units, setUnits, uiTheme } = useDesign();
  const { company, advanceAllSystems } = useCompany();

  // Global Ctrl+K / Cmd+K key listener
  useEffect(() => {
    function handleGlobalKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  const activeCategoryStages = STAGES.filter(s => s.category === activeCategory);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 selection:bg-cyan-500/30 selection:text-cyan-200 ${uiTheme === "theme2" ? "cosmic-theme" : "dark-slate-theme"}`}>
      {/* Header (Frosted Glassmorphism Header Bar) */}
      <header className="border-b border-white/10 bg-[#070a12]/80 backdrop-blur-xl sticky top-0 z-40 shadow-2xl transition-all">
        <div className="max-w-[1700px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
          
          {/* Logo & Category Switcher */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] border border-cyan-300/30">
                <Car size={18} className="text-white drop-shadow" />
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-white text-base bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-cyan-400">APEX</span>
                <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-mono font-bold block -mt-1">ENGINEER</span>
              </div>
            </div>

            {/* Workspace Category Tabs */}
            <div className="hidden sm:flex items-center gap-1 bg-base-900/80 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-inner">
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
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Control Bar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setCmdPaletteOpen(true)}
              className="flex items-center gap-2 bg-base-850/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all hidden md:flex shadow-inner"
              title="Open Command Palette (Ctrl+K)"
            >
              <Search size={13} className="text-cyan-400" />
              <span className="text-[11px]">Search...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 flex items-center gap-0.5">
                <CmdIcon size={9} /> K
              </kbd>
            </button>

            {/* Live Economy Snapshot */}
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

            {/* Unit Toggle */}
            <div className="flex items-center gap-0.5 bg-base-850 rounded-lg p-0.5 border border-base-800">
              <button onClick={() => setUnits("metric")} className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${units === "metric" ? "bg-accent-500/20 text-accent-300 font-bold" : "text-slate-500 hover:text-slate-300"}`}>
                <Ruler size={11} className="inline mr-1" />Metric
              </button>
              <button onClick={() => setUnits("imperial")} className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${units === "imperial" ? "bg-accent-500/20 text-accent-300 font-bold" : "text-slate-500 hover:text-slate-300"}`}>
                Imperial
              </button>
            </div>

            {/* Save / Load / Reset */}
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

      {/* Sub-Navigation Bar (Frosted Glass Module Switcher) */}
      <nav className="border-b border-white/10 bg-[#070a12]/60 backdrop-blur-xl sticky top-14 z-30 shadow-lg">
        <div className="max-w-[1700px] mx-auto px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {activeCategoryStages.map((s) => {
            const isCurrent = stage === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStage(s.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isCurrent
                    ? "bg-gradient-to-r from-cyan-500/30 to-sky-500/20 text-cyan-100 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] font-bold"
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

      {/* Main content with Smooth Framer Motion Animated Page Transitions */}
      <div className="flex-1 max-w-[1700px] mx-auto w-full px-4 py-4 pb-44 flex gap-4">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {stage === "command"       && <CommandCenter onSelectStage={(st) => setStage(st as Stage)} />}
              {stage === "engine"        && <EngineDesigner />}
              {stage === "vehicle"       && <VehicleDesigner />}
              {stage === "exterior"      && <ExteriorDesigner />}
              {stage === "aero"          && <AeroLab />}
              {stage === "interior"      && <InteriorsDesigner />}
              {stage === "manufacturing" && <ManufacturingDesigner />}
              {stage === "infotainment"  && <InfotainmentDesigner />}
              {stage === "safety"        && <SafetyCenter />}
              {stage === "simulation"    && <SimulationDashboard />}
              {stage === "testing"       && <TestingLab />}
              {stage === "race"          && <RaceSimulator />}
              {stage === "stats"         && <DetailedStats />}
              {stage === "press"         && <PressReviews />}
              {stage === "garage"        && <VehicleGarage />}
              {stage === "compare"       && <EngineeringComparison />}
              {stage === "economy"       && <DynamicEconomy />}
              {stage === "motorsport"    && <MotorsportDivision />}
              {stage === "twin"          && <DigitalTwin />}
              {stage === "sales"         && <SalesLaunch />}
              {stage === "competitors"   && <Competitors />}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20">
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

      <AIAssistant />

      {/* Cosmic sparkle for Theme 2 */}
      {uiTheme === "theme2" && <div className="cosmic-sparkle" />}

      {/* Ambient floating orbs & light leak for atmospheric depth */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />
      <div className="light-leak" />
    </div>
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

