import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Play,
  Zap,
  Activity,
  Flame,
  Music,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import {
  playEngineRevSound,
  playTurboBoostSound,
  playSubsystemEngageSound,
  playHologramScanSound,
} from "../interactive/NeonHorizonSoundEngine";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonToggle } from "../design/NeonHorizonToggle";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonAudioStudio() {
  const { sim } = useDesign();

  const [rpm, setRpm] = useState(4200);
  const [valvesOpen, setValvesOpen] = useState(true);
  const [exhaustTone, setExhaustTone] = useState<"titanium" | "inconel" | "straight_pipe">("titanium");
  const [insulation, setInsulation] = useState<"lightweight" | "standard" | "luxury">("lightweight");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated Oscilloscope Effect
  useEffect(() => {
    let animId: number;
    let phase = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Draw Grid
      ctx.strokeStyle = "rgba(56,189,248, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Waveform
      ctx.strokeStyle = "#8fb9d9";
      ctx.lineWidth = 2;
      ctx.beginPath();

      const freq = (rpm / 1000) * 0.05;
      const amp = (rpm / 9000) * (h / 3);

      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * freq + phase) * amp + (Math.random() - 0.5) * (valvesOpen ? 6 : 2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Harmonic Ghost Line
      ctx.strokeStyle = "rgba(255, 0, 85, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * freq * 2 + phase * 1.5) * (amp * 0.4);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += (rpm / 9000) * 0.2 + 0.02;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [rpm, valvesOpen]);

  const handleRevEngine = () => {
    playEngineRevSound(rpm, 9000);
  };

  const handleTurboBOV = () => {
    playTurboBoostSound();
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "PROCEDURAL ACOUSTIC SYNTHESIS & EXHAUST RESONANCE LAB",
          subtitle: "Real-time Web Audio API harmonic soundbench, oscilloscope telemetry, and active acoustic bypass",
          icon: <Music size={18} />,
          badge: <NeonHorizonBadge variant="live">SYNTHESIZER ONLINE</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="TEST RPM" value={`${rpm} RPM`} accentColor="cyan" />
          <NeonHorizonDataCard label="ACTIVE BYPASS" value={valvesOpen ? "100% OPEN" : "CLOSED (STEALTH)"} accentColor={valvesOpen ? "coral" : "emerald"} />
          <NeonHorizonDataCard label="EXHAUST MATERIAL" value={exhaustTone.toUpperCase()} accentColor="gold" />
          <NeonHorizonDataCard label="CABIN ISOLATION" value={insulation === "lightweight" ? "42 dB (RACE)" : insulation === "standard" ? "68 dB (GT)" : "84 dB (LUXURY)"} accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Oscilloscope & Sound Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "REAL-TIME HARMONIC AUDIO OSCILLOSCOPE",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="w-full h-44 bg-amber-950/60 rounded-xl border border-sky-400/25 overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
              <canvas ref={canvasRef} width={600} height={180} className="w-full h-full" />
              <div className="absolute top-2 left-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-300 animate-ping" />
                <span className="text-[10px] nh-font-mono font-bold text-amber-400">PROCEDURAL OSCILLATOR · {rpm} Hz FREQ</span>
              </div>
            </div>

            {/* Test Bench Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <NeonHorizonButton variant="primary" glow size="sm" onClick={handleRevEngine}>
                <Play size={14} className="mr-1" /> REV ENGINE
              </NeonHorizonButton>
              <NeonHorizonButton variant="secondary" size="sm" onClick={handleTurboBOV}>
                <Flame size={14} className="mr-1 text-amber-400" /> TURBO BOV
              </NeonHorizonButton>
              <NeonHorizonButton variant="ghost" size="sm" onClick={playSubsystemEngageSound}>
                <Zap size={14} className="mr-1 text-amber-400" /> SERVO THUD
              </NeonHorizonButton>
              <NeonHorizonButton variant="ghost" size="sm" onClick={playHologramScanSound}>
                <Radio size={14} className="mr-1 text-amber-400" /> SCAN CHIRP
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
              title: "EXHAUST & CABIN ACOUSTIC CONTROLS",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <NeonHorizonSlider
              label="Engine Bench RPM"
              value={rpm}
              min={800}
              max={9500}
              step={100}
              unit=" RPM"
              color="cyan"
              onChange={(val) => setRpm(val)}
            />

            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/60 border border-sky-400/15">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">Active Exhaust Bypass Valves</span>
                <span className="text-[10px] text-slate-400">Open for full unmuffled racing resonance</span>
              </div>
              <NeonHorizonToggle
                label="Active Bypass Valves"
                checked={valvesOpen}
                onChange={(checked) => {
                  playSubsystemEngageSound();
                  setValvesOpen(checked);
                }}
                color="cyan"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300">Exhaust Header Metallurgy:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "titanium", name: "Titanium" },
                  { id: "inconel", name: "Inconel 625" },
                  { id: "straight_pipe", name: "Race Straight" },
                ].map((item) => {
                  const isSelected = exhaustTone === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        playHologramScanSound();
                        setExhaustTone(item.id as "titanium" | "inconel" | "straight_pipe");
                      }}
                      className={`p-2.5 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
 isSelected
 ? "bg-amber-500/20 border-amber-500/30 text-sky-200"
 : "bg-amber-950/60 border-white/10 text-slate-400 hover:border-sky-400/25"
 }`}
                    >
                      {item.name}
                    </div>
                  );
                })}
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
