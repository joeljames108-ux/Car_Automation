import React from "react";

interface AluminumSpaceframeRendererProps {
  isHovered?: boolean;
}

export const AluminumSpaceframeRenderer: React.FC<AluminumSpaceframeRendererProps> = ({ isHovered = false }) => {
  return (
    <g id="aluminum-spaceframe-group" className="transition-all duration-700 ease-out">
      {/* 1. Inner Dark Cavity */}
      <path
        d="
          M 90 260 
          L 165 255 
          A 70 70 0 0 1 295 255 
          L 640 255 
          A 70 70 0 0 1 780 255 
          L 850 255 
          L 850 215 
          L 760 190 
          L 600 135 
          L 410 145 
          L 290 210 
          L 170 215 
          Z
        "
        fill="url(#biw-inner-cavity-dark)"
      />

      {/* 2. Extruded Aluminum Main Frame Rails (Box Extrusions) */}
      {/* Lower Sill Extrusion */}
      <rect x="295" y="255" width="345" height="18" fill="url(#al-extrusion-grad)" stroke={isHovered ? "#fbbf24" : "#94a3b8"} strokeWidth="2" />
      <line x1="295" y1="264" x2="640" y2="264" stroke="#ffffff" strokeWidth="1" opacity="0.6" />

      {/* Front Subframe Extrusion Rails */}
      <rect x="90" y="245" width="80" height="20" rx="3" fill="url(#al-extrusion-grad)" stroke="#cbd5e1" strokeWidth="1.8" />
      <line x1="90" y1="255" x2="170" y2="255" stroke="#ffffff" strokeWidth="1" opacity="0.6" />

      {/* A-Pillar Extruded Aluminum Tube */}
      <line x1="290" y1="210" x2="410" y2="140" stroke="url(#al-extrusion-grad)" strokeWidth="12" strokeLinecap="square" />
      <line x1="290" y1="210" x2="410" y2="140" stroke="#ffffff" strokeWidth="2" strokeDasharray="10 5" opacity="0.8" />

      {/* Roof Rail Extrusion */}
      <line x1="410" y1="140" x2="615" y2="130" stroke="url(#al-extrusion-grad)" strokeWidth="10" strokeLinecap="square" />

      {/* C-Pillar Extrusion */}
      <line x1="615" y1="130" x2="790" y2="190" stroke="url(#al-extrusion-grad)" strokeWidth="12" strokeLinecap="square" />

      {/* 3. Die-Cast Aluminum Structural Node Connectors (At Joints) */}
      {/* A-Pillar Base Cast Node */}
      <circle cx="290" cy="210" r="14" fill="#64748b" stroke="#f8fafc" strokeWidth="2" />
      <circle cx="290" cy="210" r="8" fill="#334155" />

      {/* B-Pillar Cast Node */}
      <circle cx="515" cy="142" r="12" fill="#64748b" stroke="#f8fafc" strokeWidth="2" />
      <circle cx="515" cy="258" r="12" fill="#64748b" stroke="#f8fafc" strokeWidth="2" />

      {/* C-Pillar Cast Node */}
      <circle cx="615" cy="130" r="14" fill="#64748b" stroke="#f8fafc" strokeWidth="2" />
      <circle cx="615" cy="130" r="8" fill="#334155" />

      {/* Front Strut Tower Cast Aluminum Node */}
      <path d="M 195 260 Q 200 205 265 205 Q 275 235 270 260 Z" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx="230" cy="208" r="14" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* 4. TIG Weld Bead Highlights at Joint Intersections */}
      <circle cx="290" cy="210" r="15" fill="none" stroke="url(#tig-weld-bead)" strokeWidth="4" />
      <circle cx="615" cy="130" r="15" fill="none" stroke="url(#tig-weld-bead)" strokeWidth="4" />
      <circle cx="515" cy="258" r="13" fill="none" stroke="url(#tig-weld-bead)" strokeWidth="4" />

      {/* Label */}
      <text x="475" y="272" fill="#fbbf24" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold" opacity="0.95">
        HIGH-RIGIDITY EXTRUDED ALUMINUM SPACEFRAME (ASF)
      </text>
    </g>
  );
};
