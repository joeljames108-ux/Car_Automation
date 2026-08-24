/**
 * ============================================================================
 * STAGE 12: VEHICLE COMPLETION & AERODYNAMICS GATE STAGE
 * ============================================================================
 */

import React from "react";
import {
  Trophy,
  CheckCircle2,
  Wind,
  Zap,
  Gauge,
  Activity,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { InstalledSubsystemsState } from "../scene/ModularAssemblySceneGraph";

interface VehicleCompletionStageProps {
  assemblyState: InstalledSubsystemsState;
  onEnterAeroStudio: () => void;
  onFinishVehicle: () => void;
}

export const VehicleCompletionStage: React.FC<VehicleCompletionStageProps> = ({
  assemblyState,
  onEnterAeroStudio,
  onFinishVehicle,
}) => {
  const eng = assemblyState.engine;
  const displacementCc = Math.round(
    Math.PI * Math.pow((eng.bore || 88) / 20, 2) * ((eng.stroke || 82) / 10) * 8
  );
  const estHp = Math.round(
    (displacementCc || 4000) *
      0.14 *
      (eng.intake === "twin_turbo" ? 1.65 : eng.intake === "turbo_single" || eng.intake === "bi_turbo" ? 1.4 : 1.0)
  );
  const estTorque = Math.round(estHp * 1.15);
  const estWeightKg = Math.round(1050 + (assemblyState.chassis.wheelbaseMm - 2400) * 0.45);
  const topSpeed = Math.round(280 + estHp * 0.12);
  const accel0_100 = (3.8 - (estHp - 450) * 0.002).toFixed(2);

  return (
    <div className="panel p-6 rounded-3xl space-y-6 shadow-2xl border-cyan-500/40 animate-stage-transition-enter">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3.5 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-400 mb-1 shadow-lg shadow-emerald-500/10">
          <Trophy size={36} className="text-emerald-400 animate-bounce" />
        </div>
        <h2 className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tracking-wide">
          YOUR VEHICLE IS COMPLETE!
        </h2>
        <p className="text-xs font-mono text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          All 11 mechanical subassemblies have been successfully aligned, torqued, and integrated onto the master chassis frame.
        </p>
      </div>

      {/* Complete Engineering Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-base-900/80 border border-base-800 text-center">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">TOTAL MASS</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{estWeightKg} kg</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-base-900/80 border border-base-800 text-center">
          <span className="text-[10px] font-mono text-amber-500 uppercase block mb-1">HORSEPOWER</span>
          <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-300">{estHp} HP</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-base-900/80 border border-base-800 text-center">
          <span className="text-[10px] font-mono text-cyan-500 uppercase block mb-1">0–100 KM/H</span>
          <span className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-300">{accel0_100}s</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-base-900/80 border border-base-800 text-center">
          <span className="text-[10px] font-mono text-emerald-500 uppercase block mb-1">TOP SPEED</span>
          <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-300">{topSpeed} km/h</span>
        </div>
      </div>

      {/* Aerodynamics Prompt Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/40 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Wind size={22} className="animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Would you like to add aerodynamic components?
            </h4>
            <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
              Enter the Aerodynamics Studio to install front splitters, swan-neck rear wings, active DRS flaps, and diffusers with live parametric 3D pivot controls.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onFinishVehicle}
            className="px-5 py-2.5 rounded-xl bg-base-850 border border-base-700 hover:border-base-600 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs transition-all cursor-pointer"
          >
            NO — FINISH VEHICLE
          </button>
          <button
            onClick={onEnterAeroStudio}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Wind size={16} />
            YES — ENTER AERODYNAMICS STUDIO
          </button>
        </div>
      </div>
    </div>
  );
};
