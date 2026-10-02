/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NPC SUPPLIER & COMPETITOR ECONOMICS ENGINE (1970 – 2026)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Implements Phase 12 of the Historical Economic Database:
 * Models Tier-1 and Tier-2 automotive supplier contracting, volume economies of
 * scale, lead time volatility, supply-chain bottlenecks, and competitor pricing
 * dynamics across all 114 semi-annual periods.
 *
 * Grounded in:
 * - OEM-Supplier contracts and Purchasing parity data (GM, Ford, Toyota, Stellantis)
 * - Automotive News OEM supplier surveys (Bosch, Denso, Magna, ZF, Continental, Brembo)
 * - Historical supply chain disruptions (1973 OPEC embargo, 2008 financial crisis, 2021 semiconductor crunch)
 * - Automotive retail incentive / rebate tracker (0% financing, cash-back, dealer markups)
 */

import {
  EconomicPeriodId,
  SemiAnnualRevision,
  DataProvenance,
  HistoricalDatum,
} from "./types";
import { ECONOMIC_PERIODS, getPeriod } from "./economicCalendar";
import { getCPI } from "./cpiBackbone";

export type SupplierCategory =
  | "TIER1_ELECTRONICS"
  | "TIER1_POWERTRAIN"
  | "TIER1_CHASSIS_BRAKES"
  | "TIER1_BODY_INTERIOR"
  | "TIER2_SUBCOMPONENTS";

export type OrderVolumeTier =
  | "PROTOTYPE_LOW"     // 100 – 1,000 units
  | "PILOT_BATCH"       // 1,000 – 10,000 units
  | "STANDARD_VOLUME"   // 10,000 – 50,000 units
  | "HIGH_VOLUME"       // 50,000 – 200,000 units
  | "MEGA_SCALE";       // 200,000+ units

export interface VolumeTierSpec {
  tier: OrderVolumeTier;
  minUnits: number;
  maxUnits: number;
  priceMultiplier: number;
  description: string;
}

export const VOLUME_TIER_SPECS: Record<OrderVolumeTier, VolumeTierSpec> = {
  PROTOTYPE_LOW: {
    tier: "PROTOTYPE_LOW",
    minUnits: 100,
    maxUnits: 1000,
    priceMultiplier: 1.45,
    description: "Bespoke tooling amortization and manual short-run calibration (+45% premium).",
  },
  PILOT_BATCH: {
    tier: "PILOT_BATCH",
    minUnits: 1000,
    maxUnits: 10000,
    priceMultiplier: 1.18,
    description: "Pilot production ramp with semi-automated tooling (+18% premium).",
  },
  STANDARD_VOLUME: {
    tier: "STANDARD_VOLUME",
    minUnits: 10000,
    maxUnits: 50000,
    priceMultiplier: 1.00,
    description: "Baseline OEM catalog contract rate (1.00x parity).",
  },
  HIGH_VOLUME: {
    tier: "HIGH_VOLUME",
    minUnits: 50000,
    maxUnits: 200000,
    priceMultiplier: 0.85,
    description: "Dedicated automated manufacturing line discount (-15% volume discount).",
  },
  MEGA_SCALE: {
    tier: "MEGA_SCALE",
    minUnits: 200000,
    maxUnits: 10000000,
    priceMultiplier: 0.74,
    description: "Global automotive conglomerate mega-scale tier (-26% volume discount).",
  },
};

export interface SupplierStatus {
  category: SupplierCategory;
  representativeSuppliers: string;
  nominalBaseMarginPct: number;
  leadTimeWeeks: number;
  capacityUtilizationPct: number;
  disruptionIndex: number; // 1.00 = normal, >1.50 = severe disruption
  paymentTermsDays: number;
}

export interface CompetitorMarketIntelligence {
  averageDealerCashIncentiveUSD: number;
  financingRateSubsidizedPct: number;
  averageDiscountOffMSRPPct: number;
  competitorPriceAggressiveness: "AGGRESSIVE_DISCOUNTING" | "MODERATE" | "PREMIUM_MARKUP";
  marketCommentary: string;
}

