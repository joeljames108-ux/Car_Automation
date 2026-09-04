// ============================================================================
// MODULE 8: ENVIRONMENTAL MICROCLIMATE & TRACK TRIBOLOGY ENGINE
// ============================================================================
// Environmental physics and track surface dynamics:
// 1. Moist air density with altitude lapse rate, barometric pressure & humidity
// 2. Track surface solar radiation thermal balance (incident solar flux, conduction, convection)
// 3. Dynamic racing line rubbering-in grip evolution & marble buildup off-line
// 4. Wet weather water film thickness (Gallaway drainage formula) & aquaplaning
// ============================================================================

export interface WeatherStationData {
  ambientTempC: number;
  barometricPressureHpa: number;  // e.g. 1013.25 hPa at sea level
  relativeHumidityPct: number;    // e.g. 62%
  altitudeMeters: number;         // e.g. Spa: 420m, Mexico City: 2285m
  solarIrradianceWattsM2: number;// e.g. 850 W/m2 on clear sunny day
  windSpeedKmh: number;
  rainPrecipitationMmPerHour: number; // e.g. 0 = dry, 5 = light rain, 25 = torrential
}

export interface TrackMacroSurfaceConfig {
  baseFrictionMu: number;         // e.g. 1.05
  asphaltAlbedo: number;          // e.g. 0.09 (absorbs 91% solar radiation)
  crossFallSlopePct: number;      // e.g. 2.0% track camber drainage slope
  drainageLengthM: number;        // e.g. 7.5 m (half track width to gutter)
  macroTextureDepthMm: number;    // e.g. 1.2 mm (sand patch test)
}

export interface TrackMicroclimateState {
  trackSurfaceTempC: number;
  airDensityKgM3: number;
  gripEvolutionFactor: number;    // 1.0 to 1.08 (rubbering-in)
  waterFilmThicknessMm: number;
  aquaplaningSpeedKmh: number;
  isWetTrack: boolean;
  effectiveFrictionMu: number;
  offLineMarblesGripPenaltyPct: number;
}

export class EnvironmentalMicroclimateTrackPhysics {
  public static readonly SPECIFIC_GAS_CONST_DRY_AIR = 287.058; // J/(kg·K)
  public static readonly SPECIFIC_GAS_CONST_WATER_VAPOR = 461.495; // J/(kg·K)
  public static readonly STEFAN_BOLTZMANN = 5.670374e-8;

  /**
   * Evaluates atmospheric moist air density factoring in altitude barometric lapse,
   * ambient temperature, and partial vapor pressure.
   */
  public static computeMoistAirDensity(weather: WeatherStationData): number {
    const T_kelvin = weather.ambientTempC + 273.15;

    // Barometric pressure corrected for altitude: P = P0 * (1 - L*h/T0)^(g*M / (R*L))
    // Standard lapse rate L = 0.0065 K/m
    const pressurePa = (weather.barometricPressureHpa * 100.0) * Math.pow(1.0 - (0.0065 * weather.altitudeMeters) / 288.15, 5.255);

    // Saturation vapor pressure over water (Tetens equation, in Pa)
    const pSatPa = 610.78 * Math.exp((17.27 * weather.ambientTempC) / (weather.ambientTempC + 237.3));

    // Partial pressure of water vapor
    const pvPa = pSatPa * (weather.relativeHumidityPct / 100.0);
    // Partial pressure of dry air
    const pdPa = pressurePa - pvPa;

    // Moist air density: rho = (p_d / (R_d * T)) + (p_v / (R_v * T))
    const rhoDry = pdPa / (EnvironmentalMicroclimateTrackPhysics.SPECIFIC_GAS_CONST_DRY_AIR * T_kelvin);
    const rhoVapor = pvPa / (EnvironmentalMicroclimateTrackPhysics.SPECIFIC_GAS_CONST_WATER_VAPOR * T_kelvin);

    return Number((rhoDry + rhoVapor).toFixed(4));
  }

