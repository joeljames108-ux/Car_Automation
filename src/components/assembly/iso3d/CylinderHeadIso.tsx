import React, { useMemo } from "react";
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
 * ═══════════════════════════════════════════════════════════════════
 * 3D ISOMETRIC CYLINDER HEAD ASSEMBLY — Multi-Architecture CNC Head
 * ═══════════════════════════════════════════════════════════════════
 *
 * Dynamically builds precision cylinder heads:
 * - Inline (I3, I4, I6): Single continuous monoblock DOHC head
 * - V-Bank (V6, V8, V10, V12): Dual angled bank heads
 * - Boxer (H4, H6): Dual horizontally opposed bank heads
 * - VR6: Single wide staggered DOHC head
 * - W-Bank: Quad-bank multi-valve heads
 */
const CylinderHeadIsoComponent: React.FC<CylinderHeadIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O = { x: 250, y: 215 };
  const materialGrade = selectedVariants?.cylinder_head || "billet";
  const fills = getIsoMaterialFills(materialGrade);

  const cat = (layoutSpec.category || "").toLowerCase();
  const label = (layoutSpec.label || "").toLowerCase();
  const isV = cat === "vbank" || label.includes("v-") || label.includes("v6") || label.includes("v8") || label.includes("v10") || label.includes("v12");
  const isBoxer = cat === "flat" || label.includes("boxer") || label.includes("h4") || label.includes("h6");
  const isW = cat === "wbank" || label.includes("w12") || label.includes("w16") || label.includes("w18");

  const P = (x: number, y: number, z: number) => projectIso({ x, y, z }, O);

  // Layout-specific dimension configurations
  const config = useMemo(() => {
    if (isBoxer) {
      const isH6 = label.includes("h6") || label.includes("6");
      const BL = isH6 ? 186 : 145;
      const xPositions = isH6 ? [-50, 0, 50] : [-30, 30];
      return { BL, halfL: BL / 2, isDual: true, isBoxer: true, xPositions };
    }
    if (isV || isW) {
      let BL = 230;
      let xPositions = [-85, -51, -17, 17, 51, 85];
      if (label.includes("v6") || label.includes("w12")) {
        BL = 148;
        xPositions = [-38, 0, 38];
      } else if (label.includes("v8") || label.includes("w16")) {
        BL = 180;
        xPositions = [-54, -18, 18, 54];
      } else if (label.includes("v10")) {
        BL = 205;
        xPositions = [-70, -35, 0, 35, 70];
      }
      return { BL, halfL: BL / 2, isDual: true, isBoxer: false, xPositions };
    }
    // Inline (I3, I4, I6)
    let BL = 175;
    let xPositions = [-54, -18, 18, 54];
    if (label.includes("i3") || layoutSpec.cyls.length === 3) {
      BL = 140;
      xPositions = [-38, 0, 38];
    } else if (label.includes("i6") || layoutSpec.cyls.length === 6) {
      BL = 224;
      xPositions = [-85, -51, -17, 17, 51, 85];
    }
    return { BL, halfL: BL / 2, isDual: false, isBoxer: false, xPositions };
  }, [isBoxer, isV, isW, label, layoutSpec.cyls.length]);

  const { BL, halfL, isDual, xPositions } = config;

  const Z_BOT = 148;
  const Z_TOP = 185;

  return (
    <g
      id="iso-cylinder-head-assembly"
      onMouseEnter={() => onHoverComponent?.("cylinder_head")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {/* ── 1. DUAL BANK HEADS (V-Bank & Boxer) ── */}
      {isDual ? (
        <>
          {/* LEFT BANK CYLINDER HEAD */}
          {(() => {
            const botOutFL = P(-halfL - 2, 75, Z_BOT);
            const botOutFR = P(halfL + 2, 75, Z_BOT);
            const botInBL = P(-halfL - 2, 16, Z_BOT);
            const botInBR = P(halfL + 2, 16, Z_BOT);

            const topOutFL = P(-halfL - 2, 62, Z_TOP);
            const topOutFR = P(halfL + 2, 62, Z_TOP);
            const topInBL = P(-halfL - 2, 24, Z_TOP);
            const topInBR = P(halfL + 2, 24, Z_TOP);

            return (
              <g id="left-bank-head">
                {/* Left Outer Exhaust Flank */}
                <path
                  d={`M ${botOutFL.x} ${botOutFL.y} L ${botOutFR.x} ${botOutFR.y} L ${topOutFR.x} ${topOutFR.y} L ${topOutFL.x} ${topOutFL.y} Z`}
                  fill={fills.left}
                  stroke="#090d16"
                  strokeWidth="1.5"
                />
                {/* Left Head Top Deck */}
                <path
                  d={`M ${topOutFL.x} ${topOutFL.y} L ${topOutFR.x} ${topOutFR.y} L ${topInBR.x} ${topInBR.y} L ${topInBL.x} ${topInBL.y} Z`}
                  fill={fills.top}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                {/* Direct Coil-on-Plug Ignition Packs */}
                {xPositions.map((bx, i) => {
                  const cop = P(bx, 43, Z_TOP + 1);
                  return (
                    <g key={`lh-cop-${i}`}>
                      <rect x={cop.x - 6} y={cop.y - 4} width={12} height={8} rx={2} fill="#020617" stroke="#334155" strokeWidth="0.6" />
                      <circle cx={cop.x} cy={cop.y} r={2.5} fill="#0284c7" stroke="#38bdf8" strokeWidth="0.5" />
                    </g>
                  );
                })}
              </g>
            );
          })()}

          {/* RIGHT BANK CYLINDER HEAD */}
          {(() => {
            const botOutFL = P(-halfL - 2, -75, Z_BOT);
            const botOutFR = P(halfL + 2, -75, Z_BOT);
            const botInBL = P(-halfL - 2, -16, Z_BOT);
            const botInBR = P(halfL + 2, -16, Z_BOT);

            const topOutFL = P(-halfL - 2, -62, Z_TOP);
            const topOutFR = P(halfL + 2, -62, Z_TOP);
            const topInBL = P(-halfL - 2, -24, Z_TOP);
            const topInBR = P(halfL + 2, -24, Z_TOP);

            return (
              <g id="right-bank-head">
                <path
                  d={`M ${botOutFL.x} ${botOutFL.y} L ${botOutFR.x} ${botOutFR.y} L ${topOutFR.x} ${topOutFR.y} L ${topOutFL.x} ${topOutFL.y} Z`}
                  fill={fills.right}
                  stroke="#090d16"
                  strokeWidth="1.5"
                />
                <path
                  d={`M ${topInBL.x} ${topInBL.y} L ${topInBR.x} ${topInBR.y} L ${topOutFR.x} ${topOutFR.y} L ${topOutFL.x} ${topOutFL.y} Z`}
                  fill={fills.top}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                {xPositions.map((bx, i) => {
                  const cop = P(bx, -43, Z_TOP + 1);
                  return (
                    <g key={`rh-cop-${i}`}>
                      <rect x={cop.x - 6} y={cop.y - 4} width={12} height={8} rx={2} fill="#020617" stroke="#334155" strokeWidth="0.6" />
                      <circle cx={cop.x} cy={cop.y} r={2.5} fill="#0284c7" stroke="#38bdf8" strokeWidth="0.5" />
                    </g>
                  );
                })}
              </g>
            );
          })()}
        </>
      ) : (
        /* ── 2. SINGLE MONOBLOCK CYLINDER HEAD (Inline I3/I4/I6 & VR6) ── */
        (() => {
          const bFL = P(-halfL, 46, Z_BOT);
          const bFR = P(halfL, 46, Z_BOT);
          const bBR = P(halfL, -46, Z_BOT);
          const bBL = P(-halfL, -46, Z_BOT);

          const tFL = P(-halfL, 46, Z_TOP);
          const tFR = P(halfL, 46, Z_TOP);
          const tBR = P(halfL, -46, Z_TOP);
          const tBL = P(-halfL, -46, Z_TOP);

          return (
            <g id="inline-monoblock-head">
              {/* Front Face */}
              <path
                d={`M ${bFL.x} ${bFL.y} L ${bFR.x} ${bFR.y} L ${tFR.x} ${tFR.y} L ${tFL.x} ${tFL.y} Z`}
                fill={fills.left}
                stroke="#090d16"
                strokeWidth="1.5"
              />
              {/* Right Face */}
              <path
                d={`M ${bFR.x} ${bFR.y} L ${bBR.x} ${bBR.y} L ${tBR.x} ${tBR.y} L ${tFR.x} ${tFR.y} Z`}
                fill={fills.right}
                stroke="#090d16"
                strokeWidth="1.5"
              />
              {/* Top Valve Cover Deck */}
              <path
                d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y} L ${tBL.x} ${tBL.y} Z`}
                fill={fills.top}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              {/* In-Line Spark Plug / Coil-on-Plug Packs */}
              {xPositions.map((bx, i) => {
                const cop = P(bx, 0, Z_TOP + 1);
                return (
                  <g key={`inline-cop-${i}`}>
                    <rect x={cop.x - 7} y={cop.y - 4.5} width={14} height={9} rx={2} fill="#020617" stroke="#334155" strokeWidth="0.6" />
                    <circle cx={cop.x} cy={cop.y} r={2.8} fill="#0284c7" stroke="#38bdf8" strokeWidth="0.5" />
                  </g>
                );
              })}
            </g>
          );
        })()
      )}
    </g>
  );
};

export const CylinderHeadIso = React.memo(CylinderHeadIsoComponent);
