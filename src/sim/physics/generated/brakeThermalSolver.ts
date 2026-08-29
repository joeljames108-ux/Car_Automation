// Brake Thermal Dynamics - Carbon/steel disc + pad model
// Disc temperature, pad temperature, convection, radiation, ABS
export interface BrakeThermalState {
  discTempFL: number; discTempFR: number; discTempRL: number; discTempRR: number;
  padTempFL: number; padTempFR: number; padTempRL: number; padTempRR: number;
  totalEnergyFL: number; totalEnergyFR: number; totalEnergyRL: number; totalEnergyRR: number;
  brakeBias: number; ABSActive: boolean;
}

export interface BrakeThermalParams {
  discMass: number; discSpecificHeat: number; discRadius: number; discThickness: number;
  padArea: number; padFriction: number; padMuTempCoeff: number;
  convCoeff: number; radArea: number;
  maxDiscTemp: number; optimalDiscTemp: number;
  isCarbon: boolean;
}

export class BrakeThermalSolver {
  private state: BrakeThermalState;
  private params: BrakeThermalParams;

  constructor(params: BrakeThermalParams, ambientTemp: number = 30) {
    this.params = params;
    this.state = {
      discTempFL: ambientTemp, discTempFR: ambientTemp,
      discTempRL: ambientTemp, discTempRR: ambientTemp,
      padTempFL: ambientTemp, padTempFR: ambientTemp,
      padTempRL: ambientTemp, padTempRR: ambientTemp,
      totalEnergyFL: 0, totalEnergyFR: 0, totalEnergyRL: 0, totalEnergyRR: 0,
      brakeBias: 0.56, ABSActive: false,
    };
  }

  // Disc friction: mu decreases with temperature (fade)
  private padMu(discTemp: number): number {
    const p = this.params;
    const base = p.padFriction;
    const tempEffect = p.padMuTempCoeff * (discTemp - p.optimalDiscTemp);
    if (p.isCarbon) {
      return base * (discTemp > 300 ? 1 - (discTemp-300)/2000 : discTemp > 200 ? 0.95 + (discTemp-200)/2000 : 0.95);
    }
    return Math.max(base * (1 - Math.max(0, discTemp-400) * 0.001), base * 0.5);
  }

  // Energy from braking: E = 0.5 * m * (v1^2 - v2^2)
  private brakingEnergy(v1: number, v2: number, mass: number): number {
    return 0.5 * mass * (v1*v1 - v2*v2);
  }

  // Disc temperature rise: dT = Q / (m * cp)
  private discTempRise(energy: number, dt: number): number {
    const p = this.params;
    const coolingLoss = p.convCoeff * p.radArea * (this.state.discTempFL - 30) * dt;
    return (energy - coolingLoss) / (p.discMass * p.discSpecificHeat);
  }

  // ABS slip control - prevents lockup
  private absControl(wheelSpeed: number, vehicleSpeed: number, brakePressure: number): boolean {
    if (vehicleSpeed < 5) return false;
    const slipRatio = (vehicleSpeed - wheelSpeed) / vehicleSpeed;
    return slipRatio > 0.15;
  }

  public step(
    brakePressures: [number, number, number, number],
    wheelSpeeds: [number, number, number, number],
    vehicleSpeed: number, vehicleMass: number, dt: number
  ): BrakeThermalState {
    const s = this.state;
    const p = this.params;
    const bp = brakePressures;
    const ws = wheelSpeeds;

    // Calculate energy from each brake
    const forces = bp.map((pressure, i) => {
      const mu = this.padMu([s.discTempFL,s.discTempFR,s.discTempRL,s.discTempRR][i]);
      const normalForce = pressure * p.padArea * 0.001;
      return mu * normalForce;
    });

    // Disc temps
    const temps = [s.discTempFL, s.discTempFR, s.discTempRL, s.discTempRR];
    forces.forEach((F, i) => {
      const power = F * ws[i];
      const cooling = p.convCoeff * (temps[i] - 30) * p.radArea;
      temps[i] += (power - cooling) * dt / (p.discMass * p.discSpecificHeat);
    });
    s.discTempFL = temps[0]; s.discTempFR = temps[1];
    s.discTempRL = temps[2]; s.discTempRR = temps[3];

    // ABS
    s.ABSActive = ws.some((w,i) => this.absControl(w, vehicleSpeed, bp[i]));

    // Pad temps (track disc temps with delay)
    s.padTempFL += (s.discTempFL - s.padTempFL) * 0.01 * dt;
    s.padTempFR += (s.discTempFR - s.padTempFR) * 0.01 * dt;
    s.padTempRL += (s.discTempRL - s.padTempRL) * 0.01 * dt;
    s.padTempRR += (s.discTempRR - s.padTempRR) * 0.01 * dt;

    // Energy accumulation
    s.totalEnergyFL += forces[0] * ws[0] * dt;
    s.totalEnergyFR += forces[1] * ws[1] * dt;
    s.totalEnergyRL += forces[2] * ws[2] * dt;
    s.totalEnergyRR += forces[3] * ws[3] * dt;

    return {...s};
  }

  public getState(): BrakeThermalState { return {...this.state}; }
}
