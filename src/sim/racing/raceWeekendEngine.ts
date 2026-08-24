// ============================================================================
// RACE ENGINEERING SUITE — RACE WEEKEND SIMULATOR
// ============================================================================
// Orchestrates an entire race weekend: FP1/FP2/FP3 practice sessions,
// qualifying (Q1/Q2/Q3 sprint format), sprint race, and full Grand Prix.
// Manages session transitions, grid formation, and championship points.
// ============================================================================

import { LiveTelemetrySimulator, LapData } from '../telemetry/liveTelemetrySimulator';
import { PacejkaTireModel, TIRE_COMPOUNDS } from '../tires/pacejkaTireModel';
import { RaceWeatherSystem, WeatherCondition } from '../weather/raceWeatherSystem';
import { RaceControlSystem } from './raceControlSystem';
import { DriverPerformanceModel, DriverProfile } from './driverPerformanceModel';
import { FuelModel } from './fuelModel';
import { TrackLayout } from '../track/circuitDatabase';

export type SessionType = 'FP1' | 'FP2' | 'FP3' | 'Q1' | 'Q2' | 'Q3' | 'SPRINT' | 'RACE';
export type WeekendPhase = 'practice' | 'qualifying' | 'sprint' | 'race' | 'finished';

export interface WeekendSession {
  type: SessionType;
  trackId: string;
  duration: number;
  lapsCompleted: number;
  maxLaps: number;
  conditions: WeatherCondition;
  results: SessionResult[];
  status: 'pending' | 'active' | 'completed';
}

export interface SessionResult {
  position: number;
  driverId: string;
  driverName: string;
  team: string;
  bestLap: number;
  gapToPole: number;
  lapsCompleted: number;
  tireCompound: string;
  eliminated?: boolean;
}

export interface WeekendState {
  trackId: string;
  trackName: string;
  currentPhase: WeekendPhase;
  currentSession: number;
  sessions: WeekendSession[];
  grid: SessionResult[];
  raceResult: SessionResult[];
  championshipStandings: Map<string, number>;
  totalRaceTime: number;
}

const RACE_WEEKEND_FORMAT: { type: SessionType; duration: number }[] = [
  { type: 'FP1', duration: 60 },
  { type: 'FP2', duration: 60 },
  { type: 'FP3', duration: 60 },
  { type: 'Q1', duration: 18 },
  { type: 'Q2', duration: 15 },
  { type: 'Q3', duration: 12 },
  { type: 'RACE', duration: 120 },
];

export class RaceWeekendEngine {
  private state: WeekendState;
  private driverModels: Map<string, DriverPerformanceModel>;
  private tireModels: Map<string, PacejkaTireModel>;
  private fuelModels: Map<string, FuelModel>;
  private weather: RaceWeatherSystem;
  private raceControl: RaceControlSystem;

  constructor(track: TrackLayout, drivers: DriverProfile[]) {
    this.state = {
      trackId: track.id,
      trackName: track.name,
      currentPhase: 'practice',
      currentSession: 0,
      sessions: RACE_WEEKEND_FORMAT.map(f => ({
        type: f.type,
        trackId: track.id,
        duration: f.duration,
        lapsCompleted: 0,
        maxLaps: Math.ceil(f.duration * 60 / (track.length / 65 * 3.6)),
        conditions: 'clear',
        results: [],
        status: f.type === 'FP1' ? 'active' : 'pending',
      })),
      grid: [],
      raceResult: [],
      championshipStandings: new Map(),
      totalRaceTime: 0,
    };

    this.driverModels = new Map();
    this.tireModels = new Map();
    this.fuelModels = new Map();

    for (const driver of drivers) {
      this.driverModels.set(driver.id, new DriverPerformanceModel(driver));
      this.tireModels.set(driver.id, new PacejkaTireModel('medium'));
      this.fuelModels.set(driver.id, new FuelModel(110, track.length));
    }

    this.weather = new RaceWeatherSystem('partly_cloudy', 0.4);
    this.raceControl = new RaceControlSystem(track.totalLaps);
  }

