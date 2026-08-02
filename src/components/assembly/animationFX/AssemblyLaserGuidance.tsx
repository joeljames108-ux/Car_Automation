import React from "react";
import type { ComponentId, AssemblyPhase } from "../../../sim/assemblyTypes";

interface AssemblyLaserGuidanceProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  targetPos: { x: number; y: number };
}

export const AssemblyLaserGuidance: React.FC<AssemblyLaserGuidanceProps> = ({
  activeComponentId,
  phase,
  targetPos,
}) => {
  if (!activeComponentId || phase === "idle" || phase === "complete") return null;

  const tx = targetPos.x;
  const ty = targetPos.y;

  return (
    <g id="assembly-laser-guidance-system" className="pointer-events-none z-30">
      {/* ── 4-CORNER OPTICAL LASER ALIGNMENT BEAMS (Emitters at Top Gantry Rail Y: 25) ── */}
      <g opacity={phase === "aligning" || phase === "inserting" ? 0.95 : 0.4}>
        {/* Laser 1: Top-Left Corner */}
        <line x1={tx - 40} y1="25" x2={tx - 30} y2={ty - 15} stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="6 2">
          <animate attributeName="stroke-dashoffset" values="8;0" dur="0.4s" repeatCount="indefinite" />
        </line>

        {/* Laser 2: Top-Right Corner */}
        <line x1={tx + 40} y1="25" x2={tx + 30} y2={ty - 15} stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="6 2">
          <animate attributeName="stroke-dashoffset" values="8;0" dur="0.4s" repeatCount="indefinite" />
        </line>

        {/* Laser 3: Central Alignment Beam */}
        <line x1={tx} y1="25" x2={tx} y2={ty} stroke="#f59e0b" strokeWidth="2">
          <animate attributeName="stroke-width" values="1.5;3;1.5" dur="0.6s" repeatCount="indefinite" />
        </line>
      </g>

      {/* ── TARGET ALIGNMENT CROSSHAIRS & CONCENTRIC RETICLES ── */}
      <g transform={`translate(${tx}, ${ty})`}>
        {/* Outer Rotating Target Ring */}
        <circle cx="0" cy="0" r="32" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="12 6">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Inner Shrinking Alignment Lock Ring */}
        <circle cx="0" cy="0" r="18" fill="none" stroke="#f59e0b" strokeWidth="2">
          <animate attributeName="r" values="24;14;24" dur="1s" repeatCount="indefinite" />
        </circle>

        {/* Precision Crosshair Lines */}
        <line x1="-38" y1="0" x2="-14" y2="0" stroke="#38bdf8" strokeWidth="2" />
        <line x1="14" y1="0" x2="38" y2="0" stroke="#38bdf8" strokeWidth="2" />
        <line x1="0" y1="-38" x2="0" y2="-14" stroke="#38bdf8" strokeWidth="2" />
        <line x1="0" y1="14" x2="0" y2="38" stroke="#38bdf8" strokeWidth="2" />

        {/* Center Optical Focal Dot */}
        <circle cx="0" cy="0" r="3" fill="#ef4444" />

        {/* Digital Telemetry Coordinate Readout Badge */}
        <g transform="translate(42, -22)">
          <rect x="0" y="0" width="85" height="28" rx="4" fill="#020617" stroke="#38bdf8" strokeWidth="1.2" />
          <text x="6" y="12" fill="#38bdf8" fontSize="7" fontFamily="monospace" fontWeight="bold">
            ΔX: 0.00mm
          </text>
          <text x="6" y="22" fill="#f59e0b" fontSize="7" fontFamily="monospace" fontWeight="bold">
            {phase === "locking" ? "STATUS: LOCKED" : "STATUS: ALIGNING"}
          </text>
        </g>
      </g>
    </g>
  );
};
