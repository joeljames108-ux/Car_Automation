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
    { id: "vehicle", label: "Vehicle Studio", icon: <Car size={18} /> },
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
    if (distance === 0) return 1.18;
    if (distance === 1) return 1.08;
    if (distance === 2) return 1.02;
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
        className="text-[10px] font-bold text-slate-300/80 tracking-widest uppercase animate-nh-materialize pointer-events-none"
      >
        {activeItemLabel}
      </div>

      {/* Floating Scene Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl border"
        style={{ background: "rgba(8, 14, 28, 0.88)", backdropFilter: "blur(40px) saturate(200%)", borderColor: "rgba(255,255,255,0.06)", boxShadow: "0 10px 30px rgba(0,0,0,0.40)" }}>
        {sceneModes.map((sm) => {
          const isActive = sceneMode === sm.id;
          return (
            <button
              key={sm.id}
              onClick={() => {
                playHMIClickSound();
                if (onSelectSceneMode) onSelectSceneMode(sm.id);
              }}
              className="px-3.5 py-1 rounded-xl text-[11px] font-bold tracking-wider transition-all duration-200 cursor-pointer"
              style={{
                background: isActive ? "rgba(95, 168, 200, 0.10)" : "transparent",
                color: isActive ? "#e4eaf4" : "#506070",
                border: isActive ? "1px solid rgba(95, 168, 200, 0.15)" : "1px solid transparent",
              }}
            >
              {sm.label}
            </button>
          );
        })}
      </div>

      {/* Main Glassmorphic Dock Bar with Vision OS Magnification */}
      <div className="flex items-end gap-2 px-4 py-2 rounded-2xl border transition-all duration-300"
        style={{ background: "rgba(8, 14, 28, 0.85)", backdropFilter: "blur(50px) saturate(220%)", borderColor: "rgba(255,255,255,0.06)", boxShadow: "0 18px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
        {dockItems.map((item, idx) => {
          const isActive = activeStage === item.id;
          const isHovered = hoveredIdx === idx;
          const mag = getMagnification(idx);

          return (
            <div key={item.id} className="relative flex flex-col items-center">
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-9 px-2.5 py-1 rounded-lg backdrop-blur-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap animate-nh-materialize z-50"
                  style={{ background: "rgba(8, 14, 28, 0.92)", border: "1px solid rgba(255,255,255,0.06)", color: "#e4eaf4", boxShadow: "0 4px 15px rgba(0,0,0,0.40)" }}>
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
                className="nh-focus p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer"
                style={{
                  transform: `scale(${mag})`,
                  transformOrigin: "bottom center",
                  transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  background: isActive ? "rgba(95, 168, 200, 0.12)" : "transparent",
                  color: isActive ? "#8cbcd0" : "#506070",
                  border: isActive ? "1px solid rgba(95, 168, 200, 0.20)" : "1px solid transparent",
                }}
              >
                {item.icon}
              </button>

              {/* Active pip */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full mt-1 animate-nh-pulse-dot" style={{ background: "#5fa8c8" }} />
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
                ? "w-4"
                : "w-1.5"
            }`}
          />
        ))}
      </div>
    </nav>
  );
};
