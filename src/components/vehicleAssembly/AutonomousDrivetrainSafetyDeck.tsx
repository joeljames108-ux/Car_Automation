// ============================================================================
// PHASE 83 — AUTONOMOUS DRIVETRAIN DYNAMICS & EV SAFETY MASTER STUDIO DECK
// ============================================================================
// Master high-contrast dark telemetry workstation visualizing:
//   - EGR/VGT Turbo Map (Compressor PR vs. corrected flow, surge line)
//   - EMC/HVIL Safety Chain (Isolation resistance, discharge profile, HVIL loop)
//   - Active Torque Fill & DMF Vibration (Tip-in fill, shuffle damping)
//   - Suspension K&C Dashboard (Roll center, camber gain, bump steer curves)
// ============================================================================

import React, { useState } from 'react';
import { Gauge, ShieldCheck, Zap, Settings2, Activity, Cog } from 'lucide-react';
import { EgrVariableGeometryTurboSolver } from '../../sim/engine/egrVariableGeometryTurboSolver';
import { EmcHvilSafetySolver } from '../../sim/safety/emcHvilSafetySolver';
import { ActiveTorqueFillDamperSolver } from '../../sim/drivetrain/activeTorqueFillDamperSolver';
import { SuspensionKinematicComplianceSolver } from '../../sim/suspension/suspensionKinematicComplianceSolver';

