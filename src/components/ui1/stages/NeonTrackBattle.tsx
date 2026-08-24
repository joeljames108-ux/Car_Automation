import React, { useState, useEffect, useRef } from "react";
import {
  Trophy,
  Flag,
  Activity,
  Gauge,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Flame,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSelect } from "../design/NeonHorizonSelect";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import { NeonCircuitDiagram, NeonTelemetryGraph } from "../design/NeonCircuitTelemetry";

export function NeonTrackBattle() {
  const { sim } = useDesign();

  const [circuit, setCircuit] = useState<string>("nurburgring");
  const [isRunning, setIsRunning] = useState(true);
  const [lapTime, setLapTime] = useState(0); // in seconds
  const [lateralG, setLateralG] = useState(1.24);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulation timer
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setLapTime((prev) => prev + 0.05);
      setLateralG(Number((1.1 + Math.sin(Date.now() / 600) * 0.45).toFixed(2)));
    }, 50);
    return () => clearInterval(timer);
  }, [isRunning]);

  // Circuit Map Animation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let progress = 0;

    const render = () => {
      progress = (progress + 0.004) % 1;
      ctx.fillStyle = "#030714";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Track Outline Path
      ctx.strokeStyle = "rgba(56,189,248, 0.4)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width * 0.38, canvas.height * 0.32, 0.2, 0, Math.PI * 2);
      ctx.stroke();

      // DRS Zone Glowing Stripe
      ctx.strokeStyle = "rgba(167,139,250, 0.8)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width * 0.38, canvas.height * 0.32, 0.2, 0, Math.PI * 0.5);
      ctx.stroke();

      // Moving Car Dot
      const angle = progress * Math.PI * 2 + 0.2;
      const cx = canvas.width / 2 + Math.cos(angle) * canvas.width * 0.38;
      const cy = canvas.height / 2 + Math.sin(angle) * canvas.height * 0.32;

      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const formatLap = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, "0")}`;
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header Panel */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "CIRCUIT LAP SIMULATOR & TELEMETRY BATTLE",
          subtitle: "Real-time sector splits, tire thermals, and lateral G friction circle",
          icon: <Trophy size={18} />,
          badge: <NeonHorizonBadge variant="live">RACE RUNNER ACTIVE</NeonHorizonBadge>,
          actions: (
            <div className="flex items-center gap-2">
              <NeonHorizonButton
                variant={isRunning ? "secondary" : "primary"}
                size="xs"
                icon={isRunning ? <Pause size={12} /> : <Play size={12} />}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? "Pause" : "Resume"}
              </NeonHorizonButton>
              <NeonHorizonButton
                variant="ghost"
                size="xs"
                icon={<RotateCcw size={12} />}
                onClick={() => setLapTime(0)}
              >
                Reset
              </NeonHorizonButton>
            </div>
          ),
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NeonHorizonSelect
            label="CIRCUIT VENUE"
            value={circuit}
            onChange={setCircuit}
            options={[
              { value: "nurburgring", label: "Nürburgring Nordschleife (20.8 km)", sublabel: "73 corners · The Green Hell" },
              { value: "spa", label: "Circuit de Spa-Francorchamps (7.0 km)", sublabel: "Eau Rouge · Raidillon" },
              { value: "lemans", label: "Circuit de la Sarthe / Le Mans (13.6 km)", sublabel: "Mulsanne Straight 350+ km/h" },
              { value: "silverstone", label: "Silverstone Grand Prix (5.9 km)", sublabel: "Maggotts & Becketts" },
            ]}
          />
          <NeonHorizonDataCard
            label="CURRENT LAP TIME"
            value={formatLap(lapTime)}
            accentColor="cyan"
          />
          <NeonHorizonDataCard
            label="PREDICTED BEST LAP"
            value="6:43.82"
            unit="min"
            accentColor="emerald"
          />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Track Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Animated Circuit Map */}
        <div className="lg:col-span-7">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "CIRCUIT APEX TRAJECTORY",
              icon: <Flag size={16} />,
            }}
            className="p-6 flex flex-col items-center justify-center relative"
          >
            <div className="w-full h-72 rounded-2xl overflow-hidden border border-sky-400/15 shadow-inner">
              <canvas ref={canvasRef} width={500} height={280} className="w-full h-full object-cover" />
            </div>

            {/* Sector Times */}
            <div className="w-full grid grid-cols-3 gap-3 border-t border-white/10 pt-4 mt-4 nh-font-mono text-center text-xs">
              <div className="bg-[#050b18] p-2.5 rounded-xl border border-sky-400/15">
                <span className="text-slate-400 text-[10px]">SECTOR 1</span>
                <div className="text-emerald-300 font-bold text-sm mt-0.5">34.21s</div>
              </div>
              <div className="bg-[#050b18] p-2.5 rounded-xl border border-sky-400/15">
                <span className="text-slate-400 text-[10px]">SECTOR 2</span>
                <div className="text-sky-300 font-bold text-sm mt-0.5">1:02.84s</div>
              </div>
              <div className="bg-[#050b18] p-2.5 rounded-xl border border-sky-400/15">
                <span className="text-slate-400 text-[10px]">SECTOR 3</span>
                <div className="text-sky-300 font-bold text-sm mt-0.5">42.15s</div>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Column (5 cols): 4-Tire Heatmap & G-Force Circle */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* 4-Wheel Tire Thermal & Pressure HUD */}
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "4-WHEEL TIRE THERMAL MATRIX",
              icon: <Activity size={16} />,
            }}
            className="p-5 flex flex-col items-center justify-center gap-3"
          >
            <div className="grid grid-cols-2 gap-4 w-full">
              {[
                { pos: "FL", temp: "92°C", psi: "2.1 BAR", state: "Optimal" },
                { pos: "FR", temp: "95°C", psi: "2.1 BAR", state: "Optimal" },
                { pos: "RL", temp: "98°C", psi: "2.0 BAR", state: "Hot" },
                { pos: "RR", temp: "101°C", psi: "2.0 BAR", state: "Hot" },
              ].map((tire) => (
                <div
                  key={tire.pos}
                  className="p-3 rounded-xl bg-[#071126] border border-sky-400/15 flex flex-col items-center justify-center text-center"
                >
                  <span className="text-[10px] nh-font-mono text-sky-400 font-bold">{tire.pos} TIRE</span>
                  <span className="text-lg font-black nh-font-headline text-slate-100 my-0.5">{tire.temp}</span>
                  <span className="text-[10px] nh-font-mono text-slate-400">{tire.psi}</span>
                </div>
              ))}
            </div>
          </NeonHorizonGlassPanel>

          {/* G-Force Friction Circle */}
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "G-FORCE FRICTION CIRCLE",
              icon: <Gauge size={16} />,
            }}
            className="p-5 flex flex-col items-center justify-center text-center"
          >
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-sky-400/30 relative flex items-center justify-center my-2">
              {/* Traction Limit Arc */}
              <div className="w-20 h-20 rounded-full border border-white/15" />
              {/* G-Force Marker */}
              <div
                style={{
                  transform: `translate(${Math.sin(Date.now() / 700) * 35}px, ${Math.cos(Date.now() / 500) * 25}px)`,
                }}
                className="w-4 h-4 rounded-full bg-rose-400 absolute"
              />
            </div>
            <div className="text-xs nh-font-mono text-slate-300">
              LATERAL: <span className="text-sky-300 font-bold">{lateralG} G</span> · LONGITUDINAL: <span className="text-amber-300 font-bold">1.45 G</span>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
