import React, { useState } from "react";
import {
  LayoutGrid,
  Cog,
  Car,
  Sparkles,
  Bot,
  Zap,
  BarChart2,
  ShieldCheck,
  Flag,
  Volume2,
  VolumeX,
  Wind,
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
  particlesEnabled = true,
  onToggleParticles,
}) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const sidebarButtons: {
    id: string;
    label: string;
    stage: Stage;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    { id: "command", label: "Command Center", stage: "command", icon: <LayoutGrid size={17} /> },
    { id: "engine", label: "Engine Studio", stage: "engine", icon: <Cog size={17} /> },
    { id: "vehicle", label: "Vehicle Studio", stage: "vehicle", icon: <Car size={17} /> },
    { id: "studio", label: "Grand Studio Hub", stage: "studio", icon: <Sparkles size={17} /> },
    { id: "ai", label: "Apex AI Studio", stage: "ai", icon: <Bot size={17} />, badge: "AI" },
    { id: "higgsfield", label: "Higgsfield AI Suite", stage: "higgsfield", icon: <Zap size={17} />, badge: "HF" },
    { id: "race", label: "Race Simulator", stage: "race", icon: <Flag size={17} /> },
    { id: "stats", label: "Telemetry & Stats", stage: "stats", icon: <BarChart2 size={17} /> },
    { id: "safety", label: "Safety Center", stage: "safety", icon: <ShieldCheck size={17} /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-3 w-14 shrink-0 select-none z-30">
      <div
        className="p-2 py-4 rounded-3xl border flex flex-col items-center gap-2.5 sticky top-24"
        style={{
          background: "rgba(8, 11, 20, 0.88)",
          backdropFilter: "blur(30px) saturate(200%)",
          WebkitBackdropFilter: "blur(30px) saturate(200%)",
          borderColor: "rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.60)",
        }}
      >
        {sidebarButtons.map((btn) => {
          const isActive = activeStage === btn.stage;
          const isHovered = hoveredButton === btn.id;

          return (
            <div key={btn.id} className="relative flex items-center">
              {/* Tooltip slide-out label */}
              {isHovered && (
                <div
                  className="absolute left-14 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap shadow-[0_10px_25px_rgba(0,0,0,0.7)] z-50 pointer-events-none flex items-center gap-1.5"
                  style={{
                    background: "rgba(10, 15, 26, 0.95)",
                    borderColor: "rgba(0, 245, 212, 0.3)",
                    color: "#ffffff",
                  }}
                >
                  <span>{btn.label}</span>
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#0a0f1a] border-l border-b border-[#00F5D4]/30" />
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
                className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/50 shadow-[0_0_15px_rgba(0,245,212,0.35)] scale-105"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5 hover:scale-105"
                }`}
              >
                {btn.icon}

                {/* Badge indicator */}
                {btn.badge && (
                  <span className="absolute -top-1 -right-1 px-1 min-w-3.5 h-3.5 rounded-full bg-[#FFB703] text-zinc-950 text-[8px] font-black flex items-center justify-center">
                    {btn.badge}
                  </span>
                )}

                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-[#00F5D4] shadow-[0_0_8px_#00F5D4]" />
                )}
              </button>
            </div>
          );
        })}

        <div className="w-6 h-px bg-white/10 my-1" />

        {/* Audio Synthesizer Toggle */}
        {onToggleSound && (
          <button
            onClick={() => {
              playHMIClickSound();
              onToggleSound();
            }}
            title={soundEnabled ? "Mute Synthesizer" : "Unmute Synthesizer"}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              soundEnabled
                ? "bg-[#FFB703]/15 text-[#FFB703] border border-[#FFB703]/30"
                : "bg-white/5 text-zinc-500 border border-white/5"
            }`}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        )}

        {/* Ambient Particles Toggle */}
        {onToggleParticles && (
          <button
            onClick={() => {
              playHMIClickSound();
              onToggleParticles();
            }}
            title={particlesEnabled ? "Disable Cyberpunk Particles" : "Enable Cyberpunk Particles"}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              particlesEnabled
                ? "bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/30"
                : "bg-white/5 text-zinc-500 border border-white/5"
            }`}
          >
            <Wind size={15} />
          </button>
        )}
      </div>
    </aside>
  );
};
