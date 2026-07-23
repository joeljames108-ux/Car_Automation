import { useState, useEffect } from "react";
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

type Stage =
  | "command" | "engine" | "vehicle" | "exterior" | "aero" | "interior"
  | "manufacturing" | "infotainment" | "rd" | "simulation" | "testing"
  | "race" | "stats" | "press" | "competitors"
  | "garage" | "compare" | "economy" | "motorsport" | "twin" | "safety" | "sales";

const STAGES: { id: Stage; label: string; icon: React.ReactNode; group: "design" | "world" }[] = [
  // --- Design & Engineering ---
  { id: "command",       label: "Command",      icon: <LayoutDashboard size={14} />, group: "design" },
  { id: "engine",        label: "Engine",        icon: <Cog size={14} />,            group: "design" },
  { id: "vehicle",       label: "Vehicle",       icon: <Car size={14} />,            group: "design" },
  { id: "exterior",      label: "Exterior",      icon: <Paintbrush size={14} />,     group: "design" },
  { id: "aero",          label: "Aero Lab",      icon: <Wind size={14} />,           group: "design" },
  { id: "interior",      label: "Interior",      icon: <Sofa size={14} />,           group: "design" },
  { id: "manufacturing", label: "Mfg",           icon: <Factory size={14} />,        group: "design" },
  { id: "infotainment",  label: "Electronics",   icon: <Monitor size={14} />,        group: "design" },
  { id: "safety",        label: "Safety",        icon: <ShieldCheck size={14} />,    group: "design" },
  { id: "rd",            label: "R&D",           icon: <Microscope size={14} />,     group: "design" },
  { id: "simulation",    label: "Sim",           icon: <Activity size={14} />,       group: "design" },
  { id: "testing",       label: "Testing",       icon: <FlaskConical size={14} />,   group: "design" },
  { id: "race",          label: "Race",          icon: <Flag size={14} />,           group: "design" },
  { id: "stats",         label: "Stats",         icon: <BarChart3 size={14} />,      group: "design" },
  // --- Company & World ---
  { id: "garage",        label: "Garage",        icon: <Warehouse size={14} />,         group: "world" },
  { id: "compare",       label: "Compare",       icon: <GitCompare size={14} />,     group: "world" },
  { id: "economy",       label: "Economy",       icon: <TrendingUp size={14} />,     group: "world" },
  { id: "motorsport",    label: "Motorsport",    icon: <Trophy size={14} />,         group: "world" },
  { id: "twin",          label: "Digital Twin",  icon: <Cpu size={14} />,            group: "world" },
  { id: "sales",         label: "Sales",         icon: <DollarSign size={14} />,     group: "world" },
  { id: "press",         label: "Press",         icon: <Newspaper size={14} />,      group: "world" },
  { id: "competitors",   label: "Rivals",        icon: <GitBranch size={14} />,      group: "world" },
];

