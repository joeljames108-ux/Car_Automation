// ===================================================================
// AUTOMOTIVE TAXONOMY PRESET GENERATOR
// ===================================================================
// Generates fully calibrated VehicleDesign presets for every single
// Price Tier and Utility Class in the taxonomy.
// ===================================================================

import { MASTER_PRICE_TIERS, PriceTierId } from "./priceTierTaxonomy";
import { MASTER_UTILITY_CLASSES, UtilityClassId } from "./utilityClassTaxonomy";
import { VehicleDesign } from "../types";

export class TaxonomyPresetGenerator {
  /**
   * Generates a fully configured VehicleDesign object for any given Price Tier and Utility Class.
   */
  public static generatePreset(params: {
    name: string;
    priceTier: PriceTierId;
    utilityClass: UtilityClassId;
  }): VehicleDesign {
    const { name, priceTier, utilityClass } = params;

    const tierSpec = MASTER_PRICE_TIERS[priceTier];
    const classSpec = MASTER_UTILITY_CLASSES[utilityClass];

    const targetMsrp = Math.round((tierSpec.minMsrpUSD + tierSpec.maxMsrpUSD) / 2);
    const estimatedCurbWeight = Math.round(tierSpec.targetWeightKg * (classSpec.cargoVolumeLiters > 600 ? 1.15 : 0.95));

    // Choose appropriate platform type mapping based on price tier
    const platformMap: Record<PriceTierId, any> = {
      BUDGET_ECONOMY: "budget_economy",
      LOWER_MIDRANGE: "compact",
      UPPER_MIDRANGE: "midsize",
      PREMIUM_EXECUTIVE: "executive",
      LUXURY_GRAND: "luxury",
      ULTRA_LUXURY_COACHBUILT: "ultra_luxury",
      EXOTIC_SPORTS: "sports",
      SUPERCAR_TRACK: "supercar",
      HYPERCAR_MEGAWATT: "hypercar",
    };

    // Choose appropriate body type mapping based on utility class
    const bodyMap: Record<UtilityClassId, any> = {
      CITY_CAR: "city_car",
      HATCHBACK: "hatchback",
      SEDAN: "sedan",
      WAGON: "wagon",
      COUPE: "coupe",
      CONVERTIBLE: "convertible",
      SUV: "suv",
      CROSSOVER_CUV: "crossover",
      PICKUP_TRUCK: "pickup",
      MINIVAN: "mpv",
      COMMERCIAL_VAN: "van",
      OFFROAD_4X4: "offroad_4x4",
      LIMOUSINE: "limousine",
      SPORTS_CAR: "coupe",
      GRAND_TOURER: "coupe",
      MUSCLE_CAR: "coupe",
      COMMERCIAL_TAXI: "sedan",
      POLICE_INTERCEPTOR: "sedan",
      AMBULANCE_EMERGENCY: "van",
      FIRE_COMMAND: "offroad_4x4",
      RALLY_CAR: "hatchback",
      FORMULA_MONOPOSTO: "formula",
      TOURING_CAR_TCR: "sedan",
      GT3_RACE_CAR: "coupe",
      DRIFT_CAR: "coupe",
      ELECTRIC_VEHICLE_BEV: "sedan",
      PLUG_IN_HYBRID_PHEV: "sedan",
      HYDROGEN_FUEL_CELL_FCEV: "sedan",
    };

    return {
      id: `PRESET_${priceTier}_${utilityClass}_${Date.now()}`,
      name,
      platform: platformMap[priceTier] || "midsize",
      bodyType: bodyMap[utilityClass] || "sedan",
      targetPrice: targetMsrp,
      marketPosition: {
        priceTier,
        utilityClass: classSpec.displayName,
        targetBuyer: tierSpec.targetBuyerDemographic,
      },
      engine: {
        type: tierSpec.typicalEngineLayouts[0] || "I4",
        displacementL: tierSpec.maxPowerHp > 500 ? 4.0 : 2.0,
        cylinders: tierSpec.maxPowerHp > 600 ? 8 : 4,
        valvesPerCylinder: 4,
        camshaft: "DOHC",
        boreMm: 85,
        strokeMm: 88,
        compressionRatio: 10.5,
        revLimitRpm: tierSpec.maxPowerHp > 700 ? 9000 : 6800,
        idleRpm: 800,
        fuelType: "gasoline_98",
        aspiration: tierSpec.maxPowerHp > 350 ? "turbocharged" : "naturally_aspirated",
        turbochargerCount: tierSpec.maxPowerHp > 500 ? 2 : 1,
        boostPressureBar: tierSpec.maxPowerHp > 350 ? 1.4 : 0.0,
        intercoolerType: "air_to_water",
        intakeType: "performance",
        fuelSystem: "direct_injection",
        exhaustType: "dual_cat",
        headerType: "equal_length",
        vvt: "dual_vvt",
        vvl: false,
        ecuTune: "sport",
        targetPowerHp: tierSpec.maxPowerHp,
      },
      transmission: {
        type: tierSpec.maxPowerHp > 400 ? "dual_clutch" : "automatic",
        gears: 8,
        finalDriveRatio: 3.55,
        gearRatios: [3.8, 2.4, 1.7, 1.3, 1.0, 0.8, 0.65, 0.55],
        drivetrain: classSpec.drivetrainLayout === "4WD_LOW_RANGE" ? "4wd" : classSpec.drivetrainLayout === "FWD" ? "fwd" : "rwd",
        differential: tierSpec.maxPowerHp > 500 ? "electronic_lsd" : "open",
        clutchType: "dual_clutch",
        shiftSpeedMs: tierSpec.maxPowerHp > 500 ? 80 : 150,
      },
      chassis: {
        frontSuspension: "double_wishbone",
        rearSuspension: "multi_link",
        springType: "coil",
        damperType: tierSpec.maxPowerHp > 500 ? "adaptive" : "monotube",
        antiRollBarFrontMm: 28,
        antiRollBarRearMm: 22,
        rideHeightMm: classSpec.category === "COMMERCIAL_FLEET" ? 180 : 120,
        wheelbaseMm: 2850,
        trackWidthFrontMm: 1620,
        trackWidthRearMm: 1640,
        wheelDiameterInch: tierSpec.maxPowerHp > 500 ? 20 : 17,
        tireWidthFrontMm: 245,
        tireWidthRearMm: 275,
        tireCompound: tierSpec.maxPowerHp > 600 ? "semi_slick" : "sport",
        brakeTypeFront: tierSpec.maxPowerHp > 700 ? "carbon_ceramic" : "ventilated_disc",
        brakeTypeRear: "ventilated_disc",
        brakeDiscSizeFrontMm: tierSpec.maxPowerHp > 700 ? 400 : 340,
        brakeDiscSizeRearMm: tierSpec.maxPowerHp > 700 ? 380 : 320,
        caliperPistonsFront: tierSpec.maxPowerHp > 700 ? 6 : 4,
        caliperPistonsRear: 4,
        steeringType: "electric_power",
        steeringRatio: 13.5,
      },
      aerodynamics: {
        dragCoefficientCd: classSpec.typicalDragCoefficientCd,
        frontalAreaM2: classSpec.typicalFrontalAreaM2,
        activeAero: tierSpec.maxPowerHp > 600,
        underbodyPaneling: true,
        rearDiffuser: tierSpec.maxPowerHp > 400,
        frontSplitter: tierSpec.maxPowerHp > 400,
        rearWing: tierSpec.maxPowerHp > 600,
        wingAngleDeg: 8.0,
      },
      weight: {
        targetCurbWeightKg: estimatedCurbWeight,
        weightDistributionFrontPct: classSpec.drivetrainLayout === "FWD" ? 60 : 50,
      },
      features: {
        infotainmentTier: tierSpec.standardInfotainmentTier,
        speakersCount: tierSpec.maxMsrpUSD > 60000 ? 18 : 8,
        driverAssistLevel: tierSpec.maxMsrpUSD > 40000 ? 2 : 1,
        climateZones: tierSpec.maxMsrpUSD > 60000 ? 4 : 2,
        leatherInterior: tierSpec.maxMsrpUSD > 40000,
        ambientLighting: tierSpec.maxMsrpUSD > 40000,
        panoramicRoof: tierSpec.maxMsrpUSD > 40000,
      },
    } as any;
  }
}
