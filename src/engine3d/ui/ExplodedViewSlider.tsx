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
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg text-xs" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)'}}>
      <button
        type="button"
        onClick={handleToggle}
        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
          explodedAmount > 0.05
            ? 'bg-amber-200/60 text-amber-800 border-amber-400/40 shadow-sm'
            : 'bg-amber-100/50 text-amber-600 border-amber-200/40 hover:text-amber-800'
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
          className="w-24 h-1.5 rounded-lg appearance-none cursor-pointer" style={{accentColor: '#D9A64E', backgroundColor: '#E8D5B7'}}
        />
        <span className="text-[11px] font-mono font-bold w-8 text-right" style={{color: '#92400E'}}>
          {percentage}%
        </span>
      </div>
    </div>
  );
};

export default ExplodedViewSlider;
