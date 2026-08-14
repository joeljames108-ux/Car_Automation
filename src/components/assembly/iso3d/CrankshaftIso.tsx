import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface CrankshaftIsoProps {
  layoutSpec: {
    label: string;
    cyls: number[];
    width: number;
    bx: number;
    bw: number;
    category?: string;
  };
  componentState: {
    isInstalled: boolean;
    isActive: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  isAssemblyComplete?: boolean;
  selectedVariants?: Record<string, string>;
  onHoverComponent?: (id: ComponentId | null) => void;
}

export const CrankshaftIso: React.FC<CrankshaftIsoProps> = ({
  layoutSpec,
  componentState,
  isAssemblyComplete,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 215 };
  const materialGrade = selectedVariants?.crankshaft || "forged";
  const fills = getIsoMaterialFills(materialGrade);

  const isVEngine = layoutSpec.category === "V" || layoutSpec.label?.includes("V") || layoutSpec.cyls.length >= 8;

  // Crankshaft Dimensions
  const crankZ = 60;
  const blockW = 220;

  // Main Shaft End Points
  const shaftStartPt = projectIso({ x: -blockW / 2 - 12, y: 0, z: crankZ }, originScreen);
  const shaftEndPt = projectIso({ x: blockW / 2 + 12, y: 0, z: crankZ }, originScreen);

  // 7 Main Bearing Bulkhead Centerlines for 6-Cylinder Bank
  const mainBearingXList = [-102, -68, -34, 0, 34, 68, 102];

  // 6 Crankpin Throws for 6 Cylinder Pairs
  const throwXList = Array.from({ length: 6 }).map((_, idx) => -85 + idx * 34);

  const isAnimated = isAssemblyComplete || componentState.isActive;

  return (
    <g
      id="iso-crankshaft-v12-aligned"
      onMouseEnter={() => onHoverComponent?.("crankshaft")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className={`cursor-pointer transition-all duration-700 ease-out ${isAnimated ? "crank-shaft-spin" : ""}`}
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {/* ── 1. MAIN FORGED STEEL CRANKSHAFT CENTERAXIS SHAFT ── */}
      <g id="v12-crank-main-shaft">
        {/* Main Shaft Base Cylinder */}
        <line
          x1={shaftStartPt.x}
          y1={shaftStartPt.y}
          x2={shaftEndPt.x}
          y2={shaftEndPt.y}
          stroke="url(#rod-hbeam-shank)"
          strokeWidth="15"
          strokeLinecap="round"
        />
        {/* Polished Chrome Main Shaft Specular Highlight Line */}
        <line
          x1={shaftStartPt.x}
          y1={shaftStartPt.y - 3.5}
          x2={shaftEndPt.x}
          y2={shaftEndPt.y - 3.5}
          stroke="#ffffff"
          strokeWidth="2"
          opacity="0.9"
        />
        {/* Snout Flywheel Flange (Front & Rear Ends) */}
        <circle cx={shaftStartPt.x} cy={shaftStartPt.y} r="10" fill="#0f172a" stroke="#090d16" strokeWidth="1.8" />
        <circle cx={shaftEndPt.x} cy={shaftEndPt.y} r="11" fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="1.8" />
      </g>

      {/* ── 2. 7 PRECISION MAIN BEARING CAPS & TRI-METAL SHELL INSERTS ── */}
      <g id="v12-7-main-bearings">
        {mainBearingXList.map((mbX, mbIdx) => {
          const mbCenter = projectIso({ x: mbX, y: 0, z: crankZ }, originScreen);
          return (
            <g key={`v12-main-bearing-${mbIdx}`}>
              {/* Main Bearing Cap Saddle Web */}
              <ellipse cx={mbCenter.x} cy={mbCenter.y + 2} rx="10" ry="12" fill={fills.left} stroke="#090d16" strokeWidth="2" />
              {/* Outer Shell Flange */}
              <circle cx={mbCenter.x} cy={mbCenter.y} r="9.5" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="1.5" />
              {/* Tri-Metal Beryllium Bearing Shell Insert */}
              <circle cx={mbCenter.x} cy={mbCenter.y} r="7.5" fill="url(#wrist-pin-bushing-bronze)" stroke="#090d16" strokeWidth="1" />
              {/* Chrome Main Journal Contact Surface */}
              <circle cx={mbCenter.x} cy={mbCenter.y} r="5.8" fill="url(#bearing-saddle-chrome)" stroke="#ffffff" strokeWidth="0.8" />
              <circle cx={mbCenter.x} cy={mbCenter.y} r="1.5" fill="url(#journal-oil-hole)" />

              {/* Dual Main Cap Fasteners (ARP 12-Point Stud Bolts) */}
              <circle cx={mbCenter.x - 7.5} cy={mbCenter.y + 6} r="2.2" fill="url(#arp-bolt-head-12pt)" stroke="#090d16" strokeWidth="0.8" />
              <circle cx={mbCenter.x + 7.5} cy={mbCenter.y + 6} r="2.2" fill="url(#arp-bolt-head-12pt)" stroke="#090d16" strokeWidth="0.8" />
            </g>
          );
        })}
      </g>

      {/* ── 3. 6 CRANKPIN THROWS & DUAL COUNTERWEIGHT WEBS ALIGNED WITH ROD CAPS ── */}
      <g id="v12-crankpin-throws">
        {throwXList.map((tpX, tpIdx) => {
          const isOdd = tpIdx % 2 === 1;

          // 3D Points for Left Rod Journal (Y = +14, Z = 60) and Right Rod Journal (Y = -14, Z = 60)
          const leftJournalPt = projectIso({ x: tpX, y: 14, z: crankZ }, originScreen);
          const rightJournalPt = projectIso({ x: tpX, y: -14, z: crankZ }, originScreen);
          const webCenterPt = projectIso({ x: tpX, y: 0, z: crankZ }, originScreen);

          return (
            <g key={`v12-crank-throw-${tpIdx}`}>
              {/* Counterweight Web 1 (Front Side) */}
              <path
                d={`M ${webCenterPt.x - 14} ${webCenterPt.y - 5} Q ${webCenterPt.x} ${webCenterPt.y + (isOdd ? 26 : -22)} ${webCenterPt.x + 14} ${webCenterPt.y - 5} Z`}
                fill={fills.left}
                stroke="#090d16"
                strokeWidth="2.2"
              />
              <path
                d={`M ${webCenterPt.x - 11} ${webCenterPt.y - 4} Q ${webCenterPt.x} ${webCenterPt.y + (isOdd ? 20 : -17)} ${webCenterPt.x + 11} ${webCenterPt.y - 4} Z`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                opacity="0.85"
              />
              {/* CNC Precision Weight-Balance Drillings on Counterweight Web */}
              <circle cx={webCenterPt.x - 5} cy={webCenterPt.y + (isOdd ? 12 : -10)} r="3" fill="#020617" stroke="#475569" strokeWidth="0.8" />
              <circle cx={webCenterPt.x + 5} cy={webCenterPt.y + (isOdd ? 12 : -10)} r="3" fill="#020617" stroke="#475569" strokeWidth="0.8" />

              {/* Left Bank Rod Journal Pin (Y = +14, Z = 60 - Exact Left Rod Big End Match!) */}
              <ellipse cx={leftJournalPt.x} cy={leftJournalPt.y} rx="7" ry="4.2" fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="1.8" />
              <ellipse cx={leftJournalPt.x} cy={leftJournalPt.y} rx="5.2" ry="3" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
              <circle cx={leftJournalPt.x} cy={leftJournalPt.y} r="1.5" fill="url(#journal-oil-hole)" />

              {/* Right Bank Rod Journal Pin (Y = -14, Z = 60 - Exact Right Rod Big End Match!) */}
              <ellipse cx={rightJournalPt.x} cy={rightJournalPt.y} rx="7" ry="4.2" fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="1.8" />
              <ellipse cx={rightJournalPt.x} cy={rightJournalPt.y} rx="5.2" ry="3" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.9" />
              <circle cx={rightJournalPt.x} cy={rightJournalPt.y} r="1.5" fill="url(#journal-oil-hole)" />

              {/* Crankpin Oil Passages Connecting Main & Rod Journals */}
              <line x1={webCenterPt.x} y1={webCenterPt.y} x2={leftJournalPt.x} y2={leftJournalPt.y} stroke="#020617" strokeWidth="1.2" strokeDasharray="2 1" />
              <line x1={webCenterPt.x} y1={webCenterPt.y} x2={rightJournalPt.x} y2={rightJournalPt.y} stroke="#020617" strokeWidth="1.2" strokeDasharray="2 1" />
            </g>
          );
        })}
      </g>
    </g>
  );
};
