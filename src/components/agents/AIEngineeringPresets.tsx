import React, { useState } from "react";
import {
  Zap,
  Flag,
  Fuel,
  Flame,
  Gauge,
  Sparkles,
  Bot,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  Layers,
  Wrench,
  ShieldCheck,
  Scale,
} from "lucide-react";
import { useDesign } from "../../state/DesignContext";
import { useToast } from "../ToastSystem";
import { playHMIClickSound, playHMITabSound } from "../../utils/hmiSoundSynth";
import {
  createBaseDesign,
  createV12Hybrid1000HpDesign,
} from "../../sim/vehiclePresets";
import { createGT3SpecRDesign } from "../../sim/gt3SpecRDesign";
import type { VehicleDesign } from "../../sim/types";

export interface AIEngineeringPresetItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  description: string;
  aiRationale: string;
  domain: string;
  agentName: string;
  targetConcept: "track" | "budget" | "luxury" | "balanced";
  metrics: {
    powerHp: number;
    weightKg: number;
    topSpeedKmh: number;
    zeroToSixtySec: number;
    downforceN: number;
    costUsd: number;
    estLapTimeSpa: string;
  };
  keySpecs: string[];
  generator: () => VehicleDesign;
}

export const AI_PRESET_LIBRARY: AIEngineeringPresetItem[] = [
  {
    id: "v12_hybrid_1000hp",
    title: "1,000 HP V12 Hybrid Valkyrie",
    badge: "Hypercar Flagship",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: <Flame size={20} className="text-amber-400 animate-pulse" />,
    description: "6.4L Screaming 9,200 RPM V12 + 180kW Solid-State PHEV Electric Drive generating 1,000 HP total output.",
    aiRationale: "Combines high-RPM atmospheric screaming V12 with instantaneous 800V SiC electric torque fill for zero turbo lag and hypercar dominance.",
    domain: "Powertrain & 800V Hybrid",
    agentName: "Chief Powertrain & EV Agent",
    targetConcept: "track",
    metrics: {
      powerHp: 1000,
      weightKg: 1380,
      topSpeedKmh: 375,
      zeroToSixtySec: 2.15,
      downforceN: 1150,
      costUsd: 285000,
      estLapTimeSpa: "2:04.8",
    },
    keySpecs: [
      "6.4L V12 (9,200 RPM Redline)",
      "180 kW Solid-State PHEV Motor",
      "AWD Dual-Clutch 7-Speed",
      "Carbon Ceramic 410mm Brakes",
    ],
    generator: () => createV12Hybrid1000HpDesign(),
  },
  {
    id: "sprint_race",
    title: "Sprint Race Attack Spec",
    badge: "High Performance",
    badgeColor: "bg-red-500/20 text-red-300 border-red-500/40",
    icon: <Flag size={20} className="text-red-400" />,
    description: "Aggressive aero downforce, ultra-soft slicks, short ratio gearbox & 9000 RPM twin-turbo V8 for sprint domination.",
    aiRationale: "Calibrated for short qualifying heats with maximum brake cooling and 4.10 final drive gearing for blistering corner exit acceleration.",
    domain: "Race Strategy & Aero",
    agentName: "Race Engineer Agent",
    targetConcept: "track",
    metrics: {
      powerHp: 820,
      weightKg: 1260,
      topSpeedKmh: 335,
      zeroToSixtySec: 2.35,
      downforceN: 1420,
      costUsd: 195000,
      estLapTimeSpa: "2:07.4",
    },
    keySpecs: [
      "V8 Twin-Turbo (1.6 Bar Boost)",
      "4.10 Short-Ratio Final Drive",
      "Ultra-Soft Track Slicks",
      "High Downforce Carbon Wing (18°)",
    ],
    generator: () => {
      const v = createBaseDesign("Sprint Race Special", "hypercar", "hypercar");
      v.engine.layout = "v8";
      v.engine.bore = 88;
      v.engine.stroke = 82;
      v.engine.redline = 9000;
      v.engine.rpmLimiter = 9000;
      v.engine.intake = "twin_turbo";
      v.engine.boostPressure = 1.6;
      v.vehicle.tireCompound = "soft";
      v.vehicle.finalDrive = 4.10;
      v.vehicle.aero.wingAngle = 18;
      v.vehicle.aero.splitterLength = 120;
      v.vehicle.brakeType = "carbon_ceramic";
      v.vehicle.brakePadCompound = 0.9;
      return v;
    },
  },
  {
    id: "high_downforce",
    title: "Monaco High Downforce",
    badge: "Technical Circuit",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: <Gauge size={20} className="text-amber-400" />,
    description: "Maximizes ground effect, rear wing AoA, and aggressive splitter for maximum cornering speeds on tight circuits.",
    aiRationale: "Prioritizes lateral cornering Gs (+1.85G) and underbody Venturi suction over straight-line Vmax for technical street circuits.",
    domain: "Aerodynamics & CFD",
    agentName: "AeroDynamics Agent",
    targetConcept: "track",
    metrics: {
      powerHp: 680,
      weightKg: 1310,
      topSpeedKmh: 310,
      zeroToSixtySec: 2.65,
      downforceN: 1850,
      costUsd: 148000,
      estLapTimeSpa: "2:09.1",
    },
    keySpecs: [
      "22° Multi-Element Rear Wing",
      "Ground Effect Venturi Underbody",
      "140mm Aggressive Front Splitter",
      "Double Wishbone Active Suspension",
    ],
    generator: () => {
      const v = createBaseDesign("AeroApex Downforce GT", "upper_mid", "coupe");
      v.engine.layout = "v6";
      v.engine.redline = 8500;
      v.engine.rpmLimiter = 8500;
      v.engine.intake = "twin_turbo";
      v.engine.boostPressure = 1.4;
      v.vehicle.aero.wingAngle = 22;
      v.vehicle.aero.splitterLength = 140;
      v.vehicle.aero.underbody = "ground_effect";
      v.vehicle.tireCompound = "soft";
      v.vehicle.suspensionFront = "double_wishbone";
      v.vehicle.suspensionRear = "multilink";
      return v;
    },
  },
  {
    id: "fuel_efficient",
    title: "EcoStream Hybrid Endurance",
    badge: "Endurance & Eco",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    icon: <Fuel size={20} className="text-emerald-400" />,
    description: "Lean air-fuel ratio tuning, low drag coefficient bodywork, tall final drive ratios, and active hybrid energy harvest.",
    aiRationale: "Maximizes thermal efficiency (43% brake thermal efficiency) with low-drag bodywork and regenerative energy recovery for long endurance stints.",
    domain: "Sustainability & Efficiency",
    agentName: "Sustainability Agent",
    targetConcept: "budget",
    metrics: {
      powerHp: 245,
      weightKg: 1220,
      topSpeedKmh: 235,
      zeroToSixtySec: 5.8,
      downforceN: 210,
      costUsd: 34500,
      estLapTimeSpa: "2:34.5",
    },
    keySpecs: [
      "1.8L I4 Atkinson + 80kW PHEV",
      "14 kWh Liquid-Cooled Battery",
      "2.92 Tall Cruise Final Drive",
      "0.24 Sleek Drag Coeff (Cd)",
    ],
    generator: () => {
      const v = createBaseDesign("EcoStream Hybrid GT", "lower_mid", "sedan");
      v.engine.layout = "i4";
      v.engine.hybridArchitecture = "phev";
      v.engine.hybridMotorPower = 80;
      v.engine.batteryCapacity = 14;
      v.vehicle.aero.bodyShape = 0.95;
      v.vehicle.aero.wingAngle = 2;
      v.vehicle.finalDrive = 2.92;
      v.vehicle.tireCompound = "hard";
      return v;
    },
  },
  {
    id: "balanced_street",
    title: "Balanced Sport GT",
    badge: "Street & Track",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: <Zap size={20} className="text-amber-400" />,
    description: "Perfect equilibrium between daily comfort, reliable cooling margins, manageable production cost, and track capability.",
    aiRationale: "Golden-ratio baseline providing high reliability (>95%), compliant NVH sound deadening, and sharp dynamic response.",
    domain: "Vehicle Architecture",
    agentName: "Chief Vehicle Architect",
    targetConcept: "balanced",
    metrics: {
      powerHp: 460,
      weightKg: 1420,
      topSpeedKmh: 285,
      zeroToSixtySec: 3.6,
      downforceN: 480,
      costUsd: 58000,
      estLapTimeSpa: "2:18.2",
    },
    keySpecs: [
      "3.0L Twin-Turbo V6 (460 HP)",
      "3.55 Balanced Final Drive",
      "Adaptive Damper Suspension",
      "Dual-Zone Luxury Cabin + Slicks",
    ],
    generator: () => {
      const v = createBaseDesign("Apex Sport GT", "upper_mid", "coupe");
      v.engine.layout = "v6";
      v.engine.redline = 7500;
      v.engine.rpmLimiter = 7500;
      v.vehicle.tireCompound = "medium";
      v.vehicle.finalDrive = 3.55;
      v.vehicle.aero.wingAngle = 8;
      return v;
    },
  },
  {
    id: "gt3_spec_r",
    title: "Apex GT3 Spec-R Motorsport",
    badge: "FIA GT3 Homologated",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    icon: <Award size={20} className="text-orange-400" />,
    description: "FIA GT3 Homologated Benchmark engineered for Spa-Francorchamps, Nürburgring Nordschleife, and 24h endurance battles.",
    aiRationale: "Rigid dry-carbon tub chassis with pneumatic sequential dog-ring transmission, center-lock magnesium wheels, and FIA aero balance.",
    domain: "Motorsport Homologation",
    agentName: "Homologation & Race Director",
    targetConcept: "track",
    metrics: {
      powerHp: 620,
      weightKg: 1240,
      topSpeedKmh: 295,
      zeroToSixtySec: 2.8,
      downforceN: 1350,
      costUsd: 350000,
      estLapTimeSpa: "2:15.4",
    },
    keySpecs: [
      "4.0L Flat-Plane V8 (8,500 RPM)",
      "Sequential 6-Speed Dog-Ring Box",
      "Center-Lock Magnesium 18\" Rims",
      "FIA 6-Point Roll Cage & Fuel Cell",
    ],
    generator: () => createGT3SpecRDesign(),
  },
];

