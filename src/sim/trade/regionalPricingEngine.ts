/**
 * ═══════════════════════════════════════════════════════════════════════
 * REGIONAL & GEOGRAPHIC PRICING ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements geographic economic reality:
 * 1. Mines, smelters, refineries, and supplier clusters have distinct
 *    production economics (cheap hydro in Nordic vs. high labor in Bavaria).
 * 2. True Landed Cost: FOB (Free On Board) minehead price + Multi-modal
 *    Freight Distance + Port/Tariff Handling = Factory Delivered Cost.
 * 3. Dynamic regional macroeconomic shocks (strikes, port bottlenecks,
 *    energy crises, canal closures) shifting local market spot prices.
 * 4. Landed Supplier Optimizer: Solves the best balance of base price vs.
 *    freight penalty across transport corridors (Rail vs. Road vs. Maritime).
 */

import {
  INDUSTRIAL_REGIONS,
  FREIGHT_MODES,
  calculateFreightShipment,
} from "./logisticsRouteEngine";
import { BASELINE_MARKET_PRICES } from "./tradeContractEngine";
import {
  ProcessedMaterialType,
  ComponentCategory,
  FreightTransportMode,
  SupplierProfile,
} from "./tradeTypes";

// ═══════════════════════════════════════════════════════════════════════
// 1. REGIONAL COST MODIFIERS BY MATERIAL CLASS
// ═══════════════════════════════════════════════════════════════════════

export interface RegionalCostProfile {
  regionId: string;
  regionName: string;
  energyCostIndex: number;         // 1.00 baseline; <1 cheaper electricity/gas
  laborCostIndex: number;          // 1.00 baseline; >1 skilled/expensive labor
  environmentalTariffPct: number;  // Carbon/pollution tariffs added to raw processing
  materialCostModifiers: Partial<Record<ProcessedMaterialType, number>>;
  specialtyBonusDescription: string;
}

export const REGIONAL_COST_PROFILES: Record<string, RegionalCostProfile> = {
  "Rhine Industrial Valley": {
    regionId: "rhine_valley",
    regionName: "Rhine Industrial Valley",
    energyCostIndex: 1.05,
    laborCostIndex: 1.08,
    environmentalTariffPct: 4.0,
    materialCostModifiers: {
      BASIC_CARBON_STEEL: 0.96,       // Massive coking blast furnaces
      DUCTILE_CAST_IRON: 0.94,        // Local foundries
      ALUMINUM_SHEET_6000: 1.12,      // High electricity cost for smelters
      VULCANIZED_RUBBER: 1.04,
      ELECTROLYTIC_COPPER: 1.00,
    },
    specialtyBonusDescription: "Blast furnace steel and heavy casting foundries adjacent to main railway.",
  },

  "Nordic Hydropower Cluster": {
    regionId: "nordic_cluster",
    regionName: "Nordic Hydropower Cluster",
    energyCostIndex: 0.65,           // Abundant cheap renewable hydro power
    laborCostIndex: 1.15,
    environmentalTariffPct: 0.0,     // Zero carbon tariff penalty
    materialCostModifiers: {
      ALUMINUM_SHEET_6000: 0.84,      // Ultra-cheap green hydro smelting (-16%)
      AUTOMOTIVE_FLOAT_GLASS: 0.90,   // Clean electric arc glass furnaces
      BASIC_CARBON_STEEL: 1.08,       // Far from coal basins
      TITANIUM_GRADE_5: 0.88,         // Energy-intensive reduction
    },
    specialtyBonusDescription: "Lowest-cost green aluminium smelting in Europe with zero carbon penalties.",
  },

  "Coastal Megaport Terminal": {
    regionId: "coastal_port",
    regionName: "Coastal Megaport Terminal",
    energyCostIndex: 0.98,
    laborCostIndex: 1.02,
    environmentalTariffPct: 2.5,
    materialCostModifiers: {
      VULCANIZED_RUBBER: 0.88,        // Direct ocean tanker import from SE Asia
      ENGINEERING_POLYMERS: 0.92,     // Coastal petrochemical cracking plants
      BASIC_CARBON_STEEL: 1.02,
      ALUMINUM_SHEET_6000: 1.00,
    },
    specialtyBonusDescription: "Deepwater container docks and petrochemical cracking refineries.",
  },

  "Bavarian Precision Valley": {
    regionId: "bavarian_valley",
    regionName: "Bavarian Precision Valley",
    energyCostIndex: 1.08,
    laborCostIndex: 1.22,           // Master toolmakers & engineers
    environmentalTariffPct: 3.0,
    materialCostModifiers: {
      HIGH_STRENGTH_STEEL: 1.08,      // Tightest Class-A tolerances (+8% price, zero defects)
      ELECTROLYTIC_COPPER: 0.94,      // Precision wire drawing clusters
      ENGINEERING_POLYMERS: 1.06,
    },
    specialtyBonusDescription: "World-class tool & die machining and electronic subassembly engineering.",
  },

  "Pacific Export Corridor": {
    regionId: "pacific_corridor",
    regionName: "Pacific Export Corridor (Japan/Asia)",
    energyCostIndex: 0.88,
    laborCostIndex: 0.78,
    environmentalTariffPct: 6.0,    // Import customs and maritime emissions tariff
    materialCostModifiers: {
      ADVANCED_UHSS_STEEL: 0.86,      // Mega-scale Japanese UHSS rolling mills
      HIGH_STRENGTH_STEEL: 0.88,
      ALUMINUM_SHEET_6000: 0.92,
      ELECTROLYTIC_COPPER: 0.82,
    },
    specialtyBonusDescription: "Ultra-high volume Asian manufacturing with massive raw material scale.",
  },

  "Alpine Specialty Metallurgy": {
    regionId: "alpine_cluster",
    regionName: "Alpine Specialty Metallurgy",
    energyCostIndex: 0.82,
    laborCostIndex: 1.18,
    environmentalTariffPct: 1.5,
    materialCostModifiers: {
      TITANIUM_GRADE_5: 0.86,
      CARBON_FIBER_PREPREG: 0.89,
      ALUMINUM_SHEET_6000: 0.94,
    },
    specialtyBonusDescription: "Aerospace-grade autoclave curing and vacuum metallurgy furnaces.",
  },
};

