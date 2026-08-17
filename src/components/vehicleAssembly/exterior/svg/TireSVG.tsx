// ===================================================================
// MOTORSPORT TRACK TIRES SVG ISOMETRIC RENDERER
// ===================================================================
// Low-profile ultra-high performance track tires with yellow/white
// sidewall branding, tread compound grooves, and contact patch lip.
// ===================================================================

import React from "react";
import type { ExteriorTireConfig } from "../../../../sim/types/exterior";

interface TireSVGProps {
  position: "front" | "rear";
  tireConfig?: Partial<ExteriorTireConfig>;
  isHovered?: boolean;
  isSelected?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const TireSVG: React.FC<TireSVGProps> = ({
  position,
  tireConfig,
  isHovered = false,
  isSelected = false,
  opacity = 1.0,
  transform = "",
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const cx = position === "front" ? 265 : 695;
  const cy = 350;
  const outerR = position === "front" ? 56 : 60;
  const innerR = position === "front" ? 42 : 46;

  return (
    <g
      id={`tire_${position}_rubber`}
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Outer Tire Rubber Donut ── */}
      <circle cx={cx} cy={cy} r={outerR} fill="url(#tireRubberTread)" stroke="#0f172a" strokeWidth="2.0" />

      {/* Rim Bead Seat Cutout */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#020617" strokeWidth="1.5" />

      {/* ── 2. Pirelli/Michelin Yellow F1 Sidewall Stencil ── */}
      <path
        d={`M${cx - 32},${cy - innerR - 3} A ${innerR + 3},${innerR + 3} 0 0,1 ${cx + 32},${cy - innerR - 3}`}
        fill="none"
        stroke="#facc15"
        strokeWidth="2.2"
        strokeDasharray="14 8"
      />

      {/* ── 3. Contact Patch Ground Flatness ── */}
      <line
        x1={cx - 28}
        y1={cy + outerR}
        x2={cx + 28}
        y2={cy + outerR}
        stroke="#020617"
        strokeWidth="3.0"
        strokeLinecap="round"
      />
    </g>
  );
};
