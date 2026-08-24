import React, { useState } from "react";
import {
  Trophy,
  Activity,
  TrendingUp,
  DollarSign,
  Car,
  CheckCircle2,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonCompetitorRadar() {
  const { sim } = useDesign();

  const [selectedRival, setSelectedRival] = useState<string>("sf90");

  const rivals = [
    { id: "sf90", name: "Ferrari SF90 Stradale", power: "986 HP", weight: "1,570 kg", topSpeed: "340 km/h", zeroSixty: "2.5s", price: "$625k" },
    { id: "p918", name: "Porsche 918 Spyder", power: "887 HP", weight: "1,675 kg", topSpeed: "345 km/h", zeroSixty: "2.6s", price: "$845k" },
    { id: "jesko", name: "Koenigsegg Jesko Attack", power: "1,600 HP", weight: "1,420 kg", topSpeed: "480 km/h", zeroSixty: "2.5s", price: "$3.0M" },
    { id: "senna", name: "McLaren Senna GTR", power: "814 HP", weight: "1,188 kg", topSpeed: "335 km/h", zeroSixty: "2.8s", price: "$1.4M" },
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "HYPERCAR BENCHMARK RADAR & MARKET POSITIONING",
          subtitle: "Multi-axis capability comparison against Tier-1 exotic hypercar competitors",
          icon: <Trophy size={18} />,
          badge: <NeonHorizonBadge variant="live">COMPETITIVE LEAD: +14%</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="POWER ADVANTAGE" value={`+${Math.max(0, sim.peakPower - 850)} HP`} accentColor="cyan" />
          <NeonHorizonDataCard label="MASS DELTA" value={`${sim.weight - 1450 > 0 ? "+" : ""}${sim.weight - 1450} kg`} accentColor="magenta" />
          <NeonHorizonDataCard label="EST. LAP LEAD" value="-1.24s" accentColor="emerald" />
          <NeonHorizonDataCard label="PRICE / VALUE RATIO" value="94.2" accentColor="gold" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Radar SVG Spider Chart (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "6-AXIS RADAR CAPABILITY POLYGON",
              icon: <Activity size={16} />,
            }}
            className="p-6 flex flex-col items-center justify-center relative"
          >
            <div className="h-64 w-full flex items-center justify-center">
              <svg viewBox="0 0 300 300" className="w-full h-full max-w-[280px]">
                <defs>
                  <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Concentric Polygons */}
                {[0.25, 0.5, 0.75, 1.0].map((r, i) => (
                  <polygon
                    key={i}
                    points="150,50 236,100 236,200 150,250 64,200 64,100"
                    transform={`scale(${r})`}
                    transform-origin="150 150"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                ))}

                {/* Radar Area (Active Vehicle) */}
                <polygon
                  points="150,65 225,110 215,195 150,235 75,190 80,105"
                  fill="url(#radarGrad)"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />

                {/* Radar Area (Competitor) */}
                <polygon
                  points="150,85 210,120 200,185 150,220 95,180 90,120"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              </svg>
            </div>

            <div className="flex items-center justify-center gap-6 border-t border-white/10 pt-3 text-xs nh-font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-300" />
                <span className="text-slate-200">Your Vehicle</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-slate-200">Selected Rival</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Right Competitor Profiles (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "SELECT RIVAL VEHICLE",
              icon: <Car size={16} />,
            }}
            className="p-6 flex flex-col gap-3"
          >
            {rivals.map((r) => {
              const isSelected = selectedRival === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    playHMIClickSound();
                    setSelectedRival(r.id);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
 isSelected
 ? "bg-[#091838] border-sky-400/40"
 : "bg-[#060e22] border-white/10 hover:border-sky-400/25"
 }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{r.name}</span>
                    <span className="text-xs nh-font-mono font-bold text-amber-300">{r.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] nh-font-mono text-slate-400">
                    <span>{r.power} · {r.weight}</span>
                    <span className="text-sky-300">0-60: {r.zeroSixty}</span>
                  </div>
                </div>
              );
            })}
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
