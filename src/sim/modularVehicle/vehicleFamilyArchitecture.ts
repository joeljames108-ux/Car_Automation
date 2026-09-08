/**
 * ============================================================================
 * VEHICLE FAMILY ARCHITECTURE & 3-LAYER PROCEDURAL BLENDER ASSET SYSTEM
 * ============================================================================
 * Defines the expanded 38-body-type library grouped into 8 foundational
 * platform families, the 3-Layer Automotive Architecture (Platform -> Body ->
 * Design Kit), parametric dimension calculators, and deterministic Blender
 * node naming standards.
 * ============================================================================
 */

import { EnginePosition, DriveType } from "../types";
import {
  PlatformFamilyId,
  VehicleBodyTypeId,
  VehicleArchitectureLayer,
  HypercarActiveAeroState,
  ConvertibleRoofState,
  VanSeatConfig,
  VanInteriorVolumeState,
  OffRoadSuspensionState,
  CommercialBodyType,
  CommercialBodySpec,
} from "./types";

export interface PlatformDimensions {
  wheelbaseMm: number;
  frontTrackMm: number;
  rearTrackMm: number;
  overallLengthMm: number;
  overallWidthMm: number;
  overallHeightMm: number;
  groundClearanceMm: number;
  frontOverhangMm: number;
  rearOverhangMm: number;
  cabinLengthMm: number;
  cabinHeightMm: number;
  enginePosition: EnginePosition;
  batteryLengthMm?: number;
}

export interface BodyMorphParameters {
  roofLengthDeltaMm: number;
  roofHeightDeltaMm: number;
  doorLengthDeltaMm: number;
  rearRakeAngleDeg: number;
  dPillarRequired: boolean;
  cargoExtensionMm: number;
  tailgateStyle: "sedan_trunk" | "hatchback_lift" | "wagon_tailgate" | "pickup_bed" | "clam_shell" | "none";
}

export interface VehicleBodyTypeSpec {
  id: VehicleBodyTypeId;
  name: string;
  familyId: PlatformFamilyId;
  designIdentity: string;
  typicalArchitecture: "unibody" | "body_on_frame" | "carbon_tub" | "spaceframe" | "ev_skateboard" | "tubular";
  keyBlenderAssets: string[];
  defaultDimensions: PlatformDimensions;
  seatingCapacity: number;
  cargoCapacityL: number;
  morphSourceId?: VehicleBodyTypeId;
  morphParameters?: BodyMorphParameters;
  aerodynamicBaseline: {
    cd: number;
    frontalAreaM2: number;
    clBase: number;
  };
}

export interface PlatformFamilySpec {
  id: PlatformFamilyId;
  name: string;
  chassisType: "unibody" | "body_on_frame" | "carbon_tub" | "spaceframe" | "ev_skateboard";
  description: string;
  allowedBodyTypes: VehicleBodyTypeId[];
  defaultDriveType: DriveType;
  allowedEnginePositions: EnginePosition[];
  baselineTorsionalRigidityNmPerDeg: number;
}

export interface PlatformHardpoints {
  wheelCenters: {
    fl: [number, number, number];
    fr: [number, number, number];
    rl: [number, number, number];
    rr: [number, number, number];
  };
  suspensionPivots: {
    frontSubframeCenter: [number, number, number];
    rearSubframeCenter: [number, number, number];
  };
  powertrainEnvelope: {
    origin: [number, number, number];
    dimensions: [number, number, number];
  };
  cabinEnvelope: {
    origin: [number, number, number];
    dimensions: [number, number, number];
  };
  chassisRails: {
    leftRailStart: [number, number, number];
    leftRailEnd: [number, number, number];
    rightRailStart: [number, number, number];
    rightRailEnd: [number, number, number];
  };
}

/**
 * ----------------------------------------------------------------------------
 * 1. PLATFORM FAMILIES REGISTRY (8 FOUNDATIONAL ARCHITECTURES)
 * ----------------------------------------------------------------------------
 */
export const PLATFORM_FAMILIES: Record<PlatformFamilyId, PlatformFamilySpec> = {
  unibody_passenger: {
    id: "unibody_passenger",
    name: "Unibody Passenger Platform",
    chassisType: "unibody",
    description: "Standard monocoque steel/aluminum architecture for executive, tourer, and fastback passenger cars.",
    allowedBodyTypes: [
      "sedan",
      "coupe",
      "station_wagon",
      "shooting_brake",
      "liftback",
      "fastback",
      "grand_tourer",
      "limousine",
    ],
    defaultDriveType: "rwd",
    allowedEnginePositions: ["front", "mid"],
    baselineTorsionalRigidityNmPerDeg: 34000,
  },
  unibody_compact: {
    id: "unibody_compact",
    name: "Unibody Compact Platform",
    chassisType: "unibody",
    description: "Transverse front-wheel-drive or AWD architecture for urban subcompacts and hot hatchbacks.",
    allowedBodyTypes: ["hatchback", "hot_hatch", "supermini", "city_car", "kei_compact"],
    defaultDriveType: "fwd",
    allowedEnginePositions: ["front"],
    baselineTorsionalRigidityNmPerDeg: 28000,
  },
  utility_suv_crossover: {
    id: "utility_suv_crossover",
    name: "Utility & Crossover Platform",
    chassisType: "unibody",
    description: "High-clearance reinforced monocoque architecture with elevated hip points and AWD subframes.",
    allowedBodyTypes: ["suv", "crossover", "luxury_suv", "performance_suv", "offroad_suv"],
    defaultDriveType: "awd",
    allowedEnginePositions: ["front", "mid"],
    baselineTorsionalRigidityNmPerDeg: 38000,
  },
  body_on_frame_truck: {
    id: "body_on_frame_truck",
    name: "Body-on-Frame Truck & Commercial",
    chassisType: "body_on_frame",
    description: "Heavy-duty hydroformed steel ladder frame with solid rear axle or independent long-travel arms.",
    allowedBodyTypes: ["pickup_truck", "offroad_4x4", "cab_over_utility", "chassis_cab"],
    defaultDriveType: "awd",
    allowedEnginePositions: ["front"],
    baselineTorsionalRigidityNmPerDeg: 24000,
  },
  commercial_van_bus: {
    id: "commercial_van_bus",
    name: "Commercial High-Volume / MPV",
    chassisType: "unibody",
    description: "Flat-floor cab-forward monocoque maximized for volumetric passenger and freight payload.",
    allowedBodyTypes: ["cargo_van", "minivan_mpv", "microvan", "motorhome_camper", "bus_shuttle"],
    defaultDriveType: "fwd",
    allowedEnginePositions: ["front"],
    baselineTorsionalRigidityNmPerDeg: 31000,
  },
  high_downforce_supercar: {
    id: "high_downforce_supercar",
    name: "Mid-Engine Carbon Monocoque",
    chassisType: "carbon_tub",
    description: "Ultra-rigid autoclaved carbon tub with aluminum subframe cradles and aerodynamic venturi floor tunnels.",
    allowedBodyTypes: ["supercar", "hypercar", "track_special"],
    defaultDriveType: "awd",
    allowedEnginePositions: ["mid", "rear"],
    baselineTorsionalRigidityNmPerDeg: 55000,
  },
  open_top_gt: {
    id: "open_top_gt",
    name: "Open-Top Reinforced Platform",
    chassisType: "unibody",
    description: "Hydroformed high-strength steel sills with reinforced hydroformed A-pillars and rear rollover deck.",
    allowedBodyTypes: ["roadster", "convertible"],
    defaultDriveType: "rwd",
    allowedEnginePositions: ["front", "mid"],
    baselineTorsionalRigidityNmPerDeg: 29000,
  },
  tubular_specialty: {
    id: "tubular_specialty",
    name: "Tubular & Specialty Platform",
    chassisType: "spaceframe",
    description: "Chromoly spaceframe chassis or modular skateboard for extreme off-road, rally, and bespoke builds.",
    allowedBodyTypes: ["sport_wagon", "shooting_brake_ev", "rally_car", "dune_buggy", "beach_buggy", "three_wheeler"],
    defaultDriveType: "awd",
    allowedEnginePositions: ["front", "mid", "rear"],
    baselineTorsionalRigidityNmPerDeg: 36000,
  },
};

