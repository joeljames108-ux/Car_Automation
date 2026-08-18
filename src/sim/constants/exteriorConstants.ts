// ===================================================================
// EXTERIOR CONSTANTS — Modularized Exterior Styling, 3D & Lighting Tables
// ===================================================================

import type {
  BodyType, RimDesign, RimFinish, PaintFinish,
  HeadlightType, TaillightType, BodyKit, SpoilerType, RoofScoopType,
} from "../types";
import type {
  ExteriorEngineeringConfig,
  PaintSystemConfig,
  PaintFinishType,
  AeroSurfaceConfig,
  LightingConfig,
  GlassConfig,
  ExteriorWheelConfig,
  ExteriorTireConfig,
  ExteriorBrakeVisualConfig,
} from "../types/exterior";

// ---------- 1. Master Exterior Styling Tables ----------

export const BODY_TYPES: Record<BodyType, {
  label: string;
  origin: string;
  dragDelta: number;     // additive to Cd
  liftDelta: number;     // additive to Cl
  frontalDelta: number;  // multiplicative factor on frontal area
  weightDelta: number;   // kg added/removed
  costFactor: number;
  description: string;
}> = {
  city_car: { label: "City Car", origin: "Global", dragDelta: 0.04, liftDelta: 0.04, frontalDelta: 0.88, weightDelta: -80, costFactor: 0.8, description: "Ultra-compact urban commuter" },
  sedan: { label: "Sedan", origin: "Global", dragDelta: 0.00, liftDelta: 0.02, frontalDelta: 1.00, weightDelta: 0, costFactor: 1.0, description: "Three-box, four-door — balanced and practical" },
  coupe: { label: "Coupe", origin: "Global", dragDelta: -0.01, liftDelta: 0.01, frontalDelta: 0.97, weightDelta: -20, costFactor: 1.1, description: "Two-door, sloping roofline" },
  hatchback: { label: "Hatchback", origin: "Europe", dragDelta: 0.02, liftDelta: 0.03, frontalDelta: 0.95, weightDelta: -40, costFactor: 0.9, description: "Compact, cut-off tail — agile" },
  wagon: { label: "Wagon / Estate", origin: "Europe", dragDelta: -0.01, liftDelta: 0.00, frontalDelta: 1.02, weightDelta: 30, costFactor: 1.1, description: "Extended roof, long load floor" },
  fastback: { label: "Fastback", origin: "USA / Europe", dragDelta: -0.04, liftDelta: -0.02, frontalDelta: 0.96, weightDelta: -10, costFactor: 1.3, description: "Roofline runs to the tail — low drag" },
  roadster: { label: "Roadster", origin: "UK / Italy", dragDelta: 0.03, liftDelta: 0.04, frontalDelta: 0.93, weightDelta: -60, costFactor: 1.5, description: "Open two-seater, no fixed roof" },
  sports_car: { label: "Sports Car", origin: "Global", dragDelta: -0.02, liftDelta: 0.00, frontalDelta: 0.94, weightDelta: -50, costFactor: 1.4, description: "Performance focused light body" },
  muscle_car: { label: "Muscle Car", origin: "USA", dragDelta: 0.03, liftDelta: 0.02, frontalDelta: 1.08, weightDelta: 80, costFactor: 1.2, description: "Aggressive wide stance high displacement" },
  pony_car: { label: "Pony Car", origin: "USA", dragDelta: 0.01, liftDelta: 0.01, frontalDelta: 1.02, weightDelta: 40, costFactor: 1.15, description: "Compact sporty coupe" },
  supercar: { label: "Supercar Body", origin: "Italy", dragDelta: -0.05, liftDelta: -0.10, frontalDelta: 0.92, weightDelta: -100, costFactor: 2.8, description: "Low drag aerodynamic mid-engine layout" },
  hypercar: { label: "Hypercar Body", origin: "Global", dragDelta: -0.07, liftDelta: -0.20, frontalDelta: 0.89, weightDelta: -120, costFactor: 5.0, description: "Active aero carbon shell" },
  targa: { label: "Targa", origin: "Germany", dragDelta: 0.01, liftDelta: 0.02, frontalDelta: 0.96, weightDelta: -30, costFactor: 1.4, description: "Removable roof panel, full roll bar" },
  ttop: { label: "T-Top", origin: "USA", dragDelta: 0.02, liftDelta: 0.03, frontalDelta: 0.97, weightDelta: -20, costFactor: 1.3, description: "Two removable roof panels" },
  convertible: { label: "Convertible", origin: "Global", dragDelta: 0.04, liftDelta: 0.05, frontalDelta: 0.98, weightDelta: 20, costFactor: 1.6, description: "Folding soft or hard top" },
  suv: { label: "SUV", origin: "USA", dragDelta: 0.06, liftDelta: 0.04, frontalDelta: 1.12, weightDelta: 120, costFactor: 1.2, description: "Tall, high ground clearance" },
  crossover: { label: "Crossover", origin: "Global", dragDelta: 0.03, liftDelta: 0.02, frontalDelta: 1.05, weightDelta: 60, costFactor: 1.1, description: "Raised hatchback stance" },
  pickup: { label: "Pickup", origin: "USA", dragDelta: 0.07, liftDelta: 0.05, frontalDelta: 1.15, weightDelta: 150, costFactor: 1.2, description: "Cab plus open cargo bed" },
  mpv: { label: "MPV", origin: "Global", dragDelta: 0.05, liftDelta: 0.04, frontalDelta: 1.12, weightDelta: 100, costFactor: 1.1, description: "Multi-purpose passenger vehicle" },
  minivan: { label: "Minivan", origin: "USA / Japan", dragDelta: 0.06, liftDelta: 0.05, frontalDelta: 1.16, weightDelta: 140, costFactor: 1.15, description: "Family passenger van" },
  van: { label: "Van", origin: "Germany / Japan", dragDelta: 0.08, liftDelta: 0.06, frontalDelta: 1.20, weightDelta: 180, costFactor: 1.0, description: "Box-shaped, max cargo volume" },
  offroad_4x4: { label: "Off-Road 4x4", origin: "Global", dragDelta: 0.09, liftDelta: 0.07, frontalDelta: 1.22, weightDelta: 200, costFactor: 1.3, description: "Rugged high clearance 4WD" },
  commercial: { label: "Commercial Vehicle", origin: "Global", dragDelta: 0.10, liftDelta: 0.08, frontalDelta: 1.25, weightDelta: 250, costFactor: 0.9, description: "Heavy utility commercial chassis" },
  limousine: { label: "Limousine", origin: "Global", dragDelta: 0.02, liftDelta: 0.02, frontalDelta: 1.10, weightDelta: 350, costFactor: 2.5, description: "Extended wheelbase luxury coach" },
  taxi: { label: "Taxi Fleet", origin: "Global", dragDelta: 0.01, liftDelta: 0.02, frontalDelta: 1.00, weightDelta: 20, costFactor: 0.95, description: "High durability fleet passenger" },
  police: { label: "Police Interceptor", origin: "USA", dragDelta: 0.02, liftDelta: 0.03, frontalDelta: 1.05, weightDelta: 70, costFactor: 1.25, description: "Pursuit reinforced law enforcement" },
  ambulance: { label: "Ambulance", origin: "Global", dragDelta: 0.12, liftDelta: 0.08, frontalDelta: 1.30, weightDelta: 400, costFactor: 1.8, description: "Medical emergency unit" },
  fire_vehicle: { label: "Fire Vehicle", origin: "Global", dragDelta: 0.15, liftDelta: 0.10, frontalDelta: 1.40, weightDelta: 600, costFactor: 2.0, description: "Heavy duty fire emergency truck" },
  rally_car: { label: "Rally Spec", origin: "Europe", dragDelta: 0.03, liftDelta: -0.05, frontalDelta: 1.00, weightDelta: -60, costFactor: 2.2, description: "Reinforced roll cage long travel" },
  formula_car: { label: "Formula Single Seater", origin: "Global", dragDelta: -0.10, liftDelta: -0.40, frontalDelta: 0.75, weightDelta: -300, costFactor: 4.5, description: "Open wheel high downforce" },
  touring_car: { label: "Touring Race Spec", origin: "Europe", dragDelta: -0.03, liftDelta: -0.15, frontalDelta: 0.98, weightDelta: -120, costFactor: 2.0, description: "Circuit race modified sedan" },
  gt_race_car: { label: "GT Race Spec", origin: "Global", dragDelta: -0.05, liftDelta: -0.25, frontalDelta: 0.96, weightDelta: -150, costFactor: 3.0, description: "FIA GT race body" },
  drift_car: { label: "Drift Spec", origin: "Japan", dragDelta: 0.01, liftDelta: -0.02, frontalDelta: 0.98, weightDelta: -80, costFactor: 1.6, description: "High angle steering drift rig" },
  track_car: { label: "Track Day Toy", origin: "Global", dragDelta: -0.04, liftDelta: -0.20, frontalDelta: 0.92, weightDelta: -140, costFactor: 2.4, description: "Lightweight track aero package" },
  shooting_brake: { label: "Shooting Brake", origin: "UK", dragDelta: -0.02, liftDelta: -0.01, frontalDelta: 0.99, weightDelta: 10, costFactor: 1.5, description: "Estate-style two-door grand tourer" },
  gt_coupe: { label: "GT Coupe", origin: "Italy / UK", dragDelta: -0.03, liftDelta: -0.02, frontalDelta: 0.98, weightDelta: 20, costFactor: 1.8, description: "Long-hood grand tourer" },
  spider: { label: "Spider", origin: "Italy", dragDelta: 0.03, liftDelta: 0.04, frontalDelta: 0.92, weightDelta: -70, costFactor: 1.6, description: "Lightweight open Italian roadster" },
  canopy: { label: "Canopy / Bubble", origin: "France / USA", dragDelta: -0.05, liftDelta: -0.03, frontalDelta: 0.90, weightDelta: -40, costFactor: 2.2, description: "Dome canopy — minimal frontal area" },
  kammback: { label: "Kammback", origin: "Germany", dragDelta: -0.06, liftDelta: -0.04, frontalDelta: 0.95, weightDelta: -15, costFactor: 1.4, description: "Cut-off tail for lowest drag" },
};

