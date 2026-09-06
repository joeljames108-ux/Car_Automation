// ============================================================================
// VEHICLE ARCHITECTURE REGISTRY
// ============================================================================
// Central authority defining the 4 core vehicle engineering platforms:
// - Sedan (3-Box Executive)
// - Hatchback (2-Box Compact)
// - Crossover (Elevated 2-Box)
// - SUV (Large Heavy-Duty 2-Box)
// Each category defines non-uniform chassis dimensions, dedicated GLB assets,
// hardpoint maps, packaging envelopes, and compatible Design Studio components.
// ============================================================================

import {
  VehicleCategory,
  CoreVehicleCategory,
  VehicleArchitectureConfig,
} from "./vehicleArchitectureTypes";

export const VEHICLE_ARCHITECTURE_REGISTRY: Record<CoreVehicleCategory, VehicleArchitectureConfig> = {
  sedan: {
    id: "sedan",
    name: "Executive Sport Sedan",
    category: "sedan",
    tagline: "3-Box Sleek Aerodynamic Grand Tourer",
    description: "Low-slung chassis with long wheelbase, low center of gravity, distinct 3-box profile (hood, cabin, trunk), and balanced 50:50 weight distribution.",
    architectureClass: "3_box_executive",
    assets: {
      chassisAsset: "/models/vehicles/sedan/chassis.glb",
      bodyFrameworkAsset: "/models/vehicles/sedan/body-framework.glb",
      floorAsset: "/models/vehicles/sedan/floor.glb",
      wheelArchAsset: "/models/vehicles/sedan/wheel-arches.glb",
      hardpointAsset: "/models/vehicles/sedan/hardpoints.glb",
      envelopeAsset: "/models/vehicles/sedan/envelopes.glb",
    },
    // Dimensions (mm)
    wheelbaseMm: 2850,
    trackFrontMm: 1620,
    trackRearMm: 1620,
    rideHeightMm: 135,
    overallLengthMm: 4880,
    overallWidthMm: 1860,
    overallHeightMm: 1440,
    frontOverhangMm: 920,
    rearOverhangMm: 1110,
    hoodHeightMm: 920,
    beltlineHeightMm: 980,
    roofLengthMm: 1850,
    roofHeightMm: 1440,
    wheelDiameterInches: 19,
    tireWidthMm: 245,
    cabPositionRatio: 0.52,
    greenhouseLengthMm: 2150,

    engineBayEnvelope: {
      lengthMm: 1100,
      widthMm: 1340,
      heightMm: 720,
      centerOffsetMm: { x: 1200, y: 0, z: 580 },
    },
    cabinEnvelope: {
      lengthMm: 2120,
      widthMm: 1560,
      heightMm: 1180,
      centerOffsetMm: { x: -100, y: 0, z: 850 },
    },
    cargoEnvelope: {
      lengthMm: 850,
      widthMm: 1260,
      heightMm: 520,
      centerOffsetMm: { x: -1850, y: 0, z: 580 },
    },

    wheelCenters: {
      frontLeft: { x: 1425, y: 810, z: 475 },
      frontRight: { x: 1425, y: -810, z: 475 },
      rearLeft: { x: -1425, y: 810, z: 475 },
      rearRight: { x: -1425, y: -810, z: 475 },
    },

    hardpoints: {
      FRONT_LEFT_WHEEL_CENTER: { id: "FRONT_LEFT_WHEEL_CENTER", name: "Front Left Wheel Center", positionMm: { x: 1425, y: 810, z: 475 }, type: "wheel_center", mirroredId: "FRONT_RIGHT_WHEEL_CENTER" },
      FRONT_RIGHT_WHEEL_CENTER: { id: "FRONT_RIGHT_WHEEL_CENTER", name: "Front Right Wheel Center", positionMm: { x: 1425, y: -810, z: 475 }, type: "wheel_center", mirroredId: "FRONT_LEFT_WHEEL_CENTER" },
      REAR_LEFT_WHEEL_CENTER: { id: "REAR_LEFT_WHEEL_CENTER", name: "Rear Left Wheel Center", positionMm: { x: -1425, y: 810, z: 475 }, type: "wheel_center", mirroredId: "REAR_RIGHT_WHEEL_CENTER" },
      REAR_RIGHT_WHEEL_CENTER: { id: "REAR_RIGHT_WHEEL_CENTER", name: "Rear Right Wheel Center", positionMm: { x: -1425, y: -810, z: 475 }, type: "wheel_center", mirroredId: "REAR_LEFT_WHEEL_CENTER" },
      HOOD_LATCH_CENTER: { id: "HOOD_LATCH_CENTER", name: "Front Hood Latch", positionMm: { x: 2150, y: 0, z: 890 }, type: "body_hinge" },
      TRUNK_LATCH_CENTER: { id: "TRUNK_LATCH_CENTER", name: "Trunk Decklid Latch", positionMm: { x: -2280, y: 0, z: 960 }, type: "body_hinge" },
    },

    compatibleExteriorComponents: {
      hoodStyles: ["sedan_hood_sculpted", "sedan_hood_vented", "sedan_hood_carbon"],
      frontFenders: ["sedan_fenders_sleek", "sedan_fenders_widebody", "sedan_fenders_vented"],
      rearFenders: ["sedan_quarters_wide", "sedan_quarters_flush"],
      roofStyles: ["sedan_roof_slick", "sedan_roof_panoramic_glass", "sedan_roof_carbon"],
      doorConfigurations: ["sedan_4door_frameless", "sedan_4door_executive"],
      rearClosureType: "trunk_decklid",
      bumperStyles: ["sedan_bumper_executive", "sedan_bumper_sport_aero", "sedan_bumper_gt"],
      wheelArchLiners: ["sedan_arch_aero_flush", "sedan_arch_soundproof"],
    },

    metadata: {
      platformType: "SEDAN_MODULAR_PLATFORM_V1",
      chassisVersion: "SEDAN_CHASSIS_REV_2",
      bodyFrameworkVersion: "SEDAN_FRAMEWORK_REV_2",
      designVersion: "SEDAN_DEFAULT_DESIGN_01",
      targetAeroCd: 0.26,
      targetTorsionalRigidityKNmDeg: 38.5,
      nominalCurbWeightKg: 1540,
    },
  },

  hatchback: {
    id: "hatchback",
    name: "Hot Hatch Performance",
    category: "hatchback",
    tagline: "Compact 2-Box Agile Urban & Track Weapon",
    description: "Compact wheelbase with short rear overhang, high structural torsional rigidity, upright roofline, and integrated rear liftgate hatch for high aerodynamic downforce.",
    architectureClass: "2_box_compact",
    assets: {
      chassisAsset: "/models/vehicles/hatchback/chassis.glb",
      bodyFrameworkAsset: "/models/vehicles/hatchback/body-framework.glb",
      floorAsset: "/models/vehicles/hatchback/floor.glb",
      wheelArchAsset: "/models/vehicles/hatchback/wheel-arches.glb",
      hardpointAsset: "/models/vehicles/hatchback/hardpoints.glb",
      envelopeAsset: "/models/vehicles/hatchback/envelopes.glb",
    },
    // Dimensions (mm)
    wheelbaseMm: 2600,
    trackFrontMm: 1560,
    trackRearMm: 1560,
    rideHeightMm: 130,
    overallLengthMm: 4220,
    overallWidthMm: 1800,
    overallHeightMm: 1460,
    frontOverhangMm: 840,
    rearOverhangMm: 780,
    hoodHeightMm: 940,
    beltlineHeightMm: 960,
    roofLengthMm: 2100,
    roofHeightMm: 1460,
    wheelDiameterInches: 18,
    tireWidthMm: 235,
    cabPositionRatio: 0.46,
    greenhouseLengthMm: 2200,

    engineBayEnvelope: {
      lengthMm: 980,
      widthMm: 1280,
      heightMm: 700,
      centerOffsetMm: { x: 1050, y: 0, z: 570 },
    },
    cabinEnvelope: {
      lengthMm: 2200,
      widthMm: 1520,
      heightMm: 1200,
      centerOffsetMm: { x: -80, y: 0, z: 860 },
    },
    cargoEnvelope: {
      lengthMm: 680,
      widthMm: 1200,
      heightMm: 820,
      centerOffsetMm: { x: -1680, y: 0, z: 750 },
    },

    wheelCenters: {
      frontLeft: { x: 1300, y: 780, z: 455 },
      frontRight: { x: 1300, y: -780, z: 455 },
      rearLeft: { x: -1300, y: 780, z: 455 },
      rearRight: { x: -1300, y: -780, z: 455 },
    },

    hardpoints: {
      FRONT_LEFT_WHEEL_CENTER: { id: "FRONT_LEFT_WHEEL_CENTER", name: "Front Left Wheel Center", positionMm: { x: 1300, y: 780, z: 455 }, type: "wheel_center", mirroredId: "FRONT_RIGHT_WHEEL_CENTER" },
      FRONT_RIGHT_WHEEL_CENTER: { id: "FRONT_RIGHT_WHEEL_CENTER", name: "Front Right Wheel Center", positionMm: { x: 1300, y: -780, z: 455 }, type: "wheel_center", mirroredId: "FRONT_LEFT_WHEEL_CENTER" },
      REAR_LEFT_WHEEL_CENTER: { id: "REAR_LEFT_WHEEL_CENTER", name: "Rear Left Wheel Center", positionMm: { x: -1300, y: 780, z: 455 }, type: "wheel_center", mirroredId: "REAR_RIGHT_WHEEL_CENTER" },
      REAR_RIGHT_WHEEL_CENTER: { id: "REAR_RIGHT_WHEEL_CENTER", name: "Rear Right Wheel Center", positionMm: { x: -1300, y: -780, z: 455 }, type: "wheel_center", mirroredId: "REAR_LEFT_WHEEL_CENTER" },
      HOOD_LATCH_CENTER: { id: "HOOD_LATCH_CENTER", name: "Front Hood Latch", positionMm: { x: 1950, y: 0, z: 910 }, type: "body_hinge" },
      TAILGATE_HINGE_TOP: { id: "TAILGATE_HINGE_TOP", name: "Roof Hatch Hinge Point", positionMm: { x: -1750, y: 0, z: 1430 }, type: "body_hinge" },
    },

    compatibleExteriorComponents: {
      hoodStyles: ["hatch_hood_vented", "hatch_hood_rally_scoop", "hatch_hood_lightweight"],
      frontFenders: ["hatch_fenders_flared", "hatch_fenders_touring_car"],
      rearFenders: ["hatch_box_flares", "hatch_flush_quarters"],
      roofStyles: ["hatch_roof_solid", "hatch_roof_spoiler_extension"],
      doorConfigurations: ["hatch_3door_coupe_spec", "hatch_5door_practical"],
      rearClosureType: "rear_hatch",
      bumperStyles: ["hatch_bumper_sport", "hatch_bumper_wrc_aero", "hatch_bumper_street"],
      wheelArchLiners: ["hatch_arch_close_clearance", "hatch_arch_gravel_guard"],
    },

    metadata: {
      platformType: "HATCHBACK_COMPACT_PLATFORM_V1",
      chassisVersion: "HATCH_CHASSIS_REV_2",
      bodyFrameworkVersion: "HATCH_FRAMEWORK_REV_2",
      designVersion: "HATCH_DEFAULT_DESIGN_01",
      targetAeroCd: 0.31,
      targetTorsionalRigidityKNmDeg: 42.0,
      nominalCurbWeightKg: 1320,
    },
  },

  crossover: {
    id: "crossover",
    name: "Urban Crossover AWD",
    category: "crossover",
    tagline: "Elevated Stance with Dynamic Versatility",
    description: "Raised ride height (190 mm), high hip-point seating position, reinforced unibody cage, and flared composite wheel arches for all-weather capability.",
    architectureClass: "2_box_elevated",
    assets: {
      chassisAsset: "/models/vehicles/crossover/chassis.glb",
      bodyFrameworkAsset: "/models/vehicles/crossover/body-framework.glb",
      floorAsset: "/models/vehicles/crossover/floor.glb",
      wheelArchAsset: "/models/vehicles/crossover/wheel-arches.glb",
      hardpointAsset: "/models/vehicles/crossover/hardpoints.glb",
      envelopeAsset: "/models/vehicles/crossover/envelopes.glb",
    },
    // Dimensions (mm)
    wheelbaseMm: 2700,
    trackFrontMm: 1630,
    trackRearMm: 1630,
    rideHeightMm: 190,
    overallLengthMm: 4540,
    overallWidthMm: 1880,
    overallHeightMm: 1620,
    frontOverhangMm: 880,
    rearOverhangMm: 960,
    hoodHeightMm: 1080,
    beltlineHeightMm: 1120,
    roofLengthMm: 2150,
    roofHeightMm: 1620,
    wheelDiameterInches: 20,
    tireWidthMm: 255,
    cabPositionRatio: 0.50,
    greenhouseLengthMm: 2280,

    engineBayEnvelope: {
      lengthMm: 1060,
      widthMm: 1350,
      heightMm: 780,
      centerOffsetMm: { x: 1150, y: 0, z: 680 },
    },
    cabinEnvelope: {
      lengthMm: 2320,
      widthMm: 1580,
      heightMm: 1260,
      centerOffsetMm: { x: -50, y: 0, z: 980 },
    },
    cargoEnvelope: {
      lengthMm: 880,
      widthMm: 1280,
      heightMm: 920,
      centerOffsetMm: { x: -1750, y: 0, z: 820 },
    },

    wheelCenters: {
      frontLeft: { x: 1350, y: 815, z: 550 },
      frontRight: { x: 1350, y: -815, z: 550 },
      rearLeft: { x: -1350, y: 815, z: 550 },
      rearRight: { x: -1350, y: -815, z: 550 },
    },

    hardpoints: {
      FRONT_LEFT_WHEEL_CENTER: { id: "FRONT_LEFT_WHEEL_CENTER", name: "Front Left Wheel Center", positionMm: { x: 1350, y: 815, z: 550 }, type: "wheel_center", mirroredId: "FRONT_RIGHT_WHEEL_CENTER" },
      FRONT_RIGHT_WHEEL_CENTER: { id: "FRONT_RIGHT_WHEEL_CENTER", name: "Front Right Wheel Center", positionMm: { x: 1350, y: -815, z: 550 }, type: "wheel_center", mirroredId: "FRONT_LEFT_WHEEL_CENTER" },
      REAR_LEFT_WHEEL_CENTER: { id: "REAR_LEFT_WHEEL_CENTER", name: "Rear Left Wheel Center", positionMm: { x: -1350, y: 815, z: 550 }, type: "wheel_center", mirroredId: "REAR_RIGHT_WHEEL_CENTER" },
      REAR_RIGHT_WHEEL_CENTER: { id: "REAR_RIGHT_WHEEL_CENTER", name: "Rear Right Wheel Center", positionMm: { x: -1350, y: -815, z: 550 }, type: "wheel_center", mirroredId: "REAR_LEFT_WHEEL_CENTER" },
      HOOD_LATCH_CENTER: { id: "HOOD_LATCH_CENTER", name: "Front Hood Latch", positionMm: { x: 2080, y: 0, z: 1050 }, type: "body_hinge" },
      TAILGATE_HINGE_TOP: { id: "TAILGATE_HINGE_TOP", name: "Crossover Tailgate Hinge", positionMm: { x: -1920, y: 0, z: 1580 }, type: "body_hinge" },
    },

    compatibleExteriorComponents: {
      hoodStyles: ["crossover_hood_muscular", "crossover_hood_vented"],
      frontFenders: ["crossover_fenders_cladded", "crossover_fenders_rugged"],
      rearFenders: ["crossover_quarters_armored", "crossover_quarters_urban"],
      roofStyles: ["crossover_roof_rails", "crossover_roof_panoramic_rack"],
      doorConfigurations: ["crossover_4door_reinforced"],
      rearClosureType: "crossover_tailgate",
      bumperStyles: ["crossover_bumper_skidplate", "crossover_bumper_urban_sleek"],
      wheelArchLiners: ["crossover_arch_rugged_armor", "crossover_arch_cladding"],
    },

    metadata: {
      platformType: "CROSSOVER_AWD_PLATFORM_V1",
      chassisVersion: "CROSSOVER_CHASSIS_REV_2",
      bodyFrameworkVersion: "CROSSOVER_FRAMEWORK_REV_2",
      designVersion: "CROSSOVER_DEFAULT_DESIGN_01",
      targetAeroCd: 0.33,
      targetTorsionalRigidityKNmDeg: 36.0,
      nominalCurbWeightKg: 1720,
    },
  },

  suv: {
    id: "suv",
    name: "Full-Size Heavy Duty SUV",
    category: "suv",
    tagline: "Large Heavy-Duty 3-Row Monocoque/Ladder Hybrid",
    description: "Heavy-duty architecture with high ground clearance (230 mm), wide stance, tall greenhouse with D-pillar third-row seating, and reinforced frame rails.",
    architectureClass: "2_box_heavy_duty",
    assets: {
      chassisAsset: "/models/vehicles/suv/chassis.glb",
      bodyFrameworkAsset: "/models/vehicles/suv/body-framework.glb",
      floorAsset: "/models/vehicles/suv/floor.glb",
      wheelArchAsset: "/models/vehicles/suv/wheel-arches.glb",
      hardpointAsset: "/models/vehicles/suv/hardpoints.glb",
      envelopeAsset: "/models/vehicles/suv/envelopes.glb",
    },
    // Dimensions (mm)
    wheelbaseMm: 2980,
    trackFrontMm: 1680,
    trackRearMm: 1680,
    rideHeightMm: 230,
    overallLengthMm: 5080,
    overallWidthMm: 2000,
    overallHeightMm: 1820,
    frontOverhangMm: 980,
    rearOverhangMm: 1120,
    hoodHeightMm: 1220,
    beltlineHeightMm: 1280,
    roofLengthMm: 2450,
    roofHeightMm: 1820,
    wheelDiameterInches: 22,
    tireWidthMm: 285,
    cabPositionRatio: 0.48,
    greenhouseLengthMm: 2600,

    engineBayEnvelope: {
      lengthMm: 1250,
      widthMm: 1440,
      heightMm: 920,
      centerOffsetMm: { x: 1350, y: 0, z: 820 },
    },
    cabinEnvelope: {
      lengthMm: 2650,
      widthMm: 1680,
      heightMm: 1380,
      centerOffsetMm: { x: -80, y: 0, z: 1120 },
    },
    cargoEnvelope: {
      lengthMm: 1100,
      widthMm: 1420,
      heightMm: 1040,
      centerOffsetMm: { x: -1980, y: 0, z: 950 },
    },

    wheelCenters: {
      frontLeft: { x: 1490, y: 840, z: 635 },
      frontRight: { x: 1490, y: -840, z: 635 },
      rearLeft: { x: -1490, y: 840, z: 635 },
      rearRight: { x: -1490, y: -840, z: 635 },
    },

    hardpoints: {
      FRONT_LEFT_WHEEL_CENTER: { id: "FRONT_LEFT_WHEEL_CENTER", name: "Front Left Wheel Center", positionMm: { x: 1490, y: 840, z: 635 }, type: "wheel_center", mirroredId: "FRONT_RIGHT_WHEEL_CENTER" },
      FRONT_RIGHT_WHEEL_CENTER: { id: "FRONT_RIGHT_WHEEL_CENTER", name: "Front Right Wheel Center", positionMm: { x: 1490, y: -840, z: 635 }, type: "wheel_center", mirroredId: "FRONT_LEFT_WHEEL_CENTER" },
      REAR_LEFT_WHEEL_CENTER: { id: "REAR_LEFT_WHEEL_CENTER", name: "Rear Left Wheel Center", positionMm: { x: -1490, y: 840, z: 635 }, type: "wheel_center", mirroredId: "REAR_RIGHT_WHEEL_CENTER" },
      REAR_RIGHT_WHEEL_CENTER: { id: "REAR_RIGHT_WHEEL_CENTER", name: "Rear Right Wheel Center", positionMm: { x: -1490, y: -840, z: 635 }, type: "wheel_center", mirroredId: "REAR_LEFT_WHEEL_CENTER" },
      HOOD_LATCH_CENTER: { id: "HOOD_LATCH_CENTER", name: "Front Hood Latch", positionMm: { x: 2320, y: 0, z: 1180 }, type: "body_hinge" },
      TAILGATE_HINGE_TOP: { id: "TAILGATE_HINGE_TOP", name: "SUV Liftgate Top Hinge", positionMm: { x: -2250, y: 0, z: 1780 }, type: "body_hinge" },
    },

    compatibleExteriorComponents: {
      hoodStyles: ["suv_hood_heavy_duty", "suv_hood_power_bulge", "suv_hood_ventilated"],
      frontFenders: ["suv_fenders_wide_arch", "suv_fenders_rock_guard"],
      rearFenders: ["suv_fenders_extended", "suv_fenders_heavy_cladding"],
      roofStyles: ["suv_roof_expedition_rack", "suv_roof_dual_sunroof", "suv_roof_solid"],
      doorConfigurations: ["suv_4door_reinforced_armor"],
      rearClosureType: "heavy_duty_liftgate",
      bumperStyles: ["suv_bumper_winch_guard", "suv_bumper_rugged_steel", "suv_bumper_luxury_chrome"],
      wheelArchLiners: ["suv_arch_heavy_clearance", "suv_arch_mud_armor"],
    },

    metadata: {
      platformType: "SUV_HEAVY_DUTY_HYBRID_V1",
      chassisVersion: "SUV_CHASSIS_REV_2",
      bodyFrameworkVersion: "SUV_FRAMEWORK_REV_2",
      designVersion: "SUV_DEFAULT_DESIGN_01",
      targetAeroCd: 0.38,
      targetTorsionalRigidityKNmDeg: 45.0,
      nominalCurbWeightKg: 2420,
    },
  },
};

export function getVehicleArchitecture(category: VehicleCategory): VehicleArchitectureConfig {
  return VEHICLE_ARCHITECTURE_REGISTRY[category as CoreVehicleCategory] || VEHICLE_ARCHITECTURE_REGISTRY.sedan;
}

export function getAllVehicleArchitectures(): VehicleArchitectureConfig[] {
  return Object.values(VEHICLE_ARCHITECTURE_REGISTRY);
}

export function getDefaultVehicleArchitecture(): VehicleArchitectureConfig {
  return VEHICLE_ARCHITECTURE_REGISTRY.sedan;
}
