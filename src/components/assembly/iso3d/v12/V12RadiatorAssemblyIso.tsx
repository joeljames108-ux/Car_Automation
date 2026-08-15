import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12RadiatorAssemblyIsoProps {
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
 * PHASE 6 — FRONT DUAL-PASS RACING RADIATOR & ELECTRIC FAN SHROUD
 * ═══════════════════════════════════════════════════════════════════
 *
 * Front-Mounted Dual-Pass Heavy-Duty Aluminum Racing Radiator with
 * die-formed radiused end tanks, aerofoil cooling fan bellmouth,
 * and 3D curved silicone coolant hoses.
 */
export const V12RadiatorAssemblyIso: React.FC<V12RadiatorAssemblyIsoProps> = ({
  originScreen = { x: 290, y: 245 },
  explodedAmount = 0,
  componentState,
  onHoverComponent,
}) => {
  const expX = explodedAmount * -45; // Radiator floats forward (-X) in exploded view

  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x: x + expX, y, z }, originScreen),
    [originScreen, expX]
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

    // Curved Silicone Lower Coolant Return Hose Points
    const hoseP1 = P(radX + radDepth, halfW - 20, radBaseZ + 12);
    const hoseCp1 = P(radX + radDepth + 18, halfW - 10, radBaseZ + 6);
    const hoseCp2 = P(radX + radDepth + 28, halfW + 10, radBaseZ + 8);
    const hoseP2 = P(-halfBL + 4, 38, radBaseZ + 18);

    return {
      fTL, fTR, fBL, fBR,
      rTL, rTR, rBL, rBR,
      capPt,
      fanCenter,
      hoseP1, hoseCp1, hoseCp2, hoseP2,
    };
  }, [P, radX, radWidth, radHeight, radDepth, radBaseZ, halfBL]);

  const isInstalled = componentState ? componentState.isInstalled : true;
  const opacity = componentState ? componentState.opacity : 1;

  if (!isInstalled && opacity === 0) return null;

  return (
    <g
      id="v12-radiator-assembly-3d"
      onMouseEnter={() => onHoverComponent?.("radiator")}
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
        {/* Radiator Brazed Aluminum Core Texture */}
        <linearGradient id="v12-radiator-core" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="25%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="75%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Die-Formed Radiator End Tank Curve */}
        <linearGradient id="v12-end-tank-al" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="35%" stopColor="#cbd5e1" />
          <stop offset="70%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* High-Pressure Blue Silicone Coolant Hose */}
        <linearGradient id="v12-silicone-hose" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="35%" stopColor="#2563eb" />
          <stop offset="70%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
      </defs>

      {/* ── 1. DIE-FORMED RADIATOR END-TANKS (Curved Arched Side Profiles) ── */}
      <path
        d={`M ${geometry.fBL.x} ${geometry.fBL.y}
            Q ${geometry.fBL.x - 8} ${(geometry.fBL.y + geometry.fTL.y) / 2} ${geometry.fTL.x} ${geometry.fTL.y}
            L ${geometry.rTL.x} ${geometry.rTL.y}
            Q ${geometry.rTL.x + 6} ${(geometry.rTL.y + geometry.rBL.y) / 2} ${geometry.rBL.x} ${geometry.rBL.y}
            Z`}
        fill="url(#v12-end-tank-al)"
        stroke="#090d16"
        strokeWidth="1.8"
      />

      {/* ── 2. RADIATOR BRAZED ALUMINUM CORE FACE ── */}
      <polygon
        points={`${geometry.fTL.x},${geometry.fTL.y} ${geometry.fTR.x},${geometry.fTR.y} ${geometry.fBR.x},${geometry.fBR.y} ${geometry.fBL.x},${geometry.fBL.y}`}
        fill="url(#v12-radiator-core)"
        stroke="#090d16"
        strokeWidth="2.0"
      />

      {/* Micro-Louvered Cooling Fin Horizontal Striations */}
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((ratio, fidx) => {
        const x1 = geometry.fTL.x + (geometry.fBL.x - geometry.fTL.x) * ratio;
        const y1 = geometry.fTL.y + (geometry.fBL.y - geometry.fTL.y) * ratio;
        const x2 = geometry.fTR.x + (geometry.fBR.x - geometry.fTR.x) * ratio;
        const y2 = geometry.fTR.y + (geometry.fBR.y - geometry.fTR.y) * ratio;
        return (
          <line
            key={`rad-fin-${fidx}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#94a3b8"
            strokeWidth="0.8"
            opacity="0.6"
          />
        );
      })}

      {/* ── 3. AEROFOIL ELECTRIC COOLING FAN BELLMOUTH HOUSING ── */}
      <ellipse
        cx={geometry.fanCenter.x}
        cy={geometry.fanCenter.y}
        rx={34}
        ry={22}
        fill="#0f172a"
        stroke="#38bdf8"
        strokeWidth="2.0"
      />
      <ellipse
        cx={geometry.fanCenter.x}
        cy={geometry.fanCenter.y}
        rx={28}
        ry={18}
        fill="#020617"
        stroke="#64748b"
        strokeWidth="1.0"
      />

      {/* 7 Curved Aerofoil Fan Blades */}
      {[0, 51.4, 102.8, 154.2, 205.6, 257.0, 308.4].map((deg, bidx) => (
        <path
          key={`fan-blade-${bidx}`}
          d={`M ${geometry.fanCenter.x} ${geometry.fanCenter.y}
              Q ${geometry.fanCenter.x + Math.cos((deg * Math.PI) / 180) * 16}
                ${geometry.fanCenter.y + Math.sin((deg * Math.PI) / 180) * 12}
                ${geometry.fanCenter.x + Math.cos(((deg + 25) * Math.PI) / 180) * 26}
                ${geometry.fanCenter.y + Math.sin(((deg + 25) * Math.PI) / 180) * 16}`}
          fill="none"
          stroke="#0284c7"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      ))}

      {/* Center Fan Motor Hub */}
      <circle cx={geometry.fanCenter.x} cy={geometry.fanCenter.y} r={7} fill="#1e293b" stroke="#f59e0b" strokeWidth="1.2" />
      <circle cx={geometry.fanCenter.x} cy={geometry.fanCenter.y} r={3} fill="#090d16" />

      {/* ── 4. CURVED SILICONE COOLANT HOSE WITH T-BOLT HOSE CLAMPS ── */}
      {/* Hose Drop Shadow */}
      <path
        d={`M ${geometry.hoseP1.x} ${geometry.hoseP1.y + 4}
            C ${geometry.hoseCp1.x} ${geometry.hoseCp1.y + 4}, ${geometry.hoseCp2.x} ${geometry.hoseCp2.y + 4}, ${geometry.hoseP2.x} ${geometry.hoseP2.y + 4}`}
        fill="none"
        stroke="#020617"
        strokeWidth="9.0"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Main Blue Silicone Body */}
      <path
        d={`M ${geometry.hoseP1.x} ${geometry.hoseP1.y}
            C ${geometry.hoseCp1.x} ${geometry.hoseCp1.y}, ${geometry.hoseCp2.x} ${geometry.hoseCp2.y}, ${geometry.hoseP2.x} ${geometry.hoseP2.y}`}
        fill="none"
        stroke="url(#v12-silicone-hose)"
        strokeWidth="8.0"
        strokeLinecap="round"
      />
      {/* Specular Highlight Glint */}
      <path
        d={`M ${geometry.hoseP1.x} ${geometry.hoseP1.y - 1.8}
            C ${geometry.hoseCp1.x} ${geometry.hoseCp1.y - 1.8}, ${geometry.hoseCp2.x} ${geometry.hoseCp2.y - 1.8}, ${geometry.hoseP2.x} ${geometry.hoseP2.y - 1.8}`}
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.0"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Stainless T-Bolt Clamps */}
      <circle cx={geometry.hoseP1.x + 4} cy={geometry.hoseP1.y} r={4.5} fill="none" stroke="#f1f5f9" strokeWidth="1.8" />
      <circle cx={geometry.hoseP2.x - 4} cy={geometry.hoseP2.y} r={4.5} fill="none" stroke="#f1f5f9" strokeWidth="1.8" />

      {/* ── 5. BILLET ALUMINUM 1.3 BAR RADIATOR CAP ── */}
      <g transform={`translate(${geometry.capPt.x}, ${geometry.capPt.y})`}>
        <ellipse cx={0} cy={0} rx={8.0} ry={4.8} fill="#090d16" stroke="#ca8a04" strokeWidth="1.2" />
        <ellipse cx={0} cy={-2} rx={6.5} ry={3.8} fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
        <text x={0} y={0} fill="#090d16" fontSize="5.0" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">1.3</text>
      </g>
    </g>
  );
};
