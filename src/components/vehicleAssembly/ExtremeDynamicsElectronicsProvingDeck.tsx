// ============================================================================
// PHASE 94 — MASTER EXTREME DYNAMICS, ELECTRONICS & AEROMECHANICS PROVING DECK
// ============================================================================
// Master high-contrast dark telemetry workstation visualizing:
//   - Ground-Effect Diffuser Porpoising & Active Damping Stabilization
//   - 3-Level Flying-Capacitor Inverter dv/dt Motor Insulation Stress
//   - Brake Fluid Vapor Lock & Dynamic Pad Knockback Pre-Fill Pulses
//   - Elastic Band Autonomous Collision Avoidance Path Planner
// ============================================================================

import React, { useState } from 'react';
import { Activity, ShieldAlert, Cpu, Disc, Navigation, Sparkles, Sliders, ToggleLeft, ToggleRight } from 'lucide-react';
import { ActiveRideHeightPorpoisingSolver } from '../../sim/aerodynamics/activeRideHeightPorpoisingSolver';
import { FlyingCapacitorMultiLevelInverterSolver, InverterTopologyType } from '../../sim/electronics/flyingCapacitorMultiLevelInverterSolver';
import { HydraulicVaporLockPadKnockbackSolver, BrakeFluidGrade } from '../../sim/brakes/hydraulicVaporLockPadKnockbackSolver';
import { ElasticBandCollisionAvoidanceSolver } from '../../sim/ai/elasticBandCollisionAvoidanceSolver';

