// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — POWER UNIT & HYBRID ERS STUDIO
// ============================================================================

import React, { memo } from "react";
import { Zap, BatteryCharging, Flame, Cpu, Gauge } from "lucide-react";
import { useF1ConstructorStore } from "../../../sim/f1/state/f1ConstructorStore";
import type { CombustionPrechamberTech, MguKDeploymentStrategy, MguHControlMode } from "../../../sim/f1/types/f1Enums";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export const PowerUnitStudio: React.FC = memo(function PowerUnitStudio() {
  const { car, updatePowerUnit } = useF1ConstructorStore();
  const pu = car.powerUnit;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Studio Header */}
      <div className="glass-panel p-6 border-amber-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-amber-400" size={24} />
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">
              1.6L V6 Turbo-Hybrid Power Unit & Energy Recovery
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Configure the 1,000+ HP hybrid powertrain: 90° V6 internal combustion engine, Mahle Jet prechamber ignition, 120 kW MGU-K kinetic motor, 125,000 RPM MGU-H turbo shaft, and 4.0 MJ lithium-ion Energy Store.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-amber-400">
              {car.computedTotalPeakHp} <span className="text-xs text-slate-400 font-normal">HP</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              {car.computedIcePeakHp} ICE + {car.computedErsPeakHp} ERS
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Prechamber Ignition */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>Combustion Pre-chamber</span>
            <span className="text-[10px] text-amber-400 font-mono">Thermal Efficiency</span>
          </label>
          <select
            value={pu.prechamberTechnology}
            onChange={(e) => {
              playHMIClickSound();
              updatePowerUnit({ prechamberTechnology: e.target.value as CombustionPrechamberTech });
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ACTIVE_DUAL_STAGE_MAHLE">Mahle Jet Ignition (Active Dual Injector)</option>
            <option value="PASSIVE_PRECHAMBER_TBI">Passive Scavenged Prechamber</option>
            <option value="CORONA_DISCHARGE_IGNITION">Corona High Energy Plasma Ignition</option>
            <option value="ULTRASONIC_STRATIFIED">Ultrasonic Lean-Burn Stratified</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Active prechamber ignition creates turbulent flame jets enabling ultra-lean combustion at 50%+ thermal efficiency.
          </p>
        </div>

        {/* 2. Compression Ratio */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Static Compression Ratio</span>
            <span className="font-mono text-amber-400 font-bold">{pu.compressionRatio.toFixed(1)}:1</span>
          </div>
          <input
            type="range"
            min="12.0"
            max="18.0"
            step="0.1"
            value={pu.compressionRatio}
            onChange={(e) => updatePowerUnit({ compressionRatio: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>12.0:1 (Safer)</span>
            <span>16.5:1 (F1 Standard)</span>
            <span>18.0:1 (Extreme Knock Risk)</span>
          </div>
        </div>

        {/* 3. Fuel Injection Rail Pressure */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">Direct Injection Pressure</span>
            <span className={`font-mono font-bold ${pu.fuelRailPressureBar <= 500 ? "text-ok-400" : "text-danger-400"}`}>
              {pu.fuelRailPressureBar} bar (Max 500 bar)
            </span>
          </div>
          <input
            type="range"
            min="350"
            max="520"
            step="5"
            value={pu.fuelRailPressureBar}
            onChange={(e) => updatePowerUnit({ fuelRailPressureBar: parseInt(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>350 bar</span>
            <span>480 bar</span>
            <span>500 bar (FIA Limit)</span>
          </div>
        </div>

        {/* 4. MGU-K Peak Power Output */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider">MGU-K Motor Output</span>
            <span className={`font-mono font-bold ${pu.mguKPowerKw <= 120 ? "text-ok-400" : "text-danger-400"}`}>
              {pu.mguKPowerKw} kW ({(pu.mguKPowerKw / 0.7457).toFixed(0)} HP)
            </span>
          </div>
          <input
            type="range"
            min="80"
            max="140"
            step="2"
            value={pu.mguKPowerKw}
            onChange={(e) => updatePowerUnit({ mguKPowerKw: parseInt(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>80 kW</span>
            <span>120 kW (FIA Max)</span>
            <span>140 kW (Illegal)</span>
          </div>
        </div>

        {/* 5. MGU-K Deployment Strategy */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>MGU-K Deployment Map</span>
            <span className="text-[10px] text-amber-400 font-mono">Corner Exit</span>
          </label>
          <select
            value={pu.mguKDeployment}
            onChange={(e) => {
              playHMIClickSound();
              updatePowerUnit({ mguKDeployment: e.target.value as MguKDeploymentStrategy });
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="CORNER_EXIT_TORQUE_FILL">Corner Exit Torque-Fill (Eliminates Lag)</option>
            <option value="TOP_END_SPEED_EXTENDER">Top-End Speed Extender (Straightline Boost)</option>
            <option value="TRACTION_OPTIMIZED">Traction-Optimized Closed Loop</option>
            <option value="DYNAMIC_GPS_DELTA">Dynamic GPS Micro-Burst</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Determines whether kinetic energy is deployed instantly on throttle application or preserved for long straights.
          </p>
        </div>

        {/* 6. MGU-H Control Strategy */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
            <span>MGU-H Turbo Shaft Control</span>
            <span className="text-[10px] text-amber-400 font-mono">125k RPM Shaft</span>
          </label>
          <select
            value={pu.mguHControl}
            onChange={(e) => {
              playHMIClickSound();
              updatePowerUnit({ mguHControl: e.target.value as MguHControlMode });
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="DIRECT_MGU_K_ENERGY_FEED">Direct MGU-K Feed (Bypasses 4MJ Battery Limit)</option>
            <option value="ENERGY_STORE_CHARGING">Direct Energy Store Charging</option>
            <option value="TURBO_ANTI_LAG_MOTORING">Continuous Turbo Spool Motoring</option>
            <option value="HYBRID_EFFICIENCY_SPLIT">Dynamic Thermal Efficiency Split</option>
          </select>
          <p className="text-[11px] text-slate-500">
            MGU-H has no FIA energy harvesting limit and can transfer unlimited MJ directly to the MGU-K.
          </p>
        </div>
      </div>
    </div>
  );
});
