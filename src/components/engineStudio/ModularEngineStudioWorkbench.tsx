/**
 * ============================================================================
 * MODULAR ENGINE STUDIO — 5-TAB WORKBENCH
 * ============================================================================
 * Comprehensive glassmorphism parameter control deck for:
 * 1. Architecture & Short Block (Bore, Stroke, Crank, Rods, Pistons)
 * 2. Heads & Valvetrain (DOHC, Cams, Valves, Springs, ITBs, Fuel)
 * 3. Forced Induction & Exhaust (Turbos, Boost, Intercooler, Headers)
 * 4. ECU & Tuning (Ignition timing, AFR, VVT, Rev Limiter)
 * 5. Mechanical Safety & Diagnostics (Knock, Valve Float, Torque Ratings)
 * ============================================================================
 */

import React, { useState } from "react";
import {
  Cog,
  Flame,
  Zap,
  Gauge,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Wrench,
  Thermometer,
  DollarSign,
  Activity,
  Sparkles,
  Palette,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  MasterEngineState,
  EngineArchitectureFamily,
  BlockMaterial,
  CrankshaftMaterial,
  CrankshaftPlaneType,
  ConnectingRodStyle,
  PistonMaterialClass,
  CylinderHeadValvetrain,
  ValveSpringType,
  IntakeManifoldStyle,
  FuelInjectionSystem,
  ForcedInductionType,
  ExhaustHeaderStyle,
  LubricationSystemType,
  EngineCoverModel,
  EngineCoverColor,
  EngineCoverBezelColor,
  ExhaustFinish,
  ValveCoverColor,
  AnodizingTheme,
  TurboHousingFinish,
  CompressorWheelColor,
  WastegateCapColor,
  SiliconeCouplerColor,
  TransmissionArchitectureType,
  DifferentialType,
  ClutchMaterialType,
  BellhousingMaterial,
  GearsetMetallurgy,
  GearRatioSet,
} from "../../sim/engine/masterEngineTypes";
import { MasterEngineStateEngine } from "../../sim/engine/masterEngineStateEngine";
import { DrivetrainSolver } from "../../sim/engine/drivetrainSolver";

interface ModularEngineStudioWorkbenchProps {
  state: MasterEngineState;
  engine: MasterEngineStateEngine;
}

