// ===================================================================
// HEATED REAR WINDOW BACKLITE GLASS SVG ISOMETRIC RENDERER
// ===================================================================

import React from "react";
import type { GlassConfig } from "../../../../sim/types/exterior";

interface RearWindowSVGProps {
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

export const RearWindowSVG: React.FC<RearWindowSVGProps> = ({
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
  const strokeColor = isSelected ? "#fbbf24" : isHovered ? "#0284c7" : "#020617";

  return (
    <g
      id="rear_window_backlite_assembly"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Rear Backlite Glass Polygon */}
      <polygon
        points="535,190 610,210 680,220 610,210"
        fill="#0284c7"
        fillOpacity="0.30"
        stroke={strokeColor}
        strokeWidth="1.0"
      />
      {/* Micro-Tungsten Defrost Lines */}
      <line x1="550" y1="195" x2="620" y2="212" stroke="#b45309" strokeWidth="0.5" strokeOpacity="0.7" />
      <line x1="560" y1="198" x2="630" y2="215" stroke="#b45309" strokeWidth="0.5" strokeOpacity="0.7" />
    </g>
  );
};
