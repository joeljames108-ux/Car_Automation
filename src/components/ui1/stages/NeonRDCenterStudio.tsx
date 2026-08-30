import React, { useState } from "react";
import {
  FlaskConical,
  Sparkles,
  Zap,
  Layers,
  Sliders,
  CheckCircle2,
  Lock,
  Award,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";

export function NeonRDCenterStudio() {
  const { sim, design } = useDesign();

  const [monthlyBudgetM, setMonthlyBudgetM] = useState(4.5); // $M/mo
  const [unlockedTechs, setUnlockedTechs] = useState<string[]>(["active_aero", "sic_inverters"]);

  const techTree = [
    { id: "active_aero", name: "Morphing Carbon Elastic Airfoils", tier: "Tier 1", cost: "$12M", impact: "+18% Aero Efficiency", desc: "Shape-memory alloy flexures replace drag-inducing hinges" },
    { id: "sic_inverters", name: "Silicon-Carbide 800V Micro-Inverters", tier: "Tier 1", cost: "$18M", impact: "+6% Energy Conversion", desc: "99.2% switching efficiency with zero thermal throttling" },
    { id: "solid_state", name: "Solid-State Ceramic Nanotube Battery", tier: "Tier 2", cost: "$35M", impact: "+40% Energy Density", desc: "Eliminates flammable liquid electrolyte for 390 Wh/kg pack" },
    { id: "laser_sintered", name: "3D Laser-Sintered Titanium Rods", tier: "Tier 2", cost: "$22M", impact: "-24% Reciprocating Mass", desc: "Hollow-core titanium connecting rods rev to 11,500 RPM" },
    { id: "neural_grip", name: "Neural Predictive Traction Surface Scan", tier: "Tier 3", cost: "$45M", impact: "+0.15 Peak Cornering G", desc: "Predicts micro-asphalt friction 50ms ahead using LiDAR spectral reflectance" },
  ];

  const handleToggleUnlock = (id: string) => {
    playHMIClickSound();
    setUnlockedTechs((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "ADVANCED R&D INNOVATION & PATENT LAB",
          subtitle: "Future hypercar technology trees, material science patents, and quantum telemetry",
          icon: <FlaskConical size={18} />,
          badge: <NeonHorizonBadge variant="live">R&D MATURITY: LEVEL 4</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="MONTHLY R&D BUDGET" value={`$${monthlyBudgetM.toFixed(1)}M`} accentColor="cyan" />
          <NeonHorizonDataCard label="ACTIVE PATENTS" value="38 GLOBAL" accentColor="gold" />
          <NeonHorizonDataCard label="UNLOCKED TECHS" value={`${unlockedTechs.length} / 5`} accentColor="emerald" />
          <NeonHorizonDataCard label="INNOVATION VELOCITY" value="96.4 pts" accentColor="magenta" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Tech Tree (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "NEXT-GEN TECHNOLOGY RESEARCH TREE",
              icon: <Layers size={16} />,
            }}
            className="p-6 flex flex-col gap-3"
          >
            {techTree.map((tech) => {
              const isUnlocked = unlockedTechs.includes(tech.id);
              return (
                <div
                  key={tech.id}
                  onClick={() => handleToggleUnlock(tech.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
 isUnlocked
 ? "bg-amber-500/20 border-amber-500/30 text-sky-200"
 : "bg-amber-950/60 border-white/10 opacity-75 hover:opacity-100 hover:border-sky-400/25"
 }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isUnlocked ? (
                        <CheckCircle2 size={16} className="text-amber-400" />
                      ) : (
                        <Lock size={16} className="text-slate-500" />
                      )}
                      <span className="text-xs font-bold text-slate-100">{tech.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs nh-font-mono text-emerald-300 font-bold">{tech.impact}</span>
                      <NeonHorizonBadge variant={isUnlocked ? "cyan" : "neutral"} size="xs">
                        {tech.tier}
                      </NeonHorizonBadge>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pl-6">{tech.desc}</p>
                </div>
              );
            })}
          </NeonHorizonGlassPanel>
        </div>

        {/* Right R&D Budget & Patent Portfolio (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "R&D BUDGET & VELOCITY",
              icon: <Sliders size={16} />,
            }}
            className="p-6 flex flex-col gap-5"
          >
            <NeonHorizonSlider
              label="MONTHLY R&D CAPITAL ALLOCATION"
              value={monthlyBudgetM}
              min={1.0}
              max={10.0}
              step={0.5}
              unit="$M / mo"
              formatValue={(v) => `$${v.toFixed(1)}M`}
              onChange={setMonthlyBudgetM}
              color="cyan"
            />

            <div className="p-4 rounded-xl bg-amber-950/60 border border-sky-400/15 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Annual R&D Investment:</span>
                <span className="text-xs font-bold nh-font-mono text-amber-300">
                  ${(monthlyBudgetM * 12).toFixed(1)}M
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Breakthrough Acceleration:</span>
                <span className="text-xs font-bold nh-font-mono text-emerald-300">+35% Faster</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">IP Valuation:</span>
                <span className="text-xs font-bold nh-font-mono text-amber-300">$185M</span>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>
    </div>
  );
}
