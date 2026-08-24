import React, { useState, useEffect, useRef } from "react";
import {
  Navigation,
  Eye,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  Sliders,
  Target,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playHologramScanSound, playSubsystemEngageSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonAutonomousStudio() {
  const { sim } = useDesign();

  const [targetSpeed, setTargetSpeed] = useState(120); // km/h
  const [autonomyLevel, setAutonomyLevel] = useState<"L2" | "L3" | "L4" | "L5">("L4");
  const [aebArmed, setAebArmed] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 60FPS Autonomous Sensor Fusion Canvas
  useEffect(() => {
    let animId: number;
    let offset = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;

      ctx.fillStyle = "rgba(3, 7, 18, 0.3)";
      ctx.fillRect(0, 0, w, h);

      // Perspective Road Grid
      ctx.strokeStyle = "rgba(56,189,248, 0.2)";
      ctx.lineWidth = 1.5;

      // Left Lane
      ctx.beginPath();
      ctx.moveTo(cx - 30, h * 0.3);
      ctx.lineTo(cx - 160, h);
      ctx.stroke();

      // Right Lane
      ctx.beginPath();
      ctx.moveTo(cx + 30, h * 0.3);
      ctx.lineTo(cx + 160, h);
      ctx.stroke();

      // Center Dashes
      ctx.setLineDash([12, 16]);
      ctx.lineDashOffset = -offset;
      ctx.beginPath();
      ctx.moveTo(cx, h * 0.3);
      ctx.lineTo(cx, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Autonomous Trajectory Spline (Emerald)
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, h * 0.85);
      ctx.quadraticCurveTo(cx + Math.sin(offset * 0.05) * 20, h * 0.55, cx + Math.sin(offset * 0.03) * 15, h * 0.35);
      ctx.stroke();

      // Ahead Obstacle Bounding Box (Magenta)
      const obsY = h * 0.42;
      const obsX = cx + Math.sin(offset * 0.02) * 25;
      ctx.strokeStyle = "#ff0055";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(obsX - 18, obsY - 12, 36, 24);

      ctx.fillStyle = "rgba(255, 0, 85, 0.2)";
      ctx.fillRect(obsX - 18, obsY - 12, 36, 24);

      ctx.fillStyle = "#ff0055";
      ctx.font = "8px monospace";
      ctx.fillText("TARGET: 42.4m", obsX - 22, obsY - 16);

      offset += targetSpeed * 0.04;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [targetSpeed]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "AUTONOMOUS DRIVING SENSOR FUSION & NEURAL PATH PLANNING",
          subtitle: "60FPS LiDAR / Radar / Camera fusion stream, vector trajectory planning, and active emergency intervention",
          icon: <Navigation size={18} />,
          badge: <NeonHorizonBadge variant="live">APEX NEURAL PILOT · {autonomyLevel}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="AUTONOMY LEVEL" value={autonomyLevel} accentColor="cyan" />
          <NeonHorizonDataCard label="NEURAL INFERENCE" value="4.2 ms (240 FPS)" accentColor="emerald" />
          <NeonHorizonDataCard label="AEB INTERVENTION" value={aebArmed ? "ARMED (300m)" : "MANUAL OVERRIDE"} accentColor={aebArmed ? "emerald" : "coral"} />
          <NeonHorizonDataCard label="SENSOR COVERAGE" value="360° LiDAR + 4D RADAR" accentColor="gold" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sensor Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "NEURAL PERCEPTION & VECTOR PATH PLANNING",
              icon: <Eye size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-[#05080f] rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] nh-font-mono font-bold text-emerald-400">PATH PLANNING · ACTIVE LANE TRACKING</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(["L2", "L3", "L4", "L5"] as const).map((lvl) => {
                const isSelected = autonomyLevel === lvl;
                return (
                  <div
                    key={lvl}
                    onClick={() => {
                      playHologramScanSound();
                      setAutonomyLevel(lvl);
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-sky-400/10 border-sky-400/30 text-sky-200"
 : "bg-[#0a111e] border-white/10 text-slate-400 hover:border-sky-400/25"
 }`}
                  >
                    Level {lvl.replace("L", "")}
                  </div>
                );
              })}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right ADAS Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "AUTOPILOT TRAJECTORY SETTINGS",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Cruising Velocity Target"
              value={targetSpeed}
              min={30}
              max={220}
              step={5}
              unit=" km/h"
              color="cyan"
              onChange={(val) => setTargetSpeed(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Front LiDAR Range:</span>
                <span className="text-sky-300 font-bold">300 meters</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Triple Camera FOV:</span>
                <span className="text-emerald-300 font-bold">120° Panoramic</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">4D Radar Elevation:</span>
                <span className="text-amber-300 font-bold">±15° Doppler</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
