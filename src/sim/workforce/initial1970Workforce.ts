/**
 * ═══════════════════════════════════════════════════════════════════════
 * INITIAL 1970 FOUNDING WORKFORCE SEED (46 EMPLOYEES)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 2 & Section 32:
 * In 1970, the company begins with an artisan crew of 46 passionate employees:
 * - Powertrain Engineering (12)
 * - Manufacturing & Coachwork (18)
 * - Vehicle Styling & Clay (4)
 * - Commercial & Sales (4)
 * - Corporate Management & Finance (5)
 * - Testing & Proving Workshop (3)
 *
 * All key personnel are instantiated with permanent EMP-XXXXXX IDs and career logs.
 */

import { Employee, DepartmentAggregation, DepartmentId, EmployeeRank } from "./workforceTypes";
import { formatEmployeeId } from "./employeeIdGenerator";

export const INITIAL_1970_KEY_EMPLOYEES: Employee[] = [
  {
    id: formatEmployeeId(1), // EMP-000001
    name: "Dr. Michael Carter",
    birthYear: 1934,
    joinYear: 1970,
    joinMonth: 1,
    careerLog: [
      { year: 1970, month: 1, event: "HIRED", description: "Joined as Lead Powertrain Engineer & Co-Founder" },
    ],
    division: "TECHNICAL",
    departmentId: "POWERTRAIN",
    facilityId: "HQ_CAMPUS",
    rank: 5, // Principal / Lead
    isKeyPersonnel: true,
    primarySpecialization: "TURBOCHARGING",
    secondarySpecialization: "COMBUSTION_DYNAMICS",
    specializationScore: 92,
    skillMatrix: {
      discipline: "TECHNICAL",
      technicalMastery: 94,
      innovation: 88,
      problemSolving: 91,
      accuracy: 86,
      leadership: 72,
      legacyTechMastery: 95,
      modernTechAdaptability: 82,
    },
    overallSkill: 91,
    experienceYears: 16,
    tenureMonthsWithCompany: 0,
    productivity: 1.25,
    morale: 90,
    loyalty: 95,
    jobSatisfaction: 92,
    careerProspects: 90,
    individualReputation: {
      engineeringScore: 89,
      notableAchievements: ["Designed high-revving 3.0L Quad-Cam V8 prototype"],
    },
    currentAssignment: {
      projectId: "proj_v8_gt_1970",
      projectName: "3.0L Veloce V8 GT",
      role: "Lead Engine Architect",
      assignedMonth: 1,
    },
  },
  {
    id: formatEmployeeId(2), // EMP-000002
    name: "Paolo Vignale",
    birthYear: 1938,
    joinYear: 1970,
    joinMonth: 1,
    careerLog: [
      { year: 1970, month: 1, event: "HIRED", description: "Appointed Chief Styling Director" },
    ],
    division: "TECHNICAL",
    departmentId: "VEHICLE_DESIGN",
    facilityId: "HQ_CAMPUS",
    rank: 7, // Director
    isKeyPersonnel: true,
    primarySpecialization: "CLASS_A_SURFACING",
    secondarySpecialization: "CLAY_MODELING",
    specializationScore: 95,
    skillMatrix: {
      discipline: "DESIGN",
      stylingMastery: 96,
      creativeInnovation: 92,
      proportionsAndStance: 94,
      ergonomicsAndHPoint: 80,
      luxuryCraftsmanship: 89,
    },
    overallSkill: 93,
    experienceYears: 14,
    tenureMonthsWithCompany: 0,
    productivity: 1.20,
    morale: 92,
    loyalty: 92,
    jobSatisfaction: 90,
    careerProspects: 88,
    individualReputation: {
      designScore: 94,
      notableAchievements: ["Sculpted iconic fastback coupe silhouette for 1970 prototype"],
    },
    currentAssignment: {
      projectId: "proj_gt_styling_1970",
      projectName: "Veloce Fastback GT Exterior",
      role: "Chief Stylist",
      assignedMonth: 1,
    },
  },
  {
    id: formatEmployeeId(3), // EMP-000003
    name: "Heinrich Bauer",
    birthYear: 1931,
    joinYear: 1970,
    joinMonth: 1,
    careerLog: [
      { year: 1970, month: 1, event: "HIRED", description: "Appointed Master Tooling Superintendent" },
    ],
    division: "OPERATIONAL",
    departmentId: "MANUFACTURING",
    facilityId: "PLANT_A",
    rank: 6, // Factory Manager
    isKeyPersonnel: true,
    primarySpecialization: "TOOLING_AND_DIES",
    secondarySpecialization: "QUALITY_METROLOGY",
    specializationScore: 89,
    skillMatrix: {
      discipline: "PRODUCTION",
      machineOperation: 92,
      productionEfficiency: 86,
      qualityAwareness: 94,
      safetyCompliance: 88,
      leadership: 84,
    },
    overallSkill: 89,
    experienceYears: 22,
    tenureMonthsWithCompany: 0,
    productivity: 1.15,
    morale: 88,
    loyalty: 96,
    jobSatisfaction: 85,
    careerProspects: 80,
    individualReputation: {
      engineeringScore: 84,
      notableAchievements: ["Toolmaker veteran of legendary Grand Prix road cars"],
    },
  },
  {
    id: formatEmployeeId(4), // EMP-000004
    name: "Arthur Pendelton",
    birthYear: 1942,
    joinYear: 1970,
    joinMonth: 1,
    careerLog: [
      { year: 1970, month: 1, event: "HIRED", description: "Appointed Senior Chassis Dynamics Specialist" },
    ],
    division: "TECHNICAL",
    departmentId: "CHASSIS",
    facilityId: "HQ_CAMPUS",
    rank: 4, // Senior Specialist
    isKeyPersonnel: true,
    primarySpecialization: "SUSPENSION_KINEMATICS",
    secondarySpecialization: "BRAKE_HYDRAULICS",
    specializationScore: 86,
    skillMatrix: {
      discipline: "TECHNICAL",
      technicalMastery: 88,
      innovation: 82,
      problemSolving: 87,
      accuracy: 90,
      leadership: 70,
      legacyTechMastery: 90,
      modernTechAdaptability: 84,
    },
    overallSkill: 86,
    experienceYears: 9,
    tenureMonthsWithCompany: 0,
    productivity: 1.10,
    morale: 85,
    loyalty: 88,
    jobSatisfaction: 88,
    careerProspects: 92,
  },
  {
    id: formatEmployeeId(5), // EMP-000005
    name: "Vikramaditya Roy",
    birthYear: 1928,
    joinYear: 1970,
    joinMonth: 1,
    careerLog: [
      { year: 1970, month: 1, event: "HIRED", description: "Founding Managing Director & Chairman" },
    ],
    division: "CORPORATE",
    departmentId: "CORPORATE_MANAGEMENT",
    facilityId: "HQ_CAMPUS",
    rank: 9, // CEO / Founder
    isKeyPersonnel: true,
    primarySpecialization: "STRATEGIC_PLANNING",
    specializationScore: 92,
    skillMatrix: {
      discipline: "MANAGEMENT",
      leadership: 95,
      strategicPlanning: 92,
      financialAcumen: 88,
      negotiation: 94,
      decisionVelocity: 86,
      peopleDevelopment: 90,
    },
    overallSkill: 92,
    experienceYears: 24,
    tenureMonthsWithCompany: 0,
    productivity: 1.10,
    morale: 95,
    loyalty: 100,
    jobSatisfaction: 95,
    careerProspects: 100,
  },
];