export const RIM_DESIGNS: Record<RimDesign, {
  label: string;
  weightFactor: number;
  aeroFactor: number;
  costFactor: number;
  brakeCooling: number;
}> = {
  steel_stamped: { label: "Stamped Steel Wheels", weightFactor: 1.25, aeroFactor: 1.02, costFactor: 0.4, brakeCooling: 0.5 },
  mesh: { label: "Mesh", weightFactor: 1.0, aeroFactor: 0.98, costFactor: 1.0, brakeCooling: 0.7 },
  multi_spoke: { label: "Multi-Spoke", weightFactor: 1.05, aeroFactor: 1.00, costFactor: 1.0, brakeCooling: 0.6 },
  twin_spoke: { label: "Twin-Spoke", weightFactor: 0.95, aeroFactor: 0.97, costFactor: 1.1, brakeCooling: 0.7 },
  y_spoke: { label: "Y-Spoke", weightFactor: 0.92, aeroFactor: 0.98, costFactor: 1.2, brakeCooling: 0.8 },
  turbine: { label: "Turbine", weightFactor: 1.1, aeroFactor: 0.95, costFactor: 1.5, brakeCooling: 0.5 },
  deep_dish: { label: "Deep Dish", weightFactor: 1.2, aeroFactor: 1.05, costFactor: 1.4, brakeCooling: 0.6 },
  split_5: { label: "Split-5", weightFactor: 0.90, aeroFactor: 0.97, costFactor: 1.3, brakeCooling: 0.85 },
  split_6: { label: "Split-6", weightFactor: 0.92, aeroFactor: 0.97, costFactor: 1.3, brakeCooling: 0.85 },
  slotted: { label: "Slotted", weightFactor: 1.0, aeroFactor: 1.0, costFactor: 1.1, brakeCooling: 0.9 },
  solid_disc: { label: "Solid Disc", weightFactor: 1.3, aeroFactor: 0.88, costFactor: 1.6, brakeCooling: 0.3 },
};

