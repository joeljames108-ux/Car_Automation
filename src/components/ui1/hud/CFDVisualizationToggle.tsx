import React, { useState } from "react";
import { Wind, Bot } from "lucide-react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export interface CFDVisualizationToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
}

export const CFDVisualizationToggle: React.FC<CFDVisualizationToggleProps> = ({
  enabled,
  onChange,
  className = "",
}) => {
  const [activeScene, setActiveScene] = useState<"track" | "wind_tunnel" | "lab" | "rd" | "showroom">("track");

  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 w-full select-none ${className}`}>
      {/* Left Scene Mode Pill Bar (Track, Wind Tunnel, Lab, R&D, Showroom) */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#111c2e]/85 backdrop-blur-2xl border border-white/12 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
        {[
          { id: "track" as const, label: "Track" },
          { id: "wind_tunnel" as const, label: "Wind Tunnel" },
          { id: "lab" as const, label: "Lab" },
          { id: "rd" as const, label: "R&D" },
          { id: "showroom" as const, label: "Showroom" },
        ].map((scene) => {
          const isActive = activeScene === scene.id;
          return (
            <button
              key={scene.id}
              onClick={() => {
                playHMIClickSound();
                setActiveScene(scene.id);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
 isActive
 ? "bg-white text-slate-900 shadow-md font-bold"
 : "text-slate-400 hover:text-slate-200"
 }`}
            >
              {scene.label}
            </button>
          );
        })}

        {/* Engineer Avatar Bubble */}
        <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20 ml-1">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=128&auto=format&fit=crop"
            alt="Engineer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>

      {/* Right Controls: CFD Visualization Toggle & Apex AI Floating Button */}
      <div className="flex items-center gap-3">
        {/* CFD Visualization Toggle */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#111c2e]/85 backdrop-blur-2xl border border-white/12 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
          <span className="text-xs font-bold text-slate-200">
            CFD Visualization
          </span>

          {/* Color Map Gradient Spectrum Bar */}
          <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 rounded-md bg-black/40 border border-white/10">
            <span className="text-[9px] font-mono text-slate-400">Low</span>
            <div className="flex flex-col items-center">
              <div
                className="w-24 h-1.5 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #38bdf8 0%, #34d399 35%, #fbbf24 70%, #f43f5e 100%)",
                }}
              />
              <span className="text-[7px] text-slate-500 font-mono mt-0.5">Color map</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400">High</span>
          </div>

          {/* iOS-style toggle */}
          <button
            onClick={() => {
              playHMIClickSound();
              onChange(!enabled);
            }}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
 enabled ? "bg-sky-500" : "bg-slate-700"
 }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
 enabled ? "translate-x-5" : "translate-x-0"
 }`}
            />
          </button>
        </div>

        {/* Apex AI Floating Pill Button */}
        <button
          onClick={() => {
            playHMIClickSound();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111c2e]/90 hover:bg-[#1a2b45] backdrop-blur-2xl border border-sky-400/40 text-slate-200 text-xs font-bold shadow-[0_10px_30px_rgba(0,0,0,0.6)] cursor-pointer transition-all"
        >
          <Bot size={15} className="text-sky-400" />
          <span>Apex AI</span>
          <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
            1
          </span>
        </button>
      </div>
    </div>
  );
};
