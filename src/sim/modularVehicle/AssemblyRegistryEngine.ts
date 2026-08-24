/**
 * ============================================================================
 * MODULAR ASSEMBLY COMPONENT REGISTRY & INTERFACE ENGINE
 * ============================================================================
 * Defines physical metadata, 3D mounting hardpoints, center of mass offsets,
 * interface connectors, and compatibility matrices for all vehicle components.
 */

export type AssemblySubsystemCategory =
  | "chassis"
  | "engine"
  | "transmission"
  | "suspension"
  | "brakes"
  | "wheels"
  | "body"
  | "glass"
  | "interior"
  | "electronics"
  | "exhaust"
  | "aero";

export type ComponentInterfaceType =
  | "engine_mount"
  | "transmission_bellhousing"
  | "driveshaft_flange"
  | "suspension_hardpoint"
  | "wheel_hub"
  | "brake_caliper_bracket"
  | "chassis_body_bolt"
  | "glass_channel"
  | "cockpit_floor_rail"
  | "wiring_harness_plug"
  | "exhaust_flange"
  | "aero_pylon_bracket";

export interface ComponentMountPointDef {
  id: string;
  name: string;
  interfaceType: ComponentInterfaceType;
  positionMm: [number, number, number]; // [X, Y, Z] relative to chassis datum (0,0,0)
  orientationVector?: [number, number, number];
}

export interface ComponentManifest {
  id: string;
  name: string;
  category: AssemblySubsystemCategory;
  massKg: number;
  comOffsetMm: [number, number, number]; // 3D Center of Mass offset from component local origin
  dimensionsMm: [number, number, number]; // [Width, Height, Length]
  mountPoints: ComponentMountPointDef[];
  interfaces: {
    connectsTo: string; // Target interface id
    interfaceType: ComponentInterfaceType;
    required: boolean;
  }[];
  compatibleChassis: string[];
  requiredNeighbours: string[];
  thermalLoadKw?: number;
  electricalDemandW?: number;
}

export interface ComputedVehiclePhysicalState {
  totalCurbWeightKg: number;
  centerOfMassMm: [number, number, number]; // [X, Y, Z] in mm relative to front axle center
  weightDistributionFrontPct: number;
  weightDistributionRearPct: number;
  weightDistributionLeftPct: number;
  weightDistributionRightPct: number;
  unsprungMassKg: number;
  sprungMassKg: number;
  momentOfInertiaYawKgm2: number;
  momentOfInertiaPitchKgm2: number;
  momentOfInertiaRollKgm2: number;
}

/**
 * Calculates total mass, 3D Center of Mass, and moment of inertia
 * from all currently installed component manifests.
 */
