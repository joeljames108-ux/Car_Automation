/**
 * ═══════════════════════════════════════════════════════════════════════
 * MARKETING & BRAND AWARENESS ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 3A & Section 16:
 * Marketing creates Brand Awareness. Awareness magnifies sales demand.
 * Formula: Demand = Base Demand × Awareness Multiplier × Reputation Factor × Product Quality
 *
 * Spending Categories:
 * - Print & Media Advertising (TV, Radio, Periodicals)
 * - Dealer Co-op Incentives & Showroom Merchandising
 * - New Vehicle Launch Blitz Campaigns
 * - Motorsport Racing Cross-Promotion
 * - Corporate Prestige & Brand Equity Campaigns
 */

import { create } from "zustand";

export type MarketingChannel =
  | "PRINT_AND_MEDIA"
  | "DEALER_INCENTIVES"
  | "LAUNCH_CAMPAIGNS"
  | "MOTORSPORT_PROMOTION"
  | "BRAND_EQUITY";

export interface MarketingBudgetPlan {
  totalMonthlySpend: number;
  channelAllocations: Record<MarketingChannel, number>; // percentages summing to 100
}

export interface MarketingMonthlyReport {
  month: number;
  year: number;
  totalSpend: number;
  channelSpend: Record<MarketingChannel, number>;
  startingAwareness: number;
  awarenessGain: number;
  awarenessDecay: number;
  endingAwareness: number;
  demandMultiplier: number; // e.g. 0.85 to 1.35
  reputationContribution: number;
}

export const INITIAL_1970_MARKETING_PLAN: MarketingBudgetPlan = {
  totalMonthlySpend: 60000, // ₹60k/month in 1970
  channelAllocations: {
    PRINT_AND_MEDIA: 40,
    DEALER_INCENTIVES: 25,
    LAUNCH_CAMPAIGNS: 15,
    MOTORSPORT_PROMOTION: 10,
    BRAND_EQUITY: 10,
  },
};

export interface MarketingState {
  currentAwareness: number; // 0-100 (starts at 5 in 1970)
  budgetPlan: MarketingBudgetPlan;
  monthlyHistory: MarketingMonthlyReport[];
  setMonthlySpend: (spend: number) => void;
  setChannelAllocation: (channel: MarketingChannel, pct: number) => void;
  processMonthlyMarketing: (month: number, year: number, motorsportActive: boolean) => MarketingMonthlyReport;
  resetTo1970: () => void;
}

/**
 * Calculate awareness growth and resulting demand multiplier
 */
export function calculateMarketingMonth(
  startingAwareness: number,
  plan: MarketingBudgetPlan,
  month: number,
  year: number,
  motorsportActive: boolean
): MarketingMonthlyReport {
  const spend = Math.max(0, plan.totalMonthlySpend);
  const channelSpend: Record<MarketingChannel, number> = {
    PRINT_AND_MEDIA: Math.round((spend * (plan.channelAllocations.PRINT_AND_MEDIA ?? 0)) / 100),
    DEALER_INCENTIVES: Math.round((spend * (plan.channelAllocations.DEALER_INCENTIVES ?? 0)) / 100),
    LAUNCH_CAMPAIGNS: Math.round((spend * (plan.channelAllocations.LAUNCH_CAMPAIGNS ?? 0)) / 100),
    MOTORSPORT_PROMOTION: Math.round((spend * (plan.channelAllocations.MOTORSPORT_PROMOTION ?? 0)) / 100),
    BRAND_EQUITY: Math.round((spend * (plan.channelAllocations.BRAND_EQUITY ?? 0)) / 100),
  };

  // Era scaling: ₹10k in 1970 goes much further than ₹10k in 2010
  const eraDeflator = Math.pow(1.025, Math.max(0, year - 1970));
  const realEffectiveSpend = spend / eraDeflator;

  // Diminishing returns: square root curve
  // ₹100,000 normalized spend generates ~3.1 points of awareness per month
  const rawGain = Math.sqrt(realEffectiveSpend / 800) * 0.35;
  const motorsportBonus = motorsportActive ? 0.4 : 0;
  const awarenessGain = Number((rawGain + motorsportBonus).toFixed(2));

  // Natural monthly awareness decay (-1.2% of current awareness)
  const awarenessDecay = Number((startingAwareness * 0.012).toFixed(2));

  const endingAwareness = Math.min(100, Math.max(2, Number((startingAwareness + awarenessGain - awarenessDecay).toFixed(1))));

  // Demand multiplier: 0 to 100 maps to 0.75x to 1.35x
  // Awareness of 50 gives ~1.05x demand
  const demandMultiplier = Number((0.75 + (endingAwareness / 100) * 0.60).toFixed(3));

  // Small brand equity reputation contribution (up to +0.2/mo)
  const reputationContribution = spend > 100000 ? 0.2 : spend > 30000 ? 0.1 : 0;

  return {
    month,
    year,
    totalSpend: spend,
    channelSpend,
    startingAwareness,
    awarenessGain,
    awarenessDecay,
    endingAwareness,
    demandMultiplier,
    reputationContribution,
  };
}

export const useMarketingStore = create<MarketingState>((set, get) => ({
  currentAwareness: 8, // Initial fledgling awareness
  budgetPlan: { ...INITIAL_1970_MARKETING_PLAN },
  monthlyHistory: [],

  setMonthlySpend: (spend) => {
    set((state) => ({
      budgetPlan: { ...state.budgetPlan, totalMonthlySpend: Math.max(0, spend) },
    }));
  },

  setChannelAllocation: (channel, pct) => {
    set((state) => ({
      budgetPlan: {
        ...state.budgetPlan,
        channelAllocations: {
          ...state.budgetPlan.channelAllocations,
          [channel]: Math.max(0, Math.min(100, pct)),
        },
      },
    }));
  },

  processMonthlyMarketing: (month, year, motorsportActive) => {
    const state = get();
    const report = calculateMarketingMonth(
      state.currentAwareness,
      state.budgetPlan,
      month,
      year,
      motorsportActive
    );
    set({
      currentAwareness: report.endingAwareness,
      monthlyHistory: [report, ...state.monthlyHistory.slice(0, 23)], // keep 24 months
    });
    return report;
  },

  resetTo1970: () => {
    set({
      currentAwareness: 8,
      budgetPlan: { ...INITIAL_1970_MARKETING_PLAN },
      monthlyHistory: [],
    });
  },
}));
