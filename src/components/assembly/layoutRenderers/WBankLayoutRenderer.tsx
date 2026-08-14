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
  selectedVariants?: Record<string, string>;
}

export const WBankLayoutRenderer: React.FC<WBankLayoutRendererProps> = ({
  layoutSpec,
  blockState,
  onHoverComponent,
  selectedVariants,
}) => {
  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;
  const bh = layoutSpec.bh;
  const isW16 = layoutSpec.label.includes("W16");
  const isW18 = layoutSpec.label.includes("W18");

  const blockFill =
    selectedVariants?.block === "titanium"
      ? "url(#mat-titanium-spec)"
      : selectedVariants?.block === "billet"
      ? "url(#mat-billet-cnc)"
      : selectedVariants?.block === "forged"
      ? "url(#mat-forged-alloy)"
      : "url(#mat-cast-steel)";

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
      {/* ── ROBOTIC ASSEMBLY GUIDANCE CROSSHAIRS & ALIGNMENT TARGETS ── */}
      <g stroke="#38bdf8" strokeWidth="1" opacity="0.6" strokeDasharray="3 2">
        <circle cx={bx - 26} cy="175" r="10" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
        <line x1={bx - 32} y1="175" x2={bx - 20} y2="175" />
        <line x1={bx - 26} y1="169" x2={bx - 26} y2="181" />

        <circle cx={bx + bw + 26} cy="175" r="10" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
        <line x1={bx + bw + 20} y1="175" x2={bx + bw + 32} y2="175" />
        <line x1={bx + bw + 26} y1="169" x2={bx + bw + 26} y2="181" />
      </g>

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
        <circle cx={bx - 10} cy="175" r="4.8" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.8" />

        <path d={`M ${bx + 2} 240 L ${bx - 22} 244 L ${bx - 22} 286 L ${bx + 2} 290 Z`} rx="3" />
        <line x1={bx - 21} y1="246" x2={bx + 1} y2="242" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
        <circle cx={bx - 10} cy="265" r="4.8" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.8" />

        <path d={`M ${bx + bw - 2} 150 L ${bx + bw + 22} 154 L ${bx + bw + 22} 196 L ${bx + bw - 2} 200 Z`} rx="3" />
        <line x1={bx + bw - 1} y1="152" x2={bx + bw + 21} y2="156" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
        <circle cx={bx + bw + 10} cy="175" r="4.8" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.8" />

        <path d={`M ${bx + bw - 2} 240 L ${bx + bw + 22} 244 L ${bx + bw + 22} 286 L ${bx + bw - 2} 290 Z`} rx="3" />
        <line x1={bx + bw - 1} y1="242" x2={bx + bw + 21} y2="246" stroke="#ffffff" strokeWidth="2" opacity="0.9" />
        <circle cx={bx + bw + 10} cy="265" r="4.8" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.8" />
      </g>

      {/* Iconic W-Engine Double-V Crown Outer Block Casing Silhouette */}
      <g>
        <path
          d={`M ${bx} 122 L ${bx + 24} 96 L ${bx + bw / 2 - 14} 118 L ${bx + bw / 2} 112 L ${bx + bw / 2 + 14} 118 L ${bx + bw - 24} 96 L ${bx + bw} 122 L ${bx + bw} ${106 + bh} L ${bx} ${106 + bh} Z`}
          fill={blockFill}
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
      </g>

      {/* Central Hot-V Trough & Quad Turbo Oil Scavenge Channels */}
      <g>
        <path
          d={`M ${bx + 32} 124 L ${bx + bw / 2} 148 L ${bx + bw - 32} 124 Z`}
          fill="url(#main-bearing-cap-cast-iron)"
          stroke="#090d16"
          strokeWidth="2"
        />
        {/* Quad Scavenge Line Ports */}
        <circle cx={bx + bw / 2 - 40} cy="136" r="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
        <circle cx={bx + bw / 2 - 15} cy="140" r="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
        <circle cx={bx + bw / 2 + 15} cy="140" r="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
        <circle cx={bx + bw / 2 + 40} cy="136" r="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
      </g>

      {/* Staggered Quad-Bank W-Cylinder Bore Sleeves */}
      {layoutSpec.cyls.map((cxPos, idx) => {
        const cylW = layoutSpec.width;
        const cylX = cxPos - cylW / 2;
        // Alternate staggered offsets for W-engine bore rows
        const isInnerBank = idx % 2 === 1;
        const topY = isInnerBank ? 122 : 128;
        const h = isInnerBank ? 196 : 190;

        return (
          <g key={`wbank-cyl-${idx}`}>
            <rect
              x={cylX}
              y={topY}
              width={cylW}
              height={h}
              rx="8"
              fill="url(#cylinder-tube-3d)"
              stroke="#090d16"
              strokeWidth="2.8"
            />
            <rect x={cylX + 2} y={topY + 4} width={cylW - 4} height={h - 8} rx="6" fill="url(#bore-depth-gradient)" />
            <rect x={cylX + 3} y={topY + 5} width={cylW - 6} height={h - 10} rx="5" fill="url(#honing-crosshatch)" opacity="0.5" />

            <line x1={cylX + 3} y1={topY + 2} x2={cylX + 3} y2={topY + h - 2} stroke="#ffffff" strokeWidth="3" opacity="0.98" />
            <line x1={cylX + cylW - 3} y1={topY + 2} x2={cylX + cylW - 3} y2={topY + h - 2} stroke="#090d16" strokeWidth="2.5" opacity="0.95" />

            <ellipse cx={cxPos} cy={topY + 4} rx={cylW / 2 - 0.5} ry="5.8" fill="url(#machined-deck-bevel)" stroke="#090d16" strokeWidth="1.8" />

            {/* Firing Order Badge */}
            <circle cx={cxPos} cy={topY + h - 12} r="6" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
            <text x={cxPos} y={topY + h - 9.5} fill="#38bdf8" fontSize="6.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              {idx + 1}
            </text>
          </g>
        );
      })}

      {/* Precision Threaded Deck Flange Hex Bolts */}
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
        </g>
      ))}

      {/* Debossed Plaque Overlay */}
      <g>
        <rect x={bx + bw / 2 - 80} y="328" width="160" height="18" rx="3.5" fill="url(#plaque-metal)" stroke="#090d16" strokeWidth="2" />
        <text
          x={bx + bw / 2}
          y="340.5"
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
