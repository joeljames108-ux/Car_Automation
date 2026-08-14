import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, getIsoBoxFacets } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface VR6BlockCastingIsoProps {
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
 * Photorealistic 3D Isometric VR6 Narrow-Angle (15°) Engine Block Casting
 * Single cylinder head deck covering staggered twin-bank cylinder bores.
 */
export const VR6BlockCastingIso: React.FC<VR6BlockCastingIsoProps> = ({
  layoutSpec,
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 220 };
  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  const blockW = 165;
  const blockD = 85;
  const blockH = 150;

  const origin3D = {
    x: -blockW / 2,
    y: -blockD / 2,
    z: 0,
  };

  const facets = getIsoBoxFacets(origin3D, blockW, blockD, blockH, originScreen);
  const shadowCenter = projectIso({ x: 0, y: 0, z: 0 }, originScreen);

  return (
    <g
      id="iso-block-vr6"
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
        cy={shadowCenter.y + 16}
        rx={blockW * 0.8}
        ry={blockD * 0.45}
        fill="url(#iso-ground-shadow)"
      />

      {/* Main Block Casting Facets */}
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
        opacity="0.5"
      />
      <path
        d={facets.top}
        fill={fills.top}
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="2.8"
      />
      <path d={facets.top} fill="none" stroke="#ffffff" strokeWidth="1.8" opacity="0.9" />

      {/* 6 Staggered Cylinder Bores (15° VR-Angle arrangement under 1 single deck) */}
      {layoutSpec.cyls.map((cxPos, idx) => {
        const normX = (cxPos - layoutSpec.bx - layoutSpec.bw / 2) * 0.62;
        // Stagger left/right slightly for 15° VR offset
        const bankOffset = idx % 2 === 0 ? -12 : 12;
        const cylPt = projectIso({ x: normX, y: bankOffset, z: blockH }, originScreen);

        return (
          <g key={`vr6-bore-${idx}`}>
            <ellipse
              cx={cylPt.x}
              cy={cylPt.y}
              rx="15"
              ry="8.5"
              fill="url(#bore-3d-depth)"
              stroke="#090d16"
              strokeWidth="2"
            />
            <ellipse
              cx={cylPt.x}
              cy={cylPt.y}
              rx="14"
              ry="7.8"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.85"
            />
          </g>
        );
      })}

      {/* Timing Chain Tunnel / Cover Flange on Front Face */}
      <rect
        x={facets.points.p4.x - 14}
        y={facets.points.p4.y + 20}
        width="28"
        height="85"
        rx="4"
        fill="url(#slate-block-artwork)"
        stroke="#090d16"
        strokeWidth="1.8"
      />
      <line
        x1={facets.points.p4.x}
        y1={facets.points.p4.y + 22}
        x2={facets.points.p4.x}
        y2={facets.points.p4.y + 100}
        stroke="url(#chrome-3d)"
        strokeWidth="2"
        opacity="0.7"
      />
    </g>
  );
};
