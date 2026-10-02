import { describe, it, expect } from "vitest";
import {
  WinOnSundayBoostEngine,
  RaceWeekendEntry,
} from "../winOnSundayBoostEngine";

describe("Motorsport Homologation & Win-on-Sunday Engine (UNIT_08)", () => {
  it("should enforce Group 4 500-unit minimum production rule", () => {
    const insufficient = WinOnSundayBoostEngine.verifyHomologationEligibility(
      "group_4_gt",
      240, // only 240 built
      1100,
      3200
    );
    expect(insufficient.eligible).toBe(false);
    expect(insufficient.reasons.some(r => r.includes("Production deficit"))).toBe(true);

    const compliant = WinOnSundayBoostEngine.verifyHomologationEligibility(
      "group_4_gt",
      520, // 520 built
      1050,
      3000
    );
    expect(compliant.eligible).toBe(true);
    expect(compliant.reasons.length).toBe(0);
  });

  it("should generate P1 victory and +25% showroom foot traffic boost for high-performing race entry", () => {
    const winningCar: RaceWeekendEntry = {
      category: "le_mans_hypercar",
      raceName: "24 Hours of Le Mans",
      chassisName: "Apex LMH-01",
      driverSkillScore: 95,
      carPowerHp: 680,
      carWeightKg: 1040,
      downforceKg: 1200,
      reliabilityScore: 96,
    };

    const result = WinOnSundayBoostEngine.simulateRaceWeekend(winningCar, 0.95);
    expect(result.isWin).toBe(true);
    expect(result.finishPosition).toBe(1);
    expect(result.prizeMoneyEur).toBe(350000);
    expect(result.showroomFootTrafficMultiplier).toBe(1.25);
    expect(result.salesConversionBoostPct).toBe(18);
    expect(result.summary).toContain("VICTORY");
  });

  it("should handle mechanical DNF gracefully and apply slight negative consumer sentiment", () => {
    const fragileCar: RaceWeekendEntry = {
      category: "fia_gt3",
      raceName: "Spa 24 Hours",
      chassisName: "Apex GT3",
      driverSkillScore: 80,
      carPowerHp: 520,
      carWeightKg: 1240,
      downforceKg: 600,
      reliabilityScore: 40, // very poor reliability
    };

    // Force DNF with low seed
    const result = WinOnSundayBoostEngine.simulateRaceWeekend(fragileCar, 0.01);
    expect(result.isDNF).toBe(true);
    expect(result.finishPosition).toBe(99);
    expect(result.showroomFootTrafficMultiplier).toBeLessThan(1.0);
    expect(result.dnfReason).toBeDefined();
  });
});
