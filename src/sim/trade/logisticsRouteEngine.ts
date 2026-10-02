/**
 * ═══════════════════════════════════════════════════════════════════════
 * MULTI-MODAL FREIGHT LOGISTICS & INDUSTRIAL RAILWAY ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Sections 15, 16, 17, 18:
 * - Physical movement of ores, coils, components, and finished cars
 * - 4 Transport Modes: ROAD_TRUCK, HEAVY_RAIL, MARITIME_RORO, AIR_EXPEDITED
 * - Geographic industrial clusters with authentic spatial transit distances
 * - Factory Railway Spur asset: slashes bulk freight costs by 65%
 */

import { FreightTransportMode, LogisticsRoute } from "./tradeTypes";

export interface IndustrialRegion {
  id: string;
  name: string;
  specialtyAdvantage: string;
  distanceFromFactoryKm: number;
  hasDirectRailLink: boolean;
  hasDeepwaterPort: boolean;
}

export const INDUSTRIAL_REGIONS: Record<string, IndustrialRegion> = {
  "Rhine Industrial Valley": {
    id: "rhine_valley",
    name: "Rhine Industrial Valley",
    specialtyAdvantage: "Abundant coking coal, heavy blast furnaces, and ductile foundries",
    distanceFromFactoryKm: 180,
    hasDirectRailLink: true,
    hasDeepwaterPort: false,
  },
  "Nordic Hydropower Cluster": {
    id: "nordic_cluster",
    name: "Nordic Hydropower Cluster",
    specialtyAdvantage: "Cheap green hydro-energy for low-carbon aluminium smelting",
    distanceFromFactoryKm: 850,
    hasDirectRailLink: true,
    hasDeepwaterPort: true,
  },
  "Coastal Megaport Terminal": {
    id: "coastal_port",
    name: "Coastal Megaport Terminal",
    specialtyAdvantage: "Automotive RoRo docks, international container freight, tyre rubber imports",
    distanceFromFactoryKm: 320,
    hasDirectRailLink: true,
    hasDeepwaterPort: true,
  },
  "Bavarian Precision Valley": {
    id: "bavarian_valley",
    name: "Bavarian Precision Valley",
    specialtyAdvantage: "Tool & die machining, transmission engineering, automotive silicon ECUs",
    distanceFromFactoryKm: 240,
    hasDirectRailLink: true,
    hasDeepwaterPort: false,
  },
  "Pacific Export Corridor": {
    id: "pacific_corridor",
    name: "Pacific Export Corridor (Japan/Asia)",
    specialtyAdvantage: "Ultra-pure Japanese UHSS steel, lithium NMC cells, silicon microcontrollers",
    distanceFromFactoryKm: 9200, // Oceanic shipping
    hasDirectRailLink: false,
    hasDeepwaterPort: true,
  },
  "Alpine Specialty Metallurgy": {
    id: "alpine_cluster",
    name: "Alpine Specialty Metallurgy",
    specialtyAdvantage: "Aerospace titanium forgings, magnesium high-pressure casting cells",
    distanceFromFactoryKm: 460,
    hasDirectRailLink: true,
    hasDeepwaterPort: false,
  },
};

export interface ModeCharacteristic {
  mode: FreightTransportMode;
  name: string;
  costPerTonneKmINR: number;
  averageSpeedKmh: number;
  capacityTonnesPerTrip: number;
  reliabilityScore: number;
  requiresRailSpur: boolean;
  requiresPort: boolean;
}

