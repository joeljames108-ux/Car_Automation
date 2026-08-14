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
  | "oil_pan"
  | "hybrid_motor"
  | "inverter_ecu";

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
  category: "Core" | "Bottom End" | "Top End" | "Induction & Exhaust" | "Hybrid & Electric";
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
  torqueSpec?: {
    fastenerName: string;
    snugNm: number;
    finalAngleDeg: number;
    boltCount: number;
  };
  clearanceSpec?: {
    label: string;
    targetMm: number;
    minMm: number;
    maxMm: number;
  };
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
    variants: [
      { id: "cast", label: "Gray Cast Iron (Heavy Duty)", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 1.0, reliabilityDelta: 0 },
      { id: "forged", label: "Cast Aluminum Alloy (Lightweight)", hpMultiplier: 1.20, weightMultiplier: 0.55, costMultiplier: 1.4, reliabilityDelta: 5 },
      { id: "billet", label: "Compacted Graphite Iron (CGI)", hpMultiplier: 1.40, weightMultiplier: 0.80, costMultiplier: 1.9, reliabilityDelta: 18 },
      { id: "titanium", label: "Titanium Spec-R (Motorsport)", hpMultiplier: 1.65, weightMultiplier: 0.50, costMultiplier: 4.5, reliabilityDelta: 25 },
    ],
    statDeltas: { hp: 0, torque: 0, weight: 85, reliability: 100, cost: 2500 },
    tooltipAdvice: "Gray Iron = Max Durability & Low Cost (~$1.0x). Aluminum = 45% Weight Saving (~$1.4x). CGI = Double Fatigue Strength & Heavy Boost (~$1.9x). Titanium = Formula-1 Spec.",
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
    torqueSpec: { fastenerName: "Main Cap ARP2000 Bolts", snugNm: 65, finalAngleDeg: 90, boltCount: 14 },
    clearanceSpec: { label: "Main Journal Oil Clearance", targetMm: 0.038, minMm: 0.025, maxMm: 0.055 },
  },
  {
    id: "pistons",
    name: "Pistons & Rings",
    category: "Bottom End",
    description: "Transfers combustion pressure downwards into the connecting rods.",
    dependencies: ["crankshaft"],
    explodedOffset: { x: 0, y: -40 },
    slotPosition: { x: 250, y: 190 },
    estimatedDuration: 1100,
    soundType: "slide",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 45, torque: 30, weight: 8, reliability: 5, cost: 1200 },
    tooltipAdvice: "Low-friction ceramic-coated piston skirts increase power output and thermal resilience.",
    clearanceSpec: { label: "Top Ring End Gap", targetMm: 0.45, minMm: 0.35, maxMm: 0.60 },
  },
  {
    id: "rods",
    name: "Connecting Rods & Wrist Pins",
    category: "Bottom End",
    description: "Links the pistons to the crankshaft journals under high tensile load.",
    dependencies: ["crankshaft"],
    explodedOffset: { x: 0, y: 20 },
    slotPosition: { x: 250, y: 250 },
    estimatedDuration: 1000,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 20, torque: 15, weight: 6, reliability: 10, cost: 950 },
    tooltipAdvice: "H-Beam forged steel rods resist bending forces at elevated boost levels.",
    torqueSpec: { fastenerName: "Rod Cap ARP L19 Fasteners", snugNm: 45, finalAngleDeg: 60, boltCount: 24 },
    clearanceSpec: { label: "Rod Journal Bearing Clearance", targetMm: 0.040, minMm: 0.028, maxMm: 0.058 },
  },
  {
    id: "head_gasket",
    name: "Cylinder Head Gasket",
    category: "Top End",
    description: "Multi-layer steel seal maintaining cylinder compression and oil/coolant isolation.",
    dependencies: ["pistons", "rods"],
    explodedOffset: { x: 0, y: -25 },
    slotPosition: { x: 250, y: 150 },
    estimatedDuration: 800,
    soundType: "slide",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 5, torque: 5, weight: 1, reliability: 15, cost: 350 },
    tooltipAdvice: "MLS head gaskets withstand severe cylinder peak pressures without blowing.",
  },
  {
    id: "cylinder_head",
    name: "Cylinder Head Assembly",
    category: "Top End",
    description: "Houses combustion chambers, intake/exhaust ports, and valve guides.",
    dependencies: ["head_gasket"],
    explodedOffset: { x: 0, y: -70 },
    slotPosition: { x: 250, y: 110 },
    estimatedDuration: 1600,
    soundType: "heavy",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 65, torque: 50, weight: 28, reliability: 10, cost: 3200 },
    tooltipAdvice: "CNC ported intake runners dramatically increase volumetric efficiency.",
    torqueSpec: { fastenerName: "Head Stud 12-Point ARP Nuts", snugNm: 85, finalAngleDeg: 90, boltCount: 28 },
  },
  {
    id: "camshaft",
    name: "Camshafts & Timing Gears",
    category: "Top End",
    description: "Controls valve opening/closing timing relative to crankshaft rotation.",
    dependencies: ["cylinder_head"],
    explodedOffset: { x: 0, y: -110 },
    slotPosition: { x: 250, y: 70 },
    estimatedDuration: 1300,
    soundType: "metallic",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 35, torque: 20, weight: 12, reliability: 5, cost: 1400 },
    tooltipAdvice: "High-lift camshaft profiles shift power band higher into the RPM range.",
  },
  {
    id: "valves",
    name: "Valves & Springs",
    category: "Top End",
    description: "Regulates air-fuel intake and exhaust gas evacuation per combustion cycle.",
    dependencies: ["camshaft"],
    explodedOffset: { x: 0, y: -80 },
    slotPosition: { x: 250, y: 95 },
    estimatedDuration: 1200,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 25, torque: 15, weight: 4, reliability: 8, cost: 1100 },
    tooltipAdvice: "Titanium valves reduce valvetrain inertia, preventing high-RPM valve float.",
  },
  {
    id: "intake_manifold",
    name: "Intake Manifold & Throttle Body",
    category: "Induction & Exhaust",
    description: "Distributes clean ambient or pressurized air evenly into cylinder ports.",
    dependencies: ["cylinder_head"],
    explodedOffset: { x: -90, y: -40 },
    slotPosition: { x: 170, y: 95 },
    estimatedDuration: 1100,
    soundType: "slide",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 30, torque: 25, weight: 10, reliability: 5, cost: 1250 },
    tooltipAdvice: "Individual throttle bodies (ITBs) improve immediate throttle response.",
  },
  {
    id: "exhaust_headers",
    name: "Exhaust Manifold & Headers",
    category: "Induction & Exhaust",
    description: "Scavenges spent exhaust gases away from combustion chambers efficiently.",
    dependencies: ["cylinder_head"],
    explodedOffset: { x: 90, y: -40 },
    slotPosition: { x: 330, y: 95 },
    estimatedDuration: 1100,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 28, torque: 32, weight: 12, reliability: 5, cost: 1400 },
    tooltipAdvice: "Equal-length ceramic-coated headers maximize exhaust scavenging harmonics.",
  },
  {
    id: "turbocharger",
    name: "Turbocharger & Wastegate",
    category: "Induction & Exhaust",
    description: "Uses exhaust energy to force compressed air into intake manifold for massive power output.",
    dependencies: ["exhaust_headers", "intake_manifold"],
    explodedOffset: { x: 110, y: -80 },
    slotPosition: { x: 370, y: 85 },
    estimatedDuration: 1400,
    soundType: "spool",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 120, torque: 150, weight: 18, reliability: -5, cost: 4500 },
    tooltipAdvice: "Twin-scroll ball bearing turbos reduce turbo lag while delivering massive boost pressure.",
  },
  {
    id: "oil_pan",
    name: "Oil Pan & Sump",
    category: "Bottom End",
    description: "Holds engine oil reservoir and oil pump pick-up for pressure lubrication.",
    dependencies: ["block"],
    explodedOffset: { x: 0, y: 70 },
    slotPosition: { x: 250, y: 360 },
    estimatedDuration: 900,
    soundType: "pneumatic",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 5, torque: 5, weight: 8, reliability: 10, cost: 650 },
    tooltipAdvice: "Baffled dry-sump oil pans prevent oil starvation under extreme cornering G-forces.",
  },
];

