// ===================================================================
// FRONT & REAR BUMPER FASCIAS SVG ISOMETRIC RENDERER
// ===================================================================
// Aerodynamic bumper fascias with integrated radiator grilles,
// parking sensors, tow hook access caps, and exhaust exits.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";
import type { ExteriorEngineeringConfig, PaintSystemConfig } from "../../../../sim/types/exterior";

interface BumperSVGProps {
  type: "front" | "rear";
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

export const BumperSVG: React.FC<BumperSVGProps> = ({
  type,
  materialGrade = "cast",
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
    ? "#38bdf8"
    : isHovered
    ? "#0284c7"
    : "#020617";

  const strokeWidth = isSelected ? 2.5 : isHovered ? 2.0 : 1.2;

  return (
    <g
      id={`bumper_fascia_${type}`}
      transform={transform}
      opacity={opacity}
      className="transition-all duration-300 cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {type === "front" ? (
        // ── FRONT BUMPER FASCIA ──
        <g id="front_bumper_group">
          {/* Main Nose Fascia Shell */}
          <polygon
            points="180,330 220,310 230,340 190,360"
            fill={getFill()}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            filter="url(#shutLineShadow)"
          />

          {/* Lower Center Radiator Grille Mouth */}
          <polygon
            points="185,342 215,328 220,348 190,358"
            fill="#020617"
            stroke="#1e293b"
            strokeWidth="0.8"
          />

          {/* Parking Ultrasonic Sensors (LH & RH) */}
          <circle cx="195" cy="335" r="1.5" fill="#334155" />
          <circle cx="210" cy="328" r="1.5" fill="#334155" />

          {/* Tow Hook Eyelet Access Cap */}
          <circle cx="188" cy="348" r="3" fill="#0f172a" stroke="#475569" strokeWidth="0.5" />
        </g>
      ) : (
        // ── REAR BUMPER FASCIA ──
        <g id="rear_bumper_group">
          {/* Main Rear Fascia Shell */}
          <polygon
            points="755,295 790,315 780,365 745,345"
            fill={getFill()}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            filter="url(#shutLineShadow)"
          />

          {/* Rear Extraction Mesh Cutout */}
          <polygon
            points="760,315 782,328 775,355 753,342"
            fill="#020617"
            stroke="#1e293b"
            strokeWidth="0.8"
          />

          {/* Ultrasonic Reversing Sensors */}
          <circle cx="765" cy="308" r="1.5" fill="#334155" />
          <circle cx="778" cy="318" r="1.5" fill="#334155" />

          {/* Rear Camera Aperture */}
          <circle cx="770" cy="305" r="2" fill="#0284c7" />
        </g>
      )}
    </g>
  );
};
