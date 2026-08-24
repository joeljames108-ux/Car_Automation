// ============================================================================
// HYPERCAR MODULAR VEHICLE ASSEMBLY — COMPONENT CATALOG & REGISTRY
// ============================================================================
// Catalog of all selectable modular Hypercar components, connecting 3D GLB
// body panels, e-AWD powertrain, and cooling ducts to WEC simulation models.
// ============================================================================

import type { HypercarSocketId } from "./hypercarSockets";

export interface HypercarComponentAeroData {
  downforceKgAt250Kmh: number;
  dragKgAt250Kmh: number;
  frontAeroSharePercent: number;
  liftToDragRatio: number;
}

export interface HypercarComponentPowerData {
  iceHorsepower: number;
  frontMguKw: number;
  batteryCapacityKwh: number;
  thermalEfficiencyPercent: number;
}

export interface HypercarComponentEnduranceData {
  coolingCapacityKw: number;
  thermalDurabilityRating: number; // 1-100
  stintReliabilityScore: number; // 1-100
}

export interface HypercarComponentDefinition {
  id: string;
  name: string;
  category: "CHASSIS" | "BODYWORK" | "AERO" | "HYBRID_POWERTRAIN" | "COOLING" | "SUSPENSION" | "WHEELS";
  targetSocketId: HypercarSocketId;
  description: string;
  glbMeshName: string;
  massKg: number;
  centerOfMassOffsetMm: [number, number, number];
  costUsd: number;
  isFactoryStandard: boolean;
  aero?: HypercarComponentAeroData;
  power?: HypercarComponentPowerData;
  endurance?: HypercarComponentEnduranceData;
  torsionalRigidityKNmDeg?: number;
  regulationArticleCode?: string;
}

