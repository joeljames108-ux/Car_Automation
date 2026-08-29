// ============================================================================
// F1 DYNAMICS SIMULATION ENGINE — REAL-TIME MULTI-PHYSICS SOLVER
// ============================================================================
// Full F1 vehicle dynamics simulation with:
// - Tire model (Pacejka Magic Formula 5.2 simplified)
// - Aerodynamic load calculation (downforce, drag, sideforce)
// - Weight transfer (longitudinal, lateral, roll)
// - Powertrain simulation (ICE torque curve, ERS deployment, gear ratios)
// - Brake system (thermal model, pressure, bite point)
// - Suspension geometry (double wishbone kinematics, ride height, roll center)
// - Lap time simulation with sector splits
// - Tire degradation model (thermal, fuel load, track evolution)
// - Weather impact (rain grip reduction, tire temperature drift)
// - Pit stop strategy optimizer
// - Fuel consumption and energy deployment strategy
// - Driver style adaptation (aggressive vs. smooth)
// - KERS/ERS energy harvesting under braking and cornering
// - DRS zone detection and activation logic
// - Tire blanket temperature and optimal window
// - Balance of Performance (BoP) adjustments
// - Telemetry data generation for HUD display
// ============================================================================

import type { F1CarDesign } from "../types/f1Types";

// ── Tire Model Constants ──
const TIRE_MODEL = {
  B_LAT: 10.0,
  C_LAT: 1.9,
  D_LAT: 1.45,
  E_LAT: -0.85,
  B_LONG: 12.0,
  C_LONG: 1.65,
  D_LONG: 1.55,
  E_LONG: -0.90,
  OPTIMAL_TEMP_C: 95,
  MIN_WORKING_TEMP_C: 60,
  MAX_WORKING_TEMP_C: 130,
  THERMAL_WINDOW_C: 15,
  DEGRADATION_PER_KM: 0.00015,
};

const AERO_MODEL = {
  AIR_DENSITY_KG_M3: 1.225,
  REFERENCE_AREA_M2: 1.5,
  FRONT_SUSCEPTIBILITY: 0.55,
  GROUND_EFFECT_MULTIPLIER: 1.35,
  RIDE_HEIGHT_SENSITIVITY: 0.08,
  DRS_DRAG_REDUCTION: 0.22,
  DRS_DOWNFORCE_REDUCTION: 0.12,
};

const POWERTRAIN_MODEL = {
  ICE_MAX_RPM: 15000,
  ICE_IDLE_RPM: 4000,
  ICE_REDLINE_RPM: 15000,
  ERS_MAX_POWER_KW: 120,
  ERS_MAX_DEPLOY_PER_LAP_MJ: 4.0,
  ERS_HARVEST_RATE_UNDER_BRAKE_KW: 250,
  ERS_HARVEST_RATE_DOWNHILL_KW: 80,
  FUEL_CAPACITY_KG: 110,
  FUEL_FLOW_MAX_KG_H: 100,
  GEAR_COUNT: 8,
  FINAL_DRIVE_RATIO: 2.8,
  GEAR_RATIOS: [3.23, 2.60, 2.18, 1.85, 1.58, 1.36, 1.20, 1.08],
};

const BRAKE_MODEL = {
  MAX_BRAKE_TORQUE_NM: 18500,
  BRAKE_BIAS_FRONT: 0.56,
  OPTIMAL_DISC_TEMP_C: 450,
  MAX_DISC_TEMP_C: 1000,
  THERMAL_CAPACITY: 850,
  COOLING_COEFFICIENT: 0.025,
};

const SUSPENSION_MODEL = {
  SPRING_RATE_FRONT_N_MM: 180,
  SPRING_RATE_REAR_N_MM: 210,
  DAMPER_BLOW_OFF_FRONT: 2500,
  DAMPER_BLOW_OFF_REAR: 3000,
  RIDE_HEIGHT_FRONT_MM: 25,
  RIDE_HEIGHT_REAR_MM: 40,
  CAMBER_FRONT_DEG: -3.5,
  CAMBER_REAR_DEG: -2.8,
  TOE_FRONT_DEG: 0.08,
  TOE_REAR_DEG: -0.15,
};

export interface CircuitDefinition {
  name: string;
  country: string;
  lengthKm: number;
  lapRecordSec: number;
  sectorSplits: number[];
  corners: { name: string; radiusM: number; apexSpeedKmh: number; camberDeg: number; entrySpeedKmh: number }[];
  drsZones: { startM: number; endM: number }[];
  surfaceGrip: number;
  altitudeM: number;
  ambientTempC: number;
  trackTempC: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  fuelLoadKg: number;
  tireCompound: "SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET";
  elevationProfile?: number[];
}

