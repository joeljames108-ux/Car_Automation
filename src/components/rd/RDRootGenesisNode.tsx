// ===================================================================
// R&D ROOT GENESIS NODE — FOUNDATIONAL PROGRAM ANCHOR (Photo 2 Spec)
// ===================================================================
import React from "react";
import { Cog } from "lucide-react";

interface RDRootGenesisNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  onClick?: () => void;
}

export const RDRootGenesisNode: React.FC<RDRootGenesisNodeProps> = ({
  x,
  y,
  width,
  height,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
      }}
      className="group z-20 flex items-center justify-between px-3.5 py-2 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border-2 border-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all duration-300 cursor-pointer select-none active:scale-[0.99]"
      title="Foundational R&D Genesis Program"
    >
      {/* Ambient Inner Glow */}
      <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 pointer-events-none" />

      {/* Left: Gear Icon Badge */}
      <div className="relative z-10 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-slate-950/90 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-md group-hover:scale-105 transition-transform">
          <Cog size={18} className="animate-[spin_10s_linear_infinite]" />
        </div>
        <div>
          <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider leading-none">
            Foundational R&D Program
          </div>
          <div className="text-xs font-mono font-black text-white tracking-widest uppercase mt-0.5">
            Genesis
          </div>
        </div>
      </div>

      {/* Right: Unlocked Status Pill with Glowing Ring */}
      <div className="relative z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50">
        <span className="text-[9px] font-mono font-bold text-emerald-300 tracking-wider">
          UNLOCKED
        </span>
        <span className="w-2.5 h-2.5 rounded-full border border-emerald-400 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </span>
      </div>
    </div>
  );
};
