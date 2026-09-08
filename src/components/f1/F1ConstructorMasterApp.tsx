// ============================================================================
// F1 CONSTRUCTOR MASTER APPLICATION — UNIFIED WORKSHOP & RACE EXPERIENCE
// ============================================================================

import React, { useState, memo, useCallback } from "react";
import { F1ModularComponentBrowser } from "./modular/F1ModularComponentBrowser";
import { F1ModularAssemblyViewport } from "./3d/F1ModularAssemblyViewport";
import { F1LivePhysicsHUD } from "./modular/F1LivePhysicsHUD";
import { F1DeepRDLab } from "./studios/F1DeepRDLab";
import { F1GarageSetupStudio, type F1RaceWeekendSetup } from "./garage/F1GarageSetupStudio";
import { F1LiveRaceSimulator } from "./racing/F1LiveRaceSimulator";
import { RealCar100BenchmarkStudio } from "../hypercar/benchmark/RealCar100BenchmarkStudio";
import { F1_CIRCUITS, type F1Circuit } from "../../sim/f1/season/f1Calendar";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";
import { useF1WorkflowStore, F1_WORKFLOW_STAGES, type F1WorkflowStage } from "../../sim/f1/state/f1WorkflowStore";
import { Wrench, SlidersHorizontal, Flag, Sparkles, Trophy, FlaskConical, Lock, CheckCircle2, AlertTriangle, ChevronRight, RotateCcw } from "lucide-react";

export type F1WorkshopMode = "CONSTRUCTION_CAD" | "RD_LABS" | "GARAGE_SETUP" | "LIVE_RACE" | "BENCHMARKS";

export const DEFAULT_F1_SETUP: F1RaceWeekendSetup = {
  frontWingFlapAngleDeg: 28,
  rearWingFlapAngleDeg: 34,
  frontRideHeightMm: 30,
  rearRideHeightMm: 38,
  antiRollBarFrontIndex: 6,
  antiRollBarRearIndex: 4,
  differentialOnThrottlePercent: 65,
  differentialOffThrottlePercent: 50,
  brakeBiasPercentFront: 54.5,
  selectedTireCompound: "SOFT",
  ersDeploymentStrategy: "QUALIFYING_HOTLAP",
};

interface F1ConstructorMasterAppProps {
  onBackToMainMotorsport?: () => void;
  initialMode?: F1WorkshopMode;
}

