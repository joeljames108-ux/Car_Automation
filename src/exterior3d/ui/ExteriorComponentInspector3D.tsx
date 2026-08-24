// ===================================================================
// FLOATING 3D COMPONENT METALLURGY & SPEC INSPECTOR
// ===================================================================

import React from "react";
import { Wrench, Shield, Scale, DollarSign, X } from "lucide-react";
import { EXTERIOR_ASSEMBLY_REGISTRY } from "../../sim/exteriorAssemblyTypes";
import { useExterior3DStore } from "../store/useExterior3DStore";
import { useExteriorAssemblyStore } from "../../state/useExteriorAssemblyStore";
import {
  HOOD_GLB_ASSET_CONFIGS,
  resolveHoodGlbAsset,
} from "../assets/hoodGlbAssetRegistry";

export const ExteriorComponentInspector3D: React.FC = () => {
  const selectedInstanceId = useExterior3DStore((s) => s.selectedInstanceId);
  const selectInstance3D = useExterior3DStore((s) => s.selectInstance3D);
  const replaceVariant = useExteriorAssemblyStore((s) => s.replaceVariant);
  const selectedVariants = useExteriorAssemblyStore((s) => s.selectedVariants);
  const hoodGlbPresetId = useExterior3DStore((s) => s.hoodGlbPresetId);
  const hoodGlbOpen = useExterior3DStore((s) => s.hoodGlbOpen);
  const setHoodGlbPreset = useExterior3DStore((s) => s.setHoodGlbPreset);
  const setHoodGlbOpen = useExterior3DStore((s) => s.setHoodGlbOpen);

  if (!selectedInstanceId) return null;

  const comp = EXTERIOR_ASSEMBLY_REGISTRY.find((c) => c.id === selectedInstanceId);
  if (!comp) return null;

  const currentGrade = selectedVariants[comp.id] || "forged";
  const isHoodPanel = selectedInstanceId === "hood_panel";
  const activeHood = resolveHoodGlbAsset(hoodGlbPresetId, hoodGlbOpen);

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

      {/* Interactive Hood GLB Configuration (vehicle preset + articulation) */}
      {isHoodPanel && (
        <div className="pt-2 space-y-2" style={{borderTop: '1px solid rgba(217,166,78,0.25)'}}>
          <label className="text-[10px] font-mono uppercase font-bold block" style={{color: '#92400E'}}>
            HOOD GLB ASSET CONFIGURATION
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {HOOD_GLB_ASSET_CONFIGS.map((preset) => {
              const isActive = hoodGlbPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setHoodGlbPreset(preset.id)}
                  className="w-full text-left rounded-xl px-2.5 py-1.5 transition-colors"
                  style={{
                    backgroundColor: isActive ? 'rgba(217,166,78,0.25)' : 'rgba(255,248,235,0.8)',
                    border: `1px solid ${isActive ? 'rgba(146,64,14,0.6)' : 'rgba(217,166,78,0.3)'}`,
                    color: '#451A03',
                  }}
                >
                  <span className="text-[11px] font-bold font-sans">{preset.label}</span>
                  <span className="block text-[9px] font-mono opacity-70">
                    {preset.bodyType.toUpperCase()} • WB {preset.wheelbaseMm}MM • {(preset.massKg).toFixed(0)}KG
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setHoodGlbOpen(!hoodGlbOpen)}
            className="w-full rounded-xl px-2.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wide transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: hoodGlbOpen ? 'rgba(220,38,38,0.15)' : 'rgba(5,150,105,0.12)',
              border: `1px solid ${hoodGlbOpen ? 'rgba(220,38,38,0.45)' : 'rgba(5,150,105,0.45)'}`,
              color: '#451A03',
            }}
          >
            {hoodGlbOpen ? `▲ CLOSE HOOD (${activeHood.open ? "OPEN" : "CLOSED"} GLB LOADED)` : "▼ OPEN HOOD (ARTICULATE 50°)"}
          </button>
          <p className="text-[9px] font-mono leading-snug opacity-70" style={{color: '#78716C'}}>
            ACTIVE ASSET: {activeHood.assetPath}
          </p>
        </div>
      )}
    </div>
  );
};
