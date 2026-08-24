import React, { useState } from "react";
import {
  Sliders,
  Flame,
  Zap,
  Activity,
  Gauge,
  Sparkles,
  RotateCcw,
  BarChart2,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonSelect } from "../design/NeonHorizonSelect";
import { NeonHorizonSlider } from "../design/NeonHorizonSlider";
import { NeonHorizonToggle } from "../design/NeonHorizonToggle";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import { PowertrainDynoStudio } from "../../powertrain/PowertrainDynoStudio";

export function NeonDynoEcuStudio() {
  const { design, sim, updateEngine } = useDesign();

  const [activeTab, setActiveTab] = useState<"standalone_dyno" | "quick_tune">("standalone_dyno");
  const [octane, setOctane] = useState<string>("e85");
  const [antiLag, setAntiLag] = useState(true);
  const [boostTarget, setBoostTarget] = useState(1.65); // BAR
  const [timingAdvance, setTimingAdvance] = useState(26); // deg BTDC

  const octaneMultipliers: Record<string, number> = {
    regular_91: 0.92,
    super_98: 1.0,
    e85: 1.08,
    race_110: 1.15,
  };

  const currentMultiplier = octaneMultipliers[octane] || 1.0;
  const tunedHp = Math.round(sim.peakPower * currentMultiplier * (boostTarget / 1.4));
  const tunedTorque = Math.round(sim.peakTorque * currentMultiplier * (boostTarget / 1.4));

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* Header */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="cyan"
        corners="reticle"
        header={{
          title: "STANDALONE ECU & 3D CALIBRATION WORKBENCH",
          subtitle: "Closed-loop wideband lambda tuning, anti-lag launch control, and octane mapping",
          icon: <Zap size={18} />,
          badge: <NeonHorizonBadge variant="live">ECU MAP 01 LOADED</NeonHorizonBadge>,
        }}
        className="p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <NeonHorizonDataCard label="CALIBRATED PEAK HP" value={tunedHp} unit="HP" accentColor="cyan" />
          <NeonHorizonDataCard label="CALIBRATED TORQUE" value={tunedTorque} unit="Nm" accentColor="gold" />
          <NeonHorizonDataCard label="TARGET BOOST" value={boostTarget.toFixed(2)} unit="BAR" accentColor="magenta" />
          <NeonHorizonDataCard label="KNOCK RESISTANCE" value={octane === "e85" || octane === "race_110" ? "EXTREME" : "NOMINAL"} accentColor="emerald" />
        </div>
      </NeonHorizonGlassPanel>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: "standalone_dyno" as const, label: "Live Powertrain Dyno Studio", icon: <Gauge size={14} /> },
          { id: "quick_tune" as const, label: "Quick ECU Parameter Maps", icon: <Sliders size={14} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playHMITabSound();
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs nh-font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
 isActive
 ? "bg-sky-400/20 text-sky-200 border border-sky-400/30"
 : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
 }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* View 1: Embedded Powertrain Dyno Studio */}
      {activeTab === "standalone_dyno" && (
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#0a111e]">
          <PowertrainDynoStudio />
        </div>
      )}

      {/* View 2: Quick Tune Grid */}
      {activeTab === "quick_tune" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Tuning (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <NeonHorizonGlassPanel
              variant="primary"
              corners="reticle"
              header={{
                title: "ECU REMAPPING & FUEL MAPS",
                subtitle: "Select fuel octane map and target boost levels",
                icon: <Sliders size={16} />,
              }}
              className="p-6 flex flex-col gap-5"
            >
              <NeonHorizonSelect
                label="FUEL OCTANE MAPPING"
                value={octane}
                onChange={(val) => setOctane(val)}
                options={[
                  { value: "regular_91", label: "91 Octane (Pump Gas)", sublabel: "Baseline ignition advance map" },
                  { value: "super_98", label: "98 Octane (Premium V-Power)", sublabel: "Zero knock under sustained load" },
                  { value: "e85", label: "E85 Bio-Ethanol (85% Ethanol)", sublabel: "High latent heat of vaporization · +8% HP" },
                  { value: "race_110", label: "110 Octane Le Mans Lead-Free Racing Fuel", sublabel: "Maximum cylinder pressure yield · +15% HP" },
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NeonHorizonSlider
                  label="TARGET BOOST PRESSURE"
                  value={boostTarget}
                  min={0.8}
                  max={2.6}
                  step={0.05}
                  unit="BAR"
                  onChange={setBoostTarget}
                  color="magenta"
                />
                <NeonHorizonSlider
                  label="IGNITION ADVANCE"
                  value={timingAdvance}
                  min={14}
                  max={38}
                  unit="° BTDC"
                  onChange={setTimingAdvance}
                  color="gold"
                />
              </div>

              <NeonHorizonToggle
                label="RALLY ANTI-LAG SYSTEM (ALS)"
                checked={antiLag}
                onChange={setAntiLag}
              />
            </NeonHorizonGlassPanel>
          </div>

          {/* Right Dyno Stats (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <NeonHorizonGlassPanel
              variant="window"
              glow="cyan"
              corners="reticle"
              header={{
                title: "CALIBRATED OUTPUT TELEMETRY",
                subtitle: `Octane: ${octane.toUpperCase()} · Boost: ${boostTarget} BAR`,
                icon: <Activity size={16} />,
              }}
              className="p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-xs text-slate-300 font-bold">HORSEPOWER GAIN</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">+{tunedHp - sim.peakPower} HP</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-xs text-slate-300 font-bold">TORQUE GAIN</span>
                  <span className="text-sm font-mono font-bold text-sky-400">+{tunedTorque - sim.peakTorque} Nm</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-xs text-slate-300 font-bold">TURBO LAG INDEX</span>
                  <span className="text-sm font-mono font-bold text-yellow-400">{antiLag ? "0.08s (ALS ON)" : "0.34s"}</span>
                </div>
              </div>
            </NeonHorizonGlassPanel>
          </div>
        </div>
      )}
    </div>
  );
}
