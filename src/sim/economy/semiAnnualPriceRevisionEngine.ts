/**
 * ═══════════════════════════════════════════════════════════════════════
 * BIANNUAL SEMI-ANNUAL PRICE REVISION ENGINE (1970 – 2025+)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 2: Semi-Annual Price Revision System.
 *
 * Every 6 months (1st January and 1st July), the automotive economic ecosystem
 * undergoes a comprehensive price revision across:
 * - 16 Processed & Formed Materials
 * - 8 Primary Raw Commodities
 * - 8 Employee Department Base Salaries
 * - 8 Vehicle Segment Benchmark MSRPs
 * - Corporate Fixed Facility Overhead & Utility Rates
 * - Freight Logistics Tariffs (Truck, Rail, Maritime, Air)
 *
 * Pre-revision warnings fire at T-60 (1 May / 1 Nov) and T-30 (1 Jun / 1 Dec)
 * to reward strategic warehouse stockpiling and forward hedging.
 */

import {
  SemiAnnualPeriod,
  HistoricalInflationRecord,
  getSemiAnnualRecord,
  getNextSemiAnnualRecord,
  getDaysUntilNextRevision,
} from "./historicalInflationData";
import { CommodityType } from "./commodityMarketEngine";
import { EmployeeDepartment } from "./employeeEconomicsEngine";
import { ProcessedMaterialType } from "../trade/tradeTypes";

// ─────────────────────────────────────────────────────────────────────────────
// BASE 1970 ECONOMIC BENCHMARKS (1970 H1_JAN = 1.000)
// Calibrated in nominal USD ($) and converted dynamically when requested.
// ─────────────────────────────────────────────────────────────────────────────

export const BASE_1970_PROCESSED_MATERIALS_USD: Record<ProcessedMaterialType, number> = {
  BASIC_CARBON_STEEL: 220,          // $/tonne
  HIGH_STRENGTH_STEEL: 310,         // Unlocked later (~1980)
  ADVANCED_UHSS_STEEL: 450,         // Unlocked later (~1995)
  DUCTILE_CAST_IRON: 160,           // $/tonne
  ALUMINUM_SHEET_6000: 780,         // $/tonne
  ALUMINUM_FORGING_7000: 1100,      // $/tonne
  MAGNESIUM_ALLOY_CAST: 1450,       // $/tonne
  TITANIUM_GRADE_5: 4500,           // $/tonne (aerospace boutique)
  ENGINEERING_POLYMERS: 240,        // $/tonne
  VULCANIZED_RUBBER: 480,           // $/tonne
  AUTOMOTIVE_FLOAT_GLASS: 190,      // $/tonne
  CARBON_FIBER_PREPREG: 12000,      // $/tonne ($12/kg in early autoclave R&D)
  ELECTROLYTIC_COPPER: 1350,        // $/tonne
  SEMICONDUCTOR_SILICON: 3200,      // $/tonne
  BATTERY_CATHODE_NMC: 5500,        // $/tonne
  BATTERY_ANODE_GRAPHITE: 2800,     // $/tonne
};

export const BASE_1970_COMMODITIES_USD: Record<CommodityType, number> = {
  STEEL: 180,            // Hot-rolled band $/tonne
  ALUMINUM: 620,         // Primary ingot $/tonne
  CARBON_FIBER: 12000,   // Raw precursor $/tonne
  PLASTICS_RUBBER: 380,  // Petrochemical polymers $/tonne
  GLASS: 190,            // Float $/tonne
  COPPER: 1350,          // Cathode grade A $/tonne
  RARE_EARTH: 8500,      // Neodymium oxide $/tonne
  BATTERY_MATERIALS: 5500, // Precursor $/tonne
};

export const BASE_1970_SALARIES_MONTHLY_USD: Record<EmployeeDepartment, number> = {
  ENGINEERING: 1250,     // Senior mechanical engineers ($15k/yr in 1970)
  MANUFACTURING: 680,    // Machine tool operators & assemblers ($4.10/hr)
  RD: 1450,              // Powertrain and aerodynamics researchers ($17.4k/yr)
  MOTORSPORT: 1100,      // Competition mechanics and trackside pit crew
  DESIGN: 1200,          // Clay sculptors & stylists
  MANAGEMENT: 1800,      // Corporate executives & controllers
  SALES: 750,            // Dealer relations and commercial liaisons
  SERVICE: 620,          // Prototype maintenance techs
};