export const ExtremeDynamicsElectronicsProvingDeck: React.FC = () => {
  const [vehicleSpeedKmh, setVehicleSpeedKmh] = useState<number>(280);
  const [activeDampingOn, setActiveDampingOn] = useState<boolean>(true);
  const [inverterTopology, setInverterTopology] = useState<InverterTopologyType>('THREE_LEVEL_FLYING_CAPACITOR');
  const [fluidGrade, setFluidGrade] = useState<BrakeFluidGrade>('DOT_5_1_HIGH_TEMP');
  const [fluidMoisture, setFluidMoisture] = useState<number>(2.5);

  // 1. Solve Porpoising Aeromechanics
  const porpState = ActiveRideHeightPorpoisingSolver.solvePorpoisingAeromechanics({
    vehicleSpeedKmh,
    activeDampingEnabled: activeDampingOn,
    staticFrontRideHeightMm: 28.0,
    staticRearRideHeightMm: 42.0,
  });

  // 2. Solve 3L Flying Capacitor Inverter
  const inverterState = FlyingCapacitorMultiLevelInverterSolver.solveInverterMultiLevelSystem({
    topology: inverterTopology,
    dcBusVoltageV: 800,
    motorPowerKw: 320,
    cableLengthMeters: 4.2,
  });

  // 3. Solve Brake Fluid Vapor Lock & Knockback
  const brakeState = HydraulicVaporLockPadKnockbackSolver.solveHydraulicSystem({
    fluidGrade,
    moistureContentPct: fluidMoisture,
    frontCaliperTempCelsius: 195,
    lateralGForce: 1.75,
    kerbStrikeEvent: true,
  });

  // 4. Solve Elastic Band Collision Avoidance
  const evasionState = ElasticBandCollisionAvoidanceSolver.solveElasticBandTrajectory({
    vehicleSpeedKmh: 140,
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#05070c] text-gray-100 p-4 gap-4 overflow-y-auto font-sans">
      {/* Studio Header Ribbon */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#090d16] border border-[#182133] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500/20 via-amber-500/20 to-cyan-500/20 border border-rose-500/40 text-rose-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">
              EXTREME DYNAMICS, ELECTRONICS & AEROMECHANICS PROVING DECK
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              Diffuser Porpoising Heave-Pitch ▸ 3L-FC Inverter dv/dt ▸ Vapor Lock Knockback ▸ Elastic Band Collision Evasion
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveDampingOn(!activeDampingOn)}
            className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-xl border transition-all ${
              activeDampingOn
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
            }`}
          >
            <span>ACTIVE DAMPING:</span>
            <span className="font-bold">{activeDampingOn ? 'ENABLED' : 'DISABLED'}</span>
          </button>
        </div>
      </div>

      {/* Main 4-Card 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Card 1: Diffuser Porpoising & Ground Effect */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Activity className="w-4 h-4" />
              <span>GROUND-EFFECT DIFFUSER PORPOISING (280 km/h)</span>
            </div>
            <span className={`text-[10px] font-mono font-bold ${porpState.isPorpoisingActive ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {porpState.isPorpoisingActive ? '⚠ PORPOISING LIMIT-CYCLE' : '✓ AERO-DAMPED STABLE'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">SPEED: {vehicleSpeedKmh} km/h</span>
            <input
              type="range"
              min="120"
              max="360"
              value={vehicleSpeedKmh}
              onChange={(e) => setVehicleSpeedKmh(Number(e.target.value))}
              className="w-32 accent-rose-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">DOWNFORCE</div>
              <div className="text-cyan-400 font-bold">{porpState.diffuserState.diffuserDownforceN} N</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">HEAVE OSCILLATION</div>
              <div className="text-rose-400 font-bold">±{porpState.heaveOscillationAmplitudeMm} mm</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PORP FREQ</div>
              <div className="text-amber-400 font-bold">{porpState.porpoisingFrequencyHz} Hz</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PEAK VERTICAL G</div>
              <div className="text-purple-400 font-bold">{porpState.peakVerticalAccelerationG} G</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">AERO STALL</div>
              <div className={`font-bold ${porpState.diffuserState.isDiffuserStalled ? 'text-rose-400' : 'text-emerald-400'}`}>
                {porpState.diffuserState.isDiffuserStalled ? 'STALLED' : 'ATTACHED'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PLANK WEAR</div>
              <div className="text-gray-200 font-bold">{porpState.skidBlockWearRateMmPerLap} mm/lap</div>
            </div>
          </div>
        </div>

        {/* Card 2: 3-Level Flying Capacitor Inverter */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Cpu className="w-4 h-4" />
              <span>3L FLYING-CAPACITOR INVERTER & dv/dt</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {inverterState.inverterEfficiencyPct}% Eff (THD: {inverterState.totalHarmonicDistortionPct}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <span className="text-gray-400">TOPOLOGY:</span>
            <select
              value={inverterTopology}
              onChange={(e) => setInverterTopology(e.target.value as InverterTopologyType)}
              className="bg-[#0e1424] text-cyan-400 text-xs font-mono px-2 py-1 rounded border border-cyan-500/30"
            >
              <option value="THREE_LEVEL_FLYING_CAPACITOR">3L Flying Capacitor (FC)</option>
              <option value="THREE_LEVEL_NPC">3L Neutral-Point-Clamped (NPC)</option>
              <option value="TWO_LEVEL_CONVENTIONAL">2L Conventional (High dv/dt)</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PEAK dv/dt</div>
              <div className={`font-bold ${inverterState.insulationStress.dvDtMaxKvPerMicrosec > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {inverterState.insulationStress.dvDtMaxKvPerMicrosec} kV/μs
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">SURGE VOLTAGE</div>
              <div className="text-amber-400 font-bold">{inverterState.insulationStress.surgeVoltagePeakAtMotorTerminalsV} V</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PD SAFE?</div>
              <div className={`font-bold ${inverterState.insulationStress.isPartialDischargeSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                {inverterState.insulationStress.isPartialDischargeSafe ? '✓ SAFE (IEC)' : '✗ PD INCEPTION'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">FLY CAP VOLTAGE</div>
              <div className="text-cyan-400 font-bold">{inverterState.flyingCapacitor.flyingCapacitorActualVoltageV} V</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">COMMON-MODE</div>
              <div className="text-purple-400 font-bold">{inverterState.insulationStress.commonModeVoltageRmsV} V RMS</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">INSULATION LIFE</div>
              <div className="text-emerald-400 font-bold">{inverterState.insulationStress.insulationRemainingLifeHours} hrs</div>
            </div>
          </div>
        </div>

        {/* Card 3: Brake Fluid Vapor Lock & Pad Knockback */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Disc className="w-4 h-4" />
              <span>BRAKE FLUID VAPOR LOCK & PAD KNOCKBACK</span>
            </div>
            <span className={`text-[10px] font-mono font-bold ${brakeState.isPedalSpongyOrFloored ? 'text-rose-400' : 'text-emerald-400'}`}>
              {brakeState.isPedalSpongyOrFloored ? '⚠ SPONGY PEDAL LOSS' : '✓ FIRM HYDRAULIC FEEL'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">FLUID:</span>
              <select
                value={fluidGrade}
                onChange={(e) => setFluidGrade(e.target.value as BrakeFluidGrade)}
                className="bg-[#0e1424] text-amber-400 text-[11px] font-mono px-1.5 py-0.5 rounded border border-amber-500/30"
              >
                <option value="DOT_5_1_HIGH_TEMP">DOT 5.1 (265°C Dry)</option>
                <option value="RACING_DOT_4_SRF">Racing SRF (320°C Dry)</option>
                <option value="DOT_4_STANDARD">DOT 4 (230°C Dry)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">H2O: {fluidMoisture}%</span>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={fluidMoisture}
                onChange={(e) => setFluidMoisture(Number(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">BOIL POINT</div>
              <div className="text-amber-400 font-bold">{brakeState.currentBoilingPointCelsius} °C</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">VAPOR LOCK</div>
              <div className={`font-bold ${brakeState.corners[0].isFluidBoilingVaporLock ? 'text-rose-400' : 'text-emerald-400'}`}>
                {brakeState.corners[0].vaporVolumeFractionPct}% Gas
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PEDAL DEAD TRAVEL</div>
              <div className="text-rose-400 font-bold">+{brakeState.deadTravelElongationMm} mm</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PAD KNOCKBACK</div>
              <div className="text-gray-200 font-bold">{brakeState.corners[0].hubDeflectionKnockbackMm} mm</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">ABS PRE-FILL</div>
              <div className="text-emerald-400 font-bold">{brakeState.preFillPressurePulseBar} bar Pulse</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">SAFETY MARGIN</div>
              <div className="text-cyan-400 font-bold">{brakeState.safetyMarginToBoilingCelsius} °C</div>
            </div>
          </div>
        </div>

        {/* Card 4: Elastic Band Collision Avoidance */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Navigation className="w-4 h-4" />
              <span>ELASTIC BAND AUTONOMOUS EVASION (140 km/h)</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {evasionState.selectedEvasionDirection} ({evasionState.computationTimeMs}ms)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">MIN OBSTACLE CLEARANCE</div>
              <div className="text-emerald-400 font-bold">{evasionState.minimumClearanceToObstacleM} m</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PEAK LATERAL OFFSET</div>
              <div className="text-cyan-400 font-bold">{evasionState.peakLateralEvasionOffsetM} m</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">EVASION LATERAL G</div>
              <div className="text-purple-400 font-bold">{evasionState.maxEvasionLateralG} G (Feasible: {evasionState.evasionFeasible ? 'YES' : 'NO'})</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">BAND CONVERGENCE</div>
              <div className="text-gray-200 font-bold">{evasionState.iterationsToConvergence} Iterations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
