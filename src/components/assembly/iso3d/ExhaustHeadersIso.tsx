import React from "react";

interface ComponentState {
  isInstalled: boolean;
  isActive: boolean;
  isHovered: boolean;
  offsetX: number;
  offsetY: number;
  opacity: number;
  scale?: number;
  meta?: any;
}

interface ExhaustHeadersIsoProps {
  layoutSpec?: any;
  componentState?: ComponentState;
  exhaustState?: ComponentState;
  selectedVariants?: any;
  onHoverComponent?: (id: any) => void;
  materialFinish?: "inconel_heat_tint" | "ceramic_coated" | "titanium_blue";
}

/**
 * ═════════════════════════════════════════════════════════════════════
 * PHASE 21: EQUAL-LENGTH EXHAUST MANIFOLD & HEADERS 12-LAYER ASSEMBLY
 * ═════════════════════════════════════════════════════════════════════
 *
 * Implements full 12-layer hyper-realism architecture for Exhaust Headers:
 * - Layer 1: Ground AO drop shadow & primary runner ray-cast occlusion
 * - Layer 2: 3/8" Laser-cut 304SS exhaust head flange with oval port seals
 * - Layer 3: Mandrel-bent tuned equal-length primary runners (Runners 1, 2, 3, 4)
 * - Layer 4: Precision TIG weld puddle beads on slip joints & tube junctions
 * - Layer 5: High-velocity 4-into-1 merge collector with internal pyramid spike
 * - Layer 6: Inconel 625 heat-tint rainbow oxidation gradient shader overlay
 * - Layer 7: Stainless steel V-Band turbine exit flange & quick-release T-bolt
 * - Layer 8: 4 Individual EGT thermocouple bungs (1 per primary runner)
 * - Layer 9: 8 Flange mounting studs with copper anti-seize locking nuts
 * - Layer 10: Bosch Wideband LSU 4.9 O2 sensor bung & laser-etched serial tag
 * - Layer 11: Multi-tier specular tube highlights & razor-sharp radial reflections
 * - Layer 12: Interactive hover state illumination & 850°C glowing thermodynamic heat
 */
