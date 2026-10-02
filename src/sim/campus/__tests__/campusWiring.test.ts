import { describe, it, expect } from "vitest";
import { CAMPUS_UNITS_REGISTRY } from "../campusRegistry";
import { calculateCampusBonuses } from "../campusBonusEngine";
import { generateFullReview } from "../../reviews";
import { campusAudio } from "../campusAudioEngine";
import { defaultDesign } from "../../constants";
import { simulate } from "../../engine";

describe("Epoch 7: Special Infrastructure & Cross-System Wiring", () => {
  it("Phase 277 & 278: verifies vehicle design quality and review scores receive campus bonuses", () => {
    const testDesign = defaultDesign();
    const testSim = simulate(testDesign);
    const baseReview = generateFullReview(testDesign, testSim);
    expect(baseReview.summary.overall).toBeGreaterThan(0);

    const upgradedUnits = { ...CAMPUS_UNITS_REGISTRY };
    upgradedUnits.VEHICLE_DESIGN_HQ = {
      ...upgradedUnits.VEHICLE_DESIGN_HQ,
      level: 5,
      status: "operational",
    };
    upgradedUnits.QUALITY_RELIABILITY_HQ = {
      ...upgradedUnits.QUALITY_RELIABILITY_HQ,
      level: 5,
      status: "operational",
    };
    upgradedUnits.SAFETY_HQ = {
      ...upgradedUnits.SAFETY_HQ,
      level: 5,
      status: "operational",
    };

    const campusBonuses = calculateCampusBonuses(upgradedUnits);
    const boostedReview = generateFullReview(testDesign, testSim, campusBonuses);

    expect(boostedReview.summary.overall).toBeGreaterThanOrEqual(baseReview.summary.overall);
    expect(boostedReview.scores.interior.find(s => s.key === "design")?.score)
      .toBeGreaterThanOrEqual(baseReview.scores.interior.find(s => s.key === "design")?.score || 0);
  });

  it("Phase 225: campusAudio engine executes safely in headless environments", () => {
    expect(() => {
      campusAudio.setMuted(true);
      expect(campusAudio.getIsMuted()).toBe(true);
      campusAudio.setMasterVolume(0.8);
      expect(campusAudio.getMasterVolume()).toBe(0.8);
      campusAudio.playSelectUnit();
      campusAudio.playUpgradeFacility();
      campusAudio.playUnlockPlot();
      campusAudio.playNotification("success");
      campusAudio.startEraAmbiance("ERA_1970S");
      campusAudio.stopEraAmbiance();
    }).not.toThrow();
  });
});
