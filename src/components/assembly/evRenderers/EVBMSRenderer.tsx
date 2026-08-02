import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface EVBMSRendererProps {
  layoutSpec: {
    bx: number;
    bw: number;
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

export const EVBMSRenderer: React.FC<EVBMSRendererProps> = ({
  layoutSpec,
  componentState,
  onHoverComponent,
}) => {
  if (!componentState.isInstalled) return null;

  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;
  const cx = bx + bw / 2;

  return (
    <g
      id="ev-bms-unit"
      onMouseEnter={() => onHoverComponent?.("pistons")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
      filter="url(#3d-light)"
    >
      {/* Central BMS Master Controller PCB Enclosure */}
      <rect
        x={cx - 65}
        y="170"
        width="130"
        height="50"
        rx="8"
        fill="url(#titanium-dark)"
        stroke={componentState.isHovered ? "#38bdf8" : "#090d16"}
        strokeWidth="2.5"
      />
      <rect x={cx - 61} y="174" width="122" height="42" rx="6" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" />

      {/* ARM Cortex Microprocessor Chip */}
      <rect x={cx - 20} y="180" width="40" height="30" rx="3" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
      <text x={cx} y="198" fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
        BMS MCU
      </text>

      {/* Active Balancing Capacitors Array */}
      <circle cx={cx - 45} cy="186" r="4.5" fill="#3b82f6" stroke="#090d16" strokeWidth="1" />
      <circle cx={cx - 45} cy="204" r="4.5" fill="#3b82f6" stroke="#090d16" strokeWidth="1" />
      <circle cx={cx + 45} cy="186" r="4.5" fill="#3b82f6" stroke="#090d16" strokeWidth="1" />
      <circle cx={cx + 45} cy="204" r="4.5" fill="#3b82f6" stroke="#090d16" strokeWidth="1" />

      {/* High-Voltage Emergency Pyrofuse Disconnect Relay */}
      <rect x={cx - 55} y="180" width="6" height="26" fill="#ef4444" stroke="#090d16" strokeWidth="1" />

      {/* Wiring Harness Loom Connectors */}
      <path d={`M ${cx - 65} 195 L ${cx - 95} 195`} stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 1.5" />
      <path d={`M ${cx + 65} 195 L ${cx + 95} 195`} stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 1.5" />
    </g>
  );
};
