// ===================================================================
// ENGINE ASSEMBLY SYSTEM — TYPES & CONSTANTS
// ===================================================================

import { EngineConfig } from "./types";

export type ComponentId =
  | "block"
  | "crankshaft"
  | "pistons"
  | "rods"
  | "camshaft"
  | "head_gasket"
  | "cylinder_head"
  | "valves"
  | "intake_manifold"
  | "exhaust_headers"
  | "turbocharger"
  | "oil_pan";

export type AssemblyPhase =
  | "idle"
  | "picking"
  | "traveling"
  | "aligning"
  | "inserting"
  | "locking"
  | "confirming"
  | "complete";

export type MaterialGrade = "cast" | "forged" | "billet" | "titanium" | "ceramic";

export interface ComponentVariant {
  id: MaterialGrade;
  label: string;
  hpMultiplier: number;
  weightMultiplier: number;
  costMultiplier: number;
  reliabilityDelta: number;
}

export interface AssemblyComponentMeta {
  id: ComponentId;
  name: string;
  category: "Core" | "Bottom End" | "Top End" | "Induction & Exhaust";
  description: string;
  dependencies: ComponentId[];
  explodedOffset: { x: number; y: number }; // Exploded view float displacement in SVG px
  slotPosition: { x: number; y: number };    // Target installed position in SVG px
  estimatedDuration: number;               // Base animation duration in ms
  soundType: "heavy" | "click" | "slide" | "spool" | "metallic" | "pneumatic";
  variants: ComponentVariant[];
  statDeltas: {
    hp: number;
    torque: number;
    weight: number;
    reliability: number;
    cost: number;
  };
  tooltipAdvice: string;
}

const DEFAULT_VARIANTS: ComponentVariant[] = [
  { id: "cast", label: "OEM Cast Steel", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 1.0, reliabilityDelta: 0 },
  { id: "forged", label: "Forged Racing Alloy", hpMultiplier: 1.25, weightMultiplier: 0.88, costMultiplier: 1.8, reliabilityDelta: 10 },
  { id: "billet", label: "Billet CNC Precision", hpMultiplier: 1.45, weightMultiplier: 0.82, costMultiplier: 2.8, reliabilityDelta: 15 },
  { id: "titanium", label: "Titanium Spec-R", hpMultiplier: 1.65, weightMultiplier: 0.65, costMultiplier: 4.5, reliabilityDelta: 20 },
];