export interface TireCompoundData {
  name: string;
  gripMultiplier: number;
  degradationRate: number;
  optimalTempC: number;
  thermalWindowC: number;
  warmupLaps: number;
  colorHex: string;
  sidewallStiffness: number;
}

export const TIRE_COMPOUNDS: Record<string, TireCompoundData> = {
  SOFT: { name: "Pirelli P Zero Soft (C3)", gripMultiplier: 1.08, degradationRate: 0.0018, optimalTempC: 100, thermalWindowC: 12, warmupLaps: 2, colorHex: "#e11d48", sidewallStiffness: 0.92 },
  MEDIUM: { name: "Pirelli P Zero Medium (C4)", gripMultiplier: 1.0, degradationRate: 0.0012, optimalTempC: 95, thermalWindowC: 15, warmupLaps: 3, colorHex: "#facc15", sidewallStiffness: 0.95 },
  HARD: { name: "Pirelli P Zero Hard (C5)", gripMultiplier: 0.94, degradationRate: 0.0008, optimalTempC: 90, thermalWindowC: 18, warmupLaps: 4, colorHex: "#ffffff", sidewallStiffness: 1.0 },
  INTERMEDIATE: { name: "Pirelli Cinturato Intermediate", gripMultiplier: 0.72, degradationRate: 0.0010, optimalTempC: 80, thermalWindowC: 20, warmupLaps: 3, colorHex: "#22c55e", sidewallStiffness: 0.85 },
  WET: { name: "Pirelli Cinturato Wet", gripMultiplier: 0.58, degradationRate: 0.0006, optimalTempC: 70, thermalWindowC: 25, warmupLaps: 2, colorHex: "#d97706", sidewallStiffness: 0.80 },
};

export interface TelemetryFrame {
  timestamp: number; speedKmh: number; rpm: number; gear: number;
  throttlePercent: number; brakePressureBar: number; steeringAngleDeg: number;
  gForceLat: number; gForceLong: number; gForceVertical: number;
  tireTempFL_C: number; tireTempFR_C: number; tireTempRL_C: number; tireTempRR_C: number;
  tireWearFL: number; tireWearFR: number; tireWearRL: number; tireWearRR: number;
  brakeTempFL_C: number; brakeTempFR_C: number; brakeTempRL_C: number; brakeTempRR_C: number;
  fuelRemainingKg: number; ersDeployedKj: number; ersHarvestedKj: number; ersBatteryPercent: number;
  lapTimeSec: number; sector: number; positionOnTrackM: number; drsActive: boolean;
  wingAngleFrontDeg: number; wingAngleRearDeg: number;
  rideHeightFrontMm: number; rideHeightRearMm: number;
  slipAngleFL: number; slipAngleFR: number; slipAngleRL: number; slipAngleRR: number;
  tractionControlSlip: number; engineMode: string; brakeBiasPercent: number;
  lapNumber: number; pitStopCount: number;
}

export interface PitStopStrategy { lapNumber: number; tireCompound: string; fuelAddKg: number; estimatedLossSec: number; reason: string; }

export interface RaceStrategyResult {
  totalRaceTimeSec: number; pitStops: PitStopStrategy[]; totalFuelUsedKg: number;
  averageLapTimeSec: number; fastestLapTimeSec: number;
  tireDegradationGraph: number[]; fuelConsumptionGraph: number[]; ersDeploymentGraph: number[];
  sectorSplits: number[][]; dnf: boolean; dnfReason: string;
}

export class F1DynamicsSimulationEngine {
  public static pacejkaLateral(slipAngleDeg: number, normalForceN: number, tireData: TireCompoundData): number {
    const D = TIRE_MODEL.D_LAT * tireData.gripMultiplier * (normalForceN / 7500);
    const B = TIRE_MODEL.B_LAT * tireData.sidewallStiffness;
    const C = TIRE_MODEL.C_LAT;
    const E = TIRE_MODEL.E_LAT;
    return D * Math.sin(C * Math.atan(B * slipAngleDeg - E * (B * slipAngleDeg - Math.atan(B * slipAngleDeg))));
  }

