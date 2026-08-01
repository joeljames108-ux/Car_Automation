// ===================================================================
// ENGINE COOLING & OIL THERMAL MODEL — Dual Circuit Heat Transfer
// ===================================================================
// Phase 5: Models coolant and oil temperature dynamics, thermal masses,
// radiator airflow cooling, oil viscosity shifts, and thermal power derating.

export interface ThermalState {
  coolantTempC: number; // °C (normal ~85-95°C)
  oilTempC: number; // °C (normal ~90-110°C)
  blockTempC: number; // °C
  oilViscosityCst: number; // Kinematic viscosity in cSt
  powerDerateFactor: number; // 0.0 - 1.0 (1.0 = 100% full power, <1.0 = thermal derate)
  isOverheating: boolean;
  overheatSeverity: number; // 0.0 to 1.0
}

export interface CoolingSystemParams {
  radiatorSize: number; // 0.0 to 1.0
  oilCoolerSize: number; // 0.0 to 1.0
  waterPumpFlow: number; // 0.0 to 1.0
  fanSpeed: number; // 0.0 to 1.0
}

/**
 * Initializes engine thermal state
 */
export function createThermalState(ambientTempC: number = 25): ThermalState {
  return {
    coolantTempC: Math.max(20, ambientTempC),
    oilTempC: Math.max(20, ambientTempC),
    blockTempC: Math.max(20, ambientTempC),
    oilViscosityCst: 60.0, // cold oil viscosity
    powerDerateFactor: 1.0,
    isOverheating: false,
    overheatSeverity: 0.0,
  };
}

/**
 * Updates thermal state over timestep dt
 */
export function updateThermalState(
  currentState: ThermalState,
  heatGenerationKw: number,
  vehicleSpeedKmh: number,
  ambientTempC: number,
  cooling: CoolingSystemParams,
  dtSeconds: number
): ThermalState {
  let { coolantTempC, oilTempC, blockTempC } = currentState;

  // 1. Heat rejection via radiator (air velocity + fan)
  const effectiveAirSpeed = Math.max(15, vehicleSpeedKmh) + cooling.fanSpeed * 30; // km/h
  const radiatorEffectiveness = (0.3 + cooling.radiatorSize * 0.7) * (cooling.waterPumpFlow * 0.5 + 0.5);
  const heatRejectionCoolantKw = radiatorEffectiveness * 0.08 * (coolantTempC - ambientTempC) * (effectiveAirSpeed / 50);

  // 2. Heat rejection via oil cooler
  const oilCoolerEffectiveness = 0.1 + cooling.oilCoolerSize * 0.9;
  const heatRejectionOilKw = oilCoolerEffectiveness * 0.05 * (oilTempC - ambientTempC) * (vehicleSpeedKmh / 60);

  // 3. Thermal mass differential equations
  // Coolant absorbs ~40% of combustion heat loss, oil absorbs ~20%
  const coolantHeatInKw = heatGenerationKw * 0.40;
  const oilHeatInKw = heatGenerationKw * 0.20;

  const coolantMassKg = 8.0; // litres of coolant
  const oilMassKg = 5.0; // litres of oil

  const dCoolant = ((coolantHeatInKw - heatRejectionCoolantKw) / (coolantMassKg * 4.18)) * dtSeconds;
  const dOil = ((oilHeatInKw - heatRejectionOilKw) / (oilMassKg * 2.0)) * dtSeconds;

  coolantTempC = Math.max(ambientTempC, coolantTempC + dCoolant);
  oilTempC = Math.max(ambientTempC, oilTempC + dOil);
  blockTempC = coolantTempC * 0.6 + oilTempC * 0.4;

  // 4. Oil viscosity shift (SAE 5W-30 approximation: ~60 cSt at 40°C, ~10 cSt at 100°C)
  const oilViscosityCst = Math.max(3.0, 100 * Math.exp(-0.025 * oilTempC));

  // 5. Overheating derate
  let powerDerateFactor = 1.0;
  let isOverheating = false;
  let overheatSeverity = 0.0;

  if (coolantTempC > 105 || oilTempC > 130) {
    isOverheating = true;
    const coolantOver = Math.max(0, coolantTempC - 105);
    const oilOver = Math.max(0, oilTempC - 130);
    overheatSeverity = Math.min(1.0, (coolantOver + oilOver) / 30);
    powerDerateFactor = Math.max(0.4, 1.0 - overheatSeverity * 0.5);
  }

  return {
    coolantTempC: Math.round(coolantTempC * 10) / 10,
    oilTempC: Math.round(oilTempC * 10) / 10,
    blockTempC: Math.round(blockTempC * 10) / 10,
    oilViscosityCst: Math.round(oilViscosityCst * 10) / 10,
    powerDerateFactor: Math.round(powerDerateFactor * 100) / 100,
    isOverheating,
    overheatSeverity: Math.round(overheatSeverity * 100) / 100,
  };
}
