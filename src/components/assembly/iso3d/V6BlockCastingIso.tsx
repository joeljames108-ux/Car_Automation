import React from "react";

interface V6BlockCastingIsoProps {
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
 * PHASE 5: 60° V6 HIGH-OUTPUT TWIN-TURBO 12-LAYER V-BLOCK CASTING
 * ═════════════════════════════════════════════════════════════════════
 */
export const V6BlockCastingIso: React.FC<V6BlockCastingIsoProps> = ({
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

  // V6 Isometric Space Geometry
  const centerX = 250;
  const centerY = 210;
  const bankPitch = 48;
  const boreRadiusX = 20;
  const boreRadiusY = 11;
  const blockHeight = 115;
  const blockWidth = 220;

  return (
    <g
      id="iso3d-v6-hyperreal-vblock"
      className="transition-all duration-500 cursor-pointer"
      onMouseEnter={() => onHoverComponent && onHoverComponent("block")}
      onMouseLeave={() => onHoverComponent && onHoverComponent(null)}
      style={{
        transform: `translate(${blockState.offsetX}px, ${blockState.offsetY}px)`,
        opacity: blockState.opacity,
      }}
    >
      {/* ── LAYER 1: GROUND AO DROP SHADOW & VALLEY OCCLUSION ── */}
      <g id="v6-layer1-ao-shadow">
        <ellipse
          cx={centerX}
          cy={centerY + blockHeight + 36}
          rx={blockWidth * 0.65}
          ry={34}
          fill="url(#photoreal-chassis-ground-ao)"
        />
        <path
          d={`M${centerX - 95} ${centerY + blockHeight + 16}
             L${centerX + 75} ${centerY + blockHeight - 20}
             L${centerX + 115} ${centerY + blockHeight - 6}
             L${centerX - 55} ${centerY + blockHeight + 30} Z`}
          fill="#000000"
          opacity="0.75"
        />
      </g>

      {/* ── LAYER 2: LOWER SKIRT, SUMP RAILS & 4 SPLAYED MAIN CAPS ── */}
      <g id="v6-layer2-skirt-sump-rails">
        <path
          d={`M${centerX - 90} ${centerY + blockHeight + 12}
             L${centerX + 72} ${centerY + blockHeight - 20}
             L${centerX + 110} ${centerY + blockHeight - 6}
             L${centerX - 52} ${centerY + blockHeight + 26} Z`}
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1.2"
        />
        {/* Sump Rail Perimeter Bolts */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const bx = centerX - 82 + i * 24;
          const by = centerY + blockHeight + 11 - i * 4.2;
          return (
            <g key={`v6-sump-bolt-${i}`}>
              <circle cx={bx} cy={by} r="3.2" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
              <circle cx={bx} cy={by} r="1.5" fill="#94a3b8" />
            </g>
          );
        })}
        {/* 4 Cross-Bolted Main Caps */}
        {[0, 1, 2, 3].map((i) => {
          const mx = centerX - 60 + i * 50;
          const my = centerY + blockHeight - 4 - i * 4;
          return (
            <path
              key={`v6-main-cap-${i}`}
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

      {/* ── LAYER 3: 60° V-BANK MAIN MONOBLOCK CASTING & VALLEY ── */}
      <g id="v6-layer3-vbank-walls">
        {/* Front Crankcase 60° Y-Profile Face */}
        <polygon
          points={`${centerX - 105},${centerY + 25} ${centerX - 15},${centerY + 45} ${centerX},${centerY + 72} ${centerX + 15},${centerY + 45} ${centerX + 105},${centerY + 25} ${centerX + 65},${centerY + blockHeight + 20} ${centerX - 65},${centerY + blockHeight + 20}`}
          fill={skirtFill}
          stroke="#64748b"
          strokeWidth="1.2"
        />
        {/* Outer Left Bank Skirt Wall */}
        <path
          d={`M${centerX - 105} ${centerY + 25}
             L${centerX + 15} ${centerY - 22}
             L${centerX + 75} ${centerY + blockHeight - 20}
             L${centerX - 65} ${centerY + blockHeight + 20} Z`}
          fill={skirtFill}
          stroke="#475569"
          strokeWidth="1.2"
        />
        {/* Deep Central Valley Recess & Ambient Shadow */}
        <polygon
          points={`${centerX - 15},${centerY + 45} ${centerX + 95},${centerY} ${centerX + 115},${centerY + 12} ${centerX},${centerY + 72}`}
          fill="url(#photoreal-valley-shadow)"
          stroke="#1e293b"
          strokeWidth="1"
        />
      </g>

      {/* ── LAYER 4: TIMING DRIVE & CAMSHAFT SPROCKET CAVITIES ── */}
      <g id="v6-layer4-timing-cavity">
        <path
          d={`M${centerX - 92} ${centerY + 32}
             L${centerX - 15} ${centerY + 52}
             L${centerX + 15} ${centerY + 52}
             L${centerX + 92} ${centerY + 32}
             L${centerX + 62} ${centerY + 85}
             L${centerX - 62} ${centerY + 85} Z`}
          fill="#090d16"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeDasharray="3,2"
        />
        {/* Dual Bank Cam Drive Idler Pulleys */}
        <circle cx={centerX - 42} cy={centerY + 58} r="6" fill="#020617" stroke="#334155" strokeWidth="1" />
        <circle cx={centerX - 42} cy={centerY + 58} r="2.5" fill="url(#photoreal-tin-gold)" />
        <circle cx={centerX + 42} cy={centerY + 58} r="6" fill="#020617" stroke="#334155" strokeWidth="1" />
        <circle cx={centerX + 42} cy={centerY + 58} r="2.5" fill="url(#photoreal-tin-gold)" />
      </g>

      {/* ── LAYER 5: LEFT & RIGHT TOP DECKS + 6 HONED CYLINDER BORES ── */}
      <g id="v6-layer5-decks-and-bores">
        {/* Left Bank Cylinder Head Deck */}
        <path
          d={`M${centerX - 105} ${centerY + 25}
             L${centerX - 25} ${centerY - 15}
             L${centerX + 95} ${centerY - 62}
             L${centerX + 15} ${centerY - 22} Z`}
          fill={deckFill}
          stroke="#94a3b8"
          strokeWidth="1.5"
          filter="url(#fe-cnc-toolpath)"
        />

        {/* 3 Left Bank Bores */}
        {[0, 1, 2].map((cyl) => {
          const cx = centerX - 60 + cyl * bankPitch;
          const cy = centerY + 8 - cyl * 6.5;
          return (
            <g key={`v6-left-bore-${cyl}`}>
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
          d={`M${centerX + 15} ${centerY + 45}
             L${centerX + 105} ${centerY + 25}
             L${centerX + 215} ${centerY - 18}
             L${centerX + 125} ${centerY + 2} Z`}
          fill={deckFill}
          stroke="#94a3b8"
          strokeWidth="1.5"
          filter="url(#fe-cnc-toolpath)"
        />

        {/* 3 Right Bank Bores */}
        {[0, 1, 2].map((cyl) => {
          const cx = centerX + 60 + cyl * bankPitch;
          const cy = centerY + 28 - cyl * 6.5;
          return (
            <g key={`v6-right-bore-${cyl}`}>
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
      <g id="v6-layer6-coolant-passages">
        {[0, 1].map((i) => {
          const wjx = centerX - 36 + i * bankPitch;
          const wjy = centerY + 5 - i * 6.5;
          return (
            <g key={`v6-water-jacket-${i}`}>
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
      <g id="v6-layer7-oil-gallery">
        <line
          x1={centerX - 5}
          y1={centerY + 55}
          x2={centerX + 105}
          y2={centerY + 12}
          stroke="url(#photoreal-oil-gallery)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <polygon
          points={`${centerX - 8},${centerY + 54} ${centerX - 4},${centerY + 52} ${centerX - 2},${centerY + 56} ${centerX - 4},${centerY + 60} ${centerX - 8},${centerY + 58}`}
          fill="url(#photoreal-tin-gold)"
          stroke="#713f12"
          strokeWidth="0.8"
        />
      </g>

      {/* ── LAYER 8: STRUCTURAL VALLEY TRUSS GUSSETS ── */}
      <g id="v6-layer8-valley-gussets">
        {[0, 1, 2].map((i) => {
          const vx = centerX + 18 + i * 36;
          const vy = centerY + 42 - i * 14;
          return (
            <g key={`v6-gusset-${i}`}>
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

      {/* ── LAYER 9: 16 RECESSED ARP 12-POINT HEAD STUD BOSSES ── */}
      <g id="v6-layer9-head-studs">
        {[
          // Left Bank (8 studs)
          { x: centerX - 92, y: centerY + 12 },
          { x: centerX - 44, y: centerY + 5 },
          { x: centerX + 4, y: centerY - 2 },
          { x: centerX + 52, y: centerY - 9 },
          { x: centerX - 48, y: centerY - 25 },
          { x: centerX, y: centerY - 32 },
          { x: centerX + 48, y: centerY - 39 },
          { x: centerX + 96, y: centerY - 46 },
          // Right Bank (8 studs)
          { x: centerX + 28, y: centerY + 32 },
          { x: centerX + 76, y: centerY + 25 },
          { x: centerX + 124, y: centerY + 18 },
          { x: centerX + 172, y: centerY + 11 },
          { x: centerX + 68, y: centerY - 5 },
          { x: centerX + 116, y: centerY - 12 },
          { x: centerX + 164, y: centerY - 19 },
          { x: centerX + 212, y: centerY - 26 },
        ].map((stud, idx) => (
          <g key={`v6-head-stud-${idx}`}>
            <ellipse cx={stud.x} cy={stud.y} rx="5.5" ry="3.2" fill="url(#photoreal-washer-sheen)" stroke="#475569" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y - 1} r="2.8" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y - 1} r="1.2" fill="#38bdf8" opacity="0.85" />
          </g>
        ))}
      </g>

      {/* ── LAYER 10: VALLEY KNOCK SENSORS, TURBO DRAIN & SERIAL ID ── */}
      <g id="v6-layer10-auxiliary-casting-details">
        {/* Valley Knock Sensors */}
        <g id="v6-knock-sensor-1">
          <ellipse cx={centerX + 25} cy={centerY + 36} rx="6" ry="4" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={centerX + 25} cy={centerY + 35} r="2.2" fill="#020617" />
        </g>
        <g id="v6-knock-sensor-2">
          <ellipse cx={centerX + 75} cy={centerY + 18} rx="6" ry="4" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={centerX + 75} cy={centerY + 17} r="2.2" fill="#020617" />
        </g>

        {/* Twin Turbo Scavenge Return Ports */}
        <g id="v6-turbo-drain-left">
          <ellipse cx={centerX - 55} cy={centerY + 85} rx="6.5" ry="4.5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          <circle cx={centerX - 55} cy={centerY + 85} r="2.8" fill="#020617" />
        </g>
        <g id="v6-turbo-drain-right">
          <ellipse cx={centerX + 45} cy={centerY + 72} rx="6.5" ry="4.5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          <circle cx={centerX + 45} cy={centerY + 72} r="2.8" fill="#020617" />
        </g>

        {/* Laser-Etched Engine Casting Serial Tag */}
        <rect
          x={centerX - 25}
          y={centerY + 92}
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
          y={centerY + 102}
          fill="#38bdf8"
          fontSize="6.5"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.8"
        >
          APX-V6-38TT
        </text>
      </g>

      {/* ── LAYER 11: SPECULAR EDGE HIGHLIGHTS & FRESNEL GLOW ── */}
      <g id="v6-layer11-specular-highlights" pointerEvents="none">
        <line
          x1={centerX - 105}
          y1={centerY + 25}
          x2={centerX + 15}
          y2={centerY - 22}
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
          filter="url(#fe-specular-bloom)"
        />
        <line
          x1={centerX - 105}
          y1={centerY + 25}
          x2={centerX - 65}
          y2={centerY + blockHeight + 20}
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
      </g>

      {/* ── LAYER 12: REAL-TIME THERMODYNAMIC HEAT SHIMMER ── */}
      {isInstalled && (
        <g id="v6-layer12-combustion-thermal-glow" opacity="0.22" pointerEvents="none">
          <ellipse
            cx={centerX + 20}
            cy={centerY + 15}
            rx={blockWidth * 0.45}
            ry={28}
            fill="url(#photoreal-heat-tint)"
          />
        </g>
      )}
    </g>
  );
};
