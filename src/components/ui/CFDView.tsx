import { useMemo, useRef, useState, useEffect, useCallback } from "react";
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
const PARTICLE_COUNT = 220;

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
  const dragRef = useRef({ x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 });

  // Car profile points (side silhouette of a sports car)
  const carProfile = useMemo(() => buildCarProfile(aero), [aero]);

  // Initialize particles
  useEffect(() => {
    const ps: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      ps.push(spawnParticle());
    }
    particlesRef.current = ps;
  }, []);

  // Run simulation animation
  useEffect(() => {
    if (!playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      frameRef.current++;
      drawScene(ctx, {
        mode, aero, carProfile, particles: particlesRef.current,
        frame: frameRef.current, speed, showVectors, showGrid, showCar,
        cutaway, cameraAngle, zoom, airSpeed,
        dragCoeff, liftCoeff, downforce, sim,
      });
      if (simRunning && simProgress < 100) {
        setSimProgress((p) => Math.min(100, p + speed * 0.8));
      }
      animRef.current = requestAnimationFrame(render);
    };
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, mode, aero, carProfile, speed, showVectors, showGrid, showCar, cutaway, cameraAngle, zoom, airSpeed, dragCoeff, liftCoeff, downforce, sim, simRunning, simProgress]);

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate) return;
    const t = setInterval(() => setCameraAngle((a) => a + 0.5), 50);
    return () => clearInterval(t);
  }, [autoRotate]);

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
      <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-base-950 rounded-lg border border-base-800 font-mono text-[10px]">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${simRunning ? "bg-ok-400 animate-pulse" : "bg-slate-600"}`} />
            {simRunning ? "SIMULATION RUNNING" : "READY"}
          </span>
          <span className="text-slate-600">|</span>
          <span>AIR SPEED: <span className="text-accent-300">{airSpeed} km/h</span></span>
          <span className="text-slate-600">|</span>
          <span>Re: <span className="text-slate-300">{(airSpeed * 21000).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">MESH: 2.4M cells</span>
          {simRunning && <span className="text-accent-300">{simProgress.toFixed(0)}%</span>}
        </div>
      </div>

      {/* Canvas viewport */}
      <div
        className="relative bg-gradient-to-b from-base-950 to-black rounded-lg overflow-hidden border border-base-800 cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <canvas ref={canvasRef} width={VIEW_W} height={VIEW_H} className="w-full block" style={{ imageRendering: "auto" }} />

        {/* Data overlay - top left */}
        <div className="absolute top-2 left-2 space-y-0.5 font-mono text-[10px] pointer-events-none">
          <DataLine label="Cd" value={dragCoeff.toFixed(3)} />
          <DataLine label="Front Lift" value={`${frontLift} kg`} tone={frontLift > 20 ? "warn" : "ok"} />
          <DataLine label="Rear Down" value={`${rearDown} kg`} tone="ok" />
          <DataLine label="Drag Force" value={`${dragForce} N`} />
          <DataLine label="Power Loss" value={`${powerLoss} hp`} tone="warn" />
        </div>

        {/* Data overlay - top right */}
        <div className="absolute top-2 right-2 space-y-0.5 font-mono text-[10px] text-right pointer-events-none">
          <DataLine label="Flow Sep" value={`${(sim.separationRisk * 100).toFixed(0)}%`} tone={sim.separationRisk > 0.5 ? "danger" : "ok"} />
          <DataLine label="Velocity" value={`${airVelocity} km/h`} />
          <DataLine label="Pressure" value={`${pressure} kPa`} />
          <DataLine label="Ride Ht" value={`${aero.rideHeight} mm`} />
          <DataLine label="Cool Eff" value={`${(sim.coolingEfficiency * 100).toFixed(0)}%`} tone="ok" />
        </div>

        {/* Mode label - bottom left */}
        <div className="absolute bottom-2 left-2 font-mono text-[10px] text-slate-500 pointer-events-none uppercase tracking-widest">
          {MODE_LABELS[mode].label} Map
        </div>

        {/* Legend - bottom right */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 pointer-events-none">
          <span className="font-mono text-[9px] text-slate-500">LOW</span>
          <div className="w-20 h-2 rounded-full" style={{ background: "linear-gradient(to right, #1e40af, #22c55e, #eab308, #f97316, #ef4444)" }} />
          <span className="font-mono text-[9px] text-slate-500">HIGH</span>
        </div>

        {/* Camera controls hint */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] text-slate-700 font-mono pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
          DRAG TO ROTATE · SCROLL TO ZOOM
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex flex-wrap gap-1 mt-2">
        {(Object.keys(MODE_LABELS) as VizMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all ${
              mode === m ? "bg-accent-500/20 text-accent-300 border border-accent-500/40" : "bg-base-850 text-slate-400 border border-base-800 hover:text-slate-200"
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
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-base-850 text-slate-400 border border-base-800 hover:text-slate-200 transition-all"
          >
            <ChevronDown size={10} /> Cutaway: {cutaway === "none" ? "Off" : cutaway}
          </button>
        </div>
      </div>

      {/* Simulation controls */}
      <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-base-950 rounded-lg border border-base-800">
        <button
          onClick={() => setPlaying(!playing)}
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent-500/20 border border-accent-500/40 text-accent-300 hover:bg-accent-500/30 transition-all"
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}
        </button>
        <button
          onClick={runSimulation}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ok-500/20 border border-ok-500/40 text-ok-300 text-[10px] font-medium hover:bg-ok-500/30 transition-all"
        >
          <Play size={11} /> Run Sim
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-base-800 border border-base-700 text-slate-400 text-[10px] font-medium hover:text-slate-200 transition-all"
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
      className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all border ${
        active ? "bg-accent-500/20 text-accent-300 border-accent-500/40" : "bg-base-850 text-slate-500 border-base-800 hover:text-slate-300"
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

function spawnParticle(): Particle {
  return {
    x: -20 + Math.random() * 40,
    y: 40 + Math.random() * (VIEW_H - 80),
    vx: 1.5 + Math.random() * 1,
    vy: 0,
    life: 0,
    maxLife: 300 + Math.random() * 200,
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

  // Background gradient (studio)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, "#0a0e17");
  bgGrad.addColorStop(0.7, "#070a12");
  bgGrad.addColorStop(1, "#050709");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  if (c.showGrid) {
    ctx.strokeStyle = "rgba(100, 116, 139, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  // Ground line
  const groundY = H * 0.68;
  ctx.strokeStyle = "rgba(100, 116, 139, 0.15)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(W, groundY);
  ctx.stroke();

  // Ground reflection
  const reflGrad = ctx.createLinearGradient(0, groundY, 0, H);
  reflGrad.addColorStop(0, "rgba(34, 211, 238, 0.04)");
  reflGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = reflGrad;
  ctx.fillRect(0, groundY, W, H - groundY);

  // Apply camera transform
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(c.zoom, c.zoom);
  ctx.rotate(c.cameraAngle * Math.PI / 180 * 0.3);
  ctx.translate(-W / 2, -H / 2);

  // Draw pressure/velocity heatmap behind car
  if (c.mode === "pressure" || c.mode === "velocity") {
    drawHeatmap(ctx, c);
  }

  // Draw ground effect under car
  if (c.mode === "ground" || c.cutaway === "underfloor") {
    drawGroundEffect(ctx, c);
  }

  // Update and draw particles (streamlines)
  if (c.mode === "streamlines" || c.mode === "velocity" || c.mode === "pressure" || c.mode === "wake" || c.mode === "turbulence") {
    updateParticles(ctx, c);
    drawParticles(ctx, c);
  }

  // Draw wake/turbulence
  if (c.mode === "wake" || c.mode === "turbulence") {
    drawWake(ctx, c);
  }

  // Draw velocity vectors
  if (c.showVectors) {
    drawVectors(ctx, c);
  }

  // Draw car
  if (c.showCar) {
    drawCar(ctx, c);
  }

  ctx.restore();

  // Vignette
  const vignette = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.7);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}

function drawHeatmap(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const W = VIEW_W, H = VIEW_H;
  const cellSize = 12;
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
      p += Math.exp(-dFront * dFront * 8) * 0.9;
      // Rear wake (low pressure)
      const dRear = Math.hypot(fx - 0.6, fy * 0.4);
      p -= Math.exp(-dRear * dRear * 6) * 0.5;
      // Underbody (low pressure = downforce)
      if (y > groundY - 20 && y < groundY && x > carFront + 20 && x < carCenter + 120) {
        p -= 0.3 * Math.abs(c.liftCoeff);
      }
      // Wing area
      const wingX = carCenter + 130;
      const wingY = groundY - 50 - c.aero.wingHeight / 30;
      const dWing = Math.hypot((x - wingX) / 60, (y - wingY) / 30);
      p -= Math.exp(-dWing * dWing * 3) * 0.4;

      const color = c.mode === "velocity"
        ? velocityColor(c.airSpeed, p, x, y, carCenter, groundY)
        : pressureColor(p);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.35;
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
  // Velocity increases over roof, decreases in wake
  const dx = (x - carCx) / 200;
  const overCar = Math.exp(-Math.pow(dx, 2) * 3) * (y < groundY - 30 && y > groundY - 100 ? 1 : 0);
  const inWake = x > carCx + 100 && y > groundY - 80 && y < groundY + 20;
  let v = 0.5 + overCar * 0.4 - (inWake ? 0.3 : 0);
  v = clamp(v, 0, 1);
  if (v < 0.25) return lerpColor("#1e40af", "#22c55e", v / 0.25);
  if (v < 0.5) return lerpColor("#22c55e", "#eab308", (v - 0.25) / 0.25);
  if (v < 0.75) return lerpColor("#eab308", "#f97316", (v - 0.5) / 0.25);
  return lerpColor("#f97316", "#ef4444", (v - 0.75) / 0.25);
}

function drawGroundEffect(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const groundY = VIEW_H * 0.68;
  const carCenter = VIEW_W * 0.38;
  const front = carCenter - 140;
  const rear = carCenter + 140;
  const rideH = c.aero.rideHeight / 10;

  // Underbody flow
  const grad = ctx.createLinearGradient(front, groundY, rear, groundY);
  grad.addColorStop(0, "rgba(34, 211, 238, 0.5)");
  grad.addColorStop(0.5, "rgba(34, 197, 94, 0.6)");
  grad.addColorStop(1, "rgba(239, 68, 68, 0.5)");
  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.4;
  ctx.fillRect(front + 10, groundY - rideH - 2, rear - front - 20, rideH + 4);
  ctx.globalAlpha = 1;

  // Diffuser expansion
  if (c.aero.diffuserAngle > 0) {
    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const sx = rear - 30 + i * 8;
      ctx.beginPath();
      ctx.moveTo(sx, groundY - rideH);
      ctx.lineTo(sx + 20, groundY - rideH - c.aero.diffuserAngle);
      ctx.stroke();
    }
  }

  // Flow arrows under car
  ctx.strokeStyle = "rgba(34, 211, 238, 0.6)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const ax = front + 20 + i * 30 + (c.frame * c.speed * 0.5) % 30;
    const ay = groundY - rideH / 2;
    drawArrow(ctx, ax, ay, ax + 12, ay);
  }
}

function updateParticles(_ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const W = VIEW_W, H = VIEW_H;
  const groundY = H * 0.68;
  const carCenter = W * 0.38;
  const carFront = carCenter - 140;
  const carRear = carCenter + 140;
  const roofY = groundY - 70 - (c.aero.roofHeight - 1100) * 0.08;
  const dt = c.speed * 0.5;

  for (const p of c.particles) {
    p.life += dt;
    // Store trail
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 15) p.trail.shift();

    // Base flow velocity
    p.vx = 1.5 + c.airSpeed / 200;
    p.vy = 0;

    // Flow around front - split up/down
    if (p.x > carFront - 20 && p.x < carFront + 20) {
      const yRel = (p.y - groundY + 40) / 80;
      if (p.y < groundY - 20) {
        p.vy = -0.8 - yRel * 0.5; // up over hood
      } else {
        p.vy = 0.5; // down under splitter
        p.vx *= 0.7;
      }
    }

    // Climb windshield
    if (p.x > carFront + 40 && p.x < carFront + 100 && p.y < groundY - 20) {
      p.vy = -0.6;
    }

    // Accelerate over roof
    if (p.x > carFront + 100 && p.x < carRear - 40 && p.y < roofY + 10) {
      p.vy = -0.2;
      p.vx *= 1.15;
    }

    // Detach behind rear
    if (p.x > carRear - 20 && p.x < carRear + 60) {
      if (p.y < groundY - 30) {
        p.vy = 0.3 + Math.sin(p.life * 0.1 + p.x * 0.05) * 0.4;
      }
    }

    // Wake turbulence
    if (p.x > carRear + 20 && p.x < carRear + 200) {
      const turb = Math.sin(p.life * 0.08 + p.y * 0.05) * 0.8;
      p.vy += turb * 0.3;
      p.vx *= 0.9;
    }

    // Wheel vortex
    const wheelX = carFront + 30;
    const wheelY = groundY;
    if (Math.hypot(p.x - wheelX, p.y - wheelY) < 40 && p.x > wheelX) {
      p.vy += Math.sin(p.life * 0.15) * 0.5;
    }
    const wheelX2 = carRear - 30;
    if (Math.hypot(p.x - wheelX2, p.y - wheelY) < 40 && p.x > wheelX2) {
      p.vy += Math.sin(p.life * 0.15) * 0.4;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Respawn
    if (p.x > W + 20 || p.life > p.maxLife || p.y < 0 || p.y > H) {
      Object.assign(p, spawnParticle());
    }
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  for (const p of c.particles) {
    const speed = Math.hypot(p.vx, p.vy);
    const alpha = clamp(speed / 3, 0.15, 0.7);
    const color = c.mode === "turbulence" || c.mode === "wake"
      ? `rgba(168, 139, 250, ${alpha})`
      : `rgba(34, 211, 238, ${alpha})`;

    // Draw trail
    if (p.trail.length > 1) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x, p.trail[0].y);
      for (let i = 1; i < p.trail.length; i++) {
        ctx.lineTo(p.trail[i].x, p.trail[i].y);
      }
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    // Particle head
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWake(ctx: CanvasRenderingContext2D, c: DrawCtx) {
  const groundY = VIEW_H * 0.68;
  const carRear = VIEW_W * 0.38 + 140;
  const t = c.frame * 0.02 * c.speed;

  // Vortex spirals behind car
  for (let i = 0; i < 3; i++) {
    const cx = carRear + 40 + i * 60;
    const cy = groundY - 40 - i * 10;
    const radius = 15 + i * 8;
    ctx.strokeStyle = `rgba(168, 139, 250, ${0.3 - i * 0.07})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 4; a += 0.15) {
      const r = radius * (1 - a / (Math.PI * 4));
      const x = cx + Math.cos(a + t + i) * r;
      const y = cy + Math.sin(a + t + i) * r * 0.6;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Turbulent smoke
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 20; i++) {
    const phase = (t + i * 0.3) % 1;
    const x = carRear + phase * 250;
    const y = groundY - 30 - Math.sin(t * 3 + i) * 25 - phase * 20;
    const r = 8 + phase * 15;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(168, 139, 250, 0.3)");
    grad.addColorStop(1, "rgba(168, 139, 250, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
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

  // Shadow under car
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.beginPath();
  ctx.ellipse(carCenter, groundY + 4, 160, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Car body with gradient (studio lighting)
  const bodyGrad = ctx.createLinearGradient(0, groundY - 80, 0, groundY);
  bodyGrad.addColorStop(0, "#3a4a6b");
  bodyGrad.addColorStop(0.3, "#2a3650");
  bodyGrad.addColorStop(0.7, "#1e2839");
  bodyGrad.addColorStop(1, "#141a28");

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

  // Rim light (top edge)
  ctx.strokeStyle = "rgba(100, 150, 200, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();

  // Highlight on roof
  const roofPts = pts.slice(4, 8);
  ctx.strokeStyle = "rgba(200, 220, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(roofPts[0].x, roofPts[0].y);
  for (let i = 1; i < roofPts.length; i++) {
    ctx.lineTo(roofPts[i].x, roofPts[i].y);
  }
  ctx.stroke();

  // Windows
  ctx.fillStyle = "rgba(20, 30, 50, 0.7)";
  ctx.beginPath();
  const winFront = pts[4];
  const winRear = pts[7];
  ctx.moveTo(winFront.x + 5, winFront.y + 5);
  ctx.lineTo(winFront.x + 10, winFront.y + 2);
  ctx.lineTo(winRear.x - 5, winRear.y + 2);
  ctx.lineTo(winRear.x, winRear.y + 8);
  ctx.closePath();
  ctx.fill();

  // Wheels
  const wheelFront = pts[0];
  const wheelRear = pts[pts.length - 3];
  drawWheel(ctx, wheelFront.x + 30, groundY, 14);
  drawWheel(ctx, wheelRear.x - 25, groundY, 14);

  // Wing
  if (c.aero.wingAngle > 0 || c.aero.wingHeight > 100) {
    const wingX = carCenter + 130;
    const wingY = groundY - 50 - c.aero.wingHeight / 30;
    ctx.save();
    ctx.translate(wingX, wingY);
    ctx.rotate(-c.aero.wingAngle * Math.PI / 180 * 0.3);
    // Wing
    ctx.fillStyle = "#1a2030";
    ctx.fillRect(-25, -2, 50, 4);
    ctx.strokeStyle = "rgba(100, 150, 200, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(-25, -2, 50, 4);
    // Supports
    ctx.fillStyle = "#2a3650";
    ctx.fillRect(-20, 2, 2, 15);
    ctx.fillRect(18, 2, 2, 15);
    ctx.restore();
  }

  // Splitter
  if (c.aero.splitterLength > 0) {
    ctx.fillStyle = "#1a2030";
    ctx.fillRect(pts[0].x - 5, groundY - 6, c.aero.splitterLength / 5, 3);
  }

  // Diffuser fins
  if (c.aero.diffuserAngle > 0) {
    ctx.strokeStyle = "rgba(60, 80, 120, 0.6)";
    ctx.lineWidth = 1;
    const diffX = pts[pts.length - 4].x;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(diffX + i * 8, groundY - 8);
      ctx.lineTo(diffX + i * 8 + 10, groundY - 8 - c.aero.diffuserAngle * 0.5);
      ctx.stroke();
    }
  }

  // Mirrors
  ctx.fillStyle = "#2a3650";
  ctx.beginPath();
  ctx.ellipse(pts[4].x + 15, pts[4].y + 12, 4, 2.5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Headlight
  ctx.fillStyle = "rgba(200, 220, 255, 0.3)";
  ctx.beginPath();
  ctx.ellipse(pts[1].x + 5, pts[1].y + 3, 6, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Taillight
  ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
  ctx.beginPath();
  ctx.ellipse(pts[pts.length - 4].x - 5, pts[pts.length - 4].y + 3, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cutaway views
  if (c.cutaway === "cooling") {
    ctx.strokeStyle = "rgba(34, 211, 238, 0.5)";
    ctx.lineWidth = 1;
    // Radiator airflow
    ctx.beginPath();
    ctx.moveTo(pts[1].x, pts[1].y);
    ctx.lineTo(pts[1].x + 40, pts[1].y + 15);
    ctx.lineTo(pts[1].x + 40, groundY - 30);
    ctx.stroke();
    // Cooling ducts
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(pts[2].x + i * 15, pts[2].y);
      ctx.lineTo(pts[2].x + i * 15 + 20, pts[2].y + 20);
      ctx.stroke();
    }
  }

  if (c.cutaway === "underfloor") {
    // Already drawn in drawGroundEffect
  }
}

function drawWheel(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  // Tire
  ctx.fillStyle = "#0a0d15";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // Rim
  ctx.fillStyle = "#2a3650";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
  ctx.fill();
  // Spokes
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55);
    ctx.stroke();
  }
  // Outer ring
  ctx.strokeStyle = "#3a4a6b";
  ctx.lineWidth = 1.5;
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
