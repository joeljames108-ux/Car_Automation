// Tire Thermal Network Model - 6-node thermal network
// Inner liner, belt, tread, sidewall, bead, rim interface
export interface TireThermalState {
  innerLinerTemp: number; beltTemp: number; treadTemp: number;
  sidewallTemp: number; beadTemp: number; rimTemp: number;
  pressure: number; wearRate: number; gripCoeff: number;
  grainRisk: number; blisterRisk: number; age: number;
}

export interface TireThermalParams {
  mass: number; specificHeat: number;
  convCoeffInner: number; convCoeffOuter: number;
  radCoeffSidewall: number; condCoeffBelt: number;
  contactPatchArea: number;
  treadDepth: number; designPressure: number;
  ambientTemp: number; trackTemp: number;
}

export class TireThermalNetwork {
  private state: TireThermalState;
  private params: TireThermalParams;
  private history: TireThermalState[] = [];

  constructor(params: TireThermalParams) {
    this.params = params;
    this.state = {
      innerLinerTemp: params.ambientTemp + 10,
      beltTemp: params.ambientTemp + 8,
      treadTemp: params.ambientTemp + 12,
      sidewallTemp: params.ambientTemp + 5,
      beadTemp: params.ambientTemp + 3,
      rimTemp: params.ambientTemp,
      pressure: params.designPressure,
      wearRate: 0, gripCoeff: 1.0,
      grainRisk: 0, blisterRisk: 0, age: 0,
    };
  }

  // Heat generation: Q = mu * Fz * v_slip
  private heatGeneration(slipAngle: number, slipRatio: number, Fz: number, speed: number): number {
    const totalSlip = Math.sqrt(slipAngle*slipAngle + slipRatio*slipRatio);
    const mu = 1.2;
    return mu * Fz * speed * totalSlip * 0.15;
  }

  // Convection cooling: Q = h * A * (T - T_amb)
  private convectiveCooling(temp: number, h: number, area: number, tAmb: number): number {
    return h * area * (temp - tAmb);
  }

  // Radiation cooling: Q = eps * sigma * A * (T^4 - T_amb^4)
  private radiativeCooling(temp: number, area: number, tAmb: number): number {
    const eps = 0.9;
    const sigma = 5.67e-8;
    return eps * sigma * area * (Math.pow(temp+273.15,4) - Math.pow(tAmb+273.15,4));
  }

  // Conductive heat transfer between nodes: Q = k * A * dT / dx
  private conduction(t1: number, t2: number, k: number, area: number, dx: number): number {
    return k * area * (t1 - t2) / dx;
  }

  // Tire pressure model: P1/T1 = P2/T2 (Ideal Gas Law)
  private pressureModel(): number {
    const Tavg = (this.state.innerLinerTemp + this.state.treadTemp) / 2 + 273.15;
    const T0 = this.params.ambientTemp + 273.15;
    return this.params.designPressure * (Tavg / T0);
  }

  // Grip coefficient from temperature (optimal window: 80-110C)
  private gripFromTemp(treadTemp: number): number {
    const optTemp = 95;
    const sigma = 20;
    return Math.exp(-Math.pow(treadTemp - optTemp, 2) / (2 * sigma * sigma));
  }

  // Grain risk: high at low temp, high slip
  private grainRiskCalc(temp: number, slipAngle: number): number {
    if (temp > 70) return 0;
    return Math.min(1, (70 - temp) / 30 * Math.abs(slipAngle) * 5);
  }

  // Blister risk: high at high temp, high energy
  private blisterRiskCalc(temp: number, energy: number): number {
    if (temp < 110) return 0;
    return Math.min(1, (temp - 110) / 40 + energy / 100000);
  }

  // Wear rate: exponential with temperature, linear with load
  private wearRateCalc(temp: number, Fz: number, slipAngle: number): number {
    const tempFactor = Math.exp((temp - 90) * 0.03);
    const loadFactor = Fz / 5000;
    const slipFactor = Math.abs(slipAngle) * 2;
    return tempFactor * loadFactor * slipFactor * 0.001;
  }

  public step(
    slipAngle: number, slipRatio: number, Fz: number,
    speed: number, dt: number
  ): TireThermalState {
    const s = this.state;
    const p = this.params;
    const Qgen = this.heatGeneration(slipAngle, slipRatio, Fz, speed);
    const Acp = p.contactPatchArea;
    const vWind = speed * 0.3;

    // Temperature derivatives
    const dTtread = (Qgen - this.convectiveCooling(s.treadTemp, p.convCoeffOuter, Acp, p.trackTemp) -
      this.radiativeCooling(s.treadTemp, Acp * 0.5, p.ambientTemp)) / (p.mass * p.specificHeat);
    const dTbelt = (this.conduction(s.treadTemp, s.beltTemp, p.condCoeffBelt, Acp, 0.005) -
      this.conduction(s.beltTemp, s.innerLinerTemp, p.condCoeffBelt, Acp, 0.003)) / (p.mass * 0.3 * p.specificHeat);
    const dTinner = (this.conduction(s.beltTemp, s.innerLinerTemp, p.condCoeffBelt, Acp, 0.003) -
      this.convectiveCooling(s.innerLinerTemp, 15, Acp * 0.5, p.ambientTemp + 5)) / (p.mass * 0.2 * p.specificHeat);
    const dTside = (this.conduction(s.beltTemp, s.sidewallTemp, 50, Acp * 0.3, 0.08) -
      this.convectiveCooling(s.sidewallTemp, p.convCoeffOuter * 0.5, Acp * 0.3, p.ambientTemp)) / (p.mass * 0.15 * p.specificHeat);
    const dTbead = this.conduction(s.sidewallTemp, s.beadTemp, 100, Acp * 0.1, 0.05) / (p.mass * 0.1 * p.specificHeat);
    const dTrim = this.conduction(s.beadTemp, s.rimTemp, 200, Acp * 0.1, 0.02) / (p.mass * 0.5 * p.specificHeat);

    // Update state
    s.treadTemp += dTtread * dt;
    s.beltTemp += dTbelt * dt;
    s.innerLinerTemp += dTinner * dt;
    s.sidewallTemp += dTside * dt;
    s.beadTemp += dTbead * dt;
    s.rimTemp += dTrim * dt;
    s.pressure = this.pressureModel();
    s.gripCoeff = this.gripFromTemp(s.treadTemp);
    s.grainRisk = this.grainRiskCalc(s.treadTemp, slipAngle);
    s.blisterRisk = this.blisterRiskCalc(s.treadTemp, Qgen * dt);
    s.wearRate = this.wearRateCalc(s.treadTemp, Fz, slipAngle);
    s.age += dt;
    this.history.push({...s});
    return {...s};
  }

  public getState(): TireThermalState { return {...this.state}; }
  public getHistory(): TireThermalState[] { return [...this.history]; }
  public reset(): void {
    this.state.treadTemp = this.params.ambientTemp + 12;
    this.state.beltTemp = this.params.ambientTemp + 8;
    this.state.innerLinerTemp = this.params.ambientTemp + 10;
    this.state.sidewallTemp = this.params.ambientTemp + 5;
    this.state.beadTemp = this.params.ambientTemp + 3;
    this.state.rimTemp = this.params.ambientTemp;
    this.state.age = 0;
    this.history = [];
  }
}
