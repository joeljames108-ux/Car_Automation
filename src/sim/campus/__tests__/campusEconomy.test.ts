import { describe, it, expect } from "vitest";
import { CAMPUS_UNITS_REGISTRY, INITIAL_FACTORY_STATE } from "../campusRegistry";
import {
  calculateCampusMonthlyFinances,
  calculateComprehensivePrestige,
  evaluateDisasterAndSecurityEvents,
  calculateCampusEnergyProfile,
} from "../campusEconomyEngine";
import {
  CONTRACTOR_TIERS,
  enqueueConstructionJob,
  tickConstructionQueue,
  ConstructionJob,
} from "../constructionQueue";

describe("Epoch 6: Campus Economy, Contractors & Game Mechanics", () => {
  it("Phase 242: verifies Contractor tiers cost and duration multipliers", () => {
    expect(CONTRACTOR_TIERS.budget.costMultiplier).toBeLessThan(1.0);
    expect(CONTRACTOR_TIERS.budget.durationMultiplier).toBeGreaterThan(1.0);

    expect(CONTRACTOR_TIERS.standard.costMultiplier).toBe(1.0);
    expect(CONTRACTOR_TIERS.standard.durationMultiplier).toBe(1.0);

    expect(CONTRACTOR_TIERS.premium.costMultiplier).toBeGreaterThan(1.0);
    expect(CONTRACTOR_TIERS.premium.durationMultiplier).toBeLessThan(1.0);
    expect(CONTRACTOR_TIERS.premium.qualityPrestigeBonus).toBeGreaterThan(0);
  });

  it("Phase 242: enqueues construction jobs with selected contractor tier", () => {
    const jobs: ConstructionJob[] = [];
    const budgetRes = enqueueConstructionJob(
      jobs,
      "POWERTRAIN_EV_HQ",
      "Powertrain & EV HQ",
      1,
      2,
      1970,
      1,
      1,
      "budget"
    );
    expect(budgetRes.success).toBe(true);
    expect(budgetRes.createdJob?.contractorTier).toBe("budget");

    const standardRes = enqueueConstructionJob(
      jobs,
      "AERO_HQ",
      "Aero HQ",
      0,
      1,
      1970,
      1,
      1,
      "standard"
    );
    expect(standardRes.success).toBe(true);
    expect(standardRes.createdJob?.contractorTier).toBe("standard");

    const premiumRes = enqueueConstructionJob(
      jobs,
      "VEHICLE_DESIGN_HQ",
      "Vehicle Design HQ",
      1,
      2,
      1970,
      1,
      1,
      "premium"
    );
    expect(premiumRes.success).toBe(true);
    expect(premiumRes.createdJob?.contractorTier).toBe("premium");
    // Premium cost is higher, duration is lower
    expect(premiumRes.createdJob!.totalCost).toBeGreaterThan(budgetRes.createdJob!.totalCost);
  });

  it("Phase 248: calculates passive monthly campus revenue accurately", () => {
    const units = { ...CAMPUS_UNITS_REGISTRY };
    const finances = calculateCampusMonthlyFinances(units, 40, 1970);

    expect(finances.facilitiesMaintenance).toBeGreaterThan(0);
    expect(finances.engineeringPayroll).toBeGreaterThan(0);
    expect(finances.utilitiesAndEnergy).toBeGreaterThan(0);
    expect(finances.totalOperatingExpenses).toBeGreaterThan(0);

    // Passive revenue from operational units
    expect(finances.revenue.totalMonthlyRevenue).toBeGreaterThanOrEqual(0);
  });

  it("Phase 250: calculates comprehensive prestige score (0-100) and brand tiers", () => {
    const units = { ...CAMPUS_UNITS_REGISTRY };
    const prestige = calculateComprehensivePrestige(units, INITIAL_FACTORY_STATE);

    expect(prestige.score).toBeGreaterThanOrEqual(5);
    expect(prestige.score).toBeLessThanOrEqual(100);
    expect(["GARAGE_STARTUP", "REGIONAL_CONTENDER", "ESTABLISHED_OEM", "GLOBAL_BENCHMARK", "LEGENDARY_EMPIRE"]).toContain(prestige.tier);
    expect(prestige.brandPerceptionMultiplier).toBeGreaterThanOrEqual(1.0);
  });

  it("Phase 253 & 254: evaluates green energy adoption across eras", () => {
    const units = { ...CAMPUS_UNITS_REGISTRY };
    const energy1970 = calculateCampusEnergyProfile(units, 1970);
    const energy2025 = calculateCampusEnergyProfile(units, 2025);

    expect(energy1970.greenEnergyPct).toBe(0);
    expect(energy1970.esgRating).toBe("D");

    expect(energy2025.greenEnergyPct).toBeGreaterThanOrEqual(80);
    expect(energy2025.esgRating).toBe("A+");
    expect(energy2025.monthlyCarbonTons).toBeLessThan(energy1970.monthlyCarbonTons);
  });

  it("Phase 251 & 252: evaluates disaster check and security mitigation safely", () => {
    const units = { ...CAMPUS_UNITS_REGISTRY };
    const check = evaluateDisasterAndSecurityEvents(units, 1975, 1, 3);
    expect(typeof check.hasIncident).toBe("boolean");
    expect(typeof check.mitigatedBySecurity).toBe("boolean");
  });
});