export const ENGINE_ASSEMBLY_COMPONENTS: AssemblyComponentMeta[] = [
  {
    id: "block",
    name: "Engine Block",
    category: "Core",
    description: "The structural foundation housing cylinder bores, coolant passages, and main bearing saddles.",
    dependencies: [],
    explodedOffset: { x: 0, y: 0 },
    slotPosition: { x: 250, y: 220 },
    estimatedDuration: 1200,
    soundType: "heavy",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 85, reliability: 100, cost: 2500 },
    tooltipAdvice: "Precision-honed cylinders ensure minimum friction and maximum ring sealing.",
  },
  {
    id: "crankshaft",
    name: "Crankshaft & Main Bearings",
    category: "Bottom End",
    description: "Converts reciprocating piston motion into rotational torque to drive the flywheel.",
    dependencies: ["block"],
    explodedOffset: { x: 0, y: 60 },
    slotPosition: { x: 250, y: 310 },
    estimatedDuration: 1500,
    soundType: "heavy",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 25, torque: 35, weight: 22, reliability: 5, cost: 1800 },
    tooltipAdvice: "Counter-weighted shaft reduces engine vibration and handles high RPM stress.",
  },
  {
    id: "pistons",
    name: "Pistons & Compression Rings",
    category: "Bottom End",
    description: "High-strength pistons that seal combustion pressure inside the cylinder bore.",
    dependencies: ["crankshaft"],
    explodedOffset: { x: -60, y: 0 },
    slotPosition: { x: 250, y: 190 },
    estimatedDuration: 1800,
    soundType: "slide",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 45, torque: 40, weight: 8, reliability: 8, cost: 1200 },
    tooltipAdvice: "Forged alloy construction tolerates high boost pressures and high cylinder temperatures.",
  },
  {
    id: "rods",
    name: "Connecting Rods & Wrist Pins",
    category: "Bottom End",
    description: "Links each piston crown directly to the journal of the crankshaft.",
    dependencies: ["pistons"],
    explodedOffset: { x: -40, y: 40 },
    slotPosition: { x: 250, y: 250 },
    estimatedDuration: 1400,
    soundType: "metallic",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 15, torque: 20, weight: 6, reliability: 6, cost: 800 },
    tooltipAdvice: "H-beam connecting rods prevent bending under heavy torque load.",
  },
  {
    id: "oil_pan",
    name: "Sump & Oil Pan",
    category: "Bottom End",
    description: "Seals the bottom crankcase and stores engine oil for the pressure lubrication system.",
    dependencies: ["crankshaft"],
    explodedOffset: { x: 0, y: 90 },
    slotPosition: { x: 250, y: 360 },
    estimatedDuration: 1000,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 5, torque: 0, weight: 5, reliability: 10, cost: 350 },
    tooltipAdvice: "Baffled oil pan keeps oil pickup submerged during high G cornering.",
  },
  {
    id: "head_gasket",
    name: "Multi-Layer Steel Head Gasket",
    category: "Top End",
    description: "Creates an airtight seal between the block deck and the cylinder head.",
    dependencies: ["pistons", "rods"],
    explodedOffset: { x: 0, y: -25 },
    slotPosition: { x: 250, y: 150 },
    estimatedDuration: 800,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 1, reliability: 12, cost: 150 },
    tooltipAdvice: "Multi-layer steel (MLS) prevents coolant leaks under high boost.",
  },
  {
    id: "cylinder_head",
    name: "Cylinder Head & Chambers",
    category: "Top End",
    description: "Houses combustion chambers, intake/exhaust ports, and spark plug wells.",
    dependencies: ["head_gasket"],
    explodedOffset: { x: 0, y: -70 },
    slotPosition: { x: 250, y: 110 },
    estimatedDuration: 1600,
    soundType: "heavy",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 65, torque: 50, weight: 28, reliability: 8, cost: 2400 },
    tooltipAdvice: "CNC ported channels optimize airflow velocity into the cylinder.",
  },
  {
    id: "camshaft",
    name: "Camshafts & Timing Gears",
    category: "Top End",
    description: "Controls the precise opening timing, duration, and lift of intake and exhaust valves.",
    dependencies: ["cylinder_head"],
    explodedOffset: { x: 0, y: -110 },
    slotPosition: { x: 250, y: 70 },
    estimatedDuration: 1300,
    soundType: "metallic",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 35, torque: 25, weight: 7, reliability: 5, cost: 950 },
    tooltipAdvice: "Aggressive cam profiles increase high-RPM horsepower output.",
  },
  {
    id: "valves",
    name: "Valves & Dual Springs",
    category: "Top End",
    description: "Spring-loaded valves that regulate air intake into the cylinder and exhaust out gases.",
    dependencies: ["camshaft"],
    explodedOffset: { x: 30, y: -80 },
    slotPosition: { x: 250, y: 95 },
    estimatedDuration: 1200,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 20, torque: 15, weight: 3, reliability: 7, cost: 650 },
    tooltipAdvice: "Titanium valves prevent valve float up to 9,000 RPM.",
  },
  {
    id: "intake_manifold",
    name: "Intake Manifold & Throttle",
    category: "Induction & Exhaust",
    description: "Distributes clean air uniformly to each intake port on the cylinder head.",
    dependencies: ["valves"],
    explodedOffset: { x: -90, y: -60 },
    slotPosition: { x: 180, y: 110 },
    estimatedDuration: 1100,
    soundType: "pneumatic",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 30, torque: 20, weight: 6, reliability: 5, cost: 750 },
    tooltipAdvice: "Tuned runner lengths maximize intake plenum resonance boost.",
  },
  {
    id: "exhaust_headers",
    name: "Exhaust Manifold & Headers",
    category: "Induction & Exhaust",
    description: "Channels hot spent exhaust gases away from the engine block.",
    dependencies: ["valves"],
    explodedOffset: { x: 90, y: -60 },
    slotPosition: { x: 320, y: 110 },
    estimatedDuration: 1200,
    soundType: "metallic",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 25, torque: 25, weight: 9, reliability: 5, cost: 850 },
    tooltipAdvice: "Equal-length headers smooth out exhaust pulses for higher scavenging efficiency.",
  },
  {
    id: "turbocharger",
    name: "Turbocharger & Wastegate",
    category: "Induction & Exhaust",
    description: "Forces compressed ambient air into intake ports for massive horsepower gains.",
    dependencies: ["exhaust_headers", "intake_manifold"],
    explodedOffset: { x: 110, y: -100 },
    slotPosition: { x: 360, y: 90 },
    estimatedDuration: 1700,
    soundType: "spool",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 120, torque: 110, weight: 14, reliability: -8, cost: 3200 },
    tooltipAdvice: "Ball-bearing turbo reduces spool lag and delivers instant boost pressure.",
  },
];

