import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, projectIsoTiltedEllipse } from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface PistonsIsoProps {
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
  isAssemblyComplete?: boolean;
  selectedVariants?: Record<string, string>;
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * Photorealistic 3D Isometric Pistons, Connecting Rods & Wrist Pins Renderer
 * Supports both Inline engines and 90° V-Bank V12 / V8 / V6 layouts:
 * - Perfectly aligns 6 Left Bank Pistons & 6 Right Bank Pistons inside the 90° Cylinder Sleeves
 * - Forged Steel 4340 H-Beam Connecting Rod Shank angled along cylinder center axis
 * - Small End Pin Eye with Beryllium Bronze Bushing & Oil Feeder Hole
 * - Full-Floating Tool-Steel DLC-Coated Wrist Pin with Hollow Core Chamfers & Circlip Retention
 * - Split Rod Big End Journal with ARP2000 12-Point Fasteners & Bearing Shells
 * - 3D Volumetric Forged Piston Skirts, CNC Valve Relief Recesses, & Triple Ring Pack
 */
export const PistonsIso: React.FC<PistonsIsoProps> = ({
  layoutSpec,
  componentState,
  isAssemblyComplete,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 215 };
  const materialGrade = selectedVariants?.pistons || "forged";
  const fills = getIsoMaterialFills(materialGrade);

  // Check if layout is V-engine (V12, V8, V6)
  const isVEngine = layoutSpec.category === "V" || layoutSpec.label?.includes("V") || layoutSpec.cyls.length >= 8;

  // Build array of piston 3D points
  let pistonList: {
    idx: number;
    pCrank: { x: number; y: number };
    pWrist: { x: number; y: number };
    pCrown: { x: number; y: number };
    tiltDeg: number;
    bankSide: "left" | "right" | "inline";
    rx: number;
    ry: number;
  }[] = [];

  if (isVEngine) {
    // Render 12 Pistons for 90° V12 (6 Left Bank & 6 Right Bank)
    const numPairs = 6;
    for (let idx = 0; idx < numPairs; idx++) {
      const boreX = -85 + idx * 34; // 6 X positions matching cylinder sleeves
      const isOdd = idx % 2 === 1;
      const strokeOffset = isOdd ? 8 : -8;

      // ── LEFT BANK PISTON ──
      const leftCrown3D = { x: boreX, y: 50, z: 142.5 + strokeOffset };
      const leftWrist3D = { x: boreX, y: 38, z: 115 + strokeOffset };
      const leftCrank3D = { x: boreX, y: 14, z: 60 };

      const leftCrown = projectIso(leftCrown3D, originScreen);
      const leftWrist = projectIso(leftWrist3D, originScreen);
      const leftCrank = projectIso(leftCrank3D, originScreen);
      const leftTilted = projectIsoTiltedEllipse(leftCrown3D, 15, "left", originScreen);

      pistonList.push({
        idx: idx * 2,
        pCrank: leftCrank,
        pWrist: leftWrist,
        pCrown: leftCrown,
        tiltDeg: leftTilted.tiltDeg,
        bankSide: "left",
        rx: leftTilted.rx,
        ry: leftTilted.ry,
      });

      // ── RIGHT BANK PISTON ──
      const rightCrown3D = { x: boreX, y: -50, z: 142.5 - strokeOffset };
      const rightWrist3D = { x: boreX, y: -38, z: 115 - strokeOffset };
      const rightCrank3D = { x: boreX, y: -14, z: 60 };

      const rightCrown = projectIso(rightCrown3D, originScreen);
      const rightWrist = projectIso(rightWrist3D, originScreen);
      const rightCrank = projectIso(rightCrank3D, originScreen);
      const rightTilted = projectIsoTiltedEllipse(rightCrown3D, 15, "right", originScreen);

      pistonList.push({
        idx: idx * 2 + 1,
        pCrank: rightCrank,
        pWrist: rightWrist,
        pCrown: rightCrown,
        tiltDeg: rightTilted.tiltDeg,
        bankSide: "right",
        rx: rightTilted.rx,
        ry: rightTilted.ry,
      });
    }
  } else {
    // Standard Inline Piston Array
    pistonList = layoutSpec.cyls.map((cxPos, idx) => {
      const normX = (cxPos - layoutSpec.bx - layoutSpec.bw / 2) * 0.65;
      const isOdd = idx % 2 === 1;
      const crankPinZ = 26 + (isOdd ? 14 : -14);
      const wristPinZ = 88 + (isOdd ? 20 : -10);

      const pCrank = projectIso({ x: normX, y: 0, z: crankPinZ }, originScreen);
      const pWrist = projectIso({ x: normX, y: 0, z: wristPinZ }, originScreen);
      const pCrown = projectIso({ x: normX, y: 0, z: wristPinZ + 28 }, originScreen);

      return {
        idx,
        pCrank,
        pWrist,
        pCrown,
        tiltDeg: 0,
        bankSide: "inline",
        rx: 16.5,
        ry: 8.5,
      };
    });
  }

  return (
    <g
      id="iso-pistons-aligned-90deg"
      onMouseEnter={() => onHoverComponent?.("pistons")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {pistonList.map((piston) => {
        const { idx, pCrank, pWrist, pCrown, tiltDeg, bankSide, rx, ry } = piston;

        // V12 Crankshaft 60° Throw Firing Phase Stagger (6 Crank Pairs: 0.0s to 1.0s)
        const crankPairIdx = Math.floor(idx / 2) % 6;
        const phaseDelaySeconds = (crankPairIdx * 0.2).toFixed(1);
        const animClass =
          isAssemblyComplete || componentState.isActive
            ? bankSide === "right"
              ? "piston-anim-right"
              : "piston-anim-left"
            : "";

        // Rod Vector math for 3D Shank orientation
        const dx = pWrist.x - pCrank.x;
        const dy = pWrist.y - pCrank.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = -dy / len; // Normal vector for width perpendiculars
        const ny = dx / len;

        // Shank geometry widths
        const shankHalfW = 6;
        const channelHalfW = 3.2;

        // 4 Corners of H-Beam Outer Shank Face
        const shankBL = { x: pCrank.x - nx * shankHalfW, y: pCrank.y - ny * shankHalfW };
        const shankBR = { x: pCrank.x + nx * shankHalfW, y: pCrank.y + ny * shankHalfW };
        const shankTL = { x: pWrist.x - nx * (shankHalfW - 1), y: pWrist.y - ny * (shankHalfW - 1) };
        const shankTR = { x: pWrist.x + nx * (shankHalfW - 1), y: pWrist.y + ny * (shankHalfW - 1) };

        // Inner Recessed H-Channel Corners
        const chanBL = { x: pCrank.x - nx * channelHalfW, y: pCrank.y - ny * channelHalfW + dy * 0.15 };
        const chanBR = { x: pCrank.x + nx * channelHalfW, y: pCrank.y + ny * channelHalfW + dy * 0.15 };
        const chanTL = { x: pWrist.x - nx * (channelHalfW - 0.5), y: pWrist.y - ny * (channelHalfW - 0.5) - dy * 0.15 };
        const chanTR = { x: pWrist.x + nx * (channelHalfW - 0.5), y: pWrist.y + ny * (channelHalfW - 0.5) - dy * 0.15 };

        const isAnimated = isAssemblyComplete || componentState.isActive;
        const crownAnimClass = isAnimated
          ? bankSide === "right"
            ? "piston-crown-right"
            : bankSide === "left"
            ? "piston-crown-left"
            : "piston-anim-vertical"
          : "";

        const shankAnimClass = isAnimated
          ? bankSide === "right"
            ? "rod-shank-right"
            : bankSide === "left"
            ? "rod-shank-left"
            : "rod-shank-left"
          : "";

        return (
          <g key={`aligned-piston-assembly-${idx}`}>
            {/* ── 1. CONNECTING ROD BIG END MAIN CAP & BEARING HOUSING ── */}
            <g id={`rod-big-end-${idx}`}>
              <circle cx={pCrank.x} cy={pCrank.y} r="12.5" fill="url(#rod-hbeam-shank)" stroke="#090d16" strokeWidth="2" />
              <circle cx={pCrank.x} cy={pCrank.y} r="12.5" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.8" />
              <circle cx={pCrank.x} cy={pCrank.y} r="9" fill="#090d16" stroke="#94a3b8" strokeWidth="1.8" />
              <circle cx={pCrank.x} cy={pCrank.y} r="7" fill="url(#bearing-saddle-chrome)" />
              <circle cx={pCrank.x} cy={pCrank.y} r="7" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.9" />

              {/* ARP2000 12-Point Heavy-Duty Rod Bolts */}
              <g key={`arp-bolts-${idx}`}>
                <circle cx={pCrank.x - 9.5} cy={pCrank.y + 3.5} r="2.8" fill="url(#arp-bolt-head-12pt)" stroke="#090d16" strokeWidth="0.8" />
                <circle cx={pCrank.x + 9.5} cy={pCrank.y + 3.5} r="2.8" fill="url(#arp-bolt-head-12pt)" stroke="#090d16" strokeWidth="0.8" />
              </g>
            </g>

            {/* ── 2. FORGED STEEL 4340 H-BEAM CONNECTING ROD SHANK (ARTICULATING SWING) ── */}
            <g
              id={`rod-shank-${idx}`}
              className={shankAnimClass}
              style={{
                animationDelay: `${phaseDelaySeconds}s`,
                transformOrigin: `${pCrank.x}px ${pCrank.y}px`,
              }}
            >
              <polygon
                points={`${shankBL.x},${shankBL.y} ${shankBR.x},${shankBR.y} ${shankTR.x},${shankTR.y} ${shankTL.x},${shankTL.y}`}
                fill="url(#rod-hbeam-shank)"
                stroke="#090d16"
                strokeWidth="2"
              />
              <polygon
                points={`${chanBL.x},${chanBL.y} ${chanBR.x},${chanBR.y} ${chanTR.x},${chanTR.y} ${chanTL.x},${chanTL.y}`}
                fill="url(#rod-recessed-channel)"
                stroke="#090d16"
                strokeWidth="1.2"
              />
              <line
                x1={shankBL.x + 1}
                y1={shankBL.y}
                x2={shankTL.x + 1}
                y2={shankTL.y}
                stroke="#ffffff"
                strokeWidth="1.4"
                opacity="0.9"
              />

              {/* Small End Eye & Bushing */}
              <g id={`rod-small-end-${idx}`} transform={tiltDeg ? `rotate(${tiltDeg}, ${pWrist.x}, ${pWrist.y})` : undefined}>
                <circle cx={pWrist.x} cy={pWrist.y} r="8" fill="url(#rod-hbeam-shank)" stroke="#090d16" strokeWidth="2" />
                <circle cx={pWrist.x} cy={pWrist.y} r="8" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.85" />
                <circle cx={pWrist.x} cy={pWrist.y} r="5.8" fill="url(#wrist-pin-bushing-bronze)" stroke="#090d16" strokeWidth="0.9" />
              </g>
            </g>

            {/* ── 3. PISTON CROWN & WRIST PIN ASSEMBLY (RECIPROCATING STROKE) ── */}
            <g
              id={`piston-crown-group-${idx}`}
              className={crownAnimClass}
              style={{
                animationDelay: `${phaseDelaySeconds}s`,
              }}
            >
              {/* Full-Floating Wrist Pin */}
              <g id={`wrist-pin-${idx}`} transform={tiltDeg ? `rotate(${tiltDeg}, ${pWrist.x}, ${pWrist.y})` : undefined}>
                <rect
                  x={pWrist.x - 13}
                  y={pWrist.y - 4}
                  width="26"
                  height="8"
                  rx="4"
                  fill="url(#wrist-pin-dlc-chrome)"
                  stroke="#090d16"
                  strokeWidth="1.6"
                />
                <line
                  x1={pWrist.x - 11}
                  y1={pWrist.y - 1.5}
                  x2={pWrist.x + 11}
                  y2={pWrist.y - 1.5}
                  stroke="#ffffff"
                  strokeWidth="1.4"
                  opacity="0.95"
                />
                <ellipse cx={pWrist.x - 12.5} cy={pWrist.y} rx="1.6" ry="3.4" fill="#020617" stroke="#64748b" strokeWidth="0.8" />
                <ellipse cx={pWrist.x + 12.5} cy={pWrist.y} rx="1.6" ry="3.4" fill="#020617" stroke="#64748b" strokeWidth="0.8" />
              </g>

            {/* ── 5. PISTON 3D VOLUMETRIC CYLINDER SKIRT, LINER SLEEVE & CROWN ── */}
            <g id={`piston-body-${idx}`}>
              {/* Exposed Cutaway Cylinder Liner Sleeve Wall (hollow blue-ringed cylinder matching reference) */}
              <g id={`cylinder-sleeve-cutaway-${idx}`}>
                {/* Outer Sleeve Shell Path */}
                <path
                  d={`M ${pCrown.x - rx - 3.5} ${pCrown.y - 10}
                      L ${pCrown.x + rx + 3.5} ${pCrown.y - 10}
                      L ${pCrown.x + rx + 3.5} ${pWrist.y + 15}
                      L ${pCrown.x - rx - 3.5} ${pWrist.y + 15} Z`}
                  fill="url(#v12-crankcase-deep)"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  opacity="0.4"
                  transform={tiltDeg ? `rotate(${tiltDeg}, ${pCrown.x}, ${pCrown.y})` : undefined}
                />
                {/* Top Machined Sleeve Rim Ring (Electric Blue Anodized Seal Ring matching reference) */}
                <ellipse
                  cx={pCrown.x}
                  cy={pCrown.y - 10}
                  rx={rx + 3.5}
                  ry={ry + 2}
                  fill="url(#electric-blue-lip)"
                  stroke="#0f172a"
                  strokeWidth="2.2"
                  transform={tiltDeg ? `rotate(${tiltDeg}, ${pCrown.x}, ${pCrown.y})` : undefined}
                />
                <ellipse
                  cx={pCrown.x}
                  cy={pCrown.y - 10}
                  rx={rx + 1.5}
                  ry={ry + 0.8}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  opacity="0.9"
                  transform={tiltDeg ? `rotate(${tiltDeg}, ${pCrown.x}, ${pCrown.y})` : undefined}
                />
              </g>

              {/* Piston Skirt Side Body */}
              <path
                d={`M ${pCrown.x - rx} ${pCrown.y} L ${pCrown.x + rx} ${pCrown.y} L ${pCrown.x + rx * 0.9} ${pWrist.y + 5} C ${pCrown.x + rx * 0.5} ${pWrist.y + 9} ${pCrown.x - rx * 0.5} ${pWrist.y + 9} ${pCrown.x - rx * 0.9} ${pWrist.y + 5} Z`}
                fill="url(#camshaft-steel-journal)"
                stroke="#0f172a"
                strokeWidth="2.4"
                transform={tiltDeg ? `rotate(${tiltDeg}, ${pCrown.x}, ${pCrown.y})` : undefined}
              />

              {/* Pin Boss Recess Cutouts on Skirt Body */}
              <rect
                x={pWrist.x - 10}
                y={pWrist.y - 5}
                width="20"
                height="10"
                rx="3"
                fill="#0f172a"
                stroke="#0f172a"
                strokeWidth="1.5"
                opacity="0.85"
                transform={tiltDeg ? `rotate(${tiltDeg}, ${pWrist.x}, ${pWrist.y})` : undefined}
              />

              {/* Piston Crown 3D Top Deck Ellipse (Tilted matching Cylinder Bank) */}
              <ellipse
                cx={pCrown.x}
                cy={pCrown.y}
                rx={rx}
                ry={ry}
                fill="url(#machined-aluminum-texture)"
                stroke="#0f172a"
                strokeWidth="2.5"
                transform={tiltDeg ? `rotate(${tiltDeg}, ${pCrown.x}, ${pCrown.y})` : undefined}
              />
              <ellipse
                cx={pCrown.x}
                cy={pCrown.y}
                rx={rx - 1.2}
                ry={ry - 0.6}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.6"
                opacity="0.95"
                transform={tiltDeg ? `rotate(${tiltDeg}, ${pCrown.x}, ${pCrown.y})` : undefined}
              />

              {/* Dual CNC Valve Relief Pockets on Piston Crown */}
              <ellipse
                cx={pCrown.x - 4.5}
                cy={pCrown.y - 1}
                rx="3.8"
                ry="1.8"
                fill="url(#hex-socket-recess)"
                stroke="#0f172a"
                strokeWidth="1"
              />
              <ellipse
                cx={pCrown.x + 4.5}
                cy={pCrown.y - 1}
                rx="3.8"
                ry="1.8"
                fill="url(#hex-socket-recess)"
                stroke="#0f172a"
                strokeWidth="1"
              />

              {/* Piston Triple Ring Pack */}
              <ellipse
                cx={pCrown.x}
                cy={pCrown.y + 3.5}
                rx={rx + 0.4}
                ry={ry + 0.2}
                fill="none"
                stroke="url(#bearing-saddle-chrome)"
                strokeWidth="1.6"
                transform={tiltDeg ? `rotate(${tiltDeg}, ${pCrown.x}, ${pCrown.y + 3.5})` : undefined}
              />
              <ellipse
                cx={pCrown.x}
                cy={pCrown.y + 7}
                rx={rx + 0.4}
                ry={ry + 0.2}
                fill="none"
                stroke="url(#rod-hbeam-shank)"
                strokeWidth="1.6"
                transform={tiltDeg ? `rotate(${tiltDeg}, ${pCrown.x}, ${pCrown.y + 7})` : undefined}
              />
              <ellipse
                cx={pCrown.x}
                cy={pCrown.y + 10.5}
                rx={rx + 0.4}
                ry={ry + 0.2}
                fill="none"
                stroke="#0f172a"
                strokeWidth="1.8"
                transform={tiltDeg ? `rotate(${tiltDeg}, ${pCrown.x}, ${pCrown.y + 10.5})` : undefined}
              />
            </g>
          </g>
        </g>
        );
      })}
    </g>
  );
};
