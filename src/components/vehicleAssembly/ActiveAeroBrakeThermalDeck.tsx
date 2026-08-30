// ============================================================================
// PHASE 38 — ACTIVE AERO & BRAKE THERMAL TELEMETRY DECK
// ============================================================================
// Interactive high-contrast dark telemetry dashboard visualizing active rear
// wing / DRS actuation, airbrake deflection, and 4-wheel brake thermal pyrometry.
// ============================================================================

import React, { useState } from 'react';
import { Wind, Flame, ShieldAlert, Gauge, Sparkles, Activity, Play } from 'lucide-react';
import { ActiveAerodynamicsActuatorSolver } from '../../sim/aerodynamics/activeAerodynamicsActuatorSolver';
import { BrakeThermalFadeModel, BrakeDiscMaterial } from '../../sim/brakes/brakeThermalFadeModel';
import { ActiveDifferentialTorqueVectoring } from '../../sim/drivetrain/activeDifferentialTorqueVectoring';

export const ActiveAeroBrakeThermalDeck: React.FC = () => {
  const [speedKmh, setSpeedKmh] = useState<number>(180);
  const [isBrakingHard, setIsBrakingHard] = useState<boolean>(false);
  const [drsPressed, setDrsPressed] = useState<boolean>(false);
  const [discMaterial, setDiscMaterial] = useState<BrakeDiscMaterial>('CARBON_CERAMIC_CSIC');

  // 1. Solve Active Aero State
  const aeroState = ActiveAerodynamicsActuatorSolver.evaluateActiveAeroTick({
    vehicleSpeedKmh: speedKmh,
    longitudinalAccelG: isBrakingHard ? -1.15 : 0.15,
    lateralAccelG: 0.45,
    driverDrsButtonPressed: drsPressed,
    steeringAngleDeg: 5,
  });

  // 2. Solve Brake Torture State
  const tortureResult = BrakeThermalFadeModel.simulateTortureCycle(discMaterial, 6, 1420);
  const currentStop = tortureResult.stops[tortureResult.stops.length - 1];

  // 3. Solve eLSD Torque Vectoring
  const diffState = ActiveDifferentialTorqueVectoring.evaluateDifferentialTick({
    mode: 'SPORT_DYNAMIC',
    inputTorqueNm: isBrakingHard ? 0 : 550,
    vehicleSpeedKmh: speedKmh,
    steeringWheelAngleDeg: 35,
    actualYawRateDegPerSec: 14.5,
    desiredYawRateDegPerSec: 16.2,
    leftWheelSlipRatio: 0.04,
    rightWheelSlipRatio: 0.08,
  });

  // Helper for Rotor Heatmap Color (Grey -> Amber -> Orange -> Glowing Red)
  const getRotorColor = (tempC: number) => {
    if (tempC < 250) return '#64748b'; // Cold Steel Grey
    if (tempC < 500) return '#f59e0b'; // Warm Amber
    if (tempC < 750) return '#f97316'; // Hot Orange
    return '#ef4444'; // Glowing Incandescent Red
  };

  return (
    <div className="flex flex-col h-full w-full bg-amber-950/60 text-gray-100 p-4 gap-4 overflow-y-auto font-sans">
      {/* Top Header Ribbon */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-amber-950/60 border border-[#182133] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500/20 to-orange-500/20 border border-rose-500/40 text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">
              ACTIVE AERO, THERMAL BRAKES & eLSD STUDIO
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              DRS Actuation, Carbon-Ceramic Pyrometry & Direct Yaw Vectoring
            </p>
          </div>
        </div>

        {/* Speed & Braking Interactive Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">SPEED:</span>
            <input
              type="range"
              min="0"
              max="320"
              value={speedKmh}
              onChange={(e) => setSpeedKmh(Number(e.target.value))}
              className="w-32 accent-amber-500 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-amber-400 w-16">{speedKmh} km/h</span>
          </div>

          <button
            onMouseDown={() => setIsBrakingHard(true)}
            onMouseUp={() => setIsBrakingHard(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isBrakingHard
                ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                : 'bg-amber-950/60 text-gray-300 border border-[#232e48] hover:bg-[#1c263d]'
            }`}
          >
            AIRBRAKE TEST (HOLD)
          </button>

          <button
            onClick={() => setDrsPressed(!drsPressed)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              drsPressed
                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-amber-950/60 text-gray-300 border border-[#232e48] hover:bg-[#1c263d]'
            }`}
          >
            DRS FLAP {drsPressed ? 'OPEN' : 'CLOSED'}
          </button>
        </div>
      </div>

      {/* Main 3-Column Engineering Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Column 1: Active Aerodynamics Actuator & Wing */}
        <div className="flex flex-col p-4 rounded-2xl bg-amber-950/60 border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Wind className="w-4 h-4" />
              <span>ACTIVE AERO DYNAMICS</span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              aeroState.airbrakeActive ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
              aeroState.drsActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
              'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            }`}>
              {aeroState.airbrakeActive ? 'AIRBRAKE DEPLOYED' : aeroState.drsActive ? 'DRS SPRINT' : 'HIGH DOWNFORCE'}
            </span>
          </div>

          {/* SVG Visualizer of Rear Wing Angle */}
          <div className="flex items-center justify-center p-4 bg-amber-950/60 rounded-xl border border-[#141b2b]">
            <svg viewBox="0 0 300 140" className="w-full h-32">
              <defs>
                <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>
              {/* Chassis Endplate Pylon */}
              <path d="M 60,110 L 140,65 L 145,70 L 65,115 Z" fill="#334155" />
              <path d="M 140,65 L 220,110 L 215,115 L 135,70 Z" fill="#334155" />
              {/* Rotating Rear Wing Main Aerofoil */}
              <g transform={`rotate(${-aeroState.rearWingAngleDeg}, 140, 65)`}>
                <rect x="50" y="58" width="180" height="14" rx="7" fill="url(#wingGrad)" />
                <rect x="40" y="48" width="12" height="34" rx="3" fill="#0284c7" />
                <rect x="228" y="48" width="12" height="34" rx="3" fill="#0284c7" />
              </g>
              <text x="140" y="130" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                WING ATTACK ANGLE: {aeroState.rearWingAngleDeg.toFixed(1)}°
              </text>
            </svg>
          </div>

          {/* Aero Telemetry Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">TOTAL DOWNFORCE</div>
              <div className="text-sm font-bold text-amber-400">{aeroState.currentTotalDownforceN} N</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">TOTAL DRAG</div>
              <div className="text-sm font-bold text-rose-400">{aeroState.currentTotalDragN} N</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">AERO BALANCE (F/R)</div>
              <div className="text-sm font-bold text-amber-400">{aeroState.centerOfPressureFrontPct}% F</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">EFFICIENCY (L/D)</div>
              <div className="text-sm font-bold text-emerald-400">{aeroState.aeroEfficiencyLOverD}</div>
            </div>
          </div>
        </div>

        {/* Column 2: 4-Wheel Brake Thermal Pyrometry Heatmap */}
        <div className="flex flex-col p-4 rounded-2xl bg-amber-950/60 border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs">
              <Flame className="w-4 h-4" />
              <span>4-WHEEL BRAKE PYROMETRY</span>
            </div>
            <select
              value={discMaterial}
              onChange={(e) => setDiscMaterial(e.target.value as BrakeDiscMaterial)}
              className="bg-amber-950/60 text-gray-300 text-[10px] font-mono px-2 py-1 rounded-lg border border-[#212c44] cursor-pointer"
            >
              <option value="CARBON_CERAMIC_CSIC">Carbon-Ceramic (C/SiC)</option>
              <option value="CAST_IRON_G3000">Cast Iron (G3000)</option>
            </select>
          </div>

          {/* 4-Wheel Rotor Heatmap Visual */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-amber-950/60 rounded-xl border border-[#141b2b] text-center">
            {/* Front Left */}
            <div className="p-2 rounded-lg bg-amber-950/60 border border-[#182133]">
              <div className="text-[10px] font-mono text-gray-400">FRONT LEFT</div>
              <div
                className="text-lg font-bold font-mono my-1"
                style={{ color: getRotorColor(currentStop.rotorTempFrontC) }}
              >
                {currentStop.rotorTempFrontC}°C
              </div>
              <div className="text-[9px] text-gray-500 font-mono">μ = {currentStop.currentFrictionCoeffMu}</div>
            </div>

            {/* Front Right */}
            <div className="p-2 rounded-lg bg-amber-950/60 border border-[#182133]">
              <div className="text-[10px] font-mono text-gray-400">FRONT RIGHT</div>
              <div
                className="text-lg font-bold font-mono my-1"
                style={{ color: getRotorColor(currentStop.rotorTempFrontC) }}
              >
                {currentStop.rotorTempFrontC}°C
              </div>
              <div className="text-[9px] text-gray-500 font-mono">μ = {currentStop.currentFrictionCoeffMu}</div>
            </div>

            {/* Rear Left */}
            <div className="p-2 rounded-lg bg-amber-950/60 border border-[#182133]">
              <div className="text-[10px] font-mono text-gray-400">REAR LEFT</div>
              <div
                className="text-lg font-bold font-mono my-1"
                style={{ color: getRotorColor(currentStop.rotorTempRearC) }}
              >
                {currentStop.rotorTempRearC}°C
              </div>
              <div className="text-[9px] text-gray-500 font-mono">μ = {currentStop.currentFrictionCoeffMu}</div>
            </div>

            {/* Rear Right */}
            <div className="p-2 rounded-lg bg-amber-950/60 border border-[#182133]">
              <div className="text-[10px] font-mono text-gray-400">REAR RIGHT</div>
              <div
                className="text-lg font-bold font-mono my-1"
                style={{ color: getRotorColor(currentStop.rotorTempRearC) }}
              >
                {currentStop.rotorTempRearC}°C
              </div>
              <div className="text-[9px] text-gray-500 font-mono">μ = {currentStop.currentFrictionCoeffMu}</div>
            </div>
          </div>

          {/* Fade & Stopping Distance Badges */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">200-0 KM/H DISTANCE</div>
              <div className="text-sm font-bold text-gray-100">{currentStop.stoppingDistanceM} m</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">FLUID TEMPERATURE</div>
              <div className={`text-sm font-bold ${currentStop.fluidBoilingWarning ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {currentStop.fluidTempC}°C
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Active eLSD & Direct Yaw Vectoring */}
        <div className="flex flex-col p-4 rounded-2xl bg-amber-950/60 border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Activity className="w-4 h-4" />
              <span>ACTIVE eLSD & VECTORING</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-indigo-500/40">
              SPORT DYNAMIC
            </span>
          </div>

          {/* Torque Split Dial */}
          <div className="flex flex-col items-center justify-center p-4 bg-amber-950/60 rounded-xl border border-[#141b2b] gap-2">
            <div className="text-xs font-mono text-gray-400">LEFT / RIGHT TORQUE SPLIT</div>
            <div className="flex items-center gap-4 text-base font-bold font-mono">
              <span className="text-amber-400">{diffState.torqueLeftNm} Nm</span>
              <span className="text-gray-600">|</span>
              <span className="text-rose-400">{diffState.torqueRightNm} Nm</span>
            </div>
            {/* Split Bar */}
            <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-amber-500 h-full transition-all"
                style={{ width: `${(diffState.torqueLeftNm / (diffState.torqueLeftNm + diffState.torqueRightNm || 1)) * 100}%` }}
              />
              <div
                className="bg-rose-500 h-full transition-all"
                style={{ width: `${(diffState.torqueRightNm / (diffState.torqueLeftNm + diffState.torqueRightNm || 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* eLSD Clutch Lockup Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CLUTCH LOCKUP</div>
              <div className="text-sm font-bold text-amber-400">{diffState.clutchLockPct}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">DIRECT YAW MOMENT</div>
              <div className="text-sm font-bold text-emerald-400">{diffState.directYawMomentNm} Nm</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