export const PLATFORM_FAMILY_REGISTRY = PLATFORM_FAMILIES;

/**
 * ----------------------------------------------------------------------------
 * 2. EXPANDED 38 BODY-TYPE REGISTRY
 * ----------------------------------------------------------------------------
 */
export const BODY_TYPE_REGISTRY: Record<VehicleBodyTypeId, VehicleBodyTypeSpec> = {
  // --- 1. Unibody Passenger Platform (8) ---
  sedan: {
    id: "sedan",
    name: "Sedan",
    familyId: "unibody_passenger",
    designIdentity: "3-box passenger car",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Front_Clip", "Cabin", "Rear_Deck", "Doors", "Trunk"],
    defaultDimensions: {
      wheelbaseMm: 2850,
      frontTrackMm: 1600,
      rearTrackMm: 1620,
      overallLengthMm: 4850,
      overallWidthMm: 1880,
      overallHeightMm: 1450,
      groundClearanceMm: 145,
      frontOverhangMm: 920,
      rearOverhangMm: 1080,
      cabinLengthMm: 2200,
      cabinHeightMm: 1180,
      enginePosition: "front",
    },
    seatingCapacity: 5,
    cargoCapacityL: 480,
    aerodynamicBaseline: { cd: 0.28, frontalAreaM2: 2.22, clBase: -0.05 },
  },
  coupe: {
    id: "coupe",
    name: "Coupe",
    familyId: "unibody_passenger",
    designIdentity: "Low 2-door performance car",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Long_Doors", "Fastback_Roof", "Compact_Rear"],
    morphSourceId: "sedan",
    morphParameters: {
      roofLengthDeltaMm: -150,
      roofHeightDeltaMm: -70,
      doorLengthDeltaMm: 240,
      rearRakeAngleDeg: 28,
      dPillarRequired: false,
      cargoExtensionMm: -80,
      tailgateStyle: "sedan_trunk",
    },
    defaultDimensions: {
      wheelbaseMm: 2750,
      frontTrackMm: 1620,
      rearTrackMm: 1640,
      overallLengthMm: 4720,
      overallWidthMm: 1900,
      overallHeightMm: 1380,
      groundClearanceMm: 130,
      frontOverhangMm: 900,
      rearOverhangMm: 1070,
      cabinLengthMm: 1950,
      cabinHeightMm: 1120,
      enginePosition: "front",
    },
    seatingCapacity: 4,
    cargoCapacityL: 380,
    aerodynamicBaseline: { cd: 0.27, frontalAreaM2: 2.15, clBase: -0.08 },
  },
  station_wagon: {
    id: "station_wagon",
    name: "Station Wagon / Estate",
    familyId: "unibody_passenger",
    designIdentity: "Long-roof cruiser",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Extended_Roof", "D_Pillar", "Cargo_Floor", "Roof_Rails"],
    morphSourceId: "sedan",
    morphParameters: {
      roofLengthDeltaMm: 480,
      roofHeightDeltaMm: 15,
      doorLengthDeltaMm: 0,
      rearRakeAngleDeg: 12,
      dPillarRequired: true,
      cargoExtensionMm: 240,
      tailgateStyle: "wagon_tailgate",
    },
    defaultDimensions: {
      wheelbaseMm: 2850,
      frontTrackMm: 1600,
      rearTrackMm: 1620,
      overallLengthMm: 4880,
      overallWidthMm: 1880,
      overallHeightMm: 1470,
      groundClearanceMm: 145,
      frontOverhangMm: 920,
      rearOverhangMm: 1110,
      cabinLengthMm: 2680,
      cabinHeightMm: 1200,
      enginePosition: "front",
    },
    seatingCapacity: 5,
    cargoCapacityL: 640,
    aerodynamicBaseline: { cd: 0.29, frontalAreaM2: 2.28, clBase: -0.04 },
  },
  shooting_brake: {
    id: "shooting_brake",
    name: "Shooting Brake",
    familyId: "unibody_passenger",
    designIdentity: "Sport + cargo: Coupe front + elongated wagon rear",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["SB_Roof", "SB_RearGlass", "SB_Dpillar", "SB_Tailgate"],
    morphSourceId: "coupe",
    morphParameters: {
      roofLengthDeltaMm: 380,
      roofHeightDeltaMm: 10,
      doorLengthDeltaMm: 220,
      rearRakeAngleDeg: 22,
      dPillarRequired: true,
      cargoExtensionMm: 180,
      tailgateStyle: "hatchback_lift",
    },
    defaultDimensions: {
      wheelbaseMm: 2780,
      frontTrackMm: 1630,
      rearTrackMm: 1650,
      overallLengthMm: 4780,
      overallWidthMm: 1910,
      overallHeightMm: 1400,
      groundClearanceMm: 135,
      frontOverhangMm: 910,
      rearOverhangMm: 1090,
      cabinLengthMm: 2320,
      cabinHeightMm: 1140,
      enginePosition: "front",
    },
    seatingCapacity: 4,
    cargoCapacityL: 490,
    aerodynamicBaseline: { cd: 0.28, frontalAreaM2: 2.20, clBase: -0.06 },
  },
  liftback: {
    id: "liftback",
    name: "Liftback",
    familyId: "unibody_passenger",
    designIdentity: "Sedan/wagon crossover with large hinged rear hatch",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Liftback_Hatch", "C_Pillar_Glazing", "Full_Decklid"],
    defaultDimensions: {
      wheelbaseMm: 2840,
      frontTrackMm: 1600,
      rearTrackMm: 1620,
      overallLengthMm: 4820,
      overallWidthMm: 1880,
      overallHeightMm: 1445,
      groundClearanceMm: 145,
      frontOverhangMm: 920,
      rearOverhangMm: 1060,
      cabinLengthMm: 2240,
      cabinHeightMm: 1175,
      enginePosition: "front",
    },
    seatingCapacity: 5,
    cargoCapacityL: 520,
    aerodynamicBaseline: { cd: 0.275, frontalAreaM2: 2.21, clBase: -0.05 },
  },
  fastback: {
    id: "fastback",
    name: "Fastback",
    familyId: "unibody_passenger",
    designIdentity: "Continuous sloping roof-to-tail aerodynamic profile",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Fastback_Roof_Arc", "Integrated_Spoiler_Lip", "Louvered_Backlight"],
    defaultDimensions: {
      wheelbaseMm: 2820,
      frontTrackMm: 1610,
      rearTrackMm: 1630,
      overallLengthMm: 4790,
      overallWidthMm: 1890,
      overallHeightMm: 1420,
      groundClearanceMm: 140,
      frontOverhangMm: 910,
      rearOverhangMm: 1060,
      cabinLengthMm: 2180,
      cabinHeightMm: 1150,
      enginePosition: "front",
    },
    seatingCapacity: 4,
    cargoCapacityL: 440,
    aerodynamicBaseline: { cd: 0.265, frontalAreaM2: 2.18, clBase: -0.07 },
  },
  grand_tourer: {
    id: "grand_tourer",
    name: "Grand Tourer",
    familyId: "unibody_passenger",
    designIdentity: "High-speed luxury long-distance tourer with long hood",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Elongated_Hood", "Wide_Haunches", "Luxury_Cabin"],
    defaultDimensions: {
      wheelbaseMm: 2920,
      frontTrackMm: 1660,
      rearTrackMm: 1670,
      overallLengthMm: 4980,
      overallWidthMm: 1960,
      overallHeightMm: 1390,
      groundClearanceMm: 135,
      frontOverhangMm: 980,
      rearOverhangMm: 1080,
      cabinLengthMm: 2050,
      cabinHeightMm: 1130,
      enginePosition: "front",
    },
    seatingCapacity: 4,
    cargoCapacityL: 420,
    aerodynamicBaseline: { cd: 0.28, frontalAreaM2: 2.26, clBase: -0.10 },
  },
  limousine: {
    id: "limousine",
    name: "Limousine",
    familyId: "unibody_passenger",
    designIdentity: "Executive ultra-luxury stretched cabin",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Stretched_Wheelbase", "Cabin_Partition", "Executive_Rear_Suite"],
    defaultDimensions: {
      wheelbaseMm: 3600,
      frontTrackMm: 1640,
      rearTrackMm: 1650,
      overallLengthMm: 5800,
      overallWidthMm: 1950,
      overallHeightMm: 1520,
      groundClearanceMm: 150,
      frontOverhangMm: 960,
      rearOverhangMm: 1240,
      cabinLengthMm: 3100,
      cabinHeightMm: 1240,
      enginePosition: "front",
    },
    seatingCapacity: 6,
    cargoCapacityL: 600,
    aerodynamicBaseline: { cd: 0.31, frontalAreaM2: 2.45, clBase: -0.02 },
  },

  // --- 2. Unibody Compact Platform (5) ---
  hatchback: {
    id: "hatchback",
    name: "Hatchback",
    familyId: "unibody_compact",
    designIdentity: "Compact practical 2-box car",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Short_Rear", "Hatch_Door", "Compact_Greenhouse"],
    defaultDimensions: {
      wheelbaseMm: 2600,
      frontTrackMm: 1540,
      rearTrackMm: 1540,
      overallLengthMm: 4250,
      overallWidthMm: 1800,
      overallHeightMm: 1460,
      groundClearanceMm: 140,
      frontOverhangMm: 850,
      rearOverhangMm: 800,
      cabinLengthMm: 2150,
      cabinHeightMm: 1200,
      enginePosition: "front",
    },
    seatingCapacity: 5,
    cargoCapacityL: 380,
    aerodynamicBaseline: { cd: 0.30, frontalAreaM2: 2.18, clBase: -0.02 },
  },
  hot_hatch: {
    id: "hot_hatch",
    name: "Hot Hatch",
    familyId: "unibody_compact",
    designIdentity: "Performance hatch with wide arches and track aero",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Wide_Arches", "Aero_Bumpers", "Roof_Spoiler_Wing"],
    defaultDimensions: {
      wheelbaseMm: 2620,
      frontTrackMm: 1580,
      rearTrackMm: 1580,
      overallLengthMm: 4280,
      overallWidthMm: 1840,
      overallHeightMm: 1430,
      groundClearanceMm: 125,
      frontOverhangMm: 860,
      rearOverhangMm: 800,
      cabinLengthMm: 2150,
      cabinHeightMm: 1180,
      enginePosition: "front",
    },
    seatingCapacity: 5,
    cargoCapacityL: 360,
    aerodynamicBaseline: { cd: 0.31, frontalAreaM2: 2.24, clBase: -0.12 },
  },
  supermini: {
    id: "supermini",
    name: "Supermini",
    familyId: "unibody_compact",
    designIdentity: "Agile B-segment compact hatch",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Short_Hood", "Upright_Hatch", "Narrow_Track"],
    defaultDimensions: {
      wheelbaseMm: 2520,
      frontTrackMm: 1500,
      rearTrackMm: 1490,
      overallLengthMm: 4050,
      overallWidthMm: 1740,
      overallHeightMm: 1450,
      groundClearanceMm: 140,
      frontOverhangMm: 800,
      rearOverhangMm: 730,
      cabinLengthMm: 2000,
      cabinHeightMm: 1190,
      enginePosition: "front",
    },
    seatingCapacity: 5,
    cargoCapacityL: 310,
    aerodynamicBaseline: { cd: 0.305, frontalAreaM2: 2.10, clBase: -0.01 },
  },
  city_car: {
    id: "city_car",
    name: "City Car",
    familyId: "unibody_compact",
    designIdentity: "Ultra-compact urban mobility vehicle",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Minimal_Overhangs", "Compact_Rear_Glass", "High_H_Point"],
    defaultDimensions: {
      wheelbaseMm: 2350,
      frontTrackMm: 1420,
      rearTrackMm: 1410,
      overallLengthMm: 3600,
      overallWidthMm: 1640,
      overallHeightMm: 1480,
      groundClearanceMm: 140,
      frontOverhangMm: 680,
      rearOverhangMm: 570,
      cabinLengthMm: 1850,
      cabinHeightMm: 1220,
      enginePosition: "front",
    },
    seatingCapacity: 4,
    cargoCapacityL: 215,
    aerodynamicBaseline: { cd: 0.32, frontalAreaM2: 1.98, clBase: 0.00 },
  },
  kei_compact: {
    id: "kei_compact",
    name: "Kei-style Compact",
    familyId: "unibody_compact",
    designIdentity: "Narrow body with tall upright cabin maximizing interior space",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Tall_Cabin", "Vertical_Sides", "Sliding_Side_Doors"],
    defaultDimensions: {
      wheelbaseMm: 2460,
      frontTrackMm: 1300,
      rearTrackMm: 1290,
      overallLengthMm: 3395,
      overallWidthMm: 1475,
      overallHeightMm: 1780,
      groundClearanceMm: 150,
      frontOverhangMm: 520,
      rearOverhangMm: 415,
      cabinLengthMm: 2120,
      cabinHeightMm: 1380,
      enginePosition: "front",
    },
    seatingCapacity: 4,
    cargoCapacityL: 280,
    aerodynamicBaseline: { cd: 0.34, frontalAreaM2: 2.15, clBase: 0.02 },
  },

  // --- 3. Utility & Crossover Platform (5) ---
  suv: {
    id: "suv",
    name: "SUV",
    familyId: "utility_suv_crossover",
    designIdentity: "Tall utility vehicle with commanding driving position",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Raised_Cabin", "Pronounced_Wheel_Arches", "Rugged_Underbody"],
    defaultDimensions: {
      wheelbaseMm: 2950,
      frontTrackMm: 1680,
      rearTrackMm: 1690,
      overallLengthMm: 4950,
      overallWidthMm: 1980,
      overallHeightMm: 1780,
      groundClearanceMm: 215,
      frontOverhangMm: 940,
      rearOverhangMm: 1060,
      cabinLengthMm: 2650,
      cabinHeightMm: 1320,
      enginePosition: "front",
    },
    seatingCapacity: 7,
    cargoCapacityL: 750,
    aerodynamicBaseline: { cd: 0.35, frontalAreaM2: 2.85, clBase: 0.02 },
  },
  crossover: {
    id: "crossover",
    name: "Crossover",
    familyId: "utility_suv_crossover",
    designIdentity: "Car-based utility blending sedan comfort with SUV height",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Crossover_Shell", "Cladding_Trim", "Sleek_Greenhouse"],
    defaultDimensions: {
      wheelbaseMm: 2750,
      frontTrackMm: 1610,
      rearTrackMm: 1620,
      overallLengthMm: 4620,
      overallWidthMm: 1870,
      overallHeightMm: 1620,
      groundClearanceMm: 185,
      frontOverhangMm: 910,
      rearOverhangMm: 960,
      cabinLengthMm: 2420,
      cabinHeightMm: 1260,
      enginePosition: "front",
    },
    seatingCapacity: 5,
    cargoCapacityL: 540,
    aerodynamicBaseline: { cd: 0.32, frontalAreaM2: 2.50, clBase: -0.01 },
  },
  luxury_suv: {
    id: "luxury_suv",
    name: "Luxury SUV",
    familyId: "utility_suv_crossover",
    designIdentity: "Large premium utility with acoustic glass and executive seating",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Executive_Cabin", "Chrome_Accents", "Air_Suspension_Stance"],
    defaultDimensions: {
      wheelbaseMm: 3100,
      frontTrackMm: 1700,
      rearTrackMm: 1710,
      overallLengthMm: 5200,
      overallWidthMm: 2020,
      overallHeightMm: 1820,
      groundClearanceMm: 220,
      frontOverhangMm: 980,
      rearOverhangMm: 1120,
      cabinLengthMm: 2850,
      cabinHeightMm: 1340,
      enginePosition: "front",
    },
    seatingCapacity: 5,
    cargoCapacityL: 820,
    aerodynamicBaseline: { cd: 0.34, frontalAreaM2: 2.95, clBase: 0.01 },
  },
  performance_suv: {
    id: "performance_suv",
    name: "Performance SUV",
    familyId: "utility_suv_crossover",
    designIdentity: "Lower ride height, wide track, front splitters, and quad exhausts",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Aero_Fascia", "Lowered_Ride_Height", "Diffuser_Exhaust"],
    defaultDimensions: {
      wheelbaseMm: 2950,
      frontTrackMm: 1710,
      rearTrackMm: 1720,
      overallLengthMm: 4980,
      overallWidthMm: 2010,
      overallHeightMm: 1680,
      groundClearanceMm: 165,
      frontOverhangMm: 950,
      rearOverhangMm: 1080,
      cabinLengthMm: 2600,
      cabinHeightMm: 1280,
      enginePosition: "front",
    },
    seatingCapacity: 5,
    cargoCapacityL: 680,
    aerodynamicBaseline: { cd: 0.33, frontalAreaM2: 2.78, clBase: -0.08 },
  },
  offroad_suv: {
    id: "offroad_suv",
    name: "Off-Road SUV",
    familyId: "utility_suv_crossover",
    designIdentity: "Terrain-focused utility with differential lockers and rock sliders",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Skid_Plates", "High_Clearance_Arches", "External_Spare_Tire"],
    defaultDimensions: {
      wheelbaseMm: 2850,
      frontTrackMm: 1660,
      rearTrackMm: 1660,
      overallLengthMm: 4800,
      overallWidthMm: 1960,
      overallHeightMm: 1880,
      groundClearanceMm: 245,
      frontOverhangMm: 840,
      rearOverhangMm: 1110,
      cabinLengthMm: 2500,
      cabinHeightMm: 1360,
      enginePosition: "front",
    },
    seatingCapacity: 5,
    cargoCapacityL: 710,
    aerodynamicBaseline: { cd: 0.38, frontalAreaM2: 3.05, clBase: 0.05 },
  },

  // --- 4. Body-on-Frame Truck & Commercial (4) ---
  pickup_truck: {
    id: "pickup_truck",
    name: "Pickup Truck",
    familyId: "body_on_frame_truck",
    designIdentity: "Body-on-frame utility hauler with open cargo bed",
    typicalArchitecture: "body_on_frame",
    keyBlenderAssets: ["Ladder_Frame", "Cab_Module", "Cargo_Bed", "Tailgate", "Roll_Bar"],
    defaultDimensions: {
      wheelbaseMm: 3350,
      frontTrackMm: 1740,
      rearTrackMm: 1750,
      overallLengthMm: 5400,
      overallWidthMm: 2020,
      overallHeightMm: 1890,
      groundClearanceMm: 235,
      frontOverhangMm: 940,
      rearOverhangMm: 1110,
      cabinLengthMm: 2100,
      cabinHeightMm: 1320,
      enginePosition: "front",
    },
    seatingCapacity: 5,
    cargoCapacityL: 1450,
    aerodynamicBaseline: { cd: 0.38, frontalAreaM2: 3.10, clBase: 0.04 },
  },
  offroad_4x4: {
    id: "offroad_4x4",
    name: "Off-Road 4×4",
    familyId: "body_on_frame_truck",
    designIdentity: "Extreme terrain vehicle with solid axles and external accessories",
    typicalArchitecture: "body_on_frame",
    keyBlenderAssets: ["Solid_Axles", "Bullbar", "Snorkel", "Rock_Sliders", "Roof_Rack"],
    defaultDimensions: {
      wheelbaseMm: 2750,
      frontTrackMm: 1650,
      rearTrackMm: 1650,
      overallLengthMm: 4650,
      overallWidthMm: 1940,
      overallHeightMm: 1950,
      groundClearanceMm: 260,
      frontOverhangMm: 780,
      rearOverhangMm: 1120,
      cabinLengthMm: 2400,
      cabinHeightMm: 1380,
      enginePosition: "front",
    },
    seatingCapacity: 5,
    cargoCapacityL: 650,
    aerodynamicBaseline: { cd: 0.42, frontalAreaM2: 3.20, clBase: 0.08 },
  },
  cab_over_utility: {
    id: "cab_over_utility",
    name: "Cab-over Utility",
    familyId: "body_on_frame_truck",
    designIdentity: "Commercial forward-control cab over front axle maximizing deck length",
    typicalArchitecture: "body_on_frame",
    keyBlenderAssets: ["Cab_Over_Module", "Heavy_Ladder_Frame", "Drop_Side_Deck"],
    defaultDimensions: {
      wheelbaseMm: 2900,
      frontTrackMm: 1680,
      rearTrackMm: 1660,
      overallLengthMm: 4950,
      overallWidthMm: 1920,
      overallHeightMm: 2050,
      groundClearanceMm: 210,
      frontOverhangMm: 620,
      rearOverhangMm: 1430,
      cabinLengthMm: 1650,
      cabinHeightMm: 1420,
      enginePosition: "front",
    },
    seatingCapacity: 3,
    cargoCapacityL: 2200,
    aerodynamicBaseline: { cd: 0.44, frontalAreaM2: 3.35, clBase: 0.03 },
  },
  chassis_cab: {
    id: "chassis_cab",
    name: "Chassis Cab",
    familyId: "body_on_frame_truck",
    designIdentity: "Bare rear frame rails ready for tipper, camper, or utility box",
    typicalArchitecture: "body_on_frame",
    keyBlenderAssets: ["Enclosed_Cab", "Exposed_Rear_Frame", "Commercial_Tanks"],
    defaultDimensions: {
      wheelbaseMm: 3450,
      frontTrackMm: 1740,
      rearTrackMm: 1750,
      overallLengthMm: 5600,
      overallWidthMm: 2020,
      overallHeightMm: 1910,
      groundClearanceMm: 225,
      frontOverhangMm: 940,
      rearOverhangMm: 1210,
      cabinLengthMm: 1850,
      cabinHeightMm: 1340,
      enginePosition: "front",
    },
    seatingCapacity: 3,
    cargoCapacityL: 3000,
    aerodynamicBaseline: { cd: 0.41, frontalAreaM2: 3.15, clBase: 0.02 },
  },

  // --- 5. Commercial High-Volume / MPV (5) ---
  cargo_van: {
    id: "cargo_van",
    name: "Cargo Van",
    familyId: "commercial_van_bus",
    designIdentity: "High-roof commercial volume van with rear barn doors",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["High_Roof", "Sliding_Side_Door", "Rear_Barn_Doors", "Flat_Cargo_Floor"],
    defaultDimensions: {
      wheelbaseMm: 3300,
      frontTrackMm: 1720,
      rearTrackMm: 1720,
      overallLengthMm: 5350,
      overallWidthMm: 2000,
      overallHeightMm: 2250,
      groundClearanceMm: 180,
      frontOverhangMm: 920,
      rearOverhangMm: 1130,
      cabinLengthMm: 3600,
      cabinHeightMm: 1650,
      enginePosition: "front",
    },
    seatingCapacity: 2,
    cargoCapacityL: 6200,
    aerodynamicBaseline: { cd: 0.36, frontalAreaM2: 3.50, clBase: 0.02 },
  },
  minivan_mpv: {
    id: "minivan_mpv",
    name: "Minivan / MPV",
    familyId: "commercial_van_bus",
    designIdentity: "Maximum passenger volume with folding 7-to-8 seat layout",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Dual_Sliding_Doors", "Folding_Seat_Rows", "Aero_Nose"],
    defaultDimensions: {
      wheelbaseMm: 3100,
      frontTrackMm: 1700,
      rearTrackMm: 1710,
      overallLengthMm: 5150,
      overallWidthMm: 1980,
      overallHeightMm: 1780,
      groundClearanceMm: 160,
      frontOverhangMm: 950,
      rearOverhangMm: 1100,
      cabinLengthMm: 3200,
      cabinHeightMm: 1350,
      enginePosition: "front",
    },
    seatingCapacity: 8,
    cargoCapacityL: 850,
    aerodynamicBaseline: { cd: 0.32, frontalAreaM2: 2.85, clBase: 0.00 },
  },
  microvan: {
    id: "microvan",
    name: "Microvan",
    familyId: "commercial_van_bus",
    designIdentity: "Extremely short nose with high upright cabin for city deliveries",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Cab_Forward_Front", "Boxy_Cargo_Shell", "Vertical_Tailgate"],
    defaultDimensions: {
      wheelbaseMm: 2450,
      frontTrackMm: 1320,
      rearTrackMm: 1310,
      overallLengthMm: 3400,
      overallWidthMm: 1480,
      overallHeightMm: 1880,
      groundClearanceMm: 160,
      frontOverhangMm: 510,
      rearOverhangMm: 440,
      cabinLengthMm: 2250,
      cabinHeightMm: 1420,
      enginePosition: "front",
    },
    seatingCapacity: 2,
    cargoCapacityL: 1800,
    aerodynamicBaseline: { cd: 0.37, frontalAreaM2: 2.28, clBase: 0.03 },
  },
  motorhome_camper: {
    id: "motorhome_camper",
    name: "Motorhome / Camper",
    familyId: "commercial_van_bus",
    designIdentity: "Recreational vehicle with integrated living quarters and pop-top roof",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Camper_High_Roof", "Side_Awning", "Living_Module_Windows"],
    defaultDimensions: {
      wheelbaseMm: 3450,
      frontTrackMm: 1740,
      rearTrackMm: 1750,
      overallLengthMm: 5800,
      overallWidthMm: 2060,
      overallHeightMm: 2450,
      groundClearanceMm: 195,
      frontOverhangMm: 950,
      rearOverhangMm: 1400,
      cabinLengthMm: 4000,
      cabinHeightMm: 1850,
      enginePosition: "front",
    },
    seatingCapacity: 4,
    cargoCapacityL: 4500,
    aerodynamicBaseline: { cd: 0.40, frontalAreaM2: 3.85, clBase: 0.05 },
  },
  bus_shuttle: {
    id: "bus_shuttle",
    name: "Bus / Shuttle",
    familyId: "commercial_van_bus",
    designIdentity: "Multi-passenger shuttle with wide entry doors and panoramic glazing",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Panoramic_Glazing", "Passenger_Swing_Door", "High_Capacity_Aisle"],
    defaultDimensions: {
      wheelbaseMm: 3950,
      frontTrackMm: 1780,
      rearTrackMm: 1780,
      overallLengthMm: 6800,
      overallWidthMm: 2120,
      overallHeightMm: 2550,
      groundClearanceMm: 180,
      frontOverhangMm: 1020,
      rearOverhangMm: 1830,
      cabinLengthMm: 4900,
      cabinHeightMm: 1920,
      enginePosition: "front",
    },
    seatingCapacity: 16,
    cargoCapacityL: 2500,
    aerodynamicBaseline: { cd: 0.38, frontalAreaM2: 4.20, clBase: 0.01 },
  },

  // --- 6. Mid-Engine Carbon Monocoque (3) ---
  supercar: {
    id: "supercar",
    name: "Supercar / Mid-Engine",
    familyId: "high_downforce_supercar",
    designIdentity: "Low wedge nose, mid-engine bay, and venturi tunnel undertray",
    typicalArchitecture: "carbon_tub",
    keyBlenderAssets: ["Supercar_Nose", "Sidepod_Intakes", "Engine_Glass_Bonnet", "Venturi_Diffuser"],
    defaultDimensions: {
      wheelbaseMm: 2650,
      frontTrackMm: 1700,
      rearTrackMm: 1680,
      overallLengthMm: 4580,
      overallWidthMm: 1980,
      overallHeightMm: 1180,
      groundClearanceMm: 100,
      frontOverhangMm: 980,
      rearOverhangMm: 950,
      cabinLengthMm: 1550,
      cabinHeightMm: 1020,
      enginePosition: "mid",
    },
    seatingCapacity: 2,
    cargoCapacityL: 140,
    aerodynamicBaseline: { cd: 0.32, frontalAreaM2: 1.95, clBase: -0.35 },
  },
  hypercar: {
    id: "hypercar",
    name: "Hypercar",
    familyId: "high_downforce_supercar",
    designIdentity: "Maximum performance carbon tub with active DRS wing and floor tunnels",
    typicalArchitecture: "carbon_tub",
    keyBlenderAssets: ["Active_Aero_Wing", "DRS_Pylons", "Floor_Tunnels", "Air_Curtains"],
    defaultDimensions: {
      wheelbaseMm: 2720,
      frontTrackMm: 1720,
      rearTrackMm: 1700,
      overallLengthMm: 4680,
      overallWidthMm: 2020,
      overallHeightMm: 1140,
      groundClearanceMm: 85,
      frontOverhangMm: 1020,
      rearOverhangMm: 940,
      cabinLengthMm: 1520,
      cabinHeightMm: 990,
      enginePosition: "mid",
    },
    seatingCapacity: 2,
    cargoCapacityL: 110,
    aerodynamicBaseline: { cd: 0.35, frontalAreaM2: 1.90, clBase: -0.85 },
  },
  track_special: {
    id: "track_special",
    name: "Track Special",
    familyId: "high_downforce_supercar",
    designIdentity: "Circuit-focused lightweight tub with FIA cage and high-downforce aero",
    typicalArchitecture: "carbon_tub",
    keyBlenderAssets: ["FIA_Roll_Cage", "Swan_Neck_Wing", "Splitter_Endplates", "Stripped_Cockpit"],
    defaultDimensions: {
      wheelbaseMm: 2680,
      frontTrackMm: 1740,
      rearTrackMm: 1720,
      overallLengthMm: 4640,
      overallWidthMm: 2040,
      overallHeightMm: 1160,
      groundClearanceMm: 70,
      frontOverhangMm: 1050,
      rearOverhangMm: 910,
      cabinLengthMm: 1500,
      cabinHeightMm: 1010,
      enginePosition: "mid",
    },
    seatingCapacity: 1,
    cargoCapacityL: 0,
    aerodynamicBaseline: { cd: 0.38, frontalAreaM2: 1.96, clBase: -1.15 },
  },

  // --- 7. Open-Top Reinforced Platform (2) ---
  roadster: {
    id: "roadster",
    name: "Roadster / Spyder",
    familyId: "open_top_gt",
    designIdentity: "Lightweight 2-seater open cockpit with twin aerodynamic rear nacelles",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Convertible_Frame", "Rear_Speedster_Nacelles", "Wind_Deflector"],
    defaultDimensions: {
      wheelbaseMm: 2480,
      frontTrackMm: 1580,
      rearTrackMm: 1600,
      overallLengthMm: 4120,
      overallWidthMm: 1840,
      overallHeightMm: 1240,
      groundClearanceMm: 125,
      frontOverhangMm: 820,
      rearOverhangMm: 820,
      cabinLengthMm: 1480,
      cabinHeightMm: 1060,
      enginePosition: "front",
    },
    seatingCapacity: 2,
    cargoCapacityL: 180,
    aerodynamicBaseline: { cd: 0.33, frontalAreaM2: 1.88, clBase: -0.04 },
  },
  convertible: {
    id: "convertible",
    name: "Convertible",
    familyId: "open_top_gt",
    designIdentity: "Open-air 2+2 grand tourer with motorized folding fabric/hard roof",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Folding_Roof_Mechanism", "Reinforced_A_Pillars", "Stiffened_Sills"],
    defaultDimensions: {
      wheelbaseMm: 2750,
      frontTrackMm: 1610,
      rearTrackMm: 1620,
      overallLengthMm: 4700,
      overallWidthMm: 1890,
      overallHeightMm: 1390,
      groundClearanceMm: 135,
      frontOverhangMm: 910,
      rearOverhangMm: 1040,
      cabinLengthMm: 1980,
      cabinHeightMm: 1140,
      enginePosition: "front",
    },
    seatingCapacity: 4,
    cargoCapacityL: 290,
    aerodynamicBaseline: { cd: 0.32, frontalAreaM2: 2.16, clBase: -0.03 },
  },

  // --- 8. Tubular & Specialty Platform (6) ---
  sport_wagon: {
    id: "sport_wagon",
    name: "Sport Wagon",
    familyId: "tubular_specialty",
    designIdentity: "Performance estate with competition widebody and aggressive aero",
    typicalArchitecture: "unibody",
    keyBlenderAssets: ["Wagon_Body", "Performance_Diffuser", "Front_Canards"],
    defaultDimensions: {
      wheelbaseMm: 2850,
      frontTrackMm: 1650,
      rearTrackMm: 1660,
      overallLengthMm: 4890,
      overallWidthMm: 1920,
      overallHeightMm: 1440,
      groundClearanceMm: 125,
      frontOverhangMm: 920,
      rearOverhangMm: 1120,
      cabinLengthMm: 2680,
      cabinHeightMm: 1180,
      enginePosition: "front",
    },
    seatingCapacity: 5,
    cargoCapacityL: 610,
    aerodynamicBaseline: { cd: 0.30, frontalAreaM2: 2.32, clBase: -0.15 },
  },
  shooting_brake_ev: {
    id: "shooting_brake_ev",
    name: "Shooting Brake EV",
    familyId: "tubular_specialty",
    designIdentity: "Electric GT utility on a flat skateboard battery platform with frunk",
    typicalArchitecture: "ev_skateboard",
    keyBlenderAssets: ["EV_Skateboard_Floor", "Frunk_Enclosure", "Aero_Flush_Handles"],
    defaultDimensions: {
      wheelbaseMm: 2980,
      frontTrackMm: 1670,
      rearTrackMm: 1680,
      overallLengthMm: 4920,
      overallWidthMm: 1960,
      overallHeightMm: 1410,
      groundClearanceMm: 135,
      frontOverhangMm: 890,
      rearOverhangMm: 1050,
      cabinLengthMm: 2550,
      cabinHeightMm: 1160,
      enginePosition: "mid",
      batteryLengthMm: 1850,
    },
    seatingCapacity: 5,
    cargoCapacityL: 520,
    aerodynamicBaseline: { cd: 0.24, frontalAreaM2: 2.25, clBase: -0.05 },
  },
  rally_car: {
    id: "rally_car",
    name: "Rally Car",
    familyId: "tubular_specialty",
    designIdentity: "Competition AWD stage racer with wide arches, roof scoop, and mudflaps",
    typicalArchitecture: "spaceframe",
    keyBlenderAssets: ["Widebody_Arches", "Roof_Air_Scoop", "Rally_Light_Pod", "Underbody_Armor"],
    defaultDimensions: {
      wheelbaseMm: 2580,
      frontTrackMm: 1620,
      rearTrackMm: 1620,
      overallLengthMm: 4180,
      overallWidthMm: 1860,
      overallHeightMm: 1480,
      groundClearanceMm: 180,
      frontOverhangMm: 820,
      rearOverhangMm: 780,
      cabinLengthMm: 2050,
      cabinHeightMm: 1200,
      enginePosition: "front",
    },
    seatingCapacity: 2,
    cargoCapacityL: 120,
    aerodynamicBaseline: { cd: 0.35, frontalAreaM2: 2.30, clBase: -0.25 },
  },
  dune_buggy: {
    id: "dune_buggy",
    name: "Dune Buggy",
    familyId: "tubular_specialty",
    designIdentity: "Lightweight off-road vehicle with exposed tubular chromoly cage",
    typicalArchitecture: "tubular",
    keyBlenderAssets: ["Exposed_Tube_Chassis", "Long_Travel_Coilovers", "Fiberglass_Beaded_Panels"],
    defaultDimensions: {
      wheelbaseMm: 2450,
      frontTrackMm: 1720,
      rearTrackMm: 1740,
      overallLengthMm: 3750,
      overallWidthMm: 1980,
      overallHeightMm: 1650,
      groundClearanceMm: 310,
      frontOverhangMm: 620,
      rearOverhangMm: 680,
      cabinLengthMm: 1680,
      cabinHeightMm: 1250,
      enginePosition: "rear",
    },
    seatingCapacity: 2,
    cargoCapacityL: 90,
    aerodynamicBaseline: { cd: 0.52, frontalAreaM2: 2.45, clBase: 0.12 },
  },
  beach_buggy: {
    id: "beach_buggy",
    name: "Beach Buggy",
    familyId: "tubular_specialty",
    designIdentity: "Recreational open-air beach vehicle with simple tub body and roll bar",
    typicalArchitecture: "tubular",
    keyBlenderAssets: ["Tub_Body_Fiberglass", "Roll_Bar_Hoop", "Flared_Wide_Fenders"],
    defaultDimensions: {
      wheelbaseMm: 2320,
      frontTrackMm: 1560,
      rearTrackMm: 1580,
      overallLengthMm: 3550,
      overallWidthMm: 1820,
      overallHeightMm: 1520,
      groundClearanceMm: 220,
      frontOverhangMm: 580,
      rearOverhangMm: 650,
      cabinLengthMm: 1650,
      cabinHeightMm: 1180,
      enginePosition: "rear",
    },
    seatingCapacity: 4,
    cargoCapacityL: 140,
    aerodynamicBaseline: { cd: 0.48, frontalAreaM2: 2.20, clBase: 0.08 },
  },
  three_wheeler: {
    id: "three_wheeler",
    name: "Three-Wheeler",
    familyId: "tubular_specialty",
    designIdentity: "Lightweight niche 1+2 reverse trike (dual front steering, single rear drive)",
    typicalArchitecture: "tubular",
    keyBlenderAssets: ["Trike_Tubular_Frame", "Single_Rear_Swingarm", "Exposed_V_Twin"],
    defaultDimensions: {
      wheelbaseMm: 2380,
      frontTrackMm: 1620,
      rearTrackMm: 0,
      overallLengthMm: 3450,
      overallWidthMm: 1780,
      overallHeightMm: 1120,
      groundClearanceMm: 115,
      frontOverhangMm: 680,
      rearOverhangMm: 390,
      cabinLengthMm: 1350,
      cabinHeightMm: 950,
      enginePosition: "front",
    },
    seatingCapacity: 2,
    cargoCapacityL: 75,
    aerodynamicBaseline: { cd: 0.36, frontalAreaM2: 1.55, clBase: -0.02 },
  },
};