export const ExhaustHeadersIso: React.FC<ExhaustHeadersIsoProps> = ({
  componentState,
  exhaustState,
  onHoverComponent,
  materialFinish = "inconel_heat_tint",
}) => {
  const activeState = componentState || exhaustState || {
    isInstalled: true,
    isActive: false,
    isHovered: false,
    offsetX: 0,
    offsetY: 0,
    opacity: 1,
  };

  const isInstalled = activeState.isInstalled;

  const runnerFill =
    materialFinish === "ceramic_coated"
      ? "url(#photoreal-castiron-wall)"
      : materialFinish === "titanium_blue"
      ? "url(#photoreal-coolant-flow)"
      : "url(#photoreal-heat-tint)";

  // Exhaust Dimensions in Isometric Pixel Space
  const startX = 145;
  const startY = 175;
  const runnerPitch = 48;
  const collectorX = startX + 80;
  const collectorY = startY + 115;

  return (
    <g
      id="iso3d-exhaust-headers-hyperreal-assembly"
      className="transition-all duration-500 cursor-pointer"
      onMouseEnter={() => onHoverComponent && onHoverComponent("exhaust")}
      onMouseLeave={() => onHoverComponent && onHoverComponent(null)}
      style={{
        transform: `translate(${activeState.offsetX}px, ${activeState.offsetY}px)`,
        opacity: activeState.opacity,
      }}
    >
      {/* ── LAYER 1: GROUND AO DROP SHADOW & RAY-CAST OCCLUSION ── */}
      <g id="exhaust-layer1-ao-shadow">
        <ellipse
          cx={collectorX + 25}
          cy={collectorY + 35}
          rx={110}
          ry={24}
          fill="url(#photoreal-chassis-ground-ao)"
        />
      </g>

      {/* ── LAYER 2: 3/8" LASER-CUT HEAD FLANGE & OVAL PORTS ── */}
      <g id="exhaust-layer2-head-flange">
        <path
          d={`M${startX - 15} ${startY + 25}
             L${startX + 185} ${startY - 10}
             L${startX + 195} ${startY + 8}
             L${startX - 5} ${startY + 43} Z`}
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="1.5"
        />
        {/* 4 Exhaust Oval Ports */}
        {[0, 1, 2, 3].map((i) => {
          const px = startX + 15 + i * runnerPitch;
          const py = startY + 28 - i * 6.5;
          return (
            <g key={`exhaust-port-${i}`}>
              <ellipse cx={px} cy={py} rx="9" ry="6" fill="#020617" stroke="#334155" strokeWidth="1" />
              <ellipse cx={px} cy={py} rx="6" ry="4" fill="#090d16" />
            </g>
          );
        })}
      </g>

      {/* ── LAYER 3: EQUAL-LENGTH MANDREL-BENT PRIMARY RUNNERS (1-4) ── */}
      <g id="exhaust-layer3-primary-runners">
        {/* Runner 1 (Front Cylinder) */}
        <path
          d={`M${startX + 15} ${startY + 28}
             C${startX - 15} ${startY + 65}, ${startX + 25} ${startY + 105}, ${collectorX - 12} ${collectorY}`}
          fill="none"
          stroke={runnerFill}
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Runner 2 (Cylinder 2) */}
        <path
          d={`M${startX + 63} ${startY + 21.5}
             C${startX + 35} ${startY + 65}, ${startX + 55} ${startY + 95}, ${collectorX - 4} ${collectorY}`}
          fill="none"
          stroke={runnerFill}
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Runner 3 (Cylinder 3) */}
        <path
          d={`M${startX + 111} ${startY + 15}
             C${startX + 95} ${startY + 60}, ${startX + 85} ${startY + 95}, ${collectorX + 4} ${collectorY}`}
          fill="none"
          stroke={runnerFill}
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Runner 4 (Rear Cylinder) */}
        <path
          d={`M${startX + 159} ${startY + 8.5}
             C${startX + 185} ${startY + 55}, ${startX + 135} ${startY + 100}, ${collectorX + 12} ${collectorY}`}
          fill="none"
          stroke={runnerFill}
          strokeWidth="14"
          strokeLinecap="round"
        />
      </g>

      {/* ── LAYER 4: TIG WELD PUDDLE BEADS ── */}
      <g id="exhaust-layer4-tig-welds">
        {[0, 1, 2, 3].map((i) => {
          const wx = startX + 15 + i * runnerPitch;
          const wy = startY + 34 - i * 6.5;
          return (
            <ellipse
              key={`tig-weld-${i}`}
              cx={wx}
              cy={wy}
              rx="9"
              ry="3"
              fill="none"
              stroke="#eab308"
              strokeWidth="1.2"
              strokeDasharray="2,1"
            />
          );
        })}
      </g>

      {/* ── LAYER 5: HIGH-VELOCITY 4-INTO-1 MERGE COLLECTOR ── */}
      <g id="exhaust-layer5-merge-collector">
        <polygon
          points={`${collectorX - 18},${collectorY} ${collectorX + 18},${collectorY} ${collectorX + 12},${collectorY + 38} ${collectorX - 12},${collectorY + 38}`}
          fill="url(#photoreal-billet-skirt)"
          stroke="#64748b"
          strokeWidth="1.2"
        />
        {/* Internal High-Velocity Merge Spike Pyramid */}
        <polygon
          points={`${collectorX},${collectorY + 6} ${collectorX - 6},${collectorY + 24} ${collectorX + 6},${collectorY + 24}`}
          fill="#090d16"
          stroke="#38bdf8"
          strokeWidth="0.8"
        />
      </g>

      {/* ── LAYER 6: INCONEL HEAT-TINT RAINBOW SHADER OVERLAY ── */}
      <g id="exhaust-layer6-heat-tint-overlay" opacity="0.45" pointerEvents="none">
        <ellipse
          cx={collectorX}
          cy={collectorY + 15}
          rx="25"
          ry="15"
          fill="url(#photoreal-heat-tint)"
        />
      </g>

      {/* ── LAYER 7: V-BAND EXIT FLANGE & T-BOLT CLAMP ── */}
      <g id="exhaust-layer7-vband-flange">
        <ellipse
          cx={collectorX}
          cy={collectorY + 38}
          rx="15"
          ry="8"
          fill="#1e293b"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />
        <ellipse
          cx={collectorX}
          cy={collectorY + 38}
          rx="11"
          ry="5.5"
          fill="#020617"
          stroke="#38bdf8"
          strokeWidth="1"
        />
        {/* Quick Release T-Bolt Clamp */}
        <rect
          x={collectorX + 14}
          y={collectorY + 34}
          width="8"
          height="8"
          rx="1.5"
          fill="url(#photoreal-arp-black-oxide)"
          stroke="#0f172a"
          strokeWidth="0.8"
        />
      </g>

      {/* ── LAYER 8: 4 INDIVIDUAL EGT SENSOR BUNGS ── */}
      <g id="exhaust-layer8-egt-bungs">
        {[0, 1, 2, 3].map((i) => {
          const ex = startX + 12 + i * runnerPitch;
          const ey = startY + 46 - i * 6.5;
          return (
            <g key={`egt-bung-${i}`}>
              <circle cx={ex} cy={ey} r="2.8" fill="#020617" stroke="#38bdf8" strokeWidth="0.8" />
              <circle cx={ex} cy={ey} r="1.2" fill="#eab308" />
            </g>
          );
        })}
      </g>

      {/* ── LAYER 9: 8 HEAD FLANGE STUDS & COPPER NUTS ── */}
      <g id="exhaust-layer9-flange-studs">
        {[
          { x: startX - 8, y: startY + 28 },
          { x: startX + 38, y: startY + 20 },
          { x: startX + 86, y: startY + 13 },
          { x: startX + 134, y: startY + 6 },
          { x: startX + 182, y: startY - 2 },
          { x: startX + 15, y: startY + 38 },
          { x: startX + 63, y: startY + 31 },
          { x: startX + 111, y: startY + 24 },
        ].map((stud, idx) => (
          <g key={`exhaust-stud-${idx}`}>
            <circle cx={stud.x} cy={stud.y} r="3" fill="url(#photoreal-tin-gold)" stroke="#713f12" strokeWidth="0.8" />
            <circle cx={stud.x} cy={stud.y} r="1.2" fill="#020617" />
          </g>
        ))}
      </g>

      {/* ── LAYER 10: BOSCH O2 SENSOR & SERIAL ID ── */}
      <g id="exhaust-layer10-auxiliary-details">
        {/* Wideband O2 Sensor in Collector */}
        <ellipse cx={collectorX - 10} cy={collectorY + 20} rx="4" ry="6" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
        <circle cx={collectorX - 10} cy={collectorY + 20} r="1.8" fill="url(#photoreal-tin-gold)" />

        {/* Laser-Etched Serial Identification Tag */}
        <rect
          x={collectorX - 25}
          y={collectorY + 48}
          width="50"
          height="12"
          rx="2"
          fill="#0b0f17"
          stroke="#38bdf8"
          strokeWidth="0.8"
          opacity="0.8"
        />
        <text
          x={collectorX - 20}
          y={collectorY + 56}
          fill="#38bdf8"
          fontSize="6"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.8"
        >
          APX-HDR-321SS
        </text>
      </g>

      {/* ── LAYER 11: SPECULAR RUNNER HIGHLIGHTS ── */}
      <g id="exhaust-layer11-specular-highlights" pointerEvents="none">
        <path
          d={`M${startX + 15} ${startY + 28}
             C${startX - 15} ${startY + 65}, ${startX + 25} ${startY + 105}, ${collectorX - 12} ${collectorY}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          filter="url(#fe-specular-bloom)"
        />
      </g>

      {/* ── LAYER 12: 850°C COMBUSTION THERMAL GLOW ── */}
      {isInstalled && (
        <g id="exhaust-layer12-combustion-thermal-glow" opacity="0.32" pointerEvents="none">
          <ellipse
            cx={collectorX}
            cy={collectorY + 15}
            rx={45}
            ry={30}
            fill="url(#photoreal-heat-tint)"
          />
        </g>
      )}
    </g>
  );
};
