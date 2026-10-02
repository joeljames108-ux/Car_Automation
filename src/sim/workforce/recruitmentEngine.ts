/**
 * ═══════════════════════════════════════════════════════════════════════
 * RECRUITMENT & TALENT SCOUTING ENGINE — KEY PERSONNEL POOL
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 2, 4, 7, 27 & 28:
 * - Generates prospective Level 3 Key Personnel candidates
 * - Realistic automotive engineering pedigrees & reputations
 * - Permanent EMP-XXXXXX assignment upon hiring
 * - Primary & secondary specializations with multidimensional skill vectors
 */

import {
  Employee,
  EmployeeId,
  DepartmentId,
  DivisionType,
  EmployeeRank,
  TechnicalSkillMatrix,
  ProductionSkillMatrix,
  ManagementSkillMatrix,
  DesignSkillMatrix,
} from "./workforceTypes";
import { generateNextEmployeeId } from "./employeeIdGenerator";
import { calculateOverallSkill } from "./skillMatrixEngine";

export interface EmployeeCandidate {
  candidateId: string;
  name: string;
  birthYear: number;
  age: number;
  division: DivisionType;
  recommendedDepartmentId: DepartmentId;
  targetRank: EmployeeRank;
  primarySpecialization: string;
  secondarySpecialization?: string;
  specializationScore: number;
  skillMatrix: TechnicalSkillMatrix | ProductionSkillMatrix | ManagementSkillMatrix | DesignSkillMatrix;
  overallSkill: number;
  experienceYears: number;
  previousEmployer: string;
  pedigreeSummary: string;
  individualReputation: {
    engineeringScore: number;
    fameCategory: "WORLD_RENOWNED" | "INDUSTRY_VETERAN" | "RISING_STAR" | "STEADY_SPECIALIST";
    notableAchievements: string[];
  };
  expectedBaseSalaryMonthly: number;
  initialMorale: number;
  initialLoyalty: number;
}

const FIRST_NAMES = [
  "Alexander", "Marco", "Elena", "Klaus", "Siddharth", "Marcus", "Hiroshi", "Sophie",
  "Jean-Pierre", "Giuseppe", "Astrid", "Liam", "Carlos", "Dmitri", "Nadia", "Kenji"
];

const LAST_NAMES = [
  "Vanderbilt", "Moretti", "Lindqvist", "Schneider", "Mukherjee", "Sterling", "Tanaka", "Fontaine",
  "Rossi", "Bergmann", "Dubois", "Gallagher", "Castillo", "Novak", "Kowalski", "Sato"
];

const PREVIOUS_EMPLOYERS = [
  "Scuderia Grand Prix Team", "Bavarian Motor Works AG", "Stuttgart High-Performance Tech",
  "Turin Coachbuilding Workshop", "Coventry Experimental Engine Works", "Midlands Aerospace Composites",
  "Yokohama Advanced Propulsion Lab", "Modena Hypercar Atelier", "Detroit V8 Proving Grounds"
];

const SPECIALIZATION_CANDIDATE_POOLS: Record<DivisionType, string[]> = {
  TECHNICAL: [
    "TURBOCHARGING", "COMBUSTION_DYNAMICS", "SUSPENSION_KINEMATICS", "AERODYNAMIC_GROUND_EFFECTS",
    "POWERTRAIN_CALIBRATION", "CARBON_COMPOSITES", "BRAKE_THERMAL_MANAGEMENT", "ACTIVE_AERODYNAMICS"
  ],
  OPERATIONAL: [
    "TOOLING_AND_DIES", "ROBOTIC_ASSEMBLY", "LEAN_MANUFACTURING", "METROLOGY_INSPECTION",
    "SUPPLY_CHAIN_LOGISTICS", "STAMPING_PRESS_OPTIMIZATION"
  ],
  COMMERCIAL: [
    "LUXURY_BRAND_POSITIONING", "DEALERSHIP_EXPANSION", "MOTORSPORT_SPONSORSHIP", "FLEET_SALES_NEGOTIATION"
  ],
  CORPORATE: [
    "STRATEGIC_PLANNING", "CAPITAL_ALLOCATION", "REGULATORY_COMPLIANCE", "M_AND_A_VALUATION"
  ],
  MOTORSPORT: [
    "RACE_ENGINEERING", "PIT_STOP_OPTIMIZATION", "TELEMETRY_DATA_ACQUISITION", "DOWNFORCE_BALANCE"
  ],
};

