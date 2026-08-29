import React, { useEffect, useState } from "react";
import { Stage } from "../../StageSwitcher";
import { Sparkles, Zap, Wind, Shield, Activity, Cog, Layers, Car, Flame } from "lucide-react";

interface SectorEntryAnimationLayerProps {
  stage: Stage;
  onAnimationComplete?: () => void;
  accentHue?: number;
}

export const SectorEntryAnimationLayer: React.FC<SectorEntryAnimationLayerProps> = ({
  stage,
  onAnimationComplete,
  accentHue = 200,
}) => {
  const [animProgress, setAnimProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    setAnimProgress(0);
    const start = performance.now();
    const duration = 1400; // 1.4s entrance VFX

    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / duration);
      setAnimProgress(p);

      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setVisible(false);
          onAnimationComplete?.();
        }, 150);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage, onAnimationComplete]);

  if (!visible) return null;

  const isEngine = stage === "engine" || stage === "dyno_ecu";
  const isAero = stage === "aero" || stage === "wind_tunnel" || stage === "diffuser" || stage === "sduct";
  const isChassis = stage === "vehicle" || stage === "suspension3d" || stage === "brakes" || stage === "4ws";
  const isInterior = stage === "interior" || stage === "infotainment" || stage === "nvh";
  const isAssembly = stage === "manufacturing" || stage === "f1_constructor" || stage === "hypercar_constructor";
  const isSimulation = stage === "simulation" || stage === "testing" || stage === "track_battle" || stage === "race";

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden">
      {/* 1. Atmospheric Flash & Scanline Wipe */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, hsla(${accentHue}, 90%, 50%, ${Math.max(
            0,
            0.25 * (1 - animProgress)
          )}), transparent 70%)`,
          opacity: 1 - animProgress,
        }}
      />

      {/* 2. Top-to-Bottom Holographic Scan Laser */}
      <div
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_20px_#fbbf24]"
        style={{
          top: `${animProgress * 100}%`,
          opacity: Math.sin(animProgress * Math.PI) * 0.8,
          borderColor: `hsl(${accentHue}, 100%, 75%)`,
        }}
      />

      {/* 3. Custom Visual Language for Each Domain */}
      <div className="relative w-full max-w-2xl h-80 flex flex-col items-center justify-center">
        {/* --- ENGINE ASSEMBLY KINEMATICS --- */}
        {isEngine && (
          <div className="relative flex flex-col items-center gap-4">
            <svg className="w-80 h-52 overflow-visible" viewBox="0 0 320 200">
              {/* Engine Block Casting */}
              <rect
                x="60"
                y="40"
                width="200"
                height="130"
                rx="16"
                fill="none"
                stroke={`hsl(${accentHue}, 90%, 70%)`}
                strokeWidth="2.5"
                strokeDasharray="600"
                strokeDashoffset={600 * (1 - Math.min(1, animProgress * 1.8))}
                className="filter drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]"
              />

              {/* Cylinders & Pistons Staggered Drop */}
              {[90, 140, 190, 230].map((x, idx) => {
                const dropProgress = Math.max(0, Math.min(1, (animProgress - 0.2 - idx * 0.1) * 3));
                return (
                  <g key={x} opacity={dropProgress}>
                    <rect
                      x={x - 12}
                      y={60 + (1 - dropProgress) * -40}
                      width="24"
                      height="38"
                      rx="4"
                      fill={`hsl(${accentHue}, 80%, 55%)`}
                      fillOpacity="0.35"
                      stroke={`hsl(${accentHue}, 95%, 80%)`}
                      strokeWidth="1.5"
                    />
                    <line
                      x1={x}
                      y1={98 + (1 - dropProgress) * -40}
                      x2={x}
                      y2={150}
                      stroke="rgba(255,255,255,0.7)"
                      strokeWidth="2"
                      strokeDasharray="2 2"
                    />
                  </g>
                );
              })}

              {/* Crankshaft Centerline */}
              {animProgress > 0.4 && (
                <line
                  x1="50"
                  y1="150"
                  x2="270"
                  y2="150"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  className="animate-pulse"
                />
              )}

              {/* Turbo / Ignition Sparks */}
              {animProgress > 0.6 && (
                <g className="animate-ping" opacity={0.8}>
                  <circle cx="275" cy="70" r="14" fill="none" stroke="#f59e0b" strokeWidth="2" />
                  <line x1="260" y1="70" x2="290" y2="70" stroke="#f59e0b" strokeWidth="2" />
                </g>
              )}
            </svg>
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-sky-300 uppercase">
              <Cog size={14} className="animate-spin text-amber-400" />
              <span>ENGAGING POWERTRAIN MATRIX · MECHANICAL SYNC</span>
            </div>
          </div>
        )}

        {/* --- AERODYNAMICS STREAMLINES --- */}
        {isAero && (
          <div className="relative flex flex-col items-center gap-4">
            <svg className="w-96 h-48 overflow-visible" viewBox="0 0 380 180">
              {/* Car Body Silhouette Wireframe */}
              <path
                d="M 40 140 Q 90 135, 120 110 Q 150 60, 220 60 Q 280 60, 310 110 Q 330 135, 360 140 Z"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
              />

              {/* CFD Flow Streamlines Sweeping Left to Right */}
              {[40, 70, 100, 130].map((y, idx) => {
                const waveOffset = (1 - animProgress) * 400;
                return (
                  <path
                    key={y}
                    d={`M 10 ${y} Q 140 ${y - 25 + idx * 8}, 220 ${y - 30} Q 300 ${y - 15}, 370 ${y + 10}`}
                    fill="none"
                    stroke={`hsl(${180 + idx * 25}, 95%, 68%)`}
                    strokeWidth="2"
                    strokeDasharray="40 20"
                    strokeDashoffset={waveOffset}
                    className="filter drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
                  />
                );
              })}

              {/* Downforce Force Vectors */}
              {animProgress > 0.5 && (
                <g className="animate-pulse">
                  <line x1="160" y1="50" x2="160" y2="85" stroke="#d97706" strokeWidth="2.5" markerEnd="url(#arrow)" />
                  <line x1="280" y1="50" x2="280" y2="95" stroke="#d97706" strokeWidth="2.5" />
                  <polygon points="156,80 160,88 164,80" fill="#d97706" />
                  <polygon points="276,90 280,98 284,90" fill="#d97706" />
                </g>
              )}
            </svg>
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-amber-300 uppercase">
              <Wind size={14} className="animate-pulse text-amber-400" />
              <span>CFD WIND TUNNEL ACTIVATED · GENERATING DOWNFORCE</span>
            </div>
          </div>
        )}

        {/* --- CHASSIS STRUCTURAL LATTICE --- */}
        {isChassis && (
          <div className="relative flex flex-col items-center gap-4">
            <svg className="w-80 h-52 overflow-visible" viewBox="0 0 320 200">
              {/* Spaceframe Truss Nodes */}
              {[
                [60, 150, 120, 110],
                [120, 110, 200, 110],
                [200, 110, 260, 150],
                [120, 110, 140, 50],
                [140, 50, 180, 50],
                [180, 50, 200, 110],
                [60, 150, 260, 150],
              ].map(([x1, y1, x2, y2], idx) => {
                const lineProgress = Math.max(0, Math.min(1, (animProgress - idx * 0.08) * 3));
                return (
                  <line
                    key={idx}
                    x1={x1}
                    y1={y1}
                    x2={x1 + (x2 - x1) * lineProgress}
                    y2={y1 + (y2 - y1) * lineProgress}
                    stroke={`hsl(${accentHue}, 95%, 72%)`}
                    strokeWidth="2.5"
                    className="filter drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]"
                  />
                );
              })}

              {/* Weld Joint Sparks */}
              {animProgress > 0.4 && (
                <g>
                  {[
                    [120, 110],
                    [200, 110],
                    [140, 50],
                    [180, 50],
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="4" fill="#ffffff" className="animate-ping" />
                  ))}
                </g>
              )}
            </svg>
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-amber-300 uppercase">
              <Shield size={14} className="animate-bounce text-amber-400" />
              <span>CHASSIS HARDPOINTS LOCKED · TORSIONAL RIGIDITY MAXIMUM</span>
            </div>
          </div>
        )}

        {/* --- INTERIOR COCKPIT TRANSITION --- */}
        {isInterior && (
          <div className="relative flex flex-col items-center gap-4">
            <div className="relative w-72 h-44 rounded-2xl border-2 border-fuchsia-400/60 bg-fuchsia-950/20 backdrop-blur-md p-4 flex flex-col justify-between overflow-hidden shadow-[0_0_30px_rgba(217,70,239,0.35)]">
              <div className="flex justify-between items-center text-[10px] font-mono text-fuchsia-300">
                <span>OLED COCKPIT V4.0</span>
                <span>CALIBRATED</span>
              </div>
              <div className="flex items-center justify-center gap-4 my-auto">
                <div className="w-16 h-16 rounded-full border border-fuchsia-400/40 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-fuchsia-300 animate-spin" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-2 w-24 bg-fuchsia-400/40 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-fuchsia-400 rounded-full transition-all duration-300"
                      style={{ width: `${animProgress * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-fuchsia-200 font-bold">CABIN AMBIENT 64-COLOR</span>
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent" />
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-fuchsia-300 uppercase">
              <Sparkles size={14} className="animate-spin text-fuchsia-400" />
              <span>INITIALIZING DIGITAL CABIN · ERGONOMIC HUD ONLINE</span>
            </div>
          </div>
        )}

        {/* --- VEHICLE ASSEMBLY MODULAR FLY-IN --- */}
        {isAssembly && (
          <div className="relative flex flex-col items-center gap-4">
            <svg className="w-80 h-52 overflow-visible" viewBox="0 0 320 200">
              {/* Chassis Base */}
              <rect x="50" y="110" width="220" height="30" rx="8" fill="none" stroke="#f59e0b" strokeWidth="2" />
              {/* Fly-in Components */}
              <rect
                x="80"
                y={60 + (1 - animProgress) * -80}
                width="60"
                height="40"
                rx="6"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
                opacity={animProgress}
              />
              <rect
                x="180"
                y={60 + (1 - animProgress) * -80}
                width="70"
                height="40"
                rx="6"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                opacity={animProgress}
              />
              {/* Magnetic Snap Reticles */}
              {animProgress > 0.7 && (
                <g>
                  <circle cx="110" cy="110" r="10" fill="none" stroke="#fbbf24" strokeWidth="1.5" className="animate-ping" />
                  <circle cx="215" cy="110" r="10" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping" />
                </g>
              )}
            </svg>
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-amber-300 uppercase">
              <Layers size={14} className="animate-pulse text-amber-400" />
              <span>ROBOTIC CELL DOCKED · MODULAR COMPONENT SNAP</span>
            </div>
          </div>
        )}

        {/* --- SIMULATION & TESTING --- */}
        {isSimulation && (
          <div className="relative flex flex-col items-center gap-4">
            <svg className="w-80 h-52 overflow-visible" viewBox="0 0 320 200">
              {/* Telemetry Wave Grid */}
              <path
                d="M 20 150 Q 80 150, 100 80 T 180 130 T 260 50 T 300 150"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeDasharray="400"
                strokeDashoffset={400 * (1 - animProgress)}
                className="filter drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]"
              />
              <line x1="20" y1="150" x2="300" y2="150" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              {/* Dyno Rollers */}
              <circle cx="80" cy="165" r="16" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-spin" />
              <circle cx="240" cy="165" r="16" fill="none" stroke="#ef4444" strokeWidth="2" className="animate-spin" />
            </svg>
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-rose-300 uppercase">
              <Flame size={14} className="animate-bounce text-rose-400" />
              <span>DYNAMOMETER SPUN UP · TRACK TELEMETRY STREAMING</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
