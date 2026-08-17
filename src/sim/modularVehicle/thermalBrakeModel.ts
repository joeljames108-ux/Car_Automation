// ===================================================================
// MOTORSPORT THERMAL BRAKE FADE & COOLING DUCT SIMULATION
// ===================================================================

export interface ThermalBrakeResult {
  rotorTempCelsius: number;
  brakeFadePercent: number;
  coolingAirflowLps: number;
  stoppingDistance100_0M: number;
}

export function calculateBrakeThermalState(
  isCarbonCeramic = true,
  coolingDuctDiameterMm = 76,
  consecutiveStops = 5
): ThermalBrakeResult {
  const baseTemp = 85; // Initial warm temp
  const tempPerStop = isCarbonCeramic ? 45 : 85;
  const coolingFactor = (coolingDuctDiameterMm / 76) * 0.35;

  let currentTemp = baseTemp + consecutiveStops * tempPerStop * (1 - coolingFactor);
  let fadePercent = 0;

  if (isCarbonCeramic) {
    fadePercent = currentTemp > 750 ? Math.min(25, (currentTemp - 750) * 0.05) : 0;
  } else {
    fadePercent = currentTemp > 380 ? Math.min(65, (currentTemp - 380) * 0.12) : 0;
  }

  const baseDist = isCarbonCeramic ? 30.5 : 33.0;
  const stoppingDist = Math.round((baseDist * (1 + fadePercent / 100)) * 10) / 10;

  return {
    rotorTempCelsius: Math.round(currentTemp),
    brakeFadePercent: Math.round(fadePercent * 10) / 10,
    coolingAirflowLps: Math.round(coolingDuctDiameterMm * 1.8),
    stoppingDistance100_0M: stoppingDist,
  };
}
