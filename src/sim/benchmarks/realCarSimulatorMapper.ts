import { RealCarSpec } from './realWorldSportsCar100Dataset';
import { MasterVehicleState, UnifiedVehiclePerformanceMetrics } from '../masterVehicleState/masterVehicleTypes';

// ============================================================================
// REAL CAR → MASTER VEHICLE STATE MAPPER
// ============================================================================
// Converts a verified real-world RealCarSpec into a MasterVehicleState that
// reproduces the car's published performance when solved by the analytical
// MasterVehicleStateEngine and the discrete CircuitLapTimeSimulator.
//
// Calibration notes:
// - Engine displacement is back-solved so the engine's aspiration formulas
//   output exactly the manufacturer peak HP.
// - Subsystem masses are balanced so totalCurbMassKg === curbWeightKg exactly.
// - Measured Cd·A, downforce@200, CoG height and front weight distribution are
//   passed as declarations that override the parametric solvers.
// ============================================================================

/** Back-solve displacement so aspiration formula output == real peak HP. */
function calibrateDisplacement(car: RealCarSpec): number {
  if (car.engineLayout.includes('Electric')) return 0;
  const hp = car.peakHp;
  const boost = 1.2;
  const hpPerLiter = car.aspiration === 'NA' ? 98
    : car.aspiration === 'Supercharged' ? 125 * (1 + boost * 0.75)
    : car.aspiration === 'Quad_Turbo' ? 180 * (1 + boost * 0.95)
    : 140 * (1 + boost * 0.85); // Turbo / Twin_Turbo / Hybrid turbo variants
  return Math.round((hp / hpPerLiter) * 100) / 100;
}

type Arch = MasterVehicleState['chassis']['architecture'];

/** Choose the closest supported drivetrain architecture for a real layout. */
function pickArchitecture(car: RealCarSpec): Arch {
  if (car.drivetrain === 'FWD') return 'front_engine_fwd';
  const f = car.weightDistFrontPct;
  if (car.drivetrain === 'AWD') {
    // EV dual/tri-motor architectures
    if (car.engineLayout.startsWith('Electric')) return 'all_wheel_drive_dual_motor';
    return f <= 47 ? 'mid_engine_awd' : f <= 52 ? 'rear_engine_awd' : 'front_engine_rwd';
  }
  // RWD
  if (f <= 41) return 'rear_engine_rwd';      // Porsche 911 family
  if (f <= 47) return 'mid_engine_rwd';       // mid-engine supercars
  if (f <= 50) return 'front_mid_engine_rwd'; // front-mid GTs
  return 'front_engine_rwd';
}

function pickEngineType(car: RealCarSpec): string {
  if (car.engineLayout.includes('Electric')) return 'electric_dual_motor';
  if (car.engineLayout === 'V6') return 'v6';
  if (car.engineLayout === 'V8') return 'v8';
  if (car.engineLayout === 'V10') return 'v10';
  if (car.engineLayout.includes('V12')) return 'v12';
  if (car.engineLayout === 'I4' || car.engineLayout === 'I5') return 'i4';
  if (car.engineLayout === 'I6') return 'i6';
  if (car.engineLayout === 'Flat-4') return 'boxer4';
  if (car.engineLayout === 'Flat-6') return 'boxer6';
  if (car.engineLayout === 'Rotary') return 'rotary';
  return 'v6'; // hybrid V6 platforms
}

function pickTransmissionType(car: RealCarSpec): string {
  const t = car.transmission;
  const isEV = car.engineLayout.includes('Electric');
  if (isEV || t === 'single_speed') return 'ev_direct_drive';
  if (t.startsWith('manual')) return 'manual_6sp';
  if (t.startsWith('dual_clutch') || t === 'pdk') return 'dual_clutch_8sp';
  if (t.startsWith('torque_converter')) return 'torque_converter_8sp';
  return 'sequential_6sp';
}

function shiftTimeMsFor(car: RealCarSpec): number {
  switch (pickTransmissionType(car)) {
    case 'ev_direct_drive': return 20;
    case 'dual_clutch_8sp': return 80;
    case 'sequential_6sp': return 90;
    case 'torque_converter_8sp': return 220;
    default: return 350;
  }
}

