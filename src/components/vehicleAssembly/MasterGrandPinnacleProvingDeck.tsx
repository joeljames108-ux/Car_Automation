// ============================================================================
// PHASE 98 — MASTER GRAND PINNACLE PROVING GROUND CONTROL STUDIO DECK
// ============================================================================
// The Grand Master multi-physics control room workstation orchestrating all
// 100 automotive phases into a unified real-time telemetry station.
//
// Key Feature Decks:
//   1. Master 100-Subsystem Digital Twin Health Matrix
//   2. 1.2 MW Robotic Automated Pantograph Flash Charging Studio
//   3. Micro-CT X-Ray CFRP Monocoque & Brake NDT Inspection Lab
//   4. Extreme Aeromechanics & Diffuser Porpoising Telemetry
//   5. Autonomous Elastic Band High-Speed Obstacle Evasion Monitor
// ============================================================================

import React, { useState } from 'react';
import {
  Activity,
  Zap,
  Droplets,
  ShieldCheck,
  Cpu,
  Disc,
  Navigation,
  Wind,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Award
} from 'lucide-react';
import { MasterDigitalTwinOrchestrator, MasterVehicleDigitalTwinState } from '../../sim/digitalTwin/masterDigitalTwinOrchestrator';

export const MasterGrandPinnacleProvingDeck: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DIGITAL_TWIN_OVERVIEW' | 'MEGAWATT_CHARGING' | 'NDT_INSPECTION' | 'PORPOISING_AERO' | 'ELASTIC_BAND_AI'>('DIGITAL_TWIN_OVERVIEW');
  const [vehicleSpeedKmh, setVehicleSpeedKmh] = useState<number>(265);
  const [powertrainKw, setPowertrainKw] = useState<number>(110);
  const [isChargingMode, setIsChargingMode] = useState<boolean>(false);

  // Sample Master Digital Twin State
  const twinState: MasterVehicleDigitalTwinState = MasterDigitalTwinOrchestrator.sampleDigitalTwin({
    vehicleSpeedKmh,
    powertrainDemandKw: powertrainKw,
    isMegawattChargingActive: isChargingMode,
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#030509] text-gray-100 p-4 gap-4 overflow-y-auto font-sans">
      {/* 100-Phase Grand Pinnacle Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 rounded-2xl bg-[#070b14] border border-[#1b263b] shadow-2xl gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-500/40 text-amber-400 shadow-inner">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider text-white">
                100-PHASE MASTER GRAND PINNACLE VEHICLE CONTROL STUDIO
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold">
                100/100 SUBSYSTEMS SYNCHRONIZED
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Digital Twin Edge Aggregator ▸ 1.2MW Flash Charging ▸ Micro-CT NDT ▸ Porpoising Aero ▸ Elastic Band AI
            </p>
          </div>
        </div>

        {/* Global Master Status Card */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end font-mono">
            <span className="text-[10px] text-gray-400">MASTER SYSTEM HEALTH</span>
            <span className="text-sm font-black text-emerald-400">{twinState.overallVehicleHealthScorePct}% OPTIMAL</span>
          </div>
          <button
            onClick={() => setIsChargingMode(!isChargingMode)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-2 ${
              isChargingMode
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-[#0e1726] text-gray-300 border-[#24334a] hover:border-amber-500/40'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{isChargingMode ? '1.2MW CHARGING ACTIVE' : 'PROVING GROUND MODE'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tab Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'DIGITAL_TWIN_OVERVIEW', label: '100-Subsystem Digital Twin', icon: Layers },
          { id: 'MEGAWATT_CHARGING', label: '1.2 MW Robotic Pantograph', icon: Zap },
          { id: 'NDT_INSPECTION', label: 'Micro-CT X-Ray NDT Lab', icon: ShieldCheck },
          { id: 'PORPOISING_AERO', label: 'Porpoising & Extreme Aero', icon: Wind },
          { id: 'ELASTIC_BAND_AI', label: 'Elastic Band Autonomous AI', icon: Navigation },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border-amber-500/50 text-white shadow-lg'
                  : 'bg-[#080d18] border-[#152033] text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Content Decks */}
      <div className="flex-1 flex flex-col gap-4">
        {/* TAB 1: Master 100-Subsystem Digital Twin Overview */}
        {activeTab === 'DIGITAL_TWIN_OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
            {twinState.subsystemHealthSummaries.map((sub, idx) => (
              <div
                key={sub.subsystemKey}
                className="flex flex-col p-4 rounded-2xl bg-[#070b14] border border-[#182338] shadow-md justify-between gap-3 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-gray-400">#{idx + 1}</span>
                    <span className="text-xs font-bold text-gray-100">{sub.name}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      sub.operationalStatus === 'OPTIMAL'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {sub.operationalStatus}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#03060c] border border-[#121c2e] text-[11px] font-mono text-amber-300">
                  {sub.liveTelemetrySnippet}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span>CATEGORY: {sub.category}</span>
                  <span className="text-emerald-400 font-bold">{sub.healthScorePct}% Health</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: 1.2 MW Megawatt Charging Studio */}
        {activeTab === 'MEGAWATT_CHARGING' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            <div className="flex flex-col p-5 rounded-2xl bg-[#070b14] border border-[#182338] gap-4">
              <h3 className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
                <Zap className="w-4 h-4" /> 1.2 MW PANTOGRAPH DOCKING STATUS
              </h3>
              <div className="p-4 rounded-xl bg-[#03060c] border border-[#121c2e] flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">DOCKING STATE:</span>
                  <span className="text-amber-400 font-bold">{twinState.megawattCharging.dockingState}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ALIGNMENT ERROR:</span>
                  <span className="text-emerald-400 font-bold">{twinState.megawattCharging.dockingAlignmentErrorMm} mm (Tolerance 0.85mm)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CHARGE POWER:</span>
                  <span className="text-amber-400 font-bold">{twinState.megawattCharging.chargingPowerMegawatts} MW ({twinState.megawattCharging.chargeVoltageVolts}V / {twinState.megawattCharging.chargeCurrentAmperes}A)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TIME TO 80% SOC:</span>
                  <span className="text-amber-400 font-bold">{twinState.megawattCharging.timeToFullMinutes} minutes</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col p-5 rounded-2xl bg-[#070b14] border border-[#182338] gap-4">
              <h3 className="text-xs font-bold text-amber-400 font-mono">CONTACT PIN CONSTRICTION THERMALS (HOLM MODEL)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                {twinState.megawattCharging.contactPins.map((pin) => (
                  <div key={pin.pinId} className="p-3 rounded-xl bg-[#03060c] border border-[#121c2e] flex flex-col gap-1.5">
                    <span className="text-[10px] text-gray-400">{pin.pinId}</span>
                    <span className="text-amber-400 font-bold">{pin.currentAmperes} A</span>
                    <span className="text-amber-400">{pin.contactTemperatureCelsius} °C (Max 90°C)</span>
                    <span className="text-[10px] text-emerald-400">{pin.contactResistanceMicroOhms} μΩ</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Micro-CT X-Ray NDT Inspection */}
        {activeTab === 'NDT_INSPECTION' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            <div className="flex flex-col p-5 rounded-2xl bg-[#070b14] border border-[#182338] gap-4">
              <h3 className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> VOLUMETRIC CT CERTIFICATION
              </h3>
              <div className="p-4 rounded-xl bg-[#03060c] border border-[#121c2e] flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">SERIAL NO:</span>
                  <span className="text-gray-200">{twinState.ndtInspection.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">VOID CONTENT:</span>
                  <span className="text-emerald-400 font-bold">{twinState.ndtInspection.overallVoidContentPct}% (Spec &lt;1.0%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">WEIBULL FAILURE PROB:</span>
                  <span className="text-amber-400 font-bold">{twinState.ndtInspection.weibullFailureProbabilityPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">CERTIFICATION:</span>
                  <span className="text-emerald-400 font-bold">{twinState.ndtInspection.isComponentCertified ? '✓ PASSED ISO/ASTM' : '✗ REJECTED'}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col p-5 rounded-2xl bg-[#070b14] border border-[#182338] gap-4">
              <h3 className="text-xs font-bold text-gray-200 font-mono">MICRO-CT DEFECT MAPPING & FRACTURE CRITICALITY</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                {twinState.ndtInspection.defectsDetected.map((d) => (
                  <div key={d.defectId} className="p-3 rounded-xl bg-[#03060c] border border-[#121c2e] flex flex-col gap-1.5">
                    <span className="text-[10px] text-amber-400 font-bold">{d.defectType}</span>
                    <span className="text-gray-300">Size: {d.flawSizeMm} mm</span>
                    <span className="text-amber-400">Kt: {d.criticalStressConcentrationKt.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400">
                      Coords: [{d.location3D.xMm}, {d.location3D.yMm}, {d.location3D.zMm}]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Porpoising Aeromechanics */}
        {activeTab === 'PORPOISING_AERO' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            <div className="flex flex-col p-5 rounded-2xl bg-[#070b14] border border-[#182338] gap-4">
              <h3 className="text-xs font-bold text-rose-400 font-mono flex items-center gap-2">
                <Wind className="w-4 h-4" /> GROUND EFFECT DIFFUSER STALL
              </h3>
              <div className="p-4 rounded-xl bg-[#03060c] border border-[#121c2e] flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">CURRENT HEIGHT:</span>
                  <span className="text-amber-400 font-bold">{twinState.porpoisingAeromechanics.diffuserState.currentRideHeightMm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">STALL THRESHOLD:</span>
                  <span className="text-rose-400 font-bold">{twinState.porpoisingAeromechanics.diffuserState.stallRideHeightMm} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TOTAL DOWNFORCE:</span>
                  <span className="text-emerald-400 font-bold">{twinState.porpoisingAeromechanics.diffuserState.diffuserDownforceN} N</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col p-5 rounded-2xl bg-[#070b14] border border-[#182338] gap-4">
              <h3 className="text-xs font-bold text-amber-400 font-mono">2-DOF HEAVE-PITCH LIMIT-CYCLE TIMELINE</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#03060c] border border-[#121c2e]">
                  <span className="text-[10px] text-gray-400">PORP FREQ</span>
                  <div className="text-amber-400 font-bold text-sm">{twinState.porpoisingAeromechanics.porpoisingFrequencyHz} Hz</div>
                </div>
                <div className="p-3 rounded-xl bg-[#03060c] border border-[#121c2e]">
                  <span className="text-[10px] text-gray-400">HEAVE AMPLITUDE</span>
                  <div className="text-rose-400 font-bold text-sm">±{twinState.porpoisingAeromechanics.heaveOscillationAmplitudeMm} mm</div>
                </div>
                <div className="p-3 rounded-xl bg-[#03060c] border border-[#121c2e]">
                  <span className="text-[10px] text-gray-400">ACTIVE DAMPING</span>
                  <div className="text-emerald-400 font-bold text-sm">{twinState.porpoisingAeromechanics.antiPorpoisingActiveDampingNPerMPerS} N·s/m</div>
                </div>
                <div className="p-3 rounded-xl bg-[#03060c] border border-[#121c2e]">
                  <span className="text-[10px] text-gray-400">COMFORT INDEX</span>
                  <div className="text-amber-400 font-bold text-sm">{twinState.porpoisingAeromechanics.driverComfortDiscomfortIndex}/100</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Elastic Band Collision Avoidance */}
        {activeTab === 'ELASTIC_BAND_AI' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            <div className="flex flex-col p-5 rounded-2xl bg-[#070b14] border border-[#182338] gap-4">
              <h3 className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-2">
                <Navigation className="w-4 h-4" /> EVASION TRAJECTORY DEFORMATION
              </h3>
              <div className="p-4 rounded-xl bg-[#03060c] border border-[#121c2e] flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">SELECTED DIRECTION:</span>
                  <span className="text-emerald-400 font-bold">{twinState.elasticBandEvasion.selectedEvasionDirection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">MIN CLEARANCE:</span>
                  <span className="text-amber-400 font-bold">{twinState.elasticBandEvasion.minimumClearanceToObstacleM} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">PEAK LATERAL G:</span>
                  <span className="text-amber-400 font-bold">{twinState.elasticBandEvasion.maxEvasionLateralG} G</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">SOLVER LATENCY:</span>
                  <span className="text-amber-400 font-bold">{twinState.elasticBandEvasion.computationTimeMs} ms</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col p-5 rounded-2xl bg-[#070b14] border border-[#182338] gap-4">
              <h3 className="text-xs font-bold text-gray-200 font-mono">30-NODE ELASTIC BAND BUBBLE TRAJECTORY</h3>
              <div className="p-4 rounded-xl bg-[#03060c] border border-[#121c2e] font-mono text-[11px] text-gray-300 flex flex-col gap-2">
                <div className="flex justify-between border-b border-[#152033] pb-2 text-gray-400">
                  <span>NODE #</span>
                  <span>X (m)</span>
                  <span>LATERAL Y (m)</span>
                  <span>BUBBLE RADIUS (m)</span>
                  <span>CURVATURE (rad/m)</span>
                </div>
                {twinState.elasticBandEvasion.elasticBandWaypoints.slice(0, 6).map((wp) => (
                  <div key={wp.nodeIndex} className="flex justify-between text-amber-300">
                    <span>Node {wp.nodeIndex}</span>
                    <span>{wp.longitudinalXM}m</span>
                    <span>{wp.lateralYM}m</span>
                    <span>{wp.bubbleRadiusM}m</span>
                    <span>{wp.curvatureRadPerM}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
