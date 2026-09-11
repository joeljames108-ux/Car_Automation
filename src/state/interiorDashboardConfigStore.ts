/**
 * ============================================================================
 * INTERIOR DASHBOARD CONFIGURATOR — REACTIVE ZUSTAND STATE STORE
 * ============================================================================
 * Manages the real-time interior configuration state with:
 * - 10 Configurable Features & Stat Modifier Database
 * - Full Semantic Cockpit Configurator State (7 Wheels, 7 Shifters, 11 Trims, 8 Infotainment Modes, 5 Clusters, HUD)
 * - Engineering Consequence Engines: Price ($), Weight (kg), Power Load (W),
 *   and Scores (Luxury, Sport, Technology, Comfort, Track)
 * - Theme Presets (Obsidian, Gran Turismo, Track, Heritage, Executive, Cyber Sport)
 * - Undo / Redo History Stack & Versioned JSON Save/Load System
 * ============================================================================
 */

import { create } from "zustand";

// ============================================================================
// 1. TYPES & INTERFACES
// ============================================================================

export interface StatModifiers {
  comfort?: number;
  ergonomics?: number;
  quality?: number;
  perceivedValue?: number;
  reliability?: number;
  noiseIsolation?: number;
  infotainment?: number;
  marketAppeal?: number;
  weight?: number;
  cost?: number;
}

export interface OptionDef {
  label: string;
  stats: StatModifiers;
  visualHints?: Record<string, string | number | boolean>;
}

export type FeatureKey =
  | "dashboardLayout"
  | "instrumentCluster"
  | "centerDisplay"
  | "steeringWheel"
  | "seatType"
  | "seatMaterial"
  | "interiorTrim"
  | "ambientLighting"
  | "infotainmentSystem"
  | "climateControl";

export interface FeatureConfig {
  label: string;
  options: OptionDef[];
}

export interface ComputedMetrics {
  comfort: number;
  ergonomics: number;
  quality: number;
  perceivedValue: number;
  reliability: number;
  noiseIsolation: number;
  infotainment: number;
  marketAppeal: number;
  weight: number;
  cost: number;
  overallRating: "S" | "A" | "B" | "C" | "D";
  ratingLabel: string;
}

export interface InteriorColorSwatch {
  name: string;
  hex: string;
}

export interface PresetDef {
  name: string;
  selections: Record<FeatureKey, number>;
  color: string;
}

// ============================================================================
// 2. CONFIG OPTIONS DATABASE (LEGACY / 2D VIEW COMPATIBILITY)
// ============================================================================

export const CONFIG_OPTIONS: Record<FeatureKey, FeatureConfig> = {
  dashboardLayout: {
    label: "Dashboard Layout",
    options: [
      { label: "Classic 80s", stats: { ergonomics: 5, quality: 3, perceivedValue: 2, reliability: 8, cost: 400, weight: 22 }, visualHints: { shape: "classic" } },
      { label: "Driver Focused", stats: { ergonomics: 12, quality: 8, perceivedValue: 6, reliability: 5, cost: 950, weight: 18 }, visualHints: { shape: "driver_focused" } },
      { label: "Minimalist Floating", stats: { ergonomics: 8, quality: 14, perceivedValue: 12, reliability: 6, cost: 1600, weight: 14 }, visualHints: { shape: "minimalist" } },
    ],
  },
  instrumentCluster: {
    label: "Instrument Cluster",
    options: [
      { label: "Analog Dials", stats: { ergonomics: 6, quality: 4, reliability: 9, cost: 300, weight: 4 } },
      { label: "Hybrid Digital", stats: { ergonomics: 10, quality: 8, perceivedValue: 7, infotainment: 5, cost: 750, weight: 3 } },
      { label: "Full OLED Display", stats: { ergonomics: 14, quality: 15, perceivedValue: 14, infotainment: 12, cost: 1800, weight: 2 } },
    ],
  },
  centerDisplay: {
    label: "Center Display",
    options: [
      { label: "None / Radio Cassette", stats: { reliability: 10, cost: 80, weight: 2 } },
      { label: "8-inch Infotainment", stats: { ergonomics: 6, infotainment: 8, perceivedValue: 6, cost: 600, weight: 3 } },
      { label: "12.3-inch Curved Touchscreen", stats: { ergonomics: 12, infotainment: 16, perceivedValue: 15, cost: 1400, weight: 4 } },
    ],
  },
  steeringWheel: {
    label: "Steering Wheel",
    options: [
      { label: "Classic Thin Rim", stats: { ergonomics: 4, reliability: 8, cost: 200, weight: 3 } },
      { label: "3-Spoke Sport Contoured", stats: { ergonomics: 12, quality: 8, perceivedValue: 7, cost: 650, weight: 3 } },
      { label: "Aerodynamic Track Yoke", stats: { ergonomics: 14, quality: 12, perceivedValue: 10, cost: 1100, weight: 2 } },
    ],
  },
  seatType: {
    label: "Seat Architecture",
    options: [
      { label: "Standard Comfort Bench", stats: { comfort: 10, weight: 30, cost: 500 } },
      { label: "Sport Bolstered Seats", stats: { comfort: 14, ergonomics: 12, quality: 8, weight: 24, cost: 1200 } },
      { label: "Carbon Fiber Bucket", stats: { comfort: 6, ergonomics: 16, quality: 15, weight: 14, cost: 2800 } },
    ],
  },
  seatMaterial: {
    label: "Seat Upholstery",
    options: [
      { label: "Woven Fabric", stats: { comfort: 6, reliability: 8, cost: 200, weight: 4 } },
      { label: "Perforated Nappa Leather", stats: { comfort: 14, quality: 12, perceivedValue: 10, cost: 1100, weight: 6 } },
      { label: "Alcantara & Carbon Shell", stats: { comfort: 10, quality: 16, perceivedValue: 14, cost: 1900, weight: 3 } },
    ],
  },
  interiorTrim: {
    label: "Decorative Trim",
    options: [
      { label: "Matte Black Polymer", stats: { reliability: 8, cost: 150, weight: 3 } },
      { label: "Brushed Aluminum", stats: { quality: 8, perceivedValue: 6, cost: 450, weight: 3 } },
      { label: "Carbon Fiber 2x2", stats: { quality: 14, perceivedValue: 12, cost: 1100, weight: 1 } },
      { label: "Bookmatched American Walnut", stats: { quality: 15, perceivedValue: 14, comfort: 6, cost: 1350, weight: 4 } },
    ],
  },
  ambientLighting: {
    label: "Ambient Lighting",
    options: [
      { label: "Standard Incandescent", stats: { cost: 50, weight: 1 } },
      { label: "Multi-Zone Neon Lightguide", stats: { quality: 8, perceivedValue: 8, marketAppeal: 7, cost: 400, weight: 2 } },
    ],
  },
  infotainmentSystem: {
    label: "Infotainment Suite",
    options: [
      { label: "Standard Tuner Audio", stats: { reliability: 8, cost: 200, weight: 4 } },
      { label: "Apex Connected Navigation", stats: { infotainment: 10, reliability: 3, perceivedValue: 6, marketAppeal: 5, quality: 3, cost: 800, weight: 5 } },
      { label: "Digital Cockpit AI Assistant", stats: { infotainment: 14, reliability: 2, perceivedValue: 9, marketAppeal: 8, quality: 6, cost: 1400, weight: 6 } },
    ],
  },
  climateControl: {
    label: "Climate Control",
    options: [
      { label: "Manual HVAC", stats: { comfort: 2, reliability: 6, cost: 100, weight: 3 } },
      { label: "Dual Zone Automatic", stats: { comfort: 6, reliability: 4, perceivedValue: 4, quality: 3, cost: 450, weight: 5 } },
      { label: "Quad Zone Intelligent Micro-Climate", stats: { comfort: 9, reliability: 3, perceivedValue: 6, quality: 5, marketAppeal: 3, cost: 800, weight: 7 } },
    ],
  },
};

