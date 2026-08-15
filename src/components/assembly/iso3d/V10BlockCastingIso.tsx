import React from "react";

interface V10BlockCastingIsoProps {
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
 * PHASE 7: 90°/72° EXOTIC HIGH-REVVING V10 12-LAYER V-BLOCK CASTING
 * ═════════════════════════════════════════════════════════════════════
 *
 * Implements full 12-layer hyper-realism architecture for V10:
 * - Layer 1: Ground AO drop shadow & V10 valley ray-cast occlusion
 * - Layer 2: Dry-sump flat pan rails with 26 perimeter bolts & 6 cross-bolted main caps
 * - Layer 3: Main 72°/90° V-bank casting with deep valley webbing & starter pocket
 * - Layer 4: Front timing chain drive plate cavity & dry sump oil scavenge pump mount
 * - Layer 5: 10 Diamond-honed cylinder bores (5 left bank, 5 right bank) with 45° cross-hatch
 * - Layer 6: Open-deck water jackets with 8 siamese coolant transfer channels
 * - Layer 7: High-pressure central valley oil gallery with brass end-plugs
 * - Layer 8: Structural valley stiffening bridge gussets & side skirt ribs
 * - Layer 9: 24 Recessed ARP 12-point head stud bosses (12 per bank) with hardened washers
 * - Layer 10: Freeze plugs, valley knock sensors, dry sump scavenge ports & serial tag
 * - Layer 11: Multi-tier specular edge highlights & razor-sharp bevel lighting
 * - Layer 12: Interactive hover state illumination & thermodynamic heat glow
 */
export const V10BlockCastingIso: React.FC<V10BlockCastingIsoProps> = ({
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

  // V10 Isometric Space Geometry
  const centerX = 250;
  const centerY = 210;
  const bankPitch = 40;
  const boreRadiusX = 18;
  const boreRadiusY = 10;
  const blockHeight = 118;
  const blockWidth = 265;

  return (
    <g
      id="iso3d-v10-hyperreal-vblock"
      className="transition-all duration-500 cursor-pointer"
      onMouseEnter={() => onHoverComponent && onHoverComponent("block")}
      onMouseLeave={() => onHoverComponent && onHoverComponent(null)}
      style={{
        transform: `translate(${blockState.offsetX}px, ${blockState.offsetY}px)`,
        opacity: blockState.opacity,
      }}
    >
      {/* ── LAYER 1: GROUND AO DROP SHADOW & VALLEY OCCLUSION ── */}
      <g id="v10-layer1-ao-shadow">
        <ellipse
          cx={centerX}
          cy={centerY + blockHeight + 36}
          rx={blockWidth * 0.65}
          ry={34}
          fill="url(#photoreal-chassis-ground-ao)"
        />
        <path
          d={`M${centerX - 115} ${centerY + blockHeight + 16}
             L${centerX + 95} ${centerY + blockHeight - 24}
             L${centerX + 135} ${centerY + blockHeight - 10}
             L${centerX - 75} ${centerY + blockHeight + 30} Z`}
          fill="#000000"
          opacity="0.75"
        />
      </g>

      {/* ── LAYER 2: LOWER SKIRT, DRY-SUMP RAILS & 6 MAIN CAPS ── */}
      <g id="v10-layer2-skirt-sump-rails">
        <path
          d={`M${centerX - 110} ${centerY + blockHeight + 12}
             L${centerX + 92} ${centerY + blockHeight - 24}
             L${centerX + 130} ${centerY + blockHeight - 10}
             L${centerX - 72} ${centerY + blockHeight + 26} Z`}
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1.2"
        />
        {/* Dry Sump Perimeter Fasteners */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const bx = centerX - 102 + i * 24;
          const by = centerY + blockHeight + 11 - i * 4.2;
          return (
            <g key={`v10-sump-bolt-${i}`}>
              <circle cx={bx} cy={by} r="3.2" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
              <circle cx={bx} cy={by} r="1.5" fill="#94a3b8" />
            </g>
          );
        })}
        {/* 6 Cross-Bolted Main Bearing Bulkheads */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const mx = centerX - 80 + i * 40;
          const my = centerY + blockHeight - 4 - i * 4;
          return (
            <path
              key={`v10-main-cap-${i}`}
              d={`M${mx - 8} ${my}
                 C${mx - 8} ${my + 16}, ${mx + 12} ${my + 16}, ${mx + 12} ${my}
                 L${mx + 16} ${my - 2}
                 C${mx + 16} ${my + 20}, ${mx - 12} ${my + 20}, ${mx - 12} ${my - 2} Z`}
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1"
            />
          );
        })}
      </g>

      {/* ── LAYER 3: V10 MAIN MONOBLOCK CASTING & VALLEY ── */}
      <g id="v10-layer3-vbank-walls">
        {/* Front Crankcase 72° Profile Face */}
        <polygon
          points={`${centerX - 125},${centerY + 25} ${centerX - 20},${centerY + 48} ${centerX},${centerY + 74} ${centerX + 20},${centerY + 48} ${centerX + 125},${centerY + 25} ${centerX + 80},${centerY + blockHeight + 20} ${centerX - 80},${centerY + blockHeight + 20}`}
          fill={skirtFill}
          stroke="#64748b"
          strokeWidth="1.2"
        />
        {/* Outer Left Bank Skirt Wall */}
        <path
          d={`M${centerX - 125} ${centerY + 25}
             L${centerX + 15} ${centerY - 26}
             L${centerX + 95} ${centerY + blockHeight - 24}
             L${centerX - 80} ${centerY + blockHeight + 20} Z`}
          fill={skirtFill}
          stroke="#475569"
          strokeWidth="1.2"
        />
        {/* Deep Valley Chamber Recess */}
        <polygon
          points={`${centerX - 20},${centerY + 48} ${centerX + 115},${centerY - 4} ${centerX + 135},${centerY + 8} ${centerX},${centerY + 74}`}
          fill="url(#photoreal-valley-shadow)"
          stroke="#1e293b"
          strokeWidth="1"
        />
      </g>

      {/* ── LAYER 4: TIMING DRIVE & OIL SCAVENGE MOUNT ── */}
      <g id="v10-layer4-timing-cavity">
        <path
          d={`M${centerX - 105} ${centerY + 32}
             L${centerX - 18} ${centerY + 54}
             L${centerX + 18} ${centerY + 54}
             L${centerX + 105} ${centerY + 32}
             L${centerX + 75} ${centerY + 85}
             L${centerX - 75} ${centerY + 85} Z`}
          fill="#090d16"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeDasharray="3,2"
        />
        <circle cx={centerX - 52} cy={centerY + 58} r="6" fill="#020617" stroke="#334155" strokeWidth="1" />
        <circle cx={centerX - 52} cy={centerY + 58} r="2.5" fill="url(#photoreal-tin-gold)" />
        <circle cx={centerX + 52} cy={centerY + 58} r="6" fill="#020617" stroke="#334155" strokeWidth="1" />
        <circle cx={centerX + 52} cy={centerY + 58} r="2.5" fill="url(#photoreal-tin-gold)" />
      </g>

      {/* ── LAYER 5: LEFT & RIGHT TOP DECKS + 10 HONED CYLINDER BORES ── */}
      <g id="v10-layer5-decks-and-bores">
        {/* Left Bank Cylinder Head Deck */}
        <path
          d={`M${centerX - 125} ${centerY + 25}
             L${centerX - 25} ${centerY - 16}
             L${centerX + 115} ${centerY - 72}
             L${centerX + 15} ${centerY - 26} Z`}
          fill={deckFill}
          stroke="#94a3b8"
          strokeWidth="1.5"
          filter="url(#fe-cnc-toolpath)"
        />

        {/* 5 Left Bank Bores */}
        {[0, 1, 2, 3, 4].map((cyl) => {
          const cx = centerX - 80 + cyl * bankPitch;
          const cy = centerY + 8 - cyl * 6.5;
          return (
            <g key={`v10-left-bore-${cyl}`}>
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

        {/* Right Bank Cylinder Head Deck */}
        <path
          d={`M${centerX + 20} ${centerY + 48}
             L${centerX + 125} ${centerY + 25}
             L${centerX + 255} ${centerY - 24}
             L${centerX + 148} ${centerY + 2} Z`}
          fill={deckFill}
          stroke="#94a3b8"
          strokeWidth="1.5"
          filter="url(#fe-cnc-toolpath)"
        />

        {/* 5 Right Bank Bores */}
        {[0, 1, 2, 3, 4].map((cyl) => {
          const cx = centerX + 50 + cyl * bankPitch;
          const cy = centerY + 28 - cyl * 6.5;
          return (
            <g key={`v10-right-bore-${cyl}`}>
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
      <g id="v10-layer6-coolant-passages">
        {[0, 1, 2, 3].map((i) => {
          const wjx = centerX - 58 + i * bankPitch;
          const wjy = centerY + 5 - i * 6.5;
          return (
            <g key={`v10-water-jacket-${i}`}>
              <path
                d={`M${wjx - 3} ${wjy - 12}
                   C${wjx} ${wjy - 14}, ${wjx + 3} ${wjy - 14}, ${wjx + 3} ${wjy - 10}
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

      {/* ── LAYER 7: CENTRAL VALLEY HIGH-PRESSURE OIL PASSAGE ── */}
      <g id="v10-layer7-oil-gallery">
        <line
          x1={centerX - 10}
          y1={centerY + 60}
          x2={centerX + 125}
          y2={centerY + 8}
          stroke="url(#photoreal-oil-gallery)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <polygon
          points={`${centerX - 12},${centerY + 58} ${centerX - 8},${centerY + 56} ${centerX - 6},${centerY + 60} ${centerX - 8},${centerY + 64} ${centerX - 12},${centerY + 62}`}
          fill="url(#photoreal-tin-gold)"
          stroke="#713f12"
          strokeWidth="0.8"
        />
      </g>

      {/* ── LAYER 8: STRUCTURAL VALLEY TRUSS GUSSETS ── */}
      <g id="v10-layer8-valley-gussets">
        {[0, 1, 2, 3, 4].map((i) => {
          const vx = centerX + 10 + i * 28;
          const vy = centerY + 46 - i * 11;
          return (
            <g key={`v10-gusset-${i}`}>
              <polygon
                points={`${vx - 6},${vy} ${vx + 6},${vy - 3} ${vx + 4},${vy + 12} ${vx - 4},${vy + 12}`}
                fill="#334155"
                stroke="#64748b"
                strokeWidth="0.8"
              />
            </g>
          );
        })}
      </g>

      {/* ── LAYER 9: 24 RECESSED ARP 12-POINT HEAD STUD BOSSES ── */}
      <g id="v10-layer9-head-studs">
        {[
          // Left Bank (12 studs)
          { x: centerX - 112, y: centerY + 12 },
          { x: centerX - 72, y: centerY + 5 },
          { x: centerX - 32, y: centerY - 2 },
          { x: centerX + 8, y: centerY - 9 },
          { x: centerX + 48, y: centerY - 16 },
          { x: centerX + 88, y: centerY - 23 },
          { x: centerX - 65, y: centerY - 26 },
          { x: centerX - 25, y: centerY - 33 },
          { x: centerX + 15, y: centerY - 40 },
          { x: centerX + 55, y: centerY - 47 },
          { x: centerX + 95, y: centerY - 54 },
          { x: centerX + 135, y: centerY - 61 },
          // Right Bank (12 studs)
          { x: centerX + 32, y: centerY + 34 },
          { x: centerX + 72, y: centerY + 27 },
          { x: centerX + 112, y: centerY + 20 },
          { x: centerX + 152, y: centerY + 13 },
          { x: centerX + 192, y: centerY + 6 },
          { x: centerX + 232, y: centerY - 1 },
          { x: centerX + 74, y: centerY - 4 },
          { x: centerX + 114, y: centerY - 11 },
          { x: centerX + 154, y: centerY - 18 },
          { x: centerX + 194, y: centerY - 25 },
          { x: centerX + 234, y: centerY - 32 },
          { x: centerX + 274, y: centerY - 39 },
        ].map((stud, idx) => (
          <g key={`v10-head-stud-${idx}`}>
            <ellipse cx={stud.x} cy={stud.y} rx="5.5" ry="3.2" fill="url(#photoreal-washer-sheen)" stroke="#475569" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y - 1} r="2.8" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y - 1} r="1.2" fill="#38bdf8" opacity="0.85" />
          </g>
        ))}
      </g>

      {/* ── LAYER 10: VALLEY KNOCK SENSORS, DRY SUMP & SERIAL ID ── */}
      <g id="v10-layer10-auxiliary-casting-details">
        <g id="v10-knock-sensor-1">
          <ellipse cx={centerX + 25} cy={centerY + 38} rx="6" ry="4" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={centerX + 25} cy={centerY + 37} r="2.2" fill="#020617" />
        </g>
        <g id="v10-knock-sensor-2">
          <ellipse cx={centerX + 95} cy={centerY + 14} rx="6" ry="4" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={centerX + 95} cy={centerY + 13} r="2.2" fill="#020617" />
        </g>

        {/* Dry Sump Scavenge Ports */}
        <g id="v10-scavenge-port-left">
          <ellipse cx={centerX - 65} cy={centerY + 85} rx="6.5" ry="4.5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          <circle cx={centerX - 65} cy={centerY + 85} r="2.8" fill="#020617" />
        </g>
        <g id="v10-scavenge-port-right">
          <ellipse cx={centerX + 55} cy={centerY + 72} rx="6.5" ry="4.5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          <circle cx={centerX + 55} cy={centerY + 72} r="2.8" fill="#020617" />
        </g>

        {/* Laser-Etched Engine Casting Serial Tag */}
        <rect
          x={centerX - 25}
          y={centerY + 94}
          width="48"
          height="14"
          rx="2"
          fill="#0b0f17"
          stroke="#38bdf8"
          strokeWidth="0.8"
          opacity="0.8"
        />
        <text
          x={centerX - 20}
          y={centerY + 104}
          fill="#38bdf8"
          fontSize="6.5"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.8"
        >
          APX-V10-52R
        </text>
      </g>

      {/* ── LAYER 11: SPECULAR EDGE HIGHLIGHTS & FRESNEL GLOW ── */}
      <g id="v10-layer11-specular-highlights" pointerEvents="none">
        <line
          x1={centerX - 125}
          y1={centerY + 25}
          x2={centerX + 15}
          y2={centerY - 26}
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
          filter="url(#fe-specular-bloom)"
        />
        <line
          x1={centerX - 125}
          y1={centerY + 25}
          x2={centerX - 80}
          y2={centerY + blockHeight + 20}
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
      </g>

      {/* ── LAYER 12: REAL-TIME THERMODYNAMIC HEAT SHIMMER ── */}
      {isInstalled && (
        <g id="v10-layer12-combustion-thermal-glow" opacity="0.22" pointerEvents="none">
          <ellipse
            cx={centerX + 30}
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