const F1ConstructorMasterAppComponent: React.FC<F1ConstructorMasterAppProps> = ({
  onBackToMainMotorsport,
  initialMode = "CONSTRUCTION_CAD",
}) => {
  const [currentMode, setCurrentMode] = useState<F1WorkshopMode>(initialMode);
  const [selectedCircuit, setSelectedCircuit] = useState<F1Circuit>(F1_CIRCUITS[0]);
  const [activeSetup, setActiveSetup] = useState<F1RaceWeekendSetup>(DEFAULT_F1_SETUP);
  const workflow = useF1WorkflowStore();

  const stageOrder: F1WorkflowStage[] = ["power_unit", "chassis", "aero", "cockpit", "final_build"];

  const getStageStatus = useCallback((stage: F1WorkflowStage) => {
    switch (stage) {
      case "power_unit": return workflow.powerUnitStatus;
      case "chassis": return workflow.chassisStatus;
      case "aero": return workflow.aeroStatus;
      case "cockpit": return workflow.cockpitStatus;
      case "final_build": return workflow.finalBuildStatus;
    }
  }, [workflow]);

  const handleStartRace = (circuit: F1Circuit, setup: F1RaceWeekendSetup) => {
    playHMIClickSound();
    setSelectedCircuit(circuit);
    setActiveSetup(setup);
    setCurrentMode("LIVE_RACE");
  };

  return (
    <div className="w-full min-h-[750px] h-[calc(100vh-200px)] flex flex-col bg-slate-900/80 select-none overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
      {/* Top Universal Mode Switcher & Exit Bar */}
      <div className="px-5 py-2.5 bg-zinc-950/95 border-b border-white/10 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          {onBackToMainMotorsport && (
            <button
              onClick={() => {
                playHMIClickSound();
                onBackToMainMotorsport();
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              ← Exit to Motorsport Hub
            </button>
          )}
          <div className="h-4 w-px bg-white/20" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            FIA Formula 1 Construction Studio
          </span>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playHMITabSound();
              setCurrentMode("CONSTRUCTION_CAD");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentMode === "CONSTRUCTION_CAD"
                ? "bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-sm"
                : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>3D CAD Assembly</span>
          </button>

          <button
            onClick={() => {
              playHMITabSound();
              setCurrentMode("RD_LABS");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentMode === "RD_LABS"
                ? "bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-sm"
                : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
            <span>Deep R&D Laboratories</span>
          </button>

          <button
            onClick={() => {
              playHMITabSound();
              setCurrentMode("GARAGE_SETUP");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentMode === "GARAGE_SETUP"
                ? "bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-sm"
                : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Garage & Setup</span>
          </button>

          <button
            onClick={() => {
              playHMITabSound();
              setCurrentMode("LIVE_RACE");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentMode === "LIVE_RACE"
                ? "bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 shadow-sm"
                : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Live GP Race</span>
          </button>

          <button
            onClick={() => {
              playHMITabSound();
              setCurrentMode("BENCHMARKS");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentMode === "BENCHMARKS"
                ? "bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-sm"
                : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>100 Real Car Benchmarks</span>
          </button>
        </div>
      </div>

      {/* ── Sequential Workflow Stepper Bar ── */}
      <div className="px-4 py-2 bg-zinc-950/80 border-b border-amber-500/20 flex items-center gap-1">
        <div className="flex items-center gap-1.5 mr-3">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold">Build From Zero</span>
        </div>
        <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-none">
          {stageOrder.map((stageId, idx) => {
            const meta = F1_WORKFLOW_STAGES[stageId];
            const status = getStageStatus(stageId);
            const gate = workflow.canEnterStage(stageId);
            const isLocked = !gate.allowed;
            const isActive = workflow.activeConstructionStage === stageId;

            let badgeBg = "bg-zinc-900 border-slate-700 text-slate-500";
            let statusText = "LOCKED";
            let StatusIcon = Lock;

            if (status === "configured") {
              badgeBg = "bg-emerald-950 border-emerald-500/50 text-emerald-400";
              statusText = "DONE";
              StatusIcon = CheckCircle2;
            } else if (status === "invalidated") {
              badgeBg = "bg-amber-950 border-amber-500/50 text-amber-400 animate-pulse";
              statusText = "RECALC";
              StatusIcon = AlertTriangle;
            } else if (status === "configuring") {
              badgeBg = "bg-amber-950/30 border-amber-500/40 text-amber-300";
              statusText = "BUILDING";
            } else if (!isLocked) {
              badgeBg = "bg-cyan-950/20 border-cyan-500/40 text-cyan-400";
              statusText = "READY";
            }

            return (
              <React.Fragment key={stageId}>
                <button
                  type="button"
                  onClick={() => {
                    playHMITabSound();
                    workflow.setActiveConstructionStage(stageId);
                  }}
                  disabled={isLocked}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "border-amber-400 bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/50"
                      : isLocked
                      ? "border-slate-800 bg-slate-950/50 text-slate-600 opacity-50 cursor-not-allowed"
                      : badgeBg + " hover:border-amber-400/50"
                  }`}
                  title={isLocked ? gate.reason : `Go to ${meta.label}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  <span>{meta.number}. {meta.shortLabel}</span>
                  <span className="text-[8px] opacity-70">{statusText}</span>
                </button>
                {idx < stageOrder.length - 1 && (
                  <ChevronRight className={`w-3 h-3 shrink-0 ${
                    status === "configured" ? "text-emerald-500" : "text-slate-700"
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => { playHMIClickSound(); workflow.resetAll(); }}
          title="Reset to bare chassis"
          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:border-rose-500/50 hover:text-rose-300 transition-all text-[10px] font-mono cursor-pointer ml-2"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Zero
        </button>
      </div>

      {/* Mode Viewports */}
      {currentMode === "CONSTRUCTION_CAD" && (
        <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Main 3D CAD Studio Layout */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Left: 20-Socket Modular Component Inspector */}
            <F1ModularComponentBrowser />

            {/* Center / Right: Interactive 3D WebGL Viewport */}
            <div className="flex-1 h-full relative">
              <F1ModularAssemblyViewport />
            </div>
          </div>

          {/* Bottom Live Physics, Aerodynamics & Homologation HUD */}
          <F1LivePhysicsHUD onProceedToSetup={() => setCurrentMode("GARAGE_SETUP")} />
        </div>
      )}

      {currentMode === "RD_LABS" && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <F1DeepRDLab />
        </div>
      )}

      {currentMode === "GARAGE_SETUP" && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <F1GarageSetupStudio
            onBackToAssembly={() => setCurrentMode("CONSTRUCTION_CAD")}
            onStartRace={handleStartRace}
          />
        </div>
      )}

      {currentMode === "LIVE_RACE" && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <F1LiveRaceSimulator
            circuit={selectedCircuit}
            setup={activeSetup}
            onExitSession={() => setCurrentMode("GARAGE_SETUP")}
          />
        </div>
      )}

      {currentMode === "BENCHMARKS" && (
        <div className="w-full flex-1 flex flex-col min-h-0 overflow-y-auto p-4 bg-slate-900/80">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 shrink-0">
            <h2 className="text-sm font-black uppercase tracking-widest text-amber-400">
              100 Real-World Sports Car Benchmark & Simulation Validation Suite
            </h2>
            <button
              onClick={() => setCurrentMode("CONSTRUCTION_CAD")}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              ← Back to Assembly CAD
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <RealCar100BenchmarkStudio />
          </div>
        </div>
      )}
    </div>
  );
};

export const F1ConstructorMasterApp = React.memo(F1ConstructorMasterAppComponent);
export default F1ConstructorMasterApp;