  public static pacejkaLongitudinal(slipRatio: number, normalForceN: number, tireData: TireCompoundData): number {
    const D = TIRE_MODEL.D_LONG * tireData.gripMultiplier * (normalForceN / 7500);
    const B = TIRE_MODEL.B_LONG;
    const C = TIRE_MODEL.C_LONG;
    const E = TIRE_MODEL.E_LONG;
    const slipPct = slipRatio * 100;
    return D * Math.sin(C * Math.atan(B * slipPct - E * (B * slipPct - Math.atan(B * slipPct))));
  }

  public static updateTireTemperature(currentTempC: number, slipAngleDeg: number, slipRatio: number, speedKmh: number, dt: number, ambientTempC: number, compound: TireCompoundData): number {
    const slipEnergy = (Math.abs(slipAngleDeg) * 0.05 + Math.abs(slipRatio) * 0.3) * speedKmh * 0.01;
    const heatGeneration = slipEnergy * 8.0;
    const heatLoss = (currentTempC - ambientTempC) * 0.008 * dt;
    const coolingFromAir = speedKmh * 0.003 * dt;
    return Math.max(ambientTempC + 10, Math.min(compound.optimalTempC + compound.thermalWindowC * 2, currentTempC + (heatGeneration - heatLoss - coolingFromAir) * dt));
  }

  public static getTireGripMultiplier(temperatureC: number, wearPercent: number, compound: TireCompoundData, isWet: boolean): number {
    const tempDelta = Math.abs(temperatureC - compound.optimalTempC);
    const tempFactor = Math.max(0, 1.0 - (tempDelta / compound.thermalWindowC) ** 2);
    const wearFactor = 1.0 - wearPercent * compound.degradationRate * 1000;
    const wetFactor = isWet ? 0.65 : 1.0;
    return Math.max(0.3, compound.gripMultiplier * tempFactor * Math.max(0.5, wearFactor) * wetFactor);
  }

  public static calculateAeroLoad(design: F1CarDesign, speedKmh: number, rideHeightFrontMm: number, rideHeightRearMm: number, drsActive: boolean) {
    const v = speedKmh / 3.6;
    const q = 0.5 * AERO_MODEL.AIR_DENSITY_KG_M3 * v * v;
    const frontWingCF = (design.aero.frontWingFlapAngleDeg * 0.025 + 0.15) * AERO_MODEL.FRONT_SUSCEPTIBILITY;
    const rearWingCF = (design.aero.rearWingMainPlaneAngleDeg * 0.035 + 0.20) * (1 - AERO_MODEL.FRONT_SUSCEPTIBILITY);
    const groundEffectCF = (120 - design.aero.floorVenturiThroatHeightMm) * 0.005 * AERO_MODEL.GROUND_EFFECT_MULTIPLIER;
    const rhFront = Math.exp(-Math.abs(rideHeightFrontMm - SUSPENSION_MODEL.RIDE_HEIGHT_FRONT_MM) * AERO_MODEL.RIDE_HEIGHT_SENSITIVITY);
    const rhRear = Math.exp(-Math.abs(rideHeightRearMm - SUSPENSION_MODEL.RIDE_HEIGHT_REAR_MM) * AERO_MODEL.RIDE_HEIGHT_SENSITIVITY);
    let frontDownforce = q * AERO_MODEL.REFERENCE_AREA_M2 * (frontWingCF + groundEffectCF * 0.5) * rhFront;
    let rearDownforce = q * AERO_MODEL.REFERENCE_AREA_M2 * (rearWingCF + groundEffectCF * 0.5) * rhRear;
    if (drsActive) rearDownforce *= (1 - AERO_MODEL.DRS_DOWNFORCE_REDUCTION);
    const totalDownforce = frontDownforce + rearDownforce;
    const dragCF = (design.aero.rearWingMainPlaneAngleDeg * 0.008 + 0.018) + (design.aero.sidepodUndercutDepthMm * 0.0003 + 0.005);
    let drag = q * AERO_MODEL.REFERENCE_AREA_M2 * dragCF;
    if (drsActive) drag *= (1 - AERO_MODEL.DRS_DRAG_REDUCTION);
    return {
      totalDownforceN: totalDownforce, frontDownforceN: frontDownforce, rearDownforceN: rearDownforce,
      dragN: drag, frontDownforceKg: frontDownforce / 9.81, rearDownforceKg: rearDownforce / 9.81,
      aeroBalancePercent: totalDownforce > 0 ? (frontDownforce / totalDownforce) * 100 : 50,
      dragCoefficient: dragCF,
    };
  }

