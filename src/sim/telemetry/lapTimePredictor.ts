// ============================================================================
// RACE ENGINEERING SUITE — LAP TIME PREDICTOR
// ============================================================================
// Predictive lap time calculator based on vehicle configuration, tire state,
// fuel load, weather conditions, and driver performance factors.
// ============================================================================

export interface LapPredictionInput {
  trackLength: number;
  trackElevationGain: number;
  numCorners: number;
  avgCornerSpeed: number;
  topSpeed: number;
  tireGrip: number;
  tireWear: number;
  fuelLoad: number;
  fuelCapacity: number;
  aeroDownforce: number;
  aeroDrag: number;
  weight: number;
  power: number;
  weatherWetness: number;
  driverSkill: number;
  trackTemp: number;
  altitude: number;
}

export interface LapPredictionResult {
  predictedLapTime: number;
  confidence: number;
  breakdown: {
    straightLineTime: number;
    corneringTime: number;
    brakingTime: number;
    fuelEffect: number;
    tireEffect: number;
    weatherEffect: number;
    elevationEffect: number;
    aeroEffect: number;
  };
  comparisonToBest: number;
  sectors: [number, number, number];
}

export class LapTimePredictor {
  /**
   * Predict lap time based on physics model
   */
  public predict(input: LapPredictionInput): LapPredictionResult {
    const straightDist = input.trackLength * 0.55;
    const cornerDist = input.trackLength * 0.35;
    const brakingDist = input.trackLength * 0.10;

    // Straight line time
    const avgStraightSpeed = (input.topSpeed + input.avgCornerSpeed * 2) / 3;
    const straightLineTime = straightDist / (avgStraightSpeed / 3.6);

    // Cornering time (lateral grip limited)
    const maxLateralG = input.tireGrip * 1.5;
    const corneringTime = cornerDist / (input.avgCornerSpeed / 3.6);

    // Braking time
    const brakeDecel = 4.5 + (input.aeroDownforce / input.weight) * 0.3;
    const brakingTime = brakingDist / (brakeDecel * 3.6);

    // Corrections
    const fuelEffect = (input.fuelLoad / input.fuelCapacity) * input.weight * 0.0001 * input.trackLength;
    const tireEffect = input.tireWear * 0.002 * input.trackLength * 0.01;
    const weatherEffect = input.weatherWetness * straightLineTime * 0.3;
    const elevationEffect = input.trackElevationGain * 0.005;
    const aeroEffect = (input.aeroDrag / 1000) * 0.5 - (input.aeroDownforce / 5000) * 0.3;

    const baseTime = straightLineTime + corneringTime + brakingTime;
    const predictedLapTime = baseTime + fuelEffect + tireEffect + weatherEffect + elevationEffect + aeroEffect;

    // Driver effect
    const driverFactor = (100 - input.driverSkill) * 0.003;
    const finalTime = predictedLapTime * (1 + driverFactor);

    // Sector splits
    const s1 = finalTime * 0.33;
    const s2 = finalTime * 0.38;
    const s3 = finalTime * 0.29;

    return {
      predictedLapTime: Math.round(finalTime * 1000) / 1000,
      confidence: 0.85 - input.weatherWetness * 0.2 - input.tireWear * 0.001,
      breakdown: {
        straightLineTime: Math.round(straightLineTime * 1000) / 1000,
        corneringTime: Math.round(corneringTime * 1000) / 1000,
        brakingTime: Math.round(brakingTime * 1000) / 1000,
        fuelEffect: Math.round(fuelEffect * 1000) / 1000,
        tireEffect: Math.round(tireEffect * 1000) / 1000,
        weatherEffect: Math.round(weatherEffect * 1000) / 1000,
        elevationEffect: Math.round(elevationEffect * 1000) / 1000,
        aeroEffect: Math.round(aeroEffect * 1000) / 1000,
      },
      comparisonToBest: 0,
      sectors: [Math.round(s1 * 1000) / 1000, Math.round(s2 * 1000) / 1000, Math.round(s3 * 1000) / 1000],
    };
  }

  /**
   * Predict race finish time given a strategy
   */
  public predictRaceTime(
    inputs: LapPredictionInput[],
    pitTime: number = 22,
  ): { totalTime: number; avgLap: number; laps: number } {
    let totalTime = 0;
    for (const input of inputs) {
      totalTime += this.predict(input).predictedLapTime;
    }
    totalTime += Math.floor(inputs.length / 20) * pitTime;
    return {
      totalTime: Math.round(totalTime * 100) / 100,
      avgLap: Math.round((totalTime / Math.max(1, inputs.length)) * 100) / 100,
      laps: inputs.length,
    };
  }

  /**
   * Calculate fuel delta per lap
   */
  public fuelDeltaPerLap(power: number, trackLength: number, avgSpeed: number): number {
    const baseConsumption = trackLength * 0.0018;
    const powerFactor = power / 800;
    return baseConsumption * powerFactor * (65 / avgSpeed);
  }
}
