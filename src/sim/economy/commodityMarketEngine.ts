/**
 * ═══════════════════════════════════════════════════════════════════════
 * COMMODITY MARKET ENGINE — RAW MATERIAL PRICES & MARKET CYCLES
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 2C & Section 14 (Raw Material Market Pricing):
 * Dynamic commodity markets tracking global price fluctuations for:
 * - Industrial steel sheet & roll
 * - Aerospace/automotive grade aluminum
 * - Carbon fiber tow & prepreg
 * - Engineering polymers & vulcanized rubber
 * - Automotive float glass & acoustic laminates
 * - Electrical copper wire & busbars
 * - Rare earth neodymium (magnets & electronics)
 * - Lithium & battery cathode precursor materials
 *
 * Prices adjust dynamically based on:
 * - Historical era inflation & technological scaling (1970 - 2025+)
 * - Macroeconomic phases (Boom, Recession, Oil Shock)
 * - Monthly global commodity volatility
 * - Direct supplier reputation volume discounts
 */

import { MacroEconomicPhase } from "./salesDemandEngine";
import { VehicleBillOfMaterials } from "./variableExpenseEngine";
import { getInflationRecordForDate } from "./historicalInflationData";

export type CommodityType =
  | "STEEL"
  | "ALUMINUM"
  | "CARBON_FIBER"
  | "PLASTICS_RUBBER"
  | "GLASS"
  | "COPPER"
  | "RARE_EARTH"
  | "BATTERY_MATERIALS";

export interface CommodityPriceInfo {
  type: CommodityType;
  name: string;
  unit: string;
  base1970Price: number;
  currentMarketPrice: number;
  effectivePriceWithDiscount: number;
  monthlyTrendPct: number; // e.g. +2.4% this month
  historicalHigh: number;
  historicalLow: number;
}

export const BASE_COMMODITY_PRICES_1970: Record<CommodityType, { name: string; unit: string; price: number }> = {
  STEEL: { name: "Cold-Rolled Automotive Steel", unit: "₹/kg", price: 42 },
  ALUMINUM: { name: "Structural 6000-Series Aluminum", unit: "₹/kg", price: 95 },
  CARBON_FIBER: { name: "T700 Aerospace Carbon Fiber", unit: "₹/kg", price: 1100 },
  PLASTICS_RUBBER: { name: "Engineering Polymers & Rubber", unit: "₹/kg", price: 58 },
  GLASS: { name: "Automotive Safety Laminated Glass", unit: "₹/kg", price: 48 },
  COPPER: { name: "High-Conductivity Copper Wire", unit: "₹/kg", price: 160 },
  RARE_EARTH: { name: "Neodymium & Dysprosium Magnets", unit: "₹/kg", price: 2200 },
  BATTERY_MATERIALS: { name: "NMC811 Battery Precursor", unit: "₹/kg", price: 1350 },
};

/**
 * Macroeconomic multiplier applied to raw materials
 */
export const COMMODITY_MACRO_FACTORS: Record<MacroEconomicPhase, Record<CommodityType, number>> = {
  ECONOMIC_BOOM: {
    STEEL: 1.14,
    ALUMINUM: 1.12,
    CARBON_FIBER: 1.08,
    PLASTICS_RUBBER: 1.10,
    GLASS: 1.06,
    COPPER: 1.18,
    RARE_EARTH: 1.15,
    BATTERY_MATERIALS: 1.16,
  },
  STEADY_GROWTH: {
    STEEL: 1.0,
    ALUMINUM: 1.0,
    CARBON_FIBER: 1.0,
    PLASTICS_RUBBER: 1.0,
    GLASS: 1.0,
    COPPER: 1.0,
    RARE_EARTH: 1.0,
    BATTERY_MATERIALS: 1.0,
  },
  MILD_RECESSION: {
    STEEL: 0.91,
    ALUMINUM: 0.93,
    CARBON_FIBER: 0.95,
    PLASTICS_RUBBER: 0.92,
    GLASS: 0.94,
    COPPER: 0.88,
    RARE_EARTH: 0.92,
    BATTERY_MATERIALS: 0.90,
  },
  STAGFLATION_CRISIS: {
    STEEL: 1.22,
    ALUMINUM: 1.18,
    CARBON_FIBER: 1.12,
    PLASTICS_RUBBER: 1.25,
    GLASS: 1.15,
    COPPER: 1.28,
    RARE_EARTH: 1.20,
    BATTERY_MATERIALS: 1.24,
  },
  OIL_SHOCK: {
    STEEL: 1.25,
    ALUMINUM: 1.28,
    CARBON_FIBER: 1.15,
    PLASTICS_RUBBER: 1.38, // Petrochemical derivative
    GLASS: 1.20,
    COPPER: 1.22,
    RARE_EARTH: 1.14,
    BATTERY_MATERIALS: 1.18,
  },
};

