import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12VelocityStacksIsoProps {
  originScreen?: ScreenPoint2D;
  explodedAmount?: number;
  throttleRpm?: number;
  colorTheme?: "gold" | "rosso" | "stealth" | "emerald";
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
 *  2. Cobalt-Blue / Anodized Outer Bellmouth Rim with Diamond-Cut Edge Chamfer
 *  3. Precision Roller-Bearing Throttle Shafts with Brass Butterfly Plates
 *  4. High-Vacuum CNC Venturi Throat with Dual Spray Fuel Injection Alignment
 *  5. Bank 1 (Left) and Bank 2 (Right) Symmetrical Array (12 Total ITBs)
 *  6. Dynamic Throttle Butterfly Plate Articulation based on live engine RPM
 */
export const V12VelocityStacksIso: React.FC<V12VelocityStacksIsoProps> = ({
  originScreen = { x: 290, y: 245 },
  explodedAmount = 0,
  throttleRpm = 900,
  colorTheme = "gold",
  componentState,
  onHoverComponent,
}) => {
  const expZ = explodedAmount * 45; // Floats +45mm upward on Z in exploded view

  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y, z: z + expZ }, originScreen),
    [originScreen, expZ]
  );

  const blockLength = 236;
  const runnerLength = blockLength - 24;
  const halfRL = runnerLength / 2;

  // Throttle butterfly plate opening angle (0° at idle to 85° at redline)
  const throttleAngleDeg = useMemo(() => {
    const clampedRpm = Math.max(900, Math.min(11000, throttleRpm));
    return ((clampedRpm - 900) / (11000 - 900)) * 82;
  }, [throttleRpm]);

  // Dynamic Theme Colors
  const themeColors = useMemo(() => {
    switch (colorTheme) {
      case "rosso":
        return { rimGrad: "url(#v12-stack-rosso)", stroke: "#ef4444", glow: "#f87171" };
      case "stealth":
        return { rimGrad: "url(#v12-stack-stealth)", stroke: "#64748b", glow: "#94a3b8" };
      case "emerald":
        return { rimGrad: "url(#v12-stack-emerald)", stroke: "#10b981", glow: "#34d399" };
      case "gold":
      default:
        return { rimGrad: "url(#v12-stack-cobalt)", stroke: "#0284c7", glow: "#38bdf8" };
    }
  }, [colorTheme]);

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
      const b2Base = P(cx, -18, 158);
      const b2Top = P(cx, -18, 176);
      list.push({ bank: 2, idx: i, ptBase: b2Base, ptTop: b2Top });
    }

    return list;
  }, [P, halfRL, runnerLength]);

  const isInstalled = componentState ? componentState.isInstalled : true;
  const opacity = componentState ? componentState.opacity : 1;

  if (!isInstalled && opacity === 0) return null;

  return (
    <g
      id="v12-velocity-stacks-3d"
      onMouseEnter={() => onHoverComponent?.("intake_manifold")}
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
        {/* Cobalt-Blue Velocity Stack Anodized Finish */}
        <linearGradient id="v12-stack-cobalt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="28%" stopColor="#0284c7" />
          <stop offset="65%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>

        {/* Rosso Corsa Anodized Finish */}
        <linearGradient id="v12-stack-rosso" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="35%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>

        {/* Stealth Titanium Anodized Finish */}
        <linearGradient id="v12-stack-stealth" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="40%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Motorsport Emerald Finish */}
        <linearGradient id="v12-stack-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="40%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>

        {/* Brass Throttle Butterfly Plate */}
        <linearGradient id="v12-throttle-brass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#eab308" />
          <stop offset="85%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>

        {/* Polished Aluminum Venturi Throat */}
        <linearGradient id="v12-stack-throat" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="25%" stopColor="#334155" />
          <stop offset="65%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* ── 12 INDIVIDUAL THROTTLE BODY (ITB) VELOCITY STACKS ── */}
      {stacks.map((stack) => {
        const topEl = projectIsoEllipse(
          { x: 0, y: 0, z: 0 },
          10.5,
          stack.ptTop
        );
        const throatEl = projectIsoEllipse(
          { x: 0, y: 0, z: 0 },
          7.2,
          stack.ptBase
        );

        return (
          <g key={`itb-${stack.bank}-${stack.idx}`}>
            {/* 1. Parabolic Flared Bellmouth Body */}
            <path
              d={`M ${throatEl.cx - throatEl.rx} ${throatEl.cy}
                  C ${throatEl.cx - throatEl.rx - 1} ${throatEl.cy - 6},
                    ${topEl.cx - topEl.rx - 1} ${topEl.cy + 4},
                    ${topEl.cx - topEl.rx} ${topEl.cy}
                  L ${topEl.cx + topEl.rx} ${topEl.cy}
                  C ${topEl.cx + topEl.rx + 1} ${topEl.cy + 4},
                    ${throatEl.cx + throatEl.rx + 1} ${throatEl.cy - 6},
                    ${throatEl.cx + throatEl.rx} ${throatEl.cy}
                  Z`}
              fill={themeColors.rimGrad}
              stroke="#090d16"
              strokeWidth="1.2"
            />

            {/* 2. Deep Venturi Throat Interior */}
            <ellipse
              cx={topEl.cx}
              cy={topEl.cy}
              rx={topEl.rx - 1.2}
              ry={topEl.ry - 0.7}
              fill="url(#v12-stack-throat)"
              stroke="#0f172a"
              strokeWidth="0.8"
            />

            {/* 3. Articulated Brass Butterfly Throttle Plate (Opens dynamically with RPM) */}
            <g
              transform={`translate(${topEl.cx}, ${topEl.cy + 1}) rotate(${throttleAngleDeg}, 0, 0)`}
            >
              <ellipse
                cx={0}
                cy={0}
                rx={topEl.rx - 2.5}
                ry={(topEl.ry - 1.5) * Math.max(0.12, Math.cos((throttleAngleDeg * Math.PI) / 180))}
                fill="url(#v12-throttle-brass)"
                stroke="#713f12"
                strokeWidth="0.8"
                opacity="0.95"
              />
              {/* Central Stainless Throttle Shaft Line */}
              <line
                x1={-topEl.rx + 2.5}
                y1={0}
                x2={topEl.rx - 2.5}
                y2={0}
                stroke="#ffffff"
                strokeWidth="1.0"
                opacity="0.8"
              />
            </g>

            {/* 4. Cobalt-Blue Flared Bellmouth Lip Outer Rim */}
            <ellipse
              cx={topEl.cx}
              cy={topEl.cy}
              rx={topEl.rx}
              ry={topEl.ry}
              fill="none"
              stroke={themeColors.stroke}
              strokeWidth="2.2"
            />

            {/* 5. Mirror-Polished Diamond-Cut Top Edge Highlight */}
            <ellipse
              cx={topEl.cx}
              cy={topEl.cy - 0.5}
              rx={topEl.rx - 0.6}
              ry={topEl.ry - 0.3}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.0"
              opacity="0.9"
            />
          </g>
        );
      })}
    </g>
  );
};
