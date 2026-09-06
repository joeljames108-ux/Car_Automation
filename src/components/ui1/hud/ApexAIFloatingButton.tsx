import React, { useState } from "react";
import { Bot, Sparkles, X, Zap } from "lucide-react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export interface ApexAIFloatingButtonProps {
  onOpenStudio?: () => void;
  onOpenHiggsfield?: () => void;
  recommendation?: string;
  className?: string;
}

export const ApexAIFloatingButton: React.FC<ApexAIFloatingButtonProps> = ({
  onOpenStudio,
  onOpenHiggsfield,
  recommendation = "Optimize stroke for peak torque",
  className = "",
}) => {
  const [showTooltip, setShowTooltip] = useState(true);

  const handleClickAI = () => {
    playHMIClickSound();
    if (onOpenStudio) onOpenStudio();
  };

  const handleClickHF = () => {
    playHMIClickSound();
    if (onOpenHiggsfield) onOpenHiggsfield();
  };

  return (
    <div className={`fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 ${className}`}>
      {/* AI Suggestion Bubble */}
      {showTooltip && (
        <div className="relative px-3.5 py-2.5 rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-white/12 text-xs shadow-[0_12px_35px_rgba(0,0,0,0.7)] flex items-center gap-2.5 max-w-xs animate-nh-materialize">
          <div className="w-6 h-6 rounded-lg bg-[#00F5D4]/15 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4] shrink-0">
            <Sparkles size={13} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] nh-label-caps text-[#00F5D4] font-mono font-bold">Apex AI Co-Pilot</span>
            <span className="text-xs font-semibold text-zinc-100">{recommendation}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="p-1 text-zinc-400 hover:text-white rounded-md transition-colors active:scale-90"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Floating Action Dual Pill */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-950/90 backdrop-blur-2xl border border-white/15 shadow-[0_12px_35px_rgba(0,0,0,0.6)]">
        {/* Higgsfield AI Creative Studio Launch */}
        <button
          onClick={handleClickHF}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500/15 via-[#00F5D4]/15 to-cyan-500/15 hover:from-fuchsia-500/25 hover:to-cyan-500/25 border border-[#00F5D4]/30 hover:border-[#00F5D4]/60 text-white shadow-[0_0_15px_rgba(0,245,212,0.15)] transition-all duration-200 active:scale-95 cursor-pointer group"
          title="Launch Higgsfield AI Creative Suite"
        >
          <Zap size={14} className="text-[#00F5D4] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black tracking-wider text-white font-mono">
            HIGGSFIELD
          </span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#00F5D4]/25 text-[9px] font-mono font-black text-[#00F5D4]">
            HF
          </span>
        </button>

        {/* Apex AI Engineering Architect Launch */}
        <button
          onClick={handleClickAI}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/8 hover:border-white/20 text-zinc-300 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer group"
          title="Open Apex AI Engineer Studio"
        >
          <Bot size={14} className="text-[#FFB703] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-wider font-sans">
            Apex AI
          </span>
        </button>
      </div>
    </div>
  );
};
