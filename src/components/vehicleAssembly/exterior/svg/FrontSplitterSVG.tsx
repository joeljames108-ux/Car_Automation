// ===================================================================
// CARBON FIBER FRONT SPLITTER TRAY SVG ISOMETRIC RENDERER
// ===================================================================
// Extended aerodynamic splitter tray with stepped endplates, dive planes,
// and stainless steel chassis support tie rods.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";
import type { AeroSurfaceConfig } from "../../../../sim/types/exterior";

interface FrontSplitterSVGProps {
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

export const FrontSplitterSVG: React.FC<FrontSplitterSVGProps> = ({
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
  const ext = aeroConfig?.splitterExtensionMm || 110;
  // Parametric front extension scale
  const extPx = Math.round((ext / 110) * 15);

  const strokeColor = isSelected
    ? "#38bdf8"
    : isHovered
    ? "#0284c7"
    : "#020617";

  const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.2;

  return (
    <g
      id="front_splitter_tray_aero"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Main Horizontal Splitter Tray ── */}
      <polygon
        points={`${160 - extPx},355 210,335 225,355 ${175 - extPx},375`}
        fill="url(#exposedCarbonWeave)"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        filter="url(#shutLineShadow)"
      />

      {/* ── 2. Vertical Endplate Winglet ── */}
      <polygon
        points={`${160 - extPx},355 ${165 - extPx},340 ${175 - extPx},345 ${170 - extPx},360`}
        fill="url(#exposedCarbonWeave)"
        stroke="#38bdf8"
        strokeWidth="1.0"
      />

      {/* ── 3. Stainless Steel Chassis Support Tie Rods ── */}
      {aeroConfig?.splitterSupportRods && (
        <g id="splitter_support_rods">
          <line x1={175 - extPx} y1="355" x2="195" y2="335" stroke="url(#chromeTrimLuster)" strokeWidth="1.5" />
          <line x1={185 - extPx} y1="365" x2="205" y2="345" stroke="url(#chromeTrimLuster)" strokeWidth="1.5" />
          <circle cx={175 - extPx} cy="355" r="2" fill="#0284c7" />
          <circle cx="195" cy="335" r="2" fill="#0284c7" />
          <circle cx={185 - extPx} cy="365" r="2" fill="#0284c7" />
          <circle cx="205" cy="345" r="2" fill="#0284c7" />
        </g>
      )}

      {/* ── 4. Leading Edge Neon Accent Stripe ── */}
      <path
        d={`M${160 - extPx},355 L${175 - extPx},375`}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.0"
      />
    </g>
  );
};
