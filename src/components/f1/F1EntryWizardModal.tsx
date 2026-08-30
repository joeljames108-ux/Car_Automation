import React, { memo, useEffect, useState } from "react";
import { useF1AssemblyStore } from "../../sim/f1/state/f1AssemblyStore";
import { playHMIClickSound } from "../../utils/hmiSoundSynth";
import {
  ShieldAlert, ShieldCheck, Wrench, Flag, CheckCircle2, ArrowRight, X, AlertTriangle, Weight, Gauge, Wind, Trophy, Layers,
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
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />

      {/* Outer glow ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full opacity-15 blur-3xl"
          style={{ background: hasEligibleCar ? "radial-gradient(circle, #10b981 0%, transparent 70%)" : "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
        />
      </div>

      {/* Main Modal Card */}
      <div
        className={`relative max-w-lg w-full transition-all duration-500 ${showContent ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}`}
      >
        {/* Animated border glow */}
        <div
          className="absolute -inset-px rounded-[28px] opacity-50 blur-sm"
          style={{ background: hasEligibleCar ? "linear-gradient(135deg, #10b981, #f59e0b, #10b981)" : "linear-gradient(135deg, #f59e0b, #d97706, #f59e0b)" }}
        />

        {/* Card body */}
        <div className="relative rounded-[28px] overflow-hidden">
          <div className="absolute inset-0 bg-amber-950/60" />
          {/* Carbon fiber pattern */}
          <div
            className="absolute inset-0 opacity-[0.02]"
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
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl blur-xl opacity-40 bg-amber-500" />
                <div className="relative p-4 rounded-2xl border bg-amber-500/10 border-amber-500/30">
                  <Flag className="w-9 h-9 text-amber-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-[0.2em]">
                    FIA World Championship Entry
                  </span>
                </div>
                <h2 className="text-xl font-black uppercase text-white leading-tight">
                  <span className="bg-gradient-to-r from-amber-400 to-amber-400 bg-clip-text text-transparent">
                    Formula 1
                  </span>
                  <br />
                  Constructor Entry
                </h2>
              </div>
            </div>

            {/* ─── Status Card ─── */}
            {hasEligibleCar ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                <div className="p-4 flex items-center gap-2 border-b border-white/[0.06]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Eligible Homologated Car Detected
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-zinc-300 mb-3">
                    Your custom works vehicle is 100% complete, passes all FIA Technical Regulations, and holds active passport <span className="text-amber-400 font-mono font-bold px-1.5 py-0.5 rounded bg-amber-40/10">{homologationPassportId}</span>.
                  </p>
                </div>
                <div className="grid grid-cols-3 border-t border-white/[0.06]">
                  <StatCard icon={<Weight className="w-3.5 h-3.5" />} label="Total Mass" value={`${metrics.totalMassKg} kg`} passed={true} />
                  <StatCard icon={<Gauge className="w-3.5 h-3.5" />} label="Total Power" value={`${metrics.totalPeakHorsepower} HP`} passed={true} />
                  <StatCard icon={<Wind className="w-3.5 h-3.5" />} label="Downforce" value={`${metrics.totalDownforceAt250KmhKg} kg`} passed={true} />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                <div className="p-4 flex items-center gap-2 border-b border-white/[0.06]">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    No Eligible F1 Car Detected
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Formula 1 participation does not provide prebuilt generic vehicles. A complete F1 car must be designed, assembled, and validated against FIA Technical Regulations from scratch in the Construction Studio.
                  </p>
                </div>
                {metrics.missingMandatorySockets.length > 0 && (
                  <div className="mx-4 mb-4 p-3 rounded-xl bg-black/50 border border-rose-500/20 text-[11px] text-rose-300 font-mono">
                    <strong className="text-rose-400">Missing:</strong> {metrics.missingMandatorySockets.map((s) => s.replace("SOCKET_", "")).join(", ")}
                  </div>
                )}
              </div>
            )}

            {/* ─── Action Buttons ─── */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { playHMIClickSound(); onEnterConstructionStudio(); }}
                className="flex-1 group relative py-3.5 px-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white font-bold text-[11px] uppercase tracking-[0.15em] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-cyan-500/5 to-amber-500/0 group-hover:via-cyan-500/10 transition-all" />
                <span className="relative flex items-center justify-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  {hasEligibleCar ? "Modify / Re-Engineer Car" : "Build F1 Car From Scratch"}
                </span>
              </button>

              {hasEligibleCar && (
                <button
                  onClick={() => { playHMIClickSound(); onEnterGarageAndRace(); }}
                  className="flex-1 group relative py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 transition-all cursor-pointer overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 group-hover:via-white/20 transition-all" />
                  <span className="relative flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Enter Race Setup & Qualifying
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

// ── Reusable Stat Card ──
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; passed: boolean }> = ({ icon, label, value, passed }) => (
  <div className="p-3 border-r border-white/[0.06] last:border-r-0">
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-amber-400">{icon}</span>
      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider">{label}</span>
    </div>
    <span className="text-base font-black font-mono text-white">{value}</span>
  </div>
);
