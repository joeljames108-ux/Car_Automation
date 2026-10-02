/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ECONOMIC CALENDAR ENGINE — 114 SEMI-ANNUAL PERIODS (1970 – 2026)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Implements the 114 semi-annual economic revision periods:
 * 57 calendar years (1970 through 2026) × 2 biannual revisions (1 Jan & 1 Jul).
 *
 * - 1970-H1: 1 January 1970 – 30 June 1970 (Founding baseline)
 * - 1970-H2: 1 July 1970 – 31 December 1970
 * ...
 * - 2026-H1: 1 January 2026 – 30 June 2026
 * - 2026-H2: 1 July 2026 – 31 December 2026
 *
 * Provides deterministic calendar indexing, period lookups, revision alerts,
 * and time-to-revision countdowns.
 */

import {
  EconomicPeriod,
  EconomicPeriodId,
  SemiAnnualRevision,
} from "./types";

export const START_YEAR = 1970;
export const END_YEAR = 2026;
export const TOTAL_YEARS = END_YEAR - START_YEAR + 1; // 57 years
export const TOTAL_PERIODS = TOTAL_YEARS * 2;         // 114 periods

/**
 * Builds the canonical list of all 114 semi-annual economic periods
 */
function generateAllEconomicPeriods(): EconomicPeriod[] {
  const periods: EconomicPeriod[] = [];
  let cycleIndex = 0;

  for (let yr = START_YEAR; yr <= END_YEAR; yr++) {
    // H1: 1 Jan – 30 Jun
    const p1: EconomicPeriod = {
      periodId: `${yr}-H1` as EconomicPeriodId,
      year: yr,
      revision: "H1_JAN",
      cycleIndex,
      displayDate: `1 Jan ${yr}`,
      startDate: `${yr}-01-01`,
      endDate: `${yr}-06-30`,
    };
    periods.push(p1);
    cycleIndex++;

    // H2: 1 Jul – 31 Dec
    const p2: EconomicPeriod = {
      periodId: `${yr}-H2` as EconomicPeriodId,
      year: yr,
      revision: "H2_JUL",
      cycleIndex,
      displayDate: `1 Jul ${yr}`,
      startDate: `${yr}-07-01`,
      endDate: `${yr}-12-31`,
    };
    periods.push(p2);
    cycleIndex++;
  }

  return periods;
}

export const ECONOMIC_PERIODS: readonly EconomicPeriod[] = Object.freeze(generateAllEconomicPeriods());

export const PERIOD_MAP: Readonly<Record<EconomicPeriodId, EconomicPeriod>> = Object.freeze(
  ECONOMIC_PERIODS.reduce((acc, p) => {
    acc[p.periodId] = p;
    return acc;
  }, {} as Record<EconomicPeriodId, EconomicPeriod>)
);

/**
 * Returns the economic period corresponding to any calendar year and month (1-12)
 */
export function getPeriod(year: number, month: number): EconomicPeriod {
  const clampedYear = Math.max(START_YEAR, Math.min(END_YEAR, year));
  const half: "H1" | "H2" = month <= 6 ? "H1" : "H2";
  const periodId = `${clampedYear}-${half}` as EconomicPeriodId;
  return PERIOD_MAP[periodId] ?? ECONOMIC_PERIODS[0];
}

/**
 * Direct lookup by period identifier (e.g. "1974-H1")
 */
export function getPeriodById(periodId: EconomicPeriodId): EconomicPeriod | undefined {
  return PERIOD_MAP[periodId];
}

/**
 * Lookup by zero-based cycle index (0 = 1970-H1, 113 = 2026-H2)
 */
export function getPeriodByIndex(index: number): EconomicPeriod | undefined {
  if (index < 0 || index >= ECONOMIC_PERIODS.length) return undefined;
  return ECONOMIC_PERIODS[index];
}

/**
 * Returns the next consecutive period or null if at the terminal 2026-H2
 */
export function getNextPeriod(current: EconomicPeriod): EconomicPeriod | null {
  if (current.cycleIndex >= ECONOMIC_PERIODS.length - 1) return null;
  return ECONOMIC_PERIODS[current.cycleIndex + 1];
}

/**
 * Returns the previous period or null if at initial 1970-H1
 */
export function getPreviousPeriod(current: EconomicPeriod): EconomicPeriod | null {
  if (current.cycleIndex <= 0) return null;
  return ECONOMIC_PERIODS[current.cycleIndex - 1];
}

/**
 * Checks whether the given calendar date is an exact semi-annual revision day
 * (1st January or 1st July)
 */
export function isRevisionDate(
  year: number,
  month: number,
  day: number
): { isRevision: boolean; revision?: SemiAnnualRevision; period?: EconomicPeriod } {
  if (day !== 1) return { isRevision: false };
  if (month === 1) {
    const period = getPeriod(year, 1);
    return { isRevision: true, revision: "H1_JAN", period };
  }
  if (month === 7) {
    const period = getPeriod(year, 7);
    return { isRevision: true, revision: "H2_JUL", period };
  }
  return { isRevision: false };
}

/**
 * Computes exact days remaining until the next semi-annual price revision
 */
export function getRevisionCountdown(
  year: number,
  month: number,
  day: number
): {
  daysRemaining: number;
  nextRevision: SemiAnnualRevision;
  nextRevisionDateStr: string;
  nextPeriod: EconomicPeriod | null;
  warningStatus: "CALM" | "APPROACHING_T60" | "CRITICAL_T30" | "REVISION_TODAY";
} {
  const currentDate = new Date(Date.UTC(year, month - 1, day));

  let targetDate: Date;
  let nextRevision: SemiAnnualRevision;
  let targetYear: number;
  let targetHalf: "H1" | "H2";

  if (month < 7 || (month === 7 && day === 1)) {
    if (month === 1 && day === 1) {
      // It's today!
      const currP = getPeriod(year, month);
      return {
        daysRemaining: 0,
        nextRevision: "H1_JAN",
        nextRevisionDateStr: `1 Jan ${year}`,
        nextPeriod: currP,
        warningStatus: "REVISION_TODAY",
      };
    }
    // Next revision is 1 July of current year
    targetDate = new Date(Date.UTC(year, 6, 1));
    nextRevision = "H2_JUL";
    targetYear = year;
    targetHalf = "H2";
  } else {
    // Next revision is 1 January of following year
    targetDate = new Date(Date.UTC(year + 1, 0, 1));
    nextRevision = "H1_JAN";
    targetYear = year + 1;
    targetHalf = "H1";
  }

  const diffMs = targetDate.getTime() - currentDate.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const nextPeriodId = `${targetYear}-${targetHalf}` as EconomicPeriodId;
  const nextPeriod = PERIOD_MAP[nextPeriodId] ?? null;

  let warningStatus: "CALM" | "APPROACHING_T60" | "CRITICAL_T30" | "REVISION_TODAY" = "CALM";
  if (daysRemaining === 0) {
    warningStatus = "REVISION_TODAY";
  } else if (daysRemaining <= 30) {
    warningStatus = "CRITICAL_T30";
  } else if (daysRemaining <= 60) {
    warningStatus = "APPROACHING_T60";
  }

  const nextRevisionDateStr = nextRevision === "H1_JAN" ? `1 Jan ${targetYear}` : `1 Jul ${targetYear}`;

  return {
    daysRemaining,
    nextRevision,
    nextRevisionDateStr,
    nextPeriod,
    warningStatus,
  };
}
