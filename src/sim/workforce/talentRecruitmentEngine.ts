/**
 * TALENT RECRUITMENT & EXECUTIVE HEADHUNTING ENGINE
 * 
 * Features:
 * 1. 3 Recruitment Channels (Apprenticeship, Industry Search, Executive Headhunting)
 * 2. Candidate Generation with Specializations, Radar Skills, and Salary Demands
 * 3. Competitor Rivalry Impact when Headhunting Star Talent
 */

import { CampusUnitId } from "../campus/campusTypes";
import { EmployeeRank } from "./workforceTypes";
import { SkillRadarMetrics } from "./keyPersonnelEngine";

export type RecruitmentChannel = "technical_apprenticeship" | "experienced_industry_search" | "executive_headhunting";

export interface RecruitedCandidate {
  candidateId: string;
  name: string;
  age: number;
  nationality: string;
  channel: RecruitmentChannel;
  targetFacilityId: CampusUnitId;
  targetRank: EmployeeRank;
  rankTitle: string;
  primarySpecialization: string;
  skillRadar: SkillRadarMetrics;
  overallSkillScore: number;
  salaryDemandEurMonth: number;
  agencyHiringFeeEur: number;
  poachedFromCompetitor?: string;
  rivalFrictionPenaltyScore?: number;
}

export class TalentRecruitmentEngine {
  /**
   * Generates a batch of candidates for a specific facility and recruitment channel
   */
  public static generateCandidates(
    facilityId: CampusUnitId,
    channel: RecruitmentChannel,
    year: number,
    specialization: string = "MECHANICAL_ENGINEERING"
  ): RecruitedCandidate[] {
    const candidates: RecruitedCandidate[] = [];

    const firstNames = ["Lukas", "Valentin", "Jean-Pierre", "Marco", "Hiroshi", "Arthur", "Matteo", "David"];
    const lastNames = ["Schmidt", "Dubois", "Moretti", "Takahashi", "Vance", "Lindqvist", "Fischer", "Castillo"];
    const countries = ["Germany", "France", "Italy", "Japan", "United Kingdom", "Sweden", "Switzerland", "United States"];

    const count = channel === "executive_headhunting" ? 2 : 3;

    for (let i = 0; i < count; i++) {
      const name = `${firstNames[(year + i) % firstNames.length]} ${lastNames[(year * 2 + i) % lastNames.length]}`;
      const nationality = countries[(year + i) % countries.length];

      let targetRank: EmployeeRank = 2;
      let age = 22;
      let agencyHiringFeeEur = 1200;
      let baseSalary = 1200;
      let baseSkill = 65;
      let poachedFromCompetitor: string | undefined = undefined;
      let rivalFrictionPenaltyScore: number | undefined = undefined;

      if (channel === "technical_apprenticeship") {
        targetRank = (i % 2 === 0 ? 1 : 2) as EmployeeRank;
        age = 19 + i;
        agencyHiringFeeEur = 1500;
        baseSalary = targetRank === 1 ? 950 : 1350;
        baseSkill = 55 + Math.round(Math.random() * 15);
      } else if (channel === "experienced_industry_search") {
        targetRank = (3 + (i % 2)) as EmployeeRank; // Rank 3 or 4
        age = 29 + i * 3;
        agencyHiringFeeEur = 7500;
        baseSalary = targetRank === 3 ? 2400 : 3400;
        baseSkill = 75 + Math.round(Math.random() * 12);
      } else {
        // executive_headhunting (R5, R6, R7)
        targetRank = (5 + (i % 3)) as EmployeeRank;
        age = 42 + i * 4;
        agencyHiringFeeEur = 26000;
        baseSalary = targetRank === 5 ? 6500 : targetRank === 6 ? 9200 : 14000;
        baseSkill = 88 + Math.round(Math.random() * 8);

        const rivals = ["Nordic Motors", "Bavaria Auto Werke", "Scuderia Veloce", "Detroit Iron Works"];
        poachedFromCompetitor = rivals[i % rivals.length];
        rivalFrictionPenaltyScore = 10 + targetRank * 2;
      }

      const skillRadar: SkillRadarMetrics = {
        technicalMastery: Math.min(99, baseSkill + (i % 3) * 2),
        innovationCreativity: Math.min(99, baseSkill - 2 + (i % 4) * 3),
        precisionAccuracy: Math.min(99, baseSkill + 1),
        problemSolvingSpeed: Math.min(99, baseSkill - 1),
        leadershipMentorship: targetRank >= 4 ? 75 + targetRank * 3 : 40,
        techAdaptability: Math.max(50, 95 - Math.round(age * 0.4)),
      };

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

      candidates.push({
        candidateId: `cand_${facilityId.toLowerCase()}_${i + 1}`,
        name,
        age,
        nationality,
        channel,
        targetFacilityId: facilityId,
        targetRank,
        rankTitle: rankTitles[targetRank],
        primarySpecialization: specialization,
        skillRadar,
        overallSkillScore,
        salaryDemandEurMonth: baseSalary,
        agencyHiringFeeEur,
        poachedFromCompetitor,
        rivalFrictionPenaltyScore,
      });
    }

    return candidates;
  }
}
