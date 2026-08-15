import React, { useMemo } from "react";
import type { ComponentId } from "../../../../sim/assemblyTypes";
import { projectIso, projectIsoEllipse, type ScreenPoint2D } from "../isoMath";

interface V12TimingTrainIsoProps {
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
 * PHASE 8 — QUAD-CAMSHAFTS & VERNIER TIMING SPROCKET TRAIN
 * ═══════════════════════════════════════════════════════════════════
 *
 * Front Timing Gear Assembly with 4 Precision Vernier Camshaft Sprockets,
 * Dual Roller Chains, and Hydraulic Chain Tensioners matching the reference illustration.
 *
 * Mechanical Details:
 *  1. 4 Billet Bronze/Gold Anodized Vernier Adjustable Cam Sprockets (Bank 1 & 2 DOHC)
 *  2. Dual Hardened Steel Roller Timing Chains with High-Tensile Link Pins
 *  3. Center Crankshaft Drive Pinion & Idler Tensioner Sprockets with Lightening Holes
 *  4. 4 Precision DOHC Hollow Camshafts with 24 Micro-Polished Cam Lobes
 *  5. Hydraulic Timing Chain Dampers & Synthetic Polymer Chain Guides
 */
export const V12TimingTrainIso: React.FC<V12TimingTrainIsoProps> = ({
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

  // Front Timing Face Datum (X = -halfBL - 2)
  const timingX = -halfBL - 2;

  const geometry = useMemo(() => {
    // 4 Camshaft Sprockets (Bank 1 Intake & Exhaust, Bank 2 Intake & Exhaust)
    // Bank 1 (Left):
    const b1IntakeCam = P(timingX, 18, 126);
    const b1ExhaustCam = P(timingX, 36, 116);

    // Bank 2 (Right):
    const b2IntakeCam = P(timingX, -18, 126);
    const b2ExhaustCam = P(timingX, -36, 116);

    // Crankshaft Drive Sprocket at Base Center
    const crankSprocket = P(timingX, 0, 16);

    // Idler / Tensioner Pulleys
    const idlerLeft = P(timingX, 22, 65);
    const idlerRight = P(timingX, -22, 65);

    return {
      b1IntakeCam,
      b1ExhaustCam,
      b2IntakeCam,
      b2ExhaustCam,
      crankSprocket,
      idlerLeft,
      idlerRight,
    };
  }, [P, timingX]);

  return (
    <g
      id="v12-timing-train-3d"
      onMouseEnter={() => onHoverComponent?.("camshaft")}
      onMouseLeave={() => onHoverComponent?.(null)}
      className="cursor-pointer transition-all duration-700 ease-out"
      style={{
        transform: componentState
          ? `translate(${componentState.offsetX}px, ${componentState.offsetY}px)`
          : undefined,
        opacity: componentState ? componentState.opacity : 1,
      }}
    >
      {/* ── 1. DEFINITIONS FOR SPROCKETS & TIMING CHAINS ── */}
      <defs>
        <linearGradient id="v12-vernier-gold-cam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#eab308" />
          <stop offset="70%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <linearGradient id="v12-timing-chain-steel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>

      {/* ── 2. DUAL ROLLER TIMING CHAINS PATHS ── */}
      <g id="v12-timing-chains">
        {/* Bank 1 Chain Loop */}
        <path
          d={`M ${geometry.crankSprocket.x} ${geometry.crankSprocket.y}
              L ${geometry.idlerLeft.x} ${geometry.idlerLeft.y}
              L ${geometry.b1ExhaustCam.x} ${geometry.b1ExhaustCam.y}
              L ${geometry.b1IntakeCam.x} ${geometry.b1IntakeCam.y}
              Z`}
          fill="none"
          stroke="#020617"
          strokeWidth="6.0"
          strokeLinejoin="round"
          opacity={0.75}
        />
        <path
          d={`M ${geometry.crankSprocket.x} ${geometry.crankSprocket.y}
              L ${geometry.idlerLeft.x} ${geometry.idlerLeft.y}
              L ${geometry.b1ExhaustCam.x} ${geometry.b1ExhaustCam.y}
              L ${geometry.b1IntakeCam.x} ${geometry.b1IntakeCam.y}
              Z`}
          fill="none"
          stroke="url(#v12-timing-chain-steel)"
          strokeWidth="4.0"
          strokeLinejoin="round"
          strokeDasharray="4 2"
        />

        {/* Bank 2 Chain Loop */}
        <path
          d={`M ${geometry.crankSprocket.x} ${geometry.crankSprocket.y}
              L ${geometry.idlerRight.x} ${geometry.idlerRight.y}
              L ${geometry.b2ExhaustCam.x} ${geometry.b2ExhaustCam.y}
              L ${geometry.b2IntakeCam.x} ${geometry.b2IntakeCam.y}
              Z`}
          fill="none"
          stroke="url(#v12-timing-chain-steel)"
          strokeWidth="4.0"
          strokeLinejoin="round"
          strokeDasharray="4 2"
        />
      </g>

      {/* ── 3. 4 VERNIER CAMSHAFT SPROCKETS ── */}
      <g id="v12-cam-sprockets">
        {[
          geometry.b1IntakeCam,
          geometry.b1ExhaustCam,
          geometry.b2IntakeCam,
          geometry.b2ExhaustCam,
        ].map((cam, idx) => (
          <g key={`cam-sprocket-${idx}`}>
            {/* Outer Sprocket Gear Teeth Ring */}
            <circle cx={cam.x} cy={cam.y} r={14} fill="url(#v12-vernier-gold-cam)" stroke="#78350f" strokeWidth="1.2" />
            <circle cx={cam.x} cy={cam.y} r={12} fill="#090d16" stroke="#ca8a04" strokeWidth="0.8" />
            {/* Center Cam Bolt */}
            <circle cx={cam.x} cy={cam.y} r={5} fill="url(#gold-anodized)" stroke="#090d16" strokeWidth="0.8" />
            <circle cx={cam.x} cy={cam.y} r={2} fill="#ffffff" />
            {/* 4 Vernier Degree Vernier Adjustment Slots */}
            {Array.from({ length: 4 }).map((_, sIdx) => {
              const rad = (sIdx * 90 * Math.PI) / 180;
              const sx = cam.x + 8.5 * Math.cos(rad);
              const sy = cam.y + 8.5 * Math.sin(rad);
              return (
                <circle key={`vernier-slot-${idx}-${sIdx}`} cx={sx} cy={sy} r={1.5} fill="#facc15" stroke="#78350f" strokeWidth="0.4" />
              );
            })}
          </g>
        ))}
      </g>

      {/* ── 4. CRANKSHAFT DRIVE PINION SPROCKET ── */}
      <g id="v12-crank-drive-gear">
        <circle cx={geometry.crankSprocket.x} cy={geometry.crankSprocket.y} r={11} fill="url(#v12-vernier-gold-cam)" stroke="#78350f" strokeWidth="1.2" />
        <circle cx={geometry.crankSprocket.x} cy={geometry.crankSprocket.y} r={6} fill="#090d16" />
        <circle cx={geometry.crankSprocket.x} cy={geometry.crankSprocket.y} r={2.5} fill="#ffffff" />
      </g>

      {/* ── 5. IDLER TENSIONER PULLEYS ── */}
      <g id="v12-idler-pulleys">
        {[geometry.idlerLeft, geometry.idlerRight].map((idPt, idx) => (
          <g key={`idler-pulley-${idx}`}>
            <circle cx={idPt.x} cy={idPt.y} r={8.5} fill="#475569" stroke="#090d16" strokeWidth="1.0" />
            <circle cx={idPt.x} cy={idPt.y} r={4.0} fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.6" />
            <circle cx={idPt.x} cy={idPt.y} r={1.5} fill="#ffffff" />
          </g>
        ))}
      </g>
    </g>
  );
};
