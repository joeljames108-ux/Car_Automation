// ============================================================================
// RACE ENGINEERING SUITE — FUEL CONSUMPTION MODEL
// ============================================================================
// Physics-based fuel consumption model with altitude compensation,
// temperature effects, fuel load impact on lap time, and optimal
// fuel mixture strategies for race and qualifying modes.
// ============================================================================

export interface FuelState {
  currentLoad: number;
  maxCapacity: number;
  consumption: number;
  mixture: 'lean' | 'standard' | 'rich' | 'qualifying' | 'max';
  temperature: number;
  density: number;
  heatingValue: number;
  lapCount: number;
  totalConsumed: number;
  fuelFlow: number;
}

export interface FuelStrategy {
  startFuel: number;
  targetEndFuel: number;
  lapsAtRich: number;
  lapsAtStandard: number;
  lapsAtLean: number;
  avgConsumptionPerLap: number;
  canPush: boolean;
  fuelOffset: number;
}

export class FuelModel {
  private state: FuelState;
  private consumptionPerLap: number;
  private trackLength: number;

  constructor(maxCapacity: number, trackLength: number) {
    this.trackLength = trackLength;
    this.consumptionPerLap = trackLength * 0.0018;
    this.state = {
      currentLoad: maxCapacity,
      maxCapacity,
      consumption: this.consumptionPerLap,
      mixture: 'standard',
      temperature: 25,
      density: 0.755,
      heatingValue: 44000,
      lapCount: 0,
      totalConsumed: 0,
      fuelFlow: this.consumptionPerLap * 30,
    };
  }

  public consumeLap(throttleAvg: number, rpmAvg: number, altitude: number): number {
    const mixtureMultiplier = {
      lean: 0.82, standard: 1.0, rich: 1.15, qualifying: 1.35, max: 1.5,
    }[this.state.mixture];

    const altitudeFactor = 1 + altitude * 0.00008;
    const tempFactor = 1 - (this.state.temperature - 25) * 0.001;
    const loadFactor = 1 + (this.state.currentLoad / this.state.maxCapacity) * 0.05;
    const rpmFactor = 1 + (rpmAvg - 8000) * 0.00002;

    const consumption = this.consumptionPerLap * mixtureMultiplier * altitudeFactor *
      tempFactor * loadFactor * rpmFactor * (0.7 + throttleAvg * 0.6);

    this.state.currentLoad = Math.max(0, this.state.currentLoad - consumption);
    this.state.totalConsumed += consumption;
    this.state.lapCount++;
    this.state.consumption = consumption;
    this.state.fuelFlow = consumption * 60;
    return consumption;
  }

  public getLapTimeEffect(): number {
    const fullWeight = this.state.maxCapacity;
    const fuelEffect = (fullWeight - this.state.currentLoad) * 0.003;
    return -fuelEffect;
  }

  public getRemainingLaps(): number {
    return Math.floor(this.state.currentLoad / this.consumptionPerLap);
  }

  public getStrategy(totalLaps: number, currentLap: number): FuelStrategy {
    const remaining = totalLaps - currentLap;
    const avgConsumption = this.state.totalConsumed / Math.max(1, this.state.lapCount);
    const targetEnd = 2.0;
    const fuelNeeded = remaining * avgConsumption;
    const fuelOffset = this.state.currentLoad - fuelNeeded;
    const lapsRich = Math.max(0, Math.floor(fuelOffset / (avgConsumption * 0.35)));

    return {
      startFuel: this.state.currentLoad,
      targetEndFuel: targetEnd,
      lapsAtRich: Math.min(lapsRich, remaining),
      lapsAtStandard: remaining - lapsRich,
      lapsAtLean: 0,
      avgConsumptionPerLap: avgConsumption,
      canPush: fuelOffset > avgConsumption * 3,
      fuelOffset: Math.round(fuelOffset * 100) / 100,
    };
  }

  public setMixture(mixture: FuelState['mixture']): void { this.state.mixture = mixture; }
  public getState(): FuelState { return { ...this.state }; }
  public getFuelLoad(): number { return this.state.currentLoad; }
  public getFuelPercentage(): number { return (this.state.currentLoad / this.state.maxCapacity) * 100; }
  public addFuel(amount: number): void {
    this.state.currentLoad = Math.min(this.state.maxCapacity, this.state.currentLoad + amount);
  }
}
