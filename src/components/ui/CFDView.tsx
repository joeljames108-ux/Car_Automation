import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  Wind, Play, Pause, RotateCcw, Camera, Gauge,
  Activity, Waves, Layers, Eye, EyeOff, ChevronDown,
} from "lucide-react";
import { useDesign } from "../../state/DesignContext";
import { Section } from "./Controls";
import type { AeroConfig } from "../../sim/types";

interface CFDProps {
  aero: AeroConfig;
  dragCoeff: number;
  liftCoeff: number;
  downforce: number;
  className?: string;
}

type VizMode = "pressure" | "velocity" | "streamlines" | "turbulence" | "wake" | "ground";

const VIEW_W = 800;
const VIEW_H = 360;
const PARTICLE_COUNT = 360;

const MODE_LABELS: Record<VizMode, { label: string; icon: React.ReactNode }> = {
  pressure: { label: "Pressure", icon: <Gauge size={11} /> },
  velocity: { label: "Velocity", icon: <Wind size={11} /> },
  streamlines: { label: "Streamlines", icon: <Activity size={11} /> },
  turbulence: { label: "Turbulence", icon: <Waves size={11} /> },
  wake: { label: "Wake", icon: <Eye size={11} /> },
  ground: { label: "Ground Effect", icon: <Layers size={11} /> },
};

