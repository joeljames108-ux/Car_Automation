/**
 * ═══════════════════════════════════════════════════════════════════════
 * VERTICAL INTEGRATION & MATERIAL RECYCLING ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 6, 7, 23 & 24:
 * - 3 Strategic Manufacturing Paradigms:
 *   1. VERTICAL_INTEGRATION (Own in-house mills, foundry cells, stamping dies)
 *   2. SUPPLIER_BASED (Procure all components from Tier-1 suppliers)
 *   3. HYBRID (In-house core powertrains & unibody, procure tyres/glass/silicon)
 * - Scrap & Recycling Loops: Stamping trimmings & swarf recovered into clean ingots
 * - Material utilization efficiency curves
 */

import { ProcessedMaterialType } from "./tradeTypes";

export type ManufacturingIntegrationParadigm = "VERTICAL_INTEGRATION" | "SUPPLIER_BASED" | "HYBRID";

export interface InHouseIndustrialFacility {
  id: string;
  name: string;
  facilityType: "STEEL_ROLLING_MILL" | "ALUMINUM_SMELTER" | "FOUNDRY_ENGINE_SHOP" | "RECYCLING_FOUNDRY";
  monthlyInputTonnes: number;
  monthlyOutputTonnes: number;
  energyCostPerTonneINR: number;
  laborCostMonthlyINR: number;
  scrapGenerationRatePct: number; // e.g. 15% offcut stamping scrap
  isActive: boolean;
  capitalCostINR: number;
}

export const INITIAL_IN_HOUSE_FACILITIES: InHouseIndustrialFacility[] = [
  {
    id: "fac_foundry_shop",
    name: "Founding Prototype Foundry & Machine Shop",
    facilityType: "FOUNDRY_ENGINE_SHOP",
    monthlyInputTonnes: 45,
    monthlyOutputTonnes: 38,
    energyCostPerTonneINR: 14000,
    laborCostMonthlyINR: 180000,
    scrapGenerationRatePct: 15.5,
    isActive: true,
    capitalCostINR: 4500000,
  },
];

export interface ScrapRecyclingResult {
  rawScrapGeneratedTonnes: number;
  recycledMaterialOutputTonnes: number;
  recoveredMaterialType: ProcessedMaterialType;
  virginOreCostSavedINR: number;
  recyclingEnergyCostINR: number;
  netRecyclingBenefitINR: number;
}

/**
 * Calculates scrap metal trimmings generated during stamping and CNC milling,
 * and simulates in-house recycling furnace recovery.
 */
export function calculateScrapRecovery(
  materialType: ProcessedMaterialType,
  totalConsumedTonnes: number,
  scrapRatePct: number = 16.0,
  hasRecyclingFacility: boolean = true
): ScrapRecyclingResult {
  const rawScrap = parseFloat(((totalConsumedTonnes * scrapRatePct) / 100).toFixed(2));

  if (!hasRecyclingFacility || rawScrap <= 0) {
    return {
      rawScrapGeneratedTonnes: rawScrap,
      recycledMaterialOutputTonnes: 0,
      recoveredMaterialType: materialType,
      virginOreCostSavedINR: 0,
      recyclingEnergyCostINR: 0,
      netRecyclingBenefitINR: 0,
    };
  }

  // Recovery furnace recovers 92% of clean scrap
  const recoveredTonnes = parseFloat((rawScrap * 0.92).toFixed(2));

  // Virgin ore costs saved based on market price
  let virginCostPerTonne = 52000;
  let furnaceEnergyPerTonne = 12000; // Electric arc furnace melts scrap at 1/3 virgin energy

  if (materialType.includes("ALUMINUM")) {
    virginCostPerTonne = 185000;
    furnaceEnergyPerTonne = 24000; // Aluminium recycling saves 95% of bauxite smelting energy!
  } else if (materialType.includes("STEEL")) {
    virginCostPerTonne = 65000;
    furnaceEnergyPerTonne = 14000;
  }

  const costSaved = Math.round(recoveredTonnes * virginCostPerTonne);
  const energyCost = Math.round(recoveredTonnes * furnaceEnergyPerTonne);
  const netBenefit = costSaved - energyCost;

  return {
    rawScrapGeneratedTonnes: rawScrap,
    recycledMaterialOutputTonnes: recoveredTonnes,
    recoveredMaterialType: materialType,
    virginOreCostSavedINR: costSaved,
    recyclingEnergyCostINR: energyCost,
    netRecyclingBenefitINR: netBenefit,
  };
}
