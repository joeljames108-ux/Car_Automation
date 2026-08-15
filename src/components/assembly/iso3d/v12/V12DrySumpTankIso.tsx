import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, type ScreenPoint2D } from "../isoMath";

interface V12DrySumpTankIsoProps {
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
 * PHASE 5 — INTEGRATED DRY-SUMP RESERVOIR TANK & INLINE OIL FILTER
 * ═══════════════════════════════════════════════════════════════════
 *
 * Racing-spec de-aerating dry-sump reservoir tank box with vertical
 * internal oil baffle plates and external inline spin-on filter unit.
 *
 * Mechanical Details:
 *  1. Sheet Aluminum Fabricated Dry Sump Reservoir Tank Box
 *  2. 6 Vertical Internal Oil Anti-Slosh Baffle Plates
 *  3. -16AN Scavenge Return Manifold & Breather Pressure Vent
 *  4. Billet Inline Spin-on High-Flow Microglass Oil Filter Canister
 *  5. Oil Level Dipstick Probe & Optical Sight Glass
 */
export const V12DrySumpTankIso: React.FC<V12DrySumpTankIsoProps> = ({
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

  // Tank 3D Geometry
  const tankXStart = -halfBL + 25;
  const tankXEnd = halfBL - 65;
  const tankWidth = 38;
  const tankHeight = 52;
  const tankBaseZ = 0;
  const tankYOffset = 42;

  const geometry = useMemo(() => {
    // Tank Top Rim Points
    const tFL = P(tankXStart, tankYOffset + tankWidth, tankBaseZ + tankHeight);
    const tFR = P(tankXEnd, tankYOffset + tankWidth, tankBaseZ + tankHeight);
    const tBL = P(tankXStart, tankYOffset, tankBaseZ + tankHeight);
    const tBR = P(tankXEnd, tankYOffset, tankBaseZ + tankHeight);

    // Tank Base Points
    const bFL = P(tankXStart, tankYOffset + tankWidth, tankBaseZ);
    const bFR = P(tankXEnd, tankYOffset + tankWidth, tankBaseZ);
    const bBL = P(tankXStart, tankYOffset, tankBaseZ);
    const bBR = P(tankXEnd, tankYOffset, tankBaseZ);

    // 6 Vertical Internal Baffle Plates
    const baffles: { topFront: ScreenPoint2D; botFront: ScreenPoint2D; topRear: ScreenPoint2D; botRear: ScreenPoint2D }[] = [];
    const numBaffles = 6;
    for (let i = 0; i < numBaffles; i++) {
      const bx = tankXStart + 16 + i * ((tankXEnd - tankXStart - 32) / (numBaffles - 1));
      baffles.push({
        topFront: P(bx, tankYOffset + tankWidth - 2, tankBaseZ + tankHeight - 4),
        botFront: P(bx, tankYOffset + tankWidth - 2, tankBaseZ + 6),
        topRear: P(bx, tankYOffset + 2, tankBaseZ + tankHeight - 4),
        botRear: P(bx, tankYOffset + 2, tankBaseZ + 6),
      });
    }

    // Inline Spin-On Filter Canister (Mounted at front corner)
    const filterCenter = P(tankXEnd + 14, tankYOffset + tankWidth / 2, tankBaseZ + tankHeight / 2);

    return {
      tFL, tFR, tBL, tBR,
      bFL, bFR, bBL, bBR,
      baffles,
      filterCenter,
    };
  }, [P, tankXStart, tankXEnd, tankWidth, tankHeight, tankBaseZ, tankYOffset]);

  return (
    <g
      id="v12-dry-sump-tank-3d"
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
      {/* ── 1. TANK SHADERS ── */}
      <defs>
        <linearGradient id="v12-tank-sheet-metal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#475569" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#334155" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.90" />
        </linearGradient>

        <linearGradient id="v12-oil-filter-canister" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="40%" stopColor="#1d4ed8" />
          <stop offset="80%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* ── 2. TANK OUTER CASING WALLS ── */}
      <g id="v12-tank-outer-walls">
        {/* Front Transparent/Cutaway Tank Wall */}
        <polygon
          points={`${geometry.bFL.x},${geometry.bFL.y} ${geometry.bFR.x},${geometry.bFR.y} ${geometry.tFR.x},${geometry.tFR.y} ${geometry.tFL.x},${geometry.tFL.y}`}
          fill="url(#v12-tank-sheet-metal)"
          stroke="#38bdf8"
          strokeWidth="1.6"
        />
        {/* Right End Wall */}
        <polygon
          points={`${geometry.bFR.x},${geometry.bFR.y} ${geometry.bBR.x},${geometry.bBR.y} ${geometry.tBR.x},${geometry.tBR.y} ${geometry.tFR.x},${geometry.tFR.y}`}
          fill="url(#v12-tank-sheet-metal)"
          stroke="#38bdf8"
          strokeWidth="1.6"
          opacity={0.9}
        />
        {/* Top Open Rim Flange */}
        <polygon
          points={`${geometry.tFL.x},${geometry.tFL.y} ${geometry.tFR.x},${geometry.tFR.y} ${geometry.tBR.x},${geometry.tBR.y} ${geometry.tBL.x},${geometry.tBL.y}`}
          fill="#090d16"
          stroke="#38bdf8"
          strokeWidth="1.8"
          opacity={0.8}
        />

        {/* Specular Front Lip Highlight */}
        <line
          x1={geometry.tFL.x}
          y1={geometry.tFL.y}
          x2={geometry.tFR.x}
          y2={geometry.tFR.y}
          stroke="#ffffff"
          strokeWidth="1.6"
          opacity={0.88}
        />
      </g>

      {/* ── 3. 6 VERTICAL INTERNAL ANTI-SLOSH BAFFLE PLATES ── */}
      <g id="v12-tank-internal-baffles">
        {geometry.baffles.map((b, idx) => (
          <g key={`tank-baffle-${idx}`}>
            {/* Baffle Plate Facet */}
            <polygon
              points={`${b.botFront.x},${b.botFront.y} ${b.botRear.x},${b.botRear.y} ${b.topRear.x},${b.topRear.y} ${b.topFront.x},${b.topFront.y}`}
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="1.0"
              opacity={0.8}
            />
            {/* Baffle Top Edge Highlight */}
            <line
              x1={b.topFront.x}
              y1={b.topFront.y}
              x2={b.topRear.x}
              y2={b.topRear.y}
              stroke="#cbd5e1"
              strokeWidth="1.2"
            />
          </g>
        ))}
      </g>

      {/* ── 4. INLINE SPIN-ON OIL FILTER CANISTER ── */}
      <g id="v12-inline-oil-filter">
        <ellipse cx={geometry.filterCenter.x} cy={geometry.filterCenter.y} rx={9.5} ry={14.0} fill="url(#v12-oil-filter-canister)" stroke="#090d16" strokeWidth="1.4" />
        <ellipse cx={geometry.filterCenter.x} cy={geometry.filterCenter.y - 7} rx={7.5} ry={4.5} fill="#1e40af" stroke="#60a5fa" strokeWidth="0.8" />
        {/* Filter Brand Logo Stripe */}
        <line
          x1={geometry.filterCenter.x - 7}
          y1={geometry.filterCenter.y}
          x2={geometry.filterCenter.x + 7}
          y2={geometry.filterCenter.y}
          stroke="#facc15"
          strokeWidth="2.0"
        />
      </g>
    </g>
  );
};
