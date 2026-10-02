/**
 * ═══════════════════════════════════════════════════════════════════════
 * FINANCIAL FORECAST ENGINE — 12-MONTH FORWARD PROJECTION MODEL
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 4A & Section 22:
 * Extrapolates 12 forward months of financial performance based on:
 * - Active vehicle production lines, estimated demand & price realization
 * - Committed commercial B2B component contracts
 * - Known fixed overhead & facilities baseline
 * - Scheduled loan repayments & debt maturities
 * - Committed R&D and Marketing discretionary budgets
 * - Projected liquid cash runway & solvency warnings
 */

import { MonthlyFinancialSnapshot } from "./companyLedgerEngine";
import { VehicleProductionLine } from "./vehicleProductionRegistry";
import { ActiveLoan } from "./loanFinancingEngine";

export interface ForecastMonth {
  month: number;
  year: number;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedProfit: number;
  projectedCashFlow: number;
  projectedClosingCash: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  keyRisks: string[];
  keyOpportunities: string[];
}

export interface ForecastInputParams {
  currentCash: number;
  currentYear: number;
  currentMonth: number;
  recentSnapshots: MonthlyFinancialSnapshot[];
  productionLines: VehicleProductionLine[];
  activeContractsCashflowTotal: number;
  activeLoans: ActiveLoan[];
  monthlyRDBudget: number;
  monthlyMarketingSpend: number;
}

export function generate12MonthFinancialForecast(inputs: ForecastInputParams): ForecastMonth[] {
  const {
    currentCash,
    currentYear,
    currentMonth,
    recentSnapshots,
    productionLines,
    activeContractsCashflowTotal,
    activeLoans,
    monthlyRDBudget,
    monthlyMarketingSpend,
  } = inputs;

  // Baseline trailing averages
  const lastSnapshot = recentSnapshots[recentSnapshots.length - 1];
  const trailingAvgRevenue =
    recentSnapshots.length > 0
      ? recentSnapshots.slice(-3).reduce((sum, s) => sum + s.revenue, 0) / Math.min(3, recentSnapshots.length)
      : 3000000;

  const trailingAvgExpenses =
    recentSnapshots.length > 0
      ? recentSnapshots.slice(-3).reduce((sum, s) => sum + s.operatingExpenses, 0) / Math.min(3, recentSnapshots.length)
      : 2200000;

  // Estimated baseline revenue from active production lines
  let activeVehicleMonthlyRevenue = 0;
  for (const line of productionLines.filter((l) => l.isActive)) {
    // Expected units sold ~ 85% of capacity bounded by base demand
    const expectedUnits = Math.min(line.monthlyCapacity, Math.round(line.baseMarketMonthlyDemand * 0.85));
    activeVehicleMonthlyRevenue += expectedUnits * line.listPrice * 0.90; // ~10% average dealer discount
  }

  const baselineMonthlyRevenue = Math.max(trailingAvgRevenue, activeVehicleMonthlyRevenue + activeContractsCashflowTotal);
  const activeDebtMonthlyPayment = activeLoans
    .filter((l) => l.status === "ACTIVE")
    .reduce((sum, l) => sum + l.monthlyPayment, 0);

  const forecast: ForecastMonth[] = [];
  let runningCash = currentCash;

  for (let i = 1; i <= 12; i++) {
    let projectedMonth = currentMonth + i;
    let projectedYear = currentYear;
    while (projectedMonth > 12) {
      projectedMonth -= 12;
      projectedYear += 1;
    }

    // Gradual seasonal variation and mild drift
    const seasonFactor = 1.0 + Math.sin((projectedMonth / 12) * Math.PI * 2) * 0.06;
    const rev = Math.round(baselineMonthlyRevenue * seasonFactor);

    // Expenses: baseline fixed/variable + R&D + marketing + debt service
    const exp = Math.round(trailingAvgExpenses * 0.95 + monthlyRDBudget * 0.25 + monthlyMarketingSpend * 0.5);
    const profit = rev - exp;

    // Cash flow: profit minus full debt payment and CapEx
    const cf = profit - activeDebtMonthlyPayment;
    runningCash = Math.max(0, runningCash + cf);

    // Confidence decreases further out
    const confidence: "HIGH" | "MEDIUM" | "LOW" =
      i <= 3 ? "HIGH" : i <= 7 ? "MEDIUM" : "LOW";

    const keyRisks: string[] = [];
    const keyOpportunities: string[] = [];

    if (runningCash < 15000000) {
      keyRisks.push("Cash reserves falling below ₹15M safety buffer");
    }
    if (activeDebtMonthlyPayment > 0 && i === 12) {
      keyOpportunities.push("Debt amortization reducing future interest overhead");
    }
    if (seasonFactor > 1.03) {
      keyOpportunities.push("Peak seasonal consumer purchasing window");
    }
    if (seasonFactor < 0.97) {
      keyRisks.push("Winter consumer sales slowdown");
    }

    forecast.push({
      month: projectedMonth,
      year: projectedYear,
      projectedRevenue: rev,
      projectedExpenses: exp,
      projectedProfit: profit,
      projectedCashFlow: cf,
      projectedClosingCash: runningCash,
      confidence,
      keyRisks,
      keyOpportunities,
    });
  }

  return forecast;
}
