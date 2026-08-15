import React from "react";

interface IsoSteelUnibodyCasting3DProps {
  isHovered?: boolean;
}

/**
 * Photorealistic Side-Profile Body-In-White (BIW) Unibody Car Chassis SVG
 * Precision-drawn with metallic HDR specular shading, shoulder character highlights,
 * stamped swage holes, structural pillar reinforcements, and ground plane occlusion.
 */
export const IsoSteelUnibodyCasting3D: React.FC<IsoSteelUnibodyCasting3DProps> = ({ isHovered = false }) => {
  return (
    <g id="biw-unibody-car-chassis-casting-exact" className="transition-all duration-700 ease-out">
      {/* ── LAYER 1: GROUND PLANE CONTACT DROP SHADOW ── */}
      <ellipse
        cx="475"
        cy="350"
        rx="430"
        ry="24"
        fill="#020617"
        opacity="0.75"
        filter="url(#ground-contact-blur)"
      />

      {/* ── LAYER 2: RECESSED INNER COCKPIT CAVITY & REAR FLOOR PAN ── */}
      <path
        d="M 240 285 C 220 240 240 190 310 150 C 360 130 520 120 670 170 C 690 220 680 270 650 285 Z"
        fill="url(#biw-inner-cavity-dark)"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      {/* Floor Pan Stamping Ribs & Tunnel Reinforcements */}
      <g opacity="0.85">
        <line x1="310" y1="280" x2="650" y2="280" stroke="#334155" strokeWidth="4" />
        <line x1="320" y1="272" x2="640" y2="272" stroke="#475569" strokeWidth="2" strokeDasharray="14 5" />

        {/* Seat Mounting Rails */}
        <rect x="525" y="266" width="38" height="14" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
        <circle cx="535" cy="273" r="2.2" fill="#cbd5e1" />
        <circle cx="552" cy="273" r="2.2" fill="#cbd5e1" />

        {/* Central Transmission Tunnel Rise */}
        <path d="M 330 280 C 330 252 350 245 375 245 C 400 245 410 258 410 280 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
        <rect x="345" y="258" width="42" height="10" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1" />

        {/* Firewall Bulkhead Structure */}
        <path d="M 285 285 C 275 235 245 225 210 235 C 190 240 180 265 175 285 Z" fill="#020617" stroke="#475569" strokeWidth="1.5" />

        {/* ── STRUCTURAL ENGINE MOUNTING CRADLES (Front, Mid, Rear Subframes) ── */}
        <g id="engine-chassis-cradles-biw" opacity="0.9">
          {/* Front Engine Subframe Cradle */}
          <rect x="200" y="258" width="75" height="12" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="205" y1="264" x2="270" y2="264" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="215" cy="264" r="2.5" fill="#f59e0b" />
          <circle cx="260" cy="264" r="2.5" fill="#f59e0b" />

          {/* Mid-Ship Engine Cradle */}
          <rect x="430" y="258" width="95" height="12" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="435" y1="264" x2="520" y2="264" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="445" cy="264" r="2.5" fill="#f59e0b" />
          <circle cx="510" cy="264" r="2.5" fill="#f59e0b" />

          {/* Rear Engine Subframe Cradle */}
          <rect x="670" y="258" width="80" height="12" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="675" y1="264" x2="745" y2="264" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="685" cy="264" r="2.5" fill="#f59e0b" />
          <circle cx="735" cy="264" r="2.5" fill="#f59e0b" />
        </g>
      </g>

      {/* ── LAYER 3: MAIN OUTER BODY-IN-WHITE SHELL (Photorealistic Curves) ── */}
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
        fill="url(#biw-hdr-silver-body)"
        stroke={isHovered ? "#38bdf8" : "#0f172a"}
        strokeWidth={isHovered ? "3.2" : "2.0"}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#panel-ambient-occlusion)"
      />

      {/* ── LAYER 4: SHOULDER CHARACTER LINE SPECULAR REFLECTION (3D Volume Highlight) ── */}
      <path
        d="M 648 162 Q 545 118 478 113 Q 360 118 298 132"
        fill="none"
        stroke="url(#biw-shoulder-specular-glow)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 750 190 C 720 185, 680 180, 650 160"
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="2.0"
        strokeLinecap="round"
      />

      {/* Rear Fender Character Accent */}
      <path
        d="M 160 190 Q 240 185 320 220"
        fill="none"
        stroke="#475569"
        strokeWidth="1.8"
      />

      {/* ── LAYER 5: FRONT & REAR DOOR APERTURE CUTOUTS ── */}
      <path
        d="M 640 165 
           C 585 132, 545 125, 505 125 
           L 505 285 
           L 660 285 
           C 675 220, 665 185, 640 165 Z"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.4"
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
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Door Aperture Inner Seam Flange (3D Thickness) */}
      <path
        d="M 638 168 C 585 136, 545 129, 507 129 L 507 283 L 658 283"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="1.2"
        opacity="0.8"
      />

      {/* ── LAYER 6: B-PILLAR CENTER COLUMN WITH STAMPED LIGHTENING SLOTS ── */}
      <path
        d="M 485 125 L 505 125 L 505 285 L 485 285 Z"
        fill="url(#biw-hdr-silver-body)"
        stroke="#0f172a"
        strokeWidth="2.0"
      />
      <rect x="491" y="145" width="8" height="35" rx="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
      <rect x="491" y="195" width="8" height="30" rx="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
      <polygon points="489,260 501,260 495,273" fill="#0f172a" stroke="#64748b" strokeWidth="1" />

      {/* ── LAYER 7: LOWER ROCKER PANEL SILL & STAMPED SPOT WELDS ── */}
      <rect
        x="320"
        y="298"
        width="390"
        height="32"
        rx="4"
        fill="url(#al-extrusion-grad)"
        stroke="#0f172a"
        strokeWidth="2.2"
      />
      <line x1="325" y1="312" x2="705" y2="312" stroke="#475569" strokeWidth="1.5" />
      
      {/* Structural Swage Flange Holes along Rocker Panel */}
      <g transform="translate(340, 305)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(380, 305)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(420, 305)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(460, 305)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(500, 305)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(540, 305)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(580, 305)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(620, 305)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(660, 305)"><use href="#swage-hole-sm-deep" /></g>

      {/* Spot Welds Along Pinch Flange */}
      {Array.from({ length: 24 }).map((_, i) => (
        <circle key={i} cx={332 + i * 16} cy={323} r="1.6" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.5" />
      ))}

      {/* ── LAYER 8: FRONT APRON & STRUT TOWER FRAME (Right Side) ── */}
      <path
        d="M 720 230 C 740 190, 780 190, 800 230"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.2"
      />

      <rect x="735" y="208" width="32" height="22" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="2.0" />
      <path d="M 710 190 L 730 185 L 750 190 Z" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />

      <g transform="translate(830, 240) rotate(-12)">
        <rect x="0" y="0" width="15" height="8" rx="4" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
      </g>
      <g transform="translate(852, 240) rotate(-12)">
        <rect x="0" y="0" width="15" height="8" rx="4" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
      </g>

      <rect x="888" y="242" width="14" height="24" rx="2" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.8" />
      <circle cx="895" cy="248" r="2.2" fill="#0f172a" />
      <circle cx="895" cy="260" r="2.2" fill="#0f172a" />

      {/* ── LAYER 9: REAR QUARTER PANEL & TAIL LIGHT NOTCH (Left Side) ── */}
      <polygon points="80,195 105,195 105,245 80,245" fill="#0f172a" stroke="#475569" strokeWidth="1.8" />
      <rect x="75" y="255" width="28" height="15" rx="2" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.8" />

      {/* Technical Label */}
      <text
        x="475"
        y="374"
        fill="#38bdf8"
        fontSize="11"
        fontFamily="monospace"
        textAnchor="middle"
        fontWeight="bold"
        letterSpacing="1"
      >
        HIGH-STRENGTH STAMPED STEEL UNIBODY CHASSIS (BIW)
      </text>
    </g>
  );
};
