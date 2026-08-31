import React, { useState, useEffect, useRef } from "react";
import {
  CircleDot,
  Gauge,
  Sliders,
  Activity,
  Zap,
  Flame,
  Layers,
  Thermometer,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playHologramScanSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonTireDynamicsStudio() {
  const { sim } = useDesign();

  const [camber, setCamber] = useState(-3.2); // degrees
  const [pressure, setPressure] = useState(24.5); // psi hot
  const [compound, setCompound] = useState<"soft" | "medium" | "hard" | "wet">("soft");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pacejka Magic Formula MF5.2 Curve Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.strokeStyle = "rgba(56,189,248, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Pacejka MF5.2 Lateral Force Curve
    // Fy = D * sin(C * atan(B * alpha - E * (B * alpha - atan(B * alpha))))
    const D = compound === "soft" ? 1.65 : compound === "medium" ? 1.45 : compound === "hard" ? 1.3 : 1.15;
    const C = 1.35;
    const B = (10.5 + Math.abs(camber) * 0.8) / (pressure / 24);
    const E = -0.2;

    ctx.strokeStyle = "#8fb9d9";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const maxAlpha = 15; // 0 to 15 degrees slip
    for (let px = 0; px < w; px++) {
      const alpha = (px / w) * maxAlpha;
      const alphaRad = (alpha * Math.PI) / 180;
      const Ba = B * alphaRad;
      const FyNorm = D * Math.sin(C * Math.atan(Ba - E * (Ba - Math.atan(Ba))));

      const py = h - 20 - (FyNorm / 1.8) * (h - 40);

      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Optimal Grip Peak Marker
    const peakAlpha = 6.2;
    const peakPx = (peakAlpha / maxAlpha) * w;
    const peakPy = h - 20 - (D / 1.8) * (h - 40);

    ctx.fillStyle = "#ff0055";
    ctx.shadowColor = "#ff0055";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(peakPx, peakPy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ff0055";
    ctx.font = "9px monospace";
    ctx.fillText(`PEAK GRIP: ${D}G @ ${peakAlpha}° SLIP`, peakPx - 45, peakPy - 12);
  }, [camber, pressure, compound]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "PACEJKA '96 / MF5.2 MAGIC FORMULA TIRE DYNAMICS & CONTACT PATCH LAB",
          subtitle: "Non-linear lateral force vs slip angle curves, pneumatic trail relaxation length, and compound glass transition",
          icon: <CircleDot size={18} />,
          badge: <NeonHorizonBadge variant="live">PACEJKA SOLVER ACTIVE</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="PEAK LATERAL COEFF" value={compound === "soft" ? "1.65 µ" : compound === "medium" ? "1.45 µ" : "1.30 µ"} accentColor="cyan" />
          <NeonHorizonDataCard label="STATIC CAMBER" value={`${camber.toFixed(1)}°`} accentColor="magenta" />
          <NeonHorizonDataCard label="HOT PRESSURE" value={`${pressure.toFixed(1)} PSI`} accentColor="emerald" />
          <NeonHorizonDataCard label="OPTIMAL SLIP ANGLE" value="6.2° SLIP" accentColor="gold" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Curve Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "PACEJKA MF5.2 LATERAL FORCE (Fy) VS SLIP ANGLE (α)",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-amber-950/80 rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute bottom-2 right-3 flex items-center gap-2">
                <span className="text-[10px] nh-font-mono text-amber-400">SLIP ANGLE α (0° → 15°)</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "soft", name: "Soft Slick (C5)" },
                { id: "medium", name: "Medium (C3)" },
                { id: "hard", name: "Hard (C1)" },
                { id: "wet", name: "Full Wet" },
              ].map((c) => {
                const isSelected = compound === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setCompound(c.id as "soft" | "medium" | "hard" | "wet");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-amber-500/20 border-amber-500/30 text-sky-200"
 : "bg-amber-950/80 border-white/10 text-amber-300/60 hover:border-sky-400/25"
 }`}
                  >
                    {c.name}
                  </div>
                );
              })}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Kinematics Deck (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "TIRE PRESSURE & CAMBER KINEMATICS",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Front Static Camber Angle"
              value={camber}
              min={-5.0}
              max={-1.0}
              step={0.1}
              unit="°"
              color="magenta"
              onChange={(val) => setCamber(val)}
            />

            <NeonHorizonSlider
              label="Hot Inflation Pressure"
              value={pressure}
              min={18.0}
              max={32.0}
              step={0.5}
              unit=" PSI"
              color="cyan"
              onChange={(val) => setPressure(val)}
            />

            <div className="p-3.5 rounded-xl bg-amber-950/80 border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-300/60">Pneumatic Trail:</span>
                <span className="text-amber-300 font-bold">28.4 mm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-300/60">Contact Patch Area:</span>
                <span className="text-emerald-300 font-bold">185 cm² / wheel</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
