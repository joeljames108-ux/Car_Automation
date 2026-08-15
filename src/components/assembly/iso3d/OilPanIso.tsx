import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface OilPanIsoProps {
  layoutSpec: {
    label: string;
    cyls: number[];
    width: number;
    bx: number;
    bw: number;
    bh: number;
  };
  componentState: {
    isInstalled: boolean;
    isActive: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  selectedVariants?: Record<string, string>;
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * Photorealistic 3D Isometric High-Performance Billet Aluminium Oil Pan & Dry-Sump Assembly (Optimized)
 */
const OilPanIsoComponent: React.FC<OilPanIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O = useMemo(() => ({ x: 250, y: 215 }), []);
  const materialGrade = selectedVariants?.oil_pan || "billet";
  const fills = useMemo(() => getIsoMaterialFills(materialGrade), [materialGrade]);

  const BL = 230; // Block length (-115 to +115)
  const halfL = BL / 2;

  // 3D Datum Heights
  const Z_RAIL = 20;     // Mating rail top
  const Z_MID = 0;       // Shallow front sump floor
  const Z_DEEP = -20;    // Deep rear sump reservoir floor

  // Narrow Y-shape matching crankcase rail (CRANK_Y_OUTER = 36)
  const Y_RAIL = 38;     // Top flange rail width
  const Y_SUMP = 32;     // Sump body width
  const X_STEP = 15;     // Transition point between shallow front and deep rear sump

  const P = (x: number, y: number, z: number) => projectIso({ x, y, z }, O);

  // ── 1. Top Flange Rail Corners (Z = Z_RAIL) ──
  const rFL = P(-halfL - 2, Y_RAIL, Z_RAIL);
  const rFR = P(halfL + 2, Y_RAIL, Z_RAIL);
  const rBL = P(-halfL - 2, -Y_RAIL, Z_RAIL);
  const rBR = P(halfL + 2, -Y_RAIL, Z_RAIL);

  // ── 2. Shallow Front Section Bottom Corners (X = X_STEP to halfL, Z = Z_MID) ──
  const sfFL = P(X_STEP, Y_SUMP, Z_MID);
  const sfFR = P(halfL + 2, Y_SUMP, Z_MID);
  const sfBL = P(X_STEP, -Y_SUMP, Z_MID);
  const sfBR = P(halfL + 2, -Y_SUMP, Z_MID);

  // ── 3. Deep Rear Sump Reservoir Bottom Corners (X = -halfL to X_STEP, Z = Z_DEEP) ──
  const drFL = P(-halfL - 2, Y_SUMP, Z_DEEP);
  const drFR = P(X_STEP, Y_SUMP, Z_DEEP);
  const drBL = P(-halfL - 2, -Y_SUMP, Z_DEEP);
  const drBR = P(X_STEP, -Y_SUMP, Z_DEEP);

  return (
    <g
      id="iso-oil-pan-v12-sump-assembly"
      onMouseEnter={() => onHoverComponent?.("oil_pan")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      <g id="v12-billet-oil-pan-3d">
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 1. VITON PERIMETER OIL PAN GASKET (Mating Layer at Z = 20)      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <polygon
          points={`${rFL.x},${rFL.y - 1} ${rFR.x},${rFR.y - 1} ${rBR.x},${rBR.y - 1} ${rBL.x},${rBL.y - 1}`}
          fill="#155e75"
          stroke="#06b6d4"
          strokeWidth="1.2"
          opacity="0.9"
        />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 2. HEAVY CNC MACHINED TOP FLANGE MOUNTING RAIL                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <polygon
          points={`${rFL.x},${rFL.y} ${rFR.x},${rFR.y} ${rBR.x},${rBR.y} ${rBL.x},${rBL.y}`}
          fill="url(#v12-machined-deck)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        {/* Specular Highlight along Top Rail Outer Edge */}
        <line x1={rFL.x} y1={rFL.y} x2={rFR.x} y2={rFR.y} stroke="#ffffff" strokeWidth="2" opacity="0.95" />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 3. STEPPED SUMP BODY CASTING FACES                             */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* Deep Rear Reservoir — Right Side Wall (Y = -Y_SUMP, visible in iso) */}
        <polygon
          points={`
            ${P(X_STEP, -Y_SUMP, Z_RAIL).x},${P(X_STEP, -Y_SUMP, Z_RAIL).y}
            ${P(-halfL, -Y_SUMP, Z_RAIL).x},${P(-halfL, -Y_SUMP, Z_RAIL).y}
            ${drBL.x},${drBL.y}
            ${drBR.x},${drBR.y}
          `}
          fill="url(#v12-crankcase-deep-right)"
          stroke="#090d16"
          strokeWidth="2"
        />

        {/* Shallow Front Section — Right Side Wall */}
        <polygon
          points={`
            ${P(halfL, -Y_SUMP, Z_RAIL).x},${P(halfL, -Y_SUMP, Z_RAIL).y}
            ${P(X_STEP, -Y_SUMP, Z_RAIL).x},${P(X_STEP, -Y_SUMP, Z_RAIL).y}
            ${sfBL.x},${sfBL.y}
            ${sfBR.x},${sfBR.y}
          `}
          fill="url(#v12-crankcase-deep-right)"
          stroke="#090d16"
          strokeWidth="2"
        />

        {/* Deep Rear Reservoir — Front Face (facing us at Y = +Y_SUMP) */}
        <polygon
          points={`
            ${P(-halfL, Y_SUMP, Z_RAIL).x},${P(-halfL, Y_SUMP, Z_RAIL).y}
            ${P(X_STEP, Y_SUMP, Z_RAIL).x},${P(X_STEP, Y_SUMP, Z_RAIL).y}
            ${drFR.x},${drFR.y}
            ${drFL.x},${drFL.y}
          `}
          fill="url(#v12-cast-aluminum-body)"
          stroke="#090d16"
          strokeWidth="2.2"
        />

        {/* Shallow Front Section — Front Face */}
        <polygon
          points={`
            ${P(X_STEP, Y_SUMP, Z_RAIL).x},${P(X_STEP, Y_SUMP, Z_RAIL).y}
            ${P(halfL, Y_SUMP, Z_RAIL).x},${P(halfL, Y_SUMP, Z_RAIL).y}
            ${sfFR.x},${sfFR.y}
            ${sfFL.x},${sfFL.y}
          `}
          fill="url(#v12-cast-aluminum-body)"
          stroke="#090d16"
          strokeWidth="2.2"
        />

        {/* Stepped Transition Wall (between shallow front floor & deep rear floor) */}
        <polygon
          points={`
            ${sfFL.x},${sfFL.y}
            ${sfBL.x},${sfBL.y}
            ${drBR.x},${drBR.y}
            ${drFR.x},${drFR.y}
          `}
          fill="url(#v12-crankcase-deep)"
          stroke="#090d16"
          strokeWidth="2"
        />

        {/* Deep Rear Reservoir Floor Plate */}
        <polygon
          points={`${drFL.x},${drFL.y} ${drFR.x},${drFR.y} ${drBR.x},${drBR.y} ${drBL.x},${drBL.y}`}
          fill="#0f172a"
          stroke="#090d16"
          strokeWidth="2.2"
        />

        {/* Shallow Front Floor Plate */}
        <polygon
          points={`${sfFL.x},${sfFL.y} ${sfFR.x},${sfFR.y} ${sfBR.x},${sfBR.y} ${sfBL.x},${sfBL.y}`}
          fill="#1e293b"
          stroke="#090d16"
          strokeWidth="2"
        />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 4. COOLING FINS & STRUCTURAL REINFORCEMENT RIBS                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* Longitudinal Heat Dissipation Fins on Deep Sump Bottom Floor */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const finY = -Y_SUMP + 12 + idx * 16;
          const finStart = P(-halfL, finY, Z_DEEP);
          const finEnd = P(X_STEP, finY, Z_DEEP);
          return (
            <g key={`sump-floor-fin-${idx}`}>
              <line
                x1={finStart.x} y1={finStart.y}
                x2={finEnd.x} y2={finEnd.y}
                stroke="#64748b"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.6"
              />
              <line
                x1={finStart.x} y1={finStart.y - 0.8}
                x2={finEnd.x} y2={finEnd.y - 0.8}
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.75"
              />
            </g>
          );
        })}

        {/* Vertical Cooling Fins on Front Sump Face */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const finX = -95 + idx * 26;
          const finTop = P(finX, Y_SUMP + 0.5, Z_RAIL - 4);
          const finBot = P(finX, Y_SUMP + 0.5, Z_DEEP + 4);
          return (
            <g key={`sump-fin-front-${idx}`}>
              <line
                x1={finTop.x} y1={finTop.y}
                x2={finBot.x} y2={finBot.y}
                stroke="#8b9ab5"
                strokeWidth="2.4"
                strokeLinecap="round"
                opacity="0.55"
              />
              <line
                x1={finTop.x - 0.6} y1={finTop.y}
                x2={finBot.x - 0.6} y2={finBot.y}
                stroke="#ffffff"
                strokeWidth="0.9"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          );
        })}

        {/* Diagonal Rib Gussets on Right Side Wall */}
        {Array.from({ length: 5 }).map((_, idx) => {
          const ribX = -90 + idx * 36;
          const rTop = P(ribX, -Y_SUMP - 0.5, Z_RAIL - 4);
          const rBot = P(ribX + 18, -Y_SUMP - 0.5, Z_DEEP + 6);
          return (
            <line
              key={`sump-rib-side-${idx}`}
              x1={rTop.x} y1={rTop.y}
              x2={rBot.x} y2={rBot.y}
              stroke="#536278"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.45"
            />
          );
        })}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 5. AN-12 BRAIDED OIL SCAVENGE LINE FITTINGS (Dry-Sump)          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {(() => {
          const fit1 = P(-60, Y_SUMP + 3, Z_DEEP + 10);
          const fit2 = P(-10, Y_SUMP + 3, Z_DEEP + 10);
          return (
            <g id="dry-sump-scavenge-fittings">
              {/* Fitting 1 */}
              <rect x={fit1.x - 5} y={fit1.y - 4} width="10" height="8" rx="2" fill="url(#anodized-blue)" stroke="#090d16" strokeWidth="1" />
              <rect x={fit1.x - 7} y={fit1.y - 2} width="4" height="4" rx="1" fill="url(#gold-hub)" stroke="#090d16" strokeWidth="0.7" />
              <circle cx={fit1.x} cy={fit1.y} r="2" fill="#020617" />

              {/* Fitting 2 */}
              <rect x={fit2.x - 5} y={fit2.y - 4} width="10" height="8" rx="2" fill="url(#anodized-blue)" stroke="#090d16" strokeWidth="1" />
              <rect x={fit2.x - 7} y={fit2.y - 2} width="4" height="4" rx="1" fill="url(#gold-hub)" stroke="#090d16" strokeWidth="0.7" />
              <circle cx={fit2.x} cy={fit2.y} r="2" fill="#020617" />
            </g>
          );
        })()}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 6. MAGNETIC OIL DRAIN PLUG ASSEMBLY                             */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {(() => {
          const drainPt = P(halfL - 25, -Y_SUMP - 1, Z_MID + 6);
          return (
            <g id="magnetic-oil-drain-plug">
              {/* Threaded Drain Boss */}
              <circle cx={drainPt.x} cy={drainPt.y} r="5.5" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="1.2" />
              {/* Gold Copper Crush Washer */}
              <circle cx={drainPt.x} cy={drainPt.y} r="4" fill="#b45309" stroke="#fef08a" strokeWidth="0.8" />
              {/* Hex Head Magnetic Drain Plug Bolt */}
              <circle cx={drainPt.x} cy={drainPt.y} r="2.8" fill="#020617" stroke="#cbd5e1" strokeWidth="0.9" />
              <circle cx={drainPt.x} cy={drainPt.y} r="1.2" fill="#38bdf8" />
            </g>
          );
        })()}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 7. LASER-ETCHED BILLET IDENTIFICATION BADGE                    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {(() => {
          const badgePt = P(-35, Y_SUMP + 2, Z_DEEP + 12);
          return (
            <g id="sump-badge-plate">
              <rect
                x={badgePt.x - 22} y={badgePt.y - 6}
                width={44} height={12}
                rx={2}
                fill="#0f172a"
                stroke="#cbd5e1"
                strokeWidth="1"
                opacity="0.9"
              />
              <rect
                x={badgePt.x - 19} y={badgePt.y - 4.5}
                width={38} height={9}
                rx={1}
                fill="#f8fafc"
                opacity="0.85"
              />
              <text
                x={badgePt.x}
                y={badgePt.y + 2.5}
                fill="#0284c7"
                fontSize="7"
                fontWeight="bold"
                letterSpacing="1.2"
                textAnchor="middle"
              >
                V12 DRY-SUMP
              </text>
            </g>
          );
        })()}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 8. PERIMETER MOUNTING BOLT PATTERN (24 Bolts along Top Rail)    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {Array.from({ length: 12 }).map((_, idx) => {
          const boltX = -100 + idx * 19;
          const bFront = P(boltX, Y_RAIL - 3, Z_RAIL);
          const bRight = P(boltX, -Y_RAIL + 3, Z_RAIL);
          return (
            <g key={`sump-pan-bolt-${idx}`}>
              <circle cx={bFront.x} cy={bFront.y} r="2.2" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.7" />
              <circle cx={bFront.x} cy={bFront.y} r="1" fill="#020617" />
              <circle cx={bRight.x} cy={bRight.y} r="2.2" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.7" />
              <circle cx={bRight.x} cy={bRight.y} r="1" fill="#020617" />
            </g>
          );
        })}
      </g>
    </g>
  );
};

export const OilPanIso = React.memo(OilPanIsoComponent);
