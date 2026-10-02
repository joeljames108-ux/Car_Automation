/**
 * AUTOMOTIVE CORPORATE CAMPUS - DOMAIN ARCHITECTURE TYPES
 * 
 * 14 Top-Level Campus Units:
 * 13 HQ Buildings + 1 Manufacturing Facility (Factory)
 * 
 * 1970 STARTUP REALITY:
 * - Player starts with an extremely small, modest 5-10 hectare campus.
 * - 7 Core Starter Buildings: Corporate HQ, Engineering R&D, Design Studio,
 *   Prototype Workshop (2 vehicles max), Procurement & Supplier Office,
 *   Finance & Administration, and Sales & Marketing. (~108 total employees).
 * - 7 Locked Advanced Expansion Plots (Wind tunnel, Proving grounds, Crash lab, Motorsport, etc.).
 * - ZERO owned manufacturing: Production is 100% outsourced to NPC/rival factories.
 * - Outsourced assembly requires: Raw Materials + Components + Conversion Cost + Factory Margin + Logistics.
 * - Competitor-owned factories impose surcharges, capacity limits, and delivery delays.
 */

export type CampusSector = 
  | "CORPORATE_MANAGEMENT"
  | "ENGINEERING_RND"
  | "MOTORSPORT_COMMERCIAL"
  | "MANUFACTURING_SUPPLY_CHAIN"
  | "COMMERCIAL_MARKET";

export type CampusUnitId =
  // Sector: Corporate / Management
  | "CENTRAL_CORPORATE_HQ"
  // Sector: Engineering / Product Development
  | "POWERTRAIN_EV_HQ"
  | "AERO_HQ"
  | "VEHICLE_DESIGN_HQ"
  | "CHASSIS_DYNAMICS_HQ"
  | "INTERIOR_HQ"
  | "TESTING_VALIDATION_HQ"
  // Sector: Motorsport / Commercial
  | "MOTORSPORT_HQ"
  | "COMMERCIAL_VEHICLES_HQ"
  // Sector: Manufacturing / Supply Chain
  | "FACTORY"
  | "SUPPLIER_PROCUREMENT_HQ"
  | "QUALITY_RELIABILITY_HQ"
  | "SAFETY_HQ"
  // Sector: Commercial
  | "MARKETING_SALES_HQ";

export type CampusUnitKey =
  | "UNIT_01"
  | "UNIT_02"
  | "UNIT_03"
  | "UNIT_04"
  | "UNIT_05"
  | "UNIT_06"
  | "UNIT_07"
  | "UNIT_08"
  | "UNIT_09"
  | "UNIT_10"
  | "UNIT_11"
  | "UNIT_12"
  | "UNIT_13"
  | "UNIT_14";

export type CampusZone =
  | "ZONE_A" // Logistics & Production (UNIT_10, UNIT_11)
  | "ZONE_B" // Engineering & Validation (UNIT_02, UNIT_05, UNIT_06, UNIT_07)
  | "ZONE_C" // Core Styling & Corporate (UNIT_01, UNIT_04, UNIT_12, UNIT_14)
  | "ZONE_D"; // Special Operations & Track Perimeter (UNIT_03, UNIT_08, UNIT_09, UNIT_13)

export type FootprintClass =
  | "4x4_standard"
  | "6x6_industrial"
  | "6x8_complex"
  | "6x6_studio"
  | "4x6_standard"
  | "4x4_studio"
  | "8x8_field_rig"
  | "12x16_perimeter"
  | "8x8_heavy_bay"
  | "16x20_industrial"
  | "6x6_warehouse"
  | "6x12_linear_run"
  | "6x6_pavilion";

export type BuildingTier =
  | "empty_plot"          // Level 0: Unbuilt / surveyed plot
  | "office"              // Level 1: Basic office / modest workshop
  | "department"          // Level 2: Expanded team & equipment
  | "center"              // Level 3: Specialized labs & testing rigs
  | "advanced_hq"         // Level 4: Industry-leading technology
  | "world_class_hq"      // Level 5: Global benchmark campus
  | "innovation_campus"   // Level 6: Smart AI & automated hub
  | "hypermodern_campus"; // Level 7: Zero-carbon master complex

export type DepartmentType = 
  | "department"
  | "lab"
  | "workshop"
  | "facility"
  | "proving_ground"
  | "chamber"
  | "assembly_shop";

export interface CampusSubDepartment {
  id: string;
  name: string;
  type: DepartmentType;
  description: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  requiredUnitLevel: number;
  staffAssigned: number;
  maxStaff: number;
  monthlyOperatingCost: number;
  specialEquipment: string[];
  perks: string[];
}

export type UnitOperationalStatus = 
  | "operational"
  | "upgrading"
  | "locked"              // Unbuilt expansion plot in 1970
  | "outsourced"          // Factory initially
  | "under_construction";

export interface CampusMapCoordinate {
  x: number;          // 3D World X (meters)
  y: number;          // 3D World Y (elevation)
  z: number;          // 3D World Z (meters)
  rotationY: number;  // Facing angle (radians)
  footprint: {
    width: number;    // meters
    length: number;   // meters
    height: number;   // meters
  };
}

export interface PrototypeGarageSlot {
  slotId: number;     // 1 or 2 (Capacity: 2 vehicles max at startup)
  vehicleName?: string;
  activeTask?: "engine_swap" | "chassis_rigging" | "prototype_assembly" | "inspection" | "idle";
  progressPct: number;
}

