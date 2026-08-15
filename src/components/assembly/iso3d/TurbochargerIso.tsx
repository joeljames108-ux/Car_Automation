import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso } from "./isoMath";

interface TurbochargerIsoProps {
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
 * ═══════════════════════════════════════════════════════════════════
 * 3D ISOMETRIC TURBOCHARGER ASSEMBLY — Precision Twin-Scroll System
 * ═══════════════════════════════════════════════════════════════════
 *
 * Photorealistic billet compressor wheel, cast nickel turbine housing,
 * titanium downpipe, wastegate canister, and braided stainless oil lines.
 */
const TurbochargerIsoComponent: React.FC<TurbochargerIsoProps> = ({
  layoutSpec,
  componentState,
  isAssemblyComplete,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = useMemo(() => ({ x: 250, y: 215 }), []);
  const P = useMemo(() => (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen), [originScreen]);

  const cat = (layoutSpec.category || "").toLowerCase();
  const label = (layoutSpec.label || "").toLowerCase();
  const isBoxer = cat === "flat" || label.includes("boxer");
  const isInline = cat === "inline" || label.includes("i3") || label.includes("i4") || label.includes("i6");

  // Dynamic mounting positions
  const blockW = isInline ? 175 : isBoxer ? 150 : 210;
  const turboY = isBoxer ? -55 : isInline ? 48 : -65;
  const turboZ = isBoxer ? 50 : isInline ? 100 : 110;

  const tPt = P(blockW / 2 - 20, turboY, turboZ);
  const turbinePt = P(blockW / 2 - 35, turboY - 7, turboZ - 15);
  const dpStart = P(blockW / 2 - 35, turboY - 7, turboZ - 30);
  const dpEnd = P(blockW / 2 - 55, turboY - 20, turboZ - 75);
  const wgPt = P(blockW / 2, turboY + 15, turboZ + 25);

  return (
    <g
      id="iso-turbocharger-assembly-3d"
      onMouseEnter={() => onHoverComponent?.("turbocharger")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {/* ── 1. STAINLESS STEEL DOWNPIPE & V-BAND CLAMP ── */}
      <g id="turbo-downpipe">
        <path
          d={`M ${dpStart.x} ${dpStart.y} C ${dpStart.x - 10} ${dpStart.y + 35} ${dpEnd.x + 20} ${dpEnd.y - 15} ${dpEnd.x} ${dpEnd.y}`}
          fill="none"
          stroke="url(#stainless-downpipe)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d={`M ${dpStart.x - 2} ${dpStart.y} C ${dpStart.x - 12} ${dpStart.y + 33} ${dpEnd.x + 18} ${dpEnd.y - 17} ${dpEnd.x - 2} ${dpEnd.y}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          opacity="0.85"
          strokeLinecap="round"
        />
        {/* V-Band Clamp */}
        <circle cx={dpStart.x} cy={dpStart.y} r="13" fill="none" stroke="#090d16" strokeWidth="4" />
        <circle cx={dpStart.x} cy={dpStart.y} r="13" fill="none" stroke="url(#vband-clamp-titanium)" strokeWidth="2.5" />
      </g>

      {/* ── 2. CAST INCONEL TURBINE SCROLL HOUSING (HOT SIDE) ── */}
      <g id="turbine-housing">
        <circle cx={turbinePt.x} cy={turbinePt.y} r="22" fill="#090d16" />
        <circle cx={turbinePt.x} cy={turbinePt.y} r="20" fill="url(#turbine-housing-cast)" stroke="#090d16" strokeWidth="1.5" />
        <ellipse cx={turbinePt.x - 4} cy={turbinePt.y - 3} rx="14" ry="11" fill="none" stroke="#e2e8f0" strokeWidth="1.5" opacity="0.4" />
        <circle cx={turbinePt.x} cy={turbinePt.y} r="9" fill="#020617" />
      </g>

      {/* ── 3. BILLET COMPRESSOR COVER & COLD SIDE INDUCER WHEEL ── */}
      <g id="compressor-housing">
        <circle cx={tPt.x} cy={tPt.y} r="28" fill="#090d16" />
        <circle cx={tPt.x} cy={tPt.y} r="26" fill="url(#compressor-billet-housing)" stroke="#090d16" strokeWidth="2" />
        <circle cx={tPt.x} cy={tPt.y} r="24" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
        {/* Inducer Inlet Bore */}
        <circle cx={tPt.x} cy={tPt.y} r="16" fill="#020617" stroke="#090d16" strokeWidth="2" />
        <circle cx={tPt.x} cy={tPt.y} r="14.5" fill="url(#carbon-twill)" />
        {/* 11-Blade Forged Billet Compressor Wheel Hub */}
        <circle cx={tPt.x} cy={tPt.y} r="13" fill="none" stroke="url(#billet-compressor-blades)" strokeWidth="5" strokeDasharray="3.5 3.5" />
        {/* Center Bullet Nose Nut */}
        <circle cx={tPt.x} cy={tPt.y} r="4" fill="url(#titanium-anodized)" stroke="#090d16" strokeWidth="1" />
        <circle cx={tPt.x - 1} cy={tPt.y - 1} r="1.5" fill="#ffffff" opacity="0.9" />
      </g>

      {/* ── 4. WASTEGATE ACTUATOR & BILLET BRACKET ── */}
      <g id="wastegate-actuator">
        <line x1={tPt.x + 12} y1={tPt.y - 8} x2={wgPt.x} y2={wgPt.y} stroke="#090d16" strokeWidth="5" />
        <line x1={tPt.x + 12} y1={tPt.y - 8} x2={wgPt.x} y2={wgPt.y} stroke="url(#bearing-saddle-chrome)" strokeWidth="3" />
        {/* Canister Body */}
        <ellipse cx={wgPt.x} cy={wgPt.y} rx="12" ry="9" fill="url(#titanium-anodized)" stroke="#090d16" strokeWidth="1.8" />
        <ellipse cx={wgPt.x - 2} cy={wgPt.y - 1} rx="9" ry="6" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.8" />
      </g>

      {/* ── 5. BRAIDED STAINLESS STEEL OIL FEED & RETURN LINES ── */}
      <g id="turbo-oil-lines">
        <path
          d={`M ${tPt.x - 6} ${tPt.y - 20} C ${tPt.x - 18} ${tPt.y - 35} ${tPt.x - 40} ${tPt.y - 20} ${tPt.x - 55} ${tPt.y - 5}`}
          fill="none"
          stroke="url(#braided-steel-hose)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* AN-Fitting Couplers */}
        <circle cx={tPt.x - 6} cy={tPt.y - 20} r="4.5" fill="url(#titanium-anodized)" stroke="#090d16" strokeWidth="1" />
        <circle cx={tPt.x - 55} cy={tPt.y - 5} r="4.5" fill="url(#titanium-anodized)" stroke="#090d16" strokeWidth="1" />
      </g>
    </g>
  );
};

export const TurbochargerIso = React.memo(TurbochargerIsoComponent);
