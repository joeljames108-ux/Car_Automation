import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface EVGearboxRendererProps {
  layoutSpec: {
    bx: number;
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

export const EVGearboxRenderer: React.FC<EVGearboxRendererProps> = ({
  layoutSpec,
  componentState,
  onHoverComponent,
}) => {
  if (!componentState.isInstalled) return null;

  const gx = layoutSpec.bx - 85;

  return (
    <g
      id="ev-reduction-gearbox"
      onMouseEnter={() => onHoverComponent?.("intake_manifold")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
      filter="url(#3d-light)"
    >
      {/* CNC Machined Aluminum Gearbox Casing (Mounted on Left Side) */}
      <path
        d={`M ${gx} 95 L ${gx + 75} 70 L ${gx + 80} 240 L ${gx + 10} 230 Z`}
        fill="url(#billet-chrome)"
        stroke={componentState.isHovered ? "#38bdf8" : "#090d16"}
        strokeWidth="3"
      />
      <path
        d={`M ${gx + 4} 99 L ${gx + 71} 76 L ${gx + 76} 234 L ${gx + 14} 225 Z`}
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        opacity="0.85"
      />

      {/* Internal Helical Input Pinion & Large Helical Reduction Ring Gear */}
      <circle cx={gx + 45} cy="120" r="16" fill="url(#crank-steel)" stroke="#090d16" strokeWidth="1.5" />
      <circle cx={gx + 45} cy="120" r="14" fill="none" stroke="#64748b" strokeWidth="2.5" strokeDasharray="3 1.5" />

      <circle cx={gx + 45} cy="175" r="28" fill="url(#crank-steel)" stroke="#090d16" strokeWidth="2" />
      <circle cx={gx + 45} cy="175" r="25" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="4 2" />

      {/* Differential Drive Axle Output Flange */}
      <circle cx={gx + 45} cy="175" r="10" fill="#020617" stroke="#38bdf8" strokeWidth="2" />
      <circle cx={gx + 45} cy="175" r="4" fill="#38bdf8" />
    </g>
  );
};