/**
 * ----------------------------------------------------------------------------
 * 3. DETERMINISTIC BLENDER NODE NAMING CONTRACT
 * ----------------------------------------------------------------------------
 * Maps vehicle structural components to standard programmatic names.
 * Ensures 100% interoperability with Three.js hierarchy traversals.
 */
export const DETERMINISTIC_NODE_MAP = {
  // Layer 1: Platform
  chassis: "CHASSIS_Main_Rails",
  subframeFront: "CHASSIS_Subframe_Front",
  subframeRear: "CHASSIS_Subframe_Rear",
  floorPan: "CHASSIS_Floor_Pan",
  suspensionFL: "SUSP_FL_Assembly",
  suspensionFR: "SUSP_FR_Assembly",
  suspensionRL: "SUSP_RL_Assembly",
  suspensionRR: "SUSP_RR_Assembly",

  // Layer 2: Body Architecture
  frontClip: "BODY_FrontClip",
  cabin: "BODY_Cabin",
  doors: "BODY_Doors",
  roof: "BODY_Roof",
  rearClip: "BODY_RearClip",
  hood: "BODY_Hood",
  trunkHatch: "BODY_TrunkHatch",
  fenders: "BODY_Fenders",

  // Layer 3: Design Kit & Aero
  frontSplitter: "AERO_FrontSplitter",
  canards: "AERO_Canards",
  sideSkirts: "AERO_SideSkirts",
  diffuser: "AERO_Diffuser",
  rearSpoiler: "AERO_RearSpoiler",
  rearWing: "AERO_RearWing",
  activeHinge: "AERO_Active_Hinge",

  // Wheels, Glass, Lighting & Cockpit
  wheelFL: "WHEEL_FL",
  wheelFR: "WHEEL_FR",
  wheelRL: "WHEEL_RL",
  wheelRR: "WHEEL_RR",
  glassWindshield: "GLASS_Windshield",
  glassSideFront: "GLASS_SideFront",
  glassSideRear: "GLASS_SideRear",
  glassRear: "GLASS_Rear",
  headlampL: "LIGHT_Headlamp_L",
  headlampR: "LIGHT_Headlamp_R",
  taillampL: "LIGHT_Taillamp_L",
  taillampR: "LIGHT_Taillamp_R",
  dashboard: "INTERIOR_Dashboard",
  seats: "INTERIOR_Seats",
  steering: "INTERIOR_Steering",
  console: "INTERIOR_Console",
} as const;

