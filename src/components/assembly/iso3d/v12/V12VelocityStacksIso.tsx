import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12VelocityStacksIsoProps {
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
 * PHASE 11 — 12 INDIVIDUAL THROTTLE BODIES & COBALT-BLUE TRUMPETS
 * ═══════════════════════════════════════════════════════════════════
 *
 * 12 CNC-Machined Velocity Stacks with Cobalt-Blue Anodized Bellmouth
 * Lips and Precision Throttle Butterflies matching the reference illustration.
 *
 * Mechanical Details:
 *  1. 12 Flared Aerodynamic Parabolic Velocity Stacks (Ø52mm Throttle Bore)
 *  2. Cobalt-Blue Anodized Outer Bellmouth Rim with Diamond-Cut Edge Chamfer
 *  3. Precision Roller-Bearing Throttle Shafts with Brass Butterfly Plates
 *  4. High-Vacuum CNC Venturi Throat with Dual Spray Fuel Injection Alignment
 *  5. Bank 1 (Left) and Bank 2 (Right) Symmetrical Array (12 Total ITBs)
 */
export const V12VelocityStacksIso: React.FC<V12VelocityStacksIsoProps> = ({
  originScreen = { x: 250, y: 220 },
  componentState,
  onHoverComponent,
}) => {
  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen),
    [originScreen]
  );

  const blockLength = 236;
  const runnerLength = blockLength - 24;
  const halfRL = runnerLength / 2;

  // 12 Velocity Stacks (6 on Bank 1, 6 on Bank 2)
  const stacks = useMemo(() => {
    const cylPitch = (runnerLength - 32) / 5;
    const list: {
      bank: number;
      idx: number;
      ptBase: ScreenPoint2D;
      ptTop: ScreenPoint2D;
    }[] = [];

    for (let i = 0; i < 6; i++) {
      const cx = -halfRL + 16 + i * cylPitch;

      // Bank 1 Velocity Stack (Y=18, Z=158 to Z=176)
      const b1Base = P(cx, 18, 158);
      const b1Top = P(cx, 18, 176);
      list.push({ bank: 1, idx: i, ptBase: b1Base, ptTop: b1Top });

      // Bank 2 Velocity Stack (Y=-18, Z=158 to Z=176)
      const b2Base = P(cx + 4, -18, 158);
      const b2Top = P(cx + 4, -18, 176);
      list.push({ bank: 2, idx: i, ptBase: b2Base, ptTop: b2Top });
    }

    return list;
  }, [P, runnerLength, halfRL]);

  return (
    <g
      id="v12-velocity-stacks-3d"
      onMouseEnter={() => onHoverComponent?.("intake_manifold")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState ? componentState.opacity : 1,
      }}
    >
      {/* ── 1. DEFINITIONS FOR COBALT BLUE ANODIZED SHADERS ── */}
      <defs>
        {/* Cobalt Blue Anodized Outer Rim */}
        <linearGradient id="v12-stack-cobalt-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="30%" stopColor="#0284c7" />
          <stop offset="70%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>

        {/* Deep Venturi Throat Shadow */}
        <radialGradient id="v12-stack-throat-dark" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#020617" />
          <stop offset="65%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </radialGradient>
      </defs>

      {/* ── 2. 12 VELOCITY STACKS WITH COBALT-BLUE BELLMOUTHS ── */}
      <g id="v12-stacks-array">
        {stacks.map((st, idx) => (
          <g key={`velocity-stack-${st.bank}-${st.idx}`}>
            {/* Lower Stack Cylindrical Neck */}
            <polygon
              points={`${st.ptBase.x - 7.5},${st.ptBase.y} ${st.ptBase.x + 7.5},${st.ptBase.y} ${st.ptTop.x + 10.5},${st.ptTop.y} ${st.ptTop.x - 10.5},${st.ptTop.y}`}
              fill="url(#v12-ceramic-runner-white)"
              stroke="#090d16"
              strokeWidth="1.2"
            />

            {/* Cobalt Blue Flared Bellmouth Lip */}
            <ellipse
              cx={st.ptTop.x}
              cy={st.ptTop.y}
              rx={12.0}
              ry={6.8}
              fill="url(#v12-stack-cobalt-blue)"
              stroke="#090d16"
              strokeWidth="1.4"
            />

            {/* Specular White Rim Highlight */}
            <ellipse
              cx={st.ptTop.x}
              cy={st.ptTop.y - 0.8}
              rx={11.0}
              ry={6.0}
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.9"
              opacity={0.88}
            />

            {/* Dark Deep Venturi Throat Bore */}
            <ellipse
              cx={st.ptTop.x}
              cy={st.ptTop.y}
              rx={8.5}
              ry={4.6}
              fill="url(#v12-stack-throat-dark)"
              stroke="#0284c7"
              strokeWidth="0.8"
            />

            {/* Brass Throttle Butterfly Shaft */}
            <line
              x1={st.ptTop.x - 6}
              y1={st.ptTop.y}
              x2={st.ptTop.x + 6}
              y2={st.ptTop.y}
              stroke="#eab308"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>
    </g>
  );
};
