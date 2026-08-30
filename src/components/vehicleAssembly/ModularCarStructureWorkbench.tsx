// ============================================================================
// MODULAR CAR STRUCTURE ARCHITECTURE WORKBENCH (VEHICLE SECTION)
// ============================================================================
// High-tech Glassmorphism CAD Telemetry & Subsystem Explorer:
// - Hierarchical Subsystem Explorer with live mass, grade & structural roles
// - 3D Center of Gravity (CoG), 4-Corner Weight Balance & Moments of Inertia HUD
// - FEA Torsional Rigidity (kNm/deg), Natural Frequency & Stress Hotspots
// - Kinematic Hardpoint Dimensions Editor (Wheelbase, Tracks, Ride Height)
// - 3D Viewport Telemetry Controls (CoG Sphere, FEA Heatmap, Load Vectors, Solo Isolation)
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Activity,
  Cpu,
  ShieldAlert,
  Sliders,
  Scale,
  Compass,
  Zap,
  Eye,
  EyeOff,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Box,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';
import {
  ModularStructureEngine,
  ModularStructureTelemetry,
  ModularSubsystemNode,
  FeaStressHotspot,
} from '../../sim/modularVehicle/modularStructureEngine';
import { Chassis50Definition, VehicleSubsystemStage } from '../../exterior3d/types/vehicleConstructionTypes';
import { MaterialGrade } from '../../sim/assemblyTypes';

interface ModularCarStructureWorkbenchProps {
  chassis: Chassis50Definition;
  installedStages: VehicleSubsystemStage[];
  materialGrades: Record<VehicleSubsystemStage, MaterialGrade>;
  wheelbaseMm: number;
  trackWidthFrontMm: number;
  trackWidthRearMm: number;
  rideHeightMm: number;
  onUpdateWheelbase: (wb: number) => void;
  onUpdateTrackWidthFront: (tf: number) => void;
  onUpdateTrackWidthRear: (tr: number) => void;
  onUpdateRideHeight: (rh: number) => void;
  showCoG: boolean;
  onToggleCoG: () => void;
  showFEAStress: boolean;
  onToggleFEAStress: () => void;
  showLoadVectors: boolean;
  onToggleLoadVectors: () => void;
  isolatedStage: string | null;
  onSelectIsolatedStage: (stage: string | null) => void;
}

