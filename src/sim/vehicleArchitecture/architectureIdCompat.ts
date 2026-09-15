// ============================================================================
// ARCHITECTURE ID COMPATIBILITY & NORMALIZATION LAYER
// ============================================================================
// Bridges the 24 Canonical Vehicle Architectures with existing legacy
// VehicleBodyTypeId, VehicleCategory, and alias strings throughout the system.
// ============================================================================

import { VehicleArchitectureId, VehicleEraId } from "./vehicleArchitectureTypes";
import { VehicleBodyTypeId } from "../modularVehicle/types";

export const CANONICAL_ARCHITECTURE_IDS: VehicleArchitectureId[] = [
  "sedan",
  "hatchback",
  "coupe",
  "convertible",
  "roadster",
  "sports_car",
  "supercar",
  "hypercar",
  "grand_tourer",
  "muscle_car",
  "luxury_car",
  "limousine",
  "shooting_brake",
  "wagon",
  "crossover",
  "suv",
  "offroad_4x4",
  "pickup_truck",
  "heavy_truck",
  "van",
  "mpv",
  "bus",
  "race_formula",
  "gt3_racing",
];

export const CANONICAL_ERA_IDS: VehicleEraId[] = [
  "1970s",
  "1980s",
  "1990s",
  "2000s",
  "2010s",
  "2020s",
  "future",
];

/**
 * Normalizes any arbitrary string or legacy body ID into one of the 24 canonical architectures.
 */
export function normalizeArchitectureId(raw: string | undefined | null): VehicleArchitectureId {
  if (!raw) return "sedan";
  const lower = raw.trim().toLowerCase().replace(/[-\s]/g, "_");

  // Direct matches
  if ((CANONICAL_ARCHITECTURE_IDS as string[]).includes(lower)) {
    return lower as VehicleArchitectureId;
  }

  // Aliases & Legacy Mappings
  switch (lower) {
    // Luxury & Sedan
    case "luxury_sedan":
    case "executive_sedan":
      return "luxury_car";
    case "station_wagon":
    case "sport_wagon":
    case "estate":
      return "wagon";
    // Sports & GT
    case "gt":
    case "bentley":
    case "gt_coupe":
    case "continental":
      return "grand_tourer";
    case "sports_coupe":
    case "m4":
      return "sports_car";
    case "296_gtb":
    case "ferrari":
      return "supercar";
    case "track_special":
    case "prototype":
      return "gt3_racing";
    case "race_car":
    case "f1":
    case "formula":
    case "formula_1":
      return "race_formula";
    case "gt3":
      return "gt3_racing";
    // Compact & Hatch
    case "hot_hatch":
    case "microcar":
    case "city_car":
    case "golf":
      return "hatchback";
    // Utility & SUV
    case "luxury_suv":
    case "range_rover":
      return "suv";
    case "performance_suv":
    case "coupe_suv":
    case "crossover_cuv":
    case "cuv":
    case "compact_crossover":
    case "cross_over":
      return "crossover";
    case "offroad":
    case "offroad_suv":
    case "rubicon":
    case "defender":
      return "offroad_4x4";
    // Trucks & Commercial
    case "pickup":
      return "pickup_truck";
    case "truck_lorry":
    case "lorry":
    case "semi":
    case "heavy_duty":
      return "heavy_truck";
    case "cargo_van":
    case "sprinter":
    case "transit":
      return "van";
    case "people_carrier":
    case "minivan":
      return "mpv";
    case "bus_shuttle":
    case "shuttle":
    case "coach":
      return "bus";
    default:
      return "sedan";
  }
}

/**
 * Maps a canonical VehicleArchitectureId back to a legacy VehicleBodyTypeId
 * so existing 10-stage assembly, interior studios, and seating constraints always find valid records.
 */
export function architectureToLegacyBodyTypeId(archId: VehicleArchitectureId | string): VehicleBodyTypeId {
  const norm = normalizeArchitectureId(archId);

  switch (norm) {
    case "sedan":
      return "sedan";
    case "hatchback":
      return "hatchback";
    case "coupe":
      return "coupe";
    case "convertible":
      return "convertible";
    case "roadster":
      return "roadster";
    case "sports_car":
      return "coupe";
    case "supercar":
      return "supercar";
    case "hypercar":
      return "hypercar";
    case "grand_tourer":
      return "grand_tourer";
    case "muscle_car":
      return "coupe";
    case "luxury_car":
      return "luxury_sedan";
    case "limousine":
      return "limousine";
    case "shooting_brake":
      return "shooting_brake";
    case "wagon":
      return "station_wagon";
    case "crossover":
      return "crossover";
    case "suv":
      return "suv";
    case "offroad_4x4":
      return "offroad_4x4";
    case "pickup_truck":
      return "pickup_truck";
    case "heavy_truck":
      return "truck_lorry";
    case "van":
      return "cargo_van";
    case "mpv":
      return "cargo_van";
    case "bus":
      return "bus_shuttle";
    case "race_formula":
      return "track_special";
    case "gt3_racing":
      return "track_special";
  }
}

/**
 * Normalizes an era string into a canonical VehicleEraId.
 */
export function normalizeEraId(raw: string | undefined | null): VehicleEraId {
  if (!raw) return "2020s";
  const lower = raw.trim().toLowerCase();

  switch (lower) {
    case "70s":
    case "1970":
    case "1970s":
      return "1970s";
    case "80s":
    case "1980":
    case "1980s":
      return "1980s";
    case "90s":
    case "1990":
    case "1990s":
      return "1990s";
    case "00s":
    case "2000":
    case "2000s":
      return "2000s";
    case "10s":
    case "2010":
    case "2010s":
      return "2010s";
    case "20s":
    case "2020":
    case "2020s":
      return "2020s";
    case "future":
    case "2030+":
    case "concept":
    case "cyber":
      return "future";
    default:
      return "2020s";
  }
}
