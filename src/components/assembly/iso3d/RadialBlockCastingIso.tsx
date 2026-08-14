import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface RadialBlockCastingIsoProps {
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
 * Photorealistic 3D Isometric Radial Aircraft Engine Block Casting
 * Renders central circular crankcase housing with 9 radially-spaced cylinder barrels,
 * cooling fins, master-rod hub center, nose gear section, and pushrod tube mounts.
 */
export const RadialBlockCastingIso: React.FC<RadialBlockCastingIsoProps> = ({
  layoutSpec,
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 220 };
  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  const crankcaseRadius = 55;
  const cylinderLength = 50;
  const numCylinders = 9;

  const centerIso = projectIso({ x: 0, y: 0, z: 60 }, originScreen);
  const shadowCenter = projectIso({ x: 0, y: 0, z: 0 }, originScreen);

  return (
    <g
      id="iso-block-radial"
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
        cy={shadowCenter.y + 25}
        rx="120"
        ry="45"
        fill="url(#iso-ground-shadow)"
      />

      {/* 9 Radially Arrayed Cylinder Barrels */}
      {Array.from({ length: numCylinders }).map((_, idx) => {
        const angle = (idx * (360 / numCylinders) * Math.PI) / 180;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // 3D position of inner base and outer tip of cylinder barrel
        const inner3D = {
          x: cosA * crankcaseRadius,
          y: sinA * crankcaseRadius,
          z: 60,
        };
        const outer3D = {
          x: cosA * (crankcaseRadius + cylinderLength),
          y: sinA * (crankcaseRadius + cylinderLength),
          z: 60 + sinA * 15,
        };

        const pInner = projectIso(inner3D, originScreen);
        const pOuter = projectIso(outer3D, originScreen);

        return (
          <g key={`radial-cyl-${idx}`}>
            {/* Cylinder Barrel Main Core */}
            <line
              x1={pInner.x}
              y1={pInner.y}
              x2={pOuter.x}
              y2={pOuter.y}
              stroke="url(#cylinder-tube-3d)"
              strokeWidth="24"
              strokeLinecap="round"
            />

            {/* Individual Cooling Fins (6 fin rings per barrel) */}
            {[0.2, 0.35, 0.5, 0.65, 0.8, 0.92].map((fRatio, fIdx) => {
              const fX = pInner.x + (pOuter.x - pInner.x) * fRatio;
              const fY = pInner.y + (pOuter.y - pInner.y) * fRatio;
              return (
                <ellipse
                  key={`fin-${fIdx}`}
                  cx={fX}
                  cy={fY}
                  rx="14"
                  ry="8"
                  fill="none"
                  stroke={fills.top}
                  strokeWidth="2"
                />
              );
            })}

            {/* Cylinder Head Rocker Covers & Valve Caps */}
            <circle
              cx={pOuter.x}
              cy={pOuter.y}
              r="10"
              fill="url(#brushed-head)"
              stroke="#090d16"
              strokeWidth="2"
            />
            <circle cx={pOuter.x} cy={pOuter.y} r="5" fill="url(#bore-3d-depth)" />

            {/* Dual Pushrod Tubes */}
            <line
              x1={pInner.x - 6}
              y1={pInner.y - 2}
              x2={pOuter.x - 6}
              y2={pOuter.y - 2}
              stroke="url(#chrome-3d)"
              strokeWidth="2"
            />
            <line
              x1={pInner.x + 6}
              y1={pInner.y + 2}
              x2={pOuter.x + 6}
              y2={pOuter.y + 2}
              stroke="url(#chrome-3d)"
              strokeWidth="2"
            />
          </g>
        );
      })}

      {/* Central Circular Main Crankcase Nose Drum */}
      <ellipse
        cx={centerIso.x}
        cy={centerIso.y}
        rx="58"
        ry="36"
        fill={fills.front}
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="3.2"
      />
      <ellipse
        cx={centerIso.x}
        cy={centerIso.y - 3}
        rx="54"
        ry="32"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.8"
        opacity="0.9"
      />

      {/* Front Shaft Thrust Bearing Hub */}
      <circle
        cx={centerIso.x}
        cy={centerIso.y}
        r="22"
        fill="url(#journal-polished-chrome)"
        stroke="#090d16"
        strokeWidth="2.2"
      />
      <circle cx={centerIso.x} cy={centerIso.y} r="12" fill="#020617" stroke="#38bdf8" strokeWidth="1" />

      {/* Circular Crankcase Mounting Stud Ring */}
      {Array.from({ length: 12 }).map((_, bIdx) => {
        const bAng = (bIdx * (360 / 12) * Math.PI) / 180;
        const bX = centerIso.x + Math.cos(bAng) * 44;
        const bY = centerIso.y + Math.sin(bAng) * 26;
        return (
          <circle
            key={`radial-stud-${bIdx}`}
            cx={bX}
            cy={bY}
            r="2.5"
            fill="url(#bolt-boss-3d)"
            stroke="#090d16"
            strokeWidth="0.8"
          />
        );
      })}
    </g>
  );
};
