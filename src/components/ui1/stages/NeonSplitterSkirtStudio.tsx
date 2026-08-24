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

export function NeonSplitterSkirtStudio() {
  const { sim } = useDesign();

  const [skirtGapMm, setSkirtGapMm] = useState(8.5); // mm (3.0 - 25.0)
  const [splitterExtensionMm, setSplitterExtensionMm] = useState(65); // mm (20 - 100)
  const [skirtMaterial, setSkirtMaterial] = useState<"kevlar_elastomer" | "brush_seal" | "sliding_skid_titanium" | "rigid_carbon">("kevlar_elastomer");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute Ground Effect Aerodynamics
  const isRubbing = skirtGapMm < 4.0;
  const sealEfficiency = (100 - (skirtGapMm / 25.0) * 18).toFixed(1);
  const underbodySuctionPa = Math.round(-2400 - (1 - skirtGapMm / 25.0) * 2600 + (splitterExtensionMm / 100) * 800);
  const totalDownforceN = Math.round(3800 + (1 - skirtGapMm / 25.0) * 3200 + (splitterExtensionMm / 100) * 1100);

  // 60FPS Ground Clearance & Underbody Suction Canvas
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

      // Track Asphalt Ground Line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(20, h * 0.85);
      ctx.lineTo(w - 20, h * 0.85);
      ctx.stroke();

      // Front Splitter Profile
      const splitterY = h * 0.85 - (skirtGapMm / 25.0) * (h * 0.45);

      ctx.fillStyle = isRubbing ? "rgba(255, 0, 85, 0.4)" : "rgba(56,189,248, 0.3)";
      ctx.strokeStyle = isRubbing ? "#ff0055" : "#8fb9d9";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(40, splitterY - 20);
      ctx.lineTo(40 + (splitterExtensionMm / 100) * 80, splitterY - 20);
      ctx.lineTo(40 + (splitterExtensionMm / 100) * 80, splitterY);
      ctx.lineTo(40, splitterY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ground Effect Suction Field (Gradient)
      const grad = ctx.createLinearGradient(0, splitterY, 0, h * 0.85);
      grad.addColorStop(0, "rgba(56,189,248, 0.6)");
      grad.addColorStop(1, "rgba(168, 85, 247, 0.1)");

      ctx.fillStyle = grad;
      ctx.fillRect(40, splitterY, w - 80, h * 0.85 - splitterY);

      // Streamlines
      ctx.strokeStyle = "rgba(56,189,248, 0.9)";
      ctx.lineWidth = 1.5;

      for (let i = 0; i < 5; i++) {
        const offset = (tick * 5 + i * 45) % (w - 80);
        const sx = 40 + offset;
        const sy = splitterY + ((h * 0.85 - splitterY) * ((i + 1) / 6));

        ctx.fillStyle = isRubbing ? "#ff0055" : "#8fb9d9";
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      tick++;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [skirtGapMm, splitterExtensionMm, isRubbing]);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow={isRubbing ? "pulse" : "cyan"}
        corners="reticle"
        header={{
          title: "ACTIVE FRONT SPLITTER & UNDERBODY FLEXIBLE SKIRT LAB",
          subtitle: "Dynamic 5mm ground clearance floor sealing strakes, extreme underbody venturi suction, and floor vortex containment",
          icon: <Wind size={18} />,
          badge: <NeonHorizonBadge variant={isRubbing ? "coral" : "live"}>{isRubbing ? "GROUND PLANK RUBBING WARNING" : "OPTIMAL GROUND SEAL ACTIVE"}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="TOTAL UNDERBODY DOWNFORCE" value={`${totalDownforceN} N`} accentColor={isRubbing ? "coral" : "emerald"} />
          <NeonHorizonDataCard label="VENTURI SUCTION PRESSURE" value={`${underbodySuctionPa} Pa`} accentColor="cyan" />
          <NeonHorizonDataCard label="SEAL EFFICIENCY" value={`${sealEfficiency}%`} accentColor="gold" />
          <NeonHorizonDataCard label="GROUND GAP" value={`${skirtGapMm.toFixed(1)} mm`} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Ground Clearance Canvas (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "60FPS ASYMMETRIC GROUND EFFECT SUCTION FIELD",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-[#05080f] rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <span className={`text-[10px] nh-font-mono font-bold ${isRubbing ? "text-rose-400" : "text-emerald-400"}`}>
                  {isRubbing ? "ALERT: PLANK ABRASION HAZARD (<4mm)" : "ACTIVE GROUND SUCTION: VENTURI BOUNDARY SEALED"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "kevlar_elastomer", name: "Kevlar Skirt" },
                { id: "brush_seal", name: "Brush Seal" },
                { id: "sliding_skid_titanium", name: "Titanium Skid" },
                { id: "rigid_carbon", name: "Rigid Carbon" },
              ].map((m) => {
                const isSelected = skirtMaterial === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setSkirtMaterial(m.id as "kevlar_elastomer" | "brush_seal" | "sliding_skid_titanium" | "rigid_carbon");
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
              title: "SKIRT CLEARANCE & SPLITTER LENGTH",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Underbody Floor Skirt Ground Gap"
              value={skirtGapMm}
              min={3.0}
              max={25.0}
              step={0.5}
              unit=" mm"
              color={isRubbing ? "magenta" : "cyan"}
              onChange={(val) => setSkirtGapMm(val)}
            />

            <NeonHorizonSlider
              label="Front Splitter Forward Extension"
              value={splitterExtensionMm}
              min={20}
              max={100}
              step={5}
              unit=" mm"
              color="magenta"
              onChange={(val) => setSplitterExtensionMm(val)}
            />

            <div className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Side Floor Strakes:</span>
                <span className="text-emerald-300 font-bold">6x Vortex Retention Curtains</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">FIA Skid Block Wear:</span>
                <span className="text-sky-300 font-bold">0.18 mm / 100 km (Legal)</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