/**
 * ----------------------------------------------------------------------------
 * 4. PARAMETRIC PLATFORM SOLVER
 * ----------------------------------------------------------------------------
 * Translates dimension inputs into exact 3D Cartesian coordinates (Three.js space:
 * +X Right, +Y Up, -Z Forward, +Z Rearward) for snapping and assembly.
 */
export function calculatePlatformHardpoints(dims: PlatformDimensions): PlatformHardpoints {
  const halfWb = (dims.wheelbaseMm / 1000) / 2.0;
  const halfTrackF = (dims.frontTrackMm / 1000) / 2.0;
  const halfTrackR = (dims.rearTrackMm / 1000) / 2.0;
  const groundClr = dims.groundClearanceMm / 1000;
  const wheelRadius = 0.34; // standard 680mm tire diameter
  const wheelCenterY = groundClr + wheelRadius;

  return {
    wheelCenters: {
      fl: [halfTrackF, wheelCenterY, -halfWb],
      fr: [-halfTrackF, wheelCenterY, -halfWb],
      rl: [halfTrackR, wheelCenterY, halfWb],
      rr: [-halfTrackR, wheelCenterY, halfWb],
    },
    suspensionPivots: {
      frontSubframeCenter: [0, groundClr + 0.12, -halfWb],
      rearSubframeCenter: [0, groundClr + 0.14, halfWb],
    },
    powertrainEnvelope: {
      origin: [0, groundClr + 0.25, dims.enginePosition === "mid" ? 0.2 : dims.enginePosition === "rear" ? halfWb + 0.3 : -halfWb + 0.2],
      dimensions: [0.75, 0.65, 0.90],
    },
    cabinEnvelope: {
      origin: [0, groundClr + 0.30, 0],
      dimensions: [dims.overallWidthMm / 1000 * 0.85, dims.cabinHeightMm / 1000, dims.cabinLengthMm / 1000],
    },
    chassisRails: {
      leftRailStart: [halfTrackF * 0.55, groundClr + 0.10, -(dims.overallLengthMm / 2000) + (dims.frontOverhangMm / 1000 * 0.4)],
      leftRailEnd: [halfTrackR * 0.55, groundClr + 0.10, (dims.overallLengthMm / 2000) - (dims.rearOverhangMm / 1000 * 0.4)],
      rightRailStart: [-halfTrackF * 0.55, groundClr + 0.10, -(dims.overallLengthMm / 2000) + (dims.frontOverhangMm / 1000 * 0.4)],
      rightRailEnd: [-halfTrackR * 0.55, groundClr + 0.10, (dims.overallLengthMm / 2000) - (dims.rearOverhangMm / 1000 * 0.4)],
    },
  };
}

