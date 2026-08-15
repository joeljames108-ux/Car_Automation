import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, type ScreenPoint2D } from "../isoMath";

interface V12DrySumpTubesIsoProps {
  originScreen?: ScreenPoint2D;
  componentState?: {
    isInstalled: boolean;
    isActive: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * PHASE 4 — MULTI-STAGE EXTERNAL DRY-SUMP HARDLINE SCAVENGE TUBES
 * ═══════════════════════════════════════════════════════════════════
 *
 * 4-Stage Mirror-Polished Stainless Steel Hardline Scavenge Tube Array
 * with Anodized Motorsport -12AN Swivel Fittings matching the reference illustration.
 *
 * Mechanical Details:
 *  1. 4 Parallel Mandrel-Bent Polished Stainless Hardlines (Ø16mm OD)
 *  2. 90-Degree Compound Radius Bends Routed Along the Lower Crankcase Flank
 *  3. Billet Motorsport Dual-Color Anodized -12AN Fittings (Royal Blue / Crimson Red)
 *  4. Billet 6061-T6 Aluminum 4-Way Tube Separator Mounting Brackets & P-Clamps
 *  5. "DRY-SUMP" Technical Callout Badge with Mounting Stanchion
 */
export const V12DrySumpTubesIso: React.FC<V12DrySumpTubesIsoProps> = ({
  originScreen = { x: 250, y: 220 },
  componentState,
  onHoverComponent,
}) => {
  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen),
    [originScreen]
  );

  const blockLength = 236;
  const halfBL = blockLength / 2;

  // 4 Tubes Geometry
  const tubes = useMemo(() => {
    return [0, 1, 2, 3].map((tubeIdx) => {
      const yOffset = 46 + tubeIdx * 5.5; // Offset outward from block flank
      const zOffset = -18 + tubeIdx * 4.5; // Staggered height levels

      // Tube Start at Scavenge Pan Port
      const pStart = P(-halfBL + 28 + tubeIdx * 20, 36, -12);
      // First 90-deg drop
      const pBend1 = P(-halfBL + 28 + tubeIdx * 20, yOffset, zOffset);
      // Long Straight Run to Rear
      const pStraightEnd = P(halfBL - 35, yOffset, zOffset);
      // Final 90-deg bend to Dry Sump Pump / Tank Inlet
      const pEnd = P(halfBL - 15, 36, zOffset + 14);

      return {
        idx: tubeIdx,
        pStart,
        pBend1,
        pStraightEnd,
        pEnd,
      };
    });
  }, [P, halfBL]);

  // Support Clamp Brackets
  const clampBrackets = useMemo(() => {
    return [-halfBL + 65, 0, halfBL - 65].map((bx) => {
      const ptBot = P(bx, 46, -18);
      const ptTop = P(bx, 62, 0);
      return { ptBot, ptTop };
    });
  }, [P, halfBL]);

  // "DRY-SUMP" Badge Location
  const badgePt = useMemo(() => P(-halfBL + 85, 54, -6), [P, halfBL]);

  return (
    <g
      id="v12-dry-sump-tubes-3d"
      onMouseEnter={() => onHoverComponent?.("oil_pan")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState ? componentState.opacity : 1,
      }}
    >
      {/* ── 1. DEFINITIONS FOR HARDLINE TUBES & AN FITTINGS ── */}
      <defs>
        {/* Polished Stainless Steel Hardline Gradient */}
        <linearGradient id="v12-scavenge-tube-steel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="25%" stopColor="#e2e8f0" />
          <stop offset="60%" stopColor="#94a3b8" />
          <stop offset="85%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* -12AN Royal Blue Anodized Nut */}
        <linearGradient id="an-blue-fitting" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#0284c7" />
          <stop offset="80%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#082f49" />
        </linearGradient>

        {/* -12AN Crimson Red Anodized Socket */}
        <linearGradient id="an-red-fitting" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="40%" stopColor="#dc2626" />
          <stop offset="80%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
      </defs>

