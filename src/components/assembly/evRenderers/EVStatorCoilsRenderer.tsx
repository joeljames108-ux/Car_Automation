import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface EVStatorCoilsRendererProps {
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

export const EVStatorCoilsRenderer: React.FC<EVStatorCoilsRendererProps> = ({
  layoutSpec,
  componentState,
  onHoverComponent,
}) => {
  if (!componentState.isInstalled) return null;

  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;

  // Dual Axial-Flux Stator Rings on Left & Right
  const stators = [
    { x: bx + 55, y: 70 },
    { x: bx + bw - 55, y: 70 },
  ];

  return (
    <g
      id="ev-stator-coils"
      onMouseEnter={() => onHoverComponent?.("valves")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
      filter="url(#3d-light)"
    >
      {stators.map((stator, index) => (
        <g key={index}>
          {/* Stator Outer Ring Housing */}
          <circle
            cx={stator.x}
            cy={stator.y}
            r="38"
            fill="url(#billet-chrome)"
            stroke={componentState.isHovered ? "#38bdf8" : "#090d16"}
            strokeWidth="2.5"
          />
          <circle cx={stator.x} cy={stator.y} r="26" fill="#090d16" stroke="#38bdf8" strokeWidth="1.5" />

          {/* 360° Circular Array of 12 High-Fill Copper Stator Winding Coils */}
          {Array.from({ length: 12 }).map((_, coilIdx) => {
            const angle = (coilIdx * 30 * Math.PI) / 180;
            const cx = stator.x + 32 * Math.cos(angle);
            const cy = stator.y + 32 * Math.sin(angle);

            return (
              <circle
                key={coilIdx}
                cx={cx}
                cy={cy}
                r="4.5"
                fill="url(#copper-metallic)"
                stroke="#090d16"
                strokeWidth="1.2"
              />
            );
          })}

          {/* Laminated Silicon Steel Core Teeth */}
          <circle cx={stator.x} cy={stator.y} r="18" fill="none" stroke="#64748b" strokeWidth="3" strokeDasharray="4 2" />
        </g>
      ))}
    </g>
  );
};
