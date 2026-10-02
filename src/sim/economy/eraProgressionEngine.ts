/**
 * ═══════════════════════════════════════════════════════════════════════
 * ERA PROGRESSION ENGINE — CHRONOLOGICAL ECONOMIC COMPLEXITY SCALING
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements Section 6A & Section 28:
 * Scales automotive economic complexity through the decades (1970 → 2025+):
 * - 1970 Startup Era: Handcrafted boutique, single workshop, pilot coupe
 * - 1985 Established Era: Mass assembly, multi-model lines, supplier contracts
 * - 2000 Multinational Era: Global supply chains, debt syndicate bonds, export logistics
 * - 2015+ Tech Leader Era: Gigafactories, EV battery materials, autonomous software
 */

export type AutomotiveEraType =
  | "ERA_1970_STARTUP"
  | "ERA_1985_ESTABLISHED"
  | "ERA_2000_MULTINATIONAL"
  | "ERA_2015_TECH_LEADER";

export interface EraSpecification {
  eraType: AutomotiveEraType;
  title: string;
  startYear: number;
  endYear: number;
  description: string;
  unlockedRevenueStreams: string[];
  unlockedExpenseCategories: string[];
  macroInflationFactor: number;
  suggestedHeadcount: string;
  targetMonthlyRevenue: number;
  recommendedVehicleSegments: string[];
  keyHistoricalContext: string;
}

export const AUTOMOTIVE_ERAS: Record<AutomotiveEraType, EraSpecification> = {
  ERA_1970_STARTUP: {
    eraType: "ERA_1970_STARTUP",
    title: "1970 — Artisanal Workshop Era",
    startYear: 1970,
    endYear: 1984,
    description: "Handcrafted grand tourers, boutique assembly workshop, founding pilot line, localized domestic dealers.",
    unlockedRevenueStreams: ["VEHICLE_SALES", "AFTER_SALES"],
    unlockedExpenseCategories: ["EMPLOYEE_SALARIES", "RAW_MATERIALS", "HQ_MAINTENANCE", "FACTORY_MAINTENANCE"],
    macroInflationFactor: 1.0,
    suggestedHeadcount: "20 – 60 craftsmen",
    targetMonthlyRevenue: 2500000,
    recommendedVehicleSegments: ["COUPE", "SPORTS"],
    keyHistoricalContext: "Mechanical carbureted engines, steel coachwork, local motor club racing.",
  },
  ERA_1985_ESTABLISHED: {
    eraType: "ERA_1985_ESTABLISHED",
    title: "1985 — Industrial Manufacturer Era",
    startYear: 1985,
    endYear: 1999,
    description: "High-volume stamping, turbocharged powertrains, OEM tech licensing, regional dealership networks, motorsport customer racing.",
    unlockedRevenueStreams: ["VEHICLE_SALES", "COMPONENT_SALES", "TECH_LICENSING", "MOTORSPORT_INCOME", "AFTER_SALES"],
    unlockedExpenseCategories: ["EMPLOYEE_SALARIES", "RAW_MATERIALS", "COMPONENT_PURCHASES", "MARKETING", "MOTORSPORT_EXPENSE", "EQUIPMENT_LOANS"],
    macroInflationFactor: 1.45,
    suggestedHeadcount: "150 – 500 workers",
    targetMonthlyRevenue: 18000000,
    recommendedVehicleSegments: ["COUPE", "SEDAN", "SPORTS"],
    keyHistoricalContext: "Electronic fuel injection, aerodynamic wind tunnels, Group A endurance racing.",
  },
  ERA_2000_MULTINATIONAL: {
    eraType: "ERA_2000_MULTINATIONAL",
    title: "2000 — Global Automotive Conglomerate Era",
    startYear: 2000,
    endYear: 2014,
    description: "Multinational platform sharing, heavy rail & maritime RoRo export logistics, corporate bond debt, global dealer ateliers.",
    unlockedRevenueStreams: ["VEHICLE_SALES", "COMPONENT_SALES", "TECH_LICENSING", "CONTRACT_INCOME", "MOTORSPORT_INCOME", "AFTER_SALES"],
    unlockedExpenseCategories: ["ALL_CATEGORIES", "BOND_DEBT_SERVICE", "GLOBAL_LOGISTICS", "CORPORATE_CAMPUS"],
    macroInflationFactor: 2.15,
    suggestedHeadcount: "800 – 3,500 employees",
    targetMonthlyRevenue: 95000000,
    recommendedVehicleSegments: ["COUPE", "SEDAN", "SUV", "SUPERCAR", "COMMERCIAL"],
    keyHistoricalContext: "CAN-bus multiplex electronics, Euro crash standards, Formula & LMP racing programs.",
  },
  ERA_2015_TECH_LEADER: {
    eraType: "ERA_2015_TECH_LEADER",
    title: "2015+ — Electrified & Connected Software Era",
    startYear: 2015,
    endYear: 2040,
    description: "Gigafactory cell assembly, carbon composite monocoques, active aerodynamics, autonomous AI telemetry licensing.",
    unlockedRevenueStreams: ["ALL_CATEGORIES", "DIGITAL_SUBSCRIPTIONS", "BATTERY_OEM_SUPPLY", "IP_ROYALTIES"],
    unlockedExpenseCategories: ["ALL_CATEGORIES", "CLEANROOM_FAB", "AI_TELEMETRY", "CARBON_PREPREG"],
    macroInflationFactor: 3.10,
    suggestedHeadcount: "2,500 – 12,000 employees",
    targetMonthlyRevenue: 350000000,
    recommendedVehicleSegments: ["COUPE", "SEDAN", "SUV", "SUPERCAR", "ECONOMY", "COMMERCIAL"],
    keyHistoricalContext: "800V silicon carbide inverters, active aero venturis, over-the-air calibrations.",
  },
};

/** Get the active era specification for a given year */
export function getEraForYear(year: number): EraSpecification {
  if (year >= 2015) return AUTOMOTIVE_ERAS.ERA_2015_TECH_LEADER;
  if (year >= 2000) return AUTOMOTIVE_ERAS.ERA_2000_MULTINATIONAL;
  if (year >= 1985) return AUTOMOTIVE_ERAS.ERA_1985_ESTABLISHED;
  return AUTOMOTIVE_ERAS.ERA_1970_STARTUP;
}
