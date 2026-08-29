// ===================================================================
// LOWER BUMPER FOG & DRL PROJECTOR LIGHTS SVG RENDERER
// ===================================================================

import React from "react";

interface FogLightSVGProps {
  isHovered?: boolean;
  isSelected?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const FogLightSVG: React.FC<FogLightSVGProps> = ({
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
      id="fog_drl_lights_assembly"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <circle cx="218" cy="342" r="5" fill="#0f172a" stroke={strokeColor} strokeWidth="1.0" />
      <circle cx="218" cy="342" r="3.5" fill="#fbbf24" filter="url(#opticalLightBloom)" />
      <circle cx="218" cy="342" r="1.8" fill="#ffffff" />
    </g>
  );
};
