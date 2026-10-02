/**
 * ═══════════════════════════════════════════════════════════════════════
 * MONTHLY EVENT GENERATOR — CONTEXTUAL FINANCIAL EVENT NOTIFICATIONS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 4C & Section 23:
 * Generates rich, contextual in-game events after each monthly tick:
 * - Large commercial partner payment settlements
 * - Global raw material price shocks
 * - Facility equipment maintenance alarms
 * - Warranty defect spike alerts
 * - R&D engineering milestone completions
 * - Commercial contract expiration warnings
 * - Debt maturity announcements
 * - Cash runway safety warnings
 */

export type MonthlyFinancialEventType =
  | "PAYMENT_RECEIVED"
  | "COMMODITY_PRICE_CHANGE"
  | "MAINTENANCE_REQUIRED"
  | "WARRANTY_SPIKE"
  | "RD_MILESTONE"
  | "CONTRACT_EXPIRING"
  | "LOAN_MATURITY"
  | "DANGER_ALERT"
  | "MARKET_OPPORTUNITY";

export interface MonthlyFinancialEvent {
  id: string;
  type: MonthlyFinancialEventType;
  title: string;
  description: string;
  financialImpact?: number; // positive or negative ₹
  severity: "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";
  timestamp: number;
}

export interface MonthlyEventContext {
  month: number;
  year: number;
  revenue: number;
  operatingExpenses: number;
  operatingProfit: number;
  closingCash: number;
  monthsOfRunway: number;
  warrantyClaimsPaid: number;
  completedRDProjectNames: string[];
  maturedLoanNames: string[];
  expiringContractTitles: string[];
  significantCommodityChange?: { name: string; pctChange: number };
}

export function generateMonthlyFinancialEvents(context: MonthlyEventContext): MonthlyFinancialEvent[] {
  const events: MonthlyFinancialEvent[] = [];
  const now = Date.now();

  // 1. Payment Received / Revenue highlight
  if (context.revenue > 10000000) {
    events.push({
      id: `ev_rev_${context.year}_${context.month}_${Math.random().toString(36).substring(2, 6)}`,
      type: "PAYMENT_RECEIVED",
      title: "Commercial Revenue Milestone",
      description: `Commercial operations collected ₹${(context.revenue / 1000000).toFixed(1)}M across vehicle sales & supply contracts.`,
      financialImpact: context.revenue,
      severity: "SUCCESS",
      timestamp: now,
    });
  }

  // 2. Danger / Runway alert
  if (context.monthsOfRunway < 3) {
    events.push({
      id: `ev_runway_${context.year}_${context.month}`,
      type: "DANGER_ALERT",
      title: "Critical Cash Runway Alert",
      description: `Liquid reserves provide only ${context.monthsOfRunway.toFixed(1)} months of operational burn. Immediate cost control or debt financing advised.`,
      severity: "CRITICAL",
      timestamp: now,
    });
  } else if (context.monthsOfRunway < 6) {
    events.push({
      id: `ev_runway_${context.year}_${context.month}`,
      type: "DANGER_ALERT",
      title: "Low Cash Runway Warning",
      description: `Company cash reserves provide ${context.monthsOfRunway.toFixed(1)} months of runway.`,
      severity: "WARNING",
      timestamp: now,
    });
  }

  // 3. Warranty Spike
  if (context.warrantyClaimsPaid > 300000) {
    events.push({
      id: `ev_warr_${context.year}_${context.month}`,
      type: "WARRANTY_SPIKE",
      title: "Fleet Warranty Claims Escalation",
      description: `Customer warranty claims rose to ₹${Math.round(context.warrantyClaimsPaid / 1000)}k this month. Review component quality and supplier reliability.`,
      financialImpact: -context.warrantyClaimsPaid,
      severity: "WARNING",
      timestamp: now,
    });
  }

  // 4. R&D Milestones
  for (const proj of context.completedRDProjectNames) {
    events.push({
      id: `ev_rd_${context.year}_${context.month}_${Math.random().toString(36).substring(2, 6)}`,
      type: "RD_MILESTONE",
      title: "R&D Program Milestone Achieved",
      description: `Engineering program "${proj}" successfully completed validation and is ready for production tooling.`,
      severity: "SUCCESS",
      timestamp: now,
    });
  }

  // 5. Loan Maturities
  for (const loan of context.maturedLoanNames) {
    events.push({
      id: `ev_loan_${context.year}_${context.month}_${Math.random().toString(36).substring(2, 6)}`,
      type: "LOAN_MATURITY",
      title: "Debt Facility Fully Retired",
      description: `Credit agreement "${loan}" has been fully amortized and discharged. Monthly debt service reduced.`,
      severity: "SUCCESS",
      timestamp: now,
    });
  }

  // 6. Expiring Contracts
  for (const contract of context.expiringContractTitles) {
    events.push({
      id: `ev_ctr_${context.year}_${context.month}_${Math.random().toString(36).substring(2, 6)}`,
      type: "CONTRACT_EXPIRING",
      title: "Supply Agreement Expiration Pending",
      description: `B2B agreement "${contract}" expires in 60 days. Prepare contract extension or tender re-bid.`,
      severity: "INFO",
      timestamp: now,
    });
  }

  // 7. Commodity Price Change
  if (context.significantCommodityChange && Math.abs(context.significantCommodityChange.pctChange) >= 4) {
    const isUp = context.significantCommodityChange.pctChange > 0;
    events.push({
      id: `ev_comm_${context.year}_${context.month}`,
      type: "COMMODITY_PRICE_CHANGE",
      title: `Global ${context.significantCommodityChange.name} Market Shift`,
      description: `${context.significantCommodityChange.name} market spot prices moved by ${isUp ? "+" : ""}${context.significantCommodityChange.pctChange}% this cycle.`,
      severity: isUp ? "WARNING" : "INFO",
      timestamp: now,
    });
  }

  return events;
}
