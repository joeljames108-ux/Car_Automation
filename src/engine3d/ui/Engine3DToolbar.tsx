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
import { Camera, Sun, Layers, Eye } from 'lucide-react';

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

  const presetsList = Object.values(CAMERA_PRESET_DEFINITIONS);
  const lightingList = Object.values(LIGHTING_PRESET_CONFIGS);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-base-950/60 border border-white/10 backdrop-blur-md text-slate-200 text-xs shadow-md ${
        isFloating
          ? 'absolute top-3 left-1/2 -translate-x-1/2 z-20 max-w-[95vw]'
          : 'w-full mt-2.5'
      } ${className}`}
    >
      {/* Left: Camera & Lighting Presets */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Camera Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-900/80 border border-slate-800">
          <Camera size={12} className="text-cyan-400" />
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Cam:</span>
          <select
            value={cameraPreset}
            onChange={(e) => setCameraPreset(e.target.value as CameraPreset3D)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
          >
            {presetsList.map((preset) => (
              <option key={preset.id} value={preset.id} className="bg-slate-900 text-slate-200">
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        {/* Lighting Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-base-900/80 border border-slate-800">
          <Sun size={12} className="text-amber-400" />
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Light:</span>
          <select
            value={lightingPreset}
            onChange={(e) => setLightingPreset(e.target.value as LightingPreset)}
            className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
          >
            {lightingList.map((light) => (
              <option key={light.id} value={light.id} className="bg-slate-900 text-slate-200">
                {light.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Diagnostic Toggles */}
      <div className="flex items-center gap-1 bg-base-900/80 border border-slate-800 p-0.5 rounded-lg">
        <button
          type="button"
          onClick={toggleWireframe}
          title="Toggle Wireframe Mode"
          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all font-bold ${
            showWireframe
              ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Wire
        </button>

        <button
          type="button"
          onClick={toggleAttachmentPoints}
          title="Toggle Attachment Sockets"
          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all font-bold ${
            showAttachmentPoints
              ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sockets
        </button>

        <button
          type="button"
          onClick={toggleLabels}
          title="Toggle Diagnostic Labels"
          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all font-bold ${
            showLabels
              ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Labels
        </button>

        <button
          type="button"
          onClick={toggleDependencies}
          title="Toggle Dependency Lines"
          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all font-bold ${
            showDependencies
              ? 'bg-purple-500/25 text-purple-200 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Deps
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
