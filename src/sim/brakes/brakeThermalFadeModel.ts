// ============================================================================
// PHASE 35 — MULTI-STOP BRAKE FADE & THERMAL PYROMETRY MODEL
// ============================================================================
// High-temperature rotor thermodynamics modeling Cast Iron vs Carbon-Ceramic
// fade boundaries, pad outgassing, fluid boiling, and thermal recovery.
// ============================================================================

export type BrakeDiscMaterial = 'CAST_IRON_G3000' | 'CARBON_CERAMIC_CSIC';

export interface BrakeStopTelemetry {
  stopNumber: number;
  initialSpeedKmh: number;
  rotorTempFrontC: number;
  rotorTempRearC: number;
  fluidTempC: number;
  currentFrictionCoeffMu: number;
  stoppingDistanceM: number;
  pedalTravelElongationPct: number;
  isFadingCritical: boolean;
  fluidBoilingWarning: boolean;
}

export interface BrakeTortureTestResult {
  material: BrakeDiscMaterial;
  totalStops: number;
  peakRotorTempC: number;
  initialStoppingDistanceM: number;
  finalStoppingDistanceM: number;
  frictionFadePercentage: number;
  stops: BrakeStopTelemetry[];
}

export class BrakeThermalFadeModel {
  /**
   * Simulates a multi-stop high-speed brake fade torture cycle (e.g. 10x 200-0 km/h).
   */
  public static simulateTortureCycle(
    material: BrakeDiscMaterial = 'CAST_IRON_G3000',
    totalStops: number = 8,
    vehicleMassKg: number = 1450
  ): BrakeTortureTestResult {
    let tFrontC = 45.0; // Ambient rotor starting temp
    let tRearC = 40.0;
    let tFluidC = 50.0;

    const stops: BrakeStopTelemetry[] = [];

    // Thermal parameters per disc metallurgy
    const props = material === 'CARBON_CERAMIC_CSIC'
      ? { baseMu: 0.52, maxTempC: 1150, heatCapacityJPerKgK: 1200, rotorMassKg: 6.8, fadeThresholdC: 750 }
      : { baseMu: 0.40, maxTempC: 800, heatCapacityJPerKgK: 480, rotorMassKg: 12.5, fadeThresholdC: 420 };

    for (let i = 1; i <= totalStops; i++) {
      // 1. Kinetic Energy Dissipated per stop: E = 0.5 * m * v^2 (200 km/h = 55.55 m/s)
      const vInitialMs = 55.55;
      const totalKineticEnergyJ = 0.5 * vehicleMassKg * vInitialMs * vInitialMs;

      // 68% front brake energy bias, 32% rear
      const energyFrontJ = (totalKineticEnergyJ * 0.68) / 2; // Per front rotor
      const energyRearJ = (totalKineticEnergyJ * 0.32) / 2;  // Per rear rotor

      // 2. Temperature Rise: DeltaT = Energy / (m * cp)
      const deltaTFront = energyFrontJ / (props.rotorMassKg * props.heatCapacityJPerKgK);
      const deltaTRear = energyRearJ / (props.rotorMassKg * 0.75 * props.heatCapacityJPerKgK);

      tFrontC += deltaTFront * 0.78; // 22% heat dissipated during the stop itself
      tRearC += deltaTRear * 0.78;
      tFluidC += deltaTFront * 0.08; // Conduction to caliper fluid

      // 3. Dynamic Friction Coefficient Degradation (Fade Curve)
      let mu = props.baseMu;
      if (tFrontC > props.fadeThresholdC) {
        const overTemp = tFrontC - props.fadeThresholdC;
        if (material === 'CAST_IRON_G3000') {
          // Cast iron fades rapidly above 520 deg C due to resin binder outgassing
          mu = Math.max(0.14, props.baseMu - (overTemp / 300) * 0.22);
        } else {
          // Carbon ceramic remains extremely stable up to 850 deg C
          mu = Math.max(0.36, props.baseMu - (overTemp / 450) * 0.12);
        }
      }

      // 4. Stopping Distance Calculation: d = v^2 / (2 * mu * g)
      const avgDecelG = (mu / props.baseMu) * 1.15;
      const stoppingDistanceM = Math.pow(vInitialMs, 2) / (2 * avgDecelG * 9.81);

      // 5. Brake Fluid Boiling (DOT 4 boils at 230 deg C dry, 155 deg C wet)
      const fluidBoiling = tFluidC > 210;
      const pedalElongationPct = fluidBoiling ? Math.min(85, (tFluidC - 210) * 2.5) : (tFrontC > props.fadeThresholdC ? 15 : 0);

      stops.push({
        stopNumber: i,
        initialSpeedKmh: 200,
        rotorTempFrontC: Math.round(tFrontC),
        rotorTempRearC: Math.round(tRearC),
        fluidTempC: Math.round(tFluidC),
        currentFrictionCoeffMu: Math.round(mu * 100) / 100,
        stoppingDistanceM: Math.round(stoppingDistanceM * 10) / 10,
        pedalTravelElongationPct: Math.round(pedalElongationPct),
        isFadingCritical: mu < props.baseMu * 0.65,
        fluidBoilingWarning: fluidBoiling,
      });

      // 6. Convective Cooling during 45-second recovery straightaway (T_new = T_amb + (T - T_amb)*e^(-k*t))
      const coolingFactor = material === 'CARBON_CERAMIC_CSIC' ? 0.72 : 0.82;
      tFrontC = 45.0 + (tFrontC - 45.0) * coolingFactor;
      tRearC = 40.0 + (tRearC - 40.0) * coolingFactor;
      tFluidC = 50.0 + (tFluidC - 50.0) * 0.94;
    }

    const peakTemp = Math.max(...stops.map((s) => s.rotorTempFrontC));
    const initDist = stops[0].stoppingDistanceM;
    const finalDist = stops[stops.length - 1].stoppingDistanceM;
    const fadePct = ((finalDist - initDist) / initDist) * 100;

    return {
      material,
      totalStops,
      peakRotorTempC: peakTemp,
      initialStoppingDistanceM: initDist,
      finalStoppingDistanceM: finalDist,
      frictionFadePercentage: Math.round(fadePct * 10) / 10,
      stops,
    };
  }
}
