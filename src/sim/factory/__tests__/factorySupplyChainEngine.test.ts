import { describe, it, expect } from "vitest";
import {
  COMMODITY_SUPPLY_SPECS,
  getMaterialSupplySpec,
  calculateLeadTime,
  calculateBulkDiscount,
  calculatePurchaseOrderCost,
  createPurchaseOrder,
  tickPurchaseOrders,
  checkBOMShortagesForProduction,
  deductBOMConsumption,
  addDeliveredStockToWarehouse,
  PurchaseOrder,
} from "../factorySupplyChainEngine";
import { WarehouseInventoryRecord } from "../../trade/tradeTypes";

describe("factorySupplyChainEngine", () => {
  describe("getMaterialSupplySpec & Lead Times", () => {
    it("returns correct lead time ranges for 1970 commodities", () => {
      const steel = getMaterialSupplySpec("mat_steel");
      expect(steel.minLeadTimeDays).toBe(8);
      expect(steel.maxLeadTimeDays).toBe(12);
      expect(steel.nominalLeadTimeDays).toBe(10);

      const electronics = getMaterialSupplySpec("mat_electronics");
      expect(electronics.minLeadTimeDays).toBe(12);
      expect(electronics.maxLeadTimeDays).toBe(18);
    });

    it("calculates deterministic lead times bounded by spec", () => {
      const minLead = calculateLeadTime("mat_steel", 0.0);
      const maxLead = calculateLeadTime("mat_steel", 1.0);
      const midLead = calculateLeadTime("mat_steel", 0.5);

      expect(minLead).toBe(8);
      expect(maxLead).toBe(12);
      expect(midLead).toBe(10);
    });
  });

  describe("Bulk Discounts & Cost Calculations", () => {
    it("applies volume discount only when threshold is met", () => {
      // Steel threshold is 50,000 kg -> 8% discount
      expect(calculateBulkDiscount("mat_steel", 40000)).toBe(0);
      expect(calculateBulkDiscount("mat_steel", 50000)).toBe(8);
      expect(calculateBulkDiscount("mat_steel", 100000)).toBe(8);

      // Tyres threshold is 200 sets -> 10% discount
      expect(calculateBulkDiscount("mat_tyres", 150)).toBe(0);
      expect(calculateBulkDiscount("mat_tyres", 250)).toBe(10);
    });

    it("correctly computes order cost with bulk discounts", () => {
      const baseCost = calculatePurchaseOrderCost("mat_steel", 10000);
      // 10,000 kg * $1.25 = $12,500
      expect(baseCost.discountPct).toBe(0);
      expect(baseCost.totalCost).toBe(12500);

      const bulkCost = calculatePurchaseOrderCost("mat_steel", 60000);
      // 60,000 kg * ($1.25 * 0.92 = $1.15) = $69,000
      expect(bulkCost.discountPct).toBe(8);
      expect(bulkCost.unitPrice).toBe(1.15);
      expect(bulkCost.totalCost).toBe(69000);
    });
  });

  describe("createPurchaseOrder & tickPurchaseOrders", () => {
    it("creates a purchase order with pending status and delivery date", () => {
      const po = createPurchaseOrder({
        materialId: "mat_steel",
        quantity: 25000,
        orderDateStr: "1970-01-10",
        leadTimeDays: 10,
      });

      expect(po.status).toBe("PENDING");
      expect(po.daysRemaining).toBe(10);
      expect(po.orderDate).toBe("1970-01-10");
      expect(po.deliveryDate).toBe("1970-01-20");
      expect(po.quantity).toBe(25000);
    });

    it("progresses countdown and marks DELIVERED when daysRemaining reaches 0", () => {
      const po1: PurchaseOrder = {
        id: "PO_1",
        materialId: "mat_steel",
        materialName: "Steel",
        category: "raw_metals",
        unit: "kg",
        quantity: 10000,
        unitPriceUSD: 1.25,
        bulkDiscountPct: 0,
        totalCostUSD: 12500,
        orderDate: "1970-01-01",
        deliveryDate: "1970-01-05",
        daysRemaining: 3,
        status: "PENDING",
      };

      const tick1 = tickPurchaseOrders([po1], 2);
      expect(tick1.updatedOrders[0].daysRemaining).toBe(1);
      expect(tick1.updatedOrders[0].status).toBe("PENDING");
      expect(tick1.newlyDelivered.length).toBe(0);

      const tick2 = tickPurchaseOrders(tick1.updatedOrders, 1);
      expect(tick2.updatedOrders[0].daysRemaining).toBe(0);
      expect(tick2.updatedOrders[0].status).toBe("DELIVERED");
      expect(tick2.newlyDelivered.length).toBe(1);
      expect(tick2.newlyDelivered[0].id).toBe("PO_1");
    });
  });

  describe("checkBOMShortagesForProduction & deductBOMConsumption", () => {
    const mockInventory: WarehouseInventoryRecord[] = [
      {
        id: "inv_steel",
        itemType: "DEEP_DRAW_STEEL" as any,
        name: "Deep-Draw Stamping Steel",
        level: "LEVEL_2_PROCESSED",
        unitsOnHand: 5500, // Enough for 5 cars (1100kg each)
        unitOfMeasure: "kg",
        averageUnitCost: 1.25,
        qualityVector: {} as any,
        overallQualityScore: 85,
        warehouseFacilityId: "wh_main",
        holdingCostMonthlyRate: 0.02,
        reorderPoint: 2000,
        safetyStockTarget: 5000,
        storageMaxCapacity: 50000,
      },
      {
        id: "inv_tyres",
        itemType: "RADIAL_TIRES" as any,
        name: "Radial Tyres",
        level: "LEVEL_4_COMPONENT",
        unitsOnHand: 16, // Enough for 4 cars (4 tyres each)
        unitOfMeasure: "units",
        averageUnitCost: 68,
        qualityVector: {} as any,
        overallQualityScore: 85,
        warehouseFacilityId: "wh_main",
        holdingCostMonthlyRate: 0.02,
        reorderPoint: 50,
        safetyStockTarget: 100,
        storageMaxCapacity: 1000,
      },
    ];

    it("detects shortages when stock is less than required", () => {
      // Requesting 10 cars: need 11,000kg steel and 40 tyres
      const check = checkBOMShortagesForProduction(10, mockInventory);
      expect(check.isFeasible).toBe(false);
      expect(check.shortages.length).toBeGreaterThanOrEqual(1);

      const steelShortage = check.shortages.find((s) => s.materialId === "mat_steel");
      expect(steelShortage).toBeDefined();
      expect(steelShortage?.deficit).toBe(11000 - 5500);
    });

    it("deducts materials accurately from stock", () => {
      // Producing 2 cars: consumes 2200kg steel and 8 tyres
      const { updatedInventory, consumed } = deductBOMConsumption(2, mockInventory);

      const steel = updatedInventory.find((i) => i.id === "inv_steel");
      expect(steel?.unitsOnHand).toBe(5500 - 2200);

      const tyres = updatedInventory.find((i) => i.id === "inv_tyres");
      expect(tyres?.unitsOnHand).toBe(16 - 8);

      expect(consumed.length).toBe(2);
    });

    it("adds delivered stock to warehouse inventory with weighted unit cost", () => {
      const deliveredPO: PurchaseOrder = {
        id: "PO_123",
        materialId: "mat_steel",
        materialName: "Deep-Draw Stamping Steel",
        category: "raw_metals",
        unit: "kg",
        quantity: 10000,
        unitPriceUSD: 1.15,
        bulkDiscountPct: 8,
        totalCostUSD: 11500,
        orderDate: "1970-01-01",
        deliveryDate: "1970-01-10",
        daysRemaining: 0,
        status: "DELIVERED",
      };

      const updated = addDeliveredStockToWarehouse(deliveredPO, mockInventory);
      const steel = updated.find((i) => i.id === "inv_steel");
      expect(steel?.unitsOnHand).toBe(5500 + 10000);
      // Previous: 5500 @ 1.25 ($6875) + 10000 @ 1.15 ($11500) = $18375 / 15500 = ~$1.19
      expect(steel?.averageUnitCost).toBe(1.19);
    });
  });
});
