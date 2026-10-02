/**
 * ═══════════════════════════════════════════════════════════════════════
 * ADVANCE ECONOMIC FORECAST & REVISION WARNING ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Phase 5: Advance Economic Forecast & Warning System.
 *
 * Strategic Stockpiling Trigger:
 * Automakers must plan procurement months in advance. To give the player
 * actionable strategic agency, this engine fires structured intelligence bulletins:
 *
 * - T-60 Days (1 May & 1 Nov):
 *   "Economic Intelligence Memo: Mid-Year / Year-End Price Revision Outlook"
 *   Early commodity futures guidance, expected union wage negotiations, oil market outlook.
 *
 * - T-30 Days (1 Jun & 1 Dec):
 *   "URGENT STRATEGIC NOTICE: Price Revision Effective in 30 Days"
 *   Suppliers announce upcoming spot price hikes. Concrete recommendations to fill
 *   warehouse inventory before the revision cuts into vehicle assembly margins.
 */

import {
  SemiAnnualPeriod,
  getSemiAnnualRecord,
  getNextSemiAnnualRecord,
  getDaysUntilNextRevision,
  calculateProjectedRevisionDelta,
} from "./historicalInflationData";
import { ProcessedMaterialType } from "../trade/tradeTypes";

export interface StockpileRecommendation {
  materialKey: ProcessedMaterialType;
  name: string;
  projectedHikePct: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  reason: string;
}

export interface EconomicForecastBulletin {
  id: string;
  year: number;
  month: number;
  day: number;
  type: "T_60_EARLY_OUTLOOK" | "T_30_URGENT_NOTICE";
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  targetRevisionDate: string;
  targetPeriod: SemiAnnualPeriod;
  targetYear: number;
  daysRemaining: number;
  headlineEvent: string;
  economicGuidance: string;
  generalCPIChangePct: number;
  stockpileRecommendations: StockpileRecommendation[];
  summaryMessage: string;
  read?: boolean;
}

// In-memory bulletin history
const FORECAST_HISTORY: EconomicForecastBulletin[] = [];

/**
 * Checks if a specific game date is an advance warning date (T-60 or T-30)
 */
export function isAdvanceWarningDate(month: number, day: number): boolean {
  if (day !== 1) return false;
  // T-60: 1 May (month 5) and 1 Nov (month 11)
  // T-30: 1 Jun (month 6) and 1 Dec (month 12)
  return month === 5 || month === 6 || month === 11 || month === 12;
}

/**
 * Generates an advance economic forecast bulletin for the given date, if applicable
 */
