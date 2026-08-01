// ===================================================================
// WEATHER SYSTEM — Rain, Aquaplaning & Crosswind Physics
// ===================================================================
// Phase 13: Dynamic water depth accumulation, aquaplaning critical speed threshold,
// tyre tread displacement physics, and lateral aerodynamic crosswind forces.

export interface WeatherParams {
  rainRateMmHr: number; // 0 = dry, 5 = light rain, 25 = torrential downpour
  trackDrainageQuality: number; // 0.0 (poor) to 1.0 (excellent)
  ambientTempC: number;
  windSpeedKmh: number;
  windDirectionDeg: number; // 0° = headwind, 90° = crosswind
}

export interface WeatherState {
  waterDepthMm: number;
  trackSurfaceGripMultiplier: number;
  aquaplaningSpeedKmh: number;
  crosswindSideForceN: number;
}

/**
 * Calculates critical aquaplaning speed (km/h) using modified NASA equation:
 * V_aquaplane = C * sqrt(P_tyre_bar / water_depth_mm)
 */
export function calculateAquaplaningSpeed(
  tyrePressureBar: number,
  waterDepthMm: number,
  tyreTreadDepthMm: number = 8.0,
  isSlick: boolean = false
): number {
  if (waterDepthMm <= 0.5) return 350; // no aquaplaning on damp track

  // NASA empirical constant (in bar/kmh units) ~65-75
  const baseC = isSlick ? 42 : 72;
  const treadFactor = Math.min(1.5, Math.max(0.3, tyreTreadDepthMm / 5.0));

  const criticalKmh = baseC * Math.sqrt(Math.max(1.5, tyrePressureBar) / Math.max(0.5, waterDepthMm)) * treadFactor;
  return Math.round(Math.max(40, criticalKmh));
}

/**
 * Calculates current weather state
 */
export function calculateWeatherState(
  vehicleSpeedKmh: number,
  tyrePressureBar: number,
  isSlick: boolean,
  params: WeatherParams
): WeatherState {
  const { rainRateMmHr, trackDrainageQuality, windSpeedKmh, windDirectionDeg } = params;

  // 1. Water depth on track (mm)
  const drainageEffect = 1.0 - trackDrainageQuality * 0.6;
  const waterDepthMm = Math.min(12.0, (rainRateMmHr / 3.0) * drainageEffect);

  // 2. Track surface grip multiplier
  let trackSurfaceGripMultiplier = 1.0;
  if (waterDepthMm > 0.1) {
    // Wet grip penalty
    const baseWetPen = isSlick ? 0.45 : 0.82;
    trackSurfaceGripMultiplier = Math.max(0.3, baseWetPen - (waterDepthMm / 10.0) * 0.25);
  }

  // 3. Aquaplaning threshold
  const aquaplaningSpeedKmh = calculateAquaplaningSpeed(tyrePressureBar, waterDepthMm, 8.0, isSlick);

  if (vehicleSpeedKmh >= aquaplaningSpeedKmh && waterDepthMm > 1.0) {
    // Above aquaplaning speed: tyre hydroplanes, grip drops catastrophically
    const overspeed = vehicleSpeedKmh - aquaplaningSpeedKmh;
    const hydroplanePen = Math.min(0.8, overspeed * 0.03);
    trackSurfaceGripMultiplier = Math.max(0.15, trackSurfaceGripMultiplier - hydroplanePen);
  }

  // 4. Aerodynamic Crosswind Side Force (N)
  // F_side = 0.5 * rho * V_wind_side^2 * A_side * C_side
  const crosswindSpeedMs = (windSpeedKmh / 3.6) * Math.abs(Math.sin((windDirectionDeg * Math.PI) / 180));
  const sideAreaM2 = 4.2; // typical vehicle side profile area
  const crosswindSideForceN = Math.round(0.5 * 1.225 * crosswindSpeedMs * crosswindSpeedMs * sideAreaM2 * 0.85);

  return {
    waterDepthMm: Math.round(waterDepthMm * 10) / 10,
    trackSurfaceGripMultiplier: Math.round(trackSurfaceGripMultiplier * 100) / 100,
    aquaplaningSpeedKmh,
    crosswindSideForceN,
  };
}
