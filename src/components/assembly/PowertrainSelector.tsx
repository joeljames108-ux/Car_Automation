// ===================================================================
// APEX ENGINE BUILDER — POWERTRAIN ARCHITECTURE SELECTOR (PHASE 2)
// Translucent Liquid Glassmorphic Studio Landing Selection Card
// ===================================================================

import React, { useState } from "react";
import {
  Flame,
  Zap,
  Cog,
  Battery,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Cpu,
  Activity,
  Gauge,
  Layers,
  CheckCircle2,
  TrendingUp,
  Volume2,
} from "lucide-react";
import { PowertrainMode } from "../../sim/assemblyTypes";
import { ENGINE_LAYOUTS, EV_MOTOR_TYPES } from "../../sim/constants";
import { EngineConfig } from "../../sim/types";

interface PowertrainSelectorProps {
  currentMode: PowertrainMode;
  engineConfig: EngineConfig;
  onSelectPowertrain: (mode: PowertrainMode) => void;
  onBackToCreatorMenu?: () => void;
  className?: string;
}

export function PowertrainSelector({
  currentMode,
  engineConfig,
  onSelectPowertrain,
  onBackToCreatorMenu,
  className = "",
}: PowertrainSelectorProps) {
  const [hoveredCard, setHoveredCard] = useState<PowertrainMode | null>(null);
  const [selectedIceLayout, setSelectedIceLayout] = useState<string>(
    engineConfig.layout === "electric" ? "v8" : engineConfig.layout || "v8"
  );
  const [selectedEvMotor, setSelectedEvMotor] = useState<string>(
    engineConfig.evMotorType || "pmsm_axial"
  );

  const featuredIceLayouts = ["i4", "v6", "v8", "v12", "boxer6", "rotary"];
  const featuredEvMotors = ["pmsm_axial", "pmsm_radial", "ac_induction", "dual_stator"];

  return (
    <div
      className={`w-full p-3.5 sm:p-4 md:p-5 rounded-2xl bg-gradient-to-b from-[#faf8f5]/95 via-[#f6f2ea]/95 to-[#f1ede3]/95 border-2 border-[#dfd6c8] shadow-[0_12px_40px_rgba(15,23,42,0.06)] space-y-3 sm:space-y-3.5 select-none overflow-hidden ${className}`}
    >
      {/* ── TOP UTILITY ROW: BACK TO CREATOR MENU ── */}
      {onBackToCreatorMenu && (
        <div className="flex items-center justify-between pb-2 border-b border-[#dfd6c8]">
          <button
            type="button"
            onClick={onBackToCreatorMenu}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#faf7f0] text-slate-800 hover:text-slate-950 border border-[#d8cfbe] hover:border-amber-400 font-mono font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
            title="Return to Studio Selection"
          >
            <ArrowLeft size={13} className="text-amber-700 group-hover:-translate-x-0.5 transition-transform" />
            <span>← Back to Studio Selection</span>
          </button>

          <div className="hidden sm:flex text-[10px] font-mono text-slate-500 font-semibold items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>AUTOMOTIVE DESIGN & ENGINEERING DIVISIONS</span>
          </div>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="text-center space-y-1 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-[10px] font-mono font-bold tracking-widest uppercase shadow-2xs">
          <Sparkles size={11} className="animate-spin text-amber-600" />
          <span>POWERTRAIN FOUNDATION SELECTION</span>
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
          Choose Your Powertrain Architecture
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-600 font-mono leading-normal">
          Select between classical high-RPM Internal Combustion propulsion or instantaneous 800V
          Electric Hyperdrive. Each path unlocks a dedicated sequential robotic assembly line.
        </p>
      </div>

      {/* ── 2 DUAL SELECTION CARDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 items-stretch">
        
        {/* ========================================================================= */}
        {/* CARD 1: INTERNAL COMBUSTION ENGINE (ICE)                                 */}
        {/* ========================================================================= */}
        <div
          onMouseEnter={() => setHoveredCard("ice")}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative rounded-2xl p-4 sm:p-4.5 border-2 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer ${
            hoveredCard === "ice" || currentMode === "ice"
              ? "bg-gradient-to-b from-white via-[#fffcf7] to-[#fef5e9] border-amber-500 shadow-[0_12px_32px_rgba(217,119,6,0.12)] scale-[1.008]"
              : "bg-white/95 border-[#e2d8ca] hover:border-amber-400 shadow-xs hover:shadow-md"
          }`}
          onClick={() => onSelectPowertrain("ice")}
        >
          {/* Ambient Lighting Glow */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-amber-500/10 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Top Status Header */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200/80 border border-amber-300 flex items-center justify-center text-amber-800 shadow-2xs">
                  <Flame size={20} className="text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-extrabold font-mono text-slate-900">
                      Internal Combustion (ICE)
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-amber-100 text-amber-900 border border-amber-300">
                      CLASSICAL
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono font-medium">
                    Multi-Cylinder · Forced Induction · High-RPM Symphony
                  </p>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  currentMode === "ice"
                    ? "border-amber-600 bg-amber-500 text-slate-950 shadow-xs"
                    : "border-slate-300 bg-slate-100 text-transparent"
                }`}
              >
                {currentMode === "ice" && <CheckCircle2 size={12} className="text-slate-950" />}
              </div>
            </div>

            {/* Visual Feature Highlights */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <div className="p-1.5 sm:p-2 rounded-lg bg-white border border-[#e5dcd0] text-center shadow-2xs">
                <span className="block text-[9px] font-mono text-slate-500 font-bold uppercase">Max Redline</span>
                <span className="text-xs sm:text-sm font-mono font-extrabold text-amber-700">12,000+ RPM</span>
              </div>
              <div className="p-1.5 sm:p-2 rounded-lg bg-white border border-[#e5dcd0] text-center shadow-2xs">
                <span className="block text-[9px] font-mono text-slate-500 font-bold uppercase">Induction</span>
                <span className="text-xs sm:text-sm font-mono font-extrabold text-amber-700">Twin Turbo</span>
              </div>
              <div className="p-1.5 sm:p-2 rounded-lg bg-white border border-[#e5dcd0] text-center shadow-2xs">
                <span className="block text-[9px] font-mono text-slate-500 font-bold uppercase">Acoustics</span>
                <span className="text-xs sm:text-sm font-mono font-extrabold text-amber-700">110 dB Roar</span>
              </div>
            </div>

            {/* Layout Quick-Preview Grid */}
            <div className="space-y-1.5 pt-0.5">
              <label className="text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Cog size={12} className="text-amber-600" />
                <span>Featured Engine Layouts</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                {featuredIceLayouts.map((ly) => (
                  <button
                    key={ly}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIceLayout(ly);
                    }}
                    className={`py-1 px-1.5 rounded-md text-[11px] font-mono font-bold transition-all border text-center cursor-pointer ${
                      selectedIceLayout === ly
                        ? "bg-amber-500 text-slate-950 border-amber-600 shadow-2xs scale-102 font-black"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {ENGINE_LAYOUTS[ly as keyof typeof ENGINE_LAYOUTS]?.label || ly.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* 15-Stage Roadmap Preview */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-0.5">
              <span className="text-[9px] font-mono text-amber-900 font-black uppercase tracking-wider block">
                15-Stage Assembly Pipeline:
              </span>
              <p className="text-[10px] text-slate-700 font-mono font-medium leading-snug">
                Engine Block → Crankshaft → Pistons → Rods → Head Gasket → Cylinder Head → Camshafts →
                Valves → Intake & Fuel → Exhaust Headers → Turbocharger → Oil Pan → Radiator → Transmission → Engine Cover
              </p>
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div className="pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPowertrain("ice");
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-black text-xs tracking-wider uppercase transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
            >
              <span>Build Internal Combustion Engine</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: FULL ELECTRIC POWERTRAIN (EV)                                     */}
        {/* ========================================================================= */}
        <div
          onMouseEnter={() => setHoveredCard("electric")}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative rounded-2xl p-4 sm:p-4.5 border-2 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer ${
            hoveredCard === "electric" || currentMode === "electric"
              ? "bg-gradient-to-b from-white via-[#f7fcf9] to-[#edf9f2] border-emerald-500 shadow-[0_12px_32px_rgba(16,185,129,0.12)] scale-[1.008]"
              : "bg-white/95 border-[#e2d8ca] hover:border-emerald-500 shadow-xs hover:shadow-md"
          }`}
          onClick={() => onSelectPowertrain("electric")}
        >
          {/* Ambient Lighting Glow */}
          <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Top Status Header */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200/80 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-2xs">
                  <Zap size={20} className="text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-extrabold font-mono text-slate-900">
                      Full Electric (EV)
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                      HYPERDRIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono font-medium">
                    800V SiC · Axial-Flux Motors · Instantaneous 0-RPM Torque
                  </p>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  currentMode === "electric"
                    ? "border-emerald-600 bg-emerald-500 text-white shadow-xs"
                    : "border-slate-300 bg-slate-100 text-transparent"
                }`}
              >
                {currentMode === "electric" && <CheckCircle2 size={12} className="text-white" />}
              </div>
            </div>

            {/* Visual Feature Highlights */}
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <div className="p-1.5 sm:p-2 rounded-lg bg-white border border-[#d6e8dc] text-center shadow-2xs">
                <span className="block text-[9px] font-mono text-slate-500 font-bold uppercase">Architecture</span>
                <span className="text-xs sm:text-sm font-mono font-extrabold text-emerald-700">800V SiC</span>
              </div>
              <div className="p-1.5 sm:p-2 rounded-lg bg-white border border-[#d6e8dc] text-center shadow-2xs">
                <span className="block text-[9px] font-mono text-slate-500 font-bold uppercase">Peak Torque</span>
                <span className="text-xs sm:text-sm font-mono font-extrabold text-emerald-700">0 RPM Instant</span>
              </div>
              <div className="p-1.5 sm:p-2 rounded-lg bg-white border border-[#d6e8dc] text-center shadow-2xs">
                <span className="block text-[9px] font-mono text-slate-500 font-bold uppercase">Efficiency</span>
                <span className="text-xs sm:text-sm font-mono font-extrabold text-emerald-700">96.8% Powertrain</span>
              </div>
            </div>

            {/* EV Motor Quick-Preview Grid */}
            <div className="space-y-1.5 pt-0.5">
              <label className="text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={12} className="text-emerald-600" />
                <span>Featured Motor Topologies</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {featuredEvMotors.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvMotor(m);
                    }}
                    className={`py-1 px-1.5 rounded-md text-[11px] font-mono font-bold transition-all border text-center cursor-pointer ${
                      selectedEvMotor === m
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-2xs scale-102 font-black"
                        : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {EV_MOTOR_TYPES[m as keyof typeof EV_MOTOR_TYPES]?.label || m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* 12-Stage EV Roadmap Preview */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/90 space-y-0.5">
              <span className="text-[9px] font-mono text-emerald-900 font-black uppercase tracking-wider block">
                12-Stage EV Assembly Pipeline:
              </span>
              <p className="text-[10px] text-slate-700 font-mono font-medium leading-snug">
                Battery Tray → Cell Modules → BMS Unit → HV Busbars → Cooling Radiator → Cooling Plate →
                SiC Inverter → PM Rotor Shaft → Stator Coils → Gearbox → HV PDU → Regen Boost
              </p>
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div className="pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPowertrain("electric");
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-black text-xs tracking-wider uppercase transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
            >
              <span>Build Electric Hyperdrive</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
