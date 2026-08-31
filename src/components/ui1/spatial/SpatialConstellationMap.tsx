import React from "react";
import { Stage } from "../../StageSwitcher";
import { Compass, Orbit, Zap } from "lucide-react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export interface ConstellationNode {
  id: Stage;
  label: string;
  x: number; // percentage in SVG coordinate [0-100]
  y: number;
  hue: number;
  domain: string;
}

export const CONSTELLATION_NODES: ConstellationNode[] = [
  { id: "engine", label: "ENGINE", x: 50, y: 15, hue: 200, domain: "Front · 0°" },
  { id: "aero", label: "AERO", x: 20, y: 35, hue: 190, domain: "Upper-Left · +45°" },
  { id: "vehicle", label: "CHASSIS", x: 15, y: 65, hue: 220, domain: "Left Flank · -90°" },
  { id: "transmission3d", label: "DRIVETRAIN", x: 85, y: 65, hue: 155, domain: "Right Flank · +90°" },
  { id: "simulation", label: "SIMULATION", x: 80, y: 35, hue: 350, domain: "Upper-Right · +45°" },
  { id: "interior", label: "INTERIOR", x: 50, y: 85, hue: 280, domain: "Rear Antipode · 180°" },
  { id: "manufacturing", label: "ASSEMBLY", x: 50, y: 50, hue: 45, domain: "Center Core · 0°" },
  { id: "ai", label: "APEX AI", x: 50, y: 2, hue: 300, domain: "Polar Zenith · +75°" },
  { id: "garage", label: "GARAGE", x: 85, y: 10, hue: 48, domain: "Back Orbit · +60°" },
];

export const CONSTELLATION_EDGES: [Stage, Stage][] = [
  ["ai", "engine"],
  ["engine", "manufacturing"],
  ["engine", "aero"],
  ["engine", "simulation"],
  ["aero", "vehicle"],
  ["vehicle", "interior"],
  ["interior", "transmission3d"],
  ["transmission3d", "simulation"],
  ["manufacturing", "vehicle"],
  ["manufacturing", "transmission3d"],
  ["simulation", "garage"],
];

interface SpatialConstellationMapProps {
  activeStage: Stage;
  onSelectStage: (stage: Stage) => void;
  compact?: boolean;
  className?: string;
}

export const SpatialConstellationMap: React.FC<SpatialConstellationMapProps> = ({
  activeStage,
  onSelectStage,
  compact = false,
  className = "",
}) => {
  const activeNode = CONSTELLATION_NODES.find((n) => n.id === activeStage) ?? CONSTELLATION_NODES[0];

  return (
    <div
      className={`relative p-3 rounded-2xl bg-amber-950/85 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col select-none ${
        compact ? "w-64" : "w-full max-w-sm"
      } ${className}`}
    >
      {/* Header telemetry */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-amber-200/70 uppercase">
          <Orbit size={12} className="text-amber-400 animate-spin-slow" />
          <span>CONSTELLATION RADAR</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[9px] text-amber-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{activeNode.label}</span>
        </div>
      </div>

      {/* SVG Topological Map */}
      <div className="relative w-full aspect-square max-h-48">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background Concentric Radar Rings */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
          <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />

          {/* Topological Edges */}
          {CONSTELLATION_EDGES.map(([fromId, toId], idx) => {
            const from = CONSTELLATION_NODES.find((n) => n.id === fromId);
            const to = CONSTELLATION_NODES.find((n) => n.id === toId);
            if (!from || !to) return null;
            const isConnectedToActive = from.id === activeStage || to.id === activeStage;

            return (
              <line
                key={idx}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isConnectedToActive ? `hsl(${activeNode.hue}, 90%, 65%)` : "rgba(255,255,255,0.18)"}
                strokeWidth={isConnectedToActive ? "1.4" : "0.8"}
                strokeDasharray={isConnectedToActive ? "none" : "2 2"}
                className={isConnectedToActive ? "filter drop-shadow-[0_0_4px_rgba(56,189,248,0.6)]" : ""}
              />
            );
          })}

          {/* Planetary Node Pins */}
          {CONSTELLATION_NODES.map((node) => {
            const isActive = node.id === activeStage;
            const r = isActive ? 4.5 : 2.8;

            return (
              <g
                key={node.id}
                onClick={() => {
                  playHMIClickSound();
                  onSelectStage(node.id);
                }}
                className="cursor-pointer group"
              >
                {/* Active Ring Pulse */}
                {isActive && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="8"
                    fill="none"
                    stroke={`hsl(${node.hue}, 100%, 75%)`}
                    strokeWidth="1"
                    className="animate-ping"
                    opacity="0.6"
                  />
                )}

                {/* Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={r}
                  fill={isActive ? `hsl(${node.hue}, 100%, 80%)` : `hsl(${node.hue}, 60%, 40%)`}
                  stroke={isActive ? "#ffffff" : `hsl(${node.hue}, 90%, 65%)`}
                  strokeWidth={isActive ? "1.5" : "0.8"}
                  className="transition-all duration-300 group-hover:scale-125"
                />

                {/* Node Label Text */}
                <text
                  x={node.x}
                  y={node.y + (node.y > 75 ? -5 : 6.5)}
                  textAnchor="middle"
                  fill={isActive ? "#ffffff" : "rgba(203,213,225,0.7)"}
                  fontSize={isActive ? "4.2" : "3.2"}
                  fontFamily="monospace"
                  fontWeight={isActive ? "bold" : "normal"}
                  className="pointer-events-none uppercase tracking-wider"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Sector Footnote */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-[9px] text-amber-300/60">
        <span className="flex items-center gap-1">
          <Compass size={10} className="text-amber-400" />
          {activeNode.domain}
        </span>
        <span className="text-amber-300 font-bold">1-CLICK LOCK</span>
      </div>
    </div>
  );
};
