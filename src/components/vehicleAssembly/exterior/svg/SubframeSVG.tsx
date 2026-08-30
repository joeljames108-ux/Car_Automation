// ===================================================================
// SUBFRAME & CRADLE SVG ISOMETRIC RENDERER
// ===================================================================
// Photorealistic front and rear subframes with steering rack mounts,
// lower A-arm pivot bushings, differential cradle, and crash cans.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";

interface SubframeSVGProps {
  type: "front" | "rear";
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

export const SubframeSVG: React.FC<SubframeSVGProps> = ({
  type,
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
    : "#1a1008";

  const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.2;

  return (
    <g
      id={`subframe_${type}`}
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {type === "front" ? (
        // ── FRONT SUBFRAME ASSEMBLY ──
        <g id="front_subframe_cradle">
          {/* Main Transverse Crossmember */}
          <path
            d="M210 330 L310 330 L325 350 L195 350 Z"
            fill={getGradientId()}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Left Longitudinal Rail */}
          <path
            d="M195 350 L210 330 L210 290 L195 310 Z"
            fill={getGradientId()}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Right Longitudinal Rail */}
          <path
            d="M310 330 L325 350 L325 310 L310 290 Z"
            fill={getGradientId()}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />

          {/* Steering Rack Housing Boss */}
          <rect
            x="235"
            y="332"
            width="50"
            height="12"
            rx="3"
            fill="#334155"
            stroke="#64748b"
            strokeWidth="1"
          />
          <circle cx="245" cy="338" r="3" fill="#94a3b8" />
          <circle cx="275" cy="338" r="3" fill="#94a3b8" />

          {/* Lower Wishbone Pivot Cleavises (LH & RH) */}
          <rect x="185" y="342" width="12" height="10" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="323" y="342" width="12" height="10" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />

          {/* Front Crash Can Buckle Initiators */}
          <path d="M190 295 L180 290 L180 305 L190 300 Z" fill="#64748b" stroke="#334155" strokeWidth="0.8" />
          <path d="M330 295 L340 290 L340 305 L330 300 Z" fill="#64748b" stroke="#334155" strokeWidth="0.8" />

          {/* Fastener Studs */}
          <circle cx="215" cy="300" r="3" fill="url(#chassisNodeBolt)" />
          <circle cx="305" cy="300" r="3" fill="url(#chassisNodeBolt)" />
          <circle cx="205" cy="345" r="3" fill="url(#chassisNodeBolt)" />
          <circle cx="315" cy="345" r="3" fill="url(#chassisNodeBolt)" />
        </g>
      ) : (
        // ── REAR SUBFRAME ASSEMBLY ──
        <g id="rear_subframe_cradle">
          {/* Main Rear Transverse Box Crossmember */}
          <path
            d="M650 330 L750 330 L765 350 L635 350 Z"
            fill={getGradientId()}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Left Rear Longitudinal Arm */}
          <path
            d="M635 350 L650 330 L650 290 L635 310 Z"
            fill={getGradientId()}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Right Rear Longitudinal Arm */}
          <path
            d="M750 330 L765 350 L765 310 L750 290 Z"
            fill={getGradientId()}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />

          {/* Differential Mount Cradle Carrier */}
          <ellipse
            cx="700"
            cy="338"
            rx="22"
            ry="14"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="1.2"
          />
          <circle cx="690" cy="338" r="4" fill="url(#chassisNodeBolt)" />
          <circle cx="710" cy="338" r="4" fill="url(#chassisNodeBolt)" />

          {/* Multilink Lateral Pickup Points */}
          <rect x="625" y="338" width="12" height="14" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="763" y="338" width="12" height="14" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="0.8" />

          {/* Subframe-to-Monocoque Bushing Nodes */}
          <circle cx="655" cy="300" r="4.5" fill="url(#chassisNodeBolt)" />
          <circle cx="745" cy="300" r="4.5" fill="url(#chassisNodeBolt)" />
          <circle cx="645" cy="345" r="4.5" fill="url(#chassisNodeBolt)" />
          <circle cx="755" cy="345" r="4.5" fill="url(#chassisNodeBolt)" />
        </g>
      )}

      {/* Hover Pulse Halo */}
      {isHovered && (
        <circle
          cx={type === "front" ? 260 : 700}
          cy={340}
          r="45"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="animate-spin"
        />
      )}
    </g>
  );
};
