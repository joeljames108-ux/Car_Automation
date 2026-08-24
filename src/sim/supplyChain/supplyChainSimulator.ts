// ===================================================================
// MASTER SUPPLY CHAIN DISCRETE-EVENT SIMULATION TICK ENGINE
// ===================================================================
// Simulates multi-echelon factory replenishment, transit tracking,
// line stoppages, cost variance, PPM defects, and warranty chargebacks.
// ===================================================================

import { GLOBAL_SUPPLIER_CATALOG, GlobalSupplier, SupplyCategory } from "./supplierRegistry";
import { RawMaterialsMarketEngine } from "./rawMaterialsMarket";
import { LogisticsNetworkEngine, ActiveShipmentTracker } from "./logisticsNetwork";
import { InventoryControlEngine, InventoryItemState } from "./inventoryControlEngine";
import { SupplierRiskAndAuditEngine } from "./supplierRiskAndAudit";

export interface FactoryProductionSchedule {
  dailyTargetVehicles: number;
  activeShiftCount: 1 | 2 | 3;
  assemblyLineStatus: "RUNNING_NOMINAL" | "LINE_DEGRADED" | "FACTORY_HALTED";
  haltReason?: string;
}

export interface SupplyChainSimulationTickResult {
  simulationDay: number;
  factoryStatus: FactoryProductionSchedule;
  totalActiveShipments: number;
  totalStockoutCount: number;
  dailyProcurementCostUSD: number;
  dailyLogisticsCostUSD: number;
  totalPpmDefectCount: number;
  warrantyChargebackUSD: number;
  activeAlerts: string[];
}

export class SupplyChainSimulator {
  private currentDay: number = 0;
  private inventoryMap: Map<string, InventoryItemState> = new Map();
  private activeShipments: ActiveShipmentTracker[] = [];
  private factorySchedule: FactoryProductionSchedule = {
    dailyTargetVehicles: 200,
    activeShiftCount: 2,
    assemblyLineStatus: "RUNNING_NOMINAL",
  };

  constructor() {
    this.initializeDefaultInventory();
  }

  /**
   * Initializes default component inventory items.
   */
  private initializeDefaultInventory(): void {
    const defaultCategories: SupplyCategory[] = [
      "BRAKES_FRICTION",
      "TIRES_RUBBER",
      "ECU_SEMICONDUCTORS",
      "BATTERY_CELLS",
      "COMPOSITES_CARBON",
      "TURBO_SUPERCHARGERS",
      "TRANSMISSION_GEARS",
      "SUSPENSION_DAMPERS",
    ];

    defaultCategories.forEach((cat) => {
      const supplier = GLOBAL_SUPPLIER_CATALOG.find((s) => s.category === cat) || GLOBAL_SUPPLIER_CATALOG[0];
      const annualDemand = 73000; // 200 cars/day * 365 days
      const unitCost = 250 * supplier.costMultiplier;
      const { reorderPoint, safetyStock } = InventoryControlEngine.calculateROP(annualDemand, supplier.leadTimeWeeks);
      const eoq = InventoryControlEngine.calculateEOQ(annualDemand, 500, unitCost, 15);

      this.inventoryMap.set(cat, {
        partId: `PART_${cat}`,
        partName: `${cat} Module`,
        unitCostUSD: Number(unitCost.toFixed(2)),
        currentStockUnits: reorderPoint * 2,
        safetyStockUnits: safetyStock,
        reorderPointUnits: reorderPoint,
        economicOrderQuantityUnits: eoq,
        annualDemandUnits: annualDemand,
        leadTimeWeeks: supplier.leadTimeWeeks,
        abcClass: "CLASS_A_CRITICAL",
        holdingCostRateAnnualPct: 15,
        orderingCostUSD: 500,
        totalValueUSD: Number((reorderPoint * 2 * unitCost).toFixed(2)),
        isReorderTriggered: false,
      });
    });
  }

