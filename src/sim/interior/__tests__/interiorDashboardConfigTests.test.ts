/**
 * ============================================================================
 * INTERIOR DASHBOARD CONFIGURATOR — UNIT TESTS
 * ============================================================================
 * Tests the Zustand store logic:
 * 1. Default state initialization
 * 2. Option cycling (forward/backward/wrap-around)
 * 3. Direct option setting with clamping
 * 4. Preset application bulk-sets all fields
 * 5. Metrics computation produces valid 0-100 ranges
 * 6. Color selection persistence
 * 7. Reset returns to defaults
 * 8. Rating grade thresholds (S ≥ 85, A ≥ 70, B ≥ 55, C ≥ 40, D < 40)
 * ============================================================================
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  useInteriorDashboardConfigStore,
  CONFIG_OPTIONS,
  INTERIOR_PRESETS,
  INTERIOR_COLOR_SWATCHES,
  computeMetrics,
  getSelectedOptionLabel,
  type FeatureKey,
  type ComputedMetrics,
} from "../../../state/interiorDashboardConfigStore";

function getState() {
  return useInteriorDashboardConfigStore.getState();
}

describe("InteriorDashboardConfigStore", () => {
  beforeEach(() => {
    getState().reset();
  });

  // ────────────────────────────────────────────────
  // 1. Default State
  // ────────────────────────────────────────────────
  it("initializes with default selections all at index 0", () => {
    const { selections } = getState();
    const keys = Object.keys(CONFIG_OPTIONS) as FeatureKey[];
    for (const key of keys) {
      expect(selections[key]).toBe(0);
    }
  });

  it("has a non-null default color", () => {
    expect(getState().interiorColor).toBeTruthy();
    expect(getState().interiorColor.startsWith("#")).toBe(true);
  });

  it("starts with no active preset", () => {
    expect(getState().activePreset).toBeNull();
  });

  // ────────────────────────────────────────────────
  // 2. Option Cycling
  // ────────────────────────────────────────────────
  it("cycles forward through options", () => {
    const { cycleOption } = getState();
    cycleOption("dashboardLayout", 1);
    expect(getState().selections.dashboardLayout).toBe(1);
    cycleOption("dashboardLayout", 1);
    expect(getState().selections.dashboardLayout).toBe(2);
  });

  it("wraps around when cycling past the end", () => {
    const { cycleOption } = getState();
    const optCount = CONFIG_OPTIONS.dashboardLayout.options.length; // 3
    for (let i = 0; i < optCount; i++) {
      cycleOption("dashboardLayout", 1);
    }
    // Should wrap back to 0
    expect(getState().selections.dashboardLayout).toBe(0);
  });

  it("cycles backward and wraps from 0 to last", () => {
    const { cycleOption } = getState();
    cycleOption("steeringWheel", -1);
    const optCount = CONFIG_OPTIONS.steeringWheel.options.length;
    expect(getState().selections.steeringWheel).toBe(optCount - 1);
  });

  it("clears activePreset on manual cycle", () => {
    const { applyPreset, cycleOption } = getState();
    applyPreset("SPORT_80S");
    expect(getState().activePreset).toBe("SPORT_80S");
    getState().cycleOption("seatType", 1);
    expect(getState().activePreset).toBeNull();
  });

  // ────────────────────────────────────────────────
  // 3. Direct Option Setting
  // ────────────────────────────────────────────────
  it("sets option directly with valid index", () => {
    getState().setOption("climateControl", 2);
    expect(getState().selections.climateControl).toBe(2);
  });

  it("clamps index if out of range", () => {
    getState().setOption("climateControl", 99);
    const max = CONFIG_OPTIONS.climateControl.options.length - 1;
    expect(getState().selections.climateControl).toBe(max);

    getState().setOption("climateControl", -5);
    expect(getState().selections.climateControl).toBe(0);
  });

  // ────────────────────────────────────────────────
  // 4. Preset Application
  // ────────────────────────────────────────────────
  it("applies a preset and sets all selections", () => {
    getState().applyPreset("LUXURY_80S");
    const { selections, interiorColor, activePreset } = getState();
    const preset = INTERIOR_PRESETS.LUXURY_80S;
    expect(activePreset).toBe("LUXURY_80S");
    expect(interiorColor).toBe(preset.color);
    for (const [key, val] of Object.entries(preset.selections)) {
      expect(selections[key as FeatureKey]).toBe(val);
    }
  });

  it("ignores unknown preset keys gracefully", () => {
    const before = { ...getState().selections };
    getState().applyPreset("NONEXISTENT_PRESET");
    const after = getState().selections;
    expect(after).toEqual(before);
  });

  it("applies all 6 built-in presets without error", () => {
    for (const key of Object.keys(INTERIOR_PRESETS)) {
      getState().applyPreset(key);
      const { metrics } = getState();
      expect(metrics.comfort).toBeGreaterThanOrEqual(0);
      expect(metrics.comfort).toBeLessThanOrEqual(100);
    }
  });

  // ────────────────────────────────────────────────
  // 5. Metrics Computation
  // ────────────────────────────────────────────────
  it("computes metrics within 0-100 for percentage fields", () => {
    const percentKeys: (keyof ComputedMetrics)[] = [
      "comfort", "ergonomics", "quality", "perceivedValue",
      "reliability", "noiseIsolation", "infotainment", "marketAppeal",
    ];
    // Test with all options maxed out
    const maxSelections: Record<FeatureKey, number> = {} as Record<FeatureKey, number>;
    for (const key of Object.keys(CONFIG_OPTIONS) as FeatureKey[]) {
      maxSelections[key] = CONFIG_OPTIONS[key].options.length - 1;
    }
    const metrics = computeMetrics(maxSelections);
    for (const k of percentKeys) {
      const v = metrics[k] as number;
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("weight and cost are positive numbers", () => {
    const { metrics } = getState();
    expect(metrics.weight).toBeGreaterThan(0);
    expect(metrics.cost).toBeGreaterThan(0);
  });

  it("metrics update after cycling an option", () => {
    const before = getState().metrics.comfort;
    getState().cycleOption("seatMaterial", 1); // Cloth → Leather (+8 comfort)
    const after = getState().metrics.comfort;
    expect(after).not.toBe(before);
  });

  // ────────────────────────────────────────────────
  // 6. Color Selection
  // ────────────────────────────────────────────────
  it("sets interior color", () => {
    getState().setColor("#ff0000");
    expect(getState().interiorColor).toBe("#ff0000");
  });

  it("all defined swatches are valid hex codes", () => {
    for (const swatch of INTERIOR_COLOR_SWATCHES) {
      expect(swatch.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(swatch.name.length).toBeGreaterThan(0);
    }
  });

  // ────────────────────────────────────────────────
  // 7. Reset
  // ────────────────────────────────────────────────
  it("reset returns to default state", () => {
    getState().applyPreset("RALLY_80S");
    getState().setColor("#112233");
    getState().reset();
    const { selections, interiorColor, activePreset } = getState();
    for (const key of Object.keys(CONFIG_OPTIONS) as FeatureKey[]) {
      expect(selections[key]).toBe(0);
    }
    expect(activePreset).toBeNull();
    // Color should be reset to default
    expect(interiorColor).toBe("#9a5b32");
  });

  // ────────────────────────────────────────────────
  // 8. Rating Grades
  // ────────────────────────────────────────────────
  it("default selections yield a valid rating grade", () => {
    const { metrics } = getState();
    expect(["S", "A", "B", "C", "D"]).toContain(metrics.overallRating);
    expect(metrics.ratingLabel.length).toBeGreaterThan(0);
  });

  it("maxed-out luxury preset yields B or higher rating", () => {
    getState().applyPreset("LUXURY_80S");
    const { metrics } = getState();
    expect(["S", "A", "B"]).toContain(metrics.overallRating);
  });

  // ────────────────────────────────────────────────
  // 9. Helper Functions
  // ────────────────────────────────────────────────
  it("getSelectedOptionLabel returns correct label", () => {
    const label = getSelectedOptionLabel("dashboardLayout", getState().selections);
    expect(label).toBe("Classic 80s");
    getState().cycleOption("dashboardLayout", 1);
    const label2 = getSelectedOptionLabel("dashboardLayout", getState().selections);
    expect(label2).toBe("Driver Focused");
  });

  // ────────────────────────────────────────────────
  // 10. Config Database Integrity
  // ────────────────────────────────────────────────
  it("all 10 features have at least 2 options", () => {
    const keys = Object.keys(CONFIG_OPTIONS) as FeatureKey[];
    expect(keys.length).toBe(10);
    for (const key of keys) {
      expect(CONFIG_OPTIONS[key].options.length).toBeGreaterThanOrEqual(2);
      expect(CONFIG_OPTIONS[key].label.length).toBeGreaterThan(0);
    }
  });

  it("supports bespoke custom hex color codes", () => {
    getState().setColor("#ff0077");
    expect(getState().interiorColor).toBe("#ff0077");
    getState().setColor("#00e5ff");
    expect(getState().interiorColor).toBe("#00e5ff");
  });

  it("all 6 presets have valid colors and non-empty names", () => {
    for (const [key, preset] of Object.entries(INTERIOR_PRESETS)) {
      expect(preset.name.length).toBeGreaterThan(0);
      expect(preset.color.startsWith("#")).toBe(true);
      expect(Object.keys(preset.selections).length).toBe(10);
    }
  });
});