const BASE_STATS: StatModifiers = {
  comfort: 30,
  ergonomics: 28,
  quality: 25,
  perceivedValue: 22,
  reliability: 30,
  noiseIsolation: 50,
  infotainment: 15,
  marketAppeal: 25,
  weight: 20,
  cost: 500,
};

export const INTERIOR_COLOR_SWATCHES: InteriorColorSwatch[] = [
  { name: "Obsidian Black", hex: "#17181c" },
  { name: "Charcoal Grey", hex: "#26282e" },
  { name: "Cognac Tan", hex: "#9a5b32" },
  { name: "Crimson Red", hex: "#7f1d1d" },
  { name: "Dark Navy", hex: "#1e293b" },
  { name: "Cream Beige", hex: "#d4c5a9" },
  { name: "Steel Blue", hex: "#4a6fa5" },
];

export const INTERIOR_PRESETS: Record<string, PresetDef> = {
  ORIGINAL_80S: {
    name: "ORIGINAL 80s",
    selections: { dashboardLayout: 0, instrumentCluster: 0, centerDisplay: 0, steeringWheel: 0, seatType: 0, seatMaterial: 0, interiorTrim: 0, ambientLighting: 0, infotainmentSystem: 0, climateControl: 0 },
    color: "#9a5b32",
  },
  SPORT_80S: {
    name: "SPORT 80s",
    selections: { dashboardLayout: 1, instrumentCluster: 1, centerDisplay: 1, steeringWheel: 1, seatType: 1, seatMaterial: 1, interiorTrim: 1, ambientLighting: 1, infotainmentSystem: 1, climateControl: 1 },
    color: "#17181c",
  },
  LUXURY_80S: {
    name: "LUXURY 80s",
    selections: { dashboardLayout: 2, instrumentCluster: 2, centerDisplay: 2, steeringWheel: 1, seatType: 1, seatMaterial: 2, interiorTrim: 3, ambientLighting: 1, infotainmentSystem: 2, climateControl: 2 },
    color: "#1e293b",
  },
  MINIMALIST: {
    name: "MINIMALIST",
    selections: { dashboardLayout: 2, instrumentCluster: 1, centerDisplay: 1, steeringWheel: 2, seatType: 0, seatMaterial: 0, interiorTrim: 2, ambientLighting: 0, infotainmentSystem: 1, climateControl: 0 },
    color: "#17181c",
  },
  RALLY_80S: {
    name: "RALLY 80s",
    selections: { dashboardLayout: 1, instrumentCluster: 0, centerDisplay: 0, steeringWheel: 1, seatType: 2, seatMaterial: 0, interiorTrim: 1, ambientLighting: 0, infotainmentSystem: 0, climateControl: 0 },
    color: "#7f1d1d",
  },
  CLASSIC_WOOD: {
    name: "CLASSIC WOOD",
    selections: { dashboardLayout: 0, instrumentCluster: 0, centerDisplay: 0, steeringWheel: 0, seatType: 0, seatMaterial: 1, interiorTrim: 3, ambientLighting: 0, infotainmentSystem: 0, climateControl: 0 },
    color: "#9a5b32",
  },
};

export function computeMetrics(selections: Record<FeatureKey, number>): ComputedMetrics {
  const totals: Record<string, number> = {
    comfort: BASE_STATS.comfort!,
    ergonomics: BASE_STATS.ergonomics!,
    quality: BASE_STATS.quality!,
    perceivedValue: BASE_STATS.perceivedValue!,
    reliability: BASE_STATS.reliability!,
    noiseIsolation: BASE_STATS.noiseIsolation!,
    infotainment: BASE_STATS.infotainment!,
    marketAppeal: BASE_STATS.marketAppeal!,
    weight: BASE_STATS.weight!,
    cost: BASE_STATS.cost!,
  };

  const featureKeys = Object.keys(CONFIG_OPTIONS) as FeatureKey[];
  for (const key of featureKeys) {
    const optionIdx = selections[key] ?? 0;
    const option = CONFIG_OPTIONS[key].options[optionIdx];
    if (!option) continue;
    for (const [statKey, val] of Object.entries(option.stats)) {
      if (val !== undefined) {
        totals[statKey] = (totals[statKey] ?? 0) + val;
      }
    }
  }

  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

  const comfort = clamp(totals.comfort);
  const ergonomics = clamp(totals.ergonomics);
  const quality = clamp(totals.quality);
  const perceivedValue = clamp(totals.perceivedValue);
  const reliability = clamp(totals.reliability);
  const noiseIsolation = clamp(totals.noiseIsolation);
  const infotainment = clamp(totals.infotainment);
  const marketAppeal = clamp(totals.marketAppeal);

  const avg = (comfort + ergonomics + quality + perceivedValue + reliability + infotainment + marketAppeal) / 7;

  let overallRating: "S" | "A" | "B" | "C" | "D";
  let ratingLabel: string;
  if (avg >= 85) {
    overallRating = "S";
    ratingLabel = "Exceptional";
  } else if (avg >= 70) {
    overallRating = "A";
    ratingLabel = "Excellent";
  } else if (avg >= 55) {
    overallRating = "B";
    ratingLabel = "Good";
  } else if (avg >= 40) {
    overallRating = "C";
    ratingLabel = "Average";
  } else {
    overallRating = "D";
    ratingLabel = "Basic";
  }

  return {
    comfort, ergonomics, quality, perceivedValue, reliability,
    noiseIsolation, infotainment, marketAppeal,
    weight: Math.round(totals.weight),
    cost: Math.round(totals.cost),
    overallRating, ratingLabel,
  };
}

// ============================================================================
// 3. FULL SEMANTIC COCKPIT TYPES
// ============================================================================

export type SteeringWheelStyle =
  | 'sport'
  | 'gt_3spoke'
  | 'yoke'
  | 'formula'
  | 'luxury_2spoke'
  | 'classic_4spoke'
  | 'performance_4spoke';

export type SteeringGripMaterial = 'leather' | 'alcantara' | 'perforated' | 'carbon' | 'wood' | 'suede';
export type SteeringStripeStyle = 'none' | 'red' | 'yellow' | 'blue' | 'white' | 'green';
export type PaddleShifterStyle = 'none' | 'billet' | 'carbon' | 'forged_carbon' | 'red' | 'extended';
export type DriveModeType = 'comfort' | 'eco' | 'sport' | 'sport_plus' | 'track' | 'custom';