/** Deterministic pseudo-random fluctuation based on year and month */
function getCommodityCycleJitter(type: CommodityType, year: number, month: number): number {
  const seed = (year * 12 + month) * 31 + type.charCodeAt(0) * 17 + type.charCodeAt(1) * 7;
  // Sinusoidal oscillation + slight deterministic noise between -0.06 and +0.06
  const wave = Math.sin(seed * 0.05) * 0.04 + Math.cos(seed * 0.11) * 0.02;
  return 1 + wave;
}

/**
 * Calculate dynamic commodity price for a specific month/year
 */
export function getCommodityPrice(
  type: CommodityType,
  year: number,
  month: number,
  macroPhase: MacroEconomicPhase = "STEADY_GROWTH",
  supplierDiscountPct: number = 0
): CommodityPriceInfo {
  const base = BASE_COMMODITY_PRICES_1970[type];
  const record = getInflationRecordForDate(year, month);

  // Sector-specific historical multiplier grounded in real historical indices
  let sectorIndex = 1.0;
  switch (type) {
    case "STEEL":
    case "ALUMINUM":
      sectorIndex = record.metalsIndex;
      break;
    case "PLASTICS_RUBBER":
      sectorIndex = record.energyPetrochemIndex;
      break;
    case "COPPER":
      sectorIndex = record.metalsIndex * 0.7 + record.electronicsIndex * 0.3;
      break;
    case "RARE_EARTH":
      sectorIndex = record.electronicsIndex * 0.6 + record.metalsIndex * 0.4;
      break;
    case "GLASS":
      sectorIndex = record.automotivePPI;
      break;
    case "CARBON_FIBER":
      sectorIndex = record.compositesIndex;
      break;
    case "BATTERY_MATERIALS":
      sectorIndex = record.electronicsIndex * 0.7 + record.metalsIndex * 0.3;
      break;
    default:
      sectorIndex = record.automotivePPI;
  }

  const inflationFactor = sectorIndex;
  const macroFactor = COMMODITY_MACRO_FACTORS[macroPhase]?.[type] ?? 1.0;
  const cycleJitter = getCommodityCycleJitter(type, year, month);

  const prevCycleJitter = getCommodityCycleJitter(type, month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1);
  const monthlyTrendPct = Math.round(((cycleJitter - prevCycleJitter) / prevCycleJitter) * 1000) / 10;

  const currentMarketPrice = Math.round(base.price * inflationFactor * macroFactor * cycleJitter);
  const discountFactor = Math.max(0.5, 1 - Math.min(0.25, supplierDiscountPct / 100));
  const effectivePriceWithDiscount = Math.round(currentMarketPrice * discountFactor);

  return {
    type,
    name: base.name,
    unit: base.unit,
    base1970Price: base.price,
    currentMarketPrice,
    effectivePriceWithDiscount,
    monthlyTrendPct,
    historicalHigh: Math.round(currentMarketPrice * 1.25),
    historicalLow: Math.round(base.price * 0.9),
  };
}

/**
 * Fetch all commodity prices for current period
 */
export function getAllCommodityPrices(
  year: number,
  month: number,
  macroPhase: MacroEconomicPhase = "STEADY_GROWTH",
  supplierDiscountPct: number = 0
): Record<CommodityType, CommodityPriceInfo> {
  const result: Partial<Record<CommodityType, CommodityPriceInfo>> = {};
  const types: CommodityType[] = [
    "STEEL",
    "ALUMINUM",
    "CARBON_FIBER",
    "PLASTICS_RUBBER",
    "GLASS",
    "COPPER",
    "RARE_EARTH",
    "BATTERY_MATERIALS",
  ];

  for (const t of types) {
    result[t] = getCommodityPrice(t, year, month, macroPhase, supplierDiscountPct);
  }

  return result as Record<CommodityType, CommodityPriceInfo>;
}

/**
 * Calculate dynamic raw material expense for a vehicle BOM using current commodity prices
 */
export function calculateDynamicRawMaterialsCost(
  bom: VehicleBillOfMaterials,
  prices: Record<CommodityType, CommodityPriceInfo>
): {
  steelCost: number;
  aluminumCost: number;
  carbonFiberCost: number;
  plasticsRubberCost: number;
  totalRawMaterialsCost: number;
} {
  const steelCost = Math.round(bom.steelKg * prices.STEEL.effectivePriceWithDiscount);
  const aluminumCost = Math.round(bom.aluminumKg * prices.ALUMINUM.effectivePriceWithDiscount);
  const carbonFiberCost = Math.round(bom.carbonFiberKg * prices.CARBON_FIBER.effectivePriceWithDiscount);
  const plasticsRubberCost = Math.round(bom.plasticsRubberKg * prices.PLASTICS_RUBBER.effectivePriceWithDiscount);

  return {
    steelCost,
    aluminumCost,
    carbonFiberCost,
    plasticsRubberCost,
    totalRawMaterialsCost: steelCost + aluminumCost + carbonFiberCost + plasticsRubberCost,
  };
}
