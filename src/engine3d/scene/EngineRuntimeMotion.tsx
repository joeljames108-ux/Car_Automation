// ============================================================================
// ENGINE RUNTIME MOTION — REALISTIC 4-STROKE FIRING & REVVING ANIMATION SYSTEM
// ============================================================================
// Drives the authentic 559-node V12 racing engine GLB:
// - Non-linear Slider-Crank kinematics on 12 forged pistons & ring packs
// - Articulated connecting rods pivoting on orbiting crankpins
// - Crankshaft main shaft & 6 counterweights rotating on longitudinal X-axis
// - 4 Camshafts rotating at half-speed (ω/2) with 48 cam lobes
// - 12 ITB throttle butterfly plates & spindles reacting to throttle input
// - Front accessory damper pulley, alternator pulley, tensioner, cooling fan
// - Flywheel mass & titanium exhaust headers
// - Real-time Cylinder Cutaway (X-Ray) mode with crystal quartz transparency
// - 4-Stroke Cycle: AIR INTAKE → COMPRESSION → IGNITION → POWER → EXHAUST
// - Firing Order Matrix HUD (1-12-5-8-3-10-6-7-2-11-4-9) & Slow-Motion controls
// ============================================================================

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import {
  Play,
  Pause,
  Zap,
  Flame,
  Wind,
  Layers,
  Eye,
  Sliders,
  Gauge,
  Activity,
  RotateCw,
  Sparkles,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Wrench,
  X,
  Info,
} from 'lucide-react';
import { useEngine3DStore } from '../store/useEngine3DStore';
import {
  EngineSimulationState,
  type EngineSimulationSnapshot,
} from '../physics/EngineSimulationState';
import { EngineGlbAnimator } from '../animations/EngineGlbAnimator';
import {
  type CylinderCycleState,
  type EngineType,
} from '../animations/engineRuntimeAnimations';
import { apexAudio } from '../../components/assembly/engineAudioEngine';

// Pre-load the master V12 racing engine GLB so it mounts instantly
useGLTF.preload('/models/v12_racing_engine.glb');

// ============================================================================
// 1. 12-CYLINDER FIRING ORDER & CYCLE PHASE HUD
// ============================================================================

interface FiringOrderHudProps {
  cylinderStates: CylinderCycleState[];
  snapshot: EngineSimulationSnapshot | null;
}