export type DashboardTrimType =
  | 'walnut'
  | 'dark_walnut'
  | 'carbon'
  | 'forged_carbon'
  | 'titanium'
  | 'aluminum'
  | 'piano_black'
  | 'smoked_chrome'
  | 'bronze'
  | 'copper'
  | 'ceramic';

export type InfotainmentMode =
  | 'navigation'
  | 'telemetry'
  | 'media'
  | 'climate'
  | 'vehicle'
  | 'camera'
  | 'performance'
  | 'settings';

export type ClusterStyle = 'digital' | 'analog' | 'performance' | 'minimal' | 'track';
export type HUDMode = 'off' | 'minimal' | 'performance' | 'navigation';

export type ShifterStyle =
  | 'auto'
  | 'manual_gated'
  | 'manual_h'
  | 'toggle'
  | 'rotary'
  | 'crystal'
  | 'performance';

export type SeatStyle = 'standard' | 'sport' | 'bucket' | 'luxury' | 'racing';
export type SeatBeltColor = 'black' | 'red' | 'blue' | 'yellow' | 'grey';
export type StitchingColor = 'none' | 'gold' | 'red' | 'blue' | 'yellow' | 'white' | 'silver';
export type WindshieldTint = 'clear' | 'light_tint' | 'medium_smoke' | 'dark_smoke' | 'blue_tint' | 'green_tint' | 'iridescent';

// ── Rear Cabin / Multi-Row Seating Types ──
export type SeatingCapacity = '5_seater' | '7_seater' | '8_seater';
export type Row2SeatingType = 'split_bench_40_20_40' | 'executive_captain_chairs' | 'luxury_lounge';
export type Row3SeatingType = 'fold_flat_bench' | 'split_50_50' | 'power_stow';
export type RearEntertainment = 'none' | 'dual_11in_oled' | 'overhead_theater_31in' | 'executive_bundle';
export type RearClimateZone = 'shared' | 'tri_zone' | 'quad_zone_touch';
export type LightingMode = 'day' | 'sunset' | 'night' | 'track_night';

export type CameraPose =
  | 'studio_sport'
  | 'dashboard_center'
  | 'driver'
  | 'driver_close'
  | 'steering'
  | 'cluster'
  | 'infotainment'
  | 'console'
  | 'seats'
  | 'doors'
  | 'vents'
  | 'passenger'
  | 'full_cockpit'
  | 'orbit_360'
  | 'exploded'
  | 'rear_cabin'
  | 'rear_row2'
  | 'rear_row3';

export type DriverHeight = 'low' | 'normal' | 'tall';
export type ActiveConfigPanel =
  | 'overview'
  | 'steering'
  | 'dashboard'
  | 'cluster'
  | 'infotainment'
  | 'display'
  | 'console'
  | 'seats'
  | 'rear_cabin'
  | 'doors'
  | 'summary'
  | 'other';

export interface CockpitThemePreset {
  id: string;
  name: string;
  description: string;
  steeringWheelStyle: SteeringWheelStyle;
  steeringGripMaterial: SteeringGripMaterial;
  steeringColor: string;
  steeringStripe: SteeringStripeStyle;
  paddleShifters: PaddleShifterStyle;
  upperDashPadColor: string;
  dashboardTrimMaterial: DashboardTrimType;
  infotainmentMode: InfotainmentMode;
  clusterStyle: ClusterStyle;
  ambientLightColor: string;
  shifterStyle: ShifterStyle;
  stitchingColor: StitchingColor;
  seatStyle: SeatStyle;
  seatBeltColor: SeatBeltColor;
}

export const COCKPIT_THEME_PRESETS: CockpitThemePreset[] = [
  {
    id: "THEME_OBSIDIAN",
    name: "Obsidian Black Sport",
    description: "Sleek Obsidian Nappa leather, twill carbon trim, gold stitching, and cyan neon lightguides.",
    steeringWheelStyle: "sport",
    steeringGripMaterial: "leather",
    steeringColor: "#17181c",
    steeringStripe: "red",
    paddleShifters: "billet",
    upperDashPadColor: "#17181c",
    dashboardTrimMaterial: "carbon",
    infotainmentMode: "telemetry",
    clusterStyle: "digital",
    ambientLightColor: "#06b6d4",
    shifterStyle: "auto",
    stitchingColor: "gold",
    seatStyle: "sport",
    seatBeltColor: "red",
  },
  {
    id: "THEME_GRAN_TOURISMO",
    name: "Gran Turismo Heritage",
    description: "Rich Cognac Tan leather, Bookmatched American Walnut, analog dials, and warm amber ambient lighting.",
    steeringWheelStyle: "luxury_2spoke",
    steeringGripMaterial: "leather",
    steeringColor: "#9a5b32",
    steeringStripe: "none",
    paddleShifters: "none",
    upperDashPadColor: "#9a5b32",
    dashboardTrimMaterial: "walnut",
    infotainmentMode: "navigation",
    clusterStyle: "analog",
    ambientLightColor: "#f59e0b",
    shifterStyle: "rotary",
    stitchingColor: "gold",
    seatStyle: "luxury",
    seatBeltColor: "black",
  },
  {
    id: "THEME_TRACK",
    name: "GT3 Track Weapon",
    description: "Full Alcantara interior, forged carbon spear, Formula yoke, sequential shifter, and red shift telemetry.",
    steeringWheelStyle: "yoke",
    steeringGripMaterial: "alcantara",
    steeringColor: "#17181c",
    steeringStripe: "yellow",
    paddleShifters: "carbon",
    upperDashPadColor: "#17181c",
    dashboardTrimMaterial: "forged_carbon",
    infotainmentMode: "performance",
    clusterStyle: "track",
    ambientLightColor: "#ef4444",
    shifterStyle: "performance",
    stitchingColor: "red",
    seatStyle: "racing",
    seatBeltColor: "yellow",
  },
  {
    id: "THEME_HERITAGE",
    name: "Classic Stainless & Wood",
    description: "Vintage 4-spoke stainless steel wheel, polished aluminum gate shifter, walnut veneer, and classic dials.",
    steeringWheelStyle: "classic_4spoke",
    steeringGripMaterial: "wood",
    steeringColor: "#9a5b32",
    steeringStripe: "none",
    paddleShifters: "none",
    upperDashPadColor: "#9a5b32",
    dashboardTrimMaterial: "walnut",
    infotainmentMode: "media",
    clusterStyle: "analog",
    ambientLightColor: "#ffffff",
    shifterStyle: "manual_gated",
    stitchingColor: "gold",
    seatStyle: "standard",
    seatBeltColor: "black",
  },
  {
    id: "THEME_EXECUTIVE",
    name: "Executive Crystal Lounge",
    description: "Deep Navy leather, piano black trim, faceted crystal selector, purple ambient lounge, and digital HUD.",
    steeringWheelStyle: "luxury_2spoke",
    steeringGripMaterial: "leather",
    steeringColor: "#1e293b",
    steeringStripe: "none",
    paddleShifters: "billet",
    upperDashPadColor: "#1e293b",
    dashboardTrimMaterial: "piano_black",
    infotainmentMode: "navigation",
    clusterStyle: "digital",
    ambientLightColor: "#a855f7",
    shifterStyle: "crystal",
    stitchingColor: "silver",
    seatStyle: "luxury",
    seatBeltColor: "black",
  },
  {
    id: "THEME_CYBER_SPORT",
    name: "Cyber Sport Electric",
    description: "Charcoal Alcantara, brushed titanium accents, electronic rocker toggle, and electric blue neon.",
    steeringWheelStyle: "gt_3spoke",
    steeringGripMaterial: "perforated",
    steeringColor: "#26282e",
    steeringStripe: "blue",
    paddleShifters: "carbon",
    upperDashPadColor: "#26282e",
    dashboardTrimMaterial: "titanium",
    infotainmentMode: "telemetry",
    clusterStyle: "performance",
    ambientLightColor: "#3b82f6",
    shifterStyle: "toggle",
    stitchingColor: "blue",
    seatStyle: "bucket",
    seatBeltColor: "blue",
  },
];

