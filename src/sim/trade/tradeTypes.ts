/**
 * ═══════════════════════════════════════════════════════════════════════
 * RAW MATERIALS, TRADE & SUPPLY CHAIN — CORE TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements the 6-Level Continuous Industrial Manufacturing Chain:
 * Level 1: Natural Resources & Extraction
 * Level 2: Refining & Processing (Mills, Smelters, Petrochemical Plants)
 * Level 3: Formed Materials (Sheet, Tubes, Extrusions, Polymers)
 * Level 4: Automotive Components (Brakes, Control Arms, Tyres, Glass, ECUs)
 * Level 5: Complex Subassemblies (Powertrain, Transaxle, Suspension, Cockpit)
 * Level 6: Vehicle Final Assembly
 */

// ── 1. LEVEL 1: PRIMARY EXTRACTION RESOURCES ─────────────────────────
export type PrimaryResourceType =
  | "IRON_ORE"
  | "BAUXITE"
  | "COPPER_ORE"
  | "SILICA_SAND"
  | "LIMESTONE"
  | "METALLURGICAL_COAL"
  | "CRUDE_OIL"
  | "NATURAL_GAS"
  | "NATURAL_RUBBER_SAP"
  | "RARE_EARTH_ORE"
  | "NICKEL_ORE"
  | "LITHIUM_BRINE"
  | "COBALT_ORE"
  | "MANGANESE_ORE"
  | "LEAD_ORE"
  | "ZINC_ORE";

// ── 2. LEVEL 2 & 3: PROCESSED & FORMED MATERIALS ─────────────────────
export type ProcessedMaterialType =
  // Ferrous Metals
  | "BASIC_CARBON_STEEL"
  | "HIGH_STRENGTH_STEEL"
  | "ADVANCED_UHSS_STEEL"
  | "DUCTILE_CAST_IRON"
  // Light Alloys
  | "ALUMINUM_SHEET_6000"
  | "ALUMINUM_FORGING_7000"
  | "MAGNESIUM_ALLOY_CAST"
  | "TITANIUM_GRADE_5"
  // Polymers & Glass
  | "ENGINEERING_POLYMERS"
  | "VULCANIZED_RUBBER"
  | "AUTOMOTIVE_FLOAT_GLASS"
  | "CARBON_FIBER_PREPREG"
  // Electrification & Electronics
  | "ELECTROLYTIC_COPPER"
  | "SEMICONDUCTOR_SILICON"
  | "BATTERY_CATHODE_NMC"
  | "BATTERY_ANODE_GRAPHITE";

// ── 3. LEVEL 4: AUTOMOTIVE COMPONENTS ────────────────────────────────
export type ComponentCategory =
  | "CHASSIS_BODY_PANELS"
  | "SUSPENSION_ARMS_SPRINGS"
  | "BRAKE_DISCS_CALIPERS"
  | "ENGINE_BLOCK_INTERNALS"
  | "TRANSMISSION_GEARS_SHAFTS"
  | "WIRING_HARNESS_ECU"
  | "TYRES_WHEELS"
  | "AUTOMOTIVE_GLASS"
  | "INTERIOR_DASH_TRIM"
  | "BATTERY_CELL_MODULES";

// ── 4. LEVEL 5: COMPLEX SUBASSEMBLIES ────────────────────────────────
export type SubassemblyType =
  | "FRONT_SUSPENSION_MODULE"
  | "REAR_SUSPENSION_MODULE"
  | "ENGINE_POWERTRAIN_ASSEMBLY"
  | "TRANSAXLE_GEARBOX_ASSEMBLY"
  | "COCKPIT_DASHBOARD_MODULE"
  | "BATTERY_HV_PACK_ASSEMBLY";

// ── 5. MATERIAL QUALITY VECTOR ───────────────────────────────────────
export interface MaterialQualityVector {
  strength: number;            // 0 - 100 (Tensile & yield strength)
  weightIndex: number;         // 0 - 100 (Lower = lighter material density)
  consistency: number;         // 0 - 100 (Microstructure uniformity; < 70 = defect risk)
  purity: number;              // 0 - 100 (Absence of chemical contaminants)
  corrosionResistance: number; // 0 - 100 (Atmospheric & salt brine resistance)
  heatResistance: number;      // 0 - 100 (Thermal endurance under stress)
  manufacturability: number;   // 0 - 100 (Stamping drawability, machinability, weldability)
}

// ── 6. INVENTORY & WAREHOUSE RECORDS ─────────────────────────────────
export type InventoryPolicyType = "JUST_IN_TIME" | "SAFETY_STOCK" | "STRATEGIC_RESERVE";

