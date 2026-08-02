import React from "react";
import type { ComponentId, AssemblyPhase } from "../../../sim/assemblyTypes";

interface AssemblySparkFlashesProps {
  activeComponentId: ComponentId | null;
  phase: AssemblyPhase;
  targetPos: { x: number; y: number };
}

export const AssemblySparkFlashes: React.FC<AssemblySparkFlashesProps> = ({
  activeComponentId,
  phase,
  targetPos,
}) => {
  if (!activeComponentId || (phase !== "locking" && phase !== "confirming")) return null;

  const tx = targetPos.x;
  const ty = targetPos.y;

  // Generate 16 radial spark lines radiating outwards from impact target
  const sparks = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i * 22.5 * Math.PI) / 180;
    const distance = 25 + (i % 3) * 15;
    const ex = tx + distance * Math.cos(angle);
    const ey = ty + distance * Math.sin(angle);

    return {
      x1: tx,
      y1: ty,
      x2: ex,
      y2: ey,
      color: i % 2 === 0 ? "#f59e0b" : "#38bdf8",
    };
  });

  return (
    <g id="assembly-spark-flashes-system" className="pointer-events-none z-50">
      {/* Expanding Shockwave Pressure Rings */}
      <circle cx={tx} cy={ty} r="10" fill="none" stroke="#38bdf8" strokeWidth="4" opacity="0.8">
        <animate attributeName="r" values="10;55;80" dur="0.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.3;0" dur="0.5s" repeatCount="indefinite" />
      </circle>

      <circle cx={tx} cy={ty} r="5" fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.9">
        <animate attributeName="r" values="5;40;65" dur="0.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.4;0" dur="0.4s" repeatCount="indefinite" />
      </circle>

      {/* Central Impact High-Intensity Arc Flash */}
      <circle cx={tx} cy={ty} r="16" fill="#ffffff" filter="drop-shadow(0 0 15px #38bdf8)">
        <animate attributeName="opacity" values="1;0.2;1" dur="0.15s" repeatCount="indefinite" />
      </circle>

      {/* Radial Kinetic Spark Rays */}
      {sparks.map((spark, index) => (
        <line
          key={index}
          x1={spark.x1}
          y1={spark.y1}
          x2={spark.x2}
          y2={spark.y2}
          stroke={spark.color}
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <animate attributeName="stroke-dasharray" values="0 50; 50 0" dur="0.3s" repeatCount="indefinite" />
        </line>
      ))}
    </g>
  );
};
