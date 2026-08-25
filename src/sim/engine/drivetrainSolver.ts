/**
 * ============================================================================
 * DRIVETRAIN SOLVER — COUPLED WHEEL TORQUE & ACCELERATION PHYSICS
 * ============================================================================
 * Computes per-gear wheel torque curves, optimal shift points, acceleration
 * profiles, and parasitic loss breakdowns from engine dyno output + drivetrain
 * parameters. This is the physics bridge between the Engine Studio and
 * Transmission Studio in the Unified Powertrain Flow Chain.
 * ============================================================================
 */

import {
  DynoDataPoint,
  DrivetrainSubsystemState,
  GearRatioSet,
  WheelTorqueDataPoint,
  MasterDrivetrainPerformanceMetrics,
  MasterEnginePerformanceMetrics,
} from "./masterEngineTypes";

// Default tire radius for a 305/30R20 hypercar tire (approx 0.33m)
const DEFAULT_TIRE_RADIUS_M = 0.33;
// Default vehicle mass for acceleration estimates (kg)
const DEFAULT_VEHICLE_MASS_KG = 1550;
// Drag coefficient * frontal area for rough aero estimate (m²)
const DEFAULT_CDA = 0.68;
// Air density (kg/m³)
const AIR_DENSITY = 1.225;
// Rolling resistance coefficient
const ROLLING_RESISTANCE = 0.012;
// Gravity (m/s²)
const G = 9.81;

export class DrivetrainSolver {
  /**
   * Compute wheel torque curve for a single gear.
   */
  static solveWheelTorqueCurve(
    dynoCurve: DynoDataPoint[],
    gearRatio: number,
    finalDrive: number,
    efficiencyPercent: number,
  ): WheelTorqueDataPoint[] {
    const eff = efficiencyPercent / 100;
    const totalRatio = gearRatio * finalDrive;
    return dynoCurve.map((pt) => {
      const wheelTorqueNm = pt.torqueNm * totalRatio * eff;
      const wheelRpm = pt.rpm / totalRatio;
      // WHP = (Wheel Torque × Wheel RPM) / 7121
      const wheelHorsepowerHp = (wheelTorqueNm * wheelRpm) / 7121;
      return {
        rpm: pt.rpm,
        wheelTorqueNm: Math.round(wheelTorqueNm * 10) / 10,
        wheelHorsepowerHp: Math.round(wheelHorsepowerHp * 10) / 10,
      };
    });
  }

  /**
   * Compute wheel torque curves for all active gears.
   */
  static solveAllGearCurves(
    dynoCurve: DynoDataPoint[],
    drivetrain: DrivetrainSubsystemState,
  ): Record<number, WheelTorqueDataPoint[]> {
    const result: Record<number, WheelTorqueDataPoint[]> = {};
    const gearKeys: (keyof GearRatioSet)[] = [
      "gear1", "gear2", "gear3", "gear4",
      "gear5", "gear6", "gear7", "gear8",
    ];
    for (let i = 0; i < drivetrain.activeGearCount; i++) {
      const ratio = drivetrain.gearRatios[gearKeys[i]];
      result[i + 1] = DrivetrainSolver.solveWheelTorqueCurve(
        dynoCurve,
        ratio,
        drivetrain.gearRatios.finalDrive,
        drivetrain.mechanicalEfficiencyPercent,
      );
    }
    return result;
  }

  /**
   * Compute optimal shift points (RPM at which to upshift for max acceleration).
   * Strategy: For each gear transition g→g+1, find the RPM where the tractive
   * force in gear g+1 (after drop) exceeds continuing in gear g.
   */
  static solveShiftPoints(
    dynoCurve: DynoDataPoint[],
    drivetrain: DrivetrainSubsystemState,
  ): number[] {
    const gearKeys: (keyof GearRatioSet)[] = [
      "gear1", "gear2", "gear3", "gear4",
      "gear5", "gear6", "gear7", "gear8",
    ];
    const shiftPoints: number[] = [];
    const fd = drivetrain.gearRatios.finalDrive;

    for (let g = 0; g < drivetrain.activeGearCount - 1; g++) {
      const currentRatio = drivetrain.gearRatios[gearKeys[g]];
      const nextRatio = drivetrain.gearRatios[gearKeys[g + 1]];
      const rpmDropFactor = nextRatio / currentRatio;

      let bestShiftRpm = dynoCurve[dynoCurve.length - 1]?.rpm ?? 8000;

      // Walk from low to high RPM; find the crossover
      for (let i = 0; i < dynoCurve.length; i++) {
        const pt = dynoCurve[i];
        const torqueCurrentGear = pt.torqueNm * currentRatio * fd;
        // After upshift, engine RPM drops by rpmDropFactor
        const droppedRpm = pt.rpm * rpmDropFactor;
        // Find torque at droppedRpm in the dyno curve (interpolated)
        const torqueAtDropped = DrivetrainSolver.interpolateTorque(dynoCurve, droppedRpm);
        const torqueNextGear = torqueAtDropped * nextRatio * fd;

        if (torqueNextGear >= torqueCurrentGear && pt.rpm > 3000) {
          bestShiftRpm = pt.rpm;
          break;
        }
      }

      // Fallback: if no crossover found, shift at redline - 200 RPM
      if (bestShiftRpm === (dynoCurve[dynoCurve.length - 1]?.rpm ?? 8000)) {
        bestShiftRpm = Math.max(bestShiftRpm - 200, 4000);
      }

      shiftPoints.push(Math.round(bestShiftRpm));
    }

    return shiftPoints;
  }

