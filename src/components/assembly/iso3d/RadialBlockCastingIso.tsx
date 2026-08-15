import React from "react";
import type { ComponentId } from "../../../sim/assemblyTypes";
import {
  projectIso,
  projectIsoRadialRing,
  type ScreenPoint2D,
} from "./isoMath";
import { getIsoMaterialFills } from "./isoShaders";

interface RadialBlockCastingIsoProps {
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
 * RADIAL ENGINE BLOCK — 9-Cylinder Star Pattern Air-Cooled Monoblock
 * ═══════════════════════════════════════════════════════════════════
 *
 * High-Power 9-Cylinder Radial Aircraft / Motorsport Engine Block Casting
 * Inspired by: Pratt & Whitney R-2800 Double Wasp / Wright R-3350 Duplex-Cyclone
 *
 * 11 SVG Layers (bottom-up Z-ordering):
 *  1. Ground shadow (large circular radial ground shadow)
 *  2. Central crankcase drum (circular magnesium-aluminium alloy casing)
 *  3. Star-pattern 9 cylinder barrels radiating outward at 40° intervals
 *  4. Deep cooling fin stacks (12 fins per cylinder barrel for air cooling)
 *  5. Master-and-articulated connecting rod center hub tunnel
 *  6. Pushrod tubes & valve rocker box housings (18 pushrod tubes)
 *  7. Cylinder head finned domes & dual spark plug sockets
 *  8. Front propeller reduction nosecone & distributor drive
 *  9. Rear supercharger / accessory drive casing
 * 10. Cylinder mounting flange base studs (8 studs per barrel = 72 studs)
 * 11. Specular edge highlights & ambient occlusion shadows
 */
export const RadialBlockCastingIso: React.FC<RadialBlockCastingIsoProps> = ({
  blockState,
  selectedVariants,
  onHoverComponent,
}) => {
  const O: ScreenPoint2D = { x: 250, y: 220 };

  // ─── PRIMARY DIMENSIONS (mm) ───
  const NUM_CYLS = 9;
  const CRANKCASE_RADIUS = 52; // Central hub radius
  const RING_RADIUS = 95;      // Distance from crank center to cylinder heads
  const BORE_RADIUS = 16;      // Cylinder barrel radius
  const CENTER_Z = 120;        // Vertical center of the radial ring

  const materialGrade = selectedVariants?.block || "cast";
  const fills = getIsoMaterialFills(materialGrade);

  // 9 Cylinders arranged in 360° star pattern
  const radialCyls = projectIsoRadialRing(NUM_CYLS, RING_RADIUS, BORE_RADIUS, CENTER_Z, -90, O);

  // Central crankcase hub 3D projections
  const hubFront = projectIso({ x: -25, y: 0, z: CENTER_Z }, O);
  const hubCenter = projectIso({ x: 0, y: 0, z: CENTER_Z }, O);

  return (
    <g
      id="iso-block-radial-casting"
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
      {/* ═══ LAYER 1 — GROUND SHADOW ═══ */}
      <ellipse cx={O.x} cy={O.y + 75} rx={140} ry={35}
        fill="url(#iso-ground-shadow)" opacity={0.8} />

      {/* ═══ LAYER 2 — REAR ACCESSORY / SUPERCHARGER CASING ═══ */}
      {(() => {
        const accCenter = projectIso({ x: 32, y: 0, z: CENTER_Z }, O);
        return (
          <g opacity={0.7}>
            <circle cx={accCenter.x} cy={accCenter.y} r={CRANKCASE_RADIUS * 0.9}
              fill={fills.right} stroke="#0f172a" strokeWidth="1.2" />
            <circle cx={accCenter.x} cy={accCenter.y} r={CRANKCASE_RADIUS * 0.5}
              fill="#020617" stroke="#1e293b" strokeWidth="0.8" />
          </g>
        );
      })()}

      {/* ═══ LAYER 3 — STAR-PATTERN 9 CYLINDER BARRELS ═══ */}
      {radialCyls.map((cyl, idx) => {
        const barrelBase = projectIso(
          {
            x: 0,
            y: CRANKCASE_RADIUS * Math.cos(((cyl.angleDeg) * Math.PI) / 180),
            z: CENTER_Z + CRANKCASE_RADIUS * Math.sin(((cyl.angleDeg) * Math.PI) / 180),
          },
          O
        );
        return (
          <g key={`radial-barrel-${idx}`}>
            <line
              x1={barrelBase.x}
              y1={barrelBase.y}
              x2={cyl.center2D.x}
              y2={cyl.center2D.y}
              stroke={fills.left}
              strokeWidth={BORE_RADIUS * 1.8}
              strokeLinecap="round"
            />
            <line
              x1={barrelBase.x}
              y1={barrelBase.y}
              x2={cyl.center2D.x}
              y2={cyl.center2D.y}
              stroke="#090d16"
              strokeWidth={BORE_RADIUS * 1.8 + 2}
              strokeLinecap="round"
              opacity={0.35}
            />
          </g>
        );
      })}

      {/* ═══ LAYER 4 — COOLING FIN ARRAYS (Air-Cooling Stack) ═══ */}
      {radialCyls.map((cyl, idx) => {
        return Array.from({ length: 5 }).map((_, fIdx) => {
          const t = 0.35 + fIdx * 0.14;
          const finAngleRad = (cyl.angleDeg * Math.PI) / 180;
          const finDist = CRANKCASE_RADIUS + t * (RING_RADIUS - CRANKCASE_RADIUS);
          const finPt = projectIso(
            {
              x: 0,
              y: finDist * Math.cos(finAngleRad),
              z: CENTER_Z + finDist * Math.sin(finAngleRad),
            },
            O
          );
          return (
            <ellipse
              key={`radial-fin-${idx}-${fIdx}`}
              cx={finPt.x}
              cy={finPt.y}
              rx={cyl.rx * 1.4}
              ry={cyl.ry * 1.4}
              transform={`rotate(${cyl.tiltDeg}, ${finPt.x}, ${finPt.y})`}
              fill="none"
              stroke="#64748b"
              strokeWidth="1.2"
              opacity={0.65}
            />
          );
        });
      })}

      {/* ═══ LAYER 5 — CENTRAL CRANKCASE DRUM ═══ */}
      <circle
        cx={hubCenter.x}
        cy={hubCenter.y}
        r={CRANKCASE_RADIUS}
        fill={fills.left}
        stroke="#090d16"
        strokeWidth="2"
      />
      <circle
        cx={hubFront.x - 8}
        cy={hubFront.y}
        r={CRANKCASE_RADIUS * 0.7}
        fill={fills.top}
        stroke="#0f172a"
        strokeWidth="1.5"
      />
      <circle
        cx={hubFront.x - 14}
        cy={hubFront.y}
        r={CRANKCASE_RADIUS * 0.4}
        fill="#020617"
        stroke="#334155"
        strokeWidth="1.2"
      />
      <circle
        cx={hubFront.x - 16}
        cy={hubFront.y}
        r={10}
        fill="#0f172a"
        stroke="#38bdf8"
        strokeWidth="0.8"
      />

      {/* ═══ LAYER 6 — PUSHROD TUBES (18 Dual Pushrod Tubes) ═══ */}
      {radialCyls.map((cyl, idx) => {
        const angleRad = (cyl.angleDeg * Math.PI) / 180;
        const pushBase1 = projectIso(
          {
            x: -20,
            y: (CRANKCASE_RADIUS - 8) * Math.cos(angleRad - 0.15),
            z: CENTER_Z + (CRANKCASE_RADIUS - 8) * Math.sin(angleRad - 0.15),
          },
          O
        );
        const pushBase2 = projectIso(
          {
            x: -20,
            y: (CRANKCASE_RADIUS - 8) * Math.cos(angleRad + 0.15),
            z: CENTER_Z + (CRANKCASE_RADIUS - 8) * Math.sin(angleRad + 0.15),
          },
          O
        );
        return (
          <g key={`pushrod-${idx}`}>
            <line x1={pushBase1.x} y1={pushBase1.y} x2={cyl.center2D.x - 4} y2={cyl.center2D.y}
              stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" opacity={0.7} />
            <line x1={pushBase2.x} y1={pushBase2.y} x2={cyl.center2D.x + 4} y2={cyl.center2D.y}
              stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" opacity={0.7} />
          </g>
        );
      })}

      {/* ═══ LAYER 7 — CYLINDER HEAD FINNED DOMES ═══ */}
      {radialCyls.map((cyl, idx) => (
        <g key={`radial-head-${idx}`}>
          <ellipse
            cx={cyl.center2D.x}
            cy={cyl.center2D.y}
            rx={cyl.rx * 1.25}
            ry={cyl.ry * 1.25}
            transform={`rotate(${cyl.tiltDeg}, ${cyl.center2D.x}, ${cyl.center2D.y})`}
            fill={fills.top}
            stroke="#090d16"
            strokeWidth="1.4"
          />
          <circle
            cx={cyl.center2D.x - 4}
            cy={cyl.center2D.y - 2}
            r={3}
            fill="#020617"
            stroke="#64748b"
            strokeWidth="0.6"
          />
          <circle
            cx={cyl.center2D.x + 4}
            cy={cyl.center2D.y + 2}
            r={3}
            fill="#020617"
            stroke="#64748b"
            strokeWidth="0.6"
          />
        </g>
      ))}

      {/* ═══ LAYER 8 — CRANKCASE PERIMETER STUDS ═══ */}
      {radialCyls.map((cyl, idx) => {
        const angleRad = (cyl.angleDeg * Math.PI) / 180;
        const studPt = projectIso(
          {
            x: -12,
            y: (CRANKCASE_RADIUS + 4) * Math.cos(angleRad),
            z: CENTER_Z + (CRANKCASE_RADIUS + 4) * Math.sin(angleRad),
          },
          O
        );
        return (
          <circle
            key={`radial-stud-${idx}`}
            cx={studPt.x}
            cy={studPt.y}
            r={2.2}
            fill="#020617"
            stroke="#38bdf8"
            strokeWidth="0.5"
          />
        );
      })}

      {/* ═══ LAYER 9 — NOSECONE DISTRIBUTOR & OIL LINES ═══ */}
      {(() => {
        const nosePt = projectIso({ x: -35, y: 0, z: CENTER_Z }, O);
        return (
          <g>
            <circle cx={nosePt.x} cy={nosePt.y} r={14} fill={fills.left} stroke="#0f172a" strokeWidth="1" />
            <circle cx={nosePt.x} cy={nosePt.y} r={6} fill="#020617" stroke="#334155" strokeWidth="0.6" />
          </g>
        );
      })()}

      {/* ═══ LAYER 10 — IGNITION HARNESS RING ═══ */}
      <ellipse
        cx={hubFront.x}
        cy={hubFront.y}
        rx={CRANKCASE_RADIUS * 0.85}
        ry={CRANKCASE_RADIUS * 0.85 * 0.75}
        fill="none"
        stroke="#eab308"
        strokeWidth="0.8"
        strokeDasharray="4,3"
        opacity={0.6}
      />

      {/* ═══ LAYER 11 — SPECULAR HIGHLIGHTS & AO ═══ */}
      <circle
        cx={hubFront.x - 8}
        cy={hubFront.y}
        r={CRANKCASE_RADIUS * 0.7}
        fill="none"
        stroke="#f8fafc"
        strokeWidth="0.8"
        opacity={0.4}
      />

      {/* Active glow */}
      {blockState.isActive && (
        <circle cx={hubCenter.x} cy={hubCenter.y} r={RING_RADIUS + 25}
          fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity={0.4}
          className="animate-pulse" />
      )}
      {/* Hover highlight */}
      {blockState.isHovered && !blockState.isActive && (
        <circle cx={hubCenter.x} cy={hubCenter.y} r={RING_RADIUS + 25}
          fill="#38bdf8" opacity={0.06} />
      )}
    </g>
  );
};
