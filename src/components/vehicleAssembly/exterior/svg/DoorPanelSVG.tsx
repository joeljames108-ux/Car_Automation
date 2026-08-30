// ===================================================================
// BUTTERFLY / FRAMLESS DOOR PANELS SVG ISOMETRIC RENDERER
// ===================================================================
// Sculpted door outer skin with daylight opening (DLO), flush pop-out
// door handles, mirror mount boss, and side impact beam ghost view.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";
import type { ExteriorEngineeringConfig, PaintSystemConfig } from "../../../../sim/types/exterior";

interface DoorPanelSVGProps {
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

export const DoorPanelSVG: React.FC<DoorPanelSVGProps> = ({
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
      id="doors_assembly_panels"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Door Lower Outer Skin ── */}
      <polygon
        points="370,280 560,280 570,370 375,370"
        fill={getFill()}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        filter="url(#shutLineShadow)"
      />

      {/* ── 2. Upper Window Frame / DLO Arch ── */}
      <path
        d="M400,280 L440,200 L530,200 L555,280 Z"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* ── 3. High-Strength Side Impact Beam Ghost View ── */}
      <line
        x1="385"
        y1="340"
        x2="555"
        y2="310"
        stroke="url(#doorBeamGhost)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* ── 4. Flush Pop-Out Motorized Door Handle ── */}
      <rect
        x="510"
        y="295"
        width="32"
        height="7"
        rx="2.5"
        fill="#080c14"
        stroke="#475569"
        strokeWidth="0.8"
      />
      <circle cx="516" cy="298.5" r="1.5" fill="#fbbf24" />

      {/* ── 5. Beltline Chrome / Gloss Black Trim ── */}
      <line
        x1="370"
        y1="280"
        x2="560"
        y2="280"
        stroke="url(#chromeTrimLuster)"
        strokeWidth="2.0"
      />

      {/* ── 6. Mirror Mounting Triangle Boss ── */}
      <polygon
        points="385,280 405,250 410,280"
        fill="#080c14"
        stroke="#334155"
        strokeWidth="1.0"
      />

      {/* ── 7. Scalloped Side Intake Aero Channel ── */}
      <path
        d="M420,330 Q490,325 560,345"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeOpacity="0.4"
      />
    </g>
  );
};