/** Geometric gear-ratio spread typical of the car's gearbox generation. */
function buildGearRatios(car: RealCarSpec): number[] {
  const n = Math.max(1, car.gearCount);
  const first = n <= 4 ? 3.2 : n <= 6 ? 3.7 : 4.0;
  const top = n <= 4 ? 0.95 : n <= 6 ? 0.78 : 0.66;
  const ratios: number[] = [];
  for (let i = 0; i < n; i++) {
    ratios.push(+(first * Math.pow(top / first, i / (n - 1 || 1))).toFixed(3));
  }
  return ratios;
}

/** Map real body styles onto the supported VehicleBodyType union. */
function pickBodyType(car: RealCarSpec): MasterVehicleState['chassis']['bodyType'] {
  switch (car.bodyStyle) {
    case 'Roadster': return 'convertible';
    case 'Sedan': return 'sedan';
    case 'Hatchback': return 'hatchback';
    case 'GT': return 'sports_car';
    case 'Hypercar': return 'hypercar';
    case 'Prototype': return 'supercar';
    default: return 'coupe';
  }
}

export function mapRealCarToSimulatorState(car: RealCarSpec): MasterVehicleState {
  const now = new Date().toISOString();
  const isEV = car.engineLayout.includes('Electric');
  const isHybrid = car.engineLayout.startsWith('Hybrid');

  // ------------------------------------------------------------------
  // Mass budget — subsystem masses are balanced so that the solver's
  // totalCurbMassKg equals the real curb weight exactly.
  // Solver adds: bodyPanels(material table) + interior baseline(140)
  //              + electronics + safety + [six variable subsystems]
  // ------------------------------------------------------------------
  const matGrade = car.tier >= 7 && !isEV ? "carbon_composite"
    : car.tier >= 4 ? "carbon_composite"
    : car.tier >= 2 ? "extruded_aluminum" : "chromoly";
  // Must match the engines body-panel mass lookup (material -> kg)
  const bodyPanelMass = matGrade === "carbon_composite" ? 75 : matGrade === "extruded_aluminum" ? 140 : 210;
  const isTrackPrep = car.tireCompound === "racing_slick" || car.tier >= 10;
  const electronicsMass = 5;
  const safetyMass = car.tier >= 7 ? 35 : car.tier >= 3 ? 20 : 8;
  const hasDF = car.downforceAt200KmhN > 200;
  const aeroMass = hasDF ? 35 : 5;

  const remainderKg = car.curbWeightKg - bodyPanelMass - 140 - electronicsMass - safetyMass - aeroMass;
  const weights: Record<string, number> = isEV
    ? { chassis: 0.30, powertrain: 0.34, transmission: 0.05, suspension: 0.11, wheelsBrakes: 0.07, cooling: 0.13 }
    : { chassis: 0.34, powertrain: 0.22, transmission: 0.08, suspension: 0.13, wheelsBrakes: 0.09, cooling: 0.14 };
  const varMass = (key: string) => Math.max(5, Math.round(remainderKg * weights[key]));
  const chassisMass = () => {
    // absorb rounding drift into chassis so the sum is exact
    const others = (Object.keys(weights) as (keyof typeof weights)[])
      .filter(k => k !== 'chassis')
      .reduce((sum, k) => sum + varMass(k), 0);
    return Math.max(40, remainderKg - others);
  };

  const arch = pickArchitecture(car);
  const engType = pickEngineType(car);
  const tt = pickTransmissionType(car);
  const bd = car.brakeType === "carbon_ceramic" ? "carbon_ceramic_matrix"
    : car.brakeType === "carbon_race" ? "carbon_carbon_race" : "cast_iron_vented";
  const tireCompound = car.tireCompound === "street" ? "street_comfort" : car.tireCompound;
  const aspMap: Record<string, "naturally_aspirated" | "single_turbo" | "twin_turbo" | "supercharged" | "quad_turbo"> = {
    NA: "naturally_aspirated", Turbo: "single_turbo", Twin_Turbo: "twin_turbo",
    Supercharged: "supercharged", Quad_Turbo: "quad_turbo",
  };

  return {
    id: "bench-" + car.id,
    name: car.name,
    version: 1,
    createdAt: now,
    updatedAt: now,
    author: "Benchmark Mapper",
    chassis: {
      chassisId: car.id,
      bodyType: pickBodyType(car),
      architecture: arch,
      chassisType: matGrade === "carbon_composite" ? "carbon_tub" : "aluminum_spaceframe",
      wheelbaseMm: car.wheelbaseMm,
      frontTrackMm: car.frontTrackMm,
      rearTrackMm: car.rearTrackMm,
      frontOverhangMm: Math.round(car.wheelbaseMm * 0.15),
      rearOverhangMm: Math.round(car.wheelbaseMm * 0.12),
      groundClearanceMm: car.bodyStyle === "Prototype" ? 55 : isTrackPrep ? 85 : 115,
      materialGrade: matGrade as MasterVehicleState['chassis']['materialGrade'],
      torsionalRigidityKNmPerDeg:
        matGrade === "carbon_composite" ? 60 : matGrade === "extruded_aluminum" ? 36 : 22,
      massKg: chassisMass(),
      weightDistributionFrontPct: car.weightDistFrontPct,
      coGHeightMm: car.coGHeightMm,
    },
    powertrain: {
      engineType: engType as MasterVehicleState['powertrain']['engineType'],
      displacementL: calibrateDisplacement(car),
      cylinderCount: isEV ? 0 : car.cylinders,
      aspiration: isEV ? "naturally_aspirated" : aspMap[car.aspiration],
      boostBar: !isEV && car.aspiration !== "NA" ? 1.2 : 0,
      boreMm: isEV ? 0 : 84,
      strokeMm: isEV ? 0 : 82,
      compressionRatio: isEV ? 0 : car.aspiration === "NA" ? 12.5 : 9.2,
      redlineRpm: isEV ? 15000 : Math.max(4500, car.redlineRpm),
      peakPowerHp: car.peakHp,
      peakTorqueNm: car.peakTorqueNm,
      fuelType: (isEV ? "ev_800v" : "pump_93") as MasterVehicleState['powertrain']['fuelType'],
      thermalDissipationKw: Math.round(car.peakHp * 0.35),
      massKg: varMass('powertrain'),
      mountedPistons: true,
      mountedCylinderHeads: true,
      mountedTurbos: !isEV && car.aspiration !== "NA",
      mountedIntake: true,
      isHybrid: isHybrid,
    },
    transmission: {
      transmissionType: tt as MasterVehicleState['transmission']['transmissionType'],
      gearCount: Math.max(1, car.gearCount),
      gearRatios: buildGearRatios(car),
      finalDriveRatio: car.finalDriveRatio > 0 ? car.finalDriveRatio : (isEV ? 8.5 : 3.4),
      shiftTimeMs: shiftTimeMsFor(car),
      differentialType: (car.drivetrain.includes("AWD")
        ? "electronic_torque_vectoring"
        : "mechanical_lsd") as MasterVehicleState['transmission']['differentialType'],
      diffPreloadNm: 80,
      maxTorqueRatingNm: Math.round(Math.max(400, car.peakTorqueNm * 1.6)),
      massKg: varMass('transmission'),
    },
    suspension: {
      frontType: (isTrackPrep ? "pushrod" : "double_wishbone") as MasterVehicleState['suspension']['frontType'],
      rearType: (isTrackPrep ? "pushrod" : "multilink") as MasterVehicleState['suspension']['rearType'],
      frontSpringRateNmm: isTrackPrep ? 95 : 45,
      rearSpringRateNmm: isTrackPrep ? 105 : 50,
      frontDamperCompressionNsM: isTrackPrep ? 4200 : 2800,
      rearDamperCompressionNsM: isTrackPrep ? 4500 : 3000,
      frontDamperReboundNsM: isTrackPrep ? 3800 : 2400,
      rearDamperReboundNsM: isTrackPrep ? 4100 : 2600,
      frontAntiRollBarStiffnessNmDeg: isTrackPrep ? 120 : 55,
      rearAntiRollBarStiffnessNmDeg: isTrackPrep ? 110 : 50,
      camberFrontDeg: isTrackPrep ? -3.0 : -1.2,
      camberRearDeg: isTrackPrep ? -2.4 : -1.0,
      toeFrontDeg: isTrackPrep ? 0.05 : 0.15,
      toeRearDeg: isTrackPrep ? -0.1 : 0.2,
      rideHeightFrontMm: car.bodyStyle === "Prototype" ? 45 : isTrackPrep ? 78 : 110,
      rideHeightRearMm: car.bodyStyle === "Prototype" ? 55 : isTrackPrep ? 84 : 115,
      activeAeroRideHeightCompensation: car.tier >= 4 || hasDF,
      massKg: varMass('suspension'),
    },
    wheelsBrakes: {
      wheelDiameterFrontInch: car.tier >= 3 ? 20 : 18,
      wheelDiameterRearInch: car.tier >= 3 ? 21 : 19,
      wheelWidthFrontMm: Math.round(car.tireWidthFrontMm * 0.42),
      wheelWidthRearMm: Math.round(car.tireWidthRearMm * 0.42),
      tireCompound: tireCompound as MasterVehicleState['wheelsBrakes']['tireCompound'],
      tirePressureFrontPsi: 32,
      tirePressureRearPsi: 30,
      brakeDiscType: bd as MasterVehicleState['wheelsBrakes']['brakeDiscType'],
      frontDiscDiameterMm: car.tier >= 3 ? 400 : 340,
      rearDiscDiameterMm: car.tier >= 3 ? 380 : 320,
      frontCaliperPistonCount: (car.tier >= 3 ? 8 : 6) as MasterVehicleState['wheelsBrakes']['frontCaliperPistonCount'],
      rearCaliperPistonCount: (car.tier >= 3 ? 4 : 4) as MasterVehicleState['wheelsBrakes']['rearCaliperPistonCount'],
      brakeBiasFrontPercent: 58,
      absEnabled: car.year > 2010,
      massKg: varMass('wheelsBrakes'),
    },
    aero: {
      frontSplitterLengthMm: hasDF ? 150 : 40,
      frontCanardsCount: car.tier >= 7 ? 4 : hasDF ? 2 : 0,
      frontWingAngleDeg: hasDF ? 8 : 0,
      underbodyFlatFloor: car.tier >= 3,
      underbodyVenturiTunnels: hasDF,
      rearDiffuserAngleDeg: hasDF ? 14 : 6,
      rearDiffuserStrakeCount: hasDF ? 4 : 2,
      rearWingSpanMm: hasDF ? 1450 : 0,
      rearWingChordMm: hasDF ? 290 : 0,
      rearWingAngleDeg: hasDF ? 12 : 0,
      rearGurneyFlapHeightMm: hasDF ? 10 : 0,
      activeDrsEnabled: false,
      activeDrsOpenWingAngleDeg: 2,
      sidepodsCoolingAirflowLps: 25,
      totalDownforceNAt100Mph: car.downforceAt200KmhN,
      totalDragNAt100Mph: Math.round(car.dragCoefficientCd * 1800),
      aeroBalanceFrontPercent: hasDF ? 43 : 40,
      liftToDragRatio: hasDF
        ? +(car.downforceAt200KmhN / Math.max(1, car.dragCoefficientCd * 1800)).toFixed(2)
        : 0,
      topSpeedDragAreaCdA: +(car.dragCoefficientCd * car.frontalAreaM2).toFixed(4),
      declaredAeroOverride: true,
      massKg: aeroMass,
    },
    bodyPanels: {
      material: (matGrade === "carbon_composite" ? "prepreg_carbon_fiber"
        : matGrade === "extruded_aluminum" ? "aluminum_sheet" : "steel_stamping") as MasterVehicleState['bodyPanels']['material'],
      hoodStyle: (car.tier >= 3 ? "gt_twin_duct" : "flat_vented") as MasterVehicleState['bodyPanels']['hoodStyle'],
      roofStyle: (car.bodyStyle === "Roadster" ? "targa_removable" : "solid_coupe") as MasterVehicleState['bodyPanels']['roofStyle'],
      fenderWidthFrontBonusMm: 0,
      fenderWidthRearBonusMm: car.tier >= 3 ? 25 : 0,
      sideSkirtGroundSeal: car.tier >= 3,
      paintColorHex: "#1a1a2e",
      paintFinish: "gloss" as MasterVehicleState['bodyPanels']['paintFinish'],
      liveryDecals: [],
      massKg: bodyPanelMass,
    },
    cooling: {
      radiatorCoreAreaCm2: Math.round(car.peakHp * 1.2),
      radiatorThicknessMm: 42,
      oilCoolerInstalled: car.peakHp > 400,
      intercoolerType: (!isEV && (car.aspiration.includes("Turbo") || car.aspiration === "Supercharged")
        ? "water_to_air_charge_cooler" : "air_to_air") as MasterVehicleState['cooling']['intercoolerType'],
      brakeCoolingDucts: car.tier >= 3,
      transmissionCoolerInstalled: car.peakHp > 500,
      heatDissipationTotalKw: Math.round(car.peakHp * 0.4),
      massKg: varMass('cooling'),
    },
    interior: {
      seatType: (car.tier >= 7 ? "carbon_fiber_bucket_fia"
        : car.tier >= 3 ? "carbon_fiber_bucket" : "sport_bucket") as any,
      seatCount: car.bodyStyle === "Prototype" ? 1 : 2,
      dashboardMaterial: (car.tier >= 5 ? "exposed_carbon" : "alcantara_trimmed") as any,
      has6PointRacingHarness: car.tier >= 7,
      hasSeatHeating: car.tier <= 2,
      hasSeatVentilation: car.tier <= 3,
      hasPneumaticMassage: false,
      hasPassengerScreen: car.tier >= 3,
      hasRearSeatDelete: car.bodyStyle === "Roadster" || car.bodyStyle === "Hypercar" || car.bodyStyle === "Prototype",
      totalWeightKg: car.tier >= 7 ? 15 : car.tier >= 3 ? 35 : 80,
      totalCostUSD: car.tier * 5000,
    } as any,
    electronics: {
      tractionControlLevel: car.tier >= 3 ? 8 : 5,
      launchControlInstalled: car.peakHp > 350 || !!car.speedLimiterKmh,
      driveModes: ["COMFORT", "SPORT", "CORSA"],
      activeDriveMode: "SPORT",
      telemetryLoggingFrequencyHz: car.tier >= 5 ? 200 : 50,
      activeAerodynamicsController: hasDF,
      brakeByWire: car.tier >= 5,
      steerByWire: car.bodyStyle === "Hypercar" || car.bodyStyle === "Prototype",
      massKg: electronicsMass,
      topSpeedLimiterKmh: car.speedLimiterKmh ?? 0,
    },
    safety: {
      rollCageType: (car.tier >= 7 ? "full_welded_gt3_spaceframe"
        : car.tier >= 3 ? "6_point_fia_bolt_in" : "none") as MasterVehicleState['safety']['rollCageType'],
      fireSuppressionInstalled: car.tier >= 3,
      harnessType: (car.tier >= 7 ? "sabelt_6_point_f1"
        : car.tier >= 3 ? "schroth_enduro_pro" : "3_point_street_belt") as MasterVehicleState['safety']['harnessType'],
      fuelCellSafetyBladder: car.tier >= 5,
      crashStructureRating: (car.tier >= 5 ? "motorsport_fia"
        : car.tier >= 3 ? "advanced" : "reinforced") as MasterVehicleState['safety']['crashStructureRating'],
      massKg: safetyMass,
    },
    metrics: {} as UnifiedVehiclePerformanceMetrics,
    ergonomics: {} as any,
    costAndBOM: {
      chassisCapExUSD: 0, powertrainCapExUSD: 0, transmissionCapExUSD: 0,
      suspensionWheelsUSD: 0, aeroPackageUSD: 0, bodyShellUSD: 0,
      interiorCabinUSD: 0, electronicsSafetyUSD: 0, assemblyLaborHours: 0,
      assemblyLaborUSD: 0, totalManufacturingCostUSD: 0, suggestedMSRPUSD: 0,
    },
    compatibility: {
      isPhysicallyFeasible: true, totalViolations: 0, criticalErrorsCount: 0,
      warningsCount: 0, engineBayClearanceMm: { x: 0, y: 0, z: 0 },
      wheelArchClearanceMm: { front: 0, rear: 0 }, coolingAdequacyScorePercent: 100,
      transmissionTorqueSafetyFactor: 1.6, electricalLoadBalanceWatts: 0, violations: [],
    },
  };
}

/**
 * Discrete-solver parameters derived from the real spec:
 * tyre friction coefficient and reference downforce for the segment integrator.
 */
export function mapRealCarToSolverParams(car: RealCarSpec): { tireMu: number; downforceNAt200: number } {
  const tireMu =
    car.tireCompound === "racing_slick" ? 1.62 :
    car.tireCompound === "track_r_compound" ? 1.42 :
    car.tireCompound === "ultra_high_performance" ? 1.28 : 1.10;
  return { tireMu, downforceNAt200: car.downforceAt200KmhN };
}