  /**
   * Advances the simulation by 1 day.
   */
  public stepSimulationTick(): SupplyChainSimulationTickResult {
    this.currentDay += 1;
    const alerts: string[] = [];
    let dailyProcurementCostUSD = 0;
    let dailyLogisticsCostUSD = 0;
    let totalPpmDefectCount = 0;
    let stockoutCount = 0;

    // 1. Simulate Raw Material Price Fluctuation
    RawMaterialsMarketEngine.simulateMarketTick({
      macroInflationRatePct: 2.5,
      geopoliticalRiskFactor: 1.1,
    });

    // 2. Process Arriving Shipments
    const remainingShipments: ActiveShipmentTracker[] = [];
    this.activeShipments.forEach((shipment) => {
      if (this.currentDay >= shipment.estimatedArrivalDay) {
        // Arrived at factory! Replenish stock
        const categoryKey = shipment.partDescription.replace(" Shipments", "") as SupplyCategory;
        const item = this.inventoryMap.get(categoryKey);
        if (item) {
          item.currentStockUnits += shipment.cargoWeightTonnes * 1000; // Assume 1 tonne = 1000 units
          item.totalValueUSD = Number((item.currentStockUnits * item.unitCostUSD).toFixed(2));
        }
        alerts.push(`SHIPMENT ARRIVED: ${shipment.shipmentId} arrived at factory deck.`);
      } else {
        remainingShipments.push(shipment);
      }
    });
    this.activeShipments = remainingShipments;

    // 3. Daily Factory Production Consumption
    let lineHalted = false;
    let haltReason = "";

    this.inventoryMap.forEach((item, category) => {
      // Each car consumes 1 unit of each component
      const requiredUnits = this.factorySchedule.dailyTargetVehicles;
      if (item.currentStockUnits >= requiredUnits) {
        item.currentStockUnits -= requiredUnits;
      } else {
        // Stockout! Factory line halted
        stockoutCount += 1;
        lineHalted = true;
        haltReason = `CRITICAL STOCKOUT: ${item.partName} inventory exhausted (${item.currentStockUnits} units available, ${requiredUnits} required).`;
        alerts.push(haltReason);
      }

      // Check reorder trigger
      const status = InventoryControlEngine.evaluateItemStatus(item);
      this.inventoryMap.set(category, status.updatedItem);

      if (status.urgencyLevel === "REORDER_TRIGGERED" || status.urgencyLevel === "STOCKOUT_IMMINENT") {
        // Trigger automated Kanban replenishment order
        const supplier = GLOBAL_SUPPLIER_CATALOG.find((s) => s.category === category) || GLOBAL_SUPPLIER_CATALOG[0];

        const shipment = LogisticsNetworkEngine.dispatchShipment({
          shipmentId: `SHP_DAY${this.currentDay}_${category}`,
          partDescription: `${category} Shipments`,
          origin: supplier.continent === "EUROPE" ? "EUROPE_ROTTERDAM" : "EAST_ASIA_SHANGHAI",
          destination: "NORTH_AMERICA_LOS_ANGELES",
          transportMode: status.urgencyLevel === "STOCKOUT_IMMINENT" ? "AIR_FREIGHT_EXPRESS" : "MARITIME_CONTAINER",
          cargoWeightTonnes: status.recommendedOrderUnits / 1000,
          currentSimulationDay: this.currentDay,
          expediteEmergency: status.urgencyLevel === "STOCKOUT_IMMINENT",
        });

        this.activeShipments.push(shipment);
        dailyProcurementCostUSD += status.recommendedOrderUnits * item.unitCostUSD;
        dailyLogisticsCostUSD += shipment.freightCostUSD;

        alerts.push(
          `KANBAN ORDER FIRED: Placed order for ${status.recommendedOrderUnits} units of ${item.partName} with ${supplier.name}.`
        );
      }
    });

    // 4. Update Factory Schedule Status
    if (lineHalted) {
      this.factorySchedule.assemblyLineStatus = "FACTORY_HALTED";
      this.factorySchedule.haltReason = haltReason;
    } else {
      this.factorySchedule.assemblyLineStatus = "RUNNING_NOMINAL";
      this.factorySchedule.haltReason = undefined;
    }

    // Calculate PPM defect chargebacks
    const totalPartsConsumed = this.factorySchedule.dailyTargetVehicles * this.inventoryMap.size;
    totalPpmDefectCount = Math.round((totalPartsConsumed * 25) / 1000000); // 25 PPM average
    const warrantyChargebackUSD = totalPpmDefectCount * 450; // $450 repair cost per defect

    return {
      simulationDay: this.currentDay,
      factoryStatus: { ...this.factorySchedule },
      totalActiveShipments: this.activeShipments.length,
      totalStockoutCount: stockoutCount,
      dailyProcurementCostUSD: Number(dailyProcurementCostUSD.toFixed(2)),
      dailyLogisticsCostUSD: Number(dailyLogisticsCostUSD.toFixed(2)),
      totalPpmDefectCount,
      warrantyChargebackUSD: Number(warrantyChargebackUSD.toFixed(2)),
      activeAlerts: alerts,
    };
  }
}
