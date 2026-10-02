/**
 * ═══════════════════════════════════════════════════════════════════════
 * MONTHLY REPUTATION UPDATE — OPERATIONAL PERFORMANCE FEEDBACK LOOP
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 4D & Section 24:
 * Updates corporate perception across the 17 dimensions based on:
 * - Contract fulfillment rate (on-time delivery vs default) → contracts reputation
 * - Customer warranty claim severity → reliability & engineering reputation
 * - Vehicle demand vs capacity → commercialTrust & design reputation
 * - Motorsport results → motorsport, engineering & performance reputation
 * - Employee payroll & workforce satisfaction → employer reputation
 * - Liquid cash runway solvency → commercialTrust reputation
 *
 * Reputation changes are bounded to ±0.8 points per dimension per month,
 * reflecting the reality that corporate prestige is earned over years.
 */

import { ReputationDimensionKey } from "../../state/reputationEngine";
import { useReputationStore } from "../../state/reputationStore";

export interface MonthlyReputationInput {
  month: number;
  year: number;
  contractsFulfillmentRatePct: number; // e.g. 100%
  warrantyClaimRatio: number;          // warranty claims as % of vehicle revenue
  vehicleSalesCapacityUtilizationPct: number; // units sold / monthly capacity
  motorsportActive: boolean;
  motorsportStanding?: number;         // 1 = 1st, 12 = 12th
  cashHealthStatus: "HEALTHY" | "STABLE" | "WARNING" | "CRITICAL" | "INSOLVENT";
  marketingAwareness: number;          // 0-100
}

export interface DimensionDeltaReport {
  dimension: ReputationDimensionKey;
  label: string;
  previousScore: number;
  delta: number;
  newScore: number;
  reason: string;
}

export function calculateMonthlyReputationDeltas(
  input: MonthlyReputationInput
): DimensionDeltaReport[] {
  const repStore = useReputationStore.getState();
  const currentDims = repStore.dimensions;
  const reports: DimensionDeltaReport[] = [];

  const addDelta = (dim: ReputationDimensionKey, label: string, rawDelta: number, reason: string) => {
    // Bound delta to max +/- 0.8 per month
    const delta = Number(Math.max(-0.8, Math.min(0.8, rawDelta)).toFixed(2));
    if (Math.abs(delta) < 0.05) return;
    const cur = currentDims[dim]?.score ?? 30;
    const newScore = Number(Math.max(5, Math.min(100, cur + delta)).toFixed(1));
    reports.push({
      dimension: dim,
      label,
      previousScore: cur,
      delta,
      newScore,
      reason,
    });
  };

  // 1. Contracts fulfillment
  if (input.contractsFulfillmentRatePct >= 98) {
    addDelta("contracts", "B2B Contracting", +0.3, "100% on-time B2B supply deliveries");
  } else if (input.contractsFulfillmentRatePct < 85) {
    addDelta("contracts", "B2B Contracting", -0.5, "Supply delivery deficits or missed quotas");
  }

  // 2. Warranty / Reliability
  if (input.warrantyClaimRatio > 0.08) {
    addDelta("reliability", "Product Reliability", -0.6, "Elevated warranty defect claims across fleet");
    addDelta("engineering", "Engineering Prowess", -0.3, "Component field failures");
  } else if (input.warrantyClaimRatio < 0.02) {
    addDelta("reliability", "Product Reliability", +0.2, "Outstanding low defect warranty claims");
  }

  // 3. Commercial Trust & Sales
  if (input.vehicleSalesCapacityUtilizationPct >= 90) {
    addDelta("commercialTrust", "Commercial Trust", +0.3, "High consumer demand absorbing factory output");
  } else if (input.vehicleSalesCapacityUtilizationPct < 50) {
    addDelta("commercialTrust", "Commercial Trust", -0.2, "Unsold vehicle inventory accumulating");
  }

  // 4. Cash Solvency impact
  if (input.cashHealthStatus === "CRITICAL" || input.cashHealthStatus === "INSOLVENT") {
    addDelta("commercialTrust", "Commercial Trust", -0.7, "Market concerns regarding liquidity & solvency");
  } else if (input.cashHealthStatus === "HEALTHY") {
    addDelta("commercialTrust", "Commercial Trust", +0.1, "Strong balance sheet liquidity");
  }

  // 5. Motorsport
  if (input.motorsportActive && input.motorsportStanding !== undefined) {
    if (input.motorsportStanding <= 3) {
      addDelta("motorsport", "Motorsport Heritage", +0.6, "Podium championship performance");
      addDelta("performance", "Vehicle Performance", +0.4, "Track-proven race engineering");
    } else if (input.motorsportStanding <= 6) {
      addDelta("motorsport", "Motorsport Heritage", +0.2, "Competitive mid-field racing finishes");
    }
  }

  // 6. Marketing Awareness feedback
  if (input.marketingAwareness >= 60) {
    addDelta("design", "Styling & Design Acclaim", +0.1, "High brand market visibility");
  }

  return reports;
}

/** Apply the monthly reputation deltas to the master reputation store */
export function applyMonthlyReputationUpdates(
  input: MonthlyReputationInput
): DimensionDeltaReport[] {
  const reports = calculateMonthlyReputationDeltas(input);
  if (reports.length === 0) return [];

  const deltasMap: Partial<Record<ReputationDimensionKey, number>> = {};
  for (const r of reports) {
    deltasMap[r.dimension] = r.delta;
  }

  useReputationStore.getState().triggerReputationShock({
    title: `Monthly Operational Review (${input.month}/${input.year})`,
    category: "commercialTrust",
    impactType: reports.some((r) => r.delta < 0) ? "negative" : "positive",
    deltas: deltasMap,
    pressHeadline: `Automotive industry analysts review ${input.year} operational progress`,
    mediaOutlet: "Automotive Industry Financial Review",
  });

  return reports;
}
