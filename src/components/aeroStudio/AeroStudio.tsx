// ============================================================================
// AERO STUDIO MASTER COMPONENT
// ============================================================================
// Master assembly for the Aero Design Studio stage. Unites sub-tab navigation,
// the Three.js modular CAD GLB viewport, camera focus controls, and the
// parameter configuration deck situated directly below the 3D model.
// ============================================================================

import React from "react";
import {
  Wind,
  Car,
  Radio,
  Check,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import { useAeroStudioStore } from "../../state/aeroStudioStore";
import { useModularVehicleBuilderStore } from "../../state/modularVehicleBuilderStore";
import { useGuidedEngineeringStore } from "../../state/guidedEngineeringStore";
import { AeroStudioCanvasViewport } from "./AeroStudioCanvasViewport";
import { AeroControlDeck } from "./AeroControlDeck";

interface AeroStudioProps {
  onSelectStage?: (stage: string) => void;
}

export const AeroStudio: React.FC<AeroStudioProps> = ({ onSelectStage }) => {
  const { aeroStatus, markStageComplete, setActiveWorkflowStage } = useGuidedEngineeringStore();
  const physics = useAeroStudioStore((s) => s.physics);
  const config = useAeroStudioStore((s) => s.config);
  const vehicleVariant = useAeroStudioStore((s) => s.vehicleVariant);
  const modularModel = useModularVehicleBuilderStore((s) => s.selectedModel);

  const handleNextToCreatorMenu = () => {
    markStageComplete("aero");
    if (onSelectStage) {
      onSelectStage("create_vehicle_hub");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#05070a] text-slate-100 p-4 md:p-6 flex flex-col gap-5">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Wind size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                AERO DESIGN STUDIO
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40">
                  BLENDER 5.2 CAD TWIN
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Interactive modular aerodynamic surface tuner with real-time mechanical hinge pivots and surrogate Navier-Stokes physics.
              </p>
            </div>
          </div>
        </div>

        {/* Right Header: Host Vehicle Sync Badge & Wind Tunnel Telemetry Ticker */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Host Vehicle Live Sync Indicator */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 rounded-xl px-3 py-1.5 font-mono text-xs shadow-lg">
            <Car size={14} className="text-cyan-400" />
            <span className="text-slate-400">Host Vehicle:</span>
            <span className="text-cyan-300 font-bold uppercase tracking-wider">
              {(modularModel || vehicleVariant || "sedan").toUpperCase()}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-extrabold uppercase">
              ✓ CONTINUED FROM STAGE 2
            </span>
          </div>

          {/* Global Key Metric Quick Ticker */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-xs">
            <Radio size={14} className="text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Wind Tunnel:</span>
            <span className="text-cyan-400 font-bold">{config.airspeedKmh} km/h</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Downforce:</span>
            <span className="text-cyan-300 font-bold">{physics.totalDownforceN.toFixed(0)} N</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Balance:</span>
            <span className="text-emerald-400 font-bold">{physics.aeroBalanceFrontPct.toFixed(1)}% Front</span>
          </div>
        </div>
      </div>

      {/* Stage 3 Workflow Action Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#0d1424]/90 via-[#10192e]/90 to-[#0d1424]/90 border border-amber-500/30 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
            aeroStatus === "configured"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-teal-500/15 text-teal-400 border border-teal-500/30"
          }`}>
            {aeroStatus === "configured" ? <Check size={18} /> : <Wind size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-100">
                STAGE 3: AERODYNAMIC PACKAGE & DOWNFORCE
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                aeroStatus === "configured"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : aeroStatus === "invalidated"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-teal-500/20 text-teal-300 border border-teal-500/40"
              }`}>
                {aeroStatus === "configured"
                  ? "✓ CONFIGURED"
                  : aeroStatus === "invalidated"
                  ? "⚠ RECALCULATION REQUIRED"
                  : "IN PROGRESS"}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Total Downforce: {physics.totalDownforceN.toFixed(0)} N • Aero Balance: {physics.aeroBalanceFrontPct.toFixed(1)}% Front • Drag Cd: {physics.totalCd.toFixed(3)}
            </p>
          </div>
        </div>

        {onSelectStage && (
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onSelectStage("create_vehicle_hub")}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-amber-400/50 text-slate-300 hover:text-amber-300 font-mono font-bold text-xs tracking-wider uppercase transition-all cursor-pointer"
              title="Return to Creator Menu"
            >
              <ChevronLeft size={14} />
              <span>← CREATOR MENU</span>
            </button>
            <button
              type="button"
              onClick={handleNextToCreatorMenu}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
              title="Complete Aerodynamics and return to Creator Menu"
            >
              <Check size={15} strokeWidth={3} />
              <span>NEXT → CREATOR MENU</span>
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* 3D Viewport with Three.js WebGL and live Blender GLBs & Floating Options Dock (Photo 1 & 2) */}
      <div className="w-full">
        <AeroStudioCanvasViewport />
      </div>

      {/* Configuration Controls directly beneath the 3D GLB Viewport */}
      <div className="w-full">
        <AeroControlDeck />
      </div>
    </div>
  );
};
