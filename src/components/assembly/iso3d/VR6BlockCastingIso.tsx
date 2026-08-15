import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import {
  projectIso,
  projectIsoEllipse,
  getIsoVRStaggeredBores,
  getIsoBearingWebs,
  getIsoRibTrapezoid,
  type ScreenPoint2D,
} from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface VR6BlockCastingIsoProps {
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
 * VR6 ENGINE BLOCK — 15° Narrow-Angle Staggered Single-Head Monoblock
 * ═══════════════════════════════════════════════════════════════════
 *
 * High-Performance 3.2L 15° Narrow-Angle VR6 Engine Block Casting
 * Inspired by: VW R32 / Audi TT 3.2 VR6 / Passat R36 3.6L FSI
 *
 * 11 SVG Layers (bottom-up Z-ordering):
 *  1. Ground shadow (compact elongated ground shadow)
 *  2. Lower crankcase skirt & 7 main bearing bulkheads
 *  3. Main block body casting (compact narrow-angle block body)
 *  4. Single unified cylinder head deck covering staggered bores
 *  5. 6 Staggered cylinder bores (15° included angle, front/rear offset)
 *  6. Bore honing cross-hatch & chamfered entry rims
 *  7. Cross-drilled cooling passages between staggered bores
 *  8. Single front timing chain case & transverse bellhousing flange
 *  9. Structural strengthening ribs & oil gallery webs
 * 10. Head bolt bosses (14 per deck) & oil gallery freeze plugs
 * 11. Specular edge highlights & ambient occlusion shadows
 */
export const VR6BlockCastingIso: React.FC<VR6BlockCastingIsoProps> = ({
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O: ScreenPoint2D = { x: 250, y: 215 };

  // ─── PRIMARY DIMENSIONS (mm) ───
  // VR6 is very compact for a 6-cylinder (only 170mm long vs I6's 224mm)
  const BL = 170;       // Block Length along X
  const halfL = BL / 2; // 85mm
  const BD = 92;        // Block Depth along Y (wide enough for 15° stagger)
  const halfD = BD / 2; // 46mm
  const BH = 152;       // Block Height along Z

  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  // ─── KEY Z-HEIGHTS ───
  const SKIRT_Z = -14;
  const PAN_RAIL_Z = 0;
  const CRANK_BAY_Z = 22;
  const CRANK_TOP_Z = 74;
  const WATER_JACKET_Z = 95;
  const DECK_Z = BH;

  // ─── 15° STAGGERED BORE GEOMETRY ───
  const NUM_CYLS = 6;
  const BORE_RADIUS = 20;     // ~80mm bore
  const BORE_SPACING_X = 28;  // Close bore spacing thanks to stagger
  const STAGGER_Y = 24;       // 15° narrow angle Y-offset between front/rear rows

  const staggeredBores = getIsoVRStaggeredBores(
    NUM_CYLS, BORE_SPACING_X, STAGGER_Y, BORE_RADIUS, DECK_Z, O
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

  // 7 Main bearing bulkheads
  const webs = getIsoBearingWebs(BL, 7, 7.5, BD * 0.6, 52, CRANK_BAY_Z, O);

  return (
    <g
      id="iso-block-vr6-casting"
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
      <ellipse cx={O.x} cy={O.y + 65} rx={128} ry={28}
        fill="url(#iso-ground-shadow)" opacity={0.75} />

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
      {/* 7 Main bearing saddles */}
      {webs.map((web, idx) => (
        <g key={`vr6-web-${idx}`}>
          <path d={web.facets.front} fill={fills.left} stroke="#0f172a" strokeWidth="0.8" opacity={0.85} />
          <path d={web.facets.right} fill={fills.right} stroke="#0f172a" strokeWidth="0.7" opacity={0.75} />
        </g>
      ))}

      {/* ═══ LAYER 3 — MAIN BLOCK BODY ═══ */}
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

      {/* ═══ LAYER 4 — SINGLE UNIFIED CYLINDER HEAD DECK ═══ */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y} L ${tBL.x} ${tBL.y} Z`}
        fill={fills.top} stroke="#0f172a" strokeWidth="1.5"
      />

      {/* ═══ LAYER 5 & 6 — 6 STAGGERED BORES & HONING ═══ */}
      {staggeredBores.map((bore, idx) => {
        const chamferE = projectIsoEllipse(bore.center3D, BORE_RADIUS + 2.8, O);
        const depthE = projectIsoEllipse({ ...bore.center3D, z: DECK_Z - 12 }, BORE_RADIUS - 1, O);
        return (
          <g key={`vr6-bore-${idx}`}>
            <ellipse cx={chamferE.cx} cy={chamferE.cy} rx={chamferE.rx} ry={chamferE.ry}
              fill="none" stroke="#64748b" strokeWidth="1.8" opacity={0.5} />
            <ellipse cx={bore.ellipse.cx} cy={bore.ellipse.cy} rx={bore.ellipse.rx} ry={bore.ellipse.ry}
              fill="#020617" stroke="#0f172a" strokeWidth="1.5" />
            <ellipse cx={depthE.cx} cy={depthE.cy + 3} rx={depthE.rx * 0.85} ry={depthE.ry * 0.85}
              fill="#000000" opacity={0.6} />
            {/* Honing */}
            {Array.from({ length: 3 }).map((_, h) => {
              const angle = (h * 60 - 30) * (Math.PI / 180);
              const len = BORE_RADIUS * COS_30_CONST * 0.65;
              return (
                <line key={`vr6-hone-${idx}-${h}`}
                  x1={bore.ellipse.cx - len * Math.cos(angle)}
                  y1={bore.ellipse.cy - len * Math.sin(angle) * 0.5}
                  x2={bore.ellipse.cx + len * Math.cos(angle)}
                  y2={bore.ellipse.cy + len * Math.sin(angle) * 0.5}
                  stroke="#94a3b8" strokeWidth="0.35" opacity={0.25} />
              );
            })}
          </g>
        );
      })}

      {/* ═══ LAYER 7 — COOLANT CROSSOVER PASSAGES ═══ */}
      {Array.from({ length: 5 }).map((_, i) => {
        const wx = -halfL + 25 + i * 28;
        const wPt = projectIso({ x: wx, y: halfD + 1, z: WATER_JACKET_Z }, O);
        return (
          <ellipse key={`vr6-water-${i}`} cx={wPt.x} cy={wPt.y} rx={4.5} ry={3}
            fill="#0c4a6e" stroke="#0369a1" strokeWidth="0.6" opacity={0.55} />
        );
      })}

      {/* ═══ LAYER 8 — TIMING CHAIN CASE & TRANSVERSE BELLHOUSING ═══ */}
      {(() => {
        const tcTop = projectIso({ x: -halfL - 6, y: halfD * 0.75, z: DECK_Z - 15 }, O);
        const tcBot = projectIso({ x: -halfL - 6, y: halfD * 0.75, z: CRANK_BAY_Z }, O);
        const tcTopR = projectIso({ x: -halfL - 6, y: -halfD * 0.75, z: DECK_Z - 15 }, O);
        const tcBotR = projectIso({ x: -halfL - 6, y: -halfD * 0.75, z: CRANK_BAY_Z }, O);
        return (
          <g opacity={0.75}>
            <path
              d={`M ${tcTop.x} ${tcTop.y} L ${tcTopR.x} ${tcTopR.y} L ${tcBotR.x} ${tcBotR.y} L ${tcBot.x} ${tcBot.y} Z`}
              fill={fills.left} stroke="#0f172a" strokeWidth="1"
            />
            {(() => {
              const crankN = projectIso({ x: -halfL - 7, y: 0, z: CRANK_BAY_Z + 16 }, O);
              return <circle cx={crankN.x} cy={crankN.y} r={7.5} fill="#020617" stroke="#334155" strokeWidth="0.6" />;
            })()}
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
          <g opacity={0.7}>
            <path
              d={`M ${bhTop.x} ${bhTop.y} L ${bhTopR.x} ${bhTopR.y} L ${bhBotR.x} ${bhBotR.y} L ${bhBot.x} ${bhBot.y} Z`}
              fill={fills.right} stroke="#0f172a" strokeWidth="1"
            />
            {(() => {
              const fw = projectIso({ x: halfL + 6, y: 0, z: CRANK_BAY_Z + 24 }, O);
              return <circle cx={fw.x} cy={fw.y} r={14} fill="#020617" stroke="#1e293b" strokeWidth="0.8" />;
            })()}
          </g>
        );
      })()}

      {/* ═══ LAYER 9 — STRUCTURAL RIBS ═══ */}
      {[-35, 0, 35].map((xPos, i) => {
        const rib = getIsoRibTrapezoid(
          { x: xPos, y: halfD + 3, z: DECK_Z - 18 },
          { x: xPos, y: halfD + 3, z: CRANK_TOP_Z + 5 },
          5.5, 3.5, O
        );
        return (
          <g key={`vr6-rib-${i}`} opacity={0.55}>
            <path d={rib.frontFace} fill={fills.left} stroke="#1e293b" strokeWidth="0.6" />
            <path d={rib.topCap} fill={fills.top} stroke="#1e293b" strokeWidth="0.5" />
          </g>
        );
      })}

      {/* ═══ LAYER 10 — HEAD BOLT BOSSES (14 Total) ═══ */}
      {[-65, -42, -18, 6, 30, 54, 75].map((xPos, i) => {
        const bTop = projectIso({ x: xPos, y: halfD - 6, z: DECK_Z }, O);
        const bBot = projectIso({ x: xPos, y: -halfD + 6, z: DECK_Z }, O);
        return (
          <g key={`vr6-bolt-${i}`}>
            <circle cx={bTop.x} cy={bTop.y} r={2.5} fill={fills.top} stroke="#64748b" strokeWidth="0.7" />
            <circle cx={bTop.x} cy={bTop.y} r={1.1} fill="#0f172a" />
            <circle cx={bBot.x} cy={bBot.y} r={2.5} fill={fills.top} stroke="#64748b" strokeWidth="0.7" />
            <circle cx={bBot.x} cy={bBot.y} r={1.1} fill="#0f172a" />
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
