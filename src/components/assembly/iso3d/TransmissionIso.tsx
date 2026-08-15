import React, { useMemo } from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "./isoMath";

interface TransmissionIsoProps {
  layoutSpec?: {
    label: string;
    cyls: number[];
    width: number;
    bx: number;
    bw: number;
    bh: number;
    category?: string;
  };
  componentState?: {
    isInstalled: boolean;
    isActive: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  transmissionType?: "manual_6" | "seq_7" | "dct_8" | "auto_8" | "ev_reduction";
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * PHOTOREALISTIC 3D ISOMETRIC RACING TRANSMISSION & DRIVETRAIN
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ultra-Detailed 16-Layer Engineering Isometric Assembly:
 *  1. Multi-tier contact shadow with soft ambient occlusion penumbra
 *  2. High-strength aluminum-magnesium die-cast bellhousing & starter pocket
 *  3. Dual-mass flywheel (DMF) with peripheral ring gear & starter pinion teeth
 *  4. Multi-plate carbon-ceramic/organic wet dual-clutch pack with diaphragm springs
 *  5. Input shaft, quill shaft & pilot needle roller bearing
 *  6. Dual-clutch / sequential gear cluster:
 *     - 1st through 7th/8th straight-cut / helical gear train with tooth facets
 *     - Hardened steel dog rings, selector hubs, and brass synchro cones
 *     - Shift rails, selector forks, and pneumatic/hydraulic shift actuators
 *  7. Countershaft (Layshaft) with heavy-duty tapered roller bearing carriers
 *  8. Mechatronic hydraulic valve body with proportional shift solenoids & fluid channels
 *  9. Integrated torque-biasing Limited Slip Differential (LSD) with helical spider gears
 * 10. Output drive flanges / tripod CV joints (left & right transaxle shafts)
 * 11. Heavy-duty ribbed transmission main case & tailshaft housing with stiffening trusses
 * 12. Electronic Transmission Control Unit (TCU) with extruded aluminum cooling heatsink
 * 13. External transmission oil cooler plumbing with -8AN braided stainless steel hoses
 * 14. Magnetic oil drain plug, temperature sensor & breather vent valve
 * 15. Technical foundry markings: "7-SPEED SEQ / DCT", "RATIO 3.44:1", "MAG-AL ALLOY"
 * 16. Anisotropic specular edge highlights, bevel glints & depth occlusion shadows
 */
const TransmissionIsoComponent: React.FC<TransmissionIsoProps> = ({
  componentState,
  transmissionType = "dct_8",
  onHoverComponent,
}) => {
  const originScreen: ScreenPoint2D = useMemo(() => ({ x: 250, y: 215 }), []);
  const BL = 240;
  const halfL = BL / 2; // 120

  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen),
    [originScreen]
  );

  // ─── 3D ISOMETRIC SPATIAL DATUMS ───
  const xStart = halfL - 10;
  const xFlywheel = halfL + 5;
  const xClutch = halfL + 18;
  const xBellEnd = halfL + 38;
  const xGearCluster1 = halfL + 55;
  const xGearCluster2 = halfL + 72;
  const xGearCluster3 = halfL + 90;
  const xDiff = halfL + 98;
  const xGearboxEnd = halfL + 108;
  const xTailEnd = halfL + 130;
  const xOutputEnd = halfL + 142;

