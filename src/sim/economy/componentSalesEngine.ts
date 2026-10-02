/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMPONENT SALES ENGINE — B2B POWERTRAIN & OEM SUPPLY CONTRACTS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 4: Selling engines, gearboxes, platforms, suspension,
 * and electronics packages to other carmakers, boutique coachbuilders,
 * and racing constructors.
 */

export type SellableComponent =
  | "ENGINE"
  | "TRANSMISSION"
  | "BATTERY"
  | "ELECTRONICS"
  | "SUSPENSION"
  | "BRAKES"
  | "AERO_COMPONENTS"
  | "CHASSIS";

export type ComponentBuyerType =
  | "BOUTIQUE_OEM"
  | "TIER1_ASSEMBLER"
  | "RACING_CONSTRUCTOR"
  | "COMMERCIAL_FLEET";

export interface ComponentSupplyContract {
  id: string;
  buyerName: string;
  buyerType: ComponentBuyerType;
  componentType: SellableComponent;
  componentName: string;
  unitsPerMonth: number;
  unitPrice: number;
  unitCostToProduce: number;
  contractDurationMonths: number;
  monthsElapsed: number;
  qualityTolerancePpm: number;
  reputationRequirement: number;
  status: "ACTIVE" | "COMPLETED" | "BREACHED";
}

export interface ComponentSalesSummary {
  totalMonthlyUnitsDelivered: number;
  totalMonthlyRevenue: number;
  totalMonthlyProductionCost: number;
  monthlyGrossProfit: number;
  grossMarginPct: number;
  activeContractsCount: number;
  contractDetails: Array<{
    contractId: string;
    buyerName: string;
    componentName: string;
    monthlyRevenue: number;
    monthlyProfit: number;
    remainingMonths: number;
  }>;
}

/** Process active B2B component contracts for the month */
export function processComponentSupplyContracts(
  contracts: ComponentSupplyContract[]
): {
  updatedContracts: ComponentSupplyContract[];
  summary: ComponentSalesSummary;
} {
  let totalUnits = 0;
  let totalRevenue = 0;
  let totalCost = 0;
  const contractDetails: ComponentSalesSummary["contractDetails"] = [];
  const updatedContracts: ComponentSupplyContract[] = [];

  for (const c of contracts) {
    if (c.status !== "ACTIVE") continue;

    const monthlyRev = c.unitsPerMonth * c.unitPrice;
    const monthlyCost = c.unitsPerMonth * c.unitCostToProduce;
    const monthlyProfit = monthlyRev - monthlyCost;

    totalUnits += c.unitsPerMonth;
    totalRevenue += monthlyRev;
    totalCost += monthlyCost;

    const newElapsed = c.monthsElapsed + 1;
    const isCompleted = newElapsed >= c.contractDurationMonths;

    updatedContracts.push({
      ...c,
      monthsElapsed: newElapsed,
      status: isCompleted ? "COMPLETED" : "ACTIVE",
    });

    contractDetails.push({
      contractId: c.id,
      buyerName: c.buyerName,
      componentName: c.componentName,
      monthlyRevenue: monthlyRev,
      monthlyProfit: monthlyProfit,
      remainingMonths: Math.max(0, c.contractDurationMonths - newElapsed),
    });
  }

  const grossProfit = totalRevenue - totalCost;
  const marginPct = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(1)) : 0;

  return {
    updatedContracts,
    summary: {
      totalMonthlyUnitsDelivered: totalUnits,
      totalMonthlyRevenue: totalRevenue,
      totalMonthlyProductionCost: totalCost,
      monthlyGrossProfit: grossProfit,
      grossMarginPct: marginPct,
      activeContractsCount: updatedContracts.filter((c) => c.status === "ACTIVE").length,
      contractDetails,
    },
  };
}

/** Generate procedurally available OEM purchase tenders based on Engineering & Manufacturing reputation */
export function generateAvailableComponentTenders(
  engineeringScore: number,
  manufacturingScore: number,
  year: number
): ComponentSupplyContract[] {
  const tenders: ComponentSupplyContract[] = [];

  // Boutique carmaker engine supply (requires Engineering >= 40)
  if (engineeringScore >= 40) {
    tenders.push({
      id: `tender_engine_boutique_${year}_${Math.random().toString(36).substring(2, 6)}`,
      buyerName: "Iso Automobili Specialist GT",
      buyerType: "BOUTIQUE_OEM",
      componentType: "ENGINE",
      componentName: "High-Output V8 Powertrain Crate Assembly",
      unitsPerMonth: 25,
      unitPrice: 125000,
      unitCostToProduce: 72000,
      contractDurationMonths: 24,
      monthsElapsed: 0,
      qualityTolerancePpm: 120,
      reputationRequirement: 40,
      status: "ACTIVE",
    });
  }

  // Commercial fleet chassis supply (requires Manufacturing >= 50)
  if (manufacturingScore >= 50) {
    tenders.push({
      id: `tender_chassis_fleet_${year}_${Math.random().toString(36).substring(2, 6)}`,
      buyerName: "Continental Municipal Services",
      buyerType: "COMMERCIAL_FLEET",
      componentType: "CHASSIS",
      componentName: "Heavy-Duty Ladder Frame Assembly",
      unitsPerMonth: 120,
      unitPrice: 65000,
      unitCostToProduce: 41000,
      contractDurationMonths: 36,
      monthsElapsed: 0,
      qualityTolerancePpm: 250,
      reputationRequirement: 50,
      status: "ACTIVE",
    });
  }

  // Racing constructor aero supply (requires Engineering >= 70)
  if (engineeringScore >= 70) {
    tenders.push({
      id: `tender_aero_racing_${year}_${Math.random().toString(36).substring(2, 6)}`,
      buyerName: "Scuderia Corse Privata",
      buyerType: "RACING_CONSTRUCTOR",
      componentType: "AERO_COMPONENTS",
      componentName: "Dry-Carbon Splitter & Venturi Tunnel Kit",
      unitsPerMonth: 10,
      unitPrice: 220000,
      unitCostToProduce: 110000,
      contractDurationMonths: 12,
      monthsElapsed: 0,
      qualityTolerancePpm: 50,
      reputationRequirement: 70,
      status: "ACTIVE",
    });
  }

  return tenders;
}
