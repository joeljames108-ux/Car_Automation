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
    <div className="absolute bottom-4 left-4 z-20 w-80 bg-slate-900/90 border border-white/10 rounded-2xl backdrop-blur-xl p-3.5 shadow-2xl space-y-2.5 animate-fadeIn">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div>
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
            {comp.category}
          </span>
          <h4 className="text-xs font-bold text-slate-100">{comp.name}</h4>
        </div>
        <button
          onClick={() => selectInstance3D(null)}
          className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
        >
          <X size={14} />
        </button>
      </div>

      <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
        {comp.tooltipAdvice}
      </p>

      {/* Material Grade Selection */}
      <div className="pt-2 border-t border-white/5 space-y-1.5">
        <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
          METALLURGY GRADE
        </label>
        <select
          value={currentGrade}
          onChange={(e) => replaceVariant(comp.id, e.target.value as any)}
          className="w-full bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
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
