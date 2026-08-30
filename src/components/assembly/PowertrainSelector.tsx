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
  className?: string;
}

export function PowertrainSelector({
  currentMode,
  engineConfig,
  onSelectPowertrain,
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
      className={`w-full p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#080d1a]/95 via-[#0b1222]/90 to-[#060a14]/95 border border-amber-500/30 backdrop-blur-3xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] space-y-8 select-none ${className}`}
    >
      {/* ── HEADER BANNER ── */}
      <div className="text-center space-y-2.5 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <Sparkles size={13} className="animate-spin text-amber-400" />
          <span>POWERTRAIN FOUNDATION SELECTION</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold font-mono text-amber-50 tracking-tight">
          Choose Your Powertrain Architecture
        </h2>
        <p className="text-xs md:text-sm text-amber-200/60 font-mono leading-relaxed">
          Select between classical high-RPM Internal Combustion propulsion or instantaneous 800V
          Electric Hyperdrive. Each path unlocks a dedicated 12-stage sequential robotic assembly line.
        </p>
      </div>

      {/* ── 2 DUAL SELECTION CARDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* ========================================================================= */}
        {/* CARD 1: INTERNAL COMBUSTION ENGINE (ICE)                                 */}
        {/* ========================================================================= */}
        <div
          onMouseEnter={() => setHoveredCard("ice")}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative rounded-3xl p-6 md:p-7 border transition-all duration-500 flex flex-col justify-between overflow-hidden cursor-pointer ${
            hoveredCard === "ice" || currentMode === "ice"
              ? "bg-gradient-to-b from-amber-950/40 via-base-900/80 to-base-950/95 border-amber-400/60 shadow-[0_0_40px_rgba(34,211,238,0.25)] scale-[1.01]"
              : "bg-base-950/70 border-amber-800/30 hover:border-amber-700/30"
          }`}
          onClick={() => onSelectPowertrain("ice")}
        >
          {/* Ambient Lighting Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-500/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-gradient-to-tr from-amber-500/10 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Top Status Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  <Flame size={24} className="text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold font-mono text-amber-50">
                      Internal Combustion (ICE)
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      CLASSICAL
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/60 font-mono">
                    Multi-Cylinder · Forced Induction · High-RPM Symphony
                  </p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  currentMode === "ice"
                    ? "border-amber-400 bg-amber-500 text-black shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                    : "border-amber-700/30 bg-amber-900/50"
                }`}
              >
                {currentMode === "ice" && <CheckCircle2 size={14} />}
              </div>
            </div>

            {/* Visual Feature Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-base-900/80 border border-amber-500/20 text-center backdrop-blur-md">
                <span className="block text-[10px] font-mono text-amber-200/60 uppercase">Max Redline</span>
                <span className="text-sm font-mono font-extrabold text-amber-300">12,000+ RPM</span>
              </div>
              <div className="p-2.5 rounded-xl bg-base-900/80 border border-amber-500/20 text-center backdrop-blur-md">
                <span className="block text-[10px] font-mono text-amber-200/60 uppercase">Induction</span>
                <span className="text-sm font-mono font-extrabold text-amber-300">Twin Turbo</span>
              </div>
              <div className="p-2.5 rounded-xl bg-base-900/80 border border-amber-500/20 text-center backdrop-blur-md">
                <span className="block text-[10px] font-mono text-amber-200/60 uppercase">Acoustics</span>
                <span className="text-sm font-mono font-extrabold text-amber-300">110 dB Roar</span>
              </div>
            </div>

            {/* Layout Quick-Preview Grid */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-mono font-bold text-amber-100/80 uppercase tracking-wider flex items-center gap-1.5">
                <Cog size={13} className="text-amber-400" />
                <span>Featured Engine Layouts</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {featuredIceLayouts.map((ly) => (
                  <button
                    key={ly}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIceLayout(ly);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all border text-center ${
                      selectedIceLayout === ly
                        ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_10px_rgba(34,211,238,0.4)] scale-105"
                        : "bg-base-900/90 text-amber-200/60 border-base-800 hover:text-amber-50 hover:border-amber-700/30"
                    }`}
                  >
                    {ENGINE_LAYOUTS[ly as keyof typeof ENGINE_LAYOUTS]?.label || ly.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* 15-Stage Roadmap Preview */}
            <div className="p-3 rounded-2xl bg-base-950/80 border border-amber-800/30 space-y-2">
              <span className="text-[10px] font-mono text-amber-200/60 uppercase tracking-wider block">
                15-Stage Assembly Pipeline:
              </span>
              <p className="text-[11px] text-amber-100/80 font-mono leading-relaxed">
                Engine Block → Crankshaft → Pistons → Rods → Head Gasket → Cylinder Head → Camshafts →
                Valves → Intake & Fuel → Exhaust Headers → Turbocharger → Oil Pan → Radiator → Transmission → Engine Cover
              </p>
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div className="pt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPowertrain("ice");
              }}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-extrabold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
            >
              <span>Build Internal Combustion Engine</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: FULL ELECTRIC POWERTRAIN (EV)                                     */}
        {/* ========================================================================= */}
        <div
          onMouseEnter={() => setHoveredCard("electric")}
          onMouseLeave={() => setHoveredCard(null)}
          className={`relative rounded-3xl p-6 md:p-7 border transition-all duration-500 flex flex-col justify-between overflow-hidden cursor-pointer ${
            hoveredCard === "electric" || currentMode === "electric"
              ? "bg-gradient-to-b from-amber-950/40 via-base-900/80 to-base-950/95 border-amber-400/60 shadow-[0_0_40px_rgba(192,132,252,0.25)] scale-[1.01]"
              : "bg-base-950/70 border-amber-800/30 hover:border-amber-700/30"
          }`}
          onClick={() => onSelectPowertrain("electric")}
        >
          {/* Ambient Lighting Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-500/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Top Status Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-600/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(192,132,252,0.3)]">
                  <Zap size={24} className="text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold font-mono text-amber-50">
                      Full Electric (EV)
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      HYPERDRIVE
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/60 font-mono">
                    800V SiC · Axial-Flux Motors · Instantaneous 0-RPM Torque
                  </p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  currentMode === "electric"
                    ? "border-amber-400 bg-amber-500 text-black shadow-[0_0_12px_rgba(192,132,252,0.6)]"
                    : "border-amber-700/30 bg-amber-900/50"
                }`}
              >
                {currentMode === "electric" && <CheckCircle2 size={14} />}
              </div>
            </div>

            {/* Visual Feature Highlights */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2.5 rounded-xl bg-base-900/80 border border-amber-500/20 text-center backdrop-blur-md">
                <span className="block text-[10px] font-mono text-amber-200/60 uppercase">Architecture</span>
                <span className="text-sm font-mono font-extrabold text-amber-300">800V SiC</span>
              </div>
              <div className="p-2.5 rounded-xl bg-base-900/80 border border-amber-500/20 text-center backdrop-blur-md">
                <span className="block text-[10px] font-mono text-amber-200/60 uppercase">Peak Torque</span>
                <span className="text-sm font-mono font-extrabold text-amber-300">0 RPM Instant</span>
              </div>
              <div className="p-2.5 rounded-xl bg-base-900/80 border border-amber-500/20 text-center backdrop-blur-md">
                <span className="block text-[10px] font-mono text-amber-200/60 uppercase">Efficiency</span>
                <span className="text-sm font-mono font-extrabold text-amber-300">96.8% Powertrain</span>
              </div>
            </div>

            {/* EV Motor Quick-Preview Grid */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-mono font-bold text-amber-100/80 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={13} className="text-amber-400" />
                <span>Featured Motor Topologies</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {featuredEvMotors.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvMotor(m);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all border text-center ${
                      selectedEvMotor === m
                        ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_10px_rgba(192,132,252,0.4)] scale-105"
                        : "bg-base-900/90 text-amber-200/60 border-base-800 hover:text-amber-50 hover:border-amber-700/30"
                    }`}
                  >
                    {EV_MOTOR_TYPES[m as keyof typeof EV_MOTOR_TYPES]?.label || m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* 12-Stage EV Roadmap Preview */}
            <div className="p-3 rounded-2xl bg-base-950/80 border border-amber-800/30 space-y-2">
              <span className="text-[10px] font-mono text-amber-200/60 uppercase tracking-wider block">
                12-Stage EV Assembly Pipeline:
              </span>
              <p className="text-[11px] text-amber-100/80 font-mono leading-relaxed">
                Battery Tray → Cell Modules → BMS Unit → HV Busbars → Cooling Radiator → Cooling Plate →
                SiC Inverter → PM Rotor Shaft → Stator Coils → Gearbox → HV PDU → Regen Boost
              </p>
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div className="pt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPowertrain("electric");
              }}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-black font-mono font-extrabold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(192,132,252,0.4)] flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
            >
              <span>Build Electric Hyperdrive</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
