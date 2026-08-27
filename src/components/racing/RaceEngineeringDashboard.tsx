// ============================================================================
// RACE ENGINEERING SUITE — RACE ENGINEERING DASHBOARD
// ============================================================================
// Main dashboard container for the complete race engineering experience.
// Orchestrates telemetry, strategy, tires, weather, and race control panels
// in a responsive multi-column layout with warm amber theme.
// ============================================================================

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { LiveTelemetrySimulator, TelemetryFrame } from '../../sim/telemetry/liveTelemetrySimulator';
import { PacejkaTireModel, TIRE_COMPOUNDS } from '../../sim/tires/pacejkaTireModel';
import { RaceWeatherSystem, WeatherState } from '../../sim/weather/raceWeatherSystem';
import { RaceControlSystem, FlagColor } from '../../sim/racing/raceControlSystem';
import { PitStopStrategyEngine, RaceStrategy } from '../../sim/racing/pitStopStrategy';
import { FuelModel } from '../../sim/racing/fuelModel';
import { DriverPerformanceModel, PRO_DRIVER_PROFILES } from '../../sim/racing/driverPerformanceModel';
import { RaceEngineerAI, EngineerMessage } from '../../sim/ai/raceEngineerAI';
import { CIRCUIT_DATABASE } from '../../sim/track/circuitDatabase';
import { DynamicAeroModel } from '../../sim/aerodynamics/dynamicAeroModel';
import { BrakeThermalSimulator } from '../../sim/thermal/brakeThermalSimulator';
import { playHMIClickSound, playHMITabSound } from '../../utils/hmiSoundSynth';

interface RaceEngineeringDashboardProps {
  className?: string;
}

type DashboardTab = 'overview' | 'telemetry' | 'strategy' | 'tires' | 'weather' | 'engineer';

