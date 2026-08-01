// ===================================================================
// BATTERY & ENERGY MANAGEMENT SYSTEM (EMS) MODEL
// ===================================================================
// Phase 12: Internal resistance R_int(SOC, Temp), Joule heating (I²R),
// SOC-dependent voltage droop, thermal derating, and battery chemistry dynamics.

export type BatteryChemistry = 'nimh' | 'lfp' | 'nmc' | 'solid_state';

export interface BatteryParams {
  capacityKwh: number;
  chemistry: BatteryChemistry;
  maxPowerKw: number;
  hasLiquidCooling: boolean;
}

export interface BatteryState {
  socFraction: number; // 0.0 to 1.0 State of Charge
  batteryTempC: number;
  internalResistanceOhm: number;
  voltageV: number;
  currentAmps: number;
  maxAvailablePowerKw: number;
  isThermalThrottling: boolean;
}

/**
 * Initializes battery state
 */
export function createBatteryState(capacityKwh: number, ambientTempC: number = 25): BatteryState {
  return {
    socFraction: 1.0,
    batteryTempC: Math.max(20, ambientTempC),
    internalResistanceOhm: 0.025,
    voltageV: 400,
    currentAmps: 0,
    maxAvailablePowerKw: 100,
    isThermalThrottling: false,
  };
}

/**
 * Updates battery state over timestep dt
 */
export function updateBatteryState(
  currentState: BatteryState,
  requestedPowerKw: number, // Positive = discharge, Negative = regen charge
  params: BatteryParams,
  ambientTempC: number,
  dtSeconds: number
): BatteryState {
  const { capacityKwh, chemistry, maxPowerKw, hasLiquidCooling } = params;
  let { socFraction, batteryTempC } = currentState;

  if (capacityKwh <= 0) {
    return {
      socFraction: 0,
      batteryTempC: ambientTempC,
      internalResistanceOhm: 0,
      voltageV: 0,
      currentAmps: 0,
      maxAvailablePowerKw: 0,
      isThermalThrottling: false,
    };
  }

  // 1. Chemistry parameters (nominal voltage per cell, base R_int, optimal temp window)
  let baseRint = 0.020;
  let nominalVoltage = 400; // Pack nominal voltage (V)
  if (chemistry === 'lfp') baseRint = 0.028;
  else if (chemistry === 'solid_state') baseRint = 0.012;
  else if (chemistry === 'nimh') baseRint = 0.045;

  // 2. SOC-dependent Internal Resistance (R_int increases at very low / high SOC)
  let socMultiplier = 1.0;
  if (socFraction < 0.15) socMultiplier = 1.8 - socFraction * 4.0;
  else if (socFraction > 0.90) socMultiplier = 1.2;

  const internalResistanceOhm = baseRint * socMultiplier;

  // 3. Thermal Throttling limits
  let isThermalThrottling = false;
  let thermalPowerLimitFactor = 1.0;

  if (batteryTempC > 45) {
    isThermalThrottling = true;
    thermalPowerLimitFactor = Math.max(0.2, 1.0 - (batteryTempC - 45) / 25);
  }

  // 4. Low SOC power derating
  let socPowerLimitFactor = 1.0;
  if (socFraction < 0.20) {
    socPowerLimitFactor = Math.max(0.1, socFraction / 0.20);
  }

  const maxAvailablePowerKw = Math.round(maxPowerKw * thermalPowerLimitFactor * socPowerLimitFactor * 10) / 10;

  // 5. Clamped actual power draw
  const actualPowerKw = Math.max(-maxAvailablePowerKw, Math.min(maxAvailablePowerKw, requestedPowerKw));

  // 6. Pack Current & Voltage droop: P = V * I  -> I = (P * 1000) / V
  const currentAmps = (actualPowerKw * 1000) / nominalVoltage;
  const voltageV = nominalVoltage - currentAmps * internalResistanceOhm;

  // 7. Joule Heating: Q_joule = I² * R_int (Watts)
  const jouleHeatKw = (currentAmps * currentAmps * internalResistanceOhm) / 1000;

  // Cooling rate
  const coolingFactor = hasLiquidCooling ? 0.08 : 0.02;
  const heatRejectionKw = coolingFactor * (batteryTempC - ambientTempC);

  // Battery thermal mass ~12 kg/kWh, Cp ~900 J/(kg*K)
  const thermalMassKg = capacityKwh * 12;
  const dTemp = ((jouleHeatKw - heatRejectionKw) * 1000 / (thermalMassKg * 900)) * dtSeconds;
  batteryTempC = Math.max(ambientTempC, batteryTempC + dTemp);

  // 8. SOC Integration: SOC(t) = SOC(0) - (P * dt) / Capacity
  const energyDeltaKwh = (actualPowerKw * (dtSeconds / 3600));
  socFraction = Math.max(0.0, Math.min(1.0, socFraction - energyDeltaKwh / capacityKwh));

  return {
    socFraction: Math.round(socFraction * 1000) / 1000,
    batteryTempC: Math.round(batteryTempC * 10) / 10,
    internalResistanceOhm: Math.round(internalResistanceOhm * 1000) / 1000,
    voltageV: Math.round(voltageV * 10) / 10,
    currentAmps: Math.round(currentAmps * 10) / 10,
    maxAvailablePowerKw,
    isThermalThrottling,
  };
}
