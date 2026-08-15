import React, { useMemo } from "react";
import { projectIso, projectIsoEllipse, type ScreenPoint2D, type IsoPoint3D } from "../isoMath";

interface V12CoordinateStageProps {
  originScreen?: ScreenPoint2D;
  zoomLevel?: number;
  showPodium?: boolean;
  children?: React.ReactNode;
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * PHASE 1 — MASTER V12 ISOMETRIC COORDINATE FOUNDATION & GLASS PODIUM
 * ═══════════════════════════════════════════════════════════════════
 *
 * Provides the calibrated 3D Isometric Space and High-End Tempered Glass
 * Display Stage for the Racing-Spec 6.5L 60° V12 Engine Assembly.
 *
 * Features:
 *  1. 30-Degree Axonometric Spatial Transform Engine with Z-Ordering
 *  2. Multi-Tier Tempered Glass Stage with Chamfered Polished Crystal Edges
 *  3. Beveled Brushed Aluminum Perimeter Base Frame with Standoff Risers
 *  4. Multi-Layer Contact Shadow with Gaussian Soft Penumbra
 *  5. Overhead Studio Softbox Rim Lighting Gradients & Specular Glints
 */
export const V12CoordinateStage: React.FC<V12CoordinateStageProps> = ({
  originScreen = { x: 250, y: 220 },
  zoomLevel = 1.0,
  showPodium = true,
  children,
}) => {
  const P = useMemo(
    () => (x: number, y: number, z: number) => projectIso({ x, y, z }, originScreen),
    [originScreen]
  );

  // ─── GLASS PODIUM 3D DIMENSIONS ───
  const podiumLength = 320; // X axis
  const podiumWidth = 190;  // Y axis
  const podiumHeight = 16;  // Z thickness
  const podiumBaseZ = -34;  // Ground datum

  const halfPL = podiumLength / 2;
  const halfPW = podiumWidth / 2;

  // ─── 3D CORNER KEYPOINTS ───
  const glassCorners = useMemo(() => {
    // Glass Top Surface
    const tFL = P(-halfPL, halfPW, podiumBaseZ + podiumHeight);
    const tFR = P(halfPL, halfPW, podiumBaseZ + podiumHeight);
    const tBL = P(-halfPL, -halfPW, podiumBaseZ + podiumHeight);
    const tBR = P(halfPL, -halfPW, podiumBaseZ + podiumHeight);

    // Glass Bottom Surface
    const bFL = P(-halfPL, halfPW, podiumBaseZ);
    const bFR = P(halfPL, halfPW, podiumBaseZ);
    const bBL = P(-halfPL, -halfPW, podiumBaseZ);
    const bBR = P(halfPL, -halfPW, podiumBaseZ);

    // Metal Base Frame (Lower Sub-Plinth)
    const mFL = P(-halfPL - 8, halfPW + 8, podiumBaseZ - 6);
    const mFR = P(halfPL + 8, halfPW + 8, podiumBaseZ - 6);
    const mBL = P(-halfPL - 8, -halfPW - 8, podiumBaseZ - 6);
    const mBR = P(halfPL + 8, -halfPW - 8, podiumBaseZ - 6);

    // 4 Chrome Standoff Risers
    const standoffFL = P(-halfPL + 16, halfPW - 16, podiumBaseZ - 6);
    const standoffFR = P(halfPL - 16, halfPW - 16, podiumBaseZ - 6);
    const standoffBL = P(-halfPL + 16, -halfPW + 16, podiumBaseZ - 6);
    const standoffBR = P(halfPL - 16, -halfPW + 16, podiumBaseZ - 6);

    return {
      tFL, tFR, tBL, tBR,
      bFL, bFR, bBL, bBR,
      mFL, mFR, mBL, mBR,
      standoffFL, standoffFR, standoffBL, standoffBR,
    };
  }, [P, halfPL, halfPW, podiumBaseZ, podiumHeight]);

  return (
    <g id="v12-master-coordinate-stage" transform={`scale(${zoomLevel})`}>
      {/* ── 1. DEFINITIONS FOR GLASS & METAL PODIUM SHADERS ── */}
      <defs>
        {/* Tempered Glass Top Surface Tint */}
        <linearGradient id="podium-glass-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.22" />
          <stop offset="35%" stopColor="#bae6fd" stopOpacity="0.14" />
          <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.18" />
        </linearGradient>

        {/* Polished Glass Bevel Edge */}
        <linearGradient id="podium-glass-edge-front" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.75" />
          <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.65" />
        </linearGradient>

        <linearGradient id="podium-glass-edge-right" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#0284c7" stopOpacity="0.40" />
          <stop offset="100%" stopColor="#082f49" stopOpacity="0.60" />
        </linearGradient>

        {/* Brushed Aluminum Perimeter Frame */}
        <linearGradient id="podium-metal-frame" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="25%" stopColor="#cbd5e1" />
          <stop offset="55%" stopColor="#94a3b8" />
          <stop offset="85%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Multi-Tier Soft Ground Shadow */}
        <radialGradient id="v12-engine-floor-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#020617" stopOpacity="0.65" />
          <stop offset="75%" stopColor="#0f172a" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {showPodium && (
        <g id="glass-display-podium-assembly">
          {/* ── 2. OUTER GROUND PENUMBRA SHADOW ── */}
          <ellipse
            cx={originScreen.x}
            cy={originScreen.y + 115}
            rx={195}
            ry={54}
            fill="url(#v12-engine-floor-shadow)"
            opacity={0.8}
          />
          {/* Inner Contact Shadow */}
          <ellipse
            cx={originScreen.x}
            cy={originScreen.y + 105}
            rx={155}
            ry={40}
            fill="#000000"
            opacity={0.6}
          />

          {/* ── 3. LOWER BRUSHED ALUMINUM BASE FRAME ── */}
          <g id="podium-metal-base-frame">
            {/* Front Metal Rim */}
            <polygon
              points={`${glassCorners.mFL.x},${glassCorners.mFL.y} ${glassCorners.mFR.x},${glassCorners.mFR.y} ${glassCorners.bFR.x},${glassCorners.bFR.y} ${glassCorners.bFL.x},${glassCorners.bFL.y}`}
              fill="url(#podium-metal-frame)"
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            {/* Right Metal Rim */}
            <polygon
              points={`${glassCorners.mFR.x},${glassCorners.mFR.y} ${glassCorners.mBR.x},${glassCorners.mBR.y} ${glassCorners.bBR.x},${glassCorners.bBR.y} ${glassCorners.bFR.x},${glassCorners.bFR.y}`}
              fill="url(#podium-metal-frame)"
              stroke="#0f172a"
              strokeWidth="1.2"
              opacity={0.85}
            />
          </g>

          {/* ── 4. 4 CORNER CHROME STANDOFF RISERS ── */}
          {[
            glassCorners.standoffFL,
            glassCorners.standoffFR,
            glassCorners.standoffBL,
            glassCorners.standoffBR,
          ].map((pt, idx) => (
            <g key={`standoff-riser-${idx}`}>
              <ellipse cx={pt.x} cy={pt.y + 3} rx={6.5} ry={3.5} fill="#020617" opacity={0.6} />
              <ellipse cx={pt.x} cy={pt.y} rx={5.5} ry={3.0} fill="url(#podium-metal-frame)" stroke="#334155" strokeWidth="0.8" />
              <ellipse cx={pt.x} cy={pt.y - 4} rx={4.0} ry={2.2} fill="#f8fafc" stroke="#64748b" strokeWidth="0.6" />
            </g>
          ))}

          {/* ── 5. TEMPERED GLASS PLINTH FACETS ── */}
          <g id="tempered-glass-body">
            {/* Glass Front Chamfer Edge */}
            <polygon
              points={`${glassCorners.bFL.x},${glassCorners.bFL.y} ${glassCorners.bFR.x},${glassCorners.bFR.y} ${glassCorners.tFR.x},${glassCorners.tFR.y} ${glassCorners.tFL.x},${glassCorners.tFL.y}`}
              fill="url(#podium-glass-edge-front)"
              stroke="#38bdf8"
              strokeWidth="0.8"
            />
            {/* Glass Right Chamfer Edge */}
            <polygon
              points={`${glassCorners.bFR.x},${glassCorners.bFR.y} ${glassCorners.bBR.x},${glassCorners.bBR.y} ${glassCorners.tBR.x},${glassCorners.tBR.y} ${glassCorners.tFR.x},${glassCorners.tFR.y}`}
              fill="url(#podium-glass-edge-right)"
              stroke="#0284c7"
              strokeWidth="0.8"
            />
            {/* Glass Top Primary Work Surface */}
            <polygon
              points={`${glassCorners.tFL.x},${glassCorners.tFL.y} ${glassCorners.tFR.x},${glassCorners.tFR.y} ${glassCorners.tBR.x},${glassCorners.tBR.y} ${glassCorners.tBL.x},${glassCorners.tBL.y}`}
              fill="url(#podium-glass-top)"
              stroke="#7dd3fc"
              strokeWidth="1.2"
            />

            {/* Specular Front Edge Highlight Beam */}
            <line
              x1={glassCorners.tFL.x}
              y1={glassCorners.tFL.y}
              x2={glassCorners.tFR.x}
              y2={glassCorners.tFR.y}
              stroke="#ffffff"
              strokeWidth="1.8"
              opacity={0.9}
              strokeLinecap="round"
            />
            {/* Specular Left Edge Highlight Beam */}
            <line
              x1={glassCorners.tFL.x}
              y1={glassCorners.tFL.y}
              x2={glassCorners.tBL.x}
              y2={glassCorners.tBL.y}
              stroke="#f8fafc"
              strokeWidth="1.2"
              opacity={0.65}
              strokeLinecap="round"
            />

            {/* Diagonal Crystal Glint Streak across Glass Surface */}
            <path
              d={`M ${glassCorners.tFL.x + 35} ${glassCorners.tFL.y}
                  L ${glassCorners.tFR.x - 75} ${glassCorners.tFR.y - 25}
                  L ${glassCorners.tFR.x - 45} ${glassCorners.tFR.y - 25}
                  L ${glassCorners.tFL.x + 65} ${glassCorners.tFL.y}
                  Z`}
              fill="#ffffff"
              opacity={0.16}
            />
          </g>

          {/* ── 6. DIRECT ENGINE MOUNT ISOLATORS ON GLASS ── */}
          {(() => {
            const m1 = P(-60, 42, podiumBaseZ + podiumHeight);
            const m2 = P(60, 42, podiumBaseZ + podiumHeight);
            const m3 = P(-60, -42, podiumBaseZ + podiumHeight);
            const m4 = P(60, -42, podiumBaseZ + podiumHeight);
            return (
              <g id="engine-mount-footings">
                {[m1, m2, m3, m4].map((m, idx) => (
                  <g key={`glass-mount-pad-${idx}`}>
                    <ellipse cx={m.x} cy={m.y} rx={9.0} ry={5.0} fill="#090d16" stroke="#38bdf8" strokeWidth="0.8" />
                    <ellipse cx={m.x} cy={m.y - 1.5} rx={6.5} ry={3.5} fill="#1e293b" stroke="#64748b" strokeWidth="0.6" />
                    <circle cx={m.x} cy={m.y - 1.5} r={1.5} fill="#f8fafc" />
                  </g>
                ))}
              </g>
            );
          })()}
        </g>
      )}

      {/* ── 7. CHILD ENGINE & TRANSMISSION COMPONENTS ── */}
      <g id="v12-engine-assembly-payload">
        {children}
      </g>
    </g>
  );
};
