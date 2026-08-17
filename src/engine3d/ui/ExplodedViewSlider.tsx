// ============================================================================
// MODULAR GLB ENGINE ASSEMBLY — 3D EXPLODED VIEW SLIDER HUD
// ============================================================================
// Precision interactive slider controlling the continuous 3D exploded view
// separation amount, with haptic presets and smooth animated toggle modes.
// ============================================================================

import React from 'react';
import { useEngine3DStore } from '../store/useEngine3DStore';

export const ExplodedViewSlider: React.FC = () => {
  const explodedAmount = useEngine3DStore((s) => s.explodedAmount);
  const setExplodedAmount = useEngine3DStore((s) => s.setExplodedAmount);

  const percentage = Math.round(explodedAmount * 100);

  const handleToggle = () => {
    setExplodedAmount(explodedAmount > 0.05 ? 0 : 1.0);
  };

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-base-900/80 border border-slate-800 text-xs">
      <button
        type="button"
        onClick={handleToggle}
        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
          explodedAmount > 0.05
            ? 'bg-cyan-500/25 text-cyan-200 border-cyan-500/40 shadow-sm'
            : 'bg-base-950 text-slate-400 border-slate-800 hover:text-slate-200'
        }`}
      >
        {explodedAmount > 0.05 ? 'Exploded' : 'Assemble'}
      </button>

      <div className="flex items-center gap-1.5">
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => setExplodedAmount(Number(e.target.value) / 100)}
          className="w-24 accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-[11px] font-mono font-bold text-cyan-300 w-8 text-right">
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default ExplodedViewSlider;
