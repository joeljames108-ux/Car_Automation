import { describe, it, expect } from "vitest";
import { AdvancedEngineTelemetrySolver } from "../advancedEngineTelemetrySolver";
import { ECU3DMapTuningEngine } from "../ecu3DMapTuningEngine";
import { EngineAcousticsNVHSolver } from "../engineAcousticsNVHSolver";
import { MasterEngineStateEngine } from "../masterEngineStateEngine";

describe("Advanced Engine Telemetry & Physics Solvers", () => {
  const engineInstance = new MasterEngineStateEngine();
  const state = engineInstance.getState();

  it("calculates 1D 720° P-V cylinder pressure cycle thermodynamics correctly", () => {
    const report = AdvancedEngineTelemetrySolver.solveThermodynamics(state, 6500, 1.0);

    expect(report.imepBar).toBeGreaterThan(5.0);
    expect(report.bmepBar).toBeGreaterThan(1.0);
    expect(report.pMaxBar).toBeGreaterThan(40.0);
    expect(report.indicatedThermalEfficiency).toBeGreaterThan(0.2);
    expect(report.indicatedThermalEfficiency).toBeLessThan(0.6);
    expect(report.crankAnglePoints.length).toBeGreaterThan(100);
    expect(report.crankAnglePoints[0].crankAngleDeg).toBe(0);
  });

  it("calculates 100-node thermal distribution report without exceeding physical limits", () => {
    const thermal = AdvancedEngineTelemetrySolver.solveThermalDistribution(state, 7000, 1.0, 95.0);

    expect(thermal.nodes.length).toBeGreaterThan(8);
    expect(thermal.peakPistonCrownTempC).toBeGreaterThan(150);
    expect(thermal.peakPistonCrownTempC).toBeLessThan(450);
    expect(thermal.peakExhaustValveTempC).toBeGreaterThan(400);
    expect(thermal.overallThermalStressIndex).toBeGreaterThanOrEqual(0);
    expect(thermal.overallThermalStressIndex).toBeLessThanOrEqual(100);
  });

  it("computes hydrodynamic journal bearing oil film thickness and Sommerfeld number", () => {
    const bearings = AdvancedEngineTelemetrySolver.solveJournalBearings(state, 6000, 90.0);

    expect(bearings.mainBearingMinFilmThicknessMicron).toBeGreaterThan(0.5);
    expect(bearings.mainBearingMinFilmThicknessMicron).toBeLessThan(50.0);
    expect(bearings.sommerfeldNumber).toBeGreaterThan(0.001);
    expect(bearings.hydrodynamicSafetyMargin).toBeGreaterThan(0.1);
  });

  it("computes torsional vibration harmonic spectrum and order analysis", () => {
    const torsional = AdvancedEngineTelemetrySolver.solveTorsionalVibration(state, 6500);

    expect(torsional.firingOrder).toBeDefined();
    expect(torsional.harmonicOrders.length).toBeGreaterThan(3);
    expect(torsional.peakTorsionalStressMPa).toBeGreaterThan(10);
    expect(torsional.damperEfficiencyPercent).toBeGreaterThan(70);
  });

  it("generates 16x16 3D ECU calibration suite and performs bi-linear interpolation", () => {
    const suite = ECU3DMapTuningEngine.generateCalibrationSuite(state);

    expect(suite.fuelMap.grid.length).toBe(16);
    expect(suite.fuelMap.grid[0].length).toBe(16);
    expect(suite.ignitionMap.grid.length).toBe(16);
    expect(suite.targetAfrMap.grid.length).toBe(16);

    // Test bi-linear interpolation
    const trace = ECU3DMapTuningEngine.interpolateMapValue(suite.ignitionMap, 4500, 145);
    expect(trace.interpolatedValue).toBeGreaterThan(5);
    expect(trace.interpolatedValue).toBeLessThan(60);
    expect(trace.rowIndex).toBeGreaterThanOrEqual(0);
    expect(trace.colIndex).toBeGreaterThanOrEqual(0);
  });

  it("bumps ECU matrix cell values and smooths grid correctly", () => {
    const suite = ECU3DMapTuningEngine.generateCalibrationSuite(state);
    const originalVal = suite.ignitionMap.grid[4][5];

    const bumpedMap = ECU3DMapTuningEngine.bumpMapCells(suite.ignitionMap, [{ row: 4, col: 5 }], 2.5);
    expect(bumpedMap.grid[4][5]).toBe(originalVal + 2.5);

    const smoothedMap = ECU3DMapTuningEngine.smoothMap(bumpedMap);
    expect(smoothedMap.grid.length).toBe(16);
    expect(smoothedMap.grid[0].length).toBe(16);
  });

  it("calculates 1/3-octave band computational acoustics & exhaust resonance NVH", () => {
    const nvh = EngineAcousticsNVHSolver.solve(state, 4000, 0.8);

    expect(nvh.octaveBands.length).toBe(29); // 29 center frequencies
    expect(nvh.overallDbA).toBeGreaterThan(40);
    expect(nvh.overallDbA).toBeLessThan(140);
    expect(nvh.soundQualityScore).toBeGreaterThanOrEqual(0);
    expect(nvh.soundQualityScore).toBeLessThanOrEqual(100);
    expect(nvh.exhaustResonance.fundamentalExhaustPulseFreqHz).toBeGreaterThan(0);
  });
});
