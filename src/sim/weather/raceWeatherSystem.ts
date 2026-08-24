// ============================================================================
// RACE ENGINEERING SUITE — RACE WEATHER SIMULATION SYSTEM
// ============================================================================
// Full atmospheric model for race simulation: weather prediction, rain radar,
// wind modeling, track temperature simulation, and weather transition logic.
// ============================================================================

export type WeatherCondition = 'clear' | 'partly_cloudy' | 'overcast' | 'light_rain' | 'heavy_rain' | 'storm' | 'fog';
export type RainIntensity = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0;

export interface WeatherState {
  condition: WeatherCondition;
  airTemperature: number;
  trackTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGust: number;
  rainIntensity: RainIntensity;
  rainProbability: number;
  visibility: number;
  pressure: number;
  cloudCover: number;
  uvIndex: number;
}

export interface WeatherForecast {
  minute: number;
  state: WeatherState;
  confidence: number;
}

export interface WeatherTransition {
  from: WeatherCondition;
  to: WeatherCondition;
  duration: number;
  probability: number;
}

const WEATHER_PRESETS: Record<string, WeatherState> = {
  clear: {
    condition: 'clear', airTemperature: 28, trackTemperature: 45, humidity: 45,
    windSpeed: 8, windDirection: 180, windGust: 15, rainIntensity: 0,
    rainProbability: 5, visibility: 20000, pressure: 1015, cloudCover: 10, uvIndex: 8,
  },
  partly_cloudy: {
    condition: 'partly_cloudy', airTemperature: 25, trackTemperature: 38, humidity: 55,
    windSpeed: 12, windDirection: 220, windGust: 22, rainIntensity: 0,
    rainProbability: 20, visibility: 18000, pressure: 1012, cloudCover: 45, uvIndex: 5,
  },
  overcast: {
    condition: 'overcast', airTemperature: 20, trackTemperature: 28, humidity: 70,
    windSpeed: 18, windDirection: 270, windGust: 30, rainIntensity: 0,
    rainProbability: 55, visibility: 15000, pressure: 1008, cloudCover: 85, uvIndex: 2,
  },
  light_rain: {
    condition: 'light_rain', airTemperature: 17, trackTemperature: 20, humidity: 85,
    windSpeed: 22, windDirection: 310, windGust: 38, rainIntensity: 0.3,
    rainProbability: 80, visibility: 8000, pressure: 1003, cloudCover: 95, uvIndex: 1,
  },
  heavy_rain: {
    condition: 'heavy_rain', airTemperature: 14, trackTemperature: 15, humidity: 95,
    windSpeed: 35, windDirection: 0, windGust: 55, rainIntensity: 0.8,
    rainProbability: 98, visibility: 2000, pressure: 998, cloudCover: 100, uvIndex: 0,
  },
  storm: {
    condition: 'storm', airTemperature: 12, trackTemperature: 13, humidity: 98,
    windSpeed: 50, windDirection: 45, windGust: 80, rainIntensity: 1.0,
    rainProbability: 100, visibility: 500, pressure: 992, cloudCover: 100, uvIndex: 0,
  },
  fog: {
    condition: 'fog', airTemperature: 10, trackTemperature: 12, humidity: 100,
    windSpeed: 3, windDirection: 90, windGust: 8, rainIntensity: 0,
    rainProbability: 30, visibility: 200, pressure: 1010, cloudCover: 100, uvIndex: 0,
  },
};

export class RaceWeatherSystem {
  private currentState: WeatherState;
  private forecast: WeatherForecast[] = [];
  private history: WeatherState[] = [];
  private tick = 0;
  private transitionProgress = 0;
  private targetWeather: WeatherState | null = null;
  private volatility: number;

  constructor(initialCondition: WeatherCondition = 'clear', volatility: number = 0.5) {
    this.currentState = { ...WEATHER_PRESETS[initialCondition] };
    this.volatility = volatility;
    this.generateForecast(60);
  }