const HYBRID_MOTOR_VARIANTS: ComponentVariant[] = [
  { id: "cast", label: "400V 90kW Radial-Flux Motor", hpMultiplier: 0.65, weightMultiplier: 1.25, costMultiplier: 0.60, reliabilityDelta: 5 },
  { id: "forged", label: "800V 180kW Axial-Flux Drive", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 1.0, reliabilityDelta: 10 },
  { id: "billet", label: "800V 320kW Dual-Stator Motor", hpMultiplier: 1.45, weightMultiplier: 0.85, costMultiplier: 1.85, reliabilityDelta: 15 },
  { id: "titanium", label: "900V 480kW Carbon-Rotor HyperDrive", hpMultiplier: 2.10, weightMultiplier: 0.65, costMultiplier: 3.20, reliabilityDelta: 20 },
];

const INVERTER_ECU_VARIANTS: ComponentVariant[] = [
  { id: "cast", label: "400V IGBT ECU (10kHz Pulse)", hpMultiplier: 0.80, weightMultiplier: 1.15, costMultiplier: 0.65, reliabilityDelta: 0 },
  { id: "forged", label: "800V SiC MOSFET Inverter (20kHz)", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 1.0, reliabilityDelta: 12 },
  { id: "billet", label: "Dual SiC Inverter + Vectoring MCU", hpMultiplier: 1.35, weightMultiplier: 0.88, costMultiplier: 1.90, reliabilityDelta: 18 },
  { id: "titanium", label: "900V Direct-Chilled Formula ECU", hpMultiplier: 1.75, weightMultiplier: 0.70, costMultiplier: 3.40, reliabilityDelta: 25 },
];

