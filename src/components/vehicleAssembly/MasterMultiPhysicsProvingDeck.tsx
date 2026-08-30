// ============================================================================
// PHASE 78 — MASTER MULTI-PHYSICS PROVING DECK & HIGH-FIDELITY TELEMETRY
// ============================================================================
// Master high-contrast dark telemetry workstation visualizing 2500-Bar Piezo
// Injection, Carbon-Ceramic Thermal FEA, Active Front Splitter/S-Duct, and MPC.
// ============================================================================

import React, { useState } from 'react';
import { Flame, Disc, Wind, Navigation, Activity, Sparkles, Sliders, ShieldCheck } from 'lucide-react';
import { CommonRailPiezoInjectorSolver } from '../../sim/engine/commonRailPiezoInjectorSolver';
import { CarbonCeramicThermalStressFea } from '../../sim/brakes/carbonCeramicThermalStressFea';
import { ActiveFrontSplitterSDuctSolver, ActiveSplitterMode } from '../../sim/aerodynamics/activeFrontSplitterSDuctSolver';
import { AutonomousModelPredictiveController } from '../../sim/ai/autonomousModelPredictiveController';

export const MasterMultiPhysicsProvingDeck: React.FC = () => {
  const [engineLoad, setEngineLoad] = useState<number>(85);
  const [brakingPower, setBrakingPower] = useState<number>(240);
  const [splitterMode, setSplitterMode] = useState<ActiveSplitterMode>('TRACK_EXTENDED_DOWNFORCE');
  const [lateralOffset, setLateralOffset] = useState<number>(0.08);

  // 1. Solve 2500-Bar Piezo Injection
  const railState = CommonRailPiezoInjectorSolver.evaluateInjectionCycle({
    engineRpm: 4800,
    engineLoadPct: engineLoad,
  });

  // 2. Solve Carbon Ceramic Thermal FEA
  const ccmState = CarbonCeramicThermalStressFea.evaluateBrakeDiscStress({
    brakingPowerKwPerWheel: brakingPower,
  });

  // 3. Solve Active Front Splitter & S-Duct
  const frontAeroState = ActiveFrontSplitterSDuctSolver.evaluateFrontAerodynamics({
    vehicleSpeedKmh: 220,
    mode: splitterMode,
  });

  // 4. Solve MPC Path Tracker
  const mpcState = AutonomousModelPredictiveController.solveMpcTrajectory({
    vehicleSpeedKmh: 180,
    currentLateralOffsetM: lateralOffset,
    currentHeadingErrorDeg: 0.45,
    upcomingRoadCurvatureRadM: 0.008, // 125m radius corner
  });

  return (
    <div className="flex flex-col h-full w-full bg-slate-900/80 text-gray-100 p-4 gap-4 overflow-y-auto font-sans">
      {/* Studio Header Ribbon */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-slate-900/80 border border-[#182133] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">
              MASTER MULTI-PHYSICS & AUTONOMOUS PROVING GROUND DECK
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              2500-Bar Piezo Injector, Carbon-Ceramic Thermal FEA, Active Front S-Duct & Real-Time MPC
            </p>
          </div>
        </div>

        {/* Global Splitter Selector */}
        <select
          value={splitterMode}
          onChange={(e) => setSplitterMode(e.target.value as ActiveSplitterMode)}
          className="bg-slate-900/80 text-amber-400 text-xs font-bold font-mono px-3 py-1.5 rounded-xl border border-amber-500/40 cursor-pointer"
        >
          <option value="TRACK_EXTENDED_DOWNFORCE">Track Extended (+60mm / -3.5°)</option>
          <option value="DRS_HIGH_SPEED_TRIM">DRS High-Speed Trim</option>
          <option value="STREET_RETRACTED_CLEARANCE">Street Retracted (Max Clearance)</option>
        </select>
      </div>

      {/* Main 4-Card 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Card 1: 2500-Bar Piezo Common Rail */}
        <div className="flex flex-col p-4 rounded-2xl bg-slate-900/80 border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Flame className="w-4 h-4" />
              <span>2500-BAR PIEZO COMMON RAIL INJECTION</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              SMD: {railState.sauterMeanDiameterMicrons} μm
            </span>
          </div>

          {/* Engine Load Slider */}
          <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">ENGINE LOAD: {engineLoad}% ({railState.railPressureBar} bar)</span>
            <input
              type="range"
              min="10"
              max="100"
              value={engineLoad}
              onChange={(e) => setEngineLoad(Number(e.target.value))}
              className="w-32 accent-rose-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">FUEL MASS PER CYCLE</div>
              <div className="text-sm font-bold text-rose-400">{railState.totalFuelInjectedPerCycleMg} mg (5 Pulses)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">SOOT REDUCTION</div>
              <div className="text-sm font-bold text-emerald-400">{railState.sootReductionEfficiencyPct}% Clean</div>
            </div>
          </div>
        </div>

        {/* Card 2: Carbon-Ceramic Thermal Stress FEA */}
        <div className="flex flex-col p-4 rounded-2xl bg-slate-900/80 border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Disc className="w-4 h-4" />
              <span>CARBON-CERAMIC (CCM) THERMAL FEA</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400">
              {ccmState.peakSurfaceTempC}°C Surface
            </span>
          </div>

          {/* Braking Power Slider */}
          <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">BRAKE POWER: {brakingPower} kW/wheel</span>
            <input
              type="range"
              min="50"
              max="400"
              step="10"
              value={brakingPower}
              onChange={(e) => setBrakingPower(Number(e.target.value))}
              className="w-32 accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">HOOP STRESS</div>
              <div className="text-sm font-bold text-gray-200">{ccmState.peakThermoElasticHoopStressMpa} MPa</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">DELAMINATION SF</div>
              <div className="text-sm font-bold text-emerald-400">{ccmState.delaminationSafetyFactor}x Safe</div>
            </div>
          </div>
        </div>

        {/* Card 3: Active Front Splitter & S-Duct */}
        <div className="flex flex-col p-4 rounded-2xl bg-slate-900/80 border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Wind className="w-4 h-4" />
              <span>ACTIVE FRONT SPLITTER & S-DUCT</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400">
              Pitch: {frontAeroState.aerodynamicPitchBalanceFrontPct}% Front
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900/80 rounded-xl border border-[#141b2b] text-xs font-mono">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-[#182133]">
              <div className="text-gray-400 text-[10px]">SPLITTER LOAD</div>
              <div className="text-amber-400 font-bold">{frontAeroState.frontSplitterDownforceN} N</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/80 border border-[#182133]">
              <div className="text-gray-400 text-[10px]">S-DUCT JET LOAD</div>
              <div className="text-emerald-400 font-bold">{frontAeroState.hoodSDuctDownforceN} N</div>
            </div>
          </div>
        </div>

        {/* Card 4: Autonomous Model Predictive Control (MPC) */}
        <div className="flex flex-col p-4 rounded-2xl bg-slate-900/80 border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Navigation className="w-4 h-4" />
              <span>REAL-TIME MPC PATH TRACKER</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {mpcState.solverExecutionTimeMs}ms Convergence
            </span>
          </div>

          {/* Cross-track Slider */}
          <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">CROSS-TRACK ERROR: {lateralOffset} m</span>
            <input
              type="range"
              min="-0.5"
              max="0.5"
              step="0.02"
              value={lateralOffset}
              onChange={(e) => setLateralOffset(Number(e.target.value))}
              className="w-32 accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">STEERING COMMAND</div>
              <div className="text-sm font-bold text-amber-400">{mpcState.commandedSteeringAngleDeg}°</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">QP COST VALUE</div>
              <div className="text-sm font-bold text-emerald-400">{mpcState.qpOptimizationCost}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
