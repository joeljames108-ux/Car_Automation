// ===================================================================
// AERO-SCULPTED HOOD PANEL SVG ISOMETRIC RENDERER
// ===================================================================
// Double-skinned hood with dual extraction louvers, power bulge,
// shut-line perimeter gaps, and hinge mounting flanges.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";
import type { ExteriorEngineeringConfig, PaintSystemConfig } from "../../../../sim/types/exterior";

interface HoodPanelSVGProps {
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

export const HoodPanelSVG: React.FC<HoodPanelSVGProps> = ({
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
    ? "#fbbf24"
    : isHovered
    ? "#0284c7"
    : "#020617";

  const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.2;

  return (
    <g
      id="hood_panel_closure"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Main Hood Outer Skin Polygon ── */}
      <polygon
        points="220,310 380,260 410,270 230,340"
        fill={getFill()}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        filter="url(#shutLineShadow)"
      />

      {/* ── 2. Clear Coat Surface Specular Glaze ── */}
      <polygon
        points="220,310 380,260 395,265 225,325"
        fill="url(#clearCoatGlaze)"
        opacity="0.75"
      />

      {/* ── 3. Dual Radiator Extraction Louvers (LH & RH) ── */}
      <g id="hood_heat_extraction_louvers">
        {/* Left Vent Gills */}
        <path d="M270,300 L300,290 L305,294 L275,304 Z" fill="#080c14" stroke="#334155" strokeWidth="0.8" />
        <path d="M280,305 L310,295 L315,299 L285,309 Z" fill="#080c14" stroke="#334155" strokeWidth="0.8" />
        <path d="M290,310 L320,300 L325,304 L295,314 Z" fill="#080c14" stroke="#334155" strokeWidth="0.8" />

        {/* Right Vent Gills */}
        <path d="M285,280 L315,270 L320,274 L290,284 Z" fill="#080c14" stroke="#334155" strokeWidth="0.8" />
        <path d="M295,285 L325,275 L330,279 L300,289 Z" fill="#080c14" stroke="#334155" strokeWidth="0.8" />
      </g>

      {/* ── 4. Center Power Bulge Crease Line ── */}
      <path
        d="M225,325 L395,265"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.0"
        strokeOpacity="0.4"
      />

      {/* ── 5. Apex Emblem Nose Mount ── */}
      <polygon
        points="226,323 234,320 238,324 230,327"
        fill="#facc15"
        stroke="#78350f"
        strokeWidth="0.6"
      />

      {/* ── 6. Hover Highlight Halo ── */}
      {isHovered && (
        <polygon
          points="215,305 385,255 415,265 225,345"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeDasharray="6 3"
        />
      )}
    </g>
  );
};
