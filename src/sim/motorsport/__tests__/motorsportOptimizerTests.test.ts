// ============================================================================
// AUTOMATED MOTORSPORT SETUP & TELEMETRY OPTIMIZER UNIT TESTS
// ============================================================================

import { describe, it, expect } from "vitest";
import { MotorsportSetupOptimizer } from "../motorsportSetupOptimizer";

describe("MotorsportSetupOptimizer Engine", () => {
  it("computes valid setup parameters for QUALIFYING_MAX_PACE goal", () => {
    const result = MotorsportSetupOptimizer.optimizeSetup("QUALIFYING_MAX_PACE");

    expect(result).toBeDefined();
    expect(result.goal).toBe("QUALIFYING_MAX_PACE");
    expect(result.predictedLapTimeSec).toBeGreaterThan(0);
    expect(result.predictedLapTimeString).toMatch(/^\d+:\d{2}\.\d{3}$/);
    expect(result.optimalSetup.rearWingAngleDeg).toBeGreaterThanOrEqual(2.0);
    expect(result.optimalSetup.rearWingAngleDeg).toBeLessThanOrEqual(16.0);
    expect(result.optimalSetup.frontRideHeightMm).toBeGreaterThan(0);
    expect(result.optimalSetup.rearRideHeightMm).toBeGreaterThan(result.optimalSetup.frontRideHeightMm);
    expect(result.topSpeedKmh).toBeGreaterThan(200);
    expect(result.paretoFrontier.length).toBeGreaterThan(0);
    expect(result.engineeringRecommendations.length).toBeGreaterThan(0);
  });

  it("adjusts wing angles according to circuit downforce requirement", () => {
    const lowDfResult = MotorsportSetupOptimizer.optimizeSetup("QUALIFYING_MAX_PACE", {
      name: "Monza Test",
      totalLengthM: 5793,
      longestStraightM: 1100,
      cornerCount: 11,
      avgCornerRadiusM: 120,
      downforceRequirement: "VERY_LOW",
      trackTempC: 30,
      isWetTrack: false,
    });

    const highDfResult = MotorsportSetupOptimizer.optimizeSetup("QUALIFYING_MAX_PACE", {
      name: "Monaco Test",
      totalLengthM: 3337,
      longestStraightM: 400,
      cornerCount: 19,
      avgCornerRadiusM: 45,
      downforceRequirement: "VERY_HIGH",
      trackTempC: 25,
      isWetTrack: false,
    });

    expect(highDfResult.optimalSetup.rearWingAngleDeg).toBeGreaterThan(lowDfResult.optimalSetup.rearWingAngleDeg);
    expect(lowDfResult.topSpeedKmh).toBeGreaterThan(highDfResult.topSpeedKmh);
  });

  it("raises ride height and softens roll bars under wet track conditions", () => {
    const dryResult = MotorsportSetupOptimizer.optimizeSetup("RAIN_STABILITY", {
      ...MotorsportSetupOptimizer.DEFAULT_CIRCUIT,
      isWetTrack: false,
    });

    const wetResult = MotorsportSetupOptimizer.optimizeSetup("RAIN_STABILITY", {
      ...MotorsportSetupOptimizer.DEFAULT_CIRCUIT,
      isWetTrack: true,
    });

    expect(wetResult.optimalSetup.frontRideHeightMm).toBeGreaterThan(dryResult.optimalSetup.frontRideHeightMm);
    expect(wetResult.optimalSetup.frontSpringRateNmm).toBeLessThan(dryResult.optimalSetup.frontSpringRateNmm);
    expect(wetResult.optimalSetup.frontArbStiffnessNmm).toBeLessThan(dryResult.optimalSetup.frontArbStiffnessNmm);
  });

  it("optimizes tire wear and stint length under ENDURANCE_STINT_PACING goal", () => {
    const qualResult = MotorsportSetupOptimizer.optimizeSetup("QUALIFYING_MAX_PACE");
    const stintResult = MotorsportSetupOptimizer.optimizeSetup("ENDURANCE_STINT_PACING");

    expect(stintResult.stintMaxLaps).toBeGreaterThanOrEqual(qualResult.stintMaxLaps);
    expect(stintResult.optimalSetup.camberFrontDeg).toBeGreaterThan(qualResult.optimalSetup.camberFrontDeg); // less aggressive negative camber
  });

  it("generates non-empty Pareto frontier trade-off points", () => {
    const result = MotorsportSetupOptimizer.optimizeSetup("FUEL_HYBRID_EFFICIENCY");
    expect(result.paretoFrontier.length).toBe(6);
    result.paretoFrontier.forEach((pt) => {
      expect(pt.setupName).toBeTruthy();
      expect(pt.downforceNAt250).toBeGreaterThan(0);
      expect(pt.topSpeedKmh).toBeGreaterThan(150);
      expect(pt.predictedLapTimeSec).toBeGreaterThan(50);
    });
  });
});
