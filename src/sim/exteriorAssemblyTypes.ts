// ===================================================================
// EXTERIOR VEHICLE ASSEMBLY SYSTEM — COMPONENT TAXONOMY & REGISTRY
// ===================================================================
// Defines all progressive structural, closure, aerodynamic, optical,
// glazing, and wheel subsystems for vehicle exterior assembly.
// ===================================================================

import type { MaterialGrade, ComponentVariant } from "./assemblyTypes";
import type { VehicleConfig } from "./types";

export type ExteriorComponentId =
  // ── 1. Structural Backbone & Spaceframe ──
  | "chassis_frame"
  | "front_subframe"
  | "rear_subframe"
  | "floor_pan"
  | "firewall_bulkhead"
  | "a_pillar_assembly"
  | "b_pillar_assembly"
  | "c_pillar_assembly"
  | "rocker_panels"
  | "crash_boxes_front_rear"
  | "roll_cage_safety"

  // ── 2. Suspension & Running Gear ──
  | "suspension_front_assembly"
  | "suspension_rear_assembly"
  | "brake_rotors_calipers"
  | "wheels_tires_assembly"

  // ── 3. Primary Body Closures & Panels ──
  | "hood_panel"
  | "front_fenders"
  | "doors_assembly"
  | "rear_quarter_panels"
  | "trunk_decklid"
  | "roof_panel"

  // ── 4. Fascias, Bumpers & Aerodynamics ──
  | "front_bumper_fascia"
  | "rear_bumper_fascia"
  | "front_splitter_tray"
  | "rear_diffuser_tunnel"
  | "side_skirts_aero"
  | "rear_wing_spoiler"
  | "canards_dive_planes"
  | "hood_fender_vents"

  // ── 5. Glazing & Optical Lighting ──
  | "windshield_glass"
  | "side_door_glass"
  | "rear_window_backlite"
  | "headlights_matrix"
  | "taillights_oled"
  | "fog_drl_lights"

  // ── 6. Exterior Trim, Mirrors & Details ──
  | "side_mirrors"
  | "front_grille_mesh"
  | "exhaust_tips_surround"
  | "door_handles_latches"
  | "wiper_cowl_assembly"
  | "badges_emblems";

export type ExteriorAssemblyPhase =
  | "idle"
  | "picking"
  | "traveling"
  | "panel_aligning"
  | "spot_welding"
  | "riveting"
  | "bonding"
  | "bolting"
  | "painting"
  | "curing"
  | "confirming"
  | "complete";

export type ExteriorCategory =
  | "Structure & Chassis"
  | "Suspension & Running Gear"
  | "Body Closures & Shell"
  | "Aerodynamics & Bumpers"
  | "Glazing & Lighting"
  | "Trim & Final Assembly";

export interface ExteriorFastenerSpec {
  fastenerName: string;
  nominalTorqueNm: number;
  angleSpecificationDeg: number;
  fastenerCount: number;
  fastenerGrade: string;
  threadLockCompound?: "blue_medium" | "red_high_temp" | "none";
}

export interface ExteriorClearanceSpec {
  inspectionZone: string;
  nominalMm: number;
  minMm: number;
  maxMm: number;
  measurementTool: "feeler_gauge" | "optical_laser_gap_gun" | "dial_indicator" | "caliper";
}

export interface ExteriorAssemblyComponentMeta {
  id: ExteriorComponentId;
  name: string;
  category: ExteriorCategory;
  subcategory: string;
  description: string;
  dependencies: ExteriorComponentId[];
  explodedOffset: { x: number; y: number; z: number };
  slotPosition: { x: number; y: number; z: number };
  estimatedDuration: number;
  soundType: "heavy" | "click" | "slide" | "spool" | "metallic" | "pneumatic" | "weld_spark";
  variants: ComponentVariant[];
  statDeltas: {
    hp: number;
    torque: number;
    weight: number;          // kg
    rigidity: number;        // kNm/deg
    dragCd: number;          // Delta Cd (+/-)
    downforceKg: number;     // Downforce @ 200 km/h
    cost: number;            // $
  };
  tooltipAdvice: string;
  fastenerSpec?: ExteriorFastenerSpec;
  clearanceSpec?: ExteriorClearanceSpec;
  paintZone: "body" | "contrast_roof" | "aero_unpainted_carbon" | "glass" | "lighting" | "metal_chassis" | "wheel";
}

// ===================================================================
// MATERIAL GRADE VARIANTS
// ===================================================================

const STRUCTURAL_CHASSIS_VARIANTS: ComponentVariant[] = [
  { id: "cast", label: "Cold-Formed High Strength Steel", hpMultiplier: 1.0, weightMultiplier: 1.25, costMultiplier: 0.6, reliabilityDelta: 0 },
  { id: "forged", label: "Extruded Hydroformed 6061 Aluminum", hpMultiplier: 1.0, weightMultiplier: 0.85, costMultiplier: 1.8, reliabilityDelta: 10 },
  { id: "billet", label: "T1000G Pre-Preg Carbon Monocoque", hpMultiplier: 1.0, weightMultiplier: 0.55, costMultiplier: 3.8, reliabilityDelta: 20 },
  { id: "titanium", label: "Aerospace Titanium Ti-6Al-4V Tub", hpMultiplier: 1.0, weightMultiplier: 0.45, costMultiplier: 5.5, reliabilityDelta: 25 },
];

const BODY_PANEL_VARIANTS: ComponentVariant[] = [
  { id: "cast", label: "Stamped Galvanized Sheet Steel (0.75mm)", hpMultiplier: 1.0, weightMultiplier: 1.30, costMultiplier: 0.5, reliabilityDelta: 0 },
  { id: "forged", label: "Superformed 6016-T4 Aluminum Sheet", hpMultiplier: 1.0, weightMultiplier: 0.80, costMultiplier: 1.9, reliabilityDelta: 8 },
  { id: "billet", label: "2x2 Twill Autoclaved Carbon Fiber", hpMultiplier: 1.0, weightMultiplier: 0.45, costMultiplier: 4.2, reliabilityDelta: 18 },
  { id: "titanium", label: "Forged Composite Carbon / Kevlar Weave", hpMultiplier: 1.0, weightMultiplier: 0.40, costMultiplier: 5.0, reliabilityDelta: 22 },
];

