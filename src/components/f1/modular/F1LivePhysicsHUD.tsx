// ============================================================================
// F1 MODULAR VEHICLE ASSEMBLY — LIVE ENGINEERING & HOMOLOGATION HUD
// ============================================================================

import React, { memo } from "react";
import { useF1AssemblyStore } from "../../../sim/f1/state/f1AssemblyStore";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import {
  ShieldCheck, AlertTriangle, Scale, Zap, Wind, DollarSign,
  Flag, Award, ArrowRight, CheckCircle2, ChevronRight
} from "lucide-react";

interface F1LivePhysicsHUDProps {
  onProceedToSetup?: () => void;
}

export const F1LivePhysicsHUD: React.FC<F1LivePhysicsHUDProps> = memo(function F1LivePhysicsHUD({ onProceedToSetup }) {
  const { metrics, isHomologated, homologateVehicle, homologationPassportId } = useF1AssemblyStore();

  const handleHomologateClick = () => {
    playHMIClickSound();
    const passportId = `FIA-PASSPORT-${Date.now().toString().slice(-6)}`;
    homologateVehicle(passportId);
  };

  return (
    <div className="w-full bg-slate-900/80/95 backdrop-blur-md border-t border-white/10 px-6 py-3 flex items-center justify-between z-20 select-none">
      {/* Physical & Aerodynamic Metrics Rail */}
      <div className="flex items-center gap-6">
        {/* Assembly Completion */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={metrics.completionPercentage === 100 ? "text-amber-400" : "text-amber-400"}
                strokeDasharray={`${metrics.completionPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-black text-white font-mono">
              {metrics.completionPercentage}%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              CAR COMPLETION
            </span>
            <span className="text-xs font-black text-white">
              {metrics.installedCount} / {metrics.totalMandatoryCount} Sockets Installed
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10" />

        {/* Mass */}
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" />
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              TOTAL VEHICLE MASS
            </span>
            <span className="text-xs font-mono font-black text-white">
              {metrics.totalMassKg} kg{" "}
              <span className="text-[10px] text-zinc-400">
                (Min: 798 kg {metrics.totalMassKg >= 798 ? "✓ Legal" : "✗ Underweight"})
              </span>
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10" />

        {/* Power */}
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              POWER OUTPUT
            </span>
            <span className="text-xs font-mono font-black text-amber-300">
              {metrics.totalPeakHorsepower} HP (ICE: {metrics.totalPeakHorsepower - metrics.ersHorsepower} + ERS: {metrics.ersHorsepower})
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-white/10" />

        {/* Aero */}
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-emerald-400" />
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              DOWNFORCE / DRAG @ 250 KM/H
            </span>
            <span className="text-xs font-mono font-black text-emerald-300">
              {metrics.totalDownforceAt250KmhKg} kg / {metrics.totalDragAt250KmhKg} kg ({metrics.frontAeroBalancePercent}% Front)
            </span>
          </div>
        </div>
      </div>

      {/* Scrutineering Approval & Proceed CTA */}
      <div className="flex items-center gap-3">
        {metrics.isCompleteAndLegal ? (
          isHomologated ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              FIA Passport Approved ({homologationPassportId})
            </div>
          ) : (
            <button
              onClick={handleHomologateClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4" />
              Homologate Car
            </button>
          )
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Missing: {metrics.missingMandatorySockets.map((s) => s.replace("SOCKET_", "")).join(", ")}
            </span>
          </div>
        )}

        <button
          onClick={() => {
            playHMIClickSound();
            onProceedToSetup?.();
          }}
          disabled={!metrics.isCompleteAndLegal}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-xl ${
            metrics.isCompleteAndLegal
              ? "bg-amber-500 hover:bg-amber-400 text-black shadow-cyan-500/30 font-black cursor-pointer"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          <span>Garage Setup & Race</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});
