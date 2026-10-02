/**
 * SUPPLY CHAIN JIT, BUFFER STOCK & MACRO MATERIAL SHOCKS ENGINE (UNIT_11)
 * 
 * Simulates:
 * 1. Inventory Strategy Tradeoffs: Pure JIT vs 30-Day Lean vs 90-Day Strategic Reserve
 * 2. Sourcing Risk: Single-Source Vendor Discount vs Dual-Source Redundancy
 * 3. Historical Macro Supply Shocks (1973, 1979, 1988, 2008, 2021)
 * 4. Production Line Halts & Disruption Cost Impact on Monthly Tick
 */

export type InventoryPolicy = "pure_jit" | "lean_buffer_30" | "strategic_reserve_90";
export type SourcingStrategy = "single_source_discount" | "dual_source_hedged";

export interface MacroShockEvent {
  id: string;
  name: string;
  startYear: number;
  startMonth: number;
  durationMonths: number;
  affectedMaterial: "crude_oil_plastics" | "aluminum" | "steel" | "semiconductors" | "rubber";
  priceSurgeMultiplier: number;
  unbufferedDisruptionWeeks: number;
  description: string;
}

export interface SupplyChainConfig {
  inventoryPolicy: InventoryPolicy;
  sourcingStrategy: SourcingStrategy;
  warehouseCapacityUnits: number;
  preferredTier1PartnerCount: number;
}

export interface SupplyChainMonthlyResult {
  year: number;
  month: number;
  activeShocks: MacroShockEvent[];
  materialPriceMultiplier: number;
  monthlyHoldingCost: number;
  disruptionDowntimeDays: number;
  productionThrottlingPct: number; // 0% = full speed, 50% = half production halted
  unfulfilledUnitsCount: number;
  statusMessage: string;
}

// ─────────────────────────────────────────────────────────────
// HISTORICAL MACRO SUPPLY SHOCK TIMELINE (1970–2026)
// ─────────────────────────────────────────────────────────────

export const HISTORICAL_SUPPLY_SHOCKS: MacroShockEvent[] = [
  // 1973 OPEC Oil Embargo
  {
    id: "opec_embargo_1973",
    name: "1973 OPEC Oil Embargo & Petrochemical Surge",
    startYear: 1973,
    startMonth: 10,
    durationMonths: 6,
    affectedMaterial: "crude_oil_plastics",
    priceSurgeMultiplier: 3.8,
    unbufferedDisruptionWeeks: 8,
    description: "Oil embargo halts Middle Eastern crude exports, skyrocketing synthetic rubber and plastic interior mold costs.",
  },
  // 1979 Second Oil Crisis
  {
    id: "second_oil_crisis_1979",
    name: "1979 Iranian Revolution Energy Crisis",
    startYear: 1979,
    startMonth: 4,
    durationMonths: 8,
    affectedMaterial: "crude_oil_plastics",
    priceSurgeMultiplier: 2.2,
    unbufferedDisruptionWeeks: 5,
    description: "Iranian oil production collapse triggers global fuel rationing and freight shipping surcharges.",
  },
  // 1988 Global Aluminum Smelter Squeeze
  {
    id: "aluminum_squeeze_1988",
    name: "1988 Global Aluminum Smelting Squeeze",
    startYear: 1988,
    startMonth: 3,
    durationMonths: 5,
    affectedMaterial: "aluminum",
    priceSurgeMultiplier: 1.65,
    unbufferedDisruptionWeeks: 3,
    description: "Surging aerospace and automotive unibody demand causes global primary ingot shortages.",
  },
  // 2008 Commodity Supercycle Steel Surge
  {
    id: "steel_supercycle_2008",
    name: "2008 Hot-Rolled Coil Steel Price Shock",
    startYear: 2008,
    startMonth: 2,
    durationMonths: 7,
    affectedMaterial: "steel",
    priceSurgeMultiplier: 1.85,
    unbufferedDisruptionWeeks: 4,
    description: "Global iron ore benchmark renegotiations drive automotive stamping sheet metal prices to historic peaks.",
  },
  // 2021 Global Automotive Semiconductor Shortage
  {
    id: "semiconductor_shortage_2021",
    name: "2021 Automotive Microcontroller & ECU Shortage",
    startYear: 2021,
    startMonth: 1,
    durationMonths: 18,
    affectedMaterial: "semiconductors",
    priceSurgeMultiplier: 2.5,
    unbufferedDisruptionWeeks: 12,
    description: "Foundry capacity crunches for wafer microcontrollers leave unfinished vehicles parked on staging ramps.",
  },
];