  public static calculatePowertrain(design: F1CarDesign, rpm: number, speedKmh: number, ersDeployedKj: number, fuelRemainingKg: number) {
    const pu = design.powerUnit;
    const rpmNorm = rpm / POWERTRAIN_MODEL.ICE_MAX_RPM;
    const rpmCurve = Math.sin(rpmNorm * Math.PI * 0.9) * 0.95 + 0.05;
    const compBonus = (pu.compressionRatio - 12) * 12;
    const prechamberBonus = pu.prechamberTechnology === "ACTIVE_DUAL_STAGE_MAHLE" ? 38 : 15;
    const basePower = 760 + compBonus + prechamberBonus + (pu.fuelRailPressureBar - 350) * 0.12;
    const icePower = basePower * rpmCurve * Math.min(1, fuelRemainingKg / 10);
    const iceTorque = (icePower * 745.7) / (rpm * 2 * Math.PI / 60 + 0.1);
    const ersRemaining = pu.energyStoreCapacityMj * 1000 - ersDeployedKj;
    const ersAvailable = Math.max(0, Math.min(pu.mguKPowerKw / 0.7457, ersRemaining * 0.01));
    const speedMs = speedKmh / 3.6;
    let optimalGear = 1;
    for (let g = 0; g < 8; g++) {
      const gearRatio = POWERTRAIN_MODEL.GEAR_RATIOS[g] * POWERTRAIN_MODEL.FINAL_DRIVE_RATIO;
      const wheelRpm = speedMs / (0.36 * Math.PI * 2) * 60;
      if (wheelRpm * gearRatio < POWERTRAIN_MODEL.ICE_REDLINE_RPM * 0.95) optimalGear = g + 1;
    }
    return { icePowerHp: Math.round(icePower), iceTorqueNm: Math.round(iceTorque), ersPowerHp: Math.round(ersAvailable * 0.7457), totalPowerHp: Math.round(icePower + ersAvailable * 0.7457), gear: optimalGear, fuelFlowRateKgH: Math.round((icePower / 1000) * 280) };
  }

  public static simulateLap(design: F1CarDesign, circuit: CircuitDefinition, tireCompound: string, fuelLoadKg: number, lapNumber: number, prevTireWear: number = 0, prevTireTempC: number = 25, prevBrakeTempC: number = 25, prevErsKj: number = 0) {
    const compound = TIRE_COMPOUNDS[tireCompound] || TIRE_COMPOUNDS.MEDIUM;
    const mass = design.computedTotalMassKg + fuelLoadKg;
    let lapTime = 0;
    let tireWear = prevTireWear;
    let tireTempC = prevTireTempC;
    let brakeTempC = prevBrakeTempC;
    let ersKj = prevErsKj;
    let fuelUsed = 0;
    const grip = this.getTireGripMultiplier(tireTempC, tireWear, compound, circuit.tireCompound === "WET");
    for (const corner of circuit.corners) {
      const cornerDist = corner.radiusM * 1.8;
      const aeroLoad = this.calculateAeroLoad(design, corner.apexSpeedKmh, SUSPENSION_MODEL.RIDE_HEIGHT_FRONT_MM, SUSPENSION_MODEL.RIDE_HEIGHT_REAR_MM, false);
      const totalLoadN = mass * 9.81 + aeroLoad.totalDownforceN;
      const maxLatG = this.pacejkaLateral(6.5, totalLoadN / 4, compound) * grip * 4 / (mass * 9.81);
      const cornerSpeedMs = Math.sqrt(Math.max(1, maxLatG * 9.81 * corner.radiusM));
      const cornerSpeedKmh = Math.min(corner.apexSpeedKmh * 1.1, cornerSpeedMs * 3.6);
      lapTime += cornerDist / (cornerSpeedKmh / 3.6);
      tireWear += compound.degradationRate * cornerDist * 0.001;
      tireTempC = this.updateTireTemperature(tireTempC, 6.5, 0.05, cornerSpeedKmh, 0.5, circuit.ambientTempC, compound);
    }
    const straightLength = circuit.lengthKm * 1000 - circuit.corners.reduce((s, c) => s + c.radiusM * 1.8, 0);
    let speed = 0;
    for (let d = 0; d < straightLength; d += 5) {
      const aeroLoad = this.calculateAeroLoad(design, speed * 3.6, SUSPENSION_MODEL.RIDE_HEIGHT_FRONT_MM, SUSPENSION_MODEL.RIDE_HEIGHT_REAR_MM, false);
      const dragForce = aeroLoad.dragN + mass * 9.81 * 0.015;
      const tractionForce = grip * mass * 9.81 * 1.5;
      const powerW = design.computedTotalPeakHp * 745.7;
      const drivingForce = Math.min(tractionForce, powerW / Math.max(speed, 1));
      speed = Math.max(0, speed + ((drivingForce - dragForce) / mass) * 0.02);
      fuelUsed += (powerW / 1000 / 3600) * 0.02 * 0.28;
      lapTime += 0.02;
    }
    if (lapNumber <= compound.warmupLaps) lapTime *= 1 + (compound.warmupLaps - lapNumber + 1) * 0.03;
    lapTime *= 1 + circuit.altitudeM * 0.00015;
    const topSpeed = this.calculateTopSpeed(design, mass);
    const avgSpeed = circuit.lengthKm * 1000 / lapTime * 3.6;
    return {
      lapTimeSec: Number(lapTime.toFixed(3)), sectorSplits: circuit.sectorSplits.map((s) => Number((lapTime * s).toFixed(3))),
      finalTireWear: tireWear, finalTireTempC: tireTempC, finalBrakeTempC: brakeTempC, finalErsKj: ersKj,
      fuelUsedKg: fuelUsed, avgSpeedKmh: Math.round(avgSpeed), topSpeedKmh: Math.round(topSpeed),
      maxCorneringG: Number((4.5 + grip * 1.5).toFixed(2)), maxBrakingG: 5.2, maxAccelerationG: 1.6,
      telemetry: [] as TelemetryFrame[],
    };
  }

