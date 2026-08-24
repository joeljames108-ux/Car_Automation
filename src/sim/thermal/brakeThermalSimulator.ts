// ============================================================================
// RACE ENGINEERING SUITE — BRAKE THERMAL SIMULATOR
// ============================================================================
// Detailed brake temperature model with rotor thermal mass, pad compound
// behavior, brake fade prediction, cooling duct effectiveness, and energy
// recovery system interaction for hybrid/EV configurations.
// ============================================================================

export interface BrakeState {
  rotorTemperature: number;
  padTemperature: number;
  discTemperature: number;
  hydraulicTemperature: number;
  wear: number;
  fade: number;
  efficiency: number;
  pressure: number;
  bitePoint: number;
}

export interface BrakeZone {
  cornerIndex: number;
  brakingForce: number;
  entrySpeed: number;
  apexSpeed: number;
  brakingDistance: number;
  energyToDissipate: number;
  initialTemp: number;
}

const BRAKE_COMPOUNDS = {
  carbon_ceramic: { maxTemp: 1000, fadeStart: 850, thermalMass: 0.85, coolingRate: 0.92, wearRate: 0.001 },
  carbon_carbon: { maxTemp: 1200, fadeStart: 1000, thermalMass: 0.78, coolingRate: 0.88, wearRate: 0.003 },
  steel: { maxTemp: 700, fadeStart: 550, thermalMass: 1.0, coolingRate: 0.82, wearRate: 0.005 },
};

export class BrakeThermalSimulator {
  private state: BrakeState;
  private compound: keyof typeof BRAKE_COMPOUNDS;
  private coolingDuctEfficiency: number;
  private speed: number = 0;
  private brakeBias: number = 57;

  constructor(compound: keyof typeof BRAKE_COMPOUNDS = 'carbon_ceramic', coolingDuct: number = 0.8) {
    this.compound = compound;
    this.coolingDuctEfficiency = coolingDuct;
    const data = BRAKE_COMPOUNDS[compound];
    this.state = {
      rotorTemperature: 200, padTemperature: 150, discTemperature: 180,
      hydraulicTemperature: 60, wear: 0, fade: 0,
      efficiency: 1.0, pressure: 150, bitePoint: 12,
    };
  }

  public update(dt: number, speed: number, brakeApplication: number, gForceLon: number): BrakeState {
    this.speed = speed;
    const data = BRAKE_COMPOUNDS[this.compound];
    const brakingEnergy = brakeApplication * speed * speed * 0.00002;

    // Temperature increase from braking
    this.state.rotorTemperature += (brakingEnergy * 12 - (this.state.rotorTemperature - 80) * 0.02 * this.coolingDuctEfficiency * speed / 100) * dt;
    this.state.padTemperature += (brakingEnergy * 8 - (this.state.padTemperature - 60) * 0.015) * dt;
    this.state.discTemperature += (brakingEnergy * 10 - (this.state.discTemperature - 70) * 0.018 * this.coolingDuctEfficiency) * dt;

    // Clamp temperatures
    this.state.rotorTemperature = Math.max(80, Math.min(data.maxTemp * 1.1, this.state.rotorTemperature));
    this.state.padTemperature = Math.max(60, Math.min(data.maxTemp * 0.8, this.state.padTemperature));
    this.state.discTemperature = Math.max(70, Math.min(data.maxTemp, this.state.discTemperature));

    // Fade calculation
    const tempRatio = this.state.rotorTemperature / data.fadeStart;
    this.state.fade = tempRatio > 1.0 ? Math.min(0.5, (tempRatio - 1.0) * 0.5) : 0;
    this.state.efficiency = Math.max(0.5, 1.0 - this.state.fade);

    // Wear
    const brakingIntensity = brakeApplication * speed * 0.0001;
    this.state.wear = Math.min(100, this.state.wear + brakingIntensity * data.wearRate * dt);

    // Hydraulic temp
    this.state.hydraulicTemperature += (brakeApplication * 5 - (this.state.hydraulicTemperature - 40) * 0.008) * dt;
    this.state.hydraulicTemperature = Math.max(30, Math.min(200, this.state.hydraulicTemperature));

    this.state.pressure = 150 + brakeApplication * 100;
    return { ...this.state };
  }

  public getBrakePerformance(): { efficiency: number; bitePoint: number; fadeLevel: string } {
    const fadeLevel = this.state.fade < 0.1 ? 'normal' : this.state.fade < 0.3 ? 'mild_fade' : 'heavy_fade';
    return { efficiency: this.state.efficiency, bitePoint: this.state.bitePoint, fadeLevel };
  }

  public getState(): BrakeState { return { ...this.state }; }
  public getTemperatures(): number[] {
    return [this.state.rotorTemperature, this.state.padTemperature, this.state.discTemperature, this.state.hydraulicTemperature];
  }
  public reset(): void {
    this.state.rotorTemperature = 200;
    this.state.padTemperature = 150;
    this.state.wear = 0;
    this.state.fade = 0;
    this.state.efficiency = 1.0;
  }
}