  /**
   * Linearly interpolate torque at a given RPM from the dyno curve.
   */
  static interpolateTorque(dynoCurve: DynoDataPoint[], targetRpm: number): number {
    if (dynoCurve.length === 0) return 0;
    if (targetRpm <= dynoCurve[0].rpm) return dynoCurve[0].torqueNm;
    if (targetRpm >= dynoCurve[dynoCurve.length - 1].rpm) {
      return dynoCurve[dynoCurve.length - 1].torqueNm;
    }
    for (let i = 0; i < dynoCurve.length - 1; i++) {
      if (dynoCurve[i].rpm <= targetRpm && dynoCurve[i + 1].rpm >= targetRpm) {
        const t = (targetRpm - dynoCurve[i].rpm) / (dynoCurve[i + 1].rpm - dynoCurve[i].rpm);
        return dynoCurve[i].torqueNm + t * (dynoCurve[i + 1].torqueNm - dynoCurve[i].torqueNm);
      }
    }
    return dynoCurve[dynoCurve.length - 1].torqueNm;
  }

  /**
   * Estimate acceleration profile (0-60, 0-100, quarter mile).
   * Uses a simplified step integration over speed increments with
   * aerodynamic drag, rolling resistance, and drivetrain losses.
   */
  static solveAccelerationProfile(
    dynoCurve: DynoDataPoint[],
    drivetrain: DrivetrainSubsystemState,
    vehicleMassKg: number = DEFAULT_VEHICLE_MASS_KG,
    tireRadiusM: number = DEFAULT_TIRE_RADIUS_M,
  ): {
    zeroTo60Sec: number;
    zeroTo100Sec: number;
    quarterMileSec: number;
    quarterMileSpeedMph: number;
  } {
    const gearKeys: (keyof GearRatioSet)[] = [
      "gear1", "gear2", "gear3", "gear4",
      "gear5", "gear6", "gear7", "gear8",
    ];
    const fd = drivetrain.gearRatios.finalDrive;
    const eff = drivetrain.mechanicalEfficiencyPercent / 100;
    const shiftPoints = DrivetrainSolver.solveShiftPoints(dynoCurve, drivetrain);

    let currentGear = 0; // 0-indexed
    let speedMps = 0.5; // start at 0.5 m/s to avoid div-by-zero
    let time = 0;
    let distance = 0;
    const dt = 0.002; // 2ms time steps for precision

    let t60 = -1;
    let t100 = -1;
    let tQm = -1;
    let speedQm = 0;

    const MPH_60 = 26.8224; // 60 mph in m/s
    const MPH_100 = 44.704; // 100 mph in m/s
    const QUARTER_MILE_M = 402.336;

    for (let iter = 0; iter < 500000 && time < 30; iter++) {
      const gearRatio = drivetrain.gearRatios[gearKeys[currentGear]];
      const totalRatio = gearRatio * fd;

      // Engine RPM from wheel speed
      const engineRpm = (speedMps / tireRadiusM) * totalRatio * (60 / (2 * Math.PI));

      // Check upshift
      if (
        currentGear < drivetrain.activeGearCount - 1 &&
        engineRpm >= (shiftPoints[currentGear] ?? 8000)
      ) {
        currentGear++;
        continue; // re-evaluate at new gear
      }

      // Clamp RPM to dyno range
      const clampedRpm = Math.max(
        dynoCurve[0]?.rpm ?? 1000,
        Math.min(engineRpm, dynoCurve[dynoCurve.length - 1]?.rpm ?? 9000)
      );

      const engineTorque = DrivetrainSolver.interpolateTorque(dynoCurve, clampedRpm);
      const rawWheelForce = (engineTorque * totalRatio * eff) / tireRadiusM;

      // Tire traction limit: max tractive force before wheelspin (mu ≈ 1.35 for sport compound)
      const maxTractionForce = 1.35 * vehicleMassKg * G;
      const wheelForce = Math.min(rawWheelForce, maxTractionForce);

      // Resistive forces
      const dragForce = 0.5 * AIR_DENSITY * DEFAULT_CDA * speedMps * speedMps;
      const rollingForce = ROLLING_RESISTANCE * vehicleMassKg * G;
      const netForce = wheelForce - dragForce - rollingForce;

      if (netForce <= 0) break;

      const accel = netForce / vehicleMassKg;
      speedMps += accel * dt;
      distance += speedMps * dt;
      time += dt;

      if (t60 < 0 && speedMps >= MPH_60) t60 = time;
      if (t100 < 0 && speedMps >= MPH_100) t100 = time;
      if (tQm < 0 && distance >= QUARTER_MILE_M) {
        tQm = time;
        speedQm = speedMps;
      }

      if (tQm > 0 && t100 > 0) break;
    }

    return {
      zeroTo60Sec: t60 > 0 ? Math.round(t60 * 100) / 100 : 99,
      zeroTo100Sec: t100 > 0 ? Math.round(t100 * 100) / 100 : 99,
      quarterMileSec: tQm > 0 ? Math.round(tQm * 100) / 100 : 99,
      quarterMileSpeedMph: tQm > 0 ? Math.round(speedQm * 2.237 * 10) / 10 : 0,
    };
  }

