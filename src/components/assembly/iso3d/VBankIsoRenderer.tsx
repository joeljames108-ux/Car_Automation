import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIsoTiltedEllipse } from "./isoMath";

interface VBankIsoRendererProps {
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
 * Isolated 90° V-Angle Cylinder Array Renderer
 * Renders ONLY the 12 Standalone 3D Cylinder Sleeves (6 Left Bank & 6 Right Bank) angled at 90°
 * Strips away all outer engine block castings, oil pan, and housing walls.
 */
export const VBankIsoRenderer: React.FC<VBankIsoRendererProps> = ({
  blockState,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 215 };

  return (
    <g
      id="iso-block-cylinders-only"
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
      {/* ── 12 STANDALONE 3D ISOMETRIC CYLINDER SLEEVES (6 LEFT BANK, 6 RIGHT BANK @ 90° V-SPAN) ── */}
      <g id="v12-isolated-cylinders">
        {Array.from({ length: 6 }).map((_, idx) => {
          const boreX = -85 + idx * 34; // 6 perfectly spaced cylinders from X = -85 to +85

          // Left Bank Cylinder (Top @ Y = +50, Z = 142.5; Bottom @ Y = +14, Z = 60 — 45° slope)
          const leftTopIso = projectIsoTiltedEllipse({ x: boreX, y: 50, z: 142.5 }, 16, "left", originScreen);
          const leftBotIso = projectIsoTiltedEllipse({ x: boreX, y: 14, z: 60 }, 16, "left", originScreen);

          // Right Bank Cylinder (Top @ Y = -50, Z = 142.5; Bottom @ Y = -14, Z = 60 — 45° slope)
          const rightTopIso = projectIsoTiltedEllipse({ x: boreX, y: -50, z: 142.5 }, 16, "right", originScreen);
          const rightBotIso = projectIsoTiltedEllipse({ x: boreX, y: -14, z: 60 }, 16, "right", originScreen);

          return (
            <g key={`v12-isolated-cylinder-pair-${idx}`}>
              {/* ────────────────────────────────────────────────────────── */}
              {/* ── LEFT BANK CYLINDER SLEEVE (Cylinder #${idx + 1} Left) ── */}
              {/* ────────────────────────────────────────────────────────── */}

              {/* 1. Outer Metallic Cylinder Wall Casing Body */}
              <path
                d={`M ${leftTopIso.cx - leftTopIso.rx - 4} ${leftTopIso.cy} L ${leftBotIso.cx - leftTopIso.rx - 4} ${leftBotIso.cy} A ${leftTopIso.rx + 4} ${leftTopIso.ry + 2.5} 0 0 0 ${leftBotIso.cx + leftTopIso.rx + 4} ${leftBotIso.cy} L ${leftTopIso.cx + leftTopIso.rx + 4} ${leftTopIso.cy} Z`}
                fill="url(#v-bank-left-wall)"
                stroke="#090d16"
                strokeWidth="2.2"
              />

              {/* 2. Top Flange Rim Collar */}
              <ellipse
                cx={leftTopIso.cx}
                cy={leftTopIso.cy}
                rx={leftTopIso.rx + 5.5}
                ry={leftTopIso.ry + 3.5}
                fill="url(#v-deck-surface-left)"
                stroke="#090d16"
                strokeWidth="2.2"
                transform={`rotate(${leftTopIso.tiltDeg}, ${leftTopIso.cx}, ${leftTopIso.cy})`}
              />

              {/* 3. Deep 3D Bore Shaft Interior */}
              <path
                d={`M ${leftTopIso.cx - leftTopIso.rx} ${leftTopIso.cy} L ${leftBotIso.cx - leftTopIso.rx} ${leftBotIso.cy} A ${leftTopIso.rx} ${leftTopIso.ry} 0 0 0 ${leftBotIso.cx + leftTopIso.rx} ${leftBotIso.cy} L ${leftTopIso.cx + leftTopIso.rx} ${leftTopIso.cy} Z`}
                fill="url(#bore-3d-depth)"
                stroke="#090d16"
                strokeWidth="1.8"
              />

              {/* 4. Honing Cross-Hatch Texture Overlay */}
              <path
                d={`M ${leftTopIso.cx - leftTopIso.rx + 2} ${leftTopIso.cy} L ${leftBotIso.cx - leftTopIso.rx + 2} ${leftBotIso.cy} A ${leftTopIso.rx - 2} ${leftTopIso.ry - 1} 0 0 0 ${leftBotIso.cx + leftTopIso.rx - 2} ${leftBotIso.cy} L ${leftTopIso.cx + leftTopIso.rx - 2} ${leftTopIso.cy} Z`}
                fill="url(#honing-crosshatch-pattern)"
                opacity="0.65"
              />

              {/* 5. Inner Chamfered Bore Opening Lip & Specular Ring */}
              <ellipse
                cx={leftTopIso.cx}
                cy={leftTopIso.cy}
                rx={leftTopIso.rx}
                ry={leftTopIso.ry}
                fill="none"
                stroke="#090d16"
                strokeWidth="2.5"
                transform={`rotate(${leftTopIso.tiltDeg}, ${leftTopIso.cx}, ${leftTopIso.cy})`}
              />
              <ellipse
                cx={leftTopIso.cx}
                cy={leftTopIso.cy}
                rx={leftTopIso.rx - 1}
                ry={leftTopIso.ry - 0.5}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.6"
                opacity="0.95"
                transform={`rotate(${leftTopIso.tiltDeg}, ${leftTopIso.cx}, ${leftTopIso.cy})`}
              />

              {/* 6. Base Flange Sleeve Ring at Bottom */}
              <ellipse
                cx={leftBotIso.cx}
                cy={leftBotIso.cy}
                rx={leftBotIso.rx + 3}
                ry={leftBotIso.ry + 2}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.8"
                transform={`rotate(${leftBotIso.tiltDeg}, ${leftBotIso.cx}, ${leftBotIso.cy})`}
              />


              {/* ─────────────────────────────────────────────────────────── */}
              {/* ── RIGHT BANK CYLINDER SLEEVE (Cylinder #${idx + 1} Right) ── */}
              {/* ─────────────────────────────────────────────────────────── */}

              {/* 1. Outer Metallic Cylinder Wall Casing Body */}
              <path
                d={`M ${rightTopIso.cx - rightTopIso.rx - 4} ${rightTopIso.cy} L ${rightBotIso.cx - rightTopIso.rx - 4} ${rightBotIso.cy} A ${rightTopIso.rx + 4} ${rightTopIso.ry + 2.5} 0 0 0 ${rightBotIso.cx + rightTopIso.rx + 4} ${rightBotIso.cy} L ${rightTopIso.cx + rightTopIso.rx + 4} ${rightTopIso.cy} Z`}
                fill="url(#v-bank-right-wall)"
                stroke="#090d16"
                strokeWidth="2.2"
              />

              {/* 2. Top Flange Rim Collar */}
              <ellipse
                cx={rightTopIso.cx}
                cy={rightTopIso.cy}
                rx={rightTopIso.rx + 5.5}
                ry={rightTopIso.ry + 3.5}
                fill="url(#v-deck-surface-right)"
                stroke="#090d16"
                strokeWidth="2.2"
                transform={`rotate(${rightTopIso.tiltDeg}, ${rightTopIso.cx}, ${rightTopIso.cy})`}
              />

              {/* 3. Deep 3D Bore Shaft Interior */}
              <path
                d={`M ${rightTopIso.cx - rightTopIso.rx} ${rightTopIso.cy} L ${rightBotIso.cx - rightTopIso.rx} ${rightBotIso.cy} A ${rightTopIso.rx} ${rightTopIso.ry} 0 0 0 ${rightBotIso.cx + rightTopIso.rx} ${rightBotIso.cy} L ${rightTopIso.cx + rightTopIso.rx} ${rightTopIso.cy} Z`}
                fill="url(#bore-3d-depth)"
                stroke="#090d16"
                strokeWidth="1.8"
              />

              {/* 4. Honing Cross-Hatch Texture Overlay */}
              <path
                d={`M ${rightTopIso.cx - rightTopIso.rx + 2} ${rightTopIso.cy} L ${rightBotIso.cx - rightTopIso.rx + 2} ${rightBotIso.cy} A ${rightTopIso.rx - 2} ${rightTopIso.ry - 1} 0 0 0 ${rightBotIso.cx + rightTopIso.rx - 2} ${rightBotIso.cy} L ${rightTopIso.cx + rightTopIso.rx - 2} ${rightTopIso.cy} Z`}
                fill="url(#honing-crosshatch-pattern)"
                opacity="0.65"
              />

              {/* 5. Inner Chamfered Bore Opening Lip & Specular Ring */}
              <ellipse
                cx={rightTopIso.cx}
                cy={rightTopIso.cy}
                rx={rightTopIso.rx}
                ry={rightTopIso.ry}
                fill="none"
                stroke="#090d16"
                strokeWidth="2.5"
                transform={`rotate(${rightTopIso.tiltDeg}, ${rightTopIso.cx}, ${rightTopIso.cy})`}
              />
              <ellipse
                cx={rightTopIso.cx}
                cy={rightTopIso.cy}
                rx={rightTopIso.rx - 1}
                ry={rightTopIso.ry - 0.5}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.6"
                opacity="0.95"
                transform={`rotate(${rightTopIso.tiltDeg}, ${rightTopIso.cx}, ${rightTopIso.cy})`}
              />

              {/* 6. Base Flange Sleeve Ring at Bottom */}
              <ellipse
                cx={rightBotIso.cx}
                cy={rightBotIso.cy}
                rx={rightBotIso.rx + 3}
                ry={rightBotIso.ry + 2}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                opacity="0.8"
                transform={`rotate(${rightBotIso.tiltDeg}, ${rightBotIso.cx}, ${rightBotIso.cy})`}
              />
            </g>
          );
        })}
      </g>
    </g>
  );
};
