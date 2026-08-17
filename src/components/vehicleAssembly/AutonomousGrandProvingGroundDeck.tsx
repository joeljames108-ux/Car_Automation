// ============================================================================
// PHASE 73 — AUTONOMOUS GRAND PROVING GROUND & SAFETY STUDIO DECK
// ============================================================================
// Master high-contrast dark telemetry workstation visualizing Steer-by-Wire,
// Active AWD Transfer Case, Cabin ANC FxLMS DSP, and NCAP Crash Restraints.
// ============================================================================

import React, { useState } from 'react';
import { Compass, ShieldCheck, Volume2, Radio, Activity, Sparkles, Sliders, Zap } from 'lucide-react';
import { SteerByWireForceFeedbackSolver } from '../../sim/steering/steerByWireForceFeedbackSolver';
import { ActiveAwdTransferCaseSolver, AwdTerrainMode } from '../../sim/drivetrain/activeAwdTransferCaseSolver';
import { CabinActiveNoiseCancellationDsp } from '../../sim/nvh/cabinActiveNoiseCancellationDsp';
import { CrashPulseRestraintSolver } from '../../sim/safety/crashPulseRestraintSolver';

export const AutonomousGrandProvingGroundDeck: React.FC = () => {
  const [handwheelDeg, setHandwheelDeg] = useState<number>(35);
  const [awdMode, setAwdMode] = useState<AwdTerrainMode>('DYNAMIC_REAR_BIASED');
  const [engineRpm, setEngineRpm] = useState<number>(3200);
  const [ancActive, setAncActive] = useState<boolean>(true);

  // 1. Solve Steer-by-Wire
  const sbwState = SteerByWireForceFeedbackSolver.evaluateSteerByWire({
    handwheelAngleDeg: handwheelDeg,
    handwheelAngularVelocityDegSec: 45,
    vehicleSpeedKmh: 120,
    frontLateralForceN: 4800,
  });

  // 2. Solve Active AWD Transfer Case
  const awdState = ActiveAwdTransferCaseSolver.evaluateAwdDistribution({
    terrainMode: awdMode,
    demandedEngineTorqueNm: 650,
    rearWheelSlipRatio: 0.08,
    lateralAccelerationG: 0.65,
  });

  // 3. Solve Cabin ANC DSP
  const ancState = CabinActiveNoiseCancellationDsp.processCabinAnc({
    engineRpm,
    vehicleSpeedKmh: 120,
    isAncEnabled: ancActive,
  });

  // 4. Solve NCAP Crash Pulse
  const crashState = CrashPulseRestraintSolver.evaluateCrashPulse({
    impactVelocityKmh: 64,
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#05070c] text-gray-100 p-4 gap-4 overflow-y-auto font-sans">
      {/* Studio Header Ribbon */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#090d16] border border-[#182133] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">
              AUTONOMOUS GRAND PROVING GROUND & PASSENGER SAFETY STUDIO
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              Steer-by-Wire Force Feedback, Multi-Plate AWD, 4-Zone FxLMS ANC & Euro NCAP Crash Pulse
            </p>
          </div>
        </div>

        {/* Global AWD Mode Selector */}
        <select
          value={awdMode}
          onChange={(e) => setAwdMode(e.target.value as AwdTerrainMode)}
          className="bg-[#0e1424] text-cyan-400 text-xs font-bold font-mono px-3 py-1.5 rounded-xl border border-cyan-500/40 cursor-pointer"
        >
          <option value="DYNAMIC_REAR_BIASED">Dynamic Rear-Biased AWD</option>
          <option value="SNOW_MUD_LOCKED_50_50">Snow / Mud 50:50 Lock</option>
          <option value="SPORT_DRIFT_MODE">Sport Drift (100% Rear)</option>
          <option value="ECO_FRONT_DISCONNECT">Eco Front Disconnect</option>
        </select>
      </div>

      {/* Main 4-Card 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Card 1: Steer-by-Wire Handwheel Haptics */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Compass className="w-4 h-4" />
              <span>STEER-BY-WIRE FORCE FEEDBACK (HWA)</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-400">
              Ratio: {sbwState.variableSteeringRatio}:1
            </span>
          </div>

          {/* Handwheel Slider */}
          <div className="flex items-center justify-between p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">HANDWHEEL: {handwheelDeg}°</span>
            <input
              type="range"
              min="-90"
              max="90"
              value={handwheelDeg}
              onChange={(e) => setHandwheelDeg(Number(e.target.value))}
              className="w-36 accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">ROAD WHEEL ANGLE (RWA)</div>
              <div className="text-sm font-bold text-cyan-400">{sbwState.roadWheelAngleDeg}°</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">HAPTIC FEEDBACK TORQUE</div>
              <div className="text-sm font-bold text-emerald-400">{sbwState.handwheelFeedbackTorqueNm} Nm</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">ALIGNING TORQUE</div>
              <div className="text-sm font-bold text-gray-200">{sbwState.aligningTorqueSynthesizedNm} Nm</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">FAIL-OPERATIONAL</div>
              <div className="text-sm font-bold text-emerald-400">Dual-Channel OK</div>
            </div>
          </div>
        </div>

        {/* Card 2: Active AWD Multi-Plate Transfer Case */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>ACTIVE AWD TRANSFER CASE</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
              {awdState.frontTorqueSplitPct}% F / {awdState.rearTorqueSplitPct}% R
            </span>
          </div>

          <div className="p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono text-gray-300">
            <div className="text-gray-400 text-[10px] mb-1">TORQUE DISTRIBUTION</div>
            <div className="text-amber-400 font-bold">
              Front: {awdState.frontAxleTorqueNm} Nm • Rear: {awdState.rearAxleTorqueNm} Nm
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CLUTCH CLAMPING FORCE</div>
              <div className="text-sm font-bold text-cyan-400">{awdState.clutchClampingForceN} N</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CLUTCH OIL TEMP</div>
              <div className="text-sm font-bold text-emerald-400">{awdState.clutchOilTempC}°C</div>
            </div>
          </div>
        </div>

        {/* Card 3: Multi-Zone Cabin Active Noise Cancellation */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Volume2 className="w-4 h-4" />
              <span>CABIN FxLMS ACTIVE NOISE CANCELLATION</span>
            </div>
            <button
              onClick={() => setAncActive(!ancActive)}
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                ancActive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/40'
              }`}
            >
              {ancActive ? 'ANC ACTIVE (-14dB)' : 'ANC OFF'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            {[ancState.driverZone, ancState.frontPassengerZone, ancState.rearLeftZone, ancState.rearRightZone].map((z) => (
              <div key={z.zoneName} className="p-2 rounded-lg bg-[#0a0f1c] border border-[#182133]">
                <div className="text-[10px] text-gray-400 mb-0.5">{z.zoneName}</div>
                <div className="text-indigo-400 font-bold">{z.residualNoiseSplDb} dB SPL</div>
                <div className="text-[9px] text-emerald-400">-{z.noiseAttenuationDb} dB • {z.psychoacousticLoudnessSones} sones</div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Euro NCAP Crash Pulse & Restraints */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>EURO NCAP OCCUPANT PROTECTION</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              5-STAR ({crashState.euroNcapOccupantProtectionScorePct}%)
            </span>
          </div>

          <div className="p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono text-gray-300">
            <div className="text-gray-400 text-[10px] mb-1">64 km/h OFFSET CRASH PULSE</div>
            <div className="text-emerald-400 font-bold">
              Peak Decel: {crashState.peakChassisDecelerationG}g • Duration: {crashState.crashPulseDurationMs}ms
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">HEAD INJURY (HIC-36)</div>
              <div className="text-sm font-bold text-emerald-400">{crashState.headInjuryCriterionHic36} (Limit: 650)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CHEST DEFLECTION</div>
              <div className="text-sm font-bold text-emerald-400">{crashState.chestDeflectionMm} mm (Limit: 35mm)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
