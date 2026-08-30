// ============================================================================
// HYPERCAR LIVE 24H ENDURANCE RACE SIMULATOR & TELEMETRY ENGINE
// ============================================================================

import React, { useState, useEffect, useRef, memo } from "react";
import { useHypercarAssemblyStore } from "../../../sim/hypercar/state/hypercarAssemblyStore";
import type { WECCircuitProfile } from "../../../sim/hypercar/season/wecCalendar";
import type { HypercarGarageSetup } from "../garage/HypercarGarageSetupStudio";
import { WEC_RIVAL_HYPERCAR_TEAMS } from "../../../sim/hypercar/season/wecRivalTeams";
import { playHMIClickSound } from "../../../utils/hmiSoundSynth";
import {
  Trophy,
  Flag,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Flame,
  Wind,
  Gauge,
  Thermometer,
  Shield,
  Clock,
  Moon,
  Sun,
  Award,
  Sparkles,
  AlertTriangle,
  Radio,
  Compass,
} from "lucide-react";

interface HypercarLiveRaceSimulatorProps {
  circuit: WECCircuitProfile;
  setup: HypercarGarageSetup;
  onExitSession: () => void;
}

export const HypercarLiveRaceSimulator: React.FC<HypercarLiveRaceSimulatorProps> = memo(function HypercarLiveRaceSimulator({
  circuit,
  setup,
  onExitSession,
}) {
  const { metrics, homologationPassportId } = useHypercarAssemblyStore();

  const [currentHour, setCurrentHour] = useState(1);
  const totalHours = circuit.raceDurationHours;
  const [currentLap, setCurrentLap] = useState(1);
  const totalSimLaps = Math.min(12, totalHours * 2);

  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);

  // Live Telemetry State
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(295);
  const [frontMguActive, setFrontMguActive] = useState(false);
  const [batterySocPercent, setBatterySocPercent] = useState(88);
  const [fuelKg, setFuelKg] = useState(55.0);
  const [tireWearPercent, setTireWearPercent] = useState(5);
  const [brakeTempC, setBrakeTempC] = useState(580);
  const [playerPosition, setPlayerPosition] = useState(2);
  const [raceFinished, setRaceFinished] = useState(false);
  const [driverFatiguePercent, setDriverFatiguePercent] = useState(15);
  const [isOvertakeModeActive, setIsOvertakeModeActive] = useState(false);
  const [isFcyActive, setIsFcyActive] = useState(false);

  const [isPitStopActive, setIsPitStopActive] = useState(false);
  const [pitStopMessage, setPitStopMessage] = useState<string | null>(null);

  // 24H Day / Night Cycle (Day -> Dusk -> Night -> Dawn)
  const lapProgress = currentLap / totalSimLaps;
  const timeOfDay =
    lapProgress < 0.3 ? "DAY" : lapProgress < 0.5 ? "DUSK" : lapProgress < 0.85 ? "NIGHT" : "DAWN";

  const handleExecutePitStop = () => {
    playHMIClickSound();
    setIsPitStopActive(true);
    setPitStopMessage("BOX THIS LAP! Changing Michelin tires, driver swap & refueling 90 kg...");
    setTimeout(() => {
      setFuelKg(90.0);
      setTireWearPercent(0);
      setBatterySocPercent(100);
      setBrakeTempC(450);
      setDriverFatiguePercent(5);
      setIsPitStopActive(false);
      setPitStopMessage("PIT STOP COMPLETE (29.8s) — Fresh Driver & Tires on Track!");
      setTimeout(() => setPitStopMessage(null), 4000);
    }, 2200);
  };

  const handleTriggerOvertakeBoost = () => {
    if (batterySocPercent < 15 || isOvertakeModeActive) return;
    playHMIClickSound();
    setIsOvertakeModeActive(true);
    setBatterySocPercent((prev) => Math.max(5, prev - 12));
    setCurrentSpeedKmh((prev) => prev + 22);
    setTimeout(() => {
      setIsOvertakeModeActive(false);
    }, 4000);
  };

  // Grid Simulation
  const [leaderboard, setLeaderboard] = useState([
    { pos: 1, team: "Ferrari AF Corse", car: "Ferrari 499P", gap: "LEADER", bestLap: "3:24.182" },
    { pos: 2, team: "Apex Works Racing", car: "Apex LMH-01 (Your Car)", gap: "+1.428s", bestLap: "3:24.510" },
    { pos: 3, team: "Toyota Gazoo Racing", car: "Toyota GR010", gap: "+3.104s", bestLap: "3:24.890" },
    { pos: 4, team: "Porsche Penske", car: "Porsche 963", gap: "+5.820s", bestLap: "3:25.210" },
    { pos: 5, team: "Cadillac Racing", car: "Cadillac V-Series.R", gap: "+8.910s", bestLap: "3:25.640" },
    { pos: 6, team: "BMW M Team WRT", car: "BMW M Hybrid V8", gap: "+12.450s", bestLap: "3:26.120" },
    { pos: 7, team: "Alpine Endurance", car: "Alpine A424", gap: "+16.890s", bestLap: "3:26.800" },
    { pos: 8, team: "Peugeot TotalEnergies", car: "Peugeot 9X8", gap: "+21.340s", bestLap: "3:27.450" },
  ]);

  // Deterministic seeded pseudo-random for simulation stability
  const seededRand = (seed: number, offset: number): number => {
    const x = Math.sin(seed * 9301 + offset * 49297) * 49999;
    return x - Math.floor(x);
  };

  // Mutable ref for simulation loop to avoid recreating intervals
  const simStateRef = useRef({
    currentLap,
    totalSimLaps,
    totalHours,
    setup,
    isFcyActive,
    isOvertakeModeActive,
  });

  useEffect(() => {
    simStateRef.current = {
      currentLap,
      totalSimLaps,
      totalHours,
      setup,
      isFcyActive,
      isOvertakeModeActive,
    };
  });

  // Simulation Tick Loop (Stable Non-Recreating Interval)
  useEffect(() => {
    if (!isPlaying || raceFinished) return;
    let tickCount = currentLap;

    const interval = setInterval(() => {
      tickCount++;
      const s = tickCount;
      const state = simStateRef.current;

      setCurrentLap((prev) => {
        const next = prev + 1;
        if (next > state.totalSimLaps) {
          setRaceFinished(true);
          return state.totalSimLaps;
        }
        return next;
      });

      // Hour advancement
      setCurrentHour((prev) => Math.min(state.totalHours, prev + 1));

      // Trigger occasional Full Course Yellow (FCY)
      if (s === 6 && !state.isFcyActive) {
        setIsFcyActive(true);
        setTimeout(() => setIsFcyActive(false), 5000);
      }

      // Telemetry dynamics
      const simulatedSpeed = state.isFcyActive ? 80 : Math.floor(275 + seededRand(s, 1) * 55 + (state.isOvertakeModeActive ? 22 : 0));
      setCurrentSpeedKmh(simulatedSpeed);
      setFrontMguActive(simulatedSpeed >= state.setup.frontMguDeploySpeedKmh && !state.isFcyActive);

      // Battery & Fuel
      setBatterySocPercent((prev) => Math.max(25, Math.min(98, prev + (seededRand(s, 2) > 0.4 ? -4 : 8))));
      setFuelKg((prev) => Math.max(5.0, prev - (state.isFcyActive ? 1.0 : 3.4)));

      // Tires, Brakes & Driver Fatigue
      setTireWearPercent((prev) => Math.min(90, prev + (state.isFcyActive ? 1 : Math.floor(seededRand(s, 3) * 6))));
      setBrakeTempC(state.isFcyActive ? 320 : Math.floor(520 + state.setup.brakeDuctTapePercent * 2 + seededRand(s, 4) * 60));
      setDriverFatiguePercent((prev) => Math.min(95, prev + 6));

      // Position Battles
      if (seededRand(s, 5) > 0.65 && !state.isFcyActive) {
        setPlayerPosition((prev) => Math.max(1, Math.min(3, prev + (seededRand(s, 6) > 0.5 ? -1 : 1))));
      }
    }, 1800 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, raceFinished]);

  return (
    <div className="w-full h-full flex flex-col bg-amber-950/60 text-white select-none relative overflow-hidden">
      {/* Dynamic 24H Atmosphere Sky Gradient Layer */}
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-1000 opacity-25 ${
          timeOfDay === "DAY"
            ? "bg-gradient-to-b from-amber-500/20 via-transparent to-black"
            : timeOfDay === "DUSK"
            ? "bg-gradient-to-b from-amber-600/30 via-amber-900/20 to-black"
            : timeOfDay === "NIGHT"
            ? "bg-gradient-to-b from-amber-950/40 via-cyan-950/20 to-black"
            : "bg-gradient-to-b from-rose-500/25 via-amber-900/20 to-black"
        }`}
      />

      {/* Top Session Header */}
      <div className="p-4 bg-black/80 border-b border-white/10 flex items-center justify-between backdrop-blur-xl z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playHMIClickSound();
              onExitSession();
            }}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            ← Exit Session
          </button>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                {circuit.name} — 24H Endurance Session
                {isFcyActive && (
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-mono font-black animate-pulse">
                    FULL COURSE YELLOW (FCY 80 KM/H)
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-zinc-400">
                {circuit.officialTitle} • Hour {currentHour} / {totalHours}H • Lap {currentLap} / {totalSimLaps}
              </p>
            </div>
          </div>
        </div>

        {/* Playback Controls & Time-of-Day Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 border border-white/15 text-xs font-mono">
            {timeOfDay === "NIGHT" ? (
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Moon className="w-4 h-4" /> NIGHT STINT (14°C Air)
              </span>
            ) : timeOfDay === "DUSK" ? (
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Sun className="w-4 h-4" /> DUSK TWILIGHT
              </span>
            ) : timeOfDay === "DAWN" ? (
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <Sun className="w-4 h-4" /> DAWN SUNRISE
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <Sun className="w-4 h-4" /> DAY STINT (32°C Tarmac)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 rounded-xl p-1 shadow-md">
            <button
              onClick={() => {
                playHMIClickSound();
                setIsPlaying(!isPlaying);
              }}
              className="p-1.5 rounded-lg bg-black/40 hover:bg-black text-white transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>
            {([1, 2, 4] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  playHMIClickSound();
                  setPlaybackSpeed(spd);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  playbackSpeed === spd ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Race Grid */}
      <div className="flex-1 grid grid-cols-12 gap-5 p-6 overflow-y-auto min-h-0 z-10">
        {/* Left 4 Cols: Live Timing Tower */}
        <div className="col-span-4 space-y-3">
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 shadow-xl">
            <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-400" />
              WEC Hypercar Timing Tower
            </h3>

            <div className="space-y-1.5">
              {leaderboard.map((car, i) => {
                const isPlayer = car.team.includes("Apex");
                const pos = isPlayer ? playerPosition : i >= playerPosition ? i + 1 : i + 1;

                return (
                  <div
                    key={car.team}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                      isPlayer
                        ? "bg-amber-500/20 border-amber-500/80 shadow-md shadow-amber-500/20 text-white font-bold"
                        : "bg-black/40 border-white/5 text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 text-center font-black text-amber-400">P{pos}</span>
                      <div className="truncate">
                        <div className="truncate text-[11px] font-sans font-bold">{car.team}</div>
                        <div className="text-[9px] text-zinc-500 truncate">{car.car}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-amber-300">{car.gap}</div>
                      <div className="text-[9px] text-zinc-500">{car.bestLap}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Real-time Hypercar Cockpit Telemetry */}
        <div className="col-span-8 space-y-4">
          {/* Speedometer & e-AWD Hybrid State Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-white/10 relative overflow-hidden shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                  LIVE GPS SPEED
                </span>
                <div className="text-6xl font-black font-mono tracking-tighter text-white">
                  {currentSpeedKmh} <span className="text-lg text-amber-400 font-sans font-bold">KM/H</span>
                </div>
              </div>

              {/* Action Buttons: Overtake Boost & e-AWD */}
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={handleTriggerOvertakeBoost}
                  disabled={batterySocPercent < 15 || isOvertakeModeActive || isFcyActive}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isOvertakeModeActive
                      ? "bg-amber-400 text-black border-amber-300 shadow-xl shadow-amber-400/40 animate-pulse"
                      : "bg-zinc-800 hover:bg-zinc-700 text-amber-300 border-amber-500/30"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {isOvertakeModeActive ? "OVERTAKE BOOST ACTIVE (+22 KM/H)" : "TRIGGER OVERTAKE BOOST (200 kW)"}
                </button>

                <div
                  className={`px-3 py-1 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all ${
                    frontMguActive
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/20"
                      : "bg-zinc-800 text-zinc-500 border-white/10"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  {frontMguActive ? "FRONT AXLE DEPLOYING (200 kW)" : `STANDBY (<${setup.frontMguDeploySpeedKmh} km/h)`}
                </div>
              </div>
            </div>

            {/* Live Sensor Bars */}
            <div className="grid grid-cols-4 gap-3 mt-6">
              {/* Hybrid Battery SoC */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" /> 900V BATTERY
                  </span>
                  <span className="text-emerald-400 font-bold">{batterySocPercent}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full transition-all" style={{ width: `${batterySocPercent}%` }} />
                </div>
              </div>

              {/* Fuel Level */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" /> FUEL TANK
                  </span>
                  <span className="text-amber-400 font-bold">{fuelKg.toFixed(1)} kg</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full transition-all" style={{ width: `${(fuelKg / 90) * 100}%` }} />
                </div>
              </div>

              {/* Tire Wear */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>MICHELIN WEAR</span>
                  <span className="text-rose-400 font-bold">{tireWearPercent}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full transition-all" style={{ width: `${tireWearPercent}%` }} />
                </div>
              </div>

              {/* Brake Temperatures */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-orange-400" /> CARBON BRAKES
                  </span>
                  <span className="text-orange-400 font-bold">{brakeTempC}°C</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full transition-all" style={{ width: `${(brakeTempC / 800) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Stint Performance & Reliability Report Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-white/10 space-y-3 shadow-xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              24H Stint Diagnostics & Driver Management
            </h4>
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-zinc-500 block">COOLING MARGIN</span>
                <span className="font-bold text-emerald-400">Optimal (+{metrics.totalCoolingCapacityKw} kW)</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-zinc-500 block">DRIVER FATIGUE</span>
                <span className={`font-bold ${driverFatiguePercent > 70 ? "text-rose-400" : "text-amber-400"}`}>
                  {driverFatiguePercent}% (Swap Recommended)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-zinc-500 block">CHASSIS INTEGRITY</span>
                <span className="font-bold text-white">100% Carbotanium Tub Rigidity</span>
              </div>
            </div>

            {/* Pit Stop Button & Alert Warnings */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={handleExecutePitStop}
                disabled={isPitStopActive || raceFinished}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  isPitStopActive
                    ? "bg-amber-500/30 text-amber-300 animate-pulse border border-amber-500/60 cursor-wait"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 shadow-lg shadow-amber-500/20 cursor-pointer"
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isPitStopActive ? "PIT IN PROGRESS..." : "BOX THIS LAP — Pit Stop"}
              </button>

              <div className="flex items-center gap-3">
                {fuelKg < 15 && (
                  <span className="text-[10px] font-bold text-rose-400 animate-pulse flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> LOW FUEL — PIT WINDOW OPEN
                  </span>
                )}
                {tireWearPercent > 65 && (
                  <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5" /> HIGH TIRE DEGRADATION
                  </span>
                )}
              </div>
            </div>

            {/* Pit Stop Status Banner */}
            {pitStopMessage && (
              <div className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all ${
                isPitStopActive
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                  : "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
              }`}>
                {pitStopMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Race Finish Modal */}
      {raceFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="max-w-md w-full bg-zinc-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4 text-white text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Award className="w-8 h-8 text-amber-400" />
            </div>

            <h3 className="text-xl font-black uppercase tracking-wider">
              {circuit.name} — Chequered Flag!
            </h3>
            <p className="text-xs text-zinc-400">
              Your custom constructed Hypercar completed the 24H endurance distance with 0 mechanical failures.
            </p>

            <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-zinc-500">FINAL FINISH POSITION:</span>
                <span className="text-amber-400 font-bold text-sm">P{playerPosition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">WEC CHAMPIONSHIP POINTS:</span>
                <span className="text-emerald-400 font-bold">
                  {playerPosition === 1 ? "+25 PTS" : playerPosition === 2 ? "+18 PTS" : "+15 PTS"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">HOMOLOGATED PASSPORT:</span>
                <span className="text-white">{homologationPassportId}</span>
              </div>
            </div>

            <button
              onClick={() => {
                playHMIClickSound();
                onExitSession();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer"
            >
              Return to Hypercar Studio
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
