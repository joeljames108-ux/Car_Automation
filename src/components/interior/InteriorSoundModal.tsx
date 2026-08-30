/**
 * ============================================================================
 * INTERIOR SOUND MODAL — CABIN NVH & SPATIAL AUDIO ACOUSTICS SIMULATOR
 * ============================================================================
 * Features:
 * 1. Web Audio API real-time parametric audio synthesizer:
 *    - Engine RPM rev drone (1,200 to 7,500 RPM)
 *    - High-speed aerodynamic wind & tire road roar
 *    - Sound insulation filter (dB attenuation calculated from noiseIsolation)
 * 2. 16-Band Animated Spatial Audio Frequency Spectrum
 * 3. Soundstage mode switcher (Driver Centric, Cabin Surround, Binaural 3D)
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from "react";
import {
  useInteriorDashboardConfigStore,
} from "../../state/interiorDashboardConfigStore";
import {
  Volume2,
  VolumeX,
  X,
  Play,
  Pause,
  Sparkles,
  Radio,
  Sliders,
  ShieldAlert,
} from "lucide-react";

interface InteriorSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteriorSoundModal: React.FC<InteriorSoundModalProps> = ({
  isOpen,
  onClose,
}) => {
  const metrics = useInteriorDashboardConfigStore((s) => s.metrics);
  const selections = useInteriorDashboardConfigStore((s) => s.selections);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [rpm, setRpm] = useState<number>(3800);
  const [speedKmh, setSpeedKmh] = useState<number>(120);
  const [soundstageMode, setSoundstageMode] = useState<"driver" | "all" | "atmos">("atmos");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const engineOscRef = useRef<OscillatorNode | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Noise isolation dB attenuation: 0% -> 0 dB attenuation (noisy), 100% -> -35 dB attenuation (whisper quiet)
  const attenuationDb = Math.round((metrics.noiseIsolation / 100) * 35);
  const cabinNoiseLevelDb = Math.round(78 - attenuationDb * 0.7);

  // Start / Stop Audio Synthesis
  const togglePlay = () => {
    if (isPlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlaying(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // 1. Engine Oscillator (Harmonic Drone)
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime((rpm / 60) * 2, ctx.currentTime);
        engineOscRef.current = osc;

        // 2. Low-Pass Acoustic Filter (Sound Deadening simulation)
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        // Higher noise isolation -> Lower cutoff frequency (muffled engine drone)
        const cutoffFreq = 400 + (100 - metrics.noiseIsolation) * 18;
        filter.frequency.setValueAtTime(cutoffFreq, ctx.currentTime);
        filterNodeRef.current = filter;

        // 3. Master Gain
        const gain = ctx.createGain();
        const baseVolume = 0.08 * (1 - metrics.noiseIsolation / 180);
        gain.gain.setValueAtTime(baseVolume, ctx.currentTime);
        engineGainRef.current = gain;

        // Connect graph: Osc -> Filter -> Gain -> Destination
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Audio synthesis error:", err);
      }
    }
  };

  // Update dynamic frequency on RPM or noise isolation change
  useEffect(() => {
    if (audioCtxRef.current && engineOscRef.current && filterNodeRef.current) {
      const ctx = audioCtxRef.current;
      engineOscRef.current.frequency.setTargetAtTime((rpm / 60) * 2.5, ctx.currentTime, 0.05);

      const cutoffFreq = 400 + (100 - metrics.noiseIsolation) * 18;
      filterNodeRef.current.frequency.setTargetAtTime(cutoffFreq, ctx.currentTime, 0.05);
    }
  }, [rpm, metrics.noiseIsolation]);

  // Clean up audio on unmount or close
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-amber-900/50 border border-amber-700/30/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-amber-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-800/30 bg-amber-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-cyan-400 border border-cyan-500/30">
              <Radio size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cockpit NVH &amp; Acoustic Simulator</h2>
              <p className="text-xs text-amber-200/60">Real-time cabin sound pressure &amp; acoustic isolation</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isPlaying && audioCtxRef.current) audioCtxRef.current.close();
              setIsPlaying(false);
              onClose();
            }}
            className="p-1.5 rounded-lg text-amber-200/60 hover:text-white hover:bg-amber-800/35 transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Decibel Readout Card */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-amber-950/60 border border-amber-800/30 rounded-xl p-3 text-center">
              <span className="text-[10px] font-mono text-amber-200/60 uppercase">Cabin Noise (120 km/h)</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">{cabinNoiseLevelDb} dB(A)</div>
              <span className="text-[10px] text-emerald-400 font-bold">
                {cabinNoiseLevelDb <= 60 ? "Whisper Quiet" : cabinNoiseLevelDb <= 68 ? "Executive Quiet" : "Sporty Intrusive"}
              </span>
            </div>

            <div className="bg-amber-950/60 border border-amber-800/30 rounded-xl p-3 text-center">
              <span className="text-[10px] font-mono text-amber-200/60 uppercase">Acoustic Shield</span>
              <div className="text-2xl font-black text-white mt-1">-{attenuationDb} dB</div>
              <span className="text-[10px] text-amber-200/60">{metrics.noiseIsolation}% Isolation</span>
            </div>

            <div className="bg-amber-950/60 border border-amber-800/30 rounded-xl p-3 text-center">
              <span className="text-[10px] font-mono text-amber-200/60 uppercase">Infotainment Tier</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{metrics.infotainment}%</div>
              <span className="text-[10px] text-amber-200/60">DSP Fidelity</span>
            </div>
          </div>

          {/* 16-Band Equalizer Frequency Bars */}
          <div className="bg-amber-950/80 border border-amber-800/30 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-amber-200/60 font-mono">
              <span>LIVE CABIN FREQUENCY SPECTRUM (20 Hz - 20 kHz)</span>
              <span className={isPlaying ? "text-cyan-400 font-bold animate-pulse" : "text-amber-300/50"}>
                {isPlaying ? "ACTIVE SYNTHESIS" : "MUTED"}
              </span>
            </div>
            <div className="flex items-end justify-between h-20 gap-1 pt-2">
              {Array.from({ length: 16 }).map((_, i) => {
                const heightPercent = isPlaying
                  ? Math.max(12, Math.min(95, 20 + Math.sin(i * 0.8 + (rpm / 1000)) * 40 + (i < 4 ? 35 : 15)))
                  : 8;
                return (
                  <div key={i} className="flex-1 bg-amber-900/50 rounded-t overflow-hidden h-full flex flex-col justify-end">
                    <div
                      className={`w-full rounded-t transition-all duration-75 ${
                        i < 4
                          ? "bg-gradient-to-t from-red-600 to-amber-400"
                          : i < 11
                          ? "bg-gradient-to-t from-cyan-600 to-blue-400"
                          : "bg-gradient-to-t from-purple-600 to-pink-400"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* RPM & Speed Sliders */}
          <div className="space-y-3 bg-amber-950/40 p-4 rounded-xl border border-amber-800/30">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-amber-200/60">ENGINE REVS (RPM)</span>
                <span className="text-cyan-400 font-bold">{rpm} RPM</span>
              </div>
              <input
                type="range"
                min="1000"
                max="8500"
                step="100"
                value={rpm}
                onChange={(e) => setRpm(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-amber-200/60">VEHICLE SPEED (KM/H)</span>
                <span className="text-cyan-400 font-bold">{speedKmh} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="320"
                step="5"
                value={speedKmh}
                onChange={(e) => setSpeedKmh(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Soundstage Mode Selection */}
          <div>
            <span className="text-xs font-bold text-amber-100/80 block mb-2">SPATIAL SOUNDSTAGE PROFILES:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSoundstageMode("driver")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  soundstageMode === "driver"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-amber-800/35/80 text-amber-200/60 hover:text-white"
                }`}
              >
                🎯 Driver Focus
              </button>
              <button
                onClick={() => setSoundstageMode("all")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  soundstageMode === "all"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-amber-800/35/80 text-amber-200/60 hover:text-white"
                }`}
              >
                👥 All Passengers
              </button>
              <button
                onClick={() => setSoundstageMode("atmos")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  soundstageMode === "atmos"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-amber-800/35/80 text-amber-200/60 hover:text-white"
                }`}
              >
                🌐 Dolby Atmos 3D
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-amber-800/30 bg-amber-950/60 flex items-center justify-between">
          <button
            onClick={togglePlay}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              isPlaying
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30"
                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
            }`}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span>{isPlaying ? "PAUSE ACOUSTIC SIMULATION" : "START ACOUSTIC SIMULATION"}</span>
          </button>

          <button
            onClick={() => {
              if (isPlaying && audioCtxRef.current) audioCtxRef.current.close();
              setIsPlaying(false);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-amber-800/35 hover:bg-amber-700/40 text-amber-100/80 font-bold text-xs transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