export const AutonomousDrivetrainSafetyDeck: React.FC = () => {
  const [engineRpm, setEngineRpm] = useState<number>(3500);
  const [engineLoad, setEngineLoad] = useState<number>(72);
  const [simulateFault, setSimulateFault] = useState<boolean>(false);
  const [suspAxle, setSuspAxle] = useState<'FRONT' | 'REAR'>('FRONT');

  // 1. Solve EGR + VGT Turbo System
  const egrVgt = EgrVariableGeometryTurboSolver.solveEgrVgtSystem({
    engineRpm,
    engineLoadPct: engineLoad,
  });

  // 2. Solve EMC / HVIL Safety
  const emcHvil = EmcHvilSafetySolver.solveEmcHvilSystem({
    simulateFault,
    faultType: simulateFault ? 'ISOLATION_DEGRADED' : 'NONE',
  });

  // 3. Solve Active Torque Fill & DMF
  const torqueFill = ActiveTorqueFillDamperSolver.solveTorqueFillSystem({
    engineRpm,
    driverTorqueDemandNm: 350,
    throttleRatePerSec: 2.5,
    cylinderCount: 6,
  });

  // 4. Solve Suspension K&C
  const suspKc = SuspensionKinematicComplianceSolver.solveKcCharacteristics({
    axle: suspAxle,
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#05070c] text-gray-100 p-4 gap-4 overflow-y-auto font-sans">
      {/* Studio Header */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#090d16] border border-[#182133] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-violet-500/20 border border-emerald-500/40 text-emerald-400">
            <Cog className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">
              AUTONOMOUS DRIVETRAIN DYNAMICS & EV SAFETY STUDIO
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              EGR/VGT Turbo ▸ EMC/HVIL Safety ▸ Torque Fill & DMF ▸ Suspension K&C
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Fault Toggle */}
          <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
            <span className={simulateFault ? 'text-red-400' : 'text-gray-500'}>FAULT SIM</span>
            <input
              type="checkbox"
              checked={simulateFault}
              onChange={(e) => setSimulateFault(e.target.checked)}
              className="accent-red-500"
            />
          </label>

          {/* Axle Selector */}
          <select
            value={suspAxle}
            onChange={(e) => setSuspAxle(e.target.value as 'FRONT' | 'REAR')}
            className="bg-[#0e1424] text-amber-400 text-xs font-bold font-mono px-3 py-1.5 rounded-xl border border-amber-500/40 cursor-pointer"
          >
            <option value="FRONT">Front Axle K&C</option>
            <option value="REAR">Rear Axle K&C</option>
          </select>
        </div>
      </div>

      {/* Engine RPM & Load Sliders */}
      <div className="flex items-center gap-4 px-4 py-2.5 bg-[#090d16] rounded-xl border border-[#182133]">
        <div className="flex items-center gap-2 flex-1 text-xs font-mono">
          <span className="text-gray-400 w-28">ENGINE: {engineRpm} RPM</span>
          <input
            type="range" min="800" max="6500" step="100" value={engineRpm}
            onChange={(e) => setEngineRpm(Number(e.target.value))}
            className="flex-1 accent-emerald-500 cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-2 flex-1 text-xs font-mono">
          <span className="text-gray-400 w-24">LOAD: {engineLoad}%</span>
          <input
            type="range" min="5" max="100" step="1" value={engineLoad}
            onChange={(e) => setEngineLoad(Number(e.target.value))}
            className="flex-1 accent-amber-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Main 4-Card 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">

        {/* Card 1: EGR + VGT Turbo Map */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Gauge className="w-4 h-4" />
              <span>EGR & VARIABLE GEOMETRY TURBO</span>
            </div>
            <span className={`text-[10px] font-mono font-bold ${egrVgt.compressor.isInSurge ? 'text-red-400' : 'text-emerald-400'}`}>
              {egrVgt.compressor.isInSurge ? '⚠ SURGE' : `SM: ${egrVgt.compressor.surgeMarginPct}%`}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">BOOST PR</div>
              <div className="text-emerald-400 font-bold">{egrVgt.compressor.pressureRatio}:1</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">VGT VANE</div>
              <div className="text-amber-400 font-bold">{egrVgt.turbine.vgtVaneAngleDeg}°</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">TURBO SPEED</div>
              <div className="text-amber-400 font-bold">{egrVgt.compressor.shaftSpeedKrpm}k</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">HP-EGR</div>
              <div className="text-rose-400 font-bold">{egrVgt.hpEgr.egrRatePct}%</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">LP-EGR</div>
              <div className="text-amber-400 font-bold">{egrVgt.lpEgr.egrRatePct}%</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">NOx REDUC</div>
              <div className="text-emerald-400 font-bold">{egrVgt.hpEgr.noxReductionPct}%</div>
            </div>
          </div>
        </div>

        {/* Card 2: EMC / HVIL Safety */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>EMC & HVIL SAFETY CHAIN</span>
            </div>
            <span className={`text-[10px] font-mono font-bold ${emcHvil.overallSafetyCompliance ? 'text-emerald-400' : 'text-red-400'}`}>
              {emcHvil.overallSafetyCompliance ? '✓ SAFE' : '✗ FAULT'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">HVIL STATE</div>
              <div className={`font-bold ${emcHvil.hvilLoop.isContinuityConfirmed ? 'text-emerald-400' : 'text-red-400'}`}>
                {emcHvil.hvilLoop.safetyState}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">ISOLATION</div>
              <div className="text-amber-400 font-bold">{emcHvil.isolationMonitoring.minimumIsolationResistanceMohm} MΩ</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">DISCHARGE 5s</div>
              <div className="text-amber-400 font-bold">{emcHvil.activeDischarge.residualVoltageAfter5sV}V</div>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d] text-[10px] font-mono text-gray-400">
            EMC: {emcHvil.overallEmcCompliance ? '✓ CISPR 25 Class 5 Compliant' : '✗ Non-Compliant'} |
            Leakage: {emcHvil.isolationMonitoring.leakageCurrentMa} mA |
            Ω/V: {emcHvil.isolationMonitoring.isolationResistancePerVolt}
          </div>
        </div>

        {/* Card 3: Active Torque Fill & DMF */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>ACTIVE TORQUE FILL & DMF DYNAMICS</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400">
              Score: {torqueFill.overallDriveabilityScore}/100
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">E-MOTOR FILL</div>
              <div className="text-amber-400 font-bold">{torqueFill.torqueFill.eMotorFillTorqueNm} Nm</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">SHUFFLE FREQ</div>
              <div className="text-amber-400 font-bold">{torqueFill.shuffle.shuffleFrequencyHz} Hz</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">DMF WINDUP</div>
              <div className="text-rose-400 font-bold">{torqueFill.dmf.currentWindupAngleDeg}°</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">JERK RATE</div>
              <div className={`font-bold ${torqueFill.torqueFill.isJerkAcceptable ? 'text-emerald-400' : 'text-red-400'}`}>
                {torqueFill.torqueFill.jerkRateMPerS3} m/s³
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CPA ABSORB</div>
              <div className="text-amber-400 font-bold">{torqueFill.cpa.absorptionEfficiencyPct}%</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">SETTLE TIME</div>
              <div className="text-gray-200 font-bold">{torqueFill.shuffle.settlingTime90PctMs} ms</div>
            </div>
          </div>
        </div>

        {/* Card 4: Suspension K&C */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Settings2 className="w-4 h-4" />
              <span>{suspAxle} SUSPENSION K&C ({suspKc.topology})</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400">
              Quality: {suspKc.overallKcQualityScore}/100
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">ROLL CENTER</div>
              <div className="text-amber-400 font-bold">{suspKc.rollCenter.rollCenterHeightMm} mm</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CAMBER GAIN</div>
              <div className="text-amber-400 font-bold">{suspKc.camberGain.camberGainDegPerMm}°/mm</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">RIDE FREQ</div>
              <div className="text-amber-400 font-bold">{suspKc.wheelRate.rideFrequencyHz} Hz</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">BUMP STEER</div>
              <div className={`font-bold ${suspKc.bumpSteer.isBumpSteerAcceptable ? 'text-emerald-400' : 'text-red-400'}`}>
                {suspKc.bumpSteer.bumpSteerGradientDegPerMm}°/mm
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">ANTI-DIVE</div>
              <div className="text-rose-400 font-bold">{suspKc.antiGeometry.antiDivePct}%</div>
            </div>
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">COMP STEER</div>
              <div className="text-gray-200 font-bold">{suspKc.bushingCompliance.complianceSteerDegPerKn}°/kN</div>
            </div>
          </div>
          {suspAxle === 'FRONT' && (
            <div className="p-2 rounded-lg bg-[#0c1220] border border-[#1c263d] text-[10px] font-mono text-gray-400">
              KPI: {suspKc.kingpinInclinationDeg}° | Caster: {suspKc.casterAngleDeg}° |
              Trail: {suspKc.casterTrailMm}mm | Scrub: {suspKc.scrubRadiusMm}mm
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
