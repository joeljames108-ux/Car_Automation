import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  RotateCw,
  Sliders,
  Activity,
  Zap,
  Layers,
  Sparkles,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playHologramScanSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonFourWheelSteerStudio() {
  const { sim } = useDesign();

  const [steerAngle, setSteerAngle] = useState(2.8); // deg rear
  const [vehicleSpeed, setVehicleSpeed] = useState(60); // km/h
  const [steeringMode, setSteeringMode] = useState<"track_agile" | "autobahn_stability" | "city_park" | "drift_counter">("track_agile");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // In-phase vs Counter-phase logic
  const isCounterPhase = vehicleSpeed < 70;
  const turningRadius = (11.8 - (steerAngle / 5.0) * 2.4).toFixed(1);
  const yawRate = (14.2 + (steerAngle / 5.0) * 6.5).toFixed(1);

  // 60FPS Yaw Angle Canvas
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
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Chassis Outline
      ctx.strokeStyle = "rgba(56,189,248, 0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 30, cy - 60, 60, 120);

      // Front Wheels (Fixed Front Steering)
      const frontAngleRad = (15 * Math.PI) / 180;
      ctx.fillStyle = "#8fb9d9";

      // FL
      ctx.save();
      ctx.translate(cx - 36, cy - 45);
      ctx.rotate(frontAngleRad);
      ctx.fillRect(-6, -14, 12, 28);
      ctx.restore();

      // FR
      ctx.save();
      ctx.translate(cx + 36, cy - 45);
      ctx.rotate(frontAngleRad);
      ctx.fillRect(-6, -14, 12, 28);
      ctx.restore();

      // Rear Wheels (Active 4WS Angle)
      const rearAngleRad = ((isCounterPhase ? -steerAngle : steerAngle) * Math.PI) / 180;
      ctx.fillStyle = "#ff0055";

      // RL
      ctx.save();
      ctx.translate(cx - 36, cy + 45);
      ctx.rotate(rearAngleRad);
      ctx.fillRect(-6, -14, 12, 28);
      ctx.restore();

      // RR
      ctx.save();
      ctx.translate(cx + 36, cy + 45);
      ctx.rotate(rearAngleRad);
      ctx.fillRect(-6, -14, 12, 28);
      ctx.restore();

      // Yaw Vector Arc
      ctx.strokeStyle = isCounterPhase ? "#34d399" : "#8fb9d9";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, 75, -Math.PI / 2, -Math.PI / 2 + (isCounterPhase ? -0.4 : 0.4));
      ctx.stroke();
      ctx.setLineDash([]);

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [steerAngle, vehicleSpeed, isCounterPhase]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "ACTIVE FOUR-WHEEL STEERING (4WS) & YAW AGILITY LAB",
          subtitle: "Counter-phase low-speed agility, in-phase high-speed autobahn stabilization, and virtual wheelbase synthesis",
          icon: <Compass size={18} />,
          badge: <NeonHorizonBadge variant="live">{isCounterPhase ? "COUNTER-PHASE (AGILITY)" : "IN-PHASE (STABILITY)"}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="TURNING CIRCLE" value={`${turningRadius} m (-20%)`} accentColor="emerald" />
          <NeonHorizonDataCard label="PEAK YAW RATE" value={`${yawRate} deg/s`} accentColor="cyan" />
          <NeonHorizonDataCard label="REAR STEER ANGLE" value={`±${steerAngle.toFixed(1)}°`} accentColor="magenta" />
          <NeonHorizonDataCard label="VIRTUAL WHEELBASE" value={isCounterPhase ? "2,420 mm (-12%)" : "2,980 mm (+10%)"} accentColor="gold" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4WS Kinematics Visualizer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "4-WHEEL STEERING ANGLE KINEMATICS",
              icon: <RotateCw size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-amber-950/80 rounded-xl border border-sky-400/25 overflow-hidden relative flex items-center justify-center shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={400} height={210} />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className="text-[10px] nh-font-mono text-amber-400">FRONT: +15.0° (CYAN)</span>
                <span className="text-[10px] nh-font-mono text-rose-400">
                  REAR: {isCounterPhase ? "-" : "+"}{steerAngle.toFixed(1)}° (MAGENTA)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "track_agile", name: "Track Apex" },
                { id: "autobahn_stability", name: "Autobahn GT" },
                { id: "city_park", name: "City Parking" },
                { id: "drift_counter", name: "Drift Assist" },
              ].map((m) => {
                const isSelected = steeringMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setSteeringMode(m.id as "track_agile" | "autobahn_stability" | "city_park" | "drift_counter");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-amber-500/20 border-amber-500/30 text-sky-200"
 : "bg-amber-950/80 border-white/10 text-amber-300/60 hover:border-sky-400/25"
 }`}
                  >
                    {m.name}
                  </div>
                );
              })}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Sliders Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "VELOCITY & REAR STEER SETTINGS",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Vehicle Dynamic Speed"
              value={vehicleSpeed}
              min={10}
              max={250}
              step={5}
              unit=" km/h"
              color="cyan"
              onChange={(val) => setVehicleSpeed(val)}
            />

            <NeonHorizonSlider
              label="Max Rear Steer Amplitude"
              value={steerAngle}
              min={1.0}
              max={5.0}
              step={0.1}
              unit="°"
              color="magenta"
              onChange={(val) => setSteerAngle(val)}
            />

            <div className="p-3.5 rounded-xl bg-amber-950/80 border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-300/60">Phase Crossover Speed:</span>
                <span className="text-amber-300 font-bold">70 km/h Threshold</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-300/60">Rear Actuator Latency:</span>
                <span className="text-emerald-300 font-bold">12 ms Brushless</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
