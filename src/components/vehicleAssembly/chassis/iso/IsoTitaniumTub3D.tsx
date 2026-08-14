import React from "react";
import { projectIso, ScreenPoint2D } from "../../../assembly/iso3d/isoMath";

interface IsoTitaniumTub3DProps {
  isHovered?: boolean;
}

export const IsoTitaniumTub3D: React.FC<IsoTitaniumTub3DProps> = ({ isHovered = false }) => {
  const origin: ScreenPoint2D = { x: 450, y: 220 };

  const pF1 = projectIso({ x: 90, y: 35, z: 0 }, origin);
  const pA1 = projectIso({ x: 290, y: 45, z: 50 }, origin);
  const pA2 = projectIso({ x: 420, y: 40, z: 145 }, origin);
  const pA3 = projectIso({ x: 420, y: -40, z: 145 }, origin);
  const pC1 = projectIso({ x: 620, y: 45, z: 145 }, origin);
  const pC0 = projectIso({ x: 620, y: -45, z: 145 }, origin);
  const pC2 = projectIso({ x: 810, y: 35, z: 55 }, origin);
  const pR1 = projectIso({ x: 860, y: 35, z: 0 }, origin);

  return (
    <g id="iso-titanium-tub-3d-group" className="transition-all duration-700 ease-out">
      {/* ── L1: FLOOR DROP SHADOW ── */}
      <ellipse cx="475" cy="340" rx="390" ry="25" fill="#020617" opacity="0.7" className="filter blur-md" />

      {/* ── L2: TITANIUM MAIN BODY FACET ── */}
      <polygon
        points={`${pF1.x},${pF1.y} ${pA1.x},${pA1.y} ${pA2.x},${pA2.y} ${pC1.x},${pC1.y} ${pC2.x},${pC2.y} ${pR1.x},${pR1.y}`}
        fill="#1e293b"
        stroke={isHovered ? "#ec4899" : "#a855f7"}
        strokeWidth={isHovered ? "3.5" : "2.2"}
        className="filter drop-shadow-2xl"
      />

      {/* Roof Top Facet */}
      <polygon
        points={`${pA3.x},${pA3.y} ${pA2.x},${pA2.y} ${pC1.x},${pC1.y} ${pC0.x},${pC0.y}`}
        fill="#0f172a"
        stroke="#a855f7"
        strokeWidth="1.8"
      />

      {/* ── L3: IRIDESCENT TITANIUM WELD GLOW LINES ── */}
      <line x1={pA1.x} y1={pA1.y} x2={pA2.x} y2={pA2.y} stroke="url(#iso-titanium-weld-glow)" strokeWidth="6" strokeLinecap="round" />
      <line x1={pA2.x} y1={pA2.y} x2={pC1.x} y2={pC1.y} stroke="url(#iso-titanium-weld-glow)" strokeWidth="5" />
      <line x1={pC1.x} y1={pC1.y} x2={pC2.x} y2={pC2.y} stroke="url(#iso-titanium-weld-glow)" strokeWidth="6" strokeLinecap="round" />

      {/* Cockpit Window Surround */}
      <polygon
        points={`${pA2.x - 10},${pA2.y + 10} ${pA2.x + 90},${pA2.y + 5} ${pA2.x + 90},${pA2.y + 60} ${pA1.x + 40},${pA1.y - 10}`}
        fill="#070a12"
        stroke="#ec4899"
        strokeWidth="2"
      />

      {/* Label */}
      <text x="450" y="360" fill="#ec4899" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
        3D ISOMETRIC TITANIUM SPEC-R HYPERCAR TUB & IRIDESCENT HEAT-TINT WELDS
      </text>
    </g>
  );
};
