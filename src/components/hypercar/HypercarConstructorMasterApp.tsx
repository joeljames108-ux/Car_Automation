// ============================================================================
// HYPERCAR CONSTRUCTOR MASTER APPLICATION WRAPPER
// ============================================================================

import React, { useState } from "react";
import { HypercarModularAssemblyViewport } from "./3d/HypercarModularAssemblyViewport";
import { HypercarComponentBrowser } from "./modular/HypercarComponentBrowser";
import { HypercarLivePhysicsHUD } from "./modular/HypercarLivePhysicsHUD";
import { HypercarGarageSetupStudio, type HypercarGarageSetup } from "./garage/HypercarGarageSetupStudio";
import { HypercarLiveRaceSimulator } from "./racing/HypercarLiveRaceSimulator";
import { WEC_CIRCUITS, type WECCircuitProfile } from "../../sim/hypercar/season/wecCalendar";

export type HypercarAppScreen = "assembly" | "garage" | "racing";

interface HypercarConstructorMasterAppProps {
  onBackToMainMotorsport?: () => void;
}

export const HypercarConstructorMasterApp: React.FC<HypercarConstructorMasterAppProps> = ({
  onBackToMainMotorsport,
}) => {
  const [screen, setScreen] = useState<HypercarAppScreen>("assembly");
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
    setActiveCircuit(circuit);
    setActiveSetup(setup);
    setScreen("racing");
  };

  return (
    <div className="w-full min-h-[750px] h-[calc(100vh-200px)] flex flex-col bg-[#05070a] text-white relative overflow-hidden select-none rounded-2xl border border-white/10 shadow-2xl">
      {screen === "assembly" && (
        <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Top Bar with Back Button */}
          <div className="px-6 py-3 bg-zinc-950 border-b border-white/10 flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center gap-3">
              {onBackToMainMotorsport && (
                <button
                  onClick={onBackToMainMotorsport}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  ← Exit to Motorsport Hub
                </button>
              )}
              <div className="h-4 w-px bg-white/20" />
              <h1 className="text-xs font-black uppercase tracking-widest text-amber-400">
                FIA WEC Hypercar Construction Studio
              </h1>
            </div>
          </div>

          {/* Center 3D Assembly + Sidebar */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            <HypercarComponentBrowser />
            <div className="flex-1 h-full relative">
              <HypercarModularAssemblyViewport />
            </div>
          </div>

          {/* Bottom Live Physics & Scrutineering HUD */}
          <HypercarLivePhysicsHUD onProceedToGarage={() => setScreen("garage")} />
        </div>
      )}

      {screen === "garage" && (
        <HypercarGarageSetupStudio
          onBackToAssembly={() => setScreen("assembly")}
          onStartRace={handleStartRace}
        />
      )}

      {screen === "racing" && (
        <HypercarLiveRaceSimulator
          circuit={activeCircuit}
          setup={activeSetup}
          onExitSession={() => setScreen("garage")}
        />
      )}
    </div>
  );
};
