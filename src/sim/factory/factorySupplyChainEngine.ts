/**
 * ═══════════════════════════════════════════════════════════════════════
 * FACTORY SUPPLY CHAIN & PURCHASE ORDER LEAD-TIME ENGINE (PHASE 2)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements realistic supplier lead-times, purchase order logistics,
 * volume-tier bulk discounts, and physical warehouse consumption.
 *
 * Core rule:
 * Materials do not magically appear in the warehouse. Players must forecast
 * requirements and order raw commodities (Steel, Aluminium, Rubber, Glass,
 * Tyres, Electronics) with 5–18 day lead times ahead of scheduled assembly.
 */

import { WarehouseInventoryRecord } from "../trade/tradeTypes";
import {
  BASE_COMMODITY_PRICES_1970,
  BASE_VEHICLE_MATERIAL_NORMS,
} from "./factoryBOMEngine";

export interface CommoditySupplySpec {
  id: string;
  name: string;
  category: "raw_metals" | "polymers" | "components" | "powertrain";
  unit: string;
  baseUnitPriceUSD: number;
  minLeadTimeDays: number;
  maxLeadTimeDays: number;
  nominalLeadTimeDays: number;
  bulkDiscountThreshold: number;
  bulkDiscountPct: number;
}

export interface PurchaseOrder {
  id: string;
  materialId: string;
  materialName: string;
  category: "raw_metals" | "polymers" | "components" | "powertrain";
  unit: string;
  quantity: number;
  unitPriceUSD: number;
  bulkDiscountPct: number;
  totalCostUSD: number;
  orderDate: string;        // YYYY-MM-DD
  deliveryDate: string;     // YYYY-MM-DD
  daysRemaining: number;
  status: "PENDING" | "DELIVERED" | "CANCELLED";
  targetSlotId?: string;
}

export const COMMODITY_SUPPLY_SPECS: Record<string, CommoditySupplySpec> = {
  mat_steel: {
    id: "mat_steel",
    name: "Deep-Draw Stamping Steel",
    category: "raw_metals",
    unit: "kg",
    baseUnitPriceUSD: BASE_COMMODITY_PRICES_1970.steelPerKg, // $1.25/kg
    minLeadTimeDays: 8,
    maxLeadTimeDays: 12,
    nominalLeadTimeDays: 10,
    bulkDiscountThreshold: 50000, // 50 tonnes
    bulkDiscountPct: 8,           // 8% discount
  },
  mat_aluminium: {
    id: "mat_aluminium",
    name: "Structural Aluminium Alloy",
    category: "raw_metals",
    unit: "kg",
    baseUnitPriceUSD: BASE_COMMODITY_PRICES_1970.aluminiumPerKg, // $3.40/kg
    minLeadTimeDays: 10,
    maxLeadTimeDays: 14,
    nominalLeadTimeDays: 12,
    bulkDiscountThreshold: 20000, // 20 tonnes
    bulkDiscountPct: 6,
  },
  mat_polymers: {
    id: "mat_polymers",
    name: "Molded Polymers & Elastomers",
    category: "polymers",
    unit: "kg",
    baseUnitPriceUSD: BASE_COMMODITY_PRICES_1970.plasticsRubberPerKg, // $2.75/kg
    minLeadTimeDays: 7,
    maxLeadTimeDays: 10,
    nominalLeadTimeDays: 8,
    bulkDiscountThreshold: 10000,
    bulkDiscountPct: 5,
  },
  mat_glass: {
    id: "mat_glass",
    name: "Laminated Safety Glass",
    category: "components",
    unit: "kg",
    baseUnitPriceUSD: BASE_COMMODITY_PRICES_1970.glassPerKg, // $2.15/kg
    minLeadTimeDays: 5,
    maxLeadTimeDays: 7,
    nominalLeadTimeDays: 6,
    bulkDiscountThreshold: 5000,
    bulkDiscountPct: 5,
  },
  mat_tyres: {
    id: "mat_tyres",
    name: "Radial Performance Tyres",
    category: "components",
    unit: "sets",
    baseUnitPriceUSD: BASE_COMMODITY_PRICES_1970.tyreUnit, // $68/set
    minLeadTimeDays: 6,
    maxLeadTimeDays: 10,
    nominalLeadTimeDays: 8,
    bulkDiscountThreshold: 200, // 200 car sets
    bulkDiscountPct: 10,
  },
  mat_electronics: {
    id: "mat_electronics",
    name: "Wiring Harness & Solid-State Relays",
    category: "components",
    unit: "units",
    baseUnitPriceUSD: BASE_COMMODITY_PRICES_1970.electronicsUnit, // $360/unit
    minLeadTimeDays: 12,
    maxLeadTimeDays: 18,
    nominalLeadTimeDays: 15,
    bulkDiscountThreshold: 100,
    bulkDiscountPct: 4,
  },
};

