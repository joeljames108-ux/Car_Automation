import React, { useState, useCallback } from "react";
import {
  LayoutDashboard,
  Cog,
  Car,
  Wind,
  Sparkles,
  Activity,
  Trophy,
  Bot,
  Flag,
  Warehouse,
} from "lucide-react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import type { Stage } from "../../StageSwitcher";

export interface NeonHorizonDockProps {
  activeStage: Stage;
  onSelectStage: (stage: Stage) => void;
  sceneMode?: "track" | "wind_tunnel" | "lab" | "rd" | "showroom";
  onSelectSceneMode?: (mode: "track" | "wind_tunnel" | "lab" | "rd" | "showroom") => void;
}

export const NeonHorizonDock: React.FC<NeonHorizonDockProps> = ({
  activeStage,
  onSelectStage,
  sceneMode = "track",
  onSelectSceneMode,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const dockItems: { id: Stage; label: string; icon: React.ReactNode }[] = [
    { id: "command", label: "Command", icon: <LayoutDashboard size={18} /> },
    { id: "engine", label: "Engine", icon: <Cog size={18} /> },
    { id: "vehicle", label: "Vehicle", icon: <Car size={18} /> },
    { id: "aero", label: "Aero Lab", icon: <Wind size={18} /> },
    { id: "studio", label: "Studio Hub", icon: <Sparkles size={18} /> },
    { id: "simulation", label: "Sim Lab", icon: <Activity size={18} /> },
    { id: "ai", label: "Apex AI", icon: <Bot size={18} /> },
    { id: "race", label: "Race Track", icon: <Flag size={18} /> },
    { id: "garage", label: "Garage", icon: <Warehouse size={18} /> },
  ];

  const sceneModes: { id: "track" | "wind_tunnel" | "lab" | "rd" | "showroom"; label: string }[] = [
    { id: "track", label: "Track" },
    { id: "wind_tunnel", label: "Wind Tunnel" },
    { id: "lab", label: "Lab" },
    { id: "rd", label: "R&D" },
    { id: "showroom", label: "Showroom" },
  ];

  // Vision Glass macOS / Vision OS Dock magnification math
  const getMagnification = useCallback((idx: number) => {
    if (hoveredIdx === null) return 1;
    const distance = Math.abs(idx - hoveredIdx);
    if (distance === 0) return 1.25;
    if (distance === 1) return 1.12;
    if (distance === 2) return 1.04;
    return 1;
  }, [hoveredIdx]);

  const activeItemLabel = dockItems.find((item) => item.id === activeStage)?.label || "";

  return (
    <nav
      role="navigation"
      aria-label="Vision Glass Interactive Dock"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 select-none pointer-events-auto max-w-[96vw]"
    >
      {/* Floating Active Module Label (Vision Glass Dock Feature) */}
      <div
        key={activeStage}
        className="text-[10px] font-bold text-sky-300/80 tracking-widest uppercase animate-nh-materialize pointer-events-none drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]"
      >
        {activeItemLabel}
      </div>

      {/* Floating Scene Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#060e20]/90 backdrop-blur-2xl border border-cyan-400/30 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        {sceneModes.map((sm) => {
          const isActive = sceneMode === sm.id;
          return (
            <button
              key={sm.id}
              onClick={() => {
                playHMIClickSound();
                if (onSelectSceneMode) onSelectSceneMode(sm.id);
              }}
              className={`px-3.5 py-1 rounded-xl text-[11px] font-bold nh-font-body tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/35 to-sky-500/25 text-white border border-cyan-400/60 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              {sm.label}
            </button>
          );
        })}
      </div>

      {/* Main Glassmorphic Dock Bar with Vision OS Magnification */}
      <div className="flex items-end gap-2 px-4 py-2 rounded-2xl bg-[#060c1c]/90 backdrop-blur-3xl border border-cyan-400/40 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(0,229,255,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300">
        {dockItems.map((item, idx) => {
          const isActive = activeStage === item.id;
          const isHovered = hoveredIdx === idx;
          const mag = getMagnification(idx);

          return (
            <div key={item.id} className="relative flex flex-col items-center">
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-9 px-2.5 py-1 rounded-lg bg-[#081530]/95 backdrop-blur-md border border-cyan-400/50 text-[10px] nh-font-headline font-bold text-cyan-200 uppercase tracking-wider whitespace-nowrap shadow-[0_4px_15px_rgba(0,0,0,0.7)] animate-nh-materialize z-50">
                  {item.label}
                </div>
              )}

              <button
                onClick={() => {
                  playHMIClickSound();
                  onSelectStage(item.id);
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  transform: `scale(${mag})`,
                  transformOrigin: "bottom center",
                  transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400/70 shadow-[0_0_20px_rgba(0,229,255,0.5)] font-bold"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/10 border border-transparent"
                }`}
              >
                {item.icon}
              </button>

              {/* Active neon pip */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,229,255,1)] mt-1 animate-nh-pulse-dot" />
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Active Indicator Dots Bar below dock */}
      <div className="flex gap-1.5 items-center justify-center pt-0.5">
        {dockItems.map((item) => (
          <div
            key={item.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeStage === item.id
                ? "w-4 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                : "w-1.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    </nav>
  );
};
