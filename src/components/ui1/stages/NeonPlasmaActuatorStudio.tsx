import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  Sliders,
  Activity,
  ShieldCheck,
  Layers,
  Sparkles,
  Wind,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playHologramScanSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonPlasmaActuatorStudio() {
  const { sim } = useDesign();

  const [plasmaVoltageKv, setPlasmaVoltageKv] = useState(12.5); // kV AC
  const [pulseFreqKhz, setPulseFreqKhz] = useState(25); // kHz
  const [actuatorState, setActuatorState] = useState<"active_corona" | "burst_pulsed" | "continuous_jet" | "standby">("active_corona");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute Plasma Aerodynamics
  const inducedVelocity = (plasmaVoltageKv * 0.8 + (pulseFreqKhz / 50) * 2.5).toFixed(1); // m/s
  const stallDelay = (2.0 + (plasmaVoltageKv / 15) * 4.5).toFixed(1); // degrees AoA
  const skinFrictionReduction = Math.round((plasmaVoltageKv / 15) * 18); // %

  // 60FPS Plasma Glow & Ionization Canvas
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

      // Electrode Dielectric Surface
      ctx.fillStyle = "#0a111e";
      ctx.fillRect(40, h * 0.6, w - 80, 20);

      ctx.strokeStyle = "rgba(56,189,248, 0.4)";
      ctx.strokeRect(40, h * 0.6, w - 80, 20);

      // Top Exposed Electrode (Gold)
      ctx.fillStyle = "#d9b36c";
      ctx.fillRect(80, h * 0.58, 60, 4);

      // Plasma Corona Ionization Glow (Cyan / Purple)
      const glowAlpha = Math.min(1.0, 0.3 + (plasmaVoltageKv / 15) * 0.7);
      const grad = ctx.createLinearGradient(140, h * 0.58, 280, h * 0.58);
      grad.addColorStop(0, `rgba(56,189,248, ${glowAlpha})`);
      grad.addColorStop(0.5, `rgba(168, 85, 247, ${glowAlpha * 0.8})`);
      grad.addColorStop(1, "rgba(56,189,248, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(140, h * 0.58);
      ctx.lineTo(280 + Math.sin(tick * 0.2) * 15, h * 0.58);
      ctx.lineTo(240, h * 0.52 - (plasmaVoltageKv / 15) * 15);
      ctx.closePath();
      ctx.fill();

      // Induced Wall Jet Streamlines
      ctx.strokeStyle = "rgba(56,189,248, 0.7)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const offset = (tick * 5 + i * 50) % (w - 180);
        const sx = 140 + offset;
        const sy = h * 0.54 - i * 8;

        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#8fb9d9";
        ctx.fill();
      }

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [plasmaVoltageKv, pulseFreqKhz]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "DIELECTRIC BARRIER DISCHARGE (DBD) PLASMA ACTUATOR LAB",
          subtitle: "Zero-moving-parts 15 kV nanosecond electro-hydrodynamic boundary layer reattachment & skin friction drag mitigation",
          icon: <Zap size={18} />,
          badge: <NeonHorizonBadge variant="live">DBD PLASMA IONIZATION · {actuatorState.toUpperCase().replace(/_/g, " ")}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="INDUCED WALL JET" value={`${inducedVelocity} m/s`} accentColor="cyan" />
          <NeonHorizonDataCard label="STALL DELAY ANGLE" value={`+${stallDelay}° AoA`} accentColor="emerald" />
          <NeonHorizonDataCard label="SKIN FRICTION REDUCTION" value={`-${skinFrictionReduction}%`} accentColor="magenta" />
          <NeonHorizonDataCard label="CORONA VOLTAGE" value={`${plasmaVoltageKv.toFixed(1)} kV AC`} accentColor="gold" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Plasma Ionization Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS HIGH-VOLTAGE CORONA IONIZATION & WALL JET",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-slate-900/80 rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className="text-[10px] nh-font-mono font-bold text-amber-300">
                  DBD ACTIVE: ZERO-DRAG ELECTRO-HYDRODYNAMIC PROPULSION
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "active_corona", name: "Corona Glow" },
                { id: "burst_pulsed", name: "Pulsed Burst" },
                { id: "continuous_jet", name: "Wall Jet" },
                { id: "standby", name: "Standby" },
              ].map((m) => {
                const isSelected = actuatorState === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playHologramScanSound();
                      setActuatorState(m.id as "active_corona" | "burst_pulsed" | "continuous_jet" | "standby");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-amber-500/20 border-amber-500/30 text-sky-200"
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

        {/* Right Plasma High-Voltage Sliders (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "PLASMA VOLTAGE & FREQUENCY TUNING",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Peak AC Ionization Voltage"
              value={plasmaVoltageKv}
              min={5.0}
              max={15.0}
              step={0.5}
              unit=" kV"
              color="cyan"
              onChange={(val) => setPlasmaVoltageKv(val)}
            />

            <NeonHorizonSlider
              label="Nanosecond Pulse Frequency"
              value={pulseFreqKhz}
              min={10}
              max={50}
              step={2}
              unit=" kHz"
              color="magenta"
              onChange={(val) => setPulseFreqKhz(val)}
            />

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Power Consumption:</span>
                <span className="text-amber-300 font-bold">120 W / strip (Ultra Efficient)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Electrode Material:</span>
                <span className="text-amber-300 font-bold">Kapton Dielectric + Copper Foil</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
