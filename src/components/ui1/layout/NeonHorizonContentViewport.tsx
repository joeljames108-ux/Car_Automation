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
  { id: "vehicle", label: "Vehicle Studio", icon: <Car size={18} /> },
  { id: "interior", label: "Interior & Electronics", icon: <Sofa size={18} /> },
  { id: "manufacturing", label: "Manufacturing", icon: <Factory size={18} /> },
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
      <div className="relative p-6 rounded-3xl bg-[#111a2b]/85 backdrop-blur-3xl border border-white/12 shadow-[0_25px_60px_rgba(0,0,0,0.60),inset_0_1px_0_rgba(255,255,255,0.10)] flex flex-col gap-6 nh-edge-top nh-grain">
        {/* Instrument ruler strip */}
        <div className="nh-ruler -mt-2 opacity-30" aria-hidden="true" />
        {/* Top Cockpit Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pb-4 border-b border-white/10 select-none">
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
 ? "bg-sky-400/10 text-sky-300 border border-sky-400/30"
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
                  <div className="w-6 h-0.5 bg-sky-400 rounded-full mt-1.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="min-h-[540px]">
          {children}
        </div>
        {/* Bottom measurement ruler */}
        <div className="nh-ruler opacity-20 -mb-2" aria-hidden="true" />
      </div>
    </div>
  );
};
