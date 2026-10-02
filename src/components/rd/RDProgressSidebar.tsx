// ===================================================================
// R&D PROGRESS SIDEBAR — LIVE RESEARCH TELEMETRY (Photo 2 Spec)
// Real-time tracking of unlocked technologies and active research projects
// ===================================================================
import React from "react";
import { Check, FlaskConical, Sparkles } from "lucide-react";
import { RDTechNode } from "../../sim/rdTreeTypes";
import { useRDTreeStore } from "../../state/rdTreeStore";

interface RDProgressSidebarProps {
  nodes: RDTechNode[];
  unlockedSet: Set<string>;
  onInspectNode?: (nodeId: string) => void;
}

export const RDProgressSidebar: React.FC<RDProgressSidebarProps> = ({
  nodes,
  unlockedSet,
  onInspectNode,
}) => {
  const { activeProject } = useRDTreeStore();

  const totalCount = nodes.length;
  const completedNodes = nodes.filter((n) => unlockedSet.has(n.id));
  const completedCount = completedNodes.length;

  // Active project node details if researching within this set
  const activeNode = activeProject ? nodes.find((n) => n.id === activeProject.nodeId) : null;
  const activeProgressPct = activeProject
    ? Math.min(100, Math.round((activeProject.progressMonths / Math.max(1, activeProject.totalMonths)) * 100))
    : 0;

  return (
    <aside className="w-64 sm:w-72 shrink-0 rounded-2xl bg-[#0f1722]/90 border border-slate-800/80 backdrop-blur-xl p-4 flex flex-col justify-between shadow-2xl select-none min-h-[580px]">
      {/* ─────────────────────────────────────────────────────────────
          TOP SECTION: Progress Header & Completed Techs List
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Header Title */}
        <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
          <div className="text-xs font-mono font-black text-slate-200 tracking-wider uppercase">
            R&D PROGRESS:
          </div>
          <div className="text-xs font-mono font-black text-emerald-400">
            {completedCount}/{totalCount} Unlocked
          </div>
        </div>

        {/* COMPLETED TECHS Section */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span>COMPLETED TECHS:</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {completedNodes.length === 0 ? (
              <div className="text-[11px] font-mono text-slate-500 italic py-1">
                No technologies unlocked yet.
              </div>
            ) : (
              completedNodes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onInspectNode?.(n.id)}
                  className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-emerald-950 hover:border-emerald-800/60 transition-all cursor-pointer group"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={9} className="text-emerald-400 stroke-[3]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono font-bold text-slate-200 group-hover:text-emerald-300 transition-colors leading-tight">
                      {n.name}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">
                      {n.unlocks[0]?.label || "Base Architecture"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* IN-PROGRESS TECHS Section */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span>IN-PROGRESS TECHS:</span>
          </div>

          {activeProject ? (
            <div
              onClick={() => onInspectNode?.(activeProject.nodeId)}
              className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer shadow-md space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-cyan-300 leading-tight">
                  {activeNode?.name || activeProject.nodeId || "Individually Throttled V12 (ITB)"}
                </span>
                <span className="text-emerald-400 font-bold shrink-0 ml-2">
                  {activeProgressPct}%
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(5, activeProgressPct)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span>{activeProject.progressMonths.toFixed(1)} / {activeProject.totalMonths} months</span>
                <span className="text-amber-400 font-bold animate-pulse flex items-center gap-1">
                  <FlaskConical size={10} />
                  <span>Researching</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[10px] font-mono text-slate-500 text-center leading-relaxed">
              No active research. Select any ready node on the canvas to begin development.
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM SECTION: Diamond Star Accent (Photo 2 Bottom-Right)
      ───────────────────────────────────────────────────────────── */}
      <div className="pt-4 border-t border-slate-800/80 flex items-end justify-between">
        <div className="text-[9px] font-mono text-slate-500 tracking-wider uppercase pb-1">
          R&D ECOSYSTEM
        </div>
        <div className="text-slate-700/70 hover:text-cyan-400/80 transition-colors pointer-events-none">
          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
          </svg>
        </div>
      </div>
    </aside>
  );
};
