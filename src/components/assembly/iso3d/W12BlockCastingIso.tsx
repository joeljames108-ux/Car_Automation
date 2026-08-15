import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import {
  projectIso,
  projectIsoWBankQuadEllipse,
  getIsoRibTrapezoid,
  type ScreenPoint2D,
} from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface W12BlockCastingIsoProps {
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
 * W12 ENGINE BLOCK — Dual-VR6 72° Included Angle Quad-Bank Monoblock
 * ═══════════════════════════════════════════════════════════════════
 *
 * High-Performance 6.0L Twin-Turbocharged W12 Engine Block Casting
 * Inspired by: Bentley Continental GT W12, Audi A8 W12, VW Phaeton
 *
 * 11 SVG Layers (bottom-up Z-ordering):
 *  1. Ground shadow (broad compact high-displacement footprint)
 *  2. Lower crankcase skirt & 7 shared main bearing bulkheads
 *  3. Main block body casting (compact quad-bank W-silhouette)
 *  4. Left VR-pair decks (Banks 0 & 1 @ +43.5° and +28.5°)
 *  5. Right VR-pair decks (Banks 2 & 3 @ -28.5° and -43.5°)
 *  6. Dual valleys & central apex spine
 *  7. Cylinder bores (12 quad-staggered chamfered openings + cross-hatch honing)
 *  8. Multi-stage quad-cam timing chain cover & AWD bellhousing
 *  9. Structural strengthening ribs & cross-bank coolant channels
 * 10. Head bolt bosses & high-pressure oil gallery plugs
 * 11. Specular edge highlights & ambient occlusion shadows
 */
export const W12BlockCastingIso: React.FC<W12BlockCastingIsoProps> = ({
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O: ScreenPoint2D = { x: 250, y: 215 };

  // ─── PRIMARY DIMENSIONS (mm) ───
  // Extremely compact for a 12-cylinder (only 175mm length vs V12's 230mm)
  const BL = 175;       // Block Length along X (compact W architecture)
  const halfL = BL / 2; // 87.5mm

  const BANK_OUTER_Y = 92;    // Outer VR sub-bank flare
  const BANK_INNER_Y = 32;    // Inner VR sub-bank junction
  const BANK_OUTER_Z = 166;   // Outer deck height
  const BANK_INNER_Z = 138;   // Inner deck height

  const CRANK_Z_BOT = 16;     // Pan rail
  const CRANK_Z_TOP = 100;    // Waist line
  const CRANK_Y_OUTER = 36;   // Lower crankcase skirt
  const CRANK_Y_TOP = 46;

  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  // ─── BORE GEOMETRY (3 per bank × 4 banks = 12 total) ───
  const boreXPositions = [-42, 0, 42];

  // ─── 3D CORNER POINTS ───
  const sFL = projectIso({ x: -halfL - 12, y: CRANK_Y_OUTER + 10, z: CRANK_Z_BOT - 12 }, O);
  const sFR = projectIso({ x: halfL + 12, y: CRANK_Y_OUTER + 10, z: CRANK_Z_BOT - 12 }, O);
  const sBL = projectIso({ x: -halfL - 12, y: -CRANK_Y_OUTER - 10, z: CRANK_Z_BOT - 12 }, O);
  const sBR = projectIso({ x: halfL + 12, y: -CRANK_Y_OUTER - 10, z: CRANK_Z_BOT - 12 }, O);

  const cFL = projectIso({ x: -halfL, y: CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
  const cFR = projectIso({ x: halfL, y: CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
  const cBR = projectIso({ x: halfL, y: -CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);
  const cBL = projectIso({ x: -halfL, y: -CRANK_Y_OUTER, z: CRANK_Z_BOT }, O);

  const wFL = projectIso({ x: -halfL, y: CRANK_Y_TOP, z: CRANK_Z_TOP }, O);
  const wFR = projectIso({ x: halfL, y: CRANK_Y_TOP, z: CRANK_Z_TOP }, O);
  const wBR = projectIso({ x: halfL, y: -CRANK_Y_TOP, z: CRANK_Z_TOP }, O);

  // Outer decks
  const lbOuterFL = projectIso({ x: -halfL, y: BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const lbOuterFR = projectIso({ x: halfL, y: BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const rbOuterFL = projectIso({ x: -halfL, y: -BANK_OUTER_Y, z: BANK_OUTER_Z }, O);
  const rbOuterFR = projectIso({ x: halfL, y: -BANK_OUTER_Y, z: BANK_OUTER_Z }, O);

  // Center apex spine (between left VR and right VR)
  const spineFL = projectIso({ x: -halfL, y: 0, z: BANK_OUTER_Z - 10 }, O);
  const spineFR = projectIso({ x: halfL, y: 0, z: BANK_OUTER_Z - 10 }, O);

  return (
    <g
      id="iso-block-w12-casting"
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
      <ellipse cx={O.x} cy={O.y + 66} rx={145} ry={32}
        fill="url(#iso-ground-shadow)" opacity={0.8} />

      {/* ═══ LAYER 2 — LOWER CRANKCASE SKIRT & 7 MAIN BULKHEADS ═══ */}
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
      {/* 7 Main bearing saddles */}
      {[-60, -40, -20, 0, 20, 40, 60].map((xPos, i) => {
        const saddle = projectIso({ x: xPos, y: 0, z: CRANK_Z_BOT + 12 }, O);
        return (
          <g key={`w12-saddle-${i}`}>
            <circle cx={saddle.x} cy={saddle.y} r={7} fill="#020617" stroke="#1e293b" strokeWidth="0.8" opacity={0.75} />
            <circle cx={saddle.x - 4} cy={saddle.y} r={1.3} fill="#0f172a" stroke="#334155" strokeWidth="0.4" />
            <circle cx={saddle.x + 4} cy={saddle.y} r={1.3} fill="#0f172a" stroke="#334155" strokeWidth="0.4" />
          </g>
        );
      })}

      {/* ═══ LAYER 3 — MAIN BLOCK BODY (W-SHAPE SILHOUETTE) ═══ */}
      <path
        d={`M ${cFL.x} ${cFL.y} L ${cFR.x} ${cFR.y} L ${wFR.x} ${wFR.y} L ${wFL.x} ${wFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1.4"
      />
      <path
        d={`M ${cFR.x} ${cFR.y} L ${cBR.x} ${cBR.y} L ${wBR.x} ${wBR.y} L ${wFR.x} ${wFR.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.4"
      />
      {/* Left outer flank */}
      <path
        d={`M ${wFL.x} ${wFL.y} L ${wFR.x} ${wFR.y} L ${lbOuterFR.x} ${lbOuterFR.y} L ${lbOuterFL.x} ${lbOuterFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1.4"
      />
      {/* Right outer flank */}
      <path
        d={`M ${wFR.x} ${wFR.y} L ${wBR.x} ${wBR.y} L ${rbOuterFR.x} ${rbOuterFR.y} L ${rbOuterFL.x} ${rbOuterFL.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.4"
      />

      {/* ═══ LAYER 4 — LEFT VR-PAIR DECKS (Banks 0 & 1) ═══ */}
      <path
        d={`M ${lbOuterFL.x} ${lbOuterFL.y} L ${lbOuterFR.x} ${lbOuterFR.y} L ${spineFR.x} ${spineFR.y} L ${spineFL.x} ${spineFL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="1.5"
      />

      {/* ═══ LAYER 5 — RIGHT VR-PAIR DECKS (Banks 2 & 3) ═══ */}
      <path
        d={`M ${spineFL.x} ${spineFL.y} L ${spineFR.x} ${spineFR.y} L ${rbOuterFR.x} ${rbOuterFR.y} L ${rbOuterFL.x} ${rbOuterFL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="1.5"
      />

      {/* ═══ LAYER 6 — CENTRAL APEX SPINE ═══ */}
      <path d={`M ${spineFL.x} ${spineFL.y} L ${spineFR.x} ${spineFR.y}`}
        stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8,3" opacity={0.6} />

      {/* ═══ LAYER 7 — CYLINDER BORES (12 Quad-Staggered Openings) ═══ */}
      {/* 4 Banks × 3 Bores */}
      {([0, 1, 2, 3] as const).map((bankIdx) => {
        const ySign = bankIdx < 2 ? 1 : -1;
        const subOffset = bankIdx % 2 === 0 ? 12 : -12;
        const bankY = (bankIdx < 2 ? (BANK_OUTER_Y + BANK_INNER_Y) / 2 : -(BANK_OUTER_Y + BANK_INNER_Y) / 2) + subOffset;
        const bankZ = bankIdx % 2 === 0 ? BANK_OUTER_Z - 5 : BANK_INNER_Z + 5;

        return boreXPositions.map((boreX, idx) => {
          const boreE = projectIsoWBankQuadEllipse(
            { x: boreX + (bankIdx % 2 === 1 ? 12 : 0), y: bankY, z: bankZ },
            17, bankIdx, 72, 15, O
          );
          return (
            <g key={`w12-bore-${bankIdx}-${idx}`}>
              <ellipse cx={boreE.cx} cy={boreE.cy} rx={boreE.rx + 2} ry={boreE.ry + 1.8}
                transform={`rotate(${boreE.tiltDeg}, ${boreE.cx}, ${boreE.cy})`}
                fill="none" stroke="#64748b" strokeWidth="1.5" opacity={0.5} />
              <ellipse cx={boreE.cx} cy={boreE.cy} rx={boreE.rx} ry={boreE.ry}
                transform={`rotate(${boreE.tiltDeg}, ${boreE.cx}, ${boreE.cy})`}
                fill="#020617" stroke="#0f172a" strokeWidth="1.3" />
              <ellipse cx={boreE.cx} cy={boreE.cy + 1.5} rx={boreE.rx * 0.75} ry={boreE.ry * 0.75}
                transform={`rotate(${boreE.tiltDeg}, ${boreE.cx}, ${boreE.cy})`}
                fill="#000000" opacity={0.55} />
            </g>
          );
        });
      })}

      {/* ═══ LAYER 8 — QUAD-CAM TIMING COVER & BELLHOUSING ═══ */}
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
            {/* Quad camshaft sprockets */}
            {[-45, -18, 18, 45].map((yPos, i) => {
              const cam = projectIso({ x: -halfL - 7, y: yPos, z: BANK_INNER_Z + 12 }, O);
              return <circle key={`w12-cam-${i}`} cx={cam.x} cy={cam.y} r={5} fill="#020617" stroke="#334155" strokeWidth="0.5" />;
            })}
            {(() => {
              const crankN = projectIso({ x: -halfL - 7, y: 0, z: CRANK_Z_BOT + 18 }, O);
              return <circle cx={crankN.x} cy={crankN.y} r={8.5} fill="#020617" stroke="#334155" strokeWidth="0.6" />;
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
          5.5, 3.5, O
        );
        return (
          <g key={`w12-rib-${i}`} opacity={0.6}>
            <path d={rib.frontFace} fill={fills.left} stroke="#1e293b" strokeWidth="0.6" />
            <path d={rib.topCap} fill={fills.top} stroke="#1e293b" strokeWidth="0.5" />
          </g>
        );
      })}

      {/* ═══ LAYER 10 — HEAD BOLT BOSSES ═══ */}
      {[-60, -20, 20, 60].map((xPos, i) => {
        const lbB = projectIso({ x: xPos, y: BANK_OUTER_Y - 6, z: BANK_OUTER_Z }, O);
        const rbB = projectIso({ x: xPos, y: -BANK_OUTER_Y + 6, z: BANK_OUTER_Z }, O);
        return (
          <g key={`w12-bolt-${i}`}>
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