export interface WarehouseInventoryRecord {
  id: string;
  itemType: ProcessedMaterialType | ComponentCategory;
  name: string;
  level: "LEVEL_2_PROCESSED" | "LEVEL_3_FORMED" | "LEVEL_4_COMPONENT" | "LEVEL_5_SUBASSEMBLY";
  unitsOnHand: number;
  unitOfMeasure: "tonnes" | "kg" | "units";
  averageUnitCost: number;     // ₹
  qualityVector: MaterialQualityVector;
  overallQualityScore: number; // 0 - 100
  warehouseFacilityId: string;
  holdingCostMonthlyRate: number; // e.g. 0.02 (2% per month)
  reorderPoint: number;
  safetyStockTarget: number;
  storageMaxCapacity: number;
  lastStockoutMonth?: number;
}

// ── 7. NPC SUPPLIER & CONTRACT ARCHITECTURE ──────────────────────────
export type SupplierContractType = "SPOT" | "ANNUAL" | "MULTI_YEAR" | "EXCLUSIVE";
export type PaymentTermsType = "CASH_UPFRONT" | "NET_30" | "NET_90";

export interface SupplierProfile {
  id: string;
  name: string;
  tagline: string;
  country: string;
  regionCluster: string;
  tier: 1 | 2 | 3;
  specializations: (ProcessedMaterialType | ComponentCategory)[];
  technologyRating: number;      // 0 - 100
  reliabilityRating: number;     // 0 - 100
  financialHealth: "AAA" | "AA" | "A" | "BBB" | "DISTRESSED";
  baseQualityVector: MaterialQualityVector;
  minimumOrderVolume: number;
  maximumMonthlyCapacity: number;
  relationshipScore: number;     // 0 - 100
  baseLeadTimeDays: number;
  offeredPaymentTerms: PaymentTermsType[];
  exclusiveContractActive: boolean;
  description: string;
}

export interface ActiveSupplierContract {
  contractId: string;
  supplierId: string;
  supplierName: string;
  itemCategory: ProcessedMaterialType | ComponentCategory;
  itemName: string;
  contractType: SupplierContractType;
  monthlyCommittedVolume: number;
  agreedPricePerUnit: number; // ₹
  paymentTerms: PaymentTermsType;
  qualityVector: MaterialQualityVector;
  startMonth: number;
  startYear: number;
  totalDurationMonths: number;
  monthsRemaining: number;
  discountPercentage: number;
  priorityDelivery: boolean;
  penaltyClauseActive: boolean;
  fulfilledThisMonth: number;
}

// ── 8. MULTI-MODAL LOGISTICS & FREIGHT ROUTES ────────────────────────
export type FreightTransportMode = "ROAD_TRUCK" | "HEAVY_RAIL" | "MARITIME_RORO" | "AIR_EXPEDITED";

export interface LogisticsRoute {
  routeId: string;
  originRegion: string;
  destinationFacilityId: string;
  transportMode: FreightTransportMode;
  distanceKm: number;
  baseFreightCostPerTonne: number; // ₹
  transitDays: number;
  hasFactoryRailSpur: boolean;
  railDiscountPct: number;         // 60-70% freight reduction
  monthlyShipmentsInTransit: number;
}

// ── 9. B2B SALES & COMPETITOR OEM CONTRACTS ──────────────────────────
export interface B2BCustomerContract {
  contractId: string;
  npcBuyerName: string;
  buyerCountry: string;
  vehicleSegment: string;
  componentType: ComponentCategory | SubassemblyType | ProcessedMaterialType;
  componentName: string;
  monthlyUnits: number;
  pricePerUnit: number;          // ₹
  monthlyRevenue: number;        // ₹
  durationMonths: number;
  monthsRemaining: number;
  deliveredOnTimePct: number;
  competitorTechBoost: number;   // Trade-off: boosts competitor performance
}

// ── 10. SPOT COMMODITY QUOTE ─────────────────────────────────────────
export interface SpotCommodityQuote {
  type: ProcessedMaterialType;
  name: string;
  unit: "tonne" | "kg";
  spotPriceINR: number;          // ₹
  dailyChangePct: number;
  volatilityIndex: number;       // 0 - 1.0
  globalScarcity: "ABUNDANT" | "NORMAL" | "CONSTRAINED" | "CRITICAL_SHORTAGE";
  description: string;
}

// ── 11. MONTHLY SUPPLY CHAIN SUMMARY RESULT ──────────────────────────
export interface MonthlySupplyChainSummary {
  month: number;
  year: number;
  totalProcurementCost: number;  // ₹
  totalHoldingCost: number;      // ₹
  totalLogisticsFreightCost: number; // ₹
  totalB2BRevenue: number;       // ₹
  totalScrapRecycledTonnes: number;
  recyclingCostSavingsINR: number;
  inventoryAssetValueINR: number;
  stockoutsEncountered: Array<{
    itemType: string;
    shortageUnits: number;
    productionBottleneckRatePct: number;
  }>;
  alerts: Array<{
    severity: "INFO" | "WARNING" | "CRITICAL";
    title: string;
    message: string;
  }>;
}
