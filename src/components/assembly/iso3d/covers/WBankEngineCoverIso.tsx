import React from "react";
import { projectIso, type ScreenPoint2D } from "../isoMath";

interface WBankEngineCoverIsoProps {
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
 * W-BANK HYPERCAR ENGINE COVER (W12, W16, W18) — 3D ISOMETRIC
 * ═══════════════════════════════════════════════════════════════════
 * Features:
 * - Monumental Quad-Bank Carbon Composite Monocoque (Bugatti Chiron / Veyron Architecture)
 * - Dual Left & Right Symmetrical Intake Plenum Arches with Billet Gold Trim
 * - CNC Hexagonal Aluminum Mesh Heat Dissipation Louvers (4x Turbo Cooling)
 * - Titanium Center Backbone Fasteners & High-Speed Dynamic Pressure Ports
 * - "W16 8.0L QUAD-TURBO 1500HP" Gold Plaque & Carbon Twill Texture
 */
export const WBankEngineCoverIso: React.FC<WBankEngineCoverIsoProps> = ({
  label,
  BL,
  originScreen,
  materialFills,
}) => {
  const halfL = BL / 2;
  const P = (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen);

  const coverZ = 162;
  const coverH = 32;
  const coverW = 92;
  const xS = -halfL + 8;
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

  // Quad Plenum Double Carbon Arches
  const arch1L = P(xS + 20, 32, coverZ + coverH + 7);
  const arch1R = P(xE - 20, 32, coverZ + coverH + 7);
  const arch2L = P(xS + 20, -32, coverZ + coverH + 7);
  const arch2R = P(xE - 20, -32, coverZ + coverH + 7);

  return (
    <g id="cover-wbank-full-assembly">
      {/* ── 1. AMBIENT CONTACT DROP SHADOW ── */}
      <ellipse cx={originScreen.x} cy={originScreen.y + 18} rx={BL * 0.54} ry={32} fill="#000000" opacity={0.75} />

      {/* ── 2. MASSIVE LOWER BASE FLANGE SHROUD ── */}
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
        opacity={0.88}
      />

      {/* ── 3. MASSIVE QUAD-BANK MAIN CARBON DECK ── */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y} L ${tBL.x} ${tBL.y} Z`}
        fill={materialFills.main}
        stroke="#090d16"
        strokeWidth="2.6"
      />

      {/* Edge Specular Glints */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y}`}
        stroke={materialFills.highlight}
        strokeWidth="2.0"
        opacity={0.9}
        strokeLinecap="round"
      />

      {/* ── 4. LEFT BANK INTAKE PLENUM ARCH (Billet Gold Bezel) ── */}
      <path
        d={`M ${arch1L.x} ${arch1L.y} L ${arch1R.x} ${arch1R.y} L ${arch1R.x - 7} ${arch1R.y + 9} L ${arch1L.x - 7} ${arch1L.y + 9} Z`}
        fill="url(#gold-anodized)"
        stroke="#78350f"
        strokeWidth="1.6"
      />
      <path
        d={`M ${arch1L.x} ${arch1L.y} L ${arch1R.x} ${arch1R.y}`}
        stroke="#ffffff"
        strokeWidth="1.2"
        opacity={0.85}
      />

      {/* ── 5. RIGHT BANK INTAKE PLENUM ARCH (Billet Gold Bezel) ── */}
      <path
        d={`M ${arch2L.x} ${arch2L.y} L ${arch2R.x} ${arch2R.y} L ${arch2R.x - 7} ${arch2R.y - 9} L ${arch2L.x - 7} ${arch2L.y - 9} Z`}
        fill="url(#gold-anodized)"
        stroke="#78350f"
        strokeWidth="1.6"
      />
      <path
        d={`M ${arch2L.x} ${arch2L.y} L ${arch2R.x} ${arch2R.y}`}
        stroke="#ffffff"
        strokeWidth="1.2"
        opacity={0.85}
      />

      {/* ── 6. CENTRAL ALUMINUM MESH HEAT DISSIPATION LOUVERS ── */}
      {Array.from({ length: 12 }).map((_, i) => {
        const lx = xS + 24 + i * ((xE - xS - 48) / 11);
        const p1 = P(lx, 15, coverZ + coverH + 2.5);
        const p2 = P(lx, -15, coverZ + coverH + 2.5);
        return (
          <g key={`wbank-louver-${i}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#020617" strokeWidth="2.0" />
            <line x1={p1.x} y1={p1.y - 0.6} x2={p2.x} y2={p2.y - 0.6} stroke="#94a3b8" strokeWidth="1.2" />
          </g>
        );
      })}

      {/* ── 7. BUGATTI / HYPERCAR W16 MEDALLION PLAQUE ── */}
      <g id="w16-hypercar-plaque">
        <rect
          x={originScreen.x - 36}
          y={originScreen.y - 48}
          width={72}
          height={12}
          rx={2.5}
          fill="#090d16"
          stroke="url(#gold-anodized)"
          strokeWidth="1.2"
        />
        <text
          x={originScreen.x}
          y={originScreen.y - 40}
          fill="#facc15"
          fontSize="5.2"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
        >
          {label.includes("w18") ? "W18·9.0L·TRI-BANK·1800HP" : label.includes("w16") ? "W16·8.0L·QUAD-TURBO·1500HP" : "W12·6.0L·TWIN-TURBO"}
        </text>
      </g>

      {/* ── 8. PERIMETER AEROSPACE TITANIUM FASTENERS ── */}
      {[0.12, 0.35, 0.65, 0.88].map((t, i) => {
        const bx = xS + t * (xE - xS);
        const bPt1 = P(bx, coverW / 2 - 3, coverZ + coverH + 1);
        const bPt2 = P(bx, -coverW / 2 + 3, coverZ + coverH + 1);
        return (
          <g key={`wbank-bolt-${i}`}>
            <circle cx={bPt1.x} cy={bPt1.y} r={2.5} fill="#0f172a" stroke="#facc15" strokeWidth="0.8" />
            <circle cx={bPt1.x} cy={bPt1.y} r={1.0} fill="#ffffff" />
            <circle cx={bPt2.x} cy={bPt2.y} r={2.5} fill="#0f172a" stroke="#facc15" strokeWidth="0.8" />
            <circle cx={bPt2.x} cy={bPt2.y} r={1.0} fill="#ffffff" />
          </g>
        );
      })}
    </g>
  );
};
