// ============================================================================
// F1 CONSTRUCTOR EXPERIENCE — VITEST SUITE: PHYSICS & CHAMPIONSHIP
// ============================================================================

import { describe, it, expect } from "vitest";
import { F1PhysicsEngine } from "../physics/f1PhysicsEngine";
import { DEFAULT_F1_CAR } from "../chassis/defaultF1Car";
import { F1_OFFICIAL_CALENDAR } from "../season/f1Calendar";
import { F1_RIVAL_TEAMS } from "../season/f1RivalTeams";
import { F1ChampionshipEngine } from "../season/f1Championship";
import { F1ProgressTracker } from "../state/f1ProgressTracker";
import type { F1CarDesign } from "../types/f1Types";

describe("Formula 1 Constructor Physics & Championship Engine", () => {
  it("evaluates baseline F1 car physics & homologation parameters", () => {
    const evaluatedBaseline = F1PhysicsEngine.evaluateCar(DEFAULT_F1_CAR);

    expect(evaluatedBaseline.computedTotalMassKg).toBeGreaterThanOrEqual(798);
    expect(evaluatedBaseline.computedTotalPeakHp).toBeGreaterThanOrEqual(1000);
    expect(evaluatedBaseline.computedIcePeakHp).toBeGreaterThanOrEqual(800);
    expect(evaluatedBaseline.computedErsPeakHp).toBeLessThanOrEqual(161);
    expect(evaluatedBaseline.computedTopSpeedKmh).toBeGreaterThanOrEqual(340);
    expect(evaluatedBaseline.computedZeroToHundredSec).toBeLessThanOrEqual(2.6);
    expect(evaluatedBaseline.computedMaxCorneringGLat).toBeGreaterThanOrEqual(5.0);
    expect(evaluatedBaseline.computedMaxBrakingGLong).toBeGreaterThanOrEqual(5.0);
    expect(evaluatedBaseline.computedFiaHomologationScore).toBe(100);
  });

  it("enforces scrutineering rules and penalizes illegal car configurations", () => {
    const illegalCar: F1CarDesign = {
      ...DEFAULT_F1_CAR,
      monocoque: { ...DEFAULT_F1_CAR.monocoque, totalMonocoqueMassKg: 70, ballastTungstenKg: 0 },
      powerUnit: { ...DEFAULT_F1_CAR.powerUnit, mguKPowerKw: 150 }, // Illegal >120 kW
      aero: { ...DEFAULT_F1_CAR.aero, rearWingDrsFlapGapOpenMm: 110 }, // Illegal >85mm
    };

    const illegalEvaluated = F1PhysicsEngine.evaluateCar(illegalCar);
    expect(illegalEvaluated.computedTotalMassKg).toBeLessThan(798);
    expect(illegalEvaluated.computedFiaHomologationScore).toBeLessThan(100);

    const report = F1PhysicsEngine.runScrutineering(illegalEvaluated);
    expect(report.passedHomologation).toBe(false);
    expect(report.failedCount).toBeGreaterThanOrEqual(2);
  });

  it("computes accurate subsystem progress metrics", () => {
    const evaluatedBaseline = F1PhysicsEngine.evaluateCar(DEFAULT_F1_CAR);
    const completionMap = F1ProgressTracker.calculateSubsystemProgress(evaluatedBaseline);

    expect(completionMap.monocoque.isCompliant).toBe(true);
    expect(completionMap.powerunit.isCompliant).toBe(true);
    expect(completionMap.aerodynamics.isCompliant).toBe(true);
    expect(completionMap.scrutineering.percentage).toBe(100);
  });

  it("validates 24-race championship calendar & 10 rival teams", () => {
    expect(F1_OFFICIAL_CALENDAR.length).toBe(24);
    expect(F1_OFFICIAL_CALENDAR[0].id).toBe("bahrain_sakhir");
    expect(F1_OFFICIAL_CALENDAR[23].id).toBe("uae_abudhabi");
    expect(F1_RIVAL_TEAMS.length).toBe(10);
  });

  it("simulates a race weekend with full driver grid and telemetry", () => {
    const evaluatedBaseline = F1PhysicsEngine.evaluateCar(DEFAULT_F1_CAR);
    const simResult = F1ChampionshipEngine.simulateRaceWeekend(F1_OFFICIAL_CALENDAR[0], evaluatedBaseline, 98);

    expect(simResult.results.length).toBe(21); // 20 AI + 1 Player
    expect(simResult.results[0].position).toBe(1);
    expect(simResult.results[0].pointsEarned).toBe(25);
    expect(simResult.results[20].position).toBe(21);
    expect(simResult.poleLapTimeSec).toBeGreaterThan(60);
    expect(simResult.poleLapTimeSec).toBeLessThan(120);
  });

  it("simulates a full 24-race World Championship season", () => {
    const evaluatedBaseline = F1PhysicsEngine.evaluateCar(DEFAULT_F1_CAR);
    const season = F1ChampionshipEngine.simulateChampionshipSeason(evaluatedBaseline, 96);

    expect(season.weekendResults.length).toBe(24);
    expect(season.driverStandings.length).toBeGreaterThanOrEqual(21);
    expect(season.constructorStandings.length).toBeGreaterThanOrEqual(11);
    expect(season.driverStandings[0].points).toBeGreaterThanOrEqual(season.driverStandings[1].points);
    expect(season.constructorStandings[0].points).toBeGreaterThanOrEqual(season.constructorStandings[1].points);
  });
});
