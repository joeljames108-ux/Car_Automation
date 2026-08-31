import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  Wind,
  Sliders,
  Activity,
  Zap,
  ShieldCheck,
  Layers,
  Thermometer,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonBlownWingStudio() {
  const { sim } = useDesign();

  const [exhaustBlowingVelocityMs, setExhaustBlowingVelocityMs] = useState(240); // m/s (100 - 450)
  const [coandaAngleDeg, setCoandaAngleDeg] = useState(22); // deg (5 - 35)
  const [blowingMode, setBlowingMode] = useState<"cold_blowing" | "hot_blown_mainplane" | "beam_wing_coanda" | "off_throttle_constant">("hot_blown_mainplane");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute Blown Aerodynamics
  const isHot = blowingMode === "hot_blown_mainplane" || blowingMode === "off_throttle_constant";
  const lowSpeedDownforceBoost = Math.round(14 + (exhaustBlowingVelocityMs / 450) * 18);
  const totalBlownDownforceN = Math.round(2400 + (exhaustBlowingVelocityMs / 450) * 2100 + (coandaAngleDeg / 35) * 800);
  const boundaryLayerAttachment = (84 + (exhaustBlowingVelocityMs / 450) * 15.5).toFixed(1);
  const wingUndersideTempC = isHot ? Math.round(380 + (exhaustBlowingVelocityMs / 450) * 320) : 65;

  // 60FPS Coandă Effect Exhaust Streamline Canvas
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

      // Rear Wing Curved Underside Profile (Coandă Curve)
      ctx.fillStyle = "rgba(56,189,248, 0.2)";
      ctx.strokeStyle = "#8fb9d9";
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(80, h * 0.35);
      ctx.bezierCurveTo(w * 0.45, h * 0.35, w * 0.75, h * 0.35 + (coandaAngleDeg / 35) * 60, w - 80, h * 0.4 + (coandaAngleDeg / 35) * 80);
      ctx.lineTo(w - 80, h * 0.4 + (coandaAngleDeg / 35) * 80 - 25);
      ctx.bezierCurveTo(w * 0.75, h * 0.35 + (coandaAngleDeg / 35) * 50 - 20, w * 0.45, h * 0.35 - 20, 80, h * 0.35 - 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Exhaust Nozzle Emitter
      ctx.fillStyle = isHot ? "#ff0055" : "#8fb9d9";
      ctx.fillRect(40, h * 0.36, 40, 16);

      // Hot Gas Streamlines Adhering via Coandă Effect
      ctx.lineWidth = 2;

      for (let i = 0; i < 5; i++) {
        const speed = (exhaustBlowingVelocityMs / 450) * 8 + 3;
        const offset = (tick * speed + i * 40) % (w - 120);
        const sx = 80 + offset;
        const ratio = Math.min(1, Math.max(0, offset / (w - 160)));

        const sy = h * 0.37 + (ratio * (coandaAngleDeg / 35) * 80) + (i * 4);

        ctx.fillStyle = isHot ? (i % 2 === 0 ? "#ff0055" : "#d9b36c") : "#8fb9d9";
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [exhaustBlowingVelocityMs, coandaAngleDeg, isHot]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow={isHot ? "pulse" : "cyan"}
        corners="reticle"
        header={{
          title: "BLOWN WING & COANDĂ EFFECT EXHAUST AERODYNAMICS LAB",
          subtitle: "High-velocity exhaust gas pulse energization of rear wing underside boundary layer, eliminating low-speed corner entry stall",
          icon: <Flame size={18} />,
          badge: <NeonHorizonBadge variant={isHot ? "coral" : "live"}>{isHot ? "HOT GAS BLOWING ACTIVE" : "COLD PNEUMATIC JET"}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="LOW-SPEED DOWNFORCE" value={`+${lowSpeedDownforceBoost}% GAIN`} accentColor="emerald" />
          <NeonHorizonDataCard label="TOTAL BLOWN DOWNFORCE" value={`${totalBlownDownforceN} N`} accentColor="cyan" />
          <NeonHorizonDataCard label="BOUNDARY LAYER LOCK" value={`${boundaryLayerAttachment}%`} accentColor="gold" />
          <NeonHorizonDataCard label="WING UNDERSIDE TEMP" value={`${wingUndersideTempC}°C`} accentColor={wingUndersideTempC > 500 ? "coral" : "magenta"} />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Coandă Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS COANDĂ FLUID WALL ATTACHMENT STREAMLINE FIELD",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-amber-950/80 rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className={`text-[10px] nh-font-mono font-bold ${isHot ? "text-amber-400" : "text-amber-300"}`}>
                  {isHot ? "HOT EXHAUST BLOWING: OFF-THROTTLE COMBUSTION CYCLES ENERGIZING AIRFOIL" : "COLD COMPRESSED AIR BLEED JET ACTIVE"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "hot_blown_mainplane", name: "Hot Mainplane" },
                { id: "beam_wing_coanda", name: "Beam Coandă" },
                { id: "off_throttle_constant", name: "Constant Blow" },
                { id: "cold_blowing", name: "Cold Pneumatic" },
              ].map((m) => {
                const isSelected = blowingMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setBlowingMode(m.id as "cold_blowing" | "hot_blown_mainplane" | "beam_wing_coanda" | "off_throttle_constant");
                      if (m.id === "hot_blown_mainplane") {
                        setExhaustBlowingVelocityMs(320);
                        setCoandaAngleDeg(25);
                      } else if (m.id === "beam_wing_coanda") {
                        setExhaustBlowingVelocityMs(280);
                        setCoandaAngleDeg(32);
                      } else if (m.id === "off_throttle_constant") {
                        setExhaustBlowingVelocityMs(410);
                        setCoandaAngleDeg(28);
                      } else if (m.id === "cold_blowing") {
                        setExhaustBlowingVelocityMs(160);
                        setCoandaAngleDeg(18);
                      }
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

        {/* Right Sliders (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "EXHAUST VELOCITY & COANDĂ ANGLE",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Exhaust Gas Blowing Velocity"
              value={exhaustBlowingVelocityMs}
              min={100}
              max={450}
              step={10}
              unit=" m/s"
              color={isHot ? "magenta" : "cyan"}
              onChange={(val) => setExhaustBlowingVelocityMs(val)}
            />

            <NeonHorizonSlider
              label="Coandă Deflection Curvature Angle"
              value={coandaAngleDeg}
              min={5}
              max={35}
              step={1}
              unit="°"
              color="gold"
              onChange={(val) => setCoandaAngleDeg(val)}
            />

            <div className="p-3.5 rounded-xl bg-amber-950/80 border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-300/60">Wing Heat Shielding:</span>
                <span className="text-emerald-300 font-bold">Gold Foil + Ceramic TBC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-300/60">Off-Throttle Strategy:</span>
                <span className="text-amber-400 font-bold">Retarded Spark Ignition</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
