// ===================================================================
// HOOD & FENDER AIR EXTRACTION VENTS SVG ISOMETRIC RENDERER
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";

interface VentsSVGProps {
  materialGrade?: MaterialGrade;
  isHovered?: boolean;
  isSelected?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const VentsSVG: React.FC<VentsSVGProps> = ({
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
      id="hood_fender_vents_overlay"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* NACA Duct Inlet on Fender Cowl */}
      <polygon
        points="340,270 355,260 360,275"
        fill="#020617"
        stroke={strokeColor}
        strokeWidth="0.8"
      />
      {/* Airflow Velocity Gradient Line */}
      <line x1="345" y1="268" x2="358" y2="268" stroke="#fbbf24" strokeWidth="1.2" />
    </g>
  );
};
