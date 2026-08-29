// ===================================================================
// CURVED ACOUSTIC LAMINATED WINDSHIELD SVG ISOMETRIC RENDERER
// ===================================================================
// Windshield glass with black ceramic frit dot matrix border,
// rain sensor / ADAS camera bracket, and specular environment reflection.
// ===================================================================

import React from "react";
import type { GlassConfig } from "../../../../sim/types/exterior";

interface WindshieldSVGProps {
  glassConfig?: Partial<GlassConfig>;
  isHovered?: boolean;
  isSelected?: boolean;
  isInstalled?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const WindshieldSVG: React.FC<WindshieldSVGProps> = ({
  glassConfig,
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

  return (
    <g
      id="windshield_glass_assembly"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Main Laminated Windshield Glass Sheet ── */}
      <polygon
        points="380,260 410,270 450,210 435,190"
        fill="#0284c7"
        fillOpacity="0.30"
        stroke={strokeColor}
        strokeWidth="1.2"
        filter="url(#shutLineShadow)"
      />

      {/* ── 2. Black Ceramic Frit Border Band (Dot Matrix) ── */}
      <polygon
        points="382,260 408,269 448,212 437,193"
        fill="none"
        stroke="#020617"
        strokeWidth="3.5"
      />

      {/* ── 3. ADAS Forward Camera & Rain Sensor Housing ── */}
      <polygon
        points="435,192 443,195 440,202 432,199"
        fill="#0f172a"
        stroke="#334155"
        strokeWidth="0.8"
      />
      <circle cx="437" cy="197" r="1.5" fill="#fbbf24" />

      {/* ── 4. Diagonal Specular Environment Sky Reflection ── */}
      <line
        x1="388"
        y1="258"
        x2="445"
        y2="198"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeOpacity="0.65"
      />
    </g>
  );
};