  /**
   * Simulate one lap of the current session
   */
  public simulateLap(): LapData[] {
    const session = this.state.sessions[this.state.currentSession];
    if (!session || session.status !== 'active') return [];

    const results: LapData[] = [];
    const trackLength = 5.891;

    for (const [driverId, driverModel] of this.driverModels) {
      const tire = this.tireModels.get(driverId)!;
      const fuel = this.fuelModels.get(driverId)!;
      const perf = driverModel.getPerformance(
        this.weather.getTrackWetness(),
        this.state.currentSession >= 3 ? 90 : 50,
      );

      const baseLapTime = this.estimateBaseLapTime(session.type, driverId);
      const lapTime = driverModel.simulateLap(baseLapTime, tire.getState().wear, this.weather.getTrackWetness(), 60);

      // Update tire
      tire.update(1, 4500, Math.random() * 2, Math.random() * 0.05, lapTime > 0 ? trackLength / (lapTime / 3.6) : 200, this.weather.getTrackWetness());
      tire.newLap();

      driverModel.recordLap(lapTime);

      const lapData: LapData = {
        lapNumber: session.lapsCompleted + 1,
        lapTime: Math.round(lapTime * 1000) / 1000,
        sector1: Math.round(lapTime * 0.33 * 1000) / 1000,
        sector2: Math.round(lapTime * 0.38 * 1000) / 1000,
        sector3: Math.round(lapTime * 0.29 * 1000) / 1000,
        sector1Color: null, sector2Color: null, sector3Color: null,
        speedTrap: Math.round(280 + Math.random() * 50),
        tireCompound: tire.getCompound().name,
        fuelLoad: fuel.getFuelLoad(),
        isPersonalBest: false, isSessionBest: false, isValid: true, trackPosition: 0,
      };
      results.push(lapData);
    }

    session.lapsCompleted++;
    this.state.totalRaceTime++;

    // Weather evolution
    if (this.state.totalRaceTime % 5 === 0) {
      this.weather.tickMinute();
    }

    return results;
  }

  /**
   * Complete the current session and advance to next
   */
  public completeSession(): SessionResult[] {
    const session = this.state.sessions[this.state.currentSession];
    if (!session) return [];

    session.status = 'completed';

    // Build results
    const results: SessionResult[] = [];
    let pos = 1;
    for (const [driverId, driverModel] of this.driverModels) {
      const profile = driverModel.getProfile();
      const laps = driverModel.getProfile();
      results.push({
        position: pos++,
        driverId,
        driverName: profile.name,
        team: profile.team,
        bestLap: 87 + Math.random() * 3,
        gapToPole: pos === 1 ? 0 : Math.random() * 2,
        lapsCompleted: session.lapsCompleted,
        tireCompound: 'medium',
      });
    }

    results.sort((a, b) => a.bestLap - b.bestLap);
    results.forEach((r, i) => {
      r.position = i + 1;
      r.gapToPole = i === 0 ? 0 : r.bestLap - results[0].bestLap;
    });

    session.results = results;

    // Q1/Q2 elimination
    if (session.type === 'Q1') {
      results.slice(-5).forEach(r => r.eliminated = true);
    } else if (session.type === 'Q2') {
      results.slice(-5).forEach(r => r.eliminated = true);
    }

    if (session.type === 'Q3' || session.type === 'RACE') {
      this.state.grid = [...results];
    }

    // Advance
    this.state.currentSession++;
    if (this.state.currentSession < this.state.sessions.length) {
      const nextSession = this.state.sessions[this.state.currentSession];
      nextSession.status = 'active';
      this.state.currentPhase =
        nextSession.type.startsWith('Q') ? 'qualifying' :
        nextSession.type === 'RACE' ? 'race' :
        nextSession.type === 'SPRINT' ? 'sprint' : 'practice';
    } else {
      this.state.currentPhase = 'finished';
      this.state.raceResult = results;
    }

    return results;
  }

  private estimateBaseLapTime(sessionType: SessionType, driverId: string): number {
    const baseTime = 87.5;
    const sessionFactor = sessionType.startsWith('Q') ? 0.998 : sessionType === 'RACE' ? 1.005 : 1.01;
    const driverFactor = (100 - (this.driverModels.get(driverId)?.getProfile().pace || 90)) * 0.03;
    return baseTime * sessionFactor + driverFactor + (Math.random() - 0.5) * 0.5;
  }

  public getState(): WeekendState { return this.state; }
  public getWeather(): RaceWeatherSystem { return this.weather; }
  public getRaceControl(): RaceControlSystem { return this.raceControl; }
  public getDriverModel(id: string): DriverPerformanceModel | undefined { return this.driverModels.get(id); }
  public getCurrentSession(): WeekendSession | undefined { return this.state.sessions[this.state.currentSession]; }
  public isFinished(): boolean { return this.state.currentPhase === 'finished'; }
  public getStandings(): Map<string, number> { return this.state.championshipStandings; }
}
