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
  | "radiator"
  | "transmission"
  | "engine_cover"
  | "hybrid_motor"
  | "inverter_ecu"
  | "chassis_frame"
  | "suspension_front"
  | "suspension_rear"
  | "brakes"
  | "wheels_tires"
  | "aero_package"
  | "electronics_ecu";

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
  {
    id: "radiator",
    name: "Radiator & Cooling Fans",
    category: "Core",
    description: "High-efficiency multi-row aluminum racing radiator, dual high-CFM electric puller fans, and expansion reservoir.",
    dependencies: ["block"],
    explodedOffset: { x: -80, y: 0 },
    slotPosition: { x: 110, y: 220 },
    estimatedDuration: 1100,
    soundType: "pneumatic",
    variants: [
      { id: "cast", label: "OEM Dual-Core Aluminum (32mm)", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 1.0, reliabilityDelta: 0 },
      { id: "forged", label: "Triple-Pass High-Flow Aluminum Core (48mm)", hpMultiplier: 1.05, weightMultiplier: 0.85, costMultiplier: 1.6, reliabilityDelta: 12 },
      { id: "billet", label: "CNC Billet End-Tank Motorsport Core (56mm)", hpMultiplier: 1.08, weightMultiplier: 0.78, costMultiplier: 2.4, reliabilityDelta: 18 },
      { id: "titanium", label: "Ultra-Light Core + Dual Brushless Fans (64mm)", hpMultiplier: 1.12, weightMultiplier: 0.65, costMultiplier: 3.8, reliabilityDelta: 25 },
    ],
    statDeltas: { hp: 8, torque: 5, weight: 14, reliability: 20, cost: 950 },
    tooltipAdvice: "Multi-pass crossflow cooling maintains optimal 88°C coolant temps, preventing heat soak and detonation under sustained track load.",
    torqueSpec: {
      fastenerName: "M8 Water Neck & Radiator Bracket Bolts",
      snugNm: 15,
      finalAngleDeg: 45,
      boltCount: 6,
    },
  },
  {
    id: "transmission",
    name: "Transmission & Clutch Assembly",
    category: "Bottom End",
    description: "Cutaway bellhousing, multi-plate clutch, flywheel, precision helical gear shafts, and integrated Transmission Control Unit (TCU).",
    dependencies: ["block", "crankshaft"],
    explodedOffset: { x: 80, y: 40 },
    slotPosition: { x: 390, y: 290 },
    estimatedDuration: 1400,
    soundType: "metallic",
    variants: [
      { id: "cast", label: "6-Speed Synchronized Manual Transmission", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 1.0, reliabilityDelta: 0 },
      { id: "forged", label: "7-Speed Dual-Clutch (DCT) + Twin-Plate Clutch", hpMultiplier: 1.15, weightMultiplier: 0.92, costMultiplier: 2.2, reliabilityDelta: 10 },
      { id: "billet", label: "6-Speed Straight-Cut Dog-Ring Sequential Gearbox", hpMultiplier: 1.25, weightMultiplier: 0.80, costMultiplier: 3.2, reliabilityDelta: 18 },
      { id: "titanium", label: "7-Speed Carbon-Cased Formula Sequential + Paddle Actuation", hpMultiplier: 1.35, weightMultiplier: 0.68, costMultiplier: 4.8, reliabilityDelta: 24 },
    ],
    statDeltas: { hp: 35, torque: 45, weight: 62, reliability: 15, cost: 7800 },
    tooltipAdvice: "Dual-clutch and sequential dog-ring gearboxes provide lightning-fast 25ms upshifts with minimal drivetrain friction loss.",
    torqueSpec: {
      fastenerName: "ARP Bellhousing-to-Block Studs",
      snugNm: 50,
      finalAngleDeg: 90,
      boltCount: 10,
    },
  },
  {
    id: "engine_cover",
    name: "Engine Cover & Induction Plenum",
    category: "Top End",
    description: "Acoustic dress cover with transparent velocity stack inspection windows and front ram-air induction scoop.",
    dependencies: ["intake_manifold", "cylinder_head"],
    explodedOffset: { x: 0, y: -90 },
    slotPosition: { x: 250, y: 80 },
    estimatedDuration: 1000,
    soundType: "slide",
    variants: [
      { id: "cast", label: "OEM Polycarbonate Engine Beauty Cover", hpMultiplier: 1.0, weightMultiplier: 1.0, costMultiplier: 1.0, reliabilityDelta: 0 },
      { id: "forged", label: "Brushed Aluminum & Gold Anodized V12 Trim Cover", hpMultiplier: 1.04, weightMultiplier: 0.82, costMultiplier: 1.8, reliabilityDelta: 5 },
      { id: "billet", label: "Dry Pre-Preg 3K Twill Carbon-Fiber Cover with Gold Frame", hpMultiplier: 1.08, weightMultiplier: 0.55, costMultiplier: 2.8, reliabilityDelta: 10 },
      { id: "titanium", label: "Forged Carbon-Titanium Aerocover with Ram-Air Ducting", hpMultiplier: 1.15, weightMultiplier: 0.45, costMultiplier: 4.2, reliabilityDelta: 15 },
    ],
    statDeltas: { hp: 12, torque: 10, weight: 4, reliability: 5, cost: 2400 },
    tooltipAdvice: "Carbon-fiber ram-air induction plenums pressurize intake air at high speeds while shielding heat from intake runners.",
    torqueSpec: {
      fastenerName: "Titanium M6 Quarter-Turn Fasteners",
      snugNm: 8,
      finalAngleDeg: 30,
      boltCount: 8,
    },
  },
  {
    id: "chassis_frame",
    name: "Chassis Frame & Monocoque",
    category: "Core",
    description: "The core structural chassis tub supporting engine mounts, suspension pickups, and crash structures.",
    dependencies: ["transmission"],
    explodedOffset: { x: 0, y: 100 },
    slotPosition: { x: 250, y: 250 },
    estimatedDuration: 1800,
    soundType: "heavy",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 180, reliability: 100, cost: 8500 },
    tooltipAdvice: "Carbon monocoque tub increases torsional rigidity by 40% while cutting 35% chassis mass.",
  },
  {
    id: "suspension_front",
    name: "Front Wishbone Suspension",
    category: "Bottom End",
    description: "Double-wishbone pushrod front suspension geometry with active dampers and anti-roll bar.",
    dependencies: ["chassis_frame"],
    explodedOffset: { x: -80, y: 40 },
    slotPosition: { x: 150, y: 260 },
    estimatedDuration: 1400,
    soundType: "metallic",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 35, reliability: 15, cost: 3200 },
    tooltipAdvice: "Double-wishbone pushrod suspension maintains optimal camber gain through high-G cornering.",
  },
  {
    id: "suspension_rear",
    name: "Rear Multi-Link Suspension",
    category: "Bottom End",
    description: "Multi-link rear suspension with active skyhook dampers, toe links, and sway bar.",
    dependencies: ["chassis_frame"],
    explodedOffset: { x: 80, y: 40 },
    slotPosition: { x: 350, y: 260 },
    estimatedDuration: 1400,
    soundType: "metallic",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 38, reliability: 15, cost: 3400 },
    tooltipAdvice: "Multi-link rear suspension prevents snap-oversteer under aggressive power-on exit.",
  },
  {
    id: "brakes",
    name: "Carbon-Ceramic Brake System",
    category: "Top End",
    description: "6-piston monobloc aluminum calipers and carbon-ceramic vented brake discs.",
    dependencies: ["suspension_front", "suspension_rear"],
    explodedOffset: { x: -100, y: 80 },
    slotPosition: { x: 140, y: 280 },
    estimatedDuration: 1200,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 22, reliability: 20, cost: 4800 },
    tooltipAdvice: "Carbon-ceramic rotors eliminate thermal fade during repeated high-speed circuit braking.",
  },
  {
    id: "wheels_tires",
    name: "Forged Magnesium Wheels & Tires",
    category: "Top End",
    description: "Centerlock forged magnesium wheels mounted with soft-compound competition slick tires.",
    dependencies: ["brakes"],
    explodedOffset: { x: 100, y: 80 },
    slotPosition: { x: 360, y: 280 },
    estimatedDuration: 1100,
    soundType: "heavy",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 42, reliability: 10, cost: 3900 },
    tooltipAdvice: "Forged magnesium wheels reduce un-sprung rotational inertia for rapid acceleration.",
  },
  {
    id: "aero_package",
    name: "Active Aerodynamic Package",
    category: "Induction & Exhaust",
    description: "Active DRS rear wing, carbon front splitter, underbody venturi tunnels, and side skirts.",
    dependencies: ["wheels_tires"],
    explodedOffset: { x: 0, y: -120 },
    slotPosition: { x: 250, y: 120 },
    estimatedDuration: 1500,
    soundType: "slide",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 15, torque: 0, weight: 28, reliability: 15, cost: 6200 },
    tooltipAdvice: "Active aerodynamic surfaces generate high-speed downforce while minimizing drag on straights.",
  },
  {
    id: "electronics_ecu",
    name: "Vehicle ECU & CAN-Bus Harness",
    category: "Hybrid & Electric",
    description: "Bosch Motorsport ECU, high-speed CAN-bus wiring harness, telemetry sensors, and TCU.",
    dependencies: ["aero_package"],
    explodedOffset: { x: 0, y: -60 },
    slotPosition: { x: 250, y: 170 },
    estimatedDuration: 1300,
    soundType: "click",
    variants: DEFAULT_VARIANTS,
    statDeltas: { hp: 20, torque: 15, weight: 6, reliability: 25, cost: 3100 },
    tooltipAdvice: "High-speed CAN-bus ECU coordinates launch control, ABS, and torque vectoring.",
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

// ===================================================================
// SEQUENTIAL ENGINE BUILDER FLOW — TYPES & STAGES
// ===================================================================

export type PowertrainMode = "ice" | "electric";

export type VirtualStageId =
  | "powertrain_select"
  | "ice_gate"
  | "ev_gate"
  | "hybrid_optional"
  | "finish";

export type BuildStageId = ComponentId | VirtualStageId;

export interface StageDefinition {
  id: BuildStageId;
  name: string;
  shortName: string;
  subtitle: string;
  category: "Setup" | "Core" | "Bottom End" | "Top End" | "Induction & Exhaust" | "Hybrid & Electric" | "Summary";
  isVirtual?: boolean;
  componentId?: ComponentId;
  powertrain: "both" | "ice" | "electric";
  iconName?: string;
}

export const ICE_STAGE_SEQUENCE: ComponentId[] = [
  "block",
  "crankshaft",
  "pistons",
  "rods",
  "head_gasket",
  "cylinder_head",
  "camshaft",
  "valves",
  "intake_manifold",
  "exhaust_headers",
  "turbocharger",
  "oil_pan",
  "radiator",
  "transmission",
  "engine_cover",
  "chassis_frame",
  "suspension_front",
  "suspension_rear",
  "brakes",
  "wheels_tires",
  "aero_package",
  "electronics_ecu",
];

export const EV_STAGE_SEQUENCE: ComponentId[] = [
  "block",           // EV Battery Pack Tray & Enclosure
  "crankshaft",      // High-Voltage Lithium-Ion Battery Modules
  "pistons",         // Battery Management System (BMS)
  "rods",            // High-Voltage Busbars & Wiring Harness
  "oil_pan",         // Liquid Cooling Radiator & Pump Reservoir
  "head_gasket",     // Glycol Thermal Cooling Plate
  "cylinder_head",   // 800V SiC Inverter Power Module
  "camshaft",        // Permanent Magnet Rotor Shaft
  "valves",          // Axial-Flux Electric Stator Coils
  "intake_manifold", // Single-Speed Reduction Gearbox
  "exhaust_headers", // High-Voltage Power Distribution Unit (PDU)
  "turbocharger",    // Regenerative Energy Boost System
];

export const HYBRID_STAGE_SEQUENCE: ComponentId[] = [
  "hybrid_motor",
  "inverter_ecu",
];

export const STAGE_METADATA_MAP_ICE: Record<ComponentId, { title: string; short: string; subtitle: string; advice: string }> = {
  block: {
    title: "Engine Block Architecture",
    short: "Engine Block",
    subtitle: "Select cylinder bank architecture, cylinder bore, piston stroke and deck geometry",
    advice: "Cast iron offers maximum cylinder sleeve rigidity under heavy boost, while aluminum alloy cuts 45% weight."
  },
  crankshaft: {
    title: "Crankshaft & Main Journal Bearings",
    short: "Crankshaft",
    subtitle: "Main bearing saddles, counterweights, and cross-plane / flat-plane balance",
    advice: "Forged 4340 chromoly steel withstands extreme torque spikes and torsional harmonics at high RPM."
  },
  pistons: {
    title: "Pistons & Compression Rings",
    short: "Pistons",
    subtitle: "Piston dome design, compression rings, and crown thermal insulation coating",
    advice: "Low-friction ceramic coated piston skirts reduce cylinder wall friction and improve thermal durability."
  },
  rods: {
    title: "Connecting Rods & Wrist Pins",
    short: "Connecting Rods",
    subtitle: "H-Beam / I-Beam rod design, floating wrist pins, and ARP rod bolt specs",
    advice: "H-Beam forged connecting rods resist buckling forces under intense boost pressures and high cylinder load."
  },
  head_gasket: {
    title: "Multi-Layer Steel Head Gasket",
    short: "Head Gasket",
    subtitle: "Multi-layer steel compression sealing with integrated combustion fire rings",
    advice: "MLS head gaskets seal high cylinder peak combustion pressures without risk of blowout."
  },
  cylinder_head: {
    title: "Cylinder Head & Valvetrain Architecture",
    short: "Cylinder Head",
    subtitle: "Combustion chamber CNC porting, valve angle, and SOHC/DOHC valvetrain layout",
    advice: "CNC-ported intake & exhaust ports dramatically increase volumetric flow efficiency."
  },
  camshaft: {
    title: "Camshafts & Timing Gears",
    short: "Camshafts",
    subtitle: "Cam lobe duration, valve lift profile, and variable valve timing phase tuning",
    advice: "High-lift camshaft profiles breathe better at redline, moving the engine's power curve higher."
  },
  valves: {
    title: "Valves, Springs & Retainers",
    short: "Valves",
    subtitle: "Sodium-filled exhaust valves, dual valve springs, and titanium retainers",
    advice: "Titanium retainers reduce valvetrain mass and eliminate high-RPM valve float."
  },
  intake_manifold: {
    title: "Intake Manifold & Fuel Delivery",
    short: "Intake & Fuel",
    subtitle: "Intake plenum volume, throttle bodies, and direct/port fuel injectors",
    advice: "Individual Throttle Bodies (ITBs) deliver instantaneous throttle response and optimal airflow distribution."
  },
  exhaust_headers: {
    title: "Exhaust Manifold & Scavenging Headers",
    short: "Exhaust Headers",
    subtitle: "Equal-length primary runners, collector merge angle, and catalytic converters",
    advice: "Equal-length ceramic-coated headers maximize pulse scavenging harmonics for higher midrange torque."
  },
  turbocharger: {
    title: "Turbocharging & Wastegate System",
    short: "Turbocharger",
    subtitle: "Compressor/turbine A/R sizing, intercooler matrix, and electronic boost control",
    advice: "Twin-scroll ball-bearing turbos eliminate boost lag while sustaining immense volumetric flow."
  },
  oil_pan: {
    title: "Oil Pan & Integrated Dry-Sump System",
    short: "Oil Pan & Sump",
    subtitle: "Baffled wet sump vs multi-stage dry-sump scavenging system and hardlines",
    advice: "Multi-stage dry-sump lubrication with external reservoir eliminates oil starvation under extreme track G-forces."
  },
  radiator: {
    title: "Cooling Radiator & Electric Fans",
    short: "Radiator & Fans",
    subtitle: "Multi-core aluminum crossflow radiator, high-CFM brushless fans and expansion tank",
    advice: "Multi-pass crossflow cooling maintains optimal 88°C coolant temps, preventing heat soak and detonation under load."
  },
  transmission: {
    title: "Transmission, Bellhousing & Clutch",
    short: "Transmission",
    subtitle: "Sequential / dual-clutch transmission, multi-plate clutch, flywheel and TCU",
    advice: "Dual-clutch and sequential dog-ring gearboxes provide lightning-fast 25ms upshifts with minimal drivetrain power loss."
  },
  engine_cover: {
    title: "Engine Cover & Ram-Air Induction Plenum",
    short: "Engine Cover",
    subtitle: "Carbon-fiber aerodynamic dress cover with velocity stack windows and ram-air scoop",
    advice: "Carbon-fiber ram-air induction plenums pressurize intake air at high speeds while shielding heat from intake runners."
  },
  hybrid_motor: {
    title: "Hybrid Electric Drive Motor",
    short: "Hybrid Motor",
    subtitle: "Axial-flux electric motor assist mounted to crankshaft/transmission",
    advice: "Axial-flux motor geometry generates instantaneous torque from zero RPM to eliminate turbo lag."
  },
  inverter_ecu: {
    title: "Inverter & Hybrid ECU Module",
    short: "Inverter ECU",
    subtitle: "Silicon Carbide (SiC) power inverter and dual-core hybrid energy controller",
    advice: "800V SiC MOSFET power electronics achieve 99% switching efficiency."
  },
  chassis_frame: {
    title: "Chassis Frame & Structural Monocoque",
    short: "Chassis Frame",
    subtitle: "Select carbon monocoque tub, aluminum spaceframe, or steel unibody",
    advice: "Carbon monocoque tub increases torsional rigidity by 40% while cutting 35% chassis mass."
  },
  suspension_front: {
    title: "Front Double-Wishbone Pushrod Suspension",
    short: "Front Suspension",
    subtitle: "Pushrod damper geometry, anti-roll bar rates, and steering knuckle",
    advice: "Double-wishbone pushrod suspension maintains optimal camber gain through high-G cornering."
  },
  suspension_rear: {
    title: "Rear Multi-Link / Skyhook Suspension",
    short: "Rear Suspension",
    subtitle: "Active skyhook dampers, rear toe control arms, and sway bar link",
    advice: "Multi-link rear suspension prevents snap-oversteer under aggressive power-on exit."
  },
  brakes: {
    title: "Carbon-Ceramic Brake System & Calipers",
    short: "Brake System",
    subtitle: "6-piston monobloc aluminum calipers and carbon-ceramic vented discs",
    advice: "Carbon-ceramic rotors eliminate thermal fade during repeated high-speed circuit braking."
  },
  wheels_tires: {
    title: "Forged Magnesium Wheels & Racing Slicks",
    short: "Wheels & Tires",
    subtitle: "Centerlock forged wheels and soft-compound sticky racing slicks",
    advice: "Forged magnesium wheels reduce un-sprung rotational inertia for rapid acceleration."
  },
  aero_package: {
    title: "Active Aerodynamic Wing & Splitters",
    short: "Aero Package",
    subtitle: "Active DRS rear wing, front splitter, and venturi diffuser ground effect",
    advice: "Active aerodynamic surfaces generate high-speed downforce while minimizing drag on straights."
  },
  electronics_ecu: {
    title: "Bosch Motorsport ECU & Wiring Harness",
    short: "Vehicle ECU",
    subtitle: "High-speed CAN-bus electronics, traction control, and telemetry sensor suite",
    advice: "High-speed CAN-bus ECU coordinates launch control, ABS, and torque vectoring."
  },
};

export const STAGE_METADATA_MAP_EV: Record<ComponentId, { title: string; short: string; subtitle: string; advice: string }> = {
  block: {
    title: "EV Battery Pack Tray & Structural Enclosure",
    short: "Battery Tray",
    subtitle: "Structural aluminum tray, ballistic skid plate and crash crumple zone integration",
    advice: "Cell-to-pack structural design improves chassis torsional stiffness by over 30%."
  },
  crankshaft: {
    title: "High-Voltage Lithium-Ion Battery Modules",
    short: "Battery Cells",
    subtitle: "800V high-density cell modules, series/parallel string arrangements",
    advice: "Solid-state electrolyte chemistry doubles volumetric energy density while eliminating thermal runaway."
  },
  pistons: {
    title: "Battery Management System (BMS)",
    short: "BMS Controller",
    subtitle: "Active cell balancing, SoC/SoH neural estimation, and isolation monitoring",
    advice: "Active cell balancing extends pack cycle lifespan by over 40% under fast-charging loads."
  },
  rods: {
    title: "High-Voltage Busbars & Wiring Harness",
    short: "HV Busbars",
    subtitle: "Solid copper busbars, pyrofuse isolation disconnects, and heavy-gauge conduits",
    advice: "Low-impedance solid copper busbars minimize electrical transmission resistance and heat generation."
  },
  oil_pan: {
    title: "Liquid Cooling Radiator & Pump Reservoir",
    short: "Cooling Radiator",
    subtitle: "Dual-circuit electric coolant pumps, heat exchanger and front air radiator",
    advice: "Dual-loop thermal management precisely regulates temperature between motor and battery pack."
  },
  head_gasket: {
    title: "Glycol Thermal Cooling Plate",
    short: "Cooling Plate",
    subtitle: "Direct-contact micro-channel liquid cooling plate bonded beneath cell modules",
    advice: "Micro-channel cooling plates ensure cell-to-cell delta remains under 2°C during high-power discharge."
  },
  cylinder_head: {
    title: "800V SiC Inverter Power Module",
    short: "SiC Inverter",
    subtitle: "Silicon Carbide MOSFET power modules converting 800V DC to 3-phase AC drive",
    advice: "SiC power stages handle up to 25kHz switching frequency with minimal thermal loss."
  },
  camshaft: {
    title: "Permanent Magnet Rotor Shaft",
    short: "Rotor Shaft",
    subtitle: "Neodymium-iron-boron magnet array with carbon-fiber retention sleeve",
    advice: "Carbon-fiber wound rotor sleeves prevent centrifugal magnet distortion up to 25,000 RPM."
  },
  valves: {
    title: "Axial-Flux Electric Stator Coils",
    short: "Stator Coils",
    subtitle: "Hairpin copper stator windings creating high-density rotating magnetic fields",
    advice: "Hairpin slot-fill density achieves industry-leading torque per kilogram in electric hypercars."
  },
  intake_manifold: {
    title: "Single-Speed Reduction Gearbox",
    short: "Reduction Gearbox",
    subtitle: "Precision helical reduction gears multiplying motor torque to drive axles",
    advice: "Helical gear geometry minimizes gear mesh noise while handling over 1,500 Nm torque."
  },
  exhaust_headers: {
    title: "High-Voltage Power Distribution Unit (PDU)",
    short: "HV PDU",
    subtitle: "Solid-state contactors, DC-DC converter, and auxiliary power distribution",
    advice: "Solid-state pyrofuse contactors isolate high-voltage systems in under 2 milliseconds."
  },
  turbocharger: {
    title: "Regenerative Energy Boost System",
    short: "Regen System",
    subtitle: "Bi-directional kinetic energy recovery generating up to 350kW recharge power",
    advice: "Integrated torque-vectoring regen stabilizes corner entry while recuperating maximum kinetic energy."
  },
  radiator: {
    title: "EV Radiator Heat Exchanger",
    short: "Heat Exchanger",
    subtitle: "Auxiliary front radiator for motor and inverter cooling loops",
    advice: "Maintains optimal 45°C power electronics operating temperature."
  },
  transmission: {
    title: "Dual-Motor Reduction Gearset",
    short: "E-Transmission",
    subtitle: "Integrated electronic differential and planetary gear reduction",
    advice: "Delivers independent left/right torque vectoring across rear axle."
  },
  engine_cover: {
    title: "Inverter Acoustic Aero Cowl",
    short: "Motor Cowling",
    subtitle: "Carbon-composite sound damping and aero cover",
    advice: "Reduces high-frequency inverter switching noise."
  },
  hybrid_motor: {
    title: "Auxiliary E-Motor",
    short: "Aux Motor",
    subtitle: "Secondary electric drive unit",
    advice: "Provides additional front-axle torque vectoring."
  },
  inverter_ecu: {
    title: "Powertrain MCU",
    short: "MCU Unit",
    subtitle: "Vehicle central powertrain control module",
    advice: "Coordinates multi-motor torque vectoring algorithms."
  },
  chassis_frame: {
    title: "EV Skateboard Platform Chassis",
    short: "EV Chassis",
    subtitle: "Structural battery-integrated skateboard monocoque",
    advice: "Integrated battery structural pack delivers extreme torsional rigidity."
  },
  suspension_front: {
    title: "Front Double Wishbone Suspension",
    short: "Front Suspension",
    subtitle: "Inboard pushrod geometry with active magneto dampers",
    advice: "Active damping isolates road disturbances while maintaining maximum tire contact patch."
  },
  suspension_rear: {
    title: "Rear Multi-Link Suspension",
    short: "Rear Suspension",
    subtitle: "5-link rear suspension with integral link toe control",
    advice: "Independent 5-link geometry prevents unwanted rear camber change under heavy lateral load."
  },
  brakes: {
    title: "Brembo Carbon-Ceramic Brakes & EV Regen Blending",
    short: "Carbon Brakes",
    subtitle: "420mm CSiC rotors with 10-piston calipers & integrated brake-by-wire",
    advice: "Electro-hydraulic brake-by-wire seamlessly blends mechanical braking with 350kW motor regen."
  },
  wheels_tires: {
    title: "Forged Magnesium Wheels & Bespoke Slicks",
    short: "Forged Wheels",
    subtitle: "Ultra-lightweight forged wheels with bespoke high-grip compound tires",
    advice: "Reduced rotational unsprung inertia improves transient acceleration and braking response."
  },
  aero_package: {
    title: "Active Aerodynamics & Venturi Diffuser",
    short: "Active Aero",
    subtitle: "Active front splitters, rear wing DRS, and underbody ground-effect tunnels",
    advice: "Active aerodynamic surfaces generate high-speed downforce while minimizing drag on straights."
  },
  electronics_ecu: {
    title: "Bosch Motorsport ECU & Wiring Harness",
    short: "Vehicle ECU",
    subtitle: "High-speed CAN-bus electronics, traction control, and telemetry sensor suite",
    advice: "High-speed CAN-bus ECU coordinates launch control, ABS, and torque vectoring."
  },
};


