// ============================================================================
// GETLAYERS.AI — INTERACTIVE CINEMATIC STUDIO & LAYER INSPECTOR HUD
// ============================================================================
// Floating luxury glass dock inspired directly by GetLayers.ai:
// - Live WebGL Gradients (Strigil, Pharos, Laminar, Komorebi, Antipode, etc.)
// - 3D Scene Moods (Argent Massif, Epoxy Drift, Pinwheel Galaxy, Aurum Peak, etc.)
// - Subsystem Layer Management (Visibility, Solo, Opacity)
// - One-Prompt AI Workflow (Instant Copy Prompt for Cursor / Claude / ChatGPT)
// - Cinematic Post-Processing Controls (Bloom, Exposure, Fog, Vignette)
// ============================================================================

import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Camera,
  Sun,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  Sliders,
  Maximize2,
  Minimize2,
  X,
  Palette,
  Terminal,
} from 'lucide-react';
import {
  GETLAYERS_GRADIENTS,
  GetLayersGradientId,
} from './GetLayersGradientShader';
import {
  GETLAYERS_SCENE_PRESETS,
  GetLayers3DSceneId,
} from './GetLayers3DScenePresets';
import {
  GETLAYERS_PROMPT_TEMPLATES,
  GetLayersPromptEngine,
  GetLayersPromptTemplate,
} from './GetLayersPromptEngine';

export interface LayerItem {
  id: string;
  name: string;
  category: string;
  visible: boolean;
  meshCount: number;
}

interface GetLayersStudioPanelProps {
  activeGradient: GetLayersGradientId;
  onSelectGradient: (id: GetLayersGradientId) => void;
  activeScenePreset: GetLayers3DSceneId;
  onSelectScenePreset: (id: GetLayers3DSceneId) => void;
  layers: LayerItem[];
  onToggleLayer: (id: string) => void;
  onSoloLayer?: (id: string) => void;
  bloomStrength: number;
  onChangeBloom: (val: number) => void;
  fogDensity: number;
  onChangeFog: (val: number) => void;
  exposure: number;
  onChangeExposure: (val: number) => void;
  currentColorName?: string;
  currentWheelFinish?: string;
  activeModes?: string[];
}

type TabType = 'gradients' | 'scenes' | 'layers' | 'prompts' | 'fx';

