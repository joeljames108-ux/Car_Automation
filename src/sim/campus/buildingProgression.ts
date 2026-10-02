/**
 * AUTO TYCOON CAMPUS HQ - 8-LEVEL BUILDING PROGRESSION SCHEMA (PHASE 3)
 * 
 * Formalizes the 8 progression tiers (Level 0 Empty Plot to Level 7 Hypermodern Campus)
 * across all 14 campus units.
 * 
 * Level Hierarchy:
 * - Level 0: Empty Plot (Surveyed land, marker stakes)
 * - Level 1: Office (Small 1970s brick starter building)
 * - Level 2: Department (Expanded wing, dedicated labs)
 * - Level 3: Center (Multi-story complex, specialized rigs)
 * - Level 4: Advanced HQ (Industry-leading tech facility)
 * - Level 5: World-Class HQ (Global benchmark corporate presence)
 * - Level 6: Innovation Campus (Integrated smart complex, glass & steel)
 * - Level 7: Hypermodern Campus (AI-integrated, carbon-neutral master campus)
 */

import { CampusUnitId } from "./campusTypes";
import { ConstructionResourceCost, ConstructionResourceType, calculateBillOfMaterialsCost } from "./constructionResources";

export type CampusBuildingTier =
  | "empty_plot"
  | "office"
  | "department"
  | "center"
  | "advanced_hq"
  | "world_class_hq"
  | "innovation_campus"
  | "hypermodern_campus";

export interface BuildingLevelDefinition {
  level: number;
  tier: CampusBuildingTier;
  tierLabel: string;
  name: string;
  era: string;
  staffCapMultiplier: number;
  monthlyMaintenanceMultiplier: number;
  baseConstructionCost1970: number;
  baseConstructionMonths: number;
  requiredMaterials: ConstructionResourceCost[];
  visualModelSuffix: string;
  triangleBudgetMin: number;
  triangleBudgetMax: number;
  description: string;
}

