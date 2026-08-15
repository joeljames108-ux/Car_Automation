import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12ExhaustHeadersIsoProps {
  originScreen?: ScreenPoint2D;
  componentState?: {
    isInstalled: boolean;
    isActive: boolean;
    opacity: number;
    offsetX: number;
    offsetY: number;
  };
  onHoverComponent?: (id: ComponentId | null) => void;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * PHASE 14 — 6-INTO-1 HYDROFORMED INCONEL EQUAL-LENGTH EXHAUST HEADERS
 * ═══════════════════════════════════════════════════════════════════
 *
 * Left (Bank 1) and Right (Bank 2) 6-into-1 Hydroformed Inconel 625
 * Racing Exhaust Headers with Merge Collectors matching the illustration.
 *
 * Mechanical Details:
 *  1. 6 Equal-Length Primary Header Pipes per Bank with Thermal Ceramic Gold Tint
 *  2. High-Velocity Pyramidal 6-into-1 Merge Collector with Scavenge Spike
 *  3. Hydroformed Primary Runner Radius Bends for Maximum Pulse Scavenging
 *  4. CNC Billet Head Exhaust Flanges & Wideband O2 Lambda Sensor Bungs
 *  5. Large Diameter (Ø89mm) V-Band Exhaust Downpipe Discharge Interface
 */
export const V12ExhaustHeadersIso: React.FC<V12ExhaustHeadersIsoProps> = ({
  originScreen = { x: 250, y: 220 },
  componentState,
  onHoverComponent,
}) => {
  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen),
    [originScreen]
  );

  const blockLength = 236;
  const halfBL = blockLength / 2;

  // 6 Primary Runners on Bank 2 (Visible on Right/Rear side)
  const bank2Runners = useMemo(() => {
    const list: { ptHead: ScreenPoint2D; ptMid: ScreenPoint2D; ptCollector: ScreenPoint2D }[] = [];
    const collectorPt = P(halfBL + 25, -55, 45); // Rear merge collector

    for (let i = 0; i < 6; i++) {
      const cx = -halfBL + 22 + i * 36;
      const ptHead = P(cx, -42, 95);
      const ptMid = P(cx + 12, -62, 65);
      list.push({ ptHead, ptMid, ptCollector: collectorPt });
    }

    return { list, collectorPt };
  }, [P, halfBL]);

  // Exhaust Downpipe Discharge Outlet
  const exhaustOutlet = useMemo(() => P(halfBL + 42, -58, 42), [P, halfBL]);

  return (
    <g
      id="v12-exhaust-headers-3d"
      onMouseEnter={() => onHoverComponent?.("exhaust_headers")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState ? componentState.opacity : 1,
      }}
    >
      {/* ── 1. DEFINITIONS FOR INCONEL CERAMIC EXHAUST SHADERS ── */}
      <defs>
        {/* Ceramic Thermal Barrier Gold/Bronze Header Tube */}
        <linearGradient id="v12-inconel-header-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#f59e0b" />
          <stop offset="60%" stopColor="#d97706" />
          <stop offset="85%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>

        {/* Merge Collector Outlet Cone */}
        <linearGradient id="v12-exhaust-outlet-cone" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="50%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      {/* ── 2. 6-INTO-1 INCONEL PRIMARY HEADER TUBES ── */}
      <g id="v12-primary-header-tubes">
        {bank2Runners.list.map((r, idx) => (
          <g key={`exhaust-runner-${idx}`}>
            {/* Tube Drop Shadow */}
            <path
              d={`M ${r.ptHead.x} ${r.ptHead.y + 4}
                  Q ${r.ptMid.x} ${r.ptMid.y + 4} ${r.ptCollector.x} ${r.ptCollector.y + 4}`}
              fill="none"
              stroke="#020617"
              strokeWidth="9.0"
              strokeLinecap="round"
              opacity={0.65}
            />

            {/* Inconel Outer Tube Body */}
            <path
              d={`M ${r.ptHead.x} ${r.ptHead.y}
                  Q ${r.ptMid.x} ${r.ptMid.y} ${r.ptCollector.x} ${r.ptCollector.y}`}
              fill="none"
              stroke="url(#v12-inconel-header-gold)"
              strokeWidth="7.0"
              strokeLinecap="round"
            />

            {/* Specular White Ridge Glint */}
            <path
              d={`M ${r.ptHead.x} ${r.ptHead.y - 1.5}
                  Q ${r.ptMid.x} ${r.ptMid.y - 1.5} ${r.ptCollector.x} ${r.ptCollector.y - 1.5}`}
              fill="none"
              stroke="#fef08a"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity={0.88}
            />
          </g>
        ))}
      </g>

      {/* ── 3. MERGE COLLECTOR & V-BAND EXHAUST OUTLET ── */}
      <g id="v12-exhaust-merge-collector">
        {/* Pyramidal Merge Collector Body */}
        <ellipse
          cx={bank2Runners.collectorPt.x}
          cy={bank2Runners.collectorPt.y}
          rx={15}
          ry={9}
          fill="url(#v12-inconel-header-gold)"
          stroke="#090d16"
          strokeWidth="1.6"
        />

        {/* Large Diameter Exhaust Downpipe */}
        <polygon
          points={`${bank2Runners.collectorPt.x},${bank2Runners.collectorPt.y - 7} ${exhaustOutlet.x},${exhaustOutlet.y - 8} ${exhaustOutlet.x},${exhaustOutlet.y + 8} ${bank2Runners.collectorPt.x},${bank2Runners.collectorPt.y + 7}`}
          fill="url(#v12-exhaust-outlet-cone)"
          stroke="#090d16"
          strokeWidth="1.8"
        />

        {/* Circular V-Band Exhaust Discharge Rim */}
        <ellipse
          cx={exhaustOutlet.x}
          cy={exhaustOutlet.y}
          rx={10.5}
          ry={16.0}
          fill="#020617"
          stroke="#cbd5e1"
          strokeWidth="1.6"
        />
        <ellipse
          cx={exhaustOutlet.x}
          cy={exhaustOutlet.y}
          rx={8.0}
          ry={13.0}
          fill="#000000"
          stroke="#94a3b8"
          strokeWidth="0.8"
        />
      </g>
    </g>
  );
};
