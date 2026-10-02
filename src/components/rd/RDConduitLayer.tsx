// ===================================================================
// R&D CONDUIT LAYER — GLOWING SVG CABLES & POWER FLOW SYSTEM (Photo 2)
// High-tech illuminated conduits with directional flow and pulse glow
// ===================================================================
import React from "react";
import { ConduitConnection } from "../../sim/rdTreeLayoutEngine";

interface RDConduitLayerProps {
  conduits: ConduitConnection[];
  width: number;
  height: number;
  hubX?: number; // Center X of the top R&D HUB badge
  hubY?: number; // Bottom Y of the top R&D HUB badge
}

export const RDConduitLayer: React.FC<RDConduitLayerProps> = ({
  conduits,
  width,
  height,
  hubX = 450,
  hubY = 40,
}) => {
  return (
    <svg
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-10 overflow-visible"
    >
      <defs>
        {/* Soft Ambient Glow Filter */}
        <filter id="conduit-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Directional Arrow Markers */}
        <marker
          id="arrow-cyan"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
        </marker>

        <marker
          id="arrow-purple"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#c084fc" />
        </marker>

        <marker
          id="arrow-emerald"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#34d399" />
        </marker>

        <marker
          id="arrow-slate"
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#475569" />
        </marker>

        {/* Glowing Linear Gradients */}
        <linearGradient id="cyan-conduit-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="1" />
        </linearGradient>

        <linearGradient id="purple-conduit-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* ─────────────────────────────────────────────────────────────
          TOP R&D HUB BRANCHING FEEDER CABLES (Photo 2 Top Header Conduits)
      ───────────────────────────────────────────────────────────── */}
      <g opacity="0.85">
        {/* Center trunk down to top nodes */}
        <path
          d={`M ${hubX - 25} ${hubY} C ${hubX - 25} ${hubY + 25}, 395 30, 395 50`}
          fill="none"
          stroke="#475569"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <path
          d={`M ${hubX + 25} ${hubY} C ${hubX + 25} ${hubY + 25}, 650 30, 650 50`}
          fill="none"
          stroke="#475569"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      </g>

      {/* ─────────────────────────────────────────────────────────────
          INTER-NODE CONDUIT PATHS
      ───────────────────────────────────────────────────────────── */}
      {conduits.map((conduit) => {
        let strokeColor = "#334155";
        let glowColor = "transparent";
        let markerId = "arrow-slate";
        let isAnimated = false;
        let strokeWidth = 1.5;

        switch (conduit.colorTheme) {
          case "cyan":
            strokeColor = "#38bdf8";
            glowColor = "rgba(56, 189, 248, 0.45)";
            markerId = "arrow-cyan";
            strokeWidth = 2.2;
            isAnimated = conduit.state === "unlocked" || conduit.state === "researching";
            break;

          case "purple":
            strokeColor = "#c084fc";
            glowColor = "rgba(192, 132, 252, 0.45)";
            markerId = "arrow-purple";
            strokeWidth = 2.2;
            isAnimated = conduit.state === "unlocked" || conduit.state === "researching";
            break;

          case "emerald":
            strokeColor = "#34d399";
            glowColor = "rgba(52, 211, 153, 0.45)";
            markerId = "arrow-emerald";
            strokeWidth = 2.2;
            isAnimated = conduit.state === "unlocked";
            break;

          default:
            strokeColor = "#334155";
            glowColor = "transparent";
            markerId = "arrow-slate";
            strokeWidth = 1.5;
            break;
        }

        return (
          <g key={conduit.id}>
            {/* Ambient Background Glow Layer */}
            {conduit.state !== "locked" && (
              <path
                d={conduit.pathD}
                fill="none"
                stroke={glowColor}
                strokeWidth={strokeWidth + 5}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#conduit-glow)"
              />
            )}

            {/* Core Solid Illuminated Conduit */}
            <path
              d={conduit.pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd={`url(#${markerId})`}
            />

            {/* Live Flowing Energy Pulse Dash */}
            {isAnimated && (
              <path
                d={conduit.pathD}
                fill="none"
                stroke="#ffffff"
                strokeWidth={strokeWidth * 0.8}
                strokeDasharray="6 18"
                strokeLinecap="round"
                className="animate-[pulse_2s_ease-in-out_infinite]"
                opacity="0.9"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
