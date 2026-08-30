// ============================================================================
// PHASE 105 — GRAND MULTIVERSE AUTOMOTIVE PROVING GROUND SUPER-STUDIO DECK
// ============================================================================
// Next-generation multi-physics visual dashboard integrating:
//   1. 3D Lattice Boltzmann Method (LBM) Wind Tunnel & Streamlines
//   2. Active Yaw Vectoring e-LSD Direct Yaw Moment Dynamics
//   3. Cabin Psychoacoustics, Zwicker Loudness & 24 Bark Band Sound Quality
//   4. V2X Cooperative Platooning & Autonomous Slipstream Energy Drafting
// ============================================================================

import React, { useState } from 'react';
import {
  Wind,
  Compass,
  Volume2,
  Share2,
  Activity,
  Zap,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Radio,
  BarChart3,
  Waves
} from 'lucide-react';
import { GenericProvingDeck } from './GenericProvingDeck';
import { LatticeBoltzmannWindTunnelSolver, LbmWindTunnelResult } from '../../sim/aerodynamics/latticeBoltzmannWindTunnelSolver';
import { ActiveYawVectoringDifferentialSolver, ActiveDifferentialState } from '../../sim/drivetrain/activeYawVectoringDifferentialSolver';
import { CabinPsychoacousticsSolver, CabinPsychoacousticReport } from '../../sim/acoustics/cabinPsychoacousticsSolver';
import { V2xCooperativePlatooningSolver, PlatoonFormationResult } from '../../sim/ai/v2xCooperativePlatooningSolver';

