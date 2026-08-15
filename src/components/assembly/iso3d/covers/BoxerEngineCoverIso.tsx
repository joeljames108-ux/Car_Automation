import React from "react";
import { projectIso, type ScreenPoint2D } from "../isoMath";

interface BoxerEngineCoverIsoProps {
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
 * BOXER / FLAT ENGINE DRESS COVER (H4, H6) — 3D ISOMETRIC
 * ═══════════════════════════════════════════════════════════════════
 * Features:
 * - Low-Profile Horizontal Carbon Fiber Shroud for Low Center-of-Gravity
 * - Raised Top-Mount Intercooler (TMIC) Air Induction Scoop with Aluminum Cooling Fins
 * - Left & Right Cylinder Bank Thermal Heat Shield Flanges
 * - Cast Silicone Charge Pipe Couplers & Blow-Off Valve Relief
 * - Laser-Etched "BOXER-6 4.0L DOHC 24V" / "WRX STI BOXER TURBO" Plaque
 */
export const BoxerEngineCoverIso: React.FC<BoxerEngineCoverIsoProps> = ({
  label,
  BL,
  originScreen,
  materialFills,
}) => {
  const halfL = BL / 2;
  const P = (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen);

  const coverZ = 124;
  const coverH = 22;
  const coverW = 82;
  const xS = -halfL + 12;
  const xE = halfL - 12;

  // Main Outer Hull Points
  const tFL = P(xS, coverW / 2, coverZ + coverH);
  const tFR = P(xE, coverW / 2, coverZ + coverH);
  const tBL = P(xS, -coverW / 2, coverZ + coverH);
  const tBR = P(xE, -coverW / 2, coverZ + coverH);

  const bFL = P(xS, coverW / 2, coverZ);
  const bFR = P(xE, coverW / 2, coverZ);
  const bBL = P(xS, -coverW / 2, coverZ);
  const bBR = P(xE, -coverW / 2, coverZ);

  // Top-Mount Intercooler Shroud Duct
  const icFL = P(xS + 20, 26, coverZ + coverH + 9);
  const icFR = P(xE - 20, 26, coverZ + coverH + 9);
  const icBL = P(xS + 20, -26, coverZ + coverH + 9);
  const icBR = P(xE - 20, -26, coverZ + coverH + 9);

  // Silicone Charge Pipe Coupler
  const chargePipe = P(xE - 14, -28, coverZ + coverH + 4);
  const bovPort = P(xE - 10, 28, coverZ + coverH + 2);

  return (
    <g id="cover-boxer-full-assembly">
      {/* ── 1. AMBIENT GROUND DROP SHADOW ── */}
      <ellipse cx={originScreen.x} cy={originScreen.y + 14} rx={BL * 0.52} ry={28} fill="#000000" opacity={0.65} />

      {/* ── 2. LOWER BASE FLANGE SHROUD ── */}
      <path
        d={`M ${bFL.x} ${bFL.y} L ${bFR.x} ${bFR.y} L ${tFR.x} ${tFR.y} L ${tFL.x} ${tFL.y} Z`}
        fill={materialFills.flank}
        stroke="#090d16"
        strokeWidth="2.0"
      />
      <path
        d={`M ${bFR.x} ${bFR.y} L ${bBR.x} ${bBR.y} L ${tBR.x} ${tBR.y} L ${tFR.x} ${tFR.y} Z`}
        fill={materialFills.flank}
        stroke="#090d16"
        strokeWidth="2.0"
        opacity={0.82}
      />

      {/* ── 3. LOW-PROFILE MAIN HORIZONTAL DECK ── */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y} L ${tBL.x} ${tBL.y} Z`}
        fill={materialFills.main}
        stroke="#090d16"
        strokeWidth="2.2"
      />

      {/* ── 4. RAISED TOP-MOUNT INTERCOOLER (TMIC) AIR INDUCTION SCOOP ── */}
      <path
        d={`M ${icFL.x} ${icFL.y} L ${icFR.x} ${icFR.y} L ${icBR.x} ${icBR.y} L ${icBL.x} ${icBL.y} Z`}
        fill="url(#valve-cover-red-top)"
        stroke="#450a0a"
        strokeWidth="1.8"
      />
      {/* Intercooler Outer Bevel Highlight */}
      <path
        d={`M ${icFL.x} ${icFL.y} L ${icFR.x} ${icFR.y}`}
        stroke="#fca5a5"
        strokeWidth="1.4"
        opacity={0.9}
      />

      {/* Intercooler Heat Exchanger Micro Cooling Core Fins */}
      {Array.from({ length: 10 }).map((_, i) => {
        const fx = icFL.x + 6 + i * ((icFR.x - icFL.x - 12) / 9);
        return (
          <line
            key={`boxer-tmic-fin-${i}`}
            x1={fx}
            y1={icFL.y + 3}
            x2={fx}
            y2={icBL.y - 3}
            stroke="#cbd5e1"
            strokeWidth="1.0"
          />
        );
      })}

      {/* ── 5. CHARGE PIPES & BLOW-OFF VALVE (BOV) ── */}
      <g id="boxer-charge-piping">
        {/* Reinforced Silicone Coupler */}
        <circle cx={chargePipe.x} cy={chargePipe.y} r={7.5} fill="#1e3a8a" stroke="#172554" strokeWidth="1.2" />
        <circle cx={chargePipe.x} cy={chargePipe.y} r={4.5} fill="#020617" />
        {/* T-Bolt Clamps */}
        <ellipse cx={chargePipe.x} cy={chargePipe.y} rx={8.5} ry={5.5} fill="none" stroke="#e2e8f0" strokeWidth="1.0" strokeDasharray="2 1.5" />

        {/* Billet Atmospheric Blow-Off Valve */}
        <ellipse cx={bovPort.x} cy={bovPort.y} rx={5.5} ry={3.5} fill="url(#gold-anodized)" stroke="#78350f" strokeWidth="1.0" />
        <circle cx={bovPort.x} cy={bovPort.y - 1} r={2.0} fill="#ca8a04" />
      </g>

      {/* ── 6. STI / GT3 RS BOXER BADGE PLAQUE ── */}
      <g id="boxer-logo-badge" opacity={0.88}>
        <rect
          x={tFL.x + 22}
          y={tFL.y + 6}
          width={46}
          height={8.5}
          rx={2.0}
          fill="#090d16"
          stroke="#eab308"
          strokeWidth="0.9"
        />
        <text
          x={tFL.x + 25}
          y={tFL.y + 12.5}
          fill="#eab308"
          fontSize="4.6"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {label.includes("h6") ? "BOXER-6·4.0L·DOHC·24V" : "BOXER-4·2.5L·TURBO"}
        </text>
      </g>

      {/* ── 7. PERIMETER RUBBER ISOLATOR MOUNTING GROMMETS ── */}
      {[0.18, 0.5, 0.82].map((t, i) => {
        const bx = xS + t * (xE - xS);
        const bPt1 = P(bx, coverW / 2 - 3, coverZ + coverH + 1);
        const bPt2 = P(bx, -coverW / 2 + 3, coverZ + coverH + 1);
        return (
          <g key={`boxer-grommet-${i}`}>
            <circle cx={bPt1.x} cy={bPt1.y} r={3.0} fill="#020617" stroke="#475569" strokeWidth="0.8" />
            <circle cx={bPt1.x} cy={bPt1.y} r={1.2} fill="#cbd5e1" />
            <circle cx={bPt2.x} cy={bPt2.y} r={3.0} fill="#020617" stroke="#475569" strokeWidth="0.8" />
            <circle cx={bPt2.x} cy={bPt2.y} r={1.2} fill="#cbd5e1" />
          </g>
        );
      })}
    </g>
  );
};
