// ============================================================================
// F1 CONSTRUCTOR — DEEP R&D & ENGINEERING LABORATORIES MASTER SUITE
// ============================================================================

import React, { useState } from "react";
import {
  Wind, Zap, Shield, Disc, Activity, Sparkles, Layers,
  Sliders, Award, Compass, Palette, Flame, Gauge, CheckCircle2
} from "lucide-react";
import { WindTunnelStudio } from "./WindTunnelStudio";
import { DynoBenchStudio } from "./DynoBenchStudio";
import { MonocoqueStudio } from "./MonocoqueStudio";
import { AerodynamicsStudio } from "./AerodynamicsStudio";
import { PowerUnitStudio } from "./PowerUnitStudio";
import { BrakesStudio } from "./BrakesStudio";
import { SuspensionStudio } from "./SuspensionStudio";
import { DrivetrainStudio } from "./DrivetrainStudio";
import { CockpitStudio } from "./CockpitStudio";
import { LiveryStudio } from "./LiveryStudio";
import { F1RegulationViewer } from "../F1RegulationViewer";
import { F1BudgetBar } from "../F1BudgetBar";

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
  { id: "windtunnel", label: "CFD Wind Tunnel", icon: <Wind size={14} className="text-cyan-400" />, badge: "ATR 60%" },
  { id: "dynobench", label: "V6 Hybrid Dyno", icon: <Zap size={14} className="text-amber-400" />, badge: "1000+ HP" },
  { id: "monocoque", label: "Monocoque & Crash Rig", icon: <Shield size={14} className="text-blue-400" /> },
  { id: "aero", label: "Venturi Aero & Wings", icon: <Compass size={14} className="text-emerald-400" /> },
  { id: "powerunit", label: "Power Unit PU/ICE", icon: <Flame size={14} className="text-rose-400" /> },
  { id: "brakes", label: "Carbon Brakes Lab", icon: <Disc size={14} className="text-red-400" /> },
  { id: "suspension", label: "Suspension Kinematics", icon: <Activity size={14} className="text-teal-400" /> },
  { id: "drivetrain", label: "Seamless Gearbox", icon: <Layers size={14} className="text-indigo-400" /> },
  { id: "cockpit", label: "Cockpit & Telemetry", icon: <Sliders size={14} className="text-purple-400" /> },
  { id: "livery", label: "Livery & Paint Shop", icon: <Palette size={14} className="text-pink-400" /> },
  { id: "scrutineering", label: "FIA Scrutineering", icon: <Award size={14} className="text-yellow-400" />, badge: "FIA" },
];

export const F1DeepRDLab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<F1RDSubTab>("windtunnel");

  return (
    <div className="w-full h-full flex flex-col bg-[#07090e] text-white overflow-hidden select-none">
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
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border cursor-pointer ${
                isActive
                  ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-sm shadow-cyan-500/20"
                  : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-black">
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
        </div>
      </div>
    </div>
  );
};

export default F1DeepRDLab;
