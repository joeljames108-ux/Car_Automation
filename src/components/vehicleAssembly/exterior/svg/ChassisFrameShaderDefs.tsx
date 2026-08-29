// ===================================================================
// CHASSIS FRAME & STRUCTURAL SVG SHADER & MATERIAL DEFINITIONS
// ===================================================================
// Rich SVG <defs> containing procedural gradients, spot welding glow,
// carbon fiber twill patterns, machined aluminum striations, and laser guides.
// ===================================================================

import React from "react";
import type { MaterialGrade } from "../../../../sim/assemblyTypes";

interface ChassisFrameShaderDefsProps {
  materialGrade?: MaterialGrade;
  isWelding?: boolean;
}

export const ChassisFrameShaderDefs: React.FC<ChassisFrameShaderDefsProps> = ({
  materialGrade = "billet",
  isWelding = false,
}) => {
  return (
    <defs>
      {/* ── 1. Metallic Tube & Rail Linear Gradients ── */}
      <linearGradient id="chassisRailSteel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="30%" stopColor="#64748b" />
        <stop offset="50%" stopColor="#94a3b8" />
        <stop offset="70%" stopColor="#475569" />
        <stop offset="100%" stopColor="#1e293b" />
      </linearGradient>

      <linearGradient id="chassisRailAluminum" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="25%" stopColor="#cbd5e1" />
        <stop offset="50%" stopColor="#f1f5f9" />
        <stop offset="75%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>

      <linearGradient id="chassisRailCarbon" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#090d16" />
        <stop offset="30%" stopColor="#1e293b" />
        <stop offset="50%" stopColor="#334155" />
        <stop offset="70%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>

      <linearGradient id="chassisRailTitanium" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6b7280" />
        <stop offset="20%" stopColor="#fbbf24" />
        <stop offset="45%" stopColor="#fbbf24" />
        <stop offset="65%" stopColor="#fbbf24" />
        <stop offset="85%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#4b5563" />
      </linearGradient>

      {/* ── 2. Floor Pan Stamped Sheet Gradients ── */}
      <linearGradient id="chassisFloorPanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
        <stop offset="50%" stopColor="#0f172a" stopOpacity="0.98" />
        <stop offset="100%" stopColor="#020617" stopOpacity="1.0" />
      </linearGradient>

      <linearGradient id="chassisTunnelGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.0" />
        <stop offset="50%" stopColor="#0284c7" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
      </linearGradient>

      {/* ── 3. Structural Node & Fastener Gradients ── */}
      <radialGradient id="chassisNodeBolt" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="40%" stopColor="#94a3b8" />
        <stop offset="80%" stopColor="#475569" />
        <stop offset="100%" stopColor="#0f172a" />
      </radialGradient>

      <radialGradient id="chassisWeldNugget" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fed7aa" />
        <stop offset="35%" stopColor="#f97316" />
        <stop offset="70%" stopColor="#c2410c" />
        <stop offset="100%" stopColor="#431407" />
      </radialGradient>

      {/* ── 4. Spot Welding & Laser Glow Filters ── */}
      <filter id="chassisWeldingGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="chassisLaserGuide" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* ── 5. Carbon Fiber 2x2 Twill Pattern ── */}
      <pattern id="chassisCarbonPattern" width="8" height="8" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#0f172a" />
        <path d="M0 0 L4 0 L8 4 L8 8 L4 8 L0 4 Z" fill="#1e293b" opacity="0.6" />
        <path d="M4 0 L8 0 L4 4 L0 4 Z" fill="#334155" opacity="0.4" />
        <path d="M0 4 L4 4 L8 8 L4 8 Z" fill="#334155" opacity="0.4" />
      </pattern>

      {/* ── 6. Aluminum Honeycomb Core Pattern ── */}
      <pattern id="chassisHoneycombPattern" width="12" height="10.392" patternUnits="userSpaceOnUse">
        <path
          d="M0 5.196 L3 0 L9 0 L12 5.196 L9 10.392 L3 10.392 Z"
          fill="none"
          stroke="#475569"
          strokeWidth="0.75"
          opacity="0.4"
        />
      </pattern>
    </defs>
  );
};
