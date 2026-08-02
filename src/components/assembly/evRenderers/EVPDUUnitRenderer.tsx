import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface EVPDUUnitRendererProps {
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

export const EVPDUUnitRenderer: React.FC<EVPDUUnitRendererProps> = ({
  layoutSpec,
  componentState,
  onHoverComponent,
}) => {
  if (!componentState.isInstalled) return null;

  const px = layoutSpec.bx + layoutSpec.bw + 10;

  return (
    <g
      id="ev-pdu-unit"
      onMouseEnter={() => onHoverComponent?.("exhaust_headers")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
      filter="url(#3d-light)"
    >
      {/* High-Voltage Power Distribution Unit Box Mounted on Right Side */}
      <rect
        x={px}
        y="95"
        width="75"
        height="145"
        rx="8"
        fill="url(#titanium-dark)"
        stroke={componentState.isHovered ? "#38bdf8" : "#090d16"}
        strokeWidth="3"
      />
      <rect x={px + 4} y="99" width="67" height="137" rx="6" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.85" />

      {/* High-Voltage Solid-State Contactors */}
      <circle cx={px + 22} cy="120" r="7" fill="#020617" stroke="#ef4444" strokeWidth="1.5" />
      <circle cx={px + 53} cy="120" r="7" fill="#020617" stroke="#ef4444" strokeWidth="1.5" />
      <circle cx={px + 22} cy="155" r="7" fill="#020617" stroke="#3b82f6" strokeWidth="1.5" />
      <circle cx={px + 53} cy="155" r="7" fill="#020617" stroke="#3b82f6" strokeWidth="1.5" />

      {/* 12V DC-DC Converter Step-Down Sub-Module */}
      <rect x={px + 12} y="180" width="51" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
      <text x={px + 37.5} y="207" fill="#38bdf8" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
        12V DC-DC
      </text>

      {/* Glowing Orange Shielded High-Voltage Conduit Outlets */}
      <path d={`M ${px} 120 L ${px - 10} 120`} stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
      <path d={`M ${px} 155 L ${px - 10} 155`} stroke="#f97316" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
};
