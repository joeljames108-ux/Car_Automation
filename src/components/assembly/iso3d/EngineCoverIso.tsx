// ===================================================================
// APEX ENGINE BUILDER — 3D ISOMETRIC ENGINE COVER MASTER ROUTER
// Photorealistic Layout-Specific Dress Covers & Ram-Air Induction
// ===================================================================

import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { type ScreenPoint2D } from "./isoMath";
import { InlineEngineCoverIso } from "./covers/InlineEngineCoverIso";
import { VBankEngineCoverIso } from "./covers/VBankEngineCoverIso";
import { BoxerEngineCoverIso } from "./covers/BoxerEngineCoverIso";
import { WBankEngineCoverIso } from "./covers/WBankEngineCoverIso";
import { SpecialtyEngineCoverIso } from "./covers/SpecialtyEngineCoverIso";

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
 * ═══════════════════════════════════════════════════════════════════
 * PHOTOREALISTIC 3D ISOMETRIC ENGINE COVERS FOR ALL ENGINE FAMILIES
 * ═══════════════════════════════════════════════════════════════════
 *
 * Dedicated Bespoke 3D Cover Architectures for:
 *  1. INLINE ENGINES (I3, I4, I6) — Sculpted DOHC Carbon Shroud with Coil Pack Channels & Billet Filler
 *  2. V-BANK ENGINES (V6, V8, V10, V12) — Twin-Bank Split Carbon Fiber Plenum with Quartz ITB Windows
 *  3. BOXER ENGINES (H4, H6) — Low-Profile Top-Mount Intercooler Ducting & Horizontal Heat Shields
 *  4. W-BANK HYPERCAR ENGINES (W12, W16, W18) — Quad-Bank Carbon Plenum with Aluminum Cooling Mesh
 *  5. ROTARY WANKEL ENGINES (2-Rotor, 3-Rotor, 4-Rotor) — Triangular Rotor-Apex Cowling & Ignition Loom
 *  6. RADIAL AERO ENGINES (7-Cyl, 9-Cyl) — Circular Nose Cowling with Pushrod Fairings
 *  7. EV & HYBRID POWERTRAINS — High-Voltage 800V SiC Inverter Shield & Coolant Manifold
 */
export const EngineCoverIso: React.FC<EngineCoverIsoProps> = ({
  layoutSpec,
  componentState,
  selectedVariant = "carbon",
  onHoverComponent,
}) => {
  const originScreen: ScreenPoint2D = useMemo(() => ({ x: 250, y: 215 }), []);

  const cat = (layoutSpec?.category || "").toLowerCase();
  const label = (layoutSpec?.label || "").toLowerCase();

  const isInline = cat === "inline" || label.includes("i3") || label.includes("i4") || label.includes("i6");
  const isBoxer = cat === "flat" || label.includes("boxer") || label.includes("h4") || label.includes("h6");
  const isRotary = cat === "rotary" || label.includes("rotary") || label.includes("wankel");
  const isRadial = cat === "radial" || label.includes("radial");
  const isWBank = cat === "w" || label.includes("w12") || label.includes("w16") || label.includes("w18");
  const isEV = cat === "ev" || label.includes("electric") || label.includes("ev");
  const isHybrid = cat === "hybrid" || label.includes("hybrid");
  const isVBank = !isInline && !isBoxer && !isRotary && !isRadial && !isWBank && !isEV && !isHybrid;

  // Primary Block Dimension Scale
  const BL = useMemo(() => {
    if (label.includes("i3") || layoutSpec?.cyls?.length === 3) return 140;
    if (label.includes("i4")) return 175;
    if (label.includes("i6")) return 224;
    if (label.includes("v6") || label.includes("w12")) return 152;
    if (label.includes("v8") || label.includes("w16")) return 184;
    if (label.includes("v10")) return 208;
    if (isBoxer) return label.includes("h6") ? 186 : 145;
    if (isRotary) return 130;
    if (isRadial) return 160;
    return 232; // V12 default
  }, [label, layoutSpec?.cyls?.length, isBoxer, isRotary, isRadial]);

  // Material Shader Presets
  const materialFills = useMemo(() => {
    switch (selectedVariant) {
      case "gold":
      case "billet":
        return {
          main: "url(#gold-anodized)",
          flank: "url(#cel-steel-block)",
          accent: "#facc15",
          highlight: "#ffffff",
          shadow: "#78350f",
        };
      case "candy_red":
      case "motorsport":
        return {
          main: "url(#valve-cover-red-top)",
          flank: "url(#valve-cover-red-left)",
          accent: "#ef4444",
          highlight: "#fca5a5",
          shadow: "#450a0a",
        };
      case "forged_carbon":
        return {
          main: "url(#carbon-twill)",
          flank: "url(#transmission-case-cast)",
          accent: "#38bdf8",
          highlight: "#e2e8f0",
          shadow: "#020617",
        };
      case "carbon":
      default:
        return {
          main: "url(#carbon-twill)",
          flank: "url(#transmission-case-cast)",
          accent: "#22d3ee",
          highlight: "#ffffff",
          shadow: "#000000",
        };
    }
  }, [selectedVariant]);

  return (
    <g
      id="iso-engine-cover-3d-assembly"
      onMouseEnter={() => onHoverComponent?.("engine_cover")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className={`cursor-pointer transition-all duration-700 ease-out ${
        componentState?.isActive ? "filter-glow-active" : ""
      }`}
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState ? componentState.opacity : 1,
      }}
    >
      {/* ── 1. INLINE ENGINES (I3, I4, I6) ── */}
      {isInline && (
        <InlineEngineCoverIso
          label={label}
          numCyls={label.includes("i3") ? 3 : label.includes("i6") ? 6 : 4}
          BL={BL}
          originScreen={originScreen}
          materialFills={materialFills}
        />
      )}

      {/* ── 2. V-BANK SUPERCAR ENGINES (V6, V8, V10, V12) ── */}
      {isVBank && (
        <VBankEngineCoverIso
          label={label}
          BL={BL}
          originScreen={originScreen}
          materialFills={materialFills}
        />
      )}

      {/* ── 3. BOXER / FLAT ENGINES (H4, H6) ── */}
      {isBoxer && (
        <BoxerEngineCoverIso
          label={label}
          BL={BL}
          originScreen={originScreen}
          materialFills={materialFills}
        />
      )}

      {/* ── 4. W-BANK HYPERCAR ENGINES (W12, W16, W18) ── */}
      {isWBank && (
        <WBankEngineCoverIso
          label={label}
          BL={BL}
          originScreen={originScreen}
          materialFills={materialFills}
        />
      )}

      {/* ── 5. ROTARY WANKEL ENGINES (13B, 20B, 26B) ── */}
      {isRotary && (
        <SpecialtyEngineCoverIso
          type="rotary"
          label={label}
          BL={BL}
          originScreen={originScreen}
          materialFills={materialFills}
        />
      )}

      {/* ── 6. RADIAL AERO ENGINES (7-Cyl, 9-Cyl) ── */}
      {isRadial && (
        <SpecialtyEngineCoverIso
          type="radial"
          label={label}
          BL={BL}
          originScreen={originScreen}
          materialFills={materialFills}
        />
      )}

      {/* ── 7. EV & HYBRID POWERTRAINS (800V SiC Inverter) ── */}
      {(isEV || isHybrid) && (
        <SpecialtyEngineCoverIso
          type={isEV ? "ev" : "hybrid"}
          label={label}
          BL={BL}
          originScreen={originScreen}
          materialFills={materialFills}
        />
      )}
    </g>
  );
};
