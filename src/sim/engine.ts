import {
  ENGINE_LAYOUTS, CRANK_MATERIALS, PISTON_TYPES, VALVETRAIN_TYPES, INTAKE_TYPES,
  FUEL_SYSTEMS, PLATFORMS, CHASSIS_TYPES, SUSPENSION_TYPES, TRANSMISSION_TYPES,
  TIRE_COMPOUNDS, BATTERY_CHEMISTRIES, EV_MOTOR_TYPES, MGU_H_MODES,
  TRACKS, SEAT_TYPES, SEAT_MATERIALS, DASHBOARD_MATERIALS, STEERING_WHEEL_TYPES,
  STEERING_MATERIALS, PEDAL_SETS, SHIFT_KNOBS, ROLL_CAGES, clamp,
  FRAME_MATERIALS, MANUFACTURING_PROCESSES, FACTORY_TIERS, AUTOMATION_LEVELS,
  QC_LEVELS, ASSEMBLY_LINES,
  BODY_TYPES, PAINT_FINISHES, BODY_KITS, SPOILER_TYPES, ROOF_SCOOPS,
  HEADLIGHT_TYPES, TAILLIGHT_TYPES, MIRROR_TYPES, RIM_DESIGNS, RIM_FINISHES,
  FRONT_BUMPER_SHAPES, UNDERBODY_FLOOR_TYPES, WHEEL_AERO_TYPES, MIRROR_AERO_TYPES,
  CFD_QUALITIES, AERO_MODES,
  INFO_OS_TIERS, INFO_VOICE_LEVELS,
  INFO_NAV_TIERS,
  INFO_FEATURE_COSTS, INFO_AI_SAFETY_COSTS, INFO_REMOTE_APP_COSTS,
  INFO_AI_SECURITY_COSTS, INFO_PRODUCTIVITY_COSTS,
  INFO_MUSIC_OPTIONS, INFO_VIDEO_OPTIONS, INFO_GAMING_OPTIONS,
  HYBRID_ARCHITECTURES, MOTOR_PLACEMENTS,
} from "./constants";
import {
  CLUSTER_LEVELS, INFOTAINMENT_SCREENS, SCREEN_TECH_OPTIONS,
  CONNECTIVITY_TIERS, CONNECTIVITY_EXTRAS, AUDIO_TIERS, CLIMATE_TIERS,
  CLIMATE_EXTRAS, SEAT_TIERS, SEAT_FEATURES, LIGHTING_TIERS, ADAS_LEVELS,
  PARKING_FEATURES, KEY_TYPES, HUD_TYPES, DASH_MATERIALS, ROOF_TYPES,
  CONVENIENCE_FEATURES, LUXURY_PACKAGE, AI_FEATURES, SAFETY_ELECTRONICS,
  generateTrimName, type ModuleStats,
} from "./electronicsData";
import type {
  EngineConfig, EngineSim, VehicleDesign, VehicleConfig, SimResult,
  TrackId, InfotainmentConfig, InfotainmentSim,
} from "./types";
import { simulateChassis } from "./chassisSim";

const RHO_AIR = 1.225;
const GRAVITY = 9.81;
const KMH_TO_MS = 1 / 3.6;
const HP_PER_KW = 1.341;

// ===================================================================
// ENGINE SIMULATION
// ===================================================================

export function simulateEngine(engine: EngineConfig): EngineSim {
  if (engine.layout === "electric") {
    return simulateElectric(engine);
  }
  return simulateCombustion(engine);
}

function simulateCombustion(engine: EngineConfig): EngineSim {
  const layout = ENGINE_LAYOUTS[engine.layout];
  const cyl = layout.cylinders;
  const boreM = engine.bore / 1000;
  const strokeM = engine.stroke / 1000;
  const cylDisp = (Math.PI / 4) * boreM * boreM * strokeM * 1e6;
  const displacement = cylDisp * cyl;

  const vt = VALVETRAIN_TYPES[engine.valvetrain];
  const intake = INTAKE_TYPES[engine.intake];
  const fuel = FUEL_SYSTEMS[engine.fuelSystem];

  // Volumetric efficiency model
  const baseVE = 0.82;
  const vtVE = vt.efficiencyFactor;
  const fuelVE = fuel.efficiencyFactor;
  const camVE = clamp((engine.camDuration - 240) / 120, 0, 1) * 0.15;

  // Boost
  const isForced = engine.intake !== "na";
  const pr = isForced ? 1 + engine.boostPressure : 1;
  const intercoolerEff = engine.intercoolerEff;
  const tempRatio = Math.pow(pr, 0.286);
  const densityRatio = pr / (tempRatio * (1 - intercoolerEff * 0.3));

  // Thermal efficiency (Otto cycle * real losses)
  const gamma = 1.4;
  const idealOtto = 1 - 1 / Math.pow(engine.compressionRatio, gamma - 1);
  const thermalEfficiency = clamp(idealOtto * 0.6 * fuel.efficiencyFactor, 0.18, 0.42);

  // Effective redline
  const vtRpmFactor = vt.rpmFactor;
  const maxRpm = Math.min(engine.rpmLimiter, engine.redline);
  const effectiveRedline = Math.round(maxRpm * vtRpmFactor);

  // Power curve
  const rpmMin = 800;
  const rpmMax = effectiveRedline;
  const steps = 50;
  const powerCurve: { rpm: number; power: number; torque: number }[] = [];
  let peakPower = 0, peakTorque = 0, peakPowerRpm = 0, peakTorqueRpm = 0;

  const camTorqueShift = (engine.camDuration - 270) * 12;
  const torquePeakRpm = clamp(3500 + camTorqueShift, 2000, rpmMax * 0.7);

  for (let i = 0; i <= steps; i++) {
    const rpm = rpmMin + (rpmMax - rpmMin) * (i / steps);

    const camCurve = Math.exp(-Math.pow((rpm - torquePeakRpm) / (torquePeakRpm * 0.45), 2));
    let veAtRpm = (baseVE + camVE) * vtVE * fuelVE * (0.7 + 0.3 * camCurve);
    if (isForced) veAtRpm *= densityRatio;

    // Turbo lag effect at low rpm
    if (isForced && rpm < 3000) {
      veAtRpm *= 0.7 + 0.3 * (rpm / 3000);
    }

    const crBonus = (engine.compressionRatio - 9) * 0.3;
    const ignitionFactor = 1 - clamp((engine.ignitionTiming - 30) * 0.005, -0.05, 0.05);
    const afrOptimal = fuel.afrStoich * 0.88;
    const afrFactor = 1 - clamp(Math.abs(engine.afr - afrOptimal) / 3, 0, 0.2);

    let bmep = (15 * veAtRpm + crBonus) * fuel.powerFactor * ignitionFactor * afrFactor;
    bmep *= 1 - intake.parasiticLoss;
    if (engine.layout === "rotary") bmep *= 0.7;

    const torque = (bmep * displacement) / 126;
    const power = (torque * rpm) / 9549 * HP_PER_KW;

    if (power > peakPower) { peakPower = power; peakPowerRpm = rpm; }
    if (torque > peakTorque) { peakTorque = torque; peakTorqueRpm = rpm; }
    powerCurve.push({ rpm: Math.round(rpm), power: Math.round(power), torque: Math.round(torque) });
  }

  // Piston speed
  const maxPistonSpeed = (2 * engine.stroke / 1000) * (effectiveRedline / 60);

  // Knock risk
  const effectiveCR = isForced ? engine.compressionRatio + engine.boostPressure * 0.6 : engine.compressionRatio;
  const knockRisk = clamp((effectiveCR - 10) / 5, 0, 1);
  const octaneRequired = Math.round(90 + (engine.compressionRatio - 8) * 4 + (isForced ? engine.boostPressure * 8 : 0));

  // BSFC
  const bsfc = clamp(300 / (thermalEfficiency / 0.3), 200, 450);

  // Turbo lag
  const turboLag = isForced ? clamp(0.8 - engine.boostPressure * 0.1 - engine.intercoolerEff * 0.2, 0.1, 1.5) : 0;

  // ---- Hybrid / MGU calculations ----
  let mguHPower = 0;
  let combinedPower = peakPower;
  let combinedTorque = peakTorque;
  let batteryWeight = 0, batteryCost = 0, batteryEnergy = 0;
  let regenEfficiency = 0, energyRecoveryPerLap = 0, deployDuration = 0;

  const isHybrid = engine.hybridArchitecture !== "none";
  const arch = HYBRID_ARCHITECTURES[engine.hybridArchitecture] || HYBRID_ARCHITECTURES.none;
  const placement = MOTOR_PLACEMENTS[engine.motorPlacement] || MOTOR_PLACEMENTS.p0;

  if (engine.hasMguH && isForced) {
    const mguHMode = MGU_H_MODES[engine.mguHMode];
    mguHPower = engine.boostPressure > 0 ? clamp(engine.boostPressure * 30 * mguHMode.recoveryFactor, 0, 80) : 0;
  }

  const motorPowerKW = clamp(engine.hybridMotorPower, 0, arch.maxMotorPower);

  if (isHybrid && engine.batteryCapacity > 0) {
    const batt = BATTERY_CHEMISTRIES[engine.batteryChemistry];
    
    // Battery capacity constrained by architecture
    const clampedCapacity = clamp(engine.batteryCapacity, arch.minBattery, arch.maxBattery);
    batteryWeight = clampedCapacity * batt.weightPerKwh;
    batteryCost = clampedCapacity * batt.costPerKwh;
    batteryEnergy = clampedCapacity * 0.85; // usable

    // Combined outputs depend on hybrid architecture
    if (engine.hybridArchitecture === "range_extender") {
      // Series hybrid: only the electric motor drives the wheels!
      combinedPower = motorPowerKW * HP_PER_KW;
      combinedTorque = motorPowerKW * 4.0;
    } else {
      // Parallel / Mild / Full hybrids: combined ICE + electric assist
      combinedPower = peakPower + motorPowerKW * HP_PER_KW;
      combinedTorque = peakTorque + (motorPowerKW * 4.5 * placement.regenEfficiency);
    }

    // Regen & Recovery
    regenEfficiency = placement.regenEfficiency * clamp(0.6 + engine.regenLevel * 0.35, 0.4, 0.95);
    energyRecoveryPerLap = (motorPowerKW * 0.35 * regenEfficiency * arch.regenMultiplier + mguHPower * 0.2) * 0.8;
    deployDuration = batteryEnergy / Math.max(motorPowerKW + mguHPower, 1) * 3600;
  }

  // Engine weight
  const crankWeight = CRANK_MATERIALS[engine.crank].weightFactor;
  const pistonWeight = PISTON_TYPES[engine.pistons].weightFactor;
  let engineWeight = layout.weightBase * (0.6 + 0.4 * (displacement / 4000)) *
    crankWeight * pistonWeight * vt.weightFactor * intake.weightFactor;
  
  if (isHybrid) {
    engineWeight += arch.weightPenalty * placement.weightFactor;
  }
  engineWeight += batteryWeight;

  // Engine cost
  let engineCost = 3000 * layout.costFactor * (0.5 + displacement / 2000) *
    CRANK_MATERIALS[engine.crank].costFactor * PISTON_TYPES[engine.pistons].costFactor *
    vt.costFactor * intake.costFactor * fuel.costFactor;
  if (isHybrid) {
    engineCost = engineCost * arch.costFactor + batteryCost + (motorPowerKW * 180 * placement.costFactor) + (mguHPower * 300);
  }
  engineCost = clamp(engineCost, 2000, 120000);

  // Reliability
  const heatStress = clamp((effectiveCR - 9) / 6, 0, 1);
  const rpmStress = clamp((effectiveRedline - 6000) / 4000, 0, 1);
  const boostStress = clamp(engine.boostPressure / 2.5, 0, 1);
  const hybridStress = isHybrid ? 0.05 : 0;
  const cooling = (engine.coolingRadiator + engine.coolingOilCooler + engine.coolingWaterPump + engine.coolingFanSpeed) / 4;
  const materialStrength = (CRANK_MATERIALS[engine.crank].strengthFactor + PISTON_TYPES[engine.pistons].strengthFactor) / 2;
  const reliability = clamp(
    0.95 - heatStress * 0.2 - rpmStress * 0.25 - boostStress * 0.2 - hybridStress +
    cooling * 0.1 + (materialStrength - 0.75) * 0.2,
    0.3, 0.99
  );

  // NVH
  const nvhEngine = clamp(0.4 + layout.balanceFactor * 0.3 + vt.rpmFactor * 0.1 - boostStress * 0.1, 0.2, 0.95);

  // Emissions
  let emissionsEngine = Math.round(180 + displacement / 20 - thermalEfficiency * 200);
  if (engine.exhaustCat) emissionsEngine = Math.round(emissionsEngine * 0.6);
  if (isForced) emissionsEngine = Math.round(emissionsEngine * 0.85);
  if (isHybrid) emissionsEngine = Math.round(emissionsEngine * arch.efficiencyBonus);
  emissionsEngine = clamp(emissionsEngine, 0, 400);

  // Fuel economy
  let fuelEconomyEngine = clamp(
    (30 / (displacement / 1000)) * thermalEfficiency / 0.3 * (isForced ? 0.85 : 1) * fuel.efficiencyFactor,
    3, 25
  );
  if (isHybrid) {
    fuelEconomyEngine = clamp(fuelEconomyEngine * arch.efficiencyBonus, 1.5, 25);
  }

  return {
    displacement: Math.round(displacement), cylinderCount: cyl, powerCurve,
    peakPower: Math.round(peakPower), peakTorque: Math.round(peakTorque),
    peakPowerRpm: Math.round(peakPowerRpm), peakTorqueRpm: Math.round(peakTorqueRpm),
    redline: Math.round(effectiveRedline), maxPistonSpeed, thermalEfficiency,
    knockRisk, octaneRequired, bsfc: Math.round(bsfc), turboLag, boostPressure: engine.boostPressure,
    engineWeight: Math.round(engineWeight), engineCost: Math.round(engineCost),
    reliability, nvhEngine,
    mguHPower: Math.round(mguHPower), mguKPower: Math.round(motorPowerKW),
    combinedPower: Math.round(combinedPower), combinedTorque: Math.round(combinedTorque),
    batteryWeight: Math.round(batteryWeight), batteryCost: Math.round(batteryCost),
    batteryEnergy: Math.round(batteryEnergy * 10) / 10, electricRange: 0,
    regenEfficiency, energyRecoveryPerLap: Math.round(energyRecoveryPerLap * 10) / 10,
    deployDuration: Math.round(deployDuration), isElectric: false, isHybrid,
    emissionsEngine, fuelEconomyEngine: Math.round(fuelEconomyEngine * 10) / 10,
  };
}

