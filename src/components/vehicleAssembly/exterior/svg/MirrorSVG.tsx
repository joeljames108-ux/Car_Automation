// ===================================================================
// AERODYNAMIC STALK SIDE MIRRORS SVG ISOMETRIC RENDERER
// ===================================================================

import React from "react";

interface MirrorSVGProps {
  isHovered?: boolean;
  isSelected?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const MirrorSVG: React.FC<MirrorSVGProps> = ({
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
      id="side_mirrors_assembly"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Aerodynamic Stalk Pylon */}
      <line x1="400" y1="260" x2="385" y2="245" stroke="#1a1008" strokeWidth="2.5" strokeLinecap="round" />
      {/* Mirror Shell Housing */}
      <ellipse cx="385" cy="242" rx="12" ry="7" fill="url(#exposedCarbonWeave)" stroke={strokeColor} strokeWidth="1.0" />
      {/* Integrated Amber LED Turn Signal Blade */}
      <path d="M375,242 L395,242" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
      {/* Mirror Glass Face Reflection */}
      <ellipse cx="385" cy="242" rx="10" ry="5.5" fill="#fbbf24" fillOpacity="0.3" />
    </g>
  );
};
