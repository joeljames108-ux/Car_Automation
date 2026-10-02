/**
 * ═══════════════════════════════════════════════════════════════════════
 * PROJECT WORKFORCE BINDING — WORKLOAD DEMAND & RELEVANT SKILL ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 7, 11, 22 & 25:
 * - Specialization is more important than raw skill (Relevant Skill vs Overall Skill)
 * - Workload demand vs Department Capacity (Work Units WU / month)
 * - Capacity deficit detection & actionable managerial guidance
 * - Principal Engineer force multiplier on complex multi-department projects
 */

import { DepartmentAggregation, DepartmentId, Employee } from "./workforceTypes";
import { calculateSpecializationMatch } from "./specializationRegistry";
import { calculateProjectRelevantSkill } from "./skillMatrixEngine";

export interface ProjectWorkloadRequirement {
  projectId: string;
  projectName: string;
  category: "ENGINE" | "VEHICLE" | "CHASSIS" | "AERO" | "ELECTRONICS" | "RND_RESEARCH";
  leadDepartmentId: DepartmentId;
  contributingDepartments?: Array<{
    departmentId: DepartmentId;
    workloadSharePct: number; // e.g. 20%
  }>;
  requiredSpecializations: Array<{
    specialization: string;
    importanceWeight: number; // 0.1 to 1.0
  }>;
  monthlyWorkloadDemandWU: number; // e.g. 12,000 WU/month
  difficultyTier: "ROUTINE" | "COMPLEX" | "BREAKTHROUGH" | "LEGENDARY";
}

export interface EngineerProjectEvaluation {
  employeeId: string;
  employeeName: string;
  rank: number;
  overallSkill: number;
  relevantSkill: number;
  specializationMatchPct: number;
  monthlyWUBonus: number;
  fitAssessment: "IDEAL_FIT" | "SOLID_CONTRIBUTOR" | "MISALIGNED_SPECIALIST" | "INSUFFICIENT_EXPERIENCE";
  rationale: string;
}

export interface DepartmentProjectCapacityReport {
  departmentId: DepartmentId;
  departmentName: string;
  monthlyCapacityWU: number;
  activeWorkloadDemandWU: number;
  capacityDeficitOrSurplus: number; // positive = surplus, negative = deficit
  utilizationPct: number;
  status: "CRITICALLY_UNDERSTAFFED" | "OVERLOADED" | "BALANCED" | "SURPLUS_CAPACITY";
  activeProjectsCount: number;
  leadPrincipalEngineerId?: string;
  principalForceMultiplier: number; // e.g. 1.16 (+16%)
  executiveGuidance: string[];
}

/**
 * Evaluates an individual engineer's suitability for a specific project.
 * Demonstrates Section 7: Engineer A (Turbo 96) delivers higher progress than
 * Engineer B (Turbo 54) even if Engineer B has higher raw general skill!
 */
export function evaluateEngineerProjectFit(
  employee: Employee,
  project: ProjectWorkloadRequirement
): EngineerProjectEvaluation {
  // 1. Calculate best match across project requirements
  let highestSpecScore = 0;
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const req of project.requiredSpecializations) {
    const matchMultiplier = calculateSpecializationMatch(
      employee.primarySpecialization,
      employee.secondarySpecialization,
      employee.specializationScore,
      req.specialization
    );
    const specQualityPct = Math.min(100, Math.round(matchMultiplier * 100 * (employee.specializationScore / 100)));
    totalWeightedScore += specQualityPct * req.importanceWeight;
    totalWeight += req.importanceWeight;

    if (specQualityPct > highestSpecScore) {
      highestSpecScore = specQualityPct;
    }
  }

  const specializationMatchPct = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 50;

  // 2. Compute relevant skill using skill matrix engine
  const primaryReq = project.requiredSpecializations[0]?.specialization || "GENERAL";
  const relevantSkill = calculateProjectRelevantSkill(employee, {
    targetSpecializationId: primaryReq,
    requiresHighInnovation: project.difficultyTier === "BREAKTHROUGH" || project.difficultyTier === "LEGENDARY",
    requiresHighAccuracy: project.difficultyTier !== "ROUTINE",
  });

  // 3. Monthly Work Units contributed
  const baseWU = employee.rank * 180 * (relevantSkill / 100) * employee.productivity;
  const rankMulti = employee.rank === 5 ? 1.25 : employee.rank === 4 ? 1.10 : 1.0;
  const monthlyWUBonus = Math.round(baseWU * rankMulti);

  // 4. Fit Assessment
  let fitAssessment: EngineerProjectEvaluation["fitAssessment"] = "SOLID_CONTRIBUTOR";
  let rationale = `Contributes standard engineering output of ~${monthlyWUBonus} WU/mo.`;

  if (specializationMatchPct >= 85 && relevantSkill >= 80) {
    fitAssessment = "IDEAL_FIT";
    rationale = `Exceptional domain synergy in ${employee.primarySpecialization}. Maximizes project velocity and reduces defect rate.`;
  } else if (specializationMatchPct < 55 || relevantSkill < 60) {
    fitAssessment = "MISALIGNED_SPECIALIST";
    rationale = `Specialized in ${employee.primarySpecialization} which provides minimal relevance to this ${project.category} initiative.`;
  } else if (employee.rank <= 2 && project.difficultyTier !== "ROUTINE") {
    fitAssessment = "INSUFFICIENT_EXPERIENCE";
    rationale = `Junior status provides good learning growth but requires senior oversight on ${project.difficultyTier} projects.`;
  }

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    rank: employee.rank,
    overallSkill: employee.overallSkill,
    relevantSkill,
    specializationMatchPct,
    monthlyWUBonus,
    fitAssessment,
    rationale,
  };
}