      {/* ── 2. 4-WAY BILLET SUPPORT CLAMP BRACKETS ── */}
      <g id="v12-hardline-clamps">
        {clampBrackets.map((cb, idx) => (
          <g key={`clamp-bracket-${idx}`}>
            <line
              x1={cb.ptBot.x}
              y1={cb.ptBot.y}
              x2={cb.ptTop.x}
              y2={cb.ptTop.y}
              stroke="#090d16"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <line
              x1={cb.ptBot.x}
              y1={cb.ptBot.y}
              x2={cb.ptTop.x}
              y2={cb.ptTop.y}
              stroke="#cbd5e1"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Clamp Fastener Bolt */}
            <circle cx={(cb.ptBot.x + cb.ptTop.x) / 2} cy={(cb.ptBot.y + cb.ptTop.y) / 2} r={1.6} fill="#090d16" stroke="#f8fafc" strokeWidth="0.6" />
          </g>
        ))}
      </g>

      {/* ── 3. 4 POLISHED STAINLESS STEEL SCAVENGE HARDLINES ── */}
      <g id="v12-scavenge-tubes-array">
        {tubes.map((t) => (
          <g key={`scavenge-tube-${t.idx}`}>
            {/* Tube Drop Shadow */}
            <path
              d={`M ${t.pStart.x} ${t.pStart.y + 4}
                  L ${t.pBend1.x} ${t.pBend1.y + 4}
                  L ${t.pStraightEnd.x} ${t.pStraightEnd.y + 4}
                  L ${t.pEnd.x} ${t.pEnd.y + 4}`}
              fill="none"
              stroke="#020617"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.65}
            />

            {/* Tube Polished Steel Outer Core */}
            <path
              d={`M ${t.pStart.x} ${t.pStart.y}
                  L ${t.pBend1.x} ${t.pBend1.y}
                  L ${t.pStraightEnd.x} ${t.pStraightEnd.y}
                  L ${t.pEnd.x} ${t.pEnd.y}`}
              fill="none"
              stroke="url(#v12-scavenge-tube-steel)"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Specular White Highlight Ridge */}
            <path
              d={`M ${t.pStart.x} ${t.pStart.y - 0.9}
                  L ${t.pBend1.x} ${t.pBend1.y - 0.9}
                  L ${t.pStraightEnd.x} ${t.pStraightEnd.y - 0.9}
                  L ${t.pEnd.x} ${t.pEnd.y - 0.9}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.88}
            />

            {/* Inlet -12AN Blue/Red Swivel Fitting */}
            <g id={`an-fitting-inlet-${t.idx}`}>
              <circle cx={t.pStart.x} cy={t.pStart.y} r={4.2} fill="url(#an-blue-fitting)" stroke="#090d16" strokeWidth="0.8" />
              <circle cx={t.pStart.x + 2} cy={t.pStart.y} r={3.0} fill="url(#an-red-fitting)" />
            </g>

            {/* Outlet -12AN Blue/Red Swivel Fitting */}
            <g id={`an-fitting-outlet-${t.idx}`}>
              <circle cx={t.pEnd.x} cy={t.pEnd.y} r={4.2} fill="url(#an-blue-fitting)" stroke="#090d16" strokeWidth="0.8" />
              <circle cx={t.pEnd.x - 2} cy={t.pEnd.y} r={3.0} fill="url(#an-red-fitting)" />
            </g>
          </g>
        ))}
      </g>

      {/* ── 4. "DRY-SUMP" TECHNICAL CALLOUT BADGE ── */}
      <g id="v12-dry-sump-badge-callout">
        {/* Support Stanchion Post */}
        <line
          x1={badgePt.x}
          y1={badgePt.y + 6}
          x2={badgePt.x}
          y2={badgePt.y + 14}
          stroke="#475569"
          strokeWidth="1.6"
        />
        {/* Badge Plaque Border */}
        <rect
          x={badgePt.x - 26}
          y={badgePt.y - 5}
          width={52}
          height={11}
          rx={2.5}
          fill="#090d16"
          stroke="#38bdf8"
          strokeWidth="0.9"
        />
        {/* Blue AN Port Accent Dot */}
        <circle cx={badgePt.x - 20} cy={badgePt.y + 0.5} r={2.0} fill="url(#an-blue-fitting)" />
        {/* Badge Text */}
        <text
          x={badgePt.x + 3}
          y={badgePt.y + 2.8}
          fill="#e0f2fe"
          fontSize="5.2"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
        >
          DRY-SUMP
        </text>
      </g>
    </g>
  );
};
