// ===================================================================
// OPTICAL LIGHTING & LED SHADER DEFINITIONS
// ===================================================================
// SVG <defs> containing laser projector optics, matrix LED emitter arrays,
// crystal DRL tube glow, and 3D OLED animated surfaces.
// ===================================================================

import React from "react";

export const LightingShaderDefs: React.FC = () => {
  return (
    <defs>
      {/* ── 1. Matrix LED Projector Lens Glow ── */}
      <radialGradient id="matrixProjectorGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1.0" />
        <stop offset="30%" stopColor="#fbbf24" stopOpacity="0.8" />
        <stop offset="70%" stopColor="#0284c7" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
      </radialGradient>

      {/* ── 2. Laser High Beam Phosphor Core ── */}
      <radialGradient id="laserPhosphorCore" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" stopOpacity="1.0" />
        <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#080c14" stopOpacity="0.0" />
      </radialGradient>

      {/* ── 3. 3D OLED Taillight Surface Glow ── */}
      <linearGradient id="oledTaillightGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff0040" stopOpacity="1.0" />
        <stop offset="50%" stopColor="#dc2626" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.8" />
      </linearGradient>

      {/* ── 4. Amber Sequential Chasing Turn Signal ── */}
      <linearGradient id="amberTurnSignalGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>

      {/* ── 5. Headlight Lens Crystal Clear Refraction ── */}
      <linearGradient id="headlightLensRefraction" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
        <stop offset="25%" stopColor="#fbbf24" stopOpacity="0.15" />
        <stop offset="70%" stopColor="#0284c7" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
      </linearGradient>

      {/* ── 6. Optical Glow Bloom Filter ── */}
      <filter id="opticalLightBloom" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.0" result="bloom1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="6.0" result="bloom2" />
        <feMerge>
          <feMergeNode in="bloom2" />
          <feMergeNode in="bloom1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
};
