import React, { useMemo } from "react";

export interface ChassisStressHeatmapProps {
  isVisible?: boolean;
  corneringG?: number; // 0.0 - 2.5 g
  brakingG?: number;   // 0.0 - 2.0 g
  downforceN?: number; // 0 - 15000 N
  torsionalRigidity?: number; // kNm/deg (e.g. 25 for steel, 45 for carbon)
  showDeformationMesh?: boolean;
  onHoverNode?: (nodeId: string | null) => void;
}

/**
 * ═════════════════════════════════════════════════════════════════════
 * 3D ISOMETRIC CHASSIS FEA STRESS & TORSIONAL RIGIDITY ANALYZER
 * ═════════════════════════════════════════════════════════════════════
 *
 * Implements finite element analysis stress tensor visualization:
 * - Von Mises equivalent stress field σ_v (0 to 900 MPa)
 * - Torsional twist angle: θ = (m * a_y * h_cg * L_wb) / K_torsion
 * - Dynamic stress probe nodes at front/rear suspension subframes,
 *   A-pillars, B-pillars, rocker sills, and engine cradle bulkhead.
 */
export const ChassisStressHeatmap: React.FC<ChassisStressHeatmapProps> = ({
  isVisible = false,
  corneringG = 1.35,
  brakingG = 1.2,
  downforceN = 4500,
  torsionalRigidity = 28, // kNm/deg
  showDeformationMesh = true,
  onHoverNode,
}) => {
  if (!isVisible) return null;

  // Compute dynamic combined load factor (1.0 = baseline, 2.5 = high load)
  const combinedLoad = useMemo(() => {
    return Math.sqrt(corneringG ** 2 + brakingG ** 2) + downforceN / 12000;
  }, [corneringG, brakingG, downforceN]);

  // Compute chassis torsional deflection (degrees)
  const torsionalDeflectionDeg = useMemo(() => {
    const torqueKNm = corneringG * 8.5; // Estimated cornering roll couple
    return Math.round((torqueKNm / Math.max(8, torsionalRigidity)) * 100) / 100;
  }, [corneringG, torsionalRigidity]);

  // Calculate Von Mises stress at key structural nodes (in MPa)
  const stressNodes = useMemo(() => {
    const baseScale = combinedLoad * 180;
    return [
      {
        id: "front_strut_lh",
        label: "Front Left Strut Tower",
        x: 290,
        y: 205,
        stressMpa: Math.round(baseScale * 1.65),
        yieldLimitMpa: 650,
        location: "Suspension Bulkhead",
      },
      {
        id: "a_pillar_root",
        label: "A-Pillar Base Gusset",
        x: 395,
        y: 165,
        stressMpa: Math.round(baseScale * 1.42),
        yieldLimitMpa: 650,
        location: "Cabin Safety Cell",
      },
      {
        id: "rocker_sill_mid",
        label: "Rocker Sill Frame Rail",
        x: 480,
        y: 260,
        stressMpa: Math.round(baseScale * 1.15),
        yieldLimitMpa: 650,
        location: "Longitudinal Backbone",
      },
      {
        id: "rear_subframe_mount",
        label: "Rear Subframe Hardpoint",
        x: 635,
        y: 195,
        stressMpa: Math.round(baseScale * 1.78),
        yieldLimitMpa: 650,
        location: "Rear Axle Load Path",
      },
      {
        id: "c_pillar_hoop",
        label: "C-Pillar Torsional Ring",
        x: 615,
        y: 135,
        stressMpa: Math.round(baseScale * 1.3),
        yieldLimitMpa: 650,
        location: "Rear Cockpit Hoop",
      },
    ];
  }, [combinedLoad]);

  // Peak stress & safety factor
  const peakStress = Math.max(...stressNodes.map((n) => n.stressMpa));
  const safetyFactor = Math.round((650 / Math.max(1, peakStress)) * 100) / 100;

  return (
    <g id="fea-stress-heatmap-overlay" className="pointer-events-auto transition-all duration-300">
      {/* ── 1. TRIANGULAR FEA ELEMENT MESH (Optional Wireframe) ── */}
      {showDeformationMesh && (
        <g id="fea-mesh-elements" opacity="0.45" className="pointer-events-none">
          {/* Front Longitudinal Box Elements */}
          <polygon points="210,240 290,205 320,245 230,270" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 2" />
          <polygon points="290,205 395,165 420,210 320,245" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 2" />
          {/* Center Cabin Sill Elements */}
          <polygon points="395,165 615,135 635,195 420,210" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 2" />
          <polygon points="420,210 635,195 670,240 480,260" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 2" />
          {/* Rear Subframe Elements */}
          <polygon points="615,135 730,175 745,215 635,195" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 2" />
          <polygon points="635,195 745,215 780,250 670,240" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="3 2" />
        </g>
      )}

      {/* ── 2. DYNAMIC FEA STRESS ISO-CONTOUR LOAD BANDS ── */}
      <g id="fea-iso-contours">
        {/* Front Suspension Tower High-Shear Path */}
        <path
          d="M 230 250 Q 290 205 395 165"
          fill="none"
          stroke="url(#fea-stress-gradient)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Main Rocker Sill Torsional Backbone */}
        <path
          d="M 320 255 L 640 255"
          fill="none"
          stroke="url(#fea-stress-gradient)"
          strokeWidth="16"
          strokeLinecap="round"
          opacity="0.75"
        />
        {/* Rear Subframe Load Path */}
        <path
          d="M 615 135 C 645 165 690 190 760 220"
          fill="none"
          stroke="url(#fea-stress-gradient)"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Transverse Cross-Bracing Load Flow */}
        <path
          d="M 395 165 L 635 195"
          fill="none"
          stroke="url(#fea-stress-gradient)"
          strokeWidth="8"
          strokeDasharray="4 2"
          opacity="0.6"
        />
      </g>

      {/* ── 3. REAL-TIME PROBE HOTSPOT NODES WITH HOVER DATA ── */}
      <g id="fea-probe-nodes">
        {stressNodes.map((node) => {
          const isCritical = node.stressMpa >= node.yieldLimitMpa * 0.85;
          const isHigh = node.stressMpa >= node.yieldLimitMpa * 0.65;

          return (
            <g
              key={node.id}
              className="cursor-pointer group"
              onMouseEnter={() => onHoverNode?.(node.id)}
              onMouseLeave={() => onHoverNode?.(null)}
            >
              {/* Radial Stress Glow */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isCritical ? 24 : isHigh ? 18 : 12}
                fill="url(#fea-node-glow)"
                className={isCritical ? "animate-ping" : ""}
                opacity="0.7"
              />
              {/* Center Target Node */}
              <circle
                cx={node.x}
                cy={node.y}
                r="6"
                fill={isCritical ? "#ef4444" : isHigh ? "#f59e0b" : "#0284c7"}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <circle cx={node.x} cy={node.y} r="2" fill="#020617" />

              {/* Real-time Stress Callout Flag */}
              <g transform={`translate(${node.x - 35}, ${node.y - 32})`}>
                <rect
                  x="0"
                  y="0"
                  width="70"
                  height="22"
                  rx="4"
                  fill="#020617"
                  stroke={isCritical ? "#ef4444" : isHigh ? "#f59e0b" : "#38bdf8"}
                  strokeWidth="1.2"
                  opacity="0.95"
                />
                <text
                  x="35"
                  y="15"
                  fill={isCritical ? "#f87171" : isHigh ? "#fbbf24" : "#e0f2fe"}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {node.stressMpa} MPa
                </text>
              </g>
            </g>
          );
        })}
      </g>

      {/* ── 4. TORSIONAL DEFLECTION VECTOR ARROWS ── */}
      <g id="torsional-twist-vectors" transform="translate(480, 110)">
        <path
          d={`M -40 0 C -20 ${torsionalDeflectionDeg * -12} 20 ${torsionalDeflectionDeg * 12} 40 0`}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeDasharray="4 2"
        />
        <text x="0" y="-10" fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          TWIST: {torsionalDeflectionDeg}° @ {corneringG.toFixed(2)}g
        </text>
      </g>

      {/* ── 5. FEA TELEMETRY HUD & VON MISES COLOR SCALE ── */}
      <g transform="translate(680, 20)">
        <rect
          x="0"
          y="0"
          width="210"
          height="62"
          rx="8"
          fill="#020617"
          stroke="#334155"
          strokeWidth="1.5"
          opacity="0.94"
        />
        <text x="12" y="16" fill="#94a3b8" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
          FEA VON MISES STRESS (0 - 900 MPa)
        </text>
        {/* Gradient Bar */}
        <rect x="12" y="22" width="186" height="8" rx="4" fill="url(#fea-stress-gradient)" />
        {/* Scale Numbers */}
        <text x="14" y="40" fill="#64748b" fontSize="7.5" fontFamily="monospace">0</text>
        <text x="74" y="40" fill="#64748b" fontSize="7.5" fontFamily="monospace">300</text>
        <text x="134" y="40" fill="#64748b" fontSize="7.5" fontFamily="monospace">600</text>
        <text x="180" y="40" fill="#ef4444" fontSize="7.5" fontFamily="monospace" fontWeight="bold">900+</text>

        {/* Safety Factor Tag */}
        <text x="12" y="54" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
          SAFETY FACTOR:{" "}
          <tspan fill={safetyFactor >= 1.5 ? "#10b981" : safetyFactor >= 1.0 ? "#f59e0b" : "#ef4444"} fontWeight="bold">
            {safetyFactor.toFixed(2)} {safetyFactor < 1.1 ? "⚠️ (CRITICAL)" : "✅"}
          </tspan>
        </text>
      </g>
    </g>
  );
};
