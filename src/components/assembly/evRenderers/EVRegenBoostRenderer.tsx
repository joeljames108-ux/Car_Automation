import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface EVRegenBoostRendererProps {
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

export const EVRegenBoostRenderer: React.FC<EVRegenBoostRendererProps> = ({
  layoutSpec,
  componentState,
  onHoverComponent,
}) => {
  if (!componentState.isInstalled) return null;

  const rx = layoutSpec.bx + layoutSpec.bw + 20;

  return (
    <g
      id="ev-regen-boost"
      onMouseEnter={() => onHoverComponent?.("turbocharger")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
      filter="url(#3d-light)"
    >
      {/* 300kW Kinetic Regenerative Energy Boost Unit Housing */}
      <circle
        cx={rx + 25}
        cy="75"
        r="32"
        fill="url(#billet-chrome)"
        stroke={componentState.isHovered ? "#38bdf8" : "#090d16"}
        strokeWidth="3"
      />
      <circle cx={rx + 25} cy="75" r="28" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />

      {/* Internal Ultra-High-Speed Carbon Flywheel Rotor */}
      <circle cx={rx + 25} cy="75" r="22" fill="#020617" stroke="#ec4899" strokeWidth="2" strokeDasharray="6 3" />
      <circle cx={rx + 25} cy="75" r="10" fill="url(#copper-metallic)" stroke="#090d16" strokeWidth="1.2" />

      {/* Kinetic Energy Harvesting Telemetry Arc */}
      <path
        d={`M ${rx + 5} 75 A 20 20 0 0 1 ${rx + 45} 75`}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      <text x={rx + 25} y="118" fill="#ec4899" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="900" letterSpacing="1">
        300kW REGEN
      </text>
    </g>
  );
};