const AERO_PACKAGE_VARIANTS: ComponentVariant[] = [
  { id: "cast", label: "Injection-Molded ABS Plastic", hpMultiplier: 1.0, weightMultiplier: 1.15, costMultiplier: 0.5, reliabilityDelta: 0 },
  { id: "forged", label: "SMC Compression Glass Composite", hpMultiplier: 1.0, weightMultiplier: 0.90, costMultiplier: 1.5, reliabilityDelta: 5 },
  { id: "billet", label: "Dry Carbon Pre-Preg Vacuum Bagged", hpMultiplier: 1.0, weightMultiplier: 0.50, costMultiplier: 3.5, reliabilityDelta: 15 },
  { id: "titanium", label: "Active DRS Titanium / Pre-Preg Honeycomb", hpMultiplier: 1.0, weightMultiplier: 0.42, costMultiplier: 5.2, reliabilityDelta: 20 },
];

const GLASS_VARIANTS: ComponentVariant[] = [
  { id: "cast", label: "Standard Tempered Float Glass (4.0mm)", hpMultiplier: 1.0, weightMultiplier: 1.10, costMultiplier: 0.5, reliabilityDelta: 0 },
  { id: "forged", label: "Acoustic Dual-Laminated PVB Glass", hpMultiplier: 1.0, weightMultiplier: 1.00, costMultiplier: 1.4, reliabilityDelta: 10 },
  { id: "billet", label: "Gorilla Glass Thin Film (2.1mm)", hpMultiplier: 1.0, weightMultiplier: 0.70, costMultiplier: 3.0, reliabilityDelta: 15 },
  { id: "titanium", label: "FIA Lexan Polycarbonate Hard-Coat", hpMultiplier: 1.0, weightMultiplier: 0.50, costMultiplier: 4.0, reliabilityDelta: 12 },
];

// ===================================================================
// MASTER EXTERIOR ASSEMBLY COMPONENT REGISTRY (40+ SUBSYSTEMS)
// ===================================================================

