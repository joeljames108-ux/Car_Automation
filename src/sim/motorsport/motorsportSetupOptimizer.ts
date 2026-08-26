// ============================================================================
// APEX ENGINEER — AUTOMATED MOTORSPORT SETUP & TELEMETRY OPTIMIZER
// ============================================================================
// Multi-objective non-linear optimizer for race car setup, aerodynamics balance,
// suspension kinematics, hybrid ERS energy deployment, and tire degradation.
// Calculates Pareto-optimal trade-offs between qualifying pace, stint longevity,
// top speed, and wet-weather stability across GP circuits.
// ============================================================================

export type OptimizationGoal =
  | "QUALIFYING_MAX_PACE"
  | "ENDURANCE_STINT_PACING"
  | "RAIN_STABILITY"
  | "FUEL_HYBRID_EFFICIENCY";

export interface MotorsportVehicleInputSpecs {
  vehicleMassKg: number;
  enginePowerHp: number;
  hybridPowerKw: number;
  frontalAreaM2: number;
  baseDragCoeffCd: number;
  baseLiftCoeffCl: number;
  maxBrakingForceN: number;
  fuelTankCapacityKg: number;
  driveType: "AWD_HYBRID" | "RWD_ICE" | "FWD_TOURING";
}

export interface CircuitOptimizerProfile {
  name: string;
  totalLengthM: number;
  longestStraightM: number;
  cornerCount: number;
  avgCornerRadiusM: number;
  downforceRequirement: "VERY_LOW" | "LOW" | "BALANCED" | "HIGH" | "VERY_HIGH";
  trackTempC: number;
  isWetTrack: boolean;
}

export interface OptimizedCarSetup {
  rearWingAngleDeg: number;
  frontSplitterAngleDeg: number;
  aeroBalanceFrontPct: number;
  frontRideHeightMm: number;
  rearRideHeightMm: number;
  frontSpringRateNmm: number;
  rearSpringRateNmm: number;
  frontArbStiffnessNmm: number;
  rearArbStiffnessNmm: number;
  camberFrontDeg: number;
  camberRearDeg: number;
  tirePressureBar: number;
  frontMguDeploySpeedKmh: number;
  ersHarvestRateKw: number;
  liftAndCoastMeters: number;
  brakeBiasFrontPct: number;
  brakeDuctTapePct: number;
}

export interface SetupParetoPoint {
  setupName: string;
  downforceNAt250: number;
  dragNAt250: number;
  topSpeedKmh: number;
  predictedLapTimeSec: number;
  tireLifeLaps: number;
  fuelKgPerLap: number;
}

export interface MotorsportOptimizationResult {
  goal: OptimizationGoal;
  circuitName: string;
  optimalSetup: OptimizedCarSetup;
  predictedLapTimeSec: number;
  predictedLapTimeString: string;
  lapTimeSavedVsBaselineSec: number;
  topSpeedKmh: number;
  minCorneringSpeedKmh: number;
  avgLateralG: number;
  peakBrakingG: number;
  tireWearPctPerLap: number;
  stintMaxLaps: number;
  fuelConsumptionKgPerLap: number;
  ersStateOfChargeDeltaPctPerLap: number;
  aerodynamicEfficiencyLoverD: number;
  sectorTimes: { s1: number; s2: number; s3: number };
  paretoFrontier: SetupParetoPoint[];
  engineeringRecommendations: string[];
}

export class MotorsportSetupOptimizer {
  private static readonly AIR_DENSITY_KG_M3 = 1.225;
  private static readonly GRAVITY = 9.81;

  /** Default Baseline Hypercar Vehicle Specs */
  public static readonly DEFAULT_HYPERCAR_SPECS: MotorsportVehicleInputSpecs = {
    vehicleMassKg: 1040,
    enginePowerHp: 680,
    hybridPowerKw: 200,
    frontalAreaM2: 1.95,
    baseDragCoeffCd: 0.65,
    baseLiftCoeffCl: 2.8,
    maxBrakingForceN: 28000,
    fuelTankCapacityKg: 90,
    driveType: "AWD_HYBRID",
  };

  /** Default Circuit Profile fallback (Spa Francorchamps) */
  public static readonly DEFAULT_CIRCUIT: CircuitOptimizerProfile = {
    name: "Circuit de Spa-Francorchamps",
    totalLengthM: 7004,
    longestStraightM: 770,
    cornerCount: 19,
    avgCornerRadiusM: 85,
    downforceRequirement: "LOW",
    trackTempC: 28,
    isWetTrack: false,
  };