export const ModularCarStructureWorkbench: React.FC<ModularCarStructureWorkbenchProps> = ({
  chassis,
  installedStages,
  materialGrades,
  wheelbaseMm,
  trackWidthFrontMm,
  trackWidthRearMm,
  rideHeightMm,
  onUpdateWheelbase,
  onUpdateTrackWidthFront,
  onUpdateTrackWidthRear,
  onUpdateRideHeight,
  showCoG,
  onToggleCoG,
  showFEAStress,
  onToggleFEAStress,
  showLoadVectors,
  onToggleLoadVectors,
  isolatedStage,
  onSelectIsolatedStage,
}) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'cog_mass' | 'fea_rigidity' | 'hardpoints'>('hierarchy');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node_chassis_platform');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    structural: true,
    suspension: true,
    unsprung: true,
    powertrain: true,
    cabin: true,
    aero: true,
  });

  // Calculate live structure telemetry (Memoized for high-performance zero-lag UI updates)
  const telemetry: ModularStructureTelemetry = useMemo(() => {
    return ModularStructureEngine.solveStructure(
      chassis,
      installedStages,
      materialGrades,
      wheelbaseMm,
      trackWidthFrontMm,
      trackWidthRearMm,
      rideHeightMm
    );
  }, [
    chassis,
    installedStages,
    materialGrades,
    wheelbaseMm,
    trackWidthFrontMm,
    trackWidthRearMm,
    rideHeightMm,
  ]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const selectedNode = telemetry.nodes.find((n) => n.id === selectedNodeId) || telemetry.nodes[0];

  const getGradeColor = (grade: MaterialGrade) => {
    switch (grade) {
      case 'ceramic':
        return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
      case 'titanium':
        return 'text-amber-400 border-amber-500/40 bg-slate-900/60';
      case 'billet':
        return 'text-amber-400 border-amber-500/40 bg-slate-900/60';
      case 'forged':
        return 'text-yellow-400 border-yellow-500/40 bg-yellow-950/40';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-900/40';
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 border border-amber-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-4">
      {/* ── HEADER & NAVIGATION TABS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Layers size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-amber-100 tracking-wider font-mono">
                MODULAR STRUCTURE ARCHITECTURE WORKBENCH
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {telemetry.structuralRigidity.rigidityGrade.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-Node Kinematic CoG • FEA Torsional Rigidity ({telemetry.structuralRigidity.torsionalStiffnessKNmDeg} kNm/deg) • 4-Corner Mass Distribution
            </p>
          </div>
        </div>

        {/* 3D Telemetry Overlay Quick-Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onToggleCoG}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
              showCoG
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Compass size={13} className={showCoG ? 'animate-spin-slow' : ''} />
            <span>3D CoG</span>
          </button>

          <button
            onClick={onToggleFEAStress}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
              showFEAStress
                ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Flame size={13} />
            <span>FEA STRESS</span>
          </button>

          <button
            onClick={onToggleLoadVectors}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
              showLoadVectors
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Scale size={13} />
            <span>LOAD ARROWS</span>
          </button>

          {/* Subassembly Solo Isolation Filter */}
          <select
            value={isolatedStage || 'all'}
            onChange={(e) => onSelectIsolatedStage(e.target.value === 'all' ? null : e.target.value)}
            className="bg-slate-900/80 border border-slate-700 text-amber-300 text-xs rounded-lg px-2 py-1 font-mono focus:outline-none focus:border-amber-500"
          >
            <option value="all">SOLO: ALL STAGES</option>
            <option value="chassis">SOLO: CHASSIS FRAME</option>
            <option value="suspension">SOLO: SUSPENSION</option>
            <option value="wheels">SOLO: BRAKES & WHEELS</option>
            <option value="powertrain">SOLO: POWERTRAIN / BATTERY</option>
            <option value="aero">SOLO: ACTIVE AERO</option>
          </select>
        </div>
      </div>

      {/* ── WORKBENCH SUB-TABS ── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'hierarchy', label: '1. SUBSYSTEM TREE', icon: <Layers size={14} /> },
          { id: 'cog_mass', label: '2. 3D CoG & CORNER WEIGHTS', icon: <Scale size={14} /> },
          { id: 'fea_rigidity', label: '3. FEA STRESS & RIGIDITY', icon: <Flame size={14} /> },
          { id: 'hardpoints', label: '4. HARDPOINT GEOMETRY', icon: <Sliders size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: SUBSYSTEM HIERARCHY TREE EXPLORER ── */}
      {activeTab === 'hierarchy' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left 2 Cols: Expandable Subsystem Hierarchy Tree */}
          <div className="lg:col-span-2 space-y-2 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 max-h-[460px] overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-2 border-b border-slate-800">
              <span>VEHICLE STRUCTURAL HIERARCHY ({telemetry.nodes.length} ACTIVE NODES)</span>
              <span>TOTAL MASS: <strong className="text-amber-300">{telemetry.totalMassKg} kg</strong></span>
            </div>

            {['structural', 'suspension', 'unsprung', 'powertrain', 'cabin', 'aero'].map((category) => {
              const categoryNodes = telemetry.nodes.filter((n) => n.category === category);
              if (categoryNodes.length === 0) return null;

              const isExpanded = !!expandedCategories[category];

              return (
                <div key={category} className="space-y-1">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 text-xs font-mono text-left transition-all"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown size={14} className="text-amber-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                      <span className="font-bold text-slate-200 uppercase tracking-wider">{category} ASSEMBLY</span>
                      <span className="text-[10px] text-slate-500">({categoryNodes.length} nodes)</span>
                    </div>
                    <span className="text-[11px] font-mono text-amber-400/90">
                      {Math.round(categoryNodes.reduce((sum, n) => sum + n.baseMassKg, 0))} kg
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pl-4 space-y-1">
                      {categoryNodes.map((node) => {
                        const isSelected = selectedNodeId === node.id;
                        const gradeClass = getGradeColor(node.materialGrade);

                        return (
                          <div
                            key={node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <CornerDownRight size={12} className={isSelected ? 'text-amber-400' : 'text-slate-600'} />
                              <span className="font-semibold">{node.name}</span>
                              {node.isUnsprung && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-900/80 text-amber-300 border border-slate-700/60 text-[9px]">
                                  UNSPRUNG
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded border ${gradeClass}`}>
                                {node.materialGrade.toUpperCase()}
                              </span>
                              <span className="text-amber-300 font-bold min-w-[50px] text-right">
                                {Math.round(node.baseMassKg)} kg
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Col: Selected Node Deep Inspector */}
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <Box size={14} />
                <span>NODE INSPECTOR</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {selectedNode.category.toUpperCase()}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-100">{selectedNode.name}</h4>
              <p className="text-xs text-slate-400 mt-1">{selectedNode.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">BASE MASS</span>
                <strong className="text-amber-300 text-sm">{Math.round(selectedNode.baseMassKg)} kg</strong>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">MASS TYPE</span>
                <strong className={selectedNode.isUnsprung ? 'text-amber-400 text-sm' : 'text-amber-400 text-sm'}>
                  {selectedNode.isUnsprung ? 'Unsprung' : 'Sprung'}
                </strong>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">METALLURGY GRADE</span>
                <strong className="text-emerald-300 text-sm">{selectedNode.materialGrade.toUpperCase()}</strong>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">JOINT STIFFNESS</span>
                <strong className="text-yellow-300 text-sm">{(selectedNode.structuralStiffnessNmDeg / 1000).toFixed(1)} kNm/°</strong>
              </div>
            </div>

            {/* 3D Local Center of Mass Offsets */}
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs font-mono">
              <span className="text-[10px] text-slate-500 block font-bold">LOCAL 3D CENTER OF MASS [X, Y, Z]</span>
              <div className="grid grid-cols-3 gap-1 text-center text-slate-300">
                <div className="bg-slate-900 p-1 rounded border border-slate-800">
                  <span className="text-[9px] text-red-400 block">X (Fore/Aft)</span>
                  <strong>{selectedNode.localCoM.x > 0 ? `+${selectedNode.localCoM.x.toFixed(2)}m` : `${selectedNode.localCoM.x.toFixed(2)}m`}</strong>
                </div>
                <div className="bg-slate-900 p-1 rounded border border-slate-800">
                  <span className="text-[9px] text-green-400 block">Y (Height)</span>
                  <strong>+{selectedNode.localCoM.y.toFixed(2)}m</strong>
                </div>
                <div className="bg-slate-900 p-1 rounded border border-slate-800">
                  <span className="text-[9px] text-amber-400 block">Z (Lateral)</span>
                  <strong>{selectedNode.localCoM.z === 0 ? '0.00m' : `${selectedNode.localCoM.z.toFixed(2)}m`}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: 3D CoG & CORNER WEIGHT BALANCE HUD ── */}
      {activeTab === 'cog_mass' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: Mass & Longitudinal CoG Gauge */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-3 font-mono">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Scale size={14} />
              <span>MASS BREAKDOWN & 3D CoG</span>
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Vehicle Curb Weight</span>
                <strong className="text-amber-300 font-bold">{telemetry.totalMassKg} kg</strong>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Sprung Mass</span>
                <span className="text-amber-300 font-semibold">{telemetry.sprungMassKg} kg</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Unsprung Mass (Corners)</span>
                <span className="text-amber-300 font-semibold">{telemetry.unsprungMassKg} kg</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
              <span className="text-[10px] text-slate-500 font-bold block">3D CENTER OF GRAVITY COORDINATES</span>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">Xcg (Aft Fr Axle)</span>
                  <strong className="text-amber-300">{Math.abs(telemetry.centerOfGravity.xMm)} mm</strong>
                </div>
                <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">Ycg (Height)</span>
                  <strong className="text-amber-300">{telemetry.centerOfGravity.yMm} mm</strong>
                </div>
                <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                  <span className="text-[9px] text-slate-500 block">Zcg (Lateral)</span>
                  <strong className="text-slate-300">{telemetry.centerOfGravity.zMm} mm</strong>
                </div>
              </div>
            </div>

            {/* Front / Rear Weight Distribution Bar */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">FRONT {telemetry.weightDistribution.frontPercent}%</span>
                <span className="text-slate-400 font-bold">REAR {telemetry.weightDistribution.rearPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-700">
                <div style={{ width: `${telemetry.weightDistribution.frontPercent}%` }} className="bg-gradient-to-r from-amber-500 to-yellow-400" />
                <div style={{ width: `${telemetry.weightDistribution.rearPercent}%` }} className="bg-gradient-to-r from-amber-500 to-amber-500" />
              </div>
            </div>
          </div>

          {/* Center: 4-Corner Weight Matrix */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-3 font-mono">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Compass size={14} />
              <span>4-CORNER NORMAL LOAD MATRIX</span>
            </h4>

            {/* Visual Chassis Corner Box */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              {/* Front Left */}
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/40 space-y-0.5">
                <span className="text-[10px] text-amber-400 font-bold block">FRONT LEFT (FL)</span>
                <strong className="text-amber-200 text-sm">{telemetry.cornerLoadsKg.fl} kg</strong>
                <span className="text-[10px] text-slate-500 block">{telemetry.cornerForcesN.fl} N</span>
              </div>

              {/* Front Right */}
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/40 space-y-0.5">
                <span className="text-[10px] text-amber-400 font-bold block">FRONT RIGHT (FR)</span>
                <strong className="text-amber-200 text-sm">{telemetry.cornerLoadsKg.fr} kg</strong>
                <span className="text-[10px] text-slate-500 block">{telemetry.cornerForcesN.fr} N</span>
              </div>

              {/* Rear Left */}
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/40 space-y-0.5">
                <span className="text-[10px] text-amber-400 font-bold block">REAR LEFT (RL)</span>
                <strong className="text-amber-200 text-sm">{telemetry.cornerLoadsKg.rl} kg</strong>
                <span className="text-[10px] text-slate-500 block">{telemetry.cornerForcesN.rl} N</span>
              </div>

              {/* Rear Right */}
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/40 space-y-0.5">
                <span className="text-[10px] text-amber-400 font-bold block">REAR RIGHT (RR)</span>
                <strong className="text-amber-200 text-sm">{telemetry.cornerLoadsKg.rr} kg</strong>
                <span className="text-[10px] text-slate-500 block">{telemetry.cornerForcesN.rr} N</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
              <span className="text-slate-400">Cross-Weight (FL + RR):</span>
              <strong className="text-yellow-300">{telemetry.weightDistribution.crossWeightPercent}%</strong>
            </div>
          </div>

          {/* Right: Roll Centers & Moments of Inertia */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-3 font-mono">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Zap size={14} />
              <span>KINEMATIC AXIS & INERTIA</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Front Roll Center Height</span>
                <strong className="text-amber-300">{telemetry.kinematics.frontRollCenterHeightMm} mm</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rear Roll Center Height</span>
                <strong className="text-amber-300">{telemetry.kinematics.rearRollCenterHeightMm} mm</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Roll Axis Inclination</span>
                <strong className="text-yellow-300">+{telemetry.kinematics.rollAxisInclinationDeg}°</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Yaw Inertia (Izz)</span>
                <strong className="text-slate-200">{telemetry.kinematics.yawMomentOfInertiaIzz} kg·m²</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pitch Inertia (Iyy)</span>
                <strong className="text-slate-200">{telemetry.kinematics.pitchMomentOfInertiaIyy} kg·m²</strong>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              Optimal roll axis slope provides neutral roll-steer and high transient turn-in stability.
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: FEA STRUCTURAL STRESS & RIGIDITY DECK ── */}
      {activeTab === 'fea_rigidity' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {/* Torsional Rigidity Stats */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Flame size={14} />
              <span>CHASSIS RIGIDITY TELEMETRY</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Torsional Stiffness</span>
                <strong className="text-amber-300 text-sm font-bold">{telemetry.structuralRigidity.torsionalStiffnessKNmDeg} kNm/°</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bending Stiffness</span>
                <strong className="text-amber-300 font-bold">{telemetry.structuralRigidity.bendingStiffnessKNm} kNm</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">1st Torsional Frequency</span>
                <strong className="text-emerald-300 font-bold">{telemetry.structuralRigidity.chassisTorsionalFrequencyHz} Hz</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chassis Safety Rating</span>
                <strong className="text-yellow-300 font-bold">{telemetry.structuralRigidity.chassisSafetyRating} / 100</strong>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Exceeds FIA GT3 & Hypercar homologation torsional baseline (&gt;35 kNm/°).</span>
            </div>
          </div>

          {/* FEA Stress Hotspots Table (2 cols) */}
          <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-amber-300">FEA STRUCTURAL STRESS HOTSPOT NODES</span>
              <span className="text-slate-500">2G CORNERING / 3G BUMP LOAD CASES</span>
            </div>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
              {telemetry.feaHotspots.map((spot) => (
                <div
                  key={spot.nodeId}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{spot.name}</span>
                    <span className="text-[10px] text-slate-500">
                      Load Case: {spot.dominantLoadCase.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-amber-300 font-bold">{spot.vonMisesStressMpa} MPa</span>
                      <span className="text-[10px] text-slate-500 block">Yield: {spot.yieldStrengthMpa} MPa</span>
                    </div>

                    <div className="min-w-[65px]">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        spot.severity === 'critical'
                          ? 'bg-red-950/60 text-red-300 border-red-500/40'
                          : spot.severity === 'elevated'
                          ? 'bg-yellow-950/60 text-yellow-300 border-yellow-500/40'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      }`}>
                        SF: {spot.safetyFactor.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: KINEMATIC HARDPOINT GEOMETRY SLIDERS ── */}
      {activeTab === 'hardpoints' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {/* Wheelbase */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Wheelbase</span>
              <strong className="text-amber-300">{wheelbaseMm} mm</strong>
            </div>
            <input
              type="range"
              min={2200}
              max={3400}
              step={10}
              value={wheelbaseMm}
              onChange={(e) => onUpdateWheelbase(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Front-to-rear axle datum span</span>
          </div>

          {/* Front Track */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Front Track Width</span>
              <strong className="text-amber-300">{trackWidthFrontMm} mm</strong>
            </div>
            <input
              type="range"
              min={1400}
              max={1850}
              step={5}
              value={trackWidthFrontMm}
              onChange={(e) => onUpdateTrackWidthFront(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Front tire centerline lateral span</span>
          </div>

          {/* Rear Track */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Rear Track Width</span>
              <strong className="text-amber-300">{trackWidthRearMm} mm</strong>
            </div>
            <input
              type="range"
              min={1400}
              max={1900}
              step={5}
              value={trackWidthRearMm}
              onChange={(e) => onUpdateTrackWidthRear(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Rear tire centerline lateral span</span>
          </div>

          {/* Ride Height */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Ride Height</span>
              <strong className="text-amber-300">{rideHeightMm} mm</strong>
            </div>
            <input
              type="range"
              min={60}
              max={260}
              step={2}
              value={rideHeightMm}
              onChange={(e) => onUpdateRideHeight(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Ground clearance to chassis underside</span>
          </div>
        </div>
      )}
    </div>
  );
};