export const RIM_FINISHES: Record<RimFinish, { label: string; costFactor: number; weightFactor: number }> = {
  silver: { label: "Silver", costFactor: 1.0, weightFactor: 1.0 },
  gloss_black: { label: "Gloss Black", costFactor: 1.1, weightFactor: 1.0 },
  matte_black: { label: "Matte Black", costFactor: 1.1, weightFactor: 1.0 },
  bronze: { label: "Bronze", costFactor: 1.3, weightFactor: 1.05 },
  gold: { label: "Gold", costFactor: 1.6, weightFactor: 1.1 },
  chrome: { label: "Chrome", costFactor: 1.8, weightFactor: 1.15 },
  gunmetal: { label: "Gunmetal", costFactor: 1.2, weightFactor: 1.0 },
  bronze_cut: { label: "Bronze Cut", costFactor: 1.4, weightFactor: 1.05 },
};

export const PAINT_FINISHES: Record<PaintFinish, { label: string; costFactor: number; dragDelta: number }> = {
  gloss: { label: "Gloss", costFactor: 1.0, dragDelta: 0.000 },
  matte: { label: "Matte", costFactor: 1.4, dragDelta: 0.002 },
  satin: { label: "Satin", costFactor: 1.3, dragDelta: 0.001 },
  metallic: { label: "Metallic", costFactor: 1.2, dragDelta: -0.002 },
  pearl: { label: "Pearl", costFactor: 1.5, dragDelta: -0.002 },
  candy: { label: "Candy", costFactor: 1.7, dragDelta: -0.001 },
  chrome: { label: "Chrome", costFactor: 2.2, dragDelta: -0.004 },
  colorshift: { label: "Colorshift", costFactor: 2.0, dragDelta: -0.003 },
};

