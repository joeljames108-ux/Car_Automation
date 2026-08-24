// ============================================================================
// F1 MODULAR VEHICLE ASSEMBLY — COMPONENT DEFINITIONS & REGISTRY
// ============================================================================
// Catalog of all selectable modular F1 components, linking visual 3D GLB/glTF
// assets directly to engineering simulation variables and compatibility rules.
// ============================================================================

import type { F1SocketId } from "./f1Sockets";

export interface F1ComponentAeroData {
  downforceKgAt250Kmh: number;
  dragKgAt250Kmh: number;
  frontAeroSharePercent: number;
  drsGainPercent: number; // Drag reduction when DRS is active
}

export interface F1ComponentPowerData {
  iceHorsepower: number;
  ersHorsepower: number;
  thermalEfficiencyPercent: number;
  fuelMassFlowKgH: number;
}

export interface F1ComponentMechanicalData {
  torsionalRigidityKNmDeg?: number;
  springWheelRateNmm?: number;
  gearShiftTimeMs?: number;
  maxTorqueNm?: number;
  brakingTorqueCapacityNm?: number;
}

export interface F1ComponentDefinition {
  id: string;
  name: string;
  category: "CHASSIS" | "AERO" | "POWERTRAIN" | "SUSPENSION" | "WHEELS";
  targetSocketId: F1SocketId;
  description: string;
  glbMeshName: string; // Three.js mesh/group identifier
  massKg: number;
  centerOfMassOffsetMm: [number, number, number]; // [x, y, z] from socket anchor
  costUsd: number;
  isFactoryStandard: boolean;
  aero?: F1ComponentAeroData;
  power?: F1ComponentPowerData;
  mechanical?: F1ComponentMechanicalData;
  requiredParentComponentId?: string;
  incompatibleComponentIds?: string[];
  regulationArticleCode?: string;
}