const FiringOrderHud: React.FC<FiringOrderHudProps> = React.memo(({ cylinderStates, snapshot }) => {
  if (!snapshot || snapshot.state === 'OFF') return null;

  // Split cylinders into Bank 1 (Left: 1, 3, 5, 7, 9, 11) and Bank 2 (Right: 2, 4, 6, 8, 10, 12)
  const leftBankIndices = [0, 2, 4, 6, 8, 10]; // Cylinders 1, 3, 5, 7, 9, 11
  const rightBankIndices = [1, 3, 5, 7, 9, 11]; // Cylinders 2, 4, 6, 8, 10, 12

  const getPhaseColor = (state?: CylinderCycleState) => {
    if (!state) return '#334155';
    if (state.isSparkFiring) return '#ffffff';
    switch (state.phase) {
      case 'INTAKE': return '#00e5ff'; // Cyan
      case 'COMPRESSION': return '#fbbf24'; // Warm yellow
      case 'POWER': return '#ff3b00'; // Fiery red-orange
      case 'EXHAUST': return '#f97316'; // Amber
      default: return '#334155';
    }
  };

  const getPhaseShortName = (state?: CylinderCycleState) => {
    if (!state) return 'IDLE';
    if (state.isSparkFiring) return 'SPARK';
    switch (state.phase) {
      case 'INTAKE': return 'INTK';
      case 'COMPRESSION': return 'COMP';
      case 'POWER': return 'POWR';
      case 'EXHAUST': return 'EXHT';
    }
  };

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 p-3 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-amber-500/25 shadow-2xl pointer-events-auto font-mono text-[10px] select-none min-w-[280px]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold tracking-wider">
          <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>4-STROKE FIRING ORDER (60° V12)</span>
        </div>
        <span className="text-slate-400 text-[9px] bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
          1-12-5-8-3-10-6-7-2-11-4-9
        </span>
      </div>

      {/* 4-Stroke Phase Legend */}
      <div className="flex items-center justify-between text-[9px] text-slate-400 px-1 py-0.5 bg-slate-900/60 rounded">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />INTAKE</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />COMPR</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ff3b00]" />POWER</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />EXHST</span>
      </div>

      {/* Cylinder Matrix: Bank 1 (Left) & Bank 2 (Right) */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        {/* Left Bank */}
        <div className="flex flex-col gap-1 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
          <div className="text-[9px] text-slate-400 font-bold px-1 text-center">BANK 1 (LEFT)</div>
          <div className="grid grid-cols-3 gap-1">
            {leftBankIndices.map((cylIdx) => {
              const cylState = cylinderStates[cylIdx];
              const color = getPhaseColor(cylState);
              const isFiring = cylState?.isSparkFiring || cylState?.phase === 'POWER';
              return (
                <div
                  key={cylIdx}
                  className="flex flex-col items-center justify-center p-1 rounded-lg border transition-all duration-75"
                  style={{
                    backgroundColor: isFiring ? `${color}22` : 'rgba(15, 23, 42, 0.6)',
                    borderColor: isFiring ? color : 'rgba(51, 65, 85, 0.4)',
                    boxShadow: isFiring ? `0 0 8px ${color}66` : 'none',
                  }}
                >
                  <span className="font-bold text-[10px]" style={{ color }}>
                    #{cylIdx + 1}
                  </span>
                  <span className="text-[8px] font-semibold" style={{ color: isFiring ? '#ffffff' : color }}>
                    {getPhaseShortName(cylState)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Bank */}
        <div className="flex flex-col gap-1 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
          <div className="text-[9px] text-slate-400 font-bold px-1 text-center">BANK 2 (RIGHT)</div>
          <div className="grid grid-cols-3 gap-1">
            {rightBankIndices.map((cylIdx) => {
              const cylState = cylinderStates[cylIdx];
              const color = getPhaseColor(cylState);
              const isFiring = cylState?.isSparkFiring || cylState?.phase === 'POWER';
              return (
                <div
                  key={cylIdx}
                  className="flex flex-col items-center justify-center p-1 rounded-lg border transition-all duration-75"
                  style={{
                    backgroundColor: isFiring ? `${color}22` : 'rgba(15, 23, 42, 0.6)',
                    borderColor: isFiring ? color : 'rgba(51, 65, 85, 0.4)',
                    boxShadow: isFiring ? `0 0 8px ${color}66` : 'none',
                  }}
                >
                  <span className="font-bold text-[10px]" style={{ color }}>
                    #{cylIdx + 1}
                  </span>
                  <span className="text-[8px] font-semibold" style={{ color: isFiring ? '#ffffff' : color }}>
                    {getPhaseShortName(cylState)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
import { playHMIClickSound } from '../../utils/hmiSoundSynth';

// Multi-Mode View Types
export type EngineViewMode = 'standard' | '360' | 'exploded' | 'anatomy' | 'cutaway';

export const COMPONENT_OPTIONS = {
  pistonType: [
    { id: 'forged_2618', name: 'Forged 2618 Alloy', hpDelta: 0, weightDelta: 0, rpmLimit: 9000, desc: 'High-strength aluminum alloy, baseline endurance spec' },
    { id: 'titanium_slipper', name: 'Titanium Slipper Pistons', hpDelta: 35, weightDelta: -4.2, rpmLimit: 9500, desc: 'Ultra-lightweight slipper skirt with DLC-coated wrist pins' },
    { id: 'billet_highcomp', name: 'Billet 13.5:1 High-Comp', hpDelta: 65, weightDelta: -2.1, rpmLimit: 9200, desc: 'Dome crown chamber matching for high-octane racing fuel' },
  ],
  turboType: [
    { id: 'twin_scroll', name: 'Twin-Scroll Turbos (1.2 bar)', hpDelta: 0, weightDelta: 0, boostBar: 1.20, desc: 'Dual ceramic ball-bearing twin-scrollchargers (Baseline)' },
    { id: 'na_velocity_stacks', name: 'NA Carbon Velocity Stacks', hpDelta: -100, weightDelta: -24.0, boostBar: 0.0, desc: 'Naturally aspirated induction screaming to 9,800 RPM' },
    { id: 'quad_turbo', name: 'Quad-Turbo Hypercar Spec (1.95 bar)', hpDelta: 220, weightDelta: 18.5, boostBar: 1.95, desc: 'Four staged boost chargers delivering 1,000+ HP peak' },
  ],
  intakeType: [
    { id: 'dual_plenum', name: 'Dual Cast Plenum', hpDelta: 0, weightDelta: 0, desc: 'Optimized internal runners for broad midrange torque curve' },
    { id: 'carbon_itb', name: 'Carbon Fiber 12-ITBs', hpDelta: 25, weightDelta: -3.5, desc: '12 synchronized 48mm throttle butterflies with velocity horns' },
    { id: 'boosted_ram', name: 'Billet Ram Induction', hpDelta: 40, weightDelta: 1.2, desc: 'Pressurized dual-rail plenum engineered for high-boost charge' },
  ],
  exhaustType: [
    { id: 'stainless_304', name: 'TIG Stainless 304', hpDelta: 0, weightDelta: 0, desc: 'Equal-length primary runners with tuned merge collectors' },
    { id: 'inconel_625', name: 'Inconel 625 F1 Headers', hpDelta: 30, weightDelta: -8.0, desc: '0.8mm aerospace superalloy with extreme thermal retention' },
    { id: 'titanium_straight', name: 'Titanium Screamer Pipes', hpDelta: 45, weightDelta: -12.0, desc: 'Open unmuffled track exhaust with signature high-RPM howl' },
  ],
  valvetrainType: [
    { id: 'dohc_48v', name: 'DOHC 48V Dual Springs', hpDelta: 0, weightDelta: 0, rpmLimit: 9000, desc: 'Sodium-filled valves with dual pac-alloy valve springs' },
    { id: 'pneumatic_race', name: 'Pneumatic Return (F1 Spec)', hpDelta: 40, weightDelta: -5.5, rpmLimit: 10500, desc: 'Nitrogen gas return springs, eliminates valve float to 10,500 RPM' },
    { id: 'variable_lift', name: 'Dual VVT High-Lift Cams', hpDelta: 20, weightDelta: 0.8, rpmLimit: 9400, desc: 'Continuously variable cam phase with 13.2mm high-lift lobes' },
  ],
};

export function calculateComponentDeltas(swaps: {
  pistonType: string;
  turboType: string;
  intakeType: string;
  exhaustType: string;
  valvetrainType: string;
}) {
  let netHp = 0;
  let netWeight = 0;

  const p = COMPONENT_OPTIONS.pistonType.find((x) => x.id === swaps.pistonType);
  if (p) { netHp += p.hpDelta; netWeight += p.weightDelta; }

  const t = COMPONENT_OPTIONS.turboType.find((x) => x.id === swaps.turboType);
  if (t) { netHp += t.hpDelta; netWeight += t.weightDelta; }

  const i = COMPONENT_OPTIONS.intakeType.find((x) => x.id === swaps.intakeType);
  if (i) { netHp += i.hpDelta; netWeight += i.weightDelta; }

  const e = COMPONENT_OPTIONS.exhaustType.find((x) => x.id === swaps.exhaustType);
  if (e) { netHp += e.hpDelta; netWeight += e.weightDelta; }

  const v = COMPONENT_OPTIONS.valvetrainType.find((x) => x.id === swaps.valvetrainType);
  if (v) { netHp += v.hpDelta; netWeight += v.weightDelta; }

  return { netHp, netWeight };
}

// Floating Anatomy Callout Badges
const ANATOMY_CALLOUTS = [
  {
    title: 'DOHC 48-VALVE CYLINDER HEADS',
    badge: 'BANK 1 & 2',
    desc: 'Dual overhead camshafts driving 4 valves per cylinder with sodium-filled exhaust stems and DLC-coated roller finger followers.',
    coords: 'top-[20%] left-[12%]',
  },
  {
    title: 'FORGED 2618 PISTONS & H-BEAM RODS',
    badge: 'INTERNAL',
    desc: 'Slipper-skirt pistons with anti-friction molybdenum coating, paired with forged 4340 chromoly steel H-beam connecting rods.',
    coords: 'top-[42%] left-[10%]',
  },
  {
    title: '60° FLAT-PLANE BILLET CRANKSHAFT',
    badge: 'CRANKCASE',
    desc: 'Nitrided 4340 billet steel crankshaft with 6 knife-edged counterweights balancing primary and secondary rotational inertia.',
    coords: 'bottom-[26%] left-[14%]',
  },
  {
    title: 'CARBON FIBER 12-ITB INDUCTION',
    badge: 'AIR INDUCTION',
    desc: '12 synchronized 48mm throttle butterflies with CNC velocity trumpets delivering instant transient throttle response.',
    coords: 'top-[16%] right-[14%]',
  },
  {
    title: 'EQUAL-LENGTH INCONEL EXHAUST HEADERS',
    badge: 'SCAVENGE',
    desc: 'Tuned 6-into-1 scavenged merge collectors ceramic-coated for optimum pulse scavenging and extreme thermal barrier protection.',
    coords: 'top-[46%] right-[10%]',
  },
  {
    title: 'CERAMIC BALL-BEARING TURBOCHARGERS',
    badge: 'BOOST 1.2-1.95 BAR',
    desc: 'Twin-scroll high-temperature Inconel turbine wheels with electronic wastegates boosting up to 1.95 bar charge pressure.',
    coords: 'bottom-[22%] right-[14%]',
  },
];

const AnatomyOverlay: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none">
      <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
        <span className="text-cyan-300 font-mono text-xs font-bold tracking-widest">
          ANATOMY EXPLORATION MODE — ACTIVE SUBSYSTEMS
        </span>
      </div>

      {ANATOMY_CALLOUTS.map((callout, idx) => (
        <div
          key={idx}
          className={`absolute ${callout.coords} pointer-events-auto group cursor-pointer max-w-xs transition-all duration-300 hover:scale-105`}
        >
          <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-md border border-cyan-500/50 hover:border-cyan-400 px-3 py-1.5 rounded-xl shadow-lg group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold text-cyan-300 tracking-wide">
                {callout.title}
              </span>
              <span className="text-[8px] font-mono text-cyan-500">
                {callout.badge}
              </span>
            </div>
          </div>
          <div className="mt-1 hidden group-hover:block bg-slate-900/95 border border-slate-700 p-2 rounded-lg text-[9px] text-slate-300 font-sans shadow-2xl backdrop-blur-md">
            {callout.desc}
          </div>
        </div>
      ))}
    </div>
  );
};

interface RuntimeControlOverlayProps {
  snapshot: EngineSimulationSnapshot | null;
  onToggleEngine: () => void;
  onRevBurst: () => void;
  onSetTargetRpm: (rpm: number) => void;
  onSetThrottle: (throttle: number) => void;
  onSetTimeScale: (scale: number) => void;
  cutawayMode: boolean;
  onToggleCutaway: () => void;
  explodedFactor: number;
  onSetExploded: (f: number) => void;
  onShiftUp: () => void;
  onShiftDown: () => void;
  onSetGear: (gear: number) => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  // Multi-Mode & Customization additions
  viewMode: EngineViewMode;
  onSetViewMode: (mode: EngineViewMode) => void;
  isAutoRotate360: boolean;
  anatomyMode: boolean;
  componentSwaps: {
    pistonType: string;
    turboType: string;
    intakeType: string;
    exhaustType: string;
    valvetrainType: string;
  };
  onSetComponentSwap: (category: 'pistonType' | 'turboType' | 'intakeType' | 'exhaustType' | 'valvetrainType', value: string) => void;
  netHpDelta: number;
  netWeightDelta: number;
}

const RuntimeControlOverlay: React.FC<RuntimeControlOverlayProps> = ({
  snapshot,
  onToggleEngine,
  onRevBurst,
  onSetTargetRpm,
  onSetThrottle,
  onSetTimeScale,
  cutawayMode,
  onToggleCutaway,
  explodedFactor,
  onSetExploded,
  onShiftUp,
  onShiftDown,
  onSetGear,
  isAudioMuted,
  onToggleAudio,
  viewMode,
  onSetViewMode,
  isAutoRotate360,
  anatomyMode,
  componentSwaps,
  onSetComponentSwap,
  netHpDelta,
  netWeightDelta,
}) => {
  const [isSwapperOpen, setIsSwapperOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'pistonType' | 'turboType' | 'intakeType' | 'exhaustType' | 'valvetrainType'>('pistonType');

  const isRunning = snapshot ? snapshot.state !== 'OFF' : false;
  const rpm = snapshot ? Math.round(snapshot.rpm) : 0;
  const throttle = snapshot ? Math.round(snapshot.throttle * 100) : 0;
  const boost = snapshot ? snapshot.boostPressureBar.toFixed(2) : '0.00';
  const turboRpm = snapshot ? Math.round(snapshot.turboRpm).toLocaleString() : '0';
  const timeScale = snapshot ? snapshot.timeScale : 1.0;
  const stateLabel = snapshot ? snapshot.state : 'OFF';
  const currentGear = snapshot ? snapshot.currentGear : 1;
  const speedKmh = snapshot ? snapshot.vehicleSpeedKmh : 0;
  const isShifting = snapshot ? snapshot.isShifting : false;

  const rpmColor =
    rpm > 8000 ? '#ef4444' : rpm > 6500 ? '#f97316' : rpm > 3000 ? '#eab308' : '#22c55e';

  return (
    <>
      {/* Top-Right Multi-Mode Switcher: /360, /EXPLODED, /ANATOMY, /CUTAWAY */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-2xl font-mono text-xs select-none pointer-events-auto">
        <button
          onClick={() => {
            playHMIClickSound('select');
            onSetViewMode('360');
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all border ${
            isAutoRotate360
              ? 'bg-amber-500/25 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-amber-300'
          }`}
          title="360° Continuous Orbit Rotation"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate360 ? 'animate-spin' : ''}`} />
          <span>/360</span>
        </button>

        <button
          onClick={() => {
            playHMIClickSound('select');
            onSetViewMode('exploded');
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all border ${
            explodedFactor > 0.05
              ? 'bg-amber-500/25 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-amber-300'
          }`}
          title="Exploded Assembly Separation View"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>/EXPLODED</span>
        </button>

        <button
          onClick={() => {
            playHMIClickSound('select');
            onSetViewMode('anatomy');
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all border ${
            anatomyMode
              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-cyan-300'
          }`}
          title="Subsystem Anatomy & Callout Pins"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>/ANATOMY</span>
        </button>

        <button
          onClick={() => {
            playHMIClickSound('select');
            onSetViewMode('cutaway');
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all border ${
            cutawayMode
              ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-emerald-300'
          }`}
          title="X-Ray Crystal Quartz Cylinder Cutaway"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>/CUTAWAY</span>
        </button>
      </div>

      {/* Component Swap Workbench Drawer */}
      {isSwapperOpen && (
        <div className="fixed top-16 right-4 z-30 w-80 max-h-[80vh] flex flex-col bg-slate-950/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl p-3 font-mono overflow-hidden animate-in slide-in-from-right-5 duration-200 pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Wrench className="w-4 h-4" />
              <span>CUSTOM WORKBENCH</span>
            </div>
            <button
              onClick={() => {
                playHMIClickSound('close');
                setIsSwapperOpen(false);
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subsystem Category Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1.5 mb-2 scrollbar-thin">
            {[
              { key: 'pistonType', label: 'PISTONS' },
              { key: 'turboType', label: 'INDUCTION' },
              { key: 'intakeType', label: 'INTAKE' },
              { key: 'exhaustType', label: 'EXHAUST' },
              { key: 'valvetrainType', label: 'VALVES' },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  playHMIClickSound('select');
                  setActiveCategory(cat.key as any);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.key
                    ? 'bg-amber-400 text-slate-950 font-black shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-amber-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Options for Active Category */}
          <div className="flex flex-col gap-2 overflow-y-auto pr-1">
            {(COMPONENT_OPTIONS as any)[activeCategory].map((opt: any) => {
              const isSelected = (componentSwaps as any)[activeCategory] === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    playHMIClickSound('success');
                    onSetComponentSwap(activeCategory, opt.id);
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                      {opt.name}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                        EQUIPPED
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed mb-1.5">
                    {opt.desc}
                  </p>
                  <div className="flex items-center gap-2 text-[9px]">
                    <span className={`font-bold ${opt.hpDelta > 0 ? 'text-emerald-400' : opt.hpDelta < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                      {opt.hpDelta > 0 ? `+${opt.hpDelta} HP` : opt.hpDelta < 0 ? `${opt.hpDelta} HP` : '0 HP'}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className={`font-bold ${opt.weightDelta < 0 ? 'text-emerald-400' : opt.weightDelta > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                      {opt.weightDelta > 0 ? `+${opt.weightDelta} kg` : opt.weightDelta < 0 ? `${opt.weightDelta} kg` : '0 kg'}
                    </span>
                    {opt.rpmLimit && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-amber-400 font-bold">{opt.rpmLimit} RPM</span>
                      </>
                    )}
                    {opt.boostBar !== undefined && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-cyan-400 font-bold">{opt.boostBar} BAR</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Cockpit Bottom HUD */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2 max-w-[95vw] w-auto font-mono select-none pointer-events-auto">
        {/* Top Telemetry Strip: Boost, RPM, Turbo, Gear, Speed, Power, Mass */}
        <div className="flex items-center gap-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-800 shadow-xl text-xs text-slate-300 overflow-x-auto max-w-full scrollbar-none">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[10px]">STATE:</span>
            <span
              className="font-bold text-[11px] px-1.5 py-0.5 rounded border"
              style={{
                color: isRunning ? '#22c55e' : '#94a3b8',
                backgroundColor: isRunning ? '#22c55e15' : '#33415520',
                borderColor: isRunning ? '#22c55e40' : '#47556940',
              }}
            >
              {stateLabel}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Big RPM Counter */}
          <div className="flex items-baseline gap-1">
            <span className="text-slate-500 text-[10px]">RPM:</span>
            <span className="font-extrabold text-base tracking-tight" style={{ color: rpmColor }}>
              {rpm.toLocaleString()}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Turbo Boost */}
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500 text-[10px]">BOOST:</span>
            <span className="font-bold text-cyan-300">{boost} <span className="text-[9px] text-slate-500">BAR</span></span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Turbo RPM */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-500 text-[10px]">TURBO:</span>
            <span className="font-semibold text-slate-300">{turboRpm}</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Current Gear Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[10px]">GEAR:</span>
            <span
              className={`font-black text-xs px-2 py-0.5 rounded border transition-all ${
                isShifting
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-110'
                  : 'bg-slate-900 text-amber-400 border-amber-500/40'
              }`}
            >
              {isShifting ? 'SHIFT' : `G${currentGear}`}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Vehicle Road Speed */}
          <div className="flex items-baseline gap-1">
            <span className="text-slate-500 text-[10px]">SPEED:</span>
            <span className="font-extrabold text-xs text-emerald-400">
              {speedKmh} <span className="text-[9px] text-slate-500">KM/H</span>
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Live Power Output with Delta */}
          <div className="flex items-baseline gap-1">
            <span className="text-slate-500 text-[10px]">POWER:</span>
            <span className="font-extrabold text-xs text-amber-300">
              {780 + netHpDelta} <span className="text-[9px] text-slate-500">HP</span>
            </span>
            {netHpDelta !== 0 && (
              <span
                className={`text-[9px] font-bold px-1 rounded ${
                  netHpDelta > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {netHpDelta > 0 ? `+${netHpDelta}` : netHpDelta}
              </span>
            )}
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {/* Live Mass with Delta */}
          <div className="flex items-baseline gap-1">
            <span className="text-slate-500 text-[10px]">MASS:</span>
            <span className="font-extrabold text-xs text-slate-200">
              {(195.0 + netWeightDelta).toFixed(1)} <span className="text-[9px] text-slate-500">KG</span>
            </span>
            {netWeightDelta !== 0 && (
              <span
                className={`text-[9px] font-bold px-1 rounded ${
                  netWeightDelta < 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {netWeightDelta > 0 ? `+${netWeightDelta.toFixed(1)}` : netWeightDelta.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        {/* Main Interactive Control Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 bg-slate-950/90 backdrop-blur-xl p-2.5 rounded-2xl border border-amber-500/30 shadow-2xl">
          {/* START / STOP Push Button */}
          <button
            onClick={onToggleEngine}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs tracking-wider transition-all border shadow-lg ${
              isRunning
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 hover:bg-rose-500/30 active:scale-95'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30 active:scale-95'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'STOP' : 'START'}</span>
          </button>

          {/* REV BURST Trigger */}
          <button
            onClick={onRevBurst}
            disabled={!isRunning}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>REV!</span>
          </button>

          {/* AUDIO MUTE / UNMUTE */}
          <button
            onClick={onToggleAudio}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              !isAudioMuted
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-400'
            }`}
            title={isAudioMuted ? 'Unmute V12 Audio' : 'Mute V12 Audio'}
          >
            {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden sm:inline">{!isAudioMuted ? 'SOUND' : 'MUTED'}</span>
          </button>

          {/* 7-SPEED SEQUENTIAL PADDLE SHIFTER */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={onShiftDown}
              disabled={!isRunning || currentGear <= 1}
              className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-black bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/50 transition-all disabled:opacity-30 active:scale-95"
              title="Downshift with Auto-Blip Rev Match"
            >
              <ChevronDown className="w-3 h-3 text-amber-400" />
              <span>DOWN</span>
            </button>

            <div
              className={`px-2 py-0.5 rounded-lg font-black text-xs min-w-[30px] text-center border transition-all ${
                isShifting
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-105'
                  : 'bg-slate-950 text-amber-300 border-amber-500/40'
              }`}
            >
              G{currentGear}
            </div>

            <button
              onClick={onShiftUp}
              disabled={!isRunning || currentGear >= 7}
              className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-black bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/50 transition-all disabled:opacity-30 active:scale-95"
              title="Upshift with Flat-Shift Ignition Cut Pop"
            >
              <span>UP</span>
              <ChevronUp className="w-3 h-3 text-amber-400" />
            </button>
          </div>

          {/* Throttle Slider */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold">THROTTLE:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={throttle}
              disabled={!isRunning}
              onChange={(e) => onSetThrottle(Number(e.target.value) / 100)}
              className="w-20 sm:w-28 accent-amber-400 cursor-pointer disabled:opacity-40"
            />
            <span className="text-[10px] font-bold text-amber-400 w-7 text-right">{throttle}%</span>
          </div>

          {/* Preset RPM Buttons */}
          <div className="hidden lg:flex items-center gap-1">
            {[800, 2500, 5000, 7000, 8500].map((presetRpm) => (
              <button
                key={presetRpm}
                onClick={() => onSetTargetRpm(presetRpm)}
                disabled={!isRunning}
                className="px-1.5 py-1 rounded-lg text-[9px] font-bold bg-slate-900/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-all disabled:opacity-40"
              >
                {presetRpm}
              </button>
            ))}
          </div>

          {/* Slow-Motion Selector */}
          <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-400 font-semibold mr-0.5">SPEED:</span>
            {[
              { label: '1.0x', val: 1.0 },
              { label: '0.5x', val: 0.5 },
              { label: '0.25x', val: 0.25 },
              { label: '0.1x', val: 0.1 },
            ].map((spd) => (
              <button
                key={spd.val}
                onClick={() => onSetTimeScale(spd.val)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                  timeScale === spd.val
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>

          {/* Cutaway (X-Ray) Mode Toggle */}
          <button
            onClick={onToggleCutaway}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              cutawayMode
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-cyan-300 hover:border-cyan-500/40'
            }`}
            title="Make engine block & heads transparent crystal quartz to view internal pistons & crankshaft"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>CUTAWAY</span>
          </button>

          {/* Exploded View Slider */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
            <Layers className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] text-slate-400 font-semibold">EXPLODE:</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(explodedFactor * 100)}
              onChange={(e) => onSetExploded(Number(e.target.value) / 100)}
              className="w-16 sm:w-20 accent-amber-400 cursor-pointer"
            />
            <span className="text-[9px] font-bold text-amber-400 w-6 text-right">
              {Math.round(explodedFactor * 100)}%
            </span>
          </div>

          {/* Component Swapper Parts Button */}
          <button
            onClick={() => {
              playHMIClickSound(isSwapperOpen ? 'close' : 'open');
              setIsSwapperOpen((v) => !v);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isSwapperOpen
                ? 'bg-amber-500/30 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-amber-300 hover:border-amber-500/50'
            }`}
            title="Open Component Customization Workbench to swap pistons, turbos, intakes, and valvetrains"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>PARTS</span>
          </button>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// 3. MASTER ENGINE RUNTIME MOTION COMPONENT
// ============================================================================

export interface EngineRuntimeMotionProps {
  engineType?: EngineType;
  autoStart?: boolean;
  initialRpm?: number;
}

export const EngineRuntimeMotion: React.FC<EngineRuntimeMotionProps> = ({
  engineType = 'V12',
  autoStart = true,
  initialRpm = 800,
}) => {
  // Load the authentic 559-node V12 racing engine GLB
  const gltf = useGLTF('/models/v12_racing_engine.glb');
  const engineModel = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  // Store bindings
  const progress = useEngine3DStore((s) => s.progress);
  const cutawayMode = useEngine3DStore((s) => s.cutawayMode);
  const toggleCutawayMode = useEngine3DStore((s) => s.toggleCutawayMode);
  const setCutawayMode = useEngine3DStore((s) => s.setCutawayMode);
  const slowMotionScale = useEngine3DStore((s) => s.slowMotionScale);
  const setSlowMotionScale = useEngine3DStore((s) => s.setSlowMotionScale);
  const explodedAmount = useEngine3DStore((s) => s.explodedAmount);
  const setExplodedAmount = useEngine3DStore((s) => s.setExplodedAmount);

  // Multi-Mode & Customization Store bindings
  const isAutoRotate360 = useEngine3DStore((s) => s.isAutoRotate360);
  const anatomyMode = useEngine3DStore((s) => s.anatomyMode);
  const viewMode = useEngine3DStore((s) => s.viewMode);
  const setViewMode = useEngine3DStore((s) => s.setViewMode);
  const componentSwaps = useEngine3DStore((s) => s.componentSwaps);
  const setComponentSwap = useEngine3DStore((s) => s.setComponentSwap);

  // Calculate live horsepower and mass deltas
  const { netHpDelta, netWeightDelta } = useMemo(() => {
    return calculateComponentDeltas(componentSwaps);
  }, [componentSwaps]);

  // Physics Simulation & GLB Node Animator instances
  const simRef = useRef<EngineSimulationState>(new EngineSimulationState({ idleRpm: initialRpm }));
  const animatorRef = useRef<EngineGlbAnimator>(new EngineGlbAnimator());
  const lastTimeRef = useRef<number>(performance.now());

  // Reactive State for Overlays
  const [snapshot, setSnapshot] = useState<EngineSimulationSnapshot | null>(null);
  const [cylinderStates, setCylinderStates] = useState<CylinderCycleState[]>([]);

  // Bind GLB model into Animator once mounted
  useEffect(() => {
    if (engineModel) {
      animatorRef.current.bindModel(engineModel);
      animatorRef.current.setCutawayMode(cutawayMode);
      animatorRef.current.setExplodedFactor(explodedAmount);
    }
  }, [engineModel]);

  // Sync Cutaway Mode change
  useEffect(() => {
    animatorRef.current.setCutawayMode(cutawayMode);
  }, [cutawayMode]);

  // Sync Exploded View change
  useEffect(() => {
    animatorRef.current.setExplodedFactor(explodedAmount);
  }, [explodedAmount]);

  // Audio & Sequential Shifting State
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => apexAudio.getMuteState());
  const prevStateRef = useRef<string>('OFF');

  // Auto-start engine when assembly completes (or initial load)
  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => {
        simRef.current.startEngine();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  // Clean up audio graph on unmount
  useEffect(() => {
    return () => {
      apexAudio.stopEngineAudioGraph();
    };
  }, []);

  // Main Render Loop Tick: Update physics & GLB transforms every frame
  useFrame(() => {
    const now = performance.now();
    const deltaSec = Math.min(0.05, (now - lastTimeRef.current) / 1000);
    lastTimeRef.current = now;

    // Advance physics state (rotational dynamics, starter, turbo, limiter, gearbox)
    const snap = simRef.current.update(deltaSec);

    // Advance GLB node transforms & VFX (pistons, rods, crank, cams, valves, sparks, injectors)
    animatorRef.current.update(snap);

    // Update telemetry state for HUD
    setSnapshot(snap);
    setCylinderStates(animatorRef.current.getCylinderCycleStates());

    // Real-time V12 Acoustic Audio Synthesis Pipeline
    if (!isAudioMuted && snap.state !== 'OFF') {
      if (prevStateRef.current === 'OFF' && snap.state === 'CRANKING') {
        apexAudio.initAudioContext();
        apexAudio.triggerTestFireSequence('v12', 8500);
      } else {
        apexAudio.updateEngineAudio({
          layout: 'v12',
          rpm: snap.rpm,
          throttle: snap.throttle,
          engineLoad: Math.max(0.12, snap.throttle),
          forcedInduction: 'turbo_twin',
          boostPressureBar: snap.boostPressureBar,
        });
      }

      // Exhaust backfire crackles & fireballs
      if (snap.backfireIntensity > 0.45) {
        apexAudio.triggerExhaustPop(snap.backfireIntensity > 0.8 ? 'flame_spit' : 'heavy');
      }

      // Turbo blow-off valve atmospheric dump
      if (snap.bovFlutterIntensity > 0.45) {
        apexAudio.triggerBlowOffValve(snap.boostPressureBar);
      }
    } else if (prevStateRef.current !== 'OFF' && snap.state === 'OFF') {
      apexAudio.stopEngineAudioGraph();
    }
    prevStateRef.current = snap.state;
  });

  // User Actions
  const handleToggleEngine = useCallback(() => {
    if (simRef.current.getSnapshot().state === 'OFF') {
      apexAudio.initAudioContext();
    }
    simRef.current.toggleEngine();
  }, []);

  const handleRevBurst = useCallback(() => {
    simRef.current.revBurst(7500, 0.5);
  }, []);

  const handleSetTargetRpm = useCallback((target: number) => {
    simRef.current.setTargetRpm(target);
  }, []);

  const handleSetThrottle = useCallback((th: number) => {
    simRef.current.setThrottle(th);
  }, []);

  const handleSetTimeScale = useCallback((scale: number) => {
    simRef.current.setTimeScale(scale);
    setSlowMotionScale(scale);
  }, [setSlowMotionScale]);

  const handleToggleAudio = useCallback(() => {
    const muted = apexAudio.toggleMute();
    setIsAudioMuted(muted);
  }, []);

  const handleShiftUp = useCallback(() => {
    simRef.current.shiftUp();
  }, []);

  const handleShiftDown = useCallback(() => {
    simRef.current.shiftDown();
  }, []);

  const handleSetGear = useCallback((gear: number) => {
    simRef.current.setGear(gear);
  }, []);

  const engineRotation = useEngine3DStore((s) => s.engineRotation);
  const instances = useEngine3DStore((s) => s.instances);
  const isAssemblyComplete = useEngine3DStore((s) => s.isAssemblyComplete);
  const instanceCount = Object.keys(instances).length;
  const isShowcase = instanceCount === 0 || isAssemblyComplete || (snapshot !== null && snapshot.state !== 'OFF');

  return (
    <>
      {/* Authentic V12 Racing Engine GLB with Direct Node Kinematics */}
      {isShowcase && (
        <group
          name="Engine_Runtime_Motion_Master"
          rotation={engineRotation}
          position={[0, -0.08, 0]}
        >
          <primitive object={engineModel} name="V12_Racing_Engine_Live" />
        </group>
      )}

      {/* 12-Cylinder Firing Order Matrix & Phase Indicator HUD */}
      <FiringOrderHud cylinderStates={cylinderStates} snapshot={snapshot} />

      {/* Floating Subsystem Anatomy Callouts */}
      <AnatomyOverlay active={anatomyMode} />

      {/* Interactive Runtime Cockpit Telemetry, Multi-Mode, & Workbench Controls */}
      <RuntimeControlOverlay
        snapshot={snapshot}
        onToggleEngine={handleToggleEngine}
        onRevBurst={handleRevBurst}
        onSetTargetRpm={handleSetTargetRpm}
        onSetThrottle={handleSetThrottle}
        onSetTimeScale={handleSetTimeScale}
        cutawayMode={cutawayMode}
        onToggleCutaway={toggleCutawayMode}
        explodedFactor={explodedAmount}
        onSetExploded={setExplodedAmount}
        onShiftUp={handleShiftUp}
        onShiftDown={handleShiftDown}
        onSetGear={handleSetGear}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        isAutoRotate360={isAutoRotate360}
        anatomyMode={anatomyMode}
        componentSwaps={componentSwaps}
        onSetComponentSwap={setComponentSwap}
        netHpDelta={netHpDelta}
        netWeightDelta={netWeightDelta}
      />
    </>
  );
};

export default EngineRuntimeMotion;
