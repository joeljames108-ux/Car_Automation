// ============================================================================
// F1 LIVE RACE SIMULATOR & TELEMETRY ENGINE
// ============================================================================
// Simulates live Grand Prix laps utilizing the player's constructed vehicle physics,
// displaying real-time telemetry, live timing leaderboard, interactive pit wall,
// tactical radio updates, and post-race analysis.
// ============================================================================

import React, { useState, useEffect, useRef } from "react";
import { useF1AssemblyStore } from "../../../sim/f1/state/f1AssemblyStore";
import { type F1Circuit } from "../../../sim/f1/season/f1Calendar";
import { type F1RaceWeekendSetup } from "../garage/F1GarageSetupStudio";
import { F1_RIVAL_TEAMS } from "../../../sim/f1/season/f1RivalTeams";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import {
  Flag, Trophy, Activity, Zap, Flame, RotateCcw,
  Award, ArrowRight, Gauge, Play, Pause, FastForward, CheckCircle2,
  Radio, Wrench, ShieldAlert, Thermometer, CloudRain, Cpu
} from "lucide-react";

interface F1LiveRaceSimulatorProps {
  circuit: F1Circuit;
  setup: F1RaceWeekendSetup;
  onExitSession?: () => void;
}

interface LeaderboardEntry {
  position: number;
  driverName: string;
  teamName: string;
  isPlayer: boolean;
  lapTimeSeconds: number;
  gapToLeaderSeconds: number;
  tireWearPercent: number;
  stopsCount: number;
}

interface RadioMessage {
  id: string;
  lap: number;
  timestamp: string;
  sender: "ENGINEER" | "DRIVER" | "FIA";
  text: string;
  type: "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";
}