export interface CampusUnitDefinition {
  id: CampusUnitId;
  unitNumber: number; // 1 to 14
  unitKey: CampusUnitKey; // UNIT_01 to UNIT_14
  name: string;
  shortName: string;
  code: string;
  sector: CampusSector;
  sectorLabel: string;
  zone: CampusZone;
  zoneLabel: string;
  footprintClass: string;
  startingState1970: string;
  gridFootprintTiles: { width: number; length: number };
  description: string;
  isFactory: boolean;
  isStarterBuilding: boolean; // True for active 1970 buildings
  isLinearCollider?: boolean; // UNIT_13: 150m crash test acceleration rail run
  isMotorsportTrackCollider?: boolean; // UNIT_08: southern perimeter circuit loop
  isOutsourceBoundary?: boolean; // UNIT_10: sits across unpaved perimeter boundary line
  tier: BuildingTier;
  level: number;
  maxLevel: number;
  status: UnitOperationalStatus;
  glbModelPath: string;             // Custom 3D asset path: /models/campus/hq_*.glb
  mapCoordinates: CampusMapCoordinate;
  staffCapacity: number;
  currentStaff: number;
  monthlyMaintenanceCost: number;
  upgradeCost: number;
  constructionUnlockCost?: number;  // Cost to construct an unbuilt plot
  sharedWithUnitId?: CampusUnitId;  // E.g. Aero HQ shared with Motorsport HQ
  sharedRelationshipNote?: string;
  subDepartments: CampusSubDepartment[];
  corePerks: string[];
  
  // Specific to Prototype Workshop (Unit 5 or dedicated)
  prototypeCapacity?: number;       // E.g. 2 vehicles at Level 1
  activePrototypes?: PrototypeGarageSlot[];
}

// ── Outsourced Manufacturing & Rival Factory Contracts ──

export interface VehicleMaterialBill {
  steelKg: number;        // e.g. 1200 kg
  aluminiumKg: number;    // e.g. 150 kg
  plasticsRubberKg: number; // e.g. 90 kg
  glassKg: number;        // e.g. 45 kg
  tyresCount: number;     // 4 or 5
  engineSupplied: boolean; // True if player ships engine from prototype garage
  electronicsUnits: number; // wiring harness & ECU count
}

export interface ContractManufacturerPartner {
  id: string;
  name: string;
  country: string;
  specialty: string;
  isCompetitorOwned: boolean;
  competitorBrandName?: string;
  conversionCostPerUnit: number; // Base machine & labor cost to stamp & assemble
  factoryProfitMarginPct: number; // 12% to 35% margin charged by factory
  logisticsFeePerUnit: number;   // Freight & transport to market
  competitorSurchargePct: number;// Extra fee if rival dislikes you
  productionCapacityAnnual: number;
  defectRate: number;            // e.g. 0.02 = 2%
  reputationRequired: number;
  leadTimeWeeks: number;
  flexibility: "low" | "medium" | "high";
  relationsScore: number;        // 0-100 (affects order priority & price gouging)
}

export type FactoryLevelTier =
  | "workshop_plant"       // Level 1: 5,000 units/year (mostly manual)
  | "small_assembly_plant" // Level 2: 15,000 units/year (semi-automated)
  | "modern_assembly_plant"// Level 3: 40,000 units/year (automated lines + logistics)
  | "large_automotive_plant"// Level 4: 100,000+ units/year (high robotics)
  | "advanced_manufacturing_campus"; // Level 5: 200,000+ units/year (Gigafactory)

export interface FactoryShopStatus {
  name: string;
  level: number;
  maxLevel: number;
  status: "active" | "offline" | "upgrading" | "not_installed";
  efficiencyPct: number;
  description: string;
  keyEquipment: string[];
}

export interface FactoryProgressionState {
  ownershipStatus: "no_factory_outsourced" | "land_acquired" | "under_construction" | "operational_owned";
  activeContractPartnerId: string;
  factoryLevel: number; // 0 (none) to 5 (advanced campus)
  factoryTier: FactoryLevelTier;
  
  // Land & Civil Construction
  landPurchased: boolean;
  landLocationName: string;
  landPurchasePrice: number;
  landAreaSqMeters: number;
  constructionProgressPct: number;
  constructionMonthsRemaining: number;
  constructionBudgetSpent: number;
  constructionTotalBudget: number;

  // Owned Factory Metrics (when operational)
  factoryName: string;
  annualCapacity: number;
  currentOutputRate: number;
  automationLevelPct: number;
  toolingFlexibilityScore: number; // 0-100

  // The core functional shops inside the manufacturing facility
  shops: {
    bodyShop: FactoryShopStatus;
    paintShop: FactoryShopStatus;
    assemblyLines: FactoryShopStatus;
    qualityInspection: FactoryShopStatus;
    warehousingLogistics: FactoryShopStatus;
    utilitiesEnergy: FactoryShopStatus;
  };
}

export interface CampusTelemetrySummary {
  totalStaffCapacity: number;
  totalCurrentStaff: number;
  totalMonthlyExpenses: number;
  operationalUnitsCount: number;
  lockedPlotsCount: number;
  rndSpeedBonusPct: number;
  stylingPrestigeBonusPct: number;
  safetyComplianceBonusPct: number;
  qualityAssuranceRating: number;
  factoryOutputCapacityYear: number;
  prototypeCapacityTotal: number;
  activePrototypesCount: number;
  // Phase 29 Extended Telemetry
  totalPlots?: number;
  unlockedPlots?: number;
  constructionInProgress?: number;
  averageBuildingLevel?: number;
  campusPrestigeScore?: number;
  monthlyConstructionBurn?: number;
  materialInventory?: Record<string, number>;
  staffUtilizationPct?: number;
  departmentCoverageScore?: number;
  // Beautification & Visual Prestige
  beautificationTier?: string;
  beautificationBudgetSpent?: number;
  beautificationBudgetTotal?: number;
  beautificationActiveAssetsCount?: number;
  beautificationHeritageAssetsCount?: number;
}

