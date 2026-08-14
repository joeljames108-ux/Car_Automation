import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { getIsoBoxFacets, projectIso } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface BoxerIsoRendererProps {
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
 * Photorealistic 3D Isometric Boxer / Flat-Engine Block Casting (H4 / H6)
 * Renders horizontally-opposed split crankcase with left & right cylinder barrels.
 */
export const BoxerIsoRenderer: React.FC<BoxerIsoRendererProps> = ({
  layoutSpec,
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 230 };
  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  // Low-profile, wide flat-engine block dimensions
  const blockW = layoutSpec.bw * 0.72;
  const blockD = 160; // Wide 180° span
  const blockH = 85;  // Low center of gravity height

  const origin3D = {
    x: -blockW / 2,
    y: -blockD / 2,
    z: 0,
  };

  const facets = getIsoBoxFacets(origin3D, blockW, blockD, blockH, originScreen);
  const shadowCenter = projectIso({ x: 0, y: 0, z: 0 }, originScreen);

  return (
    <g
      id="iso-block-boxer"
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
        cy={shadowCenter.y + 15}
        rx={blockW * 0.85}
        ry={blockD * 0.38}
        fill="url(#iso-ground-shadow)"
      />

      {/* Main Flat Engine Block Facets */}
      <path
        d={facets.right}
        fill={fills.right}
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="2.2"
        opacity="0.88"
      />
      <path
        d={facets.left}
        fill={fills.left}
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="2.5"
        opacity="0.45"
      />

      {/* Top Center Crankcase Spine Deck */}
      <path
        d={facets.top}
        fill={fills.top}
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="2.8"
      />
      <path d={facets.top} fill="none" stroke="#ffffff" strokeWidth="1.8" opacity="0.9" />

      {/* Split Crankcase Central Seam Line */}
      {(() => {
        const pSeamStart = projectIso({ x: -blockW / 2, y: 0, z: blockH }, originScreen);
        const pSeamEnd = projectIso({ x: blockW / 2, y: 0, z: blockH }, originScreen);
        return (
          <line
            x1={pSeamStart.x}
            y1={pSeamStart.y}
            x2={pSeamEnd.x}
            y2={pSeamEnd.y}
            stroke="#090d16"
            strokeWidth="3"
            strokeDasharray="6 3"
          />
        );
      })()}

      {/* Left & Right Horizontally-Opposed Cylinder Bores */}
      {layoutSpec.cyls.map((cxPos, idx) => {
        const normX = (cxPos - layoutSpec.bx - layoutSpec.bw / 2) * 0.65;
        // Alternate bank side: left (-Y) or right (+Y)
        const bankSideY = idx % 2 === 0 ? -blockD * 0.38 : blockD * 0.38;

        const cylCenter = projectIso({ x: normX, y: bankSideY, z: blockH / 2 }, originScreen);

        return (
          <g key={`boxer-cyl-${idx}`}>
            <ellipse
              cx={cylCenter.x}
              cy={cylCenter.y}
              rx="15"
              ry="10"
              fill="url(#bore-3d-depth)"
              stroke="#090d16"
              strokeWidth="2"
            />
            <ellipse
              cx={cylCenter.x}
              cy={cylCenter.y}
              rx="14"
              ry="9"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.85"
            />
          </g>
        );
      })}
    </g>
  );
};
