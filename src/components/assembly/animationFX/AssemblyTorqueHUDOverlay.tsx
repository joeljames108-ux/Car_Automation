import React from "react";
import type { ComponentId, AssemblyPhase } from "../../../sim/assemblyTypes";

interface AssemblyTorqueHUDOverlayProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  targetPos: { x: number; y: number };
}

export const AssemblyTorqueHUDOverlay: React.FC<AssemblyTorqueHUDOverlayProps> = ({
  activeComponentId,
  phase,
  targetPos,
}) => {
  if (!activeComponentId || (phase !== "inserting" && phase !== "locking" && phase !== "confirming")) return null;

  const tx = targetPos.x;
  const ty = targetPos.y;

  const torqueNm = phase === "confirming" ? 145 : phase === "locking" ? 120 : 75;
  const boltProgress = phase === "confirming" ? 4 : phase === "locking" ? 3 : 2;

  return (
    <g id="assembly-torque-hud-system" className="pointer-events-none z-35">
      <g transform={`translate(${tx - 110}, ${ty + 45})`}>
        {/* Main Digital Torque Control Console Container */}
        <rect x="0" y="0" width="220" height="52" rx="8" fill="#020617" stroke="#38bdf8" strokeWidth="2" opacity="0.95" />
        <rect x="3" y="3" width="214" height="46" rx="6" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.8" />

        {/* Torque Wrench Icon & Title */}
        <text x="12" y="18" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="900" letterSpacing="1">
          TORQUE CONTROL // ARP SPEC
        </text>

        {/* Target vs Current Nm Bar Gauge */}
        <rect x="12" y="24" width="120" height="12" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <rect
          x="14"
          y="26"
          width={(116 * (torqueNm / 145))}
          height="8"
          rx="2"
          fill={phase === "confirming" ? "#10b981" : "#f59e0b"}
        />

        {/* Live Torque Nm Value Readout */}
        <text x="140" y="34" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold">
          {torqueNm} Nm
        </text>

        {/* Sub-step Bolt Tightening Indicators (4x Perimeter Bolts) */}
        <g transform="translate(180, 16)">
          {[0, 1, 2, 3].map((bIdx) => {
            const isDone = bIdx < boltProgress;
            const bx = (bIdx % 2) * 14;
            const by = Math.floor(bIdx / 2) * 14;

            return (
              <circle
                key={bIdx}
                cx={bx}
                cy={by}
                r="5"
                fill={isDone ? "#10b981" : "#020617"}
                stroke={isDone ? "#090d16" : "#64748b"}
                strokeWidth="1.2"
              />
            );
          })}
        </g>
      </g>
    </g>
  );
};
