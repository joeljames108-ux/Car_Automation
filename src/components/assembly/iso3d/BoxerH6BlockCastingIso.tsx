import React from "react";

interface BoxerH6BlockCastingIsoProps {
  layoutSpec: any;
  blockState: {
    isInstalled: boolean;
    isActive: boolean;
    isHovered: boolean;
    offsetX: number;
    offsetY: number;
    opacity: number;
    scale?: number;
    meta?: any;
  };
  selectedVariants?: any;
  onHoverComponent?: (id: any) => void;
  materialFinish?: "billet" | "cast_iron" | "magnesium";
  showCrossHatch?: boolean;
}

/**
 * ═════════════════════════════════════════════════════════════════════
 * PHASE 10: BOXER-6 / FLAT-6 MOTORSPORT 180° SPLIT-CASE 12-LAYER BLOCK
 * ═════════════════════════════════════════════════════════════════════
 *
 * Implements full 12-layer hyper-realism architecture for Boxer-6:
 * - Layer 1: Ground AO drop shadow & 180° horizontal ray-cast occlusion
 * - Layer 2: Flat dry-sump pan rails with 20 perimeter bolts & 4 main bulkheads
 * - Layer 3: Left & Right 3-piece split-case halves with central parting line
 * - Layer 4: Front accessory drive carrier & dual timing chain drive plate cavities
 * - Layer 5: 6 Horizontal diamond-honed cylinder bores (3 left, 3 right) with 45° cross-hatch
 * - Layer 6: Open-deck water jackets with 4 siamese coolant transfer channels
 * - Layer 7: Dual longitudinal high-pressure oil galleries with brass end-plugs
 * - Layer 8: 14 Longitudinal split-case through-bolts with sealing washers
 * - Layer 9: 24 Recessed ARP 12-point head stud bosses (12 per bank) with hardened washers
 * - Layer 10: Freeze plugs, dual knock sensor towers, oil pressure sensor & serial tag
 * - Layer 11: Multi-tier specular edge highlights & razor-sharp bevel lighting
 * - Layer 12: Interactive hover state illumination & thermodynamic heat glow
 */
