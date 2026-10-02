/**
 * AUTO TYCOON CAMPUS HQ - DATA LAYER INTEGRATION TEST SUITE (PHASE 30)
 * 
 * Verifies all Phase 1–29 data modules:
 * - Plot coordinates & zone boundary tests
 * - Building progression schema & resource inflation
 * - Construction queue lifecycle
 * - Sub-department tree validity
 * - Unlock condition evaluator
 * - Staff allocation efficiency
 * - Systemic campus bonuses & synergies
 * - Logistics & staging inventory
 * - Serialization round-trip integrity
 * - CampusEngine tick integration
 */

import { describe, it, expect } from "vitest";
import {
  CAMPUS_PLOTS,
  getAllPlots,
  getPlotByUnitId,
  getPlotsByZone,
  getStarterPlots1970,
  getLockedPlots1970,
  isPointInZone,
} from "../campusPlotCoordinates";
import { CAMPUS_ZONE_REGISTRY, getAllZones, getZoneByUnitId } from "../campusZoneRegistry";
import {
  BUILDING_LEVEL_PROGRESSION,
  getBuildingLevelRequirements,
  getBuildingLevelDefinition,
} from "../buildingProgression";
import {
  CONSTRUCTION_RESOURCES,
  getResourceUnitPrice,
  calculateBillOfMaterialsCost,
} from "../constructionResources";
import {
  enqueueConstructionJob,
  tickConstructionQueue,
  cancelConstructionJob,
  getMaxConcurrentConstructionJobs,
} from "../constructionQueue";
import {
  SUB_DEPARTMENT_DEFINITIONS,
  getUnlockedSubDepartmentsForLevel,
  getSubDepartmentDefinition,
} from "../subDepartmentTree";
import { evaluateUnlockConditions } from "../campusUnlockEngine";
import { calculateSubDepartmentEfficiency } from "../staffAllocationEngine";
import { calculateCampusBonuses } from "../campusBonusEngine";
import {
  createMaterialOrder,
  advanceMaterialOrders,
  hasSufficientMaterials,
  evaluateSeasonalWeather,
} from "../constructionLogistics";
import { createCampusEvent, evaluateRandomCampusIncident } from "../campusEvents";
import { serializeCampusState, deserializeCampusState } from "../campusSerialization";
import { CampusEngine } from "../campusEngine";
import { CAMPUS_UNITS_REGISTRY, INITIAL_FACTORY_STATE } from "../campusRegistry";
import { CampusUnitId } from "../campusTypes";