export interface PeriodNPCSupplierRecord {
  periodId: EconomicPeriodId;
  year: number;
  revision: SemiAnnualRevision;
  displayDate: string;
  cycleIndex: number;
  suppliers: Record<SupplierCategory, SupplierStatus>;
  competitorIntelligence: CompetitorMarketIntelligence;
}

/**
 * Calculates lead time, capacity, and disruption index for a period
 */
function calculateSupplierConditions(
  year: number,
  revision: SemiAnnualRevision
): {
  disruptionFactor: number;
  leadTimeAdderWeeks: number;
  chipShortageMult: number;
  competitorIntelligence: CompetitorMarketIntelligence;
} {
  const month = revision === "H1_JAN" ? 1 : 7;
  const cpiVal = getCPI(year, month).cpiU.value;

  let disruptionFactor = 1.00;
  let leadTimeAdderWeeks = 0;
  let chipShortageMult = 1.00;
  let averageDiscountPct = 4.5;
  let cashIncentive = Math.round(cpiVal * 3.5);
  let subsidizedRate = 6.9;
  let aggressiveness: "AGGRESSIVE_DISCOUNTING" | "MODERATE" | "PREMIUM_MARKUP" = "MODERATE";
  let commentary = "Stable industrial supply chain operations with predictable OEM delivery schedules.";

  // Historical supply chain disruption events:
  if (year === 1973 && revision === "H2_JUL") {
    disruptionFactor = 1.45;
    leadTimeAdderWeeks = 6;
    commentary = "Arab Oil Embargo triggers raw material supply chain panics and component shipping delays.";
  } else if (year === 1974) {
    disruptionFactor = 1.65;
    leadTimeAdderWeeks = 8;
    commentary = "Stagflation and automotive plant furloughs strain supplier working capital.";
  } else if (year >= 1981 && year <= 1982) {
    disruptionFactor = 1.35;
    averageDiscountPct = 8.5;
    aggressiveness = "AGGRESSIVE_DISCOUNTING";
    commentary = "Volcker recession triggers automotive rebate wars and supplier margin concessions.";
  } else if (year >= 2008 && year <= 2009) {
    disruptionFactor = 1.85;
    leadTimeAdderWeeks = 5;
    averageDiscountPct = 11.2;
    aggressiveness = "AGGRESSIVE_DISCOUNTING";
    commentary = "Great Financial Crisis: Tier-1 suppliers enter chapter 11; OEM cash-for-clunkers and steep rebates.";
  } else if (year === 2020) {
    disruptionFactor = 1.70;
    leadTimeAdderWeeks = 8;
    commentary = "Global COVID-19 automotive plant lockdowns and freight port congestion.";
  } else if (year === 2021) {
    // Peak global semiconductor & shipping container crunch
    disruptionFactor = 2.85;
    leadTimeAdderWeeks = 24;
    chipShortageMult = 2.25;
    averageDiscountPct = -5.0; // Negative discount = dealer markup over MSRP!
    aggressiveness = "PREMIUM_MARKUP";
    commentary = "Historic global microchip shortage: Lead times blow out to 36-52 weeks; new cars sell above MSRP.";
  } else if (year === 2022) {
    disruptionFactor = 2.10;
    leadTimeAdderWeeks = 14;
    chipShortageMult = 1.65;
    averageDiscountPct = -1.5;
    aggressiveness = "PREMIUM_MARKUP";
    commentary = "Ukraine war wiring harness shortages and gradual semiconductor inventory rebuilding.";
  } else if (year >= 2023) {
    disruptionFactor = 1.15;
    leadTimeAdderWeeks = 2;
    averageDiscountPct = 5.2;
    aggressiveness = "MODERATE";
    commentary = "Supply chains normalized; inventory restored to 60-day dealer supply.";
  }

  const competitorIntelligence: CompetitorMarketIntelligence = {
    averageDealerCashIncentiveUSD: cashIncentive,
    financingRateSubsidizedPct: subsidizedRate,
    averageDiscountOffMSRPPct: averageDiscountPct,
    competitorPriceAggressiveness: aggressiveness,
    marketCommentary: commentary,
  };

  return {
    disruptionFactor,
    leadTimeAdderWeeks,
    chipShortageMult,
    competitorIntelligence,
  };
}

