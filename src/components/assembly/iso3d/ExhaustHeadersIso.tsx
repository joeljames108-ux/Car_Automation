import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface ExhaustHeadersIsoProps {
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
 * Photorealistic 3D Isometric Dual 6-into-1 Titanium/Chrome Exhaust Header System (Optimized)
 */
const ExhaustHeadersIsoComponent: React.FC<ExhaustHeadersIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 215 }; // 100% Canvas Sync!
  const materialGrade = selectedVariants?.exhaust_headers || "titanium";
  const fills = getIsoMaterialFills(materialGrade);

  const isVEngine = layoutSpec.category === "V" || layoutSpec.label?.includes("V") || layoutSpec.cyls.length >= 8;

  const blockW = 220;

  // Dual 6-into-1 Collector Exit Points
  const distalCollectorPt = projectIso({ x: blockW / 2 + 15, y: -75, z: 95 }, originScreen); // 6 Distal Cylinders (Rear)
  const proximalCollectorPt = projectIso({ x: blockW / 2 + 15, y: 75, z: 95 }, originScreen); // 6 Proximal Cylinders (Front)

  return (
    <g
      id="iso-exhaust-headers-12cyls-proximal-distal"
      onMouseEnter={() => onHoverComponent?.("exhaust_headers")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {isVEngine ? (
        /* ── DUAL 6-INTO-1 CHROME/TITANIUM EXHAUST HEADERS FOR 12 CYLINDERS (6 DISTAL & 6 PROXIMAL) ── */
        <g id="v12-dual-exhaust-headers-12cyls">
          {/* ────────────────────────────────────────────────────────────────────────── */}
          {/* ── 1. DISTAL REAR BANK EXHAUST HEADER (6 Cylinders Facing Away @ Y = -44) ── */}
          {/* ────────────────────────────────────────────────────────────────────────── */}
          <g id="distal-rear-exhaust-header">
            {/* 6 Distal Mandrel-Bent Polished Chrome Primary Tubes */}
            {Array.from({ length: 6 }).map((_, idx) => {
              const boreX = -85 + idx * 34;
              const portPt = projectIso({ x: boreX, y: -44, z: 142.5 }, originScreen);
              const sweepPt = projectIso({ x: boreX + 12, y: -64, z: 120 }, originScreen);

              return (
                <g key={`distal-header-tube-${idx}`}>
                  {/* Flange Mounting Pad & Stud Hardware on Cylinder Head */}
                  <ellipse cx={portPt.x} cy={portPt.y} rx="7.5" ry="4.5" fill="url(#header-flange-dark)" stroke="#090d16" strokeWidth="1.2" />
                  <circle cx={portPt.x - 5} cy={portPt.y} r="1.5" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.6" />
                  <circle cx={portPt.x + 5} cy={portPt.y} r="1.5" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.6" />

                  {/* Primary Mandrel-Bent Tube Path (Polished Chrome) */}
                  <path
                    d={`M ${portPt.x} ${portPt.y} C ${sweepPt.x} ${sweepPt.y} ${distalCollectorPt.x - 15} ${distalCollectorPt.y - 25} ${distalCollectorPt.x} ${distalCollectorPt.y}`}
                    fill="none"
                    stroke="url(#chrome-headers-tube)"
                    strokeWidth="11"
                    strokeLinecap="round"
                  />
                  {/* Polished Mirror Specular Highlight Streak */}
                  <path
                    d={`M ${portPt.x} ${portPt.y - 2} C ${sweepPt.x} ${sweepPt.y - 2} ${distalCollectorPt.x - 15} ${distalCollectorPt.y - 27} ${distalCollectorPt.x} ${distalCollectorPt.y - 2}`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    opacity="0.95"
                  />
                  {/* TIG Weld Seam Ring along Primary Tube */}
                  <line
                    x1={(portPt.x + sweepPt.x) / 2 - 3}
                    y1={(portPt.y + sweepPt.y) / 2}
                    x2={(portPt.x + sweepPt.x) / 2 + 3}
                    y2={(portPt.y + sweepPt.y) / 2}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    opacity="0.9"
                  />
                </g>
              );
            })}

            {/* Distal 6-into-1 High-Velocity Merge Collector Pyramid */}
            <g id="distal-merge-collector">
              <polygon
                points={`${distalCollectorPt.x - 12},${distalCollectorPt.y - 10} ${distalCollectorPt.x + 20},${distalCollectorPt.y + 2} ${distalCollectorPt.x + 20},${distalCollectorPt.y + 18} ${distalCollectorPt.x - 12},${distalCollectorPt.y + 8}`}
                fill="url(#chrome-merge-collector)"
                stroke="#090d16"
                strokeWidth="2.2"
              />
              <polygon
                points={`${distalCollectorPt.x - 10},${distalCollectorPt.y - 8} ${distalCollectorPt.x + 18},${distalCollectorPt.y + 3} ${distalCollectorPt.x + 18},${distalCollectorPt.y + 16} ${distalCollectorPt.x - 10},${distalCollectorPt.y + 7}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.8"
                opacity="0.95"
              />
              {/* 3-Bolt Exhaust Flange Ring at Collector Exit */}
              <ellipse cx={distalCollectorPt.x + 20} cy={distalCollectorPt.y + 10} rx="8.5" ry="12.5" fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="2" />
              <ellipse cx={distalCollectorPt.x + 20} cy={distalCollectorPt.y + 10} rx="6.5" ry="9.5" fill="#020617" stroke="#090d16" strokeWidth="1.5" />
            </g>
          </g>

          {/* ──────────────────────────────────────────────────────────────────────────── */}
          {/* ── 2. PROXIMAL FRONT BANK EXHAUST HEADER (6 Cylinders Facing Us @ Y = +44) ── */}
          {/* ──────────────────────────────────────────────────────────────────────────── */}
          <g id="proximal-front-exhaust-header">
            {/* 6 Proximal Mandrel-Bent Polished Chrome Primary Tubes */}
            {Array.from({ length: 6 }).map((_, idx) => {
              const boreX = -85 + idx * 34;
              const portPt = projectIso({ x: boreX, y: 44, z: 142.5 }, originScreen);
              const sweepPt = projectIso({ x: boreX + 12, y: 64, z: 120 }, originScreen);

              return (
                <g key={`proximal-header-tube-${idx}`}>
                  {/* Flange Mounting Pad & Stud Hardware on Cylinder Head */}
                  <ellipse cx={portPt.x} cy={portPt.y} rx="7.5" ry="4.5" fill="url(#header-flange-dark)" stroke="#090d16" strokeWidth="1.2" />
                  <circle cx={portPt.x - 5} cy={portPt.y} r="1.5" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.6" />
                  <circle cx={portPt.x + 5} cy={portPt.y} r="1.5" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.6" />

                  {/* Primary Mandrel-Bent Tube Path (Polished Chrome) */}
                  <path
                    d={`M ${portPt.x} ${portPt.y} C ${sweepPt.x} ${sweepPt.y} ${proximalCollectorPt.x - 15} ${proximalCollectorPt.x - 25} ${proximalCollectorPt.x} ${proximalCollectorPt.y}`}
                    fill="none"
                    stroke="url(#chrome-headers-tube)"
                    strokeWidth="11"
                    strokeLinecap="round"
                  />
                  {/* Polished Mirror Specular Highlight Streak */}
                  <path
                    d={`M ${portPt.x} ${portPt.y - 2} C ${sweepPt.x} ${sweepPt.y - 2} ${proximalCollectorPt.x - 15} ${proximalCollectorPt.y - 27} ${proximalCollectorPt.x} ${proximalCollectorPt.y - 2}`}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    opacity="0.95"
                  />
                  {/* TIG Weld Seam Ring along Primary Tube */}
                  <line
                    x1={(portPt.x + sweepPt.x) / 2 - 3}
                    y1={(portPt.y + sweepPt.y) / 2}
                    x2={(portPt.x + sweepPt.x) / 2 + 3}
                    y2={(portPt.y + sweepPt.y) / 2}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    opacity="0.9"
                  />
                </g>
              );
            })}

            {/* Proximal 6-into-1 High-Velocity Merge Collector Pyramid */}
            <g id="proximal-merge-collector">
              <polygon
                points={`${proximalCollectorPt.x - 12},${proximalCollectorPt.y - 10} ${proximalCollectorPt.x + 20},${proximalCollectorPt.y + 2} ${proximalCollectorPt.x + 20},${proximalCollectorPt.y + 18} ${proximalCollectorPt.x - 12},${proximalCollectorPt.y + 8}`}
                fill="url(#chrome-merge-collector)"
                stroke="#090d16"
                strokeWidth="2.2"
              />
              <polygon
                points={`${proximalCollectorPt.x - 10},${proximalCollectorPt.y - 8} ${proximalCollectorPt.x + 18},${proximalCollectorPt.y + 3} ${proximalCollectorPt.x + 18},${proximalCollectorPt.y + 16} ${proximalCollectorPt.x - 10},${proximalCollectorPt.y + 7}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.8"
                opacity="0.95"
              />
              {/* 3-Bolt Exhaust Flange Ring at Collector Exit */}
              <ellipse cx={proximalCollectorPt.x + 20} cy={proximalCollectorPt.y + 10} rx="8.5" ry="12.5" fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="2" />
              <ellipse cx={proximalCollectorPt.x + 20} cy={proximalCollectorPt.y + 10} rx="6.5" ry="9.5" fill="#020617" stroke="#090d16" strokeWidth="1.5" />
            </g>
          </g>
        </g>
      ) : (
        /* Standard Single Header Inline Exhaust System */
        <g id="inline-exhaust-system">
          <path
            d={`M ${proximalCollectorPt.x - 10} ${proximalCollectorPt.y - 8} L ${proximalCollectorPt.x + 18} ${proximalCollectorPt.y + 2} L ${proximalCollectorPt.x + 18} ${proximalCollectorPt.y + 16} L ${proximalCollectorPt.x - 10} ${proximalCollectorPt.y + 6} Z`}
            fill="url(#chrome-headers-tube)"
            stroke="#090d16"
            strokeWidth="2.5"
          />
        </g>
      )}
    </g>
  );
};

export const ExhaustHeadersIso = React.memo(ExhaustHeadersIsoComponent);
