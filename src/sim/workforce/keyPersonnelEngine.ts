/**
 * KEY PERSONNEL DOSSIERS & MULTIDIMENSIONAL SKILL RADAR ENGINE
 * 
 * Features:
 * 1. Permanent EMP-XXXXXX Employee Dossiers
 * 2. Multidimensional Skill Radar (Technical, Innovation, Precision, Leadership, Adaptability)
 * 3. Career Milestone History & Project Assignments
 * 4. Morale, Loyalty, Job Satisfaction & Burnout Risk
 */

import { CampusUnitId } from "../campus/campusTypes";
import { EmployeeRank } from "./workforceTypes";
import { formatEmployeeId } from "./employeeIdGenerator";

export type PersonnelDiscipline = "ENGINEERING" | "STYLING" | "MANAGEMENT" | "TESTING" | "MANUFACTURING";

export interface SkillRadarMetrics {
  technicalMastery: number;       // 0-100: CAD, physics, mechanics
  innovationCreativity: number;   // 0-100: breakthroughs, patents
  precisionAccuracy: number;      // 0-100: low tolerance errors
  problemSolvingSpeed: number;    // 0-100: bug/defect troubleshooting
  leadershipMentorship: number;   // 0-100: junior coaching
  techAdaptability: number;       // 0-100: mastering new paradigms
}

export interface CareerMilestoneEntry {
  year: number;
  month: number;
  type: "HIRED" | "PROMOTED" | "TRANSFERRED" | "PROJECT_LAUNCH" | "PATENT_GRANTED" | "AWARD";
  title: string;
  detail: string;
}

export interface KeyPersonnelDossier {
  id: string; // EMP-XXXXXX
  name: string;
  birthYear: number;
  hireYear: number;
  hireMonth: number;
  facilityId: CampusUnitId;
  subDepartmentId: string;
  discipline: PersonnelDiscipline;
  rank: EmployeeRank;
  rankTitle: string;
  monthlySalaryEur: number;
  primarySpecialization: string;
  skillRadar: SkillRadarMetrics;
  overallSkillScore: number;      // 0-100
  moraleScore: number;            // 0-100
  loyaltyScore: number;           // 0-100
  jobSatisfactionScore: number;   // 0-100
  burnoutRiskPct: number;         // 0-100
  currentProjectAssignment?: {
    projectId: string;
    projectName: string;
    assignedRole: string;
  };
  milestoneHistory: CareerMilestoneEntry[];
}

export class KeyPersonnelEngine {
  /**
   * Generates a complete Key Personnel Dossier
   */
  public static createDossier(
    numericId: number,
    name: string,
    birthYear: number,
    hireYear: number,
    hireMonth: number,
    facilityId: CampusUnitId,
    subDepartmentId: string,
    discipline: PersonnelDiscipline,
    rank: EmployeeRank,
    primarySpecialization: string,
    skillRadar: SkillRadarMetrics,
    monthlySalaryEur: number
  ): KeyPersonnelDossier {
    const id = formatEmployeeId(numericId);

    const overallSkillScore = Math.round(
      (skillRadar.technicalMastery * 0.25 +
       skillRadar.innovationCreativity * 0.20 +
       skillRadar.precisionAccuracy * 0.20 +
       skillRadar.problemSolvingSpeed * 0.15 +
       skillRadar.leadershipMentorship * 0.10 +
       skillRadar.techAdaptability * 0.10)
    );

    const rankTitles: Record<EmployeeRank, string> = {
      1: "Trainee / Apprentice",
      2: "Junior Associate",
      3: "Engineer / Specialist",
      4: "Senior Specialist",
      5: "Principal / Lead Architect",
      6: "Department Manager",
      7: "Division Director",
      8: "C-Suite Executive",
      9: "CEO / Founder",
    };

    return {
      id,
      name,
      birthYear,
      hireYear,
      hireMonth,
      facilityId,
      subDepartmentId,
      discipline,
      rank,
      rankTitle: rankTitles[rank],
      monthlySalaryEur,
      primarySpecialization,
      skillRadar,
      overallSkillScore,
      moraleScore: 90,
      loyaltyScore: 92,
      jobSatisfactionScore: 88,
      burnoutRiskPct: 6,
      milestoneHistory: [
        {
          year: hireYear,
          month: hireMonth,
          type: "HIRED",
          title: `Joined Company as ${rankTitles[rank]}`,
          detail: `Assigned to ${facilityId} specializing in ${primarySpecialization}.`,
        },
      ],
    };
  }

  /**
   * Promotes an employee to a higher rank with salary increment and career log entry
   */
  public static promoteEmployee(
    dossier: KeyPersonnelDossier,
    newRank: EmployeeRank,
    year: number,
    month: number,
    salaryIncreasePct: number = 20
  ): KeyPersonnelDossier {
    if (newRank <= dossier.rank) return dossier;

    const rankTitles: Record<EmployeeRank, string> = {
      1: "Trainee / Apprentice",
      2: "Junior Associate",
      3: "Engineer / Specialist",
      4: "Senior Specialist",
      5: "Principal / Lead Architect",
      6: "Department Manager",
      7: "Division Director",
      8: "C-Suite Executive",
      9: "CEO / Founder",
    };

    const newSalary = Math.round(dossier.monthlySalaryEur * (1 + salaryIncreasePct / 100));
    const newRankTitle = rankTitles[newRank];

    const updatedMilestones: CareerMilestoneEntry[] = [
      ...dossier.milestoneHistory,
      {
        year,
        month,
        type: "PROMOTED",
        title: `Promoted to ${newRankTitle}`,
        detail: `Merit promotion following exceptional performance. Salary adjusted to €${newSalary}/mo.`,
      },
    ];

    return {
      ...dossier,
      rank: newRank,
      rankTitle: newRankTitle,
      monthlySalaryEur: newSalary,
      moraleScore: Math.min(100, dossier.moraleScore + 12),
      loyaltyScore: Math.min(100, dossier.loyaltyScore + 8),
      jobSatisfactionScore: Math.min(100, dossier.jobSatisfactionScore + 10),
      milestoneHistory: updatedMilestones,
    };
  }

  /**
   * Assigns an employee to lead or contribute to a vehicle engineering project
   */
  public static assignToProject(
    dossier: KeyPersonnelDossier,
    projectId: string,
    projectName: string,
    roleTitle: string,
    year: number,
    month: number
  ): KeyPersonnelDossier {
    return {
      ...dossier,
      currentProjectAssignment: {
        projectId,
        projectName,
        assignedRole: roleTitle,
      },
      milestoneHistory: [
        ...dossier.milestoneHistory,
        {
          year,
          month,
          type: "PROJECT_LAUNCH",
          title: `Assigned to ${projectName}`,
          detail: `Leading project engineering as ${roleTitle}.`,
        },
      ],
    };
  }
}
