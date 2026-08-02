// ===================================================================
// APEX ENGINEER — REAL-TIME ENGINE AUDIO SPECTRUM VISUALIZER
// Real-time FFT Audio Spectrum, Firing Frequency Telemetry, Layout Sound Switcher
// Frosted Translucent Liquid Glass Studio Workstation Component
// ===================================================================

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Flame, Zap, Play, Radio } from "lucide-react";
import {
  apexAudio,
  EngineLayoutId,
  ENGINE_FIRING_ORDERS,
  calculateFiringFrequency,
} from "./engineAudioEngine";

export function mapEngineLayoutToAudioLayout(layout?: string): EngineLayoutId {
  if (!layout) return "i4";
  switch (layout.toLowerCase()) {
    case "i3":
    case "i4":
      return "i4";
    case "i6":
    case "v6":
      return "v6_60";
    case "v8":
      return "v8_crossplane";
    case "v10":
      return "v10";
    case "v12":
    case "w12":
    case "w16":
    case "w18":
      return "v12";
    case "boxer4":
      return "boxer4_uel";
    case "boxer6":
      return "boxer6";
    case "rotary":
      return "rotary_13b";
    case "hybrid":
      return "ev_dual_motor";
    default:
      return (ENGINE_FIRING_ORDERS[layout as EngineLayoutId] ? (layout as EngineLayoutId) : "i4");
  }
}

interface EngineAudioVisualizerProps {
  currentLayout?: EngineLayoutId | string;
  rpm?: number;
  onSelectLayout?: (layout: string) => void;
  className?: string;
}

export function EngineAudioVisualizer({
  currentLayout = "i4",
  rpm = 6500,
  onSelectLayout,
  className = "",
}: EngineAudioVisualizerProps) {
  const [activeLayout, setActiveLayout] = useState<EngineLayoutId>(() => mapEngineLayoutToAudioLayout(currentLayout));
  const [activeRpm, setActiveRpm] = useState<number>(rpm);
  const [isMuted, setIsMuted] = useState<boolean>(apexAudio.getMuteState());
  const [isPlayingTest, setIsPlayingTest] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (currentLayout) {
      setActiveLayout(mapEngineLayoutToAudioLayout(currentLayout));
    }
  }, [currentLayout]);

  useEffect(() => {
    if (rpm) {
      setActiveRpm(rpm);
    }
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
      className={`w-full bg-white/40 dark:bg-slate-900/90 border border-white/60 dark:border-slate-800 rounded-2xl p-3.5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] text-left select-none space-y-3 ${className}`}
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shrink-0 shadow-sm">
            <Radio size={16} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-extrabold truncate">
              REAL-TIME ENGINE AUDIO SYNTHESIZER
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {profile.description}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? "bg-rose-500/20 text-rose-500 border-rose-500/40"
                : "bg-white/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-white/80 dark:border-slate-700 hover:bg-white/80"
            }`}
            title={isMuted ? "Unmute Engine Sound" : "Mute Engine Sound"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Test Rev Audio Trigger (Never Wraps) */}
          <button
            onClick={handleTestFire}
            disabled={isPlayingTest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-[11px] font-mono whitespace-nowrap transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isPlayingTest ? (
              <>
                <Flame size={13} className="animate-spin text-black" /> REVVING...
              </>
            ) : (
              <>
                <Play size={13} fill="currentColor" /> TEST FIRE REV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time FFT Frequency Canvas & Telemetry Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* FFT Canvas */}
        <div className="md:col-span-2 relative h-24 bg-white/50 dark:bg-slate-950/80 border border-white/60 dark:border-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} width={380} height={96} className="w-full h-full" />
          <div className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/90 text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
            FFT SPECTRUM ANALYZER
          </div>
        </div>

        {/* Live Audio Telemetry Stats (No Text Squishing) */}
        <div className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-950/60 border border-white/60 dark:border-slate-800/80 backdrop-blur-md flex flex-col justify-center gap-1.5 text-[11px] font-mono">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 whitespace-nowrap">
            <span className="font-bold">FIRING FREQ:</span>
            <span className="text-amber-600 dark:text-amber-400 font-extrabold ml-1">{Math.round(firingFreq.fundamental)} Hz</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 whitespace-nowrap">
            <span className="font-bold">2ND HARMONIC:</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-extrabold ml-1">{Math.round(firingFreq.secondary)} Hz</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 whitespace-nowrap">
            <span className="font-bold">REDLINE:</span>
            <span className="text-rose-600 dark:text-rose-400 font-extrabold ml-1">{profile.defaultRedlineRpm} RPM</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 whitespace-nowrap">
            <span className="font-bold">CYLINDERS:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold ml-1">{profile.cylinders} CYL</span>
          </div>
        </div>
      </div>

      {/* Layout Audio Switcher Pills */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
        {(Object.keys(ENGINE_FIRING_ORDERS) as EngineLayoutId[]).map((layoutKey) => (
          <button
            key={layoutKey}
            onClick={() => {
              setActiveLayout(layoutKey);
              apexAudio.updateEngineAudio({ layout: layoutKey, rpm: activeRpm, throttle: 0.5, engineLoad: 0.5 });
              onSelectLayout?.(layoutKey);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-extrabold uppercase transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeLayout === layoutKey
                ? "bg-cyan-500 text-black shadow-sm font-bold scale-[1.02]"
                : "bg-white/50 dark:bg-slate-800/80 hover:bg-white/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-white/60 dark:border-slate-700/80"
            }`}
          >
            {layoutKey.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