export function generateAdvanceForecastAlert(
  year: number,
  month: number,
  day: number = 1
): EconomicForecastBulletin | null {
  if (!isAdvanceWarningDate(month, day)) {
    return null;
  }

  const isT60 = month === 5 || month === 11;
  const isT30 = month === 6 || month === 12;
  const targetPeriod: SemiAnnualPeriod = month <= 6 ? "H2_JUL" : "H1_JAN";
  const targetYear = month <= 6 ? year : year + 1;
  const targetRevisionDate = targetPeriod === "H2_JUL" ? `1 Jul ${targetYear}` : `1 Jan ${targetYear}`;

  const currentPeriod: SemiAnnualPeriod = month < 7 ? "H1_JAN" : "H2_JUL";
  const currentRecord = getSemiAnnualRecord(year, currentPeriod);
  const nextRecord = getNextSemiAnnualRecord(year, currentPeriod);

  const countdown = getDaysUntilNextRevision(year, month, day);

  const cpiDelta = calculateProjectedRevisionDelta(year, currentPeriod, "GENERAL_CPI");
  const metalsDelta = calculateProjectedRevisionDelta(year, currentPeriod, "METALS_INDEX");
  const energyDelta = calculateProjectedRevisionDelta(year, currentPeriod, "ENERGY_PETROCHEM_INDEX");
  const laborDelta = calculateProjectedRevisionDelta(year, currentPeriod, "LABOR_WAGE_INDEX");

  // Determine stockpile recommendations
  const stockpileRecommendations: StockpileRecommendation[] = [];

  if (energyDelta.deltaPct >= 6.0) {
    const priority = energyDelta.deltaPct >= 18.0 ? "CRITICAL" : "HIGH";
    stockpileRecommendations.push({
      materialKey: "VULCANIZED_RUBBER",
      name: "Synthetic & Natural Vulcanized Rubber",
      projectedHikePct: energyDelta.deltaPct,
      priority,
      reason: `Crude oil and petrochemical futures projecting +${energyDelta.deltaPct}% spike on ${targetRevisionDate}.`,
    });
    stockpileRecommendations.push({
      materialKey: "ENGINEERING_POLYMERS",
      name: "Engineering Polymers & Resins",
      projectedHikePct: Number((energyDelta.deltaPct * 0.9).toFixed(1)),
      priority,
      reason: "Petrochemical feedstock costs surging; polymer moulders planning contract revisions.",
    });
  }

  if (metalsDelta.deltaPct >= 5.0) {
    const priority = metalsDelta.deltaPct >= 15.0 ? "CRITICAL" : "HIGH";
    stockpileRecommendations.push({
      materialKey: "BASIC_CARBON_STEEL",
      name: "Deep-Drawing Carbon Sheet Steel",
      projectedHikePct: metalsDelta.deltaPct,
      priority,
      reason: `Global blast furnace mills projecting +${metalsDelta.deltaPct}% increase next cycle.`,
    });
    stockpileRecommendations.push({
      materialKey: "DUCTILE_CAST_IRON",
      name: "Ductile Cast Iron",
      projectedHikePct: Number((metalsDelta.deltaPct * 0.85).toFixed(1)),
      priority: "MEDIUM",
      reason: "Coking coal and scrap metal indices rising.",
    });
  }

  // Determine bulletin severity
  let severity: EconomicForecastBulletin["severity"] = "INFO";
  if (stockpileRecommendations.some((r) => r.priority === "CRITICAL") || energyDelta.deltaPct >= 20) {
    severity = "CRITICAL";
  } else if (stockpileRecommendations.length > 0 || cpiDelta.deltaPct >= 6.0) {
    severity = "WARNING";
  }

  const type = isT60 ? "T_60_EARLY_OUTLOOK" : "T_30_URGENT_NOTICE";
  const title = isT60
    ? `Economic Intelligence Memo: ${targetRevisionDate} Revision Outlook`
    : `URGENT NOTICE: Price Revision in ${countdown.daysRemaining} Days (${targetRevisionDate})`;

  let summaryMessage = "";
  if (isT60) {
    summaryMessage = `Early economic forecasting suggests a general inflation drift of ~${cpiDelta.deltaPct > 0 ? "+" : ""}${cpiDelta.deltaPct}%. ${nextRecord.headlineEvent}. Review factory inventory capacity and storage policies.`;
  } else {
    summaryMessage = `Industrial suppliers will officially update pricing on ${targetRevisionDate}. ${
      stockpileRecommendations.length > 0
        ? `Stockpiling ${stockpileRecommendations.map((r) => r.name).join(", ")} prior to revision is strongly recommended to protect vehicle profit margins.`
        : "Commodity spot markets are projected stable. Normal buffer inventory is sufficient."
    }`;
  }

  const bulletin: EconomicForecastBulletin = {
    id: `FCST_${year}_${month}_${day}`,
    year,
    month,
    day,
    type,
    severity,
    title,
    targetRevisionDate,
    targetPeriod,
    targetYear,
    daysRemaining: countdown.daysRemaining,
    headlineEvent: nextRecord.headlineEvent,
    economicGuidance: nextRecord.economicGuidance,
    generalCPIChangePct: cpiDelta.deltaPct,
    stockpileRecommendations,
    summaryMessage,
    read: false,
  };

  recordForecastBulletin(bulletin);
  return bulletin;
}

/** Record a generated bulletin into history */
export function recordForecastBulletin(bulletin: EconomicForecastBulletin): void {
  const existingIdx = FORECAST_HISTORY.findIndex((b) => b.id === bulletin.id);
  if (existingIdx >= 0) {
    FORECAST_HISTORY[existingIdx] = bulletin;
  } else {
    FORECAST_HISTORY.unshift(bulletin); // newest first
  }
}

/** Get all forecast bulletins in history */
export function getForecastHistory(): EconomicForecastBulletin[] {
  return [...FORECAST_HISTORY];
}

/** Mark a bulletin as read */
export function markForecastAsRead(id: string): void {
  const item = FORECAST_HISTORY.find((b) => b.id === id);
  if (item) item.read = true;
}

/** Reset bulletin history (for tests and new games) */
export function resetForecastHistory(): void {
  FORECAST_HISTORY.length = 0;
}