export const HYPERCAR_COMPONENT_CATALOG: HypercarComponentDefinition[] = [
  // ── 1. Central Survival Monocoque ──
  {
    id: "HYPERCAR_CHASSIS_T800_ENCLOSED",
    name: "Apex T800 Enclosed Carbon Tub",
    category: "CHASSIS",
    targetSocketId: "SOCKET_CENTRAL_MONOCOQUE",
    description: "FIA-homologated carbon-Nomex monocoque with integrated A-pillar roll arches and dual door portals.",
    glbMeshName: "HC_Monocoque_T800",
    massKg: 195,
    centerOfMassOffsetMm: [0, 50, 0],
    costUsd: 12_500_000,
    isFactoryStandard: true,
    torsionalRigidityKNmDeg: 52,
    regulationArticleCode: "LMH Art 14.1",
  },
  {
    id: "HYPERCAR_CHASSIS_M55J_ULTRA",
    name: "Apex M55J Ultra-Rigid Monocoque",
    category: "CHASSIS",
    targetSocketId: "SOCKET_CENTRAL_MONOCOQUE",
    description: "Pitch-based high modulus carbon survival cell providing 62 kNm/deg for precision high-speed stability.",
    glbMeshName: "HC_Monocoque_M55J",
    massKg: 188,
    centerOfMassOffsetMm: [0, 48, 0],
    costUsd: 16_000_000,
    isFactoryStandard: false,
    torsionalRigidityKNmDeg: 62,
    regulationArticleCode: "LMH Art 14.1",
  },

  // ── 2. Front Crash Nose ──
  {
    id: "HYPERCAR_NOSE_CRASH_BOX",
    name: "Standard Carbon Honeycomb Crash Box",
    category: "CHASSIS",
    targetSocketId: "SOCKET_FRONT_CRASH_NOSE",
    description: "FIA 120 kN crash-tested composite cone with internal tow hook and ballast cavity.",
    glbMeshName: "HC_Nose_CrashBox",
    massKg: 24,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 1_200_000,
    isFactoryStandard: true,
    regulationArticleCode: "LMH Art 13.1",
  },
  {
    id: "HYPERCAR_NOSE_TITANIUM_REINFORCED",
    name: "Titanium-Woven Crash Nose Attenuator",
    category: "CHASSIS",
    targetSocketId: "SOCKET_FRONT_CRASH_NOSE",
    description: "Multi-stage impact nose with titanium wire mesh core absorbing 140 kN energy while saving 4 kg ballast mass.",
    glbMeshName: "HC_Nose_TitaniumBox",
    massKg: 20,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 1_850_000,
    isFactoryStandard: false,
    regulationArticleCode: "LMH Art 13.1",
  },

  // ── 3. Front Clamshell Bodywork ──
  {
    id: "HYPERCAR_FRONT_CLAMSHELL_AERODYNAMIC",
    name: "Sculpted Enclosed Front Clamshell",
    category: "BODYWORK",
    targetSocketId: "SOCKET_FRONT_CLAMSHELL",
    description: "Full-width carbon bodywork with enclosed wheel louvers, brake cooling ducts, and 24-hour endurance LED lamps.",
    glbMeshName: "HC_FrontClamshell_Aero",
    massKg: 38,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 3_400_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 240, dragKgAt250Kmh: 55, frontAeroSharePercent: 85, liftToDragRatio: 4.4 },
    regulationArticleCode: "LMH Art 3.2",
  },
  {
    id: "HYPERCAR_FRONT_CLAMSHELL_LEMANS_SPECIAL",
    name: "Low-Drag Le Mans Special Front Clamshell",
    category: "BODYWORK",
    targetSocketId: "SOCKET_FRONT_CLAMSHELL",
    description: "Streamlined ultra-low drag front nose cone engineered specifically for 340+ km/h top speeds down the Mulsanne straight.",
    glbMeshName: "HC_FrontClamshell_LeMans",
    massKg: 34,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 4_200_000,
    isFactoryStandard: false,
    aero: { downforceKgAt250Kmh: 190, dragKgAt250Kmh: 38, frontAeroSharePercent: 80, liftToDragRatio: 5.0 },
    regulationArticleCode: "LMH Art 3.2",
  },

  // ── 4. Front Splitter ──
  {
    id: "HYPERCAR_FRONT_SPLITTER_HIGH_DOWNFORCE",
    name: "Carbon Front Splitter & Tunnels",
    category: "AERO",
    targetSocketId: "SOCKET_FRONT_SPLITTER",
    description: "Extended carbon front splitter channeling high-velocity airflow into the front underfloor diffuser ramps.",
    glbMeshName: "HC_Splitter_HighDownforce",
    massKg: 18,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 1_800_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 380, dragKgAt250Kmh: 85, frontAeroSharePercent: 90, liftToDragRatio: 4.5 },
    regulationArticleCode: "LMH Art 3.4",
  },
  {
    id: "HYPERCAR_FRONT_SPLITTER_ACTIVE_GROUND_EFFECT",
    name: "Active Venturi Tunnel Front Splitter",
    category: "AERO",
    targetSocketId: "SOCKET_FRONT_SPLITTER",
    description: "Dynamic pitch-compensating front splitter with flexible side skirts providing ground-effect suction at all ride heights.",
    glbMeshName: "HC_Splitter_ActiveVenturi",
    massKg: 21,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 2_600_000,
    isFactoryStandard: false,
    aero: { downforceKgAt250Kmh: 420, dragKgAt250Kmh: 90, frontAeroSharePercent: 92, liftToDragRatio: 4.67 },
    regulationArticleCode: "LMH Art 3.4",
  },

  // ── 5. Front Canards / Dive Planes ──
  {
    id: "HYPERCAR_CANARDS_DUAL_BLADE",
    name: "Dual Carbon Canard Dive Planes",
    category: "AERO",
    targetSocketId: "SOCKET_FRONT_CANARDS",
    description: "Dual vortex-generating carbon dive planes adding 60 kg of front downforce in high-speed turns.",
    glbMeshName: "HC_Canards_Dual",
    massKg: 4,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 650_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 60, dragKgAt250Kmh: 15, frontAeroSharePercent: 95, liftToDragRatio: 4.0 },
    regulationArticleCode: "LMH Art 3.4.2",
  },

  // ── 6. Front Hybrid MGU (e-AWD) ──
  {
    id: "HYPERCAR_MGU_FRONT_200KW",
    name: "200 kW Front Axle Electric MGU & Inverter",
    category: "HYBRID_POWERTRAIN",
    targetSocketId: "SOCKET_FRONT_HYBRID_MGU",
    description: "Silicon-carbide inverter driven 200 kW (268 HP) front motor delivering instantaneous e-AWD torque above 120 km/h.",
    glbMeshName: "HC_MGU_Front200kW",
    massKg: 52,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 6_800_000,
    isFactoryStandard: true,
    power: { iceHorsepower: 0, frontMguKw: 200, batteryCapacityKwh: 0, thermalEfficiencyPercent: 96.5 },
    regulationArticleCode: "LMH Art 5.3",
  },
  {
    id: "HYPERCAR_MGU_FRONT_250KW_MEGAWATT",
    name: "250 kW Megawatt Dual-Inverter Front MGU",
    category: "HYBRID_POWERTRAIN",
    targetSocketId: "SOCKET_FRONT_HYBRID_MGU",
    description: "250 kW (335 HP) dual-motor front axle module with torque-vectoring differential for high-speed corner turn-in.",
    glbMeshName: "HC_MGU_Front250kW",
    massKg: 58,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 9_200_000,
    isFactoryStandard: false,
    power: { iceHorsepower: 0, frontMguKw: 250, batteryCapacityKwh: 0, thermalEfficiencyPercent: 98.2 },
    regulationArticleCode: "LMH Art 5.3",
  },

  // ── 7. Front Suspension (AWD) ──
  {
    id: "HYPERCAR_SUSPENSION_FRONT_PUSHROD",
    name: "Front Pushrod AWD Suspension & Heave Damper",
    category: "SUSPENSION",
    targetSocketId: "SOCKET_FRONT_SUSPENSION",
    description: "Double wishbone kinematics with high-misalignment spherical bearings, torsion bars, and third heave spring.",
    glbMeshName: "HC_Suspension_Front",
    massKg: 36,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 2_400_000,
    isFactoryStandard: true,
    regulationArticleCode: "LMH Art 10.1",
  },

  // ── 8. Enclosed Cockpit & Interior ──
  {
    id: "HYPERCAR_COCKPIT_ENDURANCE_SUITE",
    name: "FIA Homologated Endurance Cockpit Suite",
    category: "CHASSIS",
    targetSocketId: "SOCKET_COCKPIT_ENCLOSED",
    description: "Custom molded seat, quick-release multifunction steering wheel, rear camera screen, and 1.5L drinks system.",
    glbMeshName: "HC_Cockpit_Suite",
    massKg: 22,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 1_600_000,
    isFactoryStandard: true,
    regulationArticleCode: "LMH Art 14.2",
  },

  // ── 9. Heated Windscreen & Roof ──
  {
    id: "HYPERCAR_WINDSCREEN_HEATED_CANOPY",
    name: "Anti-Fog Heated Windscreen & Canopy",
    category: "BODYWORK",
    targetSocketId: "SOCKET_WINDSCREEN_ROOF",
    description: "Double-curvature impact polycarbonate windscreen with micro-wire heating element and aerodynamic central wiper.",
    glbMeshName: "HC_Windscreen_Canopy",
    massKg: 16,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 1_100_000,
    isFactoryStandard: true,
    regulationArticleCode: "LMH Art 14.3",
  },

  // ── 10. Periscope Roof Air Scoop ──
  {
    id: "HYPERCAR_ROOF_RAM_AIR_SCOOP",
    name: "Periscope Ram-Air Roof Scoop",
    category: "COOLING",
    targetSocketId: "SOCKET_ROOF_AIR_SCOOP",
    description: "High-pressure dynamic ram intake feeding combustion air to the twin turbochargers and cockpit ventilation.",
    glbMeshName: "HC_Roof_Scoop",
    massKg: 8,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 950_000,
    isFactoryStandard: true,
    endurance: { coolingCapacityKw: 45, thermalDurabilityRating: 95, stintReliabilityScore: 98 },
    regulationArticleCode: "LMH Art 3.6",
  },

  // ── 11. Sidepods & Cooling (Left & Right) ──
  {
    id: "HYPERCAR_SIDE_BODY_L_ENDURANCE",
    name: "Left High-Flow Intercooler Sidepod",
    category: "BODYWORK",
    targetSocketId: "SOCKET_SIDE_BODY_L",
    description: "Sculpted sidepod housing aluminum charge air cooler, front floor extraction louvers, and dihedral door.",
    glbMeshName: "HC_SideBody_L",
    massKg: 28,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 2_600_000,
    isFactoryStandard: true,
    endurance: { coolingCapacityKw: 65, thermalDurabilityRating: 94, stintReliabilityScore: 96 },
    regulationArticleCode: "LMH Art 3.5",
  },
  {
    id: "HYPERCAR_SIDE_BODY_R_ENDURANCE",
    name: "Right Dual Radiator Sidepod",
    category: "BODYWORK",
    targetSocketId: "SOCKET_SIDE_BODY_R",
    description: "Matching right-hand sidepod housing high-efficiency coolant radiators and oil-water heat exchanger.",
    glbMeshName: "HC_SideBody_R",
    massKg: 28,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 2_600_000,
    isFactoryStandard: true,
    endurance: { coolingCapacityKw: 65, thermalDurabilityRating: 94, stintReliabilityScore: 96 },
    regulationArticleCode: "LMH Art 3.5",
  },

  // ── 12. Flat Floor & Underbody ──
  {
    id: "HYPERCAR_FLOOR_FLAT_VENTURI",
    name: "Full Carbon Flat Floor & Venturi Underbody",
    category: "AERO",
    targetSocketId: "SOCKET_FLOOR_UNDERBODY",
    description: "Full underbody carbon floor generating 1,150 kg of low-drag ground effect downforce.",
    glbMeshName: "HC_Floor_Venturi",
    massKg: 55,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 7_800_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 1150, dragKgAt250Kmh: 255, frontAeroSharePercent: 46, liftToDragRatio: 4.5 },
    regulationArticleCode: "LMH Art 3.5.4",
  },

  // ── 13. 900V Battery Pack ──
  {
    id: "HYPERCAR_BATTERY_900V_LIQUID",
    name: "900V 5.2 kWh Liquid-Cooled Battery Pack",
    category: "HYBRID_POWERTRAIN",
    targetSocketId: "SOCKET_BATTERY_900V",
    description: "Immersion-cooled lithium-ion cell module situated low in the chassis between the driver and the engine.",
    glbMeshName: "HC_Battery_900V",
    massKg: 78,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 8_400_000,
    isFactoryStandard: true,
    power: { iceHorsepower: 0, frontMguKw: 0, batteryCapacityKwh: 5.2, thermalEfficiencyPercent: 97.2 },
    endurance: { coolingCapacityKw: 35, thermalDurabilityRating: 96, stintReliabilityScore: 98 },
    regulationArticleCode: "LMH Art 5.4",
  },

  // ── 14. 3.5L Twin-Turbo V6 ICE ──
  {
    id: "HYPERCAR_ICE_3500CC_TWIN_TURBO",
    name: "Apex 3.5L 90° Twin-Turbo V6 ICE",
    category: "HYBRID_POWERTRAIN",
    targetSocketId: "SOCKET_ICE_POWERTRAIN",
    description: "Direct-injected 3.5-liter twin-turbo V6 producing 500 kW (680 HP) to the rear wheels with 48.5% thermal efficiency.",
    glbMeshName: "HC_ICE_V6TwinTurbo",
    massKg: 165,
    centerOfMassOffsetMm: [0, 50, 0],
    costUsd: 18_500_000,
    isFactoryStandard: true,
    power: { iceHorsepower: 680, frontMguKw: 0, batteryCapacityKwh: 0, thermalEfficiencyPercent: 48.5 },
    endurance: { coolingCapacityKw: 110, thermalDurabilityRating: 96, stintReliabilityScore: 97 },
    regulationArticleCode: "LMH Art 5.1",
  },

  // ── 15. Inconel Top-Exit Exhaust ──
  {
    id: "HYPERCAR_EXHAUST_INCONEL_TOP",
    name: "Inconel 625 Ceramic Top-Exit Exhaust",
    category: "HYBRID_POWERTRAIN",
    targetSocketId: "SOCKET_EXHAUST_SYSTEM",
    description: "Top-exit thermal exhaust manifold venting hot combustion gases over the rear deck into the rear wing flowfield.",
    glbMeshName: "HC_Exhaust_TopExit",
    massKg: 14,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 1_800_000,
    isFactoryStandard: true,
    regulationArticleCode: "LMH Art 5.2",
  },

  // ── 16. 7-Speed Sequential Gearbox ──
  {
    id: "HYPERCAR_GEARBOX_7SPEED_MAGNESIUM",
    name: "7-Speed Transverse Sequential Magnesium Gearbox",
    category: "HYBRID_POWERTRAIN",
    targetSocketId: "SOCKET_GEARBOX_REAR",
    description: "Structural magnesium casing integrating mechanical limited-slip differential and pneumatic shift barrel.",
    glbMeshName: "HC_Gearbox_7Speed",
    massKg: 58,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 6_200_000,
    isFactoryStandard: true,
    regulationArticleCode: "LMH Art 9.1",
  },

  // ── 17. Rear Suspension ──
  {
    id: "HYPERCAR_SUSPENSION_REAR_MULTILINK",
    name: "Rear Multilink Wishbone Suspension",
    category: "SUSPENSION",
    targetSocketId: "SOCKET_REAR_SUSPENSION",
    description: "High-rigidity multilink geometry mounting to the transmission casing with 4-way adjustable dampers.",
    glbMeshName: "HC_Suspension_Rear",
    massKg: 42,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 2_700_000,
    isFactoryStandard: true,
    regulationArticleCode: "LMH Art 10.2",
  },

  // ── 18. FIA Dorsal Shark Fin ──
  {
    id: "HYPERCAR_DORSAL_SHARK_FIN_FIA",
    name: "FIA Mandatory Dorsal Shark Fin",
    category: "AERO",
    targetSocketId: "SOCKET_DORSAL_SHARK_FIN",
    description: "Ultra-thin high modulus carbon stabilizing fin maintaining aerodynamic yaw stability during high-speed spins.",
    glbMeshName: "HC_Dorsal_SharkFin",
    massKg: 6,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 850_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 45, dragKgAt250Kmh: 12, frontAeroSharePercent: 40, liftToDragRatio: 4.3 },
    regulationArticleCode: "LMH Art 3.4.5",
  },

  // ── 19. Swan-Neck Rear Wing ──
  {
    id: "HYPERCAR_REAR_WING_SWAN_NECK",
    name: "Swan-Neck High-Efficiency Rear Wing",
    category: "AERO",
    targetSocketId: "SOCKET_REAR_WING",
    description: "Top-mounted swan-neck pylons maximizing low-pressure suction under the main aerofoil with slotted endplates.",
    glbMeshName: "HC_RearWing_SwanNeck",
    massKg: 26,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 4_200_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 620, dragKgAt250Kmh: 140, frontAeroSharePercent: 0, liftToDragRatio: 4.4 },
    regulationArticleCode: "LMH Art 3.4.1",
  },

  // ── 20. Rear Diffuser ──
  {
    id: "HYPERCAR_DIFFUSER_LONG_THROAT",
    name: "Long-Throat Carbon Rear Diffuser",
    category: "AERO",
    targetSocketId: "SOCKET_REAR_DIFFUSER",
    description: "Full-width carbon diffuser with vertical strakes expanding air into the rear low-pressure wake.",
    glbMeshName: "HC_Diffuser_LongThroat",
    massKg: 22,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 3_100_000,
    isFactoryStandard: true,
    aero: { downforceKgAt250Kmh: 480, dragKgAt250Kmh: 105, frontAeroSharePercent: 0, liftToDragRatio: 4.6 },
    regulationArticleCode: "LMH Art 3.5.5",
  },

  // ── 21. Wheels & Endurance Brakes (4 Corners) ──
  {
    id: "HYPERCAR_WHEEL_BRAKE_FL",
    name: "Front-Left 18-inch Magnesium Wheel & 380mm Carbon Disc",
    category: "WHEELS",
    targetSocketId: "SOCKET_WHEELS_BRAKES_FL",
    description: "18-inch forged magnesium rim, 31/71-18 Michelin endurance tire, and 380mm carbon disc rated for 12 hours.",
    glbMeshName: "HC_Wheel_FL",
    massKg: 38,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 750_000,
    isFactoryStandard: true,
    endurance: { coolingCapacityKw: 25, thermalDurabilityRating: 98, stintReliabilityScore: 99 },
    regulationArticleCode: "LMH Art 11.1",
  },
  {
    id: "HYPERCAR_WHEEL_BRAKE_FR",
    name: "Front-Right 18-inch Magnesium Wheel & 380mm Carbon Disc",
    category: "WHEELS",
    targetSocketId: "SOCKET_WHEELS_BRAKES_FR",
    description: "18-inch forged magnesium rim, 31/71-18 Michelin endurance tire, and 380mm carbon disc rated for 12 hours.",
    glbMeshName: "HC_Wheel_FR",
    massKg: 38,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 750_000,
    isFactoryStandard: true,
    endurance: { coolingCapacityKw: 25, thermalDurabilityRating: 98, stintReliabilityScore: 99 },
    regulationArticleCode: "LMH Art 11.1",
  },
  {
    id: "HYPERCAR_WHEEL_BRAKE_RL",
    name: "Rear-Left 18-inch Magnesium Wheel & 355mm Carbon Disc",
    category: "WHEELS",
    targetSocketId: "SOCKET_WHEELS_BRAKES_RL",
    description: "18-inch forged magnesium rim, 31/71-18 Michelin endurance tire, and 355mm carbon disc rated for 12 hours.",
    glbMeshName: "HC_Wheel_RL",
    massKg: 40,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 800_000,
    isFactoryStandard: true,
    endurance: { coolingCapacityKw: 25, thermalDurabilityRating: 98, stintReliabilityScore: 99 },
    regulationArticleCode: "LMH Art 11.1",
  },
  {
    id: "HYPERCAR_WHEEL_BRAKE_RR",
    name: "Rear-Right 18-inch Magnesium Wheel & 355mm Carbon Disc",
    category: "WHEELS",
    targetSocketId: "SOCKET_WHEELS_BRAKES_RR",
    description: "18-inch forged magnesium rim, 31/71-18 Michelin endurance tire, and 355mm carbon disc rated for 12 hours.",
    glbMeshName: "HC_Wheel_RR",
    massKg: 40,
    centerOfMassOffsetMm: [0, 0, 0],
    costUsd: 800_000,
    isFactoryStandard: true,
    endurance: { coolingCapacityKw: 25, thermalDurabilityRating: 98, stintReliabilityScore: 99 },
    regulationArticleCode: "LMH Art 11.1",
  },
];

export class HypercarComponentRegistry {
  private static catalogMap = new Map<string, HypercarComponentDefinition>(
    HYPERCAR_COMPONENT_CATALOG.map((c) => [c.id, c])
  );

  public static getComponent(id: string): HypercarComponentDefinition | undefined {
    return this.catalogMap.get(id);
  }

  public static getComponentsForSocket(socketId: HypercarSocketId): HypercarComponentDefinition[] {
    return HYPERCAR_COMPONENT_CATALOG.filter((c) => c.targetSocketId === socketId);
  }

  public static getAllComponents(): HypercarComponentDefinition[] {
    return HYPERCAR_COMPONENT_CATALOG;
  }
}