const F1LiveRaceSimulatorComponent: React.FC<F1LiveRaceSimulatorProps> = ({
  circuit,
  setup,
  onExitSession,
}) => {
  const { metrics, homologationPassportId } = useF1AssemblyStore();

  const [currentLap, setCurrentLap] = useState(1);
  const totalLaps = Math.min(15, circuit.raceLapsCount); // Condensed race simulation
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);

  const [fuelKg, setFuelKg] = useState(35.0);
  const [tireWear, setTireWear] = useState(0);
  const [tireTempC, setTireTempC] = useState(98);
  const [activeCompound, setActiveCompound] = useState(setup.selectedTireCompound);
  const [nextPitCompound, setNextPitCompound] = useState<"SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET">("MEDIUM");
  
  const [ersBatteryPercent, setErsBatteryPercent] = useState(92);
  const [ersMode, setErsMode] = useState<"QUALIFYING_HOTLAP" | "BALANCED_RACE" | "ATTACK_OVERTAKE" | "ENERGY_SAVE">(
    setup.ersDeploymentStrategy
  );

  const [engineStratMode, setEngineStratMode] = useState<"STRAT_1_MAX" | "STRAT_2_RACE" | "STRAT_3_ECO">("STRAT_2_RACE");

  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(285);
  const [currentSector, setCurrentSector] = useState<1 | 2 | 3>(1);
  const [isDrsActive, setIsDrsActive] = useState(false);
  const [boxThisLap, setBoxThisLap] = useState(false);
  const [isInPitLane, setIsInPitLane] = useState(false);
  const [pitStopsCount, setPitStopsCount] = useState(0);

  const [playerLapTimes, setPlayerLapTimes] = useState<number[]>([]);
  const [isRaceFinished, setIsRaceFinished] = useState(false);

  // Tactical Pit Wall Radio Messages
  const [radioLogs, setRadioLogs] = useState<RadioMessage[]>([
    {
      id: "init-1",
      lap: 1,
      timestamp: "00:01",
      sender: "ENGINEER",
      text: `Lights out! Target lap time: 84.0s. Weather clear, track temp 34°C.`,
      type: "INFO",
    },
  ]);

  const addRadioMessage = (
    sender: "ENGINEER" | "DRIVER" | "FIA",
    text: string,
    type: "INFO" | "WARNING" | "CRITICAL" | "SUCCESS"
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { minute: "2-digit", second: "2-digit" });
    setRadioLogs((prev) => [
      {
        id: Math.random().toString(),
        lap: currentLap,
        timestamp: timeStr,
        sender,
        text,
        type,
      },
      ...prev.slice(0, 19),
    ]);
  };

  // Initialize Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const entries: LeaderboardEntry[] = [];

    // Player Entry
    entries.push({
      position: 1,
      driverName: "Player (You)",
      teamName: "Apex Works Racing",
      isPlayer: true,
      lapTimeSeconds: 84.5,
      gapToLeaderSeconds: 0.0,
      tireWearPercent: 0,
      stopsCount: 0,
    });

    // 19 AI Drivers
    let aiPos = 2;
    for (const team of F1_RIVAL_TEAMS) {
      if (entries.length < 20) {
        entries.push({
          position: aiPos++,
          driverName: team.driver1Name,
          teamName: team.teamName,
          isPlayer: false,
          lapTimeSeconds: 84.8 + Math.random() * 0.8,
          gapToLeaderSeconds: (aiPos - 2) * 0.45 + 0.3,
          tireWearPercent: 0,
          stopsCount: 0,
        });
      }
      if (entries.length < 20) {
        entries.push({
          position: aiPos++,
          driverName: team.driver2Name,
          teamName: team.teamName,
          isPlayer: false,
          lapTimeSeconds: 85.0 + Math.random() * 0.8,
          gapToLeaderSeconds: (aiPos - 2) * 0.45 + 0.3,
          tireWearPercent: 0,
          stopsCount: 0,
        });
      }
    }

    return entries;
  });

  // ── Physics & Race Loop Simulation ──
  useEffect(() => {
    if (!isPlaying || isRaceFinished) return;

    const intervalTime = 1000 / playbackSpeed;
    const timer = setInterval(() => {
      // 1. Advance telemetry sector
      setCurrentSector((prevSector) => {
        if (prevSector === 3) {
          // Lap Completed
          let executedPitStopThisLap = false;

          if (boxThisLap) {
            executedPitStopThisLap = true;
            setIsInPitLane(true);
            setActiveCompound(nextPitCompound);
            setTireWear(0);
            setPitStopsCount((c) => c + 1);
            setFuelKg((f) => Math.min(35.0, f + 10.0));
            setBoxThisLap(false);
            
            const pitDuration = (2.2 + Math.random() * 0.4).toFixed(2);
            addRadioMessage(
              "ENGINEER",
              `Box complete! Stationary for ${pitDuration}s. New ${nextPitCompound} tires fitted. Rejoining track!`,
              "SUCCESS"
            );

            setTimeout(() => {
              setIsInPitLane(false);
            }, 1500 / playbackSpeed);
          }

          setCurrentLap((lap) => {
            if (lap >= totalLaps) {
              setIsRaceFinished(true);
              setIsPlaying(false);
              addRadioMessage("ENGINEER", "Chequered Flag! Outstanding drive! Bring the car home.", "SUCCESS");
              return lap;
            }
            return lap + 1;
          });

          // Calculate Lap Time based on Vehicle Performance & Setup/Strategy
          const massPenalty = (metrics.totalMassKg - 798) * 0.035; // +0.035s per kg
          const powerBonus = (metrics.totalPeakHorsepower - 1000) * 0.008; // -0.008s per HP
          const aeroBonus = (metrics.totalDownforceAt250KmhKg - 2500) * 0.0015;

          // Strategy modifiers
          const ersMod =
            ersMode === "ATTACK_OVERTAKE" ? -0.35 : ersMode === "QUALIFYING_HOTLAP" ? -0.5 : ersMode === "ENERGY_SAVE" ? 0.25 : 0;
          const engineMod = engineStratMode === "STRAT_1_MAX" ? -0.3 : engineStratMode === "STRAT_3_ECO" ? 0.4 : 0;
          const tireWearPenalty = (tireWear / 100) * 1.8; // Up to 1.8s penalty on dead tires
          const pitTimePenalty = executedPitStopThisLap ? 21.5 : 0; // 21.5s pit loss

          const lapTime = Math.max(
            78.0,
            84.0 + massPenalty - powerBonus - aeroBonus + ersMod + engineMod + tireWearPenalty + pitTimePenalty + (Math.random() * 0.3 - 0.15)
          );

          setPlayerLapTimes((times) => [...times, Number(lapTime.toFixed(3))]);

          // Update Fuel & Tire Wear based on compounds and engine mode
          const fuelBurnRate = engineStratMode === "STRAT_1_MAX" ? 1.8 : engineStratMode === "STRAT_3_ECO" ? 0.9 : 1.35;
          const wearRate = activeCompound === "SOFT" ? 12 : activeCompound === "MEDIUM" ? 7 : 4;
          
          setFuelKg((f) => Math.max(0.5, f - fuelBurnRate));
          setTireWear((w) => {
            const nextW = Math.min(100, w + wearRate);
            if (nextW > 80 && w <= 80) {
              addRadioMessage("ENGINEER", "WARNING: High tire degradation! Box recommended.", "WARNING");
            }
            return nextW;
          });

          // Dynamic Leaderboard Position Shuffle
          setLeaderboard((prevBoard) => {
            return prevBoard.map((entry) => {
              if (entry.isPlayer) {
                const newGap = executedPitStopThisLap
                  ? entry.gapToLeaderSeconds + 21.5
                  : Math.max(0, entry.gapToLeaderSeconds + (lapTime - 84.2));
                return {
                  ...entry,
                  lapTimeSeconds: lapTime,
                  gapToLeaderSeconds: newGap,
                  tireWearPercent: executedPitStopThisLap ? 0 : tireWear,
                  stopsCount: pitStopsCount + (executedPitStopThisLap ? 1 : 0),
                };
              } else {
                // AI driver progress
                const aiWear = Math.min(100, entry.tireWearPercent + 6);
                const aiGapDelta = (Math.random() * 0.4 - 0.2);
                return {
                  ...entry,
                  tireWearPercent: aiWear,
                  gapToLeaderSeconds: Math.max(0, entry.gapToLeaderSeconds + aiGapDelta),
                };
              }
            }).sort((a, b) => a.gapToLeaderSeconds - b.gapToLeaderSeconds)
              .map((e, idx) => ({ ...e, position: idx + 1 }));
          });

          return 1;
        }
        return (prevSector + 1) as 1 | 2 | 3;
      });

      // Speed & DRS Simulation
      const speedBase = currentSector === 2 ? 210 : 330;
      const speedDrift = Math.floor(Math.random() * 15);
      const drsOn = currentSector === 3 && currentLap > 1;
      setIsDrsActive(drsOn);

      const stratBoost = engineStratMode === "STRAT_1_MAX" ? 12 : 0;
      setCurrentSpeedKmh(speedBase + speedDrift + (drsOn ? 18 : 0) + stratBoost);

      // ERS Battery Charge Cycle
      setErsBatteryPercent((b) => {
        if (ersMode === "ATTACK_OVERTAKE" || ersMode === "QUALIFYING_HOTLAP") {
          return Math.max(5, b - 20);
        } else if (ersMode === "ENERGY_SAVE") {
          return Math.min(100, b + 25);
        }
        return currentSector === 2 ? Math.min(100, b + 15) : Math.max(10, b - 12);
      });

      // Tire Thermal Model
      setTireTempC(() => {
        const baseTemp = activeCompound === "SOFT" ? 104 : activeCompound === "HARD" ? 92 : 98;
        return baseTemp + Math.floor(Math.random() * 6);
      });

    }, intervalTime);

    return () => clearInterval(timer);
  }, [
    isPlaying,
    isRaceFinished,
    playbackSpeed,
    currentSector,
    totalLaps,
    metrics,
    setup,
    boxThisLap,
    nextPitCompound,
    ersMode,
    engineStratMode,
    tireWear,
    activeCompound,
    currentLap,
    pitStopsCount,
  ]);

  const playerPosition = leaderboard.find((e) => e.isPlayer)?.position || 1;

  const handleBoxToggle = () => {
    playHMIClickSound();
    const nextState = !boxThisLap;
    setBoxThisLap(nextState);
    if (nextState) {
      addRadioMessage("DRIVER", `Box this lap! Preparing for ${nextPitCompound} tires.`, "INFO");
      addRadioMessage("ENGINEER", `Copy, pit crew standing by for ${nextPitCompound} compound!`, "SUCCESS");
    } else {
      addRadioMessage("DRIVER", "Stay out, abort box command.", "WARNING");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0a0c10] text-white select-none overflow-hidden">
      {/* Top Session Header */}
      <div className="p-4 bg-black/80 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                {circuit.name} — Grand Prix Session
                {isInPitLane && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold animate-pulse">
                    IN PIT LANE
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-zinc-400">
                {circuit.officialTitle} • Lap {currentLap} / {totalLaps} • Weather: DRY (34°C Track)
              </p>
            </div>
          </div>
        </div>

        {/* Playback Controls & Exit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => {
                playHMIClickSound();
                setIsPlaying(!isPlaying);
              }}
              disabled={isRaceFinished}
              className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            {([1, 2, 4] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  playHMIClickSound();
                  setPlaybackSpeed(speed);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                  playbackSpeed === speed ? "bg-cyan-500 text-black font-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              playHMIClickSound();
              onExitSession?.();
            }}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/20 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            Exit Session
          </button>
        </div>
      </div>

      {/* Main Race Telemetry & Leaderboard Grid */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-5 overflow-hidden">
        {/* Left Column: Live 20-Car Leaderboard */}
        <div className="col-span-4 bg-zinc-900/60 border border-white/10 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-cyan-400" />
              Live Timing Tower
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              Sector {currentSector} / 3
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {leaderboard.map((entry) => (
              <div
                key={entry.position}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition-all ${
                  entry.isPlayer
                    ? "bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/20 text-white font-bold"
                    : "bg-black/40 border-white/5 text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-5 font-black ${entry.position <= 3 ? "text-amber-400" : "text-zinc-400"}`}>
                    P{entry.position}
                  </span>
                  <div>
                    <span className="font-bold block text-[11px] flex items-center gap-1.5">
                      {entry.driverName}
                      {entry.isPlayer && (
                        <span className="text-[9px] bg-cyan-500 text-black px-1 rounded font-black">YOU</span>
                      )}
                    </span>
                    <span className="text-[9px] text-zinc-500">{entry.teamName}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-white block">
                    {entry.position === 1 ? `${entry.lapTimeSeconds.toFixed(3)}s` : `+${entry.gapToLeaderSeconds.toFixed(3)}s`}
                  </span>
                  <span className="text-[9px] text-zinc-400">
                    Stops: {entry.stopsCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center & Right Column: Interactive Pit Wall & Telemetry Cockpit */}
        <div className="col-span-8 space-y-4 flex flex-col justify-between overflow-y-auto pr-1">
          {/* Tactical Pit Wall Command Center */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-cyan-500/30 shadow-xl bg-gradient-to-r from-zinc-900/90 to-black">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                  Pit Wall Tactical Strategy Center
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-zinc-400">Current Tire:</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-white font-bold border border-white/10">
                  {activeCompound}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {/* Box Call Button */}
              <button
                onClick={handleBoxToggle}
                className={`p-3 rounded-xl border font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  boxThisLap
                    ? "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30 animate-pulse"
                    : "bg-zinc-800 hover:bg-zinc-700 text-white border-white/10"
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>{boxThisLap ? "CANCEL BOX" : "BOX THIS LAP"}</span>
              </button>

              {/* Next Tire Selector */}
              <div className="bg-black/50 border border-white/10 p-2.5 rounded-xl flex flex-col justify-between">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Next Pit Compound
                </label>
                <select
                  value={nextPitCompound}
                  onChange={(e) => {
                    playHMIClickSound();
                    setNextPitCompound(e.target.value as any);
                  }}
                  className="w-full bg-zinc-900 text-xs font-bold text-white border border-white/20 rounded-lg p-1.5 outline-none cursor-pointer"
                >
                  <option value="SOFT">SOFT (Fastest, High Deg)</option>
                  <option value="MEDIUM">MEDIUM (Balanced)</option>
                  <option value="HARD">HARD (Durable, Low Deg)</option>
                  <option value="INTERMEDIATE">INTERMEDIATE (Wet)</option>
                </select>
              </div>

              {/* Dynamic ERS Strategy Selector */}
              <div className="bg-black/50 border border-white/10 p-2.5 rounded-xl flex flex-col justify-between">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                  ERS Deployment Strategy
                </label>
                <select
                  value={ersMode}
                  onChange={(e) => {
                    playHMIClickSound();
                    const newMode = e.target.value as any;
                    setErsMode(newMode);
                    addRadioMessage("ENGINEER", `ERS Deployment mode changed to ${newMode.replace("_", " ")}`, "INFO");
                  }}
                  className="w-full bg-zinc-900 text-xs font-bold text-emerald-400 border border-white/20 rounded-lg p-1.5 outline-none cursor-pointer"
                >
                  <option value="BALANCED_RACE">BALANCED RACE</option>
                  <option value="ATTACK_OVERTAKE">ATTACK / OVERTAKE (-0.35s)</option>
                  <option value="QUALIFYING_HOTLAP">HOT LAP MAX POWER (-0.50s)</option>
                  <option value="ENERGY_SAVE">ENERGY REGEN HARVEST</option>
                </select>
              </div>

              {/* Engine Mapping Mode */}
              <div className="bg-black/50 border border-white/10 p-2.5 rounded-xl flex flex-col justify-between">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Engine Mapping Strategy
                </label>
                <select
                  value={engineStratMode}
                  onChange={(e) => {
                    playHMIClickSound();
                    const newStrat = e.target.value as any;
                    setEngineStratMode(newStrat);
                    addRadioMessage("ENGINEER", `Engine map set to ${newStrat.replace("_", " ")}`, "INFO");
                  }}
                  className="w-full bg-zinc-900 text-xs font-bold text-cyan-400 border border-white/20 rounded-lg p-1.5 outline-none cursor-pointer"
                >
                  <option value="STRAT_1_MAX">STRAT 1: MAX POWER (+25 HP)</option>
                  <option value="STRAT_2_RACE">STRAT 2: STANDARD RACE</option>
                  <option value="STRAT_3_ECO">STRAT 3: FUEL SAVE (-40% Fuel)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Telemetry Gauges */}
          <div className="grid grid-cols-3 gap-3">
            {/* Speed & Gear */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 text-center relative overflow-hidden">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                GPS SPEED
              </span>
              <span className="text-3xl font-black font-mono text-cyan-400">{currentSpeedKmh}</span>
              <span className="text-[10px] font-mono text-zinc-500 ml-1">KM/H</span>
              <div className="mt-2 text-xs font-bold text-zinc-300">
                Gear 8 • {(11800 + (currentSpeedKmh % 40) * 30).toLocaleString()} RPM
              </div>
            </div>

            {/* ERS & Battery */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                ERS ENERGY STORE
              </span>
              <span className="text-3xl font-black font-mono text-emerald-400">{ersBatteryPercent}%</span>
              <div className="mt-2 text-xs font-bold text-zinc-300 flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                {ersMode.replace("_", " ")}
              </div>
            </div>

            {/* DRS & Aerodynamics */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 text-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                AERODYNAMICS & DRS
              </span>
              <span className={`text-2xl font-black font-mono ${isDrsActive ? "text-emerald-400" : "text-zinc-500"}`}>
                {isDrsActive ? "DRS OPEN" : "DRS CLOSED"}
              </span>
              <div className="mt-2 text-xs font-bold text-zinc-300">
                {metrics.totalDownforceAt250KmhKg} kg Downforce
              </div>
            </div>
          </div>

          {/* Thermal, Consumables & Radio Log */}
          <div className="grid grid-cols-12 gap-3">
            {/* Consumables Monitor */}
            <div className="col-span-7 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex flex-col justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300 mb-2">
                Vehicle Consumables & Physical State
              </h3>

              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px]">TIRE WEAR ({activeCompound})</span>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden my-1.5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        tireWear > 75 ? "bg-red-500" : tireWear > 45 ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                      style={{ width: `${tireWear}%` }}
                    />
                  </div>
                  <span className="text-white font-bold">{tireWear}% Degraded ({tireTempC}°C)</span>
                </div>

                <div>
                  <span className="text-zinc-400 block text-[10px]">FUEL MASS</span>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden my-1.5">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all"
                      style={{ width: `${(fuelKg / 35.0) * 100}%` }}
                    />
                  </div>
                  <span className="text-white font-bold">{fuelKg.toFixed(1)} kg Remaining</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Homologation: <strong className="text-emerald-400">{homologationPassportId}</strong></span>
                <span>Pit Stops Executed: <strong className="text-white">{pitStopsCount}</strong></span>
              </div>
            </div>

            {/* Tactical Pit Wall Radio Feed */}
            <div className="col-span-5 p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex flex-col h-48 overflow-hidden">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10 mb-2">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Pit Wall Radio Channel
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-[10px] font-mono scrollbar-thin">
                {radioLogs.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-lg border ${
                      msg.type === "CRITICAL"
                        ? "bg-red-950/40 border-red-500/40 text-red-300"
                        : msg.type === "WARNING"
                        ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                        : msg.type === "SUCCESS"
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                        : "bg-black/40 border-white/5 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-0.5 text-[9px]">
                      <span>[{msg.sender}] Lap {msg.lap}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div>{msg.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Race Completed Celebration Modal */}
          {isRaceFinished && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/90 to-black border-2 border-cyan-400 shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Grand Prix Finished — P{playerPosition}!
                  </h3>
                  <p className="text-xs text-zinc-300">
                    Your custom-built car completed the race at {circuit.name} after {pitStopsCount} pit stop(s)!
                  </p>
                </div>
              </div>

              <button
                onClick={onExitSession}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
              >
                View Championship Standings →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const F1LiveRaceSimulator = React.memo(F1LiveRaceSimulatorComponent);


