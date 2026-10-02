/**
 * ═══════════════════════════════════════════════════════════════════════
 * MASTER HISTORICAL ECONOMIC REGISTRY (1970 – 2026+)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements the Unified Historical Economic Calendar & Master Money-Bearing System.
 *
 * Every money-related system in the automotive enterprise connects to this
 * single master registry across 8 comprehensive tiers:
 *   1. Extraction / Primary Raw Materials (World Bank Pink Sheet / USGS / EIA)
 *   2. Processed & Formed Materials (LME Metals, Petrochemicals, Polymers)
 *   3. Manufactured Components (Cost = Raw Materials + Machining/Energy + Direct Labor + Amortization + Margin)
 *   4. Factory, Machinery & CapEx (Industrial Land, Presses, Foundries, Wind Tunnels, Utilities)
 *   5. Employees & Occupations (BLS/FRED Manufacturing Wages & ECI Payrolls)
 *   6. Logistics & Distribution (Class 8 Truck, Heavy Rail, Maritime RoRo, Air Expedite, Warehouses)
 *   7. Vehicles & Historical MSRP Benchmarks (Transportation Energy Data Book / Period Window Stickers)
 *   8. Corporate Overhead, Finance & Commercial Services (Prime Rates, Corporate Tax, Insurance, Marketing)
 *
 * Revisions occur deterministically every 6 months (1st January & 1st July).
 */

import {
  InflationIndexType,
  HistoricalInflationRecord,
  getInflationRecordForDate,
  getSemiAnnualRecord,
  SemiAnnualPeriod,
} from "./historicalInflationData";
import { ScheduledGameEvent } from "../../state/gameClockEngine";

// ─────────────────────────────────────────────────────────────────────────────
// 1. TYPE DEFINITIONS & SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export type MoneyBearingTier =
  | "TIER_1_RAW_MATERIALS"
  | "TIER_2_PROCESSED_MATERIALS"
  | "TIER_3_COMPONENTS"
  | "TIER_4_FACTORY_CAPEX"
  | "TIER_5_EMPLOYEES_PAYROLL"
  | "TIER_6_LOGISTICS_DISTRIBUTION"
  | "TIER_7_VEHICLES_MSRP"
  | "TIER_8_CORPORATE_SERVICES";

export type StorageCategory = "EASY" | "MODERATE" | "HAZARDOUS_OR_DIFFICULT" | "PERISHABLE";

export interface StorageCharacteristics {
  category: StorageCategory;
  /** Volume needed in warehouse per tonne (m³/tonne) */
  storageFootprintM3PerTonne: number;
  /** Monthly holding cost as fraction of book value (e.g. 0.015 = 1.5%/month) */
  monthlyHoldingCostRate: number;
  /** Shelf-life in months before degradation kicks in (null if indefinite like steel/copper) */
  shelfLifeMonths: number | null;
  /** Risk of quality/value degradation if held past shelf life (%/month) */
  monthlyDegradationRiskPct: number;
  /** Storage precautions description */
  storagePrecautions: string;
}

export interface MaterialRequirement {
  materialId: string;
  massKg: number;
}

export interface ComponentCostRecipe {
  /** Bill of Materials: constituent raw/processed materials and mass */
  billOfMaterials: MaterialRequirement[];
  /** Industrial electricity/fuel consumed in machining/stamping (MWh) */
  machiningEnergyMWh: number;
  /** Direct labor hours required for fabrication and subassembly */
  directLaborHours: number;
  /** Tooling and die amortization cost in base 1970 USD */
  base1970ToolingAmortizationUSD: number;
  /** Supplier margin markup fraction (e.g. 0.15 = 15% wholesale profit margin) */
  supplierMarginPct: number;
}

export interface EmployeeRoleSpec {
  department: string;
  experienceLevel: "JUNIOR" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";
  base1970MonthlyWageUSD: number;
  /** Mandatory benefits, health, social security (e.g. 1.28 = +28%) */
  fringeBenefitsMultiplier: number;
  /** Cost to recruit/onboard expressed in months of salary */
  recruitingCostMonths: number;
  /** Hourly rate contractor premium over base wage */
  contractorPremiumMultiplier: number;
}

export interface LogisticsModeSpec {
  transportMode: "ROAD_TRUCK" | "HEAVY_RAIL" | "MARITIME_RORO" | "AIR_EXPEDITE";
  base1970RateUSD: number;
  rateUnit: "PER_TON_KM" | "PER_TEU" | "PER_KG";
  averageSpeedKmH: number;
  reliabilityPct: number;
  weatherRiskPct: number;
}

export interface VehicleClassSpec {
  classId: string;
  className: string;
  base1970MSRPUSD: number;
  dealerMarginPct: number;
  warrantyReservePct: number;
  typicalAnnualProductionVolume: number;
  eraExamples: Record<string, string>;
}

export interface MasterEconomicItem {
  id: string;
  name: string;
  tier: MoneyBearingTier;
  subCategory: string;
  unit: string;
  base1970PriceUSD: number;
  primaryIndex: InflationIndexType;
  secondaryIndex?: InflationIndexType;
  description: string;

  // Optional specialized properties
  storage?: StorageCharacteristics;
  componentRecipe?: ComponentCostRecipe;
  employeeSpec?: EmployeeRoleSpec;
  logisticsSpec?: LogisticsModeSpec;
  vehicleSpec?: VehicleClassSpec;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MASTER CATALOG DATABASE (ALL 8 TIERS)
// ─────────────────────────────────────────────────────────────────────────────

export const MASTER_ECONOMIC_CATALOG: Record<string, MasterEconomicItem> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 1: EXTRACTION / PRIMARY RAW MATERIALS
  // ═══════════════════════════════════════════════════════════════════════════
  iron_ore: {
    id: "iron_ore",
    name: "Iron Ore (62% Fe Fines)",
    tier: "TIER_1_RAW_MATERIALS",
    subCategory: "Metals & Ores",
    unit: "tonne",
    base1970PriceUSD: 14.50, // World Bank historical pink sheet ($14.50/t in 1970)
    primaryIndex: "METALS_INDEX",
    description: "Crucial blast-furnace feedstock for structural automotive steel and ductile cast iron.",
    storage: {
      category: "EASY",
      storageFootprintM3PerTonne: 0.45,
      monthlyHoldingCostRate: 0.008,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Outdoor bulk yard storage; weather-impervious.",
    },
  },

  bauxite_ore: {
    id: "bauxite_ore",
    name: "Bauxite Ore (Raw Alumina Feedstock)",
    tier: "TIER_1_RAW_MATERIALS",
    subCategory: "Metals & Ores",
    unit: "tonne",
    base1970PriceUSD: 22.00,
    primaryIndex: "METALS_INDEX",
    secondaryIndex: "ENERGY_PETROCHEM_INDEX",
    description: "Raw aluminum mineral, transformed via Hall-Héroult electrolytic smelting.",
    storage: {
      category: "EASY",
      storageFootprintM3PerTonne: 0.65,
      monthlyHoldingCostRate: 0.008,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Covered dry bulk bunker.",
    },
  },

  copper_ore: {
    id: "copper_ore",
    name: "Copper Ore Concentrate",
    tier: "TIER_1_RAW_MATERIALS",
    subCategory: "Metals & Ores",
    unit: "tonne",
    base1970PriceUSD: 310.00,
    primaryIndex: "METALS_INDEX",
    description: "High-grade copper concentrate for electrolytic refining into automotive wiring harnesses and windings.",
    storage: {
      category: "EASY",
      storageFootprintM3PerTonne: 0.40,
      monthlyHoldingCostRate: 0.012,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Enclosed dry warehouse to prevent oxidation.",
    },
  },

  zinc_ore: {
    id: "zinc_ore",
    name: "Zinc Concentrate (Galvanizing Precursor)",
    tier: "TIER_1_RAW_MATERIALS",
    subCategory: "Metals & Ores",
    unit: "tonne",
    base1970PriceUSD: 165.00,
    primaryIndex: "METALS_INDEX",
    description: "Primary anti-corrosion galvanizing agent for automotive sheet steel.",
    storage: {
      category: "EASY",
      storageFootprintM3PerTonne: 0.42,
      monthlyHoldingCostRate: 0.010,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Dry bulk hopper.",
    },
  },

  nickel_ore: {
    id: "nickel_ore",
    name: "Nickel Ore Concentrate",
    tier: "TIER_1_RAW_MATERIALS",
    subCategory: "Metals & Ores",
    unit: "tonne",
    base1970PriceUSD: 420.00,
    primaryIndex: "METALS_INDEX",
    secondaryIndex: "BATTERY_MATERIALS_INDEX",
    description: "Alloying agent for stainless exhaust systems and NMC battery cathode synthesis.",
    storage: {
      category: "EASY",
      storageFootprintM3PerTonne: 0.40,
      monthlyHoldingCostRate: 0.014,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Secure locked dry warehouse.",
    },
  },

  lead_ore: {
    id: "lead_ore",
    name: "Refined Lead Ingot",
    tier: "TIER_1_RAW_MATERIALS",
    subCategory: "Metals & Ores",
    unit: "tonne",
    base1970PriceUSD: 180.00,
    primaryIndex: "METALS_INDEX",
    description: "Feedstock for standard 12V starter-lighting-ignition (SLI) lead-acid batteries.",
    storage: {
      category: "MODERATE",
      storageFootprintM3PerTonne: 0.15,
      monthlyHoldingCostRate: 0.010,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Heavy load-bearing floor required; toxic handling protocols.",
    },
  },

