import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso } from "./isoMath";

interface TransmissionIsoProps {
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
 * Photorealistic 3D Isometric Racing Transmission & Bellhousing Assembly (Optimized)
 * Memoized trigonometry and unified SVG paths for 60fps rendering.
 */
const TransmissionIsoComponent: React.FC<TransmissionIsoProps> = ({
  componentState,
  onHoverComponent,
}) => {
  const originScreen = useMemo(() => ({ x: 250, y: 215 }), []);
  const BL = 230;
  const halfL = BL / 2; // 115

  const P = useMemo(() => (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen), [originScreen]);

  // Transmission 3D Datums
  const xStart = halfL - 5;
  const xBellEnd = halfL + 35;
  const xGearboxEnd = halfL + 75;
  const xOutputEnd = halfL + 95;

  const {
    bellTopFL, bellTopFR, bellBotFL, bellBotFR,
    bellRearTopL, bellRearTopR, bellRearBotL, bellRearBotR,
    gbTopL, gbTopR, gbBotL, gbBotR,
    gbRearTopL, gbRearTopR, gbRearBotL, gbRearBotR,
    clutchCenter, gearCenter1, gearCenter2,
    tcuL, tcuR, yokePt,
    springFingersPathD, gbRibsPathD, tcuFinsPathD,
  } = useMemo(() => {
    const btFL = P(xStart, 48, 115);
    const btFR = P(xBellEnd, 38, 95);
    const bbFL = P(xStart, 38, 20);
    const bbFR = P(xBellEnd, 28, 20);

    const brTopL = P(xStart, -48, 115);
    const brTopR = P(xBellEnd, -38, 95);
    const brBotL = P(xStart, -38, 20);
    const brBotR = P(xBellEnd, -28, 20);

    const gtL = P(xBellEnd, 34, 85);
    const gtR = P(xGearboxEnd, 30, 75);
    const gbL = P(xBellEnd, 26, 18);
    const gbR = P(xGearboxEnd, 24, 18);

    const grTopL = P(xBellEnd, -34, 85);
    const grTopR = P(xGearboxEnd, -30, 75);
    const grBotL = P(xBellEnd, -26, 18);
    const grBotR = P(xGearboxEnd, -24, 18);

    const cCenter = P(xStart + 16, 26, 60);
    const gCenter1 = P(xBellEnd + 15, 20, 52);
    const gCenter2 = P(xBellEnd + 30, 18, 50);

    const tL = P(xGearboxEnd - 15, -15, 92);
    const tR = P(xGearboxEnd + 10, -15, 88);
    const yk = P(xOutputEnd, 0, 48);

    // Single consolidated path for 12 diaphragm spring fingers
    let springD = "";
    [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      const sx = cCenter.x + 3 + 7 * Math.cos(rad);
      const sy = cCenter.y + 12 * Math.sin(rad);
      springD += `M ${cCenter.x + 3} ${cCenter.y} L ${sx} ${sy} `;
    });

    // Single consolidated path for 3 gearbox ribs
    let ribD = "";
    [gtL.y + 12, gtL.y + 24, gtL.y + 36].forEach((ribY) => {
      ribD += `M ${gtL.x + 4} ${ribY} L ${gtR.x - 4} ${ribY - 4} `;
    });

    // Single consolidated path for TCU cooling fins
    let tcuFinD = "";
    [-8, -2, 4, 10].forEach((fx) => {
      tcuFinD += `M ${tL.x + fx} ${tL.y + 2} L ${tL.x + fx} ${tL.y + 12} `;
    });

    return {
      bellTopFL: btFL, bellTopFR: btFR, bellBotFL: bbFL, bellBotFR: bbFR,
      bellRearTopL: brTopL, bellRearTopR: brTopR, bellRearBotL: brBotL, bellRearBotR: brBotR,
      gbTopL: gtL, gbTopR: gtR, gbBotL: gbL, gbBotR: gbR,
      gbRearTopL: grTopL, gbRearTopR: grTopR, gbRearBotL: grBotL, gbRearBotR: grBotR,
      clutchCenter: cCenter, gearCenter1: gCenter1, gearCenter2: gCenter2,
      tcuL: tL, tcuR: tR, yokePt: yk,
      springFingersPathD: springD, gbRibsPathD: ribD, tcuFinsPathD: tcuFinD,
    };
  }, [P, xStart, xBellEnd, xGearboxEnd, xOutputEnd]);

