/**
 * ═══════════════════════════════════════════════════════════════════════
 * INSTITUTIONAL MEMORY & KNOWLEDGE RETENTION ENGINE (UNIT_01 ARCHIVES)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Phase 7 of the Workforce & Employee Systems Architecture.
 *
 * Governs:
 * 1. Long-serving employee veteran impact & institutional memory accumulation
 * 2. Multi-domain Engineering IP Tracking (Powertrain, Aero, Chassis, etc.)
 * 3. UNIT_01 Central Corporate HQ Archive & Documentation levels (Levels 1-4)
 * 4. Brain Drain Disruption & Knowledge Loss Mitigation
 * 5. Failure risk mitigation and morale resilience
 */

import { DepartmentAggregation, Employee } from "./workforceTypes";

export type EngineeringDomain =
  | "powertrain"
  | "aerodynamics"
  | "chassis"
  | "interior"
  | "electronics"
  | "styling"
  | "manufacturing"
  | "safety"
  | "quality";

export type CorporateArchiveLevel = 1 | 2 | 3 | 4;

export interface DomainKnowledgeRecord {
  domain: EngineeringDomain;
  domainName: string;
  accumulatedIpPoints: number;        // 0 to 1000
  patentsGrantedCount: number;
  documentationCompletenessPct: number; // 0 to 100
  veteranStaffCount: number;
  failureRiskMitigationPct: number;   // up to 25% reduction in project rework
}

export interface BrainDrainImpact {
  departedEmployeeId: string;
  departedEmployeeName: string;
  departedRank: number;
  primaryDomain: EngineeringDomain;
  grossKnowledgePointsLost: number;
  archiveRetainedPoints: number;
  netKnowledgePointsLost: number;
  retentionEfficiencyPct: number;
  disruptionSeverity: "NEGLIGIBLE" | "MODERATE" | "SEVERE" | "CATASTROPHIC";
  projectDelayWeeks: number;
  summary: string;
}

export interface DepartmentInstitutionalMemoryReport {
  departmentId: string;
  totalVeteransCount: number;          // Tenure >= 10 years (120 months)
  institutionalKnowledgeIndex: number; // 0 to 100
  failureRiskMitigationPct: number;    // -0% to -25% project failure chance
  moraleStabilityBonusPct: number;     // +0% to +15% morale resilience
  brainDrainVulnerability: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  veteranHonors: Array<{ id: string; name: string; yearsOfService: number; rankTitle: string }>;
}

export interface CampusInstitutionalMemoryAudit {
  overallInstitutionalMemoryIndex: number; // 0 to 100
  corporateArchiveLevel: CorporateArchiveLevel;
  archiveRetentionRatePct: number;
  totalVeteransAcrossCampus: number;
  domainRecords: Record<EngineeringDomain, DomainKnowledgeRecord>;
  criticalVulnerabilities: string[];
  summary: string;
}

const ARCHIVE_RETENTION_RATES: Record<CorporateArchiveLevel, { name: string; ratePct: number }> = {
  1: { name: "Paper Blueprints & Physical Cabinets", ratePct: 50 },
  2: { name: "Microfiche & Standardized Binders", ratePct: 70 },
  3: { name: "Digital Mainframe Magnetic Tape", ratePct: 88 },
  4: { name: "Centralized Cloud PLM & CAD Repository", ratePct: 98 },
};

const DOMAIN_DISPLAY_NAMES: Record<EngineeringDomain, string> = {
  powertrain: "Powertrain & Thermal Engineering",
  aerodynamics: "Aerodynamics & CFD Dynamics",
  chassis: "Chassis, Kinematics & Dynamics",
  interior: "Cabin Ergonomics & NVH Acoustics",
  electronics: "ECU, Harness & Infotainment",
  styling: "Exterior Sculpting & CMF Design",
  manufacturing: "Body-in-White Tooling & Assembly",
  safety: "Crashworthiness & Structural Safety",
  quality: "Metrology, CMM & Tolerance Control",
};

