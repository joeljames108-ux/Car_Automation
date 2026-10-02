/**
 * ═══════════════════════════════════════════════════════════════════════════
 * WORKFORCE SALARY HIERARCHY & COMPENSATION ENGINE (1970 – 2026)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Implements Phase 6 of the Historical Economic Database:
 * Provides comprehensive employee salary grids across 9 occupational ranks
 * and 8 automotive departments for all 114 semi-annual periods.
 *
 * Grounded in:
 * - FRED AHEMAN baseline production worker earnings (Phase 1)
 * - BLS Occupational Employment and Wage Statistics (OES)
 * - SAE International Automotive Engineering Compensation Surveys
 * - UAW Master Agreements & Automotive Executive Proxy Compensation Disclosures
 *
 * Company Scale & Employer Reputation Mechanics:
 * - Obscurity Premium: Startups with reputation < 30 must pay +10% to +15%
 *   to attract experienced automotive talent away from established giants.
 * - Prestige Attraction: Renowned manufacturers (Reputation > 85) enjoy
 *   a 10% to 20% discount as engineers compete for resume prestige.
 * - Conglomerate Scale Multipliers: Company size tiers (Boutique, Tier-2 OEM,
 *   Global Conglomerate) affect management overhead and specialization.
 */

import {
  EconomicPeriodId,
  SemiAnnualRevision,
  OccupationalRank,
  DataProvenance,
  HistoricalDatum,
} from "./types";
import { ECONOMIC_PERIODS, getPeriod } from "./economicCalendar";
import {
  getWage,
  OCCUPATIONAL_MULTIPLIERS,
  DEPARTMENT_WAGE_MULTIPLIERS,
  STANDARD_MONTHLY_HOURS,
  STANDARD_ANNUAL_HOURS,
} from "./wageBackbone";

export type CompanyScaleTier =
  | "STARTUP_BOUTIQUE"       // < 100 employees, artisanal / prototype
  | "INDEPENDENT_OEM"        // 100 - 2,500 employees, volume specialist
  | "MAJOR_AUTOMAKER"        // 2,500 - 25,000 employees, national footprint
  | "GLOBAL_CONGLOMERATE";   // > 25,000 employees, multinational assembly

export type DepartmentId =
  | "ENGINEERING"
  | "MANUFACTURING"
  | "RD"
  | "MOTORSPORT"
  | "DESIGN"
  | "MANAGEMENT"
  | "SALES"
  | "SERVICE";

export interface DepartmentSpec {
  id: DepartmentId;
  name: string;
  baseMultiplier: number;
  description: string;
}

export const AUTOMOTIVE_DEPARTMENTS: Record<DepartmentId, DepartmentSpec> = {
  ENGINEERING: {
    id: "ENGINEERING",
    name: "Chassis & Powertrain Engineering",
    baseMultiplier: 1.28,
    description: "CAD surface modeling, structural FEA stress analysis, suspension kinematics, calibration.",
  },
  MANUFACTURING: {
    id: "MANUFACTURING",
    name: "Assembly Line & Tooling Operations",
    baseMultiplier: 1.00,
    description: "Stamping press operators, body-in-white welders, assembly line mechanics, paint techs.",
  },
  RD: {
    id: "RD",
    name: "Advanced Research & Development",
    baseMultiplier: 1.40,
    description: "Battery electrochemistry, wind-tunnel aerodynamics, powertrain dyno testing, AI driving.",
  },
  MOTORSPORT: {
    id: "MOTORSPORT",
    name: "Competition & Trackside Motorsport",
    baseMultiplier: 1.35,
    description: "Trackside race mechanics, telemetry data analysts, aerodynamicists, pit crew chiefs.",
  },
  DESIGN: {
    id: "DESIGN",
    name: "Styling & Clay Modeling Studio",
    baseMultiplier: 1.22,
    description: "Exterior and interior stylists, 1:1 scale clay modelers, CMF (Color, Material, Finish).",
  },
  MANAGEMENT: {
    id: "MANAGEMENT",
    name: "Executive Leadership & Plant Control",
    baseMultiplier: 1.65,
    description: "Plant managers, finance controllers, legal compliance officers, executive directors.",
  },
  SALES: {
    id: "SALES",
    name: "Commercial & Dealership Network",
    baseMultiplier: 1.10,
    description: "Dealer franchise network managers, fleet contract negotiators, export logistics.",
  },
  SERVICE: {
    id: "SERVICE",
    name: "Quality Assurance & Field Service",
    baseMultiplier: 1.05,
    description: "Master warranty diagnosticians, pre-delivery inspection, recall campaign managers.",
  },
};