  return (
    <g
      id="iso-transmission-assembly-3d"
      onMouseEnter={() => onHoverComponent?.("crankshaft")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState?.opacity ?? 1,
      }}
    >
      {/* ── 1. MAIN BELLHOUSING CASTING SHELL ── */}
      <g id="bellhousing-shell">
        <polygon
          points={`${bellRearTopL.x},${bellRearTopL.y} ${bellRearTopR.x},${bellRearTopR.y} ${bellRearBotR.x},${bellRearBotR.y} ${bellRearBotL.x},${bellRearBotL.y}`}
          fill="url(#v12-cast-aluminum-body-right)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        <polygon
          points={`${bellTopFL.x},${bellTopFL.y} ${bellTopFR.x},${bellTopFR.y} ${bellRearTopR.x},${bellRearTopR.y} ${bellRearTopL.x},${bellRearTopL.y}`}
          fill="url(#transmission-case-cast)"
          stroke="#090d16"
          strokeWidth="2"
        />
        <path
          d={`M ${bellTopFL.x} ${bellTopFL.y}
              L ${bellTopFR.x} ${bellTopFR.y}
              L ${bellBotFR.x} ${bellBotFR.y}
              L ${bellBotFL.x} ${bellBotFL.y}
              Z`}
          fill="url(#transmission-case-cast)"
          stroke="#090d16"
          strokeWidth="2.5"
        />
        <line
          x1={bellTopFL.x}
          y1={bellTopFL.y}
          x2={bellTopFR.x}
          y2={bellTopFR.y}
          stroke="#ffffff"
          strokeWidth="2.2"
          opacity="0.9"
        />
      </g>

      {/* ── 2. CUTAWAY INSPECTION WINDOW (Clutch & Helical Gears) ── */}
      <g id="transmission-cutaway-view">
        <path
          d={`M ${P(xStart + 6, 32, 92).x} ${P(xStart + 6, 32, 92).y}
              L ${P(xBellEnd + 38, 22, 78).x} ${P(xBellEnd + 38, 22, 78).y}
              L ${P(xBellEnd + 38, 16, 28).x} ${P(xBellEnd + 38, 16, 28).y}
              L ${P(xStart + 6, 24, 28).x} ${P(xStart + 6, 24, 28).y}
              Z`}
          fill="url(#clutch-housing-cutaway)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        <path
          d={`M ${P(xStart + 6, 32, 92).x} ${P(xStart + 6, 32, 92).y}
              L ${P(xBellEnd + 38, 22, 78).x} ${P(xBellEnd + 38, 22, 78).y}
              L ${P(xBellEnd + 38, 16, 28).x} ${P(xBellEnd + 38, 16, 28).y}`}
          fill="none"
          stroke="#f8fafc"
          strokeWidth="1.6"
          opacity="0.9"
        />

        {/* Flywheel Ring Gear */}
        <g id="flywheel-ring">
          <ellipse
            cx={clutchCenter.x - 8}
            cy={clutchCenter.y}
            rx="14"
            ry="24"
            fill="url(#flywheel-ring-gear)"
            stroke="#090d16"
            strokeWidth="1.8"
          />
          <ellipse
            cx={clutchCenter.x - 8}
            cy={clutchCenter.y}
            rx="15"
            ry="25"
            fill="none"
            stroke="#090d16"
            strokeWidth="2.5"
            strokeDasharray="2 2"
          />
        </g>

        {/* Multi-Plate Carbon Clutch Pack & Pressure Plate */}
        <g id="clutch-pack">
          <ellipse
            cx={clutchCenter.x - 2}
            cy={clutchCenter.y}
            rx="11"
            ry="20"
            fill="url(#clutch-disc-friction)"
            stroke="#451a03"
            strokeWidth="1.2"
          />
          <ellipse
            cx={clutchCenter.x + 3}
            cy={clutchCenter.y}
            rx="11"
            ry="20"
            fill="url(#pressure-plate-steel)"
            stroke="#090d16"
            strokeWidth="1.2"
          />
          {/* Consolidated 12 Diaphragm Spring Fingers */}
          <path
            d={springFingersPathD}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <ellipse
            cx={clutchCenter.x + 7}
            cy={clutchCenter.y}
            rx="5"
            ry="9"
            fill="url(#bearing-saddle-chrome)"
            stroke="#090d16"
            strokeWidth="1.4"
          />
        </g>

        {/* Helical Transmission Gear Cluster */}
        <g id="transmission-gears">
          <line
            x1={clutchCenter.x + 7}
            y1={clutchCenter.y}
            x2={gearCenter2.x + 18}
            y2={gearCenter2.y}
            stroke="url(#bearing-saddle-chrome)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1={clutchCenter.x + 7}
            y1={clutchCenter.y - 1.5}
            x2={gearCenter2.x + 18}
            y2={gearCenter2.y - 1.5}
            stroke="#ffffff"
            strokeWidth="1.5"
            opacity="0.9"
          />

          <ellipse
            cx={gearCenter1.x}
            cy={gearCenter1.y}
            rx="8"
            ry="16"
            fill="url(#pressure-plate-steel)"
            stroke="#090d16"
            strokeWidth="1.5"
          />
          <ellipse
            cx={gearCenter1.x}
            cy={gearCenter1.y}
            rx="8.5"
            ry="17"
            fill="none"
            stroke="#090d16"
            strokeWidth="2"
            strokeDasharray="2 1.5"
          />

