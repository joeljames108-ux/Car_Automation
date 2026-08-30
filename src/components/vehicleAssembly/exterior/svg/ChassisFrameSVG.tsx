// ===================================================================
// MASTER SEDAN UNIBODY CHASSIS FRAME SVG ISOMETRIC RENDERER
// ===================================================================
// Photorealistic isometric 3D-projected SVG chassis skeleton featuring
// front hydroformed crash rails, shock towers with diagonal cowl braces,
// A/B/C pillar safety rings, corrugated floor pan with tunnel, panoramic roof bows,
// rear parcel shelf X-braces, and rear longitudinal rails.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";
import type { ExteriorEngineeringConfig } from "../../../../sim/types/exterior";

interface ChassisFrameSVGProps {
  materialGrade?: MaterialGrade;
  exteriorConfig?: Partial<ExteriorEngineeringConfig>;
  isHovered?: boolean;
  isSelected?: boolean;
  isInstalled?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ChassisFrameSVG: React.FC<ChassisFrameSVGProps> = ({
  materialGrade = "billet",
  exteriorConfig,
  isHovered = false,
  isSelected = false,
  isInstalled = true,
  opacity = 1.0,
  transform = "",
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const getGradientId = () => {
    if (materialGrade === "cast") return "url(#chassisRailSteel)";
    if (materialGrade === "forged") return "url(#chassisRailAluminum)";
    if (materialGrade === "billet") return "url(#chassisRailCarbon)";
    if (materialGrade === "titanium") return "url(#chassisRailTitanium)";
    return "url(#chassisRailAluminum)";
  };

  const strokeColor = isSelected
    ? "#fbbf24"
    : isHovered
    ? "#0284c7"
    : "#1e293b";

  const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.2;

  return (
    <g
      id="sedan_chassis_frame_master"
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── 1. FRONT CRASH RAILS & RADIATOR YOKE ── */}
      <g id="sedan_front_crash_structure">
        {/* Left Front Longitudinal Rail */}
        <polygon
          points="140,350 240,335 245,350 145,365"
          fill={getGradientId()}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Right Front Longitudinal Rail */}
        <polygon
          points="180,380 270,365 275,378 185,392"
          fill={getGradientId()}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Front Bumper Beam Crossmember */}
        <polygon
          points="130,345 145,340 190,378 175,385"
          fill="url(#chassisFloorPanGrad)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Radiator Core Support Yoke */}
        <path
          d="M 140 330 L 140 305 L 180 340 L 180 365"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </g>

      {/* ── 2. STAMPED FRONT SHOCK TOWERS & COWL BRACES ── */}
      <g id="sedan_front_shock_towers">
        {/* Left Shock Tower Dome */}
        <ellipse cx="265" cy="305" rx="22" ry="14" fill={getGradientId()} stroke={strokeColor} strokeWidth={strokeWidth} />
        <circle cx="265" cy="305" r="5" fill="#1a1008" stroke="#64748b" strokeWidth="1" />

        {/* Right Shock Tower Dome */}
        <ellipse cx="305" cy="345" rx="20" ry="12" fill={getGradientId()} stroke={strokeColor} strokeWidth={strokeWidth} />
        <circle cx="305" cy="345" r="4" fill="#1a1008" stroke="#64748b" strokeWidth="1" />

        {/* Diagonal Strut Braces to Cowl */}
        <line x1="265" y1="305" x2="350" y2="255" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="305" y1="345" x2="375" y2="295" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
      </g>

      {/* ── 3. STEPPED FIREWALL & COWL BULKHEAD ── */}
      <g id="sedan_firewall_bulkhead">
        <polygon
          points="340,245 400,230 425,340 360,360"
          fill="url(#chassisFloorPanGrad)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Bellhousing Tunnel Pocket Relief */}
        <path
          d="M 370 330 C 370 310, 395 305, 395 325 L 395 350 L 370 355 Z"
          fill="#090d16"
          stroke="#fbbf24"
          strokeWidth="0.8"
        />
      </g>

