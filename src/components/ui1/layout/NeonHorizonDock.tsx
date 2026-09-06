import React, { useState, useCallback } from "react";
import {
  LayoutDashboard, Cog, Car, Wind, Sparkles, Activity, Trophy, Bot, Flag,
  Warehouse, Send, Volume2, VolumeX, Eye, Camera, RefreshCw, Wand2, Zap
} from "lucide-react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { useDesign } from "../../../state/DesignContext";
import type { Stage } from "../../StageSwitcher";

export interface NeonHorizonDockProps {
  activeStage: Stage;
  onSelectStage: (stage: Stage) => void;
  sceneMode?: "track" | "wind_tunnel" | "lab" | "rd" | "showroom";
  onSelectSceneMode?: (mode: "track" | "wind_tunnel" | "lab" | "rd" | "showroom") => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  cfdEnabled?: boolean;
  onToggleCfd?: () => void;
}

export const NeonHorizonDock: React.FC<NeonHorizonDockProps> = ({
  activeStage,
  onSelectStage,
  sceneMode = "track",
  onSelectSceneMode,
  soundEnabled = true,
  onToggleSound,
  cfdEnabled = true,
  onToggleCfd,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [promptInput, setPromptInput] = useState("");
  const [promptFeedback, setPromptFeedback] = useState<string | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);

  const { design, updateEngine, updateAero, updateVehicle } = useDesign();

  const dockItems: { id: Stage; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "command", label: "Command Center", icon: <LayoutDashboard size={18} /> },
    { id: "engine", label: "Engine Studio", icon: <Cog size={18} /> },
    { id: "vehicle", label: "Vehicle Studio", icon: <Car size={18} /> },
    { id: "studio", label: "Grand Studio Hub", icon: <Sparkles size={18} /> },
    { id: "simulation", label: "Sim Lab", icon: <Activity size={18} /> },
    { id: "ai", label: "Apex AI", icon: <Bot size={18} />, badge: "AI" },
    { id: "higgsfield", label: "Higgsfield AI", icon: <Zap size={18} />, badge: "HF" },
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

  // Natural Language Vehicle Tuning Engine
  const handleExecutePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    playHMIClickSound();
    setPromptLoading(true);
    const query = promptInput.toLowerCase();

    setTimeout(() => {
      setPromptLoading(false);
      if (query.includes("downforce") || query.includes("wing")) {
        updateAero({ wingAngle: 18, splitterAngle: 10 });
        setPromptFeedback("Tuned: Rear Wing Angle optimized for maximum cornering downforce (+28%).");
      } else if (query.includes("boost") || query.includes("turbo") || query.includes("power")) {
        updateEngine({ turboSize: 0.85, boostPressure: 2.2 });
        setPromptFeedback("Tuned: Turbo spool & boost elevated to 2.2 bar (+65 HP).");
      } else if (query.includes("weight") || query.includes("light") || query.includes("carbon")) {
        updateVehicle({ chassis: "carbon_monocoque" as any });
        setPromptFeedback("Tuned: Carbon composite chassis applied (-120 kg).");
      } else if (query.includes("suspension") || query.includes("stiff") || query.includes("track")) {
        updateAero({ rideHeight: 85 });
        setPromptFeedback("Tuned: Track suspension ride height dropped to 85mm for zero body roll.");
      } else if (
        query.includes("render") ||
        query.includes("higgsfield") ||
        query.includes("photo") ||
        query.includes("video") ||
        query.includes("cinema") ||
        query.includes("3d mesh") ||
        query.includes("cinematic") ||
        query.includes("mesh")
      ) {
        onSelectStage("higgsfield");
        setPromptFeedback("Routing to Higgsfield AI Creative Suite with active car telemetry…");
      } else {
        setPromptFeedback(`AI Co-Pilot analyzed: "${promptInput}". Subsystems balanced.`);
      }

      setPromptInput("");
      setTimeout(() => setPromptFeedback(null), 4000);
    }, 450);
  };

  const getMagnification = useCallback(
    (idx: number) => {
      if (hoveredIdx === null) return 1;
      const distance = Math.abs(idx - hoveredIdx);
      if (distance === 0) return 1.18;
      if (distance === 1) return 1.08;
      return 1;
    },
    [hoveredIdx]
  );

  return (
    <nav
      role="navigation"
      aria-label="Quanta Studio Interactive Dock"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 select-none pointer-events-auto max-w-[96vw]"
    >
      {/* Dynamic Feedback Notification Bubble */}
      {promptFeedback && (
        <div className="px-4 py-1.5 rounded-full bg-[#08121f]/95 border border-[#00F5D4]/40 text-xs font-mono font-bold text-[#00F5D4] shadow-[0_0_20px_rgba(0,245,212,0.35)] animate-bounce flex items-center gap-2">
          <Wand2 size={13} />
          <span>{promptFeedback}</span>
        </div>
      )}

      {/* Natural Language Prompt Tuning Bar */}
      <form
        onSubmit={handleExecutePrompt}
        className="w-full max-w-xl flex items-center gap-2 px-3 py-1.5 rounded-2xl border"
        style={{
          background: "rgba(10, 15, 26, 0.85)",
          backdropFilter: "blur(30px) saturate(200%)",
          borderColor: "rgba(255, 255, 255, 0.10)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Sparkles size={14} className="text-[#00F5D4] shrink-0" />
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Ask AI: 'Increase downforce for high speed cornering' or 'Add carbon chassis'..."
          className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 font-mono outline-none"
        />
        <button
          type="submit"
          disabled={promptLoading}
          className="p-1.5 rounded-xl bg-[#00F5D4]/20 hover:bg-[#00F5D4]/30 text-[#00F5D4] border border-[#00F5D4]/40 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          title="Send AI Command"
        >
          {promptLoading ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
        </button>
      </form>

      {/* Main Quanta Studio Glass Dock */}
      <div
        className="flex items-center gap-1.5 p-2 rounded-3xl border"
        style={{
          background: "rgba(8, 12, 22, 0.88)",
          backdropFilter: "blur(40px) saturate(220%)",
          WebkitBackdropFilter: "blur(40px) saturate(220%)",
          borderColor: "rgba(255, 255, 255, 0.12)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Stage Icons */}
        <div className="flex items-center gap-1">
          {dockItems.map((item, idx) => {
            const isActive = activeStage === item.id;
            const mag = getMagnification(idx);

            return (
              <div key={item.id} className="relative flex flex-col items-center">
                <button
                  onClick={() => {
                    playHMIClickSound();
                    onSelectStage(item.id);
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  title={item.label}
                  style={{ transform: `scale(${mag})` }}
                  className={`relative p-2.5 rounded-2xl flex items-center justify-center transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/50 shadow-[0_0_15px_rgba(0,245,212,0.35)]"
                      : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  {item.icon}

                  {item.badge && (
                    <span className="absolute -top-1 -right-1 px-1 rounded-full bg-[#FFB703] text-zinc-950 text-[8px] font-black">
                      {item.badge}
                    </span>
                  )}
                </button>

                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] mt-1 shadow-[0_0_6px_#00F5D4]" />
                )}
              </div>
            );
          })}
        </div>

        <div className="w-[1px] h-7 bg-white/10 mx-1" />

        {/* Scene Mode Switcher */}
        <div className="flex items-center gap-1">
          {sceneModes.map((sm) => {
            const isCurrent = sceneMode === sm.id;
            return (
              <button
                key={sm.id}
                onClick={() => {
                  playHMIClickSound();
                  if (onSelectSceneMode) onSelectSceneMode(sm.id);
                }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#FFB703]/20 text-[#FFB703] border border-[#FFB703]/50 shadow-[0_0_10px_rgba(255,183,3,0.3)]"
                    : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
                }`}
              >
                {sm.label}
              </button>
            );
          })}
        </div>

        <div className="w-[1px] h-7 bg-white/10 mx-1" />

        {/* Quick Utility Toggles (CFD & Sound) */}
        <div className="flex items-center gap-1">
          {onToggleCfd && (
            <button
              onClick={() => {
                playHMIClickSound();
                onToggleCfd();
              }}
              title={cfdEnabled ? "Disable CFD Streamlines" : "Enable CFD Streamlines"}
              className={`p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                cfdEnabled
                  ? "bg-[#00F5D4]/20 text-[#00F5D4] border-[#00F5D4]/40"
                  : "bg-white/5 text-zinc-500 border-white/5"
              }`}
            >
              <Wind size={15} />
            </button>
          )}

          {onToggleSound && (
            <button
              onClick={() => {
                playHMIClickSound();
                onToggleSound();
              }}
              title={soundEnabled ? "Mute Audio Synthesizer" : "Unmute Audio Synthesizer"}
              className={`p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                soundEnabled
                  ? "bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/40"
                  : "bg-white/5 text-zinc-500 border-white/5"
              }`}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
