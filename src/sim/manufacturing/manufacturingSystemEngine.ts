/**
 * ═══════════════════════════════════════════════════════════════════════
 * MANUFACTURING DUAL ROUTING & MULTI-CONSTRAINT SOLVER ENGINE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Implements:
 * 1. In-House Factory Production with strict multi-constraint solver:
 *    - Factory Capacity limit (plant tier, shifts, tooling lines)
 *    - Raw Materials stockpile limit (Liebig's Law of the Minimum)
 *    - Workforce availability limit (assembly workers, takt time, shifts)
 *    - Production Cost & Treasury limit (BOM + labor + overhead vs cash)
 * 2. Contract Manufacturing & Rival Factory Outsourcing:
 *    - Curated catalog of independent foundries and rival automaker plants
 *    - Real-time bidding, quoted costs, defect rates, lead times, and MOQs
 *    - Order placement with treasury cash deduction & immediate fleet delivery
 * 3. Hybrid Production Allocation (In-House baseline + Contract overflow)
 */

import { WarehouseInventoryRecord } from "../trade/tradeTypes";
import { FactoryTier, FrameMaterial, ManufacturingProcess } from "../types";

export type ProductionRoutingMode = "in_house" | "outsourced" | "hybrid";

export type ConstraintType = "CAPACITY" | "RAW_MATERIALS" | "WORKFORCE" | "FINANCES" | "NONE";

export interface MaterialRequirementDetail {
  name: string;
  itemType: string;
  requiredPerVehicle: number;
  unit: string;
  unitsOnHand: number;
  maxUnitsAchievable: number;
  isBottleneck: boolean;
  unitCostUSD: number;
}

export interface InHouseConstraintsResult {
  requestedUnits: number;
  maxFeasibleUnits: number;
  maxByCapacity: number;
  maxByMaterials: number;
  maxByWorkforce: number;
  maxByCapital: number;
  primaryBottleneck: ConstraintType;
  bottleneckTitle: string;
  bottleneckMessage: string;
  recommendedAction: string;
  materialDetails: MaterialRequirementDetail[];
  limitingMaterial: MaterialRequirementDetail | null;
  workforceDetails: {
    assemblyWorkersAvailable: number;
    requiredWorkersForBatch: number;
    hoursPerVehicle: number;
    monthlyLaborHoursAvailable: number;
    laborHoursRequired: number;
    shiftCount: number;
    utilizationPct: number;
    hourlyWageUSD: number;
    totalLaborCostUSD: number;
  };
  capacityDetails: {
    factoryTier: FactoryTier;
    annualPlantCapacity: number;
    monthlyShiftCapacity: number;
    shiftMultiplier: number;
    effectiveMonthlyCapacity: number;
    lineUtilizationPct: number;
  };
  costDetails: {
    unitBOMCostUSD: number;
    unitLaborCostUSD: number;
    unitToolingCostUSD: number;
    unitOverheadCostUSD: number;
    unitTotalCostUSD: number;
    totalBatchCostUSD: number;
    playerCashAvailable: number;
    affordableUnits: number;
    profitMarginAtTargetMSRP: number;
  };
}

export interface ContractManufacturer {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  locationCity: string;
  specialty: string;
  isRival: boolean;
  rivalBrandName?: string;
  badgeColor: string;
  accentBg: string;
  baseConversionCostUSD: number;
  contractMarginPct: number;
  rivalMarkupPct: number;
  logisticsFeeUSD: number;
  annualCapacityUnits: number;
  monthlyAvailableCapacity: number;
  defectRatePct: number;
  qualityRatingScore: number; // 0 - 100
  leadTimeDays: number;
  moqUnits: number;
  description: string;
  relationshipLore: string;
}

export interface ContractOrderQuote {
  partnerId: string;
  partnerName: string;
  units: number;
  unitBaseMaterialsUSD: number;
  unitConversionCostUSD: number;
  unitPartnerMarginUSD: number;
  unitRivalMarkupUSD: number;
  unitLogisticsUSD: number;
  totalQuotedUnitCostUSD: number;
  totalContractCostUSD: number;
  estimatedDefectUnits: number;
  guaranteedPassUnits: number;
  leadTimeDays: number;
  canAfford: boolean;
  meetsMOQ: boolean;
  withinCapacity: boolean;
  validationError?: string;
}

