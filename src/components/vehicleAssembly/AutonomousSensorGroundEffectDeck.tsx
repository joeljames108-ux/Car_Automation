// ============================================================================
// PHASE 68 — AUTONOMOUS SENSOR FUSION & GROUND EFFECT MASTER STUDIO
// ============================================================================
// Master high-contrast dark telemetry workstation visualizing Active Venturi
// Diffusers, 4-Wheel Tire Thermal/Wear Pyrometry, ADAS Sensor Fusion, and eHRC.
// ============================================================================

import React, { useState } from 'react';
import { Wind, ShieldAlert, Disc, Sliders, Sparkles, Activity, Gauge, Eye } from 'lucide-react';
import { ActiveVenturiDiffuserSolver } from '../../sim/aerodynamics/activeVenturiDiffuserSolver';
import { TireThermalWearDegradationSolver, TireCompoundType } from '../../sim/tires/tireThermalWearDegradationSolver';
import { SensorFusionKalmanFilter } from '../../sim/adas/sensorFusionKalmanFilter';
import { ActiveElectroHydraulicRollControl } from '../../sim/suspension/activeElectroHydraulicRollControl';

export const AutonomousSensorGroundEffectDeck: React.FC = () => {
  const [diffuserAngle, setDiffuserAngle] = useState<number>(11.5);
  const [compound, setCompound] = useState<TireCompoundType>('MEDIUM_CIRCUIT_SLICK');
  const [lateralG, setLateralG] = useState<number>(0.95);

  // 1. Solve Venturi Ground Effect
  const venturiState = ActiveVenturiDiffuserSolver.solveGroundEffectAerodynamics({
    vehicleSpeedKmh: 190,
    frontRideHeightMm: 32,
    rearRideHeightMm: 52,
    diffuserRampAngleDeg: diffuserAngle,
  });

  // 2. Solve 4-Wheel Tire Pyrometry
  const tireState = TireThermalWearDegradationSolver.evaluateTireThermalsAndWear({
    compound,
    wheelSlipRatios: { fl: 0.08, fr: 0.09, rl: 0.07, rr: 0.08 },
    wheelSlipAnglesDeg: { fl: 4.2, fr: 4.8, rl: 3.1, rr: 3.5 },
    wheelNormalLoadsN: { fl: 4200, fr: 5800, rl: 3600, rr: 5200 },
    vehicleSpeedKmh: 190,
    lapsCompleted: 8,
  });

  // 3. Solve ADAS EKF Fusion
  const adasState = SensorFusionKalmanFilter.processSensorFusion({
    egoVehicleSpeedKmh: 190,
  });

  // 4. Solve eHRC Hydraulic Roll Control
  const ehrcState = ActiveElectroHydraulicRollControl.evaluateActiveRollControl({
    lateralAccelerationG: lateralG,
    vehicleSpeedKmh: 190,
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#05070c] text-gray-100 p-4 gap-4 overflow-y-auto font-sans">
      {/* Studio Header Ribbon */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#090d16] border border-[#182133] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-500/20 border border-amber-500/40 text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">
              AUTONOMOUS SENSOR FUSION & GROUND EFFECT MASTER STUDIO
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              Active Venturi Diffuser, 4-Wheel Pyrometry, 128-Beam LiDAR/Radar EKF, and 180-Bar eHRC
            </p>
          </div>
        </div>

        {/* Global Compound Selector */}
        <select
          value={compound}
          onChange={(e) => setCompound(e.target.value as TireCompoundType)}
          className="bg-[#0e1424] text-amber-400 text-xs font-bold font-mono px-3 py-1.5 rounded-xl border border-amber-500/40 cursor-pointer"
        >
          <option value="ULTRA_SOFT_QUALIFYING">Ultra Soft Qualifying (Peak μ 1.78)</option>
          <option value="MEDIUM_CIRCUIT_SLICK">Medium Circuit Slick (Peak μ 1.62)</option>
          <option value="HARD_ENDURANCE_SLICK">Hard Endurance Slick (Peak μ 1.48)</option>
          <option value="ALL_SEASON_ROAD">All Season Road (Peak μ 1.15)</option>
        </select>
      </div>

      {/* Main 4-Card 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Card 1: Active Underbody Venturi Diffuser */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Wind className="w-4 h-4" />
              <span>ACTIVE UNDERBODY VENTURI DIFFUSER</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
              L/D: {venturiState.groundEffectEfficiencyLOverD}
            </span>
          </div>

          {/* Diffuser Angle Slider */}
          <div className="flex items-center justify-between p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">DIFFUSER RAMP: {diffuserAngle}°</span>
            <input
              type="range"
              min="5"
              max="18"
              step="0.5"
              value={diffuserAngle}
              onChange={(e) => setDiffuserAngle(Number(e.target.value))}
              className="w-36 accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">UNDERBODY DOWNFORCE</div>
              <div className="text-sm font-bold text-amber-400">{venturiState.totalUnderbodyDownforceN} N</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">THROAT SUCTION Cp</div>
              <div className="text-sm font-bold text-rose-400">{venturiState.throatSuctionCpMin}</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CENTER OF PRESSURE (CP)</div>
              <div className="text-sm font-bold text-amber-400">{venturiState.centerOfPressurePctFront}% Front</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">VORTEX SEALING</div>
              <div className="text-sm font-bold text-emerald-400">{venturiState.vortexSealIntensityPct}%</div>
            </div>
          </div>
        </div>

        {/* Card 2: 4-Wheel Tire Thermal Pyrometry & Wear */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Disc className="w-4 h-4" />
              <span>4-WHEEL TIRE THERMALS & WEAR LIFE</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              Opt: {tireState.optimalThermalWindowC.min}-{tireState.optimalThermalWindowC.max}°C
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            {[tireState.fl, tireState.fr, tireState.rl, tireState.rr].map((t) => (
              <div key={t.corner} className="p-2 rounded-lg bg-[#0a0f1c] border border-[#182133]">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>TIRE {t.corner}</span>
                  <span className="text-emerald-400">{t.remainingTreadLifePct}% Life</span>
                </div>
                <div className="text-amber-400 font-bold">{t.treadBulkTempC}°C • μ {t.effectiveFrictionMu}</div>
                <div className="text-[9px] text-gray-500">Carcass: {t.carcassTempC}°C • Grip: {t.thermalGripEfficiencyPct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: ADAS Multi-Sensor EKF Fusion */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Eye className="w-4 h-4" />
              <span>ADAS MULTI-SENSOR EKF TRACKER</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40">
              TTC: {adasState.minTimeToCollisionSeconds}s
            </span>
          </div>

          <div className="p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono text-gray-300">
            <div className="text-gray-400 text-[10px] mb-1">PRIMARY LEAD VEHICLE TRACK</div>
            <div className="text-amber-400 font-bold">
              Range: {adasState.primaryLeadVehicle?.posYMetres}m • Vel: {Math.round((adasState.primaryLeadVehicle?.velocityMs || 0) * 3.6)} km/h
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">
              LiDAR: ✅ • Radar: ✅ • Camera: ✅ (100 Hz Fusion)
            </div>
          </div>
        </div>

        {/* Card 4: Active Electro-Hydraulic Roll Control (eHRC) */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Activity className="w-4 h-4" />
              <span>ACTIVE HYDRAULIC ROLL CONTROL (eHRC)</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              Roll: {ehrcState.chassisRollSuppressionAngleDeg}°
            </span>
          </div>

          {/* Lateral G Slider */}
          <div className="flex items-center justify-between p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">LATERAL ACCEL: {lateralG}g</span>
            <input
              type="range"
              min="0"
              max="1.3"
              step="0.05"
              value={lateralG}
              onChange={(e) => setLateralG(Number(e.target.value))}
              className="w-32 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">COUNTER-TORQUE</div>
              <div className="text-sm font-bold text-emerald-400">{ehrcState.rotaryActuatorTorqueNm} Nm</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">HYDRAULIC PRESSURE</div>
              <div className="text-sm font-bold text-gray-200">{ehrcState.hydraulicSystemPressureBar} bar ({ehrcState.counterTorqueResponseTimeMs}ms)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