/**
 * Generate a prospective talent pool of candidates available for headhunting/scouting
 */
export function generateCandidatePool(
  currentYear: number = 1970,
  poolSize: number = 4
): EmployeeCandidate[] {
  const candidates: EmployeeCandidate[] = [];

  const divisions: DivisionType[] = ["TECHNICAL", "TECHNICAL", "OPERATIONAL", "MOTORSPORT"];

  for (let i = 0; i < poolSize; i++) {
    const division = divisions[i % divisions.length];
    const specPool = SPECIALIZATION_CANDIDATE_POOLS[division];
    const primarySpec = specPool[Math.floor(Math.random() * specPool.length)];
    const secondarySpec = specPool[(specPool.indexOf(primarySpec) + 1) % specPool.length];

    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;

    const experienceYears = 6 + Math.floor(Math.random() * 18); // 6 to 24 years
    const age = 26 + experienceYears;
    const birthYear = currentYear - age;

    const rankOptions: EmployeeRank[] = experienceYears > 16 ? [5, 6] : experienceYears > 10 ? [4, 5] : [3, 4];
    const targetRank = rankOptions[Math.floor(Math.random() * rankOptions.length)];

    const baseMastery = 70 + Math.floor(Math.random() * 25);
    const specScore = Math.min(99, baseMastery + Math.floor(Math.random() * 8));

    let skillMatrix: EmployeeCandidate["skillMatrix"];
    let recommendedDept: DepartmentId = "POWERTRAIN";

    if (division === "TECHNICAL") {
      recommendedDept = primarySpec.includes("TURBO") || primarySpec.includes("COMBUSTION") ? "POWERTRAIN" : primarySpec.includes("AERO") ? "AERODYNAMICS" : "CHASSIS";
      skillMatrix = {
        discipline: "TECHNICAL",
        technicalMastery: baseMastery,
        innovation: Math.min(95, baseMastery + (Math.random() > 0.5 ? 5 : -4)),
        problemSolving: Math.min(95, baseMastery + 2),
        accuracy: Math.min(96, baseMastery + 1),
        leadership: targetRank >= 5 ? 75 + Math.floor(Math.random() * 15) : 55,
        legacyTechMastery: currentYear < 1990 ? baseMastery : Math.max(50, baseMastery - 15),
        modernTechAdaptability: currentYear >= 1990 ? baseMastery : Math.min(90, baseMastery + 5),
      };
    } else if (division === "OPERATIONAL") {
      recommendedDept = "MANUFACTURING";
      skillMatrix = {
        discipline: "PRODUCTION",
        machineOperation: baseMastery,
        productionEfficiency: Math.min(95, baseMastery + 2),
        qualityAwareness: Math.min(96, baseMastery + 4),
        safetyCompliance: 88,
        leadership: targetRank >= 5 ? 80 : 60,
      };
    } else if (division === "MOTORSPORT") {
      recommendedDept = "MOTORSPORT_RACING";
      skillMatrix = {
        discipline: "TECHNICAL",
        technicalMastery: baseMastery,
        innovation: Math.min(98, baseMastery + 6),
        problemSolving: Math.min(96, baseMastery + 4),
        accuracy: 90,
        leadership: 78,
        legacyTechMastery: 75,
        modernTechAdaptability: 90,
      };
    } else {
      recommendedDept = "CORPORATE_MANAGEMENT";
      skillMatrix = {
        discipline: "MANAGEMENT",
        leadership: baseMastery,
        strategicPlanning: baseMastery,
        financialAcumen: baseMastery - 5,
        negotiation: baseMastery,
        decisionVelocity: baseMastery + 2,
        peopleDevelopment: baseMastery - 2,
      };
    }

    const overallSkill = calculateOverallSkill(skillMatrix);
    const employer = PREVIOUS_EMPLOYERS[Math.floor(Math.random() * PREVIOUS_EMPLOYERS.length)];

    let fameCategory: EmployeeCandidate["individualReputation"]["fameCategory"] = "STEADY_SPECIALIST";
    if (overallSkill >= 90) fameCategory = "WORLD_RENOWNED";
    else if (overallSkill >= 84) fameCategory = "INDUSTRY_VETERAN";
    else if (targetRank <= 4 && overallSkill >= 78) fameCategory = "RISING_STAR";

    candidates.push({
      candidateId: `CAND-${i + 1}-${Date.now().toString(36).slice(-4)}`,
      name,
      birthYear,
      age,
      division,
      recommendedDepartmentId: recommendedDept,
      targetRank,
      primarySpecialization: primarySpec,
      secondarySpecialization: secondarySpec,
      specializationScore: specScore,
      skillMatrix,
      overallSkill,
      experienceYears,
      previousEmployer: employer,
      pedigreeSummary: `${experienceYears} yrs experience at ${employer}. Renowned for ${primarySpec.toLowerCase().replace(/_/g, " ")}.`,
      individualReputation: {
        engineeringScore: overallSkill,
        fameCategory,
        notableAchievements: [
          `Key contributor on championship-winning chassis and endurance powertrains.`,
          `Authored seminal SAE engineering whitepaper on ${primarySpec.replace(/_/g, " ")}.`,
        ],
      },
      expectedBaseSalaryMonthly: Math.round(targetRank * 6000 * (overallSkill / 75)),
      initialMorale: 85,
      initialLoyalty: 80,
    });
  }

  return candidates;
}

