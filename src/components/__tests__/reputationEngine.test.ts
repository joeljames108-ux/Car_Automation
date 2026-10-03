import { describe, it, expect, beforeEach } from "vitest";
import {
  REPUTATION_DIMENSIONS_META,
  INITIAL_DIMENSION_SCORES,
  INITIAL_COMPONENT_ACCLAIMS,
  INITIAL_VEHICLE_LEGACIES,
  evaluateStakeholderSentiments,
  deriveBrandIdentity,
  evaluateMarketOpportunities,
  advanceReputationClock,
  calculateOverallReputation,
  getReputationLevel,
  evaluateAudienceSentiments,
  evaluateContractTiers,
  deriveEmergentDesignLanguage,
  calculateHiringEconomics,
  calculateConstructionEconomics,
  calculateSupplierEconomics,
  ReputationDimensionKey,
} from "../../state/reputationEngine";
import { useReputationStore } from "../../state/reputationStore";
import { useSimulationClockStore } from "../../state/simulationClockStore";

describe("Company Reputation & Economic Engine Master Suite", () => {
  beforeEach(() => {
    // Reset stores before each test
    useSimulationClockStore.setState({
      year: 1970,
      month: 1,
      day: 1,
    });
    useReputationStore.getState().resetReputation();
  });

  describe("1. 17 Specialized Reputation Dimensions & Metadata", () => {
    it("defines 17 distinct tracks across capability, operations, market, and legacy", () => {
      const dimensionKeys = Object.keys(REPUTATION_DIMENSIONS_META) as ReputationDimensionKey[];
      expect(dimensionKeys.length).toBe(17);

      const expectedDimensions: ReputationDimensionKey[] = [
        "engineering",
        "performance",
        "reliability",
        "safety",
        "luxury",
        "value",
        "innovation",
        "motorsport",
        "manufacturingQuality",
        "customerService",
        "commercialTrust",
        "heritage",
        "design",
        "contracts",
        "employer",
        "industrial",
        "supplier",
      ];

      for (const dim of expectedDimensions) {
        expect(REPUTATION_DIMENSIONS_META[dim]).toBeDefined();
        expect(REPUTATION_DIMENSIONS_META[dim].label).toBeTruthy();
        expect(REPUTATION_DIMENSIONS_META[dim].economicImpact).toBeTruthy();
        expect(["fast", "medium", "slow"]).toContain(REPUTATION_DIMENSIONS_META[dim].decaySpeed);
      }
    });

    it("verifies initial scores exist for all 17 dimensions within 5-100 bounds", () => {
      const scores = useReputationStore.getState().dimensions;
      for (const [, record] of Object.entries(scores)) {
        expect(record.score).toBeGreaterThanOrEqual(5);
        expect(record.score).toBeLessThanOrEqual(100);
        expect(record.historicalPeak).toBeGreaterThanOrEqual(record.score);
        expect(record.trendQuarterly).toBeDefined();
      }
    });

    it("modifies dimension scores with clamping between 5 and 100", () => {
      const store = useReputationStore.getState();
      const initialEng = store.dimensions.engineering.score;

      // Positive boost
      store.modifyDimension("engineering", 10, "Breakthrough R&D");
      expect(useReputationStore.getState().dimensions.engineering.score).toBe(
        Math.min(100, initialEng + 10)
      );

      // Excessive boost clamps at 100
      store.modifyDimension("engineering", 200);
      expect(useReputationStore.getState().dimensions.engineering.score).toBe(100);

      // Extreme penalty clamps at 5
      store.modifyDimension("engineering", -250);
      expect(useReputationStore.getState().dimensions.engineering.score).toBe(5);
    });
  });

  describe("2. Overall Company Reputation & 7 Meaningful Levels", () => {
    it("maps 0-100 scores to appropriate reputation level tiers and labels", () => {
      expect(getReputationLevel(10).tier).toBe("UNKNOWN");
      expect(getReputationLevel(25).tier).toBe("EMERGING");
      expect(getReputationLevel(45).tier).toBe("ESTABLISHED");
      expect(getReputationLevel(65).tier).toBe("RESPECTED");
      expect(getReputationLevel(78).tier).toBe("STRONG");
      expect(getReputationLevel(88).tier).toBe("PRESTIGIOUS");
      expect(getReputationLevel(98).tier).toBe("LEGENDARY");
    });

    it("computes overall company reputation as a balanced composite", () => {
      const overall = calculateOverallReputation(INITIAL_DIMENSION_SCORES);
      expect(overall).toBeGreaterThanOrEqual(20);
      expect(overall).toBeLessThanOrEqual(60);

      const level = getReputationLevel(overall);
      expect(["EMERGING", "ESTABLISHED", "RESPECTED"]).toContain(level.tier);
    });
  });

  describe("3. 10 Key Audiences Perception Breakdown", () => {
    it("evaluates all 10 key audiences with independent drivers", () => {
      const audiences = evaluateAudienceSentiments(INITIAL_DIMENSION_SCORES);
      expect(audiences.length).toBe(10);

      const names = audiences.map((a) => a.name);
      expect(names).toContain("General Public");
      expect(names).toContain("Vehicle Owners & Buyers");
      expect(names).toContain("Engineering Community");
      expect(names).toContain("Motorsport Community");
      expect(names).toContain("Component Suppliers");
      expect(names).toContain("Dealership Network");
      expect(names).toContain("Luxury Market & VIPs");
      expect(names).toContain("Fleet & Commercial Operators");
      expect(names).toContain("Workforce & Talent Pool");
      expect(names).toContain("Financial Institutions & Investors");

      for (const aud of audiences) {
        expect(aud.score).toBeGreaterThanOrEqual(5);
        expect(aud.score).toBeLessThanOrEqual(100);
        expect(aud.primaryDrivers.length).toBeGreaterThan(0);
      }
    });

    it("demonstrates audience-specific divergence when specializing in racing", () => {
      const raceDimensions = { ...INITIAL_DIMENSION_SCORES };
      raceDimensions.motorsport = { score: 95, trendQuarterly: 1.0, historicalPeak: 95 };
      raceDimensions.performance = { score: 92, trendQuarterly: 0.8, historicalPeak: 92 };
      raceDimensions.luxury = { score: 20, trendQuarterly: 0, historicalPeak: 20 };
      raceDimensions.value = { score: 25, trendQuarterly: 0, historicalPeak: 25 };

      const sentiments = evaluateAudienceSentiments(raceDimensions);
      const motorsportAud = sentiments.find((a) => a.name === "Motorsport Community");
      const luxuryAud = sentiments.find((a) => a.name === "Luxury Market & VIPs");

      expect(motorsportAud!.score).toBeGreaterThan(75);
      expect(luxuryAud!.score).toBeLessThan(45);
      expect(motorsportAud!.score - luxuryAud!.score).toBeGreaterThan(30);
    });
  });

  describe("4. 6 Contract Tiers Progression Ladder", () => {
    it("evaluates contract tiers from Local (Tier 1) to Prestige Works (Tier 6)", () => {
      const tiers = evaluateContractTiers(INITIAL_DIMENSION_SCORES, 35);
      expect(tiers.length).toBe(6);

      // Tier 1 should be unlocked for baseline company
      expect(tiers[0].isUnlocked).toBe(true);
      expect(tiers[0].name).toContain("Local");

      // Tier 6 should be locked initially
      expect(tiers[5].isUnlocked).toBe(false);
      expect(tiers[5].name).toContain("Prestige");
    });

    it("unlocks Prestige Tier 6 when championship conditions are met", () => {
      const eliteDimensions = { ...INITIAL_DIMENSION_SCORES };
      eliteDimensions.motorsport = { score: 92, trendQuarterly: 0.5, historicalPeak: 92 };
      eliteDimensions.engineering = { score: 88, trendQuarterly: 0.5, historicalPeak: 88 };
      eliteDimensions.contracts = { score: 82, trendQuarterly: 0.5, historicalPeak: 82 };

      const tiers = evaluateContractTiers(eliteDimensions, 85);
      const tier6 = tiers.find((t) => t.tierNumber === 6);
      expect(tier6).toBeDefined();
      expect(tier6!.isUnlocked).toBe(true);
    });
  });

  describe("5. Emergent Design Language & Aesthetic DNA", () => {
    it("derives dynamic styling identity based on product profile", () => {
      const perfScores = { ...INITIAL_DIMENSION_SCORES };
      perfScores.performance = { score: 88, trendQuarterly: 0.5, historicalPeak: 88 };
      perfScores.design = { score: 78, trendQuarterly: 0.5, historicalPeak: 78 };

      const designDNA = deriveEmergentDesignLanguage(perfScores);
      expect(designDNA.title).toBe("Circuit-Bred Aggressive");
      expect(designDNA.definingTraits.length).toBeGreaterThanOrEqual(3);
      expect(designDNA.stylingBonusDescription).toContain("Performance Enthusiasts");
    });

    it("derives Bespoke Sculpted Elegance for luxury-focused companies", () => {
      const luxScores = { ...INITIAL_DIMENSION_SCORES };
      luxScores.luxury = { score: 85, trendQuarterly: 0.5, historicalPeak: 85 };
      luxScores.design = { score: 80, trendQuarterly: 0.5, historicalPeak: 80 };

      const designDNA = deriveEmergentDesignLanguage(luxScores);
      expect(designDNA.title).toBe("Bespoke Sculpted Elegance");
      expect(designDNA.stylingBonusDescription).toContain("Luxury Buyer");
    });
  });

  describe("6. Real Economic Systems (Hiring, Construction, Supplier)", () => {
    it("calculates talent salary discounts from employer reputation", () => {
      const unknownStartup = { ...INITIAL_DIMENSION_SCORES };
      unknownStartup.employer = { score: 15, trendQuarterly: 0, historicalPeak: 15 };

      const prestigiousFirm = { ...INITIAL_DIMENSION_SCORES };
      prestigiousFirm.employer = { score: 92, trendQuarterly: 0, historicalPeak: 92 };
      prestigiousFirm.engineering = { score: 90, trendQuarterly: 0, historicalPeak: 90 };

      const startupHiring = calculateHiringEconomics(unknownStartup, "Lead Engineer", "Lead");
      const firmHiring = calculateHiringEconomics(prestigiousFirm, "Lead Engineer", "Lead");

      // Prestigious firm gets significant payroll savings on the exact same lead engineer role
      expect(firmHiring.annualSavingsPerHire).toBeGreaterThan(15000);
      expect(firmHiring.actualSalaryWithReputation).toBeLessThan(startupHiring.actualSalaryWithReputation);
      expect(firmHiring.talentPoolQuality).toContain("F1 Champions");
    });

    it("calculates construction cost savings from industrial reputation", () => {
      const trustedCompany = { ...INITIAL_DIMENSION_SCORES };
      trustedCompany.industrial = { score: 85, trendQuarterly: 0.5, historicalPeak: 85 };
      trustedCompany.contracts = { score: 85, trendQuarterly: 0.5, historicalPeak: 85 };

      const construction = calculateConstructionEconomics(trustedCompany, 100000000); // $100M

      // Fulfills the user's specific example: $100M factory built for ~$88M due to contractor trust
      expect(construction.discountPercent).toBeGreaterThanOrEqual(10);
      expect(construction.costSavings).toBeGreaterThan(10000000); // > $10M savings
      expect(construction.finalCost).toBeLessThanOrEqual(90000000); // <= $90M
      expect(construction.contractorBidsCount).toBeGreaterThanOrEqual(4);
    });

    it("calculates component discounts and deferred billing from supplier trust", () => {
      const trustedBuyer = { ...INITIAL_DIMENSION_SCORES };
      trustedBuyer.supplier = { score: 88, trendQuarterly: 0.5, historicalPeak: 88 };
      trustedBuyer.contracts = { score: 85, trendQuarterly: 0.5, historicalPeak: 85 };

      const supplierTerms = calculateSupplierEconomics(trustedBuyer);
      expect(supplierTerms.componentDiscountPercent).toBeGreaterThan(10);
      expect(supplierTerms.creditTerms).toContain("Net 90 Days");
      expect(supplierTerms.shortagePriority).toContain("Priority Allocation");
    });
  });

  describe("7. Level 1 & Level 2 Acclaim Hierarchy", () => {
    it("registers proprietary component acclaim and boosts relevant dimensions", () => {
      const initialEng = useReputationStore.getState().dimensions.engineering.score;

      useReputationStore.getState().registerComponentAcclaim({
        name: "Quad-Cam 4.0L V12 Engine",
        subsystem: "Engine / Valvetrain",
        tier: "Legendary",
        unlockedYear: 1972,
        score: 92,
        acclaimDescription: "Masterpiece of balance and mechanical reliability",
        primaryDimension: "engineering",
      });

      const updated = useReputationStore.getState();
      expect(updated.components.length).toBe(INITIAL_COMPONENT_ACCLAIMS.length + 1);
      expect(updated.dimensions.engineering.score).toBeGreaterThan(initialEng);
    });

    it("registers historical vehicle legacy records with era badges", () => {
      const initialCount = useReputationStore.getState().vehicles.length;

      useReputationStore.getState().registerVehicleLegacy({
        modelName: "Apex GT-V Stradale",
        launchYear: 1974,
        productionUnits: 450,
        overallScore: 88,
        tier: "Historic Icon",
        scores: {
          performance: 92,
          reliability: 78,
          safety: 65,
          luxury: 85,
          value: 58,
        },
        summary: "Defined modern Grand Touring",
      });

      const updated = useReputationStore.getState();
      expect(updated.vehicles.length).toBe(initialCount + 1);
      const added = updated.vehicles.find((v) => v.modelName === "Apex GT-V Stradale");
      expect(added).toBeDefined();
      expect(added!.tier).toBe("Historic Icon");
    });
  });

  describe("8. Strategic Shocks, Crises & Mitigation Room", () => {
    it("triggers reputation shocks with multi-dimensional deltas and press item", () => {
      const initialSafety = useReputationStore.getState().dimensions.safety.score;
      const initialTrust = useReputationStore.getState().dimensions.commercialTrust.score;

      useReputationStore.getState().triggerReputationShock({
        title: "Brake Caliper Recall",
        category: "safety",
        impactType: "negative",
        deltas: { safety: -12, commercialTrust: -8, reliability: -5 },
        pressHeadline: "Apex Issues Voluntary Safety Notice Over Brake Line Seals",
        mediaOutlet: "Automotive Safety Journal",
      });

      const updated = useReputationStore.getState();
      expect(updated.dimensions.safety.score).toBe(initialSafety - 12);
      expect(updated.dimensions.commercialTrust.score).toBe(initialTrust - 8);
      expect(updated.events[0].title).toBe("Brake Caliper Recall");
    });

    it("resolves crisis via Recall & 10-Yr Warranty, restoring trust and quality", () => {
      const store = useReputationStore.getState();
      store.modifyDimension("reliability", -20);
      store.modifyDimension("customerService", -15);

      const beforeResolve = useReputationStore.getState();
      const beforeRel = beforeResolve.dimensions.reliability.score;
      const beforeCs = beforeResolve.dimensions.customerService.score;

      beforeResolve.resolveCrisis("recall_and_warranty");

      const afterResolve = useReputationStore.getState();
      expect(afterResolve.dimensions.reliability.score).toBeGreaterThan(beforeRel);
      expect(afterResolve.dimensions.customerService.score).toBeGreaterThan(beforeCs);
      expect(afterResolve.events[0].pressHeadline).toContain("Free Customer Recall");
    });
  });

  describe("9. Time Progression, Momentum & Decay", () => {
    it("applies differential decay towards baseline over simulated time without active trend", () => {
      const testDimensions = { ...INITIAL_DIMENSION_SCORES };
      testDimensions.performance = { score: 90, trendQuarterly: 0, historicalPeak: 90 };
      testDimensions.heritage = { score: 90, trendQuarterly: 0, historicalPeak: 90 };

      // Advance clock by 365 days (1 full year)
      const decayed = advanceReputationClock(testDimensions, 365);

      // Fast decay (performance) decays faster than slow decay (heritage)
      expect(decayed.performance.score).toBeLessThan(90);
      expect(decayed.heritage.score).toBeLessThan(90);

      const perfLoss = 90 - decayed.performance.score;
      const heritageLoss = 90 - decayed.heritage.score;
      expect(perfLoss).toBeGreaterThan(heritageLoss);
    });
  });
});
