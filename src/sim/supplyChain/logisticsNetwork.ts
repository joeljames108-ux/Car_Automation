// ===================================================================
// GLOBAL MULTI-MODAL LOGISTICS & SHIPPING NETWORK ENGINE
// ===================================================================
// Simulates international freight transit times, carbon intensity,
// maritime canal bottlenecks, customs delays, and expediting logistics.
// ===================================================================

export type FreightTransportMode =
  | "MARITIME_CONTAINER"
  | "AIR_FREIGHT_EXPRESS"
  | "RAIL_INTERMODAL"
  | "OVERLAND_TRUCKING";

export type LogisticsHubRegion =
  | "EAST_ASIA_SHANGHAI"
  | "JAPAN_YOKOHAMA"
  | "EUROPE_ROTTERDAM"
  | "NORTH_AMERICA_LOS_ANGELES"
  | "MEXICO_MONTERREY";

export interface FreightRouteConfig {
  origin: LogisticsHubRegion;
  destination: LogisticsHubRegion;
  transportMode: FreightTransportMode;
  baseTransitDays: number;
  costPerTonneUSD: number;
  co2EmissionsKgPerTonneKm: number;
  customsClearanceDays: number;
  bottleneckRiskFactor: number; // 0 - 1.0 (e.g. Suez Canal / port congestion)
}

export interface ActiveShipmentTracker {
  shipmentId: string;
  partDescription: string;
  origin: LogisticsHubRegion;
  destination: LogisticsHubRegion;
  transportMode: FreightTransportMode;
  cargoWeightTonnes: number;
  departedDay: number;
  estimatedArrivalDay: number;
  actualArrivalDay?: number;
  isDelayedByBottleneck: boolean;
  delayReason?: string;
  freightCostUSD: number;
}

export class LogisticsNetworkEngine {
  private static ROUTE_DATABASE: FreightRouteConfig[] = [
    // Shanghai -> LA (Maritime)
    {
      origin: "EAST_ASIA_SHANGHAI",
      destination: "NORTH_AMERICA_LOS_ANGELES",
      transportMode: "MARITIME_CONTAINER",
      baseTransitDays: 16,
      costPerTonneUSD: 180,
      co2EmissionsKgPerTonneKm: 0.015,
      customsClearanceDays: 3,
      bottleneckRiskFactor: 0.35,
    },
    // Shanghai -> LA (Air Freight)
    {
      origin: "EAST_ASIA_SHANGHAI",
      destination: "NORTH_AMERICA_LOS_ANGELES",
      transportMode: "AIR_FREIGHT_EXPRESS",
      baseTransitDays: 2,
      costPerTonneUSD: 3200,
      co2EmissionsKgPerTonneKm: 0.60,
      customsClearanceDays: 1,
      bottleneckRiskFactor: 0.05,
    },
    // Yokohama -> Rotterdam (Maritime via Suez)
    {
      origin: "JAPAN_YOKOHAMA",
      destination: "EUROPE_ROTTERDAM",
      transportMode: "MARITIME_CONTAINER",
      baseTransitDays: 32,
      costPerTonneUSD: 240,
      co2EmissionsKgPerTonneKm: 0.018,
      customsClearanceDays: 4,
      bottleneckRiskFactor: 0.60,
    },
    // Rotterdam -> Monterrey (Maritime)
    {
      origin: "EUROPE_ROTTERDAM",
      destination: "MEXICO_MONTERREY",
      transportMode: "MARITIME_CONTAINER",
      baseTransitDays: 22,
      costPerTonneUSD: 210,
      co2EmissionsKgPerTonneKm: 0.016,
      customsClearanceDays: 3,
      bottleneckRiskFactor: 0.20,
    },
    // Monterrey -> LA (Overland Trucking)
    {
      origin: "MEXICO_MONTERREY",
      destination: "NORTH_AMERICA_LOS_ANGELES",
      transportMode: "OVERLAND_TRUCKING",
      baseTransitDays: 4,
      costPerTonneUSD: 450,
      co2EmissionsKgPerTonneKm: 0.12,
      customsClearanceDays: 2,
      bottleneckRiskFactor: 0.15,
    },
  ];

  /**
   * Dispatches a new shipment across the optimal or requested transport mode.
   */
  public static dispatchShipment(params: {
    shipmentId: string;
    partDescription: string;
    origin: LogisticsHubRegion;
    destination: LogisticsHubRegion;
    transportMode: FreightTransportMode;
    cargoWeightTonnes: number;
    currentSimulationDay: number;
    expediteEmergency?: boolean;
  }): ActiveShipmentTracker {
    const {
      shipmentId,
      partDescription,
      origin,
      destination,
      transportMode,
      cargoWeightTonnes,
      currentSimulationDay,
      expediteEmergency,
    } = params;

    let route = this.ROUTE_DATABASE.find(
      (r) => r.origin === origin && r.destination === destination && r.transportMode === transportMode
    );

    // Fallback default route if exact lane not explicitly mapped
    if (!route) {
      route = {
        origin,
        destination,
        transportMode,
        baseTransitDays: transportMode === "AIR_FREIGHT_EXPRESS" ? 3 : 21,
        costPerTonneUSD: transportMode === "AIR_FREIGHT_EXPRESS" ? 3500 : 250,
        co2EmissionsKgPerTonneKm: 0.02,
        customsClearanceDays: 3,
        bottleneckRiskFactor: 0.25,
      };
    }

    let totalTransitDays = route.baseTransitDays + route.customsClearanceDays;
    let freightCostUSD = cargoWeightTonnes * route.costPerTonneUSD;

    if (expediteEmergency) {
      // Emergency air-freight override
      totalTransitDays = Math.max(2, Math.round(totalTransitDays * 0.2));
      freightCostUSD *= 4.5; // 4.5x expediting premium
    }

    // Check for bottleneck delays
    const isDelayedByBottleneck = Math.random() < route.bottleneckRiskFactor;
    let delayDays = 0;
    let delayReason: string | undefined;

    if (isDelayedByBottleneck) {
      delayDays = Math.floor(Math.random() * 10) + 3;
      delayReason = `Port Congestion & Canal Bottleneck at ${origin} -> ${destination} route (+${delayDays} days)`;
      totalTransitDays += delayDays;
    }

    return {
      shipmentId,
      partDescription,
      origin,
      destination,
      transportMode,
      cargoWeightTonnes,
      departedDay: currentSimulationDay,
      estimatedArrivalDay: currentSimulationDay + totalTransitDays,
      isDelayedByBottleneck,
      delayReason,
      freightCostUSD: Number(freightCostUSD.toFixed(2)),
    };
  }

  /**
   * Computes carbon footprint (tonnes CO2e) for a cargo shipment.
   */
  public static calculateCargoCarbonFootprint(
    cargoWeightTonnes: number,
    distanceKm: number,
    transportMode: FreightTransportMode
  ): number {
    const intensityMap: Record<FreightTransportMode, number> = {
      MARITIME_CONTAINER: 0.015,
      RAIL_INTERMODAL: 0.04,
      OVERLAND_TRUCKING: 0.12,
      AIR_FREIGHT_EXPRESS: 0.60,
    };

    const co2Kg = cargoWeightTonnes * distanceKm * intensityMap[transportMode];
    return Number((co2Kg / 1000).toFixed(3)); // Convert to tonnes CO2e
  }
}