function simulateElectric(engine: EngineConfig): EngineSim {
  const motorType = EV_MOTOR_TYPES[engine.evMotorType];
  const motorPower = clamp(engine.evMotorPower, 50, 1500);
  const motorCount = engine.motorLayout === "both" ? 2 : 1;
  const totalPowerKW = motorPower * motorCount;
  const power = totalPowerKW * HP_PER_KW;
  const torque = totalPowerKW * 2.5 * motorType.torqueFactor;

  const powerCurve: { rpm: number; power: number; torque: number }[] = [];
  const rpmMax = 18000;
  const steps = 50;
  const baseSpeed = 5000;
  let peakPower = 0, peakTorque = 0, peakPowerRpm = 0, peakTorqueRpm = 0;

  for (let i = 0; i <= steps; i++) {
    const rpm = (i / steps) * rpmMax;
    let t: number, p: number;
    if (rpm < baseSpeed) {
      t = torque;
      p = (t * rpm) / 9549 * HP_PER_KW;
    } else {
      p = power;
      t = (p / HP_PER_KW) * 9549 / rpm;
    }
    if (p > peakPower) { peakPower = p; peakPowerRpm = rpm; }
    if (t > peakTorque) { peakTorque = t; peakTorqueRpm = rpm; }
    powerCurve.push({ rpm: Math.round(rpm), power: Math.round(p), torque: Math.round(t) });
  }

  const batt = BATTERY_CHEMISTRIES[engine.batteryChemistry];
  const batteryEnergy = engine.batteryCapacity;
  const batteryWeight = batteryEnergy * batt.weightPerKwh;
  const batteryCost = batteryEnergy * batt.costPerKwh;
  const motorWeight = motorType.weight * motorCount;

  const efficiency = motorType.efficiency * 0.92; // drivetrain loss
  const electricRange = batteryEnergy > 0 ? (batteryEnergy / (totalPowerKW * 0.2)) * efficiency * 100 : 0;

  const regenEfficiency = clamp(0.7 + engine.regenLevel * 0.25, 0.5, 0.95);
  const energyRecoveryPerLap = totalPowerKW * 0.15 * regenEfficiency;

  const reliability = 0.98;
  const engineCost = Math.round(motorPower * 80 * motorCount + batteryCost);
  const nvhEngine = 0.98;
  const emissionsEngine = 0;

  return {
    displacement: 0, cylinderCount: 0, powerCurve,
    peakPower: Math.round(peakPower), peakTorque: Math.round(peakTorque),
    peakPowerRpm: Math.round(peakPowerRpm), peakTorqueRpm: Math.round(peakTorqueRpm),
    redline: rpmMax, maxPistonSpeed: 0, thermalEfficiency: 0.9,
    knockRisk: 0, octaneRequired: 0, bsfc: 0, turboLag: 0, boostPressure: 0,
    engineWeight: Math.round(motorWeight + batteryWeight),
    engineCost: Math.round(engineCost), reliability, nvhEngine,
    mguHPower: 0, mguKPower: 0,
    combinedPower: Math.round(peakPower), combinedTorque: Math.round(peakTorque),
    batteryWeight: Math.round(batteryWeight), batteryCost: Math.round(batteryCost),
    batteryEnergy: Math.round(batteryEnergy * 10) / 10, electricRange: Math.round(electricRange),
    regenEfficiency, energyRecoveryPerLap: Math.round(energyRecoveryPerLap * 10) / 10,
    deployDuration: 0, isElectric: true, isHybrid: false,
    emissionsEngine, fuelEconomyEngine: 0,
  };
}

// ===================================================================
// AERODYNAMICS
// ===================================================================