// ============================================================================
// 4. ENGINEERING CONSEQUENCE CALCULATIONS
// ============================================================================

export interface CockpitEngineeringMetrics {
  totalPriceDelta: number;
  totalWeightDelta: number;
  totalPowerConsumptionW: number;
  luxuryScore: number;
  sportScore: number;
  technologyScore: number;
  comfortScore: number;
  trackScore: number;
}

export function computeCockpitEngineering(state: {
  steeringWheelStyle: SteeringWheelStyle;
  steeringGripMaterial: SteeringGripMaterial;
  dashboardTrimMaterial: DashboardTrimType;
  infotainmentMode: InfotainmentMode;
  clusterStyle: ClusterStyle;
  shifterStyle: ShifterStyle;
  seatStyle: SeatStyle;
  hudMode: HUDMode;
  nightMode: boolean;
}): CockpitEngineeringMetrics {
  let price = 0;
  let weight = 0;
  let power = 120; // Base baseline cabin power

  let lux = 60;
  let sport = 60;
  let tech = 60;
  let comf = 60;
  let track = 40;

  // Steering
  switch (state.steeringWheelStyle) {
    case "formula": price += 3500; weight -= 1.8; sport += 25; track += 35; comf -= 10; break;
    case "yoke": price += 2200; weight -= 1.2; sport += 20; track += 25; break;
    case "gt_3spoke": price += 1400; weight -= 0.6; sport += 15; break;
    case "classic_4spoke": price += 1800; weight += 0.8; lux += 20; sport -= 10; break;
    case "luxury_2spoke": price += 1200; weight += 0.5; lux += 25; comf += 15; break;
    case "performance_4spoke": price += 2800; weight -= 1.4; sport += 20; track += 20; break;
  }

  // Trim
  switch (state.dashboardTrimMaterial) {
    case "forged_carbon": price += 4500; weight -= 3.0; sport += 20; track += 25; break;
    case "carbon": price += 2500; weight -= 2.2; sport += 15; track += 18; break;
    case "walnut": price += 2000; weight += 2.5; lux += 30; comf += 15; break;
    case "dark_walnut": price += 2400; weight += 2.5; lux += 32; break;
    case "titanium": price += 1800; weight -= 1.0; tech += 15; break;
    case "piano_black": price += 800; weight += 0.5; lux += 10; break;
    case "ceramic": price += 2200; weight += 1.0; lux += 25; break;
  }

  // Shifter
  switch (state.shifterStyle) {
    case "crystal": price += 2200; weight += 0.8; lux += 25; break;
    case "manual_gated": price += 1800; weight -= 1.0; sport += 25; track += 15; break;
    case "performance": price += 1500; weight -= 1.5; sport += 20; track += 20; break;
    case "rotary": price += 600; tech += 10; break;
  }

  // Seats
  switch (state.seatStyle) {
    case "racing": price += 4800; weight -= 14.0; sport += 30; track += 35; comf -= 25; break;
    case "bucket": price += 3200; weight -= 8.0; sport += 20; track += 20; break;
    case "luxury": price += 2500; weight += 16.0; lux += 30; comf += 30; power += 90; break;
  }

  // Displays & HUD
  if (state.hudMode !== "off") {
    price += 1200;
    tech += 20;
    power += 25;
  }
  if (state.clusterStyle === "digital" || state.clusterStyle === "track") {
    tech += 15;
    power += 35;
  }

  const clamp = (v: number) => Math.min(100, Math.max(10, Math.round(v)));

  return {
    totalPriceDelta: price,
    totalWeightDelta: Math.round(weight * 10) / 10,
    totalPowerConsumptionW: power,
    luxuryScore: clamp(lux),
    sportScore: clamp(sport),
    technologyScore: clamp(tech),
    comfortScore: clamp(comf),
    trackScore: clamp(track),
  };
}

// ============================================================================
// 5. ZUSTAND STORE INTERFACE
// ============================================================================

export interface InteriorDashboardConfigState {
  // Legacy / 2D Workbench Selections
  selections: Record<FeatureKey, number>;
  interiorColor: string;
  activePreset: string | null;
  metrics: ComputedMetrics;

  // Real-Time 3D Cockpit Configuration State
  steeringWheelStyle: SteeringWheelStyle;
  steeringGripMaterial: SteeringGripMaterial;
  steeringColor: string;
  steeringStripe: SteeringStripeStyle;
  paddleShifters: PaddleShifterStyle;
  driveMode: DriveModeType;

  upperDashPadColor: string;
  dashboardTrimMaterial: DashboardTrimType;
  infotainmentMode: InfotainmentMode;
  clusterStyle: ClusterStyle;
  hudMode: HUDMode;
  ambientLightColor: string;

  shifterStyle: ShifterStyle;
  seatStyle: SeatStyle;
  seatBeltColor: SeatBeltColor;
  stitchingColor: StitchingColor;
  windshieldTint: WindshieldTint;
  lightingMode: LightingMode;
  nightMode: boolean;

  // Rear Cabin / Multi-Row Seating State
  seatingCapacity: SeatingCapacity;
  row2SeatingType: Row2SeatingType;
  row3SeatingType: Row3SeatingType;
  rearEntertainment: RearEntertainment;
  rearClimateZone: RearClimateZone;
  rearHeatedVentilated: boolean;
  rearMassage: boolean;
  rearFoldingTables: boolean;

  cameraPose: CameraPose;
  driverHeight: DriverHeight;
  activePanel: ActiveConfigPanel;
  explodedProgress: number;

  // Link Options
  linkLeather: boolean;
  linkStitching: boolean;
  linkTrim: boolean;
  linkAmbient: boolean;

  // History & Undo/Redo
  history: Partial<InteriorDashboardConfigState>[];
  historyIndex: number;

  // Engineering Derived Properties
  engineering: CockpitEngineeringMetrics;

