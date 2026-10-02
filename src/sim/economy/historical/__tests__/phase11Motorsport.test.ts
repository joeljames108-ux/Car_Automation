/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — PHASE 11: MOTORSPORT & RACING OPERATIONS ECONOMICS
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  MOTORSPORT_COST_SPECS,
  MOTORSPORT_RECORDS,
  MOTORSPORT_HISTORY,
  getMotorsportRecord,
  getMotorsportCost,
  MotorsportSeriesId,
  MotorsportCostId,
} from "../motorsportEconomics";

describe("Phase 11: Motorsport & Racing Operations Economics (1970–2026)", () => {
  const seriesList: MotorsportSeriesId[] = [
    "FORMULA_ONE",
    "ENDURANCE_LE_MANS",
    "GT3_PRODUCTION_RACING",
    "RALLY_WRC",
  ];

  const costList: MotorsportCostId[] = [
    "SEASON_ENTRY_FEE",
    "RACING_TIRE_SET",
    "RACING_FUEL_PER_LITER",
    "WIND_TUNNEL_SCALE_HOURLY",
    "ENGINE_REBUILD_CYCLE",
    "TRACKSIDE_CREW_DAY_RATE",
    "CHASSIS_TUB_REPLACEMENT",
    "TELEMETRY_SYSTEM_PER_SEASON",
  ];

  it("should contain all 114 periods for each of the 4 series and 8 cost items", () => {
    expect(Object.keys(MOTORSPORT_RECORDS).length).toBe(114);
    expect(MOTORSPORT_HISTORY.length).toBe(114);

    for (const record of MOTORSPORT_HISTORY) {
      for (const s of seriesList) {
        for (const c of costList) {
          const item = record.series[s][c];
          expect(item).toBeDefined();
          expect(item.costUSD.value).toBeGreaterThan(0);
          expect(item.costUSD.provenance.dateObserved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      }
    }
  });

  it("should reflect series tier hierarchy where Formula 1 commands premier costs over GT3 and WRC", () => {
    const f1Entry = getMotorsportCost("FORMULA_ONE", "SEASON_ENTRY_FEE", 2026, 7);
    const lemansEntry = getMotorsportCost("ENDURANCE_LE_MANS", "SEASON_ENTRY_FEE", 2026, 7);
    const gt3Entry = getMotorsportCost("GT3_PRODUCTION_RACING", "SEASON_ENTRY_FEE", 2026, 7);
    const wrcEntry = getMotorsportCost("RALLY_WRC", "SEASON_ENTRY_FEE", 2026, 7);

    expect(f1Entry.costUSD.value).toBeGreaterThan(lemansEntry.costUSD.value);
    expect(lemansEntry.costUSD.value).toBeGreaterThan(wrcEntry.costUSD.value);
    expect(wrcEntry.costUSD.value).toBeGreaterThan(gt3Entry.costUSD.value);

    // Engine rebuild in GT3 should be substantially cheaper than F1 high-tech rebuild
    const f1Engine = getMotorsportCost("FORMULA_ONE", "ENGINE_REBUILD_CYCLE", 2026, 7);
    const gt3Engine = getMotorsportCost("GT3_PRODUCTION_RACING", "ENGINE_REBUILD_CYCLE", 2026, 7);
    expect(gt3Engine.costUSD.value).toBeLessThan(f1Engine.costUSD.value * 0.35);
  });

  it("should reflect the carbon fiber monocoque transition in 1981", () => {
    // 1970: Aluminum sheet monocoque ($12,500)
    const tub1970 = getMotorsportCost("FORMULA_ONE", "CHASSIS_TUB_REPLACEMENT", 1970, 1);
    expect(tub1970.costUSD.value).toBe(12500);

    // 1985: Carbon fiber monocoque tub (~$76,000)
    const tub1985 = getMotorsportCost("FORMULA_ONE", "CHASSIS_TUB_REPLACEMENT", 1985, 1);
    expect(tub1985.costUSD.value).toBeGreaterThan(70000);
    expect(tub1985.costUSD.value).toBeLessThan(90000);

    // 2026: Modern autoclaved high-modulus tub (~$420,000)
    const tub2026 = getMotorsportCost("FORMULA_ONE", "CHASSIS_TUB_REPLACEMENT", 2026, 7);
    expect(tub2026.costUSD.value).toBeGreaterThan(350000);
  });

  it("should reflect computerized telemetry revolution post-1984", () => {
    // 1975: Rudimentary stopwatch/gauge era (<$2,000)
    const telem1975 = getMotorsportCost("FORMULA_ONE", "TELEMETRY_SYSTEM_PER_SEASON", 1975, 1);
    expect(telem1975.costUSD.value).toBeLessThan(2000);

    // 1988: Early digital telemetry era ($35k - $45k)
    const telem1988 = getMotorsportCost("FORMULA_ONE", "TELEMETRY_SYSTEM_PER_SEASON", 1988, 1);
    expect(telem1988.costUSD.value).toBeGreaterThan(30000);

    // 2026: Multi-channel encrypted CAN-bus telemetry ($120k - $160k)
    const telem2026 = getMotorsportCost("FORMULA_ONE", "TELEMETRY_SYSTEM_PER_SEASON", 2026, 7);
    expect(telem2026.costUSD.value).toBeGreaterThan(120000);
  });

  it("should reflect oil shocks in racing fuel pricing", () => {
    // 1970: Low pre-shock price (~$0.42/L)
    const fuel1970 = getMotorsportCost("FORMULA_ONE", "RACING_FUEL_PER_LITER", 1970, 1);
    expect(fuel1970.costUSD.value).toBeCloseTo(0.42, 2);

    // 1980 Oil Shock II: Spike to ~$1.70 - $2.20/L
    const fuel1980 = getMotorsportCost("FORMULA_ONE", "RACING_FUEL_PER_LITER", 1980, 7);
    expect(fuel1980.costUSD.value).toBeGreaterThan(1.50);

    // 2026: High-spec drop-in sustainable fuel (~$6.00 - $8.00/L)
    const fuel2026 = getMotorsportCost("FORMULA_ONE", "RACING_FUEL_PER_LITER", 2026, 7);
    expect(fuel2026.costUSD.value).toBeGreaterThan(5.50);
  });
});
