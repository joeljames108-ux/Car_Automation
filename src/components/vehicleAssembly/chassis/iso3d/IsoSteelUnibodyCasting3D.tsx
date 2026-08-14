import React from "react";

interface IsoSteelUnibodyCasting3DProps {
  isHovered?: boolean;
}

/**
 * Photorealistic Side-Profile Body-In-White (BIW) Unibody Car Chassis SVG
 * Precision-drawn to match the exact reference photos provided by the user.
 */
export const IsoSteelUnibodyCasting3D: React.FC<IsoSteelUnibodyCasting3DProps> = ({ isHovered = false }) => {
  return (
    <g id="biw-unibody-car-chassis-casting-exact" className="transition-all duration-700 ease-out">
      {/* Defs for Metallic Steel Shading Gradients & Outer Glow */}
      <defs>
        {/* Main Body Steel Specular Metallic Gradient */}
        <linearGradient id="biw-steel-casting-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="25%" stopColor="#cbd5e1" />
          <stop offset="65%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* Inner Cavity Deep Shadow Gradient */}
        <linearGradient id="biw-inner-casting-cavity-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Rocker Sill Tube Metallic Linear Gradient */}
        <linearGradient id="biw-sill-casting-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="20%" stopColor="#cbd5e1" />
          <stop offset="80%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* ── LAYER 1: GROUND PLANE CONTACT DROP SHADOW ── */}
      <ellipse cx="475" cy="352" rx="420" ry="22" fill="#020617" opacity="0.65" className="filter blur-md" />

      {/* ── LAYER 2: RECESSED INNER COCKPIT CAVITY & REAR FLOOR PAN ── */}
      <path
        d="M 240 285 C 220 240 240 190 310 150 C 360 130 520 120 670 170 C 690 220 680 270 650 285 Z"
        fill="url(#biw-inner-casting-cavity-grad)"
        stroke="#334155"
        strokeWidth="1"
      />

      {/* Visible Floor Pan Stamping Ribs & Seat Mounting Brackets */}
      <g opacity="0.85">
        <line x1="310" y1="280" x2="650" y2="280" stroke="#475569" strokeWidth="3" />
        <line x1="320" y1="272" x2="640" y2="272" stroke="#334155" strokeWidth="2" strokeDasharray="12 4" />

        <rect x="525" y="268" width="35" height="12" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />
        <circle cx="535" cy="274" r="2" fill="#94a3b8" />
        <circle cx="550" cy="274" r="2" fill="#94a3b8" />

        <path d="M 330 280 C 330 255 350 250 375 250 C 400 250 410 260 410 280 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        <rect x="345" y="260" width="40" height="8" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />

        <path d="M 285 285 C 275 235 245 225 210 235 C 190 240 180 265 175 285 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
      </g>

      {/* ── LAYER 3: MAIN OUTER BODY-IN-WHITE SHELL (Matching Photos) ── */}
      <path
        d="M 900 250 
           L 900 245 L 890 235 L 870 230 
           C 850 215, 800 205, 750 190 
           C 720 185, 680 180, 650 160 
           C 600 130, 560 115, 480 110 
           C 420 108, 360 115, 300 130 
           C 250 150, 200 180, 160 190 
           L 85 195 
           L 80 210 L 95 230 L 80 245 
           L 80 270 L 105 270 L 105 255 L 170 255 
           C 170 235, 195 220, 240 220 
           C 285 220, 310 235, 320 285 
           L 320 330 
           L 710 330 
           L 710 285 
           C 720 250, 750 225, 800 225 
           C 850 225, 880 245, 900 250 Z"
        fill="url(#biw-steel-casting-grad)"
        stroke={isHovered ? "#38bdf8" : "#0f172a"}
        strokeWidth={isHovered ? "3.2" : "2.0"}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* ── LAYER 4: FRONT & REAR DOOR APERTURE CUTOUTS ── */}
      <path
        d="M 640 165 
           C 585 132, 545 125, 505 125 
           L 505 285 
           L 660 285 
           C 675 220, 665 185, 640 165 Z"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      <path
        d="M 485 125 
           C 435 125, 375 132, 335 145 
           C 305 160, 280 190, 260 225 
           C 255 250, 275 285, 305 285 
           L 485 285 Z"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* ── LAYER 5: B-PILLAR CENTER COLUMN WITH STAMPED SLOTS ── */}
      <path
        d="M 485 125 L 505 125 L 505 285 L 485 285 Z"
        fill="url(#biw-steel-casting-grad)"
        stroke="#0f172a"
        strokeWidth="2.0"
      />
      <rect x="491" y="145" width="8" height="35" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <rect x="491" y="195" width="8" height="30" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1" />
      <polygon points="489,260 501,260 495,273" fill="#1e293b" stroke="#475569" strokeWidth="1" />

      {/* ── LAYER 6: LOWER ROCKER PANEL SILL & PINCH WELD SEAM ── */}
      <rect
        x="320"
        y="300"
        width="390"
        height="30"
        rx="3"
        fill="url(#biw-sill-casting-grad)"
        stroke="#0f172a"
        strokeWidth="2.0"
      />
      <line x1="325" y1="315" x2="705" y2="315" stroke="#475569" strokeWidth="1.5" />
      {Array.from({ length: 22 }).map((_, i) => (
        <circle key={i} cx={335 + i * 17} cy={324} r="1.5" fill="#1e293b" />
      ))}

      {/* ── LAYER 7: FRONT APRON & FENDER FRAME DETAILS (Right Side) ── */}
      <path
        d="M 720 230 C 740 190, 780 190, 800 230"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.0"
      />

      <rect x="735" y="210" width="30" height="20" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="1.8" />
      <path d="M 710 190 L 730 185 L 750 190 Z" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.2" />

      <g transform="translate(830, 240) rotate(-12)">
        <rect x="0" y="0" width="14" height="7" rx="3.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
      </g>
      <g transform="translate(852, 240) rotate(-12)">
        <rect x="0" y="0" width="14" height="7" rx="3.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
      </g>

      <rect x="888" y="242" width="14" height="24" rx="2" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.8" />
      <circle cx="895" cy="248" r="2" fill="#0f172a" />
      <circle cx="895" cy="260" r="2" fill="#0f172a" />

      {/* ── LAYER 8: REAR QUARTER PANEL & TAIL LIGHT NOTCH DETAILS (Left Side) ── */}
      <polygon points="80,195 105,195 105,245 80,245" fill="#1e293b" stroke="#0f172a" strokeWidth="1.8" />
      <rect x="75" y="255" width="28" height="15" rx="2" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.8" />

      {/* ── LAYER 9: Sleek Bezier Body Line Art Overlays ── */}
      <path d="M 648 162 Q 545 118 478 113" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 478 113 Q 360 118 298 132" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.0" strokeLinecap="round" />

      <path d="M 160 190 Q 240 185 320 220" fill="none" stroke="#475569" strokeWidth="1.5" />

      <text x="475" y="372" fill="#38bdf8" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold" letterSpacing="1">
        HIGH-STRENGTH STAMPED STEEL UNIBODY CHASSIS (BIW)
      </text>
    </g>
  );
};
