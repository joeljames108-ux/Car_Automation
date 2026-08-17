// ===================================================================
// AERODYNAMIC REAR DECKLID & TRUNK LID SVG ISOMETRIC RENDERER
// ===================================================================
// Rear decklid with integrated engine bay viewing glass, heat extraction
// slots, ducktail trailing edge, and license plate housing.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";
import type { ExteriorEngineeringConfig, PaintSystemConfig } from "../../../../sim/types/exterior";

interface TrunkLidSVGProps {
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

export const TrunkLidSVG: React.FC<TrunkLidSVGProps> = ({
  materialGrade = "billet",
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
    ? "#38bdf8"
    : isHovered
    ? "#0284c7"
    : "#020617";

  const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.2;

  return (
    <g
      id="trunk_decklid_closure"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Main Decklid Shell Polygon ── */}
      <polygon
        points="610,210 680,220 755,295 675,280"
        fill={getFill()}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        filter="url(#shutLineShadow)"
      />

      {/* ── 2. Engine Bay Viewing Glass Port (Gorilla Glass) ── */}
      <polygon
        points="625,225 665,230 695,270 655,265"
        fill="#0284c7"
        fillOpacity="0.25"
        stroke="#38bdf8"
        strokeWidth="1.0"
      />
      {/* Glass Specular Reflection Streak */}
      <line x1="630" y1="230" x2="685" y2="265" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.6" />

      {/* ── 3. Heat Extraction Louvers Behind Glass ── */}
      <g id="decklid_cooling_louvers">
        <line x1="680" y1="272" x2="720" y2="280" stroke="#0f172a" strokeWidth="2.0" />
        <line x1="685" y1="276" x2="725" y2="284" stroke="#0f172a" strokeWidth="2.0" />
        <line x1="690" y1="280" x2="730" y2="288" stroke="#0f172a" strokeWidth="2.0" />
      </g>

      {/* ── 4. Ducktail Aerodynamic Trailing Lip ── */}
      <path
        d="M675,280 L755,295"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.0"
        strokeOpacity="0.75"
      />
    </g>
  );
};
