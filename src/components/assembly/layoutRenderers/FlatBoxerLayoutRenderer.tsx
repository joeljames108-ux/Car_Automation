import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";

interface FlatBoxerLayoutRendererProps {
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

export const FlatBoxerLayoutRenderer: React.FC<FlatBoxerLayoutRendererProps> = ({
  layoutSpec,
  blockState,
  onHoverComponent,
  selectedVariants,
}) => {
  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;
  const bh = layoutSpec.bh;
  const isBoxer6 = layoutSpec.label.includes("H6") || layoutSpec.label.includes("Boxer-6");

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
      id="block-flatboxer"
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


      {/* Central Crankcase Split Line Parting Flange (180° Horizontal Split) */}
      <line x1={bx + 10} y1="225" x2={bx + bw - 10} y2="225" stroke="#38bdf8" strokeWidth="2.8" opacity="0.8" />
      <line x1={bx + 10} y1="225" x2={bx + bw - 10} y2="225" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />

      {/* 180° Low-Slung Flat Boxer Outer Casing Shell */}
      <rect
        x={bx}
        y="135"
        width={bw}
        height={bh}
        rx="16"
        fill={blockFill}
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="3.8"
      />
      <rect x={bx + 4} y="139" width={bw - 8} height={bh - 8} rx="12" fill="none" stroke="#ffffff" strokeWidth="2.2" opacity="0.9" />

      {/* Perimeter ARP Case Bolts along Parting Line */}
      {[...Array(12)].map((_, idx) => {
        const step = (bw - 30) / 11;
        const boltX = bx + 15 + idx * step;
        return (
          <g key={`flat-case-bolt-${idx}`}>
            <circle cx={boltX} cy="225" r="4.5" fill="#090d16" />
            <circle cx={boltX} cy="225" r="3.2" fill="url(#bolt-boss-3d)" stroke="#090d16" strokeWidth="0.8" />
            <circle cx={boltX} cy="225" r="1" fill="#ffffff" />
          </g>
        );
      })}

      {/* Left (-X) & Right (+X) Horizontally Opposed Cylinder Bore Extensions */}
      <g>
        {/* Left Horizontal Cylinder Extension Bank */}
        <path d={`M ${bx} 160 L ${bx - 24} 160 L ${bx - 24} 290 L ${bx} 290 Z`} fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="2" />
        <line x1={bx - 23} y1="162" x2={bx - 1} y2="162" stroke="#ffffff" strokeWidth="2" opacity="0.95" />

        {/* Right Horizontal Cylinder Extension Bank */}
        <path d={`M ${bx + bw} 160 L ${bx + bw + 24} 160 L ${bx + bw + 24} 290 L ${bx + bw} 290 Z`} fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="2" />
        <line x1={bx + bw + 1} y1="162" x2={bx + bw + 23} y2="162" stroke="#ffffff" strokeWidth="2" opacity="0.95" />
      </g>

      {/* 3D Stand-Up Horizontal Cylinder Sleeve Rings */}
      {layoutSpec.cyls.map((cxPos, idx) => {
        const cylW = layoutSpec.width;
        const cylX = cxPos - cylW / 2;
        return (
          <g key={`flat-cyl-${idx}`}>
            {/* Water Jacket Envelope */}
            <rect
              x={cylX - 2.5}
              y="142"
              width={cylW + 5}
              height="166"
              rx="8"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              opacity="0.4"
            />
            <rect
              x={cylX}
              y="145"
              width={cylW}
              height="160"
              rx="8"
              fill="url(#cylinder-tube-3d)"
              stroke="#090d16"
              strokeWidth="2.5"
            />
            <rect x={cylX + 2} y="149" width={cylW - 4} height="152" rx="6" fill="url(#bore-depth-gradient)" />
            <rect x={cylX + 3} y="150" width={cylW - 6} height="150" rx="5" fill="url(#honing-crosshatch)" opacity="0.5" />

            <line x1={cylX + 3} y1="147" x2={cylX + 3} y2="303" stroke="#ffffff" strokeWidth="3" opacity="0.98" />
            <line x1={cylX + cylW - 3} y1="147" x2={cylX + cylW - 3} y2="303" stroke="#090d16" strokeWidth="2.5" opacity="0.95" />

            <ellipse cx={cxPos} cy="149" rx={cylW / 2 - 0.5} ry="5.8" fill="url(#machined-deck-bevel)" stroke="#090d16" strokeWidth="1.8" />

            {/* Firing Order Tag */}
            <circle cx={cxPos} cy="295" r="6" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
            <text x={cxPos} y="297.5" fill="#38bdf8" fontSize="6.5" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              {idx + 1}
            </text>
          </g>
        );
      })}

      {/* Debossed Laser Serial Plaque */}
      <g>
        <rect x={bx + bw / 2 - 76} y="298" width="152" height="18" rx="3.5" fill="url(#plaque-metal)" stroke="#090d16" strokeWidth="2" />
        <line x1={bx + bw / 2 - 74} y1="299.5" x2={bx + bw / 2 + 74} y2="299.5" stroke="#ffffff" strokeWidth="1.5" opacity="0.95" />

        <circle cx={bx + bw / 2 - 70} cy="302.5" r="1.2" fill="#090d16" />
        <circle cx={bx + bw / 2 + 70} cy="302.5" r="1.2" fill="#090d16" />

        <text
          x={bx + bw / 2}
          y="310.5"
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
