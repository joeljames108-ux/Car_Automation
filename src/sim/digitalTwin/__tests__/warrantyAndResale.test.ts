import { describe, it, expect } from "vitest";
import {
  WarrantyAndResaleEngine,
} from "../warrantyAndResaleEngine";

describe("Warranty Claims, Resale Value & Digital Twin Lifecycle Engine", () => {
  it("should calculate low monthly warranty payouts when fleet quality is high", () => {
    const highQualityPayout = WarrantyAndResaleEngine.calculateMonthlyWarrantyPayout(
      15000,
      92, // high quality
      "standard_3yr_36k"
    );

    const lowQualityPayout = WarrantyAndResaleEngine.calculateMonthlyWarrantyPayout(
      15000,
      45, // poor quality
      "standard_3yr_36k"
    );

    expect(highQualityPayout.totalMonthlyClaimsEur).toBeLessThan(lowQualityPayout.totalMonthlyClaimsEur);
    expect(highQualityPayout.customerSatisfactionScore).toBeGreaterThan(lowQualityPayout.customerSatisfactionScore);
  });

  it("should calculate higher 3-year resale residual value for reliable vehicles with strong brand reputation", () => {
    const bulletproofResale = WarrantyAndResaleEngine.calculateResidualValuePct(90, 85, 3);
    const fragileResale = WarrantyAndResaleEngine.calculateResidualValuePct(45, 30, 3);

    expect(bulletproofResale.retainedValuePct).toBeGreaterThan(fragileResale.retainedValuePct);
    expect(bulletproofResale.depreciationGrade).toBe("exceptional");
    expect(fragileResale.depreciationGrade).toBe("poor");
  });

  it("should generate a valid immutable Digital Twin record with unique formatted VIN", () => {
    const twin = WarrantyAndResaleEngine.createDigitalTwin(
      "Falcon",
      "GT",
      1974,
      5,
      104,
      310,
      420,
      0.34,
      85,
      88,
      12500
    );

    expect(twin.vin).toBe("APX-1974-05-00104");
    expect(twin.factoryBenchDynoHp).toBe(310);
    expect(twin.windTunnelCd).toBe(0.34);
    expect(twin.serviceHistoryLog.length).toBeGreaterThan(0);
    expect(twin.serviceHistoryLog[0]).toContain("Pre-delivery factory roll-off");
  });
});