  /**
   * Suggest gear ratios based on engine characteristics.
   * "close-ratio" for high-revving NA, "wide-ratio" for forced induction.
   */
  static suggestGearRatios(
    peakTorqueRpm: number,
    redlineRpm: number,
    gearCount: 1 | 4 | 5 | 6 | 7 | 8,
    isNaturallyAspirated: boolean,
  ): GearRatioSet {
    // Progression factor: close-ratio ≈ 0.74, wide-ratio ≈ 0.68
    const kFactor = isNaturallyAspirated ? 0.74 : 0.68;
    const first = isNaturallyAspirated ? 3.40 : 3.80;
    const ratios: number[] = [first];
    for (let i = 1; i < 8; i++) {
      ratios.push(Math.round(ratios[i - 1] * kFactor * 100) / 100);
    }
    // Final drive: higher for lower-displacement, lower for high-power
    const fd = isNaturallyAspirated ? 3.73 : 3.44;
    return {
      gear1: ratios[0],
      gear2: ratios[1],
      gear3: ratios[2],
      gear4: ratios[3],
      gear5: ratios[4],
      gear6: ratios[5],
      gear7: ratios[6],
      gear8: ratios[7],
      finalDrive: fd,
    };
  }

  /**
   * Full drivetrain performance solve — main entry point.
   */
  static solve(
    enginePerf: MasterEnginePerformanceMetrics,
    drivetrain: DrivetrainSubsystemState,
    vehicleMassKg: number = DEFAULT_VEHICLE_MASS_KG,
  ): MasterDrivetrainPerformanceMetrics {
    const dynoCurve = enginePerf.dynoCurve;

    const wheelTorqueCurvesByGear = DrivetrainSolver.solveAllGearCurves(
      dynoCurve,
      drivetrain,
    );

    const optimalShiftPointsRpm = DrivetrainSolver.solveShiftPoints(
      dynoCurve,
      drivetrain,
    );

    // Find peak wheel torque and WHP across all gears
    let peakWheelTorqueNm = 0;
    let peakWheelHorsepowerHp = 0;
    for (const gearCurve of Object.values(wheelTorqueCurvesByGear)) {
      for (const pt of gearCurve) {
        if (pt.wheelTorqueNm > peakWheelTorqueNm) peakWheelTorqueNm = pt.wheelTorqueNm;
        if (pt.wheelHorsepowerHp > peakWheelHorsepowerHp) peakWheelHorsepowerHp = pt.wheelHorsepowerHp;
      }
    }

    const accel = DrivetrainSolver.solveAccelerationProfile(
      dynoCurve,
      drivetrain,
      vehicleMassKg,
    );

    const totalPowertrainMassKg = enginePerf.engineTotalMassKg + drivetrain.massKg;
    const powerToWeightHpPerKg = enginePerf.peakHorsepowerHp / Math.max(1, totalPowertrainMassKg);

    return {
      wheelTorqueCurvesByGear,
      optimalShiftPointsRpm,
      peakWheelTorqueNm: Math.round(peakWheelTorqueNm),
      peakWheelHorsepowerHp: Math.round(peakWheelHorsepowerHp),
      estimatedZeroTo60Sec: accel.zeroTo60Sec,
      estimatedZeroTo100Sec: accel.zeroTo100Sec,
      estimatedQuarterMileSec: accel.quarterMileSec,
      estimatedQuarterMileSpeedMph: accel.quarterMileSpeedMph,
      totalPowertrainMassKg: Math.round(totalPowertrainMassKg * 10) / 10,
      powerToWeightHpPerKg: Math.round(powerToWeightHpPerKg * 100) / 100,
    };
  }
}