  // Actions & Mutators
  cycleOption: (feature: FeatureKey, direction: 1 | -1) => void;
  setOption: (feature: FeatureKey, index: number) => void;
  setColor: (hex: string) => void;
  applyPreset: (presetKey: string) => void;
  applyThemePreset: (presetId: string) => void;
  reset: () => void;

  setSteeringWheelStyle: (style: SteeringWheelStyle) => void;
  setSteeringGripMaterial: (mat: SteeringGripMaterial) => void;
  setSteeringColor: (color: string) => void;
  setSteeringStripe: (stripe: SteeringStripeStyle) => void;
  setPaddleShifters: (paddles: PaddleShifterStyle) => void;
  setDriveMode: (mode: DriveModeType) => void;

  setUpperDashPadColor: (color: string) => void;
  setDashboardTrimMaterial: (trim: DashboardTrimType) => void;
  setInfotainmentMode: (mode: InfotainmentMode) => void;
  setClusterStyle: (style: ClusterStyle) => void;
  setHudMode: (hud: HUDMode) => void;
  setAmbientLightColor: (color: string) => void;

  setShifterStyle: (style: ShifterStyle) => void;
  setSeatStyle: (seat: SeatStyle) => void;
  setSeatBeltColor: (belt: SeatBeltColor) => void;
  setStitchingColor: (color: StitchingColor) => void;
  setWindshieldTint: (tint: WindshieldTint) => void;
  setLightingMode: (mode: LightingMode) => void;
  setNightMode: (night: boolean) => void;

  setCameraPose: (pose: CameraPose) => void;
  setDriverHeight: (height: DriverHeight) => void;
  setActivePanel: (panel: ActiveConfigPanel) => void;
  setExplodedProgress: (progress: number) => void;

  setLinkLeather: (link: boolean) => void;
  setLinkStitching: (link: boolean) => void;
  setLinkTrim: (link: boolean) => void;
  setLinkAmbient: (link: boolean) => void;

  // Rear Cabin Setters
  setSeatingCapacity: (cap: SeatingCapacity) => void;
  setRow2SeatingType: (type: Row2SeatingType) => void;
  setRow3SeatingType: (type: Row3SeatingType) => void;
  setRearEntertainment: (ent: RearEntertainment) => void;
  setRearClimateZone: (zone: RearClimateZone) => void;
  setRearHeatedVentilated: (on: boolean) => void;
  setRearMassage: (on: boolean) => void;
  setRearFoldingTables: (on: boolean) => void;

  undo: () => void;
  redo: () => void;
  randomize: () => void;
  exportConfigJson: () => string;
  importConfigJson: (jsonStr: string) => boolean;
}

const DEFAULT_SELECTIONS: Record<FeatureKey, number> = {
  dashboardLayout: 0, instrumentCluster: 0, centerDisplay: 0, steeringWheel: 0,
  seatType: 0, seatMaterial: 0, interiorTrim: 0, ambientLighting: 0,
  infotainmentSystem: 0, climateControl: 0,
};

export function syncSelectionTo3D(feature: FeatureKey, index: number): Partial<InteriorDashboardConfigState> {
  switch (feature) {
    case 'steeringWheel': {
      const styles: SteeringWheelStyle[] = ['classic_4spoke', 'sport', 'yoke'];
      return { steeringWheelStyle: styles[index] ?? 'sport' };
    }
    case 'instrumentCluster': {
      const clusters: ClusterStyle[] = ['analog', 'digital', 'minimal'];
      return { clusterStyle: clusters[index] ?? 'digital' };
    }
    case 'centerDisplay': {
      const modes: InfotainmentMode[] = ['media', 'vehicle', 'navigation'];
      return { infotainmentMode: modes[index] ?? 'navigation' };
    }
    case 'interiorTrim': {
      const trims: DashboardTrimType[] = ['piano_black', 'aluminum', 'carbon', 'walnut'];
      return { dashboardTrimMaterial: trims[index] ?? 'walnut' };
    }
    case 'seatType': {
      const seats: SeatStyle[] = ['standard', 'sport', 'bucket'];
      return { seatStyle: seats[index] ?? 'sport' };
    }
    case 'seatMaterial': {
      const grips: SteeringGripMaterial[] = ['perforated', 'leather', 'alcantara'];
      return { steeringGripMaterial: grips[index] ?? 'leather' };
    }
    case 'ambientLighting': {
      return { ambientLightColor: index === 0 ? 'none' : '#06b6d4' };
    }
    case 'dashboardLayout': {
      return index === 1 ? { cameraPose: 'driver' } : { cameraPose: 'dashboard_center' };
    }
    case 'infotainmentSystem': {
      const sysModes: InfotainmentMode[] = ['media', 'navigation', 'telemetry'];
      return { infotainmentMode: sysModes[index] ?? 'navigation' };
    }
    default:
      return {};
  }
}

export function sync3DToSelections(
  patch: Partial<InteriorDashboardConfigState>,
  current: Record<FeatureKey, number>
): Record<FeatureKey, number> {
  const next = { ...current };
  if (patch.steeringWheelStyle) {
    if (patch.steeringWheelStyle === 'classic_4spoke' || patch.steeringWheelStyle === 'luxury_2spoke') next.steeringWheel = 0;
    else if (patch.steeringWheelStyle === 'yoke' || patch.steeringWheelStyle === 'formula') next.steeringWheel = 2;
    else next.steeringWheel = 1;
  }
  if (patch.clusterStyle) {
    if (patch.clusterStyle === 'analog') next.instrumentCluster = 0;
    else if (patch.clusterStyle === 'digital') next.instrumentCluster = 1;
    else next.instrumentCluster = 2;
  }
  if (patch.infotainmentMode) {
    if (patch.infotainmentMode === 'media' || patch.infotainmentMode === 'settings') next.centerDisplay = 0;
    else if (patch.infotainmentMode === 'navigation' || patch.infotainmentMode === 'telemetry' || patch.infotainmentMode === 'performance') next.centerDisplay = 2;
    else next.centerDisplay = 1;
  }
  if (patch.dashboardTrimMaterial) {
    if (patch.dashboardTrimMaterial === 'piano_black') next.interiorTrim = 0;
    else if (patch.dashboardTrimMaterial === 'aluminum' || patch.dashboardTrimMaterial === 'titanium' || patch.dashboardTrimMaterial === 'smoked_chrome') next.interiorTrim = 1;
    else if (patch.dashboardTrimMaterial === 'carbon' || patch.dashboardTrimMaterial === 'forged_carbon') next.interiorTrim = 2;
    else next.interiorTrim = 3;
  }
  if (patch.seatStyle) {
    if (patch.seatStyle === 'standard' || patch.seatStyle === 'luxury') next.seatType = 0;
    else if (patch.seatStyle === 'sport') next.seatType = 1;
    else next.seatType = 2;
  }
  if (patch.steeringGripMaterial) {
    if (patch.steeringGripMaterial === 'leather') next.seatMaterial = 1;
    else if (patch.steeringGripMaterial === 'alcantara' || patch.steeringGripMaterial === 'suede') next.seatMaterial = 2;
    else next.seatMaterial = 0;
  }
  if (patch.ambientLightColor !== undefined) {
    next.ambientLighting = patch.ambientLightColor === 'none' ? 0 : 1;
  }
  return next;
}

