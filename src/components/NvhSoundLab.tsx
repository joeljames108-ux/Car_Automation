// ===================================================================
// NVH & ACOUSTIC SOUND LABORATORY UI PANEL
// ===================================================================
// Interactive Vision Glass dashboard for order tracking harmonics,
// Zwicker psychoacoustics (Loudness, Sharpness, Roughness), and FxLMS ANC.
// ===================================================================

import React, { useState, useMemo } from "react";
import { SoundEngineeringSynthesizer } from "../sim/nvh/soundEngineeringSynthesizer";
import { Volume2, VolumeX, Radio, Gauge, Sliders } from "lucide-react";

export const NvhSoundLab: React.FC = () => {
  const [cylinders, setCylinders] = useState<number>(8);
  const [engineRpm, setEngineRpm] = useState<number>(6500);
  const [vehicleSpeedKmH, setVehicleSpeedKmH] = useState<number>(140);
  const [exhaustValveOpen, setExhaustValveOpen] = useState<boolean>(true);
  const [ancActive, setAncActive] = useState<boolean>(true);

  const acousticOutput = useMemo(() => {
    return SoundEngineeringSynthesizer.synthesizeSound({
      cylinders,
      engineRpm,
      vehicleSpeedKmH,
      exhaustValveOpen,
      cabinGlassAcousticLaminate: true,
      ancActive,
      gearRatio: 1.0,
      finalDriveRatio: 3.5,
      tireRadiusM: 0.33,
    });
  }, [cylinders, engineRpm, vehicleSpeedKmH, exhaustValveOpen, ancActive]);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 flex items-center justify-between shadow-xl">
        <div>
          <h2 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
            NVH ACOUSTIC & PSYCHOACOUSTICS LABORATORY
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Order tracking spectral harmonics, Zwicker loudness (Sones), Aures sharpness, and Active Noise Cancellation (FxLMS DSP).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setExhaustValveOpen(!exhaustValveOpen)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              exhaustValveOpen
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>EXHAUST VALVES: {exhaustValveOpen ? "BYPASS OPEN" : "MUFFLED"}</span>
          </button>

          <button
            onClick={() => setAncActive(!ancActive)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
              ancActive
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {ancActive ? <VolumeX className="w-4 h-4 text-emerald-400" /> : <Volume2 className="w-4 h-4 text-slate-400" />}
            <span>ANC DSP: {ancActive ? "ACTIVE (-14 dB)" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-2 font-mono">
            <span>ENGINE RPM:</span>
            <strong className="text-purple-400">{engineRpm.toLocaleString()} RPM</strong>
          </div>
          <input
            type="range"
            min={1000}
            max={9000}
            step={100}
            value={engineRpm}
            onChange={(e) => setEngineRpm(Number(e.target.value))}
            className="w-full accent-purple-500 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-2 font-mono">
            <span>VEHICLE SPEED:</span>
            <strong className="text-indigo-400">{vehicleSpeedKmH} km/h</strong>
          </div>
          <input
            type="range"
            min={0}
            max={320}
            step={5}
            value={vehicleSpeedKmH}
            onChange={(e) => setVehicleSpeedKmH(Number(e.target.value))}
            className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-2 font-mono">
            <span>CYLINDER COUNT:</span>
            <strong className="text-cyan-400">{cylinders} Cylinders ({acousticOutput.orderSweep.primaryFiringOrder}E)</strong>
          </div>
          <input
            type="range"
            min={3}
            max={16}
            step={1}
            value={cylinders}
            onChange={(e) => setCylinders(Number(e.target.value))}
            className="w-full accent-cyan-500 bg-slate-950 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Psychoacoustic Metric Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-purple-400" />
            <span>FINAL CABIN NOISE</span>
          </div>
          <div className="text-2xl font-mono font-black text-purple-400 mt-2">
            {acousticOutput.finalCabinDba} <span className="text-xs text-slate-500">dBA</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Raw Uncancelled: {acousticOutput.orderSweep.totalSoundPressureDba} dBA</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold flex items-center space-x-2">
            <Radio className="w-4 h-4 text-indigo-400" />
            <span>ZWICKER LOUDNESS</span>
          </div>
          <div className="text-2xl font-mono font-black text-indigo-400 mt-2">
            {acousticOutput.psychoacoustics.zwickerLoudnessSones} <span className="text-xs text-slate-500">Sones</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Aures Sharpness: {acousticOutput.psychoacoustics.auresSharpnessAcums} Acums</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>SPEECH ARTICULATION</span>
          </div>
          <div className="text-2xl font-mono font-black text-cyan-400 mt-2">
            {acousticOutput.psychoacoustics.articulationIndexPct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Roughness: {acousticOutput.psychoacoustics.asperRoughnessAsper} Asper</div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">CABIN LUXURY RATING</div>
          <div className="text-sm font-black text-emerald-400 mt-2">{acousticOutput.psychoacoustics.cabinLuxuryRating}</div>
          <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{acousticOutput.psychoacoustics.perceivedAcousticSummary}</div>
        </div>
      </div>

      {/* Acoustic Order Spectrum Table */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200">ACOUSTIC ORDER HARMONICS SPECTRUM</h3>
        <div className="space-y-2">
          {acousticOutput.orderSweep.orderSpectrum.map((ord, idx) => (
            <div key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-200">{ord.description}</div>
                <div className="text-[10px] text-slate-500">Source: {ord.sourceType}</div>
              </div>
              <div className="text-right font-mono">
                <div className="text-xs font-bold text-purple-400">{ord.frequencyHz} Hz</div>
                <div className="text-[11px] text-slate-400">{ord.amplitudeDba} dBA</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
