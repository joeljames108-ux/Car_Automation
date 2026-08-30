// ===================================================================
// DOUBLE-BUBBLE CARBON ROOF PANEL SVG ISOMETRIC RENDERER
// ===================================================================
// Lightweight double-bubble carbon roof with drip rail channels,
// panoramic glass roof options, and antenna shark fin.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";
import type { ExteriorEngineeringConfig, PaintSystemConfig } from "../../../../sim/types/exterior";

interface RoofPanelSVGProps {
  materialGrade?: MaterialGrade;
  exteriorConfig?: Partial<ExteriorEngineeringConfig>;
  paintConfig?: Partial<PaintSystemConfig>;
  isHovered?: boolean;
  isSelected?: boolean;
  isInstalled?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const RoofPanelSVG: React.FC<RoofPanelSVGProps> = ({
  materialGrade = "billet",
  exteriorConfig,
  paintConfig,
  isHovered = false,
  isSelected = false,
  isInstalled = true,
  opacity = 1.0,
  transform = "",
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const getFill = () => {
    if (paintConfig?.roofContrastColor) return "url(#roofPaintContrast)";
    if (materialGrade === "billet") return "url(#exposedCarbonWeave)";
    return "url(#bodyPaintMaster)";
  };

  const strokeColor = isSelected
    ? "#fbbf24"
    : isHovered
    ? "#0284c7"
    : "#020617";

  const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.2;

  return (
    <g
      id="roof_panel_closure"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Main Double-Bubble Roof Polygon ── */}
      <polygon
        points="435,190 535,190 610,210 450,210"
        fill={getFill()}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        filter="url(#shutLineShadow)"
      />

      {/* ── 2. Double-Bubble Recesses (LH & RH Helmets) ── */}
      <path
        d="M455,195 Q480,188 510,195 Q540,188 590,198"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeOpacity="0.4"
      />

      {/* ── 3. Aerodynamic Antenna Shark Fin ── */}
      <polygon
        points="575,198 590,188 592,198"
        fill="#080c14"
        stroke="#334155"
        strokeWidth="0.8"
      />

      {/* ── 4. High-Gloss Clear Coat Reflection Highlight ── */}
      <polygon
        points="440,192 530,192 540,196 445,196"
        fill="url(#clearCoatGlaze)"
        opacity="0.85"
      />
    </g>
  );
};
