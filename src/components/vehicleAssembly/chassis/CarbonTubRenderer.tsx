import React from "react";

interface CarbonTubRendererProps {
  isHovered?: boolean;
}

export const CarbonTubRenderer: React.FC<CarbonTubRendererProps> = ({ isHovered = false }) => {
  return (
    <g id="carbon-monocoque-tub-group" className="transition-all duration-700 ease-out">
      {/* 1. Carbon Monocoque Main Body Shell with 2x2 Twill Weave Texture */}
      <path
        d="
          M 90 265 
          C 120 260 160 255 230 255 
          A 68 68 0 0 1 300 255 
          L 640 255 
          A 68 68 0 0 1 710 255 
          C 780 255 830 250 860 235 
          C 840 195 770 175 710 165 
          C 640 130 540 115 420 125 
          C 340 140 290 190 240 205 
          C 180 212 120 225 90 245 
          Z
        "
        fill="url(#carbon-twill-2x2)"
        stroke={isHovered ? "#fbbf24" : "#fbbf24"}
        strokeWidth={isHovered ? "3.5" : "2.2"}
        className="filter drop-shadow-xl"
      />

      {/* 2. Carbon Weave Gloss Specular Highlight Lines */}
      <path
        d="M 120 232 C 220 215 320 205 420 198 C 560 195 700 200 820 215"
        fill="none"
        stroke="rgba(56, 189, 248, 0.4)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 290 205 C 335 172 375 150 420 140"
        fill="none"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* 3. Bathtub Cockpit Safety Cell (F1 / Hypercar Style) */}
      <rect x="330" y="165" width="220" height="90" rx="15" fill="#090d16" stroke="#fbbf24" strokeWidth="2" opacity="0.9" />
      <path d="M 330 200 L 550 200" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 2" />

      {/* Headrest Protection Surround */}
      <path d="M 480 165 L 530 165 L 540 190 L 480 190 Z" fill="#0284c7" stroke="#fbbf24" strokeWidth="1.5" />
      <text x="510" y="182" fill="#f8fafc" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
        DRIVER CELL
      </text>

      {/* 4. Front Carbon Nose Cone & Impact Crash Box */}
      <path d="M 90 245 L 170 245 L 170 265 L 90 262 Z" fill="#1a1008" stroke="#fbbf24" strokeWidth="1.5" />
      <line x1="130" y1="245" x2="130" y2="263" stroke="#fbbf24" strokeWidth="2" />

      {/* 5. Titanium Subframe Hardpoint Pickup Plates (Gold Iridescent) */}
      <rect x="220" y="210" width="20" height="35" rx="3" fill="url(#titanium-weld-tint)" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="230" cy="220" r="3" fill="#1a1008" />
      <circle cx="230" cy="235" r="3" fill="#1a1008" />

      <rect x="690" y="210" width="20" height="35" rx="3" fill="url(#titanium-weld-tint)" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="700" cy="220" r="3" fill="#1a1008" />
      <circle cx="700" cy="235" r="3" fill="#1a1008" />

      {/* 6. Honeycomb Core Cross-Section Rib Lines */}
      <path d="M 330 250 L 550 250" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />

      {/* Label */}
      <text x="475" y="272" fill="#fbbf24" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold" opacity="0.95">
        FORMULA-1 SPEC CARBON FIBER MONOCOQUE TUB
      </text>
    </g>
  );
};
