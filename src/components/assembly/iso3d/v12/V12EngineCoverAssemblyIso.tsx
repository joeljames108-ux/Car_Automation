import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12EngineCoverAssemblyIsoProps {
  originScreen?: ScreenPoint2D;
  explodedAmount?: number;
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
 * Monocoque Engine Cover with sculpted aerodynamic shoulder pontoons,
 * radiused CNC gold bezel, and transparent quartz ITB viewports.
 */
export const V12EngineCoverAssemblyIso: React.FC<V12EngineCoverAssemblyIsoProps> = ({
  originScreen = { x: 290, y: 245 },
  explodedAmount = 0,
  componentState,
  selectedVariant = "carbon",
  onHoverComponent,
}) => {
  const expZ = explodedAmount * 55; // Floats +55mm on Z in exploded view

  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y, z: z + expZ }, originScreen),
    [originScreen, expZ]
  );

  const blockLength = 236;
  const halfBL = blockLength / 2;

  // Cover 3D Boundaries
  const coverZ = 158;
  const coverH = 32;
  const coverW = 88;
  const xS = -halfBL + 10;
  const xE = halfBL - 8;

  const geometry = useMemo(() => {
    // Top Carbon Main Plate
    const tFL = P(xS, coverW / 2, coverZ + coverH);
    const tFR = P(xE, coverW / 2, coverZ + coverH);
    const tBL = P(xS, -coverW / 2, coverZ + coverH);
    const tBR = P(xE, -coverW / 2, coverZ + coverH);

    // Arched Pontoon Crown Control Points (Curves gracefully over valve covers)
    const pontoonFL = P(xS, coverW / 2 + 10, coverZ + coverH * 0.7);
    const pontoonFR = P(xE, coverW / 2 + 10, coverZ + coverH * 0.7);
    const pontoonBL = P(xS, -coverW / 2 - 10, coverZ + coverH * 0.7);
    const pontoonBR = P(xE, -coverW / 2 - 10, coverZ + coverH * 0.7);

    // Bottom Base Flange
    const bFL = P(xS, coverW / 2, coverZ);
    const bFR = P(xE, coverW / 2, coverZ);
    const bBL = P(xS, -coverW / 2, coverZ);
    const bBR = P(xE, -coverW / 2, coverZ);

    // Gold Anodized Raised Frame Bezel (Radiused filleted corners)
    const gfFL = P(xS + 20, coverW / 2 - 8, coverZ + coverH + 4);
    const gfFR = P(xE - 20, coverW / 2 - 8, coverZ + coverH + 4);
    const gfBL = P(xS + 20, -coverW / 2 + 8, coverZ + coverH + 4);
    const gfBR = P(xE - 20, -coverW / 2 + 8, coverZ + coverH + 4);

    // Transparent Quartz Glass Window
    const gwFL = P(xS + 24, coverW / 2 - 12, coverZ + coverH + 4.5);
    const gwFR = P(xE - 24, coverW / 2 - 12, coverZ + coverH + 4.5);
    const gwBL = P(xS + 24, -coverW / 2 + 12, coverZ + coverH + 4.5);
    const gwBR = P(xE - 24, -coverW / 2 + 12, coverZ + coverH + 4.5);

    // Front Aerodynamic Teardrop Ram-Air Scoop
    const raNose = P(xS - 26, 0, coverZ + coverH + 7);
    const raFL = P(xS - 14, 28, coverZ + coverH + 6);
    const raFR = P(xS + 14, 24, coverZ + coverH + 6);
    const raBL = P(xS - 14, -28, coverZ + coverH + 6);
    const raBR = P(xS + 14, -24, coverZ + coverH + 6);

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
      pontoonFL, pontoonFR, pontoonBL, pontoonBR,
      bFL, bFR, bBL, bBR,
      gfFL, gfFR, gfBL, gfBR,
      gwFL, gwFR, gwBL, gwBR,
      raNose, raFL, raFR, raBL, raBR,
      centerMedallion,
      portholes,
    };
  }, [P, xS, xE, coverW, coverZ, coverH]);

  const isInstalled = componentState ? componentState.isInstalled : true;
  const opacity = componentState ? componentState.opacity : 1;

  if (!isInstalled && opacity === 0) return null;

  return (
    <g
      id="v12-hypercar-engine-cover-assembly"
      onMouseEnter={() => onHoverComponent?.("engine_cover")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-500 ease-out"
      style={{
        opacity,
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
      }}
    >
      <defs>
        {/* 2x2 Twill High-Gloss Dry Carbon Pattern */}
        <pattern id="v12-carbon-twill" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3" height="3" fill="#0f172a" />
          <rect x="3" width="3" height="3" fill="#1e293b" />
          <rect y="3" width="3" height="3" fill="#334155" />
          <rect x="3" y="3" width="3" height="3" fill="#090d16" />
        </pattern>

        {/* Carbon Monocoque Curved Surface Gradient */}
        <linearGradient id="v12-carbon-gloss-hull" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="35%" stopColor="#1e293b" />
          <stop offset="70%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* CNC Billet Gold Bezel Frame */}
        <linearGradient id="v12-bezel-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#f59e0b" />
          <stop offset="65%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        {/* Quartz Glass Window Reflection */}
        <linearGradient id="v12-quartz-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.30" />
          <stop offset="70%" stopColor="#0284c7" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.40" />
        </linearGradient>
      </defs>

      {/* ── 1. SCULPTED CARBON MONOCOQUE SHOULDER PONTOONS (Curved Shell) ── */}
      <path
        d={`M ${geometry.bFL.x} ${geometry.bFL.y}
            C ${geometry.pontoonFL.x} ${geometry.pontoonFL.y}, ${geometry.pontoonFR.x} ${geometry.pontoonFR.y}, ${geometry.tFR.x} ${geometry.tFR.y}
            L ${geometry.tFL.x} ${geometry.tFL.y}
            Z`}
        fill="url(#v12-carbon-gloss-hull)"
        stroke="#090d16"
        strokeWidth="2.0"
      />
      <path
        d={`M ${geometry.bFL.x} ${geometry.bFL.y}
            C ${geometry.pontoonFL.x} ${geometry.pontoonFL.y}, ${geometry.pontoonFR.x} ${geometry.pontoonFR.y}, ${geometry.tFR.x} ${geometry.tFR.y}
            L ${geometry.tFL.x} ${geometry.tFL.y}
            Z`}
        fill="url(#v12-carbon-twill)"
        opacity="0.55"
      />

      {/* ── 2. TOP CARBON DECK WITH RADIUSED CORNERS ── */}
      <path
        d={`M ${geometry.tFL.x} ${geometry.tFL.y}
            C ${geometry.tFL.x + 8} ${geometry.tFL.y - 4}, ${geometry.tFR.x - 8} ${geometry.tFR.y - 4}, ${geometry.tFR.x} ${geometry.tFR.y}
            L ${geometry.tBR.x} ${geometry.tBR.y}
            C ${geometry.tBR.x - 8} ${geometry.tBR.y + 4}, ${geometry.tBL.x + 8} ${geometry.tBL.y + 4}, ${geometry.tBL.x} ${geometry.tBL.y}
            Z`}
        fill="url(#v12-carbon-gloss-hull)"
        stroke="#090d16"
        strokeWidth="2.2"
      />
      <path
        d={`M ${geometry.tFL.x} ${geometry.tFL.y}
            C ${geometry.tFL.x + 8} ${geometry.tFL.y - 4}, ${geometry.tFR.x - 8} ${geometry.tFR.y - 4}, ${geometry.tFR.x} ${geometry.tFR.y}
            L ${geometry.tBR.x} ${geometry.tBR.y}
            C ${geometry.tBR.x - 8} ${geometry.tBR.y + 4}, ${geometry.tBL.x + 8} ${geometry.tBL.y + 4}, ${geometry.tBL.x} ${geometry.tBL.y}
            Z`}
        fill="url(#v12-carbon-twill)"
        opacity="0.45"
      />

      {/* ── 3. GOLD ANODIZED RAISED BEZEL FRAME (Filleted Perimeter) ── */}
      <path
        d={`M ${geometry.gfFL.x} ${geometry.gfFL.y}
            Q ${geometry.gfFL.x + (geometry.gfFR.x - geometry.gfFL.x) * 0.5} ${geometry.gfFL.y - 3} ${geometry.gfFR.x} ${geometry.gfFR.y}
            L ${geometry.gfBR.x} ${geometry.gfBR.y}
            Q ${geometry.gfBR.x + (geometry.gfBL.x - geometry.gfBR.x) * 0.5} ${geometry.gfBR.y + 3} ${geometry.gfBL.x} ${geometry.gfBL.y}
            Z`}
        fill="none"
        stroke="url(#v12-bezel-gold)"
        strokeWidth="3.2"
      />
      <path
        d={`M ${geometry.gfFL.x} ${geometry.gfFL.y}
            Q ${geometry.gfFL.x + (geometry.gfFR.x - geometry.gfFL.x) * 0.5} ${geometry.gfFL.y - 3} ${geometry.gfFR.x} ${geometry.gfFR.y}
            L ${geometry.gfBR.x} ${geometry.gfBR.y}
            Q ${geometry.gfBR.x + (geometry.gfBL.x - geometry.gfBR.x) * 0.5} ${geometry.gfBR.y + 3} ${geometry.gfBL.x} ${geometry.gfBL.y}
            Z`}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.0"
        opacity="0.9"
      />

      {/* ── 4. TRANSPARENT QUARTZ GLASS ITB VIEWPORT ── */}
      <path
        d={`M ${geometry.gwFL.x} ${geometry.gwFL.y}
            L ${geometry.gwFR.x} ${geometry.gwFR.y}
            L ${geometry.gwBR.x} ${geometry.gwBR.y}
            L ${geometry.gwBL.x} ${geometry.gwBL.y}
            Z`}
        fill="url(#v12-quartz-glass)"
        stroke="#38bdf8"
        strokeWidth="1.2"
      />

      {/* Diagonal Glass Specular Sheen Streaks */}
      <line
        x1={geometry.gwFL.x + 12}
        y1={geometry.gwFL.y + 8}
        x2={geometry.gwFR.x - 30}
        y2={geometry.gwFR.y + 14}
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* ── 5. 12 VELOCITY STACK PORTHOLES UNDER GLASS ── */}
      {geometry.portholes.map((p, idx) => (
        <g key={`porthole-${idx}`}>
          {/* Left Stack Ring */}
          <circle cx={p.left.x} cy={p.left.y} r={7.5} fill="#0284c7" fillOpacity="0.45" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx={p.left.x} cy={p.left.y} r={4.5} fill="#0f172a" stroke="#ca8a04" strokeWidth="0.8" />
          {/* Right Stack Ring */}
          <circle cx={p.right.x} cy={p.right.y} r={7.5} fill="#0284c7" fillOpacity="0.45" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx={p.right.x} cy={p.right.y} r={4.5} fill="#0f172a" stroke="#ca8a04" strokeWidth="0.8" />
        </g>
      ))}

      {/* ── 6. FRONT TEARDROP RAM-AIR INDUCTION SCOOP ── */}
      <g id="v12-cover-ram-scoop">
        <path
          d={`M ${geometry.raNose.x} ${geometry.raNose.y}
              C ${geometry.raFL.x} ${geometry.raFL.y}, ${geometry.raFR.x} ${geometry.raFR.y}, ${geometry.raFR.x} ${geometry.raFR.y}
              L ${geometry.raBR.x} ${geometry.raBR.y}
              C ${geometry.raBL.x} ${geometry.raBL.y}, ${geometry.raNose.x} ${geometry.raNose.y}, ${geometry.raNose.x} ${geometry.raNose.y}
              Z`}
          fill="url(#v12-carbon-gloss-hull)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        {/* Scoop Intake Bellmouth Oval */}
        <ellipse
          cx={geometry.raNose.x + 4}
          cy={geometry.raNose.y}
          rx={6.5}
          ry={14.0}
          fill="#020617"
          stroke="#f59e0b"
          strokeWidth="1.5"
        />
      </g>

      {/* ── 7. CENTER GOLD HYPERCAR EMBLEM MEDALLION ── */}
      <g transform={`translate(${geometry.centerMedallion.x}, ${geometry.centerMedallion.y})`}>
        <ellipse cx={0} cy={0} rx={22} ry={9} fill="url(#v12-bezel-gold)" stroke="#090d16" strokeWidth="1.5" />
        <ellipse cx={0} cy={0} rx={20} ry={7.5} fill="#090d16" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
        <text
          x={0}
          y={2.5}
          fill="#fef08a"
          fontSize="6.0"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
          letterSpacing="0.6"
        >
          V12 · 6.5L
        </text>
      </g>
    </g>
  );
};