export const RaceEngineeringDashboard: React.FC<RaceEngineeringDashboardProps> = memo(({
  className = 'w-full min-h-screen',
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isRunning, setIsRunning] = useState(false);
  const [currentLap, setCurrentLap] = useState(0);
  const [totalLaps] = useState(52);
  const [position, setPosition] = useState(3);

  // Simulators
  const [telemetry] = useState(() => new LiveTelemetrySimulator('silverstone', 'RACE', 87.5, 110));
  const [tireFL] = useState(() => new PacejkaTireModel('medium'));
  const [tireFR] = useState(() => new PacejkaTireModel('medium'));
  const [tireRL] = useState(() => new PacejkaTireModel('medium'));
  const [tireRR] = useState(() => new PacejkaTireModel('medium'));
  const [weather] = useState(() => new RaceWeatherSystem('partly_cloudy', 0.6));
  const [raceControl] = useState(() => new RaceControlSystem(totalLaps));
  const [fuel] = useState(() => new FuelModel(110, 5.891));
  const [driver] = useState(() => new DriverPerformanceModel(PRO_DRIVER_PROFILES[0]));
  const [engineer] = useState(() => new RaceEngineerAI());
  const [aero] = useState(() => new DynamicAeroModel({
    frontWingAngle: 12, rearWingAngle: 15, frontSplitterLength: 0.35,
    rearDiffuserAngle: 12, floorSeal: 0.9, rideHeightFront: 30,
    rideHeightRear: 75, drsEnabled: true, dragCoefficient: 1.05,
    liftCoefficient: -3.2, frontalArea: 1.85,
  }));
  const [brakes] = useState(() => new BrakeThermalSimulator('carbon_ceramic', 0.85));

  // State
  const [currentFrame, setCurrentFrame] = useState<TelemetryFrame | null>(null);
  const [weatherState, setWeatherState] = useState<WeatherState | null>(null);
  const [engineerMessages, setEngineerMessages] = useState<EngineerMessage[]>([]);
  const [strategies, setStrategies] = useState<RaceStrategy[]>([]);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryFrame[]>([]);
  const [raceTime, setRaceTime] = useState(0);
  const raceTimeRef = useRef(0);
  const currentLapRef = useRef(currentLap);
  useEffect(() => {
    currentLapRef.current = currentLap;
  }, [currentLap]);
  const [flagColor, setFlagColor] = useState<FlagColor>('green');

  const track = CIRCUIT_DATABASE.silverstone;

  // Initialize
  useEffect(() => {
    raceControl.startRace();
    const stratEngine = new PitStopStrategyEngine(track.length, totalLaps, 22);
    setStrategies(stratEngine.generateStrategies('medium', 110));
  }, []);

  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (document.hidden) return;
      raceTimeRef.current += 1;
      setRaceTime(raceTimeRef.current);
      const lapProgress = (raceTimeRef.current % 90) / 90;

      // Generate telemetry
      const frame = telemetry.generateFrame(lapProgress, track.length);
      setCurrentFrame(frame);
      setTelemetryHistory(prev => [...prev.slice(-200), frame]);

      // Update weather
      const w = weather.tickMinute();
      setWeatherState(w);

      // Update tires
      const load = 4500 + Math.random() * 500;
      const slipAngle = frame.steeringAngle * 0.01;
      tireFL.update(1, load, slipAngle, frame.slipRatio, frame.speed, weather.getTrackWetness());
      tireFR.update(1, load, -slipAngle, frame.slipRatio, frame.speed, weather.getTrackWetness());
      tireRL.update(1, load * 0.95, slipAngle * 0.7, frame.slipRatio, frame.speed, weather.getTrackWetness());
      tireRR.update(1, load * 0.95, -slipAngle * 0.7, frame.slipRatio, frame.speed, weather.getTrackWetness());

      // Update brakes
      brakes.update(1, frame.speed, frame.brake, frame.lonG);

      // Fuel
      fuel.consumeLap(frame.throttle, frame.rpm, track.altitude);

      // Race control
      if (lapProgress > 0.95 && currentLapRef.current < totalLaps) {
        const newLap = currentLapRef.current + 1;
        currentLapRef.current = newLap;
        setCurrentLap(newLap);
        tireFL.newLap(); tireFR.newLap(); tireRL.newLap(); tireRR.newLap();
        raceControl.updateLap(newLap, new Map());
        const flag = raceControl.getFlagForZone(0);
        setFlagColor(flag);
        setFuelState(fuel.getState());
      }

      // AI Engineer
      const aiMessages = engineer.analyze({
        currentLap: currentLapRef.current, totalLaps, position, totalCars: 20,
        tireCompound: 'medium', tireWear: tireFL.getState().wear,
        tireTemp: tireFL.getState().temperature,
        fuelRemaining: fuel.getFuelLoad(),
        fuelLaps: fuel.getRemainingLaps(),
        gapAhead: 1.2 + Math.random() * 2, gapBehind: 2.5 + Math.random() * 3,
        lapTimeLast: frame.lapTime, lapTimeBest: 87.0,
        sectorTimes: [28.5, 33.2, 25.8],
        trackTemp: w.trackTemperature, airTemp: w.airTemperature,
        rainIntensity: w.rainIntensity, rainProbability: w.rainProbability,
        safetyCarActive: raceControl.isSafetyCarActive(),
        drsEnabled: true, recentLapTimes: [87.5, 87.8, 88.1],
        positionChanges: [],
      });
      if (aiMessages.length > 0) {
        setEngineerMessages(prev => [...prev.slice(-50), ...aiMessages]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning]);

  const [fuelState, setFuelState] = useState(fuel.getState());

  const toggleSimulation = useCallback(() => {
    playHMIClickSound();
    setIsRunning(prev => !prev);
  }, []);

  const flagBg: Record<FlagColor, string> = {
    green: 'bg-green-500', yellow: 'bg-yellow-400', double_yellow: 'bg-yellow-400',
    red: 'bg-red-600', chequered: 'bg-black', blue: 'bg-blue-500',
    white: 'bg-white', black: 'bg-black', black_orange: 'bg-orange-500',
  };

  const tabs: { id: DashboardTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '\u25C9' },
    { id: 'telemetry', label: 'Telemetry', icon: '\u25B2' },
    { id: 'strategy', label: 'Strategy', icon: '\u2699' },
    { id: 'tires', label: 'Tires', icon: '\u25CF' },
    { id: 'weather', label: 'Weather', icon: '\u2601' },
    { id: 'engineer', label: 'Race Engineer', icon: '\u260E' },
  ];

  return (
    <div className={`${className} bg-amber-950/80 border border-amber-800/40 rounded-3xl overflow-hidden shadow-2xl font-mono`}>
      {/* Header */}
      <div className="w-full p-4 bg-amber-950/95 border-b border-amber-800/50 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${flagBg[flagColor]} shadow-lg`} />
            <h2 className="text-amber-100 text-lg font-bold tracking-wider">RACE ENGINEERING SUITE</h2>
            <span className="text-amber-500 text-sm">LAP {currentLap}/{totalLaps}</span>
            <span className="text-amber-400/60 text-xs">P{position}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-amber-300 text-sm">{Math.floor(raceTime / 60)}:{String(raceTime % 60).padStart(2, '0')}</span>
            <button onClick={toggleSimulation}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isRunning ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500 text-amber-950'
              }`}>
              {isRunning ? '\u23F9 STOP' : '\u25B6 START RACE'}
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => {
              playHMITabSound();
              setActiveTab(tab.id);
            }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-amber-950 shadow-md'
                  : 'text-amber-400/70 hover:text-amber-200 hover:bg-amber-900/30'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: '75vh' }}>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick Telemetry */}
            <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
              <h3 className="text-amber-300 text-sm font-bold mb-3">\u25B2 LIVE TELEMETRY</h3>
              {currentFrame && (
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-amber-500 text-xs">SPEED</span><p className="text-amber-100 text-2xl font-bold">{currentFrame.speed}<span className="text-sm">km/h</span></p></div>
                  <div><span className="text-amber-500 text-xs">RPM</span><p className="text-amber-100 text-2xl font-bold">{currentFrame.rpm.toLocaleString()}</p></div>
                  <div><span className="text-amber-500 text-xs">GEAR</span><p className="text-amber-100 text-2xl font-bold">{currentFrame.gear}</p></div>
                  <div><span className="text-amber-500 text-xs">THROTTLE</span>
                    <div className="w-full h-2 bg-amber-950 rounded-full mt-1"><div className="h-full bg-green-500 rounded-full" style={{ width: `${currentFrame.throttle * 100}%` }} /></div>
                  </div>
                  <div><span className="text-amber-500 text-xs">BRAKE</span>
                    <div className="w-full h-2 bg-amber-950 rounded-full mt-1"><div className="h-full bg-red-500 rounded-full" style={{ width: `${currentFrame.brake * 100}%` }} /></div>
                  </div>
                  <div><span className="text-amber-500 text-xs">DRS</span><p className={`text-lg font-bold ${currentFrame.drs ? 'text-green-400' : 'text-amber-600'}`}>{currentFrame.drs ? 'OPEN' : 'CLOSED'}</p></div>
                </div>
              )}
            </div>

            {/* Tire Overview */}
            <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
              <h3 className="text-amber-300 text-sm font-bold mb-3">{'\u25CF'} TIRE STATUS</h3>
              <div className="grid grid-cols-2 gap-3">
                {([['FL', tireFL], ['FR', tireFR], ['RL', tireRL], ['RR', tireRR]] as [string, typeof tireFL][]).map(([label, tire]) => {
                  const s = tire.getState();
                  const tempColor = s.temperature > 110 ? 'text-red-400' : s.temperature > 80 ? 'text-green-400' : 'text-blue-400';
                  return (
                    <div key={label} className="bg-amber-950/40 rounded-xl p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-500 text-xs font-bold">{label}</span>
                        <span className={tempColor + ' text-xs'}>{Math.round(s.temperature)}\u00B0C</span>
                      </div>
                      <div className="text-amber-300 text-sm">{s.wear.toFixed(1)}%</div>
                      <div className="w-full h-1.5 bg-amber-900 rounded-full mt-1">
                        <div className="h-full rounded-full" style={{
                          width: `${s.wear}%`,
                          backgroundColor: s.wear > 60 ? '#ef4444' : s.wear > 30 ? '#facc15' : '#22c55e',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weather Quick */}
            <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
              <h3 className="text-amber-300 text-sm font-bold mb-3">{'\u2601'} WEATHER</h3>
              {weatherState && (
                <div className="space-y-2">
                  <div className="text-amber-100 text-lg font-bold capitalize">{weatherState.condition.replace('_', ' ')}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-amber-500">Air</span> <span className="text-amber-200">{Math.round(weatherState.airTemperature)}\u00B0C</span></div>
                    <div><span className="text-amber-500">Track</span> <span className="text-amber-200">{Math.round(weatherState.trackTemperature)}\u00B0C</span></div>
                    <div><span className="text-amber-500">Wind</span> <span className="text-amber-200">{Math.round(weatherState.windSpeed)} km/h</span></div>
                    <div><span className="text-amber-500">Rain</span> <span className="text-amber-200">{Math.round(weatherState.rainProbability)}%</span></div>
                  </div>
                  <div className="text-xs text-amber-400/70">Recommended: {weather.getRecommendedTire().toUpperCase()} tires</div>
                </div>
              )}
            </div>

            {/* Fuel */}
            <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
              <h3 className="text-amber-300 text-sm font-bold mb-3">{'\u26FD'} FUEL</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-amber-500 text-xs">LOAD</span>
                  <span className="text-amber-100 font-bold">{fuelState.currentLoad.toFixed(1)} kg</span>
                </div>
                <div className="w-full h-3 bg-amber-950 rounded-full">
                  <div className="h-full bg-gradient-to-r from-amber-600 to-green-500 rounded-full transition-all"
                    style={{ width: `${(fuelState.currentLoad / fuelState.maxCapacity) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-amber-500">{fuel.getRemainingLaps()} laps left</span>
                  <span className="text-amber-400/70">{fuelState.mixture}</span>
                </div>
              </div>
            </div>

            {/* Brakes */}
            <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
              <h3 className="text-amber-300 text-sm font-bold mb-3">{'\u2699'} BRAKES</h3>
              <div className="grid grid-cols-2 gap-3">
                {brakes.getTemperatures().map((temp, i) => {
                  const labels = ['FL', 'FR', 'RL', 'RR'];
                  const color = temp > 900 ? 'text-red-400' : temp > 600 ? 'text-yellow-400' : 'text-green-400';
                  return (
                    <div key={i} className="text-center">
                      <span className="text-amber-500 text-xs">{labels[i]}</span>
                      <p className={`text-lg font-bold ${color}`}>{Math.round(temp)}\u00B0C</p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-amber-400/70">
                Efficiency: {Math.round(brakes.getState().efficiency * 100)}%
              </div>
            </div>

            {/* Aero */}
            <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
              <h3 className="text-amber-300 text-sm font-bold mb-3">{'\u{1F4A8}'} AERODYNAMICS</h3>
              {currentFrame && (() => {
                const aeroForces = aero.calculateForces(currentFrame.speed, currentFrame.drs);
                return (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-amber-500">Downforce</span><span className="text-amber-100 font-bold">{aeroForces.totalDownforce} N</span></div>
                    <div className="flex justify-between"><span className="text-amber-500">Drag</span><span className="text-amber-100">{aeroForces.totalDrag} N</span></div>
                    <div className="flex justify-between"><span className="text-amber-500">L/D Ratio</span><span className="text-amber-100">{aeroForces.lD}</span></div>
                    <div className="flex justify-between"><span className="text-amber-500">DRS Gain</span><span className="text-green-400">-{aeroForces.drsDragReduction} N</span></div>
                  </div>
                );
              })()}
            </div>

            {/* Engineer Messages */}
            <div className="md:col-span-2 lg:col-span-3 bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
              <h3 className="text-amber-300 text-sm font-bold mb-3">{'\u260E'} RACE ENGINEER</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {engineerMessages.slice(-5).reverse().map(msg => (
                  <div key={msg.id} className={`text-sm px-3 py-2 rounded-xl ${
                    msg.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                    msg.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-amber-950/40 text-amber-200'
                  }`}>
                    <span className="text-amber-500 text-xs mr-2">[{msg.category.toUpperCase()}]</span>
                    {msg.message}
                  </div>
                ))}
                {engineerMessages.length === 0 && (
                  <p className="text-amber-400/50 text-sm">Waiting for race data...</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            {/* Speed trace */}
            <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
              <h3 className="text-amber-300 text-sm font-bold mb-3">SPEED TRACE</h3>
              <div className="h-40 relative">
                <svg viewBox="0 0 1000 160" className="w-full h-full">
                  {telemetryHistory.length > 1 && (
                    <polyline
                      fill="none" stroke="#d4a843" strokeWidth="2"
                      points={telemetryHistory.map((f, i) => `${(i / Math.max(1, telemetryHistory.length - 1)) * 1000},${160 - (f.speed / 350) * 160}`).join(' ')}
                    />
                  )}
                  <text x="5" y="15" fill="#d4a843" fontSize="10">350</text>
                  <text x="5" y="155" fill="#d4a843" fontSize="10">0</text>
                </svg>
              </div>
            </div>
            {/* Throttle/Brake trace */}
            <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
              <h3 className="text-amber-300 text-sm font-bold mb-3">THROTTLE / BRAKE</h3>
              <div className="h-32 relative">
                <svg viewBox="0 0 1000 128" className="w-full h-full">
                  {telemetryHistory.length > 1 && (
                    <>
                      <polyline fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.8"
                        points={telemetryHistory.map((f, i) => `${(i / Math.max(1, telemetryHistory.length - 1)) * 1000},${128 - f.throttle * 128}`).join(' ')} />
                      <polyline fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.8"
                        points={telemetryHistory.map((f, i) => `${(i / Math.max(1, telemetryHistory.length - 1)) * 1000},${128 - f.brake * 128}`).join(' ')} />
                    </>
                  )}
                </svg>
              </div>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-green-400">{'\u25CF'} Throttle</span>
                <span className="text-red-400">{'\u25CF'} Brake</span>
              </div>
            </div>
            {/* G-Force */}
            <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
              <h3 className="text-amber-300 text-sm font-bold mb-3">G-FORCE</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <div className="absolute inset-0 rounded-full border border-amber-800/30" />
                  <div className="absolute inset-4 rounded-full border border-amber-800/20" />
                  <div className="absolute inset-8 rounded-full border border-amber-800/10" />
                  <div className="absolute w-full h-px bg-amber-800/20 top-1/2" />
                  <div className="absolute h-full w-px bg-amber-800/20 left-1/2" />
                  {currentFrame && (
                    <div className="absolute w-3 h-3 bg-amber-400 rounded-full shadow-lg"
                      style={{
                        left: `calc(50% + ${currentFrame.latG * 15}px - 6px)`,
                        top: `calc(50% + ${currentFrame.lonG * 10}px - 6px)`,
                      }}
                    />
                  )}
                </div>
              </div>
              {currentFrame && (
                <div className="flex justify-around mt-3 text-xs text-center">
                  <div><span className="text-amber-500">Lat</span><p className="text-amber-100 font-bold">{currentFrame.latG}G</p></div>
                  <div><span className="text-amber-500">Lon</span><p className="text-amber-100 font-bold">{currentFrame.lonG}G</p></div>
                  <div><span className="text-amber-500">Vert</span><p className="text-amber-100 font-bold">{currentFrame.verticalG}G</p></div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'strategy' && (
          <div className="space-y-4">
            <h3 className="text-amber-300 text-sm font-bold">RACE STRATEGIES</h3>
            {strategies.slice(0, 8).map((s, i) => (
              <div key={s.id} className={`bg-amber-900/40 rounded-2xl p-4 border ${i === 0 ? 'border-amber-500/50' : 'border-amber-800/30'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-amber-100 font-bold text-sm">{s.name}</span>
                    {i === 0 && <span className="ml-2 text-xs bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full">OPTIMAL</span>}
                  </div>
                  <span className="text-amber-300 text-sm font-bold">{Math.floor(s.totalRaceTime / 60)}:{(s.totalRaceTime % 60).toFixed(1).padStart(4, '0')}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {s.tireCompounds.map((t, j) => (
                    <div key={j} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TIRE_COMPOUNDS[t]?.color || '#888' }} />
                      <span className="text-xs text-amber-400/70">{t}</span>
                      {j < s.tireCompounds.length - 1 && <span className="text-amber-600">{'\u2192'}</span>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-amber-400/60">
                  <span>{s.stops.length} stop{s.stops.length !== 1 ? 's' : ''}</span>
                  <span>Avg: {s.avgLapTime.toFixed(3)}s</span>
                  <span className={`capitalize ${s.riskLevel === 'high' ? 'text-red-400' : s.riskLevel === 'low' ? 'text-green-400' : 'text-yellow-400'}`}>{s.riskLevel} risk</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tires' && (
          <div className="space-y-4">
            {['FL', 'FR', 'RL', 'RR'].map((pos, i) => {
              const tire = [tireFL, tireFR, tireRL, tireRR][i];
              const state = tire.getState();
              const compound = tire.getCompound();
              const tempNorm = Math.min(1, state.temperature / 120);
              return (
                <div key={pos} className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-amber-100 font-bold">{pos} — {compound.name} {compound.emoji}</h4>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: compound.color }} />
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div><span className="text-amber-500">Temp</span><p className="text-amber-100 font-bold">{Math.round(state.temperature)}\u00B0C</p></div>
                    <div><span className="text-amber-500">Core</span><p className="text-amber-100 font-bold">{Math.round(state.coreTemperature)}\u00B0C</p></div>
                    <div><span className="text-amber-500">Pressure</span><p className="text-amber-100 font-bold">{Math.round(state.pressure)} kPa</p></div>
                    <div><span className="text-amber-500">Grip</span><p className="text-amber-100 font-bold">{(state.grip * 100).toFixed(0)}%</p></div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-amber-500"><span>Wear</span><span>{state.wear.toFixed(1)}%</span></div>
                    <div className="w-full h-2 bg-amber-950 rounded-full mt-1">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${state.wear}%`,
                        backgroundColor: state.wear > 70 ? '#ef4444' : state.wear > 40 ? '#facc15' : '#22c55e',
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="space-y-4">
            {weatherState && (
              <>
                <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
                  <h3 className="text-amber-300 text-sm font-bold mb-3">CURRENT CONDITIONS</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><span className="text-amber-500">Condition</span><p className="text-amber-100 font-bold capitalize">{weatherState.condition.replace('_', ' ')}</p></div>
                    <div><span className="text-amber-500">Air Temp</span><p className="text-amber-100 font-bold">{Math.round(weatherState.airTemperature)}\u00B0C</p></div>
                    <div><span className="text-amber-500">Track Temp</span><p className="text-amber-100 font-bold">{Math.round(weatherState.trackTemperature)}\u00B0C</p></div>
                    <div><span className="text-amber-500">Humidity</span><p className="text-amber-100 font-bold">{Math.round(weatherState.humidity)}%</p></div>
                    <div><span className="text-amber-500">Wind</span><p className="text-amber-100 font-bold">{Math.round(weatherState.windSpeed)} km/h @ {Math.round(weatherState.windDirection)}\u00B0</p></div>
                    <div><span className="text-amber-500">Pressure</span><p className="text-amber-100 font-bold">{Math.round(weatherState.pressure)} hPa</p></div>
                    <div><span className="text-amber-500">Visibility</span><p className="text-amber-100 font-bold">{Math.round(weatherState.visibility)}m</p></div>
                    <div><span className="text-amber-500">Rain Prob</span><p className="text-amber-100 font-bold">{Math.round(weatherState.rainProbability)}%</p></div>
                    <div><span className="text-amber-500">Rain</span><p className="text-amber-100 font-bold">{(weatherState.rainIntensity * 100).toFixed(0)}%</p></div>
                  </div>
                </div>
                <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
                  <h3 className="text-amber-300 text-sm font-bold mb-3">TIRE RECOMMENDATION</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full" style={{
                      backgroundColor: TIRE_COMPOUNDS[weather.getRecommendedTire()]?.color || '#888'
                    }} />
                    <div>
                      <p className="text-amber-100 font-bold">{TIRE_COMPOUNDS[weather.getRecommendedTire()]?.name || 'Unknown'}</p>
                      <p className="text-amber-400/60 text-xs">{weather.isWet() ? 'Wet conditions' : 'Dry conditions'}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'engineer' && (
          <div className="space-y-4">
            <div className="bg-amber-900/40 rounded-2xl p-4 border border-amber-800/30">
              <h3 className="text-amber-300 text-sm font-bold mb-3">ENGINEER RADIO</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {engineerMessages.map(msg => (
                  <div key={msg.id} className={`p-3 rounded-xl text-sm ${
                    msg.priority === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    msg.priority === 'high' ? 'bg-orange-500/15 text-orange-300 border border-orange-500/20' :
                    msg.priority === 'medium' ? 'bg-amber-950/40 text-amber-200 border border-amber-800/20' :
                    'bg-amber-950/20 text-amber-300/70'
                  }`}>
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold uppercase ${
                        msg.category === 'strategy' ? 'text-blue-400' :
                        msg.category === 'tire' ? 'text-yellow-400' :
                        msg.category === 'fuel' ? 'text-green-400' :
                        msg.category === 'weather' ? 'text-cyan-400' :
                        msg.category === 'danger' ? 'text-red-400' : 'text-amber-400'
                      }`}>{msg.category}</span>
                      <span className="text-amber-600 text-xs">{msg.priority}</span>
                    </div>
                    <p className="mt-1">{msg.message}</p>
                  </div>
                ))}
                {engineerMessages.length === 0 && (
                  <p className="text-amber-400/50 text-center py-8">Start the race simulation to receive engineer messages.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

