/**
 * ============================================================================
 * ASSEMBLY TIMELINE & UNDO/REDO CONTROLLER
 * ============================================================================
 * Visual build history timeline with scrubber, undo, redo, and stage rewind.
 */

import React from "react";
import {
  RotateCcw,
  RotateCw,
  Rewind,
  FastForward,
  Trash2,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { AssemblyStageId } from "../scene/ModularAssemblySceneGraph";

interface AssemblyTimelineBarProps {
  stages: { id: AssemblyStageId; label: string; icon: any }[];
  activeStage: AssemblyStageId;
  installedStages: Set<AssemblyStageId>;
  onSelectStage: (stage: AssemblyStageId) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetVehicle: () => void;
}

export const AssemblyTimelineBar: React.FC<AssemblyTimelineBarProps> = ({
  stages,
  activeStage,
  installedStages,
  onSelectStage,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetVehicle,
}) => {
  const currentStageIndex = stages.findIndex((s) => s.id === activeStage);

  return (
    <div className="panel p-2.5 rounded-2xl flex items-center justify-between gap-3 border border-base-800 text-xs font-mono shadow-xl flex-wrap select-none">
      {/* Left: Undo / Redo & Rewind Controls */}
      <div className="flex items-center gap-1.5 border-r border-base-800/80 pr-3 shrink-0">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo Action (Ctrl+Z)"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
            canUndo
              ? "bg-base-900 border-base-700 text-amber-50 hover:border-amber-500 hover:text-amber-400"
              : "opacity-40 cursor-not-allowed bg-base-950 border-base-900 text-amber-400"
          }`}
        >
          <RotateCcw size={12} />
          <span>UNDO</span>
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo Action (Ctrl+Y)"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
            canRedo
              ? "bg-base-900 border-base-700 text-amber-50 hover:border-amber-500 hover:text-amber-400"
              : "opacity-40 cursor-not-allowed bg-base-950 border-base-900 text-amber-400"
          }`}
        >
          <RotateCw size={12} />
          <span>REDO</span>
        </button>
      </div>

      {/* Center: Stage Timeline Checkpoint Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-[300px]">
        {stages.map((s, idx) => {
          const isInstalled = installedStages.has(s.id);
          const isActive = activeStage === s.id;
          const Icon = s.icon;

          return (
            <button
              key={s.id}
              onClick={() => onSelectStage(s.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer text-[10px] ${
                isActive
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm ring-1 ring-amber-500/40"
                  : isInstalled
                  ? "bg-base-900/60 border-base-800 text-amber-100/80 hover:border-base-700"
                  : "bg-base-950/40 border-base-900 text-amber-400 hover:text-amber-200/60"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isInstalled ? "bg-emerald-400" : "bg-slate-600"}`} />
              <span>{idx + 1}. {s.label.replace(/^\d+\.\s*/, "")}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Reset Vehicle */}
      <div className="flex items-center gap-1.5 pl-3 border-l border-base-800/80 shrink-0">
        <button
          onClick={() => {
            if (confirm("Reset vehicle to bare chassis? This will clear installed subassemblies.")) {
              onResetVehicle();
            }
          }}
          title="Reset entire vehicle build"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-[10px] font-bold transition-all cursor-pointer"
        >
          <Trash2 size={11} />
          <span>RESET BUILD</span>
        </button>
      </div>
    </div>
  );
};
