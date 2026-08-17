// ============================================================================
// PHASE 53 — VIRTUAL PROVING GROUND 4WS & INVERTER DYNAMICS STUDIO
// ============================================================================
// Master high-contrast dark telemetry workstation visualizing Active 4WS,
// 800V SiC Inverter SVPWM junction thermals, and 3-Loop multi-fluid cooling.
// ============================================================================

import React, { useState } from 'react';
import { Compass, Flame, Droplets, ShieldAlert, Sparkles, Sliders, Zap, Activity } from 'lucide-react';
import { ActiveFourWheelSteeringKinematics, FourWheelSteeringMode } from '../../sim/suspension/activeFourWheelSteeringKinematics';
import { SicInverterThermalSolver } from '../../sim/powertrain/sicInverterThermalSolver';
import { MultiLoopThermalFluidSolver } from '../../sim/thermal/multiLoopThermalFluidSolver';
import { AntiRollBarTorsionalSolver } from '../../sim/suspension/antiRollBarTorsionalSolver';

export const VirtualProvingGroundStudioDeck: React.FC = () => {
  const [steerMode, setSteerMode] = useState<FourWheelSteeringMode>('AUTO_SPEED_ADAPTIVE');
  const [vehicleSpeed, setVehicleSpeed] = useState<number>(35);
  const [steerAngle, setSteerAngle] = useState<number>(25);
  const [switchingFreq, setSwitchingFreq] = useState<number>(20);

  // 1. Solve 4WS Kinematics
  const fwsState = ActiveFourWheelSteeringKinematics.evaluate4WSKinematics({
    mode: steerMode,
    vehicleSpeedKmh: vehicleSpeed,
    frontSteerAngleDeg: steerAngle,
  });

  // 2. Solve SiC Inverter Thermals
  const inverterState = SicInverterThermalSolver.evaluateSicInverterPerformance({
    switchingFreqKhz: switchingFreq,
    phaseCurrentRmsAmps: 340,
    inverterOutputPowerKw: 280,
  });

  // 3. Solve 3-Loop Multi-Fluid Thermals
  const thermalState = MultiLoopThermalFluidSolver.solveMultiLoopThermals({
    vehicleSpeedKmh: vehicleSpeed,
  });

  // 4. Solve Active ARB Roll Dynamics
  const arbState = AntiRollBarTorsionalSolver.solveVehicleRollEquilibrium({
    lateralAccelG: 1.15,
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#05070c] text-gray-100 p-4 gap-4 overflow-y-auto font-sans">
      {/* Studio Header Ribbon */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#090d16] border border-[#182133] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">
              VIRTUAL PROVING GROUND: 4WS, SiC INVERTER & MULTI-LOOP THERMAL STUDIO
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              Active 4-Wheel Steering Kinematics, 800V SiC SVPWM Thermals & 3-Loop Coolant Network
            </p>
          </div>
        </div>

        {/* Steering Mode Selector */}
        <select
          value={steerMode}
          onChange={(e) => setSteerMode(e.target.value as FourWheelSteeringMode)}
          className="bg-[#0e1424] text-cyan-400 text-xs font-bold font-mono px-3 py-1.5 rounded-xl border border-cyan-500/40 cursor-pointer"
        >
          <option value="AUTO_SPEED_ADAPTIVE">Auto Speed Adaptive</option>
          <option value="CRAB_WALK_DIAGONAL">Crab-Walk Diagonal</option>
          <option value="REDUCED_TURNING_RADIUS">Tight Turning Radius</option>
          <option value="HIGH_SPEED_STABILITY">High Speed Stability</option>
        </select>
      </div>

      {/* Main 3-Column Engineering Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Column 1: Active 4-Wheel Steering Telemetry */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Compass className="w-4 h-4" />
              <span>ACTIVE 4WS KINEMATICS</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              {fwsState.rearSteerPhase}
            </span>
          </div>

          {/* Interactive Speed & Steer Sliders */}
          <div className="flex flex-col gap-2 p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">VEHICLE SPEED: {vehicleSpeed} km/h</span>
              <input
                type="range"
                min="5"
                max="180"
                value={vehicleSpeed}
                onChange={(e) => setVehicleSpeed(Number(e.target.value))}
                className="w-28 accent-cyan-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">STEERING ANGLE: {steerAngle}°</span>
              <input
                type="range"
                min="-45"
                max="45"
                value={steerAngle}
                onChange={(e) => setSteerAngle(Number(e.target.value))}
                className="w-28 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* 4-Wheel Steering Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">REAR STEER ANGLE</div>
              <div className="text-sm font-bold text-cyan-400">{fwsState.rearSteerAngleDeg}°</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">TURNING RADIUS</div>
              <div className="text-sm font-bold text-emerald-400">{fwsState.effectiveTurningRadiusM} m</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">RADIUS REDUCTION</div>
              <div className="text-sm font-bold text-amber-400">-{fwsState.turningRadiusReductionPct}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">SIDESLIP ANGLE (β)</div>
              <div className="text-sm font-bold text-indigo-400">{fwsState.sideSlipAngleBetaDeg}°</div>
            </div>
          </div>
        </div>

        {/* Column 2: 800V SiC Inverter SVPWM Thermals */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>800V SiC INVERTER THERMALS</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              {inverterState.inverterElectricalEfficiencyPct}% Eff
            </span>
          </div>

          {/* Switching Frequency Slider */}
          <div className="flex flex-col gap-2 p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">SVPWM FREQUENCY: {switchingFreq} kHz</span>
              <input
                type="range"
                min="10"
                max="40"
                step="5"
                value={switchingFreq}
                onChange={(e) => setSwitchingFreq(Number(e.target.value))}
                className="w-28 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Inverter Loss & Temperature Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">MOSFET JUNCTION TEMP</div>
              <div className="text-sm font-bold text-rose-400">{inverterState.mosfetJunctionTempC}°C</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">TOTAL INVERTER LOSS</div>
              <div className="text-sm font-bold text-amber-400">{inverterState.totalInverterLossWatts} W</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CONDUCTION LOSS</div>
              <div className="text-sm font-bold text-gray-200">{inverterState.conductionLossWatts} W</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">SWITCHING LOSS</div>
              <div className="text-sm font-bold text-gray-200">{inverterState.switchingLossWatts} W</div>
            </div>
          </div>
        </div>

        {/* Column 3: 3-Loop Multi-Fluid Thermal System */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Droplets className="w-4 h-4" />
              <span>3-LOOP THERMAL COOLANT NETWORK</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400">
              {thermalState.totalThermalHeatRejectedKw} kW Total Heat
            </span>
          </div>

          {/* 3 Distinct Loops */}
          <div className="flex flex-col gap-2 p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            {/* Loop 1: High-Temp ICE */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#0a0f1c] border border-[#182133]">
              <div>
                <div className="text-rose-400 font-bold text-[11px]">HIGH-TEMP ICE LOOP</div>
                <div className="text-gray-400 text-[9px]">{thermalState.highTempIceLoop.flowRateLpm} L/min • {thermalState.highTempIceLoop.heatLoadKw} kW</div>
              </div>
              <span className="text-rose-400 font-bold">{thermalState.highTempIceLoop.outletTempC}°C</span>
            </div>

            {/* Loop 2: Mid-Temp Inverter */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#0a0f1c] border border-[#182133]">
              <div>
                <div className="text-amber-400 font-bold text-[11px]">MID-TEMP INVERTER LOOP</div>
                <div className="text-gray-400 text-[9px]">{thermalState.midTempEInverterLoop.flowRateLpm} L/min • {thermalState.midTempEInverterLoop.heatLoadKw} kW</div>
              </div>
              <span className="text-amber-400 font-bold">{thermalState.midTempEInverterLoop.outletTempC}°C</span>
            </div>

            {/* Loop 3: Low-Temp Battery Chiller */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#0a0f1c] border border-[#182133]">
              <div>
                <div className="text-cyan-400 font-bold text-[11px]">LOW-TEMP BATTERY CHILLER</div>
                <div className="text-gray-400 text-[9px]">{thermalState.lowTempBatteryChillerLoop.flowRateLpm} L/min • COP {thermalState.chillerCopEfficiency}</div>
              </div>
              <span className="text-cyan-400 font-bold">{thermalState.lowTempBatteryChillerLoop.outletTempC}°C</span>
            </div>
          </div>

          {/* Active ARB Roll Stiffness */}
          <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d] text-xs font-mono">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-[10px]">ACTIVE ARB ROLL ANGLE:</span>
              <span className="text-emerald-400 font-bold">{arbState.compensatedChassisRollAngleDeg}° (at 1.15g)</span>
            </div>
            <div className="text-[9px] text-gray-500">
              Front Bias: {arbState.frontRollStiffnessDistributionPct}% • Counter-Torque: {arbState.activeArbCounterTorqueNm} Nm
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
