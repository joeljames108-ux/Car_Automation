import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  Gauge,
  Sliders,
  Activity,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { playSubsystemEngageSound, playTurboBoostSound } from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonVariableCompressionStudio() {
  const { sim } = useDesign();

  const [compRatio, setCompRatio] = useState(10.5); // 8.0:1 to 14.0:1
  const [boostBar, setBoostBar] = useState(2.2); // bar
  const [cycleType, setCycleType] = useState<"otto" | "atkinson" | "miller">("otto");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // PV Indicator Diagram (Pressure vs Volume)
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

    // PV Curve
    const peakP = 60 + (compRatio / 8) * 45 + boostBar * 35; // peak cylinder bar
    ctx.strokeStyle = "#ff0055";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    // Intake stroke
    ctx.moveTo(40, h - 30);
    ctx.lineTo(w - 40, h - 30);

    // Compression stroke
    ctx.quadraticCurveTo(w * 0.4, h - 35, 60, h - 30 - (peakP * 0.6));

    // Combustion spike
    ctx.lineTo(50, h - 30 - peakP);

    // Expansion / Power stroke
    ctx.quadraticCurveTo(w * 0.5, h - 60, w - 40, h - 50);

    // Exhaust blowdown
    ctx.lineTo(w - 40, h - 30);
    ctx.stroke();

    // Peak Pressure Marker
    ctx.fillStyle = "#ff0055";
    ctx.shadowColor = "#ff0055";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(50, h - 30 - peakP, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ff0055";
    ctx.font = "9px monospace";
    ctx.fillText(`PEAK PRESSURE: ${Math.round(peakP)} BAR`, 65, h - 25 - peakP);
  }, [compRatio, boostBar, cycleType]);

  const thermalEff = (38.5 + (compRatio - 8.0) * 1.6 + (cycleType === "atkinson" ? 4.2 : cycleType === "miller" ? 3.0 : 0)).toFixed(1);
  const bsfcGkwh = (245 - (parseFloat(thermalEff) - 38) * 3.5).toFixed(0);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "MULTI-LINK VARIABLE COMPRESSION RATIO (VCR) & COMBUSTION CYCLE LAB",
          subtitle: "Continuous 8.0:1 to 14.0:1 hydraulic harmonic multi-link actuation, PV indicator diagrams, and Atkinson/Miller thermodynamics",
          icon: <Flame size={18} />,
          badge: <NeonHorizonBadge variant="live">CR: {compRatio.toFixed(1)}:1 · {cycleType.toUpperCase()}</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="COMPRESSION RATIO" value={`${compRatio.toFixed(1)}:1`} accentColor="cyan" />
          <NeonHorizonDataCard label="THERMAL EFFICIENCY" value={`${thermalEff}%`} accentColor="emerald" />
          <NeonHorizonDataCard label="BSFC EFFICIENCY" value={`${bsfcGkwh} g/kWh`} accentColor="gold" />
          <NeonHorizonDataCard label="KNOCK RESISTANCE" value={compRatio < 9.5 ? "3.5 BAR BOOST CAPABLE" : "HIGH CR EFFICIENCY"} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left PV Indicator Diagram (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "IN-CYLINDER PRESSURE VS VOLUME (PV DIAGRAM)",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-52 bg-slate-900/80 rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_25px_rgba(0,0,0,0.85)]">
              <canvas ref={canvasRef} width={640} height={210} className="w-full h-full" />
              <div className="absolute bottom-2 right-3 flex items-center gap-2">
                <span className="text-[10px] nh-font-mono text-amber-400">CYLINDER VOLUME V (TDC → BDC)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "otto", name: "Standard Otto" },
                { id: "atkinson", name: "Atkinson EIVC" },
                { id: "miller", name: "Miller LIVC Boost" },
              ].map((c) => {
                const isSelected = cycleType === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      playSubsystemEngageSound();
                      setCycleType(c.id as "otto" | "atkinson" | "miller");
                    }}
                    className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-amber-500/20 border-amber-500/30 text-sky-200"
 : "bg-slate-900/80 border-white/10 text-slate-400 hover:border-sky-400/25"
 }`}
                  >
                    {c.name}
                  </div>
                );
              })}
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Multi-Link Actuator Tuning (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "MULTI-LINK ACTUATOR & BOOST MAPPING",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Variable Compression Target"
              value={compRatio}
              min={8.0}
              max={14.0}
              step={0.1}
              unit=":1"
              color="cyan"
              onChange={(val) => setCompRatio(val)}
            />

            <NeonHorizonSlider
              label="Manifold Absolute Turbo Boost"
              value={boostBar}
              min={0.5}
              max={3.5}
              step={0.1}
              unit=" bar"
              color="gold"
              onChange={(val) => setBoostBar(val)}
            />

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-400/15 flex flex-col gap-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Harmonic Multi-Link Arm:</span>
                <span className="text-amber-300 font-bold">120 ms Full Stroke</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Piston Side Thrust:</span>
                <span className="text-emerald-300 font-bold">-40% vs Traditional Rod</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
