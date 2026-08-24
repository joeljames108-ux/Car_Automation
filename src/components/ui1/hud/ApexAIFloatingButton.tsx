import React, { useState } from "react";
import { Bot, Sparkles, X, ArrowRight } from "lucide-react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export interface ApexAIFloatingButtonProps {
  onOpenStudio?: () => void;
  recommendation?: string;
  className?: string;
}

export const ApexAIFloatingButton: React.FC<ApexAIFloatingButtonProps> = ({
  onOpenStudio,
  recommendation = "Optimize stroke for peak torque",
  className = "",
}) => {
  const [showTooltip, setShowTooltip] = useState(true);

  const handleClick = () => {
    playHMIClickSound();
    if (onOpenStudio) onOpenStudio();
  };

  return (
    <div className={`fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 ${className}`}>
      {/* AI Suggestion Bubble (from reference image 1) */}
      {showTooltip && (
        <div className="relative px-3.5 py-2 rounded-xl bg-[#09152e]/95 backdrop-blur-xl border border-cyan-400/40 text-xs shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(0,229,255,0.3)] flex items-center gap-2 max-w-xs animate-nh-materialize">
          <Sparkles size={14} className="text-cyan-300 shrink-0 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[9px] nh-label-caps text-slate-400">Apex AI Suggestion</span>
            <span className="text-xs font-semibold text-cyan-100">{recommendation}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Main Glowing Floating Action Pill */}
      <button
        onClick={handleClick}
        className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500/30 via-sky-500/25 to-purple-600/30 backdrop-blur-2xl border border-cyan-400/50 hover:border-cyan-300 text-white shadow-[0_0_25px_rgba(0,229,255,0.4),0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
      >
        <div className="relative flex items-center justify-center">
          <Bot size={18} className="text-cyan-300 drop-shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 border border-[#040814] animate-ping" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 border border-[#040814]" />
        </div>
        <span className="text-xs font-bold nh-font-headline tracking-wider text-cyan-100">
          Apex AI
        </span>
        <span className="px-1.5 py-0.2 rounded-full bg-rose-500/80 text-[10px] nh-font-mono font-bold text-white">
          1
        </span>
      </button>
    </div>
  );
};
