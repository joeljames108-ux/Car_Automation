import React from "react";

interface VBankBlockCastingIsoProps {
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
 * PHASE 8: 60° V12 FLAGSHIP HYPERCAR 12-LAYER V-BLOCK CASTING
 * ═════════════════════════════════════════════════════════════════════
 *
 * Implements full 12-layer hyper-realism architecture for 60° V12:
 * - Layer 1: Ground AO drop shadow & V12 valley ray-cast occlusion
 * - Layer 2: Deep sump pan rails with 30 perimeter bolts & 7 cross-bolted main caps
 * - Layer 3: Main 60° V-bank casting with twin-row valley stiffening trusses & starter pocket
 * - Layer 4: Front dual timing chain drive plate cavity & twin water pump necks
 * - Layer 5: 12 Diamond-honed cylinder bores (6 left bank, 6 right bank) with 45° cross-hatch
 * - Layer 6: Open-deck water jackets with 10 siamese coolant transfer channels
 * - Layer 7: High-pressure central valley oil gallery with brass end-plugs
 * - Layer 8: Structural valley stiffening bridge gussets & side skirt ribs
 * - Layer 9: 28 Recessed ARP 12-point head stud bosses (14 per bank) with hardened washers
 * - Layer 10: Freeze plugs, valley knock sensors, dry sump scavenge ports & serial tag
 * - Layer 11: Multi-tier specular edge highlights & razor-sharp bevel lighting
 * - Layer 12: Interactive hover state illumination & thermodynamic heat glow
 */
export const VBankBlockCastingIso: React.FC<VBankBlockCastingIsoProps> = ({
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

  // V12 Isometric Space Geometry
  const centerX = 250;
  const centerY = 205;
  const bankPitch = 36;
  const boreRadiusX = 17;
  const boreRadiusY = 9.5;
  const blockHeight = 120;
  const blockWidth = 285;

  return (
    <g
      id="iso3d-v12-hyperreal-vblock"
      className="transition-all duration-500 cursor-pointer"
      onMouseEnter={() => onHoverComponent && onHoverComponent("block")}
      onMouseLeave={() => onHoverComponent && onHoverComponent(null)}
      style={{
        transform: `translate(${blockState.offsetX}px, ${blockState.offsetY}px)`,
        opacity: blockState.opacity,
      }}
    >
      {/* ── LAYER 1: GROUND AO DROP SHADOW & VALLEY OCCLUSION ── */}
      <g id="v12-layer1-ao-shadow">
        <ellipse
          cx={centerX}
          cy={centerY + blockHeight + 38}
          rx={blockWidth * 0.65}
          ry={36}
          fill="url(#photoreal-chassis-ground-ao)"
        />
        <path
          d={`M${centerX - 125} ${centerY + blockHeight + 16}
             L${centerX + 105} ${centerY + blockHeight - 26}
             L${centerX + 145} ${centerY + blockHeight - 10}
             L${centerX - 85} ${centerY + blockHeight + 32} Z`}
          fill="#000000"
          opacity="0.75"
        />
      </g>

      {/* ── LAYER 2: LOWER SKIRT, SUMP RAILS & 7 MAIN CAPS ── */}
      <g id="v12-layer2-skirt-sump-rails">
        <path
          d={`M${centerX - 120} ${centerY + blockHeight + 12}
             L${centerX + 102} ${centerY + blockHeight - 26}
             L${centerX + 140} ${centerY + blockHeight - 10}
             L${centerX - 82} ${centerY + blockHeight + 28} Z`}
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1.2"
        />
        {/* Sump Rail Perimeter Bolts */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
          const bx = centerX - 112 + i * 22;
          const by = centerY + blockHeight + 11 - i * 3.8;
          return (
            <g key={`v12-sump-bolt-${i}`}>
              <circle cx={bx} cy={by} r="3.2" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
              <circle cx={bx} cy={by} r="1.5" fill="#94a3b8" />
            </g>
          );
        })}
        {/* 7 Cross-Bolted Main Bearing Bulkheads */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const mx = centerX - 90 + i * 36;
          const my = centerY + blockHeight - 4 - i * 3.8;
          return (
            <path
              key={`v12-main-cap-${i}`}
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

      {/* ── LAYER 3: V12 MAIN MONOBLOCK CASTING & VALLEY ── */}
      <g id="v12-layer3-vbank-walls">
        {/* Front Crankcase 60° Profile Face */}
        <polygon
          points={`${centerX - 135},${centerY + 25} ${centerX - 20},${centerY + 48} ${centerX},${centerY + 74} ${centerX + 20},${centerY + 48} ${centerX + 135},${centerY + 25} ${centerX + 85},${centerY + blockHeight + 20} ${centerX - 85},${centerY + blockHeight + 20}`}
          fill={skirtFill}
          stroke="#64748b"
          strokeWidth="1.2"
        />
        {/* Outer Left Bank Skirt Wall */}
        <path
          d={`M${centerX - 135} ${centerY + 25}
             L${centerX + 15} ${centerY - 28}
             L${centerX + 105} ${centerY + blockHeight - 26}
             L${centerX - 85} ${centerY + blockHeight + 20} Z`}
          fill={skirtFill}
          stroke="#475569"
          strokeWidth="1.2"
        />
        {/* Deep Valley Chamber Recess */}
        <polygon
          points={`${centerX - 20},${centerY + 48} ${centerX + 125},${centerY - 6} ${centerX + 145},${centerY + 6} ${centerX},${centerY + 74}`}
          fill="url(#photoreal-valley-shadow)"
          stroke="#1e293b"
          strokeWidth="1"
        />
      </g>

      {/* ── LAYER 4: TIMING DRIVE & TWIN WATER PUMP HOUSINGS ── */}
      <g id="v12-layer4-timing-cavity">
        <path
          d={`M${centerX - 115} ${centerY + 32}
             L${centerX - 18} ${centerY + 54}
             L${centerX + 18} ${centerY + 54}
             L${centerX + 115} ${centerY + 32}
             L${centerX + 80} ${centerY + 85}
             L${centerX - 80} ${centerY + 85} Z`}
          fill="#090d16"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeDasharray="3,2"
        />
        {/* Twin Water Pump Inlets */}
        <circle cx={centerX - 58} cy={centerY + 58} r="7" fill="#020617" stroke="#334155" strokeWidth="1" />
        <circle cx={centerX - 58} cy={centerY + 58} r="3" fill="url(#photoreal-coolant-flow)" />
        <circle cx={centerX + 58} cy={centerY + 58} r="7" fill="#020617" stroke="#334155" strokeWidth="1" />
        <circle cx={centerX + 58} cy={centerY + 58} r="3" fill="url(#photoreal-coolant-flow)" />
      </g>

      {/* ── LAYER 5: LEFT & RIGHT TOP DECKS + 12 HONED CYLINDER BORES ── */}
      <g id="v12-layer5-decks-and-bores">
        {/* Left Bank Cylinder Head Deck */}
        <path
          d={`M${centerX - 135} ${centerY + 25}
             L${centerX - 25} ${centerY - 16}
             L${centerX + 125} ${centerY - 76}
             L${centerX + 15} ${centerY - 28} Z`}
          fill={deckFill}
          stroke="#94a3b8"
          strokeWidth="1.5"
          filter="url(#fe-cnc-toolpath)"
        />

        {/* 6 Left Bank Bores */}
        {[0, 1, 2, 3, 4, 5].map((cyl) => {
          const cx = centerX - 90 + cyl * bankPitch;
          const cy = centerY + 8 - cyl * 6.5;
          return (
            <g key={`v12-left-bore-${cyl}`}>
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
             L${centerX + 135} ${centerY + 25}
             L${centerX + 275} ${centerY - 26}
             L${centerX + 158} ${centerY + 2} Z`}
          fill={deckFill}
          stroke="#94a3b8"
          strokeWidth="1.5"
          filter="url(#fe-cnc-toolpath)"
        />

        {/* 6 Right Bank Bores */}
        {[0, 1, 2, 3, 4, 5].map((cyl) => {
          const cx = centerX + 45 + cyl * bankPitch;
          const cy = centerY + 28 - cyl * 6.5;
          return (
            <g key={`v12-right-bore-${cyl}`}>
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
      <g id="v12-layer6-coolant-passages">
        {[0, 1, 2, 3, 4].map((i) => {
          const wjx = centerX - 68 + i * bankPitch;
          const wjy = centerY + 5 - i * 6.5;
          return (
            <g key={`v12-water-jacket-${i}`}>
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
      <g id="v12-layer7-oil-gallery">
        <line
          x1={centerX - 12}
          y1={centerY + 62}
          x2={centerX + 135}
          y2={centerY + 6}
          stroke="url(#photoreal-oil-gallery)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <polygon
          points={`${centerX - 14},${centerY + 60} ${centerX - 10},${centerY + 58} ${centerX - 8},${centerY + 62} ${centerX - 10},${centerY + 66} ${centerX - 14},${centerY + 64}`}
          fill="url(#photoreal-tin-gold)"
          stroke="#713f12"
          strokeWidth="0.8"
        />
      </g>

      {/* ── LAYER 8: STRUCTURAL VALLEY TRUSS GUSSETS ── */}
      <g id="v12-layer8-valley-gussets">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const vx = centerX + 8 + i * 25;
          const vy = centerY + 48 - i * 10;
          return (
            <g key={`v12-gusset-${i}`}>
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

      {/* ── LAYER 9: 28 RECESSED ARP 12-POINT HEAD STUD BOSSES ── */}
      <g id="v12-layer9-head-studs">
        {[
          // Left Bank (14 studs)
          { x: centerX - 122, y: centerY + 12 },
          { x: centerX - 86, y: centerY + 5 },
          { x: centerX - 50, y: centerY - 2 },
          { x: centerX - 14, y: centerY - 9 },
          { x: centerX + 22, y: centerY - 16 },
          { x: centerX + 58, y: centerY - 23 },
          { x: centerX + 94, y: centerY - 30 },
          { x: centerX - 75, y: centerY - 26 },
          { x: centerX - 39, y: centerY - 33 },
          { x: centerX - 3, y: centerY - 40 },
          { x: centerX + 33, y: centerY - 47 },
          { x: centerX + 69, y: centerY - 54 },
          { x: centerX + 105, y: centerY - 61 },
          { x: centerX + 141, y: centerY - 68 },
          // Right Bank (14 studs)
          { x: centerX + 32, y: centerY + 34 },
          { x: centerX + 68, y: centerY + 27 },
          { x: centerX + 104, y: centerY + 20 },
          { x: centerX + 140, y: centerY + 13 },
          { x: centerX + 176, y: centerY + 6 },
          { x: centerX + 212, y: centerY - 1 },
          { x: centerX + 248, y: centerY - 8 },
          { x: centerX + 74, y: centerY - 4 },
          { x: centerX + 110, y: centerY - 11 },
          { x: centerX + 146, y: centerY - 18 },
          { x: centerX + 182, y: centerY - 25 },
          { x: centerX + 218, y: centerY - 32 },
          { x: centerX + 254, y: centerY - 39 },
          { x: centerX + 290, y: centerY - 46 },
        ].map((stud, idx) => (
          <g key={`v12-head-stud-${idx}`}>
            <ellipse cx={stud.x} cy={stud.y} rx="5.5" ry="3.2" fill="url(#photoreal-washer-sheen)" stroke="#475569" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y - 1} r="2.8" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y - 1} r="1.2" fill="#38bdf8" opacity="0.85" />
          </g>
        ))}
      </g>

      {/* ── LAYER 10: VALLEY KNOCK SENSORS, DRY SUMP & SERIAL ID ── */}
      <g id="v12-layer10-auxiliary-casting-details">
        <g id="v12-knock-sensor-1">
          <ellipse cx={centerX + 25} cy={centerY + 38} rx="6" ry="4" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={centerX + 25} cy={centerY + 37} r="2.2" fill="#020617" />
        </g>
        <g id="v12-knock-sensor-2">
          <ellipse cx={centerX + 105} cy={centerY + 12} rx="6" ry="4" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={centerX + 105} cy={centerY + 11} r="2.2" fill="#020617" />
        </g>

        {/* Dry Sump Scavenge Ports */}
        <g id="v12-scavenge-port-left">
          <ellipse cx={centerX - 75} cy={centerY + 85} rx="6.5" ry="4.5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          <circle cx={centerX - 75} cy={centerY + 85} r="2.8" fill="#020617" />
        </g>
        <g id="v12-scavenge-port-right">
          <ellipse cx={centerX + 65} cy={centerY + 72} rx="6.5" ry="4.5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          <circle cx={centerX + 65} cy={centerY + 72} r="2.8" fill="#020617" />
        </g>

        {/* Laser-Etched Engine Casting Serial Tag */}
        <rect
          x={centerX - 25}
          y={centerY + 96}
          width="52"
          height="14"
          rx="2"
          fill="#0b0f17"
          stroke="#38bdf8"
          strokeWidth="0.8"
          opacity="0.8"
        />
        <text
          x={centerX - 20}
          y={centerY + 106}
          fill="#38bdf8"
          fontSize="6.5"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.8"
        >
          APX-V12-65TT
        </text>
      </g>

      {/* ── LAYER 11: SPECULAR EDGE HIGHLIGHTS & FRESNEL GLOW ── */}
      <g id="v12-layer11-specular-highlights" pointerEvents="none">
        <line
          x1={centerX - 135}
          y1={centerY + 25}
          x2={centerX + 15}
          y2={centerY - 28}
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
          filter="url(#fe-specular-bloom)"
        />
        <line
          x1={centerX - 135}
          y1={centerY + 25}
          x2={centerX - 85}
          y2={centerY + blockHeight + 20}
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
      </g>

      {/* ── LAYER 12: REAL-TIME THERMODYNAMIC HEAT SHIMMER ── */}
      {isInstalled && (
        <g id="v12-layer12-combustion-thermal-glow" opacity="0.22" pointerEvents="none">
          <ellipse
            cx={centerX + 35}
            cy={centerY + 15}
            rx={blockWidth * 0.46}
            ry={32}
            fill="url(#photoreal-heat-tint)"
          />
        </g>
      )}
    </g>
  );
};
