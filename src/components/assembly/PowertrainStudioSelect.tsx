import React from "react";
import {
  ArrowLeft,
  Cog,
  Flame,
  Zap,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Cpu,
} from "lucide-react";
import { useGuidedEngineeringStore } from "../../state/guidedEngineeringStore";
import { useSimulationClockStore, formatSimDate } from "../../state/simulationClockStore";
import { useVehicleProjectStore } from "../../state/vehicleProjectStore";

export interface PowertrainStudioSelectProps {
  onSelectEngine: () => void;
  onSelectTransmission: () => void;
  onBackToCreatorMenu: () => void;
  className?: string;
}

export const PowertrainStudioSelect: React.FC<PowertrainStudioSelectProps> = ({
  onSelectEngine,
  onSelectTransmission,
  onBackToCreatorMenu,
  className = "",
}) => {
  const { engineStatus, transmissionStatus } = useGuidedEngineeringStore();
  const { year, month, day } = useSimulationClockStore();
  const activeProject = useVehicleProjectStore((s) => s.activeProject);

  const isEngineConfigured = engineStatus === "configured";
  const isTransmissionConfigured = transmissionStatus === "configured";
  const isBothConfigured = isEngineConfigured && isTransmissionConfigured;

  return (
    <div
      role="region"
      aria-label="Powertrain Studio Selection Gateway"
      className={`w-full h-full min-h-[calc(100vh-64px)] flex flex-col justify-between p-3.5 sm:p-5 md:p-6 lg:p-7 select-none bg-gradient-to-br from-[#faf8f3] via-[#f4efe4] to-[#ebe5d6] text-slate-900 font-sans overflow-hidden ${className}`}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION & WORKSPACE STATUS BAR
      ───────────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full py-2 px-3 sm:px-4.5 rounded-2xl bg-[#ffffff]/90 border border-[#dfd5c4] backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
        {/* Back to Creator Menu Button */}
        <button
          type="button"
          onClick={onBackToCreatorMenu}
          className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#faf7f0] border border-[#d2ccc0] hover:border-amber-400/80 text-slate-800 hover:text-slate-950 font-mono font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
          title="Return to Vehicle Creation Hub"
        >
          <ArrowLeft size={14} className="text-amber-700 group-hover:-translate-x-1 transition-transform" />
          <span className="tracking-wide">Back to Creator Menu</span>
        </button>

        {/* Center: Module Title */}
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-black tracking-wider text-slate-800 uppercase">
            Powertrain & Propulsion Division
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="hidden sm:inline text-[11px] font-bold text-slate-500 tracking-widest uppercase">
            Studio Selection Gateway
          </span>
        </div>

        {/* Right: Active Project & Date */}
        <div className="hidden md:flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded-md bg-[#f1ebe0] text-slate-700 font-semibold border border-[#dfd5c4]">
            {activeProject.name}
          </span>
          <span className="text-amber-800 font-bold">
            {formatSimDate(year, month, day)}
          </span>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO BANNER & SUBHEADER
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 my-2 text-center max-w-2xl mx-auto space-y-1 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-900 text-[10px] font-mono font-bold tracking-widest uppercase shadow-2xs">
          <Sparkles size={11} className="text-amber-600 animate-spin-slow" />
          <span>Propulsion Subsystems Gateway</span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-slate-900 tracking-tight">
          Select Your Engineering Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-mono leading-relaxed">
          Configure both engine architecture and 3D transmission transaxle.
          Both subsystems must be calibrated to complete the Powertrain Division.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. DYNAMIC STATUS & WORKFLOW PROGRESS BANNER
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto w-full shrink-0">
        {isBothConfigured ? (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-500/15 border-2 border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-mono font-black text-emerald-950 uppercase tracking-wide">
                  ✓ POWERTRAIN & DRIVETRAIN FULLY HOMOLOGATED (2/2 COMPLETE)
                </div>
                <div className="text-[11px] text-emerald-800 font-sans font-medium">
                  Both engine and transmission specifications are locked and synchronized with the chassis hardpoints.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onBackToCreatorMenu}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-black text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              Creator Menu →
            </button>
          </div>
        ) : isEngineConfigured ? (
          <div className="px-4 py-2.5 rounded-xl bg-amber-500/15 border-2 border-amber-500/60 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping shrink-0" />
              <div>
                <div className="text-xs font-mono font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-amber-700" />
                  <span>ENGINE CONFIGURED (1/2) • TRANSMISSION REQUIRED</span>
                </div>
                <div className="text-[11px] text-amber-900 font-sans font-medium">
                  Engine build is certified! Select Studio 02 below to configure your 3D transmission transaxle.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onSelectTransmission}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-mono font-black text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              Build Transmission →
            </button>
          </div>
        ) : (
          <div className="px-3 py-1.5 rounded-xl bg-white/80 border border-[#dfd5c4] flex items-center justify-center gap-2 text-center text-slate-700 font-mono text-[10px] sm:text-[11px] shadow-2xs">
            <span className="font-bold text-amber-800">STEP 1: Build Engine Architecture</span>
            <span className="text-slate-400">───►</span>
            <span className="font-bold text-slate-600">STEP 2: Configure 3D Transmission</span>
            <span className="text-slate-400">───►</span>
            <span className="text-emerald-700 font-black">Homologated Powertrain</span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. THE TWO HERO STUDIO CARDS (Side by Side)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 flex-1 items-stretch max-w-5xl mx-auto w-full my-auto min-h-0 py-2">
        {/* ── CARD 1: ENGINE STUDIO (Combustion & EV) ── */}
        <div
          role="button"
          tabIndex={0}
          onClick={onSelectEngine}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectEngine();
            }
          }}
          className={`group relative flex flex-col justify-between p-4 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-b from-[#ffffff]/98 via-[#faf7f0]/95 to-[#f4efe4]/95 border-2 shadow-sm transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 active:scale-[0.99] focus:outline-none ${
            isEngineConfigured
              ? "border-emerald-500/60 hover:border-emerald-600 shadow-[0_16px_40px_rgba(16,185,129,0.12)]"
              : "border-[#ded5c4] hover:border-amber-500 shadow-[0_16px_40px_rgba(217,119,6,0.12)]"
          }`}
        >
          {/* Top Ambient Lighting Stripe */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 ${
              isEngineConfigured
                ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"
                : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"
            }`}
          />

          <div>
            {/* Top Metadata Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-900 font-mono font-black text-[10px] tracking-wider uppercase">
                  Studio 01
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Powertrain
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border">
                {isEngineConfigured ? (
                  <span className="bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    <span>BUILT & CERTIFIED</span>
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-900 border-amber-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>READY TO BUILD</span>
                  </span>
                )}
              </div>
            </div>

            {/* Visual Hero Image Container with Robust Fallback */}
            <div className="relative w-full h-40 sm:h-48 md:h-52 rounded-xl overflow-hidden mb-3.5 border border-[#e2d8c6] shadow-inner group-hover:border-amber-400/80 transition-colors bg-gradient-to-br from-slate-900 via-stone-900 to-slate-950">
              <img
                src="/assets/divisions/engine.jpg"
                alt="Engine Studio — Internal Combustion and Electric Powertrain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent pointer-events-none" />

              {/* Overlay Badge */}
              <div className="absolute bottom-2.5 left-3 flex items-center gap-2.5 text-white z-10 pointer-events-none">
                <div className="p-2 rounded-xl bg-amber-500/90 text-slate-950 shadow-md">
                  <Flame size={18} />
                </div>
                <div>
                  <div className="text-xs font-black font-mono tracking-wider text-amber-100">
                    COMBUSTION & EV HYPERDRIVE
                  </div>
                  <div className="text-[10px] text-amber-200/90 font-mono">
                    ICE • Twin-Turbo • 800V SiC
                  </div>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black font-mono text-slate-900 group-hover:text-amber-800 transition-colors flex items-center gap-2">
                <span>Engine Architecture</span>
                <span className="text-xs font-semibold text-slate-500 font-sans">(Engine Studio)</span>
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-600 font-sans leading-relaxed">
                Opens the Engine Studio to select architecture and engineer cylinder blocks, pistons, valvetrain, turbochargers, dyno mapping, or 800V axial-flux electric drive units.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-[#eed8c8]/80 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                I4 • V6 • V8 • V12 • Boxer • Rotary
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                800V Electric Drive
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#ded5c4] text-slate-700 font-semibold shadow-2xs">
                15-Stage Robotic Assembly
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="mt-4 pt-3 border-t border-[#ded5c4]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectEngine();
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-white font-mono font-black text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:translate-x-0.5 active:scale-98 ${
                isEngineConfigured
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-600/25"
                  : "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-amber-500/25"
              }`}
            >
              <span>{isEngineConfigured ? "TUNE ENGINE ARCHITECTURE" : "ENTER ENGINE STUDIO (STAGE 1)"}</span>
              <ChevronRight size={16} className="text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-center mt-1.5 text-[10px] font-mono text-slate-500 font-medium">
              {isEngineConfigured
                ? "Engine is built. Click to re-tune displacement, dyno maps or acoustics."
                : "Directs to Engine Architecture Selector (ICE / EV)"}
            </div>
          </div>
        </div>

        {/* ── CARD 2: 3D TRANSMISSION STUDIO (Transaxles & Differentials) ── */}
        <div
          role="button"
          tabIndex={0}
          onClick={onSelectTransmission}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectTransmission();
            }
          }}
          className={`group relative flex flex-col justify-between p-4 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-b from-[#ffffff]/98 via-[#f8fafc]/95 to-[#f1f5f9]/95 border-2 shadow-sm transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 active:scale-[0.99] focus:outline-none ${
            isTransmissionConfigured
              ? "border-emerald-500/60 hover:border-emerald-600 shadow-[0_16px_40px_rgba(16,185,129,0.12)]"
              : isEngineConfigured
              ? "border-amber-500/80 hover:border-amber-600 shadow-[0_16px_40px_rgba(245,158,11,0.2)] animate-pulse"
              : "border-[#cbd5e1] hover:border-cyan-600 shadow-[0_16px_40px_rgba(8,145,178,0.12)]"
          }`}
        >
          {/* Top Ambient Lighting Stripe */}
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 ${
              isTransmissionConfigured
                ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"
                : isEngineConfigured
                ? "bg-gradient-to-r from-amber-500 via-cyan-500 to-blue-600"
                : "bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600"
            }`}
          />

          <div>
            {/* Top Metadata Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-cyan-600/15 border border-cyan-600/40 text-cyan-900 font-mono font-black text-[10px] tracking-wider uppercase">
                  Studio 02
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Drivetrain
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border">
                {isTransmissionConfigured ? (
                  <span className="bg-emerald-50 text-emerald-800 border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    <span>SYNCHRONIZED</span>
                  </span>
                ) : isEngineConfigured ? (
                  <span className="bg-amber-100 text-amber-950 border-amber-400 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                    <span>REQUIRED (NEXT STEP)</span>
                  </span>
                ) : (
                  <span className="bg-cyan-50 text-cyan-900 border-cyan-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 animate-pulse" />
                    <span>3D INTERACTIVE</span>
                  </span>
                )}
              </div>
            </div>

            {/* Visual Hero Image Container with Robust Fallback */}
            <div className="relative w-full h-40 sm:h-48 md:h-52 rounded-xl overflow-hidden mb-3.5 border border-[#cbd5e1] shadow-inner group-hover:border-cyan-500/80 transition-colors bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950">
              <img
                src="/assets/divisions/transmission.jpg"
                alt="3D Transmission Studio — Transaxle and Gearbox Simulation"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent pointer-events-none" />

              {/* Overlay Badge */}
              <div className="absolute bottom-2.5 left-3 flex items-center gap-2.5 text-white z-10 pointer-events-none">
                <div className="p-2 rounded-xl bg-cyan-600/90 text-white shadow-md">
                  <Cog size={18} className="animate-spin-slow" />
                </div>
                <div>
                  <div className="text-xs font-black font-mono tracking-wider text-cyan-100">
                    PRECISION TRANSAXLES & LSD
                  </div>
                  <div className="text-[10px] text-cyan-200/90 font-mono">
                    7-Speed DCT • Manual • GT3 Seq • e-Axle
                  </div>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-black font-mono text-slate-900 group-hover:text-cyan-800 transition-colors flex items-center gap-2">
                <span>3D Transmission Studio</span>
                <span className="text-xs font-semibold text-slate-500 font-sans">(Transaxles & LSD)</span>
              </h2>
              <p className="text-xs sm:text-[13px] text-slate-600 font-sans leading-relaxed">
                Opens the 3D Transmission Studio for interactive 60fps mechanical gearset physics, exploded view inspection, gear ratios, clutch metallurgy, and limited-slip differentials.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-[#cbd5e1]/80 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#cbd5e1] text-slate-700 font-semibold shadow-2xs">
                Interactive Shifter & Dyno RPM
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#cbd5e1] text-slate-700 font-semibold shadow-2xs">
                0-100% Exploded View
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-[#cbd5e1] text-slate-700 font-semibold shadow-2xs">
                Custom Gear Ratios & LSD
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="mt-4 pt-3 border-t border-[#cbd5e1]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTransmission();
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-white font-mono font-black text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:translate-x-0.5 active:scale-98 ${
                isTransmissionConfigured
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-600/25"
                  : isEngineConfigured
                  ? "bg-gradient-to-r from-amber-600 via-orange-600 to-cyan-700 hover:from-amber-500 hover:to-cyan-600 shadow-amber-500/30"
                  : "bg-gradient-to-r from-cyan-700 to-sky-700 hover:from-cyan-600 hover:to-sky-600 shadow-cyan-600/25"
              }`}
            >
              <span>
                {isTransmissionConfigured
                  ? "TUNE TRANSMISSION RATIOS"
                  : isEngineConfigured
                  ? "BUILD TRANSMISSION (STAGE 2) →"
                  : "ENTER 3D TRANSMISSION STUDIO"}
              </span>
              <ChevronRight size={16} className="text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-center mt-1.5 text-[10px] font-mono text-slate-500 font-medium">
              {isTransmissionConfigured
                ? "Transmission is calibrated. Click to adjust gear ratios or differential lock."
                : isEngineConfigured
                ? "Required next step to finish the Powertrain Division!"
                : "Directs to 3D Real-time Transaxle Workshop"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
