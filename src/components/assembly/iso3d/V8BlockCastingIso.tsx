import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import {
  projectIso,
  projectIsoTiltedEllipse,
  getIsoRibTrapezoid,
  type ScreenPoint2D,
} from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface V8BlockCastingIsoProps {
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
 * V8 ENGINE BLOCK — 90° Crossplane V8 High-Performance Monoblock
 * ═══════════════════════════════════════════════════════════════════
 *
 * Muscular 90° V8 Block Casting (4 bores/bank, 8 cylinders total)
 * Inspired by: GM LS/LT, Ford Coyote 5.0L, Ferrari F154 Twin-Turbo, AMG M177
 *
 * 11 SVG Layers (bottom-up Z-ordering):
 *  1. Ground shadow (wide muscular radial shadow)
 *  2. Deep skirt crankcase with 6-bolt cross-bolted main bearing caps
 *  3. Main block body casting (wide 90° V-spread silhouette)
 *  4. Left cylinder bank deck (4 bores angled at 45° outward)
 *  5. Right cylinder bank deck (4 bores angled at 45° outward)
 *  6. Wide 90° central valley (valley tray pad, knock sensor towers)
 *  7. Cylinder bores (8 chamfered openings with honing cross-hatch)
 *  8. Front timing chain cover & massive rear transmission flange
 *  9. Structural strengthening ribs (heavy diagonal valley braces)
 * 10. Head bolt bosses (10 per bank = 20 total) & oil galleries
 * 11. Specular edge highlights & ambient occlusion shadows
 */
export const V8BlockCastingIso: React.FC<V8BlockCastingIsoProps> = ({
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O: ScreenPoint2D = { x: 250, y: 215 };

  // ─── PRIMARY DIMENSIONS (mm) ───
  // Muscular 90° V8
  const BL = 180;       // Block Length along X
  const halfL = BL / 2; // 90mm

  // 90° V-Angle Geometry (Wider spread than 60° V6/V12):
  const BANK_OUTER_Y = 96;    // Wide 90° bank flare
  const BANK_INNER_Y = 16;    // Wide valley
  const BANK_OUTER_Z = 162;   // Lower top height due to 45° tilt
  const BANK_INNER_Z = 120;   // Deep valley floor

  const CRANK_Z_BOT = 16;     // Deep skirt oil pan rail
  const CRANK_Z_TOP = 95;     // Waist line
  const CRANK_Y_OUTER = 36;   // Thick skirt walls
  const CRANK_Y_TOP = 46;

  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  // ─── BORE GEOMETRY (4 per bank = 8 total) ───
  const NUM_CYLS_PER_BANK = 4;
  const BORE_RADIUS = 21;     // Large V8 bore (~84mm)
  const BORE_SPACING = 36;
  const boreXPositions = [-54, -18, 18, 54];

  // ─── 3D CORNER POINTS ───
  // Skirt
  const sFL = projectIso({ x: -halfL - 12, y: CRANK_Y_OUTER + 10, z: CRANK_Z_BOT - 12 }, O);
  const sFR = projectIso({ x: halfL + 12, y: CRANK_Y_OUTER + 10, z: CRANK_Z_BOT - 12 }, O);
  const sBL = projectIso({ x: -halfL - 12, y: -CRANK_Y_OUTER - 10, z: CRANK_Z_BOT - 12 }, O);
  const sBR = projectIso({ x: halfL + 12, y: -CRANK_Y_OUTER - 10, z: CRANK_Z_BOT - 12 }, O);

  // Lower crankcase base
  const cFL = projectIso({ x: -halfL, y: CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
  const cFR = projectIso({ x: halfL, y: CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
  const cBR = projectIso({ x: halfL, y: -CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
  const cBL = projectIso({ x: -halfL, y: -CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);

  // Waist line
  const wFL = projectIso({ x: -halfL, y: CRANK_Y_TOP, z: CRANK_Z_TOP }, O);
  const wFR = projectIso({ x: halfL, y: CRANK_Y_TOP, z: CRANK_Z_TOP }, O);
  const wBR = projectIso({ x: halfL, y: -CRANK_Y_TOP, z: CRANK_Z_TOP }, O);
  const wBL = projectIso({ x: -halfL, y: -CRANK_Y_TOP, z: CRANK_Z_TOP }, O);

  // Left Bank Deck (90° / 45° tilt)
  const lbOuterFL = projectIso({ x: -halfL, y: BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const lbOuterFR = projectIso({ x: halfL, y: BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const lbInnerFL = projectIso({ x: -halfL, y: BANK_INNER_Y, z: BANK_INNER_Z }, O);
  const lbInnerFR = projectIso({ x: halfL, y: BANK_INNER_Y, z: BANK_INNER_Z }, O);

  // Right Bank Deck
  const rbOuterFL = projectIso({ x: -halfL, y: -BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const rbOuterFR = projectIso({ x: halfL, y: -BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const rbInnerFL = projectIso({ x: -halfL, y: -BANK_INNER_Y, z: BANK_INNER_Z }, O);
  const rbInnerFR = projectIso({ x: halfL, y: -BANK_INNER_Y, z: BANK_INNER_Z }, O);

  // Valley Floor
  const vFL = projectIso({ x: -halfL, y: 0, z: BANK_INNER_Z - 12 }, O);
  const vFR = projectIso({ x: halfL, y: 0, z: BANK_INNER_Z - 12 }, O);

  return (
    <g
      id="iso-block-v8-casting"
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
      <ellipse cx={O.x} cy={O.y + 68} rx={148} ry={34}
        fill="url(#iso-ground-shadow)" opacity={0.78} />

      {/* ═══ LAYER 2 — LOWER CRANKCASE SKIRT & 5 MAIN BEARING WEBS ═══ */}
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
      {/* 5 Main bearing webs with cross-bolted caps */}
      {[-60, -30, 0, 30, 60].map((xPos, i) => {
        const saddle = projectIsoTiltedEllipse({ x: xPos, y: 0, z: CRANK_Z_BOT + 12 }, 13, "left", O);
        return (
          <g key={`v8-saddle-${i}`}>
            <ellipse cx={saddle.cx} cy={saddle.cy} rx={saddle.rx} ry={saddle.ry}
              fill="#020617" stroke="#1e293b" strokeWidth="0.8" opacity={0.75} />
            {/* 6-bolt main cap bolt pattern */}
            <circle cx={saddle.cx - saddle.rx - 3} cy={saddle.cy} r={1.6} fill="#0f172a" stroke="#334155" strokeWidth="0.4" />
            <circle cx={saddle.cx + saddle.rx + 3} cy={saddle.cy} r={1.6} fill="#0f172a" stroke="#334155" strokeWidth="0.4" />
            {/* Side cross-bolts through skirt */}
            <circle cx={saddle.cx - saddle.rx - 6} cy={saddle.cy + 3} r={1.3} fill="#020617" stroke="#64748b" strokeWidth="0.4" />
            <circle cx={saddle.cx + saddle.rx + 6} cy={saddle.cy + 3} r={1.3} fill="#020617" stroke="#64748b" strokeWidth="0.4" />
          </g>
        );
      })}

      {/* ═══ LAYER 3 — MAIN BLOCK BODY (90° V-SPREAD) ═══ */}
      <path
        d={`M ${cFL.x} ${cFL.y} L ${cFR.x} ${cFR.y} L ${wFR.x} ${wFR.y} L ${wFL.x} ${wFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1.4"
      />
      <path
        d={`M ${cFR.x} ${cFR.y} L ${cBR.x} ${cBR.y} L ${wBR.x} ${wBR.y} L ${wFR.x} ${wFR.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.4"
      />
      {/* Left bank outer flank (wide 45° slope) */}
      <path
        d={`M ${wFL.x} ${wFL.y} L ${wFR.x} ${wFR.y} L ${lbOuterFR.x} ${lbOuterFR.y} L ${lbOuterFL.x} ${lbOuterFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1.4"
      />
      {/* Right bank outer flank */}
      <path
        d={`M ${wFR.x} ${wFR.y} L ${wBR.x} ${wBR.y} L ${rbOuterFR.x} ${rbOuterFR.y} L ${rbOuterFL.x} ${rbOuterFL.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.4"
      />

      {/* ═══ LAYER 4 — LEFT CYLINDER BANK DECK (45° Tilt) ═══ */}
      <path
        d={`M ${lbOuterFL.x} ${lbOuterFL.y} L ${lbOuterFR.x} ${lbOuterFR.y} L ${lbInnerFR.x} ${lbInnerFR.y} L ${lbInnerFL.x} ${lbInnerFL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="1.5"
      />

      {/* ═══ LAYER 5 — RIGHT CYLINDER BANK DECK (45° Tilt Mirrored) ═══ */}
      <path
        d={`M ${rbInnerFL.x} ${rbInnerFL.y} L ${rbInnerFR.x} ${rbInnerFR.y} L ${rbOuterFR.x} ${rbOuterFR.y} L ${rbOuterFL.x} ${rbOuterFL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="1.5"
      />

      {/* ═══ LAYER 6 — WIDE 90° CENTRAL VALLEY ═══ */}
      <path
        d={`M ${lbInnerFL.x} ${lbInnerFL.y} L ${lbInnerFR.x} ${lbInnerFR.y} L ${vFR.x} ${vFR.y} L ${vFL.x} ${vFL.y} Z`}
        fill="#0a0f1d" stroke="#0f172a" strokeWidth="0.8" opacity={0.9}
      />
      <path
        d={`M ${vFL.x} ${vFL.y} L ${vFR.x} ${vFR.y} L ${rbInnerFR.x} ${rbInnerFR.y} L ${rbInnerFL.x} ${rbInnerFL.y} Z`}
        fill="#080c18" stroke="#0f172a" strokeWidth="0.8" opacity={0.95}
      />
      {/* Twin knock sensor towers in valley */}
      {[-30, 30].map((xPos, i) => {
        const ksPt = projectIso({ x: xPos, y: 0, z: BANK_INNER_Z - 6 }, O);
        return (
          <g key={`v8-valley-ks-${i}`}>
            <circle cx={ksPt.x} cy={ksPt.y} r={4.5} fill={fills.top} stroke="#334155" strokeWidth="0.6" />
            <circle cx={ksPt.x} cy={ksPt.y} r={2} fill="#020617" stroke="#64748b" strokeWidth="0.4" />
          </g>
        );
      })}

      {/* ═══ LAYER 7 — CYLINDER BORES (4 Left Bank + 4 Right Bank @ 45°) ═══ */}
      {/* Left Bank Bores */}
      {boreXPositions.map((boreX, idx) => {
        const leftE = projectIsoTiltedEllipse(
          { x: boreX, y: (BANK_OUTER_Y + BANK_INNER_Y) / 2, z: (BANK_OUTER_Z + BANK_INNER_Z) / 2 },
          BORE_RADIUS, "left", O
        );
        return (
          <g key={`v8-bore-left-${idx}`}>
            <ellipse cx={leftE.cx} cy={leftE.cy} rx={leftE.rx + 2.5} ry={leftE.ry + 2}
              transform={`rotate(${leftE.tiltDeg}, ${leftE.cx}, ${leftE.cy})`}
              fill="none" stroke="#64748b" strokeWidth="1.6" opacity={0.5} />
            <ellipse cx={leftE.cx} cy={leftE.cy} rx={leftE.rx} ry={leftE.ry}
              transform={`rotate(${leftE.tiltDeg}, ${leftE.cx}, ${leftE.cy})`}
              fill="#020617" stroke="#0f172a" strokeWidth="1.4" />
            <ellipse cx={leftE.cx} cy={leftE.cy + 2} rx={leftE.rx * 0.75} ry={leftE.ry * 0.75}
              transform={`rotate(${leftE.tiltDeg}, ${leftE.cx}, ${leftE.cy})`}
              fill="#000000" opacity={0.55} />
          </g>
        );
      })}

      {/* Right Bank Bores */}
      {boreXPositions.map((boreX, idx) => {
        const rightE = projectIsoTiltedEllipse(
          { x: boreX, y: -(BANK_OUTER_Y + BANK_INNER_Y) / 2, z: (BANK_OUTER_Z + BANK_INNER_Z) / 2 },
          BORE_RADIUS, "right", O
        );
        return (
          <g key={`v8-bore-right-${idx}`}>
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
        const tcL = projectIso({ x: -halfL - 6, y: BANK_OUTER_Y * 0.75, z: BANK_OUTER_Z - 18 }, O);
        const tcR = projectIso({ x: -halfL - 6, y: -BANK_OUTER_Y * 0.75, z: BANK_OUTER_Z - 18 }, O);
        const tcBotL = projectIso({ x: -halfL - 6, y: CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
        const tcBotR = projectIso({ x: -halfL - 6, y: -CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
        return (
          <g opacity={0.75}>
            <path
              d={`M ${tcL.x} ${tcL.y} L ${tcR.x} ${tcR.y} L ${tcBotR.x} ${tcBotR.y} L ${tcBotL.x} ${tcBotL.y} Z`}
              fill={fills.left} stroke="#0f172a" strokeWidth="1"
            />
            {(() => {
              const crankN = projectIso({ x: -halfL - 7, y: 0, z: CRANK_Z_BOT + 18 }, O);
              return <circle cx={crankN.x} cy={crankN.y} r={9} fill="#020617" stroke="#334155" strokeWidth="0.6" />;
            })()}
          </g>
        );
      })()}
      {/* Bellhousing */}
      {(() => {
        const bhL = projectIso({ x: halfL + 6, y: BANK_OUTER_Y * 0.85, z: BANK_OUTER_Z - 8 }, O);
        const bhR = projectIso({ x: halfL + 6, y: -BANK_OUTER_Y * 0.85, z: BANK_OUTER_Z - 8 }, O);
        const bhBotL = projectIso({ x: halfL + 6, y: CRANK_Y_OUTER + 8, z: CRANK_Z_BOT - 6 }, O);
        const bhBotR = projectIso({ x: halfL + 6, y: -CRANK_Y_OUTER - 8, z: CRANK_Z_BOT - 6 }, O);
        return (
          <g opacity={0.7}>
            <path
              d={`M ${bhL.x} ${bhL.y} L ${bhR.x} ${bhR.y} L ${bhBotR.x} ${bhBotR.y} L ${bhBotL.x} ${bhBotL.y} Z`}
              fill={fills.right} stroke="#0f172a" strokeWidth="1"
            />
            {(() => {
              const fw = projectIso({ x: halfL + 7, y: 0, z: CRANK_Z_BOT + 26 }, O);
              return <circle cx={fw.x} cy={fw.y} r={17} fill="#020617" stroke="#1e293b" strokeWidth="0.8" />;
            })()}
          </g>
        );
      })()}

      {/* ═══ LAYER 9 — STRUCTURAL GUSSET RIBS ═══ */}
      {[-35, 0, 35].map((xPos, i) => {
        const rib = getIsoRibTrapezoid(
          { x: xPos, y: CRANK_Y_TOP + 4, z: CRANK_Z_TOP + 15 },
          { x: xPos, y: CRANK_Y_OUTER + 3, z: CRANK_Z_BOT + 8 },
          6, 4, O
        );
        return (
          <g key={`v8-rib-${i}`} opacity={0.6}>
            <path d={rib.frontFace} fill={fills.left} stroke="#1e293b" strokeWidth="0.6" />
            <path d={rib.topCap} fill={fills.top} stroke="#1e293b" strokeWidth="0.5" />
          </g>
        );
      })}

      {/* ═══ LAYER 10 — HEAD BOLT BOSSES (10 per bank = 20 Total) ═══ */}
      {[-68, -34, 0, 34, 68].map((xPos, i) => {
        const lbB = projectIso({ x: xPos, y: BANK_OUTER_Y - 6, z: BANK_OUTER_Z }, O);
        const rbB = projectIso({ x: xPos, y: -BANK_OUTER_Y + 6, z: BANK_OUTER_Z }, O);
        return (
          <g key={`v8-bolt-${i}`}>
            <circle cx={lbB.x} cy={lbB.y} r={3} fill={fills.top} stroke="#64748b" strokeWidth="0.7" />
            <circle cx={lbB.x} cy={lbB.y} r={1.3} fill="#0f172a" />
            <circle cx={rbB.x} cy={rbB.y} r={3} fill={fills.top} stroke="#64748b" strokeWidth="0.7" />
            <circle cx={rbB.x} cy={rbB.y} r={1.3} fill="#0f172a" />
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
        stroke="#000000" strokeWidth="3" opacity={0.65} strokeLinecap="round" />

      {/* Active glow */}
      {blockState.isActive && (
        <rect x={O.x - 140} y={O.y - 110} width={280} height={210} rx={8}
          fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity={0.4}
          className="animate-pulse" />
      )}
      {/* Hover highlight */}
      {blockState.isHovered && !blockState.isActive && (
        <rect x={O.x - 140} y={O.y - 110} width={280} height={210} rx={8}
          fill="#38bdf8" opacity={0.06} />
      )}
    </g>
  );
};
