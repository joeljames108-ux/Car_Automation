import React from "react";
import { projectIso, type ScreenPoint2D } from "../isoMath";

interface VBankEngineCoverIsoProps {
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
 * V-BANK SUPERCAR DRESS COVER (V6, V8, V10, V12) — 3D ISOMETRIC
 * ═══════════════════════════════════════════════════════════════════
 * Features:
 * - High-Gloss 2x2 Twill / Forged Carbon Fiber Twin-Bank Monocoque
 * - Billet Gold Anodized Raised Outer Bezel Perimeter
 * - Transparent Scratch-Resistant Quartz Glass Viewing Window
 * - CNC Gold-Rimmed ITB Velocity Stack Inspection Portholes
 * - Front Aerodynamic Ram-Air Induction Snout with Honeycomb Intake Grille
 * - Center Hypercar Emblem Medallion Plaque & Titanium Torx Hardware
 */
export const VBankEngineCoverIso: React.FC<VBankEngineCoverIsoProps> = ({
  label,
  BL,
  originScreen,
  materialFills,
}) => {
  const halfL = BL / 2;
  const P = (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen);

  const coverZ = 160;
  const coverH = 28;
  const coverW = 84;
  const xS = -halfL + 12;
  const xE = halfL - 8;

  // Main Outer Hull Points
  const tFL = P(xS, coverW / 2, coverZ + coverH);
  const tFR = P(xE, coverW / 2, coverZ + coverH);
  const tBL = P(xS, -coverW / 2, coverZ + coverH);
  const tBR = P(xE, -coverW / 2, coverZ + coverH);

  const bFL = P(xS, coverW / 2, coverZ);
  const bFR = P(xE, coverW / 2, coverZ);
  const bBL = P(xS, -coverW / 2, coverZ);
  const bBR = P(xE, -coverW / 2, coverZ);

  // Gold Bezel Frame (Raised Inner Window)
  const gfFL = P(xS + 20, coverW / 2 - 8, coverZ + coverH + 3.5);
  const gfFR = P(xE - 20, coverW / 2 - 8, coverZ + coverH + 3.5);
  const gfBL = P(xS + 20, -coverW / 2 + 8, coverZ + coverH + 3.5);
  const gfBR = P(xE - 20, -coverW / 2 + 8, coverZ + coverH + 3.5);

  // Transparent Quartz Glass Window
  const gwFL = P(xS + 24, coverW / 2 - 12, coverZ + coverH + 4);
  const gwFR = P(xE - 24, coverW / 2 - 12, coverZ + coverH + 4);
  const gwBL = P(xS + 24, -coverW / 2 + 12, coverZ + coverH + 4);
  const gwBR = P(xE - 24, -coverW / 2 + 12, coverZ + coverH + 4);

  // Front Aerodynamic Ram-Air Induction Snout
  const raFL = P(xS - 18, 28, coverZ + coverH + 5);
  const raFR = P(xS + 8, 28, coverZ + coverH + 5);
  const raBL = P(xS - 18, -8, coverZ + coverH + 5);
  const raBR = P(xS + 8, -8, coverZ + coverH + 5);

  const centerBadge = P(0, 0, coverZ + coverH + 5);

  // Number of Portholes based on V-Bank Cylinder Count
  const numPortholes = label.includes("v12") ? 6 : label.includes("v10") ? 5 : 4;
  const portholes = Array.from({ length: numPortholes }).map((_, idx) => {
    const px = xS + 34 + idx * ((xE - xS - 68) / (numPortholes - 1 || 1));
    return {
      left: P(px, 16, coverZ + coverH + 4.5),
      right: P(px, -16, coverZ + coverH + 4.5),
    };
  });

  return (
    <g id="cover-vbank-full-assembly">
      {/* ── 1. AMBIENT CONTACT DROP SHADOW ── */}
      <ellipse cx={originScreen.x} cy={originScreen.y + 16} rx={BL * 0.52} ry={30} fill="#000000" opacity={0.72} />

      {/* ── 2. LOWER BASE FLANGE SHROUD ── */}
      <path
        d={`M ${bFL.x} ${bFL.y} L ${bFR.x} ${bFR.y} L ${tFR.x} ${tFR.y} L ${tFL.x} ${tFL.y} Z`}
        fill={materialFills.flank}
        stroke="#090d16"
        strokeWidth="2.2"
      />
      <path
        d={`M ${bFR.x} ${bFR.y} L ${bBR.x} ${bBR.y} L ${tBR.x} ${tBR.y} L ${tFR.x} ${tFR.y} Z`}
        fill={materialFills.flank}
        stroke="#090d16"
        strokeWidth="2.2"
        opacity={0.85}
      />

      {/* ── 3. TOP CARBON FIBER MAIN DECK ── */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y} L ${tBL.x} ${tBL.y} Z`}
        fill={materialFills.main}
        stroke="#090d16"
        strokeWidth="2.4"
      />

      {/* Specular Edge Highlights */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y}`}
        stroke={materialFills.highlight}
        strokeWidth="1.8"
        opacity={0.9}
        strokeLinecap="round"
      />
      <path
        d={`M ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y}`}
        stroke={materialFills.highlight}
        strokeWidth="1.2"
        opacity={0.6}
        strokeLinecap="round"
      />

      {/* ── 4. GOLD ANODIZED BEZEL FRAME ── */}
      <path
        d={`M ${gfFL.x} ${gfFL.y} L ${gfFR.x} ${gfFR.y} L ${gfBR.x} ${gfBR.y} L ${gfBL.x} ${gfBL.y} Z`}
        fill="url(#gold-anodized)"
        stroke="#090d16"
        strokeWidth="1.8"
      />
      <path
        d={`M ${gfFL.x} ${gfFL.y} L ${gfFR.x} ${gfFR.y}`}
        stroke="#ffffff"
        strokeWidth="1.4"
        opacity={0.9}
      />

      {/* ── 5. TRANSPARENT QUARTZ GLASS VIEWING WINDOW ── */}
      <path
        d={`M ${gwFL.x} ${gwFL.y} L ${gwFR.x} ${gwFR.y} L ${gwBR.x} ${gwBR.y} L ${gwBL.x} ${gwBL.y} Z`}
        fill="url(#glass-tint)"
        stroke="#38bdf8"
        strokeWidth="1.2"
        opacity={0.92}
      />
      {/* Specular Diagonal Reflection Streaks */}
      <path
        d={`M ${gwFL.x + 10} ${gwFL.y} L ${gwFR.x - 35} ${gwFR.y - 14} L ${gwFR.x - 20} ${gwFR.y - 14} L ${gwFL.x + 25} ${gwFL.y} Z`}
        fill="#ffffff"
        opacity={0.28}
      />
      <path
        d={`M ${gwFL.x + 35} ${gwFL.y + 4} L ${gwFR.x - 12} ${gwFR.y - 8} L ${gwFR.x - 4} ${gwFR.y - 8} L ${gwFL.x + 43} ${gwFL.y + 4} Z`}
        fill="#ffffff"
        opacity={0.18}
      />

      {/* ── 6. GOLD-RIMMED ITB VELOCITY STACK PORTHOLES VISIBLE THROUGH GLASS ── */}
      {portholes.map((p, idx) => (
        <g key={`vbank-porthole-${idx}`}>
          {/* Left Bank Trumpet Bell */}
          <ellipse cx={p.left.x} cy={p.left.y} rx={6.5} ry={3.8} fill="#020617" stroke="url(#gold-anodized)" strokeWidth="1.3" />
          {/* Right Bank Trumpet Bell */}
          <ellipse cx={p.right.x} cy={p.right.y} rx={6.5} ry={3.8} fill="#020617" stroke="url(#gold-anodized)" strokeWidth="1.3" />
          {/* Internal Blue Velocity Stack Venturi Throat */}
          <circle cx={p.left.x} cy={p.left.y} r={1.8} fill="#38bdf8" opacity={0.7} />
          <circle cx={p.right.x} cy={p.right.y} r={1.8} fill="#38bdf8" opacity={0.7} />
        </g>
      ))}

      {/* ── 7. FRONT AERODYNAMIC RAM-AIR INDUCTION SCOOP ── */}
      <g id="vbank-ram-air-scoop">
        <path
          d={`M ${raFL.x} ${raFL.y} L ${raFR.x} ${raFR.y} L ${raBR.x} ${raBR.y} L ${raBL.x} ${raBL.y} Z`}
          fill="url(#carbon-twill)"
          stroke="#090d16"
          strokeWidth="2.0"
        />
        {/* Honeycomb Intake Orifice */}
        <circle cx={raFL.x + 12} cy={raFL.y - 5} r={9.0} fill="#020617" stroke="#38bdf8" strokeWidth="1.4" />
        <ellipse cx={raFL.x + 12} cy={raFL.y - 5} rx={6.0} ry={3.5} fill="#0f172a" stroke="#0284c7" strokeWidth="0.8" />
      </g>

      {/* ── 8. CENTER HYPERCAR EMBLEM MEDALLION BADGE ── */}
      <g id="vbank-medallion-badge">
        <circle cx={centerBadge.x} cy={centerBadge.y} r={11} fill="url(#gold-anodized)" stroke="#090d16" strokeWidth="1.8" />
        <circle cx={centerBadge.x} cy={centerBadge.y} r={8.5} fill="#0f172a" stroke="#78350f" strokeWidth="0.8" />
        <circle cx={centerBadge.x} cy={centerBadge.y} r={3.8} fill="#38bdf8" />
        <text
          x={centerBadge.x - 7}
          y={centerBadge.y + 16}
          fill="#facc15"
          fontSize="4.2"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
        >
          {label.includes("v12") ? "V12·6.5L·QUAD-CAM" : label.includes("v10") ? "V10·5.2L·HIGH-REV" : label.includes("v8") ? "V8·TWIN-TURBO" : "V6·24V·RACING"}
        </text>
      </g>
    </g>
  );
};
