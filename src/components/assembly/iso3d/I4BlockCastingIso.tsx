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

interface I4BlockCastingIsoProps {
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
 * INLINE-4 ENGINE BLOCK — CNC-Precision Cast Aluminium Crankcase
 * ═══════════════════════════════════════════════════════════════════
 *
 * High-Performance 2.0L Inline-4 Turbocharged Engine Block Casting
 * Inspired by: BMW B48, Toyota 2JZ-GTE base, Honda K20C1
 *
 * 11 SVG Layers (bottom-up Z-ordering):
 *  1. Ground shadow (soft radial blur beneath block)
 *  2. Lower crankcase skirt (oil pan rail, main cap saddles)
 *  3. Main block body casting (rectangular inline silhouette)
 *  4. Open crankcase bays (5 main bearing bulkheads, 4 crank windows)
 *  5. Cylinder bores (4 chamfered openings with honing cross-hatch)
 *  6. Water jacket passages (front/rear face coolant openings)
 *  7. Timing chain cover face & transmission bellhousing flange
 *  8. Head bolt bosses with recessed hex sockets (10 per deck)
 *  9. Structural strengthening ribs (vertical + diagonal gussets)
 * 10. Oil gallery plugs, casting parting lines & surface detail
 * 11. Specular edge highlights & ambient occlusion shadows
 *
 * Every surface renders with material-reactive shading (cast/forged/billet/titanium).
 */
export const I4BlockCastingIso: React.FC<I4BlockCastingIsoProps> = ({
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O: ScreenPoint2D = { x: 250, y: 215 };

  // ─── PRIMARY DIMENSIONS (mm) ───
  const BL = 175;       // Block Length along X (crankshaft centerline)
  const halfL = BL / 2;
  const BD = 95;        // Block Depth along Y (width across cylinders)
  const halfD = BD / 2;
  const BH = 155;       // Block Height along Z (skirt to deck)

  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  // ─── KEY Z-HEIGHTS ───
  const SKIRT_Z = -14;
  const PAN_RAIL_Z = 0;
  const CRANK_BAY_Z = 22;
  const CRANK_TOP_Z = 75;
  const WATER_JACKET_Z = 95;
  const DECK_Z = BH;

  // ─── BORE GEOMETRY ───
  const NUM_CYLS = 4;
  const BORE_RADIUS = 22;
  const BORE_SPACING = 36;
  const boreXPositions = Array.from({ length: NUM_CYLS }, (_, i) =>
    -((NUM_CYLS - 1) * BORE_SPACING) / 2 + i * BORE_SPACING
  );

  // ─── 3D CORNER POINTS ───
  const sFL = projectIso({ x: -halfL - 12, y: halfD + 10, z: SKIRT_Z }, O);
  const sFR = projectIso({ x: halfL + 12, y: halfD + 10, z: SKIRT_Z }, O);
  const sBL = projectIso({ x: -halfL - 12, y: -halfD - 10, z: SKIRT_Z }, O);
  const sBR = projectIso({ x: halfL + 12, y: -halfD - 10, z: SKIRT_Z }, O);

  const bFL = projectIso({ x: -halfL, y: halfD, z: PAN_RAIL_Z }, O);
  const bFR = projectIso({ x: halfL, y: halfD, z: PAN_RAIL_Z }, O);
  const bBR = projectIso({ x: halfL, y: -halfD, z: PAN_RAIL_Z }, O);
  const bBL = projectIso({ x: -halfL, y: -halfD, z: PAN_RAIL_Z }, O);

  const mFL = projectIso({ x: -halfL, y: halfD, z: CRANK_TOP_Z }, O);
  const mFR = projectIso({ x: halfL, y: halfD, z: CRANK_TOP_Z }, O);
  const mBR = projectIso({ x: halfL, y: -halfD, z: CRANK_TOP_Z }, O);

  const tFL = projectIso({ x: -halfL, y: halfD, z: DECK_Z }, O);
  const tFR = projectIso({ x: halfL, y: halfD, z: DECK_Z }, O);
  const tBL = projectIso({ x: -halfL, y: -halfD, z: DECK_Z }, O);
  const tBR = projectIso({ x: halfL, y: -halfD, z: DECK_Z }, O);

  // ─── MAIN BEARING WEBS ───
  const NUM_WEBS = 5;
  const webs = getIsoBearingWebs(BL, NUM_WEBS, 8, BD * 0.6, 55, CRANK_BAY_Z, O);

  // ─── HEAD BOLT BOSSES ───
  const outerBolts = getIsoBoltBossRow(
    { x: -halfL + 10, y: halfD - 8, z: DECK_Z },
    { x: halfL - 10, y: halfD - 8, z: DECK_Z },
    5, 5, O
  );
  const innerBolts = getIsoBoltBossRow(
    { x: -halfL + 10, y: -halfD + 8, z: DECK_Z },
    { x: halfL - 10, y: -halfD + 8, z: DECK_Z },
    5, 5, O
  );

  return (
    <g
      id="iso-block-i4-casting"
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
      <ellipse cx={O.x} cy={O.y + 65} rx={120} ry={28}
        fill="url(#iso-ground-shadow)" opacity={0.7} />

      {/* ═══ LAYER 2 — LOWER CRANKCASE SKIRT & PAN RAIL ═══ */}
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
      <path
        d={`M ${bFL.x} ${bFL.y} L ${bFR.x} ${bFR.y} L ${bBR.x} ${bBR.y} L ${bBL.x} ${bBL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="0.8" opacity={0.55}
      />
      {/* Pan rail bolt holes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const isLeftSide = i < 4;
        const xPos = -halfL + 15 + (isLeftSide ? i : i - 4) * ((BL - 30) / 3);
        const yPos = isLeftSide ? halfD + 6 : -halfD - 6;
        const pt = projectIso({ x: xPos, y: yPos, z: SKIRT_Z + 2 }, O);
        return (
          <circle key={`pan-bolt-${i}`} cx={pt.x} cy={pt.y} r={2.2}
            fill="#020617" stroke="#1e293b" strokeWidth="0.5" />
        );
      })}

      {/* ═══ LAYER 3 — MAIN BLOCK BODY CASTING ═══ */}
      <path
        d={`M ${bFL.x} ${bFL.y} L ${bFR.x} ${bFR.y} L ${tFR.x} ${tFR.y} L ${tFL.x} ${tFL.y} Z`}
        fill={fills.left} stroke="#090d16" strokeWidth="1.5"
      />
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
        const partZ = BH * 0.55;
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
          {/* Journal saddle arch */}
          {(() => {
            const saddle = projectIsoEllipse(
              { x: web.xCenter, y: 0, z: CRANK_BAY_Z + 15 }, 12, O
            );
            return (
              <>
                <ellipse cx={saddle.cx} cy={saddle.cy} rx={saddle.rx} ry={saddle.ry}
                  fill="#020617" stroke="#1e293b" strokeWidth="0.8" opacity={0.7} />
                <circle cx={saddle.cx - saddle.rx - 3} cy={saddle.cy} r={1.8}
                  fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
                <circle cx={saddle.cx + saddle.rx + 3} cy={saddle.cy} r={1.8}
                  fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
              </>
            );
          })()}
        </g>
      ))}
      {/* Crankcase bay windows */}
      {Array.from({ length: NUM_CYLS }).map((_, i) => {
        const bayX = webs[i].xCenter + (webs[i + 1].xCenter - webs[i].xCenter) / 2;
        const bayTop = projectIso({ x: bayX, y: halfD - 8, z: CRANK_TOP_Z - 5 }, O);
        const bayBot = projectIso({ x: bayX, y: halfD - 8, z: CRANK_BAY_Z + 5 }, O);
        return (
          <g key={`crank-bay-${i}`}>
            <rect x={bayTop.x - 7} y={bayTop.y} width={14}
              height={bayBot.y - bayTop.y} rx={3} ry={3}
              fill="#020617" stroke="#1e293b" strokeWidth="0.8" opacity={0.8} />
            <line x1={bayTop.x - 5} y1={bayTop.y + 3} x2={bayTop.x + 5}
              y2={bayBot.y - 3} stroke="#334155" strokeWidth="0.6" opacity={0.5} />
          </g>
        );
      })}

      {/* ═══ LAYER 5 — CYLINDER BORES (4 Chamfered + Honing) ═══ */}
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

      {/* ═══ LAYER 6 — WATER JACKET PASSAGES ═══ */}
      {Array.from({ length: 3 }).map((_, i) => {
        const wx = boreXPositions[i] + BORE_SPACING / 2;
        const wPt = projectIso({ x: wx, y: halfD + 1, z: WATER_JACKET_Z }, O);
        return (
          <g key={`water-jacket-${i}`}>
            <ellipse cx={wPt.x} cy={wPt.y} rx={5} ry={3.5}
              fill="#0c4a6e" stroke="#0369a1" strokeWidth="0.6" opacity={0.55} />
            <ellipse cx={wPt.x} cy={wPt.y + 0.5} rx={3.5} ry={2}
              fill="#082f49" opacity={0.7} />
          </g>
        );
      })}
      {/* Thermostat housing boss */}
      {(() => {
        const thPt = projectIso({ x: halfL + 2, y: -halfD * 0.3, z: WATER_JACKET_Z + 10 }, O);
        return (
          <g>
            <circle cx={thPt.x} cy={thPt.y} r={6}
              fill={fills.right} stroke="#1e293b" strokeWidth="0.8" opacity={0.65} />
            <circle cx={thPt.x} cy={thPt.y} r={3.5}
              fill="#0c4a6e" stroke="#0369a1" strokeWidth="0.5" opacity={0.6} />
          </g>
        );
      })()}

      {/* ═══ LAYER 7 — TIMING CHAIN COVER & BELLHOUSING ═══ */}
      {(() => {
        const tcTop = projectIso({ x: -halfL - 6, y: halfD * 0.7, z: DECK_Z - 20 }, O);
        const tcBot = projectIso({ x: -halfL - 6, y: halfD * 0.7, z: CRANK_BAY_Z }, O);
        const tcTopR = projectIso({ x: -halfL - 6, y: -halfD * 0.7, z: DECK_Z - 20 }, O);
        const tcBotR = projectIso({ x: -halfL - 6, y: -halfD * 0.7, z: CRANK_BAY_Z }, O);
        return (
          <g opacity={0.7}>
            <path
              d={`M ${tcTop.x} ${tcTop.y} L ${tcTopR.x} ${tcTopR.y} L ${tcBotR.x} ${tcBotR.y} L ${tcBot.x} ${tcBot.y} Z`}
              fill={fills.left} stroke="#0f172a" strokeWidth="1" opacity={0.75}
            />
            {(() => {
              const opPt = projectIso({ x: -halfL - 7, y: 0, z: CRANK_BAY_Z + 18 }, O);
              return <circle cx={opPt.x} cy={opPt.y} r={6}
                fill="#020617" stroke="#1e293b" strokeWidth="0.6" />;
            })()}
            {[0.15, 0.35, 0.55, 0.75, 0.95].map((t, i) => {
              const boltY = -halfD * 0.7 + t * (halfD * 1.4);
              const bPt = projectIso({ x: -halfL - 7, y: boltY, z: DECK_Z - 30 }, O);
              return <circle key={`tc-bolt-${i}`} cx={bPt.x} cy={bPt.y} r={1.5}
                fill="#0f172a" stroke="#334155" strokeWidth="0.4" />;
            })}
          </g>
        );
      })()}
      {/* Bellhousing */}
      {(() => {
        const bhTop = projectIso({ x: halfL + 5, y: halfD * 0.8, z: CRANK_TOP_Z + 15 }, O);
        const bhBot = projectIso({ x: halfL + 5, y: halfD * 0.8, z: CRANK_BAY_Z - 5 }, O);
        const bhTopR = projectIso({ x: halfL + 5, y: -halfD * 0.8, z: CRANK_TOP_Z + 15 }, O);
        const bhBotR = projectIso({ x: halfL + 5, y: -halfD * 0.8, z: CRANK_BAY_Z - 5 }, O);
        return (
          <g opacity={0.65}>
            <path
              d={`M ${bhTop.x} ${bhTop.y} L ${bhTopR.x} ${bhTopR.y} L ${bhBotR.x} ${bhBotR.y} L ${bhBot.x} ${bhBot.y} Z`}
              fill={fills.right} stroke="#0f172a" strokeWidth="1"
            />
            {(() => {
              const fwPt = projectIso({ x: halfL + 6, y: 0, z: CRANK_BAY_Z + 25 }, O);
              return <circle cx={fwPt.x} cy={fwPt.y} r={14}
                fill="#020617" stroke="#1e293b" strokeWidth="0.8" />;
            })()}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
              const rad = (ang * Math.PI) / 180;
              const bPt = projectIso({
                x: halfL + 6,
                y: 18 * Math.cos(rad) * 0.5,
                z: CRANK_BAY_Z + 25 + 18 * Math.sin(rad) * 0.5,
              }, O);
              return <circle key={`bh-bolt-${i}`} cx={bPt.x} cy={bPt.y} r={1.8}
                fill="#0f172a" stroke="#334155" strokeWidth="0.4" />;
            })}
          </g>
        );
      })()}

      {/* ═══ LAYER 8 — TOP DECK & HEAD BOLT BOSSES ═══ */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y} L ${tBL.x} ${tBL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="1.5"
      />
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

      {/* ═══ LAYER 9 — STRUCTURAL RIBS ═══ */}
      {[0.25, 0.5, 0.75].map((t, i) => {
        const ribX = -halfL + t * BL;
        const rib = getIsoRibTrapezoid(
          { x: ribX, y: halfD + 3, z: DECK_Z - 20 },
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
      {[0.33, 0.67].map((t, i) => {
        const ribX = -halfL + t * BL;
        const rib = getIsoRibTrapezoid(
          { x: ribX + 15, y: -halfD - 3, z: DECK_Z - 15 },
          { x: ribX - 10, y: -halfD - 3, z: CRANK_TOP_Z + 10 },
          5, 3, O
        );
        return (
          <g key={`d-rib-${i}`} opacity={0.45}>
            <path d={rib.frontFace} fill={fills.right} stroke="#0f172a" strokeWidth="0.5" />
            <path d={rib.topCap} fill={fills.top} stroke="#1e293b" strokeWidth="0.4" />
          </g>
        );
      })}
      {/* Motor mount boss */}
      {(() => {
        const mmPt = projectIso({ x: 0, y: -halfD - 5, z: CRANK_TOP_Z + 20 }, O);
        return (
          <g>
            <rect x={mmPt.x - 12} y={mmPt.y - 6} width={24} height={12} rx={2}
              fill={fills.right} stroke="#1e293b" strokeWidth="0.8" opacity={0.6} />
            <circle cx={mmPt.x - 6} cy={mmPt.y} r={2.5}
              fill="#020617" stroke="#334155" strokeWidth="0.5" />
            <circle cx={mmPt.x + 6} cy={mmPt.y} r={2.5}
              fill="#020617" stroke="#334155" strokeWidth="0.5" />
          </g>
        );
      })()}

      {/* ═══ LAYER 10 — OIL GALLERY PLUGS & SURFACE DETAIL ═══ */}
      {[0.3, 0.7].map((t, i) => {
        const plugX = -halfL + t * BL;
        const plugPt = projectIso({ x: plugX, y: halfD + 1, z: CRANK_TOP_Z - 10 }, O);
        return (
          <g key={`oil-plug-${i}`}>
            <circle cx={plugPt.x} cy={plugPt.y} r={3.5}
              fill={fills.left} stroke="#475569" strokeWidth="0.6" opacity={0.7} />
            <circle cx={plugPt.x} cy={plugPt.y} r={1.5} fill="#020617" opacity={0.8} />
          </g>
        );
      })}
      {/* Casting ID stamp */}
      {(() => {
        const stampPt = projectIso({ x: -halfL + 20, y: halfD + 1.5, z: DECK_Z - 40 }, O);
        return (
          <g opacity={0.3}>
            <rect x={stampPt.x} y={stampPt.y} width={35} height={6} rx={1}
              fill="none" stroke="#64748b" strokeWidth="0.4" />
            {[0, 1, 2].map((_, li) => (
              <line key={`stamp-line-${li}`}
                x1={stampPt.x + 3 + li * 11} y1={stampPt.y + 2}
                x2={stampPt.x + 10 + li * 11} y2={stampPt.y + 4}
                stroke="#64748b" strokeWidth="0.5" />
            ))}
          </g>
        );
      })()}
      {/* Knock sensor boss */}
      {(() => {
        const ksPt = projectIso({ x: boreXPositions[2], y: -halfD - 2, z: CRANK_TOP_Z + 5 }, O);
        return (
          <g>
            <circle cx={ksPt.x} cy={ksPt.y} r={4}
              fill={fills.right} stroke="#334155" strokeWidth="0.6" opacity={0.6} />
            <circle cx={ksPt.x} cy={ksPt.y} r={2}
              fill="#1e293b" stroke="#475569" strokeWidth="0.4" />
          </g>
        );
      })()}
      {/* Coolant drain plugs */}
      {[0.35, 0.65].map((t, i) => {
        const dpX = -halfL + t * BL;
        const dpPt = projectIso({ x: dpX, y: halfD + 2, z: PAN_RAIL_Z + 8 }, O);
        return (
          <circle key={`coolant-drain-${i}`} cx={dpPt.x} cy={dpPt.y} r={2.8}
            fill="#1e293b" stroke="#475569" strokeWidth="0.5" opacity={0.55} />
        );
      })}

      {/* ═══ LAYER 11 — SPECULAR HIGHLIGHTS & AO ═══ */}
      <path d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y}`}
        stroke="#e2e8f0" strokeWidth="1.2" opacity={0.5} strokeLinecap="round" />
      <path d={`M ${tFL.x} ${tFL.y} L ${tBL.x} ${tBL.y}`}
        stroke="#f8fafc" strokeWidth="0.8" opacity={0.35} strokeLinecap="round" />
      <path d={`M ${bFL.x} ${bFL.y} L ${tFL.x} ${tFL.y}`}
        stroke="#cbd5e1" strokeWidth="0.8" opacity={0.4} strokeLinecap="round" />
      <path d={`M ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y}`}
        stroke="#94a3b8" strokeWidth="0.6" opacity={0.3} strokeLinecap="round" />
      {/* AO under deck */}
      <path d={`M ${tFL.x} ${tFL.y + 2} L ${tFR.x} ${tFR.y + 2}`}
        stroke="#020617" strokeWidth="2" opacity={0.35} strokeLinecap="round" />
      <path d={`M ${tFR.x + 1} ${tFR.y + 1} L ${tBR.x + 1} ${tBR.y + 1}`}
        stroke="#020617" strokeWidth="1.5" opacity={0.25} strokeLinecap="round" />
      <path d={`M ${sFL.x} ${sFL.y + 1} L ${sFR.x} ${sFR.y + 1}`}
        stroke="#000000" strokeWidth="1.5" opacity={0.4} strokeLinecap="round" />
      {/* Environment reflection */}
      {(() => {
        const refTop = projectIso({ x: -halfL + 5, y: halfD + 0.5, z: DECK_Z - 25 }, O);
        const refBot = projectIso({ x: halfL - 5, y: halfD + 0.5, z: DECK_Z - 35 }, O);
        return (
          <path d={`M ${refTop.x} ${refTop.y} L ${refBot.x} ${refBot.y}`}
            stroke="#f8fafc" strokeWidth="1.5" opacity={0.12} strokeLinecap="round" />
        );
      })()}

      {/* Active glow */}
      {blockState.isActive && (
        <rect x={O.x - 125} y={O.y - 110} width={250} height={200} rx={8}
          fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity={0.4}
          className="animate-pulse" />
      )}
      {/* Hover highlight */}
      {blockState.isHovered && !blockState.isActive && (
        <rect x={O.x - 125} y={O.y - 110} width={250} height={200} rx={8}
          fill="#38bdf8" opacity={0.06} />
      )}
    </g>
  );
};

const COS_30_CONST = Math.cos(Math.PI / 6);
