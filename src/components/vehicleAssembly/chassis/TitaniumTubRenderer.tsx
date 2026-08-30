import React from "react";

interface TitaniumTubRendererProps {
  isHovered?: boolean;
}

export const TitaniumTubRenderer: React.FC<TitaniumTubRendererProps> = ({ isHovered = false }) => {
  return (
    <g id="titanium-spec-r-tub-group" className="transition-all duration-700 ease-out">
      {/* 1. Main Metallic Titanium Body Shell */}
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
        fill="#1e293b"
        stroke={isHovered ? "#d97706" : "#f59e0b"}
        strokeWidth={isHovered ? "3.5" : "2.2"}
        className="filter drop-shadow-2xl"
      />

      {/* 2. Iridescent Heat-Tinted Weld Seams (Titanium Blue/Purple/Gold) */}
      <path
        d="M 120 238 C 220 220 320 210 420 205 C 560 200 700 205 820 220"
        fill="none"
        stroke="url(#titanium-weld-tint)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M 290 210 C 335 178 375 155 420 145"
        fill="none"
        stroke="url(#titanium-weld-tint)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 635 140 C 695 160 760 185 810 210"
        fill="none"
        stroke="url(#titanium-weld-tint)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* 3. Structural Webbing Lightening Grid */}
      <path d="M 330 225 C 450 225 580 225 690 225 L 680 258 L 320 258 Z" fill="#080c14" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="380" y1="225" x2="360" y2="258" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="440" y1="225" x2="420" y2="258" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="500" y1="225" x2="480" y2="258" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="560" y1="225" x2="540" y2="258" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="620" y1="225" x2="600" y2="258" stroke="#f59e0b" strokeWidth="1.5" />

      {/* Cockpit Window Surround */}
      <path
        d="M 420 145 C 475 142 510 142 515 142 L 515 215 C 430 215 370 215 340 215 C 360 185 390 160 420 145 Z"
        fill="#070a12"
        stroke="#d97706"
        strokeWidth="2.5"
        opacity="0.9"
      />

      {/* Label */}
      <text x="475" y="272" fill="#d97706" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold" opacity="0.95">
        TITANIUM SPEC-R HYPERCAR TUB & IRIDESCENT HEAT-TINT WELDS
      </text>
    </g>
  );
};
