import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface EVCoolingReservoirRendererProps {
  layoutSpec: {
    bx: number;
    bw: number;
    bh: number;
  };
  componentState: {
    isInstalled: boolean;
    isActive: boolean;
    isHovered: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  onHoverComponent?: (id: ComponentId | null) => void;
}

export const EVCoolingReservoirRenderer: React.FC<EVCoolingReservoirRendererProps> = ({
  layoutSpec,
  componentState,
  onHoverComponent,
}) => {
  if (!componentState.isInstalled) return null;

  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;
  const bh = layoutSpec.bh;
  const ry = 106 + bh + 4;

  return (
    <g
      id="ev-cooling-reservoir"
      onMouseEnter={() => onHoverComponent?.("oil_pan")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
      filter="url(#3d-light)"
    >
      {/* Dual-Circuit Electric Glycol Coolant Pump & Sump Base Tank */}
      <path
        d={`M ${bx + 30} ${ry} L ${bx + bw - 30} ${ry} L ${bx + bw - 45} ${ry + 45} L ${bx + 45} ${ry + 45} Z`}
        fill="url(#titanium-dark)"
        stroke={componentState.isHovered ? "#38bdf8" : "#090d16"}
        strokeWidth="3"
      />
      <path
        d={`M ${bx + 34} ${ry + 4} L ${bx + bw - 34} ${ry + 4} L ${bx + bw - 47} ${ry + 41} L ${bx + 47} ${ry + 41} Z`}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        opacity="0.85"
      />

      {/* Translucent Glycol Coolant Level Gauge Window */}
      <rect x={bx + bw / 2 - 35} y={ry + 10} width="70" height="25" rx="4" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
      <rect x={bx + bw / 2 - 32} y={ry + 18} width="64" height="15" rx="2" fill="#38bdf8" opacity="0.75" />

      {/* Dual Electric Coolant Pumps */}
      <circle cx={bx + 60} cy={ry + 22} r="8" fill="url(#billet-chrome)" stroke="#090d16" strokeWidth="1.5" />
      <circle cx={bx + bw - 60} cy={ry + 22} r="8" fill="url(#billet-chrome)" stroke="#090d16" strokeWidth="1.5" />
    </g>
  );
};
