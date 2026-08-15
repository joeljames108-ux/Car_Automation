import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12DrySumpPanIsoProps {
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
 * PHASE 3 — BILLET LOW-PROFILE DRY-SUMP SCAVENGE PAN
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ultra-low profile CNC 6061-T6 aluminum dry-sump oil pan with
 * radiused corners, sculpted parabolic floor drafts, and 4-stage
 * internal scavenge port sumps.
 */
export const V12DrySumpPanIso: React.FC<V12DrySumpPanIsoProps> = ({
  originScreen = { x: 290, y: 245 },
  explodedAmount = 0,
  componentState,
  onHoverComponent,
}) => {
  const expZ = explodedAmount * -38; // Floats downward (-Z) in exploded view

  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y, z: z + expZ }, originScreen),
    [originScreen, expZ]
  );

  const blockLength = 236;
  const halfBL = blockLength / 2;
  const panWidth = 74;
  const panDepth = 26;

  const geometry = useMemo(() => {
    // Top Pan Mounting Rail (snaps to lower bedplate rail at Z=0)
    const tFL = P(-halfBL, panWidth / 2, 0);
    const tFR = P(halfBL, panWidth / 2, 0);
    const tBL = P(-halfBL, -panWidth / 2, 0);
    const tBR = P(halfBL, -panWidth / 2, 0);

    // Bottom Pan Floor (Z = -panDepth) with sculpted CNC draft
    const bFL = P(-halfBL + 8, panWidth / 2 - 4, -panDepth);
    const bFR = P(halfBL - 8, panWidth / 2 - 4, -panDepth);
    const bBL = P(-halfBL + 8, -panWidth / 2 + 4, -panDepth);
    const bBR = P(halfBL - 8, -panWidth / 2 + 4, -panDepth);

    // 4 Scavenge Port Pickups along the Left Flank
    const scavengePorts: ScreenPoint2D[] = [];
    for (let i = 0; i < 4; i++) {
      const px = -halfBL + 32 + i * ((blockLength - 64) / 3);
      scavengePorts.push(P(px, panWidth / 2 - 2, -panDepth / 2));
    }

    // Magnetic Drain Plug
    const drainPlug = P(halfBL - 18, panWidth / 2 - 2, -panDepth + 4);

    return {
      tFL, tFR, tBL, tBR,
      bFL, bFR, bBL, bBR,
      scavengePorts,
      drainPlug,
    };
  }, [P, blockLength, halfBL, panWidth, panDepth]);

  const isInstalled = componentState ? componentState.isInstalled : true;
  const opacity = componentState ? componentState.opacity : 1;

  if (!isInstalled && opacity === 0) return null;

  return (
    <g
      id="v12-dry-sump-pan-3d"
      onMouseEnter={() => onHoverComponent?.("oil_pan")}
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
        <linearGradient id="v12-dry-pan-billet" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="30%" stopColor="#475569" />
          <stop offset="70%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        <linearGradient id="v12-dry-pan-floor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* ── 1. FRONT PAN WALL WITH PARABOLIC BOTTOM FILLET ── */}
      <path
        d={`M ${geometry.tFL.x} ${geometry.tFL.y}
            L ${geometry.tFR.x} ${geometry.tFR.y}
            L ${geometry.bFR.x} ${geometry.bFR.y}
            Q ${(geometry.bFR.x + geometry.bFL.x) / 2} ${geometry.bFL.y + 4} ${geometry.bFL.x} ${geometry.bFL.y}
            Z`}
        fill="url(#v12-dry-pan-billet)"
        stroke="#090d16"
        strokeWidth="1.8"
      />

      {/* ── 2. REAR RIGHT WALL ── */}
      <path
        d={`M ${geometry.tFR.x} ${geometry.tFR.y}
            L ${geometry.tBR.x} ${geometry.tBR.y}
            L ${geometry.bBR.x} ${geometry.bBR.y}
            L ${geometry.bFR.x} ${geometry.bFR.y}
            Z`}
        fill="url(#v12-dry-pan-billet)"
        stroke="#090d16"
        strokeWidth="1.8"
        opacity="0.85"
      />

      {/* ── 3. BOTTOM SCULPTED CNC FLOOR ── */}
      <path
        d={`M ${geometry.bFL.x} ${geometry.bFL.y}
            L ${geometry.bFR.x} ${geometry.bFR.y}
            L ${geometry.bBR.x} ${geometry.bBR.y}
            L ${geometry.bBL.x} ${geometry.bBL.y}
            Z`}
        fill="url(#v12-dry-pan-floor)"
        stroke="#090d16"
        strokeWidth="1.5"
      />

      {/* ── 4. 4 CNC SCAVENGE PORT FITTINGS (Gold AN-12 Bosses) ── */}
      {geometry.scavengePorts.map((pt, idx) => (
        <g key={`scavenge-port-${idx}`}>
          <circle cx={pt.x} cy={pt.y} r={4.5} fill="#ca8a04" stroke="#090d16" strokeWidth="1.0" />
          <circle cx={pt.x} cy={pt.y} r={2.2} fill="#090d16" stroke="#fef08a" strokeWidth="0.6" />
        </g>
      ))}

      {/* ── 5. MAGNETIC DRAIN PLUG ── */}
      <g transform={`translate(${geometry.drainPlug.x}, ${geometry.drainPlug.y})`}>
        <circle cx={0} cy={0} r={4.8} fill="#b45309" stroke="#090d16" strokeWidth="1.0" />
        <circle cx={0} cy={0} r={2.5} fill="#f59e0b" stroke="#ffffff" strokeWidth="0.5" />
      </g>
    </g>
  );
};
