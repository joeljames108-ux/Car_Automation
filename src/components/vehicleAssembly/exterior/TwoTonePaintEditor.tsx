// ===================================================================
// TWO-TONE PAINT & RACING LIVERY EDITOR
// ===================================================================

import React from "react";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";

export const TwoTonePaintEditor: React.FC = () => {
  const paintConfig = useExteriorAssemblyStore((s) => s.paintConfig);
  const updatePaintConfig = useExteriorAssemblyStore((s) => s.updatePaintConfig);

  return (
    <div className="p-4 rounded-2xl bg-amber-950/80 border border-white/10 space-y-3 text-xs font-mono">
      <div className="flex items-center justify-between">
        <span className="text-amber-100/80 font-bold">Livery Style:</span>
        <select
          value={paintConfig.liveryStyle}
          onChange={(e) => updatePaintConfig({ liveryStyle: e.target.value as any })}
          className="bg-amber-900/50 border border-white/10 rounded-lg px-2 py-1 text-amber-300"
        >
          <option value="monotone">Monotone Clean</option>
          <option value="two_tone_roof">Two-Tone Contrast Roof</option>
          <option value="centre_racing_stripe">Centre Racing Stripes</option>
          <option value="gulf_heritage">Gulf Heritage Classic</option>
          <option value="f1_camo_livery">Formula Test Camo</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-amber-100/80">Stripe Width:</span>
        <input
          type="range"
          min="80"
          max="320"
          step="10"
          value={paintConfig.stripeWidthMm}
          onChange={(e) => updatePaintConfig({ stripeWidthMm: parseInt(e.target.value) })}
          className="w-32 h-1.5 bg-amber-800/35 rounded appearance-none accent-amber-400 cursor-pointer"
        />
        <span className="text-amber-400">{paintConfig.stripeWidthMm}mm</span>
      </div>
    </div>
  );
};
