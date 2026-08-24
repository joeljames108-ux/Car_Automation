// ============================================================================
// RACE ENGINEERING SUITE — LIVE TELEMETRY SIMULATOR
// ============================================================================
// Generates real-time vehicle telemetry data for dashboard visualization:
// RPM, speed, throttle/brake positions, G-forces, temperatures, fuel flow.
// Supports both simulated laps and replay from recorded data.
// ============================================================================

export interface TelemetryFrame {
  timestamp: number;
  lapTime: number;
  speed: number;
  rpm: number;
  gear: number;
  throttle: number;
  brake: number;
  clutch: number;
  steeringAngle: number;
  latG: number;
  lonG: number;
  verticalG: number;
  drs: boolean;
  pitLimiter: boolean;
  engineTemp: number;
  waterTemp: number;
  oilTemp: number;
  oilPressure: number;
  fuelFlow: number;
  fuelRemaining: number;
  tirePressures: [number, number, number, number];
  tireTemps: [number, number, number, number];
  tireWear: [number, number, number, number];
  brakeTemps: [number, number, number, number];
  batteryCharge: number;
  ersDeploy: number;
  ersHarvest: number;
  slipAngle: number;
  slipRatio: number;
}

export interface TelemetrySession {
  id: string;
  trackId: string;
  sessionType: 'FP1' | 'FP2' | 'FP3' | 'Q1' | 'Q2' | 'Q3' | 'SPRINT' | 'RACE';
  startTime: number;
  frames: TelemetryFrame[];
  laps: LapData[];
}

export interface LapData {
  lapNumber: number;
  lapTime: number;
  sector1: number;
  sector2: number;
  sector3: number;
  sector1Color: 'purple' | 'green' | 'yellow' | null;
  sector2Color: 'purple' | 'green' | 'yellow' | null;
  sector3Color: 'purple' | 'green' | 'yellow' | null;
  speedTrap: number;
  tireCompound: string;
  fuelLoad: number;
  isPersonalBest: boolean;
  isSessionBest: boolean;
  isValid: boolean;
  trackPosition: number;
}

export class LiveTelemetrySimulator {
  private session: TelemetrySession;
  private currentLap = 0;
  private lapProgress = 0;
  private speed = 0;
  private rpm = 800;
  private gear = 0;
  private fuelRemaining: number;
  private baseLapTime: number;
  private consistency: number;

  constructor(trackId: string, sessionType: TelemetrySession['sessionType'], baseLapTime: number, fuelLoad: number) {
    this.baseLapTime = baseLapTime;
    this.fuelRemaining = fuelLoad;
    this.consistency = 0.985 + Math.random() * 0.015;
    this.session = {
      id: `session_${Date.now()}`,
      trackId,
      sessionType,
      startTime: Date.now(),
      frames: [],
      laps: [],
    };
  }

