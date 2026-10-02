import { describe, it, expect } from "vitest";
import {
  FactoryConstructionLifecycle,
} from "../factoryConstructionLifecycle";
import { INITIAL_FACTORY_STATE } from "../campusRegistry";

describe("Factory Greenfield Construction & Shop Commissioning Lifecycle (UNIT_10)", () => {
  it("should purchase industrial land parcel across the outsource boundary", () => {
    const purchase = FactoryConstructionLifecycle.purchaseLand(INITIAL_FACTORY_STATE);
    expect(purchase.success).toBe(true);
    expect(purchase.cashRequiredEur).toBe(18500000);
    expect(purchase.nextState.landPurchased).toBe(true);
    expect(purchase.nextState.ownershipStatus).toBe("land_acquired");
  });

  it("should prevent groundbreaking before land parcel is purchased", () => {
    const attempt = FactoryConstructionLifecycle.startGroundbreaking(INITIAL_FACTORY_STATE);
    expect(attempt.success).toBe(false);
    expect(attempt.message).toContain("purchased first");
  });

  it("should start 24-month groundbreaking once land is secured", () => {
    const landBought = FactoryConstructionLifecycle.purchaseLand(INITIAL_FACTORY_STATE).nextState;
    const groundbreak = FactoryConstructionLifecycle.startGroundbreaking(landBought);
    expect(groundbreak.success).toBe(true);
    expect(groundbreak.nextState.ownershipStatus).toBe("under_construction");
    expect(groundbreak.nextState.constructionMonthsRemaining).toBe(24);
  });

  it("should advance construction month-by-month and transition to operational owned plant at month 24", () => {
    const landBought = FactoryConstructionLifecycle.purchaseLand(INITIAL_FACTORY_STATE).nextState;
    let state = FactoryConstructionLifecycle.startGroundbreaking(landBought).nextState;

    // Simulate 23 months
    for (let m = 0; m < 23; m++) {
      const tick = FactoryConstructionLifecycle.processMonthlyConstructionTick(state);
      expect(tick.constructionCompletedThisMonth).toBe(false);
      expect(tick.monthlyCapExDrawdownEur).toBeGreaterThan(1500000);
      state = tick.nextState;
    }
    expect(state.constructionMonthsRemaining).toBe(1);
    expect(state.ownershipStatus).toBe("under_construction");

    // Final 24th month tick
    const finalTick = FactoryConstructionLifecycle.processMonthlyConstructionTick(state);
    expect(finalTick.constructionCompletedThisMonth).toBe(true);
    expect(finalTick.nextState.ownershipStatus).toBe("operational_owned");
    expect(finalTick.nextState.factoryLevel).toBe(1);
    expect(finalTick.nextState.annualCapacity).toBe(25000);
    expect(finalTick.nextState.shops.bodyShop.status).toBe("active");
    expect(finalTick.nextState.shops.assemblyLines.status).toBe("active");
    expect(finalTick.statusMessage).toContain("FACTORY COMMISSIONING COMPLETE");
  });
});
