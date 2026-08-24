// ===================================================================
// DYNAMIC INVENTORY CONTROL & KANBAN JIT ENGINE
// ===================================================================
// Implements Economic Order Quantity (EOQ), Reorder Point (ROP),
// Safety Stock modeling, ABC Inventory Classification, and JIT Kanban.
// ===================================================================

export type ABCInventoryClass = "CLASS_A_CRITICAL" | "CLASS_B_STANDARD" | "CLASS_C_BULK_FASTENERS";

export interface InventoryItemState {
  partId: string;
  partName: string;
  unitCostUSD: number;
  currentStockUnits: number;
  safetyStockUnits: number;
  reorderPointUnits: number;
  economicOrderQuantityUnits: number;
  annualDemandUnits: number;
  leadTimeWeeks: number;
  abcClass: ABCInventoryClass;
  holdingCostRateAnnualPct: number; // e.g. 15% holding cost per year
  orderingCostUSD: number; // Fixed cost per purchase order placed
  totalValueUSD: number;
  isReorderTriggered: boolean;
}

export class InventoryControlEngine {
  /**
   * Computes Economic Order Quantity (EOQ) formula: sqrt((2 * D * S) / H)
   * where D = Annual Demand, S = Order Cost, H = Annual Holding Cost per unit
   */
  public static calculateEOQ(annualDemand: number, orderingCostUSD: number, unitCostUSD: number, holdingRateAnnualPct: number): number {
    const annualHoldingCostPerUnit = unitCostUSD * (holdingRateAnnualPct / 100);
    if (annualHoldingCostPerUnit <= 0 || annualDemand <= 0) return annualDemand;

    const eoq = Math.sqrt((2 * annualDemand * orderingCostUSD) / annualHoldingCostPerUnit);
    return Math.max(1, Math.round(eoq));
  }

  /**
   * Computes Reorder Point (ROP) = (Daily Demand * Lead Time Days) + Safety Stock
   */
  public static calculateROP(annualDemand: number, leadTimeWeeks: number, serviceLevelZScore: number = 1.65, demandStdDev: number = 10): {
    reorderPoint: number;
    safetyStock: number;
  } {
    const dailyDemand = annualDemand / 365;
    const leadTimeDays = leadTimeWeeks * 7;

    // Safety Stock formula: Z * stdDev * sqrt(LeadTimeDays)
    const safetyStock = Math.round(serviceLevelZScore * demandStdDev * Math.sqrt(leadTimeDays));
    const reorderPoint = Math.round(dailyDemand * leadTimeDays + safetyStock);

    return { reorderPoint, safetyStock };
  }

  /**
   * Evaluates inventory status and determines if a Kanban JIT replenishment order should be fired.
   */
  public static evaluateItemStatus(item: InventoryItemState): {
    updatedItem: InventoryItemState;
    recommendedOrderUnits: number;
    urgencyLevel: "HEALTHY" | "REORDER_TRIGGERED" | "STOCKOUT_IMMINENT";
  } {
    const totalValueUSD = Number((item.currentStockUnits * item.unitCostUSD).toFixed(2));
    const isReorderTriggered = item.currentStockUnits <= item.reorderPointUnits;

    let urgencyLevel: "HEALTHY" | "REORDER_TRIGGERED" | "STOCKOUT_IMMINENT" = "HEALTHY";
    if (item.currentStockUnits <= item.safetyStockUnits / 2) {
      urgencyLevel = "STOCKOUT_IMMINENT";
    } else if (isReorderTriggered) {
      urgencyLevel = "REORDER_TRIGGERED";
    }

    const recommendedOrderUnits = isReorderTriggered ? item.economicOrderQuantityUnits : 0;

    return {
      updatedItem: {
        ...item,
        totalValueUSD,
        isReorderTriggered,
      },
      recommendedOrderUnits,
      urgencyLevel,
    };
  }

  /**
   * Classifies inventory into ABC categories based on annual usage value.
   */
  public static classifyABC(items: InventoryItemState[]): InventoryItemState[] {
    const itemsWithValue = items.map((i) => ({
      item: i,
      annualValue: i.annualDemandUnits * i.unitCostUSD,
    }));

    // Sort descending by annual usage value
    itemsWithValue.sort((a, b) => b.annualValue - a.annualValue);

    const totalAnnualValue = itemsWithValue.reduce((acc, curr) => acc + curr.annualValue, 0);

    let cumulativeValue = 0;
    return itemsWithValue.map(({ item, annualValue }) => {
      cumulativeValue += annualValue;
      const cumulativePct = cumulativeValue / totalAnnualValue;

      let abcClass: ABCInventoryClass = "CLASS_C_BULK_FASTENERS";
      if (cumulativePct <= 0.80) {
        abcClass = "CLASS_A_CRITICAL"; // Top 80% value (~20% items)
      } else if (cumulativePct <= 0.95) {
        abcClass = "CLASS_B_STANDARD"; // Next 15% value (~30% items)
      }

      return {
        ...item,
        abcClass,
      };
    });
  }
}
