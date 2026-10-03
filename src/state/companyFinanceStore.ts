/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMPANY FINANCE STORE — ZUSTAND MASTER FINANCIAL LEDGER & P&L
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Master repository for company cash, double-entry ledger transactions,
 * monthly P&L snapshots, balance sheet capital assets, debt liabilities,
 * cash runway health, and R&D capital allocation.
 */

import { create } from "zustand";
import {
  LedgerTransaction,
  MonthlyFinancialSnapshot,
  TransactionCategory,
  createLedgerTransaction,
  aggregateMonthlySnapshot,
  calculateCashRunway,
} from "../sim/economy/companyLedgerEngine";
import {
  CompanyAsset,
  CompanyLiability,
  BalanceSheet,
  INITIAL_1970_ASSETS,
  buildBalanceSheet,
  depreciateAssetMonth,
  calculateMonthlyMaintenance,
  processMonthlyLiabilities,
} from "../sim/economy/balanceSheet";
import { TechLicenseAgreement } from "../sim/economy/techLicensingEngine";
import { MotorsportDivisionState, INITIAL_1970_MOTORSPORT } from "../sim/economy/motorsportIncomeEngine";
import { ActiveLoan } from "../sim/economy/loanFinancingEngine";
import { MonthlyFinancialEvent } from "../sim/economy/monthlyEventGenerator";
import { MonthlyTickResult } from "../sim/economy/monthlyTickTypes";

import { CashHealthStatus } from "../sim/economy/financialDangerDetector";
export type { CashHealthStatus };

export type RDCategory =
  | "PERFORMANCE"
  | "RELIABILITY"
  | "SAFETY"
  | "DESIGN"
  | "LUXURY"
  | "MANUFACTURING"
  | "ELECTRONICS"
  | "MOTORSPORT";

export interface RDProjectFinancial {
  projectId: string;
  name: string;
  category: RDCategory;
  totalBudget: number;
  spent: number;
  remaining: number;
  monthlyCost: number;
  monthsRemaining: number;
  requiredFacilities: string[];
  requiredEmployees: number;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
}

export interface RDBudgetAllocation {
  totalMonthlyBudget: number; // e.g. ₹500,000 / month initially in 1970
  allocations: Record<RDCategory, number>; // percentages summing to 100
  activeProjects: RDProjectFinancial[];
}

export const INITIAL_RD_BUDGET: RDBudgetAllocation = {
  totalMonthlyBudget: 450000, // ₹450k/month
  allocations: {
    PERFORMANCE: 25,
    RELIABILITY: 20,
    DESIGN: 15,
    MANUFACTURING: 15,
    SAFETY: 10,
    ELECTRONICS: 5,
    LUXURY: 5,
    MOTORSPORT: 5,
  },
  activeProjects: [
    {
      projectId: "proj_v8_aluminum_block_1970",
      name: "High-Compression 3.0L Aluminum V8 Prototype",
      category: "PERFORMANCE",
      totalBudget: 2400000,
      spent: 800000,
      remaining: 1600000,
      monthlyCost: 200000,
      monthsRemaining: 8,
      requiredFacilities: ["asset_founding_workshop_1970", "asset_engine_dyno_1970"],
      requiredEmployees: 8,
      status: "ACTIVE",
    },
    {
      projectId: "proj_independent_rear_susp_1970",
      name: "Double-Wishbone Rear Geometry Development",
      category: "DESIGN",
      totalBudget: 1500000,
      spent: 300000,
      remaining: 1200000,
      monthlyCost: 150000,
      monthsRemaining: 8,
      requiredFacilities: ["asset_founding_workshop_1970"],
      requiredEmployees: 4,
      status: "ACTIVE",
    },
  ],
};

export interface CompanyFinanceState {
  // ──── Core Liquid Cash & Flow ────
  cash: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyOperatingProfit: number;
  monthlyCashFlow: number;
  companyValue: number;

  // ──── Cash Runway & Financial Solvency ────
  cashHealth: CashHealthStatus;
  monthsOfRunway: number;

