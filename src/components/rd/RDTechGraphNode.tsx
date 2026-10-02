// ===================================================================
// R&D TECH GRAPH NODE — HIGH-FIDELITY CAD NODE CARD (Photo 2 Spec)
// Interactive automotive technology card with engineering silhouettes
// ===================================================================
import React from "react";
import { Lock, Check } from "lucide-react";
import { RDTechNode } from "../../sim/rdTreeTypes";
import { RDEngineeringSilhouette } from "./RDEngineeringSilhouettes";

interface RDTechGraphNodeProps {
  node: RDTechNode;
  x: number;
  y: number;
  width: number;
  height: number;
  isUnlocked: boolean;
  isResearching: boolean;
  isReady: boolean;
  isJustUnlocked?: boolean;
  onClick: () => void;
}

export const RDTechGraphNode: React.FC<RDTechGraphNodeProps> = ({
  node,
  x,
  y,
  width,
  height,
  isUnlocked,
  isResearching,
  isReady,
  isJustUnlocked = false,
  onClick,
}) => {
  // Determine card appearance classes based on state
  let borderClass = "border-slate-700/70 hover:border-slate-500 bg-[#131b26]/95";
  let glowClass = "shadow-lg hover:shadow-xl";

  if (isJustUnlocked || (isUnlocked && node.id === "eng_arch_baseline")) {
    borderClass = "border-cyan-400/90 bg-[#101c2b] shadow-[0_0_24px_rgba(56,189,248,0.3)]";
    glowClass = "shadow-[0_0_25px_rgba(56,189,248,0.25)]";
  } else if (isUnlocked) {
    borderClass = "border-emerald-500/70 hover:border-emerald-400 bg-[#111f26]/95";
    glowClass = "shadow-[0_0_15px_rgba(16,185,129,0.15)]";
  } else if (isResearching) {
    borderClass = "border-amber-400 bg-[#1e1c18]/95 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.25)]";
  } else if (isReady) {
    borderClass = "border-slate-600 hover:border-amber-400 bg-[#161f2c]/95";
  }

  // Format era label e.g. "1970s+"
  const yearBadge = `${node.yearAvailable}${node.yearAvailable % 10 === 0 ? "s" : ""}+`;

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
      className={`group z-20 rounded-xl border ${borderClass} ${glowClass} p-2.5 flex flex-col justify-between transition-all duration-300 cursor-pointer select-none active:scale-[0.99] backdrop-blur-md`}
      title={`${node.name} — Click to inspect and allocate R&D`}
    >
      {/* ─────────────────────────────────────────────────────────────
          TOP ROW: Era Badge & Status Pill
      ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700/80 text-slate-300">
          {yearBadge}
        </span>

        <div>
          {isJustUnlocked || (isUnlocked && node.id === "eng_arch_baseline") ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black text-cyan-300 tracking-wider">
              <span>JUST UNLOCKED</span>
              <Check size={11} className="stroke-[3]" />
            </span>
          ) : isUnlocked ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black text-emerald-400 tracking-wider">
              <span>UNLOCKED</span>
              <Check size={11} className="stroke-[3]" />
            </span>
          ) : isResearching ? (
            <span className="text-[9px] font-mono font-black text-amber-400 tracking-wider animate-pulse">
              RESEARCHING...
            </span>
          ) : isReady ? (
            <span className="text-[9px] font-mono font-black text-amber-400 tracking-wider">
              READY
            </span>
          ) : (
            <Lock size={12} className="text-slate-500" />
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CENTER ROW: Title, Description & Engineering Silhouette
      ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 flex-1 my-auto">
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-[11px] font-black text-white group-hover:text-cyan-300 font-mono tracking-wide leading-tight truncate">
            {node.name}
          </h4>
          <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight mt-0.5 font-sans">
            {node.description}
          </p>
        </div>

        {/* Silhouette Art with optional Sonar Target Rings */}
        <div className="relative shrink-0 flex items-center justify-center w-11 h-9">
          {/* Concentric Sonar Pulse Rings for Just Unlocked / Active Node */}
          {(isJustUnlocked || (isUnlocked && node.id === "eng_arch_baseline")) && (
            <>
              <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-60 pointer-events-none" />
              <div className="absolute -inset-1.5 rounded-full border border-cyan-400/30 animate-[spin_8s_linear_infinite] pointer-events-none" />
            </>
          )}

          <RDEngineeringSilhouette
            type={node.id}
            size={36}
            className={
              isJustUnlocked || (isUnlocked && node.id === "eng_arch_baseline")
                ? "text-cyan-400"
                : isUnlocked
                ? "text-emerald-400"
                : isResearching
                ? "text-amber-400"
                : "text-slate-600 group-hover:text-slate-400 transition-colors"
            }
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM ROW: Cost & Duration • Unlocks Badge / Locked Tag
      ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[9px] font-mono">
        <span className="text-slate-400 font-semibold">
          ${(node.cost / 1_000_000).toFixed(1)}M • {node.months}mo
        </span>

        {isUnlocked || isJustUnlocked ? (
          <span className="text-cyan-400 font-bold tracking-wider">
            +{node.unlocks.length || 1} UNLOCKS
          </span>
        ) : (
          <span className="flex items-center gap-1 text-slate-500 font-bold uppercase tracking-wider">
            <Lock size={9} />
            <span>LOCKED</span>
          </span>
        )}
      </div>
    </div>
  );
};
