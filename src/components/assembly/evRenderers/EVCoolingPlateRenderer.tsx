import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface EVCoolingPlateRendererProps {
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

export const EVCoolingPlateRenderer: React.FC<EVCoolingPlateRendererProps> = ({
  layoutSpec,
  componentState,
  onHoverComponent,
}) => {
  if (!componentState.isInstalled) return null;

  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;

  return (
    <g
      id="ev-cooling-plate"
      onMouseEnter={() => onHoverComponent?.("head_gasket")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
      filter="url(#3d-light)"
    >
      {/* Serpentine Glycol Liquid Cooling Cold Plate Layer */}
      <rect
        x={bx + 12}
        y="114"
        width={bw - 24}
        height="18"
        rx="4"
        fill="url(#copper-metallic)"
        stroke={componentState.isHovered ? "#38bdf8" : "#090d16"}
        strokeWidth="2"
      />
      <rect x={bx + 14} y="116" width={bw - 28} height="14" rx="3" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.9" />

      {/* Serpentine Coolant Flow Channels */}
      <path
        d={`M ${bx + 25} 123 C ${bx + 60} 118, ${bx + 90} 128, ${bx + 120} 123 C ${bx + 150} 118, ${bx + 180} 128, ${bx + bw - 25} 123`}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Dual Quick-Connect Inlet/Outlet Fittings */}
      <circle cx={bx + 25} cy="123" r="4.5" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
      <circle cx={bx + bw - 25} cy="123" r="4.5" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
    </g>
  );
};
