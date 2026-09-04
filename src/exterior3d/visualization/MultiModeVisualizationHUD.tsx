// ============================================================================
// MULTI-MODE 3D VISUALIZATION HUD & CONTROLS OVERLAY
// ============================================================================
// Professional automotive engineering HUD providing seamless interactive
// control over /360, /exploded, /anatomy, and /cutaway modes with combinable
// toggles, flow path filters, clipping depth, camera presets, and callouts.
// ============================================================================

import React, { useState } from 'react';
import {
  RotateCcw,
  Layers,
  Scissors,
  Eye,
  Activity,
  Play,
  Pause,
  Compass,
  Maximize2,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Sliders,
  Wind,
  Droplets,
  Flame,
  Zap,
} from 'lucide-react';
import {
  SUBSYSTEM_CAPABILITIES,
  SubsystemCapability,
  ComponentAnatomyPart,
  VisualizationMode,
} from './multimodeCapabilities';
import { CutawayAxis, CutawayConfig } from './CutawayClippingManager';
import { ActiveFlowConfig } from './FlowVisualizationSystem';

export interface MultiModeState {
  is360: boolean;
  isExploded: boolean;
  isAnatomy: boolean;
  isCutaway: boolean;
  isXRay: boolean;
  activeSubsystemId: string;
  explodedProgress: number; // 0 to 1
  isAutoPlayingExplosion: boolean;
  cutawayConfig: CutawayConfig;
  flowConfig: ActiveFlowConfig;
  selectedPart: ComponentAnatomyPart | null;
  isolatedPartName: string | null;
  autoSpin: boolean;
  autoSpinSpeed: number;
}

interface MultiModeVisualizationHUDProps {
  state: MultiModeState;
  onUpdateState: (updates: Partial<MultiModeState>) => void;
  onCameraPreset: (presetName: string) => void;
  onResetAll: () => void;
}

