import React from "react";
import { projectIso, ScreenPoint2D } from "../../../assembly/iso3d/isoMath";

interface IsoCarbonMonocoqueTub3DProps {
  isHovered?: boolean;
}

/**
 * Photorealistic 3D Isometric Carbon Fiber Monocoque Tub
 * Formula-1 / Le Mans Hypercar Safety Cell
 */
export const IsoCarbonMonocoqueTub3D: React.FC<IsoCarbonMonocoqueTub3DProps> = ({
  isHovered = false,
}) => {
  const origin: ScreenPoint2D = { x: 450, y: 220 };

  const pF0_L = projectIso({ x: 90, y: -40, z: 0 }, origin);
  const pF0_R = projectIso({ x: 90, y: 40, z: 0 }, origin);
  const pF1_L = projectIso({ x: 180, y: -40, z: 0 }, origin);
  const pF1_R = projectIso({ x: 180, y: 40, z: 0 }, origin);
  const pF2_R = projectIso({ x: 180, y: 40, z: 45 }, origin);

  const pA1_R = projectIso({ x: 290, y: 45, z: 50 }, origin);
  const pA2_L = projectIso({ x: 420, y: -40, z: 145 }, origin);
  const pA2_R = projectIso({ x: 420, y: 40, z: 145 }, origin);

  const pC1_L = projectIso({ x: 620, y: -45, z: 145 }, origin);
  const pC1_R = projectIso({ x: 620, y: 45, z: 145 }, origin);
  const pC2_R = projectIso({ x: 810, y: 35, z: 55 }, origin);

  const pR0_R = projectIso({ x: 860, y: 35, z: 0 }, origin);

  return (
    <g id="iso-carbon-monocoque-tub-3d" className="transition-all duration-700 ease-out">
      {/* ── LAYER 1: GROUND PLANE RADIAL DROP SHADOW ── */}
      <ellipse cx="475" cy="340" rx="400" ry="26" fill="#020617" opacity="0.75" className="filter blur-md" />

      {/* ── LAYER 2: 3D CARBON TWILL MONOCOQUE BOTTOM FACET ── */}
      <polygon
        points={`${pF0_L.x},${pF0_L.y} ${pF0_R.x},${pF0_R.y} ${pR0_R.x},${pR0_R.y} ${pF0_L.x + 700},${pF0_L.y}`}
        fill="#070a12"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      {/* ── LAYER 3: FRONT CARBON IMPACT CRASH NOSE CONE ── */}
      <polygon
        points={`${pF0_L.x},${pF0_L.y} ${pF0_R.x},${pF0_R.y} ${pF2_R.x},${pF2_R.y} ${pF1_L.x},${pF1_L.y - 10}`}
        fill="url(#iso-carbon-twill-3d)"
        stroke="#38bdf8"
        strokeWidth="1.8"
      />

      {/* ── LAYER 4: MAIN 3D CARBON FIBER TWILL MONOCOQUE SHELL ── */}
      <polygon
        points={`${pF1_R.x},${pF1_R.y} ${pA1_R.x},${pA1_R.y} ${pA2_R.x},${pA2_R.y} ${pC1_R.x},${pC1_R.y} ${pC2_R.x},${pC2_R.y} ${pR0_R.x},${pR0_R.y}`}
        fill="url(#iso-carbon-twill-3d)"
        stroke={isHovered ? "#38bdf8" : "#38bdf8"}
        strokeWidth={isHovered ? "3.5" : "2.2"}
        className="filter drop-shadow-2xl"
      />

      {/* ── LAYER 5: ROOF TOP FACET (Carbon Weave) ── */}
      <polygon
        points={`${pA2_L.x},${pA2_L.y} ${pA2_R.x},${pA2_R.y} ${pC1_R.x},${pC1_R.y} ${pC1_L.x},${pC1_L.y}`}
        fill="url(#iso-carbon-twill-3d)"
        stroke="#38bdf8"
        strokeWidth="1.8"
      />

      {/* ── LAYER 6: 3D SPECULAR REFLECTION STROKES ── */}
      <line x1={pA1_R.x} y1={pA1_R.y} x2={pA2_R.x} y2={pA2_R.y} stroke="rgba(255,255,255,0.75)" strokeWidth="4" strokeLinecap="round" />
      <line x1={pA2_R.x} y1={pA2_R.y} x2={pC1_R.x} y2={pC1_R.y} stroke="rgba(56,189,248,0.6)" strokeWidth="3" />

      {/* ── LAYER 7: BATHTUB COCKPIT CELL (Recessed Interior Tub) ── */}
      <polygon
        points={`${pA2_R.x - 10},${pA2_R.y + 10} ${pA2_R.x + 90},${pA2_R.y + 5} ${pA2_R.x + 90},${pA2_R.y + 60} ${pA1_R.x + 40},${pA1_R.y - 10}`}
        fill="#070a12"
        stroke="#38bdf8"
        strokeWidth="2"
      />

      {/* Driver Headrest Safety Surround */}
      <rect x={pA2_R.x + 60} y={pA2_R.y + 10} width="35" height="20" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
      <text x={pA2_R.x + 77} y={pA2_R.y + 24} fill="#f8fafc" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
        DRIVER CELL
      </text>

      {/* ── LAYER 8: TITANIUM SUBFRAME HARDPOINT PICKUP PLATES (Gold Iridescent) ── */}
      <rect x={pA1_R.x} y={pA1_R.y - 15} width="16" height="30" rx="3" fill="url(#iso-titanium-weld-glow)" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx={pA1_R.x + 8} cy={pA1_R.y - 5} r="3" fill="#070a12" />
      <circle cx={pA1_R.x + 8} cy={pA1_R.y + 10} r="3" fill="#070a12" />

      <rect x={pC1_R.x - 20} y={pC1_R.y - 15} width="16" height="30" rx="3" fill="url(#iso-titanium-weld-glow)" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx={pC1_R.x - 12} cy={pC1_R.y - 5} r="3" fill="#070a12" />
      <circle cx={pC1_R.x - 12} cy={pC1_R.y + 10} r="3" fill="#070a12" />

      {/* ── LAYER 9: HONEYCOMB CORE CROSS-SECTION CUTOUT ── */}
      <path d={`M ${pA1_R.x + 40} ${pA1_R.y + 35} L ${pC1_R.x - 40} ${pC1_R.y + 35}`} stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3 3" />

      {/* Chassis Structural Label */}
      <text x="450" y="362" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
        3D ISOMETRIC FORMULA-1 SPEC CARBON FIBER MONOCOQUE TUB
      </text>
    </g>
  );
};
