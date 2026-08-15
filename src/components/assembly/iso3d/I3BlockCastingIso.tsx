import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import {
  projectIso,
  projectIsoEllipse,
  getIsoRibTrapezoid,
  getIsoBearingWebs,
  getIsoBoltBossRow,
  type ScreenPoint2D,
} from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface I3BlockCastingIsoProps {
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
 * INLINE-3 ENGINE BLOCK — Compact High-Efficiency Turbocharged Casting
 * ═══════════════════════════════════════════════════════════════════
 *
 * Compact 1.0L–1.5L Inline-3 Turbocharged Engine Block
 * Inspired by: Ford EcoBoost 1.0L, BMW B38, Toyota 1KR-VET
 *
 * 11 SVG Layers (bottom-up):
 *  1. Ground shadow
 *  2. Lower crankcase skirt with thick NVH-damping walls
 *  3. Main block body (narrow compact rectangular casting)
 *  4. Open crankcase bays (4 main bearing bulkheads, 3 crank windows)
 *  5. Counter-balance shaft housing (unique to I3 for primary vibration cancellation)
 *  6. Cylinder bores (3 chamfered openings with honing cross-hatch)
 *  7. Water jacket passages & thermostat housing
 *  8. Timing chain cover face & bellhousing flange
 *  9. Head bolt bosses (8 per deck) & structural ribs
 * 10. Oil gallery plugs, knock sensor, casting surface detail
 * 11. Specular highlights & ambient occlusion shadows
 */
export const I3BlockCastingIso: React.FC<I3BlockCastingIsoProps> = ({
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O: ScreenPoint2D = { x: 250, y: 215 };

  // ─── PRIMARY DIMENSIONS ───
  // I3 is the most compact inline — shorter and narrower than I4
  const BL = 140;       // Block Length (shorter than I4's 175)
  const halfL = BL / 2;
  const BD = 88;        // Block Depth (slightly narrower)
  const halfD = BD / 2;
  const BH = 148;       // Block Height (slightly shorter)

  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  // ─── KEY Z-HEIGHTS ───
  const SKIRT_Z = -16;       // Deeper skirt for NVH
  const PAN_RAIL_Z = 0;
  const BALANCE_SHAFT_Z = 12; // Counter-balance shaft housing
  const CRANK_BAY_Z = 24;
  const CRANK_TOP_Z = 72;
  const WATER_JACKET_Z = 92;
  const DECK_Z = BH;

  // ─── BORE GEOMETRY ───
  const NUM_CYLS = 3;
  const BORE_RADIUS = 21;    // ~84mm bore
  const BORE_SPACING = 38;   // Wider spacing for 3-cyl vibration room
  const boreXPositions = Array.from({ length: NUM_CYLS }, (_, i) =>
    -((NUM_CYLS - 1) * BORE_SPACING) / 2 + i * BORE_SPACING
  );

  // ─── 3D CORNER POINTS ───
  // Skirt (wider flange, deeper for NVH damping)
  const sFL = projectIso({ x: -halfL - 14, y: halfD + 12, z: SKIRT_Z }, O);
  const sFR = projectIso({ x: halfL + 14, y: halfD + 12, z: SKIRT_Z }, O);
  const sBL = projectIso({ x: -halfL - 14, y: -halfD - 12, z: SKIRT_Z }, O);
  const sBR = projectIso({ x: halfL + 14, y: -halfD - 12, z: SKIRT_Z }, O);

  // Base
  const bFL = projectIso({ x: -halfL, y: halfD, z: PAN_RAIL_Z }, O);
  const bFR = projectIso({ x: halfL, y: halfD, z: PAN_RAIL_Z }, O);
  const bBR = projectIso({ x: halfL, y: -halfD, z: PAN_RAIL_Z }, O);
  const bBL = projectIso({ x: -halfL, y: -halfD, z: PAN_RAIL_Z }, O);

  // Waist
  const mFL = projectIso({ x: -halfL, y: halfD, z: CRANK_TOP_Z }, O);
  const mFR = projectIso({ x: halfL, y: halfD, z: CRANK_TOP_Z }, O);
  const mBR = projectIso({ x: halfL, y: -halfD, z: CRANK_TOP_Z }, O);

  // Top deck
  const tFL = projectIso({ x: -halfL, y: halfD, z: DECK_Z }, O);
  const tFR = projectIso({ x: halfL, y: halfD, z: DECK_Z }, O);
  const tBL = projectIso({ x: -halfL, y: -halfD, z: DECK_Z }, O);
  const tBR = projectIso({ x: halfL, y: -halfD, z: DECK_Z }, O);

  // Bearing webs — 4 webs for 3 cylinders
  const NUM_WEBS = 4;
  const webs = getIsoBearingWebs(BL, NUM_WEBS, 9, BD * 0.6, 50, CRANK_BAY_Z, O);

  // Head bolt bosses — 4 per row = 8 total
  const outerBolts = getIsoBoltBossRow(
    { x: -halfL + 12, y: halfD - 8, z: DECK_Z },
    { x: halfL - 12, y: halfD - 8, z: DECK_Z },
    4, 5.5, O
  );
  const innerBolts = getIsoBoltBossRow(
    { x: -halfL + 12, y: -halfD + 8, z: DECK_Z },
    { x: halfL - 12, y: -halfD + 8, z: DECK_Z },
    4, 5.5, O
  );

  return (
    <g
      id="iso-block-i3-casting"
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
      <ellipse cx={O.x} cy={O.y + 62} rx={100} ry={25}
        fill="url(#iso-ground-shadow)" opacity={0.7} />

      {/* ═══ LAYER 2 — LOWER CRANKCASE SKIRT (Thick NVH Walls) ═══ */}
      {/* Bottom face */}
      <path
        d={`M ${sFL.x} ${sFL.y} L ${sFR.x} ${sFR.y} L ${sBR.x} ${sBR.y} L ${sBL.x} ${sBL.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.2" opacity={0.6}
      />
      {/* Front transition */}
      <path
        d={`M ${sFL.x} ${sFL.y} L ${sFR.x} ${sFR.y} L ${bFR.x} ${bFR.y} L ${bFL.x} ${bFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1" opacity={0.75}
      />
      {/* Right transition */}
      <path
        d={`M ${sFR.x} ${sFR.y} L ${sBR.x} ${sBR.y} L ${bBR.x} ${bBR.y} L ${bFR.x} ${bFR.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1" opacity={0.7}
      />
      {/* Pan rail surface */}
      <path
        d={`M ${bFL.x} ${bFL.y} L ${bFR.x} ${bFR.y} L ${bBR.x} ${bBR.y} L ${bBL.x} ${bBL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="0.8" opacity={0.55}
      />
      {/* Pan rail bolts — fewer on compact I3 */}
      {Array.from({ length: 6 }).map((_, i) => {
        const isLeftSide = i < 3;
        const xPos = -halfL + 12 + (isLeftSide ? i : i - 3) * ((BL - 24) / 2);
        const yPos = isLeftSide ? halfD + 8 : -halfD - 8;
        const pt = projectIso({ x: xPos, y: yPos, z: SKIRT_Z + 2 }, O);
        return (
          <circle key={`pan-bolt-${i}`} cx={pt.x} cy={pt.y} r={2}
            fill="#020617" stroke="#1e293b" strokeWidth="0.5" />
        );
      })}

      {/* ═══ LAYER 3 — MAIN BLOCK BODY CASTING ═══ */}
      {/* Front face */}
      <path
        d={`M ${bFL.x} ${bFL.y} L ${bFR.x} ${bFR.y} L ${tFR.x} ${tFR.y} L ${tFL.x} ${tFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1.5"
      />
      {/* Right face */}
      <path
        d={`M ${bFR.x} ${bFR.y} L ${bBR.x} ${bBR.y} L ${tBR.x} ${tBR.y} L ${tFR.x} ${tFR.y} Z`}
        fill={fills.right} stroke="#090d16" strokeWidth="1.5"
      />
      {/* Waist line */}
      <path d={`M ${mFL.x} ${mFL.y} L ${mFR.x} ${mFR.y}`}
        stroke="#334155" strokeWidth="1.2" strokeDasharray="4,3" opacity={0.6} />
      <path d={`M ${mFR.x} ${mFR.y} L ${mBR.x} ${mBR.y}`}
        stroke="#1e293b" strokeWidth="1" strokeDasharray="4,3" opacity={0.5} />
      {/* Casting parting line */}
      {(() => {
        const partZ = BH * 0.52;
        const pFL = projectIso({ x: -halfL, y: halfD, z: partZ }, O);
        const pFR = projectIso({ x: halfL, y: halfD, z: partZ }, O);
        const pBR = projectIso({ x: halfL, y: -halfD, z: partZ }, O);
        return (
          <>
            <path d={`M ${pFL.x} ${pFL.y} L ${pFR.x} ${pFR.y}`}
              stroke="#475569" strokeWidth="0.6" opacity={0.4} />
            <path d={`M ${pFR.x} ${pFR.y} L ${pBR.x} ${pBR.y}`}
              stroke="#334155" strokeWidth="0.5" opacity={0.3} />
          </>
        );
      })()}

      {/* ═══ LAYER 4 — CRANKCASE BAYS & BEARING BULKHEADS ═══ */}
      {webs.map((web, idx) => (
        <g key={`bearing-web-${idx}`}>
          <path d={web.facets.front} fill={fills.left}
            stroke="#0f172a" strokeWidth="0.8" opacity={0.85} />
          <path d={web.facets.right} fill={fills.right}
            stroke="#0f172a" strokeWidth="0.7" opacity={0.75} />
          <path d={web.facets.top} fill={fills.top}
            stroke="#1e293b" strokeWidth="0.6" opacity={0.65} />
          {/* Journal saddle */}
          {(() => {
            const saddle = projectIsoEllipse(
              { x: web.xCenter, y: 0, z: CRANK_BAY_Z + 14 }, 11, O
            );
            return (
              <>
                <ellipse cx={saddle.cx} cy={saddle.cy} rx={saddle.rx} ry={saddle.ry}
                  fill="#020617" stroke="#1e293b" strokeWidth="0.8" opacity={0.7} />
                <circle cx={saddle.cx - saddle.rx - 3} cy={saddle.cy} r={1.6}
                  fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
                <circle cx={saddle.cx + saddle.rx + 3} cy={saddle.cy} r={1.6}
                  fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
              </>
            );
          })()}
        </g>
      ))}
      {/* Crankcase bay windows — 3 windows between 4 webs */}
      {Array.from({ length: NUM_CYLS }).map((_, i) => {
        const bayX = webs[i].xCenter + (webs[i + 1].xCenter - webs[i].xCenter) / 2;
        const bayTop = projectIso({ x: bayX, y: halfD - 8, z: CRANK_TOP_Z - 5 }, O);
        const bayBot = projectIso({ x: bayX, y: halfD - 8, z: CRANK_BAY_Z + 5 }, O);
        return (
          <g key={`crank-bay-${i}`}>
            <rect x={bayTop.x - 8} y={bayTop.y} width={16}
              height={bayBot.y - bayTop.y} rx={3} ry={3}
              fill="#020617" stroke="#1e293b" strokeWidth="0.8" opacity={0.8} />
            <line x1={bayTop.x - 6} y1={bayTop.y + 3} x2={bayTop.x + 6}
              y2={bayBot.y - 3} stroke="#334155" strokeWidth="0.6" opacity={0.5} />
          </g>
        );
      })}

      {/* ═══ LAYER 5 — COUNTER-BALANCE SHAFT HOUSING (UNIQUE TO I3) ═══ */}
      {/* I3 engines have inherent primary vibration — a counter-balance shaft
          is housed in a tunnel running parallel to the crankshaft */}
      {(() => {
        // Balance shaft housing — protrudes from right side of block
        const bsFL = projectIso({ x: -halfL + 15, y: -halfD - 15, z: BALANCE_SHAFT_Z }, O);
        const bsFR = projectIso({ x: halfL - 15, y: -halfD - 15, z: BALANCE_SHAFT_Z }, O);
        const bsBL = projectIso({ x: -halfL + 15, y: -halfD - 5, z: BALANCE_SHAFT_Z }, O);
        const bsBR = projectIso({ x: halfL - 15, y: -halfD - 5, z: BALANCE_SHAFT_Z }, O);
        const bsTFL = projectIso({ x: -halfL + 15, y: -halfD - 15, z: BALANCE_SHAFT_Z + 22 }, O);
        const bsTFR = projectIso({ x: halfL - 15, y: -halfD - 15, z: BALANCE_SHAFT_Z + 22 }, O);
        const bsTBR = projectIso({ x: halfL - 15, y: -halfD - 5, z: BALANCE_SHAFT_Z + 22 }, O);

        // Balance shaft bore positions
        const bsBore1 = projectIsoEllipse(
          { x: -halfL + 25, y: -halfD - 10, z: BALANCE_SHAFT_Z + 11 }, 6, O
        );
        const bsBore2 = projectIsoEllipse(
          { x: halfL - 25, y: -halfD - 10, z: BALANCE_SHAFT_Z + 11 }, 6, O
        );

        return (
          <g opacity={0.75}>
            {/* Housing right face */}
            <path
              d={`M ${bsFL.x} ${bsFL.y} L ${bsFR.x} ${bsFR.y} L ${bsTFR.x} ${bsTFR.y} L ${bsTFL.x} ${bsTFL.y} Z`}
              fill={fills.right} stroke="#0f172a" strokeWidth="0.8"
            />
            {/* Housing top face */}
            <path
              d={`M ${bsTFL.x} ${bsTFL.y} L ${bsTFR.x} ${bsTFR.y} L ${bsTBR.x} ${bsTBR.y} L ${projectIso({ x: -halfL + 15, y: -halfD - 5, z: BALANCE_SHAFT_Z + 22 }, O).x} ${projectIso({ x: -halfL + 15, y: -halfD - 5, z: BALANCE_SHAFT_Z + 22 }, O).y} Z`}
              fill={fills.top} stroke="#1e293b" strokeWidth="0.6"
            />
            {/* Balance shaft bearing bores */}
            <ellipse cx={bsBore1.cx} cy={bsBore1.cy} rx={bsBore1.rx} ry={bsBore1.ry}
              fill="#020617" stroke="#334155" strokeWidth="0.6" />
            <ellipse cx={bsBore2.cx} cy={bsBore2.cy} rx={bsBore2.rx} ry={bsBore2.ry}
              fill="#020617" stroke="#334155" strokeWidth="0.6" />
            {/* Housing mounting bolts */}
            {[0.2, 0.5, 0.8].map((t, i) => {
              const boltX = -halfL + 15 + t * (BL - 30);
              const bPt = projectIso({ x: boltX, y: -halfD - 14, z: BALANCE_SHAFT_Z + 18 }, O);
              return <circle key={`bs-bolt-${i}`} cx={bPt.x} cy={bPt.y} r={1.5}
                fill="#0f172a" stroke="#475569" strokeWidth="0.4" />;
            })}
            {/* "BALANCE SHAFT" label indicator — machined flat pad */}
            {(() => {
              const labelPt = projectIso({ x: 0, y: -halfD - 16, z: BALANCE_SHAFT_Z + 8 }, O);
              return (
                <rect x={labelPt.x - 18} y={labelPt.y - 2} width={36} height={4} rx={1}
                  fill="none" stroke="#475569" strokeWidth="0.4" opacity={0.4} />
              );
            })()}
          </g>
        );
      })()}

      {/* ═══ LAYER 6 — CYLINDER BORES (3 Chamfered + Honing) ═══ */}
      {boreXPositions.map((boreX, idx) => {
        const boreE = projectIsoEllipse({ x: boreX, y: 0, z: DECK_Z }, BORE_RADIUS, O);
        const chamferE = projectIsoEllipse({ x: boreX, y: 0, z: DECK_Z }, BORE_RADIUS + 3, O);
        const depthE = projectIsoEllipse({ x: boreX, y: 0, z: DECK_Z - 12 }, BORE_RADIUS - 1, O);
        return (
          <g key={`bore-${idx}`}>
            <ellipse cx={chamferE.cx} cy={chamferE.cy} rx={chamferE.rx} ry={chamferE.ry}
              fill="none" stroke="#64748b" strokeWidth="1.8" opacity={0.5} />
            <ellipse cx={boreE.cx} cy={boreE.cy} rx={boreE.rx} ry={boreE.ry}
              fill="#020617" stroke="#0f172a" strokeWidth="1.5" />
            <ellipse cx={depthE.cx} cy={depthE.cy + 4} rx={depthE.rx * 0.85}
              ry={depthE.ry * 0.85} fill="#000000" opacity={0.6} />
            {/* Honing cross-hatch */}
            {Array.from({ length: 3 }).map((_, h) => {
              const angle = (h * 60 - 30) * (Math.PI / 180);
              const len = BORE_RADIUS * COS_30_CONST * 0.65;
              return (
                <g key={`hone-${idx}-${h}`} opacity={0.25}>
                  <line x1={boreE.cx - len * Math.cos(angle)}
                    y1={boreE.cy - len * Math.sin(angle) * 0.5}
                    x2={boreE.cx + len * Math.cos(angle)}
                    y2={boreE.cy + len * Math.sin(angle) * 0.5}
                    stroke="#94a3b8" strokeWidth="0.4" />
                  <line x1={boreE.cx - len * Math.cos(angle + 1.05)}
                    y1={boreE.cy - len * Math.sin(angle + 1.05) * 0.5}
                    x2={boreE.cx + len * Math.cos(angle + 1.05)}
                    y2={boreE.cy + len * Math.sin(angle + 1.05) * 0.5}
                    stroke="#94a3b8" strokeWidth="0.35" />
                </g>
              );
            })}
            <ellipse cx={boreE.cx} cy={boreE.cy} rx={boreE.rx + 0.5}
              ry={boreE.ry + 0.25} fill="none" stroke="#e2e8f0"
              strokeWidth="0.6" opacity={0.45} />
          </g>
        );
      })}

      {/* ═══ LAYER 7 — WATER JACKET & THERMOSTAT ═══ */}
      {/* 2 water jacket passages between the 3 bores */}
      {Array.from({ length: 2 }).map((_, i) => {
        const wx = boreXPositions[i] + BORE_SPACING / 2;
        const wPt = projectIso({ x: wx, y: halfD + 1, z: WATER_JACKET_Z }, O);
        return (
          <g key={`water-jacket-${i}`}>
            <ellipse cx={wPt.x} cy={wPt.y} rx={5.5} ry={3.8}
              fill="#0c4a6e" stroke="#0369a1" strokeWidth="0.6" opacity={0.55} />
            <ellipse cx={wPt.x} cy={wPt.y + 0.5} rx={3.8} ry={2.2}
              fill="#082f49" opacity={0.7} />
          </g>
        );
      })}
      {/* Thermostat housing */}
      {(() => {
        const thPt = projectIso({ x: halfL + 3, y: -halfD * 0.25, z: WATER_JACKET_Z + 12 }, O);
        return (
          <g>
            <circle cx={thPt.x} cy={thPt.y} r={7}
              fill={fills.right} stroke="#1e293b" strokeWidth="0.8" opacity={0.65} />
            <circle cx={thPt.x} cy={thPt.y} r={4}
              fill="#0c4a6e" stroke="#0369a1" strokeWidth="0.5" opacity={0.6} />
          </g>
        );
      })()}

      {/* ═══ LAYER 8 — TIMING CHAIN COVER & BELLHOUSING ═══ */}
      {(() => {
        const tcTop = projectIso({ x: -halfL - 6, y: halfD * 0.7, z: DECK_Z - 18 }, O);
        const tcBot = projectIso({ x: -halfL - 6, y: halfD * 0.7, z: CRANK_BAY_Z }, O);
        const tcTopR = projectIso({ x: -halfL - 6, y: -halfD * 0.7, z: DECK_Z - 18 }, O);
        const tcBotR = projectIso({ x: -halfL - 6, y: -halfD * 0.7, z: CRANK_BAY_Z }, O);
        return (
          <g opacity={0.7}>
            <path
              d={`M ${tcTop.x} ${tcTop.y} L ${tcTopR.x} ${tcTopR.y} L ${tcBotR.x} ${tcBotR.y} L ${tcBot.x} ${tcBot.y} Z`}
              fill={fills.left} stroke="#0f172a" strokeWidth="1" opacity={0.75}
            />
            {/* Crank nose seal bore */}
            {(() => {
              const cnPt = projectIso({ x: -halfL - 7, y: 0, z: CRANK_BAY_Z + 16 }, O);
              return <circle cx={cnPt.x} cy={cnPt.y} r={7}
                fill="#020617" stroke="#1e293b" strokeWidth="0.6" />;
            })()}
            {/* Timing cover bolts */}
            {[0.2, 0.45, 0.7, 0.95].map((t, i) => {
              const boltY = -halfD * 0.7 + t * (halfD * 1.4);
              const bPt = projectIso({ x: -halfL - 7, y: boltY, z: DECK_Z - 28 }, O);
              return <circle key={`tc-bolt-${i}`} cx={bPt.x} cy={bPt.y} r={1.5}
                fill="#0f172a" stroke="#334155" strokeWidth="0.4" />;
            })}
          </g>
        );
      })()}
      {/* Bellhousing */}
      {(() => {
        const bhTop = projectIso({ x: halfL + 5, y: halfD * 0.75, z: CRANK_TOP_Z + 12 }, O);
        const bhBot = projectIso({ x: halfL + 5, y: halfD * 0.75, z: CRANK_BAY_Z - 5 }, O);
        const bhTopR = projectIso({ x: halfL + 5, y: -halfD * 0.75, z: CRANK_TOP_Z + 12 }, O);
        const bhBotR = projectIso({ x: halfL + 5, y: -halfD * 0.75, z: CRANK_BAY_Z - 5 }, O);
        return (
          <g opacity={0.65}>
            <path
              d={`M ${bhTop.x} ${bhTop.y} L ${bhTopR.x} ${bhTopR.y} L ${bhBotR.x} ${bhBotR.y} L ${bhBot.x} ${bhBot.y} Z`}
              fill={fills.right} stroke="#0f172a" strokeWidth="1"
            />
            {/* Flywheel bore */}
            {(() => {
              const fwPt = projectIso({ x: halfL + 6, y: 0, z: CRANK_BAY_Z + 22 }, O);
              return <circle cx={fwPt.x} cy={fwPt.y} r={12}
                fill="#020617" stroke="#1e293b" strokeWidth="0.8" />;
            })()}
            {/* Bellhousing bolt circle */}
            {[0, 60, 120, 180, 240, 300].map((ang, i) => {
              const rad = (ang * Math.PI) / 180;
              const bPt = projectIso({
                x: halfL + 6,
                y: 16 * Math.cos(rad) * 0.5,
                z: CRANK_BAY_Z + 22 + 16 * Math.sin(rad) * 0.5,
              }, O);
              return <circle key={`bh-bolt-${i}`} cx={bPt.x} cy={bPt.y} r={1.6}
                fill="#0f172a" stroke="#334155" strokeWidth="0.4" />;
            })}
          </g>
        );
      })()}

      {/* ═══ LAYER 9 — TOP DECK, HEAD BOLTS & RIBS ═══ */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y} L ${tBL.x} ${tBL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="1.5"
      />
      {/* Outer bolt row */}
      {outerBolts.map((bolt, i) => (
        <g key={`outer-bolt-${i}`}>
          <ellipse cx={bolt.ellipse.cx} cy={bolt.ellipse.cy}
            rx={bolt.ellipse.rx} ry={bolt.ellipse.ry}
            fill={fills.top} stroke="#64748b" strokeWidth="0.8" opacity={0.8} />
          <ellipse cx={bolt.ellipse.cx} cy={bolt.ellipse.cy}
            rx={bolt.ellipse.rx * 0.5} ry={bolt.ellipse.ry * 0.5}
            fill="#0f172a" stroke="#334155" strokeWidth="0.4" />
        </g>
      ))}
      {/* Inner bolt row */}
      {innerBolts.map((bolt, i) => (
        <g key={`inner-bolt-${i}`}>
          <ellipse cx={bolt.ellipse.cx} cy={bolt.ellipse.cy}
            rx={bolt.ellipse.rx} ry={bolt.ellipse.ry}
            fill={fills.top} stroke="#64748b" strokeWidth="0.7" opacity={0.7} />
          <ellipse cx={bolt.ellipse.cx} cy={bolt.ellipse.cy}
            rx={bolt.ellipse.rx * 0.5} ry={bolt.ellipse.ry * 0.5}
            fill="#0f172a" stroke="#334155" strokeWidth="0.4" />
        </g>
      ))}
      {/* Vertical ribs — 2 ribs between 3 bores */}
      {[0.33, 0.67].map((t, i) => {
        const ribX = -halfL + t * BL;
        const rib = getIsoRibTrapezoid(
          { x: ribX, y: halfD + 3, z: DECK_Z - 18 },
          { x: ribX, y: halfD + 3, z: CRANK_TOP_Z + 5 },
          6, 4, O
        );
        return (
          <g key={`v-rib-${i}`} opacity={0.55}>
            <path d={rib.frontFace} fill={fills.left} stroke="#1e293b" strokeWidth="0.6" />
            <path d={rib.leftFace} fill={fills.right} stroke="#0f172a" strokeWidth="0.5" />
            <path d={rib.topCap} fill={fills.top} stroke="#1e293b" strokeWidth="0.5" />
          </g>
        );
      })}
      {/* Motor mount */}
      {(() => {
        const mmPt = projectIso({ x: -5, y: -halfD - 5, z: CRANK_TOP_Z + 18 }, O);
        return (
          <g>
            <rect x={mmPt.x - 10} y={mmPt.y - 5} width={20} height={10} rx={2}
              fill={fills.right} stroke="#1e293b" strokeWidth="0.8" opacity={0.6} />
            <circle cx={mmPt.x - 5} cy={mmPt.y} r={2.2}
              fill="#020617" stroke="#334155" strokeWidth="0.5" />
            <circle cx={mmPt.x + 5} cy={mmPt.y} r={2.2}
              fill="#020617" stroke="#334155" strokeWidth="0.5" />
          </g>
        );
      })()}

      {/* ═══ LAYER 10 — OIL GALLERY PLUGS & SURFACE DETAIL ═══ */}
      {/* Oil gallery plugs — 2 on front face */}
      {[0.35, 0.65].map((t, i) => {
        const plugX = -halfL + t * BL;
        const plugPt = projectIso({ x: plugX, y: halfD + 1, z: CRANK_TOP_Z - 8 }, O);
        return (
          <g key={`oil-plug-${i}`}>
            <circle cx={plugPt.x} cy={plugPt.y} r={3.2}
              fill={fills.left} stroke="#475569" strokeWidth="0.6" opacity={0.7} />
            <circle cx={plugPt.x} cy={plugPt.y} r={1.4} fill="#020617" opacity={0.8} />
          </g>
        );
      })}
      {/* Casting ID */}
      {(() => {
        const stampPt = projectIso({ x: -halfL + 15, y: halfD + 1.5, z: DECK_Z - 38 }, O);
        return (
          <g opacity={0.3}>
            <rect x={stampPt.x} y={stampPt.y} width={28} height={5} rx={1}
              fill="none" stroke="#64748b" strokeWidth="0.4" />
            {[0, 1].map((_, li) => (
              <line key={`stamp-line-${li}`}
                x1={stampPt.x + 3 + li * 12} y1={stampPt.y + 1.5}
                x2={stampPt.x + 11 + li * 12} y2={stampPt.y + 3.5}
                stroke="#64748b" strokeWidth="0.5" />
            ))}
          </g>
        );
      })()}
      {/* Knock sensor */}
      {(() => {
        const ksPt = projectIso({ x: boreXPositions[1], y: -halfD - 2, z: CRANK_TOP_Z + 4 }, O);
        return (
          <g>
            <circle cx={ksPt.x} cy={ksPt.y} r={3.8}
              fill={fills.right} stroke="#334155" strokeWidth="0.6" opacity={0.6} />
            <circle cx={ksPt.x} cy={ksPt.y} r={1.8}
              fill="#1e293b" stroke="#475569" strokeWidth="0.4" />
          </g>
        );
      })()}

      {/* ═══ LAYER 11 — SPECULAR HIGHLIGHTS & AO ═══ */}
      <path d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y}`}
        stroke="#e2e8f0" strokeWidth="1.2" opacity={0.5} strokeLinecap="round" />
      <path d={`M ${tFL.x} ${tFL.y} L ${tBL.x} ${tBL.y}`}
        stroke="#f8fafc" strokeWidth="0.8" opacity={0.35} strokeLinecap="round" />
      <path d={`M ${bFL.x} ${bFL.y} L ${tFL.x} ${tFL.y}`}
        stroke="#cbd5e1" strokeWidth="0.8" opacity={0.4} strokeLinecap="round" />
      <path d={`M ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y}`}
        stroke="#94a3b8" strokeWidth="0.6" opacity={0.3} strokeLinecap="round" />
      {/* AO */}
      <path d={`M ${tFL.x} ${tFL.y + 2} L ${tFR.x} ${tFR.y + 2}`}
        stroke="#020617" strokeWidth="2" opacity={0.35} strokeLinecap="round" />
      <path d={`M ${tFR.x + 1} ${tFR.y + 1} L ${tBR.x + 1} ${tBR.y + 1}`}
        stroke="#020617" strokeWidth="1.5" opacity={0.25} strokeLinecap="round" />
      <path d={`M ${sFL.x} ${sFL.y + 1} L ${sFR.x} ${sFR.y + 1}`}
        stroke="#000000" strokeWidth="1.5" opacity={0.4} strokeLinecap="round" />
      {/* Environment reflection */}
      {(() => {
        const refTop = projectIso({ x: -halfL + 5, y: halfD + 0.5, z: DECK_Z - 22 }, O);
        const refBot = projectIso({ x: halfL - 5, y: halfD + 0.5, z: DECK_Z - 32 }, O);
        return (
          <path d={`M ${refTop.x} ${refTop.y} L ${refBot.x} ${refBot.y}`}
            stroke="#f8fafc" strokeWidth="1.5" opacity={0.12} strokeLinecap="round" />
        );
      })()}

      {/* Active glow */}
      {blockState.isActive && (
        <rect x={O.x - 110} y={O.y - 105} width={220} height={195} rx={8}
          fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity={0.4}
          className="animate-pulse" />
      )}
      {/* Hover highlight */}
      {blockState.isHovered && !blockState.isActive && (
        <rect x={O.x - 110} y={O.y - 105} width={220} height={195} rx={8}
          fill="#38bdf8" opacity={0.06} />
      )}
    </g>
  );
};

const COS_30_CONST = Math.cos(Math.PI / 6);