export class InstitutionalMemoryEngine {
  /**
   * Evaluates the institutional memory and systemic benefits for a single department
   */
  public static evaluateDepartmentMemory(
    dept: DepartmentAggregation,
    keyPersonnelList: Employee[]
  ): DepartmentInstitutionalMemoryReport {
    const deptKeyPersonnel = keyPersonnelList.filter((e) => e.departmentId === dept.departmentId);

    let totalVeteransCount = 0;
    const veteranHonors: DepartmentInstitutionalMemoryReport["veteranHonors"] = [];

    for (const emp of deptKeyPersonnel) {
      if (emp.tenureMonthsWithCompany >= 120) {
        totalVeteransCount += 1;
        veteranHonors.push({
          id: emp.id,
          name: emp.name,
          yearsOfService: Math.floor(emp.tenureMonthsWithCompany / 12),
          rankTitle: `Rank ${emp.rank}`,
        });
      }
    }

    const estimatedAggregatedVeterans = dept.averageTenureMonths >= 120
      ? Math.round(dept.totalHeadcount * 0.20)
      : 0;

    const totalVeterans = Math.max(totalVeteransCount, estimatedAggregatedVeterans);

    const experienceScore = Math.min(30, (dept.averageExperienceYears / 25) * 30);
    const tenureScore = Math.min(40, (dept.averageTenureMonths / 180) * 40);
    const veteranScore = Math.min(30, totalVeterans * 10);
    const institutionalKnowledgeIndex = Math.min(100, Math.round(experienceScore + tenureScore + veteranScore));

    const failureRiskMitigationPct = Math.round((institutionalKnowledgeIndex / 100) * 25);
    const moraleStabilityBonusPct = Math.round((institutionalKnowledgeIndex / 100) * 15);

    let brainDrainVulnerability: DepartmentInstitutionalMemoryReport["brainDrainVulnerability"] = "LOW";
    if (totalVeterans === 0 && dept.totalHeadcount > 10) {
      brainDrainVulnerability = "HIGH";
    } else if (totalVeterans === 1 && dept.totalHeadcount > 20) {
      brainDrainVulnerability = "CRITICAL";
    } else if (totalVeterans < 3 && dept.totalHeadcount > 30) {
      brainDrainVulnerability = "MODERATE";
    }

    return {
      departmentId: dept.departmentId,
      totalVeteransCount: totalVeterans,
      institutionalKnowledgeIndex,
      failureRiskMitigationPct,
      moraleStabilityBonusPct,
      brainDrainVulnerability,
      veteranHonors,
    };
  }

  /**
   * Simulates the impact of a key employee departure, mitigated by UNIT_01 Central Archives
   */
  public static evaluateBrainDrain(
    departedEmp: {
      id: string;
      name: string;
      rank: number;
      tenureMonths: number;
      overallSkill: number;
    },
    domain: EngineeringDomain,
    archiveLevel: CorporateArchiveLevel
  ): BrainDrainImpact {
    const archiveInfo = ARCHIVE_RETENTION_RATES[archiveLevel];
    const retentionRatePct = archiveInfo.ratePct;

    // Gross knowledge points based on rank, tenure, and skill
    const tenureFactor = Math.min(3.0, 1.0 + departedEmp.tenureMonths / 120);
    const rankFactor = Math.pow(departedEmp.rank, 1.35);
    const grossPoints = Math.round(rankFactor * tenureFactor * (departedEmp.overallSkill / 100) * 25);

    const archiveRetainedPoints = Math.round(grossPoints * (retentionRatePct / 100));
    const netKnowledgePointsLost = grossPoints - archiveRetainedPoints;

    let disruptionSeverity: BrainDrainImpact["disruptionSeverity"] = "NEGLIGIBLE";
    let projectDelayWeeks = 0;

    if (departedEmp.rank >= 5 && netKnowledgePointsLost > 50) {
      disruptionSeverity = "CATASTROPHIC";
      projectDelayWeeks = 6;
    } else if (departedEmp.rank >= 4 && netKnowledgePointsLost > 25) {
      disruptionSeverity = "SEVERE";
      projectDelayWeeks = 4;
    } else if (netKnowledgePointsLost > 10) {
      disruptionSeverity = "MODERATE";
      projectDelayWeeks = 2;
    }

    const summary = `${departedEmp.name} (Rank ${departedEmp.rank}) left company. Gross IP impact: ${grossPoints} pts. ` +
      `UNIT_01 Archive (${archiveInfo.name}) protected ${archiveRetainedPoints} pts (${retentionRatePct}%). ` +
      `Net loss: ${netKnowledgePointsLost} pts (${disruptionSeverity} disruption).`;

    return {
      departedEmployeeId: departedEmp.id,
      departedEmployeeName: departedEmp.name,
      departedRank: departedEmp.rank,
      primaryDomain: domain,
      grossKnowledgePointsLost: grossPoints,
      archiveRetainedPoints,
      netKnowledgePointsLost,
      retentionEfficiencyPct: retentionRatePct,
      disruptionSeverity,
      projectDelayWeeks,
      summary,
    };
  }