export function computeAssemblyPhysicalState(
  installedManifests: ComponentManifest[],
  wheelbaseMm: number
): ComputedVehiclePhysicalState {
  if (installedManifests.length === 0) {
    return {
      totalCurbWeightKg: 0,
      centerOfMassMm: [0, 0, 0],
      weightDistributionFrontPct: 50,
      weightDistributionRearPct: 50,
      weightDistributionLeftPct: 50,
      weightDistributionRightPct: 50,
      unsprungMassKg: 0,
      sprungMassKg: 0,
      momentOfInertiaYawKgm2: 0,
      momentOfInertiaPitchKgm2: 0,
      momentOfInertiaRollKgm2: 0,
    };
  }

  let totalMass = 0;
  let totalMomentX = 0;
  let totalMomentY = 0;
  let totalMomentZ = 0;
  let unsprungMass = 0;

  for (const comp of installedManifests) {
    totalMass += comp.massKg;
    totalMomentX += comp.massKg * comp.comOffsetMm[0];
    totalMomentY += comp.massKg * comp.comOffsetMm[1];
    totalMomentZ += comp.massKg * comp.comOffsetMm[2];

    if (comp.category === "wheels" || comp.category === "brakes") {
      unsprungMass += comp.massKg;
    }
  }

  const comX = totalMomentX / totalMass;
  const comY = totalMomentY / totalMass;
  const comZ = totalMomentZ / totalMass;

  // Front vs Rear weight distribution based on wheelbase and Z-coordinate of CoM
  // Z=0 is center of wheelbase, -wb/2 is front axle, +wb/2 is rear axle
  const halfWb = wheelbaseMm / 2;
  const distToRearAxle = halfWb - comZ;
  const frontPct = Math.min(75, Math.max(25, (distToRearAxle / wheelbaseMm) * 100));
  const rearPct = 100 - frontPct;

  // Left vs Right weight distribution based on X-coordinate
  const leftPct = Math.min(60, Math.max(40, 50 - (comX / 10)));
  const rightPct = 100 - leftPct;

  // Estimated Inertia
  const yawInertia = totalMass * Math.pow((wheelbaseMm / 1000) * 0.48, 2);
  const pitchInertia = totalMass * Math.pow((wheelbaseMm / 1000) * 0.44, 2);
  const rollInertia = totalMass * Math.pow(1.6 * 0.32, 2);

  return {
    totalCurbWeightKg: Math.round(totalMass),
    centerOfMassMm: [Math.round(comX), Math.round(comY), Math.round(comZ)],
    weightDistributionFrontPct: Math.round(frontPct * 10) / 10,
    weightDistributionRearPct: Math.round(rearPct * 10) / 10,
    weightDistributionLeftPct: Math.round(leftPct * 10) / 10,
    weightDistributionRightPct: Math.round(rightPct * 10) / 10,
    unsprungMassKg: Math.round(unsprungMass),
    sprungMassKg: Math.round(totalMass - unsprungMass),
    momentOfInertiaYawKgm2: Math.round(yawInertia),
    momentOfInertiaPitchKgm2: Math.round(pitchInertia),
    momentOfInertiaRollKgm2: Math.round(rollInertia),
  };
}

/**
 * Standard Component Manifest Catalog
 */
