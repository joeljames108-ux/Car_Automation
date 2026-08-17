// ===================================================================
// DEDICATED AUTOMOTIVE PAINT BOOTH CONFIGURATOR PANEL
// ===================================================================

import React from "react";
import { Palette, Sparkles, Sliders, Layers } from "lucide-react";
import { useExteriorAssemblyStore } from "../../../state/useExteriorAssemblyStore";
import { APEX_HERITAGE_PAINT_SWATCHES } from "../../../sim/constants/exteriorConstants";

export const PaintBoothPanel: React.FC = () => {
  const paintConfig = useExteriorAssemblyStore((s) => s.paintConfig);
  const updatePaintConfig = useExteriorAssemblyStore((s) => s.updatePaintConfig);

  return (
    <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-2xl space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-white/10">
        <Palette className="text-cyan-400" size={18} />
        <h3 className="text-sm font-mono font-bold text-slate-100 uppercase">
          BESPOKE AUTOMOTIVE PAINT BOOTH & CLEAR COAT LAB
        </h3>
      </div>

      {/* Swatches Grid */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-slate-300 block">
          FACTORY HERITAGE COLOR PALETTE
        </label>
        <div className="grid grid-cols-5 gap-2">
          {APEX_HERITAGE_PAINT_SWATCHES.map((swatch) => (
            <button
              key={swatch.id}
              onClick={() =>
                updatePaintConfig({
                  primaryColorHex: swatch.hex,
                  finishType: swatch.finishRecommended,
                })
              }
              className={`group relative h-12 rounded-2xl border flex items-end p-1.5 transition-all ${
                paintConfig.primaryColorHex.toLowerCase() === swatch.hex.toLowerCase()
                  ? "border-cyan-400 scale-105 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                  : "border-white/10 hover:border-white/40"
              }`}
              style={{ backgroundColor: swatch.hex }}
              title={swatch.name}
            >
              <span className="text-[9px] font-mono font-bold text-white bg-slate-950/80 px-1 rounded truncate w-full">
                {swatch.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Clear Coat DFT (Dry Film Thickness) Indicator */}
      <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">Total Coating Build:</span>
        <strong className="text-cyan-400 font-bold">
          {paintConfig.eCoatPrimerMicrons +
            paintConfig.primerSurfacerMicrons +
            paintConfig.baseCoatMicrons +
            paintConfig.clearCoatMicrons}{" "}
          µm DFT
        </strong>
      </div>
    </div>
  );
};