export const BASE_1970_VEHICLE_BENCHMARKS_USD: Record<string, number> = {
  ECONOMY: 2195,         // e.g. Pinto, Vega, Civic
  SEDAN: 3550,           // e.g. Maverick, Chevelle, Dart
  COUPE: 4850,           // e.g. Datsun 240Z, Capri, BMW 2002
  SPORTS: 5200,          // e.g. Corvette C3, Porsche 914
  LUXURY: 9800,          // e.g. Mercedes 280SE, Jaguar XJ6
  SUPERCAR: 21000,       // e.g. Lamborghini Miura, Ferrari Daytona
  SUV: 3450,             // e.g. Ford Bronco, Jeep Wagoneer
  COMMERCIAL: 3100,      // e.g. F-100 Pickup, C-10
};

export const BASE_1970_FACILITIES_OVERHEAD_MONTHLY_USD = {
  hqBaseloadUSD: 3800,
  factoryBaseloadUSD: 5200,
  rdLabBaseloadUSD: 2400,
  testingGroundsBaseloadUSD: 1600,
  corporateInsuranceUSD: 1200,
};

export const BASE_1970_FREIGHT_RATES_PER_TON_KM_USD = {
  truck: 0.045,          // Flexible, short-haul
  rail: 0.016,           // Heavy bulk materials
  maritime: 0.007,       // Intercontinental container
  air: 0.380,            // Emergency expedites
};

// ─────────────────────────────────────────────────────────────────────────────
// REVISION RESULT TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface PriceDeltaItem {
  key: string;
  name: string;
  category: "RAW_MATERIAL" | "COMMODITY" | "LABOR" | "VEHICLE" | "OVERHEAD" | "LOGISTICS";
  oldPriceUSD: number;
  newPriceUSD: number;
  deltaPct: number;
  unit: string;
}