function simulateAero(v: VehicleConfig): {
  dragCoeff: number; frontalArea: number; downforce: number; liftCoeff: number;
  centerOfPressure: number; aeroBalance: number;
  dragVsSpeed: { speed: number; drag: number; downforce: number }[];
  aeroCost: number; aeroWeight: number; coolingEfficiency: number;
  frontDownforce: number; rearDownforce: number; groundEffect: number;
  separationRisk: number; brakeCooling: number; aeroNoise: number;
} {
  const a = v.aero;
  const ar = v.aeroResearch;
  const ext = v.exterior;
  const platform = PLATFORMS[v.platform];
  const bodyType = BODY_TYPES[ext.bodyType];
  const paint = PAINT_FINISHES[ext.paintFinish];
  const kit = BODY_KITS[ext.bodyKit];
  const spoiler = SPOILER_TYPES[ext.spoilerType];
  const roofScoop = ROOF_SCOOPS[ext.roofScoop];
  const headlight = HEADLIGHT_TYPES[ext.headlightType];
  const mirror = MIRROR_TYPES[ext.mirrorType];

  const frontBumper = FRONT_BUMPER_SHAPES[ar.front.bumperShape];
  const underbodyFloor = UNDERBODY_FLOOR_TYPES[ar.underbody.floorType];
  const wheelAero = WHEEL_AERO_TYPES[ar.wheel.wheelAero];
  const mirrorAero = MIRROR_AERO_TYPES[ar.mirror];
  const cfdQuality = CFD_QUALITIES[ar.cfd.quality];
  const activeMode = ar.active.enabled ? AERO_MODES[ar.active.mode] : null;

  const frontalArea = clamp(
    platform.frontalAreaBase *
      bodyType.frontalDelta *
      (0.9 + (a.bodyWidth - 1800) / 4000) *
      (0.95 + (a.roofHeight - 1100) / 8000) *
      (1 - ar.sidepod.cokeBottleTaper * 0.05),
    1.2, 3.5
  );

  let cd = platform.dragBase + (a.bodyShape - 0.5) * -0.08;
  cd += bodyType.dragDelta;
  cd += paint.dragDelta;
  cd += kit.dragDelta;
  cd += spoiler.dragDelta;
  cd += roofScoop.dragDelta;
  cd += headlight.dragDelta;
  cd += mirror.dragDelta;
  // Aero Research contributions
  cd += frontBumper.dragDelta;
  cd += underbodyFloor.dragDelta;
  cd += wheelAero.dragDelta;
  cd += mirrorAero.dragDelta;
  cd -= ar.front.airDam * 0.01;
  cd -= ar.front.splitterExtension / 16000;
  cd += ar.front.divePlanes * 0.004;
  cd -= ar.front.airCurtains ? 0.006 : 0;
  cd -= ar.sidepod.undercut * 0.008;
  cd -= ar.sidepod.cokeBottleTaper * 0.012;
  cd += ar.sidepod.width * 0.004;
  cd -= ar.diffuser.length / 30000;
  cd += (ar.diffuser.angle - 12) / 400;
  cd -= ar.diffuser.channels * 0.001;
  cd -= ar.underbody.floorFences * 0.001;
  cd -= ar.underbody.coolingChannels * 0.001;
  cd -= ar.cooling.engineBayExtraction * 0.004;
  cd -= ar.cooling.hoodVents * 0.002;
  cd -= ar.cooling.fenderVents * 0.002;
  if (ar.underbody.skidBlocks) cd += 0.003;
  if (ar.underbody.floorEdgeWings) cd += 0.002;
  if (ar.front.activeGrilleShutters) cd -= 0.008;
  if (ar.rearWing.swanNeckMount) cd -= 0.002;
  if (ar.rearWing.gurneyFlap) cd += 0.004;
  if (ar.rearWing.beamWing) cd += 0.003;
  if (ar.diffuser.gurneyFlap) cd += 0.003;
  if (ext.hoodScoop) cd += 0.004;
  if (ext.sideSkirts) cd -= 0.002;
  if (ext.fenderVents) cd -= 0.001;
  if (ext.splitter) cd -= 0.004;
  if (ext.towHook) cd += 0.001;
  cd += (a.rideHeight - 100) / 1000;
  cd += (a.roofHeight - 1100) / 6000;
  cd += a.grilleOpening * 0.05;
  cd -= a.splitterLength / 8000;
  const wingDrag = (a.wingAngle / 90) * 0.18 * (a.wingWidth / 1600);
  cd += wingDrag;
  // Rear wing research drag
  cd += (ar.rearWing.elements - 1) * 0.015;
  cd += (ar.rearWing.angleOfAttack / 90) * 0.12 * (ar.rearWing.span / 1600);
  cd += (a.diffuserAngle - 10) / 200;
  if (a.underbody !== "flat") cd -= 0.03;
  // Active aero drag reduction
  if (activeMode) cd += activeMode.dragReduction;
  if (ar.active.activeGrille) cd -= 0.006;
  if (ar.active.drs) cd -= 0.02;
  // Basic DRS toggle — opens rear-wing flap to slash wing drag on straights
  if (a.drs) cd -= 0.03;
  // Basic sidepod toggle — adds ducted bodywork that cleans up rear airflow
  if (a.sidePods) cd -= 0.006;
  // CFD quality slightly optimizes (better-informed design)
  cd -= (cfdQuality.accuracyFactor - 0.6) * 0.008;
  const dragCoeff = clamp(cd, 0.20, 1.2);

  let cl = platform.liftBase;
  cl += bodyType.liftDelta;
  cl += kit.liftDelta;
  cl += spoiler.liftDelta;
  const wingLift = -(a.wingAngle / 90) * 0.9 * (a.wingWidth / 1600) * (1 + a.wingHeight / 5000);
  cl += wingLift;
  cl += -(a.splitterLength / 2000) * (1 + a.splitterAngle / 30);
  cl += -(a.diffuserAngle / 30) * 0.4;
  if (a.underbody === "ground_effect") cl -= 0.3;
  if (a.underbody === "venturi") cl -= 0.5;
  if (a.underbody === "skirts") cl -= 0.6;
  if (a.underbody !== "flat") cl -= (120 - a.rideHeight) / 400;
  if (a.canards) cl -= 0.05;
  if (ext.splitter) cl -= 0.02;
  if (ext.sideSkirts) cl -= 0.01;
  // Aero Research lift contributions
  cl += frontBumper.downforceDelta;
  cl -= ar.front.airDam * 0.03;
  cl -= ar.front.splitterExtension / 6000;
  cl -= ar.front.divePlanes * 0.02;
  cl -= (ar.diffuser.angle / 30) * 0.5 * (ar.diffuser.length / 300);
  cl -= ar.diffuser.channels * 0.015;
  cl -= ar.diffuser.gurneyFlap ? 0.04 : 0;
  cl -= underbodyFloor.downforceFactor * 0.15;
  cl -= ar.underbody.floorEdgeWings ? 0.05 : 0;
  cl -= ar.underbody.floorFences * 0.005;
  cl -= (ar.rearWing.angleOfAttack / 90) * 0.7 * (ar.rearWing.span / 1600) * ar.rearWing.elements;
  cl -= ar.rearWing.gurneyFlap ? 0.05 : 0;
  cl -= ar.rearWing.beamWing ? 0.03 : 0;
  // Basic DRS — when deployed (open), the wing sheds angle-of-attack downforce
  if (a.drs) cl += 0.25;
  // Basic sidepods — ducted bodywork adds a small underbody downforce contribution
  if (a.sidePods) cl -= 0.04;
  if (activeMode) cl *= activeMode.downforceFactor;
  const liftCoeff = clamp(cl, -2.8, 0.5);

  let cp = 0.5;
  cp += wingLift * 0.15;
  cp -= (a.splitterLength / 2000) * 0.1;
  if (a.canards) cp -= 0.05;
  cp -= (a.diffuserAngle / 30) * 0.05;
  if (a.underbody !== "flat") cp += 0.05;
  cp -= ar.front.airDam * 0.04;
  cp -= ar.front.splitterExtension / 8000;
  cp -= ar.front.divePlanes * 0.02;
  cp += (ar.diffuser.angle / 30) * 0.06;
  cp += (ar.rearWing.angleOfAttack / 90) * 0.08;
  const centerOfPressure = clamp(cp, 0.2, 0.8);

  const speed250 = 250 * KMH_TO_MS;
  const totalDownforce = 0.5 * RHO_AIR * speed250 * speed250 * frontalArea * (-liftCoeff);
  const frontDownforce = Math.round(totalDownforce * (1 - centerOfPressure));
  const rearDownforce = Math.round(totalDownforce * centerOfPressure);

  const groundEffect = clamp(
    (ar.underbody.floorType === "ground_effect_tunnels" ? 0.9 :
     ar.underbody.floorType === "venturi_tunnels" ? 0.6 :
     ar.underbody.floorType === "partial_flat" ? 0.25 : 0.1) *
    (1 + ar.diffuser.angle / 30) * (1 - a.rideHeight / 400),
    0, 1
  );

  // Flow separation risk — rises with aggressive angles, low ride height, high diffuser angle
  const separationRisk = clamp(
    (ar.diffuser.angle / 30) * 0.4 +
    (ar.rearWing.angleOfAttack / 30) * 0.3 +
    (ar.front.splitterAngle / 15) * 0.2 +
    (a.rideHeight < 60 ? 0.3 : 0) +
    (ar.diffuser.gurneyFlap ? 0.1 : 0) -
    cfdQuality.accuracyFactor * 0.15,
    0, 1
  );

  const dragVsSpeed: { speed: number; drag: number; downforce: number }[] = [];
  for (let s = 0; s <= 350; s += 25) {
    const ms = s * KMH_TO_MS;
    const yawEff = ar.windTunnel.yawAngle !== 0 ? 1 + Math.abs(ar.windTunnel.yawAngle) / 90 * 0.08 : 1;
    dragVsSpeed.push({
      speed: s,
      drag: 0.5 * RHO_AIR * ms * ms * frontalArea * dragCoeff * yawEff,
      downforce: 0.5 * RHO_AIR * ms * ms * frontalArea * (-liftCoeff),
    });
  }

  const aeroCost = clamp(
    2000 + a.wingWidth * 3 + a.splitterLength * 4 +
    (a.underbody !== "flat" ? 8000 : 0) + (a.drs ? 4000 : 0) + (a.sidePods ? 3500 : 0) + (a.canards ? 1500 : 0) +
    frontBumper.costFactor * 800 +
    underbodyFloor.complexity * 12000 +
    ar.diffuser.channels * 600 +
    ar.rearWing.elements * 1500 + ar.rearWing.span * 1.5 +
    (ar.active.enabled ? 8000 : 0) +
    (ar.active.adaptiveWing ? 5000 : 0) + (ar.active.airBrake ? 4000 : 0) +
    (ar.active.rideHeightAdj ? 6000 : 0) + (ar.active.drs ? 4000 : 0) +
    cfdQuality.costFactor * 2000 +
    mirrorAero.costFactor * 400,
    1500, 80000
  );
  const aeroWeight = clamp(
    30 + a.wingWidth / 40 + a.splitterLength / 20 + (a.underbody !== "flat" ? 25 : 0) +
    (a.sidePods ? 18 : 0) + (a.drs ? 6 : 0) +
    ar.diffuser.length / 30 + ar.diffuser.channels * 2 +
    ar.rearWing.elements * 4 + ar.rearWing.span / 80 +
    (ar.active.enabled ? 15 : 0) + (ar.active.rideHeightAdj ? 12 : 0) +
    (ar.underbody.floorEdgeWings ? 4 : 0) + ar.underbody.floorFences * 1.5,
    15, 260
  );
  const coolingEfficiency = clamp(
    0.5 + a.grilleOpening * 0.3 + a.coolingVents * 0.3 +
    ar.cooling.radiatorSize * 0.2 + ar.cooling.engineBayExtraction * 0.15 +
    ar.cooling.hoodVents * 0.1 + ar.cooling.fenderVents * 0.05 +
    ar.front.brakeDucts * 0.1 + ar.front.hoodVents * 0.05,
    0.4, 1.0
  );
  const brakeCooling = clamp(
    0.4 + ar.front.brakeDucts * 0.4 + ar.cooling.brakeDucts * 0.3 +
    wheelAero.brakeCoolingFactor * 0.2 + ar.wheel.archVents * 0.1,
    0.3, 1.0
  );
  const aeroNoise = clamp(
    0.3 + wheelAero.turbulenceFactor * 0.3 + ar.front.divePlanes * 0.04 +
    (ar.underbody.floorFences * 0.03) + ar.diffuser.strakes * 0.02 +
    (a.canards ? 0.05 : 0) - ar.sidepod.undercut * 0.05,
    0, 1
  );

  return {
    dragCoeff, frontalArea, downforce: Math.round(totalDownforce), liftCoeff,
    centerOfPressure, aeroBalance: centerOfPressure, dragVsSpeed,
    aeroCost: Math.round(aeroCost), aeroWeight: Math.round(aeroWeight), coolingEfficiency,
    frontDownforce, rearDownforce, groundEffect, separationRisk, brakeCooling, aeroNoise,
  };
}

