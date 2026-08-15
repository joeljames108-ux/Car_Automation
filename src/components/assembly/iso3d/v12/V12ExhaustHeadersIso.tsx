import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12ExhaustHeadersIsoProps {
  originScreen?: ScreenPoint2D;
  explodedAmount?: number;
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
 * 6-into-1 Hydroformed Inconel 625 Racing Exhaust Headers with organic
 * 3D continuous cubic Bézier sweeping splines and conical merge collector.
 */
export const V12ExhaustHeadersIso: React.FC<V12ExhaustHeadersIsoProps> = ({
  originScreen = { x: 290, y: 245 },
  explodedAmount = 0,
  componentState,
  onHoverComponent,
}) => {
  const expY = explodedAmount * -35; // Expands outward along -Y flank

  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y: y + expY, z }, originScreen),
    [originScreen, expY]
  );

  const blockLength = 236;
  const halfBL = blockLength / 2;

  // 6 Primary Runners on Bank 2 with organic multi-point curved spline geometry
  const bank2Runners = useMemo(() => {
    const list: {
      idx: number;
      ptHead: ScreenPoint2D;
      cp1: ScreenPoint2D;
      cp2: ScreenPoint2D;
      ptMid: ScreenPoint2D;
      cp3: ScreenPoint2D;
      cp4: ScreenPoint2D;
      ptCollector: ScreenPoint2D;
    }[] = [];
    const collectorPt = P(halfBL + 25, -55, 45); // Rear merge collector

    for (let i = 0; i < 6; i++) {
      const cx = -halfBL + 22 + i * 36;
      const ptHead = P(cx, -42, 95);
      // Segment 1: Downward & outward sweeping curve from head port
      const cp1 = P(cx + 8, -58, 88);
      const cp2 = P(cx + 18, -64, 76);
      const ptMid = P(cx + 24, -62, 65);
      // Segment 2: Sweeping into conical merge collector at rear
      const cp3 = P(cx + (halfBL + 25 - cx) * 0.45, -60, 52);
      const cp4 = P(halfBL + 14, -58, 48);
      list.push({ idx: i, ptHead, cp1, cp2, ptMid, cp3, cp4, ptCollector: collectorPt });
    }

    return { list, collectorPt };
  }, [P, halfBL]);

  // Exhaust Downpipe Discharge Outlet Cone
  const exhaustOutlet = useMemo(() => P(halfBL + 42, -58, 42), [P, halfBL]);

  const isInstalled = componentState ? componentState.isInstalled : true;
  const opacity = componentState ? componentState.opacity : 1;

  if (!isInstalled && opacity === 0) return null;

  return (
    <g
      id="v12-exhaust-headers-3d"
      onMouseEnter={() => onHoverComponent?.("exhaust_headers")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-500 ease-out"
      style={{
        opacity,
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
      }}
    >
      <defs>
        {/* Ceramic Thermal Barrier Gold/Bronze Header Tube */}
        <linearGradient id="v12-inconel-header-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="22%" stopColor="#f59e0b" />
          <stop offset="55%" stopColor="#ea580c" />
          <stop offset="82%" stopColor="#9a3412" />
          <stop offset="100%" stopColor="#431407" />
        </linearGradient>

        {/* Specular Ridge Glint */}
        <linearGradient id="v12-header-specular" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#fef08a" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0.1" />
        </linearGradient>

        {/* Merge Collector Outlet Cone */}
        <linearGradient id="v12-exhaust-outlet-cone" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="50%" stopColor="#9a3412" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      {/* ── 2. 6-INTO-1 INCONEL PRIMARY HEADER TUBES WITH CONTINUOUS BÉZIER SPLINES ── */}
      <g id="v12-primary-header-tubes">
        {bank2Runners.list.map((r) => (
          <g key={`exhaust-runner-${r.idx}`}>
            {/* 1. Volumetric Drop Shadow */}
            <path
              d={`M ${r.ptHead.x} ${r.ptHead.y + 6}
                  C ${r.cp1.x} ${r.cp1.y + 6}, ${r.cp2.x} ${r.cp2.y + 6}, ${r.ptMid.x} ${r.ptMid.y + 6}
                  C ${r.cp3.x} ${r.cp3.y + 6}, ${r.cp4.x} ${r.cp4.y + 6}, ${r.ptCollector.x} ${r.ptCollector.y + 6}`}
              fill="none"
              stroke="#020617"
              strokeWidth="9.5"
              strokeLinecap="round"
              opacity={0.65}
            />

            {/* 2. Hydroformed Inconel 625 Outer Tube Body */}
            <path
              d={`M ${r.ptHead.x} ${r.ptHead.y}
                  C ${r.cp1.x} ${r.cp1.y}, ${r.cp2.x} ${r.cp2.y}, ${r.ptMid.x} ${r.ptMid.y}
                  C ${r.cp3.x} ${r.cp3.y}, ${r.cp4.x} ${r.cp4.y}, ${r.ptCollector.x} ${r.ptCollector.y}`}
              fill="none"
              stroke="url(#v12-inconel-header-gold)"
              strokeWidth="7.8"
              strokeLinecap="round"
            />

            {/* 3. High-Gloss Specular Heat Ridge Glint */}
            <path
              d={`M ${r.ptHead.x} ${r.ptHead.y - 1.8}
                  C ${r.cp1.x} ${r.cp1.y - 1.8}, ${r.cp2.x} ${r.cp2.y - 1.8}, ${r.ptMid.x} ${r.ptMid.y - 1.8}
                  C ${r.cp3.x} ${r.cp3.y - 1.8}, ${r.cp4.x} ${r.cp4.y - 1.8}, ${r.ptCollector.x} ${r.ptCollector.y - 1.8}`}
              fill="none"
              stroke="url(#v12-header-specular)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* 4. Laser-Cut CNC Exhaust Port Flange with Radiused Fillet */}
            <ellipse
              cx={r.ptHead.x}
              cy={r.ptHead.y}
              rx={7.5}
              ry={4.2}
              fill="#b45309"
              stroke="#090d16"
              strokeWidth="1.0"
            />
            <ellipse
              cx={r.ptHead.x}
              cy={r.ptHead.y}
              rx={6.0}
              ry={3.0}
              fill="#78350f"
              stroke="#fef08a"
              strokeWidth="0.6"
            />
          </g>
        ))}
      </g>

      {/* ── 3. 6-INTO-1 MERGE COLLECTOR & V-BAND PYRAMIDAL CONE ── */}
      <g id="v12-merge-collector">
        {/* Curved Merge Collector Transition Flare */}
        <path
          d={`M ${bank2Runners.collectorPt.x - 12} ${bank2Runners.collectorPt.y - 10}
              C ${bank2Runners.collectorPt.x} ${bank2Runners.collectorPt.y - 12},
                ${exhaustOutlet.x - 6} ${exhaustOutlet.y - 10},
                ${exhaustOutlet.x} ${exhaustOutlet.y - 8}
              L ${exhaustOutlet.x} ${exhaustOutlet.y + 8}
              C ${exhaustOutlet.x - 6} ${exhaustOutlet.y + 10},
                ${bank2Runners.collectorPt.x} ${bank2Runners.collectorPt.y + 12},
                ${bank2Runners.collectorPt.x - 12} ${bank2Runners.collectorPt.y + 10}
              Z`}
          fill="url(#v12-exhaust-outlet-cone)"
          stroke="#431407"
          strokeWidth="1.6"
        />

        {/* Billet CNC V-Band Discharge Flange Clamp */}
        <ellipse
          cx={exhaustOutlet.x}
          cy={exhaustOutlet.y}
          rx={9.5}
          ry={14.0}
          fill="#1e293b"
          stroke="#f59e0b"
          strokeWidth="2.2"
        />
        <ellipse
          cx={exhaustOutlet.x}
          cy={exhaustOutlet.y}
          rx={7.5}
          ry={11.5}
          fill="#020617"
          stroke="#ffffff"
          strokeWidth="0.8"
          opacity="0.85"
        />

        {/* Wideband O2 Lambda Sensor Bung */}
        <circle
          cx={bank2Runners.collectorPt.x + 8}
          cy={bank2Runners.collectorPt.y - 4}
          r={3.8}
          fill="#ca8a04"
          stroke="#090d16"
          strokeWidth="0.9"
        />
      </g>
    </g>
  );
};
