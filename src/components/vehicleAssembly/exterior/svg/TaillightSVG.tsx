// ===================================================================
// 3D OLED FACETED TAILLIGHT STRIP SVG ISOMETRIC RENDERER
// ===================================================================
// Full-width continuous 3D OLED lightbar with sequential chasing
// indicators, aero blade lens edges, and central brake light array.
// ===================================================================

import React from "react";
import type { LightingConfig } from "../../../../sim/types/exterior";

interface TaillightSVGProps {
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

export const TaillightSVG: React.FC<TaillightSVGProps> = ({
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
  const strokeColor = isSelected ? "#38bdf8" : isHovered ? "#0284c7" : "#020617";

  return (
    <g
      id="taillights_oled_assembly"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Smoked Glass Housing Recess ── */}
      <polygon
        points="750,285 790,300 782,320 742,305"
        fill="#090d16"
        stroke={strokeColor}
        strokeWidth="1.2"
      />

      {/* ── 2. Full-Width 3D OLED Continuous Light Blade ── */}
      <path
        d="M748,290 L785,304 L780,312 L744,298 Z"
        fill="url(#oledTaillightGlow)"
        filter="url(#opticalLightBloom)"
      />

      {/* ── 3. Amber Chasing Sequential Indicator Strip ── */}
      <line
        x1="748"
        y1="302"
        x2="778"
        y2="314"
        stroke="url(#amberTurnSignalGlow)"
        strokeWidth="2.0"
      />

      {/* ── 4. High-Precision Aero Blade Lens Flange ── */}
      <path
        d="M748,290 L785,304"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeOpacity="0.7"
      />
    </g>
  );
};
