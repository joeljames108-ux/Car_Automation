import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Zap,
  Sliders,
  Wind,
  Trophy,
  Layers,
  Paintbrush,
  Sofa,
  Bot,
  Factory,
  Cog,
  Volume2,
  ShieldCheck,
  Activity,
  Car,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import type { Stage } from "../../StageSwitcher";

export interface NeonHorizonCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStage: (stage: Stage) => void;
}

export function NeonHorizonCommandPalette({
  isOpen,
  onClose,
  onSelectStage,
}: NeonHorizonCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const items = [
    { id: "command", label: "Command Center (Overview & Presets)", icon: <Car size={16} />, category: "Studios" },
    { id: "engine", label: "Modular Powertrain & Holographic Block", icon: <Zap size={16} />, category: "Studios" },
    { id: "vehicle", label: "Vehicle Studio (Chassis, Exterior & CFD Aero)", icon: <Layers size={16} />, category: "Studios" },
    { id: "track_battle", label: "Circuit Lap Simulator & Telemetry", icon: <Trophy size={16} />, category: "Studios" },
    { id: "interior", label: "Holographic Cockpit & HMI Themes", icon: <Sofa size={16} />, category: "Studios" },
    { id: "ai", label: "Apex AI Multi-Agent Swarm", icon: <Bot size={16} />, category: "Studios" },
    { id: "manufacturing", label: "Robotic Assembly Floor & Finances", icon: <Factory size={16} />, category: "Studios" },
    { id: "transmission3d", label: "Transmission & Gearbox Staircase", icon: <Cog size={16} />, category: "Studios" },
    { id: "f1_constructor", label: "FIA F1 & Hypercar Constructor", icon: <ShieldCheck size={16} />, category: "Studios" },
    { id: "nvh", label: "NVH Acoustics & FFT Spectrogram", icon: <Volume2 size={16} />, category: "Studios" },
    { id: "safety", label: "Structural Crash Dynamics & NCAP", icon: <Activity size={16} />, category: "Studios" },
    { id: "dyno_ecu", label: "ECU 3D Calibration & Anti-Lag", icon: <Sliders size={16} />, category: "Studios" },
    { id: "competitors", label: "Hypercar Benchmark Radar", icon: <Trophy size={16} />, category: "Studios" },
    { id: "higgsfield", label: "Higgsfield AI Creative Suite (Image · Video · Audio)", icon: <Sparkles size={16} />, category: "Studios" },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.id.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        playHMITabSound();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        playHMITabSound();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        playHMIClickSound();
        onSelectStage(filteredItems[selectedIndex].id as Stage);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, onClose, onSelectStage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-md animate-nh-materialize">
      <div className="w-full max-w-2xl bg-[#0a111e]/95 border border-white/12 rounded-2xl overflow-hidden flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.65)]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-black/30">
          <Search size={18} className="text-sky-300/90" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a studio name, system, or command (e.g. Aero, Dyno, Crash)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm nh-font-headline text-amber-50 placeholder:text-amber-300/50 focus:outline-none"
          />
          <span className="text-[10px] nh-font-mono text-amber-300/50 px-2 py-0.5 rounded bg-white/5 border border-white/10">
            ESC
          </span>
          <button
            onClick={onClose}
            className="text-amber-200/60 hover:text-amber-50 transition-colors p-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-1 nh-scroll">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs nh-font-mono text-amber-200/60">
              No matching studio or command found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    playHMIClickSound();
                    onSelectStage(item.id as Stage);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
 isSelected
 ? "bg-white/[0.08] text-white border border-white/15"
 : "text-amber-100/80 hover:bg-white/5 border border-transparent"
 }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isSelected ? "text-sky-300" : "text-amber-200/60"}>
                      {item.icon}
                    </span>
                    <span className="text-xs font-bold nh-font-headline">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <NeonHorizonBadge variant={isSelected ? "cyan" : "neutral"} size="xs">
                      {item.category}
                    </NeonHorizonBadge>
                    <ArrowRight size={12} className={isSelected ? "text-sky-400" : "text-transparent"} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hotkey Guide */}
        <div className="px-5 py-2.5 bg-black/30 border-t border-white/8 flex items-center justify-between text-[11px] nh-font-mono text-amber-200/60">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-sky-300/90 font-bold">Apex AI Quick Engine</span>
        </div>
      </div>
    </div>
  );
}
