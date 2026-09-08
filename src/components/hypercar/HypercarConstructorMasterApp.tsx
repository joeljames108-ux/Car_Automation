// ============================================================================
// HYPERCAR CONSTRUCTOR MASTER APPLICATION WRAPPER — UNIFIED WEC 24H SUITE
// ============================================================================

import React, { useState, memo, useCallback } from "react";
import { HypercarModularAssemblyViewport } from "./3d/HypercarModularAssemblyViewport";
import { HypercarComponentBrowser } from "./modular/HypercarComponentBrowser";
import { HypercarLivePhysicsHUD } from "./modular/HypercarLivePhysicsHUD";
import { HypercarDeepRDLab } from "./studios/HypercarDeepRDLab";
import { HypercarGarageSetupStudio, type HypercarGarageSetup } from "./garage/HypercarGarageSetupStudio";
import { HypercarLiveRaceSimulator } from "./racing/HypercarLiveRaceSimulator";
import { RealCar100BenchmarkStudio } from "./benchmark/RealCar100BenchmarkStudio";
import { WEC_CIRCUITS, type WECCircuitProfile } from "../../sim/hypercar/season/wecCalendar";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";
import { useHypercarWorkflowStore, HYPERCAR_WORKFLOW_STAGES, type HypercarWorkflowStage } from "../../sim/hypercar/state/hypercarWorkflowStore";
import { Wrench, SlidersHorizontal, Flag, Sparkles, Trophy, ShieldAlert, FlaskConical, Lock, CheckCircle2, AlertTriangle, ChevronRight, RotateCcw } from "lucide-react";

export type HypercarAppScreen = "assembly" | "rd_labs" | "garage" | "racing" | "benchmark";

interface HypercarConstructorMasterAppProps {
  onBackToMainMotorsport?: () => void;
  initialMode?: HypercarAppScreen;
}

const HypercarConstructorMasterAppComponent: React.FC<HypercarConstructorMasterAppProps> = ({
  onBackToMainMotorsport,
  initialMode = "assembly",
}) => {
  const [screen, setScreen] = useState<HypercarAppScreen>(initialMode);
  const [activeCircuit, setActiveCircuit] = useState<WECCircuitProfile>(WEC_CIRCUITS[0]);
  const workflow = useHypercarWorkflowStore();
  const [activeSetup, setActiveSetup] = useState<HypercarGarageSetup>({
    rearWingAngleDeg: 6.5,
    frontRideHeightMm: 50,
    rearRideHeightMm: 62,
    frontMguDeploySpeedKmh: 120,
    brakeDuctTapePercent: 15,
    tireCompound: "MEDIUM_DOUBLE_STINT",
    ersDeployMode: "ENDURANCE_BALANCED",
  });

  const handleStartRace = (circuit: WECCircuitProfile, setup: HypercarGarageSetup) => {
    playHMIClickSound();
    setActiveCircuit(circuit);
    setActiveSetup(setup);
    setScreen("racing");
  };

  return (
    <div className="w-full min-h-[750px] h-[calc(100vh-200px)] flex flex-col bg-slate-900/80 text-white relative overflow-hidden select-none rounded-2xl border border-white/10 shadow-2xl">
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
            FIA WEC Hypercar Construction Studio
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playHMITabSound();
              setScreen("assembly");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              screen === "assembly"
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
              setScreen("rd_labs");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              screen === "rd_labs"
                ? "bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-sm"
                : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
            <span>Carbotanium FEA & R&D</span>
          </button>

          <button
            onClick={() => {
              playHMITabSound();
              setScreen("garage");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              screen === "garage"
                ? "bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-sm"
                : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>24H Le Mans Setup</span>
          </button>

          <button
            onClick={() => {
              playHMITabSound();
              setScreen("racing");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              screen === "racing"
                ? "bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 shadow-sm"
                : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Live 24H Endurance</span>
          </button>

          <button
            onClick={() => {
              playHMITabSound();
              setScreen("benchmark");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              screen === "benchmark"
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
          {(["power_unit", "monocoque", "aero", "cockpit", "final_build"] as HypercarWorkflowStage[]).map((stageId, idx) => {
            const meta = HYPERCAR_WORKFLOW_STAGES[stageId];
            const getStatus = (s: HypercarWorkflowStage) => {
              switch (s) {
                case "power_unit": return workflow.powerUnitStatus;
                case "monocoque": return workflow.monocoqueStatus;
                case "aero": return workflow.aeroStatus;
                case "cockpit": return workflow.cockpitStatus;
                case "final_build": return workflow.finalBuildStatus;
              }
            };
            const status = getStatus(stageId);
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
                {idx < 4 && (
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

      {/* Screen Viewports */}
      {screen === "assembly" && (
        <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Center 3D Assembly + Sidebar */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            <HypercarComponentBrowser />
            <div className="flex-1 h-full relative">
              <HypercarModularAssemblyViewport />
            </div>
          </div>

          {/* Bottom Live Physics & Scrutineering HUD */}
          <HypercarLivePhysicsHUD
            onProceedToGarage={() => {
              playHMIClickSound();
              setScreen("garage");
            }}
          />
        </div>
      )}

      {screen === "rd_labs" && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <HypercarDeepRDLab />
        </div>
      )}

      {screen === "garage" && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <HypercarGarageSetupStudio
            onBackToAssembly={() => {
              playHMIClickSound();
              setScreen("assembly");
            }}
            onStartRace={handleStartRace}
          />
        </div>
      )}

      {screen === "racing" && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <HypercarLiveRaceSimulator
            circuit={activeCircuit}
            setup={activeSetup}
            onExitSession={() => setScreen("garage")}
          />
        </div>
      )}

      {screen === "benchmark" && (
        <div className="w-full flex-1 flex flex-col min-h-0 overflow-y-auto p-4 bg-slate-900/80">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 shrink-0">
            <h2 className="text-sm font-black uppercase tracking-widest text-amber-400">
              100 Real-World Sports Car Benchmark & Simulation Validation Suite
            </h2>
            <button
              onClick={() => {
                playHMIClickSound();
                setScreen("assembly");
              }}
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

export const HypercarConstructorMasterApp = React.memo(HypercarConstructorMasterAppComponent);
export default HypercarConstructorMasterApp;