describe("Campus HQ Data Layer Test Suite (Phases 1–30)", () => {
  // ── PHASE 1: Plot Coordinates ──
  describe("Phase 1: Plot Coordinates & Zoning Boundaries", () => {
    it("should have all 14 units mapped to valid 3D plots", () => {
      const plots = getAllPlots();
      expect(plots.length).toBe(14);
      for (const plot of plots) {
        expect(plot.plotId).toBeDefined();
        expect(plot.worldPosition).toBeDefined();
        expect(typeof plot.worldPosition.x).toBe("number");
        expect(typeof plot.worldPosition.z).toBe("number");
        expect(plot.footprintMeters.width).toBeGreaterThan(10);
        expect(plot.footprintMeters.length).toBeGreaterThan(10);
      }
    });

    it("should correctly partition 7 starter plots and 7 locked plots for 1970", () => {
      const starters = getStarterPlots1970();
      const locked = getLockedPlots1970();
      expect(starters.length).toBe(7);
      expect(locked.length).toBe(7);
      expect(starters.some((p) => p.unitId === "CENTRAL_CORPORATE_HQ")).toBe(true);
      expect(locked.some((p) => p.unitId === "AERO_HQ")).toBe(true);
      expect(locked.some((p) => p.unitId === "FACTORY")).toBe(true);
    });

    it("should correctly evaluate point-in-zone polygon containment", () => {
      // Zone A is in NW sector (e.g. x = -130, z = -70)
      expect(isPointInZone(-130, -70, "ZONE_A")).toBe(true);
      expect(isPointInZone(50, 50, "ZONE_A")).toBe(false);

      // Zone C is central (e.g. x = 50, z = 20)
      expect(isPointInZone(50, 20, "ZONE_C")).toBe(true);
    });
  });

  // ── PHASE 2: Zone Registry ──
  describe("Phase 2: Zone Registry", () => {
    it("should register all 4 campus zones with complete metadata", () => {
      const zones = getAllZones();
      expect(zones.length).toBe(4);
      const zoneIds = zones.map((z) => z.id);
      expect(zoneIds).toContain("ZONE_A");
      expect(zoneIds).toContain("ZONE_B");
      expect(zoneIds).toContain("ZONE_C");
      expect(zoneIds).toContain("ZONE_D");
    });

    it("should associate each unit to its designated zone", () => {
      const corpHqZone = getZoneByUnitId("CENTRAL_CORPORATE_HQ");
      expect(corpHqZone?.id).toBe("ZONE_C");
      const factoryZone = getZoneByUnitId("FACTORY");
      expect(factoryZone?.id).toBe("ZONE_A");
    });
  });

  // ── PHASE 3 & 4: Building Progression & Construction Resources ──
  describe("Phases 3 & 4: Building Progression & Historical Pricing", () => {
    it("should define all 8 progression levels from 0 to 7", () => {
      for (let lvl = 0; lvl <= 7; lvl++) {
        const def = getBuildingLevelDefinition(lvl);
        expect(def.level).toBe(lvl);
        expect(def.tierLabel).toBeDefined();
        expect(def.triangleBudgetMax).toBeGreaterThan(def.triangleBudgetMin);
      }
    });

    it("should accurately inflate material costs from 1970 to 2030", () => {
      const price1970 = getResourceUnitPrice("STEEL", 1970);
      const price1990 = getResourceUnitPrice("STEEL", 1990);
      const price2020 = getResourceUnitPrice("STEEL", 2020);
      expect(price1970).toBe(180);
      expect(price1990).toBeGreaterThan(price1970);
      expect(price2020).toBeGreaterThan(price1990);
    });

    it("should calculate building requirements scaled by unit footprint", () => {
      const corpHqReq = getBuildingLevelRequirements("CENTRAL_CORPORATE_HQ", 2, 1970);
      const factoryReq = getBuildingLevelRequirements("FACTORY", 2, 1970);
      expect(factoryReq.estimatedCost).toBeGreaterThan(corpHqReq.estimatedCost);
      expect(factoryReq.constructionMonths).toBeGreaterThanOrEqual(corpHqReq.constructionMonths);
    });
  });

  // ── PHASE 5: Construction Queue ──
  describe("Phase 5: Construction Queue Management", () => {
    it("should allow enqueuing up to max concurrent jobs", () => {
      const maxAllowed = getMaxConcurrentConstructionJobs(1);
      expect(maxAllowed).toBe(2);

      let jobs: any[] = [];
      const job1 = enqueueConstructionJob(jobs, "POWERTRAIN_EV_HQ", "Powertrain HQ", 1, 2, 1970, 1, 1);
      expect(job1.success).toBe(true);
      jobs = job1.updatedJobs;

      const job2 = enqueueConstructionJob(jobs, "VEHICLE_DESIGN_HQ", "Design HQ", 1, 2, 1970, 1, 1);
      expect(job2.success).toBe(true);
      jobs = job2.updatedJobs;

      // 3rd job should be rejected due to capacity limit
      const job3 = enqueueConstructionJob(jobs, "CHASSIS_DYNAMICS_HQ", "Chassis HQ", 1, 2, 1970, 1, 1);
      expect(job3.success).toBe(false);
      expect(job3.error).toContain("capacity full");
    });

    it("should advance progress and mark job completed when elapsed time reached", () => {
      const enqueue = enqueueConstructionJob([], "CHASSIS_DYNAMICS_HQ", "Chassis HQ", 1, 2, 1970, 1, 1);
      expect(enqueue.success).toBe(true);
      let currentJobs = enqueue.updatedJobs;
      const totalMonths = currentJobs[0].totalMonthsRequired;

      // Tick forward by half the duration
      const halfTick = tickConstructionQueue(currentJobs, Math.floor(totalMonths / 2));
      expect(halfTick.completedJobs.length).toBe(0);
      expect(halfTick.updatedJobs[0].progressPct).toBeGreaterThan(0);
      expect(halfTick.updatedJobs[0].status).toBe("in_progress");

      // Tick forward past completion
      const fullTick = tickConstructionQueue(halfTick.updatedJobs, totalMonths);
      expect(fullTick.completedJobs.length).toBe(1);
      expect(fullTick.completedJobs[0].status).toBe("completed");
      expect(fullTick.completedJobs[0].progressPct).toBe(100);
    });

    it("should allow cancelling an in-progress construction job", () => {
      const enqueue = enqueueConstructionJob([], "INTERIOR_HQ", "Interior HQ", 1, 2, 1970, 1, 1);
      const jobId = enqueue.createdJob!.jobId;
      const cancelled = cancelConstructionJob(enqueue.updatedJobs, jobId);
      expect(cancelled.success).toBe(true);
      expect(cancelled.updatedJobs[0].status).toBe("cancelled");
    });
  });

  // ── PHASES 6–20: Sub-Department Trees ──
  describe("Phases 6–20: Sub-Department Tree Hierarchy", () => {
    it("should have sub-departments defined for all 14 units", () => {
      const unitKeys = Object.keys(CAMPUS_PLOTS) as CampusUnitId[];
      for (const unitId of unitKeys) {
        const depts = SUB_DEPARTMENT_DEFINITIONS[unitId];
        expect(depts).toBeDefined();
        expect(depts.length).toBeGreaterThanOrEqual(4);
      }
    });

    it("should progressively unlock sub-departments as building level increases", () => {
      const l1Depts = getUnlockedSubDepartmentsForLevel("CENTRAL_CORPORATE_HQ", 1);
      const l3Depts = getUnlockedSubDepartmentsForLevel("CENTRAL_CORPORATE_HQ", 3);
      const l7Depts = getUnlockedSubDepartmentsForLevel("CENTRAL_CORPORATE_HQ", 7);
      expect(l1Depts.length).toBeGreaterThan(0);
      expect(l3Depts.length).toBeGreaterThan(l1Depts.length);
      expect(l7Depts.length).toBeGreaterThan(l3Depts.length);
    });
  });

  // ── PHASE 23: Unlock Evaluator ──
  describe("Phase 23: Campus Unlock Evaluator", () => {
    it("should allow starter buildings in 1970", () => {
      const res = evaluateUnlockConditions("CENTRAL_CORPORATE_HQ", {
        currentYear: 1970,
        corporateLevel: 1,
        cashOnHand: 500000,
        companyReputation: 10,
        activeUnitIds: ["CENTRAL_CORPORATE_HQ"],
      });
      expect(res.canUnlock).toBe(true);
      expect(res.missingRequirements.length).toBe(0);
    });

    it("should deny locked expansion plots when conditions are not satisfied", () => {
      const res = evaluateUnlockConditions("AERO_HQ", {
        currentYear: 1970, // Requires 1972
        corporateLevel: 1, // Requires L2
        cashOnHand: 500000, // Requires $1.8M
        companyReputation: 10, // Requires 20
        activeUnitIds: ["CENTRAL_CORPORATE_HQ"],
      });
      expect(res.canUnlock).toBe(false);
      expect(res.missingRequirements.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ── PHASE 24: Staff Allocation Engine ──
  describe("Phase 24: Staff Allocation & Efficiency", () => {
    it("should calculate correct efficiency penalty when understaffed", () => {
      const result = calculateSubDepartmentEfficiency("CENTRAL_CORPORATE_HQ", "corp_ceo_office", []);
      expect(result.netEfficiencyMultiplier).toBe(0);
      expect(result.understaffed).toBe(true);
    });

    it("should provide high efficiency when staffed with matching specialists", () => {
      const staff = [
        {
          employeeId: "EMP_1",
          unitId: "CENTRAL_CORPORATE_HQ" as CampusUnitId,
          subDepartmentId: "corp_ceo_office",
          specialization: "executive_management" as const,
          skillLevel: 8,
          morale: 90,
        },
        {
          employeeId: "EMP_2",
          unitId: "CENTRAL_CORPORATE_HQ" as CampusUnitId,
          subDepartmentId: "corp_ceo_office",
          specialization: "executive_management" as const,
          skillLevel: 7,
          morale: 85,
        },
      ];
      const result = calculateSubDepartmentEfficiency("CENTRAL_CORPORATE_HQ", "corp_ceo_office", staff);
      expect(result.netEfficiencyMultiplier).toBeGreaterThanOrEqual(1.0);
      expect(result.skillMatchScorePct).toBeGreaterThanOrEqual(80);
    });
  });

  // ── PHASE 25: Campus Bonuses & Synergies ──
  describe("Phase 25: Campus Bonus Engine", () => {
    it("should compute base bonuses for 1970 starter campus", () => {
      const bonuses = calculateCampusBonuses(CAMPUS_UNITS_REGISTRY);
      expect(bonuses.rndSpeedBonusPct).toBeGreaterThan(0);
      expect(bonuses.stylingPrestigeScore).toBeGreaterThan(0);
      expect(bonuses.qualityAssuranceRating).toBeGreaterThanOrEqual(60);
    });

    it("should trigger specialized synergies when prerequisite buildings are active", () => {
      const upgradedRegistry = {
        ...CAMPUS_UNITS_REGISTRY,
        AERO_HQ: { ...CAMPUS_UNITS_REGISTRY.AERO_HQ, status: "operational" as const, level: 3 },
        MOTORSPORT_HQ: { ...CAMPUS_UNITS_REGISTRY.MOTORSPORT_HQ, status: "operational" as const, level: 2 },
      };
      const bonuses = calculateCampusBonuses(upgradedRegistry);
      expect(bonuses.synergiesActive.some((s) => s.includes("Aero-Motorsport"))).toBe(true);
      expect(bonuses.motorsportPerformanceIndex).toBeGreaterThan(30);
    });
  });

  // ── PHASE 26: Logistics & Staging Inventory ──
  describe("Phase 26: Construction Logistics", () => {
    it("should create material order and calculate lead times", () => {
      const order = createMaterialOrder("STEEL", 100, 1970, 1);
      expect(order.resource).toBe("STEEL");
      expect(order.quantity).toBe(100);
      expect(order.totalCost).toBe(18000);
      expect(order.isDelivered).toBe(false);
      expect(order.weeksRemaining).toBeGreaterThan(0);
    });

    it("should advance order lead times and deposit to staging inventory", () => {
      const order = createMaterialOrder("STEEL", 50, 1970, 1);
      const inventory = { STEEL: 10 };
      const { updatedOrders, updatedInventory, newlyDelivered } = advanceMaterialOrders([order], inventory, 5);
      expect(newlyDelivered.length).toBe(1);
      expect(updatedInventory.STEEL).toBe(60);
      expect(updatedOrders[0].isDelivered).toBe(true);
    });

    it("should verify sufficient staging materials for construction", () => {
      const required = [{ resource: "STEEL" as const, quantity: 40 }];
      const invGood = { STEEL: 50 };
      const invShort = { STEEL: 20 };
      expect(hasSufficientMaterials(required, invGood).sufficient).toBe(true);
      expect(hasSufficientMaterials(required, invShort).sufficient).toBe(false);
    });
  });

  // ── PHASE 27 & 28: Events & Save/Load Serialization ──
  describe("Phases 27 & 28: Events & Serialization", () => {
    it("should generate campus events with proper severity and metadata", () => {
      const evt = createCampusEvent(
        "LEVEL_UP",
        "success",
        "Campus Milestone",
        "Upgraded Corporate HQ",
        1970,
        6,
        "CENTRAL_CORPORATE_HQ"
      );
      expect(evt.id).toBeDefined();
      expect(evt.type).toBe("LEVEL_UP");
      expect(evt.severity).toBe("success");
    });

    it("should serialize and deserialize campus state without data loss", () => {
      const json = serializeCampusState(
        CAMPUS_UNITS_REGISTRY,
        INITIAL_FACTORY_STATE,
        [],
        { STEEL: 100 },
        [],
        [],
        []
      );
      expect(typeof json).toBe("string");

      const result = deserializeCampusState(json);
      expect(result.success).toBe(true);
      expect(result.units.CENTRAL_CORPORATE_HQ).toBeDefined();
      expect(result.materialInventory.STEEL).toBe(100);
    });
  });

  // ── PHASE 22 & 29: CampusEngine Tick & Telemetry ──
  describe("Phases 22 & 29: CampusEngine Tick & Telemetry Integration", () => {
    it("should calculate telemetry including Phase 29 metrics", () => {
      const telemetry = CampusEngine.calculateCampusTelemetry(CAMPUS_UNITS_REGISTRY, INITIAL_FACTORY_STATE);
      expect(telemetry.totalPlots).toBe(14);
      expect(telemetry.unlockedPlots).toBe(14 - telemetry.lockedPlotsCount);
      expect(telemetry.lockedPlotsCount).toBe(5);
      expect(telemetry.averageBuildingLevel).toBeGreaterThanOrEqual(1);
      expect(telemetry.campusPrestigeScore).toBeGreaterThan(0);
      expect(telemetry.departmentCoverageScore).toBeGreaterThanOrEqual(50);
    });

    it("should advance campus state during tick simulation", () => {
      const enqueue = enqueueConstructionJob([], "INTERIOR_HQ", "Interior HQ", 1, 2, 1970, 1, 1);
      const initialJobs = enqueue.updatedJobs;

      const tickResult = CampusEngine.tickCampus(
        CAMPUS_UNITS_REGISTRY,
        INITIAL_FACTORY_STATE,
        initialJobs,
        initialJobs[0].totalMonthsRequired,
        1970,
        1
      );

      expect(tickResult.completedJobs.length).toBe(1);
      expect(tickResult.nextUnits.INTERIOR_HQ.level).toBe(2);
      expect(tickResult.events.some((e) => e.type === "CONSTRUCTION_COMPLETED")).toBe(true);
    });
  });
});
