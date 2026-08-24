// ============================================================================
// RACE ENGINEERING SUITE — RACE CONTROL SYSTEM
// ============================================================================
// Manages race flags, safety car deployments, VSC, red flags, DRS zones,
// virtual safety car, and full course yellow conditions.
// ============================================================================

export type FlagColor = 'green' | 'yellow' | 'double_yellow' | 'red' | 'chequered' | 'blue' | 'white' | 'black' | 'black_orange';
export type SafetyCarType = 'none' | 'safety_car' | 'virtual_safety_car' | 'red_flag';

export interface RaceFlag {
  zone: number;
  color: FlagColor;
  reason: string;
  timestamp: number;
}

export interface SafetyCarEvent {
  type: SafetyCarType;
  startLap: number;
  endLap: number;
  reason: string;
  duration: number;
  lapsNeutralized: number;
}

export interface RaceState {
  status: 'formation' | 'racing' | 'safety_car' | 'vsc' | 'red_flag' | 'finished' | 'formation_lap';
  currentLap: number;
  totalLaps: number;
  flags: RaceFlag[];
  safetyCar: SafetyCarEvent | null;
  drsEnabled: boolean;
  drsZones: DRSZoneState[];
  trackBlocked: boolean;
  incidents: RaceIncident[];
  safetyCarQueue: number[];
}

export interface DRSZoneState {
  id: string;
  detectionPoint: number;
  activationPoint: number;
  deactivationPoint: number;
  active: boolean;
}

export interface RaceIncident {
  id: string;
  lap: number;
  type: 'collision' | 'spin' | 'mechanical' | 'off_track' | 'barrier' | 'debris';
  severity: 'minor' | 'major' | 'critical';
  position: number;
  driverId: string;
  description: string;
  requiresIntervention: boolean;
}

export class RaceControlSystem {
  private state: RaceState;
  private consecutiveYellowLaps = 0;
  private lastSafetyCarLap = 0;
  private incidentCount = 0;

  constructor(totalLaps: number) {
    this.state = {
      status: 'formation_lap',
      currentLap: 0,
      totalLaps,
      flags: [],
      safetyCar: null,
      drsEnabled: false,
      drsZones: [],
      trackBlocked: false,
      incidents: [],
      safetyCarQueue: [],
    };
  }

  public startRace(): void {
    this.state.status = 'racing';
    this.state.flags.push({ zone: 0, color: 'green', reason: 'Race start', timestamp: Date.now() });
    this.state.drsEnabled = true;
  }

  public updateLap(lapNumber: number, positions: Map<number, number>): RaceFlag[] {
    this.state.currentLap = lapNumber;
    const newFlags: RaceFlag[] = [];

    // Check safety car conditions
    if (this.state.safetyCar && lapNumber >= this.state.safetyCar.endLap) {
      this.state.safetyCar = null;
      this.state.status = 'racing';
      newFlags.push({ zone: 0, color: 'green', reason: 'Safety car in this lap', timestamp: Date.now() });
    }

    // DRS eligibility
    if (this.state.status === 'racing' && lapNumber > 2) {
      for (const zone of this.state.drsZones) {
        zone.active = true;
      }
    }

    // Check for incidents that might trigger safety car
    const recentIncidents = this.state.incidents.filter(i => i.lap >= lapNumber - 1);
    const criticalIncidents = recentIncidents.filter(i => i.severity === 'critical');

    if (criticalIncidents.length > 0 && !this.state.safetyCar) {
      this.deploySafetyCar(lapNumber, 'Track obstruction from incident');
      newFlags.push({ zone: 0, color: 'yellow', reason: 'Safety car deployed', timestamp: Date.now() });
    }

    // Check for red flag conditions
    if (recentIncidents.filter(i => i.severity === 'critical').length >= 3) {
      this.state.status = 'red_flag';
      newFlags.push({ zone: 0, color: 'red', reason: 'Multiple critical incidents', timestamp: Date.now() });
    }

    // Finish
    if (lapNumber >= this.state.totalLaps) {
      this.state.status = 'finished';
      newFlags.push({ zone: 0, color: 'chequered', reason: 'Race finished', timestamp: Date.now() });
      this.state.drsEnabled = false;
    }

    this.state.flags.push(...newFlags);
    return newFlags;
  }

  public deploySafetyCar(lap: number, reason: string): void {
    if (this.state.safetyCar) return;
    this.state.status = 'safety_car';
    this.state.safetyCar = {
      type: 'safety_car',
      startLap: lap,
      endLap: lap + Math.floor(2 + Math.random() * 4),
      reason,
      duration: 0,
      lapsNeutralized: 0,
    };
    this.state.drsEnabled = false;
    this.lastSafetyCarLap = lap;
    this.state.drsZones.forEach(z => z.active = false);
  }

  public deployVSC(lap: number, reason: string): void {
    this.state.status = 'vsc';
    this.state.safetyCar = {
      type: 'virtual_safety_car',
      startLap: lap,
      endLap: lap + 2,
      reason,
      duration: 0,
      lapsNeutralized: 1,
    };
    this.state.drsEnabled = false;
  }

  public reportIncident(incident: Omit<RaceIncident, 'id'>): RaceIncident {
    const fullIncident: RaceIncident = {
      ...incident,
      id: `incident_${++this.incidentCount}`,
    };
    this.state.incidents.push(fullIncident);
    if (incident.severity === 'critical') this.state.trackBlocked = true;
    return fullIncident;
  }

  public getFlagForZone(zone: number): FlagColor {
    const zoneFlags = this.state.flags.filter(f => f.zone === zone || f.zone === 0);
    return zoneFlags.length > 0 ? zoneFlags[zoneFlags.length - 1].color : 'green';
  }

  public getState(): RaceState { return { ...this.state }; }
  public isSafetyCarActive(): boolean { return this.state.safetyCar !== null; }
  public getSafetyCar(): SafetyCarEvent | null { return this.state.safetyCar; }
  public getIncidents(): RaceIncident[] { return [...this.state.incidents]; }
}
