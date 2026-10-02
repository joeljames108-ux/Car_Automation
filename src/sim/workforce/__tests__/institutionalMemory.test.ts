import { describe, it, expect } from "vitest";
import {
  InstitutionalMemoryEngine,
  evaluateInstitutionalMemory,
} from "../institutionalMemoryEngine";
import { DepartmentAggregation, Employee } from "../workforceTypes";

describe("InstitutionalMemoryEngine (Phase 7)", () => {
  it("evaluates department memory and mitigates project rework risk with veterans", () => {
    const mockDept = {
      departmentId: "POWERTRAIN",
      departmentName: "Powertrain R&D",
      division: "TECHNICAL",
      facilityLocation: "UNIT_02",
      totalHeadcount: 20,
      headcountByRank: { 1: 2, 2: 4, 3: 6, 4: 5, 5: 2, 6: 1, 7: 0, 8: 0, 9: 0 },
      averageOverallSkill: 82,
      averageMorale: 85,
      averageTenureMonths: 144, // 12 years avg
      averageExperienceYears: 16,
      dominantSpecializations: [],
      monthlyWorkUnitsDemand: 3200,
      monthlyWorkUnitsCapacity: 3600,
      utilizationPercentage: 88,
      capacityDeficitOrSurplus: 400,
      managementCount: 1,
      subordinateCount: 19,
      spanRatio: 6.5,
      spanHealth: "OPTIMAL",
      spanPenalty: 0.02,
      burnoutRiskLevel: "LOW",
      keyPersonnelIds: ["EMP-001001"],
    } as unknown as DepartmentAggregation;

    const mockKeyPersonnel = [
      {
        id: "EMP-001001",
        name: "Dr. Hans Weber",
        rank: 5,
        departmentId: "POWERTRAIN",
        primarySpecialization: "combustion_thermo",
        overallSkill: 95,
        morale: 92,
        experienceYears: 24,
        tenureMonthsWithCompany: 180, // 15 years
      },
    ] as unknown as Employee[];


    const report = InstitutionalMemoryEngine.evaluateDepartmentMemory(mockDept, mockKeyPersonnel);

    expect(report.totalVeteransCount).toBeGreaterThanOrEqual(1);
    expect(report.institutionalKnowledgeIndex).toBeGreaterThan(60);
    expect(report.failureRiskMitigationPct).toBeGreaterThan(15);
    expect(report.moraleStabilityBonusPct).toBeGreaterThan(8);
    expect(report.veteranHonors.length).toBe(1);
    expect(report.veteranHonors[0].name).toBe("Dr. Hans Weber");

    // Backwards compatibility check
    const legacyReport = evaluateInstitutionalMemory(mockDept, mockKeyPersonnel);
    expect(legacyReport.institutionalKnowledgeIndex).toBe(report.institutionalKnowledgeIndex);
  });

  it("calculates brain-drain loss and verifies UNIT_01 Archive retention mitigation", () => {
    const departingPrincipal = {
      id: "EMP-002005",
      name: "Marcello Vane",
      rank: 5,
      tenureMonths: 160,
      overallSkill: 92,
    };

    // Under Level 1 (Paper files - 50% loss)
    const impactLevel1 = InstitutionalMemoryEngine.evaluateBrainDrain(
      departingPrincipal,
      "styling",
      1
    );

    expect(impactLevel1.retentionEfficiencyPct).toBe(50);
    expect(impactLevel1.grossKnowledgePointsLost).toBeGreaterThan(100);
    expect(impactLevel1.archiveRetainedPoints).toBe(Math.round(impactLevel1.grossKnowledgePointsLost * 0.50));
    expect(impactLevel1.disruptionSeverity).toBe("CATASTROPHIC");

    // Under Level 4 (Cloud PLM / Digital Central - 98% retention)
    const impactLevel4 = InstitutionalMemoryEngine.evaluateBrainDrain(
      departingPrincipal,
      "styling",
      4
    );

    expect(impactLevel4.retentionEfficiencyPct).toBe(98);
    expect(impactLevel4.archiveRetainedPoints).toBe(Math.round(impactLevel4.grossKnowledgePointsLost * 0.98));
    expect(impactLevel4.netKnowledgePointsLost).toBeLessThan(10);
    expect(impactLevel4.disruptionSeverity).not.toBe("CATASTROPHIC");
  });

  it("performs comprehensive campus institutional memory audit across all 9 domains", () => {
    const audit = InstitutionalMemoryEngine.auditCampusInstitutionalMemory(2, {
      powertrain: { ipPoints: 450, patents: 3, docsPct: 75, veterans: 4 },
      aerodynamics: { ipPoints: 120, patents: 0, docsPct: 30, veterans: 0 }, // vulnerable
      chassis: { ipPoints: 380, patents: 2, docsPct: 65, veterans: 2 },
    });

    expect(audit.corporateArchiveLevel).toBe(2);
    expect(audit.archiveRetentionRatePct).toBe(70);
    expect(audit.overallInstitutionalMemoryIndex).toBeGreaterThan(30);
    expect(audit.domainRecords.powertrain.failureRiskMitigationPct).toBeGreaterThan(10);
    expect(audit.criticalVulnerabilities.some(v => v.includes("Aerodynamics"))).toBe(true);
  });
});
