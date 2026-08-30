/**
 * ============================================================================
 * MODULAR ENGINE STUDIO — FLAGSHIP STUDIO CONTAINER
 * ============================================================================
 * Connects the Master Engine State Engine, 3D WebGL Viewport, 5-Tab Workbench,
 * Virtual Dyno Bench, and Side-by-Side Comparison Studio into a seamless,
 * ultra-high-fidelity engine engineering suite.
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import {
  Cog,
  Layers,
  Activity,
  Scale,
  Undo2,
  Redo2,
  Download,
  Upload,
  Save,
  Sparkles,
  Flame,
  Zap,
} from "lucide-react";
import { MasterEngineStateEngine } from "../../sim/engine/masterEngineStateEngine";
import { MasterEngineState } from "../../sim/engine/masterEngineTypes";
import { ModularEngine3DViewport } from "./ModularEngine3DViewport";
import { ModularEngineStudioWorkbench } from "./ModularEngineStudioWorkbench";
import { ModularEngineDynoBench } from "./ModularEngineDynoBench";
import { ModularEngineComparisonStudio } from "./ModularEngineComparisonStudio";
import { Transmission3DStudio } from "../transmissionStudio/Transmission3DStudio";

export const ModularEngineStudio: React.FC = () => {
  const [engineInstance] = useState(() => MasterEngineStateEngine.getInstance());
  const [state, setState] = useState<MasterEngineState>(engineInstance.getState());
  const [studioMode, setStudioMode] = useState<"viewport" | "dyno" | "transmission" | "compare">("viewport");

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
    a.download = `${state.id || "engine_spec"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full w-full space-y-4 p-2 sm:p-4">
      {/* Studio Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-cyan-500/25 font-bold">
            <Flame size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Modular 3D Engine Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                PRO STUDIO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Single-source-of-truth procedural engine construction, 4-stroke kinematics & dyno
            </p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 flex-wrap gap-1">
            {[
              { id: "viewport", label: "3D Engine", icon: <Layers size={13} /> },
              { id: "dyno", label: "Crank Dyno", icon: <Activity size={13} /> },
              { id: "transmission", label: "3D Transmission", icon: <Cog size={13} /> },
              { id: "compare", label: "Compare A/B", icon: <Scale size={13} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStudioMode(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  studioMode === tab.id
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30"
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
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
              title="Undo Parameter Change"
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={() => engineInstance.redo()}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
              title="Redo Parameter Change"
            >
              <Redo2 size={14} />
            </button>
          </div>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            title="Export Engine Spec to JSON"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Studio Work Area */}
      <div className="flex-1 w-full min-h-[640px]">
        {studioMode === "viewport" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            <div className="lg:col-span-7 h-full">
              <ModularEngine3DViewport state={state} />
            </div>
            <div className="lg:col-span-5 h-full">
              <ModularEngineStudioWorkbench state={state} engine={engineInstance} />
            </div>
          </div>
        )}

        {studioMode === "dyno" && (
          <div className="w-full h-full">
            <ModularEngineDynoBench state={state} />
          </div>
        )}

        {studioMode === "transmission" && (
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

        {studioMode === "compare" && (
          <div className="w-full h-full">
            <ModularEngineComparisonStudio currentEngine={state} stateEngine={engineInstance} />
          </div>
        )}
      </div>
    </div>
  );
};
