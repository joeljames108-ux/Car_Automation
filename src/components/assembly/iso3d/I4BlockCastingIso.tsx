import React from "react";

interface I4BlockCastingIsoProps {
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
 * PHASE 2: INLINE-4 HYPER-REALISTIC 12-LAYER MONOBLOCK CASTING
 * ═════════════════════════════════════════════════════════════════════
 */
export const I4BlockCastingIso: React.FC<I4BlockCastingIsoProps> = ({
  blockState,
  onHoverComponent,
  materialFinish = "billet",
  showCrossHatch = true,
}) => {
  const isInstalled = blockState.isInstalled;
  const isTarget = blockState.isActive;

  // Dynamic fill selector based on metallurgy
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

  // Inline-4 Geometry Constants in Isometric Pixel Space
  const startX = 140;
  const startY = 220;
  const borePitch = 56;
  const boreRadiusX = 22;
  const boreRadiusY = 12;
  const blockHeight = 110;
  const blockLength = 250;
  const blockDepth = 115;

  return (
    <g
      id="iso3d-i4-hyperreal-monoblock"
      className="transition-all duration-500 cursor-pointer"
      onMouseEnter={() => onHoverComponent && onHoverComponent("block")}
      onMouseLeave={() => onHoverComponent && onHoverComponent(null)}
      style={{
        transform: `translate(${blockState.offsetX}px, ${blockState.offsetY}px)`,
        opacity: blockState.opacity,
      }}
    >
      {/* ── LAYER 1: GROUND AO DROP SHADOW & RAY-CAST OCCLUSION ── */}
      <g id="i4-layer1-ao-shadow">
        {/* Soft Ambient Ground Shadow */}
        <ellipse
          cx={startX + blockLength / 2 - 10}
          cy={startY + blockHeight + 35}
          rx={blockLength * 0.65}
          ry={32}
          fill="url(#photoreal-chassis-ground-ao)"
        />
        {/* Contact Shadow under Sump Rail */}
        <path
          d={`M${startX - 20} ${startY + blockHeight + 15}
             L${startX + blockLength - 10} ${startY + blockHeight - 20}
             L${startX + blockLength + 35} ${startY + blockHeight - 5}
             L${startX + 25} ${startY + blockHeight + 30} Z`}
          fill="#000000"
          opacity="0.75"
        />
      </g>

      {/* ── LAYER 2: LOWER SKIRT, SUMP RAILS & 5 MAIN BULKHEADS ── */}
      <g id="i4-layer2-skirt-sump-rails">
        {/* Sump Rail Flange Plate */}
        <path
          d={`M${startX - 18} ${startY + blockHeight + 12}
             L${startX + blockLength - 15} ${startY + blockHeight - 22}
             L${startX + blockLength + 30} ${startY + blockHeight - 8}
             L${startX + 27} ${startY + blockHeight + 26} Z`}
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1.2"
        />
        {/* Sump Rail 18 Perimeter Bolt Flanges */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const bx = startX - 10 + i * 28;
          const by = startY + blockHeight + 10 - i * 3.8;
          return (
            <g key={`sump-bolt-${i}`}>
              <circle cx={bx} cy={by} r="3.2" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
              <circle cx={bx} cy={by} r="1.5" fill="#94a3b8" />
            </g>
          );
        })}
        {/* 5 Cross-Bolted Main Bearing Bulkheads (Crankcase Wells) */}
        {[0, 1, 2, 3, 4].map((i) => {
          const mx = startX + i * 56;
          const my = startY + blockHeight - 5 - i * 3.5;
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
      <g id="i4-layer3-monoblock-walls">
        {/* Left Front Crankcase Face */}
        <path
          d={`M${startX - 22} ${startY + 20}
             L${startX + 30} ${startY + 48}
             L${startX + 27} ${startY + blockHeight + 25}
             L${startX - 22} ${startY + blockHeight + 10} Z`}
          fill={skirtFill}
          stroke="#64748b"
          strokeWidth="1.2"
        />
        {/* Main Side Skirt Wall with Chamfered Belly */}
        <path
          d={`M${startX + 30} ${startY + 48}
             L${startX + blockLength + 32} ${startY + 15}
             L${startX + blockLength + 30} ${startY + blockHeight - 8}
             L${startX + 27} ${startY + blockHeight + 25} Z`}
          fill={skirtFill}
          stroke="#475569"
          strokeWidth="1.2"
        />
        {/* Rear Bellhousing Starter Pocket Flange */}
        <path
          d={`M${startX + blockLength + 20} ${startY + 35}
             L${startX + blockLength + 45} ${startY + 48}
             L${startX + blockLength + 42} ${startY + 85}
             L${startX + blockLength + 18} ${startY + 75} Z`}
          fill="#1e293b"
          stroke="#38bdf8"
          strokeWidth="0.8"
          opacity="0.85"
        />
        {/* Starter Motor Gear Ring Relief Arch */}
        <ellipse
          cx={startX + blockLength + 32}
          cy={startY + 62}
          rx="12"
          ry="18"
          fill="#020617"
          stroke="#334155"
          strokeWidth="1"
        />
      </g>

      {/* ── LAYER 4: TIMING CHAIN DRIVE FRONT CAVITY ── */}
      <g id="i4-layer4-timing-cavity">
        {/* Timing Cover Front Mating Flange Pocket */}
        <path
          d={`M${startX - 18} ${startY + 26}
             L${startX + 18} ${startY + 46}
             L${startX + 15} ${startY + 82}
             L${startX - 18} ${startY + 68} Z`}
          fill="#090d16"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeDasharray="3,2"
        />
        {/* Timing Chain Oil Feed Nozzle */}
        <circle cx={startX - 2} cy={startY + 52} r="2.8" fill="url(#photoreal-oil-gallery)" />
        <line x1={startX - 2} y1={startY + 52} x2={startX + 6} y2={startY + 57} stroke="#eab308" strokeWidth="1.5" />
      </g>

      {/* ── LAYER 5: TOP DECK PLATE & 4 HONED CYLINDER BORES ── */}
      <g id="i4-layer5-deck-and-bores">
        {/* CNC Milled Cylinder Head Deck Surface */}
        <path
          d={`M${startX - 22} ${startY + 20}
             L${startX + 120} ${startY - 35}
             L${startX + blockLength + 120} ${startY - 68}
             L${startX + blockLength + 32} ${startY + 15} Z`}
          fill={deckFill}
          stroke="#94a3b8"
          strokeWidth="1.5"
          filter="url(#fe-cnc-toolpath)"
        />

        {/* Deck Outer Chamfer Bevel Highlight */}
        <path
          d={`M${startX - 22} ${startY + 20}
             L${startX + blockLength + 32} ${startY + 15}`}
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* 4 Cylinder Bores with 45° Diamond Plateau Honing */}
        {[0, 1, 2, 3].map((cyl) => {
          const cx = startX + 26 + cyl * borePitch;
          const cy = startY + 12 - cyl * 6.8;

          return (
            <g key={`cyl-bore-${cyl}`}>
              {/* Outer Liner Step Chamfer Rim */}
              <ellipse cx={cx} cy={cy} rx={boreRadiusX + 2.5} ry={boreRadiusY + 1.5} fill="url(#photoreal-liner-rim)" />

              {/* Recessed Bore Depth Radial Ambient Occlusion */}
              <ellipse cx={cx} cy={cy} rx={boreRadiusX} ry={boreRadiusY} fill="url(#photoreal-bore-depth)" />

              {/* 45° Diamond Plateau Honing Cross-Hatch Shading */}
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

              {/* Top Piston Ring Land Relief Groove */}
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

              {/* Oil Squitter Cooling Jet at Bottom of Bore */}
              <circle cx={cx - 5} cy={cy + 3} r="1.5" fill="url(#photoreal-oil-gallery)" />
            </g>
          );
        })}
      </g>

      {/* ── LAYER 6: OPEN-DECK WATER JACKET COOLANT PASSAGES ── */}
      <g id="i4-layer6-coolant-passages">
        {[0, 1, 2].map((i) => {
          const wjx = startX + 54 + i * borePitch;
          const wjy = startY + 9 - i * 6.8;
          return (
            <g key={`water-jacket-port-${i}`}>
              {/* Siamese Coolant Transfer Slot */}
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
      <g id="i4-layer7-oil-gallery">
        {/* Longitudinal Main Gallery Line Running Block Length */}
        <line
          x1={startX - 12}
          y1={startY + 38}
          x2={startX + blockLength + 18}
          y2={startY + 5}
          stroke="url(#photoreal-oil-gallery)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Front Brass Threaded Hex Plug */}
        <polygon
          points={`${startX - 14},${startY + 36} ${startX - 10},${startY + 34} ${startX - 8},${startY + 38} ${startX - 10},${startY + 42} ${startX - 14},${startY + 40}`}
          fill="url(#photoreal-tin-gold)"
          stroke="#713f12"
          strokeWidth="0.8"
        />
      </g>

      {/* ── LAYER 8: STRUCTURAL REINFORCEMENT TRUSS RIBS ── */}
      <g id="i4-layer8-structural-ribs">
        {[0, 1, 2, 3].map((i) => {
          const rx = startX + 28 + i * 56;
          const ry = startY + 48 - i * 6.5;
          return (
            <g key={`truss-rib-${i}`}>
              {/* Triangular Stiffening Gusset */}
              <polygon
                points={`${rx},${ry} ${rx + 10},${ry + 1.2} ${rx + 8},${ry + blockHeight - 25} ${rx - 2},${ry + blockHeight - 25}`}
                fill="#334155"
                stroke="#64748b"
                strokeWidth="1"
              />
              {/* Rib Specular Highlight Line */}
              <line x1={rx + 1} y1={ry + 2} x2={rx - 1} y2={ry + blockHeight - 26} stroke="#94a3b8" strokeWidth="1" />
            </g>
          );
        })}
      </g>

      {/* ── LAYER 9: 10 RECESSED ARP 12-POINT HEAD STUD BOSSES ── */}
      <g id="i4-layer9-head-studs">
        {[
          { x: startX + 5, y: startY + 28 },
          { x: startX + 61, y: startY + 21 },
          { x: startX + 117, y: startY + 14 },
          { x: startX + 173, y: startY + 7 },
          { x: startX + 229, y: startY },
          { x: startX + 50, y: startY - 18 },
          { x: startX + 106, y: startY - 25 },
          { x: startX + 162, y: startY - 32 },
          { x: startX + 218, y: startY - 39 },
          { x: startX + 274, y: startY - 46 },
        ].map((stud, idx) => (
          <g key={`head-stud-${idx}`}>
            {/* Hardened Ground Steel Washer Seat */}
            <ellipse cx={stud.x} cy={stud.y} rx="5.5" ry="3.2" fill="url(#photoreal-washer-sheen)" stroke="#475569" strokeWidth="0.8" />
            {/* ARP 12-Point Flange Stud Head */}
            <circle cx={stud.x} cy={stud.y - 1} r="2.8" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y - 1} r="1.2" fill="#38bdf8" opacity="0.85" />
          </g>
        ))}
      </g>

      {/* ── LAYER 10: FREEZE PLUGS, KNOCK SENSOR & SERIAL ID ── */}
      <g id="i4-layer10-auxiliary-casting-details">
        {/* Brass Freeze Plugs along Crankcase Skirt */}
        {[0, 1, 2].map((i) => {
          const fpx = startX + 58 + i * 56;
          const fpy = startY + 74 - i * 6.5;
          return (
            <g key={`freeze-plug-${i}`}>
              <ellipse cx={fpx} cy={fpy} rx="7.5" ry="11" fill="#0f172a" stroke="#475569" strokeWidth="1" />
              <ellipse cx={fpx} cy={fpy} rx="6" ry="9" fill="url(#photoreal-tin-gold)" stroke="#854d0e" strokeWidth="0.8" />
              <ellipse cx={fpx} cy={fpy} rx="2.5" ry="4" fill="#713f12" />
            </g>
          );
        })}

        {/* Side Knock Sensor Pedestal Tower */}
        <g id="knock-sensor-boss">
          <ellipse cx={startX + 145} cy={startY + 65} rx="6" ry="4" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={startX + 145} cy={startY + 64} r="2.2" fill="#020617" />
        </g>

        {/* Crankcase Oil Filter Housing Spigot */}
        <g id="oil-filter-spigot">
          <polygon
            points={`${startX + 195},${startY + 72} ${startX + 215},${startY + 69} ${startX + 215},${startY + 92} ${startX + 195},${startY + 95}`}
            fill="#1e293b"
            stroke="#64748b"
            strokeWidth="1"
          />
          <ellipse cx={startX + 205} cy={startY + 94} rx="10" ry="4" fill="url(#photoreal-oil-gallery)" />
        </g>

        {/* Laser-Etched Engine Casting Serial Tag */}
        <rect
          x={startX + 35}
          y={startY + 85}
          width="42"
          height="14"
          rx="2"
          fill="#0b0f17"
          stroke="#38bdf8"
          strokeWidth="0.8"
          opacity="0.8"
        />
        <text
          x={startX + 40}
          y={startY + 95}
          fill="#38bdf8"
          fontSize="6.5"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.8"
        >
          APX-I4-20T
        </text>
      </g>

      {/* ── LAYER 11: SPECULAR EDGE HIGHLIGHTS & FRESNEL GLOW ── */}
      <g id="i4-layer11-specular-highlights" pointerEvents="none">
        {/* Top Deck Front Leading Edge Highlight */}
        <line
          x1={startX - 22}
          y1={startY + 20}
          x2={startX + blockLength + 32}
          y2={startY + 15}
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
          filter="url(#fe-specular-bloom)"
        />
        {/* Left Vertical Crankcase Corner Highlight */}
        <line
          x1={startX - 22}
          y1={startY + 20}
          x2={startX - 22}
          y2={startY + blockHeight + 10}
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
      </g>

      {/* ── LAYER 12: REAL-TIME THERMODYNAMIC HEAT SHIMMER ── */}
      {isInstalled && (
        <g id="i4-layer12-combustion-thermal-glow" opacity="0.22" pointerEvents="none">
          <ellipse
            cx={startX + blockLength / 2 + 30}
            cy={startY + 5}
            rx={blockLength * 0.45}
            ry={28}
            fill="url(#photoreal-heat-tint)"
          />
        </g>
      )}
    </g>
  );
};
