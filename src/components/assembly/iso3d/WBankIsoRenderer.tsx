import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { getIsoBoxFacets, projectIso } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface WBankIsoRendererProps {
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
 * Photorealistic 3D Isometric W-Engine Block Casting (W12 / W16 / W18)
 * Renders quad-bank / VR-derived dual narrow-angle cylinder banks in a W-configuration.
 */
export const WBankIsoRenderer: React.FC<WBankIsoRendererProps> = ({
  layoutSpec,
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 220 };
  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  // W-Engine block dimensions (compact W layout is wider and shorter than V12)
  const blockW = layoutSpec.bw * 0.72;
  const blockD = 145;
  const blockH = 145;

  const origin3D = {
    x: -blockW / 2,
    y: -blockD / 2,
    z: 0,
  };

  const facets = getIsoBoxFacets(origin3D, blockW, blockD, blockH, originScreen);
  const shadowCenter = projectIso({ x: 0, y: 0, z: 0 }, originScreen);

  return (
    <g
      id="iso-block-wbank"
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
        rx={blockW * 0.85}
        ry={blockD * 0.42}
        fill="url(#iso-ground-shadow)"
      />

      {/* Outer Engine Block Casting Shell */}
      {/* Right Side Casting Facet */}
      <path
        d={facets.right}
        fill={fills.right}
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="2.2"
        opacity="0.88"
      />

      {/* Left Side Casting Facet */}
      <path
        d={facets.left}
        fill={fills.left}
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="2.5"
        opacity="0.5"
      />

      {/* Top Deck Surface Facet */}
      <path
        d={facets.top}
        fill={fills.top}
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="2.8"
      />
      <path d={facets.top} fill="none" stroke="#ffffff" strokeWidth="1.8" opacity="0.9" />

      {/* Central W-Valley Channel Scallop */}
      {(() => {
        const vTopCenter = projectIso({ x: 0, y: 0, z: blockH }, originScreen);
        return (
          <ellipse
            cx={vTopCenter.x}
            cy={vTopCenter.y}
            rx={blockW * 0.4}
            ry={blockD * 0.15}
            fill="url(#v-valley-floor)"
            stroke="#090d16"
            strokeWidth="1.5"
          />
        );
      })()}

      {/* 4 Rows of Cylinder Bores (2 VR-Bank Pairs arranged in W-Spans) */}
      {layoutSpec.cyls.map((cxPos, idx) => {
        const normX = (cxPos - layoutSpec.bx - layoutSpec.bw / 2) * 0.62;
        // Map cylinders across 4 bank lanes in W configuration
        const laneOffset = ((idx % 4) - 1.5) * 22;

        const cylCenterTop = projectIso({ x: normX, y: laneOffset, z: blockH }, originScreen);

        return (
          <g key={`wbank-bore-${idx}`}>
            <ellipse
              cx={cylCenterTop.x}
              cy={cylCenterTop.y}
              rx="14"
              ry="7.8"
              fill="url(#bore-3d-depth)"
              stroke="#090d16"
              strokeWidth="2"
            />
            {/* Inner Chamfer Specular Ring */}
            <ellipse
              cx={cylCenterTop.x}
              cy={cylCenterTop.y}
              rx="13"
              ry="7"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.4"
              opacity="0.9"
            />
          </g>
        );
      })}

      {/* Webbed Structural Gussets between Bank Valleys */}
      {[-40, 0, 40].map((gx, gIdx) => {
        const gPt = projectIso({ x: gx, y: 0, z: blockH - 12 }, originScreen);
        return (
          <circle
            key={`w-gusset-${gIdx}`}
            cx={gPt.x}
            cy={gPt.y}
            r="4"
            fill="url(#bolt-boss-3d)"
            stroke="#090d16"
            strokeWidth="1"
          />
        );
      })}
    </g>
  );
};
