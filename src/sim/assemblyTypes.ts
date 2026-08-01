// ===================================================================
// ENGINE ASSEMBLY SYSTEM — TYPES & CONSTANTS
// ===================================================================

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
    explodedOffset: { x: -100, y: -40 },
    slotPosition: { x: 150, y: 110 },
    estimatedDuration: 1100,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 25, torque: 30, weight: 9, reliability: 5, cost: 850 },
    tooltipAdvice: "Tuned runner lengths enhance plenum pressure resonance.",
  },
  {
    id: "exhaust_headers",
    name: "Exhaust Manifold & Headers",
    category: "Induction & Exhaust",
    description: "Collects high-temperature exhaust gases from the cylinders and routes them out.",
    dependencies: ["valves"],
    explodedOffset: { x: 100, y: -40 },
    slotPosition: { x: 350, y: 110 },
    estimatedDuration: 1100,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 30, torque: 35, weight: 12, reliability: 5, cost: 950 },
    tooltipAdvice: "Equal-length primary pipes maximize exhaust scavenge wave effect.",
  },
  {
    id: "turbocharger",
    name: "Turbocharger & Wastegate",
    category: "Induction & Exhaust",
    description: "Uses exhaust gas energy to force compressed air into the engine for huge power gains.",
    dependencies: ["exhaust_headers", "intake_manifold"],
    explodedOffset: { x: 110, y: 30 },
    slotPosition: { x: 380, y: 180 },
    estimatedDuration: 1700,
    soundType: "spool",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 120, torque: 150, weight: 18, reliability: -4, cost: 3200 },
    tooltipAdvice: "Twin-scroll turbine housing provides quick spool response and high peak boost.",
  },
];
