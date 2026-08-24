import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Zap,
  Sliders,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonSafetyLab() {
  const { design, sim } = useDesign();

  const [crashSpeed, setCrashSpeed] = useState(64); // km/h
  const [crashStructureLayers, setCrashStructureLayers] = useState(6);

  const absorptionJoules = Math.round(0.5 * (sim.weight || 1200) * Math.pow(crashSpeed / 3.6, 2));
  const cabinIntrusionMm = Math.max(4, Math.round(45 - crashStructureLayers * 5.5));
  const peakG = Number((24 + (crashSpeed / 64) * 8 - crashStructureLayers * 1.5).toFixed(1));

  const ncapRatings = [
    { category: "Adult Occupant Protection", score: "96%", stars: 5 },
    { category: "Child Occupant Protection", score: "92%", stars: 5 },
    { category: "Vulnerable Road Users (Pedestrian)", score: "84%", stars: 4 },
    { category: "Safety Assist (LiDAR / Radar ADAS)", score: "98%", stars: 5 },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "STRUCTURAL CRASH DYNAMICS & NCAP SAFETY LAB",
          subtitle: "Carbon composite impact absorption, survival cell integrity, and deceleration pulses",
          icon: <ShieldCheck size={18} />,
          badge: <NeonHorizonBadge variant="live">5-STAR EURO NCAP</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="IMPACT ENERGY" value={`${(absorptionJoules / 1000).toFixed(1)} kJ`} accentColor="cyan" />
          <NeonHorizonDataCard label="PEAK DECELERATION" value={`${peakG} G`} accentColor="gold" />
          <NeonHorizonDataCard label="CABIN INTRUSION" value={`${cabinIntrusionMm} mm`} accentColor="emerald" />
          <NeonHorizonDataCard label="AIRBAG LATENCY" value="12 ms" accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Crash Simulation Config (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "CRASH PULSE PARAMETERS & CRUMPLE ZONE",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col gap-5"
          >
            <NeonHorizonSlider
              label="FRONTAL IMPACT TEST VELOCITY"
              value={crashSpeed}
              min={40}
              max={100}
              unit="km/h"
              onChange={setCrashSpeed}
              color="cyan"
            />

            <NeonHorizonSlider
              label="CARBON COMPOSITE CRASH BOX LAYERS"
              value={crashStructureLayers}
              min={3}
              max={10}
              unit="Layers"
              onChange={setCrashStructureLayers}
              color="magenta"
            />

            {/* Crash Pulse Deceleration SVG Chart */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <span className="nh-label-caps text-slate-400 text-[10px]">DECELERATION PULSE WAVEFORM (G vs TIME)</span>
              <div className="h-36 w-full bg-[#05080f] rounded-xl border border-sky-400/15 p-2">
                <svg viewBox="0 0 400 120" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="crashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff5252" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#ff5252" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {[20, 50, 80, 110].map((y) => (
                    <line key={y} x1="20" y1={y} x2="380" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  ))}
                  <path
                    d="M 20 110 Q 70 100, 100 30 T 180 80 T 260 105 T 380 110 L 380 110 L 20 110 Z"
                    fill="url(#crashGrad)"
                  />
                  <path
                    d="M 20 110 Q 70 100, 100 30 T 180 80 T 260 105 T 380 110"
                    fill="none"
                    stroke="#ff5252"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right NCAP Scorecards (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "EURO NCAP STAR RATING BREAKDOWN",
              icon: <Star size={16} />,
            }}
            className="p-6 flex flex-col gap-3"
          >
            {ncapRatings.map((ncap, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{ncap.category}</span>
                  <span className="text-xs nh-font-mono font-bold text-sky-300">{ncap.score}</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={12}
                      className={s < ncap.stars ? "text-amber-400 fill-amber-400" : "text-slate-600"}
                    />
                  ))}
                </div>
              </div>
            ))}
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