/**
 * ----------------------------------------------------------------------------
 * 5. MORPHING CONTINUITY VERIFIER
 * ----------------------------------------------------------------------------
 * Computes delta transforms between a base body and morphed variant
 * (e.g. Sedan -> Wagon -> Shooting Brake).
 */
export function getMorphDeltas(sourceId: VehicleBodyTypeId, targetId: VehicleBodyTypeId): BodyMorphParameters {
  const target = BODY_TYPE_REGISTRY[targetId];
  if (!target.morphParameters) {
    return {
      roofLengthDeltaMm: 0,
      roofHeightDeltaMm: 0,
      doorLengthDeltaMm: 0,
      rearRakeAngleDeg: 15,
      dPillarRequired: false,
      cargoExtensionMm: 0,
      tailgateStyle: "sedan_trunk",
    };
  }
  return target.morphParameters;
}

export const VEHICLE_BODY_TYPE_REGISTRY = BODY_TYPE_REGISTRY;

export function getAllBodyTypeIds(): VehicleBodyTypeId[] {
  return Object.keys(BODY_TYPE_REGISTRY) as VehicleBodyTypeId[];
}

export function getAllPlatformFamilyIds(): PlatformFamilyId[] {
  return Object.keys(PLATFORM_FAMILIES) as PlatformFamilyId[];
}

