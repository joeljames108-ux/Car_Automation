/**
 * ═══════════════════════════════════════════════════════════════════════
 * CUSTOMER LOYALTY ENGINE — INSTALLED PARC & REPEAT PURCHASE DYNAMICS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 27:
 *
 * Automotive sales are not single-event transactions.
 * A customer who purchases a reliable, exhilarating car returns 3 to 5 years
 * later to purchase their next vehicle with zero acquisition cost.
 *
 * Conversely, an owner whose transmission fails on the highway tells friends,
 * posts scathing reviews, and defects permanently to a competing brand.
 */

export interface CustomerCohort {
  yearSold: number;
  modelName: string;
  initialUnitsSold: number;
  activeUnitsRemaining: number;
  averageSatisfactionScore: number; // 0-100
  reportedFaultsPer100Cars: number;  // Initial quality study
  repeatPurchaseLikelihoodPct: number;
}

export interface CustomerLoyaltyState {
  totalHistoricalVehiclesSold: number;
  activeVehiclesOnRoad: number;
  averageFleetSatisfactionScore: number;
  netPromoterScore: number;           // -100 to +100
  brandEvangelistCount: number;       // Enthusiasts actively promoting the marque
  repeatPurchaseRatePct: number;      // 0 - 85%
  wordOfMouthAcquisitionMultiplier: number; // 1.0 to 1.45x
  cohorts: CustomerCohort[];
}

export const INITIAL_1970_LOYALTY: CustomerLoyaltyState = {
  totalHistoricalVehiclesSold: 0,
  activeVehiclesOnRoad: 0,
  averageFleetSatisfactionScore: 70,
  netPromoterScore: 25,
  brandEvangelistCount: 15, // A handful of founding prototype collectors
  repeatPurchaseRatePct: 40,
  wordOfMouthAcquisitionMultiplier: 1.0,
  cohorts: [],
};

/**
 * Register a newly sold batch of vehicles into the active customer fleet
 */
export function registerSoldVehicles(
  state: CustomerLoyaltyState,
  year: number,
  modelName: string,
  unitsSold: number,
  vehicleQuality: number,
  vehicleReliability: number
): CustomerLoyaltyState {
  if (unitsSold <= 0) return state;

  const baseSatisfaction = Math.round(vehicleQuality * 0.55 + vehicleReliability * 0.45);
  const faultsPer100 = Math.max(5, Math.round(180 - vehicleReliability * 1.6));
  const repeatProb = Math.min(85, Math.max(10, Math.round((baseSatisfaction - 30) * 1.2)));

  const newCohort: CustomerCohort = {
    yearSold: year,
    modelName,
    initialUnitsSold: unitsSold,
    activeUnitsRemaining: unitsSold,
    averageSatisfactionScore: baseSatisfaction,
    reportedFaultsPer100Cars: faultsPer100,
    repeatPurchaseLikelihoodPct: repeatProb,
  };

  const updatedCohorts = [...state.cohorts, newCohort];
  const totalSold = state.totalHistoricalVehiclesSold + unitsSold;
  const activeRoad = state.activeVehiclesOnRoad + unitsSold;

  // NPS formula: Promoters (>80 satisfaction) minus Detractors (<50 satisfaction)
  let totalPromoters = 0;
  let totalDetractors = 0;
  let totalSatisfactionWeighted = 0;

  for (const c of updatedCohorts) {
    totalSatisfactionWeighted += c.averageSatisfactionScore * c.activeUnitsRemaining;
    if (c.averageSatisfactionScore >= 80) totalPromoters += c.activeUnitsRemaining;
    else if (c.averageSatisfactionScore < 50) totalDetractors += c.activeUnitsRemaining;
  }

  const avgSatisfaction = activeRoad > 0
    ? Math.round(totalSatisfactionWeighted / activeRoad)
    : 70;

  const nps = activeRoad > 0
    ? Math.round(((totalPromoters - totalDetractors) / activeRoad) * 100)
    : 20;

  const repeatRate = Math.min(80, Math.max(15, Math.round((avgSatisfaction - 35) * 1.15)));
  const wordOfMouth = Number((1.0 + Math.max(0, nps / 250)).toFixed(2));
  const evangelists = Math.round(totalPromoters * 0.08);

  return {
    totalHistoricalVehiclesSold: totalSold,
    activeVehiclesOnRoad: activeRoad,
    averageFleetSatisfactionScore: avgSatisfaction,
    netPromoterScore: nps,
    brandEvangelistCount: evangelists,
    repeatPurchaseRatePct: repeatRate,
    wordOfMouthAcquisitionMultiplier: wordOfMouth,
    cohorts: updatedCohorts,
  };
}

/**
 * Age the installed customer fleet by 1 year (attrition, scrappage, aging satisfaction)
 */
export function ageCustomerFleetByYear(
  state: CustomerLoyaltyState,
  currentYear: number
): CustomerLoyaltyState {
  let activeRoad = 0;
  let totalSatisfactionWeighted = 0;
  let totalPromoters = 0;
  let totalDetractors = 0;

  const updatedCohorts: CustomerCohort[] = state.cohorts.map((c) => {
    const ageYears = currentYear - c.yearSold;
    // Standard vehicle survival curve (~3-5% scrappage/accidents per year)
    const annualSurvivalRate = Math.max(0.85, 0.97 - (ageYears > 15 ? 0.08 : 0));
    const newRemaining = Math.round(c.activeUnitsRemaining * annualSurvivalRate);

    // Minor satisfaction degradation if older cars experience wear & tear
    const newSatisfaction = Math.max(25, Math.round(c.averageSatisfactionScore - (ageYears > 6 ? 1.5 : 0)));

    activeRoad += newRemaining;
    totalSatisfactionWeighted += newSatisfaction * newRemaining;
    if (newSatisfaction >= 80) totalPromoters += newRemaining;
    else if (newSatisfaction < 50) totalDetractors += newRemaining;

    return {
      ...c,
      activeUnitsRemaining: newRemaining,
      averageSatisfactionScore: newSatisfaction,
    };
  }).filter((c) => c.activeUnitsRemaining > 0);

  const avgSatisfaction = activeRoad > 0
    ? Math.round(totalSatisfactionWeighted / activeRoad)
    : 70;

  const nps = activeRoad > 0
    ? Math.round(((totalPromoters - totalDetractors) / activeRoad) * 100)
    : 20;

  return {
    ...state,
    activeVehiclesOnRoad: activeRoad,
    averageFleetSatisfactionScore: avgSatisfaction,
    netPromoterScore: nps,
    brandEvangelistCount: Math.round(totalPromoters * 0.08),
    repeatPurchaseRatePct: Math.min(80, Math.max(15, Math.round((avgSatisfaction - 35) * 1.15))),
    wordOfMouthAcquisitionMultiplier: Number((1.0 + Math.max(0, nps / 250)).toFixed(2)),
    cohorts: updatedCohorts,
  };
}
