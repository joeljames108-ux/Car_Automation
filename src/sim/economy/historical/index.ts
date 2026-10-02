/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HISTORICAL ECONOMIC DATABASE & MARKET DYNAMICS SYSTEM (1970 – 2026)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Master barrel export providing unified access to all 13 phases of the
 * historically-grounded economic engine for the Car Automation Simulator.
 */

// Core Types & Provenance
export * from "./types";

// Phase 1: Economic Calendar, BLS CPI & FRED AHEMAN Manufacturing Wages
export * from "./economicCalendar";
export * from "./cpiBackbone";
export * from "./wageBackbone";

// Phase 2: World Bank Pink Sheet Raw Commodities
export * from "./rawCommodities";

// Phase 3: EIA Energy Spot Prices & Tariffs
export * from "./energyPrices";

// Phase 4: BLS PPI Industrial Materials
export * from "./industrialMaterials";

// Phase 5: Automotive Subsystem Components & BOM Recipes
export * from "./automotiveComponents";

// Phase 6: 72-Role Corporate Salary Hierarchy
export * from "./salaryHierarchy";

// Phase 7: Manufacturing Plants, Machinery & Capital Equipment
export * from "./factoryAndMachinery";

// Phase 8: Logistics, Freight & Warehousing
export * from "./logistics";

// Phase 9: R&D, Corporate Services, Interest Rates & Marketing
export * from "./rdAndCorporate";

// Phase 10: Contemporary Vehicle MSRPs & Wholesale Margins
export * from "./historicalVehicleMSRP";

// Phase 11: Motorsport Operations Economics
export * from "./motorsportEconomics";

// Phase 12: NPC Tier-1/Tier-2 Suppliers & Competitor Intelligence
export * from "./npcSupplierEconomics";

// Phase 13: Market-Revision Engine & Stockpile Speculation System
export * from "./revisionEngine";

// Master Unified Universe Query Gateway
export * from "./masterLookup";
