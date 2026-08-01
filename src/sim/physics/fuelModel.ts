// ===================================================================
// FUEL CONSUMPTION INTEGRATION & TANK MODEL
// ===================================================================
// Phase 9: BSFC 2D surface mapping (RPM x Load BMEP), instantaneous fuel flow
// integration, tank weight burn-off CG dynamics, and range calculation.

export interface FuelState {
  fuelCapacityKg: number; // e.g. 50 kg (~65L)
  fuelRemainingKg: number;
  fuelLevelFraction: number; // 0.0 to 1.0
  instantBsfcGKwH: number; // g / kWh
  instantFuelFlowKgS: number; // kg / s
  fuelConsumedLapKg: number;
  averageLitersPer100Km: number;
}

/**
 * Calculates Brake Specific Fuel Consumption (BSFC) in g/kWh based on RPM and engine load (BMEP / BMEP_max)
 */
export function calculateBSFC(
  rpm: number,
  redline: number,
  bmepLoadFraction: number, // 0.0 to 1.0
  thermalEfficiency: number
): number {
  // Base optimal BSFC at sweet spot (~300 / (thermalEfficiency / 0.3))
  const baseBsfc = 300 / (Math.max(0.18, thermalEfficiency) / 0.30); // ~230-350 g/kWh

  // Load penalty (at low load, pumping & friction losses dominate relative to work output)
  let loadPenalty = 1.0;
  if (bmepLoadFraction < 0.20) {
    loadPenalty = 2.2 - bmepLoadFraction * 4.0; // Sharp BSFC spike near idle
  } else if (bmepLoadFraction < 0.75) {
    loadPenalty = 1.25 - bmepLoadFraction * 0.33; // Optimum around 70-80% load
  } else {
    loadPenalty = 1.0 + (bmepLoadFraction - 0.75) * 0.4; // Slightly richer at 100% WOT for cooling
  }

  // RPM penalty (at high RPM, friction rises quadratic)
  const rpmFrac = rpm / Math.max(1, redline);
  let rpmPenalty = 1.0;
  if (rpmFrac < 0.2) {
    rpmPenalty = 1.15;
  } else if (rpmFrac < 0.55) {
    rpmPenalty = 1.0; // Optimum mid-range
  } else {
    rpmPenalty = 1.0 + (rpmFrac - 0.55) * 0.5; // High RPM friction tax
  }

  return Math.max(200, Math.min(650, baseBsfc * loadPenalty * rpmPenalty));
}

/**
 * Updates fuel state over timestep dt
 */
export function updateFuelState(
  currentState: FuelState,
  currentPowerKw: number,
  rpm: number,
  redline: number,
  loadFraction: number,
  thermalEfficiency: number,
  speedKmh: number,
  dtSeconds: number
): FuelState {
  let { fuelRemainingKg, fuelCapacityKg, fuelConsumedLapKg } = currentState;

  const bsfc = calculateBSFC(rpm, redline, loadFraction, thermalEfficiency);

  // Power (kW) * BSFC (g/kWh) / 3600 = fuel flow in g/s -> /1000 = kg/s
  const instantFuelFlowKgS = (Math.max(0, currentPowerKw) * bsfc) / (3600 * 1000);
  const fuelBurnedStepKg = instantFuelFlowKgS * dtSeconds;

  fuelRemainingKg = Math.max(0, fuelRemainingKg - fuelBurnedStepKg);
  fuelConsumedLapKg += fuelBurnedStepKg;

  const fuelLevelFraction = fuelCapacityKg > 0 ? fuelRemainingKg / fuelCapacityKg : 0;

  // L/100km estimate (Gasoline density ~0.75 kg/L)
  let averageLitersPer100Km = 10.0;
  if (speedKmh > 10) {
    const litersPerSec = instantFuelFlowKgS / 0.75;
    const kmPerSec = speedKmh / 3600;
    averageLitersPer100Km = (litersPerSec / kmPerSec) * 100;
  }

  return {
    fuelCapacityKg,
    fuelRemainingKg: Math.round(fuelRemainingKg * 1000) / 1000,
    fuelLevelFraction: Math.round(fuelLevelFraction * 1000) / 1000,
    instantBsfcGKwH: Math.round(bsfc),
    instantFuelFlowKgS: Math.round(instantFuelFlowKgS * 100000) / 100000,
    fuelConsumedLapKg: Math.round(fuelConsumedLapKg * 1000) / 1000,
    averageLitersPer100Km: Math.round(Math.min(99.9, averageLitersPer100Km) * 10) / 10,
  };
}
