import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, projectIso60VEllipse, projectIsoEllipse } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface IntakeManifoldIsoProps {
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
 * 3D ISOMETRIC INTAKE MANIFOLD & ITB SYSTEM — Multi-Architecture
 * ═══════════════════════════════════════════════════════════════════
 *
 * Dynamically builds intake systems per architecture:
 * - Inline (I3, I4, I6): Forward-facing carbon/billet plenum with individual velocity stack runners
 * - V-Bank (V6, V8, V10, V12): Dual bank individual throttle bodies (ITBs) or cross-ram intake
 * - Boxer (H4, H6): Symmetrical dual-plenum intake runners
 * - W-Bank: Central quad-feed plenum box
 */
const IntakeManifoldIsoComponent: React.FC<IntakeManifoldIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O = useMemo(() => ({ x: 250, y: 215 }), []);
  const materialGrade = selectedVariants?.intake_manifold || "carbon";
  const fills = useMemo(() => getIsoMaterialFills(materialGrade), [materialGrade]);

  const cat = (layoutSpec.category || "").toLowerCase();
  const label = (layoutSpec.label || "").toLowerCase();
  const isV = cat === "vbank" || label.includes("v-") || label.includes("v6") || label.includes("v8") || label.includes("v10") || label.includes("v12");
  const isBoxer = cat === "flat" || label.includes("boxer") || label.includes("h4") || label.includes("h6");
  const isW = cat === "wbank" || label.includes("w12") || label.includes("w16") || label.includes("w18");

  const P = (x: number, y: number, z: number) => projectIso({ x, y, z }, O);

  const config = useMemo(() => {
    if (isBoxer) {
      const isH6 = label.includes("h6") || label.includes("6");
      const xPositions = isH6 ? [-50, 0, 50] : [-30, 30];
      return { isDual: true, xPositions, leftY: 45, rightY: -45, topZ: 145 };
    }
    if (isV || isW) {
      let xPositions = [-85, -51, -17, 17, 51, 85];
      if (label.includes("v6") || label.includes("w12")) {
        xPositions = [-38, 0, 38];
      } else if (label.includes("v8") || label.includes("w16")) {
        xPositions = [-54, -18, 18, 54];
      } else if (label.includes("v10")) {
        xPositions = [-70, -35, 0, 35, 70];
      }
      return { isDual: true, xPositions, leftY: 42, rightY: -42, topZ: 185 };
    }
    // Inline (I3, I4, I6)
    let xPositions = [-54, -18, 18, 54];
    if (label.includes("i3") || layoutSpec.cyls.length === 3) {
      xPositions = [-38, 0, 38];
    } else if (label.includes("i6") || layoutSpec.cyls.length === 6) {
      xPositions = [-85, -51, -17, 17, 51, 85];
    }
    return { isDual: false, xPositions, leftY: 0, rightY: 0, topZ: 185 };
  }, [isBoxer, isV, isW, label, layoutSpec.cyls.length]);

  const { isDual, xPositions, leftY, rightY, topZ } = config;

  return (
    <g
      id="iso-intake-manifold-assembly"
      onMouseEnter={() => onHoverComponent?.("intake_manifold")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {/* ── DUAL BANK VELOCITY STACKS (V-Bank & Boxer) ── */}
      {isDual ? (
        <>
          {/* Left Bank ITB Trumpets */}
          {xPositions.map((bx, idx) => {
            const basePt = P(bx, leftY, topZ);
            const topPt = P(bx, leftY, topZ + 36);
            const bellmouth = projectIso60VEllipse({ x: bx, y: leftY, z: topZ + 36 }, 13, "left", O);
            return (
              <g key={`left-stack-${idx}`}>
                <line x1={basePt.x} y1={basePt.y} x2={topPt.x} y2={topPt.y} stroke={fills.left} strokeWidth="12" strokeLinecap="round" />
                <ellipse cx={bellmouth.cx} cy={bellmouth.cy} rx={bellmouth.rx} ry={bellmouth.ry}
                  transform={`rotate(${bellmouth.tiltDeg}, ${bellmouth.cx}, ${bellmouth.cy})`}
                  fill={fills.top} stroke="#38bdf8" strokeWidth="1.2" />
                <circle cx={bellmouth.cx} cy={bellmouth.cy} r={4.5} fill="#020617" />
              </g>
            );
          })}

          {/* Right Bank ITB Trumpets */}
          {xPositions.map((bx, idx) => {
            const basePt = P(bx, rightY, topZ);
            const topPt = P(bx, rightY, topZ + 36);
            const bellmouth = projectIso60VEllipse({ x: bx, y: rightY, z: topZ + 36 }, 13, "right", O);
            return (
              <g key={`right-stack-${idx}`}>
                <line x1={basePt.x} y1={basePt.y} x2={topPt.x} y2={topPt.y} stroke={fills.right} strokeWidth="12" strokeLinecap="round" />
                <ellipse cx={bellmouth.cx} cy={bellmouth.cy} rx={bellmouth.rx} ry={bellmouth.ry}
                  transform={`rotate(${bellmouth.tiltDeg}, ${bellmouth.cx}, ${bellmouth.cy})`}
                  fill={fills.top} stroke="#38bdf8" strokeWidth="1.2" />
                <circle cx={bellmouth.cx} cy={bellmouth.cy} r={4.5} fill="#020617" />
              </g>
            );
          })}

          {/* Central Carbon Fiber Intake Fuel Rail */}
          {(() => {
            const railL = P(xPositions[0] - 12, 0, topZ + 22);
            const railR = P(xPositions[xPositions.length - 1] + 12, 0, topZ + 22);
            return (
              <g>
                <line x1={railL.x} y1={railL.y} x2={railR.x} y2={railR.y} stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
                <line x1={railL.x} y1={railL.y - 1} x2={railR.x} y2={railR.y - 1} stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            );
          })()}
        </>
      ) : (
        /* ── SINGLE INLINE PLENUM & CURVED RUNNERS ── */
        (() => {
          const minX = xPositions[0] - 16;
          const maxX = xPositions[xPositions.length - 1] + 16;
          const pStart = P(minX, -28, topZ + 20);
          const pEnd = P(maxX, -28, topZ + 20);

          return (
            <g id="inline-plenum-assembly">
              {/* Individual curved intake runners */}
              {xPositions.map((bx, idx) => {
                const portPt = P(bx, 0, topZ);
                const plenumPt = P(bx, -28, topZ + 20);
                return (
                  <g key={`inline-runner-${idx}`}>
                    <path
                      d={`M ${portPt.x} ${portPt.y} Q ${portPt.x - 5} ${portPt.y - 15} ${plenumPt.x} ${plenumPt.y}`}
                      stroke={fills.left}
                      strokeWidth="11"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${portPt.x} ${portPt.y} Q ${portPt.x - 5} ${portPt.y - 15} ${plenumPt.x} ${plenumPt.y}`}
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      fill="none"
                      opacity="0.4"
                    />
                  </g>
                );
              })}

              {/* Main Carbon Plenum Chamber Tube */}
              <line x1={pStart.x} y1={pStart.y} x2={pEnd.x} y2={pEnd.y} stroke="url(#carbon-twill)" strokeWidth="22" strokeLinecap="round" />
              <line x1={pStart.x} y1={pStart.y} x2={pEnd.x} y2={pEnd.y} stroke="#090d16" strokeWidth="23" strokeLinecap="round" opacity="0.3" />
              <line x1={pStart.x} y1={pStart.y - 4} x2={pEnd.x} y2={pEnd.y - 4} stroke="#ffffff" strokeWidth="2" opacity="0.6" strokeLinecap="round" />

              {/* Big Throttle Body Inlet at front end */}
              {(() => {
                const tbPt = P(minX - 10, -28, topZ + 20);
                return (
                  <g>
                    <circle cx={tbPt.x} cy={tbPt.y} r={14} fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx={tbPt.x} cy={tbPt.y} r={9} fill="#020617" />
                    <ellipse cx={tbPt.x} cy={tbPt.y} rx={8} ry={2} fill="#eab308" opacity="0.7" />
                  </g>
                );
              })()}
            </g>
          );
        })()
      )}
    </g>
  );
};

export const IntakeManifoldIso = React.memo(IntakeManifoldIsoComponent);