export const BUILDING_LEVEL_PROGRESSION: Record<number, BuildingLevelDefinition> = {
  0: {
    level: 0,
    tier: "empty_plot",
    tierLabel: "Empty Plot",
    name: "Surveyed Plot Lot",
    era: "Pre-construction",
    staffCapMultiplier: 0,
    monthlyMaintenanceMultiplier: 0.05, // Land tax & maintenance
    baseConstructionCost1970: 0,
    baseConstructionMonths: 0,
    requiredMaterials: [],
    visualModelSuffix: "_plot_l0",
    triangleBudgetMin: 500,
    triangleBudgetMax: 1500,
    description: "Surveyed acreage with boundary stakes, perimeter wire, and access road connection stub.",
  },
  1: {
    level: 1,
    tier: "office",
    tierLabel: "Starter Office",
    name: "1970s Brick Starter Facility",
    era: "1970s",
    staffCapMultiplier: 1.0,
    monthlyMaintenanceMultiplier: 1.0,
    baseConstructionCost1970: 450000,
    baseConstructionMonths: 6,
    requiredMaterials: [
      { resource: "CONCRETE", quantity: 350 },
      { resource: "STEEL", quantity: 60 },
      { resource: "TIMBER", quantity: 120 },
      { resource: "GLASS", quantity: 180 },
      { resource: "ELECTRONICS", quantity: 15 },
      { resource: "HEAVY_MACHINERY", quantity: 240 },
      { resource: "LABOR_MONTHS", quantity: 72 },
    ],
    visualModelSuffix: "_l1_1970",
    triangleBudgetMin: 8000,
    triangleBudgetMax: 12000,
    description: "Modest single-story or two-story exposed brick facility with manual drafting tables and analog equipment.",
  },
  2: {
    level: 2,
    tier: "department",
    tierLabel: "Department Wing",
    name: "Expanded Department Complex",
    era: "1975–1980",
    staffCapMultiplier: 1.8,
    monthlyMaintenanceMultiplier: 1.7,
    baseConstructionCost1970: 950000,
    baseConstructionMonths: 9,
    requiredMaterials: [
      { resource: "CONCRETE", quantity: 650 },
      { resource: "STEEL", quantity: 140 },
      { resource: "TIMBER", quantity: 160 },
      { resource: "GLASS", quantity: 320 },
      { resource: "ELECTRONICS", quantity: 35 },
      { resource: "HEAVY_MACHINERY", quantity: 480 },
      { resource: "LABOR_MONTHS", quantity: 140 },
    ],
    visualModelSuffix: "_l2_1978",
    triangleBudgetMin: 14000,
    triangleBudgetMax: 20000,
    description: "Dedicated testing wings, expanded drafting floor, and preliminary computer teletype terminals.",
  },
  3: {
    level: 3,
    tier: "center",
    tierLabel: "Specialized Center",
    name: "Dedicated Engineering & Testing Center",
    era: "1980–1990",
    staffCapMultiplier: 3.0,
    monthlyMaintenanceMultiplier: 2.8,
    baseConstructionCost1970: 2200000,
    baseConstructionMonths: 14,
    requiredMaterials: [
      { resource: "CONCRETE", quantity: 1400 },
      { resource: "STEEL", quantity: 380 },
      { resource: "TIMBER", quantity: 220 },
      { resource: "GLASS", quantity: 750 },
      { resource: "ELECTRONICS", quantity: 95 },
      { resource: "HEAVY_MACHINERY", quantity: 900 },
      { resource: "LABOR_MONTHS", quantity: 280 },
    ],
    visualModelSuffix: "_l3_1985",
    triangleBudgetMin: 22000,
    triangleBudgetMax: 32000,
    description: "Automated dyno banks, early CAD workstations, environmental testing vaults, and dedicated administrative wings.",
  },
  4: {
    level: 4,
    tier: "advanced_hq",
    tierLabel: "Advanced HQ",
    name: "Advanced Industry-Leading Tech Center",
    era: "1990–2000",
    staffCapMultiplier: 4.8,
    monthlyMaintenanceMultiplier: 4.5,
    baseConstructionCost1970: 5500000,
    baseConstructionMonths: 18,
    requiredMaterials: [
      { resource: "CONCRETE", quantity: 2800 },
      { resource: "STEEL", quantity: 850 },
      { resource: "TIMBER", quantity: 300 },
      { resource: "GLASS", quantity: 1600 },
      { resource: "ELECTRONICS", quantity: 240 },
      { resource: "HEAVY_MACHINERY", quantity: 1800 },
      { resource: "LABOR_MONTHS", quantity: 550 },
    ],
    visualModelSuffix: "_l4_1995",
    triangleBudgetMin: 32000,
    triangleBudgetMax: 45000,
    description: "Silicon Graphics workstations, full-scale chassis shaker rigs, automated robotic cells, and glass atrium lobby.",
  },
  5: {
    level: 5,
    tier: "world_class_hq",
    tierLabel: "World-Class HQ",
    name: "Global Benchmark Corporate Campus",
    era: "2000–2010",
    staffCapMultiplier: 7.2,
    monthlyMaintenanceMultiplier: 6.8,
    baseConstructionCost1970: 12000000,
    baseConstructionMonths: 22,
    requiredMaterials: [
      { resource: "CONCRETE", quantity: 5500 },
      { resource: "STEEL", quantity: 1900 },
      { resource: "TIMBER", quantity: 450 },
      { resource: "GLASS", quantity: 3800 },
      { resource: "ELECTRONICS", quantity: 580 },
      { resource: "HEAVY_MACHINERY", quantity: 3200 },
      { resource: "LABOR_MONTHS", quantity: 1100 },
    ],
    visualModelSuffix: "_l5_2005",
    triangleBudgetMin: 45000,
    triangleBudgetMax: 60000,
    description: "Multi-wing architectural showpiece with solar arrays, immersive VR theaters, DIL motion simulators, and auditorium.",
  },
  6: {
    level: 6,
    tier: "innovation_campus",
    tierLabel: "Innovation Campus",
    name: "Smart Integrated Innovation Hub",
    era: "2010–2020",
    staffCapMultiplier: 10.5,
    monthlyMaintenanceMultiplier: 10.0,
    baseConstructionCost1970: 24000000,
    baseConstructionMonths: 26,
    requiredMaterials: [
      { resource: "CONCRETE", quantity: 9500 },
      { resource: "STEEL", quantity: 3400 },
      { resource: "TIMBER", quantity: 600 },
      { resource: "GLASS", quantity: 7200 },
      { resource: "ELECTRONICS", quantity: 1200 },
      { resource: "HEAVY_MACHINERY", quantity: 5500 },
      { resource: "LABOR_MONTHS", quantity: 2200 },
    ],
    visualModelSuffix: "_l6_2015",
    triangleBudgetMin: 55000,
    triangleBudgetMax: 70000,
    description: "Curved architectural glazing, digital twin telemetry operations, automated logistics drone pads, and electric fleet charging plazas.",
  },
  7: {
    level: 7,
    tier: "hypermodern_campus",
    tierLabel: "Hypermodern Campus",
    name: "Zero-Carbon AI-Integrated Master Complex",
    era: "2020s+",
    staffCapMultiplier: 15.0,
    monthlyMaintenanceMultiplier: 14.5,
    baseConstructionCost1970: 48000000,
    baseConstructionMonths: 30,
    requiredMaterials: [
      { resource: "CONCRETE", quantity: 15000 },
      { resource: "STEEL", quantity: 5800 },
      { resource: "TIMBER", quantity: 900 },
      { resource: "GLASS", quantity: 12500 },
      { resource: "ELECTRONICS", quantity: 2400 },
      { resource: "HEAVY_MACHINERY", quantity: 9500 },
      { resource: "LABOR_MONTHS", quantity: 4200 },
    ],
    visualModelSuffix: "_l7_2025",
    triangleBudgetMin: 70000,
    triangleBudgetMax: 90000,
    description: "Parametric aerogel facades, quantum computing wings, rooftop botanical microclimates, and lights-out autonomous operations.",
  },
};