      {/* ── 4. CORRUGATED FLOOR PAN & DRIVELINE TUNNEL ── */}
      <g id="sedan_floor_pan_corrugated">
        <polygon
          points="350,355 710,350 760,390 380,395"
          fill="url(#chassisFloorPanGrad)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Longitudinal Corrugation Swages */}
        <line x1="390" y1="365" x2="700" y2="360" stroke="#475569" strokeWidth="1.2" strokeDasharray="8 4" />
        <line x1="410" y1="380" x2="730" y2="375" stroke="#475569" strokeWidth="1.2" strokeDasharray="8 4" />

        {/* Central Transmission Tunnel */}
        <polygon
          points="385,348 700,342 710,356 395,362"
          fill="url(#chassisTunnelGlow)"
          stroke="#0284c7"
          strokeWidth="1.0"
        />

        {/* Front & Rear Seat Crossmember Mounting Bridges */}
        <line x1="440" y1="345" x2="465" y2="390" stroke="#94a3b8" strokeWidth="3" strokeLinecap="square" />
        <line x1="560" y1="345" x2="585" y2="388" stroke="#94a3b8" strokeWidth="3" strokeLinecap="square" />
      </g>

      {/* ── 5. MULTI-CHAMBER SILL BEAMS (ROCKER RAILS) ── */}
      <g id="sedan_rocker_sill_beams">
        {/* Left Sill Beam */}
        <polygon
          points="340,355 720,350 725,366 335,372"
          fill={getGradientId()}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Right Sill Beam */}
        <polygon
          points="375,395 765,390 770,406 370,412"
          fill={getGradientId()}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </g>

      {/* ── 6. CABIN SAFETY RING (A, B, C PILLARS & CANT RAILS) ── */}
      <g id="sedan_cabin_pillars">
        {/* Swept A-Pillars */}
        <polygon
          points="350,245 425,175 435,178 360,250"
          fill={getGradientId()}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Structural Center B-Pillars */}
        <polygon
          points="490,245 505,170 518,170 500,245"
          fill={getGradientId()}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Swept Fastback C-Pillars */}
        <polygon
          points="620,240 660,180 675,185 632,245"
          fill={getGradientId()}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Roof Cant Rails Linking A to C Pillars */}
        <polygon
          points="425,175 660,180 660,192 425,185"
          fill={getGradientId()}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </g>

      {/* ── 7. ROOF FRAMEWORK & REAR PARCEL SHELF X-BRACE ── */}
      <g id="sedan_roof_bulkhead">
        {/* Front Windshield Upper Header */}
        <line x1="425" y1="175" x2="475" y2="200" stroke="#94a3b8" strokeWidth="2.5" />
        {/* Center Panoramic Roof Cross-Bow */}
        <line x1="505" y1="170" x2="550" y2="195" stroke="#94a3b8" strokeWidth="2.0" />
        {/* Rear Window Header */}
        <line x1="660" y1="180" x2="695" y2="205" stroke="#94a3b8" strokeWidth="2.5" />

        {/* Stamped Rear Parcel Shelf Deck */}
        <polygon
          points="630,245 710,240 735,280 655,285"
          fill="url(#chassisFloorPanGrad)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* Rear Bulkhead Structural X-Brace (Matching Photos) */}
        <line x1="640" y1="245" x2="725" y2="280" stroke="#fbbf24" strokeWidth="2.0" />
        <line x1="710" y1="240" x2="655" y2="285" stroke="#fbbf24" strokeWidth="2.0" />
      </g>

      {/* ── 8. REAR WHEELHOUSES, TRUNK & REAR CRASH RAILS ── */}
      <g id="sedan_rear_substructure">
        {/* Left Rear Wheelhouse Arch */}
        <path
          d="M 680 350 C 680 300, 750 300, 750 350 Z"
          fill={getGradientId()}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Rear Longitudinal Rails */}
        <polygon
          points="730,350 820,345 825,358 735,364"
          fill={getGradientId()}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Rear Bumper Beam Bar */}
        <polygon
          points="815,342 830,340 850,375 835,378"
          fill="url(#chassisFloorPanGrad)"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </g>

      {/* ── 9. Interactive Selection Glow ── */}
      {isSelected && (
        <rect
          x="120"
          y="160"
          width="740"
          height="260"
          rx="16"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeDasharray="8 4"
          className="animate-pulse"
        />
      )}
    </g>
  );
};
