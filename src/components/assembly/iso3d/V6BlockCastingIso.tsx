import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import {
  projectIso,
  projectIsoEllipse,
  projectIso60VEllipse,
  getVBankDeckCorners,
  getIsoRibTrapezoid,
  type ScreenPoint2D,
  type IsoPoint3D,
} from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface V6BlockCastingIsoProps {
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
 * V6 ENGINE BLOCK — 60° V-Angle Twin-Turbocharged CNC Casting
 * ═══════════════════════════════════════════════════════════════════
 *
 * High-Performance 60° V6 Engine Block Casting (3 bores/bank, 6 total)
 * Inspired by: Nissan VR38DETT (GT-R), Ferrari F163 (296 GTB), Alfa 2.9L BiTurbo
 *
 * 11 SVG Layers (bottom-up Z-ordering):
 *  1. Ground shadow (wide oval blur beneath V-spread)
 *  2. Lower crankcase skirt & 4 main bearing web saddles
 *  3. Main block body casting (compact 60° Y-shape silhouette)
 *  4. Left cylinder bank deck (3 bores angled at 30° from vertical)
 *  5. Right cylinder bank deck (3 bores angled at 30° from vertical)
 *  6. Deep central valley (intake mounting rails, coolant crossover)
 *  7. Cylinder bores (6 chamfered openings with honing cross-hatch)
 *  8. Machined timing cover face & rear transmission bellhousing
 *  9. Structural reinforcement ribs (transverse webs + valley gussets)
 * 10. Head bolt bosses (8 per bank = 16 total) & oil gallery plugs
 * 11. Specular edge highlights & ambient occlusion shadows
 */
export const V6BlockCastingIso: React.FC<V6BlockCastingIsoProps> = ({
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O: ScreenPoint2D = { x: 250, y: 215 };

  // ─── PRIMARY DIMENSIONS (mm) ───
  // Compact 60° V6: shorter than V12 (150mm vs 230mm)
  const BL = 148;       // Block Length along X
  const halfL = BL / 2; // 74mm

  // 60° V-Angle True Y-Shape:
  const BANK_OUTER_Y = 82;    // Flared top outer deck
  const BANK_INNER_Y = 14;    // Inner valley junction
  const BANK_OUTER_Z = 168;   // Outer deck height
  const BANK_INNER_Z = 132;   // Inner valley floor

  const CRANK_Z_BOT = 18;     // Oil pan rail
  const CRANK_Z_TOP = 105;    // Waist line where banks split
  const CRANK_Y_OUTER = 30;   // Narrow lower crankcase stem
  const CRANK_Y_TOP = 40;

  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  // ─── BORE GEOMETRY (3 per bank) ───
  const NUM_CYLS_PER_BANK = 3;
  const BORE_RADIUS = 19;     // ~76mm bore
  const BORE_SPACING = 38;
  const boreXPositions = [-38, 0, 38];

  // ─── 3D CORNER POINTS ───
  // Skirt corners
  const sFL = projectIso({ x: -halfL - 10, y: CRANK_Y_OUTER + 8, z: CRANK_Z_BOT - 12 }, O);
  const sFR = projectIso({ x: halfL + 10, y: CRANK_Y_OUTER + 8, z: CRANK_Z_BOT - 12 }, O);
  const sBL = projectIso({ x: -halfL - 10, y: -CRANK_Y_OUTER - 8, z: CRANK_Z_BOT - 12 }, O);
  const sBR = projectIso({ x: halfL + 10, y: -CRANK_Y_OUTER - 8, z: CRANK_Z_BOT - 12 }, O);

  // Lower crankcase base (Z = CRANK_Z_BOT)
  const cFL = projectIso({ x: -halfL, y: CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
  const cFR = projectIso({ x: halfL, y: CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
  const cBR = projectIso({ x: halfL, y: -CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
  const cBL = projectIso({ x: -halfL, y: -CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);

  // Waist line (Z = CRANK_Z_TOP)
  const wFL = projectIso({ x: -halfL, y: CRANK_Y_TOP, z: CRANK_Z_TOP }, O);
  const wFR = projectIso({ x: halfL, y: CRANK_Y_TOP, z: CRANK_Z_TOP }, O);
  const wBR = projectIso({ x: halfL, y: -CRANK_Y_TOP, z: CRANK_Z_TOP }, O);
  const wBL = projectIso({ x: -halfL, y: -CRANK_Y_TOP, z: CRANK_Z_TOP }, O);

  // Left Bank Deck (Y > 0)
  const lbOuterFL = projectIso({ x: -halfL, y: BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const lbOuterFR = projectIso({ x: halfL, y: BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const lbInnerFL = projectIso({ x: -halfL, y: BANK_INNER_Y, z: BANK_INNER_Z }, O);
  const lbInnerFR = projectIso({ x: halfL, y: BANK_INNER_Y, z: BANK_INNER_Z }, O);

  // Right Bank Deck (Y < 0)
  const rbOuterFL = projectIso({ x: -halfL, y: -BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const rbOuterFR = projectIso({ x: halfL, y: -BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const rbInnerFL = projectIso({ x: -halfL, y: -BANK_INNER_Y, z: BANK_INNER_Z }, O);
  const rbInnerFR = projectIso({ x: halfL, y: -BANK_INNER_Y, z: BANK_INNER_Z }, O);

  // Valley Floor
  const vFL = projectIso({ x: -halfL, y: 0, z: BANK_INNER_Z - 10 }, O);
  const vFR = projectIso({ x: halfL, y: 0, z: BANK_INNER_Z - 10 }, O);

  return (
    <g
      id="iso-block-v6-casting"
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
      <ellipse cx={O.x} cy={O.y + 65} rx={135} ry={30}
        fill="url(#iso-ground-shadow)" opacity={0.75} />

      {/* ═══ LAYER 2 — LOWER CRANKCASE SKIRT & PAN RAIL ═══ */}
      <path
        d={`M ${sFL.x} ${sFL.y} L ${sFR.x} ${sFR.y} L ${sBR.x} ${sBR.y} L ${sBL.x} ${sBL.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.2" opacity={0.6}
      />
      <path
        d={`M ${sFL.x} ${sFL.y} L ${sFR.x} ${sFR.y} L ${cFR.x} ${cFR.y} L ${cFL.x} ${cFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1" opacity={0.75}
      />
      <path
        d={`M ${sFR.x} ${sFR.y} L ${sBR.x} ${sBR.y} L ${cBR.x} ${cBR.y} L ${cFR.x} ${cFR.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1" opacity={0.7}
      />
      {/* 4 Main bearing saddle arches */}
      {[-45, -15, 15, 45].map((xPos, i) => {
        const saddle = projectIsoEllipse({ x: xPos, y: 0, z: CRANK_Z_BOT + 12 }, 12, O);
        return (
          <g key={`v6-saddle-${i}`}>
            <ellipse cx={saddle.cx} cy={saddle.cy} rx={saddle.rx} ry={saddle.ry}
              fill="#020617" stroke="#1e293b" strokeWidth="0.8" opacity={0.75} />
            <circle cx={saddle.cx - saddle.rx - 2.5} cy={saddle.cy} r={1.5}
              fill="#0f172a" stroke="#334155" strokeWidth="0.4" />
            <circle cx={saddle.cx + saddle.rx + 2.5} cy={saddle.cy} r={1.5}
              fill="#0f172a" stroke="#334155" strokeWidth="0.4" />
          </g>
        );
      })}

      {/* ═══ LAYER 3 — MAIN BLOCK BODY (60° Y-SHAPE SILHOUETTE) ═══ */}
      {/* Lower crankcase body front face */}
      <path
        d={`M ${cFL.x} ${cFL.y} L ${cFR.x} ${cFR.y} L ${wFR.x} ${wFR.y} L ${wFL.x} ${wFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1.4"
      />
      {/* Lower crankcase body right face */}
      <path
        d={`M ${cFR.x} ${cFR.y} L ${cBR.x} ${cBR.y} L ${wBR.x} ${wBR.y} L ${wFR.x} ${wFR.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.4"
      />
      {/* Left bank outer flank (flares upward & outward at 30°) */}
      <path
        d={`M ${wFL.x} ${wFL.y} L ${wFR.x} ${wFR.y} L ${lbOuterFR.x} ${lbOuterFR.y} L ${lbOuterFL.x} ${lbOuterFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1.4"
      />
      {/* Right bank outer flank */}
      <path
        d={`M ${wFR.x} ${wFR.y} L ${wBR.x} ${wBR.y} L ${rbOuterFR.x} ${rbOuterFR.y} L ${rbOuterFL.x} ${rbOuterFL.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.4"
      />

      {/* ═══ LAYER 4 — LEFT CYLINDER BANK DECK (30° Tilt) ═══ */}
      <path
        d={`M ${lbOuterFL.x} ${lbOuterFL.y} L ${lbOuterFR.x} ${lbOuterFR.y} L ${lbInnerFR.x} ${lbInnerFR.y} L ${lbInnerFL.x} ${lbInnerFL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="1.5"
      />

      {/* ═══ LAYER 5 — RIGHT CYLINDER BANK DECK (30° Tilt Mirrored) ═══ */}
      <path
        d={`M ${rbInnerFL.x} ${rbInnerFL.y} L ${rbInnerFR.x} ${rbInnerFR.y} L ${rbOuterFR.x} ${rbOuterFR.y} L ${rbOuterFL.x} ${rbOuterFL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="1.5"
      />

      {/* ═══ LAYER 6 — DEEP CENTRAL VALLEY ═══ */}
      <path
        d={`M ${lbInnerFL.x} ${lbInnerFL.y} L ${lbInnerFR.x} ${lbInnerFR.y} L ${vFR.x} ${vFR.y} L ${vFL.x} ${vFL.y} Z`}
        fill="#0a0f1d" stroke="#0f172a" strokeWidth="0.8" opacity={0.9}
      />
      <path
        d={`M ${vFL.x} ${vFL.y} L ${vFR.x} ${vFR.y} L ${rbInnerFR.x} ${rbInnerFR.y} L ${rbInnerFL.x} ${rbInnerFL.y} Z`}
        fill="#080c18" stroke="#0f172a" strokeWidth="0.8" opacity={0.95}
      />
      {/* Valley coolant crossover pipe */}
      {(() => {
        const vpL = projectIso({ x: -20, y: 0, z: BANK_INNER_Z - 4 }, O);
        const vpR = projectIso({ x: 20, y: 0, z: BANK_INNER_Z - 4 }, O);
        return (
          <line x1={vpL.x} y1={vpL.y} x2={vpR.x} y2={vpR.y}
            stroke="#0284c7" strokeWidth="3" strokeLinecap="round" opacity={0.6} />
        );
      })()}

      {/* ═══ LAYER 7 — CYLINDER BORES (3 Left Bank + 3 Right Bank) ═══ */}
      {/* Left Bank Bores */}
      {boreXPositions.map((boreX, idx) => {
        const leftE = projectIso60VEllipse(
          { x: boreX, y: (BANK_OUTER_Y + BANK_INNER_Y) / 2, z: (BANK_OUTER_Z + BANK_INNER_Z) / 2 },
          BORE_RADIUS, "left", O
        );
        return (
          <g key={`v6-bore-left-${idx}`}>
            <ellipse cx={leftE.cx} cy={leftE.cy} rx={leftE.rx + 2.5} ry={leftE.ry + 2}
              transform={`rotate(${leftE.tiltDeg}, ${leftE.cx}, ${leftE.cy})`}
              fill="none" stroke="#64748b" strokeWidth="1.6" opacity={0.5} />
            <ellipse cx={leftE.cx} cy={leftE.cy} rx={leftE.rx} ry={leftE.ry}
              transform={`rotate(${leftE.tiltDeg}, ${leftE.cx}, ${leftE.cy})`}
              fill="#020617" stroke="#0f172a" strokeWidth="1.4" />
            {/* Honing */}
            <ellipse cx={leftE.cx} cy={leftE.cy + 2} rx={leftE.rx * 0.75} ry={leftE.ry * 0.75}
              transform={`rotate(${leftE.tiltDeg}, ${leftE.cx}, ${leftE.cy})`}
              fill="#000000" opacity={0.55} />
          </g>
        );
      })}

      {/* Right Bank Bores */}
      {boreXPositions.map((boreX, idx) => {
        const rightE = projectIso60VEllipse(
          { x: boreX, y: -(BANK_OUTER_Y + BANK_INNER_Y) / 2, z: (BANK_OUTER_Z + BANK_INNER_Z) / 2 },
          BORE_RADIUS, "right", O
        );
        return (
          <g key={`v6-bore-right-${idx}`}>
            <ellipse cx={rightE.cx} cy={rightE.cy} rx={rightE.rx + 2.5} ry={rightE.ry + 2}
              transform={`rotate(${rightE.tiltDeg}, ${rightE.cx}, ${rightE.cy})`}
              fill="none" stroke="#64748b" strokeWidth="1.6" opacity={0.5} />
            <ellipse cx={rightE.cx} cy={rightE.cy} rx={rightE.rx} ry={rightE.ry}
              transform={`rotate(${rightE.tiltDeg}, ${rightE.cx}, ${rightE.cy})`}
              fill="#020617" stroke="#0f172a" strokeWidth="1.4" />
            <ellipse cx={rightE.cx} cy={rightE.cy + 2} rx={rightE.rx * 0.75} ry={rightE.ry * 0.75}
              transform={`rotate(${rightE.tiltDeg}, ${rightE.cx}, ${rightE.cy})`}
              fill="#000000" opacity={0.55} />
          </g>
        );
      })}

      {/* ═══ LAYER 8 — TIMING COVER & BELLHOUSING ═══ */}
      {(() => {
        const tcL = projectIso({ x: -halfL - 6, y: BANK_OUTER_Y * 0.7, z: BANK_OUTER_Z - 20 }, O);
        const tcR = projectIso({ x: -halfL - 6, y: -BANK_OUTER_Y * 0.7, z: BANK_OUTER_Z - 20 }, O);
        const tcBotL = projectIso({ x: -halfL - 6, y: CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
        const tcBotR = projectIso({ x: -halfL - 6, y: -CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
        return (
          <g opacity={0.75}>
            <path
              d={`M ${tcL.x} ${tcL.y} L ${tcR.x} ${tcR.y} L ${tcBotR.x} ${tcBotR.y} L ${tcBotL.x} ${tcBotL.y} Z`}
              fill={fills.left} stroke="#0f172a" strokeWidth="1"
            />
            {/* Dual cam drive pulley bosses */}
            {(() => {
              const camL = projectIso({ x: -halfL - 7, y: 35, z: BANK_INNER_Z + 15 }, O);
              const camR = projectIso({ x: -halfL - 7, y: -35, z: BANK_INNER_Z + 15 }, O);
              const crankN = projectIso({ x: -halfL - 7, y: 0, z: CRANK_Z_BOT + 18 }, O);
              return (
                <>
                  <circle cx={camL.x} cy={camL.y} r={6} fill="#020617" stroke="#334155" strokeWidth="0.6" />
                  <circle cx={camR.x} cy={camR.y} r={6} fill="#020617" stroke="#334155" strokeWidth="0.6" />
                  <circle cx={crankN.x} cy={crankN.y} r={8} fill="#020617" stroke="#334155" strokeWidth="0.6" />
                </>
              );
            })()}
          </g>
        );
      })()}
      {/* Bellhousing */}
      {(() => {
        const bhL = projectIso({ x: halfL + 5, y: BANK_OUTER_Y * 0.8, z: BANK_OUTER_Z - 10 }, O);
        const bhR = projectIso({ x: halfL + 5, y: -BANK_OUTER_Y * 0.8, z: BANK_OUTER_Z - 10 }, O);
        const bhBotL = projectIso({ x: halfL + 5, y: CRANK_Y_OUTER + 5, z: CRANK_Z_BOT - 5 }, O);
        const bhBotR = projectIso({ x: halfL + 5, y: -CRANK_Y_OUTER - 5, z: CRANK_Z_BOT - 5 }, O);
        return (
          <g opacity={0.7}>
            <path
              d={`M ${bhL.x} ${bhL.y} L ${bhR.x} ${bhR.y} L ${bhBotR.x} ${bhBotR.y} L ${bhBotL.x} ${bhBotL.y} Z`}
              fill={fills.right} stroke="#0f172a" strokeWidth="1"
            />
            {(() => {
              const fw = projectIso({ x: halfL + 6, y: 0, z: CRANK_Z_BOT + 24 }, O);
              return <circle cx={fw.x} cy={fw.y} r={16} fill="#020617" stroke="#1e293b" strokeWidth="0.8" />;
            })()}
          </g>
        );
      })()}

      {/* ═══ LAYER 9 — STRUCTURAL GUSSET RIBS ═══ */}
      {[-25, 25].map((xPos, i) => {
        const rib = getIsoRibTrapezoid(
          { x: xPos, y: CRANK_Y_TOP + 4, z: CRANK_Z_TOP + 15 },
          { x: xPos, y: CRANK_Y_OUTER + 3, z: CRANK_Z_BOT + 8 },
          6, 4, O
        );
        return (
          <g key={`v6-rib-${i}`} opacity={0.6}>
            <path d={rib.frontFace} fill={fills.left} stroke="#1e293b" strokeWidth="0.6" />
            <path d={rib.topCap} fill={fills.top} stroke="#1e293b" strokeWidth="0.5" />
          </g>
        );
      })}

      {/* ═══ LAYER 10 — HEAD BOLT BOSSES & PLUGS ═══ */}
      {/* 8 bolts per bank deck perimeter */}
      {[-50, -18, 18, 50].map((xPos, i) => {
        const lbB = projectIso({ x: xPos, y: BANK_OUTER_Y - 6, z: BANK_OUTER_Z }, O);
        const rbB = projectIso({ x: xPos, y: -BANK_OUTER_Y + 6, z: BANK_OUTER_Z }, O);
        return (
          <g key={`v6-bolt-${i}`}>
            <circle cx={lbB.x} cy={lbB.y} r={2.8} fill={fills.top} stroke="#64748b" strokeWidth="0.7" />
            <circle cx={lbB.x} cy={lbB.y} r={1.2} fill="#0f172a" />
            <circle cx={rbB.x} cy={rbB.y} r={2.8} fill={fills.top} stroke="#64748b" strokeWidth="0.7" />
            <circle cx={rbB.x} cy={rbB.y} r={1.2} fill="#0f172a" />
          </g>
        );
      })}

      {/* ═══ LAYER 11 — SPECULAR HIGHLIGHTS & AO ═══ */}
      <path d={`M ${lbOuterFL.x} ${lbOuterFL.y} L ${lbOuterFR.x} ${lbOuterFR.y}`}
        stroke="#e2e8f0" strokeWidth="1.2" opacity={0.5} strokeLinecap="round" />
      <path d={`M ${lbInnerFL.x} ${lbInnerFL.y} L ${lbInnerFR.x} ${lbInnerFR.y}`}
        stroke="#94a3b8" strokeWidth="0.8" opacity={0.4} strokeLinecap="round" />
      <path d={`M ${rbOuterFL.x} ${rbOuterFL.y} L ${rbOuterFR.x} ${rbOuterFR.y}`}
        stroke="#cbd5e1" strokeWidth="0.8" opacity={0.35} strokeLinecap="round" />
      {/* Valley shadow */}
      <path d={`M ${vFL.x} ${vFL.y} L ${vFR.x} ${vFR.y}`}
        stroke="#000000" strokeWidth="2.5" opacity={0.6} strokeLinecap="round" />

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
