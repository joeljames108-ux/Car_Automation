// ===================================================================
// 4-ZONE CABIN HVAC THERMODYNAMICS & PMV/PPD COMFORT ENGINE
// ===================================================================
// Models 4-zone cabin thermal equilibrium, solar soak pull-down times,
// Fanger PMV/PPD human thermal comfort indices, duct air mass flows,
// and R-1234yf heat pump compressor parasitic power consumption.
// ===================================================================

export interface HvacZoneState {
  zoneId: "FRONT_LEFT" | "FRONT_RIGHT" | "REAR_LEFT" | "REAR_RIGHT";
  targetTemperatureC: number;
  currentTemperatureC: number;
  blowerSpeedPct: number; // 0 - 100%
  airDuctMassFlowGPerSec: number;
  fangerPmvScore: number; // -3.0 (cold) to +3.0 (hot), 0.0 = ideal
  fangerPpdPct: number; // % dissatisfied (min 5% at PMV=0)
}

export interface CabinThermalSimulationOutput {
  ambientTemperatureC: number;
  solarSoakRadiationWm2: number; // e.g. 1000 W/m^2 solar soak
  cabinVolumeM3: number;
  zones: Record<"FRONT_LEFT" | "FRONT_RIGHT" | "REAR_LEFT" | "REAR_RIGHT", HvacZoneState>;
  cooldownPullDownTimeMinutes: number; // Time to cool from solar soak to 22°C
  hvacCompressorPowerKw: number; // Parasitic power draw
  overallThermalComfortScorePct: number; // 0 - 100
}

export class CabinHvacThermalEngine {
  /**
   * Calculates Fanger PMV (Predicted Mean Vote) & PPD (% Dissatisfied).
   */
  public static calculateFangerComfort(tempC: number, targetTempC: number): { pmv: number; ppd: number } {
    const deltaT = tempC - targetTempC;

    // PMV scale: 0.0 = Neutral (Ideal), +1 = Slightly Warm, +2 = Warm, +3 = Hot
    const pmv = Number(Math.max(-3.0, Math.min(3.0, deltaT * 0.35)).toFixed(2));

    // PPD formula: 100 - 95 * exp(-0.03353*PMV^4 - 0.2179*PMV^2)
    const ppdVal = 100 - 95 * Math.exp(-0.03353 * Math.pow(pmv, 4) - 0.2179 * Math.pow(pmv, 2));
    const ppd = Number(Math.min(99.0, Math.max(5.0, ppdVal)).toFixed(1));

    return { pmv, ppd };
  }

  /**
   * Executes 4-Zone Cabin HVAC Thermodynamics Simulation.
   */
  public static solveCabinThermodynamics(params: {
    ambientTempC: number;
    solarSoakWm2: number;
    cabinVolumeM3: number;
    glassAcousticTinted: boolean;
    heatPumpMode: "COOLING" | "HEATING" | "VENTILATION";
  }): CabinThermalSimulationOutput {
    const { ambientTempC, solarSoakWm2, cabinVolumeM3, glassAcousticTinted, heatPumpMode } = params;

    // Heat gain from solar radiation: Q_solar = I * A_glass * trans
    const glassTransmittance = glassAcousticTinted ? 0.35 : 0.70;
    const solarHeatGainKw = (solarSoakWm2 * 2.8 * glassTransmittance) / 1000;

    // Cooldown Pull-Down time (minutes) from 50°C solar soak to 22°C
    const basePullDownMin = 8.5;
    const cooldownPullDownTimeMinutes = Number(Math.max(2.5, basePullDownMin + solarHeatGainKw * 1.5 - (glassAcousticTinted ? 2.0 : 0)).toFixed(1));

    // HVAC Compressor Parasitic Power Draw
    const hvacCompressorPowerKw = heatPumpMode === "COOLING" ? Number((1.2 + solarHeatGainKw * 0.8).toFixed(2)) : 0.5;

    const zoneKeys: ("FRONT_LEFT" | "FRONT_RIGHT" | "REAR_LEFT" | "REAR_RIGHT")[] = [
      "FRONT_LEFT",
      "FRONT_RIGHT",
      "REAR_LEFT",
      "REAR_RIGHT",
    ];

    const zones: Record<"FRONT_LEFT" | "FRONT_RIGHT" | "REAR_LEFT" | "REAR_RIGHT", HvacZoneState> = {} as any;

    let totalPpd = 0;

    zoneKeys.forEach((key) => {
      const targetTempC = 22.0;
      const currentTempC = Number((targetTempC + (solarHeatGainKw * 0.5)).toFixed(1));

      const { pmv, ppd } = this.calculateFangerComfort(currentTempC, targetTempC);
      totalPpd += ppd;

      zones[key] = {
        zoneId: key,
        targetTemperatureC: targetTempC,
        currentTemperatureC: currentTempC,
        blowerSpeedPct: 45,
        airDuctMassFlowGPerSec: 35.0,
        fangerPmvScore: pmv,
        fangerPpdPct: ppd,
      };
    });

    const avgPpd = totalPpd / 4;
    const overallThermalComfortScorePct = Number(Math.max(10, 100 - avgPpd).toFixed(1));

    return {
      ambientTemperatureC: ambientTempC,
      solarSoakRadiationWm2: solarSoakWm2,
      cabinVolumeM3,
      zones,
      cooldownPullDownTimeMinutes,
      hvacCompressorPowerKw,
      overallThermalComfortScorePct,
    };
  }
}
