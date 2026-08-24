import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Sliders,
  Zap,
  ShieldCheck,
  Layers,
  Gauge,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonMagneRideStudio() {
  const { sim } = useDesign();

  const [coilCurrentAmps, setCoilCurrentAmps] = useState(3.2); // Amps (0.0 - 5.0)
  const [damperMode, setDamperMode] = useState<"track_firm" | "gt_comfort" | "pothole_active" | "curb_hop">("track_firm");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute MR Fluid Damping Dynamics
  const dampingForceN = Math.round(400 + (coilCurrentAmps / 5.0) * 8100);
  const fluidViscosityCp = Math.round(50 + (coilCurrentAmps / 5.0) * 1200);
  const responseTimeMs = "1.0 ms (1,000 Hz CAN-FD)";

  // 60FPS Damper Oscillation Oscilloscope Canvas
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

      // Grid Lines
      ctx.strokeStyle = "rgba(0, 229, 255, 0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Center Reference Axis
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Road Bump Excitation (Cyan Wave)
      const decay = Math.max(0.05, 0.4 - (coilCurrentAmps / 5.0) * 0.35);

      ctx.strokeStyle = "rgba(0, 229, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        const t = (x + tick * 3) * 0.05;
        const bump = Math.sin(t) * Math.exp(-((x % 160) * decay * 0.1)) * (h * 0.35);
        const y = h / 2 + bump;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Damped Piston Velocity (Magenta)
      ctx.strokeStyle = "rgba(255, 0, 85, 0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      for (let x = 0; x < w; x++) {
        const t = (x + tick * 3) * 0.05 + 0.8;
        const bump = Math.sin(t) * Math.exp(-((x % 160) * decay * 0.18)) * (h * 0.15);
        const y = h / 2 + bump;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [coilCurrentAmps]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "MAGNETORHEOLOGICAL (MR) FLUID DAMPER & 1,000 Hz MagneRide LAB",
          subtitle: "1,000 Hz coil current alignment of iron nanoparticles in synthetic hydrocarbon fluid, millisecond kerb response, and adaptive stiffness",
          icon: <Activity size={18} />,
          badge: <NeonHorizonBadge variant="live">MR DAMPER ACTIVE · {damperMode.toUpperCase().replace(/_/g, " ")}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="PEAK DAMPING FORCE" value={`${dampingForceN} N/m`} accentColor="emerald" />
          <NeonHorizonDataCard label="COIL CURRENT" value={`${coilCurrentAmps.toFixed(1)} A DC`} accentColor="cyan" />
          <NeonHorizonDataCard label="MR FLUID VISCOSITY" value={`${fluidViscosityCp} cP`} accentColor="gold" />
          <NeonHorizonDataCard label="SAMPLING LATENCY" value={responseTimeMs} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Oscilloscope Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS 1,000 Hz TRANSIENT KERB STRIKE DAMPING OSCILLOSCOPE",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-[#030712] rounded-xl border border-cyan-500/30 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className="text-[10px] nh-font-mono font-bold text-cyan-300">
                  BLUE: WHEEL ROAD EXCITATION · PINK: REBOUND PISTON RESPONSE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "track_firm", name: "Track Firm" },
                { id: "gt_comfort", name: "GT Touring" },
                { id: "pothole_active", name: "Pothole Mitigate" },
                { id: "curb_hop", name: "Apex Kerb Strike" },
              ].map((m) => {
                const isSelected = damperMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setDamperMode(m.id as "track_firm" | "gt_comfort" | "pothole_active" | "curb_hop");
                      if (m.id === "track_firm") setCoilCurrentAmps(4.5);
                      else if (m.id === "gt_comfort") setCoilCurrentAmps(1.2);
                      else if (m.id === "curb_hop") setCoilCurrentAmps(3.8);
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#091a38] border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                        : "bg-[#060e22] border-white/10 text-slate-400 hover:border-cyan-500/30"
                    }`}
                  >
                    {m.name}
                  </div>
                );
              })}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right MagneRide Sliders (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "ELECTROMAGNET COIL CURRENT TUNING",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Damper Electromagnet Coil Current"
              value={coilCurrentAmps}
              min={0.0}
              max={5.0}
              step={0.1}
              unit=" A"
              color="cyan"
              onChange={(val) => setCoilCurrentAmps(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#060e22] border border-cyan-500/20 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Damper Fluid:</span>
                <span className="text-cyan-300 font-bold">Hydrocarbon + 35% Fe Nanoparticles</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Coil Thermal State:</span>
                <span className="text-emerald-300 font-bold">54°C (Normal Range)</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