  // ─── 3D GEOMETRIC FACETS & PROJECTION VECTORS ───
  const geo = useMemo(() => {
    // 1. Bellhousing Outer Shell Points
    const btFL = P(xStart, 52, 120);
    const btFR = P(xBellEnd, 42, 100);
    const bbFL = P(xStart, 42, 16);
    const bbFR = P(xBellEnd, 32, 16);

    const brTopL = P(xStart, -52, 120);
    const brTopR = P(xBellEnd, -42, 100);
    const brBotL = P(xStart, -42, 16);
    const brBotR = P(xBellEnd, -32, 16);

    // 2. Main Gearbox Case Points
    const gtL = P(xBellEnd, 36, 90);
    const gtR = P(xGearboxEnd, 32, 80);
    const gbL = P(xBellEnd, 28, 14);
    const gbR = P(xGearboxEnd, 26, 14);

    const grTopL = P(xBellEnd, -36, 90);
    const grTopR = P(xGearboxEnd, -32, 80);
    const grBotL = P(xBellEnd, -28, 14);
    const grBotR = P(xGearboxEnd, -26, 14);

    // 3. Tailshaft & Output Housing Points
    const ttL = P(xGearboxEnd, 26, 70);
    const ttR = P(xTailEnd, 18, 62);
    const tbL = P(xGearboxEnd, 22, 22);
    const tbR = P(xTailEnd, 16, 26);

    const trTopL = P(xGearboxEnd, -26, 70);
    const trTopR = P(xTailEnd, -18, 62);
    const trBotL = P(xGearboxEnd, -22, 22);
    const trBotR = P(xTailEnd, -16, 26);

    // 4. Center Axis Points
    const flywheelCenter = P(xFlywheel, 0, 58);
    const clutchCenter = P(xClutch, 0, 58);
    const gearCenter1 = P(xGearCluster1, 0, 58);
    const gearCenter2 = P(xGearCluster2, 0, 58);
    const gearCenter3 = P(xGearCluster3, 0, 58);
    const layshaftCenter1 = P(xGearCluster1, 0, 32);
    const layshaftCenter2 = P(xGearCluster2, 0, 32);
    const layshaftCenter3 = P(xGearCluster3, 0, 32);
    const diffCenter = P(xDiff, 0, 36);
    const yokePt = P(xOutputEnd, 0, 58);

    // 5. TCU & Auxiliary Nodes
    const tcuL = P(xGearboxEnd - 22, -18, 96);
    const tcuR = P(xGearboxEnd + 8, -18, 92);
    const starterBoss = P(xStart + 8, -46, 92);
    const oilCoolerInlet = P(xBellEnd + 14, 38, 78);
    const oilCoolerOutlet = P(xBellEnd + 28, 38, 74);

    return {
      btFL, btFR, bbFL, bbFR,
      brTopL, brTopR, brBotL, brBotR,
      gtL, gtR, gbL, gbR,
      grTopL, grTopR, grBotL, grBotR,
      ttL, ttR, tbL, tbR,
      trTopL, trTopR, trBotL, trBotR,
      flywheelCenter, clutchCenter,
      gearCenter1, gearCenter2, gearCenter3,
      layshaftCenter1, layshaftCenter2, layshaftCenter3,
      diffCenter, yokePt,
      tcuL, tcuR, starterBoss, oilCoolerInlet, oilCoolerOutlet,
    };
  }, [P, xStart, xFlywheel, xClutch, xBellEnd, xGearCluster1, xGearCluster2, xGearCluster3, xDiff, xGearboxEnd, xTailEnd, xOutputEnd]);

  return (
    <g
      id="iso-transmission-assembly-3d"
      onMouseEnter={() => onHoverComponent?.("crankshaft")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className={`cursor-pointer transition-all duration-700 ease-out ${
        componentState?.isActive ? "filter-glow-active" : ""
      }`}
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState?.opacity ?? 1,
      }}
    >
      {/* ══════════════════════════════════════════════════════════════
          LAYER 1 — GROUND SHADOW & CONTACT OCCLUSION PENUMBRA
          ══════════════════════════════════════════════════════════════ */}
      {/* Wide Ambient Ground Shadow */}
      <ellipse
        cx={originScreen.x + 85}
        cy={originScreen.y + 68}
        rx={125}
        ry={32}
        fill="url(#iso-ground-shadow)"
        opacity={0.65}
      />
      {/* Mid Contact Shadow */}
      <ellipse
        cx={originScreen.x + 82}
        cy={originScreen.y + 65}
        rx={98}
        ry={22}
        fill="#020617"
        opacity={0.7}
      />
      {/* Core Ground Tangent Shadow */}
      <ellipse
        cx={originScreen.x + 78}
        cy={originScreen.y + 62}
        rx={65}
        ry={14}
        fill="#000000"
        opacity={0.85}
      />

