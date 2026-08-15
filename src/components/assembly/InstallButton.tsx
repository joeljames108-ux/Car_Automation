// ===================================================================
// APEX ENGINE BUILDER — INSTALL BUTTON COMPONENT (PHASE 17)
// Multi-State Robotic Assembly Trigger with Live Animation Telemetry
// ===================================================================

import React from "react";
import {
  Wrench,
  CheckCircle2,
  Lock,
  Sparkles,
  SkipForward,
  Check,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { AssemblyPhase, ComponentId } from "../../sim/assemblyTypes";

interface InstallButtonProps {
  componentId: ComponentId | string;
  componentName: string;
  isInstalled: boolean;
  isInstalling: boolean;
  canInstall: boolean;
  phase: AssemblyPhase;
  onInstall: () => void;
  onSkipAnimation?: () => void;
  onNext?: () => void;
  className?: string;
}

const PHASE_LABELS: Record<AssemblyPhase, string> = {
  idle: "Ready to Install",
  picking: "Robotic Gantry Picking...",
  traveling: "Positioning into Fixture...",
  aligning: "Laser Alignment Matrix...",
  inserting: "Pressing into Bore...",
  locking: "Torque Fasteners to Spec...",
  confirming: "QC Inspection & Sound Check...",
  complete: "Installation Complete!",
};

export function InstallButton({
  componentId,
  componentName,
  isInstalled,
  isInstalling,
  canInstall,
  phase,
  onInstall,
  onSkipAnimation,
  onNext,
  className = "",
}: InstallButtonProps) {
  // STATE 1: CURRENTLY INSTALLING
  if (isInstalling) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex-1 py-3 px-5 rounded-2xl bg-cyan-950/80 border border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.4)] flex items-center justify-between text-cyan-300 font-mono text-xs font-bold">
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} className="animate-spin text-cyan-400" />
            <div>
              <span className="block text-slate-100">{componentName}</span>
              <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider">
                {PHASE_LABELS[phase] || phase}
              </span>
            </div>
          </div>

          {/* Micro Progress Pulse */}
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>
        </div>

        {/* Skip Animation Action */}
        {onSkipAnimation && (
          <button
            type="button"
            onClick={onSkipAnimation}
            className="py-3 px-4 rounded-2xl bg-base-900/90 hover:bg-base-800 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Skip Animation"
          >
            <SkipForward size={14} />
            <span>Skip</span>
          </button>
        )}
      </div>
    );
  }

  // STATE 2: ALREADY INSTALLED
  if (isInstalled) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <div className="flex-1 py-3 px-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{componentName} Installed & Torqued</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold">
            MOUNTED ✓
          </span>
        </div>

        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="py-3 px-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-extrabold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
          >
            <span>Next Stage</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    );
  }

  // STATE 3: LOCKED / CANNOT INSTALL
  if (!canInstall) {
    return (
      <div className={`w-full ${className}`}>
        <button
          type="button"
          disabled
          className="w-full py-3.5 px-6 rounded-2xl bg-base-950/60 border border-slate-800 text-slate-500 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
        >
          <Lock size={15} />
          <span>Install Locked (Preceding Components Required)</span>
        </button>
      </div>
    );
  }

  // STATE 4: READY TO INSTALL
  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        onClick={onInstall}
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 hover:from-cyan-400 hover:to-blue-400 text-black font-mono font-extrabold text-xs md:text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:shadow-[0_0_35px_rgba(34,211,238,0.7)] flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
      >
        <Wrench size={16} className="group-hover:rotate-45 transition-transform" />
        <span>Install {componentName}</span>
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