export const EXTERIOR_ASSEMBLY_REGISTRY: ExteriorAssemblyComponentMeta[] = [
  // ── 1. Structure & Chassis ──
  {
    id: "chassis_frame",
    name: "Master Monocoque Tub & Chassis Spine",
    category: "Structure & Chassis",
    subcategory: "Chassis Foundation",
    description: "The primary torsional backbone transferring vehicle suspension loads and housing passenger safety cell.",
    dependencies: [],
    explodedOffset: { x: 0, y: -120, z: 0 },
    slotPosition: { x: 480, y: 320, z: 0 },
    estimatedDuration: 1800,
    soundType: "heavy",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 320, rigidity: 38.5, dragCd: 0.0, downforceKg: 0, cost: 12500 },
    tooltipAdvice: "A rigid chassis frame ensures predictable suspension geometry under extreme cornering g-forces.",
    fastenerSpec: { fastenerName: "Subframe ARP 12-Point High-Tensile Bolts", nominalTorqueNm: 135, angleSpecificationDeg: 90, fastenerCount: 16, fastenerGrade: "Grade 12.9", threadLockCompound: "blue_medium" },
    clearanceSpec: { inspectionZone: "Chassis Datum Alignment Pins", nominalMm: 0.05, minMm: 0.01, maxMm: 0.12, measurementTool: "optical_laser_gap_gun" },
    paintZone: "metal_chassis",
  },
  {
    id: "front_subframe",
    name: "Front Structural Subframe & Crash Can",
    category: "Structure & Chassis",
    subcategory: "Subframe Rails",
    description: "Extruded cradle carrying front suspension control arms, steering rack, and front impact crumple zone.",
    dependencies: ["chassis_frame"],
    explodedOffset: { x: -160, y: -40, z: 0 },
    slotPosition: { x: 260, y: 340, z: 0 },
    estimatedDuration: 1400,
    soundType: "metallic",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 42, rigidity: 8.2, dragCd: 0.0, downforceKg: 0, cost: 3200 },
    tooltipAdvice: "Hydroformed aluminum subframes reduce front axle polar moment of inertia for razor-sharp turn-in.",
    fastenerSpec: { fastenerName: "Subframe-to-Monocoque Shear Bolts", nominalTorqueNm: 110, angleSpecificationDeg: 60, fastenerCount: 8, fastenerGrade: "Grade 10.9" },
    clearanceSpec: { inspectionZone: "Steering Rack Bushing Bore", nominalMm: 0.03, minMm: 0.01, maxMm: 0.05, measurementTool: "dial_indicator" },
    paintZone: "metal_chassis",
  },
  {
    id: "rear_subframe",
    name: "Rear Subframe & Differential Cradle",
    category: "Structure & Chassis",
    subcategory: "Subframe Rails",
    description: "High-rigidity cradle supporting rear multilink suspension pickup points and transmission/differential mounts.",
    dependencies: ["chassis_frame"],
    explodedOffset: { x: 160, y: -40, z: 0 },
    slotPosition: { x: 700, y: 340, z: 0 },
    estimatedDuration: 1400,
    soundType: "metallic",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 48, rigidity: 9.4, dragCd: 0.0, downforceKg: 0, cost: 3600 },
    tooltipAdvice: "Solid-mounted rear subframes eliminate bushing deflection for instantaneous rear tire throttle response.",
    fastenerSpec: { fastenerName: "Differential Cradle Torx-Plus Fasteners", nominalTorqueNm: 120, angleSpecificationDeg: 60, fastenerCount: 8, fastenerGrade: "Grade 12.9" },
    clearanceSpec: { inspectionZone: "Lateral Link Pivot Alignment", nominalMm: 0.04, minMm: 0.01, maxMm: 0.08, measurementTool: "dial_indicator" },
    paintZone: "metal_chassis",
  },
  {
    id: "floor_pan",
    name: "Underbody Floor Pan & Tunnel Backbone",
    category: "Structure & Chassis",
    subcategory: "Floor Structure",
    description: "Aerodynamically smooth floor stamping providing floor rigidity, seat mounting, and exhaust heat shield channel.",
    dependencies: ["chassis_frame"],
    explodedOffset: { x: 0, y: 80, z: 0 },
    slotPosition: { x: 480, y: 390, z: 0 },
    estimatedDuration: 1200,
    soundType: "weld_spark",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 35, rigidity: 6.5, dragCd: -0.012, downforceKg: 15, cost: 2400 },
    tooltipAdvice: "A flat structural floor creates smooth underbody airflow directly feeding the rear diffuser.",
    fastenerSpec: { fastenerName: "Structural Adhesive + Rivets", nominalTorqueNm: 25, angleSpecificationDeg: 0, fastenerCount: 48, fastenerGrade: "Structural Blind Rivets" },
    paintZone: "metal_chassis",
  },
  {
    id: "firewall_bulkhead",
    name: "Front Firewall & Cowl Bulkhead",
    category: "Structure & Chassis",
    subcategory: "Cabin Enclosure",
    description: "Reinforced thermal and acoustic barrier isolating the cockpit from engine bay heat and vibrations.",
    dependencies: ["chassis_frame"],
    explodedOffset: { x: -80, y: -60, z: 0 },
    slotPosition: { x: 380, y: 270, z: 0 },
    estimatedDuration: 1100,
    soundType: "weld_spark",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 18, rigidity: 4.5, dragCd: 0.0, downforceKg: 0, cost: 1800 },
    tooltipAdvice: "Continuous laser-welded firewalls provide superior torsional stiffness across the front strut towers.",
    paintZone: "metal_chassis",
  },
  {
    id: "a_pillar_assembly",
    name: "A-Pillars & Windshield Header Frame",
    category: "Structure & Chassis",
    subcategory: "Greenhouse Structure",
    description: "Ultra-high-strength boron steel pillars protecting passenger survival space during roof crush events.",
    dependencies: ["chassis_frame", "firewall_bulkhead"],
    explodedOffset: { x: -60, y: -100, z: 0 },
    slotPosition: { x: 410, y: 210, z: 0 },
    estimatedDuration: 1300,
    soundType: "weld_spark",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 24, rigidity: 7.8, dragCd: 0.0, downforceKg: 0, cost: 2900 },
    tooltipAdvice: "Slim, high-tensile A-pillars improve driver forward visibility without sacrificing roof strength.",
    clearanceSpec: { inspectionZone: "Windshield Glass Bonding Flange", nominalMm: 2.0, minMm: 1.5, maxMm: 2.5, measurementTool: "feeler_gauge" },
    paintZone: "body",
  },
  {
    id: "b_pillar_assembly",
    name: "B-Pillars & Side Impact Door Ring",
    category: "Structure & Chassis",
    subcategory: "Greenhouse Structure",
    description: "Hot-stamped boron steel center pillars carrying door hinges, seatbelt anchors, and side crash protection.",
    dependencies: ["chassis_frame", "floor_pan"],
    explodedOffset: { x: 0, y: -100, z: 0 },
    slotPosition: { x: 500, y: 220, z: 0 },
    estimatedDuration: 1300,
    soundType: "weld_spark",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 28, rigidity: 8.5, dragCd: 0.0, downforceKg: 0, cost: 3100 },
    tooltipAdvice: "Taylor-welded blanks in the B-pillar yield controlled deformation during severe T-bone collisions.",
    paintZone: "body",
  },
  {
    id: "c_pillar_assembly",
    name: "C-Pillars & Rear Quarter Structure",
    category: "Structure & Chassis",
    subcategory: "Greenhouse Structure",
    description: "Rear roof pillars tying the roof frame into the rear suspension towers and rear decklid aperture.",
    dependencies: ["chassis_frame", "rear_subframe"],
    explodedOffset: { x: 80, y: -100, z: 0 },
    slotPosition: { x: 620, y: 220, z: 0 },
    estimatedDuration: 1300,
    soundType: "weld_spark",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 26, rigidity: 7.2, dragCd: 0.0, downforceKg: 0, cost: 2800 },
    tooltipAdvice: "Stiff C-pillar arches prevent chassis twisting between front and rear suspension axles.",
    paintZone: "body",
  },
  {
    id: "rocker_panels",
    name: "Reinforced Structural Rocker Sill Rails",
    category: "Structure & Chassis",
    subcategory: "Sill Structure",
    description: "Multi-chamber extruded aluminum or steel box sections running along the lower door sill for side impact defense.",
    dependencies: ["chassis_frame", "floor_pan"],
    explodedOffset: { x: 0, y: 60, z: 0 },
    slotPosition: { x: 490, y: 370, z: 0 },
    estimatedDuration: 1100,
    soundType: "metallic",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 22, rigidity: 5.6, dragCd: 0.0, downforceKg: 0, cost: 2200 },
    tooltipAdvice: "Wide rocker panels act as structural shear webs between the front and rear wheel arches.",
    paintZone: "body",
  },
  {
    id: "crash_boxes_front_rear",
    name: "Front & Rear Aluminum Crash Absorber Cans",
    category: "Structure & Chassis",
    subcategory: "Impact Absorbers",
    description: "Sacrificial extruded crumple cans with programmed buckle initiators absorbing low and medium speed collisions.",
    dependencies: ["front_subframe", "rear_subframe"],
    explodedOffset: { x: -200, y: 0, z: 0 },
    slotPosition: { x: 210, y: 340, z: 0 },
    estimatedDuration: 900,
    soundType: "metallic",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 14, rigidity: 1.5, dragCd: 0.0, downforceKg: 0, cost: 1400 },
    tooltipAdvice: "Bolt-on crash cans allow quick track repairs without cutting or welding the main chassis tub.",
    fastenerSpec: { fastenerName: "M10 Crash Can Flange Bolts", nominalTorqueNm: 65, angleSpecificationDeg: 0, fastenerCount: 8, fastenerGrade: "Grade 8.8" },
    paintZone: "metal_chassis",
  },
  {
    id: "roll_cage_safety",
    name: "FIA Homologated Chromoly Roll Cage",
    category: "Structure & Chassis",
    subcategory: "Motorsport Safety",
    description: "Seamless 25CrMo4 alloy tube cage integrating gussets, X-braced main hoop, and door crossbars.",
    dependencies: ["a_pillar_assembly", "b_pillar_assembly", "c_pillar_assembly"],
    explodedOffset: { x: 0, y: -140, z: 0 },
    slotPosition: { x: 500, y: 220, z: 0 },
    estimatedDuration: 1600,
    soundType: "weld_spark",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 38, rigidity: 14.5, dragCd: 0.0, downforceKg: 0, cost: 4800 },
    tooltipAdvice: "A full roll cage increases overall vehicle torsional stiffness by up to 45%.",
    fastenerSpec: { fastenerName: "TIG Welded 25CrMo4 Tube Nodes", nominalTorqueNm: 0, angleSpecificationDeg: 0, fastenerCount: 24, fastenerGrade: "FIA Spec 25CrMo4" },
    paintZone: "contrast_roof",
  },

  // ── 2. Suspension & Running Gear ──
  {
    id: "suspension_front_assembly",
    name: "Front Double Wishbone & Coilover Assembly",
    category: "Suspension & Running Gear",
    subcategory: "Front Axle",
    description: "Forged aluminum control arms, spherical bearings, titanium coilovers, and adjustable anti-roll bar.",
    dependencies: ["front_subframe"],
    explodedOffset: { x: -140, y: 60, z: 0 },
    slotPosition: { x: 260, y: 350, z: 0 },
    estimatedDuration: 1500,
    soundType: "pneumatic",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 38, rigidity: 2.0, dragCd: 0.0, downforceKg: 0, cost: 4500 },
    tooltipAdvice: "Double wishbone geometry maintains 100% tire contact patch flatness under heavy cornering roll.",
    fastenerSpec: { fastenerName: "Upper & Lower Ball Joint Castle Nuts", nominalTorqueNm: 115, angleSpecificationDeg: 0, fastenerCount: 4, fastenerGrade: "Grade 10.9" },
    clearanceSpec: { inspectionZone: "Front Toe Alignment Clearance", nominalMm: 0.5, minMm: 0.0, maxMm: 1.0, measurementTool: "optical_laser_gap_gun" },
    paintZone: "metal_chassis",
  },
  {
    id: "suspension_rear_assembly",
    name: "Rear 5-Link Multilink & Pushrod Assembly",
    category: "Suspension & Running Gear",
    subcategory: "Rear Axle",
    description: "Independent multi-link geometry with active damper canisters and rear anti-squat geometry.",
    dependencies: ["rear_subframe"],
    explodedOffset: { x: 140, y: 60, z: 0 },
    slotPosition: { x: 700, y: 350, z: 0 },
    estimatedDuration: 1500,
    soundType: "pneumatic",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 42, rigidity: 2.2, dragCd: 0.0, downforceKg: 0, cost: 4900 },
    tooltipAdvice: "Multilink rear suspension enables precise toe-in under braking and throttle acceleration.",
    fastenerSpec: { fastenerName: "Rear Subframe Lateral Camber Bolts", nominalTorqueNm: 125, angleSpecificationDeg: 0, fastenerCount: 6, fastenerGrade: "Grade 12.9" },
    clearanceSpec: { inspectionZone: "Rear Camber Eccentric Bolt Adjustment", nominalMm: 2.0, minMm: 0.5, maxMm: 3.5, measurementTool: "optical_laser_gap_gun" },
    paintZone: "metal_chassis",
  },
  {
    id: "brake_rotors_calipers",
    name: "Carbon-Ceramic Rotors & Monobloc Calipers",
    category: "Suspension & Running Gear",
    subcategory: "Braking System",
    description: "410mm carbon-ceramic matrix vented rotors clamped by 8-piston front and 4-piston rear monobloc calipers.",
    dependencies: ["suspension_front_assembly", "suspension_rear_assembly"],
    explodedOffset: { x: 0, y: -80, z: 0 },
    slotPosition: { x: 480, y: 350, z: 0 },
    estimatedDuration: 1300,
    soundType: "click",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 28, rigidity: 0.0, dragCd: 0.0, downforceKg: 0, cost: 6800 },
    tooltipAdvice: "Carbon-ceramic brakes save 20kg of rotating unsprung mass and withstand track temps up to 1000°C.",
    fastenerSpec: { fastenerName: "Caliper Radial Mount Bolts", nominalTorqueNm: 135, angleSpecificationDeg: 0, fastenerCount: 8, fastenerGrade: "Titanium Spec-R" },
    clearanceSpec: { inspectionZone: "Rotor Disc Lateral Runout", nominalMm: 0.04, minMm: 0.01, maxMm: 0.08, measurementTool: "dial_indicator" },
    paintZone: "wheel",
  },
  {
    id: "wheels_tires_assembly",
    name: "Forged Monoblock Wheels & Track Tires",
    category: "Suspension & Running Gear",
    subcategory: "Wheels & Tires",
    description: "Lightweight 20/21 inch centerlock forged wheels shod in ultra-high performance semi-slick track tires.",
    dependencies: ["brake_rotors_calipers"],
    explodedOffset: { x: 0, y: 100, z: 0 },
    slotPosition: { x: 480, y: 350, z: 0 },
    estimatedDuration: 1200,
    soundType: "pneumatic",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 76, rigidity: 0.0, dragCd: 0.008, downforceKg: 0, cost: 5500 },
    tooltipAdvice: "Centerlock motorsport wheels allow rapid single-nut wheel swaps during endurance pit stops.",
    fastenerSpec: { fastenerName: "Centerlock Anodized Wheel Nut", nominalTorqueNm: 550, angleSpecificationDeg: 0, fastenerCount: 4, fastenerGrade: "Aerospace 7075-T6" },
    clearanceSpec: { inspectionZone: "Fender Well Tire Radial Clearance", nominalMm: 18.0, minMm: 12.0, maxMm: 28.0, measurementTool: "feeler_gauge" },
    paintZone: "wheel",
  },

  // ── 3. Primary Body Closures & Panels ──
  {
    id: "hood_panel",
    name: "Aero-Sculpted Lightweight Hood Panel",
    category: "Body Closures & Shell",
    subcategory: "Front Closures",
    description: "Double-skinned hood with dual extraction louvers and gas strut hinges clearing front radiators.",
    dependencies: ["a_pillar_assembly", "front_subframe"],
    explodedOffset: { x: -120, y: -100, z: 0 },
    slotPosition: { x: 310, y: 260, z: 0 },
    estimatedDuration: 1400,
    soundType: "slide",
    variants: BODY_PANEL_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 14, rigidity: 1.2, dragCd: -0.008, downforceKg: 18, cost: 3800 },
    tooltipAdvice: "Hood extraction vents channel hot radiator air over the roof rather than trapping it under the chassis.",
    fastenerSpec: { fastenerName: "Hood Hinge Countersunk Fasteners", nominalTorqueNm: 35, angleSpecificationDeg: 0, fastenerCount: 6, fastenerGrade: "Grade 8.8" },
    clearanceSpec: { inspectionZone: "Hood-to-Fender Shut Line Gap", nominalMm: 3.5, minMm: 3.0, maxMm: 4.0, measurementTool: "optical_laser_gap_gun" },
    paintZone: "body",
  },
  {
    id: "front_fenders",
    name: "Front Wheel Arch Fenders with Aero Louvers",
    category: "Body Closures & Shell",
    subcategory: "Front Closures",
    description: "Sculpted front fenders featuring top wheel arch pressure-relief gills and integrated side marker cutouts.",
    dependencies: ["a_pillar_assembly", "front_subframe"],
    explodedOffset: { x: -140, y: -40, z: 0 },
    slotPosition: { x: 280, y: 280, z: 0 },
    estimatedDuration: 1300,
    soundType: "metallic",
    variants: BODY_PANEL_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 16, rigidity: 1.0, dragCd: -0.005, downforceKg: 12, cost: 3200 },
    tooltipAdvice: "Fender arch louvers evacuate high-pressure trapped air in the wheel well, reducing front aerodynamic lift.",
    clearanceSpec: { inspectionZone: "Fender-to-Door Flushness", nominalMm: 0.0, minMm: -0.3, maxMm: 0.3, measurementTool: "optical_laser_gap_gun" },
    paintZone: "body",
  },
  {
    id: "doors_assembly",
    name: "Bespoke Butterfly Dihedral Door Assemblies",
    category: "Body Closures & Shell",
    subcategory: "Side Closures",
    description: "Carbon composite doors with side impact anti-intrusion beams, frameless glass guide rails, and flush handles.",
    dependencies: ["a_pillar_assembly", "b_pillar_assembly", "rocker_panels"],
    explodedOffset: { x: 0, y: -120, z: 0 },
    slotPosition: { x: 480, y: 280, z: 0 },
    estimatedDuration: 1600,
    soundType: "slide",
    variants: BODY_PANEL_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 36, rigidity: 3.5, dragCd: -0.003, downforceKg: 0, cost: 5800 },
    tooltipAdvice: "Butterfly doors rotate upward and forward, providing easy ingress in tight paddock parking spaces.",
    fastenerSpec: { fastenerName: "Dihedral Hinge High-Torque Pivot Studs", nominalTorqueNm: 85, angleSpecificationDeg: 45, fastenerCount: 8, fastenerGrade: "Titanium Spec-R" },
    clearanceSpec: { inspectionZone: "Door Hem Flange to Rocker Gap", nominalMm: 3.2, minMm: 2.8, maxMm: 3.6, measurementTool: "optical_laser_gap_gun" },
    paintZone: "body",
  },
  {
    id: "rear_quarter_panels",
    name: "Widebody Rear Quarter Panels & Intake Scoops",
    category: "Body Closures & Shell",
    subcategory: "Rear Closures",
    description: "Muscular rear quarter panels with integrated engine cooling side pods and fuel filler housing.",
    dependencies: ["c_pillar_assembly", "rear_subframe", "rocker_panels"],
    explodedOffset: { x: 140, y: -40, z: 0 },
    slotPosition: { x: 680, y: 280, z: 0 },
    estimatedDuration: 1400,
    soundType: "metallic",
    variants: BODY_PANEL_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 24, rigidity: 2.8, dragCd: 0.002, downforceKg: 8, cost: 4200 },
    tooltipAdvice: "Integrated side scoops direct ambient airflow directly into intercoolers and engine air intake trumpets.",
    clearanceSpec: { inspectionZone: "Quarter-to-Trunk Shut Line", nominalMm: 3.8, minMm: 3.2, maxMm: 4.4, measurementTool: "optical_laser_gap_gun" },
    paintZone: "body",
  },
  {
    id: "trunk_decklid",
    name: "Rear Decklid & Engine Bay Glass Cover",
    category: "Body Closures & Shell",
    subcategory: "Rear Closures",
    description: "Aerodynamic rear decklid with integrated heat extraction slots and hydraulic hatch lift supports.",
    dependencies: ["c_pillar_assembly", "rear_quarter_panels"],
    explodedOffset: { x: 120, y: -100, z: 0 },
    slotPosition: { x: 650, y: 240, z: 0 },
    estimatedDuration: 1300,
    soundType: "slide",
    variants: BODY_PANEL_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 15, rigidity: 1.4, dragCd: -0.006, downforceKg: 10, cost: 3600 },
    tooltipAdvice: "Louvered decklids evacuate under-hood heat efficiently at high speeds using the Bernoulli principle.",
    clearanceSpec: { inspectionZone: "Decklid-to-Bumper Flushness", nominalMm: -0.5, minMm: -0.8, maxMm: -0.2, measurementTool: "optical_laser_gap_gun" },
    paintZone: "body",
  },
  {
    id: "roof_panel",
    name: "Double-Bubble Lightweight Carbon Roof",
    category: "Body Closures & Shell",
    subcategory: "Roof Structure",
    description: "Curved double-bubble carbon roof panel lowering overall vehicle center of gravity (CG).",
    dependencies: ["a_pillar_assembly", "b_pillar_assembly", "c_pillar_assembly"],
    explodedOffset: { x: 0, y: -160, z: 0 },
    slotPosition: { x: 500, y: 170, z: 0 },
    estimatedDuration: 1200,
    soundType: "slide",
    variants: BODY_PANEL_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 9, rigidity: 4.8, dragCd: -0.004, downforceKg: 5, cost: 4500 },
    tooltipAdvice: "Replacing steel roofs with carbon fiber drops up to 15kg from the vehicle's highest point, lowering CG height.",
    fastenerSpec: { fastenerName: "Structural Epoxy Adhesive + Primer", nominalTorqueNm: 0, angleSpecificationDeg: 0, fastenerCount: 1, fastenerGrade: "Two-Part Polyurethane" },
    paintZone: "contrast_roof",
  },

  // ── 4. Fascias, Bumpers & Aerodynamics ──
  {
    id: "front_bumper_fascia",
    name: "Front Bumper Fascia & Intake Grille Ports",
    category: "Aerodynamics & Bumpers",
    subcategory: "Front Fascia",
    description: "Aerodynamic front fascia housing radiator intake apertures, brake cooling channels, and parking sensors.",
    dependencies: ["front_fenders", "hood_panel", "crash_boxes_front_rear"],
    explodedOffset: { x: -180, y: 0, z: 0 },
    slotPosition: { x: 200, y: 310, z: 0 },
    estimatedDuration: 1300,
    soundType: "click",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 12, rigidity: 0.5, dragCd: -0.010, downforceKg: 15, cost: 2800 },
    tooltipAdvice: "Radiator duct inlet-to-outlet area ratios dictate front engine cooling without generating excessive drag.",
    clearanceSpec: { inspectionZone: "Bumper-to-Headlight Surround Gap", nominalMm: 2.5, minMm: 2.0, maxMm: 3.0, measurementTool: "optical_laser_gap_gun" },
    paintZone: "body",
  },
  {
    id: "rear_bumper_fascia",
    name: "Rear Bumper Fascia & Aerodynamic Extraction Mesh",
    category: "Aerodynamics & Bumpers",
    subcategory: "Rear Fascia",
    description: "Sculpted rear bumper with integrated exhaust exits, reverse camera, and diffuser tunnel mounting flange.",
    dependencies: ["rear_quarter_panels", "trunk_decklid", "crash_boxes_front_rear"],
    explodedOffset: { x: 180, y: 0, z: 0 },
    slotPosition: { x: 760, y: 310, z: 0 },
    estimatedDuration: 1300,
    soundType: "click",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 13, rigidity: 0.5, dragCd: -0.008, downforceKg: 12, cost: 2900 },
    tooltipAdvice: "Rear fascia mesh cutouts bleed hot wheel-well air and reduce aerodynamic turbulence behind the car.",
    paintZone: "body",
  },
  {
    id: "front_splitter_tray",
    name: "Carbon Fiber Front Splitter & Endplates",
    category: "Aerodynamics & Bumpers",
    subcategory: "Front Aero",
    description: "Extended carbon splitter tray with stepped endplates creating high front downforce via stagnation pressure.",
    dependencies: ["front_bumper_fascia", "front_subframe"],
    explodedOffset: { x: -200, y: 40, z: 0 },
    slotPosition: { x: 180, y: 360, z: 0 },
    estimatedDuration: 1100,
    soundType: "metallic",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 6, rigidity: 0.8, dragCd: 0.012, downforceKg: 65, cost: 3500 },
    tooltipAdvice: "Splitters create a high-pressure zone on top and low pressure underneath, gluing the front axle to the track.",
    fastenerSpec: { fastenerName: "Chassis-Mounted Tie Rods & Bolts", nominalTorqueNm: 45, angleSpecificationDeg: 0, fastenerCount: 12, fastenerGrade: "Grade 8.8" },
    paintZone: "aero_unpainted_carbon",
  },
  {
    id: "rear_diffuser_tunnel",
    name: "Multi-Channel Venturi Rear Diffuser",
    category: "Aerodynamics & Bumpers",
    subcategory: "Rear Aero",
    description: "7-fin carbon fiber diffuser expanding underbody airflow to generate pure downforce with minimal drag penalty.",
    dependencies: ["rear_bumper_fascia", "floor_pan", "rear_subframe"],
    explodedOffset: { x: 200, y: 60, z: 0 },
    slotPosition: { x: 770, y: 370, z: 0 },
    estimatedDuration: 1200,
    soundType: "metallic",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 8, rigidity: 1.0, dragCd: -0.018, downforceKg: 95, cost: 4200 },
    tooltipAdvice: "Diffusers accelerate air under the car to create suction (ground effect) without creating dirty wake turbulence.",
    paintZone: "aero_unpainted_carbon",
  },
  {
    id: "side_skirts_aero",
    name: "Aerodynamic Side Skirts & Ground Effect Blades",
    category: "Aerodynamics & Bumpers",
    subcategory: "Side Aero",
    description: "Full-length carbon side skirts preventing ambient air from leaking underneath the low-pressure underbody floor.",
    dependencies: ["rocker_panels", "front_fenders", "rear_quarter_panels"],
    explodedOffset: { x: 0, y: 80, z: 0 },
    slotPosition: { x: 480, y: 380, z: 0 },
    estimatedDuration: 1000,
    soundType: "metallic",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 7, rigidity: 0.6, dragCd: -0.005, downforceKg: 30, cost: 2600 },
    tooltipAdvice: "Side skirts act as aerodynamic curtains, preserving the high vacuum generated by the Venturi floor.",
    paintZone: "aero_unpainted_carbon",
  },
  {
    id: "rear_wing_spoiler",
    name: "Active Hydraulic Swan-Neck Rear Wing",
    category: "Aerodynamics & Bumpers",
    subcategory: "Rear Aero",
    description: "Top-mounted swan-neck dual-element carbon wing with DRS actuator and 82° airbrake capability.",
    dependencies: ["rear_quarter_panels", "trunk_decklid"],
    explodedOffset: { x: 160, y: -160, z: 0 },
    slotPosition: { x: 720, y: 150, z: 0 },
    estimatedDuration: 1500,
    soundType: "pneumatic",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 14, rigidity: 1.8, dragCd: 0.035, downforceKg: 240, cost: 7500 },
    tooltipAdvice: "Swan-neck pylons attach to the upper wing surface, keeping the critical suction underside 100% clean of flow separation.",
    fastenerSpec: { fastenerName: "Chassis-Tied Pylon Mount Studs", nominalTorqueNm: 75, angleSpecificationDeg: 30, fastenerCount: 6, fastenerGrade: "Titanium Grade 5" },
    paintZone: "aero_unpainted_carbon",
  },
  {
    id: "canards_dive_planes",
    name: "Front Bumper Canards & Dive Planes",
    category: "Aerodynamics & Bumpers",
    subcategory: "Front Aero",
    description: "Dual carbon dive planes mounted on bumper corners shedding vortices that seal front wheel-well turbulence.",
    dependencies: ["front_bumper_fascia"],
    explodedOffset: { x: -190, y: -40, z: 0 },
    slotPosition: { x: 210, y: 290, z: 0 },
    estimatedDuration: 800,
    soundType: "click",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 2, rigidity: 0.0, dragCd: 0.006, downforceKg: 25, cost: 1200 },
    tooltipAdvice: "Canards fine-tune high-speed aerodynamic balance, eliminating front-end understeer at 250+ km/h.",
    paintZone: "aero_unpainted_carbon",
  },
  {
    id: "hood_fender_vents",
    name: "NACA Ducts & Fender Pressure-Relief Louvers",
    category: "Aerodynamics & Bumpers",
    subcategory: "Air Extraction",
    description: "Flush NACA ducts and louvers for targeted brake cooling and aerodynamic boundary-layer air management.",
    dependencies: ["hood_panel", "front_fenders"],
    explodedOffset: { x: -100, y: -80, z: 0 },
    slotPosition: { x: 300, y: 250, z: 0 },
    estimatedDuration: 700,
    soundType: "click",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 1, rigidity: 0.0, dragCd: -0.002, downforceKg: 10, cost: 950 },
    tooltipAdvice: "NACA ducts draw air into internal cooling channels with almost zero disturbance to laminar boundary flow.",
    paintZone: "aero_unpainted_carbon",
  },

  // ── 5. Glazing & Optical Lighting ──
  {
    id: "windshield_glass",
    name: "Curved Acoustic Laminated Windshield",
    category: "Glazing & Lighting",
    subcategory: "Glazing",
    description: "Acoustic PVB laminated windshield with hydrophobic coating, rain sensor, and ADAS camera mount.",
    dependencies: ["a_pillar_assembly", "roof_panel", "firewall_bulkhead"],
    explodedOffset: { x: -40, y: -120, z: 0 },
    slotPosition: { x: 380, y: 220, z: 0 },
    estimatedDuration: 1100,
    soundType: "slide",
    variants: GLASS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 13, rigidity: 2.5, dragCd: -0.006, downforceKg: 0, cost: 1800 },
    tooltipAdvice: "Bonded windshield glass contributes up to 30% of total roof crush structural strength.",
    clearanceSpec: { inspectionZone: "Windshield-to-Roof Flushness", nominalMm: 0.0, minMm: -0.2, maxMm: 0.2, measurementTool: "feeler_gauge" },
    paintZone: "glass",
  },
  {
    id: "side_door_glass",
    name: "Frameless Side Door Windows & Quarter Glass",
    category: "Glazing & Lighting",
    subcategory: "Glazing",
    description: "Tempered acoustic side windows with high-speed indexing drop seal and infrared solar reflection tint.",
    dependencies: ["doors_assembly", "rear_quarter_panels"],
    explodedOffset: { x: 0, y: -100, z: 0 },
    slotPosition: { x: 500, y: 230, z: 0 },
    estimatedDuration: 1000,
    soundType: "slide",
    variants: GLASS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 8, rigidity: 0.0, dragCd: -0.002, downforceKg: 0, cost: 1400 },
    tooltipAdvice: "Indexing frameless windows tuck tightly into rubber seals upon door closing to eliminate wind rush noise.",
    paintZone: "glass",
  },
  {
    id: "rear_window_backlite",
    name: "Heated Rear Window & Engine Viewport Glass",
    category: "Glazing & Lighting",
    subcategory: "Glazing",
    description: "Lightweight Gorilla Glass rear backlite with micro-tungsten defrost grid lines and engine viewing viewport.",
    dependencies: ["c_pillar_assembly", "roof_panel", "trunk_decklid"],
    explodedOffset: { x: 60, y: -120, z: 0 },
    slotPosition: { x: 600, y: 220, z: 0 },
    estimatedDuration: 1000,
    soundType: "slide",
    variants: GLASS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 9, rigidity: 1.8, dragCd: -0.004, downforceKg: 0, cost: 1600 },
    tooltipAdvice: "Thin Gorilla Glass saves 5kg compared to traditional tempered glass while resisting vibration cracking.",
    paintZone: "glass",
  },
  {
    id: "headlights_matrix",
    name: "84-Pixel Matrix LED Headlight Units",
    category: "Glazing & Lighting",
    subcategory: "Lighting",
    description: "Adaptive matrix LED projectors with crystal DRL signatures, auto-leveling, and cornering beams.",
    dependencies: ["front_fenders", "front_bumper_fascia"],
    explodedOffset: { x: -160, y: -60, z: 0 },
    slotPosition: { x: 230, y: 270, z: 0 },
    estimatedDuration: 900,
    soundType: "click",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 6, rigidity: 0.0, dragCd: -0.002, downforceKg: 0, cost: 3200 },
    tooltipAdvice: "Matrix LEDs dynamically mask out oncoming vehicles while keeping high beams illuminated everywhere else.",
    clearanceSpec: { inspectionZone: "Headlight-to-Fender Flushness", nominalMm: 0.0, minMm: -0.3, maxMm: 0.3, measurementTool: "optical_laser_gap_gun" },
    paintZone: "lighting",
  },
  {
    id: "taillights_oled",
    name: "3D Faceted OLED Animated Taillight Strip",
    category: "Glazing & Lighting",
    subcategory: "Lighting",
    description: "Full-width 3D OLED lighting surface with sequential chasing indicators and aerodynamic blade edges.",
    dependencies: ["rear_quarter_panels", "rear_bumper_fascia"],
    explodedOffset: { x: 160, y: -60, z: 0 },
    slotPosition: { x: 740, y: 270, z: 0 },
    estimatedDuration: 900,
    soundType: "click",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 5, rigidity: 0.0, dragCd: -0.002, downforceKg: 0, cost: 2800 },
    tooltipAdvice: "Sharp-edged taillight lenses force clean airflow separation at the rear, reducing vehicle wake drag.",
    paintZone: "lighting",
  },
  {
    id: "fog_drl_lights",
    name: "Lower Bumper Fog & DRL Light Projectors",
    category: "Glazing & Lighting",
    subcategory: "Lighting",
    description: "High-intensity LED fog lights integrated into front lower intake bezels with wide-angle spread.",
    dependencies: ["front_bumper_fascia"],
    explodedOffset: { x: -170, y: 20, z: 0 },
    slotPosition: { x: 220, y: 340, z: 0 },
    estimatedDuration: 700,
    soundType: "click",
    variants: STRUCTURAL_CHASSIS_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 2, rigidity: 0.0, dragCd: 0.0, downforceKg: 0, cost: 1100 },
    tooltipAdvice: "Low-mounted fog projectors illuminate the track surface beneath rain spray and track fog.",
    paintZone: "lighting",
  },

  // ── 6. Exterior Trim, Mirrors & Details ──
  {
    id: "side_mirrors",
    name: "Aerodynamic Stalk Side Mirrors with Turn LEDs",
    category: "Trim & Final Assembly",
    subcategory: "Mirrors & Sensors",
    description: "Sculpted carbon mirror housings on aerodynamic stalks with wide-angle glass and blind-spot radar.",
    dependencies: ["doors_assembly", "a_pillar_assembly"],
    explodedOffset: { x: -40, y: -80, z: 0 },
    slotPosition: { x: 420, y: 240, z: 0 },
    estimatedDuration: 800,
    soundType: "click",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 3, rigidity: 0.0, dragCd: 0.008, downforceKg: 0, cost: 1400 },
    tooltipAdvice: "Tapered mirror stalks reduce mirror wake turbulence entering the side radiator intakes.",
    paintZone: "aero_unpainted_carbon",
  },
  {
    id: "front_grille_mesh",
    name: "Titanium Honeycomb Radiator Grille Mesh",
    category: "Trim & Final Assembly",
    subcategory: "Fascia Trim",
    description: "High-flow laser-cut honeycomb mesh protecting heat exchangers from road debris while minimizing airflow resistance.",
    dependencies: ["front_bumper_fascia"],
    explodedOffset: { x: -180, y: 0, z: 0 },
    slotPosition: { x: 200, y: 320, z: 0 },
    estimatedDuration: 600,
    soundType: "click",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 2, rigidity: 0.0, dragCd: 0.002, downforceKg: 0, cost: 850 },
    tooltipAdvice: "92% open-area titanium mesh protects expensive radiator cores from track stones at 300 km/h.",
    paintZone: "aero_unpainted_carbon",
  },
  {
    id: "exhaust_tips_surround",
    name: "Quad Inconel Exhaust Tips & Thermal Shroud",
    category: "Trim & Final Assembly",
    subcategory: "Exhaust Trim",
    description: "Flame-treated Inconel exhaust tips with carbon fiber thermal surround shielding bumper paint.",
    dependencies: ["rear_bumper_fascia"],
    explodedOffset: { x: 190, y: 20, z: 0 },
    slotPosition: { x: 760, y: 330, z: 0 },
    estimatedDuration: 700,
    soundType: "metallic",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 3, rigidity: 0.0, dragCd: 0.0, downforceKg: 0, cost: 1800 },
    tooltipAdvice: "Thermal carbon exhaust surrounds prevent bumper resin discoloration under exhaust afterfire flames.",
    paintZone: "aero_unpainted_carbon",
  },
  {
    id: "door_handles_latches",
    name: "Electronic Flush Pop-Out Door Handles",
    category: "Trim & Final Assembly",
    subcategory: "Hardware",
    description: "Flush-fitting motorized door handles with proximity deployment and emergency mechanical override.",
    dependencies: ["doors_assembly"],
    explodedOffset: { x: 0, y: -40, z: 0 },
    slotPosition: { x: 520, y: 290, z: 0 },
    estimatedDuration: 600,
    soundType: "click",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 2, rigidity: 0.0, dragCd: -0.003, downforceKg: 0, cost: 1200 },
    tooltipAdvice: "Flush door handles eliminate surface drag disturbances along the side airflow boundary layer.",
    paintZone: "body",
  },
  {
    id: "wiper_cowl_assembly",
    name: "Aerodynamic Wiper Blades & Hidden Cowl Panel",
    category: "Trim & Final Assembly",
    subcategory: "Hardware",
    description: "Aero-blade wipers parked completely beneath the hood trailing edge line for zero wind disturbance.",
    dependencies: ["windshield_glass", "firewall_bulkhead"],
    explodedOffset: { x: -60, y: -40, z: 0 },
    slotPosition: { x: 370, y: 250, z: 0 },
    estimatedDuration: 600,
    soundType: "click",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 3, rigidity: 0.0, dragCd: -0.002, downforceKg: 0, cost: 650 },
    tooltipAdvice: "Hiding wipers beneath the cowl eliminates high-speed aero flutter and wind buffeting noise.",
    paintZone: "aero_unpainted_carbon",
  },
  {
    id: "badges_emblems",
    name: "Milled Enamel Badges & Aero Script Emblems",
    category: "Trim & Final Assembly",
    subcategory: "Branding Details",
    description: "Jewelry-grade vitreous enamel Apex hood badge and laser-cut ultra-thin aero decklid script.",
    dependencies: ["hood_panel", "trunk_decklid", "front_bumper_fascia"],
    explodedOffset: { x: 0, y: -20, z: 0 },
    slotPosition: { x: 480, y: 260, z: 0 },
    estimatedDuration: 500,
    soundType: "click",
    variants: AERO_PACKAGE_VARIANTS,
    statDeltas: { hp: 0, torque: 0, weight: 0.3, rigidity: 0.0, dragCd: 0.0, downforceKg: 0, cost: 450 },
    tooltipAdvice: "Ultra-thin 0.2mm adhesive badges eliminate aerodynamic drag compared to thick protruding emblems.",
    paintZone: "body",
  },
];

export function getExteriorAssemblyComponents(vehicleConfig?: Partial<VehicleConfig>): ExteriorAssemblyComponentMeta[] {
  return EXTERIOR_ASSEMBLY_REGISTRY;
}
