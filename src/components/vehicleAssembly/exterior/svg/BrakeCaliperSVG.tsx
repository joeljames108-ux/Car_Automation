// ===================================================================
// CARBON CERAMIC ROTORS & MONOBLOC CALIPERS SVG RENDERER
// ===================================================================
// 410mm cross-drilled matrix rotors clamped by 8-piston monobloc
// calipers with pad inspection window and braided hydraulic lines.
// ===================================================================

import React from "react";
import type { ExteriorBrakeVisualConfig } from "../../../../sim/types/exterior";

interface BrakeCaliperSVGProps {
  position: "front" | "rear";
  brakeConfig?: Partial<ExteriorBrakeVisualConfig>;
  isHovered?: boolean;
  isSelected?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const BrakeCaliperSVG: React.FC<BrakeCaliperSVGProps> = ({
  position,
  brakeConfig,
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
  const r = position === "front" ? 36 : 32;

  const caliperFill = brakeConfig?.caliperColorHex === "#dc2626" ? "url(#caliperRedGloss)" : "url(#caliperGoldGloss)";

  return (
    <g
      id={`brakes_${position}_subsystem`}
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Carbon-Ceramic Rotor Disc ── */}
      <circle cx={cx} cy={cy} r={r} fill="url(#carbonCeramicRotorFace)" stroke="#64748b" strokeWidth="1.2" />

      {/* Cross-Drilled Cooling Holes Pattern */}
      <g id="rotor_cooling_holes" opacity="0.6">
        <circle cx={cx - 18} cy={cy - 12} r="1.2" fill="#020617" />
        <circle cx={cx - 12} cy={cy - 20} r="1.2" fill="#020617" />
        <circle cx={cx + 12} cy={cy - 20} r="1.2" fill="#020617" />
        <circle cx={cx + 18} cy={cy - 12} r="1.2" fill="#020617" />
        <circle cx={cx - 18} cy={cy + 12} r="1.2" fill="#020617" />
        <circle cx={cx + 18} cy={cy + 12} r="1.2" fill="#020617" />
      </g>

      {/* Rotor Center Aluminum Hat Section */}
      <circle cx={cx} cy={cy} r="14" fill="#0f172a" stroke="#475569" strokeWidth="1.0" />
      <circle cx={cx} cy={cy} r="4" fill="url(#chassisNodeBolt)" />

      {/* ── 2. 8-Piston Monobloc Brake Caliper (Leading Edge) ── */}
      <path
        d={`M${cx - r + 4},${cy - 22} L${cx - r + 16},${cy - 26} L${cx - r + 18},${cy + 22} L${cx - r + 6},${cy + 22} Z`}
        fill={caliperFill}
        stroke="#0f172a"
        strokeWidth="1.0"
        filter="url(#shutLineShadow)"
      />

      {/* Caliper Apex Script */}
      <text x={cx - r + 8} y={cy + 2} fill="#ffffff" fontSize="5" fontWeight="bold" fontFamily="sans-serif" transform={`rotate(-90 ${cx - r + 8} ${cy + 2})`}>
        APEX
      </text>

      {/* Bleeder Valve & Braided Line Banjo */}
      <circle cx={cx - r + 10} cy={cy - 24} r="2" fill="#38bdf8" />
    </g>
  );
};
