/**
 * ═══════════════════════════════════════════════════════════════════════
 * BUDGET ALLOCATION ENGINE — DISCRETIONARY RESOURCE PLANNING
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 3D & Section 29 (Monthly Budget Allocation):
 * Allows player to set strategic spending targets across discretionary operational areas:
 * - Research & Development (8 engineering domains)
 * - Motorsport Racing Division
 * - Marketing & Advertising Campaigns
 * - Factory Expansion & Tooling CapEx Reserve
 * - Employee Training & Quality Upgrades
 * - Liquid Cash Reserve Target
 */

import { create } from "zustand";

export type BudgetItemKey =
  | "RD"
  | "MOTORSPORT"
  | "MARKETING"
  | "CAPEX_RESERVE"
  | "EMPLOYEE_TRAINING"
  | "CASH_RESERVE";

export interface BudgetItemPlan {
  key: BudgetItemKey;
  label: string;
  targetMonthlyAmount: number;
  percentageOfBudget: number; // 0-100
  isPriority: boolean;
}

export interface MonthlyBudgetMasterPlan {
  totalMonthlyDiscretionaryBudget: number;
  items: Record<BudgetItemKey, BudgetItemPlan>;
  minimumCashThreshold: number; // Alerts if liquid cash dips below this
}

export const INITIAL_1970_BUDGET_PLAN: MonthlyBudgetMasterPlan = {
  totalMonthlyDiscretionaryBudget: 600000, // ₹600k/mo
  items: {
    RD: {
      key: "RD",
      label: "Research & Development",
      targetMonthlyAmount: 450000,
      percentageOfBudget: 75,
      isPriority: true,
    },
    MARKETING: {
      key: "MARKETING",
      label: "Marketing & Awareness",
      targetMonthlyAmount: 60000,
      percentageOfBudget: 10,
      isPriority: false,
    },
    MOTORSPORT: {
      key: "MOTORSPORT",
      label: "Motorsport & Racing",
      targetMonthlyAmount: 0,
      percentageOfBudget: 0,
      isPriority: false,
    },
    CAPEX_RESERVE: {
      key: "CAPEX_RESERVE",
      label: "CapEx Tooling & Expansion",
      targetMonthlyAmount: 60000,
      percentageOfBudget: 10,
      isPriority: false,
    },
    EMPLOYEE_TRAINING: {
      key: "EMPLOYEE_TRAINING",
      label: "Workforce Training & QA",
      targetMonthlyAmount: 30000,
      percentageOfBudget: 5,
      isPriority: false,
    },
    CASH_RESERVE: {
      key: "CASH_RESERVE",
      label: "Target Cash Buffer",
      targetMonthlyAmount: 0,
      percentageOfBudget: 0,
      isPriority: true,
    },
  },
  minimumCashThreshold: 10000000, // ₹10M safety alert
};

export interface BudgetVarianceReport {
  key: BudgetItemKey;
  label: string;
  plannedAmount: number;
  actualAmount: number;
  varianceAmount: number; // actual - planned
  variancePct: number;
  isOverBudget: boolean;
}

/** Check budget compliance given actual month outflows */
export function evaluateBudgetCompliance(
  plan: MonthlyBudgetMasterPlan,
  actuals: Partial<Record<BudgetItemKey, number>>
): {
  reports: BudgetVarianceReport[];
  totalPlanned: number;
  totalActual: number;
  isOverallOverBudget: boolean;
  warnings: string[];
} {
  const reports: BudgetVarianceReport[] = [];
  const warnings: string[] = [];
  let totalPlanned = 0;
  let totalActual = 0;

  for (const [keyStr, item] of Object.entries(plan.items)) {
    const key = keyStr as BudgetItemKey;
    const actual = actuals[key] ?? 0;
    const variance = actual - item.targetMonthlyAmount;
    const variancePct =
      item.targetMonthlyAmount > 0
        ? Math.round((variance / item.targetMonthlyAmount) * 100)
        : actual > 0
        ? 100
        : 0;

    totalPlanned += item.targetMonthlyAmount;
    totalActual += actual;

    const isOver = variance > 5000 && variancePct > 5;
    if (isOver && item.isPriority) {
      warnings.push(`Priority budget item "${item.label}" exceeded target by ₹${Math.round(variance / 1000)}k (${variancePct}%)`);
    }

    reports.push({
      key,
      label: item.label,
      plannedAmount: item.targetMonthlyAmount,
      actualAmount: actual,
      varianceAmount: variance,
      variancePct,
      isOverBudget: isOver,
    });
  }

  const isOverallOverBudget = totalActual > totalPlanned * 1.05;

  return {
    reports,
    totalPlanned,
    totalActual,
    isOverallOverBudget,
    warnings,
  };
}

export interface BudgetStoreState {
  plan: MonthlyBudgetMasterPlan;
  setTotalBudget: (total: number) => void;
  setItemPercentage: (key: BudgetItemKey, pct: number) => void;
  setCashThreshold: (threshold: number) => void;
  resetTo1970: () => void;
}

export const useBudgetStore = create<BudgetStoreState>((set) => ({
  plan: { ...INITIAL_1970_BUDGET_PLAN },

  setTotalBudget: (total: number) => {
    set((state) => {
      const safeTotal = Math.max(10000, total);
      const updatedItems = { ...state.plan.items };
      for (const k of Object.keys(updatedItems) as BudgetItemKey[]) {
        const item = updatedItems[k];
        updatedItems[k] = {
          ...item,
          targetMonthlyAmount: Math.round((safeTotal * item.percentageOfBudget) / 100),
        };
      }
      return {
        plan: {
          ...state.plan,
          totalMonthlyDiscretionaryBudget: safeTotal,
          items: updatedItems,
        },
      };
    });
  },

  setItemPercentage: (key: BudgetItemKey, pct: number) => {
    set((state) => {
      const item = state.plan.items[key];
      const safePct = Math.max(0, Math.min(100, pct));
      const amount = Math.round((state.plan.totalMonthlyDiscretionaryBudget * safePct) / 100);
      return {
        plan: {
          ...state.plan,
          items: {
            ...state.plan.items,
            [key]: {
              ...item,
              percentageOfBudget: safePct,
              targetMonthlyAmount: amount,
            },
          },
        },
      };
    });
  },

  setCashThreshold: (threshold) => {
    set((state) => ({
      plan: { ...state.plan, minimumCashThreshold: Math.max(0, threshold) },
    }));
  },

  resetTo1970: () => {
    set({ plan: { ...INITIAL_1970_BUDGET_PLAN } });
  },
}));
