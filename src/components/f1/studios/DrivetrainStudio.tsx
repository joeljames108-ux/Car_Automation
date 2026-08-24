// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — GEARBOX & DRIVETRAIN STUDIO
// ============================================================================

import React from "react";
import { Layers, Zap, Sliders, Shield } from "lucide-react";
import { useF1ConstructorStore } from "../../../sim/f1/state/f1ConstructorStore";
import type { F1GearboxCasingType } from "../../../sim/f1/types/f1Enums";

export const DrivetrainStudio: React.FC = () => {
  const { car, updateGearbox } = useF1ConstructorStore();
  const gb = car.gearbox;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Studio Header */}
      <div className="glass-panel p-6 border-blue-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">
              8-Speed Seamless Shift Gearbox & Differential
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Configure the rear structural transmission: carbon monocoque casing, 14ms seamless gear transitions, active limited-slip differential ramp angles, and final drive ratio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-blue-400">
              {gb.shiftTimeMs} <span className="text-xs text-slate-400 font-normal">ms</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Seamless Shift Time</div>
          </div>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Structural Casing Type */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Transmission Structural Casing</span>
            <span className="text-[10px] text-blue-400 font-mono">Rear Suspension Mount</span>
          </label>
          <select
            value={gb.casingType}
            onChange={(e) => updateGearbox({ casingType: e.target.value as F1GearboxCasingType })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="FULL_CARBON_MONOCOQUE">Full Carbon Fiber Monocoque (42 kg)</option>
            <option value="CARBON_TITANIUM_HYBRID">Carbon-Titanium Hybrid Casing (46 kg)</option>
            <option value="ADDITIVE_DMLS_TITANIUM">DMLS Laser Sintered Titanium Skeleton (49 kg)</option>
          </select>
          <p className="text-[11px] text-slate-500">
            The gearbox serves as the structural mounting point for the rear suspension and crash attenuator.
          </p>
        </div>

        {/* 2. Final Drive Ratio */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Final Drive Ratio</span>
            <span className="font-mono text-blue-400 font-bold">{gb.finalDriveRatio.toFixed(2)}:1</span>
          </div>
          <input
            type="range"
            min="3.20"
            max="4.10"
            step="0.02"
            value={gb.finalDriveRatio}
            onChange={(e) => updateGearbox({ finalDriveRatio: parseFloat(e.target.value) })}
            className="w-full accent-blue-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>3.20 (Monza Top Speed)</span>
            <span>3.64 (Balanced)</span>
            <span>4.10 (Monaco Acceleration)</span>
          </div>
        </div>

        {/* 3. Differential Lock On Power */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Diff Lock On Throttle</span>
            <span className="font-mono text-blue-400 font-bold">{gb.differentialLockOnPowerPercent}%</span>
          </div>
          <input
            type="range"
            min="40"
            max="95"
            step="1"
            value={gb.differentialLockOnPowerPercent}
            onChange={(e) => updateGearbox({ differentialLockOnPowerPercent: parseInt(e.target.value) })}
            className="w-full accent-blue-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>40% (Loose Exit)</span>
            <span>75% (Standard)</span>
            <span>95% (Max Traction)</span>
          </div>
        </div>

        {/* 4. Differential Lock Off Power (Entry) */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Diff Lock Off Throttle (Turn-In)</span>
            <span className="font-mono text-blue-400 font-bold">{gb.differentialLockOffPowerPercent}%</span>
          </div>
          <input
            type="range"
            min="25"
            max="75"
            step="1"
            value={gb.differentialLockOffPowerPercent}
            onChange={(e) => updateGearbox({ differentialLockOffPowerPercent: parseInt(e.target.value) })}
            className="w-full accent-blue-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>25% (Agile Rotation)</span>
            <span>45% (Stable Braking)</span>
            <span>75% (Understeer)</span>
          </div>
        </div>

        {/* 5. Differential Preload */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Differential Initial Preload</span>
            <span className="font-mono text-blue-400 font-bold">{gb.differentialPreloadNm} Nm</span>
          </div>
          <input
            type="range"
            min="40"
            max="220"
            step="5"
            value={gb.differentialPreloadNm}
            onChange={(e) => updateGearbox({ differentialPreloadNm: parseInt(e.target.value) })}
            className="w-full accent-blue-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>40 Nm (Wet Weather)</span>
            <span>110 Nm</span>
            <span>220 Nm (High Grip)</span>
          </div>
        </div>

        {/* 6. Driveshaft Material */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Half-Shaft Torque Tube</span>
            <span className="text-[10px] text-blue-400 font-mono">1000 Nm Rating</span>
          </label>
          <select
            value={gb.driveshaftMaterial}
            onChange={(e) => updateGearbox({ driveshaftMaterial: e.target.value as any })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="CARBON_FIBER_OVERWRAPPED_TI">Carbon Overwrapped Titanium (Ultra Light)</option>
            <option value="HOLLOW_AERMET_STEEL">Hollow AerMet 100 Structural Steel</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Low rotational inertia half-shafts improve wheel acceleration response in 1st to 3rd gear.
          </p>
        </div>
      </div>
    </div>
  );
};
