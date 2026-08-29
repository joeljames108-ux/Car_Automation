// ===================================================================
// MULTI-CHANNEL VENTURI REAR DIFFUSER SVG ISOMETRIC RENDERER
// ===================================================================
// Multi-channel carbon fiber diffuser expanding underbody airflow
// with vertical strakes, central rain light, and exhaust exits.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";
import type { AeroSurfaceConfig } from "../../../../sim/types/exterior";

interface RearDiffuserSVGProps {
  materialGrade?: MaterialGrade;
  aeroConfig?: Partial<AeroSurfaceConfig>;
  isHovered?: boolean;
  isSelected?: boolean;
  isInstalled?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const RearDiffuserSVG: React.FC<RearDiffuserSVGProps> = ({
  materialGrade = "billet",
  aeroConfig,
  isHovered = false,
  isSelected = false,
  isInstalled = true,
  opacity = 1.0,
  transform = "",
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const finCount = aeroConfig?.diffuserFinCount || 7;

  const strokeColor = isSelected
    ? "#fbbf24"
    : isHovered
    ? "#0284c7"
    : "#020617";

  const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.2;

  return (
    <g
      id="rear_diffuser_tunnel_aero"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Main Diffuser Underbody Expansion Tray ── */}
      <polygon
        points="740,360 790,345 805,375 755,390"
        fill="url(#exposedCarbonWeave)"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        filter="url(#shutLineShadow)"
      />

      {/* ── 2. Vertical Aerodynamic Guide Fins (Strakes) ── */}
      <g id="diffuser_strakes">
        <line x1="750" y1="365" x2="765" y2="395" stroke="#fbbf24" strokeWidth="2.0" />
        <line x1="760" y1="360" x2="775" y2="390" stroke="#fbbf24" strokeWidth="2.0" />
        <line x1="770" y1="355" x2="785" y2="385" stroke="#fbbf24" strokeWidth="2.0" />
        <line x1="780" y1="350" x2="795" y2="380" stroke="#fbbf24" strokeWidth="2.0" />
      </g>

      {/* ── 3. Central FIA Formula 1 Flashing Rain Light ── */}
      <rect
        x="768"
        y="368"
        width="14"
        height="8"
        rx="2"
        fill="#dc2626"
        stroke="#f87171"
        strokeWidth="1.0"
        className="animate-pulse"
      />

      {/* ── 4. Trailing Edge Ground Effect Seal Line ── */}
      <line x1="755" y1="390" x2="805" y2="375" stroke="#f59e0b" strokeWidth="1.5" />
    </g>
  );
};
