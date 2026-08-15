import React from "react";

interface I3BlockCastingIsoProps {
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
 * PHASE 3: INLINE-3 COMPACT VIBRATION-DAMPED MONOBLOCK CASTING
 * ═════════════════════════════════════════════════════════════════════
 */
export const I3BlockCastingIso: React.FC<I3BlockCastingIsoProps> = ({
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

  // Inline-3 Geometry Constants in Isometric Pixel Space
  const startX = 160;
  const startY = 225;
  const borePitch = 60;
  const boreRadiusX = 23;
  const boreRadiusY = 12.5;
  const blockHeight = 105;
  const blockLength = 195;

  return (
    <g
      id="iso3d-i3-hyperreal-monoblock"
      className="transition-all duration-500 cursor-pointer"
      onMouseEnter={() => onHoverComponent && onHoverComponent("block")}
      onMouseLeave={() => onHoverComponent && onHoverComponent(null)}
      style={{
        transform: `translate(${blockState.offsetX}px, ${blockState.offsetY}px)`,
        opacity: blockState.opacity,
      }}
    >
      {/* ── LAYER 1: GROUND AO DROP SHADOW & RAY-CAST OCCLUSION ── */}
      <g id="i3-layer1-ao-shadow">
        {/* Soft Ambient Ground Shadow */}
        <ellipse
          cx={startX + blockLength / 2 - 5}
          cy={startY + blockHeight + 32}
          rx={blockLength * 0.62}
          ry={30}
          fill="url(#photoreal-chassis-ground-ao)"
        />
        {/* Contact Shadow under Sump Rail */}
        <path
          d={`M${startX - 18} ${startY + blockHeight + 12}
             L${startX + blockLength - 12} ${startY + blockHeight - 18}
             L${startX + blockLength + 30} ${startY + blockHeight - 4}
             L${startX + 22} ${startY + blockHeight + 28} Z`}
          fill="#000000"
          opacity="0.75"
        />
      </g>

      {/* ── LAYER 2: LOWER SKIRT, SUMP RAILS & 4 MAIN BULKHEADS ── */}
      <g id="i3-layer2-skirt-sump-rails">
        {/* Sump Rail Flange Plate */}
        <path
          d={`M${startX - 15} ${startY + blockHeight + 10}
             L${startX + blockLength - 12} ${startY + blockHeight - 18}
             L${startX + blockLength + 26} ${startY + blockHeight - 6}
             L${startX + 24} ${startY + blockHeight + 24} Z`}
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1.2"
        />
        {/* Sump Rail 14 Perimeter Bolt Flanges */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const bx = startX - 8 + i * 29;
          const by = startY + blockHeight + 9 - i * 4.2;
          return (
            <g key={`sump-bolt-${i}`}>
              <circle cx={bx} cy={by} r="3.2" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
              <circle cx={bx} cy={by} r="1.5" fill="#94a3b8" />
            </g>
          );
        })}
        {/* 4 Cross-Bolted Main Bearing Bulkheads (Crankcase Wells) */}
        {[0, 1, 2, 3].map((i) => {
          const mx = startX + i * 60;
          const my = startY + blockHeight - 4 - i * 3.8;
          return (
            <path
              key={`main-cap-${i}`}
              d={`M${mx - 8} ${my}
                 C${mx - 8} ${my + 15}, ${mx + 12} ${my + 15}, ${mx + 12} ${my}
                 L${mx + 16} ${my - 2}
                 C${mx + 16} ${my + 19}, ${mx - 12} ${my + 19}, ${mx - 12} ${my - 2} Z`}
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1"
            />
          );
        })}
      </g>

      {/* ── LAYER 3: MAIN MONOBLOCK & COUNTERBALANCE SHAFT TUNNEL ── */}
      <g id="i3-layer3-monoblock-walls">
        {/* Left Front Crankcase Face */}
        <path
          d={`M${startX - 20} ${startY + 22}
             L${startX + 28} ${startY + 48}
             L${startX + 25} ${startY + blockHeight + 24}
             L${startX - 20} ${startY + blockHeight + 10} Z`}
          fill={skirtFill}
          stroke="#64748b"
          strokeWidth="1.2"
        />
        {/* Main Side Skirt Wall with Integrated Balance Shaft Bulge */}
        <path
          d={`M${startX + 28} ${startY + 48}
             L${startX + blockLength + 28} ${startY + 16}
             L${startX + blockLength + 26} ${startY + blockHeight - 6}
             L${startX + 25} ${startY + blockHeight + 24} Z`}
          fill={skirtFill}
          stroke="#475569"
          strokeWidth="1.2"
        />
        {/* Counterbalance Shaft Tunnel Longitudinal Swell */}
        <path
          d={`M${startX + 26} ${startY + 72}
             C${startX + 26} ${startY + 64}, ${startX + blockLength + 26} ${startY + 32}, ${startX + blockLength + 26} ${startY + 40}
             L${startX + blockLength + 26} ${startY + 56}
             C${startX + blockLength + 26} ${startY + 48}, ${startX + 26} ${startY + 80}, ${startX + 26} ${startY + 88} Z`}
          fill="#1e293b"
          stroke="#38bdf8"
          strokeWidth="0.8"
          opacity="0.7"
        />
      </g>

      {/* ── LAYER 4: TIMING DRIVE & OIL PUMP INTEGRATION ── */}
      <g id="i3-layer4-timing-cavity">
        {/* Front Timing Chain & Oil Pump Housing */}
        <path
          d={`M${startX - 16} ${startY + 28}
             L${startX + 16} ${startY + 46}
             L${startX + 14} ${startY + 78}
             L${startX - 16} ${startY + 65} Z`}
          fill="#090d16"
          stroke="#38bdf8"
          strokeWidth="0.8"
          strokeDasharray="3,2"
        />
        {/* High-Pressure Oil Pump Rotor Port */}
        <circle cx={startX - 2} cy={startY + 50} r="5" fill="#020617" stroke="#334155" strokeWidth="1" />
        <circle cx={startX - 2} cy={startY + 50} r="2.2" fill="url(#photoreal-tin-gold)" />
      </g>

      {/* ── LAYER 5: TOP DECK & 3 HONED CYLINDER BORES ── */}
      <g id="i3-layer5-deck-and-bores">
        {/* CNC Milled Cylinder Head Deck Surface */}
        <path
          d={`M${startX - 20} ${startY + 22}
             L${startX + 115} ${startY - 32}
             L${startX + blockLength + 115} ${startY - 62}
             L${startX + blockLength + 28} ${startY + 16} Z`}
          fill={deckFill}
          stroke="#94a3b8"
          strokeWidth="1.5"
          filter="url(#fe-cnc-toolpath)"
        />

        {/* Deck Outer Chamfer Bevel Highlight */}
        <path
          d={`M${startX - 20} ${startY + 22}
             L${startX + blockLength + 28} ${startY + 16}`}
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* 3 Cylinder Bores with 45° Diamond Plateau Honing */}
        {[0, 1, 2].map((cyl) => {
          const cx = startX + 32 + cyl * borePitch;
          const cy = startY + 14 - cyl * 7.2;

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

              {/* Oil Squitter Cooling Jet */}
              <circle cx={cx - 4} cy={cy + 3} r="1.5" fill="url(#photoreal-oil-gallery)" />
            </g>
          );
        })}
      </g>

      {/* ── LAYER 6: OPEN-DECK WATER JACKET COOLANT PASSAGES ── */}
      <g id="i3-layer6-coolant-passages">
        {[0, 1].map((i) => {
          const wjx = startX + 62 + i * borePitch;
          const wjy = startY + 10 - i * 7.2;
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
      <g id="i3-layer7-oil-gallery">
        <line
          x1={startX - 10}
          y1={startY + 40}
          x2={startX + blockLength + 16}
          y2={startY + 10}
          stroke="url(#photoreal-oil-gallery)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <polygon
          points={`${startX - 12},${startY + 38} ${startX - 8},${startY + 36} ${startX - 6},${startY + 40} ${startX - 8},${startY + 44} ${startX - 12},${startY + 42}`}
          fill="url(#photoreal-tin-gold)"
          stroke="#713f12"
          strokeWidth="0.8"
        />
      </g>

      {/* ── LAYER 8: ASYMMETRIC NVH STRUCTURAL GUSSET RIBS ── */}
      <g id="i3-layer8-nvh-ribs">
        {[0, 1, 2].map((i) => {
          const rx = startX + 32 + i * 60;
          const ry = startY + 48 - i * 7;
          return (
            <g key={`truss-rib-${i}`}>
              <polygon
                points={`${rx},${ry} ${rx + 10},${ry + 1.2} ${rx + 8},${ry + blockHeight - 24} ${rx - 2},${ry + blockHeight - 24}`}
                fill="#334155"
                stroke="#64748b"
                strokeWidth="1"
              />
              <line x1={rx + 1} y1={ry + 2} x2={rx - 1} y2={ry + blockHeight - 25} stroke="#94a3b8" strokeWidth="1" />
            </g>
          );
        })}
      </g>

      {/* ── LAYER 9: 8 RECESSED ARP 12-POINT HEAD STUD BOSSES ── */}
      <g id="i3-layer9-head-studs">
        {[
          { x: startX + 8, y: startY + 28 },
          { x: startX + 68, y: startY + 21 },
          { x: startX + 128, y: startY + 14 },
          { x: startX + 188, y: startY + 7 },
          { x: startX + 54, y: startY - 17 },
          { x: startX + 114, y: startY - 24 },
          { x: startX + 174, y: startY - 31 },
          { x: startX + 234, y: startY - 38 },
        ].map((stud, idx) => (
          <g key={`head-stud-${idx}`}>
            <ellipse cx={stud.x} cy={stud.y} rx="5.5" ry="3.2" fill="url(#photoreal-washer-sheen)" stroke="#475569" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y - 1} r="2.8" fill="url(#photoreal-arp-black-oxide)" stroke="#0f172a" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y - 1} r="1.2" fill="#38bdf8" opacity="0.85" />
          </g>
        ))}
      </g>

      {/* ── LAYER 10: FREEZE PLUGS, KNOCK SENSOR & SERIAL ID ── */}
      <g id="i3-layer10-auxiliary-casting-details">
        {/* Brass Freeze Plugs */}
        {[0, 1].map((i) => {
          const fpx = startX + 64 + i * 60;
          const fpy = startY + 72 - i * 7;
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
          <ellipse cx={startX + 120} cy={startY + 66} rx="6" ry="4" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
          <circle cx={startX + 120} cy={startY + 65} r="2.2" fill="#020617" />
        </g>

        {/* Laser-Etched Engine Casting Serial Tag */}
        <rect
          x={startX + 35}
          y={startY + 82}
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
          y={startY + 92}
          fill="#38bdf8"
          fontSize="6.5"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.8"
        >
          APX-I3-15T
        </text>
      </g>

      {/* ── LAYER 11: SPECULAR EDGE HIGHLIGHTS & FRESNEL GLOW ── */}
      <g id="i3-layer11-specular-highlights" pointerEvents="none">
        <line
          x1={startX - 20}
          y1={startY + 22}
          x2={startX + blockLength + 28}
          y2={startY + 16}
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
          filter="url(#fe-specular-bloom)"
        />
        <line
          x1={startX - 20}
          y1={startY + 22}
          x2={startX - 20}
          y2={startY + blockHeight + 10}
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
      </g>

      {/* ── LAYER 12: REAL-TIME THERMODYNAMIC HEAT SHIMMER ── */}
      {isInstalled && (
        <g id="i3-layer12-combustion-thermal-glow" opacity="0.22" pointerEvents="none">
          <ellipse
            cx={startX + blockLength / 2 + 20}
            cy={startY + 6}
            rx={blockLength * 0.45}
            ry={26}
            fill="url(#photoreal-heat-tint)"
          />
        </g>
      )}
    </g>
  );
};
