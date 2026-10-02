/**
 * AUTO TYCOON CAMPUS HQ - CONSTRUCTION MATERIAL LOGISTICS (PHASE 26)
 * 
 * Simulates material delivery supply chains, on-site staging inventory,
 * seasonal weather delays, and workforce labor risks.
 */

import { ConstructionResourceType, ConstructionResourceCost, getResourceUnitPrice } from "./constructionResources";

export interface MaterialOrder {
  orderId: string;
  resource: ConstructionResourceType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  orderDateYear: number;
  orderDateMonth: number;
  leadTimeWeeks: number;
  weeksRemaining: number;
  isDelivered: boolean;
}

export interface MaterialInventory {
  [resource: string]: number; // Current on-site quantity
}

export interface LogisticsWeatherCondition {
  season: "spring" | "summer" | "autumn" | "winter";
  temperatureCelsius: number;
  groundFrozen: boolean;
  severeWeatherActive: boolean;
  constructionDelayRiskPct: number;
}

export function getSeasonForMonth(month: number): "spring" | "summer" | "autumn" | "winter" {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function evaluateSeasonalWeather(month: number): LogisticsWeatherCondition {
  const season = getSeasonForMonth(month);
  switch (season) {
    case "winter":
      return {
        season,
        temperatureCelsius: -2,
        groundFrozen: true,
        severeWeatherActive: Math.random() < 0.25, // 25% blizzard / frost chance
        constructionDelayRiskPct: 35,
      };
    case "spring":
      return {
        season,
        temperatureCelsius: 12,
        groundFrozen: false,
        severeWeatherActive: Math.random() < 0.1, // 10% mud / heavy rain chance
        constructionDelayRiskPct: 10,
      };
    case "summer":
      return {
        season,
        temperatureCelsius: 26,
        groundFrozen: false,
        severeWeatherActive: false,
        constructionDelayRiskPct: 2, // Ideal building weather
      };
    case "autumn":
      return {
        season,
        temperatureCelsius: 14,
        groundFrozen: false,
        severeWeatherActive: Math.random() < 0.15,
        constructionDelayRiskPct: 15,
      };
  }
}

/**
 * Creates a material purchase order with realistic lead times and historical pricing
 */
export function createMaterialOrder(
  resource: ConstructionResourceType,
  quantity: number,
  year: number,
  month: number
): MaterialOrder {
  const unitCost = getResourceUnitPrice(resource, year);
  const totalCost = Math.round(unitCost * quantity);

  // Lead times vary by material bulk
  let leadTimeWeeks = 2;
  if (resource === "STEEL" || resource === "HEAVY_MACHINERY") leadTimeWeeks = 4;
  if (resource === "ELECTRONICS") leadTimeWeeks = 6;
  if (resource === "CONCRETE") leadTimeWeeks = 1; // Locally sourced batch plant

  return {
    orderId: `ORD_${resource}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    resource,
    quantity,
    unitCost,
    totalCost,
    orderDateYear: year,
    orderDateMonth: month,
    leadTimeWeeks,
    weeksRemaining: leadTimeWeeks,
    isDelivered: false,
  };
}

/**
 * Advance transit on pending material orders
 */
export function advanceMaterialOrders(
  orders: MaterialOrder[],
  inventory: MaterialInventory,
  weeksElapsed: number = 4
): { updatedOrders: MaterialOrder[]; updatedInventory: MaterialInventory; newlyDelivered: MaterialOrder[] } {
  const updatedOrders: MaterialOrder[] = [];
  const newlyDelivered: MaterialOrder[] = [];
  const updatedInventory: MaterialInventory = { ...inventory };

  for (const order of orders) {
    if (order.isDelivered) {
      updatedOrders.push(order);
      continue;
    }

    const remaining = order.weeksRemaining - weeksElapsed;
    if (remaining <= 0) {
      const delivered: MaterialOrder = {
        ...order,
        weeksRemaining: 0,
        isDelivered: true,
      };
      newlyDelivered.push(delivered);
      updatedOrders.push(delivered);

      // Add to inventory
      updatedInventory[order.resource] = (updatedInventory[order.resource] || 0) + order.quantity;
    } else {
      updatedOrders.push({
        ...order,
        weeksRemaining: remaining,
      });
    }
  }

  return { updatedOrders, updatedInventory, newlyDelivered };
}

/**
 * Verifies if required materials for a construction step are present in on-site inventory
 */
export function hasSufficientMaterials(
  required: ConstructionResourceCost[],
  inventory: MaterialInventory
): { sufficient: boolean; missing: ConstructionResourceCost[] } {
  const missing: ConstructionResourceCost[] = [];
  for (const item of required) {
    const available = inventory[item.resource] || 0;
    if (available < item.quantity) {
      missing.push({
        resource: item.resource,
        quantity: item.quantity - available,
      });
    }
  }
  return {
    sufficient: missing.length === 0,
    missing,
  };
}
