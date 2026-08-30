import React, { useState, useEffect, useRef } from "react";
import {
  Wind,
  Sliders,
  Activity,
  Zap,
  ShieldCheck,
  Layers,
  ArrowUp,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonFenderLouverStudio() {
  const { sim } = useDesign();

  const [slatAngleDeg, setSlatAngleDeg] = useState(32); // deg (0-45)
  const [louverCount, setLouverCount] = useState(6); // slats (3-9)
  const [louverMode, setLouverMode] = useState<"track_downforce" | "brake_cooling_max" | "low_drag_high_speed" | "sealed">("track_downforce");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute Aerodynamics
  const isClosed = louverMode === "sealed";
  const frontLiftReduction = isClosed ? "0.00" : (-0.04 - (slatAngleDeg / 45) * 0.07).toFixed(3);
  const brakeCoolingBoost = isClosed ? 0 : Math.round(10 + (slatAngleDeg / 45) * 25);
  const wheelArchPressurePa = isClosed ? 340 : Math.round(340 - (slatAngleDeg / 45) * 420);
  const frontDownforceGainN = isClosed ? 0 : Math.round((slatAngleDeg / 45) * 780);

  // 60FPS Louver Evacuation Streamline Canvas
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

      // Wheel Arch Curve
      ctx.strokeStyle = "rgba(56,189,248, 0.4)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(w * 0.4, h * 0.75, 70, Math.PI, 0, false);
      ctx.stroke();

      // Tire Outline
      ctx.fillStyle = "#0a111e";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w * 0.4, h * 0.75, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Top Fender Louver Slats
      if (!isClosed) {
        ctx.strokeStyle = "#d9b36c";
        ctx.lineWidth = 2.5;

        for (let i = 0; i < louverCount; i++) {
          const lx = w * 0.3 + i * 14;
          const ly = h * 0.28;
          const rad = (slatAngleDeg * Math.PI) / 180;

          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx + Math.cos(rad) * 12, ly - Math.sin(rad) * 12);
          ctx.stroke();
        }

        // Upward Evacuating Streamlines
        ctx.strokeStyle = "rgba(56,189,248, 0.8)";
        ctx.lineWidth = 1.5;

        for (let i = 0; i < 4; i++) {
          const offset = (tick * 4 + i * 35) % (h * 0.5);
          const sx = w * 0.32 + i * 14;
          const sy = h * 0.6 - offset;

          ctx.fillStyle = "#8fb9d9";
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [slatAngleDeg, louverCount, isClosed]);

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow={isClosed ? "gold" : "cyan"}
        corners="reticle"
        header={{
          title: "FRONT WHEEL ARCH HIGH-PRESSURE LOUVER & FENDER VENTING LAB",
          subtitle: "Motorized 0° to 45° louver slats extracting high-pressure air trapped in front wheel arches to eliminate aerodynamic front lift",
          icon: <Wind size={18} />,
          badge: <NeonHorizonBadge variant={isClosed ? "gold" : "live"}>{isClosed ? "LOUVERS FLUSH SEALED" : "ACTIVE LOUVER EVACUATION"}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="FRONT LIFT REDUCTION" value={`${frontLiftReduction} CL`} accentColor="emerald" />
          <NeonHorizonDataCard label="BRAKE THERMAL AIRFLOW" value={`+${brakeCoolingBoost}%`} accentColor="cyan" />
          <NeonHorizonDataCard label="WHEEL WELL PRESSURE" value={`${wheelArchPressurePa} Pa`} accentColor={wheelArchPressurePa > 200 ? "coral" : "gold"} />
          <NeonHorizonDataCard label="DOWNFORCE GAIN" value={`+${frontDownforceGainN} N`} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Louver Evacuation Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS WHEEL ARCH WAKE TURBULENCE & UPWARD EVACUATION",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-[#05080f] rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className="text-[10px] nh-font-mono font-bold text-sky-300">
                  {isClosed ? "SEALED FENDER: WHEEL ARCH TRAPPED PRESSURE SPIKE" : "ACTIVE LOUVERS: HIGH-SPEED EVACUATION ATTACHED"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "track_downforce", name: "Max Downforce" },
                { id: "brake_cooling_max", name: "Brake Cooling" },
                { id: "low_drag_high_speed", name: "High Speed GT" },
                { id: "sealed", name: "Flush Sealed" },
              ].map((m) => {
                const isSelected = louverMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setLouverMode(m.id as "track_downforce" | "brake_cooling_max" | "low_drag_high_speed" | "sealed");
                      if (m.id === "track_downforce") setSlatAngleDeg(42);
                      else if (m.id === "brake_cooling_max") setSlatAngleDeg(35);
                      else if (m.id === "low_drag_high_speed") setSlatAngleDeg(15);
                      else if (m.id === "sealed") setSlatAngleDeg(0);
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-sky-400/10 border-sky-400/30 text-sky-200"
 : "bg-[#0a111e] border-white/10 text-amber-200/60 hover:border-sky-400/25"
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
              title: "LOUVER SLAT ANGLE & BLADE DENSITY",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Fender Louver Slat Angle"
              value={slatAngleDeg}
              min={0}
              max={45}
              step={1}
              unit="°"
              color="cyan"
              onChange={(val) => setSlatAngleDeg(val)}
            />

            <NeonHorizonSlider
              label="Blade Count per Fender"
              value={louverCount}
              min={3}
              max={9}
              step={1}
              unit=" blades"
              color="gold"
              onChange={(val) => setLouverCount(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-200/60">Actuator Type:</span>
                <span className="text-sky-300 font-bold">12V High-Torque Micro Servo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-200/60">Slat Metallurgy:</span>
                <span className="text-emerald-300 font-bold">Prepreg T800 Carbon Fiber</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
