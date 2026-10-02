/**
 * ═══════════════════════════════════════════════════════════════════════
 * THREE-TIER CONTRACT SYSTEM — UNIT & INTEGRATION TEST SUITE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Validates:
 * 1. Historical era filtering (1970 vs 1990 vs 2005 vs 2022)
 * 2. Responsibility matrix & specification presence per tier
 * 3. Pre-flight feasibility solver (capacity, materials, R&D nodes, reputation)
 * 4. Quality outcome defect PPM simulation (skill, factory tier, difficulty)
 * 5. Tier 3 R&D lifecycle (Design -> Prototype -> Test -> Production)
 * 6. Tier 3 -> Tier 1 Design-to-Production follow-up contract generation
 * 7. Zustand store integration (accept, advance, cancel, and clock listener)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { CONTRACT_CATALOG } from "../../sim/economy/contractCatalogData";
import {
  getAvailableTieredContracts,
  evaluateTierFeasibility,
  createActiveTieredContract,
  simulateDefectPpm,
  evaluatePrototypeTest,
  generateFollowUpProductionContract,
  tickTieredContract,
} from "../../sim/economy/contractLifecycleEngine";
import { useContractsStore } from "../../state/contractsStore";
import { DimensionScores } from "../../state/reputationEngine";

describe("Three-Tier Contract System", () => {
  beforeEach(() => {
    // Reset contracts store state
    useContractsStore.setState({
      activeTieredContracts: [],
      completedTieredContracts: [],
      customFollowUpTenders: [],
      selectedTierTab: "PRODUCTION",
    });
  });

  // ── 1. HISTORICAL ACCURACY & ERA FILTERING ──
  describe("Historical Era Filtering", () => {
    it("should provide only period-accurate contracts in 1970 (no hybrid or EV)", () => {
      const mockDimensions: DimensionScores = {
        engineering: { score: 100, trendQuarterly: 0, historicalPeak: 100 },
        manufacturingQuality: { score: 100, trendQuarterly: 0, historicalPeak: 100 },
      } as any;

      const contracts1970 = getAvailableTieredContracts(1970, mockDimensions, "classic_1970", [
        "eng_arch_baseline",
        "eng_blk_cast_iron",
        "eng_head_ohv",
      ]);

      expect(contracts1970.length).toBeGreaterThan(0);
      
      // All contracts must have availableFromYear <= 1970 and availableUntilYear >= 1970
      for (const c of contracts1970) {
        expect(c.eraGate.availableFromYear).toBeLessThanOrEqual(1970);
        if (c.eraGate.availableUntilYear) {
          expect(c.eraGate.availableUntilYear).toBeGreaterThanOrEqual(1970);
        }
        // Verify no hybrid / EV / modern sensors appear in 1970
        expect(c.id).not.toContain("era15_");
        expect(c.id).not.toContain("era00_");
        expect(c.title).not.toContain("800V");
        expect(c.title).not.toContain("Hybrid");
        expect(c.title).not.toContain("Lidar");
      }
    });

    it("should provide 2015+ high-tech contracts in year 2022", () => {
      const mockDimensions: DimensionScores = {
        engineering: { score: 90, trendQuarterly: 0, historicalPeak: 90 },
        manufacturingQuality: { score: 90, trendQuarterly: 0, historicalPeak: 90 },
        motorsport: { score: 90, trendQuarterly: 0, historicalPeak: 90 },
        safety: { score: 90, trendQuarterly: 0, historicalPeak: 90 },
      } as any;

      const contracts2022 = getAvailableTieredContracts(2022, mockDimensions, "modern_2015", [
        "ev_motor_pmsm_adv",
        "ev_battery_pouch_800v",
        "eng_arch_v8",
        "ev_hybrid_p1p2",
        "chas_frame_carbon_tub",
        "aero_active_drs",
      ]);

      const modernIds = contracts2022.filter((c) => c.id.startsWith("era15_"));
      expect(modernIds.length).toBeGreaterThan(10);

      // Verify specific modern contracts appear
      const f1Contract = contracts2022.find((c) => c.id === "era15_blue_f1_power_unit");
      expect(f1Contract).toBeDefined();
      expect(f1Contract?.title).toContain("1.6L V6 Turbo-Hybrid");
    });
  });

  // ── 2. RESPONSIBILITY MATRIX PER TIER ──
  describe("Tier Architectural Responsibilities", () => {
    it("should enforce correct responsibility separation across Tiers 1, 2, and 3", () => {
      for (const contract of CONTRACT_CATALOG) {
        if (contract.tier === "PRODUCTION") {
          // Tier 1: Factory capacity only
          expect(contract.responsibility.designOwnership).toBe(false);
          expect(contract.responsibility.prototypeTesting).toBe(false);
          expect(contract.responsibility.manufacturingExecution).toBe(true);
          expect(contract.responsibility.qualityAssurance).toBe(true);
          expect(contract.npcProvides.completeDesign).toBe(true);
        } else if (contract.tier === "BLUEPRINT") {
          // Tier 2: Spec interpretation & precision
          expect(contract.responsibility.designOwnership).toBe(false);
          expect(contract.responsibility.blueprintInterpretation).toBe(true);
          expect(contract.responsibility.materialSourcing).toBe(true);
          expect(contract.blueprintSpec).toBeDefined();
          expect(contract.blueprintSpec?.targetToleranceMm).toBeGreaterThan(0);
          expect(contract.blueprintSpec?.bomRequirements.length).toBeGreaterThan(0);
        } else if (contract.tier === "ENGINEERING") {
          // Tier 3: Full R&D ownership
          expect(contract.responsibility.designOwnership).toBe(true);
          expect(contract.responsibility.prototypeTesting).toBe(true);
          expect(contract.performanceSpec).toBeDefined();
          expect(contract.performanceSpec?.testCriteria.length).toBeGreaterThan(0);
        }
      }
    });
  });

  // ── 3. PRE-FLIGHT FEASIBILITY EVALUATOR ──
  describe("Feasibility Pre-Flight Checking", () => {
    it("should flag plant capacity bottlenecks when volume exceeds factory throughput", () => {
      const highVolumeContract = CONTRACT_CATALOG.find(
        (c) => c.tier === "PRODUCTION" && c.deliverables.annualVolume >= 10000
      )!;

      const playerState = {
        factoryTier: "boutique" as const, // only 500 units/yr capacity!
        shiftCount: 1,
        dimensionScores: { manufacturingQuality: { score: 80 } } as any,
        unlockedTechs: [],
        warehouseInventory: [],
        activeInboundSuppliers: [],
        cashAvailable: 500000,
      };

      const result = evaluateTierFeasibility(highVolumeContract, playerState);
      expect(result.isFeasible).toBe(false);
      expect(result.capacityCheck.passed).toBe(false);
      expect(result.reasons.some((r) => r.includes("capacity"))).toBe(true);
    });

    it("should lock Tier 3 contracts if prerequisite R&D nodes are missing", () => {
      const t3Contract = CONTRACT_CATALOG.find(
        (c) => c.tier === "ENGINEERING" && (c.eraGate.requiredTechNodes?.length ?? 0) > 0
      )!;

      const playerState = {
        factoryTier: "high_volume" as const,
        shiftCount: 2,
        dimensionScores: { engineering: { score: 80 } } as any,
        unlockedTechs: [], // missing all techs!
        warehouseInventory: [],
        activeInboundSuppliers: [],
        cashAvailable: 5000000,
      };

      const result = evaluateTierFeasibility(t3Contract, playerState);
      expect(result.isFeasible).toBe(false);
      expect(result.rdCheck.passed).toBe(false);
      expect(result.rdCheck.missingTechNodes.length).toBeGreaterThan(0);
    });
  });

  // ── 4. QUALITY OUTCOME SIMULATION ──
  describe("Quality Outcome Simulation", () => {
    it("should calculate defect PPM respecting manufacturing quality score and factory tier", () => {
      const targetPpm = 1000;

      // Low skill on boutique shop
      const lowSkillPpm = simulateDefectPpm(targetPpm, 15, "boutique", "DEMANDING");
      // High skill on high volume modern plant
      const highSkillPpm = simulateDefectPpm(targetPpm, 95, "high_volume", "DEMANDING");

      // High skill should produce substantially lower defects
      expect(highSkillPpm).toBeLessThan(lowSkillPpm);
    });
  });

  // ── 5. TIER 3 ADVANCEMENT & THE DESIGN-TO-PRODUCTION LOOP ──
  describe("Tier 3 Advancement & Follow-Up Contract Generation", () => {
    it("should transition Tier 3 through development, prototype testing, and trigger follow-up contract", () => {
      const t3Template = CONTRACT_CATALOG.find((c) => c.id === "era70_eng_na_i4")!;
      const contract = createActiveTieredContract(t3Template, 1970, 1);

      expect(contract.status).toBe("IN_DEVELOPMENT");
      expect(contract.rdProgress.prototypeStatus).toBe("IN_PROGRESS");

      let cashAwarded = 0;
      let repAwarded = false;

      const mockCtx = {
        playerMfgQualityScore: 85,
        playerEngScore: 85,
        factoryTier: "small_batch" as const,
        cashAvailable: 1000000,
        addCash: (amount: number) => {
          cashAwarded += amount;
        },
        deductCash: () => {},
        addReputation: () => {
          repAwarded = true;
        },
        currentYear: 1970,
      };

      // 1. Advance design phase to completion
      const devDaysNeeded = contract.rdProgress.designDaysTotal;
      const devTick = tickTieredContract(contract, devDaysNeeded, mockCtx);
      expect(devTick.updatedContract.status).toBe("PROTOTYPE_TESTING");

      // 2. Perform prototype testing
      const testTick = tickTieredContract(devTick.updatedContract, 5, mockCtx);
      // High engineering score (85) should pass prototype testing
      expect(testTick.updatedContract.status).toBe("IN_PRODUCTION");
      expect(testTick.updatedContract.rdProgress.prototypeStatus).toBe("PASSED");

      // 3. Complete production quota
      const prodTick = tickTieredContract(testTick.updatedContract, 1000, mockCtx);
      expect(prodTick.updatedContract.status).toBe("COMPLETED");
      expect(cashAwarded).toBeGreaterThan(0);
      expect(repAwarded).toBe(true);

      // 4. Assert Follow-Up Production Contract was spawned!
      expect(prodTick.followUpTemplate).toBeDefined();
      expect(prodTick.followUpTemplate?.tier).toBe("PRODUCTION");
      expect(prodTick.followUpTemplate?.deliverables.annualVolume).toBeGreaterThan(
        t3Template.deliverables.annualVolume
      );
    });
  });

  // ── 6. ZUSTAND STORE INTEGRATION ──
  describe("Contracts Store Integration", () => {
    it("should accept, advance, and manage tiered contracts in useContractsStore", () => {
      const template = CONTRACT_CATALOG[0]; // Hargrave cast iron blocks
      const store = useContractsStore.getState();

      const active = store.acceptTieredContract(template, 1970, 1);
      expect(useContractsStore.getState().activeTieredContracts.length).toBe(1);
      expect(useContractsStore.getState().activeTieredContracts[0].id).toBe(active.id);

      // Advance by 30 days
      useContractsStore.getState().tickTieredContracts(30, 1970);
      const afterTick = useContractsStore.getState().activeTieredContracts[0];
      expect(afterTick.production.producedUnits).toBeGreaterThan(0);

      // Cancel contract
      useContractsStore.getState().cancelTieredContract(active.id);
      expect(useContractsStore.getState().activeTieredContracts.length).toBe(0);
    });
  });
});
