import React from "react";
import { projectIso, projectIsoEllipse, ScreenPoint2D } from "../../../assembly/iso3d/isoMath";

interface IsoCarbonTub3DProps {
  isHovered?: boolean;
}

export const IsoCarbonTub3D: React.FC<IsoCarbonTub3DProps> = ({ isHovered = false }) => {
  const origin: ScreenPoint2D = { x: 450, y: 220 };

  const pF0 = projectIso({ x: 90, y: -35, z: 0 }, origin);
  const pF1 = projectIso({ x: 90, y: 35, z: 0 }, origin);
  const pF2 = projectIso({ x: 90, y: 35, z: 45 }, origin);

  const pA1 = projectIso({ x: 290, y: 45, z: 50 }, origin);
  const pA2 = projectIso({ x: 420, y: 40, z: 145 }, origin);
  const pA3 = projectIso({ x: 420, y: -40, z: 145 }, origin);

  const pC1 = projectIso({ x: 620, y: 45, z: 145 }, origin);
  const pC0 = projectIso({ x: 620, y: -45, z: 145 }, origin);
  const pC2 = projectIso({ x: 810, y: 35, z: 55 }, origin);

  const pR1 = projectIso({ x: 860, y: 35, z: 0 }, origin);

  return (
    <g id="iso-carbon-tub-3d-group" className="transition-all duration-700 ease-out">
      {/* ── L1: FLOOR DROP SHADOW ── */}
      <ellipse cx="475" cy="340" rx="390" ry="25" fill="#020617" opacity="0.75" className="filter blur-md" />

      {/* ── L2: 3D CARBON FIBER TWILL MONOCOQUE OUTER BODY SHELL ── */}
      <polygon
        points={`${pF1.x},${pF1.y} ${pA1.x},${pA1.y} ${pA2.x},${pA2.y} ${pC1.x},${pC1.y} ${pC2.x},${pC2.y} ${pR1.x},${pR1.y}`}
        fill="url(#iso-carbon-twill-3d)"
        stroke={isHovered ? "#38bdf8" : "#38bdf8"}
        strokeWidth={isHovered ? "3.5" : "2.2"}
        className="filter drop-shadow-xl"
      />

      {/* ── L3: 3D ROOF TOP FACET (Carbon Twill) ── */}
      <polygon
        points={`${pA3.x},${pA3.y} ${pA2.x},${pA2.y} ${pC1.x},${pC1.y} ${pC0.x},${pC0.y}`}
        fill="url(#iso-carbon-twill-3d)"
        stroke="#38bdf8"
        strokeWidth="1.8"
      />

      {/* ── L4: 3D SPECULAR REFLECTION LINES ── */}
      <line x1={pA1.x} y1={pA1.y} x2={pA2.x} y2={pA2.y} stroke="rgba(255,255,255,0.7)" strokeWidth="4" strokeLinecap="round" />
      <line x1={pA2.x} y1={pA2.y} x2={pC1.x} y2={pC1.y} stroke="rgba(56,189,248,0.5)" strokeWidth="3" />

      {/* ── L5: BATHTUB COCKPIT CELL (Recessed Interior) ── */}
      <polygon
        points={`${pA2.x - 10},${pA2.y + 10} ${pA2.x + 90},${pA2.y + 5} ${pA2.x + 90},${pA2.y + 60} ${pA1.x + 40},${pA1.y - 10}`}
        fill="#070a12"
        stroke="#38bdf8"
        strokeWidth="2"
      />

      {/* Driver Headrest Safety Surround */}
      <rect x={pA2.x + 60} y={pA2.y + 10} width="35" height="20" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />

      {/* ── L6: TITANIUM SUBFRAME HARDPOINT PICKUP PLATES ── */}
      <rect x={pA1.x} y={pA1.y - 15} width="16" height="30" rx="3" fill="url(#iso-titanium-weld-glow)" stroke="#cbd5e1" strokeWidth="1.5" />
      <rect x={pC1.x - 20} y={pC1.y - 15} width="16" height="30" rx="3" fill="url(#iso-titanium-weld-glow)" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Label */}
      <text x="450" y="360" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
        3D ISOMETRIC FORMULA-1 SPEC CARBON FIBER MONOCOQUE TUB
      </text>
    </g>
  );
};