/**
 * ----------------------------------------------------------------------------
 * 6. SIX-BRANCH BLENDER ASSET ARCHITECTURE
 * ----------------------------------------------------------------------------
 * VEHICLE
 * ├── PLATFORM (Chassis, Front_Subframe, Rear_Subframe, Suspension_FL, Suspension_FR, Suspension_RL, Suspension_RR)
 * ├── BODY (Front_Clip, Cabin, Doors, Roof, Rear_Clip, Hood, Trunk_Hatch, Fenders)
 * ├── AERO (Front_Splitter, Canards, Side_Skirts, Diffuser, Rear_Spoiler, Rear_Wing)
 * ├── WHEELS (Wheel_FL, Wheel_FR, Wheel_RL, Wheel_RR)
 * ├── GLASS (Windshield, Front_Side, Rear_Side, Rear_Glass)
 * └── INTERIOR (Dashboard, Seats, Steering, Console, Door_Panels)
 */
export const BLENDER_ASSET_HIERARCHY = {
  PLATFORM: [
    "Chassis",
    "Front_Subframe",
    "Rear_Subframe",
    "Suspension_FL",
    "Suspension_FR",
    "Suspension_RL",
    "Suspension_RR",
  ],
  BODY: [
    "Front_Clip",
    "Cabin",
    "Doors",
    "Roof",
    "Rear_Clip",
    "Hood",
    "Trunk_Hatch",
    "Fenders",
  ],
  AERO: [
    "Front_Splitter",
    "Canards",
    "Side_Skirts",
    "Diffuser",
    "Rear_Spoiler",
    "Rear_Wing",
  ],
  WHEELS: [
    "Wheel_FL",
    "Wheel_FR",
    "Wheel_RL",
    "Wheel_RR",
  ],
  GLASS: [
    "Windshield",
    "Front_Side",
    "Rear_Side",
    "Rear_Glass",
  ],
  INTERIOR: [
    "Dashboard",
    "Seats",
    "Steering",
    "Console",
    "Door_Panels",
  ],
} as const;