function AppInner() {
  const [stage, setStage] = useState<Stage>("command");
  const [dialog, setDialog] = useState<{ open: boolean; mode: "save" | "load" }>({ open: false, mode: "save" });
  const { design, resetDesign, units, setUnits } = useDesign();
  const { company, advanceAllSystems } = useCompany();
  const [booted, setBooted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBooted(true), 60); return () => clearTimeout(t); }, []);

  const designStages = STAGES.filter(s => s.group === "design");
  const worldStages  = STAGES.filter(s => s.group === "world");

  return (
    <div className={`min-h-screen bg-base-950 flex flex-col grid-bg transition-opacity duration-700 ${booted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <header className="border-b border-base-800 bg-base-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1700px] mx-auto px-4 h-14 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-accent-400 animate-pulse-glow rounded-lg" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-sm font-bold tracking-tight gradient-text hidden sm:block">APEX ENGINEER</span>
          </div>

          {/* Nav — two groups */}
          <div className="flex items-center gap-1 flex-1 overflow-x-auto">
            {/* Design group */}
            <div className="flex items-center gap-0.5 bg-base-850 rounded-lg p-1 border border-base-800">
              {designStages.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStage(s.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                    stage === s.id ? "bg-accent-500/20 text-accent-300 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-base-800/50"
                  }`}
                >
                  {s.icon}
                  <span className="hidden xl:inline">{s.label}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-base-700 mx-0.5 shrink-0" />

            {/* World group */}
            <div className="flex items-center gap-0.5 bg-base-900 rounded-lg p-1 border border-accent-500/20">
              {worldStages.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStage(s.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                    stage === s.id ? "bg-accent-500/20 text-accent-300 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-base-800/50"
                  }`}
                >
                  {s.icon}
                  <span className="hidden xl:inline">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Company Quick Status & Fast Advance */}
          <div className="hidden lg:flex items-center gap-3 bg-base-850/80 border border-base-800 rounded-lg px-2.5 py-1 text-xs shrink-0">
            <div className="flex items-center gap-1.5">
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
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-accent-500/20 text-accent-300 hover:bg-accent-500/30 text-[10px] font-semibold transition-all"
              title="Advance month for economy, motorsport, and market systems"
            >
              +1 Mo
            </button>
          </div>

          {/* Unit toggle */}
          <div className="flex items-center gap-1 bg-base-850 rounded-lg p-1 border border-base-800 shrink-0">
            <button onClick={() => setUnits("metric")} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${units === "metric" ? "bg-accent-500/20 text-accent-300" : "text-slate-500 hover:text-slate-300"}`}>
              <Ruler size={11} /> <span className="hidden sm:inline">Metric</span>
            </button>
            <button onClick={() => setUnits("imperial")} className={`px-2 py-1 rounded text-xs font-medium transition-all ${units === "imperial" ? "bg-accent-500/20 text-accent-300" : "text-slate-500 hover:text-slate-300"}`}>
              <span className="hidden sm:inline">Imperial</span><span className="sm:hidden">Imp</span>
            </button>
          </div>

          <input
            value={design.name}
            onChange={() => {}}
            className="bg-base-850 border border-base-800 rounded-lg px-3 py-1.5 text-sm text-slate-300 w-40 focus:border-accent-500 focus:outline-none hidden md:block"
            readOnly
          />

          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setDialog({ open: true, mode: "save" })} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-base-800 transition-all">
              <Save size={13} /> <span className="hidden sm:inline">Save</span>
            </button>
            <button onClick={() => setDialog({ open: true, mode: "load" })} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-base-800 transition-all">
              <FolderOpen size={13} /> <span className="hidden sm:inline">Load</span>
            </button>
            <button onClick={resetDesign} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-base-800 transition-all">
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 max-w-[1700px] mx-auto w-full px-4 py-4 pb-44 flex gap-4">
        <div className="flex-1 min-w-0">
          <div key={stage} className="animate-fade-in-up">
            {stage === "command"       && <CommandCenter />}
            {stage === "engine"        && <EngineDesigner />}
            {stage === "vehicle"       && <VehicleDesigner />}
            {stage === "exterior"      && <ExteriorDesigner />}
            {stage === "aero"          && <AeroLab />}
            {stage === "interior"      && <InteriorsDesigner />}
            {stage === "manufacturing" && <ManufacturingDesigner />}
            {stage === "infotainment"  && <InfotainmentDesigner />}
            {stage === "safety"        && <SafetyCenter />}
            {stage === "rd"            && <RDCenter />}
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
          </div>
        </div>
        <div className="hidden lg:block w-48 shrink-0">
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

      <AIAssistant />
    </div>
  );
}

export default function App() {
  return (
    <DesignProvider>
      <RDProvider>
        <CompanyProvider>
          <AppInner />
        </CompanyProvider>
      </RDProvider>
    </DesignProvider>
  );
}