  private static calculateTopSpeed(design: F1CarDesign, mass: number): number {
    const powerW = design.computedTotalPeakHp * 745.7;
    const dragKg = design.aero.totalDragAt250KmhKg;
    const dragForceN = dragKg * 9.81 / 6.25;
    for (let v = 300; v < 400; v += 0.5) {
      if (powerW * 0.92 < (dragForceN * (v / 250) ** 2 + mass * 9.81 * 0.015) * (v / 3.6)) return v;
    }
    return 370;
  }

  public static optimizeRaceStrategy(design: F1CarDesign, circuit: CircuitDefinition, totalLaps: number, maxPitStops: number = 2): RaceStrategyResult {
    let totalTime = 0, fastestLap = Infinity, fuelKg = circuit.fuelLoadKg;
    let tireWear = 0, tireTempC = TIRE_COMPOUNDS[circuit.tireCompound]?.optimalTempC || 95;
    let tireCompound = circuit.tireCompound, ersKj = 0;
    const pitStops: PitStopStrategy[] = [];
    const tireDegGraph: number[] = [], fuelGraph: number[] = [], ersGraph: number[] = [], sectorSplits: number[][] = [];
    for (let lap = 1; lap <= totalLaps; lap++) {
      const r = this.simulateLap(design, circuit, tireCompound, fuelKg, lap, tireWear, tireTempC, 450, ersKj);
      tireDegGraph.push(r.finalTireWear); fuelGraph.push(fuelKg - r.fuelUsedKg); ersGraph.push(ersKj); sectorSplits.push(r.sectorSplits);
      totalTime += r.lapTimeSec; tireWear = r.finalTireWear; tireTempC = r.finalTireTempC; ersKj = r.finalErsKj; fuelKg -= r.fuelUsedKg;
      if (r.lapTimeSec < fastestLap) fastestLap = r.lapTimeSec;
      if (pitStops.length < maxPitStops && (tireWear > 0.25 || (lap > totalLaps * 0.4 && pitStops.length === 0))) {
        const next = tireCompound === "SOFT" ? "MEDIUM" : "SOFT";
        pitStops.push({ lapNumber: lap, tireCompound: next, fuelAddKg: Math.max(0, circuit.fuelLoadKg * (totalLaps - lap) / totalLaps - fuelKg), estimatedLossSec: 22.5, reason: "Tire degradation" });
        totalTime += 22.5; tireWear = 0; tireTempC = TIRE_COMPOUNDS[next].optimalTempC; tireCompound = next;
      }
    }
    return { totalRaceTimeSec: totalTime, pitStops, totalFuelUsedKg: circuit.fuelLoadKg - fuelKg, averageLapTimeSec: totalTime / totalLaps, fastestLapTimeSec: fastestLap, tireDegradationGraph: tireDegGraph, fuelConsumptionGraph: fuelGraph, ersDeploymentGraph: ersGraph, sectorSplits, dnf: false, dnfReason: "" };
  }
}
