import React from "react";
import type { ComponentId, AssemblyPhase, AssemblyComponentMeta } from "../../../sim/assemblyTypes";

interface AssemblyTorqueHUDOverlayProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  targetPos: { x: number; y: number };
  meta?: AssemblyComponentMeta;
}

export const AssemblyTorqueHUDOverlay: React.FC<AssemblyTorqueHUDOverlayProps> = ({
  activeComponentId,
  phase,
  targetPos,
  meta,
}) => {
  if (!activeComponentId || (phase !== "inserting" && phase !== "locking" && phase !== "confirming")) return null;

  const tx = targetPos.x;
  const ty = targetPos.y;

  const targetNm = meta?.torqueSpec?.snugNm || 100;
  const torqueNm = phase === "confirming" ? targetNm : phase === "locking" ? Math.round(targetNm * 0.85) : Math.round(targetNm * 0.5);

  const totalBolts = meta?.torqueSpec?.boltCount || 4;
  const boltProgress = phase === "confirming" ? totalBolts : phase === "locking" ? Math.ceil(totalBolts * 0.75) : Math.ceil(totalBolts * 0.35);

  const fastenerTitle = meta?.torqueSpec?.fastenerName
    ? meta.torqueSpec.fastenerName.toUpperCase()
    : "TORQUE SPEC // PRECISION";

  return (
    <g id="assembly-torque-hud-system" className="pointer-events-none z-35">
      <g transform={`translate(${tx - 110}, ${ty + 45})`}>
        {/* Main Digital Torque Control Console Container */}
        <rect x="0" y="0" width="220" height="52" rx="8" fill="#020617" stroke="#38bdf8" strokeWidth="2" opacity="0.95" />
        <rect x="3" y="3" width="214" height="46" rx="6" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.8" />

        {/* Torque Wrench Icon & Title */}
        <text x="12" y="18" fill="#38bdf8" fontSize="7" fontFamily="monospace" fontWeight="900" letterSpacing="0.5">
          {fastenerTitle.slice(0, 28)}
        </text>

        {/* Target vs Current Nm Bar Gauge */}
        <rect x="12" y="24" width="120" height="12" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <rect
          x="14"
          y="26"
          width={Math.min(116, Math.max(10, (116 * (torqueNm / targetNm))))}
          height="8"
          rx="2"
          fill={phase === "confirming" ? "#10b981" : "#f59e0b"}
        />

        {/* Live Torque Nm Value Readout */}
        <text x="140" y="34" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold">
          {torqueNm} Nm
        </text>

        {/* Sub-step Bolt Tightening Indicators */}
        <g transform="translate(180, 16)">
          {Array.from({ length: Math.min(4, totalBolts) }).map((_, bIdx) => {
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