// ===================================================================
// INTERIOR SIMULATION
// ===================================================================

function simulateInterior(v: VehicleConfig): {
  interiorWeight: number; interiorCost: number; comfortRating: number; luxuryRating: number;
} {
  const i = v.interior;
  const seat = SEAT_TYPES[i.seatType];
  const seatMat = SEAT_MATERIALS[i.seatMaterial];
  const dash = DASHBOARD_MATERIALS[i.dashboardMaterial];
  const wheel = STEERING_WHEEL_TYPES[i.steeringWheel];
  const wheelMat = STEERING_MATERIALS[i.steeringMaterial];
  const pedals = PEDAL_SETS[i.pedalSet];
  const knob = SHIFT_KNOBS[i.shiftKnob];
  const cage = ROLL_CAGES[i.rollCage];

  const seatWeight = seat.weight * seatMat.weightFactor * i.seatCount;
  const audioWeight = i.hasPremiumAudio ? i.audioSpeakers * 1.5 : i.audioSpeakers * 0.5;
  const deadeningWeight = i.soundDeadening * 20;
  const infotainmentWeight = i.infotainmentSize * 0.5 + (i.hasNav ? 2 : 0);

  const interiorWeight = Math.round(
    seatWeight + dash.weight + wheel.weight * wheelMat.costFactor + pedals.weight + knob.weight +
    audioWeight + deadeningWeight + infotainmentWeight + cage.weight +
    (i.climateControl ? 8 : 0) + (i.fireExtinguisher ? 3 : 0) + (i.racingHarness ? 2 : 0)
  );

  const interiorCost = Math.round(
    seat.cost * seatMat.costFactor * i.seatCount + dash.cost + wheel.cost * wheelMat.costFactor +
    pedals.cost + knob.cost + cage.cost +
    (i.hasPremiumAudio ? i.audioSpeakers * 150 : i.audioSpeakers * 30) +
    (i.hasNav ? 800 : 0) + (i.climateControl ? 1200 : 0) +
    i.ambientLighting * 500 + i.soundDeadening * 800 +
    (i.fireExtinguisher ? 300 : 0) + (i.racingHarness ? 400 : 0) + (i.windowNet ? 100 : 0)
  );

  const comfortRating = clamp(
    (seat.comfort * seatMat.comfortFactor + i.soundDeadening * 0.3 +
     (i.climateControl ? 0.15 : 0) + (i.hasPremiumAudio ? 0.1 : 0)) / 1.2,
    0, 1
  );

  const luxuryRating = clamp(
    (dash.luxuryFactor * 0.3 + seatMat.comfortFactor * 0.2 + wheelMat.costFactor * 0.1 +
     i.ambientLighting * 0.15 + (i.hasNav ? 0.1 : 0) + (i.hasPremiumAudio ? 0.1 : 0) +
     (i.climateControl ? 0.05 : 0)) / 1.1,
    0, 1
  );

  return { interiorWeight, interiorCost, comfortRating: Math.round(comfortRating * 100) / 100, luxuryRating: Math.round(luxuryRating * 100) / 100 };
}

// ===================================================================
// PERFORMANCE SIMULATION
// ===================================================================