  /**
   * Simulate one minute of weather evolution
   */
  public tickMinute(): WeatherState {
    this.tick++;
    this.history.push({ ...this.currentState });

    // Natural temperature drift
    const timeOfDay = (this.tick % 1440) / 1440;
    const solarAngle = Math.sin(timeOfDay * Math.PI * 2 - Math.PI / 2);
    this.currentState.airTemperature += solarAngle * 0.05 * (1 - this.currentState.cloudCover / 100);

    // Track temperature follows air temperature with lag
    const targetTrackTemp = this.currentState.airTemperature + 15 + solarAngle * 10 -
      this.currentState.rainIntensity * 8;
    this.currentState.trackTemperature += (targetTrackTemp - this.currentState.trackTemperature) * 0.02;

    // Wind evolution
    this.currentState.windSpeed += (Math.random() - 0.5) * 2 * this.volatility;
    this.currentState.windSpeed = Math.max(0, Math.min(80, this.currentState.windSpeed));
    this.currentState.windGust = this.currentState.windSpeed * (1.2 + Math.random() * 0.6);
    this.currentState.windDirection += (Math.random() - 0.5) * 10;

    // Pressure system
    this.currentState.pressure += (Math.random() - 0.5) * 0.5;

    // Rain evolution
    if (this.currentState.rainIntensity > 0) {
      this.currentState.rainIntensity += (Math.random() - 0.52) * 0.05;
      this.currentState.rainIntensity = Math.max(0, Math.min(1, this.currentState.rainIntensity)) as RainIntensity;
    }

    // Track wetness from rain
    if (this.currentState.rainIntensity > 0.1) {
      this.currentState.visibility = Math.max(200, 20000 * (1 - this.currentState.rainIntensity * 0.95));
    } else {
      this.currentState.visibility = Math.min(20000, this.currentState.visibility + 500);
    }

    // Humidity
    this.currentState.humidity = Math.min(100, Math.max(20,
      70 - (this.currentState.airTemperature - 20) * 1.5 + this.currentState.rainIntensity * 30
    ));

    // Update condition from rain intensity
    if (this.currentState.rainIntensity > 0.8) this.currentState.condition = 'storm';
    else if (this.currentState.rainIntensity > 0.4) this.currentState.condition = 'heavy_rain';
    else if (this.currentState.rainIntensity > 0.05) this.currentState.condition = 'light_rain';
    else if (this.currentState.visibility < 500) this.currentState.condition = 'fog';
    else if (this.currentState.cloudCover > 80) this.currentState.condition = 'overcast';
    else if (this.currentState.cloudCover > 40) this.currentState.condition = 'partly_cloudy';
    else this.currentState.condition = 'clear';

    // Cloud cover
    this.currentState.cloudCover += (Math.random() - 0.5) * 5;
    this.currentState.cloudCover = Math.max(0, Math.min(100, this.currentState.cloudCover));

    this.currentState.rainProbability = Math.min(100, Math.max(0,
      this.currentState.cloudCover * 0.6 + this.currentState.humidity * 0.3 +
      (this.currentState.pressure < 1005 ? 20 : 0)
    ));

    this.currentState.uvIndex = Math.max(0, Math.round((1 - this.currentState.cloudCover / 100) * solarAngle * 10));

    return { ...this.currentState };
  }

  /**
   * Force a weather change (for race events / dramatic moments)
   */
  public forceWeatherChange(target: WeatherCondition, transitionMinutes: number = 10): void {
    this.targetWeather = { ...WEATHER_PRESETS[target] };
    this.transitionProgress = 0;
    const stepsNeeded = transitionMinutes;
    const start = { ...this.currentState };
    const target2 = this.targetWeather;

    // Schedule gradual transition
    for (let i = 0; i < stepsNeeded; i++) {
      const t = i / stepsNeeded;
      const interpolated: WeatherState = {
        ...this.currentState,
        airTemperature: start.airTemperature + (target2.airTemperature - start.airTemperature) * t,
        trackTemperature: start.trackTemperature + (target2.trackTemperature - start.trackTemperature) * t,
        humidity: start.humidity + (target2.humidity - start.humidity) * t,
        windSpeed: start.windSpeed + (target2.windSpeed - start.windSpeed) * t,
        rainIntensity: (start.rainIntensity + (target2.rainIntensity - start.rainIntensity) * t) as RainIntensity,
        cloudCover: start.cloudCover + (target2.cloudCover - start.cloudCover) * t,
        visibility: start.visibility + (target2.visibility - start.visibility) * t,
        pressure: start.pressure + (target2.pressure - start.pressure) * t,
      };
      this.forecast.push({ minute: this.tick + i, state: interpolated, confidence: 0.9 - t * 0.4 });
    }
  }

  /**
   * Generate a weather forecast for the next N minutes
   */
  private generateForecast(minutes: number): void {
    this.forecast = [];
    let predicted = { ...this.currentState };
    for (let i = 0; i < minutes; i++) {
      const noise = this.volatility * 0.5;
      predicted = {
        ...predicted,
        airTemperature: predicted.airTemperature + (Math.random() - 0.5) * noise,
        windSpeed: Math.max(0, predicted.windSpeed + (Math.random() - 0.5) * noise * 3),
        rainIntensity: Math.max(0, Math.min(1, predicted.rainIntensity + (Math.random() - 0.48) * noise * 0.1)) as RainIntensity,
        cloudCover: Math.max(0, Math.min(100, predicted.cloudCover + (Math.random() - 0.5) * noise * 2)),
      };
      const confidence = Math.max(0.1, 0.95 - i * 0.015);
      this.forecast.push({ minute: this.tick + i, state: { ...predicted }, confidence });
    }
  }

  public getState(): WeatherState { return { ...this.currentState }; }
  public getForecast(): WeatherForecast[] { return this.forecast; }
  public getTrackWetness(): number { return Math.min(1, this.currentState.rainIntensity * 1.2); }
  public isWet(): boolean { return this.currentState.rainIntensity > 0.2; }
  public getRecommendedTire(): string {
    if (this.currentState.rainIntensity > 0.5) return 'wet';
    if (this.currentState.rainIntensity > 0.15) return 'intermediate';
    if (this.currentState.trackTemperature > 100) return 'hard';
    if (this.currentState.trackTemperature > 70) return 'medium';
    return 'soft';
  }
  public getHistory(): WeatherState[] { return this.history.slice(-30); }
}
