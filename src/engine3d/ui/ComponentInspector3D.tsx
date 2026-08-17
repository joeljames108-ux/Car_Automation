// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — 3D COMPONENT INSPECTOR PANEL
// ============================================================================
// Floating glassmorphism diagnostic inspector displaying real-time mechanical
// specs, material variant swatches, torque clearances, and dependency actions.
// ============================================================================

import React from 'react';
import { useEngine3DStore } from '../store/useEngine3DStore';
import { getManifestForComponentType } from '../manifests/v12Manifest';

export const ComponentInspector3D: React.FC = () => {
  const selectedInstanceId = useEngine3DStore((s) => s.selectedInstanceId);
  const instances = useEngine3DStore((s) => s.instances);
  const selectComponent = useEngine3DStore((s) => s.selectComponent);
  const replaceVariant = useEngine3DStore((s) => s.replaceVariant);
  const removeComponent = useEngine3DStore((s) => s.removeComponent);

  if (!selectedInstanceId || !instances[selectedInstanceId]) {
    return null;
  }

  const instance = instances[selectedInstanceId];
  const manifest = instance.manifestRef;

  return (
    <div className="absolute top-4 right-4 z-20 w-84 max-w-[calc(100vw-2rem)] bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 rounded-xl shadow-2xl p-4 text-slate-100 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header Bar */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase">
              {manifest.category}
            </span>
            {instance.cylinderIndex && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                Cyl #{instance.cylinderIndex}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">{manifest.displayName}</h3>
        </div>
        <button
          onClick={() => selectComponent(null)}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Material Variant Selector */}
      <div className="mt-3">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          Material Grade Variant
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {manifest.variants.map((v) => {
            const isSelected = instance.variant.id === v.id;
            return (
              <button
                key={v.id}
                onClick={() => replaceVariant(instance.instanceId, v.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all text-left ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-sm'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: `#${v.color.toString(16).padStart(6, '0')}` }}
                />
                <span className="truncate">{v.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Engineering Specifications Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-mono">Mass (Dry)</div>
          <div className="text-sm font-bold text-slate-200 font-mono">{manifest.massKg} kg</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-mono">Unit Cost</div>
          <div className="text-sm font-bold text-emerald-400 font-mono">${manifest.costUsd.toLocaleString()}</div>
        </div>
        {manifest.torqueSpec && (
          <div className="col-span-2 pt-1 border-t border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">{manifest.torqueSpec.fastenerName}</div>
            <div className="text-xs font-medium text-amber-300 font-mono">
              Torque: {manifest.torqueSpec.snugNm} Nm {manifest.torqueSpec.finalAngleDeg > 0 && `+ ${manifest.torqueSpec.finalAngleDeg}°`}
            </div>
          </div>
        )}
        {manifest.clearanceSpec && (
          <div className="col-span-2 pt-1 border-t border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">{manifest.clearanceSpec.label}</div>
            <div className="text-xs font-medium text-cyan-300 font-mono">
              Target: {manifest.clearanceSpec.targetMm} mm ({manifest.clearanceSpec.minMm}–{manifest.clearanceSpec.maxMm} mm)
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="mt-3 text-xs text-slate-400 leading-relaxed">
        {manifest.description}
      </p>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={() => removeComponent(instance.instanceId)}
          className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-200 transition-colors"
        >
          Uninstall Component
        </button>
      </div>
    </div>
  );
};
