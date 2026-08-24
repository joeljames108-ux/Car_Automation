// ============================================================================
// RACE ENGINEERING SUITE — SIMPLIFIED PACEJKA MAGIC FORMULA TIRE MODEL
// ============================================================================
// Implements the Pacejka '96 magic formula for longitudinal and lateral tire
// force generation with temperature-dependent grip, wear degradation, and
// thermal model integration for real-time tire performance prediction.
// ============================================================================

export interface TireState {
  temperature: number;
  coreTemperature: number;
  pressure: number;
  wear: number;
  grip: number;
  slipAngle: number;
  slipRatio: number;
  load: number;
  cornerStiffness: number;
}

export interface TireCompound {
  name: string;
  dryGrip: number;
  wetGrip: number;
  operatingWindow: [number, number];
  degradationRate: number;
  thermalInertia: number;
  pressureSensitivity: number;
  peakSlipAngle: number;
  peakSlipRatio: number;
  carcassStiffness: number;
  rollingResistance: number;
  maxLoad: number;
  color: string;
  emoji: string;
}

export const TIRE_COMPOUNDS: Record<string, TireCompound> = {
  soft: {
    name: 'Soft C5', dryGrip: 1.42, wetGrip: 0.65, operatingWindow: [85, 105],
    degradationRate: 0.08, thermalInertia: 0.12, pressureSensitivity: 1.3,
    peakSlipAngle: 6.5, peakSlipRatio: 0.08, carcassStiffness: 28000,
    rollingResistance: 0.0085, maxLoad: 8500, color: '#ef4444', emoji: '\u{1F534}',
  },
  medium: {
    name: 'Medium C3', dryGrip: 1.35, wetGrip: 0.70, operatingWindow: [80, 110],
    degradationRate: 0.045, thermalInertia: 0.15, pressureSensitivity: 1.1,
    peakSlipAngle: 7.0, peakSlipRatio: 0.09, carcassStiffness: 30000,
    rollingResistance: 0.0080, maxLoad: 8800, color: '#facc15', emoji: '\u{1F7E1}',
  },
  hard: {
    name: 'Hard C2', dryGrip: 1.28, wetGrip: 0.75, operatingWindow: [75, 115],
    degradationRate: 0.025, thermalInertia: 0.20, pressureSensitivity: 0.9,
    peakSlipAngle: 7.8, peakSlipRatio: 0.10, carcassStiffness: 33000,
    rollingResistance: 0.0075, maxLoad: 9200, color: '#e5e7eb', emoji: '\u26AA',
  },
  intermediate: {
    name: 'Intermediate C1', dryGrip: 1.15, wetGrip: 1.20, operatingWindow: [60, 90],
    degradationRate: 0.03, thermalInertia: 0.18, pressureSensitivity: 1.0,
    peakSlipAngle: 8.5, peakSlipRatio: 0.12, carcassStiffness: 26000,
    rollingResistance: 0.0090, maxLoad: 8200, color: '#22c55e', emoji: '\u{1F7E2}',
  },
  wet: {
    name: 'Wet', dryGrip: 0.95, wetGrip: 1.50, operatingWindow: [40, 80],
    degradationRate: 0.015, thermalInertia: 0.25, pressureSensitivity: 0.8,
    peakSlipAngle: 10.0, peakSlipRatio: 0.15, carcassStiffness: 22000,
    rollingResistance: 0.0100, maxLoad: 8000, color: '#3b82f6', emoji: '\u{1F535}',
  },
};

export class PacejkaTireModel {
  private compound: TireCompound;
  private state: TireState;
  private lapCount = 0;
  private totalDistance = 0;

  constructor(compound: string) {
    this.compound = TIRE_COMPOUNDS[compound] || TIRE_COMPOUNDS.medium;
    this.state = this.createFreshState();
  }

  private createFreshState(): TireState {
    return {
      temperature: 25, coreTemperature: 25,
      pressure: 230, wear: 0, grip: this.compound.dryGrip,
      slipAngle: 0, slipRatio: 0, load: 4500,
      cornerStiffness: this.compound.carcassStiffness,
    };
  }

  private magicFormula(x: number, B: number, C: number, D: number, E: number): number {
    const bx = B * x;
    return D * Math.sin(C * Math.atan(bx - E * (bx - Math.atan(bx))));
  }

  private getTemperatureFactor(): number {
    const [tMin, tMax] = this.compound.operatingWindow;
    const t = this.state.temperature;
    if (t < tMin) return 0.6 + 0.4 * ((t - 10) / (tMin - 10));
    if (t > tMax) {
      const overheat = (t - tMax) / 30;
      return Math.max(0.5, 1.0 - overheat * overheat * 0.5);
    }
    const mid = (tMin + tMax) / 2;
    const halfRange = (tMax - tMin) / 2;
    return 0.92 + 0.08 * (1 - Math.pow((t - mid) / halfRange, 2));
  }

