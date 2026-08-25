import React, { useEffect, useRef, useState } from "react";
import { Zap, Sparkles, Orbit, Compass, ArrowRight, Shield, Cpu, Activity } from "lucide-react";
import { playSubsystemEngageSound, playHologramScanSound } from "../interactive/NeonHorizonSoundEngine";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

interface CinematicGlobeBootSequenceProps {
  onComplete: () => void;
}

export const CinematicGlobeBootSequence: React.FC<CinematicGlobeBootSequenceProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [phase, setPhase] = useState<
    "particles" | "arcs" | "wireframe" | "solid" | "rings" | "silhouette" | "ready"
  >("particles");
  const [statusText, setStatusText] = useState("INITIALIZING PARTICLE MATRIX...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.24;

    // Particle swarm
    const particleCount = 220;
    const particles = Array.from({ length: particleCount }, () => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = R * (1.8 + Math.random() * 2.2);
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        tx: R * Math.sin(phi) * Math.cos(theta),
        ty: R * Math.sin(phi) * Math.sin(theta),
        tz: R * Math.cos(phi),
        speed: 0.04 + Math.random() * 0.04,
        size: 0.8 + Math.random() * 1.6,
        hue: 180 + Math.random() * 45,
      };
    });

    let startTime = performance.now();
    let raf = 0;

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, w, h);

      // Phases:
      // 0.0 - 0.7s: Particles swarm inward
      // 0.7 - 1.4s: Electrical arcs fire
      // 1.4 - 2.2s: Wireframe sphere forms
      // 2.2 - 2.9s: Solid holographic surface & rings ignite
      // 2.9 - 3.6s: Vehicle wireframe silhouette projects
      // 3.6+ s: Ready -> UI unlock

      const p = Math.min(1, elapsed / 3.6);
      setProgress(Math.round(p * 100));

      if (elapsed < 0.7) {
        setPhase("particles");
        setStatusText("INITIALIZING STARDUST & GRAVITATIONAL CORE...");
      } else if (elapsed < 1.4) {
        setPhase("arcs");
        setStatusText("HIGH-VOLTAGE ELECTRICAL ARCS CONVERGING...");
      } else if (elapsed < 2.2) {
        setPhase("wireframe");
        setStatusText("COMPUTING 3D GEODESIC PLANETARY LATTICE...");
      } else if (elapsed < 2.9) {
        setPhase("rings");
        setStatusText("CALIBRATING ORBITAL SATELLITE STATIONS & FLUX RINGS...");
      } else if (elapsed < 3.6) {
        setPhase("silhouette");
        setStatusText("PROJECTING VEHICLE DIGITAL TWIN ARCHITECTURE...");
      } else {
        setPhase("ready");
        setStatusText("SYSTEM ONLINE · WELCOME TO APEX ENGINEER");
      }

      // Draw particle swarm moving inward
      const pProgress = Math.min(1, elapsed / 1.6);
      for (const pt of particles) {
        const curX = pt.x + (pt.tx - pt.x) * Math.pow(pProgress, 1.8);
        const curY = pt.y + (pt.ty - pt.y) * Math.pow(pProgress, 1.8);
        const curZ = pt.z + (pt.tz - pt.z) * Math.pow(pProgress, 1.8);

        // 3D rotation
        const rotY = elapsed * 0.8;
        const rx = curX * Math.cos(rotY) + curZ * Math.sin(rotY);
        const rz = -curX * Math.sin(rotY) + curZ * Math.cos(rotY);

        const scale = (rz + R * 3) / (R * 3);
        const sx = cx + rx;
        const sy = cy + curY;

        ctx.fillStyle = `hsla(${pt.hue}, 95%, 72%, ${Math.max(0.2, (rz + R) / (2 * R))})`;
        ctx.beginPath();
        ctx.arc(sx, sy, pt.size * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw electrical arcs
      if (elapsed > 0.6 && elapsed < 2.4) {
        const arcCount = 4;
        for (let a = 0; a < arcCount; a++) {
          ctx.strokeStyle = `hsla(${190 + a * 20}, 100%, 80%, ${Math.random() * 0.8})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);

          let curAx = cx;
          let curAy = cy;
          for (let seg = 0; seg < 6; seg++) {
            const angle = (a / arcCount) * Math.PI * 2 + elapsed * 3;
            const dist = (seg / 6) * R * 1.3;
            curAx = cx + Math.cos(angle) * dist + (Math.random() - 0.5) * 20;
            curAy = cy + Math.sin(angle) * dist + (Math.random() - 0.5) * 20;
            ctx.lineTo(curAx, curAy);
          }
          ctx.stroke();
        }
      }

      // Draw wireframe sphere
      if (elapsed > 1.3) {
        const wfAlpha = Math.min(1, (elapsed - 1.3) * 1.5);
        ctx.strokeStyle = `rgba(56, 189, 248, ${wfAlpha * 0.55})`;
        ctx.lineWidth = 1.2;

        // Latitudes
        for (let lat = -60; lat <= 60; lat += 30) {
          const latR = R * Math.cos((lat * Math.PI) / 180);
          const latY = cy - R * Math.sin((lat * Math.PI) / 180);
          ctx.beginPath();
          ctx.ellipse(cx, latY, latR, latR * 0.32, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Longitudes
        for (let lng = 0; lng < 180; lng += 45) {
          const rotLng = (lng * Math.PI) / 180 + elapsed * 0.6;
          ctx.beginPath();
          ctx.ellipse(cx, cy, R * Math.cos(rotLng), R, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Atmospheric glowing core
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.2);
        coreGrad.addColorStop(0, "rgba(56, 189, 248, 0.18)");
        coreGrad.addColorStop(0.7, "rgba(14, 165, 233, 0.08)");
        coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Orbiting Rings
      if (elapsed > 2.1) {
        const ringAlpha = Math.min(1, (elapsed - 2.1) * 2);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(elapsed * 0.8);
        ctx.strokeStyle = `rgba(168, 85, 247, ${ringAlpha * 0.7})`;
        ctx.setLineDash([4, 12]);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, R * 1.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Vehicle Silhouette Projection
      if (elapsed > 2.8) {
        const vAlpha = Math.min(1, (elapsed - 2.8) * 2);
        ctx.save();
        ctx.translate(cx - 90, cy - 25);
        ctx.strokeStyle = `rgba(255, 255, 255, ${vAlpha * 0.85})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Sleek hypercar silhouette wireframe
        ctx.moveTo(10, 50);
        ctx.bezierCurveTo(40, 48, 60, 32, 85, 18);
        ctx.bezierCurveTo(110, 8, 140, 8, 155, 25);
        ctx.bezierCurveTo(170, 42, 175, 48, 180, 50);
        ctx.stroke();

        // Wheels
        ctx.fillStyle = `rgba(56, 189, 248, ${vAlpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(45, 50, 10, 0, Math.PI * 2);
        ctx.arc(150, 50, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (elapsed < 3.8) {
        raf = requestAnimationFrame(render);
      } else {
        setTimeout(() => {
          playHologramScanSound();
          onComplete();
        }, 200);
      }
    };

    playSubsystemEngageSound();
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#070b14] flex flex-col justify-between p-8 select-none overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
            <Zap size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase nh-gradient-text-cyan">
              APEX ENGINEER · BOOT CORE V5.0
            </h1>
            <p className="text-[10px] font-mono text-slate-400 tracking-wider">
              SPATIAL SPHERE & MULTI-PHYSICS SIMULATOR
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playHMIClickSound();
            onComplete();
          }}
          className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
        >
          <span>SKIP INTRO</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Center Holographic Status readout */}
      <div className="relative z-10 flex flex-col items-center gap-2 mb-8">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-mono font-bold tracking-widest uppercase">
          <Orbit size={13} className="animate-spin text-sky-400" />
          <span>{statusText}</span>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1.5 rounded-full bg-white/10 overflow-hidden mt-2 border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-slate-400 tracking-widest">{progress}% COMPILED</span>
      </div>

      {/* Footer telemetry */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-white/10 pt-3">
        <span>QUANTUM CORE · 60 FPS DETERMINISTIC SYNC</span>
        <span>LAT: 0.00° / LON: 0.00° / ORBIT: SYNCHRONOUS</span>
      </div>
    </div>
  );
};
