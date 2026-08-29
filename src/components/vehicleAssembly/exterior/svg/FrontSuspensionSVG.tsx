// ===================================================================
// FRONT DOUBLE WISHBONE SUSPENSION SVG ISOMETRIC RENDERER
// ===================================================================
// Forged aluminum upper & lower A-arms, coilover damper, ball joints,
// tie rod linkages, and adjustable sway bar.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";

interface FrontSuspensionSVGProps {
  materialGrade?: MaterialGrade;
  isHovered?: boolean;
  isSelected?: boolean;
  isInstalled?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const FrontSuspensionSVG: React.FC<FrontSuspensionSVGProps> = ({
  materialGrade = "forged",
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
  const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.2;

  return (
    <g
      id="suspension_front_assembly_subsystem"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Upper Control A-Arm ── */}
      <path
        d="M240,330 L275,325 L260,345 Z"
        fill="url(#chassisRailAluminum)"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <circle cx="275" cy="325" r="3.5" fill="#f59e0b" /> {/* Upper Ball Joint */}

      {/* ── 2. Lower Control A-Arm (Load Bearing) ── */}
      <path
        d="M225,355 L285,355 L255,370 Z"
        fill="url(#chassisRailAluminum)"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <circle cx="285" cy="355" r="4.5" fill="#f59e0b" /> {/* Lower Ball Joint */}

      {/* ── 3. Coilover Damper Body & Helical Spring ── */}
      <g id="front_coilover_spring">
        {/* Damper Shaft */}
        <line x1="260" y1="310" x2="270" y2="355" stroke="#94a3b8" strokeWidth="4" />
        {/* Yellow Racing Helical Spring Coils */}
        <path
          d="M255,318 Q265,315 270,320 T265,330 T272,340 T268,350"
          fill="none"
          stroke="#facc15"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Top Mount Pillowball */}
        <circle cx="260" cy="310" r="5" fill="#0284c7" />
      </g>

      {/* ── 4. Steering Tie Rod Linkage ── */}
      <line x1="240" y1="340" x2="278" y2="340" stroke="#cbd5e1" strokeWidth="2.5" />
      <circle cx="278" cy="340" r="2.5" fill="#f59e0b" />

      {/* ── 5. Anti-Roll Sway Bar Drop Link ── */}
      <line x1="250" y1="360" x2="255" y2="348" stroke="#fbbf24" strokeWidth="2.0" />
    </g>
  );
};
