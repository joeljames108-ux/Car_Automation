// ============================================================================
// RACE ENGINEERING SUITE — DRIVER PERFORMANCE MODEL
// ============================================================================
// Models driver skill, consistency, racecraft, wet weather ability, tyre
// management, and psychological state for realistic race simulation.
// ============================================================================

export interface DriverProfile {
  id: string;
  name: string;
  nationality: string;
  number: number;
  team: string;
  overall: number;
  pace: number;
  racecraft: number;
  awareness: number;
  consistency: number;
  wetWeather: number;
  tyreManagement: number;
  braking: number;
  overtaking: number;
  qualifyingPace: number;
  racePace: number;
  experience: number;
  morale: number;
  fatigue: number;
  confidence: number;
}

export interface DriverPerformanceSnapshot {
  lapTimeDelta: number;
  consistency: number;
  errorProbability: number;
  tireSensitivity: number;
  wetPerformance: number;
  pressureResponse: number;
  currentForm: number;
}

export const PRO_DRIVER_PROFILES: DriverProfile[] = [
  { id: 'driver_max', name: 'Max Verstappen', nationality: 'Dutch', number: 1, team: 'Red Bull Racing', overall: 97, pace: 98, racecraft: 96, awareness: 95, consistency: 97, wetWeather: 98, tyreManagement: 94, braking: 96, overtaking: 95, qualifyingPace: 97, racePace: 98, experience: 88, morale: 95, fatigue: 0, confidence: 96 },
  { id: 'driver_lewis', name: 'Lewis Hamilton', nationality: 'British', number: 44, team: 'Ferrari', overall: 95, pace: 94, racecraft: 97, awareness: 96, consistency: 93, wetWeather: 97, tyreManagement: 96, braking: 92, overtaking: 96, qualifyingPace: 94, racePace: 95, experience: 98, morale: 90, fatigue: 0, confidence: 92 },
  { id: 'driver_leclerc', name: 'Charles Leclerc', nationality: 'Mon\u00e9gasque', number: 16, team: 'Ferrari', overall: 93, pace: 95, racecraft: 90, awareness: 88, consistency: 88, wetWeather: 87, tyreManagement: 85, braking: 94, overtaking: 88, qualifyingPace: 96, racePace: 92, experience: 78, morale: 88, fatigue: 0, confidence: 90 },
  { id: 'driver_norris', name: 'Lando Norris', nationality: 'British', number: 4, team: 'McLaren', overall: 92, pace: 93, racecraft: 89, awareness: 90, consistency: 91, wetWeather: 88, tyreManagement: 88, braking: 90, overtaking: 87, qualifyingPace: 92, racePace: 91, experience: 72, morale: 92, fatigue: 0, confidence: 91 },
  { id: 'driver_alonso', name: 'Fernando Alonso', nationality: 'Spanish', number: 14, team: 'Aston Martin', overall: 90, pace: 88, racecraft: 98, awareness: 97, consistency: 90, wetWeather: 94, tyreManagement: 97, braking: 89, overtaking: 93, qualifyingPace: 87, racePace: 92, experience: 99, morale: 85, fatigue: 0, confidence: 88 },
];

export class DriverPerformanceModel {
  private profile: DriverProfile;
  private formHistory: number[] = [];
  private peakLapTime = 0;

  constructor(profile: DriverProfile) {
    this.profile = { ...profile };
  }

  public getPerformance(wetness: number, pressure: number): DriverPerformanceSnapshot {
    const wetFactor = wetness > 0.3 ? (this.profile.wetWeather / 100) : 1.0;
    const pressureEffect = pressure > 80 ? (1 - (pressure - 80) * 0.002 * (1 - this.profile.consistency / 100)) : 1.0;
    const fatiguePenalty = this.profile.fatigue * 0.003;
    const moraleEffect = this.profile.morale / 100;
    const form = this.formHistory.length > 0 ? this.formHistory[this.formHistory.length - 1] : this.profile.overall;

    const basePaceDelta = (100 - this.profile.pace) * 0.03;
    const errorProb = Math.max(0.001, (100 - this.profile.consistency) * 0.001 * pressureEffect);
    const tireSens = 1 - this.profile.tyreManagement * 0.005;

    return {
      lapTimeDelta: (basePaceDelta + fatiguePenalty) / wetFactor / moraleEffect,
      consistency: this.profile.consistency * pressureEffect,
      errorProbability: errorProb,
      tireSensitivity: tireSens,
      wetPerformance: wetFactor,
      pressureResponse: 1 - (100 - this.profile.awareness) * 0.005,
      currentForm: form * moraleEffect,
    };
  }

  public simulateLap(baseLapTime: number, tireWear: number, wetness: number, pressure: number): number {
    const perf = this.getPerformance(wetness, pressure);
    const tireDeg = tireWear * perf.tireSensitivity * 0.002;
    const randomError = Math.random() < perf.errorProbability ? (Math.random() * 2.0) : 0;
    const consistencyNoise = (Math.random() - 0.5) * (2.0 - perf.consistency * 0.015);
    return baseLapTime + perf.lapTimeDelta + tireDeg + randomError + consistencyNoise;
  }

  public recordLap(lapTime: number): void {
    this.formHistory.push(lapTime);
    if (this.formHistory.length > 10) this.formHistory.shift();
    this.peakLapTime = Math.min(this.peakLapTime || lapTime, lapTime);
  }

  public updateMorale(change: number): void {
    this.profile.morale = Math.max(20, Math.min(100, this.profile.morale + change));
  }

  public addFatigue(amount: number): void {
    this.profile.fatigue = Math.min(100, this.profile.fatigue + amount);
  }

  public recoverFatigue(amount: number): void {
    this.profile.fatigue = Math.max(0, this.profile.fatigue - amount);
  }

  public getProfile(): DriverProfile { return { ...this.profile }; }
}