  // ──── Transaction Ledger & Historical Snapshots ────
  transactions: LedgerTransaction[];
  monthlySnapshots: MonthlyFinancialSnapshot[];

  // ──── Assets, Liabilities & Balance Sheet ────
  assets: CompanyAsset[];
  liabilities: CompanyLiability[];
  technologyIPValue: number;
  brandReputationValue: number;
  balanceSheet: BalanceSheet;

  // ──── R&D Budget Allocation ────
  rdBudget: RDBudgetAllocation;

  // ──── Tech Licensing & Motorsport ────
  techLicenses: TechLicenseAgreement[];
  motorsportState: MotorsportDivisionState;

  // ──── Corporate Loans & Financing ────
  activeLoans: ActiveLoan[];

  // ──── Monthly Financial Event Feed ────
  monthlyFinancialEvents: MonthlyFinancialEvent[];

  // ──── Latest Monthly Simulation Result ────
  lastTickResult: MonthlyTickResult | null;
  setLastTickResult: (result: MonthlyTickResult) => void;

  // ──── Actions ────
  recordTransaction: (
    month: number,
    year: number,
    category: TransactionCategory,
    amount: number,
    description: string,
    options?: { relatedEntityId?: string; isRecurring?: boolean }
  ) => LedgerTransaction;

  recordMultipleTransactions: (
    txs: Array<{
      month: number;
      year: number;
      category: TransactionCategory;
      amount: number;
      description: string;
      relatedEntityId?: string;
      isRecurring?: boolean;
    }>
  ) => void;

  processMonthlyTick: (month: number, year: number) => MonthlyFinancialSnapshot;

  addAsset: (asset: CompanyAsset) => void;
  removeAsset: (assetId: string) => void;
  updateAsset: (assetId: string, patch: Partial<CompanyAsset>) => void;

  addLiability: (liability: CompanyLiability) => void;
  payLiability: (id: string, amount: number) => void;

  setRDBudget: (patch: Partial<RDBudgetAllocation>) => void;
  updateRDProject: (projectId: string, patch: Partial<RDProjectFinancial>) => void;
  addRDProject: (project: RDProjectFinancial) => void;

  setTechLicenses: (licenses: TechLicenseAgreement[]) => void;
  addTechLicense: (license: TechLicenseAgreement) => void;
  updateMotorsportState: (patch: Partial<MotorsportDivisionState>) => void;
  addLoan: (loan: ActiveLoan) => void;
  updateLoans: (loans: ActiveLoan[]) => void;
  addFinancialEvents: (events: MonthlyFinancialEvent[]) => void;

  injectCapital: (amount: number, source: string, month: number, year: number) => void;
  spendDirectCash: (amount: number, category?: TransactionCategory, description?: string, month?: number, year?: number) => void;
  updateCashHealth: () => void;
  recalculateValuation: (techIPValue?: number, brandValue?: number) => void;
  resetTo1970: () => void;
}

// ─────────────────────────────────────────────────────────────
// Initial 1970 State Configuration
// ─────────────────────────────────────────────────────────────
const STARTING_CASH_1970 = 50000000; // ₹50,000,000 seed venture capital
const INITIAL_ASSETS = [...INITIAL_1970_ASSETS];
const INITIAL_LIABILITIES: CompanyLiability[] = [];
const INITIAL_IP_VALUATION = 2500000; // Initial founding blueprints & patents
const INITIAL_BRAND_VALUATION = 9500000; // Emerging brand equity

