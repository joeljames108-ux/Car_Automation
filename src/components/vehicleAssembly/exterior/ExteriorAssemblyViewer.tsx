// ===================================================================
// EXTERIOR VEHICLE ASSEMBLY MASTER VIEWER
// ===================================================================
// Interactive CAD workstation viewport embedding the SVG canvas,
// real-time assembly progress, exploded view slider, and view mode switcher.
// ===================================================================

import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  Zap,
  Box,
  RotateCcw,
  Sliders,
  Volume2,
  VolumeX,
  Eye,
  Camera,
  Shield,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";
import { EXTERIOR_PRESET_LIBRARY } from "../../../state/exteriorAssemblyPresets";
import { EXTERIOR_ASSEMBLY_REGISTRY } from "../../../sim/exteriorAssemblyTypes";
import { useExteriorInstallAnimation } from "../../../state/exteriorAssemblyHooks";
import { ExteriorSVGCanvas } from "./ExteriorSVGCanvas";
import { playAssemblySound, toggleAssemblyMute } from "../../assembly/sounds";

interface ExteriorAssemblyViewerProps {
  className?: string;
  onSelectComponent2D?: (id: string | null) => void;
}

export const ExteriorAssemblyViewer: React.FC<ExteriorAssemblyViewerProps> = ({
  className = "w-full h-full",
  onSelectComponent2D,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  const installedComponents = useExteriorAssemblyStore((s) => s.installedComponents);
  const activeComponentId = useExteriorAssemblyStore((s) => s.activeComponentId);
  const phase = useExteriorAssemblyStore((s) => s.phase);
  const hoveredComponentId = useExteriorAssemblyStore((s) => s.hoveredComponentId);
  const selectedComponentId = useExteriorAssemblyStore((s) => s.selectedComponentId);
  const selectedVariants = useExteriorAssemblyStore((s) => s.selectedVariants);
  const isExplodedView = useExteriorAssemblyStore((s) => s.isExplodedView);
  const explodedAmount = useExteriorAssemblyStore((s) => s.explodedAmount);
  const viewMode = useExteriorAssemblyStore((s) => s.viewMode);
  const isAssemblyComplete = useExteriorAssemblyStore((s) => s.isAssemblyComplete);

  const exteriorConfig = useExteriorAssemblyStore((s) => s.exteriorConfig);
  const paintConfig = useExteriorAssemblyStore((s) => s.paintConfig);
  const aeroConfig = useExteriorAssemblyStore((s) => s.aeroConfig);
  const lightingConfig = useExteriorAssemblyStore((s) => s.lightingConfig);
  const glassConfig = useExteriorAssemblyStore((s) => s.glassConfig);
  const wheelConfig = useExteriorAssemblyStore((s) => s.wheelConfig);
  const tireConfig = useExteriorAssemblyStore((s) => s.tireConfig);
  const brakeConfig = useExteriorAssemblyStore((s) => s.brakeConfig);

  const advancePhase = useExteriorAssemblyStore((s) => s.advancePhase);
  const completeInstall = useExteriorAssemblyStore((s) => s.completeInstall);
  const selectComponent = useExteriorAssemblyStore((s) => s.selectComponent);
  const setHoveredComponentId = useExteriorAssemblyStore((s) => s.setHoveredComponentId);
  const setExplodedView = useExteriorAssemblyStore((s) => s.setExplodedView);
  const setExplodedAmount = useExteriorAssemblyStore((s) => s.setExplodedAmount);
  const setViewMode = useExteriorAssemblyStore((s) => s.setViewMode);
  const loadPreset = useExteriorAssemblyStore((s) => s.loadPreset);
  const resetAssembly = useExteriorAssemblyStore((s) => s.resetAssembly);

  const buildProgress = useExteriorAssemblyStore((s) => s.getBuildProgress());
  const totalWeight = useExteriorAssemblyStore((s) => s.getTotalExteriorWeight());
  const totalCost = useExteriorAssemblyStore((s) => s.getTotalExteriorCost());
  const totalRigidity = useExteriorAssemblyStore((s) => s.getTotalTorsionalRigidityKNm());

  // ── Auto Phase Animation Pipeline Hook ──
  useExteriorInstallAnimation({
    activeComponentId,
    phase,
    onAdvancePhase: advancePhase,
    onCompleteInstall: () => {
      completeInstall();
      playAssemblySound("click");
    },
    onPlaySound: (snd) => playAssemblySound(snd),
  });

  const handleToggleMute = () => {
    const m = toggleAssemblyMute();
    setIsMuted(m);
  };

  const activeMeta = EXTERIOR_ASSEMBLY_REGISTRY.find((c) => c.id === activeComponentId);
  const selectedMeta = EXTERIOR_ASSEMBLY_REGISTRY.find((c) => c.id === selectedComponentId);

  return (
    <div
      className={`relative w-full h-full min-h-[550px] rounded-3xl bg-slate-950/95 border border-cyan-500/30 backdrop-blur-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 ${className}`}
    >
      {/* Dynamic Background Ambient Light Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.08),transparent_65%)] pointer-events-none" />

      {/* ── TOP HUD TOOLBAR ── */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-white/10 p-2.5 rounded-2xl backdrop-blur-md shadow-lg">
        {/* Left: View Mode Toggle & Preset Quick Select */}
        <div className="flex items-center gap-2">
          {/* 2D / 3D Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("2d_iso")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                viewMode === "2d_iso"
                  ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              2D ISO
            </button>
            <button
              onClick={() => setViewMode("3d_webgl")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "3d_webgl"
                  ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Box size={13} />
              <span>3D GLB</span>
            </button>
          </div>

          {/* Preset Selector Dropdown */}
          <select
            onChange={(e) => loadPreset(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>
              ⚡ Load Preset Pack...
            </option>
            {EXTERIOR_PRESET_LIBRARY.map((p) => (
              <option key={p.id} value={p.id}>
                {p.badge} — {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Exploded Slider & Workstation Audio Controls */}
        <div className="flex items-center gap-3">
          {/* Exploded View Continuous Slider */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-xl border border-white/10">
            <Layers size={13} className={isExplodedView ? "text-cyan-400" : "text-slate-500"} />
            <span className="text-[11px] font-mono text-slate-300">Explode:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={explodedAmount}
              onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
              className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[10px] font-mono text-cyan-300 w-8">{Math.round(explodedAmount * 100)}%</span>
          </div>

          {/* Reset Assembly Button */}
          <button
            onClick={resetAssembly}
            title="Reset to Bare Chassis Frame"
            className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-white/10 rounded-xl text-slate-400 hover:text-rose-400 transition-colors"
          >
            <RotateCcw size={14} />
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-white/10 rounded-xl text-slate-400 hover:text-cyan-300 transition-colors"
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── CENTRAL VIEWPORT CANVAS ── */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-2">
        <ExteriorSVGCanvas
          installedComponents={installedComponents}
          activeComponentId={activeComponentId}
          phase={phase}
          hoveredComponentId={hoveredComponentId}
          selectedComponentId={selectedComponentId}
          selectedVariants={selectedVariants}
          isExplodedView={isExplodedView}
          explodedAmount={explodedAmount}
          exteriorConfig={exteriorConfig}
          paintConfig={paintConfig}
          aeroConfig={aeroConfig}
          lightingConfig={lightingConfig}
          glassConfig={glassConfig}
          wheelConfig={wheelConfig}
          tireConfig={tireConfig}
          brakeConfig={brakeConfig}
          onSelectComponent={(id) => {
            selectComponent(id);
            if (onSelectComponent2D) onSelectComponent2D(id);
          }}
          onHoverComponent={setHoveredComponentId}
        />
      </div>

      {/* ── BOTTOM STATS BAR & ENGINEERING ADVICE HUD ── */}
      <div className="relative z-30 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-white/10 p-3 rounded-2xl backdrop-blur-md shadow-lg">
        {/* Left: Build Completion Metric */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className={isAssemblyComplete ? "text-emerald-400" : "text-cyan-400"} />
            <span className="text-xs font-mono font-extrabold text-slate-200">
              BUILD: {buildProgress}%
            </span>
          </div>
          <div className="w-28 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${buildProgress}%` }}
            />
          </div>
        </div>

        {/* Center: Live Engineering Metrics */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-slate-300">
            <span className="text-slate-500">Weight:</span>{" "}
            <strong className="text-cyan-400 font-bold">{Math.round(totalWeight)} kg</strong>
          </div>
          <div className="text-slate-300">
            <span className="text-slate-500">Rigidity:</span>{" "}
            <strong className="text-emerald-400 font-bold">{totalRigidity} kNm/deg</strong>
          </div>
          <div className="text-slate-300">
            <span className="text-slate-500">Cost:</span>{" "}
            <strong className="text-amber-400 font-bold">${Math.round(totalCost).toLocaleString()}</strong>
          </div>
        </div>

        {/* Right: Selected Component Detail Badge */}
        {selectedMeta && (
          <div className="text-[11px] font-mono text-slate-400 max-w-xs truncate">
            <span className="text-cyan-300 font-bold">{selectedMeta.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
