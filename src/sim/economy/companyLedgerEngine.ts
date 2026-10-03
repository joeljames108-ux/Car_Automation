/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMPANY LEDGER ENGINE — DOUBLE-ENTRY BOOKKEEPING & CASHFLOW LEDGER
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Core accounting foundation of the automotive corporation.
 * Every ₹ moving through the simulation is recorded as an immutable
 * LedgerTransaction and summarized into periodic financial snapshots.
 */

export type RevenueCategory =
  | "VEHICLE_SALES"
  | "COMPONENT_SALES"
  | "TECH_LICENSING"
  | "CONTRACT_INCOME"
  | "MOTORSPORT_INCOME"
  | "AFTER_SALES";

export type FixedExpenseCategory =
  | "EMPLOYEE_SALARIES"
  | "HQ_MAINTENANCE"
  | "FACTORY_MAINTENANCE"
  | "RD_FACILITY_MAINTENANCE"
  | "INSURANCE"
  | "DEALER_OVERHEAD";

export type VariableExpenseCategory =
  | "RAW_MATERIALS"
  | "COMPONENT_PURCHASES"
  | "ASSEMBLY_LABOR"
  | "ELECTRICITY"
  | "LOGISTICS"
  | "DEALER_COMMISSION";

export type InvestmentCategory =
  | "HQ_CONSTRUCTION"
  | "FACTORY_CONSTRUCTION"
  | "TOOLING"
  | "RAIL_INFRASTRUCTURE"
  | "RD_INVESTMENT"
  | "EQUIPMENT";

export type OtherExpenseCategory =
  | "LOAN_PAYMENT"
  | "LOAN_RECEIVED"
  | "WARRANTY_RECALL"
  | "MARKETING"
  | "MOTORSPORT_EXPENSE"
  | "TAX"
  | "CONTRACT_PENALTY";

export type TransactionCategory =
  | RevenueCategory
  | FixedExpenseCategory
  | VariableExpenseCategory
  | InvestmentCategory
  | OtherExpenseCategory;

export type FlowType = "INCOME" | "EXPENSE" | "INVESTMENT" | "FINANCING";

export interface LedgerTransaction {
  id: string;
  month: number;            // 1-12
  year: number;             // e.g. 1970
  category: TransactionCategory;
  flowType: FlowType;
  amount: number;           // Always positive number; flowType determines credit/debit
  description: string;
  relatedEntityId?: string; // vehicleId, factoryId, contractId, employeeId, etc.
  isRecurring: boolean;
  createdAtTimestamp: number;
}

export interface MonthlyFinancialSnapshot {
  month: number;
  year: number;
  revenue: number;
  fixedExpenses: number;
  variableExpenses: number;
  operatingExpenses: number;    // fixed + variable
  operatingProfit: number;      // revenue - operatingExpenses
  investments: number;          // CapEx
  debtService: number;          // loan repayments & interest
  taxes: number;
  netIncome: number;            // operatingProfit - debtService - taxes
  cashFlow: number;             // net change in cash: revenue - all outflows
  openingCash: number;
  closingCash: number;
  revenueByCategory: Record<RevenueCategory, number>;
  expenseByCategory: Record<string, number>;
  totalTransactionsCount: number;
}

/** Determines FlowType from Category */
export function getFlowTypeFromCategory(category: TransactionCategory): FlowType {
  switch (category) {
    case "VEHICLE_SALES":
    case "COMPONENT_SALES":
    case "TECH_LICENSING":
    case "CONTRACT_INCOME":
    case "MOTORSPORT_INCOME":
    case "AFTER_SALES":
    case "LOAN_RECEIVED":
      return "INCOME";

    case "HQ_CONSTRUCTION":
    case "FACTORY_CONSTRUCTION":
    case "TOOLING":
    case "RAIL_INFRASTRUCTURE":
    case "RD_INVESTMENT":
    case "EQUIPMENT":
      return "INVESTMENT";

    case "LOAN_PAYMENT":
      return "FINANCING";

    default:
      return "EXPENSE";
  }
}

