import React from "react";
import type { ComponentId, AssemblyPhase } from "../../../sim/assemblyTypes";

interface AssemblyTrajectoryOverlayProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  targetPos: { x: number; y: number };
  startPos?: { x: number; y: number };
}

export const AssemblyTrajectoryOverlay: React.FC<AssemblyTrajectoryOverlayProps> = ({
  activeComponentId,
  phase,
  targetPos,
  startPos = { x: 50, y: 380 },
}) => {
  if (!activeComponentId || phase === "idle" || phase === "complete") return null;

  // Calculate 3D Bezier curve control points
  const sx = startPos.x;
  const sy = startPos.y;
  const tx = targetPos.x;
  const ty = targetPos.y;

  const controlX1 = sx + (tx - sx) * 0.25;
  const controlY1 = Math.min(sy, ty) - 120;
  const controlX2 = sx + (tx - sx) * 0.75;
  const controlY2 = Math.min(sy, ty) - 80;

  const pathD = `M ${sx} ${sy} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${tx} ${ty}`;

  return (
    <g id="assembly-trajectory-system" className="pointer-events-none z-20">
      {/* ── 3D FLIGHT PATH GRADIENT DEFINITIONS ── */}
      <defs>
        <linearGradient id="trajectory-glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
        </linearGradient>

        <filter id="trajectory-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>

      {/* Outer Glow Halo Trajectory Line */}
      <path
        d={pathD}
        fill="none"
        stroke="url(#trajectory-glow)"
        strokeWidth="6"
        filter="url(#trajectory-blur)"
        opacity="0.6"
      />

      {/* Main Crisp Dashed Bezier Flight Path */}
      <path
        d={pathD}
        fill="none"
        stroke="url(#trajectory-glow)"
        strokeWidth="2.5"
        strokeDasharray="8 4"
      >
        <animate attributeName="stroke-dashoffset" values="24;0" dur="0.8s" repeatCount="indefinite" />
      </path>

      {/* Start Tray Waypoint Anchor Ring */}
      <circle cx={sx} cy={sy} r="8" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.7">
        <animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx={sx} cy={sy} r="3" fill="#38bdf8" />

      {/* Waypoint Anchor Ring */}
      <circle cx={sx} cy={sy} r="3" fill="#38bdf8" />
    </g>
  );
};
