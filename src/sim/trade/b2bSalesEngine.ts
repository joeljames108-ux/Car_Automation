/**
 * ═══════════════════════════════════════════════════════════════════════
 * B2B COMPONENT SALES & COMPETITOR OEM SUPPLY ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 20 & 21:
 * - Selling in-house manufactured engines, transaxles, castings, or alloy sheet
 *   to competitor NPC automakers
 * - Financial Advantage: Significant recurring B2B monthly revenue stream
 * - Strategic Trade-Off: Supplying competitors directly increases their vehicle
 *   ratings and sales competitiveness in the marketplace!
 */

import { B2BCustomerContract, ComponentCategory, ProcessedMaterialType, SubassemblyType } from "./tradeTypes";

export interface B2BOpportunity {
  id: string;
  npcBuyerName: string;
  buyerCountry: string;
  vehicleSegment: string;
  requestedComponent: ComponentCategory | SubassemblyType | ProcessedMaterialType;
  componentName: string;
  requestedMonthlyVolume: number;
  offeredPricePerUnitINR: number;
  durationMonths: number;
  marketReputationRequirement: number;
  competitorTechBoost: number; // e.g. +3.5% competitor demand boost
  description: string;
}

export const AVAILABLE_B2B_OPPORTUNITIES: B2BOpportunity[] = [
  {
    id: "b2b_orion_sedan_engines",
    npcBuyerName: "Orion Motors Corp.",
    buyerCountry: "United States",
    vehicleSegment: "SEDAN",
    requestedComponent: "ENGINE_POWERTRAIN_ASSEMBLY",
    componentName: "2.5L DOHC Executive 4-Cylinder Engine",
    requestedMonthlyVolume: 25,
    offeredPricePerUnitINR: 195000,
    durationMonths: 24,
    marketReputationRequirement: 60,
    competitorTechBoost: 4.2,
    description: "Orion Motors is launching their flagship executive sedan and lacks in-house engine casting capacity. They offer a 2-year guaranteed supply contract.",
  },
  {
    id: "b2b_meridian_transaxles",
    npcBuyerName: "Meridian Automobili",
    buyerCountry: "Italy",
    vehicleSegment: "COUPE",
    requestedComponent: "TRANSAXLE_GEARBOX_ASSEMBLY",
    componentName: "5-Speed Close-Ratio Sport Transaxle",
    requestedMonthlyVolume: 12,
    offeredPricePerUnitINR: 140000,
    durationMonths: 36,
    marketReputationRequirement: 70,
    competitorTechBoost: 6.5,
    description: "Boutique Italian sports brand requires 12 units/month of our race-proven transaxle. Lucrative revenue, but directly sharpens our chief sports coupe rival.",
  },
  {
    id: "b2b_titan_iron_castings",
    npcBuyerName: "Titan Heavy Commercial Ltd.",
    buyerCountry: "Germany",
    vehicleSegment: "COMMERCIAL",
    requestedComponent: "DUCTILE_CAST_IRON",
    componentName: "Heavy Ductile Iron Caliper & Hub Castings",
    requestedMonthlyVolume: 40, // tonnes
    offeredPricePerUnitINR: 68000,
    durationMonths: 12,
    marketReputationRequirement: 55,
    competitorTechBoost: 1.0,
    description: "Commercial van and utility builder seeking 40 tonnes/month of foundry surplus iron. Safe non-competing industrial revenue.",
  },
  {
    id: "b2b_corsa_carbon_aero",
    npcBuyerName: "Corsa Competizione Privateers",
    buyerCountry: "United Kingdom",
    vehicleSegment: "SPORTS",
    requestedComponent: "CHASSIS_BODY_PANELS",
    componentName: "Aerodynamic Carbon Diffusers & Splitters",
    requestedMonthlyVolume: 6,
    offeredPricePerUnitINR: 380000,
    durationMonths: 18,
    marketReputationRequirement: 78,
    competitorTechBoost: 8.0,
    description: "Independent Le Mans privateer racing outfit seeking custom aerodynamic composite supply. High profit margin, high track visibility.",
  },
];

export interface B2BFulfillmentResult {
  totalDeliveredUnits: number;
  totalB2BRevenueINR: number;
  activeContractsCount: number;
  onTimeDeliveryRatePct: number;
  competitorSalesBoostAvg: number;
}

/** Process monthly deliveries and financial realization for all active B2B contracts */
export function processMonthlyB2BFulfillments(
  contracts: B2BCustomerContract[],
  inventoryCheckPass: boolean = true
): B2BFulfillmentResult {
  let totalRevenue = 0;
  let totalUnits = 0;
  let totalBoost = 0;

  for (const c of contracts) {
    const fulfilledUnits = inventoryCheckPass ? c.monthlyUnits : Math.floor(c.monthlyUnits * 0.7);
    const revenue = fulfilledUnits * c.pricePerUnit;

    totalRevenue += revenue;
    totalUnits += fulfilledUnits;
    totalBoost += c.competitorTechBoost;
  }

  const avgBoost = contracts.length > 0 ? parseFloat((totalBoost / contracts.length).toFixed(1)) : 0;
  const onTimeRate = inventoryCheckPass ? 100 : 70;

  return {
    totalDeliveredUnits: totalUnits,
    totalB2BRevenueINR: Math.round(totalRevenue),
    activeContractsCount: contracts.length,
    onTimeDeliveryRatePct: onTimeRate,
    competitorSalesBoostAvg: avgBoost,
  };
}
