import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  Flame,
  Sliders,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export function NeonSkidSparkStudio() {
  const { sim } = useDesign();

  const [vehicleSpeedKmh, setVehicleSpeedKmh] = useState(315); // km/h (150-380)
  const [compressionLoadKn, setCompressionLoadKn] = useState(18.5); // kN (5-35)
  const [skidBlockMaterial, setSkidBlockMaterial] = useState<"titanium_grade5" | "jabroc_wood" | "carbon_matrix_ceramic" | "tungsten_heavy">("titanium_grade5");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute Skid Dynamics
  const isSparking = vehicleSpeedKmh > 260 && (skidBlockMaterial === "titanium_grade5" || skidBlockMaterial === "tungsten_heavy");
  const plankWearMm = ((compressionLoadKn / 35) * 0.72).toFixed(2);
  const isFiaLegal = parseFloat(plankWearMm) <= 1.0;
  const sparkIntensity = isSparking ? Math.round((vehicleSpeedKmh / 380) * 100) : 0;
  const underbodyPlankTempC = isSparking ? Math.round(550 + (vehicleSpeedKmh / 380) * 450) : 120;

  // 60FPS Titanium Spark Particle Physics Canvas
  useEffect(() => {
    let animId: number;
    const particles: SparkParticle[] = [];

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Track Asphalt Line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(20, h * 0.85);
      ctx.lineTo(w - 20, h * 0.85);
      ctx.stroke();

      // Vehicle Underbody Plank
      ctx.fillStyle = isSparking ? "#d9b36c" : "#8fb9d9";
      ctx.fillRect(80, h * 0.85 - 8, 120, 8);

      // Spawn Sparks
      if (isSparking) {
        for (let i = 0; i < 4; i++) {
          particles.push({
            x: 200,
            y: h * 0.85 - 2,
            vx: (Math.random() * 8 + 4) * (vehicleSpeedKmh / 300),
            vy: (Math.random() - 0.7) * 5,
            life: 0,
            maxLife: Math.random() * 30 + 20,
          });
        }
      }

      // Update & Draw Sparks
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.life++;

        // Bounce off track ground
        if (p.y >= h * 0.85) {
          p.y = h * 0.85;
          p.vy = -p.vy * 0.6;
        }

        const alpha = 1 - p.life / p.maxLife;

        ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
        ctx.shadowColor = "#c9974f";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.life >= p.maxLife || p.x > w) {
          particles.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [vehicleSpeedKmh, isSparking]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow={isSparking ? "gold" : "cyan"}
        corners="reticle"
        header={{
          title: "TITANIUM SKID BLOCK & UNDERBODY SPARK SIMULATOR",
          subtitle: "FIA plank legal wear solver, high-speed asphalt bottoming dynamics, and high-visibility titanium spark projectile physics",
          icon: <Sparkles size={18} />,
          badge: <NeonHorizonBadge variant={isFiaLegal ? "live" : "coral"}>{isFiaLegal ? "FIA PLANK LEGAL" : "FIA WEAR LIMIT EXCEEDED"}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="FIA PLANK WEAR" value={`${plankWearMm} mm / 1.0mm`} accentColor={isFiaLegal ? "emerald" : "coral"} />
          <NeonHorizonDataCard label="SPARK INTENSITY" value={`${sparkIntensity}% SHOWER`} accentColor="gold" />
          <NeonHorizonDataCard label="SKID CONTACT TEMP" value={`${underbodyPlankTempC}°C`} accentColor={underbodyPlankTempC > 600 ? "coral" : "cyan"} />
          <NeonHorizonDataCard label="BOTTOMING LOAD" value={`${compressionLoadKn.toFixed(1)} kN`} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Spark Particle Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS TITANIUM ABRASION SPARK SHOWER PHYSICS CANVAS",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-[#05080f] rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className={`text-[10px] nh-font-mono font-bold ${isSparking ? "text-amber-400" : "text-sky-300"}`}>
                  {isSparking ? "TITANIUM SKID PUCKS GROUND CONTACT: ACTIVE SPARK STREAM" : "NO GROUND BOTTOMING: PLANK CLEARANCE MAINTAINED"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "titanium_grade5", name: "Titanium Gr.5" },
                { id: "jabroc_wood", name: "Jabroc Beech" },
                { id: "carbon_matrix_ceramic", name: "Carbon CMC" },
                { id: "tungsten_heavy", name: "Tungsten Skid" },
              ].map((m) => {
                const isSelected = skidBlockMaterial === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setSkidBlockMaterial(m.id as "titanium_grade5" | "jabroc_wood" | "carbon_matrix_ceramic" | "tungsten_heavy");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-[#0e1626] border-amber-400 text-amber-300"
 : "bg-[#0a111e] border-white/10 text-slate-400 hover:border-sky-400/25"
 }`}
                  >
                    {m.name}
                  </div>
                );
              })}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Sliders (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "VELOCITY & SUSPENSION COMPRESSION",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Vehicle Track Velocity"
              value={vehicleSpeedKmh}
              min={150}
              max={380}
              step={5}
              unit=" km/h"
              color={isSparking ? "gold" : "cyan"}
              onChange={(val) => setVehicleSpeedKmh(val)}
            />

            <NeonHorizonSlider
              label="Heave Aerodynamic Compression Load"
              value={compressionLoadKn}
              min={5.0}
              max={35.0}
              step={0.5}
              unit=" kN"
              color="magenta"
              onChange={(val) => setCompressionLoadKn(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">FIA Scrutineering:</span>
                <span className="text-emerald-300 font-bold">4-Point Micrometer Laser</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Puck Fasteners:</span>
                <span className="text-sky-300 font-bold">Countersunk Inconel Bolts</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
