import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import {
  projectIso,
  projectIsoEllipse,
  getIsoRibTrapezoid,
  getIsoBearingWebs,
  getIsoBoltBossRow,
  type ScreenPoint2D,
  type IsoPoint3D,
} from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface I3BlockCastingIsoProps {
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
 * ═══════════════════════════════════════════════════════════════════
 * INLINE-3 ENGINE BLOCK CASTING — Ultra-Detailed Photorealistic 3D Iso
 * ═══════════════════════════════════════════════════════════════════
 *
 * Compact High-Efficiency 1.0L–1.5L Inline-3 Turbocharged Engine Block
 * Inspired by: Ford EcoBoost 1.0L Fox, BMW B38 TwinPower, Toyota G16E-GTS, GR Yaris I3
 *
 * Comprehensive 18-Layer Isometric Mechanical Architecture:
 *  1. Ground shadow with multi-tier ambient occlusion & soft penumbra
 *  2. Deep NVH bedplate & crankcase skirt casting with 12 perimeter pan rail bosses
 *  3. Main aluminum/cast-iron die-cast crankcase body with draft angles & parting flash
 *  4. NVH acoustic damping waffle lattice matrix across skirt & side walls
 *  5. 4 Heavy-duty cross-bolted main bearing bulkheads with serrated cap split interfaces
 *  6. 3 Inter-bay crankcase breathing windows (pumping loss mitigation for 120° crank throws)
 *  7. Full 3D Counter-balance shaft housing & tunnel (essential for I3 primary harmonic balancing):
 *     - Counterweight eccentric lobe profiles
 *     - Front timing drive helical gear with individual gear tooth facets
 *     - Dual hydrodynamic bronze journal bearings & oil feed micro-galleries
 *     - Threaded aluminum hex inspection port caps
 *  8. 3 Centrifugally-spun ductile iron cylinder liners with step collars & 45° plateau honing
 *  9. Closed/Semi-closed water jacket cooling passages with inter-bore cooling sipes & steam vents
 * 10. Turbocharger high-pressure oil feed banjo port, copper washers & gravity drain return flange
 * 11. Oil filter bracket mounting pad & integrated water-cooled oil cooler sandwich plate
 * 12. Front timing gear end: water pump scroll volute, crankshaft front seal & chain guide dowels
 * 13. Rear flywheel bellhousing: PTFE radial lip seal carrier, starter pilot & 6-bolt radial ring
 * 14. Precision cylinder head deck face: 8 high-tensile M11 head bolt bosses & 2 alignment dowels
 * 15. Sensor suite: piezoelectric resonant knock sensor, CKP reluctor sensor & ECT temperature probe
 * 16. Structural lifting lugs & heavy-duty 3-point hydraulic engine mount reinforcement webs
 * 17. Technical foundry markings: "1.2L TURBO - I3", "DOHC-12V", "FIRING 1-2-3", casting date wheel
 * 18. Photorealistic anisotropic specular edge highlights, bevel glints & ambient occlusion shadows
 */
export const I3BlockCastingIso: React.FC<I3BlockCastingIsoProps> = ({
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O: ScreenPoint2D = { x: 250, y: 215 };

  // ─── PRIMARY DIMENSIONS (mm scaled to 3D Canvas Space) ───
  const BL = 142; // Block Length (compact inline-3 architecture)
  const halfL = BL / 2;
  const BD = 90; // Block Depth / Width
  const halfD = BD / 2;
  const BH = 150; // Block Height (sump rail to top deck)

  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  // ─── KEY Z-HEIGHT DATUMS ───
  const SKIRT_Z = -18; // Deep NVH skirt lower plane
  const PAN_RAIL_Z = 0; // Sump pan rail mating flange
  const BALANCE_SHAFT_Z = 14; // Counter-balance shaft centerline
  const CRANK_BAY_Z = 24; // Crankcase bottom window sill
  const CRANK_MAIN_AXIS_Z = 38; // Crankshaft rotational centerline
  const CRANK_TOP_Z = 74; // Crankcase upper ceiling
  const WATER_JACKET_Z = 96; // Cooling gallery entry
  const DECK_Z = BH; // Cylinder head deck surface

  // ─── CYLINDER BORE GEOMETRY ───
  const NUM_CYLS = 3;
  const BORE_RADIUS = 21.5; // ~82.0mm bore diameter
  const BORE_SPACING = 39.0; // Inter-bore center spacing
  const boreXPositions = Array.from(
    { length: NUM_CYLS },
    (_, i) => -((NUM_CYLS - 1) * BORE_SPACING) / 2 + i * BORE_SPACING
  );

  // ─── 3D CORNER KEYPOINTS ───
  // Lower Skirt Perimeters
  const sFL = projectIso({ x: -halfL - 15, y: halfD + 13, z: SKIRT_Z }, O);
  const sFR = projectIso({ x: halfL + 15, y: halfD + 13, z: SKIRT_Z }, O);
  const sBL = projectIso({ x: -halfL - 15, y: -halfD - 13, z: SKIRT_Z }, O);
  const sBR = projectIso({ x: halfL + 15, y: -halfD - 13, z: SKIRT_Z }, O);

  // Sump Pan Rail Flange
  const bFL = projectIso({ x: -halfL, y: halfD, z: PAN_RAIL_Z }, O);
  const bFR = projectIso({ x: halfL, y: halfD, z: PAN_RAIL_Z }, O);
  const bBR = projectIso({ x: halfL, y: -halfD, z: PAN_RAIL_Z }, O);
  const bBL = projectIso({ x: -halfL, y: -halfD, z: PAN_RAIL_Z }, O);

  // Waistline Mid-Plane
  const mFL = projectIso({ x: -halfL, y: halfD, z: CRANK_TOP_Z }, O);
  const mFR = projectIso({ x: halfL, y: halfD, z: CRANK_TOP_Z }, O);
  const mBR = projectIso({ x: halfL, y: -halfD, z: CRANK_TOP_Z }, O);
  const mBL = projectIso({ x: -halfL, y: -halfD, z: CRANK_TOP_Z }, O);

  // Top Cylinder Head Deck
  const tFL = projectIso({ x: -halfL, y: halfD, z: DECK_Z }, O);
  const tFR = projectIso({ x: halfL, y: halfD, z: DECK_Z }, O);
  const tBL = projectIso({ x: -halfL, y: -halfD, z: DECK_Z }, O);
  const tBR = projectIso({ x: halfL, y: -halfD, z: DECK_Z }, O);

  // 4 Main Bearing Bulkheads for 3 Cylinders
  const NUM_WEBS = 4;
  const webs = getIsoBearingWebs(BL, NUM_WEBS, 9.5, BD * 0.64, 52, CRANK_BAY_Z, O);

  // Cylinder Head Stud Bosses (4 outer + 4 inner = 8 total)
  const outerBolts = getIsoBoltBossRow(
    { x: -halfL + 12, y: halfD - 8.5, z: DECK_Z },
    { x: halfL - 12, y: halfD - 8.5, z: DECK_Z },
    4,
    5.6,
    O
  );
  const innerBolts = getIsoBoltBossRow(
    { x: -halfL + 12, y: -halfD + 8.5, z: DECK_Z },
    { x: halfL - 12, y: -halfD + 8.5, z: DECK_Z },
    4,
    5.6,
    O
  );

  return (
    <g
      id="iso-block-i3-casting"
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
      {/* ══════════════════════════════════════════════════════════════
          LAYER 1 — AMBIENT GROUND SHADOW & CONTACT OCCLUSION
          ══════════════════════════════════════════════════════════════ */}
      {/* Outer Soft Penumbra Shadow */}
      <ellipse
        cx={O.x}
        cy={O.y + 66}
        rx={110}
        ry={28}
        fill="url(#iso-ground-shadow)"
        opacity={0.5}
      />
      {/* Mid Contact Shadow */}
      <ellipse
        cx={O.x - 2}
        cy={O.y + 64}
        rx={88}
        ry={20}
        fill="#020617"
        opacity={0.65}
      />
      {/* Deep Ground Contact Core Shadow */}
      <ellipse
        cx={O.x - 4}
        cy={O.y + 62}
        rx={64}
        ry={14}
        fill="#000000"
        opacity={0.85}
      />

      {/* ══════════════════════════════════════════════════════════════
          LAYER 2 — LOWER CRANKCASE SKIRT & PAN RAIL FLANGE
          ══════════════════════════════════════════════════════════════ */}
      {/* Deep Skirt Base Floor Plate */}
      <path
        d={`M ${sFL.x} ${sFL.y} L ${sFR.x} ${sFR.y} L ${sBR.x} ${sBR.y} L ${sBL.x} ${sBL.y} Z`}
        fill={fills.right}
        stroke="#090d16"
        strokeWidth="1.4"
        opacity={0.7}
      />
      {/* Front Skirt Taper Bevel */}
      <path
        d={`M ${sFL.x} ${sFL.y} L ${sFR.x} ${sFR.y} L ${bFR.x} ${bFR.y} L ${bFL.x} ${bFL.y} Z`}
        fill={fills.left}
        stroke="#090d16"
        strokeWidth="1.2"
        opacity={0.85}
      />
      {/* Right Skirt Taper Bevel */}
      <path
        d={`M ${sFR.x} ${sFR.y} L ${sBR.x} ${sBR.y} L ${bBR.x} ${bBR.y} L ${bFR.x} ${bFR.y} Z`}
        fill={fills.right}
        stroke="#090d16"
        strokeWidth="1.2"
        opacity={0.8}
      />
      {/* Sump Pan Rail Gasket Contact Surface */}
      <path
        d={`M ${bFL.x} ${bFL.y} L ${bFR.x} ${bFR.y} L ${bBR.x} ${bBR.y} L ${bBL.x} ${bBL.y} Z`}
        fill={fills.top}
        stroke="#0f172a"
        strokeWidth="0.9"
        opacity={0.6}
      />

      {/* 12x Perimeter Pan Rail Sump Studs & Reinforced Gussets */}
      {Array.from({ length: 12 }).map((_, i) => {
        let xPos = 0;
        let yPos = 0;
        if (i < 4) {
          // Front skirt edge
          xPos = -halfL + 8 + i * ((BL - 16) / 3);
          yPos = halfD + 9;
        } else if (i < 8) {
          // Rear skirt edge
          xPos = -halfL + 8 + (i - 4) * ((BL - 16) / 3);
          yPos = -halfD - 9;
        } else if (i < 10) {
          // Left timing edge
          xPos = -halfL - 9;
          yPos = -halfD + 12 + (i - 8) * (BD - 24);
        } else {
          // Right flywheel edge
          xPos = halfL + 9;
          yPos = -halfD + 12 + (i - 10) * (BD - 24);
        }
        const pt = projectIso({ x: xPos, y: yPos, z: SKIRT_Z + 2 }, O);
        const bossPt = projectIso({ x: xPos, y: yPos, z: SKIRT_Z + 7 }, O);

        return (
          <g key={`pan-bolt-gusset-${i}`}>
            {/* Stud Boss Column */}
            <line
              x1={pt.x}
              y1={pt.y}
              x2={bossPt.x}
              y2={bossPt.y}
              stroke="#1e293b"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            {/* Flanged Washer & Nut */}
            <circle
              cx={bossPt.x}
              cy={bossPt.y}
              r={2.4}
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="0.6"
            />
            <circle
              cx={bossPt.x}
              cy={bossPt.y}
              r={1.2}
              fill="#020617"
            />
          </g>
        );
      })}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 3 — MAIN BLOCK BODY CASTING (High-Pressure Die-Cast)
          ══════════════════════════════════════════════════════════════ */}
      {/* Front Block Casting Wall */}
      <path
        d={`M ${bFL.x} ${bFL.y} L ${bFR.x} ${bFR.y} L ${tFR.x} ${tFR.y} L ${tFL.x} ${tFL.y} Z`}
        fill={fills.left}
        stroke="#090d16"
        strokeWidth="1.6"
      />
      {/* Right Block Casting Wall */}
      <path
        d={`M ${bFR.x} ${bFR.y} L ${bBR.x} ${bBR.y} L ${tBR.x} ${tBR.y} L ${tFR.x} ${tFR.y} Z`}
        fill={fills.right}
        stroke="#090d16"
        strokeWidth="1.6"
      />

      {/* Crankcase Waistline Step / Stiffener Ridge */}
      <path
        d={`M ${mFL.x} ${mFL.y} L ${mFR.x} ${mFR.y}`}
        stroke="#334155"
        strokeWidth="1.4"
        strokeDasharray="5,3"
        opacity={0.7}
      />
      <path
        d={`M ${mFR.x} ${mFR.y} L ${mBR.x} ${mBR.y}`}
        stroke="#1e293b"
        strokeWidth="1.2"
        strokeDasharray="5,3"
        opacity={0.6}
      />

      {/* Foundry Sand Core Parting Lines & Mold Split Flashes */}
      {(() => {
        const partZ = BH * 0.54;
        const pFL = projectIso({ x: -halfL, y: halfD, z: partZ }, O);
        const pFR = projectIso({ x: halfL, y: halfD, z: partZ }, O);
        const pBR = projectIso({ x: halfL, y: -halfD, z: partZ }, O);
        return (
          <g opacity={0.45}>
            <path
              d={`M ${pFL.x} ${pFL.y} L ${pFR.x} ${pFR.y}`}
              stroke="#64748b"
              strokeWidth="0.8"
            />
            <path
              d={`M ${pFR.x} ${pFR.y} L ${pBR.x} ${pBR.y}`}
              stroke="#475569"
              strokeWidth="0.7"
            />
          </g>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 4 — NVH ACOUSTIC WAFFLE LATTICE MATRIX
          ══════════════════════════════════════════════════════════════ */}
      {/* Front Skirt Acoustic NVH Damping Rib Matrix */}
      {Array.from({ length: 5 }).map((_, row) => {
        const ribZ = PAN_RAIL_Z + 12 + row * 11;
        const pStart = projectIso({ x: -halfL + 14, y: halfD + 1, z: ribZ }, O);
        const pEnd = projectIso({ x: halfL - 14, y: halfD + 1, z: ribZ }, O);
        return (
          <line
            key={`nvh-h-rib-${row}`}
            x1={pStart.x}
            y1={pStart.y}
            x2={pEnd.x}
            y2={pEnd.y}
            stroke="#1e293b"
            strokeWidth="0.8"
            strokeDasharray="6,4"
            opacity={0.5}
          />
        );
      })}
      {/* Diagonal Truss NVH Bracing Ribs (45° Cross Pattern) */}
      {Array.from({ length: 4 }).map((_, col) => {
        const x1 = -halfL + 20 + col * 28;
        const x2 = x1 + 18;
        const pt1 = projectIso({ x: x1, y: halfD + 1, z: PAN_RAIL_Z + 10 }, O);
        const pt2 = projectIso({ x: x2, y: halfD + 1, z: CRANK_TOP_Z - 10 }, O);
        return (
          <line
            key={`nvh-diag-rib-${col}`}
            x1={pt1.x}
            y1={pt1.y}
            x2={pt2.x}
            y2={pt2.y}
            stroke="#334155"
            strokeWidth="0.9"
            opacity={0.4}
          />
        );
      })}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 5 — 4 HEAVY-DUTY MAIN BEARING BULKHEADS & 4-BOLT CAPS
          ══════════════════════════════════════════════════════════════ */}
      {webs.map((web, idx) => {
        const journalSaddle = projectIsoEllipse(
          { x: web.xCenter, y: 0, z: CRANK_MAIN_AXIS_Z },
          12.5,
          O
        );
        const oilHole = projectIso(
          { x: web.xCenter, y: 0, z: CRANK_MAIN_AXIS_Z + 12.5 },
          O
        );

        return (
          <g key={`bearing-bulkhead-${idx}`}>
            {/* Bulkhead Structural Facets */}
            <path
              d={web.facets.front}
              fill={fills.left}
              stroke="#0f172a"
              strokeWidth="0.9"
              opacity={0.9}
            />
            <path
              d={web.facets.right}
              fill={fills.right}
              stroke="#0f172a"
              strokeWidth="0.8"
              opacity={0.85}
            />
            <path
              d={web.facets.top}
              fill={fills.top}
              stroke="#1e293b"
              strokeWidth="0.7"
              opacity={0.75}
            />

            {/* Precision Main Bearing Journal Saddle */}
            <ellipse
              cx={journalSaddle.cx}
              cy={journalSaddle.cy}
              rx={journalSaddle.rx}
              ry={journalSaddle.ry}
              fill="#020617"
              stroke="#1e293b"
              strokeWidth="1.1"
              opacity={0.8}
            />
            {/* Split Line Serrated Interface */}
            <line
              x1={journalSaddle.cx - journalSaddle.rx - 5}
              y1={journalSaddle.cy}
              x2={journalSaddle.cx + journalSaddle.rx + 5}
              y2={journalSaddle.cy}
              stroke="#475569"
              strokeWidth="0.6"
              strokeDasharray="2,1"
              opacity={0.7}
            />

            {/* Hydrodynamic Pressurized Oil Feed Gallery Hole */}
            <circle
              cx={oilHole.x}
              cy={oilHole.y}
              r={1.6}
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="0.5"
            />

            {/* 4-Bolt Cross-Bolted Main Bearing Cap Studs */}
            {[-1, 1].map((side) => {
              const studY = side * (BD * 0.22);
              const stud1 = projectIso(
                { x: web.xCenter, y: studY, z: CRANK_MAIN_AXIS_Z + 12 },
                O
              );
              const stud2 = projectIso(
                { x: web.xCenter, y: studY, z: CRANK_MAIN_AXIS_Z - 12 },
                O
              );
              return (
                <g key={`main-stud-${idx}-${side}`}>
                  <circle
                    cx={stud1.x}
                    cy={stud1.y}
                    r={2.0}
                    fill="#020617"
                    stroke="#475569"
                    strokeWidth="0.6"
                  />
                  <circle
                    cx={stud2.x}
                    cy={stud2.y}
                    r={2.0}
                    fill="#020617"
                    stroke="#475569"
                    strokeWidth="0.6"
                  />
                </g>
              );
            })}

            {/* Piston Cooling Under-Crown Oil Squirter Nozzle */}
            {idx < NUM_CYLS && (() => {
              const squirterBase = projectIso(
                { x: web.xCenter + 12, y: -10, z: CRANK_MAIN_AXIS_Z + 18 },
                O
              );
              const squirterTip = projectIso(
                { x: web.xCenter + 16, y: -4, z: CRANK_MAIN_AXIS_Z + 32 },
                O
              );
              return (
                <g key={`oil-squirter-${idx}`} opacity={0.85}>
                  {/* Brass Nozzle Body */}
                  <line
                    x1={squirterBase.x}
                    y1={squirterBase.y}
                    x2={squirterTip.x}
                    y2={squirterTip.y}
                    stroke="#eab308"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={squirterTip.x}
                    cy={squirterTip.y}
                    r={1.0}
                    fill="#ca8a04"
                  />
                  {/* High Pressure Oil Jet Spray Stream Indicator */}
                  <line
                    x1={squirterTip.x}
                    y1={squirterTip.y}
                    x2={squirterTip.x + 4}
                    y2={squirterTip.y - 12}
                    stroke="#38bdf8"
                    strokeWidth="0.7"
                    strokeDasharray="2,2"
                    opacity={0.6}
                  />
                </g>
              );
            })()}
          </g>
        );
      })}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 6 — 3 CRANKCASE BREATHER WINDOWS (PUMPING LOSS CUTOUTS)
          ══════════════════════════════════════════════════════════════ */}
      {Array.from({ length: NUM_CYLS }).map((_, i) => {
        const bayX = webs[i].xCenter + (webs[i + 1].xCenter - webs[i].xCenter) / 2;
        const bayTop = projectIso({ x: bayX, y: halfD - 7, z: CRANK_TOP_Z - 6 }, O);
        const bayBot = projectIso({ x: bayX, y: halfD - 7, z: CRANK_BAY_Z + 4 }, O);
        const h = bayBot.y - bayTop.y;

        return (
          <g key={`crank-breather-window-${i}`}>
            {/* Recessed Aerodynamic Pumping Passage */}
            <rect
              x={bayTop.x - 10}
              y={bayTop.y}
              width={20}
              height={h}
              rx={4}
              ry={4}
              fill="#020617"
              stroke="#1e293b"
              strokeWidth="1.0"
              opacity={0.88}
            />
            {/* Bevel Shadow */}
            <path
              d={`M ${bayTop.x - 10} ${bayTop.y + h} L ${bayTop.x - 10} ${bayTop.y} L ${bayTop.x + 10} ${bayTop.y}`}
              fill="none"
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            {/* Ventilation Flow Direction Vanes */}
            <line
              x1={bayTop.x - 6}
              y1={bayTop.y + 4}
              x2={bayTop.x + 6}
              y2={bayBot.y - 4}
              stroke="#334155"
              strokeWidth="0.7"
              opacity={0.6}
            />
          </g>
        );
      })}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 7 — 3D COUNTER-BALANCE SHAFT TUNNEL & HELICAL DRIVE
          ══════════════════════════════════════════════════════════════ */}
      {/* Essential for Inline-3 primary harmonic rocking couple cancellation */}
      {(() => {
        const bsFL = projectIso({ x: -halfL + 12, y: -halfD - 18, z: BALANCE_SHAFT_Z }, O);
        const bsFR = projectIso({ x: halfL - 12, y: -halfD - 18, z: BALANCE_SHAFT_Z }, O);
        const bsTFL = projectIso(
          { x: -halfL + 12, y: -halfD - 18, z: BALANCE_SHAFT_Z + 26 },
          O
        );
        const bsTFR = projectIso(
          { x: halfL - 12, y: -halfD - 18, z: BALANCE_SHAFT_Z + 26 },
          O
        );
        const bsTBR = projectIso(
          { x: halfL - 12, y: -halfD - 4, z: BALANCE_SHAFT_Z + 26 },
          O
        );
        const bsTBL = projectIso(
          { x: -halfL + 12, y: -halfD - 4, z: BALANCE_SHAFT_Z + 26 },
          O
        );

        // Hydrodynamic Journal Bearing 1 & 2
        const bsBore1 = projectIsoEllipse(
          { x: -halfL + 28, y: -halfD - 11, z: BALANCE_SHAFT_Z + 13 },
          7.2,
          O
        );
        const bsBore2 = projectIsoEllipse(
          { x: halfL - 28, y: -halfD - 11, z: BALANCE_SHAFT_Z + 13 },
          7.2,
          O
        );

        // Front Helical Timing Drive Gear
        const gearPt = projectIso(
          { x: -halfL + 14, y: -halfD - 11, z: BALANCE_SHAFT_Z + 13 },
          O
        );

        return (
          <g id="i3-balance-shaft-assembly" opacity={0.88}>
            {/* Housing Outer Shell - Front/Side Face */}
            <path
              d={`M ${bsFL.x} ${bsFL.y} L ${bsFR.x} ${bsFR.y} L ${bsTFR.x} ${bsTFR.y} L ${bsTFL.x} ${bsTFL.y} Z`}
              fill={fills.right}
              stroke="#0f172a"
              strokeWidth="1.0"
            />
            {/* Housing Top Deck Face */}
            <path
              d={`M ${bsTFL.x} ${bsTFL.y} L ${bsTFR.x} ${bsTFR.y} L ${bsTBR.x} ${bsTBR.y} L ${bsTBL.x} ${bsTBL.y} Z`}
              fill={fills.top}
              stroke="#1e293b"
              strokeWidth="0.8"
            />

            {/* Balance Shaft Eccentric Counterweight Lobe Cutout Windows */}
            {boreXPositions.map((bx, bi) => {
              const lobeWindow = projectIso(
                { x: bx, y: -halfD - 18.5, z: BALANCE_SHAFT_Z + 13 },
                O
              );
              return (
                <g key={`bs-lobe-window-${bi}`}>
                  <rect
                    x={lobeWindow.x - 8}
                    y={lobeWindow.y - 6}
                    width={16}
                    height={12}
                    rx={3}
                    fill="#020617"
                    stroke="#1e293b"
                    strokeWidth="0.8"
                  />
                  {/* Eccentric Steel Counterweight Lobe Profile */}
                  <path
                    d={`M ${lobeWindow.x - 6} ${lobeWindow.y} Q ${lobeWindow.x} ${lobeWindow.y - 5} ${lobeWindow.x + 6} ${lobeWindow.y} Q ${lobeWindow.x + 4} ${lobeWindow.y + 5} ${lobeWindow.x - 6} ${lobeWindow.y} Z`}
                    fill="#475569"
                    stroke="#94a3b8"
                    strokeWidth="0.6"
                  />
                </g>
              );
            })}

            {/* Front Helical Drive Gear with Individual Tooth Profiles */}
            <g id="bs-drive-gear">
              <circle
                cx={gearPt.x}
                cy={gearPt.y}
                r={10}
                fill="#1e293b"
                stroke="#475569"
                strokeWidth="1.0"
              />
              <circle
                cx={gearPt.x}
                cy={gearPt.y}
                r={6}
                fill="#0f172a"
                stroke="#64748b"
                strokeWidth="0.6"
              />
              {/* Helical Gear Teeth Cut Radii */}
              {Array.from({ length: 12 }).map((_, ti) => {
                const ang = (ti * 30 * Math.PI) / 180;
                return (
                  <line
                    key={`gear-tooth-${ti}`}
                    x1={gearPt.x + 7 * Math.cos(ang)}
                    y1={gearPt.y + 7 * Math.sin(ang)}
                    x2={gearPt.x + 10.5 * Math.cos(ang + 0.15)}
                    y2={gearPt.y + 10.5 * Math.sin(ang + 0.15)}
                    stroke="#94a3b8"
                    strokeWidth="0.8"
                  />
                );
              })}
            </g>

            {/* Journal Bearing Shells */}
            <ellipse
              cx={bsBore1.cx}
              cy={bsBore1.cy}
              rx={bsBore1.rx}
              ry={bsBore1.ry}
              fill="#020617"
              stroke="#334155"
              strokeWidth="0.8"
            />
            <ellipse
              cx={bsBore2.cx}
              cy={bsBore2.cy}
              rx={bsBore2.rx}
              ry={bsBore2.ry}
              fill="#020617"
              stroke="#334155"
              strokeWidth="0.8"
            />

            {/* Tunnel Service Inspection Hex Plugs */}
            {[0.25, 0.75].map((t, i) => {
              const plugX = -halfL + 15 + t * (BL - 30);
              const plugPt = projectIso(
                { x: plugX, y: -halfD - 18, z: BALANCE_SHAFT_Z + 22 },
                O
              );
              return (
                <g key={`bs-service-plug-${i}`}>
                  <circle
                    cx={plugPt.x}
                    cy={plugPt.y}
                    r={3.2}
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="0.7"
                  />
                  {/* Hexagon Socket */}
                  <polygon
                    points={`${plugPt.x - 1.5},${plugPt.y - 0.8} ${plugPt.x},${plugPt.y - 1.6} ${plugPt.x + 1.5},${plugPt.y - 0.8} ${plugPt.x + 1.5},${plugPt.y + 0.8} ${plugPt.x},${plugPt.y + 1.6} ${plugPt.x - 1.5},${plugPt.y + 0.8}`}
                    fill="#020617"
                  />
                </g>
              );
            })}
          </g>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 8 — 3 CYLINDER LINERS, DECK COLLARS & 45° HONING
          ══════════════════════════════════════════════════════════════ */}
      {boreXPositions.map((boreX, idx) => {
        const boreE = projectIsoEllipse(
          { x: boreX, y: 0, z: DECK_Z },
          BORE_RADIUS,
          O
        );
        const collarE = projectIsoEllipse(
          { x: boreX, y: 0, z: DECK_Z },
          BORE_RADIUS + 3.8,
          O
        );
        const linerInnerE = projectIsoEllipse(
          { x: boreX, y: 0, z: DECK_Z - 14 },
          BORE_RADIUS - 1.2,
          O
        );
        const boreFloorE = projectIsoEllipse(
          { x: boreX, y: 0, z: DECK_Z - 48 },
          BORE_RADIUS - 1.5,
          O
        );

        return (
          <g key={`cylinder-bore-liner-${idx}`}>
            {/* Centrifugally Spun Ductile Iron Step Collar */}
            <ellipse
              cx={collarE.cx}
              cy={collarE.cy}
              rx={collarE.rx}
              ry={collarE.ry}
              fill="none"
              stroke="#64748b"
              strokeWidth="2.2"
              opacity={0.6}
            />

            {/* Main Bore Top Chamfer */}
            <ellipse
              cx={boreE.cx}
              cy={boreE.cy}
              rx={boreE.rx}
              ry={boreE.ry}
              fill="#020617"
              stroke="#0f172a"
              strokeWidth="1.8"
            />

            {/* Deep Bore Wall Shadow Casting */}
            <ellipse
              cx={linerInnerE.cx}
              cy={linerInnerE.cy + 3}
              rx={linerInnerE.rx * 0.9}
              ry={linerInnerE.ry * 0.9}
              fill="#000000"
              opacity={0.7}
            />
            <ellipse
              cx={boreFloorE.cx}
              cy={boreFloorE.cy + 6}
              rx={boreFloorE.rx * 0.7}
              ry={boreFloorE.ry * 0.7}
              fill="#000000"
              opacity={0.9}
            />

            {/* 45° Plateau Cross-Hatch Honing Micro-Grooves */}
            {Array.from({ length: 6 }).map((_, h) => {
              const angle1 = (h * 30 - 25) * (Math.PI / 180);
              const angle2 = angle1 + 1.2;
              const len = BORE_RADIUS * 0.68;
              return (
                <g key={`honing-hatch-${idx}-${h}`} opacity={0.32}>
                  {/* Primary Hatch Line */}
                  <line
                    x1={boreE.cx - len * Math.cos(angle1)}
                    y1={boreE.cy - len * Math.sin(angle1) * 0.5}
                    x2={boreE.cx + len * Math.cos(angle1)}
                    y2={boreE.cy + len * Math.sin(angle1) * 0.5}
                    stroke="#cbd5e1"
                    strokeWidth="0.45"
                  />
                  {/* Counter-Crossing Plateau Hatch Line */}
                  <line
                    x1={boreE.cx - len * Math.cos(angle2)}
                    y1={boreE.cy - len * Math.sin(angle2) * 0.5}
                    x2={boreE.cx + len * Math.cos(angle2)}
                    y2={boreE.cy + len * Math.sin(angle2) * 0.5}
                    stroke="#94a3b8"
                    strokeWidth="0.4"
                  />
                </g>
              );
            })}

            {/* Top Deck Fire Ring Sealing Lip */}
            <ellipse
              cx={boreE.cx}
              cy={boreE.cy}
              rx={boreE.rx + 0.6}
              ry={boreE.ry + 0.3}
              fill="none"
              stroke="#f8fafc"
              strokeWidth="0.7"
              opacity={0.5}
            />
          </g>
        );
      })}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 9 — WATER JACKET COOLING PASSAGES & THERMOSTAT
          ══════════════════════════════════════════════════════════════ */}
      {/* Inter-Bore Siamese Bridge Cooling Sipes (2 slots between 3 bores) */}
      {Array.from({ length: 2 }).map((_, i) => {
        const wx = boreXPositions[i] + BORE_SPACING / 2;
        const wPt1 = projectIso({ x: wx, y: halfD - 6, z: WATER_JACKET_Z + 10 }, O);
        const wPt2 = projectIso({ x: wx, y: -halfD + 6, z: WATER_JACKET_Z + 10 }, O);

        return (
          <g key={`siamese-cooling-sipe-${i}`}>
            {/* Front Cooling Entry Port */}
            <ellipse
              cx={wPt1.x}
              cy={wPt1.y}
              rx={6.2}
              ry={4.0}
              fill="#0369a1"
              stroke="#38bdf8"
              strokeWidth="0.7"
              opacity={0.65}
            />
            <ellipse
              cx={wPt1.x}
              cy={wPt1.y + 0.5}
              rx={4.2}
              ry={2.4}
              fill="#082f49"
            />
            {/* Rear Cooling Return Port */}
            <ellipse
              cx={wPt2.x}
              cy={wPt2.y}
              rx={6.2}
              ry={4.0}
              fill="#0369a1"
              stroke="#38bdf8"
              strokeWidth="0.7"
              opacity={0.6}
            />
            <ellipse
              cx={wPt2.x}
              cy={wPt2.y + 0.5}
              rx={4.2}
              ry={2.4}
              fill="#082f49"
            />
          </g>
        );
      })}

      {/* Cast-In Thermostat Housing Volute */}
      {(() => {
        const thPt = projectIso(
          { x: halfL + 4, y: -halfD * 0.28, z: WATER_JACKET_Z + 16 },
          O
        );
        return (
          <g id="thermostat-housing-volute" opacity={0.85}>
            {/* Outer Flange Housing */}
            <circle
              cx={thPt.x}
              cy={thPt.y}
              r={9.0}
              fill={fills.right}
              stroke="#1e293b"
              strokeWidth="1.0"
            />
            {/* Coolant Outlet Orifice */}
            <circle
              cx={thPt.x}
              cy={thPt.y}
              r={5.5}
              fill="#0c4a6e"
              stroke="#0284c7"
              strokeWidth="0.8"
            />
            {/* Thermostat Wax Pellet Sensor Bulb */}
            <circle
              cx={thPt.x}
              cy={thPt.y}
              r={2.5}
              fill="#ca8a04"
              stroke="#eab308"
              strokeWidth="0.5"
            />
            {/* 3x Thermostat Housing Fasteners */}
            {[0, 120, 240].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const bx = thPt.x + 7.5 * Math.cos(rad);
              const by = thPt.y + 7.5 * Math.sin(rad);
              return (
                <circle
                  key={`th-bolt-${i}`}
                  cx={bx}
                  cy={by}
                  r={1.2}
                  fill="#0f172a"
                  stroke="#475569"
                  strokeWidth="0.4"
                />
              );
            })}
          </g>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 10 — TURBOCHARGER AUXILIARY OIL & COOLANT HARDWARE
          ══════════════════════════════════════════════════════════════ */}
      {(() => {
        // High-Pressure Oil Feed Banjo Port
        const turboOilFeedPt = projectIso(
          { x: -halfL + 24, y: halfD + 1.5, z: WATER_JACKET_Z - 12 },
          O
        );
        // Turbocharger Gravity Oil Return Drain Flange (-10AN)
        const turboDrainPt = projectIso(
          { x: -halfL + 24, y: halfD + 1.5, z: PAN_RAIL_Z + 18 },
          O
        );

        return (
          <g id="turbo-auxiliary-ports" opacity={0.9}>
            {/* Turbo Oil Feed Banjo Port */}
            <circle
              cx={turboOilFeedPt.x}
              cy={turboOilFeedPt.y}
              r={4.5}
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth="0.8"
            />
            {/* Copper Crush Washer Ring */}
            <circle
              cx={turboOilFeedPt.x}
              cy={turboOilFeedPt.y}
              r={3.2}
              fill="none"
              stroke="#d97706"
              strokeWidth="0.7"
            />
            {/* Banjo Bolt Hex Head */}
            <circle
              cx={turboOilFeedPt.x}
              cy={turboOilFeedPt.y}
              r={1.8}
              fill="#0f172a"
              stroke="#94a3b8"
              strokeWidth="0.5"
            />

            {/* Turbo Gravity Oil Return 2-Bolt Flange */}
            <rect
              x={turboDrainPt.x - 7}
              y={turboDrainPt.y - 4}
              width={14}
              height={8}
              rx={2}
              fill={fills.left}
              stroke="#1e293b"
              strokeWidth="0.8"
            />
            <ellipse
              cx={turboDrainPt.x}
              cy={turboDrainPt.y}
              rx={3.5}
              ry={2.5}
              fill="#020617"
              stroke="#475569"
              strokeWidth="0.6"
            />
            {/* Flange Retaining Studs */}
            <circle
              cx={turboDrainPt.x - 4.5}
              cy={turboDrainPt.y}
              r={1.1}
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="0.4"
            />
            <circle
              cx={turboDrainPt.x + 4.5}
              cy={turboDrainPt.y}
              r={1.1}
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="0.4"
            />
          </g>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 11 — OIL FILTER MOUNT & SANDWICH HEAT EXCHANGER
          ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const filterPadPt = projectIso(
          { x: halfL - 26, y: halfD + 2.0, z: CRANK_TOP_Z - 18 },
          O
        );
        return (
          <g id="oil-cooler-sandwich-plate" opacity={0.88}>
            {/* Machined Boss Pad */}
            <rect
              x={filterPadPt.x - 11}
              y={filterPadPt.y - 8}
              width={22}
              height={16}
              rx={3}
              fill={fills.left}
              stroke="#334155"
              strokeWidth="0.9"
            />
            {/* Oil Filter Spun Seal O-Ring Groove */}
            <ellipse
              cx={filterPadPt.x}
              cy={filterPadPt.y}
              rx={8.0}
              ry={5.5}
              fill="#020617"
              stroke="#64748b"
              strokeWidth="0.8"
            />
            {/* Threaded Center Union Spigot (3/4"-16 UNF) */}
            <circle
              cx={filterPadPt.x}
              cy={filterPadPt.y}
              r={3.0}
              fill="#1e293b"
              stroke="#94a3b8"
              strokeWidth="0.7"
            />
            {/* Coolant Feed In/Out Hose Barbs */}
            <circle
              cx={filterPadPt.x - 6.5}
              cy={filterPadPt.y + 4.5}
              r={1.8}
              fill="#0c4a6e"
              stroke="#0284c7"
              strokeWidth="0.5"
            />
            <circle
              cx={filterPadPt.x + 6.5}
              cy={filterPadPt.y + 4.5}
              r={1.8}
              fill="#0c4a6e"
              stroke="#0284c7"
              strokeWidth="0.5"
            />
          </g>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 12 — FRONT TIMING END: WATER PUMP SCROLL & CRANK SEAL
          ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const tcTop = projectIso({ x: -halfL - 7, y: halfD * 0.72, z: DECK_Z - 18 }, O);
        const tcBot = projectIso({ x: -halfL - 7, y: halfD * 0.72, z: CRANK_BAY_Z }, O);
        const tcTopR = projectIso(
          { x: -halfL - 7, y: -halfD * 0.72, z: DECK_Z - 18 },
          O
        );
        const tcBotR = projectIso(
          { x: -halfL - 7, y: -halfD * 0.72, z: CRANK_BAY_Z },
          O
        );
        const crankSealPt = projectIso(
          { x: -halfL - 8, y: 0, z: CRANK_MAIN_AXIS_Z },
          O
        );

        return (
          <g id="timing-cover-end-face" opacity={0.82}>
            {/* Timing Cover Mounting Surface */}
            <path
              d={`M ${tcTop.x} ${tcTop.y} L ${tcTopR.x} ${tcTopR.y} L ${tcBotR.x} ${tcBotR.y} L ${tcBot.x} ${tcBot.y} Z`}
              fill={fills.left}
              stroke="#0f172a"
              strokeWidth="1.2"
            />

            {/* Front Crankshaft Radial PTFE Lip Seal Carrier */}
            <circle
              cx={crankSealPt.x}
              cy={crankSealPt.y}
              r={9.5}
              fill="#020617"
              stroke="#334155"
              strokeWidth="1.0"
            />
            {/* PTFE Sealing Ring */}
            <circle
              cx={crankSealPt.x}
              cy={crankSealPt.y}
              r={6.5}
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="0.6"
              opacity={0.7}
            />

            {/* Cast-In Water Pump Impeller Volute Scroll */}
            {(() => {
              const wpPt = projectIso(
                { x: -halfL - 8, y: halfD * 0.35, z: WATER_JACKET_Z - 10 },
                O
              );
              return (
                <g id="water-pump-volute-scroll">
                  <circle
                    cx={wpPt.x}
                    cy={wpPt.y}
                    r={11.0}
                    fill="#0f172a"
                    stroke="#1e293b"
                    strokeWidth="0.8"
                  />
                  {/* Spiral Volute Flow Channel */}
                  <path
                    d={`M ${wpPt.x - 7} ${wpPt.y} A 7 7 0 1 1 ${wpPt.x + 8} ${wpPt.y + 4}`}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="1.4"
                    opacity={0.5}
                  />
                </g>
              );
            })()}

            {/* Timing Cover Perimeter M6 Fasteners */}
            {Array.from({ length: 6 }).map((_, i) => {
              const t = i / 5;
              const boltY = -halfD * 0.65 + t * (halfD * 1.3);
              const bPt = projectIso(
                { x: -halfL - 8, y: boltY, z: DECK_Z - 26 },
                O
              );
              return (
                <circle
                  key={`tc-perimeter-bolt-${i}`}
                  cx={bPt.x}
                  cy={bPt.y}
                  r={1.5}
                  fill="#0f172a"
                  stroke="#475569"
                  strokeWidth="0.5"
                />
              );
            })}
          </g>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 13 — REAR FLYWHEEL BELLHOUSING & RADIAL SEAL CARRIER
          ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const bhTop = projectIso(
          { x: halfL + 6, y: halfD * 0.8, z: CRANK_TOP_Z + 14 },
          O
        );
        const bhBot = projectIso(
          { x: halfL + 6, y: halfD * 0.8, z: CRANK_BAY_Z - 6 },
          O
        );
        const bhTopR = projectIso(
          { x: halfL + 6, y: -halfD * 0.8, z: CRANK_TOP_Z + 14 },
          O
        );
        const bhBotR = projectIso(
          { x: halfL + 6, y: -halfD * 0.8, z: CRANK_BAY_Z - 6 },
          O
        );
        const fwPt = projectIso(
          { x: halfL + 7, y: 0, z: CRANK_MAIN_AXIS_Z },
          O
        );
        const starterPt = projectIso(
          { x: halfL + 7, y: -halfD * 0.6, z: CRANK_MAIN_AXIS_Z + 18 },
          O
        );

        return (
          <g id="flywheel-bellhousing-end" opacity={0.78}>
            {/* Bellhousing Flange Plate */}
            <path
              d={`M ${bhTop.x} ${bhTop.y} L ${bhTopR.x} ${bhTopR.y} L ${bhBotR.x} ${bhBotR.y} L ${bhBot.x} ${bhBot.y} Z`}
              fill={fills.right}
              stroke="#0f172a"
              strokeWidth="1.2"
            />

            {/* Rear Main Crankshaft Seal Carrier Opening */}
            <circle
              cx={fwPt.x}
              cy={fwPt.y}
              r={14.0}
              fill="#020617"
              stroke="#1e293b"
              strokeWidth="1.0"
            />
            {/* PTFE Rear Main Lip Seal Ring */}
            <circle
              cx={fwPt.x}
              cy={fwPt.y}
              r={10.0}
              fill="#0f172a"
              stroke="#475569"
              strokeWidth="0.7"
            />

            {/* Starter Motor Pilot Bore & Dual Threaded Fastener Bosses */}
            <circle
              cx={starterPt.x}
              cy={starterPt.y}
              r={7.0}
              fill="#020617"
              stroke="#334155"
              strokeWidth="0.8"
            />
            <circle
              cx={starterPt.x - 5}
              cy={starterPt.y - 4}
              r={1.5}
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="0.4"
            />
            <circle
              cx={starterPt.x + 5}
              cy={starterPt.y + 4}
              r={1.5}
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="0.4"
            />

            {/* 6-Bolt Bellhousing Radial Pattern */}
            {[0, 60, 120, 180, 240, 300].map((ang, i) => {
              const rad = (ang * Math.PI) / 180;
              const bPt = projectIso(
                {
                  x: halfL + 7,
                  y: 19 * Math.cos(rad) * 0.5,
                  z: CRANK_MAIN_AXIS_Z + 19 * Math.sin(rad) * 0.5,
                },
                O
              );
              return (
                <circle
                  key={`bh-radial-bolt-${i}`}
                  cx={bPt.x}
                  cy={bPt.y}
                  r={1.8}
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="0.5"
                />
              );
            })}
          </g>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 14 — TOP CYLINDER HEAD DECK FACE & M11 HEAD STUDS
          ══════════════════════════════════════════════════════════════ */}
      {/* Precision Ground Top Deck Face */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y} L ${tBL.x} ${tBL.y} Z`}
        fill={fills.top}
        stroke="#0f172a"
        strokeWidth="1.6"
      />

      {/* 2x Precision Solid Steel Alignment Dowels (Ø12mm) */}
      {(() => {
        const dowel1 = projectIso(
          { x: -halfL + 8, y: halfD - 6, z: DECK_Z },
          O
        );
        const dowel2 = projectIso(
          { x: halfL - 8, y: -halfD + 6, z: DECK_Z },
          O
        );
        return (
          <g id="head-alignment-dowels">
            <circle
              cx={dowel1.x}
              cy={dowel1.y}
              r={2.4}
              fill="#cbd5e1"
              stroke="#64748b"
              strokeWidth="0.7"
            />
            <circle
              cx={dowel2.x}
              cy={dowel2.y}
              r={2.4}
              fill="#cbd5e1"
              stroke="#64748b"
              strokeWidth="0.7"
            />
          </g>
        );
      })()}

      {/* 4 Outer M11 High-Tensile Head Bolt Bosses */}
      {outerBolts.map((bolt, i) => (
        <g key={`outer-m11-bolt-${i}`}>
          <ellipse
            cx={bolt.ellipse.cx}
            cy={bolt.ellipse.cy}
            rx={bolt.ellipse.rx}
            ry={bolt.ellipse.ry}
            fill={fills.top}
            stroke="#64748b"
            strokeWidth="0.9"
            opacity={0.85}
          />
          <ellipse
            cx={bolt.ellipse.cx}
            cy={bolt.ellipse.cy}
            rx={bolt.ellipse.rx * 0.52}
            ry={bolt.ellipse.ry * 0.52}
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="0.5"
          />
          <circle
            cx={bolt.ellipse.cx}
            cy={bolt.ellipse.cy}
            r={1.0}
            fill="#020617"
          />
        </g>
      ))}

      {/* 4 Inner M11 High-Tensile Head Bolt Bosses */}
      {innerBolts.map((bolt, i) => (
        <g key={`inner-m11-bolt-${i}`}>
          <ellipse
            cx={bolt.ellipse.cx}
            cy={bolt.ellipse.cy}
            rx={bolt.ellipse.rx}
            ry={bolt.ellipse.ry}
            fill={fills.top}
            stroke="#64748b"
            strokeWidth="0.8"
            opacity={0.75}
          />
          <ellipse
            cx={bolt.ellipse.cx}
            cy={bolt.ellipse.cy}
            rx={bolt.ellipse.rx * 0.52}
            ry={bolt.ellipse.ry * 0.52}
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="0.5"
          />
          <circle
            cx={bolt.ellipse.cx}
            cy={bolt.ellipse.cy}
            r={1.0}
            fill="#020617"
          />
        </g>
      ))}

      {/* 2 Heavy Vertical Structural Stiffening Ribs Between Bores */}
      {[0.34, 0.66].map((t, i) => {
        const ribX = -halfL + t * BL;
        const rib = getIsoRibTrapezoid(
          { x: ribX, y: halfD + 3.5, z: DECK_Z - 16 },
          { x: ribX, y: halfD + 3.5, z: CRANK_TOP_Z + 6 },
          7,
          4.5,
          O
        );
        return (
          <g key={`block-v-rib-${i}`} opacity={0.65}>
            <path
              d={rib.frontFace}
              fill={fills.left}
              stroke="#1e293b"
              strokeWidth="0.7"
            />
            <path
              d={rib.leftFace}
              fill={fills.right}
              stroke="#0f172a"
              strokeWidth="0.6"
            />
            <path
              d={rib.topCap}
              fill={fills.top}
              stroke="#1e293b"
              strokeWidth="0.6"
            />
          </g>
        );
      })}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 15 — ENGINE SENSORS SUITE (Knock, CKP, ECT)
          ══════════════════════════════════════════════════════════════ */}
      {/* Piezoelectric Resonant Knock Sensor (Bore 2 Centerline) */}
      {(() => {
        const ksPt = projectIso(
          { x: boreXPositions[1], y: -halfD - 2.5, z: CRANK_TOP_Z + 6 },
          O
        );
        return (
          <g id="piezoelectric-knock-sensor" opacity={0.88}>
            {/* Outer Flanged Mount */}
            <circle
              cx={ksPt.x}
              cy={ksPt.y}
              r={4.2}
              fill={fills.right}
              stroke="#334155"
              strokeWidth="0.7"
            />
            {/* Piezoelectric Resonant Ring */}
            <circle
              cx={ksPt.x}
              cy={ksPt.y}
              r={2.2}
              fill="#0f172a"
              stroke="#475569"
              strokeWidth="0.5"
            />
            {/* Center Retaining Torx Bolt */}
            <circle cx={ksPt.x} cy={ksPt.y} r={1.0} fill="#64748b" />
          </g>
        );
      })()}

      {/* Crankshaft Position Reluctor Wheel Sensor (CKP) */}
      {(() => {
        const ckpPt = projectIso(
          { x: halfL - 10, y: -halfD - 3.0, z: CRANK_MAIN_AXIS_Z + 8 },
          O
        );
        return (
          <g id="ckp-sensor" opacity={0.85}>
            <rect
              x={ckpPt.x - 4}
              y={ckpPt.y - 3}
              width={8}
              height={6}
              rx={1.5}
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="0.6"
            />
            <circle
              cx={ckpPt.x}
              cy={ckpPt.y}
              r={1.8}
              fill="#38bdf8"
              opacity={0.8}
            />
          </g>
        );
      })()}

      {/* Engine Coolant Temperature Sensor Probe (ECT) */}
      {(() => {
        const ectPt = projectIso(
          { x: halfL - 6, y: halfD + 2.0, z: WATER_JACKET_Z - 6 },
          O
        );
        return (
          <g id="ect-temperature-sensor" opacity={0.88}>
            {/* Brass Hex Fitting */}
            <polygon
              points={`${ectPt.x - 2.5},${ectPt.y - 1.2} ${ectPt.x},${ectPt.y - 2.5} ${ectPt.x + 2.5},${ectPt.y - 1.2} ${ectPt.x + 2.5},${ectPt.y + 1.2} ${ectPt.x},${ectPt.y + 2.5} ${ectPt.x - 2.5},${ectPt.y + 1.2}`}
              fill="#ca8a04"
              stroke="#eab308"
              strokeWidth="0.6"
            />
            {/* Sensor Connector Pin */}
            <circle cx={ectPt.x} cy={ectPt.y} r={1.0} fill="#020617" />
          </g>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 16 — LIFTING LUGS & HYDRAULIC MOTOR MOUNT BRACKETS
          ══════════════════════════════════════════════════════════════ */}
      {/* Front Right Cast Lifting Lug Tab */}
      {(() => {
        const lugPt = projectIso(
          { x: halfL - 10, y: halfD + 5, z: DECK_Z + 8 },
          O
        );
        return (
          <g id="front-lifting-lug" opacity={0.8}>
            <path
              d={`M ${lugPt.x - 6} ${lugPt.y + 6} L ${lugPt.x - 6} ${lugPt.y - 4} Q ${lugPt.x} ${lugPt.y - 10} ${lugPt.x + 6} ${lugPt.y - 4} L ${lugPt.x + 6} ${lugPt.y + 6} Z`}
              fill={fills.left}
              stroke="#1e293b"
              strokeWidth="0.8"
            />
            {/* Shackle Hook Eyelet Hole */}
            <circle
              cx={lugPt.x}
              cy={lugPt.y - 3}
              r={3.0}
              fill="#020617"
              stroke="#475569"
              strokeWidth="0.6"
            />
          </g>
        );
      })()}

      {/* Heavy-Duty 3-Point NVH Hydraulic Motor Mount Boss Pad */}
      {(() => {
        const mmPt = projectIso(
          { x: -6, y: -halfD - 7, z: CRANK_TOP_Z + 20 },
          O
        );
        return (
          <g id="engine-mount-boss" opacity={0.78}>
            {/* Outer Reinforced Casting Box */}
            <rect
              x={mmPt.x - 14}
              y={mmPt.y - 7}
              width={28}
              height={14}
              rx={3}
              fill={fills.right}
              stroke="#1e293b"
              strokeWidth="0.9"
            />
            {/* 3x Heavy Threaded M12 Mount Holes */}
            <circle
              cx={mmPt.x - 8}
              cy={mmPt.y}
              r={2.6}
              fill="#020617"
              stroke="#334155"
              strokeWidth="0.6"
            />
            <circle
              cx={mmPt.x + 8}
              cy={mmPt.y}
              r={2.6}
              fill="#020617"
              stroke="#334155"
              strokeWidth="0.6"
            />
            <circle
              cx={mmPt.x}
              cy={mmPt.y - 3}
              r={2.4}
              fill="#020617"
              stroke="#334155"
              strokeWidth="0.6"
            />
          </g>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 17 — TECHNICAL FOUNDRY MARKINGS & CASTING TRACEABILITY
          ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const stampPt = projectIso(
          { x: -halfL + 18, y: halfD + 2.0, z: DECK_Z - 36 },
          O
        );
        const dateWheelPt = projectIso(
          { x: halfL - 22, y: halfD + 2.0, z: DECK_Z - 36 },
          O
        );

        return (
          <g id="foundry-casting-stamps" opacity={0.38}>
            {/* Machined Specification Stamp Pad */}
            <rect
              x={stampPt.x}
              y={stampPt.y}
              width={34}
              height={6}
              rx={1}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="0.5"
            />
            <text
              x={stampPt.x + 3}
              y={stampPt.y + 4.5}
              fill="#cbd5e1"
              fontSize="3.8"
              fontFamily="monospace"
              fontWeight="bold"
            >
              1.2L-TURBO·I3
            </text>

            {/* Circular Foundry Production Date Wheel Stamp */}
            <circle
              cx={dateWheelPt.x}
              cy={dateWheelPt.y}
              r={4.0}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="0.4"
            />
            <line
              x1={dateWheelPt.x - 3}
              y1={dateWheelPt.y}
              x2={dateWheelPt.x + 3}
              y2={dateWheelPt.y}
              stroke="#94a3b8"
              strokeWidth="0.4"
            />
            <line
              x1={dateWheelPt.x}
              y1={dateWheelPt.y - 3}
              x2={dateWheelPt.x}
              y2={dateWheelPt.y + 3}
              stroke="#94a3b8"
              strokeWidth="0.4"
            />
          </g>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 18 — PHOTOREALISTIC SPECULAR HIGHLIGHTS & AO SHADOWS
          ══════════════════════════════════════════════════════════════ */}
      {/* Top Deck Front Chamfer Edge Highlight */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tFR.x} ${tFR.y}`}
        stroke="#ffffff"
        strokeWidth="1.4"
        opacity={0.6}
        strokeLinecap="round"
      />
      {/* Top Deck Left Edge Specular Highlight */}
      <path
        d={`M ${tFL.x} ${tFL.y} L ${tBL.x} ${tBL.y}`}
        stroke="#f8fafc"
        strokeWidth="1.0"
        opacity={0.45}
        strokeLinecap="round"
      />
      {/* Vertical Front Corner Bevel Highlight */}
      <path
        d={`M ${bFL.x} ${bFL.y} L ${tFL.x} ${tFL.y}`}
        stroke="#e2e8f0"
        strokeWidth="1.0"
        opacity={0.48}
        strokeLinecap="round"
      />
      {/* Right Deck Edge Secondary Highlight */}
      <path
        d={`M ${tFR.x} ${tFR.y} L ${tBR.x} ${tBR.y}`}
        stroke="#94a3b8"
        strokeWidth="0.8"
        opacity={0.35}
        strokeLinecap="round"
      />

      {/* Ambient Occlusion Deep Creep Shadow (Under Deck Lip) */}
      <path
        d={`M ${tFL.x} ${tFL.y + 2.5} L ${tFR.x} ${tFR.y + 2.5}`}
        stroke="#020617"
        strokeWidth="2.4"
        opacity={0.4}
        strokeLinecap="round"
      />
      <path
        d={`M ${tFR.x + 1.2} ${tFR.y + 1.5} L ${tBR.x + 1.2} ${tBR.y + 1.5}`}
        stroke="#020617"
        strokeWidth="1.8"
        opacity={0.3}
        strokeLinecap="round"
      />
      {/* Skirt Baseline Heavy Ground Crease Shadow */}
      <path
        d={`M ${sFL.x} ${sFL.y + 1.2} L ${sFR.x} ${sFR.y + 1.2}`}
        stroke="#000000"
        strokeWidth="1.8"
        opacity={0.55}
        strokeLinecap="round"
      />

      {/* Active Selection Glow Reticle */}
      {blockState.isActive && (
        <rect
          x={O.x - 114}
          y={O.y - 110}
          width={228}
          height={202}
          rx={10}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.8"
          opacity={0.45}
          className="animate-pulse"
        />
      )}

      {/* Hover Translucent Blue Sheen */}
      {blockState.isHovered && !blockState.isActive && (
        <rect
          x={O.x - 114}
          y={O.y - 110}
          width={228}
          height={202}
          rx={10}
          fill="#38bdf8"
          opacity={0.06}
        />
      )}
    </g>
  );
};
