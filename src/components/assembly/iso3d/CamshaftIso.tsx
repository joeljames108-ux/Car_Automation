import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, projectIso60VEllipse } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface CamshaftIsoProps {
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
 * 3D ISOMETRIC DOHC CAMSHAFTS & VVT PHASERS — Multi-Architecture
 * ═══════════════════════════════════════════════════════════════════
 *
 * Precision hollow billet steel camshafts with CNC ground egg-shaped lobes,
 * VVT variable valve timing phaser sprockets, and bearing journals.
 */
const CamshaftIsoComponent: React.FC<CamshaftIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = useMemo(() => ({ x: 250, y: 215 }), []);
  const materialGrade = selectedVariants?.camshaft || "forged";
  const fills = useMemo(() => getIsoMaterialFills(materialGrade), [materialGrade]);

  const cat = (layoutSpec.category || "").toLowerCase();
  const label = (layoutSpec.label || "").toLowerCase();
  const isV = cat === "vbank" || label.includes("v-") || label.includes("v6") || label.includes("v8") || label.includes("v10") || label.includes("v12");
  const isBoxer = cat === "flat" || label.includes("boxer") || label.includes("h4") || label.includes("h6");
  const isW = cat === "wbank" || label.includes("w12") || label.includes("w16") || label.includes("w18");

  const isQuadCam = isV || isBoxer || isW;

  const config = useMemo(() => {
    if (isBoxer) {
      const isH6 = label.includes("h6") || label.includes("6");
      const blockW = isH6 ? 186 : 145;
      const xPositions = isH6 ? [-50, 0, 50] : [-30, 30];
      return { blockW, xPositions };
    }
    if (isV || isW) {
      let blockW = 230;
      let xPositions = [-85, -51, -17, 17, 51, 85];
      if (label.includes("v6") || label.includes("w12")) {
        blockW = 148;
        xPositions = [-38, 0, 38];
      } else if (label.includes("v8") || label.includes("w16")) {
        blockW = 180;
        xPositions = [-54, -18, 18, 54];
      } else if (label.includes("v10")) {
        blockW = 205;
        xPositions = [-70, -35, 0, 35, 70];
      }
      return { blockW, xPositions };
    }
    // Inline (I3, I4, I6)
    let blockW = 175;
    let xPositions = [-54, -18, 18, 54];
    if (label.includes("i3") || layoutSpec.cyls.length === 3) {
      blockW = 140;
      xPositions = [-38, 0, 38];
    } else if (label.includes("i6") || layoutSpec.cyls.length === 6) {
      blockW = 224;
      xPositions = [-85, -51, -17, 17, 51, 85];
    }
    return { blockW, xPositions };
  }, [isBoxer, isV, isW, label, layoutSpec.cyls.length]);

  const { blockW, xPositions } = config;

  // Camshaft Shaft Layout Specs
  const camSpecs = isQuadCam
    ? [
        { id: "right-intake", bankSide: "right", camType: "intake", y: -52, z: 182, tiltDeg: 30 },
        { id: "right-exhaust", bankSide: "right", camType: "exhaust", y: -36, z: 182, tiltDeg: 30 },
        { id: "left-exhaust", bankSide: "left", camType: "exhaust", y: 36, z: 182, tiltDeg: -25 },
        { id: "left-intake", bankSide: "left", camType: "intake", y: 52, z: 182, tiltDeg: -25 },
      ]
    : [
        { id: "inline-exhaust", bankSide: "inline", camType: "exhaust", y: 16, z: 182, tiltDeg: 0 },
        { id: "inline-intake", bankSide: "inline", camType: "intake", y: -16, z: 182, tiltDeg: 0 },
      ];

  return (
    <g
      id="iso-camshaft-assembly"
      onMouseEnter={() => onHoverComponent?.("camshaft")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {camSpecs.map((cam) => {
        const startPt = projectIso({ x: -blockW / 2 - 8, y: cam.y, z: cam.z }, originScreen);
        const endPt = projectIso({ x: blockW / 2 + 8, y: cam.y, z: cam.z }, originScreen);

        return (
          <g key={`camshaft-tube-${cam.id}`} id={`cam-${cam.id}`}>
            {/* 1. CAMSHAFT MAIN SHAFT TUBE */}
            <line
              x1={startPt.x}
              y1={startPt.y}
              x2={endPt.x}
              y2={endPt.y}
              stroke="url(#rod-hbeam-shank)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Specular Highlight Line */}
            <line
              x1={startPt.x}
              y1={startPt.y - 2}
              x2={endPt.x}
              y2={endPt.y - 2}
              stroke="#ffffff"
              strokeWidth="1.5"
              opacity="0.9"
            />

            {/* 2. FRONT VVT PHASER TIMING GEAR */}
            <circle cx={startPt.x} cy={startPt.y} r="14" fill="#090d16" />
            <circle cx={startPt.x} cy={startPt.y} r="12.5" fill={fills.left} stroke="#090d16" strokeWidth="1.5" />
            <circle cx={startPt.x} cy={startPt.y} r="11" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
            <circle cx={startPt.x} cy={startPt.y} r="5" fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="0.8" />
            <circle cx={startPt.x} cy={startPt.y} r="2" fill="#020617" />

            {/* 3. PRECISION GROUND EGG-SHAPED CAM LOBES */}
            {xPositions.map((bx, idx) => {
              const isOdd = idx % 2 === 1;
              const lobe1Pt = projectIso({ x: bx - 7, y: cam.y, z: cam.z }, originScreen);
              const lobe2Pt = projectIso({ x: bx + 7, y: cam.y, z: cam.z }, originScreen);

              return (
                <g key={`cam-lobes-${cam.id}-${idx}`}>
                  {/* Lobe 1 */}
                  <ellipse
                    cx={lobe1Pt.x}
                    cy={lobe1Pt.y}
                    rx="6.5"
                    ry="9"
                    transform={`rotate(${cam.tiltDeg + (isOdd ? 45 : -45)}, ${lobe1Pt.x}, ${lobe1Pt.y})`}
                    fill="url(#bearing-saddle-chrome)"
                    stroke="#090d16"
                    strokeWidth="1"
                  />
                  {/* Lobe 2 */}
                  <ellipse
                    cx={lobe2Pt.x}
                    cy={lobe2Pt.y}
                    rx="6.5"
                    ry="9"
                    transform={`rotate(${cam.tiltDeg + (isOdd ? -45 : 45)}, ${lobe2Pt.x}, ${lobe2Pt.y})`}
                    fill="url(#bearing-saddle-chrome)"
                    stroke="#090d16"
                    strokeWidth="1"
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

export const CamshaftIso = React.memo(CamshaftIsoComponent);