/**
 * Unit Multipliers for scale differences
 * E.g., Factory (UNIT_10) requires 3x resources, while Quality HQ requires 0.8x.
 */
export const UNIT_CONSTRUCTION_SCALE_FACTORS: Record<CampusUnitId, number> = {
  CENTRAL_CORPORATE_HQ: 1.0,
  POWERTRAIN_EV_HQ: 1.35,
  AERO_HQ: 1.6,
  VEHICLE_DESIGN_HQ: 1.15,
  CHASSIS_DYNAMICS_HQ: 1.1,
  INTERIOR_HQ: 0.9,
  TESTING_VALIDATION_HQ: 1.5,
  MOTORSPORT_HQ: 1.25,
  COMMERCIAL_VEHICLES_HQ: 1.4,
  FACTORY: 3.2,
  SUPPLIER_PROCUREMENT_HQ: 1.1,
  QUALITY_RELIABILITY_HQ: 0.85,
  SAFETY_HQ: 1.45,
  MARKETING_SALES_HQ: 1.05,
};

export interface UpgradeRequirementsResult {
  unitId: CampusUnitId;
  targetLevel: number;
  tier: CampusBuildingTier;
  tierLabel: string;
  estimatedCost: number;
  constructionMonths: number;
  requiredMaterials: ConstructionResourceCost[];
}

/**
 * Pure function: Calculate exact requirements to upgrade a unit to a target level in a specific game year.
 */
export function getBuildingLevelRequirements(
  unitId: CampusUnitId,
  targetLevel: number,
  currentYear: number = 1970
): UpgradeRequirementsResult {
  const clampedLevel = Math.max(1, Math.min(7, targetLevel));
  const levelDef = BUILDING_LEVEL_PROGRESSION[clampedLevel];
  const unitScale = UNIT_CONSTRUCTION_SCALE_FACTORS[unitId] ?? 1.0;

  // Scale materials by unit footprint and complexity
  const scaledMaterials: ConstructionResourceCost[] = levelDef.requiredMaterials.map((m) => ({
    resource: m.resource,
    quantity: Math.round(m.quantity * unitScale),
  }));

  const estimatedCost = calculateBillOfMaterialsCost(scaledMaterials, currentYear);
  const constructionMonths = Math.max(3, Math.round(levelDef.baseConstructionMonths * Math.sqrt(unitScale)));

  return {
    unitId,
    targetLevel: clampedLevel,
    tier: levelDef.tier,
    tierLabel: levelDef.tierLabel,
    estimatedCost,
    constructionMonths,
    requiredMaterials: scaledMaterials,
  };
}

export function getBuildingLevelDefinition(level: number): BuildingLevelDefinition {
  return BUILDING_LEVEL_PROGRESSION[Math.max(0, Math.min(7, level))];
}
