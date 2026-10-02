/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIT TESTS — PHASE 9: R&D, CORPORATE SERVICES, MARKETING & FINANCE
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from "vitest";
import {
  CORPORATE_COST_SPECS,
  CORPORATE_RECORDS,
  CORPORATE_HISTORY,
  getCorporateRecord,
  getCorporateCost,
  CorporateCostId,
} from "../rdAndCorporate";

describe("Phase 9: R&D, Corporate Services, Marketing & Finance (1970–2026)", () => {
  const costList: CorporateCostId[] = [
    "FED_FUNDS_INTEREST_RATE",
    "COMMERCIAL_PRIME_RATE",
    "CORPORATE_LEGAL_COUNSEL",
    "AUDIT_ACCOUNTING_MONTHLY",
    "ENTERPRISE_IT_INFRASTRUCTURE",
    "CRASH_TEST_BARRIER_RUN",
    "WIND_TUNNEL_HOURLY_RATE",
    "PROVING_GROUND_TEST_DAY",
    "NATIONAL_ADVERTISING_CAMPAIGN",
    "INTERNATIONAL_MOTOR_SHOW_STAND",
  ];

  it("should contain all 114 periods for each of the 10 corporate cost items", () => {
    expect(Object.keys(CORPORATE_RECORDS).length).toBe(114);
    expect(CORPORATE_HISTORY.length).toBe(114);

    for (const record of CORPORATE_HISTORY) {
      for (const cost of costList) {
        const item = record.costs[cost];
        expect(item).toBeDefined();
        expect(item.rateValue.value).toBeGreaterThan(0);
        expect(item.rateValue.provenance.dateObserved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("should verify accurate Federal Reserve interest rate history", () => {
    // 1970: Initial rate ~8.5-9.0%
    const fed1970 = getCorporateCost("FED_FUNDS_INTEREST_RATE", 1970, 1);
    expect(fed1970.rateValue.value).toBeCloseTo(8.98, 1);
    expect(fed1970.rateValue.provenance.dataType).toBe("TYPE_A_DIRECT");

    // 1981 Volcker Rate Peak: Prime rate hit 20.0 - 20.5%
    const prime1981 = getCorporateCost("COMMERCIAL_PRIME_RATE", 1981, 7);
    expect(prime1981.rateValue.value).toBe(20.50);

    // 2011 ZIRP Era: Fed Funds at ~0.1%
    const fed2011 = getCorporateCost("FED_FUNDS_INTEREST_RATE", 2011, 1);
    expect(fed2011.rateValue.value).toBeLessThan(0.25);

    // 2023 Tightening: Prime rate reached 8.50%
    const prime2023 = getCorporateCost("COMMERCIAL_PRIME_RATE", 2023, 7);
    expect(prime2023.rateValue.value).toBe(8.50);
  });

  it("should verify legal and testing service rates progression", () => {
    const legal1970 = getCorporateCost("CORPORATE_LEGAL_COUNSEL", 1970, 1);
    const legal2026 = getCorporateCost("CORPORATE_LEGAL_COUNSEL", 2026, 7);

    // In 1970: $65/hr
    expect(legal1970.rateValue.value).toBe(65);
    // In 2026: Over $700/hr
    expect(legal2026.rateValue.value).toBeGreaterThan(700);
    expect(legal2026.rateValue.provenance.dataType).toBe("TYPE_B_INDEX");

    const crash1970 = getCorporateCost("CRASH_TEST_BARRIER_RUN", 1970, 1);
    const crash2026 = getCorporateCost("CRASH_TEST_BARRIER_RUN", 2026, 7);

    // In 1970: $18.5k/test
    expect(crash1970.rateValue.value).toBe(18500);
    // In 2026: ~$150k - $220k/test
    expect(crash2026.rateValue.value).toBeGreaterThan(150000);
  });
});