export const GetLayersStudioPanel: React.FC<GetLayersStudioPanelProps> = ({
  activeGradient,
  onSelectGradient,
  activeScenePreset,
  onSelectScenePreset,
  layers,
  onToggleLayer,
  onSoloLayer,
  bloomStrength,
  onChangeBloom,
  fogDensity,
  onChangeFog,
  exposure,
  onChangeExposure,
  currentColorName = 'Apex Blue',
  currentWheelFinish = 'Satin Bronze',
  activeModes = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('gradients');
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);
  const [copiedLivePrompt, setCopiedLivePrompt] = useState(false);

  const handleCopyPrompt = (template: GetLayersPromptTemplate) => {
    navigator.clipboard.writeText(template.prompt);
    setCopiedTemplateId(template.id);
    setTimeout(() => setCopiedTemplateId(null), 2000);
  };

  const handleCopyLivePrompt = () => {
    const livePrompt = GetLayersPromptEngine.generateLivePrompt({
      paintColor: currentColorName,
      gradientName: GETLAYERS_GRADIENTS[activeGradient]?.name || activeGradient,
      scenePresetName: GETLAYERS_SCENE_PRESETS[activeScenePreset]?.name || activeScenePreset,
      activeModes,
      visibleLayers: layers.filter((l) => l.visible).map((l) => l.name),
      wheelFinish: currentWheelFinish,
    });
    navigator.clipboard.writeText(livePrompt);
    setCopiedLivePrompt(true);
    setTimeout(() => setCopiedLivePrompt(false), 2000);
  };

  const handleDownloadSpec = () => {
    const json = GetLayersPromptEngine.generateLayerSpecJson({
      gradient: activeGradient,
      scenePreset: activeScenePreset,
      bloomStrength,
      fogDensity,
      exposure,
      layers: layers.map((l) => ({ id: l.id, name: l.name, visible: l.visible })),
      activeModes,
      paintColor: currentColorName,
      wheelFinish: currentWheelFinish,
    });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `getlayers-car-spec-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute top-4 left-4 z-30 font-sans pointer-events-auto">
      {/* Floating Pill Launch Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-white/10 hover:border-cyan-500/50 shadow-2xl backdrop-blur-xl transition-all duration-200 group text-xs font-semibold text-slate-200"
          title="Open GetLayers.ai Studio"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 animate-pulse shadow-sm shadow-cyan-500/50" />
          <span className="tracking-wide">GetLayers.ai</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
            {GETLAYERS_GRADIENTS[activeGradient]?.name}
          </span>
          <Layers className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        </button>
      )}

      {/* Expanded Cinematic Studio Panel */}
      {isOpen && (
        <div className="w-[420px] max-h-[82vh] flex flex-col rounded-2xl bg-slate-950/92 border border-white/15 shadow-2xl backdrop-blur-2xl text-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-sm shadow-cyan-500/50" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  GetLayers.ai Studio
                </h3>
                <p className="text-[10px] text-slate-400">
                  AI-Native Cinematic 3D & Procedural Gradients
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-white/10 bg-black/40 px-2 py-1.5 gap-1">
            {[
              { id: 'gradients', label: 'Gradients', icon: Palette },
              { id: 'scenes', label: '3D Scenes', icon: Sun },
              { id: 'layers', label: 'Layers', icon: Layers },
              { id: 'prompts', label: 'One-Prompt', icon: Terminal },
              { id: 'fx', label: 'Post-FX', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm border border-white/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Body */}
          <div className="p-3.5 overflow-y-auto space-y-3 flex-1 scrollbar-thin scrollbar-thumb-white/10">
            {/* TAB 1: WebGL GRADIENTS */}
            {activeTab === 'gradients' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>8 Signature WebGL Fluid Gradients</span>
                  <span className="text-cyan-400 font-mono">Live GPU Shaders</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(GETLAYERS_GRADIENTS) as GetLayersGradientId[]).map((gid) => {
                    const g = GETLAYERS_GRADIENTS[gid];
                    const isSel = activeGradient === gid;
                    return (
                      <button
                        key={gid}
                        onClick={() => onSelectGradient(gid)}
                        className={`p-2.5 rounded-xl text-left border transition-all relative overflow-hidden group ${
                          isSel
                            ? 'border-cyan-400 bg-cyan-950/30 shadow-md shadow-cyan-500/20'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        {/* Gradient Preview Bar */}
                        <div
                          className="h-9 w-full rounded-lg mb-2 shadow-inner border border-white/10 transition-transform group-hover:scale-[1.02]"
                          style={{
                            background: `linear-gradient(135deg, ${g.color1} 0%, ${g.color2} 45%, ${g.color3} 80%, ${g.color4} 100%)`,
                          }}
                        />
                        <div className="text-xs font-semibold text-white flex items-center justify-between">
                          <span>{g.name}</span>
                          {isSel && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{g.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: 3D SCENE PRESETS */}
            {activeTab === 'scenes' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Cinematic Environment & Lighting</span>
                  <span className="text-indigo-400 font-mono">PBR Reflections</span>
                </div>
                <div className="space-y-2">
                  {(Object.keys(GETLAYERS_SCENE_PRESETS) as GetLayers3DSceneId[]).map((sid) => {
                    const scene = GETLAYERS_SCENE_PRESETS[sid];
                    const isSel = activeScenePreset === sid;
                    return (
                      <button
                        key={sid}
                        onClick={() => onSelectScenePreset(sid)}
                        className={`w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                          isSel
                            ? 'border-indigo-400 bg-indigo-950/30 shadow-md shadow-indigo-500/20'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center shadow-inner"
                            style={{ backgroundColor: scene.themeColor + '22' }}
                          >
                            <div
                              className="w-3.5 h-3.5 rounded-full"
                              style={{ backgroundColor: scene.themeColor }}
                            />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{scene.name}</div>
                            <div className="text-[10px] text-slate-400">{scene.subtitle}</div>
                          </div>
                        </div>
                        <div className="text-right text-[10px] text-slate-400 font-mono">
                          {scene.particleCount > 0 ? `${scene.particleCount} particles` : 'Clean studio'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CAD SUBSYSTEM LAYERS */}
            {activeTab === 'layers' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Automotive Subassembly Layers</span>
                  <span className="font-mono text-cyan-400">{layers.length} Layers</span>
                </div>
                <div className="space-y-1.5">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToggleLayer(layer.id)}
                          className={`p-1 rounded transition-colors ${
                            layer.visible ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <span className={layer.visible ? 'text-white' : 'text-slate-500 line-through'}>
                          {layer.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {layer.meshCount} meshes
                        </span>
                        {onSoloLayer && (
                          <button
                            onClick={() => onSoloLayer(layer.id)}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
                          >
                            Solo
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: ONE-PROMPT AI WORKFLOW */}
            {activeTab === 'prompts' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Live Scene AI Prompt</div>
                    <div className="text-[10px] text-slate-300">
                      Export active car, shaders & camera to AI assistants
                    </div>
                  </div>
                  <button
                    onClick={handleCopyLivePrompt}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-[11px] hover:bg-cyan-400 transition-colors shadow-md"
                  >
                    {copiedLivePrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLivePrompt ? 'Copied' : 'Copy Live'}</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Curated GetLayers Prompts
                </div>

                <div className="space-y-2">
                  {GETLAYERS_PROMPT_TEMPLATES.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{tpl.title}</span>
                        <button
                          onClick={() => handleCopyPrompt(tpl)}
                          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                        >
                          {copiedTemplateId === tpl.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedTemplateId === tpl.id ? 'Copied!' : 'Copy Prompt'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {tpl.prompt}
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tpl.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: POST-PROCESSING FX */}
            {activeTab === 'fx' && (
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Bloom Intensity</span>
                    <span className="font-mono text-cyan-400">{bloomStrength.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={bloomStrength}
                    onChange={(e) => onChangeBloom(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Atmospheric Fog Density</span>
                    <span className="font-mono text-cyan-400">{(fogDensity * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.10"
                    step="0.005"
                    value={fogDensity}
                    onChange={(e) => onChangeFog(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Tone Mapping Exposure</span>
                    <span className="font-mono text-cyan-400">{exposure.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={exposure}
                    onChange={(e) => onChangeExposure(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-3.5 py-2.5 border-t border-white/10 bg-black/50 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono text-[10px]">
              {GETLAYERS_GRADIENTS[activeGradient]?.name} • {GETLAYERS_SCENE_PRESETS[activeScenePreset]?.name}
            </span>
            <button
              onClick={handleDownloadSpec}
              className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/15 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Layer Spec</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
