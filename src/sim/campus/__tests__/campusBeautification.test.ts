import { describe, it, expect } from "vitest";
import {
  resolveBeautificationTier,
  calculateBeautificationBudget,
  computeSpecializationScores,
  determineDominantSpecialization,
  computeBeautificationState,
  getBeautificationSummaryText,
  BEAUTIFICATION_ASSET_REGISTRY,
  BEAUTIFICATION_TIER_CONFIG,
} from "../campusBeautificationEngine";

describe("Dynamic HQ Beautification & Prestige Engine", () => {
  describe("1. Tier Resolution & Budget Scaling", () => {
    it("correctly maps reputation (0–100) to corresponding prestige tiers", () => {
      expect(resolveBeautificationTier(0)).toBe("STARTUP");
      expect(resolveBeautificationTier(8)).toBe("STARTUP");
      expect(resolveBeautificationTier(10)).toBe("STARTUP");
      expect(resolveBeautificationTier(11)).toBe("GROWING");
      expect(resolveBeautificationTier(25)).toBe("GROWING");
      expect(resolveBeautificationTier(26)).toBe("ESTABLISHED");
      expect(resolveBeautificationTier(50)).toBe("ESTABLISHED");
      expect(resolveBeautificationTier(51)).toBe("PRESTIGIOUS");
      expect(resolveBeautificationTier(75)).toBe("PRESTIGIOUS");
      expect(resolveBeautificationTier(76)).toBe("ICONIC");
      expect(resolveBeautificationTier(100)).toBe("ICONIC");

      // Clamping boundary tests
      expect(resolveBeautificationTier(-10)).toBe("STARTUP");
      expect(resolveBeautificationTier(150)).toBe("ICONIC");
    });

    it("allocates increasing point budgets across ascending tiers", () => {
      expect(calculateBeautificationBudget("STARTUP")).toBe(20);
      expect(calculateBeautificationBudget("GROWING")).toBe(50);
      expect(calculateBeautificationBudget("ESTABLISHED")).toBe(120);
      expect(calculateBeautificationBudget("PRESTIGIOUS")).toBe(220);
      expect(calculateBeautificationBudget("ICONIC")).toBe(350);

      const tiers = Object.keys(BEAUTIFICATION_TIER_CONFIG) as (keyof typeof BEAUTIFICATION_TIER_CONFIG)[];
      for (let i = 1; i < tiers.length; i++) {
        expect(BEAUTIFICATION_TIER_CONFIG[tiers[i]].budget).toBeGreaterThan(
          BEAUTIFICATION_TIER_CONFIG[tiers[i - 1]].budget
        );
      }
    });
  });

  describe("2. Asset Registry Completeness", () => {
    it("contains ~45 rich automotive decorative asset definitions", () => {
      const keys = Object.keys(BEAUTIFICATION_ASSET_REGISTRY);
      expect(keys.length).toBeGreaterThanOrEqual(40);

      // Verify every asset has required metadata
      for (const asset of Object.values(BEAUTIFICATION_ASSET_REGISTRY)) {
        expect(asset.id).toBeTruthy();
        expect(asset.category).toBeTruthy();
        expect(asset.name).toBeTruthy();
        expect(asset.budgetCost).toBeGreaterThan(0);
        expect(asset.glbAssetTag).toMatch(/^GEO_DECO_/);
        expect(asset.placementZone).toBeTruthy();
      }
    });
  });

  describe("3. Specialization Determination", () => {
    it("derives correct specialization scores and dominant track", () => {
      const scores = computeSpecializationScores(
        undefined,
        undefined,
        {
          motorsport: 85,
          engineering: 40,
          safety: 30,
          luxury: 25,
          environmental: 15,
        }
      );

      expect(scores.motorsport).toBe(85);
      expect(scores.engineering).toBe(40);

      const dominant = determineDominantSpecialization(scores);
      expect(dominant).toBe("motorsport");
    });

    it("returns null dominant specialization if all tracks are low", () => {
      const dominant = determineDominantSpecialization({
        engineering: 20,
        motorsport: 10,
        safety: 25,
        luxury: 20,
        environmental: 15,
      });
      expect(dominant).toBeNull();
    });
  });

  describe("4. State Computation & Budget Allocation", () => {
    it("allocates starter assets within STARTUP tier budget (20 pts)", () => {
      const state = computeBeautificationState({
        reputation: 5,
        gameMonth: 1,
      });

      expect(state.tier).toBe("STARTUP");
      expect(state.totalBudget).toBe(20);
      expect(state.budgetSpent).toBeLessThanOrEqual(20);
      expect(state.budgetSpent).toBeGreaterThan(0);
      expect(state.activeAssets.length).toBeGreaterThan(0);

      // Startup assets check
      const activeIds = state.activeAssets.map((a) => a.assetId);
      expect(activeIds).toContain("ENT_BASIC_DOOR");
    });

    it("allocates higher-tier assets at PRESTIGIOUS reputation (65 pts)", () => {
      const state = computeBeautificationState({
        reputation: 65,
        gameMonth: 24,
      });

      expect(state.tier).toBe("PRESTIGIOUS");
      expect(state.totalBudget).toBe(220);
      expect(state.budgetSpent).toBeLessThanOrEqual(220);

      const activeIds = state.activeAssets.map((a) => a.assetId);
      // Grand plaza or similar prestigious features should be active
      expect(activeIds).toContain("ENT_GRAND_PLAZA");
      // Basic door should be superseded and thus NOT active
      expect(activeIds).not.toContain("ENT_BASIC_DOOR");
    });
  });

  describe("5. Historical Heritage Preservation (Non-Destructive)", () => {
    it("preserves old assets as heritage when reputation drops", () => {
      // Step 1: Company reaches high reputation (70) and builds prestigious assets
      const stateAtPeak = computeBeautificationState({
        reputation: 70,
        gameMonth: 36,
      });

      const peakHeritageCount = stateAtPeak.heritageAssets.length;
      expect(peakHeritageCount).toBeGreaterThanOrEqual(5);

      // Step 2: Disaster or scandal strikes! Reputation collapses to 15 (GROWING tier)
      const stateAfterCrisis = computeBeautificationState({
        reputation: 15,
        previousState: stateAtPeak,
        gameMonth: 48,
      });

      expect(stateAfterCrisis.tier).toBe("GROWING");
      expect(stateAfterCrisis.totalBudget).toBe(50);
      expect(stateAfterCrisis.budgetSpent).toBeLessThanOrEqual(50);

      // CRITICAL HERITAGE LAW: None of the historic assets are deleted
      expect(stateAfterCrisis.heritageAssets.length).toBeGreaterThanOrEqual(peakHeritageCount);

      // Verify each peak heritage asset still exists in the heritage list
      for (const peakAsset of stateAtPeak.heritageAssets) {
        const found = stateAfterCrisis.heritageAssets.find((h) => h.assetId === peakAsset.assetId);
        expect(found).toBeDefined();
      }
    });

    it("marks superseded assets as isOverridden in heritage records", () => {
      const stateL1 = computeBeautificationState({
        reputation: 5,
        gameMonth: 1,
      });
      expect(stateL1.activeAssets.map((a) => a.assetId)).toContain("ENT_BASIC_DOOR");

      // Upgrade to ESTABLISHED tier (ENT_GLASS_LOBBY replaces earlier doors)
      const stateL2 = computeBeautificationState({
        reputation: 40,
        previousState: stateL1,
        gameMonth: 12,
      });

      expect(stateL2.activeAssets.map((a) => a.assetId)).toContain("ENT_GLASS_LOBBY");
      expect(stateL2.activeAssets.map((a) => a.assetId)).not.toContain("ENT_BASIC_DOOR");

      // But ENT_BASIC_DOOR is preserved in heritageAssets with active=false
      const doorHeritage = stateL2.heritageAssets.find((h) => h.assetId === "ENT_BASIC_DOOR");
      expect(doorHeritage).toBeDefined();
      expect(doorHeritage?.active).toBe(false);
      expect(doorHeritage?.isOverridden).toBe(true);
    });
  });

  describe("6. Specialization Priority Differentiation", () => {
    it("prioritizes motorsport assets when company specializes in motorsport", () => {
      const state = computeBeautificationState({
        reputation: 60,
        specializationOverrides: {
          motorsport: 90,
          engineering: 30,
          safety: 20,
          luxury: 20,
          environmental: 10,
        },
      });

      expect(state.dominantSpecialization).toBe("motorsport");
      const activeIds = state.activeAssets.map((a) => a.assetId);
      expect(activeIds).toContain("ENT_MOTORSPORT_ARCH");
      expect(activeIds).toContain("SCULPT_TROPHY_CASE");
      expect(activeIds).toContain("SPEC_RACING_LIVERY_WALL");
    });

    it("prioritizes safety and environmental assets respectively", () => {
      const safetyState = computeBeautificationState({
        reputation: 40,
        specializationOverrides: {
          safety: 85,
        },
      });
      expect(safetyState.activeAssets.map((a) => a.assetId)).toContain("SPEC_CRASH_DUMMY");

      const ecoState = computeBeautificationState({
        reputation: 60,
        specializationOverrides: {
          environmental: 90,
        },
      });
      const ecoIds = ecoState.activeAssets.map((a) => a.assetId);
      expect(ecoIds).toContain("LAND_GREEN_WALL");
      expect(ecoIds).toContain("SPEC_EV_CHARGER_GARDEN");
    });
  });

  describe("7. Summary and Reporting", () => {
    it("generates descriptive campus beautification text summary", () => {
      const state = computeBeautificationState({
        reputation: 80,
        specializationOverrides: {
          motorsport: 80,
        },
      });

      const summary = getBeautificationSummaryText(state);
      expect(summary).toContain("ICONIC");
      expect(summary).toContain("pts");
      expect(summary).toContain("MOTORSPORT");
    });
  });
});