  crude_oil: {
    id: "crude_oil",
    name: "Crude Petroleum (WTI/Brent Benchmark)",
    tier: "TIER_1_RAW_MATERIALS",
    subCategory: "Energy & Petrochemicals",
    unit: "barrel",
    base1970PriceUSD: 3.18, // EIA official 1970 benchmark ($3.18/bbl)
    primaryIndex: "ENERGY_PETROCHEM_INDEX",
    description: "Source of vehicle gasoline, diesel, lubricants, and polymer synthesis feedstock.",
    storage: {
      category: "HAZARDOUS_OR_DIFFICULT",
      storageFootprintM3PerTonne: 1.20,
      monthlyHoldingCostRate: 0.025,
      shelfLifeMonths: 24,
      monthlyDegradationRiskPct: 0.5,
      storagePrecautions: "Bonded cylindrical liquid tank farm with secondary containment and fire suppression.",
    },
  },

  natural_gas: {
    id: "natural_gas",
    name: "Natural Gas (Henry Hub Benchmark)",
    tier: "TIER_1_RAW_MATERIALS",
    subCategory: "Energy & Petrochemicals",
    unit: "MMBtu",
    base1970PriceUSD: 0.38, // 1970 historical natural gas wellhead price
    primaryIndex: "ENERGY_PETROCHEM_INDEX",
    description: "Thermal fuel for foundry cupolas, paint curing ovens, and steam generation.",
    storage: {
      category: "HAZARDOUS_OR_DIFFICULT",
      storageFootprintM3PerTonne: 3.50,
      monthlyHoldingCostRate: 0.035,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "High-pressure cryogenic or pipeline buffer storage.",
    },
  },

  metallurgical_coal: {
    id: "metallurgical_coal",
    name: "Metallurgical Coking Coal",
    tier: "TIER_1_RAW_MATERIALS",
    subCategory: "Energy & Petrochemicals",
    unit: "tonne",
    base1970PriceUSD: 24.50,
    primaryIndex: "ENERGY_PETROCHEM_INDEX",
    description: "Carbonaceous reducing agent and thermal fuel for blast-furnace steelmaking.",
    storage: {
      category: "MODERATE",
      storageFootprintM3PerTonne: 1.10,
      monthlyHoldingCostRate: 0.010,
      shelfLifeMonths: 12,
      monthlyDegradationRiskPct: 0.2,
      storagePrecautions: "Water-sprayed outdoor stockpile to prevent spontaneous combustion.",
    },
  },

  natural_rubber_sap: {
    id: "natural_rubber_sap",
    name: "Natural Rubber Latex Sap",
    tier: "TIER_1_RAW_MATERIALS",
    subCategory: "Chemicals & Polymers",
    unit: "tonne",
    base1970PriceUSD: 360.00,
    primaryIndex: "ENERGY_PETROCHEM_INDEX",
    description: "Agricultural polymer harvested for high-elasticity tire treads and suspension bushings.",
    storage: {
      category: "PERISHABLE",
      storageFootprintM3PerTonne: 1.30,
      monthlyHoldingCostRate: 0.030,
      shelfLifeMonths: 9,
      monthlyDegradationRiskPct: 1.8,
      storagePrecautions: "Temperature-controlled vat storage; degrades rapidly if exposed to ambient UV and frost.",
    },
  },

  silica_sand: {
    id: "silica_sand",
    name: "High-Purity Industrial Silica Sand",
    tier: "TIER_1_RAW_MATERIALS",
    subCategory: "Minerals & Glass",
    unit: "tonne",
    base1970PriceUSD: 12.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Raw mineral for automotive float glass melting and sand-casting engine molds.",
    storage: {
      category: "EASY",
      storageFootprintM3PerTonne: 0.70,
      monthlyHoldingCostRate: 0.005,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Moisture-free silo.",
    },
  },

  lithium_brine: {
    id: "lithium_brine",
    name: "Lithium Carbonate Precursor",
    tier: "TIER_1_RAW_MATERIALS",
    subCategory: "Battery Minerals",
    unit: "tonne",
    base1970PriceUSD: 1400.00, // Historical industrial specialty price
    primaryIndex: "BATTERY_MATERIALS_INDEX",
    description: "Extracted brine salt required for modern high-energy traction battery cells.",
    storage: {
      category: "MODERATE",
      storageFootprintM3PerTonne: 0.90,
      monthlyHoldingCostRate: 0.020,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Hermetically sealed dry bags; prevent atmospheric moisture absorption.",
    },
  },

