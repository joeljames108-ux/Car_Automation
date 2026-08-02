import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface VBankLayoutRendererProps {
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

export const VBankLayoutRenderer: React.FC<VBankLayoutRendererProps> = ({
  layoutSpec,
  blockState,
  onHoverComponent,
}) => {
  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;
  const bh = layoutSpec.bh;

  return (
    <g
      id="block-vbank"
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
      {/* Heavy-Duty Side Mounting Lugs */}
      <g fill="url(#mounting-lug-3d)" stroke="#090d16" strokeWidth="2.5">
        <path d={`M ${bx + 2} 150 L ${bx - 22} 154 L ${bx - 22} 196 L ${bx + 2} 200 Z`} rx="3" />
        <circle cx={bx - 10} cy="175" r="4.8" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.8" />

        <path d={`M ${bx + 2} 240 L ${bx - 22} 244 L ${bx - 22} 286 L ${bx + 2} 290 Z`} rx="3" />
        <circle cx={bx - 10} cy="265" r="4.8" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.8" />

        <path d={`M ${bx + bw - 2} 150 L ${bx + bw + 22} 154 L ${bx + bw + 22} 196 L ${bx + bw - 2} 200 Z`} rx="3" />
        <circle cx={bx + bw + 10} cy="175" r="4.8" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.8" />

        <path d={`M ${bx + bw - 2} 240 L ${bx + bw + 22} 244 L ${bx + bw + 22} 286 L ${bx + bw - 2} 290 Z`} rx="3" />
        <circle cx={bx + bw + 10} cy="265" r="4.8" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.8" />
      </g>

      {/* Main Symmetrical V-Block Metallic Alloy Outer Casing Shell */}
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

      {/* Central V-Valley Oil Gallery Channel */}
      <g>
        <path
          d={`M ${bx + 30} 118 L ${bx + bw / 2} 142 L ${bx + bw - 30} 118 Z`}
          fill="url(#main-bearing-cap-cast-iron)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        <line x1={bx + 40} y1="122" x2={bx + bw - 40} y2="122" stroke="#ffffff" strokeWidth="1.8" opacity="0.8" />
      </g>

      {/* Mid-Body Horizontal Casting Channels */}
      <g>
        <rect x={bx + 4} y="178" width="34" height="86" fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="2" />
        <rect x={bx + bw - 38} y="178" width="34" height="86" fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="2" />
      </g>

      {/* 3D Stand-Up Cylinder Sleeves & Bores */}
      {layoutSpec.cyls.map((cxPos, idx) => {
        const cylW = layoutSpec.width;
        const cylX = cxPos - cylW / 2;
        return (
          <g key={`vbank-cyl-${idx}`}>
            <rect
              x={cylX}
              y="124"
              width={cylW}
              height="194"
              rx="8"
              fill="url(#cylinder-tube-3d)"
              stroke="#090d16"
              strokeWidth="2.8"
            />
            <rect x={cylX + 2} y="128" width={cylW - 4} height="186" rx="6" fill="url(#bore-depth-gradient)" />
            <rect x={cylX + 3} y="129" width={cylW - 6} height="184" rx="5" fill="url(#honing-crosshatch)" opacity="0.5" />

            <line x1={cylX + 3} y1="126" x2={cylX + 3} y2="316" stroke="#ffffff" strokeWidth="3" opacity="0.98" />
            <line x1={cylX + cylW - 3} y1="126" x2={cylX + cylW - 3} y2="316" stroke="#090d16" strokeWidth="2.5" opacity="0.95" />

            <ellipse cx={cxPos} cy="128" rx={cylW / 2 - 0.5} ry="5.8" fill="url(#machined-deck-bevel)" stroke="#090d16" strokeWidth="1.8" />
          </g>
        );
      })}

      {/* Precision Threaded Deck Flange Hex Bolts */}
      {layoutSpec.bolts.map((bolt, idx) => (
        <g key={`vbank-bolt-${idx}`}>
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

      {/* Debossed Plaque Overlay */}
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
