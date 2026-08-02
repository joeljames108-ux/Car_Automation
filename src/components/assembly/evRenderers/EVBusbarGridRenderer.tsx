import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface EVBusbarGridRendererProps {
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

export const EVBusbarGridRenderer: React.FC<EVBusbarGridRendererProps> = ({
  layoutSpec,
  componentState,
  onHoverComponent,
}) => {
  if (!componentState.isInstalled) return null;

  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;

  return (
    <g
      id="ev-busbar-grid"
      onMouseEnter={() => onHoverComponent?.("rods")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
      filter="url(#3d-light)"
    >
      {/* Heavy-Gauge Copper Busbar Rails Routing Between Cell Modules */}
      <g stroke="#090d16" strokeWidth="2.5">
        {/* Main positive busbar rail */}
        <path d={`M ${bx + 30} 132 L ${bx + bw - 30} 132 L ${bx + bw - 30} 138 L ${bx + 30} 138 Z`} fill="url(#copper-metallic)" />
        {/* Main negative busbar rail */}
        <path d={`M ${bx + 30} 227 L ${bx + bw - 30} 227 L ${bx + bw - 30} 233 L ${bx + 30} 233 Z`} fill="url(#copper-metallic)" />

        {/* Vertical Cross Interconnects */}
        {[0, 1, 2, 3].map((idx) => {
          const cx = bx + 45 + idx * ((bw - 90) / 3);
          return (
            <g key={idx}>
              <path d={`M ${cx - 4} 132 L ${cx + 4} 132 L ${cx + 4} 233 L ${cx - 4} 233 Z`} fill="url(#copper-metallic)" />
              {/* High-Current Hex Fastener Studs */}
              <circle cx={cx} cy="135" r="4" fill="#0f172a" stroke="#d97706" strokeWidth="1.2" />
              <circle cx={cx} cy="230" r="4" fill="#0f172a" stroke="#d97706" strokeWidth="1.2" />
            </g>
          );
        })}
      </g>

      {/* High-Voltage Orange Protective Insulating Sleeves */}
      <rect x={bx + 20} y="130" width="20" height="10" rx="2" fill="#f97316" stroke="#090d16" strokeWidth="1" />
      <rect x={bx + bw - 40} y="130" width="20" height="10" rx="2" fill="#f97316" stroke="#090d16" strokeWidth="1" />
      <rect x={bx + 20} y="225" width="20" height="10" rx="2" fill="#f97316" stroke="#090d16" strokeWidth="1" />
      <rect x={bx + bw - 40} y="225" width="20" height="10" rx="2" fill="#f97316" stroke="#090d16" strokeWidth="1" />
    </g>
  );
};