export const HYBRID_ASSEMBLY_COMPONENTS: AssemblyComponentMeta[] = [
  ...ENGINE_ASSEMBLY_COMPONENTS,
  {
    id: "hybrid_motor",
    name: "Hybrid Electric Drive Motor",
    category: "Hybrid & Electric",
    description: "High-power electric drive motor unit providing instant electric torque boost & kinetic energy recovery.",
    dependencies: ["block", "crankshaft"],
    explodedOffset: { x: -85, y: 50 },
    slotPosition: { x: 100, y: 340 },
    estimatedDuration: 1400,
    soundType: "metallic",
    variants: HYBRID_MOTOR_VARIANTS,
    statDeltas: { hp: 241, torque: 380, weight: 34, reliability: 10, cost: 6500 },
    tooltipAdvice: "Axial-flux geometry delivers unmatched power density and instant 0-RPM torque.",
  },
  {
    id: "inverter_ecu",
    name: "Inverter & Hybrid ECU Module",
    category: "Hybrid & Electric",
    description: "Silicon Carbide (SiC) power electronics inverter and dual-core hybrid ECU energy management unit.",
    dependencies: ["hybrid_motor"],
    explodedOffset: { x: -85, y: -45 },
    slotPosition: { x: 100, y: 130 },
    estimatedDuration: 1200,
    soundType: "click",
    variants: INVERTER_ECU_VARIANTS,
    statDeltas: { hp: 15, torque: 20, weight: 8, reliability: 15, cost: 3200 },
    tooltipAdvice: "Silicon Carbide MOSFETs enable 99% inverter efficiency and ultra-fast switching speeds.",
  },
];

export const EV_ASSEMBLY_COMPONENTS: AssemblyComponentMeta[] = [
  {
    id: "block",
    name: "EV Battery Pack Tray & Enclosure",
    category: "Core",
    description: "Structural aluminum battery tray and protective skid plate housing lithium cell modules.",
    dependencies: [],
    explodedOffset: { x: 0, y: 0 },
    slotPosition: { x: 250, y: 220 },
    estimatedDuration: 1200,
    soundType: "heavy",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 350, reliability: 100, cost: 8500 },
    tooltipAdvice: "Reinforced structural battery enclosure contributes to chassis torsional rigidity.",
  },
  {
    id: "crankshaft",
    name: "High-Voltage Lithium-Ion Battery Modules",
    category: "Bottom End",
    description: "800V high-density cell modules supplying DC power to drive motors.",
    dependencies: ["block"],
    explodedOffset: { x: 0, y: 40 },
    slotPosition: { x: 250, y: 230 },
    estimatedDuration: 1500,
    soundType: "heavy",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 180, torque: 200, weight: 280, reliability: 10, cost: 12000 },
    tooltipAdvice: "Solid-state electrolyte cells double energy density while eliminating fire risk.",
  },
  {
    id: "pistons",
    name: "Battery Management System (BMS)",
    category: "Bottom End",
    description: "Monitors individual cell voltages, state of charge (SoC), and thermal balancing.",
    dependencies: ["crankshaft"],
    explodedOffset: { x: 0, y: -20 },
    slotPosition: { x: 250, y: 210 },
    estimatedDuration: 1000,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 10, torque: 10, weight: 4, reliability: 20, cost: 1500 },
    tooltipAdvice: "Real-time active cell balancing prolongs battery pack life by up to 40%.",
  },
  {
    id: "rods",
    name: "High-Voltage Busbars & Wiring Harness",
    category: "Bottom End",
    description: "Heavy-gauge copper busbars linking battery module strings in series/parallel.",
    dependencies: ["crankshaft"],
    explodedOffset: { x: 0, y: 10 },
    slotPosition: { x: 250, y: 240 },
    estimatedDuration: 900,
    soundType: "slide",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 15, torque: 15, weight: 12, reliability: 15, cost: 950 },
    tooltipAdvice: "Low-resistance solid copper busbars minimize I²R electrical transmission losses.",
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
  const isHybrid =
    engineConfig?.layout === "hybrid" ||
    (engineConfig?.hybridArchitecture && engineConfig.hybridArchitecture !== "none") ||
    (engineConfig as any)?.isHybrid;

  const isEV =
    !isHybrid &&
    (engineConfig?.layout === "electric" || (engineConfig as any)?.powertrainType === "electric");

  if (isEV) return EV_ASSEMBLY_COMPONENTS;
  if (isHybrid) return HYBRID_ASSEMBLY_COMPONENTS;
  return ENGINE_ASSEMBLY_COMPONENTS;
}
