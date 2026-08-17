// ============================================================================
// PHASE 15 — POWERTRAIN THERMAL MANAGEMENT & COOLING NETWORK SIMULATOR
// ============================================================================
// 1D lumped-parameter thermal-fluid network simulation modeling coolant loops,
// engine oil heat exchangers, intercoolers, and brake rotor radiant cooling.
// ============================================================================

export interface ThermalNetworkInputs {
  enginePowerOutputKw: number;
  engineRpm: number;
  vehicleSpeedKmh: number;
  ambientTempC: number;
  thermostatCrackingTempC: number; // typically 82°C
  radiatorAreaM2: number;
  oilCoolerAreaM2: number;
  brakeBrakingPowerKw: number;
}

export interface ThermalNetworkState {
  coolantTempC: number;
  engineOilTempC: number;
  intercoolerExitTempC: number;
  brakeRotorFrontTempC: number;
  brakeRotorRearTempC: number;
  thermostatOpenPct: number;
  coolantFlowRateLpm: number;
  radiatorHeatRejectionKw: number;
  oilCoolerHeatRejectionKw: number;
  isOverheating: boolean;
}

export class PowertrainCoolingNetworkSimulator {
  /**
   * Advances the thermal state forward in time by dt seconds.
   */
  public static simulateStep(
    currentState: ThermalNetworkState,
    inputs: ThermalNetworkInputs,
    dtSeconds: number = 0.1
  ): ThermalNetworkState {
    const {
      enginePowerOutputKw,
      engineRpm,
      vehicleSpeedKmh,
      ambientTempC,
      thermostatCrackingTempC,
      radiatorAreaM2,
      oilCoolerAreaM2,
      brakeBrakingPowerKw,
    } = inputs;

    // 1. Coolant Loop Dynamics
    // Water pump flow rate is proportional to engine RPM
    const maxPumpFlowLpm = 180.0;
    const coolantFlowRateLpm = Math.max(15.0, (engineRpm / 7000) * maxPumpFlowLpm);

    // Thermostat opening curve (82°C to 95°C linear)
    let thermostatOpenPct = 0.0;
    if (currentState.coolantTempC > thermostatCrackingTempC) {
      thermostatOpenPct = Math.min(1.0, (currentState.coolantTempC - thermostatCrackingTempC) / 13.0);
    }

    // Engine Heat Addition to Coolant (~30% of fuel energy goes to coolant)
    const engineHeatToCoolantKw = enginePowerOutputKw * 0.38;

    // Radiator Heat Rejection (Convective cooling from vehicle airspeed)
    const airSpeedMs = Math.max(2.0, (vehicleSpeedKmh * 1000) / 3600);
    const radiatorAirMassFlowKgS = airSpeedMs * radiatorAreaM2 * 1.2; // approx kg/s
    const radiatorEffectiveness = 0.65;
    const maxRadiatorHeatKw =
      radiatorAirMassFlowKgS * 1.005 * radiatorEffectiveness * Math.max(0, currentState.coolantTempC - ambientTempC);

    const radiatorHeatRejectionKw = maxRadiatorHeatKw * thermostatOpenPct;

    // Coolant Temperature derivative: d(T)/dt = (Q_in - Q_out) / (m * c_p)
    // Assume 12 liters of coolant (12 kg water/glycol mix, c_p = 3.8 kJ/kg·K -> C_th = 45.6 kJ/K)
    const coolantThermalCapacitance = 45.6; // kJ/K
    const dCoolantTemp = ((engineHeatToCoolantKw - radiatorHeatRejectionKw) / coolantThermalCapacitance) * dtSeconds;
    const newCoolantTemp = Math.max(ambientTempC, Math.min(135, currentState.coolantTempC + dCoolantTemp));

    // 2. Engine Oil Loop Dynamics
    // Engine heat to oil (~12% of power)
    const engineHeatToOilKw = enginePowerOutputKw * 0.14;
    const oilCoolerHeatRejectionKw =
      oilCoolerAreaM2 * airSpeedMs * 0.85 * Math.max(0, currentState.engineOilTempC - ambientTempC);
    const oilThermalCapacitance = 16.0; // kJ/K
    const dOilTemp = ((engineHeatToOilKw - oilCoolerHeatRejectionKw) / oilThermalCapacitance) * dtSeconds;
    const newOilTemp = Math.max(ambientTempC, Math.min(160, currentState.engineOilTempC + dOilTemp));

    // 3. Intercooler Charge Air Cooling
    // Turbo boost increases intake air temp to ~140°C, intercooler rejects 75% back down towards ambient
    const compressorOutletTempC = 140.0;
    const intercoolerExitTempC = ambientTempC + (compressorOutletTempC - ambientTempC) * (1 - 0.78);

    // 4. Brake Rotor Radiant & Convective Dissipation
    // Front brakes absorb 65% of kinetic energy, Rear absorbs 35%
    const frontBrakeHeatKw = brakeBrakingPowerKw * 0.65;
    const rearBrakeHeatKw = brakeBrakingPowerKw * 0.35;

    // Convective + Radiant Cooling
    const frontBrakeCoolingKw =
      0.045 * (1 + airSpeedMs * 0.12) * Math.max(0, currentState.brakeRotorFrontTempC - ambientTempC);
    const rearBrakeCoolingKw =
      0.035 * (1 + airSpeedMs * 0.12) * Math.max(0, currentState.brakeRotorRearTempC - ambientTempC);

    const brakeCapacitance = 9.5; // kJ/K for cast/carbon rotors
    const dFrontBrake = ((frontBrakeHeatKw - frontBrakeCoolingKw) / brakeCapacitance) * dtSeconds;
    const dRearBrake = ((rearBrakeHeatKw - rearBrakeCoolingKw) / brakeCapacitance) * dtSeconds;

    const newFrontBrakeTemp = Math.max(ambientTempC, Math.min(1050, currentState.brakeRotorFrontTempC + dFrontBrake));
    const newRearBrakeTemp = Math.max(ambientTempC, Math.min(950, currentState.brakeRotorRearTempC + dRearBrake));

    const isOverheating = newCoolantTemp > 108.0 || newOilTemp > 135.0 || newFrontBrakeTemp > 850.0;

    return {
      coolantTempC: Math.round(newCoolantTemp * 10) / 10,
      engineOilTempC: Math.round(newOilTemp * 10) / 10,
      intercoolerExitTempC: Math.round(intercoolerExitTempC * 10) / 10,
      brakeRotorFrontTempC: Math.round(newFrontBrakeTemp * 10) / 10,
      brakeRotorRearTempC: Math.round(newRearBrakeTemp * 10) / 10,
      thermostatOpenPct: Math.round(thermostatOpenPct * 100) / 100,
      coolantFlowRateLpm: Math.round(coolantFlowRateLpm),
      radiatorHeatRejectionKw: Math.round(radiatorHeatRejectionKw * 10) / 10,
      oilCoolerHeatRejectionKw: Math.round(oilCoolerHeatRejectionKw * 10) / 10,
      isOverheating,
    };
  }
}
