import React from "react";

/**
 * ═════════════════════════════════════════════════════════════════════
 * PHASE 25: UNIFIED HYPER-REALISTIC SHADER, TEXTURE & METALLURGY ENGINE
 * ═════════════════════════════════════════════════════════════════════
 *
 * Provides a comprehensive library of procedural SVG shaders, ray-traced
 * metallurgies, ambient occlusion maps, CNC toolpaths, diamond honing textures,
 * Inconel heat-tint oxidation gradients, and thermodynamic heat shimmers.
 */
export const IsoPhotorealShaders: React.FC = () => {
  return (
    <>
      {/* ── 1. PROCEDURAL NOISE & FILTER ENGINES ── */}
      <filter id="fe-cast-grain" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" result="noise" />
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0.28 0" in="noise" result="grayNoise" />
        <feComposite operator="in" in="grayNoise" in2="SourceGraphic" result="grain" />
        <feBlend mode="multiply" in="SourceGraphic" in2="grain" />
      </filter>

      <filter id="fe-cnc-toolpath" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="turbulence" baseFrequency="0.05 0.95" numOctaves="2" result="stripes" />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.18 0" in="stripes" result="brightStripes" />
        <feBlend mode="screen" in="SourceGraphic" in2="brightStripes" />
      </filter>

      <filter id="fe-specular-bloom" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="fe-thermal-shimmer" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="heatWave" />
        <feDisplacementMap in="SourceGraphic" in2="heatWave" scale="3" xChannelSelector="R" yChannelSelector="G" />
      </filter>

      {/* ── 2. METALLURGY GRADIENTS ── */}
      {/* BILLET 6061-T6 ALUMINUM - TOP DECK FACING */}
      <linearGradient id="photoreal-billet-deck" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" stopOpacity="1" />
        <stop offset="20%" stopColor="#e2e8f0" stopOpacity="1" />
        <stop offset="45%" stopColor="#cbd5e1" stopOpacity="1" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
        <stop offset="55%" stopColor="#94a3b8" stopOpacity="1" />
        <stop offset="80%" stopColor="#64748b" stopOpacity="1" />
        <stop offset="100%" stopColor="#334155" stopOpacity="1" />
      </linearGradient>

      {/* BILLET 6061-T6 ALUMINUM - SKIRT & WEBBING */}
      <linearGradient id="photoreal-billet-skirt" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" stopOpacity="1" />
        <stop offset="25%" stopColor="#64748b" stopOpacity="1" />
        <stop offset="60%" stopColor="#475569" stopOpacity="1" />
        <stop offset="85%" stopColor="#334155" stopOpacity="1" />
        <stop offset="100%" stopColor="#1e293b" stopOpacity="1" />
      </linearGradient>

      {/* CAST IRON / CARBON STEEL */}
      <linearGradient id="photoreal-castiron-wall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#475569" stopOpacity="1" />
        <stop offset="30%" stopColor="#334155" stopOpacity="1" />
        <stop offset="70%" stopColor="#1e293b" stopOpacity="1" />
        <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
      </linearGradient>

      {/* MAGNESIUM GOLD PASSIVATION */}
      <linearGradient id="photoreal-magnesium-deck" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
        <stop offset="25%" stopColor="#ca8a04" stopOpacity="1" />
        <stop offset="50%" stopColor="#fde047" stopOpacity="1" />
        <stop offset="75%" stopColor="#a16207" stopOpacity="1" />
        <stop offset="100%" stopColor="#713f12" stopOpacity="1" />
      </linearGradient>

      {/* INCONEL / TITANIUM HEAT-TINT RAINBOW OXIDATION */}
      <linearGradient id="photoreal-heat-tint" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
        <stop offset="25%" stopColor="#f97316" stopOpacity="0.85" />
        <stop offset="50%" stopColor="#a855f7" stopOpacity="0.9" />
        <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
      </linearGradient>

      {/* ── 3. CYLINDER BORE DEPTH & DIAMOND CROSS-HATCH HONING ── */}
      <radialGradient id="photoreal-bore-depth" cx="50%" cy="40%" r="65%" fx="45%" fy="30%">
        <stop offset="0%" stopColor="#020617" stopOpacity="1" />
        <stop offset="35%" stopColor="#0b1329" stopOpacity="1" />
        <stop offset="65%" stopColor="#1e293b" stopOpacity="1" />
        <stop offset="90%" stopColor="#475569" stopOpacity="1" />
        <stop offset="100%" stopColor="#64748b" stopOpacity="1" />
      </radialGradient>

      <linearGradient id="photoreal-liner-rim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="30%" stopColor="#94a3b8" />
        <stop offset="70%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>

      <pattern id="photoreal-diamond-hatch" width="8" height="8" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="8" y2="8" stroke="#38bdf8" strokeWidth="0.55" opacity="0.3" />
        <line x1="8" y1="0" x2="0" y2="8" stroke="#38bdf8" strokeWidth="0.55" opacity="0.3" />
      </pattern>

      {/* ── 4. INTERNAL FLUID & PASSAGE GRADIENTS ── */}
      <linearGradient id="photoreal-coolant-flow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#0284c7" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0369a1" stopOpacity="0.95" />
      </linearGradient>

      <linearGradient id="photoreal-oil-gallery" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
        <stop offset="50%" stopColor="#d97706" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#78350f" stopOpacity="0.95" />
      </linearGradient>

      {/* ── 5. FASTENERS & HARDWARE SHADERS ── */}
      <radialGradient id="photoreal-arp-black-oxide" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#64748b" />
        <stop offset="45%" stopColor="#334155" />
        <stop offset="85%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>

      <radialGradient id="photoreal-tin-gold" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#eab308" />
        <stop offset="80%" stopColor="#a16207" />
        <stop offset="100%" stopColor="#713f12" />
      </radialGradient>

      <linearGradient id="photoreal-washer-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="50%" stopColor="#64748b" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>

      {/* ── 6. AMBIENT OCCLUSION & RAY-TRACED DROP SHADOWS ── */}
      <radialGradient id="photoreal-chassis-ground-ao" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
        <stop offset="45%" stopColor="#000000" stopOpacity="0.55" />
        <stop offset="75%" stopColor="#000000" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>

      <linearGradient id="photoreal-valley-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#020617" stopOpacity="0.95" />
        <stop offset="70%" stopColor="#090d16" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#1e293b" stopOpacity="0.4" />
      </linearGradient>
    </>
  );
};