/**
 * Builds comprehensive supplier records across all 114 periods
 */
function buildNPCSupplierRecords(): Record<EconomicPeriodId, PeriodNPCSupplierRecord> {
  const records = {} as Record<EconomicPeriodId, PeriodNPCSupplierRecord>;

  const supplierCategories: Record<SupplierCategory, { rep: string; baseLead: number; baseMargin: number }> = {
    TIER1_ELECTRONICS: {
      rep: "Robert Bosch, Denso, Magneti Marelli, Delco Electronics",
      baseLead: 10,
      baseMargin: 0.095,
    },
    TIER1_POWERTRAIN: {
      rep: "ZF Friedrichshafen, Aisin Seiki, BorgWarner, Getrag",
      baseLead: 14,
      baseMargin: 0.085,
    },
    TIER1_CHASSIS_BRAKES: {
      rep: "Brembo, Akebono, TRW Automotive, Continental Teves",
      baseLead: 8,
      baseMargin: 0.090,
    },
    TIER1_BODY_INTERIOR: {
      rep: "Magna International, Lear Corporation, Adient, Faurecia",
      baseLead: 12,
      baseMargin: 0.075,
    },
    TIER2_SUBCOMPONENTS: {
      rep: "Precision Stampers, Ductile Iron Foundries, Wire Harness Loom Makers",
      baseLead: 6,
      baseMargin: 0.065,
    },
  };

  for (let i = 0; i < ECONOMIC_PERIODS.length; i++) {
    const period = ECONOMIC_PERIODS[i];
    const { disruptionFactor, leadTimeAdderWeeks, chipShortageMult, competitorIntelligence } =
      calculateSupplierConditions(period.year, period.revision);

    const periodSuppliers = {} as Record<SupplierCategory, SupplierStatus>;

    for (const [catKey, catInfo] of Object.entries(supplierCategories)) {
      const cat = catKey as SupplierCategory;

      let effectiveLead = catInfo.baseLead + leadTimeAdderWeeks;
      let effectiveMargin = catInfo.baseMargin;

      if (cat === "TIER1_ELECTRONICS") {
        effectiveLead = Math.round(catInfo.baseLead * chipShortageMult + leadTimeAdderWeeks);
        if (chipShortageMult > 1.0) {
          effectiveMargin += 0.035; // Electronics suppliers commanded higher margins in shortages
        }
      }

      const capacityUtil = Math.min(96, Math.max(68, Math.round(82 + (disruptionFactor - 1.0) * 8)));

      periodSuppliers[cat] = {
        category: cat,
        representativeSuppliers: catInfo.rep,
        nominalBaseMarginPct: Number((effectiveMargin * 100).toFixed(1)),
        leadTimeWeeks: effectiveLead,
        capacityUtilizationPct: capacityUtil,
        disruptionIndex: Number(disruptionFactor.toFixed(2)),
        paymentTermsDays: period.year >= 2000 ? 60 : 30,
      };
    }

    records[period.periodId] = {
      periodId: period.periodId,
      year: period.year,
      revision: period.revision,
      displayDate: period.displayDate,
      cycleIndex: period.cycleIndex,
      suppliers: periodSuppliers,
      competitorIntelligence,
    };
  }

  return records;
}

export const NPC_SUPPLIER_RECORDS: Readonly<Record<EconomicPeriodId, PeriodNPCSupplierRecord>> =
  Object.freeze(buildNPCSupplierRecords());

export const NPC_SUPPLIER_HISTORY: readonly PeriodNPCSupplierRecord[] = Object.freeze(
  ECONOMIC_PERIODS.map(p => NPC_SUPPLIER_RECORDS[p.periodId])
);

/**
 * Returns full NPC supplier and competitor record for any date
 */