export const COMPONENT_MANIFEST_CATALOG: Record<string, ComponentManifest> = {
  // Chassis
  "chassis_gt3": {
    id: "chassis_gt3",
    name: "GT3 Spaceframe Safety Tub",
    category: "chassis",
    massKg: 280,
    comOffsetMm: [0, 240, 0],
    dimensionsMm: [1850, 950, 4400],
    mountPoints: [
      { id: "cm_engine_front", name: "Front Engine Cradle", interfaceType: "engine_mount", positionMm: [0, 280, -750] },
      { id: "cm_engine_mid", name: "Mid Engine Bulkhead", interfaceType: "engine_mount", positionMm: [0, 280, 200] },
      { id: "cm_engine_rear", name: "Rear Engine Cradle", interfaceType: "engine_mount", positionMm: [0, 280, 1350] },
      { id: "cm_susp_fl", name: "Front-Left Upright Tower", interfaceType: "suspension_hardpoint", positionMm: [-810, 320, -1350] },
      { id: "cm_susp_fr", name: "Front-Right Upright Tower", interfaceType: "suspension_hardpoint", positionMm: [810, 320, -1350] },
      { id: "cm_susp_rl", name: "Rear-Left Upright Tower", interfaceType: "suspension_hardpoint", positionMm: [-820, 340, 1350] },
      { id: "cm_susp_rr", name: "Rear-Right Upright Tower", interfaceType: "suspension_hardpoint", positionMm: [820, 340, 1350] },
    ],
    interfaces: [],
    compatibleChassis: ["gt3", "hypercar", "supercar", "sports", "coupe", "sedan", "track"],
    requiredNeighbours: [],
  },

  // Engines
  "engine_v8_front": {
    id: "engine_v8_front",
    name: "4.0L Twin-Turbo V8 (Front-Mid Mount)",
    category: "engine",
    massKg: 195,
    comOffsetMm: [0, 360, -750],
    dimensionsMm: [680, 620, 580],
    mountPoints: [],
    interfaces: [
      { connectsTo: "cm_engine_front", interfaceType: "engine_mount", required: true },
      { connectsTo: "trans_bellhousing", interfaceType: "transmission_bellhousing", required: true },
    ],
    compatibleChassis: ["gt3", "sports", "coupe", "sedan"],
    requiredNeighbours: ["chassis_gt3"],
    thermalLoadKw: 140,
    electricalDemandW: 450,
  },

  "engine_v8_mid": {
    id: "engine_v8_mid",
    name: "4.0L Twin-Turbo V8 (Mid Engine Mount)",
    category: "engine",
    massKg: 195,
    comOffsetMm: [0, 340, 200],
    dimensionsMm: [680, 620, 580],
    mountPoints: [],
    interfaces: [
      { connectsTo: "cm_engine_mid", interfaceType: "engine_mount", required: true },
      { connectsTo: "trans_bellhousing", interfaceType: "transmission_bellhousing", required: true },
    ],
    compatibleChassis: ["gt3", "hypercar", "supercar", "track"],
    requiredNeighbours: ["chassis_gt3"],
    thermalLoadKw: 140,
    electricalDemandW: 450,
  },

  "engine_v8_rear": {
    id: "engine_v8_rear",
    name: "4.0L Twin-Turbo V8 (Rear Engine Mount)",
    category: "engine",
    massKg: 195,
    comOffsetMm: [0, 350, 1350],
    dimensionsMm: [680, 620, 580],
    mountPoints: [],
    interfaces: [
      { connectsTo: "cm_engine_rear", interfaceType: "engine_mount", required: true },
      { connectsTo: "trans_bellhousing", interfaceType: "transmission_bellhousing", required: true },
    ],
    compatibleChassis: ["gt3", "supercar", "sports", "coupe"],
    requiredNeighbours: ["chassis_gt3"],
    thermalLoadKw: 140,
    electricalDemandW: 450,
  },

  // Transmission
  "trans_dct_7": {
    id: "trans_dct_7",
    name: "7-Speed Dual-Clutch Transaxle",
    category: "transmission",
    massKg: 88,
    comOffsetMm: [0, 260, 520],
    dimensionsMm: [420, 380, 650],
    mountPoints: [],
    interfaces: [
      { connectsTo: "engine_crankshaft", interfaceType: "transmission_bellhousing", required: true },
    ],
    compatibleChassis: ["gt3", "hypercar", "supercar", "sports", "coupe", "sedan", "track"],
    requiredNeighbours: ["engine_v8_front", "engine_v8_mid", "engine_v8_rear"],
    electricalDemandW: 180,
  },

  // Suspension
  "susp_pushrod_gt3": {
    id: "susp_pushrod_gt3",
    name: "4-Corner Inboard Pushrod Suspension",
    category: "suspension",
    massKg: 68,
    comOffsetMm: [0, 280, 0],
    dimensionsMm: [1800, 350, 2700],
    mountPoints: [],
    interfaces: [
      { connectsTo: "cm_susp_fl", interfaceType: "suspension_hardpoint", required: true },
      { connectsTo: "cm_susp_fr", interfaceType: "suspension_hardpoint", required: true },
      { connectsTo: "cm_susp_rl", interfaceType: "suspension_hardpoint", required: true },
      { connectsTo: "cm_susp_rr", interfaceType: "suspension_hardpoint", required: true },
    ],
    compatibleChassis: ["gt3", "hypercar", "supercar", "sports", "coupe", "sedan", "track"],
    requiredNeighbours: ["chassis_gt3"],
  },

  // Brakes
  "brakes_ccm": {
    id: "brakes_ccm",
    name: "410mm Carbon Ceramic Matrix (CCM)",
    category: "brakes",
    massKg: 32,
    comOffsetMm: [0, 240, 0],
    dimensionsMm: [1700, 410, 2700],
    mountPoints: [],
    interfaces: [
      { connectsTo: "susp_uprights", interfaceType: "brake_caliper_bracket", required: true },
    ],
    compatibleChassis: ["gt3", "hypercar", "supercar", "sports", "coupe", "sedan", "track"],
    requiredNeighbours: ["susp_pushrod_gt3"],
  },

  // Wheels
  "wheels_gt3_centerlock": {
    id: "wheels_gt3_centerlock",
    name: "19-Inch Forged Centerlock Wheels & Slicks",
    category: "wheels",
    massKg: 78,
    comOffsetMm: [0, 240, 0],
    dimensionsMm: [1820, 680, 2700],
    mountPoints: [],
    interfaces: [
      { connectsTo: "brake_wheel_hubs", interfaceType: "wheel_hub", required: true },
    ],
    compatibleChassis: ["gt3", "hypercar", "supercar", "sports", "coupe", "sedan", "track"],
    requiredNeighbours: ["brakes_ccm"],
  },

  // Body Structure
  "body_gt3_widebody": {
    id: "body_gt3_widebody",
    name: "GT3 Aero Carbon Widebody Panels",
    category: "body",
    massKg: 110,
    comOffsetMm: [0, 480, -50],
    dimensionsMm: [1940, 1150, 4600],
    mountPoints: [],
    interfaces: [
      { connectsTo: "chassis_body_hardpoints", interfaceType: "chassis_body_bolt", required: true },
    ],
    compatibleChassis: ["gt3", "hypercar", "supercar", "sports", "coupe", "sedan", "track"],
    requiredNeighbours: ["chassis_gt3"],
  },

  // Glass
  "glass_polycarbonate_lexan": {
    id: "glass_polycarbonate_lexan",
    name: "Polycarbonate Race Lexan Canopy",
    category: "glass",
    massKg: 14,
    comOffsetMm: [0, 780, -100],
    dimensionsMm: [1450, 620, 1850],
    mountPoints: [],
    interfaces: [
      { connectsTo: "body_glass_channel", interfaceType: "glass_channel", required: true },
    ],
    compatibleChassis: ["gt3", "hypercar", "supercar", "sports", "coupe", "sedan", "track"],
    requiredNeighbours: ["body_gt3_widebody"],
  },

  // Interior
  "interior_carbon_bucket_gt3": {
    id: "interior_carbon_bucket_gt3",
    name: "Carbon Bucket Seats & Formula Yoke",
    category: "interior",
    massKg: 28,
    comOffsetMm: [0, 420, -120],
    dimensionsMm: [1300, 750, 1100],
    mountPoints: [],
    interfaces: [
      { connectsTo: "cabin_floor_rails", interfaceType: "cockpit_floor_rail", required: true },
    ],
    compatibleChassis: ["gt3", "hypercar", "supercar", "sports", "coupe", "sedan", "track"],
    requiredNeighbours: ["chassis_gt3"],
  },

  // Electronics
  "electronics_motorsport_ms6": {
    id: "electronics_motorsport_ms6",
    name: "Bosch MS6 ECU & Mil-Spec Harness",
    category: "electronics",
    massKg: 18,
    comOffsetMm: [0, 380, -320],
    dimensionsMm: [600, 200, 1200],
    mountPoints: [],
    interfaces: [
      { connectsTo: "engine_harness_plug", interfaceType: "wiring_harness_plug", required: true },
    ],
    compatibleChassis: ["gt3", "hypercar", "supercar", "sports", "coupe", "sedan", "track"],
    requiredNeighbours: ["chassis_gt3"],
    electricalDemandW: 280,
  },

  // Exhaust
  "exhaust_quad_titanium": {
    id: "exhaust_quad_titanium",
    name: "Quad Titanium Lightweight Exhaust",
    category: "exhaust",
    massKg: 16,
    comOffsetMm: [0, 220, 1950],
    dimensionsMm: [950, 240, 2100],
    mountPoints: [],
    interfaces: [
      { connectsTo: "engine_exhaust_headers", interfaceType: "exhaust_flange", required: true },
    ],
    compatibleChassis: ["gt3", "hypercar", "supercar", "sports", "coupe", "sedan", "track"],
    requiredNeighbours: ["engine_v8_front", "engine_v8_mid", "engine_v8_rear"],
  },

  // Aerodynamics
  "aero_swan_neck_gt3": {
    id: "aero_swan_neck_gt3",
    name: "GT3 Swan-Neck Wing & Front Splitter Package",
    category: "aero",
    massKg: 24,
    comOffsetMm: [0, 680, 850],
    dimensionsMm: [1800, 550, 4800],
    mountPoints: [],
    interfaces: [
      { connectsTo: "chassis_rear_pylons", interfaceType: "aero_pylon_bracket", required: true },
    ],
    compatibleChassis: ["gt3", "hypercar", "supercar", "sports", "coupe", "sedan", "track"],
    requiredNeighbours: ["body_gt3_widebody"],
  },
};