  cobalt_ore: {
    id: "cobalt_ore",
    name: "Cobalt Hydroxide Ore",
    tier: "TIER_1_RAW_MATERIALS",
    subCategory: "Battery Minerals",
    unit: "tonne",
    base1970PriceUSD: 3800.00,
    primaryIndex: "BATTERY_MATERIALS_INDEX",
    description: "High-stability cathode stabilizer for high-nickel lithium-ion battery chemistry.",
    storage: {
      category: "MODERATE",
      storageFootprintM3PerTonne: 0.45,
      monthlyHoldingCostRate: 0.022,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Restricted-access secure warehouse.",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 2: PROCESSED & FORMED MATERIALS (MILLS & REFINERIES)
  // ═══════════════════════════════════════════════════════════════════════════
  basic_carbon_steel: {
    id: "basic_carbon_steel",
    name: "Hot-Rolled Deep-Drawing Carbon Steel",
    tier: "TIER_2_PROCESSED_MATERIALS",
    subCategory: "Ferrous Alloys",
    unit: "tonne",
    base1970PriceUSD: 220.00, // $220/tonne in 1970
    primaryIndex: "METALS_INDEX",
    description: "Standard body-in-white stamping coils, floor pans, brackets, and chassis members.",
    storage: {
      category: "EASY",
      storageFootprintM3PerTonne: 0.35,
      monthlyHoldingCostRate: 0.012,
      shelfLifeMonths: 36,
      monthlyDegradationRiskPct: 0.1,
      storagePrecautions: "Oil-coated coils in dry indoor bay; overhead crane required.",
    },
  },

  high_strength_steel: {
    id: "high_strength_steel",
    name: "High-Strength Low-Alloy Steel (HSLA)",
    tier: "TIER_2_PROCESSED_MATERIALS",
    subCategory: "Ferrous Alloys",
    unit: "tonne",
    base1970PriceUSD: 310.00,
    primaryIndex: "METALS_INDEX",
    description: "Micro-alloyed structural steel for B-pillars, crossmembers, and suspension links.",
    storage: {
      category: "EASY",
      storageFootprintM3PerTonne: 0.35,
      monthlyHoldingCostRate: 0.012,
      shelfLifeMonths: 36,
      monthlyDegradationRiskPct: 0.1,
      storagePrecautions: "Dehumidified indoor coil racking.",
    },
  },

  ductile_cast_iron: {
    id: "ductile_cast_iron",
    name: "Ductile Nodular Cast Iron",
    tier: "TIER_2_PROCESSED_MATERIALS",
    subCategory: "Ferrous Alloys",
    unit: "tonne",
    base1970PriceUSD: 160.00,
    primaryIndex: "METALS_INDEX",
    description: "Heavy damping iron for engine cylinder blocks, crankshafts, and brake rotors.",
    storage: {
      category: "EASY",
      storageFootprintM3PerTonne: 0.30,
      monthlyHoldingCostRate: 0.010,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Palletized ingot storage.",
    },
  },

  aluminum_sheet_6000: {
    id: "aluminum_sheet_6000",
    name: "6000-Series Automotive Aluminum Sheet",
    tier: "TIER_2_PROCESSED_MATERIALS",
    subCategory: "Light Alloys",
    unit: "tonne",
    base1970PriceUSD: 780.00,
    primaryIndex: "METALS_INDEX",
    secondaryIndex: "ENERGY_PETROCHEM_INDEX",
    description: "Heat-treatable Al-Mg-Si alloy for lightweight hoods, fenders, and roof panels.",
    storage: {
      category: "EASY",
      storageFootprintM3PerTonne: 0.85,
      monthlyHoldingCostRate: 0.014,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Paper-interleaved coils in dry warehouse to prevent galvanic corrosion.",
    },
  },

  aluminum_forging_7000: {
    id: "aluminum_forging_7000",
    name: "7000-Series Forged Aluminum Billets",
    tier: "TIER_2_PROCESSED_MATERIALS",
    subCategory: "Light Alloys",
    unit: "tonne",
    base1970PriceUSD: 1100.00,
    primaryIndex: "METALS_INDEX",
    description: "Ultra-high-yield zinc-alloyed aluminum for forged wheels and suspension knuckles.",
    storage: {
      category: "EASY",
      storageFootprintM3PerTonne: 0.80,
      monthlyHoldingCostRate: 0.015,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Palletized billets.",
    },
  },

  vulcanized_rubber: {
    id: "vulcanized_rubber",
    name: "Vulcanized Synthetic Rubber Compound",
    tier: "TIER_2_PROCESSED_MATERIALS",
    subCategory: "Polymers & Elastomers",
    unit: "tonne",
    base1970PriceUSD: 480.00,
    primaryIndex: "ENERGY_PETROCHEM_INDEX",
    description: "Sulfur-cured elastomer for tire treads, engine mounts, and suspension bushings.",
    storage: {
      category: "MODERATE",
      storageFootprintM3PerTonne: 1.15,
      monthlyHoldingCostRate: 0.022,
      shelfLifeMonths: 18,
      monthlyDegradationRiskPct: 1.0,
      storagePrecautions: "Dark, climate-controlled warehouse; keep away from electric motors (ozone degradation).",
    },
  },

  automotive_float_glass: {
    id: "automotive_float_glass",
    name: "Automotive Safety Float Glass Pack",
    tier: "TIER_2_PROCESSED_MATERIALS",
    subCategory: "Glass & Ceramics",
    unit: "tonne",
    base1970PriceUSD: 190.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    secondaryIndex: "ENERGY_PETROCHEM_INDEX",
    description: "Optically flat silicate glass for laminated windshields and tempered side glazing.",
    storage: {
      category: "MODERATE",
      storageFootprintM3PerTonne: 0.95,
      monthlyHoldingCostRate: 0.016,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Vertical A-frame wooden crates; fragile shock-sensitive handling.",
    },
  },

  carbon_fiber_prepreg: {
    id: "carbon_fiber_prepreg",
    name: "Aerospace-Grade Carbon Fiber Prepreg (T300/T700)",
    tier: "TIER_2_PROCESSED_MATERIALS",
    subCategory: "Advanced Composites",
    unit: "tonne",
    base1970PriceUSD: 12000.00, // Early autoclave boutique price ($12/kg in 1970)
    primaryIndex: "COMPOSITES_INDEX",
    description: "Epoxy-impregnated unidirectional carbon weave for monocoque chassis and aerodynamic wings.",
    storage: {
      category: "HAZARDOUS_OR_DIFFICULT",
      storageFootprintM3PerTonne: 1.80,
      monthlyHoldingCostRate: 0.045,
      shelfLifeMonths: 6, // Requires -18°C freezer storage!
      monthlyDegradationRiskPct: 4.0,
      storagePrecautions: "Industrial deep-freeze vault (-18°C); room temperature out-life strictly limited to 30 days.",
    },
  },

  electrolytic_copper: {
    id: "electrolytic_copper",
    name: "Electrolytic High-Conductivity Copper Wire",
    tier: "TIER_2_PROCESSED_MATERIALS",
    subCategory: "Electrification",
    unit: "tonne",
    base1970PriceUSD: 1350.00,
    primaryIndex: "METALS_INDEX",
    description: "99.99% pure drawn copper for starter motors, alternators, and multi-conductor wire harnesses.",
    storage: {
      category: "EASY",
      storageFootprintM3PerTonne: 0.35,
      monthlyHoldingCostRate: 0.015,
      shelfLifeMonths: null,
      monthlyDegradationRiskPct: 0.0,
      storagePrecautions: "Secure spooled storage to deter theft.",
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 3: MANUFACTURED COMPONENTS (FABRICATED FROM MATERIALS + LABOR + ENERGY)
  // ═══════════════════════════════════════════════════════════════════════════
  cast_iron_engine_block: {
    id: "cast_iron_engine_block",
    name: "V8 Cast Iron Cylinder Block Assembly",
    tier: "TIER_3_COMPONENTS",
    subCategory: "Powertrain",
    unit: "unit",
    base1970PriceUSD: 85.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    secondaryIndex: "METALS_INDEX",
    description: "Precision-bored nodular iron engine block with main bearing caps and oil galleries.",
    componentRecipe: {
      billOfMaterials: [
        { materialId: "ductile_cast_iron", massKg: 95 },
        { materialId: "basic_carbon_steel", massKg: 12 },
      ],
      machiningEnergyMWh: 0.12,
      directLaborHours: 3.5,
      base1970ToolingAmortizationUSD: 15.00,
      supplierMarginPct: 0.14,
    },
  },

  forged_piston_conrod_set: {
    id: "forged_piston_conrod_set",
    name: "Forged Aluminum Piston & Steel Conrod Kit (8-Cyl)",
    tier: "TIER_3_COMPONENTS",
    subCategory: "Powertrain",
    unit: "unit",
    base1970PriceUSD: 42.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Balanced lightweight aluminum pistons with hardened steel wrist pins and forged H-beam connecting rods.",
    componentRecipe: {
      billOfMaterials: [
        { materialId: "aluminum_forging_7000", massKg: 5.5 },
        { materialId: "high_strength_steel", massKg: 6.8 },
      ],
      machiningEnergyMWh: 0.08,
      directLaborHours: 2.2,
      base1970ToolingAmortizationUSD: 8.50,
      supplierMarginPct: 0.15,
    },
  },

  ventilated_brake_rotors_set: {
    id: "ventilated_brake_rotors_set",
    name: "Front Ventilated Cast Iron Brake Discs (Pair)",
    tier: "TIER_3_COMPONENTS",
    subCategory: "Brakes & Chassis",
    unit: "unit",
    base1970PriceUSD: 24.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Directionally vaned cast iron discs optimized for thermal dissipation under heavy deceleration.",
    componentRecipe: {
      billOfMaterials: [
        { materialId: "ductile_cast_iron", massKg: 18.0 },
      ],
      machiningEnergyMWh: 0.05,
      directLaborHours: 1.1,
      base1970ToolingAmortizationUSD: 4.20,
      supplierMarginPct: 0.12,
    },
  },

  aluminum_brake_calipers_set: {
    id: "aluminum_brake_calipers_set",
    name: "4-Piston Monobloc Aluminum Brake Caliper Set",
    tier: "TIER_3_COMPONENTS",
    subCategory: "Brakes & Chassis",
    unit: "unit",
    base1970PriceUSD: 55.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Rigid CNC-machined aluminum calipers with stainless hydraulic pistons and fluid bleeders.",
    componentRecipe: {
      billOfMaterials: [
        { materialId: "aluminum_forging_7000", massKg: 6.5 },
        { materialId: "basic_carbon_steel", massKg: 1.2 },
        { materialId: "vulcanized_rubber", massKg: 0.2 },
      ],
      machiningEnergyMWh: 0.10,
      directLaborHours: 2.4,
      base1970ToolingAmortizationUSD: 11.00,
      supplierMarginPct: 0.16,
    },
  },

  manual_transmission_gearbox: {
    id: "manual_transmission_gearbox",
    name: "4-Speed Close-Ratio Synchromesh Manual Gearbox",
    tier: "TIER_3_COMPONENTS",
    subCategory: "Drivetrain",
    unit: "unit",
    base1970PriceUSD: 115.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Case-hardened helical gearsets housed in a die-cast aluminum bellhousing.",
    componentRecipe: {
      billOfMaterials: [
        { materialId: "high_strength_steel", massKg: 32.0 },
        { materialId: "aluminum_sheet_6000", massKg: 14.0 },
        { materialId: "ductile_cast_iron", massKg: 8.0 },
      ],
      machiningEnergyMWh: 0.18,
      directLaborHours: 4.8,
      base1970ToolingAmortizationUSD: 22.00,
      supplierMarginPct: 0.15,
    },
  },

  stamped_steel_door_assembly: {
    id: "stamped_steel_door_assembly",
    name: "Front Stamped Steel Door Shell & Outer Skin",
    tier: "TIER_3_COMPONENTS",
    subCategory: "Body & Exterior",
    unit: "unit",
    base1970PriceUSD: 38.00,
    primaryIndex: "METALS_INDEX",
    description: "Deep-drawn inner structure with hemmed outer sheet skin, hinge points, and side intrusion beam.",
    componentRecipe: {
      billOfMaterials: [
        { materialId: "basic_carbon_steel", massKg: 22.0 },
        { materialId: "high_strength_steel", massKg: 4.5 },
      ],
      machiningEnergyMWh: 0.04,
      directLaborHours: 1.5,
      base1970ToolingAmortizationUSD: 9.00,
      supplierMarginPct: 0.12,
    },
  },

  radial_passenger_tire: {
    id: "radial_passenger_tire",
    name: "Steel-Belted All-Season Radial Tire (15-Inch)",
    tier: "TIER_3_COMPONENTS",
    subCategory: "Wheels & Tires",
    unit: "unit",
    base1970PriceUSD: 28.00,
    primaryIndex: "ENERGY_PETROCHEM_INDEX",
    description: "Multi-ply vulcanized synthetic rubber tire with continuous steel plies and siped tread blocks.",
    componentRecipe: {
      billOfMaterials: [
        { materialId: "vulcanized_rubber", massKg: 8.5 },
        { materialId: "basic_carbon_steel", massKg: 1.8 },
      ],
      machiningEnergyMWh: 0.03,
      directLaborHours: 0.8,
      base1970ToolingAmortizationUSD: 4.50,
      supplierMarginPct: 0.14,
    },
  },

  automotive_wiring_harness: {
    id: "automotive_wiring_harness",
    name: "Chassis 12V Main Electrical Wiring Loom",
    tier: "TIER_3_COMPONENTS",
    subCategory: "Electrical",
    unit: "unit",
    base1970PriceUSD: 45.00,
    primaryIndex: "ELECTRONICS_INDEX",
    secondaryIndex: "METALS_INDEX",
    description: "Taped multi-branch wiring loom with brass terminals, blade fuses, and vinyl insulation.",
    componentRecipe: {
      billOfMaterials: [
        { materialId: "electrolytic_copper", massKg: 6.2 },
        { materialId: "vulcanized_rubber", massKg: 2.1 },
      ],
      machiningEnergyMWh: 0.02,
      directLaborHours: 3.2,
      base1970ToolingAmortizationUSD: 5.00,
      supplierMarginPct: 0.15,
    },
  },

  electronic_control_unit_ecu: {
    id: "electronic_control_unit_ecu",
    name: "Electronic Engine Control Module (ECU)",
    tier: "TIER_3_COMPONENTS",
    subCategory: "Electrical",
    unit: "unit",
    base1970PriceUSD: 140.00, // Early microprocessor / analog ignition box cost in 1970s
    primaryIndex: "ELECTRONICS_INDEX",
    description: "Aluminum-shielded microcontroller PCB executing closed-loop ignition timing and fuel metering.",
    componentRecipe: {
      billOfMaterials: [
        { materialId: "aluminum_sheet_6000", massKg: 0.8 },
        { materialId: "electrolytic_copper", massKg: 0.4 },
      ],
      machiningEnergyMWh: 0.04,
      directLaborHours: 1.8,
      base1970ToolingAmortizationUSD: 35.00,
      supplierMarginPct: 0.22,
    },
  },

  bucket_seat_assembly: {
    id: "bucket_seat_assembly",
    name: "Anatomical Foam Bucket Seat with Vinyl Upholstery",
    tier: "TIER_3_COMPONENTS",
    subCategory: "Interior",
    unit: "unit",
    base1970PriceUSD: 36.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "High-density polyurethane foam pad over stamped steel frame with recline ratchet mechanism.",
    componentRecipe: {
      billOfMaterials: [
        { materialId: "basic_carbon_steel", massKg: 11.5 },
        { materialId: "vulcanized_rubber", massKg: 4.0 },
      ],
      machiningEnergyMWh: 0.02,
      directLaborHours: 2.0,
      base1970ToolingAmortizationUSD: 6.00,
      supplierMarginPct: 0.13,
    },
  },

  laminated_windshield: {
    id: "laminated_windshield",
    name: "Curved Laminated Safety Glass Windshield",
    tier: "TIER_3_COMPONENTS",
    subCategory: "Body & Exterior",
    unit: "unit",
    base1970PriceUSD: 32.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Dual curved float glass sheets with acoustic PVB interlayer preventing shatter penetration.",
    componentRecipe: {
      billOfMaterials: [
        { materialId: "automotive_float_glass", massKg: 14.0 },
      ],
      machiningEnergyMWh: 0.06,
      directLaborHours: 1.2,
      base1970ToolingAmortizationUSD: 7.50,
      supplierMarginPct: 0.15,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 4: FACTORY, MACHINERY & CAPEX
  // ═══════════════════════════════════════════════════════════════════════════
  industrial_land_hectare: {
    id: "industrial_land_hectare",
    name: "Zoned Industrial Land Acquisition",
    tier: "TIER_4_FACTORY_CAPEX",
    subCategory: "Real Estate & Plant",
    unit: "hectare",
    base1970PriceUSD: 18500.00, // Historical 1970 industrial site average
    primaryIndex: "GENERAL_CPI",
    description: "Graded heavy-industrial parcel with railway siding clearance and municipal utility easements.",
  },

  factory_building_sqm: {
    id: "factory_building_sqm",
    name: "Heavy Manufacturing Facility Construction",
    tier: "TIER_4_FACTORY_CAPEX",
    subCategory: "Real Estate & Plant",
    unit: "m2",
    base1970PriceUSD: 85.00, // $/m² building cost in 1970
    primaryIndex: "AUTOMOTIVE_PPI",
    secondaryIndex: "METALS_INDEX",
    description: "Reinforced concrete slab, structural steel portal frames, insulated cladding, and 20t overhead crane rails.",
  },

  heavy_stamping_press_1500t: {
    id: "heavy_stamping_press_1500t",
    name: "1,500-Tonne Mechanical Transfer Stamping Press",
    tier: "TIER_4_FACTORY_CAPEX",
    subCategory: "Machinery & Tooling",
    unit: "unit",
    base1970PriceUSD: 450000.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    secondaryIndex: "METALS_INDEX",
    description: "High-speed multi-station press for stamping quarter panels, floor pans, and roof pressings.",
  },

  foundry_melting_furnace: {
    id: "foundry_melting_furnace",
    name: "Foundry Coreless Induction Melting Furnace (10-Tonne)",
    tier: "TIER_4_FACTORY_CAPEX",
    subCategory: "Machinery & Tooling",
    unit: "unit",
    base1970PriceUSD: 280000.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Medium-frequency electric induction furnace for clean gray iron and ductile alloy casting.",
  },

  cnc_5axis_machining_center: {
    id: "cnc_5axis_machining_center",
    name: "5-Axis High-Precision CNC Gantry Machining Center",
    tier: "TIER_4_FACTORY_CAPEX",
    subCategory: "Machinery & Tooling",
    unit: "unit",
    base1970PriceUSD: 185000.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Continuous 5-axis milling machine for prototype tooling, cylinder heads, and racing uprights.",
  },

  robotic_welding_cell: {
    id: "robotic_welding_cell",
    name: "Automated Body-in-White Robotic Spot Welding Cell",
    tier: "TIER_4_FACTORY_CAPEX",
    subCategory: "Automation & Robotics",
    unit: "unit",
    base1970PriceUSD: 160000.00,
    primaryIndex: "ELECTRONICS_INDEX",
    secondaryIndex: "AUTOMOTIVE_PPI",
    description: "Multi-axis servo welding cell with pneumatic weld guns and automatic tip dressers.",
  },

  cathodic_electrocoat_paint_booth: {
    id: "cathodic_electrocoat_paint_booth",
    name: "Cathodic Electro-Dip (E-Coat) & Robotic Paint Line",
    tier: "TIER_4_FACTORY_CAPEX",
    subCategory: "Finishing & Coating",
    unit: "unit",
    base1970PriceUSD: 650000.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Full-immersion anti-corrosion phosphate tank, electrodeposition dip, and downdraft robotic spray line.",
  },

  final_assembly_station: {
    id: "final_assembly_station",
    name: "Modular Final Assembly Line Workstation Conveyor",
    tier: "TIER_4_FACTORY_CAPEX",
    subCategory: "Assembly Infrastructure",
    unit: "station",
    base1970PriceUSD: 42000.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Skillet conveyor platform with pneumatic nut-runners, torque verification, and parts kitting bins.",
  },

  chassis_dynamometer_cell: {
    id: "chassis_dynamometer_cell",
    name: "4-Wheel AWD Chassis Dynamometer & Emissions Cell",
    tier: "TIER_4_FACTORY_CAPEX",
    subCategory: "Testing & Validation",
    unit: "cell",
    base1970PriceUSD: 220000.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Transient roller dyno with constant volume sampling (CVS) emissions bench and cooling wind simulation.",
  },

  wind_tunnel_facility: {
    id: "wind_tunnel_facility",
    name: "Full-Scale Automotive Aerodynamic Wind Tunnel",
    tier: "TIER_4_FACTORY_CAPEX",
    subCategory: "Testing & Validation",
    unit: "facility",
    base1970PriceUSD: 3800000.00, // Significant CapEx investment
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Closed-loop wind tunnel with rolling road boundary-layer suction and 250 km/h axial fan.",
  },

  factory_maintenance_overhaul: {
    id: "factory_maintenance_overhaul",
    name: "Monthly Plant Maintenance, Lubricants & Tooling Refurbishment",
    tier: "TIER_4_FACTORY_CAPEX",
    subCategory: "Operating Maintenance",
    unit: "month",
    base1970PriceUSD: 5200.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    secondaryIndex: "LABOR_WAGE_INDEX",
    description: "Preventative overhaul of hydraulic seals, press dies, conveyor chains, and electrical switchgear.",
  },

  industrial_electricity_mwh: {
    id: "industrial_electricity_mwh",
    name: "Industrial Grid Electricity Tariff",
    tier: "TIER_4_FACTORY_CAPEX",
    subCategory: "Utilities",
    unit: "MWh",
    base1970PriceUSD: 16.50, // EIA historical industrial electricity rate ($16.50/MWh in 1970)
    primaryIndex: "ENERGY_PETROCHEM_INDEX",
    description: "High-voltage industrial three-phase power for arc furnaces, compressor rooms, and lighting.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 5: EMPLOYEES & OCCUPATIONS (BLS/FRED WAGES & SALARIES)
  // ═══════════════════════════════════════════════════════════════════════════
  worker_assembler: {
    id: "worker_assembler",
    name: "Production Line Assembler",
    tier: "TIER_5_EMPLOYEES_PAYROLL",
    subCategory: "Manufacturing Labor",
    unit: "month",
    base1970PriceUSD: 680.00, // BLS manufacturing hourly wage ($4.10/hr * 168 hrs = ~$680/mo)
    primaryIndex: "LABOR_WAGE_INDEX",
    description: "Direct assembly operator installing powertrains, glass, interiors, and chassis components.",
    employeeSpec: {
      department: "MANUFACTURING",
      experienceLevel: "MID",
      base1970MonthlyWageUSD: 680.00,
      fringeBenefitsMultiplier: 1.28,
      recruitingCostMonths: 0.8,
      contractorPremiumMultiplier: 1.35,
    },
  },

  worker_cnc_machinist: {
    id: "worker_cnc_machinist",
    name: "Precision CNC Machinist / Toolmaker",
    tier: "TIER_5_EMPLOYEES_PAYROLL",
    subCategory: "Manufacturing Labor",
    unit: "month",
    base1970PriceUSD: 850.00,
    primaryIndex: "LABOR_WAGE_INDEX",
    description: "Skilled craftsman setting up milling cutters, reading blueprints, and machining stamping dies.",
    employeeSpec: {
      department: "MANUFACTURING",
      experienceLevel: "SENIOR",
      base1970MonthlyWageUSD: 850.00,
      fringeBenefitsMultiplier: 1.28,
      recruitingCostMonths: 1.2,
      contractorPremiumMultiplier: 1.40,
    },
  },

  worker_certified_welder: {
    id: "worker_certified_welder",
    name: "Certified TIG/MIG Structural Welder",
    tier: "TIER_5_EMPLOYEES_PAYROLL",
    subCategory: "Manufacturing Labor",
    unit: "month",
    base1970PriceUSD: 820.00,
    primaryIndex: "LABOR_WAGE_INDEX",
    description: "Specialist fabricating roll cages, tubular subframes, and prototype chassis.",
    employeeSpec: {
      department: "MANUFACTURING",
      experienceLevel: "MID",
      base1970MonthlyWageUSD: 820.00,
      fringeBenefitsMultiplier: 1.28,
      recruitingCostMonths: 1.0,
      contractorPremiumMultiplier: 1.40,
    },
  },

  engineer_cad_draftsman: {
    id: "engineer_cad_draftsman",
    name: "Junior CAD Detailer / Draftsman",
    tier: "TIER_5_EMPLOYEES_PAYROLL",
    subCategory: "Engineering Staff",
    unit: "month",
    base1970PriceUSD: 950.00,
    primaryIndex: "LABOR_WAGE_INDEX",
    description: "Drafting engineer generating packaging drawings, BOM tolerance stacks, and 3D CAD models.",
    employeeSpec: {
      department: "ENGINEERING",
      experienceLevel: "JUNIOR",
      base1970MonthlyWageUSD: 950.00,
      fringeBenefitsMultiplier: 1.30,
      recruitingCostMonths: 1.2,
      contractorPremiumMultiplier: 1.40,
    },
  },

  engineer_powertrain: {
    id: "engineer_powertrain",
    name: "Senior Powertrain Calibration Engineer",
    tier: "TIER_5_EMPLOYEES_PAYROLL",
    subCategory: "Engineering Staff",
    unit: "month",
    base1970PriceUSD: 1450.00, // BLS senior engineering benchmark ($17.4k/yr in 1970)
    primaryIndex: "LABOR_WAGE_INDEX",
    description: "Thermodynamics and engine development specialist tuning fuel maps, valvetrain, and turbochargers.",
    employeeSpec: {
      department: "ENGINEERING",
      experienceLevel: "SENIOR",
      base1970MonthlyWageUSD: 1450.00,
      fringeBenefitsMultiplier: 1.32,
      recruitingCostMonths: 2.0,
      contractorPremiumMultiplier: 1.50,
    },
  },

  engineer_chief_architect: {
    id: "engineer_chief_architect",
    name: "Chief Vehicle Technical Architect",
    tier: "TIER_5_EMPLOYEES_PAYROLL",
    subCategory: "Engineering Staff",
    unit: "month",
    base1970PriceUSD: 2400.00,
    primaryIndex: "LABOR_WAGE_INDEX",
    description: "Directs complete platform hardpoints, suspension kinematics, curb weight budget, and crash safety.",
    employeeSpec: {
      department: "ENGINEERING",
      experienceLevel: "LEAD",
      base1970MonthlyWageUSD: 2400.00,
      fringeBenefitsMultiplier: 1.35,
      recruitingCostMonths: 3.0,
      contractorPremiumMultiplier: 1.60,
    },
  },

  corp_procurement_officer: {
    id: "corp_procurement_officer",
    name: "Strategic Procurement Officer",
    tier: "TIER_5_EMPLOYEES_PAYROLL",
    subCategory: "Corporate & Finance",
    unit: "month",
    base1970PriceUSD: 1100.00,
    primaryIndex: "LABOR_WAGE_INDEX",
    description: "Negotiates bulk supply contracts, tracks LME spot indexes, and manages supplier delivery SLA compliance.",
    employeeSpec: {
      department: "MANAGEMENT",
      experienceLevel: "MID",
      base1970MonthlyWageUSD: 1100.00,
      fringeBenefitsMultiplier: 1.30,
      recruitingCostMonths: 1.5,
      contractorPremiumMultiplier: 1.35,
    },
  },

  corp_executive_ceo: {
    id: "corp_executive_ceo",
    name: "Chief Executive Officer (CEO)",
    tier: "TIER_5_EMPLOYEES_PAYROLL",
    subCategory: "Corporate & Finance",
    unit: "month",
    base1970PriceUSD: 4200.00, // $50k/yr base executive compensation in 1970
    primaryIndex: "LABOR_WAGE_INDEX",
    description: "Guides overall corporate capital allocation, global expansion, brand equity, and board governance.",
    employeeSpec: {
      department: "MANAGEMENT",
      experienceLevel: "EXECUTIVE",
      base1970MonthlyWageUSD: 4200.00,
      fringeBenefitsMultiplier: 1.40,
      recruitingCostMonths: 6.0,
      contractorPremiumMultiplier: 2.00,
    },
  },

  motorsport_race_engineer: {
    id: "motorsport_race_engineer",
    name: "Trackside Chief Race Engineer",
    tier: "TIER_5_EMPLOYEES_PAYROLL",
    subCategory: "Motorsport Division",
    unit: "month",
    base1970PriceUSD: 1350.00,
    primaryIndex: "LABOR_WAGE_INDEX",
    description: "Controls race weekend setup, tire degradation strategy, wing angles, and live telemetry analysis.",
    employeeSpec: {
      department: "MOTORSPORT",
      experienceLevel: "SENIOR",
      base1970MonthlyWageUSD: 1350.00,
      fringeBenefitsMultiplier: 1.30,
      recruitingCostMonths: 1.8,
      contractorPremiumMultiplier: 1.50,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 6: LOGISTICS & DISTRIBUTION
  // ═══════════════════════════════════════════════════════════════════════════
  freight_road_trucking: {
    id: "freight_road_trucking",
    name: "Class 8 Heavy Road Trucking Freight",
    tier: "TIER_6_LOGISTICS_DISTRIBUTION",
    subCategory: "Overland Logistics",
    unit: "ton-km",
    base1970PriceUSD: 0.045, // $0.045 per ton-km
    primaryIndex: "ENERGY_PETROCHEM_INDEX",
    secondaryIndex: "LABOR_WAGE_INDEX",
    description: "Fast, door-to-door flexible transport for stamping blanks, engines, and finished cars.",
    logisticsSpec: {
      transportMode: "ROAD_TRUCK",
      base1970RateUSD: 0.045,
      rateUnit: "PER_TON_KM",
      averageSpeedKmH: 75,
      reliabilityPct: 92,
      weatherRiskPct: 8,
    },
  },

  freight_heavy_rail: {
    id: "freight_heavy_rail",
    name: "Heavy Rail Bulk Freight Service",
    tier: "TIER_6_LOGISTICS_DISTRIBUTION",
    subCategory: "Overland Logistics",
    unit: "ton-km",
    base1970PriceUSD: 0.016, // $0.016 per ton-km (65% cheaper than road)
    primaryIndex: "ENERGY_PETROCHEM_INDEX",
    secondaryIndex: "AUTOMOTIVE_PPI",
    description: "High-tonnage rail carload service for raw steel coils, iron ore, and finished multi-level car haulers.",
    logisticsSpec: {
      transportMode: "HEAVY_RAIL",
      base1970RateUSD: 0.016,
      rateUnit: "PER_TON_KM",
      averageSpeedKmH: 45,
      reliabilityPct: 96,
      weatherRiskPct: 4,
    },
  },

  freight_maritime_roro: {
    id: "freight_maritime_roro",
    name: "Maritime RoRo (Roll-on/Roll-off) Ocean Vessel",
    tier: "TIER_6_LOGISTICS_DISTRIBUTION",
    subCategory: "Maritime Logistics",
    unit: "ton-km",
    base1970PriceUSD: 0.007,
    primaryIndex: "ENERGY_PETROCHEM_INDEX",
    description: "Dedicated multi-deck ocean vehicle carriers for intercontinental export shipments.",
    logisticsSpec: {
      transportMode: "MARITIME_RORO",
      base1970RateUSD: 0.007,
      rateUnit: "PER_TON_KM",
      averageSpeedKmH: 30,
      reliabilityPct: 88,
      weatherRiskPct: 15,
    },
  },

  freight_air_expedite: {
    id: "freight_air_expedite",
    name: "Air Expedited Urgent Cargo",
    tier: "TIER_6_LOGISTICS_DISTRIBUTION",
    subCategory: "Air Freight",
    unit: "kg",
    base1970PriceUSD: 1.85,
    primaryIndex: "ENERGY_PETROCHEM_INDEX",
    description: "Same-day/next-day air freight to resolve critical factory assembly line stockouts.",
    logisticsSpec: {
      transportMode: "AIR_EXPEDITE",
      base1970RateUSD: 1.85,
      rateUnit: "PER_KG",
      averageSpeedKmH: 750,
      reliabilityPct: 98,
      weatherRiskPct: 5,
    },
  },

  warehouse_facility_tier1: {
    id: "warehouse_facility_tier1",
    name: "Regional Distribution Warehouse (5,000 Tonnes)",
    tier: "TIER_6_LOGISTICS_DISTRIBUTION",
    subCategory: "Warehousing",
    unit: "month",
    base1970PriceUSD: 3200.00,
    primaryIndex: "GENERAL_CPI",
    description: "Insulated buffer warehouse with 6 loading docks, sprinkler system, and inventory barcode/card index tracking.",
  },

  warehouse_facility_tier3: {
    id: "warehouse_facility_tier3",
    name: "Central Logistics Hub Warehouse (25,000 Tonnes)",
    tier: "TIER_6_LOGISTICS_DISTRIBUTION",
    subCategory: "Warehousing",
    unit: "month",
    base1970PriceUSD: 11500.00,
    primaryIndex: "GENERAL_CPI",
    description: "Heavy logistics hub with integrated rail spur, automated crane storage, and 24/7 security dispatch.",
  },

  rail_spur_construction_km: {
    id: "rail_spur_construction_km",
    name: "Dedicated Plant Rail Spur & Siding Track (Per Km)",
    tier: "TIER_6_LOGISTICS_DISTRIBUTION",
    subCategory: "Infrastructure CapEx",
    unit: "km",
    base1970PriceUSD: 125000.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    secondaryIndex: "METALS_INDEX",
    description: "Direct siding track connecting factory loading bays to the national heavy rail trunk network.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 7: VEHICLES & HISTORICAL MSRP BENCHMARKS
  // ═══════════════════════════════════════════════════════════════════════════
  vehicle_subcompact_economy: {
    id: "vehicle_subcompact_economy",
    name: "Subcompact Economy Car (e.g. Pinto, Vega, Civic)",
    tier: "TIER_7_VEHICLES_MSRP",
    subCategory: "Passenger Cars",
    unit: "vehicle",
    base1970PriceUSD: 2090.00, // Contemporary 1970 base MSRP
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Affordable high-volume transport for fuel-conscious urban commuters.",
    vehicleSpec: {
      classId: "ECONOMY",
      className: "Subcompact Economy",
      base1970MSRPUSD: 2090.00,
      dealerMarginPct: 0.08,
      warrantyReservePct: 0.025,
      typicalAnnualProductionVolume: 180000,
      eraExamples: {
        "1970": "Ford Pinto / Chevrolet Vega / Honda N600",
        "1985": "Honda Civic / Ford Escort",
        "2005": "Toyota Corolla / Honda Civic",
        "2024": "Toyota Corolla Hybrid",
      },
    },
  },

  vehicle_family_sedan: {
    id: "vehicle_family_sedan",
    name: "Mid-Size Family Sedan (e.g. Maverick, Chevelle, Camry)",
    tier: "TIER_7_VEHICLES_MSRP",
    subCategory: "Passenger Cars",
    unit: "vehicle",
    base1970PriceUSD: 3250.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "The core backbone of global fleet and private automotive transportation.",
    vehicleSpec: {
      classId: "SEDAN",
      className: "Mid-Size Family Sedan",
      base1970MSRPUSD: 3250.00,
      dealerMarginPct: 0.10,
      warrantyReservePct: 0.020,
      typicalAnnualProductionVolume: 240000,
      eraExamples: {
        "1970": "Ford Maverick / Chevrolet Chevelle / Plymouth Valiant",
        "1985": "Ford Taurus / Honda Accord",
        "2005": "Toyota Camry / Volkswagen Passat",
        "2024": "Toyota Camry AWD / Accord Hybrid",
      },
    },
  },

  vehicle_sports_coupe: {
    id: "vehicle_sports_coupe",
    name: "Sports Coupe / GT (e.g. Datsun 240Z, BMW 2002, Supra)",
    tier: "TIER_7_VEHICLES_MSRP",
    subCategory: "Sports Cars",
    unit: "vehicle",
    base1970PriceUSD: 4650.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Driver-centric coupe with tuned handling, independent rear suspension, and distinct styling.",
    vehicleSpec: {
      classId: "COUPE",
      className: "Sports Coupe / GT",
      base1970MSRPUSD: 4650.00,
      dealerMarginPct: 0.12,
      warrantyReservePct: 0.030,
      typicalAnnualProductionVolume: 45000,
      eraExamples: {
        "1970": "Datsun 240Z / BMW 2002 / Alfa Romeo GTV",
        "1985": "Toyota Celica Supra / Porsche 944",
        "2005": "Nissan 350Z / BMW 330Ci",
        "2024": "Toyota GR Supra / BMW M240i",
      },
    },
  },

  vehicle_muscle_car: {
    id: "vehicle_muscle_car",
    name: "V8 American Muscle Car (e.g. Mustang Boss, Camaro SS)",
    tier: "TIER_7_VEHICLES_MSRP",
    subCategory: "Sports Cars",
    unit: "vehicle",
    base1970PriceUSD: 3650.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "High-displacement pushrod V8 power, rear-wheel drive, and iconic quarter-mile performance.",
    vehicleSpec: {
      classId: "MUSCLE",
      className: "V8 Muscle Car",
      base1970MSRPUSD: 3650.00,
      dealerMarginPct: 0.11,
      warrantyReservePct: 0.028,
      typicalAnnualProductionVolume: 80000,
      eraExamples: {
        "1970": "Ford Mustang Boss 302 / Chevy Camaro SS 396 / Dodge Challenger R/T",
        "1985": "Ford Mustang GT 5.0 / Camaro IROC-Z",
        "2005": "Ford Mustang GT / Pontiac GTO",
        "2024": "Ford Mustang Dark Horse / Dodge Challenger Hellcat",
      },
    },
  },

  vehicle_fullsize_luxury: {
    id: "vehicle_fullsize_luxury",
    name: "Executive Luxury Saloon (e.g. Mercedes 280SE, S-Class, LS400)",
    tier: "TIER_7_VEHICLES_MSRP",
    subCategory: "Luxury Vehicles",
    unit: "vehicle",
    base1970PriceUSD: 9800.00, // 1970 Mercedes 280SE MSRP
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Flagship luxury automobile with acoustic isolation, wood trim, and state-of-the-art chassis engineering.",
    vehicleSpec: {
      classId: "LUXURY",
      className: "Executive Luxury Saloon",
      base1970MSRPUSD: 9800.00,
      dealerMarginPct: 0.15,
      warrantyReservePct: 0.035,
      typicalAnnualProductionVolume: 25000,
      eraExamples: {
        "1970": "Mercedes-Benz 280SE / Cadillac DeVille / Jaguar XJ6",
        "1990": "Lexus LS400 / BMW 750iL / Mercedes 500SEL",
        "2005": "Mercedes-Benz S500 / Audi A8 / BMW 745Li",
        "2024": "Mercedes-Benz S580 / BMW 760i xDrive",
      },
    },
  },

  vehicle_exotic_supercar: {
    id: "vehicle_exotic_supercar",
    name: "Mid-Engine Exotic Supercar (e.g. Miura, Countach, F40)",
    tier: "TIER_7_VEHICLES_MSRP",
    subCategory: "Exotics & Hypercars",
    unit: "vehicle",
    base1970PriceUSD: 21500.00, // 1970 Lamborghini Miura P400S list price ($21,500)
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Limited-production high-performance masterpiece showcasing pinnacle aerodynamics and engine craftsmanship.",
    vehicleSpec: {
      classId: "SUPERCAR",
      className: "Exotic Supercar",
      base1970MSRPUSD: 21500.00,
      dealerMarginPct: 0.18,
      warrantyReservePct: 0.050,
      typicalAnnualProductionVolume: 750,
      eraExamples: {
        "1970": "Lamborghini Miura P400S / Ferrari 365 GTB/4 Daytona",
        "1987": "Ferrari F40 / Porsche 959",
        "2005": "Ferrari Enzo / Ford GT / Porsche Carrera GT",
        "2024": "Ferrari 296 GTB / McLaren 750S / Porsche 911 GT3 RS",
      },
    },
  },

  vehicle_commercial_pickup: {
    id: "vehicle_commercial_pickup",
    name: "Full-Size Light Truck / Commercial Pickup (e.g. F-100, C-10)",
    tier: "TIER_7_VEHICLES_MSRP",
    subCategory: "Light Trucks",
    unit: "vehicle",
    base1970PriceUSD: 2850.00,
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Durable body-on-frame utility workhorse with high towing and payload ratings.",
    vehicleSpec: {
      classId: "COMMERCIAL",
      className: "Light Truck & Utility",
      base1970MSRPUSD: 2850.00,
      dealerMarginPct: 0.09,
      warrantyReservePct: 0.022,
      typicalAnnualProductionVolume: 350000,
      eraExamples: {
        "1970": "Ford F-100 Ranger / Chevrolet C-10 Cheyenne",
        "1990": "Ford F-150 / Chevrolet Silverado 1500",
        "2005": "Ford F-150 SuperCrew / Dodge Ram 1500",
        "2024": "Ford F-150 EcoBoost / Chevrolet Silverado LT",
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIER 8: CORPORATE OVERHEAD, FINANCE & COMMERCIAL SERVICES
  // ═══════════════════════════════════════════════════════════════════════════
  corp_insurance_commercial: {
    id: "corp_insurance_commercial",
    name: "Commercial Comprehensive Property & Liability Insurance",
    tier: "TIER_8_CORPORATE_SERVICES",
    subCategory: "Finance & Risk",
    unit: "month",
    base1970PriceUSD: 1450.00,
    primaryIndex: "GENERAL_CPI",
    description: "Protection covering factory fire, equipment breakdown, and catastrophic industrial liability.",
  },

  corp_legal_audit_retainer: {
    id: "corp_legal_audit_retainer",
    name: "Corporate Legal Counsel & Annual Audit Retainer",
    tier: "TIER_8_CORPORATE_SERVICES",
    subCategory: "Professional Services",
    unit: "month",
    base1970PriceUSD: 1200.00,
    primaryIndex: "GENERAL_CPI",
    description: "SEC filings, trademark defense, labor arbitration, and compliance with national safety agencies.",
  },

  advertising_campaign_national_tv: {
    id: "advertising_campaign_national_tv",
    name: "National Prime-Time Television Commercial Campaign",
    tier: "TIER_8_CORPORATE_SERVICES",
    subCategory: "Marketing & PR",
    unit: "campaign",
    base1970PriceUSD: 45000.00,
    primaryIndex: "GENERAL_CPI",
    description: "High-impact 30-second network television spots driving nationwide dealership showroom traffic.",
  },

  advertising_campaign_regional_print: {
    id: "advertising_campaign_regional_print",
    name: "Regional Newspaper & Automotive Magazine Advertising",
    tier: "TIER_8_CORPORATE_SERVICES",
    subCategory: "Marketing & PR",
    unit: "month",
    base1970PriceUSD: 6500.00,
    primaryIndex: "GENERAL_CPI",
    description: "Full-page glossy spreads in Motor Trend, Car and Driver, and Sunday regional newspaper circulars.",
  },

  motorsport_title_sponsorship: {
    id: "motorsport_title_sponsorship",
    name: "Apex International Motorsport Championship Season Budget",
    tier: "TIER_8_CORPORATE_SERVICES",
    subCategory: "Motorsport & Brand",
    unit: "season",
    base1970PriceUSD: 125000.00, // 1970 Formula 1 / Can-Am budget scale
    primaryIndex: "AUTOMOTIVE_PPI",
    secondaryIndex: "LABOR_WAGE_INDEX",
    description: "Factory team operations, logistics, engines, tire contracts, and travel across international grand prix circuits.",
  },

  warranty_actuarial_reserve_rate: {
    id: "warranty_actuarial_reserve_rate",
    name: "Statutory Vehicle Warranty Actuarial Reserve Fraction",
    tier: "TIER_8_CORPORATE_SERVICES",
    subCategory: "Actuarial Reserves",
    unit: "pct_revenue",
    base1970PriceUSD: 0.025, // 2.5% of gross wholesale revenue
    primaryIndex: "AUTOMOTIVE_PPI",
    description: "Mandatory cash escrow held to reimburse dealer network warranty repairs, recalls, and lemon claims.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. MASTER CALCULATION & EVALUATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export interface ItemCostEvaluation {
  itemId: string;
  itemName: string;
  tier: MoneyBearingTier;
  unit: string;
  year: number;
  month: number;
  semiAnnualPeriod: SemiAnnualPeriod;
  effectivePriceUSD: number;
  nominalDeltaFrom1970Pct: number;
  inflationMultiplier: number;
  recipeBreakdown?: {
    rawMaterialsCostUSD: number;
    machiningEnergyCostUSD: number;
    directLaborCostUSD: number;
    toolingAmortizationUSD: number;
    subtotalDirectCostUSD: number;
    supplierMarginUSD: number;
  };
}

/**
 * Resolves the precise historical price for ANY money-bearing item in the simulator
 * at the given year and month (1970 through 2030).
 *
 * For raw materials, machinery, labor, vehicles, logistics, and services:
 *   Price(t) = Base1970Price * MacroIndex(t)
 *
 * For manufactured components:
 *   Dynamically computes the economic equation:
 *   Price(t) = (Sum(m_i * Price_i(t)) + Energy(t) + Labor(t) + Tooling(t)) * (1 + Margin)
 */
export function calculateMasterItemCost(
  itemId: string,
  year: number,
  month: number
): ItemCostEvaluation {
  const item = MASTER_ECONOMIC_CATALOG[itemId];
  if (!item) {
    throw new Error(`[MasterEconomicRegistry] Unknown economic item id: "${itemId}"`);
  }

  const record = getInflationRecordForDate(year, month);
  const period = month < 7 ? "H1_JAN" : "H2_JUL";

  // Helper to extract index value from record
  const getIndexVal = (idxType: InflationIndexType): number => {
    switch (idxType) {
      case "METALS_INDEX": return record.metalsIndex;
      case "ENERGY_PETROCHEM_INDEX": return record.energyPetrochemIndex;
      case "LABOR_WAGE_INDEX": return record.laborWageIndex;
      case "ELECTRONICS_INDEX": return record.electronicsIndex;
      case "COMPOSITES_INDEX": return record.compositesIndex;
      case "BATTERY_MATERIALS_INDEX": return record.batteryMaterialsIndex;
      case "AUTOMOTIVE_PPI": return record.automotivePPI;
      case "GENERAL_CPI":
      default:
        return record.generalCPI;
    }
  };

  // If this item is a manufactured component with a recipe, compute via constituent materials
  if (item.tier === "TIER_3_COMPONENTS" && item.componentRecipe) {
    const recipe = item.componentRecipe;

    // 1. Constituent raw material costs
    let rawMaterialsCostUSD = 0;
    for (const req of recipe.billOfMaterials) {
      const matItem = MASTER_ECONOMIC_CATALOG[req.materialId];
      if (matItem) {
        const matMultiplier = getIndexVal(matItem.primaryIndex);
        // Note: material base price is usually $/tonne; req.massKg is in kg
        const matPricePerKg = (matItem.base1970PriceUSD * matMultiplier) / 1000;
        rawMaterialsCostUSD += matPricePerKg * req.massKg;
      }
    }

    // 2. Machining & Stamping Energy Cost
    const electricityItem = MASTER_ECONOMIC_CATALOG["industrial_electricity_mwh"];
    const electricityMultiplier = getIndexVal(electricityItem.primaryIndex);
    const electricityCostPerMWh = electricityItem.base1970PriceUSD * electricityMultiplier;
    const machiningEnergyCostUSD = recipe.machiningEnergyMWh * electricityCostPerMWh;

    // 3. Direct Fabrication Labor Cost
    const laborHourlyRate = record.autoAssemblerHourlyWageUSD;
    const directLaborCostUSD = recipe.directLaborHours * laborHourlyRate;

    // 4. Tooling & Die Amortization (scales with automotive PPI)
    const toolingAmortizationUSD = recipe.base1970ToolingAmortizationUSD * record.automotivePPI;

    const subtotalDirectCostUSD =
      rawMaterialsCostUSD + machiningEnergyCostUSD + directLaborCostUSD + toolingAmortizationUSD;
    const supplierMarginUSD = subtotalDirectCostUSD * recipe.supplierMarginPct;
    const effectivePriceUSD = Number((subtotalDirectCostUSD + supplierMarginUSD).toFixed(2));

    const nominalDeltaFrom1970Pct = Number(
      (((effectivePriceUSD - item.base1970PriceUSD) / item.base1970PriceUSD) * 100).toFixed(1)
    );
    const inflationMultiplier = Number((effectivePriceUSD / item.base1970PriceUSD).toFixed(3));

    return {
      itemId: item.id,
      itemName: item.name,
      tier: item.tier,
      unit: item.unit,
      year,
      month,
      semiAnnualPeriod: period,
      effectivePriceUSD,
      nominalDeltaFrom1970Pct,
      inflationMultiplier,
      recipeBreakdown: {
        rawMaterialsCostUSD: Number(rawMaterialsCostUSD.toFixed(2)),
        machiningEnergyCostUSD: Number(machiningEnergyCostUSD.toFixed(2)),
        directLaborCostUSD: Number(directLaborCostUSD.toFixed(2)),
        toolingAmortizationUSD: Number(toolingAmortizationUSD.toFixed(2)),
        subtotalDirectCostUSD: Number(subtotalDirectCostUSD.toFixed(2)),
        supplierMarginUSD: Number(supplierMarginUSD.toFixed(2)),
      },
    };
  }

  // Non-component standard macro-index scaling
  let primaryMultiplier = getIndexVal(item.primaryIndex);
  if (item.secondaryIndex) {
    const secondaryMultiplier = getIndexVal(item.secondaryIndex);
    // Weighted blend: 70% primary, 30% secondary
    primaryMultiplier = primaryMultiplier * 0.70 + secondaryMultiplier * 0.30;
  }

  const effectivePriceUSD = Number((item.base1970PriceUSD * primaryMultiplier).toFixed(2));
  const nominalDeltaFrom1970Pct = Number(
    (((effectivePriceUSD - item.base1970PriceUSD) / item.base1970PriceUSD) * 100).toFixed(1)
  );

  return {
    itemId: item.id,
    itemName: item.name,
    tier: item.tier,
    unit: item.unit,
    year,
    month,
    semiAnnualPeriod: period,
    effectivePriceUSD,
    nominalDeltaFrom1970Pct,
    inflationMultiplier: Number(primaryMultiplier.toFixed(3)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. STRATEGIC WAREHOUSE INVENTORY VALUATION & HEDGE ADVISOR
// ─────────────────────────────────────────────────────────────────────────────

export interface WarehouseInventoryValuation {
  itemId: string;
  itemName: string;
  quantityHeld: number;
  unit: string;
  averagePurchaseCostUSD: number;
  totalBookValueUSD: number;
  currentMarketPriceUSD: number;
  totalCurrentMarketValueUSD: number;
  unrealizedInventoryGainLossUSD: number;
  unrealizedGainLossPct: number;
  monthlyHoldingCostUSD: number;
  warehouseStorageVolumeM3: number;
  degradationRiskWarning: boolean;
  strategicAdvantageDescription: string;
}

/**
 * Computes authentic inventory valuation comparing actual acquisition cost basis
 * against the current market price under the active semi-annual economic period.
 */
export function evaluateInventoryValuation(
  itemId: string,
  quantityHeld: number,
  averagePurchaseCostUSD: number,
  year: number,
  month: number
): WarehouseInventoryValuation {
  const item = MASTER_ECONOMIC_CATALOG[itemId];
  if (!item) {
    throw new Error(`[MasterEconomicRegistry] Unknown economic item id: "${itemId}"`);
  }

  const currentEval = calculateMasterItemCost(itemId, year, month);
  const currentMarketPriceUSD = currentEval.effectivePriceUSD;

  const totalBookValueUSD = Number((quantityHeld * averagePurchaseCostUSD).toFixed(2));
  const totalCurrentMarketValueUSD = Number((quantityHeld * currentMarketPriceUSD).toFixed(2));
  const unrealizedInventoryGainLossUSD = Number(
    (totalCurrentMarketValueUSD - totalBookValueUSD).toFixed(2)
  );
  const unrealizedGainLossPct = totalBookValueUSD > 0
    ? Number(((unrealizedInventoryGainLossUSD / totalBookValueUSD) * 100).toFixed(1))
    : 0;

  const storage = item.storage;
  const monthlyHoldingRate = storage?.monthlyHoldingCostRate ?? 0.015;
  const storageFootprint = storage?.storageFootprintM3PerTonne ?? 0.50;

  const monthlyHoldingCostUSD = Number((totalBookValueUSD * monthlyHoldingRate).toFixed(2));
  const warehouseStorageVolumeM3 = Number((quantityHeld * storageFootprint).toFixed(1));

  const degradationRiskWarning = storage?.category === "PERISHABLE" ||
    storage?.category === "HAZARDOUS_OR_DIFFICULT";

  let strategicAdvantageDescription = "";
  if (unrealizedInventoryGainLossUSD > 0) {
    strategicAdvantageDescription = `Strategic Hedge Active: Factory consumes stock acquired at $${averagePurchaseCostUSD}/${item.unit} vs current market spot of $${currentMarketPriceUSD}/${item.unit}, providing $${unrealizedInventoryGainLossUSD.toLocaleString()} in production cost savings.`;
  } else if (unrealizedInventoryGainLossUSD < 0) {
    strategicAdvantageDescription = `Unfavorable Inventory Exposure: Spot price decreased to $${currentMarketPriceUSD}/${item.unit} below acquisition basis of $${averagePurchaseCostUSD}/${item.unit}. Holding cost drag is $${monthlyHoldingCostUSD.toLocaleString()}/month.`;
  } else {
    strategicAdvantageDescription = `Neutral Inventory: Acquisition cost matches current market spot price.`;
  }

  return {
    itemId: item.id,
    itemName: item.name,
    quantityHeld,
    unit: item.unit,
    averagePurchaseCostUSD,
    totalBookValueUSD,
    currentMarketPriceUSD,
    totalCurrentMarketValueUSD,
    unrealizedInventoryGainLossUSD,
    unrealizedGainLossPct,
    monthlyHoldingCostUSD,
    warehouseStorageVolumeM3,
    degradationRiskWarning,
    strategicAdvantageDescription,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MASTER CALENDAR INTEGRATION: GENERATE SEMI-ANNUAL REVISION EVENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates official ScheduledGameEvent records for biannual economic revisions
 * (Jan 1 and Jul 1) as well as advance forecast bulletins (T-60 and T-30 days)
 * for seamless rendering across CalendarPage and GameClock.
 */
export function generateEconomicCalendarEvents(
  startYear: number = 1970,
  endYear: number = 2030
): ScheduledGameEvent[] {
  const events: ScheduledGameEvent[] = [];

  for (let y = startYear; y <= endYear; y++) {
    // ── H1: 1st January ──
    const h1Record = getSemiAnnualRecord(y, "H1_JAN");
    events.push({
      id: `ev_econ_rev_${y}_h1`,
      dateStr: `${y}-01-01`,
      time: "08:00",
      title: `Global Economic Revision — ${y} H1 Price Set`,
      category: "market",
      actionStage: "hq",
      description: `Biannual economic adjustment effective today: CPI ${h1Record.generalCPI.toFixed(2)}x, Steel $${h1Record.hotRolledSteelPerTonneUSD}/t, Oil $${h1Record.crudeOilPerBarrelUSD}/bbl. ${h1Record.headlineEvent}`,
      sourceSystem: "historicalEconomicCalendar",
      sourceId: `econ_${y}_h1`,
    });

    // ── H2: 1st July ──
    const h2Record = getSemiAnnualRecord(y, "H2_JUL");
    events.push({
      id: `ev_econ_rev_${y}_h2`,
      dateStr: `${y}-07-01`,
      time: "08:00",
      title: `Global Economic Revision — ${y} H2 Price Set`,
      category: "market",
      actionStage: "hq",
      description: `Mid-year economic adjustment effective today: CPI ${h2Record.generalCPI.toFixed(2)}x, Steel $${h2Record.hotRolledSteelPerTonneUSD}/t, Oil $${h2Record.crudeOilPerBarrelUSD}/bbl. ${h2Record.headlineEvent}`,
      sourceSystem: "historicalEconomicCalendar",
      sourceId: `econ_${y}_h2`,
    });

    // ── Advance Warnings for H2 Revision (May 1 & June 1) ──
    events.push({
      id: `ev_econ_warn_${y}_may`,
      dateStr: `${y}-05-01`,
      time: "09:00",
      title: `Economic Advisory: 60-Day Forward Outlook for 1 Jul ${y}`,
      category: "market",
      actionStage: "hq",
      description: `Market Intelligence Bureau releases 60-day price revision forecast. Review warehouse stockpiles and consider locking supplier contracts.`,
      sourceSystem: "historicalEconomicCalendar",
      sourceId: `econ_warn_${y}_may`,
    });

    events.push({
      id: `ev_econ_warn_${y}_jun`,
      dateStr: `${y}-06-01`,
      time: "09:00",
      title: `Urgent Market Warning: 30 Days to 1 Jul ${y} Economic Revision`,
      category: "market",
      actionStage: "hq",
      description: `Final 30-day window to execute strategic warehouse stockpiles before semi-annual spot commodity repricing.`,
      sourceSystem: "historicalEconomicCalendar",
      sourceId: `econ_warn_${y}_jun`,
    });

    // ── Advance Warnings for H1 Revision next year (Nov 1 & Dec 1) ──
    events.push({
      id: `ev_econ_warn_${y}_nov`,
      dateStr: `${y}-11-01`,
      time: "09:00",
      title: `Economic Advisory: 60-Day Forward Outlook for 1 Jan ${y + 1}`,
      category: "market",
      actionStage: "hq",
      description: `Year-end market outlook published. Evaluate raw material inventory requirements for Q1/Q2 production ramp.`,
      sourceSystem: "historicalEconomicCalendar",
      sourceId: `econ_warn_${y}_nov`,
    });

    events.push({
      id: `ev_econ_warn_${y}_dec`,
      dateStr: `${y}-12-01`,
      time: "09:00",
      title: `Urgent Market Warning: 30 Days to 1 Jan ${y + 1} Economic Revision`,
      category: "market",
      actionStage: "hq",
      description: `Annual tariff and wage revision arrives in 30 days. Stock up on steel, aluminum, and components to preserve margin stability.`,
      sourceSystem: "historicalEconomicCalendar",
      sourceId: `econ_warn_${y}_dec`,
    });
  }

  return events;
}

/**
 * Filter items by specific money-bearing tier
 */
export function getItemsByTier(tier: MoneyBearingTier): MasterEconomicItem[] {
  return Object.values(MASTER_ECONOMIC_CATALOG).filter(item => item.tier === tier);
}

/**
 * Get all available item IDs
 */
export function getAllEconomicItemIds(): string[] {
  return Object.keys(MASTER_ECONOMIC_CATALOG);
}