/**
 * ----------------------------------------------------------------------------
 * 7. SPECIALIZED CAD MODULE CALCULATORS
 * ----------------------------------------------------------------------------
 */

/** Hypercar Active Aero calculations with real transform limits (-15 deg to +35 deg) */
export function calculateHypercarActiveAero(
  wingAngleDeg: number,
  drsActive: boolean = false
): HypercarActiveAeroState {
  const clampedAngle = Math.max(-15, Math.min(35, wingAngleDeg));
  const effectiveAngle = drsActive ? Math.min(clampedAngle, -10) : clampedAngle;

  // Downforce at 250 km/h: base 450 kg, scaling with wing AoA
  // At -15 deg: 180 kg; at 0 deg: 450 kg; at +35 deg: 920 kg (Airbrake mode)
  const angleNormalized = (effectiveAngle + 15) / 50; // 0 to 1
  const downforceKgAt250Kmh = Math.round(180 + angleNormalized * 740);

  // Drag delta: DRS reduces Cd by 0.08, high wing angle adds up to 0.14
  const dragCdDelta = drsActive ? -0.065 : Math.round((0.0035 * Math.max(0, effectiveAngle)) * 1000) / 1000;

  // Aero balance shifts rearward as rear wing angle increases
  const aeroBalanceFrontPct = Math.round((46 - angleNormalized * 11) * 10) / 10;

  // Lap time delta (seconds per lap around reference GP circuit)
  const lapTimeDeltaSec = Math.round((-(angleNormalized * 1.85) + (drsActive ? -0.45 : 0)) * 100) / 100;

  return {
    wingAngleDeg: clampedAngle,
    drsActive,
    downforceKgAt250Kmh,
    dragCdDelta,
    aeroBalanceFrontPct,
    lapTimeDeltaSec,
  };
}

