// ===================================================================
// FLOATING 3D COMPONENT METALLURGY & SPEC INSPECTOR
// ===================================================================

import React from "react";
import { Wrench, Shield, Scale, DollarSign, X } from "lucide-react";
import { EXTERIOR_ASSEMBLY_REGISTRY } from "../../sim/exteriorAssemblyTypes";
import { useExterior3DStore } from "../store/useExterior3DStore";
import { useExteriorAssemblyStore } from "../../state/useExteriorAssemblyStore";

export const ExteriorComponentInspector3D: React.FC = () => {
  const selectedInstanceId = useExterior3DStore((s) => s.selectedInstanceId);
  const selectInstance3D = useExterior3DStore((s) => s.selectInstance3D);
  const replaceVariant = useExteriorAssemblyStore((s) => s.replaceVariant);
  const selectedVariants = useExteriorAssemblyStore((s) => s.selectedVariants);

  if (!selectedInstanceId) return null;

  const comp = EXTERIOR_ASSEMBLY_REGISTRY.find((c) => c.id === selectedInstanceId);
  if (!comp) return null;

  const currentGrade = selectedVariants[comp.id] || "forged";

  return (
    <div className="absolute bottom-4 left-4 z-20 w-80 rounded-2xl backdrop-blur-xl p-3.5 shadow-2xl space-y-2.5 animate-fadeIn" style={{backgroundColor: 'rgba(255,248,235,0.95)', border: '1px solid rgba(217,166,78,0.4)'}}>
      <div className="flex items-center justify-between pb-2" style={{borderBottom: '1px solid rgba(217,166,78,0.25)'}}>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase" style={{color: '#92400E'}}>
            {comp.category}
          </span>
          <h4 className="text-xs font-bold" style={{color: '#451A03'}}>{comp.name}</h4>
        </div>
        <button
          onClick={() => selectInstance3D(null)}
          className="p-1 rounded-lg" style={{color: '#92400E'}}
        >
          <X size={14} />
        </button>
      </div>

      <p className="text-[11px] font-sans leading-relaxed" style={{color: '#78716C'}}>
        {comp.tooltipAdvice}
      </p>

      {/* Material Grade Selection */}
      <div className="pt-2 border-t border-white/5 space-y-1.5">
        <label className="text-[10px] font-mono uppercase font-bold block" style={{color: '#92400E'}}>
          METALLURGY GRADE
        </label>
        <select
          value={currentGrade}
          onChange={(e) => replaceVariant(comp.id, e.target.value as any)}
          className="w-full rounded-xl px-2.5 py-1 text-xs font-mono cursor-pointer focus:outline-none" style={{backgroundColor: 'rgba(255,248,235,0.8)', border: '1px solid rgba(217,166,78,0.3)', color: '#451A03'}}
        >
          {comp.variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
