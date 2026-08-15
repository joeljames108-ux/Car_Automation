import React from "react";
import { projectIso, type ScreenPoint2D } from "../isoMath";

interface SpecialtyEngineCoverIsoProps {
  type: "rotary" | "radial" | "ev" | "hybrid";
  label: string;
  BL: number;
  originScreen: ScreenPoint2D;
  materialFills: {
    main: string;
    flank: string;
    accent: string;
    highlight: string;
    shadow: string;
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * SPECIALTY ENGINE & POWERTRAIN COVERS — 3D ISOMETRIC
 * ═══════════════════════════════════════════════════════════════════
 * Covers with authentic organic curves:
 * 1. ROTARY WANKEL (13B / 20B / 26B) — Curved Reuleaux Triangle Rotor-Apex Carbon Shroud
 * 2. RADIAL AERO (7-Cyl / 9-Cyl) — Sculpted Aeronautical Cowl & Aerofoil Pushrod Fairings
 * 3. EV 800V SiC INVERTER — Sculpted Carbon-Ceramic Enclosure with Sweeping High-Voltage Orange Hardlines
 * 4. HYBRID APEX MOTOR — Dual Axial-Flux Motor Carbon Housing with Radiused Heatsinks
 */
export const SpecialtyEngineCoverIso: React.FC<SpecialtyEngineCoverIsoProps> = ({
  type,
  label,
  BL,
  originScreen,
  materialFills,
}) => {
  const P = (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen);

  // ── 1. ROTARY WANKEL DRESS COVER (Curved Reuleaux Rotor Epitrochoid) ──
  if (type === "rotary") {
    const centerPt = P(0, 0, 155);

    // True Curved Reuleaux Triangular Vertices & Control Points
    const rOuter = 56;
    const v1 = { x: centerPt.x, y: centerPt.y - rOuter };
    const v2 = { x: centerPt.x + rOuter * 0.866, y: centerPt.y + rOuter * 0.5 };
    const v3 = { x: centerPt.x - rOuter * 0.866, y: centerPt.y + rOuter * 0.5 };

    const rInner = 44;
    const iv1 = { x: centerPt.x, y: centerPt.y - rInner };
    const iv2 = { x: centerPt.x + rInner * 0.866, y: centerPt.y + rInner * 0.5 };
    const iv3 = { x: centerPt.x - rInner * 0.866, y: centerPt.y + rInner * 0.5 };

    return (
      <g id="cover-rotary-specialty">
        {/* Soft Volumetric Contact Shadow */}
        <ellipse cx={originScreen.x} cy={originScreen.y + 14} rx={64} ry={26} fill="#000000" opacity={0.65} />

        {/* Outer Reuleaux Triangular Carbon Shroud with Arched Flanks */}
        <path
          d={`M ${v1.x} ${v1.y}
              Q ${centerPt.x + rOuter * 0.7} ${centerPt.y - rOuter * 0.3} ${v2.x} ${v2.y}
              Q ${centerPt.x} ${centerPt.y + rOuter * 0.85} ${v3.x} ${v3.y}
              Q ${centerPt.x - rOuter * 0.7} ${centerPt.y - rOuter * 0.3} ${v1.x} ${v1.y}
              Z`}
          fill={materialFills.main}
          stroke="#090d16"
          strokeWidth="2.6"
        />

        {/* Inner Anodized Accent Trim with Arched Flanks */}
        <path
          d={`M ${iv1.x} ${iv1.y}
              Q ${centerPt.x + rInner * 0.7} ${centerPt.y - rInner * 0.3} ${iv2.x} ${iv2.y}
              Q ${centerPt.x} ${centerPt.y + rInner * 0.85} ${iv3.x} ${iv3.y}
              Q ${centerPt.x - rInner * 0.7} ${centerPt.y - rInner * 0.3} ${iv1.x} ${iv1.y}
              Z`}
          fill="#090d16"
          stroke="#ef4444"
          strokeWidth="1.8"
        />

        {/* Center Eccentric Shaft Billet Hub */}
        <circle cx={centerPt.x} cy={centerPt.y} r={18} fill="url(#gold-anodized)" stroke="#78350f" strokeWidth="1.5" />
        <circle cx={centerPt.x} cy={centerPt.y} r={12} fill="#0f172a" stroke="#ffffff" strokeWidth="0.6" opacity="0.9" />
        <circle cx={centerPt.x} cy={centerPt.y} r={5.0} fill="#38bdf8" />

        {/* 3 Rotor Apex Tip Seal Buttons */}
        {[v1, v2, v3].map((pt, i) => (
          <g key={`rotor-apex-tip-${i}`}>
            <circle cx={pt.x} cy={pt.y} r={4.0} fill="#ca8a04" stroke="#090d16" strokeWidth="1.0" />
            <circle cx={pt.x} cy={pt.y} r={1.8} fill="#fef08a" />
          </g>
        ))}

        {/* Rotary Identification Plaque with Radiused Bevels */}
        <rect x={centerPt.x - 26} y={centerPt.y + 18} width={52} height={10} rx={3} fill="#090d16" stroke="#ef4444" strokeWidth="1.0" />
        <text x={centerPt.x} y={centerPt.y + 25.2} fill="#ef4444" fontSize="5.0" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          {label.includes("20b") ? "20B-3ROTOR·TURBO" : label.includes("26b") ? "26B-4ROTOR·LEMANS" : "13B-REW·TWIN-TURBO"}
        </text>
      </g>
    );
  }

  // ── 2. RADIAL AERO NOSE COWL ──
  if (type === "radial") {
    const centerPt = P(0, 0, 148);
    return (
      <g id="cover-radial-specialty">
        <ellipse cx={originScreen.x} cy={originScreen.y + 16} rx={65} ry={28} fill="#000000" opacity={0.65} />

        {/* Circular Aeronautical Nose Ring Cowl */}
        <circle cx={centerPt.x} cy={centerPt.y} r={62} fill={materialFills.main} stroke="#090d16" strokeWidth="2.6" />
        <circle cx={centerPt.x} cy={centerPt.y} r={46} fill="#090d16" stroke="#38bdf8" strokeWidth="1.8" />

        {/* Magnetos Front Reduction Gearcase */}
        <circle cx={centerPt.x} cy={centerPt.y} r={22} fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="1.8" />
        <circle cx={centerPt.x} cy={centerPt.y} r={10} fill="#ef4444" />

        {/* Radial Pushrod Shroud Tubes (9-Cylinder Star Array with Curved Fairings) */}
        {Array.from({ length: 9 }).map((_, i) => {
          const rad = (i * 40 * Math.PI) / 180;
          const p1x = centerPt.x + 22 * Math.cos(rad);
          const p1y = centerPt.y + 22 * Math.sin(rad);
          const p2x = centerPt.x + 56 * Math.cos(rad);
          const p2y = centerPt.y + 56 * Math.sin(rad);
          return (
            <line key={`radial-pushrod-cover-${i}`} x1={p1x} y1={p1y} x2={p2x} y2={p2y} stroke="#cbd5e1" strokeWidth="2.2" strokeLinecap="round" />
          );
        })}
      </g>
    );
  }

  // ── 3. EV / HYBRID 800V SiC INVERTER SHIELD WITH SWEEPING CABLES ──
  if (type === "ev" || type === "hybrid") {
    const centerPt = P(0, 0, 150);
    return (
      <g id="cover-ev-specialty">
        <ellipse cx={originScreen.x} cy={originScreen.y + 14} rx={68} ry={28} fill="#000000" opacity={0.65} />

        {/* Silicon Carbide High-Voltage Housing with Radiused Corners */}
        <rect
          x={centerPt.x - 54}
          y={centerPt.y - 36}
          width={108}
          height={72}
          rx={12}
          fill={materialFills.main}
          stroke="#9333ea"
          strokeWidth="2.4"
        />
        <rect
          x={centerPt.x - 46}
          y={centerPt.y - 28}
          width={92}
          height={56}
          rx={9}
          fill="#090d16"
          stroke="#c084fc"
          strokeWidth="1.6"
        />

        {/* Danger High Voltage 800V Warning Badge */}
        <rect
          x={centerPt.x - 36}
          y={centerPt.y - 14}
          width={72}
          height={16}
          rx={4}
          fill="#581c87"
          stroke="#e9d5ff"
          strokeWidth="1.0"
        />
        <text
          x={centerPt.x}
          y={centerPt.y - 3}
          fill="#f3e8ff"
          fontSize="5.4"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
        >
          ⚡ 800V·SiC·DUAL-INVERTER
        </text>

        {/* 3 Sweeping High-Voltage Orange Power Cables (Curved Bézier Paths) */}
        {[-22, 0, 22].map((ox, i) => (
          <g key={`ev-phase-gland-${i}`}>
            <path
              d={`M ${centerPt.x + ox} ${centerPt.y + 20}
                  Q ${centerPt.x + ox + 6} ${centerPt.y + 36} ${centerPt.x + ox + 18} ${centerPt.y + 44}`}
              fill="none"
              stroke="#f97316"
              strokeWidth="5.0"
              strokeLinecap="round"
            />
            <path
              d={`M ${centerPt.x + ox} ${centerPt.y + 20}
                  Q ${centerPt.x + ox + 6} ${centerPt.y + 36} ${centerPt.x + ox + 18} ${centerPt.y + 44}`}
              fill="none"
              stroke="#fef08a"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.85"
            />
            <circle cx={centerPt.x + ox} cy={centerPt.y + 20} r={5.2} fill="#ea580c" stroke="#c2410c" strokeWidth="1.2" />
          </g>
        ))}

        {/* Liquid Glycol Chiller Manifold Pipe Ports with Radiused Fillet */}
        <circle cx={centerPt.x - 40} cy={centerPt.y} r={4.2} fill="#0284c7" stroke="#38bdf8" strokeWidth="1.0" />
        <circle cx={centerPt.x + 40} cy={centerPt.y} r={4.2} fill="#0284c7" stroke="#38bdf8" strokeWidth="1.0" />
      </g>
    );
  }

  return null;
};
