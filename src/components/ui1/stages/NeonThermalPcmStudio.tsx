import React, { useState, useEffect, useRef } from "react";
import {
  Thermometer,
  Sliders,
  Activity,
  Zap,
  ShieldCheck,
  Layers,
  Flame,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonThermalPcmStudio() {
  const { sim } = useDesign();

  const [pcmMassKg, setPcmMassKg] = useState(8.5); // kg (2 - 20)
  const [thermalSpikeHeatKw, setThermalSpikeHeatKw] = useState(145); // kW (50 - 300)
  const [pcmCompound, setPcmCompound] = useState<"erythritol_high_temp" | "paraffin_hybrid" | "metallic_gallium_alloy" | "hydrated_salt">("erythritol_high_temp");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute PCM Phase Thermodynamics
  const latentHeatCapacityKj = Math.round(pcmMassKg * (pcmCompound === "erythritol_high_temp" ? 340 : pcmCompound === "metallic_gallium_alloy" ? 420 : 250));
  const peakBufferDurationSec = (latentHeatCapacityKj / thermalSpikeHeatKw).toFixed(1);
  const liquidFractionPct = Math.min(100, Math.round((thermalSpikeHeatKw / 300) * 85 + (1 - pcmMassKg / 20) * 15));
  const effectiveConductivityWmK = pcmCompound === "metallic_gallium_alloy" ? 8500 : 4500;

  // 60FPS Liquid-Solid Phase Transition Canvas
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

      // Vapor Chamber Planar Enclosure
      ctx.strokeStyle = "rgba(56,189,248, 0.4)";
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 30, w - 80, h - 60);

      // Solid Phase Region (Cyan Crystals)
      const liquidW = (liquidFractionPct / 100) * (w - 80);

      // Liquid Melted Phase Region (Amber Molten)
      const grad = ctx.createLinearGradient(40, 0, 40 + liquidW, 0);
      grad.addColorStop(0, "rgba(251, 191, 36, 0.65)");
      grad.addColorStop(1, "rgba(56,189,248, 0.2)");

      ctx.fillStyle = grad;
      ctx.fillRect(40, 30, liquidW, h - 60);

      // Liquid-Solid Phase Transition Boundary Wave
      ctx.strokeStyle = "#d9b36c";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let y = 30; y <= h - 30; y += 5) {
        const waveX = 40 + liquidW + Math.sin(y * 0.1 + tick * 0.08) * 8;
        if (y === 30) ctx.moveTo(waveX, y);
        else ctx.lineTo(waveX, y);
      }
      ctx.stroke();

      // Micro Heat Pipe Vapor Circulation Bubbles
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 6; i++) {
        const bx = 50 + (i * (liquidW / 6));
        const by = 40 + ((tick * 2 + i * 25) % (h - 80));
        ctx.beginPath();
        ctx.arc(bx, by, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [liquidFractionPct]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "PHASE CHANGE MATERIAL (PCM) & THERMAL VAPOR CHAMBER LAB",
          subtitle: "Latent heat thermal storage buffers absorbing extreme regenerative braking and electric launch spikes without cooling flow pumps",
          icon: <Thermometer size={18} />,
          badge: <NeonHorizonBadge variant="live">PCM BUFFER ACTIVE · {pcmCompound.toUpperCase().replace(/_/g, " ")}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="LATENT HEAT BUFFER" value={`${latentHeatCapacityKj} kJ`} accentColor="emerald" />
          <NeonHorizonDataCard label="PEAK SPIKE ABSORPTION" value={`${peakBufferDurationSec} s CONTINUOUS`} accentColor="cyan" />
          <NeonHorizonDataCard label="LIQUID MELT FRACTION" value={`${liquidFractionPct}% PHASE SHIFT`} accentColor="gold" />
          <NeonHorizonDataCard label="THERMAL CONDUCTIVITY" value={`${effectiveConductivityWmK.toLocaleString()} W/m·K`} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Phase Shift Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS SOLID-TO-LIQUID LATENT HEAT INTERFACE BOUNDARY",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-slate-900/80 rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className="text-[10px] nh-font-mono font-bold text-amber-400">
                  LATENT HEAT TRANSITION: 118°C ISOTHERMAL BUFFERING ACTIVE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "erythritol_high_temp", name: "Erythritol (118°C)" },
                { id: "paraffin_hybrid", name: "Paraffin Wax (65°C)" },
                { id: "metallic_gallium_alloy", name: "Gallium Alloy" },
                { id: "hydrated_salt", name: "Salt Hydrate" },
              ].map((m) => {
                const isSelected = pcmCompound === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setPcmCompound(m.id as "erythritol_high_temp" | "paraffin_hybrid" | "metallic_gallium_alloy" | "hydrated_salt");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-slate-900/80 border-amber-400 text-amber-300"
 : "bg-slate-900/80 border-white/10 text-slate-400 hover:border-sky-400/25"
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
              title: "BUFFER MASS & TRANSIENT HEAT LOAD",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="PCM Enclosure Matrix Mass"
              value={pcmMassKg}
              min={2.0}
              max={20.0}
              step={0.5}
              unit=" kg"
              color="cyan"
              onChange={(val) => setPcmMassKg(val)}
            />

            <NeonHorizonSlider
              label="Transient Peak Thermal Load Spike"
              value={thermalSpikeHeatKw}
              min={50}
              max={300}
              step={5}
              unit=" kW"
              color="magenta"
              onChange={(val) => setThermalSpikeHeatKw(val)}
            />

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Vapor Chamber Wick:</span>
                <span className="text-emerald-300 font-bold">Sintered Copper Powder</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Working Fluid:</span>
                <span className="text-amber-300 font-bold">Deionized Water (Vacuum)</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