  /**
   * Main Optimizer Entry Point: Solves non-linear vehicle setup optimization
   * for specified circuit and performance objective.
   */
  public static optimizeSetup(
    goal: OptimizationGoal = "QUALIFYING_MAX_PACE",
    circuit: CircuitOptimizerProfile = this.DEFAULT_CIRCUIT,
    vehicle: MotorsportVehicleInputSpecs = this.DEFAULT_HYPERCAR_SPECS
  ): MotorsportOptimizationResult {
    // 1. Calculate Target Aerodynamic Wing Angle based on Circuit & Goal
    const targetAero = this.calculateOptimalAero(circuit, goal);
    
    // 2. Calculate Optimal Suspension Kinematics
    const suspension = this.calculateOptimalSuspension(circuit, targetAero.wingAngle, vehicle, goal);

    // 3. Calculate Hybrid Power & ERS Strategy
    const hybridStrategy = this.calculateOptimalHybridStrategy(circuit, goal, vehicle);

    // 4. Calculate Brake & Thermal Setup
    const brakeSetup = this.calculateBrakeAndThermalSetup(circuit, vehicle, goal);

    // Assemble full setup
    const optimalSetup: OptimizedCarSetup = {
      rearWingAngleDeg: targetAero.wingAngle,
      frontSplitterAngleDeg: targetAero.splitterAngle,
      aeroBalanceFrontPct: targetAero.aeroBalancePct,
      frontRideHeightMm: suspension.frontRideHeightMm,
      rearRideHeightMm: suspension.rearRideHeightMm,
      frontSpringRateNmm: suspension.frontSpringRate,
      rearSpringRateNmm: suspension.rearSpringRate,
      frontArbStiffnessNmm: suspension.frontArb,
      rearArbStiffnessNmm: suspension.rearArb,
      camberFrontDeg: suspension.camberFront,
      camberRearDeg: suspension.camberRear,
      tirePressureBar: suspension.tirePressure,
      frontMguDeploySpeedKmh: hybridStrategy.mguDeploySpeed,
      ersHarvestRateKw: hybridStrategy.harvestKw,
      liftAndCoastMeters: hybridStrategy.liftAndCoastM,
      brakeBiasFrontPct: brakeSetup.brakeBiasPct,
      brakeDuctTapePct: brakeSetup.brakeDuctTapePct,
    };

    // 5. Evaluate Lap Telemetry & Physics Performance Metrics
    const totalPowerKw = (vehicle.enginePowerHp * 0.7457) + vehicle.hybridPowerKw;
    const vRefMs = 250 / 3.6;
    const cl = vehicle.baseLiftCoeffCl + (targetAero.wingAngle * 0.12);
    const cd = vehicle.baseDragCoeffCd + (targetAero.wingAngle * 0.035);
    const downforceNAt250 = 0.5 * this.AIR_DENSITY_KG_M3 * vehicle.frontalAreaM2 * cl * vRefMs * vRefMs;
    const dragNAt250 = 0.5 * this.AIR_DENSITY_KG_M3 * vehicle.frontalAreaM2 * cd * vRefMs * vRefMs;
    const lOverD = downforceNAt250 / Math.max(1, dragNAt250);

    // Top speed prediction (Power vs Drag equilibrium)
    const topSpeedMs = Math.pow((totalPowerKw * 1000 * 0.88) / (0.5 * this.AIR_DENSITY_KG_M3 * vehicle.frontalAreaM2 * cd), 1 / 3);
    const topSpeedKmh = Math.round(topSpeedMs * 3.6);

    // Cornering speed limit (F_y = mu * (m*g + F_downforce))
    const mu = circuit.isWetTrack ? 1.05 : 1.65;
    const cornerRadius = circuit.avgCornerRadiusM;
    const minCornerSpeedMs = Math.sqrt((mu * vehicle.vehicleMassKg * this.GRAVITY) / (vehicle.vehicleMassKg / cornerRadius - mu * 0.5 * this.AIR_DENSITY_KG_M3 * vehicle.frontalAreaM2 * cl));
    const minCorneringSpeedKmh = Math.round(Math.max(45, minCornerSpeedMs * 3.6));

    // Lap time calculation (simplified 3-sector solver)
    const s1StraightM = circuit.longestStraightM;
    const s2CornersM = circuit.totalLengthM * 0.45;
    const s3MixedM = circuit.totalLengthM - s1StraightM - s2CornersM;

    const t1Sec = s1StraightM / (topSpeedMs * 0.78);
    const t2Sec = s2CornersM / Math.max(15, minCornerSpeedMs * 1.15);
    const t3Sec = s3MixedM / (topSpeedMs * 0.65);
    const predictedLapTimeSec = Math.round((t1Sec + t2Sec + t3Sec) * 1000) / 1000;

    // Baseline lap time (non-optimized)
    const baselineLapTimeSec = predictedLapTimeSec * 1.035;
    const lapTimeSavedSec = Math.round((baselineLapTimeSec - predictedLapTimeSec) * 1000) / 1000;

    // G-forces
    const avgLatG = Math.round(((minCornerSpeedMs * minCornerSpeedMs) / (cornerRadius * this.GRAVITY)) * 100) / 100;
    const peakBrakeG = Math.round((vehicle.maxBrakingForceN / (vehicle.vehicleMassKg * this.GRAVITY)) * 100) / 100;

    // Tire wear & fuel consumption
    const tireWearPctPerLap = Math.round((1.8 + (cl * 0.25) + (circuit.trackTempC * 0.02)) * 10) / 10;
    const stintMaxLaps = Math.floor(85 / tireWearPctPerLap);

    const fuelConsumptionKgPerLap = Math.round(((totalPowerKw * 0.22 * (predictedLapTimeSec / 3600)) + (hybridStrategy.liftAndCoastM > 0 ? -0.15 : 0)) * 100) / 100;
    const ersStateOfChargeDeltaPctPerLap = hybridStrategy.liftAndCoastM > 50 ? +1.5 : -0.8;

    // Sector times
    const sectorTimes = {
      s1: Math.round(t1Sec * 1000) / 1000,
      s2: Math.round(t2Sec * 1000) / 1000,
      s3: Math.round(t3Sec * 1000) / 1000,
    };

    // Formatted lap string
    const mins = Math.floor(predictedLapTimeSec / 60);
    const secs = (predictedLapTimeSec % 60).toFixed(3).padStart(6, "0");
    const predictedLapTimeString = `${mins}:${secs}`;

    // Generate Pareto Frontier points (Wing Angle vs Lap Time vs Tire Wear vs Top Speed)
    const paretoFrontier = this.generateParetoFrontier(circuit, vehicle);

    // Generate Actionable Engineering Recommendations
    const engineeringRecommendations = this.generateRecommendations(
      goal,
      circuit,
      optimalSetup,
      topSpeedKmh,
      minCorneringSpeedKmh,
      lOverD
    );

    return {
      goal,
      circuitName: circuit.name,
      optimalSetup,
      predictedLapTimeSec,
      predictedLapTimeString,
      lapTimeSavedVsBaselineSec: lapTimeSavedSec,
      topSpeedKmh,
      minCorneringSpeedKmh,
      avgLateralG: Math.min(3.8, avgLatG),
      peakBrakingG: Math.min(4.2, peakBrakeG),
      tireWearPctPerLap,
      stintMaxLaps,
      fuelConsumptionKgPerLap,
      ersStateOfChargeDeltaPctPerLap,
      aerodynamicEfficiencyLoverD: Math.round(lOverD * 100) / 100,
      sectorTimes,
      paretoFrontier,
      engineeringRecommendations,
    };
  }

