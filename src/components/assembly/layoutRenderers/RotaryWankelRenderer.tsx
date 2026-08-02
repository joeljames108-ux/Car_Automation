import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface RotaryWankelRendererProps {
  layoutSpec: {
    label: string;
    cyls: number[];
    width: number;
    bankAngle: string;
    bx: number;
    bw: number;
    bh: number;
    category: string;
    bolts: { x: number; y: number }[];
  };
  blockState: {
    isInstalled: boolean;
    isActive: boolean;
    isHovered: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  onHoverComponent?: (id: ComponentId | null) => void;
}

export const RotaryWankelRenderer: React.FC<RotaryWankelRendererProps> = ({
  layoutSpec,
  blockState,
  onHoverComponent,
}) => {
  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;

  return (
    <g
      id="block-rotary"
      onMouseEnter={() => onHoverComponent?.("block")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className={`cursor-pointer transition-all duration-700 ease-out ${
        blockState.isActive ? "filter-glow-active" : ""
      }`}
      style={{
        transform: `translate(${blockState.offsetX}px, ${blockState.offsetY}px)`,
        opacity: blockState.opacity,
      }}
      filter={blockState.isInstalled ? "url(#3d-light)" : undefined}
    >
      {/* Epitrochoid Rotor Housing Outer Casing Shell (Dual Oval Peanut Chambers) */}
      <g>
        {/* Left Rotor Chamber Shell */}
        <path
          d={`M ${bx} 225 C ${bx} 130 ${bx + 70} 120 ${bx + 110} 175 C ${bx + 150} 120 ${bx + 220} 130 ${bx + 220} 225 C ${bx + 220} 320 ${bx + 150} 330 ${bx + 110} 275 C ${bx + 70} 330 ${bx} 320 Z`}
          fill="url(#slate-block-artwork)"
          stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
          strokeWidth="4"
        />
        <path
          d={`M ${bx + 4} 225 C ${bx + 4} 134 ${bx + 72} 124 ${bx + 110} 178 C ${bx + 148} 124 ${bx + 216} 134 ${bx + 216} 225 C ${bx + 216} 316 ${bx + 148} 326 ${bx + 110} 272 C ${bx + 72} 326 ${bx + 4} 316 Z`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          opacity="0.9"
        />

        {/* Central Eccentric Shaft Housing Ring */}
        <circle cx={bx + 110} cy="225" r="32" fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="2.5" />
        <circle cx={bx + 110} cy="225" r="26" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Eccentric Shaft Journal & Keyway */}
        <circle cx={bx + 110} cy="225" r="14" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="1.2" />
        <rect x={bx + 107} y="213" width="6" height="8" rx="1" fill="#090d16" />

        {/* Orbiting Triangular Rotor 1 (Rotor Chamber A) */}
        <g transform={`rotate(15, ${bx + 75}, 225)`}>
          <polygon
            points={`${bx + 75},155 ${bx + 118},255 ${bx + 32},255`}
            fill="url(#main-bearing-cap-cast-iron)"
            stroke="#facc15"
            strokeWidth="2.2"
          />
          {/* Apex Seals at 3 Corners */}
          <circle cx={bx + 75} cy="155" r="3" fill="#f43f5e" />
          <circle cx={bx + 118} cy="255" r="3" fill="#f43f5e" />
          <circle cx={bx + 32} cy="255" r="3" fill="#f43f5e" />
          <circle cx={bx + 75} cy="221" r="16" fill="none" stroke="#090d16" strokeWidth="2" />
        </g>

        {/* Orbiting Triangular Rotor 2 (Rotor Chamber B) */}
        <g transform={`rotate(-45, ${bx + 145}, 225)`}>
          <polygon
            points={`${bx + 145},155 ${bx + 188},255 ${bx + 102},255`}
            fill="url(#main-bearing-cap-cast-iron)"
            stroke="#facc15"
            strokeWidth="2.2"
          />
          {/* Apex Seals at 3 Corners */}
          <circle cx={bx + 145} cy="155" r="3" fill="#f43f5e" />
          <circle cx={bx + 188} cy="255" r="3" fill="#f43f5e" />
          <circle cx={bx + 102} cy="255" r="3" fill="#f43f5e" />
          <circle cx={bx + 145} cy="221" r="16" fill="none" stroke="#090d16" strokeWidth="2" />
        </g>

        {/* Side Oil Metering Pump (OMP) Lines & Spark Plug Ports */}
        <g stroke="#090d16" strokeWidth="1.8">
          <circle cx={bx + 15} cy="180" r="4" fill="#38bdf8" />
          <circle cx={bx + 15} cy="270" r="4" fill="#38bdf8" />
          <line x1={bx + 15} y1="180" x2={bx + 35} y2="195" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1={bx + 15} y1="270" x2={bx + 35} y2="255" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 2" />
        </g>
      </g>

      {/* Debossed Plaque */}
      <g>
        <rect x={bx + 36} y="332" width="148" height="18" rx="3.5" fill="url(#plaque-metal)" stroke="#090d16" strokeWidth="2" />
        <text
          x={bx + 110}
          y="344.5"
          fill="#090d16"
          fontSize="8"
          fontFamily="monospace"
          textAnchor="middle"
          fontWeight="900"
          letterSpacing="1.2"
        >
          {layoutSpec.label}
        </text>
      </g>
    </g>
  );
};