interface AIEngineeringPresetsProps {
  onSelectPresetPrompt?: (prompt: string) => void;
  compact?: boolean;
  className?: string;
}

export function AIEngineeringPresets({
  onSelectPresetPrompt,
  compact = false,
  className = "",
}: AIEngineeringPresetsProps) {
  const { setDesign, sim } = useDesign();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const handleApply = (preset: AIEngineeringPresetItem) => {
    playHMIClickSound();
    const newDesign = preset.generator();
    setDesign(newDesign);
    setAppliedId(preset.id);
    setSelectedId(preset.id);

    toast.success(
      `AI Deployed: ${preset.title}`,
      `Loaded complete configuration with ${preset.metrics.powerHp} HP, ${preset.metrics.weightKg} kg, and active ${preset.domain} calibration.`
    );

    setTimeout(() => {
      setAppliedId(null);
    }, 3500);
  };

  const handleAskAI = (preset: AIEngineeringPresetItem) => {
    playHMIClickSound();
    if (onSelectPresetPrompt) {
      onSelectPresetPrompt(
        `Please analyze and customize the "${preset.title}" blueprint for our target concept. What are the key tradeoffs in power, cooling, and lap time?`
      );
    }
  };

  return (
    <div className={`w-full flex flex-col gap-4 ${className}`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-900/40 border border-amber-800/30 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-50 uppercase tracking-wider">
                AI Engineering Presets & Architect Templates
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                6 NEURAL TEMPLATES
              </span>
            </div>
            <p className="text-xs text-amber-200/60 mt-0.5">
              1-click autonomous setups backed by multi-agent powertrain, chassis, and aero solvers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-amber-200/60">
          <Bot size={14} className="text-amber-400" />
          <span>Multi-Agent Verified</span>
        </div>
      </div>

      {/* Grid of Presets */}
      <div className={`grid gap-4 ${compact ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
        {AI_PRESET_LIBRARY.map((preset) => {
          const isApplied = appliedId === preset.id;
          const hpDelta = preset.metrics.powerHp - (sim.peakPower || 500);
          const weightDelta = preset.metrics.weightKg - (sim.weight || 1400);

          return (
            <div
              key={preset.id}
              className={`relative flex flex-col justify-between p-5 rounded-2xl transition-all duration-300 backdrop-blur-xl border ${
                isApplied
                  ? "bg-amber-950/40 border-amber-400/80 shadow-[0_0_30px_rgba(34,211,238,0.3)] ring-1 ring-amber-400"
                  : "bg-amber-900/40 border-amber-800/30 hover:border-amber-700/30 hover:shadow-2xl"
              }`}
            >
              {/* Top Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-800/30 text-amber-50">
                      {preset.icon}
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border mb-1 ${preset.badgeColor}`}>
                        {preset.badge}
                      </span>
                      <h4 className="text-sm font-bold text-amber-50 leading-tight">
                        {preset.title}
                      </h4>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-amber-100/80 leading-relaxed mb-3">
                  {preset.description}
                </p>

                {/* AI Rationale Box */}
                <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-800/30 mb-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Bot size={12} /> {preset.agentName}
                    </span>
                    <span className="text-amber-300/50">{preset.domain}</span>
                  </div>
                  <p className="text-[11px] text-amber-200/60 italic leading-snug">
                    "{preset.aiRationale}"
                  </p>
                </div>

                {/* Performance Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 mb-3.5 text-center font-mono">
                  <div>
                    <div className="text-[9px] text-amber-300/50 uppercase">Power</div>
                    <div className="text-xs font-bold text-amber-300">{preset.metrics.powerHp} HP</div>
                    <div className={`text-[9px] ${hpDelta >= 0 ? "text-emerald-400" : "text-amber-300/50"}`}>
                      {hpDelta >= 0 ? `+${hpDelta}` : hpDelta} vs curr
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-amber-300/50 uppercase">Weight</div>
                    <div className="text-xs font-bold text-amber-300">{preset.metrics.weightKg} kg</div>
                    <div className={`text-[9px] ${weightDelta <= 0 ? "text-emerald-400" : "text-amber-300/50"}`}>
                      {weightDelta <= 0 ? `${weightDelta}` : `+${weightDelta}`} vs curr
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-amber-300/50 uppercase">0-60 MPH</div>
                    <div className="text-xs font-bold text-amber-300">{preset.metrics.zeroToSixtySec}s</div>
                    <div className="text-[9px] text-amber-300/50">AWD Launch</div>
                  </div>
                </div>

                {/* Key Subsystems Specs */}
                <div className="space-y-1 mb-4">
                  {preset.keySpecs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-amber-200/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-amber-800/30">
                <button
                  onClick={() => handleApply(preset)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    isApplied
                      ? "bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-cyan-500/20"
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>APPLIED CONFIG</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>AI DEPLOY SETUP</span>
                    </>
                  )}
                </button>

                {onSelectPresetPrompt && (
                  <button
                    onClick={() => handleAskAI(preset)}
                    title="Ask AI to customize this preset"
                    className="p-2 rounded-xl bg-amber-950/80 border border-amber-800/30 text-amber-200/60 hover:text-amber-300 hover:border-amber-500/40 transition-all cursor-pointer"
                  >
                    <Bot size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
