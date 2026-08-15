import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, type ScreenPoint2D } from "../isoMath";

interface V12DrySumpPanIsoProps {
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
 * PHASE 3 — BILLET LOW-PROFILE DRY-SUMP SCAVENGE PAN
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ultra-low profile CNC 6061-T6 aluminum dry-sump oil pan designed
 * for extreme G-load oil control in racing conditions.
 *
 * Features:
 *  1. Low-Profile (42mm overall depth) Billet Sump Trough
 *  2. 4-Stage Internal Scavenge Pickups with Directional Screens
 *  3. Crank Scraper Knife-Edge Ribs for Aerodynamic Windage Loss Reduction
 *  4. Magnetic Sump Drain Plug with Copper Crush Washer
 *  5. 24x Perimeter M8 Stainless Allen Bolt Fasteners
 */
export const V12DrySumpPanIso: React.FC<V12DrySumpPanIsoProps> = ({
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
  const panWidth = 74;
  const panDepth = 26; // Z downward offset

  const geometry = useMemo(() => {
    // Top Pan Mounting Rail (snaps to lower bedplate rail at Z=0)
    const tFL = P(-halfBL, panWidth / 2, 0);
    const tFR = P(halfBL, panWidth / 2, 0);
    const tBL = P(-halfBL, -panWidth / 2, 0);
    const tBR = P(halfBL, -panWidth / 2, 0);

    // Bottom Pan Floor (Z = -panDepth)
    const bFL = P(-halfBL + 6, panWidth / 2 - 4, -panDepth);
    const bFR = P(halfBL - 6, panWidth / 2 - 4, -panDepth);
    const bBL = P(-halfBL + 6, -panWidth / 2 + 4, -panDepth);
    const bBR = P(halfBL - 6, -panWidth / 2 + 4, -panDepth);

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

  return (
    <g
      id="v12-dry-sump-pan-3d"
      onMouseEnter={() => onHoverComponent?.("oil_pan")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState ? componentState.opacity : 1,
      }}
    >
      {/* ── 1. PAN GRADIENTS ── */}
      <defs>
        <linearGradient id="v12-dry-pan-billet" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="30%" stopColor="#475569" />
          <stop offset="70%" stopColor="#334155" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        <linearGradient id="v12-dry-pan-floor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="60%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>

      {/* ── 2. PAN SIDE & FRONT FACETS ── */}
      <g id="v12-pan-outer-hull">
        {/* Front Pan Wall */}
        <polygon
          points={`${geometry.bFL.x},${geometry.bFL.y} ${geometry.bFR.x},${geometry.bFR.y} ${geometry.tFR.x},${geometry.tFR.y} ${geometry.tFL.x},${geometry.tFL.y}`}
          fill="url(#v12-dry-pan-billet)"
          stroke="#090d16"
          strokeWidth="2.0"
        />
        {/* Right Pan Wall */}
        <polygon
          points={`${geometry.bFR.x},${geometry.bFR.y} ${geometry.bBR.x},${geometry.bBR.y} ${geometry.tBR.x},${geometry.tBR.y} ${geometry.tFR.x},${geometry.tFR.y}`}
          fill="url(#v12-dry-pan-billet)"
          stroke="#090d16"
          strokeWidth="2.0"
          opacity={0.88}
        />
        {/* Bottom Pan Floor */}
        <polygon
          points={`${geometry.bFL.x},${geometry.bFL.y} ${geometry.bFR.x},${geometry.bFR.y} ${geometry.bBR.x},${geometry.bBR.y} ${geometry.bBL.x},${geometry.bBL.y}`}
          fill="url(#v12-dry-pan-floor)"
          stroke="#090d16"
          strokeWidth="1.8"
        />

        {/* Specular Front Rim Glint */}
        <line
          x1={geometry.bFL.x}
          y1={geometry.bFL.y}
          x2={geometry.bFR.x}
          y2={geometry.bFR.y}
          stroke="#cbd5e1"
          strokeWidth="1.4"
          opacity={0.85}
        />
      </g>

      {/* ── 3. 4 SCAVENGE SUCTION PORT BOSSES ── */}
      <g id="v12-scavenge-port-bosses">
        {geometry.scavengePorts.map((sp, idx) => (
          <g key={`scavenge-port-boss-${idx}`}>
            {/* Threaded Boss Port */}
            <ellipse cx={sp.x} cy={sp.y} rx={6.5} ry={4.0} fill="#090d16" stroke="url(#gold-anodized)" strokeWidth="1.2" />
            <ellipse cx={sp.x} cy={sp.y} rx={4.5} ry={2.5} fill="#020617" stroke="#38bdf8" strokeWidth="0.8" />
            <circle cx={sp.x} cy={sp.y} r={1.5} fill="#38bdf8" />
          </g>
        ))}
      </g>

      {/* ── 4. MAGNETIC DRAIN PLUG ── */}
      <g id="v12-pan-drain-plug">
        <ellipse cx={geometry.drainPlug.x} cy={geometry.drainPlug.y} rx={5.0} ry={3.2} fill="#d97706" stroke="#78350f" strokeWidth="1.0" />
        <ellipse cx={geometry.drainPlug.x} cy={geometry.drainPlug.y - 1} rx={3.5} ry={2.0} fill="#f59e0b" />
        <circle cx={geometry.drainPlug.x} cy={geometry.drainPlug.y - 1} r={1.0} fill="#ffffff" />
      </g>

      {/* ── 5. CNC STIFFENING LONGITUDINAL RIBS ── */}
      <g id="v12-pan-longitudinal-ribs" opacity={0.6}>
        {[-8, 0, 8].map((offsetY, idx) => {
          const rL = P(-halfBL + 20, offsetY, -panDepth + 2);
          const rR = P(halfBL - 20, offsetY, -panDepth + 2);
          return (
            <line
              key={`pan-rib-${idx}`}
              x1={rL.x}
              y1={rL.y}
              x2={rR.x}
              y2={rR.y}
              stroke="#64748b"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          );
        })}
      </g>
    </g>
  );
};
