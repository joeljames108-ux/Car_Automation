// ===================================================================
// APEX ENGINE BUILDER — 3D ISOMETRIC ENGINE COVER & RAM-AIR PLENUM
// Carbon-Fiber Dress Cover, Gold Framing, Velocity Stack Windows (Photo 2)
// ===================================================================

import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso } from "./isoMath";

interface EngineCoverIsoProps {
  layoutSpec?: {
    label: string;
    cyls: number[];
    width: number;
    bx: number;
    bw: number;
    bh: number;
    category?: string;
  };
  componentState?: {
    isInstalled: boolean;
    isActive: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  selectedVariant?: string;
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * Photorealistic 3D Isometric Carbon-Fiber & Billet Gold Engine Cover
 * Features transparent ITB velocity stack viewing windows & front ram-air intake scoop.
 */
export const EngineCoverIso: React.FC<EngineCoverIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariant = "billet",
  onHoverComponent,
}) => {
  const originScreen = useMemo(() => ({ x: 250, y: 215 }), []);

  const cat = (layoutSpec?.category || "").toLowerCase();
  const label = (layoutSpec?.label || "").toLowerCase();
  const isInline = cat === "inline" || label.includes("i3") || label.includes("i4") || label.includes("i6");
  const isBoxer = cat === "flat" || label.includes("boxer");

  const BL = useMemo(() => {
    if (label.includes("i3") || layoutSpec?.cyls?.length === 3) return 140;
    if (label.includes("i4")) return 175;
    if (label.includes("i6")) return 224;
    if (label.includes("v6") || label.includes("w12")) return 150;
    if (label.includes("v8") || label.includes("w16")) return 180;
    if (label.includes("v10")) return 205;
    if (isBoxer) return label.includes("h6") ? 186 : 145;
    return 230; // V12 default
  }, [label, layoutSpec?.cyls?.length, isBoxer]);

  const halfL = BL / 2;

  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen),
    [originScreen]
  );

  // 3D Datums for Engine Cover
  const coverZ = isBoxer ? 120 : 158;
  const coverH = 26;
  const coverW = isInline ? 54 : 76;
  const coverXStart = -halfL + 12;
  const coverXEnd = halfL - 10;

  // Precompute 3D Corner Coordinates
  const {
    cTopFL, cTopFR, cTopBL, cTopBR,
    cBotFL, cBotFR, cBotBL, cBotBR,
    goldFrameTopFL, goldFrameTopFR, goldFrameTopBL, goldFrameTopBR,
    glassWindowFL, glassWindowFR, glassWindowBL, glassWindowBR,
    ramAirInletFL, ramAirInletFR, ramAirInletBL, ramAirInletBR,
    badgePt,
    itbWindows,
    fastenerBolts,
  } = useMemo(() => {
    // Top Main Cover Plate
    const tFL = P(coverXStart, coverW / 2, coverZ + coverH);
    const tFR = P(coverXEnd, coverW / 2, coverZ + coverH);
    const tBL = P(coverXStart, -coverW / 2, coverZ + coverH);
    const tBR = P(coverXEnd, -coverW / 2, coverZ + coverH);

    // Bottom Base Flange
    const bFL = P(coverXStart, coverW / 2, coverZ);
    const bFR = P(coverXEnd, coverW / 2, coverZ);
    const bBL = P(coverXStart, -coverW / 2, coverZ);
    const bBR = P(coverXEnd, -coverW / 2, coverZ);

    // Gold Anodized Bezel Frame (Raised Inner Window)
    const gfFL = P(coverXStart + 18, coverW / 2 - 8, coverZ + coverH + 3);
    const gfFR = P(coverXEnd - 18, coverW / 2 - 8, coverZ + coverH + 3);
    const gfBL = P(coverXStart + 18, -coverW / 2 + 8, coverZ + coverH + 3);
    const gfBR = P(coverXEnd - 18, -coverW / 2 + 8, coverZ + coverH + 3);

    // Glass Window Viewport
    const gwFL = P(coverXStart + 22, coverW / 2 - 12, coverZ + coverH + 3);
    const gwFR = P(coverXEnd - 22, coverW / 2 - 12, coverZ + coverH + 3);
    const gwBL = P(coverXStart + 22, -coverW / 2 + 12, coverZ + coverH + 3);
    const gwBR = P(coverXEnd - 22, -coverW / 2 + 12, coverZ + coverH + 3);

    // Front Ram-Air Induction Scoop
    const raFL = P(coverXStart - 16, 26, coverZ + coverH + 4);
    const raFR = P(coverXStart + 6, 26, coverZ + coverH + 4);
    const raBL = P(coverXStart - 16, -6, coverZ + coverH + 4);
    const raBR = P(coverXStart + 6, -6, coverZ + coverH + 4);

    // Center Badge Location
    const badge = P(0, 0, coverZ + coverH + 4);

    // Velocity Stack Viewing Windows / Portholes
    const windows: { left: { x: number; y: number }; right: { x: number; y: number } }[] = [];
    const numWindows = Math.min(6, Math.max(3, Math.floor(BL / 36)));
    for (let idx = 0; idx < numWindows; idx++) {
      const wx = -halfL + 30 + idx * ((BL - 60) / (numWindows - 1 || 1));
      const ptL = P(wx, 14, coverZ + coverH + 3.5);
      const ptR = P(wx, -14, coverZ + coverH + 3.5);
      windows.push({ left: ptL, right: ptR });
    }

    // Perimeter Gold Fastener Bolts
    const bolts: { x: number; y: number }[] = [];
    [-halfL * 0.7, 0, halfL * 0.7].forEach((bx) => {
      bolts.push(P(bx, coverW / 2 - 3, coverZ + coverH + 1));
      bolts.push(P(bx, -coverW / 2 + 3, coverZ + coverH + 1));
    });

    return {
      cTopFL: tFL, cTopFR: tFR, cTopBL: tBL, cTopBR: tBR,
      cBotFL: bFL, cBotFR: bFR, cBotBL: bBL, cBotBR: bBR,
      goldFrameTopFL: gfFL, goldFrameTopFR: gfFR, goldFrameTopBL: gfBL, goldFrameTopBR: gfBR,
      glassWindowFL: gwFL, glassWindowFR: gwFR, glassWindowBL: gwBL, glassWindowBR: gwBR,
      ramAirInletFL: raFL, ramAirInletFR: raFR, ramAirInletBL: raBL, ramAirInletBR: raBR,
      badgePt: badge,
      itbWindows: windows,
      fastenerBolts: bolts,
    };
  }, [P, coverXStart, coverXEnd, coverW, coverZ, coverH, BL, halfL]);

  return (
    <g
      id="iso-engine-cover-3d"
      onMouseEnter={() => onHoverComponent?.("engine_cover")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState ? componentState.opacity : 1,
      }}
    >
      {/* ── 1. BASE CARBON FIBER SHROUD (Front & Right Flanks) ── */}
      <g id="cover-base-shroud">
        <path
          d={`M ${cBotFL.x} ${cBotFL.y} L ${cBotFR.x} ${cBotFR.y} L ${cTopFR.x} ${cTopFR.y} L ${cTopFL.x} ${cTopFL.y} Z`}
          fill="url(#carbon-twill)"
          stroke="#090d16"
          strokeWidth="2"
        />
        <path
          d={`M ${cBotFR.x} ${cBotFR.y} L ${cBotBR.x} ${cBotBR.y} L ${cTopBR.x} ${cTopBR.y} L ${cTopFR.x} ${cTopFR.y} Z`}
          fill="url(#carbon-twill)"
          stroke="#090d16"
          strokeWidth="2"
          opacity="0.8"
        />
        <path
          d={`M ${cTopFL.x} ${cTopFL.y} L ${cTopFR.x} ${cTopFR.y} L ${cTopBR.x} ${cTopBR.y} L ${cTopBL.x} ${cTopBL.y} Z`}
          fill="url(#carbon-twill)"
          stroke="#090d16"
          strokeWidth="2"
        />
      </g>

      {/* ── 2. GOLD ANODIZED BILLET BEZEL FRAME ── */}
      <g id="gold-anodized-bezel">
        <path
          d={`M ${goldFrameTopFL.x} ${goldFrameTopFL.y} L ${goldFrameTopFR.x} ${goldFrameTopFR.y} L ${goldFrameTopBR.x} ${goldFrameTopBR.y} L ${goldFrameTopBL.x} ${goldFrameTopBL.y} Z`}
          fill="url(#gold-anodized)"
          stroke="#090d16"
          strokeWidth="1.8"
        />
        <path
          d={`M ${goldFrameTopFL.x} ${goldFrameTopFL.y} L ${goldFrameTopFR.x} ${goldFrameTopFR.y}`}
          stroke="#ffffff"
          strokeWidth="1.2"
          opacity="0.9"
        />
      </g>

      {/* ── 3. TRANSPARENT POLYCARBONATE VIEWING WINDOW ── */}
      <g id="itb-viewing-glass">
        <path
          d={`M ${glassWindowFL.x} ${glassWindowFL.y} L ${glassWindowFR.x} ${glassWindowFR.y} L ${glassWindowBR.x} ${glassWindowBR.y} L ${glassWindowBL.x} ${glassWindowBL.y} Z`}
          fill="url(#glass-tint)"
          stroke="#38bdf8"
          strokeWidth="1.2"
          opacity="0.9"
        />
        {/* Specular Diagonal Reflection Streak */}
        <path
          d={`M ${glassWindowFL.x + 8} ${glassWindowFL.y} L ${glassWindowFR.x - 30} ${glassWindowFR.y - 12} L ${glassWindowFR.x - 18} ${glassWindowFR.y - 12} L ${glassWindowFL.x + 20} ${glassWindowFL.y} Z`}
          fill="#ffffff"
          opacity="0.22"
        />
      </g>

      {/* ── 4. ITB VELOCITY STACK PORTHOLES VISIBLE THROUGH GLASS ── */}
      <g id="portholes-through-glass">
        {itbWindows.map((win, idx) => (
          <g key={`porthole-${idx}`}>
            <circle cx={win.left.x} cy={win.left.y} r="5" fill="#020617" stroke="#38bdf8" strokeWidth="0.8" opacity="0.8" />
            <circle cx={win.right.x} cy={win.right.y} r="5" fill="#020617" stroke="#38bdf8" strokeWidth="0.8" opacity="0.8" />
          </g>
        ))}
      </g>

      {/* ── 5. FRONT RAM-AIR INDUCTION SCOOP ── */}
      <g id="front-ram-air-scoop">
        <path
          d={`M ${ramAirInletFL.x} ${ramAirInletFL.y} L ${ramAirInletFR.x} ${ramAirInletFR.y} L ${ramAirInletBR.x} ${ramAirInletBR.y} L ${ramAirInletBL.x} ${ramAirInletBL.y} Z`}
          fill="url(#carbon-twill)"
          stroke="#090d16"
          strokeWidth="1.8"
        />
        <circle cx={ramAirInletFL.x + 10} cy={ramAirInletFL.y - 4} r="7" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
      </g>

      {/* ── 6. GOLD FASTENERS & APEX MOTORSPORT BADGE ── */}
      <g id="cover-fasteners-badge">
        {fastenerBolts.map((bolt, idx) => (
          <g key={`bolt-cover-${idx}`}>
            <circle cx={bolt.x} cy={bolt.y} r="3" fill="url(#gold-anodized)" stroke="#090d16" strokeWidth="0.8" />
            <circle cx={bolt.x} cy={bolt.y} r="1" fill="#020617" />
          </g>
        ))}
        {/* Emblem Badge */}
        <circle cx={badgePt.x} cy={badgePt.y} r="9" fill="url(#gold-anodized)" stroke="#090d16" strokeWidth="1.5" />
        <circle cx={badgePt.x} cy={badgePt.y} r="7" fill="#0f172a" />
        <circle cx={badgePt.x} cy={badgePt.y} r="3" fill="#38bdf8" />
      </g>
    </g>
  );
};
