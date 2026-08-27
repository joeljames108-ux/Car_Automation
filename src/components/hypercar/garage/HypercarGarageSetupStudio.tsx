import React, { useState, useMemo, memo } from "react";
import { useHypercarAssemblyStore } from "../../../sim/hypercar/state/hypercarAssemblyStore";
import { WEC_CIRCUITS, type WECCircuitProfile } from "../../../sim/hypercar/season/wecCalendar";
import {
  MotorsportSetupOptimizer,
  type OptimizationGoal,
  type MotorsportOptimizationResult,
  type CircuitOptimizerProfile,
} from "../../../sim/motorsport/motorsportSetupOptimizer";
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  Wind,
  Zap,
  Shield,
  Clock,
  Flame,
  Layers,
  Thermometer,
  Gauge,
  HelpCircle,
  CloudRain,
  Sun,
  CloudDrizzle,
  CloudLightning,
  GitCompare,
  TrendingUp,
  Activity,
  Cpu,
  Sparkles,
  CheckCircle2,
  Target,
  BarChart3,
} from "lucide-react";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";

export interface HypercarGarageSetup {
  rearWingAngleDeg: number; // 2° to 14°
  frontRideHeightMm: number; // 45 to 70 mm
  rearRideHeightMm: number; // 55 to 80 mm
  frontMguDeploySpeedKmh: number; // 120 to 190 km/h
  brakeDuctTapePercent: number; // 0 to 50%
  tireCompound: "SOFT_SPRINT" | "MEDIUM_DOUBLE_STINT" | "HARD_TRIPLE_STINT" | "WET_INTERMEDIATE" | "FULL_WET_MONSOON";
  ersDeployMode: "QUALIFYING_MAX" | "ENDURANCE_BALANCED" | "LIFT_AND_COAST";
}

export type WeatherCondition = "DRY_OPTIMAL" | "DAMP_TRACK" | "WET_RAIN" | "TORRENTIAL_MONSOON";

interface HypercarGarageSetupStudioProps {
  onBackToAssembly: () => void;
  onStartRace?: (circuit: WECCircuitProfile, setup: HypercarGarageSetup) => void;
}

const SETUP_PRESETS: Record<string, Partial<HypercarGarageSetup>> = {
  baseline: {
    rearWingAngleDeg: 6.5,
    frontRideHeightMm: 50,
    rearRideHeightMm: 62,
    frontMguDeploySpeedKmh: 120,
    brakeDuctTapePercent: 15,
    tireCompound: "MEDIUM_DOUBLE_STINT",
    ersDeployMode: "ENDURANCE_BALANCED",
  },
  lemans_low_drag: {
    rearWingAngleDeg: 2.5,
    frontRideHeightMm: 46,
    rearRideHeightMm: 56,
    frontMguDeploySpeedKmh: 140,
    brakeDuctTapePercent: 10,
    tireCompound: "HARD_TRIPLE_STINT",
    ersDeployMode: "ENDURANCE_BALANCED",
  },
  spa_high_downforce: {
    rearWingAngleDeg: 12.0,
    frontRideHeightMm: 58,
    rearRideHeightMm: 72,
    frontMguDeploySpeedKmh: 120,
    brakeDuctTapePercent: 25,
    tireCompound: "SOFT_SPRINT",
    ersDeployMode: "QUALIFYING_MAX",
  },
};

