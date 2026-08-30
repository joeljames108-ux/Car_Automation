// ===================================================================
// BODY PANEL SVG SHADER & AUTOMOTIVE PAINT DEFINITIONS
// ===================================================================
// High-fidelity SVG <defs> simulating multi-layer clear coat reflections,
// metallic flake sparkle, pearl color shift, and panel shut-line shadows.
// ===================================================================

import React from "react";
import type { PaintSystemConfig } from "../../../../sim/types/exterior";

interface BodyPanelShaderDefsProps {
  paintConfig?: PaintSystemConfig;
}

export const BodyPanelShaderDefs: React.FC<BodyPanelShaderDefsProps> = ({
  paintConfig,
}) => {
  const primaryColor = paintConfig?.primaryColorHex || "#0284c7";
  const secondaryColor = paintConfig?.secondaryColorHex || "#1a1008";
  const finish = paintConfig?.finishType || "liquid_metallic";

  return (
    <defs>
      {/* ── 1. Master Automotive Body Paint Gradient ── */}
      <linearGradient id="bodyPaintMaster" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={primaryColor} stopOpacity="1.0" />
        <stop offset="35%" stopColor={primaryColor} stopOpacity="0.85" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" /> {/* Specular highlight */}
        <stop offset="70%" stopColor={primaryColor} stopOpacity="0.95" />
        <stop offset="100%" stopColor="#020617" stopOpacity="1.0" />
      </linearGradient>

      {/* ── 2. Contrast Roof / Two-Tone Paint Gradient ── */}
      <linearGradient id="roofPaintContrast" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.9" />
        <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#020617" stopOpacity="1.0" />
      </linearGradient>

      {/* ── 3. Exposed Autoclaved Carbon Fiber Weave ── */}
      <linearGradient id="exposedCarbonWeave" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#090d16" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      {/* ── 4. Precision Panel Gap & Shut-Line Shadow ── */}
      <filter id="shutLineShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.0" floodColor="#000000" floodOpacity="0.85" />
      </filter>

      {/* ── 5. Specular Clear Coat Gloss Glaze ── */}
      <linearGradient id="clearCoatGlaze" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="30%" stopColor="#ffffff" stopOpacity="0.08" />
        <stop offset="70%" stopColor="#000000" stopOpacity="0.0" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
      </linearGradient>

      {/* ── 6. Door Side Impact Beam Ghost Structure ── */}
      <linearGradient id="doorBeamGhost" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.0" />
        <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
      </linearGradient>

      {/* ── 7. Chrome & Polished Trim Accents ── */}
      <linearGradient id="chromeTrimLuster" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="25%" stopColor="#ffffff" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="75%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
  );
};