/**
 * Retrieves the supply spec for a given material ID.
 */
export function getMaterialSupplySpec(materialId: string): CommoditySupplySpec {
  return (
    COMMODITY_SUPPLY_SPECS[materialId] || {
      id: materialId,
      name: "Standard Manufacturing Parts",
      category: "components",
      unit: "units",
      baseUnitPriceUSD: 50.0,
      minLeadTimeDays: 7,
      maxLeadTimeDays: 12,
      nominalLeadTimeDays: 9,
      bulkDiscountThreshold: 1000,
      bulkDiscountPct: 5,
    }
  );
}

/**
 * Calculates deterministic or randomized lead time for a commodity.
 */
export function calculateLeadTime(materialId: string, rngFactor = 0.5): number {
  const spec = getMaterialSupplySpec(materialId);
  const spread = spec.maxLeadTimeDays - spec.minLeadTimeDays;
  return Math.round(spec.minLeadTimeDays + spread * Math.max(0, Math.min(1, rngFactor)));
}

/**
 * Calculates applicable bulk discount percentage based on order volume.
 */
export function calculateBulkDiscount(materialId: string, quantity: number): number {
  const spec = getMaterialSupplySpec(materialId);
  if (quantity >= spec.bulkDiscountThreshold) {
    return spec.bulkDiscountPct;
  }
  return 0;
}

/**
 * Computes pricing and discounts for a purchase order.
 */
export function calculatePurchaseOrderCost(
  materialId: string,
  quantity: number
): { unitPrice: number; discountPct: number; totalCost: number } {
  const spec = getMaterialSupplySpec(materialId);
  const discountPct = calculateBulkDiscount(materialId, quantity);
  const effectiveUnitPrice = spec.baseUnitPriceUSD * (1 - discountPct / 100);
  const totalCost = Math.round(quantity * effectiveUnitPrice);

  return {
    unitPrice: Math.round(effectiveUnitPrice * 100) / 100,
    discountPct,
    totalCost,
  };
}

/**
 * Formats a date offset in YYYY-MM-DD format.
 */
function addDaysToDateStr(baseDateStr: string, daysToAdd: number): string {
  try {
    const parts = baseDateStr.split("-").map(Number);
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + daysToAdd));
    return d.toISOString().split("T")[0];
  } catch {
    return baseDateStr;
  }
}

/**
 * Creates a new purchase order with computed lead-times and bulk pricing.
 */