export const HEADLIGHT_TYPES: Record<HeadlightType, {
  label: string;
  weight: number;
  cost: number;
  powerDraw: number;
  brightness: number;
  dragDelta: number;
}> = {
  halogen_reflector: { label: "Halogen Reflector", weight: 3.5, cost: 120, powerDraw: 110, brightness: 0.5, dragDelta: 0.004 },
  halogen_projector: { label: "Halogen Projector", weight: 4.0, cost: 200, powerDraw: 110, brightness: 0.6, dragDelta: 0.003 },
  bi_xenon: { label: "Bi-Xenon HID", weight: 4.5, cost: 600, powerDraw: 85, brightness: 0.8, dragDelta: 0.002 },
  led: { label: "LED", weight: 2.5, cost: 800, powerDraw: 40, brightness: 0.9, dragDelta: 0.000 },
  led_matrix: { label: "LED Matrix", weight: 3.0, cost: 2200, powerDraw: 55, brightness: 1.0, dragDelta: -0.001 },
  laser: { label: "Laser", weight: 2.0, cost: 3500, powerDraw: 35, brightness: 1.0, dragDelta: -0.002 },
  oled_strip: { label: "OLED Strip", weight: 1.8, cost: 2800, powerDraw: 30, brightness: 0.95, dragDelta: -0.002 },
  pop_up: { label: "Pop-Up", weight: 6.0, cost: 900, powerDraw: 110, brightness: 0.7, dragDelta: 0.010 },
};

