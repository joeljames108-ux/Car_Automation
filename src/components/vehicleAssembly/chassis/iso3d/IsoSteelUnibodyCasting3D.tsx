import React from "react";

interface IsoSteelUnibodyCasting3DProps {
  isHovered?: boolean;
}

/**
 * Photorealistic Side-Profile Body-In-White (BIW) Unibody Car Chassis SVG
 * Precision-drawn with metallic HDR specular shading, shoulder character highlights,
 * stamped swage holes, structural pillar reinforcements, and ground plane occlusion.
 * Standard Datum: Rear Axle X=240, Front Axle X=760, Wheelbase=520px, Ground Y=340.
 */
export const IsoSteelUnibodyCasting3D: React.FC<IsoSteelUnibodyCasting3DProps> = ({ isHovered = false }) => {
  return (
    <g id="biw-unibody-car-chassis-casting-exact" className="transition-all duration-700 ease-out">
      {/* ── LAYER 1: GROUND PLANE CONTACT DROP SHADOW ── */}
      <ellipse
        cx="500"
        cy="342"
        rx="430"
        ry="20"
        fill="#020617"
        opacity="0.80"
        filter="url(#ground-contact-blur)"
      />

      {/* ── LAYER 2: RECESSED INNER COCKPIT CAVITY & PASSENGER SAFETY CELL ── */}
      <path
        d="M 280 280 C 270 230 300 180 370 145 C 440 120 560 120 660 165 C 685 205 680 250 660 280 Z"
        fill="url(#biw-inner-cavity-dark)"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      {/* Floor Pan Stamping Ribs & Tunnel Reinforcements */}
      <g opacity="0.85">
        <line x1="310" y1="280" x2="650" y2="280" stroke="#334155" strokeWidth="4" />
        <line x1="320" y1="272" x2="640" y2="272" stroke="#475569" strokeWidth="2" strokeDasharray="14 5" />

        {/* Seat Mounting Rails */}
        <rect x="420" y="266" width="40" height="14" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
        <circle cx="430" cy="273" r="2.2" fill="#cbd5e1" />
        <circle cx="450" cy="273" r="2.2" fill="#cbd5e1" />

        <rect x="540" y="266" width="40" height="14" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
        <circle cx="550" cy="273" r="2.2" fill="#cbd5e1" />
        <circle cx="570" cy="273" r="2.2" fill="#cbd5e1" />

        {/* Central Transmission Tunnel Rise */}
        <path d="M 470 280 C 470 252 490 245 515 245 C 540 245 550 258 550 280 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />

        {/* Front Firewall Bulkhead Structure */}
        <path d="M 660 280 C 675 235 695 210 715 215 C 730 220 735 250 740 280 Z" fill="#020617" stroke="#475569" strokeWidth="1.5" />

        {/* ── STRUCTURAL SUBFRAME MOUNTING CRADLES ── */}
        <g id="engine-chassis-cradles-biw" opacity="0.9">
          {/* Front Engine Subframe Cradle (X=710 to X=790) */}
          <rect x="710" y="258" width="80" height="12" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="715" y1="264" x2="785" y2="264" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="725" cy="264" r="2.5" fill="#f59e0b" />
          <circle cx="775" cy="264" r="2.5" fill="#f59e0b" />

          {/* Rear Suspension Subframe Cradle (X=195 to X=275) */}
          <rect x="195" y="258" width="80" height="12" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="200" y1="264" x2="270" y2="264" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="210" cy="264" r="2.5" fill="#f59e0b" />
          <circle cx="260" cy="264" r="2.5" fill="#f59e0b" />
        </g>
      </g>

      {/* ── LAYER 3: MAIN OUTER BODY-IN-WHITE SHELL (Proportional GT/Sedan Silhouette) ── */}
      <path
        d="M 885 240
           L 885 228
           C 870 215, 830 205, 780 195
           C 740 188, 700 180, 675 165
           C 625 130, 580 112, 490 110
           C 420 110, 360 120, 310 140
           C 260 165, 200 185, 150 192
           L 80 195
           L 75 210 L 85 235 L 75 250
           L 75 265 L 105 265 L 105 255 L 175 255
           C 175 220, 205 215, 240 215
           C 275 215, 305 220, 305 255
           L 305 295
           L 695 295
           L 695 255
           C 695 220, 725 215, 760 215
           C 795 215, 825 220, 825 255
           L 885 255 Z"
        fill="url(#biw-hdr-silver-body)"
        stroke={isHovered ? "#38bdf8" : "#0f172a"}
        strokeWidth={isHovered ? "3.0" : "2.0"}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#panel-ambient-occlusion)"
      />

      {/* ── LAYER 4: SHOULDER CHARACTER LINE SPECULAR REFLECTION (3D Volume Highlight) ── */}
      <path
        d="M 670 168 Q 550 118 490 112 Q 380 120 310 142"
        fill="none"
        stroke="url(#biw-shoulder-specular-glow)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 780 195 C 740 188, 700 180, 675 165"
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="2.0"
        strokeLinecap="round"
      />

      {/* Rear Fender Character Accent */}
      <path
        d="M 150 192 Q 220 185 305 220"
        fill="none"
        stroke="#475569"
        strokeWidth="1.8"
      />

      {/* ── LAYER 5: FRONT & REAR DOOR APERTURE CUTOUTS ── */}
      {/* Front Door Aperture (X=490 to X=665) */}
      <path
        d="M 660 168
           C 615 136, 560 125, 500 125
           L 500 282
           L 670 282
           C 680 220, 675 185, 660 168 Z"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Rear Door Aperture (X=310 to X=485) */}
      <path
        d="M 480 125
           C 425 125, 370 135, 325 152
           C 295 170, 275 200, 260 230
           C 255 255, 275 282, 305 282
           L 480 282 Z"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* ── LAYER 6: B-PILLAR CENTER COLUMN (At X=490) ── */}
      <path
        d="M 485 125 L 500 125 L 500 282 L 485 282 Z"
        fill="url(#biw-hdr-silver-body)"
        stroke="#0f172a"
        strokeWidth="1.8"
      />
      <rect x="489" y="145" width="7" height="35" rx="3" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
      <rect x="489" y="195" width="7" height="30" rx="3" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />

      {/* ── LAYER 7: LOWER ROCKER PANEL SILL & STAMPED SPOT WELDS ── */}
      <rect
        x="305"
        y="288"
        width="390"
        height="26"
        rx="3"
        fill="url(#al-extrusion-grad)"
        stroke="#0f172a"
        strokeWidth="2.0"
      />
      <line x1="310" y1="300" x2="690" y2="300" stroke="#475569" strokeWidth="1.5" />
      
      {/* Structural Swage Flange Holes along Rocker Panel */}
      <g transform="translate(330, 292)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(370, 292)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(410, 292)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(450, 292)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(490, 292)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(530, 292)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(570, 292)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(610, 292)"><use href="#swage-hole-sm-deep" /></g>
      <g transform="translate(650, 292)"><use href="#swage-hole-sm-deep" /></g>

      {/* Spot Welds Along Pinch Flange */}
      {Array.from({ length: 24 }).map((_, i) => (
        <circle key={i} cx={318 + i * 16} cy={308} r="1.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.5" />
      ))}

      {/* ── LAYER 8: FRONT STRUT TOWER & CRASH BOX FRAME (Centered at X=760) ── */}
      <rect x="745" y="202" width="30" height="20" rx="5" fill="#1e293b" stroke="#0f172a" strokeWidth="1.8" />
      <path d="M 740 190 L 760 185 L 780 190 Z" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1.5" />

      {/* Front Crash Box Honeycomb Horns */}
      <rect x="850" y="235" width="25" height="18" rx="2" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.5" />
      <circle cx="862" cy="244" r="2.2" fill="#0f172a" />

      {/* ── LAYER 9: REAR QUARTER PANEL & TAIL LIGHT NOTCH (Left Side) ── */}
      <polygon points="75,195 95,195 95,245 75,245" fill="#0f172a" stroke="#475569" strokeWidth="1.8" />
      <rect x="70" y="250" width="25" height="15" rx="2" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.8" />

      {/* Technical Blueprint Callout */}
      <text
        x="500"
        y="370"
        fill="#38bdf8"
        fontSize="10"
        fontFamily="monospace"
        textAnchor="middle"
        fontWeight="bold"
        letterSpacing="1"
      >
        HIGH-STRENGTH STAMPED STEEL UNIBODY CHASSIS (BIW) // ISO 8855 DATUM
      </text>
    </g>
  );
};
