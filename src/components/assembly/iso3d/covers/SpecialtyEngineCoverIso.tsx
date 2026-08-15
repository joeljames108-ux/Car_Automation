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
 * Covers:
 * 1. ROTARY WANKEL (13B / 20B / 26B) — Triangular Reuleaux Rotor-Apex Carbon Shroud
 * 2. RADIAL AERO (7-Cyl / 9-Cyl) — Circular Cylindrical Nose Cowling & Spinner
 * 3. EV 800V SiC INVERTER — High-Voltage Carbon-Ceramic Inverter Enclosure & Orange Glands
 * 4. HYBRID APEX MOTOR — Dual Electric Motor-Generator Carbon Housing
 */
export const SpecialtyEngineCoverIso: React.FC<SpecialtyEngineCoverIsoProps> = ({
  type,
  label,
  BL,
  originScreen,
  materialFills,
}) => {
  const P = (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen);

  // ── 1. ROTARY WANKEL DRESS COVER ──
  if (type === "rotary") {
    const centerPt = P(0, 0, 155);
    return (
      <g id="cover-rotary-specialty">
        {/* Contact Shadow */}
        <ellipse cx={originScreen.x} cy={originScreen.y + 14} rx={60} ry={25} fill="#000000" opacity={0.65} />

        {/* Outer Reuleaux-Shaped Carbon Shroud */}
        <ellipse cx={centerPt.x} cy={centerPt.y} rx={54} ry={42} fill={materialFills.main} stroke="#090d16" strokeWidth="2.4" />
        <ellipse cx={centerPt.x} cy={centerPt.y} rx={44} ry={32} fill="#090d16" stroke="#ef4444" strokeWidth="1.6" />

        {/* Center Eccentric Shaft Billet Hub */}
        <circle cx={centerPt.x} cy={centerPt.y} r={16} fill="url(#gold-anodized)" stroke="#78350f" strokeWidth="1.4" />
        <circle cx={centerPt.x} cy={centerPt.y} r={11} fill="#0f172a" />
        <circle cx={centerPt.x} cy={centerPt.y} r={4.5} fill="#38bdf8" />

        {/* Rotor Apex Tip Seals Indicator Notches (3 vertices) */}
        {[0, 120, 240].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const nx = centerPt.x + 36 * Math.cos(rad);
          const ny = centerPt.y + 24 * Math.sin(rad);
          return (
            <circle key={`rotor-seal-notch-${i}`} cx={nx} cy={ny} r={2.5} fill="#facc15" stroke="#090d16" strokeWidth="0.8" />
          );
        })}

        {/* Rotary Plaque */}
        <rect x={centerPt.x - 24} y={centerPt.y + 18} width={48} height={8.5} rx={2} fill="#090d16" stroke="#ef4444" strokeWidth="0.8" />
        <text x={centerPt.x} y={centerPt.y + 24.5} fill="#ef4444" fontSize="4.8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
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
        {/* Contact Shadow */}
        <ellipse cx={originScreen.x} cy={originScreen.y + 16} rx={65} ry={28} fill="#000000" opacity={0.65} />

        {/* Circular Aeronautical Nose Ring Cowl */}
        <circle cx={centerPt.x} cy={centerPt.y} r={62} fill={materialFills.main} stroke="#090d16" strokeWidth="2.6" />
        <circle cx={centerPt.x} cy={centerPt.y} r={45} fill="#090d16" stroke="#38bdf8" strokeWidth="1.6" />

        {/* Magnetos Front Reduction Gearcase */}
        <circle cx={centerPt.x} cy={centerPt.y} r={22} fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="1.8" />
        <circle cx={centerPt.x} cy={centerPt.y} r={10} fill="#ef4444" />

        {/* Radial Pushrod Shroud Tubes (9-Cylinder Star Array) */}
        {Array.from({ length: 9 }).map((_, i) => {
          const rad = (i * 40 * Math.PI) / 180;
          const p1x = centerPt.x + 22 * Math.cos(rad);
          const p1y = centerPt.y + 22 * Math.sin(rad);
          const p2x = centerPt.x + 55 * Math.cos(rad);
          const p2y = centerPt.y + 55 * Math.sin(rad);
          return (
            <line key={`radial-pushrod-cover-${i}`} x1={p1x} y1={p1y} x2={p2x} y2={p2y} stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
          );
        })}
      </g>
    );
  }

  // ── 3. EV 800V SiC INVERTER SHIELD ──
  if (type === "ev" || type === "hybrid") {
    const centerPt = P(0, 0, 150);
    return (
      <g id="cover-ev-specialty">
        {/* Ground Shadow */}
        <ellipse cx={originScreen.x} cy={originScreen.y + 14} rx={65} ry={26} fill="#000000" opacity={0.65} />

        {/* Silicon Carbide High-Voltage Housing Box */}
        <rect
          x={centerPt.x - 52}
          y={centerPt.y - 34}
          width={104}
          height={68}
          rx={9}
          fill={materialFills.main}
          stroke="#9333ea"
          strokeWidth="2.2"
        />
        <rect
          x={centerPt.x - 44}
          y={centerPt.y - 27}
          width={88}
          height={54}
          rx={7}
          fill="#090d16"
          stroke="#a855f7"
          strokeWidth="1.4"
        />

        {/* Danger High Voltage 800V Warning Badge */}
        <rect
          x={centerPt.x - 34}
          y={centerPt.y - 14}
          width={68}
          height={16}
          rx={3.5}
          fill="#581c87"
          stroke="#c084fc"
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

        {/* 3-Phase AC High-Current Orange Cable Gland Bushings */}
        {[-22, 0, 22].map((ox, i) => (
          <g key={`ev-phase-gland-${i}`}>
            <circle cx={centerPt.x + ox} cy={centerPt.y + 20} r={5.2} fill="#ea580c" stroke="#c2410c" strokeWidth="1.2" />
            <circle cx={centerPt.x + ox} cy={centerPt.y + 20} r={2.4} fill="#020617" />
          </g>
        ))}

        {/* Liquid Glycol Chiller Manifold Pipe Ports */}
        <circle cx={centerPt.x - 38} cy={centerPt.y} r={3.8} fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />
        <circle cx={centerPt.x + 38} cy={centerPt.y} r={3.8} fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />
      </g>
    );
  }

  return null;
};
