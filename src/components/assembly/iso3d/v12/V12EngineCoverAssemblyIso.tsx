import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12EngineCoverAssemblyIsoProps {
  originScreen?: ScreenPoint2D;
  componentState?: {
    isInstalled: boolean;
    isActive: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  selectedVariant?: string;
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * PHASE 22 — HYPERCAR DRY-CARBON MONOCOQUE ENGINE COVER
 * ═══════════════════════════════════════════════════════════════════
 *
 * Mode 2 Presentation Cover: Ultra-Lightweight Pre-Preg Dry Carbon Fiber
 * Monocoque Engine Cover with Gold-Anodized Bezel & Quartz ITB Windows.
 *
 * Mechanical Details:
 *  1. Full Autoclaved 2x2 Twill High-Gloss / Matte Dry Carbon Fiber Shroud
 *  2. CNC Billet 7075 Aluminum Gold Anodized Perimeter Raised Frame
 *  3. Transparent Scratch-Resistant Quartz Glass ITB Viewing Viewport
 *  4. 12 Cobalt-Blue ITB Velocity Stack Bells Visible Through Glass
 *  5. Front Dynamic Ram-Air Induction Scoop with Honeycomb Protective Mesh
 *  6. Center Hypercar Emblem Medallion: "V12 6.5L 48-VALVE QUAD-CAM"
 */
export const V12EngineCoverAssemblyIso: React.FC<V12EngineCoverAssemblyIsoProps> = ({
  originScreen = { x: 250, y: 220 },
  componentState,
  selectedVariant = "carbon",
  onHoverComponent,
}) => {
  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen),
    [originScreen]
  );

  const blockLength = 236;
  const halfBL = blockLength / 2;

  // Cover 3D Boundaries
  const coverZ = 158;
  const coverH = 30;
  const coverW = 86;
  const xS = -halfBL + 10;
  const xE = halfBL - 8;

  const geometry = useMemo(() => {
    // Top Carbon Main Plate
    const tFL = P(xS, coverW / 2, coverZ + coverH);
    const tFR = P(xE, coverW / 2, coverZ + coverH);
    const tBL = P(xS, -coverW / 2, coverZ + coverH);
    const tBR = P(xE, -coverW / 2, coverZ + coverH);

    // Bottom Base Flange
    const bFL = P(xS, coverW / 2, coverZ);
    const bFR = P(xE, coverW / 2, coverZ);
    const bBL = P(xS, -coverW / 2, coverZ);
    const bBR = P(xE, -coverW / 2, coverZ);

    // Gold Anodized Raised Frame Bezel
    const gfFL = P(xS + 20, coverW / 2 - 8, coverZ + coverH + 4);
    const gfFR = P(xE - 20, coverW / 2 - 8, coverZ + coverH + 4);
    const gfBL = P(xS + 20, -coverW / 2 + 8, coverZ + coverH + 4);
    const gfBR = P(xE - 20, -coverW / 2 + 8, coverZ + coverH + 4);

    // Transparent Quartz Glass Window
    const gwFL = P(xS + 24, coverW / 2 - 12, coverZ + coverH + 4.5);
    const gwFR = P(xE - 24, coverW / 2 - 12, coverZ + coverH + 4.5);
    const gwBL = P(xS + 24, -coverW / 2 + 12, coverZ + coverH + 4.5);
    const gwBR = P(xE - 24, -coverW / 2 + 12, coverZ + coverH + 4.5);

    // Front Ram-Air Induction Scoop
    const raFL = P(xS - 20, 30, coverZ + coverH + 6);
    const raFR = P(xS + 10, 30, coverZ + coverH + 6);
    const raBL = P(xS - 20, -8, coverZ + coverH + 6);
    const raBR = P(xS + 10, -8, coverZ + coverH + 6);

    const centerMedallion = P(0, 0, coverZ + coverH + 5.5);

    // 12 Velocity Stack Inspection Portholes (6 per bank)
    const portholes: { left: ScreenPoint2D; right: ScreenPoint2D }[] = [];
    const numPortholes = 6;
    for (let idx = 0; idx < numPortholes; idx++) {
      const px = xS + 34 + idx * ((xE - xS - 68) / (numPortholes - 1));
      portholes.push({
        left: P(px, 16, coverZ + coverH + 4.8),
        right: P(px, -16, coverZ + coverH + 4.8),
      });
    }

    return {
      tFL, tFR, tBL, tBR,
      bFL, bFR, bBL, bBR,
      gfFL, gfFR, gfBL, gfBR,
      gwFL, gwFR, gwBL, gwBR,
      raFL, raFR, raBL, raBR,
      centerMedallion,
      portholes,
    };
  }, [P, xS, xE, coverW, coverZ, coverH]);

  return (
    <g
      id="v12-hypercar-engine-cover-assembly"
      onMouseEnter={() => onHoverComponent?.("engine_cover")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState ? componentState.opacity : 1,
      }}
    >
      {/* ── 1. AMBIENT SHADOW ── */}
      <ellipse cx={originScreen.x} cy={originScreen.y + 16} rx={BL_SCALE_SHADOW(blockLength)} ry={32} fill="#000000" opacity={0.7} />

      {/* ── 2. BASE CARBON SHROUD FLANGES ── */}
      <polygon
        points={`${geometry.bFL.x},${geometry.bFL.y} ${geometry.bFR.x},${geometry.bFR.y} ${geometry.tFR.x},${geometry.tFR.y} ${geometry.tFL.x},${geometry.tFL.y}`}
        fill="url(#carbon-twill)"
        stroke="#090d16"
        strokeWidth="2.2"
      />
      <polygon
        points={`${geometry.bFR.x},${geometry.bFR.y} ${geometry.bBR.x},${geometry.bBR.y} ${geometry.tBR.x},${geometry.tBR.y} ${geometry.tFR.x},${geometry.tFR.y}`}
        fill="url(#carbon-twill)"
        stroke="#090d16"
        strokeWidth="2.2"
        opacity={0.85}
      />

      {/* ── 3. TOP CARBON MAIN DECK ── */}
      <polygon
        points={`${geometry.tFL.x},${geometry.tFL.y} ${geometry.tFR.x},${geometry.tFR.y} ${geometry.tBR.x},${geometry.tBR.y} ${geometry.tBL.x},${geometry.tBL.y}`}
        fill="url(#carbon-twill)"
        stroke="#090d16"
        strokeWidth="2.4"
      />

      {/* Specular Front Edge Highlight Beam */}
      <line
        x1={geometry.tFL.x}
        y1={geometry.tFL.y}
        x2={geometry.tFR.x}
        y2={geometry.tFR.y}
        stroke="#ffffff"
        strokeWidth="2.0"
        opacity={0.92}
      />

      {/* ── 4. GOLD ANODIZED BEZEL FRAME ── */}
      <polygon
        points={`${geometry.gfFL.x},${geometry.gfFL.y} ${geometry.gfFR.x},${geometry.gfFR.y} ${geometry.gfBR.x},${geometry.gfBR.y} ${geometry.gfBL.x},${geometry.gfBL.y}`}
        fill="url(#gold-anodized)"
        stroke="#090d16"
        strokeWidth="1.8"
      />
      <line
        x1={geometry.gfFL.x}
        y1={geometry.gfFL.y}
        x2={geometry.gfFR.x}
        y2={geometry.gfFR.y}
        stroke="#ffffff"
        strokeWidth="1.4"
        opacity={0.9}
      />

      {/* ── 5. TRANSPARENT QUARTZ GLASS VIEWING WINDOW ── */}
      <polygon
        points={`${geometry.gwFL.x},${geometry.gwFL.y} ${geometry.gwFR.x},${geometry.gwFR.y} ${geometry.gwBR.x},${geometry.gwBR.y} ${geometry.gwBL.x},${geometry.gwBL.y}`}
        fill="url(#glass-tint)"
        stroke="#38bdf8"
        strokeWidth="1.2"
        opacity={0.92}
      />

      {/* Specular Reflection Streaks */}
      <path
        d={`M ${geometry.gwFL.x + 12} ${geometry.gwFL.y}
            L ${geometry.gwFR.x - 45} ${geometry.gwFR.y - 16}
            L ${geometry.gwFR.x - 25} ${geometry.gwFR.y - 16}
            L ${geometry.gwFL.x + 32} ${geometry.gwFL.y}
            Z`}
        fill="#ffffff"
        opacity={0.26}
      />

      {/* ── 6. 12 VELOCITY STACKS VISIBLE THROUGH QUARTZ GLASS ── */}
      {geometry.portholes.map((p, idx) => (
        <g key={`v12-cover-porthole-${idx}`}>
          {/* Left Bank Trumpet */}
          <ellipse cx={p.left.x} cy={p.left.y} rx={7.0} ry={4.0} fill="#020617" stroke="url(#v12-stack-cobalt-blue)" strokeWidth="1.4" />
          <circle cx={p.left.x} cy={p.left.y} r={2.0} fill="#38bdf8" opacity={0.8} />

          {/* Right Bank Trumpet */}
          <ellipse cx={p.right.x} cy={p.right.y} rx={7.0} ry={4.0} fill="#020617" stroke="url(#v12-stack-cobalt-blue)" strokeWidth="1.4" />
          <circle cx={p.right.x} cy={p.right.y} r={2.0} fill="#38bdf8" opacity={0.8} />
        </g>
      ))}

      {/* ── 7. FRONT AERODYNAMIC RAM-AIR SCOOP ── */}
      <polygon
        points={`${geometry.raFL.x},${geometry.raFL.y} ${geometry.raFR.x},${geometry.raFR.y} ${geometry.raBR.x},${geometry.raBR.y} ${geometry.raBL.x},${geometry.raBL.y}`}
        fill="url(#carbon-twill)"
        stroke="#090d16"
        strokeWidth="2.0"
      />
      <circle cx={geometry.raFL.x + 14} cy={geometry.raFL.y - 6} r={9.5} fill="#020617" stroke="#38bdf8" strokeWidth="1.4" />

      {/* ── 8. CENTER HYPERCAR MEDALLION BADGE ── */}
      <g id="v12-center-cover-medallion">
        <circle cx={geometry.centerMedallion.x} cy={geometry.centerMedallion.y} r={12} fill="url(#gold-anodized)" stroke="#090d16" strokeWidth="2.0" />
        <circle cx={geometry.centerMedallion.x} cy={geometry.centerMedallion.y} r={9.5} fill="#0f172a" stroke="#78350f" strokeWidth="0.8" />
        <circle cx={geometry.centerMedallion.x} cy={geometry.centerMedallion.y} r={4.0} fill="#38bdf8" />
        <text
          x={geometry.centerMedallion.x}
          y={geometry.centerMedallion.y + 18}
          fill="#facc15"
          fontSize="4.5"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
        >
          V12·6.5L·48-VALVE·QUAD-CAM
        </text>
      </g>
    </g>
  );
};

function BL_SCALE_SHADOW(len: number) {
  return len * 0.54;
}
