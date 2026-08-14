import React from "react";

interface ChassisStressHeatmapProps {
  isVisible?: boolean;
}

export const ChassisStressHeatmap: React.FC<ChassisStressHeatmapProps> = ({ isVisible = false }) => {
  if (!isVisible) return null;

  return (
    <g id="fea-stress-heatmap-overlay" className="pointer-events-none transition-all duration-500 animate-pulse">
      {/* FEA Stress Gradient Bands across A-Pillar, Rocker Sill, and Subframe Joints */}
      <path
        d="M 290 210 C 335 178 375 155 420 145"
        fill="none"
        stroke="url(#fea-stress-gradient)"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M 635 140 C 695 160 760 185 810 210"
        fill="none"
        stroke="url(#fea-stress-gradient)"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.85"
      />
      <rect x="295" y="258" width="347" height="18" fill="url(#fea-stress-gradient)" opacity="0.65" />

      {/* Peak Torsional Flex Stress Hotspots (Red Warning Nodes) */}
      <circle cx="290" cy="210" r="18" fill="#ef4444" opacity="0.6" className="animate-ping" />
      <circle cx="615" cy="130" r="18" fill="#ef4444" opacity="0.6" className="animate-ping" />
      <circle cx="515" cy="258" r="18" fill="#f59e0b" opacity="0.6" />

      {/* Telemetry Legend Overlay */}
      <g transform="translate(720, 30)">
        <rect x="0" y="0" width="180" height="35" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" opacity="0.9" />
        <rect x="10" y="20" width="160" height="6" rx="3" fill="url(#fea-stress-gradient)" />
        <text x="90" y="14" fill="#f8fafc" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          FEA TORSIONAL STRESS (0-45,000 Nm/deg)
        </text>
      </g>
    </g>
  );
};
