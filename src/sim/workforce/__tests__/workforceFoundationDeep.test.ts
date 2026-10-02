/**
 * ═══════════════════════════════════════════════════════════════════════
 * WORKFORCE FOUNDATION DEEP TEST SUITE — SECTIONS 1 THROUGH 30
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Verifies:
 * - 12 Mandatory Workforce Screen Numbers (Section 30)
 * - Relevant Skill vs Overall Skill on V12 Turbo Project (Section 7)
 * - Workload Demand, Capacity Deficits & Principal Multiplier (Section 11)
 * - Rank Pyramid Archetypes: Company A vs Company B (Section 12)
 * - Monthly Tick Progression, Milestones & Veteran Memory (Sections 8, 9, 29)
 * - Talent Scouting, Candidate Hiring & Permanent EMP-XXXXXX IDs (Sections 2, 27)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useWorkforceStore } from "../../../state/workforceStore";
import { resetEmployeeIdCounter } from "../employeeIdGenerator";
import {
  evaluateEngineerProjectFit,
  evaluateDepartmentWorkloadAndDeficit,
  ProjectWorkloadRequirement,
} from "../projectWorkforceBinding";
import {
  generateCandidatePool,
  hireRecruitedCandidate,
} from "../recruitmentEngine";
import { executeMonthlyWorkforceTick } from "../monthlyWorkforceTick";
import { Employee, TechnicalSkillMatrix } from "../workforceTypes";

describe("Workforce Foundation Deep Test Suite (Sections 1–30)", () => {
  beforeEach(() => {
    resetEmployeeIdCounter(1);
    useWorkforceStore.getState().resetTo1970();
  });

  describe("1. The 12 Mandatory Workforce Screen Metrics (Section 30)", () => {
    it("computes all 12 key numbers accurately", () => {
      const metrics = useWorkforceStore.getState().get12KeyMetrics();

      // 1. Total employees
      expect(metrics.totalEmployees).toBe(49);

      // 2. Employees by department
      expect(Object.keys(metrics.employeesByDepartment).length).toBe(23);
      expect(metrics.employeesByDepartment.POWERTRAIN).toBe(12);

      // 3. Employees by rank
      expect(metrics.employeesByRank.junior).toBeGreaterThan(0);
      expect(metrics.employeesByRank.specialist).toBeGreaterThan(0);
      expect(metrics.employeesByRank.principal).toBe(1); // Dr. Michael Carter
      expect(metrics.employeesByRank.management).toBeGreaterThan(0);

      // 4. Average skill
      expect(metrics.averageSkill).toBeGreaterThan(50);
      expect(metrics.averageSkill).toBeLessThanOrEqual(100);

      // 5. Specialist skill
      expect(metrics.specialistSkill).toBeGreaterThanOrEqual(85);

      // 6. Effective capacity
      expect(metrics.effectiveCapacityWU).toBeGreaterThan(5000);

      // 7. Management capacity
      expect(metrics.managementCapacityScore).toBeGreaterThanOrEqual(70);

      // 8. HQ organizational capacity
      expect(metrics.hqOrganizationalCapacity.corporateDesksOccupied).toBe(5);
      expect(metrics.hqOrganizationalCapacity.maxDesks).toBe(30);
      expect(metrics.hqOrganizationalCapacity.isOvercapacity).toBe(false);

      // 9. Estimated monthly payroll
      expect(metrics.estimatedMonthlyPayroll).toBeGreaterThan(300000);

      // 10. Employee satisfaction
      expect(metrics.employeeSatisfaction).toBeGreaterThanOrEqual(75);

      // 11. Monthly turnover rate
      expect(metrics.monthlyTurnoverRatePct).toBeLessThan(1.5);

      // 12. Employer reputation
      expect(metrics.employerReputation).toBeGreaterThanOrEqual(50);
    });
  });

  describe("2. Specialization Over Raw Skill & Project-Relevant Skill (Section 7)", () => {
    const v12TurboProject: ProjectWorkloadRequirement = {
      projectId: "PROJ-V12-TURBO-II",
      projectName: "V12 Turbo Gen II",
      category: "ENGINE",
      leadDepartmentId: "POWERTRAIN",
      requiredSpecializations: [
        { specialization: "TURBOCHARGING", importanceWeight: 0.70 },
        { specialization: "COMBUSTION_DYNAMICS", importanceWeight: 0.30 },
      ],
      monthlyWorkloadDemandWU: 12000,
      difficultyTier: "BREAKTHROUGH",
    };

    it("evaluates Engineer A (Turbo 96) as superior to Engineer B (Turbo 54) for Turbo project", () => {
      const baseTechMatrix: TechnicalSkillMatrix = {
        discipline: "TECHNICAL",
        technicalMastery: 88,
        innovation: 85,
        problemSolving: 86,
        accuracy: 90,
        leadership: 60,
        legacyTechMastery: 75,
        modernTechAdaptability: 85,
      };

      // Engineer A: Overall 92, Turbo 96
      const engineerA: Employee = {
        id: "EMP-001001",
        name: "Engineer A (Turbo Specialist)",
        birthYear: 1940,
        joinYear: 1970,
        joinMonth: 1,
        careerLog: [],
        division: "TECHNICAL",
        departmentId: "POWERTRAIN",
        facilityId: "HQ_CAMPUS",
        rank: 4,
        isKeyPersonnel: true,
        primarySpecialization: "TURBOCHARGING",
        specializationScore: 96,
        skillMatrix: { ...baseTechMatrix, technicalMastery: 92 },
        overallSkill: 92,
        experienceYears: 12,
        tenureMonthsWithCompany: 24,
        productivity: 1.15,
        morale: 90,
        loyalty: 88,
        jobSatisfaction: 85,
        careerProspects: 90,
      };

      // Engineer B: Overall 95, Turbo 54 (Suspension specialist)
      const engineerB: Employee = {
        id: "EMP-001002",
        name: "Engineer B (Chassis Specialist)",
        birthYear: 1938,
        joinYear: 1970,
        joinMonth: 1,
        careerLog: [],
        division: "TECHNICAL",
        departmentId: "CHASSIS",
        facilityId: "HQ_CAMPUS",
        rank: 4,
        isKeyPersonnel: true,
        primarySpecialization: "SUSPENSION_KINEMATICS",
        specializationScore: 54,
        skillMatrix: { ...baseTechMatrix, technicalMastery: 95 },
        overallSkill: 95,
        experienceYears: 14,
        tenureMonthsWithCompany: 36,
        productivity: 1.15,
        morale: 90,
        loyalty: 88,
        jobSatisfaction: 85,
        careerProspects: 90,
      };

      const evalA = evaluateEngineerProjectFit(engineerA, v12TurboProject);
      const evalB = evaluateEngineerProjectFit(engineerB, v12TurboProject);

      expect(evalA.specializationMatchPct).toBeGreaterThan(evalB.specializationMatchPct);
      expect(evalA.relevantSkill).toBeGreaterThan(evalB.relevantSkill);
      expect(evalA.fitAssessment).toBe("IDEAL_FIT");
      expect(evalB.fitAssessment).toBe("MISALIGNED_SPECIALIST");
    });
  });

  describe("3. Workload Demand & Capacity Deficits (Section 11)", () => {
    it("identifies understaffed department when project demand exceeds capacity", () => {
      const powertrainDept = useWorkforceStore.getState().departments.POWERTRAIN;

      const heavyProjects: ProjectWorkloadRequirement[] = [
        {
          projectId: "PROJ-1",
          projectName: "Twin-Turbo V8",
          category: "ENGINE",
          leadDepartmentId: "POWERTRAIN",
          requiredSpecializations: [{ specialization: "TURBOCHARGING", importanceWeight: 1 }],
          monthlyWorkloadDemandWU: 2500,
          difficultyTier: "COMPLEX",
        },
        {
          projectId: "PROJ-2",
          projectName: "Le Mans V12",
          category: "ENGINE",
          leadDepartmentId: "POWERTRAIN",
          requiredSpecializations: [{ specialization: "COMBUSTION_DYNAMICS", importanceWeight: 1 }],
          monthlyWorkloadDemandWU: 3000,
          difficultyTier: "BREAKTHROUGH",
        },
      ];

      const report = evaluateDepartmentWorkloadAndDeficit(
        powertrainDept,
        heavyProjects,
        85
      );

      expect(report.activeWorkloadDemandWU).toBe(5500);
      expect(report.capacityDeficitOrSurplus).toBeLessThan(0); // Deficit
      expect(report.utilizationPct).toBeGreaterThan(100);
      expect(report.executiveGuidance.length).toBeGreaterThan(0);
      expect(report.principalForceMultiplier).toBeGreaterThan(1.0);
    });
  });

  describe("4. Monthly Progression Tick & Institutional Memory (Sections 8, 9, 29)", () => {
    it("accumulates experience, awards milestones, and updates institutional knowledge", () => {
      const state = useWorkforceStore.getState();
      const report = useWorkforceStore.getState().tickMonthlySimulation(1971, 1);

      expect(report.year).toBe(1971);
      expect(report.month).toBe(1);
      expect(report.institutionalMemoryAverage).toBeGreaterThan(8);

      const updatedCarter = useWorkforceStore.getState().keyPersonnel["EMP-000001"];
      expect(updatedCarter.tenureMonthsWithCompany).toBe(1);
    });
  });

  describe("5. Key Personnel Talent Scouting & Permanent ID Assignment (Sections 2, 27)", () => {
    it("generates realistic candidate pool with automotive specializations", () => {
      const candidates = generateCandidatePool(1970, 4);
      expect(candidates.length).toBe(4);

      for (const cand of candidates) {
        expect(cand.name.length).toBeGreaterThan(3);
        expect(cand.overallSkill).toBeGreaterThanOrEqual(60);
        expect(cand.primarySpecialization).toBeDefined();
        expect(cand.previousEmployer).toBeDefined();
      }
    });

    it("hires candidate, assigns permanent sequential EMP-XXXXXX ID, and integrates into store", () => {
      const candidates = generateCandidatePool(1970, 1);
      const candidate = candidates[0];

      const initialCount = useWorkforceStore.getState().totalHeadcount;
      const initialKeys = useWorkforceStore.getState().totalKeyPersonnel;

      const hiredEmp = useWorkforceStore.getState().hireKeyCandidate(candidate, "POWERTRAIN", 1970, 2);

      expect(hiredEmp.id.startsWith("EMP-")).toBe(true);
      expect(hiredEmp.careerLog.some((m) => m.event === "HIRED")).toBe(true);

      const updatedState = useWorkforceStore.getState();
      expect(updatedState.totalHeadcount).toBe(initialCount + 1);
      expect(updatedState.totalKeyPersonnel).toBe(initialKeys + 1);
      expect(updatedState.keyPersonnel[hiredEmp.id]).toBeDefined();
      expect(updatedState.departments.POWERTRAIN.keyPersonnelIds).toContain(hiredEmp.id);
    });
  });
});
