// ===================================================================
// REAR 5-LINK MULTILINK & PUSHROD SUSPENSION SVG ISOMETRIC RENDERER
// ===================================================================
// Independent multilink geometry with pushrod rocker, trailing arms,
// toe control links, and active damper reservoir.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";

interface RearSuspensionSVGProps {
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

export const RearSuspensionSVG: React.FC<RearSuspensionSVGProps> = ({
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
  const strokeColor = isSelected ? "#38bdf8" : isHovered ? "#0284c7" : "#020617";
  const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.2;

  return (
    <g
      id="suspension_rear_assembly_subsystem"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Upper Camber Link ── */}
      <line x1="680" y1="330" x2="715" y2="325" stroke="url(#chassisRailAluminum)" strokeWidth="3.5" />
      <circle cx="680" cy="330" r="3" fill="#f59e0b" />
      <circle cx="715" cy="325" r="3" fill="#f59e0b" />

      {/* ── 2. Lower Track Control Link ── */}
      <line x1="670" y1="355" x2="725" y2="355" stroke="url(#chassisRailAluminum)" strokeWidth="4.0" />
      <circle cx="670" cy="355" r="3.5" fill="#f59e0b" />
      <circle cx="725" cy="355" r="3.5" fill="#f59e0b" />

      {/* ── 3. Trailing Arm Longitudinal Link ── */}
      <line x1="625" y1="365" x2="720" y2="358" stroke="#64748b" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="625" cy="365" r="4.5" fill="url(#chassisNodeBolt)" />

      {/* ── 4. Pushrod Damper & Remote Reservoir ── */}
      <g id="rear_pushrod_rocker">
        <line x1="710" y1="355" x2="685" y2="315" stroke="#cbd5e1" strokeWidth="3.0" />
        {/* Bellcrank Rocker Pivot */}
        <polygon points="682,312 690,312 686,320" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.8" />
        <circle cx="686" cy="315" r="2.5" fill="#f59e0b" />
        {/* Inboard Horizontal Damper */}
        <rect x="655" y="312" width="28" height="6" rx="2" fill="#eab308" stroke="#a16207" strokeWidth="0.8" />
      </g>

      {/* ── 5. Toe Control Link with Eccentric Bolt ── */}
      <line x1="685" y1="345" x2="720" y2="345" stroke="#94a3b8" strokeWidth="2.2" />
      <circle cx="685" cy="345" r="2.5" fill="#0284c7" />
    </g>
  );
};
