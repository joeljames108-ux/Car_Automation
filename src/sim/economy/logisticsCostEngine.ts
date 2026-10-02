/**
 * ═══════════════════════════════════════════════════════════════════════
 * LOGISTICS COST ENGINE — FREIGHT MODES, NETWORK & DELIVERY TIMELINES
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 20, 21 & 22:
 *
 * The physical movement of raw materials, inbound Tier-1 components,
 * and finished vehicles to regional dealerships and export ports.
 *
 * Transport Modes:
 * - ROAD_TRUCK: Flexible, direct factory-to-dealer, medium cost
 * - HEAVY_RAIL: Bulk long-distance, 45% cheaper, requires rail spur asset
 * - MARITIME_CONTAINER_RORO: Global export across oceans, lowest cost, 25-35 day lead time
 * - AIR_EXPEDITE: Emergency motorsport spares or prototype rush, 8x cost
 *
 * Logistics failure mechanism (Section 22):
 * Bottlenecks → delayed vehicle deliveries → customer reputation damage!
 */

export type FreightTransportMode =
  | "ROAD_TRUCK"
  | "HEAVY_RAIL"
  | "MARITIME_RORO"
  | "AIR_EXPEDITE";

import { getInflationRecordForDate } from "./historicalInflationData";

export interface FreightRoute {
  id: string;
  origin: string;
  destination: string;
  distanceKm: number;
  primaryMode: FreightTransportMode;
  costPerVehicle: number;
  transitDays: number;
  reliabilityRatePct: number; // e.g. 96%
}

export interface LogisticsFleetState {
  hasOwnedRailSpur: boolean;       // Reduces rail logistics costs by 35%
  hasDedicatedCarrierFleet: boolean; // Owned truck haulers (reduces truck rates by 20%)
  monthlyCarrierLeaseOverhead: number;
  logisticsReputationScore: number;  // 0-100 (high score lowers freight rates)
}

export interface MonthlyLogisticsResult {
  totalVehiclesShipped: number;
  totalFreightCost: number;
  averageCostPerVehicle: number;
  modeBreakdown: Record<FreightTransportMode, { vehicles: number; cost: number }>;
  delayedShipmentsCount: number;
  reputationImpactScore: number; // Penalty if delays are frequent
}

/** Mode baseline costing parameters */
export const FREIGHT_MODE_RATES: Record<FreightTransportMode, { costPerKmPerCar: number; avgSpeedKmh: number; baseReliability: number }> = {
  ROAD_TRUCK: { costPerKmPerCar: 14.5, avgSpeedKmh: 65, baseReliability: 96 },
  HEAVY_RAIL: { costPerKmPerCar: 7.8, avgSpeedKmh: 45, baseReliability: 92 },
  MARITIME_RORO: { costPerKmPerCar: 3.2, avgSpeedKmh: 28, baseReliability: 90 },
  AIR_EXPEDITE: { costPerKmPerCar: 95.0, avgSpeedKmh: 750, baseReliability: 99 },
};

/**
 * Calculate the cost to ship a batch of vehicles along a specific route
 */