/**
 * Generate the initial 1970 baseline department aggregates (Total: 46 employees)
 */
export function generateInitial1970Departments(): Record<DepartmentId, DepartmentAggregation> {
  const departments = {} as Record<DepartmentId, DepartmentAggregation>;

  const defaultRankDist = (): Record<EmployeeRank, number> => ({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0,
  });

  // Helper to create an aggregation record
  const createDept = (
    id: DepartmentId,
    name: string,
    division: DepartmentAggregation["division"],
    facility: string,
    ranks: Partial<Record<EmployeeRank, number>>,
    avgSkill: number,
    dominantSpec: string,
    keyIds: string[] = []
  ): DepartmentAggregation => {
    const fullRanks = defaultRankDist();
    let totalHeadcount = 0;
    let subordinateCount = 0;
    let managementCount = 0;

    for (const [rStr, count] of Object.entries(ranks)) {
      const rankNum = Number(rStr) as EmployeeRank;
      const cnt = count ?? 0;
      fullRanks[rankNum] = cnt;
      totalHeadcount += cnt;
      if (rankNum >= 6) {
        managementCount += cnt;
      } else {
        subordinateCount += cnt;
      }
    }

    const spanRatio = managementCount > 0 ? Number((subordinateCount / managementCount).toFixed(1)) : subordinateCount;
    let spanHealth: DepartmentAggregation["spanHealth"] = "OPTIMAL";
    if (spanRatio > 18) spanHealth = "CRITICAL_DEFICIT";
    else if (spanRatio > 12) spanHealth = "STRAINED";
    else if (spanRatio < 4) spanHealth = "HEALTHY";

    return {
      departmentId: id,
      division,
      departmentName: name,
      facilityLocation: facility,
      totalHeadcount,
      headcountByRank: fullRanks,
      averageOverallSkill: avgSkill,
      averageExperienceYears: Math.round(avgSkill * 0.12),
      averageTenureMonths: 1,
      dominantSpecializations: [{ name: dominantSpec, count: totalHeadcount, avgScore: avgSkill }],
      monthlyWorkUnitsCapacity: Math.round(totalHeadcount * 180 * (avgSkill / 100)),
      monthlyWorkUnitsDemand: Math.round(totalHeadcount * 150 * (avgSkill / 100)),
      utilizationPercentage: 83,
      capacityDeficitOrSurplus: Math.round(totalHeadcount * 30 * (avgSkill / 100)),
      managementCount,
      subordinateCount,
      spanRatio,
      spanHealth,
      spanPenalty: 0.0,
      averageMorale: 88,
      burnoutRiskLevel: "NONE",
      keyPersonnelIds: keyIds as any[],
    };
  };

  // 1. Powertrain (12)
  departments.POWERTRAIN = createDept(
    "POWERTRAIN",
    "Powertrain & Mechanical Engineering",
    "TECHNICAL",
    "HQ_CAMPUS",
    { 1: 2, 2: 3, 3: 4, 4: 2, 5: 1 },
    74,
    "TURBOCHARGING",
    [formatEmployeeId(1)]
  );

  // 2. Chassis & Dynamics (4)
  departments.CHASSIS = createDept(
    "CHASSIS",
    "Chassis & Vehicle Dynamics",
    "TECHNICAL",
    "HQ_CAMPUS",
    { 2: 1, 3: 2, 4: 1 },
    72,
    "SUSPENSION_KINEMATICS",
    [formatEmployeeId(4)]
  );

  // 3. Vehicle Design & Styling (4)
  departments.VEHICLE_DESIGN = createDept(
    "VEHICLE_DESIGN",
    "Vehicle Styling & Clay Studio",
    "TECHNICAL",
    "HQ_CAMPUS",
    { 2: 1, 3: 1, 4: 1, 7: 1 },
    82,
    "CLASS_A_SURFACING",
    [formatEmployeeId(2)]
  );

  // 4. Plant Tooling & Assembly (18)
  departments.MANUFACTURING = createDept(
    "MANUFACTURING",
    "Plant Tooling & Hand Assembly",
    "OPERATIONAL",
    "PLANT_A",
    { 1: 4, 2: 5, 3: 6, 4: 2, 6: 1 },
    68,
    "TOOLING_AND_DIES",
    [formatEmployeeId(3)]
  );

  // 5. Commercial & Sales (4)
  departments.SALES = createDept(
    "SALES",
    "Commercial & Dealership Relations",
    "COMMERCIAL",
    "HQ_CAMPUS",
    { 2: 1, 3: 2, 6: 1 },
    65,
    "COMMERCIAL_LIAISON"
  );

  // 6. Corporate Management & Finance (4)
  departments.CORPORATE_MANAGEMENT = createDept(
    "CORPORATE_MANAGEMENT",
    "Corporate Executive & Finance",
    "CORPORATE",
    "HQ_CAMPUS",
    { 4: 1, 6: 1, 8: 1, 9: 1 },
    86,
    "STRATEGIC_PLANNING",
    [formatEmployeeId(5)]
  );

  // 7. Testing & Proving Grounds Workshop (3)
  departments.TESTING_VALIDATION = createDept(
    "TESTING_VALIDATION",
    "Testing & Proving Grounds Workshop",
    "TECHNICAL",
    "PROVING_GROUNDS",
    { 2: 1, 3: 1, 4: 1 },
    70,
    "TRACK_TESTING"
  );

  // Empty initial seeds for dormant departments in 1970
  const remainingDepts: DepartmentId[] = [
    "RD_ENGINEERING", "AERODYNAMICS", "ELECTRONICS_SOFTWARE", "SAFETY_CRASH",
    "MATERIALS_METALLURGY", "MFG_ENGINEERING", "SUPPLY_CHAIN", "LOGISTICS",
    "PROCUREMENT", "QUALITY_ASSURANCE", "MARKETING_PR", "DEALER_SERVICE",
    "FINANCE_TREASURY", "HR_TALENT", "LEGAL_COMPLIANCE", "MOTORSPORT_RACING"
  ];

  for (const depId of remainingDepts) {
    let div: DepartmentAggregation["division"] = "TECHNICAL";
    if (["SUPPLY_CHAIN", "LOGISTICS", "PROCUREMENT", "QUALITY_ASSURANCE"].includes(depId)) div = "OPERATIONAL";
    if (["MARKETING_PR", "DEALER_SERVICE"].includes(depId)) div = "COMMERCIAL";
    if (["FINANCE_TREASURY", "HR_TALENT", "LEGAL_COMPLIANCE"].includes(depId)) div = "CORPORATE";
    if (depId === "MOTORSPORT_RACING") div = "MOTORSPORT";

    departments[depId] = createDept(
      depId,
      depId.replace(/_/g, " "),
      div,
      "HQ_CAMPUS",
      {},
      50,
      "GENERAL"
    );
  }

  return departments;
}