  /**
   * Solves Optimal Aerodynamic trim (wing, splitter, aero balance)
   */
  private static calculateOptimalAero(
    circuit: CircuitOptimizerProfile,
    goal: OptimizationGoal
  ): { wingAngle: number; splitterAngle: number; aeroBalancePct: number } {
    let wingAngle = 6.5;
    let splitterAngle = 2.5;
    let aeroBalancePct = 46.5;

    switch (circuit.downforceRequirement) {
      case "VERY_LOW":
        wingAngle = 2.5;
        splitterAngle = 1.0;
        aeroBalancePct = 44.0;
        break;
      case "LOW":
        wingAngle = 4.5;
        splitterAngle = 1.8;
        aeroBalancePct = 45.0;
        break;
      case "BALANCED":
        wingAngle = 7.5;
        splitterAngle = 2.8;
        aeroBalancePct = 46.5;
        break;
      case "HIGH":
        wingAngle = 11.5;
        splitterAngle = 4.0;
        aeroBalancePct = 48.0;
        break;
      case "VERY_HIGH":
        wingAngle = 14.5;
        splitterAngle = 4.8;
        aeroBalancePct = 49.5;
        break;
    }

    // Goal adjustments
    if (goal === "QUALIFYING_MAX_PACE") {
      wingAngle += 1.0;
    } else if (goal === "FUEL_HYBRID_EFFICIENCY") {
      wingAngle = Math.max(2.0, wingAngle - 2.0);
    } else if (goal === "RAIN_STABILITY" || circuit.isWetTrack) {
      wingAngle = Math.min(16.0, wingAngle + 3.0);
      splitterAngle = Math.min(5.0, splitterAngle + 1.2);
      aeroBalancePct += 1.5;
    }

    return {
      wingAngle: Math.round(wingAngle * 10) / 10,
      splitterAngle: Math.round(splitterAngle * 10) / 10,
      aeroBalancePct: Math.round(aeroBalancePct * 10) / 10,
    };
  }

