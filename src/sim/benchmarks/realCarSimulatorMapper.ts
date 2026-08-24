import { RealCarSpec } from './realWorldSportsCar100Dataset';
import { MasterVehicleState, UnifiedVehiclePerformanceMetrics } from '../masterVehicleState/masterVehicleTypes';

// The engine recalculates HP from displacement using its own formulas.
// We compute a "calibration displacement" so the engine outputs the real car's HP.
function calibrateDisplacement(car: RealCarSpec): number {
  if (car.engineLayout.includes('Electric')) return 0;
  const hp = car.peakHp;
  const boost = car.aspiration === 'NA' ? 0 : 1.2;
  const hpPerLiter = car.aspiration === 'NA' ? 98
    : car.aspiration === 'Supercharged' ? 125 * (1 + boost * 0.75)
    : car.aspiration === 'Quad_Turbo' ? 180 * (1 + boost * 0.95)
    : 140 * (1 + boost * 0.85); // Turbo / Twin_Turbo
  return Math.round((hp / hpPerLiter) * 100) / 100;
}

export function mapRealCarToSimulatorState(car: RealCarSpec): MasterVehicleState {
  const now = new Date().toISOString();
  const isEV = car.engineLayout.includes('Electric');
  const matGrade = car.tier >= 7 ? "carbon_composite" : car.tier >= 3 ? "extruded_aluminum" : "chromoly";
  const isTrack = car.tireCompound === "racing_slick" || car.tireCompound === "track_r_compound";
  const hasDF = car.downforceAt200KmhN > 200;
  let engType = "i4" as any;
  if (car.engineLayout.includes("V6")) engType = "v6";
  else if (car.engineLayout.includes("V8")) engType = "v8";
  else if (car.engineLayout === "V10") engType = "v10";
  else if (car.engineLayout.includes("V12")) engType = "v12";
  else if (car.engineLayout === "I6") engType = "i6";
  else if (car.engineLayout === "Flat-4") engType = "boxer4";
  else if (car.engineLayout === "Flat-6") engType = "boxer6";
  else if (car.engineLayout === "Rotary") engType = "rotary";
  else if (isEV) engType = "electric_dual_motor";
  let tt = "manual_6sp" as any;
  if (car.transmission.includes("sequential")) tt = "sequential_6sp";
  else if (car.transmission.includes("dual_clutch")) tt = "dual_clutch_7sp";
  else if (car.transmission.includes("torque_converter")) tt = "torque_converter_8sp";
  else if (car.transmission === "pdk") tt = "dual_clutch_7sp";
  else if (car.transmission === "single_speed") tt = "ev_direct_drive";
  const bd = car.brakeType === "carbon_ceramic" ? "carbon_ceramic_matrix"
    : car.brakeType === "carbon_race" ? "carbon_carbon_race" : "cast_iron_vented";
  const aspMap: Record<string, string> = {
    Twin_Turbo: "twin_turbo", Turbo: "single_turbo",
    Supercharged: "supercharged", Quad_Turbo: "quad_turbo"
  };
  const asp = isEV ? "naturally_aspirated" : aspMap[car.aspiration] || "naturally_aspirated";
  const pg = (pct: number) => Math.round(car.curbWeightKg * pct);
  const arch = car.drivetrain === "AWD" ? "mid_engine_awd"
    : car.bodyStyle === "Roadster" ? "front_mid_engine_rwd" : "front_engine_rwd";
  const calDisp = calibrateDisplacement(car);
  return {
    id: "bench-" + car.id, name: car.name, version: 1,
    createdAt: now, updatedAt: now, author: "Benchmark",
    chassis: {
      chassisId: car.id, bodyType: car.bodyStyle.toLowerCase() as any,
      architecture: arch as any,
      chassisType: matGrade === "carbon_composite" ? "carbon_monocoque" : "spaceframe",
      wheelbaseMm: car.wheelbaseMm, frontTrackMm: car.frontTrackMm,
      rearTrackMm: car.rearTrackMm,
      frontOverhangMm: Math.round(car.wheelbaseMm * 0.15),
      rearOverhangMm: Math.round(car.wheelbaseMm * 0.12),
      groundClearanceMm: car.bodyStyle === "Prototype" ? 50 : 110,
      materialGrade: matGrade as any,
      torsionalRigidityKNmPerDeg: matGrade === "carbon_composite" ? 65 : matGrade === "extruded_aluminum" ? 38 : 22,
      massKg: pg(0.25),
    } as any,
    powertrain: {
      engineType: engType, displacementL: calDisp,
      cylinderCount: isEV ? 0 : car.cylinders, aspiration: asp as any,
      boostBar: isEV ? 0 : car.aspiration === "NA" ? 0 : 1.2,
      boreMm: isEV ? 0 : 80, strokeMm: isEV ? 0 : 75,
      compressionRatio: isEV ? 0 : car.aspiration === "NA" ? 12.5 : 9.0,
      redlineRpm: isEV ? 16000 : car.redlineRpm,
      peakPowerHp: car.peakHp, peakTorqueNm: car.peakTorqueNm,
      fuelType: (isEV ? "ev_800v" : "pump_93") as any,
      thermalDissipationKw: Math.round(car.peakHp * 0.35),
      massKg: pg(isEV ? 0.40 : 0.12),
      mountedPistons: true, mountedCylinderHeads: true,
      mountedTurbos: car.aspiration !== "NA", mountedIntake: true,
    } as any,
    transmission: {
      transmissionType: tt, gearCount: car.gearCount,
      gearRatios: Array(car.gearCount).fill(0).map((_: number, i: number) => +(3.8 - i * 0.5).toFixed(2)),
      finalDriveRatio: car.finalDriveRatio,
      shiftTimeMs: car.transmission.includes("manual") ? 350 : 80,
      differentialType: (car.drivetrain === "AWD" ? "electronic_torque_vectoring" : "mechanical_lsd") as any,
      diffPreloadNm: 80, maxTorqueRatingNm: Math.round(car.peakTorqueNm * 1.5),
      massKg: pg(0.06),
    } as any,
    suspension: {
      frontType: (isTrack ? "pushrod" : "double_wishbone") as any,
      rearType: (isTrack ? "pushrod" : "multilink") as any,
      frontSpringRateNmm: isTrack ? 85 : 45, rearSpringRateNmm: isTrack ? 95 : 50,
      frontDamperCompressionNsM: isTrack ? 4200 : 2800,
      rearDamperCompressionNsM: isTrack ? 4500 : 3000,
      frontDamperReboundNsM: isTrack ? 3800 : 2400,
      rearDamperReboundNsM: isTrack ? 4100 : 2600,
      frontAntiRollBarStiffnessNmDeg: isTrack ? 120 : 55,
      rearAntiRollBarStiffnessNmDeg: isTrack ? 110 : 50,
      camberFrontDeg: isTrack ? -3.2 : -1.2, camberRearDeg: isTrack ? -2.5 : -1.0,
      toeFrontDeg: isTrack ? 0.05 : 0.15, toeRearDeg: isTrack ? -0.1 : 0.2,
      rideHeightFrontMm: car.bodyStyle === "Prototype" ? 40 : isTrack ? 75 : 110,
      rideHeightRearMm: car.bodyStyle === "Prototype" ? 50 : isTrack ? 80 : 115,
      activeAeroRideHeightCompensation: car.tier >= 4, massKg: pg(0.08),
    } as any,
    wheelsBrakes: {
      wheelDiameterFrontInch: 19, wheelDiameterRearInch: 20,
      wheelWidthFrontMm: Math.round(car.tireWidthFrontMm * 0.42),
      wheelWidthRearMm: Math.round(car.tireWidthRearMm * 0.42),
      tireCompound: car.tireCompound as any,
      tirePressureFrontPsi: 33, tirePressureRearPsi: 31,
      brakeDiscType: bd as any,
      frontDiscDiameterMm: car.tier >= 3 ? 400 : 340,
      rearDiscDiameterMm: car.tier >= 3 ? 380 : 320,
      frontCaliperPistonCount: (car.tier >= 3 ? 10 : 6) as any,
      rearCaliperPistonCount: (car.tier >= 3 ? 6 : 4) as any,
      brakeBiasFrontPercent: 58, absEnabled: car.year > 2010,
      massKg: pg(0.05),
    } as any,
    aero: {
      frontSplitterLengthMm: hasDF ? 160 : 40,
      frontCanardsCount: car.tier >= 7 ? 4 : hasDF ? 2 : 0,
      frontWingAngleDeg: hasDF ? 8 : 0,
      underbodyFlatFloor: car.tier >= 3, underbodyVenturiTunnels: car.tier >= 5,
      rearDiffuserAngleDeg: hasDF ? 15 : 5, rearDiffuserStrakeCount: hasDF ? 4 : 2,
      rearWingSpanMm: hasDF ? 1500 : 0, rearWingChordMm: hasDF ? 300 : 0,
      rearWingAngleDeg: hasDF ? 12 : 0, rearGurneyFlapHeightMm: hasDF ? 10 : 0,
      activeDrsEnabled: false, activeDrsOpenWingAngleDeg: 2,
      sidepodsCoolingAirflowLps: 25,
      totalDownforceNAt100Mph: car.downforceAt200KmhN,
      totalDragNAt100Mph: Math.round(car.dragCoefficientCd * 1800),
      aeroBalanceFrontPercent: hasDF ? 44 : 40,
      liftToDragRatio: hasDF ? car.downforceAt200KmhN / Math.max(1, car.dragCoefficientCd * 1800) : 0,
      topSpeedDragAreaCdA: car.dragCoefficientCd * car.frontalAreaM2,
      massKg: hasDF ? 35 : 5,
    } as any,
    bodyPanels: {
      material: (car.tier >= 5 ? "prepreg_carbon_fiber" : car.tier >= 3 ? "forged_carbon" : "aluminum_sheet") as any,
      hoodStyle: (car.tier >= 3 ? "gt_twin_duct" : "flat_vented") as any,
      roofStyle: (car.bodyStyle === "Roadster" ? "targa_removable" : "solid_coupe") as any,
      fenderWidthFrontBonusMm: 0, fenderWidthRearBonusMm: car.tier >= 3 ? 25 : 0,
      sideSkirtGroundSeal: car.tier >= 3, paintColorHex: "#1a1a2e",
      paintFinish: "gloss" as any, liveryDecals: [],
      massKg: car.tier >= 5 ? 75 : car.tier >= 3 ? 65 : 140,
    } as any,
    cooling: {
      radiatorCoreAreaCm2: Math.round(car.peakHp * 1.2), radiatorThicknessMm: 42,
      oilCoolerInstalled: car.peakHp > 400,
      intercoolerType: (car.aspiration.includes("Turbo") || car.aspiration === "Supercharged"
        ? "water_to_air_charge_cooler" : "air_to_air") as any,
      brakeCoolingDucts: car.tier >= 3, transmissionCoolerInstalled: car.peakHp > 500,
      heatDissipationTotalKw: Math.round(car.peakHp * 0.4), massKg: pg(0.03),
    } as any,
    interior: {
      seatType: (car.tier >= 7 ? "carbon_fiber_bucket_fia" : car.tier >= 3 ? "carbon_fiber_bucket" : "sport_bucket") as any,
      seatCount: car.bodyStyle === "Prototype" ? 1 : 2,
      dashboardMaterial: (car.tier >= 5 ? "exposed_carbon" : "alcantara_trimmed") as any,
      has6PointRacingHarness: car.tier >= 7, hasSeatHeating: car.tier <= 2,
      hasSeatVentilation: car.tier <= 3, hasPneumaticMassage: false,
      hasPassengerScreen: car.tier >= 3,
      hasRearSeatDelete: car.bodyStyle === "Roadster" || car.bodyStyle === "Hypercar" || car.bodyStyle === "Prototype",
      totalWeightKg: car.tier >= 7 ? 15 : car.tier >= 3 ? 35 : 80,
      totalCostUSD: car.tier * 5000,
    } as any,
    electronics: {
      tractionControlLevel: car.tier >= 3 ? 8 : 5,
      launchControlInstalled: car.peakHp > 400,
      driveModes: ["COMFORT", "SPORT", "CORSA"],
      activeDriveMode: "SPORT" as any,
      telemetryLoggingFrequencyHz: car.tier >= 5 ? 200 : 50,
      activeAerodynamicsController: car.tier >= 4,
      brakeByWire: car.tier >= 5,
      steerByWire: car.bodyStyle === "Hypercar" || car.bodyStyle === "Prototype",
      massKg: 5,
    } as any,
    safety: {
      rollCageType: (car.tier >= 7 ? "full_welded_gt3_spaceframe" : car.tier >= 3 ? "6_point_fia_bolt_in" : "none") as any,
      fireSuppressionInstalled: car.tier >= 3,
      harnessType: (car.tier >= 7 ? "sabelt_6_point_f1" : car.tier >= 3 ? "schroth_enduro_pro" : "3_point_street_belt") as any,
      fuelCellSafetyBladder: car.tier >= 5,
      crashStructureRating: (car.tier >= 5 ? "motorsport_fia" : car.tier >= 3 ? "advanced" : "reinforced") as any,
      massKg: car.tier >= 7 ? 35 : car.tier >= 3 ? 20 : 8,
    } as any,
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
      transmissionTorqueSafetyFactor: 1.5, electricalLoadBalanceWatts: 0, violations: [],
    },
  };
}