export const TAILLIGHT_TYPES: Record<TaillightType, {
  label: string;
  weight: number;
  cost: number;
  powerDraw: number;
}> = {
  bulb: { label: "Incandescent", weight: 2.0, cost: 80, powerDraw: 50 },
  led_bar: { label: "LED Bar", weight: 1.2, cost: 300, powerDraw: 15 },
  led_matrix: { label: "LED Matrix", weight: 1.5, cost: 900, powerDraw: 20 },
  oled: { label: "OLED Panel", weight: 0.8, cost: 1200, powerDraw: 12 },
  sequential_led: { label: "Sequential LED", weight: 1.3, cost: 700, powerDraw: 18 },
  laser_glow: { label: "Laser Glow", weight: 0.6, cost: 1800, powerDraw: 10 },
};

export const BODY_KITS: Record<BodyKit, {
  label: string;
  weightDelta: number;
  dragDelta: number;
  liftDelta: number;
  costFactor: number;
  gripFactor: number;
  description: string;
}> = {
  none: { label: "None", weightDelta: 0, dragDelta: 0.00, liftDelta: 0.00, costFactor: 0.0, gripFactor: 1.0, description: "Factory body" },
  oem_plus: { label: "OEM+", weightDelta: -5, dragDelta: -0.01, liftDelta: -0.01, costFactor: 0.5, gripFactor: 1.02, description: "Subtle factory-style aero trim" },
  street: { label: "Street", weightDelta: 10, dragDelta: -0.02, liftDelta: -0.03, costFactor: 1.0, gripFactor: 1.05, description: "Aggressive street aero" },
  track: { label: "Track", weightDelta: -8, dragDelta: -0.03, liftDelta: -0.06, costFactor: 1.8, gripFactor: 1.10, description: "Track-focused downforce kit" },
  widebody: { label: "Widebody", weightDelta: 20, dragDelta: 0.01, liftDelta: -0.04, costFactor: 2.2, gripFactor: 1.08, description: "Pulled fenders, wider track" },
  gt3: { label: "GT3", weightDelta: -12, dragDelta: -0.04, liftDelta: -0.10, costFactor: 3.0, gripFactor: 1.15, description: "Full GT3-style aero package" },
  drift: { label: "Drift", weightDelta: 15, dragDelta: 0.03, liftDelta: 0.02, costFactor: 1.4, gripFactor: 0.95, description: "Style-focused, high angle" },
  rally: { label: "Rally", weightDelta: 35, dragDelta: 0.04, liftDelta: 0.03, costFactor: 1.5, gripFactor: 0.98, description: "Rough-road protection, flares" },
};

export const SPOILER_TYPES: Record<SpoilerType, {
  label: string;
  weight: number;
  dragDelta: number;
  liftDelta: number;
  cost: number;
}> = {
  none: { label: "None", weight: 0, dragDelta: 0.00, liftDelta: 0.00, cost: 0 },
  lip: { label: "Lip Spoiler", weight: 1, dragDelta: 0.00, liftDelta: -0.02, cost: 200 },
  ducktail: { label: "Ducktail", weight: 2, dragDelta: 0.00, liftDelta: -0.03, cost: 400 },
  pedestal: { label: "Pedestal", weight: 6, dragDelta: 0.02, liftDelta: -0.06, cost: 900 },
  swan_neck: { label: "Swan Neck", weight: 5, dragDelta: 0.01, liftDelta: -0.08, cost: 1800 },
  gt_wing: { label: "GT Wing", weight: 8, dragDelta: 0.04, liftDelta: -0.12, cost: 2600 },
  active_wing: { label: "Active Wing", weight: 10, dragDelta: 0.01, liftDelta: -0.10, cost: 4500 },
};

export const ROOF_SCOOPS: Record<RoofScoopType, {
  label: string;
  weight: number;
  dragDelta: number;
  coolingBonus: number;
  cost: number;
}> = {
  none: { label: "None", weight: 0, dragDelta: 0.000, coolingBonus: 0, cost: 0 },
  functional: { label: "Functional", weight: 3, dragDelta: 0.005, coolingBonus: 0.1, cost: 600 },
  decorative: { label: "Decorative", weight: 2, dragDelta: 0.003, coolingBonus: 0, cost: 250 },
  naca_duct: { label: "NACA Duct", weight: 1, dragDelta: 0.001, coolingBonus: 0.05, cost: 350 },
};

