import React, { useState } from "react";
import {
  Layers,
  Zap,
  Gauge,
  Activity,
  Trophy,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Sliders,
  ChevronRight,
  TrendingUp,
  Car,
} from "lucide-react";
import { useDesign } from "../../../state/DesignContext";
import { useCompany } from "../../../state/CompanyContext";
import { playHMIClickSound, playHMITabSound } from "../../../utils/hmiSoundSynth";
import { NeonHorizonGlassPanel } from "../design/NeonHorizonGlassPanel";
import { NeonHorizonButton } from "../design/NeonHorizonButton";
import { NeonHorizonBadge } from "../design/NeonHorizonBadge";
import { NeonHorizonSelect } from "../design/NeonHorizonSelect";
import { NeonHorizonDataCard } from "../design/NeonHorizonDataCard";
import { VehicleStatsPanel } from "../hud/VehicleStatsPanel";
import type { Stage } from "../../StageSwitcher";

export interface NeonCommandCenterProps {
  onSelectStage?: (stage: Stage) => void;
}

export const NeonCommandCenter: React.FC<NeonCommandCenterProps> = ({ onSelectStage }) => {
  const { design, sim, updateEngine, updateAero, updateVehicle } = useDesign();
  const { company } = useCompany();

  const [platformTier, setPlatformTier] = useState<string>("luxury");
  const [chassisFrame, setChassisFrame] = useState<string>("carbon_tub");
  const [activePreset, setActivePreset] = useState<string>("sprint");

  const presets = [
    {
      id: "sprint",
      title: "Sprint Race Setup",
      category: "High Performance",
      accent: "cyan" as const,
      power: "720 hp",
      weight: "1,180 kg",
      zeroToSixty: "2.8s",
      desc: "Maximum twin-turbo boost, aggressive cam profiles, lightweight forged monocoque.",
      onApply: () => {
        updateEngine({ intake: "twin_turbo", boostPressure: 1.8, rpmLimiter: 8500 });
        updateVehicle({ chassis: "carbon_tub", driveType: "awd" });
      },
    },
    {
      id: "track",
      title: "High Downforce Track",
      category: "Technical Circuit",
      accent: "magenta" as const,
      power: "640 hp",
      weight: "1,090 kg",
      zeroToSixty: "2.9s",
      desc: "Optimized multi-element aero wings, active ground-effect tunnels, stiff anti-roll bars.",
      onApply: () => {
        updateEngine({ intake: "twin_turbo", rpmLimiter: 9000 });
        updateAero({ wingAngle: 28, splitterLength: 80, diffuserAngle: 16 });
      },
    },
    {
      id: "eco",
      title: "Fuel Efficient GT",
      category: "Endurance & Eco",
      accent: "emerald" as const,
      power: "480 hp",
      weight: "1,350 kg",
      zeroToSixty: "3.8s",
      desc: "High thermal efficiency Atkinson combustion cycle, regenerative MGU-K hybrid storage.",
      onApply: () => {
        updateEngine({ intake: "turbo_single", boostPressure: 1.1, rpmLimiter: 6800 });
        updateAero({ wingAngle: 8, splitterLength: 30, diffuserAngle: 6 });
      },
    },
    {
      id: "street",
      title: "Balanced Sport GT",
      category: "Street & Sport",
      accent: "gold" as const,
      power: "520 hp",
      weight: "1,420 kg",
      zeroToSixty: "3.4s",
      desc: "Versatile daily road drivability, compliant adaptive dampers, refined twin-turbo V8.",
      onApply: () => {
        updateEngine({ intake: "twin_turbo", boostPressure: 1.3, rpmLimiter: 7500 });
        updateVehicle({ chassis: "aluminum_spaceframe", driveType: "rwd" });
      },
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    playHMIClickSound();
    setActivePreset(preset.id);
    preset.onApply();
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100 animate-nh-materialize">
      {/* =========================================================================
          SECTION 1: QUICK START: SELECT A PRESET (MATCHING REFERENCE IMAGE 1)
          ========================================================================= */}
      <NeonHorizonGlassPanel
        variant="window"
        glow="none"
        corners="reticle"
        header={{
          title: "QUICK START: SELECT A PRESET",
          subtitle: "Pre-engineered powertrain & aerodynamic baseline configurations",
          icon: <Sparkles size={16} />,
        }}
        className="p-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {presets.map((p) => {
            const isSelected = activePreset === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 cursor-pointer select-none ${
                  isSelected
                    ? "bg-[#091838]/90 border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] scale-[1.02]"
                    : "bg-[#050b18]/75 border-white/10 hover:border-cyan-500/40 hover:bg-[#071228]/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <NeonHorizonBadge variant={p.accent} size="xs">
                      {p.category}
                    </NeonHorizonBadge>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-nh-pulse-dot" />
                    )}
                  </div>
                  <h4 className="text-sm font-bold nh-font-headline text-slate-100 mb-1">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {p.desc}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 border-t border-white/10 pt-2.5 nh-font-mono text-center">
                  <div className="bg-black/30 p-1.5 rounded-lg">
                    <div className="text-[8px] text-slate-400">POWER</div>
                    <div className="text-xs font-bold text-cyan-300">{p.power}</div>
                  </div>
                  <div className="bg-black/30 p-1.5 rounded-lg">
                    <div className="text-[8px] text-slate-400">WEIGHT</div>
                    <div className="text-xs font-bold text-sky-200">{p.weight}</div>
                  </div>
                  <div className="bg-black/30 p-1.5 rounded-lg">
                    <div className="text-[8px] text-slate-400">0-60</div>
                    <div className="text-xs font-bold text-emerald-300">{p.zeroToSixty}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </NeonHorizonGlassPanel>

      {/* =========================================================================
          SECTION 2: PLATFORM & CHASSIS CONFIGURATION (REFERENCE IMAGE 1 CENTER)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Platform Configuration Card */}
        <div className="lg:col-span-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "PLATFORM & CHASSIS CONFIGURATION",
              icon: <Layers size={16} />,
            }}
            className="p-5 flex flex-col gap-4"
          >
            {/* Select Platform Tier Segmented Control */}
            <div className="flex flex-col gap-1.5">
              <span className="nh-label-caps text-slate-400 text-[10px]">
                SELECT PLATFORM TIER
              </span>
              <div className="grid grid-cols-5 gap-1 p-1 bg-black/40 rounded-xl border border-white/10 text-center">
                {[
                  { id: "budget", label: "Budget" },
                  { id: "mid", label: "Mid-Range" },
                  { id: "premium", label: "Premium" },
                  { id: "luxury", label: "Luxury" },
                  { id: "ultra", label: "Ultra" },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => {
                      playHMIClickSound();
                      setPlatformTier(tier.id);
                    }}
                    className={`py-1.5 rounded-lg text-[10px] nh-font-mono font-bold transition-all cursor-pointer ${
                      platformTier === tier.id
                        ? "bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Chassis Frame Dropdown */}
            <NeonHorizonSelect
              label="SELECT CHASSIS FRAME"
              value={chassisFrame}
              onChange={setChassisFrame}
              options={[
                { value: "carbon_tub", label: "Carbon Fiber Monocoque Tub", sublabel: "74 kNm/deg · 112 kg" },
                { value: "titanium_spaceframe", label: "Titanium Alloy Spaceframe", sublabel: "58 kNm/deg · 145 kg" },
                { value: "aluminum_honeycomb", label: "Aluminum Extruded Honeycomb", sublabel: "42 kNm/deg · 185 kg" },
                { value: "steel_monocoque", label: "Hydroformed High-Strength Steel", sublabel: "28 kNm/deg · 240 kg" },
              ]}
            />

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#081226]/80 border border-cyan-500/20">
                <span className="nh-label-caps text-slate-400 text-[9px]">TORSIONAL RIGIDITY</span>
                <div className="text-base font-bold nh-font-headline text-cyan-200 mt-0.5">
                  74.0 <span className="text-[10px] nh-font-mono text-slate-400">kNm/°</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#081226]/80 border border-cyan-500/20">
                <span className="nh-label-caps text-slate-400 text-[9px]">CHASSIS MASS FACTOR</span>
                <div className="text-base font-bold nh-font-headline text-emerald-300 mt-0.5">
                  0.15 <span className="text-[10px] nh-font-mono text-slate-400">(Ultralight)</span>
                </div>
              </div>
            </div>
          </NeonHorizonGlassPanel>
        </div>

        {/* Engine Power / Torque Curve Dyno Chart */}
        <div className="lg:col-span-6">
          <NeonHorizonGlassPanel
            variant="primary"
            corners="reticle"
            header={{
              title: "POWERTRAIN TORQUE & HORSEPOWER DYNO SWEEP",
              icon: <Zap size={16} />,
              badge: (
                <NeonHorizonBadge variant="live">
                  {sim.peakPower} HP @ {sim.peakPowerRpm} RPM
                </NeonHorizonBadge>
              ),
            }}
            className="p-5 flex flex-col justify-between"
          >
            <div className="h-44 w-full relative flex items-center justify-center">
              <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="pwrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="tqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffd740" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ffd740" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[30, 70, 110, 150].map((y) => (
                  <line key={y} x1="20" y1={y} x2="380" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                ))}

                {/* Power curve */}
                <path
                  d="M 30 145 C 80 130, 140 100, 200 65 C 260 35, 310 25, 370 20 L 370 150 L 30 150 Z"
                  fill="url(#pwrGrad)"
                />
                <path
                  d="M 30 145 C 80 130, 140 100, 200 65 C 260 35, 310 25, 370 20"
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="2.5"
                />

                {/* Torque curve */}
                <path
                  d="M 30 120 C 70 60, 130 45, 200 48 C 270 52, 320 80, 370 110 L 370 150 L 30 150 Z"
                  fill="url(#tqGrad)"
                />
                <path
                  d="M 30 120 C 70 60, 130 45, 200 48 C 270 52, 320 80, 370 110"
                  fill="none"
                  stroke="#ffd740"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs nh-font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]" />
                <span className="text-slate-300">Horsepower (HP)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffd740]" />
                <span className="text-slate-300">Torque (Nm)</span>
              </div>
              {onSelectStage && (
                <NeonHorizonButton
                  variant="ghost"
                  size="xs"
                  iconRight={<ChevronRight size={12} />}
                  onClick={() => onSelectStage("engine")}
                >
                  Tune ECU
                </NeonHorizonButton>
              )}
            </div>
          </NeonHorizonGlassPanel>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: VEHICLE STATS 6-GRID MATRIX (MATCHING REFERENCE IMAGE 1)
          ========================================================================= */}
      <VehicleStatsPanel
        totalWeight={sim.weight}
        powerToWeight={(sim.peakPower / (sim.weight || 1000)) * 1000}
        topSpeed={sim.topSpeed}
        zeroToSixty={sim.accel0_60}
        quarterMile={sim.quarterMile}
        braking100To0={sim.brakingDist}
      />
    </div>
  );
};