/** Convertible / Roadster roof mechanism state (0.0 = UP/Closed, 1.0 = DOWN/Open) */
export function calculateConvertibleRoof(roofPosition: number): ConvertibleRoofState {
  const clampedPos = Math.max(0.0, Math.min(1.0, roofPosition));
  const state: "roof_up" | "roof_down" | "in_motion" =
    clampedPos === 0.0 ? "roof_up" : clampedPos === 1.0 ? "roof_down" : "in_motion";

  // Open roof incurs a +0.045 Cd penalty due to turbulent cockpit cavity
  const cdDelta = Math.round(clampedPos * 0.045 * 1000) / 1000;

  // Structural rigidity penalty without roof truss (up to 18.5% without coupe roof cantrail)
  const structuralRigidityPenaltyPct = Math.round(clampedPos * 18.5 * 10) / 10;

  return {
    roofPosition: clampedPos,
    state,
    cdDelta,
    structuralRigidityPenaltyPct,
  };
}

/** Van / MPV modular interior seating configuration and volume */
export function calculateVanInteriorVolume(seatConfig: VanSeatConfig): VanInteriorVolumeState {
  switch (seatConfig) {
    case "2_seat_cargo":
      return {
        seatConfig,
        passengerCount: 2,
        cargoVolumeL: 5800,
        floorPayloadKg: 1450,
      };
    case "5_seat":
      return {
        seatConfig,
        passengerCount: 5,
        cargoVolumeL: 3850,
        floorPayloadKg: 1100,
      };
    case "7_seat":
      return {
        seatConfig,
        passengerCount: 7,
        cargoVolumeL: 2400,
        floorPayloadKg: 850,
      };
    case "8_seat":
      return {
        seatConfig,
        passengerCount: 8,
        cargoVolumeL: 1800,
        floorPayloadKg: 780,
      };
    case "9_seat":
      return {
        seatConfig,
        passengerCount: 9,
        cargoVolumeL: 1200,
        floorPayloadKg: 700,
      };
  }
}

/** Off-Road platform dynamic suspension clearance and tire geometry */
export function calculateOffRoadClearance(
  rideHeightMm: number,
  tireDiameterInches: number
): OffRoadSuspensionState {
  const clampedRideHeight = Math.max(180, Math.min(360, rideHeightMm));
  const clampedTireDia = Math.max(30, Math.min(42, tireDiameterInches));

  // Base tire reference is 32 inches. Every +1 inch adds 12.7mm (0.5 inch) to axle ground clearance
  const tireRadiusBonusMm = (clampedTireDia - 32) * 12.7;
  const effectiveGroundClearanceMm = Math.round(clampedRideHeight + tireRadiusBonusMm);

  // Long travel shock absorber travel capacity
  const suspensionTravelMm = Math.round(220 + (clampedRideHeight - 180) * 0.55);

  // Fender clearance decreases as tire diameter grows
  const fenderClearanceMm = Math.round(Math.max(20, 110 - (clampedTireDia - 32) * 12.7 + (clampedRideHeight - 220) * 0.4));

  return {
    rideHeightMm: clampedRideHeight,
    tireDiameterInches: clampedTireDia,
    effectiveGroundClearanceMm,
    suspensionTravelMm,
    fenderClearanceMm,
  };
}

/** Commercial frame modular rear body specifications */
export const COMMERCIAL_BODY_REGISTRY: Record<CommercialBodyType, CommercialBodySpec> = {
  flatbed: {
    bodyType: "flatbed",
    label: "Heavy-Duty Flatbed Bed",
    payloadCapacityKg: 2400,
    cargoVolumeM3: 6.5,
    tareWeightKg: 420,
    glbFilename: "commercial_flatbed.glb",
  },
  cargo_box: {
    bodyType: "cargo_box",
    label: "Enclosed Dry Freight Box",
    payloadCapacityKg: 1950,
    cargoVolumeM3: 18.5,
    tareWeightKg: 680,
    glbFilename: "commercial_cargo_box.glb",
  },
  refrigerated_box: {
    bodyType: "refrigerated_box",
    label: "Insulated Reefer Chill Box",
    payloadCapacityKg: 1650,
    cargoVolumeM3: 15.2,
    tareWeightKg: 920,
    glbFilename: "commercial_reefer.glb",
  },
  tipper: {
    bodyType: "tipper",
    label: "Hydraulic Dump Tipper",
    payloadCapacityKg: 2200,
    cargoVolumeM3: 8.0,
    tareWeightKg: 780,
    glbFilename: "commercial_tipper.glb",
  },
  service_body: {
    bodyType: "service_body",
    label: "Utility Fleet Tool Service Bed",
    payloadCapacityKg: 1800,
    cargoVolumeM3: 11.0,
    tareWeightKg: 710,
    glbFilename: "commercial_service_body.glb",
  },
  camper: {
    bodyType: "camper",
    label: "Integrated Living Motorhome Module",
    payloadCapacityKg: 1100,
    cargoVolumeM3: 22.0,
    tareWeightKg: 1150,
    glbFilename: "commercial_camper.glb",
  },
  passenger_body: {
    bodyType: "passenger_body",
    label: "16-Passenger Executive Shuttle Body",
    payloadCapacityKg: 1450,
    cargoVolumeM3: 19.0,
    tareWeightKg: 980,
    glbFilename: "commercial_passenger_body.glb",
  },
};
