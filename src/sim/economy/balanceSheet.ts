/**
 * ═══════════════════════════════════════════════════════════════════════
 * BALANCE SHEET ENGINE — ASSETS, LIABILITIES & CORPORATE EQUITY
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Tracks physical capital assets (factories, labs, HQ, tooling),
 * debt liabilities, intangible R&D IP valuation, brand reputation capital,
 * and comprehensive shareholder equity.
 */

export type CompanyAssetType =
  | "HQ"
  | "FACTORY"
  | "WAREHOUSE"
  | "RAIL"
  | "TESTING_FACILITY"
  | "WIND_TUNNEL"
  | "RD_LAB"
  | "DEALER_NETWORK"
  | "EQUIPMENT"
  | "TOOLING";

export interface CompanyAsset {
  id: string;
  name: string;
  type: CompanyAssetType;
  originalCost: number;
  currentValue: number;          // Depreciated book value
  monthlyMaintenanceCost: number;
  annualDepreciationRate: number; // e.g. 0.05 for 5% per year
  capacityUnits?: number;        // e.g. 2,000 units/year for a pilot plant
  utilizationPct?: number;       // 0 - 100%
  acquisitionYear: number;
  acquisitionMonth: number;
  constructionCompleteMonth?: number;
  conditionPct: number;          // 0-100% structural condition
}

export type CompanyLiabilityType =
  | "LOAN"
  | "CONTRACT_OBLIGATION"
  | "OUTSTANDING_PAYMENT"
  | "WARRANTY_RESERVE";

export interface CompanyLiability {
  id: string;
  name: string;
  type: CompanyLiabilityType;
  principalAmount: number;
  remainingAmount: number;
  interestRateAnnual: number;    // e.g. 0.075 for 7.5%
  monthlyPayment: number;
  monthsRemaining: number;
  creditor: string;
  originYear: number;
}

export interface BalanceSheet {
  cash: number;
  totalPhysicalAssets: number;
  technologyIPValue: number;       // Derived from unlocked technologies & patents
  brandReputationValue: number;    // Derived from multi-dimensional reputation
  totalAssets: number;             // cash + physical + IP + brand
  totalLiabilities: number;
  equity: number;                  // totalAssets - totalLiabilities
  netTangibleBookValue: number;    // cash + physical - totalLiabilities (conservative)
  debtToEquityRatio: number;
  assets: CompanyAsset[];
  liabilities: CompanyLiability[];
}

/** Default annual depreciation rates by asset type */
export const DEFAULT_DEPRECIATION_RATES: Record<CompanyAssetType, number> = {
  HQ: 0.025,                // 40-year building life
  FACTORY: 0.04,            // 25-year life
  WAREHOUSE: 0.03,          // 33-year life
  RAIL: 0.02,               // 50-year life
  TESTING_FACILITY: 0.06,   // 16-year life
  WIND_TUNNEL: 0.05,        // 20-year life
  RD_LAB: 0.08,             // 12-year life
  DEALER_NETWORK: 0.05,     // 20-year life
  EQUIPMENT: 0.10,          // 10-year machinery life
  TOOLING: 0.20,            // 5-year model tooling lifecycle
};

