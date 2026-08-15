import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12CylinderHeadsIsoProps {
  originScreen?: ScreenPoint2D;
  explodedAmount?: number;
  activeFiringCyl?: number;
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
 * PHASE 7 — PRECISION 60° V12 DUAL CYLINDER HEADS & VALVE VALLEYS
 * ═══════════════════════════════════════════════════════════════════
 *
 * Left (Bank 1) and Right (Bank 2) 48-Valve DOHC Cylinder Heads for
 * the 6.5L 60° V12 Racing Engine with live combustion firing glow.
 */
export const V12CylinderHeadsIso: React.FC<V12CylinderHeadsIsoProps> = ({
  originScreen = { x: 290, y: 245 },
  explodedAmount = 0,
  activeFiringCyl = 1,
  componentState,
  onHoverComponent,
}) => {
  const expZ = explodedAmount * 24; // Floats +24mm on Z in exploded view

  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y, z: z + expZ }, originScreen),
    [originScreen, expZ]
  );

  const blockLength = 236;
  const halfBL = blockLength / 2;

  const headLength = blockLength - 12;
  const halfHL = headLength / 2;
  const headHeight = 32;
  const headZBase = 92;

  // Geometry for Bank 1 (Left / Front) and Bank 2 (Right / Rear)
  const geometry = useMemo(() => {
    // Bank 1 (Left) Head Hull
    const b1BotFL = P(-halfHL, 40, headZBase);
    const b1BotFR = P(halfHL, 40, headZBase);
    const b1BotBL = P(-halfHL, 8, headZBase + 14);
    const b1BotBR = P(halfHL, 8, headZBase + 14);

    const b1TopFL = P(-halfHL, 40, headZBase + headHeight);
    const b1TopFR = P(halfHL, 40, headZBase + headHeight);
    const b1TopBL = P(-halfHL, 8, headZBase + headHeight + 14);
    const b1TopBR = P(halfHL, 8, headZBase + headHeight + 14);

    // Bank 2 (Right) Head Hull
    const b2BotFL = P(-halfHL, -8, headZBase + 14);
    const b2BotFR = P(halfHL, -8, headZBase + 14);
    const b2BotBL = P(-halfHL, -40, headZBase);
    const b2BotBR = P(halfHL, -40, headZBase);

    const b2TopFL = P(-halfHL, -8, headZBase + headHeight + 14);
    const b2TopFR = P(halfHL, -8, headZBase + headHeight + 14);
    const b2TopBL = P(-halfHL, -40, headZBase + headHeight);
    const b2TopBR = P(halfHL, -40, headZBase + headHeight);

    // 12 Spark Plug Wells (6 per bank)
    const plugPitch = (headLength - 32) / 5;
    const plugs: { bank: number; cylNumber: number; pt: ScreenPoint2D }[] = [];
    for (let i = 0; i < 6; i++) {
      const cx = -halfHL + 16 + i * plugPitch;
      // Bank 1 cylinders: 1, 3, 5, 7, 9, 11 (or 1..6)
      plugs.push({ bank: 1, cylNumber: i * 2 + 1, pt: P(cx, 24, headZBase + headHeight + 7) });
      // Bank 2 cylinders: 2, 4, 6, 8, 10, 12
      plugs.push({ bank: 2, cylNumber: i * 2 + 2, pt: P(cx, -24, headZBase + headHeight + 7) });
    }

    return {
      b1: { b1BotFL, b1BotFR, b1BotBL, b1BotBR, b1TopFL, b1TopFR, b1TopBL, b1TopBR },
      b2: { b2BotFL, b2BotFR, b2BotBL, b2BotBR, b2TopFL, b2TopFR, b2TopBL, b2TopBR },
      plugs,
    };
  }, [P, halfHL, headLength]);

  const isInstalled = componentState ? componentState.isInstalled : true;
  const opacity = componentState ? componentState.opacity : 1;

  if (!isInstalled && opacity === 0) return null;

  return (
    <g
      id="v12-cylinder-heads-3d"
      onMouseEnter={() => onHoverComponent?.("cylinder_head")}
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
        {/* CNC Billet Cylinder Head Aluminum Shader */}
        <linearGradient id="v12-head-cnc-side" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="25%" stopColor="#94a3b8" />
          <stop offset="60%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        <linearGradient id="v12-head-deck-top" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="40%" stopColor="#e2e8f0" />
          <stop offset="85%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Live Combustion Glow Gradient */}
        <radialGradient id="v12-combustion-flash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── BANK 2 (RIGHT) CYLINDER HEAD BODY ── */}
      <path
        d={`M ${geometry.b2.b2BotBL.x} ${geometry.b2.b2BotBL.y}
            L ${geometry.b2.b2BotBR.x} ${geometry.b2.b2BotBR.y}
            L ${geometry.b2.b2TopBR.x} ${geometry.b2.b2TopBR.y}
            L ${geometry.b2.b2TopBL.x} ${geometry.b2.b2TopBL.y} Z`}
        fill="url(#v12-head-cnc-side)"
        stroke="#090d16"
        strokeWidth="1.6"
      />
      <path
        d={`M ${geometry.b2.b2TopBL.x} ${geometry.b2.b2TopBL.y}
            L ${geometry.b2.b2TopBR.x} ${geometry.b2.b2TopBR.y}
            L ${geometry.b2.b2TopFR.x} ${geometry.b2.b2TopFR.y}
            L ${geometry.b2.b2TopFL.x} ${geometry.b2.b2TopFL.y} Z`}
        fill="url(#v12-head-deck-top)"
        stroke="#090d16"
        strokeWidth="1.6"
      />

      {/* ── BANK 1 (LEFT) CYLINDER HEAD BODY ── */}
      <path
        d={`M ${geometry.b1.b1BotFL.x} ${geometry.b1.b1BotFL.y}
            L ${geometry.b1.b1BotFR.x} ${geometry.b1.b1BotFR.y}
            L ${geometry.b1.b1TopFR.x} ${geometry.b1.b1TopFR.y}
            L ${geometry.b1.b1TopFL.x} ${geometry.b1.b1TopFL.y} Z`}
        fill="url(#v12-head-cnc-side)"
        stroke="#090d16"
        strokeWidth="1.6"
      />
      <path
        d={`M ${geometry.b1.b1TopFL.x} ${geometry.b1.b1TopFL.y}
            L ${geometry.b1.b1TopFR.x} ${geometry.b1.b1TopFR.y}
            L ${geometry.b1.b1TopBR.x} ${geometry.b1.b1TopBR.y}
            L ${geometry.b1.b1TopBL.x} ${geometry.b1.b1TopBL.y} Z`}
        fill="url(#v12-head-deck-top)"
        stroke="#090d16"
        strokeWidth="1.6"
      />

      {/* ── 12 SPARK PLUG TOWERS WITH LIVE FIRING PULSE ── */}
      {geometry.plugs.map((p, idx) => {
        const isCurrentlyFiring = p.cylNumber === activeFiringCyl;
        const plugEl = projectIsoEllipse({ x: 0, y: 0, z: 0 }, 5.5, p.pt);

        return (
          <g key={`spark-plug-${idx}`}>
            <ellipse
              cx={plugEl.cx}
              cy={plugEl.cy}
              rx={plugEl.rx}
              ry={plugEl.ry}
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="0.9"
            />
            <ellipse
              cx={plugEl.cx}
              cy={plugEl.cy}
              rx={plugEl.rx - 1.5}
              ry={plugEl.ry - 0.8}
              fill={isCurrentlyFiring ? "#38bdf8" : "#ca8a04"}
              stroke="#090d16"
              strokeWidth="0.6"
            />
            {/* Dynamic Combustion Ignition Flash */}
            {isCurrentlyFiring && (
              <circle
                cx={plugEl.cx}
                cy={plugEl.cy}
                r="14"
                fill="url(#v12-combustion-flash)"
                className="animate-ping"
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}
    </g>
  );
};
