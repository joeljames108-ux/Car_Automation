// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — 3D VIEWPORT TOOLBAR HUD
// ============================================================================
// Clean glassmorphic toolbar strip providing camera presets, lighting modes,
// diagnostic toggles, and continuous exploded view slider.
// ============================================================================

import React from 'react';
import { useEngine3DStore } from '../store/useEngine3DStore';
import { CAMERA_PRESET_DEFINITIONS } from '../camera/cameraPresets';
import { LIGHTING_PRESET_CONFIGS } from '../lighting/lightingPresets';
import { ExplodedViewSlider } from './ExplodedViewSlider';
import type { CameraPreset3D, LightingPreset } from '../types';
import { Camera, Sun, Layers, Eye, RotateCw, RotateCcw } from 'lucide-react';

export interface Engine3DToolbarProps {
  className?: string;
  isFloating?: boolean;
}

export const Engine3DToolbar: React.FC<Engine3DToolbarProps> = ({
  className = '',
  isFloating = false,
}) => {
  const cameraPreset = useEngine3DStore((s) => s.cameraPreset);
  const setCameraPreset = useEngine3DStore((s) => s.setCameraPreset);
  const lightingPreset = useEngine3DStore((s) => s.lightingPreset);
  const setLightingPreset = useEngine3DStore((s) => s.setLightingPreset);
  const showWireframe = useEngine3DStore((s) => s.showWireframe);
  const toggleWireframe = useEngine3DStore((s) => s.toggleWireframe);
  const showAttachmentPoints = useEngine3DStore((s) => s.showAttachmentPoints);
  const toggleAttachmentPoints = useEngine3DStore((s) => s.toggleAttachmentPoints);
  const showLabels = useEngine3DStore((s) => s.showLabels);
  const toggleLabels = useEngine3DStore((s) => s.toggleLabels);
  const showDependencies = useEngine3DStore((s) => s.showDependencies);
  const toggleDependencies = useEngine3DStore((s) => s.toggleDependencies);
  const rotateEngine90 = useEngine3DStore((s) => s.rotateEngine90);
  const resetEngineRotation = useEngine3DStore((s) => s.resetEngineRotation);

  const presetsList = Object.values(CAMERA_PRESET_DEFINITIONS);
  const lightingList = Object.values(LIGHTING_PRESET_CONFIGS);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/10 text-xs shadow-xl text-slate-200 ${
        isFloating
          ? 'absolute top-3 left-1/2 -translate-x-1/2 z-20 max-w-[95vw]'
          : 'w-full'
      } ${className}`}
    >
      {/* Left: Camera & Lighting Presets */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Camera Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/10">
          <Camera size={12} className="text-amber-400" />
          <span className="text-[10px] font-mono uppercase font-bold text-amber-400">Cam:</span>
          <select
            value={cameraPreset}
            onChange={(e) => setCameraPreset(e.target.value as CameraPreset3D)}
            className="bg-transparent text-xs focus:outline-none cursor-pointer font-medium text-slate-200"
          >
            {presetsList.map((preset) => (
              <option key={preset.id} value={preset.id} className="bg-slate-900 text-slate-100">
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        {/* Lighting Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/10">
          <Sun size={12} className="text-amber-400" />
          <span className="text-[10px] font-mono uppercase font-bold text-amber-400">Light:</span>
          <select
            value={lightingPreset}
            onChange={(e) => setLightingPreset(e.target.value as LightingPreset)}
            className="bg-transparent text-xs focus:outline-none cursor-pointer font-medium text-slate-200"
          >
            {lightingList.map((light) => (
              <option key={light.id} value={light.id} className="bg-slate-900 text-slate-100">
                {light.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Diagnostic Toggles */}
      <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-950/80 border border-white/10">
        <button
          type="button"
          onClick={toggleWireframe}
          title="Toggle Wireframe Mode"
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all font-bold cursor-pointer ${
            showWireframe
              ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Wire
        </button>

        <button
          type="button"
          onClick={toggleAttachmentPoints}
          title="Toggle Attachment Sockets"
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all font-bold cursor-pointer ${
            showAttachmentPoints
              ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sockets
        </button>

        <button
          type="button"
          onClick={toggleLabels}
          title="Toggle Diagnostic Labels"
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all font-bold cursor-pointer ${
            showLabels
              ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Labels
        </button>

        <button
          type="button"
          onClick={toggleDependencies}
          title="Toggle Dependency Lines"
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all font-bold cursor-pointer ${
            showDependencies
              ? 'bg-amber-500/25 text-amber-200 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Deps
        </button>
      </div>

      {/* Axis Rotation Quick Actions */}
      <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-950/80 border border-white/10">
        <button
          type="button"
          onClick={() => rotateEngine90('x', 1)}
          title="Rotate 90° Z-to-Y (Pitch)"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono text-amber-300 hover:bg-amber-500/20 transition-all font-bold cursor-pointer"
        >
          <RotateCw size={11} className="text-amber-400" />
          <span>Z→Y 90°</span>
        </button>

        <button
          type="button"
          onClick={() => rotateEngine90('y', 1)}
          title="Rotate 90° around Y (Yaw)"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono text-slate-300 hover:bg-white/10 transition-all font-bold cursor-pointer"
        >
          <RotateCw size={11} className="text-slate-400" />
          <span>Yaw 90°</span>
        </button>

        <button
          type="button"
          onClick={() => rotateEngine90('z', 1)}
          title="Rotate 90° around Z (Roll)"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono text-slate-300 hover:bg-white/10 transition-all font-bold cursor-pointer"
        >
          <RotateCw size={11} className="text-slate-400" />
          <span>Roll 90°</span>
        </button>

        <button
          type="button"
          onClick={resetEngineRotation}
          title="Reset Engine Orientation"
          className="p-1 rounded-lg text-[10px] font-mono text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all cursor-pointer"
        >
          <RotateCcw size={11} />
        </button>
      </div>

      {/* Right: Exploded View Slider */}
      <div className="flex items-center">
        <ExplodedViewSlider />
      </div>
    </div>
  );
};

export default Engine3DToolbar;
