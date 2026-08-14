import React from "react";

/**
 * Reusable 3D Isometric SVG Material Grade Defs
 * Provides Top (+Z specular), Left (-X directional shadow), and Right (+Y ambient shadow) shaders
 */
export const IsoShadersDefs: React.FC = () => {
  return (
    <defs>
      {/* ── 1. GRAY CAST IRON (Heavy Duty Dark Slate) ── */}
      <linearGradient id="iso-cast-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="iso-cast-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="iso-cast-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      {/* ── 2. 6061-T6 FORGED ALUMINUM ALLOY (Aerospace Silver Sheen) ── */}
      <linearGradient id="iso-forged-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="35%" stopColor="#e2e8f0" />
        <stop offset="70%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
      <linearGradient id="iso-forged-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="50%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <linearGradient id="iso-forged-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="50%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      {/* ── 3. BILLET CNC PRECISION (Mirror Chrome + Cyan Reflections) ── */}
      <linearGradient id="iso-billet-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="25%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#ffffff" />
        <stop offset="85%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="iso-billet-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="40%" stopColor="#0f172a" />
        <stop offset="80%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#075985" />
      </linearGradient>
      <linearGradient id="iso-billet-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      {/* ── 4. GRADE 5 MOTORSPORT TITANIUM (Satin Gunmetal + Platinum Highlight) ── */}
      <linearGradient id="iso-titanium-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="20%" stopColor="#f1f5f9" />
        <stop offset="60%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
      <linearGradient id="iso-titanium-left" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="45%" stopColor="#334155" />
        <stop offset="90%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="iso-titanium-right" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      {/* 3D Isometric Ground Drop Shadow */}
      <radialGradient id="iso-ground-shadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#000000" stopOpacity="0.65" />
        <stop offset="40%" stopColor="#000000" stopOpacity="0.4" />
        <stop offset="80%" stopColor="#000000" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
};

export function getIsoMaterialFills(grade: string = "cast") {
  switch (grade) {
    case "cast":
      return { top: "url(#iso-cast-top)", left: "url(#iso-cast-left)", right: "url(#iso-cast-right)", front: "url(#iso-cast-left)" };
    case "forged":
      return { top: "url(#iso-forged-top)", left: "url(#iso-forged-left)", right: "url(#iso-forged-right)", front: "url(#iso-forged-left)" };
    case "billet":
      return { top: "url(#iso-billet-top)", left: "url(#iso-billet-left)", right: "url(#iso-billet-right)", front: "url(#iso-billet-left)" };
    case "titanium":
      return { top: "url(#iso-titanium-top)", left: "url(#iso-titanium-left)", right: "url(#iso-titanium-right)", front: "url(#iso-titanium-left)" };
    default:
      return { top: "url(#iso-cast-top)", left: "url(#iso-cast-left)", right: "url(#iso-cast-right)", front: "url(#iso-cast-left)" };
  }
}