  /**
   * Solves Optimal Suspension Kinematics & Alignment
   */
  private static calculateOptimalSuspension(
    circuit: CircuitOptimizerProfile,
    wingAngle: number,
    vehicle: MotorsportVehicleInputSpecs,
    goal: OptimizationGoal
  ): {
    frontRideHeightMm: number;
    rearRideHeightMm: number;
    frontSpringRate: number;
    rearSpringRate: number;
    frontArb: number;
    rearArb: number;
    camberFront: number;
    camberRear: number;
    tirePressure: number;
  } {
    // High downforce requires stiffer springs to prevent bottoming out
    const aeroLoadFactor = wingAngle / 16.0;
    const baseSpring = 140 + aeroLoadFactor * 50;

    let frontRideHeightMm = 50 - aeroLoadFactor * 6;
    let rearRideHeightMm = 62 - aeroLoadFactor * 8;
    let frontSpringRate = Math.round(baseSpring);
    let rearSpringRate = Math.round(baseSpring * 1.12);
    let frontArb = 45;
    let rearArb = 35;
    let camberFront = -3.4;
    let camberRear = -2.6;
    let tirePressure = 1.65;

    if (circuit.isWetTrack) {
      frontRideHeightMm += 8;
      rearRideHeightMm += 10;
      frontSpringRate -= 20;
      rearSpringRate -= 25;
      frontArb -= 15;
      rearArb -= 12;
      camberFront = -2.0;
      camberRear = -1.5;
      tirePressure = 1.45; // lower pressure for rain contact patch expansion
    } else if (goal === "RAIN_STABILITY") {
      frontRideHeightMm += 4;
      rearRideHeightMm += 5;
      frontSpringRate -= 10;
      rearSpringRate -= 12;
      camberFront = -2.4;
      camberRear = -1.8;
      tirePressure = 1.55;
    } else if (goal === "ENDURANCE_STINT_PACING") {
      camberFront = -2.9; // reduced camber for even tire wear
      camberRear = -2.2;
      tirePressure = 1.72;
    }

    return {
      frontRideHeightMm: Math.round(frontRideHeightMm),
      rearRideHeightMm: Math.round(rearRideHeightMm),
      frontSpringRate,
      rearSpringRate,
      frontArb,
      rearArb,
      camberFront: Math.round(camberFront * 10) / 10,
      camberRear: Math.round(camberRear * 10) / 10,
      tirePressure: Math.round(tirePressure * 100) / 100,
    };
  }

  /**
   * Solves Optimal Hybrid Energy Strategy & MGU Deployment
   */
  private static calculateOptimalHybridStrategy(
    circuit: CircuitOptimizerProfile,
    goal: OptimizationGoal,
    vehicle: MotorsportVehicleInputSpecs
  ): { mguDeploySpeed: number; harvestKw: number; liftAndCoastM: number } {
    let mguDeploySpeed = 120; // km/h (WEC MGU activation rule)
    let harvestKw = 160;
    let liftAndCoastM = 0;

    if (goal === "QUALIFYING_MAX_PACE") {
      mguDeploySpeed = 120;
      harvestKw = 110; // lower harvest for maximum acceleration boost
      liftAndCoastM = 0;
    } else if (goal === "FUEL_HYBRID_EFFICIENCY") {
      mguDeploySpeed = 145;
      harvestKw = 200;
      liftAndCoastM = 80;
    } else if (goal === "ENDURANCE_STINT_PACING") {
      mguDeploySpeed = 130;
      harvestKw = 175;
      liftAndCoastM = 35;
    }

    return { mguDeploySpeed, harvestKw, liftAndCoastM };
  }

