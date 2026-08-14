import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, getIsoBoxFacets } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface RotaryBlockCastingIsoProps {
  layoutSpec: {
    label: string;
    cyls: number[];
    width: number;
    bankAngle: string;
    bx: number;
    bw: number;
    bh: number;
    category: string;
    bolts: { x: number; y: number }[];
  };
  blockState: {
    isInstalled: boolean;
    isActive: boolean;
    isHovered: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  selectedVariants?: Record<string, string>;
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * Photorealistic 3D Isometric Wankel Rotary Engine Block Casting
 * Renders twin epitrochoidal rotor housings with cooling passages, side plates,
 * eccentric shaft tunnel, peripheral ports, and rotor chamber details.
 */
export const RotaryBlockCastingIso: React.FC<RotaryBlockCastingIsoProps> = ({
  layoutSpec,
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 225 };
  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  // Rotary engine block dimensions
  const blockW = 160; // Length along eccentric shaft
  const blockD = 130; // Depth across trochoid housing
  const blockH = 140; // Vertical height

  const origin3D = {
    x: -blockW / 2,
    y: -blockD / 2,
    z: 0,
  };

  const facets = getIsoBoxFacets(origin3D, blockW, blockD, blockH, originScreen);
  const shadowCenter = projectIso({ x: 0, y: 0, z: 0 }, originScreen);

  // Twin Rotor Housing offsets along eccentric shaft (X-axis)
  const housingX1 = -blockW * 0.25;
  const housingX2 = blockW * 0.25;

  return (
    <g
      id="iso-block-rotary"
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
        cy={shadowCenter.y + 18}
        rx={blockW * 0.75}
        ry={blockD * 0.4}
        fill="url(#iso-ground-shadow)"
      />

      {/* Main Engine Block Housing Facets */}
      {/* Right Side Facet */}
      <path
        d={facets.right}
        fill={fills.right}
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="2.2"
        opacity="0.9"
      />

      {/* Front Face / Side Housing Plate */}
      <path
        d={facets.front}
        fill={fills.front}
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="2.5"
      />

      {/* Top Deck Surface */}
      <path
        d={facets.top}
        fill={fills.top}
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="2.8"
      />
      <path d={facets.top} fill="none" stroke="#ffffff" strokeWidth="1.8" opacity="0.9" />

      {/* Epitrochoidal Rotor Chamber Bore Cutouts on Top & Front Surfaces */}
      {[housingX1, housingX2].map((hX, idx) => {
        const centerTop = projectIso({ x: hX, y: 0, z: blockH }, originScreen);
        const centerFront = projectIso({ x: hX, y: blockD / 2, z: blockH / 2 }, originScreen);
        const eShaftPt = projectIso({ x: hX, y: 0, z: blockH / 2 }, originScreen);

        return (
          <g key={`rotary-housing-${idx}`}>
            {/* Top Housing Opening — Figure-Eight Trochoid Profile */}
            <g transform={`translate(${centerTop.x}, ${centerTop.y})`}>
              <ellipse
                cx="-12"
                cy="0"
                rx="22"
                ry="14"
                fill="url(#bore-3d-depth)"
                stroke="#090d16"
                strokeWidth="1.8"
              />
              <ellipse
                cx="12"
                cy="0"
                rx="22"
                ry="14"
                fill="url(#bore-3d-depth)"
                stroke="#090d16"
                strokeWidth="1.8"
              />
              {/* Inner Chamfer Specular Ring */}
              <ellipse
                cx="0"
                cy="0"
                rx="30"
                ry="16"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                opacity="0.8"
              />
            </g>

            {/* Eccentric Shaft Tunnel Bore Center */}
            <circle
              cx={eShaftPt.x}
              cy={eShaftPt.y}
              r="16"
              fill="url(#journal-polished-chrome)"
              stroke="#090d16"
              strokeWidth="2"
            />
            <circle
              cx={eShaftPt.x}
              cy={eShaftPt.y}
              r="8"
              fill="#020617"
              stroke="#38bdf8"
              strokeWidth="1"
            />

            {/* Peripheral Intake/Exhaust Port Details on Front Housing Plate */}
            <rect
              x={centerFront.x - 28}
              y={centerFront.y - 18}
              width="14"
              height="24"
              rx="4"
              fill="url(#slate-block-artwork)"
              stroke="#090d16"
              strokeWidth="1.5"
            />
            <circle
              cx={centerFront.x - 21}
              cy={centerFront.y - 6}
              r="4.5"
              fill="#020617"
              stroke="#ea580c"
              strokeWidth="1"
            />

            {/* Spark Plug Bosses (Leading + Trailing Plugs) */}
            <circle
              cx={centerFront.x + 22}
              cy={centerFront.y - 10}
              r="5"
              fill="#334155"
              stroke="#090d16"
              strokeWidth="1.2"
            />
            <circle
              cx={centerFront.x + 22}
              cy={centerFront.y + 10}
              r="5"
              fill="#334155"
              stroke="#090d16"
              strokeWidth="1.2"
            />
            <circle cx={centerFront.x + 22} cy={centerFront.y - 10} r="2" fill="#ea580c" />
            <circle cx={centerFront.x + 22} cy={centerFront.y + 10} r="2" fill="#ea580c" />
          </g>
        );
      })}

      {/* Side Housing Tension Bolt Pattern */}
      {[-60, -20, 20, 60].map((bx, bidx) => (
        <circle
          key={`rotary-bolt-${bidx}`}
          cx={facets.points.p4.x + 25 + bidx * 28}
          cy={facets.points.p4.y + 12}
          r="3"
          fill="url(#bolt-boss-3d)"
          stroke="#090d16"
          strokeWidth="1"
        />
      ))}
    </g>
  );
};
