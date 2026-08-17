// ============================================================================
// PHASE 48 — MASTER VEHICLE 50-CHASSIS SHOWCASE DECK & SYSTEM UNIFIER
// ============================================================================
// Master high-contrast dark dashboard unifying 50-Chassis architectures,
// SIMP Topology Optimization, 800V Wire Harness routing, and Neural Physics HUD.
// ============================================================================

import React, { useState } from 'react';
import { Box, Sliders, Cpu, Activity, ShieldCheck, Sparkles, Layers, RefreshCw } from 'lucide-react';
import { CHASSIS_50_REGISTRY, CHASSIS_50_MAP } from '../../exterior3d/manifests/chassis50Manifest';
import { Chassis50Definition } from '../../exterior3d/types/vehicleConstructionTypes';
import { StructuralTopologyOptimizer } from '../../exterior3d/chassis/structuralTopologyOptimizer';
import { WireHarnessRoutingEngine } from '../../exterior3d/electronics/wireHarnessRoutingEngine';
import { NeuralVehicleSurrogateModel } from '../../sim/ai/neuralVehicleSurrogateModel';

export const MasterVehicle50ChassisDeck: React.FC = () => {
  const [selectedBodyType, setSelectedBodyType] = useState<string>('supercar');
  const [volumeTarget, setVolumeTarget] = useState<number>(0.45);
  const [steerAngle, setSteerAngle] = useState<number>(30);

  // 1. Fetch 50-Chassis List for Body Type
  const allChassis: Chassis50Definition[] = CHASSIS_50_REGISTRY;
  const filteredChassis: Chassis50Definition[] = allChassis.filter((c: Chassis50Definition) => c.bodyType.toLowerCase() === selectedBodyType.toLowerCase());
  const [selectedChassisId, setSelectedChassisId] = useState<string>(filteredChassis[0]?.id || allChassis[0]?.id);
  const activeChassis: Chassis50Definition = CHASSIS_50_MAP[selectedChassisId] || allChassis[0];

  // 2. Solve Topology Optimization
  const topoResult = StructuralTopologyOptimizer.optimizeChassisSubframe({
    volumeFractionTarget: volumeTarget,
    baseMassKg: 95,
  });

  // 3. Fetch Wiring Harnesses
  const harnesses = WireHarnessRoutingEngine.generateVehicleWiringHarness();

  // 4. Neural Physics Surrogate Inference
  const surrogatePred = NeuralVehicleSurrogateModel.predictChassisState({
    vehicleSpeedKmh: 165,
    steeringWheelAngleDeg: steerAngle,
    throttlePct: 80,
    brakePressureBar: 0,
    activeAeroWingAngleDeg: 12,
    currentYawRateDegPerSec: 18.2,
    currentLateralAccelG: 1.15,
    roadFrictionCoeffMu: 1.0,
  });

  const bodyTypes = ['supercar', 'hypercar', 'grand_tourer', 'sedan', 'coupe', 'suv', 'off_road', 'track_race'];

  return (
    <div className="flex flex-col h-full w-full bg-[#05070c] text-gray-100 p-4 gap-4 overflow-y-auto font-sans">
      {/* Studio Header Ribbon */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-[#090d16] border border-[#182133] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">
              MASTER 50-CHASSIS & TOPOLOGY UNIFICATION DECK
            </h2>
            <p className="text-[11px] text-gray-400 font-mono">
              50 Architectures, SIMP Lightweighting, 800V Harnesses & Neural Physics
            </p>
          </div>
        </div>

        {/* Body Type Selector Ribbon */}
        <div className="flex items-center gap-1.5 bg-[#0e1422] p-1 rounded-xl border border-[#1b253b] overflow-x-auto">
          {bodyTypes.map((bt) => (
            <button
              key={bt}
              onClick={() => {
                setSelectedBodyType(bt);
                const match = allChassis.find((c: Chassis50Definition) => c.bodyType.toLowerCase() === bt.toLowerCase());
                if (match) setSelectedChassisId(match.id);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all uppercase ${
                selectedBodyType.toLowerCase() === bt.toLowerCase()
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#151c2e]'
              }`}
            >
              {bt.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3-Column Engineering Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Column 1: Active 50-Chassis Architecture Inspector */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
              <Layers className="w-4 h-4" />
              <span>CHASSIS ARCHITECTURE</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              {activeChassis?.name || 'Chassis Selected'}
            </span>
          </div>

          {/* Architecture Selector List */}
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {filteredChassis.map((c: Chassis50Definition) => (
              <button
                key={c.id}
                onClick={() => setSelectedChassisId(c.id)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-mono transition-all ${
                  c.id === selectedChassisId
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-white font-bold'
                    : 'bg-[#0a0f1c] border border-[#161f30] text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>{c.name}</span>
                <span className="text-cyan-400 font-bold">{c.torsionalRigidityKNmPerDeg} kNm/deg</span>
              </button>
            ))}
          </div>

          {/* Active Chassis Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-auto">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">WHEELBASE</div>
              <div className="text-sm font-bold text-gray-100">{activeChassis?.wheelbaseMm} mm</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">BASE RIGIDITY</div>
              <div className="text-sm font-bold text-cyan-400">{activeChassis?.torsionalRigidityKNmPerDeg} kNm/deg</div>
            </div>
          </div>
        </div>

        {/* Column 2: SIMP Lightweight Topology Optimization */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sliders className="w-4 h-4" />
              <span>SIMP TOPOLOGY LIGHTWEIGHTING</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              -{topoResult.massSavingsKg} kg Saved
            </span>
          </div>

          {/* Volume Target Slider */}
          <div className="flex flex-col gap-2 p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">MATERIAL VOLUME TARGET: {(volumeTarget * 100).toFixed(0)}%</span>
              <input
                type="range"
                min="0.25"
                max="0.80"
                step="0.05"
                value={volumeTarget}
                onChange={(e) => setVolumeTarget(Number(e.target.value))}
                className="w-28 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Topology Voxel Density Heatmap Visualizer */}
          <div className="grid grid-cols-6 gap-1 p-3 bg-[#05070c] rounded-xl border border-[#141b2b] max-h-36 overflow-y-auto">
            {topoResult.voxels.slice(0, 36).map((v) => (
              <div
                key={v.id}
                className="h-5 rounded text-[8px] font-mono flex items-center justify-center transition-all"
                style={{
                  backgroundColor: `rgba(245, 158, 11, ${v.density})`,
                  color: v.density > 0.5 ? '#000' : '#888',
                }}
              >
                {(v.density * 100).toFixed(0)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-auto">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">COMPLIANCE DROP</div>
              <div className="text-sm font-bold text-emerald-400">-{topoResult.complianceReductionPct}%</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">TOTAL VOXELS</div>
              <div className="text-sm font-bold text-amber-400">{topoResult.voxels.length} Nodes</div>
            </div>
          </div>
        </div>

        {/* Column 3: Neural Vehicle Physics Surrogate Model HUD */}
        <div className="flex flex-col p-4 rounded-2xl bg-[#090d16] border border-[#182133] gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#182133]">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Cpu className="w-4 h-4" />
              <span>DNN 6-DOF SURROGATE HUD</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
              {surrogatePred.inferenceLatencyUs} μs Inference
            </span>
          </div>

          {/* Interactive Steer Angle Slider */}
          <div className="flex flex-col gap-2 p-3 bg-[#05070c] rounded-xl border border-[#141b2b] text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">STEER ANGLE: {steerAngle}°</span>
              <input
                type="range"
                min="-60"
                max="60"
                value={steerAngle}
                onChange={(e) => setSteerAngle(Number(e.target.value))}
                className="w-28 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Predicted 6-DOF Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">PREDICTED YAW RATE</div>
              <div className="text-sm font-bold text-cyan-400">{surrogatePred.predictedYawRateDegPerSec}°/s</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">LATERAL ACCELERATION</div>
              <div className="text-sm font-bold text-rose-400">{surrogatePred.predictedLateralAccelG} g</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">BODY ROLL ANGLE</div>
              <div className="text-sm font-bold text-amber-400">{surrogatePred.predictedRollAngleDeg}°</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0c1220] border border-[#1c263d]">
              <div className="text-gray-400 text-[10px]">CONFIDENCE SCORE</div>
              <div className="text-sm font-bold text-emerald-400">{surrogatePred.confidenceScorePct}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
