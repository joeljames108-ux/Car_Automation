import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso } from "./isoMath";

interface RadiatorIsoProps {
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
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * Photorealistic 3D Isometric Racing Radiator & Electric Cooling Fan Assembly (Optimized)
 * Consolidated static paths & memoized 3D trigonometry for 60fps performance.
 */
const RadiatorIsoComponent: React.FC<RadiatorIsoProps> = ({
  componentState,
  onHoverComponent,
}) => {
  const originScreen = useMemo(() => ({ x: 250, y: 215 }), []);
  const BL = 230;
  const halfL = BL / 2; // 115

  const P = useMemo(() => (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen), [originScreen]);

  // Radiator 3D Datums
  const radX = -halfL - 28;
  const radThickness = 12;
  const radWidth = 72;

  // Precomputed 3D Corner Coordinates
  const {
    rTopFL, rTopFR, rTopBL, rTopBR,
    rBotFL, rBotFR, rBotBL, rBotBR,
    radHoseOutlet, engWaterInlet, capPt,
    fanCenter, fanBladePathD, finPathD,
  } = useMemo(() => {
    const tFL = P(radX, radWidth / 2, 170);
    const tFR = P(radX + radThickness, radWidth / 2, 170);
    const tBL = P(radX, -radWidth / 2, 170);
    const tBR = P(radX + radThickness, -radWidth / 2, 170);

    const bFL = P(radX, radWidth / 2, 60);
    const bFR = P(radX + radThickness, radWidth / 2, 60);
    const bBL = P(radX, -radWidth / 2, 60);
    const bBR = P(radX + radThickness, -radWidth / 2, 60);

    const hose = P(radX + radThickness, 24, 75);
    const inlet = P(-halfL + 8, 38, 70);
    const cap = P(radX + 6, -radWidth / 2 + 10, 176);
    const fan = P(radX + radThickness + 8, 0, 115);

    // Single consolidated path for 7 curved fan blades
    let fanD = "";
    [0, 51, 103, 154, 206, 257, 308].forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      const bx = fan.x + 20 * Math.cos(rad);
      const by = fan.y + 30 * Math.sin(rad);
      fanD += `M ${fan.x} ${fan.y} Q ${fan.x + 8 * Math.cos(rad + 0.4)} ${fan.y + 12 * Math.sin(rad + 0.4)} ${bx} ${by} `;
    });

    // Single consolidated path for 16 cooling fins
    let finD = "";
    for (let idx = 0; idx < 16; idx++) {
      const finZ = 68 + idx * 6;
      const p1 = P(radX + radThickness, radWidth / 2 - 3, finZ);
      const p2 = P(radX + radThickness, -radWidth / 2 + 3, finZ);
      finD += `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} `;
    }

    return {
      rTopFL: tFL, rTopFR: tFR, rTopBL: tBL, rTopBR: tBR,
      rBotFL: bFL, rBotFR: bFR, rBotBL: bBL, rBotBR: bBR,
      radHoseOutlet: hose, engWaterInlet: inlet, capPt: cap,
      fanCenter: fan, fanBladePathD: fanD, finPathD: finD,
    };
  }, [P, radX, radThickness, radWidth, halfL]);

  return (
    <g
      id="iso-radiator-assembly-3d"
      onMouseEnter={() => onHoverComponent?.("block")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState?.opacity ?? 1,
      }}
    >
      {/* ── 1. REAR COOLING FAN SHROUD & BLADES ── */}
      <g id="radiator-cooling-fan">
        <ellipse
          cx={fanCenter.x}
          cy={fanCenter.y}
          rx="24"
          ry="36"
          fill="#0f172a"
          stroke="#090d16"
          strokeWidth="2"
        />
        {/* Electric Motor Hub */}
        <ellipse
          cx={fanCenter.x}
          cy={fanCenter.y}
          rx="8"
          ry="12"
          fill="url(#v12-cast-aluminum-body)"
          stroke="#090d16"
          strokeWidth="1.5"
        />
        {/* Consolidated 7 Aerodynamic Curved Fan Blades */}
        <path
          d={fanBladePathD}
          fill="none"
          stroke="#334155"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      {/* ── 2. RADIATOR CORE & ALUMINUM TANKS ── */}
      <g id="radiator-core">
        {/* Radiator Rear Face */}
        <polygon
          points={`${rTopBL.x},${rTopBL.y} ${rTopBR.x},${rTopBR.y} ${rBotBR.x},${rBotBR.y} ${rBotBL.x},${rBotBL.y}`}
          fill="url(#v12-cast-aluminum-body-right)"
          stroke="#090d16"
          strokeWidth="2"
        />

        {/* Radiator Top End Tank */}
        <polygon
          points={`${rTopFL.x},${rTopFL.y} ${rTopFR.x},${rTopFR.y} ${rTopBR.x},${rTopBR.y} ${rTopBL.x},${rTopBL.y}`}
          fill="url(#radiator-end-tank)"
          stroke="#090d16"
          strokeWidth="2.2"
        />

        {/* Radiator Front Core Face */}
        <polygon
          points={`${rTopFL.x},${rTopFL.y} ${rTopFR.x},${rTopFR.y} ${rBotFR.x},${rBotFR.y} ${rBotFL.x},${rBotFL.y}`}
          fill="url(#radiator-core-aluminum)"
          stroke="#090d16"
          strokeWidth="2.2"
        />

        {/* Consolidated 16 Horizontal Aluminum Cooling Fin Lines (Single DOM Node) */}
        <path
          d={finPathD}
          fill="none"
          stroke="#64748b"
          strokeWidth="1.2"
          opacity="0.65"
        />

        {/* Radiator Top Outer Bevel Highlight */}
        <line
          x1={rTopFL.x}
          y1={rTopFL.y}
          x2={rTopBL.x}
          y2={rTopBL.y}
          stroke="#ffffff"
          strokeWidth="2"
          opacity="0.95"
        />
        <line
          x1={rTopFL.x}
          y1={rTopFL.y}
          x2={rTopFR.x}
          y2={rTopFR.y}
          stroke="#ffffff"
          strokeWidth="2"
          opacity="0.95"
        />

        {/* Billet Radiator Pressure Cap */}
        <g id="radiator-pressure-cap">
          <ellipse
            cx={capPt.x}
            cy={capPt.y}
            rx="6.5"
            ry="4"
            fill="url(#bolt-boss-raised)"
            stroke="#090d16"
            strokeWidth="1.4"
          />
          <ellipse
            cx={capPt.x}
            cy={capPt.y}
            rx="4.5"
            ry="2.5"
            fill="url(#gold-anodized-bolt)"
            stroke="#78350f"
            strokeWidth="0.8"
          />
          <line x1={capPt.x - 5} y1={capPt.y} x2={capPt.x + 5} y2={capPt.y} stroke="#fef08a" strokeWidth="1.2" />
        </g>
      </g>

      {/* ── 3. CURVED COOLANT CROSSOVER SUPPLY PIPE ── */}
      <g id="coolant-crossover-pipe">
        <path
          d={`M ${radHoseOutlet.x} ${radHoseOutlet.y}
              C ${radHoseOutlet.x + 20} ${radHoseOutlet.y + 15} ${engWaterInlet.x - 20} ${engWaterInlet.y + 10} ${engWaterInlet.x} ${engWaterInlet.y}`}
          fill="none"
          stroke="url(#valve-cover-gold-top)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d={`M ${radHoseOutlet.x} ${radHoseOutlet.y - 1.5}
              C ${radHoseOutlet.x + 20} ${radHoseOutlet.y + 13.5} ${engWaterInlet.x - 20} ${engWaterInlet.y + 8.5} ${engWaterInlet.x} ${engWaterInlet.y - 1.5}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.9"
        />
        <ellipse
          cx={radHoseOutlet.x + 3}
          cy={radHoseOutlet.y + 2}
          rx="5"
          ry="7"
          fill="none"
          stroke="url(#bearing-saddle-chrome)"
          strokeWidth="2.5"
        />
        <ellipse
          cx={engWaterInlet.x - 3}
          cy={engWaterInlet.y + 1}
          rx="5"
          ry="7"
          fill="none"
          stroke="url(#bearing-saddle-chrome)"
          strokeWidth="2.5"
        />
      </g>

      {/* ── 4. ACRYLIC EXPANSION TANK ON TOP OF RADIATOR (Photo 1 & 2 Reference) ── */}
      <g id="radiator-expansion-tank">
        {/* Transparent Acrylic Reservoir Box */}
        <polygon
          points={`${rTopBL.x + 10},${rTopBL.y - 30} ${rTopBR.x + 10},${rTopBR.y - 30} ${rTopBR.x + 10},${rTopBR.y} ${rTopBL.x + 10},${rTopBL.y}`}
          fill="#38bdf8"
          fillOpacity="0.22"
          stroke="#38bdf8"
          strokeWidth="1.2"
        />
        <polygon
          points={`${rTopFL.x + 10},${rTopFL.y - 30} ${rTopFR.x + 10},${rTopFR.y - 30} ${rTopBR.x + 10},${rTopBR.y - 30} ${rTopBL.x + 10},${rTopBL.y - 30}`}
          fill="#e0f2fe"
          fillOpacity="0.35"
          stroke="#bae6fd"
          strokeWidth="1.2"
        />
        {/* Internal Mini Heat-Sink Baffle Plate */}
        <line
          x1={rTopFL.x + 18}
          y1={rTopFL.y - 12}
          x2={rTopBL.x + 18}
          y2={rTopBL.y - 12}
          stroke="#0284c7"
          strokeWidth="2"
          opacity="0.7"
        />
        <line
          x1={rTopFL.x + 24}
          y1={rTopFL.y - 20}
          x2={rTopBL.x + 24}
          y2={rTopBL.y - 20}
          stroke="#0284c7"
          strokeWidth="2"
          opacity="0.7"
        />
      </g>
    </g>
  );
};

export const RadiatorIso = React.memo(RadiatorIsoComponent);