function simulatePerformance(design: VehicleDesign, eng: EngineSim, aero: ReturnType<typeof simulateAero>, interior: ReturnType<typeof simulateInterior>): {
  weight: number; weightDistFront: number; cgHeight: number; topSpeed: number;
  accel0_60: number; accel0_100: number; accel100_200: number; quarterMile: number;
  quarterMileSpeed: number; halfMile: number; halfMileSpeed: number;
  brakingDist: number; lateralG: number; skidpad: number; slalomSpeed: number;
  vehicleCost: number; totalCost: number; targetPrice: number; profitMargin: number;
  safetyRating: number; marketRating: number; drivability: number; coolingMargin: number;
  nvh: number; noise: number; emissions: number; fuelEconomy: number;
  costBreakdown: { materials: number; labor: number; tooling: number; assembly: number; warranty: number; overhead: number };
} {
  const v = design.vehicle;
  const m = design.manufacturing;
  const platform = PLATFORMS[v.platform];
  const chassis = CHASSIS_TYPES[v.chassis];
  const tire = TIRE_COMPOUNDS[v.tireCompound];
  const trans = TRANSMISSION_TYPES[v.transmission];

  const bodyWeight = platform.weightBase * chassis.weightFactor;
  const ext = v.exterior;
  const bodyType = BODY_TYPES[ext.bodyType];
  const kit = BODY_KITS[ext.bodyKit];
  const spoiler = SPOILER_TYPES[ext.spoilerType];
  const roofScoop = ROOF_SCOOPS[ext.roofScoop];
  const headlight = HEADLIGHT_TYPES[ext.headlightType];
  const taillight = TAILLIGHT_TYPES[ext.taillightType];
  const mirror = MIRROR_TYPES[ext.mirrorType];
  const rimDesign = RIM_DESIGNS[ext.rimDesign];
  const rimFinish = RIM_FINISHES[ext.rimFinish];

  const exteriorWeight =
    bodyType.weightDelta + kit.weightDelta + spoiler.weight + roofScoop.weight +
    headlight.weight + taillight.weight + mirror.weight * 2 +
    (ext.hoodScoop ? 3 : 0) + (ext.sideSkirts ? 5 : 0) + (ext.splitter ? 4 : 0) +
    (ext.fenderVents ? 1 : 0) + (ext.towHook ? 0.5 : 0) +
    // wheel weight scales with diameter & width vs base 19x10.5
    (ext.rimDiameter * ext.rimWidth * 1.8 - 19 * 10.5 * 1.8) * rimDesign.weightFactor * rimFinish.weightFactor;

  const aeroWeight = aero.aeroWeight;
  const power = eng.combinedPower;

  const weight = bodyWeight + exteriorWeight + eng.engineWeight + aeroWeight + interior.interiorWeight + v.ballast;

  // Weight distribution
  const enginePosBias = eng.isElectric ? 0.5 : 0.42; // mid-engine default
  let weightDistFront = enginePosBias + v.ballastPositionX * 0.05;
  if (eng.isElectric && v.electronics.ecuMap === "eco") weightDistFront = 0.5;
  weightDistFront = clamp(weightDistFront, 0.35, 0.65);

  // CG height
  const cgHeight = clamp(
    350 + (v.rideHeight - 100) * 2 - chassis.rigidityFactor * 50 + v.ballastPositionZ * 50,
    200, 600
  );

  // Tire pressure deviation from optimal (~2.5 bar) affects grip
  const pressureOpt = 2.5;
  const pressureFactor = clamp(1 - Math.abs(v.tirePressure - pressureOpt) * 0.15, 0.7, 1.05);

  // Differential affects launch traction (0-60) — locked/LSD put power down better
  const diffFactor =
    v.diffType === "locked" ? 1.08 :
    v.diffType === "active" ? 1.06 :
    v.diffType === "torsen" ? 1.04 :
    v.diffType === "lsd" ? 1.03 :
    v.diffType === "open" ? 0.95 : 1.0;
  const diffPreloadFactor = 1 + v.diffPreload * 0.04;

  // Launch control improves 0-60 by managing wheelspin
  const launchFactor = v.electronics.launchControl ? 0.92 : 1.0;
  // Traction control helps put power down on high-power cars
  const tcFactor = 1 - v.electronics.tractionControl * 0.08;

  // Top speed — solve P = aeroCoeff * v³ + rollForce * v iteratively
  const aeroCoeff = 0.5 * RHO_AIR * aero.frontalArea * aero.dragCoeff;
  const rollForce = tire.rollingResistance * weight * GRAVITY * 0.013;
  const wheelPowerW = power * 745.7 * trans.efficiency; // hp → watts
  // Final drive affects achievable top speed — too short lowers vMax, too tall bogs
  const fdOpt = 3.7;
  const finalDriveFactor = clamp(1 - Math.abs(v.finalDrive - fdOpt) * 0.03, 0.85, 1.05);
  let topSpeedMs = Math.pow(wheelPowerW / Math.max(aeroCoeff, 1e-6), 1 / 3); // aero-only estimate
  for (let i = 0; i < 6; i++) {
    topSpeedMs = Math.pow((wheelPowerW - rollForce * topSpeedMs) / Math.max(aeroCoeff, 1e-6), 1 / 3);
    if (!isFinite(topSpeedMs) || topSpeedMs < 0) { topSpeedMs = Math.pow(wheelPowerW / Math.max(aeroCoeff, 1e-6), 1 / 3); break; }
  }
  const topSpeed = Math.min(Math.round(topSpeedMs * 3.6 * finalDriveFactor), 400);

  // Acceleration — traction-limited at low speed
  const powerToWeight = power / (weight / 1000);
  // Traction limit: max accel limited by tire grip × diff × pressure
  const tractionLimit = tire.gripFactor * diffFactor * diffPreloadFactor * pressureFactor;
  const tractionLimited0_60 = clamp(5.5 / (powerToWeight / 300) * launchFactor * tcFactor, 1.8, 10);
  // High power-to-weight cars are traction-limited, not power-limited
  const tractionFloor = clamp(3.5 / tractionLimit, 1.8, 10);
  const accel0_60 = Math.round(Math.max(tractionLimited0_60, tractionFloor) * 100) / 100;
  const accel0_100 = Math.round(clamp(6 / (powerToWeight / 300) * tcFactor, 2.0, 12) * 100) / 100;
  const accel100_200 = Math.round(clamp(15 / (powerToWeight / 300), 4, 40) * 100) / 100;

  // Quarter mile — gear count affects shift time penalty
  const shiftPenalty = Math.max(0, (7 - v.gearCount)) * 0.05;
  const quarterMile = Math.round(clamp(15 / Math.pow(powerToWeight / 300, 0.5) + shiftPenalty, 8, 20) * 100) / 100;
  const quarterMileSpeed = Math.round(clamp(120 + powerToWeight * 0.3, 100, 350));

  // Half mile — longer distance rewards top-end power and aero
  const halfMile = Math.round(clamp(24 / Math.pow(powerToWeight / 300, 0.45) * (1 + aero.dragCoeff * 0.15), 13, 32) * 100) / 100;
  const halfMileSpeed = Math.round(clamp(quarterMileSpeed * 1.18, 120, 380));

  // Braking — brake bias affects balance; optimal ~0.62 front
  const biasOpt = 0.62;
  const biasFactor = clamp(1 - Math.abs(v.brakeBias - biasOpt) * 0.3, 0.8, 1.05);
  const brakeForce = v.brakeDiscSize * 0.8 * (0.5 + v.brakePadCompound * 0.5) * (v.electronics.abs ? 1.15 : 1) * biasFactor;
  const brakingDist = Math.round(clamp(10000 / brakeForce * (weight / 1000), 28, 80));

  // Lateral G — suspension tuning affects mechanical grip
  const susAvg = (SUSPENSION_TYPES[v.suspensionFront].gripFactor + SUSPENSION_TYPES[v.suspensionRear].gripFactor) / 2;
  // Spring rate: stiffer = better response but too stiff loses grip on bumps. Optimal ~170 N/mm
  const springAvg = (v.springRateF + v.springRateR) / 2;
  const springFactor = clamp(1 - Math.abs(springAvg - 170) * 0.0008, 0.85, 1.08);
  // Damper: moderate damping optimal (~0.5)
  const damperAvg = (v.damperF + v.damperR) / 2;
  const damperFactor = clamp(1 - Math.abs(damperAvg - 0.5) * 0.2, 0.85, 1.05);
  // Camber: slight negative optimal (~-2.5°)
  const camberAvg = (v.camberF + v.camberR) / 2;
  const camberFactor = clamp(1 - Math.abs(camberAvg - (-2.5)) * 0.03, 0.85, 1.05);
  // Anti-roll bar: moderate optimal (~0.5)
  const arbAvg = (v.antiRollBarF + v.antiRollBarR) / 2;
  const arbFactor = clamp(1 - Math.abs(arbAvg - 0.5) * 0.15, 0.88, 1.05);
  const mechanicalGrip = tire.gripFactor * susAvg * springFactor * damperFactor * camberFactor * arbFactor * pressureFactor;
  const aeroG = aero.downforce / (weight * GRAVITY) * tire.gripFactor;
  const lateralG = Math.round(clamp(mechanicalGrip + aeroG, 0.6, 3.5) * 100) / 100;
  const skidpad = Math.round((2 * 30 / (lateralG * GRAVITY)) * 100) / 100;

  // Slalom — rewards quick transitions, suspension stiffness, low CG, narrow track
  const slalomSpeed = Math.round(clamp(
    60 + lateralG * 18 - cgHeight * 0.03 + susAvg * 8 - aero.dragCoeff * 12 +
    damperFactor * 4 + arbFactor * 3,
    45, 85
  ));

  // ---- Cost breakdown (Phase 8) ----
  const frameMat = FRAME_MATERIALS[m.frameMaterial];
  const bodyMat = FRAME_MATERIALS[m.bodyMaterial];
  const process = MANUFACTURING_PROCESSES[m.process];
  const factory = FACTORY_TIERS[m.factoryTier];
  const automation = AUTOMATION_LEVELS[m.automation];
  const qc = QC_LEVELS[m.qcLevel];
  const assembly = ASSEMBLY_LINES[m.assemblyLine];

  const chassisWeight = bodyWeight + aeroWeight;
  const materialCost = Math.round(
    chassisWeight * (frameMat.costPerKg * 0.6 + bodyMat.costPerKg * 0.4) +
    eng.engineCost * 0.35 + interior.interiorCost * 0.4 + aero.aeroCost * 0.3
  );
  const laborCost = Math.round(process.laborHours * 45 * (1 - automation.efficiency * 0.4) * (4 - m.shiftCount) / 3);
  const toolingCost = Math.round(factory.setupCost / Math.max(m.productionVolume, 1) * 0.15 + automation.capexPerStation * 20 / Math.max(m.productionVolume, 1));
  const assemblyCost = Math.round(process.laborHours * 0.4 * assembly.efficiency * 35);
  const warrantyCost = Math.round((1 - qc.defectCatchRate) * 12000 + (5 - perf_safetyBase(v, chassis)) * 1500);
  const overheadCost = Math.round(factory.overheadRate * 1000 + qc.costFactor * 800);

  const manufacturingCost = materialCost + laborCost + toolingCost + assemblyCost + warrantyCost + overheadCost;

  const vehicleCost = Math.round(
    platform.costFactor * 5000 + aero.aeroCost + interior.interiorCost +
    trans.costFactor * 2000 + v.brakeDiscSize * 20 +
    v.wheelDiameter * v.wheelWidth * 50
  );
  const totalCost = vehicleCost + eng.engineCost + manufacturingCost;
  const targetPrice = Math.round(totalCost * (1.2 + platform.costFactor * 0.15));
  const profitMargin = (targetPrice - totalCost) / targetPrice;

  // Ratings
  const safetyRating = Math.round(clamp(
    chassis.safetyFactor * 0.4 + (v.electronics.abs ? 0.3 : 0) +
    (v.electronics.stabilityControl > 0.3 ? 0.2 : 0) + ROLL_CAGES[v.interior.rollCage].safetyFactor * 0.2,
    1, 5
  ) * 10) / 10;
  const marketRating = Math.round(clamp(
    (eng.combinedPower / 500) * 0.3 + (lateralG / 2) * 0.2 + interior.luxuryRating * 0.3 +
    (v.electronics.abs ? 0.1 : 0) + 1,
    1, 5
  ) * 10) / 10;
  const drivability = Math.round(clamp(
    eng.nvhEngine * 0.2 + interior.comfortRating * 0.3 + (v.electronics.tractionControl > 0.3 ? 0.2 : 0) +
    (v.electronics.abs ? 0.15 : 0) + 0.15,
    0, 1
  ) * 100) / 100;

  const coolingMargin = clamp(aero.coolingEfficiency - eng.knockRisk * 0.3, 0.1, 0.95);
  const nvh = clamp(eng.nvhEngine * 0.5 + interior.comfortRating * 0.3 + v.interior.soundDeadening * 0.2, 0, 1);
  const noise = Math.round(clamp(70 + eng.combinedPower / 30 - v.interior.soundDeadening * 20, 40, 120));
  const emissions = eng.isElectric ? 0 : eng.emissionsEngine;
  const fuelEconomy = eng.isElectric ? 0 : eng.fuelEconomyEngine;

  return {
    weight: Math.round(weight), weightDistFront, cgHeight: Math.round(cgHeight), topSpeed,
    accel0_60, accel0_100, accel100_200, quarterMile, quarterMileSpeed, halfMile, halfMileSpeed,
    brakingDist, lateralG, skidpad, slalomSpeed,
    vehicleCost, totalCost, targetPrice, profitMargin,
    safetyRating, marketRating, drivability, coolingMargin, nvh, noise, emissions, fuelEconomy,
    costBreakdown: { materials: materialCost, labor: laborCost, tooling: toolingCost, assembly: assemblyCost, warranty: warrantyCost, overhead: overheadCost },
  };
}

function perf_safetyBase(v: VehicleConfig, chassis: typeof CHASSIS_TYPES[VehicleConfig["chassis"]]): number {
  return clamp(chassis.safetyFactor * 0.4 + (v.electronics.abs ? 0.3 : 0) + (v.electronics.stabilityControl > 0.3 ? 0.2 : 0), 1, 5);
}

// ===================================================================
// MANUFACTURING SIMULATION (Phase 7)
// ===================================================================

