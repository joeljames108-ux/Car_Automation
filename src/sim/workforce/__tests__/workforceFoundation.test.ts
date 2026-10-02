import { describe, it, expect, beforeEach } from "vitest";
import {
  generateNextEmployeeId,
  formatEmployeeId,
  resetEmployeeIdCounter,
} from "../employeeIdGenerator";
import { calculateOverallSkill, calculateProjectRelevantSkill } from "../skillMatrixEngine";
import { calculateSpecializationMatch } from "../specializationRegistry";
import { evaluateRankPyramid } from "../rankPyramidEvaluator";
import { calculateDepartmentEffectiveCapacity } from "../workloadEngine";
import { evaluateHQOrganization, HQ_CAMPUS_TIERS } from "../companyHqEngine";
import { processEmployeeMonthlyProgression } from "../experienceEngine";
import { evaluateInstitutionalMemory } from "../institutionalMemoryEngine";
import { useWorkforceStore } from "../../../state/workforceStore";
import { Employee, TechnicalSkillMatrix } from "../workforceTypes";

describe("Workforce Foundation Test Suite", () => {
  beforeEach(() => {
    resetEmployeeIdCounter(1);
    useWorkforceStore.getState().resetTo1970();
  });

  describe("1. Employee ID Generation & Permanence (EMP-XXXXXX)", () => {
    it("generates sequential permanent IDs with zero padding", () => {
      expect(formatEmployeeId(1)).toBe("EMP-000001");
      expect(formatEmployeeId(4821)).toBe("EMP-004821");
      expect(formatEmployeeId(100500)).toBe("EMP-100500");
    });

    it("increments sequential counter correctly", () => {
      resetEmployeeIdCounter(10);
      const id1 = generateNextEmployeeId();
      const id2 = generateNextEmployeeId();
      expect(id1).toBe("EMP-000010");
      expect(id2).toBe("EMP-000011");
    });
  });

  describe("2. Multidimensional Skills & Specialization Relevance", () => {
    it("calculates overall skill composite from discipline vectors", () => {
      const techMatrix: TechnicalSkillMatrix = {
        discipline: "TECHNICAL",
        technicalMastery: 90,
        innovation: 85,
        problemSolving: 90,
        accuracy: 80,
        leadership: 70,
        legacyTechMastery: 85,
        modernTechAdaptability: 80,
      };

      const overall = calculateOverallSkill(techMatrix);
      expect(overall).toBeGreaterThanOrEqual(80);
      expect(overall).toBeLessThanOrEqual(95);
    });

    it("evaluates specialization relevance higher for exact matches than mismatches", () => {
      const exactMatch = calculateSpecializationMatch("TURBOCHARGING", undefined, 95, "TURBOCHARGING");
      const relatedMatch = calculateSpecializationMatch("TURBOCHARGING", undefined, 95, "COMBUSTION_DYNAMICS");
      const mismatch = calculateSpecializationMatch("TURBOCHARGING", undefined, 95, "CHASSIS_MONOCOQUE");

      expect(exactMatch).toBeGreaterThan(relatedMatch);
      expect(relatedMatch).toBeGreaterThan(mismatch);
      expect(exactMatch).toBeGreaterThanOrEqual(1.0);
    });

    it("calculates Project Relevant Skill giving greater contribution to specialized engineers", () => {
      const engineerA: Employee = {
        id: "EMP-000101",
        name: "Turbo Specialist",
        birthYear: 1945,
        joinYear: 1970,
        joinMonth: 1,
        careerLog: [],
        division: "TECHNICAL",
        departmentId: "POWERTRAIN",
        facilityId: "HQ_CAMPUS",
        rank: 4,
        isKeyPersonnel: true,
        primarySpecialization: "TURBOCHARGING",
        specializationScore: 94,
        skillMatrix: {
          discipline: "TECHNICAL",
          technicalMastery: 90,
          innovation: 85,
          problemSolving: 88,
          accuracy: 85,
          leadership: 60,
          legacyTechMastery: 85,
          modernTechAdaptability: 90,
        },
        overallSkill: 88,
        experienceYears: 10,
        tenureMonthsWithCompany: 12,
        productivity: 1.1,
        morale: 90,
        loyalty: 90,
        jobSatisfaction: 90,
        careerProspects: 90,
      };

      const engineerB: Employee = {
        ...engineerA,
        id: "EMP-000102",
        name: "General Suspension Engineer",
        primarySpecialization: "SUSPENSION_KINEMATICS",
        specializationScore: 60,
        overallSkill: 92, // Higher general skill!
      };

      const turboProject = {
        targetSpecializationId: "TURBOCHARGING",
        requiresHighInnovation: true,
      };

      const relevantA = calculateProjectRelevantSkill(engineerA, turboProject);
      const relevantB = calculateProjectRelevantSkill(engineerB, turboProject);

      // Section 7: Engineer A contributes more to Turbo project despite B having higher raw overall skill!
      expect(relevantA).toBeGreaterThan(relevantB);
    });
  });

  describe("3. Rank Pyramids & Span of Control Evaluator", () => {
    it("detects excellent mentorship when juniors have sufficient senior oversight", () => {
      const depts = useWorkforceStore.getState().departments;
      const analysis = evaluateRankPyramid(depts.POWERTRAIN);

      expect(analysis.totalPersonnel).toBe(12);
      expect(analysis.mentorshipHealth).toBe("EXCELLENT");
      expect(analysis.mentorshipBonusPct).toBeGreaterThan(0);
    });

    it("applies a span penalty when subordinates overwhelm managerial headcount", () => {
      const overloadedDept = {
        ...useWorkforceStore.getState().departments.POWERTRAIN,
        headcountByRank: {
          1: 20, 2: 30, 3: 50, 4: 10, 5: 2, 6: 1, 7: 0, 8: 0, 9: 0, // 112 subordinates under 1 manager!
        },
        totalHeadcount: 113,
      };

      const analysis = evaluateRankPyramid(overloadedDept);
      expect(analysis.spanHealth).toBe("CRITICAL_DEFICIT");
      expect(analysis.spanPenaltyPct).toBeGreaterThan(20);
    });
  });

  describe("4. Workload, Capacity & Principal Force Multiplier", () => {
    it("awards a force multiplier to department capacity from Principal Engineers", () => {
      const depts = useWorkforceStore.getState().departments;
      const result = calculateDepartmentEffectiveCapacity(depts.POWERTRAIN, 85);

      expect(result.forceMultiplierPrincipal).toBeGreaterThan(1.0); // 1 Principal = +8%
      expect(result.effectiveCapacityWU).toBeGreaterThan(0);
      expect(result.status).toBe("OPTIMAL");
    });
  });

  describe("5. Company HQ Organizational Capacity & Overcapacity Drag", () => {
    it("scales corporate capacity and coordination metrics across progressive HQ tiers", () => {
      expect(HQ_CAMPUS_TIERS[1].maxCorporateEmployees).toBe(35);
      expect(HQ_CAMPUS_TIERS[2].maxCorporateEmployees).toBe(120);
      expect(HQ_CAMPUS_TIERS[4].maxCorporateEmployees).toBe(800);
      expect(HQ_CAMPUS_TIERS[5].maxCorporateEmployees).toBe(2500);
    });

    it("calculates overcapacity coordination drag when corporate staff exceeds HQ desks", () => {
      const hq = { ...useWorkforceStore.getState().hqState, maxCorporateEmployees: 3 };
      const depts = useWorkforceStore.getState().departments;

      const diag = evaluateHQOrganization(hq, depts, 49);
      expect(diag.isOvercapacity).toBe(true);
      expect(diag.coordinationDragPenaltyPct).toBeGreaterThan(0);
    });
  });

  describe("6. Experience Progression & Institutional Memory", () => {
    it("accumulates experience, raises loyalty, and adds long-service award milestones", () => {
      const emp = useWorkforceStore.getState().keyPersonnel["EMP-000001"];
      const { updatedEmployee, report } = processEmployeeMonthlyProgression(
        { ...emp, tenureMonthsWithCompany: 119 }, // 1 month before 10-year veteran
        1980,
        1,
        false,
        false,
        true
      );

      expect(updatedEmployee.tenureMonthsWithCompany).toBe(120);
      expect(report.isVeteran).toBe(true);
      expect(report.milestonesAdded.length).toBeGreaterThan(0);
    });

    it("evaluates institutional memory and risk mitigation in veteran departments", () => {
      const depts = useWorkforceStore.getState().departments;
      const keyList = Object.values(useWorkforceStore.getState().keyPersonnel);

      const mem = evaluateInstitutionalMemory(
        { ...depts.POWERTRAIN, averageTenureMonths: 140 },
        keyList
      );

      expect(mem.failureRiskMitigationPct).toBeGreaterThan(0);
      expect(mem.institutionalKnowledgeIndex).toBeGreaterThan(30);
    });
  });

  describe("7. Master Workforce Store & 3-Level State Synchronization", () => {
    it("synchronizes 1970 founding crew (49 employees across departments)", () => {
      const state = useWorkforceStore.getState();
      expect(state.totalHeadcount).toBe(49);
      expect(state.totalKeyPersonnel).toBe(5);
      expect(state.departments.POWERTRAIN.totalHeadcount).toBe(12);
      expect(state.departments.MANUFACTURING.totalHeadcount).toBe(18);
    });

    it("hires aggregated staff and dynamically adjusts department capacity and company totals", () => {
      const store = useWorkforceStore.getState();
      const initialTotal = store.totalHeadcount;
      const initialCapacity = store.departments.POWERTRAIN.monthlyWorkUnitsCapacity;

      useWorkforceStore.getState().hireAggregatedStaff("POWERTRAIN", 3, 5, 75);

      const updated = useWorkforceStore.getState();
      expect(updated.totalHeadcount).toBe(initialTotal + 5);
      expect(updated.departments.POWERTRAIN.totalHeadcount).toBe(17);
      expect(updated.departments.POWERTRAIN.monthlyWorkUnitsCapacity).toBeGreaterThan(initialCapacity);
    });

    it("promotes a key employee and logs career milestone", () => {
      const store = useWorkforceStore.getState();
      const emp = store.keyPersonnel["EMP-000004"]; // Arthur Pendelton, Rank 4
      expect(emp.rank).toBe(4);

      useWorkforceStore.getState().promoteEmployee(emp.id, 5); // Promote to Principal

      const promoted = useWorkforceStore.getState().keyPersonnel[emp.id];
      expect(promoted.rank).toBe(5);
      expect(promoted.careerLog.some((m) => m.event === "PROMOTED")).toBe(true);
      expect(promoted.productivity).toBeGreaterThan(emp.productivity);
    });

    it("transfers a key employee from one department to another smoothly", () => {
      const store = useWorkforceStore.getState();
      const emp = store.keyPersonnel["EMP-000004"]; // Chassis
      expect(emp.departmentId).toBe("CHASSIS");

      useWorkforceStore.getState().transferEmployee(emp.id, "MOTORSPORT_RACING");

      const transferred = useWorkforceStore.getState().keyPersonnel[emp.id];
      expect(transferred.departmentId).toBe("MOTORSPORT_RACING");
      expect(transferred.division).toBe("MOTORSPORT");
      expect(transferred.careerLog.some((m) => m.event === "TRANSFERRED")).toBe(true);

      const depts = useWorkforceStore.getState().departments;
      expect(depts.MOTORSPORT_RACING.keyPersonnelIds).toContain(emp.id);
      expect(depts.CHASSIS.keyPersonnelIds).not.toContain(emp.id);
    });

    it("upgrades HQ level expanding corporate capacity and coordination scores", () => {
      const initialHq = useWorkforceStore.getState().hqState;
      expect(initialHq.hqLevel).toBe(1);

      useWorkforceStore.getState().upgradeHQLevel();

      const upgradedHq = useWorkforceStore.getState().hqState;
      expect(upgradedHq.hqLevel).toBe(2);
      expect(upgradedHq.maxCorporateEmployees).toBeGreaterThan(initialHq.maxCorporateEmployees);
      expect(upgradedHq.rdCoordinationScore).toBeGreaterThan(initialHq.rdCoordinationScore);
    });
  });
});
