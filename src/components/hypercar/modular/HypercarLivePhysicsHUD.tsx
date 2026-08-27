import React, { useState, memo } from "react";
import { useHypercarAssemblyStore } from "../../../sim/hypercar/state/hypercarAssemblyStore";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import {
  ShieldCheck,
  AlertCircle,
  Zap,
  Wind,
  Flame,
  Weight,
  FileCheck2,
  ChevronRight,
  Gauge,
  ThermometerSnowflake,
  ShieldAlert,
} from "lucide-react";

interface HypercarLivePhysicsHUDProps {
  onProceedToGarage?: () => void;
}

export const HypercarLivePhysicsHUD: React.FC<HypercarLivePhysicsHUDProps> = memo(function HypercarLivePhysicsHUD({ onProceedToGarage }) {
  const { metrics, isHomologated, homologationPassportId, homologateVehicle } = useHypercarAssemblyStore();
  const [showPassportModal, setShowPassportModal] = useState(false);

  const handleHomologate = () => {
    playHMIClickSound();
    const passportCode = `FIA-WEC-APX-LMH-${Math.floor(1000 + Math.random() * 9000)}`;
    homologateVehicle(passportCode);
    setShowPassportModal(true);
  };

  return (
    <>
      <div className="w-full h-20 bg-zinc-950/95 border-t border-white/10 px-6 flex items-center justify-between text-white backdrop-blur-2xl select-none">
        {/* Left: Completion & Mass */}
        <div className="flex items-center gap-6">
          {/* Completion Ring */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90">
                <circle cx="24" cy="24" r="18" className="stroke-zinc-800" strokeWidth="4" fill="transparent" />
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  className="stroke-amber-400 transition-all duration-500"
                  strokeWidth="4"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * metrics.completionPercentage) / 100}
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[11px] font-black font-mono text-amber-400">
                {metrics.completionPercentage}%
              </span>
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                LMH ASSEMBLY STATUS
              </div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                {metrics.isCompleteAndLegal ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% WEC Legal
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Missing {metrics.missingMandatorySockets.length} Sockets
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10" />

          {/* Mass & CG */}
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                <Weight className="w-3 h-3 text-zinc-400" /> TOTAL MASS
              </div>
              <div className="text-sm font-black font-mono text-white">
                {metrics.totalMassKg} <span className="text-[10px] text-zinc-400">kg</span>
                <span className="text-[9px] text-emerald-400 ml-1.5 font-sans font-bold">(≥1030 kg min)</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400">WEIGHT BAL</div>
              <div className="text-sm font-black font-mono text-amber-400">
                {metrics.frontWeightDistributionPercent}% <span className="text-[9px] text-zinc-400 font-sans">Front</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Powertrain, Aerodynamics & Cooling */}
        <div className="flex items-center gap-6">
          {/* Hybrid Powertrain */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10">
            <Flame className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[9px] font-mono text-zinc-400">COMBINED HYBRID</div>
              <div className="text-xs font-black font-mono text-white">
                {metrics.totalPeakHorsepower} <span className="text-[9px] text-amber-400">HP</span>
                <span className="text-[9px] text-zinc-400 ml-1">({metrics.frontMguKw} kW MGU + {metrics.iceHorsepower} HP ICE)</span>
              </div>
            </div>
          </div>

          {/* Aerodynamics */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10">
            <Wind className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[9px] font-mono text-zinc-400">AERODYNAMICS @ 250 KM/H</div>
              <div className="text-xs font-black font-mono text-cyan-300">
                {metrics.totalDownforceAt250KmhKg} <span className="text-[9px] text-zinc-400">kg DF</span> • {metrics.liftToDragRatio} <span className="text-[9px] text-zinc-400">L/D</span>
              </div>
            </div>
          </div>

          {/* Endurance Cooling & Reliability */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10">
            <ThermometerSnowflake className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-[9px] font-mono text-zinc-400">ENDURANCE THERMAL</div>
              <div className="text-xs font-black font-mono text-purple-300">
                {metrics.totalCoolingCapacityKw} <span className="text-[9px] text-zinc-400">kW</span> • {metrics.enduranceReliabilityScore}% <span className="text-[9px] text-emerald-400">Rel</span>
              </div>
            </div>
          </div>
        </div>

          {/* Right: Homologation & Garage CTA */}
        <div className="flex items-center gap-3">
          {metrics.isCompleteAndLegal && !isHomologated ? (
            <button
              onClick={handleHomologate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              Sign Homologation
            </button>
          ) : isHomologated ? (
            <button
              onClick={() => {
                playHMIClickSound();
                setShowPassportModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold transition-all hover:bg-emerald-500/30 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              {homologationPassportId}
            </button>
          ) : (
            <button
              disabled
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-500 font-bold text-xs uppercase tracking-wider cursor-not-allowed"
            >
              <ShieldAlert className="w-4 h-4" />
              Scrutineering Pending
            </button>
          )}

          {/* Proceed to Garage */}
          <button
            onClick={() => {
              playHMIClickSound();
              onProceedToGarage?.();
            }}
            disabled={!metrics.isCompleteAndLegal}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all ${
              metrics.isCompleteAndLegal
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 shadow-amber-500/20 cursor-pointer"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            Garage Setup & Race
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Homologation Passport Modal */}
      {showPassportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-amber-500/50 rounded-2xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">FIA WEC Homologation Passport</h3>
                  <p className="text-[10px] text-zinc-400">Le Mans Hypercar Technical Passport</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                APPROVED
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono bg-black/50 p-4 rounded-xl border border-white/10">
              <div className="flex justify-between">
                <span className="text-zinc-500">PASSPORT ID:</span>
                <span className="text-amber-400 font-bold">{homologationPassportId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">CLASS:</span>
                <span className="text-white">Le Mans Hypercar (LMH)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">HOMOLOGATED MASS:</span>
                <span className="text-white">{metrics.totalMassKg} kg (FIA Min: 1030 kg)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">POWERTRAIN:</span>
                <span className="text-white">Twin-Turbo ICE + 200kW Front MGU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">AERO EFFICIENCY:</span>
                <span className="text-white">{metrics.liftToDragRatio} L/D (Legal Window: 4.0 - 4.8)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">RELIABILITY INDEX:</span>
                <span className="text-emerald-400 font-bold">{metrics.enduranceReliabilityScore} / 100</span>
              </div>
            </div>

            <button
              onClick={() => {
                playHMIClickSound();
                setShowPassportModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition-all cursor-pointer"
            >
              Close Passport
            </button>
          </div>
        </div>
      )}
    </>
  );
});