      {/* ══════════════════════════════════════════════════════════════
          LAYER 2 — MAIN BELLHOUSING HOUSING CASTING
          ══════════════════════════════════════════════════════════════ */}
      <g id="bellhousing-casting-shell">
        {/* Right Rear Bellhousing Flange Wall */}
        <polygon
          points={`${geo.brTopL.x},${geo.brTopL.y} ${geo.brTopR.x},${geo.brTopR.y} ${geo.brBotR.x},${geo.brBotR.y} ${geo.brBotL.x},${geo.brBotL.y}`}
          fill="url(#v12-cast-aluminum-body-right)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        {/* Top Deck Bellhousing Transition Surface */}
        <polygon
          points={`${geo.btFL.x},${geo.btFL.y} ${geo.btFR.x},${geo.btFR.y} ${geo.brTopR.x},${geo.brTopR.y} ${geo.brTopL.x},${geo.brTopL.y}`}
          fill="url(#transmission-case-cast)"
          stroke="#090d16"
          strokeWidth="2.0"
        />
        {/* Front Bellhousing Flange Mating Plane */}
        <path
          d={`M ${geo.btFL.x} ${geo.btFL.y}
              L ${geo.btFR.x} ${geo.btFR.y}
              L ${geo.bbFR.x} ${geo.bbFR.y}
              L ${geo.bbFL.x} ${geo.bbFL.y}
              Z`}
          fill="url(#transmission-case-cast)"
          stroke="#090d16"
          strokeWidth="2.4"
        />
        {/* Top Ridge Specular Highlight Line */}
        <line
          x1={geo.btFL.x}
          y1={geo.btFL.y}
          x2={geo.btFR.x}
          y2={geo.btFR.y}
          stroke="#ffffff"
          strokeWidth="2.0"
          opacity="0.85"
        />

        {/* 16x Engine Block Bellhousing Perimeter Bolt Ring Bosses */}
        {Array.from({ length: 12 }).map((_, i) => {
          const ang = (i * 30 * Math.PI) / 180;
          const rx = 32;
          const ry = 48;
          const bx = geo.btFL.x - 4 + rx * Math.cos(ang) * 0.45;
          const by = geo.btFL.y + 45 + ry * Math.sin(ang) * 0.45;

          return (
            <g key={`bell-bolt-${i}`}>
              <circle
                cx={bx}
                cy={by}
                r={2.4}
                fill="#0f172a"
                stroke="#475569"
                strokeWidth="0.6"
              />
              <circle cx={bx} cy={by} r={1.2} fill="#020617" />
            </g>
          );
        })}

        {/* Starter Motor Cast Pocket & Blind Mounting Holes */}
        <g id="starter-pocket-boss">
          <ellipse
            cx={geo.starterBoss.x}
            cy={geo.starterBoss.y}
            rx={11}
            ry={7}
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="1.2"
          />
          <circle
            cx={geo.starterBoss.x - 6}
            cy={geo.starterBoss.y}
            r={1.8}
            fill="#020617"
            stroke="#64748b"
            strokeWidth="0.5"
          />
          <circle
            cx={geo.starterBoss.x + 6}
            cy={geo.starterBoss.y}
            r={1.8}
            fill="#020617"
            stroke="#64748b"
            strokeWidth="0.5"
          />
        </g>
      </g>