export function CFDView({ aero, dragCoeff, liftCoeff, downforce, className = "" }: CFDProps) {
  const { sim } = useDesign();
  const [mode, setMode] = useState<VizMode>("pressure");
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showVectors, setShowVectors] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showCar, setShowCar] = useState(true);
  const [cutaway, setCutaway] = useState<"none" | "body" | "underfloor" | "cooling">("none");
  const [cameraAngle, setCameraAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [airSpeed, setAirSpeed] = useState(120);
  const [simRunning, setSimRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);
  const cameraAngleRef = useRef(0);
  const simProgressRef = useRef(0);
  const lastStateUpdateRef = useRef(0);
  const dragRef = useRef({ x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 });

  // Sync refs with state
  useEffect(() => { cameraAngleRef.current = cameraAngle; }, [cameraAngle]);
  useEffect(() => { simProgressRef.current = simProgress; }, [simProgress]);

  // Car profile points (side silhouette of a sports car)
  const carProfile = useMemo(() => buildCarProfile(aero), [aero]);

  // Initialize particles evenly across viewport width
  useEffect(() => {
    const ps: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      ps.push(spawnParticle(true));
    }
    particlesRef.current = ps;
  }, []);

  // Run simulation animation (Optimized 60 FPS Canvas Render Loop)
  useEffect(() => {
    if (!playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      frameRef.current++;
      const now = performance.now();

      if (autoRotate) {
        cameraAngleRef.current += 0.4;
      }

      const activeAngle = cameraAngleRef.current;

      drawScene(ctx, {
        mode, aero, carProfile, particles: particlesRef.current,
        frame: frameRef.current, speed, showVectors, showGrid, showCar,
        cutaway, cameraAngle: activeAngle, zoom, airSpeed,
        dragCoeff, liftCoeff, downforce, sim,
      });

      if (simRunning && simProgressRef.current < 100) {
        simProgressRef.current = Math.min(100, simProgressRef.current + speed * 0.8);
        if (now - lastStateUpdateRef.current > 200 || simProgressRef.current >= 100) {
          lastStateUpdateRef.current = now;
          setSimProgress(Math.round(simProgressRef.current));
        }
      }

      animRef.current = requestAnimationFrame(render);
    };
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, mode, aero, carProfile, speed, showVectors, showGrid, showCar, cutaway, autoRotate, zoom, airSpeed, dragCoeff, liftCoeff, downforce, sim, simRunning]);

  // Mouse drag for camera
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, dragging: true, lastX: e.clientX, lastY: e.clientY };
  }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.lastX;
    setCameraAngle((a) => a + dx * 0.4);
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  }, []);
  const onMouseUp = useCallback(() => { dragRef.current.dragging = false; }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    setZoom((z) => clamp(z - e.deltaY * 0.001, 0.6, 2.5));
  }, []);

  const runSimulation = () => {
    setSimRunning(true);
    setSimProgress(0);
  };

  const reset = () => {
    setSimRunning(false);
    setSimProgress(0);
    setCameraAngle(0);
    setZoom(1);
    setAirSpeed(120);
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, spawnParticle);
  };

  // Live metrics
  const dragForce = Math.round(0.5 * 1.225 * Math.pow(airSpeed / 3.6, 2) * sim.frontalArea * dragCoeff);
  const frontLift = Math.round(0.5 * 1.225 * Math.pow(airSpeed / 3.6, 2) * sim.frontalArea * Math.max(0, liftCoeff) * 0.4);
  const rearDown = Math.round(Math.abs(sim.rearDownforce) * (airSpeed / 200) ** 2);
  const powerLoss = Math.round((dragForce * (airSpeed / 3.6)) / 745.7);
  const airVelocity = airSpeed;
  const pressure = (101.325 - liftCoeff * 0.5).toFixed(1);

  return (
    <Section title="CFD Lab — Wind Tunnel #3" icon={<Wind size={16} />} className={className}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-white/50 backdrop-blur-md rounded-lg border border-white/70 font-mono text-[10px] text-[#1c1c1e]">
        <div className="flex items-center gap-3 text-slate-700 font-bold">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${simRunning ? "bg-[#059669] animate-pulse" : "bg-slate-400"}`} />
            {simRunning ? "SIMULATION RUNNING" : "READY"}
          </span>
          <span className="text-slate-400">|</span>
          <span>AIR SPEED: <span className="text-[#007aff] font-bold">{airSpeed} km/h</span></span>
          <span className="text-slate-400">|</span>
          <span>Re: <span className="text-slate-800 font-bold">{(airSpeed * 21000).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-bold">MESH: 2.4M cells</span>
          {simRunning && <span className="text-[#007aff] font-bold">{simProgress.toFixed(0)}%</span>}
        </div>
      </div>

      {/* Live Data Stat Strip (Outside Canvas Diagram) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-2">
        <div className="bg-white/60 backdrop-blur-md rounded-xl p-2 border border-white/80 text-center shadow-sm">
          <div className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Drag Cd</div>
          <div className="text-xs font-mono font-black text-[#1c1c1e]">{dragCoeff.toFixed(3)}</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-xl p-2 border border-white/80 text-center shadow-sm">
          <div className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Front Lift</div>
          <div className="text-xs font-mono font-black text-[#007aff]">{frontLift} kg</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-xl p-2 border border-white/80 text-center shadow-sm">
          <div className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Rear Down</div>
          <div className="text-xs font-mono font-black text-[#059669]">{rearDown} kg</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-xl p-2 border border-white/80 text-center shadow-sm">
          <div className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Drag Force</div>
          <div className="text-xs font-mono font-black text-[#1c1c1e]">{dragForce} N</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-xl p-2 border border-white/80 text-center shadow-sm">
          <div className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Flow Sep</div>
          <div className="text-xs font-mono font-black text-[#1c1c1e]">{(sim.separationRisk * 100).toFixed(0)}%</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-xl p-2 border border-white/80 text-center shadow-sm">
          <div className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Velocity</div>
          <div className="text-xs font-mono font-black text-[#007aff]">{airVelocity} km/h</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-xl p-2 border border-white/80 text-center shadow-sm">
          <div className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Pressure</div>
          <div className="text-xs font-mono font-black text-[#1c1c1e]">{pressure} kPa</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md rounded-xl p-2 border border-white/80 text-center shadow-sm">
          <div className="text-[9px] font-extrabold uppercase text-slate-500 tracking-wider">Ride Height</div>
          <div className="text-xs font-mono font-black text-[#1c1c1e]">{aero.rideHeight} mm</div>
        </div>
      </div>

      {/* Clean Unobstructed Canvas Viewport */}
      <div
        className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-xl overflow-hidden border border-white/80 shadow-md cursor-grab active:cursor-grabbing group"
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <canvas ref={canvasRef} width={VIEW_W} height={VIEW_H} className="w-full block" style={{ imageRendering: "auto" }} />

        {/* Camera controls hint */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] text-white/50 font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
          DRAG TO ROTATE · SCROLL TO ZOOM
        </div>
      </div>

      {/* Map Label & Heatmap Legend Row (Outside Canvas Diagram) */}
      <div className="flex items-center justify-between mt-2 px-3 py-1.5 bg-white/50 backdrop-blur-md rounded-xl border border-white/80 text-[#1c1c1e]">
        <div className="font-mono text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
          {MODE_LABELS[mode].label} Map
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] font-extrabold text-slate-500">LOW</span>
          <div className="w-24 h-2.5 rounded-full shadow-inner" style={{ background: "linear-gradient(to right, #1e40af, #22c55e, #eab308, #f97316, #ef4444)" }} />
          <span className="font-mono text-[9px] font-extrabold text-slate-500">HIGH</span>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex flex-wrap gap-1 mt-2">
        {(Object.keys(MODE_LABELS) as VizMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
              mode === m
                ? "bg-[#007aff] text-white border-[#007aff] shadow-sm scale-105"
                : "bg-white/60 text-[#1c1c1e] border-white/80 hover:bg-white/80"
            }`}
          >
            {MODE_LABELS[m].icon}{MODE_LABELS[m].label}
          </button>
        ))}
      </div>

      {/* Toggle row */}
      <div className="flex flex-wrap gap-1 mt-1.5">
        <ToggleChip active={showVectors} onClick={() => setShowVectors(!showVectors)} icon={<Activity size={10} />} label="Vectors" />
        <ToggleChip active={showGrid} onClick={() => setShowGrid(!showGrid)} icon={<Layers size={10} />} label="Grid" />
        <ToggleChip active={showCar} onClick={() => setShowCar(!showCar)} icon={showCar ? <Eye size={10} /> : <EyeOff size={10} />} label="Body" />
        <ToggleChip active={autoRotate} onClick={() => setAutoRotate(!autoRotate)} icon={<Camera size={10} />} label="Orbit" />
        <div className="relative">
          <button
            onClick={() => setCutaway(cutaway === "none" ? "body" : cutaway === "body" ? "underfloor" : cutaway === "underfloor" ? "cooling" : "none")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/60 text-[#1c1c1e] border border-white/80 hover:bg-white/80 transition-all"
          >
            <ChevronDown size={10} /> Cutaway: {cutaway === "none" ? "Off" : cutaway}
          </button>
        </div>
      </div>

      {/* Simulation controls */}
      <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-white/50 backdrop-blur-md rounded-xl border border-white/80 text-[#1c1c1e]">
        <button
          onClick={() => setPlaying(!playing)}
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#007aff] text-white shadow-sm hover:bg-[#0066cc] transition-all"
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}
        </button>
        <button
          onClick={runSimulation}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#059669] text-white text-[10px] font-bold shadow-sm hover:bg-[#047857] transition-all"
        >
          <Play size={11} /> Run Sim
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/70 border border-white/90 text-[#1c1c1e] text-[10px] font-bold hover:bg-white transition-all"
        >
          <RotateCcw size={11} /> Reset
        </button>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-500 font-mono">SPEED</span>
          {[1, 5, 20].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                speed === s ? "bg-accent-500/20 text-accent-300" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              ×{s}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">WIND</span>
          <input
            type="range" min={40} max={300} value={airSpeed}
            onChange={(e) => setAirSpeed(parseInt(e.target.value))}
            className="w-20"
          />
        </div>
      </div>

      {/* Progress bar */}
      {simRunning && simProgress < 100 && (
        <div className="mt-1.5 h-1 bg-base-850 rounded-full overflow-hidden">
          <div className="h-full bg-accent-500 transition-all duration-100" style={{ width: `${simProgress}%` }} />
        </div>
      )}
    </Section>
  );
}

// ---------- Data overlay component ----------

function DataLine({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "ok" | "warn" | "danger" }) {
  const colors = { default: "text-slate-300", ok: "text-ok-400", warn: "text-warn-400", danger: "text-danger-400" };
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-500">{label}</span>
      <span className={colors[tone]}>{value}</span>
    </div>
  );
}

function ToggleChip({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
        active
          ? "bg-[#007aff] text-white border-[#007aff] shadow-sm scale-105"
          : "bg-white/60 text-[#1c1c1e] border-white/80 hover:bg-white/80"
      }`}
    >
      {icon}{label}
    </button>
  );
}

// ---------- Particle system ----------

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; trail: { x: number; y: number }[];
}

function spawnParticle(spreadEvenly = false): Particle {
  return {
    x: spreadEvenly ? Math.random() * (VIEW_W + 40) - 20 : -30 + Math.random() * 30,
    y: 20 + Math.random() * (VIEW_H - 40),
    vx: 2.5 + Math.random() * 1.2,
    vy: 0,
    life: 0,
    maxLife: 220 + Math.random() * 180,
    trail: [],
  };
}

// ---------- Car profile ----------

interface CarPoint { x: number; y: number; }

function buildCarProfile(aero: AeroConfig): CarPoint[] {
  const cx = VIEW_W * 0.38;
  const bodyW = 280 + (aero.bodyWidth - 1800) * 0.15;
  const roofH = 70 + (aero.roofHeight - 1100) * 0.08;
  const sleek = aero.bodyShape;

  const frontX = cx - bodyW * 0.5;
  const rearX = cx + bodyW * 0.5;
  const groundY = VIEW_H * 0.68;
  const hoodY = groundY - 30 + sleek * 10;
  const roofY = groundY - roofH;
  const trunkY = groundY - 35 + sleek * 8;

  return [
    { x: frontX, y: groundY - 8 },
    { x: frontX + 10, y: hoodY + 5 },
    { x: frontX + bodyW * 0.15, y: hoodY },
    { x: frontX + bodyW * 0.3, y: hoodY - 3 },
    { x: frontX + bodyW * 0.38, y: roofY + 8 },
    { x: frontX + bodyW * 0.45, y: roofY },
    { x: frontX + bodyW * 0.65, y: roofY },
    { x: frontX + bodyW * 0.72, y: roofY + 10 },
    { x: frontX + bodyW * 0.8, y: trunkY },
    { x: rearX - 5, y: trunkY + 3 },
    { x: rearX, y: groundY - 10 },
    { x: rearX, y: groundY - 8 },
    { x: frontX, y: groundY - 8 },
  ];
}

// ---------- Drawing ----------

interface DrawCtx {
  mode: VizMode;
  aero: AeroConfig;
  carProfile: CarPoint[];
  particles: Particle[];
  frame: number;
  speed: number;
  showVectors: boolean;
  showGrid: boolean;
  showCar: boolean;
  cutaway: string;
  cameraAngle: number;
  zoom: number;
  airSpeed: number;
  dragCoeff: number;
  liftCoeff: number;
  downforce: number;
  sim: ReturnType<typeof useDesign>["sim"];
}

function drawScene(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const W = VIEW_W, H = VIEW_H;
  ctx.clearRect(0, 0, W, H);

  // High-Visibility High-Tech CFD Wind Tunnel Background
  const bgGrad = ctx.createRadialGradient(W * 0.38, H * 0.5, 50, W / 2, H / 2, W * 0.7);
  bgGrad.addColorStop(0, "#15243b");
  bgGrad.addColorStop(0.5, "#0b1526");
  bgGrad.addColorStop(1, "#050a14");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Vivid Green Fine Mesh Grid Backdrop
  if (c.showGrid) {
    const gridOffset = (c.frame * c.speed * 0.3) % 24;
    ctx.strokeStyle = "rgba(34, 197, 94, 0.38)";
    ctx.lineWidth = 1.2;
    for (let x = -gridOffset; x < W; x += 24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 24) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  // Glowing Laser Ground Line & Track
  const groundY = H * 0.68;
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();

  // Ground Aerodynamic Mirror Reflection
  const reflGrad = ctx.createLinearGradient(0, groundY, 0, H);
  reflGrad.addColorStop(0, "rgba(34, 197, 94, 0.35)");
  reflGrad.addColorStop(0.5, "rgba(0, 194, 255, 0.15)");
  reflGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = reflGrad;
  ctx.fillRect(0, groundY, W, H - groundY);

  // Apply Camera Orbit / Zoom Transforms
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(c.zoom, c.zoom);
  ctx.rotate(c.cameraAngle * Math.PI / 180 * 0.3);
  ctx.translate(-W / 2, -H / 2);

  // 1. Heatmap overlay behind car
  if (c.mode === "pressure" || c.mode === "velocity") {
    drawHeatmap(ctx, c);
  }

  // 2. Ground effect underbody flow
  if (c.mode === "ground" || c.cutaway === "underfloor") {
    drawGroundEffect(ctx, c);
  }

  // 3. Update & render 360 streamline particles
  if (c.mode === "streamlines" || c.mode === "velocity" || c.mode === "pressure" || c.mode === "wake" || c.mode === "turbulence") {
    updateParticles(ctx, c);
    drawParticles(ctx, c);
  }

  // 4. Wake vortices & turbulent smoke
  if (c.mode === "wake" || c.mode === "turbulence") {
    drawWake(ctx, c);
  }

  // 5. Flow vectors
  if (c.showVectors) {
    drawVectors(ctx, c);
  }

  // 6. Detailed 3D Hypercar Silhouette
  if (c.showCar) {
    drawCar(ctx, c);
  }

  // 7. Reference Photo Overlay Badges & Pin Callouts
  drawCalloutsAndPiP(ctx, c);

  ctx.restore();

  // Reference Photo Right Column Overlay Panels (Pressure/Velocity Scales & Cd vs Re Curve)
  drawRightOverlays(ctx, c);

  // Cinematic Studio Vignette
  const vignette = ctx.createRadialGradient(W / 2, H / 2, W * 0.35, W / 2, H / 2, W * 0.75);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function drawCalloutsAndPiP(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const W = VIEW_W, H = VIEW_H;
  const groundY = H * 0.68;
  const carCenter = W * 0.38;
  const wheelFrontX = carCenter - 110;
  const wheelRearX = carCenter + 115;

  // ── Top-Left PiP Window: "FLOW VISUALIZATION" (Zoom of Rear Wheel & Wake Vortices) ──
  ctx.save();
  ctx.fillStyle = "rgba(10, 20, 30, 0.85)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(16, 16, 175, 105, 10);
  ctx.fill();
  ctx.stroke();

  // PiP Header Badge
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.beginPath();
  ctx.roundRect(20, 20, 120, 16, 4);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 9px monospace";
  ctx.fillText("FLOW VISUALIZATION", 25, 32);

  // PiP Zoom Viewport graphics (rear wheel detail)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(22, 40, 163, 75, 6);
  ctx.clip();
  ctx.fillStyle = "#070c16";
  ctx.fillRect(22, 40, 163, 75);

  // Mini grid inside PiP
  ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
  ctx.lineWidth = 0.8;
  for (let x = 22; x < 185; x += 12) {
    ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, 115); ctx.stroke();
  }
  for (let y = 40; y < 115; y += 12) {
    ctx.beginPath(); ctx.moveTo(22, y); ctx.lineTo(185, y); ctx.stroke();
  }

  // Mini rear wheel
  drawWheel(ctx, 60, 95, 20, c.frame, c.speed);

  // Mini turbulent wake eddies
  const t = c.frame * 0.05 * c.speed;
  ctx.strokeStyle = "rgba(34, 211, 238, 0.85)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 4; a += 0.2) {
    const r = 18 * (1 - a / (Math.PI * 4));
    const wx = 125 + Math.cos(a + t) * r;
    const wy = 75 + Math.sin(a + t) * r * 0.6;
    if (a === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
  }
  ctx.stroke();
  ctx.restore();
  ctx.restore();

  // Reticle circle on rear wheel connected to Top-Left PiP
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(wheelRearX, groundY - 2, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(191, 70);
  ctx.lineTo(wheelRearX - 18, groundY - 10);
  ctx.stroke();

  // ── Bottom-Left PiP Window: Zoom of Front Wheel & Splitter Stagnation ──
  ctx.save();
  ctx.fillStyle = "rgba(10, 20, 30, 0.85)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(16, H - 120, 175, 105, 10);
  ctx.fill();
  ctx.stroke();

  // PiP Viewport graphics (front wheel detail)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(22, H - 114, 163, 93, 6);
  ctx.clip();
  ctx.fillStyle = "#070c16";
  ctx.fillRect(22, H - 114, 163, 93);

  // Mini grid
  ctx.strokeStyle = "rgba(34, 197, 94, 0.25)";
  ctx.lineWidth = 0.8;
  for (let x = 22; x < 185; x += 12) {
    ctx.beginPath(); ctx.moveTo(x, H - 114); ctx.lineTo(x, H - 21); ctx.stroke();
  }

  // Mini front wheel & nose
  drawWheel(ctx, 110, H - 45, 18, c.frame, c.speed);
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(35, H - 55, 60, 10);

  // Mini stagnation streamlines
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const sy = H - 90 + i * 15;
    ctx.beginPath();
    ctx.moveTo(25, sy);
    ctx.quadraticCurveTo(80, sy, 140, sy - 15);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();

  // Reticle circle on front wheel connected to Bottom-Left PiP
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(wheelFrontX, groundY - 2, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(191, H - 70);
  ctx.lineTo(wheelFrontX - 18, groundY - 10);
  ctx.stroke();

  // ── Callout Pins & Labels ──
  // 1. "Pressure Drag Center" Pin Badge on Car Roof/Center
  const dragPinX = carCenter;
  const dragPinY = groundY - 55;
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath(); ctx.arc(dragPinX, dragPinY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(dragPinX, dragPinY); ctx.lineTo(dragPinX, dragPinY - 16); ctx.stroke();
  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.70)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(dragPinX + 4, dragPinY - 32, 95, 24, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px monospace";
  ctx.fillText("Pressure Drag", dragPinX + 12, dragPinY - 20);
  ctx.fillText("Center", dragPinX + 28, dragPinY - 10);

  // 2. "Turbulent Wake Region" Callout
  const wakeX = carCenter + 180;
  const wakeY = groundY - 70;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.70)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(wakeX + 60, wakeY); ctx.lineTo(wakeX + 10, wakeY + 25); ctx.stroke();
  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  ctx.beginPath(); ctx.roundRect(wakeX + 60, wakeY - 12, 105, 22, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px monospace";
  ctx.fillText("Turbulent Wake", wakeX + 68, wakeY + 2);
  ctx.fillText("Region", wakeX + 88, wakeY + 12);

  // 3. "Laminar Boundary Layer" Callout
  const boundX = carCenter + 175;
  const boundY = groundY + 18;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.70)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(boundX + 65, boundY); ctx.lineTo(boundX + 5, boundY - 12); ctx.stroke();
  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  ctx.beginPath(); ctx.roundRect(boundX + 65, boundY - 10, 110, 22, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px monospace";
  ctx.fillText("Laminar Boundary", boundX + 72, boundY + 3);
  ctx.fillText("Layer", boundX + 100, boundY + 13);
}

function drawRightOverlays(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const W = VIEW_W, H = VIEW_H;

  // ── Top-Right Active Simulation Badge ──
  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.70)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(W - 245, 16, 228, 85, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px monospace";
  ctx.fillText("ACTIVE SIMULATION: [MODEL_X_WAKE_ANALYSIS_V4]", W - 238, 30);

  // Toggles inside Active Simulation Badge
  ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(W - 232, 46, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#cbd5e1"; ctx.font = "8px monospace";
  ctx.fillText("Mesh Resolution: Fine", W - 222, 49);

  ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(W - 232, 61, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#cbd5e1"; ctx.font = "8px monospace";
  ctx.fillText("Turbulence Model: k-omega SST", W - 222, 64);

  // Hint at bottom of badge
  ctx.fillStyle = "#94a3b8"; ctx.font = "bold 8px monospace";
  ctx.fillText("DRAG TO ROTATE · SCROLL TO ZOOM", W - 225, 88);
  ctx.restore();

  // ── Right Column Dual Pressure & Velocity Color Scales ──
  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(W - 85, 110, 70, 205, 8); ctx.fill(); ctx.stroke();

  // Pressure (P) Scale
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px monospace";
  ctx.fillText("P", W - 78, 126);
  const pGrad = ctx.createLinearGradient(0, 132, 0, 220);
  pGrad.addColorStop(0, "#ef4444");
  pGrad.addColorStop(0.3, "#f97316");
  pGrad.addColorStop(0.5, "#22c55e");
  pGrad.addColorStop(0.7, "#007aff");
  pGrad.addColorStop(1, "#1e40af");
  ctx.fillStyle = pGrad;
  ctx.fillRect(W - 78, 132, 12, 90);
  ctx.fillStyle = "#cbd5e1"; ctx.font = "7px monospace";
  ctx.fillText("3000", W - 62, 136);
  ctx.fillText("2000", W - 62, 151);
  ctx.fillText("1000", W - 62, 166);
  ctx.fillText("0", W - 62, 181);
  ctx.fillText("-1000", W - 62, 196);
  ctx.fillText("-2000", W - 62, 211);
  ctx.fillText("-3000", W - 62, 224);

  // Velocity (|V|) Scale
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 10px monospace";
  ctx.fillText("|V|", W - 78, 240);
  const vGrad = ctx.createLinearGradient(0, 245, 0, 305);
  vGrad.addColorStop(0, "#ef4444");
  vGrad.addColorStop(0.4, "#22c55e");
  vGrad.addColorStop(1, "#007aff");
  ctx.fillStyle = vGrad;
  ctx.fillRect(W - 78, 245, 12, 60);
  ctx.fillStyle = "#cbd5e1"; ctx.font = "7px monospace";
  ctx.fillText("1.00", W - 62, 249);
  ctx.fillText("0.66", W - 62, 273);
  ctx.fillText("0.00", W - 62, 305);
  ctx.restore();

  // ── Bottom-Right Cd vs. Reynolds' Number Chart Inset ──
  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(W - 195, H - 130, 180, 115, 8); ctx.fill(); ctx.stroke();

  ctx.fillStyle = "#ffffff"; ctx.font = "bold 9px monospace";
  ctx.fillText("Cd vs. Reynolds' Number", W - 185, H - 116);

  // Chart axes
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W - 170, H - 105); ctx.lineTo(W - 170, H - 35); ctx.lineTo(W - 25, H - 35);
  ctx.stroke();

  // Parabolic Cd curve
  ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W - 165, H - 95);
  ctx.quadraticCurveTo(W - 130, H - 45, W - 30, H - 42);
  ctx.stroke();

  // Pulsing Active Operating Point Dot
  const activeDotX = W - 115;
  const activeDotY = H - 54;
  ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(activeDotX, activeDotY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1; ctx.stroke();

  // Axis Labels
  ctx.fillStyle = "#94a3b8"; ctx.font = "7px monospace";
  ctx.fillText("0", W - 172, H - 25);
  ctx.fillText("10000", W - 120, H - 25);
  ctx.fillText("30000", W - 45, H - 25);
  ctx.fillText("Reynolds' Number", W - 120, H - 16);
  ctx.restore();
}

function drawHeatmap(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const W = VIEW_W, H = VIEW_H;
  const cellSize = 10;
  const cols = Math.ceil(W / cellSize);
  const rows = Math.ceil(H / cellSize);
  const groundY = H * 0.68;
  const carCenter = W * 0.38;
  const carFront = carCenter - 140;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      const fx = x / W;
      const fy = (y - H / 2) / (H / 2);

      let p = 0;
      // Front stagnation (high pressure)
      const dFront = Math.hypot(fx - 0.3, fy * 0.5);
      p += Math.exp(-dFront * dFront * 8) * 0.95;
      // Rear wake (low pressure)
      const dRear = Math.hypot(fx - 0.6, fy * 0.4);
      p -= Math.exp(-dRear * dRear * 6) * 0.55;
      // Underbody (low pressure = downforce)
      if (y > groundY - 20 && y < groundY && x > carFront + 20 && x < carCenter + 120) {
        p -= 0.35 * Math.abs(c.liftCoeff);
      }
      // Wing area
      const wingX = carCenter + 130;
      const wingY = groundY - 50 - c.aero.wingHeight / 30;
      const dWing = Math.hypot((x - wingX) / 60, (y - wingY) / 30);
      p -= Math.exp(-dWing * dWing * 3) * 0.45;

      const color = c.mode === "velocity"
        ? velocityColor(c.airSpeed, p, x, y, carCenter, groundY)
        : pressureColor(p);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.32;
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }
  ctx.globalAlpha = 1;
}

function pressureColor(p: number): string {
  // Blue -> Green -> Yellow -> Orange -> Red
  const t = clamp((p + 1) / 2, 0, 1);
  if (t < 0.25) return lerpColor("#1e40af", "#22c55e", t / 0.25);
  if (t < 0.5) return lerpColor("#22c55e", "#eab308", (t - 0.25) / 0.25);
  if (t < 0.75) return lerpColor("#eab308", "#f97316", (t - 0.5) / 0.25);
  return lerpColor("#f97316", "#ef4444", (t - 0.75) / 0.25);
}

function velocityColor(_baseSpeed: number, _p: number, x: number, y: number, carCx: number, groundY: number): string {
  const dx = (x - carCx) / 200;
  const overCar = Math.exp(-Math.pow(dx, 2) * 3) * (y < groundY - 30 && y > groundY - 100 ? 1 : 0);
  const inWake = x > carCx + 100 && y > groundY - 80 && y < groundY + 20;
  let v = 0.5 + overCar * 0.4 - (inWake ? 0.3 : 0);
  v = clamp(v, 0, 1);
  if (v < 0.25) return lerpColor("#007aff", "#fbbf24", v / 0.25);
  if (v < 0.5) return lerpColor("#fbbf24", "#10b981", (v - 0.25) / 0.25);
  if (v < 0.75) return lerpColor("#10b981", "#f59e0b", (v - 0.5) / 0.25);
  return lerpColor("#f59e0b", "#ef4444", (v - 0.75) / 0.25);
}

function drawGroundEffect(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const groundY = VIEW_H * 0.68;
  const carCenter = VIEW_W * 0.38;
  const front = carCenter - 140;
  const rear = carCenter + 140;
  const rideH = c.aero.rideHeight / 10;

  // Underbody flow
  const grad = ctx.createLinearGradient(front, groundY, rear, groundY);
  grad.addColorStop(0, "rgba(0, 122, 255, 0.6)");
  grad.addColorStop(0.5, "rgba(52, 211, 153, 0.7)");
  grad.addColorStop(1, "rgba(239, 68, 68, 0.6)");
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(front + 10, groundY - rideH - 2, rear - front - 20, rideH + 4);
  ctx.globalAlpha = 1;

  // Diffuser expansion
  if (c.aero.diffuserAngle > 0) {
    ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const sx = rear - 30 + i * 8;
      ctx.beginPath();
      ctx.moveTo(sx, groundY - rideH);
      ctx.lineTo(sx + 20, groundY - rideH - c.aero.diffuserAngle);
      ctx.stroke();
    }
  }

  // Flow arrows under car
  ctx.strokeStyle = "rgba(0, 122, 255, 0.8)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 8; i++) {
    const ax = front + 20 + i * 30 + (c.frame * c.speed * 0.6) % 30;
    const ay = groundY - rideH / 2;
    drawArrow(ctx, ax, ay, ax + 14, ay);
  }
}

function updateParticles(_ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const W = VIEW_W, H = VIEW_H;
  const groundY = H * 0.68;
  const carCenter = W * 0.38;
  const carFront = carCenter - 140;
  const carRear = carCenter + 140;
  const roofY = groundY - 70 - (c.aero.roofHeight - 1100) * 0.08;
  const dt = c.speed * 0.65;

  for (const p of c.particles) {
    p.life += dt;
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 18) p.trail.shift();

    // Base flow velocity
    p.vx = 2.0 + c.airSpeed / 160;
    p.vy = 0;

    // Flow around front - split up/down smoothly
    if (p.x > carFront - 35 && p.x < carFront + 25) {
      const yRel = (p.y - groundY + 40) / 80;
      if (p.y < groundY - 20) {
        p.vy = -1.2 - yRel * 0.6; // curve up over nose
      } else {
        p.vy = 0.6; // down under splitter
        p.vx *= 0.75;
      }
    }

    // Climb windshield
    if (p.x > carFront + 35 && p.x < carFront + 105 && p.y < groundY - 15) {
      p.vy = -0.7;
    }

    // Accelerate over roof
    if (p.x > carFront + 105 && p.x < carRear - 35 && p.y < roofY + 15) {
      p.vy = -0.15;
      p.vx *= 1.22;
    }

    // Detach behind rear wing / fastback
    if (p.x > carRear - 25 && p.x < carRear + 65) {
      if (p.y < groundY - 25) {
        p.vy = 0.4 + Math.sin(p.life * 0.12 + p.x * 0.05) * 0.5;
      }
    }

    // Wake turbulence & vortices
    if (p.x > carRear + 20 && p.x < carRear + 220) {
      const turb = Math.sin(p.life * 0.09 + p.y * 0.06) * 1.1;
      p.vy += turb * 0.35;
      p.vx *= 0.92;
    }

    // Wheel wake turbulence
    const wheelX = carFront + 30;
    const wheelY = groundY;
    if (Math.hypot(p.x - wheelX, p.y - wheelY) < 40 && p.x > wheelX) {
      p.vy += Math.sin(p.life * 0.18) * 0.6;
    }
    const wheelX2 = carRear - 30;
    if (Math.hypot(p.x - wheelX2, p.y - wheelY) < 40 && p.x > wheelX2) {
      p.vy += Math.sin(p.life * 0.18) * 0.5;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Respawn smoothly when exiting screen edge or expiring
    if (p.x > W + 25 || p.life > p.maxLife || p.y < 0 || p.y > H) {
      Object.assign(p, spawnParticle(false));
    }
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  for (const p of c.particles) {
    const speed = Math.hypot(p.vx, p.vy);
    const alpha = clamp(speed / 3.5, 0.25, 0.85);

    let strokeColor = `rgba(34, 211, 238, ${alpha})`;
    if (c.mode === "turbulence" || c.mode === "wake") {
      strokeColor = `rgba(192, 132, 252, ${alpha})`;
    } else if (c.mode === "velocity") {
      const vNorm = clamp(speed / 4, 0, 1);
      if (vNorm > 0.7) strokeColor = `rgba(245, 158, 11, ${alpha})`;
      else if (vNorm > 0.4) strokeColor = `rgba(16, 185, 129, ${alpha})`;
      else strokeColor = `rgba(0, 122, 255, ${alpha})`;
    }

    // Glowing Trail
    if (p.trail.length > 1) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x, p.trail[0].y);
      for (let i = 1; i < p.trail.length; i++) {
        ctx.lineTo(p.trail[i].x, p.trail[i].y);
      }
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    // Glowing Particle Head
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWake(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const groundY = VIEW_H * 0.68;
  const carRear = VIEW_W * 0.38 + 140;
  const t = c.frame * 0.04 * c.speed;

  // Intricate recirculation vortex swirls (Matching Reference Photo)
  const vortices = [
    { cx: carRear + 35, cy: groundY - 55, r: 24, dir: 1 },
    { cx: carRear + 85, cy: groundY - 35, r: 32, dir: -1 },
    { cx: carRear + 145, cy: groundY - 45, r: 40, dir: 1 },
  ];

  vortices.forEach((v, idx) => {
    ctx.strokeStyle = idx % 2 === 0 ? "rgba(34, 211, 238, 0.85)" : "rgba(192, 132, 252, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 6; a += 0.15) {
      const radius = v.r * (1 - a / (Math.PI * 6));
      const x = v.cx + Math.cos(v.dir * a + t + idx) * radius * 1.2;
      const y = v.cy + Math.sin(v.dir * a + t + idx) * radius * 0.7;
      if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });
}

function drawVectors(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const groundY = VIEW_H * 0.68;
  const carCenter = VIEW_W * 0.38;
  const carFront = carCenter - 140;
  const carRear = carCenter + 140;

  ctx.strokeStyle = "rgba(250, 250, 250, 0.4)";
  ctx.lineWidth = 1;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 14; col++) {
      const x = col * 55 + 20;
      const y = row * 42 + 20;
      if (y > groundY + 5) continue;
      // Skip inside car body
      if (x > carFront && x < carRear && y > groundY - 80 && y < groundY) continue;

      let vx = 8, vy = 0;
      // Deflect around car
      if (x > carFront - 30 && x < carFront + 30 && y < groundY) {
        vy = y < groundY - 40 ? -4 : 2;
      }
      if (x > carFront + 80 && x < carRear - 40 && y < groundY - 60) {
        vy = -1; vx = 10;
      }
      if (x > carRear && x < carRear + 150) {
        vy = Math.sin(c.frame * 0.05 + y * 0.02) * 3;
        vx = 5;
      }
      const mag = Math.hypot(vx, vy);
      const scale = 0.8 + mag / 12;
      drawArrow(ctx, x, y, x + vx * scale, y + vy * scale);
    }
  }
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const ah = 3;
  ctx.lineTo(x2 - ah * Math.cos(angle - 0.4), y2 - ah * Math.sin(angle - 0.4));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ah * Math.cos(angle + 0.4), y2 - ah * Math.sin(angle + 0.4));
  ctx.stroke();
}

function drawCar(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const pts = c.carProfile;
  const groundY = VIEW_H * 0.68;
  const carCenter = VIEW_W * 0.38;

  // 1. Aerodynamic Ground Contact Shadow & Underbody Air Suction Glow
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.beginPath();
  ctx.ellipse(carCenter, groundY + 4, 160, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  const venturiGlow = ctx.createLinearGradient(carCenter - 120, groundY, carCenter + 120, groundY);
  venturiGlow.addColorStop(0, "rgba(0, 122, 255, 0.25)");
  venturiGlow.addColorStop(0.5, "rgba(16, 185, 129, 0.35)");
  venturiGlow.addColorStop(1, "rgba(239, 68, 68, 0.25)");
  ctx.fillStyle = venturiGlow;
  ctx.fillRect(carCenter - 120, groundY - 4, 240, 6);

  // 2. Xenon Headlight Projection Beam (Front Air Flow Illumination)
  const headX = pts[1].x + 5;
  const headY = pts[1].y + 3;
  const lightCone = ctx.createRadialGradient(headX, headY, 2, headX - 120, headY, 140);
  lightCone.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  lightCone.addColorStop(0.3, "rgba(0, 122, 255, 0.40)");
  lightCone.addColorStop(1, "rgba(0, 122, 255, 0)");
  ctx.fillStyle = lightCone;
  ctx.beginPath();
  ctx.moveTo(headX, headY - 4);
  ctx.lineTo(headX - 140, headY - 30);
  ctx.lineTo(headX - 140, headY + 30);
  ctx.closePath();
  ctx.fill();

  // 3. Car body with carbon-fiber metallic finish
  const bodyGrad = ctx.createLinearGradient(0, groundY - 80, 0, groundY);
  bodyGrad.addColorStop(0, "#2d3748");
  bodyGrad.addColorStop(0.3, "#1a202c");
  bodyGrad.addColorStop(0.7, "#1a1008");
  bodyGrad.addColorStop(1, "#090d16");

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    const prev = pts[i - 1];
    const cpX = (prev.x + p.x) / 2;
    const cpY = (prev.y + p.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, cpX, cpY);
  }
  ctx.closePath();
  ctx.fill();

  // Studio Specular Highlight Edge
  ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();

  // Roofline Highlight
  const roofPts = pts.slice(4, 8);
  ctx.strokeStyle = "rgba(0, 122, 255, 0.70)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(roofPts[0].x, roofPts[0].y);
  for (let i = 1; i < roofPts.length; i++) {
    ctx.lineTo(roofPts[i].x, roofPts[i].y);
  }
  ctx.stroke();

  // Tinted Windshield Glass
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.beginPath();
  const winFront = pts[4];
  const winRear = pts[7];
  ctx.moveTo(winFront.x + 5, winFront.y + 5);
  ctx.lineTo(winFront.x + 10, winFront.y + 2);
  ctx.lineTo(winRear.x - 5, winRear.y + 2);
  ctx.lineTo(winRear.x, winRear.y + 8);
  ctx.closePath();
  ctx.fill();

  // Dynamic Spinning Alloy Wheels with Carbon Ceramic Rotor Glow
  const wheelFront = pts[0];
  const wheelRear = pts[pts.length - 3];
  drawWheel(ctx, wheelFront.x + 30, groundY - 2, 14, c.frame, c.speed);
  drawWheel(ctx, wheelRear.x - 25, groundY - 2, 14, c.frame, c.speed);

  // Active Rear Wing Assembly
  if (c.aero.wingAngle > 0 || c.aero.wingHeight > 100) {
    const wingX = carCenter + 130;
    const wingY = groundY - 50 - c.aero.wingHeight / 30;
    const effectiveAngle = c.aero.drs ? 2 : c.aero.wingAngle;
    ctx.save();
    ctx.translate(wingX, wingY);
    ctx.rotate(-effectiveAngle * Math.PI / 180 * 0.3);
    
    // Wing Airfoil
    ctx.fillStyle = "#1a1008";
    ctx.fillRect(-26, -3, 52, 5);
    ctx.strokeStyle = c.aero.drs ? "#10b981" : "rgba(0, 122, 255, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-26, -3, 52, 5);
    
    // Support Pylons
    ctx.fillStyle = "#334155";
    ctx.fillRect(-20, 2, 3, 16);
    ctx.fillRect(17, 2, 3, 16);
    ctx.restore();
  }

  // Front Aero Splitter
  if (c.aero.splitterLength > 0) {
    ctx.fillStyle = "#1a1008";
    ctx.fillRect(pts[0].x - 8, groundY - 7, c.aero.splitterLength / 4, 4);
    ctx.strokeStyle = "#007aff";
    ctx.lineWidth = 1;
    ctx.strokeRect(pts[0].x - 8, groundY - 7, c.aero.splitterLength / 4, 4);
  }

  // Rear Diffuser Fins
  if (c.aero.diffuserAngle > 0) {
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1.5;
    const diffX = pts[pts.length - 4].x;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(diffX + i * 8, groundY - 8);
      ctx.lineTo(diffX + i * 8 + 12, groundY - 8 - c.aero.diffuserAngle * 0.6);
      ctx.stroke();
    }
  }

  // Side Mirrors
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.ellipse(pts[4].x + 15, pts[4].y + 12, 4, 2.5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // LED Headlight Bulb
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(pts[1].x + 5, pts[1].y + 3, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crimson LED Taillight Strip & Diffuser Rain Light
  const tailX = pts[pts.length - 4].x - 5;
  const tailY = pts[pts.length - 4].y + 3;
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.ellipse(tailX, tailY, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rain light pulse
  if (c.frame % 30 < 15) {
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(tailX - 2, groundY - 12, 4, 4);
  }

  // Cutaway Overlay Views
  if (c.cutaway === "cooling") {
    ctx.strokeStyle = "rgba(52, 211, 153, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pts[1].x, pts[1].y);
    ctx.lineTo(pts[1].x + 40, pts[1].y + 15);
    ctx.lineTo(pts[1].x + 40, groundY - 30);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(pts[2].x + i * 15, pts[2].y);
      ctx.lineTo(pts[2].x + i * 15 + 20, pts[2].y + 20);
      ctx.stroke();
    }
  }
}

function drawWheel(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, frame: number, speed: number) {
  // Tire Outer Rubber
  ctx.fillStyle = "#090d16";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Hot Glowing Carbon-Ceramic Brake Disc Ring
  ctx.fillStyle = "rgba(249, 115, 22, 0.45)";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
  ctx.fill();

  // Rim Base
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
  ctx.fill();

  // Spinning 5-Spoke Alloy Wheels
  const angleOffset = (frame * speed * 0.15) % (Math.PI * 2);
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 5; i++) {
    const a = angleOffset + (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6);
    ctx.stroke();
  }

  // Outer Aluminum Rim Bezel
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

// ---------- Helpers ----------

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function lerpColor(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}