/** Founding Era 1970 Starting Assets (Small workshop, basic lathe & metal tooling) */
export const INITIAL_1970_ASSETS: CompanyAsset[] = [
  {
    id: "asset_founding_workshop_1970",
    name: "Founding Prototype Workshop (Turin Outskirts)",
    type: "HQ",
    originalCost: 8000000,
    currentValue: 8000000,
    monthlyMaintenanceCost: 45000,
    annualDepreciationRate: 0.025,
    acquisitionYear: 1970,
    acquisitionMonth: 1,
    conditionPct: 92,
  },
  {
    id: "asset_founding_tooling_1970",
    name: "Hand-Fabrication Presses & Lathes",
    type: "EQUIPMENT",
    originalCost: 3500000,
    currentValue: 3500000,
    monthlyMaintenanceCost: 25000,
    annualDepreciationRate: 0.10,
    capacityUnits: 250, // 250 handcrafted prototypes/year
    utilizationPct: 15,
    acquisitionYear: 1970,
    acquisitionMonth: 1,
    conditionPct: 95,
  },
  {
    id: "asset_engine_dyno_1970",
    name: "Mechanical Water-Brake Engine Dyno Cell",
    type: "TESTING_FACILITY",
    originalCost: 1500000,
    currentValue: 1500000,
    monthlyMaintenanceCost: 15000,
    annualDepreciationRate: 0.06,
    acquisitionYear: 1970,
    acquisitionMonth: 1,
    conditionPct: 98,
  },
];

/** Depreciate an asset by 1 month */
export function depreciateAssetMonth(asset: CompanyAsset): CompanyAsset {
  const monthlyRate = asset.annualDepreciationRate / 12;
  const newValue = Math.max(
    asset.originalCost * 0.10, // 10% salvage floor
    Math.round(asset.currentValue * (1 - monthlyRate))
  );
  // Condition degrades slightly with age unless maintained
  const newCondition = Math.max(30, Number((asset.conditionPct - 0.05).toFixed(1)));
  return {
    ...asset,
    currentValue: newValue,
    conditionPct: newCondition,
  };
}

/** Calculate total monthly maintenance cost across all physical assets */
export function calculateMonthlyMaintenance(assets: CompanyAsset[]): number {
  return assets.reduce((sum, a) => sum + a.monthlyMaintenanceCost, 0);
}

/** Calculate monthly debt service obligations across liabilities */
export function calculateMonthlyDebtService(liabilities: CompanyLiability[]): number {
  return liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0);
}

/** Service liabilities by 1 month, reducing principal */
export function processMonthlyLiabilities(
  liabilities: CompanyLiability[]
): { updatedLiabilities: CompanyLiability[]; totalPaid: number } {
  let totalPaid = 0;
  const updatedLiabilities: CompanyLiability[] = [];

  for (const l of liabilities) {
    if (l.remainingAmount <= 0 || l.monthsRemaining <= 0) {
      continue; // Fully retired loan
    }

    const monthlyInterest = (l.remainingAmount * (l.interestRateAnnual / 12));
    const principalPaid = Math.min(l.remainingAmount, l.monthlyPayment - monthlyInterest);
    const newRemaining = Math.max(0, Math.round(l.remainingAmount - principalPaid));
    const newMonthsRemaining = Math.max(0, l.monthsRemaining - 1);

    totalPaid += l.monthlyPayment;

    if (newRemaining > 0 && newMonthsRemaining > 0) {
      updatedLiabilities.push({
        ...l,
        remainingAmount: newRemaining,
        monthsRemaining: newMonthsRemaining,
      });
    }
  }

  return { updatedLiabilities, totalPaid };
}

/** Assemble full balance sheet */
export function buildBalanceSheet(
  cash: number,
  assets: CompanyAsset[],
  liabilities: CompanyLiability[],
  technologyIPValue: number = 0,
  brandReputationValue: number = 0
): BalanceSheet {
  const totalPhysicalAssets = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.remainingAmount, 0);
  const totalAssets = cash + totalPhysicalAssets + technologyIPValue + brandReputationValue;
  const equity = totalAssets - totalLiabilities;
  const netTangibleBookValue = cash + totalPhysicalAssets - totalLiabilities;
  const debtToEquityRatio = equity > 0 ? Number((totalLiabilities / equity).toFixed(2)) : 999;

  return {
    cash,
    totalPhysicalAssets,
    technologyIPValue,
    brandReputationValue,
    totalAssets,
    totalLiabilities,
    equity,
    netTangibleBookValue,
    debtToEquityRatio,
    assets,
    liabilities,
  };
}
