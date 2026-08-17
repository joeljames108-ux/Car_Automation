// ===================================================================
// EXTERIOR TRIM, GRILLES, EXHAUST & BADGES SVG RENDERER
// ===================================================================

import React from "react";

interface TrimDetailsSVGProps {
  type: "grille" | "exhaust" | "handles" | "badges";
  isHovered?: boolean;
  isSelected?: boolean;
  opacity?: number;
  transform?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const TrimDetailsSVG: React.FC<TrimDetailsSVGProps> = ({
  type,
  isHovered = false,
  isSelected = false,
  opacity = 1.0,
  transform = "",
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const strokeColor = isSelected ? "#38bdf8" : isHovered ? "#0284c7" : "#020617";

  return (
    <g
      id={`trim_detail_${type}`}
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {type === "grille" && (
        <g id="titanium_grille_mesh">
          <polygon points="185,342 215,328 220,348 190,358" fill="none" stroke="#64748b" strokeWidth="0.8" strokeDasharray="2 2" />
        </g>
      )}

      {type === "exhaust" && (
        <g id="quad_inconel_exhaust_tips">
          <ellipse cx="765" cy="335" rx="5" ry="3" fill="#d97706" stroke="#fbbf24" strokeWidth="1.0" />
          <ellipse cx="776" cy="340" rx="5" ry="3" fill="#d97706" stroke="#fbbf24" strokeWidth="1.0" />
        </g>
      )}

      {type === "handles" && (
        <g id="flush_door_handles">
          <rect x="510" y="295" width="32" height="7" rx="2.5" fill="#0f172a" stroke={strokeColor} strokeWidth="0.8" />
          <circle cx="516" cy="298.5" r="1.5" fill="#38bdf8" />
        </g>
      )}

      {type === "badges" && (
        <g id="milled_apex_badges">
          <polygon points="226,323 234,320 238,324 230,327" fill="#facc15" stroke="#78350f" strokeWidth="0.6" />
        </g>
      )}
    </g>
  );
};
