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
  selectedVariants?: Record<string, string>;
}

export const VBankLayoutRenderer: React.FC<VBankLayoutRendererProps> = ({
  layoutSpec,
  blockState,
  onHoverComponent,
  selectedVariants,
}) => {
  const bx = layoutSpec.bx;
  const bw = layoutSpec.bw;
  const bh = layoutSpec.bh;
  const isV12 = layoutSpec.label.includes("V12");
  const isV10 = layoutSpec.label.includes("V10");
  const isV8 = layoutSpec.label.includes("V8");
  const isV6 = layoutSpec.label.includes("V6");

  // V12 Firing Order Sequence: 1 - 7 - 5 - 11 - 3 - 9 - 6 - 12 - 2 - 8 - 4 - 10
  const v12FiringOrder = ["1A", "7B", "5A", "11B", "3A", "9B", "6A", "12B"];

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
        rx="14"
        fill={blockFill}
        stroke={blockState.isHovered || blockState.isActive ? "#38bdf8" : "#090d16"}
        strokeWidth="3.8"
      />
      <rect x={bx + 4} y="110" width={bw - 8} height={bh - 8} rx="10" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.9" />

      {/* Central V-Valley Oil Gallery Trough & Coolant Port Passages */}
      <g>
        <path
          d={`M ${bx + 26} 118 L ${bx + bw / 2} 144 L ${bx + bw - 26} 118 Z`}
          fill="url(#main-bearing-cap-cast-iron)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        <line x1={bx + 36} y1="122" x2={bx + bw - 36} y2="122" stroke="#ffffff" strokeWidth="1.8" opacity="0.8" />

        {/* V12 Quad Knock Sensor Bosses */}
        {isV12 ? (
          <>
            <circle cx={bx + bw / 2 - 60} cy="130" r="4.5" fill="#f59e0b" stroke="#090d16" strokeWidth="1" />
            <circle cx={bx + bw / 2 - 20} cy="134" r="4.5" fill="#f59e0b" stroke="#090d16" strokeWidth="1" />
            <circle cx={bx + bw / 2 + 20} cy="134" r="4.5" fill="#f59e0b" stroke="#090d16" strokeWidth="1" />
            <circle cx={bx + bw / 2 + 60} cy="130" r="4.5" fill="#f59e0b" stroke="#090d16" strokeWidth="1" />
          </>
        ) : (
          <>
            <circle cx={bx + bw / 2 - 35} cy="132" r="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
            <circle cx={bx + bw / 2} cy="135" r="5" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
            <circle cx={bx + bw / 2 + 35} cy="132" r="4" fill="#090d16" stroke="#38bdf8" strokeWidth="1" />
          </>
        )}
      </g>

      {/* Mid-Body Cross-Bolted Main Bearing Ribs (V12 features 7 main journal webs!) */}
      <g>
        <rect x={bx + 4} y="178" width="34" height="86" rx="4" fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="2" />
        <rect x={bx + bw - 38} y="178" width="34" height="86" rx="4" fill="url(#chrome-3d)" stroke="#090d16" strokeWidth="2" />
        
        {/* Cross-Bolt Studs */}
        <circle cx={bx + 21} cy="190" r="3" fill="#090d16" />
        <circle cx={bx + 21} cy="220" r="3" fill="#090d16" />
        <circle cx={bx + 21} cy="250" r="3" fill="#090d16" />
        <circle cx={bx + bw - 21} cy="190" r="3" fill="#090d16" />
        <circle cx={bx + bw - 21} cy="220" r="3" fill="#090d16" />
        <circle cx={bx + bw - 21} cy="250" r="3" fill="#090d16" />
      </g>

      {/* 3D Stand-Up Cylinder Sleeves & Bores */}
      {layoutSpec.cyls.map((cxPos, idx) => {
        const cylW = layoutSpec.width;
        const cylX = cxPos - cylW / 2;
        const bankTag = isV12 ? (v12FiringOrder[idx % v12FiringOrder.length] || `${idx + 1}`) : `${idx + 1}`;

        return (
          <g key={`vbank-cyl-${idx}`}>
            {/* Water Jacket Surround Envelope */}
            <rect
              x={cylX - 2.5}
              y="120"
              width={cylW + 5}
              height="202"
              rx="10"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              opacity="0.4"
            />
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

            {/* Firing Order Bank Tag */}
            <circle cx={cxPos} cy="304" r="6.5" fill="#090d16" stroke={isV12 ? "#f59e0b" : "#38bdf8"} strokeWidth="1" />
            <text x={cxPos} y="306.5" fill={isV12 ? "#f59e0b" : "#38bdf8"} fontSize="6" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              {bankTag}
            </text>
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
        <rect
          x={bx + bw / 2 - 90}
          y="324"
          width="180"
          height="18"
          rx="3.5"
          fill={isV12 ? "url(#anodized-blue)" : "url(#plaque-metal)"}
          stroke="#090d16"
          strokeWidth="2"
        />
        <text
          x={bx + bw / 2}
          y="336.5"
          fill={isV12 ? "#ffffff" : "#090d16"}
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
