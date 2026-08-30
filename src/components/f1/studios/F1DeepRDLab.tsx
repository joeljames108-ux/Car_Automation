import React, { useState, memo, lazy, Suspense } from "react";
import {
  Wind, Zap, Shield, Disc, Activity, Sparkles, Layers,
  Sliders, Award, Compass, Palette, Flame, Gauge, CheckCircle2
} from "lucide-react";
import { F1RegulationViewer } from "../F1RegulationViewer";
import { F1BudgetBar } from "../F1BudgetBar";
import { playHMITabSound } from "../../../utils/hmiSoundSynth";

const WindTunnelStudio = lazy(() => import("./WindTunnelStudio").then(m => ({ default: m.WindTunnelStudio })));
const DynoBenchStudio = lazy(() => import("./DynoBenchStudio").then(m => ({ default: m.DynoBenchStudio })));
const MonocoqueStudio = lazy(() => import("./MonocoqueStudio").then(m => ({ default: m.MonocoqueStudio })));
const AerodynamicsStudio = lazy(() => import("./AerodynamicsStudio").then(m => ({ default: m.AerodynamicsStudio })));
const PowerUnitStudio = lazy(() => import("./PowerUnitStudio").then(m => ({ default: m.PowerUnitStudio })));
const BrakesStudio = lazy(() => import("./BrakesStudio").then(m => ({ default: m.BrakesStudio })));
const SuspensionStudio = lazy(() => import("./SuspensionStudio").then(m => ({ default: m.SuspensionStudio })));
const DrivetrainStudio = lazy(() => import("./DrivetrainStudio").then(m => ({ default: m.DrivetrainStudio })));
const CockpitStudio = lazy(() => import("./CockpitStudio").then(m => ({ default: m.CockpitStudio })));
const LiveryStudio = lazy(() => import("./LiveryStudio").then(m => ({ default: m.LiveryStudio })));

export type F1RDSubTab =
  | "windtunnel"
  | "dynobench"
  | "monocoque"
  | "aero"
  | "powerunit"
  | "brakes"
  | "suspension"
  | "drivetrain"
  | "cockpit"
  | "livery"
  | "scrutineering";

interface F1RDTabDefinition {
  id: F1RDSubTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const RD_TABS: F1RDTabDefinition[] = [
  { id: "windtunnel", label: "CFD Wind Tunnel", icon: <Wind size={14} className="text-amber-400" />, badge: "ATR 60%" },
  { id: "dynobench", label: "V6 Hybrid Dyno", icon: <Zap size={14} className="text-amber-400" />, badge: "1000+ HP" },
  { id: "monocoque", label: "Monocoque & Crash Rig", icon: <Shield size={14} className="text-amber-400" /> },
  { id: "aero", label: "Venturi Aero & Wings", icon: <Compass size={14} className="text-emerald-400" /> },
  { id: "powerunit", label: "Power Unit PU/ICE", icon: <Flame size={14} className="text-rose-400" /> },
  { id: "brakes", label: "Carbon Brakes Lab", icon: <Disc size={14} className="text-red-400" /> },
  { id: "suspension", label: "Suspension Kinematics", icon: <Activity size={14} className="text-teal-400" /> },
  { id: "drivetrain", label: "Seamless Gearbox", icon: <Layers size={14} className="text-amber-400" /> },
  { id: "cockpit", label: "Cockpit & Telemetry", icon: <Sliders size={14} className="text-amber-400" /> },
  { id: "livery", label: "Livery & Paint Shop", icon: <Palette size={14} className="text-pink-400" /> },
  { id: "scrutineering", label: "FIA Scrutineering", icon: <Award size={14} className="text-yellow-400" />, badge: "FIA" },
];

export const F1DeepRDLab: React.FC = memo(function F1DeepRDLab() {
  const [activeSubTab, setActiveSubTab] = useState<F1RDSubTab>("windtunnel");

  return (
    <div className="w-full h-full flex flex-col bg-amber-950/60 text-white overflow-hidden select-none">
      {/* Top Cost Cap & Resource Bar */}
      <div className="shrink-0">
        <F1BudgetBar />
      </div>

      {/* Sub-Tabs Rail */}
      <div className="shrink-0 px-4 py-2 bg-black/40 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {RD_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playHMITabSound();
                setActiveSubTab(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border cursor-pointer ${
                isActive
                  ? "bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-sm shadow-cyan-500/20"
                  : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-black">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={
            <div className="p-8 flex items-center justify-center text-xs font-mono text-amber-400">
              <span className="animate-pulse">Loading R&D Laboratory Environment...</span>
            </div>
          }>
            {activeSubTab === "windtunnel" && <WindTunnelStudio />}
            {activeSubTab === "dynobench" && <DynoBenchStudio />}
            {activeSubTab === "monocoque" && <MonocoqueStudio />}
            {activeSubTab === "aero" && <AerodynamicsStudio />}
            {activeSubTab === "powerunit" && <PowerUnitStudio />}
            {activeSubTab === "brakes" && <BrakesStudio />}
            {activeSubTab === "suspension" && <SuspensionStudio />}
            {activeSubTab === "drivetrain" && <DrivetrainStudio />}
            {activeSubTab === "cockpit" && <CockpitStudio />}
            {activeSubTab === "livery" && <LiveryStudio />}
            {activeSubTab === "scrutineering" && <F1RegulationViewer />}
          </Suspense>
        </div>
      </div>
    </div>
  );
});

export default F1DeepRDLab;
