/**
 * ============================================================================
 * ASSEMBLY VERSION SNAPSHOT & DESIGN FREEZE MANAGER
 * ============================================================================
 * Enables saving named engineering revisions, design freezing, and A/B comparison.
 */

import React, { useState } from "react";
import {
  GitBranch,
  Lock,
  Unlock,
  Plus,
  ArrowRight,
  ShieldCheck,
  Award,
  Trash2,
  GitCompare,
} from "lucide-react";
import { VersionSnapshot } from "../../../state/useAssemblyHistoryStore";

interface AssemblyVersionManagerProps {
  versions: VersionSnapshot[];
  currentMassKg: number;
  currentHealthScore: number;
  isCurrentFrozen: boolean;
  onSaveVersion: (name: string, healthScore: number, massKg: number, freeze?: boolean) => void;
  onLoadVersion: (versionId: string) => void;
  onToggleFreeze: () => void;
}

export const AssemblyVersionManager: React.FC<AssemblyVersionManagerProps> = ({
  versions,
  currentMassKg,
  currentHealthScore,
  isCurrentFrozen,
  onSaveVersion,
  onLoadVersion,
  onToggleFreeze,
}) => {
  const [newVersionName, setNewVersionName] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newVersionName.trim()) return;
    onSaveVersion(newVersionName.trim(), currentHealthScore, currentMassKg, false);
    setNewVersionName("");
    setIsAdding(false);
  };

  const comparedVersion = versions.find((v) => v.id === compareVersionId);

  return (
    <div className="panel p-3.5 rounded-2xl space-y-3 border border-base-800 text-xs font-mono shadow-xl select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-base-800/60 pb-2">
        <div className="flex items-center gap-2">
          <GitBranch size={15} className="text-amber-400" />
          <span className="font-bold text-slate-800 dark:text-amber-50 uppercase tracking-wider text-[11px]">
            ENGINEERING REVISIONS & DESIGN FREEZE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFreeze}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
              isCurrentFrozen
                ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm"
                : "bg-base-900 border-base-700 text-amber-200/60 hover:text-amber-50"
            }`}
          >
            {isCurrentFrozen ? <Lock size={12} /> : <Unlock size={12} />}
            <span>{isCurrentFrozen ? "DESIGN FROZEN (LOCKED)" : "FREEZE DESIGN"}</span>
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 text-[10px] font-bold transition-all cursor-pointer"
          >
            <Plus size={12} />
            <span>SAVE REVISION</span>
          </button>
        </div>
      </div>

      {/* Revision Name Input Form */}
      {isAdding && (
        <div className="p-2.5 rounded-xl bg-base-900/80 border border-amber-500/40 flex items-center gap-2">
          <input
            type="text"
            placeholder="Revision Name (e.g. GT3 V1.1 Track Spec)..."
            value={newVersionName}
            onChange={(e) => setNewVersionName(e.target.value)}
            className="flex-1 bg-base-950 border border-base-700 rounded-lg px-2.5 py-1 text-xs text-amber-50 font-mono focus:outline-none focus:border-amber-400"
            autoFocus
          />
          <button
            onClick={handleCreate}
            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] cursor-pointer"
          >
            SAVE
          </button>
          <button
            onClick={() => setIsAdding(false)}
            className="px-2 py-1 rounded-lg bg-base-800 text-amber-200/60 text-[10px] cursor-pointer"
          >
            CANCEL
          </button>
        </div>
      )}

      {/* Version Snapshots List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {versions.map((ver) => (
          <div
            key={ver.id}
            className="p-2.5 rounded-xl bg-base-900/40 border border-base-800/80 flex items-center justify-between gap-2 hover:border-base-700 transition-all"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {ver.frozen && <Lock size={11} className="text-amber-400 shrink-0" />}
                <span className="font-bold text-amber-50 truncate text-[11px]">{ver.name}</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-amber-300/50 mt-0.5">
                <span>{ver.totalMassKg} kg</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{ver.healthScore}/100 Quality</span>
                <span>•</span>
                <span>{new Date(ver.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setCompareVersionId(compareVersionId === ver.id ? null : ver.id)}
                title="A/B Compare against current"
                className={`p-1.5 rounded-lg border text-[9px] font-bold cursor-pointer transition-all ${
                  compareVersionId === ver.id
                    ? "bg-amber-500/20 border-amber-500 text-amber-300"
                    : "bg-base-850 border-base-700 text-amber-200/60 hover:text-amber-50"
                }`}
              >
                <GitCompare size={12} />
              </button>
              <button
                onClick={() => onLoadVersion(ver.id)}
                className="px-2 py-1 rounded-lg bg-base-800 hover:bg-base-700 text-amber-100/80 text-[10px] font-bold border border-base-700 cursor-pointer"
              >
                RESTORE
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Drawer */}
      {comparedVersion && (
        <div className="p-3 rounded-xl bg-base-900/90 border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[10px] text-amber-400 uppercase">
              A/B COMPARISON: CURRENT BUILD vs {comparedVersion.name.toUpperCase()}
            </span>
            <button
              onClick={() => setCompareVersionId(null)}
              className="text-[10px] text-amber-200/60 hover:text-amber-50 cursor-pointer"
            >
              ✕ CLOSE
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="p-2 rounded-lg bg-base-950 border border-base-800">
              <span className="text-amber-300/50 block text-[9px]">MASS DELTA</span>
              <strong className={currentMassKg < comparedVersion.totalMassKg ? "text-emerald-400" : "text-amber-400"}>
                {currentMassKg} kg vs {comparedVersion.totalMassKg} kg (
                {currentMassKg - comparedVersion.totalMassKg > 0 ? "+" : ""}
                {currentMassKg - comparedVersion.totalMassKg} kg)
              </strong>
            </div>
            <div className="p-2 rounded-lg bg-base-950 border border-base-800">
              <span className="text-amber-300/50 block text-[9px]">QUALITY SCORE</span>
              <strong className={currentHealthScore >= comparedVersion.healthScore ? "text-emerald-400" : "text-amber-400"}>
                {currentHealthScore}/100 vs {comparedVersion.healthScore}/100
              </strong>
            </div>
            <div className="p-2 rounded-lg bg-base-950 border border-base-800">
              <span className="text-amber-300/50 block text-[9px]">ENGINE MOUNT</span>
              <strong className="text-amber-50">
                {comparedVersion.state.enginePosition.toUpperCase()}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
