import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12IntakeManifoldsIsoProps {
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
 * PHASE 10 — 12-RUNNER EQUAL-LENGTH RAM INTAKE MANIFOLD RUNNERS
 * ═══════════════════════════════════════════════════════════════════
 *
 * 12 Hydroformed Equal-Length Aluminum/Ceramic Ram-Air Intake Runners
 * rising from the cylinder head ports into the central V-valley with
 * photorealistic 3D cubic Bézier S-curves and organic flange fillets.
 */
export const V12IntakeManifoldsIso: React.FC<V12IntakeManifoldsIsoProps> = ({
  originScreen = { x: 290, y: 245 },
  explodedAmount = 0,
  componentState,
  onHoverComponent,
}) => {
  const expZ = explodedAmount * 36;

  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y, z: z + expZ }, originScreen),
    [originScreen, expZ]
  );

  const blockLength = 236;
  const runnerLength = blockLength - 24;
  const halfRL = runnerLength / 2;

  // 12 Runners: 6 on Bank 1 (Left), 6 on Bank 2 (Right)
  const runners = useMemo(() => {
    const cylPitch = (runnerLength - 32) / 5;
    const list: {
      bank: number;
      idx: number;
      ptBase: ScreenPoint2D;
      cp1: ScreenPoint2D;
      cp2: ScreenPoint2D;
      ptTop: ScreenPoint2D;
    }[] = [];

    for (let i = 0; i < 6; i++) {
      const cx = -halfRL + 16 + i * cylPitch;

      // Bank 1 Runner (Organic S-Curve: Head port Y=12 -> flares outward to Y=26 -> tucks to ITB throat Y=18)
      const b1Base = P(cx, 12, 126);
      const b1Cp1 = P(cx - 2, 28, 136);
      const b1Cp2 = P(cx + 1, 24, 150);
      const b1Top = P(cx, 18, 158);
      list.push({ bank: 1, idx: i, ptBase: b1Base, cp1: b1Cp1, cp2: b1Cp2, ptTop: b1Top });

      // Bank 2 Runner (Symmetrical S-Curve on Bank 2)
      const b2Base = P(cx + 4, -12, 126);
      const b2Cp1 = P(cx + 2, -28, 136);
      const b2Cp2 = P(cx + 5, -24, 150);
      const b2Top = P(cx + 4, -18, 158);
      list.push({ bank: 2, idx: i, ptBase: b2Base, cp1: b2Cp1, cp2: b2Cp2, ptTop: b2Top });
    }

    return list;
  }, [P, runnerLength, halfRL]);

  const isInstalled = componentState ? componentState.isInstalled : true;
  const opacity = componentState ? componentState.opacity : 1;

  if (!isInstalled && opacity === 0) return null;

  return (
    <g
      id="v12-intake-manifolds-3d"
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
        {/* Polished White Ceramic Thermal Barrier Coating */}
        <linearGradient id="v12-ceramic-runner-white" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="28%" stopColor="#f8fafc" />
          <stop offset="60%" stopColor="#cbd5e1" />
          <stop offset="85%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Specular Glint for Tubular Sweeps */}
        <linearGradient id="v12-runner-spec-ridge" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#e2e8f0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* ── 12 CURVED HYDROFORMED CERAMIC INTAKE RUNNERS ── */}
      <g id="v12-intake-runners-tubes">
        {runners.map((r) => (
          <g key={`runner-tube-${r.bank}-${r.idx}`}>
            {/* 1. Volumetric Contact Drop Shadow */}
            <path
              d={`M ${r.ptBase.x} ${r.ptBase.y + 5}
                  C ${r.cp1.x} ${r.cp1.y + 5}, ${r.cp2.x} ${r.cp2.y + 5}, ${r.ptTop.x} ${r.ptTop.y + 5}`}
              fill="none"
              stroke="#020617"
              strokeWidth="9.5"
              strokeLinecap="round"
              opacity={0.6}
            />

            {/* 2. Main Outer Ceramic Tube Body with Curved Bézier S-Sweep */}
            <path
              d={`M ${r.ptBase.x} ${r.ptBase.y}
                  C ${r.cp1.x} ${r.cp1.y}, ${r.cp2.x} ${r.cp2.y}, ${r.ptTop.x} ${r.ptTop.y}`}
              fill="none"
              stroke="url(#v12-ceramic-runner-white)"
              strokeWidth="8.0"
              strokeLinecap="round"
            />

            {/* 3. High-Gloss Specular Highlight Curve along Upper Ridge */}
            <path
              d={`M ${r.ptBase.x} ${r.ptBase.y - 1.8}
                  C ${r.cp1.x} ${r.cp1.y - 1.8}, ${r.cp2.x} ${r.cp2.y - 1.8}, ${r.ptTop.x} ${r.ptTop.y - 1.8}`}
              fill="none"
              stroke="url(#v12-runner-spec-ridge)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* 4. TIG Weld Joint Fillet Ring at Mid-Curve */}
            <ellipse
              cx={(r.cp1.x + r.cp2.x) / 2}
              cy={(r.cp1.y + r.cp2.y) / 2}
              rx={4.8}
              ry={2.6}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="0.8"
              opacity="0.75"
            />

            {/* 5. CNC Machined Head Port Base Flange with Radiused Fillet */}
            <ellipse
              cx={r.ptBase.x}
              cy={r.ptBase.y}
              rx={7.5}
              ry={4.2}
              fill="#475569"
              stroke="#090d16"
              strokeWidth="1.0"
            />
            <ellipse
              cx={r.ptBase.x}
              cy={r.ptBase.y}
              rx={6.2}
              ry={3.2}
              fill="#334155"
              stroke="#cbd5e1"
              strokeWidth="0.6"
            />
          </g>
        ))}
      </g>
    </g>
  );
};
