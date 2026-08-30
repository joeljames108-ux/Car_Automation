// ===================================================================
// APEX ENGINEER — REAL-TIME ENGINE AUDIO SPECTRUM VISUALIZER
// Real-time FFT Audio Spectrum, Firing Frequency Telemetry, Layout Sound Switcher
// Ultra-Clean Slate Dark Glass Workstation Component
// ===================================================================

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Flame, Play, Radio } from "lucide-react";
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

      // Background CAD Grid Lines
      ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw Frequency Spectrum Bars
      const barWidth = (width / freqData.length) * 1.6;
      let x = 0;

      for (let i = 0; i < freqData.length; i++) {
        const barHeight = (freqData[i] / 255) * (height * 0.85);

        // Dynamic Cyan to Amber Spectrum Gradient
        const hue = 195 + (i / freqData.length) * 45;
        ctx.fillStyle = `hsla(${hue}, 90%, 55%, 0.85)`;

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
      className={`w-full bg-base-950/90 dark:bg-base-950/95 border border-amber-500/30 rounded-2xl p-3.5 backdrop-blur-xl shadow-xl text-left select-none space-y-3 overflow-hidden ${className}`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
            <Radio size={16} className="animate-pulse text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-extrabold truncate">
              REAL-TIME AUDIO SYNTHESIZER
            </div>
            <div className="text-xs font-bold text-amber-50 font-mono truncate" title={profile.description}>
              {profile.description}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                : "bg-base-900/80 text-amber-100/80 border-base-700 hover:bg-base-800 hover:text-white"
            }`}
            title={isMuted ? "Unmute Engine Sound" : "Mute Engine Sound"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Test Rev Audio Trigger */}
          <button
            onClick={handleTestFire}
            disabled={isPlayingTest}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-[11px] font-mono whitespace-nowrap transition-all shadow-[0_0_14px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
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
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* FFT Canvas (7 Cols) */}
        <div className="sm:col-span-7 relative h-24 bg-base-900/90 border border-amber-500/30 rounded-xl overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} width={320} height={96} className="w-full h-full" />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-base-950/90 text-[9px] font-mono font-bold text-amber-400 border border-amber-500/30 backdrop-blur-md">
            FFT SPECTRUM ANALYZER
          </div>
        </div>

        {/* Live Audio Telemetry Stats (5 Cols - Fixed Text Wrapping) */}
        <div className="sm:col-span-5 p-2.5 rounded-xl bg-base-900/70 border border-base-800 flex flex-col justify-center gap-1.5 text-[10px] font-mono min-w-0">
          <div className="flex items-center justify-between text-amber-200/60 gap-1">
            <span className="font-semibold text-amber-200/60 truncate">FIRING FREQ:</span>
            <span className="text-amber-400 font-bold shrink-0">{Math.round(firingFreq.fundamental)} Hz</span>
          </div>
          <div className="flex items-center justify-between text-amber-200/60 gap-1">
            <span className="font-semibold text-amber-200/60 truncate">2ND HARMONIC:</span>
            <span className="text-amber-400 font-bold shrink-0">{Math.round(firingFreq.secondary)} Hz</span>
          </div>
          <div className="flex items-center justify-between text-amber-200/60 gap-1">
            <span className="font-semibold text-amber-200/60 truncate">REDLINE:</span>
            <span className="text-rose-400 font-bold shrink-0">{profile.defaultRedlineRpm} RPM</span>
          </div>
          <div className="flex items-center justify-between text-amber-200/60 gap-1">
            <span className="font-semibold text-amber-200/60 truncate">CYLINDERS:</span>
            <span className="text-emerald-400 font-bold shrink-0">{profile.cylinders} CYL</span>
          </div>
        </div>
      </div>

      {/* Layout Audio Switcher Pills (Padded Container, Zero Overflow) */}
      <div className="p-1 rounded-xl bg-base-900/60 border border-base-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
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
                  ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.4)] scale-[1.02]"
                  : "bg-base-950/80 hover:bg-base-800 text-amber-100/80 border border-base-750"
              }`}
            >
              {layoutKey.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
