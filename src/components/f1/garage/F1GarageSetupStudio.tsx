// ============================================================================
// F1 GARAGE & CIRCUIT SETUP WORKSTATION — MOTORSPORT OPTIMIZER & TELEMETRY
// ============================================================================

import React, { useState, useMemo, memo } from "react";
import { useF1AssemblyStore } from "../../../sim/f1/state/f1AssemblyStore";
import { F1_CIRCUITS, type F1Circuit } from "../../../sim/f1/season/f1Calendar";
import {
  MotorsportSetupOptimizer,
  type OptimizationGoal,
  type MotorsportOptimizationResult,
  type CircuitOptimizerProfile,
} from "../../../sim/motorsport/motorsportSetupOptimizer";
import {
  SlidersHorizontal,
  Flag,
  Gauge,
  Wind,
  Disc,
  Activity,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Award,
  ShieldAlert,
  Sun,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  Target,
  BarChart3,
  Cpu,
  TrendingUp,
  Zap,
} from "lucide-react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

interface F1GarageSetupStudioProps {
  onStartRace?: (circuit: F1Circuit, setup: F1RaceWeekendSetup) => void;
  onBackToAssembly?: () => void;
}

export interface F1RaceWeekendSetup {
  frontWingFlapAngleDeg: number;
  rearWingFlapAngleDeg: number;
  frontRideHeightMm: number;
  rearRideHeightMm: number;
  antiRollBarFrontIndex: number;
  antiRollBarRearIndex: number;
  differentialOnThrottlePercent: number;
  differentialOffThrottlePercent: number;
  brakeBiasPercentFront: number;
  selectedTireCompound: "SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET";
  ersDeploymentStrategy: "QUALIFYING_HOTLAP" | "BALANCED_RACE" | "ATTACK_OVERTAKE" | "ENERGY_SAVE";
}

export type F1WeatherCondition = "DRY_OPTIMAL" | "DAMP_TRACK" | "WET_RAIN" | "TORRENTIAL_MONSOON";

const F1_SETUP_PRESETS: Record<string, { label: string; setup: Partial<F1RaceWeekendSetup> }> = {
  baseline: {
    label: "FIA Baseline Balanced",
    setup: {
      frontWingFlapAngleDeg: 28,
      rearWingFlapAngleDeg: 34,
      frontRideHeightMm: 30,
      rearRideHeightMm: 38,
      antiRollBarFrontIndex: 6,
      antiRollBarRearIndex: 4,
      differentialOnThrottlePercent: 65,
      differentialOffThrottlePercent: 50,
      brakeBiasPercentFront: 54.5,
      selectedTireCompound: "SOFT",
      ersDeploymentStrategy: "QUALIFYING_HOTLAP",
    },
  },
  monza_low_drag: {
    label: "Monza V-Max Low-Drag",
    setup: {
      frontWingFlapAngleDeg: 18,
      rearWingFlapAngleDeg: 20,
      frontRideHeightMm: 26,
      rearRideHeightMm: 32,
      antiRollBarFrontIndex: 8,
      antiRollBarRearIndex: 6,
      differentialOnThrottlePercent: 75,
      differentialOffThrottlePercent: 55,
      brakeBiasPercentFront: 53.5,
      selectedTireCompound: "MEDIUM",
      ersDeploymentStrategy: "ATTACK_OVERTAKE",
    },
  },
  monaco_max_downforce: {
    label: "Monaco Max Downforce",
    setup: {
      frontWingFlapAngleDeg: 38,
      rearWingFlapAngleDeg: 44,
      frontRideHeightMm: 34,
      rearRideHeightMm: 44,
      antiRollBarFrontIndex: 4,
      antiRollBarRearIndex: 3,
      differentialOnThrottlePercent: 55,
      differentialOffThrottlePercent: 45,
      brakeBiasPercentFront: 56.0,
      selectedTireCompound: "SOFT",
      ersDeploymentStrategy: "QUALIFYING_HOTLAP",
    },
  },
  silverstone_high_speed: {
    label: "Silverstone High-G Aero",
    setup: {
      frontWingFlapAngleDeg: 32,
      rearWingFlapAngleDeg: 36,
      frontRideHeightMm: 28,
      rearRideHeightMm: 36,
      antiRollBarFrontIndex: 7,
      antiRollBarRearIndex: 5,
      differentialOnThrottlePercent: 68,
      differentialOffThrottlePercent: 50,
      brakeBiasPercentFront: 54.0,
      selectedTireCompound: "HARD",
      ersDeploymentStrategy: "BALANCED_RACE",
    },
  },
  spa_wet_compromise: {
    label: "Spa Wet / Intermediate",
    setup: {
      frontWingFlapAngleDeg: 34,
      rearWingFlapAngleDeg: 38,
      frontRideHeightMm: 38,
      rearRideHeightMm: 48,
      antiRollBarFrontIndex: 4,
      antiRollBarRearIndex: 3,
      differentialOnThrottlePercent: 60,
      differentialOffThrottlePercent: 40,
      brakeBiasPercentFront: 52.5,
      selectedTireCompound: "INTERMEDIATE",
      ersDeploymentStrategy: "BALANCED_RACE",
    },
  },
};

