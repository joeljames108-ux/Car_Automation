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
} from "../../sim/engine/masterEngineTypes";
import { MasterEngineStateEngine } from "../../sim/engine/masterEngineStateEngine";

interface ModularEngineStudioWorkbenchProps {
  state: MasterEngineState;
  engine: MasterEngineStateEngine;
}

export const ModularEngineStudioWorkbench: React.FC<ModularEngineStudioWorkbenchProps> = ({
  state,
  engine,
}) => {
  const [activeTab, setActiveTab] = useState<"block" | "heads" | "turbo" | "tuning" | "safety">("block");

  const compat = state.compatibility;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* 5-Tab Navigation Bar */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1 overflow-x-auto">
        {[
          { id: "block", label: "Short Block", icon: <Cog size={13} /> },
          { id: "heads", label: "Heads & Cams", icon: <Layers size={13} /> },
          { id: "turbo", label: "Turbo & Exhaust", icon: <Flame size={13} /> },
          { id: "tuning", label: "ECU Tuning", icon: <Cpu size={13} /> },
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
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
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
              <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
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
                  <span className="font-mono text-cyan-300">{state.block.boreMm} mm</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="102"
                  step="0.5"
                  value={state.block.boreMm}
                  onChange={(e) => engine.updateBlock({ boreMm: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Piston Stroke</span>
                  <span className="font-mono text-cyan-300">{state.block.strokeMm} mm</span>
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
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Connecting Rod Length (Center-to-Center)</span>
                  <span className="font-mono text-cyan-300">{state.connectingRods.rodLengthMm} mm</span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="170"
                  step="0.5"
                  value={state.connectingRods.rodLengthMm}
                  onChange={(e) => engine.updateConnectingRods({ rodLengthMm: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
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
              <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  Camshaft Profile
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {state.camshafts.intakeDurationAdvDeg}° / {state.camshafts.intakeLiftMm}mm
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Intake Duration</span>
                  <span className="font-mono text-cyan-300">{state.camshafts.intakeDurationAdvDeg}°</span>
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
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Intake Lift</span>
                  <span className="font-mono text-cyan-300">{state.camshafts.intakeLiftMm} mm</span>
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
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
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
        {/* TAB 3: FORCED INDUCTION & EXHAUST */}
        {/* ================================================================= */}
        {activeTab === "turbo" && (
          <div className="space-y-4">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Aspiration & Forced Induction
              </label>
              <select
                value={state.turboSystem.type}
                onChange={(e) =>
                  engine.updateTurboSystem({
                    type: e.target.value as ForcedInductionType,
                    turboCount:
                      e.target.value === "naturally_aspirated"
                        ? 0
                        : e.target.value === "single_twin_scroll_turbo"
                        ? 1
                        : 2,
                  })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
              >
                <option value="naturally_aspirated">Naturally Aspirated (High RPM)</option>
                <option value="single_twin_scroll_turbo">Single Twin-Scroll Turbo</option>
                <option value="twin_turbo_parallel">Twin Turbo Parallel</option>
                <option value="hot_v_twin_turbo">Hot-V Twin Turbo (Short Spool)</option>
                <option value="roots_twin_screw_supercharger">Twin-Screw Supercharger</option>
              </select>
            </div>

            {state.turboSystem.type !== "naturally_aspirated" && (
              <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    Boost Target
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {state.turboSystem.targetBoostPressureBar} bar (
                    {Math.round(state.turboSystem.targetBoostPressureBar * 14.5)} psi)
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.2"
                  step="0.05"
                  value={state.turboSystem.targetBoostPressureBar}
                  onChange={(e) =>
                    engine.updateTurboSystem({ targetBoostPressureBar: parseFloat(e.target.value) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />

                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Compressor Inducer</span>
                  <span className="font-mono text-cyan-300">
                    {state.turboSystem.compressorInducerMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="48"
                  max="88"
                  step="1"
                  value={state.turboSystem.compressorInducerMm}
                  onChange={(e) =>
                    engine.updateTurboSystem({ compressorInducerMm: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            )}

            {/* Exhaust Header Style */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Exhaust Headers
              </label>
              <select
                value={state.exhaust.headerStyle}
                onChange={(e) =>
                  engine.updateExhaust({ headerStyle: e.target.value as ExhaustHeaderStyle })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
              >
                <option value="cast_iron_log">Cast Iron Log</option>
                <option value="shorty_tuned_tubular">Shorty Tuned Tubular</option>
                <option value="equal_length_long_tube">Equal-Length Long Tube</option>
                <option value="inconel_pie_cut_hot_v">Inconel Pie-Cut Race</option>
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
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
                <label className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  Ignition Advance (WOT)
                </label>
                <span className="text-xs font-mono font-bold text-cyan-300">
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
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
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
                      : "bg-amber-950/30 border-amber-800/60"
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
                  <p className="text-[10px] text-cyan-300/90 font-medium">
                    💡 Remedy: {v.recommendedRemedy}
                  </p>
                </div>
              ))
            )}
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
          <span className="text-[10px] text-cyan-400 font-mono">800 – 11,000 RPM</span>
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
                  <path d={pointsToPath(torqueCurve, maxTq)} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d={pointsToPath(torqueCurve, maxTq) + ` L570,130 L80,130 Z`} fill="url(#torqueGrad)" opacity="0.2" />

                  {/* Power curve */}
                  <path d={pointsToPath(powerCurve, maxHp)} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 3" strokeLinejoin="round" />

                  {/* Peak markers */}
                  {(() => {
                    const peakX = 80 + (peakIdx / (rpmRange.length - 1)) * 490;
                    const peakY = 130 - (maxTq / (maxTq * 1.2)) * 120;
                    return (
                      <>
                        <circle cx={peakX} cy={peakY} r="4" fill="#06b6d4" stroke="#0e7490" strokeWidth="2" />
                        <text x={peakX} y={peakY - 10} textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold" fontFamily="monospace">
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
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Legend */}
                  <line x1={85} y1={20} x2={105} y2={20} stroke="#06b6d4" strokeWidth="2.5" />
                  <text x={110} y={24} fill="#94a3b8" fontSize="9" fontFamily="sans-serif">Torque (Nm)</text>
                  <line x1={185} y1={20} x2={205} y2={20} stroke="#a855f7" strokeWidth="2" strokeDasharray="6 3" />
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
