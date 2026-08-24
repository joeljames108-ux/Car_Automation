import React, { ReactNode } from "react";
import {
  Home,
  Cog,
  Car,
  Paintbrush,
  Rocket,
  Sofa,
  Factory,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import type { Stage } from "../../StageSwitcher";
import { playHMITabSound } from "../../../utils/hmiSoundSynth";

export interface NeonHorizonContentViewportProps {
  children: ReactNode;
  activeStage: Stage;
  onSelectStage: (stage: Stage) => void;
  className?: string;
}

const TOP_NAV_TABS: { id: Stage; label: string; icon: React.ReactNode }[] = [
  { id: "command", label: "Command Center", icon: <Home size={18} /> },
  { id: "engine", label: "Engine", icon: <Cog size={18} /> },
  { id: "vehicle", label: "Vehicle", icon: <Car size={18} /> },
  { id: "exterior", label: "Exterior", icon: <Paintbrush size={18} /> },
  { id: "aero", label: "Aero Lab", icon: <Rocket size={18} /> },
  { id: "interior", label: "Interior", icon: <Sofa size={18} /> },
  { id: "manufacturing", label: "Manufacturing", icon: <Factory size={18} /> },
  { id: "infotainment", label: "Electronics", icon: <Cpu size={18} /> },
  { id: "safety", label: "Safety Center", icon: <ShieldCheck size={18} /> },
];

export const NeonHorizonContentViewport: React.FC<NeonHorizonContentViewportProps> = ({
  children,
  activeStage,
  onSelectStage,
  className = "",
}) => {
  return (
    <div className={`flex-1 min-w-0 flex flex-col gap-4 ${className}`}>
      {/* Main Glass Cockpit Window Container */}
      <div className="p-6 rounded-3xl bg-[#111c2e]/85 backdrop-blur-3xl border border-white/12 shadow-[0_25px_60px_rgba(0,0,0,0.65)] flex flex-col gap-6">
        {/* Top 9-Item Cockpit Navigation Bar */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 pb-4 border-b border-white/10 select-none">
          {TOP_NAV_TABS.map((tab) => {
            const isActive = activeStage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playHMITabSound();
                  onSelectStage(tab.id);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer group ${
                  isActive
                    ? "bg-sky-500/15 text-sky-300 border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <div className={`mb-1 transition-transform group-hover:scale-110 ${isActive ? "text-sky-400" : "text-slate-400"}`}>
                  {tab.icon}
                </div>
                <span className="text-[11px] font-semibold tracking-tight text-center truncate w-full">
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-6 h-0.5 bg-sky-400 rounded-full mt-1.5 shadow-[0_0_6px_#38bdf8]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="min-h-[540px]">
          {children}
        </div>
      </div>
    </div>
  );
};