export const MIRROR_TYPES: Record<string, { label: string; weight: number; cost: number; dragDelta: number }> = {
  standard: { label: "Standard", weight: 2.5, cost: 150, dragDelta: 0.004 },
  folding: { label: "Folding", weight: 3.0, cost: 300, dragDelta: 0.004 },
  carbon: { label: "Carbon", weight: 1.2, cost: 900, dragDelta: 0.003 },
  camera: { label: "Camera", weight: 0.6, cost: 2200, dragDelta: 0.001 },
  none: { label: "None", weight: 0, cost: 0, dragDelta: 0.000 },
};

// ---------- 2. Heritage Paint Swatches & Shut Line Standards ----------

export interface HeritagePaintSwatch {
  id: string;
  name: string;
  hex: string;
  finish: string;
  finishRecommended: PaintFinishType;
  brandInspiration: string;
}

export const APEX_HERITAGE_PAINT_SWATCHES: HeritagePaintSwatch[] = [
  { id: "monza_red", name: "Monza Corsa Red", hex: "#C8102E", finish: "high_gloss_mirror", finishRecommended: "high_gloss_mirror", brandInspiration: "Scuderia Italian Racing Heritage" },
  { id: "silverstone_gray", name: "Silverstone Ghost Silver", hex: "#8A8D8F", finish: "liquid_metallic", finishRecommended: "liquid_metallic", brandInspiration: "British Grand Prix Silver Arrows" },
  { id: "le_mans_blue", name: "Le Mans Nightfall Blue", hex: "#00205B", finish: "tri_coat_pearl_iridescent", finishRecommended: "tri_coat_pearl_iridescent", brandInspiration: "Circuit de la Sarthe Midnight Stint" },
  { id: "nardo_slate", name: "Nardo Primer Grey", hex: "#6C7A89", finish: "deep_satin_matte", finishRecommended: "deep_satin_matte", brandInspiration: "High-Speed Ring Proving Ground" },
  { id: "acid_lime", name: "Acid Hyper Lime", hex: "#A8D82A", finish: "high_gloss_mirror", finishRecommended: "high_gloss_mirror", brandInspiration: "Hybrid KERS High-Voltage Accent" },
  { id: "stealth_noir", name: "Vantablack Stealth Noir", hex: "#111111", finish: "deep_satin_matte", finishRecommended: "deep_satin_matte", brandInspiration: "Carbon Monocoque Lightweight Spec" },
  { id: "gulf_heritage_orange", name: "Papaya Endurance Orange", hex: "#FF8200", finish: "candy_translucent_tint", finishRecommended: "candy_translucent_tint", brandInspiration: "Triple Crown Victory Livery" },
  { id: "british_racing_green", name: "Brooklands Emerald Green", hex: "#004225", finish: "tri_coat_pearl_iridescent", finishRecommended: "tri_coat_pearl_iridescent", brandInspiration: "Historic Isle of Man Gordon Bennett Cup" },
];

export interface ShutLineToleranceRule {
  name: string;
  panelPairLabel: string;
  nominalGapMm: number;
  tolerancePlusMm: number;
  toleranceMinusMm: number;
  nominalFlushMm: number;
  flushToleranceMm: number;
}

