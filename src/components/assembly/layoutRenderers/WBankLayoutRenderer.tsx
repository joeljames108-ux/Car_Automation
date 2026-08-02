import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface WBankLayoutRendererProps {
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

export const WBankLayoutRenderer: React.FC<WBankLayoutRendererProps> = ({
  layoutSpec,
  blockState,
  onHoverComponent,
}) => {
  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;
  const bh = layoutSpec.bh;

  return (
    <g
      id="block-wbank"
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
      {/* Oil Dipstick Tube & Yellow Pull Handle */}
      <g>
        <path
          d={`M ${bx + 6} 240 C ${bx - 12} 240 ${bx - 26} 216 ${bx - 30} 185`}
          fill="none"
          stroke="url(#pipe-cylinder-3d)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx={bx - 30} cy="180" r="5.5" fill="#facc15" stroke="#713f12" strokeWidth="1.5" />
        <circle cx={bx - 30} cy="180" r="2" fill="#713f12" />
      </g>

      {/* Heavy-Duty Side Mounting Lugs */}
      <g fill="url(#mounting-lug-3d)" stroke="#090d16" strokeWidth="2.5">
        <path d={`M ${bx + 2} 150 L ${bx - 22} 154 L ${bx - 22} 196 L ${bx + 2} 200 Z`} rx="3" />
        <line x1={bx - 21} y1="156" x2={bx + 1} y2="152" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
        <circle cx={bx - 10} cy="175" r="6.5" fill="#090d16" />
        <circle cx={bx - 10} cy="175" r="4.8" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.8" />

        <path d={`M ${bx + 2} 240 L ${bx - 22} 244 L ${bx - 22} 286 L ${bx + 2} 290 Z`} rx="3" />
        <line x1={bx - 21} y1="246" x2={bx + 1} y2="242" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
        <circle cx={bx - 10} cy="265" r="6.5" fill="#090d16" />
        <circle cx={bx - 10} cy="265" r="4.8" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.8" />

        <path d={`M ${bx + bw - 2} 150 L ${bx + bw + 22} 154 L ${bx + bw + 22} 196 L ${bx + bw - 2} 200 Z`} rx="3" />
        <line x1={bx + bw - 1} y1="152" x2={bx + bw + 21} y2="156" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
        <circle cx={bx + bw + 10} cy="175" r="6.5" fill="#090d16" />
        <circle cx={bx + bw + 10} cy="175" r="4.8" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.8" />

        <path d={`M ${bx + bw - 2} 240 L ${bx + bw + 22} 244 L ${bx + bw + 22} 286 L ${bx + bw - 2} 290 Z`} rx="3" />
        <line x1={bx + bw - 1} y1="242" x2={bx + bw + 21} y2="246" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
        <circle cx={bx + bw + 10} cy="265" r="6.5" fill="#090d16" />
        <circle cx={bx + bw + 10} cy="265" r="4.8" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.8" />
      </g>

      {/* Iconic W-Engine Double-V Crown Outer Block Casing Silhouette */}
      <g>
        <path
          d={`M ${bx} 122 L ${bx + 24} 96 L ${bx + bw / 2 - 14} 118 L ${bx + bw / 2} 112 L ${bx + bw / 2 + 14} 118 L ${bx + bw - 24} 96 L ${bx + bw} 122 L ${bx + bw} ${106 + bh} L ${bx} ${106 + bh} Z`}
          fill="url(#slate-block-artwork)"
          stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
          strokeWidth="3.8"
        />
        {/* W-Crown Specular Contour Line */}
        <path
          d={`M ${bx + 4} 124 L ${bx + 24} 100 L ${bx + bw / 2 - 12} 120 L ${bx + bw / 2} 114 L ${bx + bw / 2 + 12} 120 L ${bx + bw - 24} 100 L ${bx + bw - 4} 124 L ${bx + bw - 4} ${102 + bh} L ${bx + 4} ${102 + bh} Z`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.2"
          opacity="0.9"
        />

        {/* 4 Corner Quad-Turbocharger Heavy Mounting Flanges (Bugatti W16 / W18 Spec) */}
        <g fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="2">
          {/* Upper Left Quad Turbo Flange */}
          <rect x={bx - 18} y="106" width="22" height="34" rx="4" />
          <circle cx={bx - 7} cy="123" r="5.5" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx={bx - 7} cy="123" r="2" fill="#38bdf8" />

          {/* Lower Left Quad Turbo Flange */}
          <rect x={bx - 18} y="225" width="22" height="34" rx="4" />
          <circle cx={bx - 7} cy="242" r="5.5" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx={bx - 7} cy="242" r="2" fill="#38bdf8" />

          {/* Upper Right Quad Turbo Flange */}
          <rect x={bx + bw - 4} y="106" width="22" height="34" rx="4" />
          <circle cx={bx + bw + 7} cy="123" r="5.5" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx={bx + bw + 7} cy="123" r="2" fill="#38bdf8" />

          {/* Lower Right Quad Turbo Flange */}
          <rect x={bx + bw - 4} y="225" width="22" height="34" rx="4" />
          <circle cx={bx + bw + 7} cy="242" r="5.5" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx={bx + bw + 7} cy="242" r="2" fill="#38bdf8" />
        </g>

        {/* Central W-Valley Diagonal Honeycomb Cross-Bracing Grid */}
        <g opacity="0.7">
          <polygon
            points={`${bx + 35},120 ${bx + bw / 2},164 ${bx + bw - 35},120 ${bx + bw / 2},140`}
            fill="url(#main-bearing-cap-cast-iron)"
            stroke="#090d16"
            strokeWidth="2"
          />
          <line x1={bx + 40} y1="122" x2={bx + bw / 2} y2="160" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="5 2" />
          <line x1={bx + bw - 40} y1="122" x2={bx + bw / 2} y2="160" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="5 2" />
          <circle cx={bx + bw / 2} cy="160" r="4.5" fill="#020617" stroke="#38bdf8" strokeWidth="1.2" />
        </g>
      </g>

      {/* Recessed Horizontal Water/Oil Cooling Channels */}
      <g>
        <rect x={bx + 6} y="178" width="34" height="86" fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="2" />
        <line x1={bx + 7} y1="180" x2={bx + 39} y2="180" stroke="#ffffff" strokeWidth="2.2" opacity="0.95" />
        <line x1={bx + 7} y1="262" x2={bx + 39} y2="262" stroke="#090d16" strokeWidth="2.2" opacity="0.9" />

        <rect x={bx + bw - 40} y="178" width="34" height="86" fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="2" />
        <line x1={bx + bw - 39} y1="180" x2={bx + bw - 7} y2="180" stroke="#ffffff" strokeWidth="2.2" opacity="0.95" />
        <line x1={bx + bw - 39} y1="262" x2={bx + bw - 7} y2="262" stroke="#090d16" strokeWidth="2.2" opacity="0.9" />
      </g>

      {/* 3D Staggered 4-Row VR Cylinder Sleeves */}
      {layoutSpec.cyls.map((cxPos, idx) => {
        const cylW = layoutSpec.width;
        const cylX = cxPos - cylW / 2;
        const cylY = idx % 2 === 0 ? 116 : 132;
        const cylH = 184;
        const deckY = cylY + 4;
        return (
          <g key={`wbank-cyl-${idx}`}>
            <rect
              x={cylX}
              y={cylY}
              width={cylW}
              height={cylH}
              rx="8"
              fill="url(#cylinder-tube-3d)"
              stroke="#38bdf8"
              strokeWidth="2.4"
            />
            <rect x={cylX + 2} y={cylY + 4} width={cylW - 4} height={cylH - 8} rx="6" fill="url(#bore-depth-gradient)" />
            <rect x={cylX + 3} y={cylY + 5} width={cylW - 6} height={cylH - 10} rx="5" fill="url(#honing-crosshatch)" opacity="0.5" />

            <line x1={cylX + 3} y1={cylY + 2} x2={cylX + 3} y2={cylY + cylH - 2} stroke="#ffffff" strokeWidth="3" opacity="0.98" />
            <line x1={cylX + 6} y1={cylY + 2} x2={cylX + 6} y2={cylY + cylH - 2} stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
            <line x1={cylX + cylW - 3} y1={cylY + 2} x2={cylX + cylW - 3} y2={cylY + cylH - 2} stroke="#090d16" strokeWidth="2.5" opacity="0.95" />

            <ellipse cx={cxPos} cy={deckY} rx={cylW / 2 - 0.5} ry="5.8" fill="url(#machined-deck-bevel)" stroke="#090d16" strokeWidth="1.8" />
            <ellipse cx={cxPos} cy={deckY} rx={cylW / 2 - 2} ry="3.5" fill="none" stroke="#facc15" strokeWidth="1" opacity="0.8" />
          </g>
        );
      })}

      {/* Flange Hex Cap Screws */}
      {layoutSpec.bolts.map((bolt, idx) => (
        <g key={`wbank-bolt-${idx}`}>
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
          <circle cx={bolt.x} cy={bolt.y} r="1" fill="#090d16" />
        </g>
      ))}

      {/* Debossed Laser-Etched Serial Plaque Overlay */}
      <g>
        <rect x={bx + bw / 2 - 74} y="324" width="148" height="18" rx="3.5" fill="url(#plaque-metal)" stroke="#090d16" strokeWidth="2" />
        <line x1={bx + bw / 2 - 72} y1="325.5" x2={bx + bw / 2 + 72} y2="325.5" stroke="#ffffff" strokeWidth="1.5" opacity="0.95" />

        <circle cx={bx + bw / 2 - 69} cy="328.5" r="1.2" fill="#090d16" />
        <circle cx={bx + bw / 2 + 69} cy="328.5" r="1.2" fill="#090d16" />
        <circle cx={bx + bw / 2 - 69} cy="337.5" r="1.2" fill="#090d16" />
        <circle cx={bx + bw / 2 + 69} cy="337.5" r="1.2" fill="#090d16" />

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
