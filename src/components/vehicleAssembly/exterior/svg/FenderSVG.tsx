// ===================================================================
// SCULPTED FRONT FENDER SVG ISOMETRIC RENDERER
// ===================================================================
// Front fender outer skin with wheel arch cutouts, top pressure-relief
// louvers, side marker lights, and shut-line perimeter matching.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";
import type { ExteriorEngineeringConfig, PaintSystemConfig } from "../../../../sim/types/exterior";

interface FenderSVGProps {
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

export const FenderSVG: React.FC<FenderSVGProps> = ({
  materialGrade = "forged",
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
      id="front_fenders_assembly"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Front Left Fender Main Skin ── */}
      <path
        d="M200,320 L270,290 L360,280 L370,340 L310,340 A 45,45 0 0,0 220,340 L195,345 Z"
        fill={getFill()}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        filter="url(#shutLineShadow)"
      />

      {/* ── 2. Wheel Arch Lip Flare Flange ── */}
      <path
        d="M220,340 A 45,45 0 0,1 310,340"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeOpacity="0.5"
      />

      {/* ── 3. Fender Top Pressure Relief Louvers ── */}
      <g id="fender_arch_gills">
        <line x1="250" y1="295" x2="260" y2="300" stroke="#080c14" strokeWidth="1.5" />
        <line x1="260" y1="292" x2="270" y2="297" stroke="#080c14" strokeWidth="1.5" />
        <line x1="270" y1="289" x2="280" y2="294" stroke="#080c14" strokeWidth="1.5" />
        <line x1="280" y1="286" x2="290" y2="291" stroke="#080c14" strokeWidth="1.5" />
      </g>

      {/* ── 4. Amber LED Side Marker Turn Indicator ── */}
      <rect
        x="210"
        y="325"
        width="14"
        height="3.5"
        rx="1.5"
        fill="#f59e0b"
        stroke="#b45309"
        strokeWidth="0.5"
      />

      {/* ── 5. Specular Reflection Sweep ── */}
      <path
        d="M205,322 L268,293 L355,283"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
    </g>
  );
};
