// ===================================================================
// MATRIX LED & LASER HEADLIGHT UNITS SVG ISOMETRIC RENDERER
// ===================================================================
// 84-pixel adaptive matrix LED projector array with crystal C-clamp
// DRL light guide, carbon bezel, and transparent polycarbonate lens.
// ===================================================================

import React from "react";
import type { LightingConfig } from "../../../../sim/types/exterior";

interface HeadlightSVGProps {
  lightingConfig?: Partial<LightingConfig>;
  isHovered?: boolean;
  isSelected?: boolean;
  isInstalled?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const HeadlightSVG: React.FC<HeadlightSVGProps> = ({
  lightingConfig,
  isHovered = false,
  isSelected = false,
  isInstalled = true,
  opacity = 1.0,
  transform = "",
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const strokeColor = isSelected ? "#fbbf24" : isHovered ? "#0284c7" : "#020617";

  return (
    <g
      id="headlights_matrix_assembly"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Headlight Carbon Housing Shell ── */}
      <polygon
        points="205,315 255,290 270,305 215,335"
        fill="#090d16"
        stroke={strokeColor}
        strokeWidth="1.2"
      />

      {/* ── 2. Bi-LED Projector Lens Optics (High/Low Beam) ── */}
      <circle cx="230" cy="312" r="7" fill="url(#matrixProjectorGlow)" filter="url(#opticalLightBloom)" />
      <circle cx="230" cy="312" r="4.5" fill="#ffffff" />

      {/* ── 3. Adaptive Matrix LED Multi-Emitter Grid ── */}
      <g id="matrix_led_emitter_pixels">
        <rect x="242" y="302" width="2.5" height="2.5" rx="0.5" fill="#fbbf24" />
        <rect x="246" y="300" width="2.5" height="2.5" rx="0.5" fill="#fbbf24" />
        <rect x="250" y="298" width="2.5" height="2.5" rx="0.5" fill="#fbbf24" />
        <rect x="244" y="306" width="2.5" height="2.5" rx="0.5" fill="#fbbf24" />
        <rect x="248" y="304" width="2.5" height="2.5" rx="0.5" fill="#fbbf24" />
      </g>

      {/* ── 4. Crystal C-Clamp DRL Light Guide Tube ── */}
      <path
        d="M210,320 L248,295 L255,302"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        filter="url(#opticalLightBloom)"
      />

      {/* ── 5. Clear Polycarbonate Lens Outer Shield ── */}
      <polygon
        points="205,315 255,290 270,305 215,335"
        fill="url(#headlightLensRefraction)"
        stroke="#fbbf24"
        strokeWidth="0.6"
      />
    </g>
  );
};
