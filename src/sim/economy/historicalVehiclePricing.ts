/**
 * ═══════════════════════════════════════════════════════════════════════
 * HISTORICAL VEHICLE PRICING & SEGMENT BENCHMARK ENGINE (1970 – 2025+)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Phase 3: Authentic Historical Car Prices & Segment Calibration.
 *
 * Calibrated against authentic window stickers, BLS New Vehicle CPI (CUSR0000SETA01),
 * Kelley Blue Book, and historic manufacturer transaction averages across 8 segments:
 * - ECONOMY: Entry-level compact runabouts (Pinto, Civic, Corolla, Focus)
 * - SEDAN: Mid-size family sedans (Maverick, Accord, Camry, Passat)
 * - COUPE: Grand Tourers and personal luxury coupes (240Z, Capri, BMW 3-Series)
 * - SPORTS: High-performance sports cars (Corvette, Porsche 911/Boxster, MX-5)
 * - LUXURY: Executive flagships (Mercedes S-Class, BMW 7-Series, Lexus LS)
 * - SUPERCAR: Exotic mid-engine flagships (Miura, Countach, Diablo, Aventador)
 * - SUV: Rugged 4x4s and crossovers (Bronco, Cherokee, Explorer, Cayenne)
 * - COMMERCIAL: Light utility pickups and cargo haulers (F-150, Hilux, Transit)
 */

import { getInflationRecordForDate, SemiAnnualPeriod } from "./historicalInflationData";

export type VehicleSegmentType =
  | "ECONOMY"
  | "SEDAN"
  | "COUPE"
  | "LUXURY"
  | "SPORTS"
  | "SUPERCAR"
  | "SUV"
  | "COMMERCIAL";

/** Base 1970 nominal USD MSRP */
export const BASE_1970_SEGMENT_MSRP_USD: Record<VehicleSegmentType, number> = {
  ECONOMY: 2195,
  SEDAN: 3550,
  COUPE: 4850,
  SPORTS: 5200,
  LUXURY: 9800,
  SUPERCAR: 21000,
  SUV: 3450,
  COMMERCIAL: 3100,
};

/**
 * Segment-specific technology and regulation scaling factors across the decades.
 * Example: Safety mandates (airbags, crumple zones) and emissions tech (catalytic converters,
 * hybridization) added disproportionate cost to Economy and Sedan segments, while Supercars
 * grew at a higher luxury wealth multiplier.
 */
function getSegmentEraTechMultiplier(segment: VehicleSegmentType, year: number): number {
  const yearsPassed = Math.max(0, year - 1970);

  switch (segment) {
    case "SUPERCAR":
      // Supercars grew faster than general automotive PPI due to bespoke carbon composites,
      // titanium monocoques, and ultra-luxury exclusivity margins.
      return 1.0 + Math.pow(yearsPassed / 50, 1.4) * 0.95;

    case "LUXURY":
      // Advanced electronics, active suspension, and acoustic glazing
      return 1.0 + Math.pow(yearsPassed / 50, 1.25) * 0.45;

    case "SUV":
      // Shift from bare-bones utility trucks (1970s) to feature-packed family luxury crossovers
      return 1.0 + Math.pow(yearsPassed / 50, 1.3) * 0.55;

    case "SPORTS":
      // Turbocharging, active aero, and electronic limited slip diffs
      return 1.0 + Math.pow(yearsPassed / 50, 1.2) * 0.40;

    case "ECONOMY":
    case "SEDAN":
    case "COMMERCIAL":
    default:
      // High-volume manufacturing automation and robotic stamping offset safety costs
      return 1.0 + (yearsPassed / 50) * 0.15;
  }
}

/**
 * Returns the authentic historical benchmark MSRP for a segment in a given year and month
 */
export function getHistoricalSegmentBenchmark(
  segment: VehicleSegmentType,
  year: number,
  month: number = 1
): number {
  const base = BASE_1970_SEGMENT_MSRP_USD[segment] ?? 3550;
  const record = getInflationRecordForDate(year, month);
  const techMult = getSegmentEraTechMultiplier(segment, year);

  return Math.round(base * record.automotivePPI * techMult);
}

