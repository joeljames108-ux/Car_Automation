// ============================================================================
// HYPERCAR CONSTRUCTOR MASTER APPLICATION WRAPPER — UNIFIED WEC 24H SUITE
// ============================================================================

import React, { useState, memo } from "react";
import { HypercarModularAssemblyViewport } from "./3d/HypercarModularAssemblyViewport";
import { HypercarComponentBrowser } from "./modular/HypercarComponentBrowser";
import { HypercarLivePhysicsHUD } from "./modular/HypercarLivePhysicsHUD";
import { HypercarDeepRDLab } from "./studios/HypercarDeepRDLab";
import { HypercarGarageSetupStudio, type HypercarGarageSetup } from "./garage/HypercarGarageSetupStudio";
import { HypercarLiveRaceSimulator } from "./racing/HypercarLiveRaceSimulator";
import { RealCar100BenchmarkStudio } from "./benchmark/RealCar100BenchmarkStudio";
import { WEC_CIRCUITS, type WECCircuitProfile } from "../../sim/hypercar/season/wecCalendar";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";
import { Wrench, SlidersHorizontal, Flag, Sparkles, Trophy, ShieldAlert, FlaskConical } from "lucide-react";

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
    <div className="w-full min-h-[750px] h-[calc(100vh-200px)] flex flex-col bg-[#05070a] text-white relative overflow-hidden select-none rounded-2xl border border-white/10 shadow-2xl">
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
                ? "bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-sm"
                : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>100 Real Car Benchmarks</span>
          </button>
        </div>
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
        <div className="w-full flex-1 flex flex-col min-h-0 overflow-y-auto p-4 bg-[#080a0f]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 shrink-0">
            <h2 className="text-sm font-black uppercase tracking-widest text-cyan-400">
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
