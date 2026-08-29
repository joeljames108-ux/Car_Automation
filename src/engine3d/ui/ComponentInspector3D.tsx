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
    <div className="absolute top-4 right-4 z-20 w-84 max-w-[calc(100vw-2rem)] backdrop-blur-xl rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-right-4 duration-200" style={{backgroundColor: 'rgba(255,248,235,0.95)', border: '1px solid rgba(217,166,78,0.4)', color: '#451A03'}}>
      {/* Header Bar */}
      <div className="flex items-start justify-between pb-3" style={{borderBottom: '1px solid rgba(217,166,78,0.25)'}}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded uppercase" style={{backgroundColor: 'rgba(217,166,78,0.2)', color: '#92400E', border: '1px solid rgba(217,166,78,0.4)'}}>
              {manifest.category}
            </span>
            {instance.cylinderIndex && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-indigo-800/60">
                Cyl #{instance.cylinderIndex}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold mt-1" style={{color: '#451A03'}}>{manifest.displayName}</h3>
        </div>
        <button
          onClick={() => selectComponent(null)}
          className="p-1 rounded-md transition-colors" style={{color: '#92400E'}}
        >
          ✕
        </button>
      </div>

      {/* Material Variant Selector */}
      <div className="mt-3">
        <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{color: '#92400E'}}>
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
                    ? 'bg-amber-200/60 border-amber-400 text-amber-800 shadow-sm'
                    : 'bg-amber-100/50 border-amber-200/50 text-amber-800 hover:bg-amber-200/50 hover:border-amber-300'
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
      <div className="mt-4 grid grid-cols-2 gap-2 p-2.5 rounded-lg" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.2)'}}>
        <div>
          <div className="text-[10px] uppercase font-mono" style={{color: '#92400E'}}>Mass (Dry)</div>
          <div className="text-sm font-bold font-mono" style={{color: '#451A03'}}>{manifest.massKg} kg</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-mono" style={{color: '#92400E'}}>Unit Cost</div>
          <div className="text-sm font-bold font-mono" style={{color: '#92400E'}}>${manifest.costUsd.toLocaleString()}</div>
        </div>
        {manifest.torqueSpec && (
          <div className="col-span-2 pt-1 border-t border-slate-800">
            <div className="text-[10px] uppercase font-mono" style={{color: '#92400E'}}>{manifest.torqueSpec.fastenerName}</div>
            <div className="text-xs font-medium font-mono" style={{color: '#92400E'}}>
              Torque: {manifest.torqueSpec.snugNm} Nm {manifest.torqueSpec.finalAngleDeg > 0 && `+ ${manifest.torqueSpec.finalAngleDeg}°`}
            </div>
          </div>
        )}
        {manifest.clearanceSpec && (
          <div className="col-span-2 pt-1 border-t border-slate-800">
            <div className="text-[10px] uppercase font-mono" style={{color: '#92400E'}}>{manifest.clearanceSpec.label}</div>
            <div className="text-xs font-medium font-mono" style={{color: '#92400E'}}>
              Target: {manifest.clearanceSpec.targetMm} mm ({manifest.clearanceSpec.minMm}–{manifest.clearanceSpec.maxMm} mm)
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="mt-3 text-xs leading-relaxed" style={{color: '#78716C'}}>
        {manifest.description}
      </p>

      {/* Actions */}
      <div className="mt-4 pt-3 flex items-center justify-between gap-2" style={{borderTop: '1px solid rgba(217,166,78,0.25)'}}>
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
