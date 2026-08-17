// ===================================================================
// ACTIVE SWAN-NECK CARBON REAR WING SVG ISOMETRIC RENDERER
// ===================================================================
// High-downforce dual-element airfoil with swan-neck top-mounted pylons,
// endplates, DRS actuator, and Gurney flap.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";
import type { AeroSurfaceConfig } from "../../../../sim/types/exterior";

interface RearWingSVGProps {
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

export const RearWingSVG: React.FC<RearWingSVGProps> = ({
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
  const aoa = aeroConfig?.wingAngleOfAttackDeg || 14;
  const aoaOffset = Math.round((aoa / 32) * 8);

  const strokeColor = isSelected
    ? "#38bdf8"
    : isHovered
    ? "#0284c7"
    : "#020617";

  const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.2;

  return (
    <g
      id="rear_wing_spoiler_assembly"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. Swan-Neck Top-Mount Pylons (LH & RH) ── */}
      <g id="swan_neck_pylons">
        {/* Left Pylon Arch */}
        <path
          d="M670,250 C665,200 680,165 700,165 L705,170 C690,170 675,205 680,250 Z"
          fill="url(#exposedCarbonWeave)"
          stroke="#0f172a"
          strokeWidth="0.8"
        />
        {/* Right Pylon Arch */}
        <path
          d="M720,265 C715,215 730,180 750,180 L755,185 C740,185 725,220 730,265 Z"
          fill="url(#exposedCarbonWeave)"
          stroke="#0f172a"
          strokeWidth="0.8"
        />
      </g>

      {/* ── 2. Main Carbon Airfoil Wing Blade ── */}
      <polygon
        points={`660,170 780,185 810,${200 + aoaOffset} 690,${185 + aoaOffset}`}
        fill="url(#exposedCarbonWeave)"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        filter="url(#shutLineShadow)"
      />

      {/* ── 3. High-Downforce Gurney Flap Strip ── */}
      <line
        x1="690"
        y1={185 + aoaOffset}
        x2="810"
        y2={200 + aoaOffset}
        stroke="#f59e0b"
        strokeWidth="2.5"
      />

      {/* ── 4. Vertical Aerodynamic Endplates (LH & RH) ── */}
      {/* Left Endplate */}
      <polygon
        points="650,150 675,153 695,205 670,202"
        fill="url(#exposedCarbonWeave)"
        stroke="#38bdf8"
        strokeWidth="1.2"
      />
      {/* Right Endplate */}
      <polygon
        points="785,165 810,168 830,220 805,217"
        fill="url(#exposedCarbonWeave)"
        stroke="#38bdf8"
        strokeWidth="1.2"
      />

      {/* ── 5. DRS Actuator Mechanism Pod ── */}
      <ellipse cx="735" cy="180" rx="6" ry="3.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.8" />
    </g>
  );
};
