import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface EVInverterRendererProps {
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

export const EVInverterRenderer: React.FC<EVInverterRendererProps> = ({
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
      id="ev-inverter-module"
      onMouseEnter={() => onHoverComponent?.("cylinder_head")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
      filter="url(#3d-light)"
    >
      {/* 800V Silicon-Carbide (SiC) Inverter Outer CNC Enclosure */}
      <rect
        x={cx - 110}
        y="62"
        width="220"
        height="50"
        rx="10"
        fill="url(#titanium-dark)"
        stroke={componentState.isHovered ? "#38bdf8" : "#090d16"}
        strokeWidth="3"
      />
      <rect x={cx - 106} y="66" width="212" height="42" rx="8" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />

      {/* Extruded Heat Sink Cooling Fins */}
      {Array.from({ length: 16 }).map((_, i) => (
        <line
          key={i}
          x1={cx - 95 + i * 12.5}
          y1="70"
          x2={cx - 95 + i * 12.5}
          y2="100"
          stroke="#334155"
          strokeWidth="2"
        />
      ))}

      {/* 3-Phase AC Output Terminals (U, V, W) */}
      <g stroke="#090d16" strokeWidth="1.5">
        <circle cx={cx - 60} cy="104" r="5" fill="#f97316" />
        <circle cx={cx} cy="104" r="5" fill="#f97316" />
        <circle cx={cx + 60} cy="104" r="5" fill="#f97316" />

        <text x={cx - 60} y="98" fill="#ffffff" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">U</text>
        <text x={cx} y="98" fill="#ffffff" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">V</text>
        <text x={cx + 60} y="98" fill="#ffffff" fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">W</text>
      </g>

      {/* Laser Engraved Spec Text */}
      <text x={cx} y="82" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="900" letterSpacing="1.2">
        800V SiC INVERTER POWER MODULE
      </text>
    </g>
  );
};
