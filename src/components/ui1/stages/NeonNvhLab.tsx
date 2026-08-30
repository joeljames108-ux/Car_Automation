import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  Activity,
  Sliders,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonToggle } from "../design/NeonHorizonToggle";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonNvhLab() {
  const { design, sim } = useDesign();

  const [runnerLength, setRunnerLength] = useState(180); // mm
  const [activeExhaustValve, setActiveExhaustValve] = useState(true);
  const [soundDamping, setSoundDamping] = useState(72);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated Spectrogram Waterfall Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const renderFft = () => {
      step++;
      ctx.fillStyle = "#040714";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const bars = 32;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const heightMultiplier = Math.sin((step * 0.08) + (i * 0.35)) * 0.4 + 0.6;
        const barHeight = Math.max(8, heightMultiplier * (canvas.height * 0.8));

        const grad = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        grad.addColorStop(0, "#8fb9d9");
        grad.addColorStop(0.5, "#a78bfa");
        grad.addColorStop(1, "#1e1b4b");

        ctx.fillStyle = grad;
        ctx.fillRect(i * barWidth + 2, canvas.height - barHeight, barWidth - 4, barHeight);
      }

      animId = requestAnimationFrame(renderFft);
    };

    animId = requestAnimationFrame(renderFft);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "NVH ACOUSTICS & FFT SPECTROGRAM LAB",
          subtitle: "Exhaust drone suppression, intake trumpet velocity stacks, and cabin decibel optimization",
          icon: <Volume2 size={18} />,
          badge: <NeonHorizonBadge variant="live">FFT SPECTROGRAM RUNNING</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="CABIN SPL @ 100 KM/H" value={64} unit="dBA" accentColor="cyan" />
          <NeonHorizonDataCard label="INTAKE RESONANCE" value={`${Math.round(28000 / runnerLength)} Hz`} accentColor="magenta" />
          <NeonHorizonDataCard label="DRONE SUPPRESSION" value={`${soundDamping}%`} accentColor="emerald" />
          <NeonHorizonDataCard label="EXHAUST VALVES" value={activeExhaustValve ? "OPEN (SPORT)" : "CLOSED (STEALTH)"} accentColor="gold" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Tuning Sliders (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "INTAKE RUNNER & EXHAUST ACOUSTICS",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-5"
          >
            <NeonHorizonSlider
              label="INTAKE TRUMPET RUNNER LENGTH"
              value={runnerLength}
              min={110}
              max={280}
              unit="mm"
              onChange={setRunnerLength}
              color="cyan"
            />

            <NeonHorizonSlider
              label="CABIN SOUND DEADENING MATERIAL"
              value={soundDamping}
              min={20}
              max={100}
              unit="%"
              onChange={setSoundDamping}
              color="magenta"
            />

            <div className="pt-2">
              <NeonHorizonToggle
                label="VARIABLE ACTIVE EXHAUST BYPASS VALVES"
                description="Opens bypass flaps at > 4,000 RPM for maximum acoustic resonance"
                checked={activeExhaustValve}
                onChange={setActiveExhaustValve}
                color="cyan"
              />
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Animated Spectrogram (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "LIVE FFT AUDIO WATERFALL",
              icon: <Activity size={16} />,
            }}
            className="p-5 flex flex-col items-center justify-center gap-3"
          >
            <div className="w-full h-44 rounded-xl overflow-hidden border border-sky-400/15 shadow-inner">
              <canvas ref={canvasRef} width={360} height={176} className="w-full h-full object-cover" />
            </div>

            <div className="w-full flex justify-between items-center border-t border-white/10 pt-2 text-[10px] nh-font-mono text-slate-400">
              <span>20 Hz (SUB)</span>
              <span>1 kHz (MID)</span>
              <span>20 kHz (AIR)</span>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