export const F1_COMPONENT_CATALOG: F1ComponentDefinition[] = [
  // ── 1. Survival Cell / Monocoque ──
  {
    id: "CHASSIS_MONOCOQUE_T800",
    name: "Apex T800 Monocoque Cell",
    category: "CHASSIS",
    targetSocketId: "SOCKET_SURVIVAL_CELL",
    description: "Autoclave-cured high-tensile T800 carbon fiber tub with Nomex core sandwich panels.",
    glbMeshName: "F1_Monocoque_T800",
    massKg: 118,
    centerOfMassOffsetMm: [0, 50, 0],
    costUsd: 14_500_000,
    isFactoryStandard: true,
    mechanical: { torsionalRigidityKNmDeg: 54 },
    regulationArticleCode: "Art 14.1",
  },
  {
    id: "CHASSIS_MONOCOQUE_M55J_ULTRA",
    name: "Apex M55J Ultra-Stiff Cell",
    category: "CHASSIS",
    targetSocketId: "SOCKET_SURVIVAL_CELL",
    description: "Pitch-based ultra-high modulus carbon fiber monocoque delivering 64 kNm/deg torsional rigidity.",
    glbMeshName: "F1_Monocoque_M55J",
    massKg: 114,
    centerOfMassOffsetMm: [0, 48, 0],
    costUsd: 18_200_000,
    isFactoryStandard: false,
    mechanical: { torsionalRigidityKNmDeg: 64 },
    regulationArticleCode: "Art 14.1",
  },

  // ── 2. Front Nose Cone Attenuator ──
  {
    id: "NOSE_CONE_HIGH_UNDERCUT",
    name: "High-Undercut Nose Cone",
    category: "CHASSIS",
    targetSocketId: "SOCKET_NOSE_CONE",
    description: "Slim tapered nose profile channeling maximum clean air under the chassis to the floor leading edge.",
    glbMeshName: "F1_Nose_Undercut",
    massKg: 14,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 1_800_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 45, dragKgAt250Kmh: 12, frontAeroSharePercent: 80, drsGainPercent: 0 },
    regulationArticleCode: "Art 13.1",
  },
  {
    id: "NOSE_CONE_WIDE_IMPACT_STUB",
    name: "Wide Impact Nose Cone",
    category: "CHASSIS",
    targetSocketId: "SOCKET_NOSE_CONE",
    description: "Reinforced aluminum honeycomb crush volume prioritizing low-speed corner stability.",
    glbMeshName: "F1_Nose_Wide",
    massKg: 17,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 1_200_000,
    isFactoryStandard: false,
    aero: { downforceKgAt250Kmh: 35, dragKgAt250Kmh: 16, frontAeroSharePercent: 75, drsGainPercent: 0 },
    regulationArticleCode: "Art 13.1",
  },

  // ── 3. Front Wing Assembly ──
  {
    id: "FRONT_WING_OUTWASH_4_ELEMENT",
    name: "4-Element Outwash Front Wing",
    category: "AERO",
    targetSocketId: "SOCKET_FRONT_WING",
    description: "Tiered carbon aerofoil cascades with slotted endplates deflecting wheel wake outboard.",
    glbMeshName: "F1_FrontWing_Outwash4",
    massKg: 18,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 3_600_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 540, dragKgAt250Kmh: 110, frontAeroSharePercent: 100, drsGainPercent: 0 },
    regulationArticleCode: "Art 3.5",
  },
  {
    id: "FRONT_WING_MONZA_LOW_DRAG_3_ELEMENT",
    name: "3-Element Low-Drag Front Wing",
    category: "AERO",
    targetSocketId: "SOCKET_FRONT_WING",
    description: "Trimmed flap elements designed for ultra-high straightline speed at Monza and Baku.",
    glbMeshName: "F1_FrontWing_Monza3",
    massKg: 14,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 3_200_000,
    isFactoryStandard: false,
    aero: { downforceKgAt250Kmh: 380, dragKgAt250Kmh: 68, frontAeroSharePercent: 100, drsGainPercent: 0 },
    regulationArticleCode: "Art 3.5",
  },

  // ── 4. Titanium Halo ──
  {
    id: "HALO_TITANIUM_GRADE5",
    name: "Grade 5 Titanium Halo Structure",
    category: "CHASSIS",
    targetSocketId: "SOCKET_HALO",
    description: "FIA Standard 8869-2018 certified titanium safety halo with aerodynamic boundary fairing.",
    glbMeshName: "F1_Halo_Grade5",
    massKg: 7,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 950_000,
    isFactoryStandard: true,
    regulationArticleCode: "Art 13.2",
  },

  // ── 5. Cockpit Trim & Display ──
  {
    id: "COCKPIT_CARBON_ERGONOMIC",
    name: "Ergonomic PDU Cockpit & Wheel",
    category: "CHASSIS",
    targetSocketId: "SOCKET_COCKPIT_TRIM",
    description: "5.0-inch daylight-visible TFT display steering wheel, quick-release hub, and molded bead seat.",
    glbMeshName: "F1_Cockpit_PDU",
    massKg: 14,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 1_400_000,
    isFactoryStandard: true,
    regulationArticleCode: "Art 14.2",
  },

  // ── 6. Front Suspension (Left & Right) ──
  {
    id: "SUSPENSION_FRONT_PULLROD",
    name: "Front Pullrod Kinematics Assembly",
    category: "SUSPENSION",
    targetSocketId: "SOCKET_SUSPENSION_FL",
    description: "Lowered center of gravity pullrod linkage opening cleaner airflow into the underbody.",
    glbMeshName: "F1_Suspension_FL_Pullrod",
    massKg: 22,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 2_800_000,
    isFactoryStandard: true,
    mechanical: { springWheelRateNmm: 220 },
    regulationArticleCode: "Art 10.1",
  },
  {
    id: "SUSPENSION_FRONT_PULLROD_R",
    name: "Front-Right Pullrod Kinematics Assembly",
    category: "SUSPENSION",
    targetSocketId: "SOCKET_SUSPENSION_FR",
    description: "Matching right-hand pullrod kinematic suspension with adjustable rotary blade anti-roll bar.",
    glbMeshName: "F1_Suspension_FR_Pullrod",
    massKg: 22,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 2_800_000,
    isFactoryStandard: true,
    mechanical: { springWheelRateNmm: 220 },
    regulationArticleCode: "Art 10.1",
  },

  // ── 7. Venturi Ground Effect Floor ──
  {
    id: "FLOOR_QUAD_FENCE_VENTURI",
    name: "Quad-Fence Venturi Ground Effect Floor",
    category: "AERO",
    targetSocketId: "SOCKET_FLOOR_UNDERBODY",
    description: "Full 4-fence underbody with sealed edge-wings generating massive low-pressure downforce.",
    glbMeshName: "F1_Floor_QuadFence",
    massKg: 42,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 8_500_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 920, dragKgAt250Kmh: 140, frontAeroSharePercent: 44, drsGainPercent: 0 },
    regulationArticleCode: "Art 3.5.6",
  },
  {
    id: "FLOOR_ANTI_PORPOISING_CHANNELS",
    name: "Anti-Porpoising Stepped Venturi Floor",
    category: "AERO",
    targetSocketId: "SOCKET_FLOOR_UNDERBODY",
    description: "Pressure bleed micro-slots preventing sudden aerodynamic stall under high heave compression.",
    glbMeshName: "F1_Floor_AntiPorpoise",
    massKg: 44,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 9_200_000,
    isFactoryStandard: false,
    aero: { downforceKgAt250Kmh: 860, dragKgAt250Kmh: 135, frontAeroSharePercent: 45, drsGainPercent: 0 },
    regulationArticleCode: "Art 3.5.6",
  },

  // ── 8. Sidepods (Left & Right) ──
  {
    id: "SIDEPOD_DOWNWASH_RAMP_L",
    name: "Left Downwash Ramp Sidepod",
    category: "AERO",
    targetSocketId: "SOCKET_SIDEPOD_L",
    description: "Aggressive waterslide ramp directing airflow over the floor edge into the beam wing.",
    glbMeshName: "F1_Sidepod_L_Downwash",
    massKg: 16,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 2_400_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 65, dragKgAt250Kmh: 35, frontAeroSharePercent: 40, drsGainPercent: 0 },
    regulationArticleCode: "Art 3.6",
  },
  {
    id: "SIDEPOD_DOWNWASH_RAMP_R",
    name: "Right Downwash Ramp Sidepod",
    category: "AERO",
    targetSocketId: "SOCKET_SIDEPOD_R",
    description: "Matching right-hand sidepod housing charge air cooler with 12 cooling louvers.",
    glbMeshName: "F1_Sidepod_R_Downwash",
    massKg: 16,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 2_400_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 65, dragKgAt250Kmh: 35, frontAeroSharePercent: 40, drsGainPercent: 0 },
    regulationArticleCode: "Art 3.6",
  },

  // ── 9. Power Unit ──
  {
    id: "PU_APEX_WORKS_V6_TURBO_HYBRID",
    name: "Apex 1.6L V6 Turbo-Hybrid Works PU",
    category: "POWERTRAIN",
    targetSocketId: "SOCKET_POWER_UNIT",
    description: "Direct-injected 90° V6 ICE with Mahle active prechambers, 120 kW MGU-K, and 125k RPM MGU-H.",
    glbMeshName: "F1_PowerUnit_ApexWorks",
    massKg: 151,
    centerOfMassOffsetMm: [0, 50, 0],
    costUsd: 24_000_000,
    isFactoryStandard: true,
    power: { iceHorsepower: 887, ersHorsepower: 161, thermalEfficiencyPercent: 51.2, fuelMassFlowKgH: 100 },
    regulationArticleCode: "Art 5.1",
  },

  // ── 10. Gearbox & Differential ──
  {
    id: "GEARBOX_CARBON_8SPEED_SEAMLESS",
    name: "8-Speed Carbon Monocoque Gearbox",
    category: "POWERTRAIN",
    targetSocketId: "SOCKET_GEARBOX",
    description: "Structural carbon composite casing with 14ms seamless shift dog rings and active diff.",
    glbMeshName: "F1_Gearbox_Carbon8",
    massKg: 44,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 8_200_000,
    isFactoryStandard: true,
    mechanical: { gearShiftTimeMs: 14, maxTorqueNm: 950 },
    regulationArticleCode: "Art 9.1",
  },

  // ── 11. Rear Suspension (Left & Right) ──
  {
    id: "SUSPENSION_REAR_PUSHROD_L",
    name: "Rear-Left Pushrod Suspension",
    category: "SUSPENSION",
    targetSocketId: "SOCKET_SUSPENSION_RL",
    description: "High-mounted inboard rockers clearing maximum volume for the underfloor diffuser.",
    glbMeshName: "F1_Suspension_RL_Pushrod",
    massKg: 24,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 2_900_000,
    isFactoryStandard: true,
    mechanical: { springWheelRateNmm: 270 },
    regulationArticleCode: "Art 10.1",
  },
  {
    id: "SUSPENSION_REAR_PUSHROD_R",
    name: "Rear-Right Pushrod Suspension",
    category: "SUSPENSION",
    targetSocketId: "SOCKET_SUSPENSION_RR",
    description: "Matching rear-right suspension geometry with titanium drop links.",
    glbMeshName: "F1_Suspension_RR_Pushrod",
    massKg: 24,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 2_900_000,
    isFactoryStandard: true,
    mechanical: { springWheelRateNmm: 270 },
    regulationArticleCode: "Art 10.1",
  },

  // ── 12. Rear Diffuser ──
  {
    id: "DIFFUSER_QUAD_STRAKE_EXPANSION",
    name: "Quad-Strake Expansion Diffuser",
    category: "AERO",
    targetSocketId: "SOCKET_REAR_DIFFUSER",
    description: "18-degree expansion angle with 4 vertical strakes channeling low-pressure rear extraction.",
    glbMeshName: "F1_Diffuser_QuadStrake",
    massKg: 18,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 3_800_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 420, dragKgAt250Kmh: 48, frontAeroSharePercent: 0, drsGainPercent: 0 },
    regulationArticleCode: "Art 3.5.8",
  },

  // ── 13. Rear Wing & DRS ──
  {
    id: "REAR_WING_CASCADE_DRS_85MM",
    name: "Double Cascade Rear Wing & 85mm DRS",
    category: "AERO",
    targetSocketId: "SOCKET_REAR_WING",
    description: "High downforce rear wing with swan-neck pylons and 85mm hydraulic DRS flap actuator.",
    glbMeshName: "F1_RearWing_CascadeDRS",
    massKg: 28,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 5_400_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 680, dragKgAt250Kmh: 165, frontAeroSharePercent: 0, drsGainPercent: 32 },
    regulationArticleCode: "Art 3.4",
  },
  {
    id: "REAR_WING_MONZA_SPOON_LOW_DRAG",
    name: "Monza Spoon Low-Drag Rear Wing",
    category: "AERO",
    targetSocketId: "SOCKET_REAR_WING",
    description: "Ultra-shallow spoon profile minimizing vortex drag on high-speed straights.",
    glbMeshName: "F1_RearWing_MonzaSpoon",
    massKg: 22,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 4_800_000,
    isFactoryStandard: false,
    aero: { downforceKgAt250Kmh: 410, dragKgAt250Kmh: 82, frontAeroSharePercent: 0, drsGainPercent: 28 },
    regulationArticleCode: "Art 3.4",
  },

  // ── 14. Wheels, Tires & Carbon Brakes (4 Corners) ──
  {
    id: "WHEEL_ASSEMBLY_FL",
    name: "Front-Left 18-inch Forged Wheel & Disc",
    category: "WHEELS",
    targetSocketId: "SOCKET_WHEEL_FL",
    description: "Forged magnesium rim, 305mm Pirelli slick tire, and 1050-hole carbon brake disc.",
    glbMeshName: "F1_Wheel_FL",
    massKg: 34,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 850_000,
    isFactoryStandard: true,
    mechanical: { brakingTorqueCapacityNm: 4200 },
    regulationArticleCode: "Art 11.1",
  },
  {
    id: "WHEEL_ASSEMBLY_FR",
    name: "Front-Right 18-inch Forged Wheel & Disc",
    category: "WHEELS",
    targetSocketId: "SOCKET_WHEEL_FR",
    description: "Forged magnesium rim, 305mm Pirelli slick tire, and 1050-hole carbon brake disc.",
    glbMeshName: "F1_Wheel_FR",
    massKg: 34,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 850_000,
    isFactoryStandard: true,
    mechanical: { brakingTorqueCapacityNm: 4200 },
    regulationArticleCode: "Art 11.1",
  },
  {
    id: "WHEEL_ASSEMBLY_RL",
    name: "Rear-Left 18-inch Forged Wheel & BBW",
    category: "WHEELS",
    targetSocketId: "SOCKET_WHEEL_RL",
    description: "Wide 405mm rear forged magnesium rim, Pirelli tire, and brake-by-wire caliper.",
    glbMeshName: "F1_Wheel_RL",
    massKg: 40,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 950_000,
    isFactoryStandard: true,
    mechanical: { brakingTorqueCapacityNm: 3800 },
    regulationArticleCode: "Art 11.1",
  },
  {
    id: "WHEEL_ASSEMBLY_RR",
    name: "Rear-Right 18-inch Forged Wheel & BBW",
    category: "WHEELS",
    targetSocketId: "SOCKET_WHEEL_RR",
    description: "Wide 405mm rear forged magnesium rim, Pirelli tire, and brake-by-wire caliper.",
    glbMeshName: "F1_Wheel_RR",
    massKg: 40,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 950_000,
    isFactoryStandard: true,
    mechanical: { brakingTorqueCapacityNm: 3800 },
    regulationArticleCode: "Art 11.1",
  },
];

export class F1ComponentRegistry {
  private static catalogMap = new Map<string, F1ComponentDefinition>(
    F1_COMPONENT_CATALOG.map((c) => [c.id, c])
  );

  public static getComponent(id: string): F1ComponentDefinition | undefined {
    return this.catalogMap.get(id);
  }

  public static getComponentsForSocket(socketId: F1SocketId): F1ComponentDefinition[] {
    return F1_COMPONENT_CATALOG.filter((c) => c.targetSocketId === socketId);
  }

  public static getAllComponents(): F1ComponentDefinition[] {
    return F1_COMPONENT_CATALOG;
  }
}
