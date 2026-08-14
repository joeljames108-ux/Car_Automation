import React from "react";

interface SteelUnibodyRendererProps {
  isHovered?: boolean;
}

export const SteelUnibodyRenderer: React.FC<SteelUnibodyRendererProps> = ({ isHovered = false }) => {
  return (
    <g id="steel-unibody-biw-group" className="transition-all duration-700 ease-out">
      {/* 1. Inner Dark Cockpit Cavity Cutout */}
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
        fill="url(#biw-inner-cavity-dark)"
      />

      {/* 2. Front Crash Subframe Box Rails & Core Support */}
      <path
        d="M 80 240 C 110 238 150 240 170 245 L 170 265 C 130 265 95 268 80 268 Z"
        fill="#475569"
        stroke="#cbd5e1"
        strokeWidth="1.5"
      />
      <line x1="80" y1="252" x2="170" y2="252" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 2" />

      {/* 3. Front Suspension Strut Tower Dome */}
      <path d="M 195 265 Q 200 205 265 205 Q 275 235 270 265 Z" fill="url(#strut-dome-shader)" stroke="#cbd5e1" strokeWidth="2" />
      <ellipse cx="230" cy="208" rx="14" ry="10" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="223" cy="204" r="2" fill="#f8fafc" />
      <circle cx="237" cy="204" r="2" fill="#f8fafc" />
      <circle cx="230" cy="214" r="2" fill="#f8fafc" />

      {/* 4. Elegant Sweeping BIW Unibody Outer Shell (Bezier Paths) */}
      <path
        d="
          M 80 268 
          Q 120 265 160 258 
          A 70 70 0 0 1 300 258 
          L 640 258 
          A 70 70 0 0 1 780 258 
          Q 835 258 870 235 
          C 850 200 770 180 710 170 
          C 640 135 540 120 420 132 
          C 340 148 290 198 240 212 
          C 180 218 120 230 80 250 
          Z
        "
        fill="url(#al-brushed-metallic)"
        stroke={isHovered ? "#38bdf8" : "#94a3b8"}
        strokeWidth={isHovered ? "3.5" : "2.2"}
        className="filter drop-shadow-md"
      />

      {/* 5. Shoulder Specular Reflection Character Line */}
      <path
        d="M 120 238 C 220 220 320 210 420 205 C 560 200 700 205 820 220"
        fill="none"
        stroke="url(#biw-shoulder-specular)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* 6. Door Apertures & Window Frames */}
      <path
        d="M 420 145 C 475 142 510 142 515 142 L 515 215 C 430 215 370 215 340 215 C 360 185 390 160 420 145 Z"
        fill="#0f172a"
        stroke="#cbd5e1"
        strokeWidth="2.5"
        opacity="0.9"
      />
      <path
        d="M 525 142 C 585 138 645 155 695 188 C 675 215 635 215 525 215 Z"
        fill="#0f172a"
        stroke="#cbd5e1"
        strokeWidth="2.5"
        opacity="0.9"
      />
      <path d="M 330 222 C 450 222 580 222 690 222 L 680 258 L 320 258 Z" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" opacity="0.95" />

      {/* 7. Pillars & Structural Rails */}
      <path d="M 290 210 C 335 178 375 155 420 145" fill="none" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
      <path d="M 290 210 C 335 178 375 155 420 145" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="8 4" />
      <path d="M 515 140 Q 520 180 520 258 L 512 258 Q 512 180 515 140 Z" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
      <circle cx="516" cy="175" r="3" fill="#0f172a" />
      <circle cx="516" cy="195" r="3" fill="#0f172a" />
      <path d="M 420 145 C 500 132 580 130 635 140" fill="none" stroke="#e2e8f0" strokeWidth="3" />
      <path d="M 635 140 C 695 160 760 185 810 210" fill="none" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />

      {/* 8. Lower Rocker Sill & Pinch Weld Seam */}
      <path d="M 295 258 C 450 258 520 258 642 258 L 642 276 C 520 276 450 276 295 276 Z" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
      {Array.from({ length: 22 }).map((_, i) => (
        <circle key={i} cx={305 + i * 15} cy={271} r="1.2" fill="#334155" />
      ))}

      {/* 9. Rear Suspension Dome & Trunk Frame */}
      <path d="M 645 265 Q 650 205 715 205 Q 725 235 720 265 Z" fill="url(#strut-dome-shader)" stroke="#cbd5e1" strokeWidth="2" />
      <ellipse cx="680" cy="208" rx="14" ry="10" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M 780 238 C 810 238 840 240 865 242 L 865 264 C 840 262 810 260 780 260 Z" fill="#475569" stroke="#cbd5e1" strokeWidth="1.8" />

      {/* 10. Stamped Swage Flange Lightening Holes */}
      <use href="#swage-hole-deep" x="110" y="255" />
      <use href="#swage-hole-deep" x="140" y="255" />
      <use href="#swage-hole-sm-deep" x="200" y="232" />
      <use href="#swage-hole-sm-deep" x="235" y="232" />

      <use href="#swage-hole-deep" x="350" y="243" />
      <use href="#swage-hole-deep" x="395" y="243" />
      <use href="#swage-hole-deep" x="440" y="243" />
      <use href="#swage-hole-deep" x="560" y="243" />
      <use href="#swage-hole-deep" x="605" y="243" />

      <use href="#swage-hole-deep" x="740" y="218" transform="rotate(-15 740 218)" />
      <use href="#swage-hole-deep" x="770" y="226" transform="rotate(-15 770 226)" />
      <use href="#swage-hole-deep" x="805" y="250" />
      <use href="#swage-hole-sm-deep" x="835" y="250" />

      <text x="475" y="272" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold" opacity="0.95">
        STAMPED STEEL BODY-IN-WHITE (BIW) CHASSIS
      </text>
    </g>
  );
};