export const FREIGHT_MODES: Record<FreightTransportMode, ModeCharacteristic> = {
  ROAD_TRUCK: {
    mode: "ROAD_TRUCK",
    name: "Heavy Road Truck Convoy",
    costPerTonneKmINR: 6.5,      // ₹6.5 / tonne-km
    averageSpeedKmh: 65,
    capacityTonnesPerTrip: 24,   // Semi-trailer
    reliabilityScore: 88,
    requiresRailSpur: false,
    requiresPort: false,
  },
  HEAVY_RAIL: {
    mode: "HEAVY_RAIL",
    name: "Industrial Unit Freight Train",
    costPerTonneKmINR: 2.1,      // ₹2.1 / tonne-km (67% cheaper than truck)
    averageSpeedKmh: 45,
    capacityTonnesPerTrip: 1200, // 40-wagon unit train
    reliabilityScore: 95,
    requiresRailSpur: true,
    requiresPort: false,
  },
  MARITIME_RORO: {
    mode: "MARITIME_RORO",
    name: "Deep-Sea RoRo & Bulk Container Ship",
    costPerTonneKmINR: 0.65,     // ₹0.65 / tonne-km (Massive economies of scale)
    averageSpeedKmh: 28,
    capacityTonnesPerTrip: 15000,// Ocean freighter
    reliabilityScore: 82,
    requiresRailSpur: false,
    requiresPort: true,
  },
  AIR_EXPEDITED: {
    mode: "AIR_EXPEDITED",
    name: "Air Cargo Expedited Courier",
    costPerTonneKmINR: 48.0,     // Emergency line-stoppage rescue
    averageSpeedKmh: 750,
    capacityTonnesPerTrip: 8,
    reliabilityScore: 98,
    requiresRailSpur: false,
    requiresPort: false,
  },
};

export interface FreightShipmentCalculation {
  originRegion: string;
  destinationFacilityId: string;
  mode: FreightTransportMode;
  distanceKm: number;
  cargoTonnage: number;
  baseFreightCostINR: number;
  railSpurDiscountINR: number;
  netFreightCostINR: number;
  transitDurationDays: number;
  isEligible: boolean;
  ineligibilityReason?: string;
}

/**
 * Calculates accurate physical freight costs for transporting commodities,
 * raw materials, or components from an industrial supplier cluster to the factory.
 */
export function calculateFreightShipment(
  originRegionName: string,
  cargoTonnage: number,
  mode: FreightTransportMode,
  hasFactoryRailSpur: boolean = false,
  destinationFacilityId: string = "fac_assembly_plant_01"
): FreightShipmentCalculation {
  const region = INDUSTRIAL_REGIONS[originRegionName] ?? {
    id: "generic_hub",
    name: originRegionName,
    specialtyAdvantage: "Regional industrial zone",
    distanceFromFactoryKm: 300,
    hasDirectRailLink: true,
    hasDeepwaterPort: false,
  };

  const modeChar = FREIGHT_MODES[mode];
  let isEligible = true;
  let ineligibilityReason: string | undefined;

  if (mode === "HEAVY_RAIL" && (!hasFactoryRailSpur || !region.hasDirectRailLink)) {
    isEligible = false;
    ineligibilityReason = !hasFactoryRailSpur
      ? "Factory lacks an on-site industrial railway spur. Build a rail spur asset to unlock heavy rail."
      : "Supplier region is not connected to the national rail freight network.";
  }

  if (mode === "MARITIME_RORO" && !region.hasDeepwaterPort) {
    isEligible = false;
    ineligibilityReason = "Supplier origin region has no deepwater maritime terminal.";
  }

  const distanceKm = region.distanceFromFactoryKm;
  const rawCost = cargoTonnage * distanceKm * modeChar.costPerTonneKmINR;

  // Rail spur discount on final transfer handling
  let railSpurDiscount = 0;
  if (mode === "HEAVY_RAIL" && hasFactoryRailSpur) {
    railSpurDiscount = rawCost * 0.15; // Extra 15% discount for dedicated siding offload
  }

  const netCost = Math.round(Math.max(5000, rawCost - railSpurDiscount));
  const transitHours = distanceKm / modeChar.averageSpeedKmh + (mode === "MARITIME_RORO" ? 48 : 4);
  const transitDays = Math.max(1, Math.ceil(transitHours / 24));

  return {
    originRegion: region.name,
    destinationFacilityId,
    mode,
    distanceKm,
    cargoTonnage,
    baseFreightCostINR: Math.round(rawCost),
    railSpurDiscountINR: Math.round(railSpurDiscount),
    netFreightCostINR: netCost,
    transitDurationDays: transitDays,
    isEligible,
    ineligibilityReason,
  };
}
