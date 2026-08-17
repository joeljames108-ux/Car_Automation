// ===================================================================
// A/B/C PILLARS & GREENHOUSE STRUCTURE SVG ISOMETRIC RENDERER
// ===================================================================
// Structural pillars linking chassis tub with roof frame, windshield
// flange, and quarter window apertures.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";

interface PillarSVGProps {
  pillarType: "a_pillar" | "b_pillar" | "c_pillar";
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

export const PillarSVG: React.FC<PillarSVGProps> = ({
  pillarType,
  materialGrade = "billet",
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
    return "url(#chassisRailCarbon)";
  };

  const strokeColor = isSelected
    ? "#38bdf8"
    : isHovered
    ? "#0284c7"
    : "#020617";

  const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.2;

  return (
    <g
      id={`pillar_${pillarType}`}
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {pillarType === "a_pillar" && (
        <g id="a_pillar_left_structure">
          <path
            d="M380,260 L435,190 L445,195 L390,265 Z"
            fill={getGradientId()}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Windshield bonding flange channel */}
          <line x1="388" y1="262" x2="442" y2="193" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="3 2" />
        </g>
      )}

      {pillarType === "b_pillar" && (
        <g id="b_pillar_center_structure">
          <path
            d="M485,260 L495,188 L505,188 L495,260 Z"
            fill={getGradientId()}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Seatbelt upper anchor mount */}
          <circle cx="497" cy="210" r="3" fill="url(#chassisNodeBolt)" />
        </g>
      )}

      {pillarType === "c_pillar" && (
        <g id="c_pillar_rear_structure">
          <path
            d="M575,260 L615,200 L625,205 L585,265 Z"
            fill={getGradientId()}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Quarter glass border flange */}
          <line x1="578" y1="258" x2="618" y2="202" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="3 2" />
        </g>
      )}
    </g>
  );
};
