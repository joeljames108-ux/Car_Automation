import { describe, it, expect, beforeEach } from "vitest";
import { useFactoryStore } from "../../../state/factoryStore";
import { useCompanyFinanceStore } from "../../../state/companyFinanceStore";
import { useTradeStore } from "../../../state/tradeStore";
import { useCampusStore } from "../../../state/campusStore";

describe("Factory Phase 2 Store Integration", () => {
  beforeEach(() => {
    // Reset stores
    useFactoryStore.getState().resetToInitialFloor();
    useCompanyFinanceStore.setState({ cash: 500000, transactions: [] });
    useCampusStore.setState({ eventLog: [] });
  });

  describe("Purchase Orders & Supply Chain", () => {
    it("places purchase order, debits cash, and sets delivery date with lead time", () => {
      const store = useFactoryStore.getState();
      const initialCash = useCompanyFinanceStore.getState().cash;

      // Steel norm: $1.25/kg, 20,000kg -> $25,000 (no bulk discount at 20k)
      const res = store.placePurchaseOrder("mat_steel", 20000, "1970-01-01");
      expect(res.success).toBe(true);
      expect(res.order).toBeDefined();
      expect(res.order?.materialId).toBe("mat_steel");
      expect(res.order?.daysRemaining).toBe(10);
      expect(res.order?.status).toBe("PENDING");

      // Verify cash deduction
      const currentCash = useCompanyFinanceStore.getState().cash;
      expect(currentCash).toBe(initialCash - 25000);

      // Verify stored in state
      expect(useFactoryStore.getState().purchaseOrders.length).toBe(1);
    });

    it("applies bulk discounts for high-volume orders", () => {
      const store = useFactoryStore.getState();
      // Steel threshold is 50,000 kg -> 8% discount ($1.25 * 0.92 = $1.15/kg)
      const res = store.placePurchaseOrder("mat_steel", 50000, "1970-01-01");
      expect(res.success).toBe(true);
      expect(res.order?.bulkDiscountPct).toBe(8);
      expect(res.order?.totalCostUSD).toBe(57500);
    });

    it("cancels pending purchase order with 80% refund", () => {
      const store = useFactoryStore.getState();
      const initialCash = useCompanyFinanceStore.getState().cash;

      const res = store.placePurchaseOrder("mat_steel", 10000, "1970-01-01");
      const orderId = res.order!.id;
      const orderCost = res.order!.totalCostUSD; // $12,500

      const cancelSuccess = store.cancelPurchaseOrder(orderId);
      expect(cancelSuccess).toBe(true);

      const updatedOrder = useFactoryStore.getState().purchaseOrders.find((o) => o.id === orderId);
      expect(updatedOrder?.status).toBe("CANCELLED");

      // Refund is 80% ($10,000)
      const expectedRefund = Math.round(orderCost * 0.8);
      const expectedFinalCash = initialCash - orderCost + expectedRefund;
      expect(useCompanyFinanceStore.getState().cash).toBe(expectedFinalCash);
    });

    it("delivers purchase order during tickFactoryDay and replenishes warehouse stock", () => {
      const store = useFactoryStore.getState();
      const res = store.placePurchaseOrder("mat_steel", 10000, "1970-01-01");
      expect(res.success).toBe(true);

      const prevStock = useTradeStore.getState().warehouseInventory.find((w) => w.name.toLowerCase().includes("steel"))?.unitsOnHand || 0;

      // Tick 10 days to fulfill steel lead time
      store.tickFactoryDay("1970-01-11", 10);

      const deliveredOrder = useFactoryStore.getState().purchaseOrders.find((o) => o.id === res.order!.id);
      expect(deliveredOrder?.status).toBe("DELIVERED");
      expect(deliveredOrder?.daysRemaining).toBe(0);

      const newStock = useTradeStore.getState().warehouseInventory.find((w) => w.name.toLowerCase().includes("steel"))?.unitsOnHand || 0;
      expect(newStock).toBe(prevStock + 10000);

      // Verify notification event pushed
      const events = useCampusStore.getState().eventLog;
      const deliveryEvt = events.find((e) => e.type === "FACTORY_MATERIALS_DELIVERED");
      expect(deliveryEvt).toBeDefined();
    });
  });

  describe("Worker Skills & Training Program", () => {
    it("starts training program, debits $15,000, and enables training on the line", () => {
      const store = useFactoryStore.getState();
      const line = store.assemblyLines[0];
      const initialCash = useCompanyFinanceStore.getState().cash;

      const success = store.startLineTrainingProgram(line.id);
      expect(success).toBe(true);

      const updatedLine = useFactoryStore.getState().assemblyLines.find((l) => l.id === line.id);
      expect(updatedLine?.workforceSkill?.trainingProgramActive).toBe(true);
      expect(updatedLine?.workforceSkill?.trainingDaysRemaining).toBe(30);

      expect(useCompanyFinanceStore.getState().cash).toBe(initialCash - 15000);
    });

    it("ticks experience and completes training program after 30 days", () => {
      const store = useFactoryStore.getState();
      const line = store.assemblyLines[0];
      store.startLineTrainingProgram(line.id);

      // Set line to PRODUCING with an active slot
      store.reserveProductionSlot(line.id, {
        vehicleModelId: "test_car",
        vehicleModelName: "Test Sedan",
        startDate: "1970-01-01",
        endDate: "1970-02-01",
        totalProductionDays: 30,
        targetUnits: 1000,
        dailyRate: 20,
        unitCycleTimeMinutes: 12,
        unitBOMCostUSD: 1500,
        unitLaborCostUSD: 350,
        totalCostUSD: 1850000,
        priority: 1,
      });

      // Start production
      store.tickFactoryDay("1970-01-01", 1);

      // Fast forward 30 days
      store.tickFactoryDay("1970-01-31", 30);

      const finishedLine = useFactoryStore.getState().assemblyLines.find((l) => l.id === line.id);
      expect(finishedLine?.workforceSkill?.trainingProgramActive).toBe(false);

      const events = useCampusStore.getState().eventLog;
      const trainingEvt = events.find((e) => e.type === "FACTORY_TRAINING_COMPLETE");
      expect(trainingEvt).toBeDefined();
    });
  });
});
