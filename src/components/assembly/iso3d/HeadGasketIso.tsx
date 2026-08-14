import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, projectIsoTiltedEllipse } from "./isoMath";

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
 * Photorealistic 3D Isometric Dual 90° MLS Cylinder Head Gasket Renderer
 * Ensures both 6-cylinder banks (Front Bank Y > 0 & Rear Bank Y < 0 facing away from us)
 * have fully aligned MLS gasket plates banking OUTWARD at 90° away from each other:
 * - Rear Bank MLS Gasket Plate (6 cylinders facing away from us @ Y = -50, Z = 140)
 * - Front Bank MLS Gasket Plate (6 cylinders facing towards us @ Y = +50, Z = 140)
 * - 6 Embossed Dual-Stopper Fire-Ring Seals per bank surrounding each cylinder bore
 * - Viton-coated Elastomer Sealing Beads & Stainless Steel Head Bolt Grommets
 */
export const HeadGasketIso: React.FC<HeadGasketIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 215 }; // 100% Canvas Sync!
  const materialGrade = selectedVariants?.head_gasket || "copper";

  const isVEngine = layoutSpec.category === "V" || layoutSpec.label?.includes("V") || layoutSpec.cyls.length >= 8;

  // Material Plate Colors
  const plateFill = materialGrade === "copper" ? "url(#mls-copper-plate)" : "url(#rod-hbeam-shank)";
  const strokeColor = materialGrade === "copper" ? "#7c2d12" : "#090d16";

  const blockW = 220;
  const gasketThickness = 3.5;

  // ───────────────────────────────────────────────────────────────────────────────
  // ── REAR BANK GASKET (6 Cylinders Facing Away From Us @ Y = -18 to -82) ──
  // ───────────────────────────────────────────────────────────────────────────────
  const rightBotCorners = {
    fl: projectIso({ x: -blockW / 2 - 2, y: -82, z: 107.5 }, originScreen),
    fr: projectIso({ x: blockW / 2 + 2, y: -82, z: 107.5 }, originScreen),
    bl: projectIso({ x: -blockW / 2 - 2, y: -18, z: 172.5 }, originScreen),
    br: projectIso({ x: blockW / 2 + 2, y: -18, z: 172.5 }, originScreen),
  };
  const rightTopCorners = {
    fl: projectIso({ x: -blockW / 2 - 2, y: -82, z: 107.5 + gasketThickness }, originScreen),
    fr: projectIso({ x: blockW / 2 + 2, y: -82, z: 107.5 + gasketThickness }, originScreen),
    bl: projectIso({ x: -blockW / 2 - 2, y: -18, z: 172.5 + gasketThickness }, originScreen),
    br: projectIso({ x: blockW / 2 + 2, y: -18, z: 172.5 + gasketThickness }, originScreen),
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ── FRONT BANK GASKET (6 Cylinders Facing Towards Us @ Y = +18 to +82) ──
  // ─────────────────────────────────────────────────────────────────────────────
  const leftBotCorners = {
    fl: projectIso({ x: -blockW / 2 - 2, y: 82, z: 107.5 }, originScreen),
    fr: projectIso({ x: blockW / 2 + 2, y: 82, z: 107.5 }, originScreen),
    bl: projectIso({ x: -blockW / 2 - 2, y: 18, z: 172.5 }, originScreen),
    br: projectIso({ x: blockW / 2 + 2, y: 18, z: 172.5 }, originScreen),
  };
  const leftTopCorners = {
    fl: projectIso({ x: -blockW / 2 - 2, y: 82, z: 107.5 + gasketThickness }, originScreen),
    fr: projectIso({ x: blockW / 2 + 2, y: 82, z: 107.5 + gasketThickness }, originScreen),
    bl: projectIso({ x: -blockW / 2 - 2, y: 18, z: 172.5 + gasketThickness }, originScreen),
    br: projectIso({ x: blockW / 2 + 2, y: 18, z: 172.5 + gasketThickness }, originScreen),
  };

  return (
    <g
      id="iso-head_gasket-both-banks-aligned"
      onMouseEnter={() => onHoverComponent?.("head_gasket")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {isVEngine ? (
        /* ── DUAL OUTWARD-FACING 90° MLS CYLINDER HEAD GASKETS (BOTH 6-CYLINDER BANKS) ── */
        <g id="v12-dual-mls-gaskets-both-banks">
          {/* ────────────────────────────────────────────────────────────────────────── */}
          {/* ── 1. REAR BANK MLS HEAD GASKET PLATE (6 Cylinders Facing Away From Us) ── */}
          {/* ────────────────────────────────────────────────────────────────────────── */}
          <g id="rear-bank-gasket-away">
            {/* Outer Edge Thickness Face */}
            <polygon
              points={`${rightBotCorners.fl.x},${rightBotCorners.fl.y} ${rightBotCorners.fr.x},${rightBotCorners.fr.y} ${rightTopCorners.fr.x},${rightTopCorners.fr.y} ${rightTopCorners.fl.x},${rightTopCorners.fl.y}`}
              fill={plateFill}
              stroke={strokeColor}
              strokeWidth="1.8"
            />
            {/* Front Edge Thickness Face */}
            <polygon
              points={`${rightBotCorners.fl.x},${rightBotCorners.fl.y} ${rightBotCorners.bl.x},${rightBotCorners.bl.y} ${rightTopCorners.bl.x},${rightTopCorners.bl.y} ${rightTopCorners.fl.x},${rightTopCorners.fl.y}`}
              fill={plateFill}
              stroke={strokeColor}
              strokeWidth="1.8"
            />

            {/* Top Deck Plate Surface (Sloping DOWN & OUTWARD Away From Us @ 45°) */}
            <polygon
              points={`${rightTopCorners.fl.x},${rightTopCorners.fl.y} ${rightTopCorners.fr.x},${rightTopCorners.fr.y} ${rightTopCorners.br.x},${rightTopCorners.br.y} ${rightTopCorners.bl.x},${rightTopCorners.bl.y}`}
              fill={plateFill}
              stroke={strokeColor}
              strokeWidth="2.4"
            />
            {/* Specular Highlight along Machined Deck Edge */}
            <polygon
              points={`${rightTopCorners.fl.x + 2},${rightTopCorners.fl.y} ${rightTopCorners.fr.x - 2},${rightTopCorners.fr.y} ${rightTopCorners.br.x - 2},${rightTopCorners.br.y} ${rightTopCorners.bl.x + 2},${rightTopCorners.bl.y}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.6"
              opacity="0.9"
            />

            {/* Part ID Stamping Corner Tab */}
            <polygon
              points={`${rightTopCorners.fr.x + 2},${rightTopCorners.fr.y + 4} ${rightTopCorners.fr.x + 18},${rightTopCorners.fr.y + 12} ${rightTopCorners.fr.x + 18},${rightTopCorners.fr.y + 22} ${rightTopCorners.fr.x + 2},${rightTopCorners.fr.y + 14}`}
              fill={plateFill}
              stroke={strokeColor}
              strokeWidth="1.5"
            />

            {/* 6 Embossed Dual-Stopper Fire-Rings surrounding Rear Bank Bores */}
            {Array.from({ length: 6 }).map((_, idx) => {
              const boreX = -85 + idx * 34;
              const rightIso = projectIsoTiltedEllipse({ x: boreX, y: -50, z: 140 }, 15, "left", originScreen);

              return (
                <g key={`rear-gasket-bore-${idx}`}>
                  {/* Outer Stainless Stopper Bead */}
                  <ellipse
                    cx={rightIso.cx}
                    cy={rightIso.cy}
                    rx={rightIso.rx + 2.5}
                    ry={rightIso.ry + 1.5}
                    fill="none"
                    stroke="url(#firering-stainless-emboss)"
                    strokeWidth="2.4"
                    transform={`rotate(${rightIso.tiltDeg}, ${rightIso.cx}, ${rightIso.cy})`}
                  />
                  {/* Inner Combustion Fire-Ring Opening */}
                  <ellipse
                    cx={rightIso.cx}
                    cy={rightIso.cy}
                    rx={rightIso.rx + 0.2}
                    ry={rightIso.ry + 0.1}
                    fill="#020617"
                    stroke="#090d16"
                    strokeWidth="1.8"
                    transform={`rotate(${rightIso.tiltDeg}, ${rightIso.cx}, ${rightIso.cy})`}
                  />
                  <ellipse
                    cx={rightIso.cx}
                    cy={rightIso.cy}
                    rx={rightIso.rx}
                    ry={rightIso.ry}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.4"
                    opacity="0.9"
                    transform={`rotate(${rightIso.tiltDeg}, ${rightIso.cx}, ${rightIso.cy})`}
                  />
                </g>
              );
            })}

            {/* Viton Elastomer Water/Oil Port Sealing Beads along Rear Bank */}
            {[-70, -35, 0, 35, 70].map((portX, pIdx) => {
              const portPt = projectIso({ x: portX, y: -68, z: 122 }, originScreen);
              return (
                <g key={`rear-gasket-port-${pIdx}`}>
                  <ellipse cx={portPt.x} cy={portPt.y} rx="5.2" ry="2.9" fill="none" stroke="url(#viton-elastomer-bead)" strokeWidth="1.8" />
                </g>
              );
            })}

            {/* Stainless Steel Head Bolt Eyelet Grommets (10 Grommets along Rear Gasket) */}
            {[-90, -60, -30, 0, 30, 60, 90].flatMap((bx) => [
              projectIso({ x: bx, y: -76, z: 114 }, originScreen),
              projectIso({ x: bx, y: -24, z: 164 }, originScreen),
            ]).map((boltPt, bIdx) => (
              <g key={`rear-gasket-bolt-${bIdx}`}>
                <circle cx={boltPt.x} cy={boltPt.y} r="3.2" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.9" />
                <circle cx={boltPt.x} cy={boltPt.y} r="1.6" fill="#020617" />
              </g>
            ))}

            {/* Brass Precision Alignment Dowel Pin Sleeves */}
            {[-95, 95].map((dx, dIdx) => {
              const dowelPt = projectIso({ x: dx, y: -50, z: 140 }, originScreen);
              return (
                <g key={`rear-dowel-${dIdx}`}>
                  <circle cx={dowelPt.x} cy={dowelPt.y} r="3.2" fill="url(#wrist-pin-bushing-bronze)" stroke="#090d16" strokeWidth="1" />
                  <circle cx={dowelPt.x} cy={dowelPt.y} r="1.5" fill="#020617" />
                </g>
              );
            })}
          </g>

          {/* ───────────────────────────────────────────────────────────────────────────── */}
          {/* ── 2. FRONT BANK MLS HEAD GASKET PLATE (6 Cylinders Facing Towards Us) ── */}
          {/* ───────────────────────────────────────────────────────────────────────────── */}
          <g id="front-bank-gasket-towards">
            {/* Outer Edge Thickness Face */}
            <polygon
              points={`${leftBotCorners.fl.x},${leftBotCorners.fl.y} ${leftBotCorners.fr.x},${leftBotCorners.fr.y} ${leftTopCorners.fr.x},${leftTopCorners.fr.y} ${leftTopCorners.fl.x},${leftTopCorners.fl.y}`}
              fill={plateFill}
              stroke={strokeColor}
              strokeWidth="1.8"
            />
            {/* Front Edge Thickness Face */}
            <polygon
              points={`${leftBotCorners.fl.x},${leftBotCorners.fl.y} ${leftBotCorners.bl.x},${leftBotCorners.bl.y} ${leftTopCorners.bl.x},${leftTopCorners.bl.y} ${leftTopCorners.fl.x},${leftTopCorners.fl.y}`}
              fill={plateFill}
              stroke={strokeColor}
              strokeWidth="1.8"
            />

            {/* Top Deck Plate Surface (Sloping DOWN & OUTWARD Towards Us @ 45°) */}
            <polygon
              points={`${leftTopCorners.fl.x},${leftTopCorners.fl.y} ${leftTopCorners.fr.x},${leftTopCorners.fr.y} ${leftTopCorners.br.x},${leftTopCorners.br.y} ${leftTopCorners.bl.x},${leftTopCorners.bl.y}`}
              fill={plateFill}
              stroke={strokeColor}
              strokeWidth="2.4"
            />
            {/* Specular Highlight along Machined Deck Edge */}
            <polygon
              points={`${leftTopCorners.fl.x + 2},${leftTopCorners.fl.y} ${leftTopCorners.fr.x - 2},${leftTopCorners.fr.y} ${leftTopCorners.br.x - 2},${leftTopCorners.br.y} ${leftTopCorners.bl.x + 2},${leftTopCorners.bl.y}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.6"
              opacity="0.9"
            />

            {/* Part ID Stamping Corner Tab */}
            <polygon
              points={`${leftTopCorners.fr.x + 2},${leftTopCorners.fr.y + 4} ${leftTopCorners.fr.x + 18},${leftTopCorners.fr.y + 12} ${leftTopCorners.fr.x + 18},${leftTopCorners.fr.y + 22} ${leftTopCorners.fr.x + 2},${leftTopCorners.fr.y + 14}`}
              fill={plateFill}
              stroke={strokeColor}
              strokeWidth="1.5"
            />

            {/* 6 Embossed Dual-Stopper Fire-Rings surrounding Front Bank Bores */}
            {Array.from({ length: 6 }).map((_, idx) => {
              const boreX = -85 + idx * 34;
              const leftIso = projectIsoTiltedEllipse({ x: boreX, y: 50, z: 140 }, 15, "right", originScreen);

              return (
                <g key={`front-gasket-bore-${idx}`}>
                  {/* Outer Stainless Stopper Bead */}
                  <ellipse
                    cx={leftIso.cx}
                    cy={leftIso.cy}
                    rx={leftIso.rx + 2.5}
                    ry={leftIso.ry + 1.5}
                    fill="none"
                    stroke="url(#firering-stainless-emboss)"
                    strokeWidth="2.4"
                    transform={`rotate(${leftIso.tiltDeg}, ${leftIso.cx}, ${leftIso.cy})`}
                  />
                  {/* Inner Combustion Fire-Ring Opening */}
                  <ellipse
                    cx={leftIso.cx}
                    cy={leftIso.cy}
                    rx={leftIso.rx + 0.2}
                    ry={leftIso.ry + 0.1}
                    fill="#020617"
                    stroke="#090d16"
                    strokeWidth="1.8"
                    transform={`rotate(${leftIso.tiltDeg}, ${leftIso.cx}, ${leftIso.cy})`}
                  />
                  <ellipse
                    cx={leftIso.cx}
                    cy={leftIso.cy}
                    rx={leftIso.rx}
                    ry={leftIso.ry}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.4"
                    opacity="0.9"
                    transform={`rotate(${leftIso.tiltDeg}, ${leftIso.cx}, ${leftIso.cy})`}
                  />
                </g>
              );
            })}

            {/* Viton Elastomer Water/Oil Port Sealing Beads along Front Bank */}
            {[-70, -35, 0, 35, 70].map((portX, pIdx) => {
              const portPt = projectIso({ x: portX, y: 68, z: 122 }, originScreen);
              return (
                <g key={`front-gasket-port-${pIdx}`}>
                  <ellipse cx={portPt.x} cy={portPt.y} rx="5.2" ry="2.9" fill="none" stroke="url(#viton-elastomer-bead)" strokeWidth="1.8" />
                </g>
              );
            })}

            {/* Stainless Steel Head Bolt Eyelet Grommets (10 Grommets along Front Gasket) */}
            {[-90, -60, -30, 0, 30, 60, 90].flatMap((bx) => [
              projectIso({ x: bx, y: 76, z: 114 }, originScreen),
              projectIso({ x: bx, y: 24, z: 164 }, originScreen),
            ]).map((boltPt, bIdx) => (
              <g key={`front-gasket-bolt-${bIdx}`}>
                <circle cx={boltPt.x} cy={boltPt.y} r="3.2" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.9" />
                <circle cx={boltPt.x} cy={boltPt.y} r="1.6" fill="#020617" />
              </g>
            ))}

            {/* Brass Precision Alignment Dowel Pin Sleeves */}
            {[-95, 95].map((dx, dIdx) => {
              const dowelPt = projectIso({ x: dx, y: 50, z: 140 }, originScreen);
              return (
                <g key={`front-dowel-${dIdx}`}>
                  <circle cx={dowelPt.x} cy={dowelPt.y} r="3.2" fill="url(#wrist-pin-bushing-bronze)" stroke="#090d16" strokeWidth="1" />
                  <circle cx={dowelPt.x} cy={dowelPt.y} r="1.5" fill="#020617" />
                </g>
              );
            })}
          </g>
        </g>
      ) : (
        /* Standard Inline Single MLS Head Gasket Plate */
        <g id="inline-single-gasket">
          <polygon
            points={`${projectIso({ x: -100, y: 40, z: 156 }, originScreen).x},${projectIso({ x: -100, y: 40, z: 156 }, originScreen).y} ${projectIso({ x: 100, y: 40, z: 156 }, originScreen).x},${projectIso({ x: 100, y: 40, z: 156 }, originScreen).y} ${projectIso({ x: 100, y: -40, z: 156 }, originScreen).x},${projectIso({ x: 100, y: -40, z: 156 }, originScreen).y} ${projectIso({ x: -100, y: -40, z: 156 }, originScreen).x},${projectIso({ x: -100, y: -40, z: 156 }, originScreen).y}`}
            fill={plateFill}
            stroke={strokeColor}
            strokeWidth="2.4"
          />
        </g>
      )}
    </g>
  );
};
