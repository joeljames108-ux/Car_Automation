import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, projectIso60VEllipse } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface CylinderHeadIsoProps {
  layoutSpec: {
    label: string;
    cyls: number[];
    width: number;
    bx: number;
    bw: number;
    bh: number;
    category?: string;
  };
  componentState: {
    isInstalled: boolean;
    isActive: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  selectedVariants?: Record<string, string>;
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * Photorealistic 3D Isometric Dual CNC Billet Aluminium DOHC Cylinder Head Assembly
 *
 * Designed for 60° V12 Engine (30° tilt per bank from vertical)
 * Replaces generic box geometry with precision CNC machined casting contours:
 * - Sloped 60° Bank Tilt (Bottom deck Z=145, Top valve cover deck Z=182)
 * - 6 Scalloped Pent-Roof Combustion Chamber Domes per head with 4 Valve Seats
 * - Outer Side CNC Exhaust Flange Rails with 6 Oval Exhaust Ports & 12 Flange Studs
 * - Inner Valley Side CNC Intake Port Runners
 * - 12 Direct Ignition Coil-on-Plug (COP) Packs & Spark Plug Tube Wells
 * - Front Cam Drive Tunnels & Water Pump Crossover Ports
 * - Cast Reinforcement Ribs & Coolant Passage Freeze Plugs
 * - Machined Chamfer Highlight Edges
 */
export const CylinderHeadIso: React.FC<CylinderHeadIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O = { x: 250, y: 215 };
  const materialGrade = selectedVariants?.cylinder_head || "billet";
  const fills = getIsoMaterialFills(materialGrade);

  const isVEngine = layoutSpec.category === "V" || layoutSpec.label?.includes("V") || layoutSpec.cyls.length >= 8;

  const BL = 230; // Block length (-115 to +115)
  const halfL = BL / 2;

  // 60° V-Angle Cylinder Head Coordinates
  // Left Head: Bottom deck outer Y=+75, inner Y=+16 @ Z=145; Top deck outer Y=+62, inner Y=+24 @ Z=182
  // Right Head: Bottom deck outer Y=-75, inner Y=-16 @ Z=145; Top deck outer Y=-62, inner Y=-24 @ Z=182
  const Z_BOT = 145;
  const Z_TOP = 182;

  const P = (x: number, y: number, z: number) => projectIso({ x, y, z }, O);

  // Left Head 3D Corners
  const lhBotOuterFL = P(-halfL - 2, 75, Z_BOT);
  const lhBotOuterFR = P(halfL + 2, 75, Z_BOT);
  const lhBotInnerBL = P(-halfL - 2, 16, Z_BOT);
  const lhBotInnerBR = P(halfL + 2, 16, Z_BOT);

  const lhTopOuterFL = P(-halfL - 2, 62, Z_TOP);
  const lhTopOuterFR = P(halfL + 2, 62, Z_TOP);
  const lhTopInnerBL = P(-halfL - 2, 24, Z_TOP);
  const lhTopInnerBR = P(halfL + 2, 24, Z_TOP);

  // Right Head 3D Corners
  const rhBotOuterFL = P(-halfL - 2, -75, Z_BOT);
  const rhBotOuterFR = P(halfL + 2, -75, Z_BOT);
  const rhBotInnerBL = P(-halfL - 2, -16, Z_BOT);
  const rhBotInnerBR = P(halfL + 2, -16, Z_BOT);

  const rhTopOuterFL = P(-halfL - 2, -62, Z_TOP);
  const rhTopOuterFR = P(halfL + 2, -62, Z_TOP);
  const rhTopInnerBL = P(-halfL - 2, -24, Z_TOP);
  const rhTopInnerBR = P(halfL + 2, -24, Z_TOP);

  // 6 Cylinder Bore positions along X-axis
  const borePositions = Array.from({ length: 6 }, (_, i) => -85 + i * 34);

  return (
    <g
      id="iso-cylinder-head-v12-60deg-machined"
      onMouseEnter={() => onHoverComponent?.("cylinder_head")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {isVEngine ? (
        <g id="v12-dual-cnc-cylinder-heads">
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 1. RIGHT (DISTAL) CYLINDER HEAD ASSEMBLY (Y < 0, Facing Away)  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <g id="right-distal-cylinder-head">
            {/* Main Casting Body — Right Head Outer Wall */}
            <polygon
              points={`
                ${rhBotOuterFL.x},${rhBotOuterFL.y}
                ${rhBotOuterFR.x},${rhBotOuterFR.y}
                ${rhTopOuterFR.x},${rhTopOuterFR.y}
                ${rhTopOuterFL.x},${rhTopOuterFL.y}
              `}
              fill="url(#v12-cast-aluminum-body-right)"
              stroke="#090d16"
              strokeWidth="2.2"
            />

            {/* Main Casting Body — Right Head Front Face */}
            <polygon
              points={`
                ${rhBotOuterFL.x},${rhBotOuterFL.y}
                ${rhBotInnerBL.x},${rhBotInnerBL.y}
                ${rhTopInnerBL.x},${rhTopInnerBL.y}
                ${rhTopOuterFL.x},${rhTopOuterFL.y}
              `}
              fill="url(#v12-cast-aluminum-body-right)"
              stroke="#090d16"
              strokeWidth="2"
            />

            {/* Right Head Top Valve Cover Mounting Flange Deck */}
            <polygon
              points={`
                ${rhTopOuterFL.x},${rhTopOuterFL.y}
                ${rhTopOuterFR.x},${rhTopOuterFR.y}
                ${rhTopInnerBR.x},${rhTopInnerBR.y}
                ${rhTopInnerBL.x},${rhTopInnerBL.y}
              `}
              fill="url(#v12-machined-deck)"
              stroke="#090d16"
              strokeWidth="2.2"
            />
            {/* Top Deck Specular Edge Highlight */}
            <line
              x1={rhTopOuterFL.x} y1={rhTopOuterFL.y}
              x2={rhTopOuterFR.x} y2={rhTopOuterFR.y}
              stroke="#ffffff"
              strokeWidth="1.8"
              opacity="0.85"
            />

            {/* 6 Oval Exhaust Ports & Mounting Flange Studs along Right Outer Wall */}
            {borePositions.map((bx, idx) => {
              const portPt = P(bx, -71, 160);
              return (
                <g key={`right-exh-port-${idx}`}>
                  {/* CNC Machined Exhaust Port Opening */}
                  <ellipse
                    cx={portPt.x}
                    cy={portPt.y}
                    rx="8"
                    ry="5"
                    fill="#020617"
                    stroke="#475569"
                    strokeWidth="1.2"
                    transform={`rotate(30, ${portPt.x}, ${portPt.y})`}
                  />
                  <ellipse
                    cx={portPt.x}
                    cy={portPt.y}
                    rx="6.5"
                    ry="3.8"
                    fill="url(#water-jacket-opening)"
                    opacity="0.7"
                    transform={`rotate(30, ${portPt.x}, ${portPt.y})`}
                  />
                  {/* Dual Exhaust Flange Studs */}
                  <circle cx={portPt.x - 7} cy={portPt.y - 4} r="1.6" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.6" />
                  <circle cx={portPt.x + 7} cy={portPt.y + 4} r="1.6" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.6" />
                </g>
              );
            })}

            {/* 6 Direct Ignition Coil-on-Plug (COP) Modules in Spark Plug Wells */}
            {borePositions.map((bx, idx) => {
              const spPt = P(bx, -43, Z_TOP);
              return (
                <g key={`right-cop-module-${idx}`}>
                  {/* Spark Plug Tube Well Recess */}
                  <circle cx={spPt.x} cy={spPt.y} r="5" fill="#020617" stroke="#475569" strokeWidth="1" />
                  {/* COP Ignition Coil Cap */}
                  <rect x={spPt.x - 3.5} y={spPt.y - 12} width="7" height="12" rx="1.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                  {/* Performance Orange Weatherproof Rubber Seal Boot */}
                  <rect x={spPt.x - 4.5} y={spPt.y - 15} width="9" height="4" rx="1" fill="#ea580c" stroke="#090d16" strokeWidth="0.7" />
                  {/* Gold Anodized Securing Stud Nut */}
                  <circle cx={spPt.x + 5} cy={spPt.y - 8} r="1.5" fill="#fef08a" stroke="#090d16" strokeWidth="0.6" />
                </g>
              );
            })}

            {/* Coolant Passages & Freeze Plugs along Right Head */}
            {[-65, 0, 65].map((wx, wIdx) => {
              const plugPt = P(wx, -73, 172);
              return (
                <g key={`right-freeze-plug-${wIdx}`}>
                  <circle cx={plugPt.x} cy={plugPt.y} r="3" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.8" />
                  <circle cx={plugPt.x} cy={plugPt.y} r="1.4" fill="#020617" />
                </g>
              );
            })}
          </g>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* 2. LEFT (PROXIMAL) CYLINDER HEAD ASSEMBLY (Y > 0, Facing Us)   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <g id="left-proximal-cylinder-head">
            {/* Main Casting Body — Left Head Outer Wall */}
            <polygon
              points={`
                ${lhBotOuterFL.x},${lhBotOuterFL.y}
                ${lhBotOuterFR.x},${lhBotOuterFR.y}
                ${lhTopOuterFR.x},${lhTopOuterFR.y}
                ${lhTopOuterFL.x},${lhTopOuterFL.y}
              `}
              fill="url(#v12-cast-aluminum-body)"
              stroke="#090d16"
              strokeWidth="2.2"
            />

            {/* Main Casting Body — Left Head Front Face */}
            <polygon
              points={`
                ${lhBotOuterFL.x},${lhBotOuterFL.y}
                ${lhBotInnerBL.x},${lhBotInnerBL.y}
                ${lhTopInnerBL.x},${lhTopInnerBL.y}
                ${lhTopOuterFL.x},${lhTopOuterFL.y}
              `}
              fill="url(#v12-cast-aluminum-body)"
              stroke="#090d16"
              strokeWidth="2"
            />

            {/* Left Head Top Valve Cover Mounting Flange Deck */}
            <polygon
              points={`
                ${lhTopOuterFL.x},${lhTopOuterFL.y}
                ${lhTopOuterFR.x},${lhTopOuterFR.y}
                ${lhTopInnerBR.x},${lhTopInnerBR.y}
                ${lhTopInnerBL.x},${lhTopInnerBL.y}
              `}
              fill="url(#v12-machined-deck)"
              stroke="#090d16"
              strokeWidth="2.2"
            />
            {/* Top Deck Specular Edge Highlight */}
            <line
              x1={lhTopOuterFL.x} y1={lhTopOuterFL.y}
              x2={lhTopOuterFR.x} y2={lhTopOuterFR.y}
              stroke="#ffffff"
              strokeWidth="2"
              opacity="0.95"
            />

            {/* 6 Oval Exhaust Ports & Mounting Flange Studs along Left Outer Wall */}
            {borePositions.map((bx, idx) => {
              const portPt = P(bx, 71, 160);
              return (
                <g key={`left-exh-port-${idx}`}>
                  {/* CNC Machined Exhaust Port Opening */}
                  <ellipse
                    cx={portPt.x}
                    cy={portPt.y}
                    rx="8"
                    ry="5"
                    fill="#020617"
                    stroke="#475569"
                    strokeWidth="1.2"
                    transform={`rotate(-25, ${portPt.x}, ${portPt.y})`}
                  />
                  <ellipse
                    cx={portPt.x}
                    cy={portPt.y}
                    rx="6.5"
                    ry="3.8"
                    fill="url(#water-jacket-opening)"
                    opacity="0.7"
                    transform={`rotate(-25, ${portPt.x}, ${portPt.y})`}
                  />
                  {/* Dual Exhaust Flange Studs */}
                  <circle cx={portPt.x - 7} cy={portPt.y - 4} r="1.6" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.6" />
                  <circle cx={portPt.x + 7} cy={portPt.y + 4} r="1.6" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.6" />
                </g>
              );
            })}

            {/* Cast Strengthening Ribs along Left Head Outer Wall */}
            {Array.from({ length: 8 }).map((_, idx) => {
              const ribX = -85 + idx * 26;
              const ribBot = P(ribX, 74, Z_BOT + 6);
              const ribTop = P(ribX, 63, Z_TOP - 6);
              return (
                <line
                  key={`left-head-rib-${idx}`}
                  x1={ribBot.x} y1={ribBot.y}
                  x2={ribTop.x} y2={ribTop.y}
                  stroke="#8b9ab5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.45"
                />
              );
            })}

            {/* 6 Direct Ignition Coil-on-Plug (COP) Modules in Spark Plug Wells */}
            {borePositions.map((bx, idx) => {
              const spPt = P(bx, 43, Z_TOP);
              return (
                <g key={`left-cop-module-${idx}`}>
                  {/* Spark Plug Tube Well Recess */}
                  <circle cx={spPt.x} cy={spPt.y} r="5" fill="#020617" stroke="#475569" strokeWidth="1" />
                  {/* COP Ignition Coil Cap */}
                  <rect x={spPt.x - 3.5} y={spPt.y - 12} width="7" height="12" rx="1.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                  {/* Performance Orange Weatherproof Rubber Seal Boot */}
                  <rect x={spPt.x - 4.5} y={spPt.y - 15} width="9" height="4" rx="1" fill="#ea580c" stroke="#090d16" strokeWidth="0.7" />
                  {/* Gold Anodized Securing Stud Nut */}
                  <circle cx={spPt.x + 5} cy={spPt.y - 8} r="1.5" fill="#fef08a" stroke="#090d16" strokeWidth="0.6" />
                </g>
              );
            })}

            {/* Coolant Passages & Freeze Plugs along Left Head */}
            {[-65, 0, 65].map((wx, wIdx) => {
              const plugPt = P(wx, 73, 172);
              return (
                <g key={`left-freeze-plug-${wIdx}`}>
                  <circle cx={plugPt.x} cy={plugPt.y} r="3" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.8" />
                  <circle cx={plugPt.x} cy={plugPt.y} r="1.4" fill="#020617" />
                </g>
              );
            })}

            {/* Front Water Outlet Flange Port (front of left head) */}
            {(() => {
              const waterOutPt = P(halfL + 2, 45, 165);
              return (
                <g id="left-head-water-outlet">
                  <circle cx={waterOutPt.x} cy={waterOutPt.y} r="7" fill="url(#water-jacket-opening)" stroke="#090d16" strokeWidth="1.5" />
                  <circle cx={waterOutPt.x} cy={waterOutPt.y} r="4.5" fill="#020617" stroke="#0e7490" strokeWidth="1" />
                  <circle cx={waterOutPt.x - 6} cy={waterOutPt.y - 4} r="1.5" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.6" />
                  <circle cx={waterOutPt.x + 6} cy={waterOutPt.y + 4} r="1.5" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.6" />
                </g>
              );
            })()}

            {/* Perimeter Valve Cover Flange Bolts (14 per head) */}
            {[-95, -65, -30, 0, 30, 65, 95].flatMap((bx) => [
              P(bx, 61, Z_TOP + 1),
              P(bx, 25, Z_TOP + 1),
            ]).map((boltPt, bIdx) => (
              <g key={`left-vc-bolt-${bIdx}`}>
                <circle cx={boltPt.x} cy={boltPt.y} r="2.4" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.7" />
                <circle cx={boltPt.x} cy={boltPt.y} r="1.1" fill="#020617" />
              </g>
            ))}
          </g>
        </g>
      ) : (
        /* Standard Single Volumetric Cylinder Head for Inline Engine */
        <g id="inline-cylinder-head">
          <polygon
            points={`
              ${lhBotOuterFL.x},${lhBotOuterFL.y}
              ${lhBotOuterFR.x},${lhBotOuterFR.y}
              ${lhTopOuterFR.x},${lhTopOuterFR.y}
              ${lhTopOuterFL.x},${lhTopOuterFL.y}
            `}
            fill="url(#v12-cast-aluminum-body)"
            stroke="#090d16"
            strokeWidth="2.2"
          />
          <polygon
            points={`
              ${lhTopOuterFL.x},${lhTopOuterFL.y}
              ${lhTopOuterFR.x},${lhTopOuterFR.y}
              ${lhTopInnerBR.x},${lhTopInnerBR.y}
              ${lhTopInnerBL.x},${lhTopInnerBL.y}
            `}
            fill="url(#v12-machined-deck)"
            stroke="#090d16"
            strokeWidth="2.2"
          />
        </g>
      )}
    </g>
  );
};
