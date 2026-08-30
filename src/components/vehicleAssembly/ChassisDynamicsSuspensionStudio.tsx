// ============================================================================
// PHASE 43 — CHASSIS DYNAMICS, MR SUSPENSION & HYBRID POWERTRAIN STUDIO
// ============================================================================
// Master high-contrast dark telemetry dashboard visualizing MR Skyhook active
// damping, Crashworthiness FEA folding, and P2/P4 hybrid energy management.
// ============================================================================

import React, { useState, useMemo } from 'react';
import { Activity, ShieldCheck, Zap, Gauge, Sparkles, Layers, Sliders, BatteryCharging } from 'lucide-react';
import { MagnetorheologicalDamperController, SuspensionDriveMode } from '../../sim/suspension/magnetorheologicalDamperController';
import { CrashEnergyAbsorberFea, CrashRailCrossSection } from '../../exterior3d/chassis/crashEnergyAbsorberFea';
import { HybridEnergyManagementStrategy } from '../../sim/powertrain/hybridEnergyManagementStrategy';

export const ChassisDynamicsSuspensionStudio: React.FC = () => {
  const [driveMode, setDriveMode] = useState<SuspensionDriveMode>('SPORT_FIRM');
  const [crashMaterial, setCrashMaterial] = useState<CrashRailCrossSection>('OCTAGONAL_ULTRA_HIGH_STRENGTH_STEEL');
  const [throttlePct, setThrottlePct] = useState<number>(85);
  const [batterySoc, setBatterySoc] = useState<number>(65);

  // 1. Solve MR Damper Suspension State
  const mrState = useMemo(() => {
    return MagnetorheologicalDamperController.evaluateActiveSuspensionTick({
      mode: driveMode,
      bodyHeaveVelocityMs: 0.12,
      bodyPitchRateRadSec: 0.045,
      bodyRollRateRadSec: 0.065,
      wheelVelocitiesMs: { fl: -0.15, fr: 0.18, rl: -0.12, rr: 0.14 },
      deflectionsMm: { fl: 18.5, fr: -14.2, rl: 12.0, rr: -10.5 },
    });
  }, [driveMode]);

  // 2. Solve Crashworthiness Energy Absorption
  const crashResult = useMemo(() => {
    return CrashEnergyAbsorberFea.evaluateFrontalImpact({
      material: crashMaterial,
      impactVelocityKmh: 64.0,
      vehicleMassKg: 1480,
    });
  }, [crashMaterial]);

  // 3. Solve P2/P4 Hybrid Energy Management
  const hybridState = useMemo(() => {
    return HybridEnergyManagementStrategy.evaluateHybridPowerSplit({
      driverThrottlePct: throttlePct,
      driverBrakePressureBar: 0,
      vehicleSpeedKmh: 145,
      batterySocPct: batterySoc,
      currentRpm: 5200,
      turboSpoolPct: 0.75, // Moderate spool -> invokes electric torque fill
    });
  }, [throttlePct, batterySoc]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-900/80 text-gray-100 p-4 gap-4 overflow-y-auto font-sans">
      {/* Studio Header Ribbon */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-slate-900/80 border border-[#182133] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-indigo-500/20 border border-amber-500/40 text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">
              CHASSIS DYNAMICS, MR SUSPENSION & HYBRID EMS STUDIO
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              Skyhook Karnopp Control, Plastic FEA Energy Absorption & P2/P4 ECMS
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <select
            value={driveMode}
            onChange={(e) => setDriveMode(e.target.value as SuspensionDriveMode)}
            className="bg-slate-900/80 text-amber-400 text-xs font-bold font-mono px-3 py-1.5 rounded-xl border border-amber-500/40 cursor-pointer"
          >
            <option value="COMFORT_PLUSH">Comfort Plush</option>
            <option value="BALANCED_TOURING">Balanced Touring</option>
            <option value="SPORT_FIRM">Sport Firm</option>
            <option value="TRACK_ATTACK">Track Attack</option>
          </select>
        </div>
      </div>

      {/* 3-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Column 1: Magnetorheological Skyhook Active Damping */}
        <div className="flex flex-col p-4 rounded-2xl bg-slate-900/80 border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sliders className="w-4 h-4" />
              <span>MR DAMPER SKYHOOK FORCES</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
              {driveMode}
            </span>
          </div>

          {/* 4-Corner Damping Visualizer */}
          <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-900/80 rounded-xl border border-[#141b2b]">
            {Object.values(mrState.corners).map((c) => (
              <div key={c.corner} className="p-2.5 rounded-lg bg-slate-900/80 border border-[#182133]">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                  <span>{c.corner.replace('_', ' ')}</span>
                  <span className={c.skyhookActive ? 'text-emerald-400 font-bold' : 'text-gray-500'}>
                    {c.skyhookActive ? 'SKYHOOK' : 'IDLE'}
                  </span>
                </div>
                <div className="text-base font-bold font-mono text-amber-400 my-0.5">
                  {c.instantaneousDampingForceN} N
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-gray-400">
                  <span>Coil: {c.mrCoilCurrentAmps} A</span>
                  <span>Yield: {c.mrFluidYieldStressKpa} kPa</span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Vibration Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">DISSIPATED POWER</div>
              <div className="text-sm font-bold text-emerald-400">{mrState.totalDamperDissipatedPowerWatts} W</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CHASSIS HEAVE ACCEL</div>
              <div className="text-sm font-bold text-amber-400">{mrState.chassisHeaveAccelMs2} m/s²</div>
            </div>
          </div>
        </div>

        {/* Column 2: Crashworthiness FEA Energy Absorption */}
        <div className="flex flex-col p-4 rounded-2xl bg-slate-900/80 border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>CRASH PLASTIC DEFORMATION FEA</span>
            </div>
            <select
              value={crashMaterial}
              onChange={(e) => setCrashMaterial(e.target.value as CrashRailCrossSection)}
              className="bg-slate-900/80 text-gray-300 text-[10px] font-mono px-2 py-1 rounded-lg border border-[#212c44] cursor-pointer"
            >
              <option value="OCTAGONAL_ULTRA_HIGH_STRENGTH_STEEL">Octagonal UHSS Steel</option>
              <option value="HEXAGONAL_ALUMINUM_6063_T6">Hexagonal Aluminum 6063-T6</option>
              <option value="CIRCULAR_CARBON_COMPOSITE">Circular Carbon Composite</option>
            </select>
          </div>

          {/* Crash Pulse Metrics */}
          <div className="flex flex-col p-3 bg-slate-900/80 rounded-xl border border-[#141b2b] gap-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">NCAP 64 KM/H SAFETY:</span>
              <span className="text-amber-400 font-bold">
                {'★'.repeat(crashResult.ncapSafetyRatingStars)} ({crashResult.ncapSafetyRatingStars} Stars)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">SPECIFIC ABSORPTION (SEA):</span>
              <span className="text-rose-400 font-bold">{crashResult.specificEnergyAbsorptionSeaKjPerKg} kJ/kg</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">CRUSH FORCE EFFICIENCY:</span>
              <span className="text-emerald-400 font-bold">{(crashResult.crushForceEfficiencyCfe * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">CABIN INTRUSION:</span>
              <span className={crashResult.cabinIntrusionMm < 25 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {crashResult.cabinIntrusionMm} mm
              </span>
            </div>
          </div>

          {/* Deceleration & Force Badges */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">TOTAL ENERGY ABSORBED</div>
              <div className="text-sm font-bold text-gray-100">{crashResult.totalEnergyAbsorbedKj} kJ</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PEAK DECELERATION</div>
              <div className="text-sm font-bold text-rose-400">{crashResult.peakDecelerationG} g</div>
            </div>
          </div>
        </div>

        {/* Column 3: P2/P4 Hybrid EMS Power Split */}
        <div className="flex flex-col p-4 rounded-2xl bg-slate-900/80 border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>P2/P4 HYBRID ENERGY MANAGEMENT</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              {hybridState.mode.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Interactive Throttle & SOC Sliders */}
          <div className="flex flex-col gap-2 p-3 bg-slate-900/80 rounded-xl border border-[#141b2b] text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">DRIVER THROTTLE: {throttlePct}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={throttlePct}
                onChange={(e) => setThrottlePct(Number(e.target.value))}
                className="w-24 accent-emerald-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">BATTERY SOC: {batterySoc}%</span>
              <input
                type="range"
                min="15"
                max="95"
                value={batterySoc}
                onChange={(e) => setBatterySoc(Number(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Power Split Breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-[9px] text-gray-400">ICE TWIN-TURBO</div>
              <div className="text-sm font-bold text-rose-400">{hybridState.enginePowerKw} kW</div>
              <div className="text-[9px] text-gray-500">{hybridState.engineTorqueNm} Nm</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-[9px] text-gray-400">P2 MOTOR</div>
              <div className="text-sm font-bold text-amber-400">{hybridState.p2MotorPowerKw} kW</div>
              <div className="text-[9px] text-gray-500">{hybridState.p2MotorTorqueNm} Nm</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-[9px] text-gray-400">P4 REAR e-AXLE</div>
              <div className="text-sm font-bold text-emerald-400">{hybridState.p4RearAxlePowerKw} kW</div>
              <div className="text-[9px] text-gray-500">{hybridState.p4RearAxleTorqueNm} Nm</div>
            </div>
          </div>

          {/* Torque Fill Alert Badge */}
          {hybridState.electricTorqueFillActive && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>ELECTRIC INSTANT TORQUE FILL ACTIVE</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