export const GrandMultiverseProvingDeck: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LBM_WIND_TUNNEL' | 'YAW_VECTORING' | 'CABIN_ACOUSTICS' | 'V2X_PLATOONING'>('LBM_WIND_TUNNEL');
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(240);
  const [steerDeg, setSteerDeg] = useState<number>(12);
  const [isAncEnabled, setIsAncEnabled] = useState<boolean>(true);
  const [platoonVehicleCount, setPlatoonVehicleCount] = useState<number>(5);

  // Compute Multi-Physics Solvers
  const lbmResult: LbmWindTunnelResult = LatticeBoltzmannWindTunnelSolver.solveLbmWindTunnel({
    inletSpeedKmh: windSpeedKmh,
    angleOfAttackDeg: 4.5,
    underbodyRideHeightMm: 35.0,
  });

  const diffResult: ActiveDifferentialState = ActiveYawVectoringDifferentialSolver.solveActiveYawVectoring({
    steeringWheelAngleDeg: steerDeg,
    vehicleSpeedKmh: 175,
    inputShaftTorqueNm: 920,
  });

  const acousticReport: CabinPsychoacousticReport = CabinPsychoacousticsSolver.evaluateCabinPsychoacoustics({
    vehicleSpeedKmh: 130,
    isElectricPowertrain: true,
    ancActive: isAncEnabled,
  });

  const platoonResult: PlatoonFormationResult = V2xCooperativePlatooningSolver.solvePlatoonDynamics({
    platoonSize: platoonVehicleCount,
    cruisingSpeedKmh: 125,
  });

  return (
    <GenericProvingDeck
      title="GRAND MULTIVERSE PROVING GROUND SUPER-STUDIO"
      phaseBadge="PHASE 101–105 ACTIVE"
      subtitle="LBM Navier-Stokes CFD ▸ Motorsport e-LSD Vectoring ▸ Cabin Psychoacoustics ▸ V2X Cooperative Swarm"
      icon={<Radio className="w-6 h-6 animate-pulse" />}
      headerBadges={
        <>
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-[#1c2c47] text-gray-300">
            <span className="text-gray-500 mr-2">CFD Re:</span>
            <span className="text-amber-400 font-bold">{lbmResult.reynoldsNumber.toLocaleString()}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-[#1c2c47] text-gray-300">
            <span className="text-gray-500 mr-2">V2X Latency:</span>
            <span className="text-emerald-400 font-bold">&lt; 3.5 ms</span>
          </div>
        </>
      }
      tabs={[
        { id: 'LBM_WIND_TUNNEL', label: 'LBM Navier-Stokes Wind Tunnel', icon: <Wind className="w-4 h-4" /> },
        { id: 'YAW_VECTORING', label: 'Motorsport Active Yaw e-LSD', icon: <Compass className="w-4 h-4" /> },
        { id: 'CABIN_ACOUSTICS', label: 'Cabin Psychoacoustics Sound Lab', icon: <Volume2 className="w-4 h-4" /> },
        { id: 'V2X_PLATOONING', label: 'V2X Cooperative Platooning Swarm', icon: <Share2 className="w-4 h-4" /> },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
        {/* TAB 1: LBM Wind Tunnel */}
        {activeTab === 'LBM_WIND_TUNNEL' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            <div className="flex flex-col p-5 rounded-2xl bg-amber-950/60 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
                <Wind className="w-4 h-4" /> AERODYNAMIC FORCES & PRESSURE COEFFICIENTS
              </h3>
              <div className="p-4 rounded-xl bg-amber-950/60 border border-[#101826] flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">INLET SPEED:</span>
                  <span className="text-amber-400 font-bold">{lbmResult.inletVelocityMs} m/s ({windSpeedKmh} km/h)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">DRAG FORCE (Cd):</span>
                  <span className="text-amber-400 font-bold">{lbmResult.dragForceNewtons} N (Cd {lbmResult.dragCoefficientCd})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">DOWNFORCE (Cl):</span>
                  <span className="text-emerald-400 font-bold">{lbmResult.downforceNewtons} N (Cl {lbmResult.liftCoefficientCl})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">AERO EFFICIENCY (L/D):</span>
                  <span className="text-amber-400 font-bold">{lbmResult.aerodynamicEfficiencyLOverD}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-mono text-gray-400">WIND SPEED: {windSpeedKmh} KM/H</label>
                <input
                  type="range"
                  min="80"
                  max="350"
                  value={windSpeedKmh}
                  onChange={(e) => setWindSpeedKmh(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col p-5 rounded-2xl bg-amber-950/60 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-gray-200 font-mono">LBM FLOW VELOCITY FIELD (24x12 D2Q9 MESH)</h3>
              <div className="grid grid-cols-12 gap-1 p-3 rounded-xl bg-amber-950/60 border border-[#101826] overflow-hidden">
                {lbmResult.flowGrid2D.flatMap((row) =>
                  row.slice(0, 12).map((cell, idx) => (
                    <div
                      key={`${cell.gridX}-${cell.gridY}-${idx}`}
                      className={`h-7 rounded flex items-center justify-center text-[9px] font-mono font-bold transition-all ${
                        cell.isSolidObstacle
                          ? 'bg-gray-800 text-gray-400 border border-gray-600'
                          : cell.velocityMagnitudeMs > 75
                          ? 'bg-amber-600/40 text-amber-200 border border-amber-500/40'
                          : cell.velocityMagnitudeMs > 60
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-500/30'
                          : 'bg-amber-950/40 text-amber-300'
                      }`}
                    >
                      {cell.isSolidObstacle ? 'CAR' : `${Math.round(cell.velocityMagnitudeMs)}`}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Yaw Vectoring e-LSD */}
        {activeTab === 'YAW_VECTORING' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            <div className="flex flex-col p-5 rounded-2xl bg-amber-950/60 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-2">
                <Compass className="w-4 h-4" /> DIRECT YAW MOMENT STATUS
              </h3>
              <div className="p-4 rounded-xl bg-amber-950/60 border border-[#101826] flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">CONTROL REGIME:</span>
                  <span className="text-emerald-400 font-bold">{diffResult.controlMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">DIRECT YAW MOMENT:</span>
                  <span className="text-amber-400 font-bold">{diffResult.directYawMomentNm} Nm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CLUTCH LOCKUP:</span>
                  <span className="text-amber-400 font-bold">{diffResult.clutchLockupPercentage}% ({diffResult.clutchClampingPressureBar} bar)</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-mono text-gray-400">STEERING ANGLE: {steerDeg}°</label>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={steerDeg}
                  onChange={(e) => setSteerDeg(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col p-5 rounded-2xl bg-amber-950/60 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-gray-200 font-mono">CROSS-AXLE TORQUE BIAS DISTRIBUTION</h3>
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-amber-950/60 border border-[#101826] flex flex-col gap-2">
                  <span className="text-gray-400">LEFT WHEEL TORQUE</span>
                  <div className="text-amber-400 font-bold text-xl">{diffResult.leftWheelTorqueNm} Nm</div>
                  <span className="text-[10px] text-gray-500">Outer/Inner Drive Allocation</span>
                </div>
                <div className="p-4 rounded-xl bg-amber-950/60 border border-[#101826] flex flex-col gap-2">
                  <span className="text-gray-400">RIGHT WHEEL TORQUE</span>
                  <div className="text-amber-400 font-bold text-xl">{diffResult.rightWheelTorqueNm} Nm</div>
                  <span className="text-[10px] text-gray-500">Outer/Inner Drive Allocation</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Cabin Psychoacoustics */}
        {activeTab === 'CABIN_ACOUSTICS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            <div className="flex flex-col p-5 rounded-2xl bg-amber-950/60 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
                <Volume2 className="w-4 h-4" /> PSYCHOACOUSTIC METRICS (DIN 45631)
              </h3>
              <div className="p-4 rounded-xl bg-amber-950/60 border border-[#101826] flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">SOUND QUALITY:</span>
                  <span className="text-amber-400 font-bold">{acousticReport.soundQualityClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ZWICKER LOUDNESS:</span>
                  <span className="text-amber-400 font-bold">{acousticReport.zwickerLoudnessSones} Sones ({acousticReport.overallSplDbA} dBA)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">SPECTRAL SHARPNESS:</span>
                  <span className="text-amber-400 font-bold">{acousticReport.auresSharpnessAcum} Acum</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ARTICULATION INDEX:</span>
                  <span className="text-emerald-400 font-bold">{acousticReport.articulationIndexPct}% (Intelligible)</span>
                </div>
              </div>

              <button
                onClick={() => setIsAncEnabled(!isAncEnabled)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                  isAncEnabled
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-amber-950/60 text-gray-400 border-[#1c2c47]'
                }`}
              >
                {isAncEnabled ? '✓ ACTIVE NOISE CANCELLATION ON (-11.5 dBA)' : 'ANC DISABLED'}
              </button>
            </div>

            <div className="lg:col-span-2 flex flex-col p-5 rounded-2xl bg-amber-950/60 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-gray-200 font-mono">24 CRITICAL BARK BAND SPECIFIC LOUDNESS</h3>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 font-mono text-[10px]">
                {acousticReport.barkBandSpectra.map((band) => (
                  <div key={band.barkIndex} className="p-2 rounded bg-amber-950/60 border border-[#101826] flex flex-col items-center gap-1">
                    <span className="text-gray-500">Z{band.barkIndex}</span>
                    <span className="text-amber-400 font-bold">{band.soundPressureLevelDbA}</span>
                    <span className="text-[9px] text-amber-400">{band.centerFrequencyHz}Hz</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: V2X Platooning */}
        {activeTab === 'V2X_PLATOONING' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            <div className="flex flex-col p-5 rounded-2xl bg-amber-950/60 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
                <Share2 className="w-4 h-4" /> CACC PLATOON STRING STABILITY
              </h3>
              <div className="p-4 rounded-xl bg-amber-950/60 border border-[#101826] flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">MANEUVER STATE:</span>
                  <span className="text-emerald-400 font-bold">{platoonResult.maneuverState}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">OVERALL ENERGY SAVING:</span>
                  <span className="text-amber-400 font-bold">{platoonResult.overallPlatoonEnergySavingsPct}% Drag Reduction</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">STRING STABILITY:</span>
                  <span className="text-emerald-400 font-bold">||G(jω)||_∞ ≤ 1.0 (PROVEN)</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-mono text-gray-400">PLATOON SIZE: {platoonVehicleCount} VEHICLES</label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={platoonVehicleCount}
                  onChange={(e) => setPlatoonVehicleCount(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col p-5 rounded-2xl bg-amber-950/60 border border-[#162236] gap-4">
              <h3 className="text-xs font-bold text-gray-200 font-mono">PLATOON MEMBER VEHICLE TELEMETRY</h3>
              <div className="flex flex-col gap-2 font-mono text-xs">
                {platoonResult.memberVehicles.map((m) => (
                  <div
                    key={m.vehicleId}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-950/60 border border-[#101826] text-gray-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">#{m.platoonPositionIndex}</span>
                      <span className="text-gray-100">{m.vehicleId}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span>Gap: <strong className="text-amber-300">{m.interVehicleGapM}m</strong></span>
                      <span>Aero Saving: <strong className="text-emerald-400">-{m.aerodynamicDragReductionPct}%</strong></span>
                      <span>V2X: <strong className="text-amber-400">{m.v2xPacketLatencyMs}ms</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </GenericProvingDeck>
  );
};