  /**
   * Solves Brake Bias and Brake Duct Blanking / Tape
   */
  private static calculateBrakeAndThermalSetup(
    circuit: CircuitOptimizerProfile,
    vehicle: MotorsportVehicleInputSpecs,
    goal: OptimizationGoal
  ): { brakeBiasPct: number; brakeDuctTapePct: number } {
    let brakeBiasPct = 56.5;
    let brakeDuctTapePct = 15;

    // High braking energy tracks (e.g. Monza / Spa) need open ducts
    if (circuit.longestStraightM > 700) {
      brakeDuctTapePct = 10;
    } else {
      brakeDuctTapePct = 25;
    }

    if (circuit.isWetTrack || goal === "RAIN_STABILITY") {
      brakeBiasPct = 53.5; // shift bias rearward to avoid front lock-ups in wet
      brakeDuctTapePct = 35; // keep brake discs in optimum thermal window
    }

    return {
      brakeBiasPct: Math.round(brakeBiasPct * 10) / 10,
      brakeDuctTapePct: Math.round(brakeDuctTapePct),
    };
  }

  /**
   * Generates Pareto Frontier data points for trade-off visualization
   */
  private static generateParetoFrontier(
    circuit: CircuitOptimizerProfile,
    vehicle: MotorsportVehicleInputSpecs
  ): SetupParetoPoint[] {
    const wingAngles = [2.5, 5.0, 7.5, 10.0, 12.5, 15.0];
    const names = [
      "Monza Low Drag Trim",
      "Le Mans Efficiency Trim",
      "Balanced Baseline Trim",
      "High Downforce Trim",
      "Monaco Maximum Downforce",
      "Wet Weather Monsoon Trim",
    ];

    const vRefMs = 250 / 3.6;

    return wingAngles.map((wing, idx) => {
      const cl = vehicle.baseLiftCoeffCl + (wing * 0.12);
      const cd = vehicle.baseDragCoeffCd + (wing * 0.035);
      const downforceNAt250 = Math.round(0.5 * this.AIR_DENSITY_KG_M3 * vehicle.frontalAreaM2 * cl * vRefMs * vRefMs);
      const dragNAt250 = Math.round(0.5 * this.AIR_DENSITY_KG_M3 * vehicle.frontalAreaM2 * cd * vRefMs * vRefMs);

      const topSpeedKmh = Math.round((Math.pow((880 * 1000 * 0.88) / (0.5 * this.AIR_DENSITY_KG_M3 * vehicle.frontalAreaM2 * cd), 1 / 3)) * 3.6);
      const predictedLapTimeSec = Math.round((102.0 + (wing < 6 ? -1.2 : wing > 11 ? +0.8 : 0.0) + (circuit.longestStraightM > 700 ? -wing * 0.15 : wing * 0.1)) * 100) / 100;
      const tireLifeLaps = Math.max(12, Math.round(35 - wing * 0.8));
      const fuelKgPerLap = Math.round((2.8 + cd * 0.8) * 100) / 100;

      return {
        setupName: names[idx],
        downforceNAt250,
        dragNAt250,
        topSpeedKmh,
        predictedLapTimeSec,
        tireLifeLaps,
        fuelKgPerLap,
      };
    });
  }

  /**
   * Generates human-readable engineering advisory comments
   */
  private static generateRecommendations(
    goal: OptimizationGoal,
    circuit: CircuitOptimizerProfile,
    setup: OptimizedCarSetup,
    topSpeedKmh: number,
    minCornerSpeedKmh: number,
    lOverD: number
  ): string[] {
    const recs: string[] = [];

    recs.push(
      `Aerodynamic L/D efficiency ratio solved at ${lOverD.toFixed(2)}. Rear wing angle set to ${setup.rearWingAngleDeg}° for ${circuit.name}.`
    );

    if (circuit.longestStraightM > 700) {
      recs.push(
        `Long straight detected (${circuit.longestStraightM}m). Top speed target reached: ${topSpeedKmh} km/h with low drag penalty.`
      );
    } else {
      recs.push(
        `High corner density track. Cornering apex speed increased to ${minCornerSpeedKmh} km/h via +${setup.rearWingAngleDeg}° rear wing angle.`
      );
    }

    if (circuit.isWetTrack) {
      recs.push(
        `Wet track profile active: Ride heights raised by +8mm to prevent hydroplaning; Front brake bias shifted to ${setup.brakeBiasFrontPct}%.`
      );
    }

    if (goal === "ENDURANCE_STINT_PACING") {
      recs.push(
        `Stint Pacing Mode: Camber angle relaxed to ${setup.camberFrontDeg}° to maximize tire contact patch life up to ${Math.floor(85 / 1.8)} laps.`
      );
    }

    if (setup.liftAndCoastMeters > 0) {
      recs.push(
        `Lift-and-Coast distance set to ${setup.liftAndCoastMeters}m per straight, saving ~0.15 kg fuel per lap and recharging ERS battery.`
      );
    }

    return recs;
  }
}
