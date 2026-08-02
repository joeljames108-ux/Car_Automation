import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface RadialAircraftRendererProps {
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

export const RadialAircraftRenderer: React.FC<RadialAircraftRendererProps> = ({
  layoutSpec,
  blockState,
  onHoverComponent,
}) => {
  const cx = 250;
  const cy = 225;

  // 9 Cylinders spaced at 40° intervals around 360° master crankcase
  const numCyls = 9;
  const angles = Array.from({ length: numCyls }, (_, i) => (i * 360) / numCyls - 90);

  return (
    <g
      id="block-radial"
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
      {/* 360° Finned Radial Cylinder Barrels (Branching outward at 40° angles) */}
      {angles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const innerR = 60;
        const outerR = 145;
        const x1 = cx + innerR * Math.cos(rad);
        const y1 = cy + innerR * Math.sin(rad);
        const x2 = cx + outerR * Math.cos(rad);
        const y2 = cy + outerR * Math.sin(rad);

        return (
          <g key={`radial-barrel-${i}`}>
            {/* Air-Cooled Finned Cylinder Barrel Branch */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#cylinder-tube-3d)"
              strokeWidth="28"
              strokeLinecap="round"
            />
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#090d16"
              strokeWidth="30"
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* Cooling Fins along Barrel */}
            {[0.3, 0.5, 0.7, 0.9].map((frac, finIdx) => {
              const fx = cx + (innerR + (outerR - innerR) * frac) * Math.cos(rad);
              const fy = cy + (innerR + (outerR - innerR) * frac) * Math.sin(rad);
              const perpRad = rad + Math.PI / 2;
              const finLength = 18;
              return (
                <line
                  key={`fin-${i}-${finIdx}`}
                  x1={fx - finLength * Math.cos(perpRad)}
                  y1={fy - finLength * Math.sin(perpRad)}
                  x2={fx + finLength * Math.cos(perpRad)}
                  y2={fy + finLength * Math.sin(perpRad)}
                  stroke="#ffffff"
                  strokeWidth="2"
                  opacity="0.8"
                />
              );
            })}

            {/* Cylinder Head Cap & Dual Spark Plugs */}
            <circle cx={x2} cy={y2} r="14" fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="2" />
            <circle cx={x2} cy={y2} r="6" fill="#facc15" stroke="#090d16" strokeWidth="1" />
          </g>
        );
      })}

      {/* Central 360° Circular Master Crankcase Housing */}
      <circle cx={cx} cy={cy} r="68" fill="url(#slate-block-artwork)" stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"} strokeWidth="4" />
      <circle cx={cx} cy={cy} r="62" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.9" />

      {/* Master Rod Hub & 8 Articulating Link Rod Hub Pins */}
      <circle cx={cx} cy={cy} r="38" fill="url(#main-bearing-cap-cast-iron)" stroke="#090d16" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="20" fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="10" fill="#020617" stroke="#38bdf8" strokeWidth="1.2" />

      {/* Perimeter Nose Reduction Gear Bolts */}
      {angles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const boltR = 52;
        const bx = cx + boltR * Math.cos(rad);
        const by = cy + boltR * Math.sin(rad);
        return (
          <circle key={`radial-nose-bolt-${i}`} cx={bx} cy={by} r="3" fill="#ffffff" stroke="#090d16" strokeWidth="1" />
        );
      })}

      {/* Debossed Plaque */}
      <g>
        <rect x={cx - 74} y={cy + 92} width="148" height="18" rx="3.5" fill="url(#plaque-metal)" stroke="#090d16" strokeWidth="2" />
        <text
          x={cx}
          y={cy + 104.5}
          fill="#090d16"
          fontSize="8"
          fontFamily="monospace"
          textAnchor="middle"
          fontWeight="900"
          letterSpacing="1.2"
        >
          {layoutSpec.label}
        </text>
      </g>
    </g>
  );
};
