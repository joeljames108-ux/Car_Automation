import React from "react";
import { projectIso, ScreenPoint2D } from "../../../assembly/iso3d/isoMath";

interface IsoTubularRollCage3DProps {
  isHovered?: boolean;
}

export const IsoTubularRollCage3D: React.FC<IsoTubularRollCage3DProps> = ({ isHovered = false }) => {
  const origin: ScreenPoint2D = { x: 450, y: 220 };

  const pF1 = projectIso({ x: 90, y: 35, z: 0 }, origin);
  const pA1 = projectIso({ x: 290, y: 45, z: 50 }, origin);
  const pA2 = projectIso({ x: 420, y: 40, z: 145 }, origin);
  const pC1 = projectIso({ x: 620, y: 45, z: 145 }, origin);
  const pC2 = projectIso({ x: 810, y: 35, z: 55 }, origin);
  const pR1 = projectIso({ x: 860, y: 35, z: 0 }, origin);

  return (
    <g id="iso-tubular-rollcage-3d-group" className="transition-all duration-700 ease-out">
      {/* ── L1: FLOOR DROP SHADOW ── */}
      <ellipse cx="475" cy="340" rx="390" ry="25" fill="#020617" opacity="0.6" className="filter blur-md" />

      {/* ── L2: TRIANGULATED 4130 CHROMOLY ROLL CAGE TUBES ── */}
      <line x1={pF1.x} y1={pF1.y} x2={pR1.x} y2={pR1.y} stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />

      {/* A-Pillar Tube */}
      <line x1={pA1.x} y1={pA1.y} x2={pA2.x} y2={pA2.y} stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />
      <line x1={pA1.x} y1={pA1.y} x2={pA2.x} y2={pA2.y} stroke="#ffffff" strokeWidth="2" strokeDasharray="6 3" />

      {/* B-Pillar Main Hoop */}
      <line x1={pA2.x + 50} y1={pA2.y} x2={pA1.x + 100} y2={pA1.y} stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />

      {/* Roof Rail & C-Pillar Tube */}
      <line x1={pA2.x} y1={pA2.y} x2={pC1.x} y2={pC1.y} stroke="#f43f5e" strokeWidth="6" />
      <line x1={pC1.x} y1={pC1.y} x2={pC2.x} y2={pC2.y} stroke="#f43f5e" strokeWidth="7" strokeLinecap="round" />

      {/* NASCAR Style X-Door Bars */}
      <line x1={pA1.x} y1={pA1.y} x2={pC1.x} y2={pC1.y + 40} stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" />
      <line x1={pA1.x + 50} y1={pA1.y + 30} x2={pA2.x} y2={pA2.y} stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" />

      {/* Tube Joint Weld Nodes */}
      <circle cx={pA1.x} cy={pA1.y} r="6" fill="#f8fafc" />
      <circle cx={pA2.x} cy={pA2.y} r="6" fill="#f8fafc" />
      <circle cx={pC1.x} cy={pC1.y} r="6" fill="#f8fafc" />

      {/* Label */}
      <text x="450" y="360" fill="#f43f5e" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
        3D ISOMETRIC GT3 MOTORSPORT TRIANGULATED CHROMOLY ROLL CAGE
      </text>
    </g>
  );
};
