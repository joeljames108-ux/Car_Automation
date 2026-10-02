import { describe, it, expect } from "vitest";
import {
  AutoShowAndPressReviewEngine,
  AUTO_SHOW_CALENDAR,
} from "../autoShowAndPressReviewEngine";

describe("Auto Shows, Press Fleet & Motoring Reviews Engine (UNIT_14)", () => {
  it("should identify Geneva in March and Detroit in January on the international show calendar", () => {
    const geneva = AutoShowAndPressReviewEngine.getActiveShowForMonth(3);
    expect(geneva).not.toBeNull();
    expect(geneva?.city).toBe("geneva");

    const detroit = AutoShowAndPressReviewEngine.getActiveShowForMonth(1);
    expect(detroit).not.toBeNull();
    expect(detroit?.city).toBe("detroit");

    const noShow = AutoShowAndPressReviewEngine.getActiveShowForMonth(5);
    expect(noShow).toBeNull();
  });

  it("should generate thousands of pre-orders and global awareness for a reveal rotunda pavilion debut", () => {
    const genevaShow = AUTO_SHOW_CALENDAR.find(s => s.city === "geneva")!;
    const revealResult = AutoShowAndPressReviewEngine.unveilVehicleAtShow(
      genevaShow,
      "reveal_rotunda_pavilion",
      "Apex Valorous V12",
      92 // High styling score
    );

    expect(revealResult.preOrdersReceived).toBeGreaterThan(6000);
    expect(revealResult.newBrandAwarenessBonus).toBeGreaterThan(35);
    expect(revealResult.pressScore).toBeGreaterThanOrEqual(95);
    expect(revealResult.costEur).toBe(1100000);
  });

  it("should award Car of the Year and boost market demand by +45% for a world-class test car", () => {
    const worldClassCar = {
      name: "Apex GT Coupe",
      zeroToSixtySec: 3.2,
      topSpeedKmh: 325,
      lateralG: 1.12,
      qualityScore: 94,
      nvhQuietnessScore: 90,
      msrpPrice: 78000,
      year: 2024,
    };

    const pressReport = AutoShowAndPressReviewEngine.conductPressFleetReviews(worldClassCar);
    expect(pressReport.wonGoldenCalipersCOTY).toBe(true);
    expect(pressReport.compositeScore).toBeGreaterThanOrEqual(90);
    expect(pressReport.salesDemandBoostPct).toBe(45);
    expect(pressReport.reviews.some(r => r.magazineName === "Car and Driver")).toBe(true);
  });

  it("should depress market demand when a car is criticized for weak dynamics and poor quality", () => {
    const poorCar = {
      name: "Econorunner 500",
      zeroToSixtySec: 14.5,
      topSpeedKmh: 130,
      lateralG: 0.62,
      qualityScore: 42,
      nvhQuietnessScore: 50,
      msrpPrice: 32000,
      year: 1974,
    };

    const pressReport = AutoShowAndPressReviewEngine.conductPressFleetReviews(poorCar);
    expect(pressReport.wonGoldenCalipersCOTY).toBe(false);
    expect(pressReport.compositeScore).toBeLessThan(60);
    expect(pressReport.salesDemandBoostPct).toBeLessThan(0); // Demand drop
  });
});
