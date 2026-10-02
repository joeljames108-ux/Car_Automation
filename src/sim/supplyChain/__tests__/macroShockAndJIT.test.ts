import { describe, it, expect } from "vitest";
import {
  MacroShockAndJITEngine,
  SupplyChainConfig,
} from "../macroShockAndJITEngine";

describe("Supply Chain JIT, Buffer Stock & Macro Shocks Engine (UNIT_11)", () => {
  const pureJitConfig: SupplyChainConfig = {
    inventoryPolicy: "pure_jit",
    sourcingStrategy: "single_source_discount",
    warehouseCapacityUnits: 500,
    preferredTier1PartnerCount: 4,
  };

  const buffer90Config: SupplyChainConfig = {
    inventoryPolicy: "strategic_reserve_90",
    sourcingStrategy: "dual_source_hedged",
    warehouseCapacityUnits: 6000,
    preferredTier1PartnerCount: 8,
  };

  it("should provide a 10% single-source price discount during peacetime with zero buffer holding cost for pure JIT", () => {
    const result = MacroShockAndJITEngine.evaluateMonthlySupplyChain(1972, 6, 2000, pureJitConfig);
    expect(result.activeShocks.length).toBe(0);
    expect(result.materialPriceMultiplier).toBe(0.9);
    expect(result.monthlyHoldingCost).toBe(0);
    expect(result.disruptionDowntimeDays).toBe(0);
    expect(result.productionThrottlingPct).toBe(0);
  });

  it("should incur factory shutdown and severe price surge under pure JIT during the 1973 OPEC oil shock", () => {
    const result = MacroShockAndJITEngine.evaluateMonthlySupplyChain(1973, 11, 2000, pureJitConfig);
    expect(result.activeShocks.length).toBeGreaterThan(0);
    expect(result.activeShocks[0].id).toBe("opec_embargo_1973");
    expect(result.disruptionDowntimeDays).toBeGreaterThan(10);
    expect(result.productionThrottlingPct).toBeGreaterThan(40);
    expect(result.materialPriceMultiplier).toBeGreaterThan(2.5);
    expect(result.unfulfilledUnitsCount).toBeGreaterThan(500);
  });

  it("should protect production continuity with zero downtime when holding a 90-day strategic reserve during the shock", () => {
    const result = MacroShockAndJITEngine.evaluateMonthlySupplyChain(1973, 11, 2000, buffer90Config);
    expect(result.activeShocks.length).toBeGreaterThan(0);
    expect(result.disruptionDowntimeDays).toBe(0);
    expect(result.productionThrottlingPct).toBe(0);
    expect(result.materialPriceMultiplier).toBeLessThanOrEqual(1.1);
    expect(result.monthlyHoldingCost).toBe(2000 * 38);
    expect(result.statusMessage).toContain("STABLE BUFFER");
  });

  it("should identify the 2021 global semiconductor shortage and throttle lines for unbuffered manufacturers", () => {
    const result = MacroShockAndJITEngine.evaluateMonthlySupplyChain(2021, 6, 3000, pureJitConfig);
    expect(result.activeShocks.some(s => s.id === "semiconductor_shortage_2021")).toBe(true);
    expect(result.disruptionDowntimeDays).toBeGreaterThan(0);
    expect(result.productionThrottlingPct).toBeGreaterThan(0);
  });
});