  private getWearFactor(): number {
    const w = this.state.wear;
    if (w < 30) return 1.0;
    if (w < 60) return 1.0 - (w - 30) * 0.005;
    return Math.max(0.65, 1.0 - (w - 30) * 0.008);
  }

  private getPressureFactor(): number {
    const optimalPressure = 230;
    const deviation = (this.state.pressure - optimalPressure) / optimalPressure;
    return Math.max(0.85, 1.0 - Math.abs(deviation) * this.compound.pressureSensitivity * 0.3);
  }

  public getLongitudinalForce(): number {
    const D = this.state.load * this.compound.dryGrip;
    const B = 10 / this.compound.peakSlipRatio;
    const rawForce = this.magicFormula(this.state.slipRatio, B, 1.65, D, 0.5);
    return rawForce * this.getTemperatureFactor() * this.getWearFactor() * this.getPressureFactor();
  }

  public getLateralForce(): number {
    const D = this.state.load * this.compound.dryGrip;
    const B = 10 / (this.compound.peakSlipAngle * Math.PI / 180);
    const rawForce = this.magicFormula(this.state.slipAngle * Math.PI / 180, B, 1.3, D, 0.8);
    return rawForce * this.getTemperatureFactor() * this.getWearFactor() * this.getPressureFactor();
  }

  public getCombinedForce(longSlip: number, latSlip: number): { fx: number; fy: number } {
    const fxMax = this.getLongitudinalForce();
    const fyMax = this.getLateralForce();
    const slipMag = Math.sqrt(longSlip * longSlip + latSlip * latSlip);
    if (slipMag < 0.001) return { fx: 0, fy: 0 };
    const ratio = Math.min(1.0, 1.0 / slipMag);
    return { fx: longSlip * ratio * fxMax, fy: latSlip * ratio * fyMax };
  }

  public update(dt: number, load: number, slipAngle: number, slipRatio: number, speed: number, trackWetness: number): void {
    this.state.load = load;
    this.state.slipAngle = slipAngle;
    this.state.slipRatio = slipRatio;

    const heatGen = this.compound.carcassStiffness * Math.abs(slipAngle * Math.PI / 180) * 0.0001 * speed;
    const heatGen2 = this.state.load * Math.abs(slipRatio) * 0.00005 * speed;
    const ambientTemp = trackWetness > 0.5 ? 15 : 30;
    const convection = (this.state.temperature - ambientTemp) * 0.02 * speed;
    const coreConduction = (this.state.coreTemperature - this.state.temperature) * 0.05;
    const roadHeat = speed * 0.003 * (1 + trackWetness * 0.5);

    this.state.temperature += (heatGen + heatGen2 + roadHeat - convection - coreConduction) * dt;
    this.state.temperature = Math.max(ambientTemp, Math.min(150, this.state.temperature));
    this.state.coreTemperature += (coreConduction - (this.state.coreTemperature - ambientTemp) * 0.005) * dt;
    this.state.coreTemperature = Math.max(ambientTemp, this.state.coreTemperature);
    this.state.pressure = 230 + (this.state.temperature - 25) * 0.8 + (this.state.coreTemperature - 25) * 0.3;

    const slipEnergy = (Math.abs(slipAngle) * 0.1 + Math.abs(slipRatio) * 5) * speed * dt;
    this.state.wear += slipEnergy * this.compound.degradationRate * 0.0001;
    this.state.wear = Math.min(100, this.state.wear);
    this.totalDistance += speed * dt;

    const wetGripFactor = trackWetness > 0.1 ? this.compound.wetGrip / this.compound.dryGrip : 1.0;
    this.state.grip = this.compound.dryGrip * wetGripFactor *
      this.getTemperatureFactor() * this.getWearFactor() * this.getPressureFactor();
  }

  public getState(): TireState { return { ...this.state }; }
  public getCompound(): TireCompound { return { ...this.compound }; }
  public getRemainingLaps(totalLaps: number): number {
    if (this.state.wear <= 0) return totalLaps;
    const wearRate = this.state.wear / Math.max(1, this.lapCount);
    return Math.floor((100 - this.state.wear) / wearRate);
  }
  public newLap(): void { this.lapCount++; }
  public getTotalDistance(): number { return this.totalDistance; }
  public reset(): void { this.state = this.createFreshState(); this.lapCount = 0; this.totalDistance = 0; }
}
