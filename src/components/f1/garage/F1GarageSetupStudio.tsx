import React, { useState, memo } from "react";
import { useF1AssemblyStore } from "../../../sim/f1/state/f1AssemblyStore";
import { F1_CIRCUITS, type F1Circuit } from "../../../sim/f1/season/f1Calendar";
import {
  SlidersHorizontal, Flag, Gauge, Wind, Disc, Activity,
  Play, RotateCcw, Sparkles, CheckCircle2, ChevronRight, Award, ShieldAlert
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

export const F1GarageSetupStudio: React.FC<F1GarageSetupStudioProps> = memo(function F1GarageSetupStudio({
  onStartRace,
  onBackToAssembly,
}) {
  const { metrics, homologationPassportId } = useF1AssemblyStore();
  const [selectedCircuitIndex, setSelectedCircuitIndex] = useState(0);
  const activeCircuit = F1_CIRCUITS[selectedCircuitIndex];

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
  const isHighSpeedTrack = activeCircuit.downforceRequirement === "MEDIUM";
  const aeroEfficiencyIndex = metrics.totalDragAt250KmhKg > 0 ? (metrics.totalDownforceAt250KmhKg / metrics.totalDragAt250KmhKg).toFixed(2) : "0.0";

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0c10] text-white select-none">
      {/* Top Header */}
      <div className="p-4 bg-black/60 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playHMIClickSound();
              onBackToAssembly?.();
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            ← Back to Assembly CAD
          </button>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Garage & Circuit Setup Workstation</h2>
              <p className="text-[10px] text-zinc-400">Passport: {homologationPassportId} • 100% Homologated</p>
            </div>
          </div>
        </div>

        {/* Enter Session CTA */}
        <button
          onClick={() => {
            playHMIClickSound();
            if (onStartRace) onStartRace(activeCircuit, setup);
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-black" />
          Enter Live Grand Prix Session
        </button>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-6 overflow-y-auto">
        {/* Left Column: Circuit Selector & Compatibility Radar */}
        <div className="col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                Round {selectedCircuitIndex + 1} / 24
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                {activeCircuit.country}
              </span>
            </div>

            <h3 className="text-lg font-black text-white">{activeCircuit.name}</h3>
            <p className="text-xs text-zinc-400">{activeCircuit.city} • {(activeCircuit.lapLengthMeters / 1000).toFixed(3)} km</p>

            {/* Circuit Selector Dropdown */}
            <select
              value={selectedCircuitIndex}
              onChange={(e) => setSelectedCircuitIndex(parseInt(e.target.value))}
              className="mt-3 w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-cyan-400 outline-none"
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
                <span className="text-zinc-500 block text-[9px]">TIRE WEAR INDEX</span>
                <span className="font-bold text-rose-300">Level {activeCircuit.tireStressLevel} / 5</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-zinc-500 block text-[9px]">TOTAL LAPS</span>
                <span className="font-bold text-white">{activeCircuit.raceLapsCount} Laps</span>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                <span className="text-zinc-500 block text-[9px]">ALTITUDE</span>
                <span className="font-bold text-white">{activeCircuit.altitudeMeters} m</span>
              </div>
            </div>
          </div>

          {/* Car-to-Track Compatibility Analysis Card */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Engineering Setup Assessment
              </h4>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Your constructed vehicle generates <strong className="text-cyan-400">{metrics.totalDownforceAt250KmhKg} kg</strong> of downforce at an aerodynamic efficiency of <strong className="text-emerald-400">{aeroEfficiencyIndex} L/D</strong>.
              {isHighSpeedTrack ? " This circuit rewards lower wing flap angles to maximize V-max along high-speed straights." : " High downforce setup recommended for maximum high-speed corner stability."}
            </p>
          </div>
        </div>

        {/* Right Column: Setup Sliders & Controls */}
        <div className="col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 border-b border-white/10 pb-2">
              Aerodynamic Flap Trim & Ride Heights
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Front Wing Flap Angle */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-300">Front Wing Flap Angle</span>
                  <span className="font-mono text-cyan-400">{setup.frontWingFlapAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="40"
                  value={setup.frontWingFlapAngleDeg}
                  onChange={(e) => setSetup({ ...setup, frontWingFlapAngleDeg: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Rear Wing Flap Angle */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-zinc-300">Rear Wing Flap Angle</span>
                  <span className="font-mono text-cyan-400">{setup.rearWingFlapAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  value={setup.rearWingFlapAngleDeg}
                  onChange={(e) => setSetup({ ...setup, rearWingFlapAngleDeg: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
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
                  min="25"
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

            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 border-b border-white/10 pb-2 pt-2">
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

            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 border-b border-white/10 pb-2 pt-2">
              Tire Compound & Energy Deployment Strategy
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Tire Compound Selector */}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  Starting Compound
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(["SOFT", "MEDIUM", "HARD"] as const).map((compound) => (
                    <button
                      key={compound}
                      onClick={() => {
                        playHMIClickSound();
                        setSetup({ ...setup, selectedTireCompound: compound });
                      }}
                      className={`py-2 rounded-xl text-xs font-black tracking-wider transition-all border cursor-pointer ${
                        setup.selectedTireCompound === compound
                          ? compound === "SOFT"
                            ? "bg-rose-500 text-black border-rose-400 shadow-md shadow-rose-500/30"
                            : compound === "MEDIUM"
                            ? "bg-amber-400 text-black border-amber-300 shadow-md shadow-amber-400/30"
                            : "bg-white text-black border-white shadow-md shadow-white/30"
                          : "bg-black/40 text-zinc-400 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {compound}
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
                          ? "bg-cyan-500 text-black border-cyan-400 font-black shadow-md shadow-cyan-500/30"
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
        </div>
      </div>
    </div>
  );
});
