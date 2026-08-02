import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface EVBatteryCasingRendererProps {
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

export const EVBatteryCasingRenderer: React.FC<EVBatteryCasingRendererProps> = ({
  layoutSpec,
  blockState,
  onHoverComponent,
}) => {
  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;
  const bh = layoutSpec.bh;

  return (
    <g
      id="ev-block-casing"
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
      {/* Heavy-Duty Underbody Crash Protection Struts */}
      <g stroke="#090d16" strokeWidth="2.5">
        <path d={`M ${bx - 20} 140 L ${bx + 4} 140 L ${bx + 4} 320 L ${bx - 20} 320 Z`} fill="url(#mounting-lug-3d)" />
        <path d={`M ${bx + bw - 4} 140 L ${bx + bw + 20} 140 L ${bx + bw + 20} 320 L ${bx + bw - 4} 320 Z`} fill="url(#mounting-lug-3d)" />

        {/* Chassis Floor Mounting Bolts */}
        <circle cx={bx - 10} cy="160" r="5" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
        <circle cx={bx - 10} cy="300" r="5" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
        <circle cx={bx + bw + 10} cy="160" r="5" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
        <circle cx={bx + bw + 10} cy="300" r="5" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
      </g>

      {/* Extruded Aluminum Battery Frame Enclosure Shell */}
      <rect
        x={bx}
        y="106"
        width={bw}
        height={bh}
        rx="16"
        fill="url(#slate-block-artwork)"
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="3.8"
      />
      <rect x={bx + 4} y="110" width={bw - 8} height={bh - 8} rx="12" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.9" />

      {/* Internal Module Compartment Dividers */}
      <g stroke="#090d16" strokeWidth="2" opacity="0.6">
        <line x1={bx + bw / 3} y1="112" x2={bx + bw / 3} y2={102 + bh} stroke="#ffffff" strokeWidth="1.5" />
        <line x1={bx + (bw * 2) / 3} y1="112" x2={bx + (bw * 2) / 3} y2={102 + bh} stroke="#ffffff" strokeWidth="1.5" />
        <line x1={bx + 10} y1="225" x2={bx + bw - 10} y2="225" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
      </g>

      {/* High-Voltage Orange Sealing Gasket Perimeter */}
      <rect x={bx + 8} y="114" width={bw - 16} height={bh - 16} rx="10" fill="none" stroke="#f97316" strokeWidth="2" opacity="0.85" />

      {/* Metal Laser Plaque */}
      <g>
        <rect x={bx + bw / 2 - 80} y="324" width="160" height="18" rx="3.5" fill="url(#plaque-metal)" stroke="#090d16" strokeWidth="2" />
        <text
          x={bx + bw / 2}
          y="336.5"
          fill="#090d16"
          fontSize="8"
          fontFamily="monospace"
          textAnchor="middle"
          fontWeight="900"
          letterSpacing="1.2"
        >
          APEX 800V HV BATTERY TRAY
        </text>
      </g>
    </g>
  );
};
