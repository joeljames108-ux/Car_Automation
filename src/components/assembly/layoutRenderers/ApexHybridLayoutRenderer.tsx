import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface ApexHybridLayoutRendererProps {
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

export const ApexHybridLayoutRenderer: React.FC<ApexHybridLayoutRendererProps> = ({
  layoutSpec,
  blockState,
  onHoverComponent,
}) => {
  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;
  const bh = layoutSpec.bh;

  return (
    <g
      id="block-apexhybrid"
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
      {/* V12 SPEC-01 Alloy Engine Block Base Casing Shell */}
      <rect
        x={bx}
        y="106"
        width={bw}
        height={bh}
        rx="12"
        fill="url(#slate-block-artwork)"
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="3.8"
      />
      <rect x={bx + 4} y="110" width={bw - 8} height={bh - 8} rx="9" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.9" />

      {/* High-Voltage 800V EV Bus-Bar Conduit Channels (Glowing Orange Cables) */}
      <g>
        {/* Left 800V Bus-Bar Cable Conduit */}
        <path
          d={`M ${bx - 14} 140 L ${bx + 12} 140 L ${bx + 12} 310 L ${bx - 14} 310`}
          fill="none"
          stroke="#f97316"
          strokeWidth="6"
          strokeLinecap="round"
          className="animate-pulse"
        />
        <path
          d={`M ${bx - 14} 140 L ${bx + 12} 140 L ${bx + 12} 310 L ${bx - 14} 310`}
          fill="none"
          stroke="#ffedd5"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Right 800V Bus-Bar Cable Conduit */}
        <path
          d={`M ${bx + bw + 14} 140 L ${bx + bw - 12} 140 L ${bx + bw - 12} 310 L ${bx + bw + 14} 310`}
          fill="none"
          stroke="#f97316"
          strokeWidth="6"
          strokeLinecap="round"
          className="animate-pulse"
        />
        <path
          d={`M ${bx + bw + 14} 140 L ${bx + bw - 12} 140 L ${bx + bw - 12} 310 L ${bx + bw + 14} 310`}
          fill="none"
          stroke="#ffedd5"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Dual Front Axial-Flux Electric Motor Pod Housings with Copper Stator Winding Coils */}
      <g stroke="#090d16" strokeWidth="2">
        {/* Left Axial-Flux Electric Motor Pod */}
        <circle cx={bx + 35} cy="118" r="22" fill="url(#main-bearing-cap-cast-iron)" />
        {/* Copper Stator Coils */}
        {[...Array(8)].map((_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          const mx = bx + 35 + 15 * Math.cos(a);
          const my = 118 + 15 * Math.sin(a);
          return <circle key={`l-coil-${i}`} cx={mx} cy={my} r="3" fill="#d97706" stroke="#78350f" strokeWidth="0.8" />;
        })}
        <circle cx={bx + 35} cy="118" r="10" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx={bx + 35} cy="118" r="4" fill="#38bdf8" />

        {/* Right Axial-Flux Electric Motor Pod */}
        <circle cx={bx + bw - 35} cy="118" r="22" fill="url(#main-bearing-cap-cast-iron)" />
        {/* Copper Stator Coils */}
        {[...Array(8)].map((_, i) => {
          const a = (i * 45 * Math.PI) / 180;
          const mx = bx + bw - 35 + 15 * Math.cos(a);
          const my = 118 + 15 * Math.sin(a);
          return <circle key={`r-coil-${i}`} cx={mx} cy={my} r="3" fill="#d97706" stroke="#78350f" strokeWidth="0.8" />;
        })}
        <circle cx={bx + bw - 35} cy="118" r="10" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx={bx + bw - 35} cy="118" r="4" fill="#38bdf8" />
      </g>

      {/* Central Inverter Power Electronics Module with High-Voltage Leads */}
      <g>
        <rect x={bx + bw / 2 - 32} y="92" width="64" height="24" rx="4" fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="2" />
        <rect x={bx + bw / 2 - 28} y="96" width="56" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
        <text
          x={bx + bw / 2}
          y="108"
          fill="#38bdf8"
          fontSize="7"
          fontFamily="monospace"
          textAnchor="middle"
          fontWeight="900"
          letterSpacing="1"
        >
          800V INVERTER
        </text>
      </g>

      {/* 3D Stand-Up Cylinder Sleeves */}
      {layoutSpec.cyls.map((cxPos, idx) => {
        const cylW = layoutSpec.width;
        const cylX = cxPos - cylW / 2;
        return (
          <g key={`hybrid-cyl-${idx}`}>
            <rect
              x={cylX}
              y="124"
              width={cylW}
              height="194"
              rx="8"
              fill="url(#cylinder-tube-3d)"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />
            <rect x={cylX + 2} y="128" width={cylW - 4} height="186" rx="6" fill="url(#bore-depth-gradient)" />
            <rect x={cylX + 3} y="129" width={cylW - 6} height="184" rx="5" fill="url(#honing-crosshatch)" opacity="0.5" />

            <line x1={cylX + 3} y1="126" x2={cylX + 3} y2="316" stroke="#ffffff" strokeWidth="3" opacity="0.98" />
            <line x1={cylX + cylW - 3} y1="126" x2={cylX + cylW - 3} y2="316" stroke="#090d16" strokeWidth="2.5" opacity="0.95" />

            <ellipse cx={cxPos} cy="128" rx={cylW / 2 - 0.5} ry="5.8" fill="url(#machined-deck-bevel)" stroke="#090d16" strokeWidth="1.8" />
          </g>
        );
      })}

      {/* Flange Hex Cap Screws */}
      {layoutSpec.bolts.map((bolt, idx) => (
        <g key={`hybrid-bolt-${idx}`}>
          <circle cx={bolt.x} cy={bolt.y} r="7" fill="#090d16" />
          <circle cx={bolt.x} cy={bolt.y} r="5.5" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="1.2" />
          <circle cx={bolt.x} cy={bolt.y} r="3.8" fill="#090d16" />
          <polygon
            points={`
              ${bolt.x},${bolt.y - 2.8} 
              ${bolt.x + 2.4},${bolt.y - 1.4} 
              ${bolt.x + 2.4},${bolt.y + 1.4} 
              ${bolt.x},${bolt.y + 2.8} 
              ${bolt.x - 2.4},${bolt.y + 1.4} 
              ${bolt.x - 2.4},${bolt.y - 1.4}
            `}
            fill="#ffffff"
            stroke="#090d16"
            strokeWidth="0.8"
          />
        </g>
      ))}

      {/* Debossed Plaque */}
      <g>
        <rect x={bx + bw / 2 - 74} y="324" width="148" height="18" rx="3.5" fill="url(#plaque-metal)" stroke="#090d16" strokeWidth="2" />
        <text
          x={bx + bw / 2}
          y="336.5"
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