export function simulateManufacturing(design: VehicleDesign, perf: ReturnType<typeof simulatePerformance>) {
  const m = design.manufacturing;
  const process = MANUFACTURING_PROCESSES[m.process];
  const automation = AUTOMATION_LEVELS[m.automation];
  const qc = QC_LEVELS[m.qcLevel];
  const assembly = ASSEMBLY_LINES[m.assemblyLine];

  const productionTime = Math.round(process.laborHours / (1 + automation.efficiency * 0.5) / assembly.efficiency * 10) / 10;
  const annualHours = productionTime * m.productionVolume;
  const qualityScore = Math.round(clamp(
    40 + qc.defectCatchRate * 40 + automation.errorReduction * 15 + (assembly.efficiency * 10),
    0, 100
  ));
  const defectRate = Math.round(clamp(
    process.defectRate * (1 - automation.errorReduction) * (1 - qc.defectCatchRate * 0.5) * 100,
    0, 1000
  )) / 100;
  const automationScore = Math.round(automation.efficiency * 100);

  return {
    productionTime,
    productionTimePerYear: Math.round(annualHours),
    qualityScore,
    defectRate,
    automationScore,
    laborCost: perf.costBreakdown.labor,
    toolingCost: perf.costBreakdown.tooling,
    materialCost: perf.costBreakdown.materials,
    warrantyCost: perf.costBreakdown.warranty,
    assemblyCost: perf.costBreakdown.assembly,
    overheadCost: perf.costBreakdown.overhead,
    unitCost: perf.costBreakdown.materials + perf.costBreakdown.labor + perf.costBreakdown.tooling + perf.costBreakdown.assembly + perf.costBreakdown.warranty + perf.costBreakdown.overhead,
  };
}

// ===================================================================
// TESTING SIMULATION (Phase 10)
// ===================================================================

export function simulateTesting(design: VehicleDesign, _eng: EngineSim, aero: ReturnType<typeof simulateAero>, perf: ReturnType<typeof simulatePerformance>) {
  const v = design.vehicle;
  const chassis = CHASSIS_TYPES[v.chassis];
  const tire = TIRE_COMPOUNDS[v.tireCompound];
  const susAvg = (SUSPENSION_TYPES[v.suspensionFront].gripFactor + SUSPENSION_TYPES[v.suspensionRear].gripFactor) / 2;

  // Wind tunnel
  const liftDragRatio = Math.round((aero.downforce / (aero.dragCoeff * 1000 + 1)) * 100) / 100;
  const aeroEfficiency = Math.round(clamp(aero.downforce / (aero.dragCoeff * 500 + 1) / 10, 0, 100));
  const balanceScore = Math.round(clamp(50 + (0.5 - Math.abs(aero.aeroBalance - 0.5)) * 100, 0, 100));
  const coolingFlow = Math.round(aero.coolingEfficiency * 100);

  // Crash test
  const frameMat = FRAME_MATERIALS[design.manufacturing.frameMaterial];
  const frontalScore = Math.round(clamp(chassis.safetyFactor * 40 + frameMat.strengthFactor * 30 + ROLL_CAGES[v.interior.rollCage].safetyFactor * 30, 0, 100));
  const sideScore = Math.round(clamp(chassis.safetyFactor * 35 + frameMat.strengthFactor * 25 + (v.electronics.stabilityControl > 0.3 ? 20 : 0) + 20, 0, 100));
  const rolloverScore = Math.round(clamp(chassis.safetyFactor * 30 + (perf.cgHeight < 350 ? 30 : 10) + ROLL_CAGES[v.interior.rollCage].safetyFactor * 40, 0, 100));
  const overall = Math.round((frontalScore + sideScore + rolloverScore) / 3);
  const starRating = Math.round(overall / 20);

  // Brake test
  const stopDist60_0 = Math.round(perf.brakingDist * 0.6);
  const stopDist100_0 = Math.round(perf.brakingDist);
  const fadeResistance = Math.round(clamp(v.brakeDiscSize * 3 + v.brakePadCompound * 30, 0, 100));
  const consistency = Math.round(clamp(70 + (v.electronics.abs ? 20 : 0) + v.brakePadCompound * 10, 0, 100));

  // Skidpad
  const maxLateralG = perf.lateralG;
  const balance = Math.round(clamp(50 + (0.5 - Math.abs(perf.weightDistFront - 0.5)) * 100, 0, 100));
  const gripScore = Math.round(clamp(tire.gripFactor * susAvg * 50, 0, 100));

  // Slalom
  const maxSpeed = perf.slalomSpeed;
  const transitionTime = Math.round(clamp(2.5 - susAvg * 0.8 - (perf.cgHeight < 350 ? 0.3 : 0), 0.8, 3) * 100) / 100;
  const stability = Math.round(clamp(60 + susAvg * 20 - perf.cgHeight * 0.05 + (v.electronics.stabilityControl > 0.3 ? 10 : 0), 0, 100));

  return {
    windTunnel: { liftDragRatio, aeroEfficiency, balanceScore, coolingFlow },
    crashTest: { frontalScore, sideScore, rolloverScore, overall, starRating },
    brakeTest: { stopDist60_0, stopDist100_0, fadeResistance, consistency },
    skidpadTest: { maxLateralG, balance, gripScore },
    slalomTest: { maxSpeed, transitionTime, stability },
  };
}

// ===================================================================
// LAP TIME SIMULATION
// ===================================================================

export function simulateLapTimes(design: VehicleDesign, aero: ReturnType<typeof simulateAero>, perf: ReturnType<typeof simulatePerformance>) {
  const v = design.vehicle;
  const tire = TIRE_COMPOUNDS[v.tireCompound];
  const susAvg = (SUSPENSION_TYPES[v.suspensionFront].gripFactor + SUSPENSION_TYPES[v.suspensionRear].gripFactor) / 2;
  const trans = TRANSMISSION_TYPES[v.transmission];
  const trackIds = Object.keys(TRACKS) as TrackId[];

  const lapTimes = trackIds.map((id) => {
    const track = TRACKS[id];
    let total = 0;
    let topSpeedLap = 0;

    for (const seg of track.segments) {
      if (seg.type === "straight") {
        const target = Math.min(perf.topSpeed, perf.topSpeed * (0.6 + 0.4 * clamp(seg.length / 1000, 0.1, 1)));
        const avg = target * 0.72 * trans.efficiency;
        total += (seg.length / 1000) / (avg / 3.6) * 3600;
        topSpeedLap = Math.max(topSpeedLap, target);
      } else {
        const radius = seg.length;
        const aeroG = aero.downforce / (perf.weight * GRAVITY) * tire.gripFactor * (track.highSpeed ? 1 : 0.7);
        const latG = clamp(tire.gripFactor * susAvg + aeroG, 0.6, 3.5);
        const vMax = Math.sqrt(latG * GRAVITY * radius);
        const arcDist = (seg.arc / 360) * 2 * Math.PI * radius;
        total += arcDist / vMax;
      }
    }

    return {
      trackId: id, trackName: track.name, time: Math.round(total * 1000) / 1000,
      topSpeed: Math.round(topSpeedLap), avgSpeed: Math.round((track.length / (total / 3600)) * 10) / 10,
    };
  });

  return { lapTimes, bestLapTrack: lapTimes.reduce((a, b) => a.time < b.time ? a : b).trackId, bestLapTime: lapTimes.reduce((a, b) => a.time < b.time ? a : b).time };
}

// ===================================================================
// INFOTAINMENT & AI
// ===================================================================

// Helper: sum a ModuleStats into running totals
function addModule(m: ModuleStats, acc: { cost: number; weight: number; power: number; luxury: number; tech: number; reliability: number; assembly: number }) {
  acc.cost += m.cost;
  acc.weight += m.weight;
  acc.power += m.power;
  acc.luxury += m.luxury;
  acc.tech += m.tech;
  acc.reliability += m.reliability;
  acc.assembly += m.assembly;
}