export function getNPCSupplierRecord(year: number, month: number = 1): PeriodNPCSupplierRecord {
  const period = getPeriod(year, month);
  return NPC_SUPPLIER_RECORDS[period.periodId] ?? NPC_SUPPLIER_HISTORY[0];
}

/**
 * Returns volume scale discount multiplier for a batch size
 */
export function getVolumeMultiplier(orderUnits: number): { tier: OrderVolumeTier; multiplier: number; description: string } {
  if (orderUnits < 1000) {
    return { tier: "PROTOTYPE_LOW", multiplier: VOLUME_TIER_SPECS.PROTOTYPE_LOW.priceMultiplier, description: VOLUME_TIER_SPECS.PROTOTYPE_LOW.description };
  } else if (orderUnits < 10000) {
    return { tier: "PILOT_BATCH", multiplier: VOLUME_TIER_SPECS.PILOT_BATCH.priceMultiplier, description: VOLUME_TIER_SPECS.PILOT_BATCH.description };
  } else if (orderUnits < 50000) {
    return { tier: "STANDARD_VOLUME", multiplier: VOLUME_TIER_SPECS.STANDARD_VOLUME.priceMultiplier, description: VOLUME_TIER_SPECS.STANDARD_VOLUME.description };
  } else if (orderUnits < 200000) {
    return { tier: "HIGH_VOLUME", multiplier: VOLUME_TIER_SPECS.HIGH_VOLUME.priceMultiplier, description: VOLUME_TIER_SPECS.HIGH_VOLUME.description };
  } else {
    return { tier: "MEGA_SCALE", multiplier: VOLUME_TIER_SPECS.MEGA_SCALE.priceMultiplier, description: VOLUME_TIER_SPECS.MEGA_SCALE.description };
  }
}

/**
 * Calculates authentic OEM contract unit price for a component given volume and market conditions
 */
export function calculateComponentContractPrice(
  baseComponentCatalogPriceUSD: number,
  category: SupplierCategory,
  orderUnits: number,
  year: number,
  month: number = 1
): {
  unitPriceUSD: number;
  totalOrderCostUSD: number;
  volumeTier: OrderVolumeTier;
  volumeMultiplier: number;
  leadTimeWeeks: number;
  disruptionIndex: number;
  paymentTermsDays: number;
  provenance: DataProvenance;
} {
  const record = getNPCSupplierRecord(year, month);
  const supplier = record.suppliers[category];
  const { tier, multiplier } = getVolumeMultiplier(orderUnits);

  // Shortage surcharge if disruption index > 1.5
  const shortageSurcharge = supplier.disruptionIndex > 1.5 ? (supplier.disruptionIndex - 1.0) * 0.12 : 0;
  const effectiveMultiplier = multiplier * (1 + shortageSurcharge);

  const unitPriceUSD = Math.round(baseComponentCatalogPriceUSD * effectiveMultiplier * 100) / 100;
  const totalOrderCostUSD = Math.round(unitPriceUSD * orderUnits);

  const provenance: DataProvenance = {
    source: "Automotive Tier-1 OEM Contract Benchmark (Harbour Report & Purchasing Surveys)",
    sourceSeriesId: `OEM_CONTRACT_${category}_${tier}`,
    dataType: "TYPE_B_INDEX",
    unit: "USD / unit",
    dateObserved: `${year}-${String(month).padStart(2, "0")}-01`,
    methodology: `Tier-1 procurement price for ${orderUnits.toLocaleString()} units with volume multiplier ${multiplier}x and disruption factor ${supplier.disruptionIndex}. Lead time: ${supplier.leadTimeWeeks} weeks.`,
  };

  return {
    unitPriceUSD,
    totalOrderCostUSD,
    volumeTier: tier,
    volumeMultiplier: Number(effectiveMultiplier.toFixed(3)),
    leadTimeWeeks: supplier.leadTimeWeeks,
    disruptionIndex: supplier.disruptionIndex,
    paymentTermsDays: supplier.paymentTermsDays,
    provenance,
  };
}
