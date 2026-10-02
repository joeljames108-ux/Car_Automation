/**
 * ═══════════════════════════════════════════════════════════════════════
 * WORKFORCE TYPES & DATA STRUCTURES — 3-LEVEL REPRESENTATION ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements the core foundational schema:
 * - Employee Count (Macro Total & Department Aggregation)
 * - Employee Number (Permanent EMP-XXXXXX Identity)
 * - Multidimensional Skill Matrices (Technical, Production, Management, Design)
 * - Specializations & Project Relevance
 * - HQ Organizational Coordination & Management Capacity
 */

export type EmployeeId = `EMP-${string}`; // e.g. "EMP-001247"

export type DivisionType =
  | "TECHNICAL"
  | "OPERATIONAL"
  | "COMMERCIAL"
  | "CORPORATE"
  | "MOTORSPORT";

export type DepartmentId =
  // Technical Division (10)
  | "RD_ENGINEERING"
  | "VEHICLE_DESIGN"
  | "POWERTRAIN"
  | "CHASSIS"
  | "AERODYNAMICS"
  | "ELECTRONICS_SOFTWARE"
  | "SAFETY_CRASH"
  | "MATERIALS_METALLURGY"
  | "MFG_ENGINEERING"
  | "TESTING_VALIDATION"
  // Operational Division (5)
  | "MANUFACTURING"
  | "SUPPLY_CHAIN"
  | "LOGISTICS"
  | "PROCUREMENT"
  | "QUALITY_ASSURANCE"
  // Commercial Division (3)
  | "SALES"
  | "MARKETING_PR"
  | "DEALER_SERVICE"
  // Corporate Division (4)
  | "FINANCE_TREASURY"
  | "HR_TALENT"
  | "LEGAL_COMPLIANCE"
  | "CORPORATE_MANAGEMENT"
  // Motorsport Division (1)
  | "MOTORSPORT_RACING";

export type EmployeeRank =
  | 1 // Trainee / Apprentice (0.35 productivity)
  | 2 // Junior Associate (0.60 productivity)
  | 3 // Engineer / Specialist (1.00 productivity benchmark)
  | 4 // Senior Specialist (1.30 productivity, mentor)
  | 5 // Principal / Lead (1.60 productivity, force multiplier)
  | 6 // Manager (Span & Resource Controller)
  | 7 // Director (Division Head)
  | 8 // Executive / C-Suite (CTO, COO, CFO, Chief Designer)
  | 9; // CEO / Founder (Company Leader)

export const RANK_NAMES: Record<EmployeeRank, { title: string; short: string; baseProductivity: number }> = {
  1: { title: "Trainee / Apprentice", short: "Trainee", baseProductivity: 0.35 },
  2: { title: "Junior Associate", short: "Junior", baseProductivity: 0.60 },
  3: { title: "Engineer / Specialist", short: "Engineer", baseProductivity: 1.00 },
  4: { title: "Senior Specialist", short: "Senior", baseProductivity: 1.30 },
  5: { title: "Principal / Lead Authority", short: "Principal", baseProductivity: 1.60 },
  6: { title: "Department Manager", short: "Manager", baseProductivity: 0.50 },
  7: { title: "Division Director", short: "Director", baseProductivity: 0.20 },
  8: { title: "C-Suite Executive", short: "Executive", baseProductivity: 0.10 },
  9: { title: "CEO & Company Leadership", short: "CEO", baseProductivity: 0.05 },
};

export interface CareerMilestone {
  year: number;
  month: number;
  event: "HIRED" | "PROMOTED" | "TRANSFERRED" | "MAJOR_PROJECT_COMPLETED" | "AWARD_RECEIVED" | "PATENT_GRANTED";
  description: string;
}

/** 1. Technical & R&D Personnel Skill Matrix */
export interface TechnicalSkillMatrix {
  discipline: "TECHNICAL";
  technicalMastery: number;       // 0-100: CAD/CAE/mechanical principles
  innovation: number;             // 0-100: breakthrough research & patent rate
  problemSolving: number;         // 0-100: rapid bug & tolerance troubleshooting
  accuracy: number;               // 0-100: low defect / high precision calculation
  leadership: number;             // 0-100: mentoring & coordination
  legacyTechMastery: number;      // 0-100: historical era knowledge
  modernTechAdaptability: number; // 0-100: speed mastering new paradigm tech
}

/** 2. Factory Floor & Tooling Skill Matrix */
export interface ProductionSkillMatrix {
  discipline: "PRODUCTION";
  machineOperation: number;       // 0-100: stamping, CNC, robotic cell operation
  productionEfficiency: number;   // 0-100: cycle time and output pace
  qualityAwareness: number;       // 0-100: metrology and fit-and-finish detection
  safetyCompliance: number;       // 0-100: low injury risk & zero downtime
  leadership: number;             // 0-100: shift supervision
}

/** 3. Corporate & Leadership Skill Matrix */
export interface ManagementSkillMatrix {
  discipline: "MANAGEMENT";
  leadership: number;             // 0-100: authority, team vision & span capacity
  strategicPlanning: number;      // 0-100: roadmaps and milestone prediction
  financialAcumen: number;        // 0-100: cost control and budget efficiency
  negotiation: number;            // 0-100: vendor bids & union management
  decisionVelocity: number;       // 0-100: fast, high-confidence decision making
  peopleDevelopment: number;      // 0-100: morale retention & internal talent growth
}