function simulateInfotainment(info: InfotainmentConfig): InfotainmentSim {
  const acc = { cost: 0, weight: 0, power: 0, luxury: 0, tech: 0, reliability: 0, assembly: 0 };
  let softwareCost = 0;
  let heat = 0;
  let wiringComplexity = 0;
  let cyberRisk = 0;
  let safetyBonus = 0;

  // 1. Instrument Cluster
  addModule(CLUSTER_LEVELS[info.clusterLevel], acc);

  // 2. Infotainment Screen (display + tech)
  const screen = INFOTAINMENT_SCREENS.find((s) => s.value === info.displayConfig) ?? INFOTAINMENT_SCREENS[0];
  const screenTech = SCREEN_TECH_OPTIONS.find((t) => t.value === info.displayTech) ?? SCREEN_TECH_OPTIONS[0];
  acc.cost += screen.cost * screenTech.costFactor;
  acc.weight += screen.weight;
  acc.power += screen.power;
  acc.luxury += screen.luxury + screenTech.luxury;
  heat += (screen.power / 80) * 0.3;
  if (info.displayConfig !== "none") wiringComplexity += 0.1;

  // 3. Operating System
  const os = INFO_OS_TIERS[info.osTier];
  acc.cost += os.hwCost;
  softwareCost += os.swCost;
  const bootTime = os.bootTime;
  acc.tech += os.tech;
  acc.reliability += (os.reliability - 0.9); // normalize around 0.9 baseline
  if (info.otaUpdates) { softwareCost += INFO_FEATURE_COSTS.otaUpdates.swCost; acc.tech += 0.05; cyberRisk += 0.05; }
  if (info.appStore) { softwareCost += INFO_FEATURE_COSTS.appStore.swCost; acc.tech += 0.1; cyberRisk += 0.08; }
  if (info.multiUser) { softwareCost += INFO_FEATURE_COSTS.multiUser.swCost; acc.tech += 0.05; cyberRisk += 0.03; }
  if (info.cloudBackup) { softwareCost += INFO_FEATURE_COSTS.cloudBackup.swCost; acc.tech += 0.05; cyberRisk += 0.1; }
  if (info.splitScreen) { acc.cost += INFO_FEATURE_COSTS.splitScreen.hwCost; softwareCost += INFO_FEATURE_COSTS.splitScreen.swCost; acc.power += 4; acc.tech += 0.08; }
  if (info.aiChatbot) { softwareCost += 800; acc.tech += 0.1; cyberRisk += 0.05; }

  // 3b. Voice assistant
  const voice = INFO_VOICE_LEVELS[info.voiceLevel];
  softwareCost += voice.swCost;
  acc.tech = Math.max(acc.tech, voice.tech);
  const voiceAccuracy = voice.accuracy;

  // 3c. AI personal assistant (existing)
  const aiKeys = ["driverRecognition", "faceRecognition", "voiceRecognition", "moodDetection",
    "calendarSync", "emailSummary", "smartReminders", "predictiveNav", "drivingCoach",
    "vehicleDiagnostics", "serviceAdvisor", "chargingPlanner", "fuelStopPlanner", "smartParking"] as const;
  for (const k of aiKeys) {
    if (info.aiPersonal[k]) { acc.cost += INFO_FEATURE_COSTS[k].hwCost; softwareCost += INFO_FEATURE_COSTS[k].swCost; acc.power += INFO_FEATURE_COSTS[k].power; acc.tech += INFO_FEATURE_COSTS[k].tech; cyberRisk += INFO_FEATURE_COSTS[k].cyber; }
  }
  if (info.smartCabin) { acc.cost += INFO_FEATURE_COSTS.smartCabin.hwCost; softwareCost += INFO_FEATURE_COSTS.smartCabin.swCost; acc.power += 6; acc.tech += 0.15; }

  // 4. Connectivity tier (new) + extras
  addModule(CONNECTIVITY_TIERS[info.connectivityTier], acc);
  for (const ex of CONNECTIVITY_EXTRAS) {
    if ((info.connExtras as Record<string, boolean>)[ex.key]) { acc.cost += ex.cost; acc.power += ex.power; acc.tech += ex.tech; }
  }
  // Legacy connectivity mapping for cyber risk
  const connMap: Record<string, number> = { none: 0, wifi_4g: 0.3, wifi_5g: 0.45, satellite: 0.55 };
  cyberRisk += connMap[info.connectivity] ?? 0;
  if (info.connectivityTier === "premium") cyberRisk += 0.1;
  if (info.v2v) { acc.cost += INFO_FEATURE_COSTS.v2v.hwCost; softwareCost += INFO_FEATURE_COSTS.v2v.swCost; acc.power += 5; acc.tech += 0.12; cyberRisk += 0.15; }
  if (info.v2i) { acc.cost += INFO_FEATURE_COSTS.v2i.hwCost; softwareCost += INFO_FEATURE_COSTS.v2i.swCost; acc.power += 4; acc.tech += 0.1; cyberRisk += 0.12; }
  if (info.cloudSync) { softwareCost += INFO_FEATURE_COSTS.cloudSync.swCost; acc.power += 2; acc.tech += 0.08; cyberRisk += 0.1; }

  // 5. Audio Systems
  addModule(AUDIO_TIERS[info.audioTier], acc);
  heat += (AUDIO_TIERS[info.audioTier].power / 800) * 0.15;

  // 6. Climate Control
  addModule(CLIMATE_TIERS[info.climateTier], acc);
  for (const ex of CLIMATE_EXTRAS) {
    if ((info.climateExtras as Record<string, boolean>)[ex.key]) { acc.cost += ex.cost; acc.power += ex.power; acc.luxury += ex.luxury; }
  }

  // 7. Seats
  addModule(SEAT_TIERS[info.seatTier], acc);
  for (const sf of SEAT_FEATURES) {
    if ((info.seatFeatures as Record<string, boolean>)[sf.key]) { acc.cost += sf.cost; acc.power += sf.power; acc.luxury += sf.luxury; }
  }

  // 8. Interior Lighting
  addModule(LIGHTING_TIERS[info.lightingTier], acc);
  const lightHw = Math.round((info.ambientLightColors / 256) * 220) + (info.ambientLightColors > 1 ? 60 : 0);
  acc.cost += lightHw;
  acc.tech += (info.ambientLightColors / 256) * 0.08;
  if (info.dynamicLighting) { acc.cost += 120; acc.power += 4; acc.tech += 0.06; }
  if (info.musicSyncLighting) { acc.cost += 80; acc.power += 3; acc.tech += 0.06; }
  if (info.welcomeShow) { acc.cost += 60; acc.power += 2; acc.tech += 0.05; }
  if (info.goodbyeAnimation) { acc.cost += 40; acc.power += 1; acc.tech += 0.04; }
  if (info.personalizedStartup) { softwareCost += 220; acc.power += 1; acc.tech += 0.05; }

  // 9. Driver Assistance (ADAS)
  addModule(ADAS_LEVELS[info.adasLevel], acc);
  safetyBonus += (info.adasLevel / 5) * 0.15;

  // 10. Parking Systems
  for (const pf of PARKING_FEATURES) {
    if ((info.parking as Record<string, boolean>)[pf.key]) { acc.cost += pf.cost; acc.power += pf.power; acc.tech += pf.tech; safetyBonus += 0.01; }
  }

  // 11. Keys
  addModule(KEY_TYPES[info.keyType], acc);

  // 12. HUD
  addModule(HUD_TYPES[info.hudType], acc);

  // 13. Interior Materials (Dashboard)
  addModule(DASH_MATERIALS[info.dashMaterial], acc);

  // 14. Roof
  addModule(ROOF_TYPES[info.roofType], acc);

  // 15. Convenience Features
  for (const cf of CONVENIENCE_FEATURES) {
    if ((info.convenience as Record<string, boolean>)[cf.key]) { acc.cost += cf.cost; acc.power += cf.power; acc.luxury += cf.luxury; }
  }

  // 16. Luxury Package
  for (const lp of LUXURY_PACKAGE) {
    if ((info.luxuryPackage as Record<string, boolean>)[lp.key]) { acc.cost += lp.cost; acc.weight += lp.weight; acc.power += lp.power; acc.luxury += lp.luxury; }
  }

  // 17. AI Features
  for (const af of AI_FEATURES) {
    if ((info.aiFeatures as Record<string, boolean>)[af.key]) { acc.cost += af.cost; acc.power += af.power; acc.tech += af.tech; acc.luxury += af.luxury; }
  }

  // 18. Safety Electronics
  for (const se of SAFETY_ELECTRONICS) {
    if ((info.safetyElectronics as Record<string, boolean>)[se.key]) { acc.cost += se.cost; acc.power += se.power; acc.tech += se.tech; safetyBonus += se.safety; }
  }

  // Existing: nav, entertainment, smartphone, AI safety, remote app, productivity, AI security
  const nav = INFO_NAV_TIERS[info.navTier];
  softwareCost += nav.swCost;
  acc.tech = Math.max(acc.tech, nav.tech);
  for (const m of info.musicStreaming) { softwareCost += INFO_MUSIC_OPTIONS.find((o) => o.value === m)?.swCost ?? 0; }
  for (const v of info.videoStreaming) { softwareCost += INFO_VIDEO_OPTIONS.find((o) => o.value === v)?.swCost ?? 0; }
  for (const g of info.gaming) { softwareCost += INFO_GAMING_OPTIONS.find((o) => o.value === g)?.swCost ?? 0; }
  if (info.androidAuto) { softwareCost += INFO_FEATURE_COSTS.androidAuto.swCost; acc.tech += 0.04; cyberRisk += 0.03; }
  if (info.carPlay) { softwareCost += INFO_FEATURE_COSTS.carPlay.swCost; acc.tech += 0.04; cyberRisk += 0.03; }
  if (info.wirelessCarPlay) { acc.cost += 90; softwareCost += 200; acc.tech += 0.06; }
  if (info.wirelessAndroidAuto) { acc.cost += 90; softwareCost += 200; acc.tech += 0.06; }
  if (info.nfcPairing) { acc.cost += 60; softwareCost += 120; acc.tech += 0.04; }
  if (info.phoneKey) { acc.cost += 180; softwareCost += 500; acc.tech += 0.1; cyberRisk += 0.12; }
  if (info.smartwatchControl) { softwareCost += 300; acc.tech += 0.06; }
  const aisKeys = ["fatigueMonitor", "eyeTracking", "cabinCamera", "childDetection", "petDetection", "emergencyAssist", "autoAccidentCall", "healthEmergency"] as const;
  for (const k of aisKeys) { if (info.aiSafety[k]) { acc.cost += INFO_AI_SAFETY_COSTS[k].hwCost; softwareCost += INFO_AI_SAFETY_COSTS[k].swCost; acc.power += INFO_AI_SAFETY_COSTS[k].power; acc.tech += INFO_AI_SAFETY_COSTS[k].tech; cyberRisk += INFO_AI_SAFETY_COSTS[k].cyber; safetyBonus += 0.02; } }
  if (info.drivingCoach) { softwareCost += 400; acc.tech += 0.08; }
  if (info.predictiveMaintenance) { acc.cost += 120; softwareCost += 700; acc.power += 3; acc.tech += 0.12; }
  if (info.performanceAdvisor) { softwareCost += 650; acc.tech += 0.1; }
  const raKeys = ["lockUnlock", "startEngine", "climateControl", "locateVehicle", "openTrunk", "windowControl", "chargeScheduling", "otaUpdates", "digitalKeySharing"] as const;
  for (const k of raKeys) { if (info.remoteApp[k]) { acc.cost += INFO_REMOTE_APP_COSTS[k].hwCost; softwareCost += INFO_REMOTE_APP_COSTS[k].swCost; acc.power += INFO_REMOTE_APP_COSTS[k].power; acc.tech += INFO_REMOTE_APP_COSTS[k].tech; cyberRisk += INFO_REMOTE_APP_COSTS[k].cyber; } }
  const prodKeys = ["videoConferencing", "calendarIntegration", "emailAssistant", "voiceNotes", "documentViewer", "aiMeetingSummaries"] as const;
  for (const k of prodKeys) { if (info.productivity[k]) { acc.cost += INFO_PRODUCTIVITY_COSTS[k].hwCost; softwareCost += INFO_PRODUCTIVITY_COSTS[k].swCost; acc.power += INFO_PRODUCTIVITY_COSTS[k].power; acc.tech += INFO_PRODUCTIVITY_COSTS[k].tech; cyberRisk += INFO_PRODUCTIVITY_COSTS[k].cyber; } }
  const secKeys = ["faceUnlock", "fingerprint", "voiceAuth", "pin", "phoneKeyAuth", "theftDetection", "remoteImmobilizer", "geofencing"] as const;
  for (const k of secKeys) { if (info.aiSecurity[k]) { acc.cost += INFO_AI_SECURITY_COSTS[k].hwCost; softwareCost += INFO_AI_SECURITY_COSTS[k].swCost; acc.power += INFO_AI_SECURITY_COSTS[k].power; acc.tech += INFO_AI_SECURITY_COSTS[k].tech; cyberRisk += INFO_AI_SECURITY_COSTS[k].cyber; } }

  // Clamp metrics
  let techScore = clamp(acc.tech, 0, 1);
  let luxuryScore = clamp(acc.luxury, 0, 1);
  cyberRisk = clamp(cyberRisk, 0, 1);
  heat = clamp(heat, 0, 1);
  safetyBonus = clamp(safetyBonus, 0, 0.5);

  // Feature count for reliability/wiring
  const featureCount =
    [info.otaUpdates, info.appStore, info.multiUser, info.cloudBackup, info.splitScreen, info.aiChatbot,
     ...Object.values(info.aiPersonal), info.smartCabin,
     info.androidAuto, info.carPlay, info.wirelessCarPlay, info.wirelessAndroidAuto,
     info.nfcPairing, info.phoneKey, info.smartwatchControl,
     ...Object.values(info.aiSafety), info.drivingCoach, info.predictiveMaintenance,
     ...Object.values(info.remoteApp), info.v2v, info.v2i, info.cloudSync,
     ...Object.values(info.aiSecurity), info.dynamicLighting, info.musicSyncLighting,
     info.welcomeShow, info.goodbyeAnimation, info.personalizedStartup,
     ...Object.values(info.productivity), info.performanceAdvisor,
     ...Object.values(info.connExtras), ...Object.values(info.climateExtras),
     ...Object.values(info.seatFeatures), ...Object.values(info.parking),
     ...Object.values(info.convenience), ...Object.values(info.luxuryPackage),
     ...Object.values(info.aiFeatures), ...Object.values(info.safetyElectronics),
    ].filter(Boolean).length
    + info.musicStreaming.length + info.videoStreaming.length + info.gaming.length
    + (info.clusterLevel - 1) + info.adasLevel;
  let reliability = clamp(0.95 + acc.reliability - featureCount * 0.006, 0.5, 1);
  wiringComplexity = clamp(wiringComplexity + featureCount * 0.01, 0, 1);

  // Customer satisfaction
  const bootScore = bootTime === 0 ? 0.5 : clamp(1 - bootTime / 15, 0, 1);
  const customerSatisfaction = clamp(
    techScore * 0.3 + bootScore * 0.15 + voiceAccuracy * 0.15 +
    (reliability - 0.5) * 0.4 + luxuryScore * 0.1,
    0, 1
  );

  // Derived: battery needed, maintenance, warranty, retail impact
  const batterySizeRequired = Math.max(0, acc.power / 1000 * 2); // rough kWh
  const maintenanceCost = Math.round(softwareCost * 0.02 + featureCount * 50);
  const warrantyRisk = clamp(featureCount * 0.005 + (1 - reliability) * 0.5, 0, 1);
  const retailPriceImpact = Math.round((acc.cost + softwareCost) * 1.8);

  // Trim name generation
  const trimScore = (luxuryScore * 50 + techScore * 30 + (featureCount / 80) * 20);
  const trim = generateTrimName(trimScore);

  const hardwareCost = Math.round(acc.cost);
  softwareCost = Math.round(softwareCost);
  const totalCost = hardwareCost + softwareCost;
  const weight = Math.round(acc.weight * 10) / 10;
  const powerDraw = Math.round(acc.power);

  return {
    hardwareCost, softwareCost, totalCost, weight, powerDraw,
    heatGeneration: Math.round(heat * 100) / 100,
    wiringComplexity: Math.round(wiringComplexity * 100) / 100,
    assemblyTime: Math.round(acc.assembly * 100) / 100,
    reliability: Math.round(reliability * 100) / 100,
    luxuryScore: Math.round(luxuryScore * 100) / 100,
    technologyScore: Math.round(techScore * 100) / 100,
    cybersecurityRisk: Math.round(cyberRisk * 100) / 100,
    customerSatisfaction: Math.round(customerSatisfaction * 100) / 100,
    bootTime, voiceAccuracy: Math.round(voiceAccuracy * 100) / 100,
    featureCount,
    safetyBonus: Math.round(safetyBonus * 100) / 100,
    batterySizeRequired: Math.round(batterySizeRequired * 100) / 100,
    maintenanceCost,
    warrantyRisk: Math.round(warrantyRisk * 100) / 100,
    retailPriceImpact,
    trimName: trim.name,
    trimDescription: trim.description,
    trimTier: trim.tier,
  };
}

