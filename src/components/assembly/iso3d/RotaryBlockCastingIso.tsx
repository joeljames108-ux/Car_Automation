import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import {
  projectIso,
  projectIsoEllipse,
  getIsoEpitrochoidPath,
  type ScreenPoint2D,
} from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface RotaryBlockCastingIsoProps {
  layoutSpec: {
    label: string;
    cyls: number[];
    width: number;
    bankAngle: string;
    bx: number;
    bw: number;
    bh: number;
    category: string;
    bolts?: { x: number; y: number }[];
  };
  blockState: {
    isInstalled: boolean;
    isActive: boolean;
    isHovered: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  selectedVariants?: Record<string, string>;
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * ROTARY / WANKEL ENGINE BLOCK — Twin-Rotor 13B-REW Epitrochoid Sandwich
 * ═══════════════════════════════════════════════════════════════════
 *
 * High-Performance 1.3L Twin-Rotor Wankel Rotary Engine Monoblock
 * Inspired by: Mazda 13B-REW (FD RX-7) / 20B 3-Rotor Cosmo
 *
 * 11 SVG Layers (bottom-up Z-ordering):
 *  1. Ground shadow (compact round radial blur)
 *  2. Lower oil sump pan rail & oil scavenge pickups
 *  3. Front side plate, intermediate plate & rear side plate sandwich
 *  4. Twin epitrochoid rotor housings (R=105mm, e=15mm trochoid geometry)
 *  5. Eccentric shaft central tunnel & dual rotor bearing journals
 *  6. Peripheral exhaust ports & side-port intake runners
 *  7. Water jacket O-ring seals & cast cross-cooling galleries
 *  8. Front counterweight housing & rear flywheel bellhousing
 *  9. Tension bolt array (18 high-tensile through-bolts clamping the 5-piece stack)
 * 10. Spark plug bosses (Leading & Trailing plugs per rotor) & knock sensor
 * 11. Specular edge highlights & ambient occlusion shadows
 */
export const RotaryBlockCastingIso: React.FC<RotaryBlockCastingIsoProps> = ({
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O: ScreenPoint2D = { x: 250, y: 220 };

  // ─── PRIMARY DIMENSIONS (mm) ───
  // 5-piece stack: Front Plate (28mm) + Housing 1 (80mm) + Intermediate Plate (38mm) + Housing 2 (80mm) + Rear Plate (32mm)
  const BL = 180;       // Total sandwich length along eccentric shaft
  const halfL = BL / 2; // 90mm
  const BD = 140;       // Depth across trochoid housing
  const halfD = BD / 2; // 70mm
  const BH = 148;       // Vertical height of trochoid housing
  const halfH = BH / 2; // 74mm

  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  // Plate X-coordinates along eccentric shaft
  const FRONT_PLATE_X = -halfL + 14;
  const ROTOR1_X = -halfL + 54;
  const INTER_PLATE_X = 0;
  const ROTOR2_X = halfL - 54;
  const REAR_PLATE_X = halfL - 16;

  // 3D Corner points for the 5-piece sandwich
  const sFL = projectIso({ x: -halfL - 10, y: halfD + 8, z: 0 }, O);
  const sFR = projectIso({ x: halfL + 10, y: halfD + 8, z: 0 }, O);
  const sBL = projectIso({ x: -halfL - 10, y: -halfD - 8, z: 0 }, O);
  const sBR = projectIso({ x: halfL + 10, y: -halfD - 8, z: 0 }, O);

  const tFL = projectIso({ x: -halfL, y: halfD, z: BH }, O);
  const tFR = projectIso({ x: halfL, y: halfD, z: BH }, O);
  const tBL = projectIso({ x: -halfL, y: -halfD, z: BH }, O);
  const tBR = projectIso({ x: halfL, y: -halfD, z: BH }, O);

  const bFL = projectIso({ x: -halfL, y: halfD, z: 12 }, O);
  const bFR = projectIso({ x: halfL, y: halfD, z: 12 }, O);
  const bBR = projectIso({ x: halfL, y: -halfD, z: 12 }, O);

  return (
    <g
      id="iso-block-rotary-casting"
      onMouseEnter={() => onHoverComponent?.("block")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className={`cursor-pointer transition-all duration-700 ease-out ${
        blockState.isActive ? "filter-glow-active" : ""
      }`}
      style={{
        transform: `translate(${blockState.offsetX}px, ${blockState.offsetY}px)`,
        opacity: blockState.opacity,
      }}
    >
      {/* ═══ LAYER 1 — GROUND SHADOW ═══ */}
      <ellipse cx={O.x} cy={O.y + 60} rx={135} ry={30}
        fill="url(#iso-ground-shadow)" opacity={0.78} />

      {/* ═══ LAYER 2 — LOWER OIL SUMP PAN RAIL ═══ */}
      <path
        d={`M ${sFL.x} ${sFL.y} L ${sFR.x} ${sFR.y} L ${sBR.x} ${sBR.y} L ${sBL.x} ${sBL.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.2" opacity={0.6}
      />
      <path
        d={`M ${sFL.x} ${sFL.y} L ${sFR.x} ${sFR.y} L ${bFR.x} ${bFR.y} L ${bFL.x} ${bFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1" opacity={0.75}
      />
      <path
        d={`M ${sFR.x} ${sFR.y} L ${sBR.x} ${sBR.y} L ${bBR.x} ${bBR.y} L ${bFR.x} ${bFR.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1" opacity={0.7}
      />

      {/* ═══ LAYER 3 — 5-PIECE HOUSING SANDWICH BODY ═══ */}
      {/* Front Face of Front Side Plate */}
      <path
        d={`M ${bFL.x} ${bFL.y} L ${bFR.x} ${bFR.y} L ${tFR.x} ${tFR.y} L ${tFL.x} ${tFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1.4"
      />
      {/* Right Side Facet */}
      <path
        d={`M ${bFR.x} ${bFR.y} L ${bBR.x} ${bBR.y} L ${tBR.x} ${tBR.y} L ${tFR.x} ${tFR.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.4"
      />
      {/* Top Deck Facet */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y} L ${tBL.x} ${tBL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="1.5"
      />

      {/* 4 Sandwich Parting Lines (Front Plate | Housing 1 | Inter Plate | Housing 2 | Rear Plate) */}
      {[
        -halfL + 28, // Front Plate / Housing 1 seam
        -halfL + 76, // Housing 1 / Inter Plate seam
        halfL - 76,  // Inter Plate / Housing 2 seam
        halfL - 28,  // Housing 2 / Rear Plate seam
      ].map((xPos, i) => {
        const pBot = projectIso({ x: xPos, y: halfD, z: 12 }, O);
        const pTop = projectIso({ x: xPos, y: halfD, z: BH }, O);
        const pTopR = projectIso({ x: xPos, y: -halfD, z: BH }, O);
        return (
          <g key={`rotary-seam-${i}`}>
            <line x1={pBot.x} y1={pBot.y} x2={pTop.x} y2={pTop.y}
              stroke="#38bdf8" strokeWidth="1" opacity={0.65} />
            <line x1={pTop.x} y1={pTop.y} x2={pTopR.x} y2={pTopR.y}
              stroke="#0284c7" strokeWidth="0.8" opacity={0.5} />
          </g>
        );
      })}

      {/* ═══ LAYER 4 — TWIN EPITROCHOID ROTOR CHAMBERS ═══ */}
      {/* Rotor Housing 1 Epitrochoid Profile */}
      {(() => {
        const r1Center = projectIso({ x: ROTOR1_X, y: 0, z: halfH + 8 }, O);
        const r2Center = projectIso({ x: ROTOR2_X, y: 0, z: halfH + 8 }, O);
        const trochoid1 = getIsoEpitrochoidPath(42, 6.5, 90, r1Center.x, r1Center.y, 0.92, 0);
        const trochoid2 = getIsoEpitrochoidPath(42, 6.5, 90, r2Center.x, r2Center.y, 0.92, 0);
        return (
          <g>
            {/* Rotor 1 Chamber */}
            <path d={trochoid1} fill="#020617" stroke="#0f172a" strokeWidth="1.8" />
            {/* Rotor 2 Chamber */}
            <path d={trochoid2} fill="#020617" stroke="#0f172a" strokeWidth="1.8" />
            {/* Inner chrome trochoid wear surface highlight */}
            <path d={trochoid1} fill="none" stroke="#38bdf8" strokeWidth="0.6" opacity={0.35} />
            <path d={trochoid2} fill="none" stroke="#38bdf8" strokeWidth="0.6" opacity={0.35} />
          </g>
        );
      })()}

      {/* ═══ LAYER 5 — ECCENTRIC SHAFT CENTRAL TUNNEL ═══ */}
      {(() => {
        const esFront = projectIso({ x: -halfL - 5, y: 0, z: halfH + 8 }, O);
        const esRear = projectIso({ x: halfL + 5, y: 0, z: halfH + 8 }, O);
        const esR1 = projectIso({ x: ROTOR1_X, y: 0, z: halfH + 8 }, O);
        const esR2 = projectIso({ x: ROTOR2_X, y: 0, z: halfH + 8 }, O);
        return (
          <g>
            {/* Main eccentric shaft tunnel center bore */}
            <circle cx={esFront.x} cy={esFront.y} r={16} fill="#020617" stroke="#334155" strokeWidth="1" />
            <circle cx={esFront.x} cy={esFront.y} r={11} fill="#0f172a" stroke="#64748b" strokeWidth="0.6" />
            {/* Dual rotor eccentric lobes visible inside chambers */}
            <circle cx={esR1.x} cy={esR1.y} r={12} fill="#020617" stroke="#38bdf8" strokeWidth="0.7" opacity={0.7} />
            <circle cx={esR2.x} cy={esR2.y} r={12} fill="#020617" stroke="#38bdf8" strokeWidth="0.7" opacity={0.7} />
          </g>
        );
      })()}

      {/* ═══ LAYER 6 — INTAKE & EXHAUST PORTS ═══ */}
      {/* Peripheral exhaust ports (Bottom right flank) */}
      {[ROTOR1_X, ROTOR2_X].map((xPos, i) => {
        const exhPt = projectIso({ x: xPos, y: halfD - 6, z: 38 }, O);
        return (
          <g key={`rotary-exh-${i}`}>
            <ellipse cx={exhPt.x} cy={exhPt.y} rx={9} ry={6} fill="#020617" stroke="#ef4444" strokeWidth="0.8" opacity={0.7} />
            <ellipse cx={exhPt.x} cy={exhPt.y} rx={6} ry={4} fill="#000000" />
          </g>
        );
      })}
      {/* Side intake ports (Top left flank) */}
      {[ROTOR1_X, ROTOR2_X].map((xPos, i) => {
        const intPt = projectIso({ x: xPos, y: -halfD + 8, z: BH - 32 }, O);
        return (
          <g key={`rotary-int-${i}`}>
            <ellipse cx={intPt.x} cy={intPt.y} rx={8} ry={5} fill="#020617" stroke="#0284c7" strokeWidth="0.8" opacity={0.7} />
            <ellipse cx={intPt.x} cy={intPt.y} rx={5} ry={3} fill="#000000" />
          </g>
        );
      })}

      {/* ═══ LAYER 7 — WATER JACKET O-RING CHANNELS ═══ */}
      {[-halfL + 28, -halfL + 76, halfL - 76, halfL - 28].map((xPos, i) => {
        const sealPt = projectIso({ x: xPos, y: 0, z: halfH + 8 }, O);
        return (
          <ellipse key={`water-seal-${i}`} cx={sealPt.x} cy={sealPt.y} rx={34} ry={22}
            fill="none" stroke="#0369a1" strokeWidth="0.8" strokeDasharray="4,2" opacity={0.4} />
        );
      })}

      {/* ═══ LAYER 8 — FRONT DRIVE & REAR BELLHOUSING ═══ */}
      {/* Front oil pump drive cover */}
      {(() => {
        const tc = projectIso({ x: -halfL - 6, y: 0, z: halfH + 8 }, O);
        return (
          <g opacity={0.7}>
            <circle cx={tc.x} cy={tc.y} r={22} fill={fills.left} stroke="#0f172a" strokeWidth="1" />
            <circle cx={tc.x} cy={tc.y} r={10} fill="#020617" stroke="#334155" strokeWidth="0.6" />
          </g>
        );
      })()}
      {/* Rear flywheel bellhousing flange */}
      {(() => {
        const bh = projectIso({ x: halfL + 6, y: 0, z: halfH + 8 }, O);
        return (
          <g opacity={0.7}>
            <circle cx={bh.x} cy={bh.y} r={26} fill={fills.right} stroke="#0f172a" strokeWidth="1" />
            <circle cx={bh.x} cy={bh.y} r={16} fill="#020617" stroke="#1e293b" strokeWidth="0.8" />
          </g>
        );
      })()}

      {/* ═══ LAYER 9 — 18 TENSION THROUGH-BOLTS ═══ */}
      {/* Clamping the entire 5-piece stack together */}
      {Array.from({ length: 10 }).map((_, i) => {
        const angle = (i * 36) * (Math.PI / 180);
        const boltR = 48;
        const bPt = projectIso({
          x: -halfL + 1,
          y: boltR * Math.cos(angle) * 0.7,
          z: halfH + 8 + boltR * Math.sin(angle) * 0.7,
        }, O);
        return (
          <g key={`tension-bolt-${i}`}>
            <circle cx={bPt.x} cy={bPt.y} r={2.2} fill={fills.left} stroke="#38bdf8" strokeWidth="0.5" />
            <circle cx={bPt.x} cy={bPt.y} r={0.9} fill="#020617" />
          </g>
        );
      })}

      {/* ═══ LAYER 10 — SPARK PLUG BOSSES (Leading & Trailing) ═══ */}
      {[ROTOR1_X, ROTOR2_X].map((xPos, i) => {
        const leadPt = projectIso({ x: xPos, y: halfD - 2, z: halfH - 12 }, O);
        const trailPt = projectIso({ x: xPos, y: halfD - 2, z: halfH + 18 }, O);
        return (
          <g key={`spark-plugs-${i}`}>
            {/* Leading spark plug */}
            <circle cx={leadPt.x} cy={leadPt.y} r={3.2} fill="#eab308" stroke="#ca8a04" strokeWidth="0.6" />
            <circle cx={leadPt.x} cy={leadPt.y} r={1.2} fill="#020617" />
            {/* Trailing spark plug */}
            <circle cx={trailPt.x} cy={trailPt.y} r={3.2} fill="#eab308" stroke="#ca8a04" strokeWidth="0.6" />
            <circle cx={trailPt.x} cy={trailPt.y} r={1.2} fill="#020617" />
          </g>
        );
      })}

      {/* ═══ LAYER 11 — SPECULAR HIGHLIGHTS & AO ═══ */}
      <path d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y}`}
        stroke="#e2e8f0" strokeWidth="1.2" opacity={0.5} strokeLinecap="round" />
      <path d={`M ${tFL.x} ${tFL.y} L ${tBL.x} ${tBL.y}`}
        stroke="#f8fafc" strokeWidth="0.8" opacity={0.35} strokeLinecap="round" />
      <path d={`M ${bFL.x} ${bFL.y} L ${tFL.x} ${tFL.y}`}
        stroke="#cbd5e1" strokeWidth="0.8" opacity={0.4} strokeLinecap="round" />

      {/* Active glow */}
      {blockState.isActive && (
        <rect x={O.x - 130} y={O.y - 110} width={260} height={205} rx={8}
          fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity={0.4}
          className="animate-pulse" />
      )}
      {/* Hover highlight */}
      {blockState.isHovered && !blockState.isActive && (
        <rect x={O.x - 130} y={O.y - 110} width={260} height={205} rx={8}
          fill="#38bdf8" opacity={0.06} />
      )}
    </g>
  );
};