/** 4. Styling & Luxury Craftsmanship Skill Matrix */
export interface DesignSkillMatrix {
  discipline: "DESIGN";
  stylingMastery: number;         // 0-100: silhouette beauty & brand identity
  creativeInnovation: number;     // 0-100: radical concept generation
  proportionsAndStance: number;   // 0-100: athletic posture & stance execution
  ergonomicsAndHPoint: number;    // 0-100: cockpit sightlines and tactile comfort
  luxuryCraftsmanship: number;    // 0-100: leather, wood, knurled metal detailing
}

export type AnySkillMatrix =
  | TechnicalSkillMatrix
  | ProductionSkillMatrix
  | ManagementSkillMatrix
  | DesignSkillMatrix;

/** Level 3: Individual Key Employee Record */
export interface Employee {
  id: EmployeeId;                 // Permanent permanent ID: EMP-XXXXXX
  name: string;
  birthYear: number;
  joinYear: number;
  joinMonth: number;
  careerLog: CareerMilestone[];

  division: DivisionType;
  departmentId: DepartmentId;
  facilityId: string;             // Physical workplace: "HQ_CAMPUS", "PLANT_A", "PROVING_GROUNDS"
  rank: EmployeeRank;
  isKeyPersonnel: boolean;        // High-visibility personnel (Level 3)

  primarySpecialization: string;  // e.g. "TURBOCHARGING"
  secondarySpecialization?: string;// e.g. "COMBUSTION_DYNAMICS"
  specializationScore: number;    // 0-100 specialization mastery

  skillMatrix: AnySkillMatrix;
  overallSkill: number;           // Derived composite 0-100

  experienceYears: number;
  tenureMonthsWithCompany: number;
  productivity: number;           // Dynamic multiplier (0.5 to 2.0)
  morale: number;                 // 0-100
  loyalty: number;                // 0-100
  jobSatisfaction: number;        // 0-100
  careerProspects: number;        // 0-100

  individualReputation?: {
    engineeringScore?: number;
    motorsportScore?: number;
    designScore?: number;
    notableAchievements: string[];
  };

  currentAssignment?: {
    projectId: string;
    projectName: string;
    role: string;
    assignedMonth: number;
  };
}

/** Level 2: Department Aggregation Record */
export interface DepartmentAggregation {
  departmentId: DepartmentId;
  division: DivisionType;
  departmentName: string;
  facilityLocation: string;

  // Headcount & Rank Breakdown
  totalHeadcount: number;
  headcountByRank: Record<EmployeeRank, number>;

  // Skill & Experience Aggregates
  averageOverallSkill: number;
  averageExperienceYears: number;
  averageTenureMonths: number;
  dominantSpecializations: Array<{ name: string; count: number; avgScore: number }>;

  // Workload vs Capacity (Physics)
  monthlyWorkUnitsCapacity: number;
  monthlyWorkUnitsDemand: number;
  utilizationPercentage: number;   // (Demand / Capacity) * 100
  capacityDeficitOrSurplus: number;// Capacity - Demand

  // Management Span & Health
  managementCount: number;         // Ranks 6, 7, 8
  subordinateCount: number;        // Ranks 1 to 5
  spanRatio: number;               // Subordinates per Manager
  spanHealth: "HEALTHY" | "OPTIMAL" | "STRAINED" | "CRITICAL_DEFICIT";
  spanPenalty: number;             // 0.0 to 0.50 dampener

  averageMorale: number;           // 0-100
  burnoutRiskLevel: "NONE" | "LOW" | "ELEVATED" | "CRITICAL";

  // Individual Level 3 Personnel
  keyPersonnelIds: EmployeeId[];
}

/** HQ Campus & Central Organizational Structure */
export interface CompanyHQState {
  hqLevel: number;                 // 1 (Small Workshop) to 5 (Global Campus)
  campusName: string;
  locationCity: string;
  locationCountry: string;

  // Capacities
  maxCorporateEmployees: number;   // Max staff physically accommodated at HQ
  currentCorporateStaff: number;   // Sum of Corporate Division staff
  maxSupportedDepartments: number; // Max departments HQ can effectively coordinate
  activeDepartmentsCount: number;

  // HQ Management & Organizational Quality Ratings (0-100)
  managementCapacityScore: number;
  rdCoordinationScore: number;     // Multiplier on cross-functional R&D speed
  communicationEfficiency: number; // Low inter-department latency
  administrativeProwess: number;   // Project approval & paperwork speed
  employeeAmenitiesScore: number;  // Canteens, gym, daycare -> morale boost

  // Overcapacity Analysis
  isOvercapacity: boolean;
  overcapacityPenaltyPct: number;  // 0% to 40% project delay drag
}

/** Level 1: Master Company Summary */
export interface CompanyWorkforceSummary {
  totalEmployees: number;
  totalKeyPersonnel: number;
  employeesByDivision: Record<DivisionType, number>;
  averageCompanySkill: number;
  overallMorale: number;
  overallTurnoverRatePct: number;
  managementSpanHealth: "EXCELLENT" | "BALANCED" | "STRAINED" | "HAZARDOUS";
  effectiveCompanyWorkforceUnits: number;
}
