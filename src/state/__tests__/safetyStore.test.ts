import { describe, it, expect, beforeEach } from "vitest";
import { useSafetyStore, simulateSafety, defaultSafetyConfig } from "../safetyStore";

describe("Safety Store & Simulation Suite (Domain Extraction)", () => {
  beforeEach(() => {
    useSafetyStore.getState().resetSafety();
  });

  it("initializes with default safety configuration and valid simulation", () => {
    const state = useSafetyStore.getState();
    const defaultConfig = defaultSafetyConfig();

    expect(state.safetyConfig.airbagCount).toBe(defaultConfig.airbagCount);
    expect(state.safetyConfig.frontCrumple).toBe(defaultConfig.frontCrumple);
    expect(state.safetySim.overallScore).toBeGreaterThan(0);
    expect(state.safetySim.ncapStars).toBeGreaterThanOrEqual(1);
    expect(state.safetySim.ncapStars).toBeLessThanOrEqual(5);
    expect(state.safetySim.safetyWeight).toBeGreaterThan(0);
    expect(state.safetySim.safetyCost).toBeGreaterThan(0);
  });

  it("updates safety config and dynamically recomputes crashworthiness metrics", () => {
    const initialSim = useSafetyStore.getState().safetySim;

    useSafetyStore.getState().updateSafety({
      frontCrumple: "adaptive",
      safetyCage: "carbon_monocoque",
      airbagType: "external",
      airbagCount: 12,
      pedestrianSafety: "full_pedestrian",
    });

    const updatedState = useSafetyStore.getState();
    expect(updatedState.safetyConfig.frontCrumple).toBe("adaptive");
    expect(updatedState.safetyConfig.airbagCount).toBe(12);
    expect(updatedState.safetySim.overallScore).toBeGreaterThan(initialSim.overallScore);
    expect(updatedState.safetySim.frontalCrashScore).toBeGreaterThan(initialSim.frontalCrashScore);
    expect(updatedState.safetySim.ncapStars).toBeGreaterThanOrEqual(4);
    expect(updatedState.safetySim.safetyCost).toBeGreaterThan(initialSim.safetyCost);
  });

  it("resets safety to factory default configuration and simulation", () => {
    useSafetyStore.getState().updateSafety({
      frontCrumple: "none",
      safetyCage: "none",
      airbagCount: 0,
    });

    expect(useSafetyStore.getState().safetyConfig.frontCrumple).toBe("none");

    useSafetyStore.getState().resetSafety();

    const state = useSafetyStore.getState();
    const defaults = defaultSafetyConfig();
    expect(state.safetyConfig.frontCrumple).toBe(defaults.frontCrumple);
    expect(state.safetyConfig.airbagCount).toBe(defaults.airbagCount);
  });

  it("simulateSafety returns deterministic results for identical configurations", () => {
    const config = defaultSafetyConfig();
    const result1 = simulateSafety(config);
    const result2 = simulateSafety(config);

    expect(result1.overallScore).toBe(result2.overallScore);
    expect(result1.ncapStars).toBe(result2.ncapStars);
    expect(result1.safetyWeight).toBe(result2.safetyWeight);
    expect(result1.safetyCost).toBe(result2.safetyCost);
  });
});
