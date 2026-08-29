import React from "react";

interface TubularSpaceframeRendererProps {
  isHovered?: boolean;
}

export const TubularSpaceframeRenderer: React.FC<TubularSpaceframeRendererProps> = ({ isHovered = false }) => {
  return (
    <g id="tubular-spaceframe-rollcage-group" className="transition-all duration-700 ease-out">
      {/* 1. Dark Backdrop Shell Contour */}
      <path
        d="
          M 85 260 
          Q 120 255 160 255 
          A 70 70 0 0 1 300 255 
          L 640 255 
          A 70 70 0 0 1 780 255 
          Q 830 255 860 240 
          C 840 205 770 185 710 175 
          C 640 140 540 128 420 135 
          C 340 150 290 200 240 215 
          C 180 220 120 235 85 260 
          Z
        "
        fill="#070a12"
        stroke={isHovered ? "#fbbf24" : "#475569"}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.6"
      />

      {/* 2. Triangulated 4130 Chromoly Steel Tube Cage (Tubular Lattice) */}
      {/* Main Bottom Tube Rails */}
      <line x1="80" y1="260" x2="860" y2="260" stroke="#f43f5e" strokeWidth="5" strokeLinecap="round" />
      <line x1="80" y1="245" x2="860" y2="245" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />

      {/* A-Pillar Front Cage Tubes */}
      <line x1="290" y1="210" x2="420" y2="140" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
      <line x1="240" y1="260" x2="420" y2="140" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />

      {/* Main B-Pillar Roll Hoop & Diagonal Cross Bracing */}
      <line x1="520" y1="135" x2="520" y2="260" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
      <line x1="420" y1="140" x2="520" y2="260" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="520" y1="135" x2="420" y2="260" stroke="#f43f5e" strokeWidth="4.5" strokeLinecap="round" />

      {/* C-Pillar Rear Stays */}
      <line x1="520" y1="135" x2="780" y2="245" stroke="#f43f5e" strokeWidth="5.5" strokeLinecap="round" />
      <line x1="520" y1="135" x2="710" y2="260" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />

      {/* NASCAR / GT3 NASCAR Style X-Door Bars */}
      <line x1="330" y1="210" x2="510" y2="255" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
      <line x1="330" y1="255" x2="510" y2="210" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />

      {/* Front Engine Cradle Triangulated Tubes */}
      <line x1="80" y1="245" x2="230" y2="210" stroke="#f43f5e" strokeWidth="4" />
      <line x1="160" y1="260" x2="230" y2="210" stroke="#f43f5e" strokeWidth="4" />

      {/* Tube Joints Gussets */}
      <circle cx="420" cy="140" r="6" fill="#f8fafc" />
      <circle cx="520" cy="135" r="6" fill="#f8fafc" />
      <circle cx="290" cy="210" r="6" fill="#f8fafc" />
      <circle cx="780" cy="245" r="6" fill="#f8fafc" />

      {/* Label */}
      <text x="475" y="272" fill="#f43f5e" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold" opacity="0.95">
        GT3 MOTORSPORT TRIANGULATED CHROMOLY TUBULAR SPACEFRAME
      </text>
    </g>
  );
};
