import { useState, useEffect } from "react";
import { Cog, Car, Activity, Flag, BarChart3, Save, FolderOpen, RotateCcw, Sofa, Factory, FlaskConical, Ruler, Paintbrush, Wind, Newspaper, Monitor, Microscope, LayoutDashboard, Trophy } from "lucide-react";
import { DesignProvider, useDesign } from "./state/DesignContext";
import { RDProvider } from "./state/RDContext";
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

type Stage = "command" | "engine" | "vehicle" | "exterior" | "aero" | "interior" | "manufacturing" | "infotainment" | "rd" | "simulation" | "testing" | "race" | "stats" | "press" | "competitors";

const STAGES: { id: Stage; label: string; icon: React.ReactNode }[] = [
  { id: "command", label: "Command", icon: <LayoutDashboard size={15} /> },
  { id: "engine", label: "Engine", icon: <Cog size={15} /> },
  { id: "vehicle", label: "Vehicle", icon: <Car size={15} /> },
  { id: "exterior", label: "Exterior", icon: <Paintbrush size={15} /> },
  { id: "aero", label: "Aero Lab", icon: <Wind size={15} /> },
  { id: "interior", label: "Interior", icon: <Sofa size={15} /> },
  { id: "manufacturing", label: "Mfg", icon: <Factory size={15} /> },
  { id: "infotainment", label: "Infotainment", icon: <Monitor size={15} /> },
  { id: "rd", label: "R&D", icon: <Microscope size={15} /> },
  { id: "simulation", label: "Sim", icon: <Activity size={15} /> },
  { id: "testing", label: "Testing", icon: <FlaskConical size={15} /> },
  { id: "race", label: "Race", icon: <Flag size={15} /> },
  { id: "stats", label: "Stats", icon: <BarChart3 size={15} /> },
  { id: "press", label: "Press", icon: <Newspaper size={15} /> },
  { id: "competitors", label: "Competitors", icon: <Trophy size={15} /> },
];

function AppInner() {
  const [stage, setStage] = useState<Stage>("command");
  const [dialog, setDialog] = useState<{ open: boolean; mode: "save" | "load" }>({ open: false, mode: "save" });
  const { design, resetDesign, units, setUnits } = useDesign();
  const [booted, setBooted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBooted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div className={`min-h-screen bg-base-950 flex flex-col grid-bg transition-opacity duration-700 ${booted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <header className="border-b border-base-800 bg-base-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-accent-400 animate-pulse-glow rounded-lg" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-sm font-bold tracking-tight gradient-text">APEX ENGINEER</span>
          </div>

          <div className="flex items-center gap-0.5 bg-base-850 rounded-lg p-1 border border-base-800 overflow-x-auto">
            {STAGES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStage(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  stage === s.id ? "bg-accent-500/20 text-accent-300 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-base-800/50"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Unit toggle */}
          <div className="flex items-center gap-1 bg-base-850 rounded-lg p-1 border border-base-800">
            <button
              onClick={() => setUnits("metric")}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                units === "metric" ? "bg-accent-500/20 text-accent-300" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Ruler size={12} /> Metric
            </button>
            <button
              onClick={() => setUnits("imperial")}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                units === "imperial" ? "bg-accent-500/20 text-accent-300" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Imperial
            </button>
          </div>

          <input
            value={design.name}
            onChange={() => {}}
            className="bg-base-850 border border-base-800 rounded-lg px-3 py-1.5 text-sm text-slate-300 w-48 focus:border-accent-500 focus:outline-none"
            readOnly
          />

          <div className="flex items-center gap-1">
            <button onClick={() => setDialog({ open: true, mode: "save" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-base-800 transition-all">
              <Save size={14} /> Save
            </button>
            <button onClick={() => setDialog({ open: true, mode: "load" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-base-800 transition-all">
              <FolderOpen size={14} /> Load
            </button>
            <button onClick={resetDesign} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-base-800 transition-all">
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 py-4 pb-44 flex gap-4">
        <div className="flex-1 min-w-0">
          <div key={stage} className="animate-fade-in-up">
            {stage === "command" && <CommandCenter />}
            {stage === "engine" && <EngineDesigner />}
            {stage === "vehicle" && <VehicleDesigner />}
            {stage === "exterior" && <ExteriorDesigner />}
            {stage === "aero" && <AeroLab />}
            {stage === "interior" && <InteriorsDesigner />}
            {stage === "manufacturing" && <ManufacturingDesigner />}
            {stage === "infotainment" && <InfotainmentDesigner />}
            {stage === "rd" && <RDCenter />}
            {stage === "simulation" && <SimulationDashboard />}
            {stage === "testing" && <TestingLab />}
            {stage === "race" && <RaceSimulator />}
            {stage === "stats" && <DetailedStats />}
            {stage === "press" && <PressReviews />}
            {stage === "competitors" && <Competitors />}
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
        <AppInner />
      </RDProvider>
    </DesignProvider>
  );
}
