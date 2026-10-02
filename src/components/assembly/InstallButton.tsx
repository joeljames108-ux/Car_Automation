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
        <div className="flex-1 py-3 px-5 rounded-2xl bg-amber-50/95 border-2 border-amber-400 shadow-md flex items-center justify-between text-amber-950 font-mono text-xs font-bold">
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} className="animate-spin text-amber-600" />
            <div>
              <span className="block text-slate-900 font-extrabold">{componentName}</span>
              <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wider">
                {PHASE_LABELS[phase] || phase}
              </span>
            </div>
          </div>

          {/* Micro Progress Pulse */}
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </div>
        </div>

        {/* Skip Animation Action */}
        {onSkipAnimation && (
          <button
            type="button"
            onClick={onSkipAnimation}
            className="py-3 px-4 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 border border-[#dfd6c8] text-xs font-mono font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
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
        <div className="flex-1 py-3 px-5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-400 text-emerald-950 font-mono text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="font-extrabold">{componentName} Installed & Torqued</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold">
            MOUNTED ✓
          </span>
        </div>

        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
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
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 border border-slate-300 text-slate-500 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
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
        className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
      >
        <Wrench size={16} className="group-hover:rotate-45 transition-transform" />
        <span>Install {componentName}</span>
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
