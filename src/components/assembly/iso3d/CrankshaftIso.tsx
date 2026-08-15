import React, { useMemo } from "react";
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

/**
 * ═══════════════════════════════════════════════════════════════════
 * 3D ISOMETRIC CRANKSHAFT — Multi-Layout Precision Billet / Forged Crank
 * ═══════════════════════════════════════════════════════════════════
 *
 * Dynamically adapts geometry per engine architecture:
 * - Inline (I3, I4, I6): Flat-plane / crossplane throws with single rod journals
 * - V-Bank (V6, V8, V10, V12): Split-pin / dual-rod journals per throw
 * - Boxer (H4, H6): 180° opposed flat crankshaft throws
 * - W-Bank (W12, W16, W18): Quad-offset pin pairing
 * - Rotary: Twin eccentric lobe shaft with counterweights
 * - Radial: Single master rod crankpin with massive counterweight lobes
 */
const CrankshaftIsoComponent: React.FC<CrankshaftIsoProps> = ({
  layoutSpec,
  componentState,
  isAssemblyComplete,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = useMemo(() => ({ x: 250, y: 215 }), []);
  const materialGrade = selectedVariants?.crankshaft || "forged";
  const fills = useMemo(() => getIsoMaterialFills(materialGrade), [materialGrade]);

  const cat = (layoutSpec.category || "").toLowerCase();
  const label = (layoutSpec.label || "").toLowerCase();
  const isV = cat === "vbank" || label.includes("v-") || label.includes("v6") || label.includes("v8") || label.includes("v10") || label.includes("v12");
  const isBoxer = cat === "flat" || label.includes("boxer") || label.includes("h4") || label.includes("h6");
  const isW = cat === "wbank" || label.includes("w12") || label.includes("w16") || label.includes("w18");
  const isRotary = cat === "rotary" || label.includes("rotary") || label.includes("wankel");
  const isRadial = cat === "radial" || label.includes("radial");

  // Determine geometry parameters based on layout
  const config = useMemo(() => {
    if (isRotary) {
      return {
        blockW: 160,
        crankZ: 82,
        numMains: 3,
        numThrows: 2,
        throwSpacing: 54,
        isDualJournal: false,
        journalOffset: 0,
      };
    }
    if (isRadial) {
      return {
        blockW: 80,
        crankZ: 120,
        numMains: 2,
        numThrows: 1,
        throwSpacing: 0,
        isDualJournal: false,
        journalOffset: 0,
      };
    }
    if (isBoxer) {
      const isH6 = label.includes("h6") || label.includes("6");
      const nThrows = isH6 ? 3 : 2;
      return {
        blockW: isH6 ? 186 : 145,
        crankZ: 43,
        numMains: nThrows + 1,
        numThrows: nThrows,
        throwSpacing: isH6 ? 50 : 60,
        isDualJournal: true,
        journalOffset: 16,
      };
    }
    if (isW) {
      const isW16 = label.includes("w16");
      const isW18 = label.includes("w18");
      const nThrows = isW18 ? 6 : isW16 ? 4 : 3;
      return {
        blockW: isW18 ? 228 : isW16 ? 215 : 175,
        crankZ: 58,
        numMains: nThrows + 1,
        numThrows: nThrows,
        throwSpacing: isW18 ? 30 : isW16 ? 40 : 42,
        isDualJournal: true,
        journalOffset: 15,
      };
    }
    if (isV) {
      if (label.includes("v6")) {
        return { blockW: 148, crankZ: 58, numMains: 4, numThrows: 3, throwSpacing: 38, isDualJournal: true, journalOffset: 14 };
      }
      if (label.includes("v8")) {
        return { blockW: 180, crankZ: 58, numMains: 5, numThrows: 4, throwSpacing: 36, isDualJournal: true, journalOffset: 14 };
      }
      if (label.includes("v10")) {
        return { blockW: 205, crankZ: 58, numMains: 6, numThrows: 5, throwSpacing: 35, isDualJournal: true, journalOffset: 14 };
      }
      // V12 default
      return { blockW: 220, crankZ: 60, numMains: 7, numThrows: 6, throwSpacing: 34, isDualJournal: true, journalOffset: 14 };
    }
    // Inline configurations (I3, I4, I6)
    if (label.includes("i3") || layoutSpec.cyls.length === 3) {
      return { blockW: 140, crankZ: 58, numMains: 4, numThrows: 3, throwSpacing: 38, isDualJournal: false, journalOffset: 0 };
    }
    if (label.includes("i6") || layoutSpec.cyls.length === 6) {
      return { blockW: 224, crankZ: 60, numMains: 7, numThrows: 6, throwSpacing: 34, isDualJournal: false, journalOffset: 0 };
    }
    // I4 default
    return { blockW: 175, crankZ: 58, numMains: 5, numThrows: 4, throwSpacing: 36, isDualJournal: false, journalOffset: 0 };
  }, [isV, isBoxer, isW, isRotary, isRadial, label, layoutSpec.cyls.length]);

  const { blockW, crankZ, numMains, numThrows, throwSpacing, isDualJournal, journalOffset } = config;

  // Main shaft line points
  const shaftStartPt = projectIso({ x: -blockW / 2 - 12, y: 0, z: crankZ }, originScreen);
  const shaftEndPt = projectIso({ x: blockW / 2 + 12, y: 0, z: crankZ }, originScreen);

  // Main bearing centers
  const mainBearingXList = useMemo(() => {
    return Array.from({ length: numMains }).map((_, i) => {
      const t = numMains === 1 ? 0.5 : i / (numMains - 1);
      return -blockW / 2 + 12 + t * (blockW - 24);
    });
  }, [numMains, blockW]);

  // Throw centers
  const throwXList = useMemo(() => {
    return Array.from({ length: numThrows }).map((_, i) => {
      return -((numThrows - 1) * throwSpacing) / 2 + i * throwSpacing;
    });
  }, [numThrows, throwSpacing]);

  const isAnimated = isAssemblyComplete || componentState.isActive;

  return (
    <g
      id="iso-crankshaft-aligned"
      onMouseEnter={() => onHoverComponent?.("crankshaft")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className={`cursor-pointer transition-all duration-700 ease-out ${isAnimated ? "crank-shaft-spin" : ""}`}
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {/* ── 1. MAIN CRANKSHAFT SHAFT AXIS ── */}
      <g id="crank-main-shaft">
        <line
          x1={shaftStartPt.x}
          y1={shaftStartPt.y}
          x2={shaftEndPt.x}
          y2={shaftEndPt.y}
          stroke="url(#rod-hbeam-shank)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Specular Highlight Line */}
        <line
          x1={shaftStartPt.x}
          y1={shaftStartPt.y - 3}
          x2={shaftEndPt.x}
          y2={shaftEndPt.y - 3}
          stroke="#ffffff"
          strokeWidth="1.8"
          opacity="0.9"
        />
        {/* Snout & Flywheel Flange */}
        <circle cx={shaftStartPt.x} cy={shaftStartPt.y} r="10" fill="#0f172a" stroke="#090d16" strokeWidth="1.8" />
        <circle cx={shaftEndPt.x} cy={shaftEndPt.y} r="11" fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="1.8" />
      </g>

      {/* ── 2. MAIN BEARING SADDLES & TRI-METAL INSERTS ── */}
      <g id="crank-main-bearings">
        {mainBearingXList.map((mbX, mbIdx) => {
          const mbCenter = projectIso({ x: mbX, y: 0, z: crankZ }, originScreen);
          return (
            <g key={`main-bearing-${mbIdx}`}>
              <ellipse cx={mbCenter.x} cy={mbCenter.y + 2} rx="10" ry="12" fill={fills.left} stroke="#090d16" strokeWidth="2" />
              <circle cx={mbCenter.x} cy={mbCenter.y} r="9" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="1.5" />
              <circle cx={mbCenter.x} cy={mbCenter.y} r="7" fill="url(#wrist-pin-bushing-bronze)" stroke="#090d16" strokeWidth="1" />
              <circle cx={mbCenter.x} cy={mbCenter.y} r="5.5" fill="url(#bearing-saddle-chrome)" stroke="#ffffff" strokeWidth="0.8" />
              <circle cx={mbCenter.x} cy={mbCenter.y} r="1.4" fill="url(#journal-oil-hole)" />
              {/* Dual Main Cap Fasteners */}
              <circle cx={mbCenter.x - 7} cy={mbCenter.y + 5.5} r="2" fill="url(#arp-bolt-head-12pt)" stroke="#090d16" strokeWidth="0.7" />
              <circle cx={mbCenter.x + 7} cy={mbCenter.y + 5.5} r="2" fill="url(#arp-bolt-head-12pt)" stroke="#090d16" strokeWidth="0.7" />
            </g>
          );
        })}
      </g>

      {/* ── 3. CRANKPIN THROWS & COUNTERWEIGHT WEBS ── */}
      <g id="crank-throws">
        {throwXList.map((tpX, tpIdx) => {
          const isOdd = tpIdx % 2 === 1;
          const webCenterPt = projectIso({ x: tpX, y: 0, z: crankZ }, originScreen);

          if (isDualJournal) {
            const leftJournalPt = projectIso({ x: tpX, y: journalOffset, z: crankZ }, originScreen);
            const rightJournalPt = projectIso({ x: tpX, y: -journalOffset, z: crankZ }, originScreen);

            return (
              <g key={`crank-throw-${tpIdx}`}>
                {/* Counterweight Web */}
                <path
                  d={`M ${webCenterPt.x - 13} ${webCenterPt.y - 5} Q ${webCenterPt.x} ${webCenterPt.y + (isOdd ? 25 : -21)} ${webCenterPt.x + 13} ${webCenterPt.y - 5} Z`}
                  fill={fills.left}
                  stroke="#090d16"
                  strokeWidth="2"
                />
                <path
                  d={`M ${webCenterPt.x - 10} ${webCenterPt.y - 4} Q ${webCenterPt.x} ${webCenterPt.y + (isOdd ? 19 : -16)} ${webCenterPt.x + 10} ${webCenterPt.y - 4} Z`}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.1"
                  opacity="0.85"
                />
                {/* Precision Drillings */}
                <circle cx={webCenterPt.x - 5} cy={webCenterPt.y + (isOdd ? 12 : -10)} r="2.8" fill="#020617" stroke="#475569" strokeWidth="0.7" />
                <circle cx={webCenterPt.x + 5} cy={webCenterPt.y + (isOdd ? 12 : -10)} r="2.8" fill="#020617" stroke="#475569" strokeWidth="0.7" />

                {/* Left Bank Rod Journal Pin */}
                <ellipse cx={leftJournalPt.x} cy={leftJournalPt.y} rx="6.8" ry="4" fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="1.6" />
                <circle cx={leftJournalPt.x} cy={leftJournalPt.y} r="1.4" fill="url(#journal-oil-hole)" />

                {/* Right Bank Rod Journal Pin */}
                <ellipse cx={rightJournalPt.x} cy={rightJournalPt.y} rx="6.8" ry="4" fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="1.6" />
                <circle cx={rightJournalPt.x} cy={rightJournalPt.y} r="1.4" fill="url(#journal-oil-hole)" />
              </g>
            );
          }

          // Single Rod Journal (Inline layouts)
          const journalPt = projectIso({ x: tpX, y: isOdd ? 8 : -8, z: crankZ }, originScreen);
          return (
            <g key={`crank-throw-inline-${tpIdx}`}>
              <path
                d={`M ${webCenterPt.x - 12} ${webCenterPt.y - 4} Q ${webCenterPt.x} ${webCenterPt.y + (isOdd ? 22 : -18)} ${webCenterPt.x + 12} ${webCenterPt.y - 4} Z`}
                fill={fills.left}
                stroke="#090d16"
                strokeWidth="1.8"
              />
              <ellipse cx={journalPt.x} cy={journalPt.y} rx="7" ry="4.2" fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="1.6" />
              <circle cx={journalPt.x} cy={journalPt.y} r="1.4" fill="url(#journal-oil-hole)" />
            </g>
          );
        })}
      </g>
    </g>
  );
};

export const CrankshaftIso = React.memo(CrankshaftIsoComponent);