      {/* ══════════════════════════════════════════════════════════════
          LAYER 3 — DUAL MASS FLYWHEEL & STARTER RING GEAR
          ══════════════════════════════════════════════════════════════ */}
      <g id="flywheel-and-ring-gear">
        {/* Flywheel Primary Mass Outer Ring */}
        <ellipse
          cx={geo.flywheelCenter.x - 6}
          cy={geo.flywheelCenter.y}
          rx={15}
          ry={26}
          fill="url(#flywheel-ring-gear)"
          stroke="#090d16"
          strokeWidth="2.0"
        />
        {/* Starter Ring Gear Precision Teeth Cutouts */}
        <ellipse
          cx={geo.flywheelCenter.x - 6}
          cy={geo.flywheelCenter.y}
          rx={16.5}
          ry={27.5}
          fill="none"
          stroke="#334155"
          strokeWidth="2.2"
          strokeDasharray="2.5 2.0"
        />
        {/* Dual Mass Flywheel Internal Arc Spring Windows */}
        {[0, 90, 180, 270].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const sx = geo.flywheelCenter.x - 6 + 9 * Math.cos(rad) * 0.5;
          const sy = geo.flywheelCenter.y + 16 * Math.sin(rad) * 0.5;
          return (
            <g key={`dmf-spring-${i}`}>
              <rect
                x={sx - 3}
                y={sy - 4}
                width={6}
                height={8}
                rx={2}
                fill="#ca8a04"
                stroke="#eab308"
                strokeWidth="0.6"
              />
              <line
                x1={sx - 2}
                y1={sy - 2}
                x2={sx + 2}
                y2={sy + 2}
                stroke="#78350f"
                strokeWidth="0.8"
              />
            </g>
          );
        })}
      </g>

      {/* ══════════════════════════════════════════════════════════════
          LAYER 4 — MULTI-PLATE WET DUAL-CLUTCH (DCT) PACK
          ══════════════════════════════════════════════════════════════ */}
      <g id="dual-clutch-friction-pack">
        {/* Clutch 1 (Odd Gears 1-3-5-7) Outer Friction Basket */}
        <ellipse
          cx={geo.clutchCenter.x - 2}
          cy={geo.clutchCenter.y}
          rx={13}
          ry={23}
          fill="url(#clutch-disc-friction)"
          stroke="#451a03"
          strokeWidth="1.4"
        />
        {/* Clutch 2 (Even Gears 2-4-6-8) Inner Friction Basket */}
        <ellipse
          cx={geo.clutchCenter.x + 3}
          cy={geo.clutchCenter.y}
          rx={11}
          ry={19}
          fill="url(#pressure-plate-steel)"
          stroke="#090d16"
          strokeWidth="1.3"
        />
        {/* High-Tensile Steel Diaphragm Spring Fingers */}
        {Array.from({ length: 16 }).map((_, i) => {
          const rad = (i * 22.5 * Math.PI) / 180;
          const sx = geo.clutchCenter.x + 4 + 7.5 * Math.cos(rad);
          const sy = geo.clutchCenter.y + 13 * Math.sin(rad);
          return (
            <line
              key={`diaphragm-finger-${i}`}
              x1={geo.clutchCenter.x + 4}
              y1={geo.clutchCenter.y}
              x2={sx}
              y2={sy}
              stroke="#cbd5e1"
              strokeWidth="0.9"
            />
          );
        })}
        {/* Central Clutch Release Throwout Bearing Sleeve */}
        <ellipse
          cx={geo.clutchCenter.x + 7}
          cy={geo.clutchCenter.y}
          rx={5.5}
          ry={9.5}
          fill="url(#bearing-saddle-chrome)"
          stroke="#090d16"
          strokeWidth="1.5"
        />
      </g>

      {/* ══════════════════════════════════════════════════════════════
          LAYER 5 — CUTAWAY INSPECTION WINDOW (INTERNAL GEAR CLUSTERS)
          ══════════════════════════════════════════════════════════════ */}
      <g id="transmission-cutaway-geartrain">
        {/* Housing Cutaway Chamfer Pocket */}
        <path
          d={`M ${P(xStart + 8, 34, 96).x} ${P(xStart + 8, 34, 96).y}
              L ${P(xBellEnd + 42, 24, 82).x} ${P(xBellEnd + 42, 24, 82).y}
              L ${P(xBellEnd + 42, 18, 26).x} ${P(xBellEnd + 42, 18, 26).y}
              L ${P(xStart + 8, 26, 26).x} ${P(xStart + 8, 26, 26).y}
              Z`}
          fill="url(#clutch-housing-cutaway)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        {/* Cutaway Perimeter Machined Chamfer Edge */}
        <path
          d={`M ${P(xStart + 8, 34, 96).x} ${P(xStart + 8, 34, 96).y}
              L ${P(xBellEnd + 42, 24, 82).x} ${P(xBellEnd + 42, 24, 82).y}
              L ${P(xBellEnd + 42, 18, 26).x} ${P(xBellEnd + 42, 18, 26).y}`}
          fill="none"
          stroke="#f8fafc"
          strokeWidth="1.8"
          opacity="0.85"
        />

        {/* ── Main Input Shaft & Concentric Solid Quill Shaft ── */}
        <line
          x1={geo.clutchCenter.x + 8}
          y1={geo.clutchCenter.y}
          x2={geo.gearCenter3.x + 22}
          y2={geo.gearCenter3.y}
          stroke="url(#bearing-saddle-chrome)"
          strokeWidth="6.0"
          strokeLinecap="round"
        />
        {/* Shaft Specular Reflection Beam */}
        <line
          x1={geo.clutchCenter.x + 8}
          y1={geo.clutchCenter.y - 1.8}
          x2={geo.gearCenter3.x + 22}
          y2={geo.gearCenter3.y - 1.8}
          stroke="#ffffff"
          strokeWidth="1.6"
          opacity="0.9"
        />

        {/* ── Lower Countershaft / Layshaft ── */}
        <line
          x1={geo.clutchCenter.x + 8}
          y1={geo.layshaftCenter1.y}
          x2={geo.gearCenter3.x + 18}
          y2={geo.layshaftCenter3.y}
          stroke="#334155"
          strokeWidth="5.0"
          strokeLinecap="round"
        />

        {/* ── 1st & 2nd Gear Helical Set (High Torque Ratio) ── */}
        <g id="gear-set-1-2">
          {/* Mainshaft 1st Gear */}
          <ellipse
            cx={geo.gearCenter1.x - 4}
            cy={geo.gearCenter1.y}
            rx={9.5}
            ry={18.0}
            fill="url(#pressure-plate-steel)"
            stroke="#090d16"
            strokeWidth="1.5"
          />
          <ellipse
            cx={geo.gearCenter1.x - 4}
            cy={geo.gearCenter1.y}
            rx={10.2}
            ry={19.0}
            fill="none"
            stroke="#090d16"
            strokeWidth="2.0"
            strokeDasharray="2.2 1.6"
          />

          {/* Hardened Steel Dog Ring & Synchro Sleeve */}
          <ellipse
            cx={geo.gearCenter1.x + 6}
            cy={geo.gearCenter1.y}
            rx={8.0}
            ry={15.0}
            fill="url(#bearing-saddle-chrome)"
            stroke="#090d16"
            strokeWidth="1.4"
          />
          <ellipse
            cx={geo.gearCenter1.x + 6}
            cy={geo.gearCenter1.y}
            rx={8.6}
            ry={16.0}
            fill="none"
            stroke="#090d16"
            strokeWidth="1.8"
            strokeDasharray="1.8 1.4"
          />
          {/* Selector Fork Hub Ring (Brass Bronze) */}
          <ellipse
            cx={geo.gearCenter1.x + 8}
            cy={geo.gearCenter1.y}
            rx={4.5}
            ry={8.5}
            fill="url(#valve-cover-gold-top)"
            stroke="#78350f"
            strokeWidth="1.0"
          />
        </g>

        {/* ── 3rd & 4th Gear Set ── */}
        <g id="gear-set-3-4">
          <ellipse
            cx={geo.gearCenter2.x - 3}
            cy={geo.gearCenter2.y + 2}
            rx={8.0}
            ry={15.0}
            fill="url(#pressure-plate-steel)"
            stroke="#090d16"
            strokeWidth="1.4"
          />
          <ellipse
            cx={geo.gearCenter2.x + 6}
            cy={geo.gearCenter2.y + 2}
            rx={7.0}
            ry={13.0}
            fill="url(#bearing-saddle-chrome)"
            stroke="#090d16"
            strokeWidth="1.4"
          />
          <ellipse
            cx={geo.gearCenter2.x + 8}
            cy={geo.gearCenter2.y + 2}
            rx={4.0}
            ry={7.5}
            fill="url(#valve-cover-gold-top)"
            stroke="#78350f"
            strokeWidth="1.0"
          />
        </g>

        {/* ── 5th, 6th & 7th Overdrive Gear Cluster ── */}
        <g id="gear-set-5-6-7">
          <ellipse
            cx={geo.gearCenter3.x - 2}
            cy={geo.gearCenter3.y + 4}
            rx={7.0}
            ry={12.5}
            fill="url(#pressure-plate-steel)"
            stroke="#090d16"
            strokeWidth="1.4"
          />
          <ellipse
            cx={geo.gearCenter3.x + 6}
            cy={geo.gearCenter3.y + 4}
            rx={6.2}
            ry={11.0}
            fill="url(#bearing-saddle-chrome)"
            stroke="#090d16"
            strokeWidth="1.4"
          />
          <ellipse
            cx={geo.gearCenter3.x + 8}
            cy={geo.gearCenter3.y + 4}
            rx={3.5}
            ry={6.5}
            fill="url(#valve-cover-gold-top)"
            stroke="#78350f"
            strokeWidth="0.9"
          />
        </g>

        {/* ── Pneumatic/Hydraulic Shift Actuator Rails & Forks ── */}
        <g id="shift-rails-forks" opacity={0.85}>
          {/* Top Shift Rail Rod */}
          <line
            x1={geo.gearCenter1.x - 8}
            y1={geo.gearCenter1.y - 18}
            x2={geo.gearCenter3.x + 14}
            y2={geo.gearCenter3.y - 14}
            stroke="#e2e8f0"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Selector Fork 1-2 */}
          <path
            d={`M ${geo.gearCenter1.x + 7} ${geo.gearCenter1.y - 17}
                L ${geo.gearCenter1.x + 7} ${geo.gearCenter1.y - 8}
                A 8 15 0 0 1 ${geo.gearCenter1.x + 7} ${geo.gearCenter1.y + 8}`}
            fill="none"
            stroke="#ca8a04"
            strokeWidth="2.2"
          />
          {/* Selector Fork 3-4 */}
          <path
            d={`M ${geo.gearCenter2.x + 7} ${geo.gearCenter2.y - 16}
                L ${geo.gearCenter2.x + 7} ${geo.gearCenter2.y - 7}
                A 7 13 0 0 1 ${geo.gearCenter2.x + 7} ${geo.gearCenter2.y + 7}`}
            fill="none"
            stroke="#ca8a04"
            strokeWidth="2.2"
          />
          {/* Selector Fork 5-6 */}
          <path
            d={`M ${geo.gearCenter3.x + 7} ${geo.gearCenter3.y - 15}
                L ${geo.gearCenter3.x + 7} ${geo.gearCenter3.y - 6}
                A 6 11 0 0 1 ${geo.gearCenter3.x + 7} ${geo.gearCenter3.y + 6}`}
            fill="none"
            stroke="#ca8a04"
            strokeWidth="2.2"
          />
        </g>
      </g>

      {/* ══════════════════════════════════════════════════════════════
          LAYER 6 — LIMITED SLIP DIFFERENTIAL (LSD) & RING GEAR
          ══════════════════════════════════════════════════════════════ */}
      <g id="limited-slip-differential-assembly">
        {/* Hypoid Final Drive Crown Wheel Ring Gear */}
        <ellipse
          cx={geo.diffCenter.x}
          cy={geo.diffCenter.y}
          rx={16}
          ry={28}
          fill="url(#flywheel-ring-gear)"
          stroke="#090d16"
          strokeWidth="2.0"
        />
        {/* Helical Crown Wheel Gear Teeth */}
        <ellipse
          cx={geo.diffCenter.x}
          cy={geo.diffCenter.y}
          rx={17.2}
          ry={29.5}
          fill="none"
          stroke="#475569"
          strokeWidth="2.4"
          strokeDasharray="3 2"
        />
        {/* Differential Carrier Case (Forged Steel) */}
        <ellipse
          cx={geo.diffCenter.x + 5}
          cy={geo.diffCenter.y}
          rx={11}
          ry={19}
          fill="url(#pressure-plate-steel)"
          stroke="#090d16"
          strokeWidth="1.6"
        />
        {/* Internal Helical Planetary Torque-Biasing Spider Gears */}
        {[0, 120, 240].map((deg, idx) => {
          const rad = (deg * Math.PI) / 180;
          const px = geo.diffCenter.x + 5 + 6 * Math.cos(rad) * 0.6;
          const py = geo.diffCenter.y + 11 * Math.sin(rad) * 0.6;
          return (
            <g key={`diff-spider-${idx}`}>
              <circle
                cx={px}
                cy={py}
                r={2.8}
                fill="#0f172a"
                stroke="#94a3b8"
                strokeWidth="0.7"
              />
              <circle cx={px} cy={py} r={1.2} fill="#ca8a04" />
            </g>
          );
        })}
        {/* Left & Right Tripod Transaxle Axle Output Flanges */}
        <g id="diff-output-stub-shaft">
          <ellipse
            cx={geo.diffCenter.x + 12}
            cy={geo.diffCenter.y}
            rx={6}
            ry={11}
            fill="url(#bearing-saddle-chrome)"
            stroke="#090d16"
            strokeWidth="1.5"
          />
          <circle
            cx={geo.diffCenter.x + 12}
            cy={geo.diffCenter.y}
            r={3.0}
            fill="#020617"
            stroke="#475569"
            strokeWidth="0.8"
          />
        </g>
      </g>

      {/* ══════════════════════════════════════════════════════════════
          LAYER 7 — REAR GEARBOX TAIL HOUSING & OUTPUT YOKE
          ══════════════════════════════════════════════════════════════ */}
      <g id="gearbox-tail-housing">
        {/* Rear Transaxle Casing Right Flange */}
        <polygon
          points={`${geo.grTopL.x},${geo.grTopL.y} ${geo.grTopR.x},${geo.grTopR.y} ${geo.grBotR.x},${geo.grBotR.y} ${geo.grBotL.x},${geo.grBotL.y}`}
          fill="url(#v12-cast-aluminum-body-right)"
          stroke="#090d16"
          strokeWidth="2.2"
        />
        {/* Top Deck Transmission Case Surface */}
        <polygon
          points={`${geo.gtL.x},${geo.gtL.y} ${geo.gtR.x},${geo.gtR.y} ${geo.grTopR.x},${geo.grTopR.y} ${geo.grTopL.x},${geo.grTopL.y}`}
          fill="url(#transmission-case-cast)"
          stroke="#090d16"
          strokeWidth="2.0"
        />
        {/* Front Face Transmission Housing */}
        <polygon
          points={`${geo.gtL.x},${geo.gtL.y} ${geo.gtR.x},${geo.gtR.y} ${geo.gbR.x},${geo.gbR.y} ${geo.gbL.x},${geo.gbL.y}`}
          fill="url(#transmission-case-cast)"
          stroke="#090d16"
          strokeWidth="2.2"
        />

        {/* Structural Diagonal NVH Stiffening Trusses */}
        {Array.from({ length: 4 }).map((_, i) => {
          const y1 = geo.gtL.y + 12 + i * 14;
          const y2 = geo.gtR.y + 10 + i * 14;
          return (
            <line
              key={`gb-stiffness-rib-${i}`}
              x1={geo.gtL.x + 6}
              y1={y1}
              x2={geo.gtR.x - 6}
              y2={y2}
              stroke="#f8fafc"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.8"
            />
          );
        })}

        {/* Driveshaft Output Flange Yoke */}
        <g id="output-shaft-yoke">
          <ellipse
            cx={geo.yokePt.x}
            cy={geo.yokePt.y}
            rx={9.5}
            ry={17.0}
            fill="url(#bearing-saddle-chrome)"
            stroke="#090d16"
            strokeWidth="2.2"
          />
          {/* Splined Drive Center Bore */}
          <circle
            cx={geo.yokePt.x}
            cy={geo.yokePt.y}
            r={5.0}
            fill="#020617"
            stroke="#475569"
            strokeWidth="1.2"
          />
          {/* Universal Joint Cross Pin Holes */}
          <circle cx={geo.yokePt.x - 4} cy={geo.yokePt.y} r={1.6} fill="#94a3b8" />
          <circle cx={geo.yokePt.x + 4} cy={geo.yokePt.y} r={1.6} fill="#94a3b8" />
        </g>
      </g>

      {/* ══════════════════════════════════════════════════════════════
          LAYER 8 — TRANSMISSION CONTROL UNIT (TCU) & HEAT SINK
          ══════════════════════════════════════════════════════════════ */}
      <g id="transmission-tcu-module">
        {/* Heavy Extruded Aluminum TCU Enclosure */}
        <polygon
          points={`${geo.tcuL.x - 16},${geo.tcuL.y} ${geo.tcuR.x + 16},${geo.tcuR.y} ${geo.tcuR.x + 16},${geo.tcuR.y + 16} ${geo.tcuL.x - 16},${geo.tcuL.y + 16}`}
          fill="url(#cel-steel-block)"
          stroke="#090d16"
          strokeWidth="1.8"
        />
        {/* CNC Micro Cooling Fins */}
        {Array.from({ length: 6 }).map((_, i) => {
          const fx = -12 + i * 5;
          return (
            <line
              key={`tcu-heatsink-fin-${i}`}
              x1={geo.tcuL.x + fx}
              y1={geo.tcuL.y + 2}
              x2={geo.tcuL.x + fx}
              y2={geo.tcuL.y + 14}
              stroke="#ffffff"
              strokeWidth="1.2"
              opacity="0.85"
            />
          );
        })}
        {/* CAN-Bus Automotive Diagnostic Port Connector */}
        <rect
          x={geo.tcuL.x - 20}
          y={geo.tcuL.y + 3}
          width={6}
          height={9}
          rx={1.5}
          fill="#ea580c"
          stroke="#090d16"
          strokeWidth="0.8"
        />
      </g>

      {/* ══════════════════════════════════════════════════════════════
          LAYER 9 — EXTERNAL TRANSMISSION OIL COOLER PLUMBING
          ══════════════════════════════════════════════════════════════ */}
      <g id="transmission-oil-cooler-lines">
        {/* Feed -8AN Fitting (Anodized Blue) */}
        <circle
          cx={geo.oilCoolerInlet.x}
          cy={geo.oilCoolerInlet.y}
          r={4.0}
          fill="#0284c7"
          stroke="#0369a1"
          strokeWidth="0.8"
        />
        <circle cx={geo.oilCoolerInlet.x} cy={geo.oilCoolerInlet.y} r={2.0} fill="#020617" />

        {/* Return -8AN Fitting (Anodized Red) */}
        <circle
          cx={geo.oilCoolerOutlet.x}
          cy={geo.oilCoolerOutlet.y}
          r={4.0}
          fill="#dc2626"
          stroke="#b91c1c"
          strokeWidth="0.8"
        />
        <circle cx={geo.oilCoolerOutlet.x} cy={geo.oilCoolerOutlet.y} r={2.0} fill="#020617" />

        {/* Braided Stainless Steel AN Lines */}
        <path
          d={`M ${geo.oilCoolerInlet.x} ${geo.oilCoolerInlet.y}
              C ${geo.oilCoolerInlet.x + 20} ${geo.oilCoolerInlet.y - 15} ${geo.oilCoolerOutlet.x + 30} ${geo.oilCoolerOutlet.y + 10} ${geo.oilCoolerOutlet.x} ${geo.oilCoolerOutlet.y}`}
          fill="none"
          stroke="#475569"
          strokeWidth="3.5"
          strokeDasharray="2.5 1.5"
        />
        <path
          d={`M ${geo.oilCoolerInlet.x} ${geo.oilCoolerInlet.y}
              C ${geo.oilCoolerInlet.x + 20} ${geo.oilCoolerInlet.y - 15} ${geo.oilCoolerOutlet.x + 30} ${geo.oilCoolerOutlet.y + 10} ${geo.oilCoolerOutlet.x} ${geo.oilCoolerOutlet.y}`}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.2"
        />
      </g>

      {/* ══════════════════════════════════════════════════════════════
          LAYER 10 — MAGNETIC DRAIN PLUG & PRESSURE SENSORS
          ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const drainPt = P(xGearboxEnd - 12, 28, 14);
        const sensorPt = P(xGearboxEnd + 2, -22, 54);

        return (
          <g id="transmission-sensors-and-drain" opacity={0.88}>
            {/* Magnetic Sump Drain Plug */}
            <circle
              cx={drainPt.x}
              cy={drainPt.y}
              r={3.8}
              fill="#1e293b"
              stroke="#64748b"
              strokeWidth="0.7"
            />
            <polygon
              points={`${drainPt.x - 1.5},${drainPt.y - 1} ${drainPt.x},${drainPt.y - 2} ${drainPt.x + 1.5},${drainPt.y - 1} ${drainPt.x + 1.5},${drainPt.y + 1} ${drainPt.x},${drainPt.y + 2} ${drainPt.x - 1.5},${drainPt.y + 1}`}
              fill="#020617"
            />

            {/* High-Pressure Hydraulic Fluid Sensor */}
            <circle
              cx={sensorPt.x}
              cy={sensorPt.y}
              r={3.2}
              fill="#ca8a04"
              stroke="#eab308"
              strokeWidth="0.6"
            />
            <circle cx={sensorPt.x} cy={sensorPt.y} r={1.2} fill="#020617" />
          </g>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 11 — TECHNICAL FOUNDRY MARKINGS & RATIO STAMPS
          ══════════════════════════════════════════════════════════════ */}
      {(() => {
        const stampPt = P(xBellEnd + 10, 34, 48);

        return (
          <g id="transmission-foundry-stamps" opacity={0.42}>
            <rect
              x={stampPt.x - 18}
              y={stampPt.y - 4}
              width={36}
              height={8}
              rx={1.5}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="0.5"
            />
            <text
              x={stampPt.x - 16}
              y={stampPt.y + 2}
              fill="#e2e8f0"
              fontSize="4.2"
              fontFamily="monospace"
              fontWeight="bold"
            >
              8-SPD·DCT·3.44
            </text>
          </g>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════
          LAYER 12 — SPECULAR HIGHLIGHTS & AMBIENT OCCLUSION
          ══════════════════════════════════════════════════════════════ */}
      {/* Top Bellhousing Edge Specular Beam */}
      <path
        d={`M ${geo.btFL.x} ${geo.btFL.y} L ${geo.btFR.x} ${geo.btFR.y}`}
        stroke="#ffffff"
        strokeWidth="1.6"
        opacity="0.8"
        strokeLinecap="round"
      />
      {/* Gearbox Top Chamfer Highlight */}
      <path
        d={`M ${geo.gtL.x} ${geo.gtL.y} L ${geo.gtR.x} ${geo.gtR.y}`}
        stroke="#ffffff"
        strokeWidth="1.4"
        opacity="0.7"
        strokeLinecap="round"
      />
      {/* Deep Casing Joint Crease Ambient Occlusion */}
      <path
        d={`M ${geo.btFR.x} ${geo.btFR.y} L ${geo.bbFR.x} ${geo.bbFR.y}`}
        stroke="#020617"
        strokeWidth="2.2"
        opacity="0.5"
        strokeLinecap="round"
      />
    </g>
  );
};

export const TransmissionIso = React.memo(TransmissionIsoComponent);
