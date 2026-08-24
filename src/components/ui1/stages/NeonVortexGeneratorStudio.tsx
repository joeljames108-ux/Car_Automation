import React, { useState, useEffect, useRef } from "react";
import {
  Wind,
  Sliders,
  Activity,
  Zap,
  ShieldCheck,
  Layers,
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

export function NeonVortexGeneratorStudio() {
  const { sim } = useDesign();

  const [vgHeightMm, setVgHeightMm] = useState(18); // mm (8-30)
  const [vgIncidenceAngle, setVgIncidenceAngle] = useState(15); // deg (5-25)
  const [vgType, setVgType] = useState<"delta_wing" | "gothic_arch" | "rectangular_fin" | "micro_strakes">("delta_wing");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute Aerodynamics
  const separationDelayDeg = (3.0 + (vgHeightMm / 30) * 5.5).toFixed(1);
  const rearWingEfficiency = Math.round(8 + (vgHeightMm / 30) * 8); // %
  const vortexStrengthRadS = Math.round(40 + (vgIncidenceAngle / 25) * 80);
  const dragDeltaCd = `+${(0.002 + (vgHeightMm / 30) * 0.003).toFixed(4)}`;

  // 60FPS Vortex Helical Streamline Canvas
  useEffect(() => {
    let animId: number;
    let tick = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Roof Surface
      ctx.strokeStyle = "rgba(56,189,248, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, h * 0.6);
      ctx.lineTo(w - 30, h * 0.6);
      ctx.stroke();

      // Vortex Generator Fin (Gold Triangle)
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.moveTo(80, h * 0.6);
      ctx.lineTo(110, h * 0.6 - (vgHeightMm / 30) * 35);
      ctx.lineTo(130, h * 0.6);
      ctx.closePath();
      ctx.fill();

      // Helical Vortex Swirl Streamlines
      ctx.strokeStyle = "rgba(56,189,248, 0.8)";
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 4; i++) {
        const offset = (tick * 4 + i * 40) % (w - 150);
        const sx = 130 + offset;
        const radius = 8 + (offset / (w - 150)) * 14;
        const angle = (tick * 0.15 + (offset * 0.08));
        const sy = h * 0.58 - (vgHeightMm / 30) * 15 + Math.sin(angle) * radius;

        ctx.fillStyle = i % 2 === 0 ? "#38bdf8" : "#a855f7";
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [vgHeightMm, vgIncidenceAngle]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "MICRO VORTEX GENERATOR (VG) BOUNDARY LAYER LAB",
          subtitle: "Roofline trailing edge delta-wing trip strips injecting high-energy helical vortices into the boundary layer to prevent rear window stall",
          icon: <Wind size={18} />,
          badge: <NeonHorizonBadge variant="live">VORTEX GENERATOR ARRAY ACTIVE · {vgType.toUpperCase().replace(/_/g, " ")}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="SEPARATION DELAY" value={`+${separationDelayDeg}° AoA`} accentColor="emerald" />
          <NeonHorizonDataCard label="REAR WING EFFICIENCY" value={`+${rearWingEfficiency}%`} accentColor="cyan" />
          <NeonHorizonDataCard label="VORTEX CORE STRENGTH" value={`${vortexStrengthRadS} rad/s`} accentColor="magenta" />
          <NeonHorizonDataCard label="PARASITIC DRAG DELTA" value={`${dragDeltaCd} Cd`} accentColor="gold" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Vortex Particle Swirl Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS HELICAL VORTICITY SWIRL STREAMLINE SIMULATION",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-[#030712] rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className="text-[10px] nh-font-mono font-bold text-sky-300">
                  ACTIVE BOUNDARY LAYER TRIPPING: DOWNSTREAM REAR WING ATTACHED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "delta_wing", name: "Delta Wing" },
                { id: "gothic_arch", name: "Gothic Arch" },
                { id: "rectangular_fin", name: "Rectangular" },
                { id: "micro_strakes", name: "Micro Strakes" },
              ].map((m) => {
                const isSelected = vgType === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setVgType(m.id as "delta_wing" | "gothic_arch" | "rectangular_fin" | "micro_strakes");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-[#091a38] border-sky-400/40 text-sky-300"
 : "bg-[#060e22] border-white/10 text-slate-400 hover:border-sky-400/25"
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
              title: "FIN HEIGHT & INCIDENCE ANGLE TUNING",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Vortex Generator Fin Height"
              value={vgHeightMm}
              min={8}
              max={30}
              step={1}
              unit=" mm"
              color="cyan"
              onChange={(val) => setVgHeightMm(val)}
            />

            <NeonHorizonSlider
              label="Fin Incidence Angle of Attack"
              value={vgIncidenceAngle}
              min={5}
              max={25}
              step={1}
              unit="°"
              color="magenta"
              onChange={(val) => setVgIncidenceAngle(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#060e22] border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Array Configuration:</span>
                <span className="text-emerald-300 font-bold">12x Counter-Rotating Pairs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Boundary Layer Thickness:</span>
                <span className="text-sky-300 font-bold">22.4 mm (Matched δ)</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
