/**
 * ============================================================================
 * INTERIOR DASHBOARD CONFIGURATOR — REACTIVE ZUSTAND STATE STORE
 * ============================================================================
 * Manages the real-time interior configuration state with:
 * - 10 Configurable Features (Dashboard, Cluster, Display, Steering, etc.)
 * - Stat Modifier Database per option (comfort, ergonomics, quality, etc.)
 * - Computed Metrics Aggregation with clamped 0-100% ranges
 * - 6 Curated Presets (Original 80s, Sport, Luxury, Minimalist, Rally, Classic Wood)
 * - Color Palette System with 6 interior swatches
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
// 2. CONFIG OPTIONS DATABASE
// ============================================================================

export const CONFIG_OPTIONS: Record<FeatureKey, FeatureConfig> = {
  dashboardLayout: {
    label: "Dashboard Layout",
    options: [
      {
        label: "Classic 80s",
        stats: { ergonomics: 5, quality: 3, perceivedValue: 2, reliability: 8, cost: 400, weight: 22 },
        visualHints: { shape: "classic" },
      },
      {
        label: "Driver Focused",
        stats: { ergonomics: 12, quality: 8, perceivedValue: 6, reliability: 5, cost: 950, weight: 18 },
        visualHints: { shape: "driver_focused" },
      },
      {
        label: "Minimalist",
        stats: { ergonomics: 8, quality: 10, perceivedValue: 9, marketAppeal: 6, cost: 1100, weight: 14 },
        visualHints: { shape: "minimalist" },
      },
    ],
  },
  instrumentCluster: {
    label: "Instrument Cluster",
    options: [
      {
        label: "Analog",
        stats: { reliability: 12, infotainment: 2, perceivedValue: 3, cost: 150, weight: 5 },
        visualHints: { clusterType: "analog" },
      },
      {
        label: "Digital",
        stats: { reliability: 6, infotainment: 10, perceivedValue: 6, quality: 4, cost: 750, weight: 3 },
        visualHints: { clusterType: "digital" },
      },
      {
        label: "HUD Display",
        stats: { reliability: 3, infotainment: 14, perceivedValue: 10, quality: 7, marketAppeal: 5, cost: 1200, weight: 2 },
        visualHints: { clusterType: "hud" },
      },
    ],
  },
  centerDisplay: {
    label: "Center Display",
    options: [
      {
        label: "None",
        stats: { infotainment: 0, cost: 0, weight: 0 },
        visualHints: { screenSize: 0 },
      },
      {
        label: '8"',
        stats: { infotainment: 6, perceivedValue: 3, marketAppeal: 3, cost: 400, weight: 2 },
        visualHints: { screenSize: 8 },
      },
      {
        label: '12"',
        stats: { infotainment: 12, perceivedValue: 7, marketAppeal: 6, quality: 3, cost: 900, weight: 4 },
        visualHints: { screenSize: 12 },
      },
    ],
  },
  steeringWheel: {
    label: "Steering Wheel",
    options: [
      {
        label: "2-Spoke",
        stats: { ergonomics: 5, comfort: 4, cost: 120, weight: 5 },
        visualHints: { spokeCount: 2 },
      },
      {
        label: "Sport",
        stats: { ergonomics: 10, comfort: 6, quality: 4, perceivedValue: 4, cost: 380, weight: 4 },
        visualHints: { spokeCount: 3 },
      },
      {
        label: "Yoke Track",
        stats: { ergonomics: 4, comfort: 2, quality: 7, perceivedValue: 8, marketAppeal: 5, infotainment: 3, cost: 600, weight: 3 },
        visualHints: { spokeCount: 0 },
      },
    ],
  },
  seatType: {
    label: "Seat Type",
    options: [
      {
        label: "Standard Seats",
        stats: { comfort: 6, ergonomics: 4, cost: 300, weight: 18 },
      },
      {
        label: "Sport Seats",
        stats: { comfort: 8, ergonomics: 8, quality: 4, perceivedValue: 5, marketAppeal: 4, cost: 800, weight: 16 },
      },
      {
        label: "Racing Buckets",
        stats: { comfort: 2, ergonomics: 10, quality: 8, perceivedValue: 8, marketAppeal: 6, cost: 1400, weight: 12 },
      },
    ],
  },
  seatMaterial: {
    label: "Seat Material",
    options: [
      {
        label: "Cloth",
        stats: { comfort: 4, quality: 2, perceivedValue: 1, cost: 200, weight: 1 },
      },
      {
        label: "Leather",
        stats: { comfort: 8, quality: 8, perceivedValue: 8, marketAppeal: 6, cost: 950, weight: 3 },
      },
      {
        label: "Alcantara",
        stats: { comfort: 10, quality: 10, perceivedValue: 10, marketAppeal: 8, cost: 1400, weight: 2 },
      },
    ],
  },
  interiorTrim: {
    label: "Interior Trim",
    options: [
      {
        label: "Plastic",
        stats: { quality: 1, perceivedValue: 0, cost: 50, weight: 4 },
      },
      {
        label: "Carbon Fiber",
        stats: { quality: 8, perceivedValue: 7, marketAppeal: 5, cost: 600, weight: 2 },
      },
      {
        label: "Aluminum",
        stats: { quality: 6, perceivedValue: 6, marketAppeal: 4, cost: 350, weight: 5 },
      },
      {
        label: "Wood",
        stats: { quality: 7, perceivedValue: 8, comfort: 2, marketAppeal: 3, cost: 450, weight: 4 },
      },
    ],
  },
  ambientLighting: {
    label: "Ambient Lighting",
    options: [
      {
        label: "Disabled",
        stats: { perceivedValue: 0, cost: 0, weight: 0 },
        visualHints: { glowColor: "transparent", enabled: false },
      },
      {
        label: "Enabled",
        stats: { perceivedValue: 6, marketAppeal: 4, quality: 2, cost: 250, weight: 1 },
        visualHints: { glowColor: "#00e5ff", enabled: true },
      },
    ],
  },
  infotainmentSystem: {
    label: "Infotainment System",
    options: [
      {
        label: "Cassette Radio",
        stats: { infotainment: 2, reliability: 6, cost: 80, weight: 3 },
      },
      {
        label: "CD / GPS Nav",
        stats: { infotainment: 6, reliability: 4, perceivedValue: 3, cost: 350, weight: 4 },
      },
      {
        label: "Premium",
        stats: { infotainment: 10, reliability: 3, perceivedValue: 6, marketAppeal: 5, quality: 3, cost: 800, weight: 5 },
      },
      {
        label: "Digital Cockpit",
        stats: { infotainment: 14, reliability: 2, perceivedValue: 9, marketAppeal: 8, quality: 6, cost: 1400, weight: 6 },
      },
    ],
  },
  climateControl: {
    label: "Climate Control",
    options: [
      {
        label: "Manual",
        stats: { comfort: 2, reliability: 6, cost: 100, weight: 3 },
      },
      {
        label: "Dual Zone",
        stats: { comfort: 6, reliability: 4, perceivedValue: 4, quality: 3, cost: 450, weight: 5 },
      },
      {
        label: "Quad Zone",
        stats: { comfort: 9, reliability: 3, perceivedValue: 6, quality: 5, marketAppeal: 3, cost: 800, weight: 7 },
      },
    ],
  },
};

// ============================================================================
// 3. BASE STATS
// ============================================================================

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

// ============================================================================
// 4. COLOR PALETTE
// ============================================================================

export const INTERIOR_COLOR_SWATCHES: InteriorColorSwatch[] = [
  { name: "Charcoal", hex: "#22272e" },
  { name: "Cognac Tan", hex: "#9a5b32" },
  { name: "Crimson", hex: "#7f1d1d" },
  { name: "Dark Navy", hex: "#1e293b" },
  { name: "Cream Beige", hex: "#d4c5a9" },
  { name: "Steel Blue", hex: "#4a6fa5" },
];

// ============================================================================
// 5. CURATED PRESETS
// ============================================================================

export const INTERIOR_PRESETS: Record<string, PresetDef> = {
  ORIGINAL_80S: {
    name: "ORIGINAL 80s",
    selections: {
      dashboardLayout: 0, instrumentCluster: 0, centerDisplay: 0, steeringWheel: 0,
      seatType: 0, seatMaterial: 0, interiorTrim: 0, ambientLighting: 0,
      infotainmentSystem: 0, climateControl: 0,
    },
    color: "#9a5b32",
  },
  SPORT_80S: {
    name: "SPORT 80s",
    selections: {
      dashboardLayout: 1, instrumentCluster: 1, centerDisplay: 1, steeringWheel: 1,
      seatType: 1, seatMaterial: 1, interiorTrim: 1, ambientLighting: 1,
      infotainmentSystem: 1, climateControl: 1,
    },
    color: "#22272e",
  },
  LUXURY_80S: {
    name: "LUXURY 80s",
    selections: {
      dashboardLayout: 2, instrumentCluster: 2, centerDisplay: 2, steeringWheel: 1,
      seatType: 1, seatMaterial: 2, interiorTrim: 3, ambientLighting: 1,
      infotainmentSystem: 2, climateControl: 2,
    },
    color: "#1e293b",
  },
  MINIMALIST: {
    name: "MINIMALIST",
    selections: {
      dashboardLayout: 2, instrumentCluster: 1, centerDisplay: 1, steeringWheel: 2,
      seatType: 0, seatMaterial: 0, interiorTrim: 2, ambientLighting: 0,
      infotainmentSystem: 1, climateControl: 0,
    },
    color: "#22272e",
  },
  RALLY_80S: {
    name: "RALLY 80s",
    selections: {
      dashboardLayout: 1, instrumentCluster: 0, centerDisplay: 0, steeringWheel: 1,
      seatType: 2, seatMaterial: 0, interiorTrim: 1, ambientLighting: 0,
      infotainmentSystem: 0, climateControl: 0,
    },
    color: "#7f1d1d",
  },
  CLASSIC_WOOD: {
    name: "CLASSIC WOOD",
    selections: {
      dashboardLayout: 0, instrumentCluster: 0, centerDisplay: 0, steeringWheel: 0,
      seatType: 0, seatMaterial: 1, interiorTrim: 3, ambientLighting: 0,
      infotainmentSystem: 0, climateControl: 0,
    },
    color: "#9a5b32",
  },
};

// ============================================================================
// 6. METRICS COMPUTATION
// ============================================================================

export function computeMetrics(
  selections: Record<FeatureKey, number>,
): ComputedMetrics {
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
    const mods = option.stats;
    for (const [statKey, val] of Object.entries(mods)) {
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

  const avg =
    (comfort + ergonomics + quality + perceivedValue + reliability + infotainment + marketAppeal) / 7;

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
// 7. ZUSTAND STORE
// ============================================================================

export interface InteriorDashboardConfigState {
  selections: Record<FeatureKey, number>;
  interiorColor: string;
  activePreset: string | null;
  metrics: ComputedMetrics;

  cycleOption: (feature: FeatureKey, direction: 1 | -1) => void;
  setOption: (feature: FeatureKey, index: number) => void;
  setColor: (hex: string) => void;
  applyPreset: (presetKey: string) => void;
  reset: () => void;
}

const DEFAULT_SELECTIONS: Record<FeatureKey, number> = {
  dashboardLayout: 0, instrumentCluster: 0, centerDisplay: 0, steeringWheel: 0,
  seatType: 0, seatMaterial: 0, interiorTrim: 0, ambientLighting: 0,
  infotainmentSystem: 0, climateControl: 0,
};

const DEFAULT_COLOR = "#9a5b32";

export const useInteriorDashboardConfigStore = create<InteriorDashboardConfigState>(
  (set) => ({
    selections: { ...DEFAULT_SELECTIONS },
    interiorColor: DEFAULT_COLOR,
    activePreset: null,
    metrics: computeMetrics(DEFAULT_SELECTIONS),

    cycleOption: (feature, direction) =>
      set((state) => {
        const optCount = CONFIG_OPTIONS[feature].options.length;
        const current = state.selections[feature] ?? 0;
        const next = (current + direction + optCount) % optCount;
        const newSelections = { ...state.selections, [feature]: next };
        return {
          selections: newSelections,
          metrics: computeMetrics(newSelections),
          activePreset: null,
        };
      }),

    setOption: (feature, index) =>
      set((state) => {
        const optCount = CONFIG_OPTIONS[feature].options.length;
        const clamped = Math.max(0, Math.min(index, optCount - 1));
        const newSelections = { ...state.selections, [feature]: clamped };
        return {
          selections: newSelections,
          metrics: computeMetrics(newSelections),
          activePreset: null,
        };
      }),

    setColor: (hex) => set({ interiorColor: hex }),

    applyPreset: (presetKey) =>
      set(() => {
        const preset = INTERIOR_PRESETS[presetKey];
        if (!preset) return {};
        const newSelections = { ...preset.selections };
        return {
          selections: newSelections,
          interiorColor: preset.color,
          activePreset: presetKey,
          metrics: computeMetrics(newSelections),
        };
      }),

    reset: () =>
      set({
        selections: { ...DEFAULT_SELECTIONS },
        interiorColor: DEFAULT_COLOR,
        activePreset: null,
        metrics: computeMetrics(DEFAULT_SELECTIONS),
      }),
  }),
);

// ============================================================================
// 8. HELPERS
// ============================================================================

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