/**
 * Returns the complete table of benchmarks across all 8 vehicle segments for a given year and month
 */
export function getHistoricalSegmentBenchmarksForYear(
  year: number,
  month: number = 1
): Record<VehicleSegmentType, number> {
  const segments: VehicleSegmentType[] = [
    "ECONOMY",
    "SEDAN",
    "COUPE",
    "LUXURY",
    "SPORTS",
    "SUPERCAR",
    "SUV",
    "COMMERCIAL",
  ];

  const result = {} as Record<VehicleSegmentType, number>;
  for (const s of segments) {
    result[s] = getHistoricalSegmentBenchmark(s, year, month);
  }
  return result;
}

/**
 * Evaluates how attractive a player's list price is relative to authentic historical market MSRP
 */
export function calculateHistoricalPriceAttractiveness(
  listPrice: number,
  segment: VehicleSegmentType,
  year: number,
  month: number = 1,
  overallReputation: number = 50
): {
  priceAttractivenessFactor: number;
  benchmarkMSRP: number;
  priceRatio: number;
  marketCompetitivenessTag: "VERY_ATTRACTIVE" | "COMPETITIVE" | "PREMIUM_PRICED" | "OVERPRICED";
} {
  const benchmarkMSRP = getHistoricalSegmentBenchmark(segment, year, month);
  const priceRatio = listPrice / Math.max(1, benchmarkMSRP);

  let priceAttractivenessFactor = 1.0;
  let marketCompetitivenessTag: "VERY_ATTRACTIVE" | "COMPETITIVE" | "PREMIUM_PRICED" | "OVERPRICED" = "COMPETITIVE";

  if (priceRatio <= 0.88) {
    // Aggressive value pricing — stimulates large volume demand
    priceAttractivenessFactor = Math.min(1.85, 1.0 + (1.0 - priceRatio) * 0.95);
    marketCompetitivenessTag = "VERY_ATTRACTIVE";
  } else if (priceRatio <= 1.08) {
    // Right on benchmark
    priceAttractivenessFactor = 1.0 + (1.0 - priceRatio) * 0.7;
    marketCompetitivenessTag = "COMPETITIVE";
  } else if (priceRatio <= 1.35) {
    // Premium priced; brand prestige can buffer the demand drop
    const prestigeBuffer = Math.min(1.0, overallReputation / 100);
    priceAttractivenessFactor = Math.max(0.35, 1.0 - (priceRatio - 1.0) * (1.1 - prestigeBuffer * 0.45));
    marketCompetitivenessTag = "PREMIUM_PRICED";
  } else {
    // Significantly overpriced relative to era standard
    const prestigeBuffer = Math.min(1.0, overallReputation / 100);
    priceAttractivenessFactor = Math.max(0.15, 0.65 - (priceRatio - 1.35) * (1.4 - prestigeBuffer * 0.5));
    marketCompetitivenessTag = "OVERPRICED";
  }

  return {
    priceAttractivenessFactor: Number(priceAttractivenessFactor.toFixed(2)),
    benchmarkMSRP,
    priceRatio: Number(priceRatio.toFixed(2)),
    marketCompetitivenessTag,
  };
}

/**
 * Returns historical trajectory data for a segment across the entire timeline (1970–2030)
 */
export function getSegmentHistoricalTrajectory(
  segment: VehicleSegmentType
): Array<{ year: number; period: SemiAnnualPeriod; benchmarkMSRP: number }> {
  const trajectory: Array<{ year: number; period: SemiAnnualPeriod; benchmarkMSRP: number }> = [];

  for (let yr = 1970; yr <= 2030; yr++) {
    trajectory.push({
      year: yr,
      period: "H1_JAN",
      benchmarkMSRP: getHistoricalSegmentBenchmark(segment, yr, 1),
    });
    trajectory.push({
      year: yr,
      period: "H2_JUL",
      benchmarkMSRP: getHistoricalSegmentBenchmark(segment, yr, 7),
    });
  }

  return trajectory;
}