export const F1GarageSetupStudio: React.FC<F1GarageSetupStudioProps> = memo(function F1GarageSetupStudio({
  onStartRace,
  onBackToAssembly,
}) {
  const { metrics, homologationPassportId } = useF1AssemblyStore();
  const [selectedCircuitIndex, setSelectedCircuitIndex] = useState(0);
  const activeCircuit = F1_CIRCUITS[selectedCircuitIndex];

  const [weather, setWeather] = useState<F1WeatherCondition>("DRY_OPTIMAL");
  const [optimizationGoal, setOptimizationGoal] = useState<OptimizationGoal>("QUALIFYING_MAX_PACE");
  const [showOptimizerModal, setShowOptimizerModal] = useState(false);
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<"aero" | "tire" | "ers">("aero");

  const [setup, setSetup] = useState<F1RaceWeekendSetup>({
    frontWingFlapAngleDeg: 28,
    rearWingFlapAngleDeg: 34,
    frontRideHeightMm: 30,
    rearRideHeightMm: 38,
    antiRollBarFrontIndex: 6,
    antiRollBarRearIndex: 4,
    differentialOnThrottlePercent: 65,
    differentialOffThrottlePercent: 50,
    brakeBiasPercentFront: 54.5,
    selectedTireCompound: "SOFT",
    ersDeploymentStrategy: "QUALIFYING_HOTLAP",
  });

  // Calculate dynamic circuit efficiency score
  const isHighSpeedTrack = activeCircuit.downforceRequirement === "MEDIUM" || activeCircuit.downforceRequirement === "LOW";
  const aeroEfficiencyIndex =
    metrics.totalDragAt250KmhKg > 0
      ? (metrics.totalDownforceAt250KmhKg / metrics.totalDragAt250KmhKg).toFixed(2)
      : "3.45";

  // Optimizer Result Calculation
  const optimizerResult: MotorsportOptimizationResult = useMemo(() => {
    const downforceReq: CircuitOptimizerProfile["downforceRequirement"] =
      activeCircuit.downforceRequirement === "LOW"
        ? "LOW"
        : activeCircuit.downforceRequirement === "HIGH"
        ? "HIGH"
        : "BALANCED";

    const circuitProfile: CircuitOptimizerProfile = {
      name: activeCircuit.name,
      totalLengthM: activeCircuit.lapLengthMeters,
      longestStraightM:
        activeCircuit.downforceRequirement === "LOW"
          ? 1120
          : activeCircuit.downforceRequirement === "HIGH"
          ? 480
          : 780,
      cornerCount: 18,
      avgCornerRadiusM: 75,
      downforceRequirement: downforceReq,
      trackTempC:
        weather === "DRY_OPTIMAL" ? 34 : weather === "DAMP_TRACK" ? 24 : weather === "WET_RAIN" ? 18 : 15,
      isWetTrack: weather === "WET_RAIN" || weather === "TORRENTIAL_MONSOON",
    };

    return MotorsportSetupOptimizer.optimizeSetup(optimizationGoal, circuitProfile, {
      vehicleMassKg: metrics.totalMassKg || 798,
      enginePowerHp: metrics.totalPeakHorsepower || 1020,
      hybridPowerKw: 120,
      frontalAreaM2: 1.45,
      baseDragCoeffCd: 0.72,
      baseLiftCoeffCl: 3.8,
      maxBrakingForceN: 32000,
      fuelTankCapacityKg: 110,
      driveType: "RWD_ICE",
    });
  }, [activeCircuit, weather, optimizationGoal, metrics]);

  const handleApplyOptimizerSetup = () => {
    playHMIClickSound();
    const opt = optimizerResult.optimalSetup;
    setSetup((prev) => ({
      ...prev,
      rearWingFlapAngleDeg: Math.round(opt.rearWingAngleDeg * 3.2),
      frontWingFlapAngleDeg: Math.round(opt.rearWingAngleDeg * 2.8),
      frontRideHeightMm: Math.round(opt.frontRideHeightMm * 0.6),
      rearRideHeightMm: Math.round(opt.rearRideHeightMm * 0.6),
      brakeBiasPercentFront: opt.brakeBiasFrontPct,
      selectedTireCompound:
        weather === "TORRENTIAL_MONSOON"
          ? "WET"
          : weather === "WET_RAIN"
          ? "INTERMEDIATE"
          : optimizationGoal === "QUALIFYING_MAX_PACE"
          ? "SOFT"
          : optimizationGoal === "ENDURANCE_STINT_PACING"
          ? "HARD"
          : "MEDIUM",
    }));
    setShowOptimizerModal(false);
  };

  const handleApplyPreset = (presetKey: string) => {
    playHMIClickSound();
    const target = F1_SETUP_PRESETS[presetKey];
    if (target) {
      setSetup((prev) => ({ ...prev, ...target.setup }));
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-amber-950/60 text-white select-none relative overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-black/70 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          {onBackToAssembly && (
            <button
              onClick={() => {
                playHMIClickSound();
                onBackToAssembly();
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              ← Back to Assembly CAD
            </button>
          )}
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                FIA Formula 1 Garage & Circuit Setup Workstation
              </h2>
              <p className="text-[10px] text-zinc-400">Passport: {homologationPassportId} • 100% Homologated</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playHMIClickSound();
              setShowOptimizerModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-wider hover:bg-amber-500 hover:text-black transition-all cursor-pointer shadow-md shadow-cyan-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Auto-Tune Optimizer
          </button>

          <button
            onClick={() => {
              playHMIClickSound();
              if (onStartRace) onStartRace(activeCircuit, setup);
            }}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            Enter Live Grand Prix Session
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 grid grid-cols-12 gap-5 p-6 overflow-y-auto min-h-0">
        {/* Left Column: Circuit Selector, Weather & Preset Racks */}
        <div className="col-span-4 space-y-4">
          {/* Circuit Selector Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                Round {selectedCircuitIndex + 1} / 24
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-bold">
                {activeCircuit.country}
              </span>
            </div>

            <h3 className="text-lg font-black text-white">{activeCircuit.name}</h3>
            <p className="text-xs text-zinc-400">
              {activeCircuit.city} • {(activeCircuit.lapLengthMeters / 1000).toFixed(3)} km
            </p>

            <select
              value={selectedCircuitIndex}
              onChange={(e) => {
                playHMIClickSound();
                setSelectedCircuitIndex(parseInt(e.target.value));
              }}
              className="mt-3 w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-amber-400 outline-none cursor-pointer"
            >
              {F1_CIRCUITS.map((c, i) => (
                <option key={c.id} value={i}>
                  Round {i + 1}: {c.name} ({c.country})
                </option>
              ))}
            </select>

            {/* Circuit Characteristics Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-zinc-500 block text-[9px]">DOWNFORCE DEMAND</span>
                <span className="font-bold text-amber-300">{activeCircuit.downforceRequirement}</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-zinc-500 block text-[9px]">TIRE STRESS LEVEL</span>
                <span className="font-bold text-rose-300">Level {activeCircuit.tireStressLevel} / 5</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-zinc-500 block text-[9px]">TOTAL RACE LAPS</span>
                <span className="font-bold text-white">{activeCircuit.raceLapsCount} Laps</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-zinc-500 block text-[9px]">ALTITUDE</span>
                <span className="font-bold text-white">{activeCircuit.altitudeMeters} m</span>
              </div>
            </div>
          </div>

          {/* Dynamic Weather Conditions Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 space-y-3 shadow-xl">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Circuit Weather Simulation
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "DRY_OPTIMAL", label: "Dry", icon: Sun, color: "text-amber-400" },
                { id: "DAMP_TRACK", label: "Damp", icon: CloudDrizzle, color: "text-teal-400" },
                { id: "WET_RAIN", label: "Rain", icon: CloudRain, color: "text-amber-400" },
                { id: "TORRENTIAL_MONSOON", label: "Monsoon", icon: CloudLightning, color: "text-amber-400" },
              ].map((w) => {
                const Icon = w.icon;
                const isSelected = weather === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      playHMIClickSound();
                      setWeather(w.id as F1WeatherCondition);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-400/50 text-white shadow-md shadow-cyan-500/20"
                        : "bg-black/40 border-white/5 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${w.color}`} />
                    <span className="text-[9px] font-bold">{w.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Setup Presets Quick Bar */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 space-y-2.5 shadow-xl">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Engineering Setup Presets
            </span>
            <div className="space-y-1.5">
              {Object.entries(F1_SETUP_PRESETS).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => handleApplyPreset(key)}
                  className="w-full py-1.5 px-3 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 hover:bg-amber-950/20 text-left text-xs font-bold text-zinc-300 hover:text-amber-300 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span>{p.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Setup Controls & Live Telemetry Previews */}
        <div className="col-span-8 space-y-5">
          {/* Main Controls Matrix */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-white/10 space-y-5 shadow-xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 border-b border-white/10 pb-2">
              Aerodynamic Flap Trim & Suspension Geometry
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Front Wing Flap Angle */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-300">Front Wing Flap Angle</span>
                  <span className="font-mono text-amber-400">{setup.frontWingFlapAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="40"
                  value={setup.frontWingFlapAngleDeg}
                  onChange={(e) => setSetup({ ...setup, frontWingFlapAngleDeg: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Rear Wing Flap Angle */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-300">Rear Wing Flap Angle</span>
                  <span className="font-mono text-amber-400">{setup.rearWingFlapAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  value={setup.rearWingFlapAngleDeg}
                  onChange={(e) => setSetup({ ...setup, rearWingFlapAngleDeg: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Front Ride Height */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-300">Front Static Ride Height</span>
                  <span className="font-mono text-amber-400">{setup.frontRideHeightMm} mm</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="45"
                  value={setup.frontRideHeightMm}
                  onChange={(e) => setSetup({ ...setup, frontRideHeightMm: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Rear Ride Height */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-300">Rear Static Ride Height</span>
                  <span className="font-mono text-amber-400">{setup.rearRideHeightMm} mm</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="60"
                  value={setup.rearRideHeightMm}
                  onChange={(e) => setSetup({ ...setup, rearRideHeightMm: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 border-b border-white/10 pb-2 pt-2">
              Drivetrain, Differential & Braking Balance
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Brake Bias */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-300">Front Brake Bias</span>
                  <span className="font-mono text-rose-400">{setup.brakeBiasPercentFront.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="60"
                  step="0.5"
                  value={setup.brakeBiasPercentFront}
                  onChange={(e) => setSetup({ ...setup, brakeBiasPercentFront: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                />
              </div>

              {/* Differential On Throttle */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-300">Diff Lock (On-Throttle)</span>
                  <span className="font-mono text-emerald-400">{setup.differentialOnThrottlePercent}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="90"
                  value={setup.differentialOnThrottlePercent}
                  onChange={(e) => setSetup({ ...setup, differentialOnThrottlePercent: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 border-b border-white/10 pb-2 pt-2">
              Tire Compound & Energy Deployment Strategy
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Tire Compound Selector */}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  Starting Compound
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {(["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"] as const).map((compound) => (
                    <button
                      key={compound}
                      onClick={() => {
                        playHMIClickSound();
                        setSetup({ ...setup, selectedTireCompound: compound });
                      }}
                      className={`py-2 rounded-xl text-[10px] font-black tracking-wider transition-all border cursor-pointer ${
                        setup.selectedTireCompound === compound
                          ? compound === "SOFT"
                            ? "bg-rose-500 text-black border-rose-400 shadow-md shadow-rose-500/30"
                            : compound === "MEDIUM"
                            ? "bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/30"
                            : compound === "HARD"
                            ? "bg-white text-black border-white shadow-md shadow-white/30"
                            : compound === "INTERMEDIATE"
                            ? "bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30"
                            : "bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/30"
                          : "bg-black/40 text-zinc-400 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {compound === "INTERMEDIATE" ? "INTER" : compound}
                    </button>
                  ))}
                </div>
              </div>

              {/* ERS Mode Selector */}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  ERS Strategy Mode
                </span>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {(["QUALIFYING_HOTLAP", "BALANCED_RACE", "ATTACK_OVERTAKE", "ENERGY_SAVE"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        playHMIClickSound();
                        setSetup({ ...setup, ersDeploymentStrategy: mode });
                      }}
                      className={`py-1.5 px-2 rounded-xl font-bold tracking-wider transition-all border cursor-pointer ${
                        setup.ersDeploymentStrategy === mode
                          ? "bg-amber-500 text-black border-amber-400 font-black shadow-md shadow-cyan-500/30"
                          : "bg-black/40 text-zinc-400 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {mode.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Preview Tabs Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Circuit Telemetry Simulation Projections
                </h4>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-[10px] font-bold">
                <button
                  onClick={() => setActiveTelemetryTab("aero")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTelemetryTab === "aero"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Aero & DRS
                </button>
                <button
                  onClick={() => setActiveTelemetryTab("tire")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTelemetryTab === "tire"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Tire Thermal
                </button>
                <button
                  onClick={() => setActiveTelemetryTab("ers")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTelemetryTab === "ers"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  ERS Hybrid
                </button>
              </div>
            </div>

            {/* Tab 1: Aero & DRS */}
            {activeTelemetryTab === "aero" && (
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Top Speed (V-Max)</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {Math.round(348 - setup.rearWingFlapAngleDeg * 0.75 + (isHighSpeedTrack ? 8 : 0))} km/h
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">DRS Active: +18 km/h</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Downforce @ 250 km/h</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {Math.round(metrics.totalDownforceAt250KmhKg * (1 + setup.rearWingFlapAngleDeg * 0.012))} kg
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Efficiency: {aeroEfficiencyIndex} L/D</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Aero Balance (Front)</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {(44 + setup.frontWingFlapAngleDeg * 0.22 - setup.rearWingFlapAngleDeg * 0.15).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Target: 45.0% - 46.5%</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Porpoising Clearance</span>
                  <span className="text-lg font-black text-teal-400 font-mono">
                    {setup.frontRideHeightMm > 28 ? "NOMINAL" : "STALL RISK"}
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">{setup.frontRideHeightMm}mm Venturi Throat</span>
                </div>
              </div>
            )}

            {/* Tab 2: Tire Thermal */}
            {activeTelemetryTab === "tire" && (
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Optimum Compound</span>
                  <span className="text-lg font-black text-rose-400 font-mono">{setup.selectedTireCompound}</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    {setup.selectedTireCompound === "SOFT" ? "12 Laps Stint" : "24 Laps Stint"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Peak Surface Temp</span>
                  <span className="text-lg font-black text-amber-400 font-mono">104.5°C</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Operating Window: 90-110°C</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Wear Rate per Lap</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {(activeCircuit.tireStressLevel * 1.35).toFixed(1)}% / lap
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Cliff at Lap {Math.round(85 / (activeCircuit.tireStressLevel * 1.35))}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Braking Deceleration</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">5.6 G</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Brake Bias: {setup.brakeBiasPercentFront}% Front</span>
                </div>
              </div>
            )}

            {/* Tab 3: ERS Hybrid */}
            {activeTelemetryTab === "ers" && (
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">MGU-K Output</span>
                  <span className="text-lg font-black text-amber-400 font-mono">120 kW (163 HP)</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">FIA Energy Cap: 4.0 MJ/lap</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">MGU-H Recovery</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">Unlimited MJ</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Exhaust Heat Recovery</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Deploy Mode</span>
                  <span className="text-lg font-black text-amber-400 font-mono">{setup.ersDeploymentStrategy.replace("_", " ")}</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Boost Duration: 33s / lap</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block">Net Lap Delta</span>
                  <span className="text-lg font-black text-teal-400 font-mono">-1.85s / lap</span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">vs ICE-only Baseline</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auto-Tune Optimizer Modal */}
      {showOptimizerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-950 border border-amber-500/30 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Motorsport AI Setup Optimizer
                </h3>
              </div>
              <button
                onClick={() => setShowOptimizerModal(false)}
                className="text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Optimization Goals Selector */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                Optimization Objective
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "QUALIFYING_MAX_PACE", label: "Qualifying Pole Lap", desc: "Max aero load, soft tire peak grip" },
                  { id: "RACE_TIRE_PRESERVATION", label: "Race Tire Preservation", desc: "Lower slide, consistent deg curve" },
                  { id: "V_MAX_LOW_DRAG", label: "Maximum V-Max", desc: "Trimmed flaps for high straight speed" },
                  { id: "RAIN_WET_GRIP", label: "Wet Track Mechanical Grip", desc: "Soft roll bars, high ride height" },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      playHMIClickSound();
                      setOptimizationGoal(g.id as OptimizationGoal);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      optimizationGoal === g.id
                        ? "bg-amber-500/20 border-amber-400 text-white shadow-md shadow-cyan-500/20"
                        : "bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-300">{g.label}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Projected Gains */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300 font-bold">Projected Lap Time Delta</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {optimizerResult.lapTimeSavedVsBaselineSec.toFixed(3)}s faster
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300 font-bold">Predicted V-Max Speed</span>
                <span className="font-mono font-black text-amber-400">
                  {optimizerResult.topSpeedKmh.toFixed(1)} km/h
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300 font-bold">Stint Degradation Window</span>
                <span className="font-mono font-black text-amber-400">
                  {optimizerResult.stintMaxLaps} Laps ({optimizerResult.tireWearPctPerLap.toFixed(1)}%/lap)
                </span>
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApplyOptimizerSetup}
              className="w-full py-3 rounded-2xl bg-amber-500 text-black font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Apply Optimized Circuit Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