  /**
   * Performs an executive audit of institutional memory across all engineering domains
   */
  public static auditCampusInstitutionalMemory(
    archiveLevel: CorporateArchiveLevel,
    domainInputs: Partial<Record<EngineeringDomain, { ipPoints: number; patents: number; docsPct: number; veterans: number }>>
  ): CampusInstitutionalMemoryAudit {
    const allDomains: EngineeringDomain[] = [
      "powertrain", "aerodynamics", "chassis", "interior", "electronics",
      "styling", "manufacturing", "safety", "quality"
    ];

    const domainRecords: Record<EngineeringDomain, DomainKnowledgeRecord> = {} as any;
    const criticalVulnerabilities: string[] = [];
    let totalScoreSum = 0;
    let totalVeteransAcrossCampus = 0;

    for (const domain of allDomains) {
      const input = domainInputs[domain] || { ipPoints: 100, patents: 0, docsPct: 40, veterans: 1 };
      
      const mitigationPct = Math.min(25, Math.round((input.ipPoints / 1000) * 15 + (input.docsPct / 100) * 10));

      domainRecords[domain] = {
        domain,
        domainName: DOMAIN_DISPLAY_NAMES[domain],
        accumulatedIpPoints: input.ipPoints,
        patentsGrantedCount: input.patents,
        documentationCompletenessPct: input.docsPct,
        veteranStaffCount: input.veterans,
        failureRiskMitigationPct: mitigationPct,
      };

      totalScoreSum += input.ipPoints;
      totalVeteransAcrossCampus += input.veterans;

      if (input.veterans === 0 && input.docsPct < 50) {
        criticalVulnerabilities.push(`${DOMAIN_DISPLAY_NAMES[domain]}: 0 veterans and weak documentation (${input.docsPct}%). High brain-drain risk!`);
      }
    }

    const archiveRate = ARCHIVE_RETENTION_RATES[archiveLevel].ratePct;
    const overallIndex = Math.min(100, Math.round((totalScoreSum / (allDomains.length * 1000)) * 70 + (archiveRate / 100) * 30));

    const summary = `Campus Institutional Memory Index: ${overallIndex}/100. ` +
      `Archive Level ${archiveLevel} preserves ${archiveRate}% of intellectual assets across ${totalVeteransAcrossCampus} veteran engineers.`;

    return {
      overallInstitutionalMemoryIndex: overallIndex,
      corporateArchiveLevel: archiveLevel,
      archiveRetentionRatePct: archiveRate,
      totalVeteransAcrossCampus,
      domainRecords,
      criticalVulnerabilities,
      summary,
    };
  }
}

// Backwards compatibility export
export const evaluateInstitutionalMemory = InstitutionalMemoryEngine.evaluateDepartmentMemory;
