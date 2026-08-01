// ===================================================================
// APEX ENGINEER — REAL-TIME ENGINE AUDIO SPECTRUM VISUALIZER
// Real-time FFT Audio Spectrum, Firing Frequency Telemetry, Layout Sound Switcher
// ===================================================================

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Flame, Zap, Play, Radio } from "lucide-react";
import {
  apexAudio,
  EngineLayoutId,
  ENGINE_FIRING_ORDERS,
  calculateFiringFrequency,
} from "./engineAudioEngine";

interface EngineAudioVisualizerProps {
  currentLayout?: EngineLayoutId;
  rpm?: number;
  className?: string;
}

export function EngineAudioVisualizer({
  currentLayout = "i4",
  rpm = 6500,
  className = "",
}: EngineAudioVisualizerProps) {
  const [activeLayout, setActiveLayout] = useState<EngineLayoutId>(currentLayout);
  const [activeRpm, setActiveRpm] = useState<number>(rpm);
  const [isMuted, setIsMuted] = useState<boolean>(apexAudio.getMuteState());
  const [isPlayingTest, setIsPlayingTest] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync prop changes
  useEffect(() => {
    setActiveLayout(currentLayout);
  }, [currentLayout]);

  useEffect(() => {
    setActiveRpm(rpm);
  }, [rpm]);

  // Real-time Canvas FFT Spectrum Animation Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderSpectrum = () => {
      const freqData = apexAudio.getFrequencySpectrum();
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background Subtle CAD Grid
      ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw Frequency Bins
      const barWidth = (width / freqData.length) * 1.5;
      let x = 0;

      for (let i = 0; i < freqData.length; i++) {
        const barHeight = (freqData[i] / 255) * (height * 0.85);

        // Dynamic Frequency Color (Sub-bass blue -> Mid amber -> High red)
        const hue = 210 - (i / freqData.length) * 180;
        ctx.fillStyle = `hsla(${hue}, 85%, 55%, 0.85)`;

        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      animId = requestAnimationFrame(renderSpectrum);
    };

    animId = requestAnimationFrame(renderSpectrum);
    return () => cancelAnimationFrame(animId);
  }, []);

  const profile = ENGINE_FIRING_ORDERS[activeLayout] || ENGINE_FIRING_ORDERS.i4;
  const firingFreq = calculateFiringFrequency(activeLayout, activeRpm);

  const handleTestFire = () => {
    setIsPlayingTest(true);
    apexAudio.triggerTestFireSequence(activeLayout, profile.defaultRedlineRpm);
    setTimeout(() => setIsPlayingTest(false), 2400);
  };

  const handleToggleMute = () => {
    const muted = apexAudio.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      className={`w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-4 backdrop-blur-2xl shadow-2xl text-left select-none ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Radio size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-extrabold">
              REAL-TIME ENGINE AUDIO SYNTHESIZER
            </div>
            <div className="text-sm font-extrabold text-white tracking-tight">{profile.description}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            }`}
            title={isMuted ? "Unmute Engine Sound" : "Mute Engine Sound"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Test Rev Audio Trigger */}
          <button
            onClick={handleTestFire}
            disabled={isPlayingTest}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs tracking-wide transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isPlayingTest ? (
              <>
                <Flame size={14} className="animate-spin text-slate-950" /> REVVING...
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" /> TEST FIRE REV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time FFT Frequency Canvas & Telemetry Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* FFT Canvas */}
        <div className="md:col-span-2 relative h-28 bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} width={380} height={110} className="w-full h-full" />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 text-[9px] font-mono text-cyan-400 border border-cyan-500/30">
            FFT SPECTRUM ANALYZER
          </div>
        </div>

        {/* Live Audio Telemetry Stats */}
        <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span>FIRING FREQ:</span>
            <span className="text-amber-400 font-bold">{Math.round(firingFreq.fundamental)} Hz</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>2ND HARMONIC:</span>
            <span className="text-cyan-400 font-bold">{Math.round(firingFreq.secondary)} Hz</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>REDLINE:</span>
            <span className="text-rose-400 font-bold">{profile.defaultRedlineRpm} RPM</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>CYLINDERS:</span>
            <span className="text-emerald-400 font-bold">{profile.cylinders} CYL</span>
          </div>
        </div>
      </div>

      {/* Layout Audio Switcher Pills */}
      <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
        {(Object.keys(ENGINE_FIRING_ORDERS) as EngineLayoutId[]).map((layoutKey) => (
          <button
            key={layoutKey}
            onClick={() => {
              setActiveLayout(layoutKey);
              apexAudio.updateEngineAudio({ layout: layoutKey, rpm: activeRpm, throttle: 0.5 });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeLayout === layoutKey
                ? "bg-cyan-500 text-slate-950 border border-cyan-400 shadow-md shadow-cyan-500/20"
                : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80"
            }`}
          >
            {layoutKey.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
