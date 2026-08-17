// ===================================================================
// FORGED MONOBLOCK WHEELS SVG ISOMETRIC RENDERER
// ===================================================================
// 20/21 inch centerlock forged monoblock wheel rims with spoke geometry,
// center lock nut, and machined rim lip.
// ===================================================================

import React from "react";
import type { ExteriorWheelConfig } from "../../../../sim/types/exterior";

interface WheelSVGProps {
  position: "front" | "rear";
  wheelConfig?: Partial<ExteriorWheelConfig>;
  isHovered?: boolean;
  isSelected?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const WheelSVG: React.FC<WheelSVGProps> = ({
  position,
  wheelConfig,
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
  const r = position === "front" ? 42 : 46;

  const wheelFill = wheelConfig?.finish === "satin_bronze" ? "url(#wheelSatinBronze)" : "url(#wheelJetBlack)";

  return (
    <g
      id={`wheel_${position}_rim`}
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Outer Wheel Rim Barrel ── */}
      <circle cx={cx} cy={cy} r={r} fill="#090d16" stroke="#475569" strokeWidth="2.0" />

      {/* ── 2. 5-Split Spoke Monoblock Architecture ── */}
      <g id="wheel_spokes" stroke={wheelFill} strokeWidth="5" strokeLinecap="round">
        <line x1={cx} y1={cy} x2={cx} y2={cy - r + 4} />
        <line x1={cx} y1={cy} x2={cx + r * 0.95} y2={cy - r * 0.3} />
        <line x1={cx} y1={cy} x2={cx + r * 0.58} y2={cy + r * 0.8} />
        <line x1={cx} y1={cy} x2={cx - r * 0.58} y2={cy + r * 0.8} />
        <line x1={cx} y1={cy} x2={cx - r * 0.95} y2={cy - r * 0.3} />
      </g>

      {/* ── 3. Machined Diamond-Cut Rim Lip ── */}
      <circle cx={cx} cy={cy} r={r - 2} fill="none" stroke="#ffffff" strokeWidth="1.0" strokeOpacity="0.8" />

      {/* ── 4. Red Anodized Centerlock Wheel Nut ── */}
      <circle cx={cx} cy={cy} r="8" fill="#dc2626" stroke="#991b1b" strokeWidth="1.2" />
      <polygon points={`${cx - 4},${cy - 2} ${cx + 4},${cy - 2} ${cx},${cy + 4}`} fill="#ffffff" />
    </g>
  );
};
