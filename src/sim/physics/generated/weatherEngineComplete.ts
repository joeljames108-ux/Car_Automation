// Weather & Track Evolution Engine
// Air density, humidity, rain probability, track grip evolution, wind effects
export interface WeatherState {
  airDensity: number; temperature: number; humidity: number;
  pressure: number; windSpeed: number; windDirection: number;
  rainIntensity: number; trackGrip: number; trackWetness: number;
  trackTemperature: number; visibility: number;
  evolutionRate: number; dryingRate: number;
}

export interface WeatherParams {
  altitude: number; baseTemperature: number; baseHumidity: number;
  basePressure: number; baseWindSpeed: number; baseWindDir: number;
  rainProb: number; seasonalVariation: number;
}

export class WeatherEngineComplete {
  private state: WeatherState;
  private params: WeatherParams;
  private time: number = 0;

  constructor(params: WeatherParams) {
    this.params = params;
    this.state = this.computeState(0);
  }

  // ISA + altitude temperature model
  private isaTemp(altitude: number): number {
    return 15 - 6.5 * altitude / 1000;
  }

  // Air density: rho = (P - 6.11*RH*exp(17.27*T/(T+237.3)))*100 / (287.05*(T+273.15))
  private airDensity(T: number, RH: number, P: number, alt: number): number {
    const Psat = 6.11 * Math.exp(17.27 * T / (T + 237.3));
    const Pw = RH * Psat / 100;
    const Pd = P - Pw + alt * 0.12;
    return Pd * 100 / (287.05 * (T + 273.15));
  }

  // Track grip evolution: rubber laid down increases grip over time
  private trackEvolution(laps: number, isWet: boolean): number {
    if (isWet) return 0.6;
    const rubber = 1 - Math.exp(-laps / 20);
    const abrasion = Math.min(laps * 0.002, 0.05);
    return 0.85 + rubber * 0.1 - abrasion;
  }

  // Track drying model
  private dryingRate(rainIntensity: number, windSpeed: number, temp: number): number {
    const solarDrying = temp > 20 ? (temp - 20) * 0.001 : 0;
    const windDrying = windSpeed * 0.005;
    return solarDrying + windDrying - rainIntensity * 0.1;
  }

  // Wind component along car direction
  private headwindComponent(windSpeed: number, windDir: number, trackDir: number): number {
    return windSpeed * Math.cos((windDir - trackDir) * Math.PI / 180);
  }

  // Crosswind effect on car stability
  private crosswindEffect(windSpeed: number, windDir: number, trackDir: number): number {
    return windSpeed * Math.sin((windDir - trackDir) * Math.PI / 180);
  }

  private computeState(elapsed: number): WeatherState {
    const p = this.params;
    const T = this.isaTemp(p.altitude) + p.baseTemperature + Math.sin(elapsed * 0.001) * 2;
    const RH = p.baseHumidity + Math.sin(elapsed * 0.0005) * 10;
    const P = p.basePressure + Math.sin(elapsed * 0.0003) * 2;
    const isRaining = Math.random() < p.rainProb * 0.1;
    const rain = isRaining ? Math.random() * 5 : 0;
    return {
      airDensity: this.airDensity(T, RH, P, p.altitude),
      temperature: T, humidity: RH, pressure: P,
      windSpeed: p.baseWindSpeed + Math.random() * 5,
      windDirection: p.baseWindDir + Math.random() * 30 - 15,
      rainIntensity: rain, trackGrip: this.trackEvolution(Math.floor(elapsed), rain > 0),
      trackWetness: Math.min(rain * 0.2, 1), trackTemperature: T + 8,
      visibility: rain > 2 ? Math.max(0.5, 1 - rain * 0.1) : 1,
      evolutionRate: 0.01, dryingRate: this.dryingRate(rain, p.baseWindSpeed, T),
    };
  }

  public step(dt: number, laps: number = 0): WeatherState {
    this.time += dt;
    this.state = this.computeState(this.time);
    this.state.trackGrip = this.trackEvolution(laps, this.state.rainIntensity > 0);
    return {...this.state};
  }

  public getState(): WeatherState { return {...this.state}; }
}

// Monte Carlo Lap Time Simulator
// Runs N laps with random variation to produce statistical distribution
export class MonteCarloSimulator {
  private laps: number[] = [];
  private driverErrorProb: number;
  private weatherVariance: number;
  private tireVariance: number;

  constructor(config?: { driverErrorProb?: number; weatherVariance?: number; tireVariance?: number }) {
    this.driverErrorProb = config?.driverErrorProb ?? 0.02;
    this.weatherVariance = config?.weatherVariance ?? 0.005;
    this.tireVariance = config?.tireVariance ?? 0.003;
  }

  // Box-Muller transform for Gaussian random numbers
  private gaussianRandom(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  public simulate(
    baseLapTime: number, numSimulations: number = 10000
  ): { mean: number; median: number; stdDev: number; min: number; max: number;
        percentiles: { p5: number; p25: number; p50: number; p75: number; p95: number };
        histogram: { bucket: string; count: number }[] } {
    this.laps = [];
    for (let i = 0; i < numSimulations; i++) {
      let lapTime = baseLapTime;
      // Weather variation
      lapTime *= 1 + this.gaussianRandom() * this.weatherVariance;
      // Tire variation
      lapTime *= 1 + this.gaussianRandom() * this.tireVariance;
      // Driver error (occasional big error)
      if (Math.random() < this.driverErrorProb) {
        lapTime *= 1 + Math.abs(this.gaussianRandom()) * 0.05;
      }
      this.laps.push(lapTime);
    }
    this.laps.sort((a, b) => a - b);
    const mean = this.laps.reduce((a, b) => a + b, 0) / this.laps.length;
    const variance = this.laps.reduce((s, l) => s + (l - mean) * (l - mean), 0) / this.laps.length;
    const stdDev = Math.sqrt(variance);
    // Histogram
    const min = this.laps[0];
    const max = this.laps[this.laps.length - 1];
    const bucketSize = (max - min) / 20;
    const histogram = [];
    for (let b = 0; b < 20; b++) {
      const lo = min + b * bucketSize;
      const hi = lo + bucketSize;
      const count = this.laps.filter(l => l >= lo && l < hi).length;
      histogram.push({ bucket: lo.toFixed(3) + "-" + hi.toFixed(3), count });
    }
    return {
      mean, median: this.laps[Math.floor(this.laps.length / 2)],
      stdDev, min, max,
      percentiles: {
        p5: this.laps[Math.floor(this.laps.length * 0.05)],
        p25: this.laps[Math.floor(this.laps.length * 0.25)],
        p50: this.laps[Math.floor(this.laps.length * 0.50)],
        p75: this.laps[Math.floor(this.laps.length * 0.75)],
        p95: this.laps[Math.floor(this.laps.length * 0.95)],
      },
      histogram,
    };
  }
}
