import React, { useState } from "react";
import { Bot, Sparkles, X } from "lucide-react";
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
      {/* AI Suggestion Bubble */}
      {showTooltip && (
        <div className="relative px-3.5 py-2 rounded-xl bg-[#0b1220]/95 backdrop-blur-xl border border-white/12 text-xs shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center gap-2 max-w-xs animate-nh-materialize">
          <Sparkles size={14} className="text-sky-300/90 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] nh-label-caps text-slate-400">Apex AI Suggestion</span>
            <span className="text-xs font-semibold text-slate-200">{recommendation}</span>
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

      {/* Floating Action Pill */}
      <button
        onClick={handleClick}
        className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#0d1526]/95 backdrop-blur-2xl border border-white/12 hover:border-sky-400/40 text-white shadow-[0_10px_30px_rgba(0,0,0,0.55)] transition-all duration-300 hover:scale-[1.03] active:scale-95 group cursor-pointer"
      >
        <div className="relative flex items-center justify-center">
          <Bot size={18} className="text-sky-300" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-400/90 border border-[#0b1220]" />
        </div>
        <span className="text-xs font-bold nh-font-headline tracking-wider text-slate-100">
          Apex AI
        </span>
        <span className="px-1.5 py-0.2 rounded-full bg-rose-400/80 text-[10px] nh-font-mono font-bold text-white">
          1
        </span>
      </button>
    </div>
  );
};