/**
 * Converts a recruited candidate into a full permanent company Employee with permanent EMP-XXXXXX ID
 */
export function hireRecruitedCandidate(
  candidate: EmployeeCandidate,
  assignedDepartmentId: DepartmentId,
  currentYear: number,
  currentMonth: number
): Employee {
  const permanentId = generateNextEmployeeId();

  return {
    id: permanentId,
    name: candidate.name,
    birthYear: candidate.birthYear,
    joinYear: currentYear,
    joinMonth: currentMonth,
    careerLog: [
      {
        year: currentYear,
        month: currentMonth,
        event: "HIRED",
        description: `Recruited as ${candidate.targetRank === 5 ? "Principal Engineer" : "Specialist"} from ${candidate.previousEmployer}.`,
      },
    ],
    division: candidate.division,
    departmentId: assignedDepartmentId,
    facilityId: assignedDepartmentId === "MANUFACTURING" ? "PLANT_A" : "HQ_CAMPUS",
    rank: candidate.targetRank,
    isKeyPersonnel: true,
    primarySpecialization: candidate.primarySpecialization,
    secondarySpecialization: candidate.secondarySpecialization,
    specializationScore: candidate.specializationScore,
    skillMatrix: candidate.skillMatrix,
    overallSkill: candidate.overallSkill,
    experienceYears: candidate.experienceYears,
    tenureMonthsWithCompany: 0,
    productivity: 1.10,
    morale: candidate.initialMorale,
    loyalty: candidate.initialLoyalty,
    jobSatisfaction: 85,
    careerProspects: 90,
    individualReputation: {
      engineeringScore: candidate.individualReputation.engineeringScore,
      notableAchievements: [...candidate.individualReputation.notableAchievements],
    },
  };
}
