import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, projectIso60VEllipse, projectIsoEllipse } from "./isoMath";

interface HeadGasketIsoProps {
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
 * 3D ISOMETRIC MLS HEAD GASKET — Multi-Architecture Precision Gasket
 * ═══════════════════════════════════════════════════════════════════
 *
 * Multi-layer steel (MLS) or copper head gaskets with stainless fire-rings,
 * coolant passage perforations, and dowel locating holes.
 */
const HeadGasketIsoComponent: React.FC<HeadGasketIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = useMemo(() => ({ x: 250, y: 215 }), []);
  const materialGrade = selectedVariants?.head_gasket || "copper";

  const cat = (layoutSpec.category || "").toLowerCase();
  const label = (layoutSpec.label || "").toLowerCase();
  const isV = cat === "vbank" || label.includes("v-") || label.includes("v6") || label.includes("v8") || label.includes("v10") || label.includes("v12");
  const isBoxer = cat === "flat" || label.includes("boxer") || label.includes("h4") || label.includes("h6");
  const isW = cat === "wbank" || label.includes("w12") || label.includes("w16") || label.includes("w18");

  const plateFill = materialGrade === "copper" ? "url(#mls-copper-plate)" : "url(#rod-hbeam-shank)";
  const strokeColor = materialGrade === "copper" ? "#7c2d12" : "#090d16";

  const config = useMemo(() => {
    if (isBoxer) {
      const isH6 = label.includes("h6") || label.includes("6");
      const BL = isH6 ? 186 : 145;
      const xPositions = isH6 ? [-50, 0, 50] : [-30, 30];
      return { BL, halfL: BL / 2, isDual: true, xPositions };
    }
    if (isV || isW) {
      let BL = 220;
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
      return { BL, halfL: BL / 2, isDual: true, xPositions };
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
    return { BL, halfL: BL / 2, isDual: false, xPositions };
  }, [isBoxer, isV, isW, label, layoutSpec.cyls.length]);

  const { BL, halfL, isDual, xPositions } = config;
  const DECK_Z = 147;

  return (
    <g
      id="iso-head-gasket-assembly"
      onMouseEnter={() => onHoverComponent?.("head_gasket")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {isDual ? (
        <>
          {/* LEFT BANK MLS GASKET */}
          {(() => {
            const fl = projectIso({ x: -halfL - 2, y: 82, z: 147 }, originScreen);
            const fr = projectIso({ x: halfL + 2, y: 82, z: 147 }, originScreen);
            const br = projectIso({ x: halfL + 2, y: 16, z: 147 }, originScreen);
            const bl = projectIso({ x: -halfL - 2, y: 16, z: 147 }, originScreen);

            return (
              <g id="left-gasket">
                <path
                  d={`M ${fl.x} ${fl.y} L ${fr.x} ${fr.y} L ${br.x} ${br.y} L ${bl.x} ${bl.y} Z`}
                  fill={plateFill}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />
                {/* Bore Fire-Rings */}
                {xPositions.map((bx, i) => {
                  const ring = projectIso60VEllipse({ x: bx, y: 49, z: 147 }, 16, "left", originScreen);
                  return (
                    <ellipse
                      key={`l-fire-ring-${i}`}
                      cx={ring.cx}
                      cy={ring.cy}
                      rx={ring.rx}
                      ry={ring.ry}
                      transform={`rotate(${ring.tiltDeg}, ${ring.cx}, ${ring.cy})`}
                      fill="#020617"
                      stroke="#e2e8f0"
                      strokeWidth="1.2"
                    />
                  );
                })}
              </g>
            );
          })()}

          {/* RIGHT BANK MLS GASKET */}
          {(() => {
            const fl = projectIso({ x: -halfL - 2, y: -82, z: 147 }, originScreen);
            const fr = projectIso({ x: halfL + 2, y: -82, z: 147 }, originScreen);
            const br = projectIso({ x: halfL + 2, y: -16, z: 147 }, originScreen);
            const bl = projectIso({ x: -halfL - 2, y: -16, z: 147 }, originScreen);

            return (
              <g id="right-gasket">
                <path
                  d={`M ${fl.x} ${fl.y} L ${fr.x} ${fr.y} L ${br.x} ${br.y} L ${bl.x} ${bl.y} Z`}
                  fill={plateFill}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                />
                {xPositions.map((bx, i) => {
                  const ring = projectIso60VEllipse({ x: bx, y: -49, z: 147 }, 16, "right", originScreen);
                  return (
                    <ellipse
                      key={`r-fire-ring-${i}`}
                      cx={ring.cx}
                      cy={ring.cy}
                      rx={ring.rx}
                      ry={ring.ry}
                      transform={`rotate(${ring.tiltDeg}, ${ring.cx}, ${ring.cy})`}
                      fill="#020617"
                      stroke="#e2e8f0"
                      strokeWidth="1.2"
                    />
                  );
                })}
              </g>
            );
          })()}
        </>
      ) : (
        /* SINGLE INLINE MLS GASKET */
        (() => {
          const fl = projectIso({ x: -halfL - 2, y: 46, z: DECK_Z }, originScreen);
          const fr = projectIso({ x: halfL + 2, y: 46, z: DECK_Z }, originScreen);
          const br = projectIso({ x: halfL + 2, y: -46, z: DECK_Z }, originScreen);
          const bl = projectIso({ x: -halfL - 2, y: -46, z: DECK_Z }, originScreen);

          return (
            <g id="inline-gasket">
              <path
                d={`M ${fl.x} ${fl.y} L ${fr.x} ${fr.y} L ${br.x} ${br.y} L ${bl.x} ${bl.y} Z`}
                fill={plateFill}
                stroke={strokeColor}
                strokeWidth="1.5"
              />
              {/* In-Line Bore Fire-Rings */}
              {xPositions.map((bx, i) => {
                const ring = projectIsoEllipse({ x: bx, y: 0, z: DECK_Z }, 18, originScreen);
                return (
                  <ellipse
                    key={`inline-fire-ring-${i}`}
                    cx={ring.cx}
                    cy={ring.cy}
                    rx={ring.rx}
                    ry={ring.ry}
                    fill="#020617"
                    stroke="#e2e8f0"
                    strokeWidth="1.2"
                  />
                );
              })}
            </g>
          );
        })()
      )}
    </g>
  );
};

export const HeadGasketIso = React.memo(HeadGasketIsoComponent);