export function calculateShipmentCost(
  mode: FreightTransportMode,
  distanceKm: number,
  vehicleCount: number,
  fleetState: LogisticsFleetState,
  year?: number,
  month?: number
): { costPerVehicle: number; totalCost: number; transitDays: number; delayRiskPct: number } {
  const rateInfo = FREIGHT_MODE_RATES[mode];
  let baseCost = rateInfo.costPerKmPerCar * distanceKm;

  // Era scaling: freight fuel & equipment costs follow energy & general CPI indices
  let freightMultiplier = 1.0;
  if (year !== undefined && month !== undefined) {
    const record = getInflationRecordForDate(year, month);
    if (mode === "ROAD_TRUCK" || mode === "MARITIME_RORO") {
      freightMultiplier = record.energyPetrochemIndex * 0.5 + record.generalCPI * 0.5;
    } else if (mode === "HEAVY_RAIL") {
      freightMultiplier = record.metalsIndex * 0.3 + record.energyPetrochemIndex * 0.3 + record.generalCPI * 0.4;
    } else {
      freightMultiplier = record.energyPetrochemIndex * 0.6 + record.generalCPI * 0.4;
    }
  }

  baseCost *= freightMultiplier;

  // Fleet discounts
  if (mode === "HEAVY_RAIL" && fleetState.hasOwnedRailSpur) {
    baseCost *= 0.65; // -35% with owned rail spur
  }
  if (mode === "ROAD_TRUCK" && fleetState.hasDedicatedCarrierFleet) {
    baseCost *= 0.80; // -20% with owned truck fleet
  }

  // Logistics reputation discount: up to 10% commercial discount
  const repDiscount = (fleetState.logisticsReputationScore / 100) * 0.10;
  baseCost *= (1 - repDiscount);

  const costPerVehicle = Math.max(Math.round(1500 * freightMultiplier), Math.round(baseCost));
  const totalCost = costPerVehicle * Math.max(1, vehicleCount);

  // Transit days calculation
  const hours = distanceKm / rateInfo.avgSpeedKmh;
  const transitDays = Math.max(1, Math.ceil(hours / 18)); // 18 active hours/day

  const delayRiskPct = Math.max(2, 100 - rateInfo.baseReliability - (fleetState.logisticsReputationScore > 75 ? 3 : 0));

  return {
    costPerVehicle,
    totalCost,
    transitDays,
    delayRiskPct,
  };
}

/**
 * Process company monthly outbound delivery logistics
 */
export function processMonthlyOutboundLogistics(
  vehiclesByRoute: Array<{ mode: FreightTransportMode; distanceKm: number; count: number }>,
  fleetState: LogisticsFleetState,
  year?: number,
  month?: number
): MonthlyLogisticsResult {
  let totalVehicles = 0;
  const leaseMultiplier = (year !== undefined && month !== undefined)
    ? getInflationRecordForDate(year, month).generalCPI
    : 1.0;
  let totalCost = Math.round(fleetState.monthlyCarrierLeaseOverhead * leaseMultiplier);
  let delayedShipments = 0;

  const modeBreakdown: MonthlyLogisticsResult["modeBreakdown"] = {
    ROAD_TRUCK: { vehicles: 0, cost: 0 },
    HEAVY_RAIL: { vehicles: 0, cost: 0 },
    MARITIME_RORO: { vehicles: 0, cost: 0 },
    AIR_EXPEDITE: { vehicles: 0, cost: 0 },
  };

  for (const shipment of vehiclesByRoute) {
    const calc = calculateShipmentCost(shipment.mode, shipment.distanceKm, shipment.count, fleetState, year, month);
    totalVehicles += shipment.count;
    totalCost += calc.totalCost;

    modeBreakdown[shipment.mode].vehicles += shipment.count;
    modeBreakdown[shipment.mode].cost += calc.totalCost;

    if (Math.random() * 100 < calc.delayRiskPct) {
      delayedShipments += Math.ceil(shipment.count * 0.08); // 8% of this batch delayed
    }
  }

  const averageCostPerVehicle = totalVehicles > 0 ? Math.round(totalCost / totalVehicles) : 0;
  // Reputation penalty if > 5% of shipments experienced delivery delays
  const delayPct = totalVehicles > 0 ? (delayedShipments / totalVehicles) * 100 : 0;
  const reputationImpactScore = delayPct > 5 ? -Number(((delayPct - 5) * 0.2).toFixed(1)) : 0.2;

  return {
    totalVehiclesShipped: totalVehicles,
    totalFreightCost: totalCost,
    averageCostPerVehicle,
    modeBreakdown,
    delayedShipmentsCount: delayedShipments,
    reputationImpactScore,
  };
}