export interface PlacedContractOrder {
  orderId: string;
  partnerId: string;
  partnerName: string;
  vehicleModelName: string;
  unitsOrdered: number;
  unitCostUSD: number;
  totalPaidUSD: number;
  orderTimestamp: string;
  leadTimeDays: number;
  qualityScore: number;
  status: "CONFIRMED" | "IN_PRODUCTION" | "DELIVERED";
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT MANUFACTURERS & RIVAL FACTORIES REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const CONTRACT_MANUFACTURERS_CATALOG: ContractManufacturer[] = [
  {
    id: "valmet_automotive",
    name: "Valmet Automotive Foundry",
    country: "Finland",
    countryFlag: "🇫🇮",
    locationCity: "Uusikaupunki",
    specialty: "High-volume series assembly & precision unibody stamping",
    isRival: false,
    badgeColor: "text-blue-700 bg-blue-50 border-blue-200",
    accentBg: "from-blue-500/10 to-indigo-500/5",
    baseConversionCostUSD: 1850,
    contractMarginPct: 14,
    rivalMarkupPct: 0,
    logisticsFeeUSD: 450,
    annualCapacityUnits: 45000,
    monthlyAvailableCapacity: 3750,
    defectRatePct: 1.6,
    qualityRatingScore: 89,
    leadTimeDays: 21,
    moqUnits: 100,
    description: "Renowned independent contract manufacturer. Exceptional tolerance control with modular automated transfer presses.",
    relationshipLore: "Long-standing neutral contract partner. Never competes with clients and maintains strict IP confidentiality.",
  },
  {
    id: "karmann_osnabruck",
    name: "Wilhelm Karmann Coachworks",
    country: "Germany",
    countryFlag: "🇩🇪",
    locationCity: "Osnabrück",
    specialty: "Coupes, cabriolets & hand-finished bespoke coachbuilding",
    isRival: false,
    badgeColor: "text-amber-700 bg-amber-50 border-amber-200",
    accentBg: "from-amber-500/10 to-yellow-500/5",
    baseConversionCostUSD: 2650,
    contractMarginPct: 20,
    rivalMarkupPct: 0,
    logisticsFeeUSD: 520,
    annualCapacityUnits: 22000,
    monthlyAvailableCapacity: 1830,
    defectRatePct: 0.9,
    qualityRatingScore: 96,
    leadTimeDays: 32,
    moqUnits: 50,
    description: "Legendary German coachbuilder specializing in low-to-medium volume luxury variants with hand-leaded seam finishing.",
    relationshipLore: "High prestige artisan shop. Premium pricing justified by meticulous acoustic isolation and flawless panel gaps.",
  },
  {
    id: "magna_steyr",
    name: "Magna Steyr Advanced Assembly",
    country: "Austria",
    countryFlag: "🇦🇹",
    locationCity: "Graz",
    specialty: "AWD drivetrains, exotic monocoques & high-tech sports cars",
    isRival: false,
    badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    accentBg: "from-emerald-500/10 to-teal-500/5",
    baseConversionCostUSD: 2950,
    contractMarginPct: 22,
    rivalMarkupPct: 0,
    logisticsFeeUSD: 480,
    annualCapacityUnits: 38000,
    monthlyAvailableCapacity: 3160,
    defectRatePct: 0.7,
    qualityRatingScore: 98,
    leadTimeDays: 25,
    moqUnits: 75,
    description: "The gold standard of automotive contract assembly. High automation robotics, coordinate-measuring lasers, and multi-powertrain flexibility.",
    relationshipLore: "World-class independent partner trusted by hypercar and luxury marques globally.",
  },
  {
    id: "detroit_stamping",
    name: "Detroit Global Stamping & Foundry",
    country: "United States",
    countryFlag: "🇺🇸",
    locationCity: "Detroit, MI",
    specialty: "Massive scale heavy steel stamping & rapid high-capacity throughput",
    isRival: false,
    badgeColor: "text-slate-700 bg-slate-100 border-slate-300",
    accentBg: "from-slate-500/10 to-gray-500/5",
    baseConversionCostUSD: 1420,
    contractMarginPct: 12,
    rivalMarkupPct: 0,
    logisticsFeeUSD: 650,
    annualCapacityUnits: 90000,
    monthlyAvailableCapacity: 7500,
    defectRatePct: 2.6,
    qualityRatingScore: 81,
    leadTimeDays: 14,
    moqUnits: 250,
    description: "Industrial American mega-foundry designed for uncompromising volume output and ultra-fast turnarounds.",
    relationshipLore: "Economical brute force. Ideal for rapid market penetration when volume matters more than micro-tolerance perfection.",
  },
  {
    id: "nordic_rival_plant",
    name: "Nordic Motors Surplus Line (Trollhättan)",
    country: "Sweden",
    countryFlag: "🇸🇪",
    locationCity: "Trollhättan",
    specialty: "Rival factory offering idle body-in-white & assembly line slots",
    isRival: true,
    rivalBrandName: "Nordic Motors",
    badgeColor: "text-rose-700 bg-rose-50 border-rose-200",
    accentBg: "from-rose-500/10 to-red-500/5",
    baseConversionCostUSD: 1750,
    contractMarginPct: 25,
    rivalMarkupPct: 16,
    logisticsFeeUSD: 580,
    annualCapacityUnits: 25000,
    monthlyAvailableCapacity: 2080,
    defectRatePct: 1.8,
    qualityRatingScore: 86,
    leadTimeDays: 38,
    moqUnits: 100,
    description: "Surplus production capacity offered by competitor Nordic Motors during off-peak seasonal runs. High rival markups applied.",
    relationshipLore: "Caution advised: Competitor charges a 16% rival surcharge and prioritizes their own models when lines bottleneck.",
  },
  {
    id: "apex_rival_line",
    name: "Apex Motors Racing Fab (Milano)",
    country: "Italy",
    countryFlag: "🇮🇹",
    locationCity: "Milano",
    specialty: "Rival sports brand line: lightweight tubular rigging & dyno tuning",
    isRival: true,
    rivalBrandName: "Apex Motors",
    badgeColor: "text-red-700 bg-red-50 border-red-200",
    accentBg: "from-red-500/10 to-orange-500/5",
    baseConversionCostUSD: 3100,
    contractMarginPct: 28,
    rivalMarkupPct: 18,
    logisticsFeeUSD: 680,
    annualCapacityUnits: 14000,
    monthlyAvailableCapacity: 1160,
    defectRatePct: 1.1,
    qualityRatingScore: 94,
    leadTimeDays: 30,
    moqUnits: 50,
    description: "Competitor Apex Motors leases high-performance chassis jigging and engine blue-printing stalls at premium fees.",
    relationshipLore: "Rival factory with steep markup, but grants access to exotic chassis alignment and race-spec quality control.",
  },
  {
    id: "volta_rival_plant",
    name: "Volta EV Giga-Assembly (Fremont)",
    country: "United States",
    countryFlag: "🇺🇸",
    locationCity: "Fremont, CA",
    specialty: "Rival EV line: automated pack insertion & semiconductor harness lines",
    isRival: true,
    rivalBrandName: "Volta EV",
    badgeColor: "text-amber-800 bg-amber-50 border-amber-300",
    accentBg: "from-yellow-500/10 to-amber-500/5",
    baseConversionCostUSD: 2350,
    contractMarginPct: 24,
    rivalMarkupPct: 15,
    logisticsFeeUSD: 540,
    annualCapacityUnits: 36000,
    monthlyAvailableCapacity: 3000,
    defectRatePct: 1.3,
    qualityRatingScore: 92,
    leadTimeDays: 20,
    moqUnits: 100,
    description: "Rival Volta EV's high-automation facility offering microchip placement and electrical powertrain integration.",
    relationshipLore: "Competitor factory charging 15% tech surcharge, but eliminates semiconductor bottlenecks through preferential supply access.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MATERIAL CONSUMPTION MULTIPLIERS BY CHASSIS / BODY
// ─────────────────────────────────────────────────────────────────────────────

interface MaterialUsageSpec {
  steelTonnes: number;
  aluminumTonnes: number;
  castIronTonnes: number;
  tyresSets: number;
  glassSets: number;
  wiringHarnessKits: number;
}

export function computeVehicleMaterialUsage(
  frameMaterial: FrameMaterial = "steel",
  weightKg: number = 1450
): MaterialUsageSpec {
  const baseWeightTonnes = weightKg / 1000;

  switch (frameMaterial) {
    case "aluminum":
      return {
        steelTonnes: parseFloat((baseWeightTonnes * 0.18).toFixed(3)),
        aluminumTonnes: parseFloat((baseWeightTonnes * 0.58).toFixed(3)),
        castIronTonnes: 0.12,
        tyresSets: 1.0,
        glassSets: 1.0,
        wiringHarnessKits: 1.0,
      };
    case "carbon_fiber":
    case "composites":
      return {
        steelTonnes: parseFloat((baseWeightTonnes * 0.10).toFixed(3)),
        aluminumTonnes: parseFloat((baseWeightTonnes * 0.22).toFixed(3)),
        castIronTonnes: 0.08,
        tyresSets: 1.0,
        glassSets: 1.0,
        wiringHarnessKits: 1.0,
      };
    case "titanium":
    case "magnesium":
      return {
        steelTonnes: parseFloat((baseWeightTonnes * 0.25).toFixed(3)),
        aluminumTonnes: parseFloat((baseWeightTonnes * 0.35).toFixed(3)),
        castIronTonnes: 0.10,
        tyresSets: 1.0,
        glassSets: 1.0,
        wiringHarnessKits: 1.0,
      };
    case "steel":
    default:
      return {
        steelTonnes: parseFloat((baseWeightTonnes * 0.72).toFixed(3)),
        aluminumTonnes: parseFloat((baseWeightTonnes * 0.12).toFixed(3)),
        castIronTonnes: 0.18,
        tyresSets: 1.0,
        glassSets: 1.0,
        wiringHarnessKits: 1.0,
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-CONSTRAINT IN-HOUSE PRODUCTION SOLVER
// ─────────────────────────────────────────────────────────────────────────────

export interface InHouseSolverInput {
  requestedUnits: number;
  factoryTier: FactoryTier;
  shiftCount: number;
  frameMaterial: FrameMaterial;
  process: ManufacturingProcess;
  vehicleWeightKg: number;
  unitBOMCostUSD: number;
  targetMSRP: number;
  warehouseInventory: WarehouseInventoryRecord[];
  assemblyWorkersAvailable: number;
  playerCashUSD: number;
}

export function solveInHouseProductionConstraints(
  input: InHouseSolverInput
): InHouseConstraintsResult {
  const {
    requestedUnits,
    factoryTier,
    shiftCount,
    frameMaterial,
    process,
    vehicleWeightKg,
    unitBOMCostUSD,
    targetMSRP,
    warehouseInventory,
    assemblyWorkersAvailable,
    playerCashUSD,
  } = input;

  // ── 1. FACTORY CAPACITY CONSTRAINT ──
  const PLANT_ANNUAL_CAPACITIES: Record<FactoryTier, number> = {
    boutique: 500,
    small_batch: 3000,
    mid_volume: 15000,
    high_volume: 50000,
    mega: 150000,
  };
  const baseAnnual = PLANT_ANNUAL_CAPACITIES[factoryTier] || 15000;
  // Shift multipliers: 1 shift = 45% of peak, 2 shifts = 80%, 3 shifts = 100%
  const shiftMultiplier = shiftCount === 1 ? 0.45 : shiftCount === 2 ? 0.80 : 1.0;
  const effectiveAnnualCapacity = Math.round(baseAnnual * shiftMultiplier);
  const effectiveMonthlyCapacity = Math.max(1, Math.round(effectiveAnnualCapacity / 12));
  const maxByCapacity = effectiveMonthlyCapacity;

  // ── 2. RAW MATERIALS STOCKPILE CONSTRAINT (Liebig's Law of the Minimum) ──
  const usage = computeVehicleMaterialUsage(frameMaterial, vehicleWeightKg);

  const stockMap = new Map<string, number>();
  for (const item of warehouseInventory) {
    stockMap.set(item.itemType, item.unitsOnHand);
  }

  // Material unit costs for valuation
  const MATERIAL_PRICES_USD: Record<string, number> = {
    BASIC_CARBON_STEEL: 650,     // $650 / tonne
    ALUMINUM_SHEET_6000: 2400,  // $2,400 / tonne
    DUCTILE_CAST_IRON: 950,     // $950 / tonne
    TYRES_WHEELS: 320,          // $320 / set of 5
    AUTOMOTIVE_GLASS: 210,      // $210 / set
    WIRING_HARNESS_ECU: 480,    // $480 / kit
  };

  const materialSpecs: Array<{
    name: string;
    itemType: string;
    required: number;
    unit: string;
  }> = [
    { name: "Automotive Stamping Steel", itemType: "BASIC_CARBON_STEEL", required: usage.steelTonnes, unit: "tonnes" },
    { name: "Alloy 6061 Aluminum Sheet", itemType: "ALUMINUM_SHEET_6000", required: usage.aluminumTonnes, unit: "tonnes" },
    { name: "Ductile Cast Iron Blocks", itemType: "DUCTILE_CAST_IRON", required: usage.castIronTonnes, unit: "tonnes" },
    { name: "Tyre & Wheel Assemblies", itemType: "TYRES_WHEELS", required: usage.tyresSets, unit: "sets" },
    { name: "Windshield & Glazing Packs", itemType: "AUTOMOTIVE_GLASS", required: usage.glassSets, unit: "sets" },
    { name: "Wiring Harness & ECU Kits", itemType: "WIRING_HARNESS_ECU", required: usage.wiringHarnessKits, unit: "kits" },
  ];

  const materialDetails: MaterialRequirementDetail[] = materialSpecs.map((spec) => {
    const onHand = stockMap.get(spec.itemType) ?? 0;
    const maxAchievable = spec.required > 0 ? Math.floor(onHand / spec.required) : 999999;
    return {
      name: spec.name,
      itemType: spec.itemType,
      requiredPerVehicle: spec.required,
      unit: spec.unit,
      unitsOnHand: onHand,
      maxUnitsAchievable: maxAchievable,
      isBottleneck: false,
      unitCostUSD: MATERIAL_PRICES_USD[spec.itemType] || 200,
    };
  });

  // Find lowest material limit
  let lowestMatLimit = Infinity;
  let limitingMat: MaterialRequirementDetail | null = null;
  for (const m of materialDetails) {
    if (m.maxUnitsAchievable < lowestMatLimit) {
      lowestMatLimit = m.maxUnitsAchievable;
      limitingMat = m;
    }
  }
  if (limitingMat) {
    limitingMat.isBottleneck = true;
  }
  const maxByMaterials = Math.max(0, lowestMatLimit === Infinity ? 0 : lowestMatLimit);

  // ── 3. WORKFORCE AVAILABILITY CONSTRAINT ──
  // Labor hours per car based on process
  const PROCESS_HOURS: Record<ManufacturingProcess, number> = {
    hand_built: 36,
    semi_automated: 18,
    automated: 9,
    mass_production: 6,
    "3d_printed": 14,
  };
  const hoursPerVehicle = PROCESS_HOURS[process] || 18;
  const standardMonthlyHoursPerWorker = 160;
  // Shift factor for workforce
  const monthlyLaborHoursAvailable = assemblyWorkersAvailable * standardMonthlyHoursPerWorker * (shiftCount === 1 ? 1.0 : shiftCount === 2 ? 1.8 : 2.5);
  const maxByWorkforce = Math.max(0, Math.floor(monthlyLaborHoursAvailable / Math.max(1, hoursPerVehicle)));
  const hourlyWageUSD = 32; // $32/hr loaded manufacturing wage
  const unitLaborCostUSD = hoursPerVehicle * hourlyWageUSD;

  // ── 4. PRODUCTION COST & TREASURY CASH CONSTRAINT ──
  const unitToolingCostUSD = Math.round(unitBOMCostUSD * 0.12);
  const unitOverheadCostUSD = Math.round(unitBOMCostUSD * 0.08);
  const unitTotalCostUSD = unitBOMCostUSD + unitLaborCostUSD + unitToolingCostUSD + unitOverheadCostUSD;

  const toolingFixedSetupFeeUSD = 25000;
  const availableForUnitsUSD = Math.max(0, playerCashUSD - toolingFixedSetupFeeUSD);
  const maxByCapital = Math.max(0, Math.floor(availableForUnitsUSD / Math.max(1, unitTotalCostUSD)));

  // ── 5. OVERALL FEASIBLE OUTPUT & BOTTLENECK SOLVER ──
  const maxFeasibleUnits = Math.min(maxByCapacity, maxByMaterials, maxByWorkforce, maxByCapital);

  let primaryBottleneck: ConstraintType = "NONE";
  let bottleneckTitle = "Full Production Capacity Cleared";
  let bottleneckMessage = "All factory systems, material supply lines, and assembly shifts are operating within optimal operating limits.";
  let recommendedAction = "You have sufficient capacity and funding to authorize this in-house production batch.";

  if (requestedUnits > maxFeasibleUnits) {
    if (maxFeasibleUnits === maxByMaterials) {
      primaryBottleneck = "RAW_MATERIALS";
      bottleneckTitle = `Material Shortage: ${limitingMat?.name || "Raw Materials"}`;
      bottleneckMessage = `Your warehouse only has enough ${limitingMat?.name || "stock"} to assemble ${maxByMaterials.toLocaleString()} vehicles (Need ${(requestedUnits * (limitingMat?.requiredPerVehicle || 1)).toFixed(1)} ${limitingMat?.unit}, currently have ${(limitingMat?.unitsOnHand || 0).toLocaleString()} ${limitingMat?.unit}).`;
      recommendedAction = "Procure spot commodity shipments from the Trade Terminal or contract external rival foundries.";
    } else if (maxFeasibleUnits === maxByWorkforce) {
      primaryBottleneck = "WORKFORCE";
      bottleneckTitle = "Assembly Workforce Deficit";
      bottleneckMessage = `Your ${assemblyWorkersAvailable} assembly technicians can only produce ${maxByWorkforce.toLocaleString()} vehicles per month (${hoursPerVehicle} labor hours per unit required).`;
      recommendedAction = "Recruit additional assembly line personnel via HR or add a 2nd/3rd shift to increase labor capacity.";
    } else if (maxFeasibleUnits === maxByCapacity) {
      primaryBottleneck = "CAPACITY";
      bottleneckTitle = `Factory Plant Saturation (${effectiveMonthlyCapacity.toLocaleString()} units/mo)`;
      bottleneckMessage = `Your Level ${factoryTier} plant has reached its physical machine throughput ceiling. Maximum output is ${maxByCapacity.toLocaleString()} units under ${shiftCount} shift(s).`;
      recommendedAction = "Upgrade your factory plant tier in Campus Headquarters or farm out excess volume to contract foundries.";
    } else if (maxFeasibleUnits === maxByCapital) {
      primaryBottleneck = "FINANCES";
      bottleneckTitle = "Treasury Cash Depleted";
      bottleneckMessage = `Producing ${requestedUnits.toLocaleString()} units requires $${(requestedUnits * unitTotalCostUSD).toLocaleString()} in working capital, but treasury cash is $${Math.round(playerCashUSD).toLocaleString()}.`;
      recommendedAction = "Scale down the batch size, draw down corporate loans, or license intellectual property for immediate liquidity.";
    }
  }

  const laborHoursRequired = requestedUnits * hoursPerVehicle;
  const workforceUtilizationPct = monthlyLaborHoursAvailable > 0
    ? Math.min(100, Math.round((laborHoursRequired / monthlyLaborHoursAvailable) * 100))
    : 100;

  const lineUtilizationPct = maxByCapacity > 0
    ? Math.min(100, Math.round((requestedUnits / maxByCapacity) * 100))
    : 100;

  const totalBatchCostUSD = Math.round(requestedUnits * unitTotalCostUSD + (requestedUnits > 0 ? toolingFixedSetupFeeUSD : 0));
  const profitMarginAtTargetMSRP = targetMSRP > 0 ? (targetMSRP - unitTotalCostUSD) / targetMSRP : 0;

  return {
    requestedUnits,
    maxFeasibleUnits,
    maxByCapacity,
    maxByMaterials,
    maxByWorkforce,
    maxByCapital,
    primaryBottleneck,
    bottleneckTitle,
    bottleneckMessage,
    recommendedAction,
    materialDetails,
    limitingMaterial: limitingMat,
    workforceDetails: {
      assemblyWorkersAvailable,
      requiredWorkersForBatch: Math.ceil(laborHoursRequired / standardMonthlyHoursPerWorker),
      hoursPerVehicle,
      monthlyLaborHoursAvailable,
      laborHoursRequired,
      shiftCount,
      utilizationPct: workforceUtilizationPct,
      hourlyWageUSD,
      totalLaborCostUSD: requestedUnits * unitLaborCostUSD,
    },
    capacityDetails: {
      factoryTier,
      annualPlantCapacity: baseAnnual,
      monthlyShiftCapacity: effectiveMonthlyCapacity,
      shiftMultiplier,
      effectiveMonthlyCapacity,
      lineUtilizationPct,
    },
    costDetails: {
      unitBOMCostUSD,
      unitLaborCostUSD,
      unitToolingCostUSD,
      unitOverheadCostUSD,
      unitTotalCostUSD,
      totalBatchCostUSD,
      playerCashAvailable: playerCashUSD,
      affordableUnits: maxByCapital,
      profitMarginAtTargetMSRP,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTRACT ORDER QUOTE CALCULATOR
// ─────────────────────────────────────────────────────────────────────────────

export function calculateContractManufacturerQuote(
  partner: ContractManufacturer,
  units: number,
  baseMaterialsUSD: number,
  playerCashUSD: number
): ContractOrderQuote {
  const meetsMOQ = units >= partner.moqUnits;
  const withinCapacity = units <= partner.monthlyAvailableCapacity;

  // Base materials supplied or billed by contractor
  const unitBaseMaterials = baseMaterialsUSD;
  const unitConversion = partner.baseConversionCostUSD;
  const unitPartnerMargin = Math.round((unitConversion + unitBaseMaterials) * (partner.contractMarginPct / 100));
  const unitRivalMarkup = partner.isRival ? Math.round(unitConversion * (partner.rivalMarkupPct / 100)) : 0;
  const unitLogistics = partner.logisticsFeeUSD;

  const totalQuotedUnitCostUSD = unitBaseMaterials + unitConversion + unitPartnerMargin + unitRivalMarkup + unitLogistics;
  const totalContractCostUSD = Math.round(units * totalQuotedUnitCostUSD);
  const canAfford = playerCashUSD >= totalContractCostUSD;

  let validationError: string | undefined;
  if (!meetsMOQ) {
    validationError = `Minimum order quantity (MOQ) for ${partner.name} is ${partner.moqUnits.toLocaleString()} units.`;
  } else if (!withinCapacity) {
    validationError = `Order exceeds partner's monthly capacity limit of ${partner.monthlyAvailableCapacity.toLocaleString()} units.`;
  } else if (!canAfford) {
    validationError = `Insufficient treasury cash. Order requires $${totalContractCostUSD.toLocaleString()} (Cash: $${Math.round(playerCashUSD).toLocaleString()}).`;
  }

  const estimatedDefectUnits = Math.round(units * (partner.defectRatePct / 100));
  const guaranteedPassUnits = Math.max(0, units - estimatedDefectUnits);

  return {
    partnerId: partner.id,
    partnerName: partner.name,
    units,
    unitBaseMaterialsUSD: unitBaseMaterials,
    unitConversionCostUSD: unitConversion,
    unitPartnerMarginUSD: unitPartnerMargin,
    unitRivalMarkupUSD: unitRivalMarkup,
    unitLogisticsUSD: unitLogistics,
    totalQuotedUnitCostUSD,
    totalContractCostUSD,
    estimatedDefectUnits,
    guaranteedPassUnits,
    leadTimeDays: partner.leadTimeDays,
    canAfford,
    meetsMOQ,
    withinCapacity,
    validationError,
  };
}
