import React, { useState } from "react";
import {
  LayoutGrid,
  Search,
  BarChart2,
  Bell,
  Sliders,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  ShieldCheck,
} from "lucide-react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import type { Stage } from "../../StageSwitcher";

export interface NeonHorizonSidebarProps {
  activeStage: Stage;
  onSelectStage: (stage: Stage) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  particlesEnabled?: boolean;
  onToggleParticles?: () => void;
}

export const NeonHorizonSidebar: React.FC<NeonHorizonSidebarProps> = ({
  activeStage,
  onSelectStage,
  soundEnabled = true,
  onToggleSound,
}) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const sidebarButtons: {
    id: string;
    label: string;
    stage: Stage;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    { id: "apps", label: "App Launcher", stage: "command", icon: <LayoutGrid size={18} /> },
    { id: "studio", label: "Grand Studio Hub", stage: "studio", icon: <Sparkles size={18} /> },
    { id: "ai", label: "Apex AI Studio", stage: "ai", icon: <Bot size={18} />, badge: "AI" },
    { id: "stats", label: "Telemetry & Stats", stage: "stats", icon: <BarChart2 size={18} /> },
    { id: "safety", label: "Safety Center", stage: "safety", icon: <ShieldCheck size={18} /> },
    { id: "controls", label: "Vehicle Studio", stage: "vehicle", icon: <Sliders size={18} /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-2 w-14 shrink-0 select-none z-30">
      <div className="p-2 py-4 rounded-full bg-amber-950/80/85 backdrop-blur-2xl border border-white/12 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col items-center gap-3 sticky top-28">
        {sidebarButtons.map((btn) => {
          const isActive = activeStage === btn.stage;
          const isHovered = hoveredButton === btn.id;

          return (
            <div key={btn.id} className="relative flex items-center">
              {/* Tooltip slide-out label (Vision Glass Toolbar Feature) */}
              {isHovered && (
                <div
                  className="absolute left-14 px-3 py-1.5 rounded-xl bg-amber-950/80/95 backdrop-blur-xl border border-white/12 text-xs font-semibold text-amber-100 whitespace-nowrap shadow-[0_10px_25px_rgba(0,0,0,0.6)] z-50 pointer-events-none flex items-center gap-1.5"
                  style={{ animation: "vg-tooltip-slide-in 0.2s ease-out" }}
                >
                  <span>{btn.label}</span>
                  {/* Arrow indicator */}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-amber-950/80 border-l border-b border-white/12" />
                </div>
              )}

              <button
                onClick={() => {
                  playHMIClickSound();
                  onSelectStage(btn.stage);
                }}
                onMouseEnter={() => setHoveredButton(btn.id)}
                onMouseLeave={() => setHoveredButton(null)}
                title={btn.label}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
 isActive
 ? "bg-amber-500/15 text-sky-200 border border-amber-500/30 scale-105"
 : "bg-white/[0.04] text-amber-300/60 hover:text-amber-100 hover:bg-white/10 border border-white/5 hover:scale-105"
 }`}
              >
                {btn.icon}

                {/* Badge overlay */}
                {btn.badge && (
                  <span className="absolute -top-1 -right-1 px-1 min-w-3.5 h-3.5 rounded-full bg-sky-300/90 text-slate-950 text-[8px] font-extrabold flex items-center justify-center border border-sky-300">
                    {btn.badge}
                  </span>
                )}

                {/* Active side indicator pill */}
                {isActive && (
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-3 rounded-full bg-amber-500" />
                )}
              </button>
            </div>
          );
        })}

        {/* Audio Toggle Button */}
        {onToggleSound && (
          <>
            <div className="w-6 h-px bg-white/10 my-1" />
            <div className="relative flex items-center">
              {hoveredButton === "audio" && (
                <div
                  className="absolute left-14 px-3 py-1.5 rounded-xl bg-amber-950/80/95 backdrop-blur-xl border border-white/12 text-xs font-semibold text-amber-100 whitespace-nowrap shadow-[0_10px_25px_rgba(0,0,0,0.6)] z-50 pointer-events-none"
                  style={{ animation: "vg-tooltip-slide-in 0.2s ease-out" }}
                >
                  <span>{soundEnabled ? "Mute Audio" : "Unmute Audio"}</span>
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-amber-950/80 border-l border-b border-white/12" />
                </div>
              )}
              <button
                onClick={() => {
                  playHMIClickSound();
                  onToggleSound();
                }}
                onMouseEnter={() => setHoveredButton("audio")}
                onMouseLeave={() => setHoveredButton(null)}
                title={soundEnabled ? "Mute Audio" : "Unmute Audio"}
                className="w-10 h-10 rounded-full flex items-center justify-center text-amber-300/60 hover:text-amber-100 bg-white/[0.04] hover:bg-white/10 border border-white/5 transition-all cursor-pointer hover:scale-105"
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
