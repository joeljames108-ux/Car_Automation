import React, { memo, useEffect, useState } from "react";
import { useHypercarAssemblyStore } from "../../sim/hypercar/state/hypercarAssemblyStore";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import {
  ShieldAlert,
  ShieldCheck,
  Wrench,
  ChevronRight,
  X,
  Trophy,
  Weight,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
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
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop with animated grain */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />

      {/* Outer glow ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: hasEligibleCar ? "radial-gradient(circle, #10b981 0%, transparent 70%)" : "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
        />
      </div>

      {/* Main Modal Card */}
      <div
        className={`relative max-w-lg w-full transition-all duration-500 ${showContent ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}`}
      >
        {/* Animated border glow */}
        <div
          className="absolute -inset-px rounded-[28px] opacity-60 blur-sm"
          style={{ background: hasEligibleCar ? "linear-gradient(135deg, #10b981, #f59e0b, #10b981)" : "linear-gradient(135deg, #f59e0b, #f97316, #f59e0b)" }}
        />

        {/* Card body */}
        <div className="relative rounded-[28px] overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-slate-900/80" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          />

          <div className="relative p-7 space-y-6">
            {/* Close Button */}
            <button
              onClick={() => { playHMIClickSound(); onClose(); }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ─── Hero Header ─── */}
            <div className="flex items-start gap-4">
              {/* Animated Shield Icon */}
              <div className="relative">
                <div
                  className={`absolute inset-0 rounded-2xl blur-xl opacity-40 ${hasEligibleCar ? "bg-emerald-500" : "bg-amber-500"}`}
                />
                <div
                  className={`relative p-4 rounded-2xl border ${
                    hasEligibleCar
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-amber-500/10 border-amber-500/30"
                  }`}
                >
                  {hasEligibleCar ? (
                    <ShieldCheck className="w-9 h-9 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-9 h-9 text-amber-400" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${hasEligibleCar ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-[0.2em]">
                    FIA WEC Scrutineering Gateway
                  </span>
                </div>
                <h2 className="text-xl font-black uppercase text-white leading-tight">
                  {hasEligibleCar ? (
                    <>
                      <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                        Hypercar Homologation
                      </span>
                      <br />
                      Verified
                    </>
                  ) : (
                    "No Eligible Hypercar"
                  )}
                </h2>
              </div>
            </div>

            {/* ─── Status Card ─── */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
              <div className="p-4">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {hasEligibleCar ? (
                    <>
                      Your prototype <span className="text-amber-400 font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/10">{homologationPassportId}</span> has passed all mandatory FIA World Endurance Championship technical checks and is eligible to enter.
                    </>
                  ) : (
                    <>
                      FIA WEC Sporting Regulations require an assembled, enclosed carbon-monocoque prototype with hybrid e-AWD powertrain, meeting minimum mass (<span className="text-amber-400 font-bold">1,030 kg</span>) and aerodynamic efficiency parameters.
                    </>
                  )}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 border-t border-white/[0.06]">
                <StatCard
                  icon={<Weight className="w-3.5 h-3.5" />}
                  label="Homologation Mass"
                  value={`${metrics.totalMassKg} kg`}
                  target="(≥1030 kg)"
                  passed={metrics.totalMassKg >= 1030}
                />
                <StatCard
                  icon={<Layers className="w-3.5 h-3.5" />}
                  label="Mandatory Sockets"
                  value={`${metrics.completionPercentage}%`}
                  target="(22/22)"
                  passed={metrics.missingMandatorySockets.length === 0}
                />
              </div>
            </div>

            {/* ─── Action Buttons ─── */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { playHMIClickSound(); onClose(); onEnterStudio(); }}
                className="flex-1 group relative py-3.5 px-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white font-bold text-[11px] uppercase tracking-[0.15em] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 group-hover:via-amber-500/10 transition-all" />
                <span className="relative flex items-center justify-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  {hasEligibleCar ? "Open Hypercar CAD Studio" : "Build Hypercar from Scratch"}
                </span>
              </button>

              {hasEligibleCar && (
                <button
                  onClick={() => { playHMIClickSound(); onClose(); onProceedToRace(); }}
                  className="flex-1 group relative py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:brightness-110 transition-all cursor-pointer overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 group-hover:via-white/20 transition-all" />
                  <span className="relative flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Enter WEC Championship
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ── Reusable Stat Card Sub-Component ──
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  target: string;
  passed: boolean;
}> = ({ icon, label, value, target, passed }) => (
  <div className="p-4 border-r border-white/[0.06] last:border-r-0">
    <div className="flex items-center gap-1.5 mb-2">
      <span className={passed ? "text-emerald-400" : "text-zinc-500"}>{icon}</span>
      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className="flex items-baseline gap-1.5">
      <span className={`text-lg font-black font-mono ${passed ? "text-emerald-400" : "text-rose-400"}`}>
        {value}
      </span>
      <span className="text-[10px] text-zinc-500 font-mono">{target}</span>
    </div>
    {/* Progress indicator bar */}
    <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${passed ? "bg-emerald-500" : "bg-rose-500"}`}
        style={{ width: passed ? "100%" : "40%" }}
      />
    </div>
  </div>
);
