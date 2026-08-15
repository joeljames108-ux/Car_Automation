import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import {
  projectIso,
  projectIsoWBankQuadEllipse,
  getIsoRibTrapezoid,
  type ScreenPoint2D,
} from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface W18BlockCastingIsoProps {
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
 * W18 ENGINE BLOCK — Triple-VR6 6.3L Concept Flagship Monoblock
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ultra-Exotic 6.3L Triple-VR6 18-Cylinder Engine Block Casting
 * Inspired by: Bugatti EB 118 / EB 218 / Chiron 18/3 Concept Engines
 *
 * 11 SVG Layers (bottom-up Z-ordering):
 *  1. Ground shadow (colossal concept engine footprint)
 *  2. Reinforced crankcase skirt & 10 main bearing bulkheads
 *  3. Main block body casting (triangular triple-bank silhouette)
 *  4. Left VR bank deck (3 cylinders @ +60°)
 *  5. Center vertical VR bank deck (6 cylinders @ 0° top)
 *  6. Right VR bank deck (3 cylinders @ -60°)
 *  7. Cylinder bores (18 chamfered openings + cross-hatch honing)
 *  8. Triple-cam timing drive housing & heavy-duty AWD bellhousing
 *  9. Structural strengthening ribs & cross-bank coolant channels
 * 10. Head bolt bosses & high-pressure oil gallery plugs
 * 11. Specular edge highlights & ambient occlusion shadows
 */
export const W18BlockCastingIso: React.FC<W18BlockCastingIsoProps> = ({
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O: ScreenPoint2D = { x: 250, y: 215 };

  // ─── PRIMARY DIMENSIONS (mm) ───
  const BL = 228;       // Block Length along X
  const halfL = BL / 2; // 114mm

  const BANK_OUTER_Y = 104;
  const BANK_INNER_Y = 36;
  const BANK_OUTER_Z = 172;
  const BANK_INNER_Z = 140;

  const CRANK_Z_BOT = 16;
  const CRANK_Z_TOP = 102;
  const CRANK_Y_OUTER = 40;
  const CRANK_Y_TOP = 50;

  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  // ─── BORE GEOMETRY (6 per bank row = 18 total) ───
  const boreXPositions = [-75, -45, -15, 15, 45, 75];

  // ─── 3D CORNER POINTS ───
  const sFL = projectIso({ x: -halfL - 14, y: CRANK_Y_OUTER + 12, z: CRANK_Z_BOT - 12 }, O);
  const sFR = projectIso({ x: halfL + 14, y: CRANK_Y_OUTER + 12, z: CRANK_Z_BOT - 12 }, O);
  const sBL = projectIso({ x: -halfL - 14, y: -CRANK_Y_OUTER - 12, z: CRANK_Z_BOT - 12 }, O);
  const sBR = projectIso({ x: halfL + 14, y: -CRANK_Y_OUTER - 12, z: CRANK_Z_BOT - 12 }, O);

  const cFL = projectIso({ x: -halfL, y: CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
  const cFR = projectIso({ x: halfL, y: CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
  const cBR = projectIso({ x: halfL, y: -CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
  const cBL = projectIso({ x: -halfL, y: -CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);

  const wFL = projectIso({ x: -halfL, y: CRANK_Y_TOP, z: CRANK_Z_TOP }, O);
  const wFR = projectIso({ x: halfL, y: CRANK_Y_TOP, z: CRANK_Z_TOP }, O);
  const wBR = projectIso({ x: halfL, y: -CRANK_Y_TOP, z: CRANK_Z_TOP }, O);

  const lbOuterFL = projectIso({ x: -halfL, y: BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const lbOuterFR = projectIso({ x: halfL, y: BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const rbOuterFL = projectIso({ x: -halfL, y: -BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const rbOuterFR = projectIso({ x: halfL, y: -BANK_OUTER_Y, z: BANK_OUTER_Z }, O);

  const centerDeckFL = projectIso({ x: -halfL, y: 0, z: BANK_OUTER_Z + 10 }, O);
  const centerDeckFR = projectIso({ x: halfL, y: 0, z: BANK_OUTER_Z + 10 }, O);

  return (
    <g
      id="iso-block-w18-casting"
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
      <ellipse cx={O.x} cy={O.y + 70} rx={160} ry={36}
        fill="url(#iso-ground-shadow)" opacity={0.84} />

      {/* ═══ LAYER 2 — LOWER CRANKCASE SKIRT & 10 MAIN BULKHEADS ═══ */}
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
      {/* 10 Main bearing saddles */}
      {[-90, -70, -50, -30, -10, 10, 30, 50, 70, 90].map((xPos, i) => {
        const saddle = projectIso({ x: xPos, y: 0, z: CRANK_Z_BOT + 12 }, O);
        return (
          <g key={`w18-saddle-${i}`}>
            <circle cx={saddle.x} cy={saddle.y} r={7} fill="#020617" stroke="#1e293b" strokeWidth="0.8" opacity={0.75} />
            <circle cx={saddle.x - 4} cy={saddle.y} r={1.3} fill="#0f172a" stroke="#334155" strokeWidth="0.4" />
            <circle cx={saddle.x + 4} cy={saddle.y} r={1.3} fill="#0f172a" stroke="#334155" strokeWidth="0.4" />
          </g>
        );
      })}

      {/* ═══ LAYER 3 — MAIN BLOCK BODY ═══ */}
      <path
        d={`M ${cFL.x} ${cFL.y} L ${cFR.x} ${cFR.y} L ${wFR.x} ${wFR.y} L ${wFL.x} ${wFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1.4"
      />
      <path
        d={`M ${cFR.x} ${cFR.y} L ${cBR.x} ${cBR.y} L ${wBR.x} ${wBR.y} L ${wFR.x} ${wFR.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.4"
      />
      <path
        d={`M ${wFL.x} ${wFL.y} L ${wFR.x} ${wFR.y} L ${lbOuterFR.x} ${lbOuterFR.y} L ${lbOuterFL.x} ${lbOuterFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1.4"
      />
      <path
        d={`M ${wFR.x} ${wFR.y} L ${wBR.x} ${wBR.y} L ${rbOuterFR.x} ${rbOuterFR.y} L ${rbOuterFL.x} ${rbOuterFL.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.4"
      />

      {/* ═══ LAYER 4 — LEFT BANK DECK ═══ */}
      <path
        d={`M ${lbOuterFL.x} ${lbOuterFL.y} L ${lbOuterFR.x} ${lbOuterFR.y} L ${centerDeckFR.x} ${centerDeckFR.y} L ${centerDeckFL.x} ${centerDeckFL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="1.5"
      />

      {/* ═══ LAYER 5 — RIGHT BANK DECK ═══ */}
      <path
        d={`M ${centerDeckFL.x} ${centerDeckFL.y} L ${centerDeckFR.x} ${centerDeckFR.y} L ${rbOuterFR.x} ${rbOuterFR.y} L ${rbOuterFL.x} ${rbOuterFL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="1.5"
      />

      {/* ═══ LAYER 6 — TRIPLE-VALLEY CENTRAL SPINE ═══ */}
      <path d={`M ${centerDeckFL.x} ${centerDeckFL.y} L ${centerDeckFR.x} ${centerDeckFR.y}`}
        stroke="#38bdf8" strokeWidth="2" strokeDasharray="8,3" opacity={0.7} />

      {/* ═══ LAYER 7 — CYLINDER BORES (18 Openings across 3 Banks) ═══ */}
      {/* Left 6 Bores */}
      {boreXPositions.map((boreX, idx) => {
        const leftE = projectIsoWBankQuadEllipse(
          { x: boreX, y: BANK_OUTER_Y * 0.6, z: BANK_OUTER_Z - 6 },
          16, 0, 72, 15, O
        );
        return (
          <g key={`w18-bore-left-${idx}`}>
            <ellipse cx={leftE.cx} cy={leftE.cy} rx={leftE.rx + 2} ry={leftE.ry + 1.8}
              transform={`rotate(${leftE.tiltDeg}, ${leftE.cx}, ${leftE.cy})`}
              fill="none" stroke="#64748b" strokeWidth="1.5" opacity={0.5} />
            <ellipse cx={leftE.cx} cy={leftE.cy} rx={leftE.rx} ry={leftE.ry}
              transform={`rotate(${leftE.tiltDeg}, ${leftE.cx}, ${leftE.cy})`}
              fill="#020617" stroke="#0f172a" strokeWidth="1.3" />
            <ellipse cx={leftE.cx} cy={leftE.cy + 1.5} rx={leftE.rx * 0.75} ry={leftE.ry * 0.75}
              transform={`rotate(${leftE.tiltDeg}, ${leftE.cx}, ${leftE.cy})`}
              fill="#000000" opacity={0.55} />
          </g>
        );
      })}

      {/* Right 6 Bores */}
      {boreXPositions.map((boreX, idx) => {
        const rightE = projectIsoWBankQuadEllipse(
          { x: boreX, y: -BANK_OUTER_Y * 0.6, z: BANK_OUTER_Z - 6 },
          16, 3, 72, 15, O
        );
        return (
          <g key={`w18-bore-right-${idx}`}>
            <ellipse cx={rightE.cx} cy={rightE.cy} rx={rightE.rx + 2} ry={rightE.ry + 1.8}
              transform={`rotate(${rightE.tiltDeg}, ${rightE.cx}, ${rightE.cy})`}
              fill="none" stroke="#64748b" strokeWidth="1.5" opacity={0.5} />
            <ellipse cx={rightE.cx} cy={rightE.cy} rx={rightE.rx} ry={rightE.ry}
              transform={`rotate(${rightE.tiltDeg}, ${rightE.cx}, ${rightE.cy})`}
              fill="#020617" stroke="#0f172a" strokeWidth="1.3" />
            <ellipse cx={rightE.cx} cy={rightE.cy + 1.5} rx={rightE.rx * 0.75} ry={rightE.ry * 0.75}
              transform={`rotate(${rightE.tiltDeg}, ${rightE.cx}, ${rightE.cy})`}
              fill="#000000" opacity={0.55} />
          </g>
        );
      })}

      {/* Center 6 Bores (Top Spine Row) */}
      {boreXPositions.map((boreX, idx) => {
        const centerE = projectIso(
          { x: boreX, y: 0, z: BANK_OUTER_Z + 10 },
          O
        );
        return (
          <g key={`w18-bore-center-${idx}`}>
            <ellipse cx={centerE.x} cy={centerE.y} rx={14} ry={7}
              fill="none" stroke="#64748b" strokeWidth="1.5" opacity={0.5} />
            <ellipse cx={centerE.x} cy={centerE.y} rx={12} ry={6}
              fill="#020617" stroke="#0f172a" strokeWidth="1.3" />
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
        const bhBotL = projectIso({ x: halfL + 6, y: CRANK_Y_OUTER + 6, z: CRANK_Z_BOT - 6 }, O);
        const bhBotR = projectIso({ x: halfL + 6, y: -CRANK_Y_OUTER - 6, z: CRANK_Z_BOT - 6 }, O);
        return (
          <g opacity={0.7}>
            <path
              d={`M ${bhL.x} ${bhL.y} L ${bhR.x} ${bhR.y} L ${bhBotR.x} ${bhBotR.y} L ${bhBotL.x} ${bhBotL.y} Z`}
              fill={fills.right} stroke="#0f172a" strokeWidth="1"
            />
            {(() => {
              const fw = projectIso({ x: halfL + 7, y: 0, z: CRANK_Z_BOT + 25 }, O);
              return <circle cx={fw.x} cy={fw.y} r={18} fill="#020617" stroke="#1e293b" strokeWidth="0.8" />;
            })()}
          </g>
        );
      })()}

      {/* ═══ LAYER 9 — STRUCTURAL GUSSET RIBS ═══ */}
      {[-50, 0, 50].map((xPos, i) => {
        const rib = getIsoRibTrapezoid(
          { x: xPos, y: CRANK_Y_TOP + 4, z: CRANK_Z_TOP + 15 },
          { x: xPos, y: CRANK_Y_OUTER + 3, z: CRANK_Z_BOT + 8 },
          6, 4, O
        );
        return (
          <g key={`w18-rib-${i}`} opacity={0.6}>
            <path d={rib.frontFace} fill={fills.left} stroke="#1e293b" strokeWidth="0.6" />
            <path d={rib.topCap} fill={fills.top} stroke="#1e293b" strokeWidth="0.5" />
          </g>
        );
      })}

      {/* ═══ LAYER 10 — HEAD BOLT BOSSES ═══ */}
      {[-80, -48, -16, 16, 48, 80].map((xPos, i) => {
        const lbB = projectIso({ x: xPos, y: BANK_OUTER_Y - 6, z: BANK_OUTER_Z }, O);
        const rbB = projectIso({ x: xPos, y: -BANK_OUTER_Y + 6, z: BANK_OUTER_Z }, O);
        return (
          <g key={`w18-bolt-${i}`}>
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
      <path d={`M ${rbOuterFL.x} ${rbOuterFL.y} L ${rbOuterFR.x} ${rbOuterFR.y}`}
        stroke="#cbd5e1" strokeWidth="0.8" opacity={0.35} strokeLinecap="round" />

      {/* Active glow */}
      {blockState.isActive && (
        <rect x={O.x - 150} y={O.y - 115} width={300} height={220} rx={8}
          fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity={0.4}
          className="animate-pulse" />
      )}
      {/* Hover highlight */}
      {blockState.isHovered && !blockState.isActive && (
        <rect x={O.x - 150} y={O.y - 115} width={300} height={220} rx={8}
          fill="#38bdf8" opacity={0.06} />
      )}
    </g>
  );
};
