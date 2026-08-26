/**
 * ============================================================================
 * UNIFIED POWERTRAIN STUDIO — ENGINE + TRANSMISSION FLOW CHAIN
 * ============================================================================
 * Master container merging the Engine Studio and Transmission Studio into a
 * single cohesive design surface with 5 studio modes:
 * 1. Engine 3D Studio — procedural engine construction & workbench
 * 2. Transmission 3D Studio — coupled transmission with live engine data
 * 3. Coupled Dyno — engine crank + per-gear wheel torque overlaid
 * 4. Engine A/B Compare — side-by-side engine comparison
 * 5. Powertrain Summary — combined BOM, mass, compatibility
 *
 * Features a Flow Chain Progress Bar and Live Torque Handoff ribbon.
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import {
  Flame,
  Cog,
  Layers,
  Activity,
  Scale,
  Undo2,
  Redo2,
  Download,
  Zap,
  ArrowRight,
  Gauge,
  CheckCircle2,
  ChevronRight,
  Radio,
} from "lucide-react";
import { MasterEngineStateEngine } from "../../sim/engine/masterEngineStateEngine";
import type { MasterEngineState } from "../../sim/engine/masterEngineTypes";
import { ModularEngine3DViewport } from "../engineStudio/ModularEngine3DViewport";
import { ModularEngineStudioWorkbench } from "../engineStudio/ModularEngineStudioWorkbench";
import { ModularEngineDynoBench } from "../engineStudio/ModularEngineDynoBench";
import { ModularEngineComparisonStudio } from "../engineStudio/ModularEngineComparisonStudio";
import { Transmission3DStudio } from "../transmissionStudio/Transmission3DStudio";
import { CoupledDynoBench } from "./CoupledDynoBench";
import { PowertrainSummaryPanel } from "./PowertrainSummaryPanel";
import { AdvancedEngineTelemetryStudio } from "../engineStudio/AdvancedEngineTelemetryStudio";

type PowertrainStudioMode =
  | "engine_3d"
  | "transmission_3d"
  | "coupled_dyno"
  | "compare"
  | "summary"
  | "advanced_telemetry";

// Flow chain steps for the progress bar
const FLOW_CHAIN_STEPS = [
  { id: "arch", label: "Architecture", short: "ARCH" },
  { id: "block", label: "Short Block", short: "BLK" },
  { id: "heads", label: "Heads", short: "HD" },
  { id: "turbo", label: "Turbo", short: "FI" },
  { id: "exhaust", label: "Exhaust", short: "EXH" },
  { id: "ecu", label: "ECU", short: "ECU" },
  { id: "trans", label: "Transmission", short: "TRN" },
  { id: "diff", label: "Differential", short: "DIF" },
  { id: "validate", label: "Validation", short: "VAL" },
];

export const UnifiedPowertrainStudio: React.FC = () => {
  const [engineInstance] = useState(() => MasterEngineStateEngine.getInstance());
  const [state, setState] = useState<MasterEngineState>(engineInstance.getState());
  const [studioMode, setStudioMode] = useState<PowertrainStudioMode>("engine_3d");

  useEffect(() => {
    const unsubscribe = engineInstance.subscribe((newState) => {
      setState({ ...newState });
    });
    return () => unsubscribe();
  }, [engineInstance]);

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.id || "powertrain_spec"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Determine flow chain completion status
  const getFlowChainProgress = (): number => {
    let completed = 0;
    if (state.architecture.cylinderCount > 0) completed++;
    if (state.block.boreMm > 0) completed++;
    if (state.cylinderHeads.valvetrain) completed++;
    if (state.turboSystem.type) completed++;
    if (state.exhaust.headerStyle) completed++;
    if (state.tuning.revLimiterRpm > 0) completed++;
    if (state.drivetrain?.architecture) completed++;
    if (state.drivetrain?.lsdType) completed++;
    if (state.compatibility?.isMechanicallySafe !== undefined) completed++;
    return completed;
  };

  const flowProgress = getFlowChainProgress();
  const dp = state.drivetrainPerformance;

  return (
    <div className="flex flex-col h-full w-full space-y-3 p-2 sm:p-4">
      {/* ================================================================= */}
      {/* STUDIO HEADER — TITLE, MODE SWITCHER, ACTIONS */}
      {/* ================================================================= */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-600 text-slate-950 shadow-lg shadow-cyan-500/25">
            <Flame size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Unified Powertrain Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                FLOW CHAIN
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Engine → Forced Induction → Transmission → Wheels • Single-source-of-truth coupled physics
            </p>
          </div>
        </div>

        {/* Mode Tabs + Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            {[
              { id: "engine_3d" as const, label: "Engine 3D", icon: <Flame size={13} /> },
              { id: "transmission_3d" as const, label: "Transmission", icon: <Cog size={13} /> },
              { id: "coupled_dyno" as const, label: "Coupled Dyno", icon: <Activity size={13} /> },
              { id: "advanced_telemetry" as const, label: "Telemetry & ECU 3D", icon: <Radio size={13} /> },
              { id: "compare" as const, label: "Compare", icon: <Scale size={13} /> },
              { id: "summary" as const, label: "Summary", icon: <Layers size={13} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStudioMode(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  studioMode === tab.id
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => engineInstance.undo()}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
              title="Undo"
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={() => engineInstance.redo()}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
              title="Redo"
            >
              <Redo2 size={14} />
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* FLOW CHAIN PROGRESS BAR */}
      {/* ================================================================= */}
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-950/70 rounded-xl border border-slate-800 overflow-x-auto">
        {FLOW_CHAIN_STEPS.map((step, i) => {
          const isCompleted = i < flowProgress;
          const isCurrent = i === flowProgress;
          return (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all ${
                  isCompleted
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : isCurrent
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse"
                    : "bg-slate-800/50 text-slate-500 border border-slate-800"
                }`}
              >
                {isCompleted && <CheckCircle2 size={10} />}
                <span>{step.short}</span>
              </div>
              {i < FLOW_CHAIN_STEPS.length - 1 && (
                <ChevronRight size={10} className={isCompleted ? "text-emerald-500" : "text-slate-700"} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ================================================================= */}
      {/* LIVE TORQUE HANDOFF CONTEXT RIBBON */}
      {/* ================================================================= */}
      <div className="flex items-center gap-4 px-4 py-2 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] font-mono overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <Flame size={11} className="text-orange-400" />
          <span className="text-slate-400">Crank:</span>
          <span className="text-orange-300 font-bold">{state.performance.peakHorsepowerHp} HP</span>
          <span className="text-slate-600">/</span>
          <span className="text-amber-300 font-bold">{state.performance.peakTorqueNm} Nm</span>
        </div>
        <ArrowRight size={11} className="text-cyan-500" />
        <div className="flex items-center gap-1.5">
          <Cog size={11} className="text-cyan-400" />
          <span className="text-slate-400">G1 Ratio:</span>
          <span className="text-cyan-300 font-bold">{state.drivetrain?.gearRatios.gear1 ?? "—"}</span>
          <span className="text-slate-600">× FD:</span>
          <span className="text-cyan-300 font-bold">{state.drivetrain?.gearRatios.finalDrive ?? "—"}</span>
        </div>
        <ArrowRight size={11} className="text-emerald-500" />
        <div className="flex items-center gap-1.5">
          <Gauge size={11} className="text-emerald-400" />
          <span className="text-slate-400">Wheels:</span>
          <span className="text-emerald-300 font-bold">{dp?.peakWheelHorsepowerHp ?? "—"} WHP</span>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-300 font-bold">{dp?.peakWheelTorqueNm ?? "—"} Nm</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-violet-300">
          <Zap size={11} />
          <span className="font-bold">0-60: {dp?.estimatedZeroTo60Sec ?? "—"}s</span>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MAIN STUDIO CONTENT */}
      {/* ================================================================= */}
      <div className="flex-1 w-full min-h-[640px]">
        {/* ENGINE 3D STUDIO */}
        {studioMode === "engine_3d" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            <div className="lg:col-span-7 h-full">
              <ModularEngine3DViewport state={state} />
            </div>
            <div className="lg:col-span-5 h-full">
              <ModularEngineStudioWorkbench state={state} engine={engineInstance} />
            </div>
          </div>
        )}

        {/* TRANSMISSION 3D STUDIO (COUPLED) */}
        {studioMode === "transmission_3d" && (
          <div className="w-full h-full">
            <Transmission3DStudio
              engineConfig={{
                bore: state.block.boreMm,
                stroke: state.block.strokeMm,
                compressionRatio: state.performance.staticCompressionRatio,
                rpmLimiter: state.performance.redlineRpm,
                layout: `${state.architecture.family === "v_engine" ? "v" : state.architecture.family === "inline" ? "i" : state.architecture.family}${state.architecture.cylinderCount}` as any,
              } as any}
              sim={{
                peakTorque: state.performance.peakTorqueNm,
                peakPower: state.performance.peakHorsepowerHp,
              } as any}
            />
          </div>
        )}

        {/* COUPLED DYNO BENCH */}
        {studioMode === "coupled_dyno" && (
          <div className="w-full h-full">
            <CoupledDynoBench state={state} />
          </div>
        )}

        {/* ENGINE A/B COMPARISON */}
        {studioMode === "compare" && (
          <div className="w-full h-full">
            <ModularEngineComparisonStudio currentEngine={state} stateEngine={engineInstance} />
          </div>
        )}

        {/* ADVANCED TELEMETRY & ECU 3D MAP STUDIO */}
        {studioMode === "advanced_telemetry" && (
          <div className="w-full h-full">
            <AdvancedEngineTelemetryStudio state={state} engine={engineInstance} />
          </div>
        )}

        {/* POWERTRAIN SUMMARY */}
        {studioMode === "summary" && (
          <div className="w-full h-full">
            <PowertrainSummaryPanel state={state} />
          </div>
        )}
      </div>
    </div>
  );
};
