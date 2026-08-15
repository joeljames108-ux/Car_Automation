import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12TurbochargerIsoProps {
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
 * PHASE 13 — MIRROR-POLISHED HIGH-BOOST BILLET TURBOCHARGER
 * ═══════════════════════════════════════════════════════════════════
 *
 * Racing-Spec High-Flow Billet Turbocharger Assembly with Mirror-Polished
 * Compressor Snail and 11-Blade Inducer Wheel matching the reference.
 *
 * Mechanical Details:
 *  1. A356-T6 CNC Mirror-Polished Aluminum Compressor Snail Housing (A/R 0.82)
 *  2. 11-Blade Forged Milled Billet (FMW) Titanium-Aluminide Compressor Wheel
 *  3. Dual Ceramic Ball-Bearing Cartridge with Water/Oil Cooling Jacket
 *  4. High-Temperature Inconel Turbine Housing with Internal Wastegate
 *  5. Blue Multi-Ply Silicone Boost Outlet Elbow & Stainless T-Bolt Clamps
 */
export const V12TurbochargerIso: React.FC<V12TurbochargerIsoProps> = ({
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

  // Turbocharger Location (Mounted on Front-Right: X = -halfBL + 45, Y = -48, Z = 95)
  const turboCenter = useMemo(() => P(-halfBL + 45, -48, 95), [P, halfBL]);

  // Wastegate Actuator Location
  const wastegateCenter = useMemo(() => P(-halfBL + 65, -54, 82), [P, halfBL]);

  // Boost Pipe Path
  const boostPipeStart = useMemo(() => P(-halfBL + 45, -48, 115), [P, halfBL]);
  const boostPipeEnd = useMemo(() => P(-halfBL + 20, -18, 160), [P, halfBL]);

  return (
    <g
      id="v12-turbocharger-3d"
      onMouseEnter={() => onHoverComponent?.("turbocharger")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState ? componentState.opacity : 1,
      }}
    >
      {/* ── 1. DEFINITIONS FOR TURBO SHADERS ── */}
      <defs>
        {/* Mirror-Polished Aluminum Compressor Housing */}
        <radialGradient id="v12-turbo-housing-polished" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#e2e8f0" />
          <stop offset="65%" stopColor="#94a3b8" />
          <stop offset="85%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>

        {/* Inducer Wheel Titanium Shading */}
        <radialGradient id="v12-turbo-inducer-wheel" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#0284c7" />
          <stop offset="80%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
      </defs>

      {/* ── 2. COMPRESSOR SNAIL SCROLL HOUSING ── */}
      <g id="v12-compressor-snail">
        {/* Drop Shadow */}
        <circle cx={turboCenter.x} cy={turboCenter.y + 6} r={28} fill="#000000" opacity={0.65} />

        {/* Outer Volute Scroll Snail Body */}
        <circle
          cx={turboCenter.x}
          cy={turboCenter.y}
          r={26}
          fill="url(#v12-turbo-housing-polished)"
          stroke="#090d16"
          strokeWidth="2.2"
        />

        {/* Specular White Rim Highlight */}
        <circle
          cx={turboCenter.x - 2}
          cy={turboCenter.y - 2}
          r={23}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.6"
          opacity={0.88}
        />

        {/* Inducer Air Inlet Bellmouth */}
        <circle
          cx={turboCenter.x}
          cy={turboCenter.y}
          r={16}
          fill="url(#v12-turbo-inducer-wheel)"
          stroke="#090d16"
          strokeWidth="1.8"
        />

        {/* 11 Billet Titanium Compressor Blades */}
        {Array.from({ length: 11 }).map((_, i) => {
          const rad = (i * (360 / 11) * Math.PI) / 180;
          const bx = turboCenter.x + 14 * Math.cos(rad);
          const by = turboCenter.y + 14 * Math.sin(rad);
          const mx = turboCenter.x + 8 * Math.cos(rad + 0.3);
          const my = turboCenter.y + 8 * Math.sin(rad + 0.3);
          return (
            <path
              key={`turbo-blade-${i}`}
              d={`M ${turboCenter.x} ${turboCenter.y} Q ${mx} ${my} ${bx} ${by}`}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          );
        })}

        {/* Center Compressor Wheel Hub Nut */}
        <circle cx={turboCenter.x} cy={turboCenter.y} r={3.5} fill="url(#gold-anodized)" stroke="#78350f" strokeWidth="0.8" />
        <circle cx={turboCenter.x} cy={turboCenter.y} r={1.2} fill="#ffffff" />
      </g>

      {/* ── 3. WASTEGATE ACTUATOR CANISTER & LINKAGE ── */}
      <g id="v12-wastegate-actuator">
        {/* Canister Body */}
        <ellipse cx={wastegateCenter.x} cy={wastegateCenter.y} rx={8.5} ry={12.0} fill="#475569" stroke="#090d16" strokeWidth="1.2" />
        <ellipse cx={wastegateCenter.x} cy={wastegateCenter.y - 6} rx={6.5} ry={4.0} fill="#64748b" stroke="#cbd5e1" strokeWidth="0.6" />

        {/* Actuator Pushrod Arm */}
        <line
          x1={wastegateCenter.x}
          y1={wastegateCenter.y + 8}
          x2={turboCenter.x + 14}
          y2={turboCenter.y + 16}
          stroke="#cbd5e1"
          strokeWidth="2.0"
          strokeLinecap="round"
        />
        {/* Blue Anodized Silicone Vacuum Line */}
        <circle cx={wastegateCenter.x} cy={wastegateCenter.y - 8} r={2.5} fill="#0284c7" />
      </g>

      {/* ── 4. POLISHED BOOST OUTLET PIPE & SILICONE COUPLER ── */}
      <g id="v12-boost-piping">
        {/* Blue Silicone Coupler at Turbo Discharge */}
        <ellipse cx={boostPipeStart.x} cy={boostPipeStart.y} rx={8.0} ry={5.0} fill="#1d4ed8" stroke="#172554" strokeWidth="1.2" />
        {/* Stainless T-Bolt Clamps */}
        <ellipse cx={boostPipeStart.x} cy={boostPipeStart.y} rx={9.0} ry={5.5} fill="none" stroke="#e2e8f0" strokeWidth="0.9" strokeDasharray="2 1.5" />

        {/* Polished Aluminum Charge Tube */}
        <path
          d={`M ${boostPipeStart.x} ${boostPipeStart.y} Q ${boostPipeStart.x - 10} ${boostPipeStart.y - 20} ${boostPipeEnd.x} ${boostPipeEnd.y}`}
          fill="none"
          stroke="url(#v12-scavenge-tube-steel)"
          strokeWidth="7.0"
          strokeLinecap="round"
        />
        {/* Specular White Highlight */}
        <path
          d={`M ${boostPipeStart.x} ${boostPipeStart.y - 1.5} Q ${boostPipeStart.x - 10} ${boostPipeStart.y - 21.5} ${boostPipeEnd.x} ${boostPipeEnd.y - 1.5}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.0"
          strokeLinecap="round"
          opacity={0.88}
        />
      </g>
    </g>
  );
};