export const MultiModeVisualizationHUD: React.FC<MultiModeVisualizationHUDProps> = ({
  state,
  onUpdateState,
  onCameraPreset,
  onResetAll,
}) => {
  const [showAnatomyDrawer, setShowAnatomyDrawer] = useState(true);
  const [showSubsystemDropdown, setShowSubsystemDropdown] = useState(false);

  const activeSubsystem: SubsystemCapability =
    SUBSYSTEM_CAPABILITIES[state.activeSubsystemId] || SUBSYSTEM_CAPABILITIES.engine;

  // Active combined modes badge
  const activeModesCount = [
    state.is360,
    state.isExploded,
    state.isAnatomy,
    state.isCutaway,
    state.isXRay,
  ].filter(Boolean).length;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20 select-none overflow-hidden">
      {/* ── TOP BAR: MODE SELECTOR & SUBSYSTEM SWITCHER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Subsystem Selector Button */}
        <div className="relative">
          <button
            onClick={() => setShowSubsystemDropdown(!showSubsystemDropdown)}
            className="flex items-center gap-2.5 px-4 py-2 rounded-xl backdrop-blur-md bg-slate-900/90 border border-amber-500/40 text-amber-300 hover:bg-slate-800/90 transition-all shadow-lg"
          >
            <span className="text-lg">{activeSubsystem.icon}</span>
            <span className="text-xs font-bold tracking-wide uppercase">{activeSubsystem.name}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showSubsystemDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showSubsystemDropdown && (
            <div className="absolute top-full left-0 mt-2 w-72 rounded-xl backdrop-blur-xl bg-slate-950/95 border border-amber-500/30 shadow-2xl p-1.5 space-y-1 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-bold text-amber-400/60 uppercase tracking-wider">
                Select Subassembly Focus
              </div>
              {Object.values(SUBSYSTEM_CAPABILITIES).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    onUpdateState({
                      activeSubsystemId: sub.id,
                      selectedPart: sub.anatomy.parts[0] || null,
                      isolatedPartName: null,
                    });
                    setShowSubsystemDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                    sub.id === state.activeSubsystemId
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-base">{sub.icon}</span>
                  <div className="flex-1 truncate">
                    <div>{sub.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{sub.category}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── CORE 5-MODE COMBINABLE BUTTON BAR ── */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl backdrop-blur-xl bg-slate-950/85 border border-slate-700/60 shadow-2xl">
          {/* Mode 1: 360° Inspection */}
          <button
            onClick={() => onUpdateState({ is360: !state.is360 })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              state.is360
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>/360</span>
          </button>

          {/* Mode 2: Exploded View */}
          <button
            onClick={() => onUpdateState({ isExploded: !state.isExploded })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              state.isExploded
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>/exploded</span>
          </button>

          {/* Mode 3: Anatomy & Engineering */}
          <button
            onClick={() => onUpdateState({ isAnatomy: !state.isAnatomy })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              state.isAnatomy
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>/anatomy</span>
          </button>

          {/* Mode 4: Cutaway Section */}
          <button
            onClick={() =>
              onUpdateState({
                isCutaway: !state.isCutaway,
                cutawayConfig: { ...state.cutawayConfig, enabled: !state.isCutaway },
              })
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              state.isCutaway
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>/cutaway</span>
          </button>

          {/* Mode 5: X-Ray Wireframe */}
          <button
            onClick={() => onUpdateState({ isXRay: !state.isXRay })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              state.isXRay
                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-slate-950 shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>/xray</span>
          </button>
        </div>

        {/* Combined Badge & Reset */}
        <div className="flex items-center gap-2">
          {activeModesCount > 1 && (
            <div className="px-2.5 py-1 rounded-lg backdrop-blur-md bg-amber-500/20 border border-amber-500/40 text-[11px] font-bold text-amber-300">
              ⚡ {activeModesCount} MODES ACTIVE
            </div>
          )}
          <button
            onClick={onResetAll}
            title="Reset All Visualization Modes"
            className="p-2 rounded-xl backdrop-blur-md bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── MIDDLE DRAWER: ANATOMY SPECIFICATIONS & "WHY DOES THIS PART EXIST?" ── */}
      {state.isAnatomy && (
        <div className="self-end max-w-md w-full my-auto pointer-events-auto transition-all duration-300">
          <div className="rounded-2xl backdrop-blur-xl bg-slate-950/90 border border-cyan-500/30 p-4 shadow-2xl text-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  ENGINEERING ANATOMY
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                  {activeSubsystem.category}
                </span>
              </div>
              <button
                onClick={() => setShowAnatomyDrawer(!showAnatomyDrawer)}
                className="text-slate-400 hover:text-cyan-300"
              >
                {showAnatomyDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showAnatomyDrawer && (
              <>
                <p className="text-xs text-slate-300 leading-relaxed">{activeSubsystem.anatomy.summary}</p>

                {/* Technical Specifications Matrix */}
                <div className="grid grid-cols-2 gap-2 bg-slate-900/70 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                  {activeSubsystem.anatomy.specs.map((s, idx) => (
                    <div key={idx} className="flex flex-col">
                      <span className="text-slate-400 text-[9px] uppercase font-semibold">{s.label}</span>
                      <span className="text-cyan-300 font-mono font-bold">{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* "Why does this part exist?" Callout Card */}
                {state.selectedPart ? (
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-200">{state.selectedPart.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-900/80 text-cyan-300">
                        {state.selectedPart.material}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{state.selectedPart.description}</div>
                    <div className="pt-1 text-[11px] text-amber-300/90 font-medium">
                      <span className="font-bold text-amber-400">Why this exists: </span>
                      {state.selectedPart.whyItExists}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 text-xs text-slate-400 italic">
                    Click any 3D part or select from list below to inspect engineering rationale
                  </div>
                )}

                {/* Subsystem Part Selector Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeSubsystem.anatomy.parts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => onUpdateState({ selectedPart: p })}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                        state.selectedPart?.name === p.name
                          ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                          : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* Flow Pathways Filter Toggles */}
                <div className="border-t border-cyan-500/20 pt-2 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Animated Flow Streamlines
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: 'coolant', label: 'Coolant', color: '#06b6d4' },
                      { key: 'oil', label: 'Oil', color: '#f59e0b' },
                      { key: 'air', label: 'Air Intake', color: '#38bdf8' },
                      { key: 'fuel', label: 'Fuel Injection', color: '#22c55e' },
                      { key: 'exhaust', label: 'Exhaust', color: '#ef4444' },
                      { key: 'power', label: 'Power Torque', color: '#d946ef' },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() =>
                          onUpdateState({
                            flowConfig: {
                              ...state.flowConfig,
                              [f.key]: !state.flowConfig[f.key as keyof ActiveFlowConfig],
                            },
                          })
                        }
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                        style={{
                          background: state.flowConfig[f.key as keyof ActiveFlowConfig]
                            ? `${f.color}25`
                            : 'rgba(15,23,42,0.6)',
                          color: state.flowConfig[f.key as keyof ActiveFlowConfig] ? f.color : '#64748b',
                          border: `1px solid ${
                            state.flowConfig[f.key as keyof ActiveFlowConfig] ? `${f.color}60` : 'transparent'
                          }`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: state.flowConfig[f.key as keyof ActiveFlowConfig] ? f.color : '#64748b',
                          }}
                        />
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── BOTTOM CONTROL TOOLBARS (EXPLODED / CUTAWAY / 360 PRESETS) ── */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pointer-events-auto">
        {/* ── LEFT: 360 CAMERA PRESETS ── */}
        {state.is360 && (
          <div className="flex items-center gap-1.5 p-2 rounded-2xl backdrop-blur-xl bg-slate-950/90 border border-amber-500/30 shadow-2xl">
            <button
              onClick={() => onUpdateState({ autoSpin: !state.autoSpin })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                state.autoSpin
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${state.autoSpin ? 'animate-spin' : ''}`} />
              <span>{state.autoSpin ? 'Auto-Spin ON' : 'Auto-Spin'}</span>
            </button>

            {activeSubsystem.cameraPresets.map((cam, idx) => (
              <button
                key={idx}
                onClick={() => onCameraPreset(cam.name)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-colors"
              >
                {cam.name}
              </button>
            ))}
          </div>
        )}

        {/* ── CENTER: EXPLODED SLIDER & AUTOMATION ── */}
        {state.isExploded && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-xl bg-slate-950/90 border border-orange-500/30 shadow-2xl">
            <button
              onClick={() => onUpdateState({ isAutoPlayingExplosion: !state.isAutoPlayingExplosion })}
              className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
              title={state.isAutoPlayingExplosion ? 'Pause Assembly Animation' : 'Auto-Play Assembly Animation'}
            >
              {state.isAutoPlayingExplosion ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
              Disassembly
            </span>

            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={state.explodedProgress}
              onChange={(e) =>
                onUpdateState({
                  explodedProgress: parseFloat(e.target.value),
                  isAutoPlayingExplosion: false,
                })
              }
              className="w-36 sm:w-48 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />

            <span className="text-xs font-mono font-bold text-orange-300 min-w-[36px] text-right">
              {Math.round(state.explodedProgress * 100)}%
            </span>
          </div>
        )}

        {/* ── RIGHT: CUTAWAY PLANE SLIDER & AXES ── */}
        {state.isCutaway && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-xl bg-slate-950/90 border border-emerald-500/30 shadow-2xl">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Cutaway
            </span>

            {/* Axis Switcher */}
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              {(['X', 'Y', 'Z'] as CutawayAxis[]).map((axis) => (
                <button
                  key={axis}
                  onClick={() =>
                    onUpdateState({
                      cutawayConfig: { ...state.cutawayConfig, axis },
                    })
                  }
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                    state.cutawayConfig.axis === axis
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {axis}
                </button>
              ))}
            </div>

            {/* Depth Slider */}
            <input
              type="range"
              min={-1}
              max={1}
              step={0.02}
              value={state.cutawayConfig.depth}
              onChange={(e) =>
                onUpdateState({
                  cutawayConfig: {
                    ...state.cutawayConfig,
                    depth: parseFloat(e.target.value),
                  },
                })
              }
              className="w-28 sm:w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            {/* Invert Button */}
            <button
              onClick={() =>
                onUpdateState({
                  cutawayConfig: {
                    ...state.cutawayConfig,
                    invert: !state.cutawayConfig.invert,
                  },
                })
              }
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                state.cutawayConfig.invert
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Invert
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