export const useInteriorDashboardConfigStore = create<InteriorDashboardConfigState>(
  (set, get) => {
    const initialEngineering = computeCockpitEngineering({
      steeringWheelStyle: 'sport',
      steeringGripMaterial: 'leather',
      dashboardTrimMaterial: 'walnut',
      infotainmentMode: 'navigation',
      clusterStyle: 'digital',
      shifterStyle: 'auto',
      seatStyle: 'sport',
      hudMode: 'off',
      nightMode: false,
    });

    const getSnapshot = (s: InteriorDashboardConfigState): Partial<InteriorDashboardConfigState> => ({
      steeringWheelStyle: s.steeringWheelStyle,
      steeringGripMaterial: s.steeringGripMaterial,
      steeringColor: s.steeringColor,
      steeringStripe: s.steeringStripe,
      paddleShifters: s.paddleShifters,
      driveMode: s.driveMode,
      upperDashPadColor: s.upperDashPadColor,
      dashboardTrimMaterial: s.dashboardTrimMaterial,
      infotainmentMode: s.infotainmentMode,
      clusterStyle: s.clusterStyle,
      hudMode: s.hudMode,
      ambientLightColor: s.ambientLightColor,
      shifterStyle: s.shifterStyle,
      seatStyle: s.seatStyle,
      seatBeltColor: s.seatBeltColor,
      stitchingColor: s.stitchingColor,
      windshieldTint: s.windshieldTint,
      lightingMode: s.lightingMode,
      nightMode: s.nightMode,
    });

    const pushHistory = (updatedDelta: Partial<InteriorDashboardConfigState>) => {
      const state = get();
      const currentSnapshot = getSnapshot(state);
      let nextHistory = state.history.slice(0, state.historyIndex + 1);
      if (nextHistory.length === 0) {
        nextHistory.push(currentSnapshot);
      }
      const newSnapshot = { ...currentSnapshot, ...updatedDelta };
      nextHistory.push(newSnapshot);
      if (nextHistory.length > 25) {
        nextHistory = nextHistory.slice(nextHistory.length - 25);
      }
      return {
        history: nextHistory,
        historyIndex: nextHistory.length - 1,
      };
    };

    return {
      selections: { ...DEFAULT_SELECTIONS },
      interiorColor: "#9a5b32",
      activePreset: null,
      metrics: computeMetrics(DEFAULT_SELECTIONS),

      // 3D Master Cockpit Defaults
      steeringWheelStyle: 'sport',
      steeringGripMaterial: 'leather',
      steeringColor: '#17181c',
      steeringStripe: 'red',
      paddleShifters: 'billet',
      driveMode: 'sport',

      upperDashPadColor: '#17181c',
      dashboardTrimMaterial: 'walnut',
      infotainmentMode: 'navigation',
      clusterStyle: 'digital',
      hudMode: 'off',
      ambientLightColor: '#06b6d4',

      shifterStyle: 'auto',
      seatStyle: 'sport',
      seatBeltColor: 'black',
      stitchingColor: 'gold',
      windshieldTint: 'clear',
      lightingMode: 'day',
      nightMode: false,

      // Rear Cabin Defaults
      seatingCapacity: '5_seater',
      row2SeatingType: 'split_bench_40_20_40',
      row3SeatingType: 'fold_flat_bench',
      rearEntertainment: 'none',
      rearClimateZone: 'shared',
      rearHeatedVentilated: false,
      rearMassage: false,
      rearFoldingTables: false,

      cameraPose: 'studio_sport',
      driverHeight: 'normal',
      activePanel: 'overview',
      explodedProgress: 0.0,

      linkLeather: true,
      linkStitching: true,
      linkTrim: true,
      linkAmbient: true,

      history: [],
      historyIndex: -1,

      engineering: initialEngineering,

      cycleOption: (feature, direction) =>
        set((state) => {
          const optCount = CONFIG_OPTIONS[feature].options.length;
          const current = state.selections[feature] ?? 0;
          const next = (current + direction + optCount) % optCount;
          const newSelections = { ...state.selections, [feature]: next };
          const synced3D = syncSelectionTo3D(feature, next);
          const newEng = computeCockpitEngineering({ ...state, ...synced3D });
          return {
            selections: newSelections,
            metrics: computeMetrics(newSelections),
            activePreset: null,
            ...synced3D,
            engineering: newEng,
            ...pushHistory(synced3D),
          };
        }),

      setOption: (feature, index) =>
        set((state) => {
          const optCount = CONFIG_OPTIONS[feature].options.length;
          const clamped = Math.max(0, Math.min(index, optCount - 1));
          const newSelections = { ...state.selections, [feature]: clamped };
          const synced3D = syncSelectionTo3D(feature, clamped);
          const newEng = computeCockpitEngineering({ ...state, ...synced3D });
          return {
            selections: newSelections,
            metrics: computeMetrics(newSelections),
            activePreset: null,
            ...synced3D,
            engineering: newEng,
            ...pushHistory(synced3D),
          };
        }),

      setColor: (hex) =>
        set({
          interiorColor: hex,
          upperDashPadColor: hex,
          steeringColor: hex,
        }),

      applyPreset: (presetKey) =>
        set((state) => {
          const preset = INTERIOR_PRESETS[presetKey];
          if (!preset) return {};
          const newSelections = { ...preset.selections };
          const syncedWheel = syncSelectionTo3D('steeringWheel', newSelections.steeringWheel);
          const syncedCluster = syncSelectionTo3D('instrumentCluster', newSelections.instrumentCluster);
          const syncedDisplay = syncSelectionTo3D('centerDisplay', newSelections.centerDisplay);
          const syncedTrim = syncSelectionTo3D('interiorTrim', newSelections.interiorTrim);
          const syncedSeat = syncSelectionTo3D('seatType', newSelections.seatType);
          const syncedAmbient = syncSelectionTo3D('ambientLighting', newSelections.ambientLighting);
          const combined3D = {
            ...syncedWheel,
            ...syncedCluster,
            ...syncedDisplay,
            ...syncedTrim,
            ...syncedSeat,
            ...syncedAmbient,
            interiorColor: preset.color,
            upperDashPadColor: preset.color,
            steeringColor: preset.color,
          };
          return {
            selections: newSelections,
            activePreset: presetKey,
            metrics: computeMetrics(newSelections),
            ...combined3D,
            engineering: computeCockpitEngineering({ ...state, ...combined3D }),
            ...pushHistory(combined3D),
          };
        }),

      applyThemePreset: (presetId) =>
        set((state) => {
          const theme = COCKPIT_THEME_PRESETS.find((t) => t.id === presetId);
          if (!theme) return {};
          const newEng = computeCockpitEngineering({
            ...state,
            steeringWheelStyle: theme.steeringWheelStyle,
            steeringGripMaterial: theme.steeringGripMaterial,
            dashboardTrimMaterial: theme.dashboardTrimMaterial,
            infotainmentMode: theme.infotainmentMode,
            clusterStyle: theme.clusterStyle,
            shifterStyle: theme.shifterStyle,
            seatStyle: theme.seatStyle,
            hudMode: state.hudMode,
            nightMode: state.nightMode,
          });
          const newSelections = sync3DToSelections(theme, state.selections);
          return {
            steeringWheelStyle: theme.steeringWheelStyle,
            steeringGripMaterial: theme.steeringGripMaterial,
            steeringColor: theme.steeringColor,
            steeringStripe: theme.steeringStripe,
            paddleShifters: theme.paddleShifters,
            upperDashPadColor: theme.upperDashPadColor,
            dashboardTrimMaterial: theme.dashboardTrimMaterial,
            infotainmentMode: theme.infotainmentMode,
            clusterStyle: theme.clusterStyle,
            ambientLightColor: theme.ambientLightColor,
            shifterStyle: theme.shifterStyle,
            stitchingColor: theme.stitchingColor,
            seatStyle: theme.seatStyle,
            seatBeltColor: theme.seatBeltColor,
            selections: newSelections,
            metrics: computeMetrics(newSelections),
            engineering: newEng,
            ...pushHistory({
              steeringWheelStyle: theme.steeringWheelStyle,
              dashboardTrimMaterial: theme.dashboardTrimMaterial,
              shifterStyle: theme.shifterStyle,
            }),
          };
        }),

      reset: () =>
        set({
          selections: { ...DEFAULT_SELECTIONS },
          interiorColor: "#9a5b32",
          activePreset: null,
          metrics: computeMetrics(DEFAULT_SELECTIONS),
          steeringWheelStyle: 'sport',
          steeringGripMaterial: 'leather',
          steeringColor: '#17181c',
          steeringStripe: 'red',
          paddleShifters: 'billet',
          driveMode: 'sport',
          upperDashPadColor: '#17181c',
          dashboardTrimMaterial: 'walnut',
          infotainmentMode: 'navigation',
          clusterStyle: 'digital',
          hudMode: 'off',
          ambientLightColor: '#06b6d4',
          shifterStyle: 'auto',
          seatStyle: 'sport',
          seatBeltColor: 'black',
          stitchingColor: 'gold',
          windshieldTint: 'clear',
          lightingMode: 'day',
          nightMode: false,
          // Rear Cabin Reset
          seatingCapacity: '5_seater',
          row2SeatingType: 'split_bench_40_20_40',
          row3SeatingType: 'fold_flat_bench',
          rearEntertainment: 'none',
          rearClimateZone: 'shared',
          rearHeatedVentilated: false,
          rearMassage: false,
          rearFoldingTables: false,
          cameraPose: 'studio_sport',
          driverHeight: 'normal',
          activePanel: 'overview',
          explodedProgress: 0.0,
          engineering: initialEngineering,
          history: [],
          historyIndex: -1,
        }),

      setSteeringWheelStyle: (style) =>
        set((state) => {
          const newSelections = sync3DToSelections({ steeringWheelStyle: style }, state.selections);
          const newEng = computeCockpitEngineering({ ...state, steeringWheelStyle: style });
          return {
            steeringWheelStyle: style,
            selections: newSelections,
            metrics: computeMetrics(newSelections),
            engineering: newEng,
            ...pushHistory({ steeringWheelStyle: style }),
          };
        }),

      setSteeringGripMaterial: (mat) =>
        set((state) => {
          const newSelections = sync3DToSelections({ steeringGripMaterial: mat }, state.selections);
          const newEng = computeCockpitEngineering({ ...state, steeringGripMaterial: mat });
          return {
            steeringGripMaterial: mat,
            selections: newSelections,
            metrics: computeMetrics(newSelections),
            engineering: newEng,
          };
        }),

      setSteeringColor: (color) =>
        set((state) => ({
          steeringColor: color,
          ...(state.linkLeather ? { upperDashPadColor: color, interiorColor: color } : {}),
        })),

      setSteeringStripe: (stripe) => set({ steeringStripe: stripe }),
      setPaddleShifters: (paddles) => set({ paddleShifters: paddles }),
      setDriveMode: (mode) => set({ driveMode: mode }),

      setUpperDashPadColor: (color) =>
        set((state) => ({
          upperDashPadColor: color,
          interiorColor: color,
          ...(state.linkLeather ? { steeringColor: color } : {}),
        })),

      setDashboardTrimMaterial: (trim) =>
        set((state) => {
          const newSelections = sync3DToSelections({ dashboardTrimMaterial: trim }, state.selections);
          const newEng = computeCockpitEngineering({ ...state, dashboardTrimMaterial: trim });
          return {
            dashboardTrimMaterial: trim,
            selections: newSelections,
            metrics: computeMetrics(newSelections),
            engineering: newEng,
            ...pushHistory({ dashboardTrimMaterial: trim }),
          };
        }),

      setInfotainmentMode: (mode) =>
        set((state) => {
          const newSelections = sync3DToSelections({ infotainmentMode: mode }, state.selections);
          const newEng = computeCockpitEngineering({ ...state, infotainmentMode: mode });
          return {
            infotainmentMode: mode,
            selections: newSelections,
            metrics: computeMetrics(newSelections),
            engineering: newEng,
          };
        }),

      setClusterStyle: (style) =>
        set((state) => {
          const newSelections = sync3DToSelections({ clusterStyle: style }, state.selections);
          const newEng = computeCockpitEngineering({ ...state, clusterStyle: style });
          return {
            clusterStyle: style,
            selections: newSelections,
            metrics: computeMetrics(newSelections),
            engineering: newEng,
          };
        }),

      setHudMode: (hud) =>
        set((state) => {
          const newEng = computeCockpitEngineering({ ...state, hudMode: hud });
          return { hudMode: hud, engineering: newEng };
        }),

      setAmbientLightColor: (color) =>
        set((state) => {
          const newSelections = sync3DToSelections({ ambientLightColor: color }, state.selections);
          return {
            ambientLightColor: color,
            selections: newSelections,
            metrics: computeMetrics(newSelections),
          };
        }),

      setShifterStyle: (style) =>
        set((state) => {
          const newEng = computeCockpitEngineering({ ...state, shifterStyle: style });
          return {
            shifterStyle: style,
            cameraPose: "console",
            engineering: newEng,
            ...pushHistory({ shifterStyle: style }),
          };
        }),

      setSeatStyle: (seat) =>
        set((state) => {
          const newSelections = sync3DToSelections({ seatStyle: seat }, state.selections);
          const newEng = computeCockpitEngineering({ ...state, seatStyle: seat });
          return {
            seatStyle: seat,
            selections: newSelections,
            metrics: computeMetrics(newSelections),
            cameraPose: "seats",
            engineering: newEng,
            ...pushHistory({ seatStyle: seat }),
          };
        }),

      setSeatBeltColor: (belt) =>
        set({
          seatBeltColor: belt,
          cameraPose: "seats",
        }),
      setStitchingColor: (color) => set({ stitchingColor: color }),
      setWindshieldTint: (tint) => set({ windshieldTint: tint }),

      setLightingMode: (mode) =>
        set({
          lightingMode: mode,
          nightMode: mode === "night" || mode === "track_night",
        }),

      setNightMode: (night) =>
        set({
          nightMode: night,
          lightingMode: night ? "night" : "day",
        }),

      setCameraPose: (pose) => set({ cameraPose: pose }),
      setDriverHeight: (height) => set({ driverHeight: height }),
      setActivePanel: (panel) =>
        set((state) => {
          let pose = state.cameraPose;
          if (panel === "overview") pose = "studio_sport";
          else if (panel === "seats") pose = "seats";
          else if (panel === "steering") pose = "steering";
          else if (panel === "cluster") pose = "cluster";
          else if (panel === "infotainment" || panel === "display") pose = "infotainment";
          else if (panel === "console") pose = "console";
          else if (panel === "doors") pose = "doors";
          else if (panel === "dashboard") pose = "dashboard_center";
          else if (panel === "rear_cabin") pose = "rear_cabin";
          else if (panel === "summary") pose = "studio_sport";
          return { activePanel: panel, cameraPose: pose };
        }),
      setExplodedProgress: (prog) => set({ explodedProgress: Math.max(0, Math.min(1, prog)) }),

      setLinkLeather: (link) => set({ linkLeather: link }),
      setLinkStitching: (link) => set({ linkStitching: link }),
      setLinkTrim: (link) => set({ linkTrim: link }),
      setLinkAmbient: (link) => set({ linkAmbient: link }),

      // Rear Cabin Setters
      setSeatingCapacity: (cap) =>
        set((state) => {
          // Auto-adjust row3 visibility: if 5-seater, row3 is irrelevant
          const updates: Partial<InteriorDashboardConfigState> = {
            seatingCapacity: cap,
            cameraPose: 'rear_cabin' as CameraPose,
          };
          if (cap === '5_seater') {
            updates.row3SeatingType = 'fold_flat_bench';
          }
          return updates;
        }),
      setRow2SeatingType: (type) => set({ row2SeatingType: type, cameraPose: 'rear_row2' as CameraPose }),
      setRow3SeatingType: (type) => set({ row3SeatingType: type, cameraPose: 'rear_row3' as CameraPose }),
      setRearEntertainment: (ent) => set({ rearEntertainment: ent }),
      setRearClimateZone: (zone) => set({ rearClimateZone: zone }),
      setRearHeatedVentilated: (on) => set({ rearHeatedVentilated: on }),
      setRearMassage: (on) => set({ rearMassage: on }),
      setRearFoldingTables: (on) => set({ rearFoldingTables: on }),

      undo: () =>
        set((state) => {
          if (state.historyIndex <= 0) return {};
          const prevIdx = state.historyIndex - 1;
          const prevState = state.history[prevIdx];
          const updated = {
            ...state,
            ...prevState,
            historyIndex: prevIdx,
          };
          return {
            ...updated,
            engineering: computeCockpitEngineering(updated),
          };
        }),

      redo: () =>
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return {};
          const nextIdx = state.historyIndex + 1;
          const nextState = state.history[nextIdx];
          const updated = {
            ...state,
            ...nextState,
            historyIndex: nextIdx,
          };
          return {
            ...updated,
            engineering: computeCockpitEngineering(updated),
          };
        }),

      randomize: () =>
        set((state) => {
          const wheels: SteeringWheelStyle[] = ['sport', 'gt_3spoke', 'yoke', 'formula', 'luxury_2spoke', 'classic_4spoke', 'performance_4spoke'];
          const trims: DashboardTrimType[] = ['walnut', 'dark_walnut', 'carbon', 'forged_carbon', 'titanium', 'aluminum', 'piano_black'];
          const shifters: ShifterStyle[] = ['auto', 'manual_gated', 'manual_h', 'toggle', 'rotary', 'crystal', 'performance'];
          const clusters: ClusterStyle[] = ['digital', 'analog', 'performance', 'track'];
          const ambients = ['#06b6d4', '#ef4444', '#f59e0b', '#3b82f6', '#a855f7', '#10b981', '#ffffff'];

          const rWheel = wheels[Math.floor(Math.random() * wheels.length)];
          const rTrim = trims[Math.floor(Math.random() * trims.length)];
          const rShifter = shifters[Math.floor(Math.random() * shifters.length)];
          const rCluster = clusters[Math.floor(Math.random() * clusters.length)];
          const rAmbient = ambients[Math.floor(Math.random() * ambients.length)];

          const newEng = computeCockpitEngineering({
            ...state,
            steeringWheelStyle: rWheel,
            dashboardTrimMaterial: rTrim,
            shifterStyle: rShifter,
            clusterStyle: rCluster,
          });

          return {
            steeringWheelStyle: rWheel,
            dashboardTrimMaterial: rTrim,
            shifterStyle: rShifter,
            clusterStyle: rCluster,
            ambientLightColor: rAmbient,
            engineering: newEng,
            ...pushHistory({
              steeringWheelStyle: rWheel,
              dashboardTrimMaterial: rTrim,
              shifterStyle: rShifter,
            }),
          };
        }),

      exportConfigJson: () => {
        const state = get();
        return JSON.stringify(
          {
            version: "5.2",
            timestamp: Date.now(),
            steeringWheelStyle: state.steeringWheelStyle,
            steeringGripMaterial: state.steeringGripMaterial,
            steeringColor: state.steeringColor,
            steeringStripe: state.steeringStripe,
            paddleShifters: state.paddleShifters,
            driveMode: state.driveMode,
            upperDashPadColor: state.upperDashPadColor,
            dashboardTrimMaterial: state.dashboardTrimMaterial,
            infotainmentMode: state.infotainmentMode,
            clusterStyle: state.clusterStyle,
            hudMode: state.hudMode,
            ambientLightColor: state.ambientLightColor,
            shifterStyle: state.shifterStyle,
            seatStyle: state.seatStyle,
            seatBeltColor: state.seatBeltColor,
            stitchingColor: state.stitchingColor,
            windshieldTint: state.windshieldTint,
            lightingMode: state.lightingMode,
            nightMode: state.nightMode,
          },
          null,
          2,
        );
      },

      importConfigJson: (jsonStr: string) => {
        try {
          const parsed = JSON.parse(jsonStr);
          if (!parsed || typeof parsed !== "object") return false;
          set((state) => {
            const updated = {
              ...state,
              ...parsed,
            };
            const newEng = computeCockpitEngineering(updated);
            return {
              ...updated,
              engineering: newEng,
            };
          });
          return true;
        } catch (err) {
          console.error("importConfigJson exception:", err);
          return false;
        }
      },
    };
  },
);

export function getSelectedOptionLabel(
  feature: FeatureKey,
  selections: Record<FeatureKey, number>,
): string {
  const idx = selections[feature] ?? 0;
  return CONFIG_OPTIONS[feature].options[idx]?.label ?? "Unknown";
}

export function getSelectedOption(
  feature: FeatureKey,
  selections: Record<FeatureKey, number>,
): OptionDef {
  const idx = selections[feature] ?? 0;
  return CONFIG_OPTIONS[feature].options[idx] ?? CONFIG_OPTIONS[feature].options[0];
}
