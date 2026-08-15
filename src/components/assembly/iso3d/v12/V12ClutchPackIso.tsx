import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12ClutchPackIsoProps {
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
 * PHASE 16 — MULTI-PLATE WET CARBON-CERAMIC CLUTCH PACK
 * ═══════════════════════════════════════════════════════════════════
 *
 * Heavy-Duty Multi-Plate Wet Dual-Clutch Pack with Carbon-Ceramic Friction
 * Discs and Belleville Diaphragm Spring Fingers matching the illustration.
 *
 * Mechanical Details:
 *  1. Triple-Plate Carbon-Ceramic Sintered Friction Discs (1,400 Nm Torque Capacity)
 *  2. Forged 7075-T6 Billet Aluminum Anodized Pressure Plate Housing
 *  3. Spring Steel Belleville Diaphragm Spring Fingers with Radiused Pivot Ring
 *  4. Hydraulic Throwout Release Bearing Guide Sleeve
 *  5. Hardened Chromoly Splined Input Shaft Hub Interface
 */
export const V12ClutchPackIso: React.FC<V12ClutchPackIsoProps> = ({
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

  // Clutch Pack Center (Mounted on Flywheel at X = halfBL + 22, Y = 0, Z = 28)
  const clutchCenter = useMemo(() => P(halfBL + 22, 0, 28), [P, halfBL]);

  return (
    <g
      id="v12-clutch-pack-assembly-3d"
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
      {/* ── 1. DEFINITIONS FOR CLUTCH GRADIENTS ── */}
      <defs>
        {/* Anodized Pressure Plate Housing */}
        <radialGradient id="v12-clutch-cover-anodized" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="40%" stopColor="#334155" />
          <stop offset="80%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>

        {/* Diaphragm Spring Steel Fingers */}
        <linearGradient id="v12-diaphragm-fingers" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="40%" stopColor="#94a3b8" />
          <stop offset="80%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      {/* ── 2. CLUTCH PRESSURE PLATE COVER & DIAPHRAGM SPRINGS ── */}
      <g id="v12-clutch-housing">
        {/* Outer Pressure Plate Ring */}
        <ellipse
          cx={clutchCenter.x}
          cy={clutchCenter.y}
          rx={28}
          ry={34}
          fill="url(#v12-clutch-cover-anodized)"
          stroke="#090d16"
          strokeWidth="1.8"
        />

        {/* Outer Mounting Fasteners (12x perimeter bolts) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const rad = (i * 30 * Math.PI) / 180;
          const bx = clutchCenter.x + 25 * Math.cos(rad);
          const by = clutchCenter.y + 30 * Math.sin(rad);
          return (
            <circle key={`clutch-bolt-${i}`} cx={bx} cy={by} r={1.4} fill="#cbd5e1" stroke="#334155" strokeWidth="0.4" />
          );
        })}

        {/* Diaphragm Spring Inner Cone */}
        <ellipse
          cx={clutchCenter.x}
          cy={clutchCenter.y}
          rx={20}
          ry={24}
          fill="url(#v12-diaphragm-fingers)"
          stroke="#090d16"
          strokeWidth="1.4"
        />

        {/* 18 Radial Diaphragm Spring Fingers */}
        {Array.from({ length: 18 }).map((_, i) => {
          const rad = (i * 20 * Math.PI) / 180;
          const p1x = clutchCenter.x + 8 * Math.cos(rad);
          const p1y = clutchCenter.y + 10 * Math.sin(rad);
          const p2x = clutchCenter.x + 19 * Math.cos(rad);
          const p2y = clutchCenter.y + 23 * Math.sin(rad);
          return (
            <line
              key={`diaphragm-finger-${i}`}
              x1={p1x}
              y1={p1y}
              x2={p2x}
              y2={p2y}
              stroke="#020617"
              strokeWidth="1.2"
            />
          );
        })}

        {/* Central Release Bearing / Throwout Sleeve Hub */}
        <ellipse
          cx={clutchCenter.x}
          cy={clutchCenter.y}
          rx={7.5}
          ry={9.5}
          fill="#090d16"
          stroke="#38bdf8"
          strokeWidth="1.2"
        />
        <circle cx={clutchCenter.x} cy={clutchCenter.y} r={3.5} fill="#020617" stroke="#cbd5e1" strokeWidth="0.8" />
      </g>
    </g>
  );
};
