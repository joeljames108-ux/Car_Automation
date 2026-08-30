import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  Waves,
  Sliders,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Layers,
  TrendingDown,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonPorpoisingLabStudio() {
  const { sim } = useDesign();

  const [rideHeightMm, setRideHeightMm] = useState(25); // mm
  const [vehicleSpeed, setVehicleSpeed] = useState(310); // km/h
  const [heaveDamperStiffness, setHeaveDamperStiffness] = useState(75); // %

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Porpoising Frequency & Severity Solver
  // Ground effect suction stalls when ride height drops too low at high aero loads
  const isPorpoisingZone = rideHeightMm < 30 && vehicleSpeed > 260 && heaveDamperStiffness < 80;
  const porpoisingHz = isPorpoisingZone ? (4.2 + (30 - rideHeightMm) * 0.15).toFixed(1) : "0.0";
  const driverVerticalG = isPorpoisingZone ? (1.2 + (30 - rideHeightMm) * 0.12 * (vehicleSpeed / 300)).toFixed(2) : "0.05";
  const suctionStallRisk = isPorpoisingZone ? "CRITICAL SUCTION STALL" : "STABLE GROUND EFFECT";

  // 60FPS Oscillation Wave Canvas
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
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(56,189,248, 0.1)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Sine Wave Oscillation
      ctx.strokeStyle = isPorpoisingZone ? "#ff0055" : "#34d399";
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const amplitude = isPorpoisingZone ? (parseFloat(driverVerticalG) * 35) : 4;
      const freq = isPorpoisingZone ? (parseFloat(porpoisingHz) * 0.05) : 0.02;

      for (let px = 0; px < w; px++) {
        const py = cy + Math.sin(px * freq - tick * 0.1) * amplitude;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [rideHeightMm, vehicleSpeed, heaveDamperStiffness, isPorpoisingZone, porpoisingHz, driverVerticalG]);

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow={isPorpoisingZone ? "pulse" : "cyan"}
        corners="reticle"
        header={{
          title: "GROUND EFFECT PORPOISING FREQUENCY & FLOOR SUCTION STALL LAB",
          subtitle: "High-speed aerodynamic venturi oscillation solver, floor flexure boundary conditions, and 3rd heave element tuning",
          icon: <Waves size={18} />,
          badge: <NeonHorizonBadge variant={isPorpoisingZone ? "coral" : "emerald"}>{suctionStallRisk}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="PORPOISING FREQ" value={`${porpoisingHz} Hz`} accentColor={isPorpoisingZone ? "coral" : "emerald"} />
          <NeonHorizonDataCard label="VERTICAL G-LOAD" value={`±${driverVerticalG} G`} accentColor={isPorpoisingZone ? "coral" : "cyan"} />
          <NeonHorizonDataCard label="STATIC RIDE HEIGHT" value={`${rideHeightMm} mm`} accentColor="gold" />
          <NeonHorizonDataCard label="HEAVE ELEMENT" value={`${heaveDamperStiffness}% STIFFNESS`} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Dynamic Oscillation Wave Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS VERTICAL HEAVE DISPLACEMENT OSCILLATION",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-[#05080f] rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className={`text-[10px] nh-font-mono font-bold ${isPorpoisingZone ? "text-rose-400" : "text-emerald-400"}`}>
                  {isPorpoisingZone ? "WARNING: RESONANT PORPOISING ACTIVE" : "AERO STABLE · CLEAN GROUND EFFECT"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a111e] border border-white/10 font-mono text-xs">
              <span className="text-amber-200/60">Venturi Throat Expansion:</span>
              <span className="text-sky-300 font-bold">1:4.8 Diffuser Aspect</span>
              <span className="text-amber-200/60">Floor Edge Skirt Vortex:</span>
              <span className="text-emerald-300 font-bold">SEALED (98%)</span>
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Aero Sliders (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "AERO & HEAVE DAMPER TUNING",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Underbody Floor Ride Height"
              value={rideHeightMm}
              min={15}
              max={65}
              step={1}
              unit=" mm"
              color={rideHeightMm < 30 ? "magenta" : "cyan"}
              onChange={(val) => setRideHeightMm(val)}
            />

            <NeonHorizonSlider
              label="Aerodynamic Velocity"
              value={vehicleSpeed}
              min={150}
              max={380}
              step={5}
              unit=" km/h"
              color="gold"
              onChange={(val) => setVehicleSpeed(val)}
            />

            <NeonHorizonSlider
              label="3rd Heave Element Stiffness"
              value={heaveDamperStiffness}
              min={20}
              max={100}
              step={5}
              unit="%"
              color="emerald"
              onChange={(val) => setHeaveDamperStiffness(val)}
            />
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
