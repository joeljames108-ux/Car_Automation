/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HISTORICAL ECONOMIC DATA TYPES & PROVENANCE STANDARD (1970 – 2026)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Core architectural types for the 114 semi-annual economic periods
 * spanning 57 years (1970-H1 through 2026-H2) in nominal USD.
 *
 * Mandatory Three-Tier Provenance:
 * - TYPE_A_DIRECT:  Actual historical price observation (BLS, FRED, World Bank, EIA)
 * - TYPE_B_INDEX:   Historical industrial/wage/producer index applied to game specification
 * - TYPE_C_DERIVED: Derived game economics anchored to historical backbone with explicit multiplier models
 */

/**
 * Three-tier data classification guaranteeing no fake "historical facts"
 */
export type DataSourceType =
  | "TYPE_A_DIRECT"   // Direct historical quotation (exact commodity, wage series, or CPI)
  | "TYPE_B_INDEX"    // Derived from authentic historical index (PPI/LME/EIA + conversion)
  | "TYPE_C_DERIVED"; // Derived game economics with explicit engineering/multiplier models

/**
 * Mandatory metadata audit schema for every single economic datum
 */
export interface DataProvenance {
  /** Primary authority (e.g. "U.S. Bureau of Labor Statistics", "World Bank", "FRED") */
  source: string;
  /** Exact historical series identifier (e.g. "AHEMAN", "CUUR0000SA0", "WPU1411") */
  sourceSeriesId: string;
  /** Classification: Type A Direct, Type B Index, Type C Derived */
  dataType: DataSourceType;
  /** Physical currency or index unit (e.g. "USD/hour", "USD/tonne", "USD/barrel") */
  unit: string;
  /** Observation date or effective revision period */
  dateObserved: string;
  /** Full methodology narrative describing how the value was captured or calculated */
  methodology: string;
}

/**
 * Generic wrapper coupling any numeric or structured economic value to its audit provenance
 */
export interface HistoricalDatum<T = number> {
  value: T;
  provenance: DataProvenance;
}

/**
 * Semi-annual calendar revision cycle
 */
export type SemiAnnualRevision = "H1_JAN" | "H2_JUL";

/**
 * Format string identifier for each period: e.g. "1970-H1", "1970-H2", ... "2026-H2"
 */
export type EconomicPeriodId = `${number}-H1` | `${number}-H2`;

/**
 * Calendar definition for each of the 114 semi-annual economic periods
 */
export interface EconomicPeriod {
  /** Format: "1970-H1" or "1970-H2" */
  periodId: EconomicPeriodId;
  /** Calendar year (1970 - 2026) */
  year: number;
  /** Revision cycle code ("H1_JAN" for 1 January, "H2_JUL" for 1 July) */
  revision: SemiAnnualRevision;
  /** Sequential period index (0 for 1970-H1 up to 113 for 2026-H2) */
  cycleIndex: number;
  /** Human-readable display date (e.g. "1 Jan 1970", "1 Jul 1970") */
  displayDate: string;
  /** ISO start date ("YYYY-01-01" or "YYYY-07-01") */
  startDate: string;
  /** ISO end date ("YYYY-06-30" or "YYYY-12-31") */
  endDate: string;
}

/**
 * Occupational hierarchy levels for factory and engineering staff
 */
export type OccupationalRank =
  | "PRODUCTION_WORKER"
  | "MACHINE_OPERATOR"
  | "SKILLED_TECHNICIAN"
  | "SENIOR_TECHNICIAN"
  | "JUNIOR_ENGINEER"
  | "ENGINEER"
  | "SENIOR_ENGINEER"
  | "PRINCIPAL_ENGINEER"
  | "CHIEF_ENGINEER";

/**
 * Comprehensive CPI record for an economic period
 */
export interface CPIRecord {
  periodId: EconomicPeriodId;
  year: number;
  revision: SemiAnnualRevision;
  displayDate: string;
  cycleIndex: number;

  /** Actual BLS Consumer Price Index (All Urban Consumers, base 1982-84=100) */
  cpiU: HistoricalDatum<number>;

  /** Normalized CPI index where 1970-H1 = 1.000 */
  cpiNormalized1970: HistoricalDatum<number>;

  /** Year-over-Year (YoY) consumer inflation rate in % */
  annualInflationPct: HistoricalDatum<number>;

  /** 6-month revision-to-revision inflation rate in % */
  halfYearInflationPct: HistoricalDatum<number>;

  /** Context of significant economic/monetary events in this half-year */
  headlineContext: string;

  /** Historical monetary/macroeconomic regime description */
  monetaryRegime: string;
}

/**
 * Comprehensive wage record for an economic period
 */
export interface WageRecord {
  periodId: EconomicPeriodId;
  year: number;
  revision: SemiAnnualRevision;
  displayDate: string;
  cycleIndex: number;

  /** Actual FRED AHEMAN hourly earnings for production autoworkers ($/hr) */
  productionWorkerHourlyUSD: HistoricalDatum<number>;

  /** Standard monthly earnings for base production worker (173.33 standard working hours) */
  productionWorkerMonthlyUSD: HistoricalDatum<number>;

  /** Annualized full-time gross earnings (2,080 hours) */
  productionWorkerAnnualUSD: HistoricalDatum<number>;

  /** 6-month half-on-half wage growth rate % */
  halfYearWageGrowthPct: HistoricalDatum<number>;

  /** Year-on-year wage growth rate % */
  annualWageGrowthPct: HistoricalDatum<number>;

  /** Full salary schedule across all 9 occupational ranks (monthly USD) */
  occupationalSalariesMonthlyUSD: Record<OccupationalRank, HistoricalDatum<number>>;

  /** Full salary schedule across all 9 occupational ranks (hourly USD) */
  occupationalWagesHourlyUSD: Record<OccupationalRank, HistoricalDatum<number>>;

  /** Department specialization multipliers */
  departmentMultipliers: Record<string, HistoricalDatum<number>>;

  /** Historical union/labor context */
  headlineContext: string;
}
