// ============================================================================
// PHASE 89 — MASTER ZERO-EMISSION HIGH-PERFORMANCE PROVING STUDIO DECK
// ============================================================================
// Master high-contrast dark telemetry workstation visualizing:
//   - FCEV PEMFC Polarization & 700-Bar Type-IV Hydrogen Storage
//   - Direct Dielectric Liquid Immersion & Runaway Cascading Suppression
//   - 8-Speed Wet Dual-Clutch Transmission Electro-Hydraulics & Micro-Slip
//   - Dual-Axis Active Aerodynamic Rear Wing & Hinge Moments
//   - Minimum-Lap-Time Autonomous Racing Collocation Trajectory Optimizer
// ============================================================================

import React, { useState } from 'react';
import { Zap, Droplets, Gauge, Wind, Timer, Flame, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { PemfcHydrogenPowertrainSolver } from '../../sim/powertrain/pemfcHydrogenPowertrainSolver';
import { ImmersionCoolingThermalRunawaySolver, DielectricFluidType } from '../../sim/thermal/immersionCoolingThermalRunawaySolver';
import { WetDctHydraulicClutchSolver } from '../../sim/transmission/wetDctHydraulicClutchSolver';
import { ActiveRearWingKinematicsCad, ActiveWingPresetMode } from '../../sim/aerodynamics/activeRearWingKinematicsCad';
import { MinimumLapTimeTrajectoryOptimizer } from '../../sim/racing/minimumLapTimeTrajectoryOptimizer';

export const ZeroEmissionHighPerformanceStudioDeck: React.FC = () => {
  const [fcevPowerDemand, setFcevPowerDemand] = useState<number>(85);
  const [fluidType, setFluidType] = useState<DielectricFluidType>('HYDROFLUOROETHER');
  const [triggerRunaway, setTriggerRunaway] = useState<boolean>(false);
  const [wingMode, setWingMode] = useState<ActiveWingPresetMode>('MID_DOWNFORCE_CORNERING');
  const [dctShiftProgress, setDctShiftProgress] = useState<number>(50);

  // 1. Solve PEMFC Hydrogen Powertrain
  const fcevState = PemfcHydrogenPowertrainSolver.solveFcevPowertrain({
    demandedNetPowerKw: fcevPowerDemand,
    hydrogenTankSocPct: 88.0,
  });

  // 2. Solve Immersion Cooling
  const immersionState = ImmersionCoolingThermalRunawaySolver.solveImmersionThermalSystem({
    fluidType,
    triggerCellRunawayIndex: triggerRunaway ? 12 : null,
    cellDischargeRateC: 4.5,
  });

  // 3. Solve Wet DCT Clutch Handover
  const dctState = WetDctHydraulicClutchSolver.solveDctShift({
    currentGear: 3,
    targetGear: 4,
    engineSpeedRpm: 6800,
    engineTorqueNm: 620,
    shiftTimeOffsetMs: (dctShiftProgress / 100.0) * 120.0,
  });

  // 4. Solve Active Rear Wing Kinematics
  const wingState = ActiveRearWingKinematicsCad.solveWingKinematics({
    vehicleSpeedKmh: 245,
    mode: wingMode,
  });

  // 5. Solve Minimum-Lap-Time Optimizer
  const lapTimeState = MinimumLapTimeTrajectoryOptimizer.optimizeTrackLapTime({
    vehicleMassKg: 1450,
    peakPowerKw: 920,
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#05070c] text-gray-100 p-4 gap-4 overflow-y-auto font-sans">
      {/* Studio Header Ribbon */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#090d16] border border-[#182133] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-emerald-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">
              ZERO-EMISSION HIGH-PERFORMANCE PROVING STUDIO DECK
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              PEMFC 700-Bar H2 ▸ Immersion CFD ▸ Wet DCT Micro-Slip ▸ Dual-Axis Aero ▸ Direct Collocation Lap Optimizer
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono cursor-pointer bg-[#0e1424] px-3 py-1.5 rounded-xl border border-rose-500/30">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className={triggerRunaway ? 'text-rose-400 font-bold' : 'text-gray-400'}>NAIL SHORT SIM</span>
            <input
              type="checkbox"
              checked={triggerRunaway}
              onChange={(e) => setTriggerRunaway(e.target.checked)}
              className="accent-rose-500"
            />
          </label>

          <select
            value={wingMode}
            onChange={(e) => setWingMode(e.target.value as ActiveWingPresetMode)}
            className="bg-[#0e1424] text-cyan-400 text-xs font-bold font-mono px-3 py-1.5 rounded-xl border border-cyan-500/40 cursor-pointer"
          >
            <option value="STOWED_RETRACTED">Wing Retracted (0mm / 0°)</option>
            <option value="DRS_LOW_DRAG">DRS Low Drag (180mm / -3.5°)</option>
            <option value="MID_DOWNFORCE_CORNERING">Cornering Mid (220mm / +14.5°)</option>
            <option value="MAX_DOWNFORCE_QUALIFYING">Quali Max (285mm / +24°)</option>
            <option value="AIRBRAKE_DECELERATION">Airbrake Decel (300mm / +46.5°)</option>
          </select>
        </div>
      </div>

      {/* Main 5-Card 3x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {/* Card 1: PEMFC & 700-Bar H2 Storage */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>PEMFC & 700-BAR H2 STORAGE</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {fcevState.systemOverallEfficiencyPct}% System Eff
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">DEMAND: {fcevPowerDemand} kW</span>
            <input
              type="range"
              min="10"
              max="125"
              value={fcevPowerDemand}
              onChange={(e) => setFcevPowerDemand(Number(e.target.value))}
              className="w-28 accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CELL VOLTAGE</div>
              <div className="text-cyan-400 font-bold">{fcevState.stack.cellOperatingVoltageV} V</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">700-BAR TANK</div>
              <div className="text-emerald-400 font-bold">{fcevState.tank.currentPressureBar} bar</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">RANGE (5.6kg H2)</div>
              <div className="text-gray-200 font-bold">{fcevState.estimatedVehicleRangeKm} km</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">BoP PARASITIC</div>
              <div className="text-rose-400 font-bold">{fcevState.stack.bopParasiticPowerKw} kW</div>
            </div>
          </div>
        </div>

        {/* Card 2: Liquid Immersion Battery CFD */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Droplets className="w-4 h-4" />
              <span>DIRECT LIQUID IMMERSION CFD</span>
            </div>
            <span className={`text-[10px] font-mono font-bold ${immersionState.isThermalRunawayContained ? 'text-emerald-400' : 'text-rose-400'}`}>
              {immersionState.isThermalRunawayContained ? '✓ RUNAWAY CONTAINED' : '✗ CASCADING PROPAGATION'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">FLUID:</span>
            <select
              value={fluidType}
              onChange={(e) => setFluidType(e.target.value as DielectricFluidType)}
              className="bg-[#0e1424] text-emerald-400 text-xs font-mono px-2 py-1 rounded border border-emerald-500/30"
            >
              <option value="HYDROFLUOROETHER">Hydrofluoroether (Novec)</option>
              <option value="SYNTHETIC_ISOPARAFFIN">Synthetic Isoparaffin</option>
              <option value="SYNTHETIC_ESTER">Synthetic Ester</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CONVECTIVE HTC</div>
              <div className="text-emerald-400 font-bold">{immersionState.meanConvectiveHtcWPerM2K} W/m²K</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PEAK CELL TEMP</div>
              <div className={`font-bold ${immersionState.peakCellTemperatureCelsius > 60 ? 'text-rose-400' : 'text-cyan-400'}`}>
                {immersionState.peakCellTemperatureCelsius} °C
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CHF MARGIN</div>
              <div className="text-emerald-400 font-bold">{immersionState.propagationSafetyMarginFactor}x Safe</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">MAX FAST CHARGE</div>
              <div className="text-purple-400 font-bold">{immersionState.maxAllowableFastChargeRateC} C Continuous</div>
            </div>
          </div>
        </div>

        {/* Card 3: Wet DCT Electro-Hydraulic Clutch */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Gauge className="w-4 h-4" />
              <span>8-SPEED WET DCT (G3 → G4)</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400">
              {dctState.shiftPhase}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">SHIFT: {dctShiftProgress}% ({(dctShiftProgress * 1.2).toFixed(0)} ms)</span>
            <input
              type="range"
              min="0"
              max="100"
              value={dctShiftProgress}
              onChange={(e) => setDctShiftProgress(Number(e.target.value))}
              className="w-28 accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">C1 ODD CLAMP</div>
              <div className="text-rose-400 font-bold">{dctState.clutch1.actualPressureBar} bar ({dctState.clutch1.transmittedTorqueNm} Nm)</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">C2 EVEN CLAMP</div>
              <div className="text-emerald-400 font-bold">{dctState.clutch2.actualPressureBar} bar ({dctState.clutch2.transmittedTorqueNm} Nm)</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">TORQUE DIP</div>
              <div className="text-emerald-400 font-bold">{dctState.torqueInterruptionDipPct}% (Seamless)</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">FLASH TEMP</div>
              <div className="text-amber-400 font-bold">{dctState.clutch2.flashPeakTempCelsius} °C</div>
            </div>
          </div>
        </div>

        {/* Card 4: Dual-Axis Active Rear Wing */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
              <Wind className="w-4 h-4" />
              <span>DUAL-AXIS ACTIVE REAR WING</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-400">
              L/D: {wingState.aeroForces.liftToDragRatio}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">HEIGHT / ANGLE</div>
              <div className="text-purple-400 font-bold">{wingState.currentHeightMm} mm / {wingState.currentAngleOfAttackDeg}°</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">DOWNFORCE @ 245km/h</div>
              <div className="text-cyan-400 font-bold">{wingState.aeroForces.downforceNewtons} N</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">DRAG FORCE</div>
              <div className="text-rose-400 font-bold">{wingState.aeroForces.dragForceNewtons} N</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">HINGE MOMENT</div>
              <div className="text-emerald-400 font-bold">{wingState.aeroForces.aerodynamicHingeMomentNm} Nm (Safe)</div>
            </div>
          </div>
        </div>

        {/* Card 5: Minimum-Lap-Time Autonomous Optimizer */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3 md:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Timer className="w-4 h-4" />
              <span>MINIMUM-LAP-TIME DIRECT COLLOCATION OPTIMIZER (SILVERSTONE GP)</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              LAP: {lapTimeState.totalLapTimeSec}s (Avg {lapTimeState.averageSpeedKmh} km/h)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">TOP SPEED</div>
              <div className="text-cyan-400 font-bold">{lapTimeState.topSpeedKmh} km/h</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PEAK LATERAL G</div>
              <div className="text-purple-400 font-bold">{lapTimeState.peakLateralG} G</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PEAK BRAKING</div>
              <div className="text-rose-400 font-bold">-{lapTimeState.peakBrakingG} G</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">ENERGY / LAP</div>
              <div className="text-emerald-400 font-bold">{lapTimeState.energyConsumptionKwh} kWh</div>
            </div>
          </div>

          <div className="p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-[11px] font-mono text-gray-400 flex items-center justify-between">
            <span>Direct Collocation Converged in {lapTimeState.optimizationIterations} Iterations</span>
            <span className="text-emerald-400">Track Length: {lapTimeState.totalTrackLengthM}m (14 Apexes)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
