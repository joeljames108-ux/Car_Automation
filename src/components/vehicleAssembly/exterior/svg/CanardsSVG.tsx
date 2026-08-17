// ===================================================================
// DIVE PLANES & FRONT CANARDS SVG ISOMETRIC RENDERER
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";

interface CanardsSVGProps {
  materialGrade?: MaterialGrade;
  isHovered?: boolean;
  isSelected?: boolean;
  isInstalled?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const CanardsSVG: React.FC<CanardsSVGProps> = ({
  materialGrade = "billet",
  isHovered = false,
  isSelected = false,
  opacity = 1.0,
  transform = "",
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const strokeColor = isSelected ? "#38bdf8" : isHovered ? "#0284c7" : "#020617";

  return (
    <g
      id="canards_dive_planes_group"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Upper Dive Plane */}
      <polygon
        points="195,305 220,295 230,302 205,312"
        fill="url(#exposedCarbonWeave)"
        stroke={strokeColor}
        strokeWidth="1.0"
      />
      {/* Lower Dive Plane */}
      <polygon
        points="190,320 215,310 225,317 200,327"
        fill="url(#exposedCarbonWeave)"
        stroke={strokeColor}
        strokeWidth="1.0"
      />
    </g>
  );
};
