import React from "react";
import { projectIso, type ScreenPoint2D } from "../isoMath";

interface InlineEngineCoverIsoProps {
  label: string;
  numCyls: number;
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
 * INLINE ENGINE DRESS COVER (I3, I4, I6) — 3D ISOMETRIC
 * ═══════════════════════════════════════════════════════════════════
 * Features:
 * - High-Modulus Pre-Preg Dry Carbon Fiber Shell
 * - Recessed Central Coil-Pack Channel with Individual Plug Well Access
 * - Billet Gold Knurled Oil Filler Cap & Anodized Dipstick Pull Ring
 * - PCV Positive Crankcase Ventilation Rubber Breather Hoses
 * - Laser-Etched DOHC Specification Plaque & Titanium Torx Fasteners
 */
export const InlineEngineCoverIso: React.FC<InlineEngineCoverIsoProps> = ({
  label,
  numCyls,
  BL,
  originScreen,
  materialFills,
}) => {
  const halfL = BL / 2;
  const P = (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen);

  const coverZ = 158;
  const coverH = 26;
  const coverW = 58;
  const xS = -halfL + 10;
  const xE = halfL - 10;

  // Main Outer Hull Points
  const tFL = P(xS, coverW / 2, coverZ + coverH);
  const tFR = P(xE, coverW / 2, coverZ + coverH);
  const tBL = P(xS, -coverW / 2, coverZ + coverH);
  const tBR = P(xE, -coverW / 2, coverZ + coverH);

  const bFL = P(xS, coverW / 2, coverZ);
  const bFR = P(xE, coverW / 2, coverZ);
  const bBL = P(xS, -coverW / 2, coverZ);
  const bBR = P(xE, -coverW / 2, coverZ);

  // Recessed Coil Pack Central Channel Points
  const cvFL = P(xS + 18, 14, coverZ + coverH - 7);
  const cvFR = P(xE - 18, 14, coverZ + coverH - 7);
  const cvBL = P(xS + 18, -14, coverZ + coverH - 7);
  const cvBR = P(xE - 18, -14, coverZ + coverH - 7);

  // CNC Billet Oil Filler Cap
  const oilCap = P(xS + 16, coverW / 2 - 11, coverZ + coverH + 5);
  // Anodized Dipstick Pull Ring
  const dipstick = P(xE - 12, coverW / 2 - 5, coverZ + coverH + 7);
  // PCV Breather Hose Port
  const pcvPort = P(xE - 14, -coverW / 2 + 8, coverZ + coverH);

  // Coil Pack Node Spacing
  const coilNodes = Array.from({ length: numCyls }).map((_, i) => {
    const cx = xS + 26 + i * ((xE - xS - 52) / (numCyls - 1 || 1));
    return {
      plugPt: P(cx, 0, coverZ + coverH - 5),
      wirePt: P(cx, -11, coverZ + coverH - 5),
      boltPt: P(cx + 4, 6, coverZ + coverH - 5),
    };
  });

  return (
    <g id="cover-inline-full-assembly">
      {/* ── 1. AMBIENT CONTACT OCCLUSION SHADOW ── */}
      <ellipse cx={originScreen.x} cy={originScreen.y + 12} rx={BL * 0.48} ry={24} fill="#000000" opacity={0.68} />

      {/* ── 2. LOWER SKIRT FLANGE WALLS ── */}
      {/* Front Flange Wall */}
      <path
        d={`M ${bFL.x} ${bFL.y} L ${bFR.x} ${bFR.y} L ${tFR.x} ${tFR.y} L ${tFL.x} ${tFL.y} Z`}
        fill={materialFills.flank}
        stroke="#090d16"
        strokeWidth="2.0"
      />
      {/* Right Flange Wall */}
      <path
        d={`M ${bFR.x} ${bFR.y} L ${bBR.x} ${bBR.y} L ${tBR.x} ${tBR.y} L ${tFR.x} ${tFR.y} Z`}
        fill={materialFills.flank}
        stroke="#090d16"
        strokeWidth="2.0"
        opacity={0.82}
      />

      {/* ── 3. TOP CARBON FIBER MAIN DECK ── */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y} L ${tBL.x} ${tBL.y} Z`}
        fill={materialFills.main}
        stroke="#090d16"
        strokeWidth="2.2"
      />

      {/* Specular Front Edge Glint */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y}`}
        stroke={materialFills.highlight}
        strokeWidth="1.6"
        opacity={0.85}
        strokeLinecap="round"
      />

      {/* ── 4. RECESSED COIL-PACK CENTRAL CHANNEL ── */}
      <path
        d={`M ${cvFL.x} ${cvFL.y} L ${cvFR.x} ${cvFR.y} L ${cvBR.x} ${cvBR.y} L ${cvBL.x} ${cvBL.y} Z`}
        fill="#090d16"
        stroke="#1e293b"
        strokeWidth="1.8"
      />
      {/* Channel Depth Shadow */}
      <path
        d={`M ${cvFL.x} ${cvFL.y} L ${cvBL.x} ${cvBL.y} L ${cvBR.x} ${cvBR.y}`}
        fill="none"
        stroke="#020617"
        strokeWidth="2.2"
        opacity={0.7}
      />

      {/* ── 5. INDIVIDUAL IGNITION COIL PACKS & WIRING LOOM ── */}
      {coilNodes.map((node, idx) => (
        <g key={`inline-coil-pack-${idx}`}>
          {/* Coil Pack Module Body */}
          <rect
            x={node.plugPt.x - 6}
            y={node.plugPt.y - 5}
            width={12}
            height={10}
            rx={2.5}
            fill={materialFills.accent}
            stroke="#090d16"
            strokeWidth="1.0"
          />
          {/* Central Spark Plug Well Cap */}
          <circle cx={node.plugPt.x} cy={node.plugPt.y} r={2.2} fill="#0f172a" stroke="#ffffff" strokeWidth="0.6" />
          {/* M6 Titanium Coil Retaining Bolt */}
          <circle cx={node.boltPt.x} cy={node.boltPt.y} r={1.2} fill="#cbd5e1" stroke="#475569" strokeWidth="0.4" />

          {/* Insulated Wiring Harness Pigtail */}
          <path
            d={`M ${node.plugPt.x} ${node.plugPt.y + 5} Q ${node.wirePt.x + 3} ${node.wirePt.y + 4} ${node.wirePt.x} ${node.wirePt.y}`}
            fill="none"
            stroke="#475569"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* ── 6. CNC BILLET GOLD OIL FILLER CAP ── */}
      <g id="inline-oil-cap">
        {/* Outer Knurled Ring */}
        <ellipse cx={oilCap.x} cy={oilCap.y} rx={8.5} ry={5.0} fill="url(#gold-anodized)" stroke="#78350f" strokeWidth="1.2" />
        {/* Inner Threaded Core */}
        <ellipse cx={oilCap.x} cy={oilCap.y - 1.8} rx={6.0} ry={3.5} fill="#ca8a04" stroke="#eab308" strokeWidth="0.6" />
        {/* Grip Notches */}
        <line x1={oilCap.x - 4} y1={oilCap.y - 2.5} x2={oilCap.x + 4} y2={oilCap.y + 2.5} stroke="#78350f" strokeWidth="1.0" />
        <line x1={oilCap.x + 4} y1={oilCap.y - 2.5} x2={oilCap.x - 4} y2={oilCap.y + 2.5} stroke="#78350f" strokeWidth="1.0" />
      </g>

      {/* ── 7. ANODIZED BILLET DIPSTICK PULL RING ── */}
      <g id="inline-dipstick">
        <circle cx={dipstick.x} cy={dipstick.y} r={5.0} fill="none" stroke="#eab308" strokeWidth="1.8" />
        <circle cx={dipstick.x} cy={dipstick.y} r={2.5} fill="#ca8a04" />
        <line x1={dipstick.x} y1={dipstick.y + 4} x2={dipstick.x + 2} y2={dipstick.y + 10} stroke="#cbd5e1" strokeWidth="1.5" />
      </g>

      {/* ── 8. PCV BREATHER HOSE & FITTING ── */}
      <g id="inline-pcv-hose">
        <circle cx={pcvPort.x} cy={pcvPort.y} r={3.5} fill="#020617" stroke="#475569" strokeWidth="0.8" />
        <path
          d={`M ${pcvPort.x} ${pcvPort.y} C ${pcvPort.x + 12} ${pcvPort.y - 8} ${pcvPort.x + 22} ${pcvPort.y + 10} ${pcvPort.x + 30} ${pcvPort.y + 4}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Hose Clamp */}
        <ellipse cx={pcvPort.x + 4} cy={pcvPort.y - 1} rx={2.2} ry={1.5} fill="none" stroke="#94a3b8" strokeWidth="0.8" />
      </g>

      {/* ── 9. LASER-ETCHED DOHC ENGINE PLAQUE ── */}
      <g id="inline-laser-plaque" opacity={0.82}>
        <rect
          x={tFL.x + 24}
          y={tFL.y - 20}
          width={42}
          height={9}
          rx={2.0}
          fill="#090d16"
          stroke="url(#gold-anodized)"
          strokeWidth="0.8"
        />
        <text
          x={tFL.x + 27}
          y={tFL.y - 13.5}
          fill="#facc15"
          fontSize="4.8"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {numCyls === 6 ? "I6·TWIN-CAM·24V" : numCyls === 3 ? "I3·1.2L·TURBO·12V" : "I4·DOHC·VTEC·16V"}
        </text>
      </g>

      {/* ── 10. PERIMETER TITANIUM SOCKET HEAD DRESS BOLTS ── */}
      {[0.15, 0.4, 0.65, 0.9].map((t, i) => {
        const bx = xS + t * (xE - xS);
        const bPt1 = P(bx, coverW / 2 - 3, coverZ + coverH + 1);
        const bPt2 = P(bx, -coverW / 2 + 3, coverZ + coverH + 1);
        return (
          <g key={`inline-dress-bolt-${i}`}>
            <circle cx={bPt1.x} cy={bPt1.y} r={2.2} fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.6" />
            <circle cx={bPt1.x} cy={bPt1.y} r={0.8} fill="#020617" />
            <circle cx={bPt2.x} cy={bPt2.y} r={2.2} fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.6" />
            <circle cx={bPt2.x} cy={bPt2.y} r={0.8} fill="#020617" />
          </g>
        );
      })}
    </g>
  );
};
