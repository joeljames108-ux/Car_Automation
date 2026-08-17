// ===================================================================
// FRAMELESS SIDE DOOR WINDOWS SVG ISOMETRIC RENDERER
// ===================================================================

import React from "react";
import type { GlassConfig } from "../../../../sim/types/exterior";

interface SideGlassSVGProps {
  glassConfig?: Partial<GlassConfig>;
  isHovered?: boolean;
  isSelected?: boolean;
  isInstalled?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const SideGlassSVG: React.FC<SideGlassSVGProps> = ({
  glassConfig,
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
      id="side_door_glass_assembly"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Frameless Door Glass Polygon */}
      <polygon
        points="405,275 442,203 528,203 552,275"
        fill="#0284c7"
        fillOpacity="0.25"
        stroke={strokeColor}
        strokeWidth="1.0"
      />
      {/* Glass Sky Streak */}
      <line x1="420" y1="260" x2="520" y2="210" stroke="#ffffff" strokeWidth="1.8" strokeOpacity="0.55" />
    </g>
  );
};
