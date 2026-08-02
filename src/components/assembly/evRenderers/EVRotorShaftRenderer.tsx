import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface EVRotorShaftRendererProps {
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

export const EVRotorShaftRenderer: React.FC<EVRotorShaftRendererProps> = ({
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
      id="ev-rotor-shaft"
      onMouseEnter={() => onHoverComponent?.("camshaft")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`,
        opacity: componentState.opacity,
      }}
      filter="url(#3d-light)"
    >
      {/* Permanent Magnet Rotor Shaft Routing Horizontally Across Top */}
      <rect
        x={bx + 35}
        y="42"
        width={bw - 70}
        height="18"
        rx="9"
        fill="url(#crank-steel)"
        stroke={componentState.isHovered ? "#38bdf8" : "#090d16"}
        strokeWidth="2.5"
      />
      <rect x={bx + 37} y="44" width={bw - 74} height="14" rx="7" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />

      {/* Carbon-Sleeve Wrap Magnet Poles */}
      {[0, 1, 2, 3].map((p) => {
        const px = bx + 65 + p * ((bw - 130) / 3);
        return (
          <g key={p}>
            <rect x={px - 14} y="38" width="28" height="26" rx="4" fill="url(#titanium-dark)" stroke="#090d16" strokeWidth="1.5" />
            <rect x={px - 12} y="40" width="24" height="22" rx="3" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.8" />
            {/* Alternating North/South Neodymium Magnetic Poles */}
            <text x={px} y="55" fill={p % 2 === 0 ? "#ef4444" : "#3b82f6"} fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="900">
              {p % 2 === 0 ? "N" : "S"}
            </text>
          </g>
        );
      })}

      {/* High-Speed Ceramic Ball Bearing Flanges */}
      <circle cx={bx + 42} cy="51" r="9" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
      <circle cx={bx + bw - 42} cy="51" r="9" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
    </g>
  );
};