// ═══════════════════════════════════════════════════════════════════════
// 2. MACROECONOMIC REGIONAL SHOCKS & EVENTS
// ═══════════════════════════════════════════════════════════════════════

export interface RegionalMacroShock {
  id: string;
  title: string;
  affectedRegion: string;
  affectedMaterialCategory?: string;
  fobPriceMultiplier: number;
  freightCostMultiplier: number;
  durationMonths: number;
  description: string;
}

export const MACRO_REGIONAL_SHOCKS: Record<string, RegionalMacroShock> = {
  RUHR_COAL_MINERS_STRIKE: {
    id: "RUHR_COAL_MINERS_STRIKE",
    title: "Ruhr Basin Heavy Miners Strike",
    affectedRegion: "Rhine Industrial Valley",
    affectedMaterialCategory: "STEEL",
    fobPriceMultiplier: 1.28,         // +28% spike in local steel prices
    freightCostMultiplier: 1.15,
    durationMonths: 3,
    description: "Union walkouts at blast furnaces choke local hot-rolled coil supply, spiking spot prices.",
  },

  NORDIC_RESERVOIR_DROUGHT: {
    id: "NORDIC_RESERVOIR_DROUGHT",
    title: "Nordic Winter Hydro Freeze",
    affectedRegion: "Nordic Hydropower Cluster",
    affectedMaterialCategory: "ALUMINUM",
    fobPriceMultiplier: 1.22,
    freightCostMultiplier: 1.10,
    durationMonths: 4,
    description: "Severe freeze reduces hydro turbine capacity, forcing aluminum smelters onto high spot tariffs.",
  },

  ROTTERDAM_DOCK_CONGESTION: {
    id: "ROTTERDAM_DOCK_CONGESTION",
    title: "Coastal Deepwater Port Congestion",
    affectedRegion: "Coastal Megaport Terminal",
    affectedMaterialCategory: "ALL",
    fobPriceMultiplier: 1.08,
    freightCostMultiplier: 1.45,      // +45% freight delay demurrage
    durationMonths: 2,
    description: "Container ship backlog creates severe customs demurrage and container unloader delays.",
  },

  SUEZ_CANAL_DISRUPTION: {
    id: "SUEZ_CANAL_DISRUPTION",
    title: "Pacific Oceanic Shipping Route Blockage",
    affectedRegion: "Pacific Export Corridor",
    affectedMaterialCategory: "ALL",
    fobPriceMultiplier: 1.12,
    freightCostMultiplier: 1.65,      // Ships forced around Cape of Good Hope
    durationMonths: 5,
    description: "Maritime shipping rerouted around Cape of Good Hope adds 14 days and heavy bunker fuel surcharges.",
  },
};

