import React from "react";
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
 * Photorealistic 3D Isometric Quad-Cam DOHC Camshaft & VVT Timing Gear Drive System Renderer
 * Perfectly depth-sorted and aligned across all 12 Cylinders (Distal Rear Bank & Proximal Front Bank):
 * - 4 Precision Forged Camshaft Bars (Rear Intake/Exhaust & Front Intake/Exhaust)
 * - 48 High-Lift CNC Cam Lobes aligned directly above the 48 valve retainers
 * - 4 Large Variable Valve Timing (VVT) Phaser Timing Gears / Sprockets at the front (X = 115)
 * - Synchronized Multi-Row Timing Chain Drive Loop connecting Crankshaft Gear (X = 115, Y = 0, Z = 60) to Quad-Cam Sprockets
 */
export const CamshaftIso: React.FC<CamshaftIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 215 };
  const materialGrade = selectedVariants?.camshaft || "forged";
  const fills = getIsoMaterialFills(materialGrade);

  const isVEngine = layoutSpec.category === "V" || layoutSpec.label?.includes("V") || layoutSpec.cyls.length >= 8;

  const blockW = 230; // Matches V12 block length

  // Quad Camshaft Shaft Specifications (Depth Sorted: Rear Distal Y < 0 first, Front Proximal Y > 0 second)
  const camSpecs: {
    id: string;
    bankSide: "left" | "right" | "inline";
    camType: "intake" | "exhaust";
    y: number;
    z: number;
    tiltDeg: number;
  }[] = isVEngine
    ? [
        // Distal Rear Bank (6 Cylinders Facing Away @ Y < 0)
        { id: "right-intake", bankSide: "right", camType: "intake", y: -52, z: 182, tiltDeg: 30 },
        { id: "right-exhaust", bankSide: "right", camType: "exhaust", y: -36, z: 182, tiltDeg: 30 },
        // Proximal Front Bank (6 Cylinders Facing Us @ Y > 0)
        { id: "left-exhaust", bankSide: "left", camType: "exhaust", y: 36, z: 182, tiltDeg: -25 },
        { id: "left-intake", bankSide: "left", camType: "intake", y: 52, z: 182, tiltDeg: -25 },
      ]
    : [
        { id: "inline-intake", bankSide: "inline", camType: "intake", y: 15, z: 185, tiltDeg: 0 },
        { id: "inline-exhaust", bankSide: "inline", camType: "exhaust", y: -15, z: 185, tiltDeg: 0 },
      ];

  // Front Crankshaft Drive Timing Gear Point
  const crankGearPt = projectIso({ x: blockW / 2 + 10, y: 0, z: 60 }, originScreen);

  return (
    <g
      id="iso-camshafts-v12-quadcam-depth-sorted"
      onMouseEnter={() => onHoverComponent?.("camshaft")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {/* ── 1. FRONT QUAD-CAM DOHC TIMING CHAIN / BELT DRIVE LOOP ── */}
      {isVEngine && (
        <g id="v12-timing-chain-loop">
          {/* Crankshaft Drive Timing Gear (X = +125, Y = 0, Z = 60) */}
          <circle cx={crankGearPt.x} cy={crankGearPt.y} r="12" fill="url(#forged-steel)" stroke="#090d16" strokeWidth="2" />
          <circle cx={crankGearPt.x} cy={crankGearPt.y} r="12" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
          <circle cx={crankGearPt.x} cy={crankGearPt.y} r="6" fill="#020617" stroke="#38bdf8" strokeWidth="1" />

          {/* Multi-Row Timing Chain Link Lines Connecting Crank Gear to Front Sprockets */}
          {camSpecs.map((spec) => {
            const frontSprocket3D = { x: blockW / 2 + 10, y: spec.y, z: spec.z };
            const sprocPt = projectIso(frontSprocket3D, originScreen);

            return (
              <g key={`timing-chain-link-${spec.id}`}>
                <line
                  x1={crankGearPt.x}
                  y1={crankGearPt.y}
                  x2={sprocPt.x}
                  y2={sprocPt.y}
                  stroke="#475569"
                  strokeWidth="3.5"
                  strokeDasharray="4 2"
                />
                <line
                  x1={crankGearPt.x}
                  y1={crankGearPt.y}
                  x2={sprocPt.x}
                  y2={sprocPt.y}
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                  opacity="0.9"
                />
              </g>
            );
          })}
        </g>
      )}

      {/* ── 2. FORGED CAMSHAFTS, CAM LOBES & VVT TIMING SPROCKETS ── */}
      {camSpecs.map((cam) => {
        const { id, bankSide, y, z, tiltDeg } = cam;

        // Camshaft Shaft 3D End Points
        const camStart3D = { x: -blockW / 2 - 10, y, z };
        const camEnd3D = { x: blockW / 2 + 10, y, z };

        const camStart = projectIso(camStart3D, originScreen);
        const camEnd = projectIso(camEnd3D, originScreen);

        const frontSprocketTilted = projectIso60VEllipse(camEnd3D, 11, bankSide === "right" ? "right" : "left", originScreen);

        return (
          <g key={`camshaft-assembly-${id}`}>
            {/* Main Forged Steel Camshaft Bar Axis */}
            <line
              x1={camStart.x}
              y1={camStart.y}
              x2={camEnd.x}
              y2={camEnd.y}
              stroke="url(#rod-hbeam-shank)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Polished Chrome Specular Highlight Line */}
            <line
              x1={camStart.x}
              y1={camStart.y - 2.5}
              x2={camEnd.x}
              y2={camEnd.y - 2.5}
              stroke="#ffffff"
              strokeWidth="1.8"
              opacity="0.95"
            />

            {/* Rear End Bearing Journal Flange */}
            <ellipse
              cx={camStart.x}
              cy={camStart.y}
              rx="6"
              ry="4"
              fill="url(#bolt-boss-raised)"
              stroke="#090d16"
              strokeWidth="1.2"
            />

            {/* Front Variable Valve Timing (VVT) Phaser Timing Sprocket / Gear Cog (matching reference image) */}
            <g id={`vvt-sprocket-${id}`}>
              {/* Outer Gear Teeth Disc */}
              <ellipse
                cx={frontSprocketTilted.cx}
                cy={frontSprocketTilted.cy}
                rx={frontSprocketTilted.rx + 3}
                ry={frontSprocketTilted.ry + 1.8}
                fill="url(#camshaft-steel-journal)"
                stroke="#0f172a"
                strokeWidth="2.2"
                transform={`rotate(${frontSprocketTilted.tiltDeg}, ${frontSprocketTilted.cx}, ${frontSprocketTilted.cy})`}
              />

              {/* Gear Tooth Notch Details (12 notches around perimeter) */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, tIdx) => {
                const rad = (deg * Math.PI) / 180;
                const tx1 = frontSprocketTilted.cx + Math.cos(rad) * (frontSprocketTilted.rx + 1);
                const ty1 = frontSprocketTilted.cy + Math.sin(rad) * (frontSprocketTilted.ry + 0.6);
                const tx2 = frontSprocketTilted.cx + Math.cos(rad) * (frontSprocketTilted.rx + 4);
                const ty2 = frontSprocketTilted.cy + Math.sin(rad) * (frontSprocketTilted.ry + 2.2);
                return (
                  <line
                    key={`sprocket-tooth-${id}-${tIdx}`}
                    x1={tx1} y1={ty1}
                    x2={tx2} y2={ty2}
                    stroke="#0f172a"
                    strokeWidth="1.8"
                  />
                );
              })}

              {/* Inner VVT Actuator Housing Chamber */}
              <ellipse
                cx={frontSprocketTilted.cx}
                cy={frontSprocketTilted.cy}
                rx={frontSprocketTilted.rx - 2}
                ry={frontSprocketTilted.ry - 1.2}
                fill="url(#bearing-saddle-chrome)"
                stroke="#0f172a"
                strokeWidth="1.6"
                transform={`rotate(${frontSprocketTilted.tiltDeg}, ${frontSprocketTilted.cx}, ${frontSprocketTilted.cy})`}
              />
              {/* Central Retention Bolt (Gold Accent) */}
              <circle
                cx={frontSprocketTilted.cx}
                cy={frontSprocketTilted.cy}
                r="3.2"
                fill="url(#gold-anodized-bolt)"
                stroke="#78350f"
                strokeWidth="1"
              />
              <circle
                cx={frontSprocketTilted.cx}
                cy={frontSprocketTilted.cy}
                r="1.4"
                fill="#451a03"
              />
            </g>

            {/* CNC High-Lift Cam Lobes aligned along cylinder locations */}
            {Array.from({ length: 6 }).map((_, idx) => {
              const boreX = -85 + idx * 34;

              // Dual Lobes per cylinder (Intake/Exhaust)
              return [-4, +4].map((dx, lIdx) => {
                const lobe3D = { x: boreX + dx, y, z };
                const lobePt = projectIso(lobe3D, originScreen);
                const isLobeUp = (idx + lIdx) % 2 === 0;

                return (
                  <g key={`cam-lobe-${id}-${idx}-${lIdx}`} transform={tiltDeg ? `rotate(${tiltDeg}, ${lobePt.x}, ${lobePt.y})` : undefined}>
                    {/* Eccentric Egg-Shaped High-Lift Cam Lobe Profile */}
                    <path
                      d={`M ${lobePt.x - 3.5} ${lobePt.y - 3} Q ${lobePt.x} ${lobePt.y + (isLobeUp ? -11 : 9)} ${lobePt.x + 3.5} ${lobePt.y - 3} Z`}
                      fill={fills.left}
                      stroke="#090d16"
                      strokeWidth="1.5"
                    />
                    <path
                      d={`M ${lobePt.x - 2.5} ${lobePt.y - 2} Q ${lobePt.x} ${lobePt.y + (isLobeUp ? -8 : 7)} ${lobePt.x + 2.5} ${lobePt.y - 2} Z`}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1"
                      opacity="0.85"
                    />
                  </g>
                );
              });
            })}
          </g>
        );
      })}
    </g>
  );
};