export const SHUT_LINE_SPECIFICATION_STANDARDS: Record<string, ShutLineToleranceRule> = {
  hood_to_fender: { name: "Hood to Fender", panelPairLabel: "Hood / Front Fender", nominalGapMm: 3.5, tolerancePlusMm: 0.5, toleranceMinusMm: 0.5, nominalFlushMm: 0.0, flushToleranceMm: 0.4 },
  door_front_to_fender: { name: "Front Door to Fender", panelPairLabel: "Front Door / Fender", nominalGapMm: 3.8, tolerancePlusMm: 0.6, toleranceMinusMm: 0.6, nominalFlushMm: 0.0, flushToleranceMm: 0.4 },
  door_front_to_rear: { name: "Front Door to Rear Door", panelPairLabel: "Front Door / Rear Door", nominalGapMm: 3.5, tolerancePlusMm: 0.5, toleranceMinusMm: 0.5, nominalFlushMm: 0.0, flushToleranceMm: 0.4 },
  door_rear_to_quarter: { name: "Rear Door to Quarter Panel", panelPairLabel: "Rear Door / Quarter", nominalGapMm: 3.8, tolerancePlusMm: 0.6, toleranceMinusMm: 0.6, nominalFlushMm: 0.0, flushToleranceMm: 0.4 },
  trunk_to_quarter: { name: "Trunk Lid to Quarter Panel", panelPairLabel: "Trunk Lid / Quarter", nominalGapMm: 4.0, tolerancePlusMm: 0.7, toleranceMinusMm: 0.7, nominalFlushMm: 0.0, flushToleranceMm: 0.5 },
  headlight_to_bumper: { name: "Headlight to Front Bumper", panelPairLabel: "Headlight / Bumper Fascia", nominalGapMm: 2.5, tolerancePlusMm: 0.4, toleranceMinusMm: 0.4, nominalFlushMm: 0.0, flushToleranceMm: 0.3 },
};

// ---------- 3. Default Subsystem Factory Generators ----------

export function createDefaultExteriorConfig(): ExteriorEngineeringConfig {
  return {
    bodyStyle: "hypercar_coupe",
    doorOpening: "butterfly_mclaren",
    roofStyle: "fixed_coupe",
    frontFascia: "aggressive_shark_nose",
    rearFascia: "integrated_diffuser_tunnel",
    wheelbase: 2700,
    trackWidthFront: 1650,
    trackWidthRear: 1680,
    overallLength: 4680,
    overallWidth: 2020,
    overallHeight: 1180,
    groundClearance: 85,
    frontOverhang: 920,
    rearOverhang: 860,
    cowlHeight: 720,
    beltlineHeight: 820,
    roofApexHeight: 1180,
    hipPointHeight: 310,
    decklidHeight: 900,
    sideTumblehomeAngle: 24,
    windshieldRakeAngle: 32,
    rearWindowRakeAngle: 28,
    hoodSlopeAngle: 14,
    targetPanelGap: 3.5,
    targetFlushness: 0.0,
    hemmingRadius: 1.2,
    characterLineSharpness: 3.0,
    activeAeroEquipped: true,
    flatUnderfloor: true,
    vortexGenerators: true,
    brakeDuctsFunctional: true,
    widebodyFlareFrontMm: 25,
    widebodyFlareRearMm: 40,
  };
}

export function createDefaultPaintConfig(): PaintSystemConfig {
  return {
    finishType: "liquid_metallic",
    primaryColorHex: "#00205B",
    secondaryColorHex: "#111111",
    tertiaryColorHex: "#C8102E",
    liveryStyle: "monotone",
    stripeWidthMm: 120,
    accentSplitterColor: "#C8102E",
    mirrorsContrastColor: true,
    roofContrastColor: false,
    eCoatPrimerMicrons: 22,
    primerSurfacerMicrons: 32,
    baseCoatMicrons: 16,
    clearCoatMicrons: 48,
    clearCoatGrade: "ceramic_quartz_nanocoat",
    metallicFlakeSizeMicrons: 18,
    metallicFlakeDensity: 0.65,
    pearlMicaChromaShift: 0.4,
    candyDepthTranslucency: 0.3,
    orangePeelTextureIndex: 0.15,
    distinctnessOfImageDOI: 94,
    uvProtectionHalfLifeYears: 18,
  };
}

