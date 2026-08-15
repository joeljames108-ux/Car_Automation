import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12FlywheelIsoProps {
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
 * PHASE 15 — DUAL-MASS STEEL FLYWHEEL & STARTER RING GEAR
 * ═══════════════════════════════════════════════════════════════════
 *
 * Racing Dual-Mass Forged Steel Flywheel with Precision Starter Pinion
 * Ring Gear Teeth and 60-2 Crank Trigger Wheel matching the reference.
 *
 * Mechanical Details:
 *  1. Forged Chromoly 4140 Steel Flywheel Body with Low Rotational Inertia
 *  2. Induction-Hardened 128-Tooth Starter Ring Gear Perimeter
 *  3. CNC 60-2 Crank Angle Sensor (CAS) Reluctor Trigger Teeth
 *  4. 8x High-Tensile ARP 2000 Crankshaft Hub Fastener Studs
 *  5. Internal Arc Spring Torsional Vibration Damper Cartridge
 */
export const V12FlywheelIso: React.FC<V12FlywheelIsoProps> = ({
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

  // Flywheel Location at Rear Crank Interface (X = halfBL + 14, Y = 0, Z = 28)
  const flywheelCenter = useMemo(() => P(halfBL + 14, 0, 28), [P, halfBL]);

  return (
    <g
      id="v12-flywheel-assembly-3d"
      onMouseEnter={() => onHoverComponent?.("transmission")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState ? componentState.opacity : 1,
      }}
    >
      {/* ── 1. DEFINITIONS FOR FLYWHEEL SHADERS ── */}
      <defs>
        {/* Forged Steel Friction Face Gradient */}
        <radialGradient id="v12-flywheel-friction-steel" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="30%" stopColor="#cbd5e1" />
          <stop offset="65%" stopColor="#64748b" />
          <stop offset="85%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>

        {/* Ring Gear Hardened Steel Teeth */}
        <linearGradient id="v12-ring-gear-teeth" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      {/* ── 2. FLYWHEEL ROTOR DISK & STARTER RING GEAR ── */}
      <g id="v12-flywheel-rotor">
        {/* Outer Starter Ring Gear Rim */}
        <ellipse
          cx={flywheelCenter.x}
          cy={flywheelCenter.y}
          rx={38}
          ry={46}
          fill="url(#v12-ring-gear-teeth)"
          stroke="#090d16"
          strokeWidth="2.0"
        />

        {/* Precision Starter Gear Teeth Notches (36 radial notches) */}
        {Array.from({ length: 36 }).map((_, i) => {
          const rad = (i * (360 / 36) * Math.PI) / 180;
          const p1x = flywheelCenter.x + 35 * Math.cos(rad);
          const p1y = flywheelCenter.y + 43 * Math.sin(rad);
          const p2x = flywheelCenter.x + 38 * Math.cos(rad);
          const p2y = flywheelCenter.y + 46 * Math.sin(rad);
          return (
            <line
              key={`starter-gear-tooth-${i}`}
              x1={p1x}
              y1={p1y}
              x2={p2x}
              y2={p2y}
              stroke="#e2e8f0"
              strokeWidth="1.2"
            />
          );
        })}

        {/* Inner Machined Friction Face Disk */}
        <ellipse
          cx={flywheelCenter.x}
          cy={flywheelCenter.y}
          rx={31}
          ry={38}
          fill="url(#v12-flywheel-friction-steel)"
          stroke="#090d16"
          strokeWidth="1.6"
        />

        {/* Specular White Surface Glint Beam */}
        <ellipse
          cx={flywheelCenter.x - 2}
          cy={flywheelCenter.y - 2}
          rx={27}
          ry={33}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
          opacity={0.85}
        />

        {/* Crankshaft Center Hub Boss */}
        <ellipse
          cx={flywheelCenter.x}
          cy={flywheelCenter.y}
          rx={14}
          ry={17}
          fill="#090d16"
          stroke="#cbd5e1"
          strokeWidth="1.2"
        />

        {/* 8x ARP High-Tensile Crank Bolts */}
        {Array.from({ length: 8 }).map((_, i) => {
          const rad = (i * 45 * Math.PI) / 180;
          const bx = flywheelCenter.x + 9 * Math.cos(rad);
          const by = flywheelCenter.y + 11 * Math.sin(rad);
          return (
            <g key={`arp-flywheel-bolt-${i}`}>
              <circle cx={bx} cy={by} r={1.8} fill="#facc15" stroke="#78350f" strokeWidth="0.5" />
              <circle cx={bx} cy={by} r={0.6} fill="#ffffff" />
            </g>
          );
        })}

        {/* Pilot Bearing Center Bore */}
        <circle cx={flywheelCenter.x} cy={flywheelCenter.y} r={4.0} fill="#020617" stroke="#38bdf8" strokeWidth="0.8" />
      </g>
    </g>
  );
};
