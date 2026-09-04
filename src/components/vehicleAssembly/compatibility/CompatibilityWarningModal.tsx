/**
 * ============================================================================
 * COMPATIBILITY WARNING MODAL (PHASE 10)
 * ============================================================================
 * Engineering constraint conflict modal displaying:
 * - Specific incompatible subsystem reason
 * - "ADAPT CHASSIS" 1-click automatic adaptation fix
 * - "CHOOSE COMPATIBLE PLATFORM" redirect
 */

import React from "react";
import {
  AlertTriangle,
  X,
  Wrench,
  Repeat,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { CompatibilityIssue } from "../../../sim/modularVehicle/vehicleCompatibilityEngine";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

interface CompatibilityWarningModalProps {
  isOpen: boolean;
  issues: CompatibilityIssue[];
  onClose: () => void;
  onAdaptChassis: () => void;
  onChooseCompatiblePlatform: () => void;
}

export const CompatibilityWarningModal: React.FC<CompatibilityWarningModalProps> = ({
  isOpen,
  issues,
  onClose,
  onAdaptChassis,
  onChooseCompatiblePlatform,
}) => {
  if (!isOpen || issues.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl p-6 sm:p-7 rounded-3xl bg-slate-950 border border-amber-500/50 shadow-2xl shadow-amber-500/10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <AlertTriangle size={22} className="text-amber-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black font-mono tracking-tight text-white uppercase">
                  COMPATIBILITY WARNING
                </h3>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 uppercase">
                  {issues.length} CONFLICT{issues.length > 1 ? "S" : ""}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Physical packaging and architectural rule violations detected.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playHMIClickSound();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* List of Conflicts */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {issues.map((issue, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${
                issue.severity === "critical"
                  ? "bg-red-950/20 border-red-500/40 text-red-200"
                  : "bg-amber-950/20 border-amber-500/40 text-amber-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold font-mono text-white uppercase flex items-center gap-1.5">
                  <ShieldAlert size={14} className={issue.severity === "critical" ? "text-red-400" : "text-amber-400"} />
                  {issue.title}
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 uppercase">
                  {issue.component}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                {issue.message}
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              playHMIClickSound();
              onChooseCompatiblePlatform();
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Repeat size={14} />
            <span>CHOOSE COMPATIBLE PLATFORM</span>
          </button>

          <button
            onClick={() => {
              playHMIClickSound();
              onAdaptChassis();
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Wrench size={14} />
            <span>ADAPT CHASSIS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