const ModularEngineStudioWorkbenchComponent: React.FC<ModularEngineStudioWorkbenchProps> = ({
  state,
  engine,
}) => {
  const [activeTab, setActiveTab] = useState<"block" | "heads" | "turbo" | "cosmetics" | "tuning" | "drivetrain" | "safety">("block");

  const compat = state.compatibility;
  const dt = state.drivetrain;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* 7-Tab Navigation Bar */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 overflow-x-auto">
        {[
          { id: "block", label: "Short Block", icon: <Cog size={13} /> },
          { id: "heads", label: "Heads & Cams", icon: <Layers size={13} /> },
          { id: "turbo", label: "Turbo & Exhaust", icon: <Flame size={13} /> },
          { id: "cosmetics", label: "Styling & Covers", icon: <Sparkles size={13} className="text-amber-400" /> },
          { id: "tuning", label: "ECU Tuning", icon: <Cpu size={13} /> },
          { id: "drivetrain", label: "Drivetrain & Gears", icon: <Sliders size={13} className="text-amber-400" /> },
          {
            id: "safety",
            label: "Safety & Rules",
            icon: (
              <span className="relative">
                <AlertTriangle size={13} />
                {compat?.criticalHazardsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </span>
            ),
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-amber-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs text-slate-300 custom-scrollbar">
        {/* ================================================================= */}
        {/* TAB 1: SHORT BLOCK & ARCHITECTURE */}
        {/* ================================================================= */}
        {activeTab === "block" && (
          <div className="space-y-4">
            {/* Architecture Selector */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Engine Architecture & Cylinders
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">Layout Family</span>
                  <select
                    value={state.architecture.family}
                    onChange={(e) =>
                      engine.updateArchitecture({ family: e.target.value as EngineArchitectureFamily })
                    }
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                  >
                    <option value="inline">Inline</option>
                    <option value="v_engine">V-Engine</option>
                    <option value="boxer">Boxer / Flat</option>
                    <option value="w_engine">W-Engine</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Cylinder Count</span>
                  <select
                    value={state.architecture.cylinderCount}
                    onChange={(e) =>
                      engine.updateArchitecture({ cylinderCount: parseInt(e.target.value, 10) as any })
                    }
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                  >
                    <option value="3">3 Cylinder</option>
                    <option value="4">4 Cylinder</option>
                    <option value="6">6 Cylinder</option>
                    <option value="8">8 Cylinder</option>
                    <option value="10">10 Cylinder</option>
                    <option value="12">12 Cylinder</option>
                    <option value="16">16 Cylinder</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bore & Stroke Dimensions */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Displacement Geometry
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {state.performance?.displacementLiters || 4.0}L (
                  {state.performance?.boreToStrokeRatio || 1.0} B/S)
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Cylinder Bore</span>
                  <span className="font-mono text-amber-300">{state.block.boreMm} mm</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="102"
                  step="0.5"
                  value={state.block.boreMm}
                  onChange={(e) => engine.updateBlock({ boreMm: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Piston Stroke</span>
                  <span className="font-mono text-amber-300">{state.block.strokeMm} mm</span>
                </div>
                <input
                  type="range"
                  min="65"
                  max="105"
                  step="0.5"
                  value={state.block.strokeMm}
                  onChange={(e) => {
                    engine.updateBlock({ strokeMm: parseFloat(e.target.value) });
                    engine.updateCrankshaft({ strokeMm: parseFloat(e.target.value) });
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Connecting Rod Length (Center-to-Center)</span>
                  <span className="font-mono text-amber-300">{state.connectingRods.rodLengthMm} mm</span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="170"
                  step="0.5"
                  value={state.connectingRods.rodLengthMm}
                  onChange={(e) => engine.updateConnectingRods({ rodLengthMm: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* Block Material & Crankshaft */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Block Material</span>
                <select
                  value={state.block.material}
                  onChange={(e) => engine.updateBlock({ material: e.target.value as BlockMaterial })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                >
                  <option value="cast_iron">Cast Nodular Iron</option>
                  <option value="hypereutectic_aluminum">Hypereutectic Al</option>
                  <option value="billet_6061_t6">Billet 6061-T6 Aluminum</option>
                  <option value="magnesium_alloy">Magnesium Alloy</option>
                </select>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Crankshaft Plane</span>
                <select
                  value={state.crankshaft.planeType}
                  onChange={(e) =>
                    engine.updateCrankshaft({ planeType: e.target.value as CrankshaftPlaneType })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                >
                  <option value="flat_plane_180">Flat-Plane 180° (High Rev)</option>
                  <option value="cross_plane_90">Cross-Plane 90° (Smooth V8)</option>
                </select>
              </div>
            </div>

            {/* Pistons & Rods */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Connecting Rods</span>
                <select
                  value={state.connectingRods.style}
                  onChange={(e) =>
                    engine.updateConnectingRods({ style: e.target.value as ConnectingRodStyle })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                >
                  <option value="i_beam_forged">I-Beam Forged Steel</option>
                  <option value="h_beam_billet_4340">H-Beam Billet 4340</option>
                  <option value="titanium_forged_competition">Titanium Forged Race</option>
                </select>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Piston Alloy</span>
                <select
                  value={state.pistons.materialClass}
                  onChange={(e) =>
                    engine.updatePistons({ materialClass: e.target.value as PistonMaterialClass })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                >
                  <option value="hypereutectic_cast">Hypereutectic Cast</option>
                  <option value="4032_forged_high_silicon">4032 Forged Street</option>
                  <option value="2618_forged_low_silicon_race">2618 Forged Race</option>
                  <option value="ceramic_thermal_barrier_coated">Ceramic Coated</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: HEADS & VALVETRAIN */}
        {/* ================================================================= */}
        {activeTab === "heads" && (
          <div className="space-y-4">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Valvetrain Class
              </label>
              <select
                value={state.cylinderHeads.valvetrain}
                onChange={(e) =>
                  engine.updateCylinderHeads({ valvetrain: e.target.value as CylinderHeadValvetrain })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
              >
                <option value="ohv_pushrod_2v">OHV Pushrod 2V</option>
                <option value="sohc_4v">SOHC 4V</option>
                <option value="dohc_4v_roller_rocker">DOHC 4V Roller Rocker</option>
                <option value="desmodromic_mechanical">Desmodromic Mechanical (No Springs)</option>
                <option value="pneumatic_f1_valvetrain">Pneumatic F1 Valvetrain (14k+ RPM)</option>
              </select>
            </div>

            {/* Cam Duration & Lift */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Camshaft Profile
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {state.camshafts.intakeDurationAdvDeg}° / {state.camshafts.intakeLiftMm}mm
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Intake Duration</span>
                  <span className="font-mono text-amber-300">{state.camshafts.intakeDurationAdvDeg}°</span>
                </div>
                <input
                  type="range"
                  min="240"
                  max="330"
                  step="2"
                  value={state.camshafts.intakeDurationAdvDeg}
                  onChange={(e) =>
                    engine.updateCamshafts({ intakeDurationAdvDeg: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Intake Lift</span>
                  <span className="font-mono text-amber-300">{state.camshafts.intakeLiftMm} mm</span>
                </div>
                <input
                  type="range"
                  min="8.5"
                  max="16.0"
                  step="0.1"
                  value={state.camshafts.intakeLiftMm}
                  onChange={(e) =>
                    engine.updateCamshafts({ intakeLiftMm: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* Valve Springs & Intake Manifold */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Valve Springs</span>
                <select
                  value={state.valvesAndSprings.springType}
                  onChange={(e) =>
                    engine.updateValvesAndSprings({ springType: e.target.value as ValveSpringType })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                >
                  <option value="single_ovate_beehive">Single Beehive</option>
                  <option value="dual_titanium_springs_pac">Dual Titanium PAC</option>
                  <option value="pneumatic_nitrogen_chamber">Pneumatic F1 Chamber</option>
                </select>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Air Intake Style</span>
                <select
                  value={state.intake.style}
                  onChange={(e) =>
                    engine.updateIntake({ style: e.target.value as IntakeManifoldStyle })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                >
                  <option value="single_plenum_cast">Cast Single Plenum</option>
                  <option value="dual_plenum_ram_air">Dual Plenum Ram-Air</option>
                  <option value="individual_throttle_bodies_itb">Individual ITBs</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: FORCED INDUCTION & SUPERCHARGERS */}
        {/* ================================================================= */}
        {activeTab === "turbo" && (
          <div className="space-y-4">
            {/* 1. Aspiration & Forced Induction Archetype */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                1. Aspiration & Forced Induction System
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  {
                    id: "naturally_aspirated",
                    title: "Naturally Aspirated",
                    desc: "High-revving purist atmospheric intake with instantaneous throttle response.",
                    turbos: 0,
                    badge: "Atmospheric",
                  },
                  {
                    id: "single_twin_scroll_turbo",
                    title: "Single Twin-Scroll Turbo",
                    desc: "Big single high-flow turbocharger for massive top-end power delivery.",
                    turbos: 1,
                    badge: "Drag / Drift",
                  },
                  {
                    id: "twin_turbo_parallel",
                    title: "Twin-Turbo Parallel",
                    desc: "Symmetric left & right outboard turbos for balanced spool and high boost capacity.",
                    turbos: 2,
                    badge: "GT3 / Supercar",
                  },
                  {
                    id: "hot_v_twin_turbo",
                    title: "Hot-V Twin-Turbo",
                    desc: "Turbos packaged inside the engine V-valley for ultra-short exhaust runner spool.",
                    turbos: 2,
                    badge: "Short Spool",
                  },
                  {
                    id: "quad_turbo_staged",
                    title: "Quad-Turbo Staged",
                    desc: "4 discrete turbochargers (W16/W18 setup) with dual intercooler bridges.",
                    turbos: 4,
                    badge: "Hypercar",
                  },
                  {
                    id: "roots_twin_screw_supercharger",
                    title: "Twin-Screw Supercharger",
                    desc: "Valley-mounted positive displacement blower with instant zero-lag low-end torque.",
                    turbos: 0,
                    badge: "Instant Boost",
                  },
                  {
                    id: "centrifugal_supercharger",
                    title: "Centrifugal Supercharger",
                    desc: "Front-mounted high-RPM compressor with planetary step-up drive gearbox.",
                    turbos: 0,
                    badge: "ProCharger",
                  },
                ].map((item) => {
                  const isSelected = state.turboSystem.type === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        engine.updateTurboSystem({
                          type: item.id as ForcedInductionType,
                          turboCount: item.turbos as any,
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500/80 shadow-md shadow-cyan-500/10 ring-1 ring-amber-400"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isSelected ? "text-amber-300" : "text-slate-200"}`}>
                          {item.title}
                        </span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Sizing Presets */}
            {state.turboSystem.type !== "naturally_aspirated" && (
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Sizing & Boost Presets:
                </span>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {[
                    { label: "Street 54mm", inducer: 54, exducer: 58, ar: 0.63, boost: 1.0, disp: 2.3, pulley: 2.0 },
                    { label: "Track GT3 68mm", inducer: 68, exducer: 64, ar: 0.82, boost: 1.6, disp: 3.0, pulley: 2.4 },
                    { label: "Hypercar 82mm", inducer: 82, exducer: 78, ar: 1.05, boost: 2.2, disp: 3.5, pulley: 2.8 },
                    { label: "Pro Drag 98mm", inducer: 98, exducer: 94, ar: 1.25, boost: 3.2, disp: 4.2, pulley: 3.2 },
                    { label: "Quad 4x 64mm", inducer: 64, exducer: 62, ar: 0.85, boost: 2.8, disp: 3.8, pulley: 3.0 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() =>
                        engine.updateTurboSystem({
                          compressorInducerMm: preset.inducer,
                          turbineExducerMm: preset.exducer,
                          aRatio: preset.ar,
                          targetBoostPressureBar: preset.boost,
                          superchargerDisplacementLiters: preset.disp,
                          superchargerPulleyRatio: preset.pulley,
                        })
                      }
                      className="px-2.5 py-1 text-[10px] font-mono font-semibold rounded-lg bg-slate-800 hover:bg-slate-900/80 hover:text-amber-300 text-slate-200 border border-slate-700 whitespace-nowrap transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Parametric Sizing & Dynamic Scalers */}
            {state.turboSystem.type !== "naturally_aspirated" && (
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-3.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    2. Physical Geometry Sizing & Boost Parameters
                  </label>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {state.turboSystem.targetBoostPressureBar} bar ({Math.round(state.turboSystem.targetBoostPressureBar * 14.5)} psi)
                  </span>
                </div>

                {/* Target Boost Pressure */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Target Boost Pressure</span>
                    <span className="font-mono text-rose-400 font-bold">{state.turboSystem.targetBoostPressureBar} bar</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.05"
                    value={state.turboSystem.targetBoostPressureBar}
                    onChange={(e) => engine.updateTurboSystem({ targetBoostPressureBar: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>

                {/* Turbo Specific Sizing */}
                {state.turboSystem.type !== "roots_twin_screw_supercharger" && (
                  <>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Compressor Inducer Diameter (Physical Size)</span>
                        <span className="font-mono text-amber-300 font-bold">{state.turboSystem.compressorInducerMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min="45"
                        max="110"
                        step="1"
                        value={state.turboSystem.compressorInducerMm}
                        onChange={(e) => engine.updateTurboSystem({ compressorInducerMm: parseInt(e.target.value, 10) })}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Turbine Exducer Diameter</span>
                        <span className="font-mono text-amber-300 font-bold">{state.turboSystem.turbineExducerMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min="48"
                        max="115"
                        step="1"
                        value={state.turboSystem.turbineExducerMm}
                        onChange={(e) => engine.updateTurboSystem({ turbineExducerMm: parseInt(e.target.value, 10) })}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Turbine Housing A/R Ratio</span>
                        <span className="font-mono text-amber-300 font-bold">{state.turboSystem.aRatio} A/R</span>
                      </div>
                      <input
                        type="range"
                        min="0.50"
                        max="1.45"
                        step="0.05"
                        value={state.turboSystem.aRatio}
                        onChange={(e) => engine.updateTurboSystem({ aRatio: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>
                  </>
                )}

                {/* Supercharger Specific Sizing */}
                {state.turboSystem.type === "roots_twin_screw_supercharger" && (
                  <>
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Supercharger Blower Displacement</span>
                        <span className="font-mono text-amber-300 font-bold">{state.turboSystem.superchargerDisplacementLiters ?? 3.0} Liters</span>
                      </div>
                      <input
                        type="range"
                        min="1.8"
                        max="4.5"
                        step="0.1"
                        value={state.turboSystem.superchargerDisplacementLiters ?? 3.0}
                        onChange={(e) => engine.updateTurboSystem({ superchargerDisplacementLiters: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Drive Pulley Ratio</span>
                        <span className="font-mono text-amber-300 font-bold">{(state.turboSystem.superchargerPulleyRatio ?? 2.4).toFixed(1)}:1</span>
                      </div>
                      <input
                        type="range"
                        min="1.8"
                        max="3.4"
                        step="0.1"
                        value={state.turboSystem.superchargerPulleyRatio ?? 2.4}
                        onChange={(e) => engine.updateTurboSystem({ superchargerPulleyRatio: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 3. Forced Induction Styling, Materials & Finishes */}
            {state.turboSystem.type !== "naturally_aspirated" && (
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  3. Forced Induction Materials & Aesthetic Finishes
                </label>

                {/* Housing Material & Color */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1.5">Turbine / Blower Housing Finish</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "billet_polished", label: "Polished Billet", color: "#f8fafc" },
                      { id: "titanium_blued", label: "Titanium Blued", color: "#b45309" },
                      { id: "inconel_bronze", label: "Inconel 625", color: "#d97706" },
                      { id: "ceramic_white", label: "Ceramic White", color: "#e2e8f0" },
                      { id: "stealth_black", label: "Stealth Black", color: "#18181b" },
                      { id: "rosso_corsa", label: "Rosso Corsa", color: "#dc2626" },
                    ].map((item) => {
                      const isSelected = (state.turboSystem.turboHousingFinish || "titanium_blued") === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => engine.updateTurboSystem({ turboHousingFinish: item.id as TurboHousingFinish })}
                          className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? "bg-slate-800 border-amber-400 ring-1 ring-amber-400 text-slate-100"
                              : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300"
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-[9.5px] font-medium truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Compressor Wheel / Pulley Anodizing */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1.5">Compressor Impeller / Pulley Finish</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "billet_gold", label: "Billet Gold", color: "#f59e0b" },
                      { id: "billet_emerald", label: "Emerald Green", color: "#10b981" },
                      { id: "billet_cobalt", label: "Cobalt Blue", color: "#0284c7" },
                      { id: "billet_crimson", label: "Crimson Red", color: "#ef4444" },
                      { id: "polished_silver", label: "Billet Silver", color: "#e2e8f0" },
                    ].map((item) => {
                      const isSelected = (state.turboSystem.compressorWheelColor || "billet_gold") === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => engine.updateTurboSystem({ compressorWheelColor: item.id as CompressorWheelColor })}
                          className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? "bg-slate-800 border-amber-400 ring-1 ring-amber-400 text-slate-100"
                              : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300"
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-[9.5px] font-medium truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Wastegate & Silicone Coupler Options */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">Wastegate / BOV Cap</span>
                    <select
                      value={state.turboSystem.wastegateCapColor || "anodized_purple"}
                      onChange={(e) => engine.updateTurboSystem({ wastegateCapColor: e.target.value as WastegateCapColor })}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 font-medium"
                    >
                      <option value="anodized_purple">Anodized Purple</option>
                      <option value="anodized_blue">Cobalt Blue</option>
                      <option value="anodized_gold">Billet Gold</option>
                      <option value="anodized_red">Crimson Red</option>
                      <option value="stealth_black">Stealth Black</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400">Silicone Coupler Boot</span>
                    <select
                      value={state.turboSystem.couplerColor || "blue_silicone"}
                      onChange={(e) => engine.updateTurboSystem({ couplerColor: e.target.value as SiliconeCouplerColor })}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 font-medium"
                    >
                      <option value="blue_silicone">4-Ply Silicone Blue</option>
                      <option value="red_silicone">4-Ply Silicone Red</option>
                      <option value="stealth_black_viton">Stealth Black Viton</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Exhaust Headers Style */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                4. Exhaust Header Configuration
              </label>
              <select
                value={state.exhaust.headerStyle}
                onChange={(e) => engine.updateExhaust({ headerStyle: e.target.value as ExhaustHeaderStyle })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 font-medium"
              >
                <option value="cast_iron_log">Cast Iron Log</option>
                <option value="shorty_tuned_tubular">Shorty Tuned Tubular</option>
                <option value="equal_length_long_tube">Equal-Length Long Tube</option>
                <option value="inconel_pie_cut_hot_v">Inconel Pie-Cut Race</option>
                <option value="titanium_f1_bundle">Titanium F1 Bundle</option>
              </select>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: ECU TUNING */}
        {/* ================================================================= */}
        {activeTab === "tuning" && (
          <div className="space-y-4">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Rev Limiter Target
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {state.tuning.revLimiterRpm} RPM
                </span>
              </div>
              <input
                type="range"
                min="6000"
                max="12000"
                step="100"
                value={state.tuning.revLimiterRpm}
                onChange={(e) =>
                  engine.updateTuning({ revLimiterRpm: parseInt(e.target.value, 10) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Ignition Advance (WOT)
                </label>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {state.tuning.ignitionTimingAdvanceDeg}° BTDC
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="42"
                step="1"
                value={state.tuning.ignitionTimingAdvanceDeg}
                onChange={(e) =>
                  engine.updateTuning({ ignitionTimingAdvanceDeg: parseInt(e.target.value, 10) })
                }
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Fuel Type Octane</span>
                <select
                  value={state.fuelSystem.fuelTypeOctane}
                  onChange={(e) =>
                    engine.updateFuelSystem({ fuelTypeOctane: e.target.value as any })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                >
                  <option value="pump_91">91 Octane Pump</option>
                  <option value="pump_93">93 Octane Premium</option>
                  <option value="e85_flex">E85 Ethanol Flex</option>
                  <option value="race_100_unleaded">100 Octane Race Gas</option>
                </select>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Lubrication</span>
                <select
                  value={state.lubrication.systemType}
                  onChange={(e) =>
                    engine.updateLubrication({ systemType: e.target.value as LubricationSystemType })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                >
                  <option value="wet_sump_baffled">Wet Sump Baffled</option>
                  <option value="dry_sump_3_stage">Dry Sump 3-Stage</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: MECHANICAL SAFETY & COMPATIBILITY */}
        {/* ================================================================= */}
        {activeTab === "safety" && (
          <div className="space-y-3">
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                compat?.isMechanicallySafe
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-300"
              }`}
            >
              {compat?.isMechanicallySafe ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <AlertTriangle size={18} className="text-rose-400 animate-pulse" />
              )}
              <div>
                <span className="font-bold text-xs block">
                  {compat?.isMechanicallySafe
                    ? "100% Mechanically Compatible"
                    : `${compat?.criticalHazardsCount} Critical Hazards Detected`}
                </span>
                <span className="text-[10px] opacity-80">
                  Valve Float: {compat?.valveFloatRpm} RPM | Max Torque: {compat?.maxSafeCrankTorqueNm} Nm
                </span>
              </div>
            </div>

            {compat?.violations?.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs">
                No compatibility warnings. All parts are matched to safe mechanical tolerances.
              </div>
            ) : (
              compat?.violations?.map((v, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border space-y-1.5 ${
                    v.severity === "critical_hazard"
                      ? "bg-rose-950/30 border-rose-800/60"
                      : "bg-slate-900/60 border-slate-700/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        v.severity === "critical_hazard" ? "text-rose-400" : "text-amber-400"
                      }`}
                    >
                      {v.title}
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-900 font-mono">
                      {v.severity.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{v.description}</p>
                  <p className="text-[10px] text-amber-300/90 font-medium">
                    💡 Remedy: {v.recommendedRemedy}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: COSMETICS, ENGINE COVERS & EXHAUST FINISHES */}
        {/* ================================================================= */}
        {activeTab === "cosmetics" && (
          <div className="space-y-4">
            {/* Header & Beauty Cover Visibility Toggle */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  Engine Aesthetics & Covers
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Customize 3D engine beauty cover models, titanium temper bluing, and powdercoats.
                </p>
              </div>
              <button
                onClick={() =>
                  engine.updateCosmetics({
                    showEngineCover: !(state.cosmetics?.showEngineCover ?? true),
                  })
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  (state.cosmetics?.showEngineCover ?? true)
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                }`}
              >
                {(state.cosmetics?.showEngineCover ?? true) ? (
                  <>
                    <Eye size={13} />
                    <span>Cover Visible</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={13} />
                    <span>Cover Hidden</span>
                  </>
                )}
              </button>
            </div>

            {/* 1. Engine Cover 3D Model Picker */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                1. 3D Engine Cover Geometry Model
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  {
                    id: "hypercar_quartz",
                    title: "Apex Hypercar Monocoque",
                    desc: "Carbon fiber monocoque beauty cover with quartz window, gold bezel, and ram scoop.",
                    badge: "Flagship V12",
                  },
                  {
                    id: "gt3_endurance",
                    title: "Sarthe GT3 Endurance",
                    desc: "Dual high-flow carbon airbox plenums with exposed trumpets & Dzus latches.",
                    badge: "Race Spec",
                  },
                  {
                    id: "billet_skeleton",
                    title: "Modena Billet Skeleton",
                    desc: "CNC 6061-T6 skeletal lattice truss frame exposing cams, sprockets & rails.",
                    badge: "Lightweight",
                  },
                  {
                    id: "heritage_wrinkle",
                    title: "Prancing Heritage Plenums",
                    desc: "Dual sand-cast aluminum intake plenums with longitudinal heat fins.",
                    badge: "Classic",
                  },
                  {
                    id: "stealth_vortex",
                    title: "Stealth Track Vortex",
                    desc: "Low-profile forged carbon cover with active vortex aero generator fins.",
                    badge: "Aero Track",
                  },
                  {
                    id: "exposed_itb",
                    title: "Purist Exposed Velocity Stacks",
                    desc: "Raw open-trumpet ITBs, billet fuel rails, and mechanical throttle linkage.",
                    badge: "Pure ITB",
                  },
                  {
                    id: "inline_twin_cam_turbo",
                    title: "Inline Twin-Cam Turbo Spec",
                    desc: "Asymmetric dry-carbon cam valley cover, titanium turbo heat shield & COP coils.",
                    badge: "Inline I3-I6",
                  },
                  {
                    id: "boxer_twin_plenum_flat",
                    title: "Boxer Twin-Plenum Flat Spec",
                    desc: "Low-profile dual runner airbox with top-mount intercooler fins & strut bar.",
                    badge: "Boxer/Flat",
                  },
                  {
                    id: "w16_quad_turbo_hypersport",
                    title: "W16 Quad-Turbo Hypersport",
                    desc: "Massive 4-bank carbon cover with inconel heat shield & 16-coil heat sinks.",
                    badge: "W12 / W16",
                  },
                  {
                    id: "rotary_apex_trochoid",
                    title: "Rotary Apex Trochoid Spec",
                    desc: "Epitrochoid rotor profile housing with side-draft velocity trumpets & apex badge.",
                    badge: "Wankel Rotary",
                  },
                  {
                    id: "supercharged_v8_shaker",
                    title: "Supercharged V8 Shaker Scoop",
                    desc: "Billet supercharger case cover with protruding hood scoop & twin butterfly valves.",
                    badge: "Supercharged",
                  },
                  {
                    id: "f1_pneumatic_carbon_plenum",
                    title: "F1 Pneumatic Carbon Plenum",
                    desc: "Teardrop pre-preg carbon airbox with 24K gold thermal foil & pneumatic fill ports.",
                    badge: "F1 Spec",
                  },
                ].map((model) => {
                  const isSelected = (state.cosmetics?.coverModel || "hypercar_quartz") === model.id;
                  return (
                    <button
                      key={model.id}
                      onClick={() =>
                        engine.updateCosmetics({
                          coverModel: model.id as EngineCoverModel,
                          showEngineCover: true,
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500/80 shadow-md shadow-cyan-500/10 ring-1 ring-amber-400"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isSelected ? "text-amber-300" : "text-slate-200"}`}>
                          {model.title}
                        </span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{model.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Cover Material & Finish */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                2. Engine Cover Composite & Color
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "dry_carbon", label: "Dry Carbon 3K", color: "#1e293b" },
                  { id: "forged_carbon_gold", label: "Forged Gold Flake", color: "#27272a" },
                  { id: "rosso_corsa", label: "Rosso Corsa", color: "#dc2626" },
                  { id: "apex_blue", label: "Monaco Blue", color: "#0284c7" },
                  { id: "giallo_yellow", label: "Giallo Modena", color: "#eab308" },
                  { id: "british_racing_green", label: "British Racing Green", color: "#15803d" },
                  { id: "stealth_black", label: "Stealth Black", color: "#18181b" },
                  { id: "billet_silver", label: "Billet 6061", color: "#94a3b8" },
                  { id: "gold_leaf", label: "24K Gold Leaf", color: "#f59e0b" },
                ].map((item) => {
                  const isSelected = (state.cosmetics?.coverColor || "dry_carbon") === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => engine.updateCosmetics({ coverColor: item.id as EngineCoverColor })}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "bg-slate-800 border-amber-400 ring-1 ring-amber-400 text-slate-100"
                          : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[10px] font-medium truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Cover Bezel & Accent Trim */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                3. Window Bezel & Fastener Accent
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "billet_gold", label: "Billet Gold", color: "#f59e0b" },
                  { id: "titanium_blue", label: "Heat-Blued Ti", color: "#b45309" },
                  { id: "crimson_red", label: "Crimson Red", color: "#dc2626" },
                  { id: "cobalt_blue", label: "Cobalt Blue", color: "#0284c7" },
                  { id: "stealth_black", label: "Stealth Black", color: "#18181b" },
                  { id: "polished_chrome", label: "Mirror Chrome", color: "#f8fafc" },
                ].map((item) => {
                  const isSelected = (state.cosmetics?.coverBezelColor || "billet_gold") === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => engine.updateCosmetics({ coverBezelColor: item.id as EngineCoverBezelColor })}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "bg-slate-800 border-amber-400 ring-1 ring-amber-400 text-slate-100"
                          : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[10px] font-medium truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Exhaust Headers Finish */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                4. Exhaust Header Material & Finish
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    id: "titanium_blued",
                    label: "Titanium Heat-Blued",
                    desc: "Pie-cut welded Grade 5 titanium with vibrant electric blue & purple temper gradient.",
                    color: "#b45309",
                  },
                  {
                    id: "dyno_glow",
                    label: "Dyno Glowing Red-Hot",
                    desc: "Full dyno WOT thermal simulation with emissive red-orange heat radiance.",
                    color: "#ff4500",
                  },
                  {
                    id: "inconel_gold",
                    label: "Inconel 625 Gold",
                    desc: "F1 endurance heat-treated gold/bronze nickel-chromium superalloy.",
                    color: "#d97706",
                  },
                  {
                    id: "ceramic_white",
                    label: "Plasma Ceramic White",
                    desc: "Thermal barrier plasma-sprayed ceramic coating for sub-hood heat reduction.",
                    color: "#f8fafc",
                  },
                  {
                    id: "stealth_black",
                    label: "Satin Black Ceramic",
                    desc: "Military-spec heat insulation coating with stealth matte finish.",
                    color: "#18181b",
                  },
                  {
                    id: "polished_stainless",
                    label: "Mirror Polished 321",
                    desc: "Hand-polished surgical 321 stainless steel runners with mirror reflections.",
                    color: "#e2e8f0",
                  },
                ].map((ex) => {
                  const isSelected = (state.cosmetics?.exhaustFinish || "titanium_blued") === ex.id;
                  return (
                    <button
                      key={ex.id}
                      onClick={() => engine.updateCosmetics({ exhaustFinish: ex.id as ExhaustFinish })}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-slate-800 border-amber-400 ring-1 ring-amber-400 text-slate-100"
                          : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                          style={{ backgroundColor: ex.color }}
                        />
                        <span className="text-[11px] font-bold text-slate-200">{ex.label}</span>
                      </div>
                      <p className="text-[9.5px] text-slate-400 leading-snug">{ex.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Valve Cover Powdercoat */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                5. Valve Cover Powdercoat Color
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "rosso_red", label: "Rosso Red", color: "#dc2626" },
                  { id: "monaco_blue", label: "Monaco Blue", color: "#0284c7" },
                  { id: "acid_yellow", label: "Acid Yellow", color: "#eab308" },
                  { id: "gold_anodized", label: "Gold Anodized", color: "#f59e0b" },
                  { id: "satin_carbon", label: "Satin Carbon", color: "#27272a" },
                  { id: "titanium_gray", label: "Titanium Gray", color: "#64748b" },
                ].map((item) => {
                  const isSelected = (state.cosmetics?.valveCoverColor || "rosso_red") === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => engine.updateCosmetics({ valveCoverColor: item.id as ValveCoverColor })}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "bg-slate-800 border-amber-400 ring-1 ring-amber-400 text-slate-100"
                          : "bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[10px] font-medium truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Custom 3D Badge Lettering & Anodizing Theme */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                6. Custom 3D Laser-Etched Badge & Anodizing
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">3D Badge Text</span>
                  <input
                    type="text"
                    value={state.cosmetics?.badgeEmblemText ?? "APEX V12"}
                    onChange={(e) => engine.updateCosmetics({ badgeEmblemText: e.target.value.toUpperCase() })}
                    placeholder="e.g. APEX V12"
                    maxLength={14}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 font-mono tracking-wider font-bold uppercase focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Hardware Anodizing Theme</span>
                  <select
                    value={state.cosmetics?.anodizingTheme || "anodized_gold"}
                    onChange={(e) => engine.updateCosmetics({ anodizingTheme: e.target.value as AnodizingTheme })}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 font-medium"
                  >
                    <option value="anodized_gold">Billet Gold Anodized</option>
                    <option value="anodized_blue">Cobalt Blue Anodized</option>
                    <option value="anodized_red">Crimson Red Anodized</option>
                    <option value="anodized_black">Stealth Black Ceramic</option>
                    <option value="anodized_titanium">Titanium Natural</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7: DRIVETRAIN & TRANSMISSION SUBSYSTEM                        */}
        {/* ================================================================= */}
        {activeTab === "drivetrain" && dt && (
          <div className="space-y-4">
            {/* Transmission Architecture Selection */}
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-200">Transmission Architecture</span>
                <span className="text-[10px] font-mono text-amber-400 font-bold">{dt.architecture.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "dct_7" as TransmissionArchitectureType, label: "7-Speed DCT", desc: "Lightning 35ms shifts, wet dual-clutch", gears: 7 as const },
                  { id: "manual_6" as TransmissionArchitectureType, label: "6-Speed Manual", desc: "H-pattern, mechanical driver feel", gears: 6 as const },
                  { id: "seq_7" as TransmissionArchitectureType, label: "7-Speed Sequential", desc: "Straight-cut dog-box, race spec", gears: 7 as const },
                  { id: "single_speed" as TransmissionArchitectureType, label: "Single-Speed Direct", desc: "EV reduction box / e-Axle", gears: 1 as const },
                  { id: "cvt" as TransmissionArchitectureType, label: "Sport CVT", desc: "Torque-tracking variable cones", gears: 7 as const },
                ].map((arch) => (
                  <button
                    key={arch.id}
                    onClick={() => {
                      engine.updateDrivetrain({
                        architecture: arch.id,
                        activeGearCount: arch.gears,
                        shiftTimingMs: arch.id === "seq_7" ? 15 : arch.id === "dct_7" ? 35 : arch.id === "single_speed" ? 0 : 120,
                      });
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      dt.architecture === arch.id
                        ? "bg-amber-500/10 border-amber-500/50 text-amber-200 ring-1 ring-amber-500/30"
                        : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="font-bold text-xs">{arch.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{arch.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ratio Auto-Optimizer */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-950/40 via-amber-950/20 to-slate-950/60 rounded-xl border border-amber-500/30">
              <div>
                <div className="text-xs font-bold text-slate-200">Gear Ratio Optimization Engine</div>
                <p className="text-[10px] text-slate-400">Synthesize close-ratio motorsport or wide-ratio highway steps</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const ratios = DrivetrainSolver.suggestGearRatios(
                      state.performance.peakTorqueRpm,
                      state.performance.redlineRpm,
                      dt.activeGearCount,
                      state.turboSystem.type === "naturally_aspirated"
                    );
                    engine.updateDrivetrain({ gearRatios: ratios });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/30 cursor-pointer hover:bg-amber-400"
                >
                  Auto-Optimize Ratios
                </button>
              </div>
            </div>

            {/* Final Drive & Gear Ratios Deck */}
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-200">Final Drive Differential Ratio</span>
                <span className="text-xs font-mono font-bold text-amber-300">{dt.gearRatios.finalDrive.toFixed(2)} : 1</span>
              </div>
              <input
                type="range"
                min={2.20}
                max={5.20}
                step={0.01}
                value={dt.gearRatios.finalDrive}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  engine.updateDrivetrain({
                    gearRatios: { ...dt.gearRatios, finalDrive: val },
                  });
                }}
                className="w-full accent-amber-400"
              />

              {/* Individual Gear Ratios */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                {(["gear1", "gear2", "gear3", "gear4", "gear5", "gear6", "gear7", "gear8"] as (keyof GearRatioSet)[]).slice(0, dt.activeGearCount).map((gearKey, idx) => (
                  <div key={gearKey} className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Gear {idx + 1}</span>
                      <span className="text-amber-300 font-mono">{dt.gearRatios[gearKey]?.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.40}
                      max={5.00}
                      step={0.01}
                      value={dt.gearRatios[gearKey] || 1.0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        engine.updateDrivetrain({
                          gearRatios: { ...dt.gearRatios, [gearKey]: val },
                        });
                      }}
                      className="w-full accent-amber-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Differential & Clutch Metallurgy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* LSD */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase text-slate-200">Limited-Slip Differential</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "e_lsd" as DifferentialType, label: "Electronic e-LSD" },
                    { id: "mechanical_ramp" as DifferentialType, label: "Multi-Plate Ramp" },
                    { id: "viscous" as DifferentialType, label: "Viscous Coupling" },
                    { id: "open" as DifferentialType, label: "Open Diff" },
                  ].map((lsd) => (
                    <button
                      key={lsd.id}
                      onClick={() => engine.updateDrivetrain({ lsdType: lsd.id })}
                      className={`p-2 rounded-lg border text-xs font-bold text-left transition-all cursor-pointer ${
                        dt.lsdType === lsd.id
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {lsd.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clutch Package */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase text-slate-200">Clutch Friction Package</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "carbon_multi_plate" as ClutchMaterialType, label: "Carbon Multi" },
                    { id: "sintered_metallic" as ClutchMaterialType, label: "Sintered Puck" },
                    { id: "organic" as ClutchMaterialType, label: "Organic Road" },
                  ].map((clutch) => (
                    <button
                      key={clutch.id}
                      onClick={() => engine.updateDrivetrain({ clutchType: clutch.id })}
                      className={`p-2 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                        dt.clutchType === clutch.id
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-200"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {clutch.label}
                    </button>
                  ))}
                </div>
                <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Flywheel Mass: <strong className="text-slate-200">{dt.flywheelMassKg} kg</strong></span>
                  <span>Max Input TQ: <strong className="text-amber-300">{dt.maxInputTorqueNm} Nm</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preset Quick Select Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold text-slate-400 uppercase">Preset Architectures:</span>
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: "v8_twin_turbo", label: "4.0L V8 TT" },
            { id: "inline_6_turbo", label: "3.0L I6 T" },
            { id: "v12_naturally_aspirated", label: "6.5L V12" },
            { id: "boxer_6_racing", label: "4.0L Flat-6" },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => engine.loadPreset(preset.id)}
              className="px-2 py-1 text-[10px] font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Torque Curve SVG Chart */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80">
        <div className="text-xs font-bold text-slate-300 uppercase mb-3 flex items-center justify-between">
          <span>Interactive Torque & Power Curve</span>
          <span className="text-[10px] text-amber-400 font-mono">800 – 11,000 RPM</span>
        </div>
        <div className="relative">
          <svg viewBox="0 0 600 160" className="w-full h-40" preserveAspectRatio="xMidYMid meet">
            {/* Grid */}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <line key={`x${i}`} x1={80 + i * 70} y1={10} x2={80 + i * 70} y2={130} stroke="#1e293b" strokeWidth="0.5" />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <line key={`y${i}`} x1={80} y1={10 + i * 30} x2={570} y2={10 + i * 30} stroke="#1e293b" strokeWidth="0.5" />
            ))}

            {/* Peak torque marker */}
            {(() => {
              const rpmRange = [800, 1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500, 10500, 11000];
              const bore = state.block.boreMm;
              const stroke = state.block.strokeMm;
              const base = (bore * bore * stroke * Math.PI * 0.25) / 1000;

              const torqueCurve = rpmRange.map((rpm) => {
                const normalizedRpm = rpm / 8000;
                const shape = Math.sin(normalizedRpm * Math.PI * 0.8) * (1 - 0.15 * Math.pow(normalizedRpm - 0.7, 2));
                return Math.round(base * 12.5 * Math.max(0.2, shape) * ((state.turboSystem?.targetBoostPressureBar ?? 0) > 0 ? 1.3 : 1));
              });

              const maxTq = Math.max(...torqueCurve);
              const peakIdx = torqueCurve.indexOf(maxTq);

              const powerCurve = rpmRange.map((rpm, i) => Math.round(torqueCurve[i] * rpm / 9549));
              const maxHp = Math.max(...powerCurve);

              const pointsToPath = (data: number[], maxVal: number) => {
                return data.map((val, i) => {
                  const x = 80 + (i / (data.length - 1)) * 490;
                  const y = 130 - (val / (maxVal * 1.2)) * 120;
                  return `${i === 0 ? "M" : "L"}${x},${y}`;
                }).join(" ");
              };

              return (
                <>
                  {/* Torque curve */}
                  <path d={pointsToPath(torqueCurve, maxTq)} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d={pointsToPath(torqueCurve, maxTq) + ` L570,130 L80,130 Z`} fill="url(#torqueGrad)" opacity="0.2" />

                  {/* Power curve */}
                  <path d={pointsToPath(powerCurve, maxHp)} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3" strokeLinejoin="round" />

                  {/* Peak markers */}
                  {(() => {
                    const peakX = 80 + (peakIdx / (rpmRange.length - 1)) * 490;
                    const peakY = 130 - (maxTq / (maxTq * 1.2)) * 120;
                    return (
                      <>
                        <circle cx={peakX} cy={peakY} r="4" fill="#f59e0b" stroke="#0e7490" strokeWidth="2" />
                        <text x={peakX} y={peakY - 10} textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold" fontFamily="monospace">
                          {maxTq} Nm
                        </text>
                      </>
                    );
                  })()}

                  {/* RPM labels */}
                  {[800, 2000, 4000, 6000, 8000, 10000].map((rpm, i) => (
                    <text key={rpm} x={80 + (i / 5) * 490} y={148} textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
                      {(rpm / 1000).toFixed(1)}k
                    </text>
                  ))}

                  <defs>
                    <linearGradient id="torqueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="1" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Legend */}
                  <line x1={85} y1={20} x2={105} y2={20} stroke="#f59e0b" strokeWidth="2.5" />
                  <text x={110} y={24} fill="#94a3b8" fontSize="9" fontFamily="sans-serif">Torque (Nm)</text>
                  <line x1={185} y1={20} x2={205} y2={20} stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 3" />
                  <text x={210} y={24} fill="#94a3b8" fontSize="9" fontFamily="sans-serif">Power (HP)</text>
                </>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Component Health Monitor Strip */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80">
        <div className="text-xs font-bold text-slate-300 uppercase mb-3">Component Health Monitor</div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: "Pistons", stress: Math.min(100, Math.round(state.block.boreMm * 1.2 + ((state.turboSystem?.targetBoostPressureBar ?? 0) * 15))) },
            { label: "Crankshaft", stress: Math.min(100, Math.round(state.block.strokeMm * 0.9 + ((state.crankshaft.massKg ?? 15) * 1.5))) },
            { label: "Camshaft", stress: Math.min(100, Math.round(((state.valvesAndSprings?.openPressureLbs ?? 200) * 0.1) + ((state.turboSystem?.targetBoostPressureBar ?? 0) * 10))) },
            { label: "Turbo", stress: Math.min(100, Math.round((state.turboSystem?.targetBoostPressureBar ?? 0) * 28)) },
            { label: "Bearings", stress: Math.min(100, Math.round(state.block.boreMm * 0.7 + ((state.crankshaft.strokeMm ?? 80) * 0.3))) },
          ].map((c) => (
            <div key={c.label} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-1.5">
              <div className="text-[10px] font-bold text-slate-300 uppercase">{c.label}</div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    c.stress > 85 ? "bg-gradient-to-r from-rose-500 to-red-400" :
                    c.stress > 60 ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                    "bg-gradient-to-r from-emerald-500 to-green-400"
                  }`}
                  style={{ width: `${c.stress}%` }}
                />
              </div>
              <div className={`text-[10px] font-mono font-bold ${
                c.stress > 85 ? "text-rose-400" : c.stress > 60 ? "text-amber-400" : "text-emerald-400"
              }`}>
                {c.stress}% Stress
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ModularEngineStudioWorkbench = React.memo(ModularEngineStudioWorkbenchComponent);
