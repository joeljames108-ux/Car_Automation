import React, { useState, useEffect, useRef } from "react";
import {
  Wind,
  Sliders,
  Activity,
  Zap,
  ShieldCheck,
  Layers,
  ArrowDown,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonDiffuserStudio() {
  const { sim } = useDesign();

  const [flapAngle, setFlapAngle] = useState(14.5); // degrees expansion (0-22)
  const [blowingFlowRate, setBlowingFlowRate] = useState(80); // % micro-jet blowing
  const [aeroConfig, setAeroConfig] = useState<"max_expansion" | "drag_reduction_drs" | "stall_prevention" | "wet_wake">("max_expansion");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute Aero Forces
  const isSeparating = flapAngle > 18 && blowingFlowRate < 50;
  const downforceN = isSeparating ? Math.round(4200 * (1 - (flapAngle - 18) * 0.1)) : Math.round(3200 + flapAngle * 140 + blowingFlowRate * 12);
  const diffuserCd = (0.045 + (flapAngle / 22) * 0.035).toFixed(3);

  // 60FPS Streamline Diffuser Canvas
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

      // Floor & Diffuser Geometry
      ctx.strokeStyle = "rgba(56,189,248, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, h * 0.7);
      ctx.lineTo(w * 0.45, h * 0.7); // flat floor

      // Diffuser Ramp Angle
      const rampEndY = h * 0.7 - (flapAngle / 22) * (h * 0.45);
      ctx.lineTo(w - 40, rampEndY);
      ctx.stroke();

      // Streamlines
      ctx.strokeStyle = isSeparating ? "rgba(255, 0, 85, 0.6)" : "rgba(56,189,248, 0.6)";
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 6; i++) {
        const offset = (tick * 4 + i * 40) % (w - 70);
        const startX = 30 + offset;
        let startY = h * 0.73 + i * 6;

        if (startX > w * 0.45) {
          const ratio = (startX - w * 0.45) / (w - 40 - w * 0.45);
          startY = (h * 0.7 + i * 6) - ratio * ((flapAngle / 22) * (h * 0.45));
        }

        ctx.fillStyle = isSeparating ? "#ff0055" : "#8fb9d9";
        ctx.beginPath();
        ctx.arc(startX, startY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [flapAngle, blowingFlowRate, isSeparating]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow={isSeparating ? "pulse" : "cyan"}
        corners="reticle"
        header={{
          title: "ACTIVE REAR DIFFUSER FLAP & BOUNDARY LAYER BLOWING LAB",
          subtitle: "Motorized 0° to 22° diffuser expansion geometry, micro-jet wake blowing, and boundary layer separation prevention",
          icon: <Wind size={18} />,
          badge: <NeonHorizonBadge variant={isSeparating ? "coral" : "live"}>{isSeparating ? "BOUNDARY SEPARATION WARNING" : "ATTACHED FLOW (OPTIMAL)"}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="DIFFUSER DOWNFORCE" value={`${downforceN} N`} accentColor={isSeparating ? "coral" : "emerald"} />
          <NeonHorizonDataCard label="EXPANSION FLAP" value={`${flapAngle.toFixed(1)}°`} accentColor="cyan" />
          <NeonHorizonDataCard label="BLOWING JET AIRFLOW" value={`${blowingFlowRate}% ACTIVE`} accentColor="gold" />
          <NeonHorizonDataCard label="DIFFUSER INDUCED Cd" value={`+${diffuserCd} Cd`} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Diffuser Streamline Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS UNDERBODY VENTURI STREAMLINE VELOCITY FIELD",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-[#05080f] rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className={`text-[10px] nh-font-mono font-bold ${isSeparating ? "text-rose-400" : "text-emerald-400"}`}>
                  {isSeparating ? "STALL ALERT: BOUNDARY LAYER SEPARATION" : "ACTIVE BLOWING: ATTACHED GROUND SUCTION"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "max_expansion", name: "Max Suction" },
                { id: "drag_reduction_drs", name: "DRS Low-Drag" },
                { id: "stall_prevention", name: "Stall Assist" },
                { id: "wet_wake", name: "Wet Spray Wake" },
              ].map((m) => {
                const isSelected = aeroConfig === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setAeroConfig(m.id as "max_expansion" | "drag_reduction_drs" | "stall_prevention" | "wet_wake");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-sky-400/10 border-sky-400/30 text-sky-200"
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
              title: "DIFFUSER FLAP & MICRO-JET TUNING",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Rear Diffuser Expansion Flap Angle"
              value={flapAngle}
              min={0}
              max={22}
              step={0.5}
              unit="°"
              color="cyan"
              onChange={(val) => setFlapAngle(val)}
            />

            <NeonHorizonSlider
              label="Boundary Layer Blowing Jet Pressure"
              value={blowingFlowRate}
              min={0}
              max={100}
              step={5}
              unit="%"
              color="gold"
              onChange={(val) => setBlowingFlowRate(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Actuator Response:</span>
                <span className="text-sky-300 font-bold">18 ms Brushless Stepper</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Diffuser Strakes:</span>
                <span className="text-emerald-300 font-bold">4x Vortex Shedding Fences</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