export const HypercarGarageSetupStudio: React.FC<HypercarGarageSetupStudioProps> = memo(function HypercarGarageSetupStudio({
  onBackToAssembly,
  onStartRace,
}) {
  const { metrics, homologationPassportId } = useHypercarAssemblyStore();
  const [selectedCircuitIndex, setSelectedCircuitIndex] = useState(0);
  const activeCircuit = WEC_CIRCUITS[selectedCircuitIndex];

  const [weather, setWeather] = useState<WeatherCondition>("DRY_OPTIMAL");
  const [optimizationGoal, setOptimizationGoal] = useState<OptimizationGoal>("QUALIFYING_MAX_PACE");
  const [showOptimizerModal, setShowOptimizerModal] = useState(false);
  const [showCircuitCompare, setShowCircuitCompare] = useState(false);
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<"stint" | "thermal" | "aero">("stint");

  const [setup, setSetup] = useState<HypercarGarageSetup>({
    rearWingAngleDeg: 6.5,
    frontRideHeightMm: 50,
    rearRideHeightMm: 62,
    frontMguDeploySpeedKmh: 120,
    brakeDuctTapePercent: 15,
    tireCompound: "MEDIUM_DOUBLE_STINT",
    ersDeployMode: "ENDURANCE_BALANCED",
  });

  const optimizerResult: MotorsportOptimizationResult = useMemo(() => {
    const downforceReq: CircuitOptimizerProfile["downforceRequirement"] =
      activeCircuit.downforceRequirement === "LOW" ? "LOW" :
      activeCircuit.downforceRequirement === "HIGH" ? "HIGH" : "BALANCED";

    const circuitProfile: CircuitOptimizerProfile = {
      name: activeCircuit.name,
      totalLengthM: activeCircuit.lapLengthMeters,
      longestStraightM: activeCircuit.downforceRequirement === "LOW" ? 850 : activeCircuit.downforceRequirement === "HIGH" ? 450 : 650,
      cornerCount: 16,
      avgCornerRadiusM: 80,
      downforceRequirement: downforceReq,
      trackTempC: weather === "DRY_OPTIMAL" ? 32 : weather === "DAMP_TRACK" ? 22 : 18,
      isWetTrack: weather === "WET_RAIN" || weather === "TORRENTIAL_MONSOON",
    };

    return MotorsportSetupOptimizer.optimizeSetup(optimizationGoal, circuitProfile, {
      vehicleMassKg: metrics.totalMassKg || 1040,
      enginePowerHp: metrics.totalPeakHorsepower || 880,
      hybridPowerKw: 200,
      frontalAreaM2: 1.95,
      baseDragCoeffCd: 0.62,
      baseLiftCoeffCl: 2.8,
      maxBrakingForceN: 28000,
      fuelTankCapacityKg: 90,
      driveType: "AWD_HYBRID",
    });
  }, [activeCircuit, weather, optimizationGoal, metrics]);

  const handleApplyOptimizerSetup = () => {
    playHMIClickSound();
    const opt = optimizerResult.optimalSetup;
    let recTire: HypercarGarageSetup["tireCompound"] = "MEDIUM_DOUBLE_STINT";
    if (weather === "WET_RAIN") recTire = "WET_INTERMEDIATE";
    else if (weather === "TORRENTIAL_MONSOON") recTire = "FULL_WET_MONSOON";
    else if (optimizationGoal === "QUALIFYING_MAX_PACE") recTire = "SOFT_SPRINT";
    else if (optimizationGoal === "ENDURANCE_STINT_PACING") recTire = "HARD_TRIPLE_STINT";

    let ersMode: HypercarGarageSetup["ersDeployMode"] = "ENDURANCE_BALANCED";
    if (optimizationGoal === "QUALIFYING_MAX_PACE") ersMode = "QUALIFYING_MAX";
    else if (optimizationGoal === "FUEL_HYBRID_EFFICIENCY") ersMode = "LIFT_AND_COAST";

    setSetup({
      rearWingAngleDeg: opt.rearWingAngleDeg,
      frontRideHeightMm: opt.frontRideHeightMm,
      rearRideHeightMm: opt.rearRideHeightMm,
      frontMguDeploySpeedKmh: opt.frontMguDeploySpeedKmh,
      brakeDuctTapePercent: opt.brakeDuctTapePct,
      tireCompound: recTire,
      ersDeployMode: ersMode,
    });
    setShowOptimizerModal(false);
  };

  const aeroEfficiencyIndex =
    metrics.totalDragAt250KmhKg > 0
      ? (metrics.totalDownforceAt250KmhKg / metrics.totalDragAt250KmhKg).toFixed(2)
      : "0.0";

  const lapTimeDeltaSec = useMemo(() => {
    let delta = 0;
    const targetWing = (activeCircuit.downforceRequirement as string) === "LOW" ? 3.0 : activeCircuit.downforceRequirement === "HIGH" ? 11.0 : 7.0;
    delta += Math.abs(setup.rearWingAngleDeg - targetWing) * 0.18;
    if ((weather === "WET_RAIN" || weather === "TORRENTIAL_MONSOON") && setup.tireCompound !== "WET_INTERMEDIATE" && setup.tireCompound !== "FULL_WET_MONSOON") {
      delta += 4.5;
    }
    return delta.toFixed(3);
  }, [setup, activeCircuit, weather]);

  const recommendedTires = useMemo(() => {
    switch (weather) {
      case "DRY_OPTIMAL": return ["SOFT_SPRINT", "MEDIUM_DOUBLE_STINT", "HARD_TRIPLE_STINT"];
      case "DAMP_TRACK": return ["MEDIUM_DOUBLE_STINT", "WET_INTERMEDIATE"];
      case "WET_RAIN": return ["WET_INTERMEDIATE", "FULL_WET_MONSOON"];
      case "TORRENTIAL_MONSOON": return ["FULL_WET_MONSOON"];
    }
  }, [weather]);

  const applyPreset = (presetKey: string) => {
    playHMIClickSound();
    const preset = SETUP_PRESETS[presetKey];
    if (preset) {
      setSetup((prev) => ({ ...prev, ...preset }));
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#07090e] text-white select-none">
      {/* Top Header Bar */}
      <div className="p-4 bg-black/60 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playHMIClickSound();
              onBackToAssembly();
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            ← Back to Assembly CAD
          </button>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Hypercar Pit Garage & Stint Strategy Workstation
              </h2>
              <p className="text-[10px] text-zinc-400">Passport: {homologationPassportId} • 100% WEC Homologated</p>
            </div>
          </div>
        </div>

        {/* Live Setup Impact Delta & Enter Session Action */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              playHMIClickSound();
              setShowOptimizerModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/50 text-purple-300 font-bold text-xs hover:bg-purple-600/40 transition-all cursor-pointer shadow-lg shadow-purple-500/10"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Motorsport Setup Optimizer
          </button>

          <div className="text-right">
            <div className="text-[10px] text-zinc-400 uppercase font-mono">Est. Lap Time Delta</div>
            <div className={`text-sm font-black font-mono ${Number(lapTimeDeltaSec) <= 0.2 ? "text-emerald-400" : "text-amber-400"}`}>
              +{lapTimeDeltaSec}s / lap
            </div>
          </div>

          <button
            onClick={() => {
              playHMIClickSound();
              if (onStartRace) onStartRace(activeCircuit, setup);
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            Enter Live WEC Endurance Session
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-6 overflow-y-auto">
        {/* Left Column: Circuit Profile, Weather & Stint Strategy */}
        <div className="col-span-4 space-y-4">
          {/* Circuit Profile Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                Round {selectedCircuitIndex + 1} / {WEC_CIRCUITS.length}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-bold">
                {activeCircuit.country}
              </span>
            </div>

            <h3 className="text-lg font-black text-white">{activeCircuit.name}</h3>
            <p className="text-xs text-zinc-400">
              {activeCircuit.city} • {(activeCircuit.lapLengthMeters / 1000).toFixed(3)} km • {activeCircuit.raceDurationHours} Hours
            </p>

            {/* Circuit Selector Dropdown */}
            <select
              value={selectedCircuitIndex}
              onChange={(e) => setSelectedCircuitIndex(parseInt(e.target.value))}
              className="mt-3 w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-amber-400 outline-none"
            >
              {WEC_CIRCUITS.map((c, i) => (
                <option key={c.id} value={i}>
                  Round {i + 1}: {c.name} ({c.country}) — {c.raceDurationHours}H
                </option>
              ))}
            </select>

            {/* Weather Condition Selector */}
            <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono block">Track Weather Condition</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "DRY_OPTIMAL", label: "Dry Optimal", icon: <Sun size={12} className="text-amber-400" /> },
                  { id: "DAMP_TRACK", label: "Damp Track", icon: <CloudDrizzle size={12} className="text-cyan-400" /> },
                  { id: "WET_RAIN", label: "Wet Rain", icon: <CloudRain size={12} className="text-blue-400" /> },
                  { id: "TORRENTIAL_MONSOON", label: "Monsoon", icon: <CloudLightning size={12} className="text-purple-400" /> },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWeather(w.id as WeatherCondition)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      weather === w.id
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-black/40 text-zinc-400 border-white/5 hover:text-white"
                    }`}
                  >
                    {w.icon}
                    <span>{w.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Endurance Circuit Characteristics Grid */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-zinc-500 block text-[9px]">DOWNFORCE DEMAND</span>
                <span className="font-bold text-amber-300">{activeCircuit.downforceRequirement}</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-zinc-500 block text-[9px]">TIRE WEAR INDEX</span>
                <span className="font-bold text-rose-300">Level {activeCircuit.tireStressLevel} / 5</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-zinc-500 block text-[9px]">BRAKE THERMAL LOAD</span>
                <span className="font-bold text-orange-400">Level {activeCircuit.brakeThermalStress} / 5</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-zinc-500 block text-[9px]">NIGHT RACING</span>
                <span className="font-bold text-cyan-300">{activeCircuit.nightRacingHours} Hours</span>
              </div>
            </div>
          </div>

          {/* Constructed Vehicle Snapshot */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-amber-400" />
              Homologated Prototype Stats
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-zinc-500 block">TOTAL MASS</span>
                <span className="font-bold text-white">{metrics.totalMassKg} kg</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-zinc-500 block">COMBINED POWER</span>
                <span className="font-bold text-amber-400">{metrics.totalPeakHorsepower} HP</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-zinc-500 block">L/D EFFICIENCY</span>
                <span className="font-bold text-cyan-300">{aeroEfficiencyIndex}</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-zinc-500 block">RELIABILITY INDEX</span>
                <span className="font-bold text-emerald-400">{metrics.enduranceReliabilityScore} / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Setup Sliders & Stint Strategy */}
        <div className="col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                Endurance Chassis & Aerodynamic Adjustments
              </h3>

              {/* Setup Presets Buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Presets:</span>
                <button
                  onClick={() => applyPreset("baseline")}
                  className="px-2 py-1 rounded bg-black/40 hover:bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300 border border-white/10"
                >
                  OEM Baseline
                </button>
                <button
                  onClick={() => applyPreset("lemans_low_drag")}
                  className="px-2 py-1 rounded bg-black/40 hover:bg-zinc-800 text-[10px] font-mono font-bold text-cyan-300 border border-white/10"
                >
                  Le Mans Low Drag
                </button>
                <button
                  onClick={() => applyPreset("spa_high_downforce")}
                  className="px-2 py-1 rounded bg-black/40 hover:bg-zinc-800 text-[10px] font-mono font-bold text-amber-300 border border-white/10"
                >
                  Spa High DF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Rear Wing Flap Angle */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-cyan-400" /> REAR WING ANGLE
                  </span>
                  <span className="text-amber-400 font-bold">{setup.rearWingAngleDeg.toFixed(1)}°</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="14"
                  step="0.5"
                  value={setup.rearWingAngleDeg}
                  onChange={(e) => setSetup({ ...setup, rearWingAngleDeg: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                  <span>2° (Low Drag Le Mans)</span>
                  <span>14° (High DF Spa)</span>
                </div>
              </div>

              {/* Front MGU AWD Activation Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" /> FRONT MGU TRIGGER SPEED
                  </span>
                  <span className="text-emerald-400 font-bold">{setup.frontMguDeploySpeedKmh} km/h</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="190"
                  step="5"
                  value={setup.frontMguDeploySpeedKmh}
                  onChange={(e) => setSetup({ ...setup, frontMguDeploySpeedKmh: parseInt(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                  <span>120 km/h (FIA Min Dry)</span>
                  <span>190 km/h (High Speed)</span>
                </div>
              </div>

              {/* Front Ride Height */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">FRONT RIDE HEIGHT</span>
                  <span className="text-white font-bold">{setup.frontRideHeightMm} mm</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="70"
                  step="1"
                  value={setup.frontRideHeightMm}
                  onChange={(e) => setSetup({ ...setup, frontRideHeightMm: parseInt(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Rear Ride Height */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">REAR RIDE HEIGHT</span>
                  <span className="text-white font-bold">{setup.rearRideHeightMm} mm</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="80"
                  step="1"
                  value={setup.rearRideHeightMm}
                  onChange={(e) => setSetup({ ...setup, rearRideHeightMm: parseInt(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Brake Duct Blanking Tape */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-orange-400" /> BRAKE DUCT TAPE %
                  </span>
                  <span className="text-orange-400 font-bold">{setup.brakeDuctTapePercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={setup.brakeDuctTapePercent}
                  onChange={(e) => setSetup({ ...setup, brakeDuctTapePercent: parseInt(e.target.value) })}
                  className="w-full accent-orange-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                  <span>0% (Full Cooling)</span>
                  <span>50% (Night Temperature Trap)</span>
                </div>
              </div>

              {/* Hybrid ERS Strategy */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-zinc-400 block">HYBRID ERS HARVEST STRATEGY</span>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: "QUALIFYING_MAX", label: "Qualifying 100%" },
                      { id: "ENDURANCE_BALANCED", label: "Balanced Stint" },
                      { id: "LIFT_AND_COAST", label: "Lift & Coast" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSetup({ ...setup, ersDeployMode: m.id })}
                      className={`p-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                        setup.ersDeployMode === m.id
                          ? "bg-amber-500/20 border-amber-500 text-amber-300"
                          : "bg-black/40 border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tire Compound Allocation */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-300 font-bold block">
                  MICHELIN ENDURANCE TIRE ALLOCATION & MULTI-STINT PLAN
                </span>
                {weather !== "DRY_OPTIMAL" && (
                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Weather Warning: {weather}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "SOFT_SPRINT", name: "Soft Compound", stints: "1 Stint (Sprint/Qualifying)", color: "border-red-500/50 bg-red-500/10 text-red-300" },
                  { id: "MEDIUM_DOUBLE_STINT", name: "Medium Compound", stints: "2 Stints (Standard Race)", color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-300" },
                  { id: "HARD_TRIPLE_STINT", name: "Hard Compound", stints: "3 Stints (High Wear/Le Mans)", color: "border-zinc-500/50 bg-zinc-500/10 text-zinc-300" },
                  { id: "WET_INTERMEDIATE", name: "Intermediate Wet", stints: "Damp to Light Rain", color: "border-blue-500/50 bg-blue-500/10 text-blue-300" },
                  { id: "FULL_WET_MONSOON", name: "Full Monsoon Wet", stints: "Heavy Standing Water", color: "border-purple-500/50 bg-purple-500/10 text-purple-300" },
                ].map((t) => {
                  const isRec = recommendedTires.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSetup({ ...setup, tireCompound: t.id as any })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all relative ${
                        setup.tireCompound === t.id ? t.color + " ring-1 ring-white/30" : "bg-black/40 border-white/10 text-zinc-400"
                      }`}
                    >
                      {isRec && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded bg-emerald-500 text-black font-mono text-[8px] font-bold">
                          REC
                        </span>
                      )}
                      <div className="text-xs font-black">{t.name}</div>
                      <div className="text-[10px] font-mono mt-1 opacity-80">{t.stints}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Motorsport Setup Optimizer Modal */}
      {showOptimizerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#0b0f19] border border-purple-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-purple-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                    AI Motorsport Setup & Telemetry Optimizer
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Direct Collocation & Non-Linear Pareto Optimization Engine for {activeCircuit.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOptimizerModal(false)}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Goal Selector */}
              <div className="space-y-2">
                <span className="font-mono text-zinc-400 text-[10px] uppercase font-bold block">
                  Select Performance Optimization Goal
                </span>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: "QUALIFYING_MAX_PACE", label: "Qualifying Push Pace", desc: "Max single lap speed & downforce" },
                    { id: "ENDURANCE_STINT_PACING", label: "Stint Longevity", desc: "Minimal tire wear & thermal degradation" },
                    { id: "RAIN_STABILITY", label: "Wet Track Stability", desc: "Max mechanical grip & lock-up prevention" },
                    { id: "FUEL_HYBRID_EFFICIENCY", label: "Hybrid Efficiency", desc: "Energy harvesting & lift-and-coast" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setOptimizationGoal(g.id as OptimizationGoal)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        optimizationGoal === g.id
                          ? "bg-purple-500/20 border-purple-500 text-purple-200 ring-1 ring-purple-500/50"
                          : "bg-zinc-900/60 border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className="font-black text-xs">{g.label}</div>
                      <div className="text-[10px] text-zinc-500 mt-1">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optimization KPI Cards */}
              <div className="grid grid-cols-4 gap-3 font-mono">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/20">
                  <span className="text-[9px] text-purple-400 block font-bold">EST. LAP TIME</span>
                  <span className="text-xl font-black text-white">{optimizerResult.predictedLapTimeString}</span>
                  <span className="text-[9px] text-emerald-400 block mt-1">
                    -{optimizerResult.lapTimeSavedVsBaselineSec}s vs Baseline
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/20">
                  <span className="text-[9px] text-cyan-400 block font-bold">TOP SPEED</span>
                  <span className="text-xl font-black text-white">{optimizerResult.topSpeedKmh} km/h</span>
                  <span className="text-[9px] text-zinc-400 block mt-1">
                    Min Apex: {optimizerResult.minCorneringSpeedKmh} km/h
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/20">
                  <span className="text-[9px] text-amber-400 block font-bold">AERO EFFICIENCY</span>
                  <span className="text-xl font-black text-white">{optimizerResult.aerodynamicEfficiencyLoverD} L/D</span>
                  <span className="text-[9px] text-zinc-400 block mt-1">Wing Angle: {optimizerResult.optimalSetup.rearWingAngleDeg}°</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/20">
                  <span className="text-[9px] text-rose-400 block font-bold">STINT LONGEVITY</span>
                  <span className="text-xl font-black text-white">{optimizerResult.stintMaxLaps} Laps</span>
                  <span className="text-[9px] text-zinc-400 block mt-1">{optimizerResult.tireWearPctPerLap}% Wear / lap</span>
                </div>
              </div>

              {/* Sector Deltas Breakdown */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-2">
                <span className="font-mono text-zinc-400 text-[10px] uppercase font-bold block">
                  Sector Time Decomposition
                </span>
                <div className="grid grid-cols-3 gap-3 font-mono text-center">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] text-zinc-500 block">SECTOR 1 (SPEED)</span>
                    <span className="font-bold text-amber-300 text-sm">{optimizerResult.sectorTimes.s1}s</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] text-zinc-500 block">SECTOR 2 (TECHNICAL)</span>
                    <span className="font-bold text-amber-300 text-sm">{optimizerResult.sectorTimes.s2}s</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[9px] text-zinc-500 block">SECTOR 3 (TRACTION)</span>
                    <span className="font-bold text-amber-300 text-sm">{optimizerResult.sectorTimes.s3}s</span>
                  </div>
                </div>
              </div>

              {/* Pareto Frontier Comparison */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-purple-300 text-[10px] uppercase font-bold flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    Pareto Trade-Off Frontier (Downforce vs Top Speed vs Lap Time)
                  </span>
                </div>
                <div className="space-y-2 font-mono">
                  {optimizerResult.paretoFrontier.map((pt, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[11px]"
                    >
                      <div className="font-bold text-white w-48">{pt.setupName}</div>
                      <div className="text-zinc-400">DF: {pt.downforceNAt250} N</div>
                      <div className="text-cyan-300">Drag: {pt.dragNAt250} N</div>
                      <div className="text-amber-400">VMax: {pt.topSpeedKmh} km/h</div>
                      <div className="text-emerald-400 font-bold">Lap: {pt.predictedLapTimeSec}s</div>
                      <div className="text-rose-300">Life: {pt.tireLifeLaps} Laps</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engineering Recommendations */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <span className="font-mono text-purple-300 text-[10px] uppercase font-bold flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Race Engineer Advisory Notes
                </span>
                <ul className="space-y-1 text-zinc-300 text-[11px]">
                  {optimizerResult.engineeringRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10 bg-black/40 flex items-center justify-between">
              <div className="text-zinc-400 text-xs font-mono">
                Optimized for {activeCircuit.name} ({activeCircuit.downforceRequirement} Downforce Demand)
              </div>
              <button
                onClick={handleApplyOptimizerSetup}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 hover:brightness-110 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Apply AI Optimal Setup to Pit Garage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});