/** Create a new structured transaction */
export function createLedgerTransaction(
  month: number,
  year: number,
  category: TransactionCategory,
  amount: number,
  description: string,
  options?: {
    relatedEntityId?: string;
    isRecurring?: boolean;
    flowType?: FlowType;
  }
): LedgerTransaction {
  const safeAmount = Math.max(0, Math.round(amount));
  const flowType = options?.flowType ?? getFlowTypeFromCategory(category);
  return {
    id: `tx_${year}_${month}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    month,
    year,
    category,
    flowType,
    amount: safeAmount,
    description,
    relatedEntityId: options?.relatedEntityId,
    isRecurring: options?.isRecurring ?? false,
    createdAtTimestamp: Date.now(),
  };
}

/** Check if category is fixed expense */
export function isFixedExpense(category: TransactionCategory): category is FixedExpenseCategory {
  return [
    "EMPLOYEE_SALARIES",
    "HQ_MAINTENANCE",
    "FACTORY_MAINTENANCE",
    "RD_FACILITY_MAINTENANCE",
    "INSURANCE",
    "DEALER_OVERHEAD",
  ].includes(category);
}

/** Check if category is variable expense */
export function isVariableExpense(category: TransactionCategory): category is VariableExpenseCategory {
  return [
    "RAW_MATERIALS",
    "COMPONENT_PURCHASES",
    "ASSEMBLY_LABOR",
    "ELECTRICITY",
    "LOGISTICS",
    "DEALER_COMMISSION",
  ].includes(category);
}

/** Check if category is revenue */
export function isRevenue(category: TransactionCategory): category is RevenueCategory {
  return [
    "VEHICLE_SALES",
    "COMPONENT_SALES",
    "TECH_LICENSING",
    "CONTRACT_INCOME",
    "MOTORSPORT_INCOME",
    "AFTER_SALES",
  ].includes(category);
}

/** Aggregate all transactions for a given month and calculate comprehensive snapshot */
export function aggregateMonthlySnapshot(
  month: number,
  year: number,
  transactions: LedgerTransaction[],
  openingCash: number
): MonthlyFinancialSnapshot {
  const monthTxs = transactions.filter((tx) => tx.month === month && tx.year === year);

  let revenue = 0;
  let fixedExpenses = 0;
  let variableExpenses = 0;
  let otherExpenses = 0;
  let investments = 0;
  let debtService = 0;
  let taxes = 0;

  const revenueByCategory: Record<RevenueCategory, number> = {
    VEHICLE_SALES: 0,
    COMPONENT_SALES: 0,
    TECH_LICENSING: 0,
    CONTRACT_INCOME: 0,
    MOTORSPORT_INCOME: 0,
    AFTER_SALES: 0,
  };

  const expenseByCategory: Record<string, number> = {};

  for (const tx of monthTxs) {
    if (isRevenue(tx.category)) {
      revenue += tx.amount;
      revenueByCategory[tx.category] = (revenueByCategory[tx.category] || 0) + tx.amount;
    } else if (tx.category === "LOAN_RECEIVED") {
      // Financing inflow (not operating revenue)
      // will be added to cashFlow directly
    } else if (isFixedExpense(tx.category)) {
      fixedExpenses += tx.amount;
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    } else if (isVariableExpense(tx.category)) {
      variableExpenses += tx.amount;
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    } else if (tx.flowType === "INVESTMENT") {
      investments += tx.amount;
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    } else if (tx.category === "LOAN_PAYMENT") {
      debtService += tx.amount;
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    } else if (tx.category === "TAX") {
      taxes += tx.amount;
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    } else {
      otherExpenses += tx.amount;
      expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
    }
  }

  const operatingExpenses = fixedExpenses + variableExpenses + otherExpenses;
  const operatingProfit = revenue - operatingExpenses;
  const netIncome = operatingProfit - debtService - taxes;

  // Total cash in vs out
  const financingInflow = monthTxs
    .filter((tx) => tx.category === "LOAN_RECEIVED")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalCashOut = operatingExpenses + investments + debtService + taxes;
  const totalCashIn = revenue + financingInflow;
  const cashFlow = totalCashIn - totalCashOut;
  const closingCash = Math.max(0, openingCash + cashFlow);

  return {
    month,
    year,
    revenue,
    fixedExpenses,
    variableExpenses,
    operatingExpenses,
    operatingProfit,
    investments,
    debtService,
    taxes,
    netIncome,
    cashFlow,
    openingCash,
    closingCash,
    revenueByCategory,
    expenseByCategory,
    totalTransactionsCount: monthTxs.length,
  };
}

/** Calculate runway in months based on trailing burn rate */
export function calculateCashRunway(
  currentCash: number,
  recentSnapshots: MonthlyFinancialSnapshot[]
): number {
  if (currentCash <= 0) return 0;
  if (recentSnapshots.length === 0) return 36; // Initial conservative assumption

  // Look at trailing up to 3 months of net cash flow
  const sample = recentSnapshots.slice(-3);
  const netFlowSum = sample.reduce((sum, s) => sum + s.cashFlow, 0);
  const avgMonthlyFlow = netFlowSum / sample.length;

  if (avgMonthlyFlow >= 0) {
    return 999; // Profitable or cash-flow positive
  }

  const monthlyBurn = Math.abs(avgMonthlyFlow);
  return Number((currentCash / monthlyBurn).toFixed(1));
}