          <ellipse
            cx={gearCenter1.x + 10}
            cy={gearCenter1.y}
            rx="7"
            ry="14"
            fill="url(#bearing-saddle-chrome)"
            stroke="#090d16"
            strokeWidth="1.5"
          />
          <ellipse
            cx={gearCenter1.x + 10}
            cy={gearCenter1.y}
            rx="7.5"
            ry="15"
            fill="none"
            stroke="#090d16"
            strokeWidth="2"
            strokeDasharray="2 1.5"
          />

          <ellipse
            cx={gearCenter2.x}
            cy={gearCenter2.y + 4}
            rx="6.5"
            ry="12"
            fill="url(#pressure-plate-steel)"
            stroke="#090d16"
            strokeWidth="1.5"
          />
          <ellipse
            cx={gearCenter2.x + 7}
            cy={gearCenter2.y + 4}
            rx="4"
            ry="8"
            fill="url(#valve-cover-gold-top)"
            stroke="#78350f"
            strokeWidth="1"
          />
        </g>
      </g>

      {/* ── 3. REAR GEARBOX TAIL HOUSING & OUTPUT YOKE ── */}
      <g id="gearbox-tail-housing">
        <polygon
          points={`${gbRearTopL.x},${gbRearTopL.y} ${gbRearTopR.x},${gbRearTopR.y} ${gbRearBotR.x},${gbRearBotR.y} ${gbRearBotL.x},${gbRearBotL.y}`}
          fill="url(#v12-cast-aluminum-body-right)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        <polygon
          points={`${gbTopL.x},${gbTopL.y} ${gbTopR.x},${gbTopR.y} ${gbRearTopR.x},${gbRearTopR.y} ${gbRearTopL.x},${gbRearTopL.y}`}
          fill="url(#transmission-case-cast)"
          stroke="#090d16"
          strokeWidth="1.8"
        />
        <polygon
          points={`${gbTopL.x},${gbTopL.y} ${gbTopR.x},${gbTopR.y} ${gbBotR.x},${gbBotR.y} ${gbBotL.x},${gbBotL.y}`}
          fill="url(#transmission-case-cast)"
          stroke="#090d16"
          strokeWidth="2.2"
        />

        {/* Consolidated Reinforcement Stiffness Ribs */}
        <path
          d={gbRibsPathD}
          fill="none"
          stroke="#f8fafc"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Driveshaft Output Flange Yoke */}
        <g id="output-shaft-yoke">
          <ellipse
            cx={yokePt.x}
            cy={yokePt.y}
            rx="8"
            ry="15"
            fill="url(#bearing-saddle-chrome)"
            stroke="#090d16"
            strokeWidth="2"
          />
          <circle cx={yokePt.x} cy={yokePt.y} r="4" fill="#020617" stroke="#475569" strokeWidth="1" />
        </g>
      </g>

      {/* ── 4. TRANSMISSION CONTROL UNIT (TCU) & HEAT SINK ── */}
      <g id="transmission-tcu-module">
        <polygon
          points={`${tcuL.x - 14},${tcuL.y} ${tcuR.x + 14},${tcuR.y} ${tcuR.x + 14},${tcuR.y + 14} ${tcuL.x - 14},${tcuL.y + 14}`}
          fill="url(#cel-steel-block)"
          stroke="#090d16"
          strokeWidth="1.8"
        />
        {/* Consolidated Heat Sink Fins */}
        <path
          d={tcuFinsPathD}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          opacity="0.85"
        />
        <rect
          x={tcuL.x - 18}
          y={tcuL.y + 3}
          width="5"
          height="8"
          rx="1"
          fill="#ea580c"
          stroke="#090d16"
          strokeWidth="0.8"
        />
      </g>

      {/* ── 5. BRAIDED WIRE LOOM HARNESS ── */}
      <g id="transmission-wiring-loom">
        <path
          d={`M ${bellTopFL.x - 5} ${bellTopFL.y + 10}
              C ${bellTopFL.x + 10} ${bellTopFL.y + 25} ${bellBotFR.x - 10} ${bellBotFR.y - 15} ${gbBotR.x} ${gbBotR.y}`}
          fill="none"
          stroke="#0f172a"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d={`M ${bellTopFL.x - 5} ${bellTopFL.y + 10}
              C ${bellTopFL.x + 10} ${bellTopFL.y + 25} ${bellBotFR.x - 10} ${bellBotFR.y - 15} ${gbBotR.x} ${gbBotR.y}`}
          fill="none"
          stroke="#334155"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
};

export const TransmissionIso = React.memo(TransmissionIsoComponent);