// ═══════════════════════════════════════════════════════════════════════
// 3. LANDED COST CALCULATION & COMPARISON
// ═══════════════════════════════════════════════════════════════════════

export interface LandedCostBreakdown {
  materialKey: ProcessedMaterialType | ComponentCategory;
  quantityTonnes: number;
  regionKey: string;
  regionName: string;
  baseMarketPriceINR: number;
  regionalFOBPricePerTonne: number;
  fobPricePerTonne: number;
  totalFOBPurchaseCost: number;
  transportMode: FreightTransportMode;
  freightCostTotal: number;
  freightCostPerTonne: number;
  portAndCustomsTariffTotal: number;
  landedCostTotal: number;
  landedCostPerTonne: number;
  transitTimeDays: number;
  activeShockNotice?: string;
}

/**
 * Calculates authentic Landed Delivered Cost for any material from any region.
 * Delivered Cost = FOB Minehead + Regional Modifiers + Inbound Freight + Tariffs.
 */
export function calculateMaterialLandedCost(
  materialKey: ProcessedMaterialType | ComponentCategory,
  quantityTonnes: number,
  regionKey: string,
  transportMode: FreightTransportMode = "ROAD_TRUCK",
  hasFactoryRailSpur: boolean = false,
  activeShocks: RegionalMacroShock[] = []
): LandedCostBreakdown {
  const basePricePerUnit = BASELINE_MARKET_PRICES[materialKey] ?? 60_000;
  const regionProfile = REGIONAL_COST_PROFILES[regionKey] ?? REGIONAL_COST_PROFILES["Rhine Industrial Valley"];
  const regionInfo = INDUSTRIAL_REGIONS[regionKey] ?? INDUSTRIAL_REGIONS["Rhine Industrial Valley"];

  // 1. Regional Cost Index
  let materialModifier = 1.0;
  if (materialKey in regionProfile.materialCostModifiers) {
    materialModifier = regionProfile.materialCostModifiers[materialKey as ProcessedMaterialType] ?? 1.0;
  }

  // 2. Active Macro Shocks affecting this region
  let shockMultiplier = 1.0;
  let freightShockMultiplier = 1.0;
  let activeNotice: string | undefined = undefined;

  for (const shock of activeShocks) {
    if (shock.affectedRegion === regionKey) {
      shockMultiplier *= shock.fobPriceMultiplier;
      freightShockMultiplier *= shock.freightCostMultiplier;
      activeNotice = `${shock.title}: +${Math.round((shock.fobPriceMultiplier - 1) * 100)}% FOB`;
    }
  }

  // Calculate FOB unit price
  const fobPricePerTonne = Math.round(basePricePerUnit * materialModifier * shockMultiplier);
  const totalFOBPurchaseCost = fobPricePerTonne * quantityTonnes;

  // 3. Multi-modal Freight Calculation
  const freightCalc = calculateFreightShipment(
    regionKey,
    quantityTonnes,
    transportMode,
    hasFactoryRailSpur
  );

  const freightCostTotal = Math.round(freightCalc.netFreightCostINR * freightShockMultiplier);
  const freightCostPerTonne = Math.round(freightCostTotal / Math.max(1, quantityTonnes));

  // 4. Customs & Environmental Tariffs
  const tariffRate = (regionProfile.environmentalTariffPct ?? 0) / 100;
  const portAndCustomsTariffTotal = Math.round(totalFOBPurchaseCost * tariffRate);

  // 5. Total Landed Cost
  const landedCostTotal = totalFOBPurchaseCost + freightCostTotal + portAndCustomsTariffTotal;
  const landedCostPerTonne = Math.round(landedCostTotal / Math.max(1, quantityTonnes));

  return {
    materialKey,
    quantityTonnes,
    regionKey,
    regionName: regionInfo.name,
    baseMarketPriceINR: basePricePerUnit,
    regionalFOBPricePerTonne: fobPricePerTonne,
    fobPricePerTonne,
    totalFOBPurchaseCost,
    transportMode,
    freightCostTotal,
    freightCostPerTonne,
    portAndCustomsTariffTotal,
    landedCostTotal,
    landedCostPerTonne,
    transitTimeDays: freightCalc.transitDurationDays,
    activeShockNotice: activeNotice,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// 4. SUPPLIER LANDED COST COMPARATOR
// ═══════════════════════════════════════════════════════════════════════

export interface SupplierLandedComparison {
  supplier: SupplierProfile;
  landedCost: LandedCostBreakdown;
  savingsVsBenchmarkPct: number;
  recommendedTransportMode: FreightTransportMode;
  rank: number;
}

/**
 * Compares landed delivered prices across all suppliers offering a material,
 * optimizing freight modes (Rail vs Road) to find the cheapest factory door price.
 */
export function compareSuppliersLandedCost(
  materialKey: ProcessedMaterialType | ComponentCategory,
  quantityTonnes: number,
  suppliers: SupplierProfile[],
  hasFactoryRailSpur: boolean,
  activeShocks: RegionalMacroShock[] = []
): SupplierLandedComparison[] {
  // Benchmark is central market baseline with road freight at 250km
  const benchmarkBase = BASELINE_MARKET_PRICES[materialKey] ?? 60_000;
  const benchmarkFreight = quantityTonnes * 250 * FREIGHT_MODES.ROAD_TRUCK.costPerTonneKmINR;
  const benchmarkTotal = (benchmarkBase * quantityTonnes) + benchmarkFreight;

  const results: SupplierLandedComparison[] = [];

  for (const sup of suppliers) {
    if (!sup.specializations.includes(materialKey)) continue;

    // Determine optimal transport mode based on rail spur and port access
    const region = INDUSTRIAL_REGIONS[sup.regionCluster];
    let optimalMode: FreightTransportMode = "ROAD_TRUCK";

    if (region && region.distanceFromFactoryKm > 3000) {
      optimalMode = "MARITIME_RORO";
    } else if (hasFactoryRailSpur && region && region.hasDirectRailLink) {
      optimalMode = "HEAVY_RAIL";
    }

    const landed = calculateMaterialLandedCost(
      materialKey,
      quantityTonnes,
      sup.regionCluster,
      optimalMode,
      hasFactoryRailSpur,
      activeShocks
    );

    // Apply supplier quality factor
    const qualityComposite = Math.round(
      (sup.baseQualityVector.strength +
        sup.baseQualityVector.consistency +
        sup.baseQualityVector.purity) / 3
    );
    const qualityFactor = 1 + ((qualityComposite - 75) / 100) * 0.15;
    const finalLandedTotal = Math.round(landed.landedCostTotal * qualityFactor);
    const finalLandedPerTonne = Math.round(finalLandedTotal / Math.max(1, quantityTonnes));

    const adjustedLanded: LandedCostBreakdown = {
      ...landed,
      landedCostTotal: finalLandedTotal,
      landedCostPerTonne: finalLandedPerTonne,
    };

    const savingsPct = Math.round(((benchmarkTotal - finalLandedTotal) / benchmarkTotal) * 100);

    results.push({
      supplier: sup,
      landedCost: adjustedLanded,
      savingsVsBenchmarkPct: savingsPct,
      recommendedTransportMode: optimalMode,
      rank: 0,
    });
  }

  // Sort from cheapest to most expensive landed cost
  results.sort((a, b) => a.landedCost.landedCostTotal - b.landedCost.landedCostTotal);
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return results;
}
