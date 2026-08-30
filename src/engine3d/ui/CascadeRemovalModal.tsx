// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — CASCADE REMOVAL WARNING MODAL
// ============================================================================
// Modal dialog warning users before uninstallation of parent components,
// detailing the complete recursive downstream cascade dependency tree.
// ============================================================================

import React from 'react';
import type { ComponentInstance3D } from '../types';
import { useEngine3DStore } from '../store/useEngine3DStore';

export interface CascadeRemovalModalProps {
  targetInstance: ComponentInstance3D | null;
  dependentInstances: ComponentInstance3D[];
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CascadeRemovalModal: React.FC<CascadeRemovalModalProps> = ({
  targetInstance,
  dependentInstances,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !targetInstance) return null;

  const totalCount = dependentInstances.length + 1;
  const totalMassRemoved =
    targetInstance.manifestRef.massKg +
    dependentInstances.reduce((sum, inst) => sum + inst.manifestRef.massKg, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-150" style={{backgroundColor: 'rgba(255,248,235,0.8)'}}>
      <div className="w-full max-w-md rounded-2xl shadow-2xl p-6" style={{backgroundColor: '#FFF8EB', border: '1px solid rgba(217,166,78,0.4)', color: '#451A03'}}>
        <div className="flex items-center gap-3 text-amber-400 mb-4">
          <span className="text-2xl">⚠</span>
          <h3 className="text-lg font-bold" style={{color: '#451A03'}}>Uninstall Dependency Warning</h3>
        </div>

        <p className="text-sm mb-3" style={{color: '#78716C'}}>
          Removing <span className="font-semibold text-white">"{targetInstance.manifestRef.displayName}"</span> will
          also automatically uninstall <span className="font-semibold text-rose-400">{dependentInstances.length}</span> dependent subassembly parts:
        </p>

        {/* Downstream Tree */}
        <div className="rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5 mb-4 text-xs font-mono" style={{backgroundColor: 'rgba(255,248,235,0.6)', border: '1px solid rgba(217,166,78,0.25)'}}>
          <div className="text-rose-300 font-bold">⊖ {targetInstance.manifestRef.displayName} (Root Target)</div>
          {dependentInstances.map((inst) => (
            <div key={inst.instanceId} className="text-slate-400 pl-4 border-l border-slate-800">
              ↳ ⊖ {inst.manifestRef.displayName} {inst.cylinderIndex && `(Cyl #${inst.cylinderIndex})`}
            </div>
          ))}
        </div>

        <div className="text-xs mb-6 flex justify-between font-mono p-2.5 rounded-lg" style={{color: '#92400E', backgroundColor: 'rgba(255,248,235,0.5)', border: '1px solid rgba(217,166,78,0.2)'}}>
          <span>Total Parts: <strong className="text-slate-200">{totalCount}</strong></span>
          <span>Mass Removed: <strong className="text-slate-200">{totalMassRemoved.toFixed(1)} kg</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#92400E'}}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 transition-colors"
          >
            Uninstall All ({totalCount} Parts)
          </button>
        </div>
      </div>
    </div>
  );
};