export interface EmployeeRoleCompensation {
  rank: OccupationalRank;
  rankTitle: string;
  department: DepartmentId;
  hourlyWageUSD: number;
  monthlySalaryUSD: number;
  annualSalaryUSD: number;
  provenance: DataProvenance;
}

export interface PeriodSalaryGridRecord {
  periodId: EconomicPeriodId;
  year: number;
  revision: SemiAnnualRevision;
  displayDate: string;
  cycleIndex: number;
  baseProductionHourlyUSD: number;
  roles: Record<string, EmployeeRoleCompensation>;
}

/**
 * Computes exact adjusted salary taking into account company scale and employer reputation
 */
export function getAdjustedWorkforceSalary(
  rank: OccupationalRank,
  department: DepartmentId,
  year: number,
  month: number = 1,
  employerReputation: number = 50,
  scaleTier: CompanyScaleTier = "INDEPENDENT_OEM"
): {
  baseMonthlyUSD: number;
  adjustedMonthlyUSD: number;
  hourlyRateUSD: number;
  reputationModifierPct: number;
  scaleModifierPct: number;
  rankTitle: string;
  departmentName: string;
  provenance: DataProvenance;
} {
  const wageRec = getWage(year, month);
  const baseRankMonthly = wageRec.occupationalSalariesMonthlyUSD[rank].value;
  const deptMult = AUTOMOTIVE_DEPARTMENTS[department].baseMultiplier;

  const baseMonthlyUSD = Number((baseRankMonthly * deptMult).toFixed(2));

  // Reputation Modifier (-20% to +15%)
  // Below 30 rep: Obscurity risk premium (+5% to +15%)
  // Above 70 rep: Prestige attraction discount (-5% to -20%)
  let repModPct = 0;
  if (employerReputation < 30) {
    repModPct = Number((((30 - employerReputation) / 30) * 15).toFixed(1));
  } else if (employerReputation > 70) {
    repModPct = -Number((((employerReputation - 70) / 30) * 18).toFixed(1));
  }

  // Scale Tier Modifier (Boutique = 0%, Global Conglomerate = +12% for management/engineering)
  let scaleModPct = 0;
  if (scaleTier === "GLOBAL_CONGLOMERATE") {
    scaleModPct = rank.includes("ENGINEER") || rank === "CHIEF_ENGINEER" ? 12 : 5;
  } else if (scaleTier === "MAJOR_AUTOMAKER") {
    scaleModPct = rank.includes("ENGINEER") ? 6 : 2;
  }

  const totalMod = 1.0 + (repModPct + scaleModPct) / 100;
  const adjustedMonthlyUSD = Math.round(baseMonthlyUSD * totalMod);
  const hourlyRateUSD = Number((adjustedMonthlyUSD / STANDARD_MONTHLY_HOURS).toFixed(2));

  const observationDate = month < 7 ? `${year}-01-01` : `${year}-07-01`;

  const narrative = repModPct > 0
    ? `including ${repModPct}% obscurity risk premium`
    : repModPct < 0
    ? `including ${Math.abs(repModPct)}% prestige attraction discount`
    : "standard benchmark";

  const provenance: DataProvenance = {
    source: "BLS OES & Automotive Compensation Architecture Model",
    sourceSeriesId: `COMP_${rank}_${department}`,
    dataType: "TYPE_C_DERIVED",
    unit: "USD/month",
    dateObserved: observationDate,
    methodology: `Base $${baseMonthlyUSD}/mo adjusted for employer reputation (${employerReputation}, ${narrative}) and scale (${scaleTier}, mod ${scaleModPct}%) = $${adjustedMonthlyUSD}/mo ($${hourlyRateUSD}/hr).`,
  };

  return {
    baseMonthlyUSD,
    adjustedMonthlyUSD,
    hourlyRateUSD,
    reputationModifierPct: repModPct,
    scaleModifierPct: scaleModPct,
    rankTitle: OCCUPATIONAL_MULTIPLIERS[rank].title,
    departmentName: AUTOMOTIVE_DEPARTMENTS[department].name,
    provenance,
  };
}

