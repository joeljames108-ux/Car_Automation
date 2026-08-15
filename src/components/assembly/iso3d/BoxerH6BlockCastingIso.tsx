import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import {
  projectIso,
  projectIsoFlatEllipse,
  getIsoSplitCaseFacets,
  getIsoRibTrapezoid,
  type ScreenPoint2D,
} from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface BoxerH6BlockCastingIsoProps {
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
 * BOXER-6 / FLAT-6 ENGINE BLOCK — 180° Porsche Motorsport Split-Case
 * ═══════════════════════════════════════════════════════════════════
 *
 * High-Revving 4.0L Naturally Aspirated / Twin-Turbo Flat-6 Monoblock
 * Inspired by: Porsche 992 GT3 4.0L (9,000 RPM), 911 Turbo S 3.8L
 *
 * 11 SVG Layers (bottom-up Z-ordering):
 *  1. Ground shadow (wide low-slung horizontal racing footprint)
 *  2. Lower crankcase half & integrated dry-sump scavenge floor
 *  3. Split crankcase parting seam & 10 high-tensile through-bolts
 *  4. Upper crankcase half & 4 central main bearing webs
 *  5. Left horizontal cylinder bank (3 opposed barrels @ +Y)
 *  6. Right horizontal cylinder bank (3 opposed barrels @ -Y)
 *  7. Cylinder bores (6 horizontally-opposed chamfered openings + honing)
 *  8. Front chain drive case & rear motorsport transaxle flange
 *  9. Structural strengthening ribs & coolant bridge channels
 * 10. Oil gallery plugs, twin knock sensors & casting serial stamp
 * 11. Specular edge highlights & ambient occlusion shadows
 */
export const BoxerH6BlockCastingIso: React.FC<BoxerH6BlockCastingIsoProps> = ({
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O: ScreenPoint2D = { x: 250, y: 225 };

  // ─── PRIMARY DIMENSIONS (mm) ───
  // Longer Boxer-6 (185mm vs 145mm for Boxer-4)
  const BL = 186;       // Block Length along X (crankshaft axis)
  const halfL = BL / 2; // 93mm
  const TOTAL_W = 216;  // Wide horizontal span
  const halfW = TOTAL_W / 2; // 108mm
  const BH = 88;        // Very low center of gravity
  const SPLIT_Z = 43;   // Parting line height

  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  const splitCase = getIsoSplitCaseFacets(BL, TOTAL_W, BH, SPLIT_Z, O);

  // ─── BORE GEOMETRY (3 Left + 3 Right = 6 Total) ───
  const BORE_RADIUS = 21;     // ~84mm bore
  const boreXPositions = [-50, 0, 50]; // 3 cylinders along X

  // Left Bank Deck
  const lbFL = projectIso({ x: -halfL + 12, y: halfW, z: SPLIT_Z - 20 }, O);
  const lbFR = projectIso({ x: halfL - 12, y: halfW, z: SPLIT_Z - 20 }, O);
  const lbTL = projectIso({ x: -halfL + 12, y: halfW, z: SPLIT_Z + 20 }, O);
  const lbTR = projectIso({ x: halfL - 12, y: halfW, z: SPLIT_Z + 20 }, O);

  // Right Bank Deck
  const rbFL = projectIso({ x: -halfL + 12, y: -halfW, z: SPLIT_Z - 20 }, O);
  const rbFR = projectIso({ x: halfL - 12, y: -halfW, z: SPLIT_Z - 20 }, O);
  const rbTL = projectIso({ x: -halfL + 12, y: -halfW, z: SPLIT_Z + 20 }, O);
  const rbTR = projectIso({ x: halfL - 12, y: -halfW, z: SPLIT_Z + 20 }, O);

  return (
    <g
      id="iso-block-boxer6-casting"
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
      <ellipse cx={O.x} cy={O.y + 48} rx={155} ry={30}
        fill="url(#iso-ground-shadow)" opacity={0.8} />

      {/* ═══ LAYER 2 — LOWER CRANKCASE HALF & DRY-SUMP FLOOR ═══ */}
      <path d={splitCase.lowerCase.front} fill={fills.left} stroke="#090d16" strokeWidth="1.3" />
      <path d={splitCase.lowerCase.right} fill={fills.right} stroke="#090d16" strokeWidth="1.3" />
      {/* Dry-sump cooling ribs on bottom */}
      {[-60, -30, 0, 30, 60].map((xPos, i) => {
        const finL = projectIso({ x: xPos, y: halfW * 0.5, z: 2 }, O);
        const finR = projectIso({ x: xPos, y: -halfW * 0.5, z: 2 }, O);
        return (
          <line key={`sump-fin-h6-${i}`} x1={finL.x} y1={finL.y} x2={finR.x} y2={finR.y}
            stroke="#1e293b" strokeWidth="1.8" opacity={0.5} strokeLinecap="round" />
        );
      })}

      {/* ═══ LAYER 3 — SPLIT PARTING SEAM & 10 THROUGH-BOLTS ═══ */}
      <path d={splitCase.partingLineFront} stroke="#38bdf8" strokeWidth="1.2" opacity={0.7} strokeDasharray="6,2" />
      <path d={splitCase.partingLineRight} stroke="#0284c7" strokeWidth="1.2" opacity={0.6} strokeDasharray="6,2" />
      {[-70, -35, 0, 35, 70].map((xPos, i) => {
        const boltFront = projectIso({ x: xPos, y: halfW * 0.65, z: SPLIT_Z }, O);
        const boltRight = projectIso({ x: halfL, y: -halfW * 0.4 + i * (halfW * 0.2), z: SPLIT_Z }, O);
        return (
          <g key={`through-bolt-h6-${i}`}>
            <circle cx={boltFront.x} cy={boltFront.y} r={2.8} fill={fills.left} stroke="#0284c7" strokeWidth="0.6" />
            <circle cx={boltFront.x} cy={boltFront.y} r={1.2} fill="#020617" />
            <circle cx={boltRight.x} cy={boltRight.y} r={2.5} fill={fills.right} stroke="#0284c7" strokeWidth="0.5" />
            <circle cx={boltRight.x} cy={boltRight.y} r={1} fill="#020617" />
          </g>
        );
      })}

      {/* ═══ LAYER 4 — UPPER CRANKCASE HALF & 4 MAIN WEBS ═══ */}
      <path d={splitCase.upperCase.front} fill={fills.left} stroke="#090d16" strokeWidth="1.4" />
      <path d={splitCase.upperCase.right} fill={fills.right} stroke="#090d16" strokeWidth="1.4" />
      <path d={splitCase.upperCase.top} fill={fills.top} stroke="#0f172a" strokeWidth="1.5" />

      {/* ═══ LAYER 5 — LEFT HORIZONTAL CYLINDER BANK (+Y) ═══ */}
      <path
        d={`M ${lbFL.x} ${lbFL.y} L ${lbFR.x} ${lbFR.y} L ${lbTR.x} ${lbTR.y} L ${lbTL.x} ${lbTL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1.4"
      />

      {/* ═══ LAYER 6 — RIGHT HORIZONTAL CYLINDER BANK (-Y) ═══ */}
      <path
        d={`M ${rbFL.x} ${rbFL.y} L ${rbFR.x} ${rbFR.y} L ${rbTR.x} ${rbTR.y} L ${rbTL.x} ${rbTL.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.4"
      />

      {/* ═══ LAYER 7 — CYLINDER BORES (3 Left + 3 Right @ 180°) ═══ */}
      {/* Left Bank */}
      {boreXPositions.map((boreX, idx) => {
        const leftE = projectIsoFlatEllipse(
          { x: boreX, y: halfW - 2, z: SPLIT_Z },
          BORE_RADIUS, "left", O
        );
        return (
          <g key={`boxer6-bore-left-${idx}`}>
            <ellipse cx={leftE.cx} cy={leftE.cy} rx={leftE.rx + 2} ry={leftE.ry + 2}
              transform={`rotate(${leftE.tiltDeg}, ${leftE.cx}, ${leftE.cy})`}
              fill="none" stroke="#64748b" strokeWidth="1.6" opacity={0.5} />
            <ellipse cx={leftE.cx} cy={leftE.cy} rx={leftE.rx} ry={leftE.ry}
              transform={`rotate(${leftE.tiltDeg}, ${leftE.cx}, ${leftE.cy})`}
              fill="#020617" stroke="#0f172a" strokeWidth="1.4" />
            <ellipse cx={leftE.cx + 2} cy={leftE.cy} rx={leftE.rx * 0.75} ry={leftE.ry * 0.75}
              transform={`rotate(${leftE.tiltDeg}, ${leftE.cx}, ${leftE.cy})`}
              fill="#000000" opacity={0.6} />
          </g>
        );
      })}

      {/* Right Bank */}
      {boreXPositions.map((boreX, idx) => {
        const rightE = projectIsoFlatEllipse(
          { x: boreX, y: -halfW + 2, z: SPLIT_Z },
          BORE_RADIUS, "right", O
        );
        return (
          <g key={`boxer6-bore-right-${idx}`}>
            <ellipse cx={rightE.cx} cy={rightE.cy} rx={rightE.rx + 2} ry={rightE.ry + 2}
              transform={`rotate(${rightE.tiltDeg}, ${rightE.cx}, ${rightE.cy})`}
              fill="none" stroke="#64748b" strokeWidth="1.6" opacity={0.5} />
            <ellipse cx={rightE.cx} cy={rightE.cy} rx={rightE.rx} ry={rightE.ry}
              transform={`rotate(${rightE.tiltDeg}, ${rightE.cx}, ${rightE.cy})`}
              fill="#020617" stroke="#0f172a" strokeWidth="1.4" />
            <ellipse cx={rightE.cx - 2} cy={rightE.cy} rx={rightE.rx * 0.75} ry={rightE.ry * 0.75}
              transform={`rotate(${rightE.tiltDeg}, ${rightE.cx}, ${rightE.cy})`}
              fill="#000000" opacity={0.6} />
          </g>
        );
      })}

      {/* ═══ LAYER 8 — DOHC TIMING DRIVE & MOTORSPORT BELLHOUSING ═══ */}
      {(() => {
        const tcTop = projectIso({ x: -halfL - 6, y: halfW * 0.6, z: BH }, O);
        const tcBot = projectIso({ x: -halfL - 6, y: halfW * 0.6, z: 0 }, O);
        const tcTopR = projectIso({ x: -halfL - 6, y: -halfW * 0.6, z: BH }, O);
        const tcBotR = projectIso({ x: -halfL - 6, y: -halfW * 0.6, z: 0 }, O);
        return (
          <g opacity={0.75}>
            <path
              d={`M ${tcTop.x} ${tcTop.y} L ${tcTopR.x} ${tcTopR.y} L ${tcBotR.x} ${tcBotR.y} L ${tcBot.x} ${tcBot.y} Z`}
              fill={fills.left} stroke="#0f172a" strokeWidth="1"
            />
            {(() => {
              const camL = projectIso({ x: -halfL - 7, y: halfW * 0.45, z: SPLIT_Z }, O);
              const camR = projectIso({ x: -halfL - 7, y: -halfW * 0.45, z: SPLIT_Z }, O);
              const crankN = projectIso({ x: -halfL - 7, y: 0, z: SPLIT_Z }, O);
              return (
                <>
                  <circle cx={camL.x} cy={camL.y} r={7.5} fill="#020617" stroke="#334155" strokeWidth="0.6" />
                  <circle cx={camR.x} cy={camR.y} r={7.5} fill="#020617" stroke="#334155" strokeWidth="0.6" />
                  <circle cx={crankN.x} cy={crankN.y} r={8.5} fill="#020617" stroke="#334155" strokeWidth="0.6" />
                </>
              );
            })()}
          </g>
        );
      })()}
      {/* Bellhousing */}
      {(() => {
        const bhTop = projectIso({ x: halfL + 6, y: halfW * 0.75, z: BH }, O);
        const bhBot = projectIso({ x: halfL + 6, y: halfW * 0.75, z: 0 }, O);
        const bhTopR = projectIso({ x: halfL + 6, y: -halfW * 0.75, z: BH }, O);
        const bhBotR = projectIso({ x: halfL + 6, y: -halfW * 0.75, z: 0 }, O);
        return (
          <g opacity={0.7}>
            <path
              d={`M ${bhTop.x} ${bhTop.y} L ${bhTopR.x} ${bhTopR.y} L ${bhBotR.x} ${bhBotR.y} L ${bhBot.x} ${bhBot.y} Z`}
              fill={fills.right} stroke="#0f172a" strokeWidth="1"
            />
            {(() => {
              const fw = projectIso({ x: halfL + 7, y: 0, z: SPLIT_Z }, O);
              return <circle cx={fw.x} cy={fw.y} r={16} fill="#020617" stroke="#1e293b" strokeWidth="0.8" />;
            })()}
          </g>
        );
      })()}

      {/* ═══ LAYER 9 — STRUCTURAL RIBS ═══ */}
      {[-45, 0, 45].map((xPos, i) => {
        const rib = getIsoRibTrapezoid(
          { x: xPos, y: 0, z: BH + 2 },
          { x: xPos, y: 0, z: SPLIT_Z + 10 },
          6, 32, O
        );
        return (
          <g key={`boxer6-rib-${i}`} opacity={0.6}>
            <path d={rib.frontFace} fill={fills.left} stroke="#1e293b" strokeWidth="0.6" />
            <path d={rib.topCap} fill={fills.top} stroke="#1e293b" strokeWidth="0.5" />
          </g>
        );
      })}

      {/* ═══ LAYER 10 — OIL GALLERY PLUGS & KNOCK SENSORS ═══ */}
      {[-30, 30].map((xPos, i) => {
        const ks = projectIso({ x: xPos, y: 0, z: BH + 1 }, O);
        return (
          <g key={`boxer6-ks-${i}`}>
            <circle cx={ks.x} cy={ks.y} r={4.5} fill={fills.top} stroke="#334155" strokeWidth="0.6" />
            <circle cx={ks.x} cy={ks.y} r={2} fill="#020617" stroke="#64748b" strokeWidth="0.4" />
          </g>
        );
      })}

      {/* ═══ LAYER 11 — SPECULAR HIGHLIGHTS & AO ═══ */}
      {(() => {
        const tFL = projectIso({ x: -halfL, y: halfW * 0.4, z: BH }, O);
        const tFR = projectIso({ x: halfL, y: halfW * 0.4, z: BH }, O);
        const tBL = projectIso({ x: -halfL, y: -halfW * 0.4, z: BH }, O);
        return (
          <>
            <path d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y}`}
              stroke="#e2e8f0" strokeWidth="1.2" opacity={0.5} strokeLinecap="round" />
            <path d={`M ${tFL.x} ${tFL.y} L ${tBL.x} ${tBL.y}`}
              stroke="#f8fafc" strokeWidth="0.8" opacity={0.35} strokeLinecap="round" />
          </>
        );
      })()}

      {/* Active glow */}
      {blockState.isActive && (
        <rect x={O.x - 150} y={O.y - 85} width={300} height={165} rx={8}
          fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity={0.4}
          className="animate-pulse" />
      )}
      {/* Hover highlight */}
      {blockState.isHovered && !blockState.isActive && (
        <rect x={O.x - 150} y={O.y - 85} width={300} height={165} rx={8}
          fill="#38bdf8" opacity={0.06} />
      )}
    </g>
  );
};
