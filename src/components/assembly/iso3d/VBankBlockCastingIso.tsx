import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, projectIso60VEllipse } from "./isoMath";

interface VBankBlockCastingIsoProps {
  layoutSpec: {
    label: string;
    cyls: number[];
    width: number;
    bankAngle: string;
    bx: number;
    bw: number;
    bh: number;
    category: string;
    bolts?: { x: number; y: number }[];
  };
  blockState: {
    isInstalled: boolean;
    isActive: boolean;
    isHovered: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  selectedVariants?: Record<string, string>;
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * V12 Engine Block — CNC-Machined High-Performance Aluminium Crankcase Casting
 *
 * 60° V-Angle (30° per bank from vertical) — Ferrari/Lamborghini/BMW geometry
 *
 * 11 SVG Layers (bottom-up):
 *  1. Background shadow
 *  2. Lower crankcase & crankshaft tunnel (7 main bearing webs)
 *  3. Main block casting body (60° V-shaped silhouette)
 *  4. Left cylinder bank (6 bores, angled casting)
 *  5. Right cylinder bank (6 bores, mirrored)
 *  6. Valley (deep V-channel, intake rails, oil galleries)
 *  7. Cylinder bores (12 chamfered openings with depth)
 *  8. Machined surfaces (deck faces, timing cover, transmission flange)
 *  9. Reinforcement ribs (vertical + diagonal structural gussets)
 * 10. Bolts & small details (head bolts, timing cover, oil gallery plugs)
 * 11. Highlights & shadows (specular edges, ambient occlusion)
 *
 * Every surface has realistic casting curvature, machining transitions,
 * bolt bosses, ribs, cylinder bore openings and deep valley geometry.
 */
export const VBankBlockCastingIso: React.FC<VBankBlockCastingIsoProps> = ({
  blockState,
  onHoverComponent,
}) => {
  const O = { x: 250, y: 215 }; // Canvas origin (100% sync with assembly)

  // ─── PRIMARY DIMENSIONS ───
  // Block length:height ratio ≈ 3:1 (realistic V12 proportions)
  const BL = 230;     // Block Length along X-axis (crank centerline)
  const halfL = BL / 2; // 115

  // 60° V-angle TRUE Y-SHAPE GEOMETRY:
  // Top cylinder banks branch UPWARD and OUTWARD (Y = ±88, Z = 175) to form the top V-arms of Y
  // Central valley junction sits deep in the middle (Y = ±14, Z = 135)
  // Lower crankcase narrows INWARD (Y = ±32, Z = 20..110) to form the narrow bottom stem of Y
  const BANK_OUTER_Y = 88;    // Wide flared top arms of Y
  const BANK_INNER_Y = 14;    // Inner valley junction
  const BANK_OUTER_Z = 175;   // Top outer deck height (HIGH)
  const BANK_INNER_Z = 135;   // Inner valley deck height (LOW/DEEP)

  // Crankcase: Z=20 (pan rail) to Z=110 (bank base waist)
  const CRANK_Z_BOT = 20;     // Oil pan mounting rail
  const CRANK_Z_TOP = 110;    // Waist where banks meet crankcase
  const CRANK_Y_OUTER = 32;   // Narrow crankcase base rail (bottom stem of Y)
  const CRANK_Y_TOP = 42;     // Waist where banks meet crankcase
  const CRANK_Y_NARROW = 26;  // Narrowing at mid-section

  // Valley floor sits above crankshaft
  const VALLEY_Z = 125;

  // Front/rear taper
  const FRONT_TAPER = 6;  // Front narrower by this much
  const REAR_TAPER = 4;

  // ─── HELPER: Project shorthand ───
  const P = (x: number, y: number, z: number) => projectIso({ x, y, z }, O);

  // ═══════════════════════════════════════════════════════════════════
  // PRE-COMPUTED CORNER COORDINATES
  // ═══════════════════════════════════════════════════════════════════

  // Crankcase base rail corners (Z = CRANK_Z_BOT) — Narrow bottom shaft of Y
  const cbFL = P(-halfL, CRANK_Y_OUTER, CRANK_Z_BOT);
  const cbFR = P(halfL, CRANK_Y_OUTER, CRANK_Z_BOT);
  const cbBL = P(-halfL, -CRANK_Y_OUTER, CRANK_Z_BOT);
  const cbBR = P(halfL, -CRANK_Y_OUTER, CRANK_Z_BOT);

  // Crankcase top rail corners (Z = CRANK_Z_TOP) — Waist where banks meet
  const ctFL = P(-halfL, CRANK_Y_TOP, CRANK_Z_TOP);
  const ctFR = P(halfL, CRANK_Y_TOP, CRANK_Z_TOP);
  const ctBL = P(-halfL, -CRANK_Y_TOP, CRANK_Z_TOP);
  const ctBR = P(halfL, -CRANK_Y_TOP, CRANK_Z_TOP);

  // Crankcase mid-narrowing (Z ≈ 60, Y narrower)
  const cmFL = P(-halfL, CRANK_Y_NARROW, 60);
  const cmFR = P(halfL, CRANK_Y_NARROW, 60);
  const cmBL = P(-halfL, -CRANK_Y_NARROW, 60);
  const cmBR = P(halfL, -CRANK_Y_NARROW, 60);

  // Left bank deck corners
  const lbOuterFL = P(-halfL, BANK_OUTER_Y, BANK_OUTER_Z);
  const lbOuterFR = P(halfL, BANK_OUTER_Y, BANK_OUTER_Z);
  const lbInnerFL = P(-halfL, BANK_INNER_Y, BANK_INNER_Z);
  const lbInnerFR = P(halfL, BANK_INNER_Y, BANK_INNER_Z);

  // Right bank deck corners
  const rbOuterFL = P(-halfL, -BANK_OUTER_Y, BANK_OUTER_Z);
  const rbOuterFR = P(halfL, -BANK_OUTER_Y, BANK_OUTER_Z);
  const rbInnerFL = P(-halfL, -BANK_INNER_Y, BANK_INNER_Z);
  const rbInnerFR = P(halfL, -BANK_INNER_Y, BANK_INNER_Z);

  // Valley floor corners
  const vfFL = P(-halfL, 14, VALLEY_Z);
  const vfFR = P(halfL, 14, VALLEY_Z);
  const vfBL = P(-halfL, -14, VALLEY_Z);
  const vfBR = P(halfL, -14, VALLEY_Z);

  // ═══════════════════════════════════════════════════════════════════
  // CYLINDER BORE POSITIONS (6 per bank, equal spacing)
  // ═══════════════════════════════════════════════════════════════════
  const BORE_SPACING = 34;
  const BORE_START_X = -85;
  const BORE_RADIUS = 15;

  const borePositions = Array.from({ length: 6 }, (_, i) => BORE_START_X + i * BORE_SPACING);

  // Left bank bore center: Y=+51, Z=155 (on upward-sloping tilted deck plane)
  // Right bank bore center: Y=-51, Z=155
  const LEFT_BORE_Y = 51;
  const LEFT_BORE_Z = 155;
  const RIGHT_BORE_Y = -51;
  const RIGHT_BORE_Z = 155;

  return (
    <g
      id="iso-v12-engine-block-60deg"
      onMouseEnter={() => onHoverComponent?.("block")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className={`cursor-pointer transition-all duration-700 ease-out ${
        blockState.isActive ? "filter-glow-active" : ""
      }`}
      style={{
        transform: `translate(${blockState.offsetX}px, ${blockState.offsetY}px)`,
        opacity: blockState.opacity,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LAYER 1: 3D ISOMETRIC GLASS DISPLAY PLATFORM & MOUNTING STAND */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <g id="layer-1-glass-platform">
        {/* Soft shadow underneath glass platform */}
        <ellipse
          cx={O.x + 10}
          cy={O.y + 120}
          rx={200}
          ry={55}
          fill="#000000"
          opacity="0.3"
          filter="url(#soft-ao-shadow)"
        />

        {/* 3D Glass Display Table Base - Isometric Plinth */}
        {(() => {
          // Glass platform coordinates in 3D: Z = -45 to -35, spanning beyond engine
          const tableXMin = -halfL - 55;
          const tableXMax = halfL + 75;
          const tableYMin = -115;
          const tableYMax = 115;
          const tableZTop = -35;
          const tableZBot = -45;

          const gTL = P(tableXMin, tableYMin, tableZTop);
          const gTR = P(tableXMax, tableYMin, tableZTop);
          const gBR = P(tableXMax, tableYMax, tableZTop);
          const gBL = P(tableXMin, tableYMax, tableZTop);

          const bTL = P(tableXMin, tableYMin, tableZBot);
          const bTR = P(tableXMax, tableYMin, tableZBot);
          const bBR = P(tableXMax, tableYMax, tableZBot);
          const bBL = P(tableXMin, tableYMax, tableZBot);

          // Engine mounting pedestal feet
          const footFrontL = P(halfL - 10, 42, CRANK_Z_BOT);
          const footFrontLBot = P(halfL - 10, 42, tableZTop);
          const footRearL = P(-halfL + 25, 42, CRANK_Z_BOT);
          const footRearLBot = P(-halfL + 25, 42, tableZTop);

          return (
            <g id="glass-table-plinth">
              {/* Table Bottom Rim & Chamfer Thickness */}
              <polygon
                points={`${gBL.x},${gBL.y} ${gBR.x},${gBR.y} ${bBR.x},${bBR.y} ${bBL.x},${bBL.y}`}
                fill="url(#glass-platform-edge)"
                stroke="#0284c7"
                strokeWidth="1.2"
                opacity="0.85"
              />
              <polygon
                points={`${gBR.x},${gBR.y} ${gTR.x},${gTR.y} ${bTR.x},${bTR.y} ${bBR.x},${bBR.y}`}
                fill="url(#v12-cast-aluminum-body-right)"
                stroke="#0369a1"
                strokeWidth="1.2"
                opacity="0.75"
              />

              {/* Table Glass Top Surface (Semi-transparent with refraction gradient) */}
              <polygon
                points={`${gTL.x},${gTL.y} ${gTR.x},${gTR.y} ${gBR.x},${gBR.y} ${gBL.x},${gBL.y}`}
                fill="url(#glass-platform-surface)"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeOpacity="0.9"
              />

              {/* Polished Glass Outer Bevel Perimeter Streak */}
              <polyline
                points={`${gTL.x},${gTL.y} ${gBL.x},${gBL.y} ${gBR.x},${gBR.y}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.95"
              />
              <polyline
                points={`${gTL.x},${gTL.y} ${gTR.x},${gTR.y} ${gBR.x},${gBR.y}`}
                fill="none"
                stroke="#7dd3fc"
                strokeWidth="1.2"
                opacity="0.7"
              />

              {/* Engine Mounting Standoff Brackets (CNC Polished Aluminum Feet) */}
              <g id="engine-mounting-brackets">
                {/* Front Mount Leg */}
                <path
                  d={`M ${footFrontL.x - 8} ${footFrontL.y} L ${footFrontL.x + 8} ${footFrontL.y} L ${footFrontLBot.x + 14} ${footFrontLBot.y} L ${footFrontLBot.x - 14} ${footFrontLBot.y} Z`}
                  fill="url(#v12-cast-aluminum-body)"
                  stroke="#090d16"
                  strokeWidth="1.5"
                />
                <circle cx={footFrontLBot.x - 7} cy={footFrontLBot.y - 2} r="2.5" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.8" />
                <circle cx={footFrontLBot.x + 7} cy={footFrontLBot.y - 2} r="2.5" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.8" />

                {/* Rear Mount Leg */}
                <path
                  d={`M ${footRearL.x - 8} ${footRearL.y} L ${footRearL.x + 8} ${footRearL.y} L ${footRearLBot.x + 14} ${footRearLBot.y} L ${footRearLBot.x - 14} ${footRearLBot.y} Z`}
                  fill="url(#v12-cast-aluminum-body)"
                  stroke="#090d16"
                  strokeWidth="1.5"
                />
                <circle cx={footRearLBot.x - 7} cy={footRearLBot.y - 2} r="2.5" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.8" />
                <circle cx={footRearLBot.x + 7} cy={footRearLBot.y - 2} r="2.5" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.8" />
              </g>
            </g>
          );
        })()}
      </g>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LAYER 2: LOWER CRANKCASE & CRANKSHAFT TUNNEL                 */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <g id="layer-2-crankcase">
        {/* Bottom slab face (oil pan rail) */}
        <polygon
          points={`${cbFL.x},${cbFL.y} ${cbFR.x},${cbFR.y} ${cbBR.x},${cbBR.y} ${cbBL.x},${cbBL.y}`}
          fill="#0f172a"
          stroke="#090d16"
          strokeWidth="1.8"
        />

        {/* Front face of crankcase — curved profile via path */}
        {/* Uses: base rail → mid-narrowing → bank base = realistic casting taper */}
        <path
          d={`M ${cbFL.x} ${cbFL.y}
              L ${cbFR.x} ${cbFR.y}
              L ${cmFR.x} ${cmFR.y}
              L ${ctFR.x} ${ctFR.y}
              L ${ctFL.x} ${ctFL.y}
              L ${cmFL.x} ${cmFL.y}
              Z`}
          fill="url(#v12-crankcase-deep)"
          stroke="#090d16"
          strokeWidth="2.2"
        />

        {/* Right side face of crankcase (visible in isometric view) */}
        <path
          d={`M ${cbFR.x} ${cbFR.y}
              L ${cbBR.x} ${cbBR.y}
              L ${cmBR.x} ${cmBR.y}
              L ${ctBR.x} ${ctBR.y}
              L ${ctFR.x} ${ctFR.y}
              L ${cmFR.x} ${cmFR.y}
              Z`}
          fill="url(#v12-crankcase-deep-right)"
          stroke="#090d16"
          strokeWidth="2.2"
        />

        {/* Crankshaft tunnel longitudinal bulge (central axis) */}
        {(() => {
          const tunnelFL = P(-halfL, 22, 45);
          const tunnelFR = P(halfL, 22, 45);
          const tunnelBL = P(-halfL, -22, 45);
          const tunnelBR = P(halfL, -22, 45);
          const tunnelTopFL = P(-halfL, 22, 75);
          const tunnelTopFR = P(halfL, 22, 75);
          return (
            <g id="crankshaft-tunnel-bulge">
              {/* Tunnel front face */}
              <polygon
                points={`${tunnelFL.x},${tunnelFL.y} ${tunnelFR.x},${tunnelFR.y} ${tunnelTopFR.x},${tunnelTopFR.y} ${tunnelTopFL.x},${tunnelTopFL.y}`}
                fill="url(#v12-cast-aluminum-body)"
                stroke="#090d16"
                strokeWidth="1.5"
                opacity="0.7"
              />
              {/* Tunnel right face */}
              <polygon
                points={`${tunnelFR.x},${tunnelFR.y} ${tunnelBR.x},${tunnelBR.y} ${P(halfL, -22, 75).x},${P(halfL, -22, 75).y} ${tunnelTopFR.x},${tunnelTopFR.y}`}
                fill="url(#v12-cast-aluminum-body-right)"
                stroke="#090d16"
                strokeWidth="1.5"
                opacity="0.6"
              />
            </g>
          );
        })()}

        {/* 7 Main Bearing Saddle Webs — semi-circular arches spanning tunnel */}
        {Array.from({ length: 7 }).map((_, idx) => {
          const webX = -90 + idx * 30;
          const webCenter = P(webX, 0, 58);
          const webTopL = P(webX, 18, 82);
          const webTopR = P(webX, -18, 82);
          return (
            <g key={`main-bearing-web-${idx}`}>
              {/* Structural web arch */}
              <path
                d={`M ${webTopL.x} ${webTopL.y}
                    Q ${webCenter.x} ${webCenter.y + 16} ${webTopR.x} ${webTopR.y}
                    L ${webTopR.x} ${webTopR.y - 4}
                    Q ${webCenter.x} ${webCenter.y + 10} ${webTopL.x} ${webTopL.y - 4}
                    Z`}
                fill="url(#v12-bearing-cap)"
                stroke="#090d16"
                strokeWidth="1.4"
              />
              {/* Main bearing saddle opening */}
              <ellipse
                cx={webCenter.x}
                cy={webCenter.y + 3}
                rx={10}
                ry={5.5}
                fill="url(#v12-crank-tunnel-bore)"
                stroke="#090d16"
                strokeWidth="1.5"
              />
              {/* Bearing cap bolt studs (2 per web) */}
              <circle cx={webCenter.x - 7} cy={webCenter.y + 10} r="2" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.8" />
              <circle cx={webCenter.x + 7} cy={webCenter.y + 10} r="2" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.8" />
              {/* Cross-drilled oil gallery hole */}
              <circle cx={webCenter.x} cy={webCenter.y - 2} r="1.5" fill="#020617" stroke="#475569" strokeWidth="0.6" />
            </g>
          );
        })}
      </g>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LAYER 3: MAIN BLOCK CASTING BODY (TRUE Y-SHAPED SILHOUETTE)    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <g id="layer-3-main-casting">
        {/* Front face: Distinctive Y-shaped profile from wide top bank decks down to narrow crankcase base */}
        <path
          d={`M ${cbFL.x} ${cbFL.y}
              L ${cmFL.x} ${cmFL.y}
              L ${ctFL.x} ${ctFL.y}
              L ${lbOuterFL.x} ${lbOuterFL.y}
              L ${lbInnerFL.x} ${lbInnerFL.y}
              L ${rbInnerFL.x} ${rbInnerFL.y}
              L ${rbOuterFL.x} ${rbOuterFL.y}
              L ${ctFR.x} ${ctFR.y}
              L ${cmFR.x} ${cmFR.y}
              L ${cbFR.x} ${cbFR.y}
              Z`}
          fill="url(#v12-cast-aluminum-body)"
          stroke="#0f172a"
          strokeWidth="2.8"
        />

        {/* Right side face: outer crankcase wall from base to right bank outer edge */}
        <polygon
          points={`
            ${cbFR.x},${cbFR.y}
            ${cbBR.x},${cbBR.y}
            ${rbOuterFR.x},${rbOuterFR.y}
            ${rbOuterFL.x},${rbOuterFL.y}
          `}
          fill="url(#v12-cast-aluminum-body-right)"
          stroke="#0f172a"
          strokeWidth="2.4"
        />

        {/* Left side top face: transition from narrow crankcase waist to wide left bank */}
        <polygon
          points={`
            ${cbFL.x},${cbFL.y}
            ${cbFR.x},${cbFR.y}
            ${lbOuterFR.x},${lbOuterFR.y}
            ${lbOuterFL.x},${lbOuterFL.y}
          `}
          fill="url(#v12-cast-aluminum-body)"
          stroke="#0f172a"
          strokeWidth="2"
          opacity="0.85"
        />
      </g>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LAYER 4: LEFT CYLINDER BANK (6 bores, angled outward 30°)    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <g id="layer-4-left-bank">
        {/* Left bank deck surface (angled machined face) */}
        <polygon
          points={`
            ${lbOuterFL.x},${lbOuterFL.y}
            ${lbOuterFR.x},${lbOuterFR.y}
            ${lbInnerFR.x},${lbInnerFR.y}
            ${lbInnerFL.x},${lbInnerFL.y}
          `}
          fill="url(#v12-machined-deck)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        {/* Specular highlight on deck chamfer */}
        <polygon
          points={`
            ${lbOuterFL.x + 2},${lbOuterFL.y}
            ${lbOuterFR.x - 2},${lbOuterFR.y}
            ${lbInnerFR.x - 2},${lbInnerFR.y}
            ${lbInnerFL.x + 2},${lbInnerFL.y}
          `}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
          opacity="0.75"
        />

        {/* Scalloped bore profile bumps on left deck outer edge */}
        {borePositions.map((bx, idx) => {
          const scallop = projectIso60VEllipse(
            { x: bx, y: LEFT_BORE_Y, z: LEFT_BORE_Z },
            BORE_RADIUS + 6, "left", O
          );
          return (
            <ellipse
              key={`left-scallop-${idx}`}
              cx={scallop.cx}
              cy={scallop.cy}
              rx={scallop.rx + 3}
              ry={scallop.ry + 2}
              fill="url(#v12-machined-deck)"
              stroke="#090d16"
              strokeWidth="1.2"
              opacity="0.55"
              transform={`rotate(${scallop.tiltDeg}, ${scallop.cx}, ${scallop.cy})`}
            />
          );
        })}

        {/* Left bank outer wall (casting bulge around cylinders) */}
        {borePositions.map((bx, idx) => {
          const bulgeOuter = P(bx, BANK_OUTER_Y + 4, BANK_OUTER_Z + 8);
          const bulgeInner = P(bx, BANK_OUTER_Y - 6, BANK_OUTER_Z + 25);
          return (
            <ellipse
              key={`left-bank-bulge-${idx}`}
              cx={(bulgeOuter.x + bulgeInner.x) / 2}
              cy={(bulgeOuter.y + bulgeInner.y) / 2}
              rx={14}
              ry={18}
              fill="url(#v12-cast-aluminum-body)"
              stroke="#090d16"
              strokeWidth="1"
              opacity="0.3"
              transform={`rotate(-25, ${(bulgeOuter.x + bulgeInner.x) / 2}, ${(bulgeOuter.y + bulgeInner.y) / 2})`}
            />
          );
        })}
      </g>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LAYER 5: RIGHT CYLINDER BANK (6 bores, mirrored)             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <g id="layer-5-right-bank">
        {/* Right bank deck surface (angled machined face) */}
        <polygon
          points={`
            ${rbOuterFL.x},${rbOuterFL.y}
            ${rbOuterFR.x},${rbOuterFR.y}
            ${rbInnerFR.x},${rbInnerFR.y}
            ${rbInnerFL.x},${rbInnerFL.y}
          `}
          fill="url(#v-deck-surface-right)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        {/* Specular highlight on right deck chamfer */}
        <polygon
          points={`
            ${rbOuterFL.x + 2},${rbOuterFL.y}
            ${rbOuterFR.x - 2},${rbOuterFR.y}
            ${rbInnerFR.x - 2},${rbInnerFR.y}
            ${rbInnerFL.x + 2},${rbInnerFL.y}
          `}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
          opacity="0.6"
        />

        {/* Scalloped bore profile bumps on right deck outer edge */}
        {borePositions.map((bx, idx) => {
          const scallop = projectIso60VEllipse(
            { x: bx, y: RIGHT_BORE_Y, z: RIGHT_BORE_Z },
            BORE_RADIUS + 6, "right", O
          );
          return (
            <ellipse
              key={`right-scallop-${idx}`}
              cx={scallop.cx}
              cy={scallop.cy}
              rx={scallop.rx + 3}
              ry={scallop.ry + 2}
              fill="url(#v-deck-surface-right)"
              stroke="#090d16"
              strokeWidth="1.2"
              opacity="0.45"
              transform={`rotate(${scallop.tiltDeg}, ${scallop.cx}, ${scallop.cy})`}
            />
          );
        })}

        {/* Right bank casting bulges */}
        {borePositions.map((bx, idx) => {
          const bulgeOuter = P(bx, -BANK_OUTER_Y - 4, BANK_OUTER_Z + 8);
          const bulgeInner = P(bx, -BANK_OUTER_Y + 6, BANK_OUTER_Z + 25);
          return (
            <ellipse
              key={`right-bank-bulge-${idx}`}
              cx={(bulgeOuter.x + bulgeInner.x) / 2}
              cy={(bulgeOuter.y + bulgeInner.y) / 2}
              rx={14}
              ry={18}
              fill="url(#v12-cast-aluminum-body-right)"
              stroke="#090d16"
              strokeWidth="1"
              opacity="0.25"
              transform={`rotate(30, ${(bulgeOuter.x + bulgeInner.x) / 2}, ${(bulgeOuter.y + bulgeInner.y) / 2})`}
            />
          );
        })}
      </g>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LAYER 6: VALLEY (deep V-channel between banks)               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <g id="layer-6-valley">
        {/* Valley floor surface (darker due to shadow depth) */}
        <polygon
          points={`${vfFL.x},${vfFL.y} ${vfFR.x},${vfFR.y} ${vfBR.x},${vfBR.y} ${vfBL.x},${vfBL.y}`}
          fill="url(#v12-valley-shadow)"
          stroke="#090d16"
          strokeWidth="2"
        />

        {/* Valley left wall (from left bank inner edge down to valley floor) */}
        <polygon
          points={`
            ${lbInnerFL.x},${lbInnerFL.y}
            ${lbInnerFR.x},${lbInnerFR.y}
            ${vfFR.x},${vfFR.y}
            ${vfFL.x},${vfFL.y}
          `}
          fill="url(#v12-cast-aluminum-body)"
          stroke="#090d16"
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Valley right wall */}
        <polygon
          points={`
            ${rbInnerFL.x},${rbInnerFL.y}
            ${rbInnerFR.x},${rbInnerFR.y}
            ${vfBR.x},${vfBR.y}
            ${vfBL.x},${vfBL.y}
          `}
          fill="url(#v12-cast-aluminum-body-right)"
          stroke="#090d16"
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* Raised intake mounting rails along valley edges */}
        {/* Left rail */}
        <line
          x1={vfFL.x + 4} y1={vfFL.y - 2}
          x2={vfFR.x + 4} y2={vfFR.y - 2}
          stroke="#7a8da6"
          strokeWidth="2.5"
          opacity="0.6"
        />
        {/* Right rail */}
        <line
          x1={vfBL.x - 2} y1={vfBL.y - 2}
          x2={vfBR.x - 2} y2={vfBR.y - 2}
          stroke="#5d7090"
          strokeWidth="2.5"
          opacity="0.5"
        />

        {/* Valley bolt holes (intake manifold mounting) — 8 positions */}
        {[-80, -45, -10, 25, 60, 95].map((bx, idx) => {
          const boltPt = P(-halfL + 25 + idx * 30, 0, VALLEY_Z + 2);
          return (
            <g key={`valley-bolt-${idx}`}>
              <circle cx={boltPt.x} cy={boltPt.y} r="2.8" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.8" />
              <circle cx={boltPt.x} cy={boltPt.y} r="1.3" fill="#020617" />
            </g>
          );
        })}

        {/* Oil gallery drainback passages in valley floor */}
        {[-60, -15, 30, 75].map((gx, idx) => {
          const galleryL = P(-halfL + 30 + idx * 38, 8, VALLEY_Z + 1);
          const galleryR = P(-halfL + 30 + idx * 38, -8, VALLEY_Z + 1);
          return (
            <g key={`valley-oil-gallery-${idx}`}>
              <circle cx={galleryL.x} cy={galleryL.y} r="2.5" fill="#020617" stroke="#475569" strokeWidth="0.7" />
              <circle cx={galleryR.x} cy={galleryR.y} r="2.5" fill="#020617" stroke="#475569" strokeWidth="0.7" />
            </g>
          );
        })}
      </g>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LAYER 7: CYLINDER BORES (12 chamfered openings with depth)    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <g id="layer-7-cylinder-bores">
        {/* LEFT BANK — 6 bores */}
        {borePositions.map((bx, idx) => {
          const bore = projectIso60VEllipse(
            { x: bx, y: LEFT_BORE_Y, z: LEFT_BORE_Z },
            BORE_RADIUS, "left", O
          );
          return (
            <g key={`left-bore-${idx}`}>
              {/* Outer machined collar ring */}
              <ellipse
                cx={bore.cx} cy={bore.cy}
                rx={bore.rx + 5} ry={bore.ry + 3.2}
                fill="url(#bore-wall-thickness)"
                stroke="#090d16"
                strokeWidth="1.8"
                transform={`rotate(${bore.tiltDeg}, ${bore.cx}, ${bore.cy})`}
              />
              {/* Chamfered bevel edge */}
              <ellipse
                cx={bore.cx} cy={bore.cy}
                rx={bore.rx + 2.5} ry={bore.ry + 1.5}
                fill="none"
                stroke="#c8d2e0"
                strokeWidth="1.2"
                opacity="0.7"
                transform={`rotate(${bore.tiltDeg}, ${bore.cx}, ${bore.cy})`}
              />
              {/* Deep bore interior */}
              <ellipse
                cx={bore.cx} cy={bore.cy}
                rx={bore.rx} ry={bore.ry}
                fill="url(#bore-3d-depth)"
                stroke="#090d16"
                strokeWidth="2"
                transform={`rotate(${bore.tiltDeg}, ${bore.cx}, ${bore.cy})`}
              />
              {/* Honing cross-hatch texture inside bore */}
              <ellipse
                cx={bore.cx} cy={bore.cy}
                rx={bore.rx - 1.5} ry={bore.ry - 1}
                fill="url(#honing-crosshatch-pattern)"
                stroke="none"
                opacity="0.4"
                transform={`rotate(${bore.tiltDeg}, ${bore.cx}, ${bore.cy})`}
              />
              {/* Specular highlight ring on bore lip */}
              <ellipse
                cx={bore.cx} cy={bore.cy}
                rx={bore.rx - 0.5} ry={bore.ry - 0.3}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                opacity="0.85"
                transform={`rotate(${bore.tiltDeg}, ${bore.cx}, ${bore.cy})`}
              />
            </g>
          );
        })}

        {/* RIGHT BANK — 6 bores */}
        {borePositions.map((bx, idx) => {
          const bore = projectIso60VEllipse(
            { x: bx, y: RIGHT_BORE_Y, z: RIGHT_BORE_Z },
            BORE_RADIUS, "right", O
          );
          return (
            <g key={`right-bore-${idx}`}>
              {/* Outer machined collar ring */}
              <ellipse
                cx={bore.cx} cy={bore.cy}
                rx={bore.rx + 5} ry={bore.ry + 3.2}
                fill="url(#bore-wall-thickness)"
                stroke="#090d16"
                strokeWidth="1.8"
                transform={`rotate(${bore.tiltDeg}, ${bore.cx}, ${bore.cy})`}
              />
              {/* Chamfered bevel edge */}
              <ellipse
                cx={bore.cx} cy={bore.cy}
                rx={bore.rx + 2.5} ry={bore.ry + 1.5}
                fill="none"
                stroke="#a0afc4"
                strokeWidth="1.2"
                opacity="0.6"
                transform={`rotate(${bore.tiltDeg}, ${bore.cx}, ${bore.cy})`}
              />
              {/* Deep bore interior */}
              <ellipse
                cx={bore.cx} cy={bore.cy}
                rx={bore.rx} ry={bore.ry}
                fill="url(#bore-3d-depth)"
                stroke="#090d16"
                strokeWidth="2"
                transform={`rotate(${bore.tiltDeg}, ${bore.cx}, ${bore.cy})`}
              />
              {/* Honing cross-hatch texture */}
              <ellipse
                cx={bore.cx} cy={bore.cy}
                rx={bore.rx - 1.5} ry={bore.ry - 1}
                fill="url(#honing-crosshatch-pattern)"
                stroke="none"
                opacity="0.35"
                transform={`rotate(${bore.tiltDeg}, ${bore.cx}, ${bore.cy})`}
              />
              {/* Specular highlight ring */}
              <ellipse
                cx={bore.cx} cy={bore.cy}
                rx={bore.rx - 0.5} ry={bore.ry - 0.3}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                opacity="0.7"
                transform={`rotate(${bore.tiltDeg}, ${bore.cx}, ${bore.cy})`}
              />
            </g>
          );
        })}
      </g>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LAYER 8: MACHINED SURFACES (timing cover, transmission)       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <g id="layer-8-machined-surfaces">
        {/* FRONT TIMING COVER INTERFACE (X = +halfL) */}
        {(() => {
          // Timing cover is a rounded area at the front of the engine
          const tcCenter = P(halfL + 5, 0, 75);
          const tcTop = P(halfL + 5, 0, 155);
          // Main crankshaft snout bore
          const crankSnout = P(halfL + 6, 0, 58);
          // Cam drive tunnels
          const camL = P(halfL + 6, 40, 140);
          const camR = P(halfL + 6, -40, 140);
          // Water pump mounting
          const waterPump = P(halfL + 6, 0, 90);

          return (
            <g id="front-timing-cover">
              {/* Timing cover mounting surface outline */}
              <path
                d={`M ${P(halfL + 3, CRANK_Y_OUTER - 5, CRANK_Z_BOT + 8).x} ${P(halfL + 3, CRANK_Y_OUTER - 5, CRANK_Z_BOT + 8).y}
                    L ${P(halfL + 3, CRANK_Y_OUTER - 5, BANK_OUTER_Z).x} ${P(halfL + 3, CRANK_Y_OUTER - 5, BANK_OUTER_Z).y}
                    L ${P(halfL + 3, BANK_INNER_Y, BANK_INNER_Z).x} ${P(halfL + 3, BANK_INNER_Y, BANK_INNER_Z).y}
                    L ${P(halfL + 3, -BANK_INNER_Y, BANK_INNER_Z).x} ${P(halfL + 3, -BANK_INNER_Y, BANK_INNER_Z).y}
                    L ${P(halfL + 3, -CRANK_Y_OUTER + 5, BANK_OUTER_Z).x} ${P(halfL + 3, -CRANK_Y_OUTER + 5, BANK_OUTER_Z).y}
                    L ${P(halfL + 3, -CRANK_Y_OUTER + 5, CRANK_Z_BOT + 8).x} ${P(halfL + 3, -CRANK_Y_OUTER + 5, CRANK_Z_BOT + 8).y}
                    Z`}
                fill="url(#v12-timing-cover-face)"
                stroke="#0f172a"
                strokeWidth="2.5"
              />

              {/* Orange Accent Gasket Border Line (matching reference illustration) */}
              <path
                d={`M ${P(halfL + 4, CRANK_Y_OUTER - 7, CRANK_Z_BOT + 10).x} ${P(halfL + 4, CRANK_Y_OUTER - 7, CRANK_Z_BOT + 10).y}
                    L ${P(halfL + 4, CRANK_Y_OUTER - 7, BANK_OUTER_Z - 2).x} ${P(halfL + 4, CRANK_Y_OUTER - 7, BANK_OUTER_Z - 2).y}
                    L ${P(halfL + 4, BANK_INNER_Y + 2, BANK_INNER_Z - 2).x} ${P(halfL + 4, BANK_INNER_Y + 2, BANK_INNER_Z - 2).y}
                    L ${P(halfL + 4, -BANK_INNER_Y - 2, BANK_INNER_Z - 2).x} ${P(halfL + 4, -BANK_INNER_Y - 2, BANK_INNER_Z - 2).y}
                    L ${P(halfL + 4, -CRANK_Y_OUTER + 7, BANK_OUTER_Z - 2).x} ${P(halfL + 4, -CRANK_Y_OUTER + 7, BANK_OUTER_Z - 2).y}
                    L ${P(halfL + 4, -CRANK_Y_OUTER + 7, CRANK_Z_BOT + 10).x} ${P(halfL + 4, -CRANK_Y_OUTER + 7, CRANK_Z_BOT + 10).y}`}
                fill="none"
                stroke="url(#orange-gasket-line)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Main crankshaft snout tunnel bore */}
              <circle cx={crankSnout.x} cy={crankSnout.y} r="16" fill="url(#bearing-saddle-chrome)" stroke="#0f172a" strokeWidth="2.5" />
              <circle cx={crankSnout.x} cy={crankSnout.y} r="11" fill="#020617" stroke="#38bdf8" strokeWidth="1.8" />
              <circle cx={crankSnout.x} cy={crankSnout.y} r="15" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />

              {/* Dual cam drive shaft tunnels */}
              <circle cx={camL.x} cy={camL.y} r="10" fill="url(#bearing-saddle-chrome)" stroke="#0f172a" strokeWidth="2" />
              <circle cx={camL.x} cy={camL.y} r="6.5" fill="#020617" stroke="#cbd5e1" strokeWidth="1.2" />
              <circle cx={camR.x} cy={camR.y} r="10" fill="url(#bearing-saddle-chrome)" stroke="#0f172a" strokeWidth="2" />
              <circle cx={camR.x} cy={camR.y} r="6.5" fill="#020617" stroke="#cbd5e1" strokeWidth="1.2" />

              {/* Yellow Ball-Loop Dipstick Handle (protruding at front right) */}
              {(() => {
                const dipTop = P(halfL + 12, -CRANK_Y_OUTER - 10, 85);
                const dipTube = P(halfL + 2, -CRANK_Y_OUTER - 2, 45);
                return (
                  <g id="yellow-dipstick-handle">
                    <line x1={dipTube.x} y1={dipTube.y} x2={dipTop.x} y2={dipTop.y} stroke="url(#gold-anodized-bolt)" strokeWidth="3" strokeLinecap="round" />
                    <circle cx={dipTop.x} cy={dipTop.y} r="6" fill="url(#yellow-dipstick-accent)" stroke="#78350f" strokeWidth="1.5" />
                    <circle cx={dipTop.x} cy={dipTop.y} r="2.5" fill="#020617" />
                  </g>
                );
              })()}

              {/* Water pump bore */}
              <circle cx={waterPump.x} cy={waterPump.y} r="8" fill="url(#water-jacket-opening)" stroke="#0f172a" strokeWidth="1.8" />
              <circle cx={waterPump.x} cy={waterPump.y} r="5" fill="#020617" stroke="#0e7490" strokeWidth="1" />

              {/* Timing cover perimeter bolt circle (10 bolts) */}
              {[-70, -50, -30, -10, 10, 30, 50, 70].map((fy, fIdx) => {
                const boltPt = P(halfL + 5, fy * 0.9, 42 + Math.abs(fy) * 0.8);
                return (
                  <g key={`timing-bolt-${fIdx}`}>
                    <circle cx={boltPt.x} cy={boltPt.y} r="2.5" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.8" />
                    <circle cx={boltPt.x} cy={boltPt.y} r="1.1" fill="#020617" />
                  </g>
                );
              })}
            </g>
          );
        })()}

        {/* REAR TRANSMISSION FLANGE (X = -halfL) */}
        {(() => {
          const rearCenter = P(-halfL - 3, 0, 58);
          return (
            <g id="rear-transmission-flange">
              {/* Flat machined transmission mounting face — only visible as a thin strip on front */}
              <path
                d={`M ${P(-halfL - 2, CRANK_Y_OUTER - 10, CRANK_Z_BOT + 5).x} ${P(-halfL - 2, CRANK_Y_OUTER - 10, CRANK_Z_BOT + 5).y}
                    L ${P(-halfL - 2, CRANK_Y_OUTER - 10, BANK_OUTER_Z - 5).x} ${P(-halfL - 2, CRANK_Y_OUTER - 10, BANK_OUTER_Z - 5).y}
                    L ${P(-halfL - 2, -CRANK_Y_OUTER + 10, BANK_OUTER_Z - 5).x} ${P(-halfL - 2, -CRANK_Y_OUTER + 10, BANK_OUTER_Z - 5).y}
                    L ${P(-halfL - 2, -CRANK_Y_OUTER + 10, CRANK_Z_BOT + 5).x} ${P(-halfL - 2, -CRANK_Y_OUTER + 10, CRANK_Z_BOT + 5).y}
                    Z`}
                fill="url(#v12-transmission-flange)"
                stroke="#090d16"
                strokeWidth="1.5"
                opacity="0.5"
              />
              {/* Crankshaft exit bore */}
              <circle cx={rearCenter.x} cy={rearCenter.y} r="14" fill="url(#bearing-saddle-chrome)" stroke="#090d16" strokeWidth="1.8" opacity="0.6" />
              <circle cx={rearCenter.x} cy={rearCenter.y} r="9" fill="#020617" stroke="#475569" strokeWidth="1.2" opacity="0.6" />
              {/* Transmission bolt holes (6-bolt pattern) */}
              {[-55, -30, 0, 30, 55].map((ty, tIdx) => {
                const tbolt = P(-halfL - 2, ty * 0.7, 40 + Math.abs(ty) * 0.5);
                return (
                  <circle
                    key={`trans-bolt-${tIdx}`}
                    cx={tbolt.x} cy={tbolt.y}
                    r="2.2"
                    fill="#020617"
                    stroke="#475569"
                    strokeWidth="0.8"
                    opacity="0.5"
                  />
                );
              })}
            </g>
          );
        })()}
      </g>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LAYER 9: REINFORCEMENT RIBS (vertical + diagonal gussets)     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <g id="layer-9-ribs">
        {/* 3D TRAPEZOIDAL RIB POCKETS on right (visible) crankcase wall — 7 pockets */}
        {Array.from({ length: 7 }).map((_, idx) => {
          const ribX = -80 + idx * 26;
          const ribW = 8;
          const ribD = 3; // depth offset for 3D face
          // 4-corner pocket outline
          const pTL = P(ribX - ribW, -CRANK_Y_OUTER - 0.5, CRANK_Z_TOP - 12);
          const pTR = P(ribX + ribW, -CRANK_Y_OUTER - 0.5, CRANK_Z_TOP - 12);
          const pBL = P(ribX - ribW, -CRANK_Y_OUTER - 0.5, CRANK_Z_BOT + 10);
          const pBR = P(ribX + ribW, -CRANK_Y_OUTER - 0.5, CRANK_Z_BOT + 10);
          // Inner recess (slightly inset)
          const rTL = P(ribX - ribW + ribD, -CRANK_Y_OUTER + 1, CRANK_Z_TOP - 15);
          const rTR = P(ribX + ribW - ribD, -CRANK_Y_OUTER + 1, CRANK_Z_TOP - 15);
          const rBL = P(ribX - ribW + ribD, -CRANK_Y_OUTER + 1, CRANK_Z_BOT + 13);
          const rBR = P(ribX + ribW - ribD, -CRANK_Y_OUTER + 1, CRANK_Z_BOT + 13);
          return (
            <g key={`rib-pocket-right-${idx}`}>
              {/* Outer rib border */}
              <polygon
                points={`${pTL.x},${pTL.y} ${pTR.x},${pTR.y} ${pBR.x},${pBR.y} ${pBL.x},${pBL.y}`}
                fill="url(#rib-face-mid)"
                stroke="#090d16"
                strokeWidth="1.3"
                opacity="0.6"
              />
              {/* Recessed inner pocket (darker) */}
              <polygon
                points={`${rTL.x},${rTL.y} ${rTR.x},${rTR.y} ${rBR.x},${rBR.y} ${rBL.x},${rBL.y}`}
                fill="#0f172a"
                stroke="#090d16"
                strokeWidth="0.9"
                opacity="0.65"
              />
              {/* Top bevel face (light catch) */}
              <polygon
                points={`${pTL.x},${pTL.y} ${pTR.x},${pTR.y} ${rTR.x},${rTR.y} ${rTL.x},${rTL.y}`}
                fill="url(#rib-face-light)"
                stroke="none"
                opacity="0.4"
              />
              {/* Left bevel face (shadow) */}
              <polygon
                points={`${pTL.x},${pTL.y} ${pBL.x},${pBL.y} ${rBL.x},${rBL.y} ${rTL.x},${rTL.y}`}
                fill="url(#rib-face-shadow)"
                stroke="none"
                opacity="0.35"
              />
            </g>
          );
        })}

        {/* 3D TRAPEZOIDAL RIB POCKETS on front (left-facing) crankcase wall — 7 pockets */}
        {Array.from({ length: 7 }).map((_, idx) => {
          const ribX = -80 + idx * 26;
          const ribW = 8;
          const ribD = 3;
          const pTL = P(ribX - ribW, CRANK_Y_OUTER + 0.5, CRANK_Z_TOP - 12);
          const pTR = P(ribX + ribW, CRANK_Y_OUTER + 0.5, CRANK_Z_TOP - 12);
          const pBL = P(ribX - ribW, CRANK_Y_OUTER + 0.5, CRANK_Z_BOT + 10);
          const pBR = P(ribX + ribW, CRANK_Y_OUTER + 0.5, CRANK_Z_BOT + 10);
          const rTL = P(ribX - ribW + ribD, CRANK_Y_OUTER - 1, CRANK_Z_TOP - 15);
          const rTR = P(ribX + ribW - ribD, CRANK_Y_OUTER - 1, CRANK_Z_TOP - 15);
          const rBL = P(ribX - ribW + ribD, CRANK_Y_OUTER - 1, CRANK_Z_BOT + 13);
          const rBR = P(ribX + ribW - ribD, CRANK_Y_OUTER - 1, CRANK_Z_BOT + 13);
          return (
            <g key={`rib-pocket-front-${idx}`}>
              <polygon
                points={`${pTL.x},${pTL.y} ${pTR.x},${pTR.y} ${pBR.x},${pBR.y} ${pBL.x},${pBL.y}`}
                fill="url(#rib-face-light)"
                stroke="#090d16"
                strokeWidth="1.3"
                opacity="0.5"
              />
              <polygon
                points={`${rTL.x},${rTL.y} ${rTR.x},${rTR.y} ${rBR.x},${rBR.y} ${rBL.x},${rBL.y}`}
                fill="#0f172a"
                stroke="#090d16"
                strokeWidth="0.9"
                opacity="0.55"
              />
              <polygon
                points={`${pTL.x},${pTL.y} ${pTR.x},${pTR.y} ${rTR.x},${rTR.y} ${rTL.x},${rTL.y}`}
                fill="url(#rib-face-light)"
                stroke="none"
                opacity="0.35"
              />
            </g>
          );
        })}

        {/* Cast Lifting Bracket Lugs — 2 on visible right wall */}
        {[-50, 60].map((lx, lIdx) => {
          const tabBase = P(lx, -CRANK_Y_OUTER - 2, 72);
          const tabTop = P(lx, -CRANK_Y_OUTER - 2, 92);
          const tabTip = P(lx, -CRANK_Y_OUTER - 16, 82);
          const tabBaseFront = P(lx - 12, -CRANK_Y_OUTER - 2, 72);
          const tabTopFront = P(lx - 12, -CRANK_Y_OUTER - 2, 92);
          const tabTipFront = P(lx - 12, -CRANK_Y_OUTER - 16, 82);
          const holeCenter = P(lx - 6, -CRANK_Y_OUTER - 10, 82);
          return (
            <g key={`lifting-bracket-${lIdx}`}>
              {/* Bracket side face (triangular) */}
              <polygon
                points={`${tabBase.x},${tabBase.y} ${tabTop.x},${tabTop.y} ${tabTip.x},${tabTip.y}`}
                fill="url(#lifting-bracket-cast)"
                stroke="#090d16"
                strokeWidth="1.6"
              />
              {/* Bracket front face (depth) */}
              <polygon
                points={`${tabBaseFront.x},${tabBaseFront.y} ${tabBase.x},${tabBase.y} ${tabTip.x},${tabTip.y} ${tabTipFront.x},${tabTipFront.y}`}
                fill="url(#v12-cast-aluminum-body-right)"
                stroke="#090d16"
                strokeWidth="1.2"
                opacity="0.7"
              />
              {/* Top face */}
              <polygon
                points={`${tabTopFront.x},${tabTopFront.y} ${tabTop.x},${tabTop.y} ${tabTip.x},${tabTip.y} ${tabTipFront.x},${tabTipFront.y}`}
                fill="url(#rib-face-light)"
                stroke="#090d16"
                strokeWidth="1"
                opacity="0.5"
              />
              {/* Through-hole for lifting eye */}
              <circle cx={holeCenter.x} cy={holeCenter.y} r="4.5" fill="#020617" stroke="#475569" strokeWidth="1.2" />
              <circle cx={holeCenter.x} cy={holeCenter.y} r="3" fill="none" stroke="#64748b" strokeWidth="0.8" opacity="0.6" />
            </g>
          );
        })}

        {/* Cast Lifting Bracket Lugs — 2 on front wall */}
        {[-50, 60].map((lx, lIdx) => {
          const tabBase = P(lx, CRANK_Y_OUTER + 2, 72);
          const tabTop = P(lx, CRANK_Y_OUTER + 2, 92);
          const tabTip = P(lx, CRANK_Y_OUTER + 16, 82);
          const holeCenter = P(lx, CRANK_Y_OUTER + 10, 82);
          return (
            <g key={`lifting-bracket-front-${lIdx}`}>
              <polygon
                points={`${tabBase.x},${tabBase.y} ${tabTop.x},${tabTop.y} ${tabTip.x},${tabTip.y}`}
                fill="url(#lifting-bracket-cast)"
                stroke="#090d16"
                strokeWidth="1.6"
                opacity="0.7"
              />
              <circle cx={holeCenter.x} cy={holeCenter.y} r="4" fill="#020617" stroke="#475569" strokeWidth="1" opacity="0.6" />
            </g>
          );
        })}
      </g>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LAYER 10: BOLTS & SMALL DETAILS                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <g id="layer-10-bolts-details">
        {/* HEAD BOLT BOSSES — Left bank perimeter (14 gold accent bolts per bank) */}
        {[-95, -65, -30, 0, 30, 65, 95].flatMap((bx) => [
          P(bx, BANK_OUTER_Y - 2, BANK_OUTER_Z + 3),
          P(bx, BANK_INNER_Y + 2, BANK_INNER_Z - 3),
        ]).map((boltPt, bIdx) => (
          <g key={`left-head-bolt-${bIdx}`}>
            <circle cx={boltPt.x} cy={boltPt.y} r="3.2" fill="url(#gold-anodized-bolt)" stroke="#78350f" strokeWidth="0.9" />
            <circle cx={boltPt.x} cy={boltPt.y} r="1.4" fill="#451a03" />
          </g>
        ))}

        {/* HEAD BOLT BOSSES — Right bank perimeter (gold accent) */}
        {[-95, -65, -30, 0, 30, 65, 95].flatMap((bx) => [
          P(bx, -BANK_OUTER_Y + 2, BANK_OUTER_Z + 3),
          P(bx, -BANK_INNER_Y - 2, BANK_INNER_Z - 3),
        ]).map((boltPt, bIdx) => (
          <g key={`right-head-bolt-${bIdx}`}>
            <circle cx={boltPt.x} cy={boltPt.y} r="3.2" fill="url(#gold-anodized-bolt)" stroke="#78350f" strokeWidth="0.9" />
            <circle cx={boltPt.x} cy={boltPt.y} r="1.4" fill="#451a03" />
          </g>
        ))}

        {/* ENGINE MOUNTING BRACKET BOSSES (2 per side) */}
        {[-65, 65].map((mx, mIdx) => {
          const mountPtL = P(mx, CRANK_Y_OUTER + 2, 65);
          const mountPtR = P(mx, -CRANK_Y_OUTER - 2, 65);
          return (
            <g key={`mount-boss-${mIdx}`}>
              {/* Left side mount */}
              <rect
                x={mountPtL.x - 10} y={mountPtL.y - 5}
                width={20} height={16}
                rx={2}
                fill="url(#lifting-bracket-cast)"
                stroke="#090d16"
                strokeWidth="1.5"
              />
              <circle cx={mountPtL.x - 5} cy={mountPtL.y} r="2" fill="#020617" stroke="#cbd5e1" strokeWidth="0.7" />
              <circle cx={mountPtL.x + 5} cy={mountPtL.y} r="2" fill="#020617" stroke="#cbd5e1" strokeWidth="0.7" />
              <circle cx={mountPtL.x - 5} cy={mountPtL.y + 8} r="2" fill="#020617" stroke="#cbd5e1" strokeWidth="0.7" />
              <circle cx={mountPtL.x + 5} cy={mountPtL.y + 8} r="2" fill="#020617" stroke="#cbd5e1" strokeWidth="0.7" />

              {/* Right side mount */}
              <rect
                x={mountPtR.x - 10} y={mountPtR.y - 5}
                width={20} height={16}
                rx={2}
                fill="url(#lifting-bracket-cast)"
                stroke="#090d16"
                strokeWidth="1.5"
              />
              <circle cx={mountPtR.x - 5} cy={mountPtR.y} r="2" fill="#020617" stroke="#cbd5e1" strokeWidth="0.7" />
              <circle cx={mountPtR.x + 5} cy={mountPtR.y} r="2" fill="#020617" stroke="#cbd5e1" strokeWidth="0.7" />
              <circle cx={mountPtR.x - 5} cy={mountPtR.y + 8} r="2" fill="#020617" stroke="#cbd5e1" strokeWidth="0.7" />
              <circle cx={mountPtR.x + 5} cy={mountPtR.y + 8} r="2" fill="#020617" stroke="#cbd5e1" strokeWidth="0.7" />
            </g>
          );
        })}

        {/* OIL GALLERY ACCESS PLUGS along crankcase sides */}
        {[-70, -35, 0, 35, 70].map((px, pIdx) => {
          const plugR = P(px, -CRANK_Y_OUTER - 1, 50);
          const plugL = P(px, CRANK_Y_OUTER + 1, 50);
          return (
            <g key={`oil-plug-${pIdx}`}>
              <circle cx={plugR.x} cy={plugR.y} r="3" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.9" />
              <circle cx={plugR.x} cy={plugR.y} r="1.5" fill="#020617" />
              <circle cx={plugL.x} cy={plugL.y} r="3" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.9" opacity="0.7" />
              <circle cx={plugL.x} cy={plugL.y} r="1.5" fill="#020617" opacity="0.7" />
            </g>
          );
        })}

        {/* OIL PAN MOUNTING BOLT LINE along crankcase base rail */}
        {Array.from({ length: 12 }).map((_, idx) => {
          const boltX = -100 + idx * 19;
          const boltFront = P(boltX, CRANK_Y_OUTER - 3, CRANK_Z_BOT + 2);
          const boltRight = P(boltX, -CRANK_Y_OUTER + 3, CRANK_Z_BOT + 2);
          return (
            <g key={`pan-bolt-${idx}`}>
              <circle cx={boltFront.x} cy={boltFront.y} r="1.8" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.6" opacity="0.6" />
              <circle cx={boltRight.x} cy={boltRight.y} r="1.8" fill="url(#bolt-boss-raised)" stroke="#090d16" strokeWidth="0.6" opacity="0.5" />
            </g>
          );
        })}

        {/* "V12" IDENTIFICATION BADGE on front crankcase wall */}
        {(() => {
          const badgeCenter = P(30, CRANK_Y_OUTER + 1, 55);
          return (
            <g id="v12-badge">
              <rect
                x={badgeCenter.x - 22} y={badgeCenter.y - 7}
                width={44} height={14}
                rx={2}
                fill="#1e293b"
                stroke="#cbd5e1"
                strokeWidth="1"
                opacity="0.8"
              />
              <rect
                x={badgeCenter.x - 19} y={badgeCenter.y - 5}
                width={38} height={10}
                rx={1}
                fill="#f8fafc"
                opacity="0.85"
              />
              <text
                x={badgeCenter.x}
                y={badgeCenter.y + 3}
                fill="#38bdf8"
                fontSize="8"
                fontWeight="bold"
                letterSpacing="1.5"
                textAnchor="middle"
              >
                V12 PERFORMANCE
              </text>
            </g>
          );
        })()}
      </g>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LAYER 11: HIGHLIGHTS & SHADOWS (specular + AO)               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <g id="layer-11-highlights-shadows">
        {/* Specular edge highlight along left bank deck outer edge */}
        <line
          x1={lbOuterFL.x} y1={lbOuterFL.y}
          x2={lbOuterFR.x} y2={lbOuterFR.y}
          stroke="#ffffff"
          strokeWidth="1.8"
          opacity="0.6"
          strokeLinecap="round"
        />
        {/* Specular edge along left bank inner edge */}
        <line
          x1={lbInnerFL.x} y1={lbInnerFL.y}
          x2={lbInnerFR.x} y2={lbInnerFR.y}
          stroke="#ffffff"
          strokeWidth="1.2"
          opacity="0.45"
          strokeLinecap="round"
        />
        {/* Specular edge along right bank inner edge */}
        <line
          x1={rbInnerFL.x} y1={rbInnerFL.y}
          x2={rbInnerFR.x} y2={rbInnerFR.y}
          stroke="#e2e8f0"
          strokeWidth="1"
          opacity="0.35"
          strokeLinecap="round"
        />
        {/* Specular edge along right bank outer edge */}
        <line
          x1={rbOuterFL.x} y1={rbOuterFL.y}
          x2={rbOuterFR.x} y2={rbOuterFR.y}
          stroke="#c8d2e0"
          strokeWidth="1.2"
          opacity="0.4"
          strokeLinecap="round"
        />

        {/* Crankcase top rail highlights */}
        <line
          x1={ctFL.x} y1={ctFL.y}
          x2={ctFR.x} y2={ctFR.y}
          stroke="#8b9ab5"
          strokeWidth="1.5"
          opacity="0.5"
          strokeLinecap="round"
        />
        <line
          x1={ctFR.x} y1={ctFR.y}
          x2={ctBR.x} y2={ctBR.y}
          stroke="#5d7090"
          strokeWidth="1.2"
          opacity="0.35"
          strokeLinecap="round"
        />

        {/* Oil pan rail bottom edge highlight */}
        <line
          x1={cbFL.x} y1={cbFL.y}
          x2={cbFR.x} y2={cbFR.y}
          stroke="#4a5a70"
          strokeWidth="1.5"
          opacity="0.3"
          strokeLinecap="round"
        />

        {/* Ambient occlusion in valley depth */}
        <line
          x1={vfFL.x + 5} y1={vfFL.y + 1}
          x2={vfFR.x + 5} y2={vfFR.y + 1}
          stroke="#020408"
          strokeWidth="3"
          opacity="0.25"
          strokeLinecap="round"
        />
        <line
          x1={vfBL.x - 3} y1={vfBL.y + 1}
          x2={vfBR.x - 3} y2={vfBR.y + 1}
          stroke="#020408"
          strokeWidth="2.5"
          opacity="0.2"
          strokeLinecap="round"
        />

        {/* Casting parting line on front face */}
        <line
          x1={P(-halfL + 5, CRANK_Y_OUTER, 65).x}
          y1={P(-halfL + 5, CRANK_Y_OUTER, 65).y}
          x2={P(halfL - 5, CRANK_Y_OUTER, 65).x}
          y2={P(halfL - 5, CRANK_Y_OUTER, 65).y}
          stroke="#5d7090"
          strokeWidth="0.8"
          opacity="0.35"
          strokeDasharray="4 3"
        />
        {/* Casting parting line on right face */}
        <line
          x1={P(halfL - 5, -CRANK_Y_OUTER, 65).x}
          y1={P(halfL - 5, -CRANK_Y_OUTER, 65).y}
          x2={P(-halfL + 5, -CRANK_Y_OUTER, 65).x}
          y2={P(-halfL + 5, -CRANK_Y_OUTER, 65).y}
          stroke="#3d4d63"
          strokeWidth="0.7"
          opacity="0.3"
          strokeDasharray="4 3"
        />

        {/* Water jacket deck openings (small kidney-shaped ports along deck edges) */}
        {borePositions.map((bx, idx) => {
          // Between each bore on left deck
          if (idx < 5) {
            const midX = bx + BORE_SPACING / 2;
            const wjL = P(midX, BANK_OUTER_Y - 5, BANK_OUTER_Z + 5);
            const wjR = P(midX, -BANK_OUTER_Y + 5, BANK_OUTER_Z + 5);
            return (
              <g key={`water-jacket-port-${idx}`}>
                <ellipse cx={wjL.x} cy={wjL.y} rx={3.5} ry={1.8} fill="url(#water-jacket-opening)" stroke="#0e7490" strokeWidth="0.7" opacity="0.6" transform={`rotate(-25, ${wjL.x}, ${wjL.y})`} />
                <ellipse cx={wjR.x} cy={wjR.y} rx={3.5} ry={1.8} fill="url(#water-jacket-opening)" stroke="#0e7490" strokeWidth="0.7" opacity="0.45" transform={`rotate(30, ${wjR.x}, ${wjR.y})`} />
              </g>
            );
          }
          return null;
        })}
      </g>
    </g>
  );
};
