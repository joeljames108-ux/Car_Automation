// ============================================================================
// PHASE 58 — VEHICLE DYNAMICS, CFRP MONOCOQUE & BRAKE-BY-WIRE STUDIO
// ============================================================================
// Master high-contrast dark telemetry workstation visualizing PMSM Rotor FEA,
// CFRP Tsai-Wu Failure, Dual-Chamber Air Suspension, and Brake-by-Wire Blending.
// ============================================================================

import React, { useState } from 'react';
import { Cpu, ShieldCheck, Wind, Gauge, Sparkles, Layers, Sliders, Activity } from 'lucide-react';
import { PmsmFluxWeakeningRotorFea } from '../../sim/powertrain/pmsmFluxWeakeningRotorFea';
import { CfrpMonocoqueLayupSolver } from '../../exterior3d/chassis/cfrpMonocoqueLayupSolver';
import { DualChamberAirSuspensionSolver, AirSuspensionRideHeightMode } from '../../sim/suspension/dualChamberAirSuspensionSolver';
import { BrakeByWireBlendingSolver } from '../../sim/brakes/brakeByWireBlendingSolver';

export const VehicleDynamicsCompositeStudioDeck: React.FC = () => {
  const [motorRpm, setMotorRpm] = useState<number>(18500);
  const [heightMode, setHeightMode] = useState<AirSuspensionRideHeightMode>('COMFORT_STANDARD');
  const [pedalTravel, setPedalTravel] = useState<number>(28);

  // 1. Solve PMSM Flux Weakening & Rotor Stress
  const motorState = PmsmFluxWeakeningRotorFea.evaluateMotorOperatingPoint({
    rotorSpeedRpm: motorRpm,
    demandedTorqueNm: 450,
  });

  // 2. Solve CFRP Monocoque Layup & Tsai-Wu Failure
  const cfrpState = CfrpMonocoqueLayupSolver.evaluateMonocoqueLaminate({
    repeats: 3, // 24-ply quasi-isotropic
  });

  // 3. Solve Dual-Chamber Air Suspension
  const airState = DualChamberAirSuspensionSolver.evaluateAirSuspension({
    mode: heightMode,
  });

  // 4. Solve Brake-by-Wire Blending
  const bbwState = BrakeByWireBlendingSolver.evaluateBrakeBlending({
    pedalTravelMm: pedalTravel,
    vehicleSpeedKmh: 85,
    batterySocPct: 65,
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#05070c] text-gray-100 p-4 gap-4 overflow-y-auto font-sans">
      {/* Studio Header Ribbon */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#090d16] border border-[#182133] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">
              VEHICLE DYNAMICS, CFRP MONOCOQUE & BRAKE-BY-WIRE STUDIO
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              22k RPM PMSM Rotor FEA, Classical Laminate Tsai-Wu, Dual-Chamber Air & Decoupled BBW
            </p>
          </div>
        </div>

        {/* Height Mode Selector */}
        <select
          value={heightMode}
          onChange={(e) => setHeightMode(e.target.value as AirSuspensionRideHeightMode)}
          className="bg-[#0e1424] text-cyan-400 text-xs font-bold font-mono px-3 py-1.5 rounded-xl border border-cyan-500/40 cursor-pointer"
        >
          <option value="COMFORT_STANDARD">Comfort Standard (0 mm)</option>
          <option value="AERO_HIGH_SPEED">Aero High-Speed (-35 mm)</option>
          <option value="OFF_ROAD_HIGH">Off-Road High (+50 mm)</option>
          <option value="ACCESS_PARK_LOW">Access / Park (-60 mm)</option>
        </select>
      </div>

      {/* Main 4-Card 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Card 1: PMSM Motor Flux Weakening & 22k RPM Rotor FEA */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Cpu className="w-4 h-4" />
              <span>PMSM ROTOR CENTRIFUGAL FEA & FLUX WEAKENING</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              {motorState.isFluxWeakeningActive ? 'FLUX WEAKENING' : 'BASE MTPA'}
            </span>
          </div>

          {/* Interactive RPM Slider */}
          <div className="flex items-center justify-between p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">ROTOR SPEED: {motorRpm.toLocaleString()} RPM</span>
            <input
              type="range"
              min="1000"
              max="22000"
              step="500"
              value={motorRpm}
              onChange={(e) => setMotorRpm(Number(e.target.value))}
              className="w-36 accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">DELIVERED POWER</div>
              <div className="text-sm font-bold text-cyan-400">{motorState.powerKw} kW ({Math.round(motorState.powerKw * 1.341)} BHP)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">d-q AXIS CURRENTS</div>
              <div className="text-sm font-bold text-amber-400">Id: {motorState.idCurrentAmps}A • Iq: {motorState.iqCurrentAmps}A</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CARBON SLEEVE HOOP STRESS</div>
              <div className="text-sm font-bold text-rose-400">{motorState.rotorMaxHoopStressMpa} MPa</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">BURST SAFETY FACTOR</div>
              <div className="text-sm font-bold text-emerald-400">{motorState.carbonSleeveSafetyFactor}x</div>
            </div>
          </div>
        </div>

        {/* Card 2: CFRP Monocoque Ply Layup & Tsai-Wu Failure */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>CFRP MONOCOQUE AUTOCLAVE COMPOSITE</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              TSAI-WU FI: {cfrpState.tsaiWuMaxFailureIndex}
            </span>
          </div>

          <div className="p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono text-gray-300">
            <div className="text-gray-400 text-[10px] mb-0.5">LAMINATE SCHEDULE</div>
            <div className="text-cyan-400 font-bold">{cfrpState.laminateSchedule}</div>
          </div>

          {/* Composite Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">TORSIONAL RIGIDITY</div>
              <div className="text-sm font-bold text-cyan-400">{cfrpState.torsionalRigidityKNmPerDeg} kNm/deg</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">BARE TUB MASS</div>
              <div className="text-sm font-bold text-emerald-400">{cfrpState.monocoqueBareTubMassKg} kg</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">IN-PLANE STIFFNESS (A11)</div>
              <div className="text-sm font-bold text-gray-100">{cfrpState.a11StiffnessKnPerMm} kN/mm</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">RESERVE FACTOR</div>
              <div className="text-sm font-bold text-emerald-400">{cfrpState.reserveFactor}x Safe</div>
            </div>
          </div>
        </div>

        {/* Card 3: Dual-Chamber Air Suspension */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Wind className="w-4 h-4" />
              <span>DUAL-CHAMBER AIR SUSPENSION</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-400">
              Clearance: {airState.chassisGroundClearanceMm} mm
            </span>
          </div>

          {/* 4-Corner Air Springs */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            {Object.values(airState.corners).map((c) => (
              <div key={c.corner} className="p-2 rounded-lg bg-[#0a0f1c] border border-[#182133]">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>CORNER {c.corner}</span>
                  <span className={c.isAuxiliaryChamberEngaged ? 'text-emerald-400' : 'text-amber-400'}>
                    {c.isAuxiliaryChamberEngaged ? 'V1+V2 SOFT' : 'V1 FIRM'}
                  </span>
                </div>
                <div className="text-cyan-400 font-bold">{c.effectiveSpringRateNPerMm} N/mm</div>
                <div className="text-[9px] text-gray-500">{c.airSpringPressureBar} bar • {c.springForceN} N</div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Brake-by-Wire Blending */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Activity className="w-4 h-4" />
              <span>DECOUPLED BRAKE-BY-WIRE BLENDING</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {bbwState.regenerativeSharePct}% Electric Regen
            </span>
          </div>

          {/* Pedal Slider */}
          <div className="flex items-center justify-between p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">PEDAL TRAVEL: {pedalTravel} mm ({bbwState.pedalResistanceForceN} N)</span>
            <input
              type="range"
              min="0"
              max="45"
              value={pedalTravel}
              onChange={(e) => setPedalTravel(Number(e.target.value))}
              className="w-32 accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Torque Split */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">ELECTRIC REGEN TORQUE</div>
              <div className="text-sm font-bold text-emerald-400">{bbwState.electricMotorRegenTorqueNm} Nm</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">HYDRAULIC FRICTION TORQUE</div>
              <div className="text-sm font-bold text-rose-400">{bbwState.frictionHydraulicTorqueNm} Nm ({bbwState.hydraulicCaliperPressureBar} bar)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
