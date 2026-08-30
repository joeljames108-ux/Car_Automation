// ============================================================================
// PHASE 63 — AUTONOMOUS EV PROVING GROUND & POWERTRAIN MASTER STUDIO
// ============================================================================
// Master high-contrast dark telemetry workstation visualizing Heat Pump P-h,
// Solid-State Battery Multi-Physics, Twin-Motor Torque Vectoring, and CFD Flowfields.
// ============================================================================

import React, { useState } from 'react';
import { Wind, Flame, BatteryCharging, Compass, Sparkles, Layers, Sliders, Activity } from 'lucide-react';
import { RefrigerantHeatPumpCycleSolver, RefrigerantType, HeatPumpOperatingMode } from '../../sim/thermal/refrigerantHeatPumpCycleSolver';
import { SolidStateLithiumMultiPhysics } from '../../sim/battery/solidStateLithiumMultiPhysics';
import { TwinMotorPlanetaryTorqueVectoring, TorqueVectoringControlMode } from '../../sim/drivetrain/twinMotorPlanetaryTorqueVectoring';

export const AutonomousEvProvingGroundDeck: React.FC = () => {
  const [refrigerant, setRefrigerant] = useState<RefrigerantType>('R1234yf_LOW_GWP');
  const [hpMode, setHpMode] = useState<HeatPumpOperatingMode>('CABIN_HEATING_HEAT_PUMP');
  const [batterySoc, setBatterySoc] = useState<number>(70);
  const [stackPressure, setStackPressure] = useState<number>(2.8);
  const [steerAngle, setSteerAngle] = useState<number>(22);

  // 1. Solve Heat Pump Cycle
  const hpState = RefrigerantHeatPumpCycleSolver.solveHeatPumpCycle({
    refrigerant,
    mode: hpMode,
    ambientTempC: -5.0,
  });

  // 2. Solve Solid-State Battery Multi-Physics
  const ssbState = SolidStateLithiumMultiPhysics.evaluateSolidStateCell({
    stateOfChargePct: batterySoc,
    dischargeChargeCurrentAmps: 180,
    stackPressureMpa: stackPressure,
  });

  // 3. Solve Twin-Motor Planetary Torque Vectoring
  const tvState = TwinMotorPlanetaryTorqueVectoring.evaluateTorqueVectoring({
    totalTorqueDemandNm: 1200,
    steeringWheelAngleDeg: steerAngle,
    vehicleSpeedKmh: 110,
    measuredYawRateDegSec: 14.5,
    targetYawRateDegSec: 18.0,
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
              AUTONOMOUS EV PROVING GROUND & ADVANCED POWERTRAIN STUDIO
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              Thermodynamic Heat Pump, Solid-State 450 Wh/kg Cell, Planetary e-Axle & Particle CFD
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <select
            value={refrigerant}
            onChange={(e) => setRefrigerant(e.target.value as RefrigerantType)}
            className="bg-slate-900/80 text-amber-400 text-xs font-bold font-mono px-3 py-1.5 rounded-xl border border-amber-500/40 cursor-pointer"
          >
            <option value="R1234yf_LOW_GWP">R1234yf Eco Refrigerant</option>
            <option value="R744_CO2_NATURAL">R744 (CO2 Transcritical)</option>
          </select>
        </div>
      </div>

      {/* Main 3-Column Engineering Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Column 1: Heat Pump P-h Vapor Compression */}
        <div className="flex flex-col p-4 rounded-2xl bg-slate-900/80 border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Flame className="w-4 h-4" />
              <span>HEAT PUMP REFRIGERANT CYCLE</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
              COP: {hpState.coefficientOfPerformanceCop}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-900/80 rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">MODE:</span>
            <select
              value={hpMode}
              onChange={(e) => setHpMode(e.target.value as HeatPumpOperatingMode)}
              className="bg-slate-900/80 text-gray-200 text-[10px] font-mono px-2 py-1 rounded-lg border border-[#212c44] cursor-pointer"
            >
              <option value="CABIN_HEATING_HEAT_PUMP">Cabin Heating (Heat Pump)</option>
              <option value="CABIN_COOLING_AC">Cabin Cooling (AC)</option>
              <option value="BATTERY_CHILLING_EXTREME">Battery Chilling (Fast Charge)</option>
            </select>
          </div>

          {/* Thermal Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">HEAT CAPACITY</div>
              <div className="text-sm font-bold text-rose-400">{hpState.heatingThermalCapacityKw} kW</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">COMPRESSOR POWER</div>
              <div className="text-sm font-bold text-gray-200">{hpState.compressorPowerConsumptionWatts} W</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">WASTE HEAT RECOVERY</div>
              <div className="text-sm font-bold text-emerald-400">{hpState.powertrainWasteHeatScavengedKw} kW</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CABIN SUPPLY AIR</div>
              <div className="text-sm font-bold text-amber-400">{hpState.cabinSupplyAirTempC}°C</div>
            </div>
          </div>
        </div>

        {/* Column 2: Solid-State Lithium Battery Model */}
        <div className="flex flex-col p-4 rounded-2xl bg-slate-900/80 border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <BatteryCharging className="w-4 h-4" />
              <span>SOLID-STATE LITHIUM MULTI-PHYSICS</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              {ssbState.gravimetricEnergyDensityWhPerKg} Wh/kg
            </span>
          </div>

          {/* Interactive Stack Pressure Slider */}
          <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">STACK PRELOAD: {stackPressure} MPa</span>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.2"
              value={stackPressure}
              onChange={(e) => setStackPressure(Number(e.target.value))}
              className="w-28 accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Cell Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">TERMINAL VOLTAGE</div>
              <div className="text-sm font-bold text-emerald-400">{ssbState.cellTerminalVoltageVolts} V</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">10-80% FAST CHARGE</div>
              <div className="text-sm font-bold text-amber-400">{ssbState.tenToEightyPctFastChargeTimeMin} min</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">DENDRITE SUPPRESSION</div>
              <div className="text-sm font-bold text-emerald-400">{ssbState.dendriteGrowthSuppressionIndexPct}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">JUNCTION TEMP</div>
              <div className="text-sm font-bold text-amber-400">{ssbState.cellJunctionTempC}°C</div>
            </div>
          </div>
        </div>

        {/* Column 3: Twin-Motor Planetary Torque Vectoring */}
        <div className="flex flex-col p-4 rounded-2xl bg-slate-900/80 border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Compass className="w-4 h-4" />
              <span>TWIN-MOTOR PLANETARY e-AXLE</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
              ΔT: {tvState.asymmetricTorqueDeltaNm} Nm
            </span>
          </div>

          {/* Steering Slider */}
          <div className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">STEERING ANGLE: {steerAngle}°</span>
            <input
              type="range"
              min="-45"
              max="45"
              value={steerAngle}
              onChange={(e) => setSteerAngle(Number(e.target.value))}
              className="w-28 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Motor Torque Split */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">LEFT MOTOR TORQUE</div>
              <div className="text-sm font-bold text-amber-400">{tvState.leftMotorTorqueNm} Nm</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">RIGHT MOTOR TORQUE</div>
              <div className="text-sm font-bold text-amber-400">{tvState.rightMotorTorqueNm} Nm</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">DIRECT YAW MOMENT</div>
              <div className="text-sm font-bold text-emerald-400">{tvState.directYawMomentGeneratedNm} Nm</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PLANETARY SUN SPEED</div>
              <div className="text-sm font-bold text-gray-200">{tvState.rightKinematics.sunSpeedRpm} RPM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
