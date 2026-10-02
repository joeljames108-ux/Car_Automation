import { describe, it, expect } from "vitest";
import {
  getHistoricalSegmentBenchmark,
  getHistoricalSegmentBenchmarksForYear,
  calculateHistoricalPriceAttractiveness,
  getSegmentHistoricalTrajectory,
} from "../historicalVehiclePricing";
import { calculateVehicleSales } from "../vehicleSalesEngine";

describe("Historical Vehicle Pricing & Segment Benchmark Engine", () => {
  it("calibrates authentic 1970 vehicle benchmark prices across segments", () => {
    const economy1970 = getHistoricalSegmentBenchmark("ECONOMY", 1970, 1);
    const sedan1970 = getHistoricalSegmentBenchmark("SEDAN", 1970, 1);
    const sports1970 = getHistoricalSegmentBenchmark("SPORTS", 1970, 1);
    const supercar1970 = getHistoricalSegmentBenchmark("SUPERCAR", 1970, 1);

    expect(economy1970).toBe(2195);
    expect(sedan1970).toBe(3550);
    expect(sports1970).toBe(5200);
    expect(supercar1970).toBe(21000);
  });

  it("scales MSRP across the decades according to historical automotive PPI", () => {
    const sports1970 = getHistoricalSegmentBenchmark("SPORTS", 1970, 1);
    const sports1990 = getHistoricalSegmentBenchmark("SPORTS", 1990, 1);
    const sports2010 = getHistoricalSegmentBenchmark("SPORTS", 2010, 1);
    const sports2024 = getHistoricalSegmentBenchmark("SPORTS", 2024, 1);

    expect(sports1990).toBeGreaterThan(sports1970 * 2.5);
    expect(sports2010).toBeGreaterThan(sports1990);
    expect(sports2024).toBeGreaterThan(sports2010);
    expect(sports2024).toBeGreaterThan(55000); // Realistic modern sports car base MSRP
  });

  it("evaluates price attractiveness and competitiveness relative to era benchmarks", () => {
    // In 1970, a $2,200 economy car is right on benchmark
    const eval1970Good = calculateHistoricalPriceAttractiveness(2200, "ECONOMY", 1970, 1);
    expect(eval1970Good.marketCompetitivenessTag).toBe("COMPETITIVE");
    expect(eval1970Good.priceAttractivenessFactor).toBeGreaterThanOrEqual(0.95);

    // In 1970, trying to sell an economy runabout for $15,000 is wildly overpriced
    const eval1970Crazy = calculateHistoricalPriceAttractiveness(15000, "ECONOMY", 1970, 1);
    expect(eval1970Crazy.marketCompetitivenessTag).toBe("OVERPRICED");
    expect(eval1970Crazy.priceAttractivenessFactor).toBeLessThan(0.3);

    // In 2024, a $21,000 economy runabout is right on benchmark (~$20.6k)
    const eval2024 = calculateHistoricalPriceAttractiveness(21000, "ECONOMY", 2024, 1);
    expect(eval2024.marketCompetitivenessTag).toBe("COMPETITIVE");
    expect(eval2024.priceAttractivenessFactor).toBeGreaterThanOrEqual(0.9);

    // In 2024, a $25,000 economy car is premium-trimmed
    const eval2024Prem = calculateHistoricalPriceAttractiveness(25000, "ECONOMY", 2024, 1);
    expect(eval2024Prem.marketCompetitivenessTag).toBe("PREMIUM_PRICED");
  });

  it("returns full benchmark table for any given year", () => {
    const benchmarks1985 = getHistoricalSegmentBenchmarksForYear(1985, 7);
    expect(benchmarks1985.ECONOMY).toBeGreaterThan(5000);
    expect(benchmarks1985.SEDAN).toBeGreaterThan(8000);
    expect(benchmarks1985.SUPERCAR).toBeGreaterThan(60000);
  });

  it("integrates seamlessly into calculateVehicleSales with year parameter", () => {
    // 1970 scenario with era-appropriate pricing
    const sales1970 = calculateVehicleSales({
      vehicleId: "v-1970-pinto",
      modelName: "Pinto 1600",
      segment: "ECONOMY",
      listPrice: 2200,
      monthlyProductionCapacity: 200,
      currentInventory: 50,
      baseMarketMonthlyDemand: 250,
      competitivenessScore: 60,
      overallReputation: 45,
      segmentSpecialistReputation: 45,
      dealerCoveragePct: 70,
      customerLoyaltyScore: 50,
      year: 1970,
      month: 1,
    });

    expect(sales1970.benchmarkMSRP).toBe(2195);
    expect(sales1970.unitsSold).toBeGreaterThan(100);
    expect(sales1970.grossRevenue).toBeGreaterThan(0);
  });

  it("maintains backward compatibility when year is not provided", () => {
    const legacySales = calculateVehicleSales({
      vehicleId: "v-legacy",
      modelName: "Legacy Sedan",
      segment: "SEDAN",
      listPrice: 950000,
      monthlyProductionCapacity: 100,
      currentInventory: 20,
      baseMarketMonthlyDemand: 150,
      competitivenessScore: 55,
      overallReputation: 50,
      segmentSpecialistReputation: 50,
      dealerCoveragePct: 80,
      customerLoyaltyScore: 50,
    });

    expect(legacySales.benchmarkMSRP).toBe(950000);
    expect(legacySales.unitsSold).toBeGreaterThan(50);
  });

  it("generates complete 1970-2030 trajectory for chart visualization", () => {
    const traj = getSegmentHistoricalTrajectory("SPORTS");
    expect(traj.length).toBe(122);
    expect(traj[0].year).toBe(1970);
    expect(traj[traj.length - 1].year).toBe(2030);
    expect(traj[traj.length - 1].benchmarkMSRP).toBeGreaterThan(traj[0].benchmarkMSRP);
  });
});
