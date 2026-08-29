// ===================================================================
// WIDEBODY REAR QUARTER PANEL SVG ISOMETRIC RENDERER
// ===================================================================
// Muscular rear haunches with wheel arch lips, intercooler intake ducts,
// and flush circular fuel filler door.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";
import type { ExteriorEngineeringConfig, PaintSystemConfig } from "../../../../sim/types/exterior";

interface RearQuarterSVGProps {
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

export const RearQuarterSVG: React.FC<RearQuarterSVGProps> = ({
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
      id="rear_quarter_panels_assembly"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Main Rear Quarter Haunch Panel ── */}
      <path
        d="M560,280 L620,210 L680,220 L760,300 L765,345 L745,345 A 50,50 0 0,0 650,345 L570,370 Z"
        fill={getFill()}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        filter="url(#shutLineShadow)"
      />

      {/* ── 2. Rear Wheel Arch Flare Lip ── */}
      <path
        d="M650,345 A 50,50 0 0,1 745,345"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeOpacity="0.5"
      />

      {/* ── 3. Flush Circular Billet Fuel Filler Door ── */}
      <circle
        cx="630"
        cy="245"
        r="9"
        fill="#0f172a"
        stroke="url(#chromeTrimLuster)"
        strokeWidth="1.2"
      />
      <circle cx="630" cy="245" r="7" fill={getFill()} />
      <circle cx="636" cy="245" r="1.2" fill="#94a3b8" />

      {/* ── 4. Muscular Shoulder Line Specular Highlight ── */}
      <path
        d="M565,282 Q630,240 755,298"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeOpacity="0.65"
      />

      {/* ── 5. Side Pod Intercooler Inlet Scoop Recess ── */}
      <polygon
        points="575,300 590,290 592,320 577,325"
        fill="#020617"
        stroke="#1e293b"
        strokeWidth="0.8"
      />
    </g>
  );
};