export interface SemiAnnualRevisionSummary {
  revisionId: string;
  year: number;
  period: SemiAnnualPeriod;
  dateStr: string;
  effectiveFrom: string;
  effectiveUntil: string;
  headline: string;
  guidance: string;
  inflationRiskLevel: HistoricalInflationRecord["inflationRiskLevel"];
  macroIndices: {
    cpi: number;
    automotivePPI: number;
    metals: number;
    energy: number;
    labor: number;
    electronics: number;
    composites: number;
  };
  processedMaterials: Record<ProcessedMaterialType, { priceUSD: number; deltaPct: number }>;
  commodities: Record<CommodityType, { priceUSD: number; deltaPct: number }>;
  salaries: Record<EmployeeDepartment, { monthlySalaryUSD: number; deltaPct: number }>;
  vehicleBenchmarks: Record<string, { benchmarkMSRPUSD: number; deltaPct: number }>;
  facilities: {
    hqUSD: number;
    factoryUSD: number;
    rdUSD: number;
    testingUSD: number;
    insuranceUSD: number;
    totalMonthlyOverheadUSD: number;
    deltaPct: number;
  };
  freightRates: {
    truckUSD: number;
    railUSD: number;
    maritimeUSD: number;
    airUSD: number;
    deltaPct: number;
  };
  topIncreases: PriceDeltaItem[];
  topDecreases: PriceDeltaItem[];
  warehouseHedgingOpportunity: {
    recommendedStockpileMaterials: ProcessedMaterialType[];
    potentialCostSavingsPct: number;
    rationale: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// REVISION ENGINE LOGIC
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks whether the current game date is a semi-annual price revision date
 * Fires on 1st January (Cycle A) and 1st July (Cycle B)
 */
export function isSemiAnnualRevisionDate(month: number, day: number): boolean {
  return day === 1 && (month === 1 || month === 7);
}

/**
 * Returns the semi-annual period associated with a calendar month
 */
export function getRevisionPeriodForMonth(month: number): SemiAnnualPeriod {
  return month < 7 ? "H1_JAN" : "H2_JUL";
}

/**
 * Executes a full semi-annual price revision calculation for a specific year and period
 */
export function executeSemiAnnualPriceRevision(
  year: number,
  period: SemiAnnualPeriod,
  previousSummary?: SemiAnnualRevisionSummary
): SemiAnnualRevisionSummary {
  const currentRecord = getSemiAnnualRecord(year, period);
  const nextRecord = getNextSemiAnnualRecord(year, period);
  const revisionId = `REV_${year}_${period}`;
  const dateStr = period === "H1_JAN" ? `1 Jan ${year}` : `1 Jul ${year}`;
  const effectiveFrom = dateStr;
  const effectiveUntil = period === "H1_JAN" ? `30 Jun ${year}` : `31 Dec ${year}`;

  const allDeltas: PriceDeltaItem[] = [];

  // 1. Processed Materials
  const processedMaterials = {} as Record<ProcessedMaterialType, { priceUSD: number; deltaPct: number }>;
  for (const matKey of Object.keys(BASE_1970_PROCESSED_MATERIALS_USD) as ProcessedMaterialType[]) {
    const base = BASE_1970_PROCESSED_MATERIALS_USD[matKey];
    let multiplier = currentRecord.metalsIndex;

    // Apply material-specific index specialization
    if (matKey === "VULCANIZED_RUBBER" || matKey === "ENGINEERING_POLYMERS") {
      multiplier = currentRecord.energyPetrochemIndex;
    } else if (matKey === "CARBON_FIBER_PREPREG") {
      multiplier = currentRecord.compositesIndex;
    } else if (matKey === "SEMICONDUCTOR_SILICON") {
      multiplier = currentRecord.electronicsIndex;
    } else if (matKey === "BATTERY_CATHODE_NMC" || matKey === "BATTERY_ANODE_GRAPHITE") {
      multiplier = currentRecord.batteryMaterialsIndex;
    } else if (matKey === "AUTOMOTIVE_FLOAT_GLASS") {
      multiplier = currentRecord.automotivePPI;
    }

    const priceUSD = Math.round(base * multiplier);
    const oldPrice = previousSummary?.processedMaterials[matKey]?.priceUSD ?? priceUSD;
    const deltaPct = oldPrice > 0 ? Number((((priceUSD - oldPrice) / oldPrice) * 100).toFixed(1)) : 0;

    processedMaterials[matKey] = { priceUSD, deltaPct };
    allDeltas.push({
      key: matKey,
      name: matKey.replace(/_/g, " "),
      category: "RAW_MATERIAL",
      oldPriceUSD: oldPrice,
      newPriceUSD: priceUSD,
      deltaPct,
      unit: "$/t",
    });
  }

  // 2. Commodities
  const commodities = {} as Record<CommodityType, { priceUSD: number; deltaPct: number }>;
  for (const comKey of Object.keys(BASE_1970_COMMODITIES_USD) as CommodityType[]) {
    const base = BASE_1970_COMMODITIES_USD[comKey];
    let multiplier = currentRecord.metalsIndex;

    if (comKey === "PLASTICS_RUBBER") {
      multiplier = currentRecord.energyPetrochemIndex;
    } else if (comKey === "CARBON_FIBER") {
      multiplier = currentRecord.compositesIndex;
    } else if (comKey === "BATTERY_MATERIALS") {
      multiplier = currentRecord.batteryMaterialsIndex;
    } else if (comKey === "GLASS") {
      multiplier = currentRecord.automotivePPI;
    }

    const priceUSD = Math.round(base * multiplier);
    const oldPrice = previousSummary?.commodities[comKey]?.priceUSD ?? priceUSD;
    const deltaPct = oldPrice > 0 ? Number((((priceUSD - oldPrice) / oldPrice) * 100).toFixed(1)) : 0;

    commodities[comKey] = { priceUSD, deltaPct };
    allDeltas.push({
      key: comKey,
      name: comKey.replace(/_/g, " "),
      category: "COMMODITY",
      oldPriceUSD: oldPrice,
      newPriceUSD: priceUSD,
      deltaPct,
      unit: "$/t",
    });
  }

  // 3. Department Salaries
  const salaries = {} as Record<EmployeeDepartment, { monthlySalaryUSD: number; deltaPct: number }>;
  for (const deptKey of Object.keys(BASE_1970_SALARIES_MONTHLY_USD) as EmployeeDepartment[]) {
    const base = BASE_1970_SALARIES_MONTHLY_USD[deptKey];
    const monthlySalaryUSD = Math.round(base * currentRecord.laborWageIndex);
    const oldSal = previousSummary?.salaries[deptKey]?.monthlySalaryUSD ?? monthlySalaryUSD;
    const deltaPct = oldSal > 0 ? Number((((monthlySalaryUSD - oldSal) / oldSal) * 100).toFixed(1)) : 0;

    salaries[deptKey] = { monthlySalaryUSD, deltaPct };
    allDeltas.push({
      key: deptKey,
      name: `${deptKey} Payroll`,
      category: "LABOR",
      oldPriceUSD: oldSal,
      newPriceUSD: monthlySalaryUSD,
      deltaPct,
      unit: "$/mo",
    });
  }

  // 4. Vehicle Segment Benchmarks
  const vehicleBenchmarks = {} as Record<string, { benchmarkMSRPUSD: number; deltaPct: number }>;
  for (const segKey of Object.keys(BASE_1970_VEHICLE_BENCHMARKS_USD)) {
    const base = BASE_1970_VEHICLE_BENCHMARKS_USD[segKey];
    const benchmarkMSRPUSD = Math.round(base * currentRecord.automotivePPI);
    const oldMSRP = previousSummary?.vehicleBenchmarks[segKey]?.benchmarkMSRPUSD ?? benchmarkMSRPUSD;
    const deltaPct = oldMSRP > 0 ? Number((((benchmarkMSRPUSD - oldMSRP) / oldMSRP) * 100).toFixed(1)) : 0;

    vehicleBenchmarks[segKey] = { benchmarkMSRPUSD, deltaPct };
    allDeltas.push({
      key: segKey,
      name: `${segKey} Benchmark MSRP`,
      category: "VEHICLE",
      oldPriceUSD: oldMSRP,
      newPriceUSD: benchmarkMSRPUSD,
      deltaPct,
      unit: "$ MSRP",
    });
  }

  // 5. Facilities Overhead
  const hqUSD = Math.round(BASE_1970_FACILITIES_OVERHEAD_MONTHLY_USD.hqBaseloadUSD * currentRecord.generalCPI);
  const factoryUSD = Math.round(BASE_1970_FACILITIES_OVERHEAD_MONTHLY_USD.factoryBaseloadUSD * currentRecord.generalCPI);
  const rdUSD = Math.round(BASE_1970_FACILITIES_OVERHEAD_MONTHLY_USD.rdLabBaseloadUSD * currentRecord.generalCPI);
  const testingUSD = Math.round(BASE_1970_FACILITIES_OVERHEAD_MONTHLY_USD.testingGroundsBaseloadUSD * currentRecord.generalCPI);
  const insuranceUSD = Math.round(BASE_1970_FACILITIES_OVERHEAD_MONTHLY_USD.corporateInsuranceUSD * currentRecord.generalCPI);
  const totalMonthlyOverheadUSD = hqUSD + factoryUSD + rdUSD + testingUSD + insuranceUSD;
  const oldOverhead = previousSummary?.facilities.totalMonthlyOverheadUSD ?? totalMonthlyOverheadUSD;
  const facilityDeltaPct = oldOverhead > 0 ? Number((((totalMonthlyOverheadUSD - oldOverhead) / oldOverhead) * 100).toFixed(1)) : 0;

  // 6. Freight Logistics
  const truckUSD = Number((BASE_1970_FREIGHT_RATES_PER_TON_KM_USD.truck * currentRecord.energyPetrochemIndex).toFixed(4));
  const railUSD = Number((BASE_1970_FREIGHT_RATES_PER_TON_KM_USD.rail * currentRecord.generalCPI).toFixed(4));
  const maritimeUSD = Number((BASE_1970_FREIGHT_RATES_PER_TON_KM_USD.maritime * currentRecord.energyPetrochemIndex).toFixed(4));
  const airUSD = Number((BASE_1970_FREIGHT_RATES_PER_TON_KM_USD.air * currentRecord.energyPetrochemIndex).toFixed(4));
  const oldTruck = previousSummary?.freightRates.truckUSD ?? truckUSD;
  const freightDeltaPct = oldTruck > 0 ? Number((((truckUSD - oldTruck) / oldTruck) * 100).toFixed(1)) : 0;

  // Sort deltas for player briefings
  const sortedIncreases = [...allDeltas].filter((d) => d.deltaPct > 0).sort((a, b) => b.deltaPct - a.deltaPct);
  const sortedDecreases = [...allDeltas].filter((d) => d.deltaPct < 0).sort((a, b) => a.deltaPct - b.deltaPct);

  // Strategic Warehouse Hedging Opportunity
  // Evaluates which materials are about to surge in the NEXT revision
  const recommendedStockpileMaterials: ProcessedMaterialType[] = [];
  let maxNextSurgePct = 0;

  if (nextRecord.energyPetrochemIndex > currentRecord.energyPetrochemIndex * 1.06) {
    recommendedStockpileMaterials.push("VULCANIZED_RUBBER", "ENGINEERING_POLYMERS");
    maxNextSurgePct = Math.max(
      maxNextSurgePct,
      ((nextRecord.energyPetrochemIndex - currentRecord.energyPetrochemIndex) / currentRecord.energyPetrochemIndex) * 100
    );
  }
  if (nextRecord.metalsIndex > currentRecord.metalsIndex * 1.05) {
    recommendedStockpileMaterials.push("BASIC_CARBON_STEEL", "DUCTILE_CAST_IRON", "ALUMINUM_SHEET_6000");
    maxNextSurgePct = Math.max(
      maxNextSurgePct,
      ((nextRecord.metalsIndex - currentRecord.metalsIndex) / currentRecord.metalsIndex) * 100
    );
  }

  let rationale = "Commodity markets projected stable. Safety stock buffer sufficient.";
  if (recommendedStockpileMaterials.length > 0) {
    rationale = `Upcoming price hike projected for next revision (~+${maxNextSurgePct.toFixed(1)}%). Filling warehouse space prior to next cycle will protect assembly unit margins.`;
  }

  return {
    revisionId,
    year,
    period,
    dateStr,
    effectiveFrom,
    effectiveUntil,
    headline: currentRecord.headlineEvent,
    guidance: currentRecord.economicGuidance,
    inflationRiskLevel: currentRecord.inflationRiskLevel,
    macroIndices: {
      cpi: currentRecord.generalCPI,
      automotivePPI: currentRecord.automotivePPI,
      metals: currentRecord.metalsIndex,
      energy: currentRecord.energyPetrochemIndex,
      labor: currentRecord.laborWageIndex,
      electronics: currentRecord.electronicsIndex,
      composites: currentRecord.compositesIndex,
    },
    processedMaterials,
    commodities,
    salaries,
    vehicleBenchmarks,
    facilities: {
      hqUSD,
      factoryUSD,
      rdUSD,
      testingUSD,
      insuranceUSD,
      totalMonthlyOverheadUSD,
      deltaPct: facilityDeltaPct,
    },
    freightRates: {
      truckUSD,
      railUSD,
      maritimeUSD,
      airUSD,
      deltaPct: freightDeltaPct,
    },
    topIncreases: sortedIncreases.slice(0, 5),
    topDecreases: sortedDecreases.slice(0, 5),
    warehouseHedgingOpportunity: {
      recommendedStockpileMaterials,
      potentialCostSavingsPct: Number(maxNextSurgePct.toFixed(1)),
      rationale,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// REVISION HISTORY LEDGER
// Stores executed revisions for auditing, player review, and financial graphs
// ─────────────────────────────────────────────────────────────────────────────

const REVISION_HISTORY: SemiAnnualRevisionSummary[] = [];

/** Record an executed revision into history */
export function recordExecutedRevision(summary: SemiAnnualRevisionSummary): void {
  const existingIdx = REVISION_HISTORY.findIndex((r) => r.revisionId === summary.revisionId);
  if (existingIdx >= 0) {
    REVISION_HISTORY[existingIdx] = summary;
  } else {
    REVISION_HISTORY.push(summary);
  }
}

/** Get the latest executed revision */
export function getLatestExecutedRevision(): SemiAnnualRevisionSummary | null {
  if (REVISION_HISTORY.length === 0) return null;
  return REVISION_HISTORY[REVISION_HISTORY.length - 1];
}

/** Get the complete revision history ledger */
export function getRevisionHistory(): SemiAnnualRevisionSummary[] {
  return [...REVISION_HISTORY];
}

/** Reset revision history (used in test teardown or new game init) */
export function resetRevisionHistory(): void {
  REVISION_HISTORY.length = 0;
}