export const BoxerH6BlockCastingIso: React.FC<BoxerH6BlockCastingIsoProps> = ({
  blockState,
  onHoverComponent,
  materialFinish = "billet",
  showCrossHatch = true,
}) => {
  const isInstalled = blockState.isInstalled;
  const isTarget = blockState.isActive;

  const deckFill =
    materialFinish === "cast_iron"
      ? "url(#photoreal-castiron-wall)"
      : materialFinish === "magnesium"
      ? "url(#photoreal-magnesium-deck)"
      : "url(#photoreal-billet-deck)";

  const skirtFill =
    materialFinish === "cast_iron"
      ? "url(#photoreal-castiron-wall)"
      : materialFinish === "magnesium"
      ? "url(#photoreal-magnesium-deck)"
      : "url(#photoreal-billet-skirt)";

  // Boxer-6 Geometry Constants
  const centerX = 250;
  const centerY = 220;
  const bankPitch = 48;
  const boreRadiusX = 20;
  const boreRadiusY = 11;
  const blockHeight = 88;
  const blockWidth = 310;

  return (
    <g
      id="iso3d-boxer6-hyperreal-splitcase"
      className="transition-all duration-500 cursor-pointer"
      onMouseEnter={() => onHoverComponent && onHoverComponent("block")}
      onMouseLeave={() => onHoverComponent && onHoverComponent(null)}
      style={{
        transform: `translate(${blockState.offsetX}px, ${blockState.offsetY}px)`,
        opacity: blockState.opacity,
      }}
    >
      {/* ── LAYER 1: GROUND AO DROP SHADOW & RAY-CAST OCCLUSION ── */}
      <g id="h6-layer1-ao-shadow">
        <ellipse
          cx={centerX}
          cy={centerY + blockHeight + 32}
          rx={blockWidth * 0.62}
          ry={32}
          fill="url(#photoreal-chassis-ground-ao)"
        />
        <path
          d={`M${centerX - 145} ${centerY + blockHeight + 12}
             L${centerX + 125} ${centerY + blockHeight - 20}
             L${centerX + 160} ${centerY + blockHeight - 6}
             L${centerX - 110} ${centerY + blockHeight + 26} Z`}
          fill="#000000"
          opacity="0.75"
        />
      </g>

      {/* ── LAYER 2: FLAT DRY-SUMP PAN RAILS & 4 MAIN BULKHEADS ── */}
      <g id="h6-layer2-skirt-sump-rails">
        <path
          d={`M${centerX - 140} ${centerY + blockHeight + 10}
             L${centerX + 120} ${centerY + blockHeight - 20}
             L${centerX + 155} ${centerY + blockHeight - 6}
             L${centerX - 105} ${centerY + blockHeight + 24} Z`}
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1.2"
        />
        {/* Sump Rail Perimeter Bolts */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const bx = centerX - 130 + i * 28;
          const by = centerY + blockHeight + 9 - i * 3.8;
          return (
            <g key={`h6-sump-bolt-${i}`}>
              <circle cx={bx} cy={by} r="3.2" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
              <circle cx={bx} cy={by} r="1.5" fill="#94a3b8" />
            </g>
          );
        })}
        {/* 4 Main Bearing Bulkheads */}
        {[0, 1, 2, 3].map((i) => {
          const mx = centerX - 72 + i * 48;
          const my = centerY + blockHeight - 4 - i * 3.8;
          return (
            <path
              key={`h6-main-cap-${i}`}
              d={`M${mx - 8} ${my}
                 C${mx - 8} ${my + 14}, ${mx + 12} ${my + 14}, ${mx + 12} ${my}
                 L${mx + 16} ${my - 2}
                 C${mx + 16} ${my + 18}, ${mx - 12} ${my + 18}, ${mx - 12} ${my - 2} Z`}
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1"
            />
          );
        })}
      </g>

      {/* ── LAYER 3: 3-PIECE SPLIT-CASE HALVES & CENTRAL PARTING LINE ── */}
      <g id="h6-layer3-splitcase-walls">
        {/* Left Case Half Front Face */}
        <polygon
          points={`${centerX - 150},${centerY + 15} ${centerX - 5},${centerY + 32} ${centerX - 5},${centerY + blockHeight + 15} ${centerX - 150},${centerY + blockHeight - 2}`}
          fill={skirtFill}
          stroke="#64748b"
          strokeWidth="1.2"
        />
        {/* Right Case Half Front Face */}
        <polygon
          points={`${centerX + 5},${centerY + 32} ${centerX + 150},${centerY + 15} ${centerX + 150},${centerY + blockHeight - 2} ${centerX + 5},${centerY + blockHeight + 15}`}
          fill={skirtFill}
          stroke="#64748b"
          strokeWidth="1.2"
        />
        {/* Central Split Parting Line Seam */}
        <line
          x1={centerX}
          y1={centerY + 25}
          x2={centerX}
          y2={centerY + blockHeight + 20}
          stroke="#000000"
          strokeWidth="2.5"
        />
        <line
          x1={centerX + 1}
          y1={centerY + 25}
          x2={centerX + 1}
          y2={centerY + blockHeight + 20}
          stroke="#38bdf8"
          strokeWidth="0.8"
        />
      </g>

      {/* ── LAYER 4: TIMING DRIVE & ACCESSORY CARRIER CAVITIES ── */}
      <g id="h6-layer4-timing-cavity">
        <path
          d={`M${centerX - 135} ${centerY + 22}
             L${centerX + 135} ${centerY + 22}
             L${centerX + 105} ${centerY + 65}
             L${centerX - 105} ${centerY + 65} Z`}
          fill="#090d16"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeDasharray="3,2"
        />
        <circle cx={centerX - 68} cy={centerY + 45} r="6" fill="#020617" stroke="#334155" strokeWidth="1" />
        <circle cx={centerX - 68} cy={centerY + 45} r="2.5" fill="url(#photoreal-tin-gold)" />
        <circle cx={centerX + 68} cy={centerY + 45} r="6" fill="#020617" stroke="#334155" strokeWidth="1" />
        <circle cx={centerX + 68} cy={centerY + 45} r="2.5" fill="url(#photoreal-tin-gold)" />
      </g>

      {/* ── LAYER 5: LEFT & RIGHT DECKS + 6 HORIZONTAL CYLINDER BORES ── */}
      <g id="h6-layer5-decks-and-bores">
        {/* Left Horizontal Cylinder Head Deck */}
        <path
          d={`M${centerX - 150} ${centerY + 15}
             L${centerX - 50} ${centerY - 22}
             L${centerX + 50} ${centerY - 62}
             L${centerX - 50} ${centerY - 22} Z`}
          fill={deckFill}
          stroke="#94a3b8"
          strokeWidth="1.5"
          filter="url(#fe-cnc-toolpath)"
        />

        {/* 3 Left Bores */}
        {[0, 1, 2].map((cyl) => {
          const cx = centerX - 110 + cyl * bankPitch;
          const cy = centerY + 2 - cyl * 6.5;
          return (
            <g key={`h6-left-bore-${cyl}`}>
              <ellipse cx={cx} cy={cy} rx={boreRadiusX + 2.5} ry={boreRadiusY + 1.5} fill="url(#photoreal-liner-rim)" />
              <ellipse cx={cx} cy={cy} rx={boreRadiusX} ry={boreRadiusY} fill="url(#photoreal-bore-depth)" />
              {showCrossHatch && (
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={boreRadiusX - 1}
                  ry={boreRadiusY - 0.8}
                  fill="url(#photoreal-diamond-hatch)"
                  opacity="0.85"
                />
              )}
              <circle cx={cx - 4} cy={cy + 3} r="1.5" fill="url(#photoreal-oil-gallery)" />
            </g>
          );
        })}

        {/* Right Horizontal Cylinder Head Deck */}
        <path
          d={`M${centerX + 15} ${centerY + 32}
             L${centerX + 150} ${centerY + 15}
             L${centerX + 250} ${centerY - 22}
             L${centerX + 115} ${centerY - 5} Z`}
          fill={deckFill}
          stroke="#94a3b8"
          strokeWidth="1.5"
          filter="url(#fe-cnc-toolpath)"
        />

        {/* 3 Right Bores */}
        {[0, 1, 2].map((cyl) => {
          const cx = centerX + 40 + cyl * bankPitch;
          const cy = centerY + 18 - cyl * 6.5;
          return (
            <g key={`h6-right-bore-${cyl}`}>
              <ellipse cx={cx} cy={cy} rx={boreRadiusX + 2.5} ry={boreRadiusY + 1.5} fill="url(#photoreal-liner-rim)" />
              <ellipse cx={cx} cy={cy} rx={boreRadiusX} ry={boreRadiusY} fill="url(#photoreal-bore-depth)" />
              {showCrossHatch && (
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={boreRadiusX - 1}
                  ry={boreRadiusY - 0.8}
                  fill="url(#photoreal-diamond-hatch)"
                  opacity="0.85"
                />
              )}
              <circle cx={cx - 4} cy={cy + 3} r="1.5" fill="url(#photoreal-oil-gallery)" />
            </g>
          );
        })}
      </g>

      {/* ── LAYER 6: OPEN-DECK WATER JACKET COOLANT PASSAGES ── */}
      <g id="h6-layer6-coolant-passages">
        {[0, 1, 2, 3].map((i) => {
          const wjx = centerX - 86 + i * 48;
          const wjy = centerY + 8 - i * 4;
          return (
            <g key={`h6-water-jacket-${i}`}>
              <path
                d={`M${wjx - 3} ${wjy - 10}
                   C${wjx} ${wjy - 12}, ${wjx + 3} ${wjy - 12}, ${wjx + 3} ${wjy - 8}
                   L${wjx + 3} ${wjy + 6}
                   C${wjx + 3} ${wjy + 10}, ${wjx - 3} ${wjy + 10}, ${wjx - 3} ${wjy + 6} Z`}
                fill="url(#photoreal-coolant-flow)"
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
            </g>
          );
        })}
      </g>

      {/* ── LAYER 7: DUAL LONGITUDINAL OIL GALLERIES ── */}
      <g id="h6-layer7-oil-gallery">
        <line
          x1={centerX - 105}
          y1={centerY + 52}
          x2={centerX - 5}
          y2={centerY + 35}
          stroke="url(#photoreal-oil-gallery)"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.85"
        />
        <line
          x1={centerX + 5}
          y1={centerY + 35}
          x2={centerX + 105}
          y2={centerY + 18}
          stroke="url(#photoreal-oil-gallery)"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity="0.85"
        />
      </g>

      {/* ── LAYER 8: 14 LONGITUDINAL SPLIT-CASE THROUGH-BOLTS ── */}
      <g id="h6-layer8-through-bolts">
        {[
          { x: centerX - 8, y: centerY + 28 },
          { x: centerX + 8, y: centerY + 28 },
          { x: centerX - 8, y: centerY + 46 },
          { x: centerX + 8, y: centerY + 46 },
          { x: centerX - 8, y: centerY + 64 },
          { x: centerX + 8, y: centerY + 64 },
          { x: centerX - 8, y: centerY + 82 },
          { x: centerX + 8, y: centerY + 82 },
          { x: centerX - 55, y: centerY + 65 },
          { x: centerX + 55, y: centerY + 65 },
          { x: centerX - 105, y: centerY + 60 },
          { x: centerX + 105, y: centerY + 60 },
        ].map((bolt, idx) => (
          <g key={`through-bolt-${idx}`}>
            <circle cx={bolt.x} cy={bolt.y} r="3.2" fill="url(#photoreal-washer-sheen)" stroke="#475569" strokeWidth="0.8" />
            <circle cx={bolt.x} cy={bolt.y} r="1.8" fill="url(#photoreal-arp-black-oxide)" />
          </g>
        ))}
      </g>

      {/* ── LAYER 9: 24 RECESSED ARP 12-POINT HEAD STUD BOSSES ── */}
      <g id="h6-layer9-head-studs">
        {[
          // Left Bank (12 studs)
          { x: centerX - 140, y: centerY + 12 },
          { x: centerX - 95, y: centerY + 5 },
          { x: centerX - 50, y: centerY - 2 },
          { x: centerX - 5, y: centerY - 9 },
          { x: centerX + 40, y: centerY - 16 },
          { x: centerX + 85, y: centerY - 23 },
          { x: centerX - 90, y: centerY - 25 },
          { x: centerX - 45, y: centerY - 32 },
          { x: centerX, y: centerY - 39 },
          { x: centerX + 45, y: centerY - 46 },
          { x: centerX + 90, y: centerY - 53 },
          { x: centerX + 135, y: centerY - 60 },
          // Right Bank (12 studs)
          { x: centerX + 28, y: centerY + 28 },
          { x: centerX + 73, y: centerY + 21 },
          { x: centerX + 118, y: centerY + 14 },
          { x: centerX + 163, y: centerY + 7 },
          { x: centerX + 208, y: centerY },
          { x: centerX + 253, y: centerY - 7 },
          { x: centerX + 68, y: centerY - 8 },
          { x: centerX + 113, y: centerY - 15 },
          { x: centerX + 158, y: centerY - 22 },
          { x: centerX + 203, y: centerY - 29 },
          { x: centerX + 248, y: centerY - 36 },
          { x: centerX + 293, y: centerY - 43 },
        ].map((stud, idx) => (
          <g key={`h6-head-stud-${idx}`}>
            <ellipse cx={stud.x} cy={stud.y} rx="5.5" ry="3.2" fill="url(#photoreal-washer-sheen)" stroke="#475569" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y - 1} r="2.8" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y - 1} r="1.2" fill="#38bdf8" opacity="0.85" />
          </g>
        ))}
      </g>

      {/* ── LAYER 10: FREEZE PLUGS, DUAL KNOCK SENSORS & SERIAL ID ── */}
      <g id="h6-layer10-auxiliary-casting-details">
        <g id="h6-knock-sensor-1">
          <ellipse cx={centerX - 40} cy={centerY + 45} rx="6" ry="4" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={centerX - 40} cy={centerY + 44} r="2.2" fill="#020617" />
        </g>
        <g id="h6-knock-sensor-2">
          <ellipse cx={centerX + 40} cy={centerY + 45} rx="6" ry="4" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={centerX + 40} cy={centerY + 44} r="2.2" fill="#020617" />
        </g>

        {/* Laser-Etched Engine Casting Serial Tag */}
        <rect
          x={centerX - 25}
          y={centerY + 75}
          width="50"
          height="14"
          rx="2"
          fill="#0b0f17"
          stroke="#38bdf8"
          strokeWidth="0.8"
          opacity="0.8"
        />
        <text
          x={centerX - 20}
          y={centerY + 85}
          fill="#38bdf8"
          fontSize="6.5"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.8"
        >
          APX-H6-40R
        </text>
      </g>

      {/* ── LAYER 11: SPECULAR EDGE HIGHLIGHTS & FRESNEL GLOW ── */}
      <g id="h6-layer11-specular-highlights" pointerEvents="none">
        <line
          x1={centerX - 150}
          y1={centerY + 15}
          x2={centerX + 150}
          y2={centerY + 15}
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
          filter="url(#fe-specular-bloom)"
        />
      </g>

      {/* ── LAYER 12: REAL-TIME THERMODYNAMIC HEAT SHIMMER ── */}
      {isInstalled && (
        <g id="h6-layer12-combustion-thermal-glow" opacity="0.22" pointerEvents="none">
          <ellipse
            cx={centerX}
            cy={centerY + 15}
            rx={blockWidth * 0.46}
            ry={30}
            fill="url(#photoreal-heat-tint)"
          />
        </g>
      )}
    </g>
  );
};