// ===================================================================
// MAIN SIMULATE FUNCTION
// ===================================================================

export function simulate(design: VehicleDesign): SimResult {
  const eng = simulateEngine(design.engine);
  const aero = simulateAero(design.vehicle);
  const interior = simulateInterior(design.vehicle);
  const info = simulateInfotainment(design.infotainment);
  const perf = simulatePerformance(design, eng, aero, interior);
  const mfg = simulateManufacturing(design, perf);
  const testing = simulateTesting(design, eng, aero, perf);
  const { lapTimes } = simulateLapTimes(design, aero, perf);

  // Integrate infotainment into vehicle totals
  const totalCost = perf.totalCost + info.totalCost;
  const targetPrice = Math.round(totalCost * (1.2 + (perf.targetPrice / Math.max(perf.totalCost, 1) - 1.2)));
  const profitMargin = (targetPrice - totalCost) / Math.max(targetPrice, 1);
  const luxuryRating = clamp(interior.luxuryRating + info.luxuryScore * 2, 0, 10);

  // ---- Phase 1: Chassis engineering simulation ----
  const chassisSim = simulateChassis(
    design.vehicle.chassisEng,
    design.vehicle.suspensionGeo,
    design.vehicle.steeringEng,
    design.vehicle.brakesEng,
    design.vehicle.tiresEng,
    design.vehicle.wheelsEng,
    perf.weight + info.weight,
  );

  return {
    displacement: eng.displacement, cylinderCount: eng.cylinderCount,
    powerCurve: eng.powerCurve, peakPower: eng.combinedPower, peakTorque: eng.combinedTorque,
    peakPowerRpm: eng.peakPowerRpm, peakTorqueRpm: eng.peakTorqueRpm, redline: eng.redline,
    maxPistonSpeed: eng.maxPistonSpeed, thermalEfficiency: eng.thermalEfficiency,
    knockRisk: eng.knockRisk, octaneRequired: eng.octaneRequired, bsfc: eng.bsfc,
    turboLag: eng.turboLag, boostPressure: eng.boostPressure,
    engineWeight: eng.engineWeight, engineCost: eng.engineCost,
    reliability: eng.reliability, nvh: eng.nvhEngine, noise: perf.noise,
    emissions: perf.emissions, fuelEconomy: perf.fuelEconomy, coolingMargin: perf.coolingMargin,
    mguHPower: eng.mguHPower, mguKPower: eng.mguKPower, combinedPower: eng.combinedPower,
    combinedTorque: eng.combinedTorque, batteryWeight: eng.batteryWeight,
    batteryCost: eng.batteryCost, batteryEnergy: eng.batteryEnergy,
    electricRange: eng.electricRange, regenEfficiency: eng.regenEfficiency,
    isElectric: eng.isElectric, isHybrid: eng.isHybrid,
    dragCoeff: aero.dragCoeff, frontalArea: aero.frontalArea, downforce: aero.downforce,
    liftCoeff: aero.liftCoeff, centerOfPressure: aero.centerOfPressure, aeroBalance: aero.aeroBalance,
    dragVsSpeed: aero.dragVsSpeed, aeroCost: aero.aeroCost, aeroWeight: aero.aeroWeight,
    coolingEfficiency: aero.coolingEfficiency,
    frontDownforce: aero.frontDownforce, rearDownforce: aero.rearDownforce,
    groundEffect: aero.groundEffect, separationRisk: aero.separationRisk,
    brakeCooling: aero.brakeCooling, aeroNoise: aero.aeroNoise,
    weight: perf.weight + info.weight, weightDistFront: perf.weightDistFront, cgHeight: perf.cgHeight,
    topSpeed: perf.topSpeed, accel0_60: perf.accel0_60, accel0_100: perf.accel0_100,
    accel100_200: perf.accel100_200, quarterMile: perf.quarterMile, quarterMileSpeed: perf.quarterMileSpeed,
    halfMile: perf.halfMile, halfMileSpeed: perf.halfMileSpeed,
    brakingDist: perf.brakingDist, lateralG: perf.lateralG, skidpad: perf.skidpad, slalomSpeed: perf.slalomSpeed,
    vehicleCost: perf.vehicleCost + info.totalCost, totalCost, targetPrice,
    profitMargin, safetyRating: clamp(perf.safetyRating + info.safetyBonus * 2, 0, 10), marketRating: perf.marketRating,
    drivability: perf.drivability,
    costBreakdown: perf.costBreakdown,
    manufacturing: mfg,
    testing,
    interiorWeight: interior.interiorWeight + info.weight, interiorCost: interior.interiorCost + info.totalCost,
    comfortRating: interior.comfortRating, luxuryRating,
    infotainment: info,
    chassisSim,
    lapTimes,
  };
}
