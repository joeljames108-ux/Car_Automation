/**
 * AUTO TYCOON CAMPUS HQ - CAMPUS ZONE REGISTRY (PHASE 2)
 * 
 * Defines the 4 master functional zones of the campus:
 * - Zone A: Logistics & Production (NW Sector)
 * - Zone B: Engineering & Validation (N Sector)
 * - Zone C: Core Styling & Corporate (Center / Origin Hub)
 * - Zone D: Special Operations & Track Perimeter (S/E Sector)
 */

import { CampusUnitId, CampusUnitKey, CampusZone } from "./campusTypes";

export interface ZoneUnlockRequirement {
  requiredCompanyReputation: number;
  requiredCashOnHand: number;
  requiredCorporateLevel: number;
  description: string;
}

export interface CampusZoneDefinition {
  id: CampusZone;
  name: string;
  shortLabel: string;
  sectorCode: string;
  themeColorHex: string;
  accentColorHex: string;
  badgeBgColor: string;
  badgeTextColor: string;
  description: string;
  associatedUnits: CampusUnitId[];
  associatedUnitKeys: CampusUnitKey[];
  unlockRequirements?: ZoneUnlockRequirement;
  unlockedByDefault1970: boolean;
  environmentalAesthetic: {
    roadSurface: "paved_asphalt" | "concrete_slabs" | "industrial_tarmac" | "curbed_plaza";
    ambientSoundscape: "urban_office" | "heavy_machinery" | "dyno_wind_tunnel" | "track_engines";
    treeStyle: "formal_lindens" | "evergreen_buffer" | "sparse_industrial" | "manicured_planters";
  };
}

export const CAMPUS_ZONE_REGISTRY: Record<CampusZone, CampusZoneDefinition> = {
  ZONE_A: {
    id: "ZONE_A",
    name: "Zone A: Logistics & Production",
    shortLabel: "Logistics & Production",
    sectorCode: "MFG-LOG",
    themeColorHex: "#ef4444", // Crisp red
    accentColorHex: "#fee2e2",
    badgeBgColor: "bg-red-50 text-red-700 border-red-200",
    badgeTextColor: "#991b1b",
    description: "Industrial sector housing component receiving docks, warehouse inventory, logistics coordination, and the main manufacturing plant site.",
    associatedUnits: ["FACTORY", "SUPPLIER_PROCUREMENT_HQ"],
    associatedUnitKeys: ["UNIT_10", "UNIT_11"],
    unlockedByDefault1970: true, // Supplier HQ active; factory plot present (outsourced)
    environmentalAesthetic: {
      roadSurface: "industrial_tarmac",
      ambientSoundscape: "heavy_machinery",
      treeStyle: "sparse_industrial",
    },
  },

  ZONE_B: {
    id: "ZONE_B",
    name: "Zone B: Engineering & Validation",
    shortLabel: "Engineering & Validation",
    sectorCode: "ENG-VAL",
    themeColorHex: "#3b82f6", // Crisp blue
    accentColorHex: "#dbeafe",
    badgeBgColor: "bg-blue-50 text-blue-700 border-blue-200",
    badgeTextColor: "#1e40af",
    description: "Core technical development center covering internal combustion dynos, transmissions, chassis dynamics rigs, interior ergonomics, and torture proving grounds.",
    associatedUnits: ["POWERTRAIN_EV_HQ", "CHASSIS_DYNAMICS_HQ", "INTERIOR_HQ", "TESTING_VALIDATION_HQ"],
    associatedUnitKeys: ["UNIT_02", "UNIT_05", "UNIT_06", "UNIT_07"],
    unlockedByDefault1970: true,
    environmentalAesthetic: {
      roadSurface: "paved_asphalt",
      ambientSoundscape: "dyno_wind_tunnel",
      treeStyle: "evergreen_buffer",
    },
  },

  ZONE_C: {
    id: "ZONE_C",
    name: "Zone C: Core Styling & Corporate",
    shortLabel: "Styling & Corporate",
    sectorCode: "CORP-DSGN",
    themeColorHex: "#f59e0b", // Warm Amber
    accentColorHex: "#fef3c7",
    badgeBgColor: "bg-amber-50 text-amber-700 border-amber-200",
    badgeTextColor: "#92400e",
    description: "Central executive plaza, boardroom, vehicle design & clay modeling studios, quality metrology labs, global sales administration, and marketing suites.",
    associatedUnits: ["CENTRAL_CORPORATE_HQ", "VEHICLE_DESIGN_HQ", "QUALITY_RELIABILITY_HQ", "MARKETING_SALES_HQ"],
    associatedUnitKeys: ["UNIT_01", "UNIT_04", "UNIT_12", "UNIT_14"],
    unlockedByDefault1970: true,
    environmentalAesthetic: {
      roadSurface: "curbed_plaza",
      ambientSoundscape: "urban_office",
      treeStyle: "formal_lindens",
    },
  },

  ZONE_D: {
    id: "ZONE_D",
    name: "Zone D: Special Operations & Track Perimeter",
    shortLabel: "Special Operations & Track",
    sectorCode: "SPEC-OPS",
    themeColorHex: "#10b981", // Soft emerald
    accentColorHex: "#d1fae5",
    badgeBgColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeTextColor: "#065f46",
    description: "High-speed testing circuit perimeter, closed-loop wind tunnel, works motorsport racing garage, heavy commercial vehicle engineering, and full-scale crash propulsion hall.",
    associatedUnits: ["AERO_HQ", "MOTORSPORT_HQ", "COMMERCIAL_VEHICLES_HQ", "SAFETY_HQ"],
    associatedUnitKeys: ["UNIT_03", "UNIT_08", "UNIT_09", "UNIT_13"],
    unlockRequirements: {
      requiredCompanyReputation: 25,
      requiredCashOnHand: 2500000,
      requiredCorporateLevel: 2,
      description: "Requires Corporate Level 2, $2.5M capital reserves, and 25 company reputation to acquire track perimeter land rights.",
    },
    unlockedByDefault1970: false, // Locked expansion zone
    environmentalAesthetic: {
      roadSurface: "paved_asphalt",
      ambientSoundscape: "track_engines",
      treeStyle: "manicured_planters",
    },
  },
};

export function getZoneDefinition(zoneId: CampusZone): CampusZoneDefinition {
  return CAMPUS_ZONE_REGISTRY[zoneId];
}

export function getAllZones(): CampusZoneDefinition[] {
  return Object.values(CAMPUS_ZONE_REGISTRY);
}

export function getZoneByUnitId(unitId: CampusUnitId): CampusZoneDefinition | undefined {
  return Object.values(CAMPUS_ZONE_REGISTRY).find((z) => z.associatedUnits.includes(unitId));
}
