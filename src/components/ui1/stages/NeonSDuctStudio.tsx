import React, { useState, useEffect, useRef } from "react";
import {
  Wind,
  Sliders,
  Activity,
  Zap,
  ShieldCheck,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonSDuctStudio() {
  const { sim } = useDesign();

  const [ductWidthMm, setDuctWidthMm] = useState(380); // mm (200-500)
  const [chimneyAngleDeg, setChimneyAngleDeg] = useState(28); // deg (15-45)
  const [ductMode, setDuctMode] = useState<"high_downforce" | "low_drag" | "cooling_boost" | "sealed">("high_downforce");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute S-Duct Aerodynamics
  const isSealed = ductMode === "sealed";
  const frontDownforceN = isSealed ? 450 : Math.round(950 + (ductWidthMm / 500) * 850 + (chimneyAngleDeg / 45) * 420);
  const deltaClf = isSealed ? "0.00" : (-0.08 - (ductWidthMm / 500) * 0.06).toFixed(3);
  const internalAirspeedKmh = isSealed ? 0 : Math.round(180 + (chimneyAngleDeg / 45) * 120);

  // 60FPS S-Duct Streamline Internal Canvas
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

      // Nosecone Profile
      ctx.strokeStyle = "rgba(56,189,248, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, h * 0.7);
      ctx.quadraticCurveTo(w * 0.35, h * 0.7, w * 0.45, h * 0.4); // S-curve ramp
      ctx.lineTo(w - 40, h * 0.35);
      ctx.stroke();

      // S-Duct Internal Flow Streamlines
      if (!isSealed) {
        ctx.strokeStyle = "rgba(56,189,248, 0.7)";
        ctx.lineWidth = 2;

        for (let i = 0; i < 5; i++) {
          const offset = (tick * 4 + i * 35) % (w - 120);
          const sx = 30 + offset;

          let sy = h * 0.7 - i * 6;
          if (sx > w * 0.25) {
            const ratio = (sx - w * 0.25) / (w * 0.45 - w * 0.25);
            sy = h * 0.7 - ratio * (h * 0.32) - i * 6;
          }

          ctx.beginPath();
          ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = "#8fb9d9";
          ctx.fill();
        }
      }

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [ductWidthMm, chimneyAngleDeg, isSealed]);

  return (
    <div className="w-full flex flex-col gap-6 text-amber-50 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow={isSealed ? "gold" : "cyan"}
        corners="reticle"
        header={{
          title: "FRONT NOSECONE ACTIVE S-DUCT & VORTEX CHIMNEY LAB",
          subtitle: "Under-nose high-pressure intake bleed routing through hood S-Duct outlet to neutralize front axle aerodynamic lift",
          icon: <Wind size={18} />,
          badge: <NeonHorizonBadge variant={isSealed ? "gold" : "live"}>{isSealed ? "S-DUCT SEALED" : "S-DUCT INTERNAL CHIMNEY ACTIVE"}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="FRONT AXLE DOWNFORCE" value={`${frontDownforceN} N`} accentColor="emerald" />
          <NeonHorizonDataCard label="DELTA CL (FRONT)" value={`${deltaClf} CL`} accentColor="cyan" />
          <NeonHorizonDataCard label="DUCT AIR VELOCITY" value={`${internalAirspeedKmh} km/h`} accentColor="gold" />
          <NeonHorizonDataCard label="CHIMNEY ANGLE" value={`${chimneyAngleDeg}° HOOD EXIT`} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left S-Duct Flow Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS NOSECONE TO HOOD S-DUCT INTERNAL VELOCITY VECTORS",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-[#05080f] rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className="text-[10px] nh-font-mono font-bold text-sky-300">
                  {isSealed ? "PASSIVE NOSE: HIGH FRONT-AXLE LIFT DETECTED" : "ACTIVE S-DUCT: FRONT DOWNFORCE STABILIZED"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "high_downforce", name: "High Downforce" },
                { id: "low_drag", name: "Low Drag" },
                { id: "cooling_boost", name: "Cooling Bias" },
                { id: "sealed", name: "Sealed Nose" },
              ].map((m) => {
                const isSelected = ductMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setDuctMode(m.id as "high_downforce" | "low_drag" | "cooling_boost" | "sealed");
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

        {/* Right S-Duct Sliders (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "S-DUCT GEOMETRY & APERTURE CONTROLS",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Nosecone Intake Channel Width"
              value={ductWidthMm}
              min={200}
              max={500}
              step={10}
              unit=" mm"
              color="cyan"
              onChange={(val) => setDuctWidthMm(val)}
            />

            <NeonHorizonSlider
              label="Top Hood Exit Chimney Angle"
              value={chimneyAngleDeg}
              min={15}
              max={45}
              step={1}
              unit="°"
              color="magenta"
              onChange={(val) => setChimneyAngleDeg(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-200/60">Boundary Layer Bleed:</span>
                <span className="text-emerald-300 font-bold">NACA Lower Inlet Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-200/60">Hood Vortex Core:</span>
                <span className="text-sky-300 font-bold">Helical Flow Coherent</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
