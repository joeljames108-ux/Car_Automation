import React from "react";
import {
  IsoMaterialPipelineDefs,
  getPhotorealisticMaterial,
  MaterialPreset,
  MATERIAL_PRESETS,
} from "./isoMaterialPipeline";

/**
 * Reusable 3D Isometric SVG Material Grade Defs
 * Renders the full 7-layer photorealistic material shader pipeline alongside
 * backwards-compatible material fill definitions.
 */
export const IsoShadersDefs: React.FC = () => {
  return (
    <>
      <IsoMaterialPipelineDefs />
      <defs>
        {/* ── 1. GRAY CAST IRON (Heavy Duty Dark Slate) ── */}
        <linearGradient id="iso-cast-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="25%" stopColor="#94a3b8" />
          <stop offset="55%" stopColor="#64748b" />
          <stop offset="80%" stopColor="#475569" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="iso-cast-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="30%" stopColor="#475569" />
          <stop offset="65%" stopColor="#334155" />
          <stop offset="90%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="iso-cast-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="35%" stopColor="#334155" />
          <stop offset="70%" stopColor="#1e293b" />
          <stop offset="90%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* ── 2. 6061-T6 FORGED ALUMINUM ALLOY (Aerospace Silver Sheen) ── */}
        <linearGradient id="iso-forged-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="75%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="iso-forged-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="30%" stopColor="#cbd5e1" />
          <stop offset="60%" stopColor="#94a3b8" />
          <stop offset="85%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="iso-forged-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="35%" stopColor="#94a3b8" />
          <stop offset="70%" stopColor="#64748b" />
          <stop offset="90%" stopColor="#475569" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* ── 3. BILLET CNC PRECISION (Mirror Chrome + Cyan Reflections) ── */}
        <linearGradient id="iso-billet-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#e0f2fe" />
          <stop offset="45%" stopColor="#7dd3fc" />
          <stop offset="65%" stopColor="#ffffff" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="iso-billet-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="25%" stopColor="#38bdf8" />
          <stop offset="55%" stopColor="#0f172a" />
          <stop offset="80%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>
        <linearGradient id="iso-billet-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="30%" stopColor="#0284c7" />
          <stop offset="60%" stopColor="#0f172a" />
          <stop offset="85%" stopColor="#082f49" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* ── 4. GRADE 5 MOTORSPORT TITANIUM (Satin Gunmetal + Platinum Highlight) ── */}
        <linearGradient id="iso-titanium-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="18%" stopColor="#f8fafc" />
          <stop offset="45%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="90%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="iso-titanium-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="30%" stopColor="#64748b" />
          <stop offset="60%" stopColor="#475569" />
          <stop offset="85%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="iso-titanium-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="35%" stopColor="#475569" />
          <stop offset="70%" stopColor="#334155" />
          <stop offset="90%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>

        {/* ── 5. PREPREG CARBON FIBRE (Composites) ── */}
        <linearGradient id="iso-carbon-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="25%" stopColor="#334155" />
          <stop offset="55%" stopColor="#1e293b" />
          <stop offset="80%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="iso-carbon-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="35%" stopColor="#1e293b" />
          <stop offset="70%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        <linearGradient id="iso-carbon-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="40%" stopColor="#0f172a" />
          <stop offset="80%" stopColor="#020617" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>

        {/* ── 6. CERAMIC THERMAL COATING ── */}
        <linearGradient id="iso-ceramic-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#f8fafc" />
          <stop offset="65%" stopColor="#e2e8f0" />
          <stop offset="85%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="iso-ceramic-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="35%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="iso-ceramic-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="40%" stopColor="#cbd5e1" />
          <stop offset="75%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* 3D Isometric Ground Drop Shadow */}
        <radialGradient id="iso-ground-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.75" />
          <stop offset="40%" stopColor="#000000" stopOpacity="0.45" />
          <stop offset="75%" stopColor="#000000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>
    </>
  );
};

export function getIsoMaterialFills(grade: string = "cast") {
  const { fills, filter, preset } = getPhotorealisticMaterial(grade);

  return {
    top: fills.top,
    left: fills.left,
    right: fills.right,
    front: fills.front,
    filter,
    preset,
    roughness: preset.roughness,
    specularIntensity: preset.specularIntensity,
    aoStrength: preset.aoStrength,
  };
}

export { getPhotorealisticMaterial, MATERIAL_PRESETS };
export type { MaterialPreset };