  /**
   * Evaluates track surface equilibrium temperature, rubber deposit evolution,
   * standing water film thickness, and hydroplaning critical velocity.
   */
  public static evaluateTrackConditions(
    weather: WeatherStationData,
    track: TrackMacroSurfaceConfig,
    lapsCompletedOnTrack: number = 10,
    tireInflationPressureBar: number = 2.1,
    tireTreadDepthMm: number = 4.0
  ): TrackMicroclimateState {
    const airDensity = EnvironmentalMicroclimateTrackPhysics.computeMoistAirDensity(weather);

    // ------------------------------------------------------------------------
    // 1. TRACK SURFACE SOLAR THERMAL BALANCE
    // ------------------------------------------------------------------------
    // Solar absorption = I_solar * (1 - albedo)
    const solarAbsorbedWattsM2 = weather.solarIrradianceWattsM2 * (1.0 - track.asphaltAlbedo);

    // Convective heat transfer coefficient with wind: h_c = 5.7 + 3.8 * v_wind
    const vWindMs = weather.windSpeedKmh / 3.6;
    const hConv = 5.7 + 3.8 * vWindMs;

    // Sub-surface deep ground conductive heat flux (deep earth ~18°C)
    const kAsphaltConductivity = 1.35; // W/(m·K)
    const deepGroundTempC = 18.0;
    const subbaseDepthM = 0.25;

    // Thermal equilibrium iteration for track surface temperature T_track:
    // Q_solar = h_conv * (T_track - T_amb) + (k / L) * (T_track - T_ground) + eps * sigma * (T_track^4 - T_sky^4)
    let tTrack = weather.ambientTempC + 8.0; // Initial guess
    for (let i = 0; i < 8; i++) {
      const qConv = hConv * (tTrack - weather.ambientTempC);
      const qCond = (kAsphaltConductivity / subbaseDepthM) * (tTrack - deepGroundTempC);
      const qRad = 0.93 * EnvironmentalMicroclimateTrackPhysics.STEFAN_BOLTZMANN * (Math.pow(tTrack + 273.15, 4) - Math.pow(weather.ambientTempC + 267.15, 4));

      const netFlux = solarAbsorbedWattsM2 - qConv - qCond - qRad;
      const dNetFlux_dT = -(hConv + (kAsphaltConductivity / subbaseDepthM) + 4.0 * 0.93 * EnvironmentalMicroclimateTrackPhysics.STEFAN_BOLTZMANN * Math.pow(tTrack + 273.15, 3));

      tTrack -= netFlux / dNetFlux_dT;
    }
    tTrack = Math.max(weather.ambientTempC - 2.0, Math.min(72.0, tTrack));

    // ------------------------------------------------------------------------
    // 2. RACING LINE RUBBERING-IN GRIP EVOLUTION
    // ------------------------------------------------------------------------
    // Grip improves exponentially as rubber deposits into micro-asperities:
    // mu_evol = mu_base + delta_max * (1 - exp(-laps / 18))
    const maxRubberBonus = 0.075; // +7.5% grip on fully rubbered line
    const rubberingFactor = 1.0 + maxRubberBonus * (1.0 - Math.exp(-lapsCompletedOnTrack / 18.0));

    // Off-line marble penalty: outside the groove, discarded rubber balls reduce grip by 14%
    const marblesPenaltyPct = 14.5 * (1.0 - Math.exp(-lapsCompletedOnTrack / 25.0));

    // ------------------------------------------------------------------------
    // 3. WET TRACK WATER FILM THICKNESS (GALLAWAY FORMULA) & AQUAPLANING
    // ------------------------------------------------------------------------
    let waterDepthMm = 0;
    let isWet = false;
    let aquaSpeedKmh = 350.0;
    let wetFrictionPenalty = 1.0;

    if (weather.rainPrecipitationMmPerHour > 0.1) {
      isWet = true;
      // W = 0.095 * T^0.11 * L^0.43 * I^0.59 * S^(-0.42) [Metric Gallaway equation]
      const T = track.macroTextureDepthMm;
      const L = track.drainageLengthM;
      const I = weather.rainPrecipitationMmPerHour;
      const S = Math.max(0.5, track.crossFallSlopePct);

      waterDepthMm = 0.095 * Math.pow(T, 0.11) * Math.pow(L, 0.43) * Math.pow(I, 0.59) * Math.pow(S, -0.42);
      waterDepthMm = Number(waterDepthMm.toFixed(2));

      // Dynamic hydroplaning speed formula (Horne & NASA formulation):
      // V_p = 6.35 * sqrt(P_tire_kPa) * (1 - waterDepth / treadDepth)
      const pTireKpa = tireInflationPressureBar * 100.0;
      const treadWaterClearingFactor = Math.max(0.35, Math.min(1.0, 1.0 - (waterDepthMm / Math.max(1.0, tireTreadDepthMm))));
      aquaSpeedKmh = 6.35 * Math.sqrt(pTireKpa) * treadWaterClearingFactor * 1.85; // NASA aero/tire factor

      // Wet friction penalty scales with water layer thickness
      wetFrictionPenalty = Math.max(0.42, 1.0 - 0.22 * Math.sqrt(waterDepthMm));
    }

    const effectiveMu = track.baseFrictionMu * rubberingFactor * wetFrictionPenalty;

    return {
      trackSurfaceTempC: Number(tTrack.toFixed(1)),
      airDensityKgM3: airDensity,
      gripEvolutionFactor: Number(rubberingFactor.toFixed(3)),
      waterFilmThicknessMm: waterDepthMm,
      aquaplaningSpeedKmh: Number(aquaSpeedKmh.toFixed(1)),
      isWetTrack: isWet,
      effectiveFrictionMu: Number(effectiveMu.toFixed(3)),
      offLineMarblesGripPenaltyPct: Number(marblesPenaltyPct.toFixed(1)),
    };
  }
}
