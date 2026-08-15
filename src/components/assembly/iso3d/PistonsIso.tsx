import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, projectIsoTiltedEllipse, projectIso60VEllipse, projectIsoFlatEllipse } from "./isoMath";
import { getPhotorealisticMaterial, SpecularHotspot, ContactShadow, MachiningMark } from "./isoMaterialPipeline";

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
 * ═══════════════════════════════════════════════════════════════════
 * 3D ISOMETRIC PISTONS & FORGED H-BEAM RODS — Multi-Layout Engine
 * ═══════════════════════════════════════════════════════════════════
 *
 * Dynamically generates piston assemblies per architecture:
 * - Inline (I3, I4, I6): Vertical pistons with alternating stroke phasing
 * - V-Bank (V6, V8, V10, V12): Angled banks with paired connecting rods
 * - Boxer (H4, H6): Horizontally opposed sideways-firing pistons
 * - W-Bank (W12, W16, W18): Quad-bank staggered pistons
 * - Rotary: Triangular rotor profile with apex seals
 */
const PistonsIsoComponent: React.FC<PistonsIsoProps> = ({
  layoutSpec,
  componentState,
  isAssemblyComplete,
  selectedVariants,
  onHoverComponent,
}) => {
  const originScreen = { x: 250, y: 215 };
  const materialGrade = selectedVariants?.pistons || "forged";
  const { fills } = getPhotorealisticMaterial(materialGrade, "forged_aluminum");

  const cat = (layoutSpec.category || "").toLowerCase();
  const label = (layoutSpec.label || "").toLowerCase();
  const isV = cat === "vbank" || label.includes("v-") || label.includes("v6") || label.includes("v8") || label.includes("v10") || label.includes("v12");
  const isBoxer = cat === "flat" || label.includes("boxer") || label.includes("h4") || label.includes("h6");
  const isW = cat === "wbank" || label.includes("w12") || label.includes("w16") || label.includes("w18");
  const isRotary = cat === "rotary" || label.includes("rotary") || label.includes("wankel");

  // Build dynamic piston array
  const pistonList = useMemo(() => {
    const list: {
      idx: number;
      pCrank: { x: number; y: number };
      pWrist: { x: number; y: number };
      pCrown: { x: number; y: number };
      tiltDeg: number;
      bankSide: "left" | "right" | "inline";
      rx: number;
      ry: number;
    }[] = [];

    if (isBoxer) {
      const isH6 = label.includes("h6") || label.includes("6");
      const xPositions = isH6 ? [-50, 0, 50] : [-30, 30];
      const crankZ = 43;

      xPositions.forEach((boreX, idx) => {
        const isOdd = idx % 2 === 1;
        const stroke = isOdd ? 8 : -8;

        // Left Bank (+Y)
        const lCrown3D = { x: boreX, y: 88 + stroke, z: crankZ };
        const lWrist3D = { x: boreX, y: 65 + stroke, z: crankZ };
        const lCrank3D = { x: boreX, y: 16, z: crankZ };

        const lCrown = projectIso(lCrown3D, originScreen);
        const lWrist = projectIso(lWrist3D, originScreen);
        const lCrank = projectIso(lCrank3D, originScreen);
        const lFlat = projectIsoFlatEllipse(lCrown3D, 18, "left", originScreen);

        list.push({
          idx: idx * 2,
          pCrank: lCrank,
          pWrist: lWrist,
          pCrown: lCrown,
          tiltDeg: lFlat.tiltDeg,
          bankSide: "left",
          rx: lFlat.rx,
          ry: lFlat.ry,
        });

        // Right Bank (-Y)
        const rCrown3D = { x: boreX, y: -88 - stroke, z: crankZ };
        const rWrist3D = { x: boreX, y: -65 - stroke, z: crankZ };
        const rCrank3D = { x: boreX, y: -16, z: crankZ };

        const rCrown = projectIso(rCrown3D, originScreen);
        const rWrist = projectIso(rWrist3D, originScreen);
        const rCrank = projectIso(rCrank3D, originScreen);
        const rFlat = projectIsoFlatEllipse(rCrown3D, 18, "right", originScreen);

        list.push({
          idx: idx * 2 + 1,
          pCrank: rCrank,
          pWrist: rWrist,
          pCrown: rCrown,
          tiltDeg: rFlat.tiltDeg,
          bankSide: "right",
          rx: rFlat.rx,
          ry: rFlat.ry,
        });
      });
      return list;
    }

    if (isV || isW) {
      let numPairs = 6;
      let xPositions = [-85, -51, -17, 17, 51, 85];
      if (label.includes("v6") || label.includes("w12")) {
        numPairs = 3;
        xPositions = [-38, 0, 38];
      } else if (label.includes("v8") || label.includes("w16")) {
        numPairs = 4;
        xPositions = [-54, -18, 18, 54];
      } else if (label.includes("v10")) {
        numPairs = 5;
        xPositions = [-70, -35, 0, 35, 70];
      }

      xPositions.forEach((boreX, idx) => {
        const isOdd = idx % 2 === 1;
        const strokeOffset = isOdd ? 8 : -8;

        // Left Bank
        const leftCrown3D = { x: boreX, y: 50, z: 142.5 + strokeOffset };
        const leftWrist3D = { x: boreX, y: 38, z: 115 + strokeOffset };
        const leftCrank3D = { x: boreX, y: 14, z: 60 };

        const leftCrown = projectIso(leftCrown3D, originScreen);
        const leftWrist = projectIso(leftWrist3D, originScreen);
        const leftCrank = projectIso(leftCrank3D, originScreen);
        const leftTilted = projectIso60VEllipse(leftCrown3D, 16, "left", originScreen);

        list.push({
          idx: idx * 2,
          pCrank: leftCrank,
          pWrist: leftWrist,
          pCrown: leftCrown,
          tiltDeg: leftTilted.tiltDeg,
          bankSide: "left",
          rx: leftTilted.rx,
          ry: leftTilted.ry,
        });

        // Right Bank
        const rightCrown3D = { x: boreX, y: -50, z: 142.5 - strokeOffset };
        const rightWrist3D = { x: boreX, y: -38, z: 115 - strokeOffset };
        const rightCrank3D = { x: boreX, y: -14, z: 60 };

        const rightCrown = projectIso(rightCrown3D, originScreen);
        const rightWrist = projectIso(rightWrist3D, originScreen);
        const rightCrank = projectIso(rightCrank3D, originScreen);
        const rightTilted = projectIso60VEllipse(rightCrown3D, 16, "right", originScreen);

        list.push({
          idx: idx * 2 + 1,
          pCrank: rightCrank,
          pWrist: rightWrist,
          pCrown: rightCrown,
          tiltDeg: rightTilted.tiltDeg,
          bankSide: "right",
          rx: rightTilted.rx,
          ry: rightTilted.ry,
        });
      });
      return list;
    }

    // Inline (I3, I4, I6)
    let inlineXPositions = [-54, -18, 18, 54]; // I4 default
    if (label.includes("i3") || layoutSpec.cyls.length === 3) {
      inlineXPositions = [-38, 0, 38];
    } else if (label.includes("i6") || layoutSpec.cyls.length === 6) {
      inlineXPositions = [-85, -51, -17, 17, 51, 85];
    }

    inlineXPositions.forEach((boreX, idx) => {
      const isOdd = idx % 2 === 1;
      const strokeOffset = isOdd ? 10 : -10;

      const crown3D = { x: boreX, y: 0, z: 140 + strokeOffset };
      const wrist3D = { x: boreX, y: 0, z: 112 + strokeOffset };
      const crank3D = { x: boreX, y: isOdd ? 8 : -8, z: 58 };

      const crown = projectIso(crown3D, originScreen);
      const wrist = projectIso(wrist3D, originScreen);
      const crank = projectIso(crank3D, originScreen);

      list.push({
        idx,
        pCrank: crank,
        pWrist: wrist,
        pCrown: crown,
        tiltDeg: 0,
        bankSide: "inline",
        rx: 18 * Math.cos(Math.PI / 6),
        ry: 18 * Math.sin(Math.PI / 6),
      });
    });

    return list;
  }, [isBoxer, isV, isW, label, layoutSpec.cyls.length]);

  return (
    <g
      id="iso-pistons-assembly"
      onMouseEnter={() => onHoverComponent?.("pistons")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
    >
      {pistonList.map((p) => {
        return (
          <g key={`piston-${p.idx}`} id={`piston-assembly-${p.idx}`}>
            {/* 1. FORGED H-BEAM CONNECTING ROD SHANK */}
            <line
              x1={p.pCrank.x}
              y1={p.pCrank.y}
              x2={p.pWrist.x}
              y2={p.pWrist.y}
              stroke="url(#rod-hbeam-shank)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* H-Beam Center Recess Channel */}
            <line
              x1={p.pCrank.x}
              y1={p.pCrank.y}
              x2={p.pWrist.x}
              y2={p.pWrist.y}
              stroke="#020617"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* 2. BIG END ROD JOURNAL BEARING CAP & ARP FASTENERS */}
            <circle cx={p.pCrank.x} cy={p.pCrank.y} r="9.5" fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="1.5" />
            <circle cx={p.pCrank.x} cy={p.pCrank.y} r="6.5" fill="url(#wrist-pin-bushing-bronze)" stroke="#090d16" strokeWidth="0.8" />
            <circle cx={p.pCrank.x - 6} cy={p.pCrank.y + 4} r="1.8" fill="url(#arp-bolt-head-12pt)" stroke="#090d16" strokeWidth="0.6" />
            <circle cx={p.pCrank.x + 6} cy={p.pCrank.y + 4} r="1.8" fill="url(#arp-bolt-head-12pt)" stroke="#090d16" strokeWidth="0.6" />

            {/* 3. SMALL END PIN BUSHING & CASE-HARDENED WRIST PIN */}
            <circle cx={p.pWrist.x} cy={p.pWrist.y} r="6.5" fill="url(#wrist-pin-bushing-bronze)" stroke="#090d16" strokeWidth="1" />
            <circle cx={p.pWrist.x} cy={p.pWrist.y} r="4.2" fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="0.8" />
            <circle cx={p.pWrist.x} cy={p.pWrist.y} r="2" fill="#020617" />

            {/* 4. FORGED RACING PISTON SKIRT & COMPRESSION RING PACK */}
            <path
              d={`M ${p.pCrown.x - p.rx} ${p.pCrown.y} L ${p.pWrist.x - p.rx * 0.9} ${p.pWrist.y + 4} L ${p.pWrist.x + p.rx * 0.9} ${p.pWrist.y + 4} L ${p.pCrown.x + p.rx} ${p.pCrown.y} Z`}
              fill={p.bankSide === "right" ? fills.right : fills.left}
              stroke="#090d16"
              strokeWidth="1.5"
            />
            {/* Compression Rings */}
            <line x1={p.pCrown.x - p.rx + 1} y1={p.pCrown.y + 5} x2={p.pCrown.x + p.rx - 1} y2={p.pCrown.y + 5} stroke="#020617" strokeWidth="1.2" />
            <line x1={p.pCrown.x - p.rx + 1} y1={p.pCrown.y + 8} x2={p.pCrown.x + p.rx - 1} y2={p.pCrown.y + 8} stroke="#020617" strokeWidth="1.2" />

            {/* 5. CNC DOME PISTON CROWN & VALVE RELIEF POCKETS */}
            <ellipse
              cx={p.pCrown.x}
              cy={p.pCrown.y}
              rx={p.rx}
              ry={p.ry}
              transform={p.tiltDeg ? `rotate(${p.tiltDeg}, ${p.pCrown.x}, ${p.pCrown.y})` : undefined}
              fill={fills.top}
              stroke="#090d16"
              strokeWidth="1.5"
            />
            {/* Valve Relief Pockets */}
            <circle
              cx={p.pCrown.x - p.rx * 0.4}
              cy={p.pCrown.y}
              r={p.rx * 0.3}
              fill="#020617"
              stroke="#475569"
              strokeWidth="0.5"
              opacity="0.75"
            />
            <circle
              cx={p.pCrown.x + p.rx * 0.4}
              cy={p.pCrown.y}
              r={p.rx * 0.3}
              fill="#020617"
              stroke="#475569"
              strokeWidth="0.5"
              opacity="0.75"
            />
          </g>
        );
      })}
    </g>
  );
};

export const PistonsIso = React.memo(PistonsIsoComponent);
