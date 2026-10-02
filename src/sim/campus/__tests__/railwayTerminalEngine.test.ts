import { describe, it, expect } from "vitest";
import {
  RailwayTerminalEngine,
  RailwayTerminalState,
  RAILWAY_LEVEL_SPECS,
  SPECIALIZED_SIDINGS,
  NETWORK_CONNECTIONS,
} from "../railwayTerminalEngine";

describe("RailwayTerminalEngine - HQ Cargo Railway Infrastructure", () => {
  // ── 1. INITIALIZATION & SPECIFICATIONS ────────────────────────────────
  it("initializes with 1970 startup default (Level 0 Unconnected Yard)", () => {
    const state = RailwayTerminalEngine.createInitialState();
    expect(state.level).toBe(0);
    expect(state.operationalStatus).toBe("operational");
    expect(state.installedSidings).toHaveLength(0);
    expect(state.networkTier).toBe("LOCAL_SPUR");
    expect(state.leasedThirdPartyTonnesDaily).toBe(0);

    const spec = RAILWAY_LEVEL_SPECS[0];
    expect(spec.dailyTonnageCapacity).toBe(0);
    expect(spec.freightCostSavingsPct).toBe(0);
    expect(spec.maxDailyCarriers).toBe(0);
  });

  // ── 2. STRICT CAPITAL-GATED UPGRADES ─────────────────────────────────
  it("rejects upgrade when player liquid capital is insufficient", () => {
    const state = RailwayTerminalEngine.createInitialState();
    const l1Cost = RAILWAY_LEVEL_SPECS[1].capitalCostUSD; // $1,250,000

    const result = RailwayTerminalEngine.upgradeTerminalTier(state, 1, 500_000); // Only $500k
    expect(result.success).toBe(false);
    expect(result.updatedState.level).toBe(0);
    expect(result.remainingCash).toBe(500_000);
    expect(result.errorReason).toContain("INSUFFICIENT CAPITAL");
  });

  it("successfully upgrades to Level 1 when player has sufficient cash", () => {
    const state = RailwayTerminalEngine.createInitialState();
    const l1Cost = RAILWAY_LEVEL_SPECS[1].capitalCostUSD; // $1,250,000

    const result = RailwayTerminalEngine.upgradeTerminalTier(state, 1, 2_000_000);
    expect(result.success).toBe(true);
    expect(result.updatedState.level).toBe(1);
    expect(result.remainingCash).toBe(2_000_000 - l1Cost);
  });

  it("prevents downgrading or upgrading beyond Level 5", () => {
    const state = RailwayTerminalEngine.createInitialState();
    const resLow = RailwayTerminalEngine.upgradeTerminalTier(state, 0, 10_000_000);
    expect(resLow.success).toBe(false);

    const resHigh = RailwayTerminalEngine.upgradeTerminalTier(state, 6, 100_000_000);
    expect(resHigh.success).toBe(false);
  });

  it("verifies facility level does NOT change purely with time or calendar", () => {
    const state = RailwayTerminalEngine.createInitialState();
    // Simulate passing 120 calendar days without spending money
    for (let day = 0; day < 120; day++) {
      RailwayTerminalEngine.processDailyFreightFlow(
        { inboundMaterialsTonnes: 100, outboundComponentsTonnes: 50, outboundVehiclesCount: 20 },
        state
      );
    }
    // Level remains strictly at 0
    expect(state.level).toBe(0);
  });

  // ── 3. THROUGHPUT CAPACITY, DEMAND & OVERFLOW ────────────────────────
  it("diverts 100% of cargo to expensive overland road trucks at Level 0", () => {
    const state = RailwayTerminalEngine.createInitialState(); // L0 has 0 rail capacity
    const input = {
      inboundMaterialsTonnes: 200,
      outboundComponentsTonnes: 100,
      outboundVehiclesCount: 50, // 50 * 1.6t = 80t
    };
    const totalDemand = 200 + 100 + 80; // 380 tonnes

    const result = RailwayTerminalEngine.processDailyFreightFlow(input, state);
    expect(result.totalDemandTonnes).toBe(380);
    expect(result.railCapacityTonnes).toBe(0);
    expect(result.railCarriedTonnes).toBe(0);
    expect(result.truckOverflowTonnes).toBe(380);
    expect(result.isCapacityExceeded).toBe(true);
    expect(result.dailyCostSavingsUSD).toBe(0);
    expect(result.bottleneckAlerts[0]).toContain("NO RAIL INFRASTRUCTURE");
  });

  it("carries full demand on rail when demand is within terminal capacity (Level 2)", () => {
    // Level 2 has 2,500 tonnes/day capacity and 120 cars/day auto-rack
    let state = RailwayTerminalEngine.createInitialState();
    const upg = RailwayTerminalEngine.upgradeTerminalTier(state, 2, 10_000_000);
    state = upg.updatedState;

    const input = {
      inboundMaterialsTonnes: 500,
      outboundComponentsTonnes: 300,
      outboundVehiclesCount: 100, // 160t
    };
    const totalDemand = 500 + 300 + 160; // 960 tonnes (< 2,500 t/d)

    const result = RailwayTerminalEngine.processDailyFreightFlow(input, state);
    expect(result.totalDemandTonnes).toBe(960);
    expect(result.railCarriedTonnes).toBe(960);
    expect(result.truckOverflowTonnes).toBe(0);
    expect(result.isCapacityExceeded).toBe(false);
    expect(result.railCarriedVehicles).toBe(100);
    expect(result.truckOverflowVehicles).toBe(0);
    expect(result.dailyCostSavingsUSD).toBeGreaterThan(0);
  });

  it("correctly overflows excess demand to road trucks when capacity is exceeded", () => {
    // Level 1: 600 t/d capacity, 20 cars/day auto-rack
    let state = RailwayTerminalEngine.createInitialState();
    const upg = RailwayTerminalEngine.upgradeTerminalTier(state, 1, 10_000_000);
    state = upg.updatedState;

    const input = {
      inboundMaterialsTonnes: 700,
      outboundComponentsTonnes: 200,
      outboundVehiclesCount: 50, // 80t
    };
    const totalDemand = 700 + 200 + 80; // 980 tonnes

    const result = RailwayTerminalEngine.processDailyFreightFlow(input, state);
    expect(result.totalDemandTonnes).toBe(980);
    expect(result.railCapacityTonnes).toBe(600);
    expect(result.railCarriedTonnes).toBe(600);
    expect(result.truckOverflowTonnes).toBe(380); // 980 - 600
    expect(result.isCapacityExceeded).toBe(true);
    expect(result.railCarriedVehicles).toBe(20);
    expect(result.truckOverflowVehicles).toBe(30); // 50 - 20
    expect(result.bottleneckAlerts.some((a) => a.includes("RAIL TERMINAL OVERFLOW"))).toBe(true);
    expect(result.bottleneckAlerts.some((a) => a.includes("AUTO-RACK DEFICIT"))).toBe(true);
  });

  // ── 4. SPECIALIZED SIDINGS & ADD-ONS ──────────────────────────────────
  it("enforces level and capital gates for specialized sidings", () => {
    let state = RailwayTerminalEngine.createInitialState(); // Level 0
    // CONTAINER_CFS requires Level 2+
    const resL0 = RailwayTerminalEngine.installSpecializedSiding(state, "CONTAINER_CFS", 5_000_000);
    expect(resL0.success).toBe(false);
    expect(resL0.errorReason).toContain("FACILITY LEVEL INSUFFICIENT");

    // Upgrade to Level 2
    state = RailwayTerminalEngine.upgradeTerminalTier(state, 2, 10_000_000).updatedState;

    // Fail if cash < cost ($2,400,000)
    const resNoCash = RailwayTerminalEngine.installSpecializedSiding(state, "CONTAINER_CFS", 1_000_000);
    expect(resNoCash.success).toBe(false);
    expect(resNoCash.errorReason).toContain("INSUFFICIENT CAPITAL");

    // Success with sufficient cash
    const resOk = RailwayTerminalEngine.installSpecializedSiding(state, "CONTAINER_CFS", 3_000_000);
    expect(resOk.success).toBe(true);
    expect(resOk.updatedState.installedSidings).toContain("CONTAINER_CFS");
    expect(resOk.remainingCash).toBe(3_000_000 - 2_400_000);
  });

  // ── 5. NETWORK CONNECTIVITY TIERS ────────────────────────────────────
  it("enforces corporate reputation and capital cost for trunk connections", () => {
    let state = RailwayTerminalEngine.createInitialState();
    state = RailwayTerminalEngine.upgradeTerminalTier(state, 3, 20_000_000).updatedState;

    // REGIONAL_CORRIDOR requires Reputation 25+, Cost $2,500,000
    const repLow = RailwayTerminalEngine.upgradeNetworkTier(state, "REGIONAL_CORRIDOR", 15, 5_000_000);
    expect(repLow.success).toBe(false);
    expect(repLow.errorReason).toContain("REPUTATION GATE");

    const cashLow = RailwayTerminalEngine.upgradeNetworkTier(state, "REGIONAL_CORRIDOR", 40, 1_000_000);
    expect(cashLow.success).toBe(false);
    expect(cashLow.errorReason).toContain("INSUFFICIENT CAPITAL");

    const success = RailwayTerminalEngine.upgradeNetworkTier(state, "REGIONAL_CORRIDOR", 40, 5_000_000);
    expect(success.success).toBe(true);
    expect(success.updatedState.networkTier).toBe("REGIONAL_CORRIDOR");
    expect(success.remainingCash).toBe(2_500_000);
  });

  // ── 6. B2B COMPETITOR LEASING & MONTHLY ECONOMICS ────────────────────
  it("monetizes surplus rail capacity to competitors within allowed limits", () => {
    let state = RailwayTerminalEngine.createInitialState();
    // Upgrade to Level 4 (Max 8,000 t/d lease allowance)
    state = RailwayTerminalEngine.upgradeTerminalTier(state, 4, 30_000_000).updatedState;

    // Over-committing capacity fails
    const failLease = RailwayTerminalEngine.setThirdPartyLease(state, 12_000);
    expect(failLease.success).toBe(false);
    expect(failLease.errorReason).toContain("EXCEEDS MAXIMUM LEASE CAPACITY");

    // Setting 5,000 t/d at $35/tonne
    const okLease = RailwayTerminalEngine.setThirdPartyLease(state, 5_000, 35.0);
    expect(okLease.success).toBe(true);
    expect(okLease.updatedState.leasedThirdPartyTonnesDaily).toBe(5_000);

    // Calculate monthly financial outcome
    const avgDemand = {
      inboundMaterialsTonnes: 2000,
      outboundComponentsTonnes: 1000,
      outboundVehiclesCount: 400,
    };
    const econ = RailwayTerminalEngine.calculateMonthlyEconomics(okLease.updatedState, avgDemand);

    // 5,000 t/d * 30 days * $35/t = $5,250,000 monthly income
    expect(econ.thirdPartyLeaseIncomeUSD).toBe(5_250_000);
    expect(econ.facilityMaintenanceCostUSD).toBe(RAILWAY_LEVEL_SPECS[4].monthlyMaintenanceUSD);
    expect(econ.netTerminalProfitLossUSD).toBe(5_250_000 - RAILWAY_LEVEL_SPECS[4].monthlyMaintenanceUSD);
    expect(econ.estimatedFreightSavingsUSD).toBeGreaterThan(0);
  });
});