export const useCompanyFinanceStore = create<CompanyFinanceState>((set, get) => {
  const initialBalanceSheet = buildBalanceSheet(
    STARTING_CASH_1970,
    INITIAL_ASSETS,
    INITIAL_LIABILITIES,
    INITIAL_IP_VALUATION,
    INITIAL_BRAND_VALUATION
  );

  return {
    cash: STARTING_CASH_1970,
    monthlyRevenue: 0,
    monthlyExpenses: 210000, // Founding facility & tool maintenance + skeleton costs
    monthlyOperatingProfit: -210000,
    monthlyCashFlow: -210000,
    companyValue: initialBalanceSheet.totalAssets,
    cashHealth: "HEALTHY",
    monthsOfRunway: 238, // > 19 years at initial baseline burn

    transactions: [],
    monthlySnapshots: [],

    assets: INITIAL_ASSETS,
    liabilities: INITIAL_LIABILITIES,
    technologyIPValue: INITIAL_IP_VALUATION,
    brandReputationValue: INITIAL_BRAND_VALUATION,
    balanceSheet: initialBalanceSheet,

    rdBudget: INITIAL_RD_BUDGET,

    techLicenses: [],
    motorsportState: { ...INITIAL_1970_MOTORSPORT },
    activeLoans: [],
    monthlyFinancialEvents: [],
    lastTickResult: null,

    setLastTickResult: (result) => set({ lastTickResult: result }),

    recordTransaction: (month, year, category, amount, description, options) => {
      const tx = createLedgerTransaction(month, year, category, amount, description, options);
      set((state) => {
        const newTransactions = [tx, ...state.transactions];
        return { transactions: newTransactions };
      });
      return tx;
    },

    recordMultipleTransactions: (txs) => {
      const newItems = txs.map((t) =>
        createLedgerTransaction(t.month, t.year, t.category, t.amount, t.description, {
          relatedEntityId: t.relatedEntityId,
          isRecurring: t.isRecurring,
        })
      );
      set((state) => ({
        transactions: [...newItems, ...state.transactions],
      }));
    },

    processMonthlyTick: (month, year) => {
      const state = get();

      // 1. Process asset depreciation for all physical assets
      const depreciatedAssets = state.assets.map(depreciateAssetMonth);

      // 2. Process debt servicing and principal repayments
      const { updatedLiabilities, totalPaid: debtPaid } = processMonthlyLiabilities(state.liabilities);
      if (debtPaid > 0) {
        state.recordTransaction(
          month,
          year,
          "LOAN_PAYMENT",
          debtPaid,
          `Monthly debt service across ${state.liabilities.length} loan facility obligations`
        );
      }

      // 3. Process facility maintenance charges
      const totalMaintenance = calculateMonthlyMaintenance(depreciatedAssets);
      if (totalMaintenance > 0) {
        state.recordTransaction(
          month,
          year,
          "FACTORY_MAINTENANCE",
          totalMaintenance,
          `Physical facilities maintenance for ${depreciatedAssets.length} capital assets`,
          { isRecurring: true }
        );
      }

      // 4. Process active R&D projects burn
      let totalRDBurn = 0;
      const updatedProjects = state.rdBudget.activeProjects.map((proj) => {
        if (proj.status === "ACTIVE" && proj.remaining > 0 && proj.monthsRemaining > 0) {
          const monthlyBurn = Math.min(proj.monthlyCost, proj.remaining);
          totalRDBurn += monthlyBurn;
          const newSpent = proj.spent + monthlyBurn;
          const newRemaining = Math.max(0, proj.totalBudget - newSpent);
          const newMonths = Math.max(0, proj.monthsRemaining - 1);
          return {
            ...proj,
            spent: newSpent,
            remaining: newRemaining,
            monthsRemaining: newMonths,
            status: (newRemaining === 0 || newMonths === 0 ? "COMPLETED" : "ACTIVE") as "ACTIVE" | "COMPLETED",
          };
        }
        return proj;
      });

      if (totalRDBurn > 0) {
        state.recordTransaction(
          month,
          year,
          "RD_INVESTMENT",
          totalRDBurn,
          `Active R&D project development burn for ${updatedProjects.filter((p) => p.status === "ACTIVE").length} programs`
        );
      }

      // 5. Aggregate all ledger transactions for the month into snapshot
      const currentTransactions = get().transactions;
      const snapshot = aggregateMonthlySnapshot(month, year, currentTransactions, state.cash);

      const newSnapshots = [...state.monthlySnapshots, snapshot];
      const newCash = snapshot.closingCash;

      // 6. Recalculate balance sheet
      const updatedBalanceSheet = buildBalanceSheet(
        newCash,
        depreciatedAssets,
        updatedLiabilities,
        state.technologyIPValue,
        state.brandReputationValue
      );

      // 7. Calculate runway and health
      const runway = calculateCashRunway(newCash, newSnapshots);
      let health: CashHealthStatus = "HEALTHY";
      if (newCash <= 0) health = "INSOLVENT";
      else if (runway < 2) health = "CRITICAL";
      else if (runway < 4) health = "WARNING";
      else if (runway < 12) health = "STABLE";

      set({
        cash: newCash,
        monthlyRevenue: snapshot.revenue,
        monthlyExpenses: snapshot.operatingExpenses,
        monthlyOperatingProfit: snapshot.operatingProfit,
        monthlyCashFlow: snapshot.cashFlow,
        companyValue: updatedBalanceSheet.totalAssets,
        cashHealth: health,
        monthsOfRunway: runway,
        monthlySnapshots: newSnapshots,
        assets: depreciatedAssets,
        liabilities: updatedLiabilities,
        balanceSheet: updatedBalanceSheet,
        rdBudget: {
          ...state.rdBudget,
          activeProjects: updatedProjects,
        },
      });

      return snapshot;
    },

    addAsset: (asset) => {
      set((state) => {
        const assets = [...state.assets, asset];
        const balanceSheet = buildBalanceSheet(
          state.cash,
          assets,
          state.liabilities,
          state.technologyIPValue,
          state.brandReputationValue
        );
        return { assets, balanceSheet, companyValue: balanceSheet.totalAssets };
      });
    },

    removeAsset: (assetId) => {
      set((state) => {
        const assets = state.assets.filter((a) => a.id !== assetId);
        const balanceSheet = buildBalanceSheet(
          state.cash,
          assets,
          state.liabilities,
          state.technologyIPValue,
          state.brandReputationValue
        );
        return { assets, balanceSheet, companyValue: balanceSheet.totalAssets };
      });
    },

    updateAsset: (assetId, patch) => {
      set((state) => {
        const assets = state.assets.map((a) => (a.id === assetId ? { ...a, ...patch } : a));
        const balanceSheet = buildBalanceSheet(
          state.cash,
          assets,
          state.liabilities,
          state.technologyIPValue,
          state.brandReputationValue
        );
        return { assets, balanceSheet, companyValue: balanceSheet.totalAssets };
      });
    },

    addLiability: (liability) => {
      set((state) => {
        const liabilities = [...state.liabilities, liability];
        const balanceSheet = buildBalanceSheet(
          state.cash,
          state.assets,
          liabilities,
          state.technologyIPValue,
          state.brandReputationValue
        );
        return { liabilities, balanceSheet, companyValue: balanceSheet.totalAssets };
      });
    },

    payLiability: (id, amount) => {
      set((state) => {
        if (state.cash < amount) return state; // Insolvent to pay lump sum
        const liabilities = state.liabilities
          .map((l) => {
            if (l.id === id) {
              const remaining = Math.max(0, l.remainingAmount - amount);
              return { ...l, remainingAmount: remaining };
            }
            return l;
          })
          .filter((l) => l.remainingAmount > 0);

        const newCash = state.cash - amount;
        const balanceSheet = buildBalanceSheet(
          newCash,
          state.assets,
          liabilities,
          state.technologyIPValue,
          state.brandReputationValue
        );
        return { cash: newCash, liabilities, balanceSheet, companyValue: balanceSheet.totalAssets };
      });
    },

    setRDBudget: (patch) => {
      set((state) => ({
        rdBudget: { ...state.rdBudget, ...patch },
      }));
    },

    updateRDProject: (projectId, patch) => {
      set((state) => ({
        rdBudget: {
          ...state.rdBudget,
          activeProjects: state.rdBudget.activeProjects.map((p) =>
            p.projectId === projectId ? { ...p, ...patch } : p
          ),
        },
      }));
    },

    addRDProject: (project) => {
      set((state) => ({
        rdBudget: {
          ...state.rdBudget,
          activeProjects: [...state.rdBudget.activeProjects, project],
        },
      }));
    },

    setTechLicenses: (licenses) => set({ techLicenses: licenses }),
    addTechLicense: (license) =>
      set((state) => ({ techLicenses: [...state.techLicenses, license] })),
    updateMotorsportState: (patch) =>
      set((state) => ({ motorsportState: { ...state.motorsportState, ...patch } })),
    addLoan: (loan) => set((state) => ({ activeLoans: [...state.activeLoans, loan] })),
    updateLoans: (loans) => set({ activeLoans: loans }),
    addFinancialEvents: (events) =>
      set((state) => ({
        monthlyFinancialEvents: [...events, ...state.monthlyFinancialEvents.slice(0, 49)],
      })),

    injectCapital: (amount, source, month, year) => {
      const state = get();
      state.recordTransaction(
        month,
        year,
        "LOAN_RECEIVED",
        amount,
        `Capital injection via ${source}`
      );
      const newCash = state.cash + amount;
      const balanceSheet = buildBalanceSheet(
        newCash,
        state.assets,
        state.liabilities,
        state.technologyIPValue,
        state.brandReputationValue
      );
      set({
        cash: newCash,
        balanceSheet,
        companyValue: balanceSheet.totalAssets,
      });
      get().updateCashHealth();
    },

    spendDirectCash: (amount, category = "HQ_CONSTRUCTION", description = "Direct cash expenditure", month = 1, year = 1970) => {
      const state = get();
      state.recordTransaction(month, year, category, amount, description);
      const newCash = Math.max(0, state.cash - amount);
      const balanceSheet = buildBalanceSheet(
        newCash,
        state.assets,
        state.liabilities,
        state.technologyIPValue,
        state.brandReputationValue
      );
      set({
        cash: newCash,
        balanceSheet,
        companyValue: balanceSheet.totalAssets,
      });
      get().updateCashHealth();
    },

    updateCashHealth: () => {
      const state = get();
      const runway = calculateCashRunway(state.cash, state.monthlySnapshots);
      let health: CashHealthStatus = "HEALTHY";
      if (state.cash <= 0) health = "INSOLVENT";
      else if (runway < 2) health = "CRITICAL";
      else if (runway < 4) health = "WARNING";
      else if (runway < 12) health = "STABLE";

      set({ monthsOfRunway: runway, cashHealth: health });
    },

    recalculateValuation: (techIPValue, brandValue) => {
      set((state) => {
        const ip = techIPValue !== undefined ? techIPValue : state.technologyIPValue;
        const brand = brandValue !== undefined ? brandValue : state.brandReputationValue;
        const balanceSheet = buildBalanceSheet(
          state.cash,
          state.assets,
          state.liabilities,
          ip,
          brand
        );
        return {
          technologyIPValue: ip,
          brandReputationValue: brand,
          balanceSheet,
          companyValue: balanceSheet.totalAssets,
        };
      });
    },

    resetTo1970: () => {
      const initialBalanceSheet = buildBalanceSheet(
        STARTING_CASH_1970,
        INITIAL_ASSETS,
        INITIAL_LIABILITIES,
        INITIAL_IP_VALUATION,
        INITIAL_BRAND_VALUATION
      );
      set({
        cash: STARTING_CASH_1970,
        monthlyRevenue: 0,
        monthlyExpenses: 210000,
        monthlyOperatingProfit: -210000,
        monthlyCashFlow: -210000,
        companyValue: initialBalanceSheet.totalAssets,
        cashHealth: "HEALTHY",
        monthsOfRunway: 238,
        transactions: [],
        monthlySnapshots: [],
        assets: INITIAL_ASSETS,
        liabilities: INITIAL_LIABILITIES,
        technologyIPValue: INITIAL_IP_VALUATION,
        brandReputationValue: INITIAL_BRAND_VALUATION,
        balanceSheet: initialBalanceSheet,
        rdBudget: INITIAL_RD_BUDGET,
        techLicenses: [],
        motorsportState: { ...INITIAL_1970_MOTORSPORT },
        activeLoans: [],
        monthlyFinancialEvents: [],
      });
    },
  };
});