/**
 * Evaluates department-level project capacity vs workload demand (Section 11)
 */
export function evaluateDepartmentWorkloadAndDeficit(
  department: DepartmentAggregation,
  activeProjects: ProjectWorkloadRequirement[],
  hqCoordinationScore: number = 80
): DepartmentProjectCapacityReport {
  // 1. Calculate active workload demand on this department
  let totalDemandWU = 0;
  let activeProjectsCount = 0;

  for (const proj of activeProjects) {
    if (proj.leadDepartmentId === department.departmentId) {
      totalDemandWU += proj.monthlyWorkloadDemandWU;
      activeProjectsCount += 1;
    } else if (proj.contributingDepartments) {
      const match = proj.contributingDepartments.find((d) => d.departmentId === department.departmentId);
      if (match) {
        totalDemandWU += Math.round(proj.monthlyWorkloadDemandWU * (match.workloadSharePct / 100));
        activeProjectsCount += 1;
      }
    }
  }

  // 2. Department Effective Capacity
  const monthlyCapacityWU = department.monthlyWorkUnitsCapacity;
  const deficitOrSurplus = monthlyCapacityWU - totalDemandWU;
  const utilizationPct = monthlyCapacityWU > 0 ? Math.round((totalDemandWU / monthlyCapacityWU) * 100) : 0;

  // 3. Status Assessment
  let status: DepartmentProjectCapacityReport["status"] = "BALANCED";
  const executiveGuidance: string[] = [];

  if (utilizationPct > 140) {
    status = "CRITICALLY_UNDERSTAFFED";
    executiveGuidance.push(
      `CRITICAL DEFICIT: Department demand (${totalDemandWU.toLocaleString()} WU) exceeds capacity (${monthlyCapacityWU.toLocaleString()} WU) by ${Math.abs(deficitOrSurplus).toLocaleString()} WU/mo.`
    );
    executiveGuidance.push("Employees are at severe burnout risk. Project timelines will experience substantial delays.");
    executiveGuidance.push("Recommended Actions: Hire 3+ Senior Engineers, recruit a Principal Engineer, or outsource secondary modules.");
  } else if (utilizationPct > 105) {
    status = "OVERLOADED";
    executiveGuidance.push(
      `MODERATE DEFICIT: Department is operating at ${utilizationPct}% capacity (${Math.abs(deficitOrSurplus).toLocaleString()} WU deficit).`
    );
    executiveGuidance.push("Recommended Actions: Add apprentice/junior engineers to absorb drafting and routine calculations.");
  } else if (utilizationPct < 55) {
    status = "SURPLUS_CAPACITY";
    executiveGuidance.push(
      `SURPLUS CAPACITY: Department has ${deficitOrSurplus.toLocaleString()} WU/mo of idle bandwidth (${utilizationPct}% utilized).`
    );
    executiveGuidance.push("Opportunity: Initiate advanced R&D projects or enter new motorsport racing categories to utilize talent.");
  } else {
    status = "BALANCED";
    executiveGuidance.push("Department workload is optimally aligned with human capital capacity.");
  }

  // Check Principal Engineer bonus
  const numPrincipals = department.headcountByRank[5] || 0;
  const principalForceMultiplier = Number((1.0 + Math.min(0.25, numPrincipals * 0.08)).toFixed(2));
  if (numPrincipals === 0 && activeProjectsCount > 0) {
    executiveGuidance.push("Tip: Promoting or hiring a Principal Engineer (Rank 5) will provide a +8% to +25% force multiplier across all staff.");
  }

  return {
    departmentId: department.departmentId,
    departmentName: department.departmentName,
    monthlyCapacityWU,
    activeWorkloadDemandWU: totalDemandWU,
    capacityDeficitOrSurplus: deficitOrSurplus,
    utilizationPct,
    status,
    activeProjectsCount,
    leadPrincipalEngineerId: department.keyPersonnelIds[0],
    principalForceMultiplier,
    executiveGuidance,
  };
}
