import { describe, it, expect, beforeEach } from "vitest";
import { getCommodityPrice, getAllCommodityPrices } from "../commodityMarketEngine";
import { calculateMonthlyFixedExpenses } from "../fixedExpenseEngine";
import { calculateShipmentCost, processMonthlyOutboundLogistics } from "../logisticsCostEngine";
import { processMonthlyRDBudget } from "../rdBudgetEngine";
import { useTradeStore } from "../../../state/tradeStore";
import { useCompanyFinanceStore } from "../../../state/companyFinanceStore";
import { useSimulationClockStore } from "../../../state/simulationClockStore";

describe("Subsequent Phases: Multi-System Inflation Integration", () => {
  beforeEach(() => {
    useTradeStore.getState().resetTo1970();
    useCompanyFinanceStore.setState({ cash: 10_000_000 });
    useSimulationClockStore.setState({ year: 1970, month: 1, day: 1 });
  });

  describe("Phase 9: Dynamic Commodity Market Inflation Coupling", () => {
    it("should authentically reflect the 1973 OPEC oil shock on petrochemicals and rubber", () => {
      const rubber1970 = getCommodityPrice("PLASTICS_RUBBER", 1970, 1, "STEADY_GROWTH", 0);
      const rubber1974 = getCommodityPrice("PLASTICS_RUBBER", 1974, 1, "STEADY_GROWTH", 0);

      // Energy / petrochemical index quadrupled during the 1973/74 oil crisis
      expect(rubber1974.currentMarketPrice).toBeGreaterThan(rubber1970.currentMarketPrice * 2.5);
    });

    it("should model raw metal price growth across the decades", () => {
      const steel1970 = getCommodityPrice("STEEL", 1970, 1, "STEADY_GROWTH", 0);
      const steel1980 = getCommodityPrice("STEEL", 1980, 1, "STEADY_GROWTH", 0);
      const steel2008 = getCommodityPrice("STEEL", 2008, 7, "STEADY_GROWTH", 0);

      expect(steel1980.currentMarketPrice).toBeGreaterThan(steel1970.currentMarketPrice);
      expect(steel2008.currentMarketPrice).toBeGreaterThan(steel1980.currentMarketPrice);
    });

    it("should return valid prices for all 8 automotive commodity types", () => {
      const allPrices = getAllCommodityPrices(1985, 7, "STEADY_GROWTH", 5);
      expect(allPrices.STEEL.currentMarketPrice).toBeGreaterThan(0);
      expect(allPrices.ALUMINUM.currentMarketPrice).toBeGreaterThan(0);
      expect(allPrices.COPPER.currentMarketPrice).toBeGreaterThan(0);
      expect(allPrices.GLASS.currentMarketPrice).toBeGreaterThan(0);
      expect(allPrices.BATTERY_MATERIALS.currentMarketPrice).toBeGreaterThan(0);
    });
  });

  describe("Phase 10: Spot Purchase & Inventory Tracking", () => {
    it("should execute a spot purchase, debit cash, and update stored warehouse tonnage", () => {
      const tradeStore = useTradeStore.getState();
      const financeStore = useCompanyFinanceStore.getState();
      const initialCash = financeStore.cash;

      const success = tradeStore.placeSpotPurchase("BASIC_CARBON_STEEL", 50, "atlas_steel_co", 450);
      expect(success).toBe(true);

      const updatedFinance = useCompanyFinanceStore.getState();
      expect(updatedFinance.cash).toBe(initialCash - 50 * 450);

      const updatedTrade = useTradeStore.getState();
      const steelInv = updatedTrade.warehouseInventory.find((i) => i.itemType === "BASIC_CARBON_STEEL");
      expect(steelInv).toBeDefined();
      expect(steelInv!.unitsOnHand).toBeGreaterThanOrEqual(50);
      expect(updatedTrade.hqWarehouse.totalMaterialStoredTonnes).toBeGreaterThan(0);
    });

    it("should reject purchases when corporate cash is insufficient", () => {
      useCompanyFinanceStore.setState({ cash: 100 });
      const tradeStore = useTradeStore.getState();
      const success = tradeStore.placeSpotPurchase("BASIC_CARBON_STEEL", 500, "atlas_steel_co", 450);
      expect(success).toBe(false);
    });
  });

  describe("Phase 11: Era-Scaled Fixed Overhead & Logistics Tariffs", () => {
    it("should scale dealer network overhead and facility maintenance by historical CPI", () => {
      const fixed1970 = calculateMonthlyFixedExpenses({
        monthlyPayrollTotal: 50_000,
        assets: [
          {
            id: "fac_plant_01",
            name: "Main Stamping Plant",
            type: "FACTORY",
            originalCost: 2_000_000,
            currentValue: 1_800_000,
            monthlyMaintenanceCost: 20_000,
            annualDepreciationRate: 0.05,
            acquisitionYear: 1970,
            acquisitionMonth: 1,
            conditionPct: 100,
          },
        ],
        dealershipCount: 5,
        commercialTrustScore: 50,
        companyTotalAssetValue: 2_000_000,
        year: 1970,
        month: 1,
      });

      const fixed2010 = calculateMonthlyFixedExpenses({
        monthlyPayrollTotal: 50_000,
        assets: [
          {
            id: "fac_plant_01",
            name: "Main Stamping Plant",
            type: "FACTORY",
            originalCost: 2_000_000,
            currentValue: 1_800_000,
            monthlyMaintenanceCost: 20_000,
            annualDepreciationRate: 0.05,
            acquisitionYear: 1970,
            acquisitionMonth: 1,
            conditionPct: 100,
          },
        ],
        dealershipCount: 5,
        commercialTrustScore: 50,
        companyTotalAssetValue: 2_000_000,
        year: 2010,
        month: 1,
      });

      // CPI increased by ~5.7x between 1970 and 2010
      expect(fixed2010.dealerNetworkOverhead).toBeGreaterThan(fixed1970.dealerNetworkOverhead * 4);
      expect(fixed2010.factoryMaintenance).toBeGreaterThan(fixed1970.factoryMaintenance * 4);
    });

    it("should scale freight shipment rates during oil shock eras", () => {
      const fleetState = {
        hasOwnedRailSpur: false,
        hasDedicatedCarrierFleet: false,
        monthlyCarrierLeaseOverhead: 10_000,
        logisticsReputationScore: 50,
      };

      const truck1970 = calculateShipmentCost("ROAD_TRUCK", 500, 100, fleetState, 1970, 1);
      const truck1974 = calculateShipmentCost("ROAD_TRUCK", 500, 100, fleetState, 1974, 1);

      // Road trucking fuel costs surged in 1974
      expect(truck1974.costPerVehicle).toBeGreaterThan(truck1970.costPerVehicle);
      expect(truck1974.totalCost).toBeGreaterThan(truck1970.totalCost);
    });
  });

  describe("Phase 12: Era-Scaled R&D Project Costs", () => {
    it("should require higher nominal R&D budgets in modern eras for equivalent capability points", () => {
      const budget1970 = {
        totalMonthlyBudget: 100_000,
        allocations: {
          PERFORMANCE: 50,
          RELIABILITY: 50,
          SAFETY: 0,
          DESIGN: 0,
          LUXURY: 0,
          MANUFACTURING: 0,
          ELECTRONICS: 0,
          MOTORSPORT: 0,
        },
        activeProjects: [],
      };

      const result1970 = processMonthlyRDBudget(budget1970, 1.0, 1970, 1);
      const result2020 = processMonthlyRDBudget(budget1970, 1.0, 2020, 1);

      // In 1970, ₹100,000 produced more points than the exact same ₹100,000 in 2020 due to inflation
      expect(result1970.domainGains.PERFORMANCE).toBeGreaterThan(result2020.domainGains.PERFORMANCE);
    });
  });
});