export function createPurchaseOrder(params: {
  materialId: string;
  quantity: number;
  orderDateStr: string;
  targetSlotId?: string;
  leadTimeDays?: number;
}): PurchaseOrder {
  const spec = getMaterialSupplySpec(params.materialId);
  const leadDays = params.leadTimeDays ?? spec.nominalLeadTimeDays;
  const cost = calculatePurchaseOrderCost(params.materialId, params.quantity);
  const deliveryDateStr = addDaysToDateStr(params.orderDateStr, leadDays);

  return {
    id: `PO_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    materialId: spec.id,
    materialName: spec.name,
    category: spec.category,
    unit: spec.unit,
    quantity: Math.max(1, Math.round(params.quantity)),
    unitPriceUSD: cost.unitPrice,
    bulkDiscountPct: cost.discountPct,
    totalCostUSD: cost.totalCost,
    orderDate: params.orderDateStr,
    deliveryDate: deliveryDateStr,
    daysRemaining: leadDays,
    status: "PENDING",
    targetSlotId: params.targetSlotId,
  };
}

/**
 * Ticks purchase order countdowns. When daysRemaining reaches 0, marks as DELIVERED.
 */
export function tickPurchaseOrders(
  orders: PurchaseOrder[],
  elapsedDays = 1
): { updatedOrders: PurchaseOrder[]; newlyDelivered: PurchaseOrder[] } {
  const updatedOrders: PurchaseOrder[] = [];
  const newlyDelivered: PurchaseOrder[] = [];

  for (const po of orders) {
    if (po.status !== "PENDING") {
      updatedOrders.push(po);
      continue;
    }

    const nextDays = Math.max(0, po.daysRemaining - elapsedDays);
    if (nextDays === 0) {
      const delivered: PurchaseOrder = {
        ...po,
        daysRemaining: 0,
        status: "DELIVERED",
      };
      updatedOrders.push(delivered);
      newlyDelivered.push(delivered);
    } else {
      updatedOrders.push({
        ...po,
        daysRemaining: nextDays,
      });
    }
  }

  return { updatedOrders, newlyDelivered };
}

/**
 * Helper to match warehouse inventory items to factory material keys.
 */
export function findWarehouseItemForMaterial(
  materialId: string,
  warehouseInventory: WarehouseInventoryRecord[]
): WarehouseInventoryRecord | undefined {
  const key = materialId.replace("mat_", "").toLowerCase();
  return warehouseInventory.find(
    (w) =>
      w.id.toLowerCase().includes(key) ||
      w.name.toLowerCase().includes(key) ||
      (key === "polymers" && (w.name.toLowerCase().includes("plastic") || w.name.toLowerCase().includes("rubber")))
  );
}

export interface MaterialShortageCheck {
  isFeasible: boolean;
  shortages: {
    materialId: string;
    name: string;
    unit: string;
    required: number;
    inStock: number;
    deficit: number;
  }[];
}

/**
 * Checks if current warehouse inventory has sufficient materials to build N units.
 */
export function checkBOMShortagesForProduction(
  units: number,
  warehouseInventory: WarehouseInventoryRecord[]
): MaterialShortageCheck {
  if (units <= 0) return { isFeasible: true, shortages: [] };

  const requiredNorms: { id: string; norm: number; name: string; unit: string }[] = [
    { id: "mat_steel", norm: BASE_VEHICLE_MATERIAL_NORMS.steelKg, name: "Stamping Steel", unit: "kg" },
    { id: "mat_aluminium", norm: BASE_VEHICLE_MATERIAL_NORMS.aluminiumKg, name: "Aluminium Alloy", unit: "kg" },
    { id: "mat_polymers", norm: BASE_VEHICLE_MATERIAL_NORMS.plasticsRubberKg, name: "Polymers & Rubber", unit: "kg" },
    { id: "mat_glass", norm: BASE_VEHICLE_MATERIAL_NORMS.glassKg, name: "Safety Glass", unit: "kg" },
    { id: "mat_tyres", norm: BASE_VEHICLE_MATERIAL_NORMS.tyresCount, name: "Tyres", unit: "sets" },
    { id: "mat_electronics", norm: BASE_VEHICLE_MATERIAL_NORMS.electronicsUnits, name: "Electronics", unit: "units" },
  ];

  const shortages: MaterialShortageCheck["shortages"] = [];

  for (const item of requiredNorms) {
    const totalRequired = item.norm * units;
    const inv = findWarehouseItemForMaterial(item.id, warehouseInventory);
    const inStock = inv ? inv.unitsOnHand : 10000; // Default buffer if not yet seeded

    if (inStock < totalRequired) {
      shortages.push({
        materialId: item.id,
        name: item.name,
        unit: item.unit,
        required: totalRequired,
        inStock,
        deficit: totalRequired - inStock,
      });
    }
  }

  return {
    isFeasible: shortages.length === 0,
    shortages,
  };
}

/**
 * Deducts consumed materials from warehouse stock for finished vehicles.
 */
export function deductBOMConsumption(
  unitsProduced: number,
  warehouseInventory: WarehouseInventoryRecord[]
): {
  updatedInventory: WarehouseInventoryRecord[];
  consumed: { materialId: string; name: string; amount: number; unit: string }[];
} {
  if (unitsProduced <= 0 || warehouseInventory.length === 0) {
    return { updatedInventory: warehouseInventory, consumed: [] };
  }

  const requirements = [
    { id: "mat_steel", norm: BASE_VEHICLE_MATERIAL_NORMS.steelKg, unit: "kg" },
    { id: "mat_aluminium", norm: BASE_VEHICLE_MATERIAL_NORMS.aluminiumKg, unit: "kg" },
    { id: "mat_polymers", norm: BASE_VEHICLE_MATERIAL_NORMS.plasticsRubberKg, unit: "kg" },
    { id: "mat_glass", norm: BASE_VEHICLE_MATERIAL_NORMS.glassKg, unit: "kg" },
    { id: "mat_tyres", norm: BASE_VEHICLE_MATERIAL_NORMS.tyresCount, unit: "sets" },
    { id: "mat_electronics", norm: BASE_VEHICLE_MATERIAL_NORMS.electronicsUnits, unit: "units" },
  ];

  const consumed: { materialId: string; name: string; amount: number; unit: string }[] = [];
  const nextInventory = warehouseInventory.map((item) => ({ ...item }));

  for (const req of requirements) {
    const needed = req.norm * unitsProduced;
    const matched = findWarehouseItemForMaterial(req.id, nextInventory);
    if (matched) {
      const actualDeducted = Math.min(matched.unitsOnHand, needed);
      matched.unitsOnHand = Math.max(0, matched.unitsOnHand - actualDeducted);
      consumed.push({
        materialId: req.id,
        name: matched.name,
        amount: actualDeducted,
        unit: req.unit,
      });
    }
  }

  return { updatedInventory: nextInventory, consumed };
}

/**
 * Adds delivered purchase order commodities into warehouse inventory stock.
 */
export function addDeliveredStockToWarehouse(
  order: PurchaseOrder,
  warehouseInventory: WarehouseInventoryRecord[]
): WarehouseInventoryRecord[] {
  const nextInventory = warehouseInventory.map((item) => ({ ...item }));
  const matched = findWarehouseItemForMaterial(order.materialId, nextInventory);

  if (matched) {
    const prevUnits = matched.unitsOnHand;
    const addedUnits = order.quantity;
    const totalUnits = prevUnits + addedUnits;

    // Weighted average cost update (rounded to cents)
    const prevTotalCost = prevUnits * (matched.averageUnitCost || order.unitPriceUSD);
    const addedTotalCost = order.totalCostUSD;
    matched.averageUnitCost =
      totalUnits > 0
        ? Math.round(((prevTotalCost + addedTotalCost) / totalUnits) * 100) / 100
        : order.unitPriceUSD;
    matched.unitsOnHand = totalUnits;
  } else {
    // If not found in warehouse, create new entry
    nextInventory.push({
      id: `inv_${order.materialId}_${Date.now()}`,
      itemType: (order.materialId.replace("mat_", "").toUpperCase()) as any,
      name: order.materialName,
      level: "LEVEL_2_PROCESSED",
      unitsOnHand: order.quantity,
      unitOfMeasure: order.unit as any,
      averageUnitCost: order.unitPriceUSD,
      qualityVector: {
        strength: 85,
        weightIndex: 50,
        consistency: 88,
        purity: 85,
        corrosionResistance: 75,
        heatResistance: 70,
        manufacturability: 85,
      },
      overallQualityScore: 85,
      warehouseFacilityId: "wh_main",
      holdingCostMonthlyRate: 0.015,
      reorderPoint: Math.round(order.quantity * 0.2),
      safetyStockTarget: Math.round(order.quantity * 0.3),
      storageMaxCapacity: Math.round(order.quantity * 3),
    });
  }

  return nextInventory;
}
