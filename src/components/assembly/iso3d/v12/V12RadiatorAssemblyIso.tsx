import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12RadiatorAssemblyIsoProps {
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
 * PHASE 6 — FRONT DUAL-PASS RACING RADIATOR & ELECTRIC FAN SHROUD
 * ═══════════════════════════════════════════════════════════════════
 *
 * Front-Mounted Dual-Pass Heavy-Duty Aluminum Racing Radiator with
 * High-Flow Electric Cooling Fan Shroud and Molded Coolant Plumbing.
 *
 * Mechanical Details:
 *  1. Dual-Pass Aluminum Brazed Core with Micro-Louvered Cooling Fins
 *  2. CNC TIG-Welded Aluminum Side End Tanks with Reinforcement Ribs
 *  3. Billet Aluminum High-Pressure (1.3 Bar) Radiator Cap
 *  4. Curved Aerodynamic Polymer Fan Shroud Housing 7-Blade Electric Fan
 *  5. Lower Mandrel-Bent Polished Brass/Silicone Coolant Return Pipe with T-Bolt Clamps
 */
export const V12RadiatorAssemblyIso: React.FC<V12RadiatorAssemblyIsoProps> = ({
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

  // Radiator Positioning (Mounted at Front: X = -halfBL - 38)
  const radX = -halfBL - 38;
  const radWidth = 110;
  const radHeight = 100;
  const radDepth = 18;
  const radBaseZ = 12;

  const geometry = useMemo(() => {
    const halfW = radWidth / 2;

    // Radiator Core Front Face (Facing X-)
    const fTL = P(radX, halfW, radBaseZ + radHeight);
    const fTR = P(radX, -halfW, radBaseZ + radHeight);
    const fBL = P(radX, halfW, radBaseZ);
    const fBR = P(radX, -halfW, radBaseZ);

    // Radiator Core Rear Face (Facing Engine / Fan side)
    const rTL = P(radX + radDepth, halfW, radBaseZ + radHeight);
    const rTR = P(radX + radDepth, -halfW, radBaseZ + radHeight);
    const rBL = P(radX + radDepth, halfW, radBaseZ);
    const rBR = P(radX + radDepth, -halfW, radBaseZ);

    // Radiator Billet Cap Location (Top Left Tank)
    const capPt = P(radX + radDepth / 2, halfW - 12, radBaseZ + radHeight + 6);

    // Electric Fan Hub Center (Mounted on Rear Shroud)
    const fanCenter = P(radX + radDepth + 6, 0, radBaseZ + radHeight / 2);

    // Lower Coolant Return Pipe Path
    const pipeStart = P(radX + radDepth, halfW - 20, radBaseZ + 12);
    const pipeBend1 = P(radX + radDepth + 24, halfW - 12, radBaseZ + 6);
    const pipeEnd = P(-halfBL + 4, 38, radBaseZ + 18);

    return {
      fTL, fTR, fBL, fBR,
      rTL, rTR, rBL, rBR,
      capPt,
      fanCenter,
      pipeStart, pipeBend1, pipeEnd,
    };
  }, [P, radX, radWidth, radHeight, radDepth, radBaseZ, halfBL]);

  return (
    <g
      id="v12-radiator-assembly-3d"
      onMouseEnter={() => onHoverComponent?.("radiator")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState ? componentState.opacity : 1,
      }}
    >
      {/* ── 1. RADIATOR GRADIENTS ── */}
      <defs>
        {/* Polished Aluminum End Tanks */}
        <linearGradient id="v12-rad-tank-aluminum" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* Dense Cooling Core Fins */}
        <linearGradient id="v12-rad-core-fins" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Polished Brass/Gold Lower Coolant Pipe */}
        <linearGradient id="v12-coolant-pipe-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#eab308" />
          <stop offset="70%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
      </defs>

      {/* ── 2. RADIATOR CORE & SIDE END TANKS ── */}
      <g id="v12-rad-core-structure">
        {/* Core Front Face */}
        <polygon
          points={`${geometry.fBL.x},${geometry.fBL.y} ${geometry.fBR.x},${geometry.fBR.y} ${geometry.fTR.x},${geometry.fTR.y} ${geometry.fTL.x},${geometry.fTL.y}`}
          fill="url(#v12-rad-core-fins)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        {/* Top Tank Plate */}
        <polygon
          points={`${geometry.fTL.x},${geometry.fTL.y} ${geometry.fTR.x},${geometry.fTR.y} ${geometry.rTR.x},${geometry.rTR.y} ${geometry.rTL.x},${geometry.rTL.y}`}
          fill="url(#v12-rad-tank-aluminum)"
          stroke="#090d16"
          strokeWidth="2.0"
        />
        {/* Left Side Tank */}
        <polygon
          points={`${geometry.fBL.x},${geometry.fBL.y} ${geometry.rBL.x},${geometry.rBL.y} ${geometry.rTL.x},${geometry.rTL.y} ${geometry.fTL.x},${geometry.fTL.y}`}
          fill="url(#v12-rad-tank-aluminum)"
          stroke="#090d16"
          strokeWidth="2.0"
        />

        {/* Micro-Louvered Cooling Fin Rows */}
        {Array.from({ length: 14 }).map((_, i) => {
          const t = i / 13;
          const lx1 = geometry.fBL.x + t * (geometry.fTL.x - geometry.fBL.x);
          const ly1 = geometry.fBL.y + t * (geometry.fTL.y - geometry.fBL.y);
          const lx2 = geometry.fBR.x + t * (geometry.fTR.x - geometry.fBR.x);
          const ly2 = geometry.fBR.y + t * (geometry.fTR.y - geometry.fBR.y);
          return (
            <line
              key={`rad-fin-${i}`}
              x1={lx1}
              y1={ly1}
              x2={lx2}
              y2={ly2}
              stroke="#64748b"
              strokeWidth="0.8"
              opacity={0.7}
            />
          );
        })}

        {/* Specular Front Glint on Top Tank */}
        <line
          x1={geometry.fTL.x}
          y1={geometry.fTL.y}
          x2={geometry.fTR.x}
          y2={geometry.fTR.y}
          stroke="#ffffff"
          strokeWidth="1.8"
          opacity={0.9}
        />
      </g>

      {/* ── 3. BILLET HIGH-PRESSURE RADIATOR CAP ── */}
      <g id="v12-rad-cap">
        <ellipse cx={geometry.capPt.x} cy={geometry.capPt.y} rx={7.5} ry={4.5} fill="#f1f5f9" stroke="#090d16" strokeWidth="1.0" />
        <ellipse cx={geometry.capPt.x} cy={geometry.capPt.y - 2} rx={5.5} ry={3.0} fill="#cbd5e1" />
        <circle cx={geometry.capPt.x} cy={geometry.capPt.y - 2} r={1.2} fill="#ef4444" />
      </g>

      {/* ── 4. ELECTRIC COOLING FAN SHROUD & 7 BLADES ── */}
      <g id="v12-electric-fan-assembly">
        {/* Polymer Shroud Ring */}
        <circle cx={geometry.fanCenter.x} cy={geometry.fanCenter.y} r={34} fill="#090d16" stroke="#475569" strokeWidth="2.0" opacity={0.9} />
        <circle cx={geometry.fanCenter.x} cy={geometry.fanCenter.y} r={30} fill="#020617" stroke="#1e293b" strokeWidth="1.2" />

        {/* Electric Motor Hub Center */}
        <circle cx={geometry.fanCenter.x} cy={geometry.fanCenter.y} r={12} fill="#1e293b" stroke="#38bdf8" strokeWidth="1.2" />
        <circle cx={geometry.fanCenter.x} cy={geometry.fanCenter.y} r={5} fill="#090d16" />

        {/* 7 Aerodynamic Curved Fan Blades */}
        {Array.from({ length: 7 }).map((_, i) => {
          const rad = (i * (360 / 7) * Math.PI) / 180;
          const tipX = geometry.fanCenter.x + 27 * Math.cos(rad);
          const tipY = geometry.fanCenter.y + 27 * Math.sin(rad);
          const midX = geometry.fanCenter.x + 18 * Math.cos(rad + 0.3);
          const midY = geometry.fanCenter.y + 18 * Math.sin(rad + 0.3);
          return (
            <path
              key={`fan-blade-${i}`}
              d={`M ${geometry.fanCenter.x} ${geometry.fanCenter.y} Q ${midX} ${midY} ${tipX} ${tipY}`}
              fill="none"
              stroke="#475569"
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity={0.85}
            />
          );
        })}
      </g>

      {/* ── 5. LOWER COOLANT RETURN PIPE & SILICONE COUPLERS ── */}
      <g id="v12-coolant-return-plumbing">
        {/* Pipe Shadow */}
        <path
          d={`M ${geometry.pipeStart.x} ${geometry.pipeStart.y + 4}
              Q ${geometry.pipeBend1.x} ${geometry.pipeBend1.y + 4} ${geometry.pipeEnd.x} ${geometry.pipeEnd.y + 4}`}
          fill="none"
          stroke="#020617"
          strokeWidth="6.5"
          opacity={0.65}
        />
        {/* Gold Polished Tube */}
        <path
          d={`M ${geometry.pipeStart.x} ${geometry.pipeStart.y}
              Q ${geometry.pipeBend1.x} ${geometry.pipeBend1.y} ${geometry.pipeEnd.x} ${geometry.pipeEnd.y}`}
          fill="none"
          stroke="url(#v12-coolant-pipe-gold)"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        {/* Specular White Highlight */}
        <path
          d={`M ${geometry.pipeStart.x} ${geometry.pipeStart.y - 1.2}
              Q ${geometry.pipeBend1.x} ${geometry.pipeBend1.y - 1.2} ${geometry.pipeEnd.x} ${geometry.pipeEnd.y - 1.2}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity={0.85}
        />
        {/* Silicone Coupler Hose Clamps */}
        <circle cx={geometry.pipeStart.x + 3} cy={geometry.pipeStart.y} r={4.5} fill="none" stroke="#1e3a8a" strokeWidth="2.5" />
        <circle cx={geometry.pipeEnd.x - 3} cy={geometry.pipeEnd.y} r={4.5} fill="none" stroke="#1e3a8a" strokeWidth="2.5" />
      </g>
    </g>
  );
};
