/**
 * ═══════════════════════════════════════════════════════════════════════
 * EXPERIENCE, AGING & TECHNOLOGICAL OBSOLESCENCE ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 8 ("Employee Experience"), Section 9 ("Skill Growth"),
 * and Section 10 ("Skill Decline & Technological Obsolescence").
 *
 * Simulates:
 * 1. Monthly experience & tenure accumulation.
 * 2. Mentorship skill transfer from Seniors to Juniors.
 * 3. Technology era transitions and knowledge obsolescence vs veteran judgment.
 */

import { Employee, TechnicalSkillMatrix } from "./workforceTypes";
import { calculateOverallSkill } from "./skillMatrixEngine";

export interface MonthlyExperienceUpdateReport {
  employeeId: string;
  previousOverallSkill: number;
  newOverallSkill: number;
  skillDelta: number;
  experienceYears: number;
  tenureMonths: number;
  isVeteran: boolean; // >= 10 years tenure
  milestonesAdded: string[];
}

/**
 * Update an employee's experience and skill progression for one simulation month
 */
export function processEmployeeMonthlyProgression(
  employee: Employee,
  currentSimYear: number,
  currentSimMonth: number,
  isUnderSeniorMentorship = false,
  isEnrolledInTraining = false,
  recentProjectSuccess = false
): { updatedEmployee: Employee; report: MonthlyExperienceUpdateReport } {
  const newTenureMonths = employee.tenureMonthsWithCompany + 1;
  const newExpYears = Number((employee.experienceYears + 1 / 12).toFixed(2));
  const age = currentSimYear - employee.birthYear;

  const prevSkill = employee.overallSkill;
  const matrix = { ...employee.skillMatrix };
  const milestones: string[] = [];

  // 1. Skill Growth calculation
  // Base learning rate (faster when young / early in career)
  let growthRate = Math.max(0.02, 0.15 - (employee.overallSkill / 100) * 0.12);

  if (isUnderSeniorMentorship) {
    growthRate *= 1.6; // +60% mentorship growth boost
  }
  if (isEnrolledInTraining) {
    growthRate += 0.25; // Formal academy training boost
  }
  if (recentProjectSuccess) {
    growthRate += 0.35; // Major project completion breakthrough
    milestones.push(`Major milestone achieved on active vehicle project in ${currentSimYear}`);
  }

  // 2. Discipline-specific progression
  if (matrix.discipline === "TECHNICAL") {
    const tech = matrix as TechnicalSkillMatrix;

    // Technical mastery grows with experience
    tech.technicalMastery = Math.min(99, Number((tech.technicalMastery + growthRate).toFixed(2)));
    tech.problemSolving = Math.min(99, Number((tech.problemSolving + growthRate * 0.9).toFixed(2)));

    // Leadership naturally blooms with experience (>8 years)
    if (newExpYears > 8) {
      tech.leadership = Math.min(95, Number((tech.leadership + 0.05).toFixed(2)));
    }

    // Aging & Technological Obsolescence (Section 10)
    // When engineer passes age 52, modernTechAdaptability slows down while legacyTechMastery climbs
    if (age > 52 && !isEnrolledInTraining) {
      tech.modernTechAdaptability = Math.max(40, Number((tech.modernTechAdaptability - 0.04).toFixed(2)));
      tech.legacyTechMastery = Math.min(99, Number((tech.legacyTechMastery + 0.06).toFixed(2)));
    } else if (isEnrolledInTraining) {
      // Re-training revitalizes modern technology adaptability
      tech.modernTechAdaptability = Math.min(95, Number((tech.modernTechAdaptability + 0.30).toFixed(2)));
    }
  }

  // 3. Re-calculate overall skill
  const newOverall = calculateOverallSkill(matrix);
  const skillDelta = newOverall - prevSkill;

  // 4. Milestone checks
  const careerLog = [...employee.careerLog];
  if (newTenureMonths === 60) {
    const m = {
      year: currentSimYear,
      month: currentSimMonth,
      event: "AWARD_RECEIVED" as const,
      description: "5-Year Bronze Long-Service Dedication Pin",
    };
    careerLog.push(m);
    milestones.push(m.description);
  } else if (newTenureMonths === 120) {
    const m = {
      year: currentSimYear,
      month: currentSimMonth,
      event: "AWARD_RECEIVED" as const,
      description: "10-Year Silver Company Veteran Honor",
    };
    careerLog.push(m);
    milestones.push(m.description);
  } else if (newTenureMonths === 240) {
    const m = {
      year: currentSimYear,
      month: currentSimMonth,
      event: "AWARD_RECEIVED" as const,
      description: "20-Year Golden Master Guild Fellowship & Legend Status",
    };
    careerLog.push(m);
    milestones.push(m.description);
  }

  // 5. Updated employee record
  const updatedEmployee: Employee = {
    ...employee,
    experienceYears: newExpYears,
    tenureMonthsWithCompany: newTenureMonths,
    skillMatrix: matrix,
    overallSkill: newOverall,
    careerLog,
    // Loyalty builds with tenure
    loyalty: Math.min(100, Number((employee.loyalty + (newTenureMonths > 24 ? 0.08 : 0.02)).toFixed(2))),
  };

  return {
    updatedEmployee,
    report: {
      employeeId: employee.id,
      previousOverallSkill: prevSkill,
      newOverallSkill: newOverall,
      skillDelta,
      experienceYears: newExpYears,
      tenureMonths: newTenureMonths,
      isVeteran: newTenureMonths >= 120,
      milestonesAdded: milestones,
    },
  };
}