export function createDefaultAeroConfig(): AeroSurfaceConfig {
  return {
    frontSplitterProfile: "track_extended_carbon",
    splitterExtensionMm: 85,
    splitterGroundClearanceMm: 65,
    splitterSupportRods: true,
    frontDivePlanesCanardsCount: 2,
    frontCanardAngleDeg: 18,
    hoodVentAreaCm2: 850,
    underbodyFloorType: "venturi_dual_tunnel",
    venturiThroatHeightMm: 32,
    diffuserProfile: "gt3_race_high_kick_7",
    diffuserExpansionAngleDeg: 14,
    diffuserFinCount: 7,
    diffuserStrakeExtensionMm: 95,
    rearWingType: "swan_neck_carbon_pylon",
    wingSpanMm: 1650,
    wingChordMm: 310,
    wingAngleOfAttackDeg: 12,
    wingEndplateHeightMm: 220,
    wingGurneyFlapHeightMm: 8,
    hasActiveDRS: true,
    airbrakeMaxAngleDeg: 68,
    frontCenterGrilleAreaCm2: 1400,
    sidePodIntakeAreaCm2: 750,
    fenderArchPressureReliefLouvers: true,
    rearDeckHeatExtractionSlots: true,
  };
}

export function createDefaultLightingConfig(): LightingConfig {
  return {
    headlightTech: "full_matrix_led_84_pixel",
    taillightTech: "flexible_3d_oled_surface",
    drlSignature: "sharp_c_clamp",
    lensTint: "crystal_clear",
    sequentialTurnSignals: true,
    hasWelcomeStartupSequence: true,
    corneringAdaptiveIllumination: true,
    underbodyAmbientGlow: false,
    ambientGlowColorHex: "#00FFFF",
    projectorBezelFinish: "satin_black",
    thirdBrakeLightStyle: "integrated_roof_spoiler",
  };
}

export function createDefaultGlassConfig(): GlassConfig {
  return {
    windshieldGlass: "dual_laminated_acoustic",
    sideDoorGlass: "dual_laminated_acoustic",
    rearQuarterGlass: "gorilla_glass_thin_film",
    rearBackliteGlass: "gorilla_glass_thin_film",
    roofGlass: "electrochromic_smart_tint",
    windshieldTintVLT: 80,
    sideFrontTintVLT: 70,
    sideRearTintVLT: 25,
    rearWindowTintVLT: 25,
    uvInfraredRejectionPercent: 88,
    hasAcousticPVBInterlayer: true,
    hasHeatedDefrostGridTungsten: true,
    hasHydrophobicNanoCoat: true,
    ceramicBorderFritDotMatrix: true,
  };
}

export function createDefaultWheelConfig(): ExteriorWheelConfig {
  return {
    spokePattern: "monoblock_5_spoke",
    construction: "6061_t6_forged_monoblock",
    diameterFrontInches: 20,
    diameterRearInches: 21,
    widthFrontInches: 9.5,
    widthRearInches: 12.0,
    offsetFrontMm: 32,
    offsetRearMm: 24,
    centerLockNut: true,
    finish: "satin_bronze",
    centerCapLogo: "APEX",
  };
}

export function createDefaultTireConfig(): ExteriorTireConfig {
  return {
    frontWidthMm: 265,
    frontAspectRatio: 35,
    rearWidthMm: 325,
    rearAspectRatio: 30,
    tireCompound: "track_r_compound",
    sidewallLettering: "red_apex_motorsport",
    treadDepthRemainingMm: 6.5,
  };
}

export function createDefaultBrakeVisualConfig(): ExteriorBrakeVisualConfig {
  return {
    caliperColorHex: "#C8102E",
    caliperLogo: "APEX_RACING",
    pistonCountFront: 6,
    pistonCountRear: 4,
    rotorType: "carbon_ceramic_matrix",
    rotorDiameterFrontMm: 390,
    rotorDiameterRearMm: 360,
    hasTitaniumHeatShields: true,
  };
}