  /**
   * Generate a single telemetry frame at the given progress through a lap
   */
  public generateFrame(lapProgress: number, trackLength: number): TelemetryFrame {
    this.lapProgress = lapProgress;
    const position = lapProgress * trackLength;

    // Speed profile based on lap progress (simplified sinusoidal)
    const baseSpeed = this.baseLapTime > 0 ? (trackLength / this.baseLapTime) : 65;
    const variation = Math.sin(lapProgress * Math.PI * 6) * 0.3 + Math.sin(lapProgress * Math.PI * 2.5) * 0.15;
    this.speed = Math.max(60, Math.min(340, baseSpeed * (1 + variation)));

    // RPM calculation (7-speed gearbox)
    const gearRatios = [3.2, 2.4, 1.9, 1.55, 1.28, 1.1, 0.95];
    this.gear = Math.min(6, Math.max(0, Math.floor(this.speed / 50)));
    const gearRatio = gearRatios[this.gear] || 1.0;
    this.rpm = Math.min(12000, Math.max(800, (this.speed * gearRatio * 45)));

    // Throttle & brake
    const braking = this.speed < baseSpeed * 0.8 && Math.abs(variation) > 0.15;
    const throttle = braking ? Math.random() * 0.3 : Math.min(1.0, this.speed / (baseSpeed * 1.1));
    const brake = braking ? Math.min(1.0, (baseSpeed * 0.9 - this.speed) / (baseSpeed * 0.4) + 0.2) : 0;

    // G-forces
    const latG = Math.sin(lapProgress * Math.PI * 8) * (1.5 + Math.random() * 0.5);
    const lonG = (throttle * 0.8 - brake * 2.5) + (Math.random() - 0.5) * 0.1;
    const vertG = Math.sin(lapProgress * Math.PI * 4) * 0.15;

    // Tire data
    const baseTireTemp = 80 + this.speed * 0.1 + Math.abs(latG) * 8;
    const baseTirePressure = 225 + (baseTireTemp - 25) * 0.5;

    // Brake temps
    const baseBrakeTemp = 300 + brake * 600 + this.speed * 0.5;

    // Engine temps
    const engineTemp = 95 + this.speed * 0.02 + Math.random() * 3;
    const waterTemp = 85 + this.speed * 0.015 + Math.random() * 2;
    const oilTemp = 100 + this.speed * 0.025 + Math.random() * 4;
    const oilPressure = 4.5 + this.rpm * 0.0003;

    // Fuel
    const fuelFlowRate = (this.rpm * 0.008 + this.speed * 0.02) * (throttle + 0.1);
    this.fuelRemaining = Math.max(0, this.fuelRemaining - fuelFlowRate * 0.016);

    // ERS
    const ersDeploy = brake > 0.3 ? 0 : throttle > 0.8 ? 0.16 : 0.04;
    const ersHarvest = brake > 0.3 ? 0.2 * brake : Math.max(0, (1.0 - throttle) * 0.05);

    const frame: TelemetryFrame = {
      timestamp: Date.now(),
      lapTime: lapProgress * this.baseLapTime,
      speed: Math.round(this.speed),
      rpm: Math.round(this.rpm),
      gear: this.gear + 1,
      throttle: Math.round(throttle * 100) / 100,
      brake: Math.round(brake * 100) / 100,
      clutch: 0,
      steeringAngle: Math.sin(lapProgress * Math.PI * 8) * 120,
      latG: Math.round(latG * 100) / 100,
      lonG: Math.round(lonG * 100) / 100,
      verticalG: Math.round(vertG * 100) / 100,
      drs: lapProgress > 0.7 && lapProgress < 0.85,
      pitLimiter: false,
      engineTemp: Math.round(engineTemp * 10) / 10,
      waterTemp: Math.round(waterTemp * 10) / 10,
      oilTemp: Math.round(oilTemp * 10) / 10,
      oilPressure: Math.round(oilPressure * 100) / 100,
      fuelFlow: Math.round(fuelFlowRate * 10) / 10,
      fuelRemaining: Math.round(this.fuelRemaining * 100) / 100,
      tirePressures: [
        Math.round(baseTirePressure + 3 + Math.random() * 2),
        Math.round(baseTirePressure - 1 + Math.random() * 2),
        Math.round(baseTirePressure + 5 + Math.random() * 2),
        Math.round(baseTirePressure + 2 + Math.random() * 2),
      ],
      tireTemps: [
        Math.round(baseTireTemp + 2 + Math.random() * 5),
        Math.round(baseTireTemp - 1 + Math.random() * 5),
        Math.round(baseTireTemp + 8 + Math.random() * 5),
        Math.round(baseTireTemp + 5 + Math.random() * 5),
      ],
      tireWear: [
        this.currentLap * 0.8 + Math.random() * 0.3,
        this.currentLap * 0.75 + Math.random() * 0.3,
        this.currentLap * 0.9 + Math.random() * 0.3,
        this.currentLap * 0.85 + Math.random() * 0.3,
      ],
      brakeTemps: [
        Math.round(baseBrakeTemp + Math.random() * 50),
        Math.round(baseBrakeTemp - 20 + Math.random() * 50),
        Math.round(baseBrakeTemp + 30 + Math.random() * 50),
        Math.round(baseBrakeTemp - 10 + Math.random() * 50),
      ],
      batteryCharge: Math.max(0, Math.min(100, 70 + Math.random() * 20 - ersDeploy * 50 + ersHarvest * 30)),
      ersDeploy: Math.round(ersDeploy * 100) / 100,
      ersHarvest: Math.round(ersHarvest * 100) / 100,
      slipAngle: Math.random() * 0.5,
      slipRatio: (Math.random() - 0.3) * 0.3,
    };

    this.session.frames.push(frame);
    return frame;
  }

  /**
   * Complete a lap and generate lap data
   */
  public completeLap(tireCompound: string, sectorSplits?: [number, number, number]): LapData {
    const lapTime = this.baseLapTime * this.consistency + (Math.random() - 0.5) * 2.0;
    const s1 = sectorSplits ? sectorSplits[0] : lapTime * 0.32;
    const s2 = sectorSplits ? sectorSplits[1] : lapTime * 0.38;
    const s3 = sectorSplits ? sectorSplits[2] : lapTime * 0.30;

    const isPB = this.session.laps.length === 0 || lapTime < Math.min(...this.session.laps.map(l => l.lapTime));
    const bestLap = this.session.laps.find(l => l.isSessionBest);
    const isSB = !bestLap || lapTime < bestLap.lapTime;

    if (isSB && bestLap) bestLap.isSessionBest = false;

    const lapData: LapData = {
      lapNumber: ++this.currentLap,
      lapTime: Math.round(lapTime * 1000) / 1000,
      sector1: Math.round(s1 * 1000) / 1000,
      sector2: Math.round(s2 * 1000) / 1000,
      sector3: Math.round(s3 * 1000) / 1000,
      sector1Color: null,
      sector2Color: null,
      sector3Color: null,
      speedTrap: Math.round(310 + Math.random() * 30),
      tireCompound,
      fuelLoad: this.fuelRemaining,
      isPersonalBest: isPB,
      isSessionBest: isSB,
      isValid: true,
      trackPosition: this.currentLap,
    };

    // Color sectors
    if (this.session.laps.length > 0) {
      const prevBest = this.session.laps.reduce((best, l) => l.sector1 < best.sector1 ? l : best, this.session.laps[0]);
      lapData.sector1Color = s1 <= prevBest.sector1 ? 'purple' : s1 < prevBest.sector1 * 1.02 ? 'green' : 'yellow';
      lapData.sector2Color = s2 <= prevBest.sector2 ? 'purple' : s2 < prevBest.sector2 * 1.02 ? 'green' : 'yellow';
      lapData.sector3Color = s3 <= prevBest.sector3 ? 'purple' : s3 < prevBest.sector3 * 1.02 ? 'green' : 'yellow';
    }

    this.session.laps.push(lapData);
    this.fuelRemaining = Math.max(0, this.fuelRemaining - lapTime * 0.015);
    return lapData;
  }

  public getSession(): TelemetrySession { return this.session; }
  public getCurrentLap(): number { return this.currentLap; }
  public getFuelRemaining(): number { return this.fuelRemaining; }
  public getRecentFrames(count: number): TelemetryFrame[] {
    return this.session.frames.slice(-count);
  }
}
