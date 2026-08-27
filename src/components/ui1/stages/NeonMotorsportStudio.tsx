import React, { useState, memo } from "react";
import {
  Flag,
  Trophy,
  Radio,
  Timer,
  Activity,
  Flame,
  Zap,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSelect } from "../design/NeonHorizonSelect";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export const NeonMotorsportStudio = memo(function NeonMotorsportStudio() {
  const { sim, design } = useDesign();

  const [tireCompound, setTireCompound] = useState<string>("soft");
  const [pitWindowLap, setPitWindowLap] = useState(18);
  const [fuelMix, setFuelMix] = useState<string>("rich");

  const compounds: Record<string, { grip: string; wearRate: string; laps: number; color: string }> = {
    soft: { grip: "1.82 G", wearRate: "3.4% / lap", laps: 16, color: "#ff5252" },
    medium: { grip: "1.74 G", wearRate: "2.1% / lap", laps: 26, color: "#d9b36c" },
    hard: { grip: "1.65 G", wearRate: "1.2% / lap", laps: 40, color: "#ffffff" },
    wet: { grip: "1.45 G (Water Scavenge: 85 L/s)", wearRate: "1.8% / lap", laps: 30, color: "#8fb9d9" },
  };

  const activeCompound = compounds[tireCompound] || compounds.soft;

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "MOTORSPORT PIT WALL & RACE STRATEGY TELEMETRY",
          subtitle: "Live tire degradation models, fuel flow mass, and real-time undercut strategy",
          icon: <Flag size={18} />,
          badge: <NeonHorizonBadge variant="live">RACE LAP 14 / 57 · P1 (+3.42s)</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="LEADER DELTA" value="-3.420s" accentColor="emerald" />
          <NeonHorizonDataCard label="EST. PIT WINDOW" value={`LAP ${pitWindowLap}`} accentColor="gold" />
          <NeonHorizonDataCard label="TIRE LIFE REMAINING" value="68%" accentColor="cyan" />
          <NeonHorizonDataCard label="DRS OVERTAKE PROBABILITY" value="88%" accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pit Strategy (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "TIRE DEGRADATION & STRATEGY SOLVER",
              icon: <Timer size={16} />,
            }}
            className="p-6 flex flex-col gap-5"
          >
            <NeonHorizonSelect
              label="ACTIVE TIRE COMPOUND"
              value={tireCompound}
              onChange={(val) => {
                playHMIClickSound();
                setTireCompound(val);
              }}
              options={[
                { value: "soft", label: "C5 Soft Compound (Red)", sublabel: "Maximum mechanical grip · 16 Lap lifespan" },
                { value: "medium", label: "C3 Medium Compound (Yellow)", sublabel: "Optimum race stint balance · 26 Lap lifespan" },
                { value: "hard", label: "C1 Hard Compound (White)", sublabel: "Maximum durability · 40 Lap lifespan" },
                { value: "wet", label: "Cinturato Full Wet (Cyan)", sublabel: "Heavy standing water · 85 L/s hydroplaning evacuation" },
              ]}
            />

            <NeonHorizonSlider
              label="TARGET PIT STOP WINDOW"
              value={pitWindowLap}
              min={10}
              max={45}
              unit="Lap"
              onChange={setPitWindowLap}
              color="gold"
            />

            {/* Tire Degradation SVG Curve */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <span className="nh-label-caps text-slate-400 text-[10px]">TIRE WEAR CURVE & CLIFF PROJECTION</span>
              <div className="h-32 w-full bg-[#05080f] rounded-xl border border-sky-400/15 p-2">
                <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                  {[20, 50, 80].map((y) => (
                    <line key={y} x1="20" y1={y} x2="380" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  ))}
                  <path
                    d="M 20 20 Q 200 30, 280 50 T 380 95"
                    fill="none"
                    stroke={activeCompound.color}
                    strokeWidth="3"
                  />
                  <circle cx="140" cy="25" r="4" fill="#8fb9d9" />
                  <text x="140" y="15" fill="#8fb9d9" fontSize="8" fontFamily="monospace" textAnchor="middle">CURRENT LAP 14</text>
                </svg>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Pit Radio & Delta (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "PIT-TO-CAR RADIO FEED",
              icon: <Radio size={16} />,
            }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="p-4 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">RACE ENGINEER:</span>
                <span className="text-[10px] nh-font-mono text-slate-400">14:22:04</span>
              </div>
              <p className="text-xs text-slate-200 italic">
                "Box this lap for Hard compound. Push on in-lap, we have a 2.4s undercut buffer to P2."
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0a111e] border border-sky-400/15 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Average Pit Stop Time:</span>
                <span className="text-xs font-bold nh-font-mono text-sky-300">2.18s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Pit Lane Loss Delta:</span>
                <span className="text-xs font-bold nh-font-mono text-amber-300">21.4s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Safety Car Probability:</span>
                <span className="text-xs font-bold nh-font-mono text-emerald-300">32%</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
});

export default NeonMotorsportStudio;
