/**
 * ═══════════════════════════════════════════════════════════════════════
 * AFTER-SALES ENGINE — SERVICING, SPARE PARTS & WARRANTY CASH FLOW
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 8: The installed vehicle parc revenue model.
 *
 * Once cars are in customers' hands, they generate high-margin recurring
 * revenue every month: scheduled maintenance, genuine replacement parts,
 * extended warranty packages, official performance accessories, and fleet servicing.
 */

export interface InstalledParcProfile {
  totalActiveVehiclesOnRoad: number; // The cumulative fleet on the road
  averageAgeMonths: number;
  officialDealerRetentionPct: number; // % who service at official dealers
  customerSatisfactionScore: number;  // 0-100
  reliabilityReputationScore: number; // 0-100 (affects warranty claims)
}

export interface AfterSalesMonthlyResult {
  activeParcSize: number;
  scheduledServicingRevenue: number;
  sparePartsRevenue: number;
  extendedWarrantiesSoldRevenue: number;
  accessoriesAndRetrofitsRevenue: number;
  totalGrossAfterSalesRevenue: number;

  // Costs
  sparePartsBOMCost: number;
  warrantyClaimsPaidOut: number;      // High if reliability reputation is low
  dealerServiceTechnicianLabor: number;
  totalAfterSalesExpenses: number;

  netAfterSalesProfit: number;
  profitMarginPct: number;
}

/**
 * Calculate monthly after-sales financial performance across the active vehicle parc
 */
export function calculateMonthlyAfterSales(
  profile: InstalledParcProfile
): AfterSalesMonthlyResult {
  const {
    totalActiveVehiclesOnRoad,
    averageAgeMonths,
    officialDealerRetentionPct,
    customerSatisfactionScore,
    reliabilityReputationScore,
  } = profile;

  if (totalActiveVehiclesOnRoad <= 0) {
    return {
      activeParcSize: 0,
      scheduledServicingRevenue: 0,
      sparePartsRevenue: 0,
      extendedWarrantiesSoldRevenue: 0,
      accessoriesAndRetrofitsRevenue: 0,
      totalGrossAfterSalesRevenue: 0,
      sparePartsBOMCost: 0,
      warrantyClaimsPaidOut: 0,
      dealerServiceTechnicianLabor: 0,
      totalAfterSalesExpenses: 0,
      netAfterSalesProfit: 0,
      profitMarginPct: 0,
    };
  }

  // Active servicing population: vehicles visiting official dealer network
  // Newer cars (under 36 months) visit dealer at 85%+; older cars drift away unless satisfaction is high
  const ageRetentionDecay = Math.max(0.35, 1.0 - (averageAgeMonths / 120) * 0.5);
  const effectiveDealerRetention = (officialDealerRetentionPct / 100) * ageRetentionDecay * (customerSatisfactionScore / 70);
  const vehiclesVisitingDealerMonthly = Math.round(totalActiveVehiclesOnRoad * (effectiveDealerRetention / 12)); // ~1 visit/year

  // 1. Scheduled Servicing: ~₹4,500 average visit ticket
  const scheduledServicingRevenue = vehiclesVisitingDealerMonthly * 4500;

  // 2. Spare Parts Sales (consumables: brakes, filters, fluids, suspension arms)
  // Higher age = higher parts consumption
  const agePartsFactor = 1.0 + Math.min(2.0, averageAgeMonths / 48);
  const sparePartsRevenue = Math.round(vehiclesVisitingDealerMonthly * 3200 * agePartsFactor);

  // 3. Extended Warranties sold (~3.5% of cars annually)
  const warrantyBuyersMonthly = Math.round((totalActiveVehiclesOnRoad * 0.035) / 12);
  const extendedWarrantiesSoldRevenue = warrantyBuyersMonthly * 24000;

  // 4. Factory Accessories (aerokits, luggage, performance exhausts, wheels)
  const accessoriesAndRetrofitsRevenue = Math.round(vehiclesVisitingDealerMonthly * 1400);

  const totalGrossAfterSalesRevenue =
    scheduledServicingRevenue +
    sparePartsRevenue +
    extendedWarrantiesSoldRevenue +
    accessoriesAndRetrofitsRevenue;

  // ──── EXPENSES ────
  // Cost of spare parts inventory sold (~40% of retail price)
  const sparePartsBOMCost = Math.round(sparePartsRevenue * 0.40);

  // Warranty claims: reliability reputation reduces defect claims drastically!
  // At 90 rep, warranty claims are tiny (0.4% rate); at 30 rep, defect surge costs millions
  const defectRate = Math.max(0.003, 0.045 - (reliabilityReputationScore / 100) * 0.038);
  const warrantyClaimsPaidOut = Math.round(totalActiveVehiclesOnRoad * defectRate * 6800);

  // Labor overhead for dealer master technicians
  const dealerServiceTechnicianLabor = Math.round(scheduledServicingRevenue * 0.35);

  const totalAfterSalesExpenses = sparePartsBOMCost + warrantyClaimsPaidOut + dealerServiceTechnicianLabor;
  const netAfterSalesProfit = Math.max(0, totalGrossAfterSalesRevenue - totalAfterSalesExpenses);
  const profitMarginPct = totalGrossAfterSalesRevenue > 0
    ? Number(((netAfterSalesProfit / totalGrossAfterSalesRevenue) * 100).toFixed(1))
    : 0;

  return {
    activeParcSize: totalActiveVehiclesOnRoad,
    scheduledServicingRevenue,
    sparePartsRevenue,
    extendedWarrantiesSoldRevenue,
    accessoriesAndRetrofitsRevenue,
    totalGrossAfterSalesRevenue,
    sparePartsBOMCost,
    warrantyClaimsPaidOut,
    dealerServiceTechnicianLabor,
    totalAfterSalesExpenses,
    netAfterSalesProfit,
    profitMarginPct,
  };
}
