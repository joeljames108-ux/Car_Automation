import React from "react";
import { projectIso, projectIsoEllipse, ScreenPoint2D } from "../../../assembly/iso3d/isoMath";

interface IsoAluminumSpaceframe3DProps {
  isHovered?: boolean;
}

export const IsoAluminumSpaceframe3D: React.FC<IsoAluminumSpaceframe3DProps> = ({ isHovered = false }) => {
  const origin: ScreenPoint2D = { x: 450, y: 220 };

  const pF1 = projectIso({ x: 90, y: 35, z: 0 }, origin);
  const pA1 = projectIso({ x: 290, y: 45, z: 50 }, origin);
  const pA2 = projectIso({ x: 420, y: 40, z: 145 }, origin);
  const pC1 = projectIso({ x: 620, y: 45, z: 145 }, origin);
  const pC2 = projectIso({ x: 810, y: 35, z: 55 }, origin);
  const pR1 = projectIso({ x: 860, y: 35, z: 0 }, origin);

  return (
    <g id="iso-aluminum-spaceframe-3d-group" className="transition-all duration-700 ease-out">
      {/* ── L1: FLOOR DROP SHADOW ── */}
      <ellipse cx="475" cy="340" rx="390" ry="25" fill="#020617" opacity="0.6" className="filter blur-md" />

      {/* ── L2: EXTRUDED ALUMINUM FRAME TUBES (3D Beveled Extrusions) ── */}
      {/* Lower Sill Tube */}
      <line x1={pF1.x} y1={pF1.y} x2={pR1.x} y2={pR1.y} stroke="url(#iso-al-tube-grad)" strokeWidth="12" strokeLinecap="square" />

      {/* A-Pillar Tube */}
      <line x1={pA1.x} y1={pA1.y} x2={pA2.x} y2={pA2.y} stroke="url(#iso-al-tube-grad)" strokeWidth="14" strokeLinecap="square" />
      <line x1={pA1.x} y1={pA1.y} x2={pA2.x} y2={pA2.y} stroke="#ffffff" strokeWidth="2" strokeDasharray="8 4" opacity="0.8" />

      {/* Roof Rail Tube */}
      <line x1={pA2.x} y1={pA2.y} x2={pC1.x} y2={pC1.y} stroke="url(#iso-al-tube-grad)" strokeWidth="12" strokeLinecap="square" />

      {/* C-Pillar Tube */}
      <line x1={pC1.x} y1={pC1.y} x2={pC2.x} y2={pC2.y} stroke="url(#iso-al-tube-grad)" strokeWidth="14" strokeLinecap="square" />

      {/* ── L3: DIE-CAST ALUMINUM NODE CONNECTORS (At Joints) ── */}
      <circle cx={pA1.x} cy={pA1.y} r="14" fill="#64748b" stroke="#f8fafc" strokeWidth="2" />
      <circle cx={pA1.x} cy={pA1.y} r="8" fill="#334155" />

      <circle cx={pA2.x} cy={pA2.y} r="14" fill="#64748b" stroke="#f8fafc" strokeWidth="2" />
      <circle cx={pA2.x} cy={pA2.y} r="8" fill="#334155" />

      <circle cx={pC1.x} cy={pC1.y} r="14" fill="#64748b" stroke="#f8fafc" strokeWidth="2" />
      <circle cx={pC1.x} cy={pC1.y} r="8" fill="#334155" />

      {/* Label */}
      <text x="450" y="360" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
        3D ISOMETRIC EXTRUDED ALUMINUM SPACEFRAME (ASF)
      </text>
    </g>
  );
};