// ===================================================================
// ELECTRIC VEHICLE (EV) POWERTRAIN ASSEMBLY COMPONENTS
// ===================================================================
export const EV_ASSEMBLY_COMPONENTS: AssemblyComponentMeta[] = [
  {
    id: "block",
    name: "EV Battery Frame & Chassis Casing",
    category: "Core",
    description: "Rigid structural aluminum battery tray housing high-voltage cell modules, BMS, and coolant channels.",
    dependencies: [],
    explodedOffset: { x: 0, y: 0 },
    slotPosition: { x: 250, y: 220 },
    estimatedDuration: 1200,
    soundType: "heavy",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 140, reliability: 100, cost: 4500 },
    tooltipAdvice: "Reinforced underbody battery shield protects cells against road impacts.",
  },
  {
    id: "crankshaft",
    name: "800V Lithium-Ion Cell Module Matrix",
    category: "Bottom End",
    description: "High-density 800V lithium-ion NMC cell array providing ultra-high continuous discharge current.",
    dependencies: ["block"],
    explodedOffset: { x: 0, y: 60 },
    slotPosition: { x: 250, y: 310 },
    estimatedDuration: 1500,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 180, torque: 220, weight: 180, reliability: 15, cost: 6500 },
    tooltipAdvice: "800V architecture enables ultra-fast 350kW DC charging and reduced thermal load.",
  },
  {
    id: "pistons",
    name: "BMS (Battery Management System)",
    category: "Bottom End",
    description: "Monitors individual cell voltages, state-of-charge, active balancing, and emergency pyrofuse cutoffs.",
    dependencies: ["crankshaft"],
    explodedOffset: { x: -60, y: 0 },
    slotPosition: { x: 250, y: 190 },
    estimatedDuration: 1200,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 20, torque: 30, weight: 4, reliability: 20, cost: 1800 },
    tooltipAdvice: "Millisecond cell balancing optimizes battery longevity and peak current delivery.",
  },
  {
    id: "rods",
    name: "High-Voltage Solid Copper Busbar Grid",
    category: "Bottom End",
    description: "Heavy-gauge solid copper busbars delivering up to 1000A DC current between modules.",
    dependencies: ["pistons"],
    explodedOffset: { x: -40, y: 40 },
    slotPosition: { x: 250, y: 250 },
    estimatedDuration: 1100,
    soundType: "metallic",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 40, torque: 50, weight: 12, reliability: 10, cost: 1200 },
    tooltipAdvice: "Nickel-plated copper prevents resistance heating under full-throttle acceleration.",
  },
  {
    id: "oil_pan",
    name: "Liquid Cooling Radiator & Pump Reservoir",
    category: "Bottom End",
    description: "Dual-circuit electric coolant pump and front radiator circulating glycol through battery and inverter.",
    dependencies: ["crankshaft"],
    explodedOffset: { x: 0, y: 90 },
    slotPosition: { x: 250, y: 360 },
    estimatedDuration: 1000,
    soundType: "pneumatic",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 10, torque: 0, weight: 8, reliability: 15, cost: 750 },
    tooltipAdvice: "Active chillers maintain battery pack temperature at optimal 25°C - 35°C window.",
  },
  {
    id: "head_gasket",
    name: "Glycol Thermal Cooling Plate",
    category: "Top End",
    description: "Alloy liquid cooling plate with serpentine coolant channels preventing thermal runaway.",
    dependencies: ["pistons", "rods"],
    explodedOffset: { x: 0, y: -25 },
    slotPosition: { x: 250, y: 150 },
    estimatedDuration: 900,
    soundType: "slide",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 15, torque: 10, weight: 6, reliability: 18, cost: 650 },
    tooltipAdvice: "Direct contact cooling plate ensures uniform cell temperatures across all banks.",
  },
  {
    id: "cylinder_head",
    name: "800V SiC Inverter Power Module",
    category: "Top End",
    description: "Silicon-Carbide power inverter converting 800V DC battery power into 3-phase AC motor drive.",
    dependencies: ["head_gasket"],
    explodedOffset: { x: 0, y: -70 },
    slotPosition: { x: 250, y: 110 },
    estimatedDuration: 1600,
    soundType: "heavy",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 220, torque: 260, weight: 22, reliability: 12, cost: 5200 },
    tooltipAdvice: "Silicon-Carbide MOSFETs deliver 99% inverter efficiency at up to 20,000 RPM.",
  },
  {
    id: "camshaft",
    name: "Permanent Magnet Rotor Shaft",
    category: "Top End",
    description: "Neodymium-iron-boron magnet rotor shaft delivering instantaneous 0-RPM torque.",
    dependencies: ["cylinder_head"],
    explodedOffset: { x: 0, y: -110 },
    slotPosition: { x: 250, y: 70 },
    estimatedDuration: 1400,
    soundType: "metallic",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 160, torque: 280, weight: 18, reliability: 15, cost: 3800 },
    tooltipAdvice: "Carbon-sleeve rotor prevents magnet deformation at ultra-high centrifugal speeds.",
  },
  {
    id: "valves",
    name: "Axial-Flux Electric Stator Coils",
    category: "Top End",
    description: "High-fill copper stator windings generating rotating electromagnetic drive fields.",
    dependencies: ["camshaft"],
    explodedOffset: { x: 30, y: -80 },
    slotPosition: { x: 250, y: 95 },
    estimatedDuration: 1300,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 140, torque: 190, weight: 16, reliability: 10, cost: 2900 },
    tooltipAdvice: "Direct axial-flux design delivers highest torque density per kilogram in EV hypercars.",
  },
  {
    id: "intake_manifold",
    name: "Single-Speed Reduction Gearbox",
    category: "Induction & Exhaust",
    description: "Precision helical reduction gearset multiplying motor torque to the drive axle.",
    dependencies: ["valves"],
    explodedOffset: { x: -90, y: -60 },
    slotPosition: { x: 180, y: 110 },
    estimatedDuration: 1200,
    soundType: "slide",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 30, torque: 150, weight: 24, reliability: 12, cost: 2100 },
    tooltipAdvice: "Helical cut gears eliminate gear whine while handling 1,200+ Nm of instant torque.",
  },
  {
    id: "exhaust_headers",
    name: "High-Voltage Power Distribution Unit (PDU)",
    category: "Induction & Exhaust",
    description: "Routes 800V power to dual motors, HVAC compressor, and 12V DC-DC converter.",
    dependencies: ["valves"],
    explodedOffset: { x: 90, y: -60 },
    slotPosition: { x: 320, y: 110 },
    estimatedDuration: 1100,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 20, torque: 20, weight: 8, reliability: 10, cost: 1400 },
    tooltipAdvice: "Solid-state contactors prevent arc flashes and provide instant circuit isolation.",
  },
  {
    id: "turbocharger",
    name: "Regenerative Energy Boost System",
    category: "Induction & Exhaust",
    description: "Recovers kinetic braking energy at up to 300kW to recharge battery pack instantly.",
    dependencies: ["exhaust_headers", "intake_manifold"],
    explodedOffset: { x: 110, y: -100 },
    slotPosition: { x: 360, y: 90 },
    estimatedDuration: 1500,
    soundType: "spool",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 120, torque: 140, weight: 15, reliability: 8, cost: 3600 },
    tooltipAdvice: "Torque-vectoring regen boost increases corner entry stability while harvesting power.",
  },
];

export function getAssemblyComponents(engineConfig?: Partial<EngineConfig>): AssemblyComponentMeta[] {
  const isEV =
    engineConfig?.layout === "electric" ||
    engineConfig?.layout === "hybrid" ||
    (engineConfig as any)?.isElectric ||
    (engineConfig as any)?.powertrainType === "electric";

  return isEV ? EV_ASSEMBLY_COMPONENTS : ENGINE_ASSEMBLY_COMPONENTS;
}
