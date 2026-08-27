import React, { memo } from "react";
import { useHypercarAssemblyStore } from "../../sim/hypercar/state/hypercarAssemblyStore";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import {
  ShieldAlert,
  ShieldCheck,
  Wrench,
  ChevronRight,
  AlertTriangle,
  Flame,
  Zap,
  Weight,
  Layers,
  X,
} from "lucide-react";

interface HypercarEntryWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterStudio: () => void;
  onProceedToRace: () => void;
}

export const HypercarEntryWizardModal: React.FC<HypercarEntryWizardModalProps> = memo(function HypercarEntryWizardModal({
  isOpen,
  onClose,
  onEnterStudio,
  onProceedToRace,
}) {
  if (!isOpen) return null;

  const { metrics, isHomologated, homologationPassportId } = useHypercarAssemblyStore();
  const hasEligibleCar = metrics.isCompleteAndLegal && isHomologated;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 select-none animate-in fade-in duration-200">
      <div className="max-w-xl w-full bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl shadow-amber-500/10 space-y-5 text-white relative">
        {/* Close Button */}
        <button
          onClick={() => {
            playHMIClickSound();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl border ${hasEligibleCar ? "bg-emerald-500/10 border-emerald-500/40" : "bg-amber-500/10 border-amber-500/40"}`}>
            {hasEligibleCar ? <ShieldCheck className="w-8 h-8 text-emerald-400" /> : <ShieldAlert className="w-8 h-8 text-amber-400" />}
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
              FIA WEC SCRUTINEERING GATEWAY
            </span>
            <h2 className="text-lg font-black uppercase text-white">
              {hasEligibleCar ? "Hypercar Homologation Verified" : "No Eligible Hypercar Detected"}
            </h2>
          </div>
        </div>

        {/* Regulation Requirements Notice */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-xs space-y-2">
          <p className="text-zinc-300 leading-relaxed">
            {hasEligibleCar ? (
              <>
                Your prototype <span className="text-amber-400 font-mono font-bold">{homologationPassportId}</span> has passed all mandatory FIA World Endurance Championship technical checks and is eligible to enter.
              </>
            ) : (
              <>
                FIA WEC Sporting Regulations require an assembled, enclosed carbon-monocoque prototype with hybrid e-AWD powertrain, meeting minimum mass (1,030 kg) and aerodynamic efficiency parameters.
              </>
            )}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
            <div className="p-2 rounded-lg bg-black/50 border border-white/5 flex items-center justify-between">
              <span className="text-zinc-500">HOMOLOGATION MASS</span>
              <span className={metrics.totalMassKg >= 1030 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {metrics.totalMassKg} kg (≥1030 kg)
              </span>
            </div>
            <div className="p-2 rounded-lg bg-black/50 border border-white/5 flex items-center justify-between">
              <span className="text-zinc-500">MANDATORY SOCKETS</span>
              <span className={metrics.missingMandatorySockets.length === 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                {metrics.completionPercentage}% (22/22)
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              playHMIClickSound();
              onClose();
              onEnterStudio();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 border border-white/20 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            {hasEligibleCar ? "Open Hypercar CAD Studio" : "Build Hypercar from Scratch"}
          </button>

          {hasEligibleCar && (
            <button
              onClick={() => {
                playHMIClickSound();
                onClose();
                onProceedToRace();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Enter WEC Championship
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
