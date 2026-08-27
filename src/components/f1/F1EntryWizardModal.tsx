import React, { memo } from "react";
import { useF1AssemblyStore } from "../../sim/f1/state/f1AssemblyStore";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import {
  ShieldAlert, Wrench, Flag, CheckCircle2, ArrowRight, X, AlertTriangle, Sparkles
} from "lucide-react";

interface F1EntryWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterConstructionStudio: () => void;
  onEnterGarageAndRace: () => void;
}

export const F1EntryWizardModal: React.FC<F1EntryWizardModalProps> = memo(function F1EntryWizardModal({
  isOpen,
  onClose,
  onEnterConstructionStudio,
  onEnterGarageAndRace,
}) {
  const { metrics, isHomologated, homologationPassportId } = useF1AssemblyStore();

  if (!isOpen) return null;

  const hasEligibleCar = metrics.isCompleteAndLegal && isHomologated;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0d0f14] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            playHMIClickSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Flag className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
              FIA World Championship Entry
            </span>
            <h2 className="text-xl font-black text-white uppercase tracking-wide">
              Formula 1 Constructor Entry
            </h2>
          </div>
        </div>

        {/* Status Card */}
        {hasEligibleCar ? (
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Eligible Homologated Car Detected
              </h3>
            </div>
            <p className="text-xs text-zinc-300 mb-3">
              Your custom works vehicle is 100% complete, passes all FIA Technical Regulations, and holds active passport <strong className="text-emerald-400">{homologationPassportId}</strong>.
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-zinc-500 block text-[9px]">TOTAL MASS</span>
                <span className="font-bold text-white">{metrics.totalMassKg} kg</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-zinc-500 block text-[9px]">TOTAL POWER</span>
                <span className="font-bold text-cyan-300">{metrics.totalPeakHorsepower} HP</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-zinc-500 block text-[9px]">DOWNFORCE</span>
                <span className="font-bold text-emerald-300">{metrics.totalDownforceAt250KmhKg} kg</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/40 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                NO ELIGIBLE F1 CAR DETECTED
              </h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Formula 1 participation does not provide prebuilt generic vehicles. A complete F1 car must be designed, assembled, and validated against FIA Technical Regulations from scratch in the Construction Studio.
            </p>
            {metrics.missingMandatorySockets.length > 0 && (
              <div className="mt-3 p-2.5 rounded-lg bg-black/50 border border-rose-500/30 text-[11px] text-rose-300">
                <strong>Missing Sockets:</strong> {metrics.missingMandatorySockets.map((s) => s.replace("SOCKET_", "")).join(", ")}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              playHMIClickSound();
              onEnterConstructionStudio();
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            {hasEligibleCar ? "Modify / Re-Engineer Car" : "Build F1 Car From Scratch"}
          </button>

          {hasEligibleCar && (
            <button
              onClick={() => {
                playHMIClickSound();
                onEnterGarageAndRace();
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:brightness-110 transition-all cursor-pointer"
            >
              <span>Enter Race Setup & Qualifying</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