/**
 * Builds the comprehensive salary grid records for all 114 periods
 */
function buildSalaryGridRecords(): Record<EconomicPeriodId, PeriodSalaryGridRecord> {
  const records = {} as Record<EconomicPeriodId, PeriodSalaryGridRecord>;

  const ranks: OccupationalRank[] = [
    "PRODUCTION_WORKER",
    "MACHINE_OPERATOR",
    "SKILLED_TECHNICIAN",
    "SENIOR_TECHNICIAN",
    "JUNIOR_ENGINEER",
    "ENGINEER",
    "SENIOR_ENGINEER",
    "PRINCIPAL_ENGINEER",
    "CHIEF_ENGINEER",
  ];

  const depts = Object.keys(AUTOMOTIVE_DEPARTMENTS) as DepartmentId[];

  for (let i = 0; i < ECONOMIC_PERIODS.length; i++) {
    const period = ECONOMIC_PERIODS[i];
    const wageRec = getWage(period.year, period.revision === "H1_JAN" ? 1 : 7);
    const observationDate = period.revision === "H1_JAN" ? `${period.year}-01-01` : `${period.year}-07-01`;

    const roles = {} as Record<string, EmployeeRoleCompensation>;

    for (const d of depts) {
      const deptSpec = AUTOMOTIVE_DEPARTMENTS[d];

      for (const r of ranks) {
        const key = `${d}_${r}`;
        const baseRankMonthly = wageRec.occupationalSalariesMonthlyUSD[r].value;
        const monthlySalaryUSD = Number((baseRankMonthly * deptSpec.baseMultiplier).toFixed(2));
        const hourlyWageUSD = Number((monthlySalaryUSD / STANDARD_MONTHLY_HOURS).toFixed(2));
        const annualSalaryUSD = Number((hourlyWageUSD * STANDARD_ANNUAL_HOURS).toFixed(2));

        const provenance: DataProvenance = {
          source: "FRED AHEMAN + BLS OES Occupational Model",
          sourceSeriesId: `SALARY_GRID_${key}`,
          dataType: "TYPE_C_DERIVED",
          unit: "USD/month",
          dateObserved: observationDate,
          methodology: `Role monthly $${baseRankMonthly} * Department multiplier ${deptSpec.baseMultiplier}x (${deptSpec.name}) = $${monthlySalaryUSD}/mo ($${hourlyWageUSD}/hr).`,
        };

        roles[key] = {
          rank: r,
          rankTitle: OCCUPATIONAL_MULTIPLIERS[r].title,
          department: d,
          hourlyWageUSD,
          monthlySalaryUSD,
          annualSalaryUSD,
          provenance,
        };
      }
    }

    records[period.periodId] = {
      periodId: period.periodId,
      year: period.year,
      revision: period.revision,
      displayDate: period.displayDate,
      cycleIndex: period.cycleIndex,
      baseProductionHourlyUSD: wageRec.productionWorkerHourlyUSD.value,
      roles,
    };
  }

  return records;
}

export const SALARY_GRID_RECORDS: Readonly<Record<EconomicPeriodId, PeriodSalaryGridRecord>> =
  Object.freeze(buildSalaryGridRecords());

/**
 * Returns full salary grid record for any calendar date
 */
export function getSalaryGridRecord(year: number, month: number = 1): PeriodSalaryGridRecord {
  const period = getPeriod(year, month);
  return SALARY_GRID_RECORDS[period.periodId] ?? SALARY_GRID_RECORDS["1970-H1"];
}

/**
 * Returns compensation details for a specific department and rank at any date
 */
export function getRoleCompensation(
  department: DepartmentId,
  rank: OccupationalRank,
  year: number,
  month: number = 1
): EmployeeRoleCompensation {
  const grid = getSalaryGridRecord(year, month);
  const key = `${department}_${rank}`;
  return grid.roles[key];
}
