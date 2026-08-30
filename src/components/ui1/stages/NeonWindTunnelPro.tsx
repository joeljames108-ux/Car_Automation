import React, { useState, useEffect, useRef } from "react";
import {
  Wind,
  Gauge,
  Sliders,
  Flame,
  ShieldAlert,
  Zap,
  Activity,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonToggle } from "../design/NeonHorizonToggle";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonWindTunnelPro() {
  const { sim } = useDesign();

  const [windSpeed, setWindSpeed] = useState(250); // km/h
  const [drsActive, setDrsActive] = useState(false);
  const [splitterAngle, setSplitterAngle] = useState(4); // degrees
  const [diffuserAngle, setDiffuserAngle] = useState(8); // degrees

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 60FPS Smoke Streamline Particle Simulation
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

    // Initialize 100 particles
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 2 + (windSpeed / 50),
        vy: 0,
        life: Math.random(),
        color: Math.random() > 0.3 ? "#8fb9d9" : "#ff0055",
      });
    }

    const render = () => {
      ctx.fillStyle = "rgba(3, 7, 18, 0.25)";
      ctx.fillRect(0, 0, w, h);

      // Draw stylized car silhouette wireframe in center
      const cx = w * 0.45;
      const cy = h * 0.55;

      ctx.strokeStyle = "rgba(56,189,248, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Nose
      ctx.moveTo(cx - 120, cy + 20);
      // Hood
      ctx.quadraticCurveTo(cx - 60, cy - 10, cx - 20, cy - 25);
      // Windshield
      ctx.quadraticCurveTo(cx, cy - 45, cx + 30, cy - 45);
      // Roof & Rear
      ctx.quadraticCurveTo(cx + 80, cy - 45, cx + 110, cy - 10);
      // Rear Wing
      ctx.lineTo(cx + 130, drsActive ? cy - 25 : cy - 38);
      ctx.stroke();

      // Update & draw smoke particles
      particles.forEach((p) => {
        p.vx = 3 + (windSpeed / 40);

        // Deflect around car body
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 90 && p.x < cx + 100) {
          p.vy -= 0.8;
        } else {
          p.vy *= 0.95; // damp
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x > w) {
          p.x = 0;
          p.y = 20 + Math.random() * (h - 40);
          p.vy = 0;
        }

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [windSpeed, drsActive]);

  const currentCd = drsActive ? 0.31 : 0.38;
  const currentDownforce = Math.round(480 * Math.pow(windSpeed / 250, 2) * (drsActive ? 0.65 : 1.0));

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "FULL-SCALE 60FPS AERODYNAMIC WIND TUNNEL & SMOKE PARTICLE LAB",
          subtitle: "Real-time laminar smoke streamlines, active DRS actuators, and ground effect venturi pressure map",
          icon: <Wind size={18} />,
          badge: <NeonHorizonBadge variant="live">TUNNEL TURBINE 100%</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="AIRSPEED" value={`${windSpeed} km/h`} accentColor="cyan" />
          <NeonHorizonDataCard label="DRAG COEFF (Cd)" value={currentCd.toFixed(2)} accentColor={drsActive ? "emerald" : "gold"} />
          <NeonHorizonDataCard label="NET DOWNFORCE" value={`${currentDownforce} kg`} accentColor="magenta" />
          <NeonHorizonDataCard label="DRS STATUS" value={drsActive ? "DEPLOYED" : "CLOSED"} accentColor={drsActive ? "emerald" : "cyan"} />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Wind Tunnel Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS LAMINAR SMOKE STREAMLINE VISUALIZATION",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-[#05080f] rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
                <span className="text-[10px] nh-font-mono font-bold text-sky-400">PARTICLE STREAMLINES · {windSpeed} KM/H AIRFLOW</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NeonHorizonButton
                variant={drsActive ? "primary" : "secondary"}
                glow={drsActive}
                size="sm"
                onClick={() => {
                  playSubsystemEngageSound();
                  setDrsActive(!drsActive);
                }}
              >
                <Zap size={14} className="mr-1" /> {drsActive ? "CLOSE DRS FLAP" : "DEPLOY DRS FLAP"}
              </NeonHorizonButton>

              <NeonHorizonButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  playTurboBoostSound();
                  setWindSpeed(350);
                }}
              >
                <Flame size={14} className="mr-1 text-amber-400" /> MAX SPEED RUN (350 KM/H)
              </NeonHorizonButton>
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Tuning Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "AERODYNAMIC TUNNEL CONTROLS",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Wind Tunnel Airspeed"
              value={windSpeed}
              min={50}
              max={400}
              step={10}
              unit=" km/h"
              color="cyan"
              onChange={(val) => setWindSpeed(val)}
            />

            <NeonHorizonSlider
              label="Front Splitter Angle of Attack"
              value={splitterAngle}
              min={0}
              max={12}
              step={1}
              unit="°"
              color="magenta"
              onChange={(val) => setSplitterAngle(val)}
            />

            <NeonHorizonSlider
              label="Underbody Diffuser Expansion Angle"
              value={diffuserAngle}
              min={4}
              max={16}
              step={1}
              unit="°"
              color="emerald"
              onChange={(val) => setDiffuserAngle(val)}
            />
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
