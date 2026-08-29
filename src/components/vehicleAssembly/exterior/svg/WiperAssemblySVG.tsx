// ===================================================================
// AERODYNAMIC WIPER ASSEMBLY & HIDDEN COWL SVG ISOMETRIC RENDERER
// ===================================================================

import React from "react";

interface WiperAssemblySVGProps {
  isHovered?: boolean;
  isSelected?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const WiperAssemblySVG: React.FC<WiperAssemblySVGProps> = ({
  isHovered = false,
  isSelected = false,
  opacity = 1.0,
  transform = "",
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const strokeColor = isSelected ? "#fbbf24" : isHovered ? "#0284c7" : "#0f172a";

  return (
    <g
      id="wiper_cowl_assembly_group"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Cowl Trough Panel */}
      <polygon points="370,265 405,275 408,272 373,262" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
      {/* Tandem Wiper Blades Parked Below Hood Line */}
      <line x1="375" y1="264" x2="430" y2="230" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="375" cy="264" r="2.5" fill="#475569" />
    </g>
  );
};
