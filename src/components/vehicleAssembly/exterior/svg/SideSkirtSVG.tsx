// ===================================================================
// AERODYNAMIC SIDE SKIRTS & GROUND EFFECT BLADES SVG RENDERER
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";

interface SideSkirtSVGProps {
  materialGrade?: MaterialGrade;
  isHovered?: boolean;
  isSelected?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const SideSkirtSVG: React.FC<SideSkirtSVGProps> = ({
  materialGrade = "billet",
  isHovered = false,
  isSelected = false,
  opacity = 1.0,
  transform = "",
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const strokeColor = isSelected ? "#fbbf24" : isHovered ? "#0284c7" : "#020617";

  return (
    <g
      id="side_skirts_aero_blade"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <polygon
        points="320,385 640,385 650,398 310,398"
        fill="url(#exposedCarbonWeave)"
        stroke={strokeColor}
        strokeWidth="1.2"
        filter="url(#shutLineShadow)"
      />
      {/* Skirt Leading Winglet (Front) */}
      <polygon points="310,398 315,380 325,385 320,398" fill="url(#exposedCarbonWeave)" stroke="#fbbf24" strokeWidth="0.8" />
      {/* Skirt Trailing Winglet (Rear) */}
      <polygon points="640,385 650,370 660,375 650,398" fill="url(#exposedCarbonWeave)" stroke="#fbbf24" strokeWidth="0.8" />
      {/* High-Contrast Edge Accent */}
      <line x1="310" y1="398" x2="650" y2="398" stroke="#f59e0b" strokeWidth="1.5" />
    </g>
  );
};
