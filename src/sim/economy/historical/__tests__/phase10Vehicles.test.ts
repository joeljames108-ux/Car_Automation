/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — PHASE 10: HISTORICAL VEHICLE MSRP & SEGMENT PRICING
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  VEHICLE_SEGMENT_SPECS,
  VEHICLE_PRICE_RECORDS,
  VEHICLE_PRICE_HISTORY,
  getVehiclePriceRecord,
  getVehicleSegmentPrice,
  VehicleSegmentId,
} from "../historicalVehicleMSRP";

describe("Phase 10: Historical Vehicle MSRP & Segment Pricing (1970–2026)", () => {
  const segments: VehicleSegmentId[] = [
    "ECONOMY_SUBCOMPACT",
    "FAMILY_SEDAN",
    "EXECUTIVE_LUXURY",
    "GRAND_TOURER_SPORT",
    "EXOTIC_SUPERCAR",
    "HALO_HYPERCAR",
    "CROSSOVER_SUV_TRUCK",
  ];

  it("should contain all 114 periods for each of the 7 vehicle segments", () => {
    expect(Object.keys(VEHICLE_PRICE_RECORDS).length).toBe(114);
    expect(VEHICLE_PRICE_HISTORY.length).toBe(114);

    for (const record of VEHICLE_PRICE_HISTORY) {
      for (const seg of segments) {
        const item = record.vehicles[seg];
        expect(item).toBeDefined();
        expect(item.msrpUSD.value).toBeGreaterThan(0);
        expect(item.wholesaleDealerCostUSD).toBeGreaterThan(0);
        expect(item.wholesaleDealerCostUSD).toBeLessThan(item.msrpUSD.value);
        expect(item.dealerMarginUSD).toBe(item.msrpUSD.value - item.wholesaleDealerCostUSD);
        expect(item.msrpUSD.provenance.dateObserved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("should verify authentic 1970 nominal vehicle MSRPs", () => {
    // 1970-H1 Pinto / Vega / Beetle economy car ~$2,195
    const econ1970 = getVehicleSegmentPrice("ECONOMY_SUBCOMPACT", 1970, 1);
    expect(econ1970.msrpUSD.value).toBe(2195);
    expect(econ1970.wholesaleDealerCostUSD).toBeLessThan(2195);

    // 1970-H1 Chevelle / Torino family sedan ~$3,550
    const sedan1970 = getVehicleSegmentPrice("FAMILY_SEDAN", 1970, 1);
    expect(sedan1970.msrpUSD.value).toBe(3550);

    // 1970-H1 Cadillac DeVille luxury sedan ~$6,850
    const lux1970 = getVehicleSegmentPrice("EXECUTIVE_LUXURY", 1970, 1);
    expect(lux1970.msrpUSD.value).toBe(6850);

    // 1970-H1 Corvette / 911T sports car ~$5,950
    const sports1970 = getVehicleSegmentPrice("GRAND_TOURER_SPORT", 1970, 1);
    expect(sports1970.msrpUSD.value).toBe(5950);

    // 1970-H1 Miura / Daytona exotic ~$19,800
    const exotic1970 = getVehicleSegmentPrice("EXOTIC_SUPERCAR", 1970, 1);
    expect(exotic1970.msrpUSD.value).toBe(19800);
  });

  it("should verify contemporary 2026 nominal vehicle MSRPs matching modern window stickers", () => {
    // 2026 Economy car ~$25k-27k (Civic / Corolla)
    const econ2026 = getVehicleSegmentPrice("ECONOMY_SUBCOMPACT", 2026, 7);
    expect(econ2026.msrpUSD.value).toBeGreaterThanOrEqual(23000);
    expect(econ2026.msrpUSD.value).toBeLessThanOrEqual(30000);

    // 2026 Family sedan ~$34k-38k (Camry / Accord)
    const sedan2026 = getVehicleSegmentPrice("FAMILY_SEDAN", 2026, 7);
    expect(sedan2026.msrpUSD.value).toBeGreaterThanOrEqual(32000);
    expect(sedan2026.msrpUSD.value).toBeLessThanOrEqual(42000);

    // 2026 S-Class / 7-Series luxury sedan ~$110k-140k
    const lux2026 = getVehicleSegmentPrice("EXECUTIVE_LUXURY", 2026, 7);
    expect(lux2026.msrpUSD.value).toBeGreaterThanOrEqual(100000);
    expect(lux2026.msrpUSD.value).toBeLessThanOrEqual(150000);

    // 2026 Exotic Supercar (Ferrari 296 / McLaren 750S) ~$350k-450k
    const exotic2026 = getVehicleSegmentPrice("EXOTIC_SUPERCAR", 2026, 7);
    expect(exotic2026.msrpUSD.value).toBeGreaterThanOrEqual(300000);
    expect(exotic2026.msrpUSD.value).toBeLessThanOrEqual(450000);

    // 2026 Halo Hypercar (Bugatti Tourbillon / Jesko) in multi-million dollar class
    const hyper2026 = getVehicleSegmentPrice("HALO_HYPERCAR", 2026, 7);
    expect(hyper2026.msrpUSD.value).toBeGreaterThanOrEqual(2500000);
  });

  it("should verify dealer margin percentages and wholesale costs across segments", () => {
    const record2000 = getVehiclePriceRecord(2000, 1);
    
    // Higher tier vehicles command higher dealer margins
    const econ = record2000.vehicles.ECONOMY_SUBCOMPACT;
    const exotic = record2000.vehicles.EXOTIC_SUPERCAR;

    const econMarginPct = econ.dealerMarginUSD / econ.msrpUSD.value;
    const exoticMarginPct = exotic.dealerMarginUSD / exotic.msrpUSD.value;

    expect(exoticMarginPct).toBeGreaterThan(econMarginPct);
    expect(econMarginPct).toBeCloseTo(0.085, 2);
    expect(exoticMarginPct).toBeCloseTo(0.150, 2);
  });
});
