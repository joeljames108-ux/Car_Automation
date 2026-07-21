// ===================================================================
// CHASSIS SIMULATION — Deep physics-based simulation for Phase 1
// ===================================================================
// Calculates chassis rigidity effects, suspension geometry behavior,
// steering feel, braking physics, tire grip/contact patch, wheel mass.
// ===================================================================

import type {
  ChassisEngineeringConfig, SuspensionGeometryConfig, SteeringConfig,
  BrakeConfig, TireEngineeringConfig, WheelEngineeringConfig,
  ChassisSimResult,
} from "./types/chassis";
import type { ChassisType, TireCompound } from "./types";
import { CHASSIS_TYPES, SUSPENSION_TYPES, TIRE_COMPOUNDS } from "./constants";
import {
  VEHICLE_ARCHITECTURES, CRASH_STRUCTURES, RACK_TYPES, POWER_ASSIST_TYPES,
  BRAKE_ROTOR_MATERIALS, BRAKE_PAD_COMPOUNDS, CALIPER_PISTONS,
  WHEEL_MATERIALS, TIRE_CONSTRUCTIONS,
} from "./constants/chassisConstants";

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

const GRAVITY = 9.81;

// ===================================================================
// MAIN CHASSIS SIMULATION
// ===================================================================

export function simulateChassis(
  chassis: ChassisEngineeringConfig,
  suspension: SuspensionGeometryConfig,
  steering: SteeringConfig,
  brakes: BrakeConfig,
  tires: TireEngineeringConfig,
  wheels: WheelEngineeringConfig,
  vehicleWeight: number, // kg — total vehicle weight from main sim
): ChassisSimResult {
  const arch = VEHICLE_ARCHITECTURES[chassis.architecture];
  const chassisData = CHASSIS_TYPES[chassis.chassisType];
  const crash = CRASH_STRUCTURES[chassis.crashStructure];

  // ---- Chassis ----
  const baseChassisWeight = arch.weightLimit * 0.35 * chassisData.weightFactor;
  const crashWeight = crash.weightPenalty;
  // Rigidity: player sets target, but chassis type determines achievable range
  const rigidityAchieved = chassis.chassisRigidity * chassisData.rigidityFactor;
  const rigidityWeight = (chassis.chassisRigidity - 8) * 2; // heavier for more rigid
  const chassisWeight = Math.round(baseChassisWeight + crashWeight + rigidityWeight);
  const torsionalRigidity = Math.round(rigidityAchieved * 10) / 10;

  // Total length
  const totalLength = chassis.frontOverhang + chassis.wheelbase + chassis.rearOverhang;

  // ---- Suspension geometry ----
  const susFront = SUSPENSION_TYPES[suspension.typeFront];
  const susRear = SUSPENSION_TYPES[suspension.typeRear];

  // Roll stiffness from spring rates + ARBs + ride height
  const rollStiffness = Math.round(
    (suspension.springRateFront * suspension.antiRollBarFront +
     suspension.springRateRear * suspension.antiRollBarRear) * 0.5 *
    (1 + rigidityAchieved * 0.01)
  );

  // Natural frequency — f = (1/2π) × √(k/m), approximated per axle
  const cornerMassFront = vehicleWeight * chassis.weightDistribution * 0.5;
  const cornerMassRear = vehicleWeight * (1 - chassis.weightDistribution) * 0.5;
  const naturalFreqFront = Math.round(
    (1 / (2 * Math.PI)) * Math.sqrt((suspension.springRateFront * 1000) / Math.max(cornerMassFront, 100)) * 100
  ) / 100;
  const naturalFreqRear = Math.round(
    (1 / (2 * Math.PI)) * Math.sqrt((suspension.springRateRear * 1000) / Math.max(cornerMassRear, 100)) * 100
  ) / 100;

  // ---- Steering ----
  const rack = RACK_TYPES[steering.rackType];
  const assist = POWER_ASSIST_TYPES[steering.powerAssist];

  // Base steering effort (1 = very heavy, 0 = very light)
  const weightOnFrontAxle = vehicleWeight * chassis.weightDistribution * GRAVITY;
  const rawEffort = clamp(weightOnFrontAxle / 10000 * (steering.steeringRatio / 14), 0.2, 1.0);
  const steeringEffort = clamp(rawEffort * (1 - assist.effortReduction), 0.05, 1.0);

  // Lock-to-lock turns
  const maxSteerAngle = 35; // degrees typical max
  const lockToLock = Math.round((maxSteerAngle * 2 * steering.steeringRatio / 360) * 10) / 10;

  // Turning circle (m) = wheelbase / sin(max_steer_angle) × 2 / 1000
  const effectiveSteerAngle = maxSteerAngle + (steering.rearWheelSteering ? steering.rearSteerAngle * 0.7 : 0);
  const turningCircle = Math.round(
    (chassis.wheelbase / Math.sin(effectiveSteerAngle * Math.PI / 180)) * 2 / 1000 * 10
  ) / 10;

  // Steering feel: rack quality + assist penalty + variable ratio bonus
  const steeringFeel = clamp(
    rack.feelFactor * rack.precisionFactor *
    (1 - assist.feelPenalty) *
    (steering.variableRatio ? 1.08 : 1.0) *
    (susFront.adjustability * 0.1 + 0.9),
    0, 1
  );

  // ---- Brakes ----
  const frontRotor = BRAKE_ROTOR_MATERIALS[brakes.frontRotorMaterial];
  const rearRotor = BRAKE_ROTOR_MATERIALS[brakes.rearRotorMaterial];
  const pad = BRAKE_PAD_COMPOUNDS[brakes.padCompound];
  const frontCaliper = CALIPER_PISTONS.find(c => c.value === brakes.frontCaliperPistons) || CALIPER_PISTONS[2];
  const rearCaliper = CALIPER_PISTONS.find(c => c.value === brakes.rearCaliperPistons) || CALIPER_PISTONS[1];

  // Braking force (simplified): F = μ × caliper_force × rotor_effective_radius × 4_corners
  const frontBrakeForce = frontRotor.frictionCoeff * pad.biteFactor *
    frontCaliper.forceFactor * (brakes.frontRotorDiameter / 350) * (brakes.frontRotorThickness / 30);
  const rearBrakeForce = rearRotor.frictionCoeff * pad.biteFactor *
    rearCaliper.forceFactor * (brakes.rearRotorDiameter / 350) * (brakes.rearRotorThickness / 25);

  // Bias efficiency: optimal around 0.58-0.65 depending on weight dist
  const optimalBias = chassis.weightDistribution * 0.9 + 0.1;
  const biasEfficiency = clamp(1 - Math.abs(brakes.brakeBias - optimalBias) * 1.5, 0.7, 1.05);

  const totalBrakeForce = (frontBrakeForce * brakes.brakeBias + rearBrakeForce * (1 - brakes.brakeBias)) * 2 *
    biasEfficiency * vehicleWeight * GRAVITY;
  const brakingForce = Math.round(totalBrakeForce);

  // Stopping distances (physics: d = v² / (2 × μ_effective × g))
  const muEffective = clamp(
    (frontBrakeForce + rearBrakeForce) * biasEfficiency * pad.biteFactor * 0.5,
    0.3, 1.4
  );
  const v60kmh = 60 / 3.6; // 16.67 m/s
  const v100kmh = 100 / 3.6; // 27.78 m/s
  const stoppingDist60 = Math.round(v60kmh * v60kmh / (2 * muEffective * GRAVITY) * 10) / 10;
  const stoppingDist100 = Math.round(v100kmh * v100kmh / (2 * muEffective * GRAVITY) * 10) / 10;

  // Brake temperature after a hard 100-0 stop (simplified)
  const kineticEnergy = 0.5 * vehicleWeight * v100kmh * v100kmh;
  const rotorMass = (brakes.frontRotorDiameter * brakes.frontRotorThickness * frontRotor.weightFactor * 0.0005 +
                     brakes.rearRotorDiameter * brakes.rearRotorThickness * rearRotor.weightFactor * 0.0004) * 4;
  const specificHeat = 500; // J/(kg·°C) for iron/steel
  const brakeTemp100 = Math.round(20 + kineticEnergy / (rotorMass * specificHeat) * 0.7);

  // Fade resistance
  const brakeFadeResistance = clamp(
    frontRotor.fadeResistance * 0.6 + rearRotor.fadeResistance * 0.3 +
    pad.fadeFactor * 0.3 +
    (brakes.brakeDucts ? 0.15 : 0) -
    (brakeTemp100 > frontRotor.maxTemp * 0.8 ? 0.3 : 0),
    0, 1
  );

  // Brake pedal feel
  const brakePedalFeel = clamp(
    pad.biteFactor * 0.4 + frontCaliper.forceFactor * 0.3 +
    biasEfficiency * 0.2 + (brakes.brakeDucts ? 0.05 : 0) +
    pad.coldPerformance * 0.05,
    0, 1
  );

  // ---- Tires ----
  const tireConst = TIRE_CONSTRUCTIONS[tires.construction];
  const frontCompound = TIRE_COMPOUNDS[tires.frontCompound];
  const rearCompound = TIRE_COMPOUNDS[tires.rearCompound];

  // Contact patch (cm²) ≈ (load_per_tire / pressure) — simplified
  const loadFront = vehicleWeight * chassis.weightDistribution * GRAVITY / 2; // N per front tire
  const loadRear = vehicleWeight * (1 - chassis.weightDistribution) * GRAVITY / 2;
  const pressureFrontPa = tires.frontPressure * 100000;
  const pressureRearPa = tires.rearPressure * 100000;
  const contactPatchFront = Math.round(loadFront / pressureFrontPa * 10000); // cm²
  const contactPatchRear = Math.round(loadRear / pressureRearPa * 10000);

  // Width factor (wider = more grip, but diminishing returns)
  const widthFactorFront = clamp(0.7 + tires.frontWidth / 800, 0.85, 1.15);
  const widthFactorRear = clamp(0.7 + tires.rearWidth / 800, 0.85, 1.15);

  // Aspect ratio effect: lower = stiffer sidewall = more responsive, less comfort
  const aspectFactorFront = clamp(1.1 - tires.frontAspectRatio / 200, 0.85, 1.1);
  const aspectFactorRear = clamp(1.1 - tires.rearAspectRatio / 200, 0.85, 1.1);

  // Camber correction — optimal camber maximizes tire contact
  const optCamber = -2.5;
  const camberCorrFront = clamp(1 - Math.abs(suspension.camberFront - optCamber) * 0.04, 0.8, 1.05);
  const camberCorrRear = clamp(1 - Math.abs(suspension.camberRear - optCamber) * 0.04, 0.8, 1.05);

  // Pressure optimality (optimal ~2.2-2.4 bar for street, lower for race)
  const pressureOptFront = clamp(1 - Math.abs(tires.frontPressure - 2.3) * 0.2, 0.75, 1.05);
  const pressureOptRear = clamp(1 - Math.abs(tires.rearPressure - 2.2) * 0.2, 0.75, 1.05);

  // Final grip per axle
  const tireGripFront = clamp(
    frontCompound.gripFactor * widthFactorFront * aspectFactorFront *
    camberCorrFront * pressureOptFront * tireConst.gripFactor,
    0.3, 1.5
  );
  const tireGripRear = clamp(
    rearCompound.gripFactor * widthFactorRear * aspectFactorRear *
    camberCorrRear * pressureOptRear * tireConst.gripFactor,
    0.3, 1.5
  );

  // Aquaplaning speed (km/h) — wider tires aquaplane sooner, higher pressure helps
  const aquaplaningSpeed = Math.round(clamp(
    100 - tires.frontWidth * 0.15 + tires.frontPressure * 10 - (tires.frontAspectRatio - 40) * 0.3,
    50, 160
  ));

  // Tire wear rate
  const tireWearRate = clamp(
    (frontCompound.wearFactor + rearCompound.wearFactor) / 2 *
    (1 + Math.abs(suspension.camberFront + 2.5) * 0.1) *
    (1 + Math.abs(suspension.toeFront) * 0.15) *
    (1 + Math.abs(suspension.toeRear) * 0.1),
    0.1, 2.0
  );

  // Rolling resistance (N)
  const rrCoeff = 0.01 * (frontCompound.rollingResistance + rearCompound.rollingResistance) / 2;
  const rollingResistance = Math.round(vehicleWeight * GRAVITY * rrCoeff *
    (tires.construction === "bias" ? 1.15 : 1.0));

  // ---- Wheels ----
  const frontWheelMat = WHEEL_MATERIALS[wheels.frontMaterial];
  const rearWheelMat = WHEEL_MATERIALS[wheels.rearMaterial];

  // Unsprung mass per corner (wheel + tire + brake + hub)
  const frontWheelWeight = wheels.frontDiameter * wheels.frontWidth * frontWheelMat.weightPerInchSq;
  const rearWheelWeight = wheels.rearDiameter * wheels.rearWidth * rearWheelMat.weightPerInchSq;
  // Tire weight scales with volume
  const frontTireWeight = tires.frontWidth * tires.frontAspectRatio * tires.frontDiameter * 0.0002;
  const rearTireWeight = tires.rearWidth * tires.rearAspectRatio * tires.rearDiameter * 0.0002;
  // Brake assembly weight
  const frontBrakeWeight = brakes.frontRotorDiameter * brakes.frontRotorThickness * frontRotor.weightFactor * 0.0005 +
    frontCaliper.weight;
  const rearBrakeWeight = brakes.rearRotorDiameter * brakes.rearRotorThickness * rearRotor.weightFactor * 0.0004 +
    rearCaliper.weight;
  const hubWeight = 3; // kg, constant

  const unsprungMassFront = Math.round((frontWheelWeight + frontTireWeight + frontBrakeWeight + hubWeight) * 10) / 10;
  const unsprungMassRear = Math.round((rearWheelWeight + rearTireWeight + rearBrakeWeight + hubWeight) * 10) / 10;

  // Rotational inertia (simplified: I ∝ m × r²)
  const frontRadius = (wheels.frontDiameter * 25.4 / 2 + tires.frontWidth * tires.frontAspectRatio / 100) / 1000;
  const rearRadius = (wheels.rearDiameter * 25.4 / 2 + tires.rearWidth * tires.rearAspectRatio / 100) / 1000;
  const rotationalInertia = Math.round(
    ((frontWheelWeight + frontTireWeight) * frontRadius * frontRadius * 2 +
     (rearWheelWeight + rearTireWeight) * rearRadius * rearRadius * 2) * 100
  ) / 100;

  // ---- Aggregate Scores ----
  const handlingScore = Math.round(clamp(
    // Suspension quality
    (susFront.gripFactor + susRear.gripFactor) / 2 * 20 +
    // Tire grip
    (tireGripFront + tireGripRear) / 2 * 20 +
    // Steering feel
    steeringFeel * 15 +
    // Weight distribution (50/50 ideal for handling)
    (1 - Math.abs(chassis.weightDistribution - 0.5) * 2) * 10 +
    // Low CG
    clamp(1 - chassis.cgHeight / 800, 0, 1) * 10 +
    // Chassis rigidity
    clamp(rigidityAchieved / 40, 0, 1) * 10 +
    // Low unsprung mass
    clamp(1 - (unsprungMassFront + unsprungMassRear) / 80, 0, 1) * 10 +
    // Brake feel
    brakePedalFeel * 5,
    0, 100
  ));

  const comfortScore = Math.round(clamp(
    // Soft springs = more comfort
    clamp(1 - (suspension.springRateFront + suspension.springRateRear) / 500, 0, 1) * 25 +
    // Moderate damping
    (1 - Math.abs((suspension.damperFront + suspension.damperRear) / 2 - 0.4) * 2) * 15 +
    // Higher ride height
    clamp(suspension.rideHeight / 200, 0, 1) * 10 +
    // Tire aspect ratio (higher = softer ride)
    ((tires.frontAspectRatio + tires.rearAspectRatio) / 2 / 65) * 15 +
    // Steering effort (lighter = more comfortable)
    (1 - steeringEffort) * 10 +
    // Bias-ply less comfortable
    (tires.construction === "radial" ? 10 : 3) +
    // Low brake noise
    (1 - pad.noiseLevel) * 10 +
    // Wheelbase (longer = smoother)
    clamp((chassis.wheelbase - 2400) / 800, 0, 1) * 5,
    0, 100
  ));

  // ---- Cost ----
  const chassisCost = Math.round(
    // Structure
    chassisData.costFactor * 3000 + crash.costFactor * 1500 + chassis.chassisRigidity * 80 +
    // Steering
    rack.costFactor * 400 + assist.costFactor * 300 +
    (steering.rearWheelSteering ? 3500 : 0) + (steering.variableRatio ? 1200 : 0) +
    // Brakes (×4 corners)
    (brakes.frontRotorDiameter * frontRotor.costFactor * 0.5 +
     brakes.rearRotorDiameter * rearRotor.costFactor * 0.4 +
     frontCaliper.cost * 2 + rearCaliper.cost * 2 +
     pad.costFactor * 200) +
    (brakes.brakeDucts ? 800 : 0) +
    // Tires (×4)
    (frontCompound.costFactor + rearCompound.costFactor) * 200 +
    tireConst.costFactor * 100 +
    // Wheels (×4)
    (frontWheelMat.costFactor * wheels.frontDiameter * wheels.frontWidth * 5 +
     rearWheelMat.costFactor * wheels.rearDiameter * wheels.rearWidth * 5)
  );

  return {
    chassisWeight,
    torsionalRigidity,
    totalLength,
    turningCircle,
    rollStiffness,
    naturalFreqFront,
    naturalFreqRear,
    steeringEffort,
    lockToLock,
    steeringFeel,
    brakingForce,
    brakeTemp100,
    brakeFadeResistance,
    brakePedalFeel,
    stoppingDist60,
    stoppingDist100,
    contactPatchFront,
    contactPatchRear,
    tireGripFront,
    tireGripRear,
    aquaplaningSpeed,
    tireWearRate,
    rollingResistance,
    unsprungMassFront,
    unsprungMassRear,
    rotationalInertia,
    handlingScore,
    comfortScore,
    chassisCost,
  };
}
