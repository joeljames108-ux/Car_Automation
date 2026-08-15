import React from "react";

interface I6BlockCastingIsoProps {
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
 * PHASE 4: INLINE-6 "SEVEN SISTERS" STRAIGHT-SIX MONOBLOCK CASTING
 * ═════════════════════════════════════════════════════════════════════
 */
export const I6BlockCastingIso: React.FC<I6BlockCastingIsoProps> = ({
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

  // Inline-6 Geometry Constants in Isometric Pixel Space
  const startX = 110;
  const startY = 220;
  const borePitch = 50;
  const boreRadiusX = 21;
  const boreRadiusY = 11.5;
  const blockHeight = 115;
  const blockLength = 310;

  return (
    <g
      id="iso3d-i6-hyperreal-monoblock"
      className="transition-all duration-500 cursor-pointer"
      onMouseEnter={() => onHoverComponent && onHoverComponent("block")}
      onMouseLeave={() => onHoverComponent && onHoverComponent(null)}
      style={{
        transform: `translate(${blockState.offsetX}px, ${blockState.offsetY}px)`,
        opacity: blockState.opacity,
      }}
    >
      {/* ── LAYER 1: GROUND AO DROP SHADOW & RAY-CAST OCCLUSION ── */}
      <g id="i6-layer1-ao-shadow">
        <ellipse
          cx={startX + blockLength / 2}
          cy={startY + blockHeight + 36}
          rx={blockLength * 0.65}
          ry={34}
          fill="url(#photoreal-chassis-ground-ao)"
        />
        <path
          d={`M${startX - 22} ${startY + blockHeight + 16}
             L${startX + blockLength - 12} ${startY + blockHeight - 26}
             L${startX + blockLength + 38} ${startY + blockHeight - 8}
             L${startX + 28} ${startY + blockHeight + 32} Z`}
          fill="#000000"
          opacity="0.75"
        />
      </g>

      {/* ── LAYER 2: LOWER SKIRT, SUMP RAILS & 7 MAIN BULKHEADS ── */}
      <g id="i6-layer2-skirt-sump-rails">
        {/* Sump Rail Flange Plate */}
        <path
          d={`M${startX - 20} ${startY + blockHeight + 14}
             L${startX + blockLength - 12} ${startY + blockHeight - 26}
             L${startX + blockLength + 35} ${startY + blockHeight - 10}
             L${startX + 27} ${startY + blockHeight + 28} Z`}
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1.2"
        />
        {/* Sump Rail 24 Perimeter Bolt Flanges */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
          const bx = startX - 12 + i * 28;
          const by = startY + blockHeight + 12 - i * 3.8;
          return (
            <g key={`sump-bolt-${i}`}>
              <circle cx={bx} cy={by} r="3.2" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
              <circle cx={bx} cy={by} r="1.5" fill="#94a3b8" />
            </g>
          );
        })}
        {/* 7 "Seven Sisters" Main Bearing Bulkheads */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const mx = startX + i * 50;
          const my = startY + blockHeight - 4 - i * 3.5;
          return (
            <path
              key={`main-cap-${i}`}
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

      {/* ── LAYER 3: MAIN MONOBLOCK SILHOUETTE & WEB WALLS ── */}
      <g id="i6-layer3-monoblock-walls">
        {/* Left Front Crankcase Face */}
        <path
          d={`M${startX - 24} ${startY + 20}
             L${startX + 32} ${startY + 48}
             L${startX + 28} ${startY + blockHeight + 26}
             L${startX - 24} ${startY + blockHeight + 12} Z`}
          fill={skirtFill}
          stroke="#64748b"
          strokeWidth="1.2"
        />
        {/* Main Side Skirt Wall */}
        <path
          d={`M${startX + 32} ${startY + 48}
             L${startX + blockLength + 36} ${startY + 12}
             L${startX + blockLength + 34} ${startY + blockHeight - 10}
             L${startX + 28} ${startY + blockHeight + 26} Z`}
          fill={skirtFill}
          stroke="#475569"
          strokeWidth="1.2"
        />
        {/* Rear Starter Pocket & Bellhousing Flange */}
        <path
          d={`M${startX + blockLength + 22} ${startY + 32}
             L${startX + blockLength + 48} ${startY + 45}
             L${startX + blockLength + 45} ${startY + 85}
             L${startX + blockLength + 20} ${startY + 75} Z`}
          fill="#1e293b"
          stroke="#38bdf8"
          strokeWidth="0.8"
        />
      </g>

      {/* ── LAYER 4: TIMING DRIVE & OIL PUMP FRONT CAVITY ── */}
      <g id="i6-layer4-timing-cavity">
        <path
          d={`M${startX - 20} ${startY + 26}
             L${startX + 20} ${startY + 46}
             L${startX + 18} ${startY + 82}
             L${startX - 20} ${startY + 68} Z`}
          fill="#090d16"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeDasharray="3,2"
        />
        <circle cx={startX - 2} cy={startY + 54} r="3" fill="url(#photoreal-oil-gallery)" />
      </g>

      {/* ── LAYER 5: TOP DECK & 6 HONED CYLINDER BORES ── */}
      <g id="i6-layer5-deck-and-bores">
        {/* CNC Milled Cylinder Head Deck Surface */}
        <path
          d={`M${startX - 24} ${startY + 20}
             L${startX + 125} ${startY - 38}
             L${startX + blockLength + 125} ${startY - 74}
             L${startX + blockLength + 36} ${startY + 12} Z`}
          fill={deckFill}
          stroke="#94a3b8"
          strokeWidth="1.5"
          filter="url(#fe-cnc-toolpath)"
        />

        {/* Deck Outer Chamfer Bevel Highlight */}
        <path
          d={`M${startX - 24} ${startY + 20}
             L${startX + blockLength + 36} ${startY + 12}`}
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* 6 Cylinder Bores with 45° Diamond Plateau Honing */}
        {[0, 1, 2, 3, 4, 5].map((cyl) => {
          const cx = startX + 24 + cyl * borePitch;
          const cy = startY + 12 - cyl * 6.5;

          return (
            <g key={`cyl-bore-${cyl}`}>
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
              <ellipse
                cx={cx}
                cy={cy + 1.2}
                rx={boreRadiusX - 2.5}
                ry={boreRadiusY - 1.2}
                fill="none"
                stroke="#0284c7"
                strokeWidth="0.8"
                opacity="0.6"
              />
              <circle cx={cx - 4} cy={cy + 3} r="1.5" fill="url(#photoreal-oil-gallery)" />
            </g>
          );
        })}
      </g>

      {/* ── LAYER 6: OPEN-DECK WATER JACKET COOLANT PASSAGES ── */}
      <g id="i6-layer6-coolant-passages">
        {[0, 1, 2, 3, 4].map((i) => {
          const wjx = startX + 49 + i * borePitch;
          const wjy = startY + 9 - i * 6.5;
          return (
            <g key={`water-jacket-port-${i}`}>
              <path
                d={`M${wjx - 4} ${wjy - 14}
                   C${wjx} ${wjy - 16}, ${wjx + 4} ${wjy - 16}, ${wjx + 4} ${wjy - 12}
                   L${wjx + 4} ${wjy + 8}
                   C${wjx + 4} ${wjy + 12}, ${wjx - 4} ${wjy + 12}, ${wjx - 4} ${wjy + 8} Z`}
                fill="url(#photoreal-coolant-flow)"
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
            </g>
          );
        })}
      </g>

      {/* ── LAYER 7: LONGITUDINAL OIL GALLERY & BRASS END-PLUGS ── */}
      <g id="i6-layer7-oil-gallery">
        <line
          x1={startX - 14}
          y1={startY + 38}
          x2={startX + blockLength + 20}
          y2={startY + 4}
          stroke="url(#photoreal-oil-gallery)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <polygon
          points={`${startX - 16},${startY + 36} ${startX - 12},${startY + 34} ${startX - 10},${startY + 38} ${startX - 12},${startY + 42} ${startX - 16},${startY + 40}`}
          fill="url(#photoreal-tin-gold)"
          stroke="#713f12"
          strokeWidth="0.8"
        />
      </g>

      {/* ── LAYER 8: STRUCTURAL REINFORCEMENT TRUSS RIBS ── */}
      <g id="i6-layer8-structural-ribs">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const rx = startX + 24 + i * 50;
          const ry = startY + 48 - i * 6.5;
          return (
            <g key={`truss-rib-${i}`}>
              <polygon
                points={`${rx},${ry} ${rx + 10},${ry + 1.2} ${rx + 8},${ry + blockHeight - 25} ${rx - 2},${ry + blockHeight - 25}`}
                fill="#334155"
                stroke="#64748b"
                strokeWidth="1"
              />
              <line x1={rx + 1} y1={ry + 2} x2={rx - 1} y2={ry + blockHeight - 26} stroke="#94a3b8" strokeWidth="1" />
            </g>
          );
        })}
      </g>

      {/* ── LAYER 9: 14 RECESSED ARP 12-POINT HEAD STUD BOSSES ── */}
      <g id="i6-layer9-head-studs">
        {[
          { x: startX + 5, y: startY + 28 },
          { x: startX + 55, y: startY + 22 },
          { x: startX + 105, y: startY + 16 },
          { x: startX + 155, y: startY + 10 },
          { x: startX + 205, y: startY + 4 },
          { x: startX + 255, y: startY - 2 },
          { x: startX + 305, y: startY - 8 },
          { x: startX + 48, y: startY - 18 },
          { x: startX + 98, y: startY - 24 },
          { x: startX + 148, y: startY - 30 },
          { x: startX + 198, y: startY - 36 },
          { x: startX + 248, y: startY - 42 },
          { x: startX + 298, y: startY - 48 },
          { x: startX + 348, y: startY - 54 },
        ].map((stud, idx) => (
          <g key={`head-stud-${idx}`}>
            <ellipse cx={stud.x} cy={stud.y} rx="5.5" ry="3.2" fill="url(#photoreal-washer-sheen)" stroke="#475569" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y - 1} r="2.8" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y - 1} r="1.2" fill="#38bdf8" opacity="0.85" />
          </g>
        ))}
      </g>

      {/* ── LAYER 10: FREEZE PLUGS, DUAL KNOCK SENSORS & SERIAL ID ── */}
      <g id="i6-layer10-auxiliary-casting-details">
        {/* Brass Freeze Plugs */}
        {[0, 1, 2, 3].map((i) => {
          const fpx = startX + 52 + i * 50;
          const fpy = startY + 74 - i * 6.5;
          return (
            <g key={`freeze-plug-${i}`}>
              <ellipse cx={fpx} cy={fpy} rx="7.5" ry="11" fill="#0f172a" stroke="#475569" strokeWidth="1" />
              <ellipse cx={fpx} cy={fpy} rx="6" ry="9" fill="url(#photoreal-tin-gold)" stroke="#854d0e" strokeWidth="0.8" />
              <ellipse cx={fpx} cy={fpy} rx="2.5" ry="4" fill="#713f12" />
            </g>
          );
        })}

        {/* Dual Knock Sensor Pedestal Towers */}
        <g id="knock-sensor-boss-1">
          <ellipse cx={startX + 115} cy={startY + 66} rx="6" ry="4" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={startX + 115} cy={startY + 65} r="2.2" fill="#020617" />
        </g>
        <g id="knock-sensor-boss-2">
          <ellipse cx={startX + 225} cy={startY + 52} rx="6" ry="4" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={startX + 225} cy={startY + 51} r="2.2" fill="#020617" />
        </g>

        {/* Twin Turbo Scavenge Return Port */}
        <g id="turbo-drain-spigot">
          <ellipse cx={startX + 175} cy={startY + 82} rx="7" ry="5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          <circle cx={startX + 175} cy={startY + 82} r="3" fill="#020617" />
        </g>

        {/* Laser-Etched Engine Casting Serial Tag */}
        <rect
          x={startX + 35}
          y={startY + 88}
          width="46"
          height="14"
          rx="2"
          fill="#0b0f17"
          stroke="#38bdf8"
          strokeWidth="0.8"
          opacity="0.8"
        />
        <text
          x={startX + 40}
          y={startY + 98}
          fill="#38bdf8"
          fontSize="6.5"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.8"
        >
          APX-I6-30TT
        </text>
      </g>

      {/* ── LAYER 11: SPECULAR EDGE HIGHLIGHTS & FRESNEL GLOW ── */}
      <g id="i6-layer11-specular-highlights" pointerEvents="none">
        <line
          x1={startX - 24}
          y1={startY + 20}
          x2={startX + blockLength + 36}
          y2={startY + 12}
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
          filter="url(#fe-specular-bloom)"
        />
        <line
          x1={startX - 24}
          y1={startY + 20}
          x2={startX - 24}
          y2={startY + blockHeight + 12}
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
      </g>

      {/* ── LAYER 12: REAL-TIME THERMODYNAMIC HEAT SHIMMER ── */}
      {isInstalled && (
        <g id="i6-layer12-combustion-thermal-glow" opacity="0.22" pointerEvents="none">
          <ellipse
            cx={startX + blockLength / 2 + 30}
            cy={startY + 4}
            rx={blockLength * 0.46}
            ry={30}
            fill="url(#photoreal-heat-tint)"
          />
        </g>
      )}
    </g>
  );
};
