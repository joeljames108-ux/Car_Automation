import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, getIsoBoxFacets } from "./isoMath";

interface EVPowertrainIsoRendererProps {
  layoutSpec: {
    label: string;
    cyls: number[];
    width: number;
    bx: number;
    bw: number;
    bh: number;
  };
  blockState: {
    isInstalled: boolean;
    isActive: boolean;
    isHovered: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * Photorealistic 3D Isometric Electric Vehicle Powertrain Renderer
 * Renders skateboard battery pack tray, cell module grid, 800V inverter,
 * dual electric drive motor unit, reduction gearbox, and cooling grid.
 */
export const EVPowertrainIsoRenderer: React.FC<EVPowertrainIsoRendererProps> = ({
  layoutSpec,
  blockState,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 230 };

  // Battery tray dimensions
  const batW = 210;
  const batD = 140;
  const batH = 35;

  const origin3D = {
    x: -batW / 2,
    y: -batD / 2,
    z: 0,
  };

  const facets = getIsoBoxFacets(origin3D, batW, batD, batH, originScreen);
  const shadowCenter = projectIso({ x: 0, y: 0, z: 0 }, originScreen);
  const motorPt = projectIso({ x: batW / 2 - 25, y: 0, z: batH + 20 }, originScreen);
  const inverterPt = projectIso({ x: -batW / 4, y: 0, z: batH + 15 }, originScreen);

  return (
    <g
      id="iso-block-ev-powertrain"
      onMouseEnter={() => onHoverComponent?.("block")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className={`cursor-pointer transition-all duration-700 ease-out ${
        blockState.isActive ? "filter-glow-active" : ""
      }`}
      style={{
        transform: `translate(${blockState.offsetX}px, ${blockState.offsetY}px)`,
        opacity: blockState.opacity,
      }}
    >
      {/* Ground Shadow */}
      <ellipse
        cx={shadowCenter.x}
        cy={shadowCenter.y + 20}
        rx={batW * 0.7}
        ry={batD * 0.4}
        fill="url(#iso-ground-shadow)"
      />

      {/* Skateboard Battery Enclosure Casing */}
      <path d={facets.right} fill="url(#slate-block-artwork)" stroke="#090d16" strokeWidth="2.2" />
      <path d={facets.left} fill="url(#slate-block-artwork)" stroke="#090d16" strokeWidth="2.5" />
      <path
        d={facets.top}
        fill="url(#iso-billet-top)"
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="2.8"
      />
      <path d={facets.top} fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />

      {/* Battery Cell Module Matrix Grid (4x3 Pack Matrix visible on top tray) */}
      {[ -65, -20, 25, 70 ].map((mX, colIdx) =>
        [ -35, 0, 35 ].map((mY, rowIdx) => {
          const modPt = projectIso({ x: mX, y: mY, z: batH }, originScreen);
          return (
            <g key={`ev-cell-module-${colIdx}-${rowIdx}`}>
              <rect
                x={modPt.x - 14}
                y={modPt.y - 8}
                width="28"
                height="16"
                rx="2"
                fill="url(#anodized-blue)"
                stroke="#090d16"
                strokeWidth="1"
              />
              <line
                x1={modPt.x - 12}
                y1={modPt.y - 6}
                x2={modPt.x + 12}
                y2={modPt.y - 6}
                stroke="#ffffff"
                strokeWidth="1"
                opacity="0.9"
              />
              {/* Busbar Terminal Pins */}
              <circle cx={modPt.x - 8} cy={modPt.y} r="1.5" fill="#f59e0b" />
              <circle cx={modPt.x + 8} cy={modPt.y} r="1.5" fill="#f59e0b" />
            </g>
          );
        })
      )}

      {/* Electric Drive Motor Unit Mounted at Rear */}
      <g id="ev-motor-unit">
        <ellipse
          cx={motorPt.x}
          cy={motorPt.y}
          rx="26"
          ry="38"
          fill="url(#ev-stator-core)"
          stroke="#090d16"
          strokeWidth="2.5"
        />
        <ellipse
          cx={motorPt.x}
          cy={motorPt.y}
          rx="20"
          ry="30"
          fill="url(#ev-copper-windings)"
          stroke="#090d16"
          strokeWidth="1.5"
        />
        <circle cx={motorPt.x} cy={motorPt.y} r="10" fill="#020617" stroke="#38bdf8" strokeWidth="1.2" />
      </g>

      {/* Silicon Carbide (SiC) Inverter Module */}
      <g id="ev-inverter-unit">
        <rect
          x={inverterPt.x - 30}
          y={inverterPt.y - 20}
          width="60"
          height="36"
          rx="6"
          fill="url(#slate-block-artwork)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        {/* Cooling Fins */}
        {[-22, -14, -6, 2, 10, 18].map((fX, fIdx) => (
          <line
            key={`inv-fin-${fIdx}`}
            x1={inverterPt.x + fX}
            y1={inverterPt.y - 16}
            x2={inverterPt.x + fX}
            y2={inverterPt.y + 12}
            stroke="#090d16"
            strokeWidth="1.2"
          />
        ))}
        {/* Status LED */}
        <circle cx={inverterPt.x - 20} cy={inverterPt.y - 10} r="2.5" fill="#38bdf8" className="animate-pulse" />
      </g>

      {/* Orange High-Voltage 800V Busbar Cables */}
      <path
        d={`M ${inverterPt.x + 25} ${inverterPt.y} Q ${inverterPt.x + 50} ${inverterPt.y - 10} ${motorPt.x - 20} ${motorPt.y - 10}`}
        fill="none"
        stroke="#ea580c"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d={`M ${inverterPt.x + 25} ${inverterPt.y} Q ${inverterPt.x + 50} ${inverterPt.y - 10} ${motorPt.x - 20} ${motorPt.y - 10}`}
        fill="none"
        stroke="#fde047"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.9"
      />
    </g>
  );
};
