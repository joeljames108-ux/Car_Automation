import { describe, it, expect } from "vitest";
import {
  ChiefEngineersAndBurnoutEngine,
  CANONICAL_CHIEF_ENGINEERS,
  ChiefEngineerProfile,
} from "../chiefEngineersAndBurnoutEngine";

describe("Named Chief Engineers & Workforce Burnout Engine (UNIT_01)", () => {
  it("should aggregate perks accurately when key Chief Engineers are hired", () => {
    const testRoster: ChiefEngineerProfile[] = CANONICAL_CHIEF_ENGINEERS.map(eng => {
      if (eng.id === "eng_hans_weber" || eng.id === "eng_adrian_sterling") {
        return { ...eng, isHired: true };
      }
      return { ...eng, isHired: false };
    });

    const bonuses = ChiefEngineersAndBurnoutEngine.calculateRosterBonuses(testRoster);
    expect(bonuses.thermalBonus).toBe(15); // Dr. Hans Weber
    expect(bonuses.aeroBonus).toBe(18);    // Adrian Sterling
    expect(bonuses.gripBonus).toBe(0);     // Paolo Rossi not hired
    expect(bonuses.totalSalaries).toBe(14500 + 16000);
  });

  it("should maintain stable morale and zero error penalties during standard 40h workweek", () => {
    const fatigue = ChiefEngineersAndBurnoutEngine.evaluateWorkloadFatigue("standard_40h", 0, 108);
    expect(fatigue.speedMultiplier).toBe(1.0);
    expect(fatigue.cadErrorRatePenaltyPct).toBe(0);
    expect(fatigue.monthlyMoraleDelta).toBeGreaterThan(0);
    expect(fatigue.resignedEngineersCount).toBe(0);
  });

  it("should accelerate development by +48% but trigger heavy CAD errors and resignations in extreme 65h crunch", () => {
    const fatigue = ChiefEngineersAndBurnoutEngine.evaluateWorkloadFatigue("extreme_crunch_65h", 3, 108);
    expect(fatigue.speedMultiplier).toBeGreaterThan(1.4);
    expect(fatigue.cadErrorRatePenaltyPct).toBeGreaterThan(20);
    expect(fatigue.monthlyMoraleDelta).toBeLessThan(-20);
    expect(fatigue.turnoverRiskPct).toBeGreaterThan(30);
    expect(fatigue.resignedEngineersCount).toBeGreaterThan(5);
    expect(fatigue.summary).toContain("CRITICAL CRUNCH");
  });
});
