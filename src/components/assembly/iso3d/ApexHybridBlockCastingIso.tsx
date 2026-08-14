import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { VBankBlockCastingIso } from "./VBankBlockCastingIso";
import { projectIso } from "./isoMath";

interface ApexHybridBlockCastingIsoProps {
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
 * Photorealistic 3D Isometric Apex Hybrid Engine Block Casting
 * Combines 60° V12 High-Performance ICE Crankcase with Rear Axial-Flux Electric Motor Ring,
 * High-Voltage Power Electronics Bay in Valley, and Dual Thermal Management Plumbing.
 */
export const ApexHybridBlockCastingIso: React.FC<ApexHybridBlockCastingIsoProps> = ({
  layoutSpec,
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 215 };
  const motorPt = projectIso({ x: -105, y: 0, z: 65 }, originScreen);
  const inverterPt = projectIso({ x: 0, y: 0, z: 155 }, originScreen);

  return (
    <g id="iso-block-apex-hybrid">
      {/* Base 60° V-Bank High Performance Engine Block Casting */}
      <VBankBlockCastingIso
        layoutSpec={layoutSpec}
        blockState={blockState}
        selectedVariants={selectedVariants}
        onHoverComponent={onHoverComponent}
      />

      {/* Integrated Rear P2 Axial-Flux Hybrid Motor Housing Ring */}
      <g id="apex-hybrid-integrated-motor">
        <ellipse
          cx={motorPt.x}
          cy={motorPt.y}
          rx="32"
          ry="48"
          fill="url(#anodized-blue)"
          stroke="#090d16"
          strokeWidth="2.8"
        />
        <ellipse
          cx={motorPt.x}
          cy={motorPt.y}
          rx="26"
          ry="38"
          fill="url(#ev-stator-core)"
          stroke="#090d16"
          strokeWidth="1.8"
        />
        <ellipse
          cx={motorPt.x}
          cy={motorPt.y}
          rx="15"
          ry="22"
          fill="url(#tri-metal-bearing-shell)"
          stroke="#090d16"
          strokeWidth="1.5"
        />

        {/* Stator Cooling Fins Ring */}
        {[-30, -15, 0, 15, 30].map((dy, idx) => (
          <line
            key={`stator-fin-${idx}`}
            x1={motorPt.x - 24}
            y1={motorPt.y + dy}
            x2={motorPt.x + 24}
            y2={motorPt.y + dy}
            stroke="#ffffff"
            strokeWidth="1.2"
            opacity="0.7"
          />
        ))}
      </g>

      {/* Valley-Mounted 800V SiC Inverter / Controller Module */}
      <g id="apex-hybrid-valley-inverter">
        <rect
          x={inverterPt.x - 35}
          y={inverterPt.y - 18}
          width="70"
          height="32"
          rx="6"
          fill="url(#slate-block-artwork)"
          stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
          strokeWidth="2.2"
        />
        <rect
          x={inverterPt.x - 32}
          y={inverterPt.y - 15}
          width="64"
          height="26"
          rx="4"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          opacity="0.8"
        />

        {/* 800V HV Orange Power Cables Plumbed to Motor & Battery */}
        <path
          d={`M ${inverterPt.x - 20} ${inverterPt.y + 14} C ${inverterPt.x - 40} ${inverterPt.y + 35} ${motorPt.x + 10} ${motorPt.y - 30} ${motorPt.x} ${motorPt.y - 40}`}
          fill="none"
          stroke="#ea580c"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d={`M ${inverterPt.x - 20} ${inverterPt.y + 14} C ${inverterPt.x - 40} ${inverterPt.y + 35} ${motorPt.x + 10} ${motorPt.y - 30} ${motorPt.x} ${motorPt.y - 40}`}
          fill="none"
          stroke="#fde047"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Digital Status LED & Hybrid Spec Badge */}
        <circle cx={inverterPt.x - 24} cy={inverterPt.y - 4} r="2.5" fill="#38bdf8" className="animate-pulse" />
        <text
          x={inverterPt.x + 5}
          y={inverterPt.y + 2}
          fill="#38bdf8"
          fontSize="7"
          fontFamily="monospace"
          fontWeight="bold"
          textAnchor="middle"
        >
          HYBRID 800V SiC
        </text>
      </g>
    </g>
  );
};
