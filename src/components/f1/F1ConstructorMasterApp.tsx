// ============================================================================
// F1 CONSTRUCTOR MASTER APPLICATION — UNIFIED WORKSHOP & RACE EXPERIENCE
// ============================================================================

import React, { useState } from "react";
import { F1ModularComponentBrowser } from "./modular/F1ModularComponentBrowser";
import { F1ModularAssemblyViewport } from "./3d/F1ModularAssemblyViewport";
import { F1LivePhysicsHUD } from "./modular/F1LivePhysicsHUD";
import { F1GarageSetupStudio, type F1RaceWeekendSetup } from "./garage/F1GarageSetupStudio";
import { F1LiveRaceSimulator } from "./racing/F1LiveRaceSimulator";
import { F1_CIRCUITS, type F1Circuit } from "../../sim/f1/season/f1Calendar";

export type F1WorkshopMode = "CONSTRUCTION_CAD" | "GARAGE_SETUP" | "LIVE_RACE";

interface F1ConstructorMasterAppProps {
  onBackToMainMotorsport?: () => void;
}

export const F1ConstructorMasterApp: React.FC<F1ConstructorMasterAppProps> = ({ onBackToMainMotorsport }) => {
  const [currentMode, setCurrentMode] = useState<F1WorkshopMode>("CONSTRUCTION_CAD");
  const [selectedCircuit, setSelectedCircuit] = useState<F1Circuit>(F1_CIRCUITS[0]);
  const [activeSetup, setActiveSetup] = useState<F1RaceWeekendSetup | null>(null);

  return (
    <div className="w-full min-h-[750px] h-[calc(100vh-200px)] flex flex-col bg-[#0a0c10] select-none overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
      {currentMode === "CONSTRUCTION_CAD" && (
        <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Top Exit Bar */}
          {onBackToMainMotorsport && (
            <div className="px-6 py-2.5 bg-zinc-950 border-b border-white/10 flex items-center justify-between z-20 shrink-0">
              <button
                onClick={onBackToMainMotorsport}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                ← Exit to Motorsport Hub
              </button>
              <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                FIA Formula 1 Construction Studio
              </span>
            </div>
          )}
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

      {currentMode === "GARAGE_SETUP" && (
        <F1GarageSetupStudio
          onBackToAssembly={() => setCurrentMode("CONSTRUCTION_CAD")}
          onStartRace={(circuit, setup) => {
            setSelectedCircuit(circuit);
            setActiveSetup(setup);
            setCurrentMode("LIVE_RACE");
          }}
        />
      )}

      {currentMode === "LIVE_RACE" && activeSetup && (
        <F1LiveRaceSimulator
          circuit={selectedCircuit}
          setup={activeSetup}
          onExitSession={() => setCurrentMode("GARAGE_SETUP")}
        />
      )}
    </div>
  );
};
