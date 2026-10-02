/**
 * ═══════════════════════════════════════════════════════════════════════
 * MONTHLY WORKFORCE TICK — CALENDAR PROGRESSION & ATTRITION HEARTBEAT
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 8, 9, 10, 28 & 29:
 * - Monthly experience & tenure accumulation
 * - Career milestone awards (5-year, 10-year, 20-year veteran recognition)
 * - Technological obsolescence curve vs veteran wisdom
 * - Institutional memory risk mitigation updates
 * - Morale-driven natural turnover & competitor headhunting alerts
 */

import { Employee, DepartmentId, DepartmentAggregation } from "./workforceTypes";
import { processEmployeeMonthlyProgression } from "./experienceEngine";
import { evaluateInstitutionalMemory } from "./institutionalMemoryEngine";

export interface MonthlyWorkforceTickReport {
  year: number;
  month: number;
  totalEmployeesBefore: number;
  totalEmployeesAfter: number;
  newVeteransRecognized: string[]; // Names of employees reaching veteran status
  milestonesAwarded: Array<{ employeeName: string; milestone: string }>;
  naturalDeparturesCount: number;
  headhuntingAlerts: string[];
  averageCompanyMorale: number;
  institutionalMemoryAverage: number;
  failureRiskMitigationPct: number;
}

/**
 * Executes a full monthly simulation tick for the company's workforce.
 * Driven by the simulation calendar clock.
 */
export function executeMonthlyWorkforceTick(
  keyPersonnel: Record<string, Employee>,
  departments: Record<DepartmentId, DepartmentAggregation>,
  currentYear: number,
  currentMonth: number,
  isEraTransitionYear: boolean = false
): {
  updatedKeyPersonnel: Record<string, Employee>;
  updatedDepartments: Record<DepartmentId, DepartmentAggregation>;
  report: MonthlyWorkforceTickReport;
} {
  const updatedKeyPersonnel: Record<string, Employee> = {};
  const newVeteransRecognized: string[] = [];
  const milestonesAwarded: Array<{ employeeName: string; milestone: string }> = [];
  const headhuntingAlerts: string[] = [];
  let naturalDeparturesCount = 0;

  // 1. Process Key Personnel
  for (const [id, emp] of Object.entries(keyPersonnel)) {
    const { updatedEmployee, report } = processEmployeeMonthlyProgression(
      emp,
      currentYear,
      currentMonth,
      false, // wasOnActiveProject
      isEraTransitionYear,
      false  // attendedTraining
    );

    if (report.milestonesAdded.length > 0) {
      for (const m of report.milestonesAdded) {
        milestonesAwarded.push({
          employeeName: emp.name,
          milestone: m,
        });
        if (m.includes("Veteran") || m.includes("Founder")) {
          newVeteransRecognized.push(emp.name);
        }
      }
    }

    // Check for competitor headhunting on star engineers (Section 27 & 28)
    const reputationScore = emp.individualReputation?.engineeringScore || emp.overallSkill;
    if (reputationScore >= 88 && emp.morale < 60 && emp.loyalty < 65) {
      headhuntingAlerts.push(
        `${emp.name} (${emp.id}, ${emp.primarySpecialization}) is being aggressively scouted by rival racing and OEM teams!`
      );
    }

    updatedKeyPersonnel[id] = updatedEmployee;
  }

  // 2. Process Departments & Aggregations
  const updatedDepartments = { ...departments };
  let totalHeadcount = 0;
  let totalMoraleWeighted = 0;
  let totalMemScore = 0;
  let activeDeptCount = 0;
  let totalMitigationPct = 0;

  for (const [depId, dept] of Object.entries(departments)) {
    if (dept.totalHeadcount === 0) continue;
    activeDeptCount += 1;

    // Monthly tenure advance
    const newTenure = dept.averageTenureMonths + 1;
    const newExp = Math.round(newTenure / 12) + dept.averageExperienceYears;

    // Natural attrition calculation
    let departuresInDept = 0;
    if (dept.averageMorale < 40 && dept.totalHeadcount > 5) {
      // 1-2% monthly attrition if severely demoralized
      departuresInDept = Math.max(1, Math.round(dept.totalHeadcount * 0.015));
      naturalDeparturesCount += departuresInDept;
    }

    const newHeadcount = Math.max(0, dept.totalHeadcount - departuresInDept);
    totalHeadcount += newHeadcount;
    totalMoraleWeighted += newHeadcount * dept.averageMorale;

    // Institutional memory
    const keysInDept = Object.values(updatedKeyPersonnel).filter((k) => k.departmentId === depId);
    const memDiag = evaluateInstitutionalMemory(
      { ...dept, averageTenureMonths: newTenure },
      keysInDept
    );

    totalMemScore += memDiag.institutionalKnowledgeIndex;
    totalMitigationPct += memDiag.failureRiskMitigationPct;

    updatedDepartments[depId as DepartmentId] = {
      ...dept,
      totalHeadcount: newHeadcount,
      averageTenureMonths: newTenure,
      averageExperienceYears: Math.min(45, dept.averageExperienceYears + (currentMonth === 12 ? 1 : 0)),
      monthlyWorkUnitsCapacity: Math.round(newHeadcount * 180 * (dept.averageOverallSkill / 100)),
    };
  }

  const averageCompanyMorale = totalHeadcount > 0 ? Math.round(totalMoraleWeighted / totalHeadcount) : 80;
  const institutionalMemoryAverage = activeDeptCount > 0 ? Math.round(totalMemScore / activeDeptCount) : 50;
  const failureRiskMitigationPct = activeDeptCount > 0 ? Math.round(totalMitigationPct / activeDeptCount) : 10;

  return {
    updatedKeyPersonnel,
    updatedDepartments,
    report: {
      year: currentYear,
      month: currentMonth,
      totalEmployeesBefore: totalHeadcount + naturalDeparturesCount,
      totalEmployeesAfter: totalHeadcount,
      newVeteransRecognized,
      milestonesAwarded,
      naturalDeparturesCount,
      headhuntingAlerts,
      averageCompanyMorale,
      institutionalMemoryAverage,
      failureRiskMitigationPct,
    },
  };
}
