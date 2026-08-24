// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — MASTER WORKSHOP CONTAINER
// ============================================================================

import React from "react";
import { useF1ConstructorStore } from "../../sim/f1/state/f1ConstructorStore";
import { F1BudgetBar } from "./F1BudgetBar";
import { F1WorkshopNav } from "./F1WorkshopNav";
import { F1OverviewStudio } from "./overview/F1OverviewStudio";
import { MonocoqueStudio } from "./studios/MonocoqueStudio";
import { PowerUnitStudio } from "./studios/PowerUnitStudio";
import { AerodynamicsStudio } from "./studios/AerodynamicsStudio";
import { SuspensionStudio } from "./studios/SuspensionStudio";
import { DrivetrainStudio } from "./studios/DrivetrainStudio";
import { BrakesStudio } from "./studios/BrakesStudio";
import { CockpitStudio } from "./studios/CockpitStudio";
import { LiveryStudio } from "./studios/LiveryStudio";
import { F1RegulationViewer } from "./F1RegulationViewer";
import { WindTunnelStudio } from "./studios/WindTunnelStudio";
import { DynoBenchStudio } from "./studios/DynoBenchStudio";

interface F1ConstructorWorkshopProps {
  onBackToMotorsport?: () => void;
}

export const F1ConstructorWorkshop: React.FC<F1ConstructorWorkshopProps> = ({ onBackToMotorsport }) => {
  const { activeStep } = useF1ConstructorStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Persistent HUD & Cost Cap Status */}
      <F1BudgetBar />

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
          <F1WorkshopNav />
          {onBackToMotorsport && (
            <button
              onClick={onBackToMotorsport}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all text-center"
            >
              ← Return to Motorsport Hub
            </button>
          )}
        </div>

        {/* Dynamic Studio Canvas */}
        <main className="flex-1 w-full min-w-0">
          {activeStep === "overview" && <F1OverviewStudio />}
          {activeStep === "monocoque" && <MonocoqueStudio />}
          {activeStep === "powerunit" && <PowerUnitStudio />}
          {activeStep === "aerodynamics" && <AerodynamicsStudio />}
          {activeStep === "suspension" && <SuspensionStudio />}
          {activeStep === "drivetrain" && <DrivetrainStudio />}
          {activeStep === "brakes" && <BrakesStudio />}
          {activeStep === "cockpit" && <CockpitStudio />}
          {activeStep === "livery" && <LiveryStudio />}
          {activeStep === "scrutineering" && <F1RegulationViewer />}
          {activeStep === "windtunnel" && <WindTunnelStudio />}
          {activeStep === "dynobench" && <DynoBenchStudio />}
        </main>
      </div>
    </div>
  );
};