export class MacroShockAndJITEngine {
  /**
   * Evaluates the monthly supply chain status based on inventory policy and active historical shocks
   */
  public static evaluateMonthlySupplyChain(
    year: number,
    month: number,
    plannedMonthlyOutput: number,
    config: SupplyChainConfig
  ): SupplyChainMonthlyResult {
    // 1. Identify active historical shocks
    const activeShocks = HISTORICAL_SUPPLY_SHOCKS.filter(shock => {
      const shockStartMonthIndex = shock.startYear * 12 + shock.startMonth;
      const currentMonthIndex = year * 12 + month;
      return currentMonthIndex >= shockStartMonthIndex &&
             currentMonthIndex < shockStartMonthIndex + shock.durationMonths;
    });

    // 2. Base holding cost per vehicle stored in buffer
    let bufferDays = 0;
    let unitHoldingFeePerMonth = 0;

    if (config.inventoryPolicy === "pure_jit") {
      bufferDays = 0;
      unitHoldingFeePerMonth = 0; // $0 holding fee for pure JIT
    } else if (config.inventoryPolicy === "lean_buffer_30") {
      bufferDays = 30;
      unitHoldingFeePerMonth = 14; // $14/unit/month warehouse racking & insurance
    } else {
      bufferDays = 90;
      unitHoldingFeePerMonth = 38; // $38/unit/month strategic warehouse reserve
    }

    const monthlyHoldingCost = plannedMonthlyOutput * unitHoldingFeePerMonth;

    // 3. Sourcing strategy factor
    // Single source gives 10% discount during peacetime, but has 0 dual-source redundancy
    const sourcingDiscount = config.sourcingStrategy === "single_source_discount" ? 0.90 : 1.0;
    const vulnerabilityMultiplier = config.sourcingStrategy === "single_source_discount" ? 1.4 : 0.6;

    // 4. Calculate disruption downtime & price impact
    let materialPriceMultiplier = 1.0 * sourcingDiscount;
    let disruptionDowntimeDays = 0;

    if (activeShocks.length > 0) {
      // Find worst active shock
      const worstShock = activeShocks.reduce((prev, curr) => 
        curr.priceSurgeMultiplier > prev.priceSurgeMultiplier ? curr : prev
      );

      // Buffer stock dampens price surges and absorbs downtime weeks
      const shockWeeks = worstShock.unbufferedDisruptionWeeks * vulnerabilityMultiplier;
      const bufferWeeks = bufferDays / 7;

      const unabsorbedWeeks = Math.max(0, shockWeeks - bufferWeeks);
      disruptionDowntimeDays = Math.min(26, Math.round(unabsorbedWeeks * 5)); // 5 work days/week

      if (bufferDays >= 90) {
        // Strategic reserve pre-bought materials at normal price!
        materialPriceMultiplier = 1.05;
      } else if (bufferDays >= 30) {
        // Lean buffer partially protects
        materialPriceMultiplier = 1.0 + (worstShock.priceSurgeMultiplier - 1.0) * 0.45;
      } else {
        // Pure JIT exposed to full spot-market surge
        materialPriceMultiplier = worstShock.priceSurgeMultiplier * sourcingDiscount;
      }
    }

    // 5. Production throttling based on factory working days (22 days standard month)
    const standardWorkingDays = 22;
    const effectiveWorkingDays = Math.max(0, standardWorkingDays - disruptionDowntimeDays);
    const productionThrottlingPct = Math.round((1 - (effectiveWorkingDays / standardWorkingDays)) * 100);
    const unfulfilledUnitsCount = Math.round(plannedMonthlyOutput * (productionThrottlingPct / 100));

    let statusMessage = "Supply chain running nominally with stable deliveries.";
    if (activeShocks.length > 0) {
      if (disruptionDowntimeDays > 0) {
        statusMessage = `CRITICAL SHOCK: ${activeShocks[0].name}. Assembly lines halted for ${disruptionDowntimeDays} days due to stockout!`;
      } else {
        statusMessage = `STABLE BUFFER: ${activeShocks[0].name} absorbed completely by ${bufferDays}-day parts reserve!`;
      }
    }

    return {
      year,
      month,
      activeShocks,
      materialPriceMultiplier: Math.round(materialPriceMultiplier * 100) / 100,
      monthlyHoldingCost,
      disruptionDowntimeDays,
      productionThrottlingPct,
      unfulfilledUnitsCount,
      statusMessage,
    };
  }
}
