import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12BellhousingIsoProps {
  originScreen?: ScreenPoint2D;
  explodedAmount?: number;
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
 * PHASE 17 — DIE-CAST ALUMINUM BELLHOUSING & STARTER MOTOR
 * ═══════════════════════════════════════════════════════════════════
 *
 * Conical Magnesium-Aluminum Bellhousing with organic 3D lofting flare
 * curves, curved cutaway inspection window, and starter motor cylinder.
 */
export const V12BellhousingIso: React.FC<V12BellhousingIsoProps> = ({
  originScreen = { x: 290, y: 245 },
  explodedAmount = 0,
  componentState,
  onHoverComponent,
}) => {
  const expX = explodedAmount * 25; // Floats rearward (+X) in exploded view

  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x: x + expX, y, z }, originScreen),
    [originScreen, expX]
  );

  const blockLength = 236;
  const halfBL = blockLength / 2;

  // Bellhousing Extends from Engine Rear (X = halfBL) to Gearbox Front (X = halfBL + 44)
  const bhFrontX = halfBL;
  const bhRearX = halfBL + 44;

  const geometry = useMemo(() => {
    // Engine Block Mating Flange (X = bhFrontX, Large Diameter)
    const fTop = P(bhFrontX, 0, 78);
    const fBot = P(bhFrontX, 0, -18);
    const fFL = P(bhFrontX, 48, 28);
    const fFR = P(bhFrontX, -48, 28);

    // Gearbox Mating Flange (X = bhRearX, Tapered Smaller Diameter)
    const rTop = P(bhRearX, 0, 62);
    const rBot = P(bhRearX, 0, -6);
    const rFL = P(bhRearX, 36, 28);
    const rFR = P(bhRearX, -36, 28);

    // Bellhousing Conical Flare Midpoint Control Points
    const midFL = P(bhFrontX + 20, 44, 28);
    const midTop = P(bhFrontX + 20, 0, 72);

    // Starter Motor Cylinder Location (Mounted on lower left flank)
    const starterFront = P(bhFrontX - 8, 42, 6);
    const starterRear = P(bhFrontX + 26, 42, 6);
    const solenoidPt = P(bhFrontX + 8, 48, 16);

    return {
      fTop, fBot, fFL, fFR,
      rTop, rBot, rFL, rFR,
      midFL, midTop,
      starterFront, starterRear, solenoidPt,
    };
  }, [P, bhFrontX, bhRearX]);

  const isInstalled = componentState ? componentState.isInstalled : true;
  const opacity = componentState ? componentState.opacity : 1;

  if (!isInstalled && opacity === 0) return null;

  return (
    <g
      id="v12-bellhousing-assembly-3d"
      onMouseEnter={() => onHoverComponent?.("transmission")}
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
        {/* Die-Cast Magnesium-Aluminum Bellhousing Gradient */}
        <linearGradient id="v12-bellhousing-al" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="25%" stopColor="#cbd5e1" />
          <stop offset="65%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Starter Motor Body */}
        <linearGradient id="v12-starter-motor-black" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>
      </defs>

      {/* ── 1. CONICAL BELLHOUSING HULL (Curved Lofting Path) ── */}
      <path
        d={`M ${geometry.fTop.x} ${geometry.fTop.y}
            Q ${geometry.midFL.x} ${geometry.midFL.y} ${geometry.fFL.x} ${geometry.fFL.y}
            L ${geometry.rFL.x} ${geometry.rFL.y}
            Q ${geometry.midTop.x} ${geometry.midTop.y} ${geometry.rTop.x} ${geometry.rTop.y}
            Z`}
        fill="url(#v12-bellhousing-al)"
        stroke="#090d16"
        strokeWidth="2.0"
      />

      {/* Lower Tapered Bell Wall */}
      <path
        d={`M ${geometry.fFL.x} ${geometry.fFL.y}
            L ${geometry.fBot.x} ${geometry.fBot.y}
            L ${geometry.rBot.x} ${geometry.rBot.y}
            L ${geometry.rFL.x} ${geometry.rFL.y}
            Z`}
        fill="#475569"
        stroke="#090d16"
        strokeWidth="1.8"
        opacity="0.85"
      />

      {/* ── 2. CUTAWAY INSPECTION WINDOW WITH RADIUSED BEVELS ── */}
      <path
        d={`M ${geometry.fFL.x + 10} ${geometry.fFL.y - 12}
            Q ${geometry.fFL.x + 22} ${geometry.fFL.y - 18} ${geometry.fFL.x + 28} ${geometry.fFL.y - 8}
            L ${geometry.fFL.x + 24} ${geometry.fFL.y + 12}
            Q ${geometry.fFL.x + 14} ${geometry.fFL.y + 16} ${geometry.fFL.x + 6} ${geometry.fFL.y + 6}
            Z`}
        fill="#020617"
        stroke="#38bdf8"
        strokeWidth="1.2"
      />

      {/* Internal Flywheel Ring Gear Teeth Visible Through Cutaway */}
      <path
        d={`M ${geometry.fFL.x + 12} ${geometry.fFL.y - 6}
            L ${geometry.fFL.x + 22} ${geometry.fFL.y + 6}`}
        stroke="#f59e0b"
        strokeWidth="3.5"
        strokeDasharray="2 1.5"
      />

      {/* ── 3. HIGH-TORQUE STARTER MOTOR CYLINDER ── */}
      <g id="v12-starter-motor">
        <path
          d={`M ${geometry.starterFront.x} ${geometry.starterFront.y - 9}
              L ${geometry.starterRear.x} ${geometry.starterRear.y - 9}
              Q ${geometry.starterRear.x + 5} ${geometry.starterRear.y} ${geometry.starterRear.x} ${geometry.starterRear.y + 9}
              L ${geometry.starterFront.x} ${geometry.starterFront.y + 9}
              Q ${geometry.starterFront.x - 5} ${geometry.starterFront.y} ${geometry.starterFront.x} ${geometry.starterFront.y - 9}
              Z`}
          fill="url(#v12-starter-motor-black)"
          stroke="#090d16"
          strokeWidth="1.8"
        />
        {/* Starter Specular Glint */}
        <line
          x1={geometry.starterFront.x + 2}
          y1={geometry.starterFront.y - 4}
          x2={geometry.starterRear.x - 2}
          y2={geometry.starterRear.y - 4}
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        {/* Starter Solenoid Unit */}
        <circle cx={geometry.solenoidPt.x} cy={geometry.solenoidPt.y} r={6.5} fill="#1e293b" stroke="#f59e0b" strokeWidth="1.2" />
        <circle cx={geometry.solenoidPt.x} cy={geometry.solenoidPt.y} r={3.2} fill="#d97706" />
      </g>

      {/* ── 4. PERIMETER M12 BOLT FLANGE STUDS (16x Pattern) ── */}
      {[0.15, 0.35, 0.55, 0.75, 0.9].map((ratio, idx) => {
        const bx = geometry.fTop.x + (geometry.fFL.x - geometry.fTop.x) * ratio;
        const by = geometry.fTop.y + (geometry.fFL.y - geometry.fTop.y) * ratio;
        return (
          <g key={`bh-bolt-${idx}`}>
            <circle cx={bx} cy={by} r={3.2} fill="#090d16" stroke="#94a3b8" strokeWidth="0.8" />
            <circle cx={bx} cy={by} r={1.2} fill="#f8fafc" />
          </g>
        );
      })}
    </g>
  );
};